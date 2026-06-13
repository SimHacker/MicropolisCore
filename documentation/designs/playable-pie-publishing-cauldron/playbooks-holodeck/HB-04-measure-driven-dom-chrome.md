# HB-04 — Measure-driven DOM chrome (retire domFrameRects)

> **🟡 Skeleton.** Outline + open questions. Do not execute until HB-03 ✅.

## Navigation

- **Preceded by:** [HB-03](HB-03-editing-tool-cursor-plugin.md) — plugin `measure()` returns rects.
- **Unlocks:** [HB-06](HB-06-parity-and-retire-webgl-bridge.md) (one geometry source for both backends).
- **Related:** batch 1 [PB-01](../playbooks/PB-01-viewport-tile-frame-helper.md)/[PB-02](../playbooks/PB-02-mount-cursor-layer.md) — the `domFrameRects` bridge this supersedes.
- **Design source:**
  [map-compositing §3.4](../../map-compositing-and-measurement.md#34-json-protocol-sparse-read--write--patch),
  [§3.5](../../map-compositing-and-measurement.md#35-future-goals-design-for-do-not-implement-yet),
  [code-anchors § anchor-cursorlayer](../wisdom/code-anchors.md#anchor-cursorlayer) (`createMeasureStore`).

## Scope

Switch `CursorLayer`/`MicropolisView` from PB-02's viewport-computed **`domFrameRects`** to the
holodeck **measure protocol** (`createMeasureStore` → `editing-tool-cursor/{id}/outer/bounds`),
so DOM chrome (labels, tooltips, future vote dialogs) and GPU pixels share **one** geometry source.
Run a `backend: 'both'` parity check, then make measure the default when a stage is present.

## Risk profile

🟡 **medium.** Changes how DOM chrome gets its coordinates. Mitigation: keep `domFrameRects` as the
fallback when no `stage` (i.e. WebGL backend), so batch 1 behavior is preserved without holodeck.

**Collect upfront (when expanded):** parity tolerance (px), whether to delete `domFrameRects` now
or after HB-06 retires WebGL.

## Prerequisites

- [HB-03](HB-03-editing-tool-cursor-plugin.md) landed; plugin `measure()` returns inner/outer rects.
- `createMeasureStore` available — [code-anchors § anchor-cursorlayer](../wisdom/code-anchors.md#anchor-cursorlayer).

## Context

- `createMeasureStore(stage, { refs })` gives `get/getProp/tick/write`; `tick()` calls
  `stage.render()` then `measurePatch` and updates a reactive snapshot.
- `CursorLayer` already reads `getMeasure('editing-tool-cursor/{id}/outer/bounds')` for its frame;
  HB-04 makes that snapshot the **store** (live) instead of the local `$state` placeholder.
- Coherency rule: `write` → `render` → `patch` ([map-compositing §3.4](../../map-compositing-and-measurement.md#34-json-protocol-sparse-read--write--patch)).

## Steps (outline — expand at LADLE)

1. In `MicropolisView` (or `CursorLayer`), when a `stage` exists, create a `createMeasureStore`
   subscribed to the local player's `editing-tool-cursor` refs.
2. Drive DOM frame/labels from the store snapshot; keep `domFrameRects` only as the no-stage
   (WebGL) fallback.
3. `tick()` the store each frame / on hover+pan changes; verify DOM rect tracks the GPU frame.
4. `[HUMAN]` parity: in `both` mode, measure-driven DOM rect overlaps GPU frame within tolerance.
5. Decide: delete `domFrameRects` now or defer to HB-06.

## Verification (shape)

- Measure store returns stable rects; DOM chrome positions from it when stage present.
- WebGL fallback still uses `domFrameRects` (no regression without holodeck).
- `pnpm check` + tests green.

## Rollback

Revert to PB-02 `domFrameRects` path; remove the measure store wiring.

## Success criteria

- DOM chrome and GPU cursor share one geometry source (measure) when a stage is present.
- No duplicate viewport math in the UI layer.
- WebGL fallback preserved until HB-06.

## Open questions

- Keep `domFrameRects` permanently as the no-GPU fallback, or remove once WebGL is retired (HB-06)?
- Parity tolerance + how to assert it (manual vs automated screenshot diff).

## See also

- [HB-06](HB-06-parity-and-retire-webgl-bridge.md) — final cleanup of the dual path.
- [map-compositing §5.4](../../map-compositing-and-measurement.md#54-measure-anchors-for-vote-chrome) — vote dialogs reuse this measure plumbing.
