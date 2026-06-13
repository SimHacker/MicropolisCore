# HB-01 — MicropolisMapPlugin (WebGPU map pass)

> **🟡 Skeleton.** Outline + open questions. Expand to literal steps after resolving OQ-1..OQ-3
> ([atlas](../HOLODECK-CUTOVER-ATLAS.md#open-questions-resolve-during-stir-before-ladle-to-full-prs)).
> Do not execute until batch 1 ✅.

## Navigation

- **Preceded by:** batch 1 ✅ ([../playbooks/README.md](../playbooks/README.md)).
- **Unlocks:** [HB-02](HB-02-tileview-holodeck-toggle.md) (stage needs a map plugin to draw).
- **Related:** sprite compositor (later); shares the atlas + texture-upload code.
- **Design source:**
  [renderer-plugin-roadmap § TODO 2](../../renderer-plugin-roadmap.md#todo-ordered),
  [unified-webgpu-renderer.md](../../unified-webgpu-renderer.md),
  [code-anchors § anchor-holodeck](../wisdom/code-anchors.md#anchor-holodeck),
  [§ anchor-tile-renderer](../wisdom/code-anchors.md#anchor-tile-renderer).

## Scope

Create a **`HolodeckPlugin`** (`id: 'micropolis.map'`, `layer: HolodeckLayer.MICROPOLIS_MAP`) that
renders the Micropolis tile map on WebGPU from the engine's `mapData`/`mopData` `Uint16Array`s and
the tile atlas — extracting the WGSL + texture-upload logic currently inside `WebGPUTileRenderer`
rather than wrapping that `TileRenderer` subclass.

## Risk profile

🟡 **medium.** New rendering code in a package; no app wiring yet (that's HB-02), so blast radius
is contained to the new plugin + its tests. Revert = delete the plugin module.

**Collect upfront (when expanded):** OQ-1 (plugin vs base layer), OQ-2 (package location),
OQ-3 (reuse vs extract `WebGPUTileRenderer`).

## Prerequisites

- Batch 1 shipped (playable on WebGL).
- `HolodeckStage` + `HolodeckPlugin` contract understood — [code-anchors § anchor-holodeck](../wisdom/code-anchors.md#anchor-holodeck).

## Context

- `WebGPUTileRenderer` already has working WGSL + atlas upload + uniform buffer for pan/zoom
  ([code-anchors § anchor-tile-renderer](../wisdom/code-anchors.md#anchor-tile-renderer)) — but it
  is a `TileRenderer<GPUCanvasContext>`, **not** a `HolodeckPlugin`. The plugin shares the
  stage's `MapViewport` (no private pan/zoom).
- `HolodeckPlugin.render(ctx)` runs inside the stage's render pass; `ctx.viewport` is the camera.

## Steps (outline — expand at LADLE)

1. **Decide OQ-1/OQ-2/OQ-3**, record here.
2. Create `MicropolisMapPlugin` implementing `HolodeckPlugin`:
   - `initialize(ctx)` — upload map/mop textures + tile atlas; build pipeline (port WGSL).
   - `render(ctx)` — draw the map quad using `ctx.viewport` uniforms.
   - `resize(ctx)`, `dispose()`.
   - Accept a handle to live `mapData`/`mopData` + a `revision` to know when to re-upload.
3. Headless-ish unit test or a minimal harness route that adds the plugin to a `HolodeckStage`
   and renders one frame without throwing.
4. Keep software raster aligned (same tile indices/atlas) — note any divergence for parity (HB-06).

## Verification (shape)

- Plugin module typechecks (`pnpm check` in its package).
- A stage with only `MicropolisMapPlugin` renders a frame; manual harness shows the map.
- No import of or change to `WebGLTileRenderer`.

## Rollback

Delete the plugin module + test; no app wiring exists yet.

## Success criteria

- `MicropolisMapPlugin` draws the tile map on WebGPU via `HolodeckStage`, sharing `MapViewport`.
- WGSL/atlas logic lives in the plugin (or a shared util), not a `TileRenderer` subclass.
- Greenfield only — software + WebGPU; WebGL untouched.

## Open questions

- **OQ-1/2/3** (see [atlas](../HOLODECK-CUTOVER-ATLAS.md#open-questions-resolve-during-stir-before-ladle-to-full-prs)).
- Re-upload strategy: full texture vs dirty-rect on `mapRevision`?

## See also

- [HB-02](HB-02-tileview-holodeck-toggle.md) — mounts this plugin in the app.
- [map-compositing §2.4](../../map-compositing-and-measurement.md#24-sprites--required-on-software-print-iconic-maps-overviews) — sprite pass shares this plugin's atlas pipeline.
