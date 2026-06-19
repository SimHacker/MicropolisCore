import type { TileRenderer } from '@micropolis/tile-renderer';

/** Sync viewport scale from live canvas — works even if Vite serves a stale tile-renderer bundle. */
export function syncViewportScreenScale(
	tr: TileRenderer<unknown>,
	adjustPanBounds = false,
): void {
	if (typeof tr.syncViewportScreenScale === 'function') {
		tr.syncViewportScreenScale(adjustPanBounds);
		return;
	}

	const canvas = tr.canvas;
	if (!canvas) return;

	const rect = canvas.getBoundingClientRect();
	const cssW = rect.width > 0 ? rect.width : canvas.clientWidth;
	const cssH = rect.height > 0 ? rect.height : canvas.clientHeight;
	if (cssW <= 0 || cssH <= 0) return;

	const backingScale = canvas.width / cssW;
	if (typeof tr.setScreenSize === 'function' && tr.setScreenSize.length >= 3) {
		tr.setScreenSize(cssW, cssH, backingScale, adjustPanBounds);
		return;
	}

	const z = tr.viewport.zoom;
	if (z <= 0 || backingScale <= 0) return;
	const cssPixelsPerTile = (tr.atlasTileWidth * 4 * tr.zoom) / backingScale;
	tr.viewport.setScreenSize(cssW, cssH);
	tr.viewport.configure({
		tileWidth: 1,
		tileHeight: 1,
		screenZoomFactor: cssPixelsPerTile / z,
	});
}

export function cssPixelsPerTile(tr: TileRenderer<unknown>): number {
	if (typeof tr.cssPixelsPerTile === 'function') {
		return tr.cssPixelsPerTile();
	}
	const canvas = tr.canvas;
	if (!canvas) return 0;
	const rect = canvas.getBoundingClientRect();
	const cssW = rect.width > 0 ? rect.width : canvas.clientWidth;
	if (cssW <= 0) return 0;
	return (tr.atlasTileWidth * 4 * tr.zoom) / (canvas.width / cssW);
}

export function panToKeepWorldAtScreen(
	tr: TileRenderer<unknown>,
	worldTile: [number, number],
	screenCss: [number, number],
): void {
	if (typeof tr.panToKeepWorldAtScreen === 'function') {
		tr.panToKeepWorldAtScreen(worldTile, screenCss);
		return;
	}
	tr.viewport.panToKeepWorldAtScreen(worldTile, screenCss);
}
