/**
 * Reading text off a screen by matching the font it was drawn with.
 *
 * Not OCR. OCR guesses at letters drawn by an unknown font at an unknown size, and pays for that
 * generality in every direction. This does the opposite: it has the exact bitmap the application
 * draws with, so a character is not recognised, it is CONFIRMED — sample the handful of pixels that
 * should have ink, check their colours, and the highest-scoring glyph wins. It costs a few hundred
 * comparisons per character, has no model in it, and gets the same answer every time.
 *
 * Ported from Don Hopkins' Simplifier (2004), which read The Sims 1 interface aloud for a game that
 * exposes nothing to the accessibility tree. The scoring is his, kept deliberately: it is tuned
 * against a real screen, and the one part that looks like a hack — a hard penalty for finding pure
 * black where ink is expected — is what stops a tooltip's dark border from being read as letters.
 *
 * What it needs to be true: the text is drawn at native scale, at integer pixel positions, in the
 * font the pattern came from. Where that does not hold, nothing here will work, and that is what
 * the codes in OPTICAL-CHANNEL.yml are for.
 */

import { getPixel, setPixel, type RGB, type Raster } from './raster';

export interface GlyphPattern {
	char: string;
	code: number;
	/** Advance width, and the width of the cell sampled. */
	width: number;
	/**
	 * Ink pixels, flat: x, y, r, g, b, repeating.
	 *
	 * Flat because this is the inner loop of the whole matcher, and an array of small objects makes
	 * every character a few hundred property lookups instead of a walk over one buffer.
	 */
	ink: number[];
}

export interface BitmapFont {
	name: string;
	height: number;
	descent: number;
	/** Sum of absolute per-channel differences a pixel may be off and still count as a match. */
	defaultFuzz: number;
	glyphs: GlyphPattern[];
}

/** Liberal in what it accepts: enough validation to fail with a useful sentence. */
export function loadBitmapFont(source: unknown): BitmapFont {
	const f = source as Partial<BitmapFont>;
	if (!f || !Array.isArray(f.glyphs) || f.glyphs.length === 0) {
		throw new Error('not a bitmap font: no glyphs');
	}
	if (typeof f.height !== 'number' || f.height <= 0) {
		throw new Error('not a bitmap font: no height');
	}
	for (const g of f.glyphs) {
		if (typeof g.width !== 'number' || !Array.isArray(g.ink) || g.ink.length % 5 !== 0) {
			throw new Error(`glyph ${JSON.stringify(g.char)} is malformed`);
		}
	}
	return {
		name: f.name ?? 'unnamed',
		height: f.height,
		descent: f.descent ?? 0,
		defaultFuzz: f.defaultFuzz ?? 36,
		glyphs: f.glyphs
	};
}

export interface ReadOptions {
	/** Where to start, in pixels. */
	x: number;
	y: number;
	/** Where to stop. A line wraps at maxX; a block ends at maxY. */
	maxX: number;
	maxY?: number;
	/** Per-pixel colour tolerance. Defaults to the font's own. */
	fuzz?: number;
	/**
	 * Blank columns that count as a word break.
	 *
	 * Space has no ink, so it cannot be matched, only inferred from a gap — which is why this number
	 * exists and why it is a knob rather than a constant.
	 */
	spaceWidth?: number;
	/**
	 * Fraction of a glyph's ink that must match before it is believed. Defaults to 0.8.
	 *
	 * The one place this departs from the 2004 code, and it is a fix rather than a preference. The
	 * original accepted any glyph scoring above -1, which on a black background was safe: a wrong
	 * glyph landed some of its ink on the background, and background-is-black scored -10 and killed
	 * it. On a panel that is dark blue rather than black that protection is gone, and a three-pixel
	 * hyphen matching two pixels of a four's crossbar wins the position and eats the digit. Requiring
	 * most of a glyph's ink to be present costs nothing and closes the hole. Lower it to trade false
	 * characters for tolerance of a blurrier screen.
	 */
	minInkRatio?: number;
}

export interface ReadChar {
	char: string;
	x: number;
	y: number;
	/** The match score. Higher is better; the winner had to beat every other glyph. */
	score: number;
	/** Ink pixels that matched, and how many there were. A weak read is visible here. */
	matched: number;
	ink: number;
}

export interface ReadResult {
	text: string;
	chars: ReadChar[];
	/**
	 * Matched ink over total ink across the whole read.
	 *
	 * One number for "did this work". Above about 0.95 the text is right; below 0.8 something is
	 * wrong with the position, the scale or the font, and the text will be nonsense rather than
	 * slightly wrong — which is the useful failure mode, since nonsense is detectable.
	 */
	confidence: number;
}

/**
 * Read one line of text, left to right.
 *
 * The walk is the 2004 algorithm: at each position, score every glyph and take the best. On a miss,
 * step one pixel and count it as blank. Wide glyphs win over narrow ones on their own merits, since
 * more ink means more points available, and a wrong guess bails out early on its second bad pixel.
 */
