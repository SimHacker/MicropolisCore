---
name: micropolis
description: Engine-level Micropolis skill exposing the C++/WASM simulator and save-file CLI to humans, LLMs, MCP tools, scripts, and UI layers. Use for city file inspection, analysis, visualization, export, editing, headless simulation planning, and deciding which Micropolis sub-skill should own a capability.
license: GPL-3.0
tier: 2
protocol: MICROPOLIS-ENGINE
allowed-tools: [read_file, write_file, run_terminal_cmd]
related: [micropolis-command-bus, sister-script, simulation, experiment, github, constructionism, schema-mechanism, advertisement, skill, skill-snitch, mooco]
tags: [micropolis, simcity, engine, cli, wasm, save-files, constructionism, microworld]
---

# Micropolis

> *"The engine is the microworld. The CLI is the public gate."*

## Role

This is the parent skill for MicropolisCore itself. It owns the broad engine/save-file/CLI surface and delegates specialized capabilities to sub-skills.

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
- Capability factoring decisions
- Delegation to narrower Micropolis sub-skills

## What This Skill Delegates

| Capability | Delegate |
|------------|----------|
| Live simulator/UI mutation | `micropolis-command-bus` |
| Pie menus/keyboard/chat/LLM action dispatch | `micropolis-command-bus` |
| CLI structure and doc-first automation | `sister-script` |
| Batch simulation and evaluation loops | `experiment` + `simulation` |
| Git branches, issues, PRs, commits | `github` |
| Educational framing | `constructionism` |
| Object-advertised actions | `advertisement` |
| Skill security/audit | `skill-snitch` |
| Future smart orchestration/MCP hosting | `mooco` |

## Primary CLI

Run from `MicropolisCore/micropolis`:

```bash
npm run micropolis -- <command> <subcommand> [options]
```

Important commands:

```bash
npm run micropolis -- city info ../resources/cities/scenario_tokyo.cty
npm run micropolis -- city analyze ../resources/cities/scenario_boston.cty
npm run micropolis -- city export --format json --include-map ../resources/cities/radial.cty
npm run micropolis -- visualize ascii --style zones ../resources/cities/radial.cty
npm run micropolis -- visualize emoji ../resources/cities/scenario_tokyo.cty
npm run micropolis -- visualize filtered --style traffic ../resources/cities/haight.cty
```

For live command dispatch, delegate:

```bash
npm run commands -- list
npm run commands -- preview <command-id> --actor llm --reason "why"
npm run commands -- propose <command-id> --actor llm --reason "why"
```

## LLM Workflow

When an LLM needs Micropolis capabilities:

1. Identify whether the task is file/static or live/mutating.
2. If file/static, use this skill and `micropolis.js`.
3. If live/mutating, delegate to `micropolis-command-bus`.
4. If multi-step simulation or comparison, delegate to `experiment`.
5. If GitHub-as-MMORPG, delegate Git operations to `github`.
6. Always explain why a tool call is being made.
7. Prefer machine-readable JSON exports when feeding results to another skill or LLM.

## Static vs Live Boundary

### Static/File-Oriented

Use `micropolis.js` when working with:

- `.cty` and `.mop` files
- Binary dumps
- Map/history/metadata analysis
- Export to JSON/CSV/tiles
- ASCII/emoji/filtered visualization
- Scenario metadata patching

### Live/Running-Simulation

Use `micropolis-command-bus` when working with:

- Running WASM simulator actions
- UI view commands
- Pie menu commands
- Keyboard shortcuts
- Chat slash commands
- LLM proposals
- Approval/rejection of mutating actions

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

## Engine Map

| Area | Files |
|------|-------|
| C++ core | `MicropolisEngine/src/` |
| Embind/WASM | `MicropolisEngine/src/emscripten.cpp` |
| Save/load | `MicropolisEngine/src/fileio.cpp` |
| Tools | `MicropolisEngine/src/tool.cpp` |
| CLI | `micropolis/scripts/micropolis.js` |
| Constants | `micropolis/scripts/constants.js` |
| WASM wrapper | `micropolis/src/lib/MicropolisSimulator.ts` |
| Svelte bridge | `micropolis/src/lib/micropolisStore.ts`, `ReactiveMicropolisCallback.ts` |
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
- Fast replay from checkpoints.
- Pausing at edit points and forking alternate histories.
- Regenerating runtime maps by replaying enough simulator phases.

This is the "TiVo for Micropolis" model described in `notes/MultiPlayerIdeas.txt`.
See `designs/command-timeline-git-branches.md` for the command leaf and commit policy.

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

## Output Discipline

For humans:

- Short explanation
- Concrete command
- What it returns

For LLM/tool consumption:

- Prefer `--format json`
- Use region bounds to control output size
- Include relevant file path and command used
- Do not dump full maps unless requested

## Dovetails

- `micropolis-command-bus`: live command and LLM proposal gate
- `sister-script`: CLI should be sniffable and self-documenting
- `tool-calling-protocol`: every tool call needs a reason/why
- `constructionism`: every tool should help users build and understand
- `experiment`: batch simulations and comparisons
- `github`: branches as timelines, PRs as decisions
- `skill`: factor new capabilities into sub-skills
