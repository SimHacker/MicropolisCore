/**
 * Finding known art in a frame.
 *
 * The art here is invented, and deliberately edgy: hard horizontal stripes, which is what interface
 * chrome is made of and what the matcher finds hardest. A soft blob would pass any search that got
 * roughly the right neighbourhood, and so would prove nothing about a search that has to be exact.
 */

import { describe, expect, it } from 'vitest';

import { createRaster, fillRect } from '../src/raster';
import { drawTemplate, greyscale, matchTemplate, templateFrom, type Template } from '../src/template';

/** Stripes, because a stripe two rows out of place correlates badly and that is the point. */
function stripes(name: string, width = 48, height = 32): Template {
	const art = createRaster(width, height, [0, 0, 0]);
	for (let y = 0; y < height; y += 4) {
		fillRect(art, 0, y, width, 2, [200, 210, 230]);
	}
	fillRect(art, 0, 0, 4, height, [255, 255, 255]);
	return templateFrom(art, name, { x: 0, y: 0, width, height }, { x: 168, y: -100, fromBottom: true });
}

/** Something plausible for the matcher to be wrong about: same stripes, different phase and brightness. */
function decoy(raster: ReturnType<typeof createRaster>, x: number, y: number): void {
	for (let row = 0; row < 32; row += 4) {
		fillRect(raster, x, y + row + 1, 48, 2, [150, 160, 180]);
	}
}

describe('matching a template', () => {
	const art = stripes('stripes');

	it('finds art drawn at a known place, exactly, and says it is certain', () => {
		const frame = createRaster(320, 240, [40, 40, 60]);
		drawTemplate(frame, art, 137, 91);

		const match = matchTemplate(frame, art);
		expect(match?.x).toBe(137);
		expect(match?.y).toBe(91);
		expect(match?.scale).toBe(1);
		expect(match?.score).toBeCloseTo(1, 3);
	});

	it('finds an odd row offset, which a stride of four steps straight over', () => {
		// 91 and 137 are both off any coarse grid, and the neighbouring decoys score well enough to win
		// if the true position is never scored properly. This is the failure the thinned survey removes.
		const frame = createRaster(320, 240, [40, 40, 60]);
		decoy(frame, 40, 88);
		decoy(frame, 220, 94);
		drawTemplate(frame, art, 137, 91);

		const match = matchTemplate(frame, art);
		expect(match?.x).toBe(137);
		expect(match?.y).toBe(91);
	});

	it('refuses a frame that does not contain the art', () => {
		const frame = createRaster(320, 240, [40, 40, 60]);
		decoy(frame, 100, 100);
		expect(matchTemplate(frame, art)).toBeNull();
	});

	it('recovers a nearest-neighbour upscale, and reports the scale', () => {
		const frame = createRaster(400, 300, [40, 40, 60]);
		drawTemplate(frame, art, 60, 40, 2);

		const match = matchTemplate(frame, art);
		expect(match?.scale).toBe(2);
		expect(match?.x).toBe(60);
		expect(match?.y).toBe(40);
		expect(match?.score).toBeCloseTo(1, 3);
	});

	it('searches only the region it is given', () => {
		const frame = createRaster(320, 240, [40, 40, 60]);
		drawTemplate(frame, art, 137, 20);

		expect(matchTemplate(frame, art, { region: { x: 0, y: 120, width: 320, height: 120 } })).toBeNull();
		expect(matchTemplate(frame, art, { region: { x: 0, y: 0, width: 320, height: 120 } })?.y).toBe(20);
	});

	it('accepts a greyscale plane, so a frame can be converted once and searched many times', () => {
		const frame = createRaster(320, 240, [40, 40, 60]);
		drawTemplate(frame, art, 12, 34);
		const grey = greyscale(frame);

		expect(matchTemplate(grey, art)?.x).toBe(12);
		expect(matchTemplate(grey, art)?.y).toBe(34);
	});

	it('will not take flat art as an anchor, however sure it looks', () => {
		const flat = createRaster(32, 32, [80, 80, 80]);
		const nothing = templateFrom(flat, 'flat', { x: 0, y: 0, width: 32, height: 32 });
		const frame = createRaster(320, 240, [80, 80, 80]);
		expect(matchTemplate(frame, nothing)).toBeNull();
	});

	it('survives a dimmed capture, because correlation does not care about gain', () => {
		const frame = createRaster(320, 240, [20, 20, 30]);
		drawTemplate(frame, art, 100, 100);
		for (let i = 0; i < frame.data.length; i += 4) {
			frame.data[i] = Math.round(frame.data[i] * 0.55);
			frame.data[i + 1] = Math.round(frame.data[i + 1] * 0.55);
			frame.data[i + 2] = Math.round(frame.data[i + 2] * 0.55);
		}

		const match = matchTemplate(frame, art);
		expect(match?.x).toBe(100);
		expect(match?.score).toBeGreaterThan(0.99);
	});

	it('carries the anchor through, since a match is only useful as a layout origin', () => {
		expect(art.anchor?.x).toBe(168);
		expect(art.anchor?.y).toBe(-100);
		expect(art.anchor?.fromBottom).toBe(true);
	});
});
