# VitaMoo → `apps/`, `packages/`, `content/` (completed layout)

Target shape: **deployable apps** under **`apps/`**, **shared libraries** under **`packages/`**, and **data-driven bundles** under **`content/`** (same pattern as Micropolis: `content/micropolis`, `content/vitamoo`, `content/yoot`).

## Current layout (MicropolisCore)

| Area | Location | Role |
|------|----------|------|
| **VitaMooSpace** | **`apps/vitamoospace`** | SvelteKit shell / deploy target |
| **mooshow** | **`packages/mooshow`** | WebGPU stage, picking, camera, hooks (depends on **`vitamoo`** workspace package) |
| **vitamoo** (core) | **`packages/vitamoo`** (`vitamoo/vitamoo/*.ts`) | Core TS library: playing scene, I/O, GPU helpers |
| **Design notes** | **`documentation/vitamoo/`** | Long-form docs (moved from former `vitamoo/docs/`) |
| **Sims demo assets + manifests** | **`content/vitamoo/sims-demo/`** | Exchange JSON, CMX/SKN/BMP/CFP samples; **`apps/vitamoospace/static/data`** is a **symlink** to this tree so URLs stay under **`/data/`** |

## Workspace / CI

- **`pnpm-workspace.yaml`**: **`apps/*`**, **`packages/*`** (includes **`vitamoo`**, **`mooshow`**, **`vitamoospace`**).
- **GitHub Actions**: **`.github/workflows/vitamoo-pages.yml`**, **`vitamoo-cloud-run.yml`** — paths use **`apps/vitamoospace`**, **`packages/vitamoo/scripts/`**.

## Follow-ups (optional)

- **`content/variants/*.yaml`** — wire variant manifests when build-time content selection lands (same contract as Micropolis).
- Renaming the **`vitamoo`** npm **`package.json`** **`name`** (e.g. scoped **`@vitamoo/core`**) — would ripple through dependents; deferred.

## Out of scope

- VitaMoo ↔ Micropolis hub routing (`/play/sims`) — unchanged here.
