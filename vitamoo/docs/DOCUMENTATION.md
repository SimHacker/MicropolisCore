# VitaMoo — Full documentation

This document describes all layers, components, data flow, and how to reuse or extend the stack.

The vitamoo **WebGPU `Renderer`** is designed as a **framework** for drawing **Sims-style and related content** beyond characters: lots, objects, architecture, layered sprites, tooling, and **plug-ins** (custom UI, data visualization, editors). **Character animation** (parsers, skeleton, `deformMesh`, staged `drawMesh`) is the **first** integrated use case; mooshow is the first runtime host. New content types and tools should plug into the same depth buffer, object-ID convention, and pass structure where possible.

---

## 1. Architecture overview

```mermaid
flowchart TB
  subgraph app["vitamoospace (SvelteKit app)"]
    direction LR
    A["Routes, VitaMooSpace.svelte, menus, app state"]
  end
  subgraph runtime["mooshow (graphics / runtime)"]
    direction LR
    B["MooShowStage, ContentLoader, SpinController"]
    C["picking, audio"]
    D["Hooks: onPick, onSceneIdChange, onKeyAction, onOrbitViewChange…"]
  end
  subgraph core["vitamoo (core)"]
    direction LR
    E["Parsers: CMX, SKN, CFP…"]
    F["skeleton, mesh deformation, Practice"]
    G["Renderer WebGPU, loadTexture"]
    H["No DOM; Node or browser"]
  end
  app --> runtime
  runtime --> core
```

- **vitamoo**: Pure animation/data core. No concept of “scene” or “UI”; only skeletons, meshes, skills, and animation ticks.
- **mooshow**: One place that knows about “bodies” (character instances), camera, input, and rendering. Exposes a single stage API and hooks so the app layer can stay UI-framework-agnostic.
- **vitamoospace**: One possible app: Svelte 5, one main component, menus bound to stage methods and hooks.

---

## 2. Layer 1: vitamoo (core)

**Path:** `vitamoo/vitamoo/`  
**Package:** `vitamoo`  
**Entry:** `vitamoo/vitamoo.ts`

### Responsibilities

- Parse and write Sims 1–style assets: CMX (skeleton/suit/skill text), SKN (mesh text), BCF/BMF/CFP (binary).
- Build and update skeletons: `buildSkeleton`, `updateTransforms`, `findBone`, `findRoot`.
- Deform meshes from skeleton state: `deformMesh`.
- Animation: `Practice` (skill + skeleton), tick and drive transforms.
- Optional WebGPU: `Renderer.create(canvas, options?)` with optional `{ verbose?: boolean }` (WGSL mesh pipeline, depth, object-ID attachments), `loadTexture(device, queue, url, verbose?)`, `parseBMP`.

### Public API (from `vitamoo`)

- **Types:** `Vec2`, `Vec3`, `Quat`, `Bone`, `SkeletonData`, `MeshData`, `SuitData`, `SkillData`, `MotionData`, `BoneData`, `SkinData`, `BoneBinding`, `BlendBinding`, `Face`, `CMXFile`.
- **Parse/write:** `parseCMX`, `parseSKN`, `parseBCF`, `parseBMF`, `parseCFP`, `writeCMX`, `writeSKN`, `writeReport`, `writeBCF`, `writeBMF`, `writeCFP`.
- **Skeleton:** `buildSkeleton`, `findRoot`, `findBone`, `updateTransforms`, `deformMesh` (optional `DeformMeshOptions`: `{ verbose?: boolean }`).
- **Renderer:** `Renderer` (`Renderer.create`, `drawMesh`, `drawDiamond`, `readObjectIdAt`, `endFrame`, …). Types: `ObjectIdType`, `SubObjectId`, `RendererCreateOptions`.
- **I/O:** `DataReader`, `TextReader`, `BinaryReader`, `BinaryWriter`, `buildDeltaTable`, `decompressFloats`, `compressFloats`.
- **Texture:** `parseBMP`, `loadTexture` (returns `GPUTexture` via `TextureHandle`).
- **Display / assets:** `createDiamondMesh`, `transformMesh`, `loadGltfMeshes`, display-list types (`DisplayListEntry`, …).
- **Animation:** `Practice`, `RepeatMode`.

