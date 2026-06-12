# Virtual Cursor Layer — a cross-cutting input service

> **Status:** Design / interface sketch (no implementation yet). Skeleton code at
> `apps/micropolis/src/lib/input/` references this doc from `// TODO:` comments.
>
> **Thesis:** The **virtual cursor is its own cross-cutting layer**, *not* a pie-menu
> feature. It owns the single source of pointer truth and is usable on its own;
> pie menus, map gliding, Sims placement, multiplayer, and accessibility are all
> **consumers** that read/request it. Normal mode by default; a button toggles
> "pointer-grab" virtual mode where richer behavior becomes possible.
>
> **Author lineage:** Don Hopkins — NeWS/HyperLook & X11/Tk SimCity cursors,
> OpenLaszlo piecursor, iLoci/MediaGraph/DreamScape navigation, Sims placement feedback.
>
> **Companions:** [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md)
> (pie-menu *consumer*), [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md),
> [piecraft/](piecraft/), [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md),
> [DonHopkins sites/FEDERATION.md] (global slug graph → MediaGraph gliding).

---

## 1. The layering (decoupled)

```
        ┌───────────────────────────────────────────────────────────────┐
        │  VirtualPointerController   (the cross-cutting layer)         │
        │  • single source of pointer truth (pos · velocity · gesture)  │
        │  • mode: direct | virtual(locked) | hybrid                    │
        │  • Pointer Lock lifecycle + movementX/Y integration           │
        │  • ref-counted activation (user toggle OR consumer request)   │
        │  • publishes CursorState → CursorLayer (any size/shape/color) │
        │  • PointerEnvironment forces hook (push / attract / glide)    │
        └──────────────▲───────────────▲───────────────▲────────────────┘
        requests/reads │               │               │
        ┌──────────────┴──┐  ┌─────────┴────────┐  ┌───┴──────────────┐
        │ Pie menus       │  │ MapGesture       │  │ Sims placement / │
        │ (one consumer)  │  │ (pan/zoom/rotate │  │ multiplayer /    │
        │                 │  │  throw, gliding) │  │ accessibility    │
        └─────────────────┘  └──────────────────┘  └──────────────────┘
```

**Rule:** No consumer *owns* the layer. The pie menu is a *requester + reader*,
identical in standing to map-gliding or a multiplayer cursor.

---

## 2. Modes & activation

| Mode | Pointer source | Used by |
|------|----------------|---------|
| `direct` | OS `clientX/Y` (+ multitouch points) | normal editing, **multitouch pan/zoom/rotate** |
| `virtual` | Pointer-locked relative `movementX/Y` integrated into `virtualX/Y` | pie edge-problem, single-pointer gliding, custom cursor |
| `hybrid` | Pie open but lock denied | partial-offscreen menu + label-to-pointer fallback |

**Activation is ref-counted.** Virtual mode is on when `userToggle === true` **OR**
`requestCount > 0`. A pie menu does `request()` on open / `release()` on close. The
**global toggle button** flips `userToggle` so the whole app enters virtual mode with
no pie menu involved. (Multitouch gestures stay in `direct` mode — Pointer Lock is
single-pointer; see §5.)

---

## 3. The unified pointer (input abstraction)

Consumers read ONE pointer regardless of source (mouse, locked relative motion,
touch, gamepad, eye-tracker, environment force):

- `x, y` (screen px) · `vx, vy` (px/s, smoothed) · `buttons`
- `gesturePhase`: `idle | down | drag | fling | brake`
- `source`: `mouse | touch | pen | locked | synthetic`

This is why it's a *layer*, not a widget: it's an **input abstraction**.

---

## 4. Reversible, ergonomic autoscroll (direct manipulation)

Edge autoscroll while dragging a tool/selection (improves on X11/Tk constant-step):

- Edge-distance → velocity via a **ramp** (gentle mid-edge, fast at rim).
- Integrated on **real time** (`dt`), bounded max velocity.
- **Reversible & dependable:** stops *immediately* when the pointer leaves the edge
  band or on pointer-up; never "runs away."
- Publishes `viewport.panBy`; the tool/frame cursor stays coherent under intent.

(See [virtual-pointer-and-pie-cursors.md §8](virtual-pointer-and-pie-cursors.md).)

---

## 5. "Throw" the map — inertial pan with immediate braking

Kinetic scrolling as a small state machine on the camera translate:

```
 idle ──pointerdown──▶ drag ──move──▶ drag
   ▲                     │
   │                pointerup (v small) ─▶ idle
   │                pointerup (v large) ─▶ fling ──rAF: pos+=v·dt; v*=friction^dt──▶ (|v|<ε) idle
   └──────────────────────────── pointerdown during fling ─▶ BRAKE (v=0) ─▶ drag (catch the map)
```

- **Throw:** release with velocity → inertial glide (exponential friction decay).
- **Immediate braking:** a new pointer-down during `fling` stops momentum *instantly*
  and hands straight back to **direct drag** — you "catch" the map where it is.
- **Elegant handoff:** the transition fling→catch→drag introduces no jump; drag
  continues from the current camera pose.

---

## 6. Google-Maps-style multitouch: seamless pan + zoom + rotate (pivot)

