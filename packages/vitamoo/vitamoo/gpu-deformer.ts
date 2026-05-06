// GPU compute deformation — Phase 0, Phase 1, Blend.
//
// Matches the CPU deformMesh in skeleton.ts:
//   Phase 0: each bone transforms its bound vertices by bone world transform
//   Phase 1: each bone transforms its blended vertices by bone world transform
//   Blend:   each blend binding lerps blended vertex into its target bound vertex
//
// Two dispatches per mesh: transformPass (Phase 0+1 combined, one thread per
// bone binding entry that loops over its vertex range), then blendPass (one
// thread per blend binding).

/// <reference types="@webgpu/types" />

import type { CachedMeshGpuData } from './gpu-mesh-cache.js';
import type { PipelineBuffer } from './pipeline-buffer.js';
import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';
import type { GpuUniformPool } from './gpu-buffer-pool.js';

const DEFORM_TRANSFORM_WGSL = `
// Bone transforms: flat array<f32>, 8 floats per bone (px py pz rx ry rz rw pad).
// Matches packBoneTransforms layout. Using flat reads avoids WGSL struct alignment
// issues (vec3f has alignment 16, which would give a 48-byte stride instead of
// the intended 32-byte stride from the CPU packing).
const BONE_STRIDE = 8u;

struct BoneBinding {
    boneIndex: u32,
    firstVertex: u32,
    vertexCount: u32,
    firstBlendedVertex: u32,
    blendedVertexCount: u32,
}

@group(0) @binding(0) var<storage, read> restPositions: array<f32>;
@group(0) @binding(1) var<storage, read> restNormals: array<f32>;
@group(0) @binding(2) var<storage, read> boneTransforms: array<f32>;
@group(0) @binding(3) var<storage, read> boneBindings: array<BoneBinding>;
@group(0) @binding(4) var<storage, read_write> outDeformed: array<f32>;

struct Params {
    boundVertexCount: u32,
    totalVertexCount: u32,
    boneBindingCount: u32,
    _pad: u32,
}
@group(0) @binding(5) var<uniform> params: Params;

fn readBonePos(boneIdx: u32) -> vec3f {
    let o = boneIdx * BONE_STRIDE;
    return vec3f(boneTransforms[o], boneTransforms[o + 1u], boneTransforms[o + 2u]);
}
fn readBoneRot(boneIdx: u32) -> vec4f {
    let o = boneIdx * BONE_STRIDE;
    return vec4f(boneTransforms[o + 3u], boneTransforms[o + 4u], boneTransforms[o + 5u], boneTransforms[o + 6u]);
}

fn quatRotate(q: vec4f, v: vec3f) -> vec3f {
    let qv = vec4f(v, 0.0);
    let qc = vec4f(-q.xyz, q.w);
    let t = vec4f(
        q.w * qv.x + q.y * qv.z - q.z * qv.y,
        q.w * qv.y + q.z * qv.x - q.x * qv.z,
        q.w * qv.z + q.x * qv.y - q.y * qv.x,
        -(q.x * qv.x + q.y * qv.y + q.z * qv.z),
    );
    return vec3f(
        t.w * qc.x + t.x * qc.w + t.y * qc.z - t.z * qc.y,
        t.w * qc.y + t.z * qc.x - t.x * qc.z + t.y * qc.w,
        t.w * qc.z + t.x * qc.y - t.y * qc.x + t.z * qc.w,
    );
}

fn readRestPos(vi: u32) -> vec3f {
    let o = vi * 3u;
    return vec3f(restPositions[o], restPositions[o + 1u], restPositions[o + 2u]);
}
fn readRestNorm(vi: u32) -> vec3f {
    let o = vi * 3u;
    return vec3f(restNormals[o], restNormals[o + 1u], restNormals[o + 2u]);
}
fn writeDeformed(vi: u32, pos: vec3f, norm: vec3f) {
    let o = vi * 6u;
    outDeformed[o]      = pos.x;
    outDeformed[o + 1u] = pos.y;
    outDeformed[o + 2u] = pos.z;
    outDeformed[o + 3u] = norm.x;
    outDeformed[o + 4u] = norm.y;
    outDeformed[o + 5u] = norm.z;
}

@compute @workgroup_size(64)
fn transformMain(@builtin(global_invocation_id) gid: vec3u) {
    let bbIdx = gid.x;
    if (bbIdx >= params.boneBindingCount) { return; }
    let bb = boneBindings[bbIdx];
    let bonePos = readBonePos(bb.boneIndex);
    let boneRot = readBoneRot(bb.boneIndex);

    // Phase 0: bound vertices
    for (var i = 0u; i < bb.vertexCount; i++) {
        let vi = bb.firstVertex + i;
        if (vi >= params.totalVertexCount) { break; }
        let rp = readRestPos(vi);
        let rn = readRestNorm(vi);
        let wp = bonePos + quatRotate(boneRot, rp);
        let wn = quatRotate(boneRot, rn);
        writeDeformed(vi, wp, wn);
    }

    // Phase 1: blended vertices (offset by boundVertexCount)
    for (var i = 0u; i < bb.blendedVertexCount; i++) {
        let vi = params.boundVertexCount + bb.firstBlendedVertex + i;
        if (vi >= params.totalVertexCount) { break; }
        let rp = readRestPos(vi);
        let rn = readRestNorm(vi);
        let wp = bonePos + quatRotate(boneRot, rp);
        let wn = quatRotate(boneRot, rn);
        writeDeformed(vi, wp, wn);
    }
}
`;

