/**
 * constants.js - Micropolis constants and configuration values
 * 
 * This is the single source of truth for all Micropolis constants,
 * designed to work with both CommonJS and ES Module imports.
 * 
 * Import in ESM: import { World, TileBits } from './constants.js';
 * Import in CJS: const { World, TileBits } = require('./constants.js');
 * Import in TS:  import { World, TileBits } from './constants.js';
 */

/**
 * World dimensions and derived sizes
 */
export const World = {
    // Base map dimensions
    WIDTH: 120,
    HEIGHT: 100,
    
    // Derived dimensions for multi-resolution maps
    WIDTH_2: 120 / 2,   // 60 (half width)
    HEIGHT_2: 100 / 2,  // 50 (half height)
    WIDTH_4: 120 / 4,   // 30 (quarter width)
    HEIGHT_4: 100 / 4,  // 25 (quarter height)
    WIDTH_8: 120 / 8,   // 15 (eighth width)
    HEIGHT_8: Math.ceil(100 / 8),  // 13 (eighth height, rounded up)
    
    // Size calculations
    TILE_COUNT: 120 * 100,  // 12,000 tiles
    TILE_SIZE_BYTES: 2,     // Each tile is 2 bytes (16 bits)
    MAP_SIZE_BYTES: 120 * 100 * 2, // 24,000 bytes
    
    // Tile ranges
    MAX_TILE_VALUE: 1023,   // Maximum base tile value (10 bits)
    
    // Commonly used indices
    CENTER_X: Math.floor(120 / 2),
    CENTER_Y: Math.floor(100 / 2)
};

/**
 * History data constants
 */
export const History = {
    LENGTH_SHORTS: 240,  // Length of history arrays in 16-bit values
    LENGTH_BYTES: 240 * 2, // Length in bytes (480)
    MISC_LENGTH_SHORTS: 120, // Length of misc history in 16-bit values
    MISC_LENGTH_BYTES: 120 * 2, // Length in bytes (240)
    
    // Key indices in miscHistory array
    CITY_TIME_INDEX: 8,     // City time (32-bit value, spans indices 8-9)
    FUNDS_INDEX: 50,        // City funds (32-bit value, spans indices 50-51)
    AUTO_BULLDOZE_INDEX: 52,
    AUTO_BUDGET_INDEX: 53,
    AUTO_GOTO_INDEX: 54,
    SOUND_ENABLE_INDEX: 55,
    TAX_RATE_INDEX: 56,
    SIM_SPEED_INDEX: 57,
    POLICE_FUNDING_INDEX: 58, // 32-bit float, spans indices 58-59
    FIRE_FUNDING_INDEX: 60,   // 32-bit float, spans indices 60-61
    ROAD_FUNDING_INDEX: 62    // 32-bit float, spans indices 62-63
};

/**
 * Save file structure
 */
export const SaveFile = {
    // Total size calculation
    HISTORY_SECTION_SIZE: History.LENGTH_BYTES * 6 + History.MISC_LENGTH_BYTES, // 3,120 bytes
    MAP_SECTION_SIZE: World.MAP_SIZE_BYTES, // 24,000 bytes
    STANDARD_FILE_SIZE: 3120 + 24000, // 27,120 bytes (.cty file)
    EXTENDED_FILE_SIZE: 3120 + 24000 + 24000, // 51,120 bytes (.mop file with overlay)
    
    // Section definitions (for parsing)
    SECTIONS: [
        { name: 'Residential History', size: History.LENGTH_BYTES },
        { name: 'Commercial History', size: History.LENGTH_BYTES },
        { name: 'Industrial History', size: History.LENGTH_BYTES },
        { name: 'Crime History', size: History.LENGTH_BYTES },
        { name: 'Pollution History', size: History.LENGTH_BYTES },
        { name: 'Money History', size: History.LENGTH_BYTES },
        { name: 'Miscellaneous History', size: History.MISC_LENGTH_BYTES },
        { name: 'Map Data', size: World.MAP_SIZE_BYTES },
        { name: 'Map Overlay Data', size: World.MAP_SIZE_BYTES, optional: true }
    ]
};

/**
 * Tile bit masks and flags
 */
export const TileBits = {
    LOMASK: 0x03ff,   // Mask for low 10 bits (tile ID)
    ZONEBIT: 0x0400,  // Tile is a zone center
    ANIMBIT: 0x0800,  // Tile is animated
    BULLBIT: 0x1000,  // Tile is bulldozable
    BURNBIT: 0x2000,  // Tile is flammable
    CONDBIT: 0x4000,  // Tile conducts electricity
    PWRBIT: 0x8000    // Tile is powered
};

/**
 * Terrain tile ranges
 */
export const TerrainTiles = {
    DIRT: 0x00,
    RIVER_START: 0x02,
    RIVER: 0x02,
    REDGE: 0x03,
    CHANNEL: 0x04,
    RIVEDGE: 0x05,
    LASTRIVEDGE: 0x14,
    TREEBASE: 0x15,
    WOODS_LOW: 0x15,
    WOODS: 0x25,
    WOODS_HIGH: 0x24,
    RUBBLE_START: 0x2C,
    RUBBLE_END: 0x2F,
    FLOOD_START: 0x30,
    FLOOD_END: 0x33,
    RADTILE: 0x34,
    
    // Fire animation
    FIREBASE: 0x38,
    LASTFIRE: 0x3F
};

