# Micropolis playable-game readiness

> **Provenance:** captured from the "Micropolis game exploration and implementation"
> sub-agent analysis (June 2026), persisted here so it outlives chat context. This is
> the **evidence-based ground truth** for the minimal playable vertical slice. The
> larger interaction vision (pie menus, memory-palace graph editor, publishing) is
> gathered in [playable-pie-publishing-cauldron/](playable-pie-publishing-cauldron/README.md).
>
> **Related:** [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md),
> [callback-interface-roadmap.md](callback-interface-roadmap.md),
> [wasm-bridge-and-testing-trajectory.md](wasm-bridge-and-testing-trajectory.md),
> [simcity-tool-palette-design.md](simcity-tool-palette-design.md),
> [unified-webgpu-renderer.md](unified-webgpu-renderer.md),
> [piecraft/PIE-MENU-MODEL.md](piecraft/PIE-MENU-MODEL.md).

## Executive summary

The stack is **simulation-capable but not yet a playable game UI.** There is a working
WASM engine bridge, a WebGL tile-map viewer, a keyboard-driven command bus, and a solid
reactive engine façade — but **no tool cursor, no click-to-build, no HUD, no
budget/messages/zone overlays wired to the UI, and `PieMenu` is a stub.** The engine
already simulates disasters and sprites internally; the browser layer does not surface
them.

**Key takeaway:** the engine and reactive bridge are *ahead of* the UI. The fastest path
to "playable" is **not** more engine work — it is `ToolState` + a click handler + a HUD +
a toolbar, wired through the existing `poke.doTool()` and callback-driven `$state`, with
auto-start sim speed as the first one-line fix.

## 1. App structure (`apps/micropolis/`)

Main game path: `/play/micropolis` → `MicropolisView` → `TileView` (WebGL canvas).

| File | Purpose |
|------|---------|
| `src/lib/MicropolisView.svelte` | Mount lifecycle: shared simulator, attach reactive bridge, init TileView |
| `src/lib/TileView.svelte` | WebGL canvas, pan/zoom, keyboard → CommandBus |
| `src/lib/MicropolisSimulator.ts` | WASM singleton, tick loop, map/heap views |
| `src/lib/MicropolisReactive.svelte.ts` | Svelte 5 runes reactive engine façade |
| `src/lib/micropolisCommands.ts` | CommandBus registrations (view/sim/tax; **no tools yet**) |
| `src/lib/CommandBus.ts` | Unified dispatch (keyboard, pie-menu, LLM, MCP) |
| `src/lib/About.svelte` | About overlay (the only real overlay today) |
| `src/lib/PieMenu.svelte` | **Stub** — ~1600 lines of logic commented out; renders a placeholder |
| `src/lib/sprites.ts` | Sprite atlas metadata (currently unreferenced by the renderer) |
| `src/lib/wasm/browser.ts` | Loads committed `micropolisengine.js` |

## 2. Svelte 5 runes usage

`MicropolisReactive.svelte.ts` is the primary game-state module: `$state` for all
engine-fed scalars (funds, date, demand, sim speed/pause, `mapRevision`, messages, budget
request, zone status). Pattern: **Embind callback → mutate `$state` → consumers read
getters.** No `$derived`/`$effect` in the module itself (plain reactive store).

**Critical gap:** `micropolisReactive` is attached in `MicropolisView` but **never read by
any component**. The reactive layer currently feeds *tests*, not gameplay chrome.

Recommended runes pattern for the playable UI:

```ts
// ToolState.svelte.ts (new)
let activeTool = $state<EditingTool>(TOOL_ROAD);
let hoverTile = $state<[number, number] | null>(null);

// GameHud.svelte
const funds = $derived(micropolisReactive.totalFunds);

// TileView.svelte
$effect(() => { micropolisReactive.mapRevision; tileRenderer?.render(); });
```

## 3. Engine API (`packages/micropolis-engine/`)

