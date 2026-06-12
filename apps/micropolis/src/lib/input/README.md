# `input/` — Virtual Cursor Layer (interface sketch)

> **Status: SKELETON / no implementation.** These files define the **contracts and
> class shapes** for the cross-cutting virtual cursor layer. Method bodies are
> `// TODO` and `throw`. Nothing is wired into the app yet — integration points are
> marked with `TODO(virtual-cursor)` comments in `PieMenu.svelte`, `TileView.svelte`,
> and `routes/+layout.svelte`.

**Design spec:** [`documentation/designs/virtual-cursor-layer.md`](../../../../documentation/designs/virtual-cursor-layer.md)
· Pie consumer: [`virtual-pointer-and-pie-cursors.md`](../../../../documentation/designs/virtual-pointer-and-pie-cursors.md)

## The idea

The virtual cursor is **its own layer**, not a pie-menu feature. It owns the single
source of pointer truth and is usable on its own. Pie menus, map gliding, Sims
placement, multiplayer presence, and accessibility are **consumers** that request and
read it. Normal mode is the default; a toggle button enters virtual "pointer-grab" mode.

## Files

| File | Role | State |
|------|------|-------|
| `types.ts` | Protocols/contracts every consumer agrees on | interfaces ✓ |
| `VirtualPointerController.ts` | The layer: modes, lock, ref-counted activation, cursor publish | skeleton |
| `MapGestureController.ts` | Consumer: pan/zoom/rotate + inertial throw/brake + multitouch handoff | skeleton |
| `gestureMath.ts` | Pure camera/pivot transforms (no state) | skeleton |
| `pointer.svelte.ts` | Svelte 5 runes bridge over the controllers (app glue) | skeleton |
| `CursorLayer.svelte` | Renders the cursor (any size/shape/color; remote presence) | skeleton |
| `PointerGrabToggle.svelte` | The normal↔virtual toggle button | skeleton |

## Build order (later)

1. `VirtualPointerController` + `CursorLayer` + `PointerGrabToggle` + `pointer.svelte.ts`
   → toggleable custom cursor in virtual mode (no consumers yet).
2. `MapGestureController` drag-pan + throw/brake (§5) + edge-autoscroll (§4) → wire into `TileView`.
3. Multitouch pan/zoom/rotate pivot + handoff (§6); make `PieMenu` a `request()` consumer.
4. `PointerEnvironment` forces; MediaGraph slug-graph gliding (§8).
5. Promote the framework-agnostic core to a shared `@micropolis/input` package so
   donhopkins.com and the federation reuse it.
