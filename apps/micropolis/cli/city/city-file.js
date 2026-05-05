import fs from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import {
  AnimationTiles,
  History,
  SaveFile,
  StringTables,
  TerrainTiles,
  TileBits,
  TransportTiles,
  World,
  ZoneTiles
} from '../constants/constants.js';
import { Endian } from './endian.js';

export class CityFile {
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
            
            // Validate file size (matches C++ loadFileData: isValid = hasMop || size == mapFileSize)
            this.hasMopData = (this.buffer.length === SaveFile.EXTENDED_FILE_SIZE);
            const isValidSize = this.hasMopData || (this.buffer.length === SaveFile.STANDARD_FILE_SIZE);
            if (!isValidSize) {
                console.error(`Error: Invalid file size ${this.buffer.length} bytes. ` +
                    `Expected ${SaveFile.STANDARD_FILE_SIZE} (.cty) or ${SaveFile.EXTENDED_FILE_SIZE} (.mop).`);
                return false;
            }
            
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
        
        // Extract key settings (see fileio.cpp loadFile)
        const rawCityTime = Endian.readLong(miscHistSection, History.CITY_TIME_INDEX * 2); 
        const funds = Endian.readLong(miscHistSection, History.FUNDS_INDEX * 2);
        
        // cityTime: 4 units/month, 48 units/year, relative to startingYear (1900)
        // C++ clamps: cityTime = max(0, cityTime)
        const cityTime = Math.max(0, rawCityTime);
        const cityYear = Math.floor(cityTime / 48) + World.STARTING_YEAR;
        
        // Game flags (each stored as a 16-bit short, treated as boolean)
        const autoBulldoze = Endian.readShort(miscHistSection, History.AUTO_BULLDOZE_INDEX * 2);
        const autoBudget = Endian.readShort(miscHistSection, History.AUTO_BUDGET_INDEX * 2);
        const autoGoto = Endian.readShort(miscHistSection, History.AUTO_GOTO_INDEX * 2);
        const soundEnabled = Endian.readShort(miscHistSection, History.SOUND_ENABLE_INDEX * 2);
        
        // Tax and speed: C++ validates these after loading (fileio.cpp lines 334-341)
        const rawCityTax = Endian.readShort(miscHistSection, History.TAX_RATE_INDEX * 2);
        const rawSimSpeed = Endian.readShort(miscHistSection, History.SIM_SPEED_INDEX * 2);
        const cityTax = (rawCityTax > 20 || rawCityTax < 0) ? 7 : rawCityTax;
        const simSpeed = (rawSimSpeed < 0 || rawSimSpeed > 3) ? 3 : rawSimSpeed;
        const cityTaxClamped = cityTax !== rawCityTax;
        const simSpeedClamped = simSpeed !== rawSimSpeed;
        
        // Funding percentages (stored as fixed-point int / 65536, NOT IEEE floats)
        // Some city files have uninitialized data here; the C++ engine calls
        // initFundingLevel() after loading to reset these at runtime.
        const rawPolice = Endian.readFundingPercent(miscHistSection, History.POLICE_FUNDING_INDEX * 2);
        const rawFire = Endian.readFundingPercent(miscHistSection, History.FIRE_FUNDING_INDEX * 2);
        const rawRoad = Endian.readFundingPercent(miscHistSection, History.ROAD_FUNDING_INDEX * 2);
        const clampFunding = (v) => (v < 0 || v > 1.0) ? null : v;
        const policePercent = clampFunding(rawPolice);
        const firePercent = clampFunding(rawFire);
        const roadPercent = clampFunding(rawRoad);
        
