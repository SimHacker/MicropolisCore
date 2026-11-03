import { describe, it, expect } from 'vitest';
import { loadMicropolisMainModule } from './wasm/node';
import { createNoopJsCallback } from './wasm/callbacks';

describe('city save format', () => {
	it('writes a city file the same size as the one it loaded', async () => {
		const engine = await loadMicropolisMainModule();
		const micropolis = new engine.Micropolis();
		micropolis.setCallback(createNoopJsCallback(engine), {});
		micropolis.init();
		const city = '/cities/haight.cty';
		expect(micropolis.loadCity(city)).toBe(true);

		micropolis.saveCityAs('/saved.cty');
		expect(engine.FS_readFile('/saved.cty').length).toBe(engine.FS_readFile(city).length);

		micropolis.delete();
	});
});
