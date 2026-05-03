# Renderer Plugin Roadmap

Micropolis should keep multiple renderer backends because they serve different platforms and teaching goals:

- `WebGLTileRenderer` is the current browser renderer.
- `CanvasTileRenderer` is the simple, inspectable pedagogy renderer path; it now delegates pixel sampling to the shared software renderer and still needs broader app-level selection polish.
- `WebGPUTileRenderer` should become the high-performance / shader-oriented renderer and eventually share ideas with the general WebGPU renderer work for The Sims content.
- `PieMenu.svelte` remains a work-in-progress interaction layer for command discovery and direct manipulation.

## Client-Side Catalog Rendering

Prefer using client hardware for expensive preview rendering. The server should describe what needs rendering; the browser should render it locally, show the user the result, and upload only approved images or assets.

Flow:

```text
server/catalog/content pack
  -> high-level render description
  -> browser renderer plugin
  -> local preview image(s)
  -> user approval
  -> intentional upload of rendered previews/assets
  -> server catalog stores approved derivatives
```

This keeps GPU costs off the server path while making catalog images and object previews high quality. The server remains responsible for schemas, versioning, permissions, storage, validation, and publishing. The client owns interactive editing, local render iteration, and preview approval.

The same render-description contract should run in two browser modes:

- **Interactive browser renderer** — the user's browser edits content, renders previews, and uploads approved results.
- **Headless browser renderer** — a hosted Chromium/Playwright/Puppeteer worker opens the same renderer route, loads the same render description, renders batches, and returns images for catalog generation or SSR.

This means server-side rendering can reuse the browser renderer instead of starting with a separate raw WebGL/WebGPU server implementation. If a hosted worker has GPU acceleration, the same WebGPU/WebGL code path benefits. If it does not, the same route can fall back to WebGL software paths or Canvas.

Headless batch flow:

```text
catalog/render queue
  -> render job description
  -> headless browser opens renderer route
  -> same WebGPU/WebGL/Canvas plugin path as user browser
  -> image(s) captured
  -> validation + storage
  -> catalog updated
```

Renderer preference order:

1. WebGPU for high-quality 3D Sims characters, objects, shader previews, and future unified content rendering.
2. WebGL for broad browser coverage and current Micropolis map rendering.
3. Canvas/software rendering for simple Micropolis tiles, pedagogy, fallback previews, SSR-friendly raster jobs, and deterministic tests.

Content management should work offline-first where practical:

- Add/edit objects, metadata, images, tiles, and scene descriptions in the browser.
- Render previews locally without contacting the server.
- Store drafts locally until the user explicitly saves or publishes.
- Upload source assets and rendered previews only after review.
- Keep server catalogs derived from approved, versioned client submissions.

Micropolis maps are a good software-renderer target: render destination pixels from a continuous screen-to-world transform, sample the tile map and tileset like a shader, and avoid tile seams at every scale. The same plugin interface should also allow WebGL/WebGPU renderers to consume high-level Sims/Micropolis scene descriptions.

## TODO

1. Finish Canvas renderer polish: expose it through renderer selection, add visual regression fixtures, and support richer filtering/overlay sidecars.
2. Bring `WebGPUTileRenderer` up to parity with `WebGLTileRenderer` API and resource lifecycle.
3. Extend the initial Micropolis `RenderDescription` schema to cover Sims characters, Sims objects, and catalog thumbnails.
4. Factor renderer selection behind a plugin-style interface so the app can select WebGPU, WebGL, or Canvas by capability, platform, and lesson intent.
5. Expand `/render` from software Micropolis preview into the shared interactive/headless renderer route.
6. Add browser-side preview generation and explicit upload/approval workflow for catalog images.
7. Add a headless browser batch worker path for catalog generation and SSR snapshots.
8. Connect pie menu actions to command-bus metadata, including command IDs and i18n keys.
9. Align the WebGPU renderer with the shared renderer direction for The Sims content so Micropolis and The Sims can become one wonderful world.
