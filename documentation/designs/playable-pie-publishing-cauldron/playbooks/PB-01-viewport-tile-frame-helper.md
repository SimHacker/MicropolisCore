# PB-01 — Viewport tile-frame helper + TileView export

## Navigation

- **Preceded by:** none. Run this **first** in batch 1.
- **Unlocks:** [PB-02](PB-02-mount-cursor-layer.md) (imports `ScreenRect` + `tileFootprintScreenRect`; calls `getMapViewport()`).
- **Related:** [PB-04](PB-04-tool-commands.md) also edits `TileView.svelte` (a **different** function, `applyToolAt`); run PB-01 first to avoid a rebase ([hub § Shared files](README.md#shared-files-read-before-parallelizing)).
- **Design source:**
  [wisdom/cursor-layer-without-holodeck.md](../wisdom/cursor-layer-without-holodeck.md),
  [code-anchors § anchor-map-viewport](../wisdom/code-anchors.md#anchor-map-viewport) · [§ anchor-tile-renderer](../wisdom/code-anchors.md#anchor-tile-renderer) · [§ anchor-tileview](../wisdom/code-anchors.md#anchor-tileview),
  [map-compositing §3.2](../../map-compositing-and-measurement.md#32-dom-vs-webgpu-split--cursorlayer-coordinates-both),
  [PLAYABLE-SLICE-ATLAS § Shipped vs remaining](../PLAYABLE-SLICE-ATLAS.md#shipped-vs-remaining).

## Scope

Add a tiny helper that converts hover tile coordinates to **screen-space CSS pixels** using
`MapViewport.worldTileToScreenRect`, and expose the live `TileRenderer` from `TileView.svelte`
so `MicropolisView` can compute cursor frames without duplicating pan/zoom math.

## Risk profile

🟢 **low.** New helper + one exported getter on `TileView`. No behaviour change to map
rendering. Revert = delete helper + remove export.

**Collect upfront (one ask):**

- Confirm working directory is MicropolisCore repo root.
- Confirm `pnpm` is available.

## Prerequisites

None.

## Context

Verified symbols (do not re-derive): [code-anchors § anchor-map-viewport](../wisdom/code-anchors.md#anchor-map-viewport)
confirms `worldTileToScreenRect(tileX, tileY, tileW, tileH)` returns **`{ x, y, w, h }`** CSS px and
that `MapViewport` is exported from `@micropolis/render-core`;
[§ anchor-tile-renderer](../wisdom/code-anchors.md#anchor-tile-renderer) confirms
`TileRenderer.viewport` is public.

Why a helper at all: [wisdom/cursor-layer-without-holodeck.md](../wisdom/cursor-layer-without-holodeck.md)
— `MapViewport` is the single geometry source, identical to what holodeck measure will use later, so
the DOM cursor frame migrates to GPU without re-deriving math. `TileView.svelte` already uses
`tileRenderer.viewport.screenToWorldTile` in `trackMouse`.

## Files affected

**Created:**

- `apps/micropolis/src/lib/input/viewportTileFrame.ts` — exports `ScreenRect` + `tileFootprintScreenRect` (consumed by PB-02).

**Modified:**

- `apps/micropolis/src/lib/TileView.svelte` — add the `getMapViewport()` accessor (Step 3).
  **Also edited by PB-04** in a different function; run PB-01 first.

## Steps

### Step 1 — `[AUTO]` Confirm MapViewport API exists

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore
grep -n 'worldTileToScreenRect' packages/render-core/src/viewport/MapViewport.ts
```

**Expected:** at least one match defining `worldTileToScreenRect(`.

**Verify:**

```bash
grep -n 'readonly viewport' packages/tile-renderer/src/TileRenderer.ts
```

**Expected:** line with `public readonly viewport: MapViewport`.

### Step 2 — `[AUTO]` Create `viewportTileFrame.ts`

Create `apps/micropolis/src/lib/input/viewportTileFrame.ts`:

```typescript
import type { MapViewport } from '@micropolis/render-core';

export interface ScreenRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** One tile footprint in screen CSS pixels — same math holodeck measure will use later. */
export function tileFootprintScreenRect(
	viewport: MapViewport,
	tileX: number,
	tileY: number,
	tileW = 1,
	tileH = 1
): ScreenRect {
	const r = viewport.worldTileToScreenRect(tileX, tileY, tileW, tileH);
	return { x: r.x, y: r.y, w: r.w, h: r.h };
}
```

Adapt import path if `@micropolis/render-core` exports `MapViewport` differently — check:

```bash
grep -n 'export.*MapViewport' packages/render-core/src/index.ts packages/render-core/src/viewport/MapViewport.ts
```

Use the same import style as `TileRenderer.ts` (`import { MapViewport } from '@micropolis/render-core'` or relative).

**Verify:**

```bash
test -f apps/micropolis/src/lib/input/viewportTileFrame.ts && echo OK
```

### Step 3 — `[AUTO]` Export viewport accessor from `TileView.svelte`

In `apps/micropolis/src/lib/TileView.svelte`, add near other `export function` declarations
(e.g. after `export function render()`):

```typescript
/** Lets parent components read MapViewport for cursor DOM frames (PB-01). */
export function getMapViewport() {
	return tileRenderer?.viewport ?? null;
}
```

Do **not** export the whole `tileRenderer` if avoidable — viewport is sufficient.

**Verify:**

```bash
grep -n 'export function getMapViewport' apps/micropolis/src/lib/TileView.svelte
```

### Step 4 — `[AUTO]` Typecheck

```bash
cd apps/micropolis && pnpm check
```

**Expected:** no **new** errors in `viewportTileFrame.ts` or `TileView.svelte`. `pnpm check` has
~1300 pre-existing errors in two unrelated files — see
[executor-conventions § pnpm-check-pre-existing](../wisdom/executor-conventions.md#pnpm-check-has-known-pre-existing-errors).

The return shape is verified `{ x, y, w, h }` ([anchor-map-viewport](../wisdom/code-anchors.md#anchor-map-viewport)).
If a future change alters it, match the source rather than guessing.

## Verification

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore/apps/micropolis
pnpm check
pnpm test
```

**Expected:** check passes; existing tests green (no new tests required for this PB).

## Rollback

```bash
git checkout -- apps/micropolis/src/lib/input/viewportTileFrame.ts apps/micropolis/src/lib/TileView.svelte
# or delete viewportTileFrame.ts if it was never committed
```

## Success criteria

- `viewportTileFrame.ts` exists and imports `MapViewport` from render-core.
- `TileView.getMapViewport()` returns `MapViewport | null`.
- `pnpm check` passes in `apps/micropolis`.

## See also

- [PB-02](PB-02-mount-cursor-layer.md) — consumes this helper.
- [map-compositing §3.2](../../map-compositing-and-measurement.md#32-dom-vs-webgpu-split--cursorlayer-coordinates-both) — DOM vs WebGPU split.
