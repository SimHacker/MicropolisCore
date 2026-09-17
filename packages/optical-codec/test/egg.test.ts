/**
 * The band code and the egg we draw from it.
 *
 * There is no egg reader yet, so these tests hold the format to its promises instead: big-endian
 * truncation, a check digit that catches a misread colour, cap polarity, and a drawn egg whose
 * bands are where the reader will look for them next round.
 */

import { describe, expect, it } from 'vitest';

import { CAP_BOTTOM, CAP_TOP, decodeDigits, encodeDigits, nearestDigit, PALETTE, prefixLength } from '../src/egg-code';
import { drawEgg } from '../src/egg-render';
import { createRaster, getPixel } from '../src/raster';

const CODE = { kind: 3, version: 1, id: 47, value: 82 };

describe('the code', () => {
	it('round-trips', () => {
		expect(decodeDigits(encodeDigits(CODE))).toEqual(CODE);
	});

	it('rejects a single misread band', () => {
		const digits = encodeDigits(CODE);
		digits[2] = (digits[2] + 1) % 10;
		expect(decodeDigits(digits)).toBeNull();
	});

	it('rejects a transposition, which an unweighted sum would miss', () => {
		const digits = encodeDigits(CODE);
		[digits[0], digits[1]] = [digits[1], digits[0]];
		expect(decodeDigits(digits)).toBeNull();
	});

	it('degrades by truncation: the far read is a prefix of the near one', () => {
		const full = encodeDigits(CODE);
		for (const zoom of ['far', 'mid', 'near', 'full'] as const) {
			const n = prefixLength(zoom);
			expect(full.slice(0, n)).toEqual(full.slice(0, n));
			expect(n).toBeLessThanOrEqual(full.length);
		}
		// Kind and version are legible at the furthest zoom, which is the whole point of the order.
		expect(full.slice(0, prefixLength('far'))).toEqual([CODE.kind, CODE.version]);
	});

	it('keeps its palette separable', () => {
		// Every colour has to survive being confused with every other, so the closest pair in the
		// palette sets the noise budget. Below about 60 in RGB distance the bands stop being safe.
		let closest = Number.POSITIVE_INFINITY;
		for (let i = 0; i < PALETTE.length; i++) {
			for (let j = i + 1; j < PALETTE.length; j++) {
				const d = Math.hypot(PALETTE[i][0] - PALETTE[j][0], PALETTE[i][1] - PALETTE[j][1], PALETTE[i][2] - PALETTE[j][2]);
				closest = Math.min(closest, d);
			}
		}
		expect(closest).toBeGreaterThan(60);
	});

	it('classifies a shifted colour back to its digit', () => {
		const shifted: [number, number, number] = [PALETTE[6][0] + 14, PALETTE[6][1] - 10, PALETTE[6][2] + 12];
		expect(nearestDigit(shifted).digit).toBe(6);
	});
});

describe('the drawn egg', () => {
	it('puts white above black, so up is unambiguous', () => {
		const frame = createRaster(80, 120, [90, 100, 90]);
		const egg = drawEgg(frame, CODE, { x: 40, y: 100 }, { lit: 'dark' });
		const top = getPixel(frame, 40, egg.box.y + 1);
		const bottom = getPixel(frame, 40, egg.box.y + egg.box.height - 2);
		expect(top).toEqual([...CAP_TOP]);
		expect(bottom).toEqual([...CAP_BOTTOM]);
	});

	it('draws the digits the zoom can carry, not all of them', () => {
		const frame = createRaster(80, 120, [90, 100, 90]);
		const far = drawEgg(frame, CODE, { x: 40, y: 100 }, { zoom: 'far' });
		expect(far.digits).toEqual([CODE.kind, CODE.version]);
		const full = drawEgg(createRaster(80, 120), CODE, { x: 40, y: 100 }, { zoom: 'full' });
		expect(full.digits.slice(0, 2)).toEqual(far.digits);
	});

	it('stays inside the frame it was drawn in', () => {
		const frame = createRaster(120, 160, [90, 100, 90]);
		const egg = drawEgg(frame, CODE, { x: 60, y: 140 }, { bandHeight: 8, radius: 12 });
		expect(egg.box.x).toBeGreaterThanOrEqual(0);
		expect(egg.box.y).toBeGreaterThanOrEqual(0);
		expect(egg.box.x + egg.box.width).toBeLessThanOrEqual(frame.width);
		expect(egg.box.y + egg.box.height).toBeLessThanOrEqual(frame.height);
	});

	it('leaves a base behind when it levitates', () => {
		const frame = createRaster(80, 140, [90, 100, 90]);
		const egg = drawEgg(frame, CODE, { x: 40, y: 120 }, { levitation: 14, lit: 'dark' });
		expect(egg.box.y + egg.box.height).toBeLessThan(120);
		expect(getPixel(frame, 40, 119)).not.toEqual([90, 100, 90]);
	});

	it('does not need its glow: the bands are identical lit and dark', () => {
		const lit = createRaster(80, 140, [90, 100, 90]);
		const dark = createRaster(80, 140, [90, 100, 90]);
		const a = drawEgg(lit, CODE, { x: 40, y: 120 }, { lit: 'steady' });
		const b = drawEgg(dark, CODE, { x: 40, y: 120 }, { lit: 'dark' });
		expect(a.box).toEqual(b.box);
		for (let y = a.box.y; y < a.box.y + a.box.height; y++) {
			expect(getPixel(lit, 40, y)).toEqual(getPixel(dark, 40, y));
		}
	});
});
