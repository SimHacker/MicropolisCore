#!/usr/bin/env node

/**
 * micropolis.js - Micropolis save file management and analysis tool
 * 
 * This utility provides command-line tools for working with SimCity/Micropolis save files.
 * It can read, analyze, visualize, and manipulate .cty and .mop files, offering various
 * representations and export formats suitable for both human and AI analysis.
 * 
 * Integrated with the Micropolis SvelteKit application.
 * 
 * Usage from project root:
 * npm run micropolis -- <command> [subcommand] [options]
 * npm run micropolis:info -- <file> [options]
 * 
 * Supports reading city files from stdin with '-' as the file parameter.
 */

import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {
    World,
    History,
    SaveFile,
    TileBits,
    TerrainTiles,
    TransportTiles,
    ZoneTiles,
    AnimationTiles,
    StringTables
} from './constants.js';

/**
 * Utility functions for endianness conversion
 */
const Endian = {
    /**
     * Swap bytes in a 16-bit value (convert between big-endian and little-endian)
     * @param {number} value - The 16-bit value to swap
     * @returns {number} - The byte-swapped value
     */
    swapShort: (value) => {
        return ((value & 0xFF) << 8) | ((value & 0xFF00) >> 8);
    },

    /**
     * Swap words in a 32-bit value (special handling for SimCity long values)
     * @param {number} value - The 32-bit value to swap
     * @returns {number} - The word-swapped value
     */
    halfSwapLong: (value) => {
        return ((value & 0x0000FFFF) << 16) | ((value & 0xFFFF0000) >> 16);
    },

    /**
     * Read a 16-bit big-endian value from a buffer
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The byte offset to read at
     * @returns {number} - The 16-bit value in host byte order
     */
    readShort: (buffer, offset) => {
        const value = buffer.readUInt16BE(offset);
        return value;
    },

    /**
     * Read a 32-bit big-endian value with SimCity-specific word order
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The byte offset to read at
     * @returns {number} - The 32-bit value in host byte order
     */
    readLong: (buffer, offset) => {
        // SimCity stores 32-bit values in a way that requires half-word swapping
        const highWord = buffer.readUInt16BE(offset);
        const lowWord = buffer.readUInt16BE(offset + 2);
        // In SimCity's format, we need to swap these words
        return (lowWord << 16) | highWord;
    },

    /**
     * Read a 32-bit IEEE-754 floating point value
     * @param {Buffer} buffer - The buffer to read from
     * @param {number} offset - The byte offset to read at
     * @returns {number} - The floating point value
     */
    readFloat: (buffer, offset) => {
        return buffer.readFloatBE(offset);
    }
};

/**
 * Base class for Micropolis city file handling
 */
class CityFile {
    constructor(filename) {
        this.filename = filename;
        this.buffer = null;
        this.hasMopData = false;
        this.sections = {};
    }

    /**
     * Load file data into memory
     */
    load() {
        try {
            // Handle stdin input when filename is '-'
            if (this.filename === '-') {
                // Read data from stdin
                try {
                    // Check if stdin is a TTY (terminal)
                    if (process.stdin.isTTY) {
                        console.error('Error: Cannot read from stdin in interactive mode');
                        return false;
                    }
                    
                    // For binary safety, read as Buffer
                    const stdinBuffer = fs.readFileSync(0); // fd 0 is stdin
                    this.buffer = stdinBuffer;
                    this.filename = 'stdin';
                } catch (e) {
                    console.error('Error reading from stdin:', e.message);
                    return false;
                }
            } else {
                this.buffer = fs.readFileSync(this.filename);
            }
            
            // Check file size to determine if it has MOP data
            this.hasMopData = (this.buffer.length === SaveFile.EXTENDED_FILE_SIZE);
            
            // Extract each section
            let offset = 0;
            for (const section of SaveFile.SECTIONS) {
                if (section.optional && !this.hasMopData && section.name === 'Map Overlay Data') {
                    // Skip optional section if not present
                    this.sections[section.name] = null;
                    continue;
                }
                
                this.sections[section.name] = this.buffer.subarray(offset, offset + section.size);
                offset += section.size;
            }
            
            return true;
        } catch (error) {
            console.error(`Error loading file: ${error.message}`);
            return false;
        }
    }

    /**
     * Get metadata about the city
     */
    getMetadata() {
        if (!this.buffer) {
            return null;
        }

        const miscHistSection = this.sections['Miscellaneous History'];
        
        // Extract key settings
        const cityTime = Endian.readLong(miscHistSection, History.CITY_TIME_INDEX * 2); 
        const funds = Endian.readLong(miscHistSection, History.FUNDS_INDEX * 2);
        
        // Game flags
        const autoBulldoze = Endian.readShort(miscHistSection, History.AUTO_BULLDOZE_INDEX * 2);
        const autoBudget = Endian.readShort(miscHistSection, History.AUTO_BUDGET_INDEX * 2);
        const autoGoto = Endian.readShort(miscHistSection, History.AUTO_GOTO_INDEX * 2);
        const soundEnabled = Endian.readShort(miscHistSection, History.SOUND_ENABLE_INDEX * 2);
        const cityTax = Endian.readShort(miscHistSection, History.TAX_RATE_INDEX * 2);
        const simSpeed = Endian.readShort(miscHistSection, History.SIM_SPEED_INDEX * 2);
        
        // Funding percentages (stored as floats)
        const policePercent = Endian.readFloat(miscHistSection, History.POLICE_FUNDING_INDEX * 2);
        const firePercent = Endian.readFloat(miscHistSection, History.FIRE_FUNDING_INDEX * 2);
        const roadPercent = Endian.readFloat(miscHistSection, History.ROAD_FUNDING_INDEX * 2);
        
        return {
            filename: this.filename === '-' ? 'stdin' : path.basename(this.filename),
            hasMopData: this.hasMopData,
            fileSize: this.buffer.length,
            cityTime,
            funds,
            gameFlags: {
                autoBulldoze: !!autoBulldoze,
                autoBudget: !!autoBudget,
                autoGoto: !!autoGoto,
                soundEnabled: !!soundEnabled
            },
            cityTax,
            simSpeed,
            funding: {
                police: policePercent,
                fire: firePercent,
                road: roadPercent
            }
        };
    }

    /**
     * Get a tile value at a specific position
     * @param {number} x - X coordinate (0-119)
     * @param {number} y - Y coordinate (0-99)
     * @returns {number} - The 16-bit tile value
     */
    getTile(x, y) {
        if (x < 0 || x >= World.WIDTH || y < 0 || y >= World.HEIGHT) {
            return 0;
        }
        
        const mapSection = this.sections['Map Data'];
        // Calculate offset ensuring column-major order (matching Micropolis C++ code)
        const offset = (x * World.HEIGHT + y) * World.TILE_SIZE_BYTES;
        return Endian.readShort(mapSection, offset);
    }

