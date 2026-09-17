/**
 * A font pack: several faces and their provenance in one compressed file.
 *
 * The format exists because this application needs one thing from a font and no font format offers
 * it. What it needs is coverage — how much of each pixel a letter covers — kept exactly, with the
 * advances the original layout used, so the same numbers can DRAW text and READ text back. TrueType
 * would hand back an outline to be rasterised by somebody else's hinter, at which point the pixels
 * are a guess and reading them is guesswork twice over. A PNG atlas plus a JSON sidecar keeps the
 * pixels but turns colour into a lie: coverage is not grey, it is how much of the pixel belongs to
 * the letter, and flattening it to grey means the reader has to be told what colour the text was.
 *
 * So: our format, one file, with importers and exporters on both sides. Faces come in from whatever
 * had them — a game's atlas and metrics, a hand-measured screenshot from 2004 — and go out as PNG
 * contact sheets and JSON anyone can read. Nothing is trapped in here; the exporter is the promise.
 *
 * Structure is a chunk list, so a pack can gain chunk types without invalidating older readers:
 *
 *   'FNTP'   magic
 *   u16      version
 *   u16      chunk count
 *   chunks   'FACE' one coverage face, in the packed form of coverage-pack.ts
 *            'META' UTF-8 JSON: where the faces came from, and what is known about them
 *
 * Each chunk names its own codec, so compression is per chunk and can differ between them. Faces
 * deflate to about half: eleven sizes of an interface font are 191 KB packed and 89 KB stored.
 *
 * Compression is injected rather than imported. Node has zlib, a browser has DecompressionStream,
 * and this module has to run in both — see node/pack.ts for the Node ends of both functions.
 */

import { packCoverageFont, unpackCoverageFont } from './coverage-pack';
import type { CoverageFont } from './coverage-font';

const MAGIC = 0x464e5450; // 'FNTP'
const VERSION = 1;
const HEADER_BYTES = 8;
const CHUNK_HEADER_BYTES = 12;

const FACE = 0x46414345; // 'FACE'
const META = 0x4d455441; // 'META'

/** 0 is stored as-is, 1 is raw deflate: the one codec Node and every browser both have built in. */
export type PackCodec = 0 | 1;
export const STORED: PackCodec = 0;
export const DEFLATE_RAW: PackCodec = 1;

export interface FontPack {
	faces: CoverageFont[];
	/**
	 * Where the faces came from and what is known about them. JSON, because this is the part a
	 * person reads when they find the file in five years and wonders what it is.
	 */
	meta?: unknown;
}

export type Deflate = (bytes: Uint8Array) => Uint8Array;
export type Inflate = (bytes: Uint8Array) => Uint8Array;

export function encodeFontPack(pack: FontPack, deflate?: Deflate): Uint8Array {
	const chunks: { type: number; codec: PackCodec; stored: Uint8Array }[] = [];

	const add = (type: number, raw: Uint8Array) => {
		const squeezed = deflate?.(raw);
		// Storing whichever is smaller, since a chunk that deflates badly should not pay for it.
		if (squeezed !== undefined && squeezed.length < raw.length) chunks.push({ type, codec: DEFLATE_RAW, stored: squeezed });
		else chunks.push({ type, codec: STORED, stored: raw });
	};

	if (pack.meta !== undefined) add(META, new TextEncoder().encode(JSON.stringify(pack.meta)));
	for (const face of pack.faces) add(FACE, packCoverageFont(face));

	let total = HEADER_BYTES;
	for (const chunk of chunks) total += CHUNK_HEADER_BYTES + chunk.stored.length;

	const out = new Uint8Array(total);
	const view = new DataView(out.buffer);
	view.setUint32(0, MAGIC, false);
	view.setUint16(4, VERSION, true);
	view.setUint16(6, chunks.length, true);

	let at = HEADER_BYTES;
	for (const chunk of chunks) {
		view.setUint32(at, chunk.type, false);
		out[at + 4] = chunk.codec;
		out[at + 5] = 0;
		view.setUint16(at + 6, 0, true);
		view.setUint32(at + 8, chunk.stored.length, true);
		out.set(chunk.stored, at + CHUNK_HEADER_BYTES);
		at += CHUNK_HEADER_BYTES + chunk.stored.length;
	}
	return out;
}

export function decodeFontPack(bytes: Uint8Array, inflate?: Inflate): FontPack {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (bytes.length < HEADER_BYTES || view.getUint32(0, false) !== MAGIC) {
		throw new Error('not a font pack: bad magic');
	}
	const version = view.getUint16(4, true);
	if (version !== VERSION) throw new Error(`font pack version ${version}, this reader knows ${VERSION}`);

	const count = view.getUint16(6, true);
	const faces: CoverageFont[] = [];
	let meta: unknown;

	let at = HEADER_BYTES;
	for (let i = 0; i < count; i++) {
		if (at + CHUNK_HEADER_BYTES > bytes.length) throw new Error(`font pack truncated in chunk ${i}`);
		const type = view.getUint32(at, false);
		const codec = bytes[at + 4] as PackCodec;
		const storedLength = view.getUint32(at + 8, true);
		const stored = bytes.subarray(at + CHUNK_HEADER_BYTES, at + CHUNK_HEADER_BYTES + storedLength);
		at += CHUNK_HEADER_BYTES + storedLength;

		let raw: Uint8Array;
		if (codec === STORED) raw = stored;
		else if (codec === DEFLATE_RAW) {
			if (inflate === undefined) throw new Error('font pack is deflated and no inflate was supplied');
			raw = inflate(stored);
		} else {
			// An unknown codec on a chunk we might not need: skip it rather than refuse the file.
			continue;
		}

		if (type === FACE) faces.push(unpackCoverageFont(raw));
		else if (type === META) meta = JSON.parse(new TextDecoder().decode(raw));
	}

	return { faces, meta };
}

/** The face of a given point size, or undefined. Sizes are what the application asks in. */
export function faceOfSize(pack: FontPack, size: number): CoverageFont | undefined {
	return pack.faces.find((face) => face.size === size);
}

/** The face by name, for faces that are not one of a numbered family. */
export function faceNamed(pack: FontPack, name: string): CoverageFont | undefined {
	return pack.faces.find((face) => face.name === name);
}
