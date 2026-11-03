import { describe, it, expect } from 'vitest';
import { loadMicropolisMainModule } from './wasm/node';
import { createNoopJsCallback } from './wasm/callbacks';
import { createMapMopViews } from './wasm/views';
import type { MainModule, Micropolis } from '../types/micropolisengine.d.js';

const CITY = '/cities/kobe.cty';

const loadWithSeed = (engine: MainModule, seed: number): Micropolis => {
	const micropolis = new engine.Micropolis();
	micropolis.setCallback(createNoopJsCallback(engine), {});
	micropolis.init();
	micropolis.seedRandom(seed);
	expect(micropolis.loadCity(CITY)).toBe(true);
	return micropolis;
};

const mapHash = (engine: MainModule, micropolis: Micropolis): number => {
	let hash = 0;
	for (const tile of createMapMopViews(engine, micropolis)!.mapData) hash = (Math.imul(hash, 31) + tile) | 0;
	return hash >>> 0;
};

describe('city load determinism', () => {
	it('same seed gives the same map, a different seed gives another', async () => {
		const engine = await loadMicropolisMainModule();
		const first = loadWithSeed(engine, 42);
		const second = loadWithSeed(engine, 42);
		const other = loadWithSeed(engine, 7);

		expect(mapHash(engine, second)).toBe(mapHash(engine, first));
		expect(mapHash(engine, other)).not.toBe(mapHash(engine, first));

		for (const micropolis of [first, second, other]) micropolis.delete();
	});
});
