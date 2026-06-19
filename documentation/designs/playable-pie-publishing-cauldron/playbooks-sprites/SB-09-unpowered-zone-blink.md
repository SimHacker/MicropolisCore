# SB-09 — Unpowered zone blink (WebGPU holodeck only)

**Gated on:** holodeck batch 2 — [HB-01](../playbooks-holodeck/HB-01-micropolis-map-plugin.md)
(`MicropolisMapPlugin`). Fold into [SB-08](SB-08-webgpu-overlay-handoff.md) overlay plugin work
or ship as the first tile-glyph `MAP_OVERLAY_*` plugin once the holodeck compositor exists.

**Not on playable DOM path.** No Node print / `/render` support — static exports show the
canonical map without blinking lightning.

## Goal

Classic SimCity feedback: zone **center** tiles with `ZONEBIT` set and `PWRBIT` clear show
**LIGHTNINGBOLT** (827) blinking ~50% duty cycle over the normal center glyph.

## Rule (do not mutate sim memory)

```
(tile & ZONEBIT) && !(tile & PWRBIT) && blinkPhase
  → draw LIGHTNINGBOLT at (x, y)
```

Prior art: Java `MicropolisDrawingArea` (500 ms timer), pygtk `tileFunction` in
`micropolisdrawingarea.py`, engine `blinkFlag` in `simUpdate()` (`tickCount() % 60 < 30`).

## Implementation (holodeck)

1. `MapOverlayPlugin` id `micropolis.unpowered-blink` on layer 41–49 (above base map).
2. Bind `mapData` WASM view (shared with map plugin — no per-tile CPU transform API).
3. Each frame: `blinkPhase` from `blinkFlag` (Embind) or shader time uniform.
4. WGSL predicate or CPU scan on `mapRevision` → instanced atlas quads for `LIGHTNINGBOLT`.

No `transformTile` hook on `TileRenderer`. Display-time substitution is holodeck plumbing,
not a first-class package API.

## Alternatives (rejected)

| Approach | Why not |
|----------|---------|
| DOM canvas overlay before holodeck | Extra pass duplicating work WebGPU will do cleanly; blocks playable on non-essential UX |
| Node / software compositor | Not needed for print; interactive-only |
| Mutate `mapData` each blink | Corrupts sim; save/load hazard |
| `transformTile` callback on tile renderer | Can't pass to shaders; WASM → intermediate copy on CPU; not worth API surface |

## See also

- [SPRITE-OVERLAY-ATLAS § Unpowered zone blink](../SPRITE-OVERLAY-ATLAS.md#unpowered-zone-blink-first-display-time-effect)
- [SB-08 WebGPU overlay handoff](SB-08-webgpu-overlay-handoff.md)
