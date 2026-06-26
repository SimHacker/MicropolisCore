# Brad Myers — Garnet, visual programming, and HN threads

**Primary persona:** [Brad A. Myers](https://en.wikipedia.org/wiki/Brad_A._Myers) — CMU HCI professor; leading researcher in programming by demonstration (PBD), visual programming taxonomies, and user-interface software tools.

**Don Hopkins relationship:** Visiting Garnet group at CMU (~1992–1993); PostScript printing driver; coined **GLASS** (*Graphical Layer And Server Simplifier*). Guest lecture in Brad’s **05-640 Interaction Techniques** class (Feb 2019). Pie-menu demo videos submitted to Brad’s **All the Widgets** compilation (SIGCHI ’90). Extensive HN correspondence with Brad and citations of his work (1990–2024).

**Companion:** [cmu-05640-pie-menus-guest-lecture.md](piecraft/cmu-05640-pie-menus-guest-lecture.md) · [Brad Myers correspondence](https://github.com/SimHacker/DonHopkins/blob/main/characters/don-hopkins/correspondence/brad-myers.yml) · [openlaszlo/README.md](../openlaszlo/README.md) (Garnet constraints vs Laszlo)

---

## 1. CMU Garnet (1992–1993)

Garnet is Brad Myers’ Common Lisp UI toolkit (early 1990s): prototype objects, lazy **pull** constraints (KR), and programming-by-demonstration research lineage (Peridot → Garnet → C32).

| Don’s contribution | Detail |
|---|---|
| Role | PostScript printing driver for Garnet widgets |
| **GLASS** | *Graphical Layer And Server Simplifier* — mineral-acronym in Brad’s gemstone naming tradition ([acronyms.html](http://www.cs.cmu.edu/~bam/acronyms.html)) |
| Constraint comparison | [Constraints and Prototypes in Garnet and Laszlo](https://web.archive.org/web/20070422104545/http://www.donhopkins.com/home/www/com/garnet.html) — Garnet **pull** vs OpenLaszlo **push**; both compile dependency graphs from expressions |
| Blocker | Wanted Display PostScript; Garnet used CLX (pure Lisp X protocol) — no path to client-side XLib/PostScript libraries |

Brad produced **All the Widgets** (1990, CHI technical video program) — a 2h15m history of widgets through 1990. Don’s pie-menu demos appear in that lineage; Brad also included Garnet material in the compilation.

**Video:** [All the Widgets (Fixed v2)](https://www.youtube.com/watch?v=9qtd8Hc90Hw) · Brad’s [tool names index](https://www.cs.cmu.edu/~bam/toolnames/)

---

## 2. CMU 05-640 Interaction Techniques (2019)

Brad taught **05-640** three times; course materials and Panopto guest lectures are a primary archive of interaction-technique invention stories.

| Date | Guest | Topic |
|---|---|---|
| Feb 4, 2019 | **Bill Atkinson** | Lisa GUI polaroids, QuickDraw, MacPaint, HyperCard (LSD→HyperCard story read to class ~1:03:15) |
| Feb 11, 2019 | **Don Hopkins** (Skype) | Pie menus — definitions, roles, future directions; mouse-ahead, event handling ~16:30 |
| Feb 20, 2019 | **Dan Bricklin** | VisiCalc, Demo Program, spreadsheets as end-user programming |
| Apr 10, 2019 | **Rob Haitani** | Palm Pilot UI |
| Feb 27, 2019 | **Shumin Zhai** | ShapeWriter / swipe text |

**Required viewing in course:** *All the Widgets* sections on menus, scroll bars, selection, forms ([schedule](http://www.cs.cmu.edu/~bam/uicourse/05440inter2019/schedule.html)).

**Don’s lecture:** [Panopto](https://scs.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=f0600d9d-282e-4b83-a6f4-a9f2003ad407) · [slide deck](https://docs.google.com/presentation/d/1R9s4EEAwUjI_7A8GgdLYD_U1yUs9omaVqkY9GY-2D78/edit) · [cmu-05640-pie-menus-guest-lecture.md](piecraft/cmu-05640-pie-menus-guest-lecture.md)

**Bill Atkinson:** [Panopto lecture](https://scs.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=25053106-2187-4cde-9981-a9eb002aa4e8) · [Lisa development polaroids](http://www.cs.cmu.edu/~bam/uicourse/05440inter2019/Bill_Atkinson_Lisa_Polaroids.pdf)

**Full guest-lecture folder:** [Panopto 05-640 Spring 2019](https://scs.hosted.panopto.com/Panopto/Pages/Sessions/List.aspx#folderID=%2250285cc6-431b-4b7e-af35-a9eb00287eec%22) (Atkinson, Hopkins, Bricklin, Haitani, Zhai, …)

Brad is finishing **Pick, Click, Flick! The Story of Interaction Techniques** ([ixtbook.com](http://www.ixtbook.com/)) — expanded from *All the Widgets* and his Brief History of HCI paper, with inventor interview videos.

---

## 3. Visual programming taxonomy (1986 / 1990)

Brad’s classic paper (CHI ’86, updated JVLC 1990) classifies visual programming languages (VPLs), programming by example, and program visualization.

| PDF | Notes |
|---|---|
| [CHI ’86 version](http://www.cs.cmu.edu/~bam/papers/chi86vltax.pdf) | Original conference paper |
| [JVLC 1990](http://www.cs.cmu.edu/~bam/papers/VLtax2-jvlc-1990.pdf) | Journal update with figures |

**Spreadsheets as VPL:** Brad argues VisiCalc / Lotus 1-2-3 qualify as very-high-level visual programming — 2D spatial layout, visible data, derived evaluation order, suppressed “inner world” of computation. Don has cited this repeatedly on HN when threads claim “there are no successful VPLs” or exclude Excel.

**HN threads where Brad commented:** [26057530](https://news.ycombinator.com/item?id=26057530) (BradAMyers drops in, Feb 2021) · Don’s C32 joke and Garnet reunion comment on same thread.

---

## 4. Mineral acronyms — PERIDOT, GARNET, C32, GLASS

Brad’s research group names projects after gemstones (with occasional exceptions):

| Name | Expansion (abbreviated) |
|---|---|
| **PERIDOT** | PBD UI creation by demonstration (1987 PhD thesis) |
| **GARNET** | Generating an Amalgam of Real-time, Novel Editors and Toolkits |
| **C32** | CMU’s Clever… **Columns of Cells**… spreadsheet-like constraints by demonstration (1991); [video](https://www.youtube.com/watch?v=IsINJ8mlD5A) |
| **GLASS** | Graphical Layer And Server Simplifier (Don’s contribution) |

Brad on C32 vs gemstone theme (HN 2021): *“C32 doesn't follow the general convention… but I think it is fun.”*

---

## 5. Don’s HN arguments (visual programming)

Recurring themes across [22978454](https://news.ycombinator.com/item?id=22978454), [26668885](https://news.ycombinator.com/item?id=26668885), [26061576](https://news.ycombinator.com/item?id=26061576), [drossbucket folk wisdom](https://drossbucket.com/folk-wisdom-on-visual-programming/) harvest:

### Spreadsheets beat the popularity test

When challenged “name a VPL as popular as Ruby,” Don answers **Excel** — and refuses the popularity contest as definitional. Spreadsheets are 2D graph-structured programs, not one-dimensional text streams; hiding formulas does not disqualify Sketchpad-style direct manipulation either.

### VPL is not only node-and-wire

Unreal Blueprints is one genre. Also in the taxonomy: PBD/VPBE, constraint programming (Sketchpad, Geometer’s Sketchpad), macro recorders, GUI builders, AgentSheets, **SimAntics** (The Sims behavior VPL — Don’s implementation with Will Wright), ladder logic (SCADA), LabVIEW, Max/MSP, Simulink, Snap! (Scheme-grade blocks).

### Text vs visual is the wrong axis

Hybrid tools (Enso/Luna 1:1 visual↔text) and “computational structure” matching authoring notation (dataflow for audio, constraints for UI) matter more than declaring victory for either syntax.

### 1980s limitations ≠ 2020s verdict

Ken Forbus-style rebuttal (thread on [22978454](https://news.ycombinator.com/item?id=22978454)): NP-complete graph layout and missing formal specs were overstated objections in 1989; computers, ZUIs, and approximations changed the trade space — without proving every graph VPL wins.

---

## 6. Garnet, OpenLaszlo, reactive programming

From [HN 11232154](https://news.ycombinator.com/item?id=11232154) and [17360883](https://news.ycombinator.com/item?id=17360883):

| System | Constraint model | Notes |
|---|---|---|
| **Garnet (KR)** | Lazy pull; Lisp macros parse `gvl` paths | Invalidates on path/value change; doesn’t analyze conditional branches deeply |
| **OpenLaszlo** | Push via `setValue` + compiled deps | Flash-era tradeoff; Oliver Steele’s **Instance-First Development** |
| **Sketchpad (1963)** | Algebraic / multi-way | Sutherland thesis — constraint programming origin |
| **Spreadsheets** | Reactive cells | “Reactive programming” craze = spreadsheets with branding |
| **Apple KVO** | One-way notify | Simpler dataflow |

Quote Don popularized on HN (via mpweiher): *“Constraints are like structured programming for variables.”*

---

## 7. Programming by demonstration — book and lineage

Brad co-edited **Watch What I Do: Programming by Demonstration** ([acypher.com/wwid](http://acypher.com/wwid)) — chapters on Peridot, Garnet, Richard Potter’s **Just-in-Time Programming** (Factorio-automation analogy on [HN 26053703](https://news.ycombinator.com/item?id=26053703)), Triggers, and many other systems.

**Peridot video (1987):** [YouTube](https://www.youtube.com/watch?v=FsGx7G72V0Q)

Related survey Don cites: Kurt Schmucker’s [Taxonomy of Simulation Software](http://donhopkins.com/home/documents/taxonomy.pdf); Chaim Gingold’s [Gadget Background Survey](http://chaim.io/download/Gingold%20(2017)%20Gadget%20(1)%20Survey.pdf); Fabrik paper ([Ingalls](https://donhopkins.com/home/Fabrik%20PE%20paper.pdf) — modular time, bidirectional dataflow).

---

## 8. Widget implementation complexity (2022)

On [Prime Video WebAssembly](https://news.ycombinator.com/item?id=16315328) (Jan 2022), Don pointed to **Xerox Star (1982)** text editor video and Brad’s **All the Widgets** as evidence that text fields, menus, and scrollbars encode decades of invisible polish — accessibility, i18n, selection models, mouse-ahead vs polling, autoscroll during drag.

---

## 9. HN comment catalog (Don ↔ Brad topics)

| HN ID | Thread topic | Don’s role |
|---|---|---|
| [26057530](https://news.ycombinator.com/item?id=26057530) | VPL taxonomy repost | C32 joke; Garnet reunion; spreadsheet excerpt |
| [26061576](https://news.ycombinator.com/item?id=26061576) | Spreadsheets are all you need | Full taxonomy + C32 + Brad papers |
| [11232154](https://news.ycombinator.com/item?id=11232154) | Garnet – Lisp toolkit | “Yay Garnet!” GLASS; constraints article |
| [22984831](https://news.ycombinator.com/item?id=22984831) | Excel vs Ruby VPL debate | “Excel.” popularity inversion |
| [26668885](https://news.ycombinator.com/item?id=26668885) | Spreadsheet paradigm | Brad paper + SimAntics pointer |
| [7263027](https://news.ycombinator.com/item?id=7263027) area | SimAntics / Sims VPL | Edith demo links |
| [16315328](https://news.ycombinator.com/item?id=16315328) | Widget complexity | All the Widgets + ixtbook |
| [21726302](https://news.ycombinator.com/item?id=21726302) | Bill Atkinson @ Brad’s class | Links to CMU lectures |
| [17360883](https://news.ycombinator.com/item?id=17360883) | Homoiconicity | Garnet/Laszlo constraints thread |

Brad’s own account on taxonomy thread ([26057530](https://news.ycombinator.com/item?id=26057530)): modern VPL successes include **LabVIEW**, **OutSystems**, and “no-code/low-code” platforms; still follows the field.

---

## 10. Interview show seed

Brad Myers is a strong **Micropolis Class** guest: Garnet constraints ↔ OpenLaszlo/Micropolis declarative UI; *All the Widgets* inventor interviews; pie menus in his course and book; spreadsheets + C32 as constraint spreadsheets; SimAntics as shipped VPL; **Pick, Click, Flick!** manuscript.

**Show proposal:** [shows/brad-myers-garnet-vpl.yml](https://github.com/SimHacker/DonHopkins/blob/main/projects/micropolis-moollm/shows/brad-myers-garnet-vpl.yml) in DonHopkins repo.

**Suggested episode topics:**

1. Garnet days — GLASS, PostScript, KR constraints, why CLX blocked Display PostScript
2. *All the Widgets* — making the compilation; Don’s pie-menu submissions; what got left out
3. VPL taxonomy today — spreadsheets, no-code, Blueprints, Snap!, ladder logic
4. C32 and constraint spreadsheets — demonstration + cells
5. 05-640 guest-lecture series — Atkinson, Bricklin, Haitani, Zhai; teaching invention stories
6. PBD book — JIT programming, Triggers, what never shipped commercially
7. Pie menus vs marking menus — Brad’s book chapter accuracy (2023 correspondence)
8. From Garnet pull constraints to reactive UI — what Micropolis should steal

---

## External anchors

| Resource | URL |
|---|---|
| Brad Myers home | https://www.cs.cmu.edu/~bam/ |
| Acronym catalog | http://www.cs.cmu.edu/~bam/acronyms.html |
| UI tools survey paper | https://dl.acm.org/doi/10.1145/344949.344959 |
| Garnet home (archive) | http://www.cs.cmu.edu/afs/cs/project/garnet/www/garnet-home.html |
| Interaction Techniques course | http://www.cs.cmu.edu/~bam/uicourse/05440inter/ |
| CHI Lifetime Research Award talk (2017) | https://www.youtube.com/watch?v=IVoovFR5nUY |
