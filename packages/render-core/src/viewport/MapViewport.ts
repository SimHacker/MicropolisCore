import type { MapViewportConfig, Mat3, MutableVec2, Vec2, WorldTileBounds } from './types.js';

const EPS = 1e-6;

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Shared 2D camera for the Micropolis map: pan and zoom in **world-tile** space,
 * anchored on screen, with optional non-square tile pixels.
 *
 * Coordinate spaces:
 * - **screen** — canvas pixels, origin top-left.
 * - **world-tile** — continuous tile indices (what `screenToWorldTile` returns).
 * - **world-pixel** — engine/sprite space: tile index × tile width/height in pixels.
 *
 * Overlay plugins (sprites, pointer/tool frames, pie menus, shadows, 3D passes)
 * should share one `MapViewport` instance with the base tile renderer.
 * Cursor policy: documentation/designs/virtual-pointer-and-pie-cursors.md
 */
export class MapViewport {
	mapWidth = 120;
	mapHeight = 100;
	tileWidth = 1;
	tileHeight = 1;

	screenWidth = 0;
	screenHeight = 0;
	screenAnchorX = 0.5;
	screenAnchorY = 0.5;

	panX = 0;
	panY = 0;
	panXMin = 0;
	panXMax = 120;
	panYMin = 0;
	panYMax = 100;

	zoom = 1;
	zoomMin = 1 / 32;
	zoomMax = 256;

	configure(config: MapViewportConfig): void {
		if (config.mapWidth !== undefined) this.mapWidth = config.mapWidth;
		if (config.mapHeight !== undefined) this.mapHeight = config.mapHeight;
		if (config.tileWidth !== undefined) this.tileWidth = config.tileWidth;
		if (config.tileHeight !== undefined) this.tileHeight = config.tileHeight;
		if (config.screenWidth !== undefined) this.screenWidth = config.screenWidth;
		if (config.screenHeight !== undefined) this.screenHeight = config.screenHeight;
		if (config.screenAnchorX !== undefined) this.screenAnchorX = config.screenAnchorX;
		if (config.screenAnchorY !== undefined) this.screenAnchorY = config.screenAnchorY;
		if (config.panX !== undefined) this.panX = config.panX;
		if (config.panY !== undefined) this.panY = config.panY;
		if (config.panXMin !== undefined) this.panXMin = config.panXMin;
		if (config.panXMax !== undefined) this.panXMax = config.panXMax;
		if (config.panYMin !== undefined) this.panYMin = config.panYMin;
		if (config.panYMax !== undefined) this.panYMax = config.panYMax;
		if (config.zoom !== undefined) this.zoom = config.zoom;
		if (config.zoomMin !== undefined) this.zoomMin = config.zoomMin;
		if (config.zoomMax !== undefined) this.zoomMax = config.zoomMax;
	}

	setScreenSize(width: number, height: number): void {
		this.screenWidth = width;
		this.screenHeight = height;
	}

	panTo(panX: number, panY: number): void {
		this.panX = clamp(panX, this.panXMin, this.panXMax);
		this.panY = clamp(panY, this.panYMin, this.panYMax);
	}

	panBy(dx: number, dy: number): void {
		this.panTo(this.panX + dx, this.panY + dy);
	}

	zoomTo(zoom: number): void {
		this.zoom = clamp(zoom, this.zoomMin, this.zoomMax);
	}

	zoomBy(factor: number): void {
		this.zoomTo(this.zoom * factor);
	}

	// --- screen ↔ world-tile ---

	screenToWorldTile(screen: Vec2): MutableVec2 {
		const [screenX, screenY] = screen;
		const anchoredScreenX = screenX - this.screenWidth * this.screenAnchorX;
		const anchoredScreenY = screenY - this.screenHeight * this.screenAnchorY;
		const scaledX = anchoredScreenX / this.zoom;
		const scaledY = anchoredScreenY / this.zoom;
		const tileX = scaledX / this.tileWidth + this.panX;
		const tileY = scaledY / this.tileHeight + this.panY;
		return [tileX, tileY];
	}

	screenToWorldTileDelta(screenDelta: Vec2): MutableVec2 {
		const [screenDX, screenDY] = screenDelta;
		return [screenDX / this.zoom / this.tileWidth, screenDY / this.zoom / this.tileHeight];
	}

