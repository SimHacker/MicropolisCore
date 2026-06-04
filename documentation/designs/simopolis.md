# Simopolis: Micropolis and The Sims Under One Umbrella

**Status:** Active design  
**Monorepo:** MicropolisCore  
**Read first for the top-level framing:** [characters-as-hydrogen.md](characters-as-hydrogen.md) — the multi-resolution, multi-universal character substrate that underlies the whole Micropolis Federation (Star-Trek-style cooperative association of peer projects, not a commercial franchise). Simopolis (this doc) is *one specific incarnation pathway* of that substrate — the Dream ↔ Home pathway between MOOLLM and The Sims.

**Companion strategic documents (in this folder):**

- [moollm-microworld-os.md](moollm-microworld-os.md) — MOOLLM as the LLM-OS / microworld substrate for uplifted characters
- [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) — the pipeline that recovers two decades of Sims content into Micropolis Home residential zones
- [the-computer-as-portal.md](the-computer-as-portal.md) — the Sims Computer object uplifted: custom IFF content for the EA game that runs Micropolis, plays other save files, and embeds worlds in worlds
- [the-imagine-loop.md](the-imagine-loop.md) — LLM-as-narrator (not LLM-as-simulator): Examine → Imagine → Edit → Inject; produces valid Sims save files the EA game plays normally
- [family-album-as-storymaker.md](family-album-as-storymaker.md) — Sims Family Album extended into a branching/merging community graph; the 35-year SimCity → DreamScape → The Sims → Bar Karma / StoryMaker / Urban Safari lineage finally reaching its natural shape
- [federation-peer-games.md](federation-peer-games.md) — bridge-target catalogue: which other games (CK3, RimWorld, Stardew, Dwarf Fortress, Bethesda titles, VTTs) are great fits for Bifrost character bridges, and which are not
- [sims-content-registry.md](sims-content-registry.md) — dependency resolution, validation, repair, GUID-collision handling, LLM-assisted matching for missing references
- [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md) — phased build plan with definitions of done

**Related infrastructure designs:** [moollm-micropolis-integration.md](moollm-micropolis-integration.md) · [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md) · [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md)  
**Interaction / pies / holodeck:** [interaction-design-articles-index.md](interaction-design-articles-index.md) · [piecraft/README.md](piecraft/README.md) · [unified-webgpu-renderer.md](unified-webgpu-renderer.md) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md)  
**External designs (MOOLLM repo):** [designs/sim-obliterator/](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator) — vision (THE-UPLIFT.md), BRIDGE field mappings, IFF layer architecture, PSYCHOPOMP-AND-THE-BIFROST.md

