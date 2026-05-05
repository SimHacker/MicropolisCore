# WebGPU renderer — status and roadmap

Living snapshot of vitamoo WebGPU rendering and character pipeline execution.
This file tracks what is shipped now, known gaps, and the next implementation
sequence.

---

## Specification references

- **[webgpu-renderer-design.md](./webgpu-renderer-design.md)** — full pipeline and long-horizon architecture.
- **[gpu-assets-tooling-roadmap.md](./gpu-assets-tooling-roadmap.md)** — GPU residency, readback, export/tooling.
- **Design [§5.0 Prerequisites and CPU/GPU contract](./webgpu-renderer-design.md#50-prerequisites-and-cpugpu-contract)** — validation, integration, fallback, profiling when changing the GPU deform path.

---

## Status snapshot

| Area | State |
|------|--------|
| WebGPU draw path (mesh WGSL, depth, fade, plumb-bob) | Done |
| Textures (`loadTexture`, `getTextureFactory`, mooshow loader integration) | Done |
| Object-ID MRT and `readObjectIdAt` (type/object/sub-object) | Done |
| GPU mesh cache (`GpuMeshCache`) and persistent deformed output buffers | Done |
| GPU deformation compute (`GpuDeformer`: transform + blend) | Done |
| GPU animation compute (`GpuAnimator`: init poses -> apply practices xN -> propagate) | Done |
| GPU skill data cache (`GpuSkillCache`: keyframes, motion meta, hierarchy, topo, bone flags) | Done |
| GPU world transform compute (`GpuWorldTransform`) | Done |
| Tap-buffer validation (animation + deformation readback and compare) | Done |
| Debug panel presets / pipeline controls / validation telemetry | Done |
| Cross-body compute batching (all characters in each phase) | Done (phase-batched + skill-bucketed apply + single submit) |
| High-parallel animation kernels (per-bone/per-motion workgroups) | Done (init/apply parallel; propagate depth-layer parallel) |
| Bind-group cache + skill/layer bucketing | Done |
| Holodeck terrain/floor/wall/roof pipeline | Not started |
| Demo host: canvas orbit → `onOrbitViewChange` + vitamoospace slider sync | Done |

---

## Current runtime pipeline

Per frame, mooshow now executes a single batched compute encoder:

1. **CPU logic tick:** `applyPractices` and `updateTransforms` keep gameplay-facing skeleton state current (per body).
2. **GPU init (all bodies):** reset local poses and priorities for every animated body.
3. **GPU apply (skill-bucketed, per layer):** within each priority layer, bodies sharing a skill dispatch together for GPU data-cache locality.
4. **GPU propagate (all bodies):** depth-layer parallel hierarchy propagation per body.
5. **Tap (optional):** copy bone transforms to readback buffers when animation validation is enabled.
6. **GPU deformation (all bodies):** `encodeDeformMeshGpu` writes deformed vertices/normals per mesh.
7. **Tap (optional):** copy deformed pre-world-transform buffers when deformation validation is enabled.
8. **GPU world transform (all bodies):** body position/direction/top physics applied in-place per mesh.
9. **Submit:** single `queue.submit` for the entire compute encoder.
10. **Draw:** `drawMeshFromGpuDeformed` (GPU path) or `drawMesh` with CPU-deformed arrays (CPU fallback).
11. **Validation readback (optional cadence):** compare tap buffers with CPU references; structured per-body/mesh records.

---

## Implemented files (core)

| File | Role |
|------|------|
| `vitamoo/vitamoo/renderer.ts` | WebGPU renderer and orchestration entry points for animation/deform/world compute, draw, tap-buffer allocation and readback. |
| `vitamoo/vitamoo/gpu-animator.ts` | Multi-practice animation kernels and dispatch sequencing. |
| `vitamoo/vitamoo/gpu-skill-cache.ts` | GPU-resident skill keyframes, hierarchy/topology, and per-bone flags. |
| `vitamoo/vitamoo/gpu-deformer.ts` | Deformation kernels matching VitaBoy phase 0 / phase 1 / blend flow. |
| `vitamoo/vitamoo/gpu-world-transform.ts` | Post-deformation body/world transform pass. |
| `vitamoo/mooshow/src/runtime/stage.ts` | Runtime backend selection, per-body orchestration, validation scheduling, draw loop integration. |
| `vitamoo/mooshow/src/runtime/content-loader.ts` | Character body assembly and practice creation. |
| `vitamoo/vitamoospace/src/lib/components/DebugPanel.svelte` | Runtime controls and validation diagnostics UI. |

---

## Known gaps and risks

1. **GPU timing observability:** no pass-level GPU timestamp instrumentation in the debug UI yet.
2. **Validation UX:** structured validation records are produced, but only high-level summaries are shown in the panel.
3. **Parity fixtures:** deterministic CPU-side fixtures exist; no automated browser GPU end-to-end parity suite yet.
---

## Next implementation steps

### Phase 1 — correctness hardening

1. Completed: key skill cache by `(skill, skeleton signature)`.
2. Completed: enforce `throwOnMismatch` in validation paths.
3. Completed: fix CPU fallback normal transform for top physics.
4. Completed: add explicit release paths for per-body scratch buffers on scene replacement and `destroy()`.

### Phase 2 — scale and performance

1. Completed: move from per-body submit to phased multi-body batching (single compute encoder).
2. Completed: rework animation kernels for parallel dispatch (init per-bone, apply per-motion, propagate depth-layer).
3. Completed: bind-group cache + skill/layer bucketing in apply passes.
4. Next: add lightweight GPU timing for animation/deform/world passes.

### Phase 3 — validation and observability

1. Completed: persist structured validation results per body/mesh.
2. Next: add pass-level counters and buffer-usage diagnostics to the debug panel.
3. Completed (baseline): add deterministic parity fixture script for compare/event regressions.

### Phase 4 — renderer breadth

1. Holodeck background layers (terrain/floor/walls/roofs).
2. Optional post-process stack (desaturate/vignette/pixelization).
3. Display-list executor for whole-scene submission.

---

## Out of scope right now

- Pie menu render stack and head-in-pie integration (target behavior: [ui-overlay-encyclopedia.md](./ui-overlay-encyclopedia.md)).
- Speech / thought bubbles with live text over avatars (plan: same doc §4; design §3.9.1).
- Bone-level pick ID output.
- Censorship post-process pass (see **Planned: VitaBoy-style censorship** below).

---

## Planned: VitaBoy-style censorship (not started)

**Status:** Design sketch only in [webgpu-renderer-design.md §3.11](./webgpu-renderer-design.md#311-censorship-mesh-bounding-box-pixelization). No implementation in vitamoo yet.

### What the original game did (VitaBoy / Sims renderer)

- Content marked for moderation used a **special suit type** (VitaBoy `Suit` **type 1 = censor** vs **0 = normal**; reflected in vitamoo as `SuitData.type` in `types.ts`).
- Associated **skins/meshes** (often simple boxes bound to bones—see e.g. `child-censor.cmx` / `*BOX` skins in the content tree) are not drawn as ordinary textured geometry for the player. Instead, the pipeline **transforms those mesh vertices into screen space** (same view–projection as the main character pass), takes an **axis-aligned bounding rectangle** of the projected hull (conservative clamp to the viewport), and the **2D renderer pixelates or mosaics** those rectangles over the already-rendered frame—so the underlying mesh need not be visible, only its **screen footprint** drives the effect.
- That keeps censorship **animation-accurate** (boxes follow bones and deformation) without relying on full-body segmentation.

### How this maps onto vitamoo today

- **Authoring:** [sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md) documents suit `type=value` for censorship-style suits; `child-censor.cmx` is an example of bone-attached box skins.
- **Runtime gap:** Loader and `Renderer` treat suits/skins as normal drawable meshes today. There is no branch that **skips drawing** censor geometry while still using it **only** to compute projected rects.
- **Rendering gap:** There is no **post-process** (or compute) pass that reads the main color target and applies **block / mosaic** inside those rects. Object-ID and depth buffers from the main pass are the natural inputs to avoid pixelating wrong layers when rects overlap in 2D.

### Proposed architecture (layers)

1. **Censor region producer (simulation / render prep)**  
   For each body with an active censor suit (or per-frame policy flag): either evaluate **CPU-deformed** censor mesh vertices (small box meshes) with the **same** world and view–projection matrices as the main draw, or add a **minimal GPU path** that outputs projected bounds. Emit **one or more screen-space rects** per body (union or list), updated every frame while the skeleton moves.

2. **Compositor / post-process (Renderer)**  
   After the main color (and depth) pass, a **fullscreen or scissored** pass (WGSL) samples the scene texture; for pixels inside rects (optionally gated by **depth compare** and/or **object-ID** membership), replace color with a **mosaic** (average over N×N blocks) or **quantize** coordinates to a coarse grid. Reuse the same vocabulary as a future pie-menu post stack ([webgpu-renderer-design.md §3.9](./webgpu-renderer-design.md)).

3. **Policy and UI layer (separate from core Renderer)**  
   Host app (e.g. vitamoospace or stream wrapper): **enable censor**, **strength / block size**, **safe mode** for capture, without entangling moderation policy inside `Renderer`. Renderer exposes something like “here are the rects this frame” or “apply censor pass with this rect buffer,” while **who** is censored and **when** stays in app/stream logic.

### Difficulty (rough)

| Piece | Effort | Notes |
|-------|--------|--------|
| Detect censor suits / skip drawing them as regular meshes | Low–medium | Parse `SuitData.type`, tag bodies or meshes in mooshow; optional debug draw of boxes. |
| Project deformed verts → screen rects (CPU) | Medium | Reuse deform + VP math; must match WebGPU clip space; conservative bbox from 8 corners or hull. |
| Rect buffer → post-process mosaic pass | Medium | One render pass + small WGSL; tune block size; handle HiDPI / viewport. |
| Depth / object-ID correctness when rects overlap | Medium–high | Avoid censoring foreground UI or wrong actor; sample existing pick attachments. |
| GPU-only path for bounds (optional) | Higher | Avoids CPU readback of deformed censor meshes at scale. |

**Overall:** Comparable to adding a **first real post-process pass** plus a **small content hook**—not a single afternoon, but bounded if MVP uses **CPU-projected boxes** and a **simple mosaic shader** before optimizing.

### References in-repo

- [webgpu-renderer-design.md §3.11](./webgpu-renderer-design.md#311-censorship-mesh-bounding-box-pixelization) — bbox pixelization options (post-process, per-mesh, hybrid).
- [sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md) — suit type and exporter notes.
- `vitamoo/vitamoo/types.ts` — `SuitData.type` (`0` normal, `1` censor).