Single gesture stream over N active pointers; transitions between finger counts are
**seamless** (the "elegant handoff"):

- **1 pointer:** pan (translate by centroid delta).
- **2+ pointers:** about the **centroid pivot**, each frame apply
  - **pan** = Δcentroid, **zoom** = `dist_now / dist_prev`, **rotate** = `angle_now − angle_prev`.
- **Handoff (add/remove a finger):** on pointer add/remove, **rebase** the prev
  centroid/distance/angle to the *current* configuration so the next frame's delta is
  zero — no jump when going 1↔2↔3 fingers or lifting one of two.
- **Pivot math:** keep the world point under the pivot fixed across zoom/rotate
  (`screenToWorld(pivot)` before == after). See `gestureMath.ts`.
- **Inertia:** on last finger up, carry pan (and optionally rotation) velocity into a
  fling (§5); a new touch brakes.

This is the original Google Maps feel: pan, zoom, and rotate compose continuously
around the fingers, and lifting/adding fingers never snaps.

---

## 7. Cursor rendering (its own layer)

The controller publishes `CursorState` (position, size, shape, color, sprite); a
`CursorLayer` renders it — **any size/shape/color**, local + remote. Independent of
every consumer. On the WebGPU holodeck this is the `POINTER_CURSORS` layer (115); in
plain DOM it's an absolutely-positioned overlay.

---

## 8. Environment-driven pointer & MediaGraph gliding (consumer)

`PointerEnvironment` applies **forces** to the virtual pointer / camera:

- scrollbars push, dialogs attract, playground chutes/streams/sumo-cursors.
- **MediaGraph/iLoci gliding:** ride the **edges of the federation node graph**
  (global slugs; relationships from CARD "combos") like **Factorio conveyor belts** —
  gesture sets belt **speed**; you can **interrupt, brake to direct control, or
  throw yourself toward another node/directory** at any time. This is a consumer on
  top of §5 (throw/brake) + the slug graph — *no pie menu required*, but a pie can pop
  on the gliding cursor. (See iLoci design in moollm; FEDERATION.md slug graph.)

---

## 9. Consumers (each independent)

| Consumer | Uses |
|----------|------|
| **Pie menus** | virtual pointer for edge-proof hit-test + label-to-pointer; `request()`/`release()` |
| **MapGesture** | direct multitouch pan/zoom/rotate (§6) + throw/brake (§5) + autoscroll (§4) |
| **Graph gliding (MediaGraph)** | environment forces over the slug graph (§8) |
| **Sims placement** | snap-on-valid / smooth-red-on-invalid (own doc §7) |
| **Multiplayer** | remote presence cursors on the cursor layer |
| **Accessibility** | eye/head tracking, Dasher, gamepad feed the same unified pointer |

---

## 10. Where it should live

Sketch in `apps/micropolis/src/lib/input/` first; promote the framework-agnostic core
(`VirtualPointerController`, `MapGestureController`, `gestureMath`) to a shared package
(`@micropolis/render-core` or a new `@micropolis/input`) so **donhopkins.com and the
whole federation** get the same cursor/gesture layer (FEDERATION.md).

---

## 11. Interface sketch (see `input/types.ts` for the typed contracts)

```typescript
type PointerMode = 'direct' | 'virtual' | 'hybrid';
type GesturePhase = 'idle' | 'down' | 'drag' | 'fling' | 'brake';

interface UnifiedPointer { x:number; y:number; vx:number; vy:number;
  buttons:number; phase:GesturePhase; source:string; }

interface CursorState { x:number; y:number; visible:boolean;
  size:number; shape:string; color:string; sprite?:string; }

interface Camera { x:number; y:number; scale:number; rotation:number; } // world↔screen

// The cross-cutting layer
interface IVirtualPointerController {
  readonly mode: PointerMode;
  readonly pointer: UnifiedPointer;
  setUserGrab(on:boolean): void;           // the toggle button
  request(): () => void;                    // ref-count; returns release()
  attach(el: HTMLElement): () => void;      // returns detach()
  subscribe(fn:(p:UnifiedPointer)=>void): () => void;
  setEnvironment(env: PointerEnvironment | null): void;
}

// Consumers
interface PointerEnvironment { applyForces(p:UnifiedPointer, dt:number): void; }   // §8
interface IMapGestureController {                                                  // §5,§6
  readonly camera: Camera;
  attach(el: HTMLElement): () => void;
  onChange(fn:(c:Camera)=>void): () => void;
  // pan/zoom/rotate about pivot, throw/brake handoff — see MapGestureController.ts
}
```

---

## 12. Implementation phases (later)

| Phase | Work |
|-------|------|
| **P0** | This doc + interface sketches + integration TODOs (current) |
| **P1** | `VirtualPointerController`: modes, lock, ref-count, `CursorLayer`, toggle |
| **P2** | `MapGestureController`: drag-pan + throw/brake (§5) + autoscroll (§4) |
| **P3** | Multitouch pan/zoom/rotate pivot + handoff (§6); pie menu consumes virtual pointer |
| **P4** | `PointerEnvironment` forces; MediaGraph slug-graph gliding (§8) |
| **P5** | Multiplayer presence; accessibility input sources; promote to shared package |
