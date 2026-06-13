# Renderer plugin roadmap

**Unified target:** [unified-webgpu-renderer.md](unified-webgpu-renderer.md) — one holodeck, WebGPU-native compositor, plugins for terrain/floors/walls/roofs, Micropolis map, sprites, pie menu (feathered desaturated shadow + center head), floor-grid feedback.

**Shared package plan:** [render-core-package.md](render-core-package.md) — `@micropolis/render-core` for viewport, schemas, `HolodeckStage`; vitamoo + micropolis depend on it; WebGL/Canvas stay scaffold-only (no GL-shaped wrapper API).

**Vitamoo spec:** [webgpu-renderer-design.md](../vitamoo/webgpu-renderer-design.md) · **Status:** [webgpu-renderer-status.md](../vitamoo/webgpu-renderer-status.md) · **UI math:** [ui-overlay-encyclopedia.md](../vitamoo/ui-overlay-encyclopedia.md) · **Cursors / pies:** [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) · **Frames:** [ui-frame-nine-slice.md](ui-frame-nine-slice.md) · **PieCraft / model:** [piecraft/README.md](piecraft/README.md)

---

## What ships

| Piece | Package | State |
|-------|---------|--------|
| WebGPU `Renderer` (mesh, depth, pick MRT, GPU deform/animate) | `vitamoo` | Done for characters |
| Display-list types (`static` / `skinned` / `ui`) | `vitamoo` | Types + manual draw paths; **executor + plugins not started** |
| Holodeck environment (terrain, walls, roofs, floor grid) | `vitamoo` | **Not started** (design §4 steps 4–5) |
| Pie menu GPU compositing | `vitamoo` | Specified §3.9; **not started** |
| `MapViewport`, `HolodeckPlugin` / `HolodeckLayer` / `HolodeckIdType` | `tile-renderer` | Viewport done; holodeck types exported for shared contract |
| `WebGPUTileRenderer`, `createMapTileRenderer()` | `tile-renderer` | Done; **absorb into holodeck `MicropolisMap` plugin** (unified doc phase E) |
| `MapScene` + `OverlayPlugin` | `tile-renderer` | Staging API until holodeck executor exists |
| Software raster (no canvas) | `tile-renderer` | Done (`render/software`) |

---

## Fallback backends (parallel, not the compositor model)

| Backend | When |
|---------|------|
| **WebGPU** | Default interactive client; holodeck compositor |
| **Software / Canvas** | Node, `/render`, print, CI; browser fallback when no WebGPU (`webgpu` → `canvas`) |
| **WebGL (legacy)** | **Frozen.** Opt-in only (`prefer: ['webgl']`); not in default chain. `TileView` bridge until holodeck cutover |
| **WebGL (future)** | Optional clean-slate rewrite later — spec-aligned, not a port of legacy code |

`createMapTileRenderer()` default: **`webgpu` → `canvas`** (software pixels). **Target interactive app:** `HolodeckStage`; `/render` + server → software only.

---

## Client GPU first (browser composes)

**Principle:** all 3D rendering and compositing happens in the **browser** on the **client’s GPU** where WebGPU is supported — no paid server GPU for previews. See [render-core-package.md §0](render-core-package.md#0-client-gpu-first-browser-composes-server-describes).

| Where | What runs |
|-------|-----------|
| User’s tab | `HolodeckStage` + plugins every frame (map, Sims, pie menu, terrain) |
| Headless worker (optional) | **Same** holodeck route inside Chromium — batch catalog/SSR, not a separate server renderer |
| Server | `RenderDescription`, assets, auth, storage — **not** WGSL/compositing |

Uploads happen **after** local render + user approval. Software/WebGL paths are CI/teaching/fallback only ([unified-webgpu-renderer.md §7](unified-webgpu-renderer.md#7-fallback-raster-not-the-product-gpu-path)).

```text
server → description + URLs
browser → HolodeckStage (WebGPU) → preview
user approves → upload
server → catalog version
```

---

## TODO (ordered)

1. **Vitamoo:** `HolodeckStage` display-list **executor** (sort + dispatch static/skinned/ui/frame).
2. **Micropolis (after playable A–C):** `MicropolisMapPlugin` — absorb `WebGPUTileRenderer`; software raster aligned.
3. **Micropolis (with holodeck):** `CursorLayer` **`webgpu`** backend + `EditingToolCursorPlugin` (parallel to DOM/SVG).
4. **Overlays:** Generalized MOP/color overlay layer — software pass + WebGPU plugin, same schema.
5. **Measure:** holodeck `measure()` on tool-cursor + pointer plugins (DOM path uses viewport helpers until then).
6. **Micropolis:** **Sprite layer — software compositor (required)** + WebGPU plugin; `SpriteRenderProfile` for print/overview — [§2.4](map-compositing-and-measurement.md#24-sprites--required-on-software-print-iconic-maps-overviews).
7. **Apps:** `TileView` → `HolodeckStage` when playable ships; `/render` + server → software (map + sprites + overlays).
8. **Legacy WebGL:** removed from default `createMapTileRenderer` chain; frozen — no greenfield features. Optional clean-slate WebGL rewrite later.
9. Vitamoo: Environment, pie menu plugins (existing roadmap items).
10. Extend `RenderDescription` for catalog thumbnails and lot scenes.
11. Headless batch worker (Chromium WebGPU when available).
12. Pie menu → command-bus metadata.
13. **Later:** Whiteboard layer, multiplayer vote preview (“bouncing zone”) — [map-compositing-and-measurement.md §5](map-compositing-and-measurement.md#5-multiplayer-voting-preview-historical--target).

**Ambitious (globe):** [globe-city-navigation.md](globe-city-navigation.md) — icosphere, POI-facing rotation, fish-eye magnify, inverse pick (phases G0–G5).

---

## Related

- [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) — in-page pies vs extension sandbox
- [simopolis.md](simopolis.md) — Micropolis Home + vitamoo/mooshow packages
- [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)