    /**
     * Get the base tile ID (without flags)
     * @param {number} tileValue - The 16-bit tile value
     * @returns {number} - The tile ID (0-1023)
     */
    getTileId(tileValue) {
        return tileValue & TileBits.LOMASK;
    }

    /**
     * Check if a tile has a specific attribute
     * @param {number} tileValue - The 16-bit tile value
     * @param {number} mask - The bit mask to check
     * @returns {boolean} - True if the tile has the attribute
     */
    hasTileAttribute(tileValue, mask) {
        return (tileValue & mask) !== 0;
    }

    /**
     * Calculate a valid tile region within map boundaries
     * @param {Object} bounds - The requested bounds {row, col, width, height}
     * @returns {Object} - The clipped bounds {startRow, startCol, endRow, endCol, width, height, isEmpty}
     */
    calculateRegion(bounds = {}) {
        // Default to full map if no bounds provided
        const row = bounds.row !== undefined ? bounds.row : 0;
        const col = bounds.col !== undefined ? bounds.col : 0;
        const width = bounds.width !== undefined ? bounds.width : World.WIDTH;
        const height = bounds.height !== undefined ? bounds.height : World.HEIGHT;
        
        // Clip to map boundaries
        const startCol = Math.max(0, Math.min(col, World.WIDTH - 1));
        const startRow = Math.max(0, Math.min(row, World.HEIGHT - 1));
        const endCol = Math.max(0, Math.min(col + width, World.WIDTH));
        const endRow = Math.max(0, Math.min(row + height, World.HEIGHT));
        
        // Calculate actual dimensions after clipping
        const clippedWidth = endCol - startCol;
        const clippedHeight = endRow - startRow;
        const isEmpty = clippedWidth <= 0 || clippedHeight <= 0;
        
        // Warn for degenerate cases
        if (isEmpty) {
            console.warn('Warning: Requested region has zero size after clipping to map boundaries');
        } else if (clippedWidth !== width || clippedHeight !== height) {
            console.warn('Warning: Requested region was clipped to map boundaries');
        }
        
        return {
            startRow,
            startCol,
            endRow,
            endCol,
            width: clippedWidth,
            height: clippedHeight,
            isEmpty
        };
    }

    /**
     * Get zone counts for a specific region
     * @param {Object} bounds - The bounds of the region to count
     * @returns {Object} - Counts for each zone type
     */
    getZoneCountsInRegion(bounds = {}) {
        const region = this.calculateRegion(bounds);
        
        if (region.isEmpty) {
            return {
                residential: 0,
                commercial: 0,
                industrial: 0,
                transportation: 0,
                power: 0,
                police: 0,
                fire: 0,
                stadium: 0,
                seaport: 0,
                airport: 0,
                coalPower: 0,
                nuclearPower: 0
            };
        }
        
        const counts = {
            residential: 0,
            commercial: 0,
            industrial: 0,
            transportation: 0,
            power: 0,
            police: 0,
            fire: 0,
            stadium: 0,
            seaport: 0,
            airport: 0,
            coalPower: 0,
            nuclearPower: 0
        };
        
        for (let y = region.startRow; y < region.endRow; y++) {
            for (let x = region.startCol; x < region.endCol; x++) {
                const tile = this.getTile(x, y);
                const tileId = this.getTileId(tile);
                const isZoneCenter = this.hasTileAttribute(tile, TileBits.ZONEBIT);
                
                if (!isZoneCenter) continue;
                
                // Check zone type ranges
                if (tileId >= ZoneTiles.RESZONE_START && tileId <= ZoneTiles.RESZONE_END) counts.residential++;
                else if (tileId >= ZoneTiles.COMZONE_START && tileId <= ZoneTiles.COMZONE_END) counts.commercial++;
                else if (tileId >= ZoneTiles.INDZONE_START && tileId <= ZoneTiles.INDZONE_END) counts.industrial++;
                else if (tileId === ZoneTiles.FIRESTATION) counts.fire++;
                else if (tileId === ZoneTiles.POLICESTATION) counts.police++;
                else if (tileId === ZoneTiles.STADIUM) counts.stadium++;
                else if (tileId === ZoneTiles.PORT) counts.seaport++;
                else if (tileId === ZoneTiles.AIRPORT) counts.airport++;
                else if (tileId === ZoneTiles.POWERPLANT) counts.coalPower++;
                else if (tileId === ZoneTiles.NUCLEAR) counts.nuclearPower++;
            }
        }
        
        return counts;
    }

    /**
     * Overrides the original getZoneCounts method to use the region version with default full-map region
     */
    getZoneCounts() {
        return this.getZoneCountsInRegion({});
    }

    /**
     * Count tiles with specific attribute in a region
     * @param {number} mask - The bit mask to check
     * @param {Object} bounds - The bounds of the region to count
     * @returns {number} - Count of matching tiles
     */
    countTilesWithAttributeInRegion(mask, bounds = {}) {
        const region = this.calculateRegion(bounds);
        
        if (region.isEmpty) {
            return 0;
        }
        
        let count = 0;
        
        for (let y = region.startRow; y < region.endRow; y++) {
            for (let x = region.startCol; x < region.endCol; x++) {
                const tile = this.getTile(x, y);
                if (this.hasTileAttribute(tile, mask)) {
                    count++;
                }
            }
        }
        
        return count;
    }

    /**
     * Overrides the original countTilesWithAttribute method to use the region version with default full-map region
     */
    countTilesWithAttribute(mask) {
        return this.countTilesWithAttributeInRegion(mask, {});
    }

