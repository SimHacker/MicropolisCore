# Playable game, pie substrate, federated publishing

> **Status: draft — Phase 1 (melting).** This is a cauldron monolith seed. Do **not**
> execute from it directly; it gets *stirred* (more requirements folded in, every turn)
> until the section numbering stabilizes, then *ladled* into topical docs + playbooks.
> See [README.md](README.md) and the `moollm/skills/cauldron/` protocol.
>
> Started: 2026-06-11. Cauldron skill: `moollm/skills/cauldron` (MELT/STIR/LADLE/…).
> Companion ground-truth: [../micropolis-playable-game-readiness.md](../micropolis-playable-game-readiness.md).

---

## 1. Current state (the audit)

Three capable fronts, developed **in parallel as composable layers** — each valuable and
shippable on its own, each deliberately shaped around the same seams so that, as they
mature, they **plug into (and collectively *become*) one environment.** None is *blocked*
on the others; they converge by design.

1. **The game is simulable but not playable.** Working WASM engine, WebGL tile viewer,
   command bus, and a Svelte-5-runes reactive façade exist — but there is **no HUD, no
   tool cursor, no click-to-build, no message/zone/budget UI, and `PieMenu.svelte` is a
   stub** (~1600 lines commented out). The reactive bridge feeds *tests*, not chrome.
   Full evidence: [../micropolis-playable-game-readiness.md](../micropolis-playable-game-readiness.md).
2. **The pie menu — the project's signature interaction — is unbuilt.** The commented-out
   prototype predates the author's fluency with **Svelte 5 runes, modern CSS, and TS
   reactivity**, so it should be **reimagined from scratch**, not uncommented. There is a
   strong *model* ([../piecraft/PIE-MENU-MODEL.md](../piecraft/PIE-MENU-MODEL.md)) and a
   strong *layer spec* ([../virtual-cursor-layer.md](../virtual-cursor-layer.md)) but no
   shippable component, and nothing shared between the Micropolis (tile) and Sims
   (VitaMoo/holodeck) tracks.
3. **The publishing system is half-built and per-site.** The slug/path content-plugin
   convention exists ([../content-plugins-and-autodiscovery.md](../content-plugins-and-autodiscovery.md))
   and `donhopkins.com` is scaffolded, but transclusion, multi-resolution projection, the
   global slug graph, and the auto-discovery generator are not implemented — and the nav
   is a hand-written per-site map.

**The convergence (not a blocker):** the through-line is a **direct-manipulation,
pie-navigable, two-way-linked graph substrate**. It is not a missing prerequisite the three
fronts are stalled waiting on — each progresses independently and is useful today. Rather,
all three are built **around the same seams** (the command bus, the render-core holodeck,
the content-plugin graph, the virtual-cursor layer) so they **compose** as they grow: the
game UI, the content/navigation UI, and the federated sites end up standing on — and
constituting — the same environment. Building the substrate well is *leverage shared across*
the three, not a gate in front of them.

> **Walk-back (2026-06-11, per author).** An earlier draft framed this as a "shared root
> cause" — a single missing substrate that *blocks* all three, such that "building it once
> unblocks all three." **Cancelled.** The three are not blocked; they are parallel composable
> layers that converge by design. Kept visible per cauldron discipline. (See Appendix B.1.3.)

## 2. Target model (the unified vision)

A single **interaction + content substrate** with three faces:

- **A pie/cursor/gesture layer** (Svelte 5, accessible, persistent, user-editable) that
  drives Micropolis tools, Sims content actions, and graph navigation alike — *"a pie is a
  map, not a menu"* ([../piecraft/PIE-MENU-MODEL.md §1](../piecraft/PIE-MENU-MODEL.md)).
- **A graph of content-plugins** (directories with `README.md` + interface files;
  identity = slug, placement = path) that is **two-way linked**, multi-resolution
  (GLANCE → CARD → STONE → README → full), and **transcluded** across federated sites.
- **A playable world** (Micropolis now; Simopolis/Sims and peer games later) that is
  itself just another graph of objects you navigate, edit, and publish with the same
  substrate.

The end state: you **bump nodes to connect/disconnect** them, **pie-navigate** the graph
like a memory palace, **directly manipulate** the map/city/Sims, and **publish**
projections of any of it to any federated site — with one shared codebase
(TypeScript + Svelte 5 + render-core holodeck + command bus).

This is the modern reincarnation of the author's lineage: HyperTIES → NeWS/HyperLook
SimCity → SimCityNet → DreamScape → The Sims Family Album → MediaGraph → iLoci → now.
(See [../family-album-as-storymaker.md](../family-album-as-storymaker.md),
[../collaborative-microworld-lineage.md](../collaborative-microworld-lineage.md),
[../platform-lineage-index.md](../platform-lineage-index.md).)

## 3. Affected surfaces and decisions

| Subsystem | Where | Touched for |
|-----------|-------|-------------|
| Micropolis app UI | `apps/micropolis/src/lib/` (`TileView`, `MicropolisView`, `MicropolisReactive.svelte.ts`, `micropolisCommands.ts`, `CommandBus.ts`, new `ToolState`, `GameHud`, `Toolbar`, overlays) | Pillar 1 |
| Pie/cursor layer | `apps/micropolis/src/lib/input/` (`types.ts` + sketched controllers) → promote to a shared package | Pillar 2 |
| Tile renderers | `packages/tile-renderer/` (WebGL/WebGPU/Canvas) | Pillars 1, 2 |
| Holodeck / compositor | `packages/render-core/` ([../render-core-package.md](../render-core-package.md), [../unified-webgpu-renderer.md](../unified-webgpu-renderer.md)) | Pillars 1, 2 |
| Content pipeline | `apps/micropolis/website/pages/`, `src/lib/server/markdownContent.js`, `siteStructure.json` | Pillar 3 |
| Federation sites | `donhopkins.com` (in `DonHopkins/`), `micropolis{web,home,city,dream,federation}.com` | Pillar 3 |
| Sims/VitaMoo | `packages/vitamoo`, `packages/mooshow`, `apps/vitamoospace` | Pillars 1, 2 (shared substrate) |
| MOOLLM | `moollm/skills/{cauldron,prototype,stone,card,character}`; content-as-hydrogen | Pillars 2, 3 |

---

## 4. Pillar 1 — Playable Micropolis (and beyond)

