# Engine scratch notes

Text artifacts that describe **internals of the C++ simulator**, **tile representation**, and **old UI asset plans**. They were authored alongside the Tcl/Tk → Python → modern web transitions; some wording still reflects older stacks.

## Files

| File | Description |
|------|-------------|
| **`CALLBACKS.txt`** | Simulator → UI callback hooks (names and roles). |
| **`SIMULATOR.txt`** | High-level simulator behavior notes. |
| **`Tiles.txt`** | Tile types / bitmask / animation ideas. |
| **`SharedData.txt`** | Shared state between UI and engine. |
| **`AnimationSequences.txt`** | Animation / sprite sequencing notes. |
| **`file-format.txt`** | Binary / record layout clues (pair with **`../city-save-files.md`** for modern CLI work). |
| **`outline.txt`** | Early outline / structure notes for engine or docs. |
| **`CODING-STYLE.txt`** | C++ style expectations for the core. |
| **`ASSETS.txt`** | Inventory of UI surfaces (dialogs, tools, overlays) from the classic activity era. |

For **current** architecture direction, prefer **`../../designs/wasm-bridge-and-testing-trajectory.md`** and **`../../designs/callback-interface-roadmap.md`**.
