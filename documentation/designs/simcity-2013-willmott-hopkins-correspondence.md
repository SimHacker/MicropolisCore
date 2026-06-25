# SimCity (2013) — Willmott ↔ Hopkins correspondence

**Primary source:** Email thread, March 2013 — Don Hopkins → Andrew Willmott (congratulations on SimCity release); Andrew Willmott → Don (reply after NZ trip, resignation context).

**Participants:**


| Person              | Role (2013)                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| **Don Hopkins**     | Sims 1 animation/UI; left EA ~Mar 2000 → **Stupid Fun Club** (talking toys, robot brains, speech I/O); **TomTom** Amsterdam; remote SFC → **MediaGraph** / **Urban Safari**; Unix/GPL Micropolis; Unity pie menus |
| **Andrew Willmott** | SimCity (2013) — UI architecture (JavaScript), filters; ex-Maxis London (~12 years); CMU 1994–2000       |


**Companion:** [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) — Don’s March 2015 HN comment: Lucy Bradshaw, **Ocean Quigley** holodeck, Origin blame, Will/SFC/HiveMind timeline.

**Why MicropolisCore keeps this:** Lineage from **Sims 1 code comments** → Sims 2 animation reuse; **SC3000 scope failure** vs **SC2013 delivery**; **browser-native moddable UI** (Andrew’s JS bet) as precedent for SvelteKit + WASM; **pie menus never shipped** in SC2013 but explicitly requested; **online/DRM debacle** as anti-pattern for federation multiplayer design.

---

## 1. Don’s opening email (12 March 2013)

Don congratulates Andrew on shipped **SimCity** (Glassbox), praises:

