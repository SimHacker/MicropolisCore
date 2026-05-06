# Engineering and workflow notes

Loose files that support **development**, **CLI / save-file work**, and **agent sessions** — not the shipped HTML manual (see **`../manual/`**) and not long-form blog archives (see **`../historical/`**).

## Layout

| Path | Role |
|------|------|
| **Root of `notes/`** | Frequently used, still-relevant material: multiplayer research, modern UI plans, CLI test doc, save-file reference, prompt snippets. |
| **`engine/`** | Low-level engine scratch: callbacks, tile map, simulator hooks, file layout, coding style, asset inventories. |
| **`legacy/`** | OLPC / Python-GTK-era plans, Tcl notes, old roadmaps and TODOs — **kept for lineage**, often superseded by Wasm + Svelte work. |
| **`cursor/`** | Large **Cursor IDE** session export (renamed from former `Cursor/notes.txt`). |

## Index (root files)

| File | Description |
|------|-------------|
| **`city-save-files.md`** | Dense reference for `.cty` / save layout, tools, and multi-tile buildings (CLI and tooling). |
| **`micropolis-js-tests.md`** | Vitest / CLI command cheat sheet for the `micropolis` package. |
| **`PIE-TAB-WINDOWS.md`** | Pie menus, tabs, docking, collaboration UI concepts tied to MicropolisHub. |
| **`MultiPlayerIdeas.txt`** | SimCityNet-style multiplayer, voting, Git / universe metaphors — overlaps **`../designs/`** but preserved as primary brain-dump. |
| **`prompt-code-review-*.txt`** | Short reusable prompts for code review. |
| **`references-academic.txt`** | Tiny external citation capture (e.g. related games criticism). |

See **`engine/README.md`** and **`legacy/README.md`** for subdirectory indexes.
