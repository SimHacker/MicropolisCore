/**
 * The coverage matcher, tested against fonts built here rather than lifted from a game.
 *
 * A synthetic font is enough to prove the thing that matters: text drawn by blending coverage over a
 * background can be read back without telling the reader what colour anything was. That is the whole
 * claim, and it holds or fails independently of anyone having The Sims installed.
 */

import { describe, expect, it } from 'vitest';

import {
	createRaster,
	drawCoverageText,
	fillRect,
	loadCoverageFont,
	measureCoverageText,
	packCoverageFont,
	prepareCoverageFont,
	readCoverageLine,
	unpackCoverageFont,
	type CoverageFont
} from '../src/index';

/**
 * A small anti-aliased font, drawn as ASCII with digits for coverage.
 *
 * Deliberately awkward: two letters differ by one column, one is a strict subset of another, and one
 * is a single stroke that fits inside all of them. If the matcher can be fooled by a fragment, these
 * are the shapes that will do it.
 */
const ART: Record<string, string[]> = {
	I: ['.8f8.', '..f..', '..f..', '..f..', '.8f8.'],
	H: ['f...f', 'f...f', 'ffbff', 'f...f', 'f...f'],
	N: ['f...f', 'ff..f', 'f8b8f', 'f..ff', 'f...f'],
	O: ['.bfb.', 'f...f', 'f...f', 'f...f', '.bfb.'],
	C: ['.bff8', 'f....', 'f....', 'f....', '.bff8'],
	L: ['f....', 'f....', 'f....', 'f....', 'fffff'],
	i: ['..f..', '.....', '..f..', '..f..', '..f..']
};

function buildFont(): CoverageFont {
	const glyphs = Object.entries(ART).map(([char, rows]) => {
		const cov: number[] = [];
		rows.forEach((row, y) => {
			[...row].forEach((cell, x) => {
				if (cell === '.') return;
				cov.push(x, y, parseInt(cell, 16));
			});
		});
		return { char, code: char.charCodeAt(0), width: 6, cov };
	});
	glyphs.push({ char: ' ', code: 32, width: 4, cov: [] });
	return loadCoverageFont({ name: 'test', size: 5, height: 7, levels: 15, spaceWidth: 4, glyphs });
}

const font = buildFont();
const prepared = prepareCoverageFont(font);

describe('coverage fonts', () => {
	it('reads back text drawn over a flat background', () => {
		const raster = createRaster(200, 12, [40, 44, 92]);
		drawCoverageText(raster, font, 'HOLI', 4, 3, [232, 236, 255]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 3, maxX: 200 });
		expect(read.text).toBe('HOLI');
		expect(read.confidence).toBeGreaterThan(0.95);
	});

	it('reads dark text on a light background, having been told neither', () => {
		const raster = createRaster(200, 12, [236, 232, 220]);
		drawCoverageText(raster, font, 'CHILL', 4, 3, [20, 20, 30]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 3, maxX: 200 });
		expect(read.text).toBe('CHILL');
	});

	it('is not fooled by a stroke that fits inside a letter', () => {
		const raster = createRaster(100, 12, [40, 44, 92]);
		drawCoverageText(raster, font, 'H', 4, 3, [232, 236, 255]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 3, maxX: 100 });
		expect(read.text).toBe('H');
	});

	it('infers a space from the gap, since a space has no ink to match', () => {
		const raster = createRaster(200, 12, [40, 44, 92]);
		drawCoverageText(raster, font, 'HI OIL', 4, 3, [232, 236, 255]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 3, maxX: 200 });
		expect(read.text).toBe('HI OIL');
	});

	it('survives the text being drawn in a colour close to the panel', () => {
		const raster = createRaster(200, 12, [90, 94, 120]);
		drawCoverageText(raster, font, 'COIL', 4, 3, [150, 154, 180]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 3, maxX: 200 });
		expect(read.text).toBe('COIL');
	});

	it('reports no text rather than inventing it on an empty strip', () => {
		const raster = createRaster(200, 12, [40, 44, 92]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 3, maxX: 200 });
		expect(read.text).toBe('');
		expect(read.confidence).toBe(0);
	});

	it('collapses rather than lying when the text is at the wrong scale', () => {
		const raster = createRaster(200, 24, [40, 44, 92]);
		drawCoverageText(raster, font, 'HOLI', 4, 3, [232, 236, 255]);
		// Reading one row low is the cheapest stand-in for a scaled or mispositioned frame.
		const read = readCoverageLine(raster, prepared, { x: 4, y: 5, maxX: 200 });
		expect(read.text).not.toBe('HOLI');
		expect(read.confidence).toBeLessThan(0.9);
	});

	it('measures what it draws', () => {
		const raster = createRaster(200, 12, [40, 44, 92]);
		const drawn = drawCoverageText(raster, font, 'HI HO', 4, 3, [232, 236, 255]);
		expect(drawn).toBe(measureCoverageText(font, 'HI HO'));
	});

	it('does not lose a pixel through the packed form', () => {
		const bytes = packCoverageFont(font);
		const back = unpackCoverageFont(bytes);
		expect(back.name).toBe(font.name);
		expect(back.height).toBe(font.height);
		expect(back.spaceWidth).toBe(font.spaceWidth);
		for (const glyph of font.glyphs) {
			const other = back.glyphs.find((g) => g.code === glyph.code);
			expect(other, glyph.char).toBeDefined();
			expect(other!.width).toBe(glyph.width);
			expect(other!.cov).toEqual(glyph.cov);
		}
	});

	it('spends two pixels per byte on the glyphs themselves', () => {
		const bytes = packCoverageFont(font);
		// Everything before the plane is the header and the 256-entry table, both fixed.
		const plane = bytes.length - (16 + 8 + 256 * 10);
		const boxPixels = Object.values(ART).reduce((n, rows) => n + rows.length * rows[0].length, 0);
		expect(plane).toBeLessThanOrEqual(Math.ceil(boxPixels / 2) + Object.keys(ART).length * 5);
		expect(plane).toBeGreaterThan(0);
	});

	it('stores glyphs in less space than a coordinate per pixel would', () => {
		const bytes = packCoverageFont(font);
		const inkPixels = font.glyphs.reduce((n, g) => n + g.cov.length / 3, 0);
		// A sparse x,y,level encoding is the intuitive choice and is bigger, before compression and
		// after it: coordinates are entropy, whereas the plane's zeroes are positional. Measured on
		// the glyphs alone, since at this size the fixed table dwarfs everything.
		const plane = bytes.length - (16 + 8 + 256 * 10);
		expect(plane).toBeLessThan(inkPixels * 3);
	});

	it('reads a line off a background with art behind it', () => {
		const raster = createRaster(200, 14, [40, 44, 92]);
		for (let x = 0; x < 200; x += 7) fillRect(raster, x, 0, 3, 14, [52, 40, 100]);
		drawCoverageText(raster, font, 'ICH', 4, 4, [240, 240, 250]);
		const read = readCoverageLine(raster, prepared, { x: 4, y: 4, maxX: 200 });
		expect(read.text).toBe('ICH');
	});
});
