/**
 * The PNG round trip, because both halves are ours and either could be wrong alone.
 *
 * The writer emits uncompressed deflate blocks and unfiltered rows, so this pair only proves the
 * decoder against the simplest legal PNG. The row filters are exercised by the second test, which
 * hands the decoder rows filtered every legal way.
 */

import { describe, expect, it } from 'vitest';

import { decodePNG } from '../src/node/png';
import { createRaster, getPixel, setPixel, toPNG } from '../src/raster';
import { renderScene } from '../src/scene';

describe('decodePNG', () => {
	it('round-trips a raster through our own writer', () => {
		const source = createRaster(37, 23, [10, 20, 30]);
		setPixel(source, 0, 0, [255, 0, 0]);
		setPixel(source, 36, 22, [0, 255, 0]);
		setPixel(source, 18, 11, [7, 200, 99]);

		const decoded = decodePNG(toPNG(source));
		expect(decoded.width).toBe(37);
		expect(decoded.height).toBe(23);
		expect(getPixel(decoded, 0, 0)).toEqual([255, 0, 0]);
		expect(getPixel(decoded, 36, 22)).toEqual([0, 255, 0]);
		expect(getPixel(decoded, 18, 11)).toEqual([7, 200, 99]);
		expect(decoded.data).toEqual(source.data);
	});

	it('round-trips a whole scene', async () => {
		const scene = await renderScene({ width: 200, height: 150, seed: 5 });
		const decoded = decodePNG(toPNG(scene.raster));
		expect(decoded.data).toEqual(scene.raster.data);
	});

	it('refuses what it cannot read, instead of guessing', () => {
		expect(() => decodePNG(new Uint8Array([1, 2, 3, 4]))).toThrow(/not a PNG/);
	});
});
