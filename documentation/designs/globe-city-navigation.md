# Globe city navigation — icosphere, POI-facing rotation, fish-eye magnify

**Status:** Ambitious design / research — not implemented.

**Related:** [render-core-package.md](render-core-package.md) (client GPU, `MapProjection`), [unified-webgpu-renderer.md](unified-webgpu-renderer.md) (holodeck), map-on-sphere UV discussion (cube-sphere / icosahedral charts).

---

## 1. Vision (replace scroll with “slew + magnify”)

Micropolis on a **tessellated icosphere** (or smooth sphere). The player does **not** pan a flat map.

| Flat map today | Globe target |
|----------------|--------------|
| Scroll / drag translates `panX`, `panY` | **Rotate** the sphere so the **point of interest (POI)** — center of screen — is the patch **facing the camera** |
| Wheel zoom scales tile pixels uniformly | **Fish-eye magnify** around POI: local neighborhood grows, distant tiles **slide toward the antipode** smoothly |
| POI ≈ viewport center in tile space | POI ≈ **unit vector** `p` on S²; antipode `a = -p` collects compressed “rest of world” |

**Feel:** like turning a physical globe toward you, then leaning in on one city — without tearing the rectangular `map[][]` storage (still a 2D sim; only **display** is warped).

**Animation:** all rotation and magnify strength interpolate (slerp + eased `k`) so transitions are continuous, not discrete tile jumps.

---

## 2. Coordinate model

### 2.1 Spaces

| Space | Object |
|-------|--------|
| **Simulation** | `map[x][y]` — unchanged rectangular Micropolis grid |
| **Sphere** | Unit directions `q ∈ S²` (Y-up or Z-up — pick one, document once) |
| **Map parameterization** | `mapTile(q) → (u, v) ∈ [0,W]×[0,H]` via cube-sphere, equirectangular, or icosahedral chart ([render-core-package](render-core-package.md) projections) |
| **Screen** | Pixel `(sx, sy)`; POI ray hits sphere at `p` |

### 2.2 POI and antipode

- **`p`**: unit vector from sphere center to the tile under screen center (pick / hover / tool target).
- **`a = -p`**: opposite point — “back of the globe” where compressed distant map collects visually.
- **Camera:** fixed (looks down −Z) **or** orbiting; simplest: **rotate sphere** by quaternion `R` so `R · p₀ = (0, 0, 1)` (POI at front pole in model space).

### 2.3 Rotation (no scroll)

**State:** `R(t) ∈ SO(3)` — orientation of the globe mesh relative to world/camera.

**User drag (trackball):** incremental quaternion from screen drag axis × angle (standard arcball on S²).

**Slew-to-POI:** when focus changes to tile `T`, compute `p_target` from `mapTile⁻¹(T)`, choose `R_target` with `R_target · p_target = ê_z`, **slerp** `R(t)` from current to target over `τ` seconds.

**No translation of map data** — only `R` and magnify uniforms change.

---

## 3. Fish-eye magnify — how to model it

Magnification is a **field on the sphere**: directions near `p` spread apart (more screen area per tile); directions near `a` compress.

Let `q` be a unit direction on the sphere (point to shade). Let `α = acos(clamp(p · q, -1, 1))` — **geodesic angle** from POI (0 at POI, π at antipode).

### 3.1 Radial warp on the sphere (recommended core model)

Remap angle before map lookup:

```text
α' = g(α; k, σ)

q' = rotate_about_axis(p × q, α') / |…|   // direction moved along great circle from p toward q
mapTile = chart(q')
```

Choose **`g`** so:

- `g(0) = 0`, `g'(0) = k` with `k > 1` when “zoomed in” (local stretch),
- `g(π) = π` (antipode stays antipode — rest of map “pushed” around the back),
- smooth and monotonic on `[0, π]`.

**Candidate families (pick one in implementation):**

