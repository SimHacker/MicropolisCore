/**
 * Drawing, measuring and reading text through one object, shaped like the Canvas 2D text API.
 *
 * Canvas gives you fillText and measureText. This gives you those, in the same terms — baselines,
 * alignment, a TextMetrics with the same field names — and then readText, which is the one Canvas
 * cannot have: given a raster, what text is at this position?
 *
 * The symmetry is the point, not decoration. Draw and read run off the same advances and the same
 * coverage, so a fixture drawn here is legible here by construction, and any disagreement between
 * them is a bug in one of two functions rather than an open question about a screenshot. It also
 * means the reader can be tested by anyone, without the application it reads.
 *
 * Deliberately not Canvas: no state to set and forget. A context is made with its face and its
 * settings and does not mutate, because the failures of a mutable graphics state are all of the form
 * "something else changed it", and the code that reads a game's interface has enough of those.
 */

import { drawCoverageText, measureCoverageText, prepareCoverageFont, readCoverageBlock, readCoverageLine } from './coverage-font';
import type { CoverageFont, CoverageReadResult, PreparedFont } from './coverage-font';
import type { RGB, Raster } from './raster';

/** Where the y passed to fillText and readText sits, in Canvas's vocabulary. */
export type TextBaseline = 'alphabetic' | 'top' | 'middle' | 'bottom';

/** Which end of the text the x refers to, in Canvas's vocabulary. */
export type TextAlign = 'left' | 'center' | 'right';

/** The subset of Canvas's TextMetrics that means anything for a bitmap face, with its names kept. */
export interface FontTextMetrics {
	width: number;
	actualBoundingBoxLeft: number;
	actualBoundingBoxRight: number;
	actualBoundingBoxAscent: number;
	actualBoundingBoxDescent: number;
	fontBoundingBoxAscent: number;
	fontBoundingBoxDescent: number;
	alphabeticBaseline: number;
}

export interface FontContextOptions {
	textBaseline?: TextBaseline;
	textAlign?: TextAlign;
	/** The colour fillText uses when it is not given one. */
	fillStyle?: RGB;
	/** Narrow the characters the reader will consider; see prepareCoverageFont. */
	alphabet?: (code: number) => boolean;
}

export interface ReadTextOptions {
	/** Right edge to read up to. Defaults to the raster's width. */
	maxX?: number;
	/** Bottom edge, when reading more than one line. */
	maxY?: number;
	/** Blank columns that mean a word break rather than letter spacing. */
	spaceWidth?: number;
	/** Background and full-ink brightness, when they are known rather than estimated. */
	background?: number;
	foreground?: number;
}

export interface FontContext {
	readonly face: CoverageFont;
	readonly prepared: PreparedFont;
	readonly lineHeight: number;
	/** Rows from the top of the line box down to the alphabetic baseline. */
	readonly ascent: number;
	readonly descent: number;
	measureText(text: string): FontTextMetrics;
	/** Draws, and returns the advance — the same number measureText would have given. */
	fillText(raster: Raster, text: string, x: number, y: number, colour?: RGB): number;
	readText(raster: Raster, x: number, y: number, options?: ReadTextOptions): CoverageReadResult;
	readTextBlock(raster: Raster, x: number, y: number, options?: ReadTextOptions): CoverageReadResult;
	/** The same face with different settings, since a context does not mutate. */
	with(options: FontContextOptions): FontContext;
}

/**
 * Where the alphabetic baseline sits in a face that does not say.
 *
 * Bitmap faces ship the line height and the per-glyph offsets and leave the baseline implied, so it
 * is measured: capitals and digits sit ON the baseline, and the row below the lowest of them is it.
 * Letters with descenders are excluded because they are the ones that hang through it, and 'Q' is
 * excluded because in most faces its tail does too.
 */
