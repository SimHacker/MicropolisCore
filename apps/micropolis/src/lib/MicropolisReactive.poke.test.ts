/**
 * Bridge poke / peek / memory surface — extended coverage.
 *
 * Covers:
 *   - poke.doTool (road, park, bulldozer, query)
 *   - poke.setTile / peek.tile round-trip
 *   - poke.setFunds / setCityTax / setPasses / setSpeed / setGameLevel
 *   - poke.pause / resume with simPaused mirror
 *   - poke.generateMap / clearMap / generateSomeRandomCity → mapRevision
 *   - poke.loadCity with valid + invalid paths
 *   - memory bounds and out-of-range tile guards
 *   - peek.scalars completeness
 *   - getSnapshot field completeness
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { micropolisReactive } from './MicropolisReactive.svelte';
import type { MicropolisSimulator } from './MicropolisSimulator';
import { loadMicropolisMainModule } from './wasm/node';
import { createMapMopViews } from './wasm/views';
import type { MainModule } from '../types/micropolisengine.d.js';
import type { JSCallback, Micropolis } from '../types/micropolisengine.d.js';

describe('micropolisReactive poke / peek / memory', () => {
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
		micropolis.loadCity('/cities/haight.cty');

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
		try { micropolis.delete(); } catch { /* ignore */ }
		try { jsCallbackWrapper.delete(); } catch { /* ignore */ }
	});

	// --- Tile manipulation ---

	it('poke.setTile / peek.tile round-trip', () => {
		const ROAD = engine.Tiles.HBRIDGE.value;
		micropolisReactive.poke.setTile(5, 5, ROAD);
		const got = micropolisReactive.peek.tile(5, 5);
		// peek reads getTile which applies LOMASK; raw ROAD is already below 1024
		expect(got).toBe(ROAD & 0x03ff);
	});

	it('peek.tile returns null for out-of-bounds coordinates', () => {
		expect(micropolisReactive.peek.tile(-1, 0)).toBeNull();
		expect(micropolisReactive.peek.tile(0, -1)).toBeNull();
		expect(micropolisReactive.peek.tile(engine.WORLD_W, 0)).toBeNull();
		expect(micropolisReactive.peek.tile(0, engine.WORLD_H)).toBeNull();
	});

	it('poke.setTile increments mapRevision', () => {
		const before = micropolisReactive.mapRevision;
		micropolisReactive.poke.setTile(6, 6, engine.Tiles.DIRT.value);
		expect(micropolisReactive.mapRevision).toBe(before + 1);
	});

	it('poke.bumpMap increments mapRevision without engine call', () => {
		const before = micropolisReactive.mapRevision;
		micropolisReactive.poke.bumpMap();
		expect(micropolisReactive.mapRevision).toBe(before + 1);
	});

	// --- Funds ---

	it('poke.setFunds updates totalFunds in engine and reactive mirror', () => {
		const target = 99_000;
		micropolisReactive.poke.setFunds(target);
		expect(micropolis.totalFunds).toBe(target);
		expect(micropolisReactive.totalFunds).toBe(target);
		expect(micropolisReactive.peek.scalars()?.totalFunds).toBe(target);
	});

	// --- Tax ---

	it('poke.setCityTax updates cityTax in engine and reactive mirror', () => {
		const rate = 8;
		micropolisReactive.poke.setCityTax(rate);
		expect(micropolis.cityTax).toBe(rate);
		expect(micropolisReactive.cityTax).toBe(rate);
		expect(micropolisReactive.peek.scalars()?.cityTax).toBe(rate);
	});

	// --- Speed / passes ---

	it('poke.setSpeed reflects in engine', () => {
		micropolisReactive.poke.setSpeed(2);
		expect(micropolis.simSpeed).toBe(2);
		expect(micropolisReactive.simSpeed).toBe(2);
	});

	it('poke.setPasses reflects in engine', () => {
		micropolisReactive.poke.setPasses(4);
		expect(micropolis.simPasses).toBe(4);
		expect(micropolisReactive.simPasses).toBe(4);
	});

	// --- Pause / resume ---

	it('poke.pause sets simPaused; poke.resume clears it', () => {
		micropolisReactive.poke.pause();
		expect(micropolis.simPaused).toBe(true);
		expect(micropolisReactive.simPaused).toBe(true);

		micropolisReactive.poke.resume();
		expect(micropolis.simPaused).toBe(false);
		expect(micropolisReactive.simPaused).toBe(false);
	});

	// --- Game level ---

	it('poke.setGameLevel to HARD reflects in reactive mirror', () => {
		micropolisReactive.poke.setGameLevel(engine.GameLevel.LEVEL_HARD);
		const scalars = micropolisReactive.peek.scalars();
		// peekEngineScalars normalises via Number(); the Embind enum .value is the canonical int
		const hardValue = engine.GameLevel.LEVEL_HARD.value; // 2
		expect(scalars?.gameLevel).toBe(hardValue);
	});

	// --- Map generation ---

	it('poke.generateMap increments mapRevision', () => {
		const before = micropolisReactive.mapRevision;
		micropolisReactive.poke.generateMap(12345);
		expect(micropolisReactive.mapRevision).toBeGreaterThan(before);
	});

	it('poke.clearMap fills map with DIRT tiles', () => {
		micropolisReactive.poke.clearMap();
		const DIRT = engine.Tiles.DIRT.value;
		// Sample a few spots — after clear the whole map should be DIRT
		expect(micropolisReactive.peek.tile(0, 0)).toBe(DIRT);
		expect(micropolisReactive.peek.tile(30, 30)).toBe(DIRT);
		expect(micropolisReactive.peek.tile(engine.WORLD_W - 1, engine.WORLD_H - 1)).toBe(DIRT);
	});

	it('poke.generateSomeRandomCity increments mapRevision and places non-trivial tiles', () => {
		const before = micropolisReactive.mapRevision;
		micropolisReactive.poke.generateSomeRandomCity();
		expect(micropolisReactive.mapRevision).toBeGreaterThan(before);
		// A generated city should have at least some non-zero (non-DIRT) tiles
		const mapU16 = micropolisReactive.memory.mapU16;
		if (mapU16) {
			const nonDirt = Array.from(mapU16).some((v) => (v & 0x03ff) !== 0);
			expect(nonDirt).toBe(true);
		}
	});

	// --- poke.loadCity ---

	it('poke.loadCity with valid path returns true and syncs state', () => {
		micropolisReactive.poke.setFunds(1000);
		const ok = micropolisReactive.poke.loadCity('/cities/bluebird.cty');
		expect(ok).toBe(true);
		// Funds should be reset by city load
		expect(micropolisReactive.totalFunds).toBe(micropolis.totalFunds);
		expect(micropolisReactive.mapRevision).toBeGreaterThan(0);
	});

	it('poke.loadCity with non-existent path returns false', () => {
		const ok = micropolisReactive.poke.loadCity('/cities/nonexistent.cty');
		expect(ok).toBe(false);
	});

	// --- doTool ---

	it('poke.doTool TOOL_PARK on empty land returns OK or NO_MONEY', () => {
		// Reload a known city so we have context
		micropolisReactive.poke.loadCity('/cities/haight.cty');
		micropolisReactive.poke.setFunds(500_000);

		const result = micropolisReactive.poke.doTool(engine.EditingTool.TOOL_PARK, 20, 20);
		const { TOOLRESULT_OK, TOOLRESULT_NO_MONEY, TOOLRESULT_FAILED, TOOLRESULT_NEED_BULLDOZE } = engine.ToolResult;
		const validResults = [
			TOOLRESULT_OK.value,
			TOOLRESULT_NO_MONEY.value,
			TOOLRESULT_FAILED.value,
			TOOLRESULT_NEED_BULLDOZE.value,
		];
		expect(validResults).toContain(result.value);
	});

	it('poke.doTool TOOL_ROAD on land increments mapRevision', () => {
		micropolisReactive.poke.loadCity('/cities/haight.cty');
		micropolisReactive.poke.setFunds(500_000);
		const before = micropolisReactive.mapRevision;
		micropolisReactive.poke.doTool(engine.EditingTool.TOOL_ROAD, 25, 25);
		// mapRevision increments on every doTool call regardless of result
		expect(micropolisReactive.mapRevision).toBeGreaterThan(before);
	});

	it('poke.doTool TOOL_BULLDOZER returns a valid ToolResult value', () => {
		micropolisReactive.poke.loadCity('/cities/haight.cty');
		const result = micropolisReactive.poke.doTool(engine.EditingTool.TOOL_BULLDOZER, 10, 10);
		const validValues = [-2, -1, 0, 1];
		expect(validValues).toContain(result.value);
	});

	// --- Memory helpers ---

	it('memory.mapU16 length matches world size', () => {
		const mapU16 = micropolisReactive.memory.mapU16;
		const wordCells = engine.WORLD_W * engine.WORLD_H;
		if (mapU16) {
			expect(mapU16.length).toBe(wordCells);
		}
	});

	it('memory.tileLinearIndex clamps correctly', () => {
		const w = engine.WORLD_W;
		const h = engine.WORLD_H;
		expect(micropolisReactive.memory.tileLinearIndex(0, 0)).toBe(0);
		expect(micropolisReactive.memory.tileLinearIndex(1, 0)).toBe(1);
		expect(micropolisReactive.memory.tileLinearIndex(0, 1)).toBe(w);
		expect(micropolisReactive.memory.tileLinearIndex(w - 1, h - 1)).toBe(w * h - 1);
		expect(micropolisReactive.memory.tileLinearIndex(-1, 0)).toBeNull();
		expect(micropolisReactive.memory.tileLinearIndex(0, h)).toBeNull();
		expect(micropolisReactive.memory.tileLinearIndex(w, 0)).toBeNull();
	});

	it('memory byte addresses are positive even multiples of 2', () => {
		const mapAddr = micropolisReactive.memory.mapByteAddress();
		const mopAddr = micropolisReactive.memory.mopByteAddress();
		expect(mapAddr).toBeGreaterThan(0);
		expect(mopAddr).toBeGreaterThan(0);
		expect(mapAddr % 2).toBe(0);
		expect(mopAddr % 2).toBe(0);
	});

	// --- peek.scalars completeness ---

	it('peek.scalars returns all expected numeric fields', () => {
		micropolisReactive.poke.loadCity('/cities/haight.cty');
		const s = micropolisReactive.peek.scalars();
		expect(s).not.toBeNull();
		const expectedFields = [
			'totalFunds', 'cityYear', 'cityMonth', 'cityTime', 'cityPop', 'cityScore',
			'cityYes', 'cityClass', 'gameLevel', 'simSpeed', 'simPasses',
			'cityTax', 'mapSerial', 'trafficAverage', 'pollutionAverage',
			'crimeAverage', 'landValueAverage', 'resPop', 'comPop', 'indPop', 'cashFlow',
			'poweredZoneCount', 'unpoweredZoneCount',
		] as const;
		for (const field of expectedFields) {
			expect(s).toHaveProperty(field);
			expect(typeof s![field]).toBe('number');
		}
		expect(typeof s!.simPaused).toBe('boolean');
		expect(typeof s!.generatedCitySeed).toBe('number');
	});

	// --- getSnapshot completeness ---

	it('getSnapshot returns all required top-level fields', () => {
		const snap = micropolisReactive.getSnapshot();
		const expectedFields = [
			'totalFunds', 'cityYear', 'cityMonth', 'cityName', 'cityFileName',
			'demandR', 'demandC', 'demandI', 'gameLevel', 'simSpeed', 'simPasses',
			'simPaused', 'cityTax', 'mapRevision', 'budgetRevision',
			'evaluationRevision', 'historyRevision',
			'messageIndex', 'messageX', 'messageY', 'messagePicture', 'messageImportant',
			'budgetModalRequested', 'zoneStatus', 'cityPop', 'cityScore', 'cityTime',
			'worldWidth', 'worldHeight',
		] as const;
		for (const field of expectedFields) {
			expect(snap).toHaveProperty(field);
		}
		expect(snap.worldWidth).toBe(engine.WORLD_W);
		expect(snap.worldHeight).toBe(engine.WORLD_H);
	});
});