    /**
     * Generate ASCII map for a specified region
     * @param {Object} bounds - The bounds of the region to render
     * @returns {string} - ASCII representation of the map region
     */
    generateAsciiMapForRegion(bounds = {}) {
        const region = this.calculateRegion(bounds);
        
        if (region.isEmpty) {
            return '(Empty region)\n';
        }
        
        // Use Unicode box-drawing and block characters for better visualization
        // Each tile is represented by 2 characters to maintain aspect ratio
        const tileChars = {
            empty: '  ',  // Empty space instead of characters
            water: '≈≈',    // Water
            tree: '♣♣',     // Trees
            rubble: '░░',   // Light shade for rubble
            roadH: '══',    // Horizontal road
            roadV: '║║',    // Vertical road
            roadC: '╬╬',    // Crossing
            power: '┼┼',    // Power lines
            rail: '╪╪',     // Rails
            // Zone centers (uppercase)
            resCenter: '▓▓', // Dark shade for residential zone center
            resEdge: '▒▒',   // Medium shade for residential edge
            comCenter: '██', // Full block for commercial zone center
            comEdge: '▌▐',   // Half blocks for commercial edge
            indCenter: '▛▜', // Mixed blocks for industrial zone center
            indEdge: '▞▚',   // Mixed blocks for industrial edge
            seaportCenter: '⚓⚓', // Anchor for seaport center
            seaportEdge: '⛵⛵',   // Boat for seaport edge
            airportCenter: '✈✈', // Airplane for airport center
            airportEdge: '🛫🛫',   // Departing plane for airport edge
            coalCenter: '♨♨',    // Hot springs for coal power center
            coalEdge: '🔋🔋',      // Battery for coal power edge
            fireCenter: '§§',    // Fire station center
            fireEdge: '🧯🧯',     // Extinguisher for fire station edge
            policeCenter: '⚔⚔',  // Police station center
            policeEdge: '🔱🔱',    // Trident for police station edge
            stadiumCenter: '◙◙',  // Stadium center
            stadiumEdge: '⌂⌂',    // House for stadium edge
            nuclearCenter: '☢☢',  // Nuclear sign for nuclear power center
            nuclearEdge: '⚠⚠',    // Warning for nuclear power edge
            hospitalCenter: '✚✚', // Cross for hospital center
            hospitalEdge: '⛑⛑',   // First aid for hospital edge
            churchCenter: '⛪⛪',   // Church center
            churchEdge: '🙏🙏',     // Praying hands for church edge
            burning: '††',        // Fire (cross symbol)
        };
        
        let result = '';
        
        // In Micropolis, map is stored in column-major order (x then y)
        // But for ASCII output, we want to output in rows (y then x)
        for (let y = region.startRow; y < region.endRow; y++) {
            for (let x = region.startCol; x < region.endCol; x++) {
                const tile = this.getTile(x, y);
                const tileId = this.getTileId(tile);
                const isPowered = this.hasTileAttribute(tile, TileBits.PWRBIT);
                const isZoneCenter = this.hasTileAttribute(tile, TileBits.ZONEBIT);
                
                // Assign box-drawing characters based on tile type
                let char = tileChars.empty;
                
                // Water
                if (tileId >= TerrainTiles.RIVER_START && tileId <= TerrainTiles.LASTRIVEDGE) {
                    char = tileChars.water;
                }
                // Trees
                else if (tileId >= TerrainTiles.WOODS_LOW && tileId <= TerrainTiles.WOODS_HIGH) {
                    char = tileChars.tree;
                }
                // Rubble
                else if (tileId >= TerrainTiles.RUBBLE_START && tileId <= TerrainTiles.RUBBLE_END) {
                    char = tileChars.rubble;
                }
                // Roads - handle horizontal, vertical and crossings differently
                else if ((tileId >= TransportTiles.HBRIDGE && tileId <= TransportTiles.VROADPOWER) || 
                        (tileId >= TransportTiles.LIGHT_TRAFFIC_START && tileId <= TransportTiles.HEAVY_TRAFFIC_END)) {
                    if (tileId === TransportTiles.ROADS || tileId === TransportTiles.ROADS2 || 
                        tileId === TransportTiles.HBRIDGE || tileId === TransportTiles.ROADLR) {
                        char = tileChars.roadH; // Horizontal road
                    } else if (tileId === TransportTiles.VBRIDGE || tileId === TransportTiles.ROADUD) {
                        char = tileChars.roadV; // Vertical road
                    } else {
                        char = tileChars.roadC; // Intersection or complex road
                    }
                }
                // Power lines
                else if (tileId >= TransportTiles.POWER_START && tileId <= TransportTiles.POWER_END) {
                    char = tileChars.power;
                }
                // Rail
                else if (tileId >= TransportTiles.RAIL_START && tileId <= TransportTiles.VRAILROAD) {
                    char = tileChars.rail;
                }
                // Residential - distinguish between zone center and edges
                else if ((tileId >= ZoneTiles.RESZONE_START && tileId <= ZoneTiles.RESZONE_END) || 
                        (tileId >= ZoneTiles.HOUSE_START && tileId <= ZoneTiles.RES_POPULATED_END)) {
                    if (isZoneCenter) {
                        char = isPowered ? 'RR' : 'rr';  // Zone center (uppercase when powered)
                    } else {
                        char = isPowered ? 'rr' : '.r';  // Zone edge (lowercase)
                    }
                }
                // Commercial - distinguish between zone center and edges
                else if ((tileId >= ZoneTiles.COMZONE_START && tileId <= ZoneTiles.COMZONE_END) || 
                        (tileId >= ZoneTiles.COM_POPULATED_START && tileId <= ZoneTiles.COM_POPULATED_END)) {
                    if (isZoneCenter) {
                        char = isPowered ? 'CC' : 'cc';  // Zone center (uppercase when powered)
                    } else {
                        char = isPowered ? 'cc' : '.c';  // Zone edge (lowercase)
                    }
                }
                // Industrial - distinguish between zone center and edges
                else if ((tileId >= ZoneTiles.INDZONE_START && tileId <= ZoneTiles.INDZONE_END) || 
                        (tileId >= ZoneTiles.IND_POPULATED_START && tileId <= ZoneTiles.IND_POPULATED_END)) {
                    if (isZoneCenter) {
                        char = isPowered ? 'II' : 'ii';  // Zone center (uppercase when powered)
                    } else {
                        char = isPowered ? 'ii' : '.i';  // Zone edge (lowercase)
                    }
                }
                // Seaport - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.PORT_START && tileId <= ZoneTiles.PORT_END) {
                    if (isZoneCenter) {
                        char = isPowered ? 'SS' : 'ss';  // Zone center (uppercase when powered)
                    } else {
                        char = isPowered ? 'ss' : '.s';  // Zone edge (lowercase)
                    }
                }
                // Airport - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.AIRPORT_START && tileId <= ZoneTiles.AIRPORT_END) {
                    if (isZoneCenter) {
                        char = isPowered ? 'AA' : 'aa';  // Zone center (uppercase when powered)
                    } else {
                        char = isPowered ? 'aa' : '.a';  // Zone edge (lowercase)
                    }
                }
                // Coal power - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.POWERPLANT_START && tileId <= ZoneTiles.POWERPLANT_END) {
                    if (isZoneCenter) {
                        char = 'PP';  // Zone center
                    } else {
                        char = 'pp';  // Zone edge
                    }
                }
                // Fire station - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.FIRESTATION_START && tileId <= ZoneTiles.FIRESTATION_END) {
                    if (isZoneCenter) {
                        char = 'FF';  // Zone center
                    } else {
                        char = 'ff';  // Zone edge
                    }
                }
                // Police station - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.POLICESTATION_START && tileId <= ZoneTiles.POLICESTATION_END) {
                    if (isZoneCenter) {
                        char = 'PP';  // Zone center
                    } else {
                        char = 'pp';  // Zone edge
                    }
                }
                // Stadium - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.STADIUM_START && tileId <= ZoneTiles.STADIUM_END) {
                    if (isZoneCenter) {
                        char = 'TT';  // Zone center
                    } else {
                        char = 'tt';  // Zone edge
                    }
                }
                // Nuclear power - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.NUCLEAR_START && tileId <= ZoneTiles.NUCLEAR_END) {
                    if (isZoneCenter) {
                        char = 'NN';  // Zone center
                    } else {
                        char = 'nn';  // Zone edge
                    }
                }
                // Hospital - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.HOSPITAL_START && tileId <= ZoneTiles.HOSPITAL_END) {
                    if (isZoneCenter) {
                        char = 'HH';  // Zone center
                    } else {
                        char = 'hh';  // Zone edge
                    }
                }
                // Church - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.CHURCH_START && tileId <= ZoneTiles.CHURCH_END) {
                    if (isZoneCenter) {
                        char = 'XX';  // Zone center (church)
                    } else {
                        char = 'xx';  // Zone edge
                    }
                }
                // Fire
                else if (tileId >= TerrainTiles.FIREBASE && tileId <= TerrainTiles.LASTFIRE) {
                    char = tileChars.burning;
                }
                
                result += char;
            }
            result += '\n';
        }
        
        return result;
    }

    /**
     * Generate monospace map for a specified region using fixed-width blocks
     * @param {Object} bounds - The bounds of the region to render
     * @returns {string} - Monospace block representation of the map region
     */
    generateMonoMapForRegion(bounds = {}) {
        const region = this.calculateRegion(bounds);
        
        if (region.isEmpty) {
            return '(Empty region)\n';
        }
        
        // These are fixed-width monospace characters that render as blocks
        const terrainChars = {
            empty: '  ',  // Empty space instead of characters
            water: '░░',    // Light shade
            tree: '▒▒',     // Medium shade
            rubble: '▓▓',   // Dark shade
            road: '══',     // Horizontal lines
            rail: '##',     // Hash
            power: '++',    // Plus signs
            resCenter: 'RR', // Residential center
            resEdge: 'rr',   // Residential edge
            comCenter: 'CC', // Commercial center
            comEdge: 'cc',   // Commercial edge
            indCenter: 'II', // Industrial center
            indEdge: 'ii',   // Industrial edge
            seaportCenter: 'SP',
            seaportEdge: 'sp',
            airportCenter: 'AP',
            airportEdge: 'ap',
            coalCenter: 'CP',
            coalEdge: 'cp',
            fireCenter: 'FS',
            fireEdge: 'fs',
            policeCenter: 'PS',
            policeEdge: 'ps',
            stadiumCenter: 'ST',
            stadiumEdge: 'st',
            nuclearCenter: 'NP',
            nuclearEdge: 'np',
            hospitalCenter: 'HS',
            hospitalEdge: 'hs',
            churchCenter: 'CH',
            churchEdge: 'ch',
            burning: '!!',
        };
        
        let result = '';
        
        // In Micropolis, map is stored in column-major order (x then y)
        // But for ASCII output, we want to output in rows (y then x)
        for (let y = region.startRow; y < region.endRow; y++) {
            for (let x = region.startCol; x < region.endCol; x++) {
                const tile = this.getTile(x, y);
                const tileId = this.getTileId(tile);
                const isPowered = this.hasTileAttribute(tile, TileBits.PWRBIT);
                const isZoneCenter = this.hasTileAttribute(tile, TileBits.ZONEBIT);
                
                // Assign fixed-width characters for each tile type
                let char = terrainChars.empty;
                
                // Water
                if (tileId >= TerrainTiles.RIVER_START && tileId <= TerrainTiles.LASTRIVEDGE) {
                    char = terrainChars.water;
                }
                // Trees
                else if (tileId >= TerrainTiles.WOODS_LOW && tileId <= TerrainTiles.WOODS_HIGH) {
                    char = terrainChars.tree;
                }
                // Rubble
                else if (tileId >= TerrainTiles.RUBBLE_START && tileId <= TerrainTiles.RUBBLE_END) {
                    char = terrainChars.rubble;
                }
                // Roads
                else if ((tileId >= TransportTiles.HBRIDGE && tileId <= TransportTiles.VROADPOWER) || 
                        (tileId >= TransportTiles.LIGHT_TRAFFIC_START && tileId <= TransportTiles.HEAVY_TRAFFIC_END)) {
                    char = terrainChars.road;
                }
                // Power lines
                else if (tileId >= TransportTiles.POWER_START && tileId <= TransportTiles.POWER_END) {
                    char = terrainChars.power;
                }
                // Rail
                else if (tileId >= TransportTiles.RAIL_START && tileId <= TransportTiles.VRAILROAD) {
                    char = terrainChars.rail;
                }
                // Residential - distinguish between zone center and edges
                else if ((tileId >= ZoneTiles.RESZONE_START && tileId <= ZoneTiles.RESZONE_END) || 
                        (tileId >= ZoneTiles.HOUSE_START && tileId <= ZoneTiles.RES_POPULATED_END)) {
                    char = isZoneCenter ? terrainChars.resCenter : terrainChars.resEdge;
                }
                // Commercial - distinguish between zone center and edges
                else if ((tileId >= ZoneTiles.COMZONE_START && tileId <= ZoneTiles.COMZONE_END) || 
                        (tileId >= ZoneTiles.COM_POPULATED_START && tileId <= ZoneTiles.COM_POPULATED_END)) {
                    char = isZoneCenter ? terrainChars.comCenter : terrainChars.comEdge;
                }
                // Industrial - distinguish between zone center and edges
                else if ((tileId >= ZoneTiles.INDZONE_START && tileId <= ZoneTiles.INDZONE_END) || 
                        (tileId >= ZoneTiles.IND_POPULATED_START && tileId <= ZoneTiles.IND_POPULATED_END)) {
                    char = isZoneCenter ? terrainChars.indCenter : terrainChars.indEdge;
                }
                // Seaport - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.PORT_START && tileId <= ZoneTiles.PORT_END) {
                    char = isZoneCenter ? terrainChars.seaportCenter : terrainChars.seaportEdge;
                }
                // Airport - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.AIRPORT_START && tileId <= ZoneTiles.AIRPORT_END) {
                    char = isZoneCenter ? terrainChars.airportCenter : terrainChars.airportEdge;
                }
                // Coal power - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.POWERPLANT_START && tileId <= ZoneTiles.POWERPLANT_END) {
                    char = isZoneCenter ? terrainChars.coalCenter : terrainChars.coalEdge;
                }
                // Fire station - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.FIRESTATION_START && tileId <= ZoneTiles.FIRESTATION_END) {
                    char = isZoneCenter ? terrainChars.fireCenter : terrainChars.fireEdge;
                }
                // Police station - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.POLICESTATION_START && tileId <= ZoneTiles.POLICESTATION_END) {
                    char = isZoneCenter ? terrainChars.policeCenter : terrainChars.policeEdge;
                }
                // Stadium - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.STADIUM_START && tileId <= ZoneTiles.STADIUM_END) {
                    char = isZoneCenter ? terrainChars.stadiumCenter : terrainChars.stadiumEdge;
                }
                // Nuclear power - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.NUCLEAR_START && tileId <= ZoneTiles.NUCLEAR_END) {
                    char = isZoneCenter ? terrainChars.nuclearCenter : terrainChars.nuclearEdge;
                }
                // Hospital - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.HOSPITAL_START && tileId <= ZoneTiles.HOSPITAL_END) {
                    char = isZoneCenter ? terrainChars.hospitalCenter : terrainChars.hospitalEdge;
                }
                // Church - distinguish between zone center and edges
                else if (tileId >= ZoneTiles.CHURCH_START && tileId <= ZoneTiles.CHURCH_END) {
                    char = isZoneCenter ? terrainChars.churchCenter : terrainChars.churchEdge;
                }
                // Fire
                else if (tileId >= TerrainTiles.FIREBASE && tileId <= TerrainTiles.LASTFIRE) {
                    char = terrainChars.burning;
                }
                
                result += char;
            }
            result += '\n';
        }
        
        return result;
    }

    /**
     * Generate emoji map for a specified region
     * @param {Object} bounds - The bounds of the region to render
     * @returns {string} - Emoji representation of the map region
     */
    generateEmojiMapForRegion(bounds = {}) {
        const region = this.calculateRegion(bounds);
        
        if (region.isEmpty) {
            return '(Empty region)\n';
        }
        
        let result = '';
        
        // In Micropolis, map is stored in column-major order (x then y)
        // But for display output, we want to output in rows (y then x)
        for (let y = region.startRow; y < region.endRow; y++) {
            for (let x = region.startCol; x < region.endCol; x++) {
                const tile = this.getTile(x, y);
                const tileId = this.getTileId(tile);
                const isPowered = this.hasTileAttribute(tile, TileBits.PWRBIT);
                const isZoneCenter = this.hasTileAttribute(tile, TileBits.ZONEBIT);
                
                // Get emoji based on tile type
                let emoji = ' '; // Default: empty/dirt (just a space character)
                
                // Water
                if (tileId >= TerrainTiles.RIVER_START && tileId <= TerrainTiles.LASTRIVEDGE) emoji = '🌊';
                
                // Trees
                else if (tileId >= TerrainTiles.WOODS_LOW && tileId <= TerrainTiles.WOODS_HIGH) emoji = '🌲';
                
                // Rubble
                else if (tileId >= TerrainTiles.RUBBLE_START && tileId <= TerrainTiles.RUBBLE_END) emoji = '🏚️';
                
                // Roads and traffic
                else if (tileId >= TransportTiles.HBRIDGE && tileId <= TransportTiles.LASTROAD) {
                    if (tileId >= TransportTiles.HEAVY_TRAFFIC_START && tileId <= TransportTiles.HEAVY_TRAFFIC_END) {
                        emoji = '🚗';
                    } else if (tileId >= TransportTiles.LIGHT_TRAFFIC_START && tileId <= TransportTiles.LIGHT_TRAFFIC_END) {
                        emoji = '🛣️';
                    } else {
                        emoji = '🛣️';
                    }
                }
                
                // Power lines
                else if (tileId >= TransportTiles.POWER_START && tileId <= TransportTiles.POWER_END) emoji = '⚡';
                
                // Rail
                else if (tileId >= TransportTiles.RAIL_START && tileId <= TransportTiles.VRAILROAD) emoji = '🚂';
                
                // Residential
                else if ((tileId >= ZoneTiles.RESZONE_START && tileId <= ZoneTiles.RESZONE_END) || 
                         (tileId >= ZoneTiles.HOUSE_START && tileId <= ZoneTiles.RES_POPULATED_END)) {
                    if (isZoneCenter) {
                        emoji = isPowered ? '🏠' : '🏚️';
                    } else {
                        emoji = '🏘️';
                    }
                }
                
                // Commercial
                else if ((tileId >= ZoneTiles.COMZONE_START && tileId <= ZoneTiles.COMZONE_END) || 
                         (tileId >= ZoneTiles.COM_POPULATED_START && tileId <= ZoneTiles.COM_POPULATED_END)) {
                    if (isZoneCenter) {
                        emoji = isPowered ? '🏢' : '🏙️';
                    } else {
                        emoji = '🏪';
                    }
                }
                
                // Industrial
                else if ((tileId >= ZoneTiles.INDZONE_START && tileId <= ZoneTiles.INDZONE_END) || 
                         (tileId >= ZoneTiles.IND_POPULATED_START && tileId <= ZoneTiles.IND_POPULATED_END)) {
                    if (isZoneCenter) {
                        emoji = isPowered ? '🏭' : '🏗️';
                    } else {
                        emoji = '🏗️';
                    }
                }
                
                // Seaport
                else if (tileId >= ZoneTiles.PORT_START && tileId <= ZoneTiles.PORT_END) {
                    if (isZoneCenter) {
                        emoji = isPowered ? '🚢' : '⚓';
                    } else {
                        emoji = '⛴️';
                    }
                }
                
                // Airport
                else if (tileId >= ZoneTiles.AIRPORT_START && tileId <= ZoneTiles.AIRPORT_END) {
                    if (isZoneCenter) {
                        emoji = isPowered ? '✈️' : '🛬';
                    } else {
                        emoji = '🛩️';
                    }
                }
                
                // Coal power
                else if (tileId >= ZoneTiles.POWERPLANT_START && tileId <= ZoneTiles.POWERPLANT_END) {
                    if (isZoneCenter) {
                        emoji = '🔌';
                    } else {
                        emoji = '🏢';
                    }
                }
                
                // Fire station
                else if (tileId >= ZoneTiles.FIRESTATION_START && tileId <= ZoneTiles.FIRESTATION_END) {
                    if (isZoneCenter) {
                        emoji = '🚒';
                    } else {
                        emoji = '🧯';
                    }
                }
                
                // Police station
                else if (tileId >= ZoneTiles.POLICESTATION_START && tileId <= ZoneTiles.POLICESTATION_END) {
                    if (isZoneCenter) {
                        emoji = '👮';
                    } else {
                        emoji = '🚓';
                    }
                }
                
                // Stadium
                else if (tileId >= ZoneTiles.STADIUM_START && tileId <= ZoneTiles.STADIUM_END) {
                    if (isZoneCenter) {
                        emoji = '🏟️';
                    } else {
                        emoji = '🎪';
                    }
                }
                
                // Nuclear power
                else if (tileId >= ZoneTiles.NUCLEAR_START && tileId <= ZoneTiles.NUCLEAR_END) {
                    if (isZoneCenter) {
                        emoji = '☢️';
                    } else {
                        emoji = '⚠️';
                    }
                }
                
                // Hospital
                else if (tileId >= ZoneTiles.HOSPITAL_START && tileId <= ZoneTiles.HOSPITAL_END) {
                    if (isZoneCenter) {
                        emoji = '🏥';
                    } else {
                        emoji = '⛑️';
                    }
                }
                
                // Church
                else if (tileId >= ZoneTiles.CHURCH_START && tileId <= ZoneTiles.CHURCH_END) {
                    if (isZoneCenter) {
                        emoji = '⛪';
                    } else {
                        emoji = '🙏';
                    }
                }
                
                // Fire disaster
                else if (tileId >= TerrainTiles.FIREBASE && tileId <= TerrainTiles.LASTFIRE) emoji = '🔥';
                
                result += emoji;
            }
            result += '\n';
        }
        
        return result;
    }

    /**
     * Overrides the original generateAsciiMap method to use the region version with default full-map region
     */
    generateAsciiMap() {
        return this.generateAsciiMapForRegion({});
    }

    /**
     * Overrides to generate emoji map for the entire map
     */
    generateEmojiMap() {
        return this.generateEmojiMapForRegion({});
    }

    /**
     * Overrides to generate monospace map for the entire map
     */
    generateMonoMap() {
        return this.generateMonoMapForRegion({});
    }

    /**
     * Generate a JSON representation of the city data for a specific region
     * @param {boolean} includeMap - Whether to include the full map data
     * @param {Object} bounds - The bounds of the region to analyze
     * @returns {Object} - JSON-compatible object with city data
     */
    toJSONForRegion(includeMap = false, bounds = {}) {
        const region = this.calculateRegion(bounds);
        
        const json = {
            metadata: this.getMetadata(),
            region: {
                startRow: region.startRow,
                startCol: region.startCol,
                width: region.width,
                height: region.height
            },
            zones: this.getZoneCountsInRegion(bounds),
            poweredBuildings: this.countTilesWithAttributeInRegion(TileBits.PWRBIT, bounds),
            conductiveBuildings: this.countTilesWithAttributeInRegion(TileBits.CONDBIT, bounds),
            flammableBuildings: this.countTilesWithAttributeInRegion(TileBits.BURNBIT, bounds),
            zoneCount: this.countTilesWithAttributeInRegion(TileBits.ZONEBIT, bounds)
        };
        
        if (includeMap && !region.isEmpty) {
            json.map = [];
            for (let y = region.startRow; y < region.endRow; y++) {
                const row = [];
                for (let x = region.startCol; x < region.endCol; x++) {
                    row.push(this.getTile(x, y));
                }
                json.map.push(row);
            }
        } else if (includeMap) {
            json.map = [];
        }
        
        return json;
    }

    /**
     * Overrides the original toJSON method to use the region version with default full-map region
     */
    toJSON(includeMap = false) {
        return this.toJSONForRegion(includeMap, {});
    }

    /**
     * Apply dynamic filter to check if a tile matches specified conditions
     * @param {Number} col - Column coordinate
     * @param {Number} row - Row coordinate
     * @param {Object} filters - Filter conditions 
     * @returns {Boolean} - True if tile matches all filter conditions
     */
    dynamicFilter(col, row, filters = {}) {
        // TODO: Implement the full filtering logic
        
        // Sample implementation (just for placeholder)
        // In the future, we'll extract actual data from city maps
        const dummyData = {
            populationDensity: ((col + row) % 255),
            rateOfGrowth: ((col - row) % 512) - 256,  // Range from -256 to +255
            trafficDensity: ((col * row) % 255),
            pollutionDensity: ((col * 2 + row) % 255),
            crimeRate: ((col + row * 3) % 255),
            landValue: ((col * col + row) % 255),
            policeEffect: (255 - ((col - 60) * (col - 60) + (row - 50) * (row - 50)) % 255),
            fireEffect: (255 - ((col - 40) * (col - 40) + (row - 40) * (row - 40)) % 255),
        };
        
        // Logic copied from Micropolis dynamicFilter function
        return (
            // Population density check
            ((filters.populationMin > filters.populationMax) ||
             (dummyData.populationDensity >= filters.populationMin) &&
             (dummyData.populationDensity <= filters.populationMax)) &&
            
            // Rate of growth check
            ((filters.growthRateMin > filters.growthRateMax) ||
             (dummyData.rateOfGrowth >= filters.growthRateMin) &&
             (dummyData.rateOfGrowth <= filters.growthRateMax)) &&
            
            // Traffic density check
            ((filters.trafficMin > filters.trafficMax) ||
             (dummyData.trafficDensity >= filters.trafficMin) &&
             (dummyData.trafficDensity <= filters.trafficMax)) &&
            
            // Pollution check
            ((filters.pollutionMin > filters.pollutionMax) ||
             (dummyData.pollutionDensity >= filters.pollutionMin) &&
             (dummyData.pollutionDensity <= filters.pollutionMax)) &&
            
            // Crime rate check
            ((filters.crimeMin > filters.crimeMax) ||
             (dummyData.crimeRate >= filters.crimeMin) &&
             (dummyData.crimeRate <= filters.crimeMax)) &&
            
            // Land value check
            ((filters.landValueMin > filters.landValueMax) ||
             (dummyData.landValue >= filters.landValueMin) &&
             (dummyData.landValue <= filters.landValueMax)) &&
            
            // Police effect check
            ((filters.policeMin > filters.policeMax) ||
             (dummyData.policeEffect >= filters.policeMin) &&
             (dummyData.policeEffect <= filters.policeMax)) &&
            
            // Fire effect check
            ((filters.fireMin > filters.fireMax) ||
             (dummyData.fireEffect >= filters.fireMin) &&
             (dummyData.fireEffect <= filters.fireMax))
        );
    }
    
    /**
     * Generate a filtered map visualization
     * @param {Object} bounds - Map bounds to display
     * @param {Object} filters - Filter conditions
     * @param {String} style - Visualization style ('ascii', 'emoji', 'mono')
     * @returns {String} - Visualization of the filtered map
     */
    generateFilteredMap(bounds = {}, filters = {}, style = 'ascii') {
        const region = this.calculateRegion(bounds);
        
        if (region.isEmpty) {
            return '(Empty region)\n';
        }
        
        // Default filter values (include everything)
        const defaultFilters = {
            populationMin: 0,
            populationMax: 255,
            growthRateMin: -256,
            growthRateMax: 255,
            trafficMin: 0,
            trafficMax: 255,
            pollutionMin: 0,
            pollutionMax: 255,
            crimeMin: 0,
            crimeMax: 255,
            landValueMin: 0,
            landValueMax: 255,
            policeMin: 0,
            policeMax: 255,
            fireMin: 0,
            fireMax: 255
        };
        
        // Apply provided filters over defaults
        const activeFilters = {...defaultFilters, ...filters};
        
        // Generate base map according to style
        let baseMap;
        switch (style) {
            case 'emoji':
                baseMap = this.generateEmojiMapForRegion(bounds);
                break;
            case 'mono':
                baseMap = this.generateMonoMapForRegion(bounds);
                break;
            case 'ascii':
            default:
                baseMap = this.generateAsciiMapForRegion(bounds);
                break;
        }
        
        // TODO: Actually implement filter-based highlighting
        // For now, we're just returning the base map
        
        return baseMap;
    }
}

