# Playbook hub — Playable vertical slice (batch 1)

One landable PR per playbook. Empathic-template shape (11 sections).
**Atlas:** [../PLAYABLE-SLICE-ATLAS.md](../PLAYABLE-SLICE-ATLAS.md).
**Conventions:** [../wisdom/executor-conventions.md](../wisdom/executor-conventions.md).

> **Reading guide (LLM executors):** Read **Risk profile** → **Prerequisites** → **Context**
> → **Steps** in order. If any step Verify fails, **stop** — use **Rollback**; do not improvise.

> **Progress (required):** update [../PROGRESS.yml](../PROGRESS.yml) after each verified step.

## Dispatch order

| PB | Title | Risk | Status |
|----|-------|------|--------|
| [PB-01](PB-01-viewport-tile-frame-helper.md) | Viewport tile-frame helper + `TileView.getMapViewport()` | 🟢 low | 🟢 ready |
| [PB-02](PB-02-mount-cursor-layer.md) | Mount `CursorLayer` + DOM tool frame on map | 🟢 low | ⏸️ needs PB-01 code |
| [PB-03](PB-03-budget-modal.md) | `BudgetModal.svelte` + `doBudget()` lifecycle | 🟢 low | 🟢 ready (shares MicropolisView with PB-02) |
| [PB-04](PB-04-tool-commands.md) | Tool select/apply commands on CommandBus | 🟢 low | 🟢 ready (shares TileView with PB-01) |
| [PB-05](PB-05-vertical-slice-verify.md) | Definition-of-done + readiness doc refresh | 🟢 low | ⏸️ gated on PB-01..04 |

**Recommended for a single worker: execute strictly in order PB-01 → PB-02 → PB-03 → PB-04 → PB-05.**
That guarantees zero merge friction. Logical dependencies are looser (see graph), but several PBs
edit the **same files in disjoint regions** — sequential is the safe default. See
[§ Shared files](#shared-files-read-before-parallelizing) before attempting any parallelism.

## Dependency graph

`A → B` = B needs A's code. Dotted = shares a file with A (disjoint edit; sequence to avoid rebase).

```
PB-01 (viewportTileFrame.ts + TileView.getMapViewport)
   │  └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ shares TileView.svelte ┄┄► PB-04
   ▼
PB-02 (CursorLayer mount in MicropolisView)   needs ScreenRect + getMapViewport
   ┊
   ┊┄┄ shares MicropolisView.svelte ┄┄► PB-03 (BudgetModal mount in MicropolisView)
   │
PB-03, PB-04 ──────────────────────────────► PB-05 (verify + doc refresh; needs all)
```

## Shared files (read before parallelizing)

A worker LLM running these **in order** never sees a conflict. If you must parallelize, know that
these files are touched by two PBs each (always in **different functions/regions**, so a later PB
will find the earlier PB's additions already present — that is expected, not a conflict):

| File | PBs | Disjoint regions |
|------|-----|------------------|
| `apps/micropolis/src/lib/TileView.svelte` | PB-01, PB-04 | PB-01 adds `getMapViewport()`; PB-04 refactors `applyToolAt()` |
| `apps/micropolis/src/lib/MicropolisView.svelte` | PB-02, PB-03 | PB-02 mounts `<CursorLayer>`; PB-03 mounts `<BudgetModal>` |

New files (no overlap): `viewportTileFrame.ts` (PB-01), `toolApply.ts` + `micropolisCommands.tool.test.ts` (PB-04), `BudgetModal.svelte` (PB-03).

## Status legend

- 🟢 ready — can start now
- ⏸️ gated — named predecessor must be ✅
- ✅ shipped
- 🔄 in progress

## Template (every playbook)

1. Navigation — Preceded-by / Unlocks / Related / Design source
2. Scope — one paragraph
3. Risk profile — 🟢/🟡/🔴 + upfront parameters
4. Prerequisites
5. Context — links to design docs
6. Files affected
7. Steps — `[AUTO]`/`[CONFIRM]`/`[HUMAN]` + inline Verify
8. Verification — end-of-PR
9. Rollback
10. Success criteria
11. See also

## Human-in-the-loop (Micropolis)

| Tag | When |
|-----|------|
| `[AUTO]` | Code + unit tests + `pnpm check` |
| `[CONFIRM]` | Deploy to micropolisweb.com (manual GitHub Action only — never in batch 1) |
| `[HUMAN]` | Browser smoke on `/play/micropolis` (PB-05) |

## After batch 1

Next ladle (not in this hub yet): holodeck map plugin, WebGPU cursor backend, pie substrate
from [GATHERING.md](../GATHERING.md). Keep STIR on three-pillar monolith until playable ✅.
