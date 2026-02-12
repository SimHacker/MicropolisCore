# micropolis.js CLI Test Suite

All commands run from the `micropolis/` directory:

```bash
cd MicropolisCore/micropolis
CITIES="../resources/cities"
```

## 1. Help

```bash
# Top-level
npm run micropolis -- --help

# Subcommands
npm run micropolis -- city --help
npm run micropolis -- visualize --help
```

Commands: `city` (dump, export, info, analyze, edit, patch-scenario) and `visualize` (ascii, emoji, mono, map, filter).

## 2. city info

```bash
# Text output
npm run micropolis -- city info "$CITIES/scenario_tokyo.cty"

# JSON output
npm run micropolis -- city info --format json "$CITIES/radial.cty"

# Region selection (20x20 tile region starting at col=40, row=30)
npm run micropolis -- city info --row 30 --col 40 --width 20 --height 20 "$CITIES/scenario_boston.cty"
```

Shows: file size, city time + year, funds, tax rate, sim speed, funding levels, game flags, zone counts.
Validates: tax (0-20, clamps to 7), speed (0-3, clamps to 3), funding (0.0-1.0, shows N/A if uninitialized).

## 3. city analyze

```bash
# Text output with LLM-friendly summary
npm run micropolis -- city analyze "$CITIES/scenario_tokyo.cty"

# JSON output
npm run micropolis -- city analyze --format json "$CITIES/scenario_boston.cty"

# Region analysis
npm run micropolis -- city analyze --row 0 --col 0 --width 60 --height 50 "$CITIES/scenario_boston.cty"
```

Shows: RCI balance percentages, power infrastructure (plants, connectivity %), services (stations, funding), transport summary.

## 4. city dump

```bash
# Brief (section headers only)
npm run micropolis -- city dump --brief "$CITIES/scenario_dullsville.cty"

# Full (hex dump of each section, first 160 bytes per section)
npm run micropolis -- city dump "$CITIES/scenario_dullsville.cty"
```

Shows: all 9 sections (6 history arrays + miscHist + map data + optional overlay), hex offsets, big-endian values.

## 5. city export

```bash
# JSON metadata (no map data)
npm run micropolis -- city export --format json "$CITIES/radial.cty"

# JSON with full tile map (large output)
npm run micropolis -- city export --format json --include-map "$CITIES/radial.cty"

# JSON with map for a small region
npm run micropolis -- city export --format json --include-map --row 45 --col 55 --width 5 --height 5 "$CITIES/scenario_tokyo.cty"

# Write to file
npm run micropolis -- city export --format json -o /tmp/radial.json "$CITIES/radial.cty"
```

Map data: 16-bit tile values (tile ID in low 10 bits + flag bits). Region bounds: --row, --col, --width, --height.

## 6. visualize ascii

```bash
# Full map
npm run micropolis -- visualize ascii "$CITIES/scenario_tokyo.cty"

# Region (30x15 tiles)
npm run micropolis -- visualize ascii --row 20 --col 30 --width 30 --height 15 "$CITIES/scenario_tokyo.cty"
```

Legend: RR/rr=residential (upper=powered center, lower=edge), CC/cc=commercial, II/ii=industrial, PP/pp=coal power, QQ/qq=police, FF/ff=fire, NN/nn=nuclear, HH/hh=hospital, XX/xx=church, SS/ss=seaport, AA/aa=airport, TT/tt=stadium.
Terrain: water, trees, rubble, road (horizontal/vertical/crossing), power lines, rail, fire.

## 7. visualize emoji

```bash
npm run micropolis -- visualize emoji --row 20 --col 30 --width 30 --height 15 "$CITIES/scenario_tokyo.cty"
```

## 8. visualize mono

```bash
npm run micropolis -- visualize mono --row 20 --col 30 --width 30 --height 15 "$CITIES/scenario_tokyo.cty"
```

