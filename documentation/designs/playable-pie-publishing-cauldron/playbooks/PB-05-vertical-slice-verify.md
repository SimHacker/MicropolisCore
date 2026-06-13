# PB-05 — Vertical slice verify + readiness doc refresh

## Navigation

- **Preceded by:** [PB-01](PB-01-viewport-tile-frame-helper.md),
  [PB-02](PB-02-mount-cursor-layer.md),
  [PB-03](PB-03-budget-modal.md),
  [PB-04](PB-04-tool-commands.md).
- **Unlocks:** [batch 2 holodeck cutover](../HOLODECK-CUTOVER-ATLAS.md) (gated on this PB ✅); pie/publishing cauldron STIR continues.
- **Related:** [PLAYABLE-SLICE-ATLAS](../PLAYABLE-SLICE-ATLAS.md),
  [DOING.md](../DOING.md).
- **Design source:**
  [micropolis-playable-game-readiness §7](../../micropolis-playable-game-readiness.md#7-definition-of-done-vertical-slice).

## Scope

Run the definition-of-done checklist on `/play/micropolis`, fix any gaps found **only if they
block a checkbox**, update the readiness doc audit table, and mark batch 1 playbooks ✅ in
`playbooks/README.md`.

## Risk profile

🟢 **low** for verification; 🟡 if gaps require unplanned code — **stop and spawn a new PB**
instead of expanding scope here.

**Collect upfront:**

- Confirm PB-01..04 merged to the branch under test.

## Prerequisites

- PB-01, PB-02, PB-03, PB-04 all ✅.

## Context

Definition of done ([readiness §7](../../micropolis-playable-game-readiness.md#7-definition-of-done-vertical-slice)):

- [ ] City loads and sim runs without pressing a number key
- [ ] User selects Road/Bulldoze/Zone/Query from visible UI
- [ ] Left-click places tool; funds decrease; map updates
- [ ] HUD shows funds, date, demand changing over time
- [ ] Query click shows zone stats panel
- [ ] Engine message (e.g. tornado) appears as on-screen toast
- [ ] Pan/zoom still works alongside tools

## Files affected

**Modified (docs only unless gap fix required):**

- `documentation/designs/micropolis-playable-game-readiness.md` — refresh §4/§6 status tables + §7 checkboxes
- `documentation/designs/playable-pie-publishing-cauldron/PLAYABLE-SLICE-ATLAS.md` — flip shipped/remaining rows
- `documentation/designs/playable-pie-publishing-cauldron/playbooks/README.md` — mark PB-01..05 ✅
- `documentation/designs/playable-pie-publishing-cauldron/PROGRESS.yml` — `batch_1_status: complete`
- `documentation/designs/playable-pie-publishing-cauldron/DOING.md` — move batch 1 to "were doing"; point "now" at batch 2

## Steps

### Step 1 — `[AUTO]` Automated gate

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore/apps/micropolis
pnpm check
pnpm test
```

**Expected:** all green. If red, **stop** — fix in the PB that owns the failure, not here.

### Step 2 — `[HUMAN]` Manual playable checklist

**Tell the human** to run dev server and check each item. Copy this table into the PR or
PROGRESS.yml notes:

| # | Check | From | Pass? | Notes |
|---|-------|------|-------|-------|
| 1 | Load `/play/micropolis` — sim runs without pressing 1–9 | (shipped) | | |
| 2 | Toolbar — select Road, Bulldoze, Residential, Query | (shipped) | | |
| 3 | Left-click road — map changes, funds decrease | (shipped) + PB-04 | | |
| 4 | HUD — funds/date/demand update over ~30s | (shipped) | | |
| 5 | Query tool — click zone — `ZoneStatusPanel` shows stats | (shipped) | | |
| 6 | Advisory toast appears during normal play (engine `sendMessage`, e.g. "more residential needed") — **no player disaster trigger exists yet**, so just let the sim run | (shipped) | | |
| 7 | Pan (middle/Shift+drag) + zoom wheel while a tool is selected | (shipped) | | |
| 8 | Hover — tile cursor frame follows the tile under the cursor | PB-02 | | |
| 9 | Press a tool letter (e.g. `r` road, `b` bulldoze, `q` query) — active tool changes | PB-04 | | |
| 10 | Budget modal: appears at the annual budget window when auto-budget is off; **Accept** closes it and continues the sim. If it won't trigger by play, confirm `BudgetModal` renders when `budgetModalRequested` is set (covered by PB-03's unit test) | PB-03 | | |

If any **required** row fails, file a new PB; do not silently expand PB-05. Row 6 (disasters as a
player action) and a real city browser are explicitly **out of scope** — see [../DOING.md](../DOING.md).

### Step 3 — `[AUTO]` Refresh readiness doc

In `documentation/designs/micropolis-playable-game-readiness.md`:

1. Update §4 "UI today vs stubs" table to reflect shipped components.
2. Add short **"Audit 2026-06-12"** note pointing to
   `playable-pie-publishing-cauldron/PLAYABLE-SLICE-ATLAS.md`.
3. Mark §7 checkboxes `[x]` for items human confirmed.

**Verify:**

```bash
grep -n 'Audit 2026-06' documentation/designs/micropolis-playable-game-readiness.md
```

### Step 4 — `[AUTO]` Mark playbooks shipped

In `playbooks/README.md`, set PB-01..05 status to ✅.

Update `PROGRESS.yml`:

```yaml
meta:
  updated: "<today>"
  batch_1_status: complete
```

Update [DOING.md](../DOING.md) — move batch 1 to "were doing"; set "now" to
[batch 2 holodeck cutover](../HOLODECK-CUTOVER-ATLAS.md) (resolve OQ-1..OQ-6, expand HB-01).

### Step 5 — `[AUTO]` Link from designs README (optional one line)

In `documentation/designs/README.md`, ensure cauldron entry mentions `playbooks/` hub exists.

## Verification

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore
grep -n '✅' documentation/designs/playable-pie-publishing-cauldron/playbooks/README.md | wc -l
# Expect >= 5 playbook rows marked shipped
```

Human sign-off recorded in PROGRESS.yml or PR description.

## Rollback

Doc-only changes: revert doc commits. Do not revert code if batch 1 code is good but checklist
failed — fix forward with new PB.

## Success criteria

- All §7 checklist items human-confirmed (or documented waivers with follow-up PB ids).
- `pnpm check` + `pnpm test` green.
- Readiness doc and atlas reflect reality.
- Batch 1 playbooks marked ✅.

## See also

- [HOLODECK-CUTOVER-ATLAS.md](../HOLODECK-CUTOVER-ATLAS.md) — batch 2 (holodeck cutover) starts here.
- [renderer-plugin-roadmap.md](../../renderer-plugin-roadmap.md) — Phase D holodeck.
- [map-compositing §4](../../map-compositing-and-measurement.md#4-implementation-order-updated) — post-playable order.
- [GATHERING.md](../GATHERING.md) — resume STIR for pie + publishing pillars.
