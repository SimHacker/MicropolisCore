import type { MicropolisMapRenderDescription } from './description';

export interface RgbaImage {
	width: number;
	height: number;
	data: Uint8ClampedArray;
}

export interface TileAtlas {
	width: number;
	height: number;
	atlasX?: number;
	atlasY?: number;
	atlasWidth?: number;
	atlasHeight?: number;
	tileWidth: number;
	tileHeight: number;
	strideX?: number;
	strideY?: number;
	tileCount?: number;
	tilesPerSet?: number;
	pixelAspectX?: number;
	pixelAspectY?: number;
	wrap?: 'repeat' | 'clamp';
	sampling?: 'pixel' | 'nearest' | 'linear' | 'area' | 'mipmap';
	mipmaps?: false | 'gpu' | 'tile-aware';
	gutterX?: number;
	gutterY?: number;
	blend?: 'replace' | 'alpha' | 'multiply' | 'screen' | 'add' | 'tint';
	opacity?: number;
	tint?: [number, number, number, number];
	data: Uint8ClampedArray;
}

// Micropolis stores rendering flags in the high bits of each map cell; the low
// 10 bits are the actual tile index. This matches the classic TileBits.MASK.
const TILE_ID_MASK = 0x03ff;

function clampInt(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, Math.floor(value)));
}

function mapIndex(column: number, row: number, height: number): number {
	// The engine stores map cells column-major: map[x * WORLD_H + y].
	// Keeping this layout here lets the software renderer consume both saved
	// city data and live WASM map views without transposing buffers.
	return column * height + row;
}

