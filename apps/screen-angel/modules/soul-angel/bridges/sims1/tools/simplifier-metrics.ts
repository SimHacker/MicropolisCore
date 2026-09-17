/**
 * Where each character sits in the font atlas, measured by hand in 2004.
 *
 * Ported from Don's Simplifier (SimsKit/Simplifier/SimplifierDoc.cpp, gFontX / gFontY / gFontW),
 * the accessibility experiment that read The Sims 1 interface off the screen and spoke it aloud.
 * The numbers are the interesting part: The Sims draws its own text with its own font and exposes
 * nothing to the accessibility tree, so somebody had to sit down with a screenshot and a magnifier
 * and write down where every glyph was. Nobody has to do that twice, which is the whole reason to
 * copy these across rather than re-derive them.
 *
 * The atlas is 252x112, seven rows of 16 pixels. Rows 0-2 hold the printable ASCII range; the rows
 * below were mapped for characters the game does not use here and are left as zeroes.
 */

/** Line height, and therefore the vertical step from one row of text to the next. */
export const FONT_HEIGHT = 16;

/** Baseline offset from the bottom of the cell. Unused by the matcher; kept because it is data. */
export const FONT_DESCENT = 3;

/** Sum of the absolute per-channel differences a pixel may be off and still count as a match. */
export const DEFAULT_FUZZ = 36;

/** Atlas row, by character code. */
export const FONT_Y: readonly number[] = [
	...zeroes(32),
	// space ! " # $ % & ' ( ) * + , - . /
	...repeat(0, 16),
	// 0-9 : ; < = > ?
	...repeat(0, 16),
	// @ A-O
	...repeat(16, 16),
	// P-Z [ \ ] ^ _
	...repeat(16, 16),
	// ` a-o
	...repeat(32, 16),
	// p-z { | } ~
	...repeat(32, 16),
	...repeat(48, 32),
	...repeat(64, 32),
	...repeat(80, 32),
	...repeat(96, 32)
];

/** Atlas column, by character code. */
export const FONT_X: readonly number[] = [
	...zeroes(32),
	0, 4, 7, 11, 22, 30, 38, 47, 50, 54, 59, 65, 71, 74, 79, 82,
	87, 95, 100, 107, 114, 121, 128, 135, 142, 149, 156, 159, 162, 166, 172, 177,
	1, 11, 19, 26, 33, 40, 48, 54, 63, 72, 78, 86, 93, 100, 110, 119,
	128, 133, 144, 151, 159, 168, 176, 184, 196, 204, 212, 220, 226, 232, 236, 241,
	2, 4, 11, 18, 24, 31, 38, 43, 50, 57, 60, 65, 72, 75, 83, 90,
	96, 102, 108, 114, 120, 126, 132, 137, 146, 152, 159, 164, 171, 174, 179, 186,
	...zeroes(128)
];

/** Advance width, by character code. Also the width of the cell the matcher samples. */
export const FONT_W: readonly number[] = [
	...zeroes(32),
	1, 1, 3, 9, 7, 8, 7, 2, 3, 3, 4, 4, 2, 4, 1, 5,
	7, 3, 5, 5, 6, 6, 6, 6, 5, 6, 2, 2, 3, 4, 3, 5,
	9, 7, 6, 6, 7, 6, 6, 7, 7, 5, 6, 6, 5, 9, 8, 8,
	5, 10, 6, 7, 7, 7, 6, 11, 7, 6, 6, 3, 4, 2, 5, 7,
	2, 6, 6, 4, 5, 5, 4, 6, 5, 2, 3, 5, 2, 7, 5, 5,
	5, 5, 4, 4, 4, 5, 5, 7, 5, 6, 5, 4, 1, 3, 5, 5,
	...zeroes(128)
];

/**
 * Which characters to compile.
 *
 * The original started at 33 — space has no ink, so a space cannot be recognised, only inferred
 * from a gap. That inference is in the matcher, and it is the reason the recogniser reads
 * "a  b" as "a b" rather than as "ab".
 */
export const FIRST_CODE = 33;
export const LAST_CODE = 126;

function zeroes(n: number): number[] {
	return new Array<number>(n).fill(0);
}

function repeat(value: number, n: number): number[] {
	return new Array<number>(n).fill(value);
}
