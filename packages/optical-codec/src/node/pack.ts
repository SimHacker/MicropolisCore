/**
 * Reading and writing font packs on Node, where the codec is zlib.
 *
 * Raw deflate rather than gzip: the chunk header already carries the length and the codec, so a gzip
 * wrapper would be a second copy of both. A browser inflates the same bytes with
 * new DecompressionStream('deflate-raw') and needs nothing shipped to it.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

import { decodeFontPack, encodeFontPack, type FontPack } from '../font-pack';

export function encodeFontPackNode(pack: FontPack): Uint8Array {
	return encodeFontPack(pack, (bytes) => new Uint8Array(deflateRawSync(bytes, { level: 9 })));
}

export function decodeFontPackNode(bytes: Uint8Array): FontPack {
	return decodeFontPack(bytes, (stored) => new Uint8Array(inflateRawSync(stored)));
}

export function writeFontPack(path: string, pack: FontPack): number {
	const bytes = encodeFontPackNode(pack);
	writeFileSync(path, bytes);
	return bytes.length;
}

export function readFontPack(path: string): FontPack {
	return decodeFontPackNode(new Uint8Array(readFileSync(path)));
}
