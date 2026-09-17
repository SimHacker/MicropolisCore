/**
 * BMP reader, including the run-length form that 1990s games shipped.
 *
 * Written because The Sims stores its fonts and most of its interface art as 8-bit BI_RLE8 bitmaps,
 * which every modern decoder either refuses or silently mangles, and because a font atlas has to be
 * read exactly: one pixel of drift and every glyph pattern is wrong in a way that looks like a
 * recogniser bug rather than a decoder bug.
 *
 * Returns the palette indices alongside the resolved colours. For art the colours are what you
 * want; for a font atlas the index IS the value — those bitmaps carry coverage, not colour, and
 * flattening them through a greyscale palette throws away the fact that they only use 16 levels.
 */

import { createRaster, setPixel, type Raster } from '../raster';

export interface DecodedBMP {
	width: number;
	height: number;
	/** Bits per pixel as stored. */
	depth: number;
	/** Palette index per pixel, row-major, top row first. Empty for depths above 8. */
	indices: Uint8Array;
	/** Palette as RGB triples, or empty for depths above 8. */
	palette: Uint8Array;
	raster: Raster;
}

const BI_RGB = 0;
const BI_RLE8 = 1;

export function decodeBMP(bytes: Uint8Array): DecodedBMP {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (bytes[0] !== 0x42 || bytes[1] !== 0x4d) throw new Error('not a BMP: bad signature');

	const pixelOffset = view.getUint32(10, true);
	const headerSize = view.getUint32(14, true);
	const width = view.getInt32(18, true);
	const rawHeight = view.getInt32(22, true);
	const depth = view.getUint16(28, true);
	const compression = view.getUint32(30, true);
	const height = Math.abs(rawHeight);
	const bottomUp = rawHeight > 0;

	if (compression !== BI_RGB && compression !== BI_RLE8) {
		throw new Error(`unsupported BMP compression ${compression}`);
	}

	const paletteEntries = depth <= 8 ? Math.max(1 << depth, 0) : 0;
	const palette = new Uint8Array(paletteEntries * 3);
	for (let i = 0; i < paletteEntries; i++) {
		const at = 14 + headerSize + i * 4;
		palette[i * 3] = bytes[at + 2];
		palette[i * 3 + 1] = bytes[at + 1];
		palette[i * 3 + 2] = bytes[at];
	}

	const indices = depth <= 8 ? new Uint8Array(width * height) : new Uint8Array(0);
	const raster = createRaster(width, height);

	if (compression === BI_RLE8) {
		decodeRLE8(bytes, pixelOffset, width, height, indices);
	} else if (depth === 8) {
		const stride = ((width + 3) >> 2) << 2;
		for (let y = 0; y < height; y++) {
			const row = bottomUp ? height - 1 - y : y;
			for (let x = 0; x < width; x++) indices[row * width + x] = bytes[pixelOffset + y * stride + x];
		}
	} else if (depth === 24 || depth === 32) {
		const bpp = depth >> 3;
		const stride = ((width * bpp + 3) >> 2) << 2;
		for (let y = 0; y < height; y++) {
			const row = bottomUp ? height - 1 - y : y;
			for (let x = 0; x < width; x++) {
				const at = pixelOffset + y * stride + x * bpp;
				setPixel(raster, x, row, [bytes[at + 2], bytes[at + 1], bytes[at]]);
			}
		}
	} else {
		throw new Error(`unsupported BMP depth ${depth}`);
	}

	if (depth <= 8) {
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = indices[y * width + x] * 3;
				setPixel(raster, x, y, [palette[i], palette[i + 1], palette[i + 2]]);
			}
		}
	}

	return { width, height, depth, indices, palette, raster };
}

/**
 * Run-length decode, writing rows in the order the encoder emitted them.
 *
 * The header on the game's font atlases says bottom-up, and the run data is top-down anyway. This
 * is not a quirk worth arguing with: the encoder that wrote them and the loader that reads them in
 * the shipped game agree with each other, and the glyph rectangles in the metric file only line up
 * with the rows in emitted order. Verified by checking that every rectangle lands on ink — flipping
 * strands about half of it outside the rectangles.
 */
function decodeRLE8(bytes: Uint8Array, offset: number, width: number, height: number, out: Uint8Array): void {
	let at = offset;
	let x = 0;
	let y = 0;

	while (at + 1 < bytes.length && y < height) {
		const count = bytes[at];
		const value = bytes[at + 1];
		at += 2;

		if (count > 0) {
			for (let i = 0; i < count; i++, x++) {
				if (x < width) out[y * width + x] = value;
			}
			continue;
		}

		if (value === 0) {
			x = 0;
			y++;
		} else if (value === 1) {
			break;
		} else if (value === 2) {
			x += bytes[at];
			y += bytes[at + 1];
			at += 2;
		} else {
			for (let i = 0; i < value; i++, x++) {
				if (x < width) out[y * width + x] = bytes[at + i];
			}
			at += value + (value & 1); // runs are word-aligned
		}
	}
}
