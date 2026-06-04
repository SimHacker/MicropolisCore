# MicropolisCore documentation

Everything under this directory is **project documentation**: manuals for players, engineering notes, conference materials, frozen UI snapshots, migrated historical writing, and forward-looking **design** specs.

## Top-level map

| Path | What it is |
|------|-------------|
| **`TODO.md`** | **What to do next** — consolidated entry point: all open work, priorities, and pointers into the authoritative docs below. **Start here.** |
| **`manual/`** | HTML **Micropolis / SimCity Classic** player manual (introduction, tutorial, user reference, simulator internals, city-planning essay, bibliography, credits). Start at **`manual/index.html`**. |
| **`designs/`** | Living engineering intent (Wasm bridge, command path, multiplayer, MOOLLM integration). See **`designs/README.md`**. |
| **`vitamoo/`** | VitaMoo WebGPU renderer, Sims I/O, GPU pipeline, refactor history, glTF. See **`vitamoo/README.md`**. |
| **`notes/`** | Developer notes: CLI/save-file references, engine scratch files, legacy OLPC plans, Cursor session exports, prompts. See **`notes/README.md`**. |
| **`talks/`** | Conference talk artifacts (e.g. HAR 2009). See **`talks/README.md`**. |
| **`historical/`** | Long-form archives (migrated blog posts, etc.). See **`historical/README.md`**. |
| **`openlaszlo/`** | Frozen **OpenLaszlo** web client (`*.lzx`) plus **`resources/`** and scratchpads — with an essay on OL constraint/prototype architecture and its lineage into Svelte 5. See **`openlaszlo/README.md`**. |

## Quick links

- **What to build next:** **`TODO.md`** ← start here
- **The top-level framing — characters as hydrogen, Micropolis Federation:** **`designs/characters-as-hydrogen.md`** ← read this first to understand what the Federation actually is
- **The unified Micropolis + Sims vision:** **`designs/simopolis.md`**
- **The agent layer (MOOLLM as microworld OS):** **`designs/moollm-microworld-os.md`**
- **The archive recovery pipeline:** **`designs/the-tornado-and-the-archives.md`**
- **Worlds embedded in worlds (the Uplifted Computer):** **`designs/the-computer-as-portal.md`**
- **LLM-as-narrator (the Imagine Loop):** **`designs/the-imagine-loop.md`**
- **Family Album as branching/merging StoryMaker graph:** **`designs/family-album-as-storymaker.md`**
- **Federation peer-game bridge catalogue (CK3 / RimWorld / Stardew / DF / VTTs / …):** **`designs/federation-peer-games.md`**
- **Design discipline (Miyamoto, Twitch-friendly, Wright-vs-EA):** **`designs/designing-inward-miyamoto-principles.md`**
- **OG Cozy Games (Sims-as-cozy-progenitor + Gamergate receipts):** **`designs/og-cozy-games.md`**
- **Phased build plan (Phases 0 → 5, incl. 1C / 1D / 1E / 1F):** **`designs/simopolis-uplift-roadmap.md`**
- **Play the game / use the CLI:** root **`README.md`**, **`notes/micropolis-js-tests.md`**, **`notes/city-save-files.md`**
- **Platform eras (NeWS → Wasm):** **`designs/platform-lineage-index.md`**
- **MicropolisHub / Git-as-world:** **`designs/github-as-mmorpg-multiverse.md`**
- **VitaMoo renderer status:** **`vitamoo/webgpu-renderer-status.md`**
