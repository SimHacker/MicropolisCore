/**
 * Crash sweep across every builtin city.
 *
 * Loads each city packaged into the WASM engine's virtual filesystem, ticks it
 * forward a few in-game turns, and fails if the engine traps — the symptom
 * being `RuntimeError: memory access out of bounds` out of `simTick()`.
 *
 * WHY THE CLOCK IS FROZEN
 *
 * These crashes look intermittent, but only because the engine seeds its RNG
 * from the wall clock before anything JS-side can seed it:
 *
 *   Micropolis::init()     -> simInit()  -> initWillStuff() -> randomlySeedRandom()
 *   Micropolis::loadCity() -> loadFile() -> initWillStuff() -> randomlySeedRandom()
 *                                       -> doSimInit() -> mapScan(0, WORLD_W)
 *                          -> doSimInit() -> mapScan(0, WORLD_W)   (again)
 *
 * randomlySeedRandom() (random.cpp) seeds `nextRandom` from gettimeofday(), and
 * the doSimInit() mapScans that follow run the zone simulation over the freshly
 * loaded city — doResidential/doCommercial/doIndustrial draw getRandom() and
 * *mutate map tiles*. Every process therefore starts from a slightly different
 * world, so a latent out-of-bounds access is hit on only some runs (kobe: ~60%
 * of runs at 480 ticks).
 *
 * The engine's only route to wall-clock time is `emscripten_date_now`, which
 * the generated glue defines as `() => Date.now()`. Freezing Date.now for the
 * setup phase pins that seed, which makes the crash reproduce on *every* run —
 * turning a flaky test into a deterministic one. That is the whole point: a
 * crash test that fires 60% of the time is worse than useless in CI.
 *
 * Sweeping several seeds widens coverage without giving up reproducibility:
 * each (city, seed) pair is a fixed, replayable starting world.
 *
 * Usage:
 *   pnpm --filter micropolis test cli/simCrash.test.ts
 *   SIM_CRASH_QUICK=1 pnpm --filter micropolis test cli/simCrash.test.ts   # kobe only
 *
 * Env knobs:
 *   SIM_CRASH_QUICK=1    only kobe, seed 42, 30 turns — the tightest reliable repro
 *   SIM_CRASH_TURNS=n    in-game turns per run (default 240)
 *   SIM_CRASH_SEEDS=a,b  seeds to sweep (default 1,42)
 *   SIM_CRASH_LIVE_CLOCK=1  don't freeze the clock — reproduces the flakiness
 *
 * WHAT THIS ORIGINALLY CAUGHT (now fixed — keep as regression coverage)
 *
 * Before the SimSprite construction fix, under a frozen clock:
 *   - kobe trapped at every seed tried (1, 42, 1234, 99999), from 30 turns up.
 *   - haight trapped at seed 1 past ~240 turns.
 *   - deadwood — the originally reported crasher — survived all four seeds at
 *     240 turns, so its reported crash needed a starting world these seeds do
 *     not reach.
 * The cause was Micropolis::newSprite() allocating SimSprite with malloc and
 * then assigning to its std::string member, which had never been constructed.
 * Defaults (240 turns x seeds {1, 42}) reproduce the two cities that used to
 * fail, so they stay as the regression floor; trim with SIM_CRASH_TURNS /
 * SIM_CRASH_QUICK when iterating.
 */

import { describe, expect, it } from 'vitest';
import { loadMicropolisMainModule } from '../src/lib/wasm/node';
import { createNoopJsCallback } from '../src/lib/wasm/callbacks';
import type { MainModule } from '../src/types/micropolisengine.d.js';

