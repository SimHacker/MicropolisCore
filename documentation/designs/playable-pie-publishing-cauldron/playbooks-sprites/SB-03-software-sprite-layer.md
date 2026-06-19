# SB-03 — SoftwareSpriteLayer + Sprite.svelte

## Scope

DOM/SVG overlay above map canvas. Positions sheet sprites and procedural smoke puffs using
`MapViewport.worldPixelToScreen`. Hotspots exposed as named measurements for DOM chrome.

## Files

- `apps/micropolis/src/lib/sprites/spriteMeasure.ts`
- `apps/micropolis/src/lib/sprites/Sprite.svelte`
- `apps/micropolis/src/lib/sprites/SoftwareSpriteLayer.svelte`
- `apps/micropolis/src/lib/sprites/spriteRegistry.svelte.ts`
- Mount in `MicropolisView.svelte`

Pointer-events: none on overlay (map keeps input).
