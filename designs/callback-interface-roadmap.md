# Callback Interface Roadmap

## Thesis

Micropolis callbacks should be useful beyond the SvelteKit GUI: reactive world state, headless replay, command recording, LLM observation, automation, and debugging. The surface should evolve toward a stable **event** story (normalized payloads, shared envelope), not only ad hoc UI notifications.

## UI bridge (preferred for Svelte and tooling)

**`micropolis/src/lib/MicropolisReactive.svelte.ts`** exports **`micropolisReactive`**: Svelte 5 runes fed by a full **`JSCallback`** implementation, plus **`getSnapshot()`** for JSON/MCP/interop. **Attach** the shared `MicropolisSimulator` after `getSharedSimulator(..., micropolisReactive.engineCallback, ...)`; **detach** on unmount.

- **Callbacks first** — handlers should rely on engine events and reactive fields; most UI does not need raw WASM.
- **`memory`** — `mapU16`, `mopU16`, optional full `heapU16`, byte addresses and linear tile indexing for renderers and bulk tools.
- **`peek`** — authoritative synchronous reads (`tile`, `scalars`) when the reactive mirror is not enough.
- **`poke`** — supported Embind mutators (`setTile`, `doTool`, `loadCity`, …) plus **`bumpMap()`** after unsafe buffer edits.
- **`wasmModule`** — Emscripten exports (`WORLD_W`, `EditingTool`, `Tiles`, …).

Prefer these APIs over importing `Micropolis` or touching heap in UI code; extend the bridge when a new safe surface is needed.

## Authoritative API (WASM / Embind)

Embind and TypeScript see the methods declared on **`Callback`** in `MicropolisEngine/src/callback.h` (same names on `JSCallback` in `MicropolisEngine/src/js_callback.h` and `micropolis/src/types/micropolisengine.d.ts`). Current symbols:

```text
autoGoto
didGenerateMap
didLoadCity
didLoadScenario
didLoseGame
didSaveCity
didTool
didWinGame
didntLoadCity
didntSaveCity
makeSound
newGame
saveCityAs
sendMessage
showBudgetAndWait
showZoneStatus
simulateRobots
simulateChurch
startEarthquake
startGame
startScenario
updateBudget
updateCityName
updateDate
updateDemand
updateEvaluation
updateFunds
updateGameLevel
updateHistory
updateMap
updateOptions
updatePasses
updatePaused
updateSpeed
updateTaxRate
```

Implementations today include **`micropolisReactive.engineCallback`** (`MicropolisReactive.svelte.ts`) and the shared headless no-op callback in `micropolis/src/lib/wasm/callbacks.ts` used by `micropolis sim`. Vitest integration tests live beside the bridge (`npm run test` in `micropolis/`).

## Naming and events

When renaming or adding symbols, follow **`naming-conventions.md`**: event strings end on a **terminal** (`updated`, `changed`, `loaded`, …) — not `updated.did` or other doubled completion. Do not publish rename matrices ahead of the patch; the files above are the truth.

Low-level engine hooks should report **domain facts**, not UI policy. Hosts decide modals, logs, or issue posts.

## Payload style

Embind passes positional arguments today; JS/TS adapters should normalize into a **`MicropolisEvent`** (see `naming-conventions.md`) with `event_type` and `payload` chosen at implementation time, not invented as a second catalog in this file.

## Migration plan

1. Change `callback.h` / `JSCallback` / call sites / generated `.d.ts` together when renaming.
2. Update `MicropolisReactive`, shared WASM callbacks, and any tests.
3. Normalize invocations into `MicropolisEvent` where the app records or routes events.

Skip compatibility aliases unless an external API forces them.

For testing strategy, heap handling, Vitest constraints, remaining coverage, and longer-term alignment with the command bus and MCP work, see **`wasm-bridge-and-testing-trajectory.md`**.
