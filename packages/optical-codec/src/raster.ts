/**
 * A rectangle of RGBA bytes, and the few drawing operations the test bench needs.
 *
 * Deliberately not a canvas. This package has to run in Node with no DOM so the tests are
 * the same code as the runtime, and everything here is small enough that pulling in an
 * image library would cost more than it saves.
 */

export interface Raster {
	width: number;
	height: number;
	/** RGBA, row-major, 4 bytes per pixel. */
	data: Uint8ClampedArray;
}

export type RGB = readonly [number, number, number];

export function createRaster(width: number, height: number, fill: RGB = [0, 0, 0]): Raster {
	const data = new Uint8ClampedArray(width * height * 4);
	for (let i = 0; i < data.length; i += 4) {
		data[i] = fill[0];
		data[i + 1] = fill[1];
		data[i + 2] = fill[2];
		data[i + 3] = 255;
	}
	return { width, height, data };
}

export function cloneRaster(src: Raster): Raster {
	return { width: src.width, height: src.height, data: new Uint8ClampedArray(src.data) };
}

export function setPixel(r: Raster, x: number, y: number, c: RGB): void {
	if (x < 0 || y < 0 || x >= r.width || y >= r.height) return;
	const i = (y * r.width + x) * 4;
	r.data[i] = c[0];
	r.data[i + 1] = c[1];
	r.data[i + 2] = c[2];
	r.data[i + 3] = 255;
}

export function getPixel(r: Raster, x: number, y: number): RGB {
	const cx = Math.min(r.width - 1, Math.max(0, Math.round(x)));
	const cy = Math.min(r.height - 1, Math.max(0, Math.round(y)));
	const i = (cy * r.width + cx) * 4;
	return [r.data[i], r.data[i + 1], r.data[i + 2]];
}

export function fillRect(r: Raster, x: number, y: number, w: number, h: number, c: RGB): void {
	const x0 = Math.max(0, Math.floor(x));
	const y0 = Math.max(0, Math.floor(y));
	const x1 = Math.min(r.width, Math.ceil(x + w));
	const y1 = Math.min(r.height, Math.ceil(y + h));
	for (let yy = y0; yy < y1; yy++) {
		for (let xx = x0; xx < x1; xx++) setPixel(r, xx, yy, c);
	}
}

/** Filled ellipse, used for the egg body and for scenery blobs. */
export function fillEllipse(r: Raster, cx: number, cy: number, rx: number, ry: number, c: RGB): void {
	const x0 = Math.max(0, Math.floor(cx - rx));
	const x1 = Math.min(r.width - 1, Math.ceil(cx + rx));
	const y0 = Math.max(0, Math.floor(cy - ry));
	const y1 = Math.min(r.height - 1, Math.ceil(cy + ry));
	for (let y = y0; y <= y1; y++) {
		for (let x = x0; x <= x1; x++) {
			const dx = (x - cx) / rx;
			const dy = (y - cy) / ry;
			if (dx * dx + dy * dy <= 1) setPixel(r, x, y, c);
		}
	}
}

/** Copy src into dst with its top-left at (x, y). No blending; alpha is always opaque here. */
export function blit(dst: Raster, src: Raster, x: number, y: number): void {
	for (let sy = 0; sy < src.height; sy++) {
		const dy = y + sy;
		if (dy < 0 || dy >= dst.height) continue;
		for (let sx = 0; sx < src.width; sx++) {
			const dx = x + sx;
			if (dx < 0 || dx >= dst.width) continue;
			const si = (sy * src.width + sx) * 4;
			setPixel(dst, dx, dy, [src.data[si], src.data[si + 1], src.data[si + 2]]);
		}
	}
}

