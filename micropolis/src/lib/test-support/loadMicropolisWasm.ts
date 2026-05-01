/**
 * Shared Node loader for Micropolis WASM (used by headless CLI and Vitest).
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initModule from '../micropolisengine.js';
import type { JSCallback, MainModule, Micropolis } from '../types/micropolisengine.d.js';
import { heapU16FromEmscriptenModule } from '../wasmHeap';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectLib = path.resolve(moduleDir, '..');
const wasmPath = path.join(projectLib, 'micropolisengine.wasm');
const dataPath = path.join(projectLib, 'micropolisengine.data');

export function assertWasmArtifactsPresent(): void {
	const missing = [existsSync(wasmPath) ? undefined : wasmPath, existsSync(dataPath) ? undefined : dataPath].filter(
		(v): v is string => !!v
	);
	if (missing.length > 0) {
		throw new Error(
			['Missing Micropolis WASM artifacts:', ...missing.map((f) => `  ${f}`), 'Build: cd ../MicropolisEngine && make install'].join('\n')
		);
	}
}

export function toArrayBuffer(buffer: Buffer): ArrayBuffer {
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

function isBrowserOnlyEngineError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return (
		message.includes('XMLHttpRequest is not defined') ||
		message.includes('node environment detected but not enabled') ||
		message.includes('not compiled for this environment')
	);
}

export async function loadMicropolisMainModule(): Promise<MainModule> {
	assertWasmArtifactsPresent();
	const wasmBinary = toArrayBuffer(readFileSync(wasmPath));
	const dataBinary = toArrayBuffer(readFileSync(dataPath));

	try {
		return await initModule({
			print: () => {},
			printErr: () => {},
			setStatus: () => {},
			locateFile: (filename: string) => path.join(projectLib, filename),
			wasmBinary,
			getPreloadedPackage: () => dataBinary
		});
	} catch (nodeError) {
		if (!isBrowserOnlyEngineError(nodeError)) {
			throw nodeError;
		}
	}

	const previousWindow = (globalThis as { window?: unknown }).window;
	const previousProcess = (globalThis as { process?: unknown }).process;

	try {
		(globalThis as { window?: unknown }).window = {
			encodeURIComponent,
			location: { pathname: '/' }
		};
		(globalThis as { process?: unknown }).process = undefined;

		return await initModule({
			print: () => {},
			printErr: () => {},
			setStatus: () => {},
			locateFile: (filename: string) => path.join(projectLib, filename),
			wasmBinary,
			getPreloadedPackage: () => dataBinary
		});
	} finally {
		(globalThis as { window?: unknown }).window = previousWindow;
		(globalThis as { process?: unknown }).process = previousProcess;
	}
}

export function createNoopJsCallback(engine: MainModule): JSCallback {
	const names = [
		'autoGoto',
		'didGenerateMap',
		'didLoadCity',
		'didLoadScenario',
		'didLoseGame',
		'didSaveCity',
		'didTool',
		'didWinGame',
		'didntLoadCity',
		'didntSaveCity',
		'makeSound',
		'newGame',
		'saveCityAs',
		'sendMessage',
		'showBudgetAndWait',
		'showZoneStatus',
		'simulateRobots',
		'simulateChurch',
		'startEarthquake',
		'startGame',
		'startScenario',
		'updateBudget',
		'updateCityName',
		'updateDate',
		'updateDemand',
		'updateEvaluation',
		'updateFunds',
		'updateGameLevel',
		'updateHistory',
		'updateMap',
		'updateOptions',
		'updatePasses',
		'updatePaused',
		'updateSpeed',
		'updateTaxRate'
	] as const;
	return new engine.JSCallback(Object.fromEntries(names.map((name) => [name, () => {}])));
}

export type MapMopViews = {
	mapData: Uint16Array;
	mopData: Uint16Array;
};

/** Returns null when Emscripten did not expose a readable heap view (some Node / test loads). */
export function createMapMopViews(engine: MainModule, micropolis: Micropolis): MapMopViews | null {
	const heapU16 = heapU16FromEmscriptenModule(engine);
	if (!heapU16) {
		return null;
	}
	const mapStartAddress = micropolis.getMapAddress() / 2;
	const mapEndAddress = mapStartAddress + micropolis.getMapSize() / 2;
	const mapData = heapU16.subarray(mapStartAddress, mapEndAddress);
	const mopStartAddress = micropolis.getMopAddress() / 2;
	const mopEndAddress = mopStartAddress + micropolis.getMopSize() / 2;
	const mopData = heapU16.subarray(mopStartAddress, mopEndAddress);
	return { mapData, mopData };
}
