#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initModule from '../src/lib/micropolisengine.js';
import type { JSCallback, MainModule, Micropolis } from '../src/types/micropolisengine.d.js';

type JsonRecord = Record<string, unknown>;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const engineDir = path.resolve(projectRoot, 'src/lib');
const wasmPath = path.join(engineDir, 'micropolisengine.wasm');
const dataPath = path.join(engineDir, 'micropolisengine.data');

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  try {
    switch (command) {
      case 'smoke':
        print(await smoke(parseFlags(rest)));
        break;

      case 'info':
        print(await info(parseFlags(rest)));
        break;

      default:
        usage(command);
        process.exit(command ? 1 : 0);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function smoke(flags: JsonRecord) {
  const ticks = numberFlag(flags.ticks, 10);
  const city = stringFlag(flags.city, '/cities/haight.cty');
  const { engine, micropolis } = await createHeadlessMicropolis();
  try {
    const loaded = micropolis.loadCity(city);
    for (let i = 0; i < ticks; i += 1) {
      micropolis.simTick();
    }
    return summarize(engine, micropolis, { loaded, city, ticks });
  } finally {
    micropolis.delete();
  }
}

async function info(flags: JsonRecord) {
  const city = stringFlag(flags.city, '/cities/haight.cty');
  const { engine, micropolis } = await createHeadlessMicropolis();
  try {
    const loaded = micropolis.loadCity(city);
    return summarize(engine, micropolis, { loaded, city, ticks: 0 });
  } finally {
    micropolis.delete();
  }
}

async function createHeadlessMicropolis(): Promise<{ engine: MainModule; micropolis: Micropolis; callback: JSCallback }> {
  assertEngineArtifacts();

  try {
    const engine = await loadEngineModule();
    const micropolis = new engine.Micropolis();
    const callback = new engine.JSCallback(createNoopCallback());
    micropolis.setCallback(callback, {});
    micropolis.init();
    return { engine, micropolis, callback };
  } catch (error) {
    throw new Error([
      'Failed to load Micropolis WASM in Node.',
      'Rebuild the engine with Node support first:',
      '  cd ../MicropolisEngine && make clean install',
      'The makefile should include -s ENVIRONMENT=web,worker,node.',
      'This script also attempts a compatibility shim for existing web-only artifacts.',
      `Original error: ${error instanceof Error ? error.message : String(error)}`,
    ].join('\n'));
  }
}

function createNoopCallback(): Record<string, (...args: unknown[]) => void> {
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
    'updateTaxRate',
  ];
  return Object.fromEntries(names.map((name) => [name, () => {}]));
}

async function loadEngineModule(): Promise<MainModule> {
  const wasmBinary = toArrayBuffer(readFileSync(wasmPath));
  const dataBinary = toArrayBuffer(readFileSync(dataPath));

  try {
    return await initModule({
      print: (message: string) => console.log('micropolisengine:', message),
      printErr: (message: string) => console.error('micropolisengine: ERROR:', message),
      setStatus: (status: string) => console.log('micropolisengine: status:', status),
      locateFile: (filename: string) => path.join(engineDir, filename),
      wasmBinary,
      getPreloadedPackage: () => dataBinary,
    });
  } catch (nodeError) {
    if (!isBrowserOnlyEngineError(nodeError)) {
      throw nodeError;
    }
  }

  const previousWindow = (globalThis as { window?: unknown }).window;
  const previousProcess = (globalThis as { process?: unknown }).process;

  try {
    // Existing checked-in artifacts were built for web/worker only. Supplying the
    // bytes directly and hiding process lets CLI smoke tests run until a node
    // enabled Emscripten rebuild is available.
    (globalThis as { window?: unknown }).window = {
      encodeURIComponent,
      location: { pathname: '/' },
    };
    (globalThis as { process?: unknown }).process = undefined;

    return await initModule({
      print: (message: string) => console.log('micropolisengine:', message),
      printErr: (message: string) => console.error('micropolisengine: ERROR:', message),
      setStatus: (status: string) => console.log('micropolisengine: status:', status),
      locateFile: (filename: string) => path.join(engineDir, filename),
      wasmBinary,
      getPreloadedPackage: () => dataBinary,
    });
  } finally {
    (globalThis as { window?: unknown }).window = previousWindow;
    (globalThis as { process?: unknown }).process = previousProcess;
  }
}

function isBrowserOnlyEngineError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('XMLHttpRequest is not defined')
    || message.includes('node environment detected but not enabled')
    || message.includes('not compiled for this environment');
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function summarize(
  engine: MainModule,
  micropolis: Micropolis,
  extra: { loaded: boolean; city: string; ticks: number },
) {
  return {
    handled: true,
    loaded: extra.loaded,
    city: extra.city,
    ticks: extra.ticks,
    engine: {
      worldWidth: engine.WORLD_W,
      worldHeight: engine.WORLD_H,
    },
    state: {
      cityName: String(micropolis.cityName ?? ''),
      cityYear: micropolis.cityYear,
      cityMonth: micropolis.cityMonth,
      cityTime: micropolis.cityTime,
      totalFunds: micropolis.totalFunds,
      cityTax: micropolis.cityTax,
      cityPop: micropolis.cityPop,
      cityScore: micropolis.cityScore,
      trafficAverage: micropolis.trafficAverage,
      pollutionAverage: micropolis.pollutionAverage,
      crimeAverage: micropolis.crimeAverage,
    },
  };
}

function assertEngineArtifacts() {
  const missing = [
    existsSync(wasmPath) ? undefined : wasmPath,
    existsSync(dataPath) ? undefined : dataPath,
  ].filter((value): value is string => !!value);

  if (missing.length > 0) {
    throw new Error([
      'Missing Micropolis WASM artifacts:',
      ...missing.map((file) => `  ${file}`),
      'Build them with:',
      '  cd ../MicropolisEngine && make install',
    ].join('\n'));
  }
}

function parseFlags(args: string[]): JsonRecord {
  const result: JsonRecord = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--city':
        result.city = requireValue(args, ++i, arg);
        break;
      case '--ticks':
        result.ticks = Number(requireValue(args, ++i, arg));
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

function stringFlag(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function numberFlag(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function print(value: unknown) {
  console.log(JSON.stringify(value, null, 2));
}

function usage(command?: string) {
  if (command) {
    console.error(`Unknown command: ${command}`);
  }

  console.log(`Usage:
  npm run sim:headless -- smoke [--city /cities/haight.cty] [--ticks 10]
  npm run sim:headless -- info [--city /cities/haight.cty]
`);
}

void main();