### Boundaries

- Parsers and skeleton math do **not** depend on DOM, canvas, or app-level state.
- Does **not** load content index or scenes; it only parses and animates data it is given.
- Safe to use from Node (e.g. tooling) or browser. WebGPU drawing applies only when you use `Renderer.create` with a canvas and a browser that exposes `navigator.gpu`.

### Reuse

- Use `vitamoo` alone when you need parsers, skeleton math, or mesh deformation and will supply your own render loop and I/O.
- Replace or wrap `Renderer` only if you need a different GPU API; mooshow uses vitamoo’s `Renderer` internally, or you can bypass mooshow and drive vitamoo directly. The supported browser demo is **vitamoospace**.

---

## 3. Layer 2: mooshow (graphics/runtime)

**Path:** `vitamoo/mooshow/`  
**Package:** `mooshow`  
**Entry:** `mooshow/src/index.ts`  
**Dependency:** `vitamoo` (workspace)

### 3.1 MooShowStage

Central object: owns the canvas, renderer, animation loop, and all bodies. Created with:

```ts
import { createMooShowStage } from 'mooshow';

const stage = createMooShowStage({
  canvas: document.querySelector('canvas'),
  hooks: { onSceneIdChange: (sceneId) => { … }, onKeyAction: (action, value) => { … } },
  assetsBaseUrl: '/data/',   // base URL for content index and assets
  // verbose: true,  // optional: log renderer, texture, deformMesh, pick (also ?vitamooVerbose=1 in browser)
});
```

**Config notes:**

- **`verbose`** — When `true`, enables detailed `console` output from the WebGPU renderer, texture loads, first-per-mesh `deformMesh` stats, and pick resolution. Default `false`. In the browser, `?vitamooVerbose=1` turns it on unless `verbose` is set explicitly on the config object.

**Main methods:**

- **`loadContentIndex(url, onProgress?)`** — Fetches JSON index, then loads all CMX/SKN/CFP/textures into the loader store. Call once before setting scenes or characters.
- **`setScene(sceneIndex)`** — Loads the scene by index; replaces current bodies with the scene cast.
- **`setCharacterSolo(charIndex)`** — Sets bodies to one character at charIndex (same body model as scenes).
- **`setAnimation(animName, actorIndex?)`** — Sets animation for one actor or all.
- **`selectActor(idx)`** — `idx`: 0..n-1 for one body, -1 for “all”. Affects spin, plumb bob, and sound.
- **`pick(screenX, screenY)`** — `async`; returns `Promise<number>`: body index under the point, or `-1`. Uses the renderer’s **`readObjectIdAt`** on the object-ID attachment (character and plumb-bob types map to `objectId` = body index).
- **`start()` / `stop()`** — Start/stop the requestAnimationFrame loop.
- **`render()`** — Force one frame (e.g. after slider change).
- **`destroy()`** — Stops the loop.

**Main getters:**

- `bodies`, `selectedActor`, `activeScene`, `paused`, `running`
- `scenes`, `characters`, `skillNames` (from content index)
- `contentIndex`, `loader`, `spin`, `sound`

**Spin/camera (via `stage.spin`):**

- `rotY`, `rotX`, `zoom` — camera orbit and tilt; “Rotate” slider drives `rotY`.
- Mouse/keyboard drag applies to body spin (selected or all) or camera orbit depending on context; see stage implementation.

### 3.2 ContentLoader

Used by the stage; also exposed as `stage.loader`. Loads the content index JSON and all referenced assets.

