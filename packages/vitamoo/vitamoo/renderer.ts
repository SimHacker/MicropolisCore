// VitaMoo WebGPU renderer — draws deformed meshes with textures.
/// <reference types="@webgpu/types" />

import { Vec2, Vec3, MeshData, type Quat } from './types.js';
import type {
    GpuCharacterPipelineCaps,
} from './character-pipeline.js';
import { GpuMeshCache } from './gpu-mesh-cache.js';
import type { GpuMeshBoneBindContext } from './gpu-mesh-cache.js';
import { GpuDeformer } from './gpu-deformer.js';
import { GpuAnimator } from './gpu-animator.js';
import type { PracticeGpuParams } from './gpu-animator.js';
import { GpuSkillCache } from './gpu-skill-cache.js';
import type { CachedSkillGpuData } from './gpu-skill-cache.js';
import { GpuWorldTransform } from './gpu-world-transform.js';
import type { WorldTransformParams } from './gpu-world-transform.js';
import { GpuUniformPool, GpuVertexBufferPool } from './gpu-buffer-pool.js';
import type {
    GpuInstrumentationCallbacks,
    GpuResourceAllocatedEvent,
    GpuResourceDestroyedEvent,
} from './gpu-instrumentation.js';
import { loadTexture } from './texture.js';
import { createDiamondMesh } from './procedural/diamond.js';
import { transformMesh, transformMeshUpright } from './display-list.js';

export type TextureHandle = import('./texture.js').TextureHandle;

/**
 * Highest `PickDebugUniforms.debugMode` value (binding 3) in WGSL (`fragmentMain` + `fragmentMainColorOnly`).
 * When adding a mode: increment this, add matching `if (pd.debugMode == N)` branches in both fragments
 * (same order, early return), and extend {@link meshFragmentDebugModeLabel}.
 */
export const MESH_FRAGMENT_DEBUG_MODE_MAX = 6;

/** Numeric ids for WGSL `PickDebugUniforms.debugMode` (mesh pass, binding 3). */
export const MeshFragmentDebugMode = {
    NORMAL: 0,
    UV_AS_RG: 1,
    UV_CHECKER_8: 2,
    SOLID_RED: 3,
    RAW_TEXTURE: 4,
    NORMALS_RGB: 5,
    ALBEDO_WHITE_LIGHT: 6,
} as const;

export type MeshFragmentDebugModeId = (typeof MeshFragmentDebugMode)[keyof typeof MeshFragmentDebugMode];

export function meshFragmentDebugModeLabel(id: number): string {
    switch (id) {
        case MeshFragmentDebugMode.NORMAL:
            return 'normal (lit + textured)';
        case MeshFragmentDebugMode.UV_AS_RG:
            return 'UV as red/green';
        case MeshFragmentDebugMode.UV_CHECKER_8:
            return 'UV checker 8×8';
        case MeshFragmentDebugMode.SOLID_RED:
            return 'solid red';
        case MeshFragmentDebugMode.RAW_TEXTURE:
            return 'raw texture (no lighting)';
        case MeshFragmentDebugMode.NORMALS_RGB:
            return 'vertex normals as RGB';
        case MeshFragmentDebugMode.ALBEDO_WHITE_LIGHT:
            return 'white albedo × lighting only';
        default:
            return id > MESH_FRAGMENT_DEBUG_MODE_MAX
                ? `out of range (${id}; max ${MESH_FRAGMENT_DEBUG_MODE_MAX})`
                : `reserved (${id})`;
    }
}

const MESH_VERTEX_WGSL = `
struct Uniforms {
    projection: mat4x4f,
    modelView: mat4x4f,
    lightDir: vec3f,
    alpha: f32,
    fadeColor: vec4f,
    hasTexture: u32,
    solidColorMode: u32,
    ambient: f32,
    diffuseFactor: f32,
    highlight: vec4f,
    plumbBobUiAmbient: f32,
    plumbBobUiDiffuse: f32,
}
struct PickDebugUniforms {
    debugMode: u32,
    idType: u32,
    objectId: u32,
    subObjectId: u32,
}
// fadeColor: xyz = tint or sentinel; .w unused (keeps hasTexture/solid u32 at stable offsets vs vec3 padding).
// Pick/debug u32s live only in pd (binding 3) so they cannot alias floats in u (binding 0) on any backend.
// General-purpose mesh diagnostics: pd.debugMode 0 uses the normal path below; 1..MESH_FRAGMENT_DEBUG_MODE_MAX
// are early-return views (UV, lighting isolation, etc.). Keep fragmentMain + fragmentMainColorOnly in sync;
// extend in TS: MESH_FRAGMENT_DEBUG_MODE_MAX + meshFragmentDebugModeLabel + MeshFragmentDebugMode.
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;
@group(0) @binding(3) var<uniform> pd: PickDebugUniforms;

struct VertexInput {
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) texCoord: vec2f,
}
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) texCoord: vec2f,
    @location(1) normal: vec3f,
}
@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = u.projection * u.modelView * vec4f(input.position, 1.0);
    out.texCoord = input.texCoord;
    out.normal = input.normal;
    return out;
}
struct MeshPickColorOutput {
    @location(0) idType: u32,
    @location(1) objectId: u32,
    @location(2) subObjectId: u32,
    @location(3) color: vec4f,
}
@fragment
fn fragmentMain(input: VertexOutput) -> MeshPickColorOutput {
    var result: MeshPickColorOutput;
    result.idType = pd.idType;
    result.objectId = pd.objectId;
    result.subObjectId = pd.subObjectId;
    // --- debugMode branches (see MeshFragmentDebugMode in renderer.ts) ---
    if (pd.debugMode == 1u) {
        result.color = vec4f(input.texCoord.x, input.texCoord.y, 0.0, 1.0);
        return result;
    }
    if (pd.debugMode == 2u) {
        let uv = input.texCoord * 8.0;
        let cx = i32(floor(uv.x));
        let cy = i32(floor(uv.y));
        let c = f32((cx + cy) % 2);
        result.color = vec4f(c, c, c, 1.0);
        return result;
    }
    if (pd.debugMode == 3u) {
        result.color = vec4f(1.0, 0.0, 0.0, 1.0);
        return result;
    }
    if (pd.debugMode == 4u) {
        if (u.hasTexture != 0u) {
            let texColor = textureSampleLevel(tex, samp, input.texCoord, 0.0);
            result.color = vec4f(texColor.rgb, texColor.a * u.alpha);
        } else {
            result.color = vec4f(1.0, 0.0, 1.0, 1.0);
        }
        return result;
    }
    if (pd.debugMode == 5u) {
        let nn = normalize(input.normal) * 0.5 + 0.5;
        result.color = vec4f(nn, 1.0);
        return result;
    }
    if (pd.debugMode == 6u) {
        let n = normalize(input.normal);
        let L = normalize(u.lightDir);
        let diffuse = max(dot(n, L), 0.0);
        let light = u.ambient + u.diffuseFactor * diffuse;
        if (u.hasTexture != 0u) {
            result.color = vec4f(vec3f(light), u.alpha);
        } else {
            result.color = vec4f(vec3f(0.85, 0.25, 0.25) * light, u.alpha);
        }
        return result;
    }
    // --- end debugMode; then solid vertex color, then default shaded ---
    if (u.solidColorMode != 0u) {
        let n = normalize(input.normal);
        let L = normalize(u.lightDir);
        let diffuse = max(dot(n, L), 0.0);
        let raw = u.plumbBobUiAmbient + u.plumbBobUiDiffuse * diffuse;
        let light = clamp(raw, 0.0, 1.0);
        result.color = vec4f(u.fadeColor.xyz * light, u.alpha);
        return result;
    }
    let n = normalize(input.normal);
    let L = normalize(u.lightDir);
    let diffuse = max(dot(n, L), 0.0);
    let light = u.ambient + u.diffuseFactor * diffuse;
    if (u.hasTexture != 0u) {
        let texColor = textureSampleLevel(tex, samp, input.texCoord, 0.0);
        result.color = vec4f(texColor.rgb * light, texColor.a * u.alpha);
    } else {
        result.color = vec4f(vec3f(0.7, 0.7, 0.8) * light, u.alpha);
    }
    if (u.highlight.a > 0.0) {
        result.color = vec4f(mix(result.color.rgb, u.highlight.rgb, u.highlight.a), result.color.a);
    }
    return result;
}
@fragment
fn fragmentMainColorOnly(input: VertexOutput) -> @location(0) vec4f {
    // Mirror fragmentMain debugMode + solidColor branches (single color target).
    if (pd.debugMode == 1u) {
        return vec4f(input.texCoord.x, input.texCoord.y, 0.0, 1.0);
    }
    if (pd.debugMode == 2u) {
        let uv = input.texCoord * 8.0;
        let cx = i32(floor(uv.x));
        let cy = i32(floor(uv.y));
        let c = f32((cx + cy) % 2);
        return vec4f(c, c, c, 1.0);
    }
    if (pd.debugMode == 3u) {
        return vec4f(1.0, 0.0, 0.0, 1.0);
    }
    if (pd.debugMode == 4u) {
        if (u.hasTexture != 0u) {
            let texColor = textureSampleLevel(tex, samp, input.texCoord, 0.0);
            return vec4f(texColor.rgb, texColor.a * u.alpha);
        }
        return vec4f(1.0, 0.0, 1.0, 1.0);
    }
    if (pd.debugMode == 5u) {
        let nn = normalize(input.normal) * 0.5 + 0.5;
        return vec4f(nn, 1.0);
    }
    if (pd.debugMode == 6u) {
        let n = normalize(input.normal);
        let L = normalize(u.lightDir);
        let diffuse = max(dot(n, L), 0.0);
        let light = u.ambient + u.diffuseFactor * diffuse;
        if (u.hasTexture != 0u) {
            return vec4f(vec3f(light), u.alpha);
        }
        return vec4f(vec3f(0.85, 0.25, 0.25) * light, u.alpha);
    }
    if (u.solidColorMode != 0u) {
        let n = normalize(input.normal);
        let L = normalize(u.lightDir);
        let diffuse = max(dot(n, L), 0.0);
        let raw = u.plumbBobUiAmbient + u.plumbBobUiDiffuse * diffuse;
        let light = clamp(raw, 0.0, 1.0);
        return vec4f(u.fadeColor.xyz * light, u.alpha);
    }
    let n = normalize(input.normal);
    let L = normalize(u.lightDir);
    let diffuse = max(dot(n, L), 0.0);
    let light = u.ambient + u.diffuseFactor * diffuse;
    var out: vec4f;
    if (u.hasTexture != 0u) {
        let texColor = textureSampleLevel(tex, samp, input.texCoord, 0.0);
        out = vec4f(texColor.rgb * light, texColor.a * u.alpha);
    } else {
        out = vec4f(vec3f(0.7, 0.7, 0.8) * light, u.alpha);
    }
    if (u.highlight.a > 0.0) {
        out = vec4f(mix(out.rgb, u.highlight.rgb, u.highlight.a), out.a);
    }
    return out;
}
`;

