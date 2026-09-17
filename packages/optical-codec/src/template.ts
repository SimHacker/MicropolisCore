/**
 * Finding a known piece of art in a frame, and with it the frame's scale and origin.
 *
 * This is how a reader stops depending on coordinates somebody measured once at one resolution. Give
 * it a fixed piece of the application's own interface art and it answers where that art is, at what
 * scale, and how sure it is. Everything measured relative to that art then works at any window size,
 * and a window that does not contain the art is refused instead of read.
 *
 * The score is normalised cross-correlation: brightness is centred and divided by its own spread, so
 * a match survives gamma, a dimmed window and a screenshot saved by something helpful, and cannot be
 * won by a bright flat region the way a sum of differences can. 1.0 is identical, 0 is unrelated, and
 * anything below about 0.9 on interface art means it is not there.
 *
 * Greyscale, deliberately. Interface art is drawn from a palette somebody may have modded, and hue is
 * the first thing a re-release changes; structure is the last. Dropping colour also makes the search
 * a third of the work.
 *
 * Scale is searched, not assumed, because a captured window can be stretched — a re-release, a
 * scaled desktop, a screenshot taken at device pixels. Nearest-neighbour upscaling is recovered
 * exactly; a smooth upscale scores lower and says so.
 */

import { getPixel, type Raster } from './raster';

export interface Template {
	name: string;
	width: number;
	height: number;
	/** Greyscale, row-major, one byte a pixel. */
	plane: Uint8Array;
	/**
	 * Where this art sits in the layout that owns it, so a match yields the whole layout's origin.
	 * Negative means measured from the far edge, the way the art itself is anchored.
	 */
	anchor?: { x: number; y: number; fromRight?: boolean; fromBottom?: boolean };
}

export interface MatchOptions {
	/** Scales to try. 1 first, since it is the common case and lets the rest be pruned. */
	scales?: number[];
	/** Restrict the search, in frame pixels. Cheap and it is usually known which strip to look in. */
	region?: { x: number; y: number; width: number; height: number };
	/**
	 * How much to thin the template for the survey pass: every nth pixel in each axis. Defaults to an
	 * eighth of the smaller side. 1 surveys with the whole template, which is exact and slow.
	 */
	sample?: number;
	/** Give up below this. Reporting nothing beats reporting a coincidence. */
	minScore?: number;
}

export interface TemplateMatch {
	template: string;
	x: number;
	y: number;
	scale: number;
	/** Normalised cross-correlation, 1.0 being identical. */
	score: number;
}

/**
 * 1 first, since it is the common case and an exact hit ends the search.
 *
 * No scales below 1: a capture smaller than the art has thrown away the pixels a reader needs, so
 * finding the panel in it would only license reading text that is no longer there.
 */
const DEFAULT_SCALES = [1, 2, 1.5, 1.25];

/**
 * How many survey candidates get scored with every pixel of the template.
 *
 * The survey visits every position, but with a thinned template, so its ranking is approximate and the
 * true position is not always its winner. Sixteen distinct neighbourhoods is far more than interface
 * art needs and still costs nothing next to the survey itself.
 */
const CANDIDATES = 16;

/** Greyscale a raster once, so a search over many positions is not re-reading colour. */
export function greyscale(raster: Raster): { width: number; height: number; plane: Uint8Array } {
	const plane = new Uint8Array(raster.width * raster.height);
	for (let y = 0; y < raster.height; y++) {
		for (let x = 0; x < raster.width; x++) {
			const [r, g, b] = getPixel(raster, x, y);
			plane[y * raster.width + x] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
		}
	}
	return { width: raster.width, height: raster.height, plane };
}

/** A template from a region of a raster: how art gets lifted out of an application's own files. */
export function templateFrom(
	raster: Raster,
	name: string,
	region: { x: number; y: number; width: number; height: number },
	anchor?: Template['anchor']
): Template {
	const plane = new Uint8Array(region.width * region.height);
	for (let y = 0; y < region.height; y++) {
		for (let x = 0; x < region.width; x++) {
			const [r, g, b] = getPixel(raster, region.x + x, region.y + y);
			plane[y * region.width + x] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
		}
	}
	return { name, width: region.width, height: region.height, plane, anchor };
}

/**
 * Mean and standard deviation of a template, over every pixel or over a thinned sample of them.
 *
 * A thinned pass has to compare against the thinned template's own statistics, not the whole
 * template's, or the correlation is measuring two different pictures.
 */
function moments(template: { width: number; height: number; plane: Uint8Array }, step: number): { mean: number; spread: number } {
	let sum = 0;
	let sumSquares = 0;
	let n = 0;
	for (let y = 0; y < template.height; y += step) {
		for (let x = 0; x < template.width; x += step) {
			const v = template.plane[y * template.width + x];
			sum += v;
			sumSquares += v * v;
			n++;
		}
	}
	const mean = sum / n;
	return { mean, spread: Math.sqrt(Math.max(0, sumSquares / n - mean * mean)) };
}

/**
 * Best position and scale for one template, or null.
 *
 * Two passes over every position in the region. The first uses a thinned template — every eighth
 * pixel by default — and keeps the best few separated neighbourhoods; the second re-scores those with
 * the whole template, and that is the score reported.
 *
 * Thinning the template rather than striding over the frame is the important choice. Interface art is
 * full of hard horizontal edges, so a template landing two rows off correlates badly: a grid that
 * steps over the true position never learns the art's real score there, and hands the answer to
 * whichever unrelated neighbourhood the grid happened to land on squarely. Thinning costs accuracy in
 * the ranking, which the second pass fixes, instead of costing the answer.
 */