- **`loadIndex(url)`** — Fetch and set the content index.
- **`loadAllContent(onProgress?)`** — Load CMX, SKN, CFP, textures into `store` and caches; call after `loadIndex`.
- **`loadScene(sceneIndex)`** — Returns `Body[]` for that scene (uses shared `_buildBodyFromCharacter`).
- **`loadCharacterBody(char)`** — Returns one `Body` for a character (same builder, different overrides).

**Content index shape (`ContentIndex`):**

- `scenes`: `{ name, cast: { character, actor?, x?, z?, direction?, animation? }[] }[]`
- `characters`: `{ name, skeleton?, body?, head?, leftHand?, rightHand?, bodyTexture?, headTexture?, handTexture?, animation?, voice? }[]`
- Optional: `skeletons`, `suits`, `animations`, `meshes`, `textures_bmp`, `textures_png`, `cfp_files`, `defaults`.

All bodies are created the same way; choosing a scene or a character index only changes how many bodies are loaded and which overrides (position, animation, actor name) are applied.

### 3.3 Body and runtime types

- **Body:** `skeleton`, `meshes` (mesh + boneMap + texture), `practice` (animation), `personData` (character def), `actorName`, `x`, `z`, `direction`, `spinOffset`, `spinVelocity`, `top` (TopPhysicsState).
- **TopPhysicsState:** Tilt, precession, nutation, drift for “spinning top” effect when a body is selected and spinning.

Bodies are the only runtime representation of characters.

### 3.4 SpinController

`stage.spin`: drag (left = spin+zoom, right/shift+left = orbit), wheel zoom, momentum decay. Exposes `rotY`, `rotX`, `zoom`, `rotationVelocity`, `isDragging`, `startDrag`, `drag`, `endDrag`, `applyWheel`, `tickMomentum`.

### 3.5 Picking

The stage resolves clicks and hover by reading the **`rgba32uint` object-ID buffer** after the main color pass (`vitamoo` `Renderer.readObjectIdAt`). That yields `type`, `objectId`, and `subObjectId` per pixel; mooshow maps character and plumb-bob hits to a body index.

`pickActorAtScreen` in `mooshow/src/interaction/picking.ts` is an optional **CPU projection** helper (screen-space distance to body anchor points). It is **not** what `MooShowStage.pick` uses at runtime.

### 3.6 SoundEngine

`stage.sound`: Web Audio for spin whoosh and Simlish-style greetings. One voice chain per body. Methods: `ensureAudio()`, `updateSpinSound(rotationVelocity, bodies, selectedActorIndex)`, `simlishGreet(actorIdx, bodies)`, `silenceAll()`.

### 3.7 Hooks (MooShowHooks)

Optional callbacks the app can pass in `StageConfig.hooks`:

- **`onPick(actorIndex, x, y)`** — User clicked on a body.
- **`onHover(actorIndex | null)`** — Hover target changed.
- **`onSelectionChange(actorIndex)`** — Selected actor changed (including after setScene/setCharacterSolo).
- **`onHighlight(actorIndex | null)`** — Highlight state changed.
- **`onPlumbBobChange(actorIndex, visible)`** — Plumb bob drawn for actor.
- **`onSceneIdChange(sceneId | null)`** — Scene set (id) or cleared (null).
- **`onAnimationTick(time)`** — Every frame, with current anim time.
- **`onKeyAction(action, value?)`** — Global key: stepSceneNext/Prev, stepActorNext/Prev, stepCharacterNext/Prev, stepAnimationNext/Prev, togglePause, setSpeed.
- **`onOrbitViewChange(state)`** — Orbit camera changed from canvas input (wheel zoom, background drag rotate/tilt). `state` is `{ rotY, rotX, zoom }` in radians and the stage’s zoom factor. Use this to keep host UI (e.g. range sliders) in sync with the canvas.

Implement only the ones you need; the stage merges with `defaultHooks` (no-ops).

### 3.8 Exports from mooshow

