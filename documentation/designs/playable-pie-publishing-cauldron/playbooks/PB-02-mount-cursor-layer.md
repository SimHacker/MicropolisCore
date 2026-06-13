# PB-02 — Mount CursorLayer + DOM tool frame

## Navigation

- **Preceded by:** [PB-01](PB-01-viewport-tile-frame-helper.md) — **hard dependency**: imports
  `ScreenRect`/`tileFootprintScreenRect` from `viewportTileFrame.ts` and calls `getMapViewport()`.
- **Unlocks:** [PB-05](PB-05-vertical-slice-verify.md) (DoD item: tool cursor frame visible).
- **Related:** [PB-03](PB-03-budget-modal.md) also mounts a component in `MicropolisView.svelte`
  (different element); run PB-02 before PB-03 to avoid a rebase ([hub § Shared files](README.md#shared-files-read-before-parallelizing)).
- **Design source:**
  [code-anchors § anchor-cursorlayer](../wisdom/code-anchors.md#anchor-cursorlayer) (CursorLayer + `CursorPresence` shape),
  [virtual-cursor-layer.md §7.1](../../virtual-cursor-layer.md),
  [map-compositing §3.2](../../map-compositing-and-measurement.md#32-dom-vs-webgpu-split--cursorlayer-coordinates-both),
  [micropolis-playable-game-readiness §6 B4](../../micropolis-playable-game-readiness.md#phase-b--core-interaction-loop-23-days).

## Scope

Mount `CursorLayer.svelte` in `MicropolisView`, feed it a **local** `CursorPresence` derived
from `toolState.hoverTile`, and draw a visible DOM tile frame using `tileFootprintScreenRect`
when holodeck measure is not wired (`backend: 'dom'` only).

## Risk profile

🟢 **low.** UI overlay only; map interaction unchanged. Revert removes mount + prop wiring.

**Collect upfront:**

- Confirm [PB-01](PB-01-viewport-tile-frame-helper.md) is ✅ (grep for `getMapViewport`).

## Prerequisites

- [PB-01](PB-01-viewport-tile-frame-helper.md) landed.

## Context

1. `CursorLayer.svelte` today renders `.cursor-tool-frame` only when a holodeck measure value
   (`getMeasure('editing-tool-cursor/{id}/outer/bounds')`) exists — and no `stage` is wired yet, so
   nothing draws. This PB adds a **`domFrameRects`** fallback so the frame draws from `MapViewport`
   without a stage. CursorLayer internals (`domPresences`, `getMeasure`, `useDom`) and the
   `CursorPresence` shape are in [code-anchors § anchor-cursorlayer](../wisdom/code-anchors.md#anchor-cursorlayer).
2. The playable bridge rationale: [wisdom/cursor-layer-without-holodeck.md](../wisdom/cursor-layer-without-holodeck.md).
3. `toolState.hoverTile` is already updated in `TileView.trackMouse`; `MicropolisView` already
   `bind:this={tileView}` and mounts `GameHud`/`Toolbar`/`MessageOverlay`/`ZoneStatusPanel`.

## Files affected

**Modified:**

- `apps/micropolis/src/lib/input/CursorLayer.svelte` — add optional `domFrameRects` prop + render fallback (Step 1).
- `apps/micropolis/src/lib/MicropolisView.svelte` — mount `<CursorLayer>`, derive presences + rects (Step 2).
  **Also edited by PB-03** (mounts `<BudgetModal>`); run PB-02 first.

**Not edited here:** `TileView.svelte` — PB-02 only *calls* its `getMapViewport()` (added by PB-01).

## Steps

### Step 1 — `[AUTO]` Add `domFrameRects` prop to CursorLayer

In `apps/micropolis/src/lib/input/CursorLayer.svelte`:

1. Import type:

```typescript
import type { ScreenRect } from './viewportTileFrame';
```

2. Extend `Props`:

```typescript
/** Screen rects for DOM frames when holodeck measure is not wired (playable bridge). */
domFrameRects?: Record<string, ScreenRect>;
```

3. Destructure with default:

```typescript
domFrameRects = {}
```

4. Find the existing tile-frame block in the `{#each domPresences}` loop. It currently looks like
   (locate by the `cursor-tool-frame` class; line numbers drift):

```svelte
{@const bounds = getMeasure(`editing-tool-cursor/${presence.playerId}/outer/bounds`)}
<!-- TODO(playable-B): SVG tile frame from viewport/tile-renderer when measure not wired -->
{#if bounds?.bounds}
  <div
    class="cursor-tool-frame"
    style="left:{bounds.bounds.x}px; top:{bounds.bounds.y}px; width:{bounds.bounds.w}px; height:{bounds.bounds.h}px;"
  ></div>
{/if}
```

Replace it with the `domFrameRects`-first fallback (measure still wins later, when a stage exists):

```svelte
{@const domRect = domFrameRects[presence.playerId]}
{@const bounds = getMeasure(`editing-tool-cursor/${presence.playerId}/outer/bounds`)}
{#if domRect || bounds?.bounds}
  {@const r = domRect ?? bounds!.bounds!}
  <div
    class="cursor-tool-frame"
    class:local={presence.local}
    style="left:{r.x}px; top:{r.y}px; width:{r.w}px; height:{r.h}px;"
  ></div>
{/if}
```

5. Optional CSS for local vs remote:

```css
.cursor-tool-frame.local {
  border-width: 3px;
  border-color: #ffd27a;
}
.cursor-tool-frame:not(.local) {
  border-width: 1px;
  opacity: 0.6;
}
```

**Verify:**

```bash
grep -n 'domFrameRects' apps/micropolis/src/lib/input/CursorLayer.svelte
```

### Step 2 — `[AUTO]` Wire MicropolisView

In `apps/micropolis/src/lib/MicropolisView.svelte`:

1. Imports:

```typescript
import CursorLayer from '$lib/input/CursorLayer.svelte';
import { tileFootprintScreenRect } from '$lib/input/viewportTileFrame';
import { toolState } from '$lib/ToolState.svelte';
import type { CursorPresence } from '$lib/input/types';
```

2. Build derived presence + frame (inside `<script>`):

```typescript
const localPlayerId = 'local';

const localCursorPresence = $derived.by((): CursorPresence[] => {
  const tile = toolState.hoverTile;
  if (!tile) return [];
  return [{
    playerId: localPlayerId,
    local: true,
    toolId: toolState.activeToolId,
    anchorSpace: 'world-tile',
    visible: true,
    tile: { x: tile[0], y: tile[1], w: 1, h: 1 },
    rimPolicy: 'fat',
    representations: { dom: [] }
  }];
});

const domFrameRects = $derived.by(() => {
  const tile = toolState.hoverTile;
  const vp = tileView?.getMapViewport?.();
  if (!tile || !vp) return {};
  return {
    [localPlayerId]: tileFootprintScreenRect(vp, tile[0], tile[1], 1, 1)
  };
});
```

3. In markup, **inside** `.view-container`, after `<TileView bind:this={tileView} />`:

```svelte
<CursorLayer
  backend="dom"
  presences={localCursorPresence}
  domFrameRects={domFrameRects}
/>
```

4. **Reactivity note (known v1 limitation):** `domFrameRects` recomputes only when its tracked
   deps change — `toolState.hoverTile` and `tileView`. Dragging-to-pan fires `mousemove` →
   `trackMouse` updates `hoverTile`, so the frame follows during pan. **Pure wheel-zoom without
   moving the mouse** won't recompute until the next move — acceptable for the slice (the Step 4
   smoke checks hover + pan). If you want it exact, have `TileView.render()` bump a shared
   `$state` revision counter and read it in the `$derived.by`; **only do this if asked** — keep
   the PB minimal.

**Verify:**

```bash
grep -n 'CursorLayer' apps/micropolis/src/lib/MicropolisView.svelte
grep -n 'domFrameRects' apps/micropolis/src/lib/MicropolisView.svelte
```

### Step 3 — `[AUTO]` Typecheck

```bash
cd apps/micropolis && pnpm check
```

### Step 4 — `[HUMAN]` Browser smoke

**Tell the human:**

1. Run `cd apps/micropolis && pnpm dev`
2. Open `/play/micropolis`
3. Hover map — yellow/fat tile frame follows cursor tile
4. Pan (middle-click or Shift+drag) — frame stays aligned with tile under cursor
5. Paste back: "frame visible yes/no", "alignment ok yes/no"

Proceed only if both yes.

## Verification

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore/apps/micropolis
pnpm check
pnpm test
```

## Rollback

Revert changes to `CursorLayer.svelte` and `MicropolisView.svelte` only.

## Success criteria

- `CursorLayer` mounted on play route.
- Local tool tile frame visible on hover (human confirmed).
- No holodeck `stage` prop required (`backend="dom"` only).
- `pnpm check` passes.

## See also

- [PB-05](PB-05-vertical-slice-verify.md) — full playable checklist.
- Future: WebGPU backend — [map-compositing §4 step 2](../../map-compositing-and-measurement.md#4-implementation-order-updated).
