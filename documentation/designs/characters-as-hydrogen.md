# Characters as Hydrogen: the Micropolis multi-universal character substrate

**Status:** Active design (top-level framing)  
**Monorepo:** MicropolisCore  
**Reframes:** `[simopolis.md](simopolis.md)` — Simopolis is the integration *of* this substrate with Sims content; this doc is the substrate itself
**Companion documents:** `[moollm-microworld-os.md](moollm-microworld-os.md)` (the agent layer that animates characters) · `[the-imagine-loop.md](the-imagine-loop.md)` · `[the-computer-as-portal.md](the-computer-as-portal.md)` · `[the-tornado-and-the-archives.md](the-tornado-and-the-archives.md)` · `[family-album-as-storymaker.md](family-album-as-storymaker.md)` · `[federation-peer-games.md](federation-peer-games.md)` · `[sims-content-registry.md](sims-content-registry.md)`

> *"I want the games to actually be able to have persistent data that can move from one game to another, or have a large data set that I can reuse in different ways."*  
> — Will Wright, Stanford ("Interfacing to Microworlds"), April 1996

---

## The principle

**Characters are the hydrogen of the Micropolis universe — the lightest, most abundant content-atom, the one that binds with almost everything else. Houses, cities, towers, and dreams are molecules built out of characters and *all the other content-atoms* that exist alongside them.**

What we are building is not a Sims companion. It is not a Micropolis add-on. It is a **multi-resolution multi-world universe with coherent syncable multi-representation characters woven throughout**. The character is one type of atom — the most numerous, the most expressive, the one with the highest valence count. *But characters are not the only atoms.* Lots, objects, behaviors, appearances, memories, sounds, places, and stories are other element-types in the Micropolis periodic table. **A household, a neighborhood, a city, a tower, a dream — these are molecules built by combining many atom-types in patterns.** Hydrogen alone is just a gas; carbon alone is just soot; the interesting matter is the bond structure.

### The Micropolis periodic table (informal)

The metaphor is not load-bearing — it is a teaching device for talking about what kinds of content the substrate handles. The point is just that characters are *one* element among several, and combinations are where the interesting structure lives.


