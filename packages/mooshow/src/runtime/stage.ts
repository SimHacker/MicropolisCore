/// <reference types="@webgpu/types" />
import {
    Renderer,
    ObjectIdType,
    updateTransforms,
    deformMesh,
    loadGltfMeshes,
    MESH_FRAGMENT_DEBUG_MODE_MAX,
    mergeCharacterPipelineStages,
    mergePipelineValidationSettings,
    effectivePipelineBackend,
    gpuStageFallbackWarnings,
    defaultGpuCharacterPipelineCaps,
    packBoneTransforms,
    createBoneTransformBuffer,
    compareBoneTransforms,
    compareDeformedVertices,
    DEFORMED_VERTEX_FLOATS,
    BONE_TRANSFORM_FLOATS,
    RepeatMode,
    Practice,
    applyPractices,
    skeletonGpuBindingKey,
    findBone,
} from 'vitamoo';
import type {
    CharacterPipelineStages,
    PipelineValidationSettings,
    GpuCharacterPipelineCaps,
    GpuInstrumentationCallbacks,
    PipelineBuffer,
    CachedSkillGpuData,
    WorldTransformParams,
    PracticeGpuParams,
    GpuMeshBoneBindContext,
} from 'vitamoo';
import { MOO_SHOW_VERTICAL_FOV_DEG } from '../camera-defaults.js';

type ResolvedRenderer = Awaited<ReturnType<typeof Renderer.create>> | null;
type RendererWithDebug = NonNullable<ResolvedRenderer> & { setDebugSlice(mode: number): void };

const SPEED_KEY_SLIDER: Record<string, number> = {
    '1': 25,
    '2': 50,
    '3': 100,
    '4': 150,
    '5': 200,
    '6': 300,
    '7': 500,
    '8': 750,
    '9': 1000,
};
import type { MooShowHooks } from '../hooks/types.js';
import { defaultHooks } from '../hooks/defaults.js';
import { ContentLoader } from './content-loader.js';
import type { ContentIndex, CharacterDef, SceneDef } from './content-loader.js';
import type { Body, Vec3 } from './types.js';
import { SpinController } from '../interaction/spin-controller.js';
import { tickTopPhysics, applyTopTransform, applyTopRotation, topPhysicsToPreRotation, TOP_MAX_TILT } from '../interaction/top-physics.js';
import { SoundEngine } from '../audio/sound-engine.js';

let _stagePickLogCount = 0;
const DEBUG_STAGE_PICK_LOGS = 5;

export interface ValidationAnimRecord {
    bodyIndex: number;
    boneCount: number;
    posMaxErr: number;
    rotMaxErr: number;
    posExceedCount: number;
    rotExceedCount: number;
    ok: boolean;
}

export interface ValidationDeformRecord {
    bodyIndex: number;
    meshIndex: number;
    meshName: string;
    vertexCount: number;
    posMaxErr: number;
    normMaxErr: number;
    posExceedCount: number;
    normExceedCount: number;
    ok: boolean;
}

export interface ValidationSnapshot {
    frame: number;
    animation: ValidationAnimRecord[];
    deformation: ValidationDeformRecord[];
}

export interface StageGpuLimits {
    maxBufferSize: number;
    maxStorageBufferBindingSize: number;
    maxUniformBufferBindingSize: number;
    maxComputeInvocationsPerWorkgroup: number;
    maxComputeWorkgroupSizeX: number;
    maxComputeWorkgroupsPerDimension: number;
}

export interface StageConfig {
    canvas: HTMLCanvasElement;
    hooks?: MooShowHooks;
    assetsBaseUrl?: string;
    /** If set, load this glTF URL as the plumb-bob; all meshes in the file are used. */
    plumbBobUrl?: string;
    /** Scale multiplier for the plumb-bob. Default 1. */
    plumbBobScale?: number;
    /** RGB tint for the plumb-bob (simulation / UI). Default Sims-style green. */
    plumbBobColor?: { r: number; g: number; b: number };
    /**
     * Plumb-bob uses the same light direction as characters but its own ambient/diffuse.
     * Defaults: ambient 0.25, diffuse 1.0 (per ui-overlay-encyclopedia §1.5-1.6).
     */
    plumbBobUiLighting?: { ambient: number; diffuse: number };
    /**
     * Verbose console logging for renderer, texture loads, deformMesh stats, and pick resolution.
     * Default false. Also enable in the browser with URL query `?vitamooVerbose=1` (overridden if this is set).
     */
    verbose?: boolean;
    /** Main character pass: ambient and directional scale (see `Renderer.setSceneLighting`). */
    sceneLighting?: { ambient: number; diffuseFactor: number };
    /** RGBA tint mixed toward selection / hover (see `Renderer.setHighlight`). */
    selectionHighlight?: { r: number; g: number; b: number; a: number };
    hoverHighlight?: { r: number; g: number; b: number; a: number };
    /**
     * Per-stage CPU vs GPU backend for `animation` and `deformation`.
     * Rasterization is always WebGPU (no CPU/WebGL path).
     * Unsupported GPU stages fall back to CPU with a one-time console warning.
     */
    characterPipeline?: Partial<CharacterPipelineStages>;
    /**
     * Optional CPU↔GPU validation (e.g. read back GPU deformation and compare to `deformMesh`).
     * URL `?vitamooPipelineValidation=1` merges `{ enabled: true, compareDeformation: true }`.
     */
    pipelineValidation?: Partial<PipelineValidationSettings>;
    /** Forwarded to `Renderer.create` for GPU allocation telemetry (see vitamoo `gpu-instrumentation.ts`). */
    gpuInstrumentation?: GpuInstrumentationCallbacks;
}

export class MooShowStage {
    readonly canvas: HTMLCanvasElement;
    readonly hooks: MooShowHooks;
    readonly loader: ContentLoader;
    readonly spin: SpinController;
    readonly sound: SoundEngine;

    private _renderer: ResolvedRenderer | Promise<ResolvedRenderer> | null = null;
    private _running = false;
    private _rafId = 0;
    private _animTime = 0;
    private _lastFrameTime = 0;
    private _paused = false;
    private _speedScale = 1.0;
    private _keysHeld = { up: false, down: false, left: false, right: false, leftStart: 0, rightStart: 0 };
    /** Motion trail (fadeScreen): auto = spin+top; off = always clear; force = always fade. */
    private _trailMode: 'auto' | 'off' | 'force' = 'auto';

    private _bodies: Body[] = [];
    private _selectedActor = -1;
    private _activeScene: string | null = null;
    private _activeSceneId: string | null = null;
    private _cameraTarget: Vec3 = { x: 0, y: 2.5, z: 0 };
    private _plumbBobUrl: string | undefined;
    private _plumbBobScale: number;
    private _plumbBobThrobStart = 0;
    private _plumbBobSelectionTime = 0;
    private _plumbBobColor: { r: number; g: number; b: number };
    private _plumbBobUiAmbient: number;
    private _plumbBobUiDiffuse: number;
    private readonly _verbose: boolean;
    private _hoverActor = -1;
    private _lastHoverPickMs = 0;
    private readonly _selHi: { r: number; g: number; b: number; a: number };
    private readonly _hovHi: { r: number; g: number; b: number; a: number };
    private readonly _sceneLighting: StageConfig['sceneLighting'];
    private readonly _gpuInstrumentation: GpuInstrumentationCallbacks | undefined;

    private _characterPipeline: CharacterPipelineStages;
    private _pipelineValidation: PipelineValidationSettings;
    private _gpuCapsCache: GpuCharacterPipelineCaps;
    private _gpuLimitsCache: StageGpuLimits | null = null;
    private readonly _pipelineFallbackKeys = new Set<string>();
    private _validationFrameCounter = 0;
    private _boneTransformBuffers = new Map<number, PipelineBuffer>();
    private _localPosesBuffers = new Map<number, GPUBuffer>();
    private _prioritiesBuffers = new Map<number, GPUBuffer>();
    private _lastValidation: { anim: string | null; deform: string | null; frame: number } = { anim: null, deform: null, frame: 0 };
    private _lastValidationStructured: ValidationSnapshot = { frame: 0, animation: [], deformation: [] };

