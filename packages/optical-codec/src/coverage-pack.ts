/**
 * The on-disk form of a coverage font: a glyph table and one nibble-packed plane.
 *
 * Measured against the alternatives on The Sims 1's eleven interface sizes (2246 glyphs, 167,510 ink
 * pixels), which is why it looks like this:
 *
 *   JSON of coverage triples           1,356,749 raw     245,792 gzip
 *   sparse binary triples                502,530 raw     190,778 gzip   (compresses WORSE than dense)
 *   the game's own .bmp + .fot pairs      385,354 raw     152,666 gzip
 *   dense 8-bit plus this glyph table     359,060 raw      96,124 gzip
 *   this: nibble-packed 4-bit             199,401 raw      88,881 gzip    78,753 brotli
 *
 * Coverage is four bits — the game's fonts use exactly the values 0 through 15 — so two pixels fit
 * in a byte and half the file disappears for free. Rows are padded to a byte boundary so addressing
 * stays arithmetic rather than a bit cursor.
 *
 * Nothing here is compressed. The plane is indexed, not parsed, so a compressed file would have to
 * be inflated in full before the first glyph could be read, and on disk that trades a real cost for
 * a saving that the transport already provides: HTTP brotli at rest, deflate in a package, both
 * built into Node and every browser. Two per-size numbers for scale: size 9 is 10 KB, size 12 is
 * 16 KB. The three sizes the interface actually uses come to about 30 KB.
 *
 * Storing the sparse triples instead would be the intuitive choice and is the wrong one twice over:
 * it is bigger raw, and it is bigger again compressed, because coordinates are entropy while the
 * dense plane's zeroes are positional and deflate eats them.
 */

import type { CoverageFont, CoverageGlyph } from './coverage-font';

const MAGIC = 0x475a4631; // 'GZF1'
const HEADER_BYTES = 16;
/** advance i16, offsetX i8, offsetY i8, width u8, height u8, plane offset u32. */
const TABLE_ENTRY_BYTES = 10;
const GLYPH_SLOTS = 256;
const NO_INK = 0xffffffff;

export function packCoverageFont(font: CoverageFont): Uint8Array {
	const name = new TextEncoder().encode(font.name);
	const nameBytes = (name.length + 3) & ~3;
	const tableAt = HEADER_BYTES + nameBytes;
	const planeAt = tableAt + GLYPH_SLOTS * TABLE_ENTRY_BYTES;

	const boxes = new Map<number, { x0: number; y0: number; w: number; h: number; rowBytes: number; levels: Uint8Array }>();
	let planeBytes = 0;
	for (const glyph of font.glyphs) {
		if (glyph.cov.length === 0) continue;
		let x0 = Infinity;
		let y0 = Infinity;
		let x1 = -Infinity;
		let y1 = -Infinity;
		for (let i = 0; i < glyph.cov.length; i += 3) {
			x0 = Math.min(x0, glyph.cov[i]);
			x1 = Math.max(x1, glyph.cov[i]);
			y0 = Math.min(y0, glyph.cov[i + 1]);
			y1 = Math.max(y1, glyph.cov[i + 1]);
		}
		const w = x1 - x0 + 1;
		const h = y1 - y0 + 1;
		const levels = new Uint8Array(w * h);
		for (let i = 0; i < glyph.cov.length; i += 3) {
			levels[(glyph.cov[i + 1] - y0) * w + (glyph.cov[i] - x0)] = glyph.cov[i + 2] & 0x0f;
		}
		const rowBytes = (w + 1) >> 1;
		boxes.set(glyph.code, { x0, y0, w, h, rowBytes, levels });
		planeBytes += rowBytes * h;
	}

	const out = new Uint8Array(planeAt + planeBytes);
	const view = new DataView(out.buffer);
	view.setUint32(0, MAGIC, false);
	view.setUint16(4, font.size, true);
	view.setUint16(6, font.height, true);
	out[8] = font.levels;
	out[9] = 0;
	view.setUint16(10, font.spaceWidth, true);
	view.setUint16(12, name.length, true);
	out.set(name, HEADER_BYTES);

	for (let code = 0; code < GLYPH_SLOTS; code++) {
		view.setUint32(tableAt + code * TABLE_ENTRY_BYTES + 6, NO_INK, true);
	}

	let cursor = planeAt;
	for (const glyph of font.glyphs) {
		const at = tableAt + glyph.code * TABLE_ENTRY_BYTES;
		const box = boxes.get(glyph.code);
		view.setInt16(at, glyph.width, true);
		// An advance and no ink is a space, which the matcher can only ever infer from a gap.
		if (box === undefined) continue;
		if (box.w > 255 || box.h > 255) throw new Error(`glyph ${glyph.code} is ${box.w}x${box.h}, too big for this table`);
		if (box.x0 < -128 || box.x0 > 127 || box.y0 < -128 || box.y0 > 127) {
			throw new Error(`glyph ${glyph.code} sits at ${box.x0},${box.y0}, too far from the pen for this table`);
		}
		view.setInt8(at + 2, box.x0);
		view.setInt8(at + 3, box.y0);
		out[at + 4] = box.w;
		out[at + 5] = box.h;
		view.setUint32(at + 6, cursor - planeAt, true);

		for (let y = 0; y < box.h; y++) {
			for (let x = 0; x < box.w; x += 2) {
				const lo = box.levels[y * box.w + x];
				const hi = x + 1 < box.w ? box.levels[y * box.w + x + 1] : 0;
				out[cursor + (x >> 1)] = lo | (hi << 4);
			}
			cursor += box.rowBytes;
		}
	}

	return out;
}

export function unpackCoverageFont(bytes: Uint8Array): CoverageFont {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (view.getUint32(0, false) !== MAGIC) throw new Error('not a packed coverage font: bad magic');

	const size = view.getUint16(4, true);
	const height = view.getUint16(6, true);
	const levels = bytes[8];
	const spaceWidth = view.getUint16(10, true);
	const nameLength = view.getUint16(12, true);
	const name = new TextDecoder().decode(bytes.subarray(HEADER_BYTES, HEADER_BYTES + nameLength));
	const tableAt = HEADER_BYTES + ((nameLength + 3) & ~3);
	const planeAt = tableAt + GLYPH_SLOTS * TABLE_ENTRY_BYTES;

	const glyphs: CoverageGlyph[] = [];
	for (let code = 0; code < GLYPH_SLOTS; code++) {
		const at = tableAt + code * TABLE_ENTRY_BYTES;
		const advance = view.getInt16(at, true);
		const offsetX = view.getInt8(at + 2);
		const offsetY = view.getInt8(at + 3);
		const w = bytes[at + 4];
		const h = bytes[at + 5];
		const dataOffset = view.getUint32(at + 6, true);

		if (dataOffset === NO_INK) {
			if (advance !== 0) glyphs.push({ char: String.fromCharCode(code), code, width: advance, cov: [] });
			continue;
		}

		const rowBytes = (w + 1) >> 1;
		const cov: number[] = [];
		for (let y = 0; y < h; y++) {
			const row = planeAt + dataOffset + y * rowBytes;
			for (let x = 0; x < w; x++) {
				const byte = bytes[row + (x >> 1)];
				const level = x & 1 ? byte >> 4 : byte & 0x0f;
				if (level !== 0) cov.push(offsetX + x, offsetY + y, level);
			}
		}
		glyphs.push({ char: String.fromCharCode(code), code, width: advance, cov });
	}

	return { name, size, height, levels, spaceWidth, glyphs };
}
