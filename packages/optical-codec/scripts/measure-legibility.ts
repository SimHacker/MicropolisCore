/**
 * How many screen pixels does one QR module need?
 *
 * Everything else in the optical channel waits on this number. It decides how big the About dialog
 * has to draw its code, whether a phone can read it across a room, and whether a stream viewer can
 * read it at all. Measure it rather than guess it: sweep the module scale against each degradation
 * and print the grid.
 *
 *   pnpm --filter @micropolis/optical-codec tsx scripts/measure-legibility.ts
 */

import { useLocalZXingWasm } from '../src/node/wasm';
import { blur, noise, perspective, roundTrip, tint } from '../src/degrade';
import { renderScene } from '../src/scene';
import { scanFrame } from '../src/scan';
import type { Raster } from '../src/raster';

useLocalZXingWasm();

const PAYLOAD = 'https://micropolis.example/egg/7c2f9a';
const SCALES = [1, 2, 3, 4, 5, 6];

const conditions: { name: string; apply: (r: Raster) => Raster }[] = [
	{ name: 'clean screen grab', apply: (r) => r },
	{ name: 'window at 50%', apply: (r) => roundTrip(r, 0.5) },
	{ name: 'window at 33%', apply: (r) => roundTrip(r, 0.34) },
	{ name: 'soft focus', apply: (r) => blur(r, 1) },
	{ name: 'phone: noise + warm cast', apply: (r) => noise(tint(r, [1.1, 1, 0.82]), 18) },
	{
		name: 'phone: tilted',
		apply: (r) =>
			perspective(r, {
				tl: [40, 20],
				tr: [r.width - 12, 62],
				br: [r.width - 46, r.height - 26],
				bl: [16, r.height - 58]
			})
	},
	{
		name: 'phone: tilted, blurred, noisy',
		apply: (r) =>
			noise(
				blur(
					perspective(r, {
						tl: [30, 24],
						tr: [r.width - 20, 54],
						br: [r.width - 40, r.height - 30],
						bl: [12, r.height - 48]
					}),
					1
				),
				14
			)
	}
];

const rows: string[] = [];
for (const condition of conditions) {
	const cells: string[] = [];
	for (const scale of SCALES) {
		const scene = await renderScene({ qr: [{ text: PAYLOAD, x: 0.42, y: 0.32, scale, panel: true }] });
		const result = await scanFrame(condition.apply(scene.raster));
		const ok = result.qr.some((q) => q.text === PAYLOAD);
		cells.push(ok ? ' read ' : '  --  ');
	}
	rows.push(`${condition.name.padEnd(30)}${cells.join('')}`);
}

console.log(`payload: ${PAYLOAD} (${PAYLOAD.length} bytes, ecLevel M)`);
console.log(`${'pixels per module'.padEnd(30)}${SCALES.map((s) => `${String(s).padStart(4)}  `).join('')}`);
console.log(rows.join('\n'));
