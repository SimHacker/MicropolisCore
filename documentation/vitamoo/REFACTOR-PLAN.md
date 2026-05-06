# VitaMoo Refactor Plan

**Layer refactor (phases 0–5 below): complete.** The split into vitamoo / mooshow / vitamoospace is shipped; GitHub Pages builds the SvelteKit app. What is left is **feature roadmap** (Holodeck, renderer polish, tooling)—not unfinished refactor phases. For the live GPU/CPU pipeline and next engineering steps, use **[webgpu-renderer-status.md](./webgpu-renderer-status.md)**.

## Refactor status

| Phase | Status | Notes |
|-------|--------|--------|
| **0** Setup and baseline | Done | mooshow + vitamoospace exist; pnpm filters in use. |
| **1** Extract runtime state | Done | Stage has bodies, selectedActor, setScene, setCharacterSolo, ContentLoader, animation loop. |
| **2** Rendering and hooks | Done | Hooks (onPick, onHover, onSelectionChange, onHighlight, onPlumbBobChange, onOrbitViewChange, etc.), picking, SpinController, SoundEngine. |
| **3** VitaMooSpace.svelte | Done | Single full-page component, scene/actor/character/animation controls, loads `/data/content-exchange.json` (optionally via `assetIndexRef`), api/health placeholder. |
| **4** GitHub Pages | Done | **`.github/workflows/vitamoo-pages.yml`** builds vitamoo → mooshow → vitamoospace and deploys **`apps/vitamoospace/build`**. Deploy runs only when **`VITAMOOSPACE_PAGES_URL`** is set (variable or secret) on that repository. |
| **5** Cleanup and parity | Done | Legacy standalone `demo/` removed. Verbose logging gated (`Renderer.create` / `StageConfig.verbose` / `?vitamooVerbose=1`). **`apps/vitamoospace/.gitignore`** ignores `.svelte-kit` and `node_modules`. Monorepo paths: **`packages/vitamoo`**, **`packages/mooshow`**, **`apps/vitamoospace`**, demo content **`content/vitamoo/sims-demo/`**. |

Definition of Done: items 1–5 are met for shipping layers (core, mooshow, vitamoospace, Pages, quiet default console).

**Beyond Phase 5 (not refactor backlog):** **Holodeck** (design §4 in [`webgpu-renderer-design.md`](./webgpu-renderer-design.md))—terrain/floor/wall/roof pipeline—is still **not started**. **Design §5** (GPU animation, deformation, world transform, batched compute, validation taps) is **largely implemented** in code; remaining gaps are observability, UX, and automated GPU end-to-end parity—see [`webgpu-renderer-status.md`](./webgpu-renderer-status.md). **Design §5.0** remains the contract reference for CPU/GPU deformation regressions. Further-out: RGB+alpha+z layered sprites for object tooling, save viewing/editing.

### Next app milestone: `Roots` + `Catalog` tabs

The next vitamoospace milestone is a filesystem/object inventory workflow:

1. Add `Roots` tab for root management (multiple installs/saves/object folders), scan controls, and run summaries.
2. Add `Catalog` tab for querying discovered files/objects/chunks from a normalized inventory.
3. Model each root with explicit `rootType` plus free-form `rootMetadata` (metadata hidden in UI for now).
4. Back these tabs with Node-side scan APIs and SQLite storage.
5. Keep scan robust and non-fatal per file; failed parses become structured issues, not app crashes.
6. Respect disabled suffix rules during intake: skip any path ending in `-disabled` (for example `foo.iff-disabled`).
7. Future pass: add remote catalog roots that can point at online JSON/YAML manifests or service APIs, with root metadata fields (for example `siteUrl`, `serviceUrl`, `username`, `password`) and incremental/searchable catalog sync.
8. Future pass: apply per-root filters before catalog merge so remote roots can stream or chunk metadata and cache progressively instead of pulling everything.
9. Future pass: add pluggable root drivers (first-party service first) for incremental query/search/filter, metadata fetch, object download, and upload/publish.
10. Future pass: treat roots as inputs and outputs with explicit privacy/write controls (private backup vs shared collections, remote publish, local export/write).
11. Future pass: add install-set and save virtualization tooling to switch object sets safely (inactive staging, stop/switch/start orchestration) and manage virtualized save sets.

See the coding-order details in [`OBLITERATOR-TYPESCRIPT.md`](./OBLITERATOR-TYPESCRIPT.md) Phase A1.

---

## Goal

The former monolithic viewer was split into three clear layers:

