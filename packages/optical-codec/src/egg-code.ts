/**
 * The band code: digits in, colours out, and back again.
 *
 * One band is one digit, read resistor-style. The caps delimit the stack, their polarity says which
 * way is up, and their height is one band — so the sentinel carries the metric and there is no length
 * field (OPTICAL-CHANNEL.yml, band_codes.encoding). Big-endian throughout, so a partial read from far
 * away is a correct prefix rather than a wrong number.
 *
 * THE CAPS ARE THE COLOUR CHECKER
 *
 * A game lights its sprites, so a band's rendered colour is not the colour the artist authored. The
 * fix is a known reference in the code itself — and pure white and pure black already are one, per
 * channel, which is exactly the two points an affine correction needs. An extra mid-grey swatch was
 * drawn at first and removed: it cost a band of height, it sat next to the white cap where the two
 * merged into one indistinguishable run, and it bought a gamma term nothing here uses.
 *
 * WHY THE PALETTE HAS NO WHITE AND NO BLACK
 *
 * They are the caps. A band drawn in near-white against the white cap erases the delimiter it is
 * measured from, which turns one misread colour into a misread STRUCTURE — the failure class the
 * check digit cannot catch, because the digits it would check are no longer the digits that were
 * drawn. Every palette below therefore lives between the references, never on them.
 */

import type { RGB } from './raster';

/**
 * A band alphabet: the colours, in digit order, and the base that follows from their count.
 *
 * Several are defined because the right size is a measured question, not a taste one — scripts/
 * measure-eggs.ts sweeps them against the degradation suite, and EGGS.yml records what won.
 */
export interface BandAlphabet {
	name: string;
	/** Index is the digit. Never contains a colour near CAP_TOP or CAP_BOTTOM. */
	colours: readonly RGB[];
}

/** The fiducial pair, and the colour references. White above black: high contrast, and up is unambiguous. */
export const CAP_TOP: RGB = [255, 255, 255];
export const CAP_BOTTOM: RGB = [0, 0, 0];

/**
 * THE PALETTES WERE PACKED, NOT PICKED
 *
 * scripts/pick-palettes.ts chooses each one by maximising the smallest gap between its colours, over
 * every colour a band is allowed to be: at least 60 from either cap, and luma between 72 and 188.
 *
 * Both bounds are there because the reader looks for the caps as the extremes of a column's range, and
 * claims the top and bottom 15% of it. A band inside either claim gets read as a cap. The luma window
 * was 46 to 200 until the sweep caught it: a dark blue band at luma 47 sat at 15.1% of the range, was
 * taken for a black cap, and seven of sixteen codes could then not be found AT ALL under blur plus
 * noise — not misread, not refused, invisible. Tightening the window cost almost nothing: the closest
 * pair went from 285 to 272 at four colours and from 148.6 to 147.5 at twelve.
 *
 * Hand-picked palettes were replaced because the sweep caught them being dishonest too: octal and
 * decimal came out with the same closest pair, since orange sits between red and yellow and both held
 * all three. An alphabet that buys two more digits per band at no cost in separation is not a
 * trade-off, it is a badly chosen smaller alphabet. Packed, the ladder means something: 272, 216, 190,
 * 165, 148.
 *
 * These are the stand-in art's colours. The spec asks for a palette chosen against the game's own
 * rendered output, and that still wants doing — what is settled here is how MANY, and how far apart
 * they have to be.
 */

/** Four: two bits a band. Long codes, and legible where nothing else is. */
export const QUATERNARY: BandAlphabet = {
	name: 'quaternary',
	colours: [
		[248, 0, 0],
		[136, 248, 0],
		[0, 248, 240],
		[248, 128, 248]
	]
};

/** Six. */
export const SENARY: BandAlphabet = {
	name: 'senary',
	colours: [
		[248, 0, 8],
		[176, 224, 0],
		[0, 112, 56],
		[0, 248, 232],
		[72, 40, 248],
		[248, 152, 192]
	]
};

/**
 * Eight: three bits a band, and the same alphabet as the dial.
 *
 * The pie menu a player cracks an egg with has eight directions, so an octal band and a dialled digit
 * are the same symbol in two channels — one code space, one place to be wrong. Convenient rather than
 * decisive; the sweep is what says it is legible.
 */
export const OCTAL: BandAlphabet = {
	name: 'octal',
	colours: [
		[248, 0, 0],
		[192, 216, 0],
		[0, 232, 0],
		[72, 248, 176],
		[0, 88, 248],
		[168, 0, 248],
		[240, 160, 176],
		[80, 72, 72]
	]
};

/** Ten: one decimal digit a band, which is where the resistor analogy lands. */
export const DECIMAL: BandAlphabet = {
	name: 'decimal',
	colours: [
		[248, 0, 32],
		[248, 168, 0],
		[64, 96, 0],
		[128, 224, 104],
		[0, 248, 0],
		[0, 248, 216],
		[0, 80, 248],
		[200, 168, 248],
		[128, 48, 144],
		[248, 0, 248]
	]
};

