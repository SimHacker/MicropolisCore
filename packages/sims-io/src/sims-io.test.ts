/**
 * sims-io integration tests.
 *
 * Tests the L0/L1 stack against:
 *   1. MemoryResourceProvider with a hand-crafted minimal FAR fixture
 *   2. NodeResourceProvider against a real FAR archive from a local Sims install
 *      (skipped when the archive is not present on this machine)
 *
 * These tests prove that the package builds, that L0 providers work, and that
 * L1 VirtualTree correctly indexes and reads from FAR archives — without needing
 * a full Sims installation in CI.
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { isFar, parseFar, isIff, detectIffVersion, listIffChunks } from 'vitamoo';
import { MemoryResourceProvider, NodeResourceProvider } from './l0/index.js';
import { VirtualTree } from './l1/virtual-tree.js';
import { normalisePath } from './l0/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal valid FAR v1 archive in memory.
 * FAR v1 layout:
 *   [0..7]   magic "FAR!byAZ"
 *   [8..11]  version = 1 (uint32 LE)
 *   [12..15] manifest offset (uint32 LE)
 *   [16..]   file data payloads (contiguous)
 *   [manifest..]
 *     uint32 entry_count
 *     per entry: [raw_size 4][compressed_size 4][data_offset 4][name_len 4][name bytes]
 */
function buildMiniFar(entries: { name: string; data: Uint8Array }[]): ArrayBuffer {
	const magic = new TextEncoder().encode('FAR!byAZ');
	const version = 1;

	// Compute data offsets (data starts at byte 16, after the 16-byte header)
	const dataOffsets: number[] = [];
	let payloadOffset = 16;
	for (const entry of entries) {
		dataOffsets.push(payloadOffset);
		payloadOffset += entry.data.byteLength;
	}
	const manifestOffset = payloadOffset;

	// Build manifest: entry_count (4) + per-entry records
	const manifestChunks: Uint8Array[] = [];
	const countBuf = new Uint8Array(4);
	new DataView(countBuf.buffer).setUint32(0, entries.length, true);
	manifestChunks.push(countBuf);

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i]!;
		const nameBytes = new TextEncoder().encode(entry.name);
		const rec = new Uint8Array(16 + nameBytes.byteLength);
		const rv = new DataView(rec.buffer);
		rv.setUint32(0, entry.data.byteLength, true);  // raw_size
		rv.setUint32(4, entry.data.byteLength, true);  // compressed_size
		rv.setUint32(8, dataOffsets[i]!, true);        // data_offset
		rv.setUint32(12, nameBytes.byteLength, true);  // name_len
		rec.set(nameBytes, 16);
		manifestChunks.push(rec);
	}

	// Assemble final buffer
	const manifestSize = manifestChunks.reduce((s, c) => s + c.byteLength, 0);
	const totalSize = 16 + entries.reduce((s, e) => s + e.data.byteLength, 0) + manifestSize;
	const out = new Uint8Array(totalSize);
	const hv = new DataView(out.buffer);
	out.set(magic, 0);
	hv.setUint32(8, version, true);
	hv.setUint32(12, manifestOffset, true);

	let pos = 16;
	for (const entry of entries) { out.set(entry.data, pos); pos += entry.data.byteLength; }
	for (const chunk of manifestChunks) { out.set(chunk, pos); pos += chunk.byteLength; }

	return out.buffer as ArrayBuffer;
}

// ─── L0: MemoryResourceProvider ──────────────────────────────────────────────

describe('MemoryResourceProvider (L0)', () => {
	it('reads a file by path', async () => {
		const content = new TextEncoder().encode('hello sims').buffer as ArrayBuffer;
		const p = new MemoryResourceProvider({ 'GameData/test.txt': content });
		const got = await p.read('GameData/test.txt');
		expect(got).not.toBeNull();
		expect(new TextDecoder().decode(got!)).toBe('hello sims');
	});

	it('returns null for missing file', async () => {
		const p = new MemoryResourceProvider({});
		expect(await p.read('missing.iff')).toBeNull();
	});

	it('normalises path case', async () => {
		const content = new Uint8Array([1, 2, 3]).buffer as ArrayBuffer;
		const p = new MemoryResourceProvider({ 'GameData/Foo.far': content });
		expect(await p.read('GameData/Foo.far')).not.toBeNull();
		expect(await p.read('gamedata/foo.far')).not.toBeNull();
	});

	it('lists directory contents', async () => {
		const p = new MemoryResourceProvider({
			'GameData/a.far': new ArrayBuffer(0),
			'GameData/b.iff': new ArrayBuffer(0),
			'GameData/sub/c.far': new ArrayBuffer(0),
		});
		const entries = await p.list('GameData');
		const names = entries.map(e => e.name).sort();
		expect(names).toContain('a.far');
		expect(names).toContain('b.iff');
		expect(names).toContain('sub');
		const subEntry = entries.find(e => e.name === 'sub');
		expect(subEntry?.isDirectory).toBe(true);
	});
});

// ─── L0: NodeResourceProvider ────────────────────────────────────────────────

