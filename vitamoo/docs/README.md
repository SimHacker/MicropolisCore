# VitaMoo — `docs/`

Focused notes for the **WebGPU renderer** and related roadmap. The **full stack protocol** (layers, APIs, content formats) is **[`DOCUMENTATION.md`](./DOCUMENTATION.md)**. **Layer refactor history** is **[`REFACTOR-PLAN.md`](./REFACTOR-PLAN.md)**.

| File | Contents |
|------|----------|
| **[DOCUMENTATION.md](./DOCUMENTATION.md)** | **Full stack:** layers, APIs, content formats, hooks, build/deploy, reuse paths. |
| **[REFACTOR-PLAN.md](./REFACTOR-PLAN.md)** | **Layer split** (phases 0–5): status, boundaries, migration narrative. |
| **[webgpu-renderer-design.md](./webgpu-renderer-design.md)** | **Specification:** current pipeline, object-ID layout, holodeck roadmap (§4), GPU deformation (§5), WGSL overview, display-list shapes. Update this when behavior or formats change. |
| **[webgpu-renderer-status.md](./webgpu-renderer-status.md)** | **Living status:** what is implemented vs planned, GitHub Pages deployment, file-level map, recommended next steps, out-of-scope list, links to sibling repos. |
| **[gpu-assets-tooling-roadmap.md](./gpu-assets-tooling-roadmap.md)** | Resident GPU data, readback for browser object export (sprites / BMP / IFF), glTF interchange, streamed animation from clips. |
| **[sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md)** | Historical notes on 3DS Max note tracks, the CMX Exporter, Transmogrifier/RugOMatic/ShowNTell, community content sites, and how they inform VitaMoo's browser-based tool and interchange design. |
| **[gltf-extras-metadata.md](./gltf-extras-metadata.md)** | How VitaMoo uses glTF `extras` for the same purposes as 3DS Max note tracks: skeleton/suit/accessory tagging, bone flags, animation skill metadata, time-keyed events, content catalog data. Round-trip-safe through Blender and conformant tools. |
| **[guid-collision-analysis-plan.md](./guid-collision-analysis-plan.md)** | GUID collision workflow for object scans: GUID -> object lists, exact groups, near-match matrix, immutable built-in handling, and warning payloads for guided/manual resolution. Includes the Cursor/MOOLLM diagnostics-first pattern (analysis scripts emit context-rich warnings; disposition is a separate tool-driven phase). |
| **[ui-overlay-encyclopedia.md](./ui-overlay-encyclopedia.md)** | **UI overlay reference:** selection marker, plumb-bob-style lighting, pie-menu center head, feathered shadow, **censorship overlay**, **speech/thought bubbles with text** (MMO-style); formulas, timings, layout, queues; glTF for marker mesh; implementation checklist. |
| **[OBLITERATOR-TYPESCRIPT.md](./OBLITERATOR-TYPESCRIPT.md)** | **Sims 1 save / game data in TypeScript:** Python survey; **L0–L4** I/O + **§6** layered **YAML/JSON** interchange (exploded/decoded/semantic), **manifest + fidelity profiles** (Transmogrifier-style partial export, derived α/Z/zoom), **BHAV → YAML** round-trip; MOOLLM **[sim-obliterator](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator)**; pure TS read path; roster → VitaMoo first. |
| **[moo-world-model-and-save-alignment.md](./moo-world-model-and-save-alignment.md)** | **Moo vocabulary vs Sims persistence:** district, resident record, household, lot archive, **Person**, **Appearance**; **playing scene**; **§5** scene container — top-level arrays, **`id`** refs, YAML option, per-type **`id→row` caches**, jq-friendly interchange; tool layers; glTF + sidecar. |

**Reading order:** [`webgpu-renderer-status.md`](./webgpu-renderer-status.md) for orientation, then [`webgpu-renderer-design.md`](./webgpu-renderer-design.md) for depth. GPU deform/animation **contract and checklist** live in **design §5.0** when changing that path.

---

## Accomplishments (shipped)

