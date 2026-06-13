# HB-05 — Pick buffer → Query tool

> **🟡 Skeleton.** Outline + open questions. Do not execute until HB-02 ✅. Parallel to HB-03/04.

## Navigation

- **Preceded by:** [HB-02](HB-02-tileview-holodeck-toggle.md) — stage with pick MRT mounted.
- **Unlocks:** sprite-aware picking; feeds [HB-06](HB-06-parity-and-retire-webgl-bridge.md) parity scope.
- **Related:** [HB-03](HB-03-editing-tool-cursor-plugin.md)/[HB-04](HB-04-measure-driven-dom-chrome.md) (independent; all need HB-02).
- **Design source:**
  [unified-webgpu-renderer.md §5](../../unified-webgpu-renderer.md),
  [code-anchors § anchor-holodeck](../wisdom/code-anchors.md#anchor-holodeck) (`HolodeckIdType.MICROPOLIS_CELL`, pick MRT).

## Scope

Use the `HolodeckStage` **pick buffer** (`enablePick: true`, `HolodeckIdType.MICROPOLIS_CELL`) to
resolve the tile under the cursor for the **Query tool**, instead of (or alongside) the cheap
`MapViewport.screenToWorldTile` math. This is the seam that later makes **sprite-aware** picking
(click a train/plane, not just the tile beneath it) possible.

## Risk profile

🟡 **low-med.** Additive: Query can fall back to `screenToWorldTile` if pick readback is
unavailable. Async GPU readback adds latency — fine for click (Query), not for hover.

**Collect upfront (when expanded):** OQ-5 (pick for all tools vs Query only), readback timing,
fallback policy.

## Prerequisites

- [HB-02](HB-02-tileview-holodeck-toggle.md) landed with `HolodeckStage.create(canvas, { enablePick: true })`.
- `MicropolisMapPlugin` writes `MICROPOLIS_CELL` ids into the pick attachment (may be an HB-01
  follow-up — confirm during expansion).

## Context

- `HolodeckStage` supports a pick MRT + readback (`pick-readback.ts`, `readObjectIdAt`) — see
  [code-anchors § anchor-holodeck](../wisdom/code-anchors.md#anchor-holodeck).
- Today the Query tool path uses `screenToWorldTile` then `micropolisReactive` zone status
  (`ZoneStatusPanel` already renders it).
- Decision OQ-5: hover stays viewport math (cheap, sync); **Query click** uses pick (sprite-aware).

## Steps (outline — expand at LADLE)

1. Ensure `MicropolisMapPlugin` (HB-01) writes `MICROPOLIS_CELL` ids encoding tile x,y into pick.
2. On Query click: read pick id at the cursor; decode to tile (and later sprite id); call the
   existing zone-status path with that tile.
3. Fallback to `screenToWorldTile` when pick readback is unavailable/slow.
4. `[HUMAN]` smoke: Query click on a tile shows correct zone stats via pick.

## Verification (shape)

- Pick readback returns a plausible `MICROPOLIS_CELL` id at click; decoded tile matches
  `screenToWorldTile` for the same point (sanity).
- Query panel shows correct stats; fallback works with pick disabled.
- `pnpm check` + tests green.

## Rollback

Query reverts to `screenToWorldTile` only; pick wiring removed. No gameplay change.

## Success criteria

- Query tool resolves its tile via the pick buffer, with a viewport-math fallback.
- Path is ready to extend to sprite picking (train/plane) without re-architecting.

## Open questions

- **OQ-5** (pick scope). Default: Query click only; hover stays viewport math.
- Encoding of tile x,y (and later sprite id) into the pick id space.

## See also

- [globe-city-navigation.md](../../globe-city-navigation.md) — inverse-pick under warp (far future).
- [HB-06](HB-06-parity-and-retire-webgl-bridge.md) — parity must cover Query behavior.
