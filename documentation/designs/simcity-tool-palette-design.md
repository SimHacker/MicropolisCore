# SimCity tool palette and pie menu layout

**Primary source:** Don Hopkins (SimHacker), [HN comment on “A New Car UI”](https://news.ycombinator.com/item?id=7328476) (Feb 19, 2014) — parent context on touch-screen controls; this doc extracts the SimCity / pie-menu design argument.

**Screenshot:** [SimCity on Sun workstation (Tcl/Tk/X11 multiplayer)](http://www.donhopkins.com/home/catalog/simcity/SimCity-Sun.gif) — palette as legend for on-map cursors.

**Companion docs:**

| Topic | Document |
|--------|----------|
| Virtual pointer, tile frame cursor, MP | [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |
| Nine-slice frame rim = palette border | [ui-frame-nine-slice.md](ui-frame-nine-slice.md) |
| Gesture space, angle-at-release | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| Fitts numbers | [pie-menus-fitts-law.md](pie-menus-fitts-law.md) |
| Holodeck / WebGPU stack | [unified-webgpu-renderer.md](unified-webgpu-renderer.md) |
| Pie tabs / federation | [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) |
| Tcl/Tk implementation | `micropolis/micropolis-activity/res/weditor.tcl`, `w_editor.c` (`DrawCursor`) |

---

## 1. Design goal: memorably differentiate commands

> Memorably differentiating the possible commands is the reason I designed the layout of the pie menus in SimCity the way I did.

SimCity’s tools differ in **cost**, **function**, **properties**, and **relationships** to each other. The UI should make those differences **obvious and easier to learn** — not flatten everything into indistinguishable squares.

---

## 2. Menu hierarchy (top level → submenus)

**Top-level pie** includes:

| Item | Notes |
|------|--------|
| Magic marker & eraser | Draw on the map |
| Roads & rails | Linear infrastructure |
| Power lines & bulldozer | |
| **Zone** submenu | R, C, I zones; police & fire; query |
| **Build** submenu | Stadium, park, seaport; coal & nuclear power; airport |

Submenus group tools by **semantic neighborhood**, not alphabetically or by arbitrary grid index.

**Web target:** Same wedge grouping in `PieMenuPlugin`; palette `FrameStyle` ids mirror wedge ids so hiding the palette still leaves a learnable pie-only path.

---

## 3. Totem pole palette (spatial map)

The **static tool palette** on screen is laid out to **reflect the pie menu and submenu structure** — a **map to the pies**, not an independent toolbar.

> …foreshadowed the spatial map design I explored with **Method of Loci**, described in another posting.

| Axis | Intent |
|------|--------|
| **Vertical asymmetry** | Differentiate tool *kinds* (totem-pole texture) |
| **Horizontal symmetry** | Reflect *pairs* of similar tools; aesthetic balance |

> If all the tools were the same sized squares arranged in a regular grid, it would be much harder to differentiate them and quickly select the one you want. Instead, they're arranged more like a **bouquet of unique flowers** …

**Implementation:** Icon **aspect** (small / long / medium / big / huge) in atlas + pie wedges; not a uniform `N×M` grid in Svelte toolbar.

---

## 4. Encoding three channels of meaning

| Channel | Meaning | Multiplayer use |
|---------|---------|-----------------|
| **Icon size** | **Cost** of the tool | Glanceable economy |
| **Border color** | **Cursor** color on the map (where tool applies) | See **other players’** active tool |
| **Shape / layout** | Tool class & pie location | Muscle memory, mouse-ahead |

> The borders of the icons are color coded to reflect the cursor you see on the map … useful for **multi player mode** … the tool palette served as a **legend** for the cursors on the screen.

Maps directly to [ui-frame-nine-slice.md](ui-frame-nine-slice.md) (`FrameStyle` per tool) and [virtual-pointer-and-pie-cursors.md §9](virtual-pointer-and-pie-cursors.md) (two-color patterns when pure colors run out).

---

## 5. Artistic process (not user-configurable grids)

> Designing user interfaces this way is an **artistic balancing act**, highly dependent on the set of commands, and requiring a lot of **iteration, testing and measurement** … willingness to explore many alternatives. It is **not** something you can expect end-users to be able to do with their own custom built menus.

**Product implication:**

- Ship a **curated** palette + pie catalog (data-driven, designer-authored).
- Optional **PieCraft**-style player editing is a *game mode*, not the default Micropolis builder (see §7).

---

## 6. Graphics stack binding

```text
ToolCatalog (authoring data)
  ├─ cost → icon scale in palette atlas
  ├─ borderColors → FrameStyle.stroke / outline
  ├─ footprint → gToolSize → editing FrameInstance.inner
  ├─ piePath → [top, zone, build, …] wedge id
  └─ aspect → long | square | huge (road vs park vs airport)

Holodeck plugins read catalog → display-list + DOM palette
```

Palette (DOM or canvas) and map overlays must share **one catalog** so legend semantics never drift.

---

## 7. PieCraft (future / research)

Full vision (2012 Unity, 2014 HN, 2019 CMU): [piecraft/PIECRAFT.md](piecraft/PIECRAFT.md). Data model: [piecraft/PIE-MENU-MODEL.md](piecraft/PIE-MENU-MODEL.md).

Don’s sketch for a game that teaches **UI design literacy**:

- Pie menus as **first-order craftable artifacts** (pick up, edit, nest submenus).
- **Capacity limits** and layout constraints force prioritization (“front row” for frequent commands).
- **Vulnerability while open:** menus can be attacked or pickpocketed; spill contents; player must **mouse ahead** quickly under pressure — same motor skill as combat pies in WoW/Glitch bag UX.

Not in scope for Micropolis v1; documented as rationale for why **curated** layouts beat infinite user grids, and why **mouse-ahead** and **rehearsal** matter ([gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)).

---

## 8. Relation to car touch UI (2014 thread)

The parent HN thread ([*A New Car UI*](https://news.ycombinator.com/item?id=7328476)) criticized **undifferentiated touch strips** and **invisible finger-count gestures** in automotive UI. Don’s counterpoint: **differentiation through layout, size, color, and spatial memory** — the same problem SimCity solved with totem-pole palette + **self-revealing** pies (not blind multitouch). Full harvest: [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md). Applies to Simopolis build mode, vitamoo lot editor, streamer overlay toolbars.

---

## 9. Implementation checklist

| Item | Status |
|------|--------|
| `ToolCatalog` schema (cost, colors, footprint, pie wedge, aspect) | Not started |
| Palette UI mirrors pie grouping | Partial (`Toolbar.svelte` flat list) |
| `FrameStyle` ids shared palette ↔ map cursor | Spec in ui-frame-nine-slice |
| MP: remote cursor color = catalog border | Spec in virtual-pointer |
| Pie submenu structure matches weditor.tcl | Reference impl in micropolis repo |

---

## 10. Pointers

| Resource | Link |
|----------|------|
| HN comment (2014) | Search SimHacker Feb 19 2014 on [item?id=7328476](https://news.ycombinator.com/item?id=7328476) parent car-UI thread |
| Multiplayer demo video | [YouTube SimCityNet](https://www.youtube.com/watch?v=_fVl4dGwUrA&t=5m45s) |
| SimCity catalog | [donhopkins.com/home/catalog/simcity/](http://www.donhopkins.com/home/catalog/simcity/) |
| Interaction corpus index | [interaction-design-articles-index.md](interaction-design-articles-index.md) |
