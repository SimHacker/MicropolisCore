/**
 * Stroke-font polylines for skywriting (grid units; scaled when building paths).
 * Each letter is an array of [x,y] points in 0..5 x 0..7 cell space.
 */

type Point = [number, number];
type LetterStrokes = Point[][];

const STROKES: Record<string, LetterStrokes> = {
	A: [
		[[1, 7], [3, 0], [5, 7]],
		[[1.5, 4], [4.5, 4]],
	],
	B: [
		[[0, 0], [0, 7], [3, 7], [4, 6], [4, 4], [3, 3], [0, 3]],
		[[3, 3], [4, 2], [4, 0], [3, 0], [0, 0]],
	],
	C: [[[4, 1], [2, 0], [1, 2], [1, 5], [2, 7], [4, 6]]],
	D: [[[0, 0], [0, 7], [3, 7], [4, 5], [4, 2], [3, 0], [0, 0]]],
	E: [
		[[4, 0], [0, 0], [0, 7], [4, 7]],
		[[0, 3.5], [3, 3.5]],
	],
	G: [
		[[4, 1], [2, 0], [1, 2], [1, 5], [2, 7], [4, 7], [4, 4], [2.5, 4]],
	],
	H: [
		[[0, 0], [0, 7]],
		[[4, 0], [4, 7]],
		[[0, 3.5], [4, 3.5]],
	],
	I: [[[2, 0], [2, 7]]],
	L: [[[0, 0], [0, 7], [4, 7]]],
	O: [[[1, 0], [4, 0], [4, 7], [1, 7], [1, 0]]],
	P: [
		[[0, 7], [0, 0], [3, 0], [4, 1], [4, 3], [3, 4], [0, 4]],
	],
	R: [
		[[0, 7], [0, 0], [3, 0], [4, 1], [4, 3], [3, 4], [0, 4]],
		[[3, 4], [4, 7]],
	],
	S: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 3], [1, 4], [3, 4], [4, 5], [4, 7], [3, 7], [1, 7], [0, 6]]],
	T: [
		[[0, 0], [4, 0]],
		[[2, 0], [2, 7]],
	],
	U: [[[0, 0], [0, 6], [1, 7], [3, 7], [4, 6], [4, 0]]],
	V: [[[0, 0], [2, 7], [4, 0]]],
	W: [[[0, 0], [1, 7], [2.5, 3], [4, 7], [5, 0]]],
	Y: [
		[[0, 0], [2, 3.5], [4, 0]],
		[[2, 3.5], [2, 7]],
	],
	Z: [[[0, 0], [4, 0], [0, 7], [4, 7]]],
	'0': [[[1, 0], [4, 0], [4, 7], [1, 7], [1, 0]]],
	'1': [[[2, 0], [2, 7]]],
	'2': [[[0, 1], [1, 0], [3, 0], [4, 2], [0, 7], [4, 7]]],
	'!': [[[2, 0], [2, 5]], [[2, 6.5], [2, 7]]],
	' ': [],
};

const LETTER_CELL_W = 6;
const LETTER_CELL_H = 8;
const LETTER_GAP = 2;

export function buildSkywritingPath(
	text: string,
	originX: number,
	originY: number,
	pixelScale: number,
): Array<{ x: number; y: number }> {
	const path: Array<{ x: number; y: number }> = [];
	let cursorX = originX;
	const upper = text.toUpperCase();

	for (const ch of upper) {
		const strokes = STROKES[ch] ?? STROKES[' '];
		for (const stroke of strokes) {
			for (const [gx, gy] of stroke) {
				path.push({
					x: cursorX + gx * pixelScale,
					y: originY + gy * pixelScale,
				});
			}
			// pen lift — duplicate last point with NaN marker skipped by interpolator
			if (path.length > 0) {
				const last = path[path.length - 1];
				path.push({ x: last.x, y: last.y });
			}
		}
		cursorX += (LETTER_CELL_W + LETTER_GAP) * pixelScale;
	}
	return path;
}

export function interpolatePath(
	points: Array<{ x: number; y: number }>,
	stepPx: number,
): Array<{ x: number; y: number; heading: number }> {
	const dense: Array<{ x: number; y: number; heading: number }> = [];
	for (let i = 0; i < points.length - 1; i++) {
		const a = points[i];
		const b = points[i + 1];
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy);
		if (len < 0.5) continue;
		const heading = Math.atan2(dy, dx);
		const steps = Math.max(1, Math.ceil(len / stepPx));
		for (let s = 0; s < steps; s++) {
			const t = s / steps;
			dense.push({
				x: a.x + dx * t,
				y: a.y + dy * t,
				heading,
			});
		}
	}
	if (points.length > 0) {
		const last = points[points.length - 1];
		const prev = dense[dense.length - 1];
		dense.push({
			x: last.x,
			y: last.y,
			heading: prev?.heading ?? 0,
		});
	}
	return dense;
}
