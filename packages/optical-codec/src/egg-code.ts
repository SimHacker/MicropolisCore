/**
 * The band code: digits in, colours out, and back again.
 *
 * One band is one base-10 digit, read resistor-style. The caps delimit the stack and their
 * polarity says which way is up, so there is no length field. Big-endian throughout, so a
 * partial read from far away is a correct prefix rather than a wrong number
 * (OPTICAL-CHANNEL.yml, band_codes.encoding).
 *
 * Colour choice here is provisional. The spec says the palette must be chosen against the
 * game's rendered output rather than against theory, and that has not happened yet, so the
 * ten below are simply well separated in RGB and honest about being a first draft.
 */

import type { RGB } from './raster';

/** Ten digits, ten colours. Index is the digit. */
export const PALETTE: readonly RGB[] = [
	[24, 24, 28], // 0 near-black
	[120, 72, 40], // 1 brown
	[196, 40, 40], // 2 red
	[224, 128, 32], // 3 orange
	[232, 216, 64], // 4 yellow
	[64, 176, 72], // 5 green
	[48, 96, 208], // 6 blue
	[136, 64, 184], // 7 violet
	[160, 160, 168], // 8 grey
	[244, 244, 240] // 9 white
];

/** The fiducial pair. White above black: high contrast, and asymmetric so up is unambiguous. */
export const CAP_TOP: RGB = [255, 255, 255];
export const CAP_BOTTOM: RGB = [0, 0, 0];

/** The colour checker built into every egg: a known white and a known mid-grey. */
export const CALIBRATION: readonly RGB[] = [
	[255, 255, 255],
	[128, 128, 128]
];

export interface EggCode {
	/** What kind of egg this is. One digit. */
	kind: number;
	/** Format version, so a reader can refuse a code it does not understand. One digit. */
	version: number;
	/** Which egg. Two digits as drawn; the id space is per-lot, not global. */
	id: number;
	/** Outcome, count, magnitude — whatever the kind says it means. Two digits. */
	value: number;
}

/** Digits in the order they are drawn, top to bottom, most significant first. */
export function encodeDigits(code: EggCode): number[] {
	requireDigit('kind', code.kind);
	requireDigit('version', code.version);
	requireRange('id', code.id, 0, 99);
	requireRange('value', code.value, 0, 99);
	const payload = [
		code.kind,
		code.version,
		Math.floor(code.id / 10),
		code.id % 10,
		Math.floor(code.value / 10),
		code.value % 10
	];
	return [...payload, checkDigit(payload)];
}

export function decodeDigits(digits: readonly number[]): EggCode | null {
	if (digits.length !== 7) return null;
	const payload = digits.slice(0, 6);
	if (checkDigit(payload) !== digits[6]) return null;
	return {
		kind: payload[0],
		version: payload[1],
		id: payload[2] * 10 + payload[3],
		value: payload[4] * 10 + payload[5]
	};
}

/**
 * Mod-10 check over the payload, weighted by position so a transposition fails too.
 *
 * The spec asks for one check per disclosure group rather than one at the end, so that every
 * legal partial read is checkable. This is the single-group case; grouping arrives with the
 * telescoping eggs that need it.
 */
export function checkDigit(payload: readonly number[]): number {
	let sum = 0;
	payload.forEach((d, i) => {
		sum += d * (i + 1);
	});
	return sum % 10;
}

/** How many bands a given zoom can resolve, as a big-endian prefix of the full stack. */
export function prefixLength(zoom: 'far' | 'mid' | 'near' | 'full'): number {
	switch (zoom) {
		case 'far':
			return 2; // kind and version: enough to say what it is
		case 'mid':
			return 4; // plus the id
		case 'near':
			return 6; // plus the value
		case 'full':
			return 7; // plus the check digit
	}
}

export function digitsToColours(digits: readonly number[]): RGB[] {
	return digits.map((d) => {
		requireDigit('band', d);
		return PALETTE[d];
	});
}

/** Nearest palette entry in plain RGB distance, with the distance so a caller can judge it. */
export function nearestDigit(colour: RGB): { digit: number; distance: number } {
	let digit = 0;
	let best = Number.POSITIVE_INFINITY;
	PALETTE.forEach((p, i) => {
		const d = (p[0] - colour[0]) ** 2 + (p[1] - colour[1]) ** 2 + (p[2] - colour[2]) ** 2;
		if (d < best) {
			best = d;
			digit = i;
		}
	});
	return { digit, distance: Math.sqrt(best) };
}

function requireDigit(what: string, v: number): void {
	requireRange(what, v, 0, 9);
}

function requireRange(what: string, v: number, lo: number, hi: number): void {
	if (!Number.isInteger(v) || v < lo || v > hi) {
		throw new RangeError(`${what} must be an integer in [${lo}, ${hi}], got ${v}`);
	}
}