| Name | Form (sketch) | Character |
|------|----------------|-----------|
| **Stereographic tangent** | `α' = 2 atan(λ tan(α/2))`, `λ ≥ 1` | Conformal near POI; familiar fish-eye |
| **Power warp** | `α' = sign(α) · |α/π|^γ · π`, `γ < 1` magnifies center | Simple uniform; tune γ |
| **Gaussian bump** | `α' = α · (1 + β exp(-(α/σ)²))` | Local boost; falls off toward antipode |
| **Logistic stretch** | `α' = π · σ(k(α/π - 0.5))` | Smooth saturation at poles of *view* |

**Zoom knob:** animate `λ` or `β` (magnify strength), not orthographic FOV alone.

### 3.2 Tangent-plane alternative (equivalent intuition)

1. Project hemisphere facing camera to **tangent plane at POI** (stereographic: `x = tan(α) · u_⊥` where `u_⊥` is unit vector along great circle from `p` to `q`).
2. Apply **2D radial fish-eye** in tangent plane: `r' = f(r)`.
3. Inverse stereographic back to `q'`.

Good for prototyping in CPU; GPU path can use §3.1 directly in WGSL.

### 3.3 Area / tile distortion expectation

- **Cannot** preserve area and conformality globally on a sphere with variable zoom.
- **Design goal:** roughly **readable neighborhood** at POI; antipode region **visible but smaller** (miniature world on the back).
- Simulation still counts **one tile per cell**; only **display sampling density** changes.

---

## 4. Rendering pipeline (holodeck)

```text
Vertex: icosphere position → unit direction q_model
Uniform: R, p (POI in model space after rotation), magnify (k, σ), chart mode
VS/FS:   q_world = normalize(R · q_model)
         q' = warp(q_world, p, k)        // §3.1
         mapTile = chart(q')             // shared sampleMicropolisTile
         color = sampleMicropolisTile(mapTile)
```

- **Same** `map` / `mop` / atlas bindings as flat view — DRY with [map projection layer](render-core-package.md).
- **Depth + pick:** warp must be **inverted** for picking (§5).
- **Icosphere UVs:** optional; warp can run in **direction space** so mesh UV layout matters less than `q`.

**Fullscreen fallback:** ortho + `MapViewport` is `projection: 'screen'` with `k = 1` (identity warp).

---

## 5. Picking and tools (inverse warp)

Forward: `q → g(α) → q' → tile`.

Pick ray: screen → unproject → ray–sphere hit → `q_hit`.

**Inverse (numerical or analytic):** find `q` such that `warp(q) = q_hit` — Newton on α along great circle from `p`, or binary search on α ∈ [0, π].

Then `tile = floor(chart(q))` for bulldoze/query.

**Drag tools:** while dragging, continuously update `p` from under-cursor hit; slew `R` so POI follows (optional) or only update warp center.

---

## 6. Animation model

| Parameter | Interpolation |
|-----------|----------------|
| `R` | Quaternion **slerp**, ease-in-out (city “rolls” into view) |
| `k` (magnify) | Smoothstep or exponential approach to target zoom |
| `p` (moving POI) | Slerp on S² between old and new POI when focus shifts |

**Combined frame:** `R(t), k(t), p(t)` — no discrete pan steps.

**Interaction coupling:** small drag → small `ΔR`; release on tile → short slew + bump `k`; wheel → `k` only (local magnify, minimal reorientation).

---

## 7. UX sketches

```text
        camera
          │
          ▼
    ┌─────────┐
    │  POI ●  │  ← magnified neighborhood (front of sphere)
    │ ╱     ╲ │
    │╱       ╲│
    └─────────┘
          │
    compressed band toward horizon
          │
    opposite hemisphere (antipode) — whole distant map as small cap
```

- **Rotate** = change which city faces you.
- **Magnify** = change `k` around current `p`.
- **No scroll** = no translating `(panX, panY)` in tile space for globe mode.

---

## 8. Ambitious TODO

### Phase G0 — Math prototype (CPU, no GPU)

