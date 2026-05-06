export { createMooShowStage, MooShowStage } from './runtime/stage.js';
export type { StageConfig } from './runtime/stage.js';
export type {
    DeformMeshOptions,
    RendererCreateOptions,
    GpuInstrumentationCallbacks,
    GpuResourceAllocatedEvent,
    GpuResourceDestroyedEvent,
    GpuResourceKind,
    CharacterPipelineStages,
    PipelineStageBackend,
    PipelineValidationSettings,
    GpuCharacterPipelineCaps,
    Float32BatchCompareResult,
    DeformationCompareSummary,
} from 'vitamoo';
export {
    mergeCharacterPipelineStages,
    mergePipelineValidationSettings,
    defaultCharacterPipelineStages,
    defaultGpuCharacterPipelineCaps,
    defaultPipelineValidationSettings,
    compareDeformedMeshCpuVsGpuInterleaved,
    DEFORMED_MESH_FLOATS_PER_VERTEX,
} from 'vitamoo';
export type { ContentIndex, CharacterDef, SceneDef, CastMemberDef, ContentStore } from './runtime/content-loader.js';
export type {
    CharacterTemplate,
    PersonPlacement,
    PlayingSceneDefinition,
    PlayingSceneExchange,
} from 'vitamoo';
export {
    assertPlayingSceneExchange,
    isPlayingSceneExchange,
    characterTemplateById,
    playingSceneById,
} from 'vitamoo';
export type { Body, BodyMeshEntry, Vec3, TopPhysicsState } from './runtime/types.js';
export type { MooShowHooks, KeyAction, OrbitViewState } from './hooks/types.js';
export { defaultHooks } from './hooks/defaults.js';
export { SpinController } from './interaction/spin-controller.js';
export { SoundEngine } from './audio/sound-engine.js';