/**
 * Transportation tile ranges
 */
export const TransportTiles = {
    // Roads
    HBRIDGE: 0x40,
    VBRIDGE: 0x41,
    ROADS: 0x42,
    ROADS_END: 0x4C,
    INTERSECTION: 0x4D,
    HROADPOWER: 0x4E,
    VROADPOWER: 0x4F,
    LIGHT_TRAFFIC_START: 0x50,
    LIGHT_TRAFFIC_END: 0x6E,
    HEAVY_TRAFFIC_START: 0x90,
    HEAVY_TRAFFIC_END: 0xAE,
    
    // Power lines
    HPOWER: 0xD0,
    VPOWER: 0xD1,
    POWER_START: 0xD0,
    POWER_END: 0xDE,
    
    // Rail
    HRAIL: 0xE0,
    VRAIL: 0xE1,
    RAIL_START: 0xE0,
    RAIL_END: 0xEC,
    HRAILROAD: 0xED, // Horizontal rail with road crossing
    VRAILROAD: 0xEE  // Vertical rail with road crossing
};

/**
 * Zone tile ranges
 */
export const ZoneTiles = {
    // Residential
    RESBASE: 0xF0,
    RESZONE_START: 0xF0,
    RESZONE_END: 0xF8,
    FREEZ: 0xF4, // Residential zone center
    HOUSE_START: 0xF9,
    HOUSE_END: 0x104,
    RES_POPULATED_START: 0x109,
    RES_POPULATED_END: 0x194,
    
    // Hospital
    HOSPITALBASE: 0x195,
    HOSPITAL_START: 0x195,
    HOSPITAL_END: 0x19D,
    HOSPITAL: 0x199, // Hospital center
    
    // Church
    CHURCHBASE: 0x19E,
    CHURCH_START: 0x19E,
    CHURCH_END: 0x1A6,
    CHURCH: 0x1A2, // Church center
    
    // Commercial
    COMBASE: 0x1A7,
    COMZONE_START: 0x1A7,
    COMZONE_END: 0x1AF,
    COMCLR: 0x1AB, // Commercial zone center
    COM_POPULATED_START: 0x1B0,
    COM_POPULATED_END: 0x261,
    
    // Industrial
    INDBASE: 0x264,
    INDZONE_START: 0x264,
    INDZONE_END: 0x26C,
    INDCLR: 0x268, // Industrial zone center
    IND_POPULATED_START: 0x26D,
    IND_POPULATED_END: 0x2B4,
    
    // Seaport
    PORTBASE: 0x2B5,
    PORT_START: 0x2B5,
    PORT_END: 0x2C4,
    PORT: 0x2BA, // Seaport center
    
    // Airport
    AIRPORTBASE: 0x2C5,
    AIRPORT_START: 0x2C5,
    AIRPORT_END: 0x2E8,
    AIRPORT: 0x2CC, // Airport center
    
    // Coal power plant
    COALBASE: 0x2E9,
    POWERPLANT_START: 0x2E9,
    POWERPLANT_END: 0x2FC,
    POWERPLANT: 0x2EE, // Coal power plant center
    
    // Fire station
    FIRESTBASE: 0x2FD,
    FIRESTATION_START: 0x2FD,
    FIRESTATION_END: 0x305,
    FIRESTATION: 0x301, // Fire station center
    
    // Police station
    POLICESTBASE: 0x306,
    POLICESTATION_START: 0x306,
    POLICESTATION_END: 0x30E,
    POLICESTATION: 0x30A, // Police station center
    
    // Stadium
    STADIUMBASE: 0x30F,
    STADIUM_START: 0x30F,
    STADIUM_END: 0x31A,
    STADIUM: 0x314, // Stadium center
    FULLSTADIUM_START: 0x320,
    FULLSTADIUM_END: 0x32E,
    
    // Nuclear power plant
    NUCLEARBASE: 0x32F,
    NUCLEAR_START: 0x32F,
    NUCLEAR_END: 0x33A,
    NUCLEAR: 0x334 // Nuclear power plant center
};

/**
 * Animation and special effect tile ranges
 */
export const AnimationTiles = {
    LIGHTNINGBOLT: 0x33B,
    BRIDGE_ANIMATION_START: 0x33C,
    BRIDGE_ANIMATION_END: 0x33F,
    RADAR_ANIMATION_START: 0x340,
    RADAR_ANIMATION_END: 0x347,
    FOUNTAIN_ANIMATION_START: 0x348,
    FOUNTAIN_ANIMATION_END: 0x34B,
    EXPLOSION_START: 0x35C,
    EXPLOSION_END: 0x367,
    COALSMOKE_START: 0x394,
    COALSMOKE_END: 0x3A3,
    FOOTBALL_GAME_START: 0x3A4,
    FOOTBALL_GAME_END: 0x3B3,
    BRIDGE_ANIM2_START: 0x3B4,
    BRIDGE_ANIM2_END: 0x3B7,
    NUKESWIRL_START: 0x3B8,
    NUKESWIRL_END: 0x3BB
};

