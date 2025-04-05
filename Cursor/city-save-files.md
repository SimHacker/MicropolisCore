---
title: Micropolis Save File Reference
---

# Micropolis Save File: A Window into the Simulation World

> "What's cool is that the behavior is entirely distributed in the environment." — [Will Wright]({{ '/pages/will-wright' | relative_url }}#from-simcity-to-the-sims)

This document serves as both a technical reference for SimCity/Micropolis save files and a guide to interpreting the game state they represent. By understanding these files, an AI system can gain "X-ray vision" into the simulation, analyzing patterns and offering insights beyond what human players typically see.

## Technical File Structure

A Micropolis save file contains three main components arranged sequentially:

1. **History Data** (3,120 bytes total)
   - Residential history (`resHist`): 480 bytes (240 shorts)
   - Commercial history (`comHist`): 480 bytes (240 shorts)
   - Industrial history (`indHist`): 480 bytes (240 shorts)
   - Crime history (`crimeHist`): 480 bytes (240 shorts)
   - Pollution history (`pollutionHist`): 480 bytes (240 shorts)
   - Money history (`moneyHist`): 480 bytes (240 shorts)
   - Miscellaneous history (`miscHist`): 240 bytes (120 shorts)
     - Critical game settings (positions in short array):
     - `miscHist[8-9]`: City time (32-bit value)
     - `miscHist[50-51]`: Total funds (32-bit value)
     - `miscHist[52]`: Auto-bulldoze flag
     - `miscHist[53]`: Auto-budget flag
     - `miscHist[54]`: Auto-goto flag
     - `miscHist[55]`: Sound enable flag
     - `miscHist[56]`: City tax rate
     - `miscHist[57]`: Simulation speed
     - `miscHist[58-59]`: Police funding percentage (32-bit float)
     - `miscHist[60-61]`: Fire funding percentage (32-bit float)
     - `miscHist[62-63]`: Road funding percentage (32-bit float)

2. **Map Data** (24,000 bytes)
   - Primary city map: 120×100 grid of 16-bit values
   - Stored as row-major order (y is outer loop, x is inner loop)
   - Row length: 240 bytes (120 tiles × 2 bytes per tile)

3. **Map Overlay Data** (24,000 bytes, optional)
   - Present in `.mop` files, absent in standard `.cty` files
   - Same format as Map Data

### Endianness Considerations

The save file format uses big-endian (Motorola/MAC) byte ordering. When loading on Intel (little-endian) systems, byte swapping is needed:

```c
// Convert from big-endian to little-endian
static void swap_shorts(short *buf, int len) {
    for (int i = 0; i < len; i++) {
        *buf = ((*buf & 0xFF) << 8) | ((*buf & 0xFF00) >> 8);
        buf++;
    }
}

// Convert 32-bit values (swaps 16-bit words)
static void half_swap_longs(long *buf, int len) {
    for (int i = 0; i < len; i++) {
        long l = *buf;
        *buf = ((l & 0x0000ffff) << 16) | ((l & 0xffff0000) >> 16);
        buf++;
    }
}
```

## Map Cell Data Structure

Each map cell is a 16-bit value with a dual-purpose design:

```c
// Bit masks for map tiles
#define LOMASK  0x03ff  // Mask for low 10 bits (tile ID)
#define ANIMBIT 0x0800  // Tile is animated
#define BURNBIT 0x2000  // Tile is flammable
#define BULLBIT 0x1000  // Tile is bulldozable
#define CONDBIT 0x4000  // Tile conducts electricity
#define PWRBIT  0x8000  // Tile is powered
#define ZONEBIT 0x0400  // Tile is a zone center
```

To extract information from a tile:
```c
// Get the base tile type (0-1023)
unsigned short GetTileValue(unsigned short cell) {
    return cell & LOMASK;
}

// Check if a tile has a specific attribute
bool HasAttribute(unsigned short cell, unsigned short mask) {
    return (cell & mask) != 0;
}

// Create a new tile with a base tile and flags
unsigned short MakeTile(unsigned short baseTile, unsigned short flags) {
    return (baseTile & LOMASK) | (flags & ~LOMASK);
}
```

## Multi-Resolution Data Architecture

SimCity uses a hierarchical data structure where information exists at different resolutions:

```c
// Map dimensions
#define WORLD_W 120
#define WORLD_H 100

// Derived dimensions for multi-resolution maps
#define WORLD_W_2 (WORLD_W / 2)  // = 60
#define WORLD_H_2 (WORLD_H / 2)  // = 50
#define WORLD_W_4 (WORLD_W / 4)  // = 30
#define WORLD_H_4 (WORLD_H / 4)  // = 25
#define WORLD_W_8 (WORLD_W / 8)  // = 15
#define WORLD_H_8 (WORLD_H / 8)  // = 13 (rounded up)
```

Maps at different resolutions:
- **Base Map** (120×100): Each tile's individual properties
- **Half Resolution** (60×50): `populationDensityMap`, `trafficDensityMap`, `pollutionDensityMap`, etc.
- **Quarter Resolution** (30×25): Various effect maps
- **Eighth Resolution** (15×13): `fireStationMap`, `policeStationMap`, etc.

This architecture enables analyzing both micro-level details and macro-level patterns simultaneously.

## JavaScript Tools for Micropolis City Analysis

The Micropolis project now includes a comprehensive JavaScript toolkit for working with city save files. This modern replacement for the bash-based `dump-city.sh` script provides powerful capabilities for developers, players, and AI systems to analyze and manipulate save files. The toolkit is integrated directly into the SvelteKit application structure, making it easily accessible through the npm command interface.

### Key Features of the Micropolis JavaScript Tools

1. **Complete Save File Parsing**
   - Full endian-aware reading and writing of .cty and .mop files using Node.js Buffer API
   - Data structure validation and integrity checking
   - Comprehensive city metadata extraction

2. **Multi-Format Export**
   - JSON export of all city data and metadata
   - CSV spreadsheet export for history data
   - Structured data formats for machine learning and analysis

3. **ASCII/Unicode Visualization**
   - ASCII art maps of the city at multiple resolutions
   - Heat map visualizations of traffic, pollution, population density, etc.
   - Emoji-based city maps for intuitive visual representation
   - Schematic diagrams highlighting specific urban elements

4. **Advanced Analysis**
   - Zone counting and distribution metrics
   - Infrastructure analysis (power, transportation, etc.)
   - Historical trend analysis from history arrays
   - Comparative analysis between different save files

5. **AI-Friendly Abstractions**
   - LLM-optimized text representations of urban patterns
   - Low-resolution abstractions that capture key city features
   - Configurable focus on specific aspects (roads, zones, services)

6. **WebAssembly Integration**
   - Seamless communication with the WebAssembly simulation core
   - Runtime analysis of active simulation states
   - Potential for extending to live simulation control and monitoring

### Command Line Interface

The JavaScript-based `micropolis` command line tool is integrated into the SvelteKit application and can be invoked via npm:

```
npm run micropolis -- <command> [options] <file>
```

Key commands include:

- **city-dump**: Dump raw city data (replacement for dump-city.sh)
- **city-info**: Display city metadata and statistics
- **city-export**: Export city data to various formats (JSON, CSV)
- **city-visualize**: Generate ASCII/Unicode/emoji visualizations
- **city-analyze**: Perform detailed analysis of city dynamics
- **city-validate**: Validate file integrity and structure
- **city-edit**: Make basic modifications to save files

### Implementation Details

The toolkit leverages JavaScript's strengths in:
- **Buffer and TypedArray APIs** for efficient binary data handling
- **Async file operations** for non-blocking performance
- **JSON serialization** for seamless data exchange
- **Modern ES modules** for clean code organization
- **Terminal coloring libraries** for rich visualizations
- **Direct integration** with the SvelteKit application ecosystem

### Visualization Examples

The toolkit provides multiple visualization styles:

```
# Basic ASCII representation (120×100)
.....~~~~~~~~~~~~~~~~~~~~~....................................
.....~~~~~~~~~~~~~~~~~~~~~....................................
.....~~~~~~~~~~~~~~~~~~~~~............#######.................
.....~~~~~~~~~~~~~~~~~~~~~~~~........#######.................
.....~~~~~~~~~~~~~~~~~~~~~~~~~......#######.................
.....~~~~~~~~~~~~~~~~~~~~~~~~~~~...#############.............
.....~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.#############.............
.....~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#############.............
......................###########...........................,
......................###########...........................,
......................###########.........CCCCCCC............
.........RRRRRRRRRRR..###########.........CCCCCCC............
.........RRRRRRRRRRR..........................................
.........RRRRRRRRRRR..........................................

# Tile type visualization (60×50, reduced resolution)
........................IIIiiII....
........................iiiiiII....
....................rrrrIIIIIII....
....................rrrr...........
....................rrrr...........
..CCccc...........................PP
..CCccc............................P
..CCccc............RRRrrr..........
.....................RRR...........
.....................RRR...........
...........222................HHHHH
...........222...................HH
.......NNN.......................HH
.......NNN.......................HH

# Emoji-based visualization (30×25, highly reduced)
🌊🌊🌊🌊🏭🏭🏭🏭🌲
🌊🌊🌊🛣️🏭🏭🏭🏭🌲
🌊🌊🌊🛣️🏭🏭🏭🏭🌲
🏙️🏙️🛣️🛣️🛣️🛣️🏢🏢🏢
🏙️🏙️🛣️🚇🚇🛣️🏢🏢🏢
🏠🏠🏠🛣️🚇🚇🛣️🏥🌳
🏠🏠🏠🛣️🚂🚂🚂🌳🌳
⚡⚡⚡🏠🚂🚂🚂🚓🌳
```

The tools support overlaying multiple data types in a single visualization, such as showing traffic congestion on top of road networks, or power distribution across the city grid.

### Web Integration

As part of the SvelteKit application, the toolkit can also:
- **Provide API endpoints** for city analysis from the web interface
- **Share code** between CLI and web applications
- **Generate visualizations** that can be rendered in the browser
- **Support browser-based city editing** and analysis

### LLM Integration

The JavaScript toolkit is specifically designed to support AI analysis by generating structured, interpretable data that language models can effectively process. For example:

```
# City summary for LLM analysis
City: Metropolis
Population: 127,892
RCI Balance: Residential 34%, Commercial 28%, Industrial 38%
Power: 2 Coal Plants, 1 Nuclear, 85% connected
Transportation: 1,243 road tiles, 428 rail tiles, heavy traffic in NE quadrant
Services: 3 police stations (76% coverage), 2 fire stations (62% coverage)
Issues: Power grid disconnected in SW region, heavy pollution near industrial
```

These tools provide both human-readable and machine-friendly representations of city data, making them ideal for educational purposes, automated analysis, and AI-assisted urban planning.

## Deep City Analysis: Reading Between the Tiles

A save file can tell the story of your city's past, present, and likely future. By examining it through multiple lenses, you can gain profound insights into your city's strengths, weaknesses, and hidden patterns.

### Power Infrastructure Assessment

To evaluate a city's power infrastructure from a save file:

1. **Count Power Plants**:
   - Coal plants (tiles 0x2E9-0x2FC): Lower capacity but cheaper to build and operate
   - Nuclear plants (tiles 0x32F-0x33A): Higher capacity but more expensive and risky

2. **Power Network Evaluation**:
   - Check for `PWRBIT` (0x8000) flag across all connected buildings
   - Unpowered zones (having `CONDBIT` but not `PWRBIT`) indicate potential grid fragmentation
   - Presence of bridges with power lines (specialized tiles) signals sophisticated grid planning
   - Power line density relative to city size indicates network redundancy

3. **Growth Capacity Analysis**:
   - The quantity of empty powered zones indicates readiness for future growth
   - Ratio of powered zones to existing power generation indicates surplus/deficit

A robust power infrastructure typically features redundant connections, strategic plant placement, and 20-30% capacity surplus.

### Transportation Network Analysis

Traffic patterns reveal the true life of a city:

1. **Road Hierarchy Detection**:
   - Major arteries: High concentration of heavy traffic tiles (0x90-0xAE)
   - Neighborhood/access roads: Light traffic tiles (0x50-0x6E)
   - Clear roads (base road tiles 0x40-0x4F): Potential underutilized infrastructure

2. **Rail System Evaluation**:
   - Rail density (tiles 0xE0-0xEE) relative to industrial zones indicates logistics efficiency
   - Rail-road crossings (0xED-0xEE) show integration of transportation systems
   - Rail connections to seaports/airports indicate trade infrastructure

3. **Bottleneck Identification**:
   - Clusters of heavy traffic tiles with single connecting points
   - Bridge/tunnel count as ratio to city size (fewer crossings create natural bottlenecks)
   - Proximity of traffic to industrial zones without rail connections

Well-planned cities show grid-like major roads with appropriate hierarchy, rail connections to industrial areas, and multiple traffic pathways between major zones.

### Zone Distribution and Balance

Zone types and their arrangement determine a city's character:

1. **RCI Balance Assessment**:
   - Count zone centers (tiles with `ZONEBIT` flag 0x400) by type:
     - Residential (0xF0-0xF8 center at 0xF4): Population base
     - Commercial (0x1A7-0x1AF center at 0x1AB): Services and jobs
     - Industrial (0x264-0x26C center at 0x268): Heavy employment and tax base

2. **Development Density Analysis**:
   - Proportion of higher-value residential tiles (0x109-0x194) shows prosperity
   - High-density commercial clusters indicate downtown/CBD formation
   - Dense industrial zones without adequate transportation signal potential congestion

3. **Zoning Strategy Insights**:
   - Buffer zones between industrial and residential (parks, commercial)
   - Zone size patterns (small commercial, medium residential, large industrial)
   - Growth direction (empty powered zones on city periphery)

Healthy cities typically maintain a rough 1:1:1 RCI ratio with appropriate transitions between zone types and strategic placement of services.

### Public Services Coverage

Police, fire, healthcare, and recreation facilities directly impact land value:

1. **Service Facility Count**:
   - Police stations (tiles 0x306-0x30E): Controls crime
   - Fire stations (tiles 0x2FD-0x305): Reduces fire risk
   - Hospitals (tiles 0x195-0x19D): Affects health and land value
   - Parks/recreation: Stadiums (0x30F-0x31A), waterfronts, and natural features

2. **Spatial Distribution Analysis**:
   - Coverage radius overlap (excessive overlapping indicates inefficient placement)
   - Uncovered residential zones (risk areas)
   - Service placement relative to highest-value zones

3. **Funding Adequacy Check**:
   - Police funding percentage (`miscHist[58-59]`) relative to city size
   - Fire funding percentage (`miscHist[60-61]`) relative to industrial zone count
   - Road maintenance funding (`miscHist[62-63]`) relative to road tile count

Well-planned cities show strategic service placement with minimal coverage gaps, adequately funded relative to their size and development stage.

### Historical Growth Patterns

The history arrays reveal your city's development trajectory:

1. **Population Growth Analysis**:
   - Residential history curve shape: Steady growth, plateau, or decline
   - Growth rate changes coinciding with major infrastructure additions
   - Population stability relative to industrial/commercial growth

2. **Economic Health Indicators**:
   - Commercial history correlation with residential (service-oriented economy)
   - Industrial history correlation with pollution (industrial economy)
   - Money history volatility (stable finances vs. boom-bust cycles)

3. **Crisis Detection**:
   - Pollution spikes following industrial expansion
   - Crime spikes when police coverage lags behind population growth
   - Sharp money drops indicating disaster recovery periods

Strong cities show balanced, steady growth across sectors with minimal volatility in crime and pollution histories.

### Data-Driven Urban Recommendations

Based on save file analysis, targeted interventions might include:

1. **Critical Infrastructure Needs**:
   - Power network fragmentation: Add connecting power lines
   - Traffic congestion: New transportation corridors between heavily trafficked zones
   - Service gaps: Strategic placement of police/fire in underserved high-density areas

2. **Tax and Budget Optimization**:
   - High residential growth with low commercial: Lower commercial taxes
   - Stable funding with high funds: Increase department funding percentages
   - High crime with adequate police: Increase funding rather than building new stations

3. **Urban Renewal Opportunities**:
   - Low-value zones adjacent to high-traffic areas: Rezone commercial
   - Waterfront industry: Gradually transform to commercial or residential
   - Empty zones with full services: Potential for specialized development

This analytical approach transforms raw save file data into actionable urban planning insights.

## Tile Type Reference Glossary

### Terrain Tiles (0x00-0x2F)
- **0x00** `DIRT`: Clear tile, foundation for construction
- **0x02-0x14** `RIVER` to `LASTRIVEDGE`: Water bodies (0x02=RIVER, 0x03=REDGE, 0x04=CHANNEL, 0x05-0x14=RIVERBANKS)
- **0x15-0x24** `WOODS`: Trees and forests (0x15-0x24=TREEBASE to LASTTREE, 0x25=WOODS)
- **0x2C-0x2F** `RUBBLE`: Demolished building remains (0x2C-0x2F)
- **0x30-0x33** `FLOOD`: Flooded areas
- **0x34** `RADTILE`: Radioactive contaminated tile

### Fire Animation (0x38-0x3F)
- **0x38-0x3F** `FIREBASE` to `LASTFIRE`: Fire animation frames

### Transportation Network (0x40-0xEE)
- **Roads (0x40-0xCE)**
  - **0x40** `HBRIDGE`: Horizontal bridge
  - **0x41** `VBRIDGE`: Vertical bridge
  - **0x42-0x4C** `ROADS` to `ROADS10`: Road segments
  - **0x4D** `INTERSECTION`: Road intersection
  - **0x4E** `HROADPOWER`: Horizontal road with power line
  - **0x4F** `VROADPOWER`: Vertical road with power line
  - **0x50-0xCE** Traffic variations (0x50-0x6E=Light traffic, 0x90-0xAE=Heavy traffic)

- **Power Lines (0xD0-0xDE)**
  - **0xD0** `HPOWER`: Horizontal power line
  - **0xD1** `VPOWER`: Vertical power line
  - **0xD2-0xDE** Various power line connections

- **Rail (0xE0-0xEE)**
  - **0xE0** `HRAIL`: Horizontal rail
  - **0xE1** `VRAIL`: Vertical rail
  - **0xE2-0xEC** Various rail connections
  - **0xED** `HRAILROAD`: Horizontal rail with road crossing
  - **0xEE** `VRAILROAD`: Vertical rail with road crossing

### Residential Zone Tiles (0xF0-0x194)
- **0xF0-0xF8** `RESBASE`: Empty residential zone (0xF4=FREEZ center)
- **0xF9-0x104** `HOUSE`: Single tile houses
- **0x109-0x194** Populated residential zones with increasing density/value
- **0x195-0x19D** `HOSPITALBASE`: Hospital (0x199=center)
- **0x19E-0x1A6** `CHURCHBASE`: Church (0x1A2=center)

### Commercial Zone Tiles (0x1A7-0x261)
- **0x1A7-0x1AF** `COMBASE`: Empty commercial zone (0x1AB=COMCLR center)
- **0x1B0-0x261** Populated commercial zones with increasing density/value

### Industrial Zone Tiles (0x264-0x2B4)
- **0x264-0x26C** `INDBASE`: Empty industrial zone (0x268=INDCLR center)
- **0x26D-0x2B4** Populated industrial zones with increasing density/value

### Special Structures (0x2B5-0x33A)
- **0x2B5-0x2C4** `PORTBASE`: Seaport (0x2BA=PORT center)
- **0x2C5-0x2E8** `AIRPORTBASE`: Airport (0x2CC=AIRPORT center)
- **0x2E9-0x2FC** `COALBASE`: Coal power plant (0x2EE=POWERPLANT center)
- **0x2FD-0x305** `FIRESTBASE`: Fire station (0x301=FIRESTATION center)
- **0x306-0x30E** `POLICESTBASE`: Police station (0x30A=POLICESTATION center)
- **0x30F-0x31A** `STADIUMBASE`: Stadium (0x314=STADIUM center)
- **0x320-0x32E** Full stadium with game
- **0x32F-0x33A** `NUCLEARBASE`: Nuclear power plant (0x334=NUCLEAR center)

### Animation and Special Effects (0x33B-0x3FF)
- **0x33B** `LIGHTNINGBOLT`: Lightning animation
- **0x33C-0x33F** Bridge animations
- **0x340-0x347** Radar animations
- **0x348-0x34B** Fountain animations
- **0x35C-0x367** Explosions
- **0x394-0x3A3** Coal plant smoke animations
- **0x3A4-0x3B3** Football game animations
- **0x3B4-0x3B7** Bridge animations
- **0x3B8-0x3BB** `NUKESWIRL`: Nuclear meltdown animation
- **0x3BC-0x3FF** Extended church types and other special structures

## Implementation Example: Reading a Save File

```c
// C example for loading a SimCity save file
bool loadSimCityFile(const char *filename, CityData *cityData) {
    FILE *file = fopen(filename, "rb");
    if (!file) return false;
    
    // Determine file size and type
    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    bool hasMop = (size == 51120);  // Check if file has map overlay data
    
    // Read history data
    fread(cityData->resHist, sizeof(short), 240, file);
    fread(cityData->comHist, sizeof(short), 240, file);
    fread(cityData->indHist, sizeof(short), 240, file);
    fread(cityData->crimeHist, sizeof(short), 240, file);
    fread(cityData->pollutionHist, sizeof(short), 240, file);
    fread(cityData->moneyHist, sizeof(short), 240, file);
    fread(cityData->miscHist, sizeof(short), 120, file);
    
    // Read map data
    fread(cityData->map, sizeof(short), 120*100, file);
    
    // Read map overlay data if present
    if (hasMop) {
        fread(cityData->mapOverlay, sizeof(short), 120*100, file);
    } else {
        memset(cityData->mapOverlay, 0, 120*100*sizeof(short));
    }
    
    // Apply endian conversion if needed
    #if !defined(__BIG_ENDIAN__)
    swap_shorts(cityData->resHist, 240);
    swap_shorts(cityData->comHist, 240);
    swap_shorts(cityData->indHist, 240);
    swap_shorts(cityData->crimeHist, 240);
    swap_shorts(cityData->pollutionHist, 240);
    swap_shorts(cityData->moneyHist, 240);
    swap_shorts(cityData->miscHist, 120);
    swap_shorts((short*)cityData->map, 120*100);
    if (hasMop) {
        swap_shorts((short*)cityData->mapOverlay, 120*100);
    }
    #endif
    
    // Extract key game settings
    long cityTime, funds;
    memcpy(&cityTime, &cityData->miscHist[8], sizeof(long));
    memcpy(&funds, &cityData->miscHist[50], sizeof(long));
    
    #if !defined(__BIG_ENDIAN__)
    half_swap_longs(&cityTime, 1);
    half_swap_longs(&funds, 1);
    #endif
    
    cityData->cityTime = cityTime;
    cityData->funds = funds;
    cityData->taxRate = cityData->miscHist[56];
    cityData->simSpeed = cityData->miscHist[57];
    
    fclose(file);
    return true;
}
```

## The Mental Model Behind the Simulation

What makes Chaim Gingold's reverse engineering so valuable is how it exposes the mental model Will Wright embedded in his simulation. As Wright noted:

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the mental model in the player's head." — [Will Wright]({{ '/pages/will-wright' | relative_url }}#the-anatomy-of-simulation-games)

An AI analyzing a save file should recognize that the game state represents not just technical data but a conceptual model of urban systems—where traffic generates pollution, industrial zones create jobs but decrease land value, crime results from population density without adequate policing, and so on.

By understanding these causal relationships encoded in the save file, an AI can provide analysis that matches a seasoned player's intuition about their city while adding the benefit of comprehensive pattern recognition across all game systems simultaneously.

> "The actual simulation in SimCity is much less idealistically general-purpose than most people imagine. It sacrifices expandability and modularity for speed and compact size—exactly the right tradeoff for a game running on home computers in the 1980s." — [Excerpt from Will Wright analysis]({{ '/pages/will-wright' | relative_url }}#reverse-over-engineering)

This understanding of SimCity's practical optimizations helps contextualize the data patterns found in save files—they're designed to create believable emergent urban dynamics, not to accurately model real-world urban planning. 