/** Twelve: the spec's upper bound. */
export const DUODECIMAL: BandAlphabet = {
	name: 'duodecimal',
	colours: [
		[248, 0, 32],
		[248, 168, 96],
		[144, 104, 8],
		[112, 248, 0],
		[0, 136, 0],
		[0, 248, 96],
		[0, 248, 248],
		[104, 168, 168],
		[0, 80, 248],
		[232, 152, 248],
		[248, 0, 248],
		[144, 24, 136]
	]
};

export const ALPHABETS: readonly BandAlphabet[] = [QUATERNARY, SENARY, OCTAL, DECIMAL, DUODECIMAL];

/**
 * The alphabet in use.
 *
 * Set by measurement: see EGGS.yml, the_alphabet_was_measured. Changing it changes what an existing
 * egg means, which is why the version digit is the second thing on the stack.
 */
export const ALPHABET: BandAlphabet = OCTAL;

/** Whatever the alphabet is today, for the callers that only want the colours. */
export const PALETTE: readonly RGB[] = ALPHABET.colours;

export interface EggCode {
	/** What kind of egg this is. One digit. */
	kind: number;
	/** Format version, so a reader can refuse a code it does not understand. One digit. */
	version: number;
	/** Which egg. Two digits, so its range depends on the alphabet: 0-63 in octal, 0-99 in decimal. */
	id: number;
	/** Outcome, count, magnitude — whatever the kind says it means. Two digits. */
	value: number;
}

/** How many digits each field is drawn with, in the order they are drawn. */
export const FIELD_DIGITS = { kind: 1, version: 1, id: 2, value: 2 } as const;

/**
 * THE STACK IS GROUPS, AND EVERY GROUP ENDS WITH ITS OWN CHECK
 *
 * A zoom that can only resolve two bands has to be able to VERIFY those two bands. With one check
 * digit at the end of the stack, every partial read is unverifiable, and progressive disclosure
 * degrades into guessing: a far read says 'probably an errand egg' and nothing can tell it otherwise.
 *
 * So the check travels with each group, over everything read so far. Three legal stopping points, each
 * a complete answer at its own resolution:
 *
 *   far    kind, check                    2 bands. What it is, verified.
 *   mid    version, id, check             6 bands. Which egg, and which grammar.
 *   near   value, check                   9 bands. The whole code.
 *
 * VERSION IS DELIBERATELY NOT IN THE FAR GROUP. It was, when the far group was two unchecked bands,
 * and a checked kind is worth more than an unchecked grammar number: a reader that misreads the kind
 * acts on the wrong egg, whereas a reader that has not read the version yet simply zooms in. The cost
 * is honest and it is two extra bands on a full stack.
 */
export interface CodeGroup {
	zoom: 'far' | 'mid' | 'near';
	/** Fields this group carries, in drawing order. */
	fields: readonly (keyof typeof FIELD_DIGITS)[];
	/** Payload digits it adds, before its check band. */
	digits: number;
}

export const GROUPS: readonly CodeGroup[] = [
	{ zoom: 'far', fields: ['kind'], digits: FIELD_DIGITS.kind },
	{ zoom: 'mid', fields: ['version', 'id'], digits: FIELD_DIGITS.version + FIELD_DIGITS.id },
	{ zoom: 'near', fields: ['value'], digits: FIELD_DIGITS.value }
];

/** Total bands on a full stack, whatever the alphabet: every group's digits plus every group's check. */
export const CODE_LENGTH = GROUPS.reduce((n, g) => n + g.digits + 1, 0);

/**
 * The band counts a read may legally stop at — 2, 6, 9 — since those are where a check band sits.
 *
 * A stack read to any other length is a partial group, which is refused rather than trusted. Six bands
 * of a nine-band stack is an answer; five bands of it is half an answer with no way to tell.
 */
export const GROUP_LENGTHS: readonly number[] = GROUPS.map((_, i) => GROUPS.slice(0, i + 1).reduce((n, g) => n + g.digits + 1, 0));

/** The largest id and value this alphabet can carry, since two digits mean different things in each. */
export function fieldLimits(alphabet: BandAlphabet = ALPHABET): { id: number; value: number } {
	const base = alphabet.colours.length;
	return { id: base * base - 1, value: base * base - 1 };
}

/** Digits in the order they are drawn, top to bottom, most significant first. */
export function encodeDigits(code: EggCode, alphabet: BandAlphabet = ALPHABET): number[] {
	const base = alphabet.colours.length;
	const limits = fieldLimits(alphabet);
	requireRange('kind', code.kind, 0, base - 1);
	requireRange('version', code.version, 0, base - 1);
	requireRange('id', code.id, 0, limits.id);
	requireRange('value', code.value, 0, limits.value);
	// Payload digits in drawing order, with each group's check band appended as the group closes. The
	// check covers everything above it, so a group's check verifies the whole prefix rather than its own
	// few bands — a far read that passes cannot have a wrong kind, and a mid read that passes cannot
	// have a wrong kind either.
	const fields: Record<keyof typeof FIELD_DIGITS, number[]> = {
		kind: [code.kind],
		version: [code.version],
		id: [Math.floor(code.id / base), code.id % base],
		value: [Math.floor(code.value / base), code.value % base]
	};

	const digits: number[] = [];
	const payload: number[] = [];
	for (const group of GROUPS) {
		for (const field of group.fields) {
			digits.push(...fields[field]);
			payload.push(...fields[field]);
		}
		digits.push(checkDigit(payload, base));
	}
	return digits;
}

