# Engine scratch notes

Text artifacts that describe **internals of the C++ simulator**, **tile representation**, and **coding conventions**. Authored alongside the Tcl/Tk → Python → modern web transitions; some wording still reflects older stacks.

## Files

| File | Description |
|------|-------------|
| **`SIMULATOR.txt`** | High-level simulator behaviour notes. |
| **`Tiles.txt`** | Tile types / bitmask / animation ideas. |
| **`AnimationSequences.txt`** | Animation / sprite sequencing notes. |
| **`file-format.txt`** | Binary / record layout clues (pair with **`../city-save-files.md`** for modern CLI work). |
| **`CODING-STYLE.txt`** | C++ style expectations for the core (`packages/micropolis-engine/src/`). |
| **`ASSETS.txt`** | Inventory of UI surfaces (dialogs, tools, overlays) from the classic activity era. |

Files moved to **`../legacy/`**: `CALLBACKS.txt`, `SharedData.txt`, `outline.txt` — these describe Tcl/Python-era integration patterns superseded by the Wasm/Embind bridge.

For **current** architecture direction prefer **`../../designs/wasm-bridge-and-testing-trajectory.md`** and **`../../designs/callback-interface-roadmap.md`**.
