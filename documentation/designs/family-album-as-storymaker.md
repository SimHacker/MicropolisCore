# Family Album as Storymaker

## A branching, merging, geo-tagged graph of scenes for Micropolis Home

**Status:** Active design
**Monorepo:** MicropolisCore
**Read first:** [characters-as-hydrogen.md](characters-as-hydrogen.md) — the character substrate this doc extends
**Companion documents:** [the-imagine-loop.md](the-imagine-loop.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [moollm-microworld-os.md](moollm-microworld-os.md) · [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) · [sims-content-registry.md](sims-content-registry.md) · [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md) · [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)

> **Trademark notice.** *Micropolis* is used under license from Micropolis GmbH. *SimCity*, *The Sims*, and *Maxis* are EA Inc. trademarks; references are nominative use only. No affiliation with or endorsement by any listed studio is implied.

> **Scope.** A companion-side extension of the user-authored Sims Family Album. The Sims engine remains the runtime; album pages compile back to documented `.iff` book/album objects. See [simopolis.md → Scope and intent](simopolis.md#scope-and-intent).

> **Lineage.** This design draws on a thread of prior work (HyperLook SimCity, SimCityNet, DreamScape, MediaGraph, iLoci, Bar Karma's StoryMaker, Urban Safari) that is documented elsewhere in the design suite — see the *Lineage* section in [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md), [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) (SFC / Bar Karma / HiveMind), and the SimCity-to-Bar-Karma chronology referenced from [characters-as-hydrogen.md](characters-as-hydrogen.md). This doc focuses on the design itself; the lineage is not re-litigated here.

---

## The idea

The Sims Family Album, as Maxis shipped it in 2000, is a linear chain of captioned screenshots. Players have used it for 25 years; The Sims Exchange (now archive-only) showed that millions of them want to share albums with each other.

The natural next shape is a **branching, merging, geo-tagged graph of scenes**, where:

- A scene is a captioned moment (image + text + place + the character / lot / object data behind it).
- Scenes connect by directed edges (continuation, aftermath, alternate-reality, dream, crossover, derived-from, geo-adjacent).
- Storylines are author-curated paths through the shared scene pool.
- Characters and lots travel inside scenes as content snippets; when reused, the [Bifrost protocol](moollm-microworld-os.md#the-bifrost-the-bridge-as-a-structured-ontological-transition) handles identity sync and provenance.

The graph lives in git, federates by `git remote`, and round-trips through the [Adventure Compiler](moollm-microworld-os.md#the-adventure-compiler-is-a-coherence-engine-partner-not-a-one-shot-compiler) to a pageable Family Album book IFF object that the EA-published Sims 1 displays normally.

---

## Data model

```yaml
# scene.yml
scene:
  id: scene-2026-05-24-cassandra-meteorite
  authors: [donhopkins]
  created_at: 2026-05-24T16:30:00+02:00
  title: Cassandra brings home a meteorite
  caption: Cassandra came home with a meteorite she had been cataloging since spring.
  caption_lang: en
  household: goth-pleasantview
  household_members: [cassandra-goth, bella-goth]
  place_id: place-goth-livingroom
  image: { path: ./scene.png, method: webgpu, palette: sims-1-album }
  source: { type: imagine-loop, intent_ref: ./intent.yml, provenance: ./provenance.yml }
  embedded_content:
    characters: [cassandra-goth.character.yml]
    custom_objects: [meteorite.iff]
    lots: []
  next: [{ scene_id: scene-2026-05-25-cassandra-thesis, edge_type: continuation }]
  prev: [{ scene_id: scene-2026-05-21-cassandra-fieldwork, edge_type: continuation }]
  votes: { up: 12, down: 0 }
```

Other record types follow the same compact shape: `place.yml` (kind ∈ `lot-interior | real-world-geo | fictional | micropolis-zone`), `character-snippet.yml` (`soul_ref` + `iff_snapshot` + permission flags), `storyline.yml` (author-owned ordered path with a compile target), `vote.yml` / `comment.yml` (append-only).

### Edge types

| Edge | Direction | Meaning |
|---|---|---|
| `continuation` | A → B | Same household, next in time |
| `aftermath` | A → B | Consequence of event in A |
| `alternate-reality` | A → B | What-if fork |
| `dream` | A → B | Dream sequence (see [Imagine Loop use case E](the-imagine-loop.md#e-dream-sequence)) |
| `crossover` | A ↔ B | Same event, two households' POVs |
| `merge` | A, B → C | Two storylines reconciled |
| `recovered-from` | A → archived-page | Tornado import |
| `character-derived-from` | A → B | B's character soul descends from A's |
| `lot-derived-from` | A → B | B's lot forked from A's |
| `geo-adjacent` | A ↔ B | Same place, different times |
| `zone-aggregate` | many → tile | Scenes contribute to a Micropolis zone |

All data is YAML in git, so the entire graph is git-mergeable; see [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md).

---

## Five navigation views over one graph

The data is one graph; the user picks the view. Each view borrows a primitive from prior tools in the lineage referenced above.

| View | Interaction | Best for |
|---|---|---|
| 🗺️ Map | Pan / pin / KML overlay | Geo-tagged scenes; recovered-content geography |
| 🛣️ Road | Drag-flick along edges | Reading a storyline as a path; making/breaking edges |
| 🥧 Pie-menu | Click scene → outgoing edges as wedges | Dense local browsing |
| 📖 Album | Linear page-turn | The in-game shape; round-trip to album book IFF |
| 🎬 Branching Story | 2D / 3D tree with vote tallies | Authoring; voting; merging branches |

Edit operations are direct manipulation in each view: kiss two scenes together to connect them, drag apart to disconnect; same modeless pattern as iLoci and MediaGraph. There is no separate editor mode.

### Place kinds

A scene's place can be a Sims lot (`lot_ref`), a real-world point (`geo: { lat, lon }`), a fictional setting, or a Micropolis residential zone (`zone_ref`). The Map View shows the geo-anchored subset; KML / GeoJSON export is standard; nearby photos come from open-licensed sources (Wikimedia / Mapillary / OSM). Scenes tagged to a `micropolis-zone` feed the [zone-binding scanner](simopolis.md#how-sims-save-files-actually-bind-to-micropolis-tiles).

---

## DNA semantics: moving a character between authors

A scene's `embedded_content` carries the content it depends on. When author B wants to reuse a character from author A's scene:

1. **Read** the snippet: `cassandra-goth.character.yml` (soul) + `iff_snapshot` (per-scene PersonData + relationships).
2. **Bifrost-merge** into B's Dream space. If B has no Cassandra, install A's. If B has one, the [merge over identity](characters-as-hydrogen.md#sync-semantics-in-one-paragraph) runs: trivial cases land silently, conflicts open a merge UI.
3. **Compile** into B's `.iff` on next save emission.
4. **Inscribe provenance**: `character-derived-from: <scene-id>, author=<a>, permission=<spdx>`.

Custom objects and lots travel the same way; the [Sims Content Registry](sims-content-registry.md) tracks dependencies so a reused scene doesn't arrive with broken IFF references.

The Tornado pipeline ([the-tornado-and-the-archives.md](the-tornado-and-the-archives.md)) performs the same operation against historical archive content. The Bifrost is the same; only the source differs.

### Permission and consent

Two author-set flags govern reuse:

- `permission_to_repurpose` — defaults to `your-own-use-only`; authors can declare `cc-by-nc-sa-4.0`, `cc-by-4.0`, or `cc0`. Clients honor what's declared.
- `consent_for_living_person_depiction` — defaults to `not_applicable`; only `provided` enables Imagine-Loop operations against real-person depictions. The [representation-ethics ambient skill](moollm-microworld-os.md#representation-ethics-activate-traditions-do-not-impersonate) enforces.

Same posture as the Tornado's [ethics rules](the-tornado-and-the-archives.md#ethics). Provenance is mandatory; takedown is always available.

---

## Merge model

| Object | Strategy |
|---|---|
| Scene metadata | Per-field last-writer-wins with audit; fork to keep your own |
| Scene image | Last-writer-wins; alternates stored as `alternate_images` |
| Edges | Union; votes weight which edges a storyline compile uses |
| Character soul | Git-merge over `CHARACTER.yml`; conflicts open merge UI |
| `iff_snapshot` PersonData | Numeric mean with audit; user can override |
| Storyline order | Owned by storyline author |
| Votes / Comments | Append-only |

**Scenes are community-owned; storylines through scenes are author-owned.** A storyline is curation, not content; multiple competing storylines through the same scenes are the normal state, not a degenerate one.

---

## Federation

Each user's family album graph is a git repository inside their [git-managed user Sims directory](simopolis.md#git-managed-user-sims-directory). Federation operations are git operations:

- Share an album → `git push`
- Subscribe to a friend → `git remote add`
- Branch their canon → `git checkout -b`
- Merge back → `git merge`

A central discovery server (provisionally `storymaker.micropolis.host`) is optional and only useful for discovery / voting tallies. Take it offline and the graph keeps working; it's one remote among many.

The client stack is SvelteKit + WebGPU + TypeScript inside Micropolis Home; the server, when present, is a small Node service. Mobile clients (Capacitor / Tauri / PWA) are deferred.

---

## How it appears inside the EA-published Sims 1

The graph lives in Micropolis Home. Inside the EA game, the player sees three on-disk artifacts the [Adventure Compiler](moollm-microworld-os.md#the-adventure-compiler-is-a-coherence-engine-partner-not-a-one-shot-compiler) emits:

1. **Pageable Family Album book IFF objects** — a storyline compiles into a book that drops on a Sim's bookshelf and pages through normally. See [the-computer-as-portal.md → Foreign Photo Album](the-computer-as-portal.md#4-the-photo-album-with-foreign-pages).
2. **Rug and TV manifestations** — graph subsets cycle on the [Micropolis Rug-O-Matic](the-computer-as-portal.md#5-the-micropolis-rug-o-matic-rug) or on a Sim's TV via screen-snapshot SPR2.
3. **Computer-as-Portal neighborhood viewer** — a custom Computer object displays the graph itself (branches, votes, alternates) through documented popup-and-SPR2 mechanisms.

All three are custom content. No engine modification.

---

## Integration

| Other design | What this depends on |
|---|---|
| [packages/sims-io](../../packages/sims-io) | IFF read/write, FAMI/NBRS/PersonData parsers, SPR2 palette quantizer, album-book IFF authoring |
| [the-imagine-loop.md](the-imagine-loop.md) | Imagine outputs land in this graph; existing scenes feed back as context |
| [moollm-microworld-os.md](moollm-microworld-os.md) | `CHARACTER.yml`, Bifrost protocol, representation-ethics skill |
| [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) | Same Bifrost / provenance / takedown discipline for recovered content |
| [the-computer-as-portal.md](the-computer-as-portal.md) | Album book / Rug-O-Matic / TV / Computer compile targets |
| [sims-content-registry.md](sims-content-registry.md) | Dependency tracking and repair for embedded objects |
| [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md) | Git-merge semantics underneath federation |
| [characters-as-hydrogen.md](characters-as-hydrogen.md) | Multi-resolution / multi-universal identity model |

No new substrate is introduced — this is a recombination.

---

## Build plan

Phased tasks live in the roadmap: [Phase 1E in `simopolis-uplift-roadmap.md`](simopolis-uplift-roadmap.md#phase-1e--family-album-as-storymaker-4-6-weeks-parallelizable-with-1b--1c--1d). Headline first vertical: one user with a small graph, sharing one storyline with one friend via `git remote`, both compiling to a pageable album book IFF and loading it into their EA Sims 1.

---

## Failure modes

| Failure | Mitigation |
|---|---|
| Reused character DNA used in a way the original author objects to | `permission_to_repurpose` honored by clients; provenance trail; takedown channel |
| Scene depicts a real person without consent | `consent_for_living_person_depiction` flag; representation-ethics skill blocks Imagine-Loop ops |
| One author injects unwanted content into another's storyline | Storylines are author-owned; cross-author edits are PRs, not pushes |
| Vote brigades distort canon | Storylines aren't canon-by-vote; votes are advisory metadata, not authority |
| Spam floods the graph | Trust signals; per-author visibility filters; reverse-chronological default with author-affinity weight |
| Storyline-compile breaks because of missing dependencies | [Content Registry validate / repair walk](sims-content-registry.md) runs at compile time |
| Federation server offline | Graph lives in git; central server is one remote among many |
| Tornado-recovered scene violates living-person policy | Tornado [ethics rules](the-tornado-and-the-archives.md#ethics) apply pre-import; recovered scenes flagged with stricter constraints |
| Auto-i18n mistranslates a culturally sensitive caption | LLM-assisted with human review per language; per-scene opt-out flag |

---

## Open questions

- **Central server now or never?** Probably eventually, as a thin discovery / voting / federation registry. Phase 1E ships federation-only; central server is deferred until community demand is real.
- **CA biome layer over the graph?** MediaGraph-style cellular-automata mixing at scene neighborhoods could give the Imagine Loop advisory tonal hints near multi-author crossovers. Speculative; not in Phase 1E. Possibly worth a small experiment later.
- **Curator role?** Bar Karma had a writers' room curating community pitches. We probably want a soft equivalent (reputation-weighted endorsements on storyline visibility), not a hard hierarchy. Defer until needed.
- **Two authors disagree about a shared character's canonical state.** The Bifrost merge produces two simultaneously-valid identities in their respective Dream spaces, with the shared graph displaying the divergence as a fork. Consistent with [Sync semantics](characters-as-hydrogen.md#sync-semantics-in-one-paragraph) — a character is a pattern across substrates, not a row in a database.

---

## References

In the design suite: [characters-as-hydrogen.md](characters-as-hydrogen.md) · [simopolis.md](simopolis.md) · [the-imagine-loop.md](the-imagine-loop.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [moollm-microworld-os.md](moollm-microworld-os.md) · [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) · [sims-content-registry.md](sims-content-registry.md) · [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md) · [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) · [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md) · [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)

External lineage materials (Bar Karma, StoryMaker / Urban Safari demos, MediaGraph, iLoci, Will Wright's 1996 Stanford talk, DreamScape, SimCityNet, HyperLook SimCity, *The Wedding Album*) are listed in [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) References and not duplicated here.
