// GPU-resident animation data cache.
//
// Packs skill keyframe data and skeleton hierarchy into GPU storage buffers
// that persist for the lifetime of the skill. Uploaded once at load time;
// the animation compute shader reads from these buffers every frame.
//
// Data layout (all flat arrays, no struct alignment concerns):
//   translations: array<f32>, 3 floats per Vec3 sample
//   rotations:    array<f32>, 4 floats per Quat sample
//   motionMeta:   8 u32 per motion (boneIndex, frames, transOff, rotOff, hasTrans, hasRot, pad, pad)
//   hierarchy:    8 floats per bone (parentIndex as i32 bitcast, posXYZ, rotXYZW)
//   depthOrder:   array<u32>, indices grouped by hierarchy depth
//   depthOffsets: array<u32>, prefix offsets into depthOrder (len = depth layers + 1)

/// <reference types="@webgpu/types" />

import type { SkillData, MotionData, BoneData } from './types.js';
import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';

export interface CachedSkillGpuData {
    translationsBuffer: GPUBuffer;
    rotationsBuffer: GPUBuffer;
    motionMetaBuffer: GPUBuffer;
    hierarchyBuffer: GPUBuffer;
    /** Bones grouped by depth, flattened as indices. */
    depthOrderBuffer: GPUBuffer;
    /** Prefix offsets into depthOrder (length = depthLayerCount + 1). */
    depthOffsetsBuffer: GPUBuffer;
    /** Per-bone flags: 4 u32 per bone (canTranslate, canRotate, canBlend, isRoot). */
    boneFlagsBuffer: GPUBuffer;
    motionCount: number;
    boneCount: number;
    depthLayerCount: number;
    translationCount: number;
    rotationCount: number;
}

const MOTION_META_U32S = 8;
const HIERARCHY_FLOATS = 8;

/**
 * Stable key for GPU caches that must stay aligned with `body.skeleton` array order
 * and the runtime name→index map (same rules as skill/hierarchy uploads).
 */
export function skeletonGpuBindingKey(
    bones: ReadonlyArray<{
        name: string;
        parentName: string;
        canTranslate: boolean;
        canRotate: boolean;
        canBlend: boolean;
        canWiggle: boolean;
    }>,
    boneNameToIndex: ReadonlyMap<string, number>,
): string {
    const parts: string[] = [`bc:${bones.length}`];
    for (let i = 0; i < bones.length; i++) {
        const b = bones[i];
        parts.push([
            i,
            b.name,
            b.parentName || '-',
            b.canTranslate ? 1 : 0,
            b.canRotate ? 1 : 0,
            b.canBlend ? 1 : 0,
            b.canWiggle ? 1 : 0,
        ].join(':'));
    }
    const mapping = Array.from(boneNameToIndex.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [name, idx] of mapping) {
        parts.push(`m:${name}:${idx}`);
    }
    return parts.join('|');
}

function computeTopologicalOrder(bones: BoneData[]): number[] {
    const byName = new Map<string, number>();
    for (let i = 0; i < bones.length; i++) byName.set(bones[i].name, i);

    const order: number[] = [];
    const visited = new Set<number>();

    function visit(idx: number): void {
        if (visited.has(idx)) return;
        const parent = bones[idx].parentName;
        if (parent) {
            const pi = byName.get(parent);
            if (pi !== undefined) visit(pi);
        }
        visited.add(idx);
        order.push(idx);
    }

    for (let i = 0; i < bones.length; i++) visit(i);
    return order;
}

function computeDepthLayerData(
    bones: BoneData[],
    topoOrder: number[],
): { depthOrder: number[]; depthOffsets: number[]; depthLayerCount: number } {
    const byName = new Map<string, number>();
    for (let i = 0; i < bones.length; i++) byName.set(bones[i].name, i);

    const depthMemo = new Array<number>(bones.length).fill(-1);
    const visiting = new Set<number>();
    const depthOf = (idx: number): number => {
        const cached = depthMemo[idx];
        if (cached >= 0) return cached;
        if (visiting.has(idx)) {
            // Defensive fallback for malformed cyclic skeletons.
            depthMemo[idx] = 0;
            return 0;
        }
        visiting.add(idx);
        const parentName = bones[idx].parentName;
        const parentIdx = parentName ? byName.get(parentName) : undefined;
        const depth = parentIdx === undefined ? 0 : depthOf(parentIdx) + 1;
        visiting.delete(idx);
        depthMemo[idx] = depth;
        return depth;
    };

    let maxDepth = 0;
    for (let i = 0; i < bones.length; i++) {
        const d = depthOf(i);
        if (d > maxDepth) maxDepth = d;
    }
    const buckets: number[][] = Array.from({ length: maxDepth + 1 }, () => []);
    for (const bi of topoOrder) {
        buckets[depthMemo[bi]].push(bi);
    }
    const depthOrder: number[] = [];
    const depthOffsets: number[] = [0];
    for (const layer of buckets) {
        for (const bi of layer) depthOrder.push(bi);
        depthOffsets.push(depthOrder.length);
    }
    return {
        depthOrder,
        depthOffsets,
        depthLayerCount: buckets.length,
    };
}

