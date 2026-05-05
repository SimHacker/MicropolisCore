# Content (build variants)

Cross-cutting **data and assets** for MicropolisCore apps live here—not inside `apps/` or `packages/`.
Each **build variant** (demo, class edition, deployment profile) chooses a manifest under `variants/`
that points into `micropolis/`, `vitamoo/`, and `shared/`.

## Layout

| Path | Purpose |
|------|---------|
| **`micropolis/`** | City/scenario/site copy, educator materials, city-adjacent assets tied to the WASM sim. |
| **`vitamoo/`** | VitaMoo-facing packs: exchange manifests, asset indexes, static references (googlable project name; avoid trademarked franchise names in paths and public URLs). |
| **`shared/`** | Branding, legal, i18n, or hub copy used by more than one vertical. |
| **`variants/`** | Small YAML/JSON files: one entry point per stamp-out build (`variant id` → which subtrees to inject). |

Wire builds with something like `VITE_CONTENT_VARIANT=demo` (or your chosen env name) and resolve
`variants/<name>.yaml` at build time so each deploy gets a fixed content bundle.