	worldTileToScreen(world: Vec2): MutableVec2 {
		const [tileX, tileY] = world;
		const unpannedX = tileX - this.panX;
		const unpannedY = tileY - this.panY;
		const screenX = unpannedX * this.zoom * this.tileWidth + this.screenWidth * this.screenAnchorX;
		const screenY = unpannedY * this.zoom * this.tileHeight + this.screenHeight * this.screenAnchorY;
		return [screenX, screenY];
	}

	worldTileToScreenDelta(tileDelta: Vec2): MutableVec2 {
		const [tileDX, tileDY] = tileDelta;
		return [tileDX * this.zoom * this.tileWidth, tileDY * this.zoom * this.tileHeight];
	}

	// --- world-tile ↔ world-pixel (sprite / engine space) ---

	worldTileToWorldPixel(tile: Vec2): MutableVec2 {
		const [tileX, tileY] = tile;
		return [tileX * this.tileWidth, tileY * this.tileHeight];
	}

	worldPixelToWorldTile(pixel: Vec2): MutableVec2 {
		const [px, py] = pixel;
		return [px / this.tileWidth, py / this.tileHeight];
	}

	screenToWorldPixel(screen: Vec2): MutableVec2 {
		return this.worldTileToWorldPixel(this.screenToWorldTile(screen));
	}

	worldPixelToScreen(pixel: Vec2): MutableVec2 {
		return this.worldTileToScreen(this.worldPixelToWorldTile(pixel));
	}

	// --- matrices for GPU overlay passes ---

	/**
	 * Column-major 3×3: maps homogeneous world-tile (x, y, 1) to screen (x, y).
	 */
	worldTileToScreenMatrix(out?: Mat3): Mat3 {
		const m = (out ?? new Float32Array(9)) as Mat3;
		const z = this.zoom;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		m[0] = z * tw;
		m[1] = 0;
		m[2] = 0;
		m[3] = 0;
		m[4] = z * th;
		m[5] = 0;
		m[6] = this.screenWidth * this.screenAnchorX - this.panX * z * tw;
		m[7] = this.screenHeight * this.screenAnchorY - this.panY * z * th;
		m[8] = 1;
		return m;
	}

	/** Inverse of {@link worldTileToScreenMatrix}. */
	screenToWorldTileMatrix(out?: Mat3): Mat3 {
		const m = (out ?? new Float32Array(9)) as Mat3;
		const z = this.zoom;
		const tw = this.tileWidth;
		const th = this.tileHeight;
		if (Math.abs(z) < EPS || Math.abs(tw) < EPS || Math.abs(th) < EPS) {
			m.fill(0);
			m[8] = 1;
			return m;
		}
		const invZTw = 1 / (z * tw);
		const invZTh = 1 / (z * th);
		m[0] = invZTw;
		m[1] = 0;
		m[2] = 0;
		m[3] = 0;
		m[4] = invZTh;
		m[5] = 0;
		m[6] = this.panX - (this.screenWidth * this.screenAnchorX) * invZTw;
		m[7] = this.panY - (this.screenHeight * this.screenAnchorY) * invZTh;
		m[8] = 1;
		return m;
	}

	/** Apply {@link worldTileToScreenMatrix} to a world-tile point. */
	transformWorldTileToScreen(world: Vec2, out?: MutableVec2): MutableVec2 {
		const [x, y] = world;
		const m = this.worldTileToScreenMatrix();
		const o = out ?? [0, 0];
		o[0] = m[0] * x + m[3] * y + m[6];
		o[1] = m[1] * x + m[4] * y + m[7];
		return o;
	}

	containsWorldTile(tile: Vec2): boolean {
		const [x, y] = tile;
		return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
	}

	/** World-tile AABB intersecting the screen (for culling overlays and tiles). */
	visibleWorldTileBounds(): WorldTileBounds {
		const corners: Vec2[] = [
			[0, 0],
			[this.screenWidth, 0],
			[0, this.screenHeight],
			[this.screenWidth, this.screenHeight],
		];
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const c of corners) {
			const [x, y] = this.screenToWorldTile(c);
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}
		return { minX, minY, maxX, maxY };
	}
}
