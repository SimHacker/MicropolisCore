/**
 * How many colours can a band carry, and how few pixels tall can a band be?
 *
 * The spec said "ten to twelve maximally separated colours, chosen against the game's actual rendered
 * output rather than against theory". This is the theory-free half: sweep every alphabet against every
 * band height under every degradation, and let the grid say which pairs survive. The remaining half
 * needs a real screenshot of the real sprites, and no amount of this substitutes for it.
 *
 * A cell passes only if EVERY code in the sample decodes exactly. One misread in twenty is not a
 * legible cell — it is a cell that will be wrong in front of a player.
 *
 *   pnpm --filter @micropolis/optical-codec tsx scripts/measure-eggs.ts
 */

import { blur, noise, perspective, roundTrip, tint } from '../src/degrade';
import { ALPHABETS, fieldLimits, separation, type BandAlphabet, type EggCode } from '../src/egg-code';
import { readEggs } from '../src/egg-read';
import { drawEgg } from '../src/egg-render';
import { createRaster, fillRect, type Raster } from '../src/raster';

const BAND_HEIGHTS = [2, 3, 4, 5, 6, 8];
const SAMPLE = 16;

const conditions: { name: string; apply: (r: Raster) => Raster }[] = [
	{ name: 'clean screen grab', apply: (r) => r },
	{ name: 'window at 50%', apply: (r) => roundTrip(r, 0.5) },
	{ name: 'window at 33%', apply: (r) => roundTrip(r, 0.34) },
	{ name: 'soft focus', apply: (r) => blur(r, 1) },
	{ name: 'evening light', apply: (r) => tint(r, [0.62, 0.7, 1.05]) },
	{ name: 'phone: noise + warm cast', apply: (r) => noise(tint(r, [1.1, 1, 0.82]), 18) },
	{ name: 'phone: noisy and soft', apply: (r) => noise(blur(r, 1), 12) },
	{
		name: 'phone: tilted',
		apply: (r) =>
			perspective(r, {
				tl: [8, 4],
				tr: [r.width - 3, 13],
				br: [r.width - 10, r.height - 6],
				bl: [3, r.height - 12]
			})
	}
];

/** A deterministic spread of codes, so a failing cell can be reproduced exactly. */
function codes(alphabet: BandAlphabet): EggCode[] {
	const base = alphabet.colours.length;
	const limits = fieldLimits(alphabet);
	const out: EggCode[] = [];
	let state = 20260917;
	// High bits, not low. An LCG's low bits barely move, and `state % base` on a small base returned
	// the same digit sixteen times — a sample of one code wearing a sample of sixteen's clothes.
	const next = (n: number): number => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return Math.floor((state / 0x80000000) * n);
	};
	for (let i = 0; i < SAMPLE; i++) {
		out.push({ kind: next(base), version: 1 % base, id: next(limits.id + 1), value: next(limits.value + 1) });
	}
	return out;
}

/** One egg on a floor, with the room furniture the reader has to ignore. */
function scene(code: EggCode, alphabet: BandAlphabet, bandHeight: number): Raster {
	const radius = Math.max(4, Math.round(bandHeight * 1.6));
	const width = radius * 6;
	const height = bandHeight * 12 + 24;
	const frame = createRaster(width, height, [92, 84, 72]);
	fillRect(frame, 0, 0, width, Math.round(height * 0.35), [64, 72, 96]);
	drawEgg(frame, code, { x: Math.round(width / 2), y: height - 8 }, { alphabet, bandHeight, radius, lit: 'steady' });
	return frame;
}

function passes(alphabet: BandAlphabet, bandHeight: number, apply: (r: Raster) => Raster): boolean {
	for (const code of codes(alphabet)) {
		const frame = apply(scene(code, alphabet, bandHeight));
		const readings = readEggs(frame, { alphabet });
		const got = readings.find((r) => r.code !== null)?.code;
		if (got === undefined) return false;
		if (got.kind !== code.kind || got.version !== code.version || got.id !== code.id || got.value !== code.value) return false;
	}
	return true;
}

console.log(`${SAMPLE} codes a cell, all of which must decode exactly. Cell shows the largest alphabet that did.`);
console.log('');
console.log(`${'band height, pixels'.padEnd(28)}${BAND_HEIGHTS.map((h) => String(h).padStart(6)).join('')}`);

for (const condition of conditions) {
	const cells = BAND_HEIGHTS.map((bandHeight) => {
		let largest = 0;
		for (const alphabet of ALPHABETS) {
			if (passes(alphabet, bandHeight, condition.apply)) largest = Math.max(largest, alphabet.colours.length);
		}
		return (largest === 0 ? '--' : String(largest)).padStart(6);
	});
	console.log(`${condition.name.padEnd(28)}${cells.join('')}`);
}

console.log('');
console.log('closest pair in each alphabet, which is the noise budget a band lives inside:');
for (const alphabet of ALPHABETS) {
	console.log(`  ${alphabet.name.padEnd(12)} ${alphabet.colours.length} colours  ${separation(alphabet).toFixed(1)}`);
}
