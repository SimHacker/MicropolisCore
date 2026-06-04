# `@micropolis/render-core` — shared GPU plumbing

**Goal:** one package that **vitamoo** and **micropolis** (and mooshow, Micropolis Home, headless catalog) can depend on so they run **separately or together** on the **same** schemas, viewport math, holodeck layers, and pick IDs — without forcing vitamoo to know about city tiles or micropolis to know about CMX.

**Companion:** [unified-webgpu-renderer.md](unified-webgpu-renderer.md) (holodeck frame graph), [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) (TODO index), [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md) (June 2024 shared-memory WebGL tile path → holodeck evolution), [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) (Ocean Quigley coined “holodeck” for Sims 1’s 2.5D stack).

---

## 0. Client GPU first (browser composes; server describes)

**All 3D rendering and compositing runs in the Web browser** on the user’s machine. Where `navigator.gpu` is available, the holodeck uses that **free client GPU** — not a paid server-side render farm, not Cairo/ImageMagick on the host, not a custom WebGPU service in the cloud.

| Role | Responsibility |
|------|----------------|
| **Browser (interactive)** | `HolodeckStage` + plugins: map, terrain, characters, pie menu, pick buffer, every frame |
| **Browser (batch / catalog)** | Same code in **headless Chromium** (Playwright/Puppeteer) when you need server-triggered thumbnails — still *a browser’s* WebGPU stack, not a separate GPU server product |
| **Server** | Schemas (`RenderDescription`), asset URLs, permissions, storage, validation, publishing **after user approval** |
| **Server does not** | Own WebGPU/WebGL contexts, ray-trace cities, deform Sims meshes, or bill per GPU-hour for preview quality |

**Economics:** preview iteration is effectively **$0 marginal GPU** on the client; upload bandwidth is paid only for **approved** derivatives (PNGs, IFF, catalog entries).

**Fallbacks (exception paths, not the product model):**

- **Software raster** (`render/software`) — Node tests, CI, no browser, or explicit “export PNG without GPU” jobs. CPU-only, no Cairo requirement.
- **WebGL/Canvas scaffold** — old browsers or teaching; not the holodeck compositor.

Design APIs (`render-core`, vitamoo, micropolis plugins) assume **the compositor lives in the tab**. Server-side code validates descriptions and stores results; it does not mirror the WGSL pipeline.

```text
server:  content pack + RenderDescription JSON + tile/IFF URLs
            ↓
browser: WASM sim (optional) + HolodeckStage (WebGPU) + user edits
            ↓
browser: user approves → upload preview/asset
            ↓
server:  store versioned catalog entry
```

---

## 1. WebGPU absolutist (not a WebGL-shaped wrapper)

You are right to reject a **thick API that pretends WebGPU is WebGL**.

| Approach | Simplicity | Power | Extensibility | Verdict |
|----------|------------|-------|---------------|---------|
| **A. Lowest-common-denominator GPU interface** (`drawTriangles`, uniform slots, one color target) | Looks simple at first | **Poor** — hides compute, storage buffers, multi-target MRT, pass encoders | Plugins cannot add deform compute, pick MRT, or async readback without breaking the abstraction | **Reject** — recreates the 1980s state machine in TypeScript |
| **B. WebGPU-first holodeck API + sidecar scaffolds** | One honest compositor model | **Full** — passes, bind groups, compute, pick layers stay visible | Plugins extend display list + WGSL modules; vitamoo owns character passes | **Choose this** |
| **C. WebGPU only, delete scaffolds immediately** | Maximum focus | Full | Best long-term | Too brittle for teaching/headless until software path is boring-stable |

**Policy:** `@micropolis/render-core` speaks **WebGPU natively** at the compositor boundary (`GPUDevice`, `GPUCommandEncoder`, `GPURenderPassEncoder`, explicit attachment layouts). It does **not** expose a WebGL2-compatible facade.

WebGL and Canvas remain **scaffolding** in `@micropolis/tile-renderer` (or a tiny `@micropolis/raster-scaffold` package later) that implement **export-only** paths:

- `MicropolisMapRenderDescription` → RGBA `Uint8ClampedArray` (software)
- optional `WebGLTileRenderer` for old browsers

They do **not** implement `HolodeckStage`, pick buffers, or display-list execution. No compromise to the holodeck model.