1. **`packages/vitamoo/vitamoo/`** — low-level animation/data core (no UI, no scene editor logic)
2. **`packages/mooshow/`** — graphics/runtime layer (WebGPU renderer via vitamoo `Renderer`, picking via object IDs, hooks, plumb bob, camera, input adapters)
3. **`apps/vitamoospace/`** — SvelteKit app (single full-page UI, menus/scenes from JSON, mouse interactions, demo orchestration)

Those layers now live at **MicropolisCore** repo paths above (`pnpm-workspace.yaml`: **`apps/*`**, **`packages/*`**).

## Current State

- Core library files live in **`packages/vitamoo/vitamoo/*.ts`** (package **`vitamoo`**).
- The browser app is **vitamoospace** (SvelteKit + mooshow + vitamoo `Renderer`). Demo scene JSON and assets live under **`content/vitamoo/sims-demo/`**; **`apps/vitamoospace/static/data`** symlinks there so URLs stay under **`/data/`**.

## Historical note (pre–monorepo extract)

Earlier iterations kept **mooshow** and **vitamoospace** nested under a single **`vitamoo/`** directory. That layout is **retired**; authoritative paths are **`packages/vitamoo`**, **`packages/mooshow`**, and **`apps/vitamoospace`**.

## Architectural Boundaries

### `vitamoo` (core)

- Responsibilities:
  - parse/write CMX/SKN/BCF/BMF/CFP
  - skeleton transforms and mesh deformation
  - animation timing primitives
- Must not depend on:
  - DOM APIs
  - canvas rendering
  - app menus/UI state
- Public API stays stable and importable by both `mooshow` and tooling.

### `mooshow` (graphics/runtime)

- Responsibilities:
  - WebGPU draw orchestration on a canvas (vitamoo `Renderer`)
  - character instances and scene graph runtime
  - camera controls and viewport resize handling
  - picking/highlighting/plumb bob extension hooks
  - adapter methods for pointer/drag/spin inputs
- Must not own app menus or route-level state.
- Exposes an API that Svelte components can control.

Suggested API shape:

- `createMooShowStage({ canvas, hooks, assetsBaseUrl })`
- `stage.loadContentIndex(contentJson)`
- `stage.setScene(sceneName)`
- `stage.setActor(actorId)`
- `stage.setAnimation(animationName)`
- `stage.start()` / `stage.stop()` / `stage.destroy()`
- `stage.pick(x, y)`
- `stage.spinSelectedActor(delta)`

### `vitamoospace` (SvelteKit app)

- Responsibilities:
  - app shell and full-page layout
  - menu controls (scene/actor/animation/toggles)
  - JSON config loading and app-level state
  - create/destroy `mooshow` stage
  - connect UI actions to stage methods
- No backend behavior yet beyond a server placeholder endpoint.

## SvelteKit App Requirements

1. SvelteKit latest with Svelte 5 runes mode.
2. Single page that fills viewport with one component:
   - `VitaMooSpace.svelte`
3. Simple CSS:
   - root layout full width/height
   - canvas fills main region
   - menu overlay/panel for scene and actor controls
4. Server placeholder:
   - `src/routes/api/health/+server.ts` returns static JSON
   - no persistence, no game logic on server

## Data and Configuration Strategy

- Treat **`content/vitamoo/sims-demo/content-exchange.json`** as the shipped runtime content index, with optional `assetIndexRef` to `content-assets.json`.
- Runtime-consumed assets stay under **`content/vitamoo/sims-demo/`** (exposed to the app via **`apps/vitamoospace/static/data`**).
- Add optional app-facing scene config:
  - `apps/vitamoospace/src/lib/config/scenes.json` (or TS module after schema validation)
- Rule:
  - graphics/runtime reads normalized data handed by app
  - app owns menu labels, scene presets, and UX defaults

## Migration Plan (Phased)

## Phase 0 - Setup and Baseline

1. Create `mooshow` package skeleton with TypeScript build.
2. Create `vitamoospace` SvelteKit app scaffold.
3. Legacy `demo/` folder removed from the tree (recoverable from git history).
4. Add scripts at **`packages/vitamoo/`** root:
   - build all local packages/apps
   - run vitamoospace dev server

Acceptance:

- `vitamoo` builds as before.
- `mooshow` compiles with empty runtime stubs.
- `vitamoospace` starts and shows a placeholder full-page shell.

## Phase 1 - Extract Runtime State from `viewer.js`

1. Extract non-UI state engine into `mooshow`:
   - bodies list
   - selected actor
   - scene switching
   - animation clock
2. Extract animation loop and camera state into runtime services.
3. Keep rendering logic functionally identical.

Acceptance:

- Old and new paths produce comparable animation playback for basic scenes.

## Phase 2 - Extract Rendering and Interaction Hooks

