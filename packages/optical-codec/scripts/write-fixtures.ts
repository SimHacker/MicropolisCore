/**
 * Write the synthetic frames to disk so they can be looked at.
 *
 * A test that fails with "expected 1 to be 0" is not much help when the subject is an image. These
 * are the same frames the tests use, saved as PNGs, so a disagreement about whether something is
 * legible can be settled by opening it.
 *
 *   pnpm --filter @micropolis/optical-codec fixtures
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { useLocalZXingWasm } from '../src/node/wasm';
import { blur, noise, perspective, roundTrip, tint } from '../src/degrade';
import { toPNG } from '../src/raster';
import { renderScene } from '../src/scene';
import { scanFrame } from '../src/scan';

useLocalZXingWasm();

const OUT = join(process.cwd(), 'fixtures');
mkdirSync(OUT, { recursive: true });

const PAYLOAD = 'https://micropolis.example/egg/7c2f9a';

const base = await renderScene({
	seed: 3,
	qr: [{ text: PAYLOAD, x: 0.56, y: 0.3, scale: 4, panel: true }],
	eggs: [
		{ code: { kind: 1, version: 0, id: 7, value: 42 }, x: 0.16, y: 0.72, style: { zoom: 'full', lit: 'steady' } },
		{ code: { kind: 1, version: 0, id: 8, value: 3 }, x: 0.26, y: 0.72, style: { zoom: 'full', lit: 'breathing', levitation: 12 } },
		{ code: { kind: 4, version: 0, id: 9, value: 77 }, x: 0.36, y: 0.72, style: { zoom: 'near', lit: 'dark', segments: 3 } },
		{ code: { kind: 4, version: 0, id: 9, value: 77 }, x: 0.44, y: 0.72, style: { zoom: 'far', bandHeight: 3, radius: 5 } }
	]
});

const variants: [string, Awaited<ReturnType<typeof renderScene>>['raster']][] = [
	['00-clean', base.raster],
	['01-window-half', roundTrip(base.raster, 0.5)],
	['02-soft-focus', blur(base.raster, 1)],
	['03-phone-noise', noise(tint(base.raster, [1.1, 1, 0.82]), 18)],
	[
		'04-phone-tilted',
		perspective(base.raster, {
			tl: [40, 20],
			tr: [base.raster.width - 12, 62],
			br: [base.raster.width - 46, base.raster.height - 26],
			bl: [16, base.raster.height - 58]
		})
	],
	['05-night', (await renderScene({ seed: 3, ambient: 0.45, qr: [{ text: PAYLOAD, x: 0.56, y: 0.3, scale: 4, panel: true }] })).raster]
];

for (const [name, raster] of variants) {
	writeFileSync(join(OUT, `${name}.png`), toPNG(raster));
	const result = await scanFrame(raster);
	const read = result.qr.map((q) => q.text).join(', ') || 'nothing';
	console.log(`${name.padEnd(18)} ${raster.width}x${raster.height}  read: ${read}`);
}

console.log(`\nground truth for ${'00-clean'}:`);
for (const egg of base.eggs) {
	console.log(`  egg ${JSON.stringify(egg.code)} digits ${egg.digits.join('')} at ${JSON.stringify(egg.box)}`);
}
for (const q of base.qr) console.log(`  qr ${q.text} at ${JSON.stringify(q.box)}`);
console.log(`\nwritten to ${OUT}`);
