# Unified WebGPU renderer

**North star:** one WebGPU device, one depth buffer, one pick buffer family, one frame loop — Micropolis city maps, Sims holodeck lots, characters, terrain, architecture, floor-grid feedback, sprites, and pie menus (feathered desaturated shadows, head in the center) all compose through the same pipeline.

**Specifications:**

| Doc | Role |
|-----|------|
| [vitamoo/webgpu-renderer-design.md](../vitamoo/webgpu-renderer-design.md) | Holodeck composition, object IDs, WGSL scope, display list §7, implementation order §4 |
| [vitamoo/webgpu-renderer-status.md](../vitamoo/webgpu-renderer-status.md) | What ships today (character GPU path, picking, batched compute) |
| [vitamoo/ui-overlay-encyclopedia.md](../vitamoo/ui-overlay-encyclopedia.md) | Pie shadow/feather math, selection marker, speech bubbles |
| [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) | Virtual mouse, pie policies, tile cursor autoscroll, MP presence |
| [map-compositing-and-measurement.md](map-compositing-and-measurement.md) | Software + WebGPU dual path, overlay planes, `HolodeckMeasure`, client upload |
| [ui-frame-nine-slice.md](ui-frame-nine-slice.md) | Nine-slice frames for tool cursor and window chrome |
| [simcity-tool-palette-design.md](simcity-tool-palette-design.md) | Totem-pole palette ↔ pie menus; cost/size; MP cursor legend |
| [piecraft/README.md](piecraft/README.md) | PieCraft, PIE-MENU-MODEL, runtime-editable pie research |
| [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) | Micropolis app wiring, software/headless fallbacks, TODO index |

---

## 1. Shared core + domain packages

**Target package:** [`render-core-package.md`](render-core-package.md) — **`@micropolis/render-core`** holds viewport, schemas, holodeck plugins, and a **WebGPU-native** `HolodeckStage` (no WebGL-shaped compositor API).

| Package | Role |
|---------|------|
| **`@micropolis/render-core`** | Shared plumbing; vitamoo + micropolis both depend on it |
| **`vitamoo`** | Character GPU passes, mesh WGSL, deform/animate — `HolodeckPlugin` |
| **`@micropolis/micropolis-render`** (TBD) | Map + sprite plugins, tile WGSL |
| **`@micropolis/tile-renderer`** | **Scaffolding only** — WebGL/Canvas/software export until retired |

**WebGPU absolutist rule:** interactive holodeck is WebGPU-only. WebGL/Canvas do not implement `HolodeckStage`; they only rasterize `RenderDescription` for teaching and headless fallback.

| Package | Today | Target |
|---------|--------|--------|
| **`packages/vitamoo`** | `Renderer` — mesh pass, pick MRT, GPU deform, display-list types | Plugs into `HolodeckStage` from render-core |
| **`packages/tile-renderer`** | `MapViewport`, `WebGPUTileRenderer`, scaffolds | Types move to render-core; map becomes micropolis-render plugin |

`@micropolis/tile-renderer` is not a parallel forever-world. It is **scaffolding** until the tile grid is a holodeck layer on the shared stage.

WebGL and Canvas tile backends remain **capability fallbacks** for teaching, old browsers, and headless workers without WebGPU — not the compositor model for Sims + Micropolis Home.

---

## 2. Holodeck frame graph (z-buffered)

One camera (perspective for lots, orthographic for top-down city — see §5), one depth buffer, pick buffers where needed.

```text
clear (+ optional fadeScreen)
  → environment (layer sort)
       terrain (5) → floor grid / tiles (4) → walls (3) → roofs → gap covers
       → optional: micropolis ortho map (7) as textured ground or instanced cell quads
  → props / objects (2) — z-buffered sprites or static meshes
  → characters (1) — skinned meshes + GPU deform
  → world feedback (highlight / selection uniforms on existing mesh shader)
  → UI overlay (ui entries, layer 'overlay')
       pie: resolve scene → desaturate fullscreen quad → feather vignette → shadow → wedges
       pie center: skinned head-only entry (bone-local, ortho center) — design §3.9, encyclopedia §2
       floor-grid feedback, editing-tool frame cursor, SimSprite billboards (static entries, depth on)
       pointer cursors (screen px, local + remote) — see virtual-pointer-and-pie-cursors.md
  → optional: speech/thought (DOM/canvas on top, or ui entries) — encyclopedia §4
endFrame → swapchain
```

