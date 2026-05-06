// Lazy dual-sided buffer for the CPU/GPU character pipeline.
//
// Both pipeline paths (CPU reference and GPU compute) work with the same
// interleaved float layout. PipelineBuffer tracks which side has current
// data and copies across the CPU↔GPU boundary on demand.
//
// CPU side: Float32Array (direct read/write from JS).
// GPU side: GPUBuffer (read/write from WGSL compute and vertex shaders).
//
// The GPU buffer is created lazily on first ensureGpu(). The CPU array is
// created eagerly (it's cheap) so the CPU pipeline always has something to
// write into without waiting for a device. GPU→CPU readback (ensureCpu)
// uses a MAP_READ staging buffer and is async — only call it for validation
// or export, not in the hot render path.

/// <reference types="@webgpu/types" />

import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';

export type PipelineBufferAuthority = 'cpu' | 'gpu' | 'none';

export interface PipelineBufferOptions {
    label: string;
    floatCount: number;
    /** Extra GPUBufferUsage flags ORed onto the GPU buffer (e.g. VERTEX, STORAGE). */
    gpuUsage?: number;
    instrumentation?: GpuInstrumentationCallbacks;
}

export class PipelineBuffer {
    readonly label: string;
    readonly floatCount: number;
    readonly byteSize: number;

    private _cpu: Float32Array;
    private _gpu: GPUBuffer | null = null;
    private _staging: GPUBuffer | null = null;
    private _authority: PipelineBufferAuthority = 'none';
    private _gpuUsage: number;
    private _instrumentation: GpuInstrumentationCallbacks | undefined;

    constructor(opts: PipelineBufferOptions) {
        this.label = opts.label;
        this.floatCount = opts.floatCount;
        this.byteSize = opts.floatCount * 4;
        this._cpu = new Float32Array(opts.floatCount);
        this._gpuUsage = opts.gpuUsage ?? 0;
        this._instrumentation = opts.instrumentation;
    }

    get authority(): PipelineBufferAuthority {
        return this._authority;
    }

    get cpu(): Float32Array {
        return this._cpu;
    }

    get gpu(): GPUBuffer | null {
        return this._gpu;
    }

    /** True if a GPU buffer has been allocated. */
    get hasGpu(): boolean {
        return this._gpu !== null;
    }

    /** Mark CPU side as the authority after JS writes into .cpu. */
    cpuDidWrite(): void {
        this._authority = 'cpu';
    }

    /** Mark GPU side as the authority after a compute shader writes into .gpu. */
    gpuDidWrite(): void {
        this._authority = 'gpu';
    }

    /**
     * Ensure the GPU buffer exists and contains current data.
     * - If GPU buffer doesn't exist, creates it (lazy).
     * - If authority is 'cpu', copies CPU → GPU via writeBuffer.
     * - If authority is already 'gpu', no-op.
     * Returns the GPUBuffer.
     */
    ensureGpu(device: GPUDevice, queue: GPUQueue): GPUBuffer {
        if (!this._gpu) {
            this._gpu = device.createBuffer({
                label: `pb:${this.label}`,
                size: this.byteSize,
                usage:
                    GPUBufferUsage.COPY_SRC |
                    GPUBufferUsage.COPY_DST |
                    this._gpuUsage,
            });
            this._instrumentation?.onResourceAllocated?.({
                kind: 'buffer',
                purpose: `pipeline-buffer:${this.label}`,
                byteSize: this.byteSize,
                label: this.label,
            });
        }
        if (this._authority === 'cpu') {
            queue.writeBuffer(this._gpu, 0, this._cpu.buffer, this._cpu.byteOffset, this.byteSize);
        }
        return this._gpu;
    }

    /**
     * Ensure the CPU Float32Array contains current data.
     * - If authority is 'cpu' or 'none', returns immediately (sync).
     * - If authority is 'gpu', copies GPU → CPU via a staging buffer + mapAsync (async).
     *   Only use this for validation or export — it stalls the pipeline.
     */
    async ensureCpu(device: GPUDevice, queue: GPUQueue): Promise<Float32Array> {
        if (this._authority !== 'gpu' || !this._gpu) {
            return this._cpu;
        }
        if (!this._staging || this._staging.size < this.byteSize) {
            if (this._staging) {
                this._staging.destroy();
                this._instrumentation?.onResourceDestroyed?.({
                    kind: 'buffer',
                    purpose: `pipeline-staging:${this.label}`,
                });
            }
            this._staging = device.createBuffer({
                label: `pb-staging:${this.label}`,
                size: this.byteSize,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });
            this._instrumentation?.onResourceAllocated?.({
                kind: 'buffer',
                purpose: `pipeline-staging:${this.label}`,
                byteSize: this.byteSize,
                label: this.label,
            });
        }
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(this._gpu, 0, this._staging, 0, this.byteSize);
        queue.submit([encoder.finish()]);
        await this._staging.mapAsync(GPUMapMode.READ);
        const mapped = new Float32Array(this._staging.getMappedRange());
        this._cpu.set(mapped);
        this._staging.unmap();
        this._authority = 'cpu';
        return this._cpu;
    }

