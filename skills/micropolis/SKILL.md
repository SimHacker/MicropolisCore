---
name: micropolis
description: Parent MicropolisCore skill exposing the unified CLI, C++/WASM simulator, save-file tools, renderer/content workflows, command bus, and MOOLLM integration protocols. Use for city inspection, analysis, visualization, export, editing, headless simulation, content preview/catalog design, and routing work to Micropolis sub-skills.
license: GPL-3.0
tier: 2
protocol: MICROPOLIS-ENGINE
allowed-tools: [read_file, write_file, run_terminal_cmd]
related: [micropolis-command-bus, simulation, experiment, github, constructionism, schema-mechanism, advertisement, skill, skill-snitch, mooco, rendering, content-management]
tags: [micropolis, simcity, engine, cli, wasm, save-files, rendering, content-catalog, constructionism, microworld]
---

# Micropolis

> *"The engine is the microworld. The CLI is the public gate."*

## Role

This is the parent skill for MicropolisCore itself. It owns the broad engine/save-file/CLI/render/content surface and delegates specialized capabilities to sub-skills.

It should not try to do everything. It should route work to the right skill, script, module, or protocol.

## Semantic Image Pyramid

Read in this order:

1. `GLANCE.yml` — quick activation summary
2. `CARD.yml` — machine-readable interface and advertisements
3. `SKILL.md` — this operational protocol
4. `README.md` — human rationale and map

## What This Skill Owns

- Micropolis engine orientation
- Save-file CLI usage
- City file inspection and analysis
- City visualization and export
- Engine/WASM/frontend bridge map
- Renderer and content-management orientation
- Browser/headless-browser render workflow
- MOOLLM protocol routing
- Capability factoring decisions
- Delegation to narrower Micropolis sub-skills

## What This Skill Delegates

| Capability | Delegate |
|------------|----------|
| Live simulator/UI mutation | `micropolis-command-bus` |
| Pie menus/keyboard/chat/LLM action dispatch | `micropolis-command-bus` |
| CLI structure and doc-first automation | `npm run micropolis -- api --format yaml` |
| Batch simulation and evaluation loops | `experiment` + `simulation` |
| Git branches, issues, PRs, commits | `github` |
| Educational framing | `constructionism` |
| Object-advertised actions | `advertisement` |
| Skill security/audit | `skill-snitch` |
| Future smart orchestration/MCP hosting | `mooco` |
| Catalog services and adapters | `mooco` + future content skill |
| Sims save/object/person bridge | `sim-obliterator` |
| Character identity/personality | `character`, `incarnation`, `mind-mirror`, `needs` |
| Object/place/action composition | `object`, `room`, `advertisement`, `action-queue` |

## Primary CLI

Run from `MicropolisCore/micropolis`:

```bash
npm run micropolis -- <command> <subcommand> [options]
```

Important commands:

```bash
npm run micropolis -- about --format yaml
npm run micropolis -- api --format yaml
npm run micropolis -- city info ../resources/cities/scenario_tokyo.cty
npm run micropolis -- city analyze ../resources/cities/scenario_boston.cty
npm run micropolis -- city export --format yaml --include-map ../resources/cities/radial.cty
npm run micropolis -- city export --format csv --include-map ../resources/cities/radial.cty
npm run micropolis -- visualize ascii ../resources/cities/radial.cty
npm run micropolis -- visualize emoji ../resources/cities/scenario_tokyo.cty
npm run micropolis -- sim smoke --ticks 10 --format yaml
npm run micropolis -- bus list --format yaml
```

For command dispatch:

```bash
npm run micropolis -- bus preview <command-id> --actor llm --reason "why" --format yaml
npm run micropolis -- bus propose <command-id> --actor llm --reason "why" --format yaml
```

## Status Boundary

Implemented:

