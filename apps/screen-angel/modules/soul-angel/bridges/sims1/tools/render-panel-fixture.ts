/**
 * Draw the panel we claim to read, and read it back.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 fixture
 *
 * Not a screenshot of The Sims. The font came out of the game, so this is the game's text drawn with
 * the game's own pixels on a stand-in panel — which is enough to exercise every stage of the reader
 * and to see with your own eyes what it is matching.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRaster, drawText, fillRect, setPixel, toPNG } from '@micropolis/optical-codec';

import { sims1UIFont } from '../src/text/font';
import { readPanelText } from '../src/text/panel';

const font = sims1UIFont();
const frame = createRaster(800, 600, [18, 22, 34]);

// A floor to sit the panel on, so the fixture looks like a frame rather than a swatch.
for (let y = 0; y < 420; y += 16) {
	for (let x = 0; x < 800; x += 32) {
		fillRect(frame, x + ((y / 16) % 2) * 16, y, 16, 16, (x / 32 + y / 16) % 2 ? [72, 86, 66] : [84, 98, 74]);
	}
}

const topY = 396;
fillRect(frame, 241, topY, 559, 500 - topY, [24, 26, 48]);
fillRect(frame, 241, topY, 559, 2, [58, 62, 108]);
fillRect(frame, 400, topY + 8, 2, 490 - topY, [58, 62, 108]);
setPixel(frame, 241, 499, [0, 0, 57]);
setPixel(frame, 799, 499, [0, 0, 41]);
setPixel(frame, 241, topY, [148, 150, 206]);
setPixel(frame, 799, topY, [0, 4, 66]);

const lines = [
	'Werkbunnst Wall Clock',
	'Simoleons: $250',
	'Room 3, sound every hour.',
	'The Sims never look at it.'
];
lines.forEach((line, i) => drawText(frame, font, line, 419, topY + 31 + i * font.height));

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'panel.png'), toPNG(frame));

const read = readPanelText(frame, font);
console.log(`panel: ${JSON.stringify(read?.region)}`);
console.log(`ink match: ${((read?.confidence ?? 0) * 100).toFixed(1)}%`);
console.log(`read back:\n${read?.description}`);
console.log(`\nwrote fixtures/panel.png`);