/**
 * Add common region options to command builder
 * @param {Object} yargs - The yargs builder object
 * @returns {Object} - The yargs builder with region options
 */
function regionOptions(yargs) {
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

/**
 * Setup the command-line interface using yargs
 */
function setupCLI() {
    yargs(hideBin(process.argv))
        .usage('micropolis <command> [subcommand] [options]')
        .option('v', {
            alias: 'verbose',
            type: 'boolean',
            description: 'Run with verbose logging'
        })
        
        // City operations commands (includes both file and analysis operations)
        .command('city', 'City operations (file handling and analysis)', (yargs) => {
            return yargs
                // File operation commands (moved from 'file')
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
                            choices: ['json', 'csv'],
                            default: 'json',
                            describe: 'Export format'
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
                    
                    if (argv.format === 'json') {
                        // Use the region bounds if specified
                        const bounds = {
                            row: argv.row,
                            col: argv.col,
                            width: argv.width,
                            height: argv.height
                        };
                        
                        const jsonData = city.toJSONForRegion(argv.includeMap, bounds);
                        
                        if (argv.output) {
                            fs.writeFileSync(argv.output, JSON.stringify(jsonData, null, 2));
                            console.log(`Exported JSON data to ${argv.output}`);
                        } else {
                            console.log(JSON.stringify(jsonData, null, 2));
                        }
                    } else if (argv.format === 'csv') {
                        console.error('CSV export not yet implemented');
                    }
                })
                
                // City analysis commands (from original 'city' command)
                .command('info [file]', 'Display city information and statistics', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        })
                        .option('format', {
                            alias: 'f',
                            choices: ['text', 'json'],
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
                    
                    if (argv.format === 'json') {
                        console.log(JSON.stringify({
                            metadata,
                            region: {
                                startRow: region.startRow,
                                startCol: region.startCol,
                                width: region.width,
                                height: region.height
                            },
                            zoneCounts
                        }, null, 2));
                        return;
                    }
                    
                    // Text output
                    console.log(`=== City Information: ${metadata.filename} ===`);
                    console.log(`File Size: ${metadata.fileSize} bytes (${metadata.hasMopData ? 'with' : 'without'} map overlay data)`);
                    console.log(`City Time: ${metadata.cityTime}`);
                    console.log(`Funds: $${metadata.funds}`);
                    console.log(`Tax Rate: ${metadata.cityTax}%`);
                    console.log(`Simulation Speed: ${metadata.simSpeed}`);
                    console.log('');
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`=== Selected Region ===`);
                        console.log(`From: (${region.startCol}, ${region.startRow})`);
                        console.log(`To: (${region.endCol - 1}, ${region.endRow - 1})`);
                        console.log(`Size: ${region.width} x ${region.height} tiles`);
                        console.log('');
                    }
                    
                    console.log('=== Funding Levels ===');
                    console.log(`Police: ${(metadata.funding.police * 100).toFixed(1)}%`);
                    console.log(`Fire: ${(metadata.funding.fire * 100).toFixed(1)}%`);
                    console.log(`Road: ${(metadata.funding.road * 100).toFixed(1)}%`);
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
                            choices: ['text', 'json'],
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
                    
                    if (argv.format === 'json') {
                        console.log(JSON.stringify({
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
                        }, null, 2));
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
                    
                    console.log('=== Services ===');
                    console.log(`Police Stations: ${zoneCounts.police}`);
                    console.log(`Fire Stations: ${zoneCounts.fire}`);
                    console.log(`Police Funding: ${(metadata.funding.police * 100).toFixed(1)}%`);
                    console.log(`Fire Funding: ${(metadata.funding.fire * 100).toFixed(1)}%`);
                    console.log('');
                    
                    console.log('=== City Summary for LLM Analysis ===');
                    console.log(`City: ${metadata.filename}`);
                    console.log(`City Time: ${metadata.cityTime}`);
                    console.log(`Funds: $${metadata.funds}`);
                    console.log(`RCI Balance: Residential ${resPercent}%, Commercial ${comPercent}%, Industrial ${indPercent}%`);
                    console.log(`Power: ${zoneCounts.coalPower} Coal Plants, ${zoneCounts.nuclearPower} Nuclear, ${powerConnectivity}% connected`);
                    console.log(`Services: ${zoneCounts.police} police stations, ${zoneCounts.fire} fire stations`);
                    console.log(`Transport: ${zoneCounts.seaport} seaports, ${zoneCounts.airport} airports`);
                })
                
                .demandCommand(1, 'You need to specify a subcommand');
        })
        
        // Visualization commands
        .command('visualize', 'City visualization operations', (yargs) => {
            return yargs
                .command('ascii [file]', 'Generate ASCII visualization', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    const region = city.calculateRegion(bounds);
                    const filename = city.filename === '-' ? 'stdin' : path.basename(city.filename);
                    
                    console.log(`=== ASCII Visualization: ${filename} ===`);
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`Region: (${region.startCol},${region.startRow}) to (${region.endCol - 1},${region.endRow - 1}), ${region.width}x${region.height} tiles`);
                    }
                    
                    console.log(city.generateAsciiMapForRegion(bounds));
                })
                
                .command('emoji [file]', 'Generate emoji visualization', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    const region = city.calculateRegion(bounds);
                    const filename = city.filename === '-' ? 'stdin' : path.basename(city.filename);
                    
                    console.log(`=== Emoji Visualization: ${filename} ===`);
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`Region: (${region.startCol},${region.startRow}) to (${region.endCol - 1},${region.endRow - 1}), ${region.width}x${region.height} tiles`);
                    }
                    
                    console.log(city.generateEmojiMapForRegion(bounds));
                })
                
                .command('mono [file]', 'Generate monospace visualization', (yargs) => {
                    return regionOptions(yargs
                        .positional('file', {
                            describe: 'City file path (use "-" for stdin)',
                            type: 'string',
                            default: '-'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    const region = city.calculateRegion(bounds);
                    const filename = city.filename === '-' ? 'stdin' : path.basename(city.filename);
                    
                    console.log(`=== Monospace Visualization: ${filename} ===`);
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`Region: (${region.startCol},${region.startRow}) to (${region.endCol - 1},${region.endRow - 1}), ${region.width}x${region.height} tiles`);
                    }
                    
                    console.log(city.generateMonoMapForRegion(bounds));
                })
                
                .command('map [file]', 'Generate a map visualization (not yet implemented)', (yargs) => {
                    return regionOptions(yargs
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
                        .option('overlay', {
                            choices: ['all', 'traffic', 'pollution', 'landvalue'],
                            default: 'all',
                            describe: 'Map overlay to display'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    const region = city.calculateRegion(bounds);
                    const filename = city.filename === '-' ? 'stdin' : path.basename(city.filename);
                    
                    console.log(`=== ${argv.style.toUpperCase()} Map Visualization: ${filename} ===`);
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`Region: (${region.startCol},${region.startRow}) to (${region.endCol - 1},${region.endRow - 1}), ${region.width}x${region.height} tiles`);
                    }
                    
                    let visualization = '';
                    switch(argv.style) {
                        case 'ascii':
                            visualization = city.generateAsciiMapForRegion(bounds);
                            break;
                        case 'emoji':
                            visualization = city.generateEmojiMapForRegion(bounds);
                            break;
                        case 'mono':
                            visualization = city.generateMonoMapForRegion(bounds);
                            break;
                        default:
                            visualization = city.generateAsciiMapForRegion(bounds);
                    }
                    
                    console.log(visualization);
                })
                
                .command('filter [file]', 'Show areas matching specific criteria', (yargs) => {
                    return regionOptions(yargs
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
                        // Population density filters
                        .option('population-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum population density'
                        })
                        .option('population-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum population density'
                        })
                        // Growth rate filters
                        .option('growth-min', {
                            type: 'number',
                            default: -256,
                            describe: 'Minimum rate of growth'
                        })
                        .option('growth-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum rate of growth'
                        })
                        // Traffic filters
                        .option('traffic-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum traffic density'
                        })
                        .option('traffic-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum traffic density'
                        })
                        // Pollution filters
                        .option('pollution-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum pollution level'
                        })
                        .option('pollution-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum pollution level'
                        })
                        // Crime filters
                        .option('crime-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum crime rate'
                        })
                        .option('crime-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum crime rate'
                        })
                        // Land value filters
                        .option('landvalue-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum land value'
                        })
                        .option('landvalue-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum land value'
                        })
                        // Police coverage filters
                        .option('police-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum police coverage'
                        })
                        .option('police-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum police coverage'
                        })
                        // Fire coverage filters
                        .option('fire-min', {
                            type: 'number',
                            default: 0,
                            describe: 'Minimum fire coverage'
                        })
                        .option('fire-max', {
                            type: 'number',
                            default: 255,
                            describe: 'Maximum fire coverage'
                        }));
                }, (argv) => {
                    const city = new CityFile(argv.file);
                    if (!city.load()) {
                        console.error(`Could not load file: ${argv.file}`);
                        return;
                    }
                    
                    // Use the region bounds if specified
                    const bounds = {
                        row: argv.row,
                        col: argv.col,
                        width: argv.width,
                        height: argv.height
                    };
                    
                    // Create filter object from command-line arguments
                    const filters = {
                        populationMin: argv['population-min'],
                        populationMax: argv['population-max'],
                        growthRateMin: argv['growth-min'],
                        growthRateMax: argv['growth-max'],
                        trafficMin: argv['traffic-min'],
                        trafficMax: argv['traffic-max'],
                        pollutionMin: argv['pollution-min'],
                        pollutionMax: argv['pollution-max'],
                        crimeMin: argv['crime-min'],
                        crimeMax: argv['crime-max'],
                        landValueMin: argv['landvalue-min'],
                        landValueMax: argv['landvalue-max'],
                        policeMin: argv['police-min'],
                        policeMax: argv['police-max'],
                        fireMin: argv['fire-min'],
                        fireMax: argv['fire-max']
                    };
                    
                    const region = city.calculateRegion(bounds);
                    const filename = city.filename === '-' ? 'stdin' : path.basename(city.filename);
                    
                    console.log(`=== Filtered ${argv.style.toUpperCase()} Map: ${filename} ===`);
                    
                    if (region.width !== World.WIDTH || region.height !== World.HEIGHT) {
                        console.log(`Region: (${region.startCol},${region.startRow}) to (${region.endCol - 1},${region.endRow - 1}), ${region.width}x${region.height} tiles`);
                    }
                    
                    // Log filter settings
                    console.log('Applied filters:');
                    Object.entries(filters).forEach(([key, value]) => {
                        console.log(`  ${key}: ${value}`);
                    });
                    
                    console.log(city.generateFilteredMap(bounds, filters, argv.style));
                })
                
                .demandCommand(1, 'You need to specify a visualization type');
        })
        
        .demandCommand(1, 'You need to specify a command')
        .help()
        .alias('help', 'h')
        .version()
        .strict()
        .parse();
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    setupCLI();
}

export {
    CityFile,
    // Export constants and utilities for use by other modules
    World,
    TileBits,
    Endian
}; 