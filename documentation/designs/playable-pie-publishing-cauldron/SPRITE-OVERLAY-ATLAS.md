# Software sprite overlay — design atlas (batch 1.5)

> **Status:** In progress (2026-06). Runs **parallel to playable batch 1** (PB-01..05) but does
> not block it. Same philosophy as the software tile renderer: DOM/SVG + Node print first,
> WebGPU holodeck plugin later, one JSON manifest both sides read.
>
> **Ground truth:** [map-compositing-and-measurement.md §2.4](../map-compositing-and-measurement.md#24-sprites--required-on-software-print-iconic-maps-overviews),
> [§3](../map-compositing-and-measurement.md#3-holodeck-measurement-api) (hotspots as named attachments).

## TL;DR

Mount a **SoftwareSpriteLayer** (Svelte) above the map canvas. Each drawable is a **Sprite.svelte**
instance positioned via shared **MapViewport** math. Atlas metadata lives in **JSON manifests**
(colocated with tileset sprite PNGs). Named **measurements** (hotspot, attach-*, coupling-*)
feed the holodeck measure protocol and Svelte 5 runes (`createMeasureStore` / viewport provider).

**Engine sprites** (train, chopper, monster, …) sync from C++ `SimSprite` list via Embind
`getActiveSprites()`. **Plugin sprites** (skywriting airplane, agents, tools, Pac-Man) use the
same instance + manifest model; only the **source** differs.

## Architecture

```text
C++ SimSprite list ──getActiveSprites()──► engineSpriteSync.ts
Plugin controllers (skywriting, chalk, …) ──deposit──► AtmosphericLayer (RGBA + CA)
                    │                                      │
                    └──────── sprite instances ──────────────┤
                                                           ▼
         SoftwareSpriteLayer.svelte
              ├── AtmosphericLayerView (canvas blit, viewport-aligned)
              └── Sprite.svelte (sheet sprites — plane, train, …)
                    measure refs → DOM chrome / future holodeck
                    │
         MapViewport.worldPixelToScreen (same as CursorLayer)
```

## Plugin-owned atmospheric layers

Each plugin sprite **may own a transparent world-aligned RGBA layer** (half-res buffer by
default). The plugin **deposits pigment** (smoke, chalk, ink); the layer runs **diffusion +
fade** each frame (same family as the map heat CA — atmospheric, not tile mutation).

| Layer id | Plugin | Use |
|----------|--------|-----|
| `skywriting-smoke` | Skywriting airplane | Colored smoke = **atmospheric whiteboard** |
| `chalk-strokes` | (future) Colored chalk tool | Draw on chalkboard overlay |
| `whiteboard-ink` | (future) Multiplayer annotation | SimCityNet-style shared board |

**Smoke is not DOM circles anymore** — it is pixels in the layer, blended over the map, diffusing
and fading over time. **Chalk and whiteboard tools** are the same mechanism with different deposit
profiles (sharp stroke vs soft puff).

**Multiplayer (future):** layer patches as sparse `measureWrite` / command-bus records; each
player's plane deposits into a shared or per-user layer; holodeck composites the same buffer on GPU.

### Skywriting controls (shipped)

| Input | Action |
|-------|--------|
| `` ` `` or F9 | Toggle **pilot mode** |
| Arrow keys | Fly plane; emits smoke while held |
| Space | Emit smoke while held |
| Type A–Z, 0–9 | Paint letter at plane position |
| `micropolisSkywrite('TEXT')` | Auto-fly script (milestones, messages) |

Grab-the-plane drag (pointer) and explicit chalk tool plugin: SB-07 (deferred).

## Scalar field overlays (pollution, population, crime, …)

The **same** `AtmosphericLayer` + `AtmosphericLayerView` stack renders MOP / color-map
visualizations — not just deposit-based smoke.

| Mode | Update | CA | Blend | Example layer id |
|------|--------|-----|-------|-------------------|
| **Deposit** | `deposit()` each frame | `step()` with fade | `source-over` | `skywriting-smoke` |
| **Scalar field** | `fillFromTileGrid()` when data changes | `smooth()` only (no decay) | `multiply` / `screen` | `mop.pollution`, `mop.population` |

Flow:

```text
Engine scalar map (pollutionDensityMap, crimeRateMap, …)
    -> Uint8Array view from WASM heap
    -> fillFromTileGrid + colormap (overlayColormaps.ts)
    -> smooth() at low internal res (half or quarter world pixels)
    -> AtmosphericLayerView blit (stretched over map via MapViewport)
```

Low-res internal buffer + smooth + viewport stretch = classic **soft heat-map** look without
a per-tile shader. Server `/render` and holodeck WebGPU plugins read the **same colormap +
grid** (SB-08).

Helper: `scalarFieldOverlay.ts` · `updateScalarOverlayLayer('mop.pollution', values, opts)`.

**Wire-up (SB-06):** expose `getPollutionDensityMapBuffer()` etc. via Embind; toggle from
toolbar / command bus; refresh on `mapRevision` or sim tick.

## Phased path: DOM canvas now, WebGPU later

**Phase 1 (now — playable / batch 1.5):** partially transparent **DOM canvas layers**.
`AtmosphericLayer` holds an RGBA buffer; `AtmosphericLayerView` blits it viewport-aligned
over the map. Smoke, chalk, and MOP heat maps all use the same stack — pre-baked colors on
CPU (`fillFromTileGrid` + `overlayColormaps.ts`, or `deposit` + CA `step`). Good enough for
playable, print, and CI pixel tests. **Do not block playable on GPU.**

**Phase 2 (holodeck — SB-08):** hand the **same data contract** to WebGPU overlay plugins
(`MAP_OVERLAY_*` layers 41–49). The holodeck plugin may:

| What DOM does today | What WebGPU can do instead |
|---------------------|----------------------------|
| Pre-bake scalar → RGBA on CPU | Feed **raw scalar grid** from simulator WASM heap; **colormap in WGSL** (uniform ramp or 1D LUT texture) |
| `smooth()` blur on low-res buffer | Bilateral / gaussian in compute or fragment pass |
| Static stretched heat map | **Time-varying** effects: 3D Perlin `(x, y, t)` shimmer, pulsing hotspots |
| — | **Gradient-climbing particles** along scalar fields (stink lines rising from pollution sources, traffic flow streaks) |
| — | Semantically meaningful motion tied to field meaning (crime flicker, land-value glow, etc.) |

```text
Phase 1 (DOM)                         Phase 2 (WebGPU holodeck)
─────────────────                     ─────────────────────────
WASM mapData / mopData                same heap views — zero copy where possible
    │                                     │
    ├─ deposit → RGBA buffer              ├─ deposit → GPU texture (upload or write)
    ├─ fillFromTileGrid + colormap CPU    ├─ scalar bind group + colormap shader
    └─ AtmosphericLayerView canvas blit   └─ MAP_OVERLAY_* plugin composite pass
```

**Parity rule:** software/Node still rasterizes **static** frames (print, OG, `/render`) from
the same scalar + colormap spec. Interactive-only animation (particles, noise, stink lines)
is **WebGPU-only** — no need to replicate in CPU for batch jobs.

**Data handoff:** SB-06 Embind exposes `pollutionDensityMap`, `crimeRateMap`, etc. as
`Uint8Array` views (same pattern as `getMapAddress()`). DOM path reads them each sim tick;
WebGPU plugin binds the same buffer and evaluates color + motion in shader. Deposit-based
layers (skywriting smoke) upload the `AtmosphericLayer` RGBA texture — or run an equivalent
GPU CA pass later.

The sky's the limit on WebGPU; the DOM path proves the layer ids, blend modes, and viewport
math before we invest in shaders.

## Multidimensional overlay context

The overlay renderer should receive the **full field bundle**, not one buffer in isolation:

```typescript
interface MapOverlayContext {
  mapData: Uint16Array;           // tile index + status bits (ZONEBIT, PWRBIT, …)
  mopData?: Uint16Array;          // classic color-map overlay channel
  scalars?: Record<string, Uint8Array>; // pollution, crime, fire coverage, …
  tick: number;
  blinkPhase: boolean;            // ~500 ms duty cycle (engine blinkFlag or local timer)
}
```

WebGPU plugins (and DOM updaters) combine predicates across dimensions — e.g. stink lines
where `pollution > threshold && tile is industrial`, crime flicker where `crimeRate &&
ZONEBIT`, unpowered blink where `ZONEBIT && !PWRBIT`. Same context object for scalar heat
maps, deposit layers, and tile-substitution passes.

## Three kinds of map visual change

| Kind | Who mutates | Examples | Renderer role |
|------|-------------|----------|---------------|
| **Sim-driven tile animation** | Engine writes `map[]` each tick | `ANIMBIT` loops (radar spin, fire, bridge) | Dumb blit — tile index already correct |
| **Display-time tile substitution** | Renderer / overlay only | Unpowered zone **LIGHTNINGBOLT** blink | Predicate on map bits + time; **never** write sim memory |
| **Composite overlay layer** | Overlay pass above base map | MOP heat, smoke, stink particles, blink icons | Separate layer id + blend; base map texture stays stable |

**Do not** conflate sim animation with display blink. Classic loops advance tile indices in
`simulate.cpp`; blink is purely cosmetic and must not touch WASM `mapData`.

## Unpowered zone blink (first display-time effect)

Classic rule: `(tile & ZONEBIT) && !(tile & PWRBIT)` at zone **center** tiles → alternate
**LIGHTNINGBOLT** (827) over the normal center glyph, ~50% duty cycle.

Prior art:

- **Java** (`MicropolisDrawingArea`): 500 ms timer toggles `blink`; draw pass substitutes
  `LIGHTNINGBOLT` for cell index when predicate true.
- **PyGTK** (`micropolisdrawingarea.py`): optional `tileFunction(col, row, tile)` on the
  CellEngine tile renderer — same predicate, random 50% or sync to `blinkFlag`.
- **Engine** (`simUpdate`): `blinkFlag = (tickCount() % 60) < 30` — already computed; not
  yet exposed via Embind.

### Options considered

| Approach | Pros | Cons |
|----------|------|------|
| **A. Hack in `TileRenderer`** | One draw pass | Micropolis-specific; forks `@micropolis/tile-renderer`; invalidates GPU map cache every blink frame |
| **B. Optional `transformTile(x,y,tile,ctx)` hook** | Exact pygtk parity | Can't pass callbacks to shaders; CPU path needs WASM → intermediate copy; not worth a first-class API |
| **C. `MAP_OVERLAY_*` holodeck plugin** ✅ | Base map stable; instanced lightning quads or shader predicate; plug-in layer like any other effect | **WebGPU only** — deferred until holodeck |

**Decision: defer to holodeck (SB-09).** Unpowered blink is **interactive-only, WebGPU-only**.
No DOM canvas pass, no Node `/render` / print support — static export shows the canonical map
without blinking lightning bolts (same as skipping stink lines and other time-varying GPU effects).

When holodeck is live, register `micropolis.unpowered-blink` as a **`MAP_OVERLAY_*` plugin**
above the base map pass:

1. Bind `mapData` from WASM (same view as map plugin).
2. Evaluate `(ZONEBIT && !PWRBIT && blinkPhase)` in WGSL or build a compact instance buffer on
   `mapRevision`.
3. Draw `LIGHTNINGBOLT` atlas quads at matching zone centers; ~50% duty from `blinkFlag` or
   frame time.

**No `transformTile` API.** Pygtk's per-tile callback was a CPU renderer convenience. Shaders
can't take functions — any display-time tile substitution is **plumbing** (copy tiles out of WASM
into an intermediate buffer if needed, or predicate + instanced draw in a holodeck plugin), not
a special exported hook on `@micropolis/tile-renderer`. Might be useful someday; don't design the
overlay stack around it now.

**Not recommended:** mutating `mapData` for blink, or baking blink into the base map texture
upload each frame.

## JSON manifest (per sprite kind, per tileset pack)

Path: `apps/micropolis/src/lib/sprites/manifests/<pack>/<id>.json`

Colocated sheet PNG: `apps/micropolis/src/lib/images/tilesets/<pack>-sprite-<name>.png`

```json
{
  "schema_version": 1,
  "id": "airplane",
  "engineType": 3,
  "sheet": "classic-sprite-plane.png",
  "frameWidth": 48,
  "frameHeight": 48,
  "frames": [
    {
      "index": 0,
      "atlas": { "x": 0, "y": 0 },
      "measurements": {
        "hotspot": { "kind": "attachment", "x": 48, "y": 16 },
        "exhaust": { "kind": "attachment", "x": 0, "y": 24 }
      }
    }
  ]
}
```

Frame-local pixels. `hotspot` is the engine anchor (matches C++ `xHot`/`yHot`). Plugin sprites
may define arbitrary attachment names for snap-together structures and tool coupling.

Legacy `apps/micropolis/src/lib/sprites.ts` enums migrate into manifests; keep thin TS loader.

## First plugin: skywriting airplane

**Purpose:** Trace colored smoke letters over the city — user messages, population milestones,
goal celebrations. Smoke lives in an **atmospheric layer** (diffusion + fade), not per-DOM puff.

| Piece | Role |
|-------|------|
| `SkywritingPlugin.svelte.ts` | Pilot mode, path scripts, layer deposit |
| `layers/AtmosphericLayer.ts` | RGBA buffer + CA step |
| `layers/AtmosphericLayerView.svelte` | Viewport-aligned canvas blit |
| `letterPaths.ts` | Stroke polylines for A–Z, 0–9 |
| Milestone watcher | `$effect` on `micropolisReactive.cityPop` thresholds |

Airplane sprite (sheet) flies above the smoke layer; `exhaust` attachment = deposit point.

## Playbook batch (sprites)

| SB | Title | Status |
|----|-------|--------|
| [SB-01](playbooks-sprites/SB-01-manifest-schema.md) | JSON schema + classic pack manifests | in progress |
| [SB-02](playbooks-sprites/SB-02-engine-sprite-sync.md) | Embind `getActiveSprites` + sync | in progress |
| [SB-03](playbooks-sprites/SB-03-software-sprite-layer.md) | `Sprite.svelte` + `SoftwareSpriteLayer` | in progress |
| [SB-04](playbooks-sprites/SB-04-skywriting-plugin.md) | Skywriting airplane + milestones | shipped |
| [SB-05](playbooks-sprites/SB-05-atmospheric-layers.md) | Plugin RGBA layers + CA + pilot/typing | shipped |
| SB-06 | MOP scalar overlays (pollution, pop, crime) on same layer stack | deferred |
| SB-07 | Chalk / whiteboard tool plugins + multiplayer patches | deferred |
| [SB-08](playbooks-sprites/SB-08-webgpu-overlay-handoff.md) | WebGPU overlay plugins — raw scalar + dynamic colormap, particles, stink lines | deferred (batch 2) |
| [SB-09](playbooks-sprites/SB-09-unpowered-zone-blink.md) | Unpowered zone blink — WebGPU holodeck plugin only | deferred (holodeck HB-01) |

**Hub:** [playbooks-sprites/README.md](playbooks-sprites/README.md)

## Relationship to holodeck

Pre-holodeck: `createViewportMeasureProvider(viewport)` computes the same `MeasureValue` shapes
from manifest + instance pose. Post-holodeck: `MicropolisSpritePlugin` publishes identical refs;
DOM layer can switch to `backend: 'both'` like CursorLayer.

**Atmospheric / MOP overlays:** same split as `CursorLayer` — DOM canvas default until holodeck
toggle; then `MapOverlayPlugin` reads WASM scalar views and optional deposit textures while
`AtmosphericLayerView` can hide or run in `'both'` mode for parity tests.

## See also

- [HOLODECK-CUTOVER-ATLAS.md](HOLODECK-CUTOVER-ATLAS.md) — GPU map + sprite plugin layer 45
- [cursor-layer-without-holodeck.md](wisdom/cursor-layer-without-holodeck.md) — viewport math rule
- GitHub [#4](https://github.com/SimHacker/MicropolisCore/issues/4) — sprite compositing
