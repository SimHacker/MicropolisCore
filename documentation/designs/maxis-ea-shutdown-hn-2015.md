# Maxis / EA shutdown — Don Hopkins (HN March 2015)

**Primary thread:** [EA Shuts Down ‘SimCity’ and ‘The Sims’ Developer Maxis](https://news.ycombinator.com/item?id=9148746) (March 2015) — Kotaku/Polygon coverage of Maxis Emeryville closure.

**Don Hopkins comment:** [HN 9149874](https://news.ycombinator.com/item?id=9149874) (parent) — rebuts oversimplified “EA buys studio, shovels junk, closes” narrative; documents Will Wright era, Lucy Bradshaw, **Ocean Quigley**, Origin vs Maxis on SC2013, Don’s own timeline, Stupid Fun Club, HiveMind litigation. **More HN threads:** §4 catalog (`site:news.ycombinator.com "stupid fun club"`).

**Companion:** [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) (Andrew Willmott email — Origin online debacle from inside engineering).

---



## 1. Timeline correction (context)

**davidgay** on thread: EA bought Maxis **1997**; *The Sims* shipped **2000** — not compatible with “EA killed Maxis immediately” theories.

**mjn** (second-hand, affirmed by Don): Will Wright’s clout protected Maxis autonomy until ~mid-2000s; *The Sims* success bought hands-off years; Walnut Creek merged to Redwood City; Emeryville remnant under Wright through **Spore (2008)**; Wright left **2009** → industry expected full absorption.


| Date     | Event                                                          |
| -------- | -------------------------------------------------------------- |
| Jan 1997 | Don hired at Maxis — pre–*The Sims* name                       |
| Jul 1997 | **EA acquires Maxis**                                          |
| Feb 2000 | **The Sims 1** ships — best-selling PC game of its era         |
| 2008     | Spore — ambitious, not financial hit; procedural-gen influence |
| 2009     | Will Wright leaves EA                                          |
| 2013     | SimCity (Glassbox) — server/Origin problems                    |
| Mar 2015 | Maxis Emeryville effectively shut down (news cycle)            |


---



## 2. Don’s counter-narrative on “EA destroys studios”

Don rejects caricature: *“Buy studio, make them shovel incomplete games, close studio, repeat.”*


| Fact              | Don’s claim                                                           |
| ----------------- | --------------------------------------------------------------------- |
| EA + Maxis        | Enabled finishing and shipping **The Sims**                           |
| The Sims division | One of **three main EA studios**; huge revenue for years              |
| Post-Will team    | Original Maxis / early Sims people “did a wonderful job” without Will |
| SC2013 disaster   | **Origin’s fault** — Maxis fought and lost; took public blame         |


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


| Period       | Work                                                                                                                                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~1991        | Met Will; **DUX Software** contract — SimCity → Unix                                                                                                                                                                                                                    |
| ~1991–92     | **HyperLook edition** — **Turing Institute, Glasgow**; SimCity running *on* HyperLook; **dogfooding HyperLook + NeWS** to ship a real game                                                                                                                              |
| ~early 1990s | **DUX online publishing** — downloadable unlockable demo (play free; unlock with credit card over phone if you like it) — early venture in online software distribution                                                                                                 |
| ~1992+       | **X11 / Tcl/Tk** multiplayer SimCity (SimCityNet) — portable branch after NeWS was canceled; published by DUX; demonstrated at **InterCHI** (~1993); ported across Unix platforms: **Sun**, **SGI**, **NCD X terminal**, **DEC**, **HP**, **Linux**, and later **OLPC** |
| 1996         | Winograd seminar — Dollhouse demo; capstone on a decade of demonstrated SimCity/UI credibility                                                                                                                                                                          |


**Why this matters here:** Andrew Willmott never met Don at Maxis ([simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) §2), but the **HyperLook**, **X11/Tcl/Tk**, and **multiplayer** milestones are the pre-Maxis proof that Don could deliver simulation + UI + multiplayer networking at Will's bar — the trust that made the Sims hire possible.

**Full stack evolution after DUX** (Linux → OLPC/GPL → Micropolis C++ → Python/SWIG → PyGTK → TurboGears/AMF/Flash/OpenLaszlo → WASM → SvelteKit/WebGPU → MicropolisCore monorepo with Micropolis City + Micropolis Home): **[platform-lineage-index.md](platform-lineage-index.md)** — not repeated here.

### Maxis, SFC, TomTom, and after (1997 → 2015)

After **The Sims 1** shipped (**February 2000**), Don left **EA** around **March 2000** and started working with Will at **Stupid Fun Club** — Will's independent think tank, not yet a full-time post-EA company. Early SFC work: **talking toys**, **robot brains**, **robot one-minute movies**, **speech recognition and synthesis**, **feedback**, and **looping**. Don later moved to **Amsterdam** for a day job at **TomTom** (automotive UI — see [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md)). When Will left EA (**2009**) and **EA invested in SFC**, Don left his TomTom day job to work **remotely** with Will and the SFC team — **Urban Safari**, **MediaGraph**, **Bar Karma**, and other stupid-fun experiments. Lineage: [family-album-as-storymaker.md](family-album-as-storymaker.md).

| Period | Work |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 1997–Feb 2000 | **The Sims 1** at Maxis — animation/UI |
| ~Mar 2000 | Left **EA**; joined **Stupid Fun Club** (think tank) — talking toys, robot brains, robot one-minute movies, speech I/O, feedback loops |
| ~2003 | **Phoneloper** — expressive speech / chatterbot prototype; Flite + XML Phonelopes + phonoscoping ([phoneloper-sfc-speech-toy.md](phoneloper-sfc-speech-toy.md)) |
| Contract | **Sims Transmogrifier** (user content tools) |
| ~2000s | **Amsterdam** — day job at **TomTom**; continued SFC collaboration on the side |
| SFC (parallel) | TV pilots **Empathy**, **Servitude** (unaired) while Will was still at EA |
| 2009 | Will leaves EA; **EA invests in SFC** |
| ~2009+ | Don leaves TomTom day job → **remote** with Will and the SFC team |
| SFC | **Urban Safari**, **MediaGraph**, and other experiments |
| SFC TV | **Bar Karma** (Current TV, viewer-scripted) — [family-album-as-storymaker.md](family-album-as-storymaker.md) lineage |
| HiveMind | Spin-off social-game company → **litigation**, frozen |


**Bar Karma:** [https://en.wikipedia.org/wiki/Bar_Karma](https://en.wikipedia.org/wiki/Bar_Karma) — federated story / viewer participation precursor to Micropolis Family Album graph.

### Phoneloper (~2003)

Speech-synthesis **chatterbot prototype** for SFC: **Python + Tkinter + CMU Flite** (C++ modifications) with XML **Phonelope** import/export — timed **diphones**, **pitch** and **amplitude** envelopes, edited visually and in real time. **Phonoscoping** loads audio, draws a spectrogram + pitch tracker, and lets you rotoscope synthetic **expressive speech and singing** over captured clips. Demo: [YouTube — Phoneloper Demo](https://www.youtube.com/watch?v=qy5cqV8ypIs). Full write-up: **[phoneloper-sfc-speech-toy.md](phoneloper-sfc-speech-toy.md)** (future sketch: TypeScript + Web Audio port; same playful space as [Pink Trombone](https://dood.al/pink-trombone/)).

### Hacker News primary sources (Don Hopkins / SFC)

Don has documented much of this timeline in **first-person Hacker News comments** — searchable via Google [`site:news.ycombinator.com "stupid fun club"`](https://www.google.com/search?q=site%3Anews.ycombinator.com+%22stupid+fun+club%22) or [HN Algolia](https://hn.algolia.com/) (`author:DonHopkins` + `Stupid Fun Club`). Verified threads below; the **canonical long-form career narrative** is [HN 9149874](https://news.ycombinator.com/item?id=9149874) on the Maxis shutdown thread.

| Topic | Thread | Don comment | What it adds |
| --- | --- | --- | --- |
| **Maxis shutdown — full career arc** | [9148746](https://news.ycombinator.com/item?id=9148746) | [9149874](https://news.ycombinator.com/item?id=9149874) | EA timeline, Ocean holodeck, Origin/SC2013, Lucy Bradshaw, SFC side project → HiveMind litigation, Bar Karma |
| **HiveMind / Ansari litigation** | [18011332](https://news.ycombinator.com/item?id=18011332) *Ask HN: startup fail* | [18015780](https://news.ycombinator.com/item?id=18015780), [18044422](https://news.ycombinator.com/item?id=18044422) | Ansari vs Wright/SFC IP; “serial hacktreprenuer”; Friendly follow-on company |
| **Robot one-minute movies (2003)** | [9107065](https://news.ycombinator.com/item?id=9107065) *Stop Robot Abuse* | [9107206](https://news.ycombinator.com/item?id=9107206) | Hidden-camera robot films at SFC; Oakland streets/restaurants |
| **Empathy + Servitude films** | [17482910](https://news.ycombinator.com/item?id=17482910) | [17483925](https://news.ycombinator.com/item?id=17483925) | Robot brain/personality sim by Don; YouTube links; NBC one-minute format |
| **Why NBC never aired them** | [12514296](https://news.ycombinator.com/item?id=12514296) | [12520558](https://news.ycombinator.com/item?id=12520558) | NBC/SAG contract problems; hidden-camera + wizard-of-oz tele-robotics (also [9993071](https://news.ycombinator.com/item?id=9993071) on HitchBOT) |
| **Phoneloper / speech synthesis (2003)** | [31416098](https://news.ycombinator.com/item?id=31416098) *NaturalSpeech* | [31418659](https://news.ycombinator.com/item?id=31418659) | Flite + XML Phonelopes; phonoscoping; [YouTube demo](https://www.youtube.com/watch?v=qy5cqV8ypIs) — [phoneloper-sfc-speech-toy.md](phoneloper-sfc-speech-toy.md) |
| **MediaGraph + iLoci / Nototo** | [22088509](https://news.ycombinator.com/item?id=22088509) *Nototo* | [22089694](https://news.ycombinator.com/item?id=22089694) | Unity MediaGraph (2012) + iPhone iLoci (2008) for Will's SFC; pie menus, map roads, CA |
| **MediaGraph music navigation** | [47385272](https://news.ycombinator.com/item?id=47385272) *Spotify AI DJ* | [47386278](https://news.ycombinator.com/item?id=47386278) | MediaGraph music spatial organization; pie-menu navigation prototype for SFC |
| **MediaGraph / Fitts / pie maps** | [11208463](https://news.ycombinator.com/item?id=11208463) *Fitt's Law* | [11219792](https://news.ycombinator.com/item?id=11219792) | MediaGraph demo; hierarchical vs geographic pie menus |
| **Method of loci + MediaGraph** | [31596787](https://news.ycombinator.com/item?id=31596787) *How To Remember Anything* | [31598929](https://news.ycombinator.com/item?id=31598929) | iLoci + MediaGraph; memory-palace editing (“kissing” islands) |
| **Scott Adams + iLoci lineage** | [29330015](https://news.ycombinator.com/item?id=29330015) | [29330901](https://news.ycombinator.com/item?id=29330901) | Adventure games ↔ memory palaces; iLoci + MediaGraph for SFC |
| **Winograd 1996 talk → Sims** | [44906662](https://news.ycombinator.com/item?id=44906662) *Citybound* | [44911071](https://news.ycombinator.com/item?id=44911071) | Don at Winograd seminar; Dollhouse; Simulator Effect; post-Sims retrospective |
| **Demo catalog (HyperLook, pies, PSIBER)** | [22455722](https://news.ycombinator.com/item?id=22455722) *Sun NeWS* | [22456831](https://news.ycombinator.com/item?id=22456831) | YouTube links including HyperLook SimCity; pre-Maxis lineage receipts |
| **TomTom / car UI / MediaGraph** | [7261003](https://news.ycombinator.com/item?id=7261003) *A New Car UI* | (see [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md)) | Amsterdam day-job era; pie menus vs blind multitouch ([7328476](https://news.ycombinator.com/item?id=7328476) thread) |

**Note:** Don's [9149874](https://news.ycombinator.com/item?id=9149874) comment also describes SFC **while Will was still at EA** (Transmogrifier contract, side-project robotics/TV) — which overlaps the **~Mar 2000 → 2009** period in the table above before Will left EA and Don went remote full-time. Peer comment [9148853](https://news.ycombinator.com/item?id=9148853) (not Don) summarizes the same SFC-while-at-EA context on the shutdown thread.

---



## 5. HiveMind / Jawad Ansari (2012 litigation)

Don’s 2015 comment documents SFC spin-off meltdown (primary links preserved). **Don’s first-person HN comments on HiveMind/SFC:** §4 HN catalog — especially [9149874](https://news.ycombinator.com/item?id=9149874), [18015780](https://news.ycombinator.com/item?id=18015780), [18044422](https://news.ycombinator.com/item?id=18044422).


| Resource               | URL                                                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HiveMind (Wikipedia)   | [https://en.wikipedia.org/wiki/HiveMind](https://en.wikipedia.org/wiki/HiveMind)                                                                                                                                                                     |
| VentureBeat exclusive  | [http://venturebeat.com/2012/06/03/game-pioneer-will-wrights-personal-gaming-startup-falls-apart-in-litigation-exclusive/](http://venturebeat.com/2012/06/03/game-pioneer-will-wrights-personal-gaming-startup-falls-apart-in-litigation-exclusive/) |
| Uproxx summary         | [http://uproxx.com/gammasquad/2012/06/will-wrights-social-game-is-in-legal-limbo/](http://uproxx.com/gammasquad/2012/06/will-wrights-social-game-is-in-legal-limbo/)                                                                                 |
| Polygon settlement     | [http://www.polygon.com/2012/11/2/3589520/simcity-creator-will-wright-settles-lawsuit-over-hivemind-studio-control](http://www.polygon.com/2012/11/2/3589520/simcity-creator-will-wright-settles-lawsuit-over-hivemind-studio-control)               |
| Ansari “apology” video | [https://www.youtube.com/watch?v=XA8PXbTb7OQ](https://www.youtube.com/watch?v=XA8PXbTb7OQ)                                                                                                                                                           |


Wright (2012): HiveMind “has no money … frozen” due to litigation; eventual board settlement with Ansari.

**Micropolis note:** Unrelated to engine code; documents **Will post-EA** ecosystem that fed MediaGraph / interactive-TV experiments — context for [family-album-as-storymaker.md](family-album-as-storymaker.md), not runtime dependencies.

---



## 6. SimCity 2013 — Origin vs Maxis (synthesis)

Two independent primary sources agree:


| Source                    | Claim                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| **Willmott email (2013)** | Andrew designed offline sync buffer; EA online team imposed shards + 20 min limit              |
| **Don HN (2015)**         | Origin insisted on online play + lied that offline was impossible; Maxis fought unsuccessfully |


**Not** “Maxis forgot how to SimCity” — **platform mandate + broken online stack**.

MicropolisCore design consequence: **client-authoritative sim**, optional sync, no mandatory always-online shard ([multiplayer-browser-lessons.md](multiplayer-browser-lessons.md)).

---



## 7. MicropolisCore implications


| Theme                             | Where it lands                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Ocean’s low-end 2.5D holodeck     | Sims 1 ran everywhere → browser WASM + WebGPU holodeck for city + Sims overlays                           |
| Free-form roads vs tiles          | SC2013 Glassbox — different from Micropolis **tile** sim; Micropolis keeps classic grid + better UI       |
| Pie menus (Don offered 2013)      | [piecraft/](piecraft/README.md), [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |
| GPL Micropolis / constructionist  | OLPC line — [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md), education docs                        |
| SFC talking toys / Phoneloper | Future **TypeScript + Web Audio** speech toy; Phonelope timeline editor — [phoneloper-sfc-speech-toy.md](phoneloper-sfc-speech-toy.md) |
| Bar Karma / branching stories     | [family-album-as-storymaker.md](family-album-as-storymaker.md)                                            |
| Simulator Effect / cheap metadata | [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md)                        |


---



## 8. See also

- [phoneloper-sfc-speech-toy.md](phoneloper-sfc-speech-toy.md) — SFC expressive speech editor; phonoscoping; browser port sketch
- [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md)
- [platform-lineage-index.md](platform-lineage-index.md)
- [simopolis.md](simopolis.md) — Sims 1 uplift under EA Legacy Collection
- [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md)
- [the-computer-as-portal.md](the-computer-as-portal.md) — Transmogrifier lineage

