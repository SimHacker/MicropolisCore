# Filesystem Object Model

## Thesis

MicropolisHub should model world objects as filesystem trees.

This follows the MOOLLM/Self/LambdaMOO lineage: objects are not opaque database rows. They are inspectable directories with slots, behaviors, advertisements, state, history, and links to other objects.

The filesystem is not merely storage. It is an authoring interface, debugging interface, and persistence model.

## Branch as Object Store

A Git branch named like `<type>_<id>` is an object storage scope.

For Micropolis:

```text
branch: micropolis_34345345
root object: MICROPOLIS.yml
rendered view: README.md
```

The branch root is not just a folder of files. It is a typed object with interface declarations, plural collection namespaces, local objects, and references to objects in broader scopes.

The same convention works for naked pocket-universe objects:

```text
branch: city_san-francisco
root object: CITY.yml
rendered view: README.md

branch: macro_foobar
root object: MACRO.yml
rendered view: README.md

branch: catalog_classroom-blueprints
root object: CATALOG.yml
rendered view: README.md

branch: cities_bay-area
root object: CITIES.yml or INDEX.yml
rendered view: README.md
```

A naked object branch contains one root object directly, without needing to be inside a container's plural namespace. This is useful when a city, macro, blueprint, catalog, tool, or tutor wants its own tiny universe: independent history, issues, PRs, releases, permissions, and imports.

Collections can be naked pocket universes too. A `cities_bay-area` branch can contain a collection of city objects without being wrapped in a `micropolis_<id>` container:

```text
CITIES.yml
haight/
  CITY.yml
  haight.cty
mission/
  CITY.yml
  mission.cty
oakland/
  CITY.yml
  oakland.cty
```

A collection branch may be a naked directory with no index file when the collection type is obvious from the branch name. Prefer an interface file when the collection has inheritance, behavior, state, policies, generated indexes, or advertisements:

- `INDEX.yml` for a generic collection interface.
- `CITIES.yml` for a collection whose children are city objects.
- `MACROS.yml` for a collection whose children are macro objects.
- `BLUEPRINTS.yml` for a collection whose children are blueprint objects.
- `CATALOG.yml` when the collection is curated, published, versioned, or meant to be browsed as a catalog.

Container objects can later collect naked objects through manifests:

```text
MICROPOLIS.yml
README.md
MANIFEST.yml
cities/
  haight/
    CITY.yml
imports/
  city_san-francisco.yml
  macro_foobar.yml
```

The manifest can say whether an object is embedded, mirrored, vendored, or referenced by branch/repo URL. This lets a `micropolis_<id>` branch suck standalone objects into its directory tree without erasing their independent identity.

Objects can live at different scopes:

- **City scope:** objects that belong to one city, such as its timeline, map payload, annotations, layers, neighborhoods, and city-specific reports.
- **Micropolis branch scope:** objects shared by many cities in the branch, such as macros, blueprints, tools, prototypes, policies, tutors, branch reports, and issue objects.
- **Standalone object branch scope:** naked branches such as `city_san-francisco`, `macro_foobar`, or `catalog_classroom-blueprints`.
- **Standalone collection branch scope:** plural/collection branches such as `cities_bay-area`, `macros_road-tools`, or `blueprints_transit-patterns`.
- **Global repository scope:** defaults and libraries from `main`, course templates, shared prototypes, common macros, and canonical tools.
- **External repository scope:** public blueprint libraries, class repositories, research datasets, and imported skills.

## Directory as Object

A directory is an object.

```text
MICROPOLIS.yml
README.md
cities/
  haight/
    CITY.yml
    README.md
    haight.cty
    neighborhoods/
      south-docks/
        OBJECT.yml
        CARD.yml
        notes.md
        layers/
        history/
macros/
  repeat-road-block/
    MACRO.yml
    README.md
    commands.jsonl
blueprints/
  neighborhood-grid/
    BLUEPRINT.yml
    README.md
    commands.jsonl
```

`MICROPOLIS.yml` declares that the branch root is a Micropolis world object. `CITY.yml` declares that a child directory is a city object. `OBJECT.yml` contains generic object state. `CARD.yml` advertises what the object can do. Child directories are slots, namespaces, or contained objects.

Plurally named directories are collection namespaces. The name is part of the interface:

- `cities/` contains city objects.
- `macros/` contains macro objects.
- `blueprints/` contains blueprint objects.
- `prototypes/` contains prototype objects.
- `tools/` contains tool objects.
- `tutors/` contains tutor/character objects.
- `issues/` contains issue objects.
- `reports/` contains report objects.