const DEFORM_BLEND_WGSL = `
struct BlendBinding {
    otherVertexIndex: u32,
    weight: f32,
}

@group(0) @binding(0) var<storage, read> blendBindings: array<BlendBinding>;
@group(0) @binding(1) var<storage, read_write> deformed: array<f32>;

struct Params {
    boundVertexCount: u32,
    totalVertexCount: u32,
    blendBindingCount: u32,
    _pad: u32,
}
@group(0) @binding(2) var<uniform> params: Params;

fn readDeformedPos(vi: u32) -> vec3f {
    let o = vi * 6u;
    return vec3f(deformed[o], deformed[o + 1u], deformed[o + 2u]);
}
fn readDeformedNorm(vi: u32) -> vec3f {
    let o = vi * 6u;
    return vec3f(deformed[o + 3u], deformed[o + 4u], deformed[o + 5u]);
}
fn writeDeformedPosNorm(vi: u32, pos: vec3f, norm: vec3f) {
    let o = vi * 6u;
    deformed[o]      = pos.x;
    deformed[o + 1u] = pos.y;
    deformed[o + 2u] = pos.z;
    deformed[o + 3u] = norm.x;
    deformed[o + 4u] = norm.y;
    deformed[o + 5u] = norm.z;
}

@compute @workgroup_size(64)
fn blendMain(@builtin(global_invocation_id) gid: vec3u) {
    let i = gid.x;
    if (i >= params.blendBindingCount) { return; }
    let bl = blendBindings[i];
    let w = bl.weight;
    if (w <= 0.0) { return; }

    let blendVi = params.boundVertexCount + i;
    let destVi = bl.otherVertexIndex;
    if (blendVi >= params.totalVertexCount || destVi >= params.totalVertexCount) { return; }

    let bv = readDeformedPos(blendVi);
    let bn = readDeformedNorm(blendVi);
    let dv = readDeformedPos(destVi);
    let dn = readDeformedNorm(destVi);

    var newPos: vec3f;
    var newNorm: vec3f;
    if (w >= 1.0) {
        newPos = bv;
        newNorm = bn;
    } else {
        let ow = 1.0 - w;
        newPos = ow * dv + w * bv;
        newNorm = normalize(ow * dn + w * bn);
    }
    writeDeformedPosNorm(destVi, newPos, newNorm);
}
`;

export class GpuDeformer {
    private device: GPUDevice;
    private transformPipeline: GPUComputePipeline;
    private blendPipeline: GPUComputePipeline;
    private transformBindGroupLayout: GPUBindGroupLayout;
    private blendBindGroupLayout: GPUBindGroupLayout;
    private instrumentation: GpuInstrumentationCallbacks | undefined;

    constructor(device: GPUDevice, instrumentation?: GpuInstrumentationCallbacks) {
        this.device = device;
        this.instrumentation = instrumentation;

        this.transformBindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });

        this.blendBindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });

        const transformModule = device.createShaderModule({ code: DEFORM_TRANSFORM_WGSL });
        const blendModule = device.createShaderModule({ code: DEFORM_BLEND_WGSL });

        this.transformPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [this.transformBindGroupLayout] }),
            compute: { module: transformModule, entryPoint: 'transformMain' },
        });
        this.blendPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [this.blendBindGroupLayout] }),
            compute: { module: blendModule, entryPoint: 'blendMain' },
        });
    }

    /**
     * Encode compute dispatches for deformation onto the given command encoder.
     * Call before beginning the render pass for the frame.
     */
    encode(
        encoder: GPUCommandEncoder,
        cached: CachedMeshGpuData,
        boneTransformBuffer: GPUBuffer,
        deformedOutput: GPUBuffer,
        uniformPool?: GpuUniformPool,
    ): void {
        const device = this.device;

        const makeUniform = () => uniformPool
            ? uniformPool.acquire()
            : device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

        const transformParams = makeUniform();
        const tp = new Uint32Array([cached.boundVertexCount, cached.vertexCount, cached.boneBindingCount, 0]);
        device.queue.writeBuffer(transformParams, 0, tp);

        const transformBG = device.createBindGroup({
            layout: this.transformBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: cached.restPositions } },
                { binding: 1, resource: { buffer: cached.restNormals } },
                { binding: 2, resource: { buffer: boneTransformBuffer } },
                { binding: 3, resource: { buffer: cached.boneBindings } },
                { binding: 4, resource: { buffer: deformedOutput } },
                { binding: 5, resource: { buffer: transformParams } },
            ],
        });

        const transformPass = encoder.beginComputePass();
        transformPass.setPipeline(this.transformPipeline);
        transformPass.setBindGroup(0, transformBG);
        transformPass.dispatchWorkgroups(Math.ceil(cached.boneBindingCount / 64));
        transformPass.end();

        if (cached.blendBindingCount > 0) {
            const blendParams = makeUniform();
            const bp = new Uint32Array([cached.boundVertexCount, cached.vertexCount, cached.blendBindingCount, 0]);
            device.queue.writeBuffer(blendParams, 0, bp);

            const blendBG = device.createBindGroup({
                layout: this.blendBindGroupLayout,
                entries: [
                    { binding: 0, resource: { buffer: cached.blendBindings } },
                    { binding: 1, resource: { buffer: deformedOutput } },
                    { binding: 2, resource: { buffer: blendParams } },
                ],
            });

            const blendPass = encoder.beginComputePass();
            blendPass.setPipeline(this.blendPipeline);
            blendPass.setBindGroup(0, blendBG);
            blendPass.dispatchWorkgroups(Math.ceil(cached.blendBindingCount / 64));
            blendPass.end();
        }
    }
}