- Unified CLI: `about`, `api`, `city`, `visualize`, `sim`, `bus`.
- YAML/JSON/CSV output helpers.
- Static city file inspection, analysis, export, edit, patch-scenario.
- Terminal visualization: ASCII, emoji, mono, map.
- Headless WASM `sim info` / `sim smoke`.
- Command-bus list/preview/propose/dispatch/recording commands.
- Current browser path: `MicropolisSimulator`, `MicropolisReactive.svelte.ts`, `WebGLTileRenderer`.
- Tests for WASM load, reactive bridge, heap safety, CLI introspection, format helpers, and command metadata.

Roadmap:

- Renderer plugin contract and browser/headless-browser render route.
- Canvas pixel-sampling renderer and WebGPU renderer parity.
- Browser-first content management and approved catalog uploads.
- GitHub branches/issues/PRs as multiplayer civic object store.
- Semantic image pyramid for city/content packages.
- SimObliterator/VitaMoo bridge into a unified Sims + Micropolis world.
- Time-travel replay, computed layers, experiment branches, and classroom GitHub workflows.

## Unified CLI Surface

| Branch | Purpose |
|--------|---------|
| `about` | Human/LLM summary of the CLI and module surface |
| `api` | YAML/JSON module map and format summary |
| `city` | Static `.cty`/`.mop` read, dump, info, analyze, export, edit, patch-scenario |
| `visualize` | Terminal ASCII/emoji/mono/map renderings |
| `sim` | Headless real WASM load/info/smoke stepping |
| `bus` | Command list/preview/propose/dispatch/proposals/recordings |

Formats:

- Prefer `--format yaml` for LLM-facing structured output.
- Use `--format json` for strict machine consumers.
- Use `--format csv` for tabular exports and tile grids.
- Use text/ASCII/emoji/mono when a human needs a quick look.

## LLM Workflow

When an LLM needs Micropolis capabilities:

1. Identify whether the task is file/static or live/mutating.
2. Use `npm run micropolis -- about --format yaml` or `api --format yaml` when you need the command/module map.
3. Use `npm run micropolis -- city|visualize|sim|bus ...` for terminal work.
4. If multi-step simulation or comparison, delegate to `experiment`.
5. If GitHub-as-MMORPG, delegate Git operations to `github`.
6. Always explain why a tool call is being made.
7. Prefer YAML for LLM-facing structured output, JSON for strict machine consumers, and CSV for tabular export.

## MOOLLM Workflow

MOOLLM characters and skills should treat Micropolis as a shared world, not an opaque tool.

Default loop:

```text
Observe -> Explain -> Preview -> Propose -> Approve -> Execute -> Log
```

Use this skill to gather facts and choose the correct route:

1. `micropolis` for city facts, CLI/API map, render/content architecture, and engine orientation.
2. `micropolis-command-bus` for live actions, proposals, approvals, and command recordings.
3. `experiment` / `simulation` for batch comparisons and replay-style studies.
4. `github` for branches, issues, PRs, and GitHub-as-MMORPG operations.
5. `constructionism` for learning goals and teaching stance.
6. `advertisement` for object-advertised actions and contextual affordances.
7. `mooco` for future orchestration, MCP adapters, and catalog services.
8. `sim-obliterator` / `character` / `mind-mirror` when the work crosses into Sims people, objects, or uplift/download.

No ghost actions: world-changing work should create an inspectable command proposal, branch, issue, annotation, report, experiment, or catalog object.

## Static vs Live Boundary

### Static/File-Oriented

Use `npm run micropolis -- city ...` or `visualize ...` when working with:

- `.cty` and `.mop` files
- Binary dumps
- Map/history/metadata analysis
- Export to YAML/JSON/CSV/tiles
- ASCII/emoji/monospace visualization
- Scenario metadata patching

### Live/Running-Simulation

Use `npm run micropolis -- sim ...` or `bus ...` when working with:

- Running WASM simulator actions
- UI view commands
- Pie menu commands
- Keyboard shortcuts
- Chat slash commands
- LLM proposals
- Approval/rejection of mutating actions

### Render/Content-Oriented

Use this skill and `designs/renderer-plugin-roadmap.md` when working with:

- Renderer plugin contracts.
- Micropolis map previews.
- Sims character/object previews.
- Browser-side draft/edit/preview/approve/upload workflows.
- Headless browser catalog generation.
- WebGPU/WebGL/Canvas renderer capability selection.

