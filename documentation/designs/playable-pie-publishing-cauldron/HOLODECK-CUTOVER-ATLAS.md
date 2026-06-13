# Holodeck cutover — design atlas (batch 2, skeleton)

> **Skeleton ladle.** Intent + scope + sequencing for moving the Micropolis map from the
> **frozen WebGL bridge** onto the **WebGPU `HolodeckStage`**, then turning on GPU cursors,
> measure-driven DOM chrome, and pick-based query. **Gated on batch 1 (playable slice) ✅.**
>
> Steps here are **outlines with open questions**, not literal edits — batch 2 stays 🟡 until
> the playable slice ships and we STIR these into full PR-ready playbooks. Read batch 1 first:
> [PLAYABLE-SLICE-ATLAS.md](PLAYABLE-SLICE-ATLAS.md).

## TL;DR

Replace `TileView`'s direct `WebGLTileRenderer` with a **`HolodeckStage` + `MicropolisMapPlugin`**
WebGPU path, behind a renderer toggle so the WebGL bridge stays as fallback until **pixel + UX
parity** is proven. Then light up the **`EditingToolCursorPlugin`** (GPU tool frame), switch
`CursorLayer` to `backend: 'both'`/`'webgpu'`, drive DOM chrome from the **measure protocol**
instead of PB-02's `domFrameRects`, and (optionally) use the **pick buffer** for the Query tool.

