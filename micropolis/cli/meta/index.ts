/**
 * CLI self-description commands: `about` and `api`.
 *
 * `extendMetaCommands(argv)` registers compact, structured introspection for
 * humans, terminal agents, and external tools.
 */

import type { Argv } from 'yargs';
import { stringifyStructured } from '../lib/format.js';

const aboutPayload = {
	name: 'micropolis',
	purpose: 'One CLI for Micropolis city files, WASM simulation, and command-bus workflows.',
	inputFormats: ['command-line flags', 'json arguments where documented'],
	outputFormats: ['text', 'json', 'yaml', 'csv when tabular'],
	modules: [
		{
			name: 'city',
			path: 'cli/city',
			api: ['CityFile', 'ScenarioDefaults', 'getScenarioDefaults', 'extendCityCommands'],
			commands: ['city dump', 'city export', 'city info', 'city analyze', 'city edit', 'city patch-scenario']
		},
		{
			name: 'visualize',
			path: 'cli/city/visualize.ts',
			api: ['extendVisualizeCommands', 'CityFile map renderers'],
			commands: ['visualize ascii', 'visualize emoji', 'visualize mono', 'visualize map']
		},
		{
			name: 'sim',
			path: 'cli/wasm',
			api: ['extendSimCommands'],
			commands: ['sim info', 'sim smoke']
		},
		{
			name: 'bus',
			path: 'cli/bus',
			api: ['extendBusCommands'],
			commands: [
				'bus tools',
				'bus list',
				'bus preview',
				'bus propose',
				'bus dispatch',
				'bus record-dispatch',
				'bus proposals',
				'bus approve',
				'bus reject',
				'bus recordings'
			]
		}
	],
	examples: [
		'npm run micropolis -- about --format yaml',
		'npm run micropolis -- city info ../resources/cities/haight.cty --format yaml',
		'npm run micropolis -- city export ../resources/cities/haight.cty --include-map --format csv',
		'npm run micropolis -- sim smoke --ticks 10 --format yaml',
		'npm run micropolis -- bus list --format yaml'
	]
};

const apiPayload = {
	entry: 'cli/entry.ts',
	commandModules: {
		city: 'cli/city/register.ts',
		visualize: 'cli/city/visualize.ts',
		sim: 'cli/wasm/sim.ts',
		bus: 'cli/bus/index.ts',
		meta: 'cli/meta/index.ts'
	},
	sharedModules: {
		format: 'cli/lib/format.ts',
		constants: 'cli/constants/constants.js',
		cityFile: 'cli/city/city-file.js',
		visualize: 'cli/city/visualize.ts',
		endian: 'cli/city/endian.js',
		scenario: 'cli/city/scenario.js',
		wasmLoader: 'src/lib/wasm/node.ts',
		wasmBrowserLoader: 'src/lib/wasm/browser.ts',
		wasmMemory: 'src/lib/wasm/heap.ts',
		wasmViews: 'src/lib/wasm/views.ts',
		wasmCallbacks: 'src/lib/wasm/callbacks.ts',
		renderDescription: 'src/lib/render/description.ts',
		renderSoftware: 'src/lib/render/software.ts',
		renderRoute: 'src/routes/render/+page.svelte',
		i18nKeys: 'src/lib/i18n/keys.ts',
		commandBus: 'src/lib/CommandBus.ts',
		commandMcpService: 'src/lib/CommandMcpService.ts'
	},
	formats: {
		structured: ['json', 'yaml', 'yml'],
		tabular: ['csv'],
		text: ['human-readable text']
	}
};

function printPayload(payload: unknown, format: string) {
	console.log(stringifyStructured(payload, format === 'yml' ? 'yaml' : format));
}

export function extendMetaCommands(argv: Argv): Argv {
	return argv
		.command(
			'about',
			'Explain what this CLI is for',
			(y) =>
				y.option('format', {
					alias: 'f',
					type: 'string',
					default: 'yaml',
					choices: ['json', 'yaml', 'yml'],
					describe: 'Output format'
				}),
			(argv) => {
				printPayload(aboutPayload, String(argv.format));
			}
		)
		.command(
			'api',
			'Print module and command API map',
			(y) =>
				y.option('format', {
					alias: 'f',
					type: 'string',
					default: 'yaml',
					choices: ['json', 'yaml', 'yml'],
					describe: 'Output format'
				}),
			(argv) => {
				printPayload(apiPayload, String(argv.format));
			}
		);
}
