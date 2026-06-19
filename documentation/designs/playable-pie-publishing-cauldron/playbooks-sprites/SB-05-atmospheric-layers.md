# SB-05 — Atmospheric layers (plugin-owned RGBA + CA)

## Scope

Plugin sprites own **world-aligned transparent canvas layers**. Deposit pigment (smoke, chalk);
run **diffusion + fade** each frame; blit through `MapViewport` onto a screen canvas.

Skywriting uses layer `skywriting-smoke`. Pilot: `` ` `` / F9, arrows, space, type letters.

## Files

- `apps/micropolis/src/lib/sprites/layers/AtmosphericLayer.ts`
- `apps/micropolis/src/lib/sprites/layers/layerRegistry.ts`
- `apps/micropolis/src/lib/sprites/layers/AtmosphericLayerView.svelte`
- `SkywritingPlugin.svelte.ts` — deposits to layer, pilot mode

## Future (SB-07)

- Chalk tool → `chalk-strokes` layer (sharp deposit, less diffusion)
- Multiplayer: sparse patch sync via command bus / measure protocol
- Pointer drag to grab plane
- Holodeck GPU composite of same buffer (SB-08)