**Minimal vertical slice** (fully specified, ready to ladle):
[../micropolis-playable-game-readiness.md §6](../micropolis-playable-game-readiness.md#6-prioritized-plan--minimal-playable-vertical-slice)
— Phase A (auto-start sim + HUD), Phase B (`ToolState` + click-to-build + minimal toolbar),
Phase C (messages/zone/budget/disasters). The engine and bridge are **ahead of** the UI;
the work is wiring `poke.doTool()` and callback `$state` into chrome.

**Decision (B.1.1):** ship a **plain `Toolbar.svelte` first**, not the pie menu — fastest
path to playable. The pie substrate (Pillar 2) supersedes it later; the command-bus
metadata (`context:['pie-menu']`) is the seam so toolbar work isn't throwaway.

**Beyond the slice:**
- Renderer selection (WebGL/WebGPU/Canvas) — [../renderer-plugin-roadmap.md](../renderer-plugin-roadmap.md).
- Sprite/disaster overlays (monster, plane, tornado) — engine already simulates them.
- Globe/fish-eye city navigation — [../globe-city-navigation.md](../globe-city-navigation.md).
- Tool palette ↔ pie mapping via one `ToolCatalog` —
  [../simcity-tool-palette-design.md](../simcity-tool-palette-design.md),
  [../piecraft/PIE-MENU-MODEL.md §8](../piecraft/PIE-MENU-MODEL.md).
- Multiplayer / command timeline / Git-as-multiverse —
  [../command-path-collaboration-modes.md](../command-path-collaboration-modes.md),
  [../github-as-mmorpg-multiverse.md](../github-as-mmorpg-multiverse.md).
- Callback/event envelopes for UI, MCP, LLM observers —
  [../callback-interface-roadmap.md](../callback-interface-roadmap.md),
  [../naming-conventions.md](../naming-conventions.md).

## 5. Pillar 2 — The pie / cursor / gesture substrate (fresh Svelte 5)

**Reimagine, don't uncomment.** Build a new component family on two existing specs:

- **Model:** Target → Pie → Slice → Item; selection by angle (slice) + distance (item);
  reselection without lifting; *self-revealing*; *display preemption* (label to pointer);
  *in-world feedback* (look at the city/Sim, not the chrome). Four definition channels
  (API/JSON/HTML/editor); `ToolCatalog` feeds palette + pie + map cursor + MP presence.
  → [../piecraft/PIE-MENU-MODEL.md](../piecraft/PIE-MENU-MODEL.md).
- **Layer:** the cross-cutting **virtual cursor** (pointer-lock, virtual coords, custom
  cursor rendering, edge-proofing, inertial throw/brake, multitouch pan/zoom/rotate
  pivot, environment forces / gliding) — a pie is just one *consumer*.
  → [../virtual-cursor-layer.md](../virtual-cursor-layer.md),
  [../virtual-pointer-and-pie-cursors.md](../virtual-pointer-and-pie-cursors.md),
  [../gesture-space-and-pie-menus.md](../gesture-space-and-pie-menus.md),
  sketched interfaces in `apps/micropolis/src/lib/input/`.

**Self-revealing interaction (the HyperTIES lineage).** Don's HyperTIES (the system that
gave the web its embedded highlighted hyperlink) pioneered techniques we should bring
forward — they apply to pies, links, and the graph navigator alike:
- **Self-revealing, not "intuitive."** A pie *leads* when you pause (pops up to show
  options), *follows* when you mouse-ahead, and *gets out of the way* when you gesture fast
  — **mouse-ahead display preemption.** Every use rehearses the muscle-memory gesture, so
  novices become experts by doing. ("Intuitive" is the wrong word; *self-revealing* is the
  goal — the interface teaches itself.)
- **Definition preview** — the web's biggest missing feature: **preview where a link/node
  goes without navigating to it and losing your context.** HyperTIES showed a link's short
  definition in a pane on single-click, and followed it on double-click. The substrate
  should let any link/wedge/node show a glance/CARD-resolution preview in place.
- **Reveal-all-links / reveal-all-targets** — click the background to highlight *every*
  link at once (text links invert; graphical "embedded menu" targets pop out as
  cookie-cut shapes). Discoverability on demand, zero clutter otherwise.
- **In-world feedback** — look at the city/Sim/graph, not the chrome; the pie/cursor
  feedback happens where your attention already is.
→ canonical history: `DonHopkins/characters/don-hopkins/sites/PRIOR-ART.md`;
[../piecraft/PIE-MENU-MODEL.md §5](../piecraft/PIE-MENU-MODEL.md) (tracking/feedback),
[../four-dimensional-navigation-hci.md](../four-dimensional-navigation-hci.md).

**Svelte 5 / modern-web requirements (new):**
- `$state`/`$derived`/`$effect` for pie state; no global mutable singletons; runes store
  (`pointer.svelte.ts`) wraps framework-agnostic controllers so the core can move to a
  shared package and be reused by Micropolis **and** Sims/VitaMoo.
- Modern CSS (container queries, `color-mix`, `@property`, transforms, `prefers-reduced-motion`),
  scalable cursor layer rendered "any size/shape/color".
- TS-typed `Pie`/`Slice`/`Item`/`Target`/`ToolCatalogEntry` contracts.
- Works in plain DOM **and** on the WebGPU holodeck (`PIE_MENU` layer 100, center head) —
  [../piecraft/PIE-MENU-MODEL.md §9](../piecraft/PIE-MENU-MODEL.md), `vitamoo/ui-overlay-encyclopedia.md`.

**Must serve both content tracks:** Micropolis tools (build/zone/query/bulldoze) **and**
Sims content actions (place/rotate/buy/customize, center-head avatar). Single catalog,
two skins.

**Slot-count discipline — prefer even; pad with inactive; subdivide on overflow** (author's
rule, The-Sims-proven):

- **Prefer even item counts.** **8 is the sweet spot; 2 and 4 are even easier.** Odd counts
  are awkward: items land on **off-axis directions with no name and no mental coat-hook.**
  Even counts map to **orthogonal / opposite compass groups** (N/S, E/W, NE/SW, NW/SE) —
  nameable, learnable, aimable, and mirror-symmetric.
- **Pad odd → even with *inactive* slots.** Bring the count up rather than leaving a lopsided
  pie: **1→2** (the one item gets a half-pie; the other half is inactive), **3→4**,
  **5/6/7→8**, **9→10**, **11→12**. The Sims pie menus do exactly this. Inactive slots keep
  the active items on canonical directions and preserve muscle-memory across similar pies.