/** Nearest-neighbour scale. Integer factors keep synthetic fixtures pixel-exact. */
export function scaleRaster(src: Raster, factor: number): Raster {
	const width = Math.max(1, Math.round(src.width * factor));
	const height = Math.max(1, Math.round(src.height * factor));
	const out = createRaster(width, height);
	for (let y = 0; y < height; y++) {
		const sy = Math.min(src.height - 1, Math.floor(y / factor));
		for (let x = 0; x < width; x++) {
			const sx = Math.min(src.width - 1, Math.floor(x / factor));
			setPixel(out, x, y, getPixel(src, sx, sy));
		}
	}
	return out;
}

export function cropRaster(src: Raster, x: number, y: number, w: number, h: number): Raster {
	const out = createRaster(w, h);
	for (let yy = 0; yy < h; yy++) {
		for (let xx = 0; xx < w; xx++) setPixel(out, xx, yy, getPixel(src, x + xx, y + yy));
	}
	return out;
}

/**
 * Minimal PNG writer, so a failing fixture can be looked at instead of described.
 *
 * Compresses if given something to compress with — pass Node's `deflateSync` and the file shrinks by
 * an order of magnitude. Without it the rows are stored uncompressed, which keeps this package free
 * of any dependency and is fine for a fixture nobody commits.
 */
export function toPNG(r: Raster, deflate?: (data: Uint8Array) => Uint8Array): Uint8Array {
	const raw = new Uint8Array((r.width * 4 + 1) * r.height);
	let p = 0;
	for (let y = 0; y < r.height; y++) {
		raw[p++] = 0; // filter: none
		for (let x = 0; x < r.width; x++) {
			const i = (y * r.width + x) * 4;
			raw[p++] = r.data[i];
			raw[p++] = r.data[i + 1];
			raw[p++] = r.data[i + 2];
			raw[p++] = r.data[i + 3];
		}
	}
	const idat = deflate ? deflate(raw) : zlibStore(raw);
	const ihdr = new Uint8Array(13);
	writeU32(ihdr, 0, r.width);
	writeU32(ihdr, 4, r.height);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // colour type: RGBA
	const chunks = [chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', new Uint8Array(0))];
	const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
	return concat([signature, ...chunks]);
}

function writeU32(a: Uint8Array, o: number, v: number): void {
	a[o] = (v >>> 24) & 255;
	a[o + 1] = (v >>> 16) & 255;
	a[o + 2] = (v >>> 8) & 255;
	a[o + 3] = v & 255;
}

function concat(parts: Uint8Array[]): Uint8Array {
	const total = parts.reduce((n, p) => n + p.length, 0);
	const out = new Uint8Array(total);
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
}

function chunk(type: string, body: Uint8Array): Uint8Array {
	const out = new Uint8Array(body.length + 12);
	writeU32(out, 0, body.length);
	for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
	out.set(body, 8);
	writeU32(out, out.length - 4, crc32(out.subarray(4, out.length - 4)));
	return out;
}

/** Stored (uncompressed) deflate blocks wrapped in a zlib header. Simple beats small here. */
function zlibStore(data: Uint8Array): Uint8Array {
	const blocks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
	const MAX = 65535;
	for (let o = 0; o < data.length || o === 0; o += MAX) {
		const slice = data.subarray(o, Math.min(data.length, o + MAX));
		const last = o + MAX >= data.length ? 1 : 0;
		const head = new Uint8Array(5);
		head[0] = last;
		head[1] = slice.length & 255;
		head[2] = (slice.length >>> 8) & 255;
		head[3] = ~slice.length & 255;
		head[4] = (~slice.length >>> 8) & 255;
		blocks.push(head, slice);
		if (last) break;
	}
	const adler = adler32(data);
	const tail = new Uint8Array(4);
	writeU32(tail, 0, adler);
	blocks.push(tail);
	return concat(blocks);
}

function adler32(data: Uint8Array): number {
	let a = 1;
	let b = 0;
	for (let i = 0; i < data.length; i++) {
		a = (a + data[i]) % 65521;
		b = (b + a) % 65521;
	}
	return ((b << 16) | a) >>> 0;
}

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(data: Uint8Array): number {
	let c = 0xffffffff;
	for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 255] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}
