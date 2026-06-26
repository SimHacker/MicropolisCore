# Related projects — pies, PieCraft, and the Micropolis stack

Chronological and topical map of Don Hopkins pie-menu work **as it bears on MicropolisCore** — not an exhaustive implementation survey (see Don’s 2018 “overwhelming” research note).

---

## Timeline

| Year | Project | Link to MicropolisCore |
|------|---------|------------------------|
| 1988–91 | Pie menus CHI / Dr. Dobb’s | [pie-menus-fitts-law.md](../pie-menus-fitts-law.md) |
| 1993 | **SimCityNet** X11/Tk MP | [simcity-tool-palette-design.md](../simcity-tool-palette-design.md), `micropolis-activity/` |
| 1993+ | **The Sims** pies | [simopolis.md](../simopolis.md), vitamoo |
| 2002 | **ConnectedTV** (Palm) — finger pies, stroke vs poke | [automotive-touch-ui-vs-pie-menus.md](../automotive-touch-ui-vs-pie-menus.md) §5 |
| 2000s | **OpenLaszlo** Micropolis Online | [openlaszlo/classes/piecursor.lzx](../../openlaszlo/classes/piecursor.lzx) |
| 2012 | **Unity pies** + **PieCraft** concept | This folder; Asset Store strategy |
| 2012 | **OmniMotion** + Invisibility3D AR | Gesture-driven pies (future input plugin) |
| 2013-03 | **SimCity (2013)** — Willmott ↔ Don email | Pie menus requested for SC; JS UI modding — [simcity-2013-willmott-hopkins-correspondence.md](../simcity-2013-willmott-hopkins-correspondence.md) |
| 2015-03 | **Maxis shutdown** — Don HN | Origin vs Maxis; Ocean holodeck — [maxis-ea-shutdown-hn-2015.md](../maxis-ea-shutdown-hn-2015.md) |
| 2013 | **Sims 1 → Unity** C# animation lib | `packages/mooshow`, EA permission thread; Andrew spelunked S1 anims for Sims 2 (same correspondence) |
| 2014 | **CMU** Interaction Techniques interview | [interaction-design-articles-index.md](../interaction-design-articles-index.md) |
| 2014 | **jQuery Pie** | Port pattern for web pies before holodeck |
| 2015 | **MediaGraph** / pie maps | Method of Loci; [family-album-as-storymaker.md](../family-album-as-storymaker.md) |
| 2018 | **Monster Hunter World** radial | Validates loadouts; [PIECRAFT.md](./PIECRAFT.md) |
| 2019 | **CMU lecture** slides | [PIE-MENU-MODEL.md](./PIE-MENU-MODEL.md) |
| 2024-06 | **micropolisweb.com** (WASM/WebGL) | Public demo — [micropolis-web-hn-2024.md](../micropolis-web-hn-2024.md) |
| 2024 | **pie-menu.com** (macOS) | Per-app shortcut pies — [macos-pie-menu-app-hn-2024.md](../macos-pie-menu-app-hn-2024.md) |
| 2024 | **Kando** Show HN (Dec) | [kando-cross-platform-pie-menu.md](../kando-cross-platform-pie-menu.md) |
| 2026 | **MicropolisCore** holodeck | [unified-webgpu-renderer.md](../unified-webgpu-renderer.md), `@micropolis/render-core` |

---

## Unity3D pie menus (2012–2013)

| Resource | URL |
|----------|-----|
| Demo video | https://www.youtube.com/watch?v=sMN1LQ7qx9g |
| Live demo | http://www.donhopkins.com/home/PieMenuDemo/PieMenuDemo.html |
| Snapshot zip | http://www.donhopkins.com/home/PieMenuDemo/PieMenuDemo.zip |

**Features (post-demo):** NGUI integration, pull-out submenus, degenerate to linear menu, better docs.

**Business:** Free core on Asset Store; paid **runtime-editable** layer; **PieCraft** as example game ([PIECRAFT.md](./PIECRAFT.md)).

**MicropolisCore:** GPU path is **vitamoo/holodeck**, not Unity — but wedge semantics and editor UX copy the same model.

---

## jQuery Pie Menus (2014)

- **Repo:** https://github.com/SimHacker/jquery-pie
- **Doc:** https://donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus
- **Model:** Target / Pie / Slice / Item — canonical for web ([PIE-MENU-MODEL.md](./PIE-MENU-MODEL.md))

