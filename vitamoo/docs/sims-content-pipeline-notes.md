# Sims content pipeline — note tracks, tools, and community ecosystem

Historical notes on the original Sims 1 content pipeline (Don Hopkins, Maxis 1997–2004) and how it informs VitaMoo's design for browser-based authoring, interchange, and community content sites.

---

## 3D Studio Max note tracks

The CMX Exporter used **3DS Max note tracks** as the primary metadata channel for the entire content pipeline. A note track can be attached to any node in the 3D hierarchy and contains **keys in time**, each holding a multi-line text field parsed as `key=value` property lists.

Don Hopkins described them as **"XML in 3D+Time"** — structured data riding on nodes and timestamps, read by both the exporter and the runtime animation engine.

### What note tracks carried

| Tag | Where attached | Purpose |
|-----|---------------|---------|
| `skeleton=name` | Root bone | Marks a skeleton for suit/skill export |
| `masterskeleton=name` | Root bone | The canonical skeleton actually exported (e.g. "adult", "child") |
| `suit=name` | Skeleton root, at a specific time | Snapshot a suit at that frame |
| `beginskill=name` / `endskill=name` | Any bone, at start/end times | Delimit an animation clip on the timeline |
| `cantranslate`, `canrotate`, `canblend` | Individual bones | Per-bone animation capability flags |
| `wiggle=canWiggle wigglePower` | Individual bones | Quaternion Perlin noise (never shipped, but wired) |
| `includebone=name` / `excludebone=name` | With `beginskill` | Override which bones a partial-body skill animates |
| `xorigin`, `yorigin`, `zorigin`, `spin` | With `beginskill` | Animation coordinate system origin and orientation |
| `absolute`, `relative`, `moving` | With `beginskill` | Coordinate mode: world-space, origin-relative, or locomotion |
| `type=value` | With `suit` | Suit type: 0 = normal faces, 1 = bounding-box-only (censorship) |
| `flags=value` | On a skin | Bitmask to filter which skins dress onto the skeleton |

### Animation events (delivered at runtime)

Any tag the exporter **did not recognize** was passed through as a **runtime event**, delivered to the game's `SAnimator` at the marked time during playback. Known runtime events:

| Event | Effect |
|-------|--------|
| `xevt` | Numeric arg → SimAntics animate primitive false branch |
| `interruptable` / `interruptible` | Set practice interruptable flag |
| `anchor` | Anchor the tagged bone (foot planting) |
| `dress` / `undress` | Dress or undress a named suit at runtime |
| `lefthand` / `righthand` | Set hand pose index |
| `censor` | Set censorship mask |
| `sound` / `selectedsound` / `delselectedsound` | Play named sound (conditional on selection state) |
| `footstep` | Play footstep sound (left/right arg, historically ignored) |
| `discontinuity` | Expect a snap in root position — suppress blending |

This meant artists could place sound cues, hand-pose changes, censorship triggers, and object-interaction synchronization events directly on the 3DS Max timeline, and they would survive export into the game without any code changes.

### How the exporter used note tracks

1. MaxScript walks the scene hierarchy looking for nodes with note tracks.
2. Each note track key's text is parsed as a `Props` (key/value pairs, one per line).
3. Recognized tags (`skeleton`, `beginskill`, `suit`, etc.) drive the export: which bones, which time range, which meshes.
4. Unrecognized tags become `TimeProps` entries in the exported skill — animation events for the runtime.
5. The artist adjusts event positions in time (e.g. sliding a `footstep` key to match the foot-hit frame) and edits property text, then re-exports.

The Access database drove batch export: it listed every skeleton, suit, and skill by name, pointed to the Max file, and the MaxScript UI could load, validate, and export them automatically — or batch-export the entire database.

---

## The CMX Exporter (MaxScript + C++ plug-in)

The exporter started as a pure C++ 3DS Max exporter plug-in but was **recast as a MaxScript primitive** so it could be called under program control. MaxScript handled UI, database queries (OLE to Access), SourceSafe integration (DOSCommand), file I/O, and validation; C++ handled the actual mesh compilation and VitaBoy data structures.

Key capabilities of the MaxScript UI ("CMX Exporter Turbo-Deluxe"):

- Browse all skeletons, suits, skills in the database.
- Load the correct Max file, check it out of SourceSafe, export, check back in.
- Filter by keywords (e.g. all content for a named character).
- Batch export the whole database or filtered subsets.
- Dry-run mode (write-enable flag off) to see what would be exported.
- Compression statistics, histogram analysis, and pose analysis reporting.

