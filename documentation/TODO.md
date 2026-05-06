# MicropolisCore — What To Do Next

Top-level entry point. Each section names the next engineering work, its urgency, and
a pointer to the authoritative document or file where the details live.

Start here when deciding what to pick up. Do not duplicate prose here—maintain it in
the linked documents.

---

## Quick index by area

| Area | Next concrete action | Priority |
|------|----------------------|----------|
| [CI / build integrity](#ci--build-integrity) | ~~Fix `emscripten_build.yml` Jekyll step~~ ✅ | ~~High~~ |
| [CI / build integrity](#ci--build-integrity) | ~~Wire `verify:structure` into CI~~ ✅ | ~~High~~ |
| [CI / build integrity](#ci--build-integrity) | ~~Add PR workflow (structure + build-ts + svelte-check + Vitest)~~ ✅ | ~~High~~ |
| [Code quality](#code-quality) | `noUncheckedIndexedAccess` in tsconfig files | Low |
| [Code quality](#code-quality) | `exactOptionalPropertyTypes` in tsconfig files | Low |
| [Code quality](#code-quality) | Shared root `tsconfig.base.json` for consistent strictness | Low |
| [Micropolis WASM testing](#micropolis-wasm-testing) | Expand bridge test coverage | Medium |
| [Micropolis WASM testing](#micropolis-wasm-testing) | ~~Add CI for Vitest~~ ✅ | ~~High~~ |
| [Micropolis callbacks](#micropolis-callbacks--events) | Normalized event envelopes | Medium |
| [Micropolis renderer](#micropolis-renderer) | Renderer plugin selection (Canvas/WebGL/WebGPU) in app | Medium |
| [VitaMoo — Holodeck](#vitamoo--holodeck) | Terrain/floor/wall/roof pipeline | Medium |
| [VitaMoo — renderer polish](#vitamoo--webgpu-renderer-polish) | GPU pass timing, richer validation UX | Medium |
| [VitaMoo — UI overlays](#vitamoo--ui-overlays) | Pie-menu head, speech bubbles, censorship pass | Low–Medium |
| [VitaMooSpace — Roots & Catalog tabs](#vitamoospace--roots--catalog-tabs) | Roots + Catalog tab scaffold | High |
| [Sims I/O in TypeScript](#sims-io-typescript-package) | New `packages/sims-io/` L0–L4 stack | Medium |
| [GUID collision tooling](#sims-guid-collision-tooling) | Wire collision scanner into VitaMooSpace UI | Medium |
| [GPU asset tooling](#vitamoo--gpu-assets--interchange) | Readback → BMP/IFF export; glTF import/export | Medium |
| [Package scoping](#package-naming--scoping) | Scope vitamoo/mooshow names (`@vitamoo/…`) | Low |
| [MicropolisHub / MOOLLM](#micropolishub--moollm-integration) | MCP service, command bus, LLM proposals | Long-horizon |
| [Multiplayer / Git-as-multiverse](#multiplayer--git-as-multiverse) | Command timeline, branch objects | Long-horizon |

---

## CI / build integrity

**Details:** `documentation/designs/` → see audit report from 2026-05-06; pre-existing CI bug.

### 1. Fix `emscripten_build.yml` Jekyll step ⚠️

The `.github/workflows/emscripten_build.yml` workflow (manual-only, `workflow_dispatch`)
references a `docs/` directory and `documentation/notes/SimCityReverseDiagrams-*.png/pdf`
that do not exist at the repo root:

- The Jekyll site lives at **`apps/micropolis/website/`** (built via `apps/micropolis/package.json`
  **`build:jekyll`**), not a top-level `docs/`.
- The PNG/PDF assets were never committed (or have moved).

The workflow is manual-only so it has not broken automation, but it would fail if run.

**Fix needed:**
- Point the Jekyll step at `apps/micropolis/website/` (or remove it if the Pages deploy
  is already handled by GitHub's standard Pages flow from the SvelteKit output).
- Either commit the diagram assets, remove those `cp` lines, or adjust paths.

**File:** `.github/workflows/emscripten_build.yml`

---

### 2. ✅ Wire `verify:structure` into CI — done

`pnpm run verify:structure` (20 assertions) now runs in both `emscripten_build.yml`
(after WASM build) and `vitamoo-pages.yml` (after `pnpm install`).

### 3. Add a lightweight PR workflow (no Emscripten needed)

The Vitest tests and `verify:structure` both work against the **committed WASM artifacts**
in `apps/micropolis/src/lib/` — Emscripten is not required to run them. Add a workflow
triggered on push/PR that runs just:

```yaml
pnpm install --frozen-lockfile
pnpm run verify:structure
pnpm --filter vitamoo run build
pnpm --filter mooshow run build
pnpm --filter micropolis run test
```

This keeps CI fast on every PR without a full 15-minute Emscripten compile.

**File:** `.github/workflows/pr-checks.yml` (new)

---

## Micropolis WASM testing

**Details:** [`documentation/designs/wasm-bridge-and-testing-trajectory.md`](designs/wasm-bridge-and-testing-trajectory.md)

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

**Details:** [`documentation/designs/callback-interface-roadmap.md`](designs/callback-interface-roadmap.md)

### 5. Normalized event envelopes (`MicropolisEvent`)

Move toward a shared `MicropolisEvent` envelope so `micropolisReactive`, command recorders,
MCP tools, and LLM observers share one vocabulary. Currently the bridge uses the Embind
callback method names directly.

See naming conventions: [`documentation/designs/naming-conventions.md`](designs/naming-conventions.md)

---

## Micropolis renderer

**Details:** [`documentation/designs/renderer-plugin-roadmap.md`](designs/renderer-plugin-roadmap.md)

### 6. Renderer plugin selection in app UI

`CanvasTileRenderer`, `WebGLTileRenderer`, and `WebGPUTileRenderer` exist in
`packages/tile-renderer/`. The app-level selection polish (runtime switching, fallback
path) is incomplete.

- `CanvasTileRenderer` still delegates to software renderer and needs broader app wiring.
- `WebGPUTileRenderer` is the target high-performance path; needs integration alongside
  the Sims VitaMoo WebGPU work.

---

## VitaMoo — Holodeck

**Details:** [`documentation/vitamoo/webgpu-renderer-design.md`](vitamoo/webgpu-renderer-design.md) §4,
[`documentation/vitamoo/webgpu-renderer-status.md`](vitamoo/webgpu-renderer-status.md)

### 7. Terrain / floor / wall / roof pipeline (not started)

The character WebGPU path is complete. The Holodeck (§4 in the renderer design) — environment
geometry: backgrounds, wall planes, roof geometry, floor tiles — is **not started**.

This is the main greenfield work for the VitaMoo renderer.

---

## VitaMoo — WebGPU renderer polish

**Details:** [`documentation/vitamoo/webgpu-renderer-status.md`](vitamoo/webgpu-renderer-status.md)

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

**Details:** [`documentation/vitamoo/ui-overlay-encyclopedia.md`](vitamoo/ui-overlay-encyclopedia.md),
[`documentation/vitamoo/webgpu-renderer-status.md`](vitamoo/webgpu-renderer-status.md) § Out of scope

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

**Details:** [`documentation/vitamoo/REFACTOR-PLAN.md`](vitamoo/REFACTOR-PLAN.md) § Next app milestone,
[`documentation/vitamoo/OBLITERATOR-TYPESCRIPT.md`](vitamoo/OBLITERATOR-TYPESCRIPT.md) Phase A1

The next concrete app milestone. The VitaMooSpace app already has server-side file scanning
infrastructure (`apps/vitamoospace/src/lib/server/files-inventory.ts`).

### 15. Roots tab

Root management UI: add/remove/enable/disable scan roots (local Sims install paths,
saves, object folders), trigger scans, view run summaries.

### 16. Catalog tab

Query discovered files/objects/chunks from a normalized inventory. Backed by Node-side
scan APIs and SQLite.

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

## Sims I/O TypeScript package

**Details:** [`documentation/vitamoo/OBLITERATOR-TYPESCRIPT.md`](vitamoo/OBLITERATOR-TYPESCRIPT.md)

### 17. New `packages/sims-io/` — L0–L4 layered I/O stack

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

**Details:** [`documentation/vitamoo/guid-collision-analysis-plan.md`](vitamoo/guid-collision-analysis-plan.md)

### 18. Wire collision scanner into VitaMooSpace UI

Core analysis utilities exist in `packages/vitamoo/vitamoo/io/guid-collision.ts`.
The VitaMooSpace Catalog tab should expose GUID collision warnings when scanning
object roots.

**Disposition pipeline (not yet built):**
After analysis-only warning emission, add a separate tool-driven resolution phase:
re-GUID, merge, disable-package, or defer-and-inspect.

---

## VitaMoo — GPU assets & interchange

**Details:** [`documentation/vitamoo/gpu-assets-tooling-roadmap.md`](vitamoo/gpu-assets-tooling-roadmap.md),
[`documentation/vitamoo/gltf-extras-metadata.md`](vitamoo/gltf-extras-metadata.md)

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

**Details:** [`documentation/designs/vitamoo-monorepo-refactor-plan.md`](designs/vitamoo-monorepo-refactor-plan.md) § Follow-ups

### 22. Scope vitamoo and mooshow package names (deferred)

Currently `"name": "vitamoo"` and `"name": "mooshow"` (unscoped). For parity with
`@micropolis/engine-wasm` and `@micropolis/tile-renderer`, consider scoping to
e.g. `@vitamoo/core` / `@vitamoo/runtime`. Deferred because it ripples through all
imports. Do in one coordinated PR.

---

## MicropolisHub / MOOLLM integration

**Details:** [`documentation/designs/moollm-micropolis-integration.md`](designs/moollm-micropolis-integration.md),
[`documentation/designs/command-path-collaboration-modes.md`](designs/command-path-collaboration-modes.md),
[`documentation/designs/filesystem-object-model.md`](designs/filesystem-object-model.md)

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

**Details:** [`documentation/designs/command-timeline-git-branches.md`](designs/command-timeline-git-branches.md),
[`documentation/designs/github-as-mmorpg-multiverse.md`](designs/github-as-mmorpg-multiverse.md),
[`documentation/designs/multiplayer-browser-lessons.md`](designs/multiplayer-browser-lessons.md)

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

See [`documentation/notes/legacy/README.md`](notes/legacy/README.md) for the legacy index.

---

## Reading order for a new contributor

1. Root `README.md` — architecture and quick-start.
2. `documentation/designs/platform-lineage-index.md` — how the platform evolved.
3. This file (`documentation/TODO.md`) — what needs doing.
4. Pick a section above; follow the pointer to the authoritative doc.
