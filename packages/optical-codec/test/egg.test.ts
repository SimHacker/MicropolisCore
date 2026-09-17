/**
 * The band code, the egg drawn from it, and the reader that gets the number back.
 *
 * Draw and read are the same numbers here, the way they are for the font: a fixture this code drew is
 * legible to this code by construction, so a disagreement is a bug in one of two functions rather
 * than an open question about a screenshot. What that CANNOT tell us is whether a real egg survives a
 * real screen — that is what scripts/measure-eggs.ts is for, and its numbers live in EGGS.yml.
 */

import { describe, expect, it } from 'vitest';

import { blur, noise, roundTrip, tint } from '../src/degrade';
import {
	ALPHABET,
	CAP_BOTTOM,
	CAP_TOP,
	CODE_LENGTH,
	DECIMAL,
	DUODECIMAL,
	decodeDigits,
	encodeDigits,
	fieldLimits,
	nearestDigit,
	OCTAL,
	QUATERNARY,
	separation,
	ALPHABETS,
	prefixLength
} from '../src/egg-code';
import { readEggs } from '../src/egg-read';
import { drawEgg } from '../src/egg-render';
import { createRaster, fillRect, getPixel, type Raster } from '../src/raster';

const CODE = { kind: 3, version: 1, id: 47, value: 52 };

/** A floor with some furniture on it, so the reader has to reject things as well as find one. */
function room(width = 200, height = 160): Raster {
	const frame = createRaster(width, height, [92, 84, 72]);
	fillRect(frame, 0, 0, width, 60, [64, 72, 96]); // wall
	fillRect(frame, 12, 30, 40, 30, [250, 250, 250]); // a white poster: bright, neutral, no black below
	fillRect(frame, 150, 90, 30, 40, [10, 10, 12]); // a dark doorway: black, no white above
	fillRect(frame, 70, 100, 24, 8, [232, 208, 56]); // a yellow rug: bright and chromatic
	return frame;
}

describe('the code', () => {
	it('round-trips', () => {
		expect(decodeDigits(encodeDigits(CODE))).toEqual(CODE);
	});

	it('rejects a single misread band', () => {
		const digits = encodeDigits(CODE);
		digits[2] = (digits[2] + 1) % ALPHABET.colours.length;
		expect(decodeDigits(digits)).toBeNull();
	});

	it('rejects a transposition, which an unweighted sum would miss', () => {
		const digits = encodeDigits(CODE);
		[digits[0], digits[1]] = [digits[1], digits[0]];
		expect(decodeDigits(digits)).toBeNull();
	});

	it('rejects a digit outside the alphabet, rather than reading it as something', () => {
		const small = { kind: 3, version: 1, id: 9, value: 6 };
		const digits = encodeDigits(small, QUATERNARY);
		digits[0] = 7;
		expect(decodeDigits(digits, QUATERNARY)).toBeNull();
	});

	it('degrades by truncation: kind and version are the two furthest-legible bands', () => {
		const full = encodeDigits(CODE);
		expect(full.slice(0, prefixLength('far'))).toEqual([CODE.kind, CODE.version]);
		expect(prefixLength('full')).toBe(CODE_LENGTH);
	});

	it('carries a smaller id in a smaller alphabet, and says so instead of overflowing', () => {
		expect(fieldLimits(OCTAL).id).toBe(63);
		expect(fieldLimits(DECIMAL).id).toBe(99);
		expect(() => encodeDigits({ ...CODE, id: 80 }, OCTAL)).toThrow(RangeError);
	});

	it('keeps the caps out of every alphabet, and pays for each extra digit in separation', () => {
		// The closest pair is the noise budget every band lives inside, and it is what buying more
		// digits per band costs. Strictly decreasing is the property that matters: an alphabet that
		// gained digits for free would mean the smaller one had been chosen badly, which is exactly the
		// defect scripts/pick-palettes.ts exists to prevent.
		const gaps = ALPHABETS.map((a) => separation(a));
		expect(gaps).toEqual([...gaps].sort((a, b) => b - a));
		expect(new Set(gaps).size).toBe(gaps.length);
		expect(separation(DUODECIMAL)).toBeGreaterThan(120);

		for (const alphabet of ALPHABETS) {
			for (const colour of alphabet.colours) {
				const toWhite = Math.hypot(colour[0] - CAP_TOP[0], colour[1] - CAP_TOP[1], colour[2] - CAP_TOP[2]);
				const toBlack = Math.hypot(colour[0] - CAP_BOTTOM[0], colour[1] - CAP_BOTTOM[1], colour[2] - CAP_BOTTOM[2]);
				expect(Math.min(toWhite, toBlack)).toBeGreaterThan(60);
			}
		}
	});

	it('reports the margin, not just the winner, so a coin toss is visible', () => {
		const [r, g, b] = ALPHABET.colours[2];
		const clean = nearestDigit([r + 8, g - 6, b + 4]);
		expect(clean.digit).toBe(2);
		expect(clean.margin).toBeGreaterThan(40);

		const between: [number, number, number] = [
			(ALPHABET.colours[2][0] + ALPHABET.colours[3][0]) / 2,
			(ALPHABET.colours[2][1] + ALPHABET.colours[3][1]) / 2,
			(ALPHABET.colours[2][2] + ALPHABET.colours[3][2]) / 2
		];
		expect(nearestDigit(between).margin).toBeLessThan(1);
	});
});

