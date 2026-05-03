# Micropolis Skill

This is the parent Micropolis skill for `MicropolisCore`.

It centers the unified `micropolis` CLI and the modules it exposes: save files, terminal visualization, WASM simulation, renderers, command-bus workflows, browser-side content management, and MOOLLM-facing protocols. MCP and other adapters are secondary routes into the same modules.

## Layers

- `GLANCE.yml`: quick relevance check
- `CARD.yml`: command/method advertisements
- `SKILL.md`: operational protocol
- `README.md`: this overview

## Current CLI

From `MicropolisCore/micropolis`:

```bash
npm run micropolis -- city info ../resources/cities/scenario_tokyo.cty
npm run micropolis -- city analyze ../resources/cities/scenario_boston.cty --format yaml
npm run micropolis -- city export ../resources/cities/radial.cty --format csv --include-map
npm run micropolis -- visualize ascii ../resources/cities/radial.cty
npm run micropolis -- sim smoke --ticks 10 --format yaml
npm run micropolis -- bus list --format yaml
npm run micropolis -- bus propose city.generate-random --actor llm --reason "student asked for a fresh city" --format yaml
```

## Current Modules

- `micropolis/cli/entry.ts`: one terminal entrypoint.
- `micropolis/cli/city/`: city files, scenario metadata, terminal visualization.
- `micropolis/cli/wasm/`: headless WASM simulator.
- `micropolis/cli/bus/`: command-bus workflows.
- `micropolis/cli/meta/`: `about` and `api` self-description.
- `micropolis/src/lib/wasm/`: browser/node WASM loaders and shared heap/callback helpers.
- `micropolis/src/lib/MicropolisReactive.svelte.ts`: current reactive bridge.
- `micropolis/src/lib/*TileRenderer.ts`: WebGL current renderer, Canvas/WebGPU retained work-in-progress renderers.
- `designs/renderer-plugin-roadmap.md`: renderer plugin, client-rendered previews, and headless-browser batch rendering direction.

## Status

Implemented:

- Unified `npm run micropolis -- ...` CLI with `about`, `api`, `city`, `visualize`, `sim`, and `bus`.
- YAML/JSON structured output and CSV tile-grid export.
- Node and browser WASM loader helpers under `src/lib/wasm/`.
- Real WASM smoke/integration tests, CLI format tests, and command-bus metadata tests.
- Current browser rendering via `WebGLTileRenderer`.
- Retained WIP `CanvasTileRenderer`, `WebGPUTileRenderer`, and `PieMenu.svelte`.

Roadmap / aspiration:

- Renderer plugin contract across WebGPU, WebGL, Canvas, user browser, and headless browser.
- Browser-side content editing, preview approval, and catalog upload workflow.
- GitHub branches/issues/PRs as multiplayer civic object store.
- Semantic image pyramid for Micropolis city packages and cross-world Sims content.
- SimObliterator/VitaMoo integration, CHARACTER/OBJECT/city packages, and unified Sims + Micropolis world.
- Time-travel replay, computed runtime layers, experiment branches, and classroom workflows.

## MOOLLM Perspective

From the MOOLLM skill index, Micropolis composes with:

- `yaml-jazz`, `schema`, `plain-text`, `naming`: durable YAML/JSON/CSV surfaces and semantic filenames.
- `object`, `room`, `advertisement`, `action-queue`: content objects advertise actions; commands queue and execute with policy.
- `character`, `incarnation`, `mind-mirror`, `needs`: Sims/Micropolis people and tutors become ethical, inspectable characters.
- `simulation`, `experiment`, `schema-mechanism`: replay, compare, and learn cause/effect from the simulator.
- `data-flow`, `mooco`, `runtime`, `context`: future orchestration and adapter hosting.
- `visualizer`, `image-mining`, `storytelling-tools`: images, albums, previews, and catalogs become semantic resources.

SimObliterator adds the strongest pattern for binary game content: raw bytes stay sacred, resources explode into deterministic trees, decoded fields become YAML, semantic authoring happens above that, and narrative/character layers sit at the top. Micropolis save files, render descriptions, and content catalogs should follow the same multi-resolution model.

