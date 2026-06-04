# Automotive touch UI vs pie menus (HN 2014)

**Primary thread:** [A New Car UI — matthaeuskrenn.com](https://news.ycombinator.com/item?id=7328476) (Feb 18–21, 2014) — multitouch finger-count gestures on a dashboard tablet.

**Don Hopkins comments on that thread** (SimHacker): palette/totem-pole design ([simcity-tool-palette-design.md](simcity-tool-palette-design.md)), PieCraft ([piecraft/PIECRAFT.md](piecraft/PIECRAFT.md)), **pie menus as self-revealing saturated gesture space** (not blind multitouch), **ConnectedTV** finger pies on Palm, **iLoci** / Method of Loci, **MediaGraph** prototype, Fitts / 7-vs-8 wedge study, TomTom automotive politics.

**MicropolisCore use:** This doc is the **design argument** for why holodeck pies + virtual pointer + curated `ToolCatalog` are the right counter-model to “invisible finger choreography” car UIs — and why SimCity’s totem-pole palette is **shape-coded recognition**, not recall.

---

## 1. What Matthaeus proposed

Designer [Matthaeus Krenn](https://matthaeuskrenn.com/new-car-ui/) demoed a **secondary driving mode** on a large touch surface:

- **2 / 3 / 4 / 5 fingers**, **close vs spread** → different functions (volume, HVAC, etc.)
- Goal: adjust common controls **without looking** at fake on-screen buttons
- Legend shown at session start; prototype: http://matthaeuskrenn.com/new-car-ui/prototype/

Matthaeus framed it as a **conversation starter**, not the final answer — often paired with **physical knobs** for primary controls and touch for rare settings.

---

## 2. HN consensus (why critics pushed back)

| Critique | HCI principle |
|----------|----------------|
| Gestures are **invisible** — no persistent affordances | **Recognition rather than recall** (Nielsen/Shneiderman) |
| No cross-car **standard** for “two fingers = volume” | Unlike wiper stalk location, every car reinvents |
| **Gloves**, missing fingers, bumps, proprioception limits | Accessibility + motor variance |
| Still need to **verify** finger count on screen | Visual attention not eliminated |
| **Shape coding** (Chapanis): different knob shapes/places beat identical glass | Fighter pilots → Toyota |
| **Physical buttons** already solve frequent knobs with spatial + muscle memory | “Just put some damn hard buttons on the dash” |
| Multitouch overload (twist + count + distance) | Adobe/Apple studies cited by skeptics |

Useful designer takeaway: **multimodal** — voice, wheel buttons, HUD, haptics, camera gesture — not touch alone. MicropolisCore: holodeck + DOM + voice later; not car-specific.

---

## 3. Don’s counter-thesis: pie menus ≠ blind gestures

Don’s thread comments (and [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)) distinguish **pie menus** from **blind gesture recognition**:

| | Blind multitouch (car demo) | Pie menu |
|---|---------------------------|----------|
| Vocabulary | Tiny trained set; rest = syntax error | **Every angle** = a wedge; center = cancel |
| Feedback | Legend once; then memorize finger codes | **Menu pops up** — self-revealing, browse, reselect |
| Correction | Hard to fix mid-gesture | **Reselection** — cross wedges without lifting |
| Path | Often path-dependent | **Angle at release only** (press point + release point) |
| Mission-critical | Fuzzy match risky in car | Prefer **4 wedges** for automotive; require motion leverage |

> Pie menus completely **saturate** the entire possible gesture space with usable commands: there is no such thing as a syntax error … you can always correct … or cancel … by moving to the center.

> Handwriting and gesture recognition does not have this property … dangerous because mistakes can be misinterpreted … Most gestures are syntax errors.

**Implication for Micropolis:** City-builder pies use **pop-up + virtual pointer** ([virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md)), not finger-count codes. Tool palette provides **persistent recognition** between pie sessions.

---

## 4. Maps beat trees (sibmenus, Method of Loci)

Don reframes pies as **navigation on a map**, not climbing a menu tree:

- **Submenus** need extra “back” command and obscure cancel
- **Sibmenus** — bidirectional links; opposite direction = return
- **iLoci** (iPhone): user-built maps of locations, drag-link editing — [Vimeo 2419009](https://vimeo.com/2419009)
- **MediaGraph** (Unity, Will Wright): map editor + pull-out distance preview + cellular automata — [MediaGraphDemo1.mov](http://www.DonHopkins.com/home/StupidFunClub/MediaGraphDemo1.mov)

Links: [piecraft/PIE-MENU-MODEL.md](piecraft/PIE-MENU-MODEL.md), [family-album-as-storymaker.md](family-album-as-storymaker.md) (five navigation views).

---

## 5. ConnectedTV: “finger pies” before multitouch (2002)

Palm app **ConnectedTV** (Don Hopkins + David Levitt) — TV guide + universal remote, **no stylus in the dark couch**:

- Large buttons; **tap** = tune; **stroke up/down/left/right** = complementary commands (volume, channel, favorite, page time)
- Hardware Palm buttons remapped (power, mute, vol, next/back)
- Review: Geoff Walker, Pen Computing — [connectedTV.html](http://www.pencomputing.com/palm/Pen44/connectedTV.html)
- “Stroke vs poke” essay: [Facebook note](https://www.facebook.com/note.php?note_id=106220169912)

Precursor to iPhone swipe and to **directional wedges** without requiring multitouch. Micropolis holodeck pies are the same lineage with GPU + pick buffer.

---

## 6. Fitts: why 8 wedges beat 7 (Kurtenbach & Buxton)

Don cites lab result: **8-item** pie faster than **7-item** — not physical target size alone, but **cognitive mapping** to familiar directions (N/S/E/W, diagonals, pairs, compass).

| Count | Cognitive frame |
|-------|-----------------|
| **8** | Orthogonal pairs, diagonals — “compass” |
| **12** | Clock face — hours, months |
| **7** | Six odd slants + one familiar — **suboptimal** |
| **4** | Reliable enough for **automotive** with strong motion + feedback |

**Product rule:** If designing 7 or 11 wedges, bump to **8 or 12**. SimCity pies use 8-ish top level + submenus — see `weditor.tcl`.

Reference: [pie-menus-fitts-law.md](pie-menus-fitts-law.md), DDJ 1991, CHI’88 paper (links in [piecraft/RELATED-PROJECTS.md](piecraft/RELATED-PROJECTS.md)).

---

## 7. Automotive product reality (Don @ TomTom)

Don’s TomTom experience (same thread, replies to jstandard):

- Automotive moves at **glacial** pace vs Silicon Valley; factory-integrated, rarely updated
- OEMs invent **proprietary RPC buses** instead of HTTP/JSON — political lock-in over open standards
- Smartphones threatened built-in boxes; SDK degraded to **file drop + poll** instead of real API
- Lesson: even good UX loses to **org chart** — Micropolis web stack avoids that by **client-side holodeck**

Not a reason to abandon pies in **browser Micropolis**; a reason not to expect OEMs to adopt quickly.

---

## 8. Dual-mode pattern (everyone agreed)

Convergent design for cars — applies to **Micropolis play** too:

| Mode | Controls | Attention |
|------|----------|-----------|
| **Driving / editing** | Eyes-free: wheel, voice, **4-wedge pie**, tile frame cursor, edge autoscroll | Minimal screen |
| **Parked / config** | Full touch UI: GPS, playlists, `ToolCatalog` editor, pie layout | Full screen |

Matthaeus: special mode **invoked when you know what you’re doing**; standard UI otherwise.

Micropolis: **curated** totem-pole + pies while building; optional **PieCraft**-style user loadouts when parked ([PIECRAFT.md](piecraft/PIECRAFT.md)).

---

## 9. Shape coding and the SimCity palette

HN thread praised **physical** differentiation (A/C knob ≠ volume knob). SimCity’s answer on **glass + MP**:

| Channel | Recognition |
|---------|-------------|
| Icon **size** | Cost |
| Icon **border color** | Active tool + **remote player** cursor |
| Icon **aspect** (long road, small park) | Tool class |
| Totem layout | **Map** to pie wedge directions |

That is **shape coding on a legend** — palette visible while learning pies, hideable when rehearsed ([simcity-tool-palette-design.md](simcity-tool-palette-design.md)).

---

## 10. MicropolisCore implementation checklist

| Principle from thread | Where it lands |
|----------------------|----------------|
| Self-revealing pop-up | `PieMenuPlugin` + label-to-pointer |
| No blind finger-count | Virtual pointer, not Krenn encoding |
| Saturated gesture space | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| 4–8 wedges, reselection | `PIE-MENU-MODEL` slice directions stable |
| In-world preview | Tile frame + tool apply preview; Sims snap/red |
| Dual mode | Edit mode vs pie/popup mode |
| Persistent affordances | `ToolCatalog` + nine-slice frames |
| Avoid menu warp | [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |

---

## 11. External links

| Resource | URL |
|----------|-----|
| HN thread (2014) | https://news.ycombinator.com/item?id=7328476 |
| Car UI article | https://matthaeuskrenn.com/new-car-ui/ |
| Prototype | https://matthaeuskrenn.com/new-car-ui/prototype/ |
| Shape coding (Chapanis) | https://en.wikipedia.org/wiki/Alphonse_Chapanis |
| Bret Victor rant (cited on HN) | https://worrydream.com/ABriefRantOnTheFutureOfInteractionDesign/ |
| Pie menu FUD (Medium) | https://donhopkins.medium.com/pie-menu-fud-and-misconceptions-be8afc49d870 |
| All The Widgets (CHI’90) | http://www.donhopkins.com/home/movies/AllTheWidgets.mov |

---

## 12. See also

- [piecraft/README.md](piecraft/README.md)
- [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) — shipping macOS shortcut pies (2024)
- [interaction-design-articles-index.md](interaction-design-articles-index.md)
- [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md) — motion vs input decoupling