export function matchTemplate(frame: Raster | { width: number; height: number; plane: Uint8Array }, template: Template, options: MatchOptions = {}): TemplateMatch | null {
	const grey = 'plane' in frame ? frame : greyscale(frame);
	const scales = options.scales ?? DEFAULT_SCALES;
	const minScore = options.minScore ?? 0.9;
	const region = options.region ?? { x: 0, y: 0, width: grey.width, height: grey.height };
	// Flat art carries no structure to correlate against, so it cannot be an anchor.
	const whole = moments(template, 1);
	if (whole.spread < 1) return null;

	// The survey thins the template rather than striding over the frame. Interface art is full of hard
	// horizontal edges, and a template two rows out of position correlates badly — so a grid that steps
	// over the true position never sees the art's real score there, and loses to some other
	// neighbourhood. Every position, fewer pixels each, is both faster and right.
	const step = Math.max(1, options.sample ?? Math.round(Math.min(template.width, template.height) / 8));
	const thin = step === 1 ? whole : moments(template, step);

	let best: TemplateMatch | null = null;

	for (const scale of scales) {
		const w = Math.round(template.width * scale);
		const h = Math.round(template.height * scale);
		if (w < 2 || h < 2 || w > grey.width || h > grey.height) continue;

		const maxX = Math.min(region.x + region.width, grey.width) - w;
		const maxY = Math.min(region.y + region.height, grey.height) - h;
		if (maxX < region.x || maxY < region.y) continue;

		// Sampled at the template's own resolution, so cost does not grow with the scale tried.
		const score = (x: number, y: number, sample: number, reference: { mean: number; spread: number }): number => {
			let sum = 0;
			let sumSquares = 0;
			let cross = 0;
			let n = 0;
			for (let ty = 0; ty < template.height; ty += sample) {
				const row = (y + Math.floor(ty * scale)) * grey.width;
				const trow = ty * template.width;
				for (let tx = 0; tx < template.width; tx += sample) {
					const v = grey.plane[row + x + Math.floor(tx * scale)];
					sum += v;
					sumSquares += v * v;
					cross += v * template.plane[trow + tx];
					n++;
				}
			}
			const mean = sum / n;
			const spread = Math.sqrt(Math.max(0, sumSquares / n - mean * mean));
			if (spread < 1) return 0;
			return (cross / n - mean * reference.mean) / (spread * reference.spread);
		};

		// Survey: the best handful of DISTINCT neighbourhoods. Without the separation rule the whole
		// handful lands next to each other on one peak, and the runner-up neighbourhood — which may be
		// the real art — never gets scored properly.
		const separation = Math.max(4, Math.round(Math.min(w, h) / 4));
		const found: { x: number; y: number; score: number }[] = [];
		for (let y = region.y; y <= maxY; y++) {
			for (let x = region.x; x <= maxX; x++) {
				const s = score(x, y, step, thin);
				if (found.length === CANDIDATES && s <= found[found.length - 1].score) continue;

				const near = found.findIndex((c) => Math.abs(c.x - x) < separation && Math.abs(c.y - y) < separation);
				if (near >= 0) {
					if (s <= found[near].score) continue;
					found.splice(near, 1);
				}
				const at = found.findIndex((c) => s > c.score);
				found.splice(at < 0 ? found.length : at, 0, { x, y, score: s });
				if (found.length > CANDIDATES) found.pop();
			}
		}

		// Then every position in each of those neighbourhoods, with the whole template. Re-scoring only
		// the survey's own pick would trust a ranking made from an eighth of the pixels: where the art
		// repeats on the sampling period the thinned scores tie, and the tie is broken by scan order
		// rather than by the art. The neighbourhood is the reliable part of a survey; the position
		// inside it is not.
		let topScore = -Infinity;
		let topX = 0;
		let topY = 0;
		for (const candidate of found) {
			for (let y = Math.max(region.y, candidate.y - separation); y <= Math.min(maxY, candidate.y + separation); y++) {
				for (let x = Math.max(region.x, candidate.x - separation); x <= Math.min(maxX, candidate.x + separation); x++) {
					const s = score(x, y, 1, whole);
					if (s > topScore) {
						topScore = s;
						topX = x;
						topY = y;
					}
				}
			}
			if (topScore > 0.999) break;
		}

		if (best === null || topScore > best.score) best = { template: template.name, x: topX, y: topY, scale, score: topScore };
		// An exact hit is the ordinary case, and there is nothing left for another scale to beat.
		if (topScore > 0.999) break;
	}

	return best !== null && best.score >= minScore ? best : null;
}

/** Draw a template into a raster: how a test produces a frame for the matcher to find art in. */
export function drawTemplate(raster: Raster, template: Template, x: number, y: number, scale = 1): void {
	const w = Math.round(template.width * scale);
	const h = Math.round(template.height * scale);
	for (let dy = 0; dy < h; dy++) {
		for (let dx = 0; dx < w; dx++) {
			const v = template.plane[Math.floor(dy / scale) * template.width + Math.floor(dx / scale)];
			const px = x + dx;
			const py = y + dy;
			if (px < 0 || py < 0 || px >= raster.width || py >= raster.height) continue;
			const at = (py * raster.width + px) * 4;
			raster.data[at] = v;
			raster.data[at + 1] = v;
			raster.data[at + 2] = v;
			raster.data[at + 3] = 255;
		}
	}
}
