# PieCraft & runtime-editable pies (MicropolisCore)

> *Craft your own pie menus. Design better interfaces. Win the game.*
> — Don Hopkins, [Unity Unite Amsterdam 2012](https://www.youtube.com/watch?v=sMN1LQ7qx9g); name coined in cab to the conference.

**This folder lives in MicropolisCore** because PieCraft, SimCity’s totem-pole palette, multiplayer cursors, and the WebGPU holodeck pie layer are one continuous line of work — not separate concerns.

## Documents


| Doc                                          | Contents                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [PIECRAFT.md](./PIECRAFT.md)                 | Game vision — craftable pie artifacts, combat pressure, UI literacy, business model (2012) |
| [PIE-MENU-MODEL.md](./PIE-MENU-MODEL.md)     | Target → Pie → Slice → Item; roles; sibmenus; Method of Loci                               |
| [cmu-05640-pie-menus-guest-lecture.md](./cmu-05640-pie-menus-guest-lecture.md) | CMU 05-640 Brad Myers class — full slide outline (Definitions / Roles / Future)        |
| [../brad-myers-visual-programming-hn.md](../brad-myers-visual-programming-hn.md) | Brad Myers corpus — Garnet, All the Widgets, VPL taxonomy, HN threads, 05-640 archive   |
| [RELATED-PROJECTS.md](./RELATED-PROJECTS.md) | Unity, jQuery, Monster Hunter, Sims animation lib, aQuery, VoyStick, CMU lecture           |


## How this connects to MicropolisCore (not abstract HCI only)

```text
  PieCraft (research game)          Micropolis / Simopolis (shipping)
         │                                    │
         └──────────┬─────────────────────────┘
                    ▼
         PIE-MENU-MODEL (Target/Pie/Slice/Item)
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
ToolCatalog    HolodeckStage    VirtualPointer
(simcity-      (unified-        (pointer lock,
 tool-palette)  webgpu)          label-to-cursor)
```


| MicropolisCore artifact                                                     | PieCraft / pie lineage                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [simcity-tool-palette-design.md](../simcity-tool-palette-design.md)         | Curated totem pole = **designer** pies; MP cursor legend     |
| [virtual-pointer-and-pie-cursors.md](../virtual-pointer-and-pie-cursors.md) | Virtual mouse, no menu-warp; tile autoscroll                 |
| [ui-frame-nine-slice.md](../ui-frame-nine-slice.md)                         | Tool cursor frames = palette border language                 |
| [gesture-space-and-pie-menus.md](../gesture-space-and-pie-menus.md)         | Angle-at-release, mouse-ahead, saturated gesture space       |
| [automotive-touch-ui-vs-pie-menus.md](../automotive-touch-ui-vs-pie-menus.md) | HN 2014 car UI thread — pies vs blind finger-count gestures |
| [macos-pie-menu-app-hn-2024.md](../macos-pie-menu-app-hn-2024.md) | HN 2024 pie-menu.com — OS shortcuts vs in-game holodeck pies |
| [simcity-2013-willmott-hopkins-correspondence.md](../simcity-2013-willmott-hopkins-correspondence.md) | SC2013: Don offered Unity pies; moddable JS UI parallel |
| [unified-webgpu-renderer.md](../unified-webgpu-renderer.md)                 | `PieMenu` holodeck plugin layer                              |
| [simopolis.md](../simopolis.md)                                             | Lot view + Sims placement snap/invalid feedback              |
| `apps/micropolis` `TileView`                                                | City builder: pies + `ToolCatalog` (target)                  |
| `packages/vitamoo`                                                          | Pie shadow, head, GPU wedges                                 |
| [moollm-micropolis-integration.md](../moollm-micropolis-integration.md)     | Optional: skills/adventures as “pies of commands” for agents |


## External references

- [Unity pie menu demo](https://www.youtube.com/watch?v=sMN1LQ7qx9g) · [Live HTML demo](http://www.donhopkins.com/home/PieMenuDemo/PieMenuDemo.html)
- [jQuery Pie (GitHub)](https://github.com/SimHacker/jquery-pie) · [MediaWiki doc](https://donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus)
- [HN: micropolisweb WASM launch (2024)](https://news.ycombinator.com/item?id=40693944) · [HN: *A New Car UI* — palette + PieCraft (2014)](https://news.ycombinator.com/item?id=7328476) · [HN: Pie Menu macOS app (2024)](https://news.ycombinator.com/item?id=41160268) · [HN: multiplayer cursors (2022)](https://news.ycombinator.com/item?id=31987713)
- [CMU 05-640 guest lecture slides](./cmu-05640-pie-menus-guest-lecture.md) · [Google Slides (2019)](https://docs.google.com/presentation/d/1R9s4EEAwUjI_7A8GgdLYD_U1yUs9omaVqkY9GY-2D78/edit)
- Tom Carden (2012): “PieCraft sounds fun! … no actual bona fide food pies” (LinkedIn thread, quoted in [PIECRAFT.md](./PIECRAFT.md))

## Corpus index

Listed as article **#13** in [interaction-design-articles-index.md](../interaction-design-articles-index.md).