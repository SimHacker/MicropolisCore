# GUID Collision Analysis Plan

This plan covers Sims object GUID collisions during package scans, without mutating files during analysis.

Input policy for this workflow: scan raw files/chunks directly and build our own normalized records; do not depend on precomputed third-party JSON exports as a source of truth.

## Problem shapes

For one GUID, scans can produce:

1. Exact duplicates: same GUID and equivalent object payload.
2. Near duplicates: same GUID and highly similar payloads.
3. Hard conflicts: same GUID and clearly different payloads.

The base game and expansion packages are treated as immutable references. Conflicts should be resolved around them, not by reassigning built-in objects.

## Current groundwork (implemented)

Core analysis utilities live in `vitamoo/io/guid-collision.ts` and are exported from `vitamoo`:

- `buildGuidObjectMap()` / `appendGuidObjectMap()` for incremental GUID -> object-list intake.
- `analyzeGuidBucket()` / `analyzeGuidObjectMap()` for per-GUID classification.
- `buildGuidCollisionWarnings()` for one warning payload per colliding GUID.

The analysis result includes:

- Exact-match groups.
- Similarity matrix between exact groups.
- Near-match clusters.
- Oddball groups.
- Immutable groups (base game / expansion / explicit immutable flag).
- A classification (`unique`, `exact-only`, `near-match`, `conflict`) and recommended next step.

## Cursor/MOOLLM diagnostics-first workflow

This collision layer is intentionally analysis-only.

- Scanners and analyzers should emit warnings/errors with complete identifiers and context:
  - GUID,
  - source path and package/source kind,
  - root metadata (`rootId`, user-provided root `name`, root `description`, root content filter checkboxes, root discovery bucket counts/lists, and optional remote-root service metadata such as site/service URL plus account label),
  - related family-album provenance when present (for example `PICT`/`CMMT` associations),
  - resource id/object type/label where available,
  - exact-group ids and similarity matrix.
- These scripts should not perform file mutations directly.
- Resolution is a separate phase where the LLM/operator chooses the best tool per warning:
  - re-GUID,
  - merge,
  - disable package,
  - defer and inspect in UI.

This split keeps diagnostics deterministic and composable, while letting Cursor/MOOLLM use wider session context and intent when choosing remediation actions.

## Pipeline phases

### Phase 1: Intake

Scan object chunks and collect `GuidCollisionObject` rows with:

- `guid`
- `payload`
- source metadata (`sourcePath`, `sourceKind`, `resourceId`, `objectType`, label)
- immutable signal (`immutable`, or `sourceKind` in base game / expansion)

Classifier policy: skip disabled files/containers during recursive scans. Any path ending in `-disabled` (for example `foo.iff-disabled`) is excluded from automatic intake, except when the operator explicitly adds that disabled file as a root for direct inspection.

### Phase 2: Exact grouping

For each GUID, canonicalize object payloads and group by fingerprint.
This identifies "same GUID, same object bytes/values" clusters.

### Phase 3: Near-match analysis

Compute a similarity matrix between exact groups.
This identifies:

- families of close variants (for guided review),
- groups that are isolated oddballs.

### Phase 4: Warning packaging

Emit one warning per GUID collision with:

- grouped object list,
- similarity matrix,
- immutable vs mutable context,
- recommended next step text.

### Phase 5: Global intent-graph preflight (planned)

Before re-GUID or disable actions, run a whole-library reference scan:

- scan Simantics and other object code/chunks across **all** objects to extract GUID references,
- build a graph of `object -> referenced GUID/object` edges,
- annotate nodes with provenance (`sourcePath`, container/FAR membership, directory grouping),
- compute relatedness signals from path/container overlap so object families stay coherent.

This preflight helps higher-level MOOLLM skills or human operators infer original linkage intent and avoid breaking coherent object sets when resolving one collision bucket.

Root metadata is part of that intent model: user labels such as "Zombie Sims Archive" vs "Random web downloads" should be included in the evidence set so resolution policy can weight coherence and trust signals.

Planned data foundation for this phase:

- scan all objects under configured directories/FARs and persist a normalized SQLite corpus (`objects`, `chunks`, `guid_references`, provenance fields),
- support multiple roots at once (multiple installs, save collections, and custom object folders) with per-root provenance tags,
- run Node-side first for batch pipelines and automation,
- optionally support local browser workflows with SQLite WASM (or equivalent) for user-selected saves/directories,
- publish read-only snapshots through Datasette so other tools and analyses can query the same reference graph directly.

### Phase 6: Disposition workflow (planned)

This phase is not automated yet.

Expected options include:

- keep one object from an exact duplicate group and disable others,
- re-GUID mutable conflicts while preserving immutable built-ins,
- merge near-duplicates if the user chooses,
- mark unresolved sets for manual review in the object explorer.

Planned policy hints for this phase:

- built-in and expansion content are immutable anchors even when unpacked or mirrored in alternate paths,
- objects that claim built-in identity but diverge from immutable anchors are suspicious and candidates for eviction/re-GUID,
- explicit intentional replacement can be represented as a policy marker with priority, so overrides are deterministic instead of accidental.

## Manual and assisted resolution UX

When collisions are obvious, code or an LLM policy can propose a disposition.
When ambiguous, the rendering/inspection surfaces should present:

- object previews,
- side-by-side field diffs,
- similarity matrix,
- safe actions (re-GUID, merge, disable package) with explicit confirmation.

This keeps analysis deterministic while allowing high-confidence automated suggestions and human control for edge cases.
