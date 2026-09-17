/**
 * Reading anti-aliased text off a screen, given the coverage masks the application drew it with.
 *
 * The sibling module, bitmap-font, matches ink against remembered COLOURS: it works when the
 * glyphs are aliased, or when somebody has captured them from the exact screen they will be read
 * from. The Sims does neither. Its interface font is a family of coverage masks — sixteen levels of
 * alpha per pixel, colour supplied at blit time — so a glyph looks different in every panel it
 * appears in, and only a fifth of its pixels are ever fully opaque.
 *
 * So this matcher does not compare colours at all. It exploits what blending guarantees: wherever a
 * glyph was drawn, the observed brightness is an affine function of that glyph's coverage. Fit that
 * line, measure how far the pixels miss it, and the right glyph is the one whose coverage explains
 * the pixels. Text colour, panel art and theme drop out of the arithmetic, which is what makes one
 * font file work everywhere the game uses it.
 *
 * Rejection comes from the zeroes, not the ink. Every candidate is scored over its whole bounding
 * box, so a narrow glyph hiding inside a wide one has to explain the bright pixels it claims are
 * background, and cannot.
 */

import { getPixel, setPixel, type RGB, type Raster } from './raster';

export interface CoverageGlyph {
	char: string;
	code: number;
	/** Pen advance: distance to the next character's origin. */
	width: number;
	/**
	 * Coverage triples, flat: x, y, level, repeating. Coordinates are relative to the pen position
	 * and the top of the line, so drawing is a translate and nothing else. Level runs 1..levels;
	 * zero-coverage pixels are omitted and inferred from the bounding box.
	 */
	cov: number[];
}

export interface CoverageFont {
	name: string;
	/** Point size as the game asked for it, which is not the pixel height. */
	size: number;
	/** Line height: the vertical step from one row of text to the next. */
	height: number;
	/** Number of coverage levels; the game's fonts store 15 plus transparent. */
	levels: number;
	/** Advance for a space, which has no ink to match and must come from the metrics. */
	spaceWidth: number;
	glyphs: CoverageGlyph[];
}

export function loadCoverageFont(source: unknown): CoverageFont {
	const f = source as Partial<CoverageFont>;
	if (!f || !Array.isArray(f.glyphs) || f.glyphs.length === 0) throw new Error('not a coverage font: no glyphs');
	if (typeof f.height !== 'number' || f.height <= 0) throw new Error('not a coverage font: no height');
	for (const g of f.glyphs) {
		if (typeof g.width !== 'number' || !Array.isArray(g.cov) || g.cov.length % 3 !== 0) {
			throw new Error(`glyph ${JSON.stringify(g.char)} is malformed`);
		}
	}
	return {
		name: f.name ?? 'unnamed',
		size: f.size ?? 0,
		height: f.height,
		levels: f.levels ?? 15,
		spaceWidth: f.spaceWidth ?? Math.round(f.height / 4),
		glyphs: f.glyphs
	};
}

/** A glyph with its coverage expanded over its bounding box: the shape the matcher walks. */
interface PreparedGlyph {
	glyph: CoverageGlyph;
	x0: number;
	y0: number;
	w: number;
	h: number;
	/** Coverage as a fraction, row-major over the bounding box, zeroes included. */
	alpha: Float32Array;
	/** Total coverage, which is how much of a letter this glyph is claiming to explain. */
	inkWeight: number;
	/** Its most opaque cell, for the one-operation test that rejects nearly every candidate. */
	peak: { x: number; y: number; alpha: number };
}

export interface PreparedFont {
	font: CoverageFont;
	glyphs: PreparedGlyph[];
	/** Highest and lowest rows any glyph touches, relative to the pen: ascender to descender. */
	reach: { top: number; bottom: number };
}

/**
 * Expand a font's coverage for matching, optionally over a smaller alphabet.
 *
 * A game font carries every character its localisations need, which for The Sims is 222 glyphs where
 * an English interface draws about ninety. Narrowing that costs proportional time in the reader — a
 * panel line takes 10ms over ASCII against 14ms over everything — and leaves less room for a genuine
 * tie, since a superscript one cannot be mistaken for an 'l' if it was never on offer. It buys
 * accuracy only where two characters really are ambiguous; the reader does not need the help to
 * choose correctly, which it did back when it committed to letters one position at a time.
 */