- **Stage:** `createMooShowStage`, `MooShowStage`, `StageConfig`
- **Content:** `ContentIndex`, `CharacterDef`, `SceneDef`, `CastMemberDef`, `ContentStore`
- **Runtime types:** `Body`, `BodyMeshEntry`, `Vec3`, `TopPhysicsState`
- **Hooks:** `MooShowHooks`, `KeyAction`, `OrbitViewState`
- **Other:** `defaultHooks`, `SpinController`, `SoundEngine`

ContentLoader is used internally by the stage; its types are exported so the app can type content index and character defs.

---

## 4. Layer 3: vitamoospace (SvelteKit app)

**Path:** `vitamoo/vitamoospace/`  
**Package:** `vitamoospace` (private)

### Structure

- **Routes:** `+layout.svelte`, `+page.svelte` (full-page demo), `api/health/+server.ts` (placeholder).
- **Component:** `src/lib/components/VitaMooSpace.svelte` — one component that owns the canvas, creates the stage, loads the content index, and wires:
  - Scene / Actor / Character / Animation dropdowns to `setScene`, `selectActor`, `setCharacterSolo`, `setAnimation`.
  - Bottom bar: distance presets, Rotate/Tilt/Zoom/Speed sliders, Pause, Help.
  - Hooks: `onSceneIdChange`, `onSelectionChange`, `onKeyAction`, and `onOrbitViewChange` so wheel/drag orbit updates match the bottom-bar Rotate/Tilt/Zoom sliders (controlled `value` + `oninput`, not one-way `bind:value` only).
- **State:** `src/lib/stores/app-state.svelte.ts` — Svelte 5 runes (e.g. current scene index, actor index, character index, animation name, loading message).

### Data and assets

- Content index and assets are served from `vitamoospace/static/data/` (e.g. `content-exchange.json`, optional `content-assets.json`, CMX, SKN, BMP, CFP). Maintain that directory as your content pack.
- `assetsBaseUrl` is set so the stage loads from `/data/` (or the same path with a base path if using SvelteKit `paths.base`).

### Build and deploy

- **Static:** `@sveltejs/adapter-static`; output is in `vitamoospace/build`. Suitable for GitHub Pages or any static host.
- **Node server:** `@sveltejs/adapter-node` available for a future server; health endpoint is non-prerendered when using static.

---

## 5. Data flow summary

1. App or user triggers “load content” → stage calls `loader.loadIndex(url)` then `loader.loadAllContent(onProgress)`.
2. User selects scene or character → stage calls `loader.loadScene(i)` or `loader.loadCharacterBody(char)`; both use `_buildBodyFromCharacter` and produce a `Body[]` (one or many).
3. Stage sets `_bodies`, camera target, and selection; fires `onSceneIdChange` / `onSelectionChange`.
4. Every frame: animation tick for each body’s `practice`, top physics for selected bodies, momentum decay, spin sound update; then render meshes and plumb bobs.
5. Input (mouse/key) updates `stage.spin` and/or body `spinOffset`; keyboard can trigger `onKeyAction` for the app to change scene/actor/character/animation.

---

## 6. How to reuse and extend

### Use only vitamoo

- Add `vitamoo` as a dependency; import parsers, `buildSkeleton`, `updateTransforms`, `deformMesh`, `Practice`.
- You own loading (content index, fetch), rendering (WebGPU via `Renderer`, or your own backend), and input. No stage, no bodies array from this repo.

### Use mooshow with your own UI

- Add `mooshow` (and thus `vitamoo`) as dependencies.
- Create a canvas, `createMooShowStage({ canvas, hooks, assetsBaseUrl })`, then `loadContentIndex(...)`, `setScene(0)` or `setCharacterSolo(0)`, `start()`.
- Bind your UI to `stage.scenes`, `stage.characters`, `stage.skillNames`, `stage.bodies`, `stage.selectedActor` and call `setScene`, `setCharacterSolo`, `selectActor`, `setAnimation`; use `onSceneIdChange`, `onSelectionChange`, `onKeyAction` to keep your state in sync.
- Override `assetsBaseUrl` and put your `content-exchange.json` (`assetIndexRef` optional) plus assets where your app serves them.

