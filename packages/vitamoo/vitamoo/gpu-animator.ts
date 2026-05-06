// GPU compute animation — multi-practice compositing on the GPU.
//
// Replicates the exact data flow of the C++ vitaboy Practice system:
//
//   initPoses:          write rest poses into bone local buffer, reset priorities
//   applyPractice × N:  for each practice (priority order), blend keyframes into
//                        bone local buffer with weight, respecting canBlend/opaque/priority
//   propagateHierarchy: parent-first propagation from local to world transforms
//
// All dispatches go into one command encoder, one queue.submit. The bone local
// poses buffer is a read-write accumulator: each applyPractice dispatch reads
// the accumulated result from previous practices and blends in its contribution.

/// <reference types="@webgpu/types" />

import type { CachedSkillGpuData } from './gpu-skill-cache.js';
import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';
import type { GpuUniformPool } from './gpu-buffer-pool.js';

const PRACTICE_PARAMS_SIZE = 32;
const INIT_PARAMS_SIZE = 16;
const PROP_PARAMS_SIZE = 16;
const APPLY_WORKGROUP_SIZE = 64;
const INIT_WORKGROUP_SIZE = 64;
const PROPAGATE_WORKGROUP_SIZE = 64;

const BONE_STRIDE_CONST = `const BONE_STRIDE = 8u;
`;

const LOCAL_READ_HELPERS = `
fn readLocalPos(bi: u32) -> vec3f {
    let o = bi * BONE_STRIDE;
    return vec3f(localPoses[o], localPoses[o + 1u], localPoses[o + 2u]);
}
fn readLocalRot(bi: u32) -> vec4f {
    let o = bi * BONE_STRIDE;
    return vec4f(localPoses[o + 3u], localPoses[o + 4u], localPoses[o + 5u], localPoses[o + 6u]);
}
`;

const LOCAL_READ_WRITE_HELPERS = LOCAL_READ_HELPERS + `
fn writeLocal(bi: u32, pos: vec3f, rot: vec4f) {
    let o = bi * BONE_STRIDE;
    localPoses[o]      = pos.x;
    localPoses[o + 1u] = pos.y;
    localPoses[o + 2u] = pos.z;
    localPoses[o + 3u] = rot.x;
    localPoses[o + 4u] = rot.y;
    localPoses[o + 5u] = rot.z;
    localPoses[o + 6u] = rot.w;
    localPoses[o + 7u] = 0.0;
}
`;

const HIERARCHY_READ_HELPERS = `
fn readHierParent(bi: u32) -> i32 {
    let o = bi * 8u;
    return bitcast<i32>(hierarchy[o]);
}
fn readHierPos(bi: u32) -> vec3f {
    let o = bi * 8u;
    return vec3f(hierarchy[o + 1u], hierarchy[o + 2u], hierarchy[o + 3u]);
}
fn readHierRot(bi: u32) -> vec4f {
    let o = bi * 8u;
    return vec4f(hierarchy[o + 4u], hierarchy[o + 5u], hierarchy[o + 6u], hierarchy[o + 7u]);
}
`;

const QUAT_WGSL = `
fn quatMul(a: vec4f, b: vec4f) -> vec4f {
    return vec4f(
        a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
        a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    );
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

fn nlerp(a: vec4f, b: vec4f, t: f32) -> vec4f {
    var bb = b;
    if (dot(a, b) < 0.0) { bb = -b; }
    return normalize(mix(a, bb, t));
}
`;

const INIT_POSES_WGSL =
    QUAT_WGSL +
    BONE_STRIDE_CONST +
    LOCAL_READ_WRITE_HELPERS +
    HIERARCHY_READ_HELPERS +
    `
@group(0) @binding(0) var<storage, read> hierarchy: array<f32>;
@group(0) @binding(1) var<storage, read_write> localPoses: array<f32>;
@group(0) @binding(2) var<storage, read_write> bonePriorities: array<i32>;

struct InitParams { boneCount: u32, _pad0: u32, _pad1: u32, _pad2: u32, }
@group(0) @binding(3) var<uniform> params: InitParams;

@compute @workgroup_size(${INIT_WORKGROUP_SIZE})
fn initPosesMain(@builtin(global_invocation_id) gid: vec3u) {
    let bi = gid.x;
    if (bi >= params.boneCount) { return; }
    writeLocal(bi, readHierPos(bi), readHierRot(bi));
    bonePriorities[bi] = -10000;
}
`;

