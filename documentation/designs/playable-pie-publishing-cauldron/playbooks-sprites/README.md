# Playbook hub — Software sprite overlay (batch 1.5)

Parallel to playable batch 1. **Atlas:** [../SPRITE-OVERLAY-ATLAS.md](../SPRITE-OVERLAY-ATLAS.md).

## Dispatch order

| SB | Title | Gated on |
|----|-------|----------|
| SB-01 | Manifest schema + classic pack | — |
| SB-02 | Embind `getActiveSprites` + engine sync | SB-01 |
| SB-03 | `SoftwareSpriteLayer` + `Sprite.svelte` | SB-01, TileView `getMapViewport()` |
| SB-04 | Skywriting plugin + milestones | SB-03 |
| SB-05 | Atmospheric layers + pilot/typing | SB-04 |
| SB-06 | MOP scalar overlays (pollution, pop, crime) | SB-05 |
| SB-07 | Chalk / whiteboard + multiplayer patches | SB-05 |
| SB-08 | WebGPU overlay handoff (raw scalar, particles, stink lines) | SB-06, holodeck HB-01 |
| SB-09 | Unpowered zone blink (WebGPU holodeck plugin only) | HB-01, SB-08 |

Execute SB-01 through SB-06 for playable. SB-07–09 deferred until holodeck cutover.
WASM rebuild required after SB-02 (and again after SB-06 Embind).

Progress: [../PROGRESS.yml](../PROGRESS.yml) (`sprite_batch` section).