Those trees should live naturally in GitHub as the MMORPG object store. A whole city can have a branch like `city_234234234234`; a multiverse package can contain nested object trees like `micropolis_43345345345/cities/2342342423423`. Proposals, experiments, and evidence can be branches too: `issue_3423234`, `proposal_...`, `experiment_...`. Git history preserves what changed; GitHub issues host the civic discussion.

Example classroom flow: a player proposes a nuclear power plant at a specific tile, opens a GitHub issue explaining why, other players debate benefits and risks, experiments run alternative timeline branches, evidence files are committed under the issue/proposal branch, and the class learns GitHub by playing a multiplayer constructionist city simulation.

## Delegation

Use this skill for static engine and file work. Delegate live or specialized behavior:

- `micropolis-command-bus`: live UI/simulator commands, LLM proposals
- `micropolis/cli`: CLI structure
- `experiment`: batch simulation and comparisons
- `github`: GitHub-as-MMORPG
- `constructionism`: educational framing
- `skill-snitch`: safety and direct-mutation audit
- `mooco`: future orchestration/catalog/adapters
- `sim-obliterator`: Sims save/object/person bridge and uplift/download
- `character`, `incarnation`, `mind-mirror`, `needs`: Sims/MOOLLM people model
- `object`, `room`, `advertisement`, `action-queue`: object/action composition

## Content and Rendering Direction

Micropolis content management should be browser-first and approval-based:

1. Server or catalog sends a high-level render description.
2. User browser renders with WebGPU, WebGL, or Canvas.
3. User reviews previews locally.
4. Browser uploads only approved source assets and rendered derivatives.
5. Server stores schemas, metadata, permissions, and approved catalog entries.

The same render description should also run in headless Chromium/Playwright/Puppeteer for batch catalog generation and SSR snapshots.

## Layering Rule

Use SimObliterator's semantic image pyramid pattern for game content:

```text
raw bytes
  -> extracted resource tree
  -> decoded YAML/JSON fields
  -> semantic authoring YAML
  -> annotations/layout/previews
  -> MOOLLM CHARACTER.yml / OBJECT.yml / city package
```

Edit high, preserve low. Physical I/O belongs in small adapters; parsers and render descriptions stay portable across browser, Node, and future service hosts.

## Philosophy

Micropolis is a microworld, not just a game. The CLI gives LLMs, humans, tools, and future MCP services a stable gate into that microworld.

New capability should be factored into skills the same way Unix factors behavior into tools and MOOLLM factors behavior into cards.

## Future: TiVo Time Travel

Do not implement yet, but keep this in mind: some runtime overlays integrate over time. Exact regeneration may require replaying history from a checkpoint rather than reading one final save file.

The long-term CLI should support differential snapshots, command/edit logs, branch points at human/LLM/tool edits, fast replay, overlay regeneration from replayed simulator phases, and ephemeral overlay sidecars.

Sidecars can store runtime/computed layers that do not belong in classic `.cty` bytes: traffic, pollution, crime, land value, police/fire coverage, chalk marks, labels, preview renders, and experiment outputs. Use YAML/JSON for semantic metadata, CSV for tabular grids, and binary for dense rasters or videos. Standard binary sidecars declare dimensions, element type, channel order, frame count, and row/frame stride. All multi-byte numeric binary values use network byte order (big-endian). Raw video dumps can be `rgb8` or `rgba8` ordered as `frame * row * col * 3` or `frame * row * col * 4` respectively.

The CLI should eventually make computed layers feel like saved layers: ask for `traffic`, `pollution`, `crime`, `landvalue`, `police`, `fire`, etc., and the tool decides whether to read saved bytes, derive from tiles, run simulator analysis scans, or replay history.

Command history should live in the save-file directory in a GitHub branch named like `<type>_<id>` (for example `micropolis_971987439573945`). Cheap edits can be coalesced into leaves and commits for efficiency, but leaves must preserve individual command boundaries so users can later split reality at any command inside a coalesced commit. See `designs/command-timeline-git-branches.md`.
