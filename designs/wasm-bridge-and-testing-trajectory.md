# WASM bridge, heap safety, and automated testing — trajectory

This note records **what we built**, **why**, **what remains**, and how it fits the wider MicropolisCore direction (callbacks, command path, tooling). It complements **`callback-interface-roadmap.md`**, which stays focused on callback naming and the reactive API surface.

## Intentions

1. **Treat the reactive bridge as the stable JS façade** — UI and automation should prefer **`micropolisReactive`** (`peek` / `poke` / `memory` / `wasmModule` / `getSnapshot`) over ad hoc heap access or duplicated Embind calls. Tests should exercise that façade against real WASM so regressions show up before shipping.

2. **Make heap access defensive** — Emscripten builds may expose **`Module.wasmMemory`**, **`HEAPU16`**, or neither until initialization; some stubs **throw** when read too early. Centralizing reads in **`heapU16FromEmscriptenModule`** keeps **`MicropolisSimulator`** and tests from crashing on missing or aborting getters.

3. **Run tests where the app runs** — Vitest uses the same **SvelteKit + Vite** pipeline as **`micropolis/`**, so **Svelte 5 runes** in **`MicropolisReactive.svelte.ts`** compile correctly (plain **`.ts`** breaks with **`$state is not defined`** in Node).

4. **Do not fight Embind lifetimes in tests** — Teardown order matters: deleting certain Embind wrappers before **`Micropolis`** can trigger **`RuntimeError`** in destructors. Loader tests destroy **`Micropolis`** first and avoid patterns that abort during shutdown (documented in test comments).

## What we implemented

| Area | Detail |
|------|--------|
| **Vitest** | **`npm run test`** / **`npm run test:watch`** in **`micropolis/`**; **`vitest.config.ts`** — Node env, **`pool: 'forks'`**, **`fileParallelism: false`**, long timeouts for WASM load/init. |
| **Bridge filename** | **`MicropolisReactive.svelte.ts`** so runes are valid under the test runner; **`MicropolisView.svelte`** imports **`$lib/MicropolisReactive.svelte`**. |
| **Heap helper** | **`src/lib/wasm/heap.ts`** — **`heapU16FromEmscriptenModule(module)`** with **try/catch** around **`wasmMemory.buffer`** / **`HEAPU16`**. |
| **Simulator** | **`MicropolisSimulator`** uses the helper for map/mop views; if no view, warns and leaves **`mapData`/`mopData`** null (graceful degradation). |
| **Node/browser loaders** | **`src/lib/wasm/node.ts`** and **`src/lib/wasm/browser.ts`** — shared WASM + asset loading for **`micropolis sim`**, Vitest, and browser startup; **`callbacks.ts`** and **`views.ts`** provide noop callbacks and map/mop views. |
| **Tests** | **`micropolisWasm.loader.test.ts`** — artifacts, **`WORLD_*`**, map/mop byte sizes, optional buffer checks, **`loadCity`**. **`MicropolisReactive.integration.test.ts`** — attach simulator-shaped object, **`wasmModule`**, **`memory`**, **`syncFromEngine`**, **`peek`**, **`getSnapshot`**, **`poke`**. **`wasm/heap.test.ts`** — null module and throwing getters. |
| **Docs** | **`micropolis/README.md`** — Tests section. **`callback-interface-roadmap.md`** — Vitest pointer. |

## Goals this unlocks

- **Regression safety** for the bridge and WASM load path on every **`npm run test`**.
- **Clear extension point** — new **`poke`** / **`peek`** surfaces should get integration coverage before UI reliance.
- **Alignment with MCP / automation** — **`getSnapshot()`** and stable **`memory`** indexing are easier to trust when exercised under automation.

## What is left to do (near term)

- **Broader bridge coverage** — e.g. **`poke.doTool`**, scenario loads, pause/speed paths, and any new **`JSCallback`** methods as they land.
- **Callback capture** — add a recorder-oriented callback implementation when replay/debugging needs persisted event streams.
- **CI** — run **`micropolis`** **`npm run test`** (and **`check`**) on PRs once CI exists or is extended for this package.
- **CLI coverage** — keep **`micropolis sim`** smoke checks aligned with **`src/lib/wasm/node.ts`** so terminal and test paths exercise the same loader.
- **Root README** — optional cross-link from repo **`README.md`** to **`micropolis`** testing if contributors land here first.

## Trajectory (medium term)

1. **Normalized events** — Move toward **`MicropolisEvent`** envelopes (**`naming-conventions.md`**) so **`micropolisReactive`**, recorders, and MCP share one vocabulary instead of parallel string catalogs.

2. **Command path** — **`command-path-collaboration-modes.md`** and **`skills/micropolis-command-bus/`** — tests should eventually assert **recorded commands** or bus payloads where the bridge becomes the injection point for deterministic replay.

3. **Headless + LLM** — **`moollm-micropolis-integration.md`** — snapshots and **`peek`/`poke`** stability underpin skills and MCP tools; integration tests are the first line of defense for schema drift.

4. **Multiplayer / timeline docs** — **`command-timeline-git-branches.md`**, **`multiplayer-browser-lessons.md`** — WASM correctness and callback ordering remain prerequisites; this test stack does not replace network or CRDT work but reduces “engine lied to the UI” failures.

## Summary

We intentionally **test the real WASM stack** through **`micropolisReactive`** and a **defensive heap layer**, using **Vitest + SvelteKit** so runes and production builds stay aligned. Remaining work is **coverage expansion**, **CI**, **shared loader cleanup**, and tying tests into the **event envelope** and **command-bus** story as those APIs stabilize.
