/**
 * Reading a band code off a frame.
 *
 * The egg is our own art, so this is not a general detector and should not pretend to be. It knows
 * four things about what it is looking for, and every one of them does work:
 *
 *   the caps are extremes   Pure white above pure black, and every payload colour lies between them
 *                           in every channel. So the caps are the brightest and darkest runs in any
 *                           column through the egg, whatever the lighting does — a multiplicative
 *                           cast cannot lift a band above the white cap that shares its illuminant.
 *   the cap is one band     So the sentinel carries the metric. Find both caps and the slicing
 *                           follows; nothing here has to be told the zoom.
 *   the stack is a column   One vertical scan per column, and the columns that agree are one egg.
 *                           No connected components, no shape fitting, no rotation to solve — the
 *                           egg is a solid of revolution, so there is only one view of it.
 *   the caps are references White and black, per channel, which is exactly what an affine colour
 *                           correction needs. A tinted, dimmed, night-lit egg corrects itself.
 *
 * THREE FAILURES THAT BECAME RULES
 *
 * Measure from centres, not edges. A blurred cap loses its edges to whatever threshold classifies
 * them, so a run's HEIGHT reads short and the arithmetic that depends on it collapses. The distance
 * between the two cap CENTRES is what blur leaves alone.
 *
 * Take the best band count, not the first that fits. A span of 24 pixels is divisible by a great many
 * band heights, and only one of them is the height the caps actually are — so every count is scored
 * against the caps and the best wins. Taking the first is how a seven-band stack reads as one band.
 *
 * Judge brightness within the column, never against the frame. An earlier version estimated the
 * frame's white point to ask whether a slab was neutral grey, and a close-up egg broke it: the egg's
 * own red and yellow bands were the brightest thing in the frame, the estimated white came out
 * yellow, and the white cap stopped looking neutral in it. Neutrality needs a reference the reader
 * does not have yet. Extremes need none.
 *
 * WHAT IT REFUSES
 *
 * A read is reported with the margin that produced it: how much closer the winning colour was than
 * the runner-up, in the units the palette is separated in. A band read by a coin toss says so, and a
 * full stack whose check digit fails yields no code at all. The digits are still returned, because a
 * person looking at a bad read wants to see what the machine saw.
 */

import {
	ALPHABET,
	CODE_LENGTH,
	GROUPS,
	GROUP_LENGTHS,
	decodePrefix,
	nearestDigit,
	separation,
	type BandAlphabet,
	type PartialCode
} from './egg-code';
import { createRaster, getPixel, setPixel, type RGB, type Raster } from './raster';

export interface EggReadOptions {
	alphabet?: BandAlphabet;
	/** Smallest band height worth trying, in frame pixels. Below 2 there is nothing to average. */
	minBandHeight?: number;
	/** Largest, so a white wall above a dark floor is not a candidate egg. */
	maxBandHeight?: number;
	/** Reject a band whose winning colour is not this many units clearer than the runner-up. */
	minMargin?: number;
	region?: { x: number; y: number; width: number; height: number };
}

export interface EggReading {
	/** Where the stack is, caps included. */
	box: { x: number; y: number; width: number; height: number };
	/** Band height as measured off the caps, which is also the zoom. */
	bandHeight: number;
	/** What was read, top to bottom, most significant first. */
	digits: number[];
	/**
	 * What the stack said, or null if nothing verified.
	 *
	 * A short stack is not a failure: two bands that pass their check ARE an answer, with version, id
	 * and value reported as null and groups as 1. The zoom decides how much is there; the check decides
	 * whether to believe it (egg-code.ts, GROUPS).
	 */
	code: PartialCode | null;
	/** The worst band's margin, in palette-distance units. Compare against palette separation. */
	margin: number;
	/** margin over half the palette's closest pair: 1 means the worst band was still unambiguous. */
	confidence: number;
	/** Why there is no code, when there is none. */
	refused?: 'partial group' | 'check failed' | 'margin';
}

/** A candidate found in one column, measured between cap centres. */
interface Column {
	x: number;
	/** Row at the middle of the white cap. */
	top: number;
	/** Row at the middle of the black cap. */
	bottom: number;
	bandHeight: number;
	bands: number;
}

