# macOS Pie Menu app (HN 2024) and the Micropolis pie lineage

**Primary thread:** [Show HN: Pie Menu – a radial menu for macOS](https://news.ycombinator.com/item?id=41160268) (Aug 5, 2024) — [pie-menu.com](https://www.pie-menu.com) by Marius Hauken.

**Don Hopkins (SimHacker)** posted throughout the thread: SimCity/X11 and Flash demos, CHI’88 study, patent FUD, PIXIE 1969 prior art, rehearsal vs keyboard shortcuts, MicropolisCore/SvelteKit roadmap, Adobe Photoshop petition.

**Related threads:** [Kando launch (Dec 2024)](https://news.ycombinator.com/item?id=39206966) · [Kando Show HN (Aug 2024)](https://news.ycombinator.com/item?id=42525290) · [Car UI / pies (2014)](https://news.ycombinator.com/item?id=7328476)

---

## 1. What Hauken shipped (pie-menu.com)

| Aspect | Detail |
|--------|--------|
| **Product** | macOS App Store / Setapp app — hotkey opens **cursor-centered radial menu** |
| **Scope** | Per-application shortcut rings; library + [shortcut database](https://www.pie-menu.com/shortcuts) |
| **Labels** | Apple SF Symbols today; custom symbol sets on [roadmap](https://www.pie-menu.com/help/roadmap) |
| **Best fit** (author) | Creative tools with **frequent tool/mode switches** — Figma, Photoshop, Illustrator, Calendar modes, Things, Obsidian |
| **Weaker fit** | Apps where keyboard shortcuts are already muscle memory for one-off commands |
| **Pricing** | Free tier: 10 invocations/day; lifetime purchase intended “without air quotes” |

**UX notes from thread:** Center shows **hovered command text** ([show-options](https://www.pie-menu.com/help/roadmap)); website demo uses Shift+Z (problematic on German QWERTZ — author added flexibility); `user-select: none` while menu up avoids accidental text selection.

**Positioning:** “Pie menu” as **generic HCI term** ([Wikipedia](https://en.wikipedia.org/wiki/Pie_menu)), not a new name for “radial menu” — [neilv comment](https://news.ycombinator.com/item?id=41160268).

---

## 2. Desktop radial ecosystem (2024)

| Product | Role |
|---------|------|
| **[pie-menu.com](https://www.pie-menu.com)** | macOS-native, per-app shortcut pies (this thread) |
| **[Kando](https://kando.menu)** | Cross-platform Electron overlay + editor — [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) |
| **[Charmstone](https://charmstone.app)** | App switching radial (cited vs pie-menu.com) |
| **BetterTouchTool** | Scriptable floating menus (hold right mouse → release on item) |
| **Raycast** | Fuzzy “search menu items” — keyboard palette, not gestural |
| **Autodesk Maya Hotbox / Fusion pies** | In-app tool radials with **text labels** (thread praised vs icon-only) |
| **Blender** | Mature in-app pie menus — [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| **Logitech / Griffin PowerMate / Surface Dial** | Hardware radial cousins |

**Takeaway:** macOS finally has **shipping** cursor pies for OS-level shortcuts; Micropolis still needs **in-canvas** holodeck pies for city/tools ([unified-webgpu-renderer.md](unified-webgpu-renderer.md)) — complementary, not competing.

---

## 3. Don’s thread comments — canonical demos

Don pointed newcomers at the **same lineage** MicropolisCore documents:

| Era | Demo / artifact | URL |
|-----|-----------------|-----|
| X11 SimCity | Multiplayer pies | https://www.youtube.com/watch?v=Jvi98wVUmQA |
| Flash / OpenLaszlo | Pie vs tool palette speed | https://www.youtube.com/watch?v=8snnqQSI0GE (Flash dead; source: [micropolis laszlo](https://github.com/SimHacker/micropolis/blob/master/laszlo/micropolis/src/piecursor.lzx)) |
| The Sims 1 | Edith + pie menus | https://www.youtube.com/watch?v=-exdu4ETscs |
| Unity (2012) | Pull-out distance, degenerate linear | https://www.youtube.com/watch?v=sMN1LQ7qx9g |
| **Web (WIP)** | micropolisweb.com | https://micropolisweb.com/ — launch context [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md) |
| **MicropolisCore** | SvelteKit + holodeck | https://github.com/SimHacker/MicropolisCore |
| jQuery pies | Target/Pie/Slice/Item | https://github.com/SimHacker/jquery-pie |
| Svelte pies (WIP) | `apps/micropolis/src/lib/PieMenu.svelte` | In-repo; rendering/holodeck integration ongoing |

> Pie menus work quite well for **selecting tools**, as an alternative to the tool palette.

That matches [simcity-tool-palette-design.md](simcity-tool-palette-design.md): totem pole = recognition; pies = speed after rehearsal.

---

## 4. CHI’88 study (reposted on thread)

Don restated the controlled comparison:

- **~15% faster** than linear menus for **fixed 8-item** pop-up menus
- **Lower error rate**
- Caveats from the paper: screen real estate, subjective split, need more studies

Full write-up: [An Empirical Comparison of Pie vs. Linear Menus](https://donhopkins.medium.com/an-empirical-comparison-of-pie-vs-linear-menus-80db1e1b5293) · corpus: [pie-menus-fitts-law.md](pie-menus-fitts-law.md)

**HN pushback (lupire):** “15% on menu selection” ≠ whole-task speed if the pie **obscures** the document. Don’s reply: artists in Blender/Maya use pies all day — menu selection *is* the task for tool switching.

---

## 5. Rehearsal vs keyboard shortcuts (Don → Hauken thread)

Don’s core pedagogical argument ([also HN 17105643](https://news.ycombinator.com/item?id=17105643)):

| | Pie menu | Keyboard shortcut |
|---|----------|-------------------|
| **Novice** | Pop up, read wedges, move, select | Must memorize unrelated key combo |
| **Intermediate** | Mouse-ahead, glance to confirm | — |
| **Expert** | Flick by direction without looking | Expert shortcut use |
| **Learning** | **Browsing the pie is rehearsal** for the flick | Pulling down a linear menu to read ⌘K is **not** rehearsal for typing ⌘K |

> Keyboard shortcuts are a completely different action than pie menu gestures … selecting from linear drop-down menus that show keyboard shortcuts isn't rehearsal.

**Sims 4 community:** searchable pie menu mods cited as extending the model for huge verb sets:

- https://www.youtube.com/watch?v=1brQOz6FZjI  
- https://www.patreon.com/posts/83099506  

Micropolis implication: show **labels** on wedges (Sims 1 style), optional shortcut hints under icons (thread request to Hauken).

---

## 6. Self-revealing, mouse-ahead, preview (armchair vs shipped)

Don pushed back on pure speculation:

- Menu can pop when motion **stops**, revealing options
- **Tooltip label** at cursor during mouse-ahead before full pop-up
- **In-world preview** + pull-out distance → release when preview looks right ([PIE-MENU-MODEL.md](piecraft/PIE-MENU-MODEL.md))
- Not every shipping pie implements all features; Don’s implementations do — **unpatented**, iterate with users

Corpus: [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md)

---

## 7. Patent FUD (Alias / Buxton / Kurtenbach)

Don’s long Aug 6 comment on this thread duplicates [pie-menu-patent-fud.md](pie-menu-patent-fud.md):

- **US5689667A** — narrow “overflow” radial+linear; misleading claims vs real pie menus
- Gordon Kurtenbach 1990 email acknowledged **mouse-ahead display suppression** on pies
- Patent falsely claimed pies select by **pointing at items** like linear menus
- Chilling effect on 3ds Max, Blender (now supports pies post-expiry)
- Autodesk brochures still brag “patented marking menus”

Shorter pointer on thread: [HN 41168887](https://news.ycombinator.com/item?id=41168887) (child of this story).

---

## 8. PIXIE (1969) — prior art film

Don linked **PIXIE** CAD UI (1969) with remix film:

- Paper: [PIXIE: a new approach…](https://www.donhopkins.com/home/documents/PIXIE%20a%20new%20approach%20to%20graphical%20man-machine%20communication.pdf)
- Film: https://www.youtube.com/watch?v=jDrqR9XssJI  
- Timeline: [Pie Menu Timeline (Medium)](https://donhopkins.medium.com/pie-menu-timeline-21bec9b21620)

Warrenm’s Ubiquity article (1969 radial attribution) + navy round-screen anecdote on thread.

---

## 9. Adobe Photoshop / marking menus (12-year petition)

Don referenced failed push for pies in Adobe tools:

- [Polycount crowd-funding thread (2012)](https://polycount.com/discussion/96932/crowd-funding-project-marking-menus-for-photoshop-and-other-software) — Don’s 2024 reply with links and corrections

**pie-menu.com** is the indie answer for **macOS app commands**; Micropolis is the answer for **in-game tools** — same wedge geometry, different command bus.

---

## 10. Thread critiques (design lessons)

| Critique | Response / Micropolis takeaway |
|----------|--------------------------------|
| **Icons without text** | Sims 1 used clear labels; Maya shows text; prefer labels + optional shortcuts |
| **Obscures content** behind circle | Acceptable for OS launcher; in-game use **translucent wedges**, preview on map, or partial fan |
| **Thumb covers wedge** (mobile) | Fan menus, handedness setting — less relevant to desktop Micropolis |
| **Keyboard hotkey to open** | Hand leaves mouse — BTT/right-mouse hold is alternative; in-game: **right-drag or long-press** on map |
| **Radial only for ≤6 items** | Use submenus, depth, or searchable pies (Sims 4 mods) |
| **“Donut chart menus” ≠ real pies** | Direction-at-release, not pointing at icon centers |

---

## 11. MicropolisCore implementation map

| Hauken / Don theme | MicropolisCore target |
|------------------|----------------------|
| Tool switching | `ToolCatalog` + holodeck `PieMenuPlugin` |
| Palette alternative | [simcity-tool-palette-design.md](simcity-tool-palette-design.md) totem + pies |
| jQuery → Svelte | `apps/micropolis/src/lib/PieMenu.svelte` → vitamoo/render-core |
| Virtual pointer | [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |
| Labels + rehearsal | Wedge text from catalog; don’t ship icon-only |
| MP legend | Border color = remote tool ([simcity-tool-palette-design.md](simcity-tool-palette-design.md)) |

**Not in scope:** App Store macOS shell integration — federation pies live in WebGPU holodeck + DOM overlay per [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md).

---

## 12. Pointers

| Resource | URL |
|----------|-----|
| HN story (Aug 2024) | https://news.ycombinator.com/item?id=41160268 |
| Pie Menu app | https://www.pie-menu.com |
| Shortcut DB | https://www.pie-menu.com/shortcuts |
| Don Hopkins pie catalog | https://donhopkins.com/home/catalog/piemenus/ |
| Kando (cross-platform) | https://github.com/kando-menu/kando |
| Patent FUD essay | https://donhopkins.medium.com/pie-menu-fud-and-misconceptions-be8afc49d870 |

---

## 13. See also

- [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) — Electron overlay vs browser extension gap  
- [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) — W3C overlay ask  
- [piecraft/README.md](piecraft/README.md) — PieCraft + PIE-MENU-MODEL  
- [interaction-design-articles-index.md](interaction-design-articles-index.md) — article #15
