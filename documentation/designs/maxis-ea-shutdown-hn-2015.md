# Maxis / EA shutdown — Don Hopkins (HN March 2015)

**Primary thread:** [EA Shuts Down ‘SimCity’ and ‘The Sims’ Developer Maxis](https://news.ycombinator.com/item?id=9148746) (March 2015) — Kotaku/Polygon coverage of Maxis Emeryville closure.

**Don Hopkins comment:** [HN 9149874](https://news.ycombinator.com/item?id=9149874) (parent) — rebuts oversimplified “EA buys studio, shovels junk, closes” narrative; documents Will Wright era, Lucy Bradshaw, **Ocean Quigley**, Origin vs Maxis on SC2013, Don’s own timeline, Stupid Fun Club, HiveMind litigation.

**Companion:** [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) (Andrew Willmott email — Origin online debacle from inside engineering).

---

## 1. Timeline correction (context)

**davidgay** on thread: EA bought Maxis **1997**; *The Sims* shipped **2000** — not compatible with “EA killed Maxis immediately” theories.

**mjn** (second-hand, affirmed by Don): Will Wright’s clout protected Maxis autonomy until ~mid-2000s; *The Sims* success bought hands-off years; Walnut Creek merged to Redwood City; Emeryville remnant under Wright through **Spore (2008)**; Wright left **2009** → industry expected full absorption.

| Date | Event |
|------|--------|
| Jan 1997 | Don hired at Maxis — pre–*The Sims* name |
| Jul 1997 | **EA acquires Maxis** |
| Feb 2000 | **The Sims 1** ships — best-selling PC game of its era |
| 2008 | Spore — ambitious, not financial hit; procedural-gen influence |
| 2009 | Will Wright leaves EA |
| 2013 | SimCity (Glassbox) — server/Origin problems |
| Mar 2015 | Maxis Emeryville effectively shut down (news cycle) |

---

## 2. Don’s counter-narrative on “EA destroys studios”

Don rejects caricature: *“Buy studio, make them shovel incomplete games, close studio, repeat.”*

| Fact | Don’s claim |
|------|-------------|
| EA + Maxis | Enabled finishing and shipping **The Sims** |
| The Sims division | One of **three main EA studios**; huge revenue for years |
| Post-Will team | Original Maxis / early Sims people “did a wonderful job” without Will |
| SC2013 disaster | **Origin’s fault** — Maxis fought and lost; took public blame |

---

## 3. Key people (Don’s 2015 account)

### Lucy Bradshaw

- Managed **The Sims** and **SimCity** since EA acquired Maxis
- **EA threw her under the bus** — forced public statements that were “simply and obviously weren’t true” to justify **Origin’s** non-negotiable mistakes

Aligns with [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) (Andrew resigned over Origin-only; Lucy as public face).

### Ocean Quigley

- Lead artist **SimCity** and **The Sims** at Maxis **before** EA acquisition
- Invented hybrid **z-buffered 2.5D / real-time 3D “holodeck”** for **The Sims 1** (2000) — ran on **non-accelerated low-end PCs** → casual / hand-me-down-PC audience
- Don: Ocean’s technical/art contributions as important as Will’s design; stayed much longer
- Led **ground-up SimCity (2013)** — true to original; **free-form roads** away from “terrible tiles”
- Frustrated by **Origin** online mandate + PR claiming offline impossible
- Left after release — [VentureBeat: steps out of Will’s shadow](http://venturebeat.com/2013/07/19/ocean-quigley-steps-out-of-will-wrights-shadow-to-pursue-new-game-ventures/)

**MicropolisCore naming:** Don uses **“holodeck”** for Sims 1’s layered 2.5D presentation — same word as [@micropolis/render-core](render-core-package.md) **HolodeckStage** (WebGPU compositor). Different implementation; shared metaphor: **simulation truth + GPU overlay for agents/UI**.

### Andrew Willmott (not in 2015 comment)

Email harvest: [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) — JS UI, offline buffer, resigned before this news cycle.

---

## 4. Don Hopkins career thread (~1991 → 2015)

### Pre-Maxis — SimCity / DUX (~1991 → 1996)

Don first met **Will Wright** around **1991**, contracting for **DUX Software** to port **SimCity to Unix**. Roughly a **decade of SimCity development** followed — not Maxis employment, but the work that **earned Will's trust** and led to Maxis after Don saw **Dollhouse** at **Terry Winograd's** UI seminar (1996). Don was hired at Maxis **January 1997** (§1 timeline).

| Period | Work |
|--------|------|
| ~1991 | Met Will; **DUX Software** contract — SimCity → Unix |
| ~1991–92 | **HyperLook edition** — **Turing Institute, Glasgow**; SimCity running *on* HyperLook; **dogfooding HyperLook + NeWS** to ship a real game |
| ~early 1990s | **DUX online publishing** — downloadable unlockable demo (play free; unlock with credit card over phone if you like it) — early venture in online software distribution |
| ~1992+ | **X11 / Tcl/Tk** multiplayer SimCity (SimCityNet) — portable branch after NeWS was canceled; published by DUX; demonstrated at **InterCHI** (~1993); ported across Unix platforms: **Sun**, **SGI**, **NCD X terminal**, **DEC**, **HP**, **Linux**, and later **OLPC** |
| 1996 | Winograd seminar — Dollhouse demo; capstone on a decade of demonstrated SimCity/UI credibility |

**Why this matters here:** Andrew Willmott never met Don at Maxis ([simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) §2), but the **HyperLook**, **X11/Tcl/Tk**, and **multiplayer** milestones are the pre-Maxis proof that Don could deliver simulation + UI at Will's bar — the trust that made the Sims hire possible.

**Full stack evolution after DUX** (Linux → OLPC/GPL → Micropolis C++ → Python/SWIG → PyGTK → TurboGears/AMF/Flash/OpenLaszlo → WASM → SvelteKit/WebGPU → MicropolisCore monorepo with Micropolis City + Micropolis Home): **[platform-lineage-index.md](platform-lineage-index.md)** — not repeated here.

### Maxis, SFC, and after (1997 → 2015)

| Period | Work |
|--------|------|
| 1997–2000 | The Sims 1 — animation/UI; left soon after ship |
| Contract | **Sims Transmogrifier** (user content tools) |
| SFC (side) | Will’s **Stupid Fun Club** while still at EA — robotics, TV pilots **Empathy**, **Servitude** (unaired) |
| 2009+ | Will leaves EA; **EA invests in SFC**; Don joins full time |
| SFC | **Bar Karma** (Current TV, viewer-scripted) — [family-album-as-storymaker.md](family-album-as-storymaker.md) lineage |
| HiveMind | Spin-off social-game company → **litigation**, frozen |

**Bar Karma:** https://en.wikipedia.org/wiki/Bar_Karma — federated story / viewer participation precursor to Micropolis Family Album graph.

---

## 5. HiveMind / Jawad Ansari (2012 litigation)

Don’s 2015 comment documents SFC spin-off meltdown (primary links preserved):

| Resource | URL |
|----------|-----|
| HiveMind (Wikipedia) | https://en.wikipedia.org/wiki/HiveMind |
| VentureBeat exclusive | http://venturebeat.com/2012/06/03/game-pioneer-will-wrights-personal-gaming-startup-falls-apart-in-litigation-exclusive/ |
| Uproxx summary | http://uproxx.com/gammasquad/2012/06/will-wrights-social-game-is-in-legal-limbo/ |
| Polygon settlement | http://www.polygon.com/2012/11/2/3589520/simcity-creator-will-wright-settles-lawsuit-over-hivemind-studio-control |
| Ansari “apology” video | https://www.youtube.com/watch?v=XA8PXbTb7OQ |

Wright (2012): HiveMind “has no money … frozen” due to litigation; eventual board settlement with Ansari.

**Micropolis note:** Unrelated to engine code; documents **Will post-EA** ecosystem that fed MediaGraph / interactive-TV experiments — context for [family-album-as-storymaker.md](family-album-as-storymaker.md), not runtime dependencies.

---

## 6. SimCity 2013 — Origin vs Maxis (synthesis)

Two independent primary sources agree:

| Source | Claim |
|--------|--------|
| **Willmott email (2013)** | Andrew designed offline sync buffer; EA online team imposed shards + 20 min limit |
| **Don HN (2015)** | Origin insisted on online play + lied that offline was impossible; Maxis fought unsuccessfully |

**Not** “Maxis forgot how to SimCity” — **platform mandate + broken online stack**.

MicropolisCore design consequence: **client-authoritative sim**, optional sync, no mandatory always-online shard ([multiplayer-browser-lessons.md](multiplayer-browser-lessons.md)).

---

## 7. MicropolisCore implications

| Theme | Where it lands |
|-------|----------------|
| Ocean’s low-end 2.5D holodeck | Sims 1 ran everywhere → browser WASM + WebGPU holodeck for city + Sims overlays |
| Free-form roads vs tiles | SC2013 Glassbox — different from Micropolis **tile** sim; Micropolis keeps classic grid + better UI |
| Pie menus (Don offered 2013) | [piecraft/](piecraft/README.md), [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |
| GPL Micropolis / constructionist | OLPC line — [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md), education docs |
| Bar Karma / branching stories | [family-album-as-storymaker.md](family-album-as-storymaker.md) |
| Simulator Effect / cheap metadata | [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) |

---

## 8. See also

- [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md)
- [platform-lineage-index.md](platform-lineage-index.md)
- [simopolis.md](simopolis.md) — Sims 1 uplift under EA Legacy Collection
- [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md)
- [the-computer-as-portal.md](the-computer-as-portal.md) — Transmogrifier lineage