- Low-res mode snappy; **Vivid** filter + **Ocean Blur** on pan/zoom/rotate — “mushrooms without side effects”
- UI elegance and fidelity to original spirit; trust in original Maxis team justified
- Hopes server issues are temporary; online login framed like MMO norms, but wants **practical offline** (e.g. overseas flights)
- **SimCity 3000** as cautionary tale — Don links Guru’s infamous design doc (see §4)
- Interest in **UI modding** — minified JS in client was reverse-pretty-printed; asks modding plans
- Offers **Unity3D open-source pie menus**: [https://www.youtube.com/watch?v=sMN1LQ7qx9g](https://www.youtube.com/watch?v=sMN1LQ7qx9g) — “figure out a way to support pie menus in SimCity”
- MediaGraph: may copy/elaborate UI ideas for map-based music/movie navigation

---

## 2. Andrew’s reply — career and near-misses


| Fact                | Detail                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Audience**        | Explicitly **not SC4** — aimed at **SimCity 2000** sensibility again                                                                                     |
| **Maxis overlap**   | Never met Don at Maxis; **CMU 1994–2000** — vague name recognition from CMU infra / pie menu code                                                        |
| **Sims 2 pipeline** | Spelunked Don’s **Sims 1 animation code** to get Sims 2 visuals early; later jury-rig: export S1 anims from Max → IK S1 skeleton to S2 in Maya → re-save |
| **Code quality**    | Thanked Don for **comments** — “pretty easy” in hairy code; rejects minimal-comment vogue                                                                |
| **Location**        | Andrew: **London** since 2008 (whole SC project); prefers to Bay Area. Don: **Amsterdam** ~5 years                                                       |
| **Departure**       | Resigned **late 2012/2013** over **Origin-only**; couldn’t fix path to online launch debacle — “not my circus” after 12 years                            |


**Sims 2 talk alignment:** Don agrees **Edith was more trouble than worth**; **Lua rocks** (Andrew’s prior public position).

---

## 3. Online, DRM, and architecture (Andrew’s inside account)

EA would **not greenlight** a single-player PC SimCity → online requirement. Team tradeoffs:


| Intended positive                                                 | What went wrong                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| No SecuROM (Spore burn)                                           | Forced **EA online tech** integration                                          |
| Insta cloud save, regions, global market, updates, friends        | **Sharded servers** — explicitly what architecture tried to avoid              |
| Andrew’s **offline buffer** — days of play, sync when reconnected | Broken by online team; **20-minute** always-online limit added by “leadership” |


> I tried to finesse a compromise by designing the game system so it did not require an active server connection, and instead buffered game state up to the servers if and when they were available.

**MicropolisCore lesson:** Prefer **client-authoritative sim + optional sync** ([command-timeline-git-branches.md](command-timeline-git-branches.md), [multiplayer-browser-lessons.md](multiplayer-browser-lessons.md)) — never shard the city sim because the server can’t keep up.

---

## 4. SimCity 3000 vs 2013 (Don’s spectator narrative)


| Era                   | What happened                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Post-SimCity 2000** | Will handed next-SC design; SC3000 team ignored it, chased “ultimate VR” / Second Life–like generality                             |
| **Demos**             | 3D prototype shown press; Maxis ran out of money; **EA** bought Maxis, fired runaway team                                          |
| **Shipped SC3K**      | 2D and beautiful — not 3D as teased                                                                                                |
| **SC 2013**           | Don: Andrew/Ocean finally delivered something **more realistic and fun** than Guru’s 15-year-ahead doc — “modulo success disaster” |


**Guru design document** (Ocean: sincere, not just mushrooms):

[https://docs.google.com/document/d/1rnvzKdJp9tyEJwEGxsIjoHnT4Rn7Sn5vkrWYR8HvSqM](https://docs.google.com/document/d/1rnvzKdJp9tyEJwEGxsIjoHnT4Rn7Sn5vkrWYR8HvSqM)

**EA survival rule** (Andrew): show **real progress in 3–6 months** on any new project or die — cites **Spore 2** among failures.

---

## 5. UI stack — JavaScript, modding, visualization

Andrew’s **UI contribution:**

- Drove **entire UI in JavaScript** against constant second-guessing
- Goals: consistent UI across **client + server**; **moddable** UI (WoW **Lua** as model)
- **Not** primary visual designer — points to **Christian Stratton** (UI design), **Richard Shemaka** (engineer: **glassbox** map/agent **data layers**)

Don noticed **leaked/pretty-printed** in-game JS — confirms malleability; wanted pie menus + modding alignment with MediaGraph.

**Micropolis parallel:**


| SC 2013                | MicropolisCore                         |
| ---------------------- | -------------------------------------- |
| JS UI shell            | **SvelteKit** + holodeck               |
| C++ Glassbox sim       | **WASM** Micropolis engine             |
| Moddable UI aspiration | Open source, `PieMenu.svelte`, plugins |
| Minified client JS     | TypeScript source in repo              |


See [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md) — same strip-sim/UI-split thesis.

---

## 6. Visual filters — one shader, remap cube

Andrew on **Ocean** and filters:

> They're all implemented with the **same shader**, just driven with a different **volume texture** (basically a **colour remap cube**).

Give the designer a maximally expressive tool → many looks (**Vivid**, etc.) without separate pipelines.

**Holodeck note:** Color-remap LUT / 3D texture as a **post pass** or tile-style variant fits [unified-webgpu-renderer.md](unified-webgpu-renderer.md) plugin thinking — not SC2013 assets, same pattern.

---

## 7. Pie menus — requested, not shipped in SC2013


| Item                                      | Status                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Don → Unity pie demo + offer to integrate | Andrew: “awesome, put it on the store”                                                                                                |
| Don → “support pie menus in SimCity”      | No follow-up in thread; SC2013 shipped radial/linear EA UI                                                                            |
| MicropolisCore                            | [piecraft/](piecraft/README.md), [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) — **carry the bid forward** |


Unity component: [PIECRAFT.md](piecraft/PIECRAFT.md) · video [sMN1LQ7qx9g](https://www.youtube.com/watch?v=sMN1LQ7qx9g).

---

## 8. Sims animation code lineage (mooshow / Simopolis)

Andrew’s Sims 2 work validates preserving **documented, commented** Sims 1 animation sources in MicropolisCore:


| Artifact                                 | Repo direction                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Don’s Sims 1 animation C++               | `packages/mooshow`, Simopolis uplift                                              |
| EA permission / Unity port thread (2013) | [piecraft/RELATED-PROJECTS.md](piecraft/RELATED-PROJECTS.md) § Sims animation lib |
| “Edit vs Lua”                            | Prefer scriptable/modular boundaries in new UI                                    |


---

## 9. MicropolisCore checklist


| Theme from emails                   | Action                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| Browser owns UI, sim in native code | WASM + Svelte/holodeck ([micropolis-web-hn-2024.md](micropolis-web-hn-2024.md)) |
| Moddable UI                         | Open `ToolCatalog`, pies, Snap! hooks                                           |
| Pie menus in city builder           | Holodeck `PieMenuPlugin` + virtual pointer                                      |
| Offline-first multiplayer           | No SC2013-style forced shard + 20 min tether                                    |
| Commented engine code               | Keep animation/sim docs for future ports                                        |
| 3–6 month visible progress          | Roadmap phases ([simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md))     |
| Data-layer visualization            | Grafana/D3 export (Don HN 2024) + map overlays                                  |


---

## 10. See also

- [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) — Origin vs Maxis (Lucy Bradshaw, Ocean Quigley) from Don HN 2015
- [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) — Wright ↔ Miyamoto week; SC2000 lineage
- [simopolis.md](simopolis.md) — Sims + city umbrella
- [family-album-as-storymaker.md](family-album-as-storymaker.md) — MediaGraph maps + pies
- [platform-lineage-index.md](platform-lineage-index.md)
- [piecraft/RELATED-PROJECTS.md](piecraft/RELATED-PROJECTS.md)

