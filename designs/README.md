# MicropolisCore Design Notes

This directory captures design rationale that should outlive chat context.

Read these alongside:

- `notes/PIE-TAB-WINDOWS.md`
- `notes/MultiPlayerIdeas.txt`
- `skills/micropolis/`
- `skills/micropolis-command-bus/`

## Documents

- `collaborative-microworld-lineage.md` — Engelbart, Kay, Papert, Piaget, SimCityNet, and constructionist multiplayer.
- `multiplayer-browser-lessons.md` — Lessons from Sail/Muddy and the Hacker News discussion for MicropolisHub.
- `command-path-collaboration-modes.md` — End-to-end command path, live/async collaboration modes, object placement, manifests, and source-of-truth rules.
- `naming-conventions.md` — Big-endian Micropolis naming across files, branches, commands, events, callbacks, and serialized records.
- `callback-interface-roadmap.md` — Simulator callback naming, event envelopes, reactive state bridge, and future introspection callbacks.
- `wasm-bridge-and-testing-trajectory.md` — Vitest setup, **`src/lib/wasm/`** / **`MicropolisReactive.svelte`**, integration tests against WASM, Embind teardown lessons, backlog, and alignment with command path / MCP goals.
- `command-timeline-git-branches.md` — Persistent command leaves, coalesced commits, Git branches as universes, and TiVo replay.
- `github-as-mmorpg-multiverse.md` — GitHub branches, issues, PRs, diffs, and forks as Micropolis multiplayer world mechanics.
- `filesystem-object-model.md` — Modeling Micropolis objects as inspectable filesystem trees with Self-style prototypes and CARD advertisements.
- `moollm-micropolis-integration.md` — How MOOLLM skills, characters, MCP, command bus, and GitHub compose around MicropolisCore.
- `renderer-plugin-roadmap.md` — Canvas/WebGL/WebGPU renderer plugin direction, pie menus, pedagogy, and future The Sims integration.
