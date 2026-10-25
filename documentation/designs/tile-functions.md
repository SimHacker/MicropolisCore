# Tile functions: computing what each visible tile shows, in the view

**Status:** Design. The Python tile engine had this; the TypeScript renderers in
[`packages/tile-renderer`](../../packages/tile-renderer/) don't yet.

A tile function is an optional function the view runs over every tile it is about to draw: it gets
the tile's column, row and cell value, and returns the tile number to draw. It runs only over what
is on screen, after the map is read and before the tile is looked up in the atlas. It needs no
overlay buffer, no second map, and no change to the simulation's data.

## Where it comes from

Don's C++ tile engine for the Python Micropolis took a `tileFunction` argument, called once per
drawn cell with `(col, row, tile)`, whose integer result replaced the tile
(`src/TileEngine/src/tileengine.cpp` in the [micropolis](https://github.com/SimHacker/micropolis)
repo). The SimCity view used it to show power outages:

```python
def tileFunction(col, row, tile):
    if (tile & ZONEBIT) and not (tile & PWRBIT) and random.random() < 0.5:
        tile = LIGHTNINGBOLT | (tile & ALLBITS)
    return tile
```

Every unpowered zone centre showed the lightning bolt instead of its own tile, flickering at random,
and the map itself never changed.

## The SimCity power blink, done properly

The bolt should blink on a real-time duty cycle, the same for every unpowered zone, like the
original game's blink, not flicker at random:

```wgsl
fn tileFunction(col: i32, row: i32, cell: i32) -> i32 {
    let unpoweredZone = (cell & ZONEBIT) != 0 && (cell & PWRBIT) == 0;
    let blinkOn = fract(uniforms.time * uniforms.blinkHz) < uniforms.blinkDuty;
    return select(cell, LIGHTNINGBOLT | (cell & ALLBITS), unpoweredZone && blinkOn);
}
```

`time`, `blinkHz` and `blinkDuty` are uniforms; the view redraws at its own frame rate whether or
not the simulation has ticked. Micropolis's cell bits are `PWRBIT` `0x8000`, `ZONEBIT` `0x0400` and
the tile number in `LOMASK` `0x03ff`; `LIGHTNINGBOLT` is tile 827.

## Where it goes in the renderers

The WebGPU renderer's fragment shader reads the cell, masks it with `0x03ff`, and looks the tile up
in the atlas ([`WebGPUTileRenderer.ts`](../../packages/tile-renderer/src/WebGPUTileRenderer.ts)).
The tile function goes between the read and the mask:

```wgsl
let cellValue = i32(textureLoad(mapTexture, mapCoord, 0).x);
let shownCell = tileFunction(mapCoord.y, mapCoord.x, cellValue);   // new
let rawTileValue = ((shownCell & 0x03ff) + ...) % tilesPerSet;
```

- **WebGPU and WebGL**: the function is a snippet of WGSL or GLSL spliced into the shader when the
  pipeline is built, with its own uniforms. A renderer with no tile function compiles the identity.
- **Canvas**: the same function in TypeScript, called per visible tile.
- **One source for both**: a small expression form (bit tests, comparisons, `select`, arithmetic,
  `time`, named constants) that compiles to WGSL, GLSL and TypeScript, so a tile function is written
  once. Anything beyond it can be written in each language by hand.

## What else it's for

- **Animation without touching the map**: fire, water, traffic and radar tiles cycled by time.
- **Selection and hover**: highlight the zone under the pointer, or every tile of one kind.
- **Data views**: with a second texture bound (land value, pollution, crime, traffic density), show a
  marker on every tile above a threshold, computed per visible tile, not stored.
- **Teaching**: show each tile's raw bits, or which bits are set, as a different tile.
- **Other machines' screens**: an Apple ]['s text page drawn as tiles from a character-set atlas,
  where the tile function makes `FLASH` characters blink on the same kind of duty cycle
  ([DISPLAY-DEVICES.md in the cabinet](https://github.com/SimHacker/WillWrightShowForFood/blob/main/packages/cabinet/DISPLAY-DEVICES.md)).

## Rules

- A tile function is pure: column, row, cell, uniforms and bound textures in; a tile number out. It
  never writes, so it can't disturb the simulation or another view.
- It costs only what's on screen: a 120 × 100 map in a 40 × 30 view runs it 1,200 times a frame, not
  12,000.
- Several views of one map can each have their own.

## Order of work

1. The hook in the WebGPU and canvas renderers, with the identity as default.
2. The power blink as the first tile function, with `time`, rate and duty as uniforms.
3. The expression form compiling to WGSL and TypeScript.
4. Second textures for data views.

↑ [designs](README.md)
