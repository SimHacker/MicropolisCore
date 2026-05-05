# Content (build variants)

Cross-cutting **data and assets** for MicropolisCore apps live here—not inside `apps/` or `packages/`.
Each **build variant** (demo, class edition, deployment profile) chooses a manifest under `variants/`
that points into `micropolis/`, `vitamoo/`, `yoot/`, and `shared/`.

## Layout

| Path | Purpose |
|------|---------|
| **`micropolis/`** | Bundled sim assets: **`cities/`** (.cty saves), **`data/`** (XML/strings), **`images/`**, **`sounds/`**, **`tilesets/`** — consumed by the WASM preload, CLI samples, and archived OpenLaszlo under **`documentation/laszlo/`**. |
| **`vitamoo/`** | VitaMoo-facing packs: exchange manifests, asset indexes, static references (googlable project name; avoid trademarked franchise names in paths and public URLs). |
| **`yoot/`** | Tower-vertical empire lineage: scenarios, plug-in/tower-kit-style manifests, fictionalized assets—named for **Yoot** as creator umbrella (not Maxis/EA/other retail marks). See `content/yoot/README.md`. |
| **`shared/`** | Branding, legal, i18n, or hub copy used by more than one vertical. |
| **`variants/`** | Small YAML/JSON files: one entry point per stamp-out build (`variant id` → which subtrees to inject). |

Wire builds with something like `VITE_CONTENT_VARIANT=demo` (or your chosen env name) and resolve
`variants/<name>.yaml` at build time so each deploy gets a fixed content bundle.