```text
@micropolis/render-core     ← schemas, MapViewport, HolodeckStage, pick contract (WebGPU)
        ↑                           ↑
   vitamoo (Sims)              micropolis plugins (map, sprites)
        ↑                           ↑
   mooshow (stage)              apps/micropolis, micropolis-home

@micropolis/tile-renderer  ← scaffolding only (WebGL/Canvas/software export)
```

---

## 2. Package split (three layers, not one mega-abstraction)

### Layer 0 — `@micropolis/render-core` (new, no GPU vendor fiction)

**Pure + shared contracts** (safe to import from Node for validation/tests):

| Module | Contents |
|--------|----------|
| `viewport/` | `MapViewport`, `Vec2`, configure/pan/zoom, `screenToWorldTile`, matrices |
| `holodeck/` | `HolodeckIdType`, `HolodeckLayer`, `HolodeckPlugin`, `HolodeckFrameState` |
| `display-list/` | `DisplayListEntry` types (move from vitamoo — vitamoo re-exports) |
| `schema/` | `RenderDescription`, `MicropolisMapRenderDescription`, validation |
| `pick/` | Pick triple contract, `readObjectIdAt` result type, idType registry docs |

**WebGPU compositor shell** (browser only; subpath export `./webgpu`):

| Module | Contents |
|--------|----------|
| `webgpu/device.ts` | `createGpuCanvas(canvas)` → device, context, format |
| `webgpu/attachments.ts` | Color + depth + pick MRT layout (matches vitamoo today) |
| `webgpu/holodeck-stage.ts` | `HolodeckStage`: owns viewport, runs sorted plugins, one encoder/frame |
| `webgpu/frame.ts` | `beginFrame` / `endFrame`, viewport resize, depth resize |

**Not in render-core:** WGSL for skinning, CMX loaders, tile atlas WGSL (stay in vitamoo / micropolis-map plugin).

### Layer 1 — Domain packages (depend on render-core)

| Package | Role |
|---------|------|
| **`vitamoo`** | Character mesh cache, GPU deform/animate, mesh WGSL, `drawMesh`, plumb-bob — **implements** `HolodeckPlugin` for characters |
| **`@micropolis/micropolis-render`** (name TBD) | `MicropolisMapPlugin`, `MicropolisSpritePlugin`, tile WGSL — uses `MapViewport` + pick idType 7/8 |
| **`mooshow`** | Stage orchestration, practices, camera — builds display-list entries, drives `HolodeckStage` |

### Layer 2 — Apps

| App | Mode |
|-----|------|
| `apps/vitamoospace` | vitamoo + mooshow only (no map) |
| `apps/micropolis` | map plugins only, or map + embedded vitamoo later |
| `apps/micropolis-home` | full holodeck |

---

## 3. Running separately or together

**Separate:**

```typescript
// vitamoospace — one canvas, one HolodeckStage, plugins: [Characters]
const stage = await HolodeckStage.create(canvas);
stage.addPlugin(vitamooCharacterPlugin);

// micropolis play — same API, plugins: [MicropolisMap, Sprites, ToolCursor]
const stage = await HolodeckStage.create(canvas);
stage.addPlugin(micropolisMapPlugin);
```

**Together:**

```typescript
const stage = await HolodeckStage.create(canvas);
stage.addPlugin(environmentPlugin);   // vitamoo / future
stage.addPlugin(micropolisMapPlugin);
stage.addPlugin(vitamooCharacterPlugin);
stage.addPlugin(pieMenuPlugin);
stage.render();
```

Same `MapViewport` instance on the stage; lot view uses perspective camera on top of ortho map math where needed (`HolodeckViewport` = viewport + camera).

---

## 4. What moves out of `tile-renderer`

| Today in `tile-renderer` | After migration |
|--------------------------|-----------------|
| `MapViewport`, holodeck types | → `render-core` |
| `RenderDescription` / software | → `render-core/schema` + `render-core/raster/software` |
| `WebGPUTileRenderer` | → `micropolis-render` plugin (uses render-core device helpers) |
| `WebGLTileRenderer`, `CanvasTileRenderer` | Stay in `tile-renderer` as **scaffold** until deleted |
| `MapScene`, `OverlayPlugin` | → thin wrappers over `HolodeckStage` in render-core, then delete |

`tile-renderer` becomes **`@micropolis/raster-scaffold`** in the long run or a subfolder `tile-renderer/scaffold/`.

---

## 5. Cost of “supports WebGPU + WebGL + Canvas” in one API

**If the holodeck compositor API is multi-backend:** high cost.

