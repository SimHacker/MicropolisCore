# Simopolis: Micropolis and The Sims Under One Umbrella

**Status:** Active design  
**Monorepo:** MicropolisCore  
**Related designs:** [`moollm-micropolis-integration.md`](moollm-micropolis-integration.md) · [`github-as-mmorpg-multiverse.md`](github-as-mmorpg-multiverse.md) · [`collaborative-microworld-lineage.md`](collaborative-microworld-lineage.md)  
**External designs (MOOLLM repo):** [designs/sim-obliterator/](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator) — vision, story, BRIDGE field mappings, IFF layer architecture

> **Trademark notice.** This project uses the name *Micropolis* under the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md) granted by [Micropolis GmbH](https://www.micropolis.com/), and is grateful for their generosity. The source code is GPLv3 with additional terms from Electronic Arts: the trademark *SimCity* is owned by Electronic Arts Inc. and is used here only in its historical sense to describe the original game's origins and design lineage. This project makes no claim of affiliation with EA, uses *Micropolis* as its live name, and does not apply the SimCity trademark to any modifications or distributions.

---

## The Thesis

Micropolis (the GPL city simulation descended from the original SimCity) and The Sims were always the same game at different scales.

In Micropolis, each **residential zone** is a colored tile representing thousands of anonymous people. In The Sims, each **person** has a name, a personality, 88 data fields, a family, relationships, a job, memories. Every Micropolis zone is a compressed Sims neighborhood. Every Sims house is a Micropolis lot.

**What if the compression was optional?**

A Micropolis residential zone could open to reveal a full Sims neighborhood — families, relationships, motives — whose aggregate behavior feeds back into the city simulation: tax revenue, crime rate, land value, commute demand. A Sims computer could display a running Micropolis city, its traffic jams and budget crises as visible as the Sims' hunger bars. The two simulations are not just neighbors in a monorepo — they are **the same world at two resolutions**, and the player can zoom between them.

**Simopolis** is the project name for this integration. It is also the name the characters in ["The Wedding Album" (Marusek, 1999)](https://en.wikipedia.org/wiki/The_Wedding_Album_(short_story)) give the place where digital people live — a word that already exists in the cultural vocabulary for exactly this.

---

## Why MicropolisCore Is the Right Home

MicropolisCore already has:

- **`packages/micropolis-engine`** — The Micropolis city simulation engine (C++/WASM, GPL + EA additional terms)
- **`packages/sims-io`** — TypeScript Sims 1 I/O stack: FAR archives, IFF containers, FAMI/NBRS neighborhood parsing, PersonData (L0–L3 complete)
- **`packages/vitamoo`** + **`packages/mooshow`** — VitaBoy character animation, WebGPU renderer
- **`content/vitamoo/sims-prototype-1998/`** — 294 prototype CMX animations (June–December 1998)
- **`content/vitamoo/sims-demo/`** — retail character demo pack

The Python codebase that has been doing save-file parsing (SimObliterator Suite) is being rewritten in TypeScript here, so it runs natively in the browser — no Python interpreter, no subprocess, no venv. The hard parsing work is largely done: `packages/sims-io` already parses neighborhoods. The next layers build on it.

Micropolis and The Sims share infrastructure that belongs in this repo:

| Shared layer | Used by |
|---|---|
| WebGPU renderer (`packages/vitamoo`, `mooshow`) | Sims character animation **and** future Micropolis tile rendering |
| Pie menus | Both games — Don Hopkins built them for both |
| IFF/FAR file format code (`packages/sims-io`) | Sims objects, saves **and** future Micropolis resource files |
| Content variants system (`content/`) | City saves, Sims demo packs, prototype content |
| VitaMoo character pipeline | Sims characters **and** future Micropolis people at street level |

---

## The Two-Resolution World

```
Micropolis (macro)                 The Sims (micro)
─────────────────────────────      ─────────────────────────────
Residential zone tile              → Neighborhood.iff
  tax revenue, crime, density      → FamilyData: budget, house#
  thousands of anonymous people    → NeighborData: 88 shorts each

Lot on the city grid               → Lot + House##.iff
  land value, access, services     → Objects, furniture, routing

City simulation tick               → Sims simulation tick
  needs-based autonomy             → motive engine, BHAV trees
  budget crunch                    → salary, job performance

City event: fire, disaster         → Sims event: fired, married
  global broadcast                 → object affordance, interaction
```

**The Computer object** in The Sims is already a portal to other simulations in the game's fiction. It plays games. Give it a real Micropolis city file to display — the character's city visible on-screen, its budget crisis reflected in their own financial anxieties. Now the two simulations are narratively coupled, not just co-resident in a repo.

**The residential zone** in Micropolis is already an aggregate. Give it a decompress gesture — open a zone to see its Neighborhood.iff, the families inside, the social graph. The aggregate metrics are derived from the Sims data. Change a family's income, watch the zone's land value tick. The simulation feedback loop is real.

This is not two games glued together. It is **one world rendered at two resolutions**, switchable by the player's zoom level.

---

## The Uplift: Characters Who Travel

The most immediate visible capability is what the MOOLLM designs call **The Uplift**: a two-way bridge between Sims 1 save files and enriched LLM-powered environments where characters can actually speak, reflect on their past, and return home changed.

The full story, pipeline, and literary precedent are documented in the MOOLLM repo:  
→ **[designs/sim-obliterator/THE-UPLIFT.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/THE-UPLIFT.md)**

The key point for MicropolisCore is: **this is now a TypeScript implementation**. The Python parsing layer that existed before lives here as `packages/sims-io`. The LLM enrichment and character bridge live in MOOLLM. The character animation and rendering live in `packages/vitamoo`/`mooshow`. The monorepo holds all of it.

### The short version

> Drag a 25-year-old Sims save file in. Watch the character wake up. Have a conversation with them. Send them home changed.

A Sims neighborhood file parses into a roster of characters — personalities, skills, relationships, job history. Those characters cross into an LLM-enriched world where they can speak in full language, form new relationships, accumulate memories, and return to The Sims as a new family in a new save file. Their adventure compiles back into Sims artifacts: updated save data, new custom objects, a Family Album that tells both stories.

The bridge is bidirectional. The characters are real in both directions. Neither direction is the "copy."

---

## The Ecosystem, Not the Killer App

The Sims succeeded not because of its simulation quality alone but because of its **object model and extensibility**:

- Objects expose affordances that behaviors read
- Behaviors are composable SimAntics trees
- Users can author, remix, and share objects, skins, animations, houses
- Transmogrifier, IFFPencil2, Rug-O-Matic, the tombstone server: tools built on the object model
- SimAntics running a Lilliputian Micropolis inside The Sims

This is what Don Hopkins means when he says The Sims was a **nurturing ecosystem**, not a killer app.

A killer app is consumed. An ecosystem reproduces.

MicropolisCore's monorepo strategy matches this: shared packages, composable renderers, open content formats, TypeScript APIs that any tool can call. The goal is an ecosystem where:

- Sims characters can visit Micropolis city lots
- Micropolis cities can contain Sims families
- Adventures authored in MOOLLM compile to playable Sims objects
- Family albums archive to the web and seed future uplifts
- User-created content flows through open IFF pipelines without a Windows-only tool

---

## The Cellular Automata Connection

This is not a side note — it is the conceptual foundation.

Micropolis's simulation is cellular automata at the city scale. The Sims' motive engine is a society-of-mind at the person scale. Both are local rules producing emergent global behavior. Neither has a central controller. Both have global workspace moments — events that broadcast across all subsystems simultaneously (a fire, a layoff, a death).

The IFF Semantic Image Pyramid (documented in [designs/sim-obliterator/IFF-LAYERS.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/IFF-LAYERS.md)) applies the same multi-resolution logic to game resources: raw binary at the bottom, narrative entity at the top, lossless round-trips between all six layers. Edit at whatever resolution is legible to you. The lower layers are always there for recovery.

Characters are persistent patterns. A Sim is not in any one BHAV. A city's behavior is not in any one zone. An agent's self may not be in any one forward pass through an LLM. Identity is a metastable coordination pattern across layers and timescales.

The name **Simopolis** acknowledges this: a *polis* is not a single building or a single person. It is an emergent social structure that arises from many individual dynamics and gives them meaning they could not have alone.

---

## Architecture (Current State)

```
MicropolisCore/
  packages/
    micropolis-engine/     ← Micropolis city sim C++ → WASM (GPL)
    sims-io/               ← TypeScript Sims I/O (L0–L3)
      l0/  NodeResourceProvider, MemoryResourceProvider
      l1/  VirtualTree (FAR archive indexing)
      l3/  parseFami, parseNbrs, PersonData (80 base fields),
           scanForNeighborhoods
    vitamoo/               ← VitaBoy parsers, WebGPU renderer
    mooshow/               ← GPU stage, picking, hooks
    tile-renderer/         ← Canvas/WebGL/WebGPU tile backends

  apps/
    micropolis/            ← Micropolis city simulation SvelteKit app
    vitamoospace/          ← Sims character demo (WebGPU)

  content/
    micropolis/cities/     ← .cty save files
    vitamoo/sims-demo/     ← retail character pack
    vitamoo/sims-prototype-1998/  ← 294 prototype CMX animations
```

**What is missing (the Simopolis layers):**

```
  packages/
    sims-io/
      l4/  ContentIndex bridge → vitamoo/mooshow (next step)
      l3/  Object/BHAV parsing, skin export, adventure compiler (future)

  apps/
    simopolis/             ← Unified Micropolis + Sims shell (future)

  documentation/designs/
    simopolis.md           ← This document
    sims-uplift-roadmap.md ← Phased implementation plan (TODO)
```

---

## Immediate Next Steps

The TypeScript pipeline is partially built. The natural build order:

### 1. sims-io L4 — ContentIndex bridge (unblocked)

`packages/sims-io/src/l4/`: take a parsed `NeighborhoodData` (L3 output) and emit a `ContentIndex` that `createMooShowStage` can load. Map each Sim's character object filename to vitamoo asset paths. This is the first end-to-end path: **real Sims install → browser viewer**.

### 2. Skin/sprite export (TypeScript)

Parse SPR2 chunks from IFF files → PNG. This already exists in SimObliterator Python; it needs a TypeScript port into `packages/sims-io`. The IFF chunk parser infrastructure is already in `packages/vitamoo/vitamoo/io/`.

### 3. Micropolis zone ↔ Sims neighborhood link

Define the data contract: a Micropolis lot position maps to a logical path under `content/micropolis/neighborhoods/`. The `sims-io` scanner reads Neighborhood.iff from that path. The Micropolis engine reads aggregate metrics back from the parsed family data. Small, well-defined interface.

### 4. Family Album web server

A compatible endpoint for the Steam re-release's album upload feature. Albums parse to YAML + images. Characters in albums become uplift candidates. See [BRIDGE.md#family-album-web-server](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/BRIDGE.md).

---

## On Naming

The previous Python tool was called "SimObliterator" — an evocative name for a tool that disassembles save files to extract their secrets. The name no longer fits the direction: this project is about **bringing characters to life**, not obliterating them. And the word carries unwanted political resonance in 2026 that the design doesn't need.

**Simopolis** names the destination, not the operation. It is where characters live when they are not frozen in save files. It is Marusek's word, it is the right word, and it is ours to build.

The technical packages keep functional names (`sims-io`, etc.). The vision document is `simopolis.md`. The unified app, when it exists, will be `apps/simopolis`.

### Trademark summary

| Name | Owner | Status in this project |
|---|---|---|
| **Micropolis** | Micropolis GmbH (registered) | ✅ Our live project name, used under the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md) with attribution |
| **SimCity** | Electronic Arts Inc. (registered) | ✅ Used historically (original game's name and lineage) — not applied to modifications, distributions, or this project's name |
| **The Sims** | Electronic Arts Inc. (registered) | ✅ Used generically to refer to the game — not applied to modifications or distributions |

The city simulation engine in this repo is **Micropolis**. It is based on the original SimCity source code, released by Electronic Arts under GPL for the OLPC project. We are grateful to EA for that release and to Micropolis GmbH for their generous name license. We respect both trademarks.

---

## References

| Resource | Where |
|---|---|
| Full Uplift vision and story arc | [MOOLLM: designs/sim-obliterator/THE-UPLIFT.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/THE-UPLIFT.md) |
| Technical field mappings (Sims ↔ MOOLLM) | [MOOLLM: designs/sim-obliterator/BRIDGE.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/BRIDGE.md) |
| IFF Semantic Image Pyramid (6 layers) | [MOOLLM: designs/sim-obliterator/IFF-LAYERS.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/IFF-LAYERS.md) |
| SimAntics psychopomp / B-brain bridge character | [MOOLLM: designs/sim-obliterator/PSYCHOPOMP-AND-THE-BIFROST.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/PSYCHOPOMP-AND-THE-BIFROST.md) |
| Micropolis + MOOLLM layer model | [`moollm-micropolis-integration.md`](moollm-micropolis-integration.md) |
| Micropolis as constructionist microworld (SimCity lineage) | [`collaborative-microworld-lineage.md`](collaborative-microworld-lineage.md) |
| Git branch as city/universe | [`github-as-mmorpg-multiverse.md`](github-as-mmorpg-multiverse.md) |
| SimAntics VM Design Document (Don Hopkins, Maxis) | https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf |
| VitaBoy character animation (Don Hopkins) | https://donhopkins.com/home/VitaBoyUnity.zip |
| "The Wedding Album" — Marusek (1999) | https://en.wikipedia.org/wiki/The_Wedding_Album_(short_story) |
| SimObliterator Suite (Jeff Adkins) | https://github.com/DnfJeff/SimObliterator_Suite |
| Cellular automatists | https://en.wikipedia.org/wiki/Category:Cellular_automatists |
