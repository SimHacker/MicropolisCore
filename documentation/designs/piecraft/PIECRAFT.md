# PieCraft — game design

> *A play on Minecraft — you craft **pie menus**, not blocks.*
> *Tom Carden (Aug 2012): “PieCraft sounds fun! My only worry is that there will be a user revolt when people realise that there aren't actual bona fide food pies involved ;)”*

**Primary sources:** Don Hopkins emails (Aug 2012 Unite Amsterdam, Dec 2013 Lucy Bradshaw, **Mar 2013 Andrew Willmott** — [simcity-2013-willmott-hopkins-correspondence.md](../simcity-2013-willmott-hopkins-correspondence.md), Apr 2014 CMU interview); [HN 7263027](https://news.ycombinator.com/item?id=7263027); Ben Shneiderman / Brad Myers CMU lecture outline (Feb 2019).

**MicropolisCore role:** PieCraft is the **constructionist** reference game for *runtime-editable* radial UI. Micropolis **play mode** ships the **curated** SimCity totem-pole + pies ([simcity-tool-palette-design.md](../simcity-tool-palette-design.md)); Simopolis may add **player-editable** loadouts later. Same [PIE-MENU-MODEL](./PIE-MENU-MODEL.md) and [holodeck](../unified-webgpu-renderer.md) either way.

---

## Elevator pitch

**PieCraft** is a lightweight RPG where **pie menus are first-class world objects**. Players find, buy, build, and carry pies like chests — filling them with weapons, spells, armor, and buffs arranged for each combat role.

**Good menu design is good gameplay.** Efficient pies (Fitts, muscle memory, mouse-ahead) win fights. Slow pies get you hit. The game teaches **interface design literacy** by making layout optimization part of strategy — Papert-style constructionism applied to radial UI, not to blocks.

---

## Origin (August 2012, Unity Unite Amsterdam)

After polishing Unity pie menus (Will Wright allowed open-source release), the concept crystallized en route to Unite:

| Tier | Deliverable | Price |
|------|-------------|-------|
| **Core** | Pie menu widget — API, editor tools, NGUI integration | **Free** (Asset Store, exposure) |
| **Premium** | **Runtime user-editable** menus + PieCraft **source** as example | Paid extension |
| **Game** | Playable PieCraft demo | **Free** online (no game source) |

> The actual purpose of PieCraft is not to make a lot of money off of the game itself, but to **educate people about designing pie menus** and promote the user-editable component.

Retro “Minecraft-like” art is a **scope choice**, not the product goal.

**Conference outcomes (2012):** OmniMotion MotionSDK evaluation contract; asset-store lead endorsed featuring pies + bundling with top-selling NGUI.

---

## Core mechanics

### Pies as world objects

| Traditional | PieCraft |
|-------------|----------|
| Hotbar / action bar | Combat pie loadout |
| Spell book | Slices by element / level |
| Glitch-style bags | Items inside portable pies |
| WoW addon bars | Per-build custom pies |

- **Find / buy / craft** empty or pre-filled pies
- **Inventory** multiple pies for different roles
- **Edit at runtime** — drag-and-drop items into slices ([PIE-MENU-MODEL](./PIE-MENU-MODEL.md))

### Design pressure = gameplay

**Fitts’s Law Feng Shui** — frequent commands sit in fast wedges.

| Pressure | Effect |
|----------|--------|
| Pie open = vulnerable | Pop up, act, pop down |
| Pie takes **damage** | Items fall off; pie **breaks** and **spills** loot |
| Enemies / pickpockets | Scramble for spilled items; design for **mouse-ahead** under stress |
| Progression | More slices, pull-out submenus, better “materials” |

> …compelled to arrange your most important items so you could find and select them as quickly and easily as possible … **mouse ahead** swiftly during combat … to avoid damage from attack and loss from thieves. — [HN 7263027](https://news.ycombinator.com/item?id=7263027)

### RPG frame

D&D-like adventure; explore, fight, loot, craft menus; loadouts per fight type (see Monster Hunter below); optional MP trade / steal spilled pies.

---

## What PieCraft is *not*

- **Not** a Minecraft clone — “craft” is generic; goal is UI education
- **Not** primarily a revenue title — promotes editable-menu **component**
- **Not** food — Tom Carden’s joke acknowledged; no pastry required

---

## Validation: Monster Hunter World (2018)

Don cited MHW **radial menus** as proof customizable radials matter in high-skill play:

> The radial menu is an absolute must for high rank and tempered hunts where every second counts. Flipping through items using the d-pad … takes your eyes off of the monster.

MHW provides: player-built radials, **item loadouts**, muscle-memory flick.

**PieCraft goes further:** menus as **damageable in-world objects** with spill-on-break (not in MHW).

Videos referenced in Don’s 2018 email to Ben Shneiderman:

- [Radial Menu Guide](https://www.youtube.com/watch?v=JUsvEvhuDZk)
- [Quick Tips — radial & loadouts](https://www.youtube.com/watch?v=9miyhv-kAoU)

---

## SimCity inversion (MicropolisCore)

SimCity (X11/Tk): **designer-authored** totem pole **maps** to fixed pie gesture space — palette is legend for MP cursors ([simcity-tool-palette-design.md](../simcity-tool-palette-design.md)).

PieCraft **inverts**: the player **authors** the map. Micropolis web app targets the **middle path**:

1. **Ship** curated `ToolCatalog` + pies (SimCity fidelity, MP-ready).
2. **Optional** user loadouts (Monster Hunter / PieCraft-lite) for power users.
3. **Research** full PieCraft mode as separate demo or Simopolis minigame.

---

## Web / Micropolis implementation sketch (not Unity)

| Unity (2012 plan) | MicropolisCore (2026 target) |
|-------------------|------------------------------|
| C# pie widget | `packages/vitamoo` + holodeck `PieMenu` plugin |
| Runtime editor component | Svelte pie editor + `ToolCatalog` JSON |
| PieCraft game | `apps/micropolis` or `apps/micropolis-home` demo flag |
| Pointer warp fix | [virtual-pointer-and-pie-cursors.md](../virtual-pointer-and-pie-cursors.md) |
| Label sticks to cursor | Unity-style mitigation when no pointer lock |

---

## Parallel tracks (same era, shared pies)

| Project | Relation |
|---------|------------|
| **Sims 1 animation → Unity** (2013) | Separate open-source ask to EA; uses same pie UX in tooling |
| **Invisibility3D** (2012+) | AR pies + MotionSDK gesture |
| **OpenLaszlo Micropolis Online** | [piecursor.lzx](../../openlaszlo/classes/piecursor.lzx) |
| **CMU Brad Myers class** (2014, 2019 lecture) | Interview + [slides](https://docs.google.com/presentation/d/1R9s4EEAwUjI_7A8GgdLYD_U1yUs9omaVqkY9GY-2D78/edit) |

See [RELATED-PROJECTS.md](./RELATED-PROJECTS.md).

---

## Success criteria (MicropolisCore)

- [ ] `ToolCatalog` drives palette, map cursor `FrameStyle`, and pie wedges
- [ ] Pie pop uses virtual pointer when lock available
- [ ] Label-to-pointer animation when menu partially off-screen
- [ ] Documented path from curated SimCity UI → optional user loadouts → PieCraft research build