const APPLY_PRACTICE_WGSL =
    QUAT_WGSL +
    BONE_STRIDE_CONST +
    `const FLAG_STRIDE = 4u;
` +
    LOCAL_READ_WRITE_HELPERS +
    `
struct MotionMeta {
    boneIndex: u32, frames: u32,
    translationsOffset: u32, rotationsOffset: u32,
    hasTranslation: u32, hasRotation: u32,
    _pad0: u32, _pad1: u32,
}
struct PracticeParams {
    elapsed: f32, weight: f32,
    priority: i32, opaque: u32,
    motionCount: u32, boneCount: u32,
    mixRootTranslation: u32, mixRootRotation: u32,
}

@group(0) @binding(0) var<storage, read> translations: array<f32>;
@group(0) @binding(1) var<storage, read> rotations: array<f32>;
@group(0) @binding(2) var<storage, read> motionMeta: array<MotionMeta>;
@group(0) @binding(3) var<storage, read> boneFlags: array<u32>;
@group(0) @binding(4) var<storage, read_write> localPoses: array<f32>;
@group(0) @binding(5) var<storage, read_write> bonePriorities: array<i32>;
@group(0) @binding(6) var<uniform> params: PracticeParams;

fn readTrans(offset: u32) -> vec3f {
    let o = offset * 3u;
    return vec3f(translations[o], translations[o + 1u], translations[o + 2u]);
}
fn readRot(offset: u32) -> vec4f {
    let o = offset * 4u;
    return vec4f(rotations[o], rotations[o + 1u], rotations[o + 2u], rotations[o + 3u]);
}

@compute @workgroup_size(${APPLY_WORKGROUP_SIZE})
fn applyPracticeMain(@builtin(global_invocation_id) gid: vec3u) {
    let mi = gid.x;
    if (mi >= params.motionCount) { return; }
    let w = params.weight;
    if (w <= 0.0) { return; }
    let bc = params.boneCount;
    let elapsed = params.elapsed;

    let m = motionMeta[mi];
    if (m.frames == 0u || m.boneIndex >= bc) { return; }

    let bi = m.boneIndex;
    if (bonePriorities[bi] > params.priority) { return; }

    let fo = bi * FLAG_STRIDE;
    let canTranslate = boneFlags[fo];
    let canRotate = boneFlags[fo + 1u];
    let canBlend = boneFlags[fo + 2u];
    let isRoot = boneFlags[fo + 3u];

    let fFrames = f32(m.frames);
    let frameReal = max(0.0, min(fFrames - 0.001, fFrames * elapsed));
    let frame = u32(floor(frameReal));
    let tween = frameReal - f32(frame);
    var nextFrame = frame + 1u;
    if (nextFrame >= m.frames) { nextFrame = frame; }

    if (m.hasTranslation != 0u && canTranslate != 0u) {
        if (isRoot == 0u || params.mixRootTranslation != 0u) {
            let t0 = readTrans(m.translationsOffset + frame);
            let t1 = readTrans(m.translationsOffset + nextFrame);
            var t: vec3f;
            if (tween > 0.001) { t = mix(t0, t1, tween); } else { t = t0; }

            if (w >= 1.0 || canBlend == 0u) {
                writeLocal(bi, t, readLocalRot(bi));
            } else {
                let existing = readLocalPos(bi);
                let w1 = 1.0 - w;
                writeLocal(bi, t * w + existing * w1, readLocalRot(bi));
            }
        }
    }

    if (m.hasRotation != 0u && canRotate != 0u) {
        if (isRoot == 0u || params.mixRootRotation != 0u) {
            let r0 = readRot(m.rotationsOffset + frame);
            let r1 = readRot(m.rotationsOffset + nextFrame);
            var q: vec4f;
            if (tween > 0.001) { q = nlerp(r0, r1, tween); } else { q = r0; }

            if (w >= 1.0 || canBlend == 0u) {
                writeLocal(bi, readLocalPos(bi), q);
            } else {
                let existing = readLocalRot(bi);
                writeLocal(bi, readLocalPos(bi), nlerp(existing, q, w));
            }
        }
    }

    if (params.opaque != 0u) {
        bonePriorities[bi] = params.priority;
    }
}
`;