Fixed-width 2-char tiles. Distinct abbreviations for each zone type (RR/rr, CC/cc, II/ii, SP/sp, AP/ap, CP/cp, FS/fs, PS/ps, ST/st, NP/np, HS/hs, CH/ch).

## 9. city edit

```bash
# Edit multiple fields in place
npm run micropolis -- city edit city.cty --funds 99999 --tax 12 --year 2025 --speed 2

# Edit funding percentages (0-100 scale)
npm run micropolis -- city edit city.cty --police-funding 80 --fire-funding 90 --road-funding 100

# Edit flags
npm run micropolis -- city edit city.cty --auto-bulldoze --auto-budget --sound

# Write to separate file (original untouched)
npm run micropolis -- city edit "$CITIES/radial.cty" --funds 50000 -o /tmp/rich_radial.cty
```

All editable fields: --funds, --year (converted to cityTime ticks), --city-time (raw), --tax (0-20), --speed (0-3), --police-funding (0-100), --fire-funding (0-100), --road-funding (0-100), --auto-bulldoze, --auto-budget, --auto-goto, --sound.

## 10. city patch-scenario

```bash
# Dry run (show what would change, don't write)
npm run micropolis -- city patch-scenario "$CITIES/scenario_tokyo.cty" --dry-run

# Patch in place
npm run micropolis -- city patch-scenario "$CITIES/scenario_tokyo.cty"

# Patch to separate file
npm run micropolis -- city patch-scenario "$CITIES/scenario_tokyo.cty" -o /tmp/tokyo_patched.cty
```

Applies the exact values `loadScenario()` (fileio.cpp) would inject: cityTime from year, funds, tax=7, speed=3, all funding=100%, all auto flags=ON. Known scenarios: dullsville, san_francisco, hamburg, bern, tokyo, detroit, boston, rio_de_janeiro.

## 11. stdin pipe support

```bash
# Pipe any city file through stdin using '-'
cat "$CITIES/scenario_detroit.cty" | npm run micropolis -- city info -
cat "$CITIES/radial.cty" | npm run micropolis -- visualize emoji -
```

## 12. Error handling

```bash
# Invalid file size
echo "garbage" | npm run micropolis -- city info -
# → Error: Invalid file size 8 bytes. Expected 27120 (.cty) or 51120 (.mop).

# File not found
npm run micropolis -- city info /nonexistent/file.cty
# → Error loading file: ENOENT: no such file or directory

# Tax rate out of range
npm run micropolis -- city edit city.cty --tax 25
# → Tax rate must be 0-20

# Speed out of range
npm run micropolis -- city edit city.cty --speed 5
# → Speed must be 0-3

# Not a scenario file
npm run micropolis -- city patch-scenario some_random.cty
# → Not a recognized scenario file: some_random.cty
# → Known scenarios: scenario_dullsville.cty, ...

# No edits specified
npm run micropolis -- city edit city.cty
# → No edits specified. Use --funds, --year, --tax, --speed, etc.
```

## Technical Notes

### File Format

Save files are big-endian (Motorola/Mac). All 16-bit values stored as big-endian shorts. 32-bit values (cityTime, funds, funding percentages) stored across two consecutive shorts — the first short is the high word. Funding percentages are fixed-point `(int)(percent * 65536)`, NOT IEEE-754 floats.

Standard .cty = 27,120 bytes: 3,120 (history) + 24,000 (map). Extended .mop = 51,120 bytes: adds 24,000 overlay.

Map is column-major: `map[x * HEIGHT + y]` where x=0..119, y=0..99.

### C++ Source References

- `fileio.cpp loadFileData()` — binary loading, endian conversion
- `fileio.cpp loadFile()` — metadata extraction, value validation
- `fileio.cpp saveFile()` — metadata writing back to miscHist
- `fileio.cpp loadScenario()` — scenario value overrides (source of patch-scenario table)
- `budget.cpp initFundingLevel()` — resets all funding to 1.0
- `allocate.cpp initMapArrays()` — `map[i] = mapBase + (i * WORLD_H)` (column-major proof)
