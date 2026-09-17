/**
 * The abuse suite: everything between the frame buffer and the decoder.
 *
 * The optical channel's claims are all claims about legibility, and a claim about legibility that
 * has not been run through a downscale, a blur and a hand-held tilt is a hope. These are the
 * cheap approximations of the real enemies listed in MOBILE-CAMERA.yml — a phone camera, a
 * streaming encoder, a scaled window, a dim room.
 *
 * Lossy encoding is not here yet. Doing it honestly means a DCT and a quantisation table, and
 * standing in for it with blur plus noise would let us claim a pass we had not earned.
 */

import { createRaster, getPixel, setPixel, type Raster } from './raster';

/** Bilinear resample to a fraction of the size and back, which is what a scaled window does. */
export function roundTrip(src: Raster, factor: number): Raster {
	const small = resample(src, Math.max(8, Math.round(src.width * factor)), Math.max(8, Math.round(src.height * factor)));
	return resample(small, src.width, src.height);
}

export function resample(src: Raster, width: number, height: number): Raster {
	const out = createRaster(width, height);
	const sx = src.width / width;
	const sy = src.height / height;
	for (let y = 0; y < height; y++) {
		const fy = (y + 0.5) * sy - 0.5;
		const y0 = Math.floor(fy);
		const ty = fy - y0;
		for (let x = 0; x < width; x++) {
			const fx = (x + 0.5) * sx - 0.5;
			const x0 = Math.floor(fx);
			const tx = fx - x0;
			const c00 = getPixel(src, x0, y0);
			const c10 = getPixel(src, x0 + 1, y0);
			const c01 = getPixel(src, x0, y0 + 1);
			const c11 = getPixel(src, x0 + 1, y0 + 1);
			setPixel(out, x, y, [
				lerp2(c00[0], c10[0], c01[0], c11[0], tx, ty),
				lerp2(c00[1], c10[1], c01[1], c11[1], tx, ty),
				lerp2(c00[2], c10[2], c01[2], c11[2], tx, ty)
			]);
		}
	}
	return out;
}

function lerp2(a: number, b: number, c: number, d: number, tx: number, ty: number): number {
	return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
}

/** Separable box blur, repeated. Three passes approximate a gaussian closely enough. */
export function blur(src: Raster, radius: number, passes = 3): Raster {
	let out = src;
	for (let i = 0; i < passes; i++) out = boxBlur(out, radius);
	return out;
}

function boxBlur(src: Raster, radius: number): Raster {
	const mid = createRaster(src.width, src.height);
	const out = createRaster(src.width, src.height);
	const n = radius * 2 + 1;
	for (let y = 0; y < src.height; y++) {
		for (let x = 0; x < src.width; x++) {
			let r = 0;
			let g = 0;
			let b = 0;
			for (let k = -radius; k <= radius; k++) {
				const c = getPixel(src, x + k, y);
				r += c[0];
				g += c[1];
				b += c[2];
			}
			setPixel(mid, x, y, [r / n, g / n, b / n]);
		}
	}
	for (let y = 0; y < src.height; y++) {
		for (let x = 0; x < src.width; x++) {
			let r = 0;
			let g = 0;
			let b = 0;
			for (let k = -radius; k <= radius; k++) {
				const c = getPixel(mid, x, y + k);
				r += c[0];
				g += c[1];
				b += c[2];
			}
			setPixel(out, x, y, [r / n, g / n, b / n]);
		}
	}
	return out;
}

/** Sensor noise, seeded so a failure can be reproduced. */
export function noise(src: Raster, amplitude: number, seed = 7): Raster {
	const out = createRaster(src.width, src.height);
	let state = (seed | 0) || 1;
	const next = () => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return state / 0x7fffffff - 0.5;
	};
	for (let i = 0; i < src.data.length; i += 4) {
		const n = next() * amplitude * 2;
		out.data[i] = src.data[i] + n;
		out.data[i + 1] = src.data[i + 1] + n;
		out.data[i + 2] = src.data[i + 2] + n;
		out.data[i + 3] = 255;
	}
	return out;
}

/** A colour cast: a warm room lamp, a night filter, a monitor with its own opinions. */
export function tint(src: Raster, gain: readonly [number, number, number]): Raster {
	const out = createRaster(src.width, src.height);
	for (let i = 0; i < src.data.length; i += 4) {
		out.data[i] = src.data[i] * gain[0];
		out.data[i + 1] = src.data[i + 1] * gain[1];
		out.data[i + 2] = src.data[i + 2] * gain[2];
		out.data[i + 3] = 255;
	}
	return out;
}

