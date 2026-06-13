# UI Frame (nine-slice borders)

**Purpose:** One flexible, reusable **Frame** primitive for editing-tool cursors, multiplayer pointer halos, window chrome, panels, and subpanels — not ad-hoc rectangles per feature.

**Related:** [unified-webgpu-renderer.md](unified-webgpu-renderer.md) (holodeck layers) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) (pointer vs tile cursor, pie virtual mouse, autoscroll) · SimCity palette legend (two-color tool patterns, X11/Tk).

---

## 1. Model: inner, outer, rim

| Field | Meaning |
|--------|---------|
| **inner** | Content or affected region (tile footprint, client rect, panel body) |
| **outer** | Full frame bounds |
| **rim** | Band between inner and outer — where corners and edges draw |

Coordinates live in a declared **space**:

- `world-tile` — inner from tile AABB; outer = inner + rim in **screen px** (rim applied after projection)
- `screen` — pointers, HUD, window chrome
- `ndc` — fullscreen overlays (pie feather)

```text
  outer ┌────────────────────────┐
        │▓▓▓▓▓ top edge ▓▓▓▓▓▓▓▓│
        │▓┌──────────────────┐▓│
        │▓│                  │▓│
        │▓│      inner       │▓│  ← tiles visible inside (hollow cursor)
        │▓│                  │▓│
        │▓└──────────────────┘▓│
        │▓▓▓▓ bottom edge ▓▓▓▓│
        └────────────────────────┘
```

**Hollow** (`hollow: true`): draw only rim — tool cursor wraps tiles with zero overlap.  
**Filled** (`hollow: false`): draw center too — panel background.

Types: `@micropolis/render-core` → `FrameInstance`, `layoutNineSlice`, `outerFromInner`.

---

## 2. Nine-slice (Unity / CSS border-image style)

Standard 3×3 decomposition:

| Region | Stretch |
|--------|---------|
| Corners | Uniform scale only (1:1), not non-uniform stretch |
| Top / bottom edges | Along horizontal axis |
| Left / right edges | Along vertical axis |
| Center | Both axes (optional; omitted when hollow) |

**Sources:**

1. **Atlas** — texture + `slice` insets in source pixels; GPU draws 9 quads with UVs.
2. **Procedural** — WGSL or 2D path: dual stroke (bright + dark), dashed edges, animated pulse.

All regions scale with a global **`scale`** factor so palette icons and map cursor share the same **screen-pixel** line weight.

---

## 3. Rim policy (zoom, context, accessibility)

`FrameRimPolicy`:

- `basePx` — per-side thickness in screen pixels
- `minPx` / `maxPx` — clamps so zoom never hides or swamps the map
- `scale` — user setting (e.g. **FAT CURSOR** = 2×)
- `zoomCurve` — `constant` | `inverse` | `clamp` (product tuning)

`FrameAnimation` (optional):

- `pulseHz` / `pulseAmplitude` — accessibility emphasis
- `dashOffsetPx` / `dashPeriodPx` — marching ants / selection

Executor applies policy **after** projecting `inner` from tile space to screen, then computes `outer = outerFromInner(inner, effectiveRim)`.

---

## 4. Uses

### 4.1 Editing-tool cursor (tile-snapped)

1. Snap `hoverTile` + `gToolSize[tool]` → **inner** in `world-tile`.
2. Project inner corners to screen → **inner** in `screen`.
3. `outer = outerFromInner(inner, rimPx)` — rim grows **outward** only (nine-slice path).
4. `FrameInstance` with `hollow: true`, procedural dual stroke, tool color from palette catalog.
5. Long tools (road/rail): asymmetric rim or custom atlas with **long** edge aspect (palette legend).

**Center-only variant (no edges):** set slice insets to zero on all sides — the frame is
**only the center cell**, fixed size at **tile pixel resolution** (e.g. a 48×48 hand-drawn
bitmap for a 3×3 tool, authored at exact display size). No stretching; 1:1 blit via
`static` quad or nine-slice degenerate case. Plugs into the same `EditingToolCursorPlugin`
via style id `cursor.tool.center-only` or `cursor.tool.tiled-atlas`.

### 4.2 Pointer / multiplayer

- **All cursor pixels on WebGPU** — local mouse/virtual pointer + **every remote player's
  tile tool frame** (not remote mouse sprites).
- Local tool frame: **fat** rim (`FrameRimPolicy.scale` > 1); remote: **thin** rim, same
  nine-slice or center-only style, player color from catalog.
- Presence interpolation for remote tile anchors ([Liveblocks pattern](https://liveblocks.io/blog/how-to-animate-multiplayer-cursors)) applies to **state** fed to the plugin, not DOM divs.
- Optional small pointer glyph at hotspot for local mouse only (`PointerCursorPlugin`).

### 4.3 Windows, panels, subpanels

- **inner** = client area; **outer** = window rect.
- Atlas: Motif-style beveled borders (HyperLook / X11 screenshots).
- Subpanels: nested frames; each can reference the same style id.

---

## 5. Display list

New entry kind:

```typescript
{ kind: 'frame', instance: FrameInstance, layer: HolodeckLayer.WORLD_FEEDBACK }
```

Holodeck executor (phase C):

1. Resolve bounds to screen if needed.
2. `layoutNineSlice(outer, slice, sourceSize, scale, hollow)`.
3. Emit 4–8 draw calls (corners + edges [+ center]) — atlas UVs or procedural shader.

---

## 6. Style catalog (shared)

| Style id | Use |
|----------|-----|
| `cursor.tool.default` | Procedural dual-stroke nine-slice (hollow) |
| `cursor.tool.center-only` | Center cell only — fixed tile-px bitmap, zero edge insets |
| `cursor.tool.tiled-atlas` | Hand-drawn per-tile-size cursor atlas at native resolution |
| `cursor.tool.road` | Long horizontal rim emphasis (nine-slice) |
| `cursor.tool.zone` | Medium square (nine-slice) |
| `chrome.window.motif` | Atlas nine-slice |
| `chrome.panel.inset` | Hollow + fill |

Palette and pie menu icons reference the **same** style ids so border color = cursor color = legend. Layout rationale (icon size = cost, totem pole = pie map): [simcity-tool-palette-design.md](simcity-tool-palette-design.md).

---

## 7. Implementation phases

| Phase | Work |
|-------|------|
| **Done** | `FrameInstance` types, `layoutNineSlice`, `DisplayListEntryFrame` |
| **Next** | WGSL procedural frame pass (dual stroke, hollow) |
| **Next** | Atlas nine-slice in vitamoo texture factory |
| **Next** | `EditingToolCursorPlugin` → `collect()` frames |
| **Later** | Svelte panel chrome consuming same styles (DOM or canvas) |

---

## 8. API sketch

```typescript
const inner = tileAabbToScreenRect(viewport, tx, ty, size);
const rim = scaleRimPx(policy.basePx, policy.scale ?? 1);
const instance: FrameInstance = {
  space: 'screen',
  bounds: { inner, outer: outerFromInner(inner, rim) },
  source: { type: 'procedural', stroke: toolColor, outline: contrast },
  hollow: true,
  rim: policy,
  animation: fatCursor ? { pulseHz: 1.5, pulseAmplitude: 0.25 } : undefined,
};
```

---

## 9. Success criteria

- Tool cursor and window border use the **same** layout and draw path.
- Rim thickness is readable at min zoom and unobtrusive at max zoom.
- FAT / animated cursor is a policy flag, not a forked renderer.
- Palette icon borders and map cursor share measurable screen-pixel weights.