export function readLine(raster: Raster, font: BitmapFont, options: ReadOptions): ReadResult {
	const fuzz = options.fuzz ?? font.defaultFuzz;
	const spaceWidth = options.spaceWidth ?? 3;
	const minInkRatio = options.minInkRatio ?? 0.8;
	const chars: ReadChar[] = [];
	let text = '';
	let x = options.x;
	let blank = 0;
	let pendingSpace = true; // no leading space
	let matchedTotal = 0;
	let inkTotal = 0;

	while (x < options.maxX) {
		const best = matchGlyph(raster, font, x, options.y, fuzz, minInkRatio);
		if (best === null) {
			blank++;
			if (!pendingSpace && blank > spaceWidth) {
				text += ' ';
				pendingSpace = true;
				blank = 0;
			}
			x += 1;
			continue;
		}
		blank = 0;
		pendingSpace = false;
		text += best.glyph.char;
		chars.push({
			char: best.glyph.char,
			x,
			y: options.y,
			score: best.score,
			matched: best.matched,
			ink: best.glyph.ink.length / 5
		});
		matchedTotal += best.matched;
		inkTotal += best.glyph.ink.length / 5;
		x += best.glyph.width;
	}

	// A run of blank columns at the end of a line is the panel being wider than the text.
	return { text: text.replace(/\s+$/, ''), chars, confidence: inkTotal === 0 ? 0 : matchedTotal / inkTotal };
}

/**
 * Read a rectangle as consecutive lines, one font height apart.
 *
 * The Sims wraps its own description text inside a fixed panel, so the lines arrive already broken
 * and this joins them with newlines rather than trying to reflow them. What the game chose to wrap
 * is information, and throwing it away to recover a paragraph would be losing on purpose.
 */
export function readBlock(raster: Raster, font: BitmapFont, options: ReadOptions): ReadResult {
	const maxY = options.maxY ?? raster.height;
	const lines: string[] = [];
	const chars: ReadChar[] = [];
	let matched = 0;
	let ink = 0;

	for (let y = options.y; y + font.height <= maxY; y += font.height) {
		const line = readLine(raster, font, { ...options, y });
		lines.push(line.text);
		chars.push(...line.chars);
		for (const c of line.chars) {
			matched += c.matched;
			ink += c.ink;
		}
	}

	// Trailing blank lines are the panel being bigger than the text, not content.
	while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

	return { text: lines.join('\n'), chars, confidence: ink === 0 ? 0 : matched / ink };
}

interface Match {
	glyph: GlyphPattern;
	score: number;
	matched: number;
}

/**
 * The inner loop: which glyph, if any, is drawn at this pixel.
 *
 * Scoring, unchanged from the Simplifier:
 *   ink where the screen has pure black   -10  (a border or a shadow, not this glyph)
 *   ink whose colour is within fuzz        +1
 *   ink whose colour is not               -2
 * and a candidate is abandoned the moment it falls below -2, which is what makes scoring 94 glyphs
 * at every pixel affordable. A glyph must score above -1, and account for most of its own ink, to be
 * returned at all. Ties go to whichever glyph explains more pixels, so a letter beats a fragment of
 * itself.
 */
function matchGlyph(raster: Raster, font: BitmapFont, x: number, y: number, fuzz: number, minInkRatio: number): Match | null {
	let bestScore = -1;
	let bestMatched = 0;
	let best: Match | null = null;

	for (const glyph of font.glyphs) {
		const ink = glyph.ink;
		let score = 0;
		let matched = 0;
		for (let i = 0; i < ink.length; i += 5) {
			const px = x + ink[i];
			const py = y + ink[i + 1];
			// Out of frame reads as black, which is the same signal as a border: not this glyph.
			const outside = px < 0 || py < 0 || px >= raster.width || py >= raster.height;
			const [r, g, b] = outside ? [0, 0, 0] : getPixel(raster, px, py);
			if (r === 0 && g === 0 && b === 0) {
				score -= 10;
			} else if (Math.abs(r - ink[i + 2]) + Math.abs(g - ink[i + 3]) + Math.abs(b - ink[i + 4]) <= fuzz) {
				score++;
				matched++;
			} else {
				score -= 2;
			}
			if (score < -2) break;
		}
		const required = Math.ceil((glyph.ink.length / 5) * minInkRatio);
		if (matched < required) continue;
		if (score > bestScore || (score === bestScore && matched > bestMatched)) {
			bestScore = score;
			bestMatched = matched;
			best = { glyph, score, matched };
		}
	}

	return best;
}

/**
 * Draw text with the same patterns the matcher reads.
 *
 * This is how the recogniser gets tested without a copy of the game running: render a string, read
 * it back, and any disagreement is a bug in one of the two halves rather than a question about a
 * screenshot. It is also how a fixture gets a tooltip in it that looks like the real one.
 */
export function drawText(raster: Raster, font: BitmapFont, text: string, x: number, y: number, spaceWidth = 4): number {
	const byChar = new Map(font.glyphs.map((g) => [g.char, g]));
	let cursor = x;
	for (const char of text) {
		if (char === ' ') {
			cursor += spaceWidth;
			continue;
		}
		const glyph = byChar.get(char);
		if (glyph === undefined) {
			cursor += spaceWidth;
			continue;
		}
		for (let i = 0; i < glyph.ink.length; i += 5) {
			const colour: RGB = [glyph.ink[i + 2], glyph.ink[i + 3], glyph.ink[i + 4]];
			setPixel(raster, cursor + glyph.ink[i], y + glyph.ink[i + 1], colour);
		}
		cursor += glyph.width;
	}
	return cursor - x;
}

/** Advance width of a string, for laying out a fixture or sizing a panel. */
export function measureText(font: BitmapFont, text: string, spaceWidth = 4): number {
	const byChar = new Map(font.glyphs.map((g) => [g.char, g]));
	let width = 0;
	for (const char of text) width += byChar.get(char)?.width ?? spaceWidth;
	return width;
}
