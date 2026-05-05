# glTF extras as the universal metadata layer

How VitaMoo uses glTF 2.0 `extras` to carry the same information that 3DS Max note tracks carried in the original Sims pipeline — and more — while staying round-trip-safe through Blender, other DCC tools, and any conformant glTF viewer or library.

---

## The idea

In 3DS Max, **note tracks** were the universal integration surface: key/value pairs attached to nodes in the 3D hierarchy and to timestamps on the animation timeline. The exporter read them to know what to export, the runtime read them to fire events during playback, and artists edited them to control both. Everything from "this is a skeleton called adult" to "play a footstep sound at frame 47" lived in the same mechanism.

glTF's **`extras`** field is that mechanism for the modern pipeline. The glTF spec requires every conformant tool to **preserve `extras` on round-trip** — import, modify geometry or animation, export, and the `extras` come back intact. They exist on every JSON object in the file: nodes, meshes, skins, materials, animations, accessors, the root document itself. They hold arbitrary JSON.

`extras` are **velcro, magnets, and post-it notes** for integrating content with other content, tools, and code. They are the binding surface between:

- The **DCC tool** (Blender custom properties ↔ glTF node extras).
- The **runtime** (VitaMoo reads extras to identify skeletons, fire events, resolve suits).
- **Other tools** we and others develop (timeline editors, skin painters, content catalogers).
- **Code** that consumes content (the way animation events were fed into SimAntics scripts over time during playback).

---

## Convention: `vitamoo_` prefix

All VitaMoo-specific extras use the prefix **`vitamoo_`** to avoid collisions with extras from other tools. Plain keys without a prefix are reserved for universal semantics or user content.

---

## Node-level extras (bones, meshes, roots)

These replace the 3DS Max note-track tags that were attached to bone nodes at a fixed time (or time-independent).

### Skeleton identification

```json
{
  "name": "ROOT",
  "extras": {
    "vitamoo_skeleton": "adult",
    "vitamoo_masterskeleton": true
  }
}
```

Equivalent to the original `skeleton=adult` and `masterskeleton=adult` note-track tags on the Biped root.

### Bone capability flags

```json
{
  "name": "L_LEG",
  "extras": {
    "vitamoo_cantranslate": false,
    "vitamoo_canrotate": true,
    "vitamoo_canblend": true,
    "vitamoo_wiggle": { "enabled": false, "power": 0.0 }
  }
}
```

Direct equivalents of `cantranslate=0`, `canrotate=1`, `canblend=1`, `wiggle=0 0.0`.

### Suit and skin tagging

```json
{
  "name": "body-mesh-xskin-b004",
  "mesh": 3,
  "extras": {
    "vitamoo_suit": "b004fa_duchess",
    "vitamoo_suit_type": 0,
    "vitamoo_skin_bone": "PELVIS",
    "vitamoo_skin_flags": 0,
    "vitamoo_texture": "b004fa_duchess.bmp"
  }
}
```

Replaces `suit=name`, `type=0`, the skin's bone binding, `flags=value`, and the texture-name convention.

### Accessory tagging

```json
{
  "name": "hat-mesh",
  "mesh": 7,
  "extras": {
    "vitamoo_accessory": true,
    "vitamoo_attach_bone": "HEAD",
    "vitamoo_accessory_slot": 0,
    "vitamoo_accessory_group": "hats"
  }
}
```

A mesh node tagged as an accessory, with the bone it attaches to and an optional slot/group for UI filtering. Tools can enumerate accessories by scanning for `vitamoo_accessory: true` on mesh-bearing nodes — no naming convention or magic prefix required.

### Registration points

```json
{
  "name": "R_HAND",
  "extras": {
    "vitamoo_registration": "right_hand",
    "vitamoo_registration_offset": [0.0, 0.02, 0.0]
  }
}
```

Named attachment points for carried objects, thought balloons, selection highlights — the same concept as the original `Registration` objects (Right Hand, Head, Balloon) in VitaBoy.

---

## Animation-level extras (skills, clips)

### Skill metadata

```json
{
  "animations": [
    {
      "name": "a2o-standing-loop",
      "extras": {
        "vitamoo_skill": "a2o-standing-loop",
        "vitamoo_duration": 2.4,
        "vitamoo_distance": 0.0,
        "vitamoo_is_moving": false,
        "vitamoo_coordinate_mode": "absolute",
        "vitamoo_origin": [0.0, 0.0, 0.0],
        "vitamoo_spin": 0.0,
        "vitamoo_repeat_mode": "loop"
      }
    }
  ]
}
```

Replaces `beginskill`/`endskill`, `absolute`/`relative`/`moving`, `xorigin`/`yorigin`/`zorigin`, `spin`, and the Practice `repeatMode`.

### Partial-body skills (bone inclusion/exclusion)

```json
{
  "name": "carry-right-arm",
  "extras": {
    "vitamoo_skill": "carry-right-arm",
    "vitamoo_include_bones": ["R_ARM", "R_ARM1", "R_ARM2", "R_HAND"],
    "vitamoo_priority": 5,
    "vitamoo_coordinate_mode": "relative"
  }
}
```