- [ ] **G0.1** Implement `chart(q)` → `(u,v)` for cube-sphere + equirectangular on unit sphere.
- [ ] **G0.2** Implement `warp(q, p, k)` with stereographic + power variants; plot distortion grid on 2D map unwrap.
- [ ] **G0.3** Inverse warp `q_hit → q` (binary search); verify round-trip error < ½ tile at POI.
- [ ] **G0.4** Slerp animator for `R`, `p`, `k`; record GIF reference for “slew + magnify”.

### Phase G1 — Static globe render (WebGPU)

- [ ] **G1.1** Procedural icosphere mesh + `MicropolisMap` holodeck plugin `projection: 'sphere'`.
- [ ] **G1.2** WGSL: direction warp uniforms + shared `sampleMicropolisTile`.
- [ ] **G1.3** Trackball rotation + wheel → `k` only; no `MapViewport.panX/Y` in globe mode.
- [ ] **G1.4** Visual regression: POI at equator vs near chart seam; antipode not clipped.

### Phase G2 — POI-facing + smooth animation

- [ ] **G2.1** Click tile → compute `p_target`; slew `R(t)` so POI faces camera (τ ≈ 300–600 ms).
- [ ] **G2.2** Animate `k(t)` on focus (default magnify ~1.5–2.5× effective at center).
- [ ] **G2.3** Optional: POI follows cursor with damped slerp (SimCity “inspect orbit”).
- [ ] **G2.4** Easing presets: `easeOutCubic` rotation, `easeInOut` magnify.

### Phase G3 — Interaction parity with flat play

- [ ] **G3.1** Inverse pick for tools (bulldoze, query, zone paint) on warped sphere.
- [ ] **G3.2** Sim sprites in world-pixel space: billboard + same warp or approximate tile anchor.
- [ ] **G3.3** Floor-grid feedback overlay in tangent space at POI.
- [ ] **G3.4** Toggle flat ↔ globe in same `HolodeckStage` (`projection` switch, shared map buffers).

### Phase G4 — Polish and catalog

- [ ] **G4.1** Icosahedral atlas option (less seam artifact than equirectangular).
- [ ] **G4.2** Streamer-friendly: lock POI on mayor house / disaster; cinematic auto-orbit.
- [ ] **G4.3** Headless Chromium capture of globe views for catalog (client GPU path).
- [ ] **G4.4** Document chosen `g(α)` in [ui-overlay-encyclopedia](../vitamoo/ui-overlay-encyclopedia.md) if pie menu opens on globe (desaturate around screen center = POI).

### Phase G5 — Research spikes (optional)

- [ ] **G5.1** Compare stereographic vs power warp for **tile readability** (A/B with real `all.png` atlas).
- [ ] **G5.2** Equal-area hybrid: magnify only within α < α₀, compress α > α₀ toward antipode with area budget.
- [ ] **G5.3** Multi-chart POI: local planar patch (gnomonic) when k > k_threshold, blend to global warp at horizon.

---

## 9. Open questions

| Question | Notes |
|----------|--------|
| Fixed camera vs orbiting eye? | Fixed + rotate sphere is simpler for fish-eye centered on screen middle |
| Does sim logic need globe topology? | Display-only first; wrap/torus sim is separate feature |
| Max magnify before pick breaks? | Cap `k`; inverse warp more iterations near antipode |
| Wheel vs pinch on mobile? | Pinch → `k`; two-finger rotate → `ΔR` |
| Pie menu on globe? | POI = menu center; desaturate uses same forward warp for background sample |

---

## 10. Success criteria

- User can **rotate** the city into view without panning a flat plane.
- **Wheel / pinch** magnifies **local** tiles at screen center; opposite side of sphere visibly **compresses** toward antipode.
- Transitions are **smooth** (slerp + eased `k`), not stepped tile scroll.
- Tools hit the **correct tile** under warp (inverse map).
- Runs entirely in the **browser WebGPU** path ([render-core-package §0](render-core-package.md#0-client-gpu-first-browser-composes-server-describes)).

---

*This doc is the place for globe navigation experiments; fold stable choices into `MapProjection` in render-core when G1 lands.*
