# Sims Content Registry: dependency resolution, validation, repair

**Status:** Active design  
**Monorepo:** MicropolisCore  
**Companion documents:** [simopolis.md](simopolis.md) · [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [the-imagine-loop.md](the-imagine-loop.md) · [simopolis-uplift-roadmap.md](simopolis-uplift-roadmap.md)  
**Touches:** existing [packages/vitamoo/vitamoo/io/guid-collision.ts](../../packages/vitamoo/vitamoo/io/guid-collision.ts), planned `packages/sims-io/src/l4/`

> **Scope.** Tooling that runs *across* the user's content directories and incoming Tornado-recovered content. Does not modify EA-shipped binaries; operates on user-owned `.iff` files, custom objects, skins, lots, and saves. See [simopolis.md → Scope and intent](simopolis.md#scope-and-intent) for the canonical positioning.

---

## The problem

A Sims save file is not self-contained. A household lot references objects by GUID; those objects live in custom IFFs that may or may not be installed; skins reference body-part meshes by GUID; lots reference templates; family records reference lot files. When *any* of those references fails to resolve, the engine can crash, silently swap in placeholders, or render broken content. This was the Sims-modding community's most persistent pain for two decades.

The pain compounds in Simopolis. We are about to:

- Drop user-authored objects into the install via the [Adventure Compiler](the-computer-as-portal.md).
- Bulk-import [Tornado](the-tornado-and-the-archives.md)-recovered content from `archive.org` snapshots.
- Round-trip saves through the [Imagine Loop](the-imagine-loop.md) that may introduce or rename objects.

If we don't have a content-registry layer underneath, every one of those flows is a potential save-file corruption vector.

This doc specifies the registry, the validation walk, the repair strategies, GUID-collision handling, and LLM-assisted matching for missing references.

---

## The registry

A single content registry per user install (and an in-memory variant per Tornado batch). Built by scanning `Downloads/`, `Custom*/`, and any user-tracked locations. Stored as a SQLite database alongside the user's git-overlaid Sims directory (see [simopolis.md → Git-managed user Sims directory](simopolis.md#git-managed-user-sims-directory)).

```sql
-- one row per IFF (object, skin, lot, etc.)
content_iff(
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL,             -- absolute path to the .iff
  iff_kind TEXT NOT NULL,         -- 'object' | 'skin' | 'lot' | 'neighborhood' | 'savegame' | …
  filename TEXT,
  scan_time INTEGER,
  hash_sha256 TEXT,
  provenance_yml TEXT             -- pointer to a provenance.yml if known
)

-- one row per GUID an IFF declares it provides
provided_guid(
  iff_id INTEGER REFERENCES content_iff(id),
  guid TEXT NOT NULL,             -- 0x...8-hex-digits
  chunk_kind TEXT NOT NULL,       -- 'OBJD' | 'SPR2' | 'BHAV' | …
  inner_id INTEGER,
  declared_name TEXT,             -- the human name from STR# 0:0 if present
  PRIMARY KEY (iff_id, guid, chunk_kind, inner_id)
)

-- one row per GUID an IFF references (and may need to resolve)
required_guid(
  iff_id INTEGER REFERENCES content_iff(id),
  guid TEXT NOT NULL,
  ref_kind TEXT NOT NULL,         -- 'object' | 'skin' | 'lot' | 'parent_template' | …
  resolved_iff_id INTEGER REFERENCES content_iff(id),  -- nullable; null = missing
  resolved_at_scan INTEGER
)

-- one row per detected GUID collision (multiple IFFs provide the same GUID)
guid_collision(
  guid TEXT NOT NULL,
  iff_ids JSON NOT NULL,          -- list of IFFs claiming this GUID
  first_seen INTEGER,
  resolution_policy TEXT,         -- 'newest_wins' | 'oldest_wins' | 'user_picks' | 'unresolved'
  resolved_to_iff_id INTEGER REFERENCES content_iff(id)
)

-- one row per imagined / authored substitution (filled by the LLM-assisted matcher)
guess(
  required_iff_id INTEGER REFERENCES content_iff(id),
  required_guid TEXT,
  candidate_iff_id INTEGER REFERENCES content_iff(id),
  confidence REAL,
  rationale TEXT,                 -- LLM-written, with citations to declared_name, prompt, etc.
  source_view TEXT                -- 'name-match' | 'name+kind' | 'screenshot-similarity' | …
)
```

The registry is rebuildable. Throwing it away and rescanning the user's directories must produce the same result, modulo `guess` rows which the user has explicitly accepted.

---

## The validation walk

Given a target save file (or a candidate Adventure-Compiler output, or a Tornado-recovered bundle), the validation walk:

1. Parses the IFF.
2. Enumerates every reference (objects on lot, skins on Sims, parent-template pointers, etc.) — all `required_guid` rows.
3. Looks up each in the registry's `provided_guid` table.
4. Emits a structured per-reference status:
   - `resolved` — one IFF provides it, no collision.
   - `colliding` — multiple IFFs provide it, no policy resolves it.
   - `missing` — no IFF provides it.
   - `guessed` — no exact match, but `guess` table has a candidate above a confidence threshold.

Output is one of the [Adventure Compiler's standard view shapes](moollm-microworld-os.md#the-adventure-compiler-is-a-coherence-engine-partner-not-a-one-shot-compiler) — `errors-only` for failures, `dependency-graph` for the full walk. Same `{path, severity, message, suggested_fix}` schema as the rest of the compiler.

---

## Repair strategies

When the validation walk finds something broken, repair is *user-mediated*. The tooling proposes; the user accepts. Default strategies, ranked from least invasive to most:

| Strategy | When to use | What it does |
|---|---|---|
| **Annotate-only** | Default for any analysis run | Records the broken reference in the registry; no edits to the save |
| **Substitute from registry** | Missing GUID has a declared-name match in the user's installed content | Rewrite the reference to point at the closest-named local IFF; record the substitution in `provenance.yml` |
| **Substitute from suggestion** | LLM-assisted guess has high confidence | Use the guessed candidate, with the rationale stored in `guess.rationale` and surfaced for review |
| **Insert placeholder** | Object is missing and nothing matches; save would otherwise crash the engine | Drop in a generic stub object (a documented Maxis-default), tagged in YAML as `placeholder: true` so the player can find it in-game and replace |
| **Skip / strip** | The reference is in an optional slot the engine can tolerate empty | Remove the reference; record what was removed |
| **Bulk download from the user's other directories** | The required IFF lives in another tracked location (e.g. a secondary Downloads folder) | Copy/link the IFF into the active install's content path |

The user picks the strategy per session, per object class, or per individual reference. Choices persist in the registry so the same situation next time is one click.

---

## GUID collision and duplication

The Sims modding community's plague: two custom objects shipped by different authors claim the same GUID. The engine picks one (or the wrong one) silently, often clobbering the player's intended object.

The registry's `guid_collision` table captures every collision detected during scan. Resolution policies:

- **`newest_wins`** — pick the IFF with the newest modification time on disk.
- **`oldest_wins`** — pick the longest-installed (often what the player has been using).
- **`user_picks`** — surface in the UI: "two objects claim `0xABCDEF12`. Which do you want active?"
- **`unresolved`** — leave the collision documented; saves that reference this GUID fail validation until the user picks.

For analysis: a *collision-cluster view* groups colliding GUIDs by declared name, by chunk kind, and by overlap with known mod packs, so the user can spot whole-pack conflicts at a glance.

Existing core utilities already live in [packages/vitamoo/vitamoo/io/guid-collision.ts](../../packages/vitamoo/vitamoo/io/guid-collision.ts). The registry wraps them and persists the analysis.

---

## LLM-assisted matching for missing references

When validation finds a `missing` reference and no exact-name registry match exists, the LLM proposes candidates. This is a focused use of the Adventure Compiler's `empathic-template` view: small, narrow, with a structured output.

Input to the LLM call:

- The missing reference's metadata: `guid`, `chunk_kind`, parent-IFF declared name, parent-IFF screenshot if available, the in-save context (lot, room, Sim that uses it).
- A *candidate set* from the registry: IFFs of the same kind, ranked by name similarity, chunk-kind match, scan-time proximity.

Output: a list of `{candidate_iff_id, confidence, rationale}` triples written into the `guess` table. The user reviews; nothing is applied without explicit acceptance.

Concrete examples the LLM should be able to handle:

- *"Missing object referenced as `Modernist Coffee Table by hatperson_2003`. Registry has `Modern Coffee Table` (declared name match, score 0.78) and `Mid-Century Lowboy` (kind match, score 0.41). Pick the first."*
- *"Missing skin GUID with parent IFF named `Bella Goth - Gothic Outfit`. No local skins match by name. Closest-kind candidates ranked by screenshot similarity via WebGPU character render."*
- *"Three IFFs claim the same colliding GUID. One has full STR# in 20 languages, one has only English, one has a placeholder name. Highest-confidence canonical version: the one with full localization."*

The LLM is doing *empathic matching*, not invention. It picks from existing IFFs in the registry; it does not fabricate a replacement out of thin air. If no candidate scores above the threshold, the reference stays `missing` and the user decides whether to accept a placeholder or hold off.

---

## Tools and surfaces

| Surface | Where | Use |
|---|---|---|
| **`pnpm run content-registry scan`** | `tools/content-registry/` | Walk all tracked content directories, (re)build the SQLite registry |
| **`pnpm run content-registry validate <iff>`** | same | Run the validation walk on a save / lot / object; emit structured errors |
| **`pnpm run content-registry repair --strategy=...`** | same | Apply a repair strategy interactively or in batch |
| **`pnpm run content-registry collisions`** | same | Dump collision-cluster report |
| **Micropolis Home UI** | `apps/micropolis-home/src/routes/registry/` | Interactive browser, collision picker, LLM-guess review, repair undo (via git overlay) |
| **Adventure Compiler integration** | `tools/adventure-compiler/validator/dependencies.ts` | Validation walk runs as part of any compile-time check; failures block flatten |
| **Tornado integration** | `tools/tornado/import/` | Every imported batch updates the registry; collisions and missing refs surface for curation before binding |

Each surface ultimately writes through git (per [simopolis.md → Git-managed user Sims directory](simopolis.md#git-managed-user-sims-directory)), so every registry decision is a commit with structured trailers.

---

## Integration with the existing pipelines

| Pipeline | What the registry adds |
|---|---|
| **Phase 0 uplift** | Before a save is shown for editing, the validation walk runs; missing/colliding references surface as warnings the user can choose to fix or ignore |
| **[Imagine Loop](the-imagine-loop.md)** | The IMAGINE → EDIT → INJECT cycle adds a validation step: any LLM-imagined state change that introduces a missing reference is rejected by the validator and sent back for revision |
| **[Adventure Compiler](the-computer-as-portal.md)** | New IFFs the compiler emits get assigned non-colliding GUIDs by checking the registry first; the compiler refuses to flatten if its output would collide |
| **[Tornado](the-tornado-and-the-archives.md)** | Recovered batches feed the registry; collision-cluster review is a mandatory curation step before any Tornado-bound neighborhood is published; LLM-assisted matching helps repair recovered saves whose dependencies didn't make it through the archive |
| **Phase 2 zone-binding** | A residential zone's bound `Neighborhood.iff` only binds if all its lot/object dependencies resolve in the registry |

The registry is the substrate that all five flows lean on. Without it, every flow has to reinvent dependency resolution itself.

---

## Roadmap placement

A small first vertical fits in [Phase 0](simopolis-uplift-roadmap.md#phase-0--end-to-end-uplift-of-one-save-file-1-2-weeks): scan → validate → annotate-only repair. About 3–4 days on top of the existing GUID-collision utilities. The richer repair strategies, LLM-assisted matching, and UI surfaces land in [Phase 1A/1B](simopolis-uplift-roadmap.md#phase-1--moollm-enrichment--family-album-server-3-4-weeks) and become mandatory before Phase 3 Tornado import.

Suggested next task to add to the roadmap:

> **0.9 — Sims Content Registry, first vertical.** SQLite schema + `scan` + `validate --strategy=annotate-only` CLI. Builds on `packages/vitamoo/vitamoo/io/guid-collision.ts`. 3–4 days.