- **Overflow (many items): subdivide less-important slices**, don't just grow the ring.
  **Halve a slice's angular subtend** so two items share the space of one (keep the
  important slices full-width; dense-pack the rest). This sits on top of the fixed
  Pie→Slice→Item model — slice count is fixed first, then per-slice layout
  (equidistant / justified / pull-out / now *split*). Submenus are the next escalation
  after in-slice subdivision. → [../piecraft/PIE-MENU-MODEL.md §2](../piecraft/PIE-MENU-MODEL.md)
  (fix slice count first), [§4](../piecraft/PIE-MENU-MODEL.md) (graph/submenu topologies).
  *(Fold this rule back into PIE-MENU-MODEL.md §2 at ladle/serve time.)*
- **Precedent: Blender** caps pie menus at **8 items** and uses a fixed **layout ordering
  convention** that reads well at 8, leaving inactive positions for odd counts. The author
  likes this — adopt the *spirit* (canonical 8-way layout + inactive padding) as the **default
  preset**, not a hard cap.
- **But allow arbitrary item counts.** Don't *limit* — make it *easy to constrain*: the same
  two levers (insert **inactive slices**, **subdivide** slices) let a pie hold any number
  while staying on a coherent layout. 8-way is the recommended default; 2/4/12 are presets;
  N is always allowed.

