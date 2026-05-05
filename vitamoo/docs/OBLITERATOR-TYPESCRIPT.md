# SimObliterator → TypeScript: save data, content library, and VitaMoo integration

This document surveys the **Python side** of **SimObliterator Suite** (repository root, outside `vitamoo/`), proposes a **portable TypeScript** module family for **reading and eventually writing** Sims 1 save and game data in **browser and Node**, and orders work so the **first win** is: **load every Sim from a neighborhood (all lots / families)** into **VitaMoo** for animation and outfit play.

It is **not** a mandate for a line-by-line Python port. TypeScript modules should match **on-disk contracts** and **user-visible capabilities**, **maximize reuse of vitamoo** (parsers, types, naming), and stay **small, testable, and environment-agnostic**.

**MOOLLM** (separate repo) already captures the **product intent** in human-editable form: the **[sim-obliterator designs](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator)** and **[sim-obliterator skill](https://github.com/SimHacker/moollm/tree/main/skills/sim-obliterator)** describe INSPECT / UPLIFT / DOWNLOAD, the **PersonData ↔ CHARACTER.yml** bridge ([`BRIDGE.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md)), and the **IFF Semantic Image Pyramid** ([`IFF-LAYERS.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/IFF-LAYERS.md)). Today that skill **shells out to Python** in a sister **SimObliterator_Suite** checkout. This document defines the **pure TypeScript platform** that implements the **same contracts** (binary layouts, field indices, roster discovery) so **browser / Node / static hosting** need **no Python** for core I/O, VitaMoo loading, or future YAML/MOOLLM export.

---

## 1. Layered stack and vitamoo alignment

### 1.0 Bottom-up layers (TS)

| Layer | Responsibility | Depends on |
|-------|----------------|------------|
| **L0 — Resource I/O** | The **only** layer that knows *how* bytes are obtained: directory handle, Node `fs`, in-memory fixtures, ZIP, future sync providers. Exposes a **small async API** over **logical paths** (POSIX-style strings relative to a chosen root, e.g. `Neighborhoods/N001/Neighborhood.iff`). No IFF, no Sims semantics. | Nothing in-stack (platform types only). |
| **L1 — Virtual tree (optional composition)** | Merges **loose files**, **FAR** entries, and later **DBPF** mounts into **one** L0-shaped view (search order / shadows: e.g. Downloads over pack). Parsers do not know whether a path hit a FAR or disk. | L0 only. |
| **L2 — Binary formats** | **IFF** container, **FAR** index, chunk payload views. **Pure**: `Uint8Array` / `DataView` in, structured data out; same spirit as `vitamoo` text/binary parsers (`parseCMX`, `parseSKN`, `parseCFP`). | L1 (or L0 if no archives). |
| **L3 — Save / content domain** | Neighborhood graph, **FAMI** / **NBRS**, **User** IFF, appearance decoding, GUID maps, house linkage. Still no `fetch` / `fs`. | L2 + shared types. |
| **L4 — VitaMoo bridge** | Emits **`ContentIndex`** and paths (or buffers) that the existing loader stack understands; wires **L0** into the runtime. | L3 + **vitamoo** / **mooshow** types. |

**Rule:** nothing above **L0** imports Node `fs`, `path` (except path *normalization* utilities with browser equivalents), or browser `FileSystemHandle` APIs. **L0 implementations** live in small adapter files (`resource-io-node.ts`, `resource-io-fs-access.ts`, `resource-io-memory.ts`).

### 1.1 Parallel with vitamoo today

**mooshow** already separates **what** to load from **one** default transport:

- **`ContentLoader`** (`mooshow/src/runtime/content-loader.ts`) uses **`assetsBaseUrl`** + **`fetch`** for every asset (`loadIndex`, CMX/SKN/CFP/BMP).
- **`ContentStore`** holds parsed skeletons, suits, skills, meshes, texture **name** map.
- **`ContentIndex`**, **`CharacterDef`**, **`SceneDef`**, **`CastMemberDef`** are the **contract** between data and stage.

The save-data TS stack should **not** invent parallel names for those shapes. The bridge layer **fills** `ContentIndex` / character entries; the app keeps using **`createMooShowStage`** + **`loadContentIndex`** + **`loadAllContent`**.

**Evolution (recommended):** add an optional **`ResourceReader`** (or **`AssetSource`**) to **`ContentLoader`**: same method signatures the loader uses internally today (`readText`, `readBytes`, optional `exists`), defaulting to **`fetch(baseUrl + path)`**. Then **L0** implements **`ResourceReader`** for the browser directory pick or Node, and **one** code path loads demo packs **or** extracted save-relative assets. Until that lands, the bridge can expose an **`http(s):` or blob virtual base** that maps to L0 (slightly more glue).

**Parsers:** keep using **`vitamoo`** exports (`parseCMX`, `parseSKN`, `parseCFP`, `buildSkeleton`, …) from the bridge and anywhere domain code needs to validate assets—**do not fork** CMX/SKN/CFP logic into a second package.

**Texture pipeline:** today **`TextureFactory.createTextureFromUrl`** stays as-is; URLs can point at **blob:** or **data:** URLs if L0 serves in-memory bytes. Same pattern as vitamoo: **loader** does not decode BMP—GPU path uses existing texture load.

### 1.2 Naming and patterns (conventions)

- Prefer **existing vitamoo/mooshow names**: `ContentIndex`, `CharacterDef`, `ContentStore`, `assetsBaseUrl` (when URL-based), `loadIndex` / `loadAllContent` semantics.
- New types for saves should be **`PascalCase`** interfaces in files colocated with domain (`neighborhood.ts`, `neighbor-record.ts`), mirroring **`Body`**, **`StageConfig`** style in mooshow.
- **Pure parse functions** return **plain objects** or **readonly** views; avoid hidden globals (same as core vitamoo parsers).
- **Errors:** throw **`Error`** with stable codes or `cause` where useful, similar to **`content-loader`** JSON / fetch errors.

### 1.3 MOOLLM sim-obliterator: same idea, TypeScript runtime

| MOOLLM artifact | What it specifies | Pure TS platform |
|-----------------|-------------------|------------------|
| **[`BATTLE-PLAN.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BATTLE-PLAN.md)** | Sister-repo pattern, phased **SETUP / INSPECT / UPLIFT / DOWNLOAD**, later TRANSLATE / BHAV / ALBUM | **SETUP** → optional CLI or `pnpm` script that only installs **Node** deps (no venv). **INSPECT** → TS API + JSON/YAML output from **L3** neighborhood state. **UPLIFT** → map save records to a **portable object**; optional **CHARACTER.yml** emitter for `skills/character`. **DOWNLOAD** → Phase D binary writers + same field math as Python. |
| **[`BRIDGE.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/BRIDGE.md)** | **PersonData.h** indices (88 shorts), **FAMI** / **NBRS**, scales 0–1000 ↔ 0–10, career and relationship mapping | TS **single source of truth** as typed constants + tests; must **match** BRIDGE tables (already corrected vs TSO indices per that doc). |
| **[`SKILL.md`](https://github.com/SimHacker/moollm/blob/main/skills/sim-obliterator/SKILL.md)** | User-facing **beam up / beam down** narrative, `sims:` as sync surface, `mind_mirror` MOOLLM-only | TS library does **not** call LLMs; it supplies **data** MOOLLM skills consume. **VitaMoo** uses **L4**; **MOOLLM** uses **exported YAML/JSON** from the same TS decode. |
| **[`IFF-LAYERS.md`](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/IFF-LAYERS.md)** | Six **semantic** layers from raw IFF bytes → exploded chunks → decoded YAML → narrative **CHARACTER.yml** | **Orthogonal** to §1.0 **L0–L4 transport stack**: MOOLLM L0 there = sacred file bytes; our **L0** = how TS **acquires** those bytes. Convergence point: TS **IFF split/merge** (parity with Python `container_operations`) can emit MOOLLM **Layer 1** trees for tooling without mixing I/O into parsers. |

**Integration shapes (later):** MOOLLM can keep the **skill** as orchestration while swapping **Python subprocess** calls for **`node sims-io inspect`** or **WASM**-bundled TS; or vitamoospace can **download CHARACTER.yml** blobs generated client-side. The **pure TS** requirement is: **library code path** runs without CPython.

---

## 2. Survey: Python layout (~220 modules under `src/`)

### 2.1 Container and binary formats (`src/formats/`)

| Area | Role | Notable modules |
|------|------|-----------------|
| **IFF** | Read/write Sims IFF, typed chunks | `formats/iff/iff_file.py`, `formats/iff/base.py`, `formats/iff/chunks/*` (BHAV stack, OBJD/OBJF/STR#, SPR, DGRP, **PERS**, **NBRS**, **FAMI**, **HOUS**, **SIMI**, **ARRY**, **OBJM**/**OBJT**, and many more) |
| **FAR** | FAR1 / FAR3 archives | `formats/far/far1.py`, `formats/far/far3.py` |
| **DBPF** | Package-style containers where used | `formats/dbpf/dbpf.py` |
| **Mesh / character assets** | BCF/BMF/CFP, CMX text, SKN, glTF export helpers | `formats/mesh/bcf.py`, `bmf.py`, `cfp.py`, `cmx.py`, `skn.py`, `gltf_export.py` |

**Overlap with vitamoo:** TypeScript already implements **CMX, SKN, CFP, BMP** and animation/render (`vitamoo/vitamoo/`). The new work is **IFF/FAR/save orchestration** and **resolving paths** from STR# / filenames into bytes vitamoo can consume.

### 2.2 Application core (`src/Tools/core/`)

Large surface: **IFFReader**, **chunk_parsers**, **save_mutations**, **world_mutations**, **mutation_pipeline**, **safety** / provenance, **BHAV** disassembly/execution helpers, **asset_scanner**, **file_operations**, **mesh_export**, **lot_iff_analyzer** (lot structure, SIMI, HOUS, terrain-by-house-number), **skin_registry** (appearance from STR# 200 and related), **ttab_editor**, **slot_editor**, localization (**str_parser**), graph extractors glue, etc.

For **browser save browsing**, the highest-leverage Python references are:

- **`Tools/save_editor/save_manager.py`** — neighborhood discovery (`Neighborhood.iff`), **FAMI** / **NBRS**, **User#####.iff**, **House##.iff**, budgets, person fields, edit offsets.
- **`Tools/core/skin_registry.py`** — decode body/head/hand lines from **STR#** into mesh and texture names.
- **`Tools/webviewer/character_exporter.py`** — IFF → JSON appearance; BCF → skeleton JSON (pattern for TS export to vitamoo `ContentIndex`).

### 2.3 Save editor package (`src/Tools/save_editor/`)

Focused API: dataclasses for **FamilyData**, **NeighborData**, **PersonData** (indices aligned to Sims 1 `PersonData.h`, documented in-file), and **IFFEditor**-backed read/write for money, skills, careers, relationships, etc.

### 2.4 Graph, entities, GUI, webviewer

- **`Tools/graph/`** — dependency graphs, chunk-type extractors (BHAV, OBJD, SLOT, TTAB, …). Important for **object tooling later**, not for milestone 1.
- **`Tools/entities/`** — `sim_entity`, `object_entity`, `behavior_entity`, `relationship_entity`. Conceptual model for TS types later.
- **`Tools/gui/`** — DearPyGui desktop; **not** a port target.
- **`Tools/webviewer/export_server.py`** — Flask; proves **server-mediated** file access. The TS plan prefers **File System Access API** (with fallbacks) so the **same library** runs in static hosting.

### 2.5 Tests and utilities

- **`dev/tests/test_game.py`** (and related) — real-file validation; TS should add **fixture-based** tests (small IFF slices) plus optional **integration** scripts in Node with a configured game path.
- **`utils/binary.py`** — `IoBuffer`, endian helpers; TS uses `DataView` + explicit little-endian reads.

---

## 3. Design goals for TypeScript

1. **Respect §1 layering:** **L0** is the only place that performs physical I/O; **L2** parsers stay pure on bytes; **L4** speaks **mooshow** / **`ContentIndex`**.
2. **One logical library**, multiple **entrypoints** or **subpackages** as the repo grows; keep **tree-shakeable** ESM under the same **pnpm workspace** as **vitamoo** (see §9).
3. **L0 contract** (name can be `ResourceBackend`, `SimsFileSource`, or `Vfs`): async **`readBytes(path)`** / **`readText(path)`**, optional **`readdir`**, optional **`writeBytes`** for Phase D; paths are **logical** strings, never raw host absolute paths leaked upward.
4. **Pure parse/transform** for **L2** and up where possible: no DOM; **`Uint8Array`** in, structured data out—same discipline as **vitamoo** parsers.
5. **Vitamoo-facing output:** reuse **`ContentIndex`**, **`CharacterDef`**, **`ContentStore`** names and semantics; **mooshow** **`ContentLoader`** unchanged from the app’s perspective (or extended only with an injectable reader as in §1.1).
6. **Editing and save-back** only after **read-only parity**; **transaction** / **snapshot** story mirrors Python’s safety ideas without blocking v1 read paths.

---

## 4. Conceptual mapping (Python reference → TS module and layer)

| TS module (proposed) | Layer | Responsibility | Python touchpoints |
|----------------------|-------|----------------|-------------------|
| **`resource-io-*`** (adapters) | **L0** | Node / File System Access / memory / ZIP | N/A |
| **`virtual-tree`** / **`archive-mount`** | **L1** | Overlay loose + FAR (+ DBPF later) | `formats/far/*.py`, installer layout |
| **`binary`** | **L2** | Buffer helpers, UTF-16/8 strings, aligned struct read | `utils/binary.py` |
| **`iff-core`** | **L2** | IFF container parse, chunk iteration, raw chunk read | `formats/iff/iff_file.py`, `base.py` |
| **`iff-chunks`** | **L2** | Typed decoders per fourCC (incremental) | `formats/iff/chunks/*.py`, `Tools/core/chunk_parsers.py` |
| **`far`** | **L2** | FAR1/FAR3 index + extract bytes by path | `formats/far/*.py` |
| **`save-neighborhood`** | **L3** | Find `Neighborhood.iff`, FAMI list, NBRS neighbors, GUID map | `Tools/save_editor/save_manager.py` |
| **`save-user`** | **L3** | Parse **User#####.iff** for STR# appearance + links | `IFFReader`, `skin_registry.py`, `character_exporter.py` |
| **`save-house`** | **L3** | House##.iff for lot residents / runtime state (phase 2+) | `save_manager.py`, `lot_iff_analyzer.py` |
| **`appearance`** | **L3** | STR# 200 lines → `{ body, head, hands, … }` + file base names | `skin_registry.py` |
| **`asset-resolve`** | **L3** | Map mesh/texture names → logical paths on **L1** | `asset_scanner.py`, `file_operations.py` |
| **`vitamoo-bridge`** | **L4** | Build **`ContentIndex`**; connect **L0** to **`ContentLoader`** / blob URLs | `character_exporter.py`, `content-loader.ts` |
| **`iff-explode` / `iff-assemble`** | **L2** | Deterministic chunk tree ↔ single IFF (MOOLLM **Layer 1**-style) | `Tools/core/container_operations.py` (IFFSplitter / IFFMerger) |
| **`iff-decoded-export`** | **L2–L3** | Chunk payloads ↔ YAML/JSON (MOOLLM **Layer 2**); **§6** schemas | `formats/iff/chunks/*`, `chunk_parsers.py` |
| **`object-interchange`** | **L3–L4** | **`manifest.yml`**, **fidelity profiles**, partial patch merge, derived RGB/α/Z/zoom | Transmogrifier philosophy; **§6** |

**vitamoo reuse:** **`parseCMX`**, **`parseSKN`**, **`parseCFP`** (and future shared binary readers) stay in **`vitamoo`**; **L3** may call them for validation; **L4** relies on **mooshow** to load bodies the same way as today.

---

## 5. Phased roadmap

### Phase A — Foundation (blocking everything else)

1. **IFF reader:** header, chunk table, lazy chunk payload access, stable `path` / `id` metadata for debugging.
2. **STR# decoder** (minimal): enough to read **appearance strings** and labels.
3. **FAMI + NBRS** decoder: families, neighbor ids, GUIDs, names, links to **User** files as in Python.
4. **L0 + path conventions:** document **Legacy Collection** vs **Classic** user-data layouts the same way `save_manager.find_neighborhood` tries multiple roots; ship **memory** + **Node** L0 for CI.
5. **Filesystem discovery and classification:** scan user-selected install/save/mod roots, classify directories/files robustly, and build an internal inventory model from raw files (no dependency on external precomputed JSON formats). Respect disabled suffixes: paths ending in `-disabled` (for example `foo.iff-disabled`) are skipped during recursive intake, except when the user explicitly registers a disabled file as a root to inspect it directly.

**Exit:** From one or more selected roots (install/save/mod), list neighborhoods, load **Neighborhood.iff**, and enumerate **all neighbors** with stable ids from our own scan inventory.

#### Phase A1 — Roots/Catalog v1 coding plan (implementation order)

This is the concrete start sequence for coding the first `Roots` and `Catalog` tabs.

1. **Decisions (lock these first):**
   - Node-first scan runtime (SvelteKit server endpoints + local filesystem access).
   - Browser-only mode is optional later (File System Access API + SQLite WASM).
   - Raw-file ingestion is authoritative; external JSON formats are optional comparison inputs only.
   - Disabled assets are always skipped: any file or directory path ending in `-disabled` is excluded.
   - Multi-root scanning is default (multiple installs/saves/object folders in one inventory).
   - A root can point to a directory, a single file, or an interchange manifest/package.
   - Each root has an explicit `rootType` (`local-path` first; more types later) and a free-form `rootMetadata` object for type/provider-specific settings.
   - Each root carries user-editable provenance metadata (`name`, `description`) shown to diagnostics and LLM tooling.
   - Instead of a single root kind enum, each root carries content-type checkboxes (`all` plus specific content classes) that act as scan filters and provenance hints.
   - Family albums are first-class content in this model (`familyAlbums`), not optional side data.
   - Root records also store permission metadata (provider, token handle/id, status) so re-grant flows can be explicit.
   - Default root name is derived from basename (file suffix removed when present) and made unique with an id suffix when needed.
   - Future pass: a root can also represent remote catalog sources (for example Sims community sites) and service-backed manifests, not just local filesystem paths.

2. **Data contracts (`sims-io` package):**
   - `ScanRoot` (`id`, `rootType`, `rootMetadata`, `name`, `description`, `path`, `enabled`, `addedAt`, `contentSelection`, `discoveryBuckets`, permission metadata, `lastScannedAt`).
   - `discoveryBuckets` stores sparse maps of `CatalogRef[]` keyed by names (for example `byContentType.objects` and `byObjectKind.OBJD`); counts are derived (`bucket.length`) instead of duplicated numeric counters.
   - `ScanRun` (`id`, `startedAt`, `finishedAt`, `status`, `rootIds`, aggregate counts).
   - `FileEntry` (`id`, `rootId`, `path`, `name`, `size`, `mtimeMs`, `kind`, `containerId?`, hashes optional).
   - `ContainerEntry` (`id`, `fileId`, `containerKind`, `memberCount`).
   - `ObjectEntry` (`id`, `fileId`, `containerId?`, `objectKind`, `guid?`, `resourceId?`, `label?`).
   - `ChunkEntry` (`id`, `objectId?`, `fileId`, `chunkType`, `chunkId`, `offset`, `size`).
   - `GuidReferenceEntry` (`fromObjectId`, `toGuid`, `sourceChunk`, `evidence`).
   - `ParseIssue` (`id`, `fileId`, `severity`, `code`, `message`, `context`).
   - Future extension (`CatalogRootSource`): arbitrary source metadata for non-filesystem roots, including fields such as `siteUrl`, `serviceUrl`, `username`, `password`, and additional provider-specific key/value metadata.
   - Future extension (`CatalogRootCapabilities`): source capability flags for `search`, `filter`, `incrementalSync`, `subscriberDownloads`, and `publish`.

3. **SQLite schema and indexes (Node first):**
   - Tables: `scan_roots`, `scan_runs`, `scan_run_roots`, `files`, `containers`, `objects`, `chunks`, `guid_references`, `parse_issues`.
   - Indexes: `files(root_id, path)`, `objects(guid)`, `chunks(chunk_type, chunk_id)`, `guid_references(to_guid)`.
   - Constraints: stable ids, foreign keys on, deterministic upsert keys (`root_id + path` for files).

4. **Classifier and scan pipeline:**
   - Recursive walk from each enabled root, with explicit skip rules (`-disabled`, hidden/system paths if configured).
   - Classify by bytes/structure first (magic headers/chunk tables), not filename extensions.
   - Container-aware expansion (FAR members, IFF chunks/resources) into normalized child records.
   - Detect family album resources in IFF (`PICT`/`CMMT`) and represent them explicitly in browse/export surfaces.
   - Interchange roots are tracked in the root map for association/provenance but can be skipped by raw-byte scanners.
   - Robust failure model: one bad file emits `ParseIssue` and scan continues.

5. **Server API (vitamoospace):**
   - `GET /api/files/roots` -> list roots.
   - `POST /api/files/roots` -> add root (`path`, `rootType`, optional `rootMetadata`, optional `name`, optional `description`, `contentSelection`, optional permission metadata).
   - `DELETE /api/files/roots/:id` -> remove root.
   - `PATCH /api/files/roots/:id` -> edit root metadata (`rootType`, `rootMetadata`, `name`, `description`, `enabled`, `contentSelection`, permission metadata).
   - `POST /api/files/roots/:id/regrant` -> mark permission re-granted and refresh permission metadata.
   - `POST /api/files/scan` -> start scan for selected roots.
   - `GET /api/files/scan/:id` -> run status and counts.
   - `GET /api/files/catalog` -> paged query for catalog records (filters: root, row kind, object kind, guid, chunk type, text, album content).

6. **UI tabs (VitaMooSpace):**
   - Add sidebar tabs: `Roots` and `Catalog`.
   - `Roots` tab: root list, add/remove controls, name/description metadata, content-type filter checkboxes (user intent), parallel discovered-item counts derived from `discoveryBuckets` (observed results), object-kind bucket preview (for example `OBJD`, `far-member`, `family-album-image`) with jump-through into Catalog filters, permission/regrant indicators, scan/rescan controls, latest run summary.
   - `Catalog` tab: filter bar + paged table/tree for files/objects/chunks/issues, including object-kind filtering sourced from root discovery buckets; row details pane for metadata and references.
   - Keep current Demo/Help/Debug tabs unchanged while this lands.

7. **First coding milestone acceptance:**
   - User can register multiple roots.
   - Scan runs and completes with per-root/file/object/chunk counts.
   - Paths ending in `-disabled` are absent from results.
   - Catalog tab can query and display discovered records without loading full file payloads into UI memory.
   - Family album resources are detectable and browseable as explicit records.

### Phase B — Milestone 1: “All people → VitaMoo”

1. For each **NBRS** entry (or equivalent graph), open **User#####.iff**, run **appearance** pipeline → vitamoo-ready **CMX/SKN/BMP/CFP** paths or inlined buffers.
2. **FAR resolution:** implement **read from FAR** for vanilla assets; merge **loose files** from **Downloads** / pack folders with a clear **precedence rule** (Downloads override pack, same as modding expectations).
3. Emit **`ContentIndex`**: one entry per Sim (or per outfit variant if you split), scenes optional (“Neighborhood roster” single scene with all bodies, or one scene per family).
4. **Wire vitamoospace (or embed):** “Open save folder” → build index → `loadContentIndex` / `setCharacterSolo` / animation picker.

**Exit:** User grants directory access; all **household / townie** Sims from **N00x** appear in the viewer; user can swap animations and outfits **where assets resolve**.

### Phase C — Lots and “who is on which lot”

1. **House##.iff** parsing for resident lists and object handles (align with `save_manager` + `lot_iff_analyzer` findings).
2. Map **family ↔ house ↔ lot** for UI filtering (“only Sims on Lot 3”).
3. Optional: **SIMI** / **HOUS** for camera and metadata display (not required for vitamoo body playback).

**Exit:** Filter roster by lot; optional lot thumbnail or label in UI.

### Phase D — Round-trip edits (high risk, high value)

1. **Mutable IFF chunk model:** rewrite chunk with size reconciliation or patch table.
2. **Scoped mutations:** money (FAMI budget), safe person fields (mirror Python’s warnings about motives and runtime-only data).
3. **Validation:** re-read after write; optional **snapshot** folder (TS-side copy before write).

**Exit:** Same API works in **Node** first; browser **save** behind explicit “Export modified neighborhood” download if in-place write is undesirable on some hosts.

### Phase E — Objects, architecture, Transmogrifier-class tooling

Work follows **§6** (layered interchange and fidelity profiles). In short:

1. **OBJD/OBJF/SPR/DGRP** resolution and preview (2D first, 3D holodeck later per vitamoo design docs).
2. **GUID collision triage before mutation:** ingest GUID -> object lists, exact-match groups, and similarity matrices for one warning per colliding GUID; treat base-game and expansion objects as immutable anchors. Keep scanners analysis-only: emit complete identifiers/context, then let Cursor/MOOLLM choose remediation tools in a separate disposition phase. For higher-level MOOLLM/human-assisted resolution, run a preflight graph pass over all objects: extract GUID references from Simantics/chunk code, annotate container/path provenance (FAR or directory overlap), and use that graph to preserve coherent inter-object intent during re-GUID decisions. Current groundwork: `vitamoo/io/guid-collision.ts`. See [`guid-collision-analysis-plan.md`](./guid-collision-analysis-plan.md).
3. **Simantics (BHAV)** and other structured chunks: **YAML** (and **JSON** where automation prefers it) as the edit surface; round-trip **decode → edit → encode** into chunk bytes.
4. **Transmogrifier-class** flows: partial export, **patch bundles**, and **derived channel regeneration** (RGB / alpha / Z / zoom) per **fidelity profile**; full interchange with [`gltf-extras-metadata.md`](./gltf-extras-metadata.md) and GPU readback ideas in [`gpu-assets-tooling-roadmap.md`](./gpu-assets-tooling-roadmap.md) where relevant.
5. **Object SQL corpus for higher-level tooling:** scan all objects across selected directories/FARs and export a normalized SQLite database of objects, chunks, GUID references, and provenance so MOOLLM/human-assisted workflows can query intent and relationship graphs directly. Primary target is Node-side batch tooling; optional local browser path can use SQLite WASM (or equivalent) for user-selected saves, with optional read-only publication via Datasette.
6. **Viewer workflow for root management and browsing:** add `Roots` and `Catalog` app tabs so users can add/remove scan roots, annotate roots with provenance names/descriptions, configure content-type filters, manage permission status/regrant, trigger rescans, and explore discovered objects/files/chunks from the normalized inventory.
7. **Interchange root association workflow:** roots can be exported to interchange bundles and interchange bundles can be registered as roots; this preserves source association so later collision/disposition reports can cite both filesystem provenance and interchange provenance for the same object sets.
8. **Family album exchange workflow:** include family album assets/metadata in the same root-based interchange pipeline used for families/houses/objects, with support for both literal copy and decoded interchange forms (for example JSON/YAML metadata plus image/zip payloads) so upload/download stays coherent.
9. **Remote catalog roots and hosted sharing workflow (future pass):** support roots backed by online JSON/YAML feeds and service APIs (for example SimFreaks/Simslice/Zombie Sims-style catalogs), with root-level login metadata, dynamic/incremental sync, server-side search/filter, and optional publish surfaces for user-created collections.
10. **Per-root filter and cache workflow (future pass):** treat root filters as first-class query constraints for what enters the unified catalog, support partial metadata fetch from remote roots (no full-site scrape required), and allow chunked/streamed hydration with persistent cache state.
11. **Root driver architecture (future pass):** implement pluggable drivers for each remote catalog service (first-party service first, then third-party Sims sites), with capabilities for incremental search, metadata listing, object download, object upload, and provider-specific pagination/sync checkpoints.
12. **Root I/O policy and sharing controls (future pass):** model roots as both inputs and outputs (including local directory export/upload and remote publish/upload), with explicit controls over what is uploaded, what is shared publicly vs private backup, and what is written to local disk.
13. **Install-set and save virtualization workflow (future pass):** add tools to stage/activate/deactivate object sets for a game installation, park inactive packages aside, and orchestrate stop/switch/start loops around the game process; extend the same model to virtualized Sims save-file sets for safe profile switching.

---

## 6. Layered interchange: YAML/JSON, partial patches, Transmogrifier-style fidelity

This section is the **authoring and object** counterpart to §1’s **transport** stack: same IFF/FAR sources, but **human-editable layers** and **optional completeness** so simple edits stay small and advanced edits stay possible.

### 6.1 Design philosophy (from Transmogrifier, without XML)

**Transmogrifier** let authors trade **export size** against **explicit detail**: for example export **full RGB + alpha + Z** at **all zoom scales**, or export **only** one scale and **only** RGB for a quick recolor, with the tool **regenerating** missing zooms and channels where the pipeline allows. The interchange was XML-heavy; here we standardize on **YAML** (human diff-friendly, comments), **JSON** (strict schemas, APIs, tests), and **sidecar raw binaries** (e.g. `.png`, `.bin`) when a field is too large or loss-sensitive for inline text.

**Rules:**

- Every **export bundle** carries a **`manifest.yml`** (or `manifest.json`) stating **fidelity profile**, **explicit** assets, and **derived-on-import** steps the importer must run.
- **Importers** are **deterministic**: same manifest + same explicit files → same IFF bytes (within documented float tolerance for resampling).
- **Partial round-trip:** author edits **only** the files listed in the manifest; **patch** merges into an existing IFF (or rebuilds from exploded chunks) without requiring the author to hand-edit untouched chunks.

### 6.2 Layered export/import pipeline (semantic, aligns with MOOLLM IFF-LAYERS)

| Stage | On disk / in memory | Format role |
|-------|---------------------|-------------|
| **A — Container** | Whole `.iff` / `.far` member bytes | Ground truth; snapshot before patch |
| **B — Exploded** | Directory tree: chunk-type folders, deterministic names, raw `.bin` payloads + small `META.yml` | Lossless mirror; good for VCS and hex-adjacent workflows |
| **C — Decoded** | Per-chunk **YAML** or **JSON**: all named fields, hex comments for reserved/unknown, byte offsets | Machine + human edit; **BHAV** as structured opcode sequences (operands as nested data, not opaque hex blobs only) |
| **D — Semantic / reduced** | Shorter YAML: catalog strings only, sprite **profile** references, behavior **diffs** against a known base object | Recoloring, price/name edits, “swap BHAV 0x123 only” |

**Export** can stop at **B**, **C**, or **D** depending on tool. **Import** walks **down** the stack: apply **D** patches onto a **C** or **B** baseline, or **C → B → A** when full reassembly is needed.

### 6.3 Fidelity profiles (examples)

Profiles are **named** in `manifest.yml` and drive which files appear in the bundle and which **derivation** steps run on import.

| Profile | Typical explicit export | Derived on import (examples) |
|---------|-------------------------|------------------------------|
| **`full-sprite-stack`** | RGB + alpha + Z for every zoom the object uses | Nothing, or validate only |
| **`recolor-rgb-one-zoom`** | Single zoom level, RGB only | Alpha/Z copied or inferred from **base object**; other zooms **resampled** or **duplicated** per documented rules (same as classic TMog-style shortcuts) |
| **`catalog-only`** | STR# / catalog fields | No sprite touch |
| **`bhav-patch`** | YAML for one or more BHAV resources | Other chunks unchanged |

Exact resampling and “copy channel from reference object” rules are **versioned** in the manifest so old bundles stay reproducible.

### 6.4 Simantics and structured behaviors

- **BHAV** (and related **BCON**, **TTAB** where needed) export to **YAML** with a **stable schema**: primitives as tagged nodes, operands as typed fields, labels and jump targets resolved to indices on import.
- **STR#** exports as YAML or JSON arrays/maps keyed by language and string id.
- **Round-trip tests** compare **re-encoded chunk size** and **byte-identical** payloads where the encoder is canonical; where the game tolerates padding differences, document tolerance.

Python’s deep BHAV tooling in **SimObliterator Suite** remains a **reference implementation** until TS encoders reach parity; the **YAML schema** is the contract both can target.

### 6.5 Integration with vitamoo docs and GPU authoring

- **[sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md)** — historical **Transmogrifier**, note tracks, community flow; §6 is the **modern interchange** expression of the same ergonomics.
- **[gpu-assets-tooling-roadmap.md](./gpu-assets-tooling-roadmap.md)** — browser **readback** for RGB/alpha/Z aligns with **`full-sprite-stack`** and derived profiles that fill Z from rendered depth.
- **[gltf-extras-metadata.md](./gltf-extras-metadata.md)** — optional **parallel** interchange for 3D/object packaging; manifests can declare **glTF sidecars** alongside IFF patches.

---

## 7. Milestone 1 acceptance criteria (concrete)

- User selects **Sims user-data directory** (browser) or passes **path** (Node).
- Tool discovers at least one **`Neighborhood.iff`** and parses **FAMI** and **NBRS**.
- For **each** neighbor with a resolvable **User#####.iff**, the pipeline produces vitamoo-loadable **character defs** (skeleton + mesh + textures + skills list when available).
- **Downloads** and **Expansion** loose files are consulted so **custom skins and animations** appear when files match naming conventions.
- **No Python runtime** required on the user machine for this path.
- Failures are **per-Sim** (one broken User file does not abort the whole neighborhood).

---

## 8. Relation to existing vitamoo docs

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** — mooshow **hooks**, **`ContentLoader`** (`assetsBaseUrl` + **`fetch`** today), **`ContentIndex`** / **`CharacterDef`**; **L4** targets those APIs and §1’s optional **`ResourceReader`** extension.
- **[gltf-extras-metadata.md](./gltf-extras-metadata.md)** — long-term interchange for packaged assets; save-browser v1 can stay **CMX/SKN/BMP/CFP-native**.
- **[webgpu-renderer-design.md](./webgpu-renderer-design.md)** — holodeck and object pipeline for **later** phases (house architecture, object rendering).
- **[sims-content-pipeline-notes.md](./sims-content-pipeline-notes.md)** — Transmogrifier-era context; **§6** here defines YAML/JSON layered interchange and fidelity profiles.
- **MOOLLM** — [`designs/sim-obliterator`](https://github.com/SimHacker/moollm/tree/main/designs/sim-obliterator), [`skills/sim-obliterator`](https://github.com/SimHacker/moollm/tree/main/skills/sim-obliterator): narrative and **CHARACTER.yml** bridge; §1.3 maps them onto this TS stack; **[IFF-LAYERS.md](https://github.com/SimHacker/moollm/blob/main/designs/sim-obliterator/IFF-LAYERS.md)** aligns with §6.2 stages B–D.

---

## 9. Suggested repository placement

Add a **workspace package sibling to mooshow** under **`vitamoo/`** (for example **`vitamoo/sims-io/`**), registered in **`vitamoo/pnpm-workspace.yaml`**. Use **strict TypeScript**, **`*.test.ts`** next to sources, and **`vitamoo`** as a **dependency** from **`sims-io`** for parsers and (optionally) **`mooshow`** as a **devDependency** for type-only imports of **`ContentIndex`** / **`ContentLoader`** in the bridge—**or** duplicate only the **type** definitions in `sims-io` if you must avoid a cycle (prefer importing types from **`mooshow`** exports).

**vitamoo** remains the **animation, mesh, CFP, render** core; **sims-io** owns **IFF/FAR/save** and **L0** adapters. **No second copy** of CMX/SKN/CFP parsing.

---

## 10. Risk notes

- **Legal / EULA:** tools read user files locally; do not redistribute Maxis assets. Docs and UI should state **user-supplied** game data only.
- **Format drift:** Legacy Collection vs Complete Collection paths differ; automated tests cannot rely on one layout—**capability matrix** in README of sims-io.
- **Security:** browser apps must not exfiltrate directory contents; processing stays **client-side** unless the user opts into an explicit server.

This roadmap prioritizes **roster import into VitaMoo** first, then **lot-aware filtering**, then **save mutation**, then **object/house/transmogrifier** depth—aligned with your stated order: **play every Sim with every animation and outfit you have**, then grow **authoring** tools on the same library base.
