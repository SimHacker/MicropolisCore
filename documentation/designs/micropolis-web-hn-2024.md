# Micropolis Web / WASM launch (HN June 2024)

**Primary thread:** [SimCity in the web browser using WebAssembly and OpenGL](https://news.ycombinator.com/item?id=40693944) (June 16, 2024) — [micropolisweb.com](https://micropolisweb.com) · [MicropolisCore](https://github.com/SimHacker/MicropolisCore).

**Don Hopkins (SimHacker)** posted the launch comment, architecture rationale, port lineage, Embind/ChatGPT strategy, educational history, and replies on performance, WIP status, and pie menus.

**Companion (implementation):** [wasm-bridge-and-testing-trajectory.md](wasm-bridge-and-testing-trajectory.md) · [render-core-package.md](render-core-package.md) · [unified-webgpu-renderer.md](unified-webgpu-renderer.md) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md)

---

## 1. What shipped in June 2024 (snapshot)

| Working | Not yet (Don, thread) |
|---------|---------------------|
| WASM simulator + WebGL tile animation | Full city **editing** tools (roads, zones, bulldoze) |
| Zoom/pan + keyboard speed (`1`–`9`) | Pie menus, disasters menu, most chrome |
| **Space Inventory** cellular automata (spacebar) | Disclaimer on site (requested after confusion) |
| Cellular automata + SimCity tile rendering | Mobile polish (Firefox Android freeze reported → [issue #1](https://github.com/SimHacker/MicropolisCore/issues/1)) |

> It's an early snapshot of a work in progress — I just got the simulator and tile engine working, but haven't implemented much more of the user interface yet.

**User confusion (yanslookup):** “Why can't I build?” — answered explicitly: WIP, not broken crypto miner.

---

## 2. Architecture thesis: browser owns UI, WASM owns sim

Don’s counter to **emulated Mac/Windows SimCity in WASM** (stacking OS + x86 emulation + obsolete GUI):

| Anti-pattern | Micropolis Web approach |
|--------------|-------------------------|
| Feed browser input through emulated desktop OS | Read input in browser; inject **primitives** into sim |
| Render inside emulated GUI | **Strip** legacy UI/graphics/sound from engine |
| Ping-pong proxy objects across boundary | **Shared memory** + batch data; minimal thunking |
| DOM for per-frame game HUD (pton_xd concern) | **WebGL/WebGPU** for map; DOM/Svelte for chrome, not per-tile DOM |

> Since the web browser is so much better and more flexible at user interface and graphics stuff, you want to totally strip all of the user interface and graphics and sound out of the game, implement an efficient API and callback mechanism … and implement all of the UI in the browser (especially the animation timers and input handlers), calling back to the simulator only when necessary.

**Tile renderer optimization (June 2024):**

- Shared memory between WASM and WebGL
- Custom shader for native **16-bit column-major** SimCity tile format
- **Two triangles**, **zero copy** to draw the map

**2026 direction:** `@micropolis/render-core` holodeck + pick MRT ([render-core-package.md](render-core-package.md)) extends the same split — GPU compositor in tab, sim in WASM.

---

## 3. Performance and input latency (thread debate)

| Topic | Notes |
|-------|--------|
| **Jyaif** | Browser input latency hurts games |
| **modeless** | `pointerrawupdate`, desynchronized canvas — unreliable in practice; Emscripten SDL path is heavy |
| **Don** | NeWS PostScript UI was slower than JS/WASM yet fine; SimCity never targeted 120 FPS × 50 ticks for *editing* |
| **Speed keys** | `9` → ~120 FPS, 50 sim ticks/frame (fast-forward); `1` → 1 tick/sec — UI still responsive on M1 Chrome |

Don: optimize for **rich browser UX** (WebGL, D3, Grafana telemetry) not raw tick count alone.

---

## 4. Pie menus, Don Norman, and upcoming UI

Don on thread — **pies coming soon** for Micropolis:

- **Mouse-ahead** works even when sim outruns display
- No wasted travel between map and linear tool palette
- **Don Norman** demo ([YouTube 5GCPQxJttf0](https://www.youtube.com/watch?v=5GCPQxJttf0)): pies made SimCity “too easy” — “brilliant solution to the wrong problem”; Don: “Linear menus caused the meltdown. Round menus put the fires out.”

**Demos cited:**

| Platform | Video |
|----------|--------|
| X11 SimCity | https://www.youtube.com/watch?v=Jvi98wVUmQA |
| Flash / Micropolis Online | https://www.youtube.com/watch?v=8snnqQSI0GE |
| NeWS / HyperLook CA in tiles | https://www.youtube.com/watch?v=P8KJ--drZO8 |

Implementation spec: [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) · [simcity-tool-palette-design.md](simcity-tool-palette-design.md) · `apps/micropolis/src/lib/PieMenu.svelte`.

---

## 5. Space Inventory and CA-as-DRM (1991)

**Spacebar** on micropolisweb.com toggles cellular automata rules:

| Rule | Source |
|------|--------|
| Heat diffusion | 8-bit chaotic wrapping “Heat” |
| EcoLiBra | Rudy Rucker / Cellab — Anneal + Life + Brian’s Brain |

**Historical DRM (HyperLook demo):** playable minutes, then CA **melts the city** if no license — [HyperLook SimCity manual](https://www.donhopkins.com/home/HyperLook-SimCity-Manual.pdf), [annotations](https://www.donhopkins.com/home/catalog/simcity/simcity-annotations.html).

**Inspiration:** Game Helpin' Squad — *World Quester 2* UI aspiration ([YouTube 0Gy9hJauXns](https://www.youtube.com/watch?v=0Gy9hJauXns)).

**CAM6 / von Neumann:** Don linked [CAM6 JS](https://github.com/SimHacker/CAM6) and von Neumann constructor theory on thread (Gingold book tangent).

---

## 6. Port lineage (33 years, counting)

Don’s LLM-thread summary — **not instant**:

```text
C64 SimCity
  → NeWS / PostScript UI (1991) — sim/UI split, shared-memory animation
  → X11 / Tcl-Tk — SimCityNet MP, pies, chat, voting
  → OLPC GPL-3 — C++ refactor, SWIG, Python PyGTK + TurboGears/Flash
  → MicropolisCore — Emscripten/Embind, SvelteKit, WebGL → WebGPU holodeck
```

| Milestone | Artifact |
|-----------|----------|
| NeWS API | Network messaging + shared raster lib |
| X11 MP | https://www.youtube.com/watch?v=_fVl4dGwUrA |
| Tcl docs | `notes/TCL.txt`, `notes/CALLBACKS.txt` (legacy) |
| C++ core | [micropolis/MicropolisCore](https://github.com/SimHacker/micropolis/tree/master/MicropolisCore) |
| Doxygen | https://micropolisweb.com/doc/ |
| Embind design | `packages/micropolis-engine/src/emscripten.cpp` (header comments largely ChatGPT-assisted per Don) |
| Reactive bridge | `apps/micropolis/src/lib/MicropolisReactive.svelte.ts` |

**Mac compatibility library rejected (1991):** would have been klunky, proprietary, no NeWS pies/networking/big-screen affordances.

---

## 7. ChatGPT + Embind (how LLMs helped — and didn’t)

Don on **LLM instant port** question:

> I've been using ChatGPT to develop it … anything but instant. In total it took about **33 years** (and counting).

**Useful for:** Emscripten/Embind docs, makefile, public/private method categorization, boilerplate bindings, TypeScript/SvelteKit/WebGL learning.

**Not useful for:** Initial architecture — required NeWS/X11/OLPC experience and iterative human design.

**Quip (JKCalhoun / Don):** “Programmers with LLMs replace programmers without LLMs” — Don avoided “AI” wording for future replacement.

Embind strategy (abridged from `emscripten.cpp` comments):

1. Wrap **core sim** only — not legacy platform render/network I/O  
2. **Direct heap** access to map buffers (`HEAP16`, etc.)  
3. Expose **callbacks** for interactivity  
4. UI via **HTML/CSS/WebGL** in browser  

See [callback-interface-roadmap.md](callback-interface-roadmap.md) · [wasm-bridge-and-testing-trajectory.md](wasm-bridge-and-testing-trajectory.md).

---

## 8. Education, OLPC, and *Building SimCity*

Thread tangent (Don + lioeters) — high value for Micropolis **constructionist** positioning:

| Topic | Link |
|-------|------|
| **Building SimCity** (Gingold, MIT Press June 2024) | https://mitpress.mit.edu/9780262547482/building-simcity/ |
| Gingold reverse diagrams | https://smalltalkzoo.thechm.org/users/Dan/uploads/SimCityReverseDiagrams/ |
| PhD thesis *Play Design* (2016) | https://www.proquest.com/docview/1806122688 |
| **Doreen Nelson** — Design Based Learning, cardboard cities | HN [21049206](https://news.ycombinator.com/item?id=21049206) |
| SimCity Teacher's Guide (Bremer/Curtin) | LGR unboxing — scan TODO |
| **Educational SimCity** proposal (Lall, Columbia) | [archive.org snapshot](https://web.archive.org/web/20050403103131/http://www.donhopkins.com/home/documents/EducationalSimCity/) |
| OLPC / EA GPL-3 | [open-sourcing-simcity (Medium)](https://donhopkins.medium.com/open-sourcing-simcity-58470a27...) |

**Product direction:** export spreadsheets / telemetry → **Grafana**, **D3**; live-code with **Snap!**; plugin zones and monitoring.

---

## 9. Simulator Effect (Miyamoto thread overlap)

Don reposted Will Wright’s **Simulator Effect** on this thread — testers “tuned down” astrological signs with **no behavior code**. Harvested in [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) §3.

---

## 10. Dreamcast port notes (TapamN)

Unfinished **Sega Dreamcast** port ([YouTube MlFu-y1LDbs](https://www.youtube.com/watch?v=MlFu-y1LDbs)):

- Shoulder-button **command palettes** instead of slow SNES-style menus  
- Snap cursor, analog fast pan  
- Power grid uses Logo-turtle walk (stutter) — flood-fill desired  
- Don replied: **CAM6 gutter trick** — extra pixel ring, copy edges, no inner-loop bounds checks ([CAM6 wrapCells](https://github.com/SimHacker/CAM6/blob/master/javascript/CAM6.js))

Relevant if optimizing `powerGrid` on constrained hardware.

---

## 11. Open release philosophy

- Ship early for **cross-platform feedback** (can't own every device)  
- [GitHub issues](https://github.com/SimHacker/MicropolisCore/issues) with stack traces — exemplar: [#1](https://github.com/SimHacker/MicropolisCore/issues/1) Firefox Ubuntu fix  
- [Patreon](https://www.patreon.com/DonHopkins) — labor of love, not primary income  
- Source + WASM inspectable in browser devtools — no crypto-miner bogeyman  

---

## 12. MicropolisCore checklist (post-2024)

| HN promise / gap | Status doc |
|------------------|------------|
| Pie menus | [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |
| Holodeck / WebGPU | [unified-webgpu-renderer.md](unified-webgpu-renderer.md), `@micropolis/render-core` |
| Editing tools + `ToolCatalog` | [simcity-tool-palette-design.md](simcity-tool-palette-design.md) |
| Vitest + reactive bridge | [wasm-bridge-and-testing-trajectory.md](wasm-bridge-and-testing-trajectory.md) |
| Snap! / Grafana export | [moollm-micropolis-integration.md](moollm-micropolis-integration.md), simopolis roadmap |
| Mobile + MP | [multiplayer-browser-lessons.md](multiplayer-browser-lessons.md) |

---

## 13. Related HN / web ports (thread neighbors)

| Project | URL |
|---------|-----|
| Quake 3 in browser (modeless) | https://thelongestyard.link/ |
| OpenArena + Humblenet | https://openarena.live |
| RuneScape RSPS web | https://play.rsps.app/ |
| Neverball | https://play.neverball.org/ |

---

## 14. Pointers

| Resource | URL |
|----------|-----|
| HN story | https://news.ycombinator.com/item?id=40693944 |
| Live site | https://micropolisweb.com |
| Repo | https://github.com/SimHacker/MicropolisCore |
| Demo video 1 | https://www.youtube.com/watch?v=wlHGfNlE8Os |
| Demo video 2 (CA music) | https://www.youtube.com/watch?v=BBVyCpmVQew |
| HAR 2009 lightning talk | [Medium transcript](https://donhopkins.medium.com/har-2009-lightning-talk-transcript-constructionist-educational-open-source-simcity-by-don-3a9e010bf305) |
| Related Don comment (telemetry / Grafana) | https://news.ycombinator.com/item?id=40065764 |

---

## 15. See also

- [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) — prior art: JS moddable UI + strip sim/UI (SC2013); pie menus requested but not shipped
- [platform-lineage-index.md](platform-lineage-index.md)
- [openlaszlo/README.md](../openlaszlo/README.md) — Flash client → Svelte/WASM lessons  
- [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md)  
- [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) — cites same micropolisweb WIP state  
- [interaction-design-articles-index.md](interaction-design-articles-index.md) — pie/cursor articles when UI lands
