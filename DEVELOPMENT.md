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
  micropolis/          SvelteKit city simulation app (WebGL tile renderer, WASM bridge, CLI)
  vitamoospace/        SvelteKit Sims character demo (WebGPU renderer)
  screen-angel/        Electron overlay: selectors and recognition over other apps (source-available)
  yoot/                Placeholder for a tower-sim web app
packages/
  micropolis-engine/   C++/Emscripten WASM engine (GNU make, no CMake)
  tile-renderer/       Canvas/WebGL/WebGPU tile renderer backends
  render-core/         Shared viewport, render schemas, WebGPU compositor
  vitamoo/             Sims animation core (TypeScript)
  mooshow/             GPU stage, picking, camera, hooks (TypeScript)
  sims-io/             Sims 1 file I/O: FAR, IFF, save data
  optical-codec/       Reader and test bench for Screen Angel's optical channel
skills/                MOOLLM skills: micropolis, micropolis-command-bus
content/
  micropolis/          City saves, tilesets, sounds
  vitamoo/             Sims demo assets (CMX/SKN/BMP/CFP)
documentation/
  TODO.md              ← Open engineering work, start here
  designs/             Forward-looking specs
  vitamoo/             VitaMoo renderer docs
  notes/               Developer notes and CLI cheat sheets
```

## Installing Emscripten

The engine build uses Emscripten/Embind. If `emcc --version` does not work, install `emsdk`:

```bash
# Pick a parent directory for developer tools.
mkdir -p ~/Developer
cd ~/Developer

git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest

# Activate for the current shell.
source ./emsdk_env.sh
emcc --version
```

To make Emscripten available in future shells, add this to your shell startup file:

```bash
source ~/Developer/emsdk/emsdk_env.sh
```

If you prefer not to auto-activate it in every shell, run that `source` command only before rebuilding the engine.

On macOS with Homebrew, this also works:

```bash
brew install emscripten
emcc --version
```


## The WASM engine

The engine is a **pnpm workspace package** (`@micropolis/engine-wasm` in `packages/micropolis-engine/`). It is still built with **GNU make** and **Emscripten** (no CMake). A normal **`pnpm --filter micropolis run build`** runs **`prebuild`**, which invokes **`pnpm --filter @micropolis/engine-wasm run build`** → **`make install`** in that directory.

To rebuild the engine only:

```bash
cd packages/micropolis-engine
make clean install
```

Or from the repo root:

```bash
pnpm --filter @micropolis/engine-wasm run build
```

`make install` builds the C++ engine and copies these generated artifacts into `apps/micropolis/src/lib/`:

```text
micropolisengine.js
micropolisengine.wasm
micropolisengine.data
```

The checked-in makefile builds the engine for browser, worker, and Node environments:

```text
-s 'ENVIRONMENT=web,worker,node'
```

Node support is required for `pnpm --filter micropolis run micropolis -- sim ...` (or `cd apps/micropolis && pnpm run micropolis -- sim ...`).


## The micropolis CLI

The `micropolis` CLI reads, analyzes, visualizes, edits, and patches `.cty` save files, runs the WASM simulator headlessly, and exposes the command bus.

Run from the `apps/micropolis/` package directory after `pnpm install` at the repo root (or prefix with `pnpm --filter micropolis run` from the MicropolisCore root).

```bash
cd apps/micropolis

# City information and analysis (paths relative to this directory)
pnpm run micropolis -- city info ../../content/micropolis/cities/scenario_tokyo.cty
pnpm run micropolis -- city analyze ../../content/micropolis/cities/scenario_boston.cty
pnpm run micropolis -- city analyze --format json ../../content/micropolis/cities/radial.cty

# Visualize as ASCII, emoji, or monospace
pnpm run micropolis -- visualize ascii --row 20 --col 30 --width 30 --height 15 ../../content/micropolis/cities/scenario_tokyo.cty
pnpm run micropolis -- visualize emoji ../../content/micropolis/cities/radial.cty

# Edit city metadata
pnpm run micropolis -- city edit city.cty --funds 50000 --tax 9 --year 1960

# Patch scenario files with the values the engine injects at runtime
pnpm run micropolis -- city patch-scenario ../../content/micropolis/cities/scenario_tokyo.cty --dry-run

# Export to JSON (with optional tile map data)
pnpm run micropolis -- city export --format json --include-map city.cty

# Pipe from stdin
cat city.cty | pnpm run micropolis -- city info -
```

Full test suite and command reference: [documentation/notes/micropolis-js-tests.md](documentation/notes/micropolis-js-tests.md)


## How the engine talks to the UI

The WASM engine talks to the Svelte UI through a callback chain:

```
C++ Micropolis Core (WASM)
    calls callback
Embind JSCallback Wrapper
    delegates
MicropolisReactive.engineCallback
    updates
$state / $derived Runes
    triggers
Svelte 5 Runtime
    updates DOM
UI Components + WebGL Renderer
```


## Working alongside MOOLLM

Soul City ties this repository to [MOOLLM](https://github.com/SimHacker/moollm) — the microworld skill framework where the **micropolis** skill, AI tutors, and related designs live. To work across engine code, the SvelteKit app, and MOOLLM skills in one flow:

1. **Check out MOOLLM and MicropolisCore in the same directory** (sibling folders under one parent, e.g. `~/Developer/` or `~/src/`):

   ```bash
   mkdir -p ~/Developer && cd ~/Developer
   git clone https://github.com/SimHacker/MicropolisCore.git
   git clone https://github.com/SimHacker/moollm.git
   ```

   Keeping them side-by-side makes paths predictable and matches how multi-root workspaces list folders.

2. **Add both repositories to your Cursor workspace** — and any other related checkouts you use (e.g. SimObliterator Suite for VitaMoo, design-only repos): use **File → Add Folder to Workspace…** (or your OS equivalent) and include each repo root, or open a multi-root `.code-workspace` file that lists those paths. Cursor can index and search across all of them together.

3. **Follow MOOLLM’s setup and install instructions first** (clone is already done if you used step 1):

   - [MOOLLM README — Quick Start](https://github.com/SimHacker/moollm#quick-start)
   - [MOOLLM QUICKSTART.md](https://github.com/SimHacker/moollm/blob/main/QUICKSTART.md) — open the repo in Cursor and wait until **Settings → Cursor Settings → Indexing → Codebase Indexing** reaches **100%**, as in MOOLLM’s quickstart.

4. **Then** install and build MicropolisCore using the prerequisites and commands below (Emscripten, `pnpm`, WASM engine, `micropolis` app).

Using the same layout with **other AI coding tools** (for example **Claude Code**) is plausible so both trees stay in context, but that workflow is **not yet tested or documented** here—Cursor + MOOLLM is the supported path today.

MOOLLM does not replace the Node/pnpm toolchain here; it complements this repo for skills, YAML Jazz, and agent orchestration alongside the engine and web app.

## CI workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `pr-checks.yml` | push / PR | structure check · TypeScript builds · svelte-check · Vitest |
| `emscripten_build.yml` | manual | WASM build · Vitest · Doxygen · deploy Pages |
| `vitamoo-pages.yml` | manual | VitaMooSpace static deploy to GitHub Pages |

## iOS / Capacitor

`apps/micropolis/ios/` is a Capacitor iOS shell. Requires periodic `npx cap sync` after dependency bumps to refresh `Pods/` paths. Only maintained if targeting iOS. Android assets are not tracked.
