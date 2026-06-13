# Simopolis Uplift — Phased Roadmap

**Status:** Active design  
**Monorepo:** MicropolisCore  
**Companion documents:** [simopolis.md](simopolis.md) · [characters-as-hydrogen.md](characters-as-hydrogen.md) · [moollm-microworld-os.md](moollm-microworld-os.md) · [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [the-imagine-loop.md](the-imagine-loop.md) · [family-album-as-storymaker.md](family-album-as-storymaker.md) · [federation-peer-games.md](federation-peer-games.md) · [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) · [sims-content-registry.md](sims-content-registry.md)

> **Naming note.** Throughout this roadmap, "Simopolis" is the *umbrella concept name* for the integration of two shipping products: **Micropolis City** (the existing `apps/micropolis/`, the GPL city sim) and **Micropolis Home** (planned `apps/micropolis-home/`, currently scaffolded as `apps/simopolis/`). When the docs say `apps/simopolis/`, read it as "the Micropolis Home companion app, pre-rename." See [simopolis.md → Two products, one umbrella](simopolis.md#two-products-one-umbrella).
**Tracks:** open work in [documentation/TODO.md](../TODO.md) under "Simopolis — The Uplift"

> **Trademark notice.** *Micropolis* is used under license from Micropolis GmbH. *SimCity* and *The Sims* are EA Inc. trademarks, used historically or in this project's role as a *companion* to the EA-published Sims Legacy Collection. See [MicropolisPublicNameLicense.md](../../MicropolisPublicNameLicense.md) and [MicropolisGPLLicenseNotice.md](../../MicropolisGPLLicenseNotice.md).

> **Scope.** Content creation and discovery tooling; the Sims engine remains the runtime. See [simopolis.md → Scope and intent](simopolis.md#scope-and-intent) for the canonical positioning.

---

## Purpose

This document is the **build plan** for Simopolis. The strategic vision lives in [simopolis.md](simopolis.md); the substrate model in [moollm-microworld-os.md](moollm-microworld-os.md); the archive-recovery pipeline in [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md). This document says **what to actually ship and in what order**.

The phases are sized so that **each phase is independently shippable** and produces a visible product, not just internal plumbing. We avoid the failure mode of "spend six months on infrastructure with nothing playable."

---

## What's already done

| Component | Status | Notes |
|---|---|---|
| Monorepo: `apps/`, `packages/`, `content/` layout | ✅ | Stable, pnpm workspaces |
| `packages/micropolis-engine` (C++/WASM) | ✅ | Builds via Emscripten + pnpm |
| `packages/sims-io` L0 resource providers | ✅ | Node + Memory providers, tested |
| `packages/sims-io` L1 VirtualTree + FAR archives | ✅ | Tested |
| `packages/sims-io` L3 FAMI/NBRS/PersonData parsers | ✅ | 80-base + EP-extended PersonData, verified vs original C++ source |
| `packages/sims-io` neighborhood scanner | ✅ | Reads real `Neighborhood.iff` |
| `packages/vitamoo` + `packages/mooshow` | 🟡 in progress | WebGPU character rendering working |
| `content/vitamoo/sims-prototype-1998/` | ✅ | 294 prototype CMX animations + MSH meshes |
| `content/vitamoo/sims-demo/` | ✅ | Retail demo pack |
| `apps/micropolis` SvelteKit shell | ✅ | Svelte 5 runes, CI green |
| `apps/vitamoospace` viewer | 🟡 in progress | Roots/Catalog tabs |
| MOOLLM character / mind-mirror / incarnation skills | ✅ (external) | Live in `moollm` sister repo |
| Bridge field-mapping spec | ✅ (external) | [BRIDGE.md](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md) |

This is enough to start shipping. The unshipped work is mostly *gluing* what we have.

---

## Phase 0 — End-to-end uplift of one save file (1–2 weeks)

**The minimum demo.** Drop a `.iff` save (from the player's *own* EA-published Sims 1 install) into the Simopolis companion app in a browser tab. Watch one character become a MOOLLM `CHARACTER.yml`. Talk to them. Edit them. Write a new `.iff` back out **for the player to load into their own EA Sims install**.

If we ship nothing else, this is the proof. The proof is also the legal positioning: a companion content-editing tool, in the same lineage as the Maxis-authored Transmogrifier, that makes the EA-published Sims 1 more valuable to its owners.

### Tasks

| # | Task | Where | Effort |
|---|---|---|---|
| 0.1 | `packages/sims-io/src/l4/content-index.ts`: transform a `NeighborhoodData` (L3 output) into a `ContentIndex` that `createMooShowStage` already consumes | new file | 2–3 days |
| 0.2 | Map each Sim's character object filename to a vitamoo asset path; provide a fallback default skin where assets are missing | `l4/character-assets.ts` | 1–2 days |
| 0.3 | `packages/sims-io/src/l4/moollm-character.ts`: emit a MOOLLM-shaped `CHARACTER.yml` per Sim, including `sims_traits`, `relationships`, `gold`, `job`, and **empty `mind_mirror` placeholder** | new file | 2 days |
| 0.4 | A tiny CLI script `pnpm run sims-uplift <path-to-iff>` that runs L3→L4 and writes both the `ContentIndex` (JSON) and the per-character YAML files into a chosen output dir | new file | 1 day |
| 0.5 | A minimal `apps/simopolis/` SvelteKit app: file-picker, uplift, show characters as cards with traits + family, allow editing the YAML fields, write back | new app | 4–5 days |
| 0.6 | SPR2 → PNG skin export in TypeScript, called from L4 to populate generated character cards | `packages/sims-io/src/spr2/` | 2–3 days |
| 0.7 | Download path: re-write modified `sims_traits`, gold, and skill values back into the original `Neighborhood.iff`, save as a new file | extension of L3 setters | 3 days |
| 0.8 | **Git-managed user Sims directory** (see [simopolis.md → Git-managed user Sims directory](simopolis.md#git-managed-user-sims-directory)): ship platform-specific `.gitignore` templates that exclude EA-shipped binaries; provide an "Initialize git on my Sims directory" one-click action in Micropolis Home; auto-commit on every Micropolis-Home-originated change with structured trailers (`Tool:`, `Prompt:`, `Model:`, `InvariantsClaimed:`); prompt-before-push for any public remote | `apps/micropolis-home/src/lib/git-overlay/` + `assets/gitignore-templates/` | 3–4 days |
| 0.9 | **Sims Content Registry, first vertical** (see [sims-content-registry.md](sims-content-registry.md)): SQLite schema + `scan` walk over the user's content directories + `validate --strategy=annotate-only` over a save file. Builds on the existing `packages/vitamoo/vitamoo/io/guid-collision.ts` utilities. No repair yet; just inventory and structured warnings. | `tools/content-registry/` + `packages/sims-io/src/l4/registry/` | 3–4 days |

### Definition of done

- `pnpm run sims-uplift fixtures/pleasantview.iff out/` produces a directory of `CHARACTER.yml` files, an `ContentIndex.json`, and PNGs.
- `apps/simopolis` loads the same input via drag-and-drop, lets the user edit a trait or gold value, and writes a new `.iff` they can download.
- The "Initialize git on my Sims directory" action works on a real install: `.gitignore` is dropped in, `git init` runs, the first commit captures the user's pre-Micropolis-Home state, and the next IFF write produces a structured-trailer commit.
- 5–10 tests in `packages/sims-io/src/l4/*.test.ts` covering the round-trip.

### Explicitly out of scope for Phase 0

- LLM enrichment of `mind_mirror`, `description`, `dialogue`. (Phase 1.)
- MicropolisCore zone binding. (Phase 2.)
- Anything talking to `archive.org`. (Phase 3.)
- Family Album upload server. (Phase 1.)

---

## Phase 1 — MOOLLM enrichment + Family Album server (3–4 weeks)

Now the characters *speak*. And the world starts collecting albums.

### Track A: LLM enrichment via MCP

| # | Task | Where | Effort |
|---|---|---|---|
| 1A.1 | Decide MCP transport: do we run a local MOOLLM MCP server, or call a hosted LLM endpoint with structured prompts that emulate the MOOLLM skill calls? Document the choice in [moollm-micropolis-integration.md](moollm-micropolis-integration.md) | doc | 1–2 days |
| 1A.2 | Implement `packages/sims-io/src/l5/enrich.ts`: takes a `CHARACTER.yml` (with empty `mind_mirror`), produces a filled one with mind-mirror, description, emoji-identity, dialogue greetings, and YAML Jazz comments | new file | 3–4 days |
| 1A.3 | Per-character family-album narrative inference: when a parsed album exists, feed its prose into 1A.2 as context. Output keeps a `provenance:` block | new file | 3 days |
| 1A.4 | In `apps/simopolis`, add a "Wake up" button per character that runs enrichment and shows the result inline | UI work | 3 days |
| 1A.5 | Speed-of-Light batch path: enrich a whole household (or whole neighborhood) in a single LLM call, with characters in shared context. Performance + cost test on 5 / 20 / 80 characters | tests | 3 days |

### Track B: Family Album server

| # | Task | Where | Effort |
|---|---|---|---|
| 1B.1 | Reverse-engineer the album upload protocol used by the Steam Sims re-release (HTTP form post; the original `thesims.ea.com` endpoint is gone but the client still tries to call it) | research | 2 days |
| 1B.2 | `apps/album-server` SvelteKit app or small Fastify endpoint that accepts the upload and stores it under `content/simopolis/albums/incoming/` with `provenance.yml` | new app | 3–4 days |
| 1B.3 | Documented DNS / hosts-file redirect instructions for users to point their Sims client at our endpoint locally | docs | 1 day |
| 1B.4 | Web viewer for an uploaded album: paged story, screenshots, captions, author handle, link to "wake these characters up" | UI work | 3 days |

### Definition of done

- Drag a save into `apps/simopolis`, get fully-enriched characters in under 30 seconds for a typical household.
- A Family Album uploaded from the Steam Sims client arrives in `content/simopolis/albums/incoming/`, with provenance, and is browsable on the album viewer URL.
- Speed-of-Light enrichment of one full neighborhood (8 families, ~25 characters) fits in one LLM call with budget under a documented cost ceiling.

---

## Phase 1C — Uplifted Computer + custom IFF content (3–4 weeks, parallelizable with 2)

The first **player-visible content artifact** in the project. Full design lives in [the-computer-as-portal.md](the-computer-as-portal.md). Five custom IFF object types, all built via the Adventure Compiler, all installable into the player's EA-published Sims 1.

### Tasks

| # | Task | Where | Effort |
|---|---|---|---|
| 1C.1 | `moollm://` URL scheme + TypeScript resolver | `packages/sims-io/src/l4/moollm-url.ts`, `url-resolver.ts` | 3 days |
| 1C.2 | Screen-snapshot renderer (Micropolis): `tile-renderer` → PNG at PC-screen dimensions | `packages/tile-renderer/src/snapshot.ts` | 2 days |
| 1C.3 | Screen-snapshot renderer (Sims): `mooshow` → PNG for character/lot views | `packages/mooshow/src/snapshot.ts` | 3 days |
| 1C.4 | SPR2 *writer* (palette quantize + IFF SPR2 chunk authoring; complements Phase 0 reader) | `packages/sims-io/src/spr2/writer.ts` | 3–4 days |
| 1C.5 | Adventure Compiler core: YAML → IFF object | `tools/adventure-compiler/` | 1 week |
| 1C.6 | Compiler target: **Uplifted Computer** (Micropolis app installed as first vertical) | `tools/adventure-compiler/targets/computer.ts` | 3 days |
| 1C.7 | Compiler target: CD-ROM (MOOLLM-URL-bearing inventory object) | `tools/adventure-compiler/targets/cd.ts` | 2 days |
| 1C.8 | Compiler target: Save-Game Disk | `tools/adventure-compiler/targets/savegame-disk.ts` | 1 day |
| 1C.9 | Compiler target: Foreign Photo Album (pageable book, slideshow pattern) | `tools/adventure-compiler/targets/album.ts` | 4 days |
| 1C.10 | Compiler target: **Micropolis Rug-O-Matic Rug** (cycling baked city-snapshot SPR2 atlases on rug surface) | `tools/adventure-compiler/targets/rug.ts` | 3 days |
| 1C.11 | Compiler target: **WigOMatic** (first character-customization vertical: head/wig SPR2 atlas from image-gen prompt, palette-quantized) | `tools/adventure-compiler/targets/wigomatic.ts` | 3 days |
| 1C.11b | Compiler targets: HeadShop, CostumeRack, MakeupBar, AccessoryCounter (the rest of the Character Customization Studio, follow-on after WigOMatic ships) | `tools/adventure-compiler/targets/customization/` | 1 week total |
| 1C.12 | Compiler target: Screen-Snapshot Camera (back-channel to Family Album) | `tools/adventure-compiler/targets/camera.ts` | 3 days |
| 1C.13 | Auto-internationalizer pass on STR# output (Phase 1A LLM enrichment reused) | `tools/adventure-compiler/i18n.ts` | 2 days |
| 1C.14 | Micropolis Home authoring + preview UI for the seven object types (WigOMatic UI is a great first vertical — visible, fun, fast) | `apps/micropolis-home/src/routes/compose/` (currently `apps/simopolis/`) | 1 week core + 3 days per sub-shop UI |

### Definition of done

- A user can run `pnpm run compile-uplifted-computer --apps micropolis,my-city,goth-album --out out/`, get a `.iff` they drop into their `~/Documents/EA Games/The Sims/Downloads/`, launch the EA-published Sims 1, find the Uplifted PC in Buy Mode, and watch their Sim "play Micropolis" via real screen snapshots cycling on the PC sprite.
- A CD object exported from one Micropolis Home user's app can be installed into another user's game and registered into their Uplifted Computer's catalog.
- A Foreign Photo Album exported from a recovered 2003 family album loads in-game and is page-turnable, in any of 20 supported languages.
- **A WigOMatic-generated wig** (`"1950s Hollywood platinum finger waves"` typed in the UI) compiles to a Sims-1 head skin IFF, drops into `Downloads/`, and appears on the chosen Sim's head in-game.
- A Micropolis Rug-O-Matic Rug carrying a `moollm://content/cities/<id>` URL renders the city as cycling SPR2 atlases on the rug surface in-game.
- Provenance is preserved through the full pipeline; provenance is surfaced in the companion app's preview UI.

### First vertical (2 weeks, the headline demo)

The minimum slice for the headline screenshot: 1C.1 + 1C.2 + 1C.4 + 1C.5 + 1C.6 = a Sim playing Micropolis on a custom PC inside the EA-published Sims 1, with screen snapshots authored from a real Micropolis city file. Will Wright's 1996 demo, finally lived in. Two weeks of work after Phase 0 ships.

---

## Phase 1D — The Imagine Loop (4–6 weeks, parallelizable with 1B / 1C / 2)

The architectural alternative to reimplementing the Sims runtime. Full design lives in [the-imagine-loop.md](the-imagine-loop.md). LLM **examines** a parsed `.iff`, **imagines** an outcome under user-supplied intent (time skip, what-if, retroactive backstory, dream, cheat with narrative), **edits** the YAML representation coherently, and **injects** a valid `.iff` save file back into the player's EA-published Sims 1.

### Tasks

| # | Task | Where | Effort |
|---|---|---|---|
| 1D.1 | `examine()` — full structured snapshot from `NeighborhoodData` | `packages/sims-io/src/l5/examine.ts` | 2 days |
| 1D.2 | `intent.yml` schema + parser (time-skip, what-if, backstory, dream, cheat presets) | `packages/sims-io/src/l5/intent.ts` | 2 days |
| 1D.3 | MOOLLM `imagine-loop` skill: prompt structure, Speed-of-Light layout, output JSON schema | MOOLLM repo, `skills/imagine-loop/` | 4 days |
| 1D.4 | `applyImagine()` — write back YAML coherently with provenance + invariant claims | `packages/sims-io/src/l5/imagine-apply.ts` | 3 days |
| 1D.5 | Invariant validators: PersonData ranges, GUID collisions, relationship consistency, reference resolution, LLM-claimed invariants | `packages/sims-io/src/l5/validate.ts` | 4 days |
| 1D.6 | `compile()` — YAML → `.iff` using Phase 0 L3 setters + Phase 1C Adventure Compiler for album books | `packages/sims-io/src/l5/compile.ts` | 4 days |
| 1D.7 | Valid-or-revise loop: failed invariants → MOOLLM for corrected diff | `packages/sims-io/src/l5/loop.ts` | 3 days |
| 1D.8 | Family Album page renderer: WebGPU (`mooshow`) + image-gen integration; both paths palette-quantize to SPR2 | `packages/mooshow/src/album-render.ts` | 5 days |
| 1D.9 | Micropolis Home UI: intent input, IMAGINE preview, diff review, INJECT confirm | `apps/micropolis-home/src/routes/imagine/` | 1 week |
| 1D.10 | Intent presets: time-skip, what-if branch, retroactive backstory, dream sequence, cheat-with-narrative | UI templates + skill prompts | 3 days |

### Definition of done

- Drop a `Pleasantview/Neighborhood.iff` into Micropolis Home, type "skip five years for the Goth household, plausible," click Imagine, get a diff preview within ~60s.
- Approve the diff. Get a new `Neighborhood.iff` + a custom Pageable Album Book IFF for download.
- Drop both into the player's EA Sims 1 install. Launch. The Goths are five years older with five years of memories. The album book is on the shelf, readable in-game, in any of 20 supported languages.
- The valid-or-revise loop catches one synthetic invariant violation in the test suite and round-trips a corrected diff successfully.

### First vertical (1–2 weeks, the second headline demo)

1D.1 + 1D.2 + 1D.3 + 1D.4 + 1D.5 + 1D.6 = a working time-skip on a single household producing a valid `.iff` for the EA-published Sims 1, with one pageable album book of generated pages. This is the "five years pass" demo: another moment-of-grin for players, after the Uplifted Computer demo from Phase 1C.

---

## Phase 1E — Family Album as StoryMaker (4–6 weeks, parallelizable with 1B / 1C / 1D)

The 35-year SimCity → DreamScape → The Sims → Bar Karma / StoryMaker / Urban Safari lineage finally reaching its natural shape inside the Micropolis Federation. Full design lives in [family-album-as-storymaker.md](family-album-as-storymaker.md). Sims Family Albums become a **branching, merging, geo-tagged graph of scenes** with five navigation views (Map / Road / Pie-menu / Album / Branching-Story), federated by git, "snippets of DNA" weavable between authors.

### Tasks

| # | Task | Where | Effort |
|---|---|---|---|
| 1E.1 | Scene / Place / Edge / Storyline / Vote / Comment YAML schemas + validators | `packages/family-album/src/schema/` | 2–3 days |
| 1E.2 | Local-filesystem provider over a user's git-managed Sims directory | `packages/family-album/src/local-provider.ts` | 2 days |
| 1E.3 | Graph builder: union edges, storyline materializer, cycle detection | `packages/family-album/src/graph.ts` | 2–3 days |
| 1E.4 | **Map View** (Leaflet + OSM + GeoJSON; KML import/export) | `apps/micropolis-home/src/routes/album/map/` | 4 days |
| 1E.5 | **Road View** (WebGPU; flick-along-edge gesture; pie-menu wedges) | `apps/micropolis-home/src/routes/album/roads/` | 5 days |
| 1E.6 | **Pie-menu View** (kiss-to-connect, drag-apart-to-disconnect; iLoci-derived) | `apps/micropolis-home/src/routes/album/pie/` | 3 days |
| 1E.7 | **Album View** + storyline-to-album-book-IFF compiler | `apps/micropolis-home/src/routes/album/book/` + `packages/sims-io/src/l4/album-book-compile.ts` | 5 days |
| 1E.8 | **Branching Story View** (WebGPU 3D tree; vote tally overlay; branch / merge UX) | `apps/micropolis-home/src/routes/album/tree/` | 5 days |
| 1E.9 | DNA operations: character-snippet extraction, Bifrost-merge, provenance inscription | `packages/family-album/src/dna/` + `packages/sims-io/src/l4/bifrost-merge.ts` | 5 days |
| 1E.10 | Git-remote federation: add a friend's album as remote; pull; sync; push contributions | `packages/family-album/src/federation/` | 3 days |
| 1E.11 | Vote / comment append-only log; signature-based authorship | `packages/family-album/src/social/` | 2 days |
| 1E.12 | CA biome layer over a graph layout (MediaGraph-derived) | `packages/family-album/src/ca-biome/` | 4 days |
| 1E.13 | Optional StoryMaker.micropolis.host discovery server | `apps/storymaker-server/` | 1 week (deferrable) |
| 1E.14 | Imagine-Loop integration: an imagine call emits a multi-scene storyline; an existing storyline can be passed as context | `packages/sims-io/src/l5/imagine-loop` + `packages/family-album/` | 3 days |

### Definition of done

- A user can drop a `.iff` save into Micropolis Home and see their Family Album as a navigable graph in all five views.
- The user can publish a storyline to a friend over `git push`; the friend pulls and sees the scenes in their own Micropolis Home; they fork a branch, write their own storyline through the same scenes, and push back.
- The user can compile a storyline to a pageable album-book IFF, drop it into their EA Sims 1 install, and page through it in-game in any of 20 languages.
- A character snippet exported from author A's scene installs into author B's Dream space with full Bifrost merge + provenance.

### First vertical (1–2 weeks)

1E.1 + 1E.2 + 1E.4 + 1E.7 + 1E.10 = one user with a small album graph, sharing one storyline with one friend via a git remote, both compiling to a pageable album book IFF and loading it into their EA Sims 1. The smallest visible demo of the StoryMaker reborn.

---

## Phase 1F — Twitch-friendly streaming features (3–5 weeks, parallelizable with 1B / 1C / 1D / 1E)

The "watching the player IS the game" principle expressed at Twitch scale. Full design in [designing-inward-miyamoto-principles.md → §8a The Twitch corollary](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful). Thirteen concrete streaming-integration features (T.1–T.13), including a modern-LLM-vision reimplementation of Don's 2003 *Simplifier* (the screen-scraping catalog narrator) that doubles as an accessibility tool and an online-Sims-content-library lookup.

### Tasks

| # | Task | Where | Effort |
|---|---|---|---|
| 1F.1 | Twitch IRC integration (read-only first): connect, read chat, expose typed messages to the app | `packages/twitch-bridge/src/irc.ts` | 2 days |
| 1F.2 | **OBS overlay browser sources** (T.5 in the design doc): household mind-mirror, current scene, vote tally, Family Album live page, motives, city map — drop-in URLs the streamer adds to OBS | `apps/micropolis-home/src/routes/overlays/` | 1 week |
| 1F.3 | **Chat-as-writers'-room for Imagine Loop** (T.1): chat pitches intents; top-voted feeds the next IMAGINE call; streamer reviews + approves; representation-ethics filter | `apps/micropolis-home/src/routes/twitch/writers-room/` + Imagine Loop wiring | 1 week |
| 1F.4 | **Bit-cheers as in-narrative events** (T.3) + **Channel-points redemptions** (T.4) | Twitch EventSub wiring + Imagine Loop event table | 4 days |
| 1F.5 | **Sub-named Sims** (T.2): new sub → new Sim in the streamer's neighborhood with provenance trail | wiring + Sim character generator | 3 days |
| 1F.6 | **VOD chapter markers** (T.7): emit Twitch-API-compatible chapter markers at story-beat boundaries | `packages/twitch-bridge/src/vod-chapters.ts` | 2 days |
| 1F.7 | **Save-file giveaway-with-provenance at stream end** (T.8): one-click "publish today's save"; shareable URL with stream-derived provenance trail | UI + federation hooks | 3 days |
| 1F.8 | **Streamer trust controls** (T.9): per-streamer granular settings for what chat can do; rate limits; sub-only / mod-only gates; banned-keyword filters | UI + config schema | 3 days |
| 1F.9 | **Multi-streamer crossover** (T.10): two Micropolis Home users running concurrent streams with a household crossover; both chats vote on shared scenes; federated graph records | extends 1E.10 federation + 1F.3 voting | 4 days |
| 1F.10 | Official **Twitch Extension** for Micropolis Home channels (T.6): published Twitch panel showing household state, soul-files, album sidebar, city map | `apps/twitch-extension/` | 2–3 weeks (separate effort) |
| 1F.11 | "Twitch Plays Micropolis Home" mode (T.11): chat directly drives Imagine Loop with rate-limited rounds and stronger filters | opt-in event mode | 3 days |
| 1F.12 | **Simplifier** (T.13): vision-LLM provider abstraction + screenshot capture of the EA Sims 1 window; catalog scraper extracts name / price / description / visual identity per item, feeds the [Sims Content Registry](sims-content-registry.md), and cross-references online libraries ([Tornado-recovered Sims Exchange](the-tornado-and-the-archives.md), ModTheSims, SimFreaks / ZombieSims, donhopkins.com archive); TTS narration (Web Speech API + MOOLLM `tts` skill); desktop overlay + OBS browser-source variant | `packages/sims-vision/src/simplifier/` + `apps/micropolis-home/src/routes/overlays/catalog/` | 1–2 weeks |

### Definition of done

- A streamer can install Micropolis Home overlays into OBS in under 5 minutes, with no plugins.
- During a stream, chat can pitch intents, vote, and watch them feed into the next Imagine call.
- At stream end, the save file is downloadable by viewers, with the full stream-derived provenance trail intact.
- The official Twitch Extension is approved and installable in the Twitch Extension Studio.
- Simplifier reads any catalog item out loud on chat command (`!desc <item>` or chat keyword), shows the entry in the Sims Content Registry, and offers an online-library lookup for similar items.

### First vertical (1 week)

1F.2 + 1F.6 + 1F.7 = overlay sources + VOD chapter markers + save-file giveaway. This is the minimum useful set: every Sims-content streamer gets streamer-grade overlays and at-stream-end-save-sharing for free. Then 1F.3 (chat-as-writers'-room) lands as the headline-grabbing 3–4-week follow-up. 1F.12 (Simplifier reborn) is a strong **second** vertical (~1–2 weeks): accessibility / catalog-narration value lands immediately, and the screenshot-capture + vision-LLM provider abstraction it builds is the foundation 1F.13 and 1F.14 then reuse.

---

## Phase 2 — Two-resolution coupling: Micropolis zone ↔ Sims neighborhood (4–6 weeks)

The point at which Simopolis stops being two apps and becomes one world.

### Track A: Data contract (three binding patterns)

The zone↔save binding has three canonical patterns — see [simopolis.md → How Sims save files actually bind to Micropolis tiles](simopolis.md#how-sims-save-files-actually-bind-to-micropolis-tiles):

- **`tile-houses`** — low-density res zone with one save per tile-house slot.
- **`high-rise-tower`** — high-density res zone with the magic 8 households per floor × N floors.
- **`rendered-lot`** — one Sims save bound to a 3×3 zone, lot rendered semi-iso and sliced into 9 custom Micropolis tiles, with optional rooftop overlay content (The Sims Online's communal-roof-painting pattern, reborn).

| # | Task | Where | Effort |
|---|---|---|---|
| 2A.1 | Formalize `content/micropolis/cities/<city>/neighborhoods/zone-<row>-<col>.yml`: `binding.pattern` ∈ `{tile-houses, high-rise-tower, rendered-lot}` + per-pattern fields + aggregate metrics + optional `roof_content` overlays | schema doc + JSON schema | 3 days |
| 2A.2 | Aggregation function: from one *or many* `NeighborhoodData` bound to a single zone (depending on pattern), compute aggregate metrics (population, average income, education, satisfaction, household count). Pattern-aware. Pure TypeScript | `packages/sims-io/src/l4/aggregate.ts` | 4 days |
| 2A.3 | Zone-binding scanner: build a `CityIndex.json` mapping `(row, col) → binding pattern + bound save(s)` for a given city, dumped from the YAML files. Handles the three patterns and the empty-tile-houses-slot case (vacant lots for sale). | new file | 3 days |
| 2A.4 | Binding validator (uses the Adventure Compiler's validator surface): every claimed bound save must parse cleanly via `packages/sims-io`; high-rise occupancy claims (`floor × slot`) must be coherent; rendered-lot saves must have a lot the renderer can actually render. | `tools/adventure-compiler/validator/binding.ts` | 3 days |

### Track B: Micropolis engine reading aggregates

| # | Task | Where | Effort |
|---|---|---|---|
| 2B.1 | Engine plugin point: a hook called per residential zone tick that can take aggregate metrics from outside and adjust local tile state | `packages/micropolis-engine` | 4–5 days (touches WASM bridge) |
| 2B.2 | TypeScript-side bridge that streams aggregates into the engine each tick (or on change) | `apps/micropolis/src/lib/` | 3 days |
| 2B.3 | Visual cue: residential zones with bound neighborhoods get a small marker on the city map | UI work | 1–2 days |

### Track C: City state pushed into bound neighborhoods

| # | Task | Where | Effort |
|---|---|---|---|
| 2C.1 | A subscriber API: bound Sims neighborhoods can read city-level signals (unemployment, pollution, disaster events at their tile) | `packages/sims-io/src/l4/city-signals.ts` | 3 days |
| 2C.2 | A small policy table mapping city signals to Sim-side effects (slower promotions on high unemployment; Room/Health debuffs on high pollution; family-event log on tile-local disasters) | data | 2 days |
| 2C.3 | Test: simulate a tornado over a tile with a bound neighborhood; confirm the family event log captures it | tests | 1–2 days |

### Track D: Zoom-in UX

| # | Task | Where | Effort |
|---|---|---|---|
| 2D.1 | In Micropolis City (`apps/micropolis/`), clicking a bound residential zone opens a panel showing per-pattern household summaries (one list for `tile-houses`, a per-floor scroll for `high-rise-tower`, a single-lot card for `rendered-lot`) | UI work | 4 days |
| 2D.2 | "Zoom in" routes from Micropolis City to Micropolis Home (`apps/micropolis-home/`) with the zone parameter; back-button returns to Micropolis at the same camera position | routing | 2 days |
| 2D.3 | Provenance display: who authored the bound neighborhood(s), when archived, license terms; per-tile-house provenance for the tile-houses pattern, per-floor for the high-rise pattern | UI work | 2 days |

### Track E: Per-lot rendering and rooftop overlays (the Sims-Online-map mode)

| # | Task | Where | Effort |
|---|---|---|---|
| 2E.1 | Semi-iso lot renderer: read a Sims lot's architecture (walls/roofs/objects/landscaping from the lot's IFF), render in Sims-style semi-iso, output a configurable canvas size | `packages/mooshow/src/lot-render.ts` (uses existing WebGPU stage) | 1 week |
| 2E.2 | Tile slicer: divide a rendered lot into N×M Micropolis-tile-sized fragments; emit per-tile sprite atlases for the city renderer | `packages/tile-renderer/src/lot-slice.ts` | 4 days |
| 2E.3 | Custom-tile overlay path: Micropolis City's tile renderer reads bound zones' `binding.pattern == 'rendered-lot'` blocks and uses the sliced sprites in place of default residential tile graphics for those tiles | `packages/tile-renderer/src/overlay.ts` + city-map integration | 4 days |
| 2E.4 | Rooftop-overlay compositor: text and icon overlays read from `roof_content:` blocks composite onto the appropriate tile sprites at the right zoom level; visible on the Micropolis map view, hidden in the lot interior view | `packages/tile-renderer/src/roof-overlay.ts` | 4 days |
| 2E.5 | Micropolis Home authoring UI for rooftop overlays: pick a lot, type text or pick an icon, preview the resulting tile in context, save to `roof_content:`. Camp-energy welcome. | `apps/micropolis-home/src/routes/rooftop/` | 4 days |

The first vertical for Track E: pick one demo lot, run it through 2E.1 + 2E.2 + 2E.3, and watch the lot appear in semi-iso on the Micropolis city map in place of the generic residential-zone tiles. ~2 weeks. The headline is *"the city map literally shows the lots, like The Sims Online used to."*

### Definition of done

- Edit a family's income in `apps/simopolis`; switch back to `apps/micropolis`; the corresponding zone's land value moves.
- Trigger a Micropolis fire on a bound tile; the family inside gets a `family_event: fire_in_neighborhood` log entry, readable in `apps/simopolis`.
- Drag a parsed neighborhood onto a residential lot in the editor; the binding is persisted in YAML and survives reloads.

---

## Phase 3 — Single-source scrape (4–6 weeks)

The first real tornado. Limit to one source so we learn the legal/ethical/performance shape before we scale.

### Recommended first target: archived Sims Exchange snapshots

The Sims Exchange is the highest-value, lowest-controversy first target: EA's own former service, well-snapshotted in `archive.org`, with a clear "fan content" understanding. Start with the community [Sim Archive Project](https://archive.org/details/sim-archive-project) collection (seeded in [`content/simopolis/archives/SOURCES.yml`](../../content/simopolis/archives/SOURCES.yml)) for packaged Exchange and CC bundles; fall back to Wayback CDX for album HTML not yet in the collection.

### Tasks

| # | Task | Where | Effort |
|---|---|---|---|
| 3.1 | `content/simopolis/archives/SOURCES.yml`: seed list with archive URLs, expected content types, license assumptions, takedown contact | data | 1–2 days |
| 3.2 | `tools/tornado/`: a Node TypeScript CLI that fetches from the Wayback CDX API, paginates, downloads attachments, writes `provenance.yml` per artifact | new tool | 5–7 days |
| 3.3 | HTML parser for Sims Exchange album pages: extracts screenshots, captions, story prose, author handle, family/character names | new file | 4 days |
| 3.4 | Importer: ingests an archived album, runs through L3/L4/L5, produces a candidate `Neighborhood.iff`-shaped bundle even when no `.iff` was attached (procedural fallback) | new file | 5 days |
| 3.5 | Manual curation UI in `apps/simopolis`: review an imported album, edit, accept-or-reject, bind to a Micropolis lot | UI work | 4–5 days |
| 3.6 | Takedown workflow: documented path (`content/simopolis/takedowns/`), tooling to remove an artifact and its derivatives by ID | docs + tool | 2 days |
| 3.7 | Phase 3 ethics review checklist signed off by project lead before any imported neighborhood is published in the federated mirror | process | — |

### Definition of done

- A documented run of the tornado against an `archive.org` collection of Sims Exchange albums produces N curated, bound neighborhoods (target: N≥100) in a Micropolis city.
- Every artifact has provenance. Every artifact is takedown-removable in <24 hours by a single command.
- Every published artifact passes the ethics review checklist.

---

## Phase 4 — Multi-source tornado + skin/object recovery (months)

Now scale, but only across **archive-friendly sources without a live commercial operator** (see [the-tornado-and-the-archives.md → The sources](the-tornado-and-the-archives.md#the-sources-what-the-tornado-picks-up)): preserved Yahoo Groups, Geocities-era story sites, abandoned fan sites snapshotted on `archive.org`. Skin and object recovery in addition to families. Live paid sites (SimSlice, SimFreaks, ZombieSims, TSR, etc.) remain out of scope — players go to those directly.

### Highlights

- Generalize the importer to handle skin and object IFFs in addition to neighborhoods.
- Generative regeneration of low-resolution skins via image generation, anchored to the original art's palette and silhouette (see [BRIDGE.md skin regenesis](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md)).
- Per-source license profiles: which terms apply, what takedown channels look like.
- Family Album auto-internationalizer: every imported story available in all 20 Sims-supported languages, generated once on import.

This is where the project becomes a *living* archive — recurring sweeps catch newly snapshotted material, regenerate skins as image-gen quality improves, retranslate stories when better language models arrive.

---

## Phase 5 — Federated mirror + recurring sweep (months, ongoing)

The cycle closes. Players publish merged albums back out. Future tornadoes pick them up. A character's `CHARACTER.yml` accumulates a chain of authors over time, and the city becomes a multi-generational story space.

### Highlights

- Federated mirror protocol: a small, well-defined REST surface for publishing albums and characters with cryptographic provenance.
- Diff-aware re-import: when a character's `CHARACTER.yml` already exists, merge the new author's contributions rather than overwriting.
- Long-term storage strategy: not everything needs to live in the main repo. Large media goes to a content-addressed mirror.
- A scheduled sweep (weekly? monthly?) that re-runs the tornado against known sources and surfaces new material for curation.

---

## Cross-cutting work

These tasks support multiple phases and should be picked up opportunistically when they unblock the next phase.

| # | Task | Where | Priority |
|---|---|---|---|
| X.1 | Adopt `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` package-by-package, starting with `packages/tile-renderer` | repo-wide | low, low risk |
| X.2 | MCP service for the Micropolis engine itself (`list_commands`, `preview`, `propose`, `apply`) — required for safe LLM↔engine interaction in later phases | `apps/micropolis/src/mcp/` | medium, blocks deep LLM↔engine integration |
| X.3 | `parseMSH` for the 1998 prototype content | `packages/vitamoo` | medium |
| X.4 | VitaMooSpace SQLite persistence (Roots/Catalog tab scan results) | `apps/vitamoospace` | medium |
| X.5 | WebGPU renderer polish: GPU pass timing, validation UX, automated parity suite, bone-level pick IDs | `packages/vitamoo`, `packages/mooshow` | medium |
| X.6 | Normalized event envelopes for Micropolis callbacks | `packages/micropolis-engine` + bridge | medium |
| X.7 | Renderer plugin selection in the Micropolis app UI | `apps/micropolis` | medium |
| X.8 | UI overlays: pie-menu head, speech bubbles, censorship pass | `apps/simopolis`, `apps/vitamoospace` | low–medium |
| X.9 | GUID collision tooling: wire scanner into VitaMooSpace UI | `apps/vitamoospace` | medium |
| X.10 | GPU asset tooling: readback → BMP/IFF export; glTF import/export | `packages/vitamoo` | medium |
| X.11 | Package scoping: `@vitamoo/*` namespacing if/when we publish to npm | repo | low |

---

## Definition of "done" for Simopolis as a whole

We stop calling it a roadmap and start calling it a product when:

1. **A user can drop a `.cty` file in and a `.iff` save file in, and see them as one world.** A Micropolis city map. A Sims neighborhood bound to a residential zone. Click in, walk around. Click out, see the aggregates feed back to the city.
2. **A user can drop in a single `.iff` save and meet the characters as MOOLLM citizens.** They can talk. They have mind-mirrors. They have memories. They can be sent home changed.
3. **A Family Album upload from the Steam Sims re-release lands in our server and becomes a browsable, uplift-able neighborhood within minutes.**
4. **A curated tornado run against `archive.org` has populated at least one Micropolis city with bound neighborhoods recovered from the wider Sims web, with full provenance and takedown support.**
5. **Every change made by an LLM is an inspectable git commit**, attributable to a specific character or action. No ghost edits.

When all five of these are reliably true, Simopolis is a thing, not a roadmap.

---

## Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| LLM enrichment costs scale poorly with neighborhood size | medium | Speed-of-Light batching; cap context window; cache enrichments by character hash |
| Provenance gets lost in derivative chains | high | `provenance.yml` is mandatory; commits link to it; takedown tool tested in Phase 3 |
| EA or Micropolis GmbH objects to a specific recovered artifact | high | Documented takedown channel; default-private until reviewed; Phase 3 ethics checklist |
| A recovered album depicts an identifiable real person | medium | Living-person policy in [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md); default to anonymizing |
| The Steam Sims re-release upload endpoint isn't redirectable | medium | Fallback: drag-and-drop album files into our web UI; document both paths |
| `archive.org` access policies change | medium | Local cache; do not depend on always-fresh fetches in production |
| `packages/sims-io` L4/L5 churn breaks downstream | medium | Strict schema versioning on `ContentIndex` and `CHARACTER.yml`; SemVer the package |
| Scope creep into "let's also do Sims 2 / 3" | high | Explicitly out of scope until Sims 1 round-trip is real and stable |

---

## Open questions

1. **MCP server placement.** Does the MOOLLM MCP service live in the MOOLLM repo and get installed as a dev dependency here, or do we publish a thin TypeScript adapter from MicropolisCore? Either works; the choice has cost implications.
2. **Where do uplifted characters' git histories live?** Their own repo per neighborhood? A monorepo `content/simopolis/characters/`? Per-city subtrees? Open question; current default is per-city.
3. **How aggressive should the auto-translator be on recovered prose?** Translating every recovered Sims story into all 20 supported languages on import is cheap with current LLMs, but does it materially help, or does it bloat the archive? Worth a small experiment in Phase 4.
4. **Identifier strategy for recovered Sims.** Use original Sims GUIDs where they exist; mint deterministic IDs from archive URL + family name + slot index where they don't. Document the policy before Phase 3.

---

## References

| Resource | Where |
|---|---|
| Strategic vision | [simopolis.md](simopolis.md) |
| Character substrate (top-level framing) | [characters-as-hydrogen.md](characters-as-hydrogen.md) |
| Microworld OS substrate | [moollm-microworld-os.md](moollm-microworld-os.md) |
| Tornado pipeline | [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) |
| Family Album as StoryMaker (Phase 1E) | [family-album-as-storymaker.md](family-album-as-storymaker.md) |
| Twitch-friendly streaming features (Phase 1F) | [designing-inward-miyamoto-principles.md → §8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) |
| Bridge-target catalogue (post-Phase-2 expansion targets) | [federation-peer-games.md](federation-peer-games.md) |
| Open work tracking | [documentation/TODO.md](../TODO.md) |
| MOOLLM integration layer model | [moollm-micropolis-integration.md](moollm-micropolis-integration.md) |
| Bridge field mapping | [external `BRIDGE.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md) |
| IFF layer pyramid | [external `IFF-LAYERS.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/IFF-LAYERS.md) |
