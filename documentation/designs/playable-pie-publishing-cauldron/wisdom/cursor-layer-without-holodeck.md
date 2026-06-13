# CursorLayer without holodeck (playable bridge)

**Problem:** `CursorLayer.svelte` can position DOM chrome from `stage.measure()` after
holodeck lands. Playable Phase B ships **before** holodeck cutover.

**Rule:** Use the **same math** holodeck will use later:

```text
tileRenderer.viewport.worldTileToScreenRect(tileX, tileY, 1, 1)
```

from `@micropolis/render-core` `MapViewport` (already on `TileRenderer.viewport`).

**Do not** duplicate pan/zoom formulas in Svelte. **Do not** extend legacy WebGL for cursor
pixels — DOM/SVG frame only until WebGPU backend toggles on.

**Later:** When `HolodeckStage` replaces WebGL map, swap `domFrameRects` prop for measure
read/patch — same screen rects, different producer. See
[map-compositing-and-measurement.md §3.2](../../map-compositing-and-measurement.md#32-dom-vs-webgpu-split--cursorlayer-coordinates-both).
