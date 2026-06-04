import { describe, expect, it } from 'vitest';
import { MapViewport } from './MapViewport.js';

function approx(a: number, b: number, eps = 1e-5): void {
	expect(Math.abs(a - b)).toBeLessThan(eps);
}

describe('MapViewport', () => {
	const make = () => {
		const v = new MapViewport();
		v.configure({
			mapWidth: 120,
			mapHeight: 100,
			tileWidth: 16,
			tileHeight: 16,
			screenWidth: 800,
			screenHeight: 600,
			screenAnchorX: 0.5,
			screenAnchorY: 0.5,
			panX: 60,
			panY: 50,
			zoom: 2,
		});
		return v;
	};

	it('round-trips screen ↔ world-tile at anchor', () => {
		const v = make();
		const screen: [number, number] = [400, 300];
		const tile = v.screenToWorldTile(screen);
		const back = v.worldTileToScreen(tile);
		approx(back[0], screen[0]);
		approx(back[1], screen[1]);
	});

	it('maps pan anchor tile to screen center', () => {
		const v = make();
		const [sx, sy] = v.worldTileToScreen([v.panX, v.panY]);
		approx(sx, v.screenWidth * v.screenAnchorX);
		approx(sy, v.screenHeight * v.screenAnchorY);
	});

	it('screen delta scales inversely with zoom and tile size', () => {
		const v = make();
		const [tdx, tdy] = v.screenToWorldTileDelta([32, 16]);
		approx(tdx, 32 / v.zoom / v.tileWidth);
		approx(tdy, 16 / v.zoom / v.tileHeight);
	});

	it('world-tile ↔ world-pixel uses tile dimensions', () => {
		const v = make();
		const [px, py] = v.worldTileToWorldPixel([3, 4]);
		approx(px, 48);
		approx(py, 64);
		const tile = v.worldPixelToWorldTile([48, 64]);
		approx(tile[0], 3);
		approx(tile[1], 4);
	});

	it('matrix matches worldTileToScreen', () => {
		const v = make();
		const world: [number, number] = [12.5, 34.25];
		const [sx, sy] = v.worldTileToScreen(world);
		const [mx, my] = v.transformWorldTileToScreen(world);
		approx(mx, sx);
		approx(my, sy);
	});

	it('visibleWorldTileBounds covers screen corners', () => {
		const v = make();
		const b = v.visibleWorldTileBounds();
		const [cx, cy] = v.screenToWorldTile([v.screenWidth / 2, v.screenHeight / 2]);
		expect(cx).toBeGreaterThanOrEqual(b.minX);
		expect(cx).toBeLessThanOrEqual(b.maxX);
		expect(cy).toBeGreaterThanOrEqual(b.minY);
		expect(cy).toBeLessThanOrEqual(b.maxY);
	});

	it('clamps pan and zoom', () => {
		const v = make();
		v.panXMin = 0;
		v.panXMax = 10;
		v.panTo(999, -1);
		expect(v.panX).toBe(10);
		expect(v.panY).toBe(v.panYMin);
		v.zoomMin = 1;
		v.zoomMax = 4;
		v.zoomTo(100);
		expect(v.zoom).toBe(4);
	});
});
