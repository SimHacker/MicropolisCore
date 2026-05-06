# VitaMoo → `apps/`, `packages/`, `content/` (plan)

Target shape: **deployable apps** under **`apps/`**, **shared libraries** under **`packages/`**, and **data-driven bundles** under **`content/`** (same pattern as Micropolis: `content/micropolis`, `content/vitamoo`, `content/yoot`).

## Current VitaMoo layout (repo root `vitamoo/`)

| Area | Role today | Proposed home |
|------|------------|----------------|
| **`vitamoospace/`** | SvelteKit shell / deploy target | **`apps/vitamoospace`** (or **`apps/vitamoo`** if renamed for parity with package name) |
| **`mooshow/`** | Related Svelte/build subtree | **`apps/mooshow`** if it stays a separate deployable; else merge into one app package |
| **`vitamoo/`** | Core TS library (playing scene, I/O, GPU helpers) | **`packages/vitamoo-core`** or **`packages/vitamoo`** (`name`: `@vitamoo/core` or keep scoped name aligned with publish story) |
| **`docs/`** | Long-form design notes | Keep **`vitamoo/docs`** → move to **`documentation/vitamoo/`** *or* root **`vitamoo/`** docs-only folder until apps extract is done |
| **Static Sims-facing assets / manifests** | Product-specific | **`content/vitamoo/`** (already exists at repo root); wire **`content/variants/*.yaml`** when build manifests land |

## Phased refactor (low risk first)

1. **Workspace only** — Add **`apps/vitamoospace`** (and **`apps/mooshow`** if separate) to **`pnpm-workspace.yaml`** via **`git mv`** (no logic change), fix imports that used repo-relative assumptions.
2. **Extract library** — Move **`vitamoo/vitamoo/*.ts`** tree into **`packages/<name>/src`**, export public API, leave thin re-exports under old paths temporarily (`package.json` **`exports`** map) if needed.
3. **Content** — Move scenario/exchange/manifest JSON under **`content/vitamoo/`**; apps resolve via **`VITE_*`** / variant YAML (same contract as Micropolis content).
4. **CI** — Update **`vitamoo-pages.yml`** / **`vitamoo-cloud-run.yml`** **`working-directory`** and artifact paths; keep **manual** **`workflow_dispatch`** if that is still policy.
5. **Cleanup** — Remove empty **`vitamoo/`** dirs; align **`vitamoo/.gitignore`** with **`apps/*`** + **`packages/*`**.

## Dependencies to watch

- **`@micropolis/tile-renderer`** — VitaMoo may depend on shared renderers; keep **`workspace:*`** after moves.
- **Cross-links in docs** — **`vitamoo/docs/*.md`** references to paths under **`vitamoo/vitamoo/`** need bulk replace once packages land.

## Out of scope for this pass

- Renaming the **`vitamoo`** workspace npm **`package.json`** **name** (would ripple through imports).
- VitaMoo ↔ Micropolis hub routing (`/play/sims`) — behavior unchanged until apps paths stabilize.
