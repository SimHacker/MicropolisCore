/**
 * A screenshot of a game that does not exist yet.
 *
 * The eggs are not in The Sims, so there is nothing to screenshot. Rather than wait, draw the
 * frame the game would produce: a tiled isometric floor, some furniture-coloured blocks, a couple
 * of sim-shaped blobs, and the codes sitting in it at the sizes and positions they would really
 * occupy. Then the reader has targets today, and the fixtures stay useful afterwards as the
 * controlled half of the test set — a real capture tells you whether it works, a synthetic frame
 * tells you which pixel broke it.
 *
 * Everything here returns ground truth alongside the pixels. A frame with no answer key is a
 * demo, not a test.
 */

import { drawEgg, type DrawnEgg, type EggStyle } from './egg-render';
import type { EggCode } from './egg-code';
import { blit, createRaster, fillEllipse, fillRect, type RGB, type Raster } from './raster';
import { renderQRCode } from './qr';

export interface SceneEggSpec {
	code: EggCode;
	/** Fraction of the frame width, so a spec survives a change of resolution. */
	x: number;
	/** Fraction of the frame height, the floor line the egg stands on. */
	y: number;
	style?: Partial<EggStyle>;
}

export interface SceneQRSpec {
	text: string;
	/** Top-left, as fractions of the frame. */
	x: number;
	y: number;
	/** Pixels per QR module. */
	scale?: number;
	/** Draw a dialog frame around it, the way the About panel would. */
	panel?: boolean;
}

export interface SceneSpec {
	width?: number;
	height?: number;
	seed?: number;
	eggs?: SceneEggSpec[];
	qr?: SceneQRSpec[];
	/** Uniform multiplier on the whole frame, standing in for a dim room or night. */
	ambient?: number;
}

export interface Scene {
	raster: Raster;
	eggs: DrawnEgg[];
	qr: { text: string; box: { x: number; y: number; width: number; height: number } }[];
}

const FLOOR_A: RGB = [96, 108, 88];
const FLOOR_B: RGB = [108, 120, 96];
const WALL: RGB = [186, 170, 148];

export async function renderScene(spec: SceneSpec = {}): Promise<Scene> {
	const width = spec.width ?? 800;
	const height = spec.height ?? 600;
	const raster = createRaster(width, height, [24, 26, 32]);
	const random = makeRandom(spec.seed ?? 1);

	drawFloor(raster, width, height);
	drawWalls(raster, width, height);
	drawClutter(raster, width, height, random);
	drawSims(raster, width, height, random);

	const eggs = (spec.eggs ?? []).map((e) =>
		drawEgg(raster, e.code, { x: e.x * width, y: e.y * height }, e.style)
	);

	const qr: Scene['qr'] = [];
	for (const q of spec.qr ?? []) {
		const code = await renderQRCode(q.text, q.scale ?? 3);
		const x = Math.round(q.x * width);
		const y = Math.round(q.y * height);
		if (q.panel) drawPanel(raster, x - 10, y - 24, code.width + 20, code.height + 34);
		blit(raster, code, x, y);
		qr.push({ text: q.text, box: { x, y, width: code.width, height: code.height } });
	}

	if (spec.ambient !== undefined && spec.ambient !== 1) applyAmbient(raster, spec.ambient);

	return { raster, eggs, qr };
}

/** Diamond tiles, roughly the pitch The Sims draws at 1x zoom. */
function drawFloor(r: Raster, width: number, height: number): void {
	const tile = 32;
	fillRect(r, 0, height * 0.25, width, height * 0.75, FLOOR_A);
	for (let y = Math.floor(height * 0.25); y < height; y += tile / 2) {
		for (let x = -tile; x < width + tile; x += tile) {
			const offset = ((y / (tile / 2)) % 2) * (tile / 2);
			drawDiamond(r, x + offset, y, tile, tile / 2, (x / tile + y / tile) % 2 < 1 ? FLOOR_A : FLOOR_B);
		}
	}
}

function drawDiamond(r: Raster, cx: number, cy: number, w: number, h: number, colour: RGB): void {
	for (let dy = -h / 2; dy <= h / 2; dy++) {
		const span = (w / 2) * (1 - Math.abs(dy) / (h / 2));
		fillRect(r, cx - span, cy + dy, span * 2, 1, colour);
	}
}

function drawWalls(r: Raster, width: number, height: number): void {
	fillRect(r, 0, 0, width, height * 0.25, WALL);
	fillRect(r, 0, height * 0.25 - 4, width, 4, [140, 126, 108]);
	// A window, because a bright rectangle next to a code is exactly the kind of thing that
	// tempts a detector into a false positive.
	fillRect(r, width * 0.12, height * 0.06, width * 0.14, height * 0.12, [210, 226, 240]);
	fillRect(r, width * 0.62, height * 0.05, width * 0.2, height * 0.14, [198, 214, 232]);
}

function drawClutter(r: Raster, width: number, height: number, random: () => number): void {
	const palette: RGB[] = [
		[150, 80, 60],
		[70, 90, 130],
		[120, 130, 70],
		[160, 150, 120]
	];
	for (let i = 0; i < 9; i++) {
		const w = 28 + random() * 70;
		const h = 18 + random() * 46;
		const x = random() * (width - w);
		const y = height * 0.3 + random() * (height * 0.6);
		const colour = palette[Math.floor(random() * palette.length)];
		fillRect(r, x, y, w, h, colour);
		fillRect(r, x, y, w, 3, [colour[0] * 1.2, colour[1] * 1.2, colour[2] * 1.2]);
	}
}

function drawSims(r: Raster, width: number, height: number, random: () => number): void {
	for (let i = 0; i < 2; i++) {
		const x = width * (0.25 + 0.4 * random());
		const y = height * (0.55 + 0.3 * random());
		fillEllipse(r, x, y - 26, 7, 9, [232, 196, 160]); // head
		fillRect(r, x - 8, y - 18, 16, 22, [80, 120, 170]); // body
		fillEllipse(r, x, y + 6, 11, 4, [30, 30, 36]); // shadow
		fillEllipse(r, x, y - 40, 8, 5, [90, 220, 120]); // plumbob, such as it is
	}
}

/** The About dialog, in the only detail the reader cares about: a light box around the code. */
function drawPanel(r: Raster, x: number, y: number, w: number, h: number): void {
	fillRect(r, x, y, w, h, [232, 228, 216]);
	fillRect(r, x, y, w, 18, [96, 110, 150]);
	fillRect(r, x + 2, y + 20, w - 4, 2, [180, 176, 164]);
}

function applyAmbient(r: Raster, factor: number): void {
	for (let i = 0; i < r.data.length; i += 4) {
		r.data[i] = r.data[i] * factor;
		r.data[i + 1] = r.data[i + 1] * factor;
		r.data[i + 2] = r.data[i + 2] * factor;
	}
}

/** Deterministic PRNG, because a fixture that differs between runs cannot fail usefully. */
function makeRandom(seed: number): () => number {
	let state = (seed | 0) || 1;
	return () => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return state / 0x7fffffff;
	};
}
