# Sims 1 Prototype Content — January 1999

Character animation and mesh data from a **pre-release build of The Sims** (Maxis, 1997–1999).
Received April 2026 from Phil Ramsey, who preserved files from the demo period.
Earliest files date to **June 1998**; latest to **December 1998** — approximately 13 months before
the retail release (February 2000).

---

## Contents

| Type | Count | Format | Status in vitamoo |
|------|-------|--------|-------------------|
| **CMX** animations | 294 | ASCII text, `// Character File. Copyright 1997, Maxis Inc.` header, `version 200` | ✅ **Parseable by `parseCMX`** |
| **MSH** meshes | 323 | Binary, magic `0xb0b0b0b2`, compiled vertex buffer | ❌ Not yet — see below |
| **BIN** skills | 4 | Binary, proprietary animation curve format | ❌ Not yet — see below |
| **PNG** textures | 242 | Standard PNG (in `Textures/` subdirectory) | ⚠️ vitamoo uses BMP; PNG loader is `loadTexture` but BMP is the typical pipeline |

---

## CMX files — parseable today

The `.cmx` files are ASCII text in the same format that vitamoo's `parseCMX` already reads:
skeleton hierarchy, bone poses, animation keyframes. **294 animations** covering a much larger range
of interactions than the retail demo pack (`content/vitamoo/sims-demo/`), including:

- Full bed interaction suite (get in/out, make bed, energetic/lazy/normal variants)
- Computer, TV, fridge, stove, coffeemaker, aquarium, bookshelf interactions
- Social animations (argue, kiss, compliment, talk, listen — multiple intensity levels)
- Character-specific animations: **Mercedes**, **Ross**, **Sam** (prototype character names,
  predating the retail Sim naming/customisation system)
- Many more idle, locomotion, and object-use variants

**12 CMX files overlap** with the retail demo (`adult-approve`, `adult-bored1`, `adult-energetic1`,
`adult-idle1`–`8`, `adult-energetic1`, `ross-walking-loop`). The retail versions in
`content/vitamoo/sims-demo/` are kept as-is — this archive preserves the older prototype versions
of those same animations for historical comparison.

---

## MSH files — compiled binary mesh format (not yet supported)

The `.msh` files are **compiled binary vertex buffers** produced by the Maxis 3DS Max exporter
(`CMXExporter.cpp` in the original `vitaboy` codebase). They are the **pre-retail predecessor of
the `.skn` text format** that vitamoo currently reads.

Binary layout (confirmed by reading `skeleton.cpp` `DeformableMesh::WriteToFile`):

```
[magic: 0xb0b0b0b2, 4 bytes]   — Maxis proprietary marker
[filename string]              — CTGFile length-prefixed: 1-byte len, then chars
[texture string]               — same
[bone count: int32]
[bone names: N strings]
[face count: int32]            — DeformableFace entries (3 vertex indices + UV indices)
[bone binding count: int32]    — BoneBinding entries (firstVert, vertCount, firstBlend, blendCount)
[texture vertex count: int32]  — UV coordinates (float32 pairs)
[blend data count: int32]      — blended vertex weights
[vertex count: int32]          — Vec3 positions + normals (float32 × 6 per vertex)
```

This is **structurally identical to the SKN text format** — same data, different encoding. A
`parseMSH(buffer: ArrayBuffer)` function in vitamoo would mirror `parseBMF` (the retail binary
mesh format) but with a different magic and field layout. See `documentation/TODO.md` (Sims I/O
TypeScript package section) for the roadmap.

**Naming convention:** `xskin-<character>-<bone>-<mesh>.msh` e.g.
`xskin-biped-ed-HEAD-HEAD.msh`. The `biped-ed` prefix is the prototype character rig name, which
evolved into the retail `b001ma…` / `c001ma…` naming scheme.

---

## BIN files — binary skill/animation curves

Four `.bin` files:
- `xskill-adult-door-knock.bin`
- `xskill-adult-door-pull-open.bin`
- `xskill-adult-door-push-close.bin`
- `xskill-adult-greet01.bin`

These are binary animation curve files in a format predating the retail `.cfp` (binary CFP)
format that vitamoo's `parseCFP` reads. They likely correspond to the same data as the text `.cmx`
skill sections but in the Maxis binary intermediate form. Format not yet reverse-engineered.

---

## PNG textures (`Textures/`)

242 PNG textures with names like `CLbicepN.png`, `CHeadE.png` — **normal maps and diffuse maps** for
the prototype character meshes (the `N` suffix = normal, `E` = ?? expression/eye?). The retail
pipeline switched to `.bmp` and a different naming convention (`B001MAFitdrk_Dad01.bmp`).
Standard PNG loader applies; vitamoo's `loadTexture` handles both PNG and BMP via the browser
`fetch` + `createImageBitmap` path.

---

## Relationship to retail formats

| Prototype (1998) | Retail (2000) | vitamoo support |
|-----------------|---------------|-----------------|
| `.cmx` text animation | `.cmx` text animation | ✅ `parseCMX` |
| `.msh` binary compiled mesh | `.skn` text mesh + `.bmf` binary mesh | ❌ `.msh` not yet; ✅ `.skn` / `.bmf` |
| `.bin` binary skill | `.cfp` binary animation curves | ❌ `.bin` not yet; ✅ `.cfp` |
| `.png` textures | `.bmp` textures | ✅ `loadTexture` handles both |
| `biped-ed` rig name | `b001ma` / `c001ma` naming | — |

---

## Historical value

This archive documents the VitaBoy character system roughly **one year before ship**. Key points:

- Animations reference prototype character names (`Mercedes`, `Ross`, `Sam`) that did not ship in
  the retail game.
- The animation vocabulary is much larger than what shipped — many interaction types were cut or
  significantly revised for the release.
- The `.msh` format directly informs the reverse-engineering of `.bmf` — both are compiled binary
  forms of the same underlying DeformableMesh data model (from `skeleton.cpp`).
- The `version 200` CMX header is identical to the retail format, confirming the text animation
  format was stable from at least mid-1997.

Source: Phil Ramsey, personal archive of files from the Sims demo/prototype period.
Received: April 2026. Original file dates: June 1998 – December 1998.