**Pick buffer:** every world draw that must be clickable writes `(idType, objectId, subObjectId)` into the vitamoo MRT pick targets; `readObjectIdAt(x, y)` resolves to catalog, Sim, tile tool, or pie wedge via app-side maps (design §2.3).

### Object ID types (extend as layers land)

| `idType` | Meaning |
|----------|---------|
| `0` | None / background |
| `1` | Character (skinned body mesh index → subObjectId) |
| `2` | Object / prop |
| `3` | Wall |
| `4` | Floor / floor tile |
| `5` | Terrain |
| `6` | Plumb-bob / selection marker |
| `7` | **Micropolis map cell** (tile index + zone bits in app map) |
| `8` | **Micropolis sprite** (train, plane, monster, tornado — world-pixel space) |
| `9` | **UI** (pie wedge, toolbar, query affordance) |

---

## 3. Display list = plugin contract

Vitamoo already defines the unified draw vocabulary in `packages/vitamoo/vitamoo/display-list.ts`:

| `kind` | Holodeck role |
|--------|----------------|
| `static` | Terrain, floor, walls, roofs, props, **micropolis cell quads**, **sprites**, glTF plumb-bobs |
| `skinned` | Bodies, accessories, **pie-menu center head** |
| `ui` | Fullscreen desaturate, feather, pie chrome, HUD — ortho / NDC |
| `frame` | **Nine-slice borders** — editing-tool cursor, window/panel chrome ([ui-frame-nine-slice.md](ui-frame-nine-slice.md)) |

**Layer** (`DisplayListLayer`): `'world'` | `'overlay'` | numeric sort key — e.g. `10` terrain, `20` floor, `30` walls, `40` micropolis-map, `50` objects, `60` characters, `100` pie overlay.

**Plugin shape (target API on `Renderer` or `HolodeckStage`):**

```typescript
interface HolodeckPlugin {
  id: string;
  layer: DisplayListLayer;
  /** Build or update entries for this frame; may cache GPU textures/meshes. */
  collect(viewport: HolodeckViewport, frame: FrameState): DisplayListEntry[];
  dispose?(): void;
}
```

