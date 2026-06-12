# Virtual pointer, pie menus, and environment cursors

> **⚠️ Refactor note (2026-06-07):** The **virtual cursor is now specified as its own
> cross-cutting layer** in **[virtual-cursor-layer.md](virtual-cursor-layer.md)** —
> usable without pie menus, with pie menus as just one *consumer*. Treat **this**
> document as the **pie-menu + tile-cursor consumer** of that layer (pie wedge
> hit-testing, tool/frame cursor, palette↔cursor design, Sims placement, multiplayer).
> The §4 "Virtual mouse" material here is the seed of the layer; the canonical,
> decoupled spec (modes, ref-counted activation, inertial throw/brake, multitouch
> pan/zoom/rotate handoff, MediaGraph gliding) lives in virtual-cursor-layer.md.

**Author lineage:** Don Hopkins — HyperLook/NeWS SimCity, X11/TCL/Tk multiplayer SimCityNet, OpenLaszlo Micropolis Online, Sims placement feedback.

**Purpose:** Specify how **pie menus** and **tile editing frames** *consume* the
[virtual cursor layer](virtual-cursor-layer.md) — pie wedge hit-testing, the
tile-snapped tool/frame cursor, palette↔cursor unification, Sims placement feedback,
and multiplayer presence — on the WebGPU holodeck.

**Companion docs:**

