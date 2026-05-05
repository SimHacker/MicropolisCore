# VitaMoo

**VitaMoo** is a **Sims 1**-style animation and asset stack: parse CMX/SKN/CFP, drive skeletons, deform meshes. The **WebGPU `Renderer`** (WGSL) is a **framework** aimed at rendering **more than characters** over time—other Sims content types, tooling, and **plug-ins** such as custom UI and data visualization—with **skinned character animation** as the **first** integrated slice. No game engine: TypeScript and a small layered stack you can reuse or replace.

## What’s in this directory

| Layer | Role |
|-------|------|
| **vitamoo/** | Core: parsers, skeleton math, mesh deformation, animation ticks, **`io/`** (FAR archives, Maxis IFF v1/v2.x with version detection, FourCC resource type constants, STR#/CTSS/CST string tables, pluggable resource handler registry). No DOM, no canvas. |
| **mooshow/** | Graphics/runtime: WebGPU stage (`Renderer.create`), camera, object-ID picking, spin input, hooks for UI (selection, plumb bob, keys). Depends on `vitamoo`. |
| **vitamoospace/** | SvelteKit app: full-page demo, playing-scene / template / skill menus, one `VitaMooSpace` component that uses `vitamoo` + `mooshow`. |

Scenes and bodies come from the **playing-scene exchange** (`content-exchange.json` with `schemaVersion`, `characterTemplates`, `playingScenes`, optional `assetIndexRef` to a pure asset list such as `content-assets.json`) plus CMX/SKN/BMP/CFP assets. The loader enforces exchange schema validation and maps templates/placements to the runtime index (`characters`, `scenes`, `cast`) without legacy fallback paths. See `docs/moo-world-model-and-save-alignment.md`. Validate shipped demo files with `npm run verify:exchange`, merge invariants with `npm run verify:exchange:merge`, and GUID-collision groundwork with `npm run verify:guid-collision`.

## Quick start

From the repo root (pnpm workspace):

```bash
pnpm install
pnpm --filter vitamoo run build
pnpm --filter mooshow run build
pnpm --filter vitamoospace run build
pnpm --filter vitamoospace run preview
```

Open the preview URL (e.g. `http://localhost:4173/`) for the Spin the Sims demo.

## Development logging

By default the stack stays **quiet** in the browser console. To debug WebGPU passes, texture loads, mesh deformation stats, and picking:

- Add **`?vitamooVerbose=1`** to the page URL, or
- Pass **`verbose: true`** to **`createMooShowStage({ … })`**, or
- Call **`Renderer.create(canvas, { verbose: true })`** when embedding `vitamoo` without mooshow.

Shader display modes still use **`?debugSlice=0`** … **`6`** (see Default controls below). Warnings (e.g. failed texture load) are not suppressed.

## Use only what you need

- **Data/tooling only:** depend on `vitamoo` for parsing and skeleton/mesh/animation logic; bring your own renderer.
- **Browser viewer with your UI:** depend on `mooshow`; create a stage, load a content index, wire hooks to your components.
- **Full demo:** use or fork `vitamoospace`; swap assets and content index to rebrand.

See **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)** for full API and layer boundaries, data formats, and how to extend or build on top. **Layer refactor (phases):** **[docs/REFACTOR-PLAN.md](docs/REFACTOR-PLAN.md)**. **WebGPU renderer index:** **[docs/README.md](docs/README.md)** (spec, status, GPU-deformation checklist).

---

## WebGPU mesh uniforms (binding layout)

The mesh shader uses **two uniform bindings** so pick/debug integers never share the same `vec3`/`vec4` packing as lighting fields (avoids backend aliasing bugs):

| Binding | WGSL struct | Purpose |
|--------|-------------|---------|
| **0** | `Uniforms` | `projection`, `modelView`, `lightDir`, `alpha`, `fadeColor` (vec4: RGB tint or sentinel when textured), `hasTexture` / `solidColorMode` (u32), `ambient`, `diffuseFactor`, `highlight` (vec4). Packed to **256 bytes** (`UNIFORM_SIZE`). |
| **3** | `PickDebugUniforms` | `debugMode`, `idType`, `objectId`, `subObjectId` (four u32). **256-byte** buffer (`PICK_DEBUG_UNIFORM_SIZE`) for alignment. |

**Per-draw uniform buffers:** each `drawMesh` allocates **fresh** GPU buffers for bindings 0 and 3, writes them, draws, then queues them for destruction after `endFrame`. Reusing one buffer and overwriting it for every mesh in the same render pass is invalid on WebGPU: all draws would see the **last** write (for example every character rendered with the plumb-bob’s solid color). Per-draw buffers fix that.

---

## Object-ID picking

When the dual-output pipeline is active, the main pass writes **three `r32uint` attachments** (plus the swapchain): **id type**, **object id**, **sub-object id**. Fragments copy pick fields from `PickDebugUniforms` on binding 3.

- **`ObjectIdType`** (in `vitamoo` / `renderer.ts`): `NONE`, `CHARACTER`, `OBJECT`, `WALL`, `FLOOR`, `TERRAIN`, `PLUMB_BOB`. Character meshes and plumb-bobs use types **`CHARACTER`** and **`PLUMB_BOB`**; **`objectId`** is the **body index** in the current scene (same index `MooShowStage` uses for `selectActor`).
- **`subObjectId`**: mesh slot within that body (body, head, hands, etc.); see `SubObjectId` in the renderer module.

**`Renderer.readObjectIdAt(screenX, screenY)`** copies one texel from each pick texture into a readback buffer (coordinates are **canvas buffer pixels**, origin top-left within the active viewport). It returns `{ type, objectId, subObjectId }`.

**`MooShowStage`** (in `mooshow`) maps **client** coordinates to buffer space using `canvas.width/height` vs `getBoundingClientRect()`, then calls `readObjectIdAt`. Clicks on a character or its plumb-bob select that actor; click on empty background with **multiple** bodies clears selection to **All** (`selectActor(-1)`).

---

## Default controls (`MooShowStage`)

Bindings below are implemented in **`mooshow`** on the stage canvas (skipped while a `<select>`, `<input>`, or `<textarea>` is focused). The **vitamoospace** app wires **`onKeyAction`** so the on-screen UI stays in sync (sliders, pause label, menus).

### Mouse

| Input | Effect |
|-------|--------|
| **Left drag** | Spin selected actor(s) or all bodies; vertical drag zooms. Release can leave **spin momentum**. |
| **Shift + left drag** | Treated as **right drag**: orbit **camera** (`rotY` / `rotX`), not body spin. |
| **Right drag** | Orbit camera (yaw + tilt). |
| **Wheel** | Zoom (hold **Ctrl** for coarser steps). |
| **Click** | Pick: character or plumb-bob selects that **body index**; miss with 2+ bodies → **All**. |

### Keyboard

| Keys | Effect |
|------|--------|
| **1 – 9** | Animation speed presets (slider values **25, 50, 100, 150, 200, 300, 500, 750, 1000** → `speedScale = value / 100`). Also **unpauses**. |
| **0**, **z** | Toggle **pause** / **play**. |
| **Space** | Next actor (**Shift** = previous); can transfer spin momentum to the selected body. |
| **N** / **P** | Next / previous **scene** (when the app handles `onKeyAction`). |
| **D** / **A** | Next / previous **actor**. |
| **S** / **W** | Next / previous **character** preset. |
| **E** / **Q** | Next / previous **animation**. |
| **↑** / **↓** | Zoom in / out (held). |
| **←** / **→** | Spin (held; speed ramps up over time). |

### Shader debug (URL only)

Mesh **debug view modes** (UV, normals, solid tests, etc.) are selected with the query parameter **`?debugSlice=0`** … **`6`** on the page URL, **not** with number keys. Digit keys are reserved for **animation speed** as above.

---

## GitHub Pages (fork)

The workflow **Deploy VitaMooSpace to GitHub Pages** runs on pushes to **`main`** that touch the vitamoo paths (see `.github/workflows/pages.yml`), or manually via **Actions → Run workflow**. It only deploys if **`VITAMOOSPACE_PAGES_URL`** is set (repository variable or secret). Manual CLI:

```bash
gh workflow run "Deploy VitaMooSpace to GitHub Pages" --repo OWNER/REPO
```