TS bindings: `build/micropolisengine.d.ts` (copied to `apps/micropolis/src/types/`).

- **Simulation:** `init()`, `simTick()`, `simUpdate()`, `pause()/resume()`, `setSpeed()`,
  `setPasses()`, `loadCity()`, `generateMap(seed)`, `generateSomeRandomCity()`,
  `clearMap()`, `doNewGame()`, `updateFunds/Maps/Evaluation/Budget()`. Flags:
  `enableDisasters`, `autoBudget`, `autoBulldoze`, `doAnimation`.
- **Tools (20):** `EditingTool` enum (`TOOL_RESIDENTIAL`, `TOOL_ROAD`, `TOOL_BULLDOZER`,
  `TOOL_QUERY`, …). `doTool(tool,x,y): ToolResult` — already wrapped as
  `micropolisReactive.poke.doTool()` and tested in `MicropolisReactive.poke.test.ts`.
  Results: `TOOLRESULT_OK`, `NO_MONEY`, `NEED_BULLDOZE`, `FAILED`.
- **Disasters/sprites (engine-side):** `makeEarthquake/Fire/Meltdown/Flood()` etc.;
  automatic scheduling when `enableDisasters`. `SpriteType`: airplane, monster, tornado,
  train, helicopter, ship, explosion, bus — animate in C++; `SimSprite` is Embind-exported
  but **not read or drawn in the browser**.
- **Callbacks → bridge:** `MicropolisReactive` implements the full `JSCallback` surface.
  `updateFunds/Date/Demand` → HUD-ready; `sendMessage` → `messageIndex` (no UI);
  `showBudgetAndWait` → `budgetModalRequested` (no modal); `showZoneStatus` → `zoneStatus`
  (no popup); `makeSound` → no-op; `autoGoto` → no-op (map pan-on-message not wired).

## 4. UI today vs. stubs

| Feature | Status |
|---------|--------|
| WebGL map render | ✅ `TileView` + `WebGLTileRenderer` |
| Pan / zoom | ✅ |
| Sim tick | ⚠️ only after user presses a speed key 1–9; **no default speed on load** |
| Keyboard shortcuts | ✅ via `micropolisCommands.ts` |
| About overlay | ✅ |
| HUD (funds/date/demand/pop) | ❌ missing |
| Toolbar / tool selection | ❌ missing |
| Click-to-place tools | ❌ missing (mouse only pans) |
| Tool cursor / ghost preview | ❌ missing |
| Query tool UI | ❌ missing (engine supports it) |
| Budget modal | ❌ flag set, no modal |
| Message/advisory toasts | ❌ captured, not displayed |
| Disaster visuals (sprites) | ❌ engine simulates; sprites not overlaid |
| Pie menu | ❌ stub |
| Touch pan/pinch | ❌ handlers commented out |
| WebGPU / Canvas renderer selection in app | ❌ WebGL hardcoded (`TileView` ~line 91) |

## 5. Renderers (`packages/tile-renderer/`)

| Class | Status |
|-------|--------|
| `TileRenderer` (base) | pan/zoom, screen↔tile coords, layer specs |
| `WebGLTileRenderer` | **used in production UI** |
| `WebGPUTileRenderer` | implemented (~286 lines), **not wired into app** |
| `CanvasTileRenderer` | software path; used only on `/render` |

App integration point: `TileView.svelte` hardcodes `new WebGLTileRenderer()`. See
[renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) and
[unified-webgpu-renderer.md](unified-webgpu-renderer.md) for the capability-based selection
plan and the shared WebGPU compositor (holodeck) the Sims (VitaMoo) track also needs.

## 6. Prioritized plan — minimal playable vertical slice

**Goal:** Load city → see sim run → pick tool → click map to build → see funds/date change
→ query a zone → get a message when a disaster fires.

