// GPU-resident static mesh data cache.
//
// Stores per-mesh data that does not change between frames:
//   - UVs (Float32Array, 2 floats/vertex)
//   - Index buffer (Uint16Array or Uint32Array)
//   - Rest positions and normals (for future GPU deformation compute input)
//   - Bone bindings and blend bindings (for future GPU deformation compute input)
//
// Keyed by MeshData object identity. Created lazily on first drawMesh;
// destroyed explicitly or when the cache is cleared.

/// <reference types="@webgpu/types" />

import type { MeshData, Vec2 } from './types.js';
import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';

/** Cache key + name map so mesh bone-binding indices match `packBoneTransforms` / skeleton order. */
export interface GpuMeshBoneBindContext {
    cacheKey: string;
    boneNameToSkeletonIndex: ReadonlyMap<string, number>;
}

/** Single-arg `getOrCreate(mesh)` uses raw mesh binding indices (only safe when they match skeleton order). */
export const GPU_MESH_RAW_BONE_BIND_CACHE_KEY = '__raw_mesh_bone_idx__';

function meshVertexUv(mesh: MeshData, vertexIndex: number): Vec2 {
    const uvs = mesh.uvs;
    if (vertexIndex < uvs.length) return uvs[vertexIndex] ?? { x: 0, y: 0 };
    const blendIdx = vertexIndex - uvs.length;
    const bb = mesh.blendBindings[blendIdx];
    const src = bb?.otherVertexIndex;
    if (src !== undefined && src >= 0 && src < uvs.length) return uvs[src] ?? { x: 0, y: 0 };
    return { x: 0, y: 0 };
}

export interface CachedMeshGpuData {
    uvBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    indexCount: number;
    vertexCount: number;
    useUint32Index: boolean;
    restPositions: GPUBuffer;
    restNormals: GPUBuffer;
    boneBindings: GPUBuffer;
    boneBindingCount: number;
    blendBindings: GPUBuffer;
    blendBindingCount: number;
    boundVertexCount: number;
    /** Pre-allocated output buffer for GPU deformation (6 floats/vertex). Reused every frame. */
    deformedOutput: GPUBuffer;
}

/** 5 uint32 per bone binding: boneIndex, firstVertex, vertexCount, firstBlendedVertex, blendedVertexCount */
const BONE_BINDING_U32S = 5;
/** 2 values per blend binding: otherVertexIndex (u32) + weight (f32), packed as 2x u32 for simplicity */
const BLEND_BINDING_FLOATS = 2;

export class GpuMeshCache {
    private cache = new Map<MeshData, Map<string, CachedMeshGpuData>>();
    private device: GPUDevice;
    private queue: GPUQueue;
    private instrumentation: GpuInstrumentationCallbacks | undefined;

    constructor(device: GPUDevice, queue: GPUQueue, instrumentation?: GpuInstrumentationCallbacks) {
        this.device = device;
        this.queue = queue;
        this.instrumentation = instrumentation;
    }

    get(mesh: MeshData, cacheKey = GPU_MESH_RAW_BONE_BIND_CACHE_KEY): CachedMeshGpuData | undefined {
        return this.cache.get(mesh)?.get(cacheKey);
    }

    has(mesh: MeshData, cacheKey = GPU_MESH_RAW_BONE_BIND_CACHE_KEY): boolean {
        return this.cache.get(mesh)?.has(cacheKey) ?? false;
    }

    /**
     * Upload mesh geometry. For GPU deformation, pass {@link GpuMeshBoneBindContext} so
     * `boneBindings.boneIndex` is remapped from mesh `boneNames` indices to skeleton array indices
     * (matches CPU `deformMesh`).
     */
    getOrCreate(mesh: MeshData, boneBind?: GpuMeshBoneBindContext): CachedMeshGpuData {
        const cacheKey = boneBind?.cacheKey ?? GPU_MESH_RAW_BONE_BIND_CACHE_KEY;
        let byKey = this.cache.get(mesh);
        if (!byKey) {
            byKey = new Map();
            this.cache.set(mesh, byKey);
        }
        let entry = byKey.get(cacheKey);
        if (entry) return entry;
        entry = this._upload(mesh, boneBind?.boneNameToSkeletonIndex ?? null);
        byKey.set(cacheKey, entry);
        return entry;
    }