describe('NodeResourceProvider (L0)', () => {
	it('reads a real file from content/vitamoo/sims-demo/', async () => {
		const repoRoot = path.resolve(__dirname, '../../..');
		const demoBuf = path.join(repoRoot, 'content/vitamoo/sims-demo');
		const provider = new NodeResourceProvider(demoBuf);
		const buf = await provider.read('content-exchange.json');
		expect(buf).not.toBeNull();
		const text = new TextDecoder().decode(buf!);
		const json = JSON.parse(text);
		expect(json).toHaveProperty('characterTemplates');
	});

	it('lists contents of content/vitamoo/sims-demo/', async () => {
		const repoRoot = path.resolve(__dirname, '../../..');
		const provider = new NodeResourceProvider(path.join(repoRoot, 'content/vitamoo/sims-demo'));
		const entries = await provider.list('');
		const names = entries.map(e => e.name);
		expect(names).toContain('content-exchange.json');
		expect(names.some(n => n.endsWith('.cmx'))).toBe(true);
	});

	it('blocks path traversal', async () => {
		const repoRoot = path.resolve(__dirname, '../../..');
		const provider = new NodeResourceProvider(path.join(repoRoot, 'content/vitamoo/sims-demo'));
		await expect(provider.read('../../../package.json')).rejects.toThrow('Path traversal denied');
	});
});

// ─── L1: VirtualTree with FAR archive ────────────────────────────────────────

describe('VirtualTree (L1) — in-memory FAR fixture', () => {
	it('indexes and reads a FAR entry', async () => {
		const fileContent = new TextEncoder().encode('sim character data').buffer as ArrayBuffer;
		const farBuf = buildMiniFar([{ name: 'GameData/c001ma.skn', data: new Uint8Array(fileContent) }]);

		const provider = new MemoryResourceProvider({ 'skins.far': farBuf });
		const tree = new VirtualTree(provider);
		await tree.initialise();

		const result = await tree.read('GameData/c001ma.skn');
		expect(result).not.toBeNull();
		expect(new TextDecoder().decode(result!)).toBe('sim character data');
	});

	it('loose files take precedence over FAR entries', async () => {
		const farContent = new TextEncoder().encode('from far').buffer as ArrayBuffer;
		const looseContent = new TextEncoder().encode('from loose').buffer as ArrayBuffer;
		const farBuf = buildMiniFar([{ name: 'test.txt', data: new Uint8Array(farContent) }]);

		const provider = new MemoryResourceProvider({
			'archive.far': farBuf,
			'test.txt': looseContent,
		});
		const tree = new VirtualTree(provider);
		await tree.initialise();

		const result = await tree.read('test.txt');
		expect(new TextDecoder().decode(result!)).toBe('from loose');
	});

	it('listAll returns FAR entries', async () => {
		const farBuf = buildMiniFar([
			{ name: 'GameData/Skins/a.skn', data: new Uint8Array([1]) },
			{ name: 'GameData/Skins/b.skn', data: new Uint8Array([2]) },
		]);
		const provider = new MemoryResourceProvider({ 'pack.far': farBuf });
		const tree = new VirtualTree(provider);
		await tree.initialise();

		const all = tree.listAll('GameData/Skins');
		expect(all.length).toBe(2);
		expect(all.every(e => e.fromArchive)).toBe(true);
	});
});

// ─── Integration: real FAR archive (skipped when not present) ────────────────

const REAL_FAR = '/Users/a2deh/GroundUp/TheSims/sfhcChristmasTree2005/sfhcChristmasTree2005.far';

describe.skipIf(!existsSync(REAL_FAR))('VirtualTree (L1) — real Sims FAR archive', () => {
	it('reads a real FAR archive and finds IFF/SKN entries', async () => {
		const provider = new NodeResourceProvider(path.dirname(REAL_FAR));
		const tree = new VirtualTree(provider);
		await tree.initialise();

		const allEntries = tree.listAll();
		expect(allEntries.length).toBeGreaterThan(0);
		expect(allEntries.some(e => e.logicalPath.endsWith('.skn') || e.logicalPath.endsWith('.iff'))).toBe(true);
	});

	it('reads a FAR entry buffer (vitamoo parseFar / extractFarEntry)', async () => {
		const provider = new NodeResourceProvider(path.dirname(REAL_FAR));
		const farBuf = await provider.read(path.basename(REAL_FAR));
		expect(farBuf).not.toBeNull();
		expect(isFar(farBuf!)).toBe(true);

		const archive = parseFar(farBuf!);
		expect(archive.entries.length).toBeGreaterThan(0);
		// Pick first IFF entry and verify it looks like an IFF file
		const iffEntry = archive.entries.find(e => e.path.toLowerCase().endsWith('.iff'));
		if (iffEntry) {
			const { extractFarEntry } = await import('vitamoo');
			const entryBuf = extractFarEntry(farBuf!, iffEntry);
			expect(isIff(entryBuf)).toBe(true);
			const version = detectIffVersion(entryBuf);
			const chunks = listIffChunks(entryBuf);
			expect(chunks.length).toBeGreaterThan(0);
		}
	});
});

// ─── normalisePath utility ────────────────────────────────────────────────────

describe('normalisePath', () => {
	it('lowercases and converts backslashes', () => {
		expect(normalisePath('GameData\\Skins\\Foo.SKN')).toBe('gamedata/skins/foo.skn');
	});

	it('strips leading slash', () => {
		expect(normalisePath('/GameData/foo.iff')).toBe('gamedata/foo.iff');
	});
});