const QUAD_VERTEX_WGSL = `
struct Uniforms {
    alpha: f32,
    fadeColor: vec3f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
struct VertexOutput {
    @builtin(position) position: vec4f,
}
@vertex
fn vertexMain(@location(0) position: vec3f) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4f(position, 1.0);
    return out;
}
@fragment
fn fragmentMain() -> @location(0) vec4f {
    return vec4f(u.fadeColor, u.alpha);
}
`;

const QUAD_DUAL_WGSL = `
struct Uniforms {
    alpha: f32,
    fadeColor: vec3f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;
struct QuadPickColorOutput {
    @location(0) idType: u32,
    @location(1) objectId: u32,
    @location(2) subObjectId: u32,
    @location(3) color: vec4f,
}
@vertex
fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
    return vec4f(position, 1.0);
}
@fragment
fn fragmentMain() -> QuadPickColorOutput {
    var out: QuadPickColorOutput;
    out.idType = 0u;
    out.objectId = 0u;
    out.subObjectId = 0u;
    out.color = vec4f(u.fadeColor, u.alpha);
    return out;
}
`;

function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fov * Math.PI / 360);
    const nf = 1 / (near - far);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0,
    ]);
}

function lookAt(
    ex: number, ey: number, ez: number,
    cx: number, cy: number, cz: number,
    ux: number, uy: number, uz: number,
): Float32Array {
    let fx = cx - ex, fy = cy - ey, fz = cz - ez;
    let fl = Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx /= fl; fy /= fl; fz /= fl;
    let sx = fy * uz - fz * uy, sy = fz * ux - fx * uz, sz = fx * uy - fy * ux;
    let sl = Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx /= sl; sy /= sl; sz /= sl;
    const uux = sy * fz - sz * fy, uuy = sz * fx - sx * fz, uuz = sx * fy - sy * fx;
    return new Float32Array([
        sx, uux, -fx, 0,
        sy, uuy, -fy, 0,
        sz, uuz, -fz, 0,
        -(sx * ex + sy * ey + sz * ez),
        -(uux * ex + uuy * ey + uuz * ez),
        fx * ex + fy * ey + fz * ez, 1,
    ]);
}

/** Deformed vertex i uses mesh.uvs[i] when i is bound; blended verts borrow UV from blendBindings[i - uvs.length].otherVertexIndex. */
function meshVertexUv(mesh: MeshData, vertexIndex: number): Vec2 {
    const uvs = mesh.uvs;
    if (vertexIndex < uvs.length) return uvs[vertexIndex] ?? { x: 0, y: 0 };
    const blendIdx = vertexIndex - uvs.length;
    const bb = mesh.blendBindings[blendIdx];
    const src = bb?.otherVertexIndex;
    if (src !== undefined && src >= 0 && src < uvs.length) return uvs[src] ?? { x: 0, y: 0 };
    return { x: 0, y: 0 };
}

const FADE_SENTINEL = -1;
const UNIFORM_SIZE = 256;
const COMPUTE_UNIFORM_SIZE = 80;
const QUAD_UNIFORM_SIZE = 32;
const PICK_DEBUG_UNIFORM_SIZE = 256;

/** Byte offsets for mesh `Uniforms` @binding(0) (WGSL). `fadeColor` is vec4f (.w padding); pick/debug u32s use @binding(3). */
const U_MESH_ALPHA = 140;
const U_MESH_FADE = 144;
const U_MESH_HAS_TEX = 160;
const U_MESH_SOLID = 164;
const U_MESH_AMBIENT = 168;
const U_MESH_DIFFUSE = 172;
const U_MESH_HIGHLIGHT = 176;
const U_PLUMB_BOB_UI_AMBIENT = 192;
const U_PLUMB_BOB_UI_DIFFUSE = 196;
/** Pick buffer `idType` (`PickDebugUniforms`, binding 3). Use values outside mesh `debugMode` 0..6 for extra safety. */
export const ObjectIdType = {
    NONE: 0,
    CHARACTER: 16,
    OBJECT: 17,
    WALL: 18,
    FLOOR: 19,
    TERRAIN: 20,
    /** Plumb-bob diamond above a character; objectId is the character it refers to. */
    PLUMB_BOB: 21,
} as const;
export type ObjectIdType = (typeof ObjectIdType)[keyof typeof ObjectIdType];

/** Sub-object slot for characters: body, head, hands, accessories; full u32 in pick buffers. */
export const SubObjectId = {
    BODY: 0,
    HEAD: 1,
    LEFT_HAND: 2,
    RIGHT_HAND: 3,
    /** Accessory slots 4–255; use 4 + index for each accessory. */
    ACCESSORY_0: 4,
} as const;
export type SubObjectId = (typeof SubObjectId)[keyof typeof SubObjectId];

