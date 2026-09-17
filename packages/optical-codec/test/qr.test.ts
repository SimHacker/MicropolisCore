/**
 * The QR pass, against frames we generated and therefore know the answer to.
 *
 * The interesting assertions are the ones about degradation. That a clean 3x code reads is table
 * stakes; whether it survives a half-scale round trip, a blur and a tilt is what decides how big
 * the About dialog's code has to be drawn.
 */

import { beforeAll, describe, expect, it } from 'vitest';

import { useLocalZXingWasm } from '../src/node/wasm';
import { renderQRCode } from '../src/qr';
import { renderScene } from '../src/scene';
import { scanFrame } from '../src/scan';
import { blur, noise, perspective, roundTrip, tint } from '../src/degrade';

const PAYLOAD = 'https://micropolis.example/egg/7c2f9a';

beforeAll(() => {
	useLocalZXingWasm();
});

describe('a code on its own', () => {
	it('reads back what was written', async () => {
		const code = await renderQRCode(PAYLOAD, 4);
		const result = await scanFrame(code);
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});

	it('reports where it is', async () => {
		const code = await renderQRCode(PAYLOAD, 4);
		const [found] = (await scanFrame(code)).qr;
		// The quiet zone is 4 modules at scale 4, so the symbol starts 16px in and the reported
		// box should sit inside the raster with room to spare on every side.
		expect(found.box.x).toBeGreaterThan(8);
		expect(found.box.y).toBeGreaterThan(8);
		expect(found.box.x + found.box.width).toBeLessThan(code.width - 8);
	});
});

describe('a code in a game frame', () => {
	it('reads out of an About dialog', async () => {
		const scene = await renderScene({
			qr: [{ text: PAYLOAD, x: 0.55, y: 0.35, scale: 3, panel: true }],
			eggs: [{ code: { kind: 1, version: 0, id: 7, value: 42 }, x: 0.3, y: 0.7 }]
		});
		const result = await scanFrame(scene.raster);
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});

	it('finds several at once', async () => {
		const texts = ['egg:1', 'egg:2', 'egg:3'];
		const scene = await renderScene({
			width: 900,
			qr: texts.map((text, i) => ({ text, x: 0.08 + i * 0.3, y: 0.45, scale: 3, panel: true }))
		});
		const result = await scanFrame(scene.raster);
		expect(result.qr.map((q) => q.text).sort()).toEqual(texts);
	});

	it('is not fooled by furniture', async () => {
		const scene = await renderScene({ seed: 12, eggs: [{ code: { kind: 2, version: 0, id: 3, value: 9 }, x: 0.4, y: 0.7 }] });
		const result = await scanFrame(scene.raster);
		expect(result.qr).toEqual([]);
	});
});

describe('what it survives', () => {
	async function frame(scale: number) {
		const scene = await renderScene({ qr: [{ text: PAYLOAD, x: 0.5, y: 0.3, scale, panel: true }] });
		return scene.raster;
	}

	it('survives a half-scale round trip at 4x modules', async () => {
		const result = await scanFrame(roundTrip(await frame(4), 0.5));
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});

	it('survives a mild blur', async () => {
		const result = await scanFrame(blur(await frame(4), 1));
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});

	it('survives sensor noise and a warm cast', async () => {
		const dirty = noise(tint(await frame(4), [1.1, 1, 0.82]), 18);
		const result = await scanFrame(dirty);
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});

	it('survives a hand-held tilt', async () => {
		const src = await frame(5);
		const tilted = perspective(src, {
			tl: [40, 20],
			tr: [src.width - 12, 62],
			br: [src.width - 46, src.height - 26],
			bl: [16, src.height - 58]
		});
		const result = await scanFrame(tilted);
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});

	it('reads a code the frame has shrunk under it', async () => {
		// The library's own reduced-scale attempts cover this; the test is here to notice if a
		// version bump ever turns them off.
		const result = await scanFrame(roundTrip(await frame(5), 0.4));
		expect(result.qr.map((q) => q.text)).toEqual([PAYLOAD]);
	});
});
