# Command Path and Collaboration Modes

## Thesis

MicropolisHub should have one command path that works across live play, asynchronous GitHub collaboration, LLM proposals, visual programming, macros, blueprints, and replay.

The central rule:

```text
Human / LLM / program action
  -> CommandBus
  -> command record
  -> object directory
  -> branch commit
  -> replay / preview / merge / rebase / weave
```

The browser can feel immediate. Git can remain durable. GitHub can teach collaboration. The filesystem can stay inspectable.

## Collaboration Modes

### Live Browser Mode

Players run the real-time simulator in their browsers.

The browser owns immediacy:

- Input events.
- Pie menus.
- Direct manipulation.
- Keyboard shortcuts.
- Local preview.
- Animation.
- Fast feedback.

The browser does not become the durable source of truth by itself. Durable mutations are recorded as commands.

Flow:

```text
Svelte UI gesture
  -> CommandBus dispatch
  -> local simulator applies immediately
  -> CommandRecorder emits timestamped command record
  -> command record lands in the correct object tree
  -> Git commit/push when policy says
```

This mode supports fast play, but still teaches Git: every durable edit can become a file, commit, branch, and replay step.

### Async Civic Mode

Players collaborate through issues, PRs, reviews, reports, and Actions.

GitHub owns deliberation:

- Issues host questions and proposals.
- PRs compare timelines.
- Actions replay and validate.
- Bots comment with evidence.
- Reviews approve or reject.
- Pages publishes the readable UI.

Flow:

```text
proposal
  -> issue discussion
  -> workflow preview
  -> vote/review
  -> command commit
  -> replay/report
  -> merge or reject
```

This mode deliberately slows the game down so students explain, argue, reflect, and learn collaboration.

### Hybrid Classroom Mode

A class can mix both modes.

Examples:

- Students experiment live in browser branches, then submit PRs.
- A teacher keeps the protected classroom branch slower and reviewed.
- Bots replay student branches and produce reports.
- Issue comments are the main social surface while browser sessions stay local and exploratory.

The same command records work in all modes.

## End-to-End Command Lifecycle

1. A surface requests an action.
2. The CommandBus finds the command by id.
3. Policy decides whether to run, preview, propose, or require approval.
4. The command runs in the appropriate context.
5. A command record is created.
6. The record is written to the correct object tree.
7. Commit policy decides when to commit.
8. Replay or validation materializes the resulting state.
9. Reports, README files, previews, and GitHub artifacts update.

Surfaces include:

- Browser UI.
- Pie menus.
- Keyboard shortcuts.
- Chat slash commands.
- LLM proposals.
- CLI scripts.
- MCP tools.
- Snap!/Logo/Scratch-like visual programs.
- Macro and blueprint playback.
- GitHub bot workflows.

All of these should converge on command records.

## Source of Truth Rules

### Interface Files

Interface files declare object identity, supported protocols, inheritance, and advertised capabilities.

Examples:

- `MICROPOLIS.yml`
- `CITY.yml`
- `CITIES.yml`
- `MACRO.yml`
- `BLUEPRINT.yml`
- `CATALOG.yml`
- `INDEX.yml`
- `TOOL.yml`
- `ISSUE.yml`

These are sources of truth for what an object is and how it should be interpreted.

### Manifest Files

`MANIFEST.yml` declares imports, mounts, mirrors, vendored copies, and instantiated objects.

It answers:

- Which external or branch-local objects are part of this container?
- Where are they mounted?
- Are they referenced, mirrored, vendored, or instantiated?
- What source branch/repo did they come from?

### Command Records

Command records are the source of truth for durable mutations.

They should be:

- Timestamped.
- Ordered.
- Replayable.
- Attributed.
- Policy-aware.
- Transformable when used as macro or blueprint material.

City-mutating command records usually live under:

```text
cities/<city-id>/timeline/
```

Branch-level command records live under branch-level timelines when they mutate the container namespace:

```text
timeline/
```

Examples:

- Create city.
- Rename city.
- Import city branch.
- Mount macro collection.
- Publish catalog.
- Merge timeline.

### State Files

State files describe current object state.

Examples:

- `OBJECT.yml`
- `metadata.yml`
- `votes.yml`
- `cursor.yml`
- `policy.yml`

State files are allowed, but if a state change is meaningful and durable it should also be explainable by a command record or an explicit repair/rewrite record.

### Classic Payloads

Classic simulator payloads remain valid:

```text
cities/haight/haight.cty
cities/haight/haight.mop
```

They are not the whole object. They are payload slots inside a city object.

### README.md

`README.md` is the GitHub-rendered human view.

It should usually be generated from structured sources:

- Interface files.
- Manifest files.
- Command summaries.
- Reports.
- Previews.
- Issue links.
- Provenance.