- Pick buffer → undefined on Canvas
- Compute deform → undefined on WebGL1-style paths
- Display list `skinned` → different code paths per backend
- Every new feature (feather desaturate, object-ID) needs three implementations or feature flags

That is the **same trap** as GL abstraction layers: the API drifts to the weakest backend.

**If only the catalog/export path is multi-backend:** low cost.

- `renderDescriptionToRgba(desc, { backend: 'software' | 'webgl' | 'webgpu' })` — one-off snapshots
- Interactive holodeck stays WebGPU-only; headless worker tries WebGPU first, else software

**Recommended rule:**

```typescript
// Interactive — WebGPU or fail (with clear error + link to scaffold app)
await HolodeckStage.create(canvas);

// Batch export — explicit backend, no HolodeckStage
await rasterizeMapDescription(desc, { backend: 'software' });
```

---

## 6. `HolodeckStage` API sketch (WebGPU-native)

No `getContext('webgl2')` inside this type.

```typescript
class HolodeckStage {
  readonly viewport: MapViewport;
  static create(canvas: HTMLCanvasElement, options?: HolodeckStageOptions): Promise<HolodeckStage>;

  addPlugin(plugin: HolodeckPlugin): void;
  setCamera(camera: HolodeckCamera): void;

  /** Collect plugins → sort by layer → execute display list via injected DrawSink */
  render(frame: HolodeckFrameState): void;

  readObjectIdAt(x: number, y: number): Promise<PickResult>;
}
```

`DrawSink` is implemented by vitamoo's `Renderer` (or a thin adapter inside render-core that forwards to vitamoo). **Plugins never call WebGL.**

Vitamoo keeps `drawMesh`, compute encoders, WGSL — render-core owns **when** passes run and **shared** attachment layouts.

---

## 7. Migration phases

| Phase | Action |
|-------|--------|
| **1** | Create `packages/render-core` with viewport + holodeck types + schema (move from tile-renderer) — **done** |
| **2** | vitamoo depends on `render-core`; re-export holodeck types — **done** (display-list types in render-core; vitamoo `MeshData` entries unchanged) |
| **3** | Extract pick MRT + `HolodeckStage` shell from vitamoo `Renderer` into render-core `webgpu/` — **done** (shared pick readback + stage; vitamoo `Renderer` still owns mesh passes) |
| **4** | `micropolis-render` package: map plugin + tile WGSL |
| **5** | Apps use one `HolodeckStage`; deprecate standalone `tileRenderer.render()` loop |
| **6** | Move WebGL/Canvas to scaffold package; document removal criteria |

---

## 8. Naming

Per [naming-conventions.md](naming-conventions.md): **`@micropolis/render-core`** — shared stem `render`, terminal `core` (foundation, not an app).

Subpaths: `@micropolis/render-core`, `@micropolis/render-core/webgpu`, `@micropolis/render-core/schema`.

---

## 9. Decision summary

| Question | Answer |
|----------|--------|
| Shared module? | **`@micropolis/render-core`** — viewport, schemas, holodeck plugins, WebGPU stage shell |
| WebGL/Canvas in the same API as holodeck? | **No** — scaffolding only, export/batch, separate package |
| Does multi-backend compromise WebGPU? | **Yes, if the compositor is multi-backend** — avoid |
| WebGPU absolutist? | **Yes for interactive composition** — vitamoo WGSL/compute stay first-class |
| vitamoo + micropolis together? | Same `HolodeckStage`, different plugins, same pick/viewport |

Honest wrapping of WebGPU means exposing encoders and attachment layouts, not reinventing OpenGL in TypeScript.

---

## 10. Map projections (flat, mesh UV, globe)

Tile color comes from shared **`sampleMicropolisTile(mapTile)`** WGSL; only **how `mapTile` is computed** varies:

| Projection | `mapTile` source |
|------------|------------------|
| `screen` | `MapViewport` pan/zoom (today’s fullscreen quad) |
| `meshUv` / `worldXz` | Terrain, floor plane, authored mesh |
| `cubeSphere` / `equirectangular` | Unit direction → chart |
| **`globeNavigate`** | Rotate icosphere + **fish-eye warp** around POI facing camera — no scroll; see [globe-city-navigation.md](globe-city-navigation.md) |

Globe mode: rotation `R(t)` on S², magnify `g(α)` from geodesic angle to POI, antipode collects compressed distant map; pick uses inverse warp.
