# Historic OpenLaszlo Micropolis UI

This tree is an **archived** OpenLaszlo (`*.lzx`) Micropolis front-end. It lives under **`documentation/`** for reference and is not part of the active SvelteKit app (**`apps/micropolis/`**).

## Self-contained snapshot

All **`src=` paths in the LZX files are relative to each compile unit** and point at **`../resources/...`** — i.e. **`documentation/laszlo/micropolis/resources/`** (`data/`, `images/`, `sounds/`, tile PNGs, SWFs, etc.). You can copy **only** `documentation/laszlo/micropolis/` (classes, micropolis entrypoints, resources) elsewhere and build or inspect OpenLaszlo without touching repo-root **`content/micropolis/`**.

The live engine and WASM preload still use **`content/micropolis/`**. When those bundles change, refresh the archival copy if you want them to stay in sync:

```bash
# from MicropolisCore repo root — merge Laszlo archive into canonical bundle (optional)
rsync -av documentation/laszlo/micropolis/resources/ content/micropolis/
```
