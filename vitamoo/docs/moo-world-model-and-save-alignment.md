# Moo world model — alignment with Sims persistence and the **playing scene**

This document defines **VitaMoo-oriented names** and a **small object model** that mirrors where data lives in original Sims 1 saves and IFF resources, so we can **load, edit, save, and round-trip** without depending on the legacy codebase.

The **playing scene** is the core idea: a **player** for composed Sims-family content—**people** (each a **Person** on the lot, see §3), **asset libraries**, camera, and time—backed by a **portable JSON document** (the **playing-scene exchange**: `schemaVersion`, `characterTemplates`, `playingScenes`, optional `assetIndexRef` to a separate asset-list JSON, optional `gltfAttachments` for pure 3D files). **Authoring** (inspectors, batch edits, save-as, validation) and **other tools** (export, Blender sidecars, lot editors) are **modular layers**: same scene document and player APIs; layers attach without renaming the center to “editor-first.” That tree can be **exported or imported** beside glTF for DCC tools (e.g. Blender).

### Scope and intent

**In scope** is a **content and interchange toolchain**: archives, meshes, animations, lot and household data, and metadata—anything a player or author might **inspect, edit, version, and hand to another tool** (including the commercial game as one consumer of the same file shapes).

**Out of scope for VitaMoo and this suite’s playing-scene stack** is **replacing The Sims as a product** or **reimplementing life simulation inside our runtime** (autonomous Sims, motive ticks, full SimAntics, multiplayer parity). Persisted fields that exist only to support that simulation are still **documented and preserved** on load/save so files stay valid; the **player** and editors do not need to *run* EA’s simulation to be useful.