export interface Quad {
	tl: readonly [number, number];
	tr: readonly [number, number];
	br: readonly [number, number];
	bl: readonly [number, number];
}

/**
 * Hand-held tilt: warp the frame onto a quad, sampling backwards so there are no holes.
 *
 * A phone pointed at a monitor is never square to it, and a code that only reads square is a code
 * that only reads in the fixture. Solving the homography rather than interpolating the quad matters
 * because the two differ exactly where this is interesting — the far edge, where the modules are
 * smallest and the reader gives up first.
 */
export function perspective(src: Raster, corners: Quad): Raster {
	const out = createRaster(src.width, src.height, [16, 16, 20]);
	const forward = homography(
		[
			[0, 0],
			[src.width - 1, 0],
			[src.width - 1, src.height - 1],
			[0, src.height - 1]
		],
		[corners.tl, corners.tr, corners.br, corners.bl]
	);
	const inverse = invert3(forward);
	for (let y = 0; y < out.height; y++) {
		for (let x = 0; x < out.width; x++) {
			const [sx, sy, sw] = apply3(inverse, x, y);
			if (sw === 0) continue;
			const u = sx / sw;
			const v = sy / sw;
			if (u < 0 || v < 0 || u > src.width - 1 || v > src.height - 1) continue;
			setPixel(out, x, y, sampleBilinear(src, u, v));
		}
	}
	return out;
}

function sampleBilinear(src: Raster, u: number, v: number): [number, number, number] {
	const x0 = Math.floor(u);
	const y0 = Math.floor(v);
	const tx = u - x0;
	const ty = v - y0;
	const c00 = getPixel(src, x0, y0);
	const c10 = getPixel(src, x0 + 1, y0);
	const c01 = getPixel(src, x0, y0 + 1);
	const c11 = getPixel(src, x0 + 1, y0 + 1);
	return [
		lerp2(c00[0], c10[0], c01[0], c11[0], tx, ty),
		lerp2(c00[1], c10[1], c01[1], c11[1], tx, ty),
		lerp2(c00[2], c10[2], c01[2], c11[2], tx, ty)
	];
}

type Matrix3 = readonly number[]; // row-major, 9 entries

/** The 3x3 that maps four source points onto four destination points. */
function homography(from: readonly (readonly [number, number])[], to: readonly (readonly [number, number])[]): Matrix3 {
	const a: number[][] = [];
	const b: number[] = [];
	for (let i = 0; i < 4; i++) {
		const [x, y] = from[i];
		const [u, v] = to[i];
		a.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
		b.push(u);
		a.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
		b.push(v);
	}
	const h = solve(a, b);
	return [...h, 1];
}

/** Gaussian elimination with partial pivoting. Eight unknowns; clarity beats cleverness. */
function solve(a: number[][], b: number[]): number[] {
	const n = b.length;
	const m = a.map((row, i) => [...row, b[i]]);
	for (let col = 0; col < n; col++) {
		let pivot = col;
		for (let row = col + 1; row < n; row++) {
			if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
		}
		[m[col], m[pivot]] = [m[pivot], m[col]];
		const d = m[col][col];
		if (Math.abs(d) < 1e-12) throw new Error('degenerate quad');
		for (let k = col; k <= n; k++) m[col][k] /= d;
		for (let row = 0; row < n; row++) {
			if (row === col) continue;
			const f = m[row][col];
			for (let k = col; k <= n; k++) m[row][k] -= f * m[col][k];
		}
	}
	return m.map((row) => row[n]);
}

function invert3(h: Matrix3): Matrix3 {
	const [a, b, c, d, e, f, g, i, j] = h;
	const A = e * j - f * i;
	const B = f * g - d * j;
	const C = d * i - e * g;
	const det = a * A + b * B + c * C;
	if (Math.abs(det) < 1e-12) throw new Error('singular homography');
	return [
		A / det,
		(c * i - b * j) / det,
		(b * f - c * e) / det,
		B / det,
		(a * j - c * g) / det,
		(c * d - a * f) / det,
		C / det,
		(b * g - a * i) / det,
		(a * e - b * d) / det
	];
}

function apply3(h: Matrix3, x: number, y: number): [number, number, number] {
	return [h[0] * x + h[1] * y + h[2], h[3] * x + h[4] * y + h[5], h[6] * x + h[7] * y + h[8]];
}