export function prepareCoverageFont(font: CoverageFont, alphabet?: (glyph: CoverageGlyph) => boolean): PreparedFont {
	const glyphs: PreparedGlyph[] = [];
	for (const glyph of font.glyphs) {
		if (glyph.cov.length === 0) continue;
		if (alphabet !== undefined && !alphabet(glyph)) continue;
		let x0 = Infinity;
		let y0 = Infinity;
		let x1 = -Infinity;
		let y1 = -Infinity;
		for (let i = 0; i < glyph.cov.length; i += 3) {
			x0 = Math.min(x0, glyph.cov[i]);
			x1 = Math.max(x1, glyph.cov[i]);
			y0 = Math.min(y0, glyph.cov[i + 1]);
			y1 = Math.max(y1, glyph.cov[i + 1]);
		}
		const w = x1 - x0 + 1;
		const h = y1 - y0 + 1;
		const alpha = new Float32Array(w * h);
		let inkWeight = 0;
		let peak = { x: 0, y: 0, alpha: 0 };
		for (let i = 0; i < glyph.cov.length; i += 3) {
			const a = glyph.cov[i + 2] / font.levels;
			alpha[(glyph.cov[i + 1] - y0) * w + (glyph.cov[i] - x0)] = a;
			inkWeight += a;
			if (a > peak.alpha) peak = { x: glyph.cov[i], y: glyph.cov[i + 1], alpha: a };
		}
		glyphs.push({ glyph, x0, y0, w, h, alpha, inkWeight, peak });
	}

	let top = 0;
	let bottom = font.height - 1;
	if (glyphs.length > 0) {
		top = Math.min(...glyphs.map((g) => g.y0));
		bottom = Math.max(...glyphs.map((g) => g.y0 + g.h - 1));
	}
	return { font, glyphs, reach: { top, bottom } };
}

export interface CoverageReadOptions {
	x: number;
	y: number;
	maxX: number;
	maxY?: number;
	/**
	 * Brightness of the background and of fully-covered text, if known.
	 *
	 * Left out, they are estimated from the strip being read, which is what you want on a real
	 * screen and is why nothing here needs to be told the theme. Supply them when reading a
	 * synthetic fixture whose colours you chose, or when a strip is too short to estimate from.
	 */
	background?: number;
	foreground?: number;
	/**
	 * How much of the error a glyph is allowed to leave behind, relative to claiming nothing is
	 * there. Defaults to 0.5, so a glyph must explain three quarters of what it claims to explain.
	 * Raise it for a photographed screen, lower it to refuse blurry frames.
	 */
	tolerance?: number;
	/** Blank columns that mean a word break rather than letter spacing. */
	spaceWidth?: number;
}

export interface CoverageReadChar {
	char: string;
	x: number;
	/** Residual left after the glyph, over the residual left by claiming nothing: 0 is perfect, 1 is useless. */
	error: number;
}

export interface CoverageReadResult {
	text: string;
	chars: CoverageReadChar[];
	/** Mean of 1 - error over the characters read. Above ~0.8 the text is right. */
	confidence: number;
	/** What the strip's background and full-ink brightness were taken to be. */
	background: number;
	foreground: number;
}

/**
 * Read one line of text: find the sequence of letters that best explains the strip.
 *
 * Not the best letter at each position in turn. That was the first attempt and it cannot be repaired
 * by tie-breaking, because the mistakes it makes are local decisions that only look wrong later. In
 * "every hour", the three pixels of a backtick land exactly on the ascender of the 'h' one column
 * early; a per-position scan accepts it, steps past by the backtick's advance, and the rest of the
 * letter becomes somebody else's problem. Rules about preferring more ink, or forgiving ink a glyph
 * did not ask for, each fix that case and break another — a 'W' and an 'a' become an 'M'.
 *
 * So every column of the strip is accounted for exactly once, and the whole line is scored: a letter
 * costs the squared miss between its coverage and the pixels, a column with no letter on it costs
 * whatever ink is sitting there unexplained, and the cheapest path across the strip wins. Leaving
 * half an 'h' lying on the floor is expensive, so the backtick loses on the total even though it won
 * on its own three pixels. This is Viterbi over pen positions, with each glyph's advance as the step.
 *
 * The cost is bounded and small: candidates are pruned by their most opaque pixel before anything is
 * summed, so a line of the game's panel text takes a few milliseconds.
 */