    constructor(config: StageConfig) {
        this.canvas = config.canvas;
        const urlVerbose =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('vitamooVerbose') === '1';
        const urlPipelineVal =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('vitamooPipelineValidation') === '1';
        const urlDeformGpu =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('vitamooDeformGpu') === '1';
        const urlAnimGpu =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('vitamooAnimGpu') === '1';
        this._verbose = config.verbose ?? urlVerbose;
        this._characterPipeline = mergeCharacterPipelineStages({
            ...config.characterPipeline,
            ...(urlDeformGpu ? { deformation: 'gpu' as const } : {}),
            ...(urlAnimGpu ? { animation: 'gpu' as const } : {}),
        });
        this._pipelineValidation = mergePipelineValidationSettings({
            ...config.pipelineValidation,
            ...(urlPipelineVal ? { enabled: true, compareDeformation: true, compareAnimation: true } : {}),
        });
        this._gpuCapsCache = defaultGpuCharacterPipelineCaps();
        this.hooks = { ...defaultHooks, ...config.hooks };
        this.loader = new ContentLoader(config.assetsBaseUrl ?? '');
        this.spin = new SpinController();
        this.sound = new SoundEngine();
        this._plumbBobUrl = config.plumbBobUrl;
        this._plumbBobScale = config.plumbBobScale ?? 1;
        this._plumbBobColor = config.plumbBobColor ?? { r: 0.2, g: 1.0, b: 0.2 };
        const ui = config.plumbBobUiLighting;
        this._plumbBobUiAmbient = ui?.ambient ?? 0.25;
        this._plumbBobUiDiffuse = ui?.diffuse ?? 1.0;
        this._selHi = config.selectionHighlight ?? { r: 0.25, g: 0.35, b: 0.55, a: 0.28 };
        this._hovHi = config.hoverHighlight ?? { r: 0.2, g: 0.45, b: 0.28, a: 0.18 };
        this._sceneLighting = config.sceneLighting;
        this._gpuInstrumentation = config.gpuInstrumentation;

        this._initRenderer();
        this._bindCanvasEvents();
    }

    private _initRenderer(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        const plumbBobUrl = this._plumbBobUrl;
        this._renderer = Renderer.create(this.canvas, {
            verbose: this._verbose,
            instrumentation: this._gpuInstrumentation,
        }).catch((e) => {
            console.error('WebGPU init failed:', e);
            return null;
        }).then(async (r) => {
            if (r) {
                this._gpuCapsCache = r.getGpuCharacterPipelineCaps();
                this.loader.setTextureFactory(r.getTextureFactory());
                r.setViewport(0, 0, this.canvas.width, this.canvas.height);
                if (plumbBobUrl) {
                    const url = /^https?:\/\//i.test(plumbBobUrl) ? plumbBobUrl : this.loader.baseUrl + plumbBobUrl;
                    try {
                        const meshes = await loadGltfMeshes(url);
                        r.setPlumbBobMeshes(meshes.length > 0 ? meshes : null);
                    } catch (e) {
                        console.warn('Failed to load plumb-bob glTF:', url, e);
                    }
                }
                r.setPlumbBobScale(this._plumbBobScale);
                r.setPlumbBobUiLighting(this._plumbBobUiAmbient, this._plumbBobUiDiffuse);
                const sl = this._sceneLighting;
                if (sl) r.setSceneLighting(sl.ambient, sl.diffuseFactor);
                const ds = new URLSearchParams(window.location.search).get('debugSlice');
                if (ds !== null) {
                    const m = parseInt(ds, 10);
                    if (m >= 0 && m <= MESH_FRAGMENT_DEBUG_MODE_MAX) {
                        (r as RendererWithDebug).setDebugSlice(m);
                        console.log('[stage] debugSlice from URL', m);
                    }
                }
            }
            return r;
        });
    }

    private async _getRenderer(): Promise<ResolvedRenderer | null> {
        if (this._renderer === null) return null;
        if (this._renderer instanceof Promise) {
            this._renderer = await this._renderer;
            if (this._renderer) {
                this._gpuCapsCache = this._renderer.getGpuCharacterPipelineCaps();
                this.loader.setTextureFactory(this._renderer.getTextureFactory());
                this._renderer.setViewport(0, 0, this.canvas.width, this.canvas.height);
                const ds = new URLSearchParams(window.location.search).get('debugSlice');
                if (ds !== null) {
                    const m = parseInt(ds, 10);
                    if (m >= 0 && m <= MESH_FRAGMENT_DEBUG_MODE_MAX)
                        (this._renderer as RendererWithDebug).setDebugSlice(m);
                }
            }
        }
        return this._renderer;
    }

    get contentIndex(): ContentIndex | null { return this.loader.index; }
    get bodies(): Body[] { return this._bodies; }
    get selectedActor(): number { return this._selectedActor; }

    setCharacterPipelineStages(partial: Partial<CharacterPipelineStages>): void {
        this._characterPipeline = mergeCharacterPipelineStages({ ...this._characterPipeline, ...partial });
    }

    setPipelineValidation(partial: Partial<PipelineValidationSettings>): void {
        this._pipelineValidation = mergePipelineValidationSettings({ ...this._pipelineValidation, ...partial });
    }

    getCharacterPipelineStages(): CharacterPipelineStages {
        return { ...this._characterPipeline };
    }

    getPipelineValidation(): PipelineValidationSettings {
        return { ...this._pipelineValidation };
    }

    /** Live pipeline status for debug panel display. */
    getPipelineStatus(): {
        effectiveAnimation: string;
        effectiveDeformation: string;
        gpuCaps: { animation: boolean; deformation: boolean };
        /** WebGPU `Renderer.create()` promise not settled yet. */
        webgpuPending: boolean;
        /** Init finished without a renderer (unsupported GPU, limits, or error). */
        webgpuFailed: boolean;
        gpuLimits: StageGpuLimits | null;
        validationFrame: number;
        validationCadence: number;
        bodyCount: number;
        skillName: string | null;
        elapsed: number;
        animFrame: number;
        animFrames: number;
        lastValidation: { anim: string | null; deform: string | null; frame: number };
        lastValidationStructured: ValidationSnapshot;
    } {
        const practice = this._bodies[0]?.practices?.[0] as any;
        const skill = practice?.skill;
        const frames = skill?.motions?.[0]?.frames ?? 0;
        const elapsed = practice?.elapsed ?? 0;
        const r = this._renderer;
        const webgpuPending = r instanceof Promise;
        const webgpuFailed = r === null;
        return {
            effectiveAnimation: effectivePipelineBackend(this._characterPipeline.animation, this._gpuCapsCache.animation),
            effectiveDeformation: effectivePipelineBackend(this._characterPipeline.deformation, this._gpuCapsCache.deformation),
            gpuCaps: { animation: this._gpuCapsCache.animation, deformation: this._gpuCapsCache.deformation },
            webgpuPending,
            webgpuFailed,
            gpuLimits: this._gpuLimitsCache ? { ...this._gpuLimitsCache } : null,
            validationFrame: this._validationFrameCounter,
            validationCadence: this._pipelineValidation.everyNFrames,
            bodyCount: this._bodies.length,
            skillName: skill?.name ?? null,
            elapsed,
            animFrame: Math.floor(elapsed * frames),
            animFrames: frames,
            lastValidation: { ...this._lastValidation },
            lastValidationStructured: {
                frame: this._lastValidationStructured.frame,
                animation: [...this._lastValidationStructured.animation],
                deformation: [...this._lastValidationStructured.deformation],
            },
        };
    }

