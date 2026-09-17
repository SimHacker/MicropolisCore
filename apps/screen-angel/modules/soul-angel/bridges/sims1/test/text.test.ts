/**
 * The font recogniser, tested by drawing with the same patterns it reads.
 *
 * No screenshots of The Sims are involved. The font data came out of the game, so rendering a string
 * with it produces the pixels the game would produce, and reading them back exercises the matcher
 * exactly as a real frame does — with the enormous advantage that the expected answer is known.
 *
 * Two fonts and two matchers appear below, which is not duplication. The 2004 capture is aliased
 * pixels in the colours they were captured in, matched by colour; the game's own file is coverage
 * masks, matched by fitting the blend. The panel is read with the second, because that is what the
 * game actually draws with; the first is tested because it is the historical artifact and because it
 * is present whether or not anyone has the game installed.
 */

import { describe, expect, it } from 'vitest';

import { createRaster, drawText, fillRect, measureText, setPixel, type Raster } from '@micropolis/optical-codec';
import { drawCoverageText, measureCoverageText, noise, readCoverageLine, tint } from '@micropolis/optical-codec';

import { hasGameFont, PANEL_FONT_SIZE, sims1CapturedFont, sims1GameFont, sims1PanelFont } from '../src/text/font';
import { findPanel, readPanelText } from '../src/text/panel';
import { readLine } from '@micropolis/optical-codec';

const font = sims1CapturedFont();

describe('the 2004 captured font', () => {
	it('has the printable ASCII range', () => {
		expect(font.glyphs.length).toBe(94);
		expect(font.height).toBe(16);
		const chars = font.glyphs.map((g) => g.char).join('');
		for (const c of 'ABCXYZabcxyz0189!?.,') expect(chars).toContain(c);
	});

	it('gives every glyph some ink', () => {
		for (const g of font.glyphs) expect(g.ink.length).toBeGreaterThan(0);
	});
});

describe('reading a line', () => {
	function render(text: string, background: [number, number, number] = [0, 0, 0]): Raster {
		const width = measureText(font, text) + 40;
		const frame = createRaster(width, font.height + 8, background);
		drawText(frame, font, text, 8, 4);
		return frame;
	}

	it('reads back what was drawn', () => {
		const text = 'Cheap Eazzzy Chair';
		const frame = render(text);
		const read = readLine(frame, font, { x: 8, y: 4, maxX: frame.width });
		expect(read.text).toBe(text);
		expect(read.confidence).toBe(1);
	});

	it('reads digits and punctuation', () => {
		const text = 'Simoleons: $1,349 (used)';
		const read = readLine(render(text), font, { x: 8, y: 4, maxX: 999 });
		expect(read.text).toBe(text);
	});

	it('infers the spaces it cannot see', () => {
		// Space has no ink, so it is a gap rather than a glyph. Two words, one gap, one space.
		const read = readLine(render('two words'), font, { x: 8, y: 4, maxX: 999 });
		expect(read.text).toBe('two words');
	});

	it('finds text without being told where it starts', () => {
		const frame = render('Comfy');
		const read = readLine(frame, font, { x: 0, y: 4, maxX: frame.width });
		expect(read.text.trim()).toBe('Comfy');
	});

	it('survives the colour drift the fuzz was chosen for', () => {
		const drifted = tint(render('Motive Decay'), [1.04, 0.98, 0.95]);
		const read = readLine(drifted, font, { x: 8, y: 4, maxX: 999 });
		expect(read.text).toBe('Motive Decay');
	});

	it('survives mild noise', () => {
		const dirty = noise(render('Hunger'), 8, 3);
		const read = readLine(dirty, font, { x: 8, y: 4, maxX: 999 });
		expect(read.text).toBe('Hunger');
	});

	it('reports low confidence rather than lying, when the text is off the pixel grid', () => {
		// One pixel down from where it says to look: every glyph is now sampling the wrong rows.
		const frame = render('Energy');
		const read = readLine(frame, font, { x: 8, y: 5, maxX: frame.width });
		if (read.text === 'Energy') throw new Error('expected a misread when sampling the wrong row');
		expect(read.confidence).toBeLessThan(0.95);
	});
});

/**
 * The game's own font, when there is a game to take it from.
 *
 * Skipped rather than failed without one: these assets are lifted from an installation by
 * tools/compile-gzfont.ts and are nobody's to redistribute casually, so a checkout without them is a
 * normal state of affairs and not a broken build.
 */
const withGameFont = hasGameFont(PANEL_FONT_SIZE) ? describe : describe.skip;

withGameFont("the game's own font", () => {
	const gameFont = sims1GameFont(PANEL_FONT_SIZE);
	const prepared = sims1PanelFont();
	const panelBlue = [40, 44, 92] as const;
	const textWhite = [236, 240, 255] as const;

	it('is the size the interface draws its descriptions in', () => {
		expect(gameFont.size).toBe(8);
		expect(gameFont.height).toBe(16);
		expect(gameFont.levels).toBe(15);
		// The printable ASCII range, plus the accented characters the localisations need.
		expect(gameFont.glyphs.filter((g) => g.cov.length > 0).length).toBeGreaterThan(94);
	});

	it('reads back anti-aliased text without being told what colour it is', () => {
		const text = 'Cheap Eazzzy Chair';
		const width = measureCoverageText(gameFont, text) + 40;
		const frame = createRaster(width, gameFont.height + 8, panelBlue);
		drawCoverageText(frame, gameFont, text, 8, 4, textWhite);
		const read = readCoverageLine(frame, prepared, { x: 8, y: 4, maxX: frame.width });
		expect(read.text).toBe(text);
		expect(read.confidence).toBeGreaterThan(0.9);
	});

	it('reads the same glyphs in a different colour, which is the point of coverage', () => {
		const text = 'Simoleons: $1,349';
		const frame = createRaster(measureCoverageText(gameFont, text) + 40, gameFont.height + 8, [200, 196, 180]);
		drawCoverageText(frame, gameFont, text, 8, 4, [30, 28, 24]);
		const read = readCoverageLine(frame, prepared, { x: 8, y: 4, maxX: frame.width });
		expect(read.text).toBe(text);
	});
});

withGameFont('the control panel', () => {
	const gameFont = sims1GameFont(PANEL_FONT_SIZE);

	/** An 800x600 frame with the panel's corner signature painted where the finder looks for it. */
	function frameWithPanel(topY: number, lines: string[]): Raster {
		const frame = createRaster(800, 600, [12, 14, 20]);
		fillRect(frame, 241, topY, 559, 500 - topY, [40, 44, 92]);
		setPixel(frame, 241, 499, [0, 0, 57]);
		setPixel(frame, 799, 499, [0, 0, 41]);
		setPixel(frame, 241, topY, [148, 150, 206]);
		setPixel(frame, 799, topY, [0, 4, 66]);
		lines.forEach((line, i) => drawCoverageText(frame, gameFont, line, 419, topY + 31 + i * gameFont.height, [236, 240, 255]));
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
		const panel = readPanelText(frameWithPanel(400, lines), sims1PanelFont());
		expect(panel).not.toBeNull();
		expect(panel?.description).toBe(lines.join('\n'));
		expect(panel?.confidence).toBeGreaterThan(0.9);
	});

	it('drops the empty lines below the text instead of returning blank rows', () => {
		const panel = readPanelText(frameWithPanel(380, ['One line only']), sims1PanelFont());
		expect(panel?.description).toBe('One line only');
	});
});
