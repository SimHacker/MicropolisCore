# Pie menu model — Target, Pie, Slice, Item

**Primary sources:** [jQuery Pie Menus (Don Hopkins MediaWiki)](https://donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus); CMU guest lecture outline (Feb 2019); [gesture-space-and-pie-menus.md](../gesture-space-and-pie-menus.md).

**Implementation in MicropolisCore:** Holodeck `DisplayListEntry` + `PieMenuPlugin`; Svelte `PieTarget` component; `ToolCatalog` maps tools → pie slices. Vitamoo owns GPU wedges, feather, center head ([ui-overlay-encyclopedia.md](../../vitamoo/ui-overlay-encyclopedia.md)).

---

## 1. Terminology refactor

> Instead of calling it a “Pie Menu”, I suggest just calling it a **“Pie”.** — Don, CMU 2019

“Menu” carries hierarchy/tree baggage. A **pie** is a **gestural, direct-manipulation** surface — closer to a **map** or **graph** than a cascading menu.

---

## 2. Model layers

```text
Target (click surface — map canvas, button, Sim)
  └── named Pies (context: tool pie, zone pie, build pie)
        └── Slices (stable directions — N, NE, E, …)
              └── Items (0..n per slice — icons, labels, commands)
```

| Layer | Role |
|-------|------|
| **Target** | DOM/canvas element; `findPie(event)` picks which pie pops |
| **Pie** | Background + overlay HTML; list of slices; optional `onshowpie` |
| **Slice** | Fixed **direction**; dot-product selection vs cursor from center |
| **Item** | Label, icon, command; layout policy per slice |

### Why Pie → Slice → Item (not Pie → Item)

Old **Pie/Item** layouts **re-angle every item** when one item is added — impossible to WYSIWYG edit.

**Pie/Slice/Item:**

- Fix slice count (4, 8, 12) **first**
- Add/remove items **inside** a slice without moving other slices
- Per-slice layout: equidistant icons, justified text, **pull-out** linear strip

Degenerate case: **one slice** + pull-out items = traditional linear menu.

---

## 3. Selection geometry

- **Slice:** angle from pie center to pointer (virtual or direct) — [gesture-space](../gesture-space-and-pie-menus.md)
- **Item:** distance along slice vector, or hit-test on justified/pull-out layout
- **Cancel:** return to center dead zone
- **Reselection:** cross wedges without lifting — no syntax-error regions

**Path does not matter** — only press point and release angle (and optional distance parameter for scrubbers).

---

## 4. Navigation topologies

| Topology | Back action | Best for |
|----------|-------------|----------|
| **Submenu tree** | Explicit “back” wedge or obscure chord | Deep hierarchies |
| **Sibmenu graph** | Opposite wedge = reverse link | Shallow 4/8-way **maps** (Adventure, Method of Loci) |
| **Flat + `findPie`** | Context picks pie | SimCity tool / zone / build |

SimCity totem pole ↔ pie map: [simcity-tool-palette-design.md](../simcity-tool-palette-design.md).

> Pies as **graphs** instead of trees … **Method of Loci / Memory Palaces** — [Don, 2015 email to Simon Gladman](https://donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus)

---

## 5. Tracking & in-world feedback

| Property | Meaning |
|----------|---------|
| **Browsing** | Highlight wedge before commit |
| **Preview** | Reversible effect while hovering (distance = parameter) |
| **Self-revealing** | Labels/icons teach wedges |
| **Display preemption** | Bring selected label **to pointer** ([virtual-pointer](../virtual-pointer-and-pie-cursors.md)) |
| **In-world feedback** | Don’t look at chrome — look at city/Sim ([Sims placement snap](../virtual-pointer-and-pie-cursors.md)) |

**Mouse-ahead / gesture-ahead:** after rehearsal, select without looking at pie — eyes stay on monster/map/Sim.

---

## 6. Roles & skills (CMU 2019)

| Role | Creates pies when | Tools | Literacy expected |
|------|-------------------|-------|-------------------|
| **Programmer** | Build time / dynamic JSON | API, callbacks, jQuery, WASM | High |
| **Designer** | Design time | WYSIWYG, Unity editor, atlas | Fitts basics |
| **Prosigner** | Build time | Visual scripting (Unity, Engi) | Medium–high |
| **Consumer** | Never (uses shipped UI) | Game only | None |
| **Prosumer** (Toffler) | **Runtime** | In-game editor, loadouts | Guided — **PieCraft**, Monster Hunter |

> How do we train users to be prosumer interface designers? **PieCraft** — [Don, 2015](https://news.ycombinator.com/item?id=7263027)

**MicropolisCore default:** **Designer** catalog for city builder; **Prosumer** path optional.

---

## 7. Defining pies (four channels)

| Channel | Audience |
|---------|----------|
| **API** | `collect()` / `findPie(event)` in app code |
| **JSON** | `ToolCatalog`, server-driven wedges |
| **HTML/DOM** | Static wedge markup (OpenLaszlo heritage) |
| **Editor** | Unity / future Svelte pie editor |

Resolve algorithm (jQuery): `defaultPie` → `findPie()` → `pies[id]` → DOM selector → cache.

---

## 8. Micropolis `ToolCatalog` mapping

```typescript
interface ToolCatalogEntry {
  id: string;
  label: string;
  piePath: string[];      // e.g. ['root','zone'] 
  sliceDirection: number; // degrees
  cost: number;           // → palette icon scale
  frameStyleId: string;   // → map cursor FrameInstance
  footprint: number;      // gToolSize
  aspect: 'small' | 'long' | 'medium' | 'big' | 'huge';
  borderColors: [string, string]; // two-color pattern
}
```

Single catalog feeds:

- Left palette (totem pole layout)
- Pie wedges
- [FrameInstance](../ui-frame-nine-slice.md) on map
- MP presence `toolId` → remote cursor color

---

## 9. Holodeck binding

| Display | Layer | Entry kind |
|---------|-------|------------|
| Pie desaturate + feather | `PIE_MENU_BACKDROP` (90) | `ui` |
| Wedges + labels | `PIE_MENU` (100) | `ui` / DOM overlay |
| Center head (Sims) | `PIE_MENU` (100) | `skinned` |
| Pointer while pie open | `POINTER_CURSORS` (115) | `ui` / virtual |
| Tool footprint while editing | `EDITING_TOOL_CURSOR` (71) | `frame` |

---

## 10. Pointers

| Topic | Doc |
|-------|-----|
| Fitts empirics | [pie-menus-fitts-law.md](../pie-menus-fitts-law.md) |
| Patent / marking menus | [pie-menu-patent-fud.md](../pie-menu-patent-fud.md) |
| Browser / extension gap | [pie-menus-browser-extensions.md](../pie-menus-browser-extensions.md) |
| PieCraft game | [PIECRAFT.md](./PIECRAFT.md) |
| Unity / jQuery / MHW | [RELATED-PROJECTS.md](./RELATED-PROJECTS.md) |