    /** Set plumb-bob scale at runtime (default 1). */
    async setPlumbBobScale(scale: number): Promise<void> {
        this._plumbBobScale = scale;
        const r = await this._getRenderer();
        if (r) r.setPlumbBobScale(scale);
    }

    /** RGB tint for the plumb-bob from simulation or UI (applied next frame). */
    setPlumbBobColor(r: number, g: number, b: number): void {
        this._plumbBobColor = { r, g, b };
    }

    get plumbBobColor(): { r: number; g: number; b: number } {
        return { ...this._plumbBobColor };
    }

    /**
     * Bright UI-style plumb-bob shading: same light direction as the scene (`setCamera`), separate ambient/diffuse.
     */
    async setPlumbBobUiLighting(ambient: number, diffuse: number): Promise<void> {
        this._plumbBobUiAmbient = ambient;
        this._plumbBobUiDiffuse = diffuse;
        const ren = await this._getRenderer();
        if (ren) ren.setPlumbBobUiLighting(ambient, diffuse);
    }
    get activeScene(): string | null { return this._activeScene; }
    get activeSceneId(): string | null { return this._activeSceneId; }
    get paused(): boolean { return this._paused; }
    get running(): boolean { return this._running; }

    get scenes(): SceneDef[] { return this.loader.index?.scenes || []; }
    get characters(): CharacterDef[] { return this.loader.index?.characters || []; }
    get skillNames(): string[] { return Object.keys(this.loader.store.skills); }

    async loadContentIndex(url: string, onProgress?: (msg: string) => void): Promise<ContentIndex> {
        const snapshot = this.loader.snapshotState();
        try {
            const idx = await this.loader.loadIndex(url);
            await this.loader.loadAllContent(onProgress);
            return idx;
        } catch (error) {
            this.loader.restoreState(snapshot);
            throw error;
        }
    }

    async setScene(sceneIndex: number): Promise<void> {
        const scenes = this.loader.index?.scenes;
        if (!scenes?.[sceneIndex]) return;

        const newBodies = await this.loader.loadScene(sceneIndex);
        this._destroyBodyGpuScratch();
        this._clearHover();
        this._bodies = newBodies;
        this._activeScene = scenes[sceneIndex].name;
        this._activeSceneId = scenes[sceneIndex].id;
        this._selectedActor = newBodies.length === 1 ? 0 : -1;

        if (newBodies.length > 0) {
            let cx = 0, cz = 0;
            for (const b of newBodies) { cx += b.x; cz += b.z; }
            cx /= newBodies.length; cz /= newBodies.length;
            this._cameraTarget = { x: cx, y: 2.5, z: cz };
        }

        this.hooks.onSceneIdChange?.(this._activeSceneId);
        this.hooks.onSelectionChange?.(this._selectedActor);
        this._renderFrame();
    }

    async setCharacterSolo(charIndex: number): Promise<void> {
        const chars = this.loader.index?.characters;
        if (!chars?.[charIndex]) return;
        this._activeScene = null;
        this._activeSceneId = null;
        const body = await this.loader.loadCharacterBody(chars[charIndex]);
        this._destroyBodyGpuScratch();
        this._clearHover();
        this._bodies = body ? [body] : [];
        this._selectedActor = this._bodies.length === 1 ? 0 : -1;
        if (body) {
            this._computeCameraTarget(body.skeleton);
            this.sound.simlishGreet(0, this._bodies);
        }
        this.hooks.onSceneIdChange?.(null);
        this.hooks.onSelectionChange?.(this._selectedActor);
        this._renderFrame();
    }

    async replaceActorCharacter(actorIndex: number, charIndex: number): Promise<void> {
        const chars = this.loader.index?.characters;
        const prev = this._bodies[actorIndex];
        if (!chars?.[charIndex] || !prev) return;
        const next = await this.loader.loadCharacterBodyReplacing(chars[charIndex], prev);
        if (!next) return;
        this._clearHover();
        this._bodies[actorIndex] = next;
        this.hooks.onSelectionChange?.(this._selectedActor);
        this.sound.simlishGreet(actorIndex, this._bodies);
        this._renderFrame();
    }

    selectActor(idx: number): void {
        if (idx < -1 || idx >= this._bodies.length) return;
        const prev = this._selectedActor;
        if (prev === idx) {
            this.sound.simlishGreet(idx, this._bodies);
            return;
        }

        const rotYDeg = this.spin.rotY;
        if (prev >= 0 && prev < this._bodies.length) {
            this._bodies[prev].spinOffset += rotYDeg;
        } else if (prev < 0) {
            for (const b of this._bodies) b.spinOffset += rotYDeg;
        }
        if (idx >= 0 && idx < this._bodies.length) {
            this._bodies[idx].spinOffset -= rotYDeg;
        } else if (idx < 0) {
            for (const b of this._bodies) b.spinOffset -= rotYDeg;
        }

        for (let i = 0; i < this._bodies.length; i++) {
            const shouldBeActive = (idx < 0 || i === idx);
            if (!shouldBeActive && this._bodies[i].top.active) {
                this._bodies[i].top.tiltTarget = 0;
            }
        }

        const now = performance.now();
        this._plumbBobThrobStart = now;
        if (idx >= 0) this._plumbBobSelectionTime = now;
        this._selectedActor = idx;
        this.hooks.onSelectionChange?.(idx);
        this.sound.simlishGreet(idx, this._bodies);
    }

    async setAnimation(animName: string, actorIndex?: number): Promise<void> {
        const targets = (actorIndex !== undefined && actorIndex >= 0)
            ? [actorIndex]
            : this._bodies.map((_, i) => i);
        for (const i of targets) {
            const body = this._bodies[i];
            if (!body?.skeleton) continue;
            const practice = await this.loader._loadAnimation(animName, body.skeleton);
            if (practice) body.practices = [practice];
            if (body.practices.length > 0 && body.skeleton) {
                this._applyAnimationTick(body, this._animTime > 0 ? this._animTime : 1);
            }
        }
        this._renderFrame();
    }

    /**
     * Add a practice to a body (multi-practice layering).
     * Higher priority practices are applied on top of lower ones.
     * Set opaque=true to occlude lower-priority practices on the same bones.
     */
    async addPractice(
        animName: string,
        actorIndex: number,
        options?: { priority?: number; weight?: number; opaque?: boolean; scale?: number },
    ): Promise<any> {
        const body = this._bodies[actorIndex];
        if (!body?.skeleton) return null;
        const practice = await this.loader._loadAnimation(animName, body.skeleton);
        if (!practice) return null;
        if (options) {
            if (options.priority !== undefined) practice.priority = options.priority;
            if (options.weight !== undefined) practice.weight = options.weight;
            if (options.opaque !== undefined) practice.opaque = options.opaque;
            if (options.scale !== undefined) practice.scale = options.scale;
        }
        body.practices.push(practice);
        this._renderFrame();
        return practice;
    }

    /** Remove a specific practice from a body. */
    removePractice(actorIndex: number, practice: Practice): void {
        const body = this._bodies[actorIndex];
        if (!body) return;
        const idx = body.practices.indexOf(practice);
        if (idx >= 0) body.practices.splice(idx, 1);
    }

    /** Remove all practices from a body. */
    clearPractices(actorIndex: number): void {
        const body = this._bodies[actorIndex];
        if (body) body.practices = [];
    }

