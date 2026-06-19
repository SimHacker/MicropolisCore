# SB-02 — Engine sprite sync (Embind)

## Scope

Expose active C++ sprites to JavaScript via `Micropolis.getActiveSprites()` (linked list walk,
`frame != 0`). TS helper maps `SimSprite` + manifest → `SpriteInstance[]`.

## Files

- `packages/micropolis-engine/src/emscripten.cpp` — lambda binding
- `apps/micropolis/src/types/micropolisengine.d.ts`
- `apps/micropolis/src/lib/sprites/syncEngineSprites.ts`

Rebuild WASM: `pnpm --filter @micropolis/engine-wasm run build`

Until rebuild, sync returns `[]` gracefully if method missing.
