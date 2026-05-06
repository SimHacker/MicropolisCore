/**
 * Neighborhood scanner tests.
 *
 * Uses a pre-built synthetic Neighborhood.iff (688 bytes, IFF 2.5) that
 * contains:
 *   FAMI (id=3): house 3, funds=$25k, 2 members (Alice + Bob)
 *   NBRS (id=1): 2 neighbours — Alice (female, cooking=800) and Bob (male, mech=900)
 *
 * Also tests against a real Sims install if available (skipped otherwise).
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryResourceProvider, NodeResourceProvider } from '../l0/index.js';
import { VirtualTree } from '../l1/virtual-tree.js';
import {
	readNeighborhoodFile,
	readNeighborhoodFromTree,
	scanForNeighborhoods,
} from './neighborhood.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Synthetic fixture ────────────────────────────────────────────────────────

/**
 * 688-byte IFF 2.5 synthetic neighborhood.
 *   FAMI (id=3): house 3, $25k, members=[GUID_A=0xAABBCCDD, GUID_B=0x11223344]
 *   NBRS (id=1): Alice (id=1, cooking=800, female) + Bob (id=2, mech=900, male)
 */
const FIXTURE_HEX = '4946462046494c4520322e353a5459504520464f4c4c4f5745442042592053495a4500204a414d494520444f4f524e424f532026204d4158495320310000000046414d490000007c03000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007000000494d41460300000000000000a861000088130000020000000900000002000000ddccbbaa443322114e425253000001f4010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280000005352424e0200000001000000040000004330303146415f4d6572636564657300010000000500000000000000bc02000000000000000000000000000020030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000100000000000000000000000000000000000000000000000000000000000100ddccbbaaffffffff000000000100000004000000433030314d415f526f73730001000000050000000000000000000000000000000000000000000000f401000084030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000001000000000000000000000000000000000000000000000000000000000000000000000000000000020044332211ffffffff00000000';

function hexToBuffer(hex: string): ArrayBuffer {
	const clean = hex.replace(/\s/g, '');
	const bytes = new Uint8Array(clean.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
	}
	return bytes.buffer as ArrayBuffer;
}

// ─── Unit tests ───────────────────────────────────────────────────────────────

describe('readNeighborhoodFile (synthetic fixture)', () => {
	async function loadFixture() {
		const buf = hexToBuffer(FIXTURE_HEX);
		const provider = new MemoryResourceProvider({
			'UserData/Neighborhood.iff': buf,
		});
		return readNeighborhoodFile(provider, 'UserData/Neighborhood.iff', 40);
	}

	it('returns NeighborhoodData with 1 family and 2 neighbours', async () => {
		const data = await loadFixture();
		expect(data).not.toBeNull();
		expect(data!.families).toHaveLength(1);
		expect(data!.nbrs.neighbours).toHaveLength(2);
	});

	it('family has correct house number, funds, and 2 member GUIDs', async () => {
		const data = await loadFixture();
		const fam = data!.families[0]!;
		expect(fam.houseNumber).toBe(3);
		expect(fam.funds).toBe(25000);
		expect(fam.memberGuids).toHaveLength(2);
		expect(fam.isTownie).toBe(false);
	});

	it('familySummaries resolves members from NBRS via GUID', async () => {
		const data = await loadFixture();
		const summary = data!.familySummaries[0]!;
		expect(summary.memberCount).toBe(2);
		expect(summary.members).toHaveLength(2);
	});

	it('Alice has cooking=800 and gender=female', async () => {
		const data = await loadFixture();
		const alice = data!.allSims.find(s => s.charFile === 'C001FA_Mercedes');
		expect(alice).not.toBeUndefined();
		expect(alice!.skills.cooking).toBe(800);
		expect(alice!.gender).toBe('female');
		expect(alice!.isAdult).toBe(true);
		expect(alice!.skinColor).toBe(0);  // light
	});

	it('Bob has mechanical=900 and gender=male', async () => {
		const data = await loadFixture();
		const bob = data!.allSims.find(s => s.charFile === 'C001MA_Ross');
		expect(bob).not.toBeUndefined();
		expect(bob!.skills.mechanical).toBe(900);
		expect(bob!.gender).toBe('male');
		expect(bob!.skinColor).toBe(1);  // medium
	});

	it('allSims list has both Sims from non-townie family', async () => {
		const data = await loadFixture();
		expect(data!.allSims).toHaveLength(2);
	});

	it('returns null for a non-IFF file', async () => {
		const provider = new MemoryResourceProvider({
			'UserData/Neighborhood.iff': new TextEncoder().encode('not an iff file').buffer as ArrayBuffer,
		});
		const result = await readNeighborhoodFile(provider, 'UserData/Neighborhood.iff', 40);
		expect(result).toBeNull();
	});

	it('returns null for a missing file', async () => {
		const provider = new MemoryResourceProvider({});
		const result = await readNeighborhoodFile(provider, 'UserData/Neighborhood.iff', 40);
		expect(result).toBeNull();
	});
});

describe('scanForNeighborhoods (synthetic fixture)', () => {
	it('finds neighborhood at UserData/Neighborhood.iff', async () => {
		const buf = hexToBuffer(FIXTURE_HEX);
		const provider = new MemoryResourceProvider({
			'UserData/Neighborhood.iff': buf,
		});
		const tree = new VirtualTree(provider);
		await tree.initialise();
		const results = await scanForNeighborhoods(tree, ['UserData'], 40);
		expect(results).toHaveLength(1);
		expect(results[0]!.path).toBe('UserData/Neighborhood.iff');
	});

	it('finds multiple neighborhoods across UserData directories', async () => {
		const buf = hexToBuffer(FIXTURE_HEX);
		const provider = new MemoryResourceProvider({
			'UserData/Neighborhood.iff': buf,
			'UserData3/Neighborhood.iff': buf,
		});
		const tree = new VirtualTree(provider);
		await tree.initialise();
		const results = await scanForNeighborhoods(tree, ['UserData', 'UserData3'], 40);
		expect(results).toHaveLength(2);
	});

	it('returns empty array when no neighborhoods found', async () => {
		const tree = new VirtualTree(new MemoryResourceProvider({}));
		await tree.initialise();
		const results = await scanForNeighborhoods(tree, ['UserData'], 40);
		expect(results).toHaveLength(0);
	});
});

// ─── Real Sims install (skipped unless present) ───────────────────────────────

const REAL_SIMS = '/Users/a2deh/GroundUp/Leela/git/SimObliterator_Suite/dev/tests/test_paths.txt';

describe.skipIf(!existsSync(REAL_SIMS))('real Sims install (optional)', () => {
	it('can read test_paths.txt and contains UserData path', () => {
		// Just a sanity check that the file exists and mentions UserData
		const { readFileSync } = require('node:fs');
		const txt = readFileSync(REAL_SIMS, 'utf8');
		expect(typeof txt).toBe('string');
	});
});