- **WebGPU character path:** WGSL mesh draw, depth, screen fade, plumb-bob meshes, BMP textures via `loadTexture`, object-ID pick buffer and `readObjectIdAt` (mooshow picking).
- **GPU pipeline (default path when supported):** batched compute for animation (`GpuAnimator`), deformation (`GpuDeformer`), world transform (`GpuWorldTransform`), resident skill/mesh caches; draw from GPU-deformed buffers with **CPU fallback** (`deformMesh` + `drawMesh`) when needed. See [`webgpu-renderer-status.md`](./webgpu-renderer-status.md) for the authoritative table.
- **CPU reference path:** `Practice.tick` → `updateTransforms` → `deformMesh` remains for gameplay state, validation taps, and fallback drawing.
- **Logging:** Renderer / texture / deform / pick noise gated behind `Renderer.create(..., { verbose: true })`, `StageConfig.verbose`, or `?vitamooVerbose=1` (default quiet).
- **Documentation split:** One canonical **design** spec ([`webgpu-renderer-design.md`](./webgpu-renderer-design.md), including **§5.0** CPU/GPU contract for deformation), one **status/roadmap** doc ([`webgpu-renderer-status.md`](./webgpu-renderer-status.md)). Implemented WGSL passes are summarized in **design §1.2** (not duplicated in status).

---

## Current stage

| Track | Stage |
|-------|--------|
| **WebGPU + characters (vitamoo + mooshow)** | **In use:** GPU animation + deform + world compute (batched), draw from GPU buffers, textures, picking; CPU deform/draw **fallback** retained. |
| **Holodeck (design §4)** | **Not started** (terrain/floor/wall/roof pipeline). |
| **Design §5 (GPU skeletal + animation)** | **Core path shipped**; open work is timing/observability, validation UX, automated browser GPU parity—see [`webgpu-renderer-status.md`](./webgpu-renderer-status.md). |
| **vitamoospace (app)** | Demo host; orbit/canvas sync via `onOrbitViewChange`; ships to GitHub Pages when `VITAMOOSPACE_PAGES_URL` is configured. |

---

## TODO (next engineering work)

See **[webgpu-renderer-status.md](./webgpu-renderer-status.md)** (gaps, next steps, Holodeck). Short form:

- **Holodeck §4:** background, walls/roofs, environment draw order—still the main greenfield vertical.
- **§5 polish:** GPU pass timing in the debug UI, richer validation summaries, automated end-to-end GPU parity tests; bone-level object IDs for sub-mesh picking (design §2.3).
- **Object GUID collisions:** run GUID -> object grouping and similarity matrix analysis before any re-GUID/disable action (see [`guid-collision-analysis-plan.md`](./guid-collision-analysis-plan.md)).

---

## Dependencies

| Kind | What |
|------|------|
| **Monorepo layers** | **vitamoo** (core: parsers, skeleton, `Renderer`, textures) → **mooshow** (stage, pick, hooks) → **vitamoospace** (SvelteKit app). |
| **Sibling design repos** | **obliterator-designs** (separate checkout): `designs/04-DISPLAY-LISTS-AND-GPU-RESOURCES.md`, `designs/05-SIMS1-WORLD-RENDER-LAYERS.md` — display lists + pools; Sims draw order. Same references as [webgpu-renderer-status.md § Related design docs](./webgpu-renderer-status.md#related-design-docs). |
| **Tooling** | **pnpm** workspace in `vitamoo/`; **WebGPU**-capable browser for the demo; **Node** for build/tests. |
| **Deploy** | GitHub Actions **`.github/workflows/pages.yml`** + repo secret `VITAMOOSPACE_PAGES_URL` for Pages. |

---

## History check (no lost content)

- **`webgpu-renderer-design.md`** is byte-identical to the last committed **`WEBGPU-RENDERER-DESIGN.md`** at `f5c3639` (342 lines).
- **Former `WEBGPU-HANDOFF-CONTEXT.md` (108 lines)** is covered by **`webgpu-renderer-status.md`** + **design §5.0** + **design §1.2** (WGSL list intentionally lives only in the design doc).