    evict(mesh: MeshData): void {
        const byKey = this.cache.get(mesh);
        if (!byKey) return;
        for (const entry of byKey.values()) {
            this._destroy(mesh.name, entry);
        }
        this.cache.delete(mesh);
    }

    clear(): void {
        for (const [mesh, byKey] of this.cache) {
            for (const entry of byKey.values()) {
                this._destroy(mesh.name, entry);
            }
        }
        this.cache.clear();
    }

    get size(): number {
        let n = 0;
        for (const byKey of this.cache.values()) n += byKey.size;
        return n;
    }

    private _upload(
        mesh: MeshData,
        boneNameToSkeletonIndex: ReadonlyMap<string, number> | null,
    ): CachedMeshGpuData {
        const vertexCount = mesh.vertices.length;
        const boundVertexCount = mesh.uvs.length;
        const label = mesh.name;

        const uvData = new Float32Array(vertexCount * 2);
        for (let i = 0; i < vertexCount; i++) {
            const uv = meshVertexUv(mesh, i);
            uvData[i * 2] = uv.x;
            uvData[i * 2 + 1] = uv.y;
        }
        const uvBuffer = this._createBuffer(`mesh-uv:${label}`, uvData, GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE);

        const indexCount = mesh.faces.length * 3;
        const useUint32Index = vertexCount > 65535;
        let indexBuffer: GPUBuffer;
        if (useUint32Index) {
            const idx = new Uint32Array(indexCount);
            for (let i = 0; i < mesh.faces.length; i++) {
                const f = mesh.faces[i];
                idx[i * 3] = f.a; idx[i * 3 + 1] = f.b; idx[i * 3 + 2] = f.c;
            }
            indexBuffer = this._createBuffer(`mesh-idx:${label}`, idx, GPUBufferUsage.INDEX);
        } else {
            const idx = new Uint16Array(indexCount);
            for (let i = 0; i < mesh.faces.length; i++) {
                const f = mesh.faces[i];
                idx[i * 3] = f.a; idx[i * 3 + 1] = f.b; idx[i * 3 + 2] = f.c;
            }
            indexBuffer = this._createBuffer(`mesh-idx:${label}`, idx, GPUBufferUsage.INDEX);
        }

        const restPos = new Float32Array(vertexCount * 3);
        const restNorm = new Float32Array(vertexCount * 3);
        for (let i = 0; i < vertexCount; i++) {
            const v = mesh.vertices[i];
            const n = mesh.normals[i];
            if (v) { restPos[i * 3] = v.x; restPos[i * 3 + 1] = v.y; restPos[i * 3 + 2] = v.z; }
            if (n) { restNorm[i * 3] = n.x; restNorm[i * 3 + 1] = n.y; restNorm[i * 3 + 2] = n.z; }
            else { restNorm[i * 3 + 1] = 1; }
        }
        const restPositions = this._createBuffer(`mesh-rest-pos:${label}`, restPos, GPUBufferUsage.STORAGE);
        const restNormals = this._createBuffer(`mesh-rest-norm:${label}`, restNorm, GPUBufferUsage.STORAGE);

        const boneBindingCount = mesh.boneBindings.length;
        const bbData = new Uint32Array(boneBindingCount * BONE_BINDING_U32S);
        for (let i = 0; i < boneBindingCount; i++) {
            const b = mesh.boneBindings[i];
            const o = i * BONE_BINDING_U32S;
            let skelBoneIdx = b.boneIndex;
            if (boneNameToSkeletonIndex) {
                const boneName = mesh.boneNames[b.boneIndex];
                if (boneName !== undefined) {
                    const mapped = boneNameToSkeletonIndex.get(boneName);
                    if (mapped !== undefined) {
                        skelBoneIdx = mapped;
                    } else {
                        console.warn(
                            `[gpu-mesh-cache] "${mesh.name}" binding ${i}: bone "${boneName}" not in skeleton map; using mesh boneIndex ${b.boneIndex}`,
                        );
                    }
                }
            }
            bbData[o] = skelBoneIdx;
            bbData[o + 1] = b.firstVertex;
            bbData[o + 2] = b.vertexCount;
            bbData[o + 3] = b.firstBlendedVertex;
            bbData[o + 4] = b.blendedVertexCount;
        }
        const minBBSize = Math.max(bbData.byteLength, 16);
        const boneBindingsBuffer = this._createBufferSized(`mesh-bone-bind:${label}`, minBBSize, GPUBufferUsage.STORAGE);
        if (bbData.byteLength > 0) this.queue.writeBuffer(boneBindingsBuffer, 0, bbData);

        const blendBindingCount = mesh.blendBindings.length;
        const blData = new Float32Array(blendBindingCount * BLEND_BINDING_FLOATS);
        for (let i = 0; i < blendBindingCount; i++) {
            const bl = mesh.blendBindings[i];
            const o = i * BLEND_BINDING_FLOATS;
            const view = new DataView(blData.buffer, blData.byteOffset + o * 4, 8);
            view.setUint32(0, bl.otherVertexIndex, true);
            view.setFloat32(4, bl.weight, true);
        }
        const minBlSize = Math.max(blData.byteLength, 16);
        const blendBindingsBuffer = this._createBufferSized(`mesh-blend-bind:${label}`, minBlSize, GPUBufferUsage.STORAGE);
        if (blData.byteLength > 0) this.queue.writeBuffer(blendBindingsBuffer, 0, blData);

        const deformedByteSize = Math.max(vertexCount * 6 * 4, 16);
        const deformedOutput = this._createBufferSized(
            `mesh-deformed:${label}`,
            deformedByteSize,
            GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC,
        );

        return {
            uvBuffer,
            indexBuffer,
            indexCount,
            vertexCount,
            useUint32Index,
            restPositions,
            restNormals,
            boneBindings: boneBindingsBuffer,
            boneBindingCount,
            blendBindings: blendBindingsBuffer,
            blendBindingCount,
            boundVertexCount,
            deformedOutput,
        };
    }

