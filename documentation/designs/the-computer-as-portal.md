# The Computer-as-Portal: Worlds Embedded in Worlds

## Or: how the Sim's PC starts running Micropolis, family albums become portable, and save files travel inside save files

**Status:** Active design  
**Monorepo:** MicropolisCore  
**Companion documents:** [simopolis.md](simopolis.md) · [moollm-microworld-os.md](moollm-microworld-os.md) · [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) · [the-imagine-loop.md](the-imagine-loop.md) · [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)

> **Trademark notice.** This project uses *Micropolis* under the [Micropolis Public Name License](../../MicropolisPublicNameLicense.md) from Micropolis GmbH. *SimCity* and *The Sims* are Electronic Arts Inc. trademarks; references are historical or in this project's role as a *companion* to the EA-published Sims Legacy Collection. No affiliation with or endorsement by EA or Micropolis GmbH is implied.

> **Scope.** Custom Sims 1 content (IFF objects) produced by Micropolis Home tools and loaded by the user into their own Sims 1 install via documented Maxis mechanisms (BHAVs, STR#, SPR2). See [simopolis.md → Scope and intent](simopolis.md#scope-and-intent) for the canonical positioning.

---

## The image

A Sim sits down at their PC. The screen lights up. We hear the modem dial. The icon on the screen sprite cycles: a city map. A budget panel. A road being dragged. Smoke from a fire. A monster eating downtown.

The Sim is playing **Micropolis**, on their Sims-1-era PC, *inside their EA-published copy of The Sims 1*.

The Sim gets up, eats dinner, comes back. Now the same PC is showing a different game — the screen cycles through Sims-style screenshots of *another* Sims save file. A family the player downloaded, recovered from a 2003 family album archived on `archive.org`. The Goth household. Mortimer at the bookshelf, Bella at the stove, Cassandra in the yard. Each Sim, in the player's *current* game, can sit down and "play" the recovered Goths' lives on their own PC.

The Sim gets up again, opens their Family Album in-game. There's a new photo: their Sim, at their PC, playing Micropolis. The image was generated when they sat down. It is now part of their household's permanent memory.

None of this required us to write a Sims simulator. All of it required us to ship a custom IFF *Computer* object — and, optionally, custom CD-ROM objects, custom photo-album books, custom "save game" disks — produced by our content tools and dropped into the player's `~/Documents/EA Games/The Sims/Downloads/` directory. The EA-published Sims 1 plays them, the way it has played every custom object the community has authored for twenty-five years.

This is what "the computer in The Sims is already a portal to other simulations in the game's fiction" actually buys us, once we take it seriously.

---

## The historical chain

This is not a new idea. It is the *finishing* of an old one.


| Year               | Event                                                                                                                                                                                                                                                                                                                        | Relevance                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **1996, Stanford** | Will Wright demos Dollhouse. *"I just loaded a SimCity file into here."* Talks about persistent data moving between games as the hobby model.                                                                                                                                                                                | The two-resolution world. Data portability. The intent baked into The Sims from before The Sims existed.                            |
| **1996, Stanford** | Wright also says: *"I could be in here in a 3D point of view, shooting the person on the toilet if I wanted to. Maybe it's a different game player in a different game, but still running off the same server."*                                                                                                             | Different games sharing a substrate. Worlds embedded in worlds via shared data.                                                     |
| **2000**           | The Sims ships with a Computer object. Real interactions: "Play Game," "Find a Job," "Chat."                                                                                                                                                                                                                                 | The portal exists in the EA-shipped game. The runtime is already there.                                                             |
| **2000–2003**      | Maxis-blessed [Transmogrifier](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf) (Don Hopkins, Maxis) ships. Players author custom objects, including custom *appliances* with custom interactions. Rug-O-Matic, custom tombstones, custom paintings, custom slideshow objects all ship as community content. | Custom IFF content extending the Sims runtime is *Maxis-blessed policy*, not gray-area modding.                                     |
| **2001 era**       | **Lilliputian Micropolis runs inside The Sims** via SimAntics. (Documented in the SimAntics VM Design Document; referenced in [simopolis.md → "The Ecosystem, Not the Killer App"](simopolis.md#the-ecosystem-not-the-killer-app).) Don has a *working SimCity in a Sims computer object*.                                 | Proof that this works. Already demonstrated, on the original Sims runtime, by the person who wrote the original Sims VM design doc. |
| **2026**           | We do it again, but properly: production-quality, MOOLLM-aware, screen-snapshot driven, recursive, multi-save-file, with a content authoring pipeline anyone can use.                                                                                                                                                        | This document.                                                                                                                      |


The 1996 demo, the 2001 SliceCity Lilliputian SimCity inside The Sims, and the present design are one continuous project across thirty years. Each step is a content artifact for an EA-shipped game. None reimplement the game.

---

## What gets built

Seven custom IFF object types (plus the Character Customization Studio's sub-shops), each a small Adventure-Compiler target. All live as **player-installable content** in the EA-published Sims 1 install. The Sims object system supports many more surfaces (windows, paintings, boardgames) on the same `moollm://`-URL pattern; the seven below are the canonical first set.

### 1. The Uplifted Computer (custom Computer object)

The original Computer object has fixed interactions ("Play Game" → fixed animation). The Uplifted Computer is a custom IFF Computer that, in addition to the Maxis-default behavior, exposes a **catalog of installable apps** read from a MOOLLM-style URL list baked into the object's STR# strings and BHAV constants.

The custom object's structure (all documented Maxis chunk types — no engine modifications):

```
uplifted-computer.iff
├── OBJD        Object definition: name, price, category
├── OBJf        Object function table: which BHAV handles which event
├── STR#  100   "Name": "Uplifted PC"
├── STR#  101   Catalog name + flavor text
├── STR#  200   "Installed Apps" — one string per installed MOOLLM URL,
│               e.g. "moollm://apps/micropolis/  (Micropolis 2.0)"
│                    "moollm://content/cities/haight.cty  (Haight, my city)"
│                    "moollm://content/neighborhoods/pleasantview-fragment/  (The Goths)"
├── STR#  201–209  Per-app description, version, "publisher" (in-fiction)
├── STR#  300+  20-language translations for everything above
├── BHAV  Init     Default screen, idle animation
├── BHAV  UseComputer  Sit, pose, run app-cycle loop
├── BHAV  RunApp_Micropolis
│                 Cycle through screen-snapshot sprites; popup ad
│                 for "the city is growing!" / "fire downtown!"
├── BHAV  RunApp_NeighborhoodPlayback
│                 Cycle through screenshots from another save file;
│                 popup with caption line from that household's album
├── BHAV  TakeScreenshot
│                 Used by ad-hoc interactions to generate a Family
│                 Album page of the Sim using the computer
├── SPR2  500–540 Screen-snapshot sprites:
│                   - Micropolis city map view
│                   - Micropolis fire / tornado / monster events
│                   - Recovered Sims neighborhood scenes
│                   - Custom screenshots for player-authored apps
├── PALT        Standard Sims palette
└── SLOT, TTAB, FWAV, …  Other standard chunks
```

The catalog is just data. Adding a new app = appending a new STR# line + a new SPR2 sprite + (optionally) a new BHAV that does interesting per-app behavior. The Adventure Compiler ([external `BRIDGE.md` → Adventure Compiler](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md#adventure-compiler-moollm--multi-target-export)) produces the whole IFF from a YAML description.

```yaml
# uplifted-computer.yml — Adventure Compiler source
object:
  name: "Uplifted PC"
  base: computer-default                       # inherit standard Sims PC behaviors
  catalog:
    apps:
      - id: micropolis
        url: moollm://apps/micropolis/
        title: "Micropolis 2.0"
        version: "2026"
        publisher: "(GPL release, Micropolis GmbH)"
        sprites: [city-map, fire, tornado, downtown]
        slogan: "Build your city, fight your disasters."

      - id: my-city-haight
        url: moollm://content/cities/haight.cty
        title: "Haight"
        version: "Save: 2026-05-23"
        publisher: "(your city)"
        sprites: [haight-overview, haight-detail-1, haight-detail-2]

      - id: goth-neighborhood-2003
        url: moollm://content/neighborhoods/goth-fragment-2003/
        title: "The Goths (recovered 2003)"
        version: "Archived: 2003-08-14"
        publisher: "(family album, archive.org)"
        sprites: [bella-kitchen, mortimer-bookshelf, cassandra-yard, family-photo]
        provenance: provenance.yml
```

The Adventure Compiler walks this YAML, fetches the screenshot sprites (image-gen + palette-quantize → SPR2), composes the BHAV table, writes the IFF, and emits it to `out/uplifted-computer.iff`. The player drops the file into `Downloads/`. The next time they start their Sims 1, the Uplifted Computer is available in Buy Mode under Electronics.

### 2. The Custom CD-ROM (custom CD object, like Sims expansion-pack inserts)

A small inventory-sized object. Pickup-able. Each CD is *one app* — one MOOLLM URL — packaged as a draggable IFF.

```
goth-album-cd.iff
├── OBJD
├── STR#  100   "The Goths (2003)"
├── STR#  101   "A family album from a long time ago. Insert into a PC to play."
├── STR#  200   "moollm://content/neighborhoods/goth-fragment-2003/"
├── BHAV  Install
│                 When dropped on an Uplifted Computer, this BHAV
│                 reads the URL from STR#200 and registers it into
│                 the Computer's app catalog (via a shared user-data
│                 chunk on the Computer object — same pattern as
│                 the "memory" chunks in the photo album feature).
├── SPR2  …      CD cover art (image-gen from album content)
```

CDs serve two purposes:

- **Inventory of installable software.** A player's Sim can collect CDs the way they collect any object. A shelf full of CDs is a shelf full of MOOLLM URLs pointing at content.
- **A unit of sharing.** A player who uplifts their old city to Simopolis can publish a CD object. Another player downloads the CD into their game and "installs" it on their Sim's PC.

### 3. The Save-Game Disk (a CD-shaped save file embedded in a save file)

A specialization of the CD object. Where a CD-ROM points at *software*, a Save-Game Disk points at *a save file* — a Sims neighborhood, a Micropolis city, or a household export. Same mechanism: the disk is a small inventory object whose STR# holds a MOOLLM URL.

The implication is the recursive bit:

> **A Sims save file can contain a Save-Game Disk object that references another Sims save file.**

The Sim, inside the player's game, can hand a save-game disk to another Sim, drop it on a PC, and "load" it — meaning the Computer's screen now displays scenes from the disk's referenced save file. The disk is a portable, in-fiction representation of *somebody else's save file*. The hand-off is an interaction; the install is a BHAV; the rendering is a screen snapshot.

> **A Micropolis city file can be a Save-Game Disk too**, sitting on a Sim's desk, pickupable, insertable into a PC.

Save files embed save files. The disk is the embedding.

### 4. The Photo Album with Foreign Pages

The Sims 1 already has Family Album: each household has a photo album the player edits in-game. Maxis designed it to take screenshots and let the player caption them.

Simopolis ships a custom **Photo Album** IFF object — a *book*, page-turnable, modeled on the slideshow-object pattern Don already shipped — that can hold pages from *another* save file.

```yaml
# foreign-album.yml — Adventure Compiler source
object:
  name: "The Goth Album (1999–2003)"
  type: pageable-book
  pages:
    - image: bella-and-mortimer-wedding.png        # ← real recovered album image
      caption_en: "Their wedding day. Bella wore black."
      caption_fr: "Leur jour de mariage. Bella portait du noir."
      caption_ja: "結婚式の日。ベラは黒を着ていた。"
      # … 17 more languages …
    - image: kitchen-fire-aftermath.png
      caption_en: "The kitchen, the next morning."
      # …
  provenance: archive-org-2003-08-14-snapshot
```

The compiler emits a multi-page IFF book object with SimAntics popup-paging code (the slideshow-object pattern). The player drops it into their game. Their Sim walks up to it, clicks "Read," and pages through *another household's photo album* — recovered from `archive.org`, auto-translated into all 20 supported Sims languages.

This is the embedding **Sims save file → Sims save file**: the current household's library shelf holds the album of the Goths.

The same recovered or generated album content also manifests on other in-game surfaces — TV "channels" cycling the album pages, a multi-photo rug whose top is a grid of album cells, a wall collage of paintings, a *Sims Superstar* stage backdrop the Sim performs in front of, and so on. See the [`moollm://`-URL surface table at the end of §5](#5-the-micropolis-rug-o-matic-rug) for the full set. The Family Album content type fans out across many object classes from one source bundle.

### 5. The Micropolis Rug-O-Matic Rug

A custom rug IFF whose top texture is a rendered Micropolis city. The rug carries the city's `moollm://` URL in its STR# data, so it remembers which city it depicts. The rug animates: at slow in-game intervals, its top sprite cycles between a few baked views of the city (day, night, traffic rush, a disaster moment). When a Sim interacts with "Look at the city," a SimAntics popup brings up a closer view.

This is the spiritual successor to **Maxis's original Rug-O-Matic** (early Sims era, custom rugs via TMOG OLE Automation: title + text + picture). Same pattern, same legal posture as Maxis's own blessed content tool — extended with image-gen / WebGPU rendering for the picture, a MOOLLM URL for the back-reference, and an animation cycle for "the floor starts playing."

```yaml
# micropolis-rugomatic-rug.yml — Adventure Compiler source
object:
  name: "Haight City Rug"
  type: rug
  size: 2x2                                # Sims rug sizes; 2x2, 2x3, 3x4 supported
  source_url: moollm://content/cities/haight.cty
  pattern:
    method: hybrid                         # WebGPU procedural render + image-gen stylization
    palette_constraint: sims-1-rug-palette
    base_view: city-map                    # the canonical render
  animation:
    enabled: true
    frames:
      - { view: city-day,           dwell_minutes: 60 }
      - { view: city-night,         dwell_minutes: 30 }
      - { view: city-traffic-rush,  dwell_minutes: 10 }
      - { view: city-disaster,      dwell_minutes: 5, conditional: "has_recent_disaster" }
    transition: crossfade
  interaction:
    name: "Look at the city"
    bhav: cycle-detail-snapshots           # popup paging through 5–10 closer views
    duration_sims_minutes: 10
  provenance:
    source_save: haight.cty
    rendered_at: 2026-05-23T17:00:00+02:00
    renderer: tile-renderer-webgpu
```

The mechanism is exactly the same as the Uplifted Computer's screen — SPR2 sprites baked from real Micropolis renders, BHAVs cycling them on the rug's top atlas. Different surface (floor instead of screen), same pipeline.

#### "Play SimCity in the carpet"

This rug is **an even smaller scale version of [SliceCity*](https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources)* — Don's earlier project (in the Maxis-era Sims modding ecosystem) that put a tiny, *live*, SimAntics-running SimCity inside a Sims object. SliceCity ran an actual simulation in the object via BHAVs. The Micropolis Rug-O-Matic is more modest in mechanism (cycling baked snapshots, not a live in-game simulation) but more powerful in *what it depicts*: a real Micropolis city, with all of Micropolis's CA-driven complexity, rendered out of Micropolis City and loaded onto the rug as a sequence of views.

The user's instinct — *"the floor starts playing, and you can play simcity in the carpet"* — captures the lived experience precisely:

- The Sim walks across the rug. The rug shimmers between day and night views of Haight.
- The Sim sits on the rug. A popup shows a closer detail: a fire in downtown Haight is visible in the rug's pattern.
- The player, watching, opens Micropolis City in their browser to fight the fire. Saves the city. Re-renders the rug. Drops the new IFF into their Sims install.
- The next time the Sim walks on the rug, the fire is out.

The rug becomes a **live-ish window into a city the player is also simulating in Micropolis City**. The Sims engine cycles the rug's sprites; the player keeps Micropolis up to date; the loop closes through the player's own actions.

This is the dual of the Uplifted Computer: the *computer* shows the city on the screen-sized surface; the *rug* shows the city on the floor-sized surface. The Sim can do both, on the same lot, simultaneously. Will Wright's 1996 demo had a SimCity file loaded as terrain *under* the dollhouse. The Rug-O-Matic puts that terrain back *inside* the dollhouse, on the floor where it belongs.

The same rendering pipeline supports other surfaces with the same pattern:


| Surface                  | Object class                                        | Use                                                                                |
| ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| PC screen                | Uplifted Computer                                   | The detailed app surface                                                           |
| TV screen                | Custom TV object                                    | TV "channels" cycling Family Album pages or city views as casual ambient viewing   |
| Rug                      | Micropolis Rug-O-Matic Rug                          | The ambient living-room surface (single view)                                       |
| Multi-photo rug          | Multi-cell Rug-O-Matic variant                      | A rug whose top is a *grid* of photo cells — a literal "photo album on the floor"  |
| Wall painting            | Painting (existing object, custom canvas)           | A static or cycling view as decor                                                  |
| Wall photo arrangement   | Multi-painting / collage object                     | A whole wall composed of many album pages                                          |
| Window-look-out          | Custom Window object                                | The city "outside" the Sim's window                                                |
| Stained-glass window     | Decorative variant                                  | Stylized city view as art                                                          |
| Boardgame surface        | Custom Boardgame object                             | Two Sims "play" Micropolis together                                                |
| Superstar stage backdrop | Stage backdrop (from *The Sims Superstar* lineage)  | A *Sims Superstar*-style stage set whose backdrop is a Family Album page or city view; Sim performs in front of it. (Requires the player to own *Superstar*.) |

The Family Album content type fans out across many surfaces: a recovered 2003 album can become the Uplifted Computer's catalog *and* a Foreign Photo Album book *and* a multi-photo rug *and* a TV channel *and* a Superstar stage backdrop, all from the same source bundle. The Adventure Compiler reads one YAML; the compiler target chooses what kind of IFF to emit.

> The Adventure Compiler itself is much richer than "YAML → IFF" — it's the LLM's iterative peer, with a four-message protocol (validation errors, view emission, empathic templates for code generation, final flatten). The object types in this document are emitted by *target plugins* of the compiler's `flatten` step. The interactive authoring loop that lets a user describe a Rug-O-Matic rug or a WigOMatic wig in natural language and end up with a working IFF runs through the same validator-and-template machinery. Full architecture: [moollm-microworld-os.md → The Adventure Compiler is a Coherence-Engine partner](moollm-microworld-os.md#the-adventure-compiler-is-a-coherence-engine-partner-not-a-one-shot-compiler).

### 6. WigOMatic and the Character Customization Studio

The most fun set of tools in Micropolis Home, and unapologetically camp. The flagship is **WigOMatic**.

WigOMatic is one of the *first* character-editing tools players should reach for: pick a Sim, see their current head skin, type a wig you want — *"1950s Hollywood, platinum blonde, finger waves"*, *"post-apocalyptic mohawk, three colors"*, *"judicial powdered curls"*, *"flame-orange dreadlocks with little brass bells in them"* — image-gen produces the wig texture, the renderer palette-quantizes it back to a Sims-1 head SPR2 atlas, and the result is a new head/skin IFF the player drops into their `Downloads/` directory. The next time the Sim's head loads in the EA-published Sims 1, the wig is on.

It is funny on purpose. The Sims has always carried its camp on its sleeve — Rug-O-Matic, the Bloaty-Head-Machine from Theme Hospital that Don has cited as spiritual ancestor for character caricature tools, the deliberately silly *Hot Date* / *Vacation* / *Superstar* expansions. WigOMatic continues that tone. Underneath the joke, it is a serious content tool: same SPR2-writer + image-gen + palette-quantization pipeline as the rug, just pointed at a different texture atlas.

The same pattern fans out into a whole **Character Customization Studio**, each shop a small Adventure-Compiler target:


| Shop                         | What it makes                                                   | Underlying mechanism                                                                     |
| ---------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **WigOMatic**                | Hair / wigs / hats / headwear                                   | SPR2 writer for head-skin atlases, image-gen for wig pattern, palette quantization       |
| **HeadShop**                 | Faces / heads                                                   | Head mesh + SPR2 face texture, image-gen for facial features, age/expression presets     |
| **CostumeRack**              | Body skins / outfits / uniforms / cosplay                       | Body mesh + SPR2 body texture, occasion-specific generation (formal, work, weekend, era) |
| **MakeupBar**                | Makeup / tattoos / scars / age effects                          | Composite layer on existing head/body SPR2                                               |
| **AccessoryCounter**         | Glasses, jewelry, prosthetics, pets-as-accessories              | Decal layer + custom-object IFFs                                                         |
| **BodyMod / FelidaeAtelier** | Ear/tail/fur mods for furry-style customization (camp included) | Same atlas pipeline, extended slot table                                                 |


The shops live inside Micropolis Home as MOOLLM-aware craft rooms (a `pub/wigomatic/` room with affordances, a `WIGOMATIC.yml` shop card, ambient skills attached). They draw on the same `packages/sims-io` SPR2 writer and the same `packages/mooshow` WebGPU re-renderer as the rug, the album, and the camera — but each shop owns its UI vocabulary and its prompt patterns.

#### The Imagine Loop's "style transfer" use case lands here

This is the same machinery the [Imagine Loop](the-imagine-loop.md) uses for its **style-transfer** use case at the household level: imagine an alternate fashion era for the whole Goth household — *"the Goths in their 1950s phase"*, *"the Goths in their goth phase"*, *"the Goths in their cyberpunk-fashion phase"* — and the Customization Studio runs across all members. Each character gets a new head and body skin IFF; the album book on the shelf compiles a "before and after" of the makeover; the player drops the bundle into their game and *gasps*.

This is also a perfect content path for content recovery (the [Tornado](the-tornado-and-the-archives.md)): recovered 2003-era custom hair/skin content gets re-rendered through WigOMatic to clean it up, regenerate at higher fidelity where the original was low-res, and republish with original-author attribution preserved in `provenance.yml`.

Maxis's lineage here is explicit: the original **HeadShop** (a Maxis-era face/head customization tool that lived alongside Transmogrifier in The Sims content ecosystem) was the official content tool for character customization. WigOMatic + the Character Customization Studio are the spiritual successors — browser-native, LLM-assisted, palette-correct, ethically attribution-respecting, and *much* sillier. Underneath, they all run on the **Transmoogrifier** — our modernized successor to Maxis's TMOG, the general IFF-object editor inside Micropolis Home that every craft shop in this document composes on top of.

```yaml
# wigomatic-platinum-finger-waves.yml — Adventure Compiler source
object:
  name: "1950s Hollywood Platinum Finger Waves"
  type: head-skin                          # specialization of SPR2 head atlas
  applies_to: female_adult                 # Sims 1 head slot
  source_character: bella-goth             # optional; null = generic
  generation:
    method: imagegen
    prompt: "1950s Hollywood platinum blonde finger waves, sculpted, slight side-part, period accurate, painterly style consistent with Sims 1 head sprites at 96x96"
    palette_constraint: sims-1-head-palette
    seed: 42
  variants:
    - { mood: smiling, dwell: default }
    - { mood: serious, dwell: serious-expression }
  provenance:
    generated_at: 2026-05-23T17:00:00+02:00
    generator: openai-image-gen
    intent_ref: ./user-prompt.txt
```

WigOMatic. Because of course we have to ship that.

### 7. The Screen-Snapshot Camera (back-channel)

A custom in-game **Camera** object that, when a Sim uses it, doesn't just take a Sims screenshot — it writes a metadata file the Simopolis companion app can read on the next sync. The metadata identifies the household, the lot, the day-in-game, the action being performed.

The companion app uses that metadata to:

- Generate an enriched Family Album page (with LLM-written caption in the household's voice).
- Optionally publish the page to the Family Album server.
- Optionally feed it back as a *new screen snapshot* into the Uplifted Computer's catalog — *"The Goths (your friend's family) — recent photos available"*.

This closes the loop. The Sim takes a photo *of* a Sim using the PC. The photo flows out to Simopolis. The photo flows back as a new sprite on a different Sim's PC.

---

## Three embeddings, named

The user's brief specified three:

```
                                 ┌─────────────────────┐
                                 │   Sims 1 (EA game)  │
                                 │   = the runtime     │
                                 └──────────┬──────────┘
                                            │
       ┌────────────────────────────────────┴────────────────────────────────────┐
       │                                                                          │
       ▼                                                                          ▼

[1] Sims save embedded in Sims                            [2] Micropolis city embedded in Sims
─────────────────────────────────                         ─────────────────────────────────────
The "Goth Album" book on Bella's                          The "Micropolis" app installed on the
shelf is a custom IFF that contains                       Uplifted Computer; the Sim "plays"
pages from a recovered Goth save file.                    a real Micropolis city by cycling
The Goths exist as pages of a book                        through screen snapshots authored
inside the player's current household.                    from an actual .cty file.

The CD object the kid leaves on the                       The save-game disk for "Haight" the
floor is a MOOLLM URL pointing at                         player built last week sits on the
another household export. Insert it                       Sim's desk; insert it into the PC
into a PC: that save file plays.                          to display Haight on screen.


       ▲                                                                          ▲
       │                                                                          │
       └───────────────────────────┬──────────────────────────────────────────────┘
                                    │
                                    ▼
[3] Sims save embedded in Micropolis
─────────────────────────────────────────
A Micropolis residential zone in apps/simopolis (companion app) is
bound to a parsed Neighborhood.iff. The zone's land value, education,
satisfaction roll up from the bound household. Zoom into the zone:
walk the lot. The aggregate tile is the cover; the household is
the book inside. See the-tornado-and-the-archives.md.
```

Each embedding has the same shape: **a small artifact in the outer world that points to the inner world via a URL or path, plus a rendering of that inner world in the outer world's native medium**.


| Embedding          | Outer world                       | Inner world              | The pointer                                                                                         | The rendering                                                             |
| ------------------ | --------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Sims-in-Sims       | EA Sims 1 household               | Another Sims save file   | CD / Save-Game Disk / Album book (IFF)                                                              | Screen snapshots (SPR2 in the Computer) or pages (SPR2 in the Book)       |
| Micropolis-in-Sims | EA Sims 1 household               | A Micropolis `.cty`      | CD / Save-Game Disk / App on Uplifted Computer / Rug-O-Matic Rug / future window/painting/boardgame | Screen snapshots of the city map, day/night/disaster views, baked to SPR2 |
| Sims-in-Micropolis | Micropolis Home / Micropolis City | A Sims neighborhood file | `zone-<row>-<col>.yml` binding (already designed)                                                   | Zoom-in transition to the lot view in Micropolis Home                     |


The first two are *content* the player loads into their EA game. The third is internal to the companion app.

---

## The MOOLLM URL scheme

We need a small, stable URL scheme that all three embeddings can use. It lives in `packages/sims-io/src/l4/moollm-url.ts` and on the MOOLLM side under a parallel skill. Sketch:

```
moollm://apps/<skill-id>/                       # an installable MOOLLM app
moollm://apps/micropolis/
moollm://apps/family-album-reader/

moollm://content/cities/<city-id>(.cty)          # a Micropolis city
moollm://content/cities/haight.cty

moollm://content/neighborhoods/<id>/             # a Sims neighborhood bundle
moollm://content/neighborhoods/goth-fragment-2003/

moollm://content/albums/<id>/                    # a Family Album bundle
moollm://content/albums/goth-2003-08-14/

moollm://characters/<id>/                        # a MOOLLM character
moollm://characters/bella-goth/

moollm://provenance/<id>/                        # a provenance.yml addressable by id
```

Resolution is local-first:

- If the URL points to something under `content/` in this monorepo, resolve directly.
- If the URL points to something published to the federated mirror, resolve via the mirror's REST surface ([roadmap Phase 5](simopolis-uplift-roadmap.md#phase-5--federated-mirror--recurring-sweep-months-ongoing)).
- If the URL points to recovered archive content, resolve via `content/simopolis/archives/<source>/<id>/`.
- If the URL is unresolved, the consumer (Adventure Compiler, companion app) marks it as such and never silently fabricates content.

Every URL maps to a directory in the monorepo (or in a federated mirror) that contains, at minimum:

- A `MANIFEST.yml` listing the URL's content (name, version, "publisher" in-fiction, sprite list).
- A `provenance.yml` (if recovered or shared).
- The actual content: `.cty`, `.iff`, image files, character YAML, whatever.

The URL scheme is **how the IFF object inside the EA game references content that lives in Simopolis**. The game has no idea what `moollm://` means — it just reads it as a string from STR# 200 and shows it to the player. But the Adventure Compiler, when it emits the IFF, has already used the URL to bake the right SPR2 sprites and BHAVs into the object. The URL is metadata for *us*; it is flavor text for the *Sim*.

---

## Screen snapshots: how the rendering actually happens

The Sims renders the Computer's screen as a sprite — a small region of the object's SPR2 atlas that swaps out when the Sim is using the computer. This is documented Maxis behavior, the same mechanism used by the TV ("watching Action TV" cycles through TV sprites), the painting easel, the slideshow projector, and Don's Lilliputian Micropolis.

So our pipeline is:

```
Source content                  →  Generate screen snapshot  →  Bake into IFF
──────────────────────────────────────────────────────────────────────────────
moollm://apps/micropolis/       →  Render Micropolis city    →  SPR2 sprite,
moollm://content/cities/        →    in tile-renderer or         palette-quantized,
  haight.cty                          mooshow at the              embedded in
                                      computer-screen              uplifted-computer.iff
                                      resolution
                                  →  Optional: variations
                                      (zoom, fire event,
                                       budget overlay)

moollm://content/                →  Open the neighborhood     →  SPR2 sprite per
  neighborhoods/                      in vitamoo/mooshow,         household member
  goth-fragment-2003/                 generate WebGPU             or per scene,
                                      framebuffer renders,        baked into the
                                      sample 3–8 key views        Computer's atlas

moollm://content/albums/         →  Use the recovered           →  SPR2 sprite per
  goth-2003-08-14/                    album's own JPG               album page, or
                                      screenshots                    composite into
                                                                     the Photo Album
                                                                     book object
```

The renderer at the "screen snapshot" stage is the same WebGPU stack that already lives in `packages/vitamoo` and `packages/mooshow`. We are not building a new renderer. We are pointing the existing one at a virtual camera positioned over a Sims-PC-shaped framebuffer (typically 256×192 or similar) and capturing snapshots.

For Micropolis content specifically, the [tile-renderer](../../packages/tile-renderer) package already renders 120×100 tile grids; producing a Computer-screen-sized snapshot is a one-line viewport configuration.

For Sims content, the same WebGPU stage that powers `apps/vitamoospace` produces character renders; we just sample a few canonical poses or animations and palette-quantize them down to SPR2.

LLM image-gen integration (the [BRIDGE.md skin regenesis](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md) path) lets us go further: take a recovered low-resolution album screenshot, upscale it, re-render it stylistically consistent with the Sims 1 palette, write it back as an SPR2 sprite that looks *like* it belongs in the game. But none of that is required for Phase 0 of this feature; raw screenshots already work.

---

## Why the Uplifted Computer is a great Phase 1 deliverable

Looking at [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md), the Uplifted Computer fits cleanly:

- **Phase 0 prerequisites** (already scoped): `sims-io` L4, SPR2 export, save-file download, `apps/simopolis` shell.
- **Phase 1A** (LLM enrichment via MOOLLM): produces the descriptive STR# strings, in-fiction "publisher" text, and 20-language translations.
- **Phase 1B** (Family Album server): receives the foreign-album content that becomes Photo Album book objects.
- **New Phase 1C** — **Uplifted Computer + CD/Disk/Album content tools**: the Adventure Compiler target for the five IFF object types above. Producible from YAML, droppable into the player's game, immediately visible value.

The Uplifted Computer is the **first piece of player-facing content** in the project. Everything before it is plumbing the player doesn't directly see. The Uplifted Computer is the moment they install something and *grin*.

It is also the most direct demonstration of the lineage from Maxis's Transmogrifier to today's tools: a custom IFF object loaded into the player's Sims 1 install, exactly like Maxis-blessed custom content has worked since 2000.

### Implementation outline (concrete)


| Step                                                                                         | Where                                                                                                                                                     | Effort                                                               | Depends on                                   |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| 1. Define `moollm://` URL scheme in TypeScript                                               | `packages/sims-io/src/l4/moollm-url.ts`                                                                                                                   | 1 day                                                                | —                                            |
| 2. URL resolver: local + monorepo + future federated                                         | `packages/sims-io/src/l4/url-resolver.ts`                                                                                                                 | 2 days                                                               | (1)                                          |
| 3. Screen-snapshot renderer: `tile-renderer` to PNG at fixed dimensions                      | `packages/tile-renderer/src/snapshot.ts`                                                                                                                  | 2 days                                                               | —                                            |
| 4. Screen-snapshot renderer: VitaMoo/mooshow → PNG for character views                       | `packages/mooshow/src/snapshot.ts`                                                                                                                        | 3 days                                                               | —                                            |
| 5. SPR2 *writer* (palette quantize + IFF SPR2 chunk authoring)                               | `packages/sims-io/src/spr2/writer.ts`                                                                                                                     | 3–4 days                                                             | Phase 0 SPR2 reader                          |
| 6. Adventure Compiler core: YAML → IFF object                                                | `tools/adventure-compiler/`                                                                                                                               | 1 week                                                               | (1)–(5)                                      |
| 7. Compiler target: Uplifted Computer                                                        | `tools/adventure-compiler/targets/computer.ts`                                                                                                            | 3 days                                                               | (6)                                          |
| 8. Compiler target: CD-ROM                                                                   | `tools/adventure-compiler/targets/cd.ts`                                                                                                                  | 2 days                                                               | (7)                                          |
| 9. Compiler target: Save-Game Disk                                                           | `tools/adventure-compiler/targets/savegame-disk.ts`                                                                                                       | 1 day                                                                | (8)                                          |
| 10. Compiler target: Foreign Photo Album (pageable book)                                     | `tools/adventure-compiler/targets/album.ts`                                                                                                               | 4 days (slideshow paging)                                            | (6)                                          |
| 11. Compiler target: **Micropolis Rug-O-Matic Rug**                                          | `tools/adventure-compiler/targets/rug.ts`                                                                                                                 | 3 days (rug tilemap + cycling sprites)                               | (6), `tile-renderer` snapshot                |
| 12. Compiler target: **WigOMatic + Character Customization Studio** (head/body skin atlases) | `tools/adventure-compiler/targets/customization.ts` + sub-shops `wigomatic.ts`, `headshop.ts`, `costume-rack.ts`, `makeup-bar.ts`, `accessory-counter.ts` | 1 week (head + 1 sub-shop first vertical: 3 days)                    | (5) SPR2 writer, `mooshow` head/body atlases |
| 13. Compiler target: Screen-Snapshot Camera                                                  | `tools/adventure-compiler/targets/camera.ts`                                                                                                              | 3 days                                                               | (6), back-channel                            |
| 12. Auto-internationalizer pass on all STR# output                                           | `tools/adventure-compiler/i18n.ts`                                                                                                                        | 2 days                                                               | LLM access                                   |
| 14. Micropolis Home UI for authoring + previewing all object types                           | `apps/micropolis-home/src/routes/compose/` (currently `apps/simopolis/`)                                                                                  | 1 week + 3 days per sub-shop UI (WigOMatic UI is the first vertical) | All of the above                             |


Roughly **3–4 weeks of work** after Phase 0 ships, producing the first player-visible content artifact. That's a Phase 1C as defined above.

The cleanest first vertical: **just the Uplifted Computer with the Micropolis app installed** (steps 1, 2, 3, 5, 6, 7). About **2 weeks**, and the headline screenshot writes itself: *"a Sim playing Micropolis on a PC, inside the EA-published Sims 1, with no game engine modifications."*

---

## What this gives the player

A practical, ranked list:

1. **The PC in their game becomes interesting again.** Twenty-five years of "play game" being the same animation, and now it can be Micropolis, or another household's life, or the player's own city, or a recovered 2003 album.
2. **Their Sims can share content with each other in-fiction.** A Sim hands a CD to a friend. The friend installs it. The action is meaningful in the household's narrative.
3. **Save files are no longer dead-ends.** A save file becomes a thing the *world* can refer to. Other save files can hold a copy of it as a book or a disk.
4. **The Family Album becomes multi-source.** Photos of the player's own Sim using the PC mix with pages recovered from other people's albums. The household's library is genuinely a library, not a one-author scrapbook.
5. **The Micropolis-Sims bridge becomes visible in the EA game itself.** The two-resolution world isn't only in the companion app. It is *inside The Sims*. Will Wright's 1996 demo, finally lived in.

---

## What it does *not* do

For the EA lawyers and for anyone evaluating risk:

- **It does not modify the EA game.** Every custom object is a standard IFF the game already knows how to load. The mechanism is Maxis's, untouched.
- **It does not include any EA assets.** No EA sprites, sounds, animations, BHAVs are copied. The Uplifted Computer subclasses (via OBJf inheritance — a documented Maxis mechanism) the default Computer's behaviors; it does not embed them.
- **It does not redistribute save files.** The player's save files are their own. Recovered content carries provenance and a takedown channel.
- **It does not pretend to be Maxis or EA.** The Uplifted Computer's in-fiction "publisher" field is the actual provenance (e.g. "(your city)", "(family album, archive.org)", "(GPL release, Micropolis GmbH)") — never EA, never Maxis.
- **It does not replace anything EA sells.** The Sims is still the game. The Uplifted PC is a custom *Sims* object. The Sims 1 (Legacy Collection on Steam) must be installed for any of this to work.

It does not turn the Sims into a different game. It uses the Sims's existing object system, exactly as Maxis designed it to be used. The same way Rug-O-Matic did. The same way the tombstone server did. The same way the Lilliputian Micropolis inside The Sims did, twenty-five years ago.

---

## References


| Resource                                                   | Where                                                                                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Simopolis overall vision                                   | [simopolis.md](simopolis.md)                                                                                                                                            |
| MOOLLM microworld substrate                                | [moollm-microworld-os.md](moollm-microworld-os.md)                                                                                                                      |
| Tornado archive recovery                                   | [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md)                                                                                                      |
| Phased roadmap                                             | [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)                                                                                                              |
| Adventure Compiler architecture                            | [external BRIDGE.md → Adventure Compiler](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md#adventure-compiler-moollm--multi-target-export) |
| Slideshow object pattern (precedent for pageable books)    | [external BRIDGE.md → Slideshow objects](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/THE-UPLIFT.md)                                             |
| SimAntics VM Design Document (Don Hopkins, Maxis)          | [https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf)                                        |
| Will Wright, "Interfacing to Microworlds" (Stanford, 1996) | [video](https://www.youtube.com/watch?v=nsxoZXaYJSk) · [Don's notes](https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d)            |
| Transmogrifier (Maxis)                                     | [VM Design Document](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf)                                                                                     |
| IFF Semantic Image Pyramid                                 | [external IFF-LAYERS.md](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/IFF-LAYERS.md)                                                             |
| Sims I/O TypeScript (L0–L3 today, L4 next)                 | [packages/sims-io/](../../packages/sims-io)                                                                                                                             |


