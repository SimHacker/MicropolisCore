# HB-02 — TileView renderer toggle → HolodeckStage

> **🟡 Skeleton.** Outline + open questions. Expand after OQ-4 resolved. Do not execute until HB-01 ✅.

## Navigation

- **Preceded by:** [HB-01](HB-01-micropolis-map-plugin.md) — the map plugin to mount.
- **Unlocks:** [HB-03](HB-03-editing-tool-cursor-plugin.md), [HB-05](HB-05-pick-buffer-query-tool.md).
- **Related:** batch 1 [PB-02](../playbooks/PB-02-mount-cursor-layer.md) (CursorLayer; coexists during transition).
- **Design source:**
  [map-compositing §4 step 1](../../map-compositing-and-measurement.md#4-implementation-order-updated),
  [code-anchors § anchor-tileview](../wisdom/code-anchors.md#anchor-tileview),
  [§ anchor-holodeck](../wisdom/code-anchors.md#anchor-holodeck).

## Scope

Add a **renderer backend toggle** so `TileView` can mount a `HolodeckStage` (with
`MicropolisMapPlugin` from HB-01) instead of the WebGL `TileRenderer`, while keeping the frozen
WebGL path as the default fallback until parity (HB-06). Both paths share the same `MapViewport`
math, pan/zoom handlers, and `toolState.hoverTile` wiring.

## Risk profile

🟡 **medium.** Touches the main game view mount path. Mitigation: **toggle defaults to `webgl`**;
holodeck is opt-in (query param / config) until HB-06. Revert removes the toggle branch.

**Collect upfront (when expanded):** OQ-4 (new component vs `backend` prop), default toggle value,
how to select holodeck in dev (env/query param).

## Prerequisites

- [HB-01](HB-01-micropolis-map-plugin.md) landed (plugin renders a frame).
- WebGPU available in the dev browser (Chrome/Edge); fallback path required when absent.

## Context

- `TileView` today: `createMapTileRenderer(canvas, …)` → `WebGLTileRenderer`; pan/zoom via
  `tileRenderer.viewport`; hover via `screenToWorldTile`
  ([code-anchors § anchor-tileview](../wisdom/code-anchors.md#anchor-tileview)).
- `createMapTileRenderer` default chain is already `['webgpu','canvas']`; the **app** still hard-uses
  the WebGL bridge. This PB introduces the **HolodeckStage** path, which is distinct from
  `WebGPUTileRenderer` (a `TileRenderer`); the stage hosts plugins + measure + pick.
- `HolodeckStage.create(canvas, {enablePick})` is async — mount must await it.

## Steps (outline — expand at LADLE)

1. **Decide OQ-4**; record. (Recommended: `backend: 'webgl' | 'holodeck'` decision inside
   `TileView.initialize`, one canvas, one mount path.)
2. When `holodeck`: `await HolodeckStage.create(canvas)`, `addPlugin(new MicropolisMapPlugin(...))`,
   `initializePlugins()`, then drive `stage.viewport` from the same pan/zoom handlers.
3. Route `render()` to `stage.render()`; keep `getMapViewport()` returning `stage.viewport` so
   PB-02's `CursorLayer` DOM frames keep working unchanged.
4. Graceful fallback to `webgl` when `navigator.gpu` is missing or stage creation throws.
5. Manual parity smoke: map looks the same; pan/zoom/hover identical; HUD/toolbar/messages work.

## Verification (shape)

- Toggle defaults to `webgl`; `?renderer=holodeck` (or chosen mechanism) mounts the stage.
- `pnpm check` + `pnpm test` green; existing tests unaffected.
- `[HUMAN]` smoke: both backends play identically (pan/zoom/build/hover frame).

## Rollback

Remove the toggle branch; `TileView` reverts to WebGL-only mount.

## Success criteria

- `TileView` can mount `HolodeckStage` + `MicropolisMapPlugin` behind an opt-in toggle.
- WebGL remains the default fallback (no regression to playable slice).
- `getMapViewport()` returns the active backend's `MapViewport` (CursorLayer keeps working).

## Open questions

- **OQ-4** (component vs prop). Default: prop on `TileView`.
- Single `<canvas>` reconfigured between contexts, or separate canvases per backend?

## See also

- [HB-03](HB-03-editing-tool-cursor-plugin.md) — GPU cursor once the stage is mounted.
- [HB-06](HB-06-parity-and-retire-webgl-bridge.md) — flips default + retires WebGL.