export class GpuSkillCache {
    private cache = new Map<SkillData, Map<string, CachedSkillGpuData>>();
    private entryCount = 0;
    private device: GPUDevice;
    private queue: GPUQueue;
    private instrumentation: GpuInstrumentationCallbacks | undefined;

    constructor(device: GPUDevice, queue: GPUQueue, instrumentation?: GpuInstrumentationCallbacks) {
        this.device = device;
        this.queue = queue;
        this.instrumentation = instrumentation;
    }

    get(skill: SkillData): CachedSkillGpuData | undefined {
        const variants = this.cache.get(skill);
        if (!variants || variants.size === 0) return undefined;
        return variants.values().next().value;
    }

    has(skill: SkillData): boolean {
        const variants = this.cache.get(skill);
        return !!variants && variants.size > 0;
    }

    /**
     * Upload skill keyframe data and skeleton hierarchy to GPU.
     * `bones` is the original skeleton bone data (rest poses, hierarchy).
     * `boneNameToIndex` maps bone names to indices in the built skeleton.
     */
    getOrCreate(
        skill: SkillData,
        bones: BoneData[],
        boneNameToIndex: Map<string, number>,
    ): CachedSkillGpuData {
        const signature = this._skeletonSignature(bones, boneNameToIndex);
        let variants = this.cache.get(skill);
        if (!variants) {
            variants = new Map<string, CachedSkillGpuData>();
            this.cache.set(skill, variants);
        }
        let entry = variants.get(signature);
        if (entry) return entry;
        entry = this._upload(skill, bones, boneNameToIndex, signature);
        variants.set(signature, entry);
        this.entryCount++;
        return entry;
    }

    evict(skill: SkillData): void {
        const variants = this.cache.get(skill);
        if (!variants) return;
        for (const entry of variants.values()) {
            this._destroy(skill.name, entry);
        }
        this.entryCount = Math.max(0, this.entryCount - variants.size);
        this.cache.delete(skill);
    }

    clear(): void {
        for (const [skill, variants] of this.cache) {
            for (const entry of variants.values()) {
                this._destroy(skill.name, entry);
            }
        }
        this.cache.clear();
        this.entryCount = 0;
    }

    get size(): number {
        return this.entryCount;
    }

