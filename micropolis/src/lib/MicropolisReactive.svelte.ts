/**
 * Reactive façade over the Micropolis WASM engine: Embind callbacks update `$state`
 * here; UI and tooling import this module instead of touching `Micropolis` / heap views.
 *
 * Callbacks carry most context handlers need; use **peek** / **poke** / **memory** when you
 * must read authoritative WASM state, edit tiles, or scan linear map buffers.
 *
 * Attach once per shared simulator (`attach` / `detach` around the MicropolisView lifecycle).
 */

import type { EditingTool, GameLevel, Micropolis, JSCallback, ToolResult } from './types/micropolisengine.d.js';
import type { MicropolisSimulator } from './MicropolisSimulator';
import { heapU16FromEmscriptenModule } from './wasmHeap';

// --- Attached simulator (not exported; drives sync + optional actions) ---
let attachedSimulator = $state<MicropolisSimulator | null>(null);

function requireMicropolis(): Micropolis {
	const m = attachedSimulator?.micropolis;
	if (!m) {
		throw new Error('micropolisReactive: attach MicropolisSimulator before engine access');
	}
	return m;
}

// --- Reactive city / sim snapshot (callback-fed + syncFromEngine) ---
let totalFunds = $state(0);
let cityYear = $state(0);
let cityMonth = $state(0);
let cityName = $state('');
let cityFileName = $state('');
let demandR = $state(0);
let demandC = $state(0);
let demandI = $state(0);
let gameLevel = $state(0);
let simSpeed = $state(0);
let simPasses = $state(1);
let simPaused = $state(false);
let cityTax = $state(0);
let mapRevision = $state(0);
let budgetRevision = $state(0);
let evaluationRevision = $state(0);
let historyRevision = $state(0);

/** Last engine advisory (sendMessage). */
let messageIndex = $state(-1);
let messageX = $state(0);
let messageY = $state(0);
let messagePicture = $state(false);
let messageImportant = $state(false);

let budgetModalRequested = $state(false);

export type MicropolisZoneStatus =
	| { visible: false }
	| {
			visible: true;
			tileCategory: number;
			populationDensity: number;
			landValue: number;
			crimeRate: number;
			pollution: number;
			growthRate: number;
			x: number;
			y: number;
	  };

let zoneStatus = $state<MicropolisZoneStatus>({ visible: false });

/** Optional headline stats refreshed from the engine object (pull). */
let cityPop = $state(0);
let cityScore = $state(0);
let cityTime = $state(0);

function syncFromEngine(): void {
	const m = attachedSimulator?.micropolis;
	if (!m) return;
	totalFunds = m.totalFunds;
	cityYear = m.cityYear;
	cityMonth = m.cityMonth;
	cityName = m.cityName;
	cityFileName = m.cityFileName;
	gameLevel = Number(m.gameLevel as unknown);
	simSpeed = m.simSpeed;
	simPasses = m.simPasses;
	simPaused = m.simPaused;
	cityTax = m.cityTax;
	cityPop = m.cityPop;
	cityScore = m.cityScore;
	cityTime = m.cityTime;
}

/**
 * Embind callback object — pass to `new micropolisengine.JSCallback(...)`.
 * Singleton so the simulator always feeds the same reactive store.
 * (Embind adds ClassHandle methods on the wrapped object; plain TS class matches call surface.)
 */
class MicropolisReactiveCallback {
	autoGoto(_micropolis: Micropolis | null, _callbackVal: unknown, _x: number, _y: number, _message: string): void {
		/* Host may pan map; optional hook — no default state */
	}

	didGenerateMap(_micropolis: Micropolis | null, _callbackVal: unknown, _seed: number): void {
		syncFromEngine();
		mapRevision++;
	}

	didLoadCity(_micropolis: Micropolis | null, _callbackVal: unknown, _filename: string): void {
		syncFromEngine();
		mapRevision++;
	}

	didLoadScenario(_micropolis: Micropolis | null, _callbackVal: unknown, _name: string, _fname: string): void {
		syncFromEngine();
	}

	didLoseGame(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		syncFromEngine();
	}

	didSaveCity(_micropolis: Micropolis | null, _callbackVal: unknown, _filename: string): void {
		syncFromEngine();
	}

	didTool(_micropolis: Micropolis | null, _callbackVal: unknown, _name: string, _x: number, _y: number): void {
		mapRevision++;
	}

	didWinGame(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		syncFromEngine();
	}

	didntLoadCity(_micropolis: Micropolis | null, _callbackVal: unknown, _filename: string): void {
		/* keep prior snapshot */
	}

	didntSaveCity(_micropolis: Micropolis | null, _callbackVal: unknown, _filename: string): void {
		/* keep prior snapshot */
	}

