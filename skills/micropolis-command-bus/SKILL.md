---
name: micropolis-command-bus
description: Routes all Micropolis UI, CLI, MCP, chat, pie menu, and LLM actions through a safe command bus with preview/proposal/approval. Use when agents need to inspect, propose, approve, reject, or dispatch Micropolis commands.
license: GPL-3.0
tier: 2
protocol: MICROPOLIS-COMMAND-BUS
allowed-tools: [read_file, write_file, run_terminal_cmd]
related: [micropolis, moollm, mooco, skill, card, advertisement, action-queue, protocol, github, skill-snitch, speed-of-light, planning, simulation, constructionism]
tags: [micropolis, command-bus, mcp, llm-actions, operator-model, sveltekit, safety]
---

# Micropolis Command Bus

> *"All roads to the simulator go through the bus."*

## What It Is

The Micropolis command bus is the shared operation layer for humans, UI widgets, pie menus, keyboard shortcuts, chat slash commands, MCP tools, CLI commands, and MOOLLM characters.

It is the Micropolis equivalent of Blender operators, extended with MOOLLM-style proposal, preview, approval, and audit semantics.

## Invariant

All agent-controlled Micropolis actions must go through the command bus. Do not call simulator, view, window, workspace, or GitHub mutation APIs directly when a command exists or should exist.

## Semantic Image Pyramid

Read in this order:

1. `GLANCE.yml` — quick activation check
2. `CARD.yml` — machine-readable interface, advertisements, methods
3. `SKILL.md` — this operational protocol
4. `README.md` — deeper human-facing rationale

Never load a lower layer without reading the layer above it first.

## Files

| File | Role |
|------|------|
| `micropolis/src/lib/CommandBus.ts` | Core bus: commands, dispatch, preview, undo, proposals |
| `micropolis/src/lib/micropolisCommands.ts` | Micropolis command registry |
| `micropolis/src/lib/CommandMcpService.ts` | MCP-style service wrapper |
| `micropolis/cli/bus/index.ts` | Unified CLI command-bus branch |
| `skills/micropolis-command-bus/CARD.yml` | MOOLLM card interface |
| `skills/micropolis-command-bus/GLANCE.yml` | Tiny mipmap summary |

## Command Shape

Commands are data objects:

```ts
{
  id: string;
  label: string;
  icon?: string;
  context?: string | string[];
  enabled?: boolean | ((context) => boolean);
  run: (context) => result;
  preview?: (context) => preview;
  undo?: (context) => undo;
  policy?: {
    risk: "safe" | "reversible" | "destructive" | "external";
    allowLLM?: boolean;
    requiresApproval?: boolean | ((context) => boolean);
  };
}
```

All surfaces dispatch the same command IDs:

- Pie menus
- Keyboard shortcuts
- Buttons
- Chat slash commands
- MCP tools
- CLI commands
- LLM proposals
- Future tab/window/workspace controls

## Safety Policy

| Risk | LLM Behavior |
|------|--------------|
| `safe` | May dispatch directly when useful |
| `reversible` | Prefer proposal unless user explicitly approved direct execution |
| `destructive` | Must preview and propose; user approval required |
| `external` | Must preview and propose; explicit user approval required |

## LLM Workflow

1. List available commands.
2. Preview the intended command.
3. Propose actions when the source is `llm`, especially if not `safe`.
4. Wait for approval or rejection.
5. Dispatch only after approval or when policy allows direct execution.
6. Log the result in the conversation or session log when available.

## CLI

Run from `MicropolisCore/micropolis`:

```bash
npm run micropolis -- bus list --format yaml
npm run micropolis -- bus preview <command-id> --args '{"key":"value"}' --actor llm --reason "why" --format yaml
npm run micropolis -- bus propose <command-id> --args '{}' --actor llm --reason "why" --format yaml
npm run micropolis -- bus proposals --status pending --format yaml
npm run micropolis -- bus approve <proposal-id> --actor user --format yaml
npm run micropolis -- bus reject <proposal-id> --reason "why" --format yaml
```

The command-bus branch is one module of the unified CLI. `--help`, `about`, and `api` are the terminal-facing documentation.

## MCP Service

`CommandMcpService.ts` exposes MCP-style tools:

- `command_list`
- `command_preview`
- `command_propose`
- `command_dispatch`
- `command_proposal_list`
- `command_proposal_approve`
- `command_proposal_reject`

This is not yet a standalone MCP server process. It is the service layer that a future `mooco` or MCP adapter can export.

## MOOLLM Composition

This skill deliberately composes with:

| Skill | How |
|-------|-----|
| `micropolis` | Domain model, simulation, Git multiverse, educational purpose |
| `micropolis` | Unified CLI and module surface |
| `tool-calling-protocol` | `why`/reason discipline and safe tool execution |
| `action-queue` | Pending command proposals are action-queue entries |
| `advertisement` | Commands advertise capabilities and map naturally to pie menus |
| `card` | `CARD.yml` declares methods, ads, K-lines, and interface |
| `github` | Future external commands for issues, PRs, commits, branches |
| `skill-snitch` | Audit command declarations against actual dispatch behavior |
| `mooco` | Future orchestrator can operationalize MCP service and proposal state |
| `speed-of-light` | Multiple AI tutors can debate proposals inside one LLM call |
| `constructionism` | Students learn by previewing, proposing, running, undoing actions |

## Design Intent

UI surfaces should not own behavior. They invoke named operations with context.

The bus gives Micropolis a single, inspectable, replayable command vocabulary. That vocabulary can drive the simulator today and later drive tabbed windows, spatial outlines, GitHub-as-MMORPG workflows, role presets, AI tutors, and multiplayer governance.

## Upgrade Path

1. Persist CLI proposal state so proposals survive separate processes.
2. Add event logging compatible with MOOLLM `session-log`.
3. Add command advertisements to pie-menu construction.
4. Route chat slash commands through the bus.
5. Export a real MCP server adapter.
6. Add `skill-snitch` checks: every mutating code path should correspond to a command.
7. Add GitHub commands as external-risk proposals.