### Phase A — Make the sim feel alive (~1–2 days)
- **A1** Auto-start sim at speed 3 on first attach — `MicropolisSimulator.ts` (one-line fix).
- **A2** `GameHud.svelte` (new): funds, date, R/C/I demand, pause indicator; mount in `MicropolisView`.
- **A3** Bind HUD to `micropolisReactive` via `$derived`.
- **A4** Optional `$effect` on `mapRevision` in `TileView` (vs. only tick-driven render).

### Phase B — Core interaction loop (~2–3 days)
- **B1** `ToolState.svelte.ts` (new): `$state` active tool, `autoBulldoze` flag.
- **B2** Distinguish pan vs. build in `TileView` (e.g. middle-click / Space+drag pans; left-click applies tool).
- **B3** On click → `micropolisReactive.poke.doTool(activeTool, tileX, tileY)`.
- **B4** Tool cursor CSS + ghost preview at `hoverTile`.
- **B5** Minimal `Toolbar.svelte` (Road, Bulldoze, R/C/I, Query) — **simpler than full PieMenu** to get playable fast.
- **B6** Command-bus commands `tool.select-*`, `tool.apply-at-cursor` in `micropolisCommands.ts`.

### Phase C — Classic SimCity feedback (~2–3 days)
- **C1** `MessageOverlay.svelte` (new) on `messageIndex` (+ i18n lookup).
- **C2** `ZoneStatusPanel.svelte` (new) on `zoneStatus` + `TOOL_QUERY` click.
- **C3** `BudgetModal.svelte` (new) on `budgetModalRequested`; wire `doBudget()` / clear flag.
- **C4** Wire `autoGoto` → pan map to message coordinates (`MicropolisReactive` + `TileView`).
- **C5** Dev menu: wrap `makeEarthquake` etc. as commands / poke extensions.

### Phase D — Polish & renderer (later)
- **D1** Renderer factory: WebGL default, WebGPU if available, Canvas fallback (`createTileRenderer.ts`).
- **D2** Sprite overlay layer (`SpriteOverlay.svelte`; read engine sprite list).
- **D3** Finish **PieMenu** + command-bus metadata → **this is where the
  [cauldron](playable-pie-publishing-cauldron/README.md) takes over**: the toolbar is the
  stop-gap; the pie/graph substrate is the real interaction model.
- **D4** Touch pan/pinch. **D5** Audio via `makeSound`.

### Suggested file touch order (smallest path to "playable")
1. `MicropolisSimulator.ts` — default speed
2. `ToolState.svelte.ts` — create
3. `GameHud.svelte` — create
4. `Toolbar.svelte` — create
5. `TileView.svelte` — click-to-tool, hover tile, cursor
6. `MicropolisView.svelte` — compose HUD + toolbar
7. `micropolisCommands.ts` — tool commands
8. `MessageOverlay.svelte` — create
9. `MicropolisReactive.svelte.ts` — `autoGoto` pan hook, optional disaster poke wrappers

## 7. Definition of done (vertical slice)

- [ ] City loads and sim runs without pressing a number key
- [ ] User selects Road/Bulldoze/Zone/Query from visible UI
- [ ] Left-click places tool; funds decrease; map updates
- [ ] HUD shows funds, date, demand changing over time
- [ ] Query click shows zone stats panel
- [ ] Engine message (e.g. tornado sighted) appears as on-screen toast
- [ ] Pan/zoom still works alongside tools

## 8. Relationship to the pie-menu reimagination

The **Toolbar (B5)** is deliberately a stop-gap to reach "playable" quickly. The
**fresh pie-menu substrate** — Svelte 5 runes, accessibility, persistence, user-editability,
and generalization into a memory-palace graph editor — is a larger cross-cutting effort
gathered and brewed in
[playable-pie-publishing-cauldron/](playable-pie-publishing-cauldron/README.md). The command-bus
metadata (`context: ['pie-menu']` already on commands) is the seam where the toolbar and the
eventual pie substrate meet, so Phase B work is **not** throwaway.
