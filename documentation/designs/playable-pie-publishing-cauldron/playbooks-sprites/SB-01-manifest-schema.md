# SB-01 — Sprite manifest schema + classic pack

## Scope

Define TypeScript types for JSON sprite atlases. Ship classic-pack manifests for engine sprites
(airplane, helicopter, train, ship, monster, tornado, explosion). Loader resolves sheet URLs
from `$lib/images/tilesets/`.

## Files

- `apps/micropolis/src/lib/sprites/types.ts`
- `apps/micropolis/src/lib/sprites/manifests/classic/*.json`
- `apps/micropolis/src/lib/sprites/classicPack.ts`

Migrate constants from legacy `sprites.ts` into JSON; keep `sprites.ts` re-exporting manifest
data for backward compatibility until callers move.