describe('the drawn egg', () => {
	it('puts white above black, so up is unambiguous', () => {
		const frame = createRaster(80, 120, [90, 100, 90]);
		const egg = drawEgg(frame, CODE, { x: 40, y: 100 }, { lit: 'dark' });
		expect(getPixel(frame, 40, egg.box.y + 1)).toEqual([...CAP_TOP]);
		expect(getPixel(frame, 40, egg.box.y + egg.box.height - 2)).toEqual([...CAP_BOTTOM]);
	});

	it('makes the cap one band tall, which is how the reader learns the zoom', () => {
		const frame = createRaster(80, 200, [90, 100, 90]);
		const egg = drawEgg(frame, CODE, { x: 40, y: 180 }, { bandHeight: 7, lit: 'dark' });
		expect(egg.bandHeight).toBe(7);
		expect(egg.box.height).toBe(7 * (egg.digits.length + 2));
	});

	it('draws the digits the zoom can carry, not all of them', () => {
		const frame = createRaster(80, 120, [90, 100, 90]);
		const far = drawEgg(frame, CODE, { x: 40, y: 100 }, { zoom: 'far' });
		expect(far.digits).toEqual([CODE.kind, CODE.version]);
		const full = drawEgg(createRaster(80, 160), CODE, { x: 40, y: 140 }, { zoom: 'full' });
		expect(full.digits.slice(0, 2)).toEqual(far.digits);
	});

	it('leaves a base behind when it levitates', () => {
		const frame = createRaster(80, 160, [90, 100, 90]);
		const egg = drawEgg(frame, CODE, { x: 40, y: 140 }, { levitation: 14, lit: 'dark' });
		expect(egg.box.y + egg.box.height).toBeLessThan(140);
		expect(getPixel(frame, 40, 139)).not.toEqual([90, 100, 90]);
	});

	it('does not need its glow: the bands are identical lit and dark', () => {
		const lit = createRaster(80, 160, [90, 100, 90]);
		const dark = createRaster(80, 160, [90, 100, 90]);
		const a = drawEgg(lit, CODE, { x: 40, y: 140 }, { lit: 'steady' });
		const b = drawEgg(dark, CODE, { x: 40, y: 140 }, { lit: 'dark' });
		expect(a.box).toEqual(b.box);
		for (let y = a.box.y; y < a.box.y + a.box.height; y++) {
			expect(getPixel(lit, 40, y)).toEqual(getPixel(dark, 40, y));
		}
	});
});