export function readEggs(frame: Raster, options: EggReadOptions = {}): EggReading[] {
	const alphabet = options.alphabet ?? ALPHABET;
	const minBand = Math.max(2, options.minBandHeight ?? 2);
	const maxBand = options.maxBandHeight ?? Math.max(minBand, Math.floor(frame.height / 6));
	const region = options.region ?? { x: 0, y: 0, width: frame.width, height: frame.height };
	const minMargin = options.minMargin ?? separation(alphabet) * 0.25;

	// Smoothed once, across the width, because every question below is about vertical structure and a
	// band is one colour all the way across. Per-pixel noise is what invents boundaries, and a median
	// of five neighbours removes it before anything looks for one.
	const smooth = acrossTheWidth(frame);

	const columns: Column[] = [];
	const x1 = Math.min(frame.width, region.x + region.width);
	for (let x = region.x; x < x1; x++) {
		const found = scanColumn(smooth, x, region, minBand, maxBand);
		if (found !== null) columns.push(found);
	}

	const readings: EggReading[] = [];
	for (const group of groupColumns(columns)) {
		const reading = readStack(frame, group, alphabet, minMargin);
		if (reading !== null) readings.push(reading);
	}
	return readings;
}

/**
 * A copy of the frame, median-filtered across the width.
 *
 * Five neighbours, which is enough to remove per-pixel noise and narrow enough not to smear a band
 * boundary — boundaries are horizontal, so a horizontal filter cannot move them at all. Every vertical
 * measurement afterwards is made on this: cap runs, the column's range, band edges. Only the final
 * colour sampling goes back to the original pixels, where nothing has been averaged with anything.
 */
function acrossTheWidth(frame: Raster): Raster {
	const out = createRaster(frame.width, frame.height);
	const r: number[] = [];
	const g: number[] = [];
	const b: number[] = [];
	for (let y = 0; y < frame.height; y++) {
		for (let x = 0; x < frame.width; x++) {
			r.length = 0;
			g.length = 0;
			b.length = 0;
			for (let dx = -2; dx <= 2; dx++) {
				const c = getPixel(frame, x + dx, y);
				r.push(c[0]);
				g.push(c[1]);
				b.push(c[2]);
			}
			setPixel(out, x, y, [median(r), median(g), median(b)]);
		}
	}
	return out;
}

/**
 * One column, top to bottom: a white run with a black run somewhere below it whose spacing is a
 * whole number of cap heights.
 *
 * The test is structural, not chromatic: the space between the two cap centres divides evenly by a
 * plausible band height, and the height that divides it best is close to the height of the runs
 * themselves. A white cloud above a dark doorway fails on the arithmetic.
 */
function scanColumn(
	frame: Raster,
	x: number,
	region: { x: number; y: number; width: number; height: number },
	minBand: number,
	maxBand: number
): Column | null {
	const y0 = Math.max(0, region.y);
	const y1 = Math.min(frame.height, region.y + region.height);

	// The column's range, as percentiles rather than extremes. One noisy pixel would otherwise set the
	// top of the range, every threshold measured from it would move, and the caps would stop being the
	// brightest and darkest things in it. The font reader learned the same lesson about ink and paper.
	const lumas: number[] = [];
	for (let y = y0; y < y1; y++) lumas.push(luma(getPixel(frame, x, y)));
	lumas.sort((a, b) => a - b);
	const lo = lumas[Math.floor(lumas.length * 0.02)];
	const hi = lumas[Math.floor(lumas.length * 0.98)];
	// No contrast in this column means no cap pair in it.
	if (hi - lo < 60) return null;

	// The top and bottom of this column's own range. Wide enough that a blurred or dimmed cap still
	// falls inside it, narrow enough that the brightest band does not.
	const bright = (c: RGB): boolean => luma(c) >= lo + (hi - lo) * 0.85;
	const dark = (c: RGB): boolean => luma(c) <= lo + (hi - lo) * 0.15;

	let best: Column | null = null;
	let bestError = Number.POSITIVE_INFINITY;

	for (let y = y0; y < y1; y++) {
		const capHeight = runOf(frame, x, y, y1, bright);
		if (capHeight < 1) continue;
		const top = y + (capHeight - 1) / 2;
		y += capHeight - 1;
		if (capHeight > maxBand) continue;

		for (let below = Math.ceil(top + minBand); below < y1; below++) {
			const darkHeight = runOf(frame, x, below, y1, dark);
			if (darkHeight < 1) continue;
			const bottom = below + (darkHeight - 1) / 2;
			below += darkHeight - 1;

			// From two, because the furthest legal zoom draws two bands — kind and version. A one-band
			// stack is not a code at any distance, so admitting one only invents candidates: a glow over
			// a dark floor makes a bright run above a dark run, and one gap is too easy to satisfy.
			const span = bottom - top;
			const edges = transitions(frame, x, top, bottom, hi - lo);
			for (let bands = 2; bands <= CODE_LENGTH; bands++) {
				const height = span / (bands + 1);
				if (height < minBand || height > maxBand) continue;
				// The caps are one band tall, so their runs bound the answer loosely — loosely, because a
				// threshold shrinks a blurred run and that is exactly the error the fit below is here to
				// survive. This only throws out counts the caps could not possibly support.
				if (height < capHeight * 0.6 || height < darkHeight * 0.6) continue;
				if (height > capHeight * 2.4 && height > darkHeight * 2.4) continue;

				const error = fit(edges, top, height, bands, capHeight, darkHeight);
				if (error < bestError) {
					bestError = error;
					best = { x, top, bottom, bandHeight: height, bands };
				}
			}
		}
	}
	return best;
}

