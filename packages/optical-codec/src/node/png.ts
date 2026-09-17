/**
 * PNG in, pixels out, using the zlib that Node already has.
 *
 * Needed because our own readers work on pixels while the capture path produces encoded files, and
 * zxing's ability to decode a container itself does not help anything but zxing. Written rather than
 * installed: the whole format we have to handle is one filter loop and an inflate, the alternative
 * is a native dependency in the main process, and a decoder is exactly the kind of thing that should
 * be readable when a frame comes out wrong.
 *
 * Handles what a screen capture produces: 8-bit greyscale, RGB and RGBA, non-interlaced. Anything
 * else throws with the reason rather than returning a plausible mess.
 */

import { inflateSync } from 'node:zlib';

import { createRaster, type Raster } from '../raster';

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

export function decodePNG(bytes: Uint8Array): Raster {
	for (let i = 0; i < SIGNATURE.length; i++) {
		if (bytes[i] !== SIGNATURE[i]) throw new Error('not a PNG');
	}

	let width = 0;
	let height = 0;
	let depth = 0;
	let colourType = 0;
	let interlace = 0;
	const idat: Uint8Array[] = [];
	let palette: Uint8Array | null = null;

	let offset = 8;
	while (offset < bytes.length) {
		const length = readU32(bytes, offset);
		const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
		const body = bytes.subarray(offset + 8, offset + 8 + length);
		if (type === 'IHDR') {
			width = readU32(body, 0);
			height = readU32(body, 4);
			depth = body[8];
			colourType = body[9];
			interlace = body[12];
		} else if (type === 'PLTE') {
			palette = body;
		} else if (type === 'IDAT') {
			idat.push(body);
		} else if (type === 'IEND') {
			break;
		}
		offset += length + 12;
	}

	if (depth !== 8) throw new Error(`unsupported PNG bit depth ${depth}`);
	if (interlace !== 0) throw new Error('interlaced PNG is not supported');

	const channels = channelCount(colourType);
	const raw = inflateSync(concat(idat));
	const stride = width * channels;
	const out = createRaster(width, height);

	// Undo the per-row filters, in place, one row at a time. Each row's filter refers to the row
	// above it, which is why this walks forward and keeps the previous line.
	const line = new Uint8Array(stride);
	const previous = new Uint8Array(stride);
	let p = 0;
	for (let y = 0; y < height; y++) {
		const filter = raw[p++];
		line.set(raw.subarray(p, p + stride));
		p += stride;
		unfilter(filter, line, previous, channels);
		writeRow(out, y, line, channels, colourType, palette);
		previous.set(line);
	}

	return out;
}

function channelCount(colourType: number): number {
	switch (colourType) {
		case 0:
			return 1; // greyscale
		case 2:
			return 3; // RGB
		case 3:
			return 1; // palette index
		case 4:
			return 2; // greyscale + alpha
		case 6:
			return 4; // RGBA
		default:
			throw new Error(`unsupported PNG colour type ${colourType}`);
	}
}

function unfilter(filter: number, line: Uint8Array, previous: Uint8Array, bpp: number): void {
	switch (filter) {
		case 0:
			return;
		case 1:
			for (let i = bpp; i < line.length; i++) line[i] = (line[i] + line[i - bpp]) & 255;
			return;
		case 2:
			for (let i = 0; i < line.length; i++) line[i] = (line[i] + previous[i]) & 255;
			return;
		case 3:
			for (let i = 0; i < line.length; i++) {
				const left = i >= bpp ? line[i - bpp] : 0;
				line[i] = (line[i] + ((left + previous[i]) >> 1)) & 255;
			}
			return;
		case 4:
			for (let i = 0; i < line.length; i++) {
				const a = i >= bpp ? line[i - bpp] : 0;
				const b = previous[i];
				const c = i >= bpp ? previous[i - bpp] : 0;
				line[i] = (line[i] + paeth(a, b, c)) & 255;
			}
			return;
		default:
			throw new Error(`unknown PNG row filter ${filter}`);
	}
}

function paeth(a: number, b: number, c: number): number {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	return pb <= pc ? b : c;
}

function writeRow(
	out: Raster,
	y: number,
	line: Uint8Array,
	channels: number,
	colourType: number,
	palette: Uint8Array | null
): void {
	for (let x = 0; x < out.width; x++) {
		const s = x * channels;
		const d = (y * out.width + x) * 4;
		let r: number;
		let g: number;
		let b: number;
		if (colourType === 3) {
			if (palette === null) throw new Error('palette PNG with no PLTE chunk');
			const i = line[s] * 3;
			r = palette[i];
			g = palette[i + 1];
			b = palette[i + 2];
		} else if (colourType === 0 || colourType === 4) {
			r = g = b = line[s];
		} else {
			r = line[s];
			g = line[s + 1];
			b = line[s + 2];
		}
		out.data[d] = r;
		out.data[d + 1] = g;
		out.data[d + 2] = b;
		// Alpha is dropped rather than composited: a screen capture is opaque, and inventing a
		// background to blend against would change the colours the matchers compare.
		out.data[d + 3] = 255;
	}
}

function readU32(bytes: Uint8Array, offset: number): number {
	return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function concat(parts: Uint8Array[]): Uint8Array {
	const total = parts.reduce((n, part) => n + part.length, 0);
	const out = new Uint8Array(total);
	let o = 0;
	for (const part of parts) {
		out.set(part, o);
		o += part.length;
	}
	return out;
}
