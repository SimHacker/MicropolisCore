import { describe, it, expect } from 'vitest';
import {
	assertWasmArtifactsPresent,
	loadMicropolisMainModule,
	createNoopJsCallback,
	createMapMopViews
} from './test-support/loadMicropolisWasm';

describe('Micropolis WASM loader', () => {
	it('finds wasm + data artifacts', () => {
		expect(() => assertWasmArtifactsPresent()).not.toThrow();
	});

	it('loads module and exposes world dimensions', async () => {
		const engine = await loadMicropolisMainModule();
		expect(engine.WORLD_W).toBeGreaterThan(0);
		expect(engine.WORLD_H).toBeGreaterThan(0);
		expect(engine.WORLD_W * engine.WORLD_H).toBeGreaterThan(0);
	});

	it('creates Micropolis with noop callback; map size matches world × tile bytes', async () => {
		const engine = await loadMicropolisMainModule();
		const micropolis = new engine.Micropolis();
		const cb = createNoopJsCallback(engine);
		micropolis.setCallback(cb, {});

		const wordCells = engine.WORLD_W * engine.WORLD_H;
		expect(micropolis.getMapSize()).toBe(wordCells * 2);
		expect(micropolis.getMopSize()).toBe(wordCells * 2);

		const mm = createMapMopViews(engine, micropolis);
		if (mm) {
			expect(mm.mapData.length).toBe(wordCells);
			expect(mm.mopData.length).toBe(wordCells);
		}

		micropolis.init();

		const loaded = micropolis.loadCity('/cities/haight.cty');
		expect(loaded).toBe(true);
		expect(micropolis.totalFunds).not.toBe(0);

		micropolis.delete();
	});
});