    async pick(screenX: number, screenY: number): Promise<number> {
        const renderer = await this._getRenderer();
        if (!renderer || this._bodies.length === 0) return -1;
        const rect = this.canvas.getBoundingClientRect();
        const localX = screenX - rect.left;
        const localY = screenY - rect.top;
        const scaleX = this.canvas.width / (rect.width || 1);
        const scaleY = this.canvas.height / (rect.height || 1);
        const bufferX = localX * scaleX;
        const bufferY = localY * scaleY;
        const { type, objectId } = await renderer.readObjectIdAt(bufferX, bufferY);
        if (type === ObjectIdType.CHARACTER || type === ObjectIdType.PLUMB_BOB) return objectId;
        return -1;
    }

    set speedScale(v: number) { this._speedScale = v; }
    get speedScale(): number { return this._speedScale; }

    togglePause(): void {
        this._paused = !this._paused;
        if (!this._paused) this._lastFrameTime = 0;
    }

    /** Advance one animation tick while paused (single-frame step). */
    stepFrame(ms = 33): void {
        this._paused = true;
        this._animTime += ms * this._speedScale;
        for (const body of this._bodies) {
            if (body.practices.length > 0 && body.skeleton) {
                this._applyAnimationTick(body, this._animTime);
            }
        }
        this._renderFrame();
    }

    start(): void {
        if (this._running) return;
        this._running = true;
        this._lastFrameTime = 0;
        this._rafId = requestAnimationFrame(this._loop);
    }

    stop(): void {
        this._running = false;
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = 0;
    }

    render(): void {
        this._renderFrame();
    }

    destroy(): void {
        this.stop();
        this._destroyBodyGpuScratch();
    }

    private _loop = (timestamp: number): void => {
        if (!this._running) return;
        let needsRender = false;

        if (!this._paused) {
            if (this._lastFrameTime === 0) this._lastFrameTime = timestamp;
            const dt = timestamp - this._lastFrameTime;
            this._lastFrameTime = timestamp;
            this._animTime += dt * this._speedScale;

            for (const body of this._bodies) {
                if (body.practices.length > 0 && body.skeleton) {
                    this._applyAnimationTick(body, this._animTime);
                    needsRender = true;
                }
            }
        }

        if (this.spin.tickMomentum()) {
            if (this._bodies.length > 0) {
                if (this._selectedActor >= 0 && this._selectedActor < this._bodies.length) {
                    this._bodies[this._selectedActor].spinOffset += this.spin.rotationVelocity;
                } else {
                    for (const b of this._bodies) b.spinOffset += this.spin.rotationVelocity;
                }
            } else {
                this.spin.rotY += this.spin.rotationVelocity;
                if (this.spin.rotY > 360) this.spin.rotY -= 360;
                if (this.spin.rotY < 0) this.spin.rotY += 360;
            }
            needsRender = true;
        }

        for (const b of this._bodies) {
            if (Math.abs(b.spinVelocity) > 0.001) {
                b.spinOffset += b.spinVelocity;
                b.spinVelocity *= 0.993;
                needsRender = true;
            }
        }

        const rv = this.spin.rotationVelocity;
        const saved = this.spin.rotationVelocity;
        for (let i = 0; i < this._bodies.length; i++) {
            const isSelected = (this._selectedActor < 0 || i === this._selectedActor);
            if (isSelected) {
                tickTopPhysics(this._bodies[i].top, rv);
            } else if (this._bodies[i].top.active) {
                tickTopPhysics(this._bodies[i].top, 0);
            }
        }
        this.spin.rotationVelocity = saved;

        const anyTopActive = this._bodies.some(b => b.top.active);
        if (anyTopActive) needsRender = true;

        if (this._keysHeld.up || this._keysHeld.down) {
            const zoomDelta = this._keysHeld.down ? 1.5 : -1.5;
            this.spin.zoom = Math.max(15, Math.min(400, this.spin.zoom + zoomDelta));
            this._emitOrbitViewSync();
            needsRender = true;
        }
        if (this._keysHeld.left || this._keysHeld.right) {
            const now = performance.now();
            const dir = this._keysHeld.left ? 1 : -1;
            const holdTime = this._keysHeld.left
                ? (now - this._keysHeld.leftStart) / 1000
                : (now - this._keysHeld.rightStart) / 1000;
            const speed = 0.5 + Math.min(holdTime * 5.0, 16.0);
            this.spin.rotationVelocity = dir * speed;
            needsRender = true;
        }

        this.sound.updateSpinSound(this.spin.rotationVelocity, this._bodies, this._selectedActor);

        this.hooks.onAnimationTick?.(this._animTime);
        if (needsRender) this._renderFrame();

        this._rafId = requestAnimationFrame(this._loop);
    };

    private _parseDebugSliceFromUrl(): number | null {
        const ds = new URLSearchParams(window.location.search).get('debugSlice');
        if (ds === null) return null;
        const m = parseInt(ds, 10);
        return m >= 0 && m <= MESH_FRAGMENT_DEBUG_MODE_MAX ? m : null;
    }

    private _effectiveDebugSlice(): number {
        return this._parseDebugSliceFromUrl() ?? 0;
    }

    private _emitOrbitViewSync(): void {
        this.hooks.onOrbitViewChange?.({
            rotY: this.spin.rotY,
            rotX: this.spin.rotX,
            zoom: this.spin.zoom,
        });
    }

    private _clearHover(): void {
        if (this._hoverActor === -1) return;
        this._hoverActor = -1;
        this.hooks.onHover?.(null);
        this.hooks.onHighlight?.(null);
    }

    private _applyActorHighlight(renderer: NonNullable<ResolvedRenderer>, bi: number): void {
        const h = this._hoverActor;
        if (h >= 0 && bi === h) {
            const t = (bi === this._selectedActor) ? this._selHi : this._hovHi;
            renderer.setHighlight(t.r, t.g, t.b, t.a);
        } else {
            renderer.setHighlight(0, 0, 0, 0);
        }
    }

    private _scheduleHoverPick(e: MouseEvent): void {
        const now = performance.now();
        if (now - this._lastHoverPickMs < 90) return;
        this._lastHoverPickMs = now;
        void this._updateHoverAtClient(e.clientX, e.clientY);
    }

    private _logPipelineFallbackOnce(key: string, message: string): void {
        if (this._pipelineFallbackKeys.has(key)) return;
        this._pipelineFallbackKeys.add(key);
        console.warn('[MooShowStage pipeline]', message);
    }

    private _destroyBodyGpuScratch(): void {
        for (const buf of this._boneTransformBuffers.values()) buf.destroy();
        this._boneTransformBuffers.clear();
        for (const buf of this._localPosesBuffers.values()) buf.destroy();
        this._localPosesBuffers.clear();
        for (const buf of this._prioritiesBuffers.values()) buf.destroy();
        this._prioritiesBuffers.clear();
    }

    private _applyAnimationTick(body: Body, animTime: number): void {
        if (!body.skeleton || body.practices.length === 0) return;
        applyPractices(body.practices, body.skeleton, animTime);
        updateTransforms(body.skeleton);
    }

    private async _updateHoverAtClient(clientX: number, clientY: number): Promise<void> {
        const renderer = await this._getRenderer();
        if (!renderer || this._bodies.length === 0) return;
        const rect = this.canvas.getBoundingClientRect();
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;
        const scaleX = this.canvas.width / (rect.width || 1);
        const scaleY = this.canvas.height / (rect.height || 1);
        const bufferX = localX * scaleX;
        const bufferY = localY * scaleY;
        const { type, objectId } = await renderer.readObjectIdAt(bufferX, bufferY);
        const picked =
            type === ObjectIdType.CHARACTER || type === ObjectIdType.PLUMB_BOB ? objectId : -1;
        if (picked === this._hoverActor) return;
        this._hoverActor = picked;
        this.hooks.onHover?.(picked >= 0 ? picked : null);
        this.hooks.onHighlight?.(picked >= 0 ? picked : null);
        this._renderFrame();
    }