The `cities/` directory is a namespace. Its child directory names are city ids within the current `micropolis_<id>` branch. The traditional SimCity save-file name without suffix maps naturally to this city id:

```text
classic filename: haight.cty
city object:      cities/haight/
interface:        cities/haight/CITY.yml
payload:          cities/haight/haight.cty
```

Do not place a generic raw `city.cty` at branch root. Every city lives in a named directory so it can grow layers, timelines, annotations, dialogs, behaviors, generated reports, previews, and alternate payloads without losing its identity.

## README.md as Rendered View

Every meaningful object directory should usually have a `README.md`.

GitHub renders `README.md` after the file index for any directory, so it is the natural human-facing landing page for a branch root, city, macro, blueprint, catalog, collection, issue object, tool, tutor, or proposal.

But `README.md` should not be the canonical source of truth when structured files exist. Treat it as a generated or regeneratable view over the real object files:

- Interface files: `MICROPOLIS.yml`, `CITY.yml`, `MACRO.yml`, `BLUEPRINT.yml`, `CATALOG.yml`, `INDEX.yml`.
- State files: `OBJECT.yml`, `metadata.yml`, `MANIFEST.yml`.
- Command streams: `commands.jsonl`, `timeline/`.
- Evidence: previews, reports, artifacts, screenshots, analysis outputs.
- Human authored rationale: `notes.md`, `proposal.md`, `discussion.md`.

Recommended convention:

```text
README.md          # rendered human page, generated or hand-edited with care
README.source.yml  # optional generation config/provenance
```

Generation should be idempotent. If humans edit a generated README, the generator should preserve marked manual sections or report drift instead of silently overwriting.

## Files as Slots

Self language used slots as named references. A filesystem object can do the same:

```text
airport-proposal/
  OBJECT.yml       # identity, state
  CARD.yml         # methods/advertisements
  proposal.md      # human-readable rationale
  votes.yml        # governance slot
  preview.png      # visual slot
  commands.jsonl   # command slot
```

The path itself is a K-line. Seeing `airport-proposal/votes.yml` tells a human or LLM what kind of object this is and what is relevant.

## Prototype Inheritance

Objects can inherit from prototypes:

```yaml
object:
  id: airport-proposal-001
  parents:
    - /prototypes/proposal
    - /prototypes/zone-build-proposal
    - /prototypes/expensive-public-decision
```

Lookup should conceptually work like Self:

1. Check local slot.
2. If missing, delegate to parent prototypes in order.
3. Allow local override.
4. Preserve inspectability: show where a value came from.

This can be implemented gradually. At first, inheritance can be advisory YAML used by LLMs and tooling. Later, a smart orchestrator can operationalize it.

## CARD.yml as Interface

Every meaningful object can have a `CARD.yml` sidecar:

```yaml
card:
  id: airport-proposal-001
  type: [proposal, city-object, governance]
  tagline: "Build an airport near the industrial rail corridor."

advertisements:
  VOTE:
    score: 100
    condition: "Player can approve or reject this proposal"
  PREVIEW:
    score: 95
    condition: "Show map and budget consequences"
  BRANCH:
    score: 80
    condition: "Try this proposal in an alternate timeline"
```

This mirrors The Sims object advertisement model: objects announce what they can do. Pie menus, chat commands, LLM suggestions, and UI buttons can all be derived from advertisements.

## Object Types

Candidate object directories:

- Micropolis branch root.
- City.
- City namespace.
- Macro namespace.
- Blueprint namespace.
- Prototype namespace.
- Tool namespace.
- Issue namespace.
- Zone.
- Neighborhood.
- Road corridor.
- Proposal.
- Vote.
- Chat thread.
- AI tutor.
- Scenario.
- Layer.
- Annotation.
- Sign.
- Command leaf.
- Command file.
- Command blueprint.
- Command macro.
- Playback cursor.
- Timeline merge.
- Timeline rebase.
- Timeline conflict.
- Timeline resolution.
- History rewrite.
- Branch timeline.
- Replay checkpoint.
- Tool.
- Behavior script.

## Behavior as Data

Behaviors should be inspectable:

```text
behaviors/
  tax-policy-explainer/
    CARD.yml
    behavior.md
    commands.yml
    examples/
```

Eventually, behaviors may be:

- Command bus command definitions.
- TypeScript modules.
- Svelte components.
- MOOLLM skills.
- Visual programming blocks.
- Snap!/Logo-style scripts.

