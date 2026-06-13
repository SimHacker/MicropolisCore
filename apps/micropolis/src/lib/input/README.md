# `input/` — Virtual Cursor Layer (interface sketch)

> **Status: SKELETON / no implementation.** These files define the **contracts and
> class shapes** for the cross-cutting virtual cursor layer. Method bodies are
> `// TODO` and `throw`. Nothing is wired into the app yet — integration points are
> marked with `TODO(virtual-cursor)` comments in `PieMenu.svelte`, `TileView.svelte`,
> and `routes/+layout.svelte`.

**Design spec:** [`documentation/designs/virtual-cursor-layer.md`](../../../../documentation/designs/virtual-cursor-layer.md)
· Pie consumer: [`virtual-pointer-and-pie-cursors.md`](../../../../documentation/designs/virtual-pointer-and-pie-cursors.md)
· Compositing: [`map-compositing-and-measurement.md`](../../../../documentation/designs/map-compositing-and-measurement.md)

## The idea

The **virtual cursor is its own cross-cutting input layer**, not a pie-menu feature.

**`CursorLayer.svelte`** is the high-level handle on everything a cursor is — one component,
**incremental backends**:

| Backend | Phase | What draws tool frame pixels |
|---------|-------|------------------------------|
| **`dom`** (default) | Playable B | DOM/SVG above canvas — same tile clip math as GPU |
| **`webgpu`** | After holodeck | `EditingToolCursorPlugin` on `HolodeckStage` |
| **`both`** | Optional | Parallel DOM + GPU (debug / transition) |

Playable ships **first** on WebGL map + DOM/SVG cursor. Holodeck migration does **not** block
click-to-build. When GPU cursor lands, enable `webgpu` on the same component — no replacement.

Normal mode is the default; a toggle enters virtual "pointer-grab" mode (later).

## Files

| File | Role | State |
|------|------|-------|
| `types.ts` | Protocols/contracts; `CursorPresence`, `CursorBackend` | interfaces ✓ |
| `VirtualPointerController.ts` | Modes, lock, ref-counted activation | skeleton |
| `MapGestureController.ts` | Pan/zoom/rotate + throw/brake + autoscroll | skeleton |
| `gestureMath.ts` | Pure camera/pivot transforms | skeleton |
| `pointer.svelte.ts` | Svelte 5 runes bridge | skeleton |
| `CursorLayer.svelte` | **Coordinator** — DOM/SVG now; WebGPU backend later | skeleton |
| `PointerGrabToggle.svelte` | Normal↔virtual toggle | skeleton |

## Build order

**Playable path (now):**

1. Phase A: HUD + auto-sim (`MicropolisView`).
2. Phase B: `ToolState`, click-to-build, `Toolbar`, command bus.
3. **`CursorLayer.svelte`** — DOM/SVG tile frame + ghost at `hoverTile`; clip via shared
   `MapViewport` / tile-renderer screen↔tile helpers (same math future GPU uses).
4. Phase C: message/query/budget overlays.

**After playable A–C:**

5. `MicropolisMapPlugin` + `TileView` → `HolodeckStage`.
6. Enable `CursorLayer` **`webgpu`** backend + `EditingToolCursorPlugin` + measure store.
7. `VirtualPointerController`, pie menus, multiplayer presence, autoscroll.
