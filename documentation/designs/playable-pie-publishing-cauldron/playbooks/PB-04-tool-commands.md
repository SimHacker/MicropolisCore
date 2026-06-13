# PB-04 — Tool commands on CommandBus

## Navigation

- **Preceded by:** none logically — but refactors `applyToolAt` in `TileView.svelte`, **also edited
  by [PB-01](PB-01-viewport-tile-frame-helper.md)** (`getMapViewport`); run PB-01 first
  ([hub § Shared files](README.md#shared-files-read-before-parallelizing)).
- **Unlocks:** [PB-05](PB-05-vertical-slice-verify.md); future pie menu (`context: ['pie-menu']`).
- **Related:** [PB-02](PB-02-mount-cursor-layer.md) (no shared files).
- **Design source:**
  [micropolis-playable-game-readiness §6 B6](../../micropolis-playable-game-readiness.md#phase-b--core-interaction-loop-23-days),
  [GATHERING.md B.1.1](../GATHERING.md#b1-already-resolved-kept-for-audit) (toolbar first; pie later).

## Scope

Register **`tool.select-*`** (one per `GAME_TOOLS` entry, with a letter shortcut) and
**`tool.apply-at-cursor`** on the CommandBus so keyboard, the pie menu (later), LLM, MCP, and
scripts can drive the same tools as `Toolbar.svelte` without duplicating logic. A shared
`applyToolAtTile` helper becomes the single source of truth for "apply a tool at a tile"
(TileView click + command both call it).

**Keyboard letter shortcuts ARE in scope** now that the a–z `city.load-by-letter` interception
was removed (2026-06-13) — see [Step 4](#step-4--auto-wire-tool-letter-shortcuts).

## Risk profile

🟢 **low.** Adds commands + one helper; toolbar and click-to-build keep working unchanged.

**Collect upfront:** none.

## Prerequisites

- `ToolState.svelte.ts`, `gameTools.ts`, and `TileView.applyToolAt` exist (already shipped —
  see [code-anchors § anchor-tools](../wisdom/code-anchors.md#anchor-tools) and
  [§ anchor-tileview](../wisdom/code-anchors.md#anchor-tileview)).

## Context

Verified symbols: [code-anchors § anchor-commandbus](../wisdom/code-anchors.md#anchor-commandbus),
[§ anchor-tools](../wisdom/code-anchors.md#anchor-tools),
[§ anchor-reactive](../wisdom/code-anchors.md#anchor-reactive).

Key facts (do not re-derive):

1. CommandBus API is **`commandBus.dispatch(id, context)`** — there is **no** `run` method.
2. Registration pattern: copy `sim.set-speed-*` (the `.map(...)` spread) in
   `micropolisCommands.ts`; commands are added via `commandBus.registerAll(...)` inside
   `registerMicropolisCommands()`.
3. `dispatch` returns `{ handled: false }` when a command's `enabled` returns false — so
   **`tool.select-*` must NOT gate on `hasSimulator`** (selecting a tool is pure UI state and
   must work before the engine finishes loading and in unit tests).
4. Toolbar already calls `toolState.setActiveTool(id)`; commands call the same.
5. Letter keys are free for shortcuts (a–z interception removed). `dispatchShortcut` matches the
   **exact** normalized key and `normalizeShortcut` is case-sensitive for single chars — register
   the **lowercase** shortcut so an unshifted keypress (`event.key === 'r'`) matches. See
   [code-anchors § anchor-commandbus](../wisdom/code-anchors.md#anchor-commandbus).

Orientation greps:

```bash
grep -n "sim.set-speed-" apps/micropolis/src/lib/micropolisCommands.ts
grep -n 'GAME_TOOLS' apps/micropolis/src/lib/gameTools.ts
grep -n 'applyToolAt' apps/micropolis/src/lib/TileView.svelte
```

## Files affected

**Created:**

- `apps/micropolis/src/lib/toolApply.ts` — shared `applyToolAtTile` helper (Step 1).
- `apps/micropolis/src/lib/micropolisCommands.tool.test.ts` — unit tests (Step 5).

**Modified:**

- `apps/micropolis/src/lib/micropolisCommands.ts` — `tool.select-*` + `tool.apply-at-cursor` (Steps 2–3).
- `apps/micropolis/src/lib/TileView.svelte` — `applyToolAt` calls the shared helper (Step 1).
  **Also edited by PB-01** (`getMapViewport`); run PB-01 first.

The shared helper (created in Step 1):

```typescript
// apps/micropolis/src/lib/toolApply.ts
import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
import { resolveEditingTool } from '$lib/gameTools';
import type { ToolId } from '$lib/gameTools';
import type { MicropolisSimulator } from '$lib/MicropolisSimulator';

export function applyToolAtTile(
  simulator: MicropolisSimulator,
  toolId: ToolId,
  tx: number,
  ty: number
): void {
  const eng = simulator.micropolisengine;
  if (!eng) return;
  const tool = resolveEditingTool(eng, toolId);
  micropolisReactive.poke.doTool(tool, tx, ty);
  simulator.render();
}
```

Refactor `TileView.applyToolAt` to call this helper (single source of truth).

## Steps

### Step 1 — `[AUTO]` Create `toolApply.ts` and refactor TileView

1. Create `apps/micropolis/src/lib/toolApply.ts` as above (include `toolResultMessage` if you
   want feedback in `toolState.lastToolFeedback` — copy from TileView or export shared).

2. In `TileView.svelte`, replace `applyToolAt` body with:

```typescript
import { applyToolAtTile } from '$lib/toolApply';

function applyToolAt(tx: number, ty: number): void {
  if (!micropolisSimulator) return;
  applyToolAtTile(micropolisSimulator, toolState.activeToolId, tx, ty);
  // keep toolResultMessage feedback if not moved into toolApply.ts
}
```

**Verify:**

```bash
test -f apps/micropolis/src/lib/toolApply.ts && grep -n 'applyToolAtTile' apps/micropolis/src/lib/toolApply.ts
```

### Step 2 — `[AUTO]` Add tool.select-* commands

In `micropolisCommands.ts`, import:

```typescript
import { GAME_TOOLS, type ToolId } from '$lib/gameTools';
import { toolState } from '$lib/ToolState.svelte';
```

Inside `createMicropolisCommands()` return array, add one command per tool. **Do not** set
`enabled: hasSimulator` (see Context fact 3). Set the **lowercase** shortcut so an unshifted
letter press matches (Context fact 5); the toolbar still shows the uppercase label:

```typescript
...GAME_TOOLS.map((tool): Command<MicropolisCommandContext> => ({
  id: `tool.select-${tool.id}`,
  label: tool.label,
  icon: 'tool',
  context: ['view', 'keyboard', 'pie-menu', 'chat', 'llm'],
  shortcut: tool.shortcut.toLowerCase(),
  policy: { risk: 'safe', allowLLM: true },
  preview: () => ({ label: `Select ${tool.label} tool` }),
  run: () => {
    toolState.setActiveTool(tool.id);
  },
})),
```

**Verify:**

```bash
grep -c "id: \`tool.select-" apps/micropolis/src/lib/micropolisCommands.ts
# Expected: 1 (the single templated entry; expands to 9 at runtime)
```

### Step 3 — `[AUTO]` Add tool.apply-at-cursor command

Add command (requires hover tile):

```typescript
{
  id: 'tool.apply-at-cursor',
  label: 'Apply tool at cursor tile',
  icon: 'tool',
  context: ['simulator', 'keyboard', 'pie-menu', 'chat', 'llm'],
  policy: { risk: 'safe', allowLLM: true },
  enabled: (ctx) => hasSimulator(ctx) && toolState.hoverTile !== null,
  preview: () => {
    const t = toolState.hoverTile;
    return {
      label: t
        ? `Apply ${toolState.activeToolId} at (${t[0]}, ${t[1]})`
        : 'Move cursor over map first',
    };
  },
  run: ({ simulator }) => {
    const t = toolState.hoverTile;
    if (!simulator || !t) return;
    applyToolAtTile(simulator, toolState.activeToolId, t[0], t[1]);
  },
},
```

Import `applyToolAtTile` from `$lib/toolApply`.

**Verify:**

```bash
grep -n 'tool.apply-at-cursor' apps/micropolis/src/lib/micropolisCommands.ts
```

### Step 4 — `[AUTO]` Wire tool letter shortcuts

The a–z `city.load-by-letter` interception in `TileView.onkeydown` was **removed**, so unshifted
letter keys now fall through to `commandBus.dispatchShortcut(...)` (the `switch` default case in
`onkeydown`). Because Step 2 registered each `tool.select-*` with its **lowercase** shortcut, no
TileView edit is needed — the keys route automatically.

Confirm the default-case dispatch still exists (do not edit it):

```bash
grep -n 'dispatchShortcut(shortcutFromKeyboardEvent' apps/micropolis/src/lib/TileView.svelte
```

**Expected:** the `default:` branch of `onkeydown` calls `dispatchShortcut(...)` (present today).
Confirm the a–z block is gone:

```bash
grep -n 'load city by first letter\|city.load-by-letter' apps/micropolis/src/lib/TileView.svelte
# Expected: no matches
```

### Step 5 — `[AUTO]` Unit tests (dispatch + shortcut)

Create `apps/micropolis/src/lib/micropolisCommands.tool.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { commandBus } from './CommandBus';
import { registerMicropolisCommands } from './micropolisCommands';
import { toolState } from './ToolState.svelte';

describe('tool selection commands', () => {
  beforeEach(() => registerMicropolisCommands());

  it('tool.select-road sets the active tool (no simulator required)', async () => {
    toolState.setActiveTool('query');
    const result = await commandBus.dispatch('tool.select-road', { source: 'script' });
    expect(result.handled).not.toBe(false);
    expect(toolState.activeToolId).toBe('road');
  });

  it('the road letter shortcut selects the road tool', async () => {
    toolState.setActiveTool('query');
    await commandBus.dispatchShortcut('r', { source: 'keyboard' });
    expect(toolState.activeToolId).toBe('road');
  });
});
```

The first test passes **no** `simulator`, proving select commands are not gated on `hasSimulator`.
The second proves the lowercase shortcut routes through `dispatchShortcut`. Both use the verified
API (`dispatch` / `dispatchShortcut` — there is no `run`).

**Verify:**

```bash
cd apps/micropolis && pnpm test micropolisCommands.tool.test.ts 2>&1 | tail -15
```

### Step 6 — `[AUTO]` Typecheck

```bash
cd apps/micropolis && pnpm check
```

## Verification

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore/apps/micropolis
pnpm check
pnpm test
# Confirm the templated select block + apply command exist:
grep -n "tool.select-\|tool.apply-at-cursor" apps/micropolis/src/lib/micropolisCommands.ts
```

**Expected:** check + tests green; greps show the `tool.select-` template and `tool.apply-at-cursor`.

## Rollback

Revert `micropolisCommands.ts` and `TileView.svelte`; delete `toolApply.ts` and
`micropolisCommands.tool.test.ts`. (TileView's original inline `applyToolAt` is restored by the revert.)

## Success criteria

- `tool.select-*` registered for every `GAME_TOOLS` entry (9), **not** gated on `hasSimulator`,
  callable via `commandBus.dispatch('tool.select-road', …)`.
- Each `tool.select-*` carries its lowercase letter shortcut; pressing the key selects the tool
  (a–z interception already removed — no `TileView.onkeydown` edit needed).
- `tool.apply-at-cursor` registered; enabled only when a simulator is present **and** `hoverTile` is set.
- `applyToolAtTile` is the single apply path (TileView click + command both call it).
- Tests/check pass.

## See also

- [code-anchors § anchor-commandbus](../wisdom/code-anchors.md#anchor-commandbus) — dispatch API + shortcut rules.
- [piecraft/PIE-MENU-MODEL.md](../../piecraft/PIE-MENU-MODEL.md) — future pie consumes the same `tool.*` commands.
- Future: a real **city browser/previewer** replaces the retired a–z cycler — see [../DOING.md](../DOING.md).
