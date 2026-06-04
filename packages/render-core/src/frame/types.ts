/**
 * Nine-slice / bordered **Frame** — shared by editing-tool cursors, window chrome,
 * panels, and HUD outlines. See documentation/designs/ui-frame-nine-slice.md.
 */

/** Axis-aligned rectangle in the frame's coordinate space. */
export interface FrameRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

/** Per-side rim thickness in **screen pixels** (may differ per side). */
export interface FrameRimPx {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/**
 * Inner = content / affected region (tiles, client area).
 * Outer = full frame bounds. The **rim** is the band between them.
 */
export interface FrameBounds {
	inner: FrameRect;
	outer: FrameRect;
}

/** Where `inner` / `outer` are expressed. */
export type FrameCoordinateSpace = 'screen' | 'world-tile' | 'ndc';

/** How a rim segment is drawn between corners. */
export type FrameEdgeMode = 'stretch' | 'repeat' | 'tile' | 'procedural';

/** Corner tiles: uniform scale only (no non-uniform stretch). */
export type FrameCornerMode = 'fixed' | 'scale';

export interface FrameSliceInsets {
	/** Source atlas insets (Unity-style), in source pixels. */
	top: number;
	right: number;
	bottom: number;
	left: number;
}

/** Image-based nine-slice (corners + edges + optional hollow center). */
export interface FrameNineSliceAtlas {
	type: 'atlas';
	/** Texture or atlas handle (renderer-specific). */
	texture: unknown;
	/** Full source image size. */
	sourceWidth: number;
	sourceHeight: number;
	slice: FrameSliceInsets;
	/** UV scale for 1:1 screen scaling of corners (default 1). */
	scale?: number;
}

/** Procedural rim (dual stroke, dashed, animated pulse, etc.). */
export interface FrameNineSliceProcedural {
	type: 'procedural';
	/** Primary stroke color (e.g. bright outline). */
	stroke: { r: number; g: number; b: number; a?: number };
	/** Optional outer contrast stroke (POP + EDGE). */
	outline?: { r: number; g: number; b: number; a?: number };
	edgeMode?: FrameEdgeMode;
	cornerMode?: FrameCornerMode;
}

export type FrameNineSliceSource = FrameNineSliceAtlas | FrameNineSliceProcedural;

/** Resolved layout of nine regions in destination (screen) space. */
export interface FrameNineSliceLayout {
	corners: {
		topLeft: FrameRect;
		topRight: FrameRect;
		bottomLeft: FrameRect;
		bottomRight: FrameRect;
	};
	edges: {
		top: FrameRect;
		right: FrameRect;
		bottom: FrameRect;
		left: FrameRect;
	};
	/** Present when the frame is not hollow (filled panel background). */
	center?: FrameRect;
}

/** Accessibility / context overrides for rim thickness. */
export interface FrameRimPolicy {
	/** Base screen-pixel rim (before zoom curve). */
	basePx: FrameRimPx;
	minPx?: FrameRimPx;
	maxPx?: FrameRimPx;
	/** Multiply rim by this after zoom/context (e.g. FAT_CURSOR = 2). */
	scale?: number;
	/** Optional zoom → scale curve (renderer applies). */
	zoomCurve?: 'constant' | 'inverse' | 'clamp';
}

export interface FrameAnimation {
	/** Rim opacity or width pulse (accessibility / emphasis). */
	pulseHz?: number;
	pulseAmplitude?: number;
	/** Dash offset along edges (procedural). */
	dashOffsetPx?: number;
	dashPeriodPx?: number;
}

/**
 * One frame instance for the display list or DOM overlay.
 * Plugins set `inner`/`outer`; executor expands nine regions via {@link layoutNineSlice}.
 */
export interface FrameInstance {
	id?: string;
	space: FrameCoordinateSpace;
	bounds: FrameBounds;
	source: FrameNineSliceSource;
	rim?: FrameRimPolicy;
	animation?: FrameAnimation;
	/** Hollow: draw only rim (tool cursor). Filled: draw center too (panel bg). */
	hollow?: boolean;
}