**The deeper principle — layout stability ⇒ WYSIWYG editability.** Adding or removing an item
must **not re-angle the others.** Stable slot positions across edits give (a) **direct
representation** — the on-screen pie *is* the data model, position-for-position; (b)
**coherence** between the user's mental model and the implementation's data model; and (c)
the precondition for **direct-manipulation WYSIWYG pie-menu editors** (drag an item into a
slot, toggle a slot inactive, split a slot — and what you see is what's stored). This is the
whole reason the model is Pie→Slice→Item rather than Pie→Item (old Pie/Item layouts
re-angle every item when one is added — impossible to edit WYSIWYG).
→ [../piecraft/PIE-MENU-MODEL.md §2](../piecraft/PIE-MENU-MODEL.md); ties to the prosumer /
PieCraft editor in §6 and the persistence/editability requirements in §7.

**Hybrid pie menus — directional (wedge) items + target-based items** (Blender supports
these; adopt). One menu carries **two kinds of item**:

- **Directional ("pie") items** — a *fixed, small* number (default **8**, up to ~12) whose
  hit areas are **wedges radiating to the screen edge.** Enormous Fitts targets (a wedge is
  effectively the whole screen background in its direction); selected by **angle**; fastest
  and most forgiving to hit. The **first / most important ~8 items go here**, in the
  background pie slices.
- **Target-based items** — *any* number, **positioned anywhere**, selected by **hit-testing a
  discrete target** (not by angle). Laid out **above the top item, below the bottom, left of
  the left, right of the right; in rows, columns, or spokes**; or **arbitrarily placed**
  (orbital: planets around the sun, moons around planets). These are the generalization of
  the **"pull-out" strips** (contrast *pull-out* vs. one-direction *pull-down*).
- **Overlap & priority:** target items **overlap** the wedges and take **higher hit-test
  priority** (a small precise target wins where it sits); the wedges fill the remaining
  screen-edge background. So you get both at once — **precise placement for many items** *and*
  **giant forgiving targets for the important few.** (Directional items stay easier to hit
  because their target is huge; that's the point of putting the important ones there.)
- **Model fit:** a Slice may carry a *directional* placement **or** host a *target-based*
  layout (rows / columns / spokes / orbits). Extends per-slice layout
  ([../piecraft/PIE-MENU-MODEL.md §2](../piecraft/PIE-MENU-MODEL.md): equidistant / justified
  / pull-out → now also rows / columns / spokes / orbital) and selection geometry
  ([§3](../piecraft/PIE-MENU-MODEL.md): **angle** for wedges, **hit-test** for targets).

**Blender alignment — follow the good, drop the limits.** Blender's pie-menu support is
exceptionally well thought out; **faithfully follow its lead where it makes sense** —
*especially* its **command-action model (Blender "Operators")**, a direct inspiration that
maps cleanly onto our **command bus** (each item invokes a command-with-metadata;
`context:['pie-menu']` already exists). But **do not copy its unnecessary limitations** —
notably the **hard 8-item cap.** We keep 8 as the default *directional* preset and allow
arbitrary item counts via **target-based items + inactive padding + slice subdivision**
(slot-count discipline above). → command bus in §10;
[../pie-menus-fitts-law.md](../pie-menus-fitts-law.md) (why edge-wedges win).

**Prior art / receipts to honor:** [../pie-menus-fitts-law.md](../pie-menus-fitts-law.md),
[../submenu-aiming-and-fitts-law.md](../submenu-aiming-and-fitts-law.md),
[../kando-cross-platform-pie-menu.md](../kando-cross-platform-pie-menu.md),
[../macos-pie-menu-app-hn-2024.md](../macos-pie-menu-app-hn-2024.md),
[../pie-menus-browser-extensions.md](../pie-menus-browser-extensions.md),
[../automotive-touch-ui-vs-pie-menus.md](../automotive-touch-ui-vs-pie-menus.md),
[../pie-menu-patent-fud.md](../pie-menu-patent-fud.md),
[../piecraft/RELATED-PROJECTS.md](../piecraft/RELATED-PROJECTS.md).

## 6. Pillar 2 (general form) — memory-palace / mind-map graph editor

The pie generalizes from "tool picker" to **the navigation and editing model for a
two-way-linked graph** — an operating environment, not a widget:

- **Pies as graphs, not trees** — sibmenu topology: opposite wedge = reverse link;
  shallow 4/8-way **maps**; **Method of Loci / Memory Palace** navigation.
  → [../piecraft/PIE-MENU-MODEL.md §4](../piecraft/PIE-MENU-MODEL.md).
- **Bump-to-connect / bump-to-disconnect** — direct-manipulation edge creation/deletion
  by dragging nodes together/apart (gesture + virtual cursor + inertial throw/brake).
- **Two-way links** — every edge is navigable both directions and rendered as such
  (MediaGraph/iLoci "roads between cities are conveyor belts you ride," gesture sets belt
  speed; interrupt/brake/throw to another node any time). This is Ted Nelson's Xanadu
  **visible-connection / transclusion** ideal — *links you can see, that go both ways* —
  finally made practical on a git-backed slug graph.
  → [../virtual-cursor-layer.md §8](../virtual-cursor-layer.md),
  [../family-album-as-storymaker.md](../family-album-as-storymaker.md) (five views: Map /
  Road / Pie-menu / Album / Branching-Story).
- **Preview, don't navigate.** Generalize HyperTIES **definition preview** (§5) to the
  graph: hovering/aiming a node shows its GLANCE/CARD-resolution preview in place; you only
  *commit* (open / glide there) on a deliberate second action. You explore the neighborhood
  without losing your spot — the whole point of a memory palace.
- **It's also an outliner / tree, not only a graph.** The same substrate should do for
  collaborative outlining what Sheets did for spreadsheets — Don's long-wished-for "Google
  Trees" (lineage: Engelbart's NLS, Winer's MORE / ThinkTank / Frontier / Radio UserLand
  outliners). Outlines embed in maps and grids and vice-versa; the tree is just a graph with
  a spanning hierarchy. → `DonHopkins/characters/don-hopkins/sites/PRIOR-ART.md`.
- **User-editable** at runtime — the **PieCraft / prosumer** path: consumers become
  interface designers; pies are first-class editable objects. **WYSIWYG drag-and-drop
  pie-menu editors already exist as proof:** Simon Schneegans' **Kando** (cross-platform),
  **Fly-Pie**, and **Gnome-Pie** let users create/edit their own pies by direct manipulation
  — the editing model to emulate (enabled by layout stability, §5).
  → [../piecraft/PIECRAFT.md](../piecraft/PIECRAFT.md),
  [../piecraft/PIE-MENU-MODEL.md §6](../piecraft/PIE-MENU-MODEL.md),
  [../kando-cross-platform-pie-menu.md](../kando-cross-platform-pie-menu.md).
- **Tabbed windows on *any* edge, with pie menus *on the tabs*** — the operating-environment
  layer, and the deepest piece of prior art (Don's NeWS/HyperTIES work, 1988–1991):
  - **Any tab, any edge, any time.** Tabs are not locked to the top; the user drags any tab
    to **top / bottom / left / right**, to any position, and can **assign meaning to each
    edge** (e.g. left = unread / right = read, top = important / bottom = admin — an in-box →
    out-box you drag across). Don't hardcode one edge — *"like a keyboard has all four arrow
    keys."*
  - **Tabs for *all* windows**, including top-level and internal app windows; **mix tabs
    from different apps** in one frame; drag tabbed windows in/out of frames; snap (tile or
    overlap) along tabbed edges; hide a tab to save space.
  - **Pie menus on the tabs** drive window management: pop a pie on a tab (even of a
    fully-covered window) to raise/lower/close (diagonal → confirm submenu)/paste/eval, etc.
  - **Multiple tab rows as navigation:** left tabs select windows, right tabs select
    *children* (sub-dirs / related), top tabs are **breadcrumbs** up the tree; gesture
    left/right on a tab's pie to **slide columns** and descend/ascend — a Finder/NeXT-style
    browser where directories are tabs. (This *is* the graph navigator, in tab form.)
  - **Throw windows; bounce off screen edges** — kinetic window motion shares the
    **inertial throw/brake** physics of the virtual-cursor layer (§5,
    [../virtual-cursor-layer.md §5](../virtual-cursor-layer.md)).
  - Composable "lego" features (tabs + pies + rooms + virtual desktop), as in the NeWS OWM /
    TNT window managers. → **canonical:** [../../notes/PIE-TAB-WINDOWS.md](../../notes/PIE-TAB-WINDOWS.md),
    [../four-dimensional-navigation-hci.md](../four-dimensional-navigation-hci.md).
    *(Receipts: NeWS UniPress-Emacs tab windows 1988; TNT 2.0 drag-to-any-edge tab WM
    1990–91; HyperTIES; Wikipedia "Tab (interface)" credits this lineage. Tabs are
    deliberately patent-free.)*
- The graph nodes **are the content-plugins** of Pillar 3 (slug-identified directories);
  the same graph editor browses the federation, the city, and the Sims neighborhood.
  → [../characters-as-hydrogen.md](../characters-as-hydrogen.md) (characters as the
  highest-valence content-atom that binds everything).

**One structure, many framings — tabs ≡ outline ≡ tree ≡ graph (the PSIBER lesson).**
Multi-edged tabbed windows with subtabs and nested children **are a free-form outliner**; an
outliner is a tree; a tree is a spanning view of the graph. So **one set of operations applies
uniformly** across all of them: **open / close** (expand a node, or collapse it to a tab or
icon), **scale** (point-size × shrink-factor with depth; fish-eye), **nest** (children
*to-the-right* **or** *indented-below* — the two classic outliner layouts), **navigate** (drag
tabs to any edge, slide columns, glide edges), and **direct-manipulate** (drag-and-drop with
consistent semantics). Build these once and every face — game UI, content tree, federation
graph — inherits them.

Don's **PSIBER Space Deck** (1989, NeWS PostScript) is the canonical prior art for exactly
this substrate, 35 years early. It rendered live data structures (objects, arrays, dicts,
processes, canvases) as overlapping **tab-windows** you could open/close, scale, nest
right-or-below, drag onto a stack "spike" to push/pop, **drop-on-self to toggle open/closed**,
**drop-on-element to store**, **drop-on-empty to spawn a new view**; with **peripheral
editors** (step / shift / digit / boolean / scroller / class / canvas) *attached to any node*
— the same idea as our per-plugin **interface files** (CARD / COMMAND / SIMULATION) and
inspectors; **pie menus** for commands; and the **Pseudo Scientific Visualizer**, a recursive
**fish-eye** graph view (arbitrarily deep structure in fixed space, typed icons, mouse-sensitive
zoom targets — the MediaGraph/iLoci ancestor). It even debugged and modified *itself*, live
(the HyperCard/browse-⇄-edit lesson, §7). → PSIBER write-up + screenshots:
`DonHopkins/characters/don-hopkins/sites/PRIOR-ART.md`; fish-eye scaling:
[../globe-city-navigation.md](../globe-city-navigation.md);
[../four-dimensional-navigation-hci.md](../four-dimensional-navigation-hci.md).

**Specific PSIBER techniques to mine** (each maps to a pillar/section):
- **Render-by-recording ("Distillery").** Capture a computed view by redefining the draw
  operators to log device-space output — flattening a complex *generated* display into a
  simple, portable artifact for printing, snapshotting, and **static prerender / SPR2
  screen-snapshots**. The view's *code* stays rich; its *output* exports clean. (§9;
  `the-computer-as-portal.md`.)
- **Metacircular interpreter ⇒ step / animate / replay.** A redefinable trace hook before
  each step enables single-stepping, animation, and replay of execution. Apply to the
  **command bus**: step/animate/replay command streams for debugging, the TiVo
  command-timeline, and LLM-proposal preview. (§7, §10; `command-timeline-git-branches.md`.)
- **Any node can be a button (per-node action handler).** Each object carried its own click
  handler (default = drag-drop; alt = execute). Generalize: any graph node / pie item /
  content-plugin can carry its own action (a `COMMAND.yml`), so "buttons" are just nodes
  with handlers. (§5, §7.)
- **Palettes are editable data.** A command palette was just a dict you open and run with the
  mouse — and you can open each command to see/edit its code. So a **pie/palette is itself an
  openable, editable node**; there's no privileged "menu" type. (§5, §6.)
- **Recursively editable, all the way down.** An editor's own parameters (Step, Shift, even
  the Random button's embedded `{random 0.5 lt}`) are themselves editable nodes with editors.
  Inspectors attach to inspectors — turtles all the way down. (§7.)
- **Live-edit from a side editor.** Select source in an editor and execute it in the running
  context to redefine functions on the fly — hot-reload pies/commands/content without
  restart. (§7 browse-⇄-edit.)
- **Always-readable selection readout + name completion.** A persistent field showed the
  current selection in a comfortable font (so you can read tiny fish-eye labels), and
  keyboard name-completion walked the scope. Apply to **slug/command completion** and reading
  dense fish-eye graph labels. (§6, §8.)
- **Scale policy: min-selectable size; shrink *or* grow with depth.** Labels never shrink
  below a clickable minimum; a shrink-factor > 1 *grows* with depth (inverse fish-eye).
  Accessibility-aware zoom. (§6, §8.)
- **Progressive / parallel rendering + overlay hit-targets.** PSV forked light-weight
  processes to draw parts concurrently, then laid transparent round canvases over the result
  as zoom targets. Render big graphs incrementally (never block), and hit-test via an overlay
  on the rendered holodeck. (§6 perf; §5 target-items; `globe-city-navigation.md` inverse-pick.)
- **Snap-dragging.** Constrained drag with snap-on/snap-off for attaching nodes/tabs (to a
  stack-spike, an edge, or another node) — the mechanic under bump-to-connect and
  tab-to-edge. (§6.)

## 7. Persistence, user-editability, extensibility

- **Persistence:** pies, graphs, loadouts, and edits saved as data (JSON/YAML content
  plugins), versioned in git — *"to exist is to be in git"* (MOOLLM). Cities/universes as
  branches; command timeline as replayable leaves.
  → [../command-timeline-git-branches.md](../command-timeline-git-branches.md),
  [../github-as-mmorpg-multiverse.md](../github-as-mmorpg-multiverse.md).
- **User-editability:** WYSIWYG pie editing (slice count fixed first, items added inside a
  slice — the Pie/Slice/Item refactor exists precisely to make this WYSIWYG-able), graph
  edits via bump-to-connect, content edits via the publishing system.
- **Browse ⇄ edit fluidity (the HyperCard lesson).** Authoring is not a separate app or a
  "design mode" you compile into — the *same* surface flips between using and editing, live.
  HyperCard's superpower was that any user could drop from browsing into authoring and back
  without a context switch. The substrate should make every pie, graph, and content-plugin
  editable in place (subject to permissions), turning consumers into authors (prosumers).
- **The UI *is* hand-designed, data-driven structure — bootstrap with hand-written data,
  then add editors.** The Micropolis **tool palette** and **pie menus** are the worked
  example: each is a *data-driven* UI (a declared structure of slices/items/tools/commands),
  not hardcoded layout. You can **bootstrap the whole system with hand-written data** (author
  the palette/pie/graph as JSON/YAML by hand), get a fully working interface immediately, and
  only *then* build editors on top of that same data. There is **no editor required to ship or
  run** — editing is an additive layer over the canonical data.
- **The UI editor is itself a plug-in component — many editors, not one.** Editing is not a
  privileged global mode baked into the runtime; it's a component you load. So there can be
  **many kinds of UI editing** specialized per situation, context, and application: a
  pie-menu editor, a tool-palette editor, a graph/outliner editor, a content-plugin editor,
  an LLM-driven constructor — each a distinct plugin operating on the relevant data. (Mirrors
  PSIBER's per-node peripheral editors, §6, and "palettes are editable data," §5/§6.)
- **Ship the product without the editor — the HyperLook precedent.** Don's HyperLook (NeWS)
  shipped **SimCity** as a non-editable product with the editor *removed* — a minified binary
  runtime over the same data the authoring tool produced. The bootstrap path generalizes:
  **(1)** hand-write the data → **(2)** add direct-manipulation editors → **(3)** add
  LLM-driven editing/construction/programming over the *same* data → **(4)** strip the editors
  for a lean shipped runtime when desired. Authoring power and a small distributable are not in
  tension; they're stages over one canonical data model. → HyperLook/SimCity prior art:
  `DonHopkins/characters/don-hopkins/sites/PRIOR-ART.md`.
- **A built-in scripting / command language from day one — not optional.** Don's recurring
  thesis (Emacs, HyperCard, NeWS, TCL/Tk, JS all won because they were scriptable): a
  hypermedia/UI system without an extension language inevitably grows "an ad-hoc, bug-ridden,
  slow implementation of half of Lisp" (Greenspun's Tenth Rule). Here the **command bus**
  *is* that language's surface: pie items, graph actions, and Blender-style operators all
  resolve to command-bus commands, scriptable by users and LLMs alike (§10).
- **Extensibility:** prototype/fragment composition (`parents:`), the STONE one-page tier
  and other interface files, MOOLLM skills. New tools/pies/nodes are drop-in plugins.
  → `moollm/skills/prototype/`, `moollm/skills/stone/`,
  [../content-plugins-and-autodiscovery.md](../content-plugins-and-autodiscovery.md),
  `moollm/designs/PROTOTYPE-FRAGMENT-CONFIG.md`.

## 8. Accessibility & ergonomics (cross-cutting, non-negotiable)

- **Fitts's law** (pie wedges = large, edge-proof targets), **steering law** (submenu
  corridors), **Dasher-style** continuous-gesture text/selection for motor accessibility.
  → [../pie-menus-fitts-law.md](../pie-menus-fitts-law.md),
  [../submenu-aiming-and-fitts-law.md](../submenu-aiming-and-fitts-law.md),
  [../dasher-steering-law-accessibility.md](../dasher-steering-law-accessibility.md).
- **Touch-native by design.** Pie menus are **swipe-idiomatic** — a directional flick
  selects a wedge with no precise tap, the best fit for touchscreen input (a real advantage
  over linear context menus on touch). One model serves mouse, stylus, touch, and gamepad
  through the unified pointer.
- **Virtual cursor solves the screen-edge problem** and enables alternate input
  (eye/head tracking, gamepad) feeding the same unified pointer —
  [../virtual-cursor-layer.md](../virtual-cursor-layer.md).
- **Programmable accessibility** (AQuery), classical vs. aesthetic HCI tradeoffs —
  [../aquery-programmable-accessibility.md](../aquery-programmable-accessibility.md),
  [../classical-hci-vs-aesthetic-ui.md](../classical-hci-vs-aesthetic-ui.md).
- **Keyboard + screen-reader parity** (command bus already keyboard-driven; every pie
  action must be reachable without a pointer), `prefers-reduced-motion`, focus management.

## 9. Pillar 3 — Federated publishing substrate

- **Content plugins:** directory = plugin; **slug** (token) = identity; **path**
  (`/`-prefixed) = placement; `README.md` + interface files (CARD/STONE/CHARACTER/
  COMMAND/SIMULATION). Auto-discovery generator (planned) replaces the hand-written site
  map. → [../content-plugins-and-autodiscovery.md](../content-plugins-and-autodiscovery.md).
- **Multi-resolution + transclusion:** one canonical fact, projected at GLANCE/CARD/STONE/
  README/full, transcluded into many sites (the "drain Don's content into donhopkins.com,
  transclude a summary back into Micropolis" pattern already begun). STONE one-page tier:
  `moollm/skills/stone/` and `DonHopkins/characters/stone-librande/STONE.md`.
- **Visible, two-way connections + link previews (Xanadu/HyperTIES, realized).** Transclusion
  shows a **visible bridge** to its origin (Ted Nelson's lifelong ask), links are navigable
  both ways (§6), and every link offers a **definition preview** (§5) — read the destination
  at GLANCE/CARD resolution *inline*, without losing your place. These are the same primitives
  as the graph navigator; the published site is just the graph rendered for readers.
- **Federation:** one global slug space; sites re-map global slugs onto their own paths;
  two-way links across `donhopkins.com` and `micropolis{web,home,city,dream,federation}.com`.
  → `DonHopkins/characters/don-hopkins/sites/FEDERATION.md`,
  `…/PUBLISHING-DESIGN-LANDSCAPE.md`, `…/PRIOR-ART.md`,
  [../characters-as-hydrogen.md](../characters-as-hydrogen.md),
  [../simopolis.md](../simopolis.md).
- **Rendering pipeline:** SvelteKit + mdsvex/remark-rehype; markdown→HTML at prerender;
  embeddable Svelte components / typed fenced blocks (graphs, sims, pies) inside content
  (the powerful "hook into how blocks render" goal). → `apps/micropolis/README.md`
  (content pipeline), `DonHopkins/…/sites/PRIOR-ART.md`.

## 10. Shared code & architecture (one substrate, many faces)

- **render-core holodeck** is the shared compositor for tiles + Sims + pie overlays +
  cursors — [../render-core-package.md](../render-core-package.md),
  [../unified-webgpu-renderer.md](../unified-webgpu-renderer.md).
- **Command bus** is the shared action spine (keyboard, pie, LLM, MCP) —
  `apps/micropolis/src/lib/CommandBus.ts`,
  [../command-path-collaboration-modes.md](../command-path-collaboration-modes.md),
  [../moollm-micropolis-integration.md](../moollm-micropolis-integration.md).
- **Promote shared pieces to packages:** `@micropolis/input` (cursor/gesture/pie),
  `@micropolis/render-core`, content/transclusion package — so `donhopkins.com` and the
  federation depend on MicropolisCore packages (the stated architecture).
- **Naming:** big-endian conventions throughout — [../naming-conventions.md](../naming-conventions.md).

## 11. Where the pillars intersect (the reason this is one cauldron)

- The **pie substrate** (P2) is the **game UI** (P1) *and* the **graph/publishing
  navigator** (P3) — same Target/Pie/Slice/Item, same virtual cursor.
- The **content-plugin graph** (P3) is what the **memory-palace editor** (P2) edits and
  what the **city/Sims** (P1) are instances of.
- The **render-core holodeck** draws tiles (P1), Sims (P1), pies/cursors (P2), and
  content embeds (P3).
- The **command bus** dispatches tool actions (P1), pie selections (P2), and publish/edit
  operations (P3) — and is the LLM/MCP entry point.

## 12. The deep recurring themes (the throughlines every source repeats)

Reading the prior-art papers together — HyperTIES, the PSIBER Space Deck, HyperLook,
the-computer-as-portal, moollm-microworld-os, designing-inward (Miyamoto/Wright) — the *same
handful of ideas* keep resurfacing under different names. They are the spine of the whole
project; every pillar is an instance of them. Naming them keeps the design honest.

- **T1 — Multi-resolution is *one* operation: zoom ≡ level-of-detail ≡ context-assembly ≡
  memory.** The same "pick the right resolution for the current view" idea shows up as
  HyperTIES definition previews, the MOOLLM skill pyramid (GLANCE→CARD→SKILL→README→source),
  the IFF Semantic Image Pyramid (L0–L5), the character pyramid, mipmaps, and our MOOPMAP
  content tiers. *"The architecture matches the camera; zoom is also a memory operation"*
  (moollm-microworld-os). For a **zoomy** environment this is the master rule: zooming the UI,
  choosing a content resolution, and deciding how much context to load are **the same act** at
  different layers. Information is **monotonic going up** (higher tiers add, never destroy) and
  **lossy-aware going down**. (Serves §6 fish-eye/scale, §9 multi-resolution; ties §5 preview.)
- **T2 — Advertised affordances: things declare what they afford; a selector picks among the
  advertisements.** Will Wright (1996): *"objects are all advertising — 'if you're hungry, eat
  me' — it's all data driven."* The Sims do it with OBJf/TTAB; MOOLLM skills with `CARD.yml`;
  PSIBER with per-node click handlers; our **content-plugins** with interface files
  (CARD/COMMAND/SIMULATION). This is the single root under **pie items, the command bus, content
  auto-discovery, and LLM tool-choice**: a pie is a *view of advertised affordances*; the command
  bus *picks among advertised commands*; auto-discovery *reads advertisements*; the LLM *scores*
  them. Build "declare an affordance" once; every surface consumes it. (Unifies §5, §7, §9, §10.)
- **T3 — One source of truth → many targets, each rendered in its native medium; round-trip
  where possible.** The Adventure Compiler emits web/Python/Sims-IFF/dev-tools from one
  adventure; the-computer-as-portal bakes one bundle onto screen/rug/TV/painting/window/album;
  the publishing system emits prerendered HTML *and* an offline PWA from one markdown source;
  HyperLook shipped a stripped runtime from the same data the editor produced; "render-by-
  recording" (§6) flattens a computed view for export. **Transclusion generalized to any
  medium.** The reverse direction exists too (parse IFF back to source). (Serves §9 publishing,
  §7 editor-separable runtime, §6 render-by-recording.)
- **T4 — The Coherence-Engine discipline: nothing hidden; edits are *proposed* as inspectable
  artifacts; the substrate validates and applies; no ghost actions.** MOOLLM: *"everything is
  inspectable — no hidden prompts, memory, or agents"*; the LLM is not an oracle or autonomous
  agent but a **coherence engine** that reads files and emits a reviewable proposal. PSIBER
  inspected and modified itself live; *"to exist is to be in git."* This is exactly how
  **LLM-driven and direct-manipulation editing must work in our environment**: the editor (human
  *or* LLM) proposes a change to the canonical data; it's validated; the user approves; it's
  committed — the command-bus propose→inspect→apply loop, with provenance and never silent
  fabrication. (Serves §7 user/LLM editing, §10 command bus; `command-timeline-git-branches.md`,
  `command-path-collaboration-modes.md`.)
- **T5 — Imply, don't implement; leave room for the user's imagination.** Wright's *Simulator
  Effect* / *Reverse Over-Engineering* (*"implication is richer than simulation"*, the
  astrological-signs anecdote); McCloud's masking (*abstract people, detailed world* — leave a
  space for the reader to project into); HyperTIES self-revealing pies (*lead the novice, follow
  the practiced, get out of the expert's way*). The design economy: a hand-authored,
  data-driven UI that *suggests* depth beats an over-built one; self-revealing previews teach
  without tutorials. Don't build chrome the content can imply. (Serves §5 self-revealing, §4
  playable slice, §7 bootstrap-with-data.)
- **T6 — A nurturing environment, not a killer app — tools first, content second
  (constructionism).** Don's DreamScape *"nurturing environment … fertile ground, not a killer
  app"*; Miyamoto's *"first create the tools necessary for game creation"*; Maxis *"we ship
  tools."* The point of the whole substrate is to **turn consumers into authors** (Papert/Kay/
  Wright lineage) — which is *why* editing is in-place (§7), the editor is a plug-in over
  hand-authorable data (§7), and content is forkable plugins (§9). Corollary — **names are
  K-lines**: choose command/slug/skill names so the name itself activates the right cluster for
  both humans and LLMs (MOOLLM "prompt vocabulary as public contract"); good naming *is* API
  design for a scriptable environment. (Serves §7 scripting/command bus, §9 plugins; values.)

These six are not separate from the pillars — they are the pillars seen edge-on. Pies, tabs,
graph, publishing, and the playable game are each **T1–T6 wearing different clothes**.

## 13. First-ladle plan (what to scoop out once stable)

Likely playbook clusters (to be finalized at LADLE):
1. **Playable slice** — Phases A–C from the readiness doc (already PR-shaped).
2. **Pie substrate v1** — implement `apps/micropolis/src/lib/input/` controllers + a
   `Pie`/`Slice`/`Item` component family; wire Micropolis `ToolCatalog`.
3. **Graph editor v0** — render the content-plugin graph; pie-navigate; bump-to-connect.
4. **Publishing generator** — auto-discovery from frontmatter; multi-resolution projection.
5. **Federation links** — two-way links + transclusion across sites.

The cauldron stays in Phase 1 until §-numbers stabilize; only then do we ladle.

---

## Appendix A. Design wisdom and conventions (cross-cutting)

- **"A pie is a map, not a menu."** Treat radial selection as a gestural, direct-manipulation
  surface — graph topology, not tree hierarchy. (PIE-MENU-MODEL §1, §4.)
- **Path doesn't matter; press point + release angle do.** No syntax-error regions;
  reselect across wedges without lifting. (PIE-MENU-MODEL §3.)
- **Self-revealing, not "intuitive."** UI should *lead → follow → get out of the way*
  (mouse-ahead display preemption); every use rehearses the expert gesture. Provide
  **definition preview** (see a destination without navigating) and **reveal-all-links** on
  demand. The interface teaches itself. (HyperTIES lineage; §5.)
- **A built-in scripting/command language is not optional — design it in from day one.**
  Systems without one reinvent half of Lisp, badly (Greenspun's Tenth Rule). The command bus
  is ours; pies, graph actions, and operators all resolve to scriptable commands. (§7, §10.)
- **Preview, don't navigate; show the bridge.** Let users glimpse a link/node/transclusion at
  a low resolution in place, and render connections as visible, two-way bridges (Xanadu/
  HyperTIES realized). (§5, §6, §9.)
- **One structure, many framings: tab ≡ outline ≡ tree ≡ graph.** A multi-edged tabbed window
  with subtabs *is* a free-form outliner *is* a spanning view of the graph. Implement
  open/close, scale (fish-eye), nest (right or below), navigate, and drag-drop **once**, and
  apply them everywhere. Inspectors/editors **attach to any node** (peripheral controls =
  interface files). Canonical prior art: PSIBER Space Deck (1989). (§6.)
- **Advertised affordances unify pies, commands, plugins, and LLM tool-choice (Wright, 1996).**
  Things *declare what they afford* (Sims OBJf/TTAB, MOOLLM `CARD.yml`, PSIBER per-node handlers,
  our interface files); a selector picks among the advertisements. A pie is a *view of* advertised
  affordances; the command bus *picks among* advertised commands; auto-discovery *reads* them; the
  LLM *scores* them. Implement "declare an affordance" once; every surface consumes it. (§12 T2;
  §5, §7, §9, §10.)
- **Zoom ≡ level-of-detail ≡ context-assembly ≡ memory — one operation, many layers.** Picking a
  UI zoom level, a content resolution (GLANCE/CARD/STONE/README), and how much to load into an
  LLM's context are the *same act*. Tiers add going up (monotonic), are lossy-aware going down.
  *"The architecture matches the camera."* (§12 T1; §6, §9; MOOLLM pyramid, IFF L0–L5.)
- **Imply, don't implement; leave room for projection (the Simulator Effect).** *"Implication is
  richer than simulation."* Abstract people / detailed world (McCloud masking); self-revealing
  previews over tutorials. Don't build chrome the content can imply. (§12 T5; §5, §4.)
- **A nurturing environment, not a killer app — tools first, content second.** The substrate
  exists to turn consumers into authors (constructionism). Names are K-lines: choose
  command/slug/skill names so the name activates the right cluster for humans *and* LLMs — good
  naming is API design. (§12 T6; §7, §9.)
- **Data first, editors second, runtime separable (the HyperLook lesson).** Every UI — tool
  palettes, pie menus, graphs — is hand-designed *data*, so the system bootstraps from
  hand-written data with no editor required. The UI editor is itself a **plug-in component**
  (many specialized editors per context: pie, palette, graph, content, LLM-driven), added
  *over* the data. And the editors are **separable**: ship a lean, non-editable runtime (as
  HyperLook did with SimCity) over the very same data the authoring tools produce. One
  canonical data model; hand-authoring, direct manipulation, and LLM construction are
  interchangeable front-ends to it. (§5, §6, §7.)
- **Editable all the way down; export clean.** Every node is openable and inspectable —
  including the parameters of its own editors (turtles all the way down), and a palette/pie is
  just an editable node, not a privileged "menu" type. Yet any computed view can be *flattened
  by recording its output* into a simple, portable artifact (render-by-recording / the PSIBER
  "Distillery") for prerender, snapshots, and print: rich source, clean export. (§6, §7, §9.)
- **Prefer even pie counts (8 sweet spot; 2/4 easiest); pad odd→even with inactive slots
  (Sims convention: 1→2, 3→4, 5–7→8, 9→10, 11→12); on overflow, subdivide less-important
  slices (halve the subtend) before escalating to submenus.** Even counts give
  opposite/orthogonal compass mnemonics — "mental coat hooks"; odd counts strand items on
  unnameable off-axis directions. (See §5.)
- **User agency over chrome — any tab on any edge, any time; don't hardcode.** Tabs (and
  panels) belong on whichever edge the user wants, reassignable anytime, with user-assigned
  per-edge meaning — *"like a keyboard has all four arrow keys, not one."* Generalizes: the
  substrate offers flexible placement; it does not impose one layout. Pie menus *on the tabs*
  manage windows (raise/lower/close/paste), even when covered. Deep prior art: NeWS/TNT/OWM
  tab windows + pie menus (1988–91), HyperTIES. (See §6;
  [../../notes/PIE-TAB-WINDOWS.md](../../notes/PIE-TAB-WINDOWS.md).)
- **Hybrid pies = directional + target-based items.** A small fixed set of **directional**
  items use screen-edge **wedges** (huge Fitts targets, angle-selected — the important few);
  **target-based** items are placed anywhere (rows/columns/spokes/orbits, hit-test-selected —
  the arbitrary many), **overlapping** the wedges at **higher priority.** Follow Blender's
  excellent pie design and its Operator/command-action model (→ our command bus), but reject
  its limits (no hard 8-item cap). (See §5.)
- **Layout stability ⇒ WYSIWYG editability.** Adding/removing an item must not re-angle the
  others. Stable slot positions make the on-screen pie a *direct representation* of the data
  model, keep the user's mental model and the implementation coherent, and are the
  precondition for direct-manipulation pie-menu editors. Default to a canonical 8-way layout
  (Blender-style) with inactive padding; allow arbitrary N via inactive slices + slice
  subdivision — *constrain easily, don't limit.* (See §5; this is why the model is
  Pie→Slice→Item, PIE-MENU-MODEL §2.)
