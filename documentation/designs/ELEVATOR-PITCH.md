# The Micropolis Federation — elevator pitch

**One line:** Your game characters are trapped in save files that die with the game. The Micropolis Federation frees them — one character, many games, files you own.

---

## The problem

In 1996, four years before The Sims shipped, Will Wright wanted *"persistent data that can move from one game to another."* It never happened. Your Sims, your Crusader Kings dynasty, your Stardew farmer, your D&D party — each is locked inside one game's save format, and when the game dies or the studio moves on, they're gone.

## The idea

A character has a **soul-file**: one human-readable YAML file — name, traits, relationships, memories ([characters-as-hydrogen.md](characters-as-hydrogen.md)). From that soul-file the same identity can be **incarnated** into many runtimes: a Sims `.iff` row, a Micropolis residential zone, a MOOLLM citizen directory, a narrative dream space. Not copies — synchronized incarnations of one person.

Characters are the **hydrogen** of this universe: the most abundant content-atom, the one that binds to everything else (lots, objects, behaviors, appearances, memories, stories).

## How it works

Two interop primitives, kept separate:

- **Character bridge** (the Bifrost): move a soul-file between substrates — CK3, RimWorld, Stardew, Dwarf Fortress, Foundry VTT ([federation-peer-games.md](federation-peer-games.md)).
- **City bridge**: sit a Micropolis city next to a Cities: Skylines metro and exchange the same boundary signals the game already uses for its own neighbors — commuters, freight, power.

Bridges are **user-side companion tools that read save files you already own** — the same posture the Sims modding community has used for 25 years. We never touch proprietary engine code or assets.

## Why "Federation," not "franchise"

A Star-Trek-style cooperative association of sovereign open-source projects — not a commercial licensing scheme. Bridges are gifts to each peer community: free, no accounts, no fees, no lock-in. If a studio objects, we withdraw the bridge. Nobody loses anything by interoperating with us.

## What's real vs. proposed

- **Real:** Micropolis is GPL3 and runs in the browser (WASM/WebGL, [micropolisweb.com](https://micropolisweb.com)). The character substrate, soul-file schema, and Sims-1 I/O pipeline are in active development.
- **Proposed:** The peer-game bridge catalogue is a *strategic catalogue*, not a shipping roadmap. No partnerships or endorsements are implied; all game names are nominative use.

---

## Go deeper

| If you want… | Read |
|---|---|
| What the Federation actually is | [characters-as-hydrogen.md](characters-as-hydrogen.md) |
| Micropolis + The Sims under one roof | [simopolis.md](simopolis.md) |
| The agent layer (MOOLLM) | [moollm-microworld-os.md](moollm-microworld-os.md) |
| Which games we'd bridge to, and why | [federation-peer-games.md](federation-peer-games.md) |
| The phased build plan | [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md) |
| Everything | [designs/README.md](README.md) |
