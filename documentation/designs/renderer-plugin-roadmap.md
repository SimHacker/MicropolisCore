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
| **WebGPU** | Default interactive client; Sims + Micropolis + holodeck |
| **WebGL** | GPU fallback (`WebGLTileRenderer`) |
| **Canvas** | Pedagogy |
| **Software / raw RGBA** | Node, catalog batch, no Cairo |

`createMapTileRenderer()` prefers WebGPU → WebGL → Canvas. `TileView.svelte` uses it today.

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

1. **Vitamoo:** `HolodeckStage` — sort `DisplayListEntry[]` by layer, execute static/skinned/ui (unified doc phase C).
2. **Vitamoo:** Environment plugin — terrain, floor, walls, roofs (design §4 steps 4–5).
3. **Vitamoo:** Pie menu plugin — desaturate, feather, shadow, head (design §4 step 8; encyclopedia).
4. **Tile-renderer → vitamoo:** `MicropolisMap` plugin using shared `MapViewport` + pick idType `7` (phase E).
5. **Micropolis:** Sprites plugin, floor-grid feedback, interaction highlight (phases F–G).
6. **Apps:** `TileView` / Micropolis Home → single `Renderer.create`, not a second GPU context (phase H–I).
7. Extend `RenderDescription` for Sims catalog thumbnails and lot scenes.
8. Headless batch worker reusing holodeck route.
9. Pie menu → command-bus metadata (i18n keys).
10. WebGL/Canvas polish for teaching and fallback only.

**Ambitious (globe):** [globe-city-navigation.md](globe-city-navigation.md) — icosphere, POI-facing rotation, fish-eye magnify, inverse pick (phases G0–G5).

---

## Related

- [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) — in-page pies vs extension sandbox
- [simopolis.md](simopolis.md) — Micropolis Home + vitamoo/mooshow packages
- [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)
