# HB-06 — Parity gate + retire WebGL bridge

> **🟡 Skeleton.** Outline + open questions. The **gate** that flips holodeck to default and
> removes the frozen WebGL bridge from the app. Do not execute until HB-01..05 ✅ and OQ-6 resolved.

## Navigation

- **Preceded by:** [HB-01](HB-01-micropolis-map-plugin.md), [HB-02](HB-02-tileview-holodeck-toggle.md),
  [HB-03](HB-03-editing-tool-cursor-plugin.md), [HB-04](HB-04-measure-driven-dom-chrome.md),
  [HB-05](HB-05-pick-buffer-query-tool.md).
- **Unlocks:** sprite compositor, MOP overlays, vote preview (§5) on a single greenfield path.
- **Related:** [map-compositing §1.1](../../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional) (WebGL policy).
- **Design source:**
  [map-compositing §1.1](../../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional),
  [renderer-plugin-roadmap § TODO 7–8](../../renderer-plugin-roadmap.md#todo-ordered).

## Scope

Prove **pixel + UX parity** between the holodeck path and the WebGL bridge (and software), flip the
`TileView` default backend to `holodeck`, and **remove the `WebGLTileRenderer` instantiation from
the app** (`TileView`). The frozen class may remain in `@micropolis/tile-renderer` (opt-in only)
or be deleted entirely once nothing references it — that call is part of this PB.

## Risk profile

🔴/🟡 **high → medium.** This is the irreversible-feeling cutover. Mitigation: it lands **only**
after the parity oracle (OQ-6) is green; rollback is flipping the default back to `webgl` (kept
opt-in for one release). Do **not** delete the WebGL class in the same PR that flips the default —
flip first, soak, delete in a follow-up.

**Collect upfront:** OQ-6 parity definition + fixtures + tolerance; soak duration; whether to delete
or merely unwire `WebGLTileRenderer`.

## Prerequisites

- HB-01..05 all ✅.
- Software raster aligned with the map plugin (HB-01) for the parity oracle.

## Context

- Default `createMapTileRenderer` chain is already `['webgpu','canvas']`; the **app** is the last
  place hard-using the WebGL bridge ([code-anchors § anchor-tile-renderer](../wisdom/code-anchors.md#anchor-tile-renderer),
  [§ anchor-tileview](../wisdom/code-anchors.md#anchor-tileview)).
- Greenfield policy: WebGL is frozen, off the default chain; a clean-slate WebGL rewrite is a
  separate optional future ([§1.1](../../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional)).

## Steps (outline — expand at LADLE)

1. **Define the parity oracle (OQ-6):** fixed cities + camera, render via software / WebGPU
   (/ WebGL), compare with a pixel-diff tolerance; list allowed differences.
2. Run parity; fix divergences in the **plugin/software** path (never by patching WebGL).
3. Flip `TileView` default backend `webgl → holodeck`; keep `?renderer=webgl` opt-in for one release.
4. Soak; gather UX confirmation (play session checklist mirroring [PB-05](../playbooks/PB-05-vertical-slice-verify.md)).
5. Follow-up PB: remove `WebGLTileRenderer` usage from the app; decide delete vs keep opt-in.

## Verification (shape)

- Parity oracle green within tolerance on the fixture set.
- Default `/play/micropolis` uses holodeck; `?renderer=webgl` still works for one release.
- Full playable definition-of-done ([PB-05 §7](../../micropolis-playable-game-readiness.md#7-definition-of-done-vertical-slice)) passes on holodeck.

## Rollback

Flip default back to `webgl` (kept opt-in). Because the class isn't deleted in this PB, rollback is
a one-line default change.

## Success criteria

- Holodeck is the default interactive renderer; playable DoD passes on it.
- WebGL bridge no longer on the default app path; parity documented.
- Greenfield features (sprites, overlays, GPU cursors, vote preview) now build on one path.

## Open questions

- **OQ-6** parity oracle (fixtures, tolerance, allowed diffs).
- Delete `WebGLTileRenderer` or keep as opt-in legacy? (Default: keep opt-in one release, then delete.)
- Soak length + sign-off owner.

## See also

- [map-compositing §1.1](../../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional) — frozen-WebGL + clean-slate-later policy.
- [HOLODECK-CUTOVER-ATLAS.md](../HOLODECK-CUTOVER-ATLAS.md) — batch overview + open questions.
- After this: sprite compositor + vote preview (§5) ladles.
