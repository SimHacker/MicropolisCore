# SB-04 — Skywriting airplane plugin

## Scope

First **plugin sprite**: an airplane traces colored smoke letters over the city. Triggers on
population milestones and via programmatic API for user messages / goal celebrations.

## Files

- `apps/micropolis/src/lib/sprites/plugins/skywriting/SkywritingPlugin.svelte.ts`
- `apps/micropolis/src/lib/sprites/plugins/skywriting/letterPaths.ts`
- `apps/micropolis/src/lib/sprites/plugins/skywriting/milestones.ts`

## Behaviour

1. `triggerSkywriting(text, options?)` builds a world-pixel polyline from stroke font paths.
2. Each sim/render tick advances along the path; airplane instance at current point.
3. Smoke puffs emit at `exhaust` attachment (procedural `smoke-puff`, tinted, fading).
4. `$effect` on `micropolisReactive.cityPop` fires preset messages at thresholds (10k, 50k, …).

## Verify

- Load city, fast-forward sim; crossing 10k pop shows skywriting once.
- `triggerSkywriting('HELLO')` from console/dev command draws readable smoke trail.