export function readCoverageLine(raster: Raster, font: PreparedFont, options: CoverageReadOptions): CoverageReadResult {
	const tolerance = options.tolerance ?? 0.5;
	const spaceWidth = options.spaceWidth ?? Math.max(2, Math.round(font.font.spaceWidth * 0.75));
	const levels = estimateLevels(raster, options.x, options.y, options.maxX, options.y + font.font.height, options);
	const contrast = levels.foreground - levels.background;

	// A strip with no text in it has nothing to fit a line through, and every glyph would score the
	// same nothing. Saying so is more useful than returning arbitrary letters.
	if (Math.abs(contrast) < 8) {
		return { text: '', chars: [], confidence: 0, background: levels.background, foreground: levels.foreground };
	}

	const width = Math.max(0, Math.min(options.maxX, raster.width) - options.x);
	const top = options.y + font.reach.top;
	const bottom = options.y + font.reach.bottom;

	/** What each column of the strip costs if no letter is placed over it: its unexplained ink. */
	const bare = new Float64Array(width);
	for (let col = 0; col < width; col++) {
		let sum = 0;
		for (let py = top; py <= bottom; py++) {
			const seen = (luminance(raster, options.x + col, py) - levels.background) / contrast;
			sum += seen * seen;
		}
		bare[col] = sum;
	}

	const best = new Float64Array(width + 1).fill(Infinity);
	const from = new Int32Array(width + 1).fill(-1);
	const placed: (PreparedGlyph | null)[] = new Array(width + 1).fill(null);
	const errorAt = new Float64Array(width + 1);
	best[0] = 0;

	for (let col = 0; col < width; col++) {
		const here = best[col];
		if (here === Infinity) continue;

		// Nothing here: pay for whatever ink is in this column and move on one pixel.
		if (here + bare[col] < best[col + 1]) {
			best[col + 1] = here + bare[col];
			from[col + 1] = col;
			placed[col + 1] = null;
		}

		for (const glyph of font.glyphs) {
			const penX = options.x + col;
			if (penX + glyph.x0 < 0 || penX + glyph.x0 + glyph.w > raster.width) continue;
			if (options.y + glyph.y0 < 0 || options.y + glyph.y0 + glyph.h > raster.height) continue;

			// One comparison rejects nearly every candidate: whatever the glyph's most opaque pixel
			// claims to be, the screen has to be at least halfway there.
			const atPeak = (luminance(raster, penX + glyph.peak.x, options.y + glyph.peak.y) - levels.background) / contrast;
			if (atPeak < glyph.peak.alpha * 0.5) continue;

			const advance = glyph.glyph.width;
			if (advance <= 0 || col + advance > width) continue;

			let missed = 0;
			let flat = 0;
			for (let row = 0; row < glyph.h; row++) {
				const py = options.y + glyph.y0 + row;
				for (let gcol = 0; gcol < glyph.w; gcol++) {
					const seen = (luminance(raster, penX + glyph.x0 + gcol, py) - levels.background) / contrast;
					const want = glyph.alpha[row * glyph.w + gcol];
					missed += (seen - want) * (seen - want);
					flat += seen * seen;
				}
			}

			// Refuse placements that explain their own box worse than emptiness would. Without this
			// the search is free to spend a letter on blank panel whenever the arithmetic is a wash.
			if (missed > tolerance * tolerance * flat) continue;

			// Columns inside the advance that the glyph's box does not cover are still the strip's,
			// and their ink has to be charged to somebody.
			let uncovered = 0;
			for (let step = 0; step < advance; step++) {
				const at = col + step;
				if (at >= width) break;
				if (at >= col + glyph.x0 && at < col + glyph.x0 + glyph.w) continue;
				uncovered += bare[at];
			}

			const total = here + missed + uncovered;
			const target = col + advance;
			if (total < best[target]) {
				best[target] = total;
				from[target] = col;
				placed[target] = glyph;
				errorAt[target] = flat <= 0 ? 1 : Math.sqrt(missed / flat);
			}
		}
	}

	// Walk the cheapest path back, then forwards, inserting a space wherever the letters are further
	// apart than letter spacing accounts for.
	const steps: { glyph: PreparedGlyph | null; col: number }[] = [];
	for (let at = width; at > 0; at = from[at]) {
		if (from[at] < 0) break;
		steps.push({ glyph: placed[at], col: from[at] });
	}
	steps.reverse();

	const chars: CoverageReadChar[] = [];
	let text = '';
	let blank = 0;
	let started = false;
	let errorSum = 0;

	for (const step of steps) {
		if (step.glyph === null) {
			blank++;
			continue;
		}
		if (started && blank > spaceWidth) text += ' ';
		blank = 0;
		started = true;
		const char = step.glyph.glyph.char;
		const x = options.x + step.col;
		text += char;
		chars.push({ char, x, error: errorAt[step.col + step.glyph.glyph.width] });
		errorSum += chars[chars.length - 1].error;
	}

	return {
		text: text.replace(/\s+$/, ''),
		chars,
		confidence: chars.length === 0 ? 0 : 1 - errorSum / chars.length,
		background: levels.background,
		foreground: levels.foreground
	};
}