    private async _renderFrame(): Promise<void> {
        const renderer = await this._getRenderer();
        if (!renderer) return;

        this._gpuCapsCache = renderer.getGpuCharacterPipelineCaps();
        this._gpuLimitsCache = renderer.getGpuLimits();
        for (const w of gpuStageFallbackWarnings(this._characterPipeline, this._gpuCapsCache)) {
            this._logPipelineFallbackOnce(w, w);
        }
        const validateThisFrame = this._pipelineValidation.enabled &&
            (++this._validationFrameCounter % Math.max(1, this._pipelineValidation.everyNFrames)) === 0;
        const tapAnim = validateThisFrame && this._pipelineValidation.compareAnimation;
        const tapDeform = validateThisFrame && this._pipelineValidation.compareDeformation;
        const slice = this._effectiveDebugSlice();
        (renderer as RendererWithDebug).setDebugSlice(slice);

        const spinSpeed = Math.abs(this.spin.rotationVelocity);
        const anyActive = this._bodies.some(b => b.top.active);
        const useFadeTrail =
            this._trailMode === 'force' ||
            (this._trailMode === 'auto' && anyActive && spinSpeed > 1.0 && slice === 0);

        if (useFadeTrail) {
            const trailLength = this._trailMode === 'force'
                ? 0.22
                : Math.max(0.08, 0.4 - spinSpeed * 0.02);
            renderer.fadeScreen(0, 0, 0, trailLength);
        } else {
            renderer.clear();
        }

        const zoom = this.spin.zoom / 10;
        const rotYRad = this.spin.rotY * Math.PI / 180;
        const rotXRad = this.spin.rotX * Math.PI / 180;
        const cosX = Math.cos(rotXRad);

        const eyeX = Math.sin(rotYRad) * cosX * zoom;
        const eyeY = this._cameraTarget.y + Math.sin(rotXRad) * zoom;
        const eyeZ = Math.cos(rotYRad) * cosX * zoom;

        renderer.setCamera(MOO_SHOW_VERTICAL_FOV_DEG, this.canvas.width / this.canvas.height, 0.01, 100,
            eyeX, eyeY, eyeZ,
            this._cameraTarget.x, this._cameraTarget.y, this._cameraTarget.z);

        const deformBackend = effectivePipelineBackend(
            this._characterPipeline.deformation,
            this._gpuCapsCache.deformation,
        );
        const animBackend = effectivePipelineBackend(
            this._characterPipeline.animation,
            this._gpuCapsCache.animation,
        );

        type AnimWork = {
            bi: number;
            boneCount: number;
            hierarchyBuffer: GPUBuffer;
            depthOrderBuffer: GPUBuffer;
            depthOffsetsBuffer: GPUBuffer;
            depthLayerCount: number;
            localPosesBuffer: GPUBuffer;
            prioritiesBuffer: GPUBuffer;
            worldBuffer: GPUBuffer;
            practices: { cached: CachedSkillGpuData; params: PracticeGpuParams }[];
        };
        type GpuBodyWork = {
            bi: number;
            body: Body;
            bTop: Body['top'];
            cosD: number;
            sinD: number;
            boneGpuBuffer: GPUBuffer;
            meshBoneBind: GpuMeshBoneBindContext;
            gpuDeformedBuffers: (GPUBuffer | null)[];
        };

        const device = renderer.getDevice();
        const queue = renderer.getQueue();
        const animWorks: AnimWork[] = [];
        const gpuBodyWorks: GpuBodyWork[] = [];
        const gpuDeformedByBody = new Map<number, (GPUBuffer | null)[]>();
        const gpuMeshBoneBindByBody = new Map<number, GpuMeshBoneBindContext>();

        if (deformBackend === 'gpu') {
            for (let bi = 0; bi < this._bodies.length; bi++) {
                const body = this._bodies[bi];
                if (!body.skeleton) continue;

                const bTop = body.top;
                const spinDeg = (body.direction || 0) + (body.spinOffset || 0);
                const bodyDir = spinDeg * Math.PI / 180;
                const cosD = Math.cos(bodyDir);
                const sinD = Math.sin(bodyDir);

                let btBuf = this._boneTransformBuffers.get(bi);
                if (!btBuf || btBuf.floatCount < body.skeleton.length * BONE_TRANSFORM_FLOATS) {
                    btBuf?.destroy();
                    btBuf = createBoneTransformBuffer(
                        body.skeleton.length,
                        `bones-body${bi}`,
                        this._gpuInstrumentation,
                    );
                    this._boneTransformBuffers.set(bi, btBuf);
                }

                const boneCount = body.skeleton.length;
                let boneGpuBuffer: GPUBuffer | null = null;
                const useGpuAnim = animBackend === 'gpu'
                    && body.practices.length > 0
                    && body.skeletonBoneData;

                if (useGpuAnim) {
                    const skillCache = renderer.getGpuSkillCache();
                    if (skillCache) {
                        if (!body.boneNameToIndex) {
                            const map = new Map<string, number>();
                            for (let i = 0; i < boneCount; i++) {
                                map.set(body.skeleton[i].name, i);
                            }
                            body.boneNameToIndex = map;
                        }
                        const boneNameToIndex = body.boneNameToIndex;

                        const gpuPractices: { cached: CachedSkillGpuData; params: PracticeGpuParams }[] = [];
                        let firstCached: CachedSkillGpuData | null = null;
                        for (const p of body.practices) {
                            if (!p.skill) continue;
                            const cached = skillCache.getOrCreate(p.skill, body.skeletonBoneData!, boneNameToIndex);
                            if (!firstCached) firstCached = cached;
                            gpuPractices.push({
                                cached,
                                params: {
                                    elapsed: p.elapsed,
                                    weight: p.weight,
                                    priority: p.priority,
                                    opaque: p.opaque,
                                    motionCount: cached.motionCount,
                                    boneCount,
                                    mixRootTranslation: p.mixRootTranslation,
                                    mixRootRotation: p.mixRootRotation,
                                },
                            });
                        }

                        if (gpuPractices.length > 0 && firstCached) {
                            gpuPractices.sort((a, b) => a.params.priority - b.params.priority);
                            const localBytes = boneCount * BONE_TRANSFORM_FLOATS * 4;
                            let localBuf = this._localPosesBuffers.get(bi);
                            if (!localBuf || localBuf.size < localBytes) {
                                localBuf?.destroy();
                                localBuf = device.createBuffer({
                                    label: `local-poses-${bi}`,
                                    size: Math.max(localBytes, 16),
                                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
                                });
                                this._localPosesBuffers.set(bi, localBuf);
                            }

                            const priBytes = boneCount * 4;
                            let priBuf = this._prioritiesBuffers.get(bi);
                            if (!priBuf || priBuf.size < priBytes) {
                                priBuf?.destroy();
                                priBuf = device.createBuffer({
                                    label: `priorities-${bi}`,
                                    size: Math.max(priBytes, 16),
                                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
                                });
                                this._prioritiesBuffers.set(bi, priBuf);
                            }

                            const gpuBuf = btBuf.ensureGpu(device, queue);
                            btBuf.gpuDidWrite();
                            boneGpuBuffer = gpuBuf;
                            animWorks.push({
                                bi,
                                boneCount,
                                hierarchyBuffer: firstCached.hierarchyBuffer,
                                depthOrderBuffer: firstCached.depthOrderBuffer,
                                depthOffsetsBuffer: firstCached.depthOffsetsBuffer,
                                depthLayerCount: firstCached.depthLayerCount,
                                localPosesBuffer: localBuf,
                                prioritiesBuffer: priBuf,
                                worldBuffer: gpuBuf,
                                practices: gpuPractices,
                            });
                        }
                    }
                }

                if (!boneGpuBuffer) {
                    packBoneTransforms(body.skeleton, btBuf.cpu);
                    btBuf.cpuDidWrite();
                    boneGpuBuffer = btBuf.ensureGpu(device, queue);
                }

                if (!body.boneNameToIndex) {
                    const map = new Map<string, number>();
                    for (let i = 0; i < boneCount; i++) {
                        map.set(body.skeleton[i].name, i);
                    }
                    body.boneNameToIndex = map;
                }
                const meshBoneBind: GpuMeshBoneBindContext = {
                    cacheKey: skeletonGpuBindingKey(body.skeleton, body.boneNameToIndex),
                    boneNameToSkeletonIndex: body.boneNameToIndex,
                };
                gpuMeshBoneBindByBody.set(bi, meshBoneBind);

                gpuBodyWorks.push({
                    bi,
                    body,
                    bTop,
                    cosD,
                    sinD,
                    boneGpuBuffer,
                    meshBoneBind,
                    gpuDeformedBuffers: [],
                });
            }

            if (gpuBodyWorks.length > 0) {
                const computeEncoder = renderer.createComputeEncoder();

                // Phase-batched animation pass:
                //   init all bodies -> apply layer N across all bodies -> propagate all.
                for (const work of animWorks) {
                    renderer.encodeMultiPracticeGpuInit(
                        computeEncoder,
                        work.hierarchyBuffer,
                        work.localPosesBuffer,
                        work.prioritiesBuffer,
                        work.boneCount,
                    );
                }

                let maxPracticeLayers = 0;
                for (const work of animWorks) {
                    if (work.practices.length > maxPracticeLayers) maxPracticeLayers = work.practices.length;
                }
                for (let layer = 0; layer < maxPracticeLayers; layer++) {
                    // Bucket by CachedSkillGpuData identity so bodies sharing
                    // a skill dispatch together, maximizing bind-group cache
                    // hits and GPU data-cache locality for keyframe buffers.
                    const buckets = new Map<CachedSkillGpuData, AnimWork[]>();
                    for (const work of animWorks) {
                        const practice = work.practices[layer];
                        if (!practice) continue;
                        let bucket = buckets.get(practice.cached);
                        if (!bucket) {
                            bucket = [];
                            buckets.set(practice.cached, bucket);
                        }
                        bucket.push(work);
                    }
                    for (const [cached, works] of buckets) {
                        for (const work of works) {
                            const practice = work.practices[layer]!;
                            renderer.encodeMultiPracticeGpuApply(
                                computeEncoder,
                                cached,
                                practice.params,
                                work.localPosesBuffer,
                                work.prioritiesBuffer,
                            );
                        }
                    }
                }

                for (const work of animWorks) {
                    renderer.encodeMultiPracticeGpuPropagate(
                        computeEncoder,
                        work.localPosesBuffer,
                        work.hierarchyBuffer,
                        work.depthOrderBuffer,
                        work.depthOffsetsBuffer,
                        work.worldBuffer,
                        work.boneCount,
                        work.depthLayerCount,
                    );
                }

                if (tapAnim) {
                    for (const work of gpuBodyWorks) {
                        const bytes = work.body.skeleton ? work.body.skeleton.length * BONE_TRANSFORM_FLOATS * 4 : 0;
                        if (bytes <= 0) continue;
                        const tap = renderer.getTapBuffer(`bones-${work.bi}`, bytes);
                        computeEncoder.copyBufferToBuffer(work.boneGpuBuffer, 0, tap, 0, bytes);
                    }
                }

                for (const work of gpuBodyWorks) {
                    try {
                        const pre = topPhysicsToPreRotation(work.bTop, this._cameraTarget.y);
                        let mi = 0;
                        for (const { mesh } of work.body.meshes) {
                            const deformedBuf = renderer.encodeDeformMeshGpu(
                                computeEncoder,
                                mesh,
                                work.boneGpuBuffer,
                                work.meshBoneBind,
                            );
                            work.gpuDeformedBuffers.push(deformedBuf);

                            if (tapDeform && deformedBuf) {
                                const bytes = mesh.vertices.length * DEFORMED_VERTEX_FLOATS * 4;
                                const tap = renderer.getTapBuffer(`deform-${work.bi}-${mi}`, bytes);
                                computeEncoder.copyBufferToBuffer(deformedBuf, 0, tap, 0, bytes);
                            }

                            if (deformedBuf) {
                                const wtp: WorldTransformParams = {
                                    bodyRotCos: work.cosD,
                                    bodyRotSin: work.sinD,
                                    bodyX: work.body.x,
                                    bodyZ: work.body.z,
                                    preActive: pre.active,
                                    pivotY: pre.pivotY,
                                    preTransX: pre.transX,
                                    preTransZ: pre.transZ,
                                    preRotation: pre.rotation,
                                    scale: work.body.scale,
                                    vertexCount: mesh.vertices.length,
                                };
                                renderer.encodeWorldTransformGpu(computeEncoder, deformedBuf, wtp);
                            }
                            mi++;
                        }
                    } catch (e) {
                        console.warn(`[stage] GPU deform encode failed: body ${work.bi}`, e);
                    }
                    gpuDeformedByBody.set(work.bi, work.gpuDeformedBuffers);
                }

                try {
                    renderer.submitComputeEncoder(computeEncoder);
                } catch (e) {
                    console.warn('[stage] GPU compute submit failed — bodies may fall back to CPU', e);
                }
            }
        }

        for (let bi = 0; bi < this._bodies.length; bi++) {
            this._applyActorHighlight(renderer, bi);
            const body = this._bodies[bi];
            const bTop = body.top;
            const spinDeg = (body.direction || 0) + (body.spinOffset || 0);
            const bodyDir = spinDeg * Math.PI / 180;
            const cosD = Math.cos(bodyDir);
            const sinD = Math.sin(bodyDir);
            const gpuDeformedBuffers = gpuDeformedByBody.get(bi) ?? [];
            const gpuMeshBoneBind = gpuMeshBoneBindByBody.get(bi);

            let meshIndex = 0;
            for (const { mesh, boneMap, texture } of body.meshes) {
                try {
                    const gpuDeformedBuffer = gpuDeformedBuffers[meshIndex] ?? null;
                    if (gpuDeformedBuffer && gpuMeshBoneBind) {
                        renderer.drawMeshFromGpuDeformed(mesh, gpuDeformedBuffer, texture || null, {
                            type: ObjectIdType.CHARACTER,
                            objectId: bi,
                            subObjectId: meshIndex,
                        }, gpuMeshBoneBind);
                    } else {
                        let verts: any[];
                        let norms: any[];
                        if (body.skeleton) {
                            const deformed = deformMesh(mesh, body.skeleton, boneMap, { verbose: this._verbose });
                            verts = deformed.vertices;
                            norms = deformed.normals;
                        } else {
                            verts = mesh.vertices;
                            norms = mesh.normals;
                        }

                        if (bTop.active) {
                            verts = verts.map((v: any) => applyTopTransform(v, bTop, this._cameraTarget.y));
                            norms = norms.map((v: any) => applyTopRotation(v, bTop));
                        }

                        const s = body.scale;
                        if (s !== 1) {
                            verts = verts.map((v: any) => v ? { x: v.x * s, y: v.y * s, z: v.z * s } : v);
                        }

                        if (body.x !== 0 || body.z !== 0 || bodyDir !== 0) {
                            verts = verts.map((v: any) => {
                                if (!v) return v;
                                const rx = v.x * cosD - v.z * sinD;
                                const rz = v.x * sinD + v.z * cosD;
                                return { x: rx + body.x, y: v.y, z: rz + body.z };
                            });
                            if (bodyDir !== 0) {
                                norms = norms.map((v: any) => {
                                    if (!v) return v;
                                    return { x: v.x * cosD - v.z * sinD, y: v.y, z: v.x * sinD + v.z * cosD };
                                });
                            }
                        }

                        renderer.drawMesh(mesh, verts, norms, texture || null, {
                            type: ObjectIdType.CHARACTER,
                            objectId: bi,
                            subObjectId: meshIndex,
                        });
                    }
                } catch (e) {
                    console.warn(`[stage] mesh draw failed: body ${bi} mesh ${meshIndex}`, mesh?.name, e);
                }
                meshIndex++;
            }
        }

        if (tapAnim || tapDeform) {
            this._lastValidation.frame = this._validationFrameCounter;
            this._lastValidation.anim = null;
            this._lastValidation.deform = null;
            const structured: ValidationSnapshot = {
                frame: this._validationFrameCounter,
                animation: [],
                deformation: [],
            };
            this._lastValidationStructured = structured;
            const shouldThrow = this._pipelineValidation.throwOnMismatch;

            for (let bi = 0; bi < this._bodies.length; bi++) {
                const body = this._bodies[bi];
                if (!body.skeleton) continue;

                if (tapAnim) {
                    const gpuData = await renderer.readbackTap(`bones-${bi}`);
                    if (gpuData) {
                        const cmp = compareBoneTransforms(body.skeleton, gpuData, this._pipelineValidation.maxAbsError);
                        const msg = cmp.posExceedCount > 0 || cmp.rotExceedCount > 0
                            ? `body${bi}: pos ${cmp.posExceedCount}/${cmp.boneCount} rot ${cmp.rotExceedCount}/${cmp.boneCount} maxP=${cmp.posMaxErr.toExponential(2)} maxR=${cmp.rotMaxErr.toExponential(2)}`
                            : `body${bi}: OK maxP=${cmp.posMaxErr.toExponential(2)} maxR=${cmp.rotMaxErr.toExponential(2)}`;
                        this._lastValidation.anim = msg;
                        const animOk = cmp.posExceedCount === 0 && cmp.rotExceedCount === 0;
                        structured.animation.push({
                            bodyIndex: bi,
                            boneCount: cmp.boneCount,
                            posMaxErr: cmp.posMaxErr,
                            rotMaxErr: cmp.rotMaxErr,
                            posExceedCount: cmp.posExceedCount,
                            rotExceedCount: cmp.rotExceedCount,
                            ok: animOk,
                        });
                        if (!animOk) {
                            console.warn(`[tap:anim] ${msg}`);
                            if (shouldThrow) throw new Error(`[tap:anim] ${msg}`);
                        } else if (this._verbose) {
                            console.log(`[tap:anim] ${msg}`);
                        }
                    }
                }

                if (tapDeform) {
                    let mi = 0;
                    for (const { mesh, boneMap } of body.meshes) {
                        const gpuData = await renderer.readbackTap(`deform-${bi}-${mi}`);
                        if (gpuData) {
                            const deformed = deformMesh(mesh, body.skeleton!, boneMap, { verbose: false });
                            const cmp = compareDeformedVertices(deformed.vertices, deformed.normals, gpuData, this._pipelineValidation.maxAbsError);
                            const msg = cmp.posExceedCount > 0 || cmp.normExceedCount > 0
                                ? `body${bi}/${mesh.name}: pos ${cmp.posExceedCount}/${cmp.vertexCount} norm ${cmp.normExceedCount}/${cmp.vertexCount} maxP=${cmp.posMaxErr.toExponential(2)} maxN=${cmp.normMaxErr.toExponential(2)}`
                                : `body${bi}/${mesh.name}: OK maxP=${cmp.posMaxErr.toExponential(2)} maxN=${cmp.normMaxErr.toExponential(2)}`;
                            this._lastValidation.deform = msg;
                            const deformOk = cmp.posExceedCount === 0 && cmp.normExceedCount === 0;
                            structured.deformation.push({
                                bodyIndex: bi,
                                meshIndex: mi,
                                meshName: mesh.name,
                                vertexCount: cmp.vertexCount,
                                posMaxErr: cmp.posMaxErr,
                                normMaxErr: cmp.normMaxErr,
                                posExceedCount: cmp.posExceedCount,
                                normExceedCount: cmp.normExceedCount,
                                ok: deformOk,
                            });
                            if (!deformOk) {
                                console.warn(`[tap:deform] ${msg}`);
                                if (shouldThrow) throw new Error(`[tap:deform] ${msg}`);
                            } else if (this._verbose) {
                                console.log(`[tap:deform] ${msg}`);
                            }
                        }
                        mi++;
                    }
                }
            }
        }

        if (this._bodies.length > 0) {
            renderer.setHighlight(0, 0, 0, 0);
            const now = performance.now();
            // Plumb-bob spin is wall-clock UI (Sims-style diamond keeps rotating); pause only freezes sim bob.
            const plumbRot = now * 0.001 * Math.PI;
            const bob = this._paused ? 0 : Math.sin(now * 0.002) * 0.12;
            const RISE_MS = 120;
            const THROB_MS = 220;
            const THROB_AMP = 0.18;
            const riseT = this._plumbBobSelectionTime
                ? Math.min(1, (now - this._plumbBobSelectionTime) / RISE_MS)
                : 1;
            const riseFactor = 1 - (1 - riseT) * (1 - riseT);
            const throbElapsed = now - this._plumbBobThrobStart;
            const throbScale = throbElapsed < THROB_MS
                ? 1 + THROB_AMP * Math.sin((throbElapsed / THROB_MS) * Math.PI)
                : 1;
            const basePlumbSize = 0.18;
            const indicesToDraw = (this._selectedActor >= 0 && this._selectedActor < this._bodies.length)
                ? [this._selectedActor]
                : this._bodies.map((_, i) => i);

            const drawPlumbBob = (bi: number, body: Body) => {
                if (!body.skeleton) return;
                const headBone = findBone(body.skeleton, 'HEAD');
                if (!headBone) return;
                const bTop = body.top;
                const sd = (body.direction || 0) + (body.spinOffset || 0);
                const dir = sd * Math.PI / 180;
                const cosD = Math.cos(dir), sinD = Math.sin(dir);
                let hx = headBone.worldPosition.x, hy = headBone.worldPosition.y, hz = headBone.worldPosition.z;
                if (bTop.active) {
                    const t = applyTopTransform({ x: hx, y: hy, z: hz }, bTop, this._cameraTarget.y);
                    hx = t.x; hy = t.y; hz = t.z;
                }
                const rx = hx * cosD - hz * sinD;
                const rz = hx * sinD + hz * cosD;
                const isSelected = bi === this._selectedActor;
                const yOffset = (1.5 + bob) * (isSelected ? riseFactor : 1);
                const size = basePlumbSize * (isSelected ? throbScale : 1);
                const c = this._plumbBobColor;
                // Diamond verts are world-up Y; only plumbRot (Y spin) applies. headBone.worldRotation inverse
                // is for bone-local meshes and tipped the bob 90°.
                renderer.drawDiamond(
                    rx + body.x, hy + yOffset, rz + body.z, size, plumbRot, c.r, c.g, c.b, 0.9,
                    { type: ObjectIdType.PLUMB_BOB, objectId: bi },
                );
                this.hooks.onPlumbBobChange?.(bi, true);
            };

            for (const bi of indicesToDraw) {
                drawPlumbBob(bi, this._bodies[bi]);
            }
        }

        renderer.endFrame();

        // Deformed output buffers are persistent in the mesh cache — nothing to destroy per frame.
    }

