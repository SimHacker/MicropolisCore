# Playable vertical slice — design atlas (batch 1)

> **Living atlas for the first ladle only.** Executive summary + audit of what shipped +
> cross-references into playbooks. **Read this for WHY and status**; read
> [playbooks/](playbooks/) for **WHAT to ship in each PR**.
>
> Full three-pillar vision (pie substrate, publishing) stays in
> [GATHERING.md](GATHERING.md) — still STIR phase; do not runbook from it yet.

## TL;DR

Turn `/play/micropolis` into a **playable city builder** on the existing WebGL map:
sim runs on load, HUD + toolbar, click-to-build, query/messages/budget feedback.
**Holodeck, vote preview, pie substrate, publishing** are explicitly **after** this slice.

Ground truth: [../micropolis-playable-game-readiness.md](../micropolis-playable-game-readiness.md).

## Executive overview

**Problem.** WASM engine + reactive bridge + WebGL map exist; chrome was missing.

**Plan.** Phases A–C from the readiness doc — smallest path to “load city → sim runs →
pick tool → click map → see funds/messages/query.” Toolbar first (not pie); command-bus
seam for later pie menus (`context: ['pie-menu']`).

**Status (2026-06-12 audit).** Most of A–C is **already landed** in `apps/micropolis/`.
Remaining gap work is **CursorLayer wiring + viewport clip**, **BudgetModal**,
**tool commands on the bus**, and a **definition-of-done verification pass**.

## Shipped vs remaining

| Readiness item | Status | Notes |
|----------------|--------|-------|
| A1 Auto-start sim speed 3 | ✅ | `getSharedSimulator()` → `setGameSpeed(3)`, `setPaused(false)` |
| A2 `GameHud.svelte` | ✅ | Funds, date, demand, tax, pause/speed |
| A3 HUD bound to reactive | ✅ | `$derived` from `micropolisReactive` |
| A4 Map revision render | ⚠️ | Tick-driven render; optional `$effect` on `mapRevision` |
| B1 `ToolState.svelte.ts` | ✅ | |
| B2 Pan vs build | ✅ | Middle/right/Shift+drag pan; left-click tool |
| B3 `poke.doTool` on click | ✅ | `TileView.svelte` |
| B4 `CursorLayer` mounted | ❌ | Component exists; not in `MicropolisView`; DOM frame TODO |
| B5 `Toolbar.svelte` | ✅ | |
| B6 Tool commands on bus | ❌ | `micropolisCommands.ts` has sim/view only |
| C1 `MessageOverlay` | ✅ | |
| C2 `ZoneStatusPanel` | ✅ | |
| C3 `BudgetModal` | ❌ | `budgetModalRequested` wired in reactive; no UI |
| C4 `autoGoto` pan | ✅ | `registerMapPan` in `TileView` |
| C5 Dev disaster commands | ❌ | **None exist** — only sim/city/tax/heat/tile-set commands today. Engine has `makeEarthquake/Fire/Flood/Meltdown`; not wrapped. **Optional dev tooling, not a DoD blocker** — deferred. |

Verified symbol/path table for all the above: [wisdom/code-anchors.md](wisdom/code-anchors.md).

## Playbook batch 1 (remaining)

| PB | Title | Risk |
|----|-------|------|
| [PB-01](playbooks/PB-01-viewport-tile-frame-helper.md) | Viewport tile-frame helper + TileView export | 🟢 |
| [PB-02](playbooks/PB-02-mount-cursor-layer.md) | Mount `CursorLayer` + DOM tool frame | 🟢 |
| [PB-03](playbooks/PB-03-budget-modal.md) | `BudgetModal.svelte` + `doBudget()` lifecycle | 🟢 |
| [PB-04](playbooks/PB-04-tool-commands.md) | Tool select/apply on CommandBus | 🟢 |
| [PB-05](playbooks/PB-05-vertical-slice-verify.md) | Definition-of-done + doc refresh | 🟢 |

**Hub:** [playbooks/README.md](playbooks/README.md) · **Conventions:** [wisdom/executor-conventions.md](wisdom/executor-conventions.md) · **Anchors:** [wisdom/code-anchors.md](wisdom/code-anchors.md)

**Next batch (skeleton, gated on this one):** holodeck cutover —
[HOLODECK-CUTOVER-ATLAS.md](HOLODECK-CUTOVER-ATLAS.md) + [playbooks-holodeck/](playbooks-holodeck/).
Pie substrate + publishing stay in [GATHERING.md](GATHERING.md) (STIR).

## Operational discipline (Micropolis)

Adapted from [central pipeline-optimization playbooks](https://github.com/leela-ai/central/tree/main/skills/gcs/protocols/pipeline-optimization/playbooks):

| Convention | Micropolis rule |
|------------|-----------------|
| **Step tags** | `[AUTO]` / `[CONFIRM]` / `[HUMAN]` — deploy to micropolisweb.com is always `[CONFIRM]` (manual workflow only) |
| **Single scope** | One playbook = one PR; playable slice does not touch holodeck plugins |
| **Bold cut** | No WebGL extensions for new features; greenfield = software + WebGPU later ([§1.1](../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional)) |
| **Execution platform** | `pnpm` in `apps/micropolis` + `packages/*`; `vitest` for unit tests |
| **Progress** | Update [PROGRESS.yml](PROGRESS.yml) per step |

## Atlas — topic → playbook → design source

| Topic | Design source | Playbook |
|-------|---------------|----------|
| Playable phases A–C | [micropolis-playable-game-readiness.md §6](../micropolis-playable-game-readiness.md#6-prioritized-plan--minimal-playable-vertical-slice) | PB-01..05 |
| CursorLayer coordinator | [virtual-cursor-layer.md §7.1](../virtual-cursor-layer.md), [map-compositing §3.2](../map-compositing-and-measurement.md#32-dom-vs-webgpu-split--cursorlayer-coordinates-both) | PB-01, PB-02 |
| Viewport without holodeck | [wisdom/cursor-layer-without-holodeck.md](wisdom/cursor-layer-without-holodeck.md) | PB-01 |
| Toolbar vs pie (resolved) | [GATHERING.md B.1.1](GATHERING.md#b1-already-resolved-kept-for-audit) | PB-04 |
| WebGL frozen bridge | [map-compositing §1.1](../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional) | (no PB — policy only) |
| Vote preview / holodeck | [map-compositing §5](../map-compositing-and-measurement.md#5-multiplayer-voting-preview-historical--target) | deferred post-PB-05 |