        return {
            filename: this.filename === '-' ? 'stdin' : path.basename(this.filename),
            hasMopData: this.hasMopData,
            fileSize: this.buffer.length,
            cityTime,
            cityYear,
            funds,
            gameFlags: {
                autoBulldoze: !!autoBulldoze,
                autoBudget: !!autoBudget,
                autoGoto: !!autoGoto,
                soundEnabled: !!soundEnabled
            },
            cityTax,
            cityTaxClamped,
            simSpeed,
            simSpeedClamped,
            funding: {
                police: policePercent,
                fire: firePercent,
                road: roadPercent
            }
        };
    }

    /**
     * Write metadata fields back into the miscHist section buffer.
     * Mirrors the C++ saveFile() logic in fileio.cpp.
     *
     * Only writes fields that are present in the updates object.
     * @param {Object} updates - Fields to update
     * @param {number} [updates.cityTime] - City time (raw ticks)
     * @param {number} [updates.funds] - Total funds
     * @param {number} [updates.cityTax] - Tax rate (0-20)
     * @param {number} [updates.simSpeed] - Simulation speed (0-3)
     * @param {boolean} [updates.autoBulldoze] - Auto-bulldoze flag
     * @param {boolean} [updates.autoBudget] - Auto-budget flag
     * @param {boolean} [updates.autoGoto] - Auto-goto flag
     * @param {boolean} [updates.soundEnabled] - Sound enable flag
     * @param {number} [updates.policePercent] - Police funding (0.0-1.0)
     * @param {number} [updates.firePercent] - Fire funding (0.0-1.0)
     * @param {number} [updates.roadPercent] - Road funding (0.0-1.0)
     */
    setMetadata(updates) {
        if (!this.buffer) {
            throw new Error('No file loaded');
        }
        const misc = this.sections['Miscellaneous History'];

        if (updates.cityTime !== undefined) {
            Endian.writeLong(misc, History.CITY_TIME_INDEX * 2, updates.cityTime);
        }
        if (updates.funds !== undefined) {
            Endian.writeLong(misc, History.FUNDS_INDEX * 2, updates.funds);
        }
        if (updates.cityTax !== undefined) {
            Endian.writeShort(misc, History.TAX_RATE_INDEX * 2, updates.cityTax);
        }
        if (updates.simSpeed !== undefined) {
            Endian.writeShort(misc, History.SIM_SPEED_INDEX * 2, updates.simSpeed);
        }
        if (updates.autoBulldoze !== undefined) {
            Endian.writeShort(misc, History.AUTO_BULLDOZE_INDEX * 2, updates.autoBulldoze ? 1 : 0);
        }
        if (updates.autoBudget !== undefined) {
            Endian.writeShort(misc, History.AUTO_BUDGET_INDEX * 2, updates.autoBudget ? 1 : 0);
        }
        if (updates.autoGoto !== undefined) {
            Endian.writeShort(misc, History.AUTO_GOTO_INDEX * 2, updates.autoGoto ? 1 : 0);
        }
        if (updates.soundEnabled !== undefined) {
            Endian.writeShort(misc, History.SOUND_ENABLE_INDEX * 2, updates.soundEnabled ? 1 : 0);
        }
        if (updates.policePercent !== undefined) {
            Endian.writeFundingPercent(misc, History.POLICE_FUNDING_INDEX * 2, updates.policePercent);
        }
        if (updates.firePercent !== undefined) {
            Endian.writeFundingPercent(misc, History.FIRE_FUNDING_INDEX * 2, updates.firePercent);
        }
        if (updates.roadPercent !== undefined) {
            Endian.writeFundingPercent(misc, History.ROAD_FUNDING_INDEX * 2, updates.roadPercent);
        }
    }

    /**
     * Save the city file to disk.
     * The buffer is already in big-endian format (sections are subarray views
     * into the loaded buffer), so we just write it out.
     * @param {string} filename - Path to write to
     */
    save(filename) {
        // Reassemble the buffer from sections in case setMetadata modified them
        // (sections are subarrays of this.buffer, so writes go through)
        fs.writeFileSync(filename, this.buffer);
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
     * Count zones across the full map.
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
     * Count tiles with an attribute across the full map.
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
                        char = 'QQ';  // Zone center (Q for poliQe, P taken by coal Power)
                    } else {
                        char = 'qq';  // Zone edge
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
                
                // Roads and traffic (0x40-0xCE covers all road + traffic density tiles)
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
     * Generate ASCII for the full map.
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
     * Generate a full-map JSON-compatible representation.
     */
    toJSON(includeMap = false) {
        return this.toJSONForRegion(includeMap, {});
    }
}