	makeSound(
		_micropolis: Micropolis | null,
		_callbackVal: unknown,
		_channel: string,
		_sound: string,
		_x: number,
		_y: number
	): void {
		/* Audio layer can subscribe later */
	}

	newGame(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		syncFromEngine();
		mapRevision++;
	}

	saveCityAs(_micropolis: Micropolis | null, _callbackVal: unknown, _filename: string): void {
		syncFromEngine();
	}

	sendMessage(
		_micropolis: Micropolis | null,
		_callbackVal: unknown,
		index: number,
		x: number,
		y: number,
		picture: boolean,
		important: boolean
	): void {
		messageIndex = index;
		messageX = x;
		messageY = y;
		messagePicture = picture;
		messageImportant = important;
	}

	showBudgetAndWait(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		budgetModalRequested = true;
		budgetRevision++;
	}

	showZoneStatus(
		_micropolis: Micropolis | null,
		_callbackVal: unknown,
		tileCategoryIndex: number,
		populationDensityIndex: number,
		landValueIndex: number,
		crimeRateIndex: number,
		pollutionIndex: number,
		growthRateIndex: number,
		x: number,
		y: number
	): void {
		zoneStatus = {
			visible: true,
			tileCategory: tileCategoryIndex,
			populationDensity: populationDensityIndex,
			landValue: landValueIndex,
			crimeRate: crimeRateIndex,
			pollution: pollutionIndex,
			growthRate: growthRateIndex,
			x,
			y
		};
	}

	simulateRobots(_micropolis: Micropolis | null, _callbackVal: unknown): void {}

	simulateChurch(
		_micropolis: Micropolis | null,
		_callbackVal: unknown,
		_posX: number,
		_posY: number,
		_churchNumber: number
	): void {}

	startEarthquake(_micropolis: Micropolis | null, _callbackVal: unknown, _strength: number): void {
		mapRevision++;
	}

	startGame(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		syncFromEngine();
	}

	startScenario(_micropolis: Micropolis | null, _callbackVal: unknown, _scenario: number): void {
		syncFromEngine();
	}

	updateBudget(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		budgetRevision++;
	}

	updateCityName(_micropolis: Micropolis | null, _callbackVal: unknown, name: string): void {
		cityName = name;
	}

	updateDate(_micropolis: Micropolis | null, _callbackVal: unknown, year: number, month: number): void {
		cityYear = year;
		cityMonth = month;
	}

	updateDemand(_micropolis: Micropolis | null, _callbackVal: unknown, r: number, c: number, i: number): void {
		demandR = r;
		demandC = c;
		demandI = i;
	}

	updateEvaluation(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		evaluationRevision++;
	}

	updateFunds(_micropolis: Micropolis | null, _callbackVal: unknown, funds: number): void {
		totalFunds = funds;
	}

	updateGameLevel(_micropolis: Micropolis | null, _callbackVal: unknown, level: number): void {
		gameLevel = level;
	}

	updateHistory(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		historyRevision++;
	}

	updateMap(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		mapRevision++;
	}

	updateOptions(_micropolis: Micropolis | null, _callbackVal: unknown): void {
		syncFromEngine();
	}

	updatePasses(_micropolis: Micropolis | null, _callbackVal: unknown, passes: number): void {
		simPasses = passes;
	}

	updatePaused(_micropolis: Micropolis | null, _callbackVal: unknown, paused: boolean): void {
		simPaused = paused;
	}

	updateSpeed(_micropolis: Micropolis | null, _callbackVal: unknown, speed: number): void {
		simSpeed = speed;
	}

	updateTaxRate(_micropolis: Micropolis | null, _callbackVal: unknown, tax: number): void {
		cityTax = tax;
	}

	delete(): void {}
}

const engineCallbackSingleton = new MicropolisReactiveCallback() as unknown as JSCallback;

/** Fresh scalar read from the live `Micropolis` object (authoritative vs reactive mirror). */
export interface MicropolisEnginePeekScalars {
	totalFunds: number;
	cityYear: number;
	cityMonth: number;
	cityTime: number;
	cityPop: number;
	cityScore: number;
	cityYes: number;
	cityClass: number;
	gameLevel: number;
	simSpeed: number;
	simPasses: number;
	simPaused: boolean;
	cityTax: number;
	mapSerial: number;
	trafficAverage: number;
	pollutionAverage: number;
	crimeAverage: number;
	landValueAverage: number;
	generatedCitySeed: number;
	resPop: number;
	comPop: number;
	indPop: number;
	cashFlow: number;
	poweredZoneCount: number;
	unpoweredZoneCount: number;
}