| Element (symbol) | Content-atom                                                                       | Where it lives                                                                           | Documented in                                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **H** Hydrogen   | **Characters** — Sims, MOOLLM citizens, soul-files                                 | `[characters/<name>/](moollm-microworld-os.md)` · PersonData in `.iff` · `CHARACTER.yml` | The rest of this doc                                                                                                                                                                                                                 |
| **C** Carbon     | **Lots & spaces** — the structural backbone that everything else binds to          | `lots/<name>.iff` · Micropolis zone tiles · MOOLLM rooms                                 | `[simopolis.md](simopolis.md)` · `[the-computer-as-portal.md](the-computer-as-portal.md)`                                                                                                                                            |
| **O** Oxygen     | **Objects** — custom IFF items, furniture, props, Uplifted Computers, Rug-O-Matics | `objects/<guid>.iff`                                                                     | `[the-computer-as-portal.md](the-computer-as-portal.md)` · `[sims-content-registry.md](sims-content-registry.md)`                                                                                                                    |
| **N** Nitrogen   | **Behaviors** — SimAntics BHAVs, MOOLLM skills, ambient routines                   | BHAVs in `.iff` · `skills/<name>/`                                                       | `[moollm-microworld-os.md](moollm-microworld-os.md)`                                                                                                                                                                                 |
| **S** Sulfur     | **Appearances** — skins, heads, wigs, accessories, costumes                        | SPR2 / SKN / `skins/`                                                                    | [the-computer-as-portal.md → WigOMatic](the-computer-as-portal.md#6-wigomatic-and-the-character-customization-studio)                                                                                                              |
| **P** Phosphorus | **Memories & events** — temporal, energetic, mood-changing                         | `memories/` · `recent_events:` in `CHARACTER.yml` · FAMI history                         | `[moollm-microworld-os.md](moollm-microworld-os.md)` · `[the-imagine-loop.md](the-imagine-loop.md)`                                                                                                                                  |
| **Si** Silicon   | **Stories, scenes, albums** — composite, structurally important, photographable    | `scenes/` · `albums/` · pageable album book IFFs                                         | `[family-album-as-storymaker.md](family-album-as-storymaker.md)` · `[the-computer-as-portal.md](the-computer-as-portal.md)`                                                                                                          |
| **He** Helium    | **Sounds & music** — atmospheric, hard to bond, but essential for feel             | `sounds/` · custom audio in `.iff`                                                       | (future design doc; deferred)                                                                                                                                                                                                        |
| **Au** Gold      | **Provenance & permissions** — rare, valuable, certifies authenticity              | `provenance/` · `permission_to_repurpose:` · git-trailer commits                         | [family-album-as-storymaker.md → DNA semantics](family-album-as-storymaker.md#dna-semantics-moving-a-character-between-authors) · [simopolis.md → Git-managed user Sims directory](simopolis.md#git-managed-user-sims-directory) |


### Molecules

A *household* is a molecule of characters (H) + lot (C) + objects (O) + behaviors (N) + appearances (S) + memories (P), bound by relationship-edges. A *neighborhood* is a molecule of many households, plus shared streets, lots, NPCs, and a Family Album graph. A *city* is a many-neighborhood macromolecule whose aggregate properties (land value, education, satisfaction) are emergent from its constituents. A *dream* (Micropolis Dream) is a chemistry of soul-files (H), behaviors (N), and memories (P), held loosely together by narrative bond-energy and the LLM's `eval()`.

The substrate's job is to keep these bonds *valid* — every atom has documented valence (e.g. a character's `sims_traits` block bonds to a PersonData slot; a custom object's GUID bonds to a registry entry; a memory bonds to a scene). The [Sims Content Registry](sims-content-registry.md), the [Adventure Compiler](moollm-microworld-os.md#the-adventure-compiler-is-a-coherence-engine-partner-not-a-one-shot-compiler), and the [Imagine Loop's valid-or-revise discipline](the-imagine-loop.md#the-validity-constraint-what-makes-this-work) are the chemists ensuring no broken bonds reach the EA-published runtime.

### Why hydrogen and not some other element

Two reasons:

1. **Characters bind with everything else.** A character has relationships (to other characters), a job (a behavior bound to a lot), a wardrobe (appearance), memories (events), a home (lot + objects), and a soul-file (the canonical record). No other content-atom has so many directions it can bond. Hydrogen's high valence-count is a fair metaphor.
2. **Characters are the most abundant kind of authored content.** A Sims neighborhood has eight to forty named characters; a Sims Exchange album has dozens of captioned scenes featuring those characters; a player's library across years of play might have hundreds of characters across many neighborhoods. By volume, characters dominate the content stream.

But hydrogen's metaphor must not mislead us: **without carbon there's no backbone, without oxygen there's no reactivity, without provenance there's no trust**. The substrate is multi-element. This doc focuses on the hydrogen because the hydrogen is what most directly carries identity across game-runtime boundaries. The rest of the periodic table is documented in the suite of companion docs cited above.

---

## Inverting the usual game-design framing

This framing flips the usual game-design starting point. Most games start with a world and populate it with characters. The Micropolis Federation starts with characters and asks *which worlds will they live in this week.* A character whose soul is in `CHARACTER.yml` and `mind_mirror` and `sims_traits` can be incarnated into:

- The EA Sims 1 runtime, by compiling to a `Neighborhood.iff` slot
- A Micropolis residential zone, by aggregating across the household into tile metrics
- A high-density commercial tower (when [Micropolis Tower](#micropolis-tower-speculative) becomes real), by compiling to a tower-sim save slot
- A pure-narrative dream space, by simply remaining as YAML in [Micropolis Dream](#micropolis-dream) with the LLM as `eval()`

These are not copies of the character. They are **simultaneous incarnations of one identity**, synchronized across substrates by documented file-format access and the Bifrost protocol (see [moollm-microworld-os.md → The Bifrost](moollm-microworld-os.md#the-bifrost-the-bridge-as-a-structured-ontological-transition)).

Will Wright said it in 1996, four years before The Sims shipped: *"persistent data that can move from one game to another."* This document is what that sentence looks like in 2026.

---

## Multi-resolution

The same character exists at many resolutions, all valid, all consistent through the sync protocol:


| Resolution              | What the character looks like                                                                           | Where it lives                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **City-zone aggregate** | A statistical contribution to a residential tile's land value, education average, satisfaction          | `content/micropolis/cities/<city>/neighborhoods/zone-<row>-<col>.yml` aggregate fields, rolled up by the [zone-binding scanner](simopolis.md#how-sims-save-files-actually-bind-to-micropolis-tiles) |
| **Lot rendering**       | A semi-iso character sprite on a sliced Micropolis tile (the *Sims-Online-map* mode)                    | The Phase 2 Track E rendered-lot output                                                                                                                                                             |
| **Household member**    | A row in a parsed `Neighborhood.iff`'s FAMI/NBRS, with PersonData[88], relationships, family ties       | `packages/sims-io` L3 output                                                                                                                                                                        |
| **Sim**                 | A walking, sleeping, working, talking character in the EA-published Sims 1 runtime                      | The player's `.iff` save, played in The Sims 1 (Legacy Collection)                                                                                                                                  |
| **MOOLLM citizen**      | A directory under git with `CHARACTER.yml`, `mind_mirror`, YAML Jazz, memories, sessions, relationships | `characters/<name>/` in MOOLLM's microworld substrate                                                                                                                                               |
| **Soul-file**           | The deepest representation: who they are, what they remember, who they love, what they've been through  | One YAML file at `characters/<name>/CHARACTER.yml`                                                                                                                                                  |


The sync protocol guarantees these resolutions are mutually consistent. Edit at any resolution that's legible to you. The substrate keeps the rest aligned.

This is also the IFF Semantic Image Pyramid principle (see `[IFF-LAYERS.md](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/IFF-LAYERS.md)`) generalized from objects to *identities*. A character is its own pyramid.

---

## Multi-universal

The same character lives across multiple **games** simultaneously, not just multiple representations of one game.

We are explicitly designing the **Micropolis Federation** as a **set of peer games sharing a character substrate**. *Federation*, deliberately — in the Star Trek sense of a cooperative association of sovereign worlds, and in the technical sense of [ActivityPub](https://www.w3.org/TR/activitypub/)- and git-remote-style decentralized peering. Not a franchise: there is no central licensor, no royalty stream, no walled garden. Each peer game (Micropolis Home, Micropolis City, Micropolis Tower, Micropolis Dream, and the [federation peer games we'd love to bridge to](federation-peer-games.md)) is its own sovereign project; the Federation is the *protocol* that lets characters move between them. Initial roster:

### Micropolis Home

The Sims-1 content creation and discovery companion. Already designed in `[simopolis.md](simopolis.md)` and through. Characters that incarnate here compile to `Neighborhood.iff` data the player loads into their EA Sims 1.

### Micropolis City

The city simulator. The existing `apps/micropolis/` SvelteKit application, descending from EA's GPL OLPC SimCity release. Characters that incarnate here are aggregated into residential zone metrics; the city is the *index* across all the bound households.

### Micropolis Tower *(speculative)*

A vertical-density life sim integrated into Micropolis City's high-density commercial and residential zones, in the *SimTower* / *Yoot Tower* (Yoot Saito, 1998) lineage. Characters that incarnate here would compile to a tower-sim save slot — magic-8-per-floor-times-N-floors households, with aggregate metrics rolling up. See [simopolis.md → What this architecture enables](simopolis.md#what-this-architecture-enables-forward-looking-speculative). Not a commitment; an exemplar of what the substrate enables.

### Micropolis Dream

**The pure-narrative incarnation space.** This is where characters live as *identities* without needing a runtime game. No Sims engine, no city engine, no tower engine. Just the LLM as `eval()` and the YAML soul-files on disk.

In Micropolis Dream, characters:

- Read each other's `CHARACTER.yml` and their own
- Have conversations in [Speed-of-Light](moollm-microworld-os.md#speed-of-light-why-this-isnt-an-ai-npc-architecture) shared context
- Form relationships, write memories, edit their own soul-files (per the [Incarnation Contract](moollm-microworld-os.md#the-incarnation-contract))
- Have adventures in MOOLLM rooms
- Dream — generating album pages, narratives, retroactive backstory, alternate-life what-ifs
- Sit between game-runtime visits to Home / City / Tower

Micropolis Dream is the **root identity layer**. The other three apps in the Federation are *instantiations* of Dream-resident characters into specific runtime engines. A character who lives in Dream can be uplifted into Home (incarnated as a Sim), aggregated into City (counted in a zone), assigned a Tower apartment (when that exists). They go back to Dream when they're not currently bound to a runtime.

The Wedding Album reference is appropriate: in Marusek's 1999 story, *Simopolis* is the digital afterlife where simulated people live their parallel lives, between or beyond their bindings to specific games. Micropolis Dream is that, named honestly.

Architecturally, Micropolis Dream is **MOOLLM, scoped to the Federation's character substrate**. The directory layout, the room/character/skill model, the Imagine Loop, the Adventure Compiler — these are *the existing implementation of Micropolis Dream*. We've already built it; we haven't been calling it that.

### And future apps

The substrate is open. Any game whose save file we can parse and whose state can hold a character can be a peer. Candidates already raised in the design suite: theme-park / venue sims, ecology sims (the *SimEarth* / *SimAnt* lineage), transportation sims. None committed. The architectural point is that *adding one is a content-and-config exercise, not a substrate change.*

---

## Cross-license

This works across licenses because the substrate is **file format access**, not engine integration. Specifically:


| License posture                                                         | How the Federation integrates                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GPL3 (Micropolis itself)**                                            | Engine source available; we modify, embed, fork freely under GPL3                                                                                                                                                                                                                                                         |
| **Proprietary, well-documented format (The Sims 1)**                    | We read and write the publicly-documented IFF/FAR/PersonData formats via `[packages/sims-io](../../packages/sims-io)`. We do *not* link, embed, or redistribute EA's runtime. The user runs the EA-published game; our content loads into it. This is the same posture every Sims fan-content tool has used for 26 years. |
| **Proprietary, reverse-engineerable format (a hypothetical tower sim)** | If the format is documented or reverse-engineerable without breaking law/license, the substrate participates. Otherwise the game stays out.                                                                                                                                                                               |
| **Pure-narrative MOOLLM substrate (Micropolis Dream)**                  | Our own MIT-licensed code and skills; characters that live here are first-class citizens of the Federation without needing any external runtime.                                                                                                                                                                          |


The character substrate is **license-agnostic** because it operates on save files, not on engines. The player owns the EA Sims 1 they bought; we provide tools to read and write the data inside that they also own. Same for any other game whose format we can access lawfully.

This is why the Federation can underlay both GPL3 and proprietary games at the same time. It is also why we are extraordinarily careful about [scope](simopolis.md#scope-and-intent) and [trademarks](simopolis.md#trademark-summary): the substrate's legitimacy depends on the user being the runtime owner, and on us being honest about what is ours and what is theirs.

---

## How the rest of the design suite plugs in

Every existing design doc in the suite is a *service* of the character substrate, not a thing in its own right. Re-reading them through the substrate lens:


| Doc                                                                  | What it does *for the substrate*                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[moollm-microworld-os.md](moollm-microworld-os.md)`                 | Defines the soul-file format (`CHARACTER.yml`), the mind-mirror model, the Speed-of-Light social-sim mechanic, the Bifrost sync protocol. **This is the character substrate's spec.**                                                                                                                    |
| `[the-imagine-loop.md](the-imagine-loop.md)`                         | The valid-or-revise narrative-state transformer over a household. **Lets characters' identities evolve while staying file-format-coherent.**                                                                                                                                                             |
| `[the-computer-as-portal.md](the-computer-as-portal.md)`             | The seven (well, eight, counting WigOMatic separately) ways a character's content can manifest as IFF artifacts in The Sims. **Compilation targets for Dream→Home incarnation.**                                                                                                                         |
| `[the-tornado-and-the-archives.md](the-tornado-and-the-archives.md)` | Recovery of historical characters from 25 years of dead Sims sites. **The substrate's import pipeline for pre-existing characters.**                                                                                                                                                                     |
| `[sims-content-registry.md](sims-content-registry.md)`               | Dependency resolution across IFF references. **Guarantees that an incarnation doesn't lose its furniture, skin, or sub-references.**                                                                                                                                                                     |
| `[family-album-as-storymaker.md](family-album-as-storymaker.md)`     | Branching / merging community graph of Family Album scenes; "snippets of DNA" weavable between authors. **How characters (and the lots / objects / scenes attached to them) move between players, not just between apps.**                                                                               |
| `[federation-peer-games.md](federation-peer-games.md)`               | Catalogue of candidate peer games. **Two distinct interop primitives** the Federation supports: (1) **Bifrost character interop** for soul-files (Stardew, CK3, RimWorld, Dwarf Fortress, Bannerlord, Skyrim, VTTs, etc. — where the unit of value is the character); (2) **city-protocol interop** where Micropolis sits next to another city sim as a neighboring city in its native multi-city region protocol, exchanging the same boundary signals the host game uses for its own neighbors (Cities: Skylines is the canonical case; SimCity 4 regional play recoverable by the same shape). **How the Federation grows beyond its initial roster.** |
| `[tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md)` | Cultural / strategic positioning against Nintendo's closed-platform analog. **Why a substrate-based federation can do what a single-app product can't.**                                                                                                                                                 |
| `[simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)`         | Phased build plan. **What to ship and in what order to make the substrate real.**                                                                                                                                                                                                                        |
| `[simopolis.md](simopolis.md)`                                       | The Sims-1-side integration: how a player's existing Sims content participates in the substrate. **One specific incarnation pathway (Dream ↔ Home).**                                                                                                                                                    |


Reading from the top: the character substrate is the *what*. MOOLLM is the *agent layer that animates it*. The Adventure Compiler and Imagine Loop are *the discipline that keeps incarnations valid*. The Tornado is *the historical-data importer*. The content registry is *the bookkeeping*. Simopolis is *the first end-to-end use of the substrate*. Tomodachi-comparison is *the answer to "why not just build what Nintendo built."*

---

## Sync semantics (in one paragraph)

A character has one canonical soul-file (`CHARACTER.yml` in MOOLLM Dream space, the deepest layer). Any number of incarnations exist: an `.iff` row in a Sims neighborhood, an aggregate contribution to a Micropolis zone, a hypothetical tower-sim slot, etc. Changes at any incarnation can flow back to the soul-file via the Bifrost protocol — Sims trait changes update the `sims_traits` block; tower-job changes update the same way; aggregate-only changes (like a city-wide event affecting the household) are written as `recent_events` entries. The soul-file is canonical for everything *only* the LLM substrate knows about (mind-mirror, YAML Jazz comments, memories with narrative flavor). The Bifrost is git-merge semantics over identity, not a transporter: **the character is not copied between worlds; the character is a pattern that simultaneously exists in multiple worlds at multiple resolutions, kept in sync by the substrate.**

---

## Implications for how we talk about the project

This framing changes a few things about how the design suite reads:

1. **"Simopolis" is one application of the substrate, not the substrate itself.** It's *the Dream↔Home pathway specifically*. The substrate is bigger.
2. **The "Micropolis Federation" is the correct umbrella name** for the multi-app peer-game family — *not* "franchise". The Federation is a cooperative association of sovereign open-source projects with shared interop protocols, in the Star Trek sense of the word; it is decidedly *not* a commercial licensing scheme with a central rights-holder. Initial members: Micropolis City, Micropolis Home, Micropolis Tower (speculative), Micropolis Dream (new naming for what was already MOOLLM-side). All four use the same licensed Micropolis trademark (under the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md)) for their *Micropolis*-prefixed names. The Federation itself is the *set of protocols* its members speak — at minimum the **Bifrost** (character interop) and the **city-protocol adapter** (where Micropolis can sit next to another city sim as a neighbor in its native multi-city region protocol). New peer games (see `[federation-peer-games.md](federation-peer-games.md)`) can join without becoming "Micropolis-branded" — they just need to speak at least one of the protocols.
3. **The character is the unit of value.** Not the city. Not the lot. Not the IFF. *The character.* Houses and cities and towers and dreams are media the character lives in; they are not the product. (And the character is, in the periodic-table metaphor above, just the hydrogen — the most abundant of several content-atoms, the one that binds most freely with the rest.)
4. **Cross-game data portability** — Will's 1996 phrase — *is* the product. Everything else is in service of it.
5. **The Bifrost is not a bridge between Sims and MOOLLM specifically.** It is the *general* sync protocol between any two character-incarnation substrates. The Sims↔MOOLLM case is just the first one we shipped. It is also the protocol the Federation speaks.
6. **Micropolis Dream is already partially built.** It's the MOOLLM character/adventure/skill substrate we've been describing as part of MOOLLM-the-tool. Renaming the *consumer-facing surface* of MOOLLM as **Micropolis Dream** within the Federation gives players a name for "the place my characters live when they're not in a specific game."

---

## What this changes about Phase 0

Not much immediately. The Phase 0 vertical in `[simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)` is still the right first ship: get one save file end-to-end through Sims-IO and back into the EA game. That's the smallest visible incarnation of the substrate.

What it *does* change:

- **Naming intent**: when we ship `apps/micropolis-home/`, the install page should explain that it's one of several apps in the Micropolis Federation, and that the *character substrate* is the durable thing, not the specific app.
- **Soul-file directory layout**: characters' canonical homes should live under a Federation-level path (e.g. `content/dream/characters/<name>/`) rather than under any specific app, so that future Tower / Dream apps and external Federation peers can find them without breaking.
- **Bifrost protocol formalization**: the sync rules between soul-file and incarnations need to be a documented schema, not implicit in the L4/L5 code. Phase 0 should ship a draft of this schema even if it only handles the Sims case.

These are small adjustments to existing tasks, not new work.

---

## References


| Source                                                                | Relevance                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Will Wright, *"Interfacing to Microworlds"* (Stanford, 26 April 1996) | The original cross-game data portability vision. *"I want the games to actually be able to have persistent data that can move from one game to another."* See [simopolis.md → Historical proof](simopolis.md#historical-proof-this-was-always-the-plan) and [video](https://www.youtube.com/watch?v=nsxoZXaYJSk). |
| David Marusek, *The Wedding Album* (1999)                             | The original *Simopolis* — the digital afterlife where simulated people live their parallel lives between game-runtime bindings. The literary precedent for Micropolis Dream.                                                                                                                                       |
| Marvin Minsky, *Society of Mind* (1985)                               | The architectural basis for treating identity as a metastable pattern across many subsystems rather than a single stored datum.                                                                                                                                                                                     |
| Pavel Curtis, LambdaMOO (1990)                                        | The original filesystem-as-world substrate. The MOOLLM directory model — and therefore Micropolis Dream's directory model — descends directly from this.                                                                                                                                                            |
| Dave Ungar, Self (1987)                                               | Prototype-based identity, dynamic-slot characters, cloning rather than instantiation. The shape of the character substrate's identity model.                                                                                                                                                                        |


