/**
 * Reading The Sims 1's own interface font, out of the game's own files.
 *
 * The 2004 Simplifier had to measure one font by hand off a screenshot, because that was the only
 * way in from outside. It is not the only way in any more: the game ships its entire Latin interface
 * face as bitmap atlases, one per point size, in UIGraphics/Fonts. Every size the interface uses is
 * there — 7 through 20 for controls and labels, 48 for the paused banner — with exact advances and
 * exact anti-aliasing. Nobody needs to measure anything.
 *
 * Two files per size, and the shipped loader (Framework/OldGZFontGimex.cpp, cOldGZFont::
 * InitBitmapped, the UNIX branch) reads them like this:
 *
 *   VariableSans_NN.bmp   8-bit run-length bitmap, one atlas of every glyph. The palette is a
 *                         greyscale ramp and is a decoy: the pixel value is COVERAGE, 0 to 15, and
 *                         colour arrives at blit time. This is why one file serves every panel.
 *   VariableSans_NN.fot   A header, then 256 glyph rectangles, then a 256-entry alpha table:
 *
 *     offset  field
 *       0     font type      5 for kVariableSans, the family the interface is set in
 *       4     point size     as the game asked for it, not the pixel height
 *       8     style flags
 *      12     colour
 *      16     character height, which is the line height
 *      20     first character
 *      24     character count
 *      28     average lead-in
 *      32     first character, read a second time into the same field by the shipped loader
 *      36     256 rectangles of 7 int32: left top right bottom, offsetX offsetY, nextCharOffset
 *    7204     256 ARGB entries, alpha stepping by 17 per level: the ramp, spelled out
 *
 * The rectangle locates the glyph in the atlas; the offset places it against the pen and the top of
 * the line; nextCharOffset is the advance. Space has no rectangle and exists only as an advance,
 * which is why a matcher can never see one and has to infer it from a gap.
 *
 * On Windows the game reads the .ffn beside these instead — a Gimex multi-frame image whose frames
 * are named "%x '%c' %d" — and packs this same atlas at load time. The .bmp/.fot pair is that work
 * already done, so it is the pair worth reading.
 */

import { readFileSync } from 'node:fs';

import { decodeBMP } from '@micropolis/optical-codec/node/bmp';
import type { CoverageFont, CoverageGlyph } from '@micropolis/optical-codec';

/** What the metric file says, before any of it is turned into glyphs. */
export interface GZFontMetrics {
	fontType: number;
	size: number;
	flags: number;
	colour: number;
	charHeight: number;
	firstCharacter: number;
	characterCount: number;
	averageLeadIn: number;
	rects: GZFontRect[];
	/** Alpha per coverage level, from the file's own table. Read to confirm the ramp, not to use it. */
	alphaTable: number[];
}

export interface GZFontRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
	offsetX: number;
	offsetY: number;
	nextCharOffset: number;
}

const HEADER_BYTES = 36;
const RECT_BYTES = 28;
const GLYPH_SLOTS = 256;
/** Coverage is stored in 4 bits, so 15 is opaque. The alpha table's step of 17 is 255/15. */
const COVERAGE_LEVELS = 15;

export function readGZFontMetrics(path: string): GZFontMetrics {
	const bytes = readFileSync(path);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const expected = HEADER_BYTES + GLYPH_SLOTS * RECT_BYTES + GLYPH_SLOTS * 4;
	if (bytes.byteLength !== expected) {
		throw new Error(`${path}: expected ${expected} bytes, found ${bytes.byteLength}`);
	}

	const rects: GZFontRect[] = [];
	for (let i = 0; i < GLYPH_SLOTS; i++) {
		const at = HEADER_BYTES + i * RECT_BYTES;
		rects.push({
			left: view.getInt32(at, true),
			top: view.getInt32(at + 4, true),
			right: view.getInt32(at + 8, true),
			bottom: view.getInt32(at + 12, true),
			offsetX: view.getInt32(at + 16, true),
			offsetY: view.getInt32(at + 20, true),
			nextCharOffset: view.getInt32(at + 24, true)
		});
	}

	const alphaTable: number[] = [];
	const tableAt = HEADER_BYTES + GLYPH_SLOTS * RECT_BYTES;
	for (let i = 0; i < GLYPH_SLOTS; i++) alphaTable.push(view.getUint32(tableAt + i * 4, true) >>> 24);

	return {
		fontType: view.getInt32(0, true),
		size: view.getUint32(4, true),
		flags: view.getUint32(8, true),
		colour: view.getUint32(12, true),
		charHeight: view.getUint32(16, true),
		firstCharacter: view.getUint32(20, true),
		characterCount: view.getUint32(24, true),
		averageLeadIn: view.getUint32(28, true),
		rects,
		alphaTable
	};
}

export interface GZFont {
	font: CoverageFont;
	metrics: GZFontMetrics;
	atlas: { width: number; height: number; indices: Uint8Array };
	/** Glyphs whose rectangle lies outside the atlas, which would mean the pair does not match. */
	problems: string[];
}

/**
 * Combine an atlas with its metrics into a font the matcher can use.
 *
 * Coordinates come out pen-relative — offset folded in — because every consumer wants them that way
 * and the atlas position is of no interest once the glyph has been lifted out of it.
 */
export function readGZFont(bmpPath: string, fotPath: string, name?: string): GZFont {
	const metrics = readGZFontMetrics(fotPath);
	const bmp = decodeBMP(readFileSync(bmpPath));
	const problems: string[] = [];

	const glyphs: CoverageGlyph[] = [];
	for (let code = 0; code < GLYPH_SLOTS; code++) {
		const rect = metrics.rects[code];
		const w = rect.right - rect.left;
		const h = rect.bottom - rect.top;
		const advance = rect.nextCharOffset;
		if (w <= 0 || h <= 0) {
			// No ink is not the same as no glyph: a space is an advance and nothing else.
			if (advance > 0) glyphs.push({ char: String.fromCharCode(code), code, width: advance, cov: [] });
			continue;
		}
		if (rect.right > bmp.width || rect.bottom > bmp.height) {
			problems.push(`glyph ${code} rectangle ${rect.left},${rect.top} ${w}x${h} is outside the ${bmp.width}x${bmp.height} atlas`);
			continue;
		}

		const cov: number[] = [];
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const level = bmp.indices[(rect.top + y) * bmp.width + rect.left + x];
				if (level === 0) continue;
				cov.push(rect.offsetX + x, rect.offsetY + y, Math.min(level, COVERAGE_LEVELS));
			}
		}
		glyphs.push({ char: String.fromCharCode(code), code, width: advance, cov });
	}

	const space = glyphs.find((g) => g.code === 32);

	return {
		font: {
			name: name ?? `VariableSans_${String(metrics.size).padStart(2, '0')}`,
			size: metrics.size,
			height: metrics.charHeight,
			levels: COVERAGE_LEVELS,
			spaceWidth: space?.width ?? Math.max(2, Math.round(metrics.charHeight / 4)),
			glyphs
		},
		metrics,
		atlas: { width: bmp.width, height: bmp.height, indices: bmp.indices },
		problems
	};
}
