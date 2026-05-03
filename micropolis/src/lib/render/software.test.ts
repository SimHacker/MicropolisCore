import { describe, expect, it } from 'vitest';
import { defaultMicropolisMapRenderDescription } from './description';
import { renderMicropolisMapSoftware, type TileAtlas } from './software';

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
});
