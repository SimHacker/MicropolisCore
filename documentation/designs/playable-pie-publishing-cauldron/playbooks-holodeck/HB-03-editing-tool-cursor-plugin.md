# HB-03 — EditingToolCursorPlugin + CursorLayer webgpu/both

> **🟡 Skeleton.** Outline + open questions. Do not execute until HB-02 ✅.

## Navigation

- **Preceded by:** [HB-02](HB-02-tileview-holodeck-toggle.md) — stage mounted in `TileView`.
- **Unlocks:** [HB-04](HB-04-measure-driven-dom-chrome.md) (measure reads this plugin's geometry).
- **Related:** batch 1 [PB-02](../playbooks/PB-02-mount-cursor-layer.md) — DOM frame this replaces/augments.
- **Design source:**
  [map-compositing §3.3](../../map-compositing-and-measurement.md#33-tile-cursor-sources-pluggable),
  [§3.2](../../map-compositing-and-measurement.md#32-dom-vs-webgpu-split--cursorlayer-coordinates-both),
  [virtual-cursor-layer §7.1](../../virtual-cursor-layer.md),
  [code-anchors § anchor-cursorlayer](../wisdom/code-anchors.md#anchor-cursorlayer).

## Scope

Add an **`EditingToolCursorPlugin`** (`layer: HolodeckLayer.EDITING_TOOL_CURSOR` = 71) that draws
the tile tool frame in WebGPU (nine-slice / hollow rim per `CursorPresence`), and flip
`CursorLayer` from `backend: 'dom'` to `'webgpu'` (or `'both'` for the transition). The plugin
implements `applyMeasure` (accept tile/tool patches) and `measure` (return screen rects) so DOM
chrome can still anchor to it (HB-04).

## Risk profile

🟡 **medium.** New GPU plugin + `CursorLayer` backend switch. Mitigation: run `backend: 'both'`
during transition so the proven DOM frame stays visible while the GPU frame is validated.

**Collect upfront (when expanded):** which cursor style (`cursor.tool.nineslice` vs
`center-only`), rim policy for local vs remote, whether to default `'webgpu'` or `'both'`.

## Prerequisites

- [HB-02](HB-02-tileview-holodeck-toggle.md) landed; `TileView` exposes the `HolodeckStage`.
- `CursorLayer` already publishes patches via `holodeckPatches()` and reads measure refs
  (`editing-tool-cursor/{id}/inner|outer/bounds`) — see [code-anchors § anchor-cursorlayer](../wisdom/code-anchors.md#anchor-cursorlayer).

## Context

- `CursorLayer.svelte` already has the `webgpu`/`both` plumbing (`useWebGpu`, `publishToHolodeck`,
  `stage.measureWrite`/`measurePatch`) — it currently no-ops without a `stage` prop. HB-02 provides
  the stage; this PB provides the **plugin** that consumes those writes and produces measure output.
- The plugin reads patches written under `editing-tool-cursor/{playerId}` and renders the frame at
  the tile footprint computed from `ctx.viewport`.

## Steps (outline — expand at LADLE)

1. Implement `EditingToolCursorPlugin`:
   - `applyMeasure('editing-tool-cursor/{id}', { tileX, tileY, tw, th, toolId, styleId, rimPolicy })`
     → store per-player cursor state.
   - `render(ctx)` → draw hollow nine-slice rim at the tile footprint (local = fat, remote = thin).
   - `measure(query)` → return `inner`/`outer` screen `bounds` for the requested player ref.
2. Pass the `HolodeckStage` from `TileView`/`MicropolisView` into `CursorLayer` and set
   `backend="both"` (transition) then `"webgpu"` once validated.
3. Confirm `CursorLayer.publishToHolodeck()` writes reach the plugin and `measurePatch` returns rects.
4. `[HUMAN]` smoke: GPU tile frame tracks hover; matches the DOM frame position in `both` mode.

## Verification (shape)

- Plugin typechecks; stage renders frame with cursor.
- In `both` mode, DOM frame and GPU frame overlap (≤1px) — visual confirm.
- `pnpm check` + tests green.

## Rollback

Set `CursorLayer` back to `backend="dom"`; remove plugin registration. PB-02 DOM frame still works.

## Success criteria

- GPU tool frame renders at `EDITING_TOOL_CURSOR` layer, driven by `CursorPresence`.
- `CursorLayer` runs `webgpu`/`both` without API changes to its `presences` prop.
- Plugin `measure()` returns inner/outer rects for HB-04.

## Open questions

- Default backend after validation: `'webgpu'` (drop DOM frame) or keep `'both'`?
- Nine-slice asset/styling source — procedural rim vs atlas.

## See also

- [HB-04](HB-04-measure-driven-dom-chrome.md) — consumes `measure()` output for DOM labels/dialogs.
- [map-compositing §5.4](../../map-compositing-and-measurement.md#54-measure-anchors-for-vote-chrome) — future vote chrome uses the same measure anchors.
