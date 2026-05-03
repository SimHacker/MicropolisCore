/**
 * City file (.cty) commands: `city`.
 * Exports `regionOptions`, `extendCityCommands`.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Argv } from 'yargs';
import {
  World,
  SaveFile,
  TileBits,
} from '../constants/constants.js';
import {
  stringifyStructured,
  cityExportToCsv,
  isStructuredFormat,
  normalizeStructuredFormat,
} from '../lib/format.js';
import { CityFile } from './city-file.js';
import { ScenarioDefaults, getScenarioDefaults } from './scenario.js';

export function regionOptions(yargs: Argv): Argv {
    return yargs
        .option('row', {
            type: 'number',
            describe: 'Starting row (Y) for region selection',
            default: 0
        })
        .option('col', {
            type: 'number',
            describe: 'Starting column (X) for region selection',
            default: 0
        })
        .option('width', {
            type: 'number',
            describe: 'Width of region selection',
            default: World.WIDTH
        })
        .option('height', {
            type: 'number',
            describe: 'Height of region selection',
            default: World.HEIGHT
        });
}

export function extendCityCommands(argv: Argv): Argv {
  return argv
        .command('city', 'City operations (file handling and analysis)', (yargs) => {
            return yargs
                .command('dump [file]', 'Dump raw city data', (yargs) => {
                    return yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        })
                        .option('brief', {
                            alias: 'b',
                            type: 'boolean',
                            default: false,
                            describe: 'Show only summary information'
                        });
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    console.log(`=== SimCity Save File Dump: ${path.basename(city.filename)} (${city.buffer.length} bytes) ===`);
                    console.log('Note: SimCity save files use big-endian (Motorola/MAC) byte ordering\n');
                    
                    // Display sections
                    let offset = 0;
                    for (const section of SaveFile.SECTIONS) {
                        if (section.optional && !city.hasMopData && section.name === 'Map Overlay Data') {
                            console.log(`=== No Map Overlay Data (standard .cty file) ===`);
                            continue;
                        }
                        
                        console.log(`=== ${section.name} (offset: ${offset}, size: ${section.size} bytes) ===`);
                        
                        if (!argv.brief) {
                            // Display a sample of the data (first few rows)
                            const sectionData = city.sections[section.name];
                            const sampleSize = Math.min(section.size, 160);
                            for (let i = 0; i < sampleSize; i += 32) {
                                const rowData = [];
                                for (let j = 0; j < 32 && i + j < section.size; j += 2) {
                                    const value = Endian.readShort(sectionData, i + j);
                                    rowData.push(value.toString(16).padStart(4, '0'));
                                }
                                console.log(`0x${(offset + i).toString(16).padStart(6, '0')}: ${rowData.join(' ')}`);
                            }
                            
                            if (section.size > sampleSize) {
                                console.log('...');
                            }
                        }
                        
                        console.log('');
                        offset += section.size;
                    }
                })
                
                .command('export [file]', 'Export city data', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        })
                        .option('format', {
                            alias: 'f',
                            choices: ['json', 'yaml', 'yml', 'csv'],
                            default: 'json',
                            describe: 'Export format (csv: tile grid as row,col,tile when --include-map; else one summary row)'
                        })
                        .option('include-map', {
                            type: 'boolean',
                            default: false,
                            describe: 'Include full map data in export'
                        })
                        .option('output', {
                            alias: 'o',
                            type: 'string',
                            describe: 'Output file path'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };

                    const exportData = city.toJSONForRegion(argv.includeMap, bounds);
                    const fmt = normalizeStructuredFormat(argv.format);
                    let body;
                    if (fmt === 'csv') {
                        body = cityExportToCsv(exportData);
                    } else {
                        body = stringifyStructured(exportData, argv.format);
                    }

                    if (argv.output) {
                        fs.writeFileSync(argv.output, body);
                        console.log(`Exported ${fmt} data to ${argv.output}`);
                    } else {
                        console.log(body);
                    }
                })
                
                .command('info [file]', 'Display city information and statistics', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        })
                        .option('format', {
                            alias: 'f',
                            choices: ['text', 'json', 'yaml', 'yml'],
                            default: 'text',
                            describe: 'Output format'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    const metadata = city.getMetadata();
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    const zoneCounts = city.getZoneCountsInRegion(bounds);
                    const region = city.calculateRegion(bounds);
                    
                    if (isStructuredFormat(argv.format)) {
                        console.log(stringifyStructured({
                            metadata,
                            region: {
                                startRow: region.startRow,
                                startCol: region.startCol,
                                width: region.width,
                                height: region.height
                            },
                            zoneCounts
                        }, argv.format));
                        return;
                    }
                    
                    // Text output
                    console.log(`=== City Information: ${metadata.filename} ===`);
                    console.log(`File Size: ${metadata.fileSize} bytes (${metadata.hasMopData ? 'with' : 'without'} map overlay data)`);
                    console.log(`City Time: ${metadata.cityTime} (Year ${metadata.cityYear})`);
                    console.log(`Funds: $${metadata.funds}`);
                    console.log(`Tax Rate: ${metadata.cityTax}%${metadata.cityTaxClamped ? ' (clamped from invalid value)' : ''}`);
                    console.log(`Simulation Speed: ${metadata.simSpeed}${metadata.simSpeedClamped ? ' (clamped from invalid value)' : ''}`);
                    console.log('');
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`=== Selected Region ===`);
                        console.log(`From: (${region.startCol}, ${region.startRow})`);
                        console.log(`To: (${region.endCol - 1}, ${region.endRow - 1})`);
                        console.log(`Size: ${region.width} x ${region.height} tiles`);
                        console.log('');
                    }
                    
                    const fmtFunding = (v) => v === null ? 'N/A (uninitialized)' : `${(v * 100).toFixed(1)}%`;
                    console.log('=== Funding Levels ===');
                    console.log(`Police: ${fmtFunding(metadata.funding.police)}`);
                    console.log(`Fire: ${fmtFunding(metadata.funding.fire)}`);
                    console.log(`Road: ${fmtFunding(metadata.funding.road)}`);
                    console.log('');
                    
                    console.log('=== Game Flags ===');
                    console.log(`Auto-Bulldoze: ${metadata.gameFlags.autoBulldoze ? 'ON' : 'OFF'}`);
                    console.log(`Auto-Budget: ${metadata.gameFlags.autoBudget ? 'ON' : 'OFF'}`);
                    console.log(`Auto-Goto: ${metadata.gameFlags.autoGoto ? 'ON' : 'OFF'}`);
                    console.log(`Sound: ${metadata.gameFlags.soundEnabled ? 'ON' : 'OFF'}`);
                    console.log('');
                    
                    console.log('=== Zone Counts ===');
                    console.log(`Residential Zones: ${zoneCounts.residential}`);
                    console.log(`Commercial Zones: ${zoneCounts.commercial}`);
                    console.log(`Industrial Zones: ${zoneCounts.industrial}`);
                    console.log(`Police Stations: ${zoneCounts.police}`);
                    console.log(`Fire Stations: ${zoneCounts.fire}`);
                    console.log(`Coal Power Plants: ${zoneCounts.coalPower}`);
                    console.log(`Nuclear Power Plants: ${zoneCounts.nuclearPower}`);
                    console.log(`Stadiums: ${zoneCounts.stadium}`);
                    console.log(`Seaports: ${zoneCounts.seaport}`);
                    console.log(`Airports: ${zoneCounts.airport}`);
                })
                
                .command('analyze [file]', 'Perform detailed analysis of city dynamics', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        })
                        .option('format', {
                            alias: 'f',
                            choices: ['text', 'json', 'yaml', 'yml'],
                            default: 'text',
                            describe: 'Output format'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    // Get basic data
                    const metadata = city.getMetadata();
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    const zoneCounts = city.getZoneCountsInRegion(bounds);
                    const region = city.calculateRegion(bounds);
                    
                    // RCI balance
                    const totalZones = zoneCounts.residential + zoneCounts.commercial + zoneCounts.industrial;
                    const resPercent = totalZones ? (zoneCounts.residential / totalZones * 100).toFixed(1) : 0;
                    const comPercent = totalZones ? (zoneCounts.commercial / totalZones * 100).toFixed(1) : 0;
                    const indPercent = totalZones ? (zoneCounts.industrial / totalZones * 100).toFixed(1) : 0;
                    
                    // Power analysis
                    const poweredTiles = city.countTilesWithAttributeInRegion(TileBits.PWRBIT, bounds);
                    const conductiveTiles = city.countTilesWithAttributeInRegion(TileBits.CONDBIT, bounds);
                    const powerConnectivity = conductiveTiles ? (poweredTiles / conductiveTiles * 100).toFixed(1) : 0;
                    
                    if (isStructuredFormat(argv.format)) {
                        console.log(stringifyStructured({
                            metadata,
                            region: {
                                startRow: region.startRow,
                                startCol: region.startCol,
                                width: region.width,
                                height: region.height
                            },
                            rci: {
                                residential: parseFloat(resPercent),
                                commercial: parseFloat(comPercent),
                                industrial: parseFloat(indPercent)
                            },
                            power: {
                                coalPlants: zoneCounts.coalPower,
                                nuclearPlants: zoneCounts.nuclearPower,
                                poweredTiles,
                                conductiveTiles,
                                connectivity: parseFloat(powerConnectivity)
                            },
                            services: {
                                police: {
                                    stations: zoneCounts.police,
                                    funding: metadata.funding.police
                                },
                                fire: {
                                    stations: zoneCounts.fire,
                                    funding: metadata.funding.fire
                                },
                                transportation: {
                                    seaports: zoneCounts.seaport,
                                    airports: zoneCounts.airport,
                                    funding: metadata.funding.road
                                }
                            }
                        }, argv.format));
                        return;
                    }
                    
                    // Text output
                    console.log(`=== City Analysis: ${metadata.filename} ===`);
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`=== Selected Region ===`);
                        console.log(`From: (${region.startCol}, ${region.startRow})`);
                        console.log(`To: (${region.endCol - 1}, ${region.endRow - 1})`);
                        console.log(`Size: ${region.width} x ${region.height} tiles`);
                        console.log('');
                    }
                    
                    console.log('=== RCI Balance ===');
                    console.log(`Residential: ${resPercent}%`);
                    console.log(`Commercial: ${comPercent}%`);
                    console.log(`Industrial: ${indPercent}%`);
                    console.log('');
                    
                    console.log('=== Power Infrastructure ===');
                    console.log(`Coal Plants: ${zoneCounts.coalPower}`);
                    console.log(`Nuclear Plants: ${zoneCounts.nuclearPower}`);
                    console.log(`Power Connectivity: ${powerConnectivity}%`);
                    console.log('');
                    
                    const fmtFund = (v) => v === null ? 'N/A' : `${(v * 100).toFixed(1)}%`;
                    console.log('=== Services ===');
                    console.log(`Police Stations: ${zoneCounts.police}`);
                    console.log(`Fire Stations: ${zoneCounts.fire}`);
                    console.log(`Police Funding: ${fmtFund(metadata.funding.police)}`);
                    console.log(`Fire Funding: ${fmtFund(metadata.funding.fire)}`);
                    console.log('');
                    
                    console.log('=== City Summary for LLM Analysis ===');
                    console.log(`City: ${metadata.filename}`);
                    console.log(`City Time: ${metadata.cityTime} (Year ${metadata.cityYear})`);
                    console.log(`Funds: $${metadata.funds}`);
                    console.log(`RCI Balance: Residential ${resPercent}%, Commercial ${comPercent}%, Industrial ${indPercent}%`);
                    console.log(`Power: ${zoneCounts.coalPower} Coal Plants, ${zoneCounts.nuclearPower} Nuclear, ${powerConnectivity}% connected`);
                    console.log(`Services: ${zoneCounts.police} police stations, ${zoneCounts.fire} fire stations`);
                    console.log(`Transport: ${zoneCounts.seaport} seaports, ${zoneCounts.airport} airports`);
                })
                
                .command('edit <file>', 'Edit city metadata and save', (yargs) => {
                    return yargs
                        .positional('file', {
                            describe: 'City file path to edit (modified in place)',
                            type: 'string'
                        })
                        .option('output', {
                            alias: 'o',
                            type: 'string',
                            describe: 'Write to a different file instead of editing in place'
                        })
                        .option('funds', {
                            type: 'number',
                            describe: 'Set total funds'
                        })
                        .option('year', {
                            type: 'number',
                            describe: 'Set city year (converted to cityTime ticks)'
                        })
                        .option('city-time', {
                            type: 'number',
                            describe: 'Set raw city time ticks'
                        })
                        .option('tax', {
                            type: 'number',
                            describe: 'Set tax rate (0-20)'
                        })
                        .option('speed', {
                            type: 'number',
                            describe: 'Set simulation speed (0-3)'
                        })
                        .option('police-funding', {
                            type: 'number',
                            describe: 'Set police funding percentage (0-100)'
                        })
                        .option('fire-funding', {
                            type: 'number',
                            describe: 'Set fire funding percentage (0-100)'
                        })
                        .option('road-funding', {
                            type: 'number',
                            describe: 'Set road funding percentage (0-100)'
                        })
                        .option('auto-bulldoze', {
                            type: 'boolean',
                            describe: 'Set auto-bulldoze flag'
                        })
                        .option('auto-budget', {
                            type: 'boolean',
                            describe: 'Set auto-budget flag'
                        })
                        .option('auto-goto', {
                            type: 'boolean',
                            describe: 'Set auto-goto flag'
                        })
                        .option('sound', {
                            type: 'boolean',
                            describe: 'Set sound enabled flag'
                        });
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    const updates = {};
                    if (argv.funds !== undefined) updates.funds = argv.funds;
                    if (argv.year !== undefined) updates.cityTime = ((argv.year - World.STARTING_YEAR) * 48) + 2;
                    if (argv['city-time'] !== undefined) updates.cityTime = argv['city-time'];
                    if (argv.tax !== undefined) {
                        if (argv.tax < 0 || argv.tax > 20) {
                            console.error('Tax rate must be 0-20');
                            return;
                        }
                        updates.cityTax = argv.tax;
                    }
                    if (argv.speed !== undefined) {
                        if (argv.speed < 0 || argv.speed > 3) {
                            console.error('Speed must be 0-3');
                            return;
                        }
                        updates.simSpeed = argv.speed;
                    }
                    if (argv['police-funding'] !== undefined) updates.policePercent = argv['police-funding'] / 100.0;
                    if (argv['fire-funding'] !== undefined) updates.firePercent = argv['fire-funding'] / 100.0;
                    if (argv['road-funding'] !== undefined) updates.roadPercent = argv['road-funding'] / 100.0;
                    if (argv['auto-bulldoze'] !== undefined) updates.autoBulldoze = argv['auto-bulldoze'];
                    if (argv['auto-budget'] !== undefined) updates.autoBudget = argv['auto-budget'];
                    if (argv['auto-goto'] !== undefined) updates.autoGoto = argv['auto-goto'];
                    if (argv.sound !== undefined) updates.soundEnabled = argv.sound;
                    
                    if (Object.keys(updates).length === 0) {
                        console.error('No edits specified. Use --funds, --year, --tax, --speed, etc.');
                        return;
                    }
                    
                    city.setMetadata(updates);
                    
                    const outFile = argv.output || argv.file;
                    city.save(outFile);
                    
                    // Show the result
                    const meta = city.getMetadata();
                    console.log(`Saved: ${path.basename(outFile)}`);
                    for (const [key, value] of Object.entries(updates)) {
                        console.log(`  ${key}: ${value}`);
                    }
                    console.log(`  → City Time: ${meta.cityTime} (Year ${meta.cityYear}), Funds: $${meta.funds}, Tax: ${meta.cityTax}%`);
                })
                
                .command('patch-scenario <file>', 'Patch a scenario .cty with the values the engine would inject', (yargs) => {
                    return yargs
                        .positional('file', {
                            describe: 'Scenario .cty file to patch',
                            type: 'string'
                        })
                        .option('output', {
                            alias: 'o',
                            type: 'string',
                            describe: 'Write to a different file instead of editing in place'
                        })
                        .option('dry-run', {
                            type: 'boolean',
                            default: false,
                            describe: 'Show what would be changed without writing'
                        });
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    const scenario = getScenarioDefaults(argv.file);
                    if (!scenario) {
                        console.error(`Not a recognized scenario file: ${path.basename(argv.file)}`);
                        console.error('Known scenarios: ' + 
                            Object.values(ScenarioDefaults)
                                .filter(s => s.file)
                                .map(s => s.file)
                                .join(', '));
                        return;
                    }
                    
                    const beforeMeta = city.getMetadata();
                    
                    // Apply the same values loadScenario() would inject
                    const updates = {
                        cityTime: scenario.cityTime,
                        funds: scenario.funds,
                        cityTax: scenario.cityTax,
                        simSpeed: scenario.simSpeed,
                        autoBulldoze: scenario.autoBulldoze,
                        autoBudget: scenario.autoBudget,
                        autoGoto: scenario.autoGoto,
                        soundEnabled: scenario.soundEnabled,
                        policePercent: scenario.policePercent,
                        firePercent: scenario.firePercent,
                        roadPercent: scenario.roadPercent
                    };
                    
                    console.log(`=== Patching Scenario: ${scenario.name} (${scenario.year}) ===`);
                    console.log('');
                    console.log('Before:');
                    console.log(`  City Time: ${beforeMeta.cityTime} (Year ${beforeMeta.cityYear})`);
                    console.log(`  Funds: $${beforeMeta.funds}`);
                    console.log(`  Tax: ${beforeMeta.cityTax}%${beforeMeta.cityTaxClamped ? ' (was invalid)' : ''}`);
                    console.log(`  Speed: ${beforeMeta.simSpeed}`);
                    console.log('');
                    console.log('After (from loadScenario):');
                    console.log(`  City Time: ${updates.cityTime} (Year ${scenario.year})`);
                    console.log(`  Funds: $${updates.funds}`);
                    console.log(`  Tax: ${updates.cityTax}%`);
                    console.log(`  Speed: ${updates.simSpeed}`);
                    console.log(`  Funding: police=${(updates.policePercent*100)}%, fire=${(updates.firePercent*100)}%, road=${(updates.roadPercent*100)}%`);
                    
                    if (argv['dry-run']) {
                        console.log('\n(dry run — no file written)');
                        return;
                    }
                    
                    city.setMetadata(updates);
                    const outFile = argv.output || argv.file;
                    city.save(outFile);
                    console.log(`\nWritten to: ${outFile}`);
                })
                
                .demandCommand(1, 'You need to specify a subcommand');
        })
        
}
