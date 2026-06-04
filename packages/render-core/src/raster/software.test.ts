import { describe, expect, it } from 'vitest';
import { defaultMicropolisMapRenderDescription } from '../schema/description.js';
import { renderMicropolisMapSoftware, type TileAtlas } from './software.js';

function solidAtlas(): TileAtlas {
	const data = new Uint8ClampedArray(2 * 1 * 4);
	data.set([255, 0, 0, 255], 0);
	data.set([0, 0, 255, 255], 4);
	return {
		width: 2,
		height: 1,
		tileWidth: 1,
		tileHeight: 1,
		data
	};
}

describe('software Micropolis renderer', () => {
	it('samples output pixels through the map and tile atlas', () => {
		const description = defaultMicropolisMapRenderDescription({
			output: { format: 'rgba8', width: 2, height: 1 },
			map: { width: 2, height: 1, tile_width: 1, tile_height: 1 },
			viewport: { width: 2, height: 1, centerX: 1, centerY: 0.5, zoom: 1 }
		});
		const image = renderMicropolisMapSoftware(description, new Uint16Array([0, 1]), solidAtlas());

		expect([...image.data]).toEqual([255, 0, 0, 255, 0, 0, 255, 255]);
	});

	it('supports source tile size independent of atlas stride and per-tile mop sets', () => {
		const description = defaultMicropolisMapRenderDescription({
			output: { format: 'rgba8', width: 1, height: 1 },
			map: { width: 1, height: 1, tile_width: 2, tile_height: 2 },
			viewport: { width: 1, height: 1, centerX: 0.25, centerY: 0.25, zoom: 1 }
		});
		const atlas = new Uint8ClampedArray(1 * 4 * 4);
		atlas.set([255, 0, 0, 255], 0);
		atlas.set([0, 0, 0, 0], 4);
		atlas.set([0, 255, 0, 255], 8);
		const image = renderMicropolisMapSoftware(
			description,
			new Uint16Array([0]),
			{ width: 1, height: 4, tileWidth: 1, tileHeight: 1, strideX: 1, strideY: 2, tilesPerSet: 1, data: atlas },
			new Uint16Array([1])
		);

		expect([...image.data]).toEqual([0, 255, 0, 255]);
	});
});
