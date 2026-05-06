// VitaMoo — main entry point.
// Loads Sims 1 character data and renders via WebGPU.
//
// Supports both text formats (CMX, SKN — the development tools)
// and binary formats (BCF, BMF, CFP — the game runtime).

export {
    Vec2, Vec3, Quat, Bone, SkeletonData, MeshData, SuitData, SkillData,
    MotionData, BoneData, SkinData, BoneBinding, BlendBinding, Face, CMXFile,
    quatNlerp,
    quatConjugate,
} from './types.js';

export {
    parseCMX, parseSKN,
    parseBCF, parseBMF, parseCFP,
    writeCMX, writeSKN, writeReport,
    writeBCF, writeBMF, writeCFP,
} from './parser.js';

export { buildSkeleton, findRoot, findBone, updateTransforms, deformMesh } from './skeleton.js';
export type { DeformMeshOptions } from './skeleton.js';

export {
    defaultCharacterPipelineStages,
    mergeCharacterPipelineStages,
    defaultGpuCharacterPipelineCaps,
    effectivePipelineBackend,
    gpuStageFallbackWarnings,
    defaultPipelineValidationSettings,
    mergePipelineValidationSettings,
    defaultPipelineInspectionTaps,
    createInspectionTap,
    resizeInspectionTap,
    captureInspectionTap,
    compareInspectionTaps,
    compareCpuVec3ToGpuInterleaved,
    compareDeformedMeshCpuVsGpuInterleaved,
    compareBoneTransforms,
    compareDeformedVertices,
    DEFORMED_MESH_FLOATS_PER_VERTEX,
} from './character-pipeline.js';
export type {
    PipelineStageBackend,
    CharacterPipelineStages,
    GpuCharacterPipelineCaps,
    PipelineValidationSettings,
    PipelineInspectionTaps,
    InspectionTap,
    Float32BatchCompareResult,
    DeformationCompareSummary,
    BoneTransformCompareResult,
    DeformedVertexCompareResult,
} from './character-pipeline.js';

export {
    PipelineBuffer,
    packBoneTransforms,
    createBoneTransformBuffer,
    packDeformedMesh,
    createDeformedMeshBuffer,
    BONE_TRANSFORM_FLOATS,
    DEFORMED_VERTEX_FLOATS,
} from './pipeline-buffer.js';
export type { PipelineBufferAuthority, PipelineBufferOptions } from './pipeline-buffer.js';

export { GpuMeshCache, GPU_MESH_RAW_BONE_BIND_CACHE_KEY } from './gpu-mesh-cache.js';
export type { CachedMeshGpuData, GpuMeshBoneBindContext } from './gpu-mesh-cache.js';

export { GpuDeformer } from './gpu-deformer.js';
export { GpuAnimator } from './gpu-animator.js';
export type { PracticeGpuParams } from './gpu-animator.js';
export { GpuSkillCache, skeletonGpuBindingKey } from './gpu-skill-cache.js';
export type { CachedSkillGpuData } from './gpu-skill-cache.js';
export { GpuWorldTransform, worldTransformIdentity } from './gpu-world-transform.js';
export type { WorldTransformParams } from './gpu-world-transform.js';
export { GpuUniformPool, GpuVertexBufferPool } from './gpu-buffer-pool.js';
export {
    Renderer,
    ObjectIdType,
    SubObjectId,
    MeshFragmentDebugMode,
    MESH_FRAGMENT_DEBUG_MODE_MAX,
    meshFragmentDebugModeLabel,
} from './renderer.js';
export type { MeshFragmentDebugModeId, RendererCreateOptions } from './renderer.js';
export type {
    GpuResourceKind,
    GpuResourceAllocatedEvent,
    GpuResourceDestroyedEvent,
    GpuInstrumentationCallbacks,
} from './gpu-instrumentation.js';
export {
    DataReader, TextReader, BinaryReader, BinaryWriter,
    buildDeltaTable, decompressFloats, compressFloats,
} from './reader.js';

export { parseBMP, loadTexture } from './texture.js';
export type { TextureHandle } from './texture.js';
export { Practice, RepeatMode, applyPractices } from './animation.js';
export type { RepeatModeType, PracticeOptions, SkeletonEventHandler } from './animation.js';

