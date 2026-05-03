/**
 * Terminal city visualization commands: `visualize ascii|emoji|mono|map`.
 * Exports `extendVisualizeCommands(argv)`.
 */

import path from 'node:path';
import type { Argv } from 'yargs';
import { World } from '../constants/constants.js';
import { CityFile } from './city-file.js';
import { regionOptions } from './register.js';

type Bounds = {
	row?: number;
	col?: number;
	width?: number;
	height?: number;
};

function loadCityOrReport(file: string): CityFile | null {
	const city = new CityFile(file);
	if (!city.load()) {
		console.error(`Could not load file: ${file}`);
		return null;
	}
	return city;
}

function boundsFromArgv(argv: Bounds): Bounds {
	return {
		row: argv.row,
		col: argv.col,
		width: argv.width,
		height: argv.height
	};
}

function printRegionHeader(city: CityFile, bounds: Bounds, title: string) {
	const region = city.calculateRegion(bounds);
	const filename = city.filename === '-' ? 'stdin' : path.basename(city.filename);
	console.log(`=== ${title}: ${filename} ===`);
	if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
		console.log(`Region: (${region.startCol},${region.startRow}) to (${region.endCol - 1},${region.endRow - 1}), ${region.width}x${region.height} tiles`);
	}
}

function printVisualization(file: string, bounds: Bounds, title: string, render: (city: CityFile, bounds: Bounds) => string) {
	const city = loadCityOrReport(file);
	if (!city) return;
	printRegionHeader(city, bounds, title);
	console.log(render(city, bounds));
}

export function extendVisualizeCommands(argv: Argv): Argv {
	return argv.command('visualize', 'City visualization operations', (yargs) =>
		yargs
			.command(
				'ascii [file]',
				'Generate ASCII visualization',
				(yargs) =>
					regionOptions(
						yargs.positional('file', {
							describe: 'City file path (use "-" for stdin)',
							type: 'string',
							default: '-'
						})
					),
				(argv) => {
					printVisualization(String(argv.file), boundsFromArgv(argv), 'ASCII Visualization', (city, bounds) =>
						city.generateAsciiMapForRegion(bounds)
					);
				}
			)
			.command(
				'emoji [file]',
				'Generate emoji visualization',
				(yargs) =>
					regionOptions(
						yargs.positional('file', {
							describe: 'City file path (use "-" for stdin)',
							type: 'string',
							default: '-'
						})
					),
				(argv) => {
					printVisualization(String(argv.file), boundsFromArgv(argv), 'Emoji Visualization', (city, bounds) =>
						city.generateEmojiMapForRegion(bounds)
					);
				}
			)
			.command(
				'mono [file]',
				'Generate monospace visualization',
				(yargs) =>
					regionOptions(
						yargs.positional('file', {
							describe: 'City file path (use "-" for stdin)',
							type: 'string',
							default: '-'
						})
					),
				(argv) => {
					printVisualization(String(argv.file), boundsFromArgv(argv), 'Monospace Visualization', (city, bounds) =>
						city.generateMonoMapForRegion(bounds)
					);
				}
			)
			.command(
				'map [file]',
				'Generate a map visualization',
				(yargs) =>
					regionOptions(
						yargs
							.positional('file', {
								describe: 'City file path (use "-" for stdin)',
								type: 'string',
								default: '-'
							})
							.option('style', {
								choices: ['ascii', 'emoji', 'mono'],
								default: 'ascii',
								describe: 'Visualization style to use'
							})
					),
				(argv) => {
					const style = String(argv.style ?? 'ascii');
					printVisualization(String(argv.file), boundsFromArgv(argv), `${style.toUpperCase()} Map Visualization`, (city, bounds) => {
						if (style === 'emoji') return city.generateEmojiMapForRegion(bounds);
						if (style === 'mono') return city.generateMonoMapForRegion(bounds);
						return city.generateAsciiMapForRegion(bounds);
					});
				}
			)
			.demandCommand(1, 'Specify a visualization type')
	);
}