Micropolis browser client should implement the same resolve algorithm (`findPie`, `pies` cache, DOM fallback) in TypeScript on `TileView`.

---

## SimCity / Micropolis lineage

| Artifact | Path |
|----------|------|
| Tcl/Tk pies | `micropolis/micropolis-activity/res/weditor.tcl`, `micropolis.tcl` |
| Tile cursor draw | `micropolis-activity/src/sim/w_editor.c` `DrawCursor` |
| Edge autoscroll | `micropolis-activity/src/sim/w_tk.c` `TileAutoScrollProc` |
| Sun screenshot | http://www.donhopkins.com/home/catalog/simcity/SimCity-Sun.gif |

Web port: [virtual-pointer-and-pie-cursors.md](../virtual-pointer-and-pie-cursors.md), [render-core-package.md](../render-core-package.md).

---

## Monster Hunter World (2018)

Player-crafted **radial menus** + **item loadouts** — empirical proof for prosumer radials in combat.

PieCraft delta: menus as **physical**, **damageable** objects with spill mechanics.

---

## World of Warcraft, Glitch, PieCraft

| Game | Lesson |
|------|--------|
| **WoW** | Addon ecosystem — per-role command sets |
| **Glitch** | Nested bags → buttons; arrangement = efficiency |
| **PieCraft** | Teach Fitts by **penalizing** bad menus in combat |

---

## Sims 1 animation library for Unity (2013)

Email thread to Lucy Bradshaw / Will Wright: C# port of 1990s Sims animation code; request Apache-style license for Asset Store + education (CMU Alice precedent for Sims 2).

**MicropolisCore:** `packages/mooshow`, `packages/sims-io`, Simopolis uplift — **orthogonal** to PieCraft but same Unity-era push.

---

## aQuery & Prefab (2015–2019)

- **aQuery:** jQuery-shaped accessibility tree scripting — overlay pies on any app ([aquery-programmable-accessibility.md](../aquery-programmable-accessibility.md))
- **Prefab:** pixel-reverse GUI modification ([prefab-pixel-reverse-engineering.md](../prefab-pixel-reverse-engineering.md))

Future: holodeck pies as **desktop overlay** via aQuery-style injection — out of scope for city builder v1.

---

## VoyStick (student-era → 2019 lecture)

2D **vocal joystick**: pitch = Y, vowel = X; homomorphic input/output; pairs with pies for accessibility.

---

## MotionSDK / OmniMotion (2012)

Conference contact: evaluate gesture API; pie menus navigable by **hand/head** tracking.

MicropolisCore: optional `PointerEnvironment` force channel ([virtual-pointer-and-pie-cursors.md](../virtual-pointer-and-pie-cursors.md)).

---

## MOOLLM (federation, not primary home for PieCraft docs)

[moollm-micropolis-integration.md](../moollm-micropolis-integration.md) — skills/adventures as command “pies” for agents. Analogous to PieCraft inventory, but **MicropolisCore** owns human-facing pie/cursor GPU path.

---

## OS-level desktop pies (Kando, pie-menu.com, extensions)

| Doc | Product |
|-----|---------|
| [macos-pie-menu-app-hn-2024.md](../macos-pie-menu-app-hn-2024.md) | **pie-menu.com** — macOS App Store shortcut radials (HN 41160268) |
| [kando-cross-platform-pie-menu.md](../kando-cross-platform-pie-menu.md) | **Kando** — cross-platform Electron overlay + editor |
| [pie-menus-browser-extensions.md](../pie-menus-browser-extensions.md) | W3C extension overlay gap |

OS-level pies dispatch **app shortcuts**; Micropolis holodeck pies dispatch **simulation tools** — same wedge UX, different command bus.

---

## What to read next

1. [README.md](./README.md) — hub  
2. [PIECRAFT.md](./PIECRAFT.md) — game  
3. [PIE-MENU-MODEL.md](./PIE-MENU-MODEL.md) — data model  
4. [simcity-tool-palette-design.md](../simcity-tool-palette-design.md) — shipped SimCity UX  
5. [virtual-pointer-and-pie-cursors.md](../virtual-pointer-and-pie-cursors.md) — WebGPU input  
