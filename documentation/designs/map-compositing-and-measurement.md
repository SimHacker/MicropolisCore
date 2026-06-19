# Map compositing, overlay layers, and holodeck measurement

**Status:** Active design  
**Companions:** [render-core-package.md](render-core-package.md) · [unified-webgpu-renderer.md](unified-webgpu-renderer.md) · [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) · [ui-frame-nine-slice.md](ui-frame-nine-slice.md) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md)

---

## 1. Two definitive render paths (not three)

Interactive holodeck and server-side map generation share **one data model** (`RenderDescription`, overlay buffers, `MapViewport`) but **two maintained rasterizers**:

| Path | Where | Role |
|------|--------|------|
| **Software** (`renderMicropolisMapSoftware`) | Node, CI, `/render` routes, thumbnails without a browser GPU | **Definitive reference** for map + composable overlay planes |
| **WebGPU** (`HolodeckStage` + plugins) | Browser tab (and headless Chromium when batch jobs need GPU) | **Definitive interactive** path — WYSIWYG with what the user sees |

**WebGL is not on the greenfield path.** Legacy `WebGLTileRenderer` in `@micropolis/tile-renderer` is
**frozen** — do not extend it for overlays, sprites, measure APIs, or holodeck features. It must
not block or constrain new work. See §1.1.

**Canvas** (`CanvasTileRenderer`) delegates to software — same pixels as Node (CPU fallback when WebGPU unavailable).

```text
                    RenderDescription + overlay buffers
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     render/software (Node)          HolodeckStage (WebGPU)
              │                               │
              ▼                               ▼
         PNG / RGBA8                    swapchain + pick MRT
              │                               │
              └──────── upload after approve ─┘
                         (client → server)
```