Ground truth designs:
[renderer-plugin-roadmap.md § TODO](../renderer-plugin-roadmap.md#todo-ordered) ·
[unified-webgpu-renderer.md](../unified-webgpu-renderer.md) ·
[map-compositing-and-measurement.md §4](../map-compositing-and-measurement.md#4-implementation-order-updated).

## Why this is its own batch

Batch 1 deliberately shipped on WebGL ([§1.1 frozen bridge](../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional)).
Holodeck is the **greenfield** rasterizer where all new features live (sprites, MOP overlays,
GPU cursors, vote preview). It must not block playability — so it is sequenced **after** the
definition-of-done passes ([PB-05](playbooks/PB-05-vertical-slice-verify.md)).

## Architecture target

```text
  apps/micropolis
    MicropolisView.svelte
      └─ TileView.svelte  ──(toggle)──┐
            backend: 'webgl'  (frozen bridge, fallback)
            backend: 'holodeck' ──────┘
                 │
                 ▼
   HolodeckStage (@micropolis/render-core/webgpu)
     baseLayer / plugins sorted by HolodeckLayer:
       MICROPOLIS_MAP   (40)  ← MicropolisMapPlugin      (HB-01)
       MICROPOLIS_SPRITE(45)  ← later (sprite compositor)
       EDITING_TOOL_CURSOR(71)← EditingToolCursorPlugin  (HB-03)
       POINTER_CURSORS  (115) ← later
     measureRead/Write/Patch  ← createMeasureStore       (HB-04)
     pick MRT (MICROPOLIS_CELL)← Query tool              (HB-05)
```

Verified holodeck/stage symbols: [wisdom/code-anchors.md § anchor-holodeck](wisdom/code-anchors.md#anchor-holodeck).

## Playbook batch 2 (skeleton)

| HB | Title | Risk | Gated on |
|----|-------|------|----------|
| [HB-01](playbooks-holodeck/HB-01-micropolis-map-plugin.md) | `MicropolisMapPlugin` — WebGPU map pass (absorb `WebGPUTileRenderer`) | 🟡 med | batch 1 ✅ |
| [HB-02](playbooks-holodeck/HB-02-tileview-holodeck-toggle.md) | `TileView` renderer toggle → mount `HolodeckStage` (WebGL fallback kept) | 🟡 med | HB-01 |
| [HB-03](playbooks-holodeck/HB-03-editing-tool-cursor-plugin.md) | `EditingToolCursorPlugin` (71) + `CursorLayer` `webgpu`/`both` | 🟡 med | HB-02 |
| [HB-04](playbooks-holodeck/HB-04-measure-driven-dom-chrome.md) | Measure-driven DOM chrome — `createMeasureStore`; retire PB-02 `domFrameRects` | 🟡 med | HB-03 |
| [HB-05](playbooks-holodeck/HB-05-pick-buffer-query-tool.md) | Pick buffer → Query tool (`MICROPOLIS_CELL`) | 🟡 low-med | HB-02 |
| [HB-06](playbooks-holodeck/HB-06-parity-and-retire-webgl-bridge.md) | Pixel/UX parity + retire WebGL bridge from `TileView` | 🟡 high | HB-01..05 |

**Hub:** [playbooks-holodeck/README.md](playbooks-holodeck/README.md) · **Anchors:** [wisdom/code-anchors.md](wisdom/code-anchors.md).

## Dependency graph

```
batch 1 ✅ (playable slice)
   │
   ▼
HB-01 (MicropolisMapPlugin)
   │
   ▼
HB-02 (TileView toggle → HolodeckStage) ──► HB-05 (pick → query)
   │
   ▼
HB-03 (EditingToolCursorPlugin + CursorLayer webgpu/both)
   │
   ▼
HB-04 (measure-driven DOM chrome; both-backend parity)
   │
   ▼
HB-06 (parity gate + retire WebGL bridge)
```

## Atlas — topic → playbook → design source

| Topic | Design source | Playbook |
|-------|---------------|----------|
| WebGPU map plugin | [renderer-plugin-roadmap § TODO 2](../renderer-plugin-roadmap.md#todo-ordered), [unified-webgpu-renderer](../unified-webgpu-renderer.md) | HB-01 |
| Stage mount + toggle | [map-compositing §4 step 1](../map-compositing-and-measurement.md#4-implementation-order-updated) | HB-02 |
| GPU tool cursor | [map-compositing §3.3](../map-compositing-and-measurement.md#33-tile-cursor-sources-pluggable), [virtual-cursor-layer §7.1](../virtual-cursor-layer.md) | HB-03 |
| Measure protocol → DOM | [map-compositing §3.4](../map-compositing-and-measurement.md#34-json-protocol-sparse-read--write--patch) | HB-04 |
| Pick buffer | [unified-webgpu-renderer §5](../unified-webgpu-renderer.md), [code-anchors § anchor-holodeck](wisdom/code-anchors.md#anchor-holodeck) | HB-05 |
| Retire WebGL bridge | [map-compositing §1.1](../map-compositing-and-measurement.md#11-webgl--frozen-legacy-not-a-constraint-clean-slate-later-optional) | HB-06 |

## Open questions (resolve during STIR, before LADLE to full PRs)

- **OQ-1 Plugin vs base layer.** Is the map a `HolodeckPlugin` at `MICROPOLIS_MAP(40)` or the
  stage `baseLayer` (`MapSceneBaseLayer`)? Leaning **plugin** for uniform sort/measure; base
  layer is simpler but bypasses plugin lifecycle. (HB-01)
- **OQ-2 Where does `MicropolisMapPlugin` live?** New package `@micropolis/map-render`, or inside
  `apps/micropolis/src/lib/holodeck/`? Default: app-local first, promote when VitaMoo needs it.
- **OQ-3 Reuse `WebGPUTileRenderer` or rewrite as a plugin?** It is a `TileRenderer` subclass, not
  a `HolodeckPlugin`. Likely **extract its WGSL + texture upload** into the plugin rather than
  wrap the class. (HB-01)
- **OQ-4 Toggle mechanism.** New `MicropolisMapView` component, or a `backend` prop on `TileView`?
  Default: prop/flag on `TileView` to keep one mount path. (HB-02)
- **OQ-5 Pick vs `screenToWorldTile`.** Keep cheap viewport math for hover; use pick only for
  sprite-aware Query? Or pick for all? Default: hover stays viewport math, Query uses pick. (HB-05)
- **OQ-6 Parity oracle.** What is "parity"? Define fixtures + tolerance (software vs WebGPU pixel
  diff) before HB-06 can gate retiring WebGL. (HB-06)
