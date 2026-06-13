# DOING — playable vertical slice

**Companion:** [PROGRESS.yml](PROGRESS.yml) (machine log) · [PLAYABLE-SLICE-ATLAS.md](PLAYABLE-SLICE-ATLAS.md) (status + links)

**Updated:** 2026-06-12

---

## Cauldron K-line

| Phase | Status | Notes |
|-------|--------|-------|
| MELT | ✅ | `GATHERING.md` seeded |
| STIR | 🔄 | Three-pillar monolith still growing; **playable batch 1 ladled early** per README pre-scope |
| LADLE | 🔄 batch 1 | [playbooks/](playbooks/) PB-01..05 drafted for remaining vertical-slice gaps |
| ANCHOR | ✅ batch 1 | Symbols/paths verified 2026-06-12 → [wisdom/code-anchors.md](wisdom/code-anchors.md); re-grep line numbers at execution |
| LINK | 🔄 | Atlas + playbooks + anchors wired; readiness doc refresh happens in PB-05 |
| TASTE | pending | Manual `/play/micropolis` smoke (PB-05 Step 2) |
| SERVE | pending | Dispatch executors after PB-05 green |

**Not ladled yet:** pie substrate, publishing, holodeck migration, vote preview (§5).

---

## What we were doing (mostly done)

Phases A–C from [micropolis-playable-game-readiness.md](../micropolis-playable-game-readiness.md) —
HUD, toolbar, tool state, click-to-build, messages, zone query, autoGoto, auto-start sim.

---

## What we are doing now

Close the **definition-of-done** gaps (see atlas shipped table):

1. **PB-01** — Viewport helper + `TileView.getMapViewport()`
2. **PB-02** — Mount `CursorLayer` + DOM tile frame
3. **PB-03** — `BudgetModal.svelte`
4. **PB-04** — Tool commands on CommandBus
5. **PB-05** — Definition-of-done pass ([playbooks/PB-05-vertical-slice-verify.md](playbooks/PB-05-vertical-slice-verify.md))

---

## What we will do next (after playable)

| Track | Entry |
|-------|--------|
| **Holodeck map cutover (batch 2 skeleton)** | [HOLODECK-CUTOVER-ATLAS.md](HOLODECK-CUTOVER-ATLAS.md) + [playbooks-holodeck/](playbooks-holodeck/) |
| CursorLayer WebGPU backend | batch 2 [HB-03](playbooks-holodeck/HB-03-editing-tool-cursor-plugin.md) |
| Pie substrate ladle | Resume STIR on `GATHERING.md` §5+ |
| Vote preview | [map-compositing §5](../map-compositing-and-measurement.md#5-multiplayer-voting-preview-historical--target) (after holodeck) |

**City browser/previewer (future):** the whimsical a–z `city.load-by-letter` cycler was **removed
2026-06-13** (freeing letter keys for tool shortcuts in PB-04). Replace it later with a proper
city browser + previewer (thumbnails, search) — own ladle, not scheduled.

---

## How to pick up a playbook

Same shape as [central pipeline-optimization playbooks](https://github.com/leela-ai/central/blob/main/skills/gcs/protocols/pipeline-optimization/README.md#how-to-execute-a-playbook):

1. Read **Risk profile** + collect upfront params.
2. Confirm **Prerequisites** landed.
3. Run **Steps** in order; respect `[AUTO]` / `[CONFIRM]` / `[HUMAN]`.
4. Update **PROGRESS.yml** when each step verifies green.
5. Mark playbook ✅ in [playbooks/README.md](playbooks/README.md).