**Economics:** the server validates JSON, stores approved uploads, and runs **software** renders for feeds, OG images, and batch jobs. The **client GPU** does preview, editing, voting UI, and rich compositing at ~$0 marginal cost; uploads happen only after user approval ([render-core-package.md §0](render-core-package.md#0-client-gpu-first-browser-composes-server-describes)).

### 1.1 WebGL — frozen legacy, not a constraint; clean-slate later optional

During **greenfield development**, only **software** + **WebGPU (holodeck)** define behavior.
New features (sprites, MOP overlays, cursors, measure protocol, whiteboard, vote preview,
§3.5 collaborative tools) are implemented there first — **never** ported to legacy WebGL.

| Status | What |
|--------|------|
| **Now** | `WebGLTileRenderer` frozen; removed from `createMapTileRenderer()` default chain (`webgpu` → `canvas`/software). `TileView` may still call it directly until playable holodeck cutover — that is a **temporary bridge**, not the architecture. |
| **Greenfield** | Holodeck plugins + software compositor are the only maintained rasterizers. |
| **Later (optional)** | **Clean-slate WebGL** reimplementation — new code aligned to `RenderDescription`, reusing WebGPU + software as reference implementations. Not a port of the old 897-line renderer. |
| **Never** | Keeping legacy WebGL in sync with every new overlay “so WebGL users don’t fall behind.” |

```text
  GREENFIELD (maintained)              LEGACY (frozen)           FUTURE (optional)
  ───────────────────────              ───────────────           ─────────────────
  software (Node/print)                WebGLTileRenderer         WebGL v2 (rewrite)
  HolodeckStage + plugins              TileView bridge today     from spec + references
```

Whiteboard, vote preview (§5), and collaborative tools (§3.5) land on **software + WebGPU** only.
A future WebGL tier, if built, would **retro-implement** those specs — not drive them.

---

## 2. Composable overlay planes

SimCity Classic’s color maps (population, pollution, traffic, land value, etc.) are the **template** for a generalized overlay system — not one-off heat shaders per view.

### 2.1 Layer contract

Each overlay plane is a **plugin** (WebGPU) and optionally a **software compositor pass** (Node) driven by the same schema:

```typescript
interface MapOverlayLayerSpec {
  id: string;                    // e.g. 'mop.population', 'mop.pollution'
  blend: 'replace' | 'alpha' | 'multiply' | 'screen' | 'add' | 'tint';
  opacity?: number;
  /** If true, software raster implements this pass (server + CI). */
  software: boolean;
  /** If true, WebGPU plugin implements this pass (client). */
  webgpu: boolean;
  data: OverlayDataSource;       // mop buffer, scalar field, bitmap, vector strokes, tile-substitute rules
}
```

**Overlay context:** interactive passes receive `mapData`, optional `mopData`, scalar maps, and
`blinkPhase` together so predicates can be multidimensional — see
[SPRITE-OVERLAY-ATLAS § Multidimensional overlay context](playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md#multidimensional-overlay-context)
and [§ Unpowered zone blink](playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md#unpowered-zone-blink-first-display-time-effect).

**Playable bridge:** scalar fields and atmospheric deposits both use
`AtmosphericLayer` + `AtmosphericLayerView` (`apps/micropolis/src/lib/sprites/layers/`).
Tile-grid data -> `fillFromTileGrid` + colormap + `smooth`; deposit tools -> `deposit` +
`step`. Same viewport blit, same future holodeck/WebGPU texture. See
[SPRITE-OVERLAY-ATLAS § Scalar field overlays](playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md#scalar-field-overlays-pollution-population-crime-)
and [§ Phased path: DOM canvas now, WebGPU later](playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md#phased-path-dom-canvas-now-webgpu-later)
(raw WASM scalar → dynamic WGSL colormap, gradient particles, stink lines — interactive-only).

### 2.2 Per-layer software policy

| Layer kind | Software (Node) | WebGPU (client) | Notes |
|------------|-----------------|-----------------|-------|
| Base tile map | ✅ required | ✅ | Same tile indices + atlas |
| MOP / color overlays (population, pollution, …) | ✅ **high value** | ✅ | Server thumbnails, social previews, API |
| Display-time tile substitution (unpowered blink, …) | ❌ not implemented | ✅ holodeck only | Interactive WebGPU; **not** on Node print — see SPRITE-OVERLAY-ATLAS § Unpowered zone blink |
| Sprites (train, plane, …) | ✅ **required** | ✅ | **Print this city**, OG/thumbnails, iconic overviews — see §2.4 |
| Tool / tile cursor frame | ❌ | ✅ | All players — local + remote; see §3.3 |
| Mouse / virtual pointer | ❌ | ✅ | Screen px; local (+ optional remote if ever needed) |
| Pie menu, speech bubbles | ❌ | ✅ (+ DOM chrome) | GPU wedges/shadows; **text/windows in DOM** |
| Whiteboard / annotation strokes | ✅ planned | ✅ | Multiplayer SimCityNet had a whiteboard layer |
| Voting preview (“bouncing zone”) | optional snapshot | ✅ | See §5 |

Adding a new visualization = register overlay spec + implement **software pass if `software: true`** and **WebGPU plugin if `webgpu: true`** against the same buffer layout.

### 2.3 Layer sort order

Align with `HolodeckLayer` in `@micropolis/render-core`:

```text
MICROPOLIS_MAP (40)
MAP_OVERLAY_*  (41–49)   ← mop / heat / custom viz (tinted quads or second texture)
MICROPOLIS_SPRITE (45)
WORLD_FEEDBACK (70)
EDITING_TOOL_CURSOR (71)
…
POINTER_CURSORS (115)
```

Software compositor applies overlays in the same order using identical blend math (test: software vs WebGPU pixel diff on fixed fixtures).

### 2.4 Sprites — required on software (print, iconic maps, overviews)

SimCity without trains, planes, ships, and monsters is not SimCity. The **software path must
composite the sprite layer** — this is not optional for server-side output.

**Primary use cases:**

| Use case | Output | Sprite policy |
|----------|--------|---------------|
| **Print this city** | High-res PNG/PDF | Full sprite pass at print DPI; current animation frame or canonical pose |
| **Iconic / small full map** | Thumbnail, poster, social OG | Sprites **always on** |
| **Overview / whole-city at low zoom** | Small image, many tiles per pixel | **Enhanced overview mode** (see below) |
| **Interactive client** | WebGPU holodeck | Animated sprites every frame |

**Data source:** `SimSprite` list from engine/WASM (`getActiveSprites()`) + **plugin instances**
(skywriting, agents, tools) unified as `SpriteInstance[]`. Atlas metadata in JSON manifests under
`apps/micropolis/src/lib/sprites/manifests/<pack>/` (hotspot + named attachment measurements).
Legacy `sprites.ts` enums migrate into manifests. Same inputs for DOM overlay, Node print, and
WebGPU holodeck plugins. See [playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md](playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md).

**Interactive client (playable bridge):** `SoftwareSpriteLayer` + **plugin-owned atmospheric
layers** (RGBA canvas, CA diffusion/fade, viewport blit). Skywriting smoke = atmospheric
whiteboard; chalk/annotation tools reuse the same layer contract. See
[SPRITE-OVERLAY-ATLAS.md § Plugin-owned atmospheric layers](playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md#plugin-owned-atmospheric-layers).

**Render modes** (`RenderDescription.sprite_render`):

```typescript
interface SpriteRenderProfile {
  /** 'classic' — 1:1 atlas blit at map scale. 'overview' — enhanced legibility at low zoom. */
  mode: 'classic' | 'overview';
  /** Scale sprite art around hotspot so motion reads at thumbnail size. */
  scale_around_hotspot?: boolean;
  /** Drop shadow under each sprite for separation from tiles. */
  drop_shadow?: boolean;
  /** Minimum screen px for sprite long edge in overview mode. */
  min_sprite_px?: number;
  /** Shadow offset/blur/opacity (CSS-like, software + WebGPU share values). */
  shadow?: { offsetX: number; offsetY: number; blur: number; opacity: number };
}
```

**Overview mode** (iconic small maps): when the whole city fits in few hundred pixels, raw
16×16 sprites vanish. The compositor **scales around each sprite's hotspot** (not map center),
adds a **soft drop shadow**, and optionally boosts contrast so trains, planes, and disasters
remain distinguishable — a deliberate “cartographic emphasis” pass, not in-game pixel fidelity.

**Implementation note:** `renderMicropolisMapSoftware` gains a sprite compositor pass after
tiles (+ optional MOP). WebGPU `MicropolisSpritePlugin` uses the same profile for parity tests.
Default `layers` for export/print: `['map', 'sprites']`.

### 2.5 Tileset packs, MOP mixing, and per-set sprites

SimCity Classic **city sets** (Maxis add-on tilesets: Ancient Asia, Wild West, Moon Colony, …)
are not just a replacement `tiles.bmp`. Each pack under `content/micropolis/tilesets/<id>/`
includes:

| Asset class | Examples | Notes |
|-------------|----------|--------|
| Tile atlas | `tiles.bmp` (from set-specific source, e.g. `asia.bmp`) | 1024×16×16 index tiles; drives map raster |
| Animated agents | `chopper.bmp`, `plane.bmp`, `train.bmp`, `ship.bmp`, `tornado.bmp`, … | **Per-set art** — Ancient Asia overrides helicopter frames; not shared with Classic |
| Disasters / UI chrome | `monster.bmp`, `explode.bmp`, scenario splash bmps, toolbar | Some shared across sets, some unique — audit per pack |
| Source receipt | `scus*.rc2` | Windows resource stubs; bitmaps extracted at import time |

**MOP role:** the engine **mop** buffer is how we mix tile indices, overlay tints, and (eventually)
which virtualized atlas slice to use when multiple tileset packs are registered. Renderer plugins
should treat a tileset pack as a **content plugin**: atlas URLs + sprite sheet manifest + optional
zone/agent extensions (existing plugin zones / plugin agents in the engine).

**Target behavior:**

1. **Select active pack(s)** — keyboard / command-bus tile-set toggle (already partially wired); default `classic`.
2. **Virtualized atlases** — one WebGPU texture array or bindless table; map tile index → (pack, local index) without copying full atlases per frame.
3. **Sprite atlas resolution** — `SimSprite.type` + `frame` + **active tileset pack id** → bitmap rect in the correct `chopper.bmp` (or plugin override).
4. **Override / add / replace** — plugins may supply new sprite sheets or patch individual animation frames; same publishing slug model as [content-plugins-and-autodiscovery.md](content-plugins-and-autodiscovery.md).
5. **Software + WebGPU parity** — export/print uses the same pack + sprite manifest as the interactive holodeck.

**Receipt / bug:** [#9](https://github.com/SimHacker/MicropolisCore/issues/9) — `ancientasia/tiles.bmp` was accidentally copied from Classic at import (`ee9e1b1`); correct atlas is `asia.bmp` in the same directory. Per-set `chopper.bmp` files were extracted correctly and already differ by MD5 across packs.

---

## 3. Holodeck measurement API

`MapViewport` alone is insufficient once cursors, tools, voting previews, and whiteboard strokes live on different plugins. The **stage** exposes a general query API so DOM/SVG overlays can attach labels, dialogs, and tooltips without duplicating layout math.

### 3.1 `HolodeckMeasure` (target API)

```typescript
type MeasureKind =
  | 'bounds'           // axis-aligned rect in screen CSS px
  | 'point'            // hotspot / anchor
  | 'polygon'          // optional, for irregular shapes
  | 'attachment';      // named attach point on an object

interface MeasureQuery {
  layerId: string;           // plugin id, e.g. 'editing-tool-cursor'
  objectId?: string;         // instance within layer
  attachmentId?: string;     // e.g. 'inner-tl', 'hotspot', 'label-above'
  kind: MeasureKind;
  space?: 'screen' | 'world-tile' | 'world-pixel';
}

interface MeasureResult {
  ok: boolean;
  space: 'screen';
  bounds?: { x: number; y: number; w: number; h: number };
  points?: Array<{ x: number; y: number; id?: string }>;
}

interface HolodeckMeasurable {
  /** Plugins implement selectively. */
  measure?(query: MeasureQuery, ctx: HolodeckPluginContext): MeasureResult | null;
}

// On HolodeckStage:
measure(query: MeasureQuery): MeasureResult | null;
measureBatch(queries: MeasureQuery[]): MeasureResult[];
```

**Examples:**

| Query | Use |
|-------|-----|
| `layerId: 'editing-tool-cursor', attachmentId: 'inner'` | Tile footprint for query tool / bulldoze preview |
| `… attachmentId: 'outer'` | Nine-slice rim — tooltip below frame |
| `layerId: 'pointer-cursors', objectId: 'local', attachmentId: 'hotspot'` | Pie menu wedge origin |
| `layerId: 'vote-preview', objectId: zoneId, attachmentId: 'bounce-apex'` | Anchor voting dialog thumbnail |
| `layerId: 'map', objectId: 'tile:12,34', kind: 'bounds'` | “What is this?” magnifier |

`MapViewport.worldTileToScreenRect()` remains the **built-in** measure for raw tile geometry; plugins delegate or extend for frames, sprites, and procedural previews.

### 3.2 DOM vs WebGPU split — `CursorLayer` coordinates both

**Incremental policy:** ship **DOM/SVG** cursor frames first (playable Phase B); add
**WebGPU** cursor pixels later as a parallel backend on the same `CursorLayer.svelte`
(`CursorBackend: 'dom' | 'webgpu' | 'both'`). Use identical viewport/tile clipping math in
both backends so switching is config-only. Measure read/patch attaches when holodeck lands;
until then DOM placement uses the same `MapViewport` helpers the GPU plugins will use.

| Drawn in **WebGPU** (when backend enabled) | Drawn in **DOM/SVG** (default for playable; chrome always) |
|---------------------------------------------|-------------------------------------------------------------|
| Tile tool frame pixels (optional backend) | **Tool frame + ghost** (Phase B default) |
| Pointer glyphs | User avatar icons, labels, tool hints |
| Chalk / whiteboard strokes | Infovis overlays, vote dialogs, chat |
| Player avatar display-list quads | Query popups, magnifier **content** |

**Rule:** `CursorLayer.svelte` is the parallel coordinator — one API, multiple backends.
Playable ships with **DOM/SVG** tool frames; holodeck plugins add **WebGPU pixels** without
replacing the component. Remote tile-only cursors may use GPU-only (`dom: []`) later.

| Tool | Space | GPU | DOM |
|------|-------|-----|-----|
| Bulldozer / residential | `world-tile` | nine-slice frame | optional avatar attached to frame |
| Chalk | `world-pixel` | stroke line while down | usually none |
| Remote observer | `world-tile` | thin rim only | none |

Input → `CursorPresence[]` → `CursorLayer` → plugins + conditional DOM. Remote players
get tile-snapped WebGPU frames; remote **mouse** sprites are not shown (SimCityNet lineage).

### 3.3 Tile cursor sources (pluggable)

Both are `DisplayListEntry` `frame` or `static` on `HolodeckLayer.EDITING_TOOL_CURSOR`:

| Style | Frame model | Use |
|-------|-------------|-----|
| **`cursor.tool.nineslice`** | Hollow nine-slice rim; inner = exact tile footprint | Classic multiplayer SimCity — dual stroke, scalable rim |
| **`cursor.tool.center-only`** | Nine-slice with **zero edge insets** — center cell only, **fixed size** at tile pixel resolution | Hand-drawn bitmap cursor authored at the size it will be used (1×1, 3×3, … tiles) |
| **`cursor.tool.tiled-atlas`** | `static` quad per tile cell, atlas UVs | Custom art per tool/player color |

Plugins resolve style id from tool catalog + presence record (`playerId`, `toolId`, `rimPolicy`).

### 3.4 JSON protocol (sparse read / write / patch)

The measurement API is **JSON-first**: every message is schema-validated, extensible via `MeasureValue.ext`, and safe to log, replay, or send over a WebSocket for remote DOM chrome.

**Schema:** `packages/render-core/schema/holodeck-measure.schema.json`  
**Types:** `@micropolis/render-core` → `measure/*`

#### Ref encoding

Stable string keys for sparse maps and reactive subscriptions:

```text
layerId[/objectId[/attachmentId[/kind]]]
```

Examples:

| Ref | Meaning |
|-----|---------|
| `editing-tool-cursor/local/inner/bounds` | Local tool frame inner tile footprint |
| `pointer-cursors/local/hotspot/point` | Pie menu wedge origin |
| `map/tile:12,34,3,3/bounds` | 3×3 tile rect on map layer |

Use `encodeMeasureRef({ layerId, objectId, attachmentId, kind })` and `parseMeasureRef(ref)`.

#### Three operations

| Op | Direction | Purpose |
|----|-----------|---------|
| **`read`** | UI ← holodeck | Sparse read: `{ op:'read', refs:[…] }` → `{ frame, values, missing? }` |
| **`write`** | UI → holodeck | Sparse write: `{ op:'write', patches:{ ref: { …json… } } }` — plugins with `applyMeasure` accept input |
| **`patch`** | UI ← holodeck | Incremental: `updates` (whole value) and/or `propUpdates` (sparse keys) |

`HolodeckStage` methods:

```typescript
stage.measureRead({ op: 'read', schema_version: 1, refs });
stage.measureWrite({ op: 'write', schema_version: 1, patches });
stage.measurePatch(refs, clientFrame);  // after render()
stage.getFrame();                       // coherency token
```

`MeasureValue` core: `ok`, `space`, optional `bounds` / `points`, plus **any bindable
property** at the top level — geometry (`left`, `top`, `width`, `height`), CSS paint
(`opacity`, `color`, `marginTop`, …), or arbitrary shader uniforms (`rimWidth`,
`glowFalloff`, …). Standard CSS names carry their usual meaning when applicable.
Holodeck plugins may publish `_constraints` per key for two-way reactive binding.

#### Bindable properties (not just x/y/w/h)

| Category | Example keys | Notes |
|----------|--------------|-------|
| Layout | `left`, `top`, `width`, `height`, `marginTop` | CSS px; syncs with `bounds` |
| Paint | `opacity`, `color`, `lineWidth`, `strokeColor` | `lineWidth` ↔ `strokeWidth` |
| Shader | `rimWidth`, `glowStrength`, `tintMix` | Plugin-defined; any JSON scalar |
| Meta | `_constraints`, `_meta.readonly` | Not written by UI |

**Write** patches are sparse property bags per ref. **Patch** responses prefer
`propUpdates` (changed keys only) for efficient rune binding.

#### Constraints (two-way bind)

```typescript
interface MeasurePropertyConstraint {
  type?: 'number' | 'string' | 'boolean' | 'color';
  min?, max?, step?, enum?, default?;
  readonly?: boolean;
  css?: string;
}
```

#### Reactive binding (SvelteKit runes)

Framework-agnostic helpers in `render-core`:

```typescript
import { createMeasureSnapshot, applyMeasurePatch, syncMeasureRefs } from '@micropolis/render-core';

const snapshot = createMeasureSnapshot(refs);
// each frame:
syncMeasureRefs(stage, refs, snapshot);
// snapshot.values['editing-tool-cursor/local/inner/bounds'] → DOM placement
```

Svelte 5 wrapper (`apps/micropolis/src/lib/holodeck/createMeasureStore.svelte.ts`):

```typescript
const measures = createMeasureStore(stage, {
  refs: ['world-strokes/local', 'editing-tool-cursor/local/inner/bounds'],
});

// Two-way bind: chalk line width (UI slider ↔ holodeck shader)
const lineWidth = measures.bindProp('world-strokes/local', 'lineWidth', {
  min: 1, max: 24, step: 0.5, default: 2,
});

// One-way read after tick
measures.tick();
const opacity = measures.getProp('world-strokes/local', 'opacity');

$effect(() => {
  measures.write({ 'editing-tool-cursor/local': { tileX, tileY, toolId } });
  measures.tick();
  lineWidth.pull(); // refresh from holodeck if plugin adjusted value
});
```

**Two-way rule:** UI assigns `lineWidth.current = 4` → `setProp` + constraint clamp →
`measureWrite` → `render` → `propUpdates` on `tick` → snapshot merge. Read-only keys
(`_meta.readonly`, `constraint.readonly`) reject UI writes.

**Coherency rule:** always `write` → `render` → `patch` in that order. The stage's monotonic `frame` id lets the UI detect missed frames and catch up via a full patch. DOM chrome reads **only** from the snapshot — never duplicates viewport math.

React/other: same snapshot + `applyMeasurePatch`; hook `tick()` off `requestAnimationFrame` or your renderer's post-frame callback.

### 3.5 Future goals (design for, do not implement yet)

The JSON measure protocol and `CursorLayer` coordinator are intentionally general enough
for **multi-player collaborative tools**, **tool-as-vehicle**, and later **Factorio-like
parameterized blueprints**. Current sprint work stays single-player; these are north stars
that should inform ref shape, property constraints, and role metadata — not block shipping.

#### Collaborative tools (shared instrument, many hands)

| Scenario | Measure / cursor shape | Notes |
|----------|------------------------|-------|
| **Pall bearers** | One shared ref; each player owns an `attachmentId` (`handle-n`, `shoulder`) | Combined pose drives one display-list rig |
| **Opposite corners** | `zone-draft/shared` with `left`, `top`, `width`, `height`; player A writes `topLeft*`, player B writes `bottomRight*` | `_constraints` per key; merge in plugin before render |
| **Water-balloon car** | Vehicle ref (`tool-vehicle/alice`) + passenger ref (`tool-vehicle/alice/passenger/bob`) | Driver: locomotion props; passenger: `throwAzimuth`, `throwPower` |
| **Zone vote / bounce** | Shared `vote-preview/{proposalId}`; per-player yes via same-tool-same-footprint or dialog | Bounce apex = quorum gap; supersede on relocate — [§5](map-compositing-and-measurement.md#5-multiplayer-voting-preview-historical--target) |

**Design rules (future):**

- **One logical tool, many presences** — shared `objectId`, distinct `playerId` / role in
  patch keys or attachment ids.
- **Property ownership** — `_meta.readonly` or per-role `_constraints` so only the driver
  writes `velocity`, only corner-owner writes their corner.
- **Conflict-free merge** — plugins own merge policy (last-writer, CRDT, or lock) before
  applying `measureWrite`; protocol stays JSON sparse bags.
- **Same coherency loop** — `write` → `render` → `propUpdates`; multiplayer is more refs
  and roles, not a different API.

#### Tool-as-vehicle

Bulldozer, road paver, rail layer, and similar tools are naturally **vehicles**: a tile-
snapped body with heading, speed, and tool-head parameters. The cursor frame *is* the
vehicle silhouette; measure props include `heading`, `trackWidth`, `bladeDepth`, etc.

```text
editing-tool-vehicle/alice/body/bounds     ← holodeck draws chassis
editing-tool-vehicle/alice/blade/bounds    ← attachment follows body
editing-tool-vehicle/alice                 ← writable: speed, heading, bladeDepth
```

Passengers (second player on same vehicle) bind to **attachment refs**, not a second body.
Driver and gunner share one vehicle ref tree — same pattern as pall bearers.

#### Parameterized templating (Factorio-like, later)

Two-way measure binding is the UI seam for **blueprint parameters**: a zone template or
rail spline exposes `width`, `curveRadius`, `signalSpacing`, `material`, … as bindable
props with `_constraints`. Saving a template = serializing the ref + props snapshot;
placing from template = `measureWrite` seed + ghost preview until commit.

Not in scope now — but **avoid** baking one-player-only assumptions into ref encoding,
`MeasureValue` keys, or `CursorPresence` (keep `role?`, shared `toolInstanceId?` as future
fields in mind).

**See also:** [virtual-cursor-layer.md §7.2](virtual-cursor-layer.md#72-future-collaborative-tools-and-vehicles-design-for-not-yet),
[multiplayer-browser-lessons.md](multiplayer-browser-lessons.md),
[virtual-pointer-and-pie-cursors.md §10](virtual-pointer-and-pie-cursors.md).

---

## 4. Implementation order (updated)

**Playable first:** Phases A–C on the existing WebGL map. Holodeck migration and WebGPU
cursor **pixels** follow only after the vertical slice definition of done ([micropolis-playable-game-readiness.md](micropolis-playable-game-readiness.md)).

| Step | When | Work |
|------|------|------|
| **0** | **Now** | Playable A–C: HUD, tools, click-to-build, messages/budget |
| **0b** | **With Phase B** | `CursorLayer.svelte` — **DOM/SVG** tool cursor; same viewport clip math as future GPU layer; `CursorBackend` config stub |
| **1** | After playable | `MicropolisMapPlugin` on `HolodeckStage`; software raster stays aligned |
| **2** | After playable | `CursorLayer` **`webgpu`** backend + `EditingToolCursorPlugin` (parallel to DOM; toggle `dom` \| `webgpu` \| `both`) |
| **3** | After playable | Generalized **MOP overlay** schema + software pass + WebGPU tint pass |
| **4** | After playable | **Sprite layer — software required** (`renderMicropolisMapSoftware` + WebGPU plugin); overview/print profiles |
| **5** | Later | Whiteboard layer, vote preview (§5), §3.5 collaborative tools — software + WebGPU only |
| **6** | Optional later | Clean-slate WebGL tier (rewrite from spec; not legacy port); remove frozen `WebGLTileRenderer` when holodeck + software cover all export paths |

---

## 5. Multiplayer voting preview (historical + target)

The X11/Tcl/Tk **multiplayer SimCity** shipped (~early 1990s) behaviors we want to exceed.
The Sims adds a complementary pattern: **UI objects placed in the world** during interaction
(wall cursor, placement ghost). Micropolis should support **both** — framed civic dialog
*and* in-world WYSIWYG affordances — on the same proposal state.

### 5.1 Two surfaces, one proposal

| Surface | Lineage | Role |
|---------|---------|------|
| **Vote dialog window** | X11/Tcl/Tk tax/budget dialog; SimCityNet unanimous vote panel | Tangible, **persistent**, **resolvable** multiplayer activity — chat, tallies, close-up thumbnail, dismiss when settled |
| **In-world preview** | SimCityNet bouncing zone; Sims **wall cursor object** | Bring the interface **into the map** — shadow, bounce, ghost building, dataviz overlays, direct manipulation |

Neither replaces the other. The dialog frames the civic decision (like raising taxes). The
bouncing building *is* the proposal on the ground — visible to everyone panning the city,
not buried in chrome.

```text
  proposal command (expensive zone)
           │
           ├── VotePreviewPlugin (WebGPU)     shadow + isometric bounce @ map location
           ├── measure() anchors              Svelte DOM above canvas (labels, dialog, chat)
           └── command bus / CRDT             votes, quorum, supersede rules (no GPU on server)
```

**DOM rule:** player labels, vote tallies, discussion, and the framed dialog are **Svelte
components above the canvas**, positioned only via `stage.measure()` / `createMeasureStore`
— never duplicate viewport math in the UI layer. GPU draws world feedback; DOM draws text,
windows, and rich editors anchored to measured attachment points.

### 5.2 Bouncing building — height encodes quorum gap

Ground shadow + **isometric building sprite** oscillates between ground and an apex altitude.
**Bounce apex height is proportional to votes still needed to confirm** — not votes already
cast:

```text
  apexWorldUnits = f(votesRequired - votesYes, buildingFootprint)
```

| `votesRequired - votesYes` | Visual |
|----------------------------|--------|
| 0 (quorum met) | Building **lands** — bounce stops, zone commits |
| 1 | Low bounce — almost there |
| N (large session) | High bounce — draws attention across the map |

Optional measure props on `vote-preview/{proposalId}`: `bounceApex`, `votesRequired`,
`votesYes`, `phase` (`proposed` | `bouncing` | `landed` | `superseded`).

Software path: optional **static PNG** of vote preview for email/OG; animation is WebGPU-only.

### 5.3 Solo → duo → classroom — one continuum, no mode switch

**Single player:** expensive placement does **not** open a voting dialog. The player
proposes by placing as today; the UI **seamlessly** becomes a bouncing building at **height
1** — the proposer's implicit first “yes.” No special solo UX branch in the renderer; only
`votesRequired === 1` collapses the civic chrome.

**Two players:**

1. Player A selects airport (or power plant, …) and draws at tile T → **proposal** + bounce
   at height = `votesRequired - 1` (A counted as first yes).
2. Player B can:
   - Select the **same** building tool and draw at **the same** tiles → **second yes** →
     building lands (if that satisfies quorum).
   - Select the same or another building and draw **elsewhere** → **modifies the proposal**
     (new location/type; prior yes-votes on the old proposal **cancel** / supersede).

**Many players:** same rules scale; cap `votesRequired` (and UI density) at session policy
(e.g. classroom of ~30; hard sanity cap ~100). Bounce height and dialog tally stay in sync
via command-bus state, not GPU logic.

Direct-manipulation voting is intentional: **you do not need a modal “Yes” button** if
drawing the same building in the same place *is* assent — the tool cursor is the ballot.

### 5.4 Measure anchors for vote chrome

| Query | Use |
|-------|-----|
| `layerId: 'vote-preview', objectId: proposalId, attachmentId: 'bounce-apex'` | Dialog thumbnail, “close-up” iframe, arrow callout |
| `… attachmentId: 'ground-shadow'` | Label stack below proposal on map |
| `… attachmentId: 'dialog-frame'` | Tcl/Tk-style vote window origin (nine-slice frame) |
| `… attachmentId: 'tally-badge'` | Per-player yes/no avatars along dialog rim |

Vote dialog embeds a **close-up tile view** of the bouncing building (nested canvas or
static snapshot) at `dialog-viewport` — same pixels as the world preview, WYSIWYG.

Remote players: **tile tool cursors in WebGPU** (thin rim); local **fat** rim; no remote
mouse sprites (SimCityNet lineage).

### 5.5 Target architecture

| Piece | Layer / API |
|-------|-------------|
| Vote / proposal state | Command bus + CRDT or session server (no GPU on server) |
| Supersede rule | New proposal at different tile/type cancels prior yes-votes on old proposal |
| Ground shadow + bounce | `VotePreviewPlugin` @ ~72; apex from `votesRequired - votesYes` |
| Dialog + chat + labels | Svelte above canvas; `createMeasureStore` + `bindProp` for live tallies |
| Dialog thumbnail | `stage.measure('vote-preview', proposalId, 'dialog-viewport')` |
| WYSIWYG assent | Same tool + same footprint → `poke.doTool` records yes-vote, not immediate commit until quorum |
| Whiteboard layer | Shared strokes over map during discussion ([`w_tk.c` / SimCityNet lineage](virtual-pointer-and-pie-cursors.md)) |

Historical behaviors to preserve or exceed:

- **Expensive zone placement** — power plant, airport, etc. requires quorum; text/voice in dialog.
- **Bouncing zone preview** — shadow + isometric bounce; height = remaining votes needed.
- **Unanimous mode** — `votesRequired = connectedPlayers` (or role-weighted quorum).

**See also:** [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md) (civic object, proposals on map), [multiplayer-browser-lessons.md](multiplayer-browser-lessons.md) (every proposal should have a map location), §3.5 collaborative tools (shared refs, role-scoped writable props).

---

## 6. Success criteria

- Node can render map + **sprites** + registered software overlays from `RenderDescription` with no GPU.
- **Print this city** and iconic thumbnails include sprites; overview mode legible at low zoom.
- Browser composes the **same** overlay stack on WebGPU; pixel tests agree on fixed fixtures for software-backed layers.
- `stage.measure()` / `measureRead` / `measurePatch` return stable screen rects for tool cursor inner/outer and tile picks.
- WebGL legacy code is **not** updated for new features; greenfield = software + WebGPU only.
- Optional future: clean-slate WebGL rewrite aligned to `RenderDescription` (not maintaining old renderer).
- Client renders rich previews; server stores **approved** uploads — not a render farm.

---

## 7. Related code today

| Artifact | Location |
|----------|----------|
| Software raster | `packages/render-core/src/raster/software.ts` |
| `RenderDescription` / `tile_layers` blend | `packages/render-core/src/schema/description.ts` |
| `HolodeckStage` | `packages/render-core/src/webgpu/holodeck-stage.ts` |
| Measure protocol | `packages/render-core/src/measure/`, `schema/holodeck-measure.schema.json` |
| Svelte measure store | `apps/micropolis/src/lib/holodeck/createMeasureStore.svelte.ts` |
| Cursor coordinator | `apps/micropolis/src/lib/input/CursorLayer.svelte` |
| `HolodeckPlugin` | `packages/render-core/src/holodeck/types.ts` |
| `MapViewport` | `packages/render-core/src/viewport/MapViewport.ts` |
| Legacy WebGL path (frozen) | `packages/tile-renderer/src/WebGLTileRenderer.ts` — bridge only; no new features |
| `/render` route | `apps/micropolis/src/routes/render/` |
