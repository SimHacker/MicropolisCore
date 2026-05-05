# GPU assets, browser tools, and interchange

This note aligns implementation choices with Sims-era authoring and runtime: **resident GPU data**, **readback for export**, **standard 3D interchange**, and **long animation from short clips**.

---

## Resident GPU data (current direction)

**Now:** Upload what each frame or tool pass needs **on first use**, keep it on the GPU for the lifetime of that asset or session (textures from `loadTexture`, future mesh/skeleton/animation buffers). Avoid premature eviction; measure first.

**Instrumentation:** Pass `instrumentation` into `Renderer.create` (see `GpuInstrumentationCallbacks` in `vitamoo/gpu-instrumentation.ts`). Allocations for core viewport targets, init resources, and loaded image textures are reported with `purpose` strings suitable for dashboards or logs.

**Later:** A dedicated **GPU resource manager** can add LRU eviction, atlasing, streaming, and explicit `retain`/`release` handles. The instrumentation events are the hook points to validate that manager against real usage before it exists.

---

## Buffer and texture readback

**Validation:** `Renderer.readbackTap` and `Renderer.getTapBuffer` provide CPU↔GPU deformation and animation parity during development via stage-boundary tap buffers.

**Authoring tools (object creation in the browser):** The same readback patterns extend to **export pipelines**:

- **Color + alpha:** Resolve the swapchain or an offscreen `rgba8unorm` target to a buffer, map or `copyTextureToBuffer`, then encode **BMP** (already native in vitamoo’s texture path) or other raster formats.
- **Depth / z-buffered sprites:** Use a copyable depth attachment or a separate **linearized depth** pass into a `r32float` (or similar) texture, then read back for **layered sprites** aligned with [webgpu-renderer-design.md §2.2](./webgpu-renderer-design.md) and Sims-style object sprites.
- **IFF:** Raster and metadata are assembled in JS/Wasm from those readbacks; WebGPU only supplies the GPU-side render and copy steps.

Readback is **essential** for toolchains that must match legacy file formats without server round-trips.

---

## Interchange: glTF 2.0

**Primary interchange:** **glTF 2.0** (JSON `.gltf` / binary `.glb`) for meshes, node hierarchies (skeletons), skins, materials, and animations — as detailed in [webgpu-renderer-design.md §8](./webgpu-renderer-design.md).

Use it for:

- **Import:** Skeletons, skills (as animation clips), suits/skins (meshes + textures), accessories — mapped into existing vitamoo types where possible, or a parallel GPU-ready layout.
- **Export:** Authoring tools write glTF for interchange with Blender and other DCC tools.
- **Recorded sequences:** A **time-ordered list of clips** (or one baked animation) can be stored as glTF animation channels or as app-defined JSON that references multiple glTF animations and blend parameters.

Vitamoo’s bone-range + blend deformation model differs from glTF’s four-joint skinning; conversion or a second GPU path is already scoped in §8.4 of the design doc.

---

## Long streamable animation from short clips

**Goal:** Play on screen and optionally **record** a single long timeline built from **short animations** (walk, reach, generic interaction) with **blends** at boundaries.

**Conceptual pipeline:**

1. **Clips** as named resources (vitamoo `SkillData` / motions, or glTF animations after import).
2. **Timeline** as an ordered list of segments: clip id, start time, duration, optional blend-in/out times and target clip for transitions.
3. **Evaluation each frame:** Sample the active clip(s), blend poses (same quaternion nlerp family as existing `Practice` / skeleton code where applicable), then `updateTransforms` and deformation (CPU now, GPU later).
4. **Recording:** Serialize either the **timeline JSON** plus clip references (compact, streamable) or a **baked** keyframe stream into glTF or a custom JSON stream for replay without re-simulating blends.

This stays compatible with the layered **character pipeline** flags in `character-pipeline.ts` (CPU reference first, GPU stages swapped in per layer).

---

## Related files

| Area | Location |
|------|-----------|
| Instrumentation types | `vitamoo/gpu-instrumentation.ts` |
| Renderer options | `RendererCreateOptions.instrumentation` |
| Pipeline / validation flags | `vitamoo/character-pipeline.ts`, mooshow `StageConfig` |
| Design: holodeck, GPU deform, glTF | [webgpu-renderer-design.md](./webgpu-renderer-design.md) |
| glTF extras metadata schema | [gltf-extras-metadata.md](./gltf-extras-metadata.md) |
| Status snapshot | [webgpu-renderer-status.md](./webgpu-renderer-status.md) |
