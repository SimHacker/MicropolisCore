# SB-06 — MOP scalar overlays on raster layer stack

## Scope

Pollution, population, crime, land value, traffic — same `AtmosphericLayer` +
`AtmosphericLayerView` as skywriting smoke. Per-tile scalar grid -> colormap ->
`fillFromTileGrid` -> `smooth` -> viewport blit with `multiply` blend.

## Prerequisites

- SB-05 atmospheric layers (shipped)
- Embind: expose `getPollutionDensityMapBuffer()`, `getCrimeRateMapBuffer()`, etc. (or heap views)

## Files

- `layers/scalarFieldOverlay.ts` — `updateScalarOverlayLayer()` (scaffold shipped)
- `layers/overlayColormaps.ts` — pollution, population, crime ramps
- Toolbar / command-bus toggle `view.overlay.pollution` etc.
- `SoftwareSpriteLayer` — refresh scalar layers on sim tick (no CA decay)

## Verify

- Toggle pollution overlay; soft color wash over map; pan/zoom tracks via viewport blit
- Same PNG export path as smoke layers (future Node compositor)

## See also

- [map-compositing-and-measurement.md §2.1](../../map-compositing-and-measurement.md#21-layer-contract)
