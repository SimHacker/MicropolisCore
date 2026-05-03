import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { micropolisReactive } from './MicropolisReactive.svelte';
import type { MicropolisSimulator } from './MicropolisSimulator';
import { loadMicropolisMainModule } from './wasm/node';
import { createMapMopViews } from './wasm/views';
import type { MainModule } from '../types/micropolisengine.d.js';
import type { JSCallback, Micropolis } from '../types/micropolisengine.d.js';

describe('micropolisReactive bridge', () => {
	let engine: MainModule;
	let micropolis: Micropolis;
	let jsCallbackWrapper: JSCallback;

	beforeAll(async () => {
		engine = await loadMicropolisMainModule();
		micropolis = new engine.Micropolis();
		jsCallbackWrapper = new engine.JSCallback(micropolisReactive.engineCallback);
		micropolis.setCallback(jsCallbackWrapper, {});
		const mm = createMapMopViews(engine, micropolis);
		micropolis.init();

		const simulatorLike = {
			micropolis,
			micropolisengine: engine,
			mapData: mm?.mapData ?? null,
			mopData: mm?.mopData ?? null
		} as MicropolisSimulator;

		micropolisReactive.attach(simulatorLike);
	});

	afterAll(() => {
		micropolisReactive.detach();
		try {
			micropolis.delete();
		} catch {
			/* ignore */
		}
		try {
			jsCallbackWrapper.delete();
		} catch {
			/* ignore */
		}
	});

	it('exposes wasm module constants after attach', () => {
		const m = micropolisReactive.wasmModule;
		expect(m?.WORLD_W).toBe(engine.WORLD_W);
		expect(micropolisReactive.worldWidth).toBe(engine.WORLD_W);
		expect(micropolisReactive.worldHeight).toBe(engine.WORLD_H);
	});

	it('memory helpers match world size', () => {
		const b = micropolisReactive.memory.bounds();
		expect(b?.w).toBe(engine.WORLD_W);
		expect(b?.h).toBe(engine.WORLD_H);
		expect(micropolisReactive.memory.tileLinearIndex(0, 0)).toBe(0);
		expect(micropolisReactive.memory.tileLinearIndex(engine.WORLD_W - 1, engine.WORLD_H - 1)).toBe(
			engine.WORLD_W * engine.WORLD_H - 1
		);
		expect(micropolisReactive.memory.tileLinearIndex(engine.WORLD_W, 0)).toBeNull();
		const mapU16 = micropolisReactive.memory.mapU16;
		if (mapU16) {
			expect(mapU16.length).toBe(micropolisReactive.memory.mapWordLength);
		}
	});

	it('loads city and syncs reactive + peek scalars', () => {
		const ok = micropolis.loadCity('/cities/haight.cty');
		expect(ok).toBe(true);
		micropolisReactive.syncFromEngine();

		expect(micropolisReactive.totalFunds).toBe(micropolis.totalFunds);
		const peek = micropolisReactive.peek.scalars();
		expect(peek).not.toBeNull();
		expect(peek!.totalFunds).toBe(micropolis.totalFunds);

		const snap = micropolisReactive.getSnapshot();
		expect(snap.worldWidth).toBe(engine.WORLD_W);
		expect(snap.totalFunds).toBe(micropolis.totalFunds);
	});

	it('peek.tile matches getTile', () => {
		const a = micropolis.getTile(10, 12);
		const b = micropolisReactive.peek.tile(10, 12);
		expect(b).toBe(a);
	});

	it('poke.setFunds updates engine and reactive mirror', () => {
		const target = 42_500;
		micropolisReactive.poke.setFunds(target);
		expect(micropolis.totalFunds).toBe(target);
		expect(micropolisReactive.totalFunds).toBe(target);
		expect(micropolisReactive.peek.scalars()?.totalFunds).toBe(target);
	});

	it('poke.bumpMap increments mapRevision', () => {
		const before = micropolisReactive.mapRevision;
		micropolisReactive.poke.bumpMap();
		expect(micropolisReactive.mapRevision).toBe(before + 1);
	});
});