/** What a read yielded: as much of the code as its groups carried, and how many of them there were. */
export interface PartialCode {
	kind: number;
	version: number | null;
	id: number | null;
	value: number | null;
	/** How many groups verified. 1 is a far read, 3 is the whole code. */
	groups: number;
}

export function decodeDigits(digits: readonly number[], alphabet: BandAlphabet = ALPHABET): EggCode | null {
	const read = decodePrefix(digits, alphabet);
	if (read === null || read.groups !== GROUPS.length) return null;
	return { kind: read.kind, version: read.version!, id: read.id!, value: read.value! };
}

/**
 * Decode as many groups as are there, verifying each one.
 *
 * Returns null for a length that is not a group boundary, for a digit outside the alphabet, or for a
 * check that fails — including a check that fails in group one of three, because a stack whose first
 * group is wrong is not a stack whose later groups are worth reading.
 */
export function decodePrefix(digits: readonly number[], alphabet: BandAlphabet = ALPHABET): PartialCode | null {
	const base = alphabet.colours.length;
	const groups = GROUP_LENGTHS.indexOf(digits.length) + 1;
	if (groups === 0) return null;
	if (digits.some((d) => !Number.isInteger(d) || d < 0 || d >= base)) return null;

	const payload: number[] = [];
	let at = 0;
	for (let g = 0; g < groups; g++) {
		payload.push(...digits.slice(at, at + GROUPS[g].digits));
		at += GROUPS[g].digits;
		if (checkDigit(payload, base) !== digits[at]) return null;
		at += 1;
	}

	return {
		kind: payload[0],
		version: groups >= 2 ? payload[1] : null,
		id: groups >= 2 ? payload[2] * base + payload[3] : null,
		value: groups >= 3 ? payload[4] * base + payload[5] : null,
		groups
	};
}

/**
 * Check digit over every payload digit read so far, weighted by position so a transposition fails too.
 *
 * Weighted from one and summed modulo the base. Cheap, and it catches the two errors this channel
 * actually makes: one band read as its neighbour, and two bands swapped by a misplaced grid.
 */
export function checkDigit(payload: readonly number[], base = ALPHABET.colours.length): number {
	let sum = 0;
	payload.forEach((d, i) => {
		sum += d * (i + 1);
	});
	return sum % base;
}

/** How many bands a given zoom draws: a whole number of groups, never a partial one. */
export function prefixLength(zoom: 'far' | 'mid' | 'near' | 'full'): number {
	if (zoom === 'full') return CODE_LENGTH;
	return GROUP_LENGTHS[GROUPS.findIndex((g) => g.zoom === zoom)];
}

export function digitsToColours(digits: readonly number[], alphabet: BandAlphabet = ALPHABET): RGB[] {
	return digits.map((d) => {
		requireRange('band', d, 0, alphabet.colours.length - 1);
		return alphabet.colours[d];
	});
}

/**
 * Nearest colour in the alphabet, with the runner-up's distance.
 *
 * The margin is what a reader acts on: a band 40 units from red and 42 from orange has been read by
 * a coin toss, whatever the nearest one says.
 */
export function nearestDigit(colour: RGB, alphabet: BandAlphabet = ALPHABET): { digit: number; distance: number; margin: number } {
	let digit = 0;
	let best = Number.POSITIVE_INFINITY;
	let second = Number.POSITIVE_INFINITY;
	alphabet.colours.forEach((p, i) => {
		const d = (p[0] - colour[0]) ** 2 + (p[1] - colour[1]) ** 2 + (p[2] - colour[2]) ** 2;
		if (d < best) {
			second = best;
			best = d;
			digit = i;
		} else if (d < second) {
			second = d;
		}
	});
	const distance = Math.sqrt(best);
	return { digit, distance, margin: Math.sqrt(second) - distance };
}

/** The closest pair in an alphabet, which is the noise budget every band has to live inside. */
export function separation(alphabet: BandAlphabet): number {
	let closest = Number.POSITIVE_INFINITY;
	const c = alphabet.colours;
	for (let i = 0; i < c.length; i++) {
		for (let j = i + 1; j < c.length; j++) {
			closest = Math.min(closest, Math.hypot(c[i][0] - c[j][0], c[i][1] - c[j][1], c[i][2] - c[j][2]));
		}
	}
	return closest;
}

function requireRange(what: string, v: number, lo: number, hi: number): void {
	if (!Number.isInteger(v) || v < lo || v > hi) {
		throw new RangeError(`${what} must be an integer in [${lo}, ${hi}], got ${v}`);
	}
}
