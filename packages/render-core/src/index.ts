export { MapViewport } from './viewport/MapViewport.js';
export type { MapViewportConfig, Vec2, WorldTileBounds, Mat3, MutableVec2 } from './viewport/types.js';

export {
	HolodeckIdType,
	HolodeckLayer,
	type HolodeckIdTypeId,
	type HolodeckLayerId,
	type HolodeckPlugin,
	type HolodeckPluginContext,
	type HolodeckFrameState,
	type OverlayPlugin,
	type OverlayPluginContext,
} from './holodeck/types.js';

export type { PickResult } from './pick/types.js';
export { PICK_READ_BYTES_PER_ROW } from './pick/types.js';

export { MapScene, type MapSceneBaseLayer } from './scene/MapScene.js';

export * from './schema/description.js';
export * from './raster/software.js';

export {
	createGpuCanvas,
	HolodeckStage,
	readObjectIdAt,
	type GpuCanvasContext,
	type CreateGpuCanvasOptions,
	type HolodeckStageOptions,
	type PickAttachments,
} from './webgpu/index.js';

export type {
	DisplayListEntry,
	DisplayListEntryStatic,
	DisplayListEntrySkinned,
	DisplayListEntryUI,
	DisplayListEntryFrame,
	Transform3D,
	Transform3DFull,
	DisplayListLayer,
	PickingOptions,
	Vec3,
	Quat,
} from './display-list/types.js';

export type {
	FrameRect,
	FrameRimPx,
	FrameBounds,
	FrameCoordinateSpace,
	FrameEdgeMode,
	FrameCornerMode,
	FrameSliceInsets,
	FrameNineSliceAtlas,
	FrameNineSliceProcedural,
	FrameNineSliceSource,
	FrameNineSliceLayout,
	FrameRimPolicy,
	FrameAnimation,
	FrameInstance,
} from './frame/types.js';

export {
	outerFromInner,
	innerFromOuter,
	layoutNineSlice,
	scaleRimPx,
	frameRectWidth,
	frameRectHeight,
} from './frame/layout.js';