const DEBUG_PASS_LOGS = 2;
const DEBUG_UNIFORM_LOGS = 8;

/** Options for {@link Renderer.create}. */
export interface RendererCreateOptions {
    /**
     * When true, log pipeline setup, pass layout, per-mesh first draw, uniforms, pick readbacks, and texture success.
     * Default false for published builds. mooshow also enables via `StageConfig.verbose` or `?vitamooVerbose=1`.
     */
    verbose?: boolean;
    /**
     * Optional GPU allocation/destruction callbacks for tooling and future resource managers.
     * See `docs/gpu-assets-tooling-roadmap.md`.
     */
    instrumentation?: GpuInstrumentationCallbacks;
}

/** Three r32uint MRT layers (id type, object id, sub-object id) plus swapchain color; see device.limits.maxColorAttachments (minimum 4). */
type PickLayerTextures = {
    idType: GPUTexture;
    objectId: GPUTexture;
    subObjectId: GPUTexture;
};

const PICK_READ_BYTES_PER_ROW = 256;

export class Renderer {
    private static loggedMeshes = new Set<string>();
    private static diamondMesh: MeshData | null = null;
    private static _passLogCount = 0;
    private static _uniformLogCount = 0;
    private static _loggedDebugSlice = false;

    private static getCachedDiamondMesh(): MeshData {
        if (!Renderer.diamondMesh) Renderer.diamondMesh = createDiamondMesh(1, 6);
        return Renderer.diamondMesh;
    }

    private device!: GPUDevice;
    private queue!: GPUQueue;
    private context!: GPUCanvasContext;
    private format!: GPUTextureFormat;
    private viewport = { x: 0, y: 0, w: 0, h: 0 };
    private depthTexture: GPUTexture | null = null;
    private meshPipeline!: GPURenderPipeline;
    private meshPipelineNoCull!: GPURenderPipeline;
    private meshPipelineSingle!: GPURenderPipeline;
    private meshPipelineNoCullSingle!: GPURenderPipeline;
    private meshPipelineGpu!: GPURenderPipeline;
    private meshPipelineGpuNoCull!: GPURenderPipeline;
    private meshPipelineGpuSingle!: GPURenderPipeline;
    private meshPipelineGpuNoCullSingle!: GPURenderPipeline;
    private quadPipeline!: GPURenderPipeline;
    private quadPipelineDual!: GPURenderPipeline;
    private meshBindGroupLayout!: GPUBindGroupLayout;
    private quadBindGroupLayout!: GPUBindGroupLayout;
    private quadUniformBuffer!: GPUBuffer;
    private defaultSampler!: GPUSampler;
    private dummyTexture!: GPUTexture;
    private proj = new Float32Array(16);
    private modelView = new Float32Array(16);
    private lightDir = new Float32Array([0, 1, 0]);
    private alpha = 1.0;
    private fadeColor = new Float32Array([FADE_SENTINEL, FADE_SENTINEL, FADE_SENTINEL]);
    private ambient = 0.25;
    private diffuseFactor = 0.75;
    /** Solid/plumb-bob pass only: §1.5-1.6 of ui-overlay-encyclopedia — ambient 0.25, directional 1.0. */
    private plumbBobUiAmbient = 0.25;
    private plumbBobUiDiffuse = 1.0;
    private highlight = new Float32Array([0, 0, 0, 0]);
    private cullingEnabled = true;

    private pickTextures: PickLayerTextures | null = null;
    /** WGSL `PickDebugUniforms.debugMode` (binding 3); see {@link MeshFragmentDebugMode}. */
    private debugSliceMode = 0;
    /** When set, drawDiamond draws these meshes (plug-in plumb-bob); all use the same transform. */
    private plumbBobMeshes: MeshData[] | null = null;
    /** Scale multiplier for plumb-bob (applied to size in drawDiamond). Default 1. */
    private plumbBobScale = 1;
    /** True only while `drawDiamond` calls `drawMesh` — fadeColor is lit tint; elsewhere fadeColor stays sentinel. */
    private meshSolidVertexPass = false;

    private meshCache: GpuMeshCache | null = null;
    private gpuDeformer: GpuDeformer | null = null;
    private gpuAnimator: GpuAnimator | null = null;
    private gpuSkillCache: GpuSkillCache | null = null;
    private gpuWorldTransform: GpuWorldTransform | null = null;
    private meshUniformPool: GpuUniformPool | null = null;
    private computeUniformPool: GpuUniformPool | null = null;
    private pickUniformPool: GpuUniformPool | null = null;
    private vertexPool: GpuVertexBufferPool | null = null;

    private currentEncoder: GPUCommandEncoder | null = null;
    private currentPass: GPURenderPassEncoder | null = null;
    private currentTexture: GPUTexture | null = null;
    private buffersToDestroy: GPUBuffer[] = [];

    private constructor(
        private canvas: HTMLCanvasElement,
        private readonly options: RendererCreateOptions = {},
    ) {}

    static async create(canvas: HTMLCanvasElement, options?: RendererCreateOptions): Promise<Renderer> {
        const r = new Renderer(canvas, options ?? {});
        await r._init();
        return r;
    }

    private get verbose(): boolean {
        return this.options.verbose === true;
    }

    private _gpuAlloc(ev: GpuResourceAllocatedEvent): void {
        this.options.instrumentation?.onResourceAllocated?.(ev);
    }

    private _gpuDestroy(ev: GpuResourceDestroyedEvent): void {
        this.options.instrumentation?.onResourceDestroyed?.(ev);
    }

