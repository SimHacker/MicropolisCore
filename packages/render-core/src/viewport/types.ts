/** Screen-space or world-space 2D point. */
export type Vec2 = readonly [number, number];

/** Mutable 2D point for internal use. */
export type MutableVec2 = [number, number];

/** Axis-aligned bounds in world-tile space (continuous coordinates). */
export interface WorldTileBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

/**
 * Partial configuration for {@link MapViewport}.
 * All fields are optional; unset fields keep their current values.
 */
export interface MapViewportConfig {
	mapWidth?: number;
	mapHeight?: number;
	tileWidth?: number;
	tileHeight?: number;
	screenWidth?: number;
	screenHeight?: number;
	screenAnchorX?: number;
	screenAnchorY?: number;
	panX?: number;
	panY?: number;
	panXMin?: number;
	panXMax?: number;
	panYMin?: number;
	panYMax?: number;
	zoom?: number;
	zoomMin?: number;
	zoomMax?: number;
	/** Extra zoom applied by Micropolis tile renderers (Canvas/WebGL use 4× for parity). */
	screenZoomFactor?: number;
}

/** 3×3 column-major affine: screen = matrix × [tileX, tileY, 1]ᵀ */
export type Mat3 = Float32Array & { length: 9 };
