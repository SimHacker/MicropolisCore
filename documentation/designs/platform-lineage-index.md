# Platform lineage & where the docs live

Micropolis has shipped through many stacks (workstations, X11, OLPC, Flash, Wasm). This index maps **era → artifact location** so historical write-ups stay findable without pretending every layer is still maintained code.

| Era / stack | What it was | Where to read |
|-------------|-------------|----------------|
| **NeWS**, PostScript UI | Unix workstation client | Essay intro in **`documentation/openlaszlo/README.md`**; pie-menu history links from **`apps/micropolis/website/pages/about/don-hopkins.md`** |
| **X11 / Tcl-Tk** | Micropolis on workstations | Same; **[collaborative-microworld-lineage.md](collaborative-microworld-lineage.md)** (constructionist / multiplayer context) |
| **OLPC / Sugar**, GPL release | Educational fork, XO laptop | Jekyll pages **`apps/micropolis/website/pages/about/don-hopkins/olpc-simcity.md`**, **`building-simcity.md`**; external MOOLLM doc linked from root **`README.md`** (SimCity multiplayer & Micropolis) |
| **TurboGears + OpenLaszlo + Flash** | Web client/server (AMF) | **Frozen snapshot:** **`documentation/openlaszlo/`** (`*.lzx`, **`resources/`**, **`TODO.txt`**, **`NOTES.txt`**) |
| **Wasm + SvelteKit** | Current MicropolisCore app | **`apps/micropolis/`**, **[wasm-bridge-and-testing-trajectory.md](wasm-bridge-and-testing-trajectory.md)** |

## Design notes ↔ reference docs

- **`documentation/designs/`** (this folder) — *intent*: what we are building next and why (bridges, commands, multiplayer metaphors).
- **`documentation/`** (the rest) — *artifact*: manuals, talks, HTML exports, **immutable snapshots** (e.g. OpenLaszlo sources), and **historical** long-form writing.

When an old idea graduates into something we still pursue (city branching, Git worlds, voting across simulations), it typically grows a **`.md` note here** while the archive file stays the historical receipt — see **`TODO.txt`** vs **`github-as-mmorpg-multiverse.md`**.

## Outreach: Electric Carnival and related pages (short context)

**Electric Carnival** (summer 1994, Lollapalooza “Mindfield”, sponsored by Interval Research) was a traveling tent of tech demos—dozens of kiosks, not a game product. One kiosk, **SimCity Without Walls**, put **multiplayer SimCityNet** (Unix/X11 build) in front of concert crowds—typically an **SGI Indigo** and an **NCD X terminal** sharing one city. That matters for **Micropolis / SimCity Unix lineage** only as **public demo and distribution folklore**: it showed cooperative city-building and pie-menu UX off-workstation, alongside unrelated exhibits (e.g. **Bounce** visual MIDI/dataflow in the “Midi Zoo”). It does not change core simulation rules; it is marketing and hacker outreach for the same **multiplayer + UI experiments** documented under **`documentation/historical/`** (SimCity Info index, keynote transcripts, NeWS/HyperLook vs X11 notes).

**HyperLook** (NeWS) and **NeWS** pages in those archives describe the **first Unix UI port path** (PostScript UI, zooming, editable stacks); **X11/Tcl-Tk** is the portable branch that became widely shipped. **`catalog.com/hopkins/simcity/index.html`** on Wayback is an **index of artifacts** (reviews, SimCityNet proposal, FTP)—useful pointers, not separate games.

**The Sims Transmogrifier** home page (Wayback) documents **player-authored objects for The Sims (single-player)**—adjacent to Maxis tooling and SafeTMog debates (`documentation/historical/drupal-blog/`), not to the Micropolis engine itself.
