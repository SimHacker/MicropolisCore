/**
 * Deterministic-seeding tests.
 *
 * The engine exposes seedRandom(), but initWillStuff() reseeds the RNG from the
 * wall clock (randomlySeedRandom() -> gettimeofday) and every caller of
 * initWillStuff() runs doSimInit() before returning to the embedder. The map
 * scans in doSimInit() draw from the RNG and write the results straight into map
 * tiles (e.g. zone.cpp: `map[x][y] = ... + getRandom(2)`), so a caller-supplied
 * seed is discarded before it can affect anything observable.
 *
 * Covers:
 *   - generateMap(seed) is reproducible (control: the PRNG itself is fine)
 *   - seedRandom(n) + loadCity() is reproducible
 *   - seedRandom(n) + loadCity() + ticks is reproducible
 *
 * Everything runs on a single Micropolis instance, on purpose. Constructing a
 * second instance in one process is its own (unrelated) bug, so reusing one
 * instance keeps these tests measuring seeding and nothing else.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadMicropolisMainModule } from './wasm/node';
import { callbackMethodNames } from './wasm/callbacks';
import type { MainModule, JSCallback, Micropolis } from '../types/micropolisengine.d.js';

const SEED = 42;
const CITY = '/cities/kobe.cty';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '../..');
const nodeLoaderUrl = pathToFileURL(path.join(testDir, 'wasm/node.ts')).href;
const callbacksUrl = pathToFileURL(path.join(testDir, 'wasm/callbacks.ts')).href;

/** One in-game turn is one cityTime increment = 16 ticks (simulate.cpp phaseCycle). */
const TICKS_PER_TURN = 16;

describe('deterministic seeding', () => {
	let engine: MainModule;
	let micropolis: Micropolis;
	let jsCallbackWrapper: JSCallback;

	beforeAll(async () => {
		engine = await loadMicropolisMainModule();
		micropolis = new engine.Micropolis();
		jsCallbackWrapper = new engine.JSCallback(
			Object.fromEntries(callbackMethodNames.map((name) => [name, () => {}]))
		);
		micropolis.setCallback(jsCallbackWrapper, {});
		micropolis.init();
	});

	afterAll(() => {
		try { micropolis.delete(); } catch { /* ignore */ }
		try { jsCallbackWrapper.delete(); } catch { /* ignore */ }
	});

	/**
	 * Digest of the entire tile map — the sim state that actually matters, and
	 * where the RNG output physically lands.
	 */
	function mapDigest(): string {
		const buffer = Buffer.allocUnsafe(engine.WORLD_W * engine.WORLD_H * 2);
		let offset = 0;
		for (let x = 0; x < engine.WORLD_W; x++) {
			for (let y = 0; y < engine.WORLD_H; y++) {
				buffer.writeUInt16LE(micropolis.getTile(x, y) & 0xffff, offset);
				offset += 2;
			}
		}
		return createHash('sha256').update(buffer).digest('hex');
	}

	/** Collect a digest per repetition of `run`. */
	function digestsOf(runs: number, run: () => void): string[] {
		const digests: string[] = [];
		for (let i = 0; i < runs; i++) {
			run();
			digests.push(mapDigest());
		}
		return digests;
	}

	it('seedRandom() + loadCity() is reproducible across processes', () => {
		// The property that actually matters, and the one the bug broke: a fresh
		// process doing init() -> seedRandom(n) -> loadCity() must land on the same
		// world every time. This has to run in child processes because the first
		// load in a process is the only one that starts from a virgin world, and
		// because init() itself seeds from the clock.
		const script = `
			import { createHash } from 'node:crypto';
			import { loadMicropolisMainModule } from ${JSON.stringify(nodeLoaderUrl)};
			import { callbackMethodNames } from ${JSON.stringify(callbacksUrl)};
			const engine = await loadMicropolisMainModule();
			const m = new engine.Micropolis();
			m.setCallback(new engine.JSCallback(Object.fromEntries(callbackMethodNames.map((n) => [n, () => {}]))), {});
			m.init();
			m.seedRandom(${SEED});
			m.loadCity(${JSON.stringify(CITY)});
			const buf = Buffer.allocUnsafe(engine.WORLD_W * engine.WORLD_H * 2);
			let o = 0;
			for (let x = 0; x < engine.WORLD_W; x++)
				for (let y = 0; y < engine.WORLD_H; y++) { buf.writeUInt16LE(m.getTile(x, y) & 0xffff, o); o += 2; }
			process.stdout.write(createHash('sha256').update(buf).digest('hex'));
		`;

		const digests = Array.from({ length: 3 }, () =>
			execFileSync(process.execPath, ['--input-type=module', '-e', script], {
				cwd: projectRoot,
				encoding: 'utf8'
			}).trim()
		);

		expect(digests[0]).toMatch(/^[0-9a-f]{64}$/);
		expect(new Set(digests).size).toBe(1);
	});

	it('generateMap(seed) produces an identical map every time', () => {
		// Control. generateMap() calls seedRandom(seed) and never routes through
		// initWillStuff(), so this isolates the PRNG from the reseeding bug: if this
		// ever fails, the problem is the generator, not the seed handling.
		const digests = digestsOf(3, () => micropolis.generateMap(SEED));

		expect(new Set(digests).size).toBe(1);
	});

	it('seedRandom() + loadCity() produces an identical map every time', () => {
		// Note the first load is skipped: loadCity() does not fully reset world
		// state, so a load into a virgin post-init() world differs from a load over
		// a previously loaded one, regardless of seeding. That is a separate issue.
		// What matters here is that repeating the same seeded load is reproducible.
		const [, ...digests] = digestsOf(4, () => {
			micropolis.seedRandom(SEED);
			micropolis.loadCity(CITY);
		});

		expect(new Set(digests).size).toBe(1);
	});

	it('seedRandom() + loadCity() + ticks produces an identical map every time', () => {
		const [, ...digests] = digestsOf(4, () => {
			micropolis.seedRandom(SEED);
			micropolis.loadCity(CITY);
			for (let tick = 0; tick < 3 * TICKS_PER_TURN; tick++) {
				micropolis.simTick();
			}
		});

		expect(new Set(digests).size).toBe(1);
	});
});