    private _createBuffer(label: string, data: ArrayBufferView, usage: number): GPUBuffer {
        const size = Math.max(data.byteLength, 16);
        const buf = this.device.createBuffer({
            label: `cache:${label}`,
            size,
            usage: usage | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });
        this.queue.writeBuffer(buf, 0, data.buffer as ArrayBuffer, data.byteOffset, data.byteLength);
        this.instrumentation?.onResourceAllocated?.({
            kind: 'buffer',
            purpose: `mesh-cache:${label}`,
            byteSize: size,
            label,
        });
        return buf;
    }

    private _createBufferSized(label: string, size: number, usage: number): GPUBuffer {
        const buf = this.device.createBuffer({
            label: `cache:${label}`,
            size,
            usage: usage | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });
        this.instrumentation?.onResourceAllocated?.({
            kind: 'buffer',
            purpose: `mesh-cache:${label}`,
            byteSize: size,
            label,
        });
        return buf;
    }

    private _destroy(name: string, entry: CachedMeshGpuData): void {
        const buffers: [string, GPUBuffer][] = [
            ['uv', entry.uvBuffer],
            ['idx', entry.indexBuffer],
            ['rest-pos', entry.restPositions],
            ['rest-norm', entry.restNormals],
            ['bone-bind', entry.boneBindings],
            ['blend-bind', entry.blendBindings],
            ['deformed', entry.deformedOutput],
        ];
        for (const [suffix, buf] of buffers) {
            buf.destroy();
            this.instrumentation?.onResourceDestroyed?.({
                kind: 'buffer',
                purpose: `mesh-cache:mesh-${suffix}:${name}`,
            });
        }
    }
}
