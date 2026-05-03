/**
 * WASM engine subcommands: `micropolis sim smoke|info`.
 *
 * `extendSimCommands(argv)` adds the `sim` branch using the shared WASM loader.
 */

import type { Argv } from 'yargs';
import type { MainModule, Micropolis } from '../../src/types/micropolisengine.d.js';
import { createNoopJsCallback } from '../../src/lib/wasm/callbacks';
import { loadMicropolisMainModule } from '../../src/lib/wasm/node';
import { normalizeStructuredFormat, stringifyStructured } from '../lib/format.js';

type Flags = { city?: string; ticks?: number; format?: string };

function stringFlag(v: unknown, fallback: string): string {
	return typeof v === 'string' && v.length > 0 ? v : fallback;
}

function numberFlag(v: unknown, fallback: number): number {
	return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function summarize(
	engine: MainModule,
	micropolis: Micropolis,
	extra: { loaded: boolean; city: string; ticks: number }
) {
	return {
		handled: true,
		loaded: extra.loaded,
		city: extra.city,
		ticks: extra.ticks,
		engine: {
			worldWidth: engine.WORLD_W,
			worldHeight: engine.WORLD_H
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
			crimeAverage: micropolis.crimeAverage
		}
	};
}

async function runSmoke(flags: Flags) {
	const ticks = numberFlag(flags.ticks, 10);
	const city = stringFlag(flags.city, '/cities/haight.cty');
	const engine = await loadMicropolisMainModule();
	const micropolis = new engine.Micropolis();
	const cb = createNoopJsCallback(engine);
	micropolis.setCallback(cb, {});
	micropolis.init();
	try {
		const loaded = micropolis.loadCity(city);
		for (let i = 0; i < ticks; i += 1) micropolis.simTick();
		return summarize(engine, micropolis, { loaded, city, ticks });
	} finally {
		micropolis.delete();
	}
}

async function runInfo(flags: Flags) {
	const city = stringFlag(flags.city, '/cities/haight.cty');
	const engine = await loadMicropolisMainModule();
	const micropolis = new engine.Micropolis();
	const cb = createNoopJsCallback(engine);
	micropolis.setCallback(cb, {});
	micropolis.init();
	try {
		const loaded = micropolis.loadCity(city);
		return summarize(engine, micropolis, { loaded, city, ticks: 0 });
	} finally {
		micropolis.delete();
	}
}

function printStructured(value: unknown, format: string) {
	const f = normalizeStructuredFormat(format);
	if (f === 'csv') {
		throw new Error('sim output does not support csv; use json or yaml.');
	}
	console.log(stringifyStructured(value, format));
}

export function extendSimCommands(argv: Argv): Argv {
	return argv.command('sim', 'Run the Micropolis WASM engine headlessly', (y) =>
		y
			.command(
				'smoke',
				'Load a city, advance N simulation ticks, print state',
				(ys) =>
					ys
						.option('city', {
							type: 'string',
							default: '/cities/haight.cty',
							describe: 'Virtual path passed to loadCity (packaged .cty)'
						})
						.option('ticks', { type: 'number', default: 10, describe: 'Number of simTick() calls' })
						.option('format', {
							alias: 'f',
							type: 'string',
							default: 'json',
							choices: ['json', 'yaml', 'yml'],
							describe: 'Structured output format'
						}),
				async (argv) => {
					printStructured(await runSmoke(argv), stringFlag(argv.format, 'json'));
				}
			)
			.command(
				'info',
				'Load a city and print state without ticking',
				(ys) =>
					ys
						.option('city', {
							type: 'string',
							default: '/cities/haight.cty',
							describe: 'Virtual path passed to loadCity'
						})
						.option('format', {
							alias: 'f',
							type: 'string',
							default: 'json',
							choices: ['json', 'yaml', 'yml'],
							describe: 'Structured output format'
						}),
				async (argv) => {
					printStructured(await runInfo(argv), stringFlag(argv.format, 'json'));
				}
			)
			.demandCommand(1, 'Specify sim smoke or sim info')
	);
}
