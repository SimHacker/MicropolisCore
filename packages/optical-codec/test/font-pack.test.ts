/**
 * The pack format and the Canvas-shaped surface over it.
 *
 * The font here is invented — three glyphs of known coverage — because the questions being asked are
 * about the container and the metrics, not about any real typeface. A face built by hand is one whose
 * every answer can be worked out on paper, which is what makes a failure here mean something.
 */

import { deflateRawSync, inflateRawSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { createFontContext, deriveBaseline } from '../src/font-context';
import { decodeFontPack, encodeFontPack, faceNamed, faceOfSize } from '../src/font-pack';
import { createRaster, getPixel } from '../src/raster';
import type { CoverageFont } from '../src/coverage-font';

/**
 * A 3x5 block letter and a 1x5 bar, on a 7-row line with the baseline 5 rows down.
 *
 * The space advances 4, which is wider than any letter's side bearing here. That is not decoration:
 * a space is a gap and nothing else, so a face whose space is no wider than its letter spacing has
 * word breaks that cannot be recovered from pixels by anyone. See the test that says so.
 */
function testFace(name = 'Test', size = 5): CoverageFont {
	const block: number[] = [];
	for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) block.push(x, y, 15);
	const bar: number[] = [];
	for (let y = 0; y < 5; y++) bar.push(0, y, 15);
	// A glyph with a descender, to prove the baseline is measured off the capitals and not the box.
	const tail: number[] = [];
	for (let y = 0; y < 7; y++) tail.push(0, y, 8);

	return {
		name,
		size,
		height: 7,
		levels: 15,
		spaceWidth: 4,
		glyphs: [
			{ char: 'O', code: 79, width: 4, cov: block },
			{ char: 'I', code: 73, width: 2, cov: bar },
			{ char: 'p', code: 112, width: 2, cov: tail },
			{ char: ' ', code: 32, width: 4, cov: [] }
		]
	};
}

