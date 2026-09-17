/**
 * Which of the game's font sizes did the 2004 capture come from?
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 identify -- --from <UIGraphics/Fonts>
 *
 * The Simplifier's atlas was measured by hand off a running game at 800x600, so whatever size it
 * matches is the size the interface draws that text at — which is the one number nobody wrote down
 * and the recogniser needs. Compares two ways: advance widths from the hand-measured table against
 * each font's own advances, and glyph shape as intersection over union. Both should agree, and if
 * they do not, the interesting answer is in which glyphs disagree.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { decodeBMP } from '@micropolis/optical-codec/node/bmp';
import { getPixel } from '@micropolis/optical-codec';

import { FIRST_CODE, FONT_HEIGHT, FONT_W, FONT_X, FONT_Y, LAST_CODE } from './simplifier-metrics';
import { readGZFont } from './gzfont';

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'assets');

const from = process.argv.includes('--from') ? process.argv[process.argv.indexOf('--from') + 1] : process.env.SIMS_FONTS_DIR;
if (!from || !existsSync(from)) {
	console.error('point --from at a Sims 1 UIGraphics/Fonts directory, or set SIMS_FONTS_DIR');
	process.exit(1);
}

const captured = decodeBMP(readFileSync(join(assets, 'simplifier-font.bmp')));

/** The captured glyph as a set of inked cells, origin at its own top-left. */
function capturedShape(code: number): { cells: Set<string>; w: number; h: number } | null {
	const width = FONT_W[code];
	if (!width) return null;
	const cells = new Set<string>();
	let minX = Infinity;
	let minY = Infinity;
	const raw: [number, number][] = [];
	for (let y = 0; y < FONT_HEIGHT; y++) {
		for (let x = 0; x < width; x++) {
			const [r, g, b] = getPixel(captured.raster, FONT_X[code] + x, FONT_Y[code] + y);
			if (r === 0 && g === 0 && b === 0) continue;
			raw.push([x, y]);
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
		}
	}
	if (raw.length === 0) return null;
	let w = 0;
	let h = 0;
	for (const [x, y] of raw) {
		cells.add(`${x - minX},${y - minY}`);
		w = Math.max(w, x - minX + 1);
		h = Math.max(h, y - minY + 1);
	}
	return { cells, w, h };
}

const names = readdirSync(from)
	.filter((f) => /^VariableSans_\d+\.bmp$/i.test(f))
	.map((f) => f.replace(/\.bmp$/i, ''))
	.sort();

console.log(`captured atlas: ${captured.width}x${captured.height}, line height ${FONT_HEIGHT}\n`);
console.log(`${'font'.padEnd(17)} ${'lineH'.padStart(5)} ${'advances'.padStart(9)} ${'meanIoU'.padStart(8)} ${'exact'.padStart(6)}  worst glyphs`);

for (const name of names) {
	const { font } = readGZFont(join(from, `${name}.bmp`), join(from, `${name}.fot`), name);
	const byCode = new Map(font.glyphs.map((g) => [g.code, g]));

	let advanceHits = 0;
	let advanceTotal = 0;
	let iouSum = 0;
	let compared = 0;
	let exact = 0;
	const worst: { char: string; iou: number }[] = [];

	for (let code = FIRST_CODE; code <= LAST_CODE; code++) {
		const mine = capturedShape(code);
		const theirs = byCode.get(code);
		if (mine === null || theirs === undefined || theirs.cov.length === 0) continue;

		advanceTotal++;
		// The hand-measured table stores the sampled cell width, which is the advance the game used.
		if (FONT_W[code] === theirs.width) advanceHits++;

		let minX = Infinity;
		let minY = Infinity;
		for (let i = 0; i < theirs.cov.length; i += 3) {
			minX = Math.min(minX, theirs.cov[i]);
			minY = Math.min(minY, theirs.cov[i + 1]);
		}
		const cells = new Set<string>();
		for (let i = 0; i < theirs.cov.length; i += 3) cells.add(`${theirs.cov[i] - minX},${theirs.cov[i + 1] - minY}`);

		let shared = 0;
		for (const cell of cells) if (mine.cells.has(cell)) shared++;
		const union = cells.size + mine.cells.size - shared;
		const iou = union === 0 ? 0 : shared / union;
		iouSum += iou;
		compared++;
		if (iou === 1) exact++;
		worst.push({ char: String.fromCharCode(code), iou });
	}

	worst.sort((a, b) => a.iou - b.iou);
	const tail = worst
		.slice(0, 4)
		.map((w) => `${w.char}=${w.iou.toFixed(2)}`)
		.join(' ');
	const advances = advanceTotal === 0 ? 'n/a' : `${advanceHits}/${advanceTotal}`;
	const mean = compared === 0 ? 0 : iouSum / compared;
	console.log(`${name.padEnd(17)} ${String(font.height).padStart(5)} ${advances.padStart(9)} ${mean.toFixed(3).padStart(8)} ${String(exact).padStart(6)}  ${tail}`);
}