const PROPAGATE_WGSL =
    QUAT_WGSL +
    BONE_STRIDE_CONST +
    LOCAL_READ_HELPERS +
    HIERARCHY_READ_HELPERS +
    `
@group(0) @binding(0) var<storage, read> localPoses: array<f32>;
@group(0) @binding(1) var<storage, read> hierarchy: array<f32>;
@group(0) @binding(2) var<storage, read> depthOrder: array<u32>;
@group(0) @binding(3) var<storage, read> depthOffsets: array<u32>;
@group(0) @binding(4) var<storage, read_write> worldTransforms: array<f32>;

struct PropParams { boneCount: u32, depthIndex: u32, _pad0: u32, _pad1: u32, }
@group(0) @binding(5) var<uniform> params: PropParams;

fn writeWorld(bi: u32, pos: vec3f, rot: vec4f) {
    let o = bi * BONE_STRIDE;
    worldTransforms[o]      = pos.x;
    worldTransforms[o + 1u] = pos.y;
    worldTransforms[o + 2u] = pos.z;
    worldTransforms[o + 3u] = rot.x;
    worldTransforms[o + 4u] = rot.y;
    worldTransforms[o + 5u] = rot.z;
    worldTransforms[o + 6u] = rot.w;
    worldTransforms[o + 7u] = 0.0;
}
fn readWorldPos(bi: u32) -> vec3f {
    let o = bi * BONE_STRIDE;
    return vec3f(worldTransforms[o], worldTransforms[o + 1u], worldTransforms[o + 2u]);
}
fn readWorldRot(bi: u32) -> vec4f {
    let o = bi * BONE_STRIDE;
    return vec4f(worldTransforms[o + 3u], worldTransforms[o + 4u], worldTransforms[o + 5u], worldTransforms[o + 6u]);
}

@compute @workgroup_size(${PROPAGATE_WORKGROUP_SIZE})
fn propagateMain(@builtin(global_invocation_id) gid: vec3u) {
    let start = depthOffsets[params.depthIndex];
    let end = depthOffsets[params.depthIndex + 1u];
    let idx = start + gid.x;
    if (idx >= end) { return; }

    let bi = depthOrder[idx];
    if (bi >= params.boneCount) { return; }
    let pi = readHierParent(bi);
    let lp = readLocalPos(bi);
    let lr = readLocalRot(bi);

    if (pi < 0) {
        writeWorld(bi, lp, lr);
    } else {
        let pbi = u32(pi);
        writeWorld(bi, readWorldPos(pbi) + quatRotate(readWorldRot(pbi), lp), quatMul(readWorldRot(pbi), lr));
    }
}
`;

export interface PracticeGpuParams {
    elapsed: number;
    weight: number;
    priority: number;
    opaque: boolean;
    motionCount: number;
    boneCount: number;
    mixRootTranslation: boolean;
    mixRootRotation: boolean;
}

export class GpuAnimator {
    private device: GPUDevice;
    private nextBufferId = 1;
    private bufferIds = new WeakMap<GPUBuffer, number>();
    private readonly maxBindGroupCacheEntries = 4096;
    private initBindGroupCache = new Map<string, GPUBindGroup>();
    private applyBindGroupCache = new Map<string, GPUBindGroup>();
    private propagateBindGroupCache = new Map<string, GPUBindGroup>();

    private initPipeline: GPUComputePipeline;
    private initLayout: GPUBindGroupLayout;
    private applyPipeline: GPUComputePipeline;
    private applyLayout: GPUBindGroupLayout;
    private propagatePipeline: GPUComputePipeline;
    private propagateLayout: GPUBindGroupLayout;

