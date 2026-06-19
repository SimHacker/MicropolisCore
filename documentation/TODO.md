# MicropolisCore — What To Do Next

Top-level entry point. Each section names the next engineering work, its urgency, and
a pointer to the authoritative document or file where the details live.

Start here when deciding what to pick up. Do not duplicate prose here—maintain it in
the linked documents.

---

## Quick index by area

| Area | Next concrete action | Priority |
|------|----------------------|----------|
| [Playable Micropolis game](#playable-micropolis-game) | Phase A: auto-start sim + HUD bound to `micropolisReactive` | **High** |
| [Playable Micropolis game](#playable-micropolis-game) | Phase B: `ToolState` + click-to-build + minimal `Toolbar` | **High** |
| [Playable Micropolis game](#playable-micropolis-game) | Phase B: `CursorLayer` DOM/SVG tool cursor (same clip math as future WebGPU) | **High** |
| [Playable Micropolis game](#playable-micropolis-game) | Phase C: message/zone/budget overlays + disaster surfacing | High |
| [Playable Micropolis game](#playable-micropolis-game) | Pie/cursor substrate + memory-palace graph editor (cauldron) | Medium |
| [Micropolis renderer](#micropolis-renderer) | Holodeck map migration — **after playable A–C** | Medium (gated) |
| [Software sprite overlay](#software-sprite-overlay) | SB-01..04: manifests, DOM layer, engine sync, skywriting plugin | **High** (parallel PB) |
| [Micropolis renderer](#micropolis-renderer) | Sprite compositor (engine simulates; client does not draw) — [#4](https://github.com/SimHacker/MicropolisCore/issues/4) | Medium |
| [Micropolis renderer](#micropolis-renderer) | Tileset packs: MOP atlas mixing + per-set sprite overrides | Medium |
| [Micropolis renderer](#micropolis-renderer) | ~~Ancient Asia tile atlas (`tiles.bmp` ← `asia.bmp`)~~ ✅ [#9](https://github.com/SimHacker/MicropolisCore/issues/9) | ~~Medium~~ |
| [CI / build integrity](#ci--build-integrity) | ~~Concurrent `dev` + C++ watch/rebuild ([PR #6](https://github.com/SimHacker/MicropolisCore/pull/6))~~ ✅ | ~~Medium~~ |
| [CI / build integrity](#ci--build-integrity) | ~~Wire `verify:structure` into CI~~ ✅ | ~~High~~ |
| [CI / build integrity](#ci--build-integrity) | ~~Add PR workflow (structure + build-ts + svelte-check + Vitest)~~ ✅ | ~~High~~ |
| [Code quality](#code-quality) | `noUncheckedIndexedAccess` in tsconfig files | Low |
| [Code quality](#code-quality) | `exactOptionalPropertyTypes` in tsconfig files | Low |
| [Code quality](#code-quality) | Shared root `tsconfig.base.json` for consistent strictness | Low |
| [Micropolis WASM testing](#micropolis-wasm-testing) | Expand bridge test coverage | Medium |
| [Micropolis WASM testing](#micropolis-wasm-testing) | ~~Add CI for Vitest~~ ✅ | ~~High~~ |
| [Micropolis callbacks](#micropolis-callbacks--events) | Normalized event envelopes | Medium |
| [VitaMoo — Holodeck](#vitamoo--holodeck) | Terrain/floor/wall/roof pipeline | Medium |
| [VitaMoo — renderer polish](#vitamoo--webgpu-renderer-polish) | GPU pass timing, richer validation UX | Medium |
| [VitaMoo — UI overlays](#vitamoo--ui-overlays) | Pie-menu head, speech bubbles, censorship pass | Low–Medium |
| [VitaMooSpace — Roots & Catalog tabs](#vitamoospace--roots--catalog-tabs) | ~~Roots + Catalog~~ ✅ built — smoke test, then SQLite persistence | Medium |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Phase 0: sims-io L4 ContentIndex bridge + MOOLLM `CHARACTER.yml` emit | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Phase 0: SPR2 → PNG export + `.iff` save-file download | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Phase 0: minimal `apps/simopolis/` SvelteKit shell | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Phase 1: MOOLLM enrichment via MCP + Family Album server | High |
| [Simopolis — The Uplift](#simopolis--the-uplift) | **Phase 1C: Uplifted Computer + custom IFF content (the headline demo)** | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | **Phase 1D: Imagine Loop — Examine → Imagine → Edit → Inject (the LLM-as-narrator alternative to reimplementing the Sims engine)** | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | **Phase 1E: Family Album as StoryMaker — branching/merging graph of scenes; "snippets of DNA"; 35-year SimCity → Bar Karma → MicropolisCore lineage** | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | **Phase 1F: Twitch-friendly streaming features — chat-as-writers'-room, OBS overlays, Twitch Extension, save-file giveaway with provenance** | **High** |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Phase 2: Micropolis residential zone ↔ Sims neighborhood data contract | Medium |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Phase 3: Archive tornado — first source (Sims Exchange via archive.org) | Medium |
| [Simopolis — The Uplift](#simopolis--the-uplift) | Federation peer-game bridges (post-Phase-2): CK3, RimWorld, Stardew Valley, Dwarf Fortress, VTTs (see [federation-peer-games.md](designs/federation-peer-games.md)) | Medium |
| [Sims I/O in TypeScript](#sims-io-typescript-package) | ~~Scaffold `packages/sims-io/` L0–L3~~ ✅ done (48 tests) | ~~High~~ |
| [Sims I/O in TypeScript](#sims-io-typescript-package) | Add `parseMSH` to vitamoo (prototype-1998 binary mesh, DDD format) | Medium |
| [GUID collision tooling](#sims-guid-collision-tooling) | Wire collision scanner into VitaMooSpace UI | Medium |
| [GPU asset tooling](#vitamoo--gpu-assets--interchange) | Readback → BMP/IFF export; glTF import/export | Medium |
| [Package scoping](#package-naming--scoping) | Scope vitamoo/mooshow names (`@vitamoo/…`) | Low |
| [MicropolisHub / MOOLLM](#micropolishub--moollm-integration) | MCP service, command bus, LLM proposals | Long-horizon |
| [Multiplayer / Git-as-multiverse](#multiplayer--git-as-multiverse) | Command timeline, branch objects | Long-horizon |

---

## Playable Micropolis game

**Details:** [documentation/designs/micropolis-playable-game-readiness.md](designs/micropolis-playable-game-readiness.md)
(evidence-based ground truth + Phase A–D plan) and the gathering cauldron
[documentation/designs/playable-pie-publishing-cauldron/](designs/playable-pie-publishing-cauldron/README.md)
(the interaction + publishing vision: pie/cursor/graph substrate + federated publishing).

The engine, WASM bridge, WebGL tile viewer, command bus, and Svelte-5 reactive façade all
work — but there is **no HUD, tool cursor, click-to-build, or message/zone/budget UI**, and
`PieMenu.svelte` is a stub. The reactive layer feeds tests, not chrome.

**Policy:** **Playable first** (Phases A–C on the existing WebGL map). Do **not** block
playable on holodeck migration or WebGPU cursor plugins. Cursors ship via
`CursorLayer.svelte` with **DOM/SVG** first (tile footprint + ghost preview); **WebGPU cursor
rendering** is added later as a parallel, configurable backend on the same component — no
disruption, incremental growth. See [map-compositing-and-measurement.md §4](designs/map-compositing-and-measurement.md#4-implementation-order-updated).

### P1. Vertical slice — Phase A (make the sim feel alive) — **High**
Auto-start sim at speed 3 on attach (`MicropolisSimulator.ts`); new `GameHud.svelte` (funds,
date, R/C/I demand, pause) bound to `micropolisReactive` via `$derived`; mount in
`MicropolisView`. See readiness doc §6 Phase A.

### P2. Vertical slice — Phase B (core interaction loop) — **High**
`ToolState.svelte.ts` (active tool); pan-vs-build in `TileView`; left-click →
`micropolisReactive.poke.doTool()`; minimal `Toolbar.svelte` (Road/Bulldoze/R-C-I/Query);
`tool.*` command-bus commands. §6 Phase B.

### P2b. Tool cursor via `CursorLayer` (DOM/SVG, same phase as B) — **High**
Mount `CursorLayer.svelte` above the map canvas. **Phase 1 backend:** DOM/SVG tile frame +
ghost preview at `hoverTile` — use `MapViewport` / tile-renderer screen↔tile math so
**clipping and footprint match** what the future WebGPU layer will use. **Phase 2 backend
(later):** enable `representations.webgpu` + holodeck plugins when map migrates to
`HolodeckStage`; DOM labels/chrome remain on the same component. Config:
`CursorBackend = 'dom' | 'webgpu' | 'both'`. Measure protocol wires in when holodeck lands;
until then, cursor geometry comes from shared viewport helpers. See
[input/README.md](../apps/micropolis/src/lib/input/README.md).

### P3. Vertical slice — Phase C (classic feedback) — High
`MessageOverlay` (advisory toasts), `ZoneStatusPanel` (query), `BudgetModal`, `autoGoto`
map-pan, disaster dev commands. §6 Phase C.

### P4. Pie/cursor substrate + memory-palace graph editor — Medium (cauldron)
Fresh Svelte 5 reimagination of pie menus (not uncommenting the prototype) on
[piecraft/PIE-MENU-MODEL.md](designs/piecraft/PIE-MENU-MODEL.md) +
[virtual-cursor-layer.md](designs/virtual-cursor-layer.md), generalizing into a
bump-to-connect, two-way-linked, pie-navigable graph editor/browser. Gathered + brewed in the
cauldron above; ladled into playbooks once the monolith stabilizes.

---

## CI / build integrity

**Publishing policy (micropolisweb.com):** Pushes to `main` run **PR Checks** only (structure,
TypeScript, tests) — they do **not** deploy. The live demo at
[micropolisweb.com](https://micropolisweb.com/) updates **only** when you manually run
**Actions → Build Wasm Library with Emscripten** and check **Deploy to GitHub Pages**.
Default for that checkbox is **off** so you can verify a full build before publishing.

| Workflow | Trigger | Deploys Pages? |
|----------|---------|----------------|
| `pr-checks.yml` | every push / PR | No |
| `emscripten_build.yml` | manual only | Only if `deploy_to_pages` ✓ |
| `vitamoo-pages.yml` | manual only | VitaMooSpace (separate site) |

**Local dev:** `pnpm --filter micropolis dev` — Vite plus watched engine rebuild (requires
Emscripten). Use `pnpm --filter micropolis run dev:vite` for Vite only with committed WASM.
See [DEVELOPMENT.md](../DEVELOPMENT.md).

### 1. ✅ Concurrent `dev` + engine watch — done ([PR #6](https://github.com/SimHacker/MicropolisCore/pull/6))

Landed in monorepo: `apps/micropolis` `dev` / `dev:vite` / `dev:engine` (`concurrently` +
`chokidar-cli` → `pnpm --filter @micropolis/engine-wasm run build`). Close stale PR #6.

### 2. Emscripten + Pages workflow

`.github/workflows/emscripten_build.yml` — manual-only; Jekyll step uses `apps/micropolis/website/`.
Use **`deploy_to_pages: false`** (default) while developing; re-run with deploy enabled when ready.

**File:** `.github/workflows/emscripten_build.yml`

---

### 3. ✅ Wire `verify:structure` into CI — done

`pnpm run verify:structure` (20 assertions) now runs in both `emscripten_build.yml`
(after WASM build) and `vitamoo-pages.yml` (after `pnpm install`).

### 4. ✅ Lightweight PR workflow — done

**File:** `.github/workflows/pr-checks.yml`

## Micropolis WASM testing

**Details:** [documentation/designs/wasm-bridge-and-testing-trajectory.md](designs/wasm-bridge-and-testing-trajectory.md)

### 4. ✅ CI for `pnpm --filter micropolis run test` — done

Now runs in `emscripten_build.yml` after the WASM build step. See item 3 above for
adding it to a lightweight PR workflow that doesn't need Emscripten.

### 5. Expand bridge test coverage

Currently: loader, heap, and `MicropolisReactive` integration (attach, peek, poke, snapshot).
Missing:
- `poke.doTool` paths
- Scenario load / `loadCity`
- Pause / speed paths
- New `JSCallback` methods as they land
- Callback capture / recorder-oriented implementation

**File:** `apps/micropolis/src/lib/` — add to `*.test.ts` files

---

## Micropolis callbacks / events

**Details:** [documentation/designs/callback-interface-roadmap.md](designs/callback-interface-roadmap.md)

### 5. Normalized event envelopes (`MicropolisEvent`)

Move toward a shared `MicropolisEvent` envelope so `micropolisReactive`, command recorders,
MCP tools, and LLM observers share one vocabulary. Currently the bridge uses the Embind
callback method names directly.

See naming conventions: [documentation/designs/naming-conventions.md](designs/naming-conventions.md)

---

## Software sprite overlay

**Details:** [documentation/designs/playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md](designs/playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md),
[playbooks-sprites/](designs/playable-pie-publishing-cauldron/playbooks-sprites/README.md)

Parallel to playable batch 1 — does not block PB-01..05. DOM/SVG `SoftwareSpriteLayer` first;
Node print + WebGPU holodeck plugin share JSON manifests and measure-compatible hotspots.

### S1. Batch 1.5 — manifests + DOM layer + skywriting — **High**
- SB-01 JSON manifests (classic pack) + types
- SB-02 `getActiveSprites()` Embind + engine sync
- SB-03 `Sprite.svelte` + `SoftwareSpriteLayer` mount
- SB-04 Skywriting airplane plugin (smoke letters, population milestones)

### S2. Deferred
- SB-06 MOP scalar overlays (pollution, population, crime) — same layer stack, colormap + smooth
- SB-07 Chalk / whiteboard tool plugins + multiplayer patches
- SB-08 Node print + holodeck GPU read same raster buffers

---

## Micropolis renderer

**Details:** [documentation/designs/renderer-plugin-roadmap.md](designs/renderer-plugin-roadmap.md),
[documentation/designs/map-compositing-and-measurement.md](designs/map-compositing-and-measurement.md)

**Gated on playable:** Do not migrate `TileView` to holodeck or build WebGPU cursor plugins
until [Playable Micropolis game](#playable-micropolis-game) Phases **A–C** ship (HUD, tools,
click-to-build, classic feedback). Existing **WebGL** map stays the rasterizer for the vertical
slice. Holodeck work unlocks vitamoo convergence, measure readback from GPU, and MOP overlays —
but is not on the critical path to “playable.”

### R1. After playable A–C — holodeck map migration

- `MicropolisMapPlugin` — absorb `WebGPUTileRenderer`; wire `TileView` → `HolodeckStage`.
- Keep `renderMicropolisMapSoftware` aligned (server `/render`, CI fixtures).
- Enable `CursorLayer` **`webgpu`** backend + `EditingToolCursorPlugin` (parallel to DOM; user/config toggles `dom` | `webgpu` | `both`).
- Generalized MOP overlay schema + software pass + WebGPU tint pass.
- **Tileset packs** — virtualized tile atlases via MOP; per-set sprite sheets; plugin override/add/replace ([map-compositing §2.5](designs/map-compositing-and-measurement.md#25-tileset-packs-mop-mixing-and-per-set-sprites)). ~~Ancient Asia atlas fix~~ ✅ ([#9](https://github.com/SimHacker/MicropolisCore/issues/9)). Per-set sprite PNGs preserved colocated with renderer atlases (`<set>-sprite-<name>.png` in `apps/micropolis/src/lib/images/tilesets/`); mono/snow sprites still TBD (Mac resource extraction).
- **Software sprite compositor (required)** — [#4](https://github.com/SimHacker/MicropolisCore/issues/4): **in progress** — DOM `SoftwareSpriteLayer` + JSON manifests ([SPRITE-OVERLAY-ATLAS](designs/playable-pie-publishing-cauldron/SPRITE-OVERLAY-ATLAS.md)); Node print + WebGPU holodeck parity deferred (SB-05/SB-06).
- ~~WebGL tile edge duplication~~ — [#5](https://github.com/SimHacker/MicropolisCore/issues/5) closed; not reproduced on default WebGPU → canvas chain (legacy WebGL only).
- Legacy WebGL **off default chain** (frozen); whiteboard / vote preview / §3.5 on software + WebGPU only.

### R2. Design north star (not yet)

Multi-player collaborative tools + tool-as-vehicle + Factorio-like parameterized templates
via measure protocol — [map-compositing-and-measurement.md §3.5](designs/map-compositing-and-measurement.md#35-future-goals-design-for-do-not-implement-yet).

---

## VitaMoo — Holodeck

**Details:** [documentation/designs/unified-webgpu-renderer.md](designs/unified-webgpu-renderer.md),
[documentation/vitamoo/webgpu-renderer-design.md](vitamoo/webgpu-renderer-design.md) §4,
[documentation/vitamoo/webgpu-renderer-status.md](vitamoo/webgpu-renderer-status.md)

### 7. Holodeck plugins + unified compositor (not started)

The character WebGPU path is complete. **HolodeckStage** (display-list executor), environment
(terrain, floor, walls, roofs), Micropolis map layer, sprites, pie menu (feathered desaturated
shadow + center head), and floor-grid feedback are specified in the unified WebGPU doc — **not started**.

### 7b. Globe city navigation (ambitious — not started)

**Details:** [documentation/designs/globe-city-navigation.md](designs/globe-city-navigation.md)

Icosphere display of the tile map: **rotate** POI to face camera (no scroll), **fish-eye magnify**
around screen center, compress toward antipode; slerp animation; inverse pick for tools. Phases G0–G5.

This is the main greenfield work for the VitaMoo renderer.

---

## VitaMoo — WebGPU renderer polish

**Details:** [documentation/vitamoo/webgpu-renderer-status.md](vitamoo/webgpu-renderer-status.md)

### 8. GPU pass timing / observability

Add lightweight GPU timestamp instrumentation for the animation/deform/world passes
so the debug UI can report per-pass timing.

### 9. Richer validation UX

Structured per-body/mesh validation records are produced but only high-level summaries
show in the debug panel. Surface bucket-level diagnostics.

### 10. Automated end-to-end GPU parity suite

Deterministic CPU parity fixtures exist (`pnpm --filter vitamoo run verify:exchange`).
No automated *browser* GPU end-to-end parity test suite yet. Add a Playwright or
similar headless WebGPU test.

### 11. Bone-level pick ID output (sub-mesh picking)

Design §2.3. Object-ID MRT is implemented at body/mesh granularity; per-bone IDs
would enable finer selection.

---

## VitaMoo — UI overlays

**Details:** [documentation/vitamoo/ui-overlay-encyclopedia.md](vitamoo/ui-overlay-encyclopedia.md),
[documentation/vitamoo/webgpu-renderer-status.md](vitamoo/webgpu-renderer-status.md) § Out of scope

### 12. Pie-menu head rendering

Pie-menu center head (character avatar in the center of a radial menu) is planned but
not started. See `ui-overlay-encyclopedia.md`.

### 13. Speech / thought bubbles

MMO-style text bubbles over avatars. Design in `ui-overlay-encyclopedia.md` §4.

### 14. Censorship overlay pass

VitaBoy-style censorship: bounding-box screen-space pixelization. Design sketch in
`webgpu-renderer-design.md` §3.11. `child-censor.cmx` / `*BOX` skins exist in demo
content. No GPU implementation yet.

---

## VitaMooSpace — Roots & Catalog tabs

**Details:** [documentation/vitamoo/REFACTOR-PLAN.md](vitamoo/REFACTOR-PLAN.md) § Next app milestone,
[documentation/vitamoo/OBLITERATOR-TYPESCRIPT.md](vitamoo/OBLITERATOR-TYPESCRIPT.md) Phase A1

**Status:** The Roots and Catalog tabs are **already fully built** in `apps/vitamoospace/src/lib/components/VitaMooSpace.svelte` — add/edit/remove roots, scan triggers, catalog query with kind/rootId/text filters and pagination. Server API routes exist at `api/files/{roots,scan,catalog}`.

What remains:

### 15. Smoke test Roots + Catalog against a real Sims install

Run `pnpm --filter vitamoospace dev`, point a root at a local Sims 1 install or the prototype-1998 archive (`content/vitamoo/sims-prototype-1998/`), trigger a scan, and verify the catalog populates without crashes. File issues for anything broken.

### 16. SQLite persistence for the catalog

Currently `files-inventory.ts` holds state **in-process memory** — a server restart wipes scans. Wire a SQLite backend so scan results survive restarts. Node's `better-sqlite3` or `@sqlite.org/sqlite-wasm` are the natural choices.

**Near-term details (from REFACTOR-PLAN § Next app milestone):**
- Explicit `rootType` + free-form `rootMetadata` on each root
- Robust per-file scanning (failed parses → structured issues, not crashes)
- Skip paths ending in `-disabled`

**Future passes:**
- Remote catalog roots (JSON/YAML manifests, service APIs)
- Per-root filters before catalog merge
- Pluggable root drivers (query/search/filter, incremental fetch, upload/publish)
- Install-set and save virtualization tooling

---

## Simopolis — The Uplift

**Top-level framing:** [documentation/designs/characters-as-hydrogen.md](designs/characters-as-hydrogen.md) — characters as the *hydrogen* (most-abundant, highest-valence content-atom) of the **Micropolis Federation**, with other atom types (lots, objects, behaviors, appearances, memories, stories, sounds) combining into molecules. *Federation* deliberately (Star Trek vibe), not *franchise* — cooperative association of sovereign open-source projects.
**Strategy:** [documentation/designs/simopolis.md](designs/simopolis.md) — unified Micropolis + Sims vision (introduces the two-product naming: **Micropolis City** + **Micropolis Home**)
**Substrate:** [documentation/designs/moollm-microworld-os.md](designs/moollm-microworld-os.md) — MOOLLM as the agent layer
**Recovery pipeline:** [documentation/designs/the-tornado-and-the-archives.md](designs/the-tornado-and-the-archives.md) — sweep the Internet Archive into residential zones
**Computer-as-portal:** [documentation/designs/the-computer-as-portal.md](designs/the-computer-as-portal.md) — Uplifted Computer + custom IFF content for the EA game
**Imagine Loop:** [documentation/designs/the-imagine-loop.md](designs/the-imagine-loop.md) — LLM-as-narrator alternative to reimplementing the Sims engine
**Family Album as StoryMaker:** [documentation/designs/family-album-as-storymaker.md](designs/family-album-as-storymaker.md) — branching / merging community graph of scenes; the 35-year SimCity → DreamScape → Bar Karma → MicropolisCore lineage
**Federation peer-game bridges:** [documentation/designs/federation-peer-games.md](designs/federation-peer-games.md) — catalogue of "in the spirit of Simopolis" + "wildly popular and great technical fit" bridge candidates (CK3, RimWorld, Stardew, Dwarf Fortress, VTTs, plus the anti-target list)
**Design discipline (incl. Twitch-friendly):** [documentation/designs/designing-inward-miyamoto-principles.md](designs/designing-inward-miyamoto-principles.md) — Miyamoto principles + Twitch-friendly streaming features + Wright-vs-EA designer-vs-platform separation
**Build plan:** [documentation/designs/simopolis-uplift-roadmap.md](designs/simopolis-uplift-roadmap.md) — phases 0–5 (incl. 1C / 1D / 1E / 1F), definitions of done, risk register
**Vision/story (external):** [MOOLLM: THE-UPLIFT.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/THE-UPLIFT.md)  
**Field mappings (external):** [MOOLLM: BRIDGE.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/BRIDGE.md)  
**IFF layer stack (external):** [MOOLLM: IFF-LAYERS.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/IFF-LAYERS.md)

Bringing Micropolis (the GPL city simulator descended from SimCity) and The Sims under one umbrella in MicropolisCore. Python parsing is replaced by TypeScript in `packages/sims-io`. The Python codebase (SimObliterator Suite) remains a reference implementation; this monorepo is the browser-native rewrite. The full phased plan lives in [simopolis-uplift-roadmap.md](designs/simopolis-uplift-roadmap.md); the headlines below are the immediately-actionable items.

### A. sims-io L4 — ContentIndex bridge to VitaMoo (Phase 0)

`packages/sims-io/src/l4/`: take a `NeighborhoodData` from the L3 scanner and emit a `ContentIndex` that `createMooShowStage` can load. Map each Sim's character filename (`C001FA_Mercedes`, `C001MA_Ross`, etc.) to the asset base URL path. This is the **first end-to-end path**: real Sims save → browser character viewer.

The character filenames come from `Neighbour.originalFileName` (parsed from NBRS). The asset files (CMX, SKN, BMP, CFP) need to be resolvable — either from a local install path (via `NodeResourceProvider`) or from `content/vitamoo/sims-demo/` for the demo pack.

### B. sims-io L4 — MOOLLM CHARACTER.yml emit (Phase 0)

`packages/sims-io/src/l4/moollm-character.ts`: per Sim, write a MOOLLM-shaped `CHARACTER.yml` with `sims_traits`, `relationships`, `gold`, `job`, and an *empty* `mind_mirror` placeholder. LLM enrichment of the placeholder is Phase 1. Field mapping is fully specified in the external [BRIDGE.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/BRIDGE.md).

### C. Skin/sprite export: SPR2 → PNG in TypeScript (Phase 0)

SPR2 chunks in Sims IFF files store character skin textures as 8-bit paletted bitmaps. Export to PNG so skins can be displayed, edited, and fed to image generation APIs for regenesis. The Python version exists in SimObliterator (`sprite_export.py`); port to TypeScript in `packages/sims-io`.

### D. Save-file download path (Phase 0)

Round-trip back: take a (possibly edited) `CHARACTER.yml`, write modified `sims_traits`, `gold`, and skill values into the original `Neighborhood.iff`, save as a new file the user can download. Extends the L3 setters.

### E. Minimal `apps/simopolis/` SvelteKit shell (Phase 0)

Drag-drop a `.iff`, see characters, edit fields, write a new `.iff`. The first thing a player can actually *use*.

### F. Micropolis residential zone ↔ Sims neighborhood data contract (Phase 2)

Define the JSON interface: a residential zone position maps to `content/micropolis/cities/<city>/neighborhoods/zone-<row>-<col>.yml` pointing at a parsed `Neighborhood.iff`. The Micropolis engine reads aggregate metrics (budget, population, education, satisfaction) and folds them into tile simulation. Bound neighborhoods read city signals (unemployment, pollution, disasters) back. Small interface, two-way coupling. See [roadmap Phase 2](designs/simopolis-uplift-roadmap.md#phase-2--two-resolution-coupling-micropolis-zone--sims-neighborhood-4-6-weeks).

### G. Family Album server (Phase 1)

Compatible endpoint for the Steam Sims re-release's upload feature. Receives albums, stores under `content/simopolis/albums/incoming/` with provenance, parses, makes them browsable, makes their characters uplift-able. See [roadmap Phase 1 Track B](designs/simopolis-uplift-roadmap.md#phase-1--moollm-enrichment--family-album-server-3-4-weeks).

### G2. Uplifted Computer + custom IFF content (Phase 1C — **the headline demo**)

The first player-visible content artifact: a custom IFF Computer object that "runs" Micropolis (via screen-snapshot SPR2 sprites), plus CD-ROM / Save-Game Disk / Foreign Photo Album / Screen-Snapshot Camera custom objects. Adventure Compiler authors all five from YAML. Player drops them into their `~/Documents/EA Games/The Sims/Downloads/` directory; they appear in the EA-published Sims 1 as ordinary custom content.

**Headline 2-week demo:** Sim plays Micropolis on a custom PC inside the player's EA-published Sims 1. Finishes Will Wright's 1996 Stanford demo.

Full design: [the-computer-as-portal.md](designs/the-computer-as-portal.md). Concrete tasks: [roadmap Phase 1C](designs/simopolis-uplift-roadmap.md#phase-1c--uplifted-computer--custom-iff-content-3-4-weeks-parallelizable-with-2).

Key sub-items:
- **`moollm://` URL scheme** in `packages/sims-io/src/l4/moollm-url.ts` + resolver
- **SPR2 *writer*** in `packages/sims-io/src/spr2/writer.ts` (complements Phase 0 reader)
- **Screen-snapshot renderer**: `tile-renderer` (Micropolis) and `mooshow` (Sims/lots) emit fixed-dimension PNGs that palette-quantize to SPR2
- **`tools/adventure-compiler/`** core + per-object targets (computer, cd, savegame-disk, album, camera)
- **`apps/micropolis-home/`** (a.k.a. `apps/simopolis/` during transition) authoring + preview UI for the five object types

### G3. The Imagine Loop (Phase 1D — **the second headline demo**)

The architectural alternative to reimplementing the Sims runtime. Examine a parsed save → Imagine outcomes via LLM (time skips, what-ifs, retroactive backstory, dreams, cheats with narrative) → Edit the high-level YAML representation → Inject a valid `.iff` save file the EA-published Sims 1 plays normally. The LLM is the narrator the Sims never had, **not** a re-simulator of the runtime.

**Headline 1–2-week demo:** Five years pass for the Goth household, in one LLM call, ending in a valid `.iff` the player loads into their EA Sims 1 and a pageable album book on the shelf summarizing the five years in 20 languages.

Full design: [the-imagine-loop.md](designs/the-imagine-loop.md). Concrete tasks: [roadmap Phase 1D](designs/simopolis-uplift-roadmap.md#phase-1d--the-imagine-loop-4-6-weeks-parallelizable-with-1b--1c--2).

Key sub-items:
- `packages/sims-io/src/l5/` — `examine.ts`, `intent.ts`, `imagine-apply.ts`, `validate.ts`, `compile.ts`, `loop.ts` (valid-or-revise)
- MOOLLM `skills/imagine-loop/` — prompt structure, Speed-of-Light layout, output JSON schema
- Family Album page renderer in `packages/mooshow/src/album-render.ts` — WebGPU + image-gen paths, both palette-quantize to SPR2
- `apps/micropolis-home/src/routes/imagine/` — intent input UI, diff preview, INJECT confirm
- Intent presets: time-skip, what-if branch, retroactive backstory, dream sequence, cheat-with-narrative

### G4. Family Album as StoryMaker (Phase 1E)

Sims Family Albums become a **branching, merging, geo-tagged graph of scenes** — "snippets of DNA" weavable between authors' stories — in the 35-year SimCity → DreamScape → The Sims → Bar Karma / StoryMaker / Urban Safari lineage finally reaching its natural shape. Five navigation views (Map / Road / Pie-menu / Album / Branching-Story). Federated by git; round-trips to documented Sims 1 album book IFFs.

**Headline 1–2-week demo:** One user with a small album graph, shares one storyline with one friend via a git remote, both compile to a pageable album book IFF and load it into their EA Sims 1. The smallest visible demo of the StoryMaker reborn.

Full design: [family-album-as-storymaker.md](designs/family-album-as-storymaker.md). Concrete tasks: [roadmap Phase 1E](designs/simopolis-uplift-roadmap.md#phase-1e--family-album-as-storymaker-4-6-weeks-parallelizable-with-1b--1c--1d).

Key sub-items:
- `packages/family-album/` — schemas, graph builder, local-FS + git-remote federation, CA biome layer
- `apps/micropolis-home/src/routes/album/` — five-view UI (Map / Road / Pie-menu / Album / Branching-Story)
- `packages/sims-io/src/l4/album-book-compile.ts` — storyline → pageable album-book IFF
- `packages/sims-io/src/l4/bifrost-merge.ts` — character-snippet DNA operations
- Imagine-Loop integration: imagine call emits a multi-scene storyline; existing storyline can be passed as context

### G5. Twitch-friendly streaming features (Phase 1F)

"Watching the player IS the game" at Twitch scale. Thirteen concrete streaming-integration features (chat-as-writers'-room, OBS overlay browser sources, bit-cheers as in-narrative events, channel-points redemptions, sub-named Sims, VOD chapter markers, save-file giveaway with provenance, streamer trust controls, multi-streamer crossover, official Twitch Extension, "Twitch Plays Micropolis Home" mode, plus a vision-LLM **Simplifier** screen-scraping agent that reads catalog item descriptions aloud and cross-references online Sims content libraries — useful for streamers narrating builds and for accessibility users). The strategic argument: Sims content streaming is one of the largest non-shooter categories on Twitch; this is the highest-leverage popularity move available to the project.

**Headline 1-week demo:** A Sims streamer drops Micropolis Home overlay URLs into OBS, streams with VOD chapter markers, gives viewers the save file at stream end with full stream-derived provenance trail.

Full design: [designing-inward-miyamoto-principles.md → §8a The Twitch corollary](designs/designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful). Concrete tasks: [roadmap Phase 1F](designs/simopolis-uplift-roadmap.md#phase-1f--twitch-friendly-streaming-features-3-5-weeks-parallelizable-with-1b--1c--1d--1e).

Key sub-items:
- `packages/twitch-bridge/` — IRC integration, EventSub wiring, VOD chapter emission
- `apps/micropolis-home/src/routes/overlays/` — drop-in OBS browser sources
- `apps/micropolis-home/src/routes/twitch/writers-room/` — chat-as-writers'-room voting + Imagine Loop wiring
- `apps/twitch-extension/` — official Twitch Extension Studio submission
- Streamer trust controls, multi-streamer crossover, save-file giveaway with provenance

### H. Archive tornado: first source (Phase 3)

`tools/tornado/`: pull from the Wayback CDX API against archived Sims Exchange snapshots and the [Sim Archive Project](https://archive.org/details/sim-archive-project) IA collection (`content/simopolis/archives/SOURCES.yml`), parse, curate, bind to lots. Provenance is mandatory. Takedown tooling required. See [the-tornado-and-the-archives.md](designs/the-tornado-and-the-archives.md).

---

## Sims I/O TypeScript package

**Details:** [documentation/vitamoo/OBLITERATOR-TYPESCRIPT.md](vitamoo/OBLITERATOR-TYPESCRIPT.md)

### 17a. `parseMSH` in vitamoo

**Context:** 323 binary `.msh` files exist in `content/vitamoo/sims-prototype-1998/`. Magic `0xb0b0b0b2`. Format reverse-engineered (see README.md in that directory): uses a **DDD (Direct3D Drawing Device) chunked vertex stream layout** (`[count][stride][data]` headers), NOT the simple CTGFile sequential layout used by `parseBMF`. Positions, normals, UVs, faces, and bone bindings are separate streams. CTGLib length-prefixed strings appear at the end for names.

This is a larger project than initially scoped — the DDD vertex format requires additional work beyond mirroring `parseBMF`. Medium priority, good project for understanding the prototype pipeline.

**File:** `packages/vitamoo/vitamoo/parser.ts`, `packages/vitamoo/vitamoo/vitamoo.ts` (export)

### 17b. ✅ `packages/sims-io` L0–L3 — scaffold complete (2026-05-06)

Implemented and tested:
- **L0**: `NodeResourceProvider`, `MemoryResourceProvider` — filesystem + in-memory I/O
- **L1**: `VirtualTree` — merges loose files + FAR archives into one namespace
- **L2**: re-exported from vitamoo (`parseFar`, `listIffChunks`, etc.)
- **L3 parsers**: `parseFami`, `parseNbrs`, `resolveFamilies`, `PersonData` constants (80 base-game fields + reserved 74–79 + EP 80–87)
- **L3 scanner**: `scanForNeighborhoods`, `readNeighborhoodFile`, `readNeighborhoodFromTree`

48 tests, all passing. Source-verified against Sims 1 C++ source (12/17/99).

**Next:** L4 — emit `ContentIndex` from parsed neighbourhood roster so VitaMooSpace can load real Sims into the character viewer without a Python dependency.

### 17c. New `packages/sims-io/` — L4 VitaMoo bridge

Pure TypeScript IFF/FAR/save-data reader with no server dependency. Enables loading
Sims 1 neighborhood data (families, lots, objects) directly in the browser or Node.

**Layers:**
- **L0:** Resource I/O adapter (directory handle / Node fs / in-memory / ZIP)
- **L1:** Virtual tree — merge loose files, FAR entries, future DBPF
- **L2:** Binary formats — IFF container, FAR index, chunk payload views
- **L3:** Save / content domain — neighborhood graph, FAMI/NBRS, User IFF, appearance, GUID maps
- **L4:** VitaMoo bridge — emit `ContentIndex` / character entries for `createMooShowStage`

**First win:** load every Sim from a neighborhood into VitaMoo for animation and outfit play.

Register as workspace package in `pnpm-workspace.yaml` (already `packages/*`).

---

## Sims GUID collision tooling

**Details:** [documentation/vitamoo/guid-collision-analysis-plan.md](vitamoo/guid-collision-analysis-plan.md)

### 18. Wire collision scanner into VitaMooSpace UI

Core analysis utilities exist in `packages/vitamoo/vitamoo/io/guid-collision.ts`.
The VitaMooSpace Catalog tab should expose GUID collision warnings when scanning
object roots.

**Disposition pipeline (not yet built):**
After analysis-only warning emission, add a separate tool-driven resolution phase:
re-GUID, merge, disable-package, or defer-and-inspect.

---

## VitaMoo — GPU assets & interchange

**Details:** [documentation/vitamoo/gpu-assets-tooling-roadmap.md](vitamoo/gpu-assets-tooling-roadmap.md),
[documentation/vitamoo/gltf-extras-metadata.md](vitamoo/gltf-extras-metadata.md)

### 19. Buffer readback → BMP / IFF sprite export

Color+alpha and depth readback patterns are designed (`readbackTap`, `getTapBuffer`).
Extend to authoring: read rendered frame → encode BMP (already native in vitamoo)
or depth-buffered sprite sheet → IFF packaging for catalog upload.

### 20. glTF import (full pipeline)

`packages/vitamoo/vitamoo/loaders/gltf.ts` exists for static meshes. Extend to:
- Import skeletons and animation clips from glTF
- Map to vitamoo bone/skill types
- Round-trip safe through Blender (glTF `extras` metadata convention documented in
  `gltf-extras-metadata.md`)

### 21. Streamable long animation from short clips

Design in `gpu-assets-tooling-roadmap.md`. Compose walk/reach/idle clips with blends
at boundaries; optionally record the composed timeline.

---

## Package naming / scoping

**Details:** [documentation/designs/vitamoo-monorepo-refactor-plan.md](designs/vitamoo-monorepo-refactor-plan.md) § Follow-ups

### 22. Scope vitamoo and mooshow package names (deferred)

Currently `"name": "vitamoo"` and `"name": "mooshow"` (unscoped). For parity with
`@micropolis/engine-wasm` and `@micropolis/tile-renderer`, consider scoping to
e.g. `@vitamoo/core` / `@vitamoo/runtime`. Deferred because it ripples through all
imports. Do in one coordinated PR.

---

## MicropolisHub / MOOLLM integration

**Details:** [documentation/designs/moollm-micropolis-integration.md](designs/moollm-micropolis-integration.md),
[documentation/designs/command-path-collaboration-modes.md](designs/command-path-collaboration-modes.md),
[documentation/designs/filesystem-object-model.md](designs/filesystem-object-model.md)

### 23. MCP service layer

Expose MicropolisCore capabilities (city inspection, simulation control, tile editing,
command bus) as an MCP server so MOOLLM skills and Cursor can invoke them without
shell scripting.

### 24. Command bus persistence and replay

`command-path-collaboration-modes.md` describes the full lifecycle:
`CommandBus → command record → object directory → branch commit → replay`.
Currently only the in-session bus works; durable records and Git-commit integration
are not implemented.

### 25. LLM proposal / approve / reject workflow

Allow an LLM (via MCP or skills) to **propose** a city action, a human to **approve**
or **reject** it, and the bus to execute only approved proposals. Partial command-bus
recording infrastructure exists.

---

## Multiplayer / Git-as-multiverse

**Details:** [documentation/designs/command-timeline-git-branches.md](designs/command-timeline-git-branches.md),
[documentation/designs/github-as-mmorpg-multiverse.md](designs/github-as-mmorpg-multiverse.md),
[documentation/designs/multiplayer-browser-lessons.md](designs/multiplayer-browser-lessons.md)

### 26. Branch-as-object-store convention

Each Micropolis city / universe / class is a Git branch with a typed root object
(`MICROPOLIS.yml`, `CITY.yml`). Implement the branch-naming convention, object-tree
layout, and manifest tooling so cities are commitable artifacts.

### 27. Persistent command leaves / coalesced commits

TiVo-replay model: commands accumulate as leaves; periodic coalesce merges them into
branch commits for history and sharing.

### 28. Multiplayer session / shared world

Multiple users operating in the same simulated city. Depends on command bus persistence
and CRDT or turn-based arbitration. Long-horizon.

---

---

## Code quality

**Recent audit findings — not yet addressed:**

### TypeScript strictness flags (nice to have)

None of the `tsconfig.json` files enable:
- **`noUncheckedIndexedAccess`** — catches `arr[i]` returning `T | undefined`
- **`exactOptionalPropertyTypes`** — distinguishes `{ x?: string }` from `{ x: string | undefined }`

These can be added incrementally: enable for one package at a time (e.g. `packages/vitamoo` first), fix resulting errors, then propagate.

### Shared `tsconfig.base.json` — scaffolded 2026-05-06

`tsconfig.base.json` exists at repo root with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`. Packages adopt it when they have capacity.

**Attempt history:** enabling `noUncheckedIndexedAccess` on `packages/vitamoo` alone surfaced **~276 type errors** — mostly array index accesses and optional-field patterns throughout the animation/parser code. It's the right target state but needs a dedicated pass, not a side-effect of other work.

**Recommended adoption order:**
1. `packages/tile-renderer` — smallest, fewest errors expected
2. `packages/mooshow` — once mooshow test suite is green with strict (it has tests now)
3. `packages/vitamoo` — largest payoff, largest effort (~276 errors to fix)
4. Svelte apps — inherit from generated SvelteKit tsconfig, handle separately

### Deprecated sub-dependencies — ✅ resolved (2026-05-06)

Removed `rollup-plugin-node-builtins`, `rollup-plugin-node-globals`, `@esbuild-plugins/node-globals-polyfill`, `@esbuild-plugins/node-modules-polyfill`, `svelte-gestures`, `vite-plugin-node-polyfills`, `vite-plugin-wasm` — all were in `package.json` but **not imported anywhere** (−170 packages). The remaining deprecated transitive warnings (`abstract-leveldown`, `level-js`, `levelup`, `object-keys`, `rollup-plugin-inject`, `sourcemap-codec`, `whatwg-encoding`) come from `vite-plugin-top-level-await` (still used in `vite.config.ts` for WASM top-level-await). Once `vite-plugin-top-level-await` updates its internals those will resolve on their own.

---

## Historical / legacy docs (for reference only)

These live under `documentation/` and are **frozen** — kept for lineage, not to be acted on:

| Path | Content |
|------|---------|
| `documentation/notes/legacy/TODO.txt` | OLPC-era TODO list |
| `documentation/notes/legacy/ROADMAP.txt` | Python/GTK-era roadmap |
| `documentation/notes/legacy/DevelopmentPlan.md` | TileEngine / CellEngine era plan |
| `documentation/openlaszlo/TODO.txt` | OpenLaszlo / Flash client scratchpad |

See [documentation/notes/legacy/README.md](notes/legacy/README.md) for the legacy index.

---

## Reading order for a new contributor

1. Root `README.md` — architecture and quick-start.
2. `documentation/designs/platform-lineage-index.md` — how the platform evolved.
3. This file (`documentation/TODO.md`) — what needs doing.
4. Pick a section above; follow the pointer to the authoritative doc.
