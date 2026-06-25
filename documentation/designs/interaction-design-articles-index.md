# Interaction design: articles on pies, accessibility, and computer-use agents

## Why this folder exists

Forty years of human–computer interaction work — pie menus, marking menus, accessibility trees, screen scrapers, predictive text — has converged in 2026 on the same engineering problem: *how does a piece of software let a user (or another piece of software) operate a system without making the system stop working?* This corpus pulls the strongest ideas from Don Hopkins's HN comments, Medium essays, CHI papers in Ben Shneiderman's lineage, Bill Buxton's marking-menu archive, David MacKay's Dasher work, Morgan Dixon and James Fogarty's Prefab papers, and the 2024–26 Cua launch — and grounds them in the [Simopolis](simopolis.md) build plan that has to ship against the EA-published Sims 1 Legacy Collection.

Each article is *standalone*. None of them ask you to read another file first. They cite primary sources (HN item IDs, papers with PDFs, archive.org scans) and they cross-link the parts of Simopolis that need the ideas.

---

## Articles

| # | Document | Thesis | Lead with this if… |
|---|---|---|---|
| 1 | [`pie-menus-fitts-law.md`](pie-menus-fitts-law.md) | Eight-item pies are ~15% faster than linear menus with lower error rates; Steve Jobs heckled the result in 1988 and most toolkit vendors followed | …you want the empirical case for radial UI, with numbers |
| 2 | [`gesture-space-and-pie-menus.md`](gesture-space-and-pie-menus.md) | Pies *saturate* gesture space; stroke recognisers leave most of it as syntax errors | …you want the feel of pies — preview, reselection, mouse-ahead by rehearsal |
| 3 | [`submenu-aiming-and-fitts-law.md`](submenu-aiming-and-fitts-law.md) | Tognazzini's 1986 `<`-shaped buffer was specified in the 1987 Apple HIG; Amazon rediscovered it in 2013 | …you're shipping linear submenus and inherit none of the toolkit ergonomics |
| 4 | [`classical-hci-vs-aesthetic-ui.md`](classical-hci-vs-aesthetic-ui.md) | "Calm technology" was never an excuse to hide state; aesthetic-minimalist UI decouples animation from input | …you're auditing motion / gesture bugs that don't fit a Fitts frame |
| 5 | [`pie-menu-patent-fud.md`](pie-menu-patent-fud.md) | The Alias marking-menu patent was narrow; the marketing campaign was broad; the chilling effect cost twenty years | …you need Gordon Kurtenbach's email and the full Buxton/Kinetix story |
| 6 | [`dasher-steering-law-accessibility.md`](dasher-steering-law-accessibility.md) | Dasher converts a continuous steering signal into text via a language-model-shaped probability tunnel; Ada Majorek programs in it with a head-mouse | …you're building non-keyboard input or thinking about LLM-aware editors |
| 7 | [`aquery-programmable-accessibility.md`](aquery-programmable-accessibility.md) | jQuery-shaped selectors and plugins over the accessibility tree, with Prefab-pixel fallback. Don proposed it in 2015; nobody shipped it | …you're trying to script other apps and want to know what almost existed |
| 8 | [`prefab-pixel-reverse-engineering.md`](prefab-pixel-reverse-engineering.md) | Dixon & Fogarty's CHI Best Paper: read widget trees from pixels at interactive rates, modify *unmodified* apps. Word, Photoshop, Skype, Chrome — on tape | …you want the academic statement of the computer-use-agent problem |
| 9 | [`cua-computer-use-agents-and-simplifier.md`](cua-computer-use-agents-and-simplifier.md) | From a 2003 TSO Simoleon-printing bot to Cua's 2025 sandbox + driver + agents stack — the same observe-recognise-act loop, getting smarter | …you're comparing Cua, Anthropic Computer Use, OpenAI Operator, MCP, and where Simplifier reborn fits |
| 10 | [`four-dimensional-navigation-hci.md`](four-dimensional-navigation-hci.md) | (x, y, z, t) — time as an explicit constraint, not a side-effect; ATC 4D-TBO as the vocabulary for stream-sync, replay, and animation-vs-input bugs | …you're stamping events with a clock and need a shared frame |
| 11 | [`virtual-pointer-and-pie-cursors.md`](virtual-pointer-and-pie-cursors.md) | Pointer lock + virtual mouse for pies; tile-frame cursor + good autoscroll; palette legend; label-to-pointer; graphics stack layers | …you're wiring Micropolis/Simopolis pies, cursors, or MP presence |
| 12 | [`simcity-tool-palette-design.md`](simcity-tool-palette-design.md) | Totem-pole palette mirrors pie submenus; icon size = cost; border = cursor legend; bouquet vs grid; PieCraft sketch (HN 2014) | …you're authoring tool/pie layout or `ToolCatalog` data |
| 13 | [`piecraft/README.md`](piecraft/README.md) | **PieCraft** game + runtime-editable pies; Target/Pie/Slice/Item; Unity/MHW/jQuery lineage; Micropolis holodeck binding | …you're implementing pies, `ToolCatalog`, or constructionist UI literacy |
| 14 | [`automotive-touch-ui-vs-pie-menus.md`](automotive-touch-ui-vs-pie-menus.md) | Car multitouch finger-count UI vs **self-revealing pies**; ConnectedTV; iLoci; 7→8 wedges; TomTom; dual-mode driving | …you're arguing against blind gestures or designing eyes-free + config modes |
| 15 | [`macos-pie-menu-app-hn-2024.md`](macos-pie-menu-app-hn-2024.md) | Hauken **pie-menu.com** (Aug 2024); Don’s demo links, CHI’88, rehearsal, patent FUD, PIXIE; Micropolis Svelte roadmap | …you're comparing OS shortcut pies to in-game holodeck pies |