> **Trademark notice.** *Micropolis* is used under the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md) from [Micropolis GmbH](https://www.micropolis.com/). *SimCity*, *The Sims*, and *Maxis* are trademarks of Electronic Arts Inc. and are used here only as historical references — to describe the original games' design and lineage, and to identify the EA-published product that Micropolis Home is a companion to. No affiliation with or endorsement by EA or Micropolis GmbH is implied. The full naming table is in the [On Naming](#on-naming) section below.

---

## Scope and intent

Two products under the *Micropolis* umbrella:

- **Micropolis City** — open-source city simulator, GPL-descended from EA's OLPC release of SimCity.
- **Micropolis Home** — content creation and content discovery companion for the Steam re-release of the original *The Sims* (Legacy Collection).

Micropolis Home **does not reimplement The Sims**: no motive engine, no SimAntics VM, no Maxis runtime code. It does not contain or redistribute EA assets. It produces `.iff` save files and custom IFF content that the user loads into their own copy of The Sims 1 — same pattern as Maxis-blessed custom content has worked since 2000.

### What Simopolis builds


| Category                                             | What we ship                                                                                                                                                                                                                                                                                                                                                                                                          | What it is                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File-format I/O**                                  | [packages/sims-io](../../packages/sims-io) — TypeScript IFF, FAR, FAMI, NBRS, PersonData parsers                                                                                                                                                                                                                                                                                                                    | Reads and writes the *public file formats* that have been documented and tooled by the Sims modding community for two decades ([FreeSO Wiki](https://wiki.freeso.org/), SimObliterator, SimPE, MTS, etc.). No EA code. No EA proprietary algorithms.                                              |
| **Micropolis City app**                              | The existing `apps/micropolis/` SvelteKit application running the GPL Micropolis engine                                                                                                                                                                                                                                                                                                                               | The city simulator. Runs cities. Reads bound-neighborhood metadata. Does not touch The Sims runtime.                                                                                                                                                                                              |
| **Micropolis Home app**                              | The new companion app (`apps/micropolis-home/`, currently scaffolded as `apps/simopolis/`) for Sims 1 content authoring and discovery                                                                                                                                                                                                                                                                                 | A *companion application* for **your own copy of The Sims that you bought from EA**. Drag a save in, examine/imagine/edit/inject, drag a save out, load into your Sims install. It does not run The Sims.                                                                                         |
| **Content creation tools (inside Micropolis Home)**  | The **Transmoogrifier** — the browser-native, TypeScript/WebGPU/LLM-assisted successor to Maxis's own [Transmogrifier](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf) (TMOG), originally written by Don Hopkins at Maxis as the official Sims content tool. The Transmoogrifier is the general IFF-object editor; the craft shops sit on top of it: the **Character Customization Studio** ([WigOMatic, HeadShop, CostumeRack, MakeupBar, AccessoryCounter](the-computer-as-portal.md#6-wigomatic-and-the-character-customization-studio)), the [Micropolis Rug-O-Matic](the-computer-as-portal.md#5-the-micropolis-rug-o-matic-rug), the Tombstone Studio, the Slideshow Press, the album / book compilers. The [Adventure Compiler](the-computer-as-portal.md) is the validate-and-flatten pipeline that takes Transmoogrifier output and the [Imagine Loop](the-imagine-loop.md) is the LLM-narrator timeline tool. | Tools that *produce* IFF objects, custom skins, custom lots, and family albums that **load into the EA-published Sims 1 on Steam**. Same pattern as the original Maxis-blessed TMOG; modernized for the browser and the moo era. |
| **Content discovery tools (inside Micropolis Home)** | The "Tornado" pipeline ([the-tornado-and-the-archives.md](the-tornado-and-the-archives.md)): recover ~25 years of Sims community content (family albums, custom skins, custom objects, fan-authored lots) preserved on [archive.org](https://archive.org) and curate it for present-day players                                                                                                                   | Surfaces existing community content — content created and shared *by Sims players*, never by EA — and makes it findable, attributable, and downloadable by current owners of the Steam re-release.                                                                                                |
| **The city sim engine**                              | `packages/micropolis-engine` — the open-source Micropolis engine, descended from the SimCity source code [released by EA under GPL for the OLPC project](https://donhopkins.medium.com/)                                                                                                                                                                                                                              | This is the publicly GPL'd Micropolis engine, embedded in Micropolis City. We have no city-simulation product that competes with anything EA currently sells. The city is the *index* into recovered Sims content; players who want to live in those lots play them in their EA-published Sims 1. |


### What Simopolis explicitly does **not** do

- **Does not ship a Sims simulator.** No motive engine, no SimAntics VM, no Maxis runtime code. When characters need to be *played*, they are played in your EA-published copy of The Sims 1 (Legacy Collection on Steam). When characters need to be *authored, edited, enriched, imagined-forward-in-time, or discovered*, that happens in Micropolis Home as a companion tool. See [the-imagine-loop.md](the-imagine-loop.md) for the much more exciting alternative to reimplementing the runtime: LLM-as-narrator, not LLM-as-simulator.
- **Does not include EA assets.** No textures, sprites, meshes, BHAVs, lots, sounds, music, or other content owned by Electronic Arts is included in this repository. The retail demo and 1998 prototype assets in `content/vitamoo/` are limited research and animation-pipeline artifacts treated under the same rules the Sims modding community has used for two decades.
- **Does not redistribute EA save files.** Save files in the recovery pipeline come from public community archives ([archive.org](https://archive.org) snapshots of fan sites, the Sims Exchange, etc.) or from the user's own install. They are authored by *players*, not by EA. Provenance is mandatory and a takedown channel is part of the design.
- **Does not break trademark.** We use *Micropolis* (under the Micropolis GmbH name license) for our city simulator. We reference *SimCity* and *The Sims* only historically and never apply those names to any product, modification, or distribution. See the trademark notice above and the trademark summary table below.
- **Does not compete with The Sims.** It depends on The Sims. Every character authored or recovered in Simopolis becomes more valuable to a player who *owns and plays* The Sims 1 on Steam.

### Why this is good for the Steam re-release of *The Sims*

EA's [Sims Legacy Collection](https://store.steampowered.com/) is a re-release of a 25-year-old game. Its long-term value depends on the player community keeping the game alive — making content, sharing stories, finding reasons to come back.

Simopolis directly increases that value:


| Lever                                                            | Effect                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recovers and surfaces 25 years of community content.**         | Old players find their old families. New players discover thousands of authored stories. Both populations have reasons to launch the EA-published game *more often*, not less.                                                                                                                                                                                         |
| **Provides modern content creation tools.**                      | The original Maxis Transmogrifier hasn't been updated in decades. A modern, browser-native, LLM-assisted successor makes it dramatically easier for current players to create custom skins, objects, lots, and stories — all of which load into the EA game.                                                                                                           |
| **Translates community content to all 20 supported languages.**  | Auto-internationalizer (see [BRIDGE.md](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md#auto-internationalizer)) means stories created in English can be read by current Sims 1 players in Tokyo, Moscow, Tel Aviv, and Buenos Aires — in their language, in-game. The Steam re-release's international audience is expanded for free. |
| **Drives traffic *into* the EA-owned product.**                  | Every Family Album viewed, every recovered neighborhood explored, every uplifted character is a moment that ends with "now load this into your Sims 1 game." That game is sold by EA.                                                                                                                                                                                  |
| **Builds an ethical, attribution-respecting community archive.** | Provenance-mandatory, takedown-respecting, living-person-cautious. The opposite of the rip-and-repost economy. Makes the surviving Sims community a healthier place for EA's customer base.                                                                                                                                                                            |
| **Honors the design lineage publicly.**                          | The 1996 Will Wright Stanford demo, the Maxis Transmogrifier design document, the SimAntics VM Design Document, the Family Album feature — all properly cited as Maxis/EA innovations. Simopolis amplifies the cultural standing of The Sims, it does not dilute it.                                                                                                   |


This is the same pattern that made the modding-tool ecosystems around *Skyrim*, *Civilization*, *Cities: Skylines*, and the wider Sims community itself net-positive for the publishers. Tools that help current owners get more out of their purchase are good business as well as good citizenship.

### Trademark and licensing summary (forward reference)

The full trademark summary table and the precise scope of *Micropolis* vs *SimCity* vs *The Sims* usage in this project lives in the [On Naming](#on-naming) section below. Read it together with the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md) and the [GPL Notice](../../MicropolisGPLLicenseNotice.md).

---

## Two products, one umbrella

Simopolis is the **vision**. The vision ships as **two complementary products**, both branded under the *Micropolis* trademark we have licensed from Micropolis GmbH, neither using any EA-owned mark in its product name:


| Product             | What it is                                                                                                                                                                                                           | Where in the monorepo                                                                                                                                          | Role                                                                                                                                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Micropolis City** | The open-source city simulation, GPL-descended from EA's OLPC SimCity release. The "macro" lens on Simopolis.                                                                                                        | `apps/micropolis/` (production name → **Micropolis City**)                                                                                                     | Runs cities. Reads bound neighborhood metadata from Micropolis Home. The visible Micropolis-side of the two-resolution world.                                                                                                                                                                                |
| **Micropolis Home** | Sims 1 content discovery, exploring, examining, editing, and generating tool. The "micro" lens on Simopolis. **Companion to the EA-published Sims 1 (Legacy Collection on Steam); does not run The Sims simulator.** | Currently planned as `apps/simopolis/` in earlier docs; **production name will be Micropolis Home**, and the directory will migrate to `apps/micropolis-home/` | Hosts the [Adventure Compiler](the-computer-as-portal.md), the [Family Album server](simopolis-uplift-roadmap.md#track-b-family-album-server), the [Archive Tornado](the-tornado-and-the-archives.md), and the [Imagine Loop](the-imagine-loop.md). Emits IFF content the player loads into their EA Sims 1. |


The names parallel each other deliberately:

- **A city is many homes; a home is one cell of a city.** The two products are the two ends of the same zoom-spectrum.
- Both use **Micropolis** (which we have licensed) — never *SimCity* or *The Sims* (which we do not).
- *Simopolis* persists as the **umbrella concept name** (and as the literary reference from Marusek's *[The Wedding Album](https://en.wikipedia.org/wiki/The_Wedding_Album_(short_story))*). It is the *project vision*; the two products *under* it are **Micropolis City** and **Micropolis Home**.

The naming is intentional legal hygiene. When marketing materials, screenshots, app names, or external communication reference the products, the strings are **"Micropolis City"** and **"Micropolis Home"**. The word "Simopolis" appears only in design documents, in fiction (Marusek), and as the integration concept — never as a shipping product name, never adjacent to EA's trademarks.

Some earlier passages in this and other design documents still say `apps/simopolis/` or "Simopolis the app." Those are historical and refer to what is now planned as **Micropolis Home** in `apps/micropolis-home/`. The two are the same thing under different names; the production name is the new one.

---

## The Thesis

Micropolis (the GPL city simulation descended from the original SimCity) and The Sims were always the same game at different scales.

In Micropolis, each **residential zone** is a **3×3 block of map tiles** — nine cells the engine treats as one unit for density, demand, and aggregate population (the SimCity shorthand of *thousands of anonymous people*). In The Sims, each **person** has a name, a personality, 88 data fields, a family, relationships, a job, memories. Every zone block is a place where dollhouse detail *can* replace that compression. Every Sims lot maps to one or more cells inside that block.

**What if the compression was optional?**

In the Simopolis companion application (running in the browser, beside your EA-published copy of The Sims 1 on Steam), a Micropolis residential zone can open to reveal a full Sims neighborhood — families, relationships, motives — parsed from public-format `Neighborhood.iff` files. The neighborhood's aggregate behavior feeds back into the Micropolis city simulation: tax revenue, crime rate, land value, commute demand. Going the other direction, a Maxis-style custom Sims object — a "computer," "TV," or "slideshow" object created with Simopolis content tools and dropped into the player's own Sims install — can display the current state of a Micropolis city *inside The Sims itself*, its traffic jams and budget crises rendered through the Sims' own object system (sprites, BHAVs, popups), the way Rug-O-Matic rendered custom rugs and Don's tombstone server rendered custom tombstones.

The two simulations are not just neighbors in a monorepo — they are **the same world at two resolutions**, and the player can zoom between them: Micropolis-side in the Simopolis companion app, Sims-side in their EA-published Sims 1. The companion app does not run The Sims simulation; The Sims (Legacy Collection) does. The companion app makes the *content* that the EA game plays.

**Simopolis** is the project name for this integration. It is also the name the characters in ["The Wedding Album" (Marusek, 1999)](https://en.wikipedia.org/wiki/The_Wedding_Album_(short_story)) give the place where digital people live — a word that already exists in the cultural vocabulary for exactly this.

### Historical proof: this was always the plan

This is not a retroactive interpretation. On **April 26, 1996**, four years before The Sims shipped, Will Wright gave a talk at Stanford titled **"Interfacing to Microworlds"** (Terry Winograd's UI class), in which he demonstrated an extremely early prototype he called *Dollhouse* — what would become The Sims.

The first thing he did in the demo was **load a SimCity save file into Dollhouse**, zoom down from the city map to street level, then into a single lot, and walk an avatar around inside a house he built in real time. The lot was on a real SimCity street. The roads and terrain came straight from the .cty file.

> *"This is a game I call Dollhouse. And if this looks familiar, it's because I've just loaded a SimCity file into here. […] now at this point I can actually zoom down to the street level. […] It's very feasible for us to put a database in for every building in SimCity, so that I could actually walk anywhere in the city I've created, and into any building."*
>
> — Will Wright, Stanford, 1996  
> [video](https://www.youtube.com/watch?v=nsxoZXaYJSk) · [transcript & notes](https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d)

In the same demo he articulated three other principles that became the architectural spine of The Sims, all of which Simopolis inherits:

1. **Data-driven distributed simulation.** *"The cool thing about this game is that almost the entire simulation is data driven at a local level. […] The object itself contains the descriptions of how a person interacts with it, and why, what the animation sequence would be, and the scheduling."* This became SimAntics: behaviors live in objects, not in the engine.
2. **The hobby model, not the movie model.** *"I want the games to actually be able to have persistent data that can move from one game to another, or have a large data set that I can reuse in different ways."* User-authored objects on the network, downloadable, composable — a *nurturing environment*, not a sequel treadmill.
3. **Players use the simulation as a medium to tell stories.** Don Hopkins interjects: *"They're using it as a medium to tell stories about. […] Where they're using it as a piece of paper, to write."* Will agrees: *"That's exactly right. […] the story becomes their logical reverse engineering of the simulation that they're playing inside of."* This is the Family Album, four years before the Family Album shipped in The Sims (2000).

So when MicropolisCore zooms a residential zone open to reveal a Sims neighborhood, when a Sims computer displays a running Micropolis city, when a player's MOOLLM-enriched character walks back into a save file with a Family Album that crosses both worlds — we are not extrapolating. We are finishing the 1996 demo.

---

## Why MicropolisCore Is the Right Home

MicropolisCore already has:

- `**packages/micropolis-engine`** — The Micropolis city simulation engine (C++/WASM, GPL + EA additional terms)
- `**packages/sims-io**` — TypeScript Sims 1 I/O stack: FAR archives, IFF containers, FAMI/NBRS neighborhood parsing, PersonData (L0–L3 complete)
- `**packages/vitamoo**` + `**packages/mooshow**` — VitaBoy character animation, WebGPU renderer
- `**content/vitamoo/sims-prototype-1998/**` — 294 prototype CMX animations (June–December 1998)
- `**content/vitamoo/sims-demo/**` — retail character demo pack

The Python codebase that has been doing save-file parsing (SimObliterator Suite) is being rewritten in TypeScript here, so it runs natively in the browser — no Python interpreter, no subprocess, no venv. The hard parsing work is largely done: `packages/sims-io` already parses neighborhoods. The next layers build on it.

Micropolis and The Sims share infrastructure that belongs in this repo:


| Shared layer                                    | Used by                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| WebGPU renderer (`packages/vitamoo`, `mooshow`) | Sims character animation **and** future Micropolis tile rendering |
| Pie menus                                       | Both games — Don Hopkins built them for both                      |
| IFF/FAR file format code (`packages/sims-io`)   | Sims objects, saves **and** future Micropolis resource files      |
| Content variants system (`content/`)            | City saves, Sims demo packs, prototype content                    |
| VitaMoo character pipeline                      | Sims characters **and** future Micropolis people at street level  |


---

## The Two-Resolution World

The two resolutions correspond exactly to the split between Simopolis (companion authoring + city sim) and the EA-published Sims 1 (the runtime that plays the content):

```
Micropolis (macro)                 The Sims (micro)
─────────────────────────────      ─────────────────────────────
Runs in: apps/micropolis           Runs in: the EA-published Sims 1
  (this monorepo, GPL Micropolis     (Sims Legacy Collection on Steam)
   descended from EA's OLPC          — NOT in this monorepo, never
   SimCity release)                   reimplemented here.

Residential zone tile              → Neighborhood.iff
  tax revenue, crime, density      → FamilyData: budget, house#  (file format
  thousands of anonymous people    → NeighborData: 88 shorts each   only —
                                                                   parsed,
                                                                   not run)

Lot on the city grid               → Lot + House##.iff
  land value, access, services     → Objects, furniture, routing

City simulation tick               → Sims runtime tick
  (Micropolis CA, runs here)         (Maxis SimAntics, runs in EA game,
  needs-based autonomy               we DO NOT replicate it)
  budget crunch                      motive engine + BHAV trees: the
                                     player's EA game runs these

City event: fire, disaster         → Sims event: fired, married
  (Micropolis-side simulation)       (EA-side simulation; Simopolis only
                                      observes via parsed save files
                                      and only writes back via documented
                                      save mutations the player applies)
```

**The Computer object** in The Sims is already a portal to other "games" inside the fiction. Simopolis ships a custom IFF *content object* — a "computer," "TV," or "slideshow" — authored by our content tools, which the player drops into their EA-published Sims 1 install. That custom object, *playing inside the EA game's own object system*, displays the current state of a Micropolis city (rendered as Sims sprites and popups through Maxis's documented BHAV + STR# + SPR2 mechanism, exactly like Rug-O-Matic rendered custom rugs). The "two simulations coupled" is achieved entirely through *content* the player loads into their game, not by us running The Sims's simulation.

The full design — the Uplifted Computer object, the CD-ROM / Save-Game Disk / Photo Album custom IFFs, the MOOLLM URL scheme that lets the catalog of "installed software" point at Micropolis cities and recovered Sims neighborhoods, the screen-snapshot pipeline that bakes city renders into the Computer's SPR2 atlas, and the three embeddings (Sims-in-Sims, Micropolis-in-Sims, Sims-in-Micropolis) — lives in [the-computer-as-portal.md](the-computer-as-portal.md).

**The residential zone** in Micropolis (which we *do* run, because Micropolis is GPL'd from EA's OLPC SimCity release) is already an aggregate. In Micropolis Home, the player can open a zone to see the parsed `Neighborhood.iff` from their own Sims install, the families inside, the social graph — all rendered as a *visualization* of files the player owns. The aggregate metrics flow into the Micropolis simulation. Change a family's income in the companion app, write a new `.iff` the player loads into their EA Sims 1; the zone's land value tick in Micropolis reflects the change on the next read. The simulation feedback loop is real, and it is realized **through content artifacts the player chooses to install, not through any process that runs the Sims engine**.

This is not two games glued together. It is **one world rendered at two resolutions**, switchable by the player's zoom level.

### How Sims save files actually bind to Micropolis tiles

The naive model is "one residential zone = one Sims `Neighborhood.iff`." The actual model — which the Phase 2 data contract in [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md) is designed to support — is much richer, because **every residential zone is a fixed 3×3 tile block**, and what fills that block depends on density.

#### Residential zone geometry (always 3x3)

On the Micropolis map, a **residential zone is always nine tiles** — a 3×3 square anchored at `(row, col)`. The city simulation counts that whole block as one zone for land value, crime, demand, and the aggregate fiction of *many* anonymous residents.

What occupies those nine cells is either **many small lots** or **one big building**:

| Zone density | What fills the 3×3 | Typical Sims binding |
|---|---|---|
| **Low** | Up to **9 single-tile lots** — small houses, one per cell | One household save per occupied cell (magic 8 Sims max each) |
| **High** | **One bigger building** — tower, slab, courtyard block spanning the whole 3×3 | Many household saves *inside* that one building (magic 8 per floor × N floors) |
| **Rendered showcase** (optional) | **One Sims lot** whose semi-iso architecture is **sliced across all 9 tiles** as custom map art | One primary lot; nine tile overlays for the satellite view |

Empty cells in a low-density zone are **lots for sale** — slots waiting for a player save or a Tornado-recovered household.

Three binding patterns in the data contract correspond to the rows above:

#### Low-density residential (nine single-tile lots)

A low-density residential zone is the full **3×3 block**. Small houses appear **one per tile** as the zone develops. Each occupied cell is a **tile-house** carrying its **own dedicated Sims household save** — typically one family per cell. As the zone fills in, more cells get houses; each is a slot the player can populate from their own saves or from Tornado-recovered families.

```
Low-density res zone (3×3 = 9 cells)     Bound households (1 per occupied cell)
┌───┬───┬───┐                              [0,0]:  goth-family.iff
│ 🏠 │ . │ 🏠 │                              [0,2]:  pleasant-family.iff
├───┼───┼───┤                              [1,1]:  newbie-family.iff
│ . │ 🏠 │ . │                              [2,1]:  empty (lot for sale)
├───┼───┼───┤                              [2,2]:  recovered-goth-2003.iff
│ . │ 🏠 │ 🏠 │                              … up to 9 single-tile lots
└───┴───┴───┘
```

Each tile-house owns its own `provenance.yml`, its own license trail, its own attribution. Tiles in the zone's *empty* spaces are lots-for-sale that the player can fill from Micropolis Home's recovered-content browser.

#### High-density residential (one building in the 3×3)

High-density zones use the **same 3×3 block**, but visually and logically as **one bigger building** — not nine separate houses. A single tower (or slab, or courtyard block) spans the whole zone. Inside that one building live **many** households: *the magic 8* (The Sims 1's hard household-size limit: 8 Sims per save) **per floor, times as many floors as the zone's development level allows**.

```
High-rise in one 3×3 res zone (one building footprint)
┌─────────────────────────┐
│ Floor 12: 8 households  │  ← (8 × 12) = up to 96 distinct Sims households,
│ Floor 11: 8 households  │     each its own .iff slot,
│ Floor 10: 8 households  │     inside this single 3×3 zone
│ ...                     │
│ Floor  2: 8 households  │
│ Floor  1: shops/lobby   │  ← optional commercial first-floor slot
└─────────────────────────┘
   ↑ occupies all 9 map tiles as one structure
```

The tower's aggregate metrics (population, education average, satisfaction, commute demand) roll up across every bound household in that building; the data contract still keys off the **zone's 3×3 anchor**, not nine independent lots.

This is also the natural place for the genre-bridging hook into [Micropolis Tower (speculative)](#what-this-architecture-enables-forward-looking-speculative). A tower-class sub-simulator's save file could bind here on the same seam.

#### One lot rendered across the 3×3 (the "Sims-Online map" mode)

A third binding pattern, the most cinematic: **one Sims lot** whose architecture is rendered in semi-iso perspective (the same semi-iso the Sims and SimCity use), then **sliced into nine custom 1×1 Micropolis tiles** that replace the default graphics for that zone's 3×3 block.

The result: **the Micropolis city map literally shows the player's Sims lots** — the houses they built, the gardens they planted, the swimming pools they dug, the funny-shaped roofs they decorated — instead of generic colored squares. The city is a satellite view of the actual neighborhood.

```
One Sims lot rendered in semi-iso, sliced into 3×3 = 9 custom tiles
that overlay the Micropolis residential zone:

   semi-iso lot render:                tile slice (3×3):
        ╱╲                          ┌────┬────┬────┐
       ╱  ╲  🌳                      │roof│roof│tree│
      ╱ 🏠 ╲                         ├────┼────┼────┤
     ╱──────╲ 🏊                     │door│lawn│pool│   ← live overlay onto
    🌳 lawn  🚗                       ├────┼────┼────┤      Micropolis zone (row 23, col 47..49)
                                     │side│path│gate│
                                     └────┴────┴────┘
```

The historical precedent is [The Sims Online](https://en.wikipedia.org/wiki/The_Sims_Online), whose world map composed *thumbnails of every player's lot* onto the persistent shared map. The famous social emergent property: **players painted words and icons on their roofs** so the map view became a giant communal pinboard — protest signs, jokes, declarations of love, neighborhood themes.

Simopolis inherits the pattern. Per-lot rooftop content authored in Micropolis Home (custom roof-texture IFFs, or generated text/icon overlays at lot-render time) becomes visible at the Micropolis map level. A row of houses where every roof spells a friend's name; a lot where the roof is a painting of a meteorite (Cassandra's, of course); a high-rise where each floor's exterior is themed for its bound household. Social signal, rendered top-down.

### Mixing the three patterns

Real cities mix the patterns. A 30×30-tile Micropolis residential district might hold:

- Six **low-density 3×3 zones**, each with up to nine single-tile lots (only some cells occupied).
- One **high-density 3×3 zone** — one tower building — with 64 households (8 floors × 8 apartments).
- One **rendered-lot showcase 3×3** where the player sliced one dream house across all nine cells for the satellite view.

The Phase 2 data contract — `content/micropolis/cities/<city>/neighborhoods/zone-<row>-<col>.yml` — supports all three patterns through a single `binding:` field that names the pattern and lists the bound saves accordingly:

```yaml
# content/micropolis/cities/haight/neighborhoods/zone-23-47.yml
# Anchor (23,47) = top-left of a 3×3 res zone (tiles through row+2, col+2)
zone:
  city: haight
  anchor: { row: 23, col: 47 }
  size: { rows: 3, cols: 3 }
  zone_type: residential
  density: low
binding:
  pattern: tile-houses           # up to 9 single-tile lots inside the 3×3
  tile_houses:
    - { cell: [0, 0], save: goths-2003.iff }
    - { cell: [0, 2], save: pleasants-current.iff }
    - { cell: [1, 1], save: newbies-current.iff }
    - { cell: [2, 2], save: recovered-cromwell-2002.iff }
roof_content:                    # optional per-cell rooftop overlays (low-density 3×3)
  - { cell: [0, 0], text: "Welcome Home Cassandra!", style: 1950s-marquee }
  - { cell: [2, 2], image: meteorite.png, source: cassandra-album }
aggregate_metrics:
  household_count: 4
  average_income: 18200
  education_average: 6.4
  satisfaction: 0.68
```

```yaml
# content/micropolis/cities/haight/neighborhoods/zone-30-30.yml
zone:
  city: haight
  anchor: { row: 30, col: 30 }
  size: { rows: 3, cols: 3 }
  zone_type: residential
  density: high
binding:
  pattern: high-rise-tower       # one building in the 3×3
  floors: 8
  households_per_floor: 8        # the magic 8
  occupancy:
    - { floor: 8, slot: 1, save: goths-2003.iff }
    - { floor: 8, slot: 2, save: recovered-cromwell-2002.iff }
    # … etc. (sparse OK; empty slots are vacant apartments)
aggregate_metrics:
  household_count: 17
  average_income: 14100
  education_average: 7.1
  satisfaction: 0.71
```

```yaml
# content/micropolis/cities/haight/neighborhoods/zone-12-08.yml  (3×3 showcase)
zone:
  city: haight
  anchor: { row: 12, col: 8 }
  size: { rows: 3, cols: 3 }
  zone_type: residential
  density: medium
binding:
  pattern: rendered-lot
  save: cassandra-dream-house.iff
  render:
    method: semi-iso             # render the lot in Sims-style semi-iso
    slice: { rows: 3, cols: 3 }
    target: replace-default-tile-sprites
  rooftop_overlay:
    text: "Cassandra & Alexander Live Here"
    style: hand-painted
aggregate_metrics:
  household_count: 1
  average_income: 24000
  education_average: 9.0
  satisfaction: 0.94
```

The three `binding.pattern` values — `tile-houses`, `high-rise-tower`, `rendered-lot` — are the canonical first set. The architecture is open to more (mixed-use, mansion-occupying-multiple-tiles, etc.). The Adventure Compiler validates each binding against the actual Sims save data; if a save claims 64 floors of 8 households each, the compiler checks that all 512 PersonData arrays parse cleanly before the binding flatten succeeds.

The map renderer in Micropolis City reads `roof_content` and `render` blocks per zone and composites the per-lot overlays into the city map at the appropriate zoom level. The default Micropolis tile sprites are the fallback; bound zones override.

This is the closest Simopolis comes to a *love letter to The Sims Online's map*. The tech is different (custom tiles in a GPL Micropolis client, instead of TSO's bespoke server); the social property is the same: **the city map is what your community made of it**.

---

## The Uplift: Characters Who Travel

The most immediate visible capability is what the MOOLLM designs call **The Uplift**: a two-way bridge between Sims 1 save files and enriched LLM-powered environments where characters can actually speak, reflect on their past, and return home changed.

The full story, pipeline, and literary precedent are documented in the MOOLLM repo:  
→ **[designs/sim-obliterator/THE-UPLIFT.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/THE-UPLIFT.md)**

The key point for MicropolisCore is: **this is now a TypeScript implementation**. The Python parsing layer that existed before lives here as `packages/sims-io`. The LLM enrichment and character bridge live in MOOLLM. The character animation and rendering live in `packages/vitamoo`/`mooshow`. The monorepo holds all of it.

### The short version

> Drag a 25-year-old Sims save file in. Watch the character wake up in **Micropolis Home**. Have a conversation with them. Introduce them to other characters and pets — who they can fall in love with and take home. Go shopping. Create and customize content. **Place your soul mate, pets, and purchases into your Sims home save file, and then play with it all in the real game on Steam.**

The full arc, unpacked:

1. **Drag a 25-year-old Sims save file in.** The save can come from the player's own install, a Family Album they upload, or a household recovered by the [archive Tornado](the-tornado-and-the-archives.md). [packages/sims-io](../../packages/sims-io) parses it into a roster of characters with all their personalities, skills, relationships, job history, and family memories intact.
2. **Watch the character wake up in Micropolis Home.** The Sims-side [sims_traits](https://github.com/SimHacker/moollm/tree/main/skills/character) cross the [Bifrost](moollm-microworld-os.md#the-bifrost-the-bridge-as-a-structured-ontological-transition) and become a MOOLLM `CHARACTER.yml` with a [Leary `mind_mirror`](moollm-microworld-os.md#the-double-personality-model-wright--leary) inferred from those traits and any Family Album prose. The character speaks full language now.
3. **Have a conversation with them.** Not a chatbot. A persistent MOOLLM citizen with a directory, a soul file, a memory log, and inspectable state. They remember what was said.
4. **Introduce them to other characters and pets.** Other recovered characters from the same neighborhood. Other recovered characters from *anyone else's* neighborhood the Tornado pulled back. MOOLLM-native characters (the pub regulars, the cat-cave kittens). All in the same [Speed-of-Light](moollm-microworld-os.md#speed-of-light-why-this-isnt-an-ai-npc-architecture) context — they meet each other in shared workspace, not in serial API calls.
5. **They can fall in love and take each other home.** Relationships form in MOOLLM. When the player decides, the new partner, the kitten, the friend — *every relationship* — gets compiled back through the Adventure Compiler into Sims `.iff` data the player imports. The whole household travels together; each new arrival gets their own PersonData, their own `CHARACTER.yml`, their own provenance trail.
6. **Go shopping.** Browse archived community content: skins, custom objects, custom lots, fan-authored families, decades of player-uploaded Family Albums recovered from [archive.org](https://archive.org) into `content/simopolis/archives/`. Find a 2003 painting that fits the household. Pick a recovered rug. Pick a recovered sofa. All with attribution and provenance preserved.
7. **Create and customize content.** Inside Micropolis Home, the modern browser-native successor to Maxis's [Transmogrifier](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf) authors custom IFF objects with LLM and WebGPU help. Visit [**WigOMatic**](the-computer-as-portal.md#6-wigomatic-and-the-character-customization-studio) and put a 1950s platinum-finger-waves wig on Bella. Compose a family photo book. Make a [Micropolis Rug-O-Matic rug](the-computer-as-portal.md#5-the-micropolis-rug-o-matic-rug) that displays your own Micropolis city on the living-room floor. Author an [Uplifted Computer](the-computer-as-portal.md#1-the-uplifted-computer-custom-computer-object) loaded with apps and a 2003 album to play on a Sim's PC.
8. **Optionally, fast-forward the timeline.** Use the [Imagine Loop](the-imagine-loop.md): "Five years pass. Cassandra goes to college. New child." The LLM examines the household, imagines a coherent five-year arc, edits the YAML, and produces a valid `.iff` plus a pageable album book of the five years for the shelf.
9. **Place your soul mate, pets, and purchases into your Sims home save file.** Everything compiles down to standard IFF artifacts — a new `Neighborhood.iff` for the household, custom object IFFs for the purchases, a custom Pageable Album Book for the memories. The player downloads the bundle and drops it into `~/Documents/EA Games/The Sims/Downloads/`.
10. **Then play with it all in the real game on Steam.** Launch the EA-published Sims 1 (Legacy Collection). The household is there, larger and richer. The new partner is at the kitchen table. The kitten is on the couch. The Micropolis Rug-O-Matic rug is on the living-room floor, cycling between day and night views of Haight. The Uplifted PC is in the study, with the 2003 album already in its catalog. The Maxis runtime plays it all natively, because all of it is standard Sims custom content.

The bridge is bidirectional, but the *destination of play* is always The Sims. **Micropolis Home is where content is created, edited, enriched, imagined-forward, and discovered. The Sims (Legacy Collection) is where it's played.** The characters are real in both directions. Neither direction is "the copy" — they are parallel projections, the way an `.iff` file on disk and a Sim walking around inside the game are projections of the same character. See [Scope and intent](#scope-and-intent).

---

## The Fertile Ecosystem, Not the Killer App

The Sims succeeded not because of its simulation quality alone but because of its **object model and extensibility**:

- Objects expose affordances that behaviors read
- Behaviors are composable SimAntics trees
- Users can author, remix, and share objects, skins, animations, houses
- Transmogrifier, IFFPencil2, Rug-O-Matic, the tombstone server: tools built on the object model
- SimAntics running a Lilliputian Micropolis inside The Sims

This is what Don Hopkins means when he says The Sims is a **nurturing ecosystem**, not a killer app. Will Wright described the same community in May 2001 as *"like an ecology"* with tool-makers, content artists, mainstream content sites, and news sites about the other sites — all of them filling different niches and interdependent. (See [the-tornado-and-the-archives.md → Contemporary record (May 2001)](the-tornado-and-the-archives.md#contemporary-record-may-2001-will-wright-on-the-scale) for the primary source and Will's other concrete numbers from that interview.)

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

## What this architecture enables (forward-looking, speculative)

The two-resolution world generalizes. The same pattern — a Micropolis residential or commercial zone bound to a higher-resolution save file from another simulator, with aggregate metrics rolling up — works for *any* sub-simulator whose state can be read, parsed, and summarized.

The Sims is one such sub-simulator (low-density residential, in-house apartment buildings). Others, if we ever extend in that direction, naturally fit on the same pattern:

| Genre of sub-simulator | What it binds to in Micropolis | What aggregates up |
|---|---|---|
| **Household / life simulator** (The Sims is the canonical example) | Low-density residential zones, in-house apartments | Population, education, satisfaction, household income |
| **Tower / vertical-density simulator** (the *SimTower* / *Yoot Tower* genre) | High-density commercial and residential zones | Employment, foot traffic, vertical infrastructure load, mixed-use density |
| **Building / venue simulator** (theme parks, zoos, malls) | Commercial special-use zones | Visitor counts, revenue, operations stress |
| **Ecology simulator** (the *SimEarth* / *SimAnt* genre) | Park, water, agricultural zones | Biodiversity, pollution absorption, food production |
| **Transportation simulator** | Road, rail, port, airport tiles | Traffic capacity, network reach |

None of these are committed. The point is **the architecture supports them naturally**, because the contract between Micropolis City and any sub-simulator is small and well-defined: parse a save file, expose aggregate metrics for the bound tile, optionally accept city-level signals back. That's it. The Sims work we are doing first — file format parsing in [packages/sims-io](../../packages/sims-io), zone↔neighborhood binding in [Phase 2](simopolis-uplift-roadmap.md#phase-2--two-resolution-coupling-micropolis-zone--sims-neighborhood-4-6-weeks), aggregate-metric data contract — is general infrastructure. The next sub-simulator, when it comes, plugs in along the same seam.

### Exemplar: Micropolis Tower

The most evocative concrete example, used here strictly as an *illustration of what the architecture enables and not as a roadmap commitment*, is **Micropolis Tower** — what high-density commercial and residential zones would become if they were bound to a tower-simulator the way residential zones are bound to a Sims neighborhood file.

The genre's canonical example is *Yoot Tower* (1998, Yoot Saito) — itself the sequel to *SimTower*, with which Maxis published Saito's original *The Tower*. Don Hopkins is in conversation with Yoot Saito about the possibility of an open-source release of the original Yoot Tower source, which Yoot has indicated openness to. **No promise is made here about whether that pathway will succeed.** It depends on legal coordination with multiple parties and is not in our control.

What we *can* commit to:

- **If a real open-source release of a Yoot-Tower-class simulator becomes available** under terms compatible with this project, integrating it as the simulator behind Micropolis Tower's high-density zones is straightforward under the architecture above. The integration looks exactly like the Sims-neighborhood integration: parse the tower save file, expose aggregate metrics (employment density, vertical traffic, lobby capacity) for the bound commercial tile, accept city-level signals back (commute demand from connected residential zones, transit capacity on adjacent road tiles).
- **If no such release becomes available**, the architecture still admits a tower-simulator written from scratch, plugged in along the same seam. Multiplayer SimTower-style tower-management games are a small enough genre that a clean-room implementation is plausible.
- **Either way**, the headline insight stands: a Micropolis high-density commercial tile *could*, on the same data contract that today lets it bind to a Sims neighborhood, bind to a tower of offices, shops, restaurants, apartments. The architecture is not Sims-specific. It is *resolution-bridging-specific*.

This is mentioned because it is *mind-expanding about the design philosophy*, not because it is on any committed roadmap. If you take only one thing from this section: the work being done now — file-format parsers, MOOLLM URLs, aggregate-metric data contracts, the Imagine Loop, the Adventure Compiler — is *substrate*. Anything that can be saved, parsed, and rolled up to aggregate metrics can someday plug in. The Sims is the first. It is not the last.

Forward-looking notes in this section are clearly marked as speculative; they should not be quoted as commitments.

---

## Architecture (Current State)

```
MicropolisCore/
  packages/
    micropolis-engine/     ← Micropolis city sim C++ → WASM (GPL)
    sims-io/               ← TypeScript Sims I/O (L0–L3 done, L4–L5 next)
      l0/  ✅ NodeResourceProvider, MemoryResourceProvider
      l1/  ✅ VirtualTree (FAR archive + loose-file overlay)
      l2/  ✅ IFF container + chunk parsing (re-exported from vitamoo:
              parseFar, listIffChunks, generic chunk payload views)
      l3/  ✅ parseFami, parseNbrs, PersonData (80 base + 8 EP fields),
              scanForNeighborhoods, resolveFamilies
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

**What is missing (the Simopolis layers — all of these are *content tools*, none of them are a Sims simulator):**

```
  packages/
    sims-io/
      l4/  ContentIndex bridge → vitamoo/mooshow + MOOLLM CHARACTER.yml
      l5/  Imagine Loop: examine, imagine-apply, validate, compile
           Adventure Compiler targets: computer, cd, album, savegame-disk, camera
           ← All of these produce IFF artifacts loadable into the
             EA-published Sims 1 (Legacy Collection on Steam).

  apps/
    micropolis-city/        ← (rename target for current apps/micropolis/)
                              The Micropolis City product: city simulation.
                              Already exists.

    micropolis-home/        ← (currently scaffolded as apps/simopolis/)
                              The Micropolis Home product: companion
                              content-creation + discovery app. Browser-based.
                              Sits NEXT TO the EA-published Sims 1, does
                              not replace it.

    album-server/           ← Compatible Family Album endpoint for the
                              Steam Sims client's existing upload feature.
                              Receives albums; does not run the game.

  tools/
    tornado/                ← archive.org content-recovery CLI. Brings
                              back 25 years of player-authored content
                              so current Sims 1 owners can find it.
    transmoogrifier/        ← Browser-native, TypeScript IFF-object editor.
                              The modernized successor to Maxis's TMOG;
                              the engine the craft shops run on.
    adventure-compiler/     ← Validate-and-flatten pipeline that takes
                              Transmoogrifier output (and MOOLLM adventure
                              source) and emits engine-ready artifacts.
      targets/computer.ts             — Uplifted Computer
      targets/cd.ts                   — CD-ROM (MOOLLM-URL-bearing)
      targets/savegame-disk.ts        — Save-Game Disk
      targets/album.ts                — Foreign Photo Album (pageable)
      targets/rug.ts                  — Micropolis Rug-O-Matic Rug
      targets/wigomatic.ts            — WigOMatic (first vertical)
      targets/customization/          — HeadShop, CostumeRack, MakeupBar,
                                         AccessoryCounter (rest of the
                                         Character Customization Studio)
      targets/camera.ts               — Screen-Snapshot Camera

  documentation/designs/
    simopolis.md                       ← This document (umbrella vision)
    moollm-microworld-os.md            ← Agent layer
    the-tornado-and-the-archives.md    ← Recovery pipeline
    the-computer-as-portal.md          ← Custom-IFF content (Uplifted Computer)
    the-imagine-loop.md                ← LLM-as-narrator (Examine→Imagine→Edit→Inject)
    simopolis-uplift-roadmap.md        ← Build plan
```

**What is and is not in this repo (canonical scope):**


| In scope                                                                                | Not in scope                                                     |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Micropolis City (open-source city sim, publicly GPL'd from EA's SimCity OLPC release)   | The Sims runtime / motive engine / SimAntics VM (EA proprietary) |
| Micropolis Home (companion content-creation/discovery app for the EA-published Sims 1)  | A reimplementation of The Sims                                   |
| TypeScript parsers for the publicly-documented IFF/FAR formats                          | EA assets: art, sounds, music, BHAVs, lots                       |
| Content creation tools that *emit* IFF files                                            | A Sims game that *runs* IFF files                                |
| The Imagine Loop (LLM imagines outcomes; produces valid `.iff` for the EA game to play) | An LLM-driven Sims runtime                                       |
| Content discovery + recovery tools backed by `archive.org` provenance                   | Republishing EA-owned content from the Sims Legacy Collection    |


---

## Git-managed user Sims directory

Micropolis Home treats **the user's own EA-published Sims directory as a git working copy**. We provide a `.gitignore` that excludes EA's binary game files and lets the player `git init` directly on top of their existing `~/Documents/EA Games/The Sims/` tree (or the platform-equivalent location). What lives under git after that is *the user's own content*: their saves, their downloaded custom content, their family albums, anything Micropolis Home produces and drops into `Downloads/`.

This is the same filesystem-as-world principle MOOLLM uses ([moollm-microworld-os.md](moollm-microworld-os.md)) applied one floor down — at the player's actual install. It also slots cleanly into [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md): the user's local Sims directory becomes a git universe they can fork, branch, merge, and share.

### The `.gitignore` shape

The `.gitignore` ships in Micropolis Home and is conservative — it only ignores files that are clearly EA's. Everything else is tracked by default, and the player can refine.

```gitignore
# Sims 1 (Legacy Collection on Steam) — EA-shipped binaries, do not track
TSBin/
GameData/Maps/
GameData/UIGraphics/
GameData/Sounds/Sims1/EA*.mp3
*.exe
*.dll
*.so
*.dylib
*.iso

# OS noise
.DS_Store
Thumbs.db
desktop.ini

# Everything below is YOURS. Tracked. Your decision to ignore or not.
# UserData/                   ← your saves, the soul of the game
# Downloads/                  ← your custom content
# Family Albums/              ← your stories
# Custom*/                    ← anything custom you've added
```

The exact path list is platform- and Legacy-Collection-version-specific; Micropolis Home ships the right `.gitignore` for the install it detects.

### What this gives the user

| Use | How it works |
|---|---|
| **Undo** | Every IMAGINE iteration, every WigOMatic wig, every dropped-in CD-ROM IFF is a commit. `git reset --hard` rolls back. Save-scumming with auditable discipline. |
| **Branching** | "What if I imagined the five-year skip differently?" → `git checkout -b alt-timeline-1`, IMAGINE again, compare both. Multiple parallel households at once. |
| **Sharing** | Push a branch to GitHub. Friend clones, lands the same content in their EA install. No file-archive mailing lists, no ad-hoc Discord shares. |
| **Provenance** | `git log` over a save shows every Tornado import, every Imagine Loop run, every craft-shop output that touched it. With the Adventure Compiler's `provenance.yml`, the chain is complete. |
| **Development** | Working on a custom object across many iterations? `git log` is your iteration history. `git diff` is your "what did I change since lunch." |
| **Content generation history** | Every LLM-generated artifact lands as a commit annotated with the prompt + intent + model + invariants — auditable, reproducible, removable. |
| **Recovery after a crash** | The game crashed and corrupted a save? `git checkout` the previous good version. The classic Sims problem, solved structurally. |

### Boundary discipline

Two rules keep this from drifting into territory we shouldn't be in:

- **We never `git add` EA-shipped files.** The `.gitignore` is the boundary. If a player overrides it manually, that's their choice; Micropolis Home does not facilitate redistribution of EA binaries.
- **Pushing to a public remote is a deliberate user action.** Micropolis Home prompts the user to confirm before any push, with a reminder of what's about to become public (saves, albums, custom content — all of which is *the user's* but may contain real-name material or recognizable images they may not want public).

This is also the natural integration seam for the [Adventure Compiler's provenance](moollm-microworld-os.md#the-adventure-compiler-is-a-coherence-engine-partner-not-a-one-shot-compiler), the [Imagine Loop's invariant claims](the-imagine-loop.md#the-validity-constraint-what-makes-this-work), the [Tornado's recovery provenance](the-tornado-and-the-archives.md#ethics), and the [Family Album server's upload provenance](simopolis-uplift-roadmap.md#track-b-family-album-server). All of those write commits with structured trailers; `git log` is the unified audit surface across everything.

---

## Immediate Next Steps

The full phased plan lives in [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md). The headline order:

### Phase 0 — End-to-end uplift of one save file (1–2 weeks)

`packages/sims-io/src/l4/`: take a parsed `NeighborhoodData` (L3 output) and emit a `ContentIndex` that `createMooShowStage` can load, *and* a MOOLLM-shaped `CHARACTER.yml` per Sim. Add SPR2→PNG skin export. Stand up a minimal `apps/simopolis/` that lets the user drop a `.iff` in, edit characters, and write a new `.iff` back. This is the first end-to-end path: **real Sims install → browser viewer → modified save file**.

### Phase 1 — LLM enrichment + Family Album server (3–4 weeks)

Wire the bridge to MOOLLM (via MCP or a structured-call adapter). Characters get mind-mirror profiles, descriptions, dialogue, YAML Jazz comments. A compatible Family Album upload endpoint catches uploads from the Steam Sims re-release and stores them with provenance.

### Phase 2 — Two-resolution coupling (4–6 weeks)

Define the data contract for Micropolis residential zones ↔ Sims neighborhoods. Engine reads aggregate metrics from bound neighborhoods. Bound Sims read city signals (unemployment, pollution, disasters). Zoom-in UX in the unified `apps/simopolis` shell.

### Phase 3 — Single-source archive tornado (4–6 weeks)

The first real recovery pass: pull from `archive.org`'s Sims Exchange snapshots into `content/simopolis/archives/`, parse, enrich, curate, bind to lots. Provenance is mandatory. See [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md).

### Phases 4–5 — Multi-source tornado, federated mirror, recurring sweep (months)

Skin/object recovery, auto-translation, player-published albums, scheduled re-pulls. The cycle closes.

---

## On Naming

The previous Python tool was called "SimObliterator" — an evocative name for a tool that disassembles save files to extract their secrets. The name no longer fits the direction: this project is about **bringing characters to life**, not obliterating them. And the word carries unwanted political resonance in 2026 that the design doesn't need.

**Simopolis** names the destination, not the operation. It is where characters live when they are not frozen in save files. It is Marusek's word, it is the right word, and it is ours to build.

The technical packages keep functional names (`sims-io`, etc.). The vision document is `simopolis.md`. The unified app, when it exists, will be `apps/simopolis`.

### Trademark summary


| Name                           | Owner                                                         | Status in this project                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Micropolis**                 | Micropolis GmbH (registered)                                  | ✅ Our umbrella trademark, used under the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md) with attribution                                                |
| **Micropolis City**            | derived from *Micropolis* (Micropolis GmbH)                   | ✅ Our product name for the city-simulation app (the existing `apps/micropolis/` SvelteKit application)                                                                          |
| **Micropolis Home**            | derived from *Micropolis* (Micropolis GmbH)                   | ✅ Our product name for the Sims-content-creation/discovery companion app (production directory: `apps/micropolis-home/`, currently scaffolded under `apps/simopolis/`)          |
| **Simopolis**                  | Project umbrella name; literary reference from Marusek (1999) | ✅ Used as the *vision/integration concept* name across design documents. Not a shipping product name.                                                                           |
| **SimCity**                    | Electronic Arts Inc. (registered)                             | ✅ Used historically (original game's name and lineage) — not applied to modifications, distributions, or any product name in this project                                       |
| **The Sims**                   | Electronic Arts Inc. (registered)                             | ✅ Referenced *only* to describe the EA-published game that Micropolis Home is a companion to — not applied to modifications, distributions, or any product name in this project |
| **Maxis**                      | Electronic Arts Inc.                                          | ✅ Referenced historically (the studio that created SimCity and The Sims)                                                                                                        |
| **Transmogrifier / TMOG**      | Electronic Arts Inc. (Maxis-era tool name)                    | ✅ Referenced only to credit the original Maxis content-creation tool that Don Hopkins wrote there and that Micropolis Home's content tools are spiritually descended from       |
| **Transmoogrifier**            | Our tool name (Micropolis Home, MicropolisCore)               | ✅ Our product name for the modernized, browser-native, MOO-lineage content-object editor inside Micropolis Home. The *moo* infix marks it as an heir, not the original. Not confusable with Maxis's Transmogrifier in any marketing context.                |
| **The Sims Legacy Collection** | Electronic Arts Inc. (Steam re-release)                       | ✅ Referenced as the runtime that Micropolis Home's output is loaded into. Not redistributed, not reimplemented.                                                                  |


The city simulation engine in this repo is **Micropolis**, based on the SimCity source code released by EA under GPL for the OLPC project. The *Micropolis* trademark is used under license from Micropolis GmbH.

---

## References


| Resource                                                   | Where                                                                                                                                                                |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full Uplift vision and story arc                           | [MOOLLM: designs/sim-obliterator/THE-UPLIFT.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/THE-UPLIFT.md)                                 |
| Technical field mappings (Sims ↔ MOOLLM)                   | [MOOLLM: designs/sim-obliterator/BRIDGE.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/BRIDGE.md)                                         |
| IFF Semantic Image Pyramid (6 layers)                      | [MOOLLM: designs/sim-obliterator/IFF-LAYERS.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/IFF-LAYERS.md)                                 |
| SimAntics psychopomp / B-brain bridge character            | [MOOLLM: designs/sim-obliterator/PSYCHOPOMP-AND-THE-BIFROST.md](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator/PSYCHOPOMP-AND-THE-BIFROST.md) |
| Micropolis + MOOLLM layer model                            | [moollm-micropolis-integration.md](moollm-micropolis-integration.md)                                                                                               |
| Micropolis as constructionist microworld (SimCity lineage) | [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md)                                                                                         |
| Git branch as city/universe                                | [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md)                                                                                                   |
| SimAntics VM Design Document (Don Hopkins, Maxis)          | [https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf)                                   |
| VitaBoy character animation (Don Hopkins)                  | [https://donhopkins.com/home/VitaBoyUnity.zip](https://donhopkins.com/home/VitaBoyUnity.zip)                                                                         |
| "The Wedding Album" — Marusek (1999)                       | [https://en.wikipedia.org/wiki/The_Wedding_Album_(short_story)](https://en.wikipedia.org/wiki/The_Wedding_Album_(short_story))                                       |
| SimObliterator Suite (Jeff Adkins)                         | [https://github.com/DnfJeff/SimObliterator_Suite](https://github.com/DnfJeff/SimObliterator_Suite)                                                                   |
| Cellular automatists                                       | [https://en.wikipedia.org/wiki/Category:Cellular_automatists](https://en.wikipedia.org/wiki/Category:Cellular_automatists)                                           |