// Mirrors MicropolisSimulator.ts's cityFileNames — the cities preloaded into
// the WASM module's virtual filesystem, the only ones loadCity() can reach.
const BUILTIN_CITIES = [
	'about',
	'badnews',
	'bluebird',
	'bruce',
	'deadwood',
	'finnigan',
	'freds',
	'haight',
	'happisle',
	'joffburg',
	'kamakura',
	'kobe',
	'kowloon',
	'kyoto',
	'linecity',
	'med_isle',
	'ndulls',
	'neatmap',
	'radial',
	'scenario_bern',
	'scenario_boston',
	'scenario_detroit',
	'scenario_dullsville',
	'scenario_hamburg',
	'scenario_rio_de_janeiro',
	'scenario_san_francisco',
	'scenario_tokyo',
	'senri',
	'southpac',
	'splats',
	'wetcity',
	'yokohama'
] as const;

// Cities that used to trap out of bounds (kobe, haight) or were reported to
// (deadwood). Fixed now, but labelled in the test output so a regression here
// is immediately recognizable as the old bug returning.
const FORMER_CRASHERS = ['deadwood', 'haight', 'kobe'] as const;

// One turn is one cityTime increment = 16 ticks (simulate.cpp's 16-phase
// phaseCycle).
const TICKS_PER_TURN = 16;

// Any fixed value works; the engine only needs the seed to stop moving.
const FROZEN_NOW = 1_700_000_000_000;

const QUICK = process.env.SIM_CRASH_QUICK === '1';
const FREEZE_CLOCK = process.env.SIM_CRASH_LIVE_CLOCK !== '1';
const TURNS = Number(process.env.SIM_CRASH_TURNS ?? 240);
const SEEDS = (process.env.SIM_CRASH_SEEDS ?? '1,42').split(',').map((s) => Number(s.trim()));

// Quick mode is the tightest reliable repro: kobe traps within 30 turns at any
// seed, so it needs neither the long horizon nor the seed sweep. Pinned
// explicitly rather than taken from SEEDS[0] so reordering SIM_CRASH_SEEDS
// cannot quietly change what "quick" means.
const QUICK_CITY = 'kobe';
const QUICK_SEED = 42;
const QUICK_TURNS = 30;

const cities = QUICK ? [QUICK_CITY] : BUILTIN_CITIES;
const seeds = QUICK ? [QUICK_SEED] : SEEDS;
const turns = QUICK ? QUICK_TURNS : TURNS;

/**
 * Run one city forward and return normally, or throw whatever the engine threw.
 *
 * A fresh WASM module per run is deliberate: it guarantees a zero-filled heap,
 * so a trap is attributable to this city's trajectory and not to residue from a
 * previous run. It also sidesteps the uninitialized `Micropolis::callback`
 * pointer — setCallback() does `if (callback != NULL) delete callback` on a
 * field the constructor never sets, which traps ("table index is out of
 * bounds") for a second Micropolis allocated over freed memory.
 */
async function runCity(city: string, seed: number, runTurns: number): Promise<void> {
	const realDateNow = Date.now;
	if (FREEZE_CLOCK) Date.now = () => FROZEN_NOW;

	let engine: MainModule;
	try {
		engine = await loadMicropolisMainModule();
		const micropolis = new engine.Micropolis();
		micropolis.setCallback(createNoopJsCallback(engine), {});
		micropolis.init();

		const loaded = micropolis.loadCity(`/cities/${city}.cty`);
		expect(loaded, `loadCity failed for "${city}"`).toBe(true);

		// Only meaningful once the clock-seeded setup above is done; before that
		// initWillStuff() would just overwrite it.
		micropolis.seedRandom(seed);

		for (let tick = 0; tick < turns * TICKS_PER_TURN; tick++) {
			micropolis.simTick();
		}
	} finally {
		Date.now = realDateNow;
	}
}

describe(`builtin city crash sweep (${cities.length} cities x ${seeds.length} seed(s), ${turns} turns, clock ${FREEZE_CLOCK ? 'frozen' : 'live'})`, () => {
	for (const city of cities) {
		for (const seed of seeds) {
			const known = (FORMER_CRASHERS as readonly string[]).includes(city);
			const label = `${city} survives ${turns} turns (seed ${seed})${known ? ' [former crasher]' : ''}`;

			it(label, async () => {
				await expect(runCity(city, seed, turns)).resolves.toBeUndefined();
			});
		}
	}
});
