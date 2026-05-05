# Historic OpenLaszlo Micropolis UI

This tree is an **archived** OpenLaszlo (`*.lzx`) Micropolis front-end. It lives under **`documentation/`** for reference and is not part of the active SvelteKit app (**`apps/micropolis/`**).

## Where the assets live

- **Archival originals** stay here under **`documentation/laszlo/micropolis/resources/`** (`data/`, `images/`, `sounds/`, tile art, SWFs, etc.). Do not strip this tree as “duplicate”; it keeps the Laszlo-era layout intact next to the sources.

- **Canonical bundle** for the engine preload and web app is **`content/micropolis/`**. Any asset that appears under the Laszlo **`resources/`** tree should also exist there (same relative paths under `data/`, `images/`, `sounds/`, …) so WASM and tooling share one copy.

- **LZX `src` paths** point at **`../../../../content/micropolis/...`** from `documentation/laszlo/micropolis/...` — i.e. the repo-root bundle, not sibling paths under `resources/`.

To refresh **`content/micropolis`** from the archived **`resources/`** copy (merge only; does not delete extra files already in `content/micropolis`):

```bash
# from MicropolisCore repo root
rsync -av documentation/laszlo/micropolis/resources/ content/micropolis/
```