**PieCraft subdocs:** [PIECRAFT.md](piecraft/PIECRAFT.md) · [PIE-MENU-MODEL.md](piecraft/PIE-MENU-MODEL.md) · [RELATED-PROJECTS.md](piecraft/RELATED-PROJECTS.md)

---

## The intellectual map

Three clusters, three substrate threads, one Simopolis vertical they all feed.

**Pies and Fitts (1 → 5)** — The classical pie-menu argument with empirical data (1), the gesture-space framing that makes pies *feel* right (2), the submenu-corridor trick that linear menus need to compete (3), the macOS regressions that ignored both (4), and the patent that chilled the whole lineage (5).

**Accessibility, recognition, and agents (6 → 9)** — Dasher's *steer-through-probability* model (6) and aQuery's *jQuery-for-the-AX-tree* proposal (7) are the two missing pieces of an accessible automation layer. Prefab (8) is the academic precedent. Cua (9) is the 2026 production cousin. Across this cluster, the recognition layer keeps getting smarter and the actuation layer keeps getting more polite.

**The time dimension (10)** — A short bridge document that gives the corpus a vocabulary for "the animation lied about state". It connects to (4) on motion bugs, to (6) on steering, and to the [command-timeline](command-timeline-git-branches.md) replay substrate.

**Cursors, pies, and the holodeck (11)** — [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) ties (1–2) to implementation: virtual pointer vs warping, tile `FrameInstance` cursors, X11/Tk source references, and [unified-webgpu-renderer.md](unified-webgpu-renderer.md) layers for gestural + HyperCard-style UI.

**Palette as spatial map (12)** — [simcity-tool-palette-design.md](simcity-tool-palette-design.md) captures Don’s 2014 HN rationale: totem-pole differentiation, three encoding channels (size/cost, border/cursor, shape/pie path), and why curated layout beats user-built grids — feeds `ToolCatalog` and MP legend semantics.