**Related experiment (separate track):** [MOOLLM **sim-obliterator**](https://github.com/SimHacker/moollm/tree/main/skills/sim-obliterator) (and [designs/sim-obliterator](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator)) explores **LLM-driven “simulation” in the model**: read/write **YAML** (and related exports) lifted from Sims objects and saves, then **import those edits back** into real Sims 1 archives so state **round-trips** between an LLM-facing workspace and **The Sims 1 engine**. That **does not execute SimAntics in TypeScript or WebGPU**; it **orchestrates files** the retail game still runs. VitaMoo, parsers, and the playing scene can consume the **same decoded shapes** where they overlap; the LLM loop is optional sibling tooling, not a requirement for the browser player. See also [OBLITERATOR-TYPESCRIPT.md](./OBLITERATOR-TYPESCRIPT.md) §1.3 (MOOLLM sim-obliterator).

The aim matches how the franchise was pitched early on—**player-authored worlds** and **tools on the rim** (Will Wright’s “digital dollhouse” and workshop framing): an ecosystem for authoring and sharing, not a substitute retail game. Players keep playing in EA’s (or compatible) executables; these tools make **their** neighborhoods, objects, skins, and stories easier to build, fix, and move between apps.

**Related:** [gltf-extras-metadata.md](./gltf-extras-metadata.md) (`vitamoo_` extras for mesh/skeleton/animation metadata), [DOCUMENTATION.md](./DOCUMENTATION.md) (layering), [sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md) (CMX / note tracks / runtime events).

---

## 1. Why the legacy game splits things the way it does

The shipped game keeps several roles separate for simulation and rendering, not because each role has its own user-visible file.

| Role | Rough legacy idea | Lives in save files? |
|------|-------------------|----------------------|
| Cross-lot identity and money, relationships, motives snapshot | Persona roster entry tied to GUID / avatar id | Yes — neighborhood index + per-character persistent file |
| Household membership and family name | Group of GUIDs + household finances | Yes — family resources on the **lot** IFF; members are GUIDs only |
| Placed simulation object (furniture, doors, sims) | Object graph, behaviors, positions | Yes — **house / lot** stream |
| 3D body: skeleton, suits, playing skill | Animation engine on the sim object | **No separate “animator save”** — driven by asset refs and runtime state inside the lot/house serialization and person state |
| Mesh/skeleton/skill assets | Authoring files (CMX, BCF, …) | **Package / GameData**, not per-save character body files |

So: **many C++ types exist for runtime** (object system, animation manager, skeleton, skills). **Fewer boundaries matter for disk layout**: neighborhood roster, character file, lot/house archive, and global IFF resources.

---

## 2. Where data lives (original layout, descriptive)

Typical user-facing layout is a **neighborhood directory** containing:

- A **neighborhood index** file (`Neighborhood.iff`) holding neighborhood-level resources (e.g. roster list types such as `NGBH` / `NBRS`, export info, constants). Headers describe it as the save for the district path; character numbering maps to files like `User00001` …
- **Per-resident persistent files** (character / avatar data) under a characters area — roster entries reference file numbers and GUIDs.
- **Per-lot archives** (house / family playing that lot): IFF with **family** resources (`FAMI`, `FAMs`, `FAMh`) plus the **house** serial stream (objects, world, walls, floor, routes, description). Comments on the family type state explicitly that **the family resource does not load people — people come from the house file**.

For implementation research, the useful split is:

1. **District index** — who exists in the world and how lots tie in.
2. **Resident snapshot** — long-lived fields for one person (stats, motives copy, person-data fields, relations, funds, …).
3. **Lot package** — one playable lot: household records + serialized object module + architecture + time/sim state.
4. **Asset packages** — meshes, skeletons, skills (our CMX/BCF/SKN world).

VitaMoo today implements **(4)** in parsers and a **playing-scene host** (VitaMooSpace + mooshow); it does **not** yet implement full **(1)–(3)** as tool layers. This model is the contract for **data fidelity and UI structure**—still as a **content pipeline**, not a life simulator—and for **shaping the editor UI** around “what file would this field belong in?” rather than around engine class names.

---

## 3. VitaMoo naming (mapping to persistence, not to C++ headers)

Use these **document and API** terms. They are **not** renamed copies of legacy symbols; they label **persistence-facing** roles.

**Person (hub):** In ordinary English *person* is broad; here it means any **placed Sim, dog, cat, or other body** the game runs through the **same person pipeline** on the lot—a **`LotObject`** subtype with person save data **and** what VitaMoo needs to **show** them: skeleton, suits/skins, active skill / `Practice`, mesh deformation, plumb-bob pick id, etc. **Dogs and cats are `Person` too**: different skeletons, suits, and skills, not a separate abstract “entity” type. That lines up with source trees that talk about **person** objects (`Person.*`, person-data indices) without copying class names into our API. Furniture and props stay ordinary **`LotObject`**s—no extra taxonomy.

| VitaMoo term | Encapsulates (legacy roles, conceptual) | Typical persistence home |
|--------------|----------------------------------------|---------------------------|
| **District** | Roster of residents, lot bookkeeping, neighborhood IFF index | Neighborhood directory + index IFF |
| **ResidentRecord** | Stable id (GUID), avatar id, person-data fields, cross-lot money and expenses, relationship matrix, motives snapshot for save | Roster entry + character file streams |
| **Household** | Display name, funds, ordered list of resident ids, flags, optional history handles | `FAMI` / `FAMs` / `FAMh` on **lot** IFF — *members are ids only* |
| **LotArchive** | Single playable lot: house description, object module, worlds, room/wall managers, routes, scrapbook, sim clock hooks | House read/write stream on the lot file |
| **LotObject** | Any placed entity in the object module: type, selector, tiles, stack state, serialization mask | Inside **LotArchive** object graph |
| **Person** | The person-pipeline `LotObject` (human, dog, cat, …): person data, action/queue state, idle state, placement, *and* 3D body state (skeleton / suit / skill refs wired to VitaMoo) | Same lot stream + **ResidentRecord** when syncing neighborhood |
| **Appearance** | Everything you see and **time** on that body: rig, suits, active skill / `Practice`, time-keyed props. (The engine split this across animation manager + VitaBoy; it is still **not** a separate save file.) | Nested under **Person**; round-trip as asset IDs/paths in JSON or glTF extras |
| **AssetRef** | Pointer to packaged content: skeleton, suit, skill names or hashes | Game packages or URLs resolved by the playing-scene host |

**Collapsed for simplicity (recommended):**

- Treat **animation manager + skeleton + dressing + playing skill** as **`Appearance`** nested under **`Person`** in JSON and UI. On disk in the real game they still serialize with the person object; we do not expose “manager” as a sibling persistence node.
- **ResidentRecord vs Person:** **ResidentRecord** is **who** across lots and files; **Person** is **this instance on this lot** (placement, current animation/suit, queue). They link by stable **resident id** / GUID.

---

## 4. **Playing scene** (portable document + player)

The **playing scene** is a VitaMooSpace / mooshow construct: **not** a shipped Sims 1 concept. It is the **JSON-shaped document** the **player** loads: **people** (`Person` slices), libraries, environment, optional embedded district/lot slices. You **play** it in the browser; **tool and authoring layers** use the same file for edit/save/round-trip without replacing the player core.

The VitaMooSpace demo ships **`vitamoospace/static/data/content-exchange.json`** plus **`content-assets.json`** (mesh/skeleton lists via `assetIndexRef`). Types and the player converge on `schemaVersion` and the exchange fields below (`assertPlayingSceneExchange` in `vitamoo`).

| Field | Purpose |
|-------|--------|
| `schemaVersion` | Forward-compatible JSON |
| `metadata` | Title, author, notes, thumbnail ref |
| `assetIndexRef` | Optional sibling JSON with skeleton/suit/mesh lists (pure jq-friendly bundle) |
| `assetLibraries` | Same lists inline as exchange asset keys (`skeletons`, `meshes`, …) or in `assetIndexRef` |
| `characterTemplates` | Exchange array: template **`id`**, display name, mesh/texture/skill defaults (loader → `characters`) |
| `playingScenes` | Exchange array: scene **`id`**, **`cast`** of **Person** placements (`characterTemplateId`, `skill`, position) |
| `gltfAttachments` | Optional `{ id, url, meshName? }[]` for pure glTF/GLB; exchange references by `id` and may pin one mesh with `meshName` |
| `figures` | Zero or more **Person** *previews* (today’s JSON key; a future schema may alias **`people`**). Each row: optional resident id, transform, suit/skill **AssetRef**, initial time |
| `environment` | Camera orbit defaults, lighting overrides, background — **player-local** (no Sims 1 equivalent on disk) |
| `district?` | Optional embedded or referenced **District** subset for future round-trip |
| `lot?` | Optional embedded **LotArchive** subset (simplified) when we add object graph |

**Rule:** Every **`figures[]`** entry (a **Person** slice) should still map to a **Person** row in a future **LotArchive** (placement + appearance), so the playing scene does not fork a second truth forever.

**Modular layers:** inspectors, form-based editors, IFF import/export wizards, and glTF packaging are **optional surfaces** on the same model—no requirement that every build ship every layer.

---

## 5. Scene container interchange — top-level arrays, ids, YAML

Tooling should **import and export** the playing-scene document as **JSON** (canonical on the wire) with an optional **YAML** equivalent for hand editing—the same object graph, lossless round-trip where the schema allows.

**Shape**

- **Top-level arrays only** for each *kind* of thing: e.g. `residents`, `people`, `households`, `lotObjects`, `assets`, … as the document grows. No deep ownership trees in the file; **composition is by reference**.
- **Any count** per array. New object types add **new top-level keys** (new arrays), not nested bags, so the file stays **flat, composable, and easy to filter** with [jq](https://jqlang.org/), `yq`, or small scripts.
- **Higher-level records** (households, lots, playing-scene metadata) **point** at lower-level rows via **`id`** strings (or stable UUIDs), not by embedding duplicates.

**Ids vs indices**

- **Persistent interchange** (disk, git, merge): every row that can be referenced carries an **`id`** unique within its **array’s type** (or globally unique if you standardize a prefix/UUID—pick one rule per schema version and document it).
- **Ephemeral / in-memory** (frame loop, hot reload): the loader may use **array index** for speed; after edits that reorder arrays, **rebuild indices** from `id` or rescan once.
- **Runtime caches:** on load, build **`Map<id, T>`** (or plain objects) **per object type**—`residentById`, `personById`, etc.—for O(1) lookup. Indices are a **derived** view, not the source of truth on disk.

**Why:** keeps the serialized form **jq’able** (`'.people[] | select(.residentId == "…")'`), diff-friendly, and friendly to import/export CLIs without walking OO graphs. Nesting belongs inside **one row** (e.g. **`Appearance`** on a **Person**), not in the **file** structure above the type arrays.

---

## 6. JSON “3D document” and Blender ↔ round trip

**Geometry and skins** should use **glTF 2.0** as the interchange mesh + material carrier. **Sims-specific fields** (skill name, suit name, person-data indices, GUID, foot events, censorship flags) belong in:

- **`extras`** on nodes / animations / skins, using the `vitamoo_` conventions in [gltf-extras-metadata.md](./gltf-extras-metadata.md), and/or
- A **sidecar JSON** (e.g. `scene.vitamoo.json`) that references glTF URIs and lists **ResidentRecord** / **Household** / **District** slices that glTF does not carry.

**Recommended split:**

- `*.gltf` / `*.glb` — meshes, skeletal poses, animation clips Blender understands.
- `*.vitamoo.scene.json` (name arbitrary) — **playing scene** or **LotArchive** subset, **AssetRef** lists, and links into glTF node names or indices.

Round-trip invariant: **every field in the sidecar** must map to a known cell in **§2–§3** (which original file class it would belong to), or be explicitly tagged **`playerLocal`** (camera, UI chrome, viewport session—fields with no direct game-save counterpart).

---

## 7. UI orientation (player + tool layers)

The **player** always needs a clear scene: **people**, assets, playback. **Tool layers** can expose a tree ordered by **persistence concern** (good for save fidelity), not by engine class names:

- **District** (collapsed until loaders exist)
- **Residents** → **ResidentRecord** list
- **This lot** → **Household** (then **Person** rows: placement + **Appearance**)
- **Assets** → skeletons, suits, skills
- **Playing scene** → camera, environment, plumb-bob overrides (**player-local** where not in Sims saves)
- **Roots** (planned) → scan roots, provenance, index/build status
- **Catalog** (planned) → discovered files/objects/chunks and cross-links

Selecting a **Person** edits: placement, suit/skill **AssetRef**, and (later) push/pull to **ResidentRecord** for stable ids.

---

## 8. Implementation checklist (incremental)

1. Introduce TypeScript interfaces for **ResidentRecord**, **Household**, **Person** (in-lot; mooshow “body” index maps here), **Appearance**, **PlayingScene** (or **`Scene`** in code if you prefer a short export name); keep them in `vitamoo` or `mooshow` types once stable.
2. **Playing-scene exchange** ( **`characterTemplates`**, **`playingScenes`**, **`assetIndexRef`**) is implemented in `vitamoo` + `mooshow` as the only accepted scene schema; continue aligning with **§5** as new top-level kinds appear.
3. Ship **import / export** for scene JSON (and optional YAML) in tool layers; load path builds **per-type `id` caches** from arrays; allow ephemeral **index** use in the player loop only.
4. Keep **tool layers** (patch editors, IFF panels, etc.) behind explicit modules or routes so the **player** bundle stays small.
5. Add IFF readers for **District** index and **Household** resources before full **LotArchive** parsing.
6. When exporting to Blender, emit glTF + sidecar; validate **extras** against [gltf-extras-metadata.md](./gltf-extras-metadata.md).
7. For object scans, run **GUID collision analysis** before any mutation: build GUID -> object lists, exact-match groups, and similarity matrices, then emit one warning per GUID for user/LLM disposition. Treat base-game and expansion objects as immutable anchors (see [guid-collision-analysis-plan.md](./guid-collision-analysis-plan.md)).
8. Add an object-corpus SQL export tool: scan objects across selected directories/FARs, extract inter-object GUID references and provenance, and persist a normalized SQLite database for downstream analysis tools. Target Node-side pipelines first; optional browser-local mode can use SQLite WASM (or equivalent) for user-selected files, with optional read-only publication via Datasette.
9. Add `Roots` and `Catalog` UI tabs in the demo app: let users add/remove multiple scan roots (multiple installs/saves/object folders), run robust classification scans, and browse discovered objects/metadata from the normalized inventory. Respect disabled suffixes during scan intake: skip paths ending in `-disabled` (for example `foo.iff-disabled`) so intentionally disabled packages are ignored.
10. Add remote catalog roots (future pass): allow roots that point to online JSON/YAML object indexes and service APIs, with explicit `rootType` plus arbitrary `rootMetadata` (for example site/service URL plus username/password), dynamic incremental updates, search/filter-aware providers, and hosted publishing of user collections.
11. Add per-root filter/caching behavior (future pass): root filters constrain what enters the merged catalog; remote roots support chunked/streaming metadata fetch with incremental cache hydration.
12. Add root driver interfaces (future pass): per-site drivers implement incremental search/filter, metadata listing, object download/upload, and sync checkpoints (first-party catalog service first).
13. Add root input/output policy controls (future pass): roots can ingest, publish, and export; users control what is uploaded, shared, kept private for backup, or written to local disk.
14. Add installation and save virtualization tooling (future pass): stage object sets, park inactive packages, coordinate stop/switch/start loops, and manage multiple virtualized Sims save profiles.

---

## 9. Source pointers (for maintainers)

Useful legacy headers for **file boundaries** (not for naming our public API): neighborhood and roster (`Neighborhood.*`, `Neighbor.*`), lot and object graph (`House.*`, `ObjectModule.*`, `Object.*`), **person** as object (`Person.*`), household record (`Family.*` — `FAMI` / `FAMs` / `FAMh`), animation stack (`SAnimator.*`, **VitaBoy** types in SimsKit). **SAnimator** + **VitaBoy** implement what we model as **`Appearance`** on **`Person`**; they are **not** separate save files.
