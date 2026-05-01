# Micropolis Command Bus Skill

The Micropolis command bus is the operation layer between intent and mutation.

Humans can click buttons, press keys, invoke pie menus, type slash commands, or approve proposals. LLM characters can inspect, preview, and propose. MCP and CLI tools expose the same surface. Everything goes through the same command IDs.

## Why This Exists

Micropolis is becoming more than a single game screen: it will have pie menus, tabbed windows, freeform spatial outlining, chat, AI tutors, GitHub-as-MMORPG, multiplayer governance, and role-specific user interfaces.

Without a shared command layer, every surface would grow its own behavior. That is how systems become uninspectable.

The command bus makes behavior:

- Named
- Searchable
- Previewable
- Permissioned
- Undoable
- Dispatchable from many surfaces
- Auditable by `skill-snitch`

## MOOLLM Fit

This is a MOOLLM extended skill:

- `GLANCE.yml` answers "is this relevant?"
- `CARD.yml` advertises capabilities and methods
- `SKILL.md` defines the operational protocol
- `README.md` explains the rationale

It composes with:

- `micropolis` for domain semantics
- `sister-script` for CLI shape
- `tool-calling-protocol` for why/reason discipline
- `action-queue` for proposal queues
- `advertisement` for command-discovery and pie menus
- `github` for external GitHub-as-MMORPG operations
- `skill-snitch` for security/audit
- `mooco` for future smart orchestration

## Current Surfaces

Code:

- `micropolis/src/lib/CommandBus.ts`
- `micropolis/src/lib/micropolisCommands.ts`
- `micropolis/src/lib/CommandMcpService.ts`
- `micropolis/scripts/commands.ts`

CLI:

```bash
cd micropolis
npm run commands -- list
npm run commands -- preview city.generate-random --actor llm --reason "show a new terrain option"
npm run commands -- propose city.generate-random --actor llm --reason "student asked for a fresh city"
```

## Next

The next important step is persistence for proposals and logs:

- `.micropolis/command-proposals.json`
- `.moollm/session-log.md` integration
- command history suitable for replay and undo

After that, pie menus and chat commands should consume command metadata directly.