/**
 * Game difficulty levels
 */
export const GameLevels = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2
};

/**
 * Map overlay types
 */
export const MapOverlays = {
    ALL: 'all',
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    INDUSTRIAL: 'industrial',
    POWERGRID: 'powergrid',
    TRANSPORTATION: 'transportation',
    POPULATION_DENSITY: 'populationdensity',
    RATE_OF_GROWTH: 'rateofgrowth',
    TRAFFIC_DENSITY: 'trafficdensity',
    POLLUTION_DENSITY: 'pollutiondensity',
    CRIME_RATE: 'crimerate',
    LAND_VALUE: 'landvalue',
    FIRE_COVERAGE: 'firecoverage',
    POLICE_COVERAGE: 'policecoverage'
};

/**
 * Disaster types
 */
export const Disasters = {
    MONSTER: 'monster',
    FIRE: 'fire',
    FLOOD: 'flood',
    MELTDOWN: 'meltdown',
    TORNADO: 'tornado',
    EARTHQUAKE: 'earthquake'
};

/**
 * String tables from resource files (derived from stri.*.txt files)
 */
export const StringTables = {
    // Density strings (stri.202.txt)
    DENSITY_LEVEL: [
        "Low",
        "Medium",
        "High",
        "Very High"
    ],
    
    RESIDENTIAL_CLASS: [
        "Slum",
        "Lower Class",
        "Middle Class",
        "High"
    ],
    
    CRIME_LEVEL: [
        "Safe",
        "Light",
        "Moderate",
        "Dangerous"
    ],
    
    POLLUTION_LEVEL: [
        "None",
        "Moderate",
        "Heavy",
        "Very Heavy"
    ],
    
    GROWTH_RATE: [
        "Declining",
        "Stable",
        "Slow Growth",
        "Fast Growth"
    ],
    
    // Tile types (stri.219.txt)
    TILE_DESCRIPTIONS: [
        "Clear",
        "Water",
        "Trees",
        "Rubble",
        "Flood",
        "Radioactive Waste",
        "Fire",
        "Road",
        "Power",
        "Rail",
        "Residential",
        "Commercial",
        "Industrial",
        "Seaport",
        "Airport",
        "Coal Power",
        "Fire Department",
        "Police Department",
        "Stadium",
        "Nuclear Power",
        "Draw Bridge",
        "Radar Dish",
        "Fountain",
        "Industrial",
        "Steelers 38  Bears 3",
        "Draw Bridge",
        "Ur 238"
    ],
    
    // Message strings (stri.301.txt)
    MESSAGES: [
        "More residential zones needed.",
        "More commercial zones needed.",
        "More industrial zones needed.",
        "More roads required.",
        "Inadequate rail system.",
        "Build a Power Plant.",
        "Residents demand a Stadium.",
        "Industry requires a Sea Port.",
        "Commerce requires an Airport.",
        "Pollution very high.",
        "Crime very high.",
        "Frequent traffic jams reported.",
        "Citizens demand a Fire Department.",
        "Citizens demand a Police Department.",
        "Blackouts reported. Check power map.",
        "Citizens upset. The tax rate is too high.",
        "Roads deteriorating, due to lack of funds.",
        "Fire departments need funding.",
        "Police departments need funding.",
        "Fire reported !",
        "A Monster has been sighted !!",
        "Tornado reported !!",
        "Major earthquake reported !!!",
        "A plane has crashed !",
        "Shipwreck reported !",
        "A train crashed !",
        "A helicopter crashed !",
        "Unemployment rate is high.",
        "YOUR CITY HAS GONE BROKE!",
        "Firebombing reported !",
        "Need more parks.",
        "Explosion detected !",
        "Insufficient funds to build that.",
        "Area must be bulldozed first.",
        "Population has reached 2,000.",
        "Population has reached 10,000.",
        "Population has reached 50,000.",
        "Population has reached 100,000.",
        "Population has reached 500,000.",
        "Brownouts, build another Power Plant.",
        "Heavy Traffic reported.",
        "Flooding reported !!",
        "A Nuclear Meltdown has occurred !!!",
        "They're rioting in the streets !!"
    ],
    
    // Tool names (stri.356.txt)
    TOOLS: [
        "Residential Zone",
        "Commercial Zone",
        "Industrial Zone",
        "Fire Station",
        "Query",
        "Police Station",
        "Wire Power",
        "Bulldozer",
        "Rail",
        "Road",
        "Chalk",
        "Eraser",
        "Stadium",
        "Park",
        "Seaport",
        "Coal Power",
        "Nuclear Power",
        "Airport"
    ]
};

// Create default export with all constants
const Constants = {
    World,
    History,
    SaveFile,
    TileBits,
    TerrainTiles,
    TransportTiles,
    ZoneTiles,
    AnimationTiles,
    GameLevels,
    MapOverlays,
    Disasters,
    StringTables
};

// Export default for ESM
export default Constants;

// Support CommonJS requires (for Node.js environments)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Constants;
} 