/** Read a rectangle as consecutive lines one line-height apart, the way the game wraps its own text. */
export function readCoverageBlock(raster: Raster, font: PreparedFont, options: CoverageReadOptions): CoverageReadResult {
	const maxY = options.maxY ?? raster.height;
	const lines: string[] = [];
	const chars: CoverageReadChar[] = [];
	let errorSum = 0;
	let background = 0;
	let foreground = 0;
	let strips = 0;

	for (let y = options.y; y + font.font.height <= maxY; y += font.font.height) {
		const line = readCoverageLine(raster, font, { ...options, y });
		lines.push(line.text);
		chars.push(...line.chars);
		for (const c of line.chars) errorSum += c.error;
		background += line.background;
		foreground += line.foreground;
		strips++;
	}

	while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

	return {
		text: lines.join('\n'),
		chars,
		confidence: chars.length === 0 ? 0 : 1 - errorSum / chars.length,
		background: strips === 0 ? 0 : background / strips,
		foreground: strips === 0 ? 0 : foreground / strips
	};
}

/**
 * Background and full-ink brightness of a strip, from its own pixels.
 *
 * Text is a minority of a line of text — most pixels are whatever is behind it — so the middle of
 * the distribution is background. Ink is then whichever tail lies further from that middle, which is
 * how light text on a dark panel and dark text on a light one come out of the same arithmetic with
 * no setting to get wrong. The tail is taken just short of the extreme, so one blown highlight or
 * one black border pixel cannot set the scale for the whole strip.
 */
function estimateLevels(
	raster: Raster,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	options: CoverageReadOptions
): { background: number; foreground: number } {
	if (options.background !== undefined && options.foreground !== undefined) {
		return { background: options.background, foreground: options.foreground };
	}
	const samples: number[] = [];
	for (let y = Math.max(0, y0); y < Math.min(raster.height, y1); y++) {
		for (let x = Math.max(0, x0); x < Math.min(raster.width, x1); x++) samples.push(luminance(raster, x, y));
	}
	if (samples.length === 0) return { background: 0, foreground: 255 };
	samples.sort((a, b) => a - b);
	const at = (q: number) => samples[Math.min(samples.length - 1, Math.max(0, Math.round(q * (samples.length - 1))))];
	const middle = at(0.5);
	const bright = at(0.995);
	const dark = at(0.005);
	const ink = bright - middle >= middle - dark ? bright : dark;
	return {
		background: options.background ?? middle,
		foreground: options.foreground ?? ink
	};
}

function luminance(raster: Raster, x: number, y: number): number {
	if (x < 0 || y < 0 || x >= raster.width || y >= raster.height) return 0;
	const [r, g, b] = getPixel(raster, x, y);
	return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Draw text the way the game draws it: one colour, blended by coverage over whatever is underneath.
 *
 * This is the other half of the test bench. A fixture drawn here is not an approximation of a
 * screenshot — it is the same arithmetic the game's blitter does with the same masks, so when the
 * matcher reads it back, a disagreement is a bug rather than a question about a JPEG.
 */
export function drawCoverageText(
	raster: Raster,
	font: CoverageFont,
	text: string,
	x: number,
	y: number,
	colour: RGB,
	spaceWidth?: number
): number {
	const byChar = new Map(font.glyphs.map((g) => [g.char, g]));
	const space = spaceWidth ?? font.spaceWidth;
	let cursor = x;
	for (const char of text) {
		const glyph = byChar.get(char);
		if (char === ' ' || glyph === undefined || glyph.cov.length === 0) {
			cursor += glyph?.width ?? space;
			continue;
		}
		for (let i = 0; i < glyph.cov.length; i += 3) {
			const px = cursor + glyph.cov[i];
			const py = y + glyph.cov[i + 1];
			const a = glyph.cov[i + 2] / font.levels;
			const under = getPixel(raster, px, py);
			setPixel(raster, px, py, [
				under[0] + (colour[0] - under[0]) * a,
				under[1] + (colour[1] - under[1]) * a,
				under[2] + (colour[2] - under[2]) * a
			]);
		}
		cursor += glyph.width;
	}
	return cursor - x;
}

export function measureCoverageText(font: CoverageFont, text: string): number {
	const byChar = new Map(font.glyphs.map((g) => [g.char, g]));
	let width = 0;
	for (const char of text) width += byChar.get(char)?.width ?? font.spaceWidth;
	return width;
}