But the first representation should be readable documentation plus structured declarations.

## Timeline Objects

Timeline operations should also be filesystem objects. A merge, rebase, conflict, resolution, or rewrite is not just a CLI side effect; it is a thing players can inspect, discuss, teach from, and replay.

Example:

```text
timeline/
  commands/
    2026-04-28T11-15-03.123Z_cmd_000423_tax-increase.yml
  conflicts/
    conflict_0007/
      CONFLICT.yml
      ours.yml
      theirs.yml
      map-region.yml
      discussion.md
  resolutions/
    2026-04-28T12-03-11.001Z_resolve_conflict_0007.yml
  rewrites/
    2026-04-28T12-08-55.441Z_rewrite_000009.yml
```

This is how the game teaches the Git world model. Players do not merely hear that branches, merges, rebases, and conflicts exist. They see them as world objects with causes, consequences, actors, evidence, and repair commands.

## Blueprint and Macro Objects

Reusable command streams should be filesystem objects too.

Example:

```text
blueprints/
  neighborhood-grid/
    BLUEPRINT.yml
    commands.jsonl
    preview.png
    source/
      snap-project.xml
      generator.md
    examples/
      radial-city.yml
    variants/
      mirrored.yml
      rotated-90.yml
macros/
  repeat-road-block/
    MACRO.yml
    commands.jsonl
    cursor.yml
```

`BLUEPRINT.yml` should describe:

- Anchor/origin.
- End cursor or stride.
- Coordinate space.
- Allowed transforms.
- Required budget/resources.
- Preview policy.
- Conflict policy.

The command stream remains readable and replayable. Plopping a blueprint should create playback command records, not silently paste tiles. That way a city can explain that a neighborhood exists because a player replayed `blueprint_neighborhood_grid_0007` at `[42, 18]` with a 90 degree rotation.

Snap!, Logo, Scratch-like blocks, and other visual programming systems should generate these same objects. The visual program belongs in `source/`; the generated command stream belongs in `commands.jsonl`; previews and playback records document what happened in the city.

This lets players programmatically generate, transform, parameterize, place, and play back recorded macros while keeping the result inspectable as files.

## User-Defined Layers

User layers are objects too:

```text
layers/
  chalk/
    OBJECT.yml
    strokes.jsonl
  neighborhood-names/
    OBJECT.yml
    regions.geojson
  reporter-notes/
    OBJECT.yml
    notes.md
```

Layers can have:

- Geometry.
- Visibility.
- Author.
- Timestamp.
- Linked command.
- Linked chat message.
- Linked branch.
- Rendering hints.

## Multiplayer Dialog Objects

A governance dialog should persist as a tree:

```text
dialogs/
  build-airport-0007/
    DIALOG.yml
    proposal.md
    votes.yml
    chat.md
    previews/
      budget.json
      traffic.txt
      map.png
```

This means a dialog is not lost when the live session ends. It becomes part of the city's civic memory.

## AI Tutor Objects

AI tutors are also objects:

```text
tutors/
  economist/
    CHARACTER.yml
    CARD.yml
    memory.yml
    comments/
```

They can advertise actions:

- Explain budget.
- Critique proposal.
- Compare branches.
- Run experiment.
- Ask question.

They should not silently mutate the world. They propose commands through the command bus.

## Object Granularity

Not every tile should be a directory by default. That would be too noisy.

Use directories for meaningful objects:

- A neighborhood, not each residential tile.
- A branch, not each tick.
- A proposal, not each UI click.
- A command leaf, not necessarily every command as a file.

Tile-level data belongs in compact layer formats unless a tile becomes semantically important.

## Inspectability Principle

A learner, teacher, LLM, or developer should be able to answer:

- What is this object?
- What can it do?
- Who changed it?
- Why was it changed?
- What does it inherit?
- What depends on it?
- How do I branch from it?

Filesystem trees make those questions approachable without a custom database browser.

## Future Smart Runtime

In a smart MOOLLM/MOOCO runtime:

- Directory listing becomes object discovery.
- `CARD.yml` advertisements become UI actions.
- `parents:` become prototype delegation.
- `metadata.yml` becomes object state.
- File writes become world mutations.
- Git commits become world history.

In a generic runtime:

- Humans and LLMs can still read the files manually.
- CLI scripts can still operate on them.
- The representation remains useful without magic.

## Design Rule

If an object matters to learning, governance, replay, collaboration, or authorship, it deserves a readable place in the filesystem.
