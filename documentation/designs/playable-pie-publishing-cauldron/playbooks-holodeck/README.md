# Playbook hub — Holodeck cutover (batch 2, skeleton)

One landable PR per playbook (same 11-section empathic template as batch 1).
**Atlas:** [../HOLODECK-CUTOVER-ATLAS.md](../HOLODECK-CUTOVER-ATLAS.md).
**Conventions:** [../wisdom/executor-conventions.md](../wisdom/executor-conventions.md).
**Anchors:** [../wisdom/code-anchors.md](../wisdom/code-anchors.md).

> **🟡 Skeleton status.** These are scoped intents with step **outlines** and **open questions**,
> not literal edits. **Do not execute** until: (1) batch 1 is ✅ ([../playbooks/README.md](../playbooks/README.md)),
> and (2) the atlas open questions OQ-1..OQ-6 are resolved during STIR and each HB is expanded to
> literal steps. An expanded HB drops the "skeleton" banner and gets `[AUTO]`/`[HUMAN]` step tags.

> **Greenfield rule.** Everything here targets **software + WebGPU only**. Never extend the frozen
> `WebGLTileRenderer` ([§1.1](../../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional)).

## Dispatch order

| HB | Title | Risk | Status |
|----|-------|------|--------|
| [HB-01](HB-01-micropolis-map-plugin.md) | `MicropolisMapPlugin` — WebGPU map pass | 🟡 med | ⏸️ gated on batch 1 ✅ |
| [HB-02](HB-02-tileview-holodeck-toggle.md) | `TileView` toggle → `HolodeckStage` (WebGL fallback) | 🟡 med | ⏸️ HB-01 |
| [HB-03](HB-03-editing-tool-cursor-plugin.md) | `EditingToolCursorPlugin` + `CursorLayer` webgpu/both | 🟡 med | ⏸️ HB-02 |
| [HB-04](HB-04-measure-driven-dom-chrome.md) | Measure-driven DOM chrome (retire `domFrameRects`) | 🟡 med | ⏸️ HB-03 |
| [HB-05](HB-05-pick-buffer-query-tool.md) | Pick buffer → Query tool | 🟡 low-med | ⏸️ HB-02 |
| [HB-06](HB-06-parity-and-retire-webgl-bridge.md) | Parity gate + retire WebGL bridge | 🟡 high | ⏸️ HB-01..05 |

HB-05 is parallel to HB-03/04 (both only need HB-02).

## Dependency graph

```
batch 1 ✅
   │
   ▼
HB-01 ──► HB-02 ──┬──► HB-03 ──► HB-04 ──┐
                  └──► HB-05 ────────────┼──► HB-06 (parity + retire WebGL)
                                         │
                          (HB-04 + HB-05)┘
```

## Status legend

- 🟡 skeleton — intent + outline captured; not executable until expanded
- ⏸️ gated — named predecessor must be ✅
- 🟢 ready / 🔄 in progress / ✅ shipped (set when expanded + landed)

## From skeleton → executable (the LADLE step for batch 2)

For each HB, before an executor touches code:

1. Resolve the relevant **atlas open question(s)** (OQ-1..OQ-6) — record the decision in the HB.
2. Replace the **Steps outline** with literal `[AUTO]`/`[HUMAN]` steps + inline `Verify` greps,
   re-anchored against current code (update [../wisdom/code-anchors.md](../wisdom/code-anchors.md)).
3. Define the **parity oracle** (HB-06 OQ-6) if the HB claims pixel/UX parity.
4. Drop the skeleton banner; set status 🟢 in this table.

## After batch 2

Sprite compositor (software + WebGPU), MOP overlays, pointer cursors, then vote preview (§5) and
the pie substrate. Track in [../GATHERING.md](../GATHERING.md) and
[../../renderer-plugin-roadmap.md](../../renderer-plugin-roadmap.md).