- **The virtual cursor is a cross-cutting layer, not a pie feature.** Pies, map gestures,
  gliding, multiplayer presence, accessibility all consume it. (virtual-cursor-layer.)
- **Identity ≠ placement.** slug (token) = identity; path (`/`-prefixed) = placement; sites
  re-map. (content-plugins-and-autodiscovery.)
- **One canonical source per fact, projected at multiple resolutions, transcluded into many
  sites.** (federation / characters-as-hydrogen.)
- **Reimagine over uncomment.** The old PieMenu prototype is reference, not foundation.
- **To exist is to be in git.** Persistence, versioning, multiplayer = branches/commits.
- **Toolbar-first for "playable," pie-substrate for "the vision."** Don't block playability
  on the substrate; don't let the toolbar become the ceiling.

## Appendix B. Questions still awaiting a decision

*Every substantive yes/no or pick-one gets an entry with a default, so resolution is never
blocked on remembering to re-ask. Nothing is deleted; resolved items move to B.1.*

### B.1 Already resolved (kept for audit)
- **B.1.1 — Toolbar or pie for the first playable slice?** → **Plain `Toolbar.svelte`
  first.** Pie substrate supersedes it later; command-bus `context:['pie-menu']` is the seam.
- **B.1.2 — Uncomment the old PieMenu or rewrite?** → **Rewrite** fresh in Svelte 5 on
  PIE-MENU-MODEL + virtual-cursor-layer (per user).
