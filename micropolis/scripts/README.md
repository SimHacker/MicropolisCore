# Micropolis CLI

A powerful command-line tool for working with SimCity/Micropolis save files. This utility allows you to analyze, visualize, and export data from .cty and .mop files in various formats.

## Installation

The CLI is integrated with the main Micropolis SvelteKit application. All dependencies are managed through the main project's package.json.

To install the required dependencies:

```bash
cd micropolis
npm install
```

## Usage

The CLI can be used in two ways:

### 1. Using npm scripts

The following npm scripts are available in the main project:

```bash
# Main command with subcommands
npm run micropolis -- <command> <subcommand> [options]

# Shortcut commands
npm run micropolis:info -- <file> [options]
npm run micropolis:analyze -- <file> [options]
npm run micropolis:visualize -- <file> [options]
npm run micropolis:export -- <file> [options]
npm run micropolis:dump -- <file> [options]
```

Note: When using npm scripts, you need to use `--` to pass arguments to the underlying script.

### 2. Running the script directly

```bash
node micropolis/scripts/micropolis.js <command> <subcommand> [options]
```

### Main Commands

- `file` - Raw file operations
- `city` - City analysis operations
- `visualize` - Visualization operations

### Examples

#### Display city information

```bash
npm run micropolis:info -- path/to/city.cty
npm run micropolis:info -- path/to/city.cty --format json
```

#### Analyze city dynamics

```bash
npm run micropolis:analyze -- path/to/city.cty
```

#### Generate ASCII visualization

```bash
npm run micropolis:visualize -- path/to/city.cty
npm run micropolis:visualize -- path/to/city.cty --resolution 2
```

#### Dump raw file data

```bash
npm run micropolis:dump -- path/to/city.cty
npm run micropolis:dump -- path/to/city.cty --brief
```

#### Export city data

```bash
npm run micropolis:export -- path/to/city.cty
npm run micropolis:export -- path/to/city.cty --include-map --output city-data.json
```

## Command Reference

### Region Selection

All commands that operate on map tiles support region selection using these parameters:

```
--row <number>     Starting row (y coordinate) for region operations (default: 0)
--col <number>     Starting column (x coordinate) for region operations (default: 0)
--width <number>   Width of the region in tiles (default: 120)
--height <number>  Height of the region in tiles (default: 100)
```

These parameters let you clip operations to a specific rectangular region of the map. Values are automatically clipped to valid map boundaries, and warnings are shown if the requested region has zero size or needs to be adjusted.

### File Operations

```
micropolis file dump <file> [options]
```

Options:
- `--brief, -b` - Show only summary information

```
micropolis file export <file> [options]
```

Options:
- `--format, -f` - Export format (json, csv)
- `--include-map` - Include full map data in export
- `--output, -o` - Output file path
- Region selection parameters (see above)

### City Analysis

```
micropolis city info <file> [options]
```

Options:
- `--format, -f` - Output format (text, json)
- Region selection parameters (see above)

```
micropolis city analyze <file> [options]
```

Options:
- `--format, -f` - Output format (text, json)
- Region selection parameters (see above)

### Visualization

```
micropolis visualize ascii <file> [options]
```

Options:
- `--resolution, -r` - Resolution factor (1=full, 2=half, 4=quarter)
- Region selection parameters (see above)

```
micropolis visualize map <file> [options]
```

Options:
- `--overlay` - Map overlay to display (all, traffic, pollution, landvalue)
- Region selection parameters (see above)

## File Format

Micropolis/SimCity save files are binary files with the following structure:

1. **History Data** - 6 arrays of 480 bytes each (residential, commercial, industrial, crime, pollution, and money history)
2. **Miscellaneous Data** - 240 bytes of city settings
3. **Map Data** - 24,000 bytes (120×100 grid of 16-bit values)
4. **Map Overlay Data** (optional) - 24,000 bytes for .mop files

Each tile in the map is a 16-bit value with the following bit structure:
- Bits 0-9: Tile ID (0-1023)
- Bit 10: Zone center flag
- Bit 11: Animation flag
- Bit 12: Bulldozable flag
- Bit 13: Burnable flag
- Bit 14: Conductive flag
- Bit 15: Powered flag

## Integration

This tool can be used as a library in other JavaScript/Node.js applications:

```javascript
const { CityFile } = require('./micropolis');

const city = new CityFile('path/to/city.cty');
if (city.load()) {
  const metadata = city.getMetadata();
  const zoneCounts = city.getZoneCounts();
  console.log(metadata, zoneCounts);
}
```

## TODO: Dynamic Zone Filtering

The next phase of development will implement a dynamic filtering system to highlight zones matching specific criteria, similar to the original Micropolis code:

### Data Layers for Filtering

Each of these data layers will be available for visualization and filtering:

1. **Population Density** - Shows residential, commercial, and industrial population concentrations
2. **Rate of Growth** - Areas with positive or negative growth trends
3. **Traffic Density** - Road congestion levels
4. **Pollution** - Environmental impact from industry and traffic
5. **Crime Rate** - Areas with higher crime
6. **Land Value** - Property value across the city
7. **Police Coverage** - Areas within effective police station radius
8. **Fire Coverage** - Areas within effective fire station radius

### Filter Conditions

The dynamic filter will allow specifying ranges for each condition:
- Match zones where a metric falls within a min/max range
- Combine multiple conditions (logical AND)
- Visualize matching areas with color/symbol highlighting

### Implementation Plan

1. Add data layer extraction for each metric
2. Implement filter configuration via command line options
3. Create visualization modes for each data layer
4. Add ability to combine filters for complex queries
5. Support for saving filter configurations

Example future usage:
```
node micropolis.js visualize filter haight.cty --population-min=100 --pollution-max=50 --landvalue-min=80
```

This will highlight only zones that have:
- Population density ≥ 100
- Pollution level ≤ 50
- Land value ≥ 80 