    constructor(device: GPUDevice, _instrumentation?: GpuInstrumentationCallbacks) {
        this.device = device;

        this.initLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });
        this.initPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [this.initLayout] }),
            compute: { module: device.createShaderModule({ code: INIT_POSES_WGSL }), entryPoint: 'initPosesMain' },
        });

        this.applyLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });
        this.applyPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [this.applyLayout] }),
            compute: { module: device.createShaderModule({ code: APPLY_PRACTICE_WGSL }), entryPoint: 'applyPracticeMain' },
        });

        this.propagateLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });
        this.propagatePipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [this.propagateLayout] }),
            compute: { module: device.createShaderModule({ code: PROPAGATE_WGSL }), entryPoint: 'propagateMain' },
        });
    }

    private _bufferId(buf: GPUBuffer): number {
        const existing = this.bufferIds.get(buf);
        if (existing !== undefined) return existing;
        const id = this.nextBufferId++;
        this.bufferIds.set(buf, id);
        return id;
    }

    private _cacheBindGroup(
        cache: Map<string, GPUBindGroup>,
        key: string,
        create: () => GPUBindGroup,
    ): GPUBindGroup {
        const hit = cache.get(key);
        if (hit) return hit;
        const bg = create();
        cache.set(key, bg);
        if (cache.size > this.maxBindGroupCacheEntries) {
            // Keep cache bounded without full clears to avoid churn spikes.
            const toDrop = cache.size - this.maxBindGroupCacheEntries;
            let dropped = 0;
            for (const k of cache.keys()) {
                cache.delete(k);
                dropped++;
                if (dropped >= toDrop) break;
            }
        }
        return bg;
    }

    private _allocUniformBuffer(uniformPool?: GpuUniformPool, size = PRACTICE_PARAMS_SIZE): GPUBuffer {
        if (uniformPool) return uniformPool.acquire();
        return this.device.createBuffer({
            size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    encodeInit(
        encoder: GPUCommandEncoder,
        hierarchyBuffer: GPUBuffer,
        localPosesBuffer: GPUBuffer,
        prioritiesBuffer: GPUBuffer,
        boneCount: number,
        uniformPool?: GpuUniformPool,
    ): void {
        const device = this.device;
        const initParams = this._allocUniformBuffer(uniformPool, INIT_PARAMS_SIZE);
        const ipd = new Uint32Array([boneCount, 0, 0, 0]);
        device.queue.writeBuffer(initParams, 0, ipd);

        const initBG = uniformPool
            ? this._cacheBindGroup(
                this.initBindGroupCache,
                [
                    this._bufferId(hierarchyBuffer),
                    this._bufferId(localPosesBuffer),
                    this._bufferId(prioritiesBuffer),
                    this._bufferId(initParams),
                ].join(':'),
                () => device.createBindGroup({
                    layout: this.initLayout,
                    entries: [
                        { binding: 0, resource: { buffer: hierarchyBuffer } },
                        { binding: 1, resource: { buffer: localPosesBuffer } },
                        { binding: 2, resource: { buffer: prioritiesBuffer } },
                        { binding: 3, resource: { buffer: initParams } },
                    ],
                }),
            )
            : device.createBindGroup({
                layout: this.initLayout,
                entries: [
                    { binding: 0, resource: { buffer: hierarchyBuffer } },
                    { binding: 1, resource: { buffer: localPosesBuffer } },
                    { binding: 2, resource: { buffer: prioritiesBuffer } },
                    { binding: 3, resource: { buffer: initParams } },
                ],
            });

        const pass = encoder.beginComputePass();
        pass.setPipeline(this.initPipeline);
        pass.setBindGroup(0, initBG);
        pass.dispatchWorkgroups(Math.max(1, Math.ceil(boneCount / INIT_WORKGROUP_SIZE)));
        pass.end();
    }

    encodeApplyPractice(
        encoder: GPUCommandEncoder,
        cached: CachedSkillGpuData,
        p: PracticeGpuParams,
        localPosesBuffer: GPUBuffer,
        prioritiesBuffer: GPUBuffer,
        uniformPool?: GpuUniformPool,
    ): void {
        const device = this.device;
        const pb = this._allocUniformBuffer(uniformPool, PRACTICE_PARAMS_SIZE);
        const data = new ArrayBuffer(PRACTICE_PARAMS_SIZE);
        const dv = new DataView(data);
        dv.setFloat32(0, p.elapsed, true);
        dv.setFloat32(4, p.weight, true);
        dv.setInt32(8, p.priority, true);
        dv.setUint32(12, p.opaque ? 1 : 0, true);
        dv.setUint32(16, p.motionCount, true);
        dv.setUint32(20, p.boneCount, true);
        dv.setUint32(24, p.mixRootTranslation ? 1 : 0, true);
        dv.setUint32(28, p.mixRootRotation ? 1 : 0, true);
        device.queue.writeBuffer(pb, 0, data);

        const applyBG = uniformPool
            ? this._cacheBindGroup(
                this.applyBindGroupCache,
                [
                    this._bufferId(cached.translationsBuffer),
                    this._bufferId(cached.rotationsBuffer),
                    this._bufferId(cached.motionMetaBuffer),
                    this._bufferId(cached.boneFlagsBuffer),
                    this._bufferId(localPosesBuffer),
                    this._bufferId(prioritiesBuffer),
                    this._bufferId(pb),
                ].join(':'),
                () => device.createBindGroup({
                    layout: this.applyLayout,
                    entries: [
                        { binding: 0, resource: { buffer: cached.translationsBuffer } },
                        { binding: 1, resource: { buffer: cached.rotationsBuffer } },
                        { binding: 2, resource: { buffer: cached.motionMetaBuffer } },
                        { binding: 3, resource: { buffer: cached.boneFlagsBuffer } },
                        { binding: 4, resource: { buffer: localPosesBuffer } },
                        { binding: 5, resource: { buffer: prioritiesBuffer } },
                        { binding: 6, resource: { buffer: pb } },
                    ],
                }),
            )
            : device.createBindGroup({
                layout: this.applyLayout,
                entries: [
                    { binding: 0, resource: { buffer: cached.translationsBuffer } },
                    { binding: 1, resource: { buffer: cached.rotationsBuffer } },
                    { binding: 2, resource: { buffer: cached.motionMetaBuffer } },
                    { binding: 3, resource: { buffer: cached.boneFlagsBuffer } },
                    { binding: 4, resource: { buffer: localPosesBuffer } },
                    { binding: 5, resource: { buffer: prioritiesBuffer } },
                    { binding: 6, resource: { buffer: pb } },
                ],
            });

        const pass = encoder.beginComputePass();
        pass.setPipeline(this.applyPipeline);
        pass.setBindGroup(0, applyBG);
        pass.dispatchWorkgroups(Math.max(1, Math.ceil(p.motionCount / APPLY_WORKGROUP_SIZE)));
        pass.end();
    }

    encodePropagate(
        encoder: GPUCommandEncoder,
        localPosesBuffer: GPUBuffer,
        hierarchyBuffer: GPUBuffer,
        depthOrderBuffer: GPUBuffer,
        depthOffsetsBuffer: GPUBuffer,
        worldTransformOutput: GPUBuffer,
        boneCount: number,
        depthLayerCount: number,
        uniformPool?: GpuUniformPool,
    ): void {
        const device = this.device;
        const depthCount = Math.max(1, depthLayerCount);
        for (let depth = 0; depth < depthCount; depth++) {
            const propParams = this._allocUniformBuffer(uniformPool, PROP_PARAMS_SIZE);
            const ppd = new Uint32Array([boneCount, depth, 0, 0]);
            device.queue.writeBuffer(propParams, 0, ppd);

            const propBG = uniformPool
                ? this._cacheBindGroup(
                    this.propagateBindGroupCache,
                    [
                        this._bufferId(localPosesBuffer),
                        this._bufferId(hierarchyBuffer),
                        this._bufferId(depthOrderBuffer),
                        this._bufferId(depthOffsetsBuffer),
                        this._bufferId(worldTransformOutput),
                        this._bufferId(propParams),
                    ].join(':'),
                    () => device.createBindGroup({
                        layout: this.propagateLayout,
                        entries: [
                            { binding: 0, resource: { buffer: localPosesBuffer } },
                            { binding: 1, resource: { buffer: hierarchyBuffer } },
                            { binding: 2, resource: { buffer: depthOrderBuffer } },
                            { binding: 3, resource: { buffer: depthOffsetsBuffer } },
                            { binding: 4, resource: { buffer: worldTransformOutput } },
                            { binding: 5, resource: { buffer: propParams } },
                        ],
                    }),
                )
                : device.createBindGroup({
                    layout: this.propagateLayout,
                    entries: [
                        { binding: 0, resource: { buffer: localPosesBuffer } },
                        { binding: 1, resource: { buffer: hierarchyBuffer } },
                        { binding: 2, resource: { buffer: depthOrderBuffer } },
                        { binding: 3, resource: { buffer: depthOffsetsBuffer } },
                        { binding: 4, resource: { buffer: worldTransformOutput } },
                        { binding: 5, resource: { buffer: propParams } },
                    ],
                });

            const pass = encoder.beginComputePass();
            pass.setPipeline(this.propagatePipeline);
            pass.setBindGroup(0, propBG);
            pass.dispatchWorkgroups(Math.max(1, Math.ceil(boneCount / PROPAGATE_WORKGROUP_SIZE)));
            pass.end();
        }
    }

}