    /**
     * Resize the buffer (e.g. when a mesh with more vertices is loaded).
     * Destroys existing GPU and staging buffers; they will be lazily recreated.
     */
    resize(newFloatCount: number): void {
        if (newFloatCount === this.floatCount) return;
        const newCpu = new Float32Array(newFloatCount);
        const copyLen = Math.min(this._cpu.length, newFloatCount);
        newCpu.set(this._cpu.subarray(0, copyLen));
        this._cpu = newCpu;
        (this as { floatCount: number }).floatCount = newFloatCount;
        (this as { byteSize: number }).byteSize = newFloatCount * 4;
        this._destroyGpuBuffers();
        this._authority = copyLen > 0 ? 'cpu' : 'none';
    }

    /** Release GPU resources. CPU side remains valid. */
    destroy(): void {
        this._destroyGpuBuffers();
    }

    private _destroyGpuBuffers(): void {
        if (this._gpu) {
            this._gpu.destroy();
            this._instrumentation?.onResourceDestroyed?.({
                kind: 'buffer',
                purpose: `pipeline-buffer:${this.label}`,
            });
            this._gpu = null;
        }
        if (this._staging) {
            this._staging.destroy();
            this._instrumentation?.onResourceDestroyed?.({
                kind: 'buffer',
                purpose: `pipeline-staging:${this.label}`,
            });
            this._staging = null;
        }
    }
}

// Bone transform layout: 8 floats per bone (vec3 position + quat xyzw + 1 pad).
export const BONE_TRANSFORM_FLOATS = 8;

export function packBoneTransforms(
    bones: ReadonlyArray<{ worldPosition: { x: number; y: number; z: number }; worldRotation: { x: number; y: number; z: number; w: number } }>,
    out: Float32Array,
    offset = 0,
): void {
    for (let i = 0; i < bones.length; i++) {
        const o = offset + i * BONE_TRANSFORM_FLOATS;
        const b = bones[i];
        out[o] = b.worldPosition.x;
        out[o + 1] = b.worldPosition.y;
        out[o + 2] = b.worldPosition.z;
        out[o + 3] = b.worldRotation.x;
        out[o + 4] = b.worldRotation.y;
        out[o + 5] = b.worldRotation.z;
        out[o + 6] = b.worldRotation.w;
        out[o + 7] = 0; // pad to 32-byte alignment
    }
}

export function createBoneTransformBuffer(
    boneCount: number,
    label: string,
    instrumentation?: GpuInstrumentationCallbacks,
): PipelineBuffer {
    return new PipelineBuffer({
        label,
        floatCount: boneCount * BONE_TRANSFORM_FLOATS,
        gpuUsage: GPUBufferUsage.STORAGE,
        instrumentation,
    });
}

// Deformed mesh layout: 6 floats per vertex (px py pz nx ny nz).
export const DEFORMED_VERTEX_FLOATS = 6;

export function createDeformedMeshBuffer(
    vertexCount: number,
    label: string,
    instrumentation?: GpuInstrumentationCallbacks,
): PipelineBuffer {
    return new PipelineBuffer({
        label,
        floatCount: vertexCount * DEFORMED_VERTEX_FLOATS,
        gpuUsage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
        instrumentation,
    });
}

/**
 * Pack CPU deformMesh output (Vec3 arrays) into the interleaved layout.
 * Writes into buf.cpu and marks CPU as authority.
 */
export function packDeformedMesh(
    vertices: ReadonlyArray<{ x: number; y: number; z: number }>,
    normals: ReadonlyArray<{ x: number; y: number; z: number }>,
    buf: PipelineBuffer,
): void {
    const out = buf.cpu;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
        const o = i * DEFORMED_VERTEX_FLOATS;
        const v = vertices[i];
        const nm = normals[i];
        out[o] = v.x;
        out[o + 1] = v.y;
        out[o + 2] = v.z;
        out[o + 3] = nm.x;
        out[o + 4] = nm.y;
        out[o + 5] = nm.z;
    }
    buf.cpuDidWrite();
}