It is not the canonical database when structured files exist.

## Object Placement Rules

### City-Local

Put data inside `cities/<city-id>/` when it only makes sense for that city.

Examples:

- `.cty` / `.mop` payloads.
- City timeline.
- City snapshots.
- City layers.
- Neighborhoods.
- City annotations and signs.
- City-specific proposals.
- City reports.

### Branch-Scope

Put data at Micropolis branch scope when it is shared by many cities or mutates the branch namespace.

Examples:

- `macros/`
- `blueprints/`
- `prototypes/`
- `tools/`
- `tutors/`
- `issues/`
- `reports/`
- `policies/`
- branch-level `timeline/`

Macros and blueprints should not be hidden inside one city if they are reusable across the branch.

### Naked Object Branch

An object can live alone in its own branch:

```text
city_san-francisco
macro_foobar
blueprint_neighborhood-grid
catalog_classroom-blueprints
```

The root interface file declares the object:

```text
CITY.yml
MACRO.yml
BLUEPRINT.yml
CATALOG.yml
```

### Naked Collection Branch

A collection can also live alone:

```text
cities_bay-area
macros_road-tools
blueprints_transit-patterns
```

It can be a naked directory, or declare behavior and state with:

- `INDEX.yml`
- `CITIES.yml`
- `MACROS.yml`
- `BLUEPRINTS.yml`
- `CATALOG.yml`

## Manifest Mounting

Containers and catalogs assemble objects through manifests.

Example:

```yaml
manifest:
  imports:
    - id: city_san-francisco
      type: city
      source:
        repo: classroom/micropolis-worlds
        branch: city_san-francisco
      mount: cities/san-francisco
      mode: reference

    - id: macros_road-tools
      type: macros
      source:
        repo: classroom/micropolis-tools
        branch: macros_road-tools
      mount: macros/road-tools
      mode: mirror
```

Import modes:

- `reference`: keep the object in its source branch/repo.
- `mirror`: copy current content but remember source identity.
- `vendor`: copy into the container and let the container own future edits.
- `instantiate`: create a new object from the source as a template.

## Macro, Blueprint, and Visual Program Path

Recorded macros and generated blueprints use the same command path.

```text
record gesture / run visual program
  -> relative command stream
  -> MACRO.yml or BLUEPRINT.yml
  -> preview transform
  -> playback command records
  -> city timeline or branch timeline
```

Snap!, Logo, Scratch-like systems, LLMs, and scripts should generate command streams, not hidden tile diffs.

This keeps generated work:

- Inspectable.
- Parameterized.
- Transformable.
- Previewable.
- Replayable.
- Mergeable.
- Teachable.

## GitHub Automation Path

GitHub Actions should consume the same object tree.

Actions can:

- Validate interfaces.
- Render README files.
- Replay command records.
- Materialize computed layers.
- Generate screenshots.
- Compare branches.
- Publish reports.
- Comment on issues.
- Update Pages.

Actions should not silently mutate canonical state unless represented by command records, repair records, or generated-output conventions.

## Failure Paths

### Disabled Command

If a command is disabled in the current context, record nothing unless the failed attempt is pedagogically useful.

### Proposal Required

If policy requires approval:

```text
LLM/action source
  -> preview
  -> proposal object
  -> approval/rejection
  -> command dispatch only after approval
```

### Replay Conflict

Git can merge files. Micropolis must merge meaning.

When replay fails:

- Create a conflict object.
- Cite commands, branches, actors, and affected objects.
- Preserve the unresolved state as an inspectable object.
- Resolve by adding an explicit resolution command.

### Direct File Edit

Direct file edits are allowed for authoring, repair, and bootstrap work, but durable semantic changes should be explainable.

If a file edit bypasses the command path, use one of:

- Repair record.
- Rewrite record.
- Manifest update.
- Explicit authored object revision.

Avoid two competing truths: "the file changed" and "the command log says otherwise."

## Implementation Order

1. Add a minimal command recorder that subscribes to `CommandBus`.
2. Emit serializable command records in memory.
3. Generate timestamped filenames.
4. Export JSONL for inspection.
5. Add object-tree writers for browser/CLI/server contexts.
6. Add README generators.
7. Add replay validation.
8. Add manifest mounting.
9. Add semantic merge and conflict objects.

The first vertical slice should be small:

```text
CommandBus dispatch
  -> CommandRecorder
  -> CommandRecord[]
  -> export JSONL
```

After that, connect records to object directories and Git.

## Related Documents

- `command-timeline-git-branches.md`
- `filesystem-object-model.md`
- `github-as-mmorpg-multiverse.md`
- `moollm-micropolis-integration.md`
- `collaborative-microworld-lineage.md`
- `multiplayer-browser-lessons.md`
