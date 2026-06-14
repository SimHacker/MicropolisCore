# Development Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | ≥ 20 (CI: 22) | Use [nvm](https://github.com/nvm-sh/nvm): `nvm use` |
| [pnpm](https://pnpm.io/) | 10.x | Managed by `packageManager` in root `package.json` — `corepack enable` |
| [Emscripten](https://emscripten.org/) | any recent | Only needed to **rebuild** the WASM engine. Committed artifacts in `apps/micropolis/src/lib/` work without it. |

Quick start with nvm:

```bash
nvm install 22 && nvm use
corepack enable
```

## Install

```bash
pnpm install
```

Installs all workspace packages (`apps/*`, `packages/*`).

## Build

```bash
# TypeScript + SvelteKit (all packages, in dependency order):
pnpm run build

# Single package:
pnpm --filter micropolis run build       # Micropolis SvelteKit app
pnpm --filter vitamoospace run build     # VitaMooSpace SvelteKit app
pnpm --filter vitamoo run build          # VitaMoo core library
pnpm --filter mooshow run build          # MooShow GPU runtime

# Rebuild C++/WASM engine (requires Emscripten on PATH):
pnpm run build:engine                    # → make install in packages/micropolis-engine/
```

## Tests

```bash
pnpm run test                            # Micropolis Vitest suite (52 tests, uses committed WASM)
pnpm run verify:structure                # Monorepo layout invariants (20 assertions)
pnpm --filter vitamoo run verify:exchange          # VitaMoo exchange schema
pnpm --filter vitamoo run verify:exchange:merge    # Playing-scene merge invariants
```

## Type-check

```bash
pnpm run check                           # svelte-check on apps/micropolis
pnpm --filter micropolis run check:watch # Watch mode
```

## Dev servers

```bash
pnpm --filter micropolis dev             # Vite + watched C++ rebuild (needs Emscripten)
pnpm --filter micropolis run dev:vite    # Vite only (uses committed WASM)
pnpm --filter vitamoospace dev           # VitaMooSpace   → http://localhost:5173
```

`dev` runs Vite and `chokidar` on `packages/micropolis-engine/src/*.{cpp,h}`; each save
runs `pnpm run build:engine` (same as [PR #6](https://github.com/SimHacker/MicropolisCore/pull/6),
adapted for the monorepo).

Or use the VS Code **Debug Micropolis SvelteKit App** launch config (`.vscode/launch.json`).

## Repository layout

```
apps/
  micropolis/          SvelteKit city simulation app (WebGL tile renderer, WASM bridge)
  vitamoospace/        SvelteKit Sims character demo (WebGPU renderer)
packages/
  micropolis-engine/   C++/Emscripten WASM engine (GNU make, no CMake)
  tile-renderer/       Canvas/WebGL/WebGPU tile renderer backends
  vitamoo/             Sims animation core (TypeScript)
  mooshow/             GPU stage, picking, camera, hooks (TypeScript)
content/
  micropolis/          City saves, tilesets, sounds
  vitamoo/             Sims demo assets (CMX/SKN/BMP/CFP)
documentation/
  TODO.md              ← Open engineering work, start here
  designs/             Forward-looking specs
  vitamoo/             VitaMoo renderer docs
  notes/               Developer notes and CLI cheat sheets
```

## CI workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `pr-checks.yml` | push / PR | structure check · TypeScript builds · svelte-check · Vitest |
| `emscripten_build.yml` | manual | WASM build · Vitest · Doxygen · deploy Pages |
| `vitamoo-pages.yml` | manual | VitaMooSpace static deploy to GitHub Pages |

## iOS / Capacitor

`apps/micropolis/ios/` is a Capacitor iOS shell. Requires periodic `npx cap sync` after dependency bumps to refresh `Pods/` paths. Only maintained if targeting iOS. Android assets are not tracked.