| Topic | Document |
|--------|----------|
| Nine-slice frames (tool cursor, chrome) | [ui-frame-nine-slice.md](ui-frame-nine-slice.md) |
| Holodeck layers, display list | [unified-webgpu-renderer.md](unified-webgpu-renderer.md) |
| Gesture space, angle-at-release | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| Pie shadow, center head | [vitamoo/ui-overlay-encyclopedia.md](../vitamoo/ui-overlay-encyclopedia.md) |
| Pie tabs / federation shell | [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) |
| PieCraft, Target/Pie/Slice/Item | [piecraft/README.md](piecraft/README.md) |
| SimCity totem-pole palette | [simcity-tool-palette-design.md](simcity-tool-palette-design.md) |
| Car touch UI vs self-revealing pies | [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md) ([HN 7328476](https://news.ycombinator.com/item?id=7328476)) |
| macOS Pie Menu app (shortcut radials) | [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) ([HN 41160268](https://news.ycombinator.com/item?id=41160268)) |
| micropolisweb launch — pies “soon”, Norman anecdote | [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md) ([HN 40693944](https://news.ycombinator.com/item?id=40693944)) |
| Multiplayer cursor smoothing | [Liveblocks — How to animate multiplayer cursors](https://liveblocks.io/blog/how-to-animate-multiplayer-cursors) · [HN 31987713](https://news.ycombinator.com/item?id=31987713) (Don Hopkins comment) |

**Reference implementations (read the code):**

| Platform | Role | Path |
|----------|------|------|
| **X11 / Tcl/Tk** | Multiplayer, tile cursor, edge autoscroll, pie menus | `micropolis/micropolis-activity/src/sim/w_tk.c` (`TileAutoScrollProc`), `w_editor.c` (`DrawCursor`), `res/weditor.tcl`, `res/micropolis.tcl` |
| **HyperLook / NeWS** | Bitmap map scaled arbitrarily; cursors drawn in **pixel** resolution over tiles (PostScript) | HyperLook edition screenshots; not the Tk multiplayer line |
| **OpenLaszlo / Flash** | Web pie cursor tracking | [openlaszlo/classes/piecursor.lzx](../openlaszlo/classes/piecursor.lzx) |

---

## 1. Two historical platforms (do not conflate)

| | **HyperLook (NeWS, PostScript)** | **X11 / Tcl/Tk multiplayer** |
|---|----------------------------------|------------------------------|
| Map | SimCity map **bitmap** scaled to any resolution | Tile editor + pan/zoom |
| Cursor | Drawn in **screen pixels** over scaled bitmap | **Tile cursor** (`tool_x`, `tool_y`) + palette legend |
| Multiplayer | — | Color/shape-coded tools; remote cursors on map |
| Pie / palette | Mac palette image (HyperLook) | **Unified** palette ≡ pie icons; two-color patterns |

The WebGPU target follows the **X11/Tk** model for editing (tile-snapped **frame** cursor, tool colors) plus modern **pointer lock / virtual mouse** for pies — not warping the OS cursor to fit a clipped menu.

---

## 2. Graphics stack: layers that support gestural UI

```text
┌─────────────────────────────────────────────────────────────┐
│  Svelte / DOM: tabs, HyperCard stacks, chat, modal chrome   │
├─────────────────────────────────────────────────────────────┤
│  HolodeckStage (WebGPU)                                      │
│    POINTER_CURSORS (115)     screen px — local + remote       │
│    PIE_MENU (100)            desaturate, feather, wedges      │
│    EDITING_TOOL_CURSOR (71)  nine-slice frame, tile-snapped  │
│    WORLD_FEEDBACK (70)       highlights, invalid tint         │
│    MICROPOLIS_MAP (40)       pick idType 7                    │
│    … terrain, characters …                                   │
└─────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │ MapViewport                  │ FrameInstance + presence
         │ screen↔world-tile            │ (render-core)
```

**Design rule:** Input logic owns **virtual pointer state** and **tile anchor**; plugins only **render** what input publishes each frame. Pie menus never require the compositor to “guess” cursor semantics.

See [unified-webgpu-renderer.md §2–3](unified-webgpu-renderer.md) and [ui-frame-nine-slice.md](ui-frame-nine-slice.md).

---

## 3. Cursor layers (recap)

| Layer | Space | Notes |
|--------|--------|--------|
| **Pointer** | Screen pixels | Arrow, remote players, pie tracking dot when in virtual mode |
| **Editing tool** | Tile footprint + **screen-px** rim (`FrameInstance`, hollow) | Snaps to grid; does not warp with pie menu repositioning |
| **Placement preview** (Sims / lots) | World + screen | Valid = snap; invalid = smooth follow + red tint (§7) |

Palette and pie menu icons share **style ids** and **two-color patterns** (§6).

---

## 4. Virtual mouse (pointer lock / relative motion)

### 4.1 Problem

Classic pie toolkit behavior when the menu is near a screen edge:

1. **Reposition menu** to stay on-screen, and  
2. **Warp OS mouse** by the same delta so the vector from menu center to cursor is unchanged.

That breaks when the browser **denies pointer lock**, when warping is impossible (security), or when warping feels like a violation of user motor model.

### 4.2 Solution: virtual pointer mode

On pie popup **with** `requestPointerLock()` (or equivalent) success:

- Hide or decouple OS cursor visualization.
- Maintain **`virtualX`, `virtualY`** in screen space, updated from **`movementX` / `movementY`** (relative motion).
- Pie hit-testing uses **virtual** position vs menu center (angle-at-release unchanged — [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)).
- **Do not** move the menu to compensate for edge clip — menu stays at pop-up anchor; virtual pointer moves freely.

On dismiss: release pointer lock; sync OS cursor to virtual position if the platform allows.

### 4.3 Modes

| Mode | When | Pointer source |
|------|------|----------------|
| `direct` | No pie; normal editing | OS `clientX/Y` |
| `virtual` | Pie open + lock granted | Relative motion integrator |
| `hybrid` | Pie open, no lock | See §5 fallbacks |

### 4.4 Environment-driven pointer (playground / Sims)

The pointer (or a separate **avatar cursor** sprite) can be a **dynamic object**:

- OpenLook scrollbars that **push** cursor Y while dragging thumb.
- Alert/dialog **pop-out** that **attracts** cursor to default button (historical “warp to dialog” — prefer **virtual** offset so OS cursor is not stolen when lock unavailable).
- Multiplayer “playground”: chutes, streams, vehicles, cannons, **sumo cursors** that collide and scatter particle cursors ([Liveblocks article](https://liveblocks.io/blog/how-to-animate-multiplayer-cursors) for smoothing remote trails).

Implement as **`PointerEnvironment`** forces applied to `virtualX/Y` or to presence records — still rendered on `POINTER_CURSORS` layer.

---

## 5. Pie menu policy flags (no lock)

Orthogonal configuration (names TBD; intent fixed):

| Flag | Meaning |
|------|---------|
| `clampMenuToViewport` | If true, slide menu inside screen on pop (may pre-select wrong wedge without virtual mouse). Default **false** when virtual mode available. |
| `allowPartialOffscreenMenu` | Pop at true position even if clipped; user may select blindly or via label mitigations (§6). Preferred when lock denied. |
| `preferVirtualPointer` | Try pointer lock before clamping or warping. |
| `warpOSCursorOnMenuReposition` | Legacy X11 behavior; default **false** on web. |
| `animateLabelToPointer` | “Bring the mountain to Muhammad” (§6). |

**Bad fallback:** reposition menu **and** leave OS cursor fixed → accidental pre-selection.  
**Better fallback:** partial clip + **label sticks to pointer** + audio/haptic wedge change.

---

## 6. “Bring the mountain to Muhammad” (pie labels)

**Principle:** User attention stays on the **pointer**. Do not ask the eye to jump to a wedge label at the rim.

When the virtual (or direct) pointer enters a wedge:

1. **Animate** the selected item’s label **to the pointer** (smooth, short).
2. Label **sticks** to the pointer while that wedge remains active (“booger you can’t flick off” — visceral confirmation).
3. On wedge change: previous label **snaps back** (quick, direct); new label **slides** to pointer.

Same philosophy as Unity pie menus cited in product notes. GPU: `ui` text quads or DOM overlay above canvas; holodeck pie wedge pick still uses angle from center.

Cross-ref: [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) (preview / reselection without path dependence).

---

## 7. Sims-style placement feedback (valid vs invalid)

| State | Motion | Visual |
|--------|--------|--------|
| **Valid** placement | **Snap** immediately to legal pose (no slippery lerp between valid sites) | Normal tint |
| **Invalid** | **Continuous** follow pointer | Red tint + tooltip (why disallowed) |

Especially important for **wall-only** objects (windows, doors, paintings): slide along forbidden interior/exterior, then **SNAP SNAP SNAP** along the wall when valid.

Maps to `WORLD_FEEDBACK` layer + optional `FrameInstance` preview; not the tile bulldozer cursor.

---

## 8. Good autoscroll (tile cursor, not mouse warp)

SimCityNet tuned autoscroll on the **tile cursor** while dragging tools — not by warping the mouse.

**Reference (Tk):** `w_tk.c`:

- `AutoScrollEdge`, `AutoScrollStep`, `AutoScrollDelay`
- `TileAutoScrollProc`: when pointer near view edge during `tool_mode`, pan map and **adjust `tool_x`/`tool_y`** by pan delta so the editing frame stays under the user’s intent.

**Web target (improve on constant step):**

- Edge distance → scroll velocity curve: **gentle ramp** mid-edge, **high speed** at rim (road/rail drag).
- Integrate on **real time** (`dt`), not “per redraw”.
- Reversible, bounded max velocity; stop immediately when pointer leaves edge band.
- Cancel on pointer-up; no runaway “10000 mph” scroll.

Publish `viewport.panBy` from input; `EditingToolCursorPlugin` only reads snapped tile anchor.

---

## 9. Palette ↔ cursor unified design (X11/Tk)

Full layout rationale (totem pole, cost→size, palette as pie map): [simcity-tool-palette-design.md](simcity-tool-palette-design.md) (Don Hopkins, HN 2014).

- **Pure colors** for primary zones: R/C/I → green / blue / yellow (already global in sim).
- **Two-color patterns** for tools that need distinction without consuming the palette: e.g. gray–white road, gray–brown rail, gray–blue seaport, green–brown park — “read like resistor color bands.”
- **Icon aspect** encodes tool class: small (park, query), **long** (road, rail), medium (zones, services), big/huge (power, airport) — totem-pole **texture** so pies and palette are learnable as one map ([SimCityNet demo](https://www.youtube.com/watch?v=_fVl4dGwUrA&t=5m45s)).

`FrameStyle` catalog: `cursor.tool.road` uses long horizontal rim; palette icon uses same stroke weights ([ui-frame-nine-slice.md §6](ui-frame-nine-slice.md)).

---

## 10. Multiplayer presence

| Channel | Payload | Render |
|---------|---------|--------|
| Presence (throttled) | `screenX`, `screenY`, `toolId`, `playerId`, optional `tileAnchor` | `POINTER_CURSORS` + spring smoothing |
| Optional ghost frame | `tileAnchor`, `toolSize` | Faint `EDITING_TOOL_CURSOR` |

Do not require X11-style synchronous broadcast for local feel; use prediction + interpolation ([HN discussion](https://news.ycombinator.com/item?id=31987713)).

---

## 11. TypeScript contracts (target)

```typescript
/** Browser Pointer Lock + relative motion; see MDN Element.requestPointerLock */
interface VirtualPointerState {
  mode: 'direct' | 'virtual';
  x: number;
  y: number;
  /** Cumulative when mode === 'virtual' */
  locked: boolean;
}

interface PieMenuPolicy {
  clampMenuToViewport: boolean;
  allowPartialOffscreenMenu: boolean;
  preferVirtualPointer: boolean;
  warpOSCursorOnMenuReposition: boolean;
  animateLabelToPointer: boolean;
}

interface EdgeAutoscrollPolicy {
  edgePx: number;
  maxVelocityPxPerSec: number;
  /** distance from edge → [0,1] ramp into maxVelocity */
  ramp: (t: number) => number;
}
```

Live in `apps/micropolis` input controller first; optional move to `@micropolis/render-core` when shared with vitamoo.

---

## 12. Implementation phases

| Phase | Work |
|-------|------|
| **P0** | Document + `HolodeckLayer` pointer/tool (done) |
| **P1** | `VirtualPointerController` in `TileView` / pie component |
| **P2** | `EditingToolCursorPlugin` → `FrameInstance` + edge autoscroll on `MapViewport` |
| **P3** | Pie plugin: virtual hit-test, label-to-pointer animation |
| **P4** | Presence cursors + optional ghost tile frame |
| **P5** | Environment forces (playground, sumo) — experimental |

---

## 13. Success criteria

- Pie at screen edge: **no** OS cursor warp; virtual pointer selects intended wedge.
- Road drag at edge: smooth, controllable autoscroll; tile frame stays coherent.
- Remote user: recognizable tool color/shape without reading username.
- Invalid Sims placement: smooth red slide; valid: hard snap.
- Same `FrameInstance` draws tool cursor and window subpanel borders.