A carrying animation that only affects the right arm chain. When layered on top of a walking skill at lower priority, the walk drives the legs and torso while this skill drives the arm — exactly like the original partial-body skill with `includebone` tags. `vitamoo_exclude_bones` works the same way as the original `excludebone`.

### Blend and layering hints

```json
{
  "extras": {
    "vitamoo_skill": "wave-hello",
    "vitamoo_include_bones": ["R_ARM", "R_ARM1", "R_ARM2", "R_HAND"],
    "vitamoo_priority": 3,
    "vitamoo_blend_in": 0.15,
    "vitamoo_blend_out": 0.2,
    "vitamoo_opaque": false
  }
}
```

`vitamoo_opaque` matches the original Practice opaque flag: when true, this skill completely covers lower-priority skills on its bones rather than blending. `vitamoo_blend_in` / `vitamoo_blend_out` control cross-fade durations at the start and end of the clip.

---

## Time-keyed events (per-bone timeline tracks)

In the original pipeline, note tracks were attached to **bones**, not to animations. Each bone had its own timeline of events. The exporter walked the hierarchy, found note track keys on each bone within the time range of a skill, and exported them as per-Motion `TimeProps`. This is the right level: a footstep event belongs on the foot bone, a hand-pose change belongs on the hand bone, an anchor belongs on the toe.

We do the same thing in glTF: **`vitamoo_events` lives on bone nodes**, keyed by skill name, because a bone can carry events for multiple skills (a foot bone has footstep events in both the walking and running skills). Each skill's events on that bone are sorted by time. This is a direct JSON model of VitaBoy's per-Motion `TimeProps`.

### Structure

```json
{
  "name": "R_FOOT",
  "extras": {
    "vitamoo_canrotate": true,
    "vitamoo_canblend": true,
    "vitamoo_events": {
      "a2o-walking-loop": [
        { "time": 0.4, "props": { "footstep": "1" } },
        { "time": 0.9, "props": { "sound": "step_concrete" } }
      ],
      "a2o-cooking": [
        { "time": 0.82, "props": { "sound": "kick_stove" } }
      ]
    }
  }
}
```

```json
{
  "name": "ROOT",
  "extras": {
    "vitamoo_skeleton": "adult",
    "vitamoo_events": {
      "a2o-cooking": [
        { "time": 0.0,  "props": { "interruptable": "0" } },
        { "time": 1.5,  "props": { "xevt": "42" } },
        { "time": 2.3,  "props": { "interruptable": "1" } },
        { "time": 2.4,  "props": { "sound": "plate_set" } }
      ],
      "a2o-standing-loop": [
        { "time": 0.0, "props": { "interruptable": "1" } }
      ]
    }
  }
}
```

```json
{
  "name": "R_HAND",
  "extras": {
    "vitamoo_registration": "right_hand",
    "vitamoo_events": {
      "a2o-cooking": [
        { "time": 1.1, "props": { "righthand": "2" } }
      ]
    }
  }
}
```

