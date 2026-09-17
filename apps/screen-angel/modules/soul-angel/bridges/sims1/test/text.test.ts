/**
 * The font reader, tested by drawing with the same numbers it reads.
 *
 * No screenshots of The Sims are involved and none are needed. The faces came out of the game, so
 * rendering a string with one produces the pixels the game would produce, and reading them back
 * exercises the reader exactly as a real frame does — with the enormous advantage that the expected
 * answer is known. Draw and read run off the same coverage and the same advances, so a disagreement
 * between them is a bug in one of two functions rather than an argument about a screenshot.
 *
 * Two faces appear below and it is not duplication. The game's own file is what the interface draws
 * with, so the panel is read with that. The 2004 capture is the same face measured by hand off a
 * screen, so it is the test that the reader survives pixels that came from a display rather than
 * from an asset we drew ourselves.
 */

import { describe, expect, it } from 'vitest';

import { createRaster, fillRect, noise, setPixel, tint, type Raster } from '@micropolis/optical-codec';

import { hasFontPack, PANEL_FONT_SIZE, sims1CapturedFont, sims1Font, sims1PanelFont } from '../src/text/font';
import { findPanel, readPanelText } from '../src/text/panel';

/**
 * Skipped rather than failed without the pack: it is built from an installation by
 * tools/import-fonts.ts, and a checkout that cannot find it is a normal state of affairs rather than
 * a broken build.
 */
const withFonts = hasFontPack() ? describe : describe.skip;

withFonts('the 2004 captured face', () => {
	const font = sims1CapturedFont();

	it('has the printable ASCII range, as coverage like everything else', () => {
		expect(font.face.glyphs.filter((g) => g.cov.length > 0).length).toBe(94);
		expect(font.lineHeight).toBe(16);
		const chars = font.face.glyphs.map((g) => g.char).join('');
		for (const c of 'ABCXYZabcxyz0189!?.,') expect(chars).toContain(c);
	});

	it('agrees with the game face it was identified as, on the line box and the baseline', () => {
		const game = sims1Font(PANEL_FONT_SIZE);
		expect(font.lineHeight).toBe(game.lineHeight);
		expect(font.ascent).toBe(game.ascent);
	});

	function render(text: string, background: [number, number, number] = [0, 0, 0]): Raster {
		const font2 = sims1CapturedFont();
		const frame = createRaster(font2.measureText(text).width + 40, font2.lineHeight + 8, background);
		font2.fillText(frame, text, 8, 4);
		return frame;
	}

	it('reads back what was drawn', () => {
		const text = 'Cheap Eazzzy Chair';
		const frame = render(text);
		const read = font.readText(frame, 8, 4);
		expect(read.text).toBe(text);
		expect(read.confidence).toBeGreaterThan(0.9);
	});

	it('reads digits and punctuation', () => {
		const text = 'Simoleons: $1,349 (used)';
		expect(font.readText(render(text), 8, 4).text).toBe(text);
	});

	it('infers the spaces it cannot see', () => {
		// Space has no ink, so it is a gap rather than a glyph. Two words, one gap, one space.
		expect(font.readText(render('two words'), 8, 4).text).toBe('two words');
	});

	it('survives the colour drift a captured face was always going to meet', () => {
		expect(font.readText(tint(render('Motive Decay'), [1.04, 0.98, 0.95]), 8, 4).text).toBe('Motive Decay');
	});

	it('survives mild noise', () => {
		expect(font.readText(noise(render('Hunger'), 8, 3), 8, 4).text).toBe('Hunger');
	});
});

withFonts("the game's own face", () => {
	const font = sims1PanelFont();
	const panelBlue = [40, 44, 92] as const;
	const textWhite = [236, 240, 255] as const;

	it('is the size the interface draws its descriptions in', () => {
		expect(font.face.size).toBe(8);
		expect(font.lineHeight).toBe(16);
		expect(font.face.levels).toBe(15);
		expect(font.ascent + font.descent).toBe(font.lineHeight);
		// The printable ASCII range, plus the accented characters the localisations need.
		expect(font.face.glyphs.filter((g) => g.cov.length > 0).length).toBeGreaterThan(94);
	});

	it('measures what it draws', () => {
		const text = 'Comfort 4, Room 2';
		const frame = createRaster(400, 40, panelBlue);
		expect(font.fillText(frame, text, 8, 4, textWhite)).toBe(font.measureText(text).width);
	});

	it('reads back anti-aliased text without being told what colour it is', () => {
		const text = 'Cheap Eazzzy Chair';
		const frame = createRaster(font.measureText(text).width + 40, font.lineHeight + 8, panelBlue);
		font.fillText(frame, text, 8, 4, textWhite);
		const read = font.readText(frame, 8, 4);
		expect(read.text).toBe(text);
		expect(read.confidence).toBeGreaterThan(0.9);
	});

	it('reads the same glyphs in a different colour, which is the point of coverage', () => {
		const text = 'Simoleons: $1,349';
		const frame = createRaster(font.measureText(text).width + 40, font.lineHeight + 8, [200, 196, 180]);
		font.fillText(frame, text, 8, 4, [30, 28, 24]);
		expect(font.readText(frame, 8, 4).text).toBe(text);
	});

	it('puts the baseline where a Canvas caller would expect it', () => {
		const text = 'Handgloves';
		const onBaseline = createRaster(200, 40, panelBlue);
		const fromTop = createRaster(200, 40, panelBlue);
		font.with({ textBaseline: 'alphabetic' }).fillText(onBaseline, text, 8, 4 + font.ascent, textWhite);
		font.fillText(fromTop, text, 8, 4, textWhite);
		expect(onBaseline.data).toEqual(fromTop.data);
	});
});

withFonts('the control panel', () => {
	const font = sims1PanelFont();

	/** An 800x600 frame with the panel's corner signature painted where the finder looks for it. */
	function frameWithPanel(topY: number, lines: string[]): Raster {
		const frame = createRaster(800, 600, [12, 14, 20]);
		fillRect(frame, 241, topY, 559, 500 - topY, [40, 44, 92]);
		setPixel(frame, 241, 499, [0, 0, 57]);
		setPixel(frame, 799, 499, [0, 0, 41]);
		setPixel(frame, 241, topY, [148, 150, 206]);
		setPixel(frame, 799, topY, [0, 4, 66]);
		lines.forEach((line, i) => font.fillText(frame, line, 419, topY + 31 + i * font.lineHeight, [236, 240, 255]));
		return frame;
	}

	it('finds the panel by its corners', () => {
		const region = findPanel(frameWithPanel(420, []));
		expect(region).not.toBeNull();
		expect(region).toMatchObject({ x: 241, y: 420, width: 558, height: 79 });
	});

	it('says nothing rather than guessing when there is no panel', () => {
		expect(findPanel(createRaster(800, 600, [12, 14, 20]))).toBeNull();
	});

	it('reads the description the way the game wrapped it', () => {
		const lines = ['Comfy Chair', 'Comfort 4, Room 2', 'Cheap and cheerful.'];
		const panel = readPanelText(frameWithPanel(400, lines), font);
		expect(panel).not.toBeNull();
		expect(panel?.description).toBe(lines.join('\n'));
		expect(panel?.confidence).toBeGreaterThan(0.9);
	});

	it('drops the empty lines below the text instead of returning blank rows', () => {
		const panel = readPanelText(frameWithPanel(380, ['One line only']), font);
		expect(panel?.description).toBe('One line only');
	});
});