export function renderMicropolisMapSoftware(
	description: MicropolisMapRenderDescription,
	mapData: Uint16Array,
	atlas: TileAtlas,
	mopData?: Uint16Array
): RgbaImage {
	const width = description.output.width;
	const height = description.output.height;
	const out = new Uint8ClampedArray(width * height * 4);
	const mapWidth = description.map.width;
	const mapHeight = description.map.height;
	const tileWidth = description.map.tile_width;
	const tileHeight = description.map.tile_height;
	const atlasX = atlas.atlasX ?? 0;
	const atlasY = atlas.atlasY ?? 0;
	const atlasWidth = atlas.atlasWidth ?? (atlas.width - atlasX);
	const atlasHeight = atlas.atlasHeight ?? (atlas.height - atlasY);
	const strideX = atlas.strideX ?? atlas.tileWidth;
	const strideY = atlas.strideY ?? atlas.tileHeight;
	const tilesPerRow = Math.max(1, Math.floor(atlasWidth / strideX));
	const defaultRowsPerSet = Math.max(1, Math.floor(atlasHeight / strideY));
	const maxTilesInAtlas = tilesPerRow * defaultRowsPerSet;
	const tileCount = atlas.tileCount ?? maxTilesInAtlas;
	const tilesPerSet = atlas.tilesPerSet ?? tileCount;
	const rowsPerSet = Math.max(1, Math.ceil(tilesPerSet / tilesPerRow));
	const setsPerAtlas = Math.max(1, Math.floor(atlasHeight / (rowsPerSet * strideY)));
	const shouldWrap = (atlas.wrap ?? 'repeat') === 'repeat';
	const pixelAspectX = atlas.pixelAspectX ?? 1;
	const pixelAspectY = atlas.pixelAspectY ?? 1;
	const zoom = description.viewport.zoom;
	const centerX = description.viewport.centerX;
	const centerY = description.viewport.centerY;

	// Iterate destination pixels rather than source tiles. This is the same
	// conceptual model as a fragment shader: each output pixel asks "which world
	// pixel do I sample?" That avoids tile seams at fractional zooms because no
	// independent tile quads are being rasterized and rounded against each other.
	for (let y = 0; y < height; y += 1) {
		// Convert screen pixel Y into world pixel space. The viewport center is in
		// tile coordinates, so multiply by tile size before applying screen offset.
		const worldYPixels = (y - height / 2) / zoom + centerY * tileHeight;
		const tileY = Math.floor(worldYPixels / tileHeight);
		// JavaScript % keeps the sign of the dividend; normalize to [0, tileHeight)
		// so negative world coordinates still wrap correctly before bounds rejection.
		const logicalTilePixelY = ((Math.floor(worldYPixels) % tileHeight) + tileHeight) % tileHeight;

		for (let x = 0; x < width; x += 1) {
			const outIndex = (y * width + x) * 4;
			const worldXPixels = (x - width / 2) / zoom + centerX * tileWidth;
			const tileX = Math.floor(worldXPixels / tileWidth);

			if (tileX < 0 || tileX >= mapWidth || tileY < 0 || tileY >= mapHeight) {
				out[outIndex + 3] = 255;
				continue;
			}

			const logicalTilePixelX = ((Math.floor(worldXPixels) % tileWidth) + tileWidth) % tileWidth;
			const cellIndex = mapIndex(tileX, tileY, mapHeight);
			const tileValue = mapData[cellIndex] ?? 0;
			const tileId = tileValue & TILE_ID_MASK;
			const tileSet = (mopData?.[cellIndex] ?? 0) & 0xff;
			// The atlas is a regular grid of tiles. Tile id N maps to row/column by
			// the atlas tile count per row, then the intra-tile pixel offset selects
			// the exact source texel.
			// `tileCount` lets tiny overlay/UI/debug atlases intentionally contain
			// only a handful of tiles. Repeat wraps ids around that small set; clamp
			// pins invalid ids to the last tile so bad data stays visible.
			const tileValueInSet = shouldWrap ? tileId % tileCount : clampInt(tileId, 0, tileCount - 1);
			const tileCol = tileValueInSet % tilesPerRow;
			const tileRow = Math.floor(tileValueInSet / tilesPerRow) + (tileSet % setsPerAtlas) * rowsPerSet;
			// Pixel aspect lets old/non-square source pixels describe their intended
			// visual ratio without changing logical world tile size. Defaults 1:1.
			const aspectScale = pixelAspectY / pixelAspectX;
			const sourceU = logicalTilePixelX / tileWidth;
			const sourceV = Math.min(1, (logicalTilePixelY / tileHeight) * aspectScale);
			const tilePixelX = Math.floor(sourceU * atlas.tileWidth);
			const tilePixelY = Math.floor(sourceV * atlas.tileHeight);
			// TODO(renderer-policy): implement `linear`, `area`, and `mipmap`
			// sampling in the software path. Current Canvas/software output treats
			// `pixel` and `nearest` as exact nearest-neighbor sampling.
			// TODO(renderer-policy): honor `gutterX/Y` when smooth sampling is added.
			// TODO(renderer-policy): implement blend/opacity/tint compositing once
			// overlay layer stacking lands.
			// Clamp rather than throw if the map contains a tile id beyond this atlas.
			// That keeps preview rendering robust while still making bad data visible
			// as edge pixels from the supplied atlas.
			const srcX = clampInt(atlasX + tileCol * strideX + tilePixelX, 0, atlas.width - 1);
			const srcY = clampInt(atlasY + tileRow * strideY + tilePixelY, 0, atlas.height - 1);
			const srcIndex = (srcY * atlas.width + srcX) * 4;

			// Output is tightly-packed RGBA8: row-major destination pixels, four
			// channels per pixel. This matches ImageData and the sidecar video layout.
			out[outIndex] = atlas.data[srcIndex] ?? 0;
			out[outIndex + 1] = atlas.data[srcIndex + 1] ?? 0;
			out[outIndex + 2] = atlas.data[srcIndex + 2] ?? 0;
			out[outIndex + 3] = atlas.data[srcIndex + 3] ?? 255;
		}
	}

	return { width, height, data: out };
}