export { createDiamondMesh } from './procedural/diamond.js';
export type { ProceduralMeshFactory } from './procedural/index.js';
export { transformMesh, transformMeshUpright } from './display-list.js';
export { loadGltfMeshes } from './loaders/gltf.js';

// Sims 1 container I/O: FAR, IFF (v1 + v2.x), resource handler registry, string tables.
export {
    IoBuffer,
    IffVersion,
    IFF_FILE_HEADER_SIZE, IFF_HEADER_PREFIX,
    IFF_VERSION_HIGH_BYTE, IFF_VERSION_LOW_BYTE, IFF_RSMP_OFFSET_BYTE,
    IFF_V1_CHUNK_HEADER_SIZE, IFF_V2_CHUNK_HEADER_SIZE,
    IFF_FLAG_INVALID, IFF_FLAG_INTERNAL, IFF_FLAG_LITTLE_ENDIAN, IFF_FLAG_LANGUAGE_MASK,
    RES_STR, RES_CTSS, RES_CST,
    RES_BHAV, RES_BCON,
    RES_OBJD, RES_OBJF, RES_OBJM, RES_OBJT,
    RES_DGRP, RES_SPR, RES_SPR2, RES_PALT, RES_BMP,
    RES_FCNS, RES_GLOB, RES_SLOT,
    RES_TTAB, RES_TTAS, RES_TPRP, RES_TRCN, RES_TREE,
    RES_FAMI, RES_FAMS, RES_FAMH,
    RES_NGBH, RES_NBRS,
    RES_RSMP, RES_ARRY, RES_FWAV, RES_CATS,
    RES_HOUS, RES_CARR, RES_PICT, RES_POSI, RES_CMMT,
    RES_ANIM, RES_PIFF, RES_INVALID,
    IffLanguage, IFF_LANGUAGE_COUNT,
    STR_FORMAT_PASCAL, STR_FORMAT_NULL_TERM, STR_FORMAT_PAIRS,
    STR_FORMAT_MULTI_LANG, STR_FORMAT_MULTI_LANG_LEN,
    detectIffVersion, isIff, readRsmpOffset,
    listIffChunks, getIffChunkData, chunkPayloadReader,
    iffChunkSummary, filterChunksByType, findChunkByTypeAndId,
    MAXIS_IFF1_HEADER,
    MAXIS_IFF_FLAG_INVALID, MAXIS_IFF_FLAG_INTERNAL, MAXIS_IFF_FLAG_LITTLE_ENDIAN,
    isMaxisIff1, readMaxisIff1BlockHeader, listMaxisIff1Resources, getMaxisIff1ResourceData,
    FAR_MAGIC, FAR_VERSION,
    isFar, parseFar, extractFarEntry,
    ResourceHandlerRegistry,
    parseStr, parseCst, strStrings, strGet, strGetLang,
    strHandler, ctssHandler, cstHandler,
    buildGuidObjectMap,
    appendGuidObjectMap,
    analyzeGuidBucket,
    analyzeGuidObjectMap,
    buildGuidCollisionWarnings,
} from './io/index.js';
export type {
    IffChunkInfo,
    MaxisIff1BlockHeader, MaxisIff1Resource,
    FarArchive, FarEntry,
    ResourceHandler, ResourceParseContext,
    StrItem, StrLanguageSet, StrResource,
    GuidValue,
    ObjectSourceKind,
    GuidCollisionObject,
    GuidObjectMap,
    GuidExactMatchGroup,
    GuidSimilarityMatrix,
    GuidCollisionAnalysis,
    GuidCollisionWarning,
    GuidCollisionOptions,
} from './io/index.js';
export type {
    DisplayListEntry,
    DisplayListEntryStatic,
    DisplayListEntrySkinned,
    DisplayListEntryUI,
    DisplayListEntryLegacy,
    Transform3D,
    Transform3DFull,
    DisplayListLayer,
    PickingOptions,
} from './display-list.js';

export type {
    PlayingSceneMetadata,
    GltfAttachmentRef,
    CharacterTemplate,
    PersonPlacement,
    PlayingSceneDefinition,
    PlayingSceneExchange,
} from './playing-scene/index.js';
export {
    assertPlayingSceneExchange,
    isPlayingSceneExchange,
    characterTemplateById,
    playingSceneById,
} from './playing-scene/index.js';
