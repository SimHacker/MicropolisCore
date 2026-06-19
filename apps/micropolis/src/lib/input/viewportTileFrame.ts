import type { MapViewport } from '@micropolis/render-core';

export interface ScreenRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** One tile footprint in screen CSS pixels — same math holodeck measure will use later. */
export function tileFootprintScreenRect(
	viewport: MapViewport,
	tileX: number,
	tileY: number,
	tileW = 1,
	tileH = 1
): ScreenRect {
	const r = viewport.worldTileToScreenRect(tileX, tileY, tileW, tileH);
	return { x: r.x, y: r.y, w: r.w, h: r.h };
}
