# Micropolis Skill

This is the engine-level Micropolis skill for `MicropolisCore`.

It is the broad parent surface for the C++/WASM simulator, save files, and existing `micropolis.js` CLI. It is intentionally not a giant all-purpose skill. When a capability grows enough structure, it should become its own sub-skill.

## Layers

- `GLANCE.yml`: quick relevance check
- `CARD.yml`: command/method advertisements
- `SKILL.md`: operational protocol
- `README.md`: this overview

## Current CLI

From `MicropolisCore/micropolis`:

```bash
npm run micropolis -- city info ../resources/cities/scenario_tokyo.cty
npm run micropolis -- city analyze ../resources/cities/scenario_boston.cty
npm run micropolis -- city export --format json --include-map ../resources/cities/radial.cty
npm run micropolis -- visualize ascii ../resources/cities/radial.cty
```

The command-bus sub-skill owns the live command surface:

```bash
npm run commands -- list
npm run commands -- propose city.generate-random --actor llm --reason "student asked for a fresh city"
```

## Delegation

Use this skill for static engine and file work. Delegate live or specialized behavior:

- `micropolis-command-bus`: live UI/simulator commands, LLM proposals
- `sister-script`: CLI structure
- `experiment`: batch simulation and comparisons
- `github`: GitHub-as-MMORPG
- `constructionism`: educational framing
- `skill-snitch`: safety and direct-mutation audit

## Philosophy

Micropolis is a microworld, not just a game. The CLI gives LLMs, humans, tools, and future MCP services a stable gate into that microworld.

New capability should be factored into skills the same way Unix factors behavior into tools and MOOLLM factors behavior into cards.

## Future: TiVo Time Travel

Do not implement yet, but keep this in mind: some runtime overlays integrate over time. Exact regeneration may require replaying history from a checkpoint rather than reading one final save file.

The long-term CLI should support differential snapshots, command/edit logs, branch points at human/LLM/tool edits, fast replay, and overlay regeneration from replayed simulator phases.

The CLI should eventually make computed layers feel like saved layers: ask for `traffic`, `pollution`, `crime`, `landvalue`, `police`, `fire`, etc., and the tool decides whether to read saved bytes, derive from tiles, run simulator analysis scans, or replay history.

Command history should live in the save-file directory in a GitHub branch named like `<type>_<id>` (for example `micropolis_971987439573945`). Cheap edits can be coalesced into leaves and commits for efficiency, but leaves must preserve individual command boundaries so users can later split reality at any command inside a coalesced commit. See `designs/command-timeline-git-branches.md`.