    private _upload(
        skill: SkillData,
        bones: BoneData[],
        boneNameToIndex: Map<string, number>,
        signature: string,
    ): CachedSkillGpuData {
        const label = `${skill.name}#${this._signatureHash(signature)}`;
        const boneCount = bones.length;

        const transCount = skill.translations.length;
        const transData = new Float32Array(Math.max(transCount * 3, 4));
        for (let i = 0; i < transCount; i++) {
            const t = skill.translations[i];
            transData[i * 3] = t.x;
            transData[i * 3 + 1] = t.y;
            transData[i * 3 + 2] = t.z;
        }

        const rotCount = skill.rotations.length;
        const rotData = new Float32Array(Math.max(rotCount * 4, 4));
        for (let i = 0; i < rotCount; i++) {
            const r = skill.rotations[i];
            rotData[i * 4] = r.x;
            rotData[i * 4 + 1] = r.y;
            rotData[i * 4 + 2] = r.z;
            rotData[i * 4 + 3] = r.w;
        }

        const validMotions: { motion: MotionData; boneIndex: number }[] = [];
        for (const motion of skill.motions) {
            const bi = boneNameToIndex.get(motion.boneName);
            if (bi !== undefined) validMotions.push({ motion, boneIndex: bi });
        }

        const metaData = new Uint32Array(Math.max(validMotions.length * MOTION_META_U32S, 4));
        for (let i = 0; i < validMotions.length; i++) {
            const { motion, boneIndex } = validMotions[i];
            const o = i * MOTION_META_U32S;
            metaData[o] = boneIndex;
            metaData[o + 1] = motion.frames;
            metaData[o + 2] = motion.translationsOffset;
            metaData[o + 3] = motion.rotationsOffset;
            metaData[o + 4] = motion.hasTranslation ? 1 : 0;
            metaData[o + 5] = motion.hasRotation ? 1 : 0;
            metaData[o + 6] = 0;
            metaData[o + 7] = 0;
        }

        const hierData = new Float32Array(Math.max(boneCount * HIERARCHY_FLOATS, 4));
        const byName = new Map<string, number>();
        for (let i = 0; i < bones.length; i++) byName.set(bones[i].name, i);
        for (let i = 0; i < boneCount; i++) {
            const b = bones[i];
            const o = i * HIERARCHY_FLOATS;
            const parentIdx = b.parentName ? (byName.get(b.parentName) ?? -1) : -1;
            const dv = new DataView(hierData.buffer, hierData.byteOffset + o * 4, 4);
            dv.setInt32(0, parentIdx, true);
            hierData[o + 1] = b.position.x;
            hierData[o + 2] = b.position.y;
            hierData[o + 3] = b.position.z;
            hierData[o + 4] = b.rotation.x;
            hierData[o + 5] = b.rotation.y;
            hierData[o + 6] = b.rotation.z;
            hierData[o + 7] = b.rotation.w;
        }

        const topoOrder = computeTopologicalOrder(bones);
        const depthLayers = computeDepthLayerData(bones, topoOrder);
        const depthOrderData = new Uint32Array(Math.max(depthLayers.depthOrder.length, 4));
        for (let i = 0; i < depthLayers.depthOrder.length; i++) {
            depthOrderData[i] = depthLayers.depthOrder[i];
        }
        const depthOffsetsData = new Uint32Array(Math.max(depthLayers.depthOffsets.length, 4));
        for (let i = 0; i < depthLayers.depthOffsets.length; i++) {
            depthOffsetsData[i] = depthLayers.depthOffsets[i];
        }

        const BONE_FLAGS_U32S = 4;
        const flagsData = new Uint32Array(Math.max(boneCount * BONE_FLAGS_U32S, 4));
        const rootIdx = topoOrder.length > 0 ? topoOrder[0] : -1;
        for (let i = 0; i < boneCount; i++) {
            const b = bones[i];
            const o = i * BONE_FLAGS_U32S;
            flagsData[o] = b.canTranslate ? 1 : 0;
            flagsData[o + 1] = b.canRotate ? 1 : 0;
            flagsData[o + 2] = b.canBlend ? 1 : 0;
            flagsData[o + 3] = i === rootIdx ? 1 : 0;
        }

        const translationsBuffer = this._createBuffer(`skill-trans:${label}`, transData, GPUBufferUsage.STORAGE);
        const rotationsBuffer = this._createBuffer(`skill-rot:${label}`, rotData, GPUBufferUsage.STORAGE);
        const motionMetaBuffer = this._createBuffer(`skill-meta:${label}`, metaData, GPUBufferUsage.STORAGE);
        const hierarchyBuffer = this._createBuffer(`skill-hier:${label}`, hierData, GPUBufferUsage.STORAGE);
        const depthOrderBuffer = this._createBuffer(`skill-depth-order:${label}`, depthOrderData, GPUBufferUsage.STORAGE);
        const depthOffsetsBuffer = this._createBuffer(`skill-depth-offsets:${label}`, depthOffsetsData, GPUBufferUsage.STORAGE);
        const boneFlagsBuffer = this._createBuffer(`skill-flags:${label}`, flagsData, GPUBufferUsage.STORAGE);

        return {
            translationsBuffer,
            rotationsBuffer,
            motionMetaBuffer,
            hierarchyBuffer,
            depthOrderBuffer,
            depthOffsetsBuffer,
            boneFlagsBuffer,
            motionCount: validMotions.length,
            boneCount,
            depthLayerCount: depthLayers.depthLayerCount,
            translationCount: transCount,
            rotationCount: rotCount,
        };
    }

    private _skeletonSignature(
        bones: BoneData[],
        boneNameToIndex: Map<string, number>,
    ): string {
        return skeletonGpuBindingKey(bones, boneNameToIndex);
    }

    private _signatureHash(signature: string): string {
        let h = 2166136261 >>> 0; // FNV-1a 32-bit
        for (let i = 0; i < signature.length; i++) {
            h ^= signature.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h.toString(16).padStart(8, '0');
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
            purpose: `skill-cache:${label}`,
            byteSize: size,
            label,
        });
        return buf;
    }

    private _destroy(name: string, entry: CachedSkillGpuData): void {
        const buffers: [string, GPUBuffer][] = [
            ['trans', entry.translationsBuffer],
            ['rot', entry.rotationsBuffer],
            ['meta', entry.motionMetaBuffer],
            ['hier', entry.hierarchyBuffer],
            ['depth-order', entry.depthOrderBuffer],
            ['depth-offsets', entry.depthOffsetsBuffer],
            ['flags', entry.boneFlagsBuffer],
        ];
        for (const [suffix, buf] of buffers) {
            buf.destroy();
            this.instrumentation?.onResourceDestroyed?.({
                kind: 'buffer',
                purpose: `skill-cache:skill-${suffix}:${name}`,
            });
        }
    }
}