### Language lineage

MaxScript was designed by **John Wainwright**, who also designed **ScriptX** at Kaleida Labs and its underlying **Objects in C (OIC)** object system. Both languages are Lispy in feel. Don Hopkins used ScriptX at Kaleida (1992–1994) and then MaxScript at Maxis (1997–2000) to build the Sims character animation pipeline. The shared design sensibility — dynamic types, concise syntax, excellent native-code plug-in interface — made MaxScript a natural fit for driving the exporter from a database and integrating with external tools.

---

## Content tools and community ecosystem

### Transmogrifier

- **Purpose:** Clone existing Sims objects and edit name, price, description, and sprite graphics.
- **Object format:** IFF files containing z-buffered sprites (RGB + depth + alpha), SimAntics behavior trees, catalog strings, and metadata.
- **Magic Cookies:** Unique GUIDs allocated to object creators to prevent ID conflicts — essential for a decentralized content ecosystem.
- **SafeTMog proposal:** A restricted version that only allowed safe graphical/textual modifications to stock objects, exchanged as zip files of XML + bitmaps (pure data, no code). Designed to prevent viruses and protect game stability while enabling user content for The Sims Online.

### RugOMatic

- **Purpose:** Drag-and-drop creation of custom rugs from any picture and text description.
- **Output:** A playable IFF object + an HTML page (name, price, description, preview image, download link) for publishing on the web.
- **In-game:** Custom rugs had a "Describe" pie-menu action so players could read the embedded text — turning rugs into an in-game publishing medium.

### ShowNTell

- **Purpose:** ActiveX control for live preview of Sims IFF objects on web pages.
- **Use case:** Content sites (SimFreaks, SimSlice, etc.) could show interactive object previews — rotation, zoom, read catalog text — without launching the game.

### RSS 2.0 Sims Module / MySim tool

- **Purpose:** Drag-and-drop publishing of Sims objects to Radio UserLand blogs via an RSS 2.0 module.
- **Flow:** Drop an IFF into a directory → auto-generate preview + description → paste into blog entry → upload object + preview to the blog.
- **Vision:** Decentralized content distribution through standard web syndication, integrated with ShowNTell for live object previews on any blog.

### Community content sites

Sites like **SimFreaks**, **SimSlice**, **The Sims Content Catalog**, **Simprov**, **The Bunny Wuffles School of Sims Transmogrification**, and **The Sims Exchange** formed a thriving ecosystem of:

- Downloadable objects, skins, heads, and character animations.
- Tutorials (from beginner Photoshop/TMog basics to advanced techniques).
- Story-driven content (The Sims Exchange was a specialized blog built around in-game storytelling with downloadable families and houses).
- Object catalogs with previews, ratings, and search.

---

## Relevance to VitaMoo

### Note track equivalents in VitaMoo

VitaMoo's `TimeProps` and `Props` types already mirror the original note-track data model:

- **`Props`** = key/value string pairs (same as a single note track key's text).
- **`TimeProps`** = integer-keyed timeline of `Props` (same as a note track's keys-in-time).
- **`MotionData.hasProps` / `hastimeprops`** = per-motion event streams, parsed from note track keys in the original exporter.

When we import glTF animations or define timeline segments for streamed animation blending, the same `TimeProps` structure can carry events (sound cues, hand poses, anchor points, interaction sync) attached to bones at specific times — exactly as the original pipeline did. See **[gltf-extras-metadata.md](./gltf-extras-metadata.md)** for the full `vitamoo_` extras schema and the note-track → extras mapping table.

### Browser-based tool equivalents

| Original tool | Browser equivalent (future) |
|--------------|----------------------------|
| CMX Exporter (3DS Max) | glTF import/export + VitaMoo parsers; batch operations in JS |
| Transmogrifier | Browser object editor: swap sprites, edit catalog strings, export IFF via readback |
| RugOMatic | Drag-and-drop object creator using WebGPU readback → BMP/z-buffer → IFF |
| ShowNTell | Embedded `<canvas>` with VitaMoo WebGPU renderer — live object/character preview on any web page |
| The Sims Exchange / SimFreaks | Modern content site with embedded WebGPU previews, glTF downloads, user galleries |
| RSS Sims Module | Standard web APIs (REST, ActivityPub, RSS) with glTF/IFF attachments for content syndication |

### GPU readback for authoring

The readback infrastructure in `Renderer` (color, depth, object-ID buffers) directly supports the Transmogrifier/RugOMatic-style authoring flow:

1. Render an object or character pose with WebGPU.
2. Read back **color + alpha** (→ BMP, PNG, or IFF sprite channel).
3. Read back **depth** (→ z-buffered sprite layer for isometric composition).
4. Read back **object-ID** (→ per-pixel part identification for paint tools).
5. Assemble into IFF or publish as glTF + raster previews for a content site.

No server round-trip needed — everything happens in the browser, matching the spirit of the original standalone desktop tools.

### Animation events and object interaction sync

The original `SAnimator` delivered note-track events to SimAntics tree code during playback — `xevt` for branching, `sound` for audio, `dress`/`undress` for costume changes, `anchor` for foot planting. VitaMoo's `Practice` and timeline system should carry the same event vocabulary (or a superset) so that:

- Imported Sims 1 skills play with correct sound/event timing.
- New glTF-authored animations can embed events via glTF extras or a sidecar JSON.
- Streamed long animations (walk → reach → interact) fire events at blend boundaries.
- Browser tools can place and edit events on a timeline, just as artists did in the 3DS Max note track editor.

---

## References

Primary links for the Drupal-era articles are **Wayback** snapshots of `donhopkins.com`. **§ Hacker News (DonHopkins / SimHacker)** lists discussion threads with **Medium** and other mirrors.

- [Automating The Sims Character Animation Pipeline with MaxScript](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/30) — Don Hopkins, 2004 (email to John Wainwright, 1998). **HN:** [5844531](https://news.ycombinator.com/item?id=5844531) (SimHacker), [40417009](https://news.ycombinator.com/item?id=40417009) (DonHopkins, includes Wayback of node/30 in comment). **Medium:** [Automating the Sims character animation pipeline with MaxScript](https://donhopkins.medium.com/automating-the-sims-character-animation-pipeline-with-maxscript-bc490787d7a2) (from [30360424](https://news.ycombinator.com/item?id=30360424)).
- [Sims VitaBoy Character Animation Library Documentation](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/19) — Don Hopkins. Full VitaBoy API, note track tags, SAnimator events.
- [Sims Character Animation File Format](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/20) — Don Hopkins. CMX, SKN, BCF, BMF, CFP structures.
- [Details on The Sims Character Animation File Format and Rendering](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/21) — Don Hopkins. Deformation algorithm, blended vertices, smoothing groups.
- [A Proposal to Develop Third Party Content Authoring Tools for The Sims](https://web.archive.org/web/20080224061751/http://www.donhopkins.com/drupal/node/16) — Don Hopkins, March 2000.
- [SafeTMog: Safe Transmogrifier Plan](https://web.archive.org/web/20080226053023/http://www.donhopkins.com/drupal/node/18) — Don Hopkins.
- [The Sims Transmogrifier 2.0, and RugOMatic](https://web.archive.org/web/20080325081109/http://www.donhopkins.com/drupal/node/1) — Don Hopkins.
- [Transmogrifier Renovation Plan](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/17) — Don Hopkins. Expansion pack support, Windows XP fixes, installer, feature requests.
- [RugOMatic Documentation and Tutorial](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/11) — Don Hopkins. Drag-and-drop rug creation with auto-generated HTML pages.
- [ShowNTell ActiveX Plug-In for Previewing Sims Objects](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/2) — Don Hopkins. Live IFF preview on web pages.
- [RSS 2.0 Sims Module, and MySim tool for Radio UserLand](https://web.archive.org/web/20080224054735/https://www.donhopkins.com/drupal/node/5) — Don Hopkins. Blog-based content syndication.

### Hacker News (DonHopkins / SimHacker)

Don Hopkins posts on Hacker News as **[DonHopkins](https://news.ycombinator.com/user?id=DonHopkins)** and **[SimHacker](https://news.ycombinator.com/user?id=SimHacker)**. These threads link **live, Medium, or Wayback** URLs that overlap the Drupal references above:

| Topic | Hacker News |
|-------|-------------|
| **Automating The Sims Character Animation Pipeline with MaxScript** (drupal node/30) | [item?id=5844531](https://news.ycombinator.com/item?id=5844531) (SimHacker — direct `donhopkins.com/drupal/node/30`); [item?id=40417009](https://news.ycombinator.com/item?id=40417009) (DonHopkins — Wayback of node/30 in comment); [item?id=30360424](https://news.ycombinator.com/item?id=30360424) |
| **Medium** reprint of that MaxScript article | [Automating the Sims character animation pipeline with MaxScript](https://donhopkins.medium.com/automating-the-sims-character-animation-pipeline-with-maxscript-bc490787d7a2) |
| **The Sims design documents** (zip, downloads, related Medium posts) | [item?id=43065985](https://news.ycombinator.com/item?id=43065985) (DonHopkins, on *The Sims Game Design Documents (1997)*); story [item?id=43064273](https://news.ycombinator.com/item?id=43064273) → [donhopkins.com/home/TheSimsDesignDocuments/](https://donhopkins.com/home/TheSimsDesignDocuments/) |
| **Design Draft 3** note (same-sex relationships) plus older links | [item?id=22886489](https://news.ycombinator.com/item?id=22886489) (DonHopkins) |
| **`theSimsObjects` blog** (Wayback category) | [item?id=40050697](https://news.ycombinator.com/item?id=40050697) → [Wayback: donhopkins.com blog category](https://web.archive.org/web/20040329181128/http://www.donhopkins.com/blog/categories/theSimsObjects/) |
| **drupal node/31** (Wayback in comment) | [item?id=30360424](https://news.ycombinator.com/item?id=30360424) → [Wayback snap](https://web.archive.org/web/20160704065742/http://www.donhopkins.com/drupal/node/31) |
| **Ken Perlin / Improv** (quote used below) | [item?id=46227104](https://news.ycombinator.com/item?id=46227104) |

No HN thread was located here that **directly** cites drupal node/19, /20, /21, /16, /18, /17, /2, or /5; the **References** Wayback URLs above are the stable entry points for those pages.

### Archive.org content mining targets

The Sims Exchange and community sites are only **partially** preserved. Links that use Wayback **wildcards** (`/web/2004*/http://example.com/*`) often open a **capture index** (a machine listing of archived URLs), not a replayed HTML page. Prefer URLs with a **single timestamp** (`/web/YYYYMMDDhhmmss/http://…`), or open [web.archive.org](https://web.archive.org/), type the original hostname, and pick a date from the **calendar**.

**Concrete snapshots (rendered HTML):**

- [The Sims Exchange — family listings for user TychoBrahe](https://web.archive.org/web/20000601171503/http://www.thesims.com/us/exchange/results/families_results.phtml?query=allfamilies&owner=TychoBrahe&rangelow=1&rangehigh=10) — June 2000 capture: search results page with downloadable family entries for one Exchange account. The Sims 1 site lived at `www.thesims.com` before later `thesims.ea.com` URLs. File downloads from archived Exchange pages usually fail (dead back-ends); the value is page structure, screenshots, and metadata.
- [SimFreaks home](https://web.archive.org/web/20030203163751/http://simfreaks.com/) — March 2003.
- [The Sims Transmogrifier](https://web.archive.org/web/20040111133027/http://www.thesimstransmogrifier.com/) — January 2004.

**No stable deep link found here:** Bunny Wuffles / StrategyPlanet Sims tutorials and the old Google Directory “Sims modifications” category either lack reliable Wayback captures or return save/embed redirects from automated URL patterns. Search [web.archive.org](https://web.archive.org/) for `strategyplanet.com` + `thesims` or `directory.google.com` + `The_Sims` and open a snapshot from the calendar.

Mining these archives can still recover HTML, screenshots, filenames, and tutorial text — useful for VitaMoo import experiments and for rebuilding community catalogs, even when original downloads no longer run.

---

## Ken Perlin's Improv and procedural graphics — influence on VitaBoy

The Sims character animation system was directly inspired by Ken Perlin's **Improv** project (Perlin & Goldberg, SIGGRAPH '96). Improv separated character animation into an **Animation Engine** (layered, continuous, non-repetitive motions with smooth transitions) and a **Behavior Engine** (rules governing how actors communicate and decide). Actions were organized into compositing groups — actions in the same group competed (one fades in, others fade out), while actions in different groups layered like image compositing. Perlin's key insight: *"the author thinks of motion as being layered, just as composited images can be layered back to front. The difference is that whereas an image maps pixels to colors, an action maps DOFs to values."*

VitaBoy's Practice/Skill/Motion system implements this same layered architecture: Practices have priorities, opaque practices occlude lower-priority ones on the same bones, and multiple practices blend via weighted averaging. The vocabulary (Skeleton, Bone, Skin, Suit, Dressing, Skill, Practice, Motion) carries Improv's spirit into the game engine.

Since 1996, Perlin has published many interactive Java applet demos on his NYU page, teaching computer graphics to students and the public. Don Hopkins learned from his papers and demo code while designing the Sims character animation system. Perlin's **Webwide World** (1998) was a procedural planet generator running in a Java applet — progressive rendering, cached Catmull-Rom splines for multi-octave noise, and plans for user-owned real-estate on a fractal planet. His later **Dragon Planet** (2013) ported the same no-polygon procedural approach to WebGL fragment shaders. As of November 2025, Perlin is rewriting all his classic Java applets in JavaScript (Canvas2D and WebGL), noting: *"the great thing about ideas is that, unlike technology, ideas can last forever."*

VitaBoy also includes a `QuaternionNoise` generator based on Perlin noise, intended for adding organic wiggle to bone rotations (wired but never tuned for shipping). The `canWiggle` / `wigglePower` bone flags and the `vitamoo_wiggle` glTF extras field preserve this capability for future use.

### References

- [Ken Perlin's NYU page (archived Nov 2020)](https://web.archive.org/web/20201109093258/https://mrl.cs.nyu.edu/~perlin/) — experiments, courses, toys. Live `https://mrl.cs.nyu.edu/~perlin/` has had TLS problems; this snapshot usually loads.
- [Webwide World (1998)](https://web.archive.org/web/20001011065024/http://mrl.nyu.edu/perlin/demox/Planet.html) — procedural fractal planet in a Java applet.
- [Dragon Planet (2013)](https://blog.kenperlin.com/?p=12821) — procedural planet in a WebGL fragment shader.
- [Updating applets (2025)](https://blog.kenperlin.com/?p=27980) — rewriting classic Java applets in JavaScript.
- **Improv** (Perlin & Goldberg, SIGGRAPH '96) — layered animation architecture that inspired VitaBoy. Canonical URL: `https://mrl.cs.nyu.edu/~perlin/improv/` (TLS has often failed in practice). For snapshots, search the [Wayback Machine](https://web.archive.org/) for `mrl.nyu.edu` or `mrl.cs.nyu.edu` and path `perlin/improv`. Context: [Hacker News — DonHopkins on Improv](https://news.ycombinator.com/item?id=46227104).
- [Hacker News — thread with comment by DonHopkins](https://news.ycombinator.com/item?id=46227104) — *"I learned a lot from his papers and demo code, and based the design of The Sims character animation system on his Improv project."*

---

## Coordinate systems, quaternion tricks, and glTF import gotchas

Notes about the Sims character animation pipeline that matter for anyone building tools (Blender addons, WebGPU shaders, glTF importers) that touch VitaMoo/VitaBoy data.

### Coordinate system: already converted at export time

3DS Max is **Z-up right-handed**. The Sims game is **Y-up**. The CMX Exporter converts at export time using `decomp_affine` on Max's `Matrix3` transforms. By the time data reaches CMX/SKN/CFP files, it is already in the game's coordinate system. VitaMoo's TypeScript parsers and WGSL shaders work in the game coordinate system directly — no axis swaps needed for Sims 1 content.

**Sims-aligned VitaMoo space** (what deformation and WGSL use after native parsers run) is **right-handed** with **+Y up**. CFP animation on disk is stored in a **DirectX-oriented** encoding relative to that runtime; **`parseCFP`** in `vitamoo/vitamoo/parser.ts` converts it into Sims-aligned VitaMoo space by negating stored **Z** on translation keys and **W** on quaternion keys.

**glTF 2.0** is defined by Khronos as **right-handed** with **+Y up** — the **same** handedness and up axis as Sims-aligned VitaMoo. In glTF, a default camera looks down **−Z**, so **+Z** is the world direction **from the origin toward the viewer** in that standard layout (this is the glTF spec’s camera rule, not a separate informal convention).

**Import boundary:** Parsers and glTF loaders must put every asset into that **one** Sims-aligned VitaMoo basis. The minimal **`loadGltfMeshes`** path currently copies mesh vertices **without** an extra global axis matrix; a full skeletal glTF importer should apply any needed fixed rotation or scale **there**, alongside the CFP rules — **not** inside the deformation shaders, which always see a single world frame.

### `ExtractTransRot` — how bone-local transforms are computed

```cpp
// localMat is the difference between the bone and the node, with scaling.
Matrix3 localMat = nodeMat * Inverse(boneMat);

// Decompose both matrices into their affine parts.
decomp_affine(boneMat, &boneParts);
decomp_affine(localMat, &localParts);

// Take out the scale factor from the translation.
Point3 scale(boneParts.k.x, boneParts.k.y, boneParts.k.z);
trans = localParts.t * scale;
rot = localParts.q;
```

The exporter computes the relative transform from parent bone to child, strips scale (the Sims has no bone scaling — all scale is baked into the mesh at export), and stores translation + rotation. This is what ends up in CMX `Bone.position` and `Bone.rotation`, and what `updateTransforms` propagates.

### `rot.MakeClosest(rotClosest)` — quaternion hemisphere continuity

This is the single most important numerical trick in the animation export pipeline:

```cpp
rot = localParts.q;
rot.MakeClosest(rotClosest);  // rotClosest = previous frame's rotation
```

A unit quaternion `q` and `-q` represent the same rotation. But when you interpolate (slerp or nlerp) between two quaternions, picking the wrong sign makes the interpolation take the long way around the sphere instead of the short way — causing the bone to spin 360 degrees minus the intended angle, or to snap discontinuously.

`MakeClosest` flips `rot` to the same hemisphere as the previous frame's rotation (by checking `dot(rot, rotClosest) < 0` and negating all four components if so). The exporter does this for every bone at every frame before writing the animation data. This means the exported quaternion streams are **hemisphere-continuous** — safe to interpolate between adjacent frames without sign checks.

**For tool developers:**

- **Blender glTF export** does its own `MakeClosest` equivalent when writing animation channels, so glTF quaternion streams are usually hemisphere-safe. Verify this when importing — if you see snapping or 360-degree spins, the quaternions need a `MakeClosest` pass.
- **VitaMoo's `Practice.tick`** uses `quatSlerp` which already handles the `dot < 0 → negate` case (see `skeleton.ts` / `types.ts`). But if you write a GPU animation evaluation shader, you need the same check: `if (dot(q0, q1) < 0) q1 = -q1` before nlerp/slerp.
- **When recording animations** from VitaMoo (e.g. baking a long blended sequence to glTF), apply `MakeClosest` between consecutive frames before writing.

### `TMToQuat` — matrix to quaternion conversion

The exporter uses the Shepperd method with epsilon-guarded branches:

1. Try `w = sqrt(0.25 * (1 + m11 + m22 + m33))` (trace > 0).
2. If w is too small, fall back to whichever diagonal element (`m11`, `m22`, `m33`) is largest, and derive the other components from the off-diagonal elements.

This avoids division-by-zero when a rotation is near 180 degrees. Standard technique, but worth knowing if you're writing your own `mat4 → quat` conversion for imported glTF data.

### Biped bone name remapping

The exporter canonicalizes Character Studio Biped bone names to shorter VitaBoy names:

| Biped (new CS) | VitaBoy (exported) |
|---------------|-------------------|
| CALF | LEG1 |
| THIGH | LEG |
| UPPERARM | ARM1 |
| FOREARM | ARM2 |
| CLAVICLE | ARM |

The root (`Bip01`) is renamed `ROOT` and the `Bip01 ` prefix is stripped from all bones. This remapping is baked into exported CMX files. VitaMoo's parsers see the already-remapped names.

**For glTF import:** When importing a Blender skeleton intended for VitaMoo, either name the bones using the VitaBoy convention directly, or provide a name mapping in glTF `extras` (e.g. `vitamoo_bone_remap`). The VitaMoo skeleton expects names like `ROOT`, `PELVIS`, `SPINE`, `HEAD`, `L_LEG`, `R_ARM1`, etc.

### Vertex descaling

```cpp
// Take out the scale factor from the translation.
Point3 scale(boneParts.k.x, boneParts.k.y, boneParts.k.z);
trans = localParts.t * scale;
```

The exporter strips all scale from the bone hierarchy. The Sims has no runtime bone scaling — it was baked out during export by multiplying translations by the parent's scale. This is why `updateTransforms` only does translation + rotation (no scale). If you import glTF skeletons that have non-uniform scale on bones, you need to bake the scale into the mesh before uploading, or the deformation will be wrong.