export function deriveBaseline(face: CoverageFont): number {
	const sitters = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789';
	let bottom = -Infinity;
	for (const glyph of face.glyphs) {
		if (!sitters.includes(glyph.char)) continue;
		for (let i = 0; i < glyph.cov.length; i += 3) bottom = Math.max(bottom, glyph.cov[i + 1]);
	}
	if (bottom === -Infinity) return face.height;
	return bottom + 1;
}

export function createFontContext(face: CoverageFont, options: FontContextOptions = {}): FontContext {
	const prepared = prepareCoverageFont(face, options.alphabet === undefined ? undefined : (glyph) => options.alphabet!(glyph.code));
	const baseline = face.baseline ?? deriveBaseline(face);
	const align = options.textAlign ?? 'left';
	const whichBaseline = options.textBaseline ?? 'alphabetic';
	const fillStyle = options.fillStyle ?? ([255, 255, 255] as RGB);

	/** From the y a caller gave us to the top of the line box, which is what the glyphs are relative to. */
	function topFrom(y: number): number {
		switch (whichBaseline) {
			case 'top':
				return y;
			case 'middle':
				return y - Math.round(face.height / 2);
			case 'bottom':
				return y - face.height;
			default:
				return y - baseline;
		}
	}

	function leftFrom(x: number, text: string): number {
		if (align === 'left') return x;
		const width = measureCoverageText(face, text);
		return align === 'center' ? x - Math.round(width / 2) : x - width;
	}

	return {
		face,
		prepared,
		lineHeight: face.height,
		ascent: baseline,
		descent: face.height - baseline,

		measureText(text: string): FontTextMetrics {
			const width = measureCoverageText(face, text);
			let left = Infinity;
			let right = -Infinity;
			let top = Infinity;
			let bottom = -Infinity;
			let pen = 0;
			for (const char of text) {
				const glyph = face.glyphs.find((g) => g.char === char);
				if (glyph === undefined) {
					pen += face.spaceWidth;
					continue;
				}
				for (let i = 0; i < glyph.cov.length; i += 3) {
					left = Math.min(left, pen + glyph.cov[i]);
					right = Math.max(right, pen + glyph.cov[i] + 1);
					top = Math.min(top, glyph.cov[i + 1]);
					bottom = Math.max(bottom, glyph.cov[i + 1] + 1);
				}
				pen += glyph.width;
			}
			const empty = left === Infinity;
			return {
				width,
				// Canvas measures these outwards from the anchor, so left of it is positive.
				actualBoundingBoxLeft: empty ? 0 : -left,
				actualBoundingBoxRight: empty ? 0 : right,
				actualBoundingBoxAscent: empty ? 0 : baseline - top,
				actualBoundingBoxDescent: empty ? 0 : bottom - baseline,
				fontBoundingBoxAscent: baseline,
				fontBoundingBoxDescent: face.height - baseline,
				alphabeticBaseline: 0
			};
		},

		fillText(raster: Raster, text: string, x: number, y: number, colour?: RGB): number {
			return drawCoverageText(raster, face, text, leftFrom(x, text), topFrom(y), colour ?? fillStyle);
		},

		readText(raster: Raster, x: number, y: number, read: ReadTextOptions = {}): CoverageReadResult {
			return readCoverageLine(raster, prepared, {
				x,
				y: topFrom(y),
				maxX: read.maxX ?? raster.width,
				spaceWidth: read.spaceWidth,
				background: read.background,
				foreground: read.foreground
			});
		},

		readTextBlock(raster: Raster, x: number, y: number, read: ReadTextOptions = {}): CoverageReadResult {
			return readCoverageBlock(raster, prepared, {
				x,
				y: topFrom(y),
				maxX: read.maxX ?? raster.width,
				maxY: read.maxY,
				spaceWidth: read.spaceWidth,
				background: read.background,
				foreground: read.foreground
			});
		},

		with(more: FontContextOptions): FontContext {
			return createFontContext(face, { textAlign: align, textBaseline: whichBaseline, fillStyle, alphabet: options.alphabet, ...more });
		}
	};
}