Built-in plugins (implementation order aligned with [webgpu-renderer-design.md §4](../vitamoo/webgpu-renderer-design.md#4-implementation-order)):

1. **Environment** — terrain + floor (step 4)
2. **Architecture** — walls + roofs (step 5)
3. **MicropolisMap** — `mapData` / `mopData` + tile atlas → static quads or single map texture on ground plane (reuses `WebGPUTileRenderer` WGSL / uniform layout)
4. **MicropolisSprites** — `SimSprite` list, world-pixel anchors via shared viewport
5. **Characters** — mooshow / vitamoo body pipeline (done)
6. **Interaction** — highlight/selection/feedback uniforms (step 7)
7. **PieMenu** — desaturated bg + feather + shadow + head + wedges (step 8; [ui-overlay-encyclopedia.md](../vitamoo/ui-overlay-encyclopedia.md))
8. **FloorGridFeedback** — overlay grid lines / zone tint on map (static or ui, idType 9)
9. **SpeechBubbles** — encyclopedia §4 (step 9)

`MapScene` / `OverlayPlugin` in `@micropolis/tile-renderer` are a **thin staging API** with the same semantics as holodeck plugins until `HolodeckStage` subsumes them.

---

## 4. Micropolis map inside the holodeck

**Do not** keep a separate WebGPU context for the city and another for Sims.

| Mode | Camera | Map draw |
|------|--------|----------|
| **City builder** (Micropolis play) | Orthographic; `MapViewport` pan/zoom | `MicropolisMap` plugin: top-down tile shader pass writing pick type `7` |
| **Lot view** (Simopolis / Micropolis Home) | Perspective Sims camera | Map as **floor layer** under walls/characters; same pick buffer |
| **Catalog preview** | User’s browser or headless Chromium | **WebGPU holodeck** (same plugins); software raster only when GPU absent |

`MapViewport` (`screenToWorldTile`, `worldPixelToScreen`, `worldTileToScreenMatrix`) is the **2D contract** every plugin uses — whether the GPU path is `WebGPUTileRenderer` today or a holodeck `MicropolisMap` plugin tomorrow.

**Sim sprites** live in **world-pixel** space (engine coordinates); plugins convert through `MapViewport.worldPixelToWorldTile` / `worldPixelToScreen` so trains and monsters align with the tile grid without merging into the tile-cell shader.

---

## 5. Viewport unification

| Type | Fields | Used by |
|------|--------|---------|
| `MapViewport` | 2D pan, zoom, anchor, tile size, map bounds | Pointer → tile, sprite culling, ortho projection matrix |
| `HolodeckViewport` (target) | `MapViewport` + `Camera` (persp/ortho), screen size, pick readback | All plugins + `Renderer.setCamera` |

One instance per canvas, owned by the stage, passed into every `HolodeckPlugin.collect()`.

**Measurement:** plugins that expose layout to DOM overlays implement `HolodeckMeasurable.measure()`; the stage dispatches `MeasureQuery` by `layerId` / `objectId` / `attachmentId`. See [map-compositing-and-measurement.md §3](map-compositing-and-measurement.md#3-holodeck-measurement-api).

---

## 6. Pie menu on WebGPU (not a second compositor)

From [webgpu-renderer-design.md §3.9](../vitamoo/webgpu-renderer-design.md#39-pie-menu) and [ui-overlay-encyclopedia.md](../vitamoo/ui-overlay-encyclopedia.md):

1. **Desaturated scene** — `fadeScreen` / fullscreen quad sampling resolved color with luminance weights (or offscreen copy).
2. **Feather** — radial alpha vignette (`ui` entry, no depth write).
3. **Drop shadow** — soft quad under menu disk.
4. **Wedges** — `ui` meshes or DOM; pick type `9` per wedge.
5. **Head** — `skinned` entry, head mesh only, centered in menu space (Vitaboy pie-menu behavior).

All of this is **`DisplayListEntry` with `layer: 'overlay'`**, not a separate Svelte canvas compositor — Svelte owns layout/input; vitamoo owns pixels and pick IDs.

---

## Fallback raster (not the product GPU path)

**Product path:** browser composes on **WebGPU**; Node composes map + software overlays via `renderMicropolisMapSoftware` ([map-compositing-and-measurement.md](map-compositing-and-measurement.md)). Client uploads **approved** graphics; server does not need a GPU.

When WebGPU is unavailable in the browser: software export or degraded static preview — **not** a maintained WebGL holodeck fallback.

Headless Chromium for batch jobs should prefer WebGPU inside the browser when the worker has GPU access.

---

## 8. Implementation phases

| Phase | Work | Status |
|-------|------|--------|
| **A** | `MapViewport`, `createMapTileRenderer`, greenfield coordinate names | Done (`packages/tile-renderer`) |
| **B** | Vitamoo character WebGPU + pick + GPU deform/animate | Done ([webgpu-renderer-status.md](../vitamoo/webgpu-renderer-status.md)) |
| **C** | `HolodeckStage` + `HolodeckPlugin` + display-list **executor** (sort by layer, dispatch static/skinned/ui) | Not started |
| **D** | Environment plugin: terrain + floor + **floor grid feedback** | Not started (design §4 steps 4–5) |
| **E** | `MicropolisMap` plugin — absorb `WebGPUTileRenderer` into vitamoo device | Not started |
| **F** | `MicropolisSprites`, interaction highlight/selection | Not started |
| **G** | `PieMenu` plugin (desaturate, feather, shadow, head) | Not started (design §4 step 8) |
| **H** | Wire `apps/micropolis` `TileView` to `HolodeckStage` instead of standalone tile canvas | Not started |
| **I** | `apps/vitamoospace` / Micropolis Home lot view — single canvas, full holodeck | In progress (characters); env not started |

---

## 9. Package boundaries (keep)

- **`vitamoo`** — GPU device, WGSL, meshes, textures, display list, holodeck executor.
- **`mooshow`** — Character stage, practices, loader; produces skinned display-list entries.
- **`tile-renderer`** — Map viewport math, tile-layer schema, software raster, transitional `WebGPUTileRenderer` until phase E.
- **`micropolis-engine`** — WASM sim, `map[][]`, `SimSprite` list (expose enumeration for sprites).

---

## 10. Success criteria

- One `Renderer.create(canvas)` per interactive surface.
- Click on a tile, a Sim, a wall, or a pie wedge → one `readObjectIdAt` path.
- Pie menu opens with feathered desaturated scene and animated head in the center without breaking depth order.
- Micropolis play mode and lot view share `MapViewport` math and differ only in camera + plugin set.
- No duplicate “overlay pass” concepts — only display-list layers and vitamoo fullscreen quads.

This document is the integration bridge; when behavior changes, update [webgpu-renderer-design.md](../vitamoo/webgpu-renderer-design.md) for GPU details and this file for cross-package composition.