### Custom content index or assets

- Keep the same `ContentIndex` / `CharacterDef` / `SceneDef` / `CastMemberDef` shape so `ContentLoader` and `_buildBodyFromCharacter` work.
- Add fields to character defs (e.g. `voice`) and use them in your hooks or in mooshow’s sound (e.g. `resolveVoiceParams(b.personData)` already reads from `personData`).

### New app (React, Vue, etc.)

- Same as “mooshow with your own UI”: depend on `mooshow`, create stage, load content, wire your components to stage API and hooks. No need to use Svelte or vitamoospace.

### Extend mooshow

- Add new hooks in `MooShowHooks` and call them from the stage where appropriate.
- Add options to `StageConfig` (e.g. default zoom, key bindings) and use them in `_bindCanvasEvents` or the loop.
- Keep a single bodies array and avoid a second “mode” or parallel state so the design stays simple.

### Design goal: Snap! integration

**Cool idea:** Integrate mooshow into [Snap!](https://snap.berkeley.edu/) (browser-based visual programming). The stage API is imperative and UI-framework-agnostic: create a canvas, call `loadContentIndex`, `setScene`, `setCharacterSolo`, `selectActor`, `setAnimation`, and wire hooks. Snap! could expose blocks like "load scene", "play animation", "pick actor at mouse" and drive the same stage from its block runtime. Because mooshow owns only the canvas and hooks (no Svelte or app shell), the integration surface is small: a Snap! extension that instantiates the stage, mounts it in a stage div, and maps blocks to stage methods and hook callbacks. A natural design goal for the stack is to keep that surface narrow so a Snap! (or similar) integration stays tractable.

### Plan for mooshow: hybrid rendering (Sims-style)

**Goal:** Support a hybrid z-buffer, sprite, and procedural-architecture pipeline like The Sims. Render terrain, grass, floors, walls, roofs, and other architecture procedurally or from tiles; render Sims-style objects with z-buffered sprites; and run vitamoo characters (skinned meshes, animation) inside the same scene so characters live in the world. One unified stage: environment + objects + characters, with correct depth ordering and a single camera.

**Rendering framework:** The vitamoo **`Renderer`** is **WebGPU** (WGSL, depth buffer, dual attachments: surface color + `rgba32uint` object IDs). The **default mooshow path** runs **GPU** animation, deformation, and world-transform compute, then draws from GPU-resident deformed buffers; **`deformMesh` on the CPU** remains for reference, validation taps, and **fallback** when the GPU path is not used. The same framework is meant to host **additional Sims content types**, **in-app UI** (menus, pie chrome, highlights), **data visualization**, and **editor** views as further draws and passes. **Specification and roadmap:** [`webgpu-renderer-design.md`](./webgpu-renderer-design.md) (holodeck §4, GPU deformation §5). **Implementation status and next steps:** [`webgpu-renderer-status.md`](./webgpu-renderer-status.md). **Doc index:** [`README.md`](./README.md).

**Object ID and layered sprites:** The main pass writes an **`rgba32uint` id attachment** (type, object id, sub-object id) alongside color; mooshow uses `readObjectIdAt` for picking. That same output can feed **RGB + alpha + z layered sprites** for authoring: render assets (OBJ, glTF, Sims-era data) into color, alpha, and depth, then use layers as z-buffered sprites in the holodeck.

**Reusable renderer vision:** The same `Renderer` is intended for:

- **Holodeck-style runtime:** Pre-rendered z-buffered background (rooms, terrain, props as layered sprites) plus real-time polygon characters (vitamoo skinned meshes). One camera, one depth buffer, correct ordering.
- **Sims object creation tools:** Load or import 3D geometry, render to RGB/alpha/z layers, export or pack as object art for use in-game or in save files.
- **Save file viewing and editing:** Same rendering pipeline to display and edit saved lots/households/objects with consistent look and picking.
- **Plug-ins:** Custom UI layers, diagnostics, and data-visualization overlays that share the camera, depth, and object-ID conventions.

So the **`Renderer`** is shared infrastructure for the character viewer **and** for growing Sims content coverage, tooling, and extensibility—not a one-off viewer hack.

---

## 7. Build and run

From the **repository root** (where `pnpm-workspace.yaml` is, i.e. the SimObliterator_Suite root):

```bash
pnpm install
pnpm --filter vitamoo run build
pnpm --filter mooshow run build
pnpm --filter vitamoospace run build
pnpm --filter vitamoospace run preview
```

Order matters: vitamoospace depends on mooshow, mooshow on vitamoo. For development, run `build` for the packages you change, then run or preview the app.

- **vitamoo:** `npm run build` (or `pnpm --filter vitamoo run build`) → `vitamoo/dist/`.
- **mooshow:** `pnpm --filter mooshow run build` → `mooshow/dist/`.
- **vitamoospace:** `pnpm --filter vitamoospace run build` → `vitamoospace/build/` (static) or run `vite dev` for dev server.

Demo assets: ensure `vitamoospace/static/data/` contains `content-exchange.json` (and optional `content-assets.json`) plus the CMX/SKN/BMP/CFP files referenced there (maintain your own content pack in that tree).

### GitHub Pages (optional)

The workflow `.github/workflows/pages.yml` builds **vitamoo** → **mooshow** → **vitamoospace** and deploys `vitamoospace/build` with `actions/deploy-pages`.

On the **default upstream repo**, the deploy job does **not** run unless you set a public site URL:

- **Repository variable** (recommended): `VITAMOOSPACE_PAGES_URL` — e.g. `https://youruser.github.io/SimObliterator_Suite/` for project Pages, or `https://youruser.github.io/` if the app is served from the site root, or `https://example.com/` for a custom domain.
- **Repository secret** (optional): same name `VITAMOOSPACE_PAGES_URL` if you prefer not to expose the value (unusual for a public URL). If both are set, the variable is used when non-empty.

The workflow parses that URL to set SvelteKit `paths.base` (`BASE_PATH` during build). Hostnames that are not `*.github.io` produce a **`CNAME`** file in the published site (hostname only) for GitHub’s custom-domain flow.

Enable **Settings → Pages → Source: GitHub Actions** on the repo that publishes. Forks use **their own** variables/secrets, so the main repo can stay inert while a fork publishes.

### If pnpm doesn't handle dependencies

- **Hoisting:** Some environments or tools fail with pnpm's strict `node_modules` layout. At the **repository root** (same directory as `pnpm-workspace.yaml`), add a `.npmrc` with `public-hoist-pattern[]=*` or `shamefully-hoist=true`, then run `pnpm install` again so dependencies are hoisted and easier to resolve.
- **Build in dependency order with npm:** Skip pnpm and use npm from each package directory. From the repo root:
  1. `cd vitamoo && npm install && npm run build`
  2. `cd mooshow` — mooshow declares `vitamoo` with `workspace:*`. For npm you need a local link: either `npm link ../vitamoo` (after `npm run build` in vitamoo) or temporarily set `"vitamoo": "file:../vitamoo"` in `mooshow/package.json`, then `npm install && npm run build`
  3. `cd vitamoospace` — same idea: use `npm link ../mooshow` or `"mooshow": "file:../mooshow"`, then `npm install && npm run build && npm run preview`
  That way installs and builds don't rely on pnpm's workspace resolution.
- **Yarn (if the repo adds workspace support):** If the root gets a `package.json` with `"workspaces": ["vitamoo", "vitamoo/mooshow", "vitamoo/vitamoospace"]`, `yarn` at root can install and link; `yarn workspace vitamoo build`, etc. Right now the repo is pnpm-oriented, so npm-per-package or pnpm with hoisting are the main fallbacks.