    private _computeCameraTarget(skeleton: any[] | null): void {
        if (!skeleton || skeleton.length === 0) {
            this._cameraTarget = { x: 0, y: 2.5, z: 0 };
            return;
        }
        let minY = Infinity, maxY = -Infinity;
        for (const bone of skeleton) {
            const y = bone.worldPosition.y;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        this._cameraTarget = { x: 0, y: (minY + maxY) / 2, z: 0 };
    }

    private _bindCanvasEvents(): void {
        const c = this.canvas;
        c.addEventListener('contextmenu', e => e.preventDefault());
        c.style.cursor = 'grab';

        c.addEventListener('mousedown', async (e: MouseEvent) => {
            this.sound.ensureAudio();
            this.spin.startDrag(e.clientX, e.clientY, e.button, e.shiftKey);
            c.style.cursor = 'grabbing';

            if (e.button === 0 && this._bodies.length > 0) {
                const renderer = await this._getRenderer();
                if (renderer) {
                    const rect = this.canvas.getBoundingClientRect();
                    const localX = e.clientX - rect.left;
                    const localY = e.clientY - rect.top;
                    const scaleX = this.canvas.width / (rect.width || 1);
                    const scaleY = this.canvas.height / (rect.height || 1);
                    const bufferX = localX * scaleX;
                    const bufferY = localY * scaleY;
                    const { type, objectId, subObjectId } = await renderer.readObjectIdAt(bufferX, bufferY);
                    const picked = (type === ObjectIdType.CHARACTER || type === ObjectIdType.PLUMB_BOB) ? objectId : -1;
                    if (this._verbose) {
                        console.log('[stage] pick', {
                            type,
                            objectId,
                            subObjectId,
                            picked,
                            character: ObjectIdType.CHARACTER,
                            plumbBob: ObjectIdType.PLUMB_BOB,
                            action: picked >= 0 ? 'selectActor' : (this._bodies.length > 1 ? 'clearSelection' : 'miss'),
                        });
                        if (_stagePickLogCount < DEBUG_STAGE_PICK_LOGS) {
                            _stagePickLogCount++;
                            console.log('[stage] mousedown pick detail', {
                                rectW: rect.width, rectH: rect.height,
                                canvasW: this.canvas.width, canvasH: this.canvas.height,
                                localX, localY, scaleX, scaleY, bufferX, bufferY,
                            });
                        }
                    }
                    if (picked >= 0) {
                        this.selectActor(picked);
                        this.hooks.onPick?.(picked, e.clientX, e.clientY);
                    } else if (this._bodies.length > 1) {
                        this.selectActor(-1);
                    }
                } else if (this._bodies.length > 1) {
                    this.selectActor(-1);
                }
            }
            e.preventDefault();
        });

        c.addEventListener('mousemove', (e: MouseEvent) => {
            if (this.spin.isDragging) return;
            if (this._bodies.length === 0) return;
            this._scheduleHoverPick(e);
        });

        c.addEventListener('mouseleave', () => {
            if (this._hoverActor === -1) return;
            this._clearHover();
            this._renderFrame();
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.spin.isDragging) return;
            const { spinDelta, zoomDelta, tiltDelta, isOrbit } = this.spin.drag(e.clientX, e.clientY);

            if (this._bodies.length > 0 && !isOrbit) {
                if (this._selectedActor >= 0 && this._selectedActor < this._bodies.length) {
                    this._bodies[this._selectedActor].spinOffset += spinDelta;
                } else {
                    for (const b of this._bodies) b.spinOffset += spinDelta;
                }
            } else {
                this.spin.rotY += spinDelta;
                if (this.spin.rotY > 360) this.spin.rotY -= 360;
                if (this.spin.rotY < 0) this.spin.rotY += 360;
            }

            this.spin.zoom = Math.max(15, Math.min(400, this.spin.zoom + zoomDelta));
            this.spin.rotX = Math.max(-89, Math.min(89, this.spin.rotX + tiltDelta));
            this._emitOrbitViewSync();
            this._renderFrame();
        });

        window.addEventListener('mouseup', () => {
            this.spin.endDrag();
            c.style.cursor = 'grab';
        });

        c.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            this.spin.applyWheel(e.deltaY, e.deltaMode, e.ctrlKey);
            this._emitOrbitViewSync();
            this._renderFrame();
        }, { passive: false });

        window.addEventListener('resize', () => {
            c.width = c.clientWidth;
            c.height = c.clientHeight;
            if (this._renderer && !(this._renderer instanceof Promise)) {
                this._renderer.setViewport(0, 0, c.width, c.height);
            }
            this._renderFrame();
        });

        c.tabIndex = 0;
        c.addEventListener('mouseenter', () => c.focus());

        const isInputFocused = () => {
            const tag = document.activeElement?.tagName;
            return tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA';
        };

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (isInputFocused()) return;

            if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                const sliderVal = SPEED_KEY_SLIDER[e.key];
                if (sliderVal !== undefined) {
                    this._paused = false;
                    this.speedScale = sliderVal / 100;
                    this._lastFrameTime = 0;
                    this.hooks.onKeyAction?.('setSpeed', sliderVal);
                    e.preventDefault();
                    this._renderFrame();
                    return;
                }
            }

            if (
                (e.key === '0' || e.key === 'z' || e.key === 'Z') &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey
            ) {
                this.togglePause();
                this.hooks.onKeyAction?.('togglePause');
                e.preventDefault();
                return;
            }

            if (e.key === ' ') {
                this.sound.ensureAudio();
                if (this._bodies.length > 0) {
                    if (Math.abs(this.spin.rotationVelocity) > 0.01 &&
                        this._selectedActor >= 0 && this._selectedActor < this._bodies.length) {
                        this._bodies[this._selectedActor].spinVelocity = this.spin.rotationVelocity;
                        this.spin.rotationVelocity = 0;
                    }
                    const minIdx = this._bodies.length > 1 ? -1 : 0;
                    const dir = e.shiftKey ? -1 : 1;
                    let idx = this._selectedActor + dir;
                    if (idx >= this._bodies.length) idx = minIdx;
                    if (idx < minIdx) idx = this._bodies.length - 1;
                    this.selectActor(idx);
                }
                e.preventDefault();
            }

            if (e.key === 'n') { this.hooks.onKeyAction?.('stepSceneNext'); e.preventDefault(); }
            if (e.key === 'p') { this.hooks.onKeyAction?.('stepScenePrev'); e.preventDefault(); }
            if (e.key === 'a') { this.hooks.onKeyAction?.('stepActorPrev'); e.preventDefault(); }
            if (e.key === 'd') { this.hooks.onKeyAction?.('stepActorNext'); e.preventDefault(); }
            if (e.key === 'w') { this.hooks.onKeyAction?.('stepCharacterPrev'); e.preventDefault(); }
            if (e.key === 's') { this.hooks.onKeyAction?.('stepCharacterNext'); e.preventDefault(); }
            if (e.key === 'q') { this.hooks.onKeyAction?.('stepAnimationPrev'); e.preventDefault(); }
            if (e.key === 'e') { this.hooks.onKeyAction?.('stepAnimationNext'); e.preventDefault(); }

            if (e.key === 'ArrowUp') { this._keysHeld.up = true; e.preventDefault(); }
            if (e.key === 'ArrowDown') { this._keysHeld.down = true; e.preventDefault(); }
            if (e.key === 'ArrowLeft') { this._keysHeld.left = true; this._keysHeld.leftStart = this._keysHeld.leftStart || performance.now(); e.preventDefault(); }
            if (e.key === 'ArrowRight') { this._keysHeld.right = true; this._keysHeld.rightStart = this._keysHeld.rightStart || performance.now(); e.preventDefault(); }
        });

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') { this._keysHeld.up = false; e.preventDefault(); }
            if (e.key === 'ArrowDown') { this._keysHeld.down = false; e.preventDefault(); }
            if (e.key === 'ArrowLeft') { this._keysHeld.left = false; this._keysHeld.leftStart = 0; e.preventDefault(); }
            if (e.key === 'ArrowRight') { this._keysHeld.right = false; this._keysHeld.rightStart = 0; e.preventDefault(); }
        });
    }
}

export function createMooShowStage(config: StageConfig): MooShowStage {
    return new MooShowStage(config);
}