export interface MicropolisReactiveSnapshot {
	totalFunds: number;
	cityYear: number;
	cityMonth: number;
	cityName: string;
	cityFileName: string;
	demandR: number;
	demandC: number;
	demandI: number;
	gameLevel: number;
	simSpeed: number;
	simPasses: number;
	simPaused: boolean;
	cityTax: number;
	mapRevision: number;
	budgetRevision: number;
	evaluationRevision: number;
	historyRevision: number;
	messageIndex: number;
	messageX: number;
	messageY: number;
	messagePicture: boolean;
	messageImportant: boolean;
	budgetModalRequested: boolean;
	zoneStatus: MicropolisZoneStatus;
	cityPop: number;
	cityScore: number;
	cityTime: number;
	worldWidth: number;
	worldHeight: number;
}

function peekEngineScalars(): MicropolisEnginePeekScalars | null {
	const m = attachedSimulator?.micropolis;
	if (!m) return null;
	return {
		totalFunds: m.totalFunds,
		cityYear: m.cityYear,
		cityMonth: m.cityMonth,
		cityTime: m.cityTime,
		cityPop: m.cityPop,
		cityScore: m.cityScore,
		cityYes: m.cityYes,
		cityClass: Number(m.cityClass as unknown),
		gameLevel: Number(m.gameLevel as unknown),
		simSpeed: m.simSpeed,
		simPasses: m.simPasses,
		simPaused: m.simPaused,
		cityTax: m.cityTax,
		mapSerial: m.mapSerial,
		trafficAverage: m.trafficAverage,
		pollutionAverage: m.pollutionAverage,
		crimeAverage: m.crimeAverage,
		landValueAverage: m.landValueAverage,
		generatedCitySeed: m.generatedCitySeed,
		resPop: m.resPop,
		comPop: m.comPop,
		indPop: m.indPop,
		cashFlow: m.cashFlow,
		poweredZoneCount: m.poweredZoneCount,
		unpoweredZoneCount: m.unpoweredZoneCount
	};
}

function memoryBounds(): { w: number; h: number } | null {
	const eng = attachedSimulator?.micropolisengine;
	if (!eng) return null;
	return { w: eng.WORLD_W as number, h: eng.WORLD_H as number };
}

function tileLinearIndex(x: number, y: number): number | null {
	const b = memoryBounds();
	if (!b) return null;
	if (x < 0 || y < 0 || x >= b.w || y >= b.h) return null;
	return y * b.w + x;
}

