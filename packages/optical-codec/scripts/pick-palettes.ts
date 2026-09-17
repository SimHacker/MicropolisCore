/**
 * Choosing the band palettes, instead of picking colours that sound well separated.
 *
 * Hand-picked palettes had a defect the sweep exposed: octal and decimal came out with the SAME
 * closest pair, because orange sits between red and yellow and both palettes held all three. An
 * alphabet that buys two more digits per band for no loss in separation is not a trade-off, it is a
 * sign the smaller alphabet was badly chosen — so the smaller ones are now farthest-point selections
 * from a pool, and the ladder means something.
 *
 * The pool is constrained by what the READER needs, not by taste:
 *
 *   away from the caps    Nothing within 60 of white or black, which are the delimiters and the
 *                         colour references. A band that looks like a cap destroys the structure the
 *                         check digit is computed over.
 *   inside the thresholds Luma between 72 and 188. The cap finder claims the top and bottom 15% of a
 *                         column's range, so a band has to stay clear of both with margin to spare.
 *                         Measured, not guessed: at 46 a dark blue band sat at 15.1% of the range and
 *                         was read as a black cap, and seven of sixteen codes then failed to be found
 *                         at all under blur plus noise.
 *   saturated or grey     A colour has to be far from its neighbours after a colour cast, and the
 *                         chromatic ones survive that best. One grey is allowed and is useful: it is
 *                         far from every hue.
 *
 *   pnpm --filter @micropolis/optical-codec tsx scripts/pick-palettes.ts
 */

type RGB = [number, number, number];

const CAP_MARGIN = 60;
const LUMA_LOW = 72;
const LUMA_HIGH = 188;

const luma = (c: RGB): number => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
const dist = (a: RGB, b: RGB): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Every colour on a coarse RGB lattice that a band is allowed to be. */
function pool(): RGB[] {
	const out: RGB[] = [];
	for (let r = 0; r <= 255; r += 8) {
		for (let g = 0; g <= 255; g += 8) {
			for (let b = 0; b <= 255; b += 8) {
				const c: RGB = [r, g, b];
				const l = luma(c);
				if (l < LUMA_LOW || l > LUMA_HIGH) continue;
				if (dist(c, [255, 255, 255]) < CAP_MARGIN || dist(c, [0, 0, 0]) < CAP_MARGIN) continue;
				out.push(c);
			}
		}
	}
	return out;
}

function minPair(set: RGB[]): number {
	let worst = Number.POSITIVE_INFINITY;
	for (let i = 0; i < set.length; i++) {
		for (let j = i + 1; j < set.length; j++) worst = Math.min(worst, dist(set[i], set[j]));
	}
	return worst;
}

/**
 * Farthest-point insertion, then hill-climb by swapping the member of the closest pair.
 *
 * Maximising the smallest gap in a set is a packing problem nobody solves exactly for this size. The
 * greedy start plus swaps gets within a few units of the best known packings, and the number it
 * reports is measured either way — which is all the sweep needs from it.
 */
function pick(candidates: RGB[], k: number, seed: RGB): RGB[] {
	const chosen: RGB[] = [seed];
	while (chosen.length < k) {
		let best: RGB = candidates[0];
		let bestGap = -1;
		for (const c of candidates) {
			const gap = Math.min(...chosen.map((s) => dist(c, s)));
			if (gap > bestGap) {
				bestGap = gap;
				best = c;
			}
		}
		chosen.push(best);
	}

	for (let round = 0; round < 400; round++) {
		let improved = false;
		for (let i = 0; i < chosen.length; i++) {
			const without = chosen.filter((_, j) => j !== i);
			let best = chosen[i];
			let bestGap = Math.min(...without.map((s) => dist(chosen[i], s)));
			for (const c of candidates) {
				const gap = Math.min(...without.map((s) => dist(c, s)));
				if (gap > bestGap) {
					bestGap = gap;
					best = c;
				}
			}
			if (best !== chosen[i]) {
				chosen[i] = best;
				improved = true;
			}
		}
		if (!improved) break;
	}
	return chosen;
}

/** Top to bottom by hue, so a person reading a stack sees a wheel rather than a scramble. */
function byHue(set: RGB[]): RGB[] {
	const hue = (c: RGB): number => {
		const max = Math.max(...c);
		const min = Math.min(...c);
		if (max === min) return -1; // grey first, since it has no hue to sort by
		const d = max - min;
		const h = max === c[0] ? ((c[1] - c[2]) / d + 6) % 6 : max === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
		return h * 60;
	};
	return [...set].sort((a, b) => hue(a) - hue(b));
}

const candidates = pool();
console.log(`${candidates.length} colours in the pool: luma ${LUMA_LOW}-${LUMA_HIGH}, at least ${CAP_MARGIN} from either cap.`);
console.log('');

for (const k of [4, 6, 8, 10, 12]) {
	const set = byHue(pick(candidates, k, [208, 48, 48]));
	console.log(`${k} colours, closest pair ${minPair(set).toFixed(1)}:`);
	for (const c of set) console.log(`\t\t[${c[0]}, ${c[1]}, ${c[2]}], // luma ${luma(c).toFixed(0)}`);
	console.log('');
}