- **B.1.3 — Are the three pillars "blocked on a missing substrate"?** → **No** (per author).
  They are **parallel composable layers** that converge by design; each is useful and
  shippable independently. The substrate is shared *leverage*, not a *gate*. (Earlier
  "shared root cause / unblocks all three" framing cancelled — see §1 walk-back.)

### B.2 Still open — not blocking
- **B.2.1 — Where does the shared input/pie code live?** Default: sketch in
  `apps/micropolis/src/lib/input/`, promote to `@micropolis/input` package once it has a
  second consumer (VitaMoo). Revisit at ladle time.
- **B.2.2 — Pie geometry: pure DOM overlay, canvas, or holodeck layer first?** Default: DOM
  overlay for v1 (fastest, accessible), holodeck `PIE_MENU` layer as the GPU path.
- **B.2.3 — Graph-edit data model: extend content-plugin frontmatter, or a separate graph
  file (`GRAPH.yml`/edges)?** Default: edges declared in interface files + derived from
  CARD "combos"/links; revisit when building graph editor v0.
- **B.2.4 — Persistence backend for runtime edits (pies, graph): localStorage, file
  download, git branch, server?** Default: git-as-truth (branch/commit), local scratch for
  drafts; align with command-timeline.
- **B.2.5 — Does the memory-palace graph editor live in MicropolisCore, donhopkins.com, or a
  shared package?** Default: shared package consumed by both; build first inside
  `apps/micropolis` for a real testbed.
- **B.2.6 — Which renderer is the default for the playable slice?** Default: keep WebGL
  (current), add factory later (D1). Don't block the slice on WebGPU.

### B.3 New questions raised by later deep-dives
*(empty — grows during STIR)*

### B.4 Questions confirmed or declined during drafting
*(empty)*

### B.5 Convention for tracking questions going forward
Every substantive question gets logged here with a default answer. Resolutions move from
B.2/B.3 to B.1; nothing is deleted. Drafting-phase confirmations move to B.4. Keep
walk-backs visible: if a decision is reversed, mark the old one cancelled with reasoning.