Principle:

```text
render description
  -> browser renderer plugin
  -> WebGPU / WebGL / Canvas
  -> preview image or interactive view
```

The same render description should work in a user browser and in a hosted headless browser worker. Prefer user hardware for expensive previews, and upload only intentionally approved outputs.

## Capability Factoring Rule

If a capability grows its own:

- CLI commands
- TypeScript modules
- data formats
- persistence schema
- MCP tools
- protocols
- safety policy

then it should become a sub-skill with its own `GLANCE.yml`, `CARD.yml`, `SKILL.md`, and optional `README.md`.

Candidate sub-skills:

- `micropolis-save-format`
- `micropolis-overlays`
- `micropolis-experiments`
- `micropolis-github-multiverse`
- `micropolis-ui-workspace`
- `micropolis-ai-tutors`
- `micropolis-renderers`
- `micropolis-content-catalog`

## Engine Map

| Area | Files |
|------|-------|
| C++ core | `MicropolisEngine/src/` |
| Embind/WASM | `MicropolisEngine/src/emscripten.cpp` |
| Save/load | `MicropolisEngine/src/fileio.cpp` |
| Tools | `MicropolisEngine/src/tool.cpp` |
| CLI entry | `micropolis/cli/entry.ts` |
| CLI modules | `micropolis/cli/` |
| Constants | `micropolis/cli/constants/constants.js` |
| WASM wrapper | `micropolis/src/lib/MicropolisSimulator.ts` |
| Svelte bridge | `micropolis/src/lib/MicropolisReactive.svelte.ts` |
| WASM loaders/helpers | `micropolis/src/lib/wasm/` |
| I18n keys | `micropolis/src/lib/i18n/keys.ts` |
| WebGL renderer | `micropolis/src/lib/WebGLTileRenderer.ts` |
| Canvas renderer | `micropolis/src/lib/CanvasTileRenderer.ts` |
| WebGPU renderer | `micropolis/src/lib/WebGPUTileRenderer.ts` |
| Pie menus | `micropolis/src/lib/PieMenu.svelte` |
| Renderer roadmap | `designs/renderer-plugin-roadmap.md` |
| Collaboration lineage | `designs/collaborative-microworld-lineage.md` |
| Multiplayer browser lessons | `designs/multiplayer-browser-lessons.md` |
| Command path and collaboration modes | `designs/command-path-collaboration-modes.md` |
| Naming conventions | `designs/naming-conventions.md` |
| Callback interface roadmap | `designs/callback-interface-roadmap.md` |
| Command timeline | `designs/command-timeline-git-branches.md` |
| GitHub multiverse | `designs/github-as-mmorpg-multiverse.md` |
| Filesystem object model | `designs/filesystem-object-model.md` |
| MOOLLM integration | `designs/moollm-micropolis-integration.md` |

## Time Travel Roadmap

Do not implement yet, but design with this constraint in mind:

Some runtime overlay maps are integrated over time. Exact regeneration may require rewinding to an earlier checkpoint and replaying the edit/command history, not just loading a final `.cty` snapshot.

Future CLI should support:

- Differential snapshots.
- Persistent command/edit leaves from the command bus.
- Universe branch points at human/LLM/tool edit commands.
- Git branches named like `<type>_<id>` such as `micropolis_971987439573945`.
- Coalesced commits that preserve internal command boundaries for later split/replay.
- Ex-post-facto attribution sidecars that map command indices to the Git commit that contains their effects.
- Ephemeral overlay sidecars for runtime/computed maps, annotations, previews, and experiment outputs.
- Fast replay from checkpoints.
- Pausing at edit points and forking alternate histories.
- Regenerating runtime maps by replaying enough simulator phases.

This is the "TiVo for Micropolis" model described in `notes/MultiPlayerIdeas.txt`.
See `designs/command-timeline-git-branches.md` for the command leaf and commit policy.

## Sidecar Data Protocol

Sidecars store data adjacent to city packages without forcing it into classic `.cty` bytes.

Use cases:

- Runtime overlays: traffic, pollution, crime, land value, police/fire coverage.
- User overlays: chalk marks, labels, regions, routes, lesson annotations.
- Preview artifacts: rendered thumbnails, approved catalog images, visual diffs.
- Experiment outputs: charts, sampled layers, frame sequences, replay checkpoints.

Formats:

- YAML/JSON for semantic metadata and manifests.
- CSV for tabular grids and sparse samples.
- Binary for dense rasters, typed arrays, and videos.

Binary sidecars must declare:

- `schema_version`
- `width`, `height`, optional `frames`
- `element_type` such as `u8`, `u16`, `f32`, `rgba8`
- `channels` and channel order
- `row_stride_bytes`
- optional `frame_stride_bytes`

All multi-byte numeric values in binary sidecars use network byte order (big-endian). Byte order is not configurable. Single-byte formats such as `u8` and `rgba8` have no endian concern.

Raw video sidecars can use `rgba8` with layout:

```text
frame * row * col * 4
```

## Computed Layer Roadmap

Do not implement yet, but design the CLI so computed runtime layers become as easy to request as saved layers.

The future interface should let humans and LLMs ask for a layer by name without caring whether it comes from:

- Saved bytes in `.cty`/`.mop`.
- Derived tile IDs or tile flags.
- Simulator analysis scans.
- Historical replay from a checkpoint.

Planned shape:

```bash
npm run micropolis -- layer list ../resources/cities/haight.cty
npm run micropolis -- layer dump ../resources/cities/haight.cty --layer traffic --compute
npm run micropolis -- layer export ../resources/cities/haight.cty --layer pollution --format json --compute
npm run micropolis -- layer visualize ../resources/cities/haight.cty --layer landvalue --style ascii --compute
```

The CLI should infer the minimum required simulator scans from the requested layer. For exact reconstruction of history-integrated layers, it may need time-travel replay.

The future save format should also support extended layers beyond classic `.cty`/`.mop`:

- Dynamic simulator analysis maps captured directly at save time.
- User-defined layers: chalk, notes, labels, signs, regions, routes, planned work.
- Annotations linked to tiles, zones, neighborhoods, objects, branches, or chat messages.
- Behavior definitions for tools, agents, zones, scenarios, and educational courseware.
- Multiplayer state: proposals, votes, unresolved dialogs, role assignments, permissions.
- LLM state: tutor messages, command proposals, explanations, approvals, and audit logs.
- Metadata for authorship, provenance, branch ancestry, replay checkpoints, and learning goals.

Treat this as an extensible layered document format around the city, not just a binary save file.

## Content Management Protocol

Browser-first content editing should avoid unnecessary server round-trips:

1. Load schemas/assets/render descriptions into the browser.
2. Let users edit objects, images, tiles, metadata, and scene descriptions locally.
3. Render previews locally with WebGPU, WebGL fallback, or Canvas fallback.
4. Store drafts locally until the user saves or publishes.
5. Upload source assets and rendered derivatives only after approval.
6. Server catalogs store approved versions, provenance, permissions, and render descriptions.

For batch catalog generation or SSR snapshots, use a headless browser worker that opens the same renderer route and consumes the same render description.

## GitHub MMORPG Protocol

Treat GitHub as durable civic infrastructure, not only source control.

Object trees can live in branches and nested directory packages:

```text
city_234234234234/
proposal_3423234/
issue_3423234/
experiment_2026-05-03_power-plant/
micropolis_43345345345/cities/2342342423423/
```

Rules:

- Branches are universes or object stores.
- Directories are rooms/objects/containers.
- Commits are durable decisions or observations.
- Issues are civic discussion spaces.
- PRs compare alternate timelines.
- Evidence belongs in the repo, linked from the issue or proposal.
- Experiments should write their inputs, outputs, render previews, and conclusions as files.

Example workflow:

1. Player proposes building a nuclear plant at tile `(x,y)`.
2. Create `issue_<id>` branch or proposal tree with YAML command proposal, map snapshot, render preview, and explanation.
3. Open a GitHub issue for discussion: why build it, expected benefits, risks, alternatives.
4. Other players, tutors, and committees comment and add evidence.
5. Run simulation experiments on alternate branches.
6. Commit reports and charts/previews back into the proposal branch.
7. Merge, reject, or fork the plan as a civic decision.

This teaches GitHub by making GitHub the multiplayer constructionist city hall.

## Semantic Layer Protocol

Apply SimObliterator's IFF Semantic Image Pyramid to Micropolis and cross-world content:

```text
Layer 0: raw bytes / ground truth
Layer 1: extracted resource tree with deterministic names
Layer 2: decoded fields as YAML/JSON
Layer 3: semantic authoring YAML for humans and LLMs
Layer 4: annotations, layouts, previews, catalog metadata
Layer 5: MOOLLM character/object/city package
```

Rules:

- Edit at the highest layer that can express the change.
- Preserve raw bytes and unknown fields below.
- Keep annotations additive.
- Compile downward through typed writers, validation, and provenance.
- Keep physical I/O in adapters (`fs`, browser directory handle, zip, memory); parsers operate on bytes and plain objects.

This mirrors the SimObliterator/VitaMoo direction: one data contract, many hosts (browser, Node, static site, headless browser, future services).

## Sims / Micropolis Bridge

For a unified Sims + Micropolis world:

- Use `SimObliterator` contracts for Sims IFF/FAR/save/person/object data.
- Use `VitaMoo`/`mooshow` contracts for Sims character animation and WebGPU rendering.
- Use Micropolis CLI/WASM contracts for city maps, simulation, command bus, overlays, and city packages.
- Use `CHARACTER.yml`, `OBJECT.yml`, and city package YAML as MOOLLM-facing semantic layers.
- Use `advertisement` and `action-queue` so objects, Sims, cities, tutors, and tools expose actions uniformly.
- Use `representation-ethics`, `ontology`, and `incarnation` when simulating or uplifting real, historical, fictional, animal, robot, or abstract beings.

## Renderer Protocol

Renderer plugins should be selected by capability and intent:

1. WebGPU — high-quality Sims characters, objects, shader previews, future unified content renderer.
2. WebGL — broad browser support and current Micropolis map rendering.
3. Canvas/software — inspectable pedagogy renderer, Micropolis tile previews, fallback rendering, deterministic tests.

Micropolis Canvas rendering should iterate destination pixels and sample tile data like a shader, not draw tile quads, so zoomed output has no seams and can support far-zoom filtering.

## Output Discipline

For humans:

- Short explanation
- Concrete command
- What it returns

For LLM/tool consumption:

- Prefer `--format yaml`
- Use `--format json` for strict consumers
- Use `--format csv` for tabular/tile-grid exports
- Use region bounds to control output size
- Include relevant file path and command used
- Do not dump full maps unless requested

## Dovetails

- `micropolis-command-bus`: live command and LLM proposal gate
- `cli/`: CLI should be compact, self-documenting, and module-oriented
- `tool-calling-protocol`: every tool call needs a reason/why
- `constructionism`: every tool should help users build and understand
- `experiment`: batch simulations and comparisons
- `github`: branches as timelines, PRs as decisions
- `skill`: factor new capabilities into sub-skills
- `mooco`: future catalog/orchestration/MCP adapter host
- `renderer-plugin-roadmap`: browser/headless-browser render architecture
- `sim-obliterator`: Sims binary save/object/person bridge
- `character` / `incarnation` / `mind-mirror` / `needs`: Sims and tutor entity modeling
- `object` / `room` / `advertisement` / `action-queue`: shared world/action vocabulary
- `yaml-jazz` / `schema` / `plain-text` / `naming`: durable semantic file formats
- `postel` / `robust-first`: accept messy inputs, emit clean data, degrade gracefully
- `data-flow` / `runtime` / `context`: future orchestration model
- `visualizer` / `image-mining` / `storytelling-tools`: albums, images, previews, narrative artifacts
- `representation-ethics` / `ontology`: safe simulation of beings
- `skill-test` / `skill-snitch`: validate and audit skill claims
