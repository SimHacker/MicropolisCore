// GPU compute world transform — generic post-deformation vertex transform.
//
// Applied in-place to the deformed vertex buffer (6 floats/vertex: px py pz nx ny nz)
// after the deformation compute pass and before the render draw call.
//
// Transform order:
//   1. Optional pre-rotation: 3x3 rotation around a pivot Y, plus translation XZ
//   2. Uniform scale around the base (Y=0). Positions scale; normals are unchanged.
//   3. Body direction: rotate around Y axis + translate(bodyX, 0, bodyZ)
//
// Normals receive rotation only (no translation, pivot shift, or scale).

/// <reference types="@webgpu/types" />

import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';
import type { GpuUniformPool } from './gpu-buffer-pool.js';

const WORLD_PARAMS_SIZE = 80;

const WORLD_TRANSFORM_WGSL = `
struct WorldParams {
    bodyRotCos: f32,
    bodyRotSin: f32,
    bodyX: f32,
    bodyZ: f32,
    preActive: u32,
    pivotY: f32,
    preTransX: f32,
    preTransZ: f32,
    preRot0: f32, preRot1: f32, preRot2: f32,
    preRot3: f32, preRot4: f32, preRot5: f32,
    preRot6: f32, preRot7: f32, preRot8: f32,
    vertexCount: u32,
    scale: f32,
    _pad0: u32,
}

@group(0) @binding(0) var<storage, read_write> deformed: array<f32>;
@group(0) @binding(1) var<uniform> params: WorldParams;

@compute @workgroup_size(64)
fn worldTransformMain(@builtin(global_invocation_id) gid: vec3u) {
    let vi = gid.x;
    if (vi >= params.vertexCount) { return; }

    let o = vi * 6u;
    var px = deformed[o];
    var py = deformed[o + 1u];
    var pz = deformed[o + 2u];
    var nx = deformed[o + 3u];
    var ny = deformed[o + 4u];
    var nz = deformed[o + 5u];

    if (params.preActive != 0u) {
        let relY = py - params.pivotY;
        let rpx = params.preRot0 * px + params.preRot1 * relY + params.preRot2 * pz;
        let rpy = params.preRot3 * px + params.preRot4 * relY + params.preRot5 * pz;
        let rpz = params.preRot6 * px + params.preRot7 * relY + params.preRot8 * pz;
        px = rpx + params.preTransX;
        py = rpy + params.pivotY;
        pz = rpz + params.preTransZ;

        let rnx = params.preRot0 * nx + params.preRot1 * ny + params.preRot2 * nz;
        let rny = params.preRot3 * nx + params.preRot4 * ny + params.preRot5 * nz;
        let rnz = params.preRot6 * nx + params.preRot7 * ny + params.preRot8 * nz;
        nx = rnx;
        ny = rny;
        nz = rnz;
    }

    if (params.scale != 1.0) {
        px *= params.scale;
        py *= params.scale;
        pz *= params.scale;
    }

    let rx = px * params.bodyRotCos - pz * params.bodyRotSin;
    let rz = px * params.bodyRotSin + pz * params.bodyRotCos;
    deformed[o]      = rx + params.bodyX;
    deformed[o + 1u] = py;
    deformed[o + 2u] = rz + params.bodyZ;

    let rnx2 = nx * params.bodyRotCos - nz * params.bodyRotSin;
    let rnz2 = nx * params.bodyRotSin + nz * params.bodyRotCos;
    deformed[o + 3u] = rnx2;
    deformed[o + 4u] = ny;
    deformed[o + 5u] = rnz2;
}
`;

export interface WorldTransformParams {
    bodyRotCos: number;
    bodyRotSin: number;
    bodyX: number;
    bodyZ: number;
    preActive: boolean;
    pivotY: number;
    preTransX: number;
    preTransZ: number;
    /** Row-major 3x3 rotation matrix applied before body rotation. */
    preRotation: readonly [number, number, number, number, number, number, number, number, number];
    /** Uniform scale around Y=0 (default 1). Applied after pre-rotation, before body rotation. */
    scale: number;
    vertexCount: number;
}

const IDENTITY_ROT: WorldTransformParams['preRotation'] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function worldTransformIdentity(vertexCount: number): WorldTransformParams {
    return {
        bodyRotCos: 1,
        bodyRotSin: 0,
        bodyX: 0,
        bodyZ: 0,
        preActive: false,
        pivotY: 0,
        preTransX: 0,
        preTransZ: 0,
        preRotation: IDENTITY_ROT,
        scale: 1,
        vertexCount,
    };
}

export class GpuWorldTransform {
    private device: GPUDevice;
    private pipeline: GPUComputePipeline;
    private bindGroupLayout: GPUBindGroupLayout;

    constructor(device: GPUDevice, _instrumentation?: GpuInstrumentationCallbacks) {
        this.device = device;

        this.bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });

        const module = device.createShaderModule({ code: WORLD_TRANSFORM_WGSL });
        this.pipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout] }),
            compute: { module, entryPoint: 'worldTransformMain' },
        });
    }

    static isIdentity(p: WorldTransformParams): boolean {
        return !p.preActive
            && p.scale === 1
            && p.bodyX === 0
            && p.bodyZ === 0
            && p.bodyRotCos === 1
            && p.bodyRotSin === 0;
    }

    encode(
        encoder: GPUCommandEncoder,
        deformedBuffer: GPUBuffer,
        p: WorldTransformParams,
        uniformPool?: GpuUniformPool,
    ): void {
        const device = this.device;

        const paramsBuffer = uniformPool
            ? uniformPool.acquire()
            : device.createBuffer({ size: WORLD_PARAMS_SIZE, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const data = new ArrayBuffer(WORLD_PARAMS_SIZE);
        const dv = new DataView(data);
        dv.setFloat32(0, p.bodyRotCos, true);
        dv.setFloat32(4, p.bodyRotSin, true);
        dv.setFloat32(8, p.bodyX, true);
        dv.setFloat32(12, p.bodyZ, true);
        dv.setUint32(16, p.preActive ? 1 : 0, true);
        dv.setFloat32(20, p.pivotY, true);
        dv.setFloat32(24, p.preTransX, true);
        dv.setFloat32(28, p.preTransZ, true);
        for (let i = 0; i < 9; i++) dv.setFloat32(32 + i * 4, p.preRotation[i], true);
        dv.setUint32(68, p.vertexCount, true);
        dv.setFloat32(72, p.scale, true);
        dv.setUint32(76, 0, true);
        device.queue.writeBuffer(paramsBuffer, 0, data);

        const bindGroup = device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: deformedBuffer } },
                { binding: 1, resource: { buffer: paramsBuffer } },
            ],
        });

        const pass = encoder.beginComputePass();
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(p.vertexCount / 64));
        pass.end();
    }
}