**PieCraft & editable pies (13)** — [piecraft/](piecraft/) archives the 2012–2019 product vision (Unity Asset Store, combat-pressure menus, Target/Pie/Slice/Item, Monster Hunter validation, CMU lecture) and wires it to MicropolisCore’s holodeck, virtual pointer, and SimCity palette — the constructionist game Don sketched; Micropolis ships the curated SimCity layer first.

**Automotive touch vs pies (14)** — [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md) harvests [HN 7328476](https://news.ycombinator.com/item?id=7328476): Matthaeus Krenn’s finger-count car UI, critics (shape coding, recall), Don’s saturated-gesture-space reply, ConnectedTV “finger pies,” iLoci/MediaGraph, Kurtenbach 7→8, and why Micropolis uses pop-up pies + totem-pole palette instead of blind multitouch.

**macOS Pie Menu app (15)** — [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) harvests [HN 41160268](https://news.ycombinator.com/item?id=41160268): Marius Hauken’s App Store radial shortcuts, desktop ecosystem (Kando, Charmstone, Maya), Don’s SimCity/Sims/MicropolisCore links, rehearsal-vs-keyboard argument, PIXIE prior art, and icon-vs-label lessons for `ToolCatalog`.

---

## Primary HN sources

These are the *meaty* comments the articles dig into. Each is cited inline in the relevant article; this is the consolidated reference.

| ID | Topic | Where it's used |
|---|---|---|
| [17098179](https://news.ycombinator.com/item?id=17098179) | *Pie Menus: A 30-Year Retrospective* (story) | (1), (2), (5), (6) |
| [17103627](https://news.ycombinator.com/item?id=17103627) | Gordon Kurtenbach's full email on the patent FUD | (5) |
| [17105728](https://news.ycombinator.com/item?id=17105728) | Dasher + Ada Majorek + D@sher + programmer-Dasher | (6), (7) |
| [43934847](https://news.ycombinator.com/item?id=43934847) | Steve Jobs Educom 1988 demo, *"That sucks!"* | (1) |
| [39206966](https://news.ycombinator.com/item?id=39206966) | Kando radial menu launch (story) | (1), (2), (5) |
| [39228342](https://news.ycombinator.com/item?id=39228342) | The long Don comment: Tog, direct manipulation, Speed Racer | (2), (3) |
| [32992284](https://news.ycombinator.com/item?id=32992284) | Cairo desktop (story) | (1), (3), (4) |
| [32993307](https://news.ycombinator.com/item?id=32993307) | Don's Fitts + pie analysis on big screens | (1), (6) |
| [32961306](https://news.ycombinator.com/item?id=32961306) | Don on Frank Leahy and the Menu Manager | (3), (4) |
| [17404401](https://news.ycombinator.com/item?id=17404401) | Amazon mega-dropdown thread; Tog confirms invention | (3) |
| [41160268](https://news.ycombinator.com/item?id=41160268) | Show HN: Pie Menu (pie-menu.com) — Hauken macOS app; Don demos + CHI’88 + rehearsal + MicropolisCore | (15), (1), (2), (5) |
| [41168887](https://news.ycombinator.com/item?id=41168887) | Comment on 41160268 — patent FUD summary | (5), (15) |
| [12306377](https://news.ycombinator.com/item?id=12306377) | Palm history (story) — wpm numbers, Graffiti contrast | (6) |
| [9973272](https://news.ycombinator.com/item?id=9973272) | RobotJS (story) | (7) |
| [9977226](https://news.ycombinator.com/item?id=9977226) | Original aQuery proposal | (7) |
| [11520967](https://news.ycombinator.com/item?id=11520967) | aQuery + Prefab integration sketch to Morgan Dixon | (7), (8) |
| [18794928](https://news.ycombinator.com/item?id=18794928) | Autumn window manager (story) | (7), (8) |
| [18797818](https://news.ycombinator.com/item?id=18797818) | Don's annotated Prefab bibliography | (8) |
| [18797587](https://news.ycombinator.com/item?id=18797587) | Slate + WebView + aQuery as prior art | (7) |
| [14182061](https://news.ycombinator.com/item?id=14182061) | Don on Prefab + Dixon's vision | (8) |
| [11730181](https://news.ycombinator.com/item?id=11730181) | **The TSO Simoleon bot story; Simplifier prehistory** | (9) |
| [22790620](https://news.ycombinator.com/item?id=22790620) | Tip-jar transfer story, retold (OpenTTD off-by-one thread) | (9) |
| [43773563](https://news.ycombinator.com/item?id=43773563) | Launch HN: Cua | (9) |
| [47936312](https://news.ycombinator.com/item?id=47936312) | Show HN: Cua Driver — focus-without-raise, SLEventPostToPid | (9) |
| [46768906](https://news.ycombinator.com/item?id=46768906) | Show HN: Cua-Bench — 90% Win11 → 9% XP | (9) |
| [42874938](https://news.ycombinator.com/item?id=42874938) | Don on 4D Trajectory-Based Operations | (10) |
| [11219792](https://news.ycombinator.com/item?id=11219792) | macOS Fitts regressions (scrollbar, dock, separators) | (4) |
| [7328476](https://news.ycombinator.com/item?id=7328476) | *A New Car UI* — multitouch car demo; Don on pies vs blind gestures, palette, PieCraft, ConnectedTV, TomTom | (12), (14) |
| [40693944](https://news.ycombinator.com/item?id=40693944) | micropolisweb.com — WASM/WebGL launch; strip UI to browser; pies soon; Norman; Embind/LLM port story | [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md), (11), (12) |
| [9149874](https://news.ycombinator.com/item?id=9149874) on [9148746](https://news.ycombinator.com/item?id=9148746) | Maxis shutdown — EA timeline, Ocean **holodeck**, Origin/SC2013, Lucy Bradshaw, SFC/Bar Karma | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [18015780](https://news.ycombinator.com/item?id=18015780), [18044422](https://news.ycombinator.com/item?id=18044422) on [18011332](https://news.ycombinator.com/item?id=18011332) | *Ask HN: startup fail* — HiveMind/Ansari litigation; SFC IP | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4–§5 |
| [9107206](https://news.ycombinator.com/item?id=9107206) on [9107065](https://news.ycombinator.com/item?id=9107065) | *Stop Robot Abuse* — SFC 2003 one-minute robot movies (Oakland) | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [17483925](https://news.ycombinator.com/item?id=17483925) on [17482910](https://news.ycombinator.com/item?id=17482910) | SFC **Empathy** + **Servitude** robot films; Don programmed robot brains | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [12520558](https://news.ycombinator.com/item?id=12520558) on [12514296](https://news.ycombinator.com/item?id=12514296) | Why NBC never aired SFC one-minute robot films (SAG) | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [31418659](https://news.ycombinator.com/item?id=31418659) on [31416098](https://news.ycombinator.com/item?id=31416098) | **Phoneloper** — Flite + XML Phonelopes, phonoscoping, expressive speech/singing ([YouTube](https://www.youtube.com/watch?v=qy5cqV8ypIs)) | [phoneloper-sfc-speech-toy.md](phoneloper-sfc-speech-toy.md) · [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [22089694](https://news.ycombinator.com/item?id=22089694) on [22088509](https://news.ycombinator.com/item?id=22088509) | *Nototo* — **MediaGraph** + **iLoci** for Will's SFC; pie menus, map roads | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 · [family-album-as-storymaker.md](family-album-as-storymaker.md) |
| [47386278](https://news.ycombinator.com/item?id=47386278) on [47385272](https://news.ycombinator.com/item?id=47385272) | *Spotify AI DJ* — MediaGraph music navigation for SFC | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [11219792](https://news.ycombinator.com/item?id=11219792) on [11208463](https://news.ycombinator.com/item?id=11208463) | MediaGraph + Fitts / pie maps | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [31598929](https://news.ycombinator.com/item?id=31598929) on [31596787](https://news.ycombinator.com/item?id=31596787) | Method of loci + MediaGraph / iLoci | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [29330901](https://news.ycombinator.com/item?id=29330901) on [29330015](https://news.ycombinator.com/item?id=29330015) | Scott Adams IF + memory palaces → iLoci/MediaGraph (SFC) | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| [44911071](https://news.ycombinator.com/item?id=44911071) on [44906662](https://news.ycombinator.com/item?id=44906662) | Winograd 1996 talk → Dollhouse → Sims; **Simulator Effect** | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 · Will kickoff sources |
| [22456831](https://news.ycombinator.com/item?id=22456831) on [22455722](https://news.ycombinator.com/item?id=22455722) | Demo catalog — HyperLook SimCity, pies, PSIBER | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |

---

## External anchors

| Topic | Where |
|---|---|
| Bruce Tognazzini, Fitts quiz | [asktog.com/columns/022DesignedToGiveFitts.html](https://www.asktog.com/columns/022DesignedToGiveFitts.html) |
| Apple Human Interface Guidelines, 1987 | [archive.org scan](https://archive.org/details/applehumaninterf00appl) · [Andy Matuschak PDF](https://andymatuschak.org/files/papers/Apple%20Human%20Interface%20Guidelines%201987.pdf) |
| Bill Buxton, marking menus | [billbuxton.com/PieMenus.html](https://www.billbuxton.com/PieMenus.html) · [MMUserLearn.html](https://www.billbuxton.com/MMUserLearn.html) |
| Don Hopkins, *Pie Menu FUD and Misconceptions* | [donhopkins.medium.com](https://donhopkins.medium.com/pie-menu-fud-and-misconceptions-be8afc49d870) |
| Don Hopkins, *Gesture Space* | [donhopkins.medium.com](https://donhopkins.medium.com/gesture-space-842e3cdc7102) |
| Don Hopkins, *Design and Implementation of Pie Menus* (Dr. Dobb's Journal) | [donhopkins.medium.com](https://donhopkins.medium.com/the-design-and-implementation-of-pie-menus-80db1e1b5293) |
| Prefab project page | [prefab.github.io](https://prefab.github.io/) |
| Cua | [github.com/trycua/cua](https://github.com/trycua/cua) |
| Dasher | [inference.org.uk/dasher](https://www.inference.org.uk/dasher/) · [dasher-project/dasher](https://github.com/dasher-project/dasher) |
| Kando (modern OSS pie menu) | [github.com/kando-menu/kando](https://github.com/kando-menu/kando) |
| Weiser, *The Computer for the 21st Century* (Sci Am 1991) | [LRI PDF](https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf) |
| Shneiderman, direct manipulation (Wikipedia) | [en.wikipedia.org/wiki/Direct_manipulation_interface](https://en.wikipedia.org/wiki/Direct_manipulation_interface) |
| Fitts's Law (Wikipedia) | [en.wikipedia.org/wiki/Fitts%27s_law](https://en.wikipedia.org/wiki/Fitts%27s_law) |
| Steering Law (Wikipedia) | [en.wikipedia.org/wiki/Steering_law](https://en.wikipedia.org/wiki/Steering_law) |

---

## Where this lands in Micropolis

| Topic | File |
|---|---|
| Federation pie/tab/window shell | [`PIE-TAB-WINDOWS.md`](../notes/PIE-TAB-WINDOWS.md) |
| Sims + city umbrella | [`simopolis.md`](simopolis.md) |
| Cozy / inclusion in schema | [`og-cozy-games.md`](og-cozy-games.md) |
| Miyamoto craft + §8a Twitch + Simplifier reborn | [`designing-inward-miyamoto-principles.md`](designing-inward-miyamoto-principles.md) |
| Historical XML pie menus | [`historical/drupal-blog/2004-02-05-xml-pie-menus.md`](../historical/drupal-blog/2004-02-05-xml-pie-menus.md) |
| Computer-as-portal worlds-within-worlds | [`the-computer-as-portal.md`](the-computer-as-portal.md) |
| Phase 1F vertical (Simplifier reborn) | [`simopolis-uplift-roadmap.md`](simopolis-uplift-roadmap.md) Phase 1F |
| Sims content semantic layer | [`sims-content-registry.md`](sims-content-registry.md) |
| Tornado archive recovery | [`the-tornado-and-the-archives.md`](the-tornado-and-the-archives.md) |
| Replay / command timeline | [`command-timeline-git-branches.md`](command-timeline-git-branches.md) |
| MOOLLM substrate | [`moollm-microworld-os.md`](moollm-microworld-os.md) |
| micropolisweb.com WASM launch (June 2024) | [`micropolis-web-hn-2024.md`](micropolis-web-hn-2024.md) |
| SimCity 2013 — pies, JS UI, online architecture | [`simcity-2013-willmott-hopkins-correspondence.md`](simcity-2013-willmott-hopkins-correspondence.md) |
| Maxis shutdown, Ocean holodeck, Origin blame | [`maxis-ea-shutdown-hn-2015.md`](maxis-ea-shutdown-hn-2015.md) ([HN 9149874](https://news.ycombinator.com/item?id=9149874)) · SC2013 engineering [`simcity-2013-willmott-hopkins-correspondence.md`](simcity-2013-willmott-hopkins-correspondence.md) |

---

## HN reply map (paste-ready cross-references)

When a thread comes up, here's the article most likely to be the right link.

| Thread | Article |
|---|---|
| Pie menus, Kando, Blender pies | (1) [`pie-menus-fitts-law.md`](pie-menus-fitts-law.md), (2) [`gesture-space-and-pie-menus.md`](gesture-space-and-pie-menus.md) |
| Amazon mega-dropdown, submenu hover | (3) [`submenu-aiming-and-fitts-law.md`](submenu-aiming-and-fitts-law.md) |
| macOS scrollbar, dock, animation bugs | (4) [`classical-hci-vs-aesthetic-ui.md`](classical-hci-vs-aesthetic-ui.md) |
| "Why aren't pie menus everywhere?" | (5) [`pie-menu-patent-fud.md`](pie-menu-patent-fud.md) |
| Dasher, accessibility, LLM-aware editors | (6) [`dasher-steering-law-accessibility.md`](dasher-steering-law-accessibility.md) |
| Accessibility scripting, RobotJS, Hammerspoon | (7) [`aquery-programmable-accessibility.md`](aquery-programmable-accessibility.md) |
| GUI hacking, overlays, Prefab | (8) [`prefab-pixel-reverse-engineering.md`](prefab-pixel-reverse-engineering.md) |
| Anthropic Computer Use, OpenAI Operator, Cua, MCP | (9) [`cua-computer-use-agents-and-simplifier.md`](cua-computer-use-agents-and-simplifier.md) |
| Time as a UI dimension; stream sync; ATC | (10) [`four-dimensional-navigation-hci.md`](four-dimensional-navigation-hci.md) |
| Car touch UI, invisible gestures, physical knobs | (14) [`automotive-touch-ui-vs-pie-menus.md`](automotive-touch-ui-vs-pie-menus.md), (12) [`simcity-tool-palette-design.md`](simcity-tool-palette-design.md) |
| macOS Pie Menu app, pie-menu.com, OS shortcut radials | (15) [`macos-pie-menu-app-hn-2024.md`](macos-pie-menu-app-hn-2024.md) · compare (13) Kando [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) |
| micropolisweb WASM, browser UI vs emulated Mac | [`micropolis-web-hn-2024.md`](micropolis-web-hn-2024.md) |
