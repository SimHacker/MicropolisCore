# Verified code anchors (single source of truth)

Playbooks **link here** instead of repeating file paths and signatures. Re-grep before
trusting line numbers (they drift); symbol names and file paths are stable. Verified
**2026-06-12** against `apps/micropolis` + `packages/*`.

All paths are relative to repo root `/Users/a2deh/GroundUp/git/MicropolisCore`.

## anchor-map-viewport

**MapViewport geometry (render-core).** `packages/render-core/src/viewport/MapViewport.ts`,
exported from `@micropolis/render-core`.

| Symbol | Signature / shape | Use |
|--------|-------------------|-----|
| `worldTileToScreenRect(tileX, tileY, tileW, tileH)` | returns `{ x, y, w, h }` CSS px, top-left origin | DOM tile frame (PB-01) |
| `screenToWorldTile(screen)` | `[number, number]` tile coords | hover pick (already used in `TileView.trackMouse`) |
| `worldTileToScreen([x, y])` | `[number, number]` screen px | misc |

`import { MapViewport } from '@micropolis/render-core'` (value + type both exported in `index.ts`).

## anchor-tile-renderer

**TileRenderer + factory (tile-renderer).** `packages/tile-renderer/src/`.

| Symbol | Where | Note |
|--------|-------|------|
| `TileRenderer.viewport` | `TileRenderer.ts` — `public readonly viewport: MapViewport` | live viewport on every renderer |
| `createMapTileRenderer(canvas, { prefer })` | `createMapTileRenderer.ts` | default chain `['webgpu','canvas']`; **WebGL opt-in only** |
| `WebGLTileRenderer` | `WebGLTileRenderer.ts` | **frozen legacy** — do not extend ([§1.1](../../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional)) |
| `WebGPUTileRenderer.initialize(canvas, ctx, mapData, mopData, mapW, mapH, tileW, tileH, tileSources)` | `WebGPUTileRenderer.ts` | ~286 lines; **not wired into app** |

## anchor-tileview

**TileView.svelte (app).** `apps/micropolis/src/lib/TileView.svelte`.

| Symbol | Note |
|--------|------|
| `let tileRenderer` | created by `createMapTileRenderer`; `tileRenderer.viewport` is the geometry source |
| `trackMouse(event)` | updates `toolState.setHoverTile(...)` via `screenToWorldTile` |
| `applyToolAt(tx, ty)` | left-click build; calls `micropolisReactive.poke.doTool` |
| `onkeydown(event)` | letters fall through to `dispatchShortcut` (the a–z `city.load-by-letter` interception was **removed 2026-06-13**, freeing letter keys for tools) |
| `commandContext(event, args?)` | builds `{ simulator, tileRenderer, tileLayersLength, … }` for dispatch |

## anchor-commandbus

**CommandBus (app).** `apps/micropolis/src/lib/CommandBus.ts`. Registration:
`apps/micropolis/src/lib/micropolisCommands.ts`.

| Symbol | Signature | Note |
|--------|-----------|------|
| `commandBus.dispatch(id, context)` | `Promise<CommandResult>` | **primary** — not `run` |
| `commandBus.dispatchShortcut(shortcut, context)` | `Promise<CommandResult>` | keyboard path |
| `commandBus.registerAll(commands)` | — | used by `registerMicropolisCommands()` |
| `normalizeShortcut(s)` | single-char parts keep case (`'R'`→`'R'`, `'r'`→`'r'`) | uppercase letter needs Shift to match |
| dispatch + `enabled` | returns `{handled:false}` when `enabled` is false | **commands gated on `hasSimulator` won't run without a simulator in context** |