/**
 * Where the colour changes along the column, between the two caps.
 *
 * These are what the band count is really measured against. Cap-run heights are a weak estimator: a
 * threshold moves them by a pixel, and one pixel is the whole difference between six bands and seven,
 * since span/(n+1) for neighbouring n differs by about span/n². Band EDGES do not move — a boundary
 * between two colours stays where it is under blur and resampling, because the ramp is symmetric
 * about it. So find the edges, then ask which band count puts a grid line on each of them.
 *
 * A ramp several rows wide counts once, at its centre of mass, which is where the boundary was.
 */
function transitions(frame: Raster, x: number, top: number, bottom: number, contrast: number): number[] {
	const threshold = Math.max(30, contrast * 0.3);
	const from = Math.ceil(top);
	const to = Math.floor(bottom);

	const found: { at: number; weight: number }[] = [];
	let weight = 0;
	let moment = 0;
	let previous = getPixel(frame, x, from);
	for (let y = from + 1; y <= to; y++) {
		const here = getPixel(frame, x, y);
		const change = Math.abs(previous[0] - here[0]) + Math.abs(previous[1] - here[1]) + Math.abs(previous[2] - here[2]);
		previous = here;
		if (change >= threshold) {
			weight += change;
			moment += change * (y - 0.5);
			continue;
		}
		if (weight > 0) {
			found.push({ at: moment / weight, weight });
			weight = 0;
			moment = 0;
		}
	}
	if (weight > 0) found.push({ at: moment / weight, weight });

	// A stack has at most one boundary per band plus the two cap edges. More than that means noise got
	// through, and the strongest are the ones drawn: a real boundary between two palette colours is a
	// bigger step than anything a sensor adds.
	found.sort((a, b) => b.weight - a.weight);
	return found
		.slice(0, CODE_LENGTH + 2)
		.map((edge) => edge.at)
		.sort((a, b) => a - b);
}

/**
 * How badly a band count explains the edges that are actually there, in units of one band.
 *
 * Every edge must land on a grid line, and the worst offender is the score — a mean would let one
 * badly explained edge hide behind five good ones, and one misplaced boundary is one wrong digit.
 *
 * Grid lines with no edge on them are not penalised, because two adjacent bands of the same digit
 * have no boundary to find. That is also the case this cannot resolve: a stack whose every band is
 * identical has no edges at all, and then the cap heights are the only evidence there is, so the fit
 * falls back to them and says as much by scoring worse.
 */
function fit(edges: readonly number[], top: number, height: number, bands: number, capHeight: number, darkHeight: number): number {
	// Nothing to align to. That happens two ways: a stack whose every band is the same digit has no
	// boundaries to find, and a badly blurred one has boundaries too soft to see. Either way the caps
	// are the only evidence left, so fall back to them — and score worse than any real alignment would,
	// because this is a guess from one measurement rather than a fit to several.
	if (edges.length === 0) {
		return 0.5 + (Math.abs(height - capHeight) + Math.abs(height - darkHeight)) / (height * 4);
	}
	let worst = 0;
	for (const edge of edges) {
		// Half a band off the cap's centre, because that is where the cap ENDS: the boundaries are at
		// top + h/2 + kh, and a grid starting at the centre itself is half a band wrong everywhere —
		// which reads as a stack with a band too many, since that is the count whose lines happen to
		// land nearest the offset ones.
		const line = Math.round((edge - top) / height - 0.5);
		if (line < 0 || line > bands) return 2; // an edge outside the stack it claims to be in
		worst = Math.max(worst, Math.abs(edge - (top + height * (line + 0.5))) / height);
	}
	// A count that explains every edge but posits bands nobody drew a boundary for is worse than one
	// that explains the same edges with fewer, so ties break toward the coarser reading.
	return worst + bands * 1e-3;
}

/** Length of the run starting at y for which the predicate holds. */
function runOf(frame: Raster, x: number, y: number, y1: number, ok: (c: RGB) => boolean): number {
	let n = 0;
	while (y + n < y1 && ok(getPixel(frame, x, y + n))) n++;
	return n;
}

/**
 * Columns belong to the same egg when they agree about where it starts and ends.
 *
 * Adjacent columns through one egg see the same cap rows, because the caps are horizontal. That is
 * cheaper than any clustering, and it rejects a diagonal accident: two columns of an unrelated
 * gradient rarely agree on both edges and on the band count.
 */
