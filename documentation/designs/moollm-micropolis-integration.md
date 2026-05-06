# MOOLLM and Micropolis Integration

## Thesis

MicropolisCore provides the microworld. MOOLLM provides the agent society around it.

The goal is not "AI plays SimCity for you." The goal is a constructionist environment where humans and AI tutors share a world, propose actions, explain consequences, debate values, and leave durable artifacts.

## Layer Model

```text
MicropolisEngine (C++/WASM)
  simulation, maps, tools, scenarios

SvelteKit/MOOCO
  UI, multiplayer sessions, command bus, MCP service

Git Branch Object Store
  MICROPOLIS.yml, plural namespaces, cities/, macros/, blueprints/, tools/, issues/

City Directories
  CITY.yml, classic save payloads, layers, timeline, dialogs

MOOLLM Skills
  tutors, procedures, protocols, experiments, explanations
```

## Users and Agents on Common Ground

DreamScape's principle applies directly:

> Users and agents operate in the same environment.

In Micropolis:

- A human can propose a road.
- An AI tutor can propose a tax change.
- A teacher can approve or reject.
- A class can vote.
- The command bus executes.
- The timeline records.
- Git preserves.

The AI is not outside the world narrating from nowhere. It is a participant with scoped permissions.

## Skills as Capabilities

Micropolis should factor capabilities into MOOLLM skills:

- `micropolis`: engine and save-file interface.
- `micropolis-command-bus`: live commands and proposals.
- `micropolis-save-format`: classic and extended save/package format.
- `micropolis-overlays`: computed layers, legends, dynamic zone finder.
- `micropolis-experiments`: batch simulation, replay, evaluation.
- `micropolis-github-multiverse`: branch/PR/issue workflows.
- `micropolis-ui-workspace`: tabs, stacks, cards, spatial outlines.
- `micropolis-ai-tutors`: character roles and teaching protocols.

Each skill can own:

- Its own CLI tools.
- Its own TypeScript modules.
- Its own data formats.
- Its own MCP service.
- Its own CARD/GLANCE/SKILL docs.

The parent `micropolis` skill should route, not hoard.

## AI Tutor Roles

Initial tutor characters:

- Mayor's Advisor: pragmatic guidance.
- Economist: taxes, cash flow, budget.
- Urban Planner: zoning, traffic, infrastructure.
- Environmentalist: pollution, long-term health.
- Historian: real-world analogies.
- Reporter: turns events into public stories.
- Debugger/God: opens the simulator for advanced users.

Each tutor should be a MOOLLM character object with:

- `CHARACTER.yml`
- `CARD.yml`
- advertised actions
- permissions
- memory/provenance policy

## Action Flow

All AI-originated mutations should follow:

```text
Observe -> Explain -> Preview -> Propose -> Approve -> Execute -> Log
```

Concrete path:

1. Tutor observes city state or exported analysis.
2. Tutor explains concern.
3. Tutor previews command effect.
4. Tutor proposes command through command bus.
5. Human or policy approves.
6. Command bus executes.
7. Command record enters timeline.
8. Git commit persists effect.
9. Sidecar later attributes commands to commit id.

## Speed-of-Light Committees

For some decisions, use MOOLLM's speed-of-light approach:

- Economist and environmentalist debate a coal plant.
- Planner and reporter debate an airport.
- Historian contextualizes a policy.
- Mayor's advisor summarizes.

This should happen inside one LLM call when possible, so the committee shares context and does not lose precision across tool-call round trips.

The output should usually be a proposal, not an action.

## Command Bus as Gate

The command bus is the boundary between language and mutation.

LLMs may:

- list commands
- preview commands
- propose commands
- explain commands

LLMs should not directly mutate:

- simulator state
- save files
- Git branches
- workspace layout
- multiplayer decisions

unless policy explicitly allows it.

## MCP Role

MCP should export a narrow, auditable tool surface:

- list commands
- preview command
- propose command
- approve/reject proposal
- inspect city/layers
- run analysis/export

MCP should not become a backdoor around the command bus.

## Context Assembly

A MOOLLM/MOOCO orchestrator should assemble context by resolution:

1. `GLANCE.yml` for all relevant Micropolis skills.
2. `CARD.yml` for active capability surfaces.
3. `SKILL.md` only for the skill being implemented or invoked.
4. README/design docs only for deep rationale.

Useful hot context:

- Current city metadata.
- Active branch/universe id.
- Pending proposals.
- Recent command leaves.
- Current role/task preset.
- Relevant overlays.
- Tutor roster.

## GitHub Integration

MOOLLM characters should interact with GitHub through the `github` skill, not raw commands.

Use GitHub for:

- PRs as alternate-history proposals.
- Issues as class discussions.
- Comments as tutor/student debate.
- Branches as universes.
- Labels as phase/role/status.

## Event Logs

Events should be append-only where possible:

- Command proposals.
- Approvals/rejections.
- Executions.
- Tutor explanations.
- Votes.
- Branch creation.
- Replay runs.

Editable summaries can exist, but raw event logs should be reconstructable and auditable.

## Safety

Risks:

- AI tutor becomes too authoritative.
- Hidden mutation breaks trust.
- Generated explanations drift from simulator facts.
- GitHub operations affect real repos.
- Classroom privacy issues.

Mitigations:

- Explain-then-do.
- Approval gates.
- Command previews.
- Provenance links.
- Skill-snitch audits.
- School-owned repos.
- Role permissions.
- Reversible actions.

## Constructionist Framing

AI should help learners build and understand, not replace the learner's thinking.

Good AI behavior:

- Ask a question before acting.
- Show evidence.
- Offer alternatives.
- Invite the student to branch and test.
- Explain tradeoffs.
- Encourage reflection.

Bad AI behavior:

- "I fixed your city."
- Silent optimization.
- Hiding uncertainty.
- Overriding the player's goals.
- Treating one score as the only value.

## Implementation Rule

If the AI wants to change the world, it must create an inspectable object:

- command proposal
- issue/comment
- branch
- annotation
- report
- experiment
- tutor message

No ghost actions.
