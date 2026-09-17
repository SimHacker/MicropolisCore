/**
 * Which size did the 2004 capture come from?
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 identify
 *
 * The Simplifier measured one font by hand off a screenshot and never recorded which size the game
 * had drawn. This answers it from the pack alone, by comparing the captured face against every game
 * face it holds. Two independent measures, because either one alone is easy to fool:
 *
 *   shape      Intersection-over-union of the ink, per character, after thresholding coverage. A
 *              screenshot has anti-aliasing at the edges that a 2004 hand-measurement kept as
 *              colour; thresholding puts both back on the same footing.
 *
 *   advance    How often the captured width equals the game's advance, and how often it equals the
 *              game's thresholded INK width. The distinction is the finding: the 2004 tables are ink
 *              extents, not advances, which is why that face has to be used with its own widths.
 *
 * Kept as a tool rather than folded into a test because it is an investigation, and its output is
 * meant to be read: a test would only tell you it still passes.
 */

import { readFontPack } from '@micropolis/optical-codec/node/pack';
import type { CoverageFont } from '@micropolis/optical-codec';

import { CAPTURED_FACE, FONT_PACK_PATH } from '../src/text/font';

/** Coverage at or above this counts as ink. Below it is the anti-aliased fringe. */
const INK = 6;

const pack = readFontPack(FONT_PACK_PATH);
const captured = pack.faces.find((f) => f.name === CAPTURED_FACE);
if (captured === undefined) {
	console.error(`the pack has no ${CAPTURED_FACE} face`);
	process.exit(1);
}

/** The set of inked cells of a glyph, normalised to its own top-left, plus its extents. */
function shape(face: CoverageFont, code: number): { cells: Set<string>; w: number; h: number } | null {
	const glyph = face.glyphs.find((g) => g.code === code);
	if (glyph === undefined || glyph.cov.length === 0) return null;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	const on: [number, number][] = [];
	for (let i = 0; i < glyph.cov.length; i += 3) {
		if (glyph.cov[i + 2] < INK) continue;
		const x = glyph.cov[i];
		const y = glyph.cov[i + 1];
		on.push([x, y]);
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}
	if (on.length === 0) return null;

	const cells = new Set<string>();
	for (const [x, y] of on) cells.add(`${x - minX},${y - minY}`);
	return { cells, w: maxX - minX + 1, h: maxY - minY + 1 };
}

console.log(`${CAPTURED_FACE}: ${captured.glyphs.filter((g) => g.cov.length > 0).length} glyphs, line height ${captured.height}\n`);
console.log('face             IoU    same-ink-width  same-advance  compared');

const results: { name: string; iou: number }[] = [];

for (const face of pack.faces) {
	if (face.name === CAPTURED_FACE) continue;

	let sum = 0;
	let compared = 0;
	let sameInk = 0;
	let sameAdvance = 0;

	for (let code = 33; code <= 126; code++) {
		const mine = shape(captured, code);
		const theirs = shape(face, code);
		if (mine === null || theirs === null) continue;

		let shared = 0;
		for (const cell of mine.cells) if (theirs.cells.has(cell)) shared++;
		sum += shared / (mine.cells.size + theirs.cells.size - shared);
		compared++;

		const capturedWidth = captured.glyphs.find((g) => g.code === code)?.width ?? 0;
		if (capturedWidth === theirs.w) sameInk++;
		if (capturedWidth === (face.glyphs.find((g) => g.code === code)?.width ?? -1)) sameAdvance++;
	}

	const iou = compared === 0 ? 0 : sum / compared;
	results.push({ name: face.name, iou });
	console.log(
		`${face.name.padEnd(16)} ${iou.toFixed(3)}  ${String(sameInk).padStart(9)}/${compared}  ` +
			`${String(sameAdvance).padStart(9)}/${compared}  ${compared}`
	);
}

results.sort((a, b) => b.iou - a.iou);
const [best, runnerUp] = results;
console.log(
	`\n${CAPTURED_FACE} is ${best.name} at ${best.iou.toFixed(3)} mean IoU` +
		(runnerUp ? `; next closest is ${runnerUp.name} at ${runnerUp.iou.toFixed(3)}` : '')
);
console.log(`Line height: captured ${captured.height}, ${best.name} ${pack.faces.find((f) => f.name === best.name)?.height}`);