export const micropolisReactive = {
	get engineCallback(): JSCallback {
		return engineCallbackSingleton as JSCallback;
	},

	attach(sim: MicropolisSimulator): void {
		attachedSimulator = sim;
		syncFromEngine();
	},

	detach(): void {
		attachedSimulator = null;
	},

	syncFromEngine,

	/**
	 * Embind module (`WORLD_W`, `MapTileBits`, `EditingTool`, `Tiles`, …).
	 * Prefer callback context for UI; use this for tools and typed constants.
	 */
	get wasmModule(): MicropolisSimulator['micropolisengine'] | null {
		return attachedSimulator?.micropolisengine ?? null;
	},

	/**
	 * Direct WASM heap / layer views. Map and mop are the primary UI layers; `heapU16` is the
	 * full linear memory view — only touch word ranges you understand.
	 */
	memory: {
		get mapU16(): Uint16Array | null {
			return attachedSimulator?.mapData ?? null;
		},
		get mopU16(): Uint16Array | null {
			return attachedSimulator?.mopData ?? null;
		},
		get heapU16(): Uint16Array | null {
			const eng = attachedSimulator?.micropolisengine;
			return eng ? heapU16FromEmscriptenModule(eng) : null;
		},
		get mapWordLength(): number {
			const m = attachedSimulator?.micropolis;
			return m ? m.getMapSize() / 2 : 0;
		},
		get mopWordLength(): number {
			const m = attachedSimulator?.micropolis;
			return m ? m.getMopSize() / 2 : 0;
		},
		bounds: memoryBounds,
		tileLinearIndex,
		/** Byte addresses into linear WASM memory (for native tooling). */
		mapByteAddress(): number {
			return attachedSimulator?.micropolis?.getMapAddress() ?? 0;
		},
		mopByteAddress(): number {
			return attachedSimulator?.micropolis?.getMopAddress() ?? 0;
		}
	},

	/** Read-only accessors — synchronous pulls from the engine when callbacks are not enough. */
	peek: {
		scalars: peekEngineScalars,
		tile(x: number, y: number): number | null {
			const m = attachedSimulator?.micropolis;
			if (!m || tileLinearIndex(x, y) === null) return null;
			return m.getTile(x, y);
		}
	},

	/** Mutations through supported Embind APIs; bumps `mapRevision` when the map may change. */
	poke: {
		setTile(x: number, y: number, value: number): void {
			const m = requireMicropolis();
			if (tileLinearIndex(x, y) === null) return;
			m.setTile(x, y, value);
			mapRevision++;
		},
		setFunds(amount: number): void {
			requireMicropolis().setFunds(amount);
			syncFromEngine();
		},
		setCityTax(rate: number): void {
			requireMicropolis().setCityTax(rate);
			syncFromEngine();
		},
		setPasses(passes: number): void {
			requireMicropolis().setPasses(passes);
			syncFromEngine();
		},
		setSpeed(speed: number): void {
			requireMicropolis().setSpeed(speed);
			syncFromEngine();
		},
		setGameLevel(level: GameLevel): void {
			requireMicropolis().setGameLevel(level);
			syncFromEngine();
		},
		pause(): void {
			requireMicropolis().pause();
			syncFromEngine();
		},
		resume(): void {
			requireMicropolis().resume();
			syncFromEngine();
		},
		doTool(tool: EditingTool, x: number, y: number): ToolResult {
			const r = requireMicropolis().doTool(tool, x, y);
			mapRevision++;
			return r;
		},
		loadCity(path: string): boolean {
			const ok = requireMicropolis().loadCity(path);
			syncFromEngine();
			mapRevision++;
			return ok;
		},
		generateSomeRandomCity(): void {
			requireMicropolis().generateSomeRandomCity();
			syncFromEngine();
			mapRevision++;
		},
		clearMap(): void {
			requireMicropolis().clearMap();
			syncFromEngine();
			mapRevision++;
		},
		generateMap(seed: number): void {
			requireMicropolis().generateMap(seed);
			syncFromEngine();
			mapRevision++;
		},
		updateMaps(): void {
			requireMicropolis().updateMaps();
			mapRevision++;
		},
		updateEvaluation(): void {
			requireMicropolis().updateEvaluation();
			evaluationRevision++;
		},
		updateFundsFromEngine(): void {
			requireMicropolis().updateFunds();
			syncFromEngine();
		},
		/** After raw writes into `memory.mapU16`, bump observers. */
		bumpMap(): void {
			mapRevision++;
		}
	},

	clearBudgetModalRequest(): void {
		budgetModalRequested = false;
	},

	clearZoneStatus(): void {
		zoneStatus = { visible: false };
	},

	get attachedSimulator(): MicropolisSimulator | null {
		return attachedSimulator;
	},

	get totalFunds() {
		return totalFunds;
	},
	get cityYear() {
		return cityYear;
	},
	get cityMonth() {
		return cityMonth;
	},
	get cityName() {
		return cityName;
	},
	get cityFileName() {
		return cityFileName;
	},
	get demandR() {
		return demandR;
	},
	get demandC() {
		return demandC;
	},
	get demandI() {
		return demandI;
	},
	get gameLevel() {
		return gameLevel;
	},
	get simSpeed() {
		return simSpeed;
	},
	get simPasses() {
		return simPasses;
	},
	get simPaused() {
		return simPaused;
	},
	get cityTax() {
		return cityTax;
	},
	get mapRevision() {
		return mapRevision;
	},
	get budgetRevision() {
		return budgetRevision;
	},
	get evaluationRevision() {
		return evaluationRevision;
	},
	get historyRevision() {
		return historyRevision;
	},
	get messageIndex() {
		return messageIndex;
	},
	get messageX() {
		return messageX;
	},
	get messageY() {
		return messageY;
	},
	get messagePicture() {
		return messagePicture;
	},
	get messageImportant() {
		return messageImportant;
	},
	get budgetModalRequested() {
		return budgetModalRequested;
	},
	get zoneStatus() {
		return zoneStatus;
	},
	get cityPop() {
		return cityPop;
	},
	get cityScore() {
		return cityScore;
	},
	get cityTime() {
		return cityTime;
	},
	get worldWidth() {
		return attachedSimulator?.micropolisengine?.WORLD_W ?? 0;
	},
	get worldHeight() {
		return attachedSimulator?.micropolisengine?.WORLD_H ?? 0;
	},

	/** Plain object for JSON / MCP / tests — no WASM handles. */
	getSnapshot(): MicropolisReactiveSnapshot {
		return {
			totalFunds,
			cityYear,
			cityMonth,
			cityName,
			cityFileName,
			demandR,
			demandC,
			demandI,
			gameLevel,
			simSpeed,
			simPasses,
			simPaused,
			cityTax,
			mapRevision,
			budgetRevision,
			evaluationRevision,
			historyRevision,
			messageIndex,
			messageX,
			messageY,
			messagePicture,
			messageImportant,
			budgetModalRequested,
			zoneStatus,
			cityPop,
			cityScore,
			cityTime,
			worldWidth: attachedSimulator?.micropolisengine?.WORLD_W ?? 0,
			worldHeight: attachedSimulator?.micropolisengine?.WORLD_H ?? 0
		};
	}
};