describe('the pack format', () => {
	const deflate = (bytes: Uint8Array) => new Uint8Array(deflateRawSync(bytes, { level: 9 }));
	const inflate = (bytes: Uint8Array) => new Uint8Array(inflateRawSync(bytes));

	it('round trips faces and provenance', () => {
		const pack = { faces: [testFace('One', 5), testFace('Two', 9)], meta: { where: 'nowhere', why: 'a test' } };
		const back = decodeFontPack(encodeFontPack(pack, deflate), inflate);

		expect(back.faces.map((f) => f.name)).toEqual(['One', 'Two']);
		expect(back.meta).toEqual(pack.meta);
		expect(back.faces[0].glyphs.find((g) => g.char === 'O')?.cov).toEqual(pack.faces[0].glyphs[0].cov);
	});

	it('round trips uncompressed too, for a caller with no codec to hand', () => {
		const back = decodeFontPack(encodeFontPack({ faces: [testFace()] }));
		expect(back.faces[0].glyphs.length).toBe(4);
	});

	it('keeps a baseline the source knew, and leaves it out when it did not', () => {
		const withBaseline = { ...testFace(), baseline: 5 };
		expect(decodeFontPack(encodeFontPack({ faces: [withBaseline] })).faces[0].baseline).toBe(5);
		expect(decodeFontPack(encodeFontPack({ faces: [testFace()] })).faces[0].baseline).toBeUndefined();
	});

	it('refuses a file that is not one, rather than returning nonsense', () => {
		expect(() => decodeFontPack(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toThrow(/magic/);
	});

	it('says so when it is handed a deflated pack and no way to inflate it', () => {
		const bytes = encodeFontPack({ faces: [testFace()], meta: { padding: 'x'.repeat(4000) } }, deflate);
		expect(() => decodeFontPack(bytes)).toThrow(/inflate/);
	});

	it('finds faces by size and by name', () => {
		const pack = { faces: [testFace('Small', 5), testFace('Large', 9)] };
		expect(faceOfSize(pack, 9)?.name).toBe('Large');
		expect(faceNamed(pack, 'Small')?.size).toBe(5);
		expect(faceOfSize(pack, 11)).toBeUndefined();
	});
});

describe('the font context', () => {
	it('measures the baseline off the capitals, not off the line box', () => {
		// The capitals are 5 rows tall from the top of the line, so the baseline is row 5.
		expect(deriveBaseline(testFace())).toBe(5);
	});

	it('measures an advance the way it draws one', () => {
		const font = createFontContext(testFace(), { textBaseline: 'top' });
		const frame = createRaster(40, 12, [0, 0, 0]);
		expect(font.fillText(frame, 'OI O', 0, 0, [255, 255, 255])).toBe(font.measureText('OI O').width);
		// O=4, I=2, space=4, O=4.
		expect(font.measureText('OI O').width).toBe(14);
	});

	it('reports ink extents separately from the advance, as Canvas does', () => {
		const metrics = createFontContext(testFace()).measureText('O');
		expect(metrics.width).toBe(4);
		// Three columns of ink inside a four-column advance: the fourth is side bearing.
		expect(metrics.actualBoundingBoxRight).toBe(3);
		expect(metrics.actualBoundingBoxAscent).toBe(5);
		expect(metrics.actualBoundingBoxDescent).toBe(0);
	});

	it('puts the descender below the baseline where it belongs', () => {
		const metrics = createFontContext(testFace()).measureText('p');
		expect(metrics.actualBoundingBoxDescent).toBe(2);
	});

	it('honours the baseline it was asked for', () => {
		const face = testFace();
		const fromTop = createRaster(20, 20, [0, 0, 0]);
		const onBaseline = createRaster(20, 20, [0, 0, 0]);
		createFontContext(face, { textBaseline: 'top' }).fillText(fromTop, 'O', 2, 3, [255, 255, 255]);
		createFontContext(face, { textBaseline: 'alphabetic' }).fillText(onBaseline, 'O', 2, 8, [255, 255, 255]);
		expect(onBaseline.data).toEqual(fromTop.data);
	});

	it('honours alignment', () => {
		const face = testFace();
		const right = createRaster(20, 12, [0, 0, 0]);
		createFontContext(face, { textBaseline: 'top', textAlign: 'right' }).fillText(right, 'O', 12, 0, [255, 255, 255]);
		// The advance is 4, so a right-aligned O starts at 8 and its ink ends at 10.
		expect(getPixel(right, 8, 0)).toEqual([255, 255, 255]);
		expect(getPixel(right, 11, 0)).toEqual([0, 0, 0]);
	});

	it('reads back what it drew, at whatever colour it drew it', () => {
		const font = createFontContext(testFace(), { textBaseline: 'top' });
		for (const [background, ink] of [
			[[0, 0, 0], [255, 255, 255]],
			[[220, 210, 190], [20, 20, 30]]
		] as const) {
			const frame = createRaster(40, 12, background);
			font.fillText(frame, 'OI IO', 2, 2, ink);
			expect(font.readText(frame, 2, 2).text).toBe('OI IO');
		}
	});

	it('cannot see a space no wider than its letter spacing, and does not invent one', () => {
		// A 2-pixel space between glyphs that already carry a pixel of side bearing is not a signal.
		// The reader drops the word break rather than guessing at it, which is the honest failure.
		const narrow = { ...testFace(), spaceWidth: 2, glyphs: testFace().glyphs.map((g) => (g.code === 32 ? { ...g, width: 2 } : g)) };
		const font = createFontContext(narrow, { textBaseline: 'top' });
		const frame = createRaster(40, 12, [0, 0, 0]);
		font.fillText(frame, 'OI IO', 2, 2, [255, 255, 255]);
		expect(font.readText(frame, 2, 2).text).toBe('OIIO');
	});

	it('hands back a new context rather than mutating the one it has', () => {
		const font = createFontContext(testFace(), { textBaseline: 'top' });
		const centred = font.with({ textAlign: 'center' });
		expect(centred).not.toBe(font);
		const a = createRaster(20, 12, [0, 0, 0]);
		const b = createRaster(20, 12, [0, 0, 0]);
		font.fillText(a, 'O', 8, 0, [255, 255, 255]);
		centred.fillText(b, 'O', 8, 0, [255, 255, 255]);
		expect(b.data).not.toEqual(a.data);
	});
});