Each entry in the array is `{ time, props }` — time in seconds, and a `Props`-style key/value bag. The bone name is implicit (it's the node the extras are on). The skill name is the key in the `vitamoo_events` object. Arrays must be sorted by `time`. This maps 1:1 to VitaBoy's `Motion.timeprops` — a `TimeProps` per motion (bone-within-skill).

### Why on bones, not on animation objects

- **Matches the original model.** VitaBoy `TimeProps` was per-Motion. A Motion is a bone-within-a-skill. The data lived on the bone.
- **Events are about the bone.** A footstep is about the foot. A hand pose is about the hand. The bone is the right place.
- **Partial-body skills work naturally.** A "carrying" skill that only drives the right arm gets events from `R_ARM`, `R_HAND`, etc. It doesn't need to know about unrelated events on `L_FOOT`.
- **Better Blender round-trip.** Node `extras` (bone custom properties) are the most reliably preserved location in Blender's glTF addon. Animation-level extras are less battle-tested.
- **Tools see events in context.** A timeline editor selects a bone and shows its event tracks across all skills. A bone inspector shows everything about that bone: capability flags, registration points, and event timelines.
- **Layering and blending.** When two skills are blended, each bone's event stream is independent. The runtime walks each active skill's events on each bone without cross-talk.

### At runtime

When a `Practice` binds a `Skill` to a `Skeleton`, it creates a `PracticeAssociation` for each bone that has motion data. If the bone also has `vitamoo_events[skillName]`, the association gets a `TimePropsIterator` that walks the sorted array. Each frame, `Practice.apply` advances the iterator and dispatches events whose time has been reached — same as the original.

### Events are bindings to code and tools

Events are not just historical compatibility. They are the **binding surface between content and code**:

- **`xevt`** → numeric dispatch to game logic (SimAntics `animate` primitive, or any registered handler).
- **`sound`** / **`selectedsound`** → audio engine.
- **`dress`** / **`undress`** → costume changes during animation (dressing a chef's hat when the cooking animation starts).
- **`anchor`** → foot-planting system.
- **`lefthand`** / **`righthand`** → hand-pose index for carried objects.
- **`censor`** → censorship mask.
- **`discontinuity`** → suppress blending (expect a snap).
- **Custom events** → any `key=value` the runtime doesn't recognize is forwarded to a generic event callback, so third-party tools and plugins can define their own vocabulary without changing VitaMoo's core.

The same mechanism works for browser tools: a **timeline editor** selects a bone, reads its `vitamoo_events`, lets the user drag events in time and edit their key/value props, and writes them back to the bone's `extras`. A **content catalog** walks all bones, scans their `vitamoo_events`, and indexes which sounds, hand poses, and interactions each animation uses.

---

## Document-level and mesh-level extras

### Document root

```json
{
  "asset": {
    "version": "2.0",
    "generator": "VitaMoo exporter"
  },
  "extras": {
    "vitamoo_content_type": "character",
    "vitamoo_format_version": 1,
    "vitamoo_source": "cmx:duchess3b.cmx",
    "vitamoo_tags": ["adult", "female", "formal"],
    "vitamoo_catalog": {
      "name": "Duchess Evening Gown",
      "description": "A formal outfit for adult female Sims.",
      "price": 350,
      "category": "clothing"
    }
  }
}
```

Content-site metadata: what kind of content this is, where it came from, user-facing catalog strings, tags for search and filtering. A content site reads these without parsing any geometry.

### Mesh-level

```json
{
  "meshes": [
    {
      "name": "body-b004",
      "extras": {
        "vitamoo_deformable": true,
        "vitamoo_bone_bindings_format": "vitaboy",
        "vitamoo_blend_weight_scale": 32768
      }
    }
  ]
}
```

Flags that tell the importer which deformation model to use (Vitaboy bone-range + blend vs. standard four-joint skinning), and format details like the blend-weight fixed-point scale from the original binary format.

---

## Round-trip through Blender

| VitaMoo extras location | Blender representation | Survives export? |
|------------------------|----------------------|-----------------|
| Node `extras` | Custom Properties on object/bone | Yes — reliable in all Blender 3.x+ |
| Animation `extras` | Custom Properties on NLA action | Yes — Blender 3.x+ glTF addon |
| Mesh `extras` | Custom Properties on mesh data | Yes |
| Material `extras` | Custom Properties on material | Yes |
| Document `extras` | Scene custom properties (mapped by addon) | Yes (may need addon config) |

Artists in Blender can see, edit, and add `vitamoo_*` custom properties directly in the Properties panel. When they export to glTF, the properties survive as `extras`. When VitaMoo imports the glTF, it reads the same `extras` it would have written. Full loop.

---

## Sidecar JSON (fallback and extension)

For tool chains that strip node `extras`, or for data too large to embed (e.g. dense event streams, full catalog records with thumbnails, localized strings), a **sidecar JSON** file accompanies the glTF:

```
duchess3b.gltf
duchess3b.vitamoo.json
```

The sidecar mirrors the `extras` schema (same keys, same structure) but is keyed by animation name and node name. VitaMoo checks both locations on import and merges, with inline `extras` winning on conflict.

---

## Relationship to the original note-track tags

| Original note-track tag | glTF extras equivalent |
|------------------------|----------------------|
| `skeleton=name` | `vitamoo_skeleton` on root node |
| `masterskeleton=name` | `vitamoo_masterskeleton` on root node |
| `cantranslate`, `canrotate`, `canblend` | `vitamoo_cantranslate`, `vitamoo_canrotate`, `vitamoo_canblend` on bone nodes |
| `suit=name` | `vitamoo_suit` on mesh node |
| `type=value` (suit type) | `vitamoo_suit_type` on mesh node |
| `flags=value` (skin flags) | `vitamoo_skin_flags` on mesh node |
| `beginskill=name` / `endskill=name` | `vitamoo_skill` on animation object (duration = animation length) |
| `includebone` / `excludebone` | `vitamoo_include_bones` / `vitamoo_exclude_bones` on animation extras |
| `absolute` / `relative` / `moving` | `vitamoo_coordinate_mode` on animation extras |
| `xorigin` / `yorigin` / `zorigin` / `spin` | `vitamoo_origin` / `vitamoo_spin` on animation extras |
| Runtime events (`sound`, `xevt`, `footstep`, `dress`, `anchor`, etc.) | `vitamoo_events` on the bone node, keyed by skill name: `{ "skill-name": [{ time, props }] }` |
| Unknown/custom events (passed through to runtime) | Same — any key in `props` not recognized by VitaMoo is forwarded to generic event callbacks |

Events live on bone nodes, keyed by skill name, matching the original per-bone `TimeProps` / per-Motion model exactly. No structural translation needed at import or runtime.

---

## Related files

| Area | Location |
|------|-----------|
| VitaMoo Props/TimeProps types | `vitamoo/types.ts` |
| Note-track history and original tag vocabulary | [sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md) |
| glTF loader (static meshes, future skinned) | `vitamoo/loaders/gltf.ts` |
| glTF import/export phasing (§8 in design) | [webgpu-renderer-design.md §8](./webgpu-renderer-design.md) |
| GPU readback for authoring tools | [gpu-assets-tooling-roadmap.md](./gpu-assets-tooling-roadmap.md) |