describe('reading an egg back', () => {
	it('gets the code out of a clean frame, and measures the band height it was drawn at', () => {
		const frame = room();
		drawEgg(frame, CODE, { x: 100, y: 140 }, { bandHeight: 6, radius: 10 });

		const [reading, ...rest] = readEggs(frame);
		expect(rest).toEqual([]);
		expect(reading.code).toEqual(CODE);
		expect(reading.bandHeight).toBe(6);
		expect(reading.digits).toEqual(encodeDigits(CODE));
		expect(reading.confidence).toBeGreaterThan(1);
	});

	it('finds it where it was drawn, not merely somewhere', () => {
		const frame = room();
		const drawn = drawEgg(frame, CODE, { x: 100, y: 140 }, { bandHeight: 6, radius: 10 });
		const [reading] = readEggs(frame);

		expect(reading.box.y).toBe(drawn.box.y);
		expect(reading.box.height).toBe(drawn.box.height);
		// The taper means the widest row is not the box width, so the found width is within it.
		expect(reading.box.x).toBeGreaterThanOrEqual(drawn.box.x);
		expect(reading.box.width).toBeLessThanOrEqual(drawn.box.width + 2);
	});

	it('is not fooled by a white poster, a dark doorway or a yellow rug', () => {
		expect(readEggs(room())).toEqual([]);
	});

	it('reads a coarse-zoom egg as a prefix, and refuses to call it a code', () => {
		const frame = room();
		drawEgg(frame, CODE, { x: 100, y: 140 }, { zoom: 'mid', bandHeight: 6, radius: 10 });

		const [reading] = readEggs(frame);
		expect(reading.digits).toEqual(encodeDigits(CODE).slice(0, 4));
		expect(reading.code).toBeNull();
		expect(reading.refused).toBe('partial');
	});

	it('reads several eggs in one frame, each with its own code', () => {
		const frame = room(300, 160);
		const codes = [CODE, { kind: 1, version: 1, id: 7, value: 0 }, { kind: 5, version: 1, id: 63, value: 63 }];
		codes.forEach((code, i) => drawEgg(frame, code, { x: 60 + i * 90, y: 150 }, { bandHeight: 5, radius: 9 }));

		const readings = readEggs(frame).sort((a, b) => a.box.x - b.box.x);
		expect(readings.map((r) => r.code)).toEqual(codes);
	});

	it('corrects a night-lit egg off its own caps', () => {
		const frame = room();
		drawEgg(frame, CODE, { x: 100, y: 140 }, { bandHeight: 6, radius: 10, lit: 'dark' });
		// A blue evening, dimmed: the drawn colours are nothing like the palette any more.
		const evening = tint(frame, [0.62, 0.7, 1.05]);

		expect(readEggs(evening)[0]?.code).toEqual(CODE);
	});

	it('survives noise and soft focus at a workable size', () => {
		const frame = room();
		drawEgg(frame, CODE, { x: 100, y: 148 }, { bandHeight: 8, radius: 12, lit: 'dark' });

		expect(readEggs(noise(frame, 10))[0]?.code).toEqual(CODE);
		expect(readEggs(blur(frame, 1))[0]?.code).toEqual(CODE);
	});

	it('refuses rather than inventing when the egg is too small to slice', () => {
		const frame = room();
		drawEgg(frame, CODE, { x: 100, y: 140 }, { bandHeight: 2, radius: 5, lit: 'dark' });
		const squashed = roundTrip(frame, 0.34);

		for (const reading of readEggs(squashed)) {
			expect(reading.code).toBeNull();
		}
	});

	it('reports a broken stack as a refusal with the digits it saw', () => {
		const frame = room();
		const drawn = drawEgg(frame, CODE, { x: 100, y: 140 }, { bandHeight: 6, radius: 10, lit: 'dark' });
		// Paint one band a colour from between two palette entries: the structure survives, the value
		// does not, and that distinction is the whole point of reporting the margin.
		const a = ALPHABET.colours[2];
		const b = ALPHABET.colours[3];
		fillRect(frame, 96, drawn.box.y + 6 * 3 + 1, 8, 4, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);

		const [reading] = readEggs(frame);
		expect(reading.code).toBeNull();
		expect(reading.refused).toBe('margin');
		expect(reading.digits.length).toBe(CODE_LENGTH);
	});
});
