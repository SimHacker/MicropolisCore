# UI overlay encyclopedia

Reference behavior for **selection marker** (diamond / arrow above the active character), **pie-menu center head**, **feathered desaturated shadow**, **censorship / modesty overlay** (mesh-driven mosaic rects), and **speech / thought bubbles with on-screen text** (MMO-style chat). Self-contained: **formulas, timings, layout rules, and checks** only—enough to reimplement the look in any renderer.

**Scope:** numbers, transform order, lighting, timing, and verification targets. **Not** a commitment that VitaMoo already implements all of this.

**Related:** [webgpu-renderer-design.md §3.9](./webgpu-renderer-design.md#39-pie-menu) (compositing plan), [webgpu-renderer-design.md §3.11](./webgpu-renderer-design.md#311-censorship-mesh-bounding-box-pixelization) (censor rects / mosaic pass), [webgpu-renderer-design.md §6](./webgpu-renderer-design.md#6-static-mesh-interchange-gltf-and-plug-in-plumb-bobs) (glTF static meshes), [gltf-extras-metadata.md](./gltf-extras-metadata.md) (optional `extras`).

---

## Subsystems (conceptual)

| Subsystem | Role |
|-----------|------|
| Selection marker | Small 3D mesh above the **head bone** of the selected character; spins on a timer; often uses a dedicated directional light and tinted ambient. |
| Pie menu head | Only **head** geometry, deformed in **bone-local** (or equivalent) space, drawn at the **center** of the pie widget in screen space, with its own ambient and motion. |
| Round shadow | Circular region on the composed frame: **desaturate** interior, **feather** the rim, respecting **depth** so the effect sits **behind** the overlay plane. |
| Speech bubble | **Dialogue** anchored above the speaker: chrome (outline + fill + tail), **wrapped text**, timed display, queue when multiple lines arrive. |
| Thought bubble | **Inner monologue / UI hints**: visually distinct chrome (e.g. cloud puffs vs solid tail), same layout and queue rules as speech unless product differs. |
| Censorship overlay | **Modesty / policy** when the body is uncovered: bone-attached **bounding meshes** or suits drive **2D rects** for mosaic or pixelization; excluded from **pie-menu head** and often from **normal textured body** draw—see §5. |

---

## 1. Selection marker

### 1.1 Anchor

- **Bone:** head (canonical name in many rigs: `HEAD`).
- **World anchor:** origin transformed by the head bone’s world transform, including whatever **group / root** transform applies to the character instance.
- **Screen projection:** same view → projection → viewport chain as other 3D UI in the scene; output used for layout and damage rectangles.
- **Reference radius in pixels** (for layout / scaling hints): **16**, **32**, or **64** when the lot zoom level is **1**, **2**, or **3** respectively.

### 1.2 Spin

- Let \(t\) be **real time in milliseconds** (wall clock, not necessarily simulation time).
- **Yaw rate:**  
  \(\theta = t \cdot 10^{-3} \cdot 2\pi \cdot \frac{1}{2}\) radians  
  → **one full revolution per 2 seconds.**

### 1.3 Transform stack (model → world)

Apply in engine order appropriate to your math convention (validate with one golden frame):

1. Uniform scale (often **1**; may vary for UI).
2. **Rotate +90° or −90° about X** so the mesh stands upright relative to the rig (**upright before yaw** is the intended order).
3. **Rotate about vertical (Y)** by **\(\theta\)** from §1.2.
4. **Translate** to the **head anchor** in world space.
5. **Translate** by **(0, 3, 0)** in the **same length units** as the world (vertical lift above the anchor).

**Engine note:** If your world is **Y-up** but your rig uses another convention, **re-derive** this sequence so the **screen silhouette** and **spin axis** match golden screenshots rather than copying axis labels blindly.

### 1.4 Optional brightness pulse

- Let \(s = (t / 1000) \cdot (70/60)\) (maps clock to a “beats-adjacent” phase).
- **Active variant:** triangle wave from the **fractional part** of \(s\), scaled to per-channel bias in roughly **±50** on an 8-bit–style **0–255** interpretation, then add a constant **−50** to all channels.
- **Optional:** sine-based pulse or **motive-driven** tint (red/green/blue shifts from a happiness or mood scalar); treat as **feature flags** if product wants them.

### 1.5 Directional light (marker only)

- **Intensity:** 1.0 (relative to your light model).
- **Direction:** start from the **camera forward / view direction**, apply **yaw 80°** then **pitch 30°** (degrees), then **normalize**. Order and handedness must be checked against your matrix layout.
- Some pipelines fed a **dummy position** into a directional light API; only the **derived direction** matters for shading.

### 1.6 Ambient override (marker only)

- **Base ambient scale:** **0.25**; **per-channel floor:** **0.05**.
- Final ambient color:  
  **minChannel + base × (tint\_r, tint\_g, tint\_b)**  
  where **tint** comes from a **mood scalar** (e.g. happiness mapped to [−1, 1] with exaggeration **1.2** and clamp), then piecewise adjustment of RGB toward a **neutral midpoint** (e.g. **0.4**).

### 1.7 Geometry source

- **Procedural:** e.g. lathed diamond — cheap default.
- **Imported:** optional **small authored mesh** (diamond / arrow). For interchange, prefer **glTF 2.0** (`.gltf` or `.glb`); optional **extras** or a sidecar file for scale and pivot fixes per [gltf-extras-metadata.md](./gltf-extras-metadata.md).

---

## 2. Pie menu — center head

### 2.1 Which meshes

- Walk **all dressings / suits** on the character; **skip** suits marked as **non-rendered overlay** types (e.g. censorship bounding meshes — behavior and compositor order in **§5**).
- For the **head bone**, use the **bound deformed mesh** for that bone: deform in **local / bone space** for this draw only, then restore **world-space deformation** afterward so the rest of the scene is unchanged.

### 2.2 Placement

- **Screen center:** pie widget origin plus **center offset** supplied by the menu layout.
- **Depth:** midpoint of the **overlay Z band** (min/max Z reserved for UI so the head sits in front of the lot but behind or with other UI as designed).
- **Vertical nudge:** **+14 pixels** on Y (layout fudge).
- Convert **pixel position + depth** to **world space** with the **same inverse pipeline** used for other screen-locked 3D UI (device ↔ world matrix).

### 2.3 Open animation

- **Grow duration:** **400 ms** default.
- While opening: **scale** and **Y nudge** both scale by **elapsed / growDuration** (linear).
- **Base scale factor:** **12 / 2^zoomLevel** (zoom level 0-based or 1-based — match your viewer’s convention).
- **Global style multiplier:** **1.75** applied after grow.

### 2.4 Lighting (head only)

- **Ambient-only** for this draw: replace scene ambient with a **scalar** on RGB:
  - **0.8** when **no pie slice** is selected,
  - **1.0** when a slice **is** selected.
- The selection **marker** (§1) used **directional + ambient**; the **pie head** often does **not** reuse that recipe.

### 2.5 Motion

- **Wiggle:** each frame, add small random **nod** and **shake** components (scaled by **0.3** against a normalized random source).
- **Pie offset:** push the head based on menu **direction** and **distance** (e.g. offset magnitude \(\propto \sqrt{\text{distance} / 2000}\)).
- **Slice facing:** map **item count** and **highlighted index** to one of **eight** compass buckets; each bucket adds fixed **nod / shake** deltas.
- **Turn smoothing:** when the highlighted slice changes, **400 ms** blend from old to new nod/shake; ease with **square root** on a remapped **0.1 → 1.0** linear parameter.

### 2.6 Rotation stack (after scale)

Reference rotation order (re-validate for your Y-up / column-vector convention):

1. **Yaw:** \(0.05\pi + \text{nod}\)
2. **Roll or yaw “upright”:** \(0.5\pi\) about the axis that stands the head up in menu space
3. **Yaw toward camera / lot rotation:** \(-0.5\pi \cdot (\text{viewRotation} - 0.5) + \text{shake}\) where **viewRotation** is the discrete **isometric view** index (0–3 or as your engine defines).

---

## 3. Round shadow (under pie head)

### 3.1 Animated footprint

- Shadow is a **circle** in **screen space**, centered on the pie head center.
- **Radius** animates from **0** to a **target radius** (default **100 px**) over the same **grow duration** as the head (**400 ms**), unless disabled.

### 3.2 Depth rule

- Only affect pixels whose **stored depth** is **farther** than the **overlay reference depth** (shadow sits **behind** the UI plane / menu content).

### 3.3 Inner and outer disk

- **Full radius:** \(r\). **Inner boundary:** \(r_{\text{inner}} = r - r/3\) → inner disk is **two-thirds** of the radius, outer annulus is **one-third**.
- **Inside inner disk:** replace color with **low-contrast gray**  
  \(\text{gray} = \lfloor (R+G+B)/6 \rfloor + 8\) per channel (integer-friendly).
- **In annulus:** blend between **original** and **gray** with weight  
  \(w = 256 \cdot (d^2 - r_{\text{inner}}^2) / (r^2 - r_{\text{inner}}^2)\), clamped to **0–255**, then mix:  
  \(\text{out} = (w \cdot \text{orig} + (255-w) \cdot \text{gray}) / 256\) per channel (conceptually).

### 3.4 GPU port

- Implement as a **pass** that samples the **composed color** and **depth**, applies the disk + feather math, and writes only where the depth test allows. Fix **color space** (linear vs sRGB) once and apply consistently.

---

## 4. Speech and thought bubbles (text over the lot)

Plans below match **persistent-world chat**: short lines above avatars, readable at multiple zoom levels, without blocking the whole screen. **_The Sims Online_** is the reference UX: typed chat and system lines appear in **speech-style** chrome over the speaker; **thought**-style chrome can be used for inner voice or tutorial hints.

### 4.1 Channels and semantics

| Channel | Typical use | Chrome |
|--------|--------------|--------|
| **Speech** | Player or NPC dialogue, chat | Rounded rectangle + **tail** pointing at speaker head |
| **Thought** | Hints, mood, inner voice | **Cloud** or dotted-outline style; tail optional or stylized |
| **System** (optional) | Moderation, tool messages | Distinct border color; may omit tail and center or dock |

Each **instance** carries: `speakerId`, `channel`, `utf8Text`, `createdAt`, optional `ttlMs`, optional `colorHint`, optional `priority` (system > speech > thought when colliding).

### 4.2 Anchor and screen position

- **World anchor:** same class of point as other head UI — e.g. head bone origin + **vertical offset** in world units (tune so tail meets hairline, not eyes).
- **Project** anchor to **screen (x, y)** with the **same view–projection** as the character pass.
- **Bubble placement:** place the **tail tip** near the projected anchor; body grows **upward and sideways** so the bubble does not cover the face (e.g. bias **above** anchor by a margin in pixels).
- **Clamp to viewport:** if the bubble rect would leave the canvas, **nudge** horizontally first, then vertically; keep tail attached to anchor or **fade** when anchor is off-screen (product choice).

### 4.3 Layout (text in chrome)

- **Max width** in CSS pixels (e.g. **200–280** at 1× scale), scale with **device pixel ratio** and optionally with **lot zoom** so text stays legible.
- **Padding** inside chrome: uniform **8–12 px** (tune per font).
- **Word wrap:** break on spaces and CJK boundaries; **ellipsis** or **scroll** for overflow beyond `maxLines` (e.g. cap **4–6** lines then truncate).
- **Font:** one **UI stack** (e.g. system sans or embedded TTF); **minimum** body size (e.g. **11–13 px**) at 1×; scale up with zoom if characters shrink on screen.
- **Contrast:** text color vs fill must meet WCAG-style contrast for shipped product; optional **text stroke** or **shadow** for busy backgrounds.

### 4.4 Timing and queue

- **Default display time:** `ttlMs = clamp(2500, basePerChar * utf8Length, 12000)` (example: **40–60 ms per character**, floor **2.5 s**, ceiling **12 s**).
- **Queue:** per `speakerId`, **FIFO** or **replace-latest** for speech; **merge** rapid duplicates within **500 ms** if text identical (anti-spam).
- **Fade:** **150–250 ms** alpha ease in and out.
- **Sim pause:** either **freeze** timers with simulation or use **wall clock** for chat readability (product flag).

### 4.5 Multiplayer / stream ordering

- **Message id** monotonic or UUID; **discard** stale ids if a late packet arrives after a newer line for the same speaker (optional).
- **Rate limit** per speaker for public builds (e.g. **N messages / 10 s**).
- **Sanitize** text length and code points before layout (DoS-safe caps).

### 4.6 Rendering strategies (WebGPU stack)

Pick one primary path; second path is fallback.

| Approach | Pros | Cons |
|----------|------|------|
| **HTML/CSS overlay** (`position: fixed` divs synced from anchor projection) | Fast text layout, fonts, RTL, accessibility | Another compositing layer; must sync DPR and canvas bounds each frame |
| **2D canvas** on top of WebGPU canvas | Single page stack; `fillText` + roundRect | Font loading, HiDPI sizing, manual wrap |
| **GPU quads + MSDF / bitmap font** | Matches game aesthetic; batchable | Atlas maintenance; RTL harder |
| **Render text to texture** per bubble | Flexible font | Costly if many bubbles update |

**Depth:** bubbles usually **ignore scene depth** (always readable) but **sort** by **screen Y** or **anchor depth** so overlapping speakers stack predictably. Optional: **occlude** bubble if anchor behind wall (depth sample at anchor — higher cost).

### 4.7 Profanity and moderation (text)

- **Client policy:** optional **word filters** and **replacement** (asterisks, `[filtered]`) before layout; run on the same sanitized string as §4.5 length caps.
- **Server / trust:** authoritative moderation belongs **upstream**; the overlay only **displays** what it is given. Log moderation actions outside the hot render path.
- **Streams / ratings:** tie **bubble visibility** to the same flags as **censorship** (§5) when product requires **family-safe** presentation (e.g. hide chat chrome entirely vs replace text).

### 4.8 Picking and input

- Bubbles are **non-pick** by default for character/object ID buffers.
- Optional: **click speaker name** in bubble for profile (MMO pattern) — separate hit region, not `readObjectIdAt`.

### 4.9 Asset pipeline

- **Chrome:** vector paths (SVG → tessellated tris) or **nine-slice** textures (corners + edges) for scalable bubbles; **two atlases** (speech vs thought) or one atlas with variants.
- **Localization:** layout must tolerate **±30%** width expansion; avoid hard-coded pixel widths per language.

---

## 5. Censorship overlay (modesty / safe presentation)

**Fidelity target:** *The Sims* line—**censor-type suits** are often **invisible or untextured box geometry** rigged to the skeleton; they need not be shaded like clothing. The **visible effect** is **mosaic or pixelization** over a **screen-space rectangle** built from projected bounds ([webgpu-renderer-design.md §3.11](./webgpu-renderer-design.md#311-censorship-mesh-bounding-box-pixelization)).

### 5.1 Suit and content rules

- **Tagging:** Mark suits or mesh groups as **censor** / **modesty bounding** in content or [gltf-extras-metadata.md](./gltf-extras-metadata.md) so the pipeline separates them from **normal clothing** draws.
- **Policy gate:** One **product flag** (rating, stream-safe, debug “disable censor”) controls whether **rects** are accumulated and whether the **mosaic pass** runs. When off, skip rect work and the pass entirely.
- **State:** Censor is usually driven by **outfit / body coverage** state, not by individual chat lines—unless product explicitly couples them (**§4.7**).

### 5.2 What gets drawn where

| Pass | Censor bounding meshes | Normal body and clothing |
|------|-------------------------|---------------------------|
| Opaque character | Often **no textured draw**; only contribute **bounds** to the rect list | Full shaded draw |
| Object-ID / depth | Optional **sentinel** ids for hybrid masking (**design §3.11**) | Normal body ids |
| Pie-menu center head | **Exclude** from the head mesh walk (**§2.1**); use real head geometry | Unchanged |
| Selection marker (**§1**) | Independent; censor does not replace the marker | — |

### 5.3 Rectangle update cadence

- **Each frame** (or when pose changes): transform censor mesh vertices or bone-OBB corners with the **same view–projection** as the main color pass; build **conservative screen rectangles** clamped to the viewport; **union** as needed.
- **Conservative bounds:** Prefer slightly **large** rects so skinning and motion do not leak uncovered pixels; validate against **golden frames**.

### 5.4 Order vs other overlays

1. Main scene color, depth, and object-ID (if used).
2. **Censor mosaic** pass—place **before** pie fullscreen treatment if the menu should appear **sharp** on top, or **after** if the whole frame must stay family-safe (**product flag**). See **design §3.9** vs **§3.11**.
3. Pie stack and lot-local effects: **§2** and **§3** in this doc.
4. **Speech / thought** layer last or near-last for readability.

Record the chosen order in renderer/stage config for screenshot regression.

### 5.5 Verification targets

- Censor **on:** no intended skin detail visible inside rects (document any allowed tolerance).
- Censor **off:** no cost from censor rect list or mosaic pass (early out).
- **Pie head** never uses censor-only suits (**§2.1**).

---

## 6. Mapping onto VitaMoo

| Concept | Direction |
|--------|-----------|
| Selection marker | **UI layer** draw: shared lighting uniforms (§1.5–1.6), optional procedural or glTF mesh (§1.7); keep **object-ID** behavior if picking must distinguish marker vs body. |
| Pie stack | Frame copy → **desaturate** → **vignette** → **round shadow** (§3) → 2D chrome → **head draw** (§2). |
| Speech / thought | **Overlay** pass after characters (and after or with other UI): project anchors from mooshow body list; **DOM or canvas** layer recommended for v1 text; GPU chrome optional. |
| Censorship | **Rect accumulation** from tagged suits + **mosaic post-pass** per **§5** and **design §3.11**; respect **policy flag** and compositor order **§5.4**. |
| Time | **Wall-clock ms** for spin (§1.2) and pulses (§1.4) unless product explicitly ties UI to paused sim time. |

---

## 7. Implementation checklist

1. **Imported marker mesh:** glTF for an authored diamond/arrow; verify pivot, scale, normals; optional `extras` for offsets.
2. **Matrix audit:** one **golden frame** (screenshot or numeric vertex) comparing transform stack §1.3 and §2.6 to approved art direction.
3. **Renderer API:** group **selection-marker lighting** (direction from camera + degree offsets, ambient base/min, optional mood tint) so procedural diamond and imported mesh share one path.
4. **Round shadow pass:** §3.3 verbatim in shader space; document linear vs sRGB.
5. **Pie menu compositor:** ordered passes per **§6** table; head draw uses §2 only.
6. **Motion tests:** table-driven tests for **slice index → nod/shake delta** and **400 ms** ease.
7. **Bubble service:** `BubbleQueue` per speaker (§4.4); `pushMessage({ channel, text, … })` from sim or network; projection hook from stage (`headScreenPos(bodyIndex)`).
8. **Bubble UI layer:** choose §4.6 path; implement §4.3 wrap + §4.2 clamp; optional text filter hook **§4.7**; chrome assets **§4.9**.
9. **Network adapter (optional):** schema for remote chat lines; rate limit §4.5; ordering §4.5.
10. **Censorship:** tagged suits → per-frame screen rects → mosaic pass; **§5.4** order; pie head exclusion **§2.1**; feature flag for off path.
11. **Docs:** when shipped, update [webgpu-renderer-status.md](./webgpu-renderer-status.md); keep [webgpu-renderer-design.md](./webgpu-renderer-design.md) as architecture pointer, not duplicate of formulas here.

---

## 8. Acceptance checks

- Marker completes **360°** in **2 s** real time (§1.2).
- Shadow: **inner 2/3** fully grayed per §3.3; **outer 1/3** feathered; no pixels modified where depth fails §3.2.
- Pie head: ambient **0.8 vs 1.0** per selection state (§2.4); scale follows **12 / 2^zoom × 1.75** after open (§2.3).
- **Bubbles:** speech and thought use distinct chrome; text wraps within **maxWidth**; tail or anchor stays within viewport or degrades gracefully; TTL and fade behave per §4.4; long UTF-8 strings cap without jank.
- **Censor:** with flag on, rects track pose and **§5.5** holds; with flag off, no mosaic cost; pie head still obeys **§2.1**.
- **Regression:** picking and plumb-bob IDs in mooshow unchanged unless pie UI intentionally participates in hit testing.