function groupColumns(columns: Column[]): Column[][] {
	const groups: Column[][] = [];
	let current: Column[] = [];
	for (const column of columns) {
		const last = current[current.length - 1];
		const joins =
			last !== undefined &&
			column.x === last.x + 1 &&
			Math.abs(column.top - last.top) <= 1 &&
			Math.abs(column.bottom - last.bottom) <= 1 &&
			column.bands === last.bands;
		if (joins) {
			current.push(column);
			continue;
		}
		if (current.length >= 3) groups.push(current);
		current = [column];
	}
	if (current.length >= 3) groups.push(current);
	return groups;
}

/** Sample the bands of one grouped stack, correct their colours off the caps, and name the digits. */
function readStack(frame: Raster, group: Column[], alphabet: BandAlphabet, minMargin: number): EggReading | null {
	const middle = group[Math.floor(group.length / 2)];
	const left = group[0].x;
	const right = group[group.length - 1].x;
	// A quarter of the width, at the centre: inside the silhouette at every row including the taper by
	// the top cap, and away from the edges where a resample has mixed the egg with the floor.
	const half = Math.max(0, Math.floor((right - left) / 4));
	const from = Math.max(left, middle.x - half);
	const to = Math.min(right, middle.x + half);

	const band = middle.bandHeight;
	// A band is wider than it is tall in every egg anyone would draw, because the stack is a solid of
	// revolution whose radius is at least a band. A candidate narrower than that is a column of
	// something else that happened to divide evenly — a glow over a dark floor, most often.
	if (right - left + 1 < band * 1.2) return null;

	const white = sample(frame, from, to, middle.top, band);
	const black = sample(frame, from, to, middle.bottom, band);

	const digits: number[] = [];
	let worst = Number.POSITIVE_INFINITY;
	for (let i = 0; i < middle.bands; i++) {
		const raw = sample(frame, from, to, middle.top + band * (i + 1), band);
		const { digit, margin } = nearestDigit(correct(raw, white, black), alphabet);
		digits.push(digit);
		worst = Math.min(worst, margin);
	}
	if (digits.length === 0) return null;

	const box = {
		x: left,
		y: Math.round(middle.top - band / 2),
		width: right - left + 1,
		height: Math.round(middle.bottom - middle.top + band)
	};
	const confidence = worst / (separation(alphabet) / 2);

	if (worst < minMargin) return { box, bandHeight: band, digits, code: null, margin: worst, confidence, refused: 'margin' };

	// A stack read past a check band but short of the next one is a partial group. Drop back to the last
	// group boundary rather than refusing the whole read: the bands below the last check are real, they
	// are just not vouched for, and what is vouched for is worth returning.
	const whole = GROUP_LENGTHS.filter((n) => n <= digits.length).pop();
	if (whole === undefined) {
		return { box, bandHeight: band, digits, code: null, margin: worst, confidence, refused: 'partial group' };
	}

	const code = decodePrefix(digits.slice(0, whole), alphabet);
	return code === null
		? { box, bandHeight: band, digits, code: null, margin: worst, confidence, refused: 'check failed' }
		: { box, bandHeight: band, digits, code, margin: worst, confidence };
}

/**
 * Median colour of the middle of one band, per channel.
 *
 * Median rather than mean: a row of the neighbouring band bleeding in from a resample is an outlier,
 * and an outlier moves a mean toward a colour nothing was drawn in. Only the inner half of the band
 * is sampled, for the same reason — a band's middle is the only part of it that is only it.
 */
function sample(frame: Raster, x0: number, x1: number, centre: number, height: number): RGB {
	const reach = Math.max(0, (height - 2) / 2);
	const y0 = Math.round(centre - reach);
	const y1 = Math.round(centre + reach);
	const r: number[] = [];
	const g: number[] = [];
	const b: number[] = [];
	for (let y = y0; y <= y1; y++) {
		for (let x = x0; x <= x1; x++) {
			const c = getPixel(frame, x, y);
			r.push(c[0]);
			g.push(c[1]);
			b.push(c[2]);
		}
	}
	return [median(r), median(g), median(b)];
}

function median(values: number[]): number {
	values.sort((a, b) => a - b);
	const mid = values.length >> 1;
	return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
}

/**
 * Put the sampled colour back where the artist drew it, per channel, from the two references.
 *
 * A degenerate reference — a cap crushed to nearly the value of the other — is left uncorrected
 * rather than divided by nearly zero, and the margin reports what that cost.
 */
function correct(colour: RGB, white: RGB, black: RGB): RGB {
	const out: [number, number, number] = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		const span = white[i] - black[i];
		out[i] = span < 24 ? colour[i] : Math.max(0, Math.min(255, ((colour[i] - black[i]) / span) * 255));
	}
	return out;
}

/** Rec.601, the same weights the rest of this package greys with. */
function luma(c: RGB): number {
	return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
}
