/**
 * Turn the Simplifier's font atlas into something a TypeScript matcher can use.
 *
 *   pnpm --filter @screen-angel/soul-bridge-sims1 font
 *
 * Reads assets/simplifier-font.bmp with the metrics beside it and writes two things: a compiled
 * pattern file the recogniser loads, and a PNG of the atlas so a human can look at what the machine
 * is matching against. The BMP stays in the tree as the original — it is the artifact, and a
 * compiled file that nobody can regenerate is a binary blob with extra steps.
 *
 * "Compiled" means the same thing it meant in 2004: for each glyph, the list of pixels that have
 * ink, with the colour each one should be. Black is background and is dropped, which is what makes
 * matching cheap — a glyph is a handful of coordinates rather than a rectangle of mostly nothing.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRaster, setPixel, toPNG, type Raster } from '@micropolis/optical-codec';

import { DEFAULT_FUZZ, FIRST_CODE, FONT_DESCENT, FONT_HEIGHT, FONT_W, FONT_X, FONT_Y, LAST_CODE } from './simplifier-metrics';

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', 'assets');

const atlas = readBMP(join(assets, 'simplifier-font.bmp'));

const glyphs: { char: string; code: number; width: number; ink: number[] }[] = [];
let dropped: number[] = [];

for (let code = FIRST_CODE; code <= LAST_CODE; code++) {
	const width = FONT_W[code];
	if (width === 0) {
		dropped.push(code);
		continue;
	}
	const x0 = FONT_X[code];
	const y0 = FONT_Y[code];
	const ink: number[] = [];
	for (let y = 0; y < FONT_HEIGHT; y++) {
		for (let x = 0; x < width; x++) {
			const [r, g, b] = pixel(atlas, x0 + x, y0 + y);
			if (r === 0 && g === 0 && b === 0) continue;
			ink.push(x, y, r, g, b);
		}
	}
	glyphs.push({ char: String.fromCharCode(code), code, width, ink });
}

const font = {
	name: 'sims1-ui',
	source: {
		what: 'The Sims 1 interface font, sampled from the game and hand-measured',
		from: "Don Hopkins' Simplifier, 2004 — SimsKit/Simplifier (res/Font.bmp, gFontX/gFontY/gFontW)",
		atlas: 'simplifier-font.bmp',
		generatedBy: 'tools/compile-font.ts'
	},
	height: FONT_HEIGHT,
	descent: FONT_DESCENT,
	defaultFuzz: DEFAULT_FUZZ,
	glyphs
};

mkdirSync(assets, { recursive: true });
writeFileSync(join(assets, 'ui-font.json'), `${JSON.stringify(font, null, '\t')}\n`);
writeFileSync(join(assets, 'simplifier-font.png'), toPNG(atlas, (data) => deflateSync(data)));

const inkTotal = glyphs.reduce((n, g) => n + g.ink.length / 5, 0);
console.log(`atlas ${atlas.width}x${atlas.height}`);
console.log(`${glyphs.length} glyphs, ${inkTotal} ink pixels, ${(inkTotal / glyphs.length).toFixed(1)} per glyph`);
if (dropped.length > 0) {
	console.log(`no metrics, skipped: ${dropped.map((c) => String.fromCharCode(c)).join('')}`);
}
console.log(`wrote assets/ui-font.json and assets/simplifier-font.png`);

function pixel(r: Raster, x: number, y: number): [number, number, number] {
	const i = (y * r.width + x) * 4;
	return [r.data[i], r.data[i + 1], r.data[i + 2]];
}

/**
 * Enough of BMP to read this one file: 24 or 32 bits per pixel, uncompressed, bottom-up.
 *
 * Rows are stored last-first, which is why this flips them. The 2004 code never had to care —
 * Windows handed it a device-independent bitmap and GetPixel used top-down coordinates — so the
 * metrics are all in top-down space and reading the file the way it is stored would put every
 * glyph in the wrong row.
 */
function readBMP(path: string): Raster {
	const bytes = readFileSync(path);
	if (bytes[0] !== 0x42 || bytes[1] !== 0x4d) throw new Error(`${path} is not a BMP`);
	const dataOffset = bytes.readUInt32LE(10);
	const width = bytes.readInt32LE(18);
	const height = bytes.readInt32LE(22);
	const bpp = bytes.readUInt16LE(28);
	const compression = bytes.readUInt32LE(30);
	if (compression !== 0) throw new Error(`compressed BMP (${compression}) is not supported`);
	if (bpp !== 24 && bpp !== 32) throw new Error(`${bpp} bits per pixel is not supported`);

	const bytesPerPixel = bpp / 8;
	const rowBytes = Math.ceil((width * bytesPerPixel) / 4) * 4;
	const out = createRaster(Math.abs(width), Math.abs(height));
	const bottomUp = height > 0;
	const rows = Math.abs(height);

	for (let row = 0; row < rows; row++) {
		const src = dataOffset + (bottomUp ? rows - 1 - row : row) * rowBytes;
		for (let x = 0; x < width; x++) {
			const p = src + x * bytesPerPixel;
			setPixel(out, x, row, [bytes[p + 2], bytes[p + 1], bytes[p]]);
		}
	}
	return out;
}