    private async _init(): Promise<void> {
        const adapter = await navigator.gpu?.requestAdapter();
        if (!adapter) throw new Error('WebGPU not available');
        this.device = await adapter.requestDevice();
        this.queue = this.device.queue;
        const maxAtt = this.device.limits.maxColorAttachments;
        if (maxAtt < 4) {
            throw new Error(`WebGPU: need maxColorAttachments >= 4 for pick MRT (got ${maxAtt})`);
        }

        const ctx = this.canvas.getContext('webgpu');
        if (!ctx) throw new Error('WebGPU canvas context not available');
        this.context = ctx;
        this.format = navigator.gpu.getPreferredCanvasFormat?.() ?? 'bgra8unorm';
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'opaque',
        });

        this.quadUniformBuffer = this.device.createBuffer({
            size: QUAD_UNIFORM_SIZE,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this._gpuAlloc({
            kind: 'buffer',
            purpose: 'quad-uniform',
            byteSize: QUAD_UNIFORM_SIZE,
            label: 'fullscreen-quad-uniform',
        });
        this.defaultSampler = this.device.createSampler({
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
        });
        this.dummyTexture = this.device.createTexture({
            size: [1, 1, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        this.queue.writeTexture(
            { texture: this.dummyTexture },
            new Uint8Array([255, 255, 255, 255]),
            { bytesPerRow: 4, rowsPerImage: 1 },
            [1, 1, 1],
        );
        this._gpuAlloc({
            kind: 'texture',
            purpose: 'dummy-sampling',
            width: 1,
            height: 1,
            depthOrArrayLayers: 1,
            format: 'rgba8unorm',
            byteSize: 4,
            label: '1x1-white',
        });

        this.meshBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform', minBindingSize: 16 },
                },
            ],
        });
        this.quadBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
            ],
        });

        const meshModule = this.device.createShaderModule({ code: MESH_VERTEX_WGSL });
        const quadModule = this.device.createShaderModule({ code: QUAD_VERTEX_WGSL });

        const meshPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.meshBindGroupLayout],
        });
        const meshVertexState: GPUVertexState = {
            module: meshModule,
            entryPoint: 'vertexMain',
            buffers: [
                {
                    arrayStride: 32,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: 'float32x3' },
                        { shaderLocation: 1, offset: 12, format: 'float32x3' },
                        { shaderLocation: 2, offset: 24, format: 'float32x2' },
                    ],
                },
            ],
        };
        const meshFragmentState: GPUFragmentState = {
            module: meshModule,
            entryPoint: 'fragmentMain',
            targets: [
                { format: 'r32uint' },
                { format: 'r32uint' },
                { format: 'r32uint' },
                { format: this.format },
            ],
        };
        if (this.verbose) {
            console.log(
                '[renderer] mesh pipeline targets: [0-2]=r32uint(idType,objectId,subObjectId) [3]=',
                this.format,
                '(color)',
            );
        }
        const meshDepthStencil: GPUDepthStencilState = {
            format: 'depth24plus',
            depthWriteEnabled: true,
            depthCompare: 'less-equal',
        };
        this.meshPipeline = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexState,
            fragment: meshFragmentState,
            primitive: { topology: 'triangle-list', cullMode: 'back', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });
        this.meshPipelineNoCull = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexState,
            fragment: meshFragmentState,
            primitive: { topology: 'triangle-list', cullMode: 'none', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });

        const meshFragmentStateSingle: GPUFragmentState = {
            module: meshModule,
            entryPoint: 'fragmentMainColorOnly',
            targets: [{ format: this.format }],
        };
        this.meshPipelineSingle = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexState,
            fragment: meshFragmentStateSingle,
            primitive: { topology: 'triangle-list', cullMode: 'back', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });
        this.meshPipelineNoCullSingle = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexState,
            fragment: meshFragmentStateSingle,
            primitive: { topology: 'triangle-list', cullMode: 'none', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });

        const meshVertexStateGpu: GPUVertexState = {
            module: meshModule,
            entryPoint: 'vertexMain',
            buffers: [
                {
                    arrayStride: 24,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: 'float32x3' },
                        { shaderLocation: 1, offset: 12, format: 'float32x3' },
                    ],
                },
                {
                    arrayStride: 8,
                    attributes: [
                        { shaderLocation: 2, offset: 0, format: 'float32x2' },
                    ],
                },
            ],
        };
        this.meshPipelineGpu = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexStateGpu,
            fragment: meshFragmentState,
            primitive: { topology: 'triangle-list', cullMode: 'back', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });
        this.meshPipelineGpuNoCull = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexStateGpu,
            fragment: meshFragmentState,
            primitive: { topology: 'triangle-list', cullMode: 'none', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });
        this.meshPipelineGpuSingle = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexStateGpu,
            fragment: meshFragmentStateSingle,
            primitive: { topology: 'triangle-list', cullMode: 'back', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });
        this.meshPipelineGpuNoCullSingle = this.device.createRenderPipeline({
            layout: meshPipelineLayout,
            vertex: meshVertexStateGpu,
            fragment: meshFragmentStateSingle,
            primitive: { topology: 'triangle-list', cullMode: 'none', frontFace: 'ccw' },
            depthStencil: meshDepthStencil,
        });

        const quadPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.quadBindGroupLayout],
        });
        this.quadPipeline = this.device.createRenderPipeline({
            layout: quadPipelineLayout,
            vertex: {
                module: quadModule,
                entryPoint: 'vertexMain',
                buffers: [
                    { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
                ],
            },
            fragment: {
                module: quadModule,
                entryPoint: 'fragmentMain',
                targets: [{ format: this.format }],
            },
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: false,
                depthCompare: 'always',
            },
        });

        const quadDualModule = this.device.createShaderModule({ code: QUAD_DUAL_WGSL });
        this.quadPipelineDual = this.device.createRenderPipeline({
            layout: quadPipelineLayout,
            vertex: {
                module: quadDualModule,
                entryPoint: 'vertexMain',
                buffers: [
                    { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
                ],
            },
            fragment: {
                module: quadDualModule,
                entryPoint: 'fragmentMain',
                targets: [
                    { format: 'r32uint' },
                    { format: 'r32uint' },
                    { format: 'r32uint' },
                    { format: this.format },
                ],
            },
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: false,
                depthCompare: 'always',
            },
        });

        this.meshCache = new GpuMeshCache(this.device, this.queue, this.options.instrumentation);
        this.gpuDeformer = new GpuDeformer(this.device, this.options.instrumentation);
        this.gpuAnimator = new GpuAnimator(this.device, this.options.instrumentation);
        this.gpuSkillCache = new GpuSkillCache(this.device, this.queue, this.options.instrumentation);
        this.gpuWorldTransform = new GpuWorldTransform(this.device, this.options.instrumentation);
        this.meshUniformPool = new GpuUniformPool(this.device, UNIFORM_SIZE, 'mesh-uniform', 32);
        this.computeUniformPool = new GpuUniformPool(this.device, COMPUTE_UNIFORM_SIZE, 'compute-uniform', 16);
        this.pickUniformPool = new GpuUniformPool(this.device, PICK_DEBUG_UNIFORM_SIZE, 'pick-uniform', 32);
        this.vertexPool = new GpuVertexBufferPool(this.device, 'draw-vertex');
    }

    /** GPU-resident static mesh data. Null before init. */
    getMeshCache(): GpuMeshCache | null {
        return this.meshCache;
    }

    /** GPU compute deformer. Null before init. */
    getGpuDeformer(): GpuDeformer | null {
        return this.gpuDeformer;
    }

    /** GPU compute animator. Null before init. */
    getGpuAnimator(): GpuAnimator | null {
        return this.gpuAnimator;
    }

    /** GPU-resident skill/animation data cache. Null before init. */
    getGpuSkillCache(): GpuSkillCache | null {
        return this.gpuSkillCache;
    }

    /** GPU compute world transform (body rotation + position + optional pre-rotation). Null before init. */
    getGpuWorldTransform(): GpuWorldTransform | null {
        return this.gpuWorldTransform;
    }

    /** Expose device for PipelineBuffer.ensureGpu / ensureCpu from stage code. */
    getDevice(): GPUDevice { return this.device; }
    getQueue(): GPUQueue { return this.queue; }

    /** Create a command encoder for batching multiple compute passes. */
    createComputeEncoder(): GPUCommandEncoder {
        return this.device.createCommandEncoder();
    }

    /** Submit a batched command encoder after all compute passes are encoded. */
    submitComputeEncoder(encoder: GPUCommandEncoder): void {
        this.queue.submit([encoder.finish()]);
    }

    encodeMultiPracticeGpuInit(
        encoder: GPUCommandEncoder,
        hierarchyBuffer: GPUBuffer,
        localPosesBuffer: GPUBuffer,
        prioritiesBuffer: GPUBuffer,
        boneCount: number,
    ): boolean {
        if (!this.gpuAnimator) return false;
        this.gpuAnimator.encodeInit(
            encoder,
            hierarchyBuffer,
            localPosesBuffer,
            prioritiesBuffer,
            boneCount,
            this.computeUniformPool ?? undefined,
        );
        return true;
    }

    encodeMultiPracticeGpuApply(
        encoder: GPUCommandEncoder,
        cached: CachedSkillGpuData,
        params: PracticeGpuParams,
        localPosesBuffer: GPUBuffer,
        prioritiesBuffer: GPUBuffer,
    ): boolean {
        if (!this.gpuAnimator) return false;
        this.gpuAnimator.encodeApplyPractice(
            encoder,
            cached,
            params,
            localPosesBuffer,
            prioritiesBuffer,
            this.computeUniformPool ?? undefined,
        );
        return true;
    }

    encodeMultiPracticeGpuPropagate(
        encoder: GPUCommandEncoder,
        localPosesBuffer: GPUBuffer,
        hierarchyBuffer: GPUBuffer,
        depthOrderBuffer: GPUBuffer,
        depthOffsetsBuffer: GPUBuffer,
        worldTransformOutput: GPUBuffer,
        boneCount: number,
        depthLayerCount: number,
    ): boolean {
        if (!this.gpuAnimator) return false;
        this.gpuAnimator.encodePropagate(
            encoder,
            localPosesBuffer,
            hierarchyBuffer,
            depthOrderBuffer,
            depthOffsetsBuffer,
            worldTransformOutput,
            boneCount,
            depthLayerCount,
            this.computeUniformPool ?? undefined,
        );
        return true;
    }

    /**
     * Encode deformation compute onto an external encoder (for batching).
     * Returns the persistent deformed output GPUBuffer, or null.
     */
    encodeDeformMeshGpu(
        encoder: GPUCommandEncoder,
        mesh: MeshData,
        boneTransformBuffer: GPUBuffer,
        boneBind: GpuMeshBoneBindContext,
    ): GPUBuffer | null {
        if (!this.gpuDeformer || !this.meshCache) return null;
        const cached = this.meshCache.getOrCreate(mesh, boneBind);
        this.gpuDeformer.encode(encoder, cached, boneTransformBuffer, cached.deformedOutput, this.computeUniformPool ?? undefined);
        return cached.deformedOutput;
    }

    /**
     * Encode world transform compute onto an external encoder (for batching).
     * Modifies deformedBuffer in-place. Skipped for identity transforms.
     */
    encodeWorldTransformGpu(
        encoder: GPUCommandEncoder,
        deformedBuffer: GPUBuffer,
        params: WorldTransformParams,
    ): void {
        if (!this.gpuWorldTransform || GpuWorldTransform.isIdentity(params)) return;
        this.gpuWorldTransform.encode(encoder, deformedBuffer, params, this.computeUniformPool ?? undefined);
    }

    // Tap buffers: lazy MAP_READ buffers for pipeline stage validation.
    // Each tap captures a snapshot of a working buffer at a stage boundary
    // via copyBufferToBuffer in the same encoder — no pipeline branching.
    private _tapBuffers = new Map<string, GPUBuffer>();

    /**
     * Get or create a MAP_READ tap buffer. Use with encoder.copyBufferToBuffer
     * to snapshot a pipeline stage output. Readback with readbackTap().
     */
    getTapBuffer(key: string, bytes: number): GPUBuffer {
        let buf = this._tapBuffers.get(key);
        if (!buf || buf.size < bytes) {
            buf?.destroy();
            buf = this.device.createBuffer({
                label: `tap:${key}`,
                size: bytes,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });
            this._tapBuffers.set(key, buf);
        }
        return buf;
    }

    /**
     * Async readback of a tap buffer captured during the last frame's compute encoder.
     * Stalls CPU until GPU completes — only call for periodic validation, not every frame.
     */
    async readbackTap(key: string): Promise<Float32Array | null> {
        const buf = this._tapBuffers.get(key);
        if (!buf) return null;
        await buf.mapAsync(GPUMapMode.READ);
        const data = new Float32Array(buf.getMappedRange()).slice();
        buf.unmap();
        return data;
    }

    setViewport(x: number, y: number, w: number, h: number): void {
        this.viewport = { x, y, w, h };
        if (this.depthTexture) {
            this._gpuDestroy({ kind: 'texture', purpose: 'viewport-depth' });
            this.depthTexture.destroy();
        }
        if (this.pickTextures) {
            this._gpuDestroy({ kind: 'texture', purpose: 'viewport-pick-idType' });
            this.pickTextures.idType.destroy();
            this._gpuDestroy({ kind: 'texture', purpose: 'viewport-pick-objectId' });
            this.pickTextures.objectId.destroy();
            this._gpuDestroy({ kind: 'texture', purpose: 'viewport-pick-subObjectId' });
            this.pickTextures.subObjectId.destroy();
        }
        if (w > 0 && h > 0) {
            const depthBytes = w * h * 4;
            this.depthTexture = this.device.createTexture({
                size: [w, h, 1],
                format: 'depth24plus',
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
            this._gpuAlloc({
                kind: 'texture',
                purpose: 'viewport-depth',
                width: w,
                height: h,
                depthOrArrayLayers: 1,
                format: 'depth24plus',
                byteSize: depthBytes,
            });
            const pickUsage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
            const size: GPUExtent3D = [w, h, 1];
            const pickBytes = w * h * 4;
            this.pickTextures = {
                idType: this.device.createTexture({ size, format: 'r32uint', usage: pickUsage }),
                objectId: this.device.createTexture({ size, format: 'r32uint', usage: pickUsage }),
                subObjectId: this.device.createTexture({ size, format: 'r32uint', usage: pickUsage }),
            };
            this._gpuAlloc({
                kind: 'texture',
                purpose: 'viewport-pick-idType',
                width: w,
                height: h,
                depthOrArrayLayers: 1,
                format: 'r32uint',
                byteSize: pickBytes,
            });
            this._gpuAlloc({
                kind: 'texture',
                purpose: 'viewport-pick-objectId',
                width: w,
                height: h,
                depthOrArrayLayers: 1,
                format: 'r32uint',
                byteSize: pickBytes,
            });
            this._gpuAlloc({
                kind: 'texture',
                purpose: 'viewport-pick-subObjectId',
                width: w,
                height: h,
                depthOrArrayLayers: 1,
                format: 'r32uint',
                byteSize: pickBytes,
            });
        } else {
            this.depthTexture = null;
            this.pickTextures = null;
        }
    }

    getTextureFactory(): { createTextureFromUrl(url: string): Promise<TextureHandle> } {
        const v = this.verbose;
        const inst = this.options.instrumentation;
        return {
            createTextureFromUrl: (url: string) => loadTexture(this.device, this.queue, url, v, inst),
        };
    }

    /**
     * Sets WGSL `PickDebugUniforms.debugMode` (binding 3) for mesh fragments ({@link MeshFragmentDebugMode}).
     * Values outside `0..MESH_FRAGMENT_DEBUG_MODE_MAX` clamp.
     */
    setDebugSlice(mode: number): void {
        const m = Math.max(0, Math.min(MESH_FRAGMENT_DEBUG_MODE_MAX, Math.floor(Number(mode)) || 0));
        if (this.debugSliceMode !== m) Renderer._loggedDebugSlice = false;
        this.debugSliceMode = m;
    }

    private _endFrame(): void {
        if (this.currentPass) {
            this.currentPass.end();
            this.currentPass = null;
        }
        if (this.currentEncoder && this.currentTexture) {
            this.queue.submit([this.currentEncoder.finish()]);
            this.currentEncoder = null;
            this.currentTexture = null;
            for (const b of this.buffersToDestroy) b.destroy();
            this.buffersToDestroy.length = 0;
        }
        this.meshUniformPool?.resetFrame();
        this.pickUniformPool?.resetFrame();
        this.vertexPool?.resetFrame();
        this.computeUniformPool?.resetFrame();
    }

    private _beginPass(clearColor: GPUColor | null): void {
        this._endFrame();
        const tex = this.context.getCurrentTexture();
        this.currentTexture = tex;
        this.currentEncoder = this.device.createCommandEncoder();
        const view = tex.createView();
        if (!this.depthTexture && tex.width > 0 && tex.height > 0) {
            this.setViewport(0, 0, tex.width, tex.height);
        }
        const clearVal: GPUColor = clearColor ?? { r: 0, g: 0, b: 0, a: 1 };
        const colorAttachments: GPURenderPassColorAttachment[] = [];
        if (this.pickTextures) {
            const uintClear: GPUColor = { r: 0, g: 0, b: 0, a: 0 };
            colorAttachments.push({
                view: this.pickTextures.idType.createView(),
                clearValue: uintClear,
                loadOp: 'clear',
                storeOp: 'store',
            });
            colorAttachments.push({
                view: this.pickTextures.objectId.createView(),
                clearValue: uintClear,
                loadOp: 'clear',
                storeOp: 'store',
            });
            colorAttachments.push({
                view: this.pickTextures.subObjectId.createView(),
                clearValue: uintClear,
                loadOp: 'clear',
                storeOp: 'store',
            });
            colorAttachments.push({
                view,
                clearValue: clearVal,
                loadOp: clearColor ? 'clear' : 'load',
                storeOp: 'store',
            });
        } else {
            colorAttachments.push({
                view,
                clearValue: clearVal,
                loadOp: clearColor ? 'clear' : 'load',
                storeOp: 'store',
            });
        }
        const passDesc: GPURenderPassDescriptor = {
            colorAttachments,
            depthStencilAttachment: this.depthTexture ? {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            } : undefined,
        };
        if (this.verbose && Renderer._passLogCount < DEBUG_PASS_LOGS) {
            Renderer._passLogCount++;
            const n = colorAttachments.length;
            const objSize = this.pickTextures
                ? `${this.pickTextures.idType.width}x${this.pickTextures.idType.height}`
                : 'none';
            console.log('[renderer] _beginPass', {
                passLog: Renderer._passLogCount,
                numAttachments: n,
                attachmentOrder:
                    n === 4
                        ? 'att0-2=r32uint(idType,objectId,subObjectId) att3=swapChain(color)'
                        : 'att0=swapChain',
                viewport: { ...this.viewport },
                swapChainSize: tex.width + 'x' + tex.height,
                pickTextureSize: objSize,
            });
        }
        this.currentPass = this.currentEncoder.beginRenderPass(passDesc);
        this.currentPass.setViewport(
            this.viewport.x, this.viewport.y, this.viewport.w, this.viewport.h,
            0, 1,
        );
    }

    clear(r = 0, g = 0, b = 0): void {
        this._beginPass({ r, g, b, a: 1 });
    }

    fadeScreen(r = 0, g = 0, b = 0, alpha = 0.3): void {
        this._beginPass(null);
        const useDual = this.pickTextures != null;
        this.currentPass!.setPipeline(useDual ? this.quadPipelineDual : this.quadPipeline);
        const quadVerts = new Float32Array([
            -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
        ]);
        const quadBuffer = this.device.createBuffer({
            size: quadVerts.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.queue.writeBuffer(quadBuffer, 0, quadVerts);
        const quadUniformData = new ArrayBuffer(QUAD_UNIFORM_SIZE);
        const quadView = new DataView(quadUniformData);
        quadView.setFloat32(0, alpha, true);
        quadView.setFloat32(4, r, true);
        quadView.setFloat32(8, g, true);
        quadView.setFloat32(12, b, true);
        this.queue.writeBuffer(this.quadUniformBuffer, 0, quadUniformData);
        const quadBindGroup = this.device.createBindGroup({
            layout: this.quadBindGroupLayout,
            entries: [{ binding: 0, resource: { buffer: this.quadUniformBuffer } }],
        });
        this.currentPass!.setBindGroup(0, quadBindGroup);
        this.currentPass!.setVertexBuffer(0, quadBuffer);
        this.currentPass!.draw(6);
        this.buffersToDestroy.push(quadBuffer);
    }

    setCamera(
        fov: number, aspect: number, near: number, far: number,
        eyeX: number, eyeY: number, eyeZ: number,
        targetX = 0, targetY = 0.5, targetZ = 0,
    ): void {
        const proj = perspective(fov, aspect, near, far);
        const view = lookAt(eyeX, eyeY, eyeZ, targetX, targetY, targetZ, 0, 1, 0);
        this.proj.set(proj);
        this.modelView.set(view);
        const lx = eyeX - targetX, ly = eyeY - targetY + 0.5, lz = eyeZ - targetZ;
        const ll = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1;
        this.lightDir[0] = lx / ll;
        this.lightDir[1] = ly / ll;
        this.lightDir[2] = lz / ll;
    }

    setCulling(enable: boolean): void {
        this.cullingEnabled = enable;
    }

    /**
     * Use custom meshes as the plumb-bob (e.g. all meshes from loadGltfMeshes). Pass null or [] to use the default procedural diamond.
     */
    setPlumbBobMeshes(meshes: MeshData[] | null): void {
        this.plumbBobMeshes = meshes?.length ? meshes : null;
    }

    /** Scale multiplier for the plumb-bob (runtime parameter). Default 1. */
    setPlumbBobScale(scale: number): void {
        this.plumbBobScale = scale;
    }

    /**
     * Plumb-bob / solid-mesh shading uses the same `lightDir` as `setCamera` (Sims-style key) but its own
     * ambient and diffuse scale so the diamond stays bright while keeping a little directional shaping.
     */
    setPlumbBobUiLighting(ambient: number, diffuse: number): void {
        this.plumbBobUiAmbient = Math.max(0, ambient);
        this.plumbBobUiDiffuse = Math.max(0, diffuse);
    }

    /**
     * Character mesh lighting (WGSL `ambient` + `diffuseFactor` on the main mesh pass). Defaults 0.25 / 0.75.
     * Plumb-bob UI uses {@link setPlumbBobUiLighting} separately.
     */
    setSceneLighting(ambient: number, diffuseFactor: number): void {
        this.ambient = Math.max(0, ambient);
        this.diffuseFactor = Math.max(0, diffuseFactor);
    }

    /**
     * Tint mixed into lit mesh color when `a > 0` (per draw). Call before each {@link drawMesh} for selection/hover.
     */
    setHighlight(r: number, g: number, b: number, a: number): void {
        this.highlight[0] = r;
        this.highlight[1] = g;
        this.highlight[2] = b;
        this.highlight[3] = Math.max(0, a);
    }

    endFrame(): void {
        this._endFrame();
    }

    drawMesh(
        mesh: MeshData,
        vertices: Vec3[],
        normals: Vec3[],
        texture: TextureHandle | null = null,
        objectId?: { type: ObjectIdType; objectId: number; subObjectId?: number },
    ): void {
        if (!this.currentPass) this._beginPass(null);

        const cached = this.meshCache?.getOrCreate(mesh);

        const textureValid = texture != null && typeof (texture as GPUTexture).createView === 'function';
        if (!textureValid && texture != null) {
            console.warn('[drawMesh] invalid texture handle (missing createView), using dummy', { mesh: mesh.name });
        }
        const texToBind = textureValid ? texture! : null;

        const vertexCount = vertices.length;

        if (this.verbose && !Renderer.loggedMeshes.has(mesh.name)) {
            Renderer.loggedMeshes.add(mesh.name);
            const uvCount = mesh.uvs?.length ?? 0;
            const uvHint = uvCount === 0 ? 'no uvs' : 'uvs ok';
            console.log(
                `[drawMesh] "${mesh.name}" verts=${vertexCount} tris=${mesh.faces.length} hasTex=${!!texToBind} ${uvHint} cached=${!!cached}`,
            );
        }

        const interleaved = new Float32Array(vertexCount * 8);
        for (let i = 0; i < vertexCount; i++) {
            const v = vertices[i];
            const n = normals[i];
            const uv = meshVertexUv(mesh, i);
            if (v && n) {
                interleaved[i * 8 + 0] = v.x;
                interleaved[i * 8 + 1] = v.y;
                interleaved[i * 8 + 2] = v.z;
                interleaved[i * 8 + 3] = n.x;
                interleaved[i * 8 + 4] = n.y;
                interleaved[i * 8 + 5] = n.z;
            } else {
                interleaved[i * 8 + 1] = 0;
                interleaved[i * 8 + 4] = 1;
            }
            interleaved[i * 8 + 6] = uv.x;
            interleaved[i * 8 + 7] = uv.y;
        }
        const uniformData = new ArrayBuffer(UNIFORM_SIZE);
        const view = new DataView(uniformData);
        for (let i = 0; i < 16; i++) view.setFloat32(i * 4, this.proj[i], true);
        for (let i = 0; i < 16; i++) view.setFloat32(64 + i * 4, this.modelView[i], true);
        view.setFloat32(128, this.lightDir[0], true);
        view.setFloat32(132, this.lightDir[1], true);
        view.setFloat32(136, this.lightDir[2], true);
        view.setFloat32(U_MESH_ALPHA, this.alpha, true);
        const useSolidColor = texToBind == null && this.meshSolidVertexPass;
        const fadeR = useSolidColor ? this.fadeColor[0] : FADE_SENTINEL;
        const fadeG = useSolidColor ? this.fadeColor[1] : FADE_SENTINEL;
        const fadeB = useSolidColor ? this.fadeColor[2] : FADE_SENTINEL;
        const hasTexU32 = texToBind ? 1 : 0;
        const solidColorU32 = useSolidColor ? 1 : 0;
        if (this.verbose && Renderer._uniformLogCount < DEBUG_UNIFORM_LOGS && texToBind != null) {
            Renderer._uniformLogCount++;
            const useDualForLog = this.pickTextures != null;
            console.log('[renderer] drawMesh uniform (textured)', {
                mesh: mesh.name,
                uniformLog: Renderer._uniformLogCount,
                fadeR, fadeG, fadeB,
                expectFadeSentinel: fadeR === FADE_SENTINEL && fadeG === FADE_SENTINEL && fadeB === FADE_SENTINEL,
                hasTexture: hasTexU32,
                solidColorMode: solidColorU32,
                useDualPipeline: useDualForLog,
            });
        }
        view.setFloat32(U_MESH_FADE, fadeR, true);
        view.setFloat32(U_MESH_FADE + 4, fadeG, true);
        view.setFloat32(U_MESH_FADE + 8, fadeB, true);
        view.setFloat32(U_MESH_FADE + 12, 0, true);
        view.setUint32(U_MESH_HAS_TEX, hasTexU32, true);
        view.setUint32(U_MESH_SOLID, solidColorU32, true);
        view.setFloat32(U_MESH_AMBIENT, this.ambient, true);
        view.setFloat32(U_MESH_DIFFUSE, this.diffuseFactor, true);
        view.setFloat32(U_MESH_HIGHLIGHT, this.highlight[0], true);
        view.setFloat32(U_MESH_HIGHLIGHT + 4, this.highlight[1], true);
        view.setFloat32(U_MESH_HIGHLIGHT + 8, this.highlight[2], true);
        view.setFloat32(U_MESH_HIGHLIGHT + 12, this.highlight[3], true);
        view.setFloat32(U_PLUMB_BOB_UI_AMBIENT, this.plumbBobUiAmbient, true);
        view.setFloat32(U_PLUMB_BOB_UI_DIFFUSE, this.plumbBobUiDiffuse, true);
        const debugModeU32 = (this.debugSliceMode ?? 0) >>> 0;
        if (this.verbose && debugModeU32 !== 0 && !Renderer._loggedDebugSlice) {
            Renderer._loggedDebugSlice = true;
            console.log('[renderer] debugSlice', debugModeU32, meshFragmentDebugModeLabel(debugModeU32));
        }
        if (this.verbose && Renderer._uniformLogCount <= 1 && texToBind != null) {
            const u8 = new Uint8Array(uniformData);
            const fadeHex = Array.from(u8.slice(U_MESH_FADE, U_MESH_HAS_TEX + 4)).map((b) =>
                b.toString(16).padStart(2, '0'),
            ).join(' ');
            console.log('[renderer] uniform bytes fade(vec4)+flags @144', {
                mesh: mesh.name,
                fadeHex,
                reRead: [
                    view.getFloat32(U_MESH_FADE, true),
                    view.getFloat32(U_MESH_FADE + 4, true),
                    view.getFloat32(U_MESH_FADE + 8, true),
                ],
                hasTex: view.getUint32(U_MESH_HAS_TEX, true),
                solid: view.getUint32(U_MESH_SOLID, true),
            });
        }
        const meshUniformBuffer = this.meshUniformPool!.acquire();
        this.queue.writeBuffer(meshUniformBuffer, 0, uniformData);

        const pickDbg = new ArrayBuffer(16);
        const pdv = new DataView(pickDbg);
        pdv.setUint32(0, debugModeU32, true);
        pdv.setUint32(4, (objectId?.type ?? 0) >>> 0, true);
        pdv.setUint32(8, (objectId?.objectId ?? 0) >>> 0, true);
        pdv.setUint32(12, (objectId?.subObjectId ?? 0) >>> 0, true);
        const pickUniformBuffer = this.pickUniformPool!.acquire();
        this.queue.writeBuffer(pickUniformBuffer, 0, pickDbg);

        const texToUse = texToBind ?? this.dummyTexture;
        const meshBindGroup = this.device.createBindGroup({
            layout: this.meshBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: meshUniformBuffer } },
                { binding: 1, resource: texToUse.createView() },
                { binding: 2, resource: this.defaultSampler },
                { binding: 3, resource: { buffer: pickUniformBuffer } },
            ],
        });

        const useDual = this.pickTextures != null;
        const meshPipe = useDual
            ? (this.cullingEnabled ? this.meshPipeline : this.meshPipelineNoCull)
            : (this.cullingEnabled ? this.meshPipelineSingle : this.meshPipelineNoCullSingle);

        const vb = this.vertexPool!.acquire(interleaved.byteLength);
        this.queue.writeBuffer(vb, 0, interleaved);

        this.currentPass!.setPipeline(meshPipe);
        this.currentPass!.setBindGroup(0, meshBindGroup);
        this.currentPass!.setVertexBuffer(0, vb);

        if (cached) {
            this.currentPass!.setIndexBuffer(cached.indexBuffer, cached.useUint32Index ? 'uint32' : 'uint16');
            this.currentPass!.drawIndexed(cached.indexCount);
        } else {
            const indexData: number[] = [];
            for (const face of mesh.faces) {
                indexData.push(face.a, face.b, face.c);
            }
            const ib = this.device.createBuffer({
                size: indexData.length * 2,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            });
            this.queue.writeBuffer(ib, 0, new Uint16Array(indexData));
            this.currentPass!.setIndexBuffer(ib, 'uint16');
            this.currentPass!.drawIndexed(indexData.length);
            this.buffersToDestroy.push(ib);
        }
    }

    drawDiamond(
        x: number, y: number, z: number,
        size: number, rotY: number,
        r: number, g: number, b: number, alpha = 1.0,
        objectId?: { type: ObjectIdType; objectId: number; subObjectId?: number },
        cancelBoneWorldRotation?: Quat,
    ): void {
        const effectiveSize = size * this.plumbBobScale;
        const meshes = this.plumbBobMeshes?.length
            ? this.plumbBobMeshes
            : [Renderer.getCachedDiamondMesh()];
        const savedAlpha = this.alpha;
        const savedFade = new Float32Array(this.fadeColor);
        this.alpha = alpha;
        this.fadeColor[0] = r;
        this.fadeColor[1] = g;
        this.fadeColor[2] = b;
        this.meshSolidVertexPass = true;
        try {
            for (const mesh of meshes) {
                const { vertices, normals } = cancelBoneWorldRotation
                    ? transformMeshUpright(mesh, x, y, z, cancelBoneWorldRotation, rotY, effectiveSize)
                    : transformMesh(mesh, x, y, z, rotY, effectiveSize);
                this.drawMesh(mesh, vertices, normals, null, objectId);
            }
        } finally {
            this.meshSolidVertexPass = false;
        }
        this.alpha = savedAlpha;
        this.fadeColor.set(savedFade);
    }

    private static _readObjectIdLogCount = 0;
    private static readonly DEBUG_READ_OBJECT_ID_LOGS = 5;

    async readObjectIdAt(screenX: number, screenY: number): Promise<{ type: number; objectId: number; subObjectId: number }> {
        if (!this.pickTextures) return { type: ObjectIdType.NONE, objectId: 0, subObjectId: 0 };
        const w = this.viewport.w;
        const h = this.viewport.h;
        const x = Math.max(0, Math.min(w - 1, Math.floor(screenX) - this.viewport.x));
        const y = Math.max(0, Math.min(h - 1, Math.floor(screenY) - this.viewport.y));

        const bytesPerRow = PICK_READ_BYTES_PER_ROW;
        const buffer = this.device.createBuffer({
            size: bytesPerRow * 3,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
        const encoder = this.device.createCommandEncoder();
        const extent: GPUExtent3D = [1, 1, 1];
        const origin: GPUOrigin3D = [x, y, 0];
        encoder.copyTextureToBuffer(
            { texture: this.pickTextures.idType, origin },
            { buffer, offset: 0, bytesPerRow, rowsPerImage: 1 },
            extent,
        );
        encoder.copyTextureToBuffer(
            { texture: this.pickTextures.objectId, origin },
            { buffer, offset: bytesPerRow, bytesPerRow, rowsPerImage: 1 },
            extent,
        );
        encoder.copyTextureToBuffer(
            { texture: this.pickTextures.subObjectId, origin },
            { buffer, offset: bytesPerRow * 2, bytesPerRow, rowsPerImage: 1 },
            extent,
        );
        this.queue.submit([encoder.finish()]);
        await buffer.mapAsync(GPUMapMode.READ);
        const mapped = buffer.getMappedRange();
        const dv = new DataView(mapped);
        const type = dv.getUint32(0, true);
        const objectId = dv.getUint32(bytesPerRow, true);
        const subObjectId = dv.getUint32(bytesPerRow * 2, true);
        if (this.verbose && Renderer._readObjectIdLogCount < Renderer.DEBUG_READ_OBJECT_ID_LOGS) {
            Renderer._readObjectIdLogCount++;
            const raw = new Uint8Array(mapped);
            const hex = Array.from(raw.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ');
            console.log('[renderer] readObjectIdAt', {
                readLog: Renderer._readObjectIdLogCount,
                screenX, screenY,
                viewport: { ...this.viewport },
                samplePixel: { x, y },
                rawFirst16Hex: hex,
                result: { type, objectId, subObjectId },
            });
        }
        buffer.unmap();
        buffer.destroy();
        return { type, objectId, subObjectId };
    }

    /**
     * Which GPU character-pipeline stages are implemented. When a stage is false, mooshow falls back to CPU.
     */
    getGpuCharacterPipelineCaps(): GpuCharacterPipelineCaps {
        return {
            animation: this.gpuAnimator !== null && this.gpuSkillCache !== null,
            deformation: this.gpuDeformer !== null,
            rasterization: true,
        };
    }

    getGpuLimits(): {
        maxBufferSize: number;
        maxStorageBufferBindingSize: number;
        maxUniformBufferBindingSize: number;
        maxComputeInvocationsPerWorkgroup: number;
        maxComputeWorkgroupSizeX: number;
        maxComputeWorkgroupsPerDimension: number;
    } {
        return {
            maxBufferSize: this.device.limits.maxBufferSize,
            maxStorageBufferBindingSize: this.device.limits.maxStorageBufferBindingSize,
            maxUniformBufferBindingSize: this.device.limits.maxUniformBufferBindingSize,
            maxComputeInvocationsPerWorkgroup: this.device.limits.maxComputeInvocationsPerWorkgroup,
            maxComputeWorkgroupSizeX: this.device.limits.maxComputeWorkgroupSizeX,
            maxComputeWorkgroupsPerDimension: this.device.limits.maxComputeWorkgroupsPerDimension,
        };
    }

    /**
     * Draw a mesh using a pre-computed GPU deformed buffer (6 floats/vertex: px py pz nx ny nz).
     * Positions and normals come from the deformed buffer (slot 0, stride 24).
     * UVs come from the mesh cache (slot 1, stride 8).
     * Zero CPU interleave — the GPU has all the data.
     */
    drawMeshFromGpuDeformed(
        mesh: MeshData,
        deformedBuffer: GPUBuffer,
        texture: TextureHandle | null = null,
        objectId?: { type: ObjectIdType; objectId: number; subObjectId?: number },
        boneBind?: GpuMeshBoneBindContext,
    ): void {
        if (!this.currentPass) this._beginPass(null);
        const cached = this.meshCache?.getOrCreate(mesh, boneBind);
        if (!cached) return;

        const textureValid = texture != null && typeof (texture as GPUTexture).createView === 'function';
        const texToBind = textureValid ? texture! : null;

        const uniformData = new ArrayBuffer(UNIFORM_SIZE);
        const view = new DataView(uniformData);
        for (let i = 0; i < 16; i++) view.setFloat32(i * 4, this.proj[i], true);
        for (let i = 0; i < 16; i++) view.setFloat32(64 + i * 4, this.modelView[i], true);
        view.setFloat32(128, this.lightDir[0], true);
        view.setFloat32(132, this.lightDir[1], true);
        view.setFloat32(136, this.lightDir[2], true);
        view.setFloat32(U_MESH_ALPHA, this.alpha, true);
        const useSolidColor = texToBind == null && this.meshSolidVertexPass;
        view.setFloat32(U_MESH_FADE, useSolidColor ? this.fadeColor[0] : FADE_SENTINEL, true);
        view.setFloat32(U_MESH_FADE + 4, useSolidColor ? this.fadeColor[1] : FADE_SENTINEL, true);
        view.setFloat32(U_MESH_FADE + 8, useSolidColor ? this.fadeColor[2] : FADE_SENTINEL, true);
        view.setFloat32(U_MESH_FADE + 12, 0, true);
        view.setUint32(U_MESH_HAS_TEX, texToBind ? 1 : 0, true);
        view.setUint32(U_MESH_SOLID, useSolidColor ? 1 : 0, true);
        view.setFloat32(U_MESH_AMBIENT, this.ambient, true);
        view.setFloat32(U_MESH_DIFFUSE, this.diffuseFactor, true);
        view.setFloat32(U_MESH_HIGHLIGHT, this.highlight[0], true);
        view.setFloat32(U_MESH_HIGHLIGHT + 4, this.highlight[1], true);
        view.setFloat32(U_MESH_HIGHLIGHT + 8, this.highlight[2], true);
        view.setFloat32(U_MESH_HIGHLIGHT + 12, this.highlight[3], true);
        view.setFloat32(U_PLUMB_BOB_UI_AMBIENT, this.plumbBobUiAmbient, true);
        view.setFloat32(U_PLUMB_BOB_UI_DIFFUSE, this.plumbBobUiDiffuse, true);

        const meshUniformBuffer = this.meshUniformPool!.acquire();
        this.queue.writeBuffer(meshUniformBuffer, 0, uniformData);

        const debugModeU32 = (this.debugSliceMode ?? 0) >>> 0;
        const pickDbg = new ArrayBuffer(16);
        const pdv = new DataView(pickDbg);
        pdv.setUint32(0, debugModeU32, true);
        pdv.setUint32(4, (objectId?.type ?? 0) >>> 0, true);
        pdv.setUint32(8, (objectId?.objectId ?? 0) >>> 0, true);
        pdv.setUint32(12, (objectId?.subObjectId ?? 0) >>> 0, true);
        const pickUniformBuffer = this.pickUniformPool!.acquire();
        this.queue.writeBuffer(pickUniformBuffer, 0, pickDbg);

        const texToUse = texToBind ?? this.dummyTexture;
        const meshBindGroup = this.device.createBindGroup({
            layout: this.meshBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: meshUniformBuffer } },
                { binding: 1, resource: texToUse.createView() },
                { binding: 2, resource: this.defaultSampler },
                { binding: 3, resource: { buffer: pickUniformBuffer } },
            ],
        });

        const useDual = this.pickTextures != null;
        const meshPipe = useDual
            ? (this.cullingEnabled ? this.meshPipelineGpu : this.meshPipelineGpuNoCull)
            : (this.cullingEnabled ? this.meshPipelineGpuSingle : this.meshPipelineGpuNoCullSingle);

        this.currentPass!.setPipeline(meshPipe);
        this.currentPass!.setBindGroup(0, meshBindGroup);
        this.currentPass!.setVertexBuffer(0, deformedBuffer);
        this.currentPass!.setVertexBuffer(1, cached.uvBuffer);
        this.currentPass!.setIndexBuffer(cached.indexBuffer, cached.useUint32Index ? 'uint32' : 'uint16');
        this.currentPass!.drawIndexed(cached.indexCount);
    }

}
