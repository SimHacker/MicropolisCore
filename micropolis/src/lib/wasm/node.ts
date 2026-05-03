import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initModule from '../micropolisengine.js';
import type { MainModule } from '../../types/micropolisengine.d.js';

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
		return (await initModule({
			print: () => {},
			printErr: () => {},
			setStatus: () => {},
			locateFile: (filename: string) => path.join(projectLib, filename),
			wasmBinary,
			getPreloadedPackage: () => dataBinary
		})) as MainModule;
	} catch (nodeError) {
		if (!isBrowserOnlyEngineError(nodeError)) throw nodeError;
	}

	const previousWindow = (globalThis as { window?: unknown }).window;
	const previousProcess = (globalThis as { process?: unknown }).process;

	try {
		(globalThis as { window?: unknown }).window = {
			encodeURIComponent,
			location: { pathname: '/' }
		};
		(globalThis as { process?: unknown }).process = undefined;

		return (await initModule({
			print: () => {},
			printErr: () => {},
			setStatus: () => {},
			locateFile: (filename: string) => path.join(projectLib, filename),
			wasmBinary,
			getPreloadedPackage: () => dataBinary
		})) as MainModule;
	} finally {
		(globalThis as { window?: unknown }).window = previousWindow;
		(globalThis as { process?: unknown }).process = previousProcess;
	}
}