**Existing shortcuts (do not collide):** `0` pause, `1`–`9` speed, `\` random, `=`/`-` tile-set,
`[`/`]` heat, arrows pan, space pan, `Shift` pan. Tool letters are now **free** (a–z no longer
intercepted). Caveat for wiring: `dispatchShortcut` matches the **exact** normalized key, and
`normalizeShortcut` keeps single chars case-sensitive — a plain `r` press yields `'r'`, so a tool
command must register the **lowercase** shortcut (`'r'`, not `'R'`) to match an unshifted keypress.
See [PB-04 § keyboard-shortcuts](../playbooks/PB-04-tool-commands.md#step-4--auto-wire-tool-letter-shortcuts).

## anchor-reactive

**MicropolisReactive façade (app).** `apps/micropolis/src/lib/MicropolisReactive.svelte.ts`
(singleton `micropolisReactive`).

| Symbol | Note |
|--------|------|
| `micropolisReactive.poke.doTool(tool, x, y)` | applies tool; bumps `mapRevision` |
| `micropolisReactive.engineCallback` | `JSCallback` passed to simulator |
| `micropolisReactive.attachedSimulator` | `MicropolisSimulator \| null` |
| `budgetModalRequested` (get) + `clearBudgetModalRequest()` | budget modal flag (PB-03) |
| `registerMapPan(fn)` | `autoGoto` → pan (already wired in TileView) |
| **No** `poke.doBudget` / `poke.setAutoBudget` yet | PB-03 adds them |

Engine (`apps/micropolis/src/types/micropolisengine.d.ts`): `micropolis.doBudget()`,
`micropolis.setAutoBudget(bool)`, `micropolis.autoBudget`, `showBudgetAndWait` callback.

## anchor-tools

**Tool catalog + state (app).**

| Symbol | Where | Note |
|--------|-------|------|
| `GAME_TOOLS` | `apps/micropolis/src/lib/gameTools.ts` | **9 tools**: bulldoze, road, rail, wire, res, com, ind, park, query |
| `resolveEditingTool(module, id)` | same file | `ToolId` → engine `EditingTool` enum |
| `toolState` | `apps/micropolis/src/lib/ToolState.svelte.ts` | `activeToolId`, `hoverTile`, `lastToolFeedback`, setters |

## anchor-cursorlayer

**CursorLayer + input types (app).** `apps/micropolis/src/lib/input/`.

| Symbol | Note |
|--------|------|
| `CursorLayer.svelte` | coordinator; `Props.backend` default `'dom'`; renders `.cursor-tool-frame` from measure today |
| `CursorPresence` (`types.ts`) | `tile?: {x,y,w?,h?}`, `rimPolicy?: 'fat'\|'thin'`, `representations: {dom?, webgpu?}`, `anchorSpace` |
| `CursorBackend` (`types.ts`) | `'dom' \| 'webgpu' \| 'both'` |
| `createMeasureStore(stage, {refs})` | `apps/micropolis/src/lib/holodeck/createMeasureStore.svelte.ts` — `get/getProp/setProp/bindProp/tick/write` |

## anchor-holodeck

**HolodeckStage + plugin contract (render-core).** `packages/render-core/src/`, exported from
`@micropolis/render-core`.

| Symbol | Where | Note |
|--------|-------|------|
| `HolodeckStage.create(canvas, {enablePick})` | `webgpu/holodeck-stage.ts` | async; `addPlugin`, `removePlugin`, `render`, `getFrame`, `measureRead/Write/Patch`, `baseLayer` |
| `HolodeckPlugin` | `holodeck/types.ts` | `{ id, layer, render(ctx), measure?, applyMeasure?, initialize?, dispose? }` |
| `HolodeckLayer` | `holodeck/types.ts` | `MICROPOLIS_MAP: 40`, `EDITING_TOOL_CURSOR: 71`, `POINTER_CURSORS: 115`, … |
| `MapSceneBaseLayer` | `scene/MapScene.ts` | `{ render(): void }` — base map pass before plugins |
| `HolodeckPluginContext` | `holodeck/types.ts` | `{ viewport, canvas, devicePixelRatio, time }` |

Used by batch 2 ([HOLODECK-CUTOVER-ATLAS.md](../HOLODECK-CUTOVER-ATLAS.md)).
