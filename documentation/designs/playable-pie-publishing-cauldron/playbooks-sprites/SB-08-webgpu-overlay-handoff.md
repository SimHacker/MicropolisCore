# SB-08 — WebGPU overlay handoff (dynamic colormap + effects)

**Gated on:** holodeck batch 2 (HB-01 map plugin), SB-06 (Embind scalar map buffers).

## Scope

Replace or complement DOM `AtmosphericLayerView` canvas blits with **WebGPU `MAP_OVERLAY_*`
plugins** (layers 41–49). Same layer ids, blend modes, and data sources as the software path;
GPU adds dynamic coloring and motion the CPU path does not need to replicate.

## Data contract (unchanged from DOM)

| Source | DOM (phase 1) | WebGPU (phase 2) |
|--------|---------------|------------------|
| Scalar MOP maps | `fillFromTileGrid` + CPU colormap | Bind `Uint8Array` WASM view; colormap in WGSL |
| Deposit layers (smoke, chalk) | `AtmosphericLayer` RGBA → canvas blit | Upload texture or GPU CA pass |
| Viewport | `MapViewport` world ↔ screen | Same uniforms as `MicropolisMapPlugin` |

Embind (from SB-06): `getPollutionDensityMapBuffer()`, `getCrimeRateMapBuffer()`, etc.

## GPU-only effects (examples)

Not required on software/print path:

- **Unpowered zone blink** — `MAP_OVERLAY_*` plugin; predicate on `mapData` bits + `blinkPhase`; instanced `LIGHTNINGBOLT` quads (SB-09)
- **Stink lines** — particles gradient-climb pollution field upward from industrial tiles
- **3D Perlin noise** — `(worldX, worldY, time)` modulates opacity or hue on heat maps
- **Semantic motion** — crime flicker, traffic flow streaks, land-value shimmer
- **Live colormap** — user-adjustable ramp without re-baking RGBA each frame

## Implementation sketch

1. `MapOverlayPlugin` per registered `layerRegistry` entry with `webgpu: true`
2. Scalar pass: sample grid texture, apply `overlayColormaps` equivalent as 1D LUT uniform
3. Deposit pass: bind atmospheric RGBA from layer registry or run compute diffusion
4. Optional particle sub-pass for field-following effects
5. Parity fixture: fixed city + camera, compare software static frame vs WebGPU **without**
   time-varying effects (tolerance on base tint only)

## Files (future)

- `packages/render-core/` or app holodeck plugins — `MapOverlayPlugin.ts`, WGSL
- Toggle: hide DOM `AtmosphericLayerView` when holodeck overlay backend active (`'both'` for tests)

## See also

- [SPRITE-OVERLAY-ATLAS § Phased path](../SPRITE-OVERLAY-ATLAS.md#phased-path-dom-canvas-now-webgpu-later)
- [map-compositing §2.1](../../map-compositing-and-measurement.md#21-layer-contract)
- [HB-01 holodeck map plugin](../playbooks-holodeck/HB-01-micropolis-map-plugin.md)