1. Move renderer wiring into `mooshow/render`.
2. Implement hook interfaces:
   - `onPick`
   - `onHover`
   - `onSelectionChange`
   - `onHighlight`
   - `onPlumbBobChange`
3. Implement spin/drag controller and picking utilities.

Acceptance:

- `mooshow` can run with default hooks and no Svelte UI.
- Selection and spin behavior works through public stage API.

## Phase 3 - Build `VitaMooSpace.svelte`

1. Build a single full-page component with:
   - canvas region
   - scene selector
   - actor selector
   - animation selector
   - toggles for autoplay/spin/highlight
2. Load JSON content from `/data/content-exchange.json` (and optional `assetIndexRef` assets file).
3. Instantiate `mooshow` on mount and destroy on unmount.
4. Bind UI controls to stage API.

Acceptance:

- App reproduces core playful demo flow: scene selection, character spin, animation changes, picking and highlighting.

## Phase 4 - GitHub Pages Deployment

Update **`.github/workflows/vitamoo-pages.yml`** to build and deploy the SvelteKit static site
instead of any legacy standalone **`packages/vitamoo/dist`** demo.

Historical workflow (pre–vitamoospace):

1. `npm ci` in **`packages/vitamoo`**
2. `npm run build` (tsc only today; older commits copied a static demo into `dist/`)
3. Upload **`packages/vitamoo/dist`** to Pages

New workflow:

1. `pnpm install` at repo root (workspace install).
2. Build vitamoo core: `pnpm --filter vitamoo run build`.
3. Build mooshow: `pnpm --filter mooshow run build`.
4. Build vitamoospace static: `pnpm --filter vitamoospace run build`.
   - SvelteKit with `@sveltejs/adapter-static` outputs to `apps/vitamoospace/build/`.
5. Upload `apps/vitamoospace/build/` to Pages.
6. Deploy.

SvelteKit adapter-static config:

- `fallback: undefined` (no SPA fallback; fully prerendered).
- `prerender: { default: true }` in `svelte.config.js`.
- Base path: set via `paths.base` if deployed under a subpath (e.g. `/SimObliterator_Suite`).

Trigger: **`workflow_dispatch`** (manual). Deploy job is skipped unless **`VITAMOOSPACE_PAGES_URL`** is configured on the repo.

Acceptance:

- Pages site serves the SvelteKit-built app at the same URL as today.
- Static assets (data files, textures) load correctly from **`/data/`** (symlink to **`content/vitamoo/sims-demo/`**).
- Legacy standalone demo is not deployed.

## Phase 5 - Cleanup and Parity Review

1. Compare former `demo/` features against vitamoospace and document parity status (optional).
2. Legacy `demo/` removed from tree; recover from git if required.
3. **Monorepo extract (done):** **`packages/vitamoo`**, **`packages/mooshow`**, **`apps/vitamoospace`**, demo content under **`content/vitamoo/sims-demo/`**.

Acceptance:

- New app is the only supported demo path.
- Legacy standalone viewer is not in the working tree.

## Build and Tooling Notes

- Package manager: pnpm workspace already enabled at repo root.
- From the **repo root**, prefer workspace filters:
  - `pnpm --filter vitamoo run build`
  - `pnpm --filter mooshow run build`
  - `pnpm --filter vitamoospace run dev`
- Ship large demo packs under **`content/`**; keep **`apps/vitamoospace/static/data`** as a symlink (or equivalent) so **`/data/`** URLs stay stable.

## Risks and Mitigations

1. Risk: behavior drift while splitting `viewer.js`.
   - Mitigation: move logic in small slices with feature checks per phase.

2. Risk: tight coupling between UI code and runtime internals.
   - Mitigation: enforce a narrow `mooshow` stage API and hooks contract.

3. Risk: asset path breakage during SvelteKit migration.
   - Mitigation: keep original filenames and mirror the `content-exchange.json` and `assetIndexRef` references under **`content/vitamoo/sims-demo/`** (served via **`static/data`**).

4. Risk: too much rewrite at once.
   - Mitigation: ship vitamoospace first; remove the old tree only after the new path is stable (done).

## Definition of Done

The refactor is complete when:

1. `vitamoo` is a clean low-level module without demo UI responsibilities.
2. `mooshow` owns graphics/runtime/interactions with explicit hooks.
3. `vitamoospace` is a SvelteKit single-page app that fills the viewport and hosts one `VitaMooSpace` component.
4. `vitamoospace` includes a server-side placeholder route with no active backend behavior.
5. The playful spinning scene demo works from `vitamoospace` using JSON scene/content data.
6. GitHub Pages workflow builds and deploys the SvelteKit static site (replacing the legacy demo deployment).
