# Command Timeline and Git Branch Model

## Thesis

Micropolis command history should be persistent world state, not transient UI history.

Every human, LLM, MCP tool, script, multiplayer vote, pie menu, keyboard shortcut, or direct manipulation gesture ultimately becomes a command record. Those command records live inside the save-file directory of content, stored in a GitHub repository branch for that universe.

The branch is the universe. The save directory is the world. Commands are leaves. Commits are branchable edit points.

## Branch Naming

Branches should use a typed, globally distinguishable pattern:

```text
<type>_<id>
micropolis_971987439573945
```

The `type` lets one repository host multiple microworld kinds later:

- `micropolis_<id>`
- `scenario_<id>`
- `classroom_<id>`
- `experiment_<id>`
- `tutorial_<id>`

The `id` should be stable, URL-safe, and unique enough for GitHub branch names.

## Branch Directory as Micropolis World State

A `micropolis_<id>` branch is not a single raw `.cty` file. It is a Micropolis world namespace and a MOOLLM-style filesystem object store.

At the top level, the branch should declare its interface:

```text
MICROPOLIS.yml
cities/
  haight/
    CITY.yml
    haight.cty
    metadata.yml
    layers/
    timeline/
    dialogs/
    proposals/
    annotations/
    behaviors/
    snapshots/
  tokyo/
    CITY.yml
    tokyo.cty
    metadata.yml
    layers/
    timeline/
    snapshots/
macros/
  repeat-road-block/
    MACRO.yml
    commands.jsonl
blueprints/
  neighborhood-grid/
    BLUEPRINT.yml
    commands.jsonl
prototypes/
  city/
    CITY.yml
tools/
  road/
    TOOL.yml
issues/
  issue_123234/
    ISSUE.yml
reports/
dialogs/
```

`MICROPOLIS.yml` says "this branch is a Micropolis object and supports Micropolis branch/world interfaces." Plurally named directories are collection namespaces. Their names imply the object type of their children:

- `cities/` contains city objects.
- `macros/` contains reusable command macro objects.
- `blueprints/` contains reusable relative command stream objects.
- `prototypes/` contains prototype objects for delegation/inheritance.
- `tools/` contains tool definitions or tool objects.
- `issues/` contains structured issue objects, possibly mirrored from GitHub issues.
- `reports/` contains generated or authored branch-level reports.
- `dialogs/` contains branch-level conversations and governance dialogs.

Some things belong with a city. Some things belong with the Micropolis branch itself.

City-local examples:

- A city's `.cty`/`.mop` payload.
- A city's timeline.
- A city's layers, annotations, signs, neighborhoods, snapshots, and reports.
- Dialogs/proposals that only make sense inside one city.

Branch-level examples:

- Reusable macros and blueprints.
- Shared tools, behaviors, prototypes, tutors, policies, issue objects, and branch reports.
- Commands that create, rename, copy, delete, merge, or import cities.

Other objects may come from global scopes: the repository `main` branch, a shared course repo, a public blueprint repo, or another Micropolis branch. A branch can reference those global objects instead of copying them immediately.

## Naked Object Branches and Manifests

Not every object has to start inside a `micropolis_<id>` container.

It is also valid to pop an object out into its own pocket-universe branch:

```text
city_san-francisco/
  CITY.yml
  README.md
  san-francisco.cty
  timeline/
  layers/

macro_foobar/
  MACRO.yml
  README.md
  commands.jsonl

catalog_classroom-blueprints/
  CATALOG.yml
  README.md
  blueprints/
  MANIFEST.yml

cities_bay-area/
  CITIES.yml
  README.md
  haight/
    CITY.yml
    haight.cty
  mission/
    CITY.yml
    mission.cty
```

The branch name still follows `<type>_<id>`. The root interface file declares what kind of object the branch contains. A naked city branch is a city object at branch root; a naked macro branch is a macro object at branch root.

Each object should usually include `README.md` as its GitHub-rendered view. The README should summarize the interface file, manifest, command streams, provenance, previews, and reports. It should be generated from those sources where possible, not treated as the only authoritative state.

A collection can also be popped out as its own pocket universe. A `cities_bay-area` branch is the `cities/` collection promoted to branch scope. It may be just a naked directory of city objects, or it may declare collection behavior with `INDEX.yml` or a type-specific interface like `CITIES.yml`.

Use collection interface files when the collection needs:

- Inheritance or prototype declarations.
- Import/export behavior.
- Sorting, indexing, search, tags, or generated catalogs.
- Permissions and governance policy.
- Validation rules for child object types.
- Advertised operations such as "add city", "fork city", "publish catalog", or "mount into Micropolis".

Container objects can collect or mount these standalone objects using manifests:

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
    - id: macro_foobar
      type: macro
      source:
        repo: classroom/micropolis-worlds
        branch: macro_foobar
      mount: macros/foobar
      mode: vendor
```

Import modes:

- `reference`: keep the object in its source branch/repo and refer to it.
- `mirror`: copy current content but remember source identity.
- `vendor`: copy into the container and let the container own future edits.
- `instantiate`: create a new object from the source as a template.

This lets Micropolis branches, catalogs, course packs, or other collecting objects assemble worlds from independent object branches. A city can live naked as `city_san-francisco`, then be mounted into `micropolis_34345345/cities/san-francisco/` by manifest. A macro can live naked as `macro_foobar`, then appear in many Micropolis branches without losing provenance.

The same works for collections. A `cities_bay-area` branch can be mounted into `micropolis_34345345/cities/`, or into a catalog that collects regional city sets. The container decides whether to reference, mirror, vendor, or instantiate the collection.

Each child of `cities/` is a city directory. Its directory name is the city id within that branch's city namespace. For compatibility with the traditional desktop concept of a SimCity save filename, map the classic save filename without its suffix to the city directory name:

```text
haight.cty  -> cities/haight/
tokyo.cty   -> cities/tokyo/
```

Do not store a generic raw `city.cty` at branch root. A city must live inside a uniquely named city directory with a `CITY.yml` interface file. The binary `.cty` or `.mop` payload can live inside that directory, preferably using the same basename as the city id when preserving the classic filename is useful.

The exact city package format is future work, but command timelines belong inside city directories when the commands mutate that city. Branch-level timelines may also exist for operations that affect the whole Micropolis namespace, such as creating, renaming, copying, deleting, importing, templating, or merging cities.

## Commands as Leaves

A leaf is a coalesced run of one or more commands stored as data.

Example:

```yaml
leaf:
  id: leaf_000143
  starts_at_tick: 18432
  ends_at_tick: 18449
  parent_checkpoint: snapshot_000120
  commands:
    - id: cmd_001
      command_id: view.pan-left
      actor: user:a2deh
      source: keyboard
      args: { scale: 1 }
    - id: cmd_002
      command_id: tool.road.drag
      actor: user:a2deh
      source: pointer
      args:
        from: [43, 21]
        to: [51, 21]
```

Leaves may be stored as JSONL, YAML, or another append-friendly format. The important property is that a leaf retains the internal command boundaries even when the Git commit coalesces many commands.

## Timestamped Command Files

Command records should be stored in files with sortable timestamped names. This makes replay, merge, and rebase mechanics much easier because ordinary directory order approximates causal order.

Example:

```text
cities/haight/
  timeline/
    commands/
      2026-04-28T11-15-03.123Z_cmd_000423_tax-increase.yml
      2026-04-28T11-15-08.912Z_cmd_000424_build-road.yml
      2026-04-28T11-16-21.004Z_cmd_000425_approve-stadium.yml
```

For coalesced leaves:

```text
cities/haight/
  timeline/
    leaves/
      2026-04-28T11-15-00.000Z_leaf_000143.jsonl
      2026-04-28T11-15-00.000Z_leaf_000143.commit.yml
```

Use big-endian UTC timestamps:

```text
YYYY-MM-DDTHH-MM-SS.mmmZ_<kind>_<id>_<slug>.<ext>
```

Benefits:

- `ls` becomes a chronological index.
- Git diffs are easier to scan.
- LLMs can infer time order from filenames.
- Merge conflicts are less likely than when editing one giant log file.
- Branch replay can concatenate sorted command files.
- Partial replay can stop at a timestamp, sequence number, or command id.

The timestamp is not the only ordering authority. Each command should still carry a stable sequence id, parent command id, actor, branch, simulator tick, and optional causal dependencies. The filename is the human/Git-friendly index; the record contents are the semantic source of truth.

## Timeline Merge and Rebase

If command history is represented as timestamped files, branches can exchange histories naturally.

Example:

1. Branch from `micropolis_971987439573945` into `experiment_tax_policy_003`.
2. Perform experiment commands on the experiment branch.
3. Generate reports and evidence.
4. Rebase or merge command files back into the source timeline.
5. Replay the merged command sequence to materialize the combined world.

This is closer to source control than save-game copying:

- Git merge combines command files.
- Replay applies command semantics.
- Conflicts happen at meaningful command or object boundaries.
- Users can inspect the history as files.

Rebase becomes alternate-reality editing:

- Replay my experiment commands on top of a newer class timeline.
- Replay a student's branch after the teacher merges another student's work.
- Move a proposal from an old city state to a newer one.
- Compare two proposed futures by replaying them from the same checkpoint.

This can fail in interesting, educational ways:

- The target tiles are no longer empty.
- Budget is now insufficient.
- Traffic consequences changed.
- A prerequisite proposal was rejected.
- Two branches resolved the same proposal differently.

These failures should be reported as simulation/domain conflicts, not just Git conflicts.

## Command Merge Semantics

Not all commands merge the same way.

Commands that affect disjoint regions or append-only records may merge cleanly:

- Draw road in separate area.
- Add annotation.
- Add newspaper article.
- Add branch report.
- Add issue evidence.

Commands that mutate shared state need semantic conflict handling:

- Two branches build different structures on the same tiles.
- One branch bulldozes what another branch builds.
- Tax or budget changes overlap.
- One branch changes roles or permissions.
- Two branches resolve the same proposal differently.

Each command type should eventually declare merge metadata:

```yaml
merge:
  commutative: false
  conflict_key: "tile-region | budget | proposal-id | role | layer-id"
  conflict_strategy: prompt
  replay_order: timestamp
```

This belongs in command metadata or command-type definitions. The Git merge decides which files exist; the Micropolis replay engine decides whether the combined command history makes sense.

## Replay Is the Semantic Merge Engine

Git can merge files. Micropolis must merge meaning.

The replay engine should:

1. Sort command files by timestamp and sequence.
2. Validate command preconditions.
3. Apply commands through the command bus or a headless equivalent.
4. Detect semantic conflicts.
5. Produce a conflict report that cites commands, actors, branches, tiles, proposal ids, and affected objects.
6. Let humans, teachers, bots, or LLMs propose resolution commands.

The merged branch should not be considered materialized until replay succeeds or unresolved conflicts are explicitly represented as world objects.

## Live Play Produces Git History

During actual play, one or more browser clients can run the real-time simulator locally. They do not need to wait for GitHub Actions for every animation frame or city tick.

The live browser loop is:

1. Player acts in the Svelte UI.
2. The command bus validates and previews the action.
3. The local simulator applies the action immediately.
4. The command recorder writes timestamped command files.
5. The client or companion CLI commits those command files to the player's branch.
6. The branch can be pushed, merged, rebased, or proposed as a PR.

This turns play into Git literacy:

- Branching means trying an alternate future.
- Rebasing means replaying your experiment on top of somebody else's newer world.
- Merging means weaving command histories together.
- Conflicts become questions about city meaning, not just file text.
- Rewriting history becomes an explicit pedagogical act with logs and audit trails.

The main branch can accept changes in near real time if the group wants a fast shared world. It can also require PR review, issue votes, teacher approval, or bot validation if the group wants a slower civic world.

## CLI Timeline-Weaving Tools

The CLI should grow commands specifically for resolving merges, rebases, branch replay, command weaving, and history repair.

Candidate commands:

```text
micropolis timeline record <city-dir> --command <command.yml>
micropolis timeline replay <city-dir> --from <checkpoint> --to <timestamp|command-id>
micropolis timeline merge <city-dir> --ours <branch> --theirs <branch>
micropolis timeline rebase <city-dir> --branch <experiment> --onto <main>
micropolis timeline weave <city-dir> --inputs <branch...> --policy <policy.yml>
micropolis timeline conflicts <city-dir>
micropolis timeline resolve <city-dir> --conflict <id> --command <resolution.yml>
micropolis timeline rewrite <city-dir> --from <command-id> --script <rewrite.ts>
micropolis timeline repair-sidecars <city-dir>
```

These are not just developer utilities. They are game mechanics and teaching tools.

The CLI should explain what it is doing in Git/world terms:

- "Replaying 38 commands from `experiment_tax_policy_003` onto `main`."
- "Command `cmd_000512_build-road` conflicts with `cmd_000488_bulldoze` on tiles `[42,18]..[47,18]`."
- "Resolution command written to `timeline/resolutions/2026-04-28T12-03-11.001Z_resolve_conflict_0007.yml`."
- "History rewritten from checkpoint `snapshot_000120`; old branch preserved as `archive_experiment_tax_policy_003_pre_rewrite`."

History rewriting must preserve inspectability. Prefer explicit rewrite records over silent mutation:

```text
timeline/rewrites/
  2026-04-28T12-03-11.001Z_rewrite_000009.yml
```

The rewrite record should cite old command ids, new command ids, actor, reason, source branch, target branch, and generated commits. Rewriting history is allowed because the world is a microworld for learning, but it should be visible and reversible.

## Relative Playback, Macros, and Blueprints

Command records should eventually support relative, translated, transformed, and templated playback.

This turns command history into reusable construction material:

- **Painter image hose:** record a stream of drawing commands, then spray variants across the map.
- **Factorio blueprint:** record a district, road pattern, rail junction, power grid, park layout, or service cluster, then plop it elsewhere.
- **Emacs keyboard macro for SimCity:** record a sequence of commands, move a cursor, repeat the macro at the next location.
- **Logo turtle / construction kit:** record intent as a path from an origin, then replay with transforms.

A blueprint is a command stream with an anchor.

Example:

```yaml
blueprint:
  id: blueprint_neighborhood_grid_0007
  label: "Small walkable neighborhood"
  origin: [0, 0]
  end_cursor: [12, 0]
  coordinate_space: relative-tile
  commands:
    - command_id: tool.road.drag
      args: { from: [0, 0], to: [10, 0] }
    - command_id: tool.road.drag
      args: { from: [0, 4], to: [10, 4] }
    - command_id: tool.zone.residential.fill
      args: { rect: [1, 1, 9, 3] }
```

Playback supplies a transform:

```yaml
playback:
  blueprint: blueprint_neighborhood_grid_0007
  at: [42, 18]
  transform:
    translate: [42, 18]
    rotate: 90
    mirror: false
    scale: 1
  mode: animated
  speed: 4x
```

The transform maps relative command arguments into world coordinates before dispatch. The same record can be:

- Plopped instantly.
- Played over real time.
- Played faster than real time.
- Previewed before committing.
- Repeated at the blueprint's `end_cursor` offset.
- Edited as a readable command stream.

## Cursor-Based Macro Repetition

Macro playback should have an explicit cursor.

The cursor is not just the mouse pointer. It is the replay origin for the next transformed command stream.

Workflow:

1. Start recording at cursor `A`.
2. Perform commands relative to `A`.
3. Stop recording with end cursor `B`.
4. Move replay cursor to `C`.
5. Replay commands relative to `C`.
6. Advance cursor by `(B - A)` or by a declared stride.
7. Repeat.

This supports "stamp the next block" workflows without requiring a player to manually place every road and zone. It also makes repetition inspectable: a repeated suburb is not an opaque paste; it is a loop of command playback records.

## Visual Programming Generates Command Streams

When Snap!, Logo, Scratch-like blocks, or other visual programming systems are integrated, they should generate and transform the same blueprint/macro command streams.

Visual programs can:

- Generate road grids, spirals, fractals, transit loops, parks, or neighborhoods.
- Parameterize blueprints by width, height, density, budget, zone mix, or style.
- Transform recorded macros by rotation, mirroring, translation, or stride.
- Place repeated instances along a path.
- Animate playback in real time so learners can watch the program build the city.
- Run faster than real time for batch experiments.
- Emit explainable command records for Git, replay, review, and merge.

The visual program is the authoring surface. The command stream is the durable artifact.

Example:

```yaml
generated_by:
  system: snap
  project: "Transit-Oriented District Generator"
  script: "make district(width, height, stationSpacing)"
  parameters:
    width: 24
    height: 16
    stationSpacing: 8
output:
  kind: blueprint
  id: blueprint_tod_0012
  commands_file: commands.jsonl
```

This keeps visual programming constructionist and inspectable:

- A child can drag blocks to generate a neighborhood.
- A peer can inspect the generated command stream.
- A teacher can replay it slowly and ask why each step happened.
- An LLM can summarize, critique, parameterize, or refactor the macro.
- Git can diff the program, the generated blueprint, and the resulting playback.

## Blueprint Merge Semantics

Blueprints should remain command streams, not raw tile diffs, whenever possible.

Benefits:

- They preserve intent.
- They can be previewed through the command bus.
- They can fail gracefully when terrain, budget, zoning, or ownership has changed.
- They can be transformed and replayed in alternate realities.
- They can be taught, shared, forked, and reviewed like code.

Semantic conflicts should cite both the expanded command and the blueprint source:

```yaml
conflict:
  id: conflict_0012
  source:
    blueprint: blueprint_neighborhood_grid_0007
    playback: playback_000088
    expanded_command: cmd_001944
  reason: "Target tile already contains rail from another branch"
```

This makes blueprints first-class Git-world objects: branchable, mergeable, reviewable, replayable, and explainable.

## Why Coalesce?

One commit per tiny gesture is often too noisy:

- Road dragging can emit many small tile edits.
- Panning/zooming should not necessarily produce a commit.
- Brush/chalk strokes may be high-frequency.
- UI-only actions may not affect the simulation.

But one giant commit loses branchability.

The compromise: coalesce commands into leaves, but preserve the individual command records inside the leaf. A later branch can split at any command inside the leaf by replaying the leaf up to that command, then diverging.

## Branching Inside a Coalesced Commit

Suppose commit `C` contains leaf `L` with commands `a, b, c, d`.

If the user later wants to split reality after command `b`:

1. Checkout the parent checkpoint before `L`.
2. Replay `a`.
3. Replay `b`.
4. Create a new branch point.
5. Continue with new commands instead of `c, d`.

This means coalescing is a storage/performance optimization, not a semantic loss.

## Commit Policy

Commits should be created strategically.

### Greedy Coalescing

Commands that can coalesce aggressively:

- Road/rail/wire drawing.
- Brush/chalk strokes.
- Continuous panning/zooming if persisted at all.
- Repeated tool applications in one drag.
- Minor UI layout adjustments.

Policy:

- Append to current leaf.
- Commit after min/max command count, real-time interval, idle timeout, or explicit checkpoint.

### Consequential Commands

Commands that should force a commit boundary before mutation:

- Change tax rate.
- Change budget/funding.
- Build stadium, airport, seaport, coal plant, nuclear plant.
- Trigger disaster.
- Approve proposal.
- Merge branch/timeline.
- Change role/permission.
- Execute LLM proposal.
- Anything destructive or politically meaningful.

Policy:

- Commit current pending leaf first.
- Create a pre-decision checkpoint.
- Record proposal/vote/reason.
- Execute the command in a new leaf or commit.

This makes it easy to branch from immediately before the decision.

## Commit Triggers

Possible triggers:

- `min_commands_per_leaf`: avoid tiny commits unless decision point.
- `max_commands_per_leaf`: keep replay chunks bounded.
- `max_seconds_per_leaf`: commit periodically in real time.
- `idle_timeout_ms`: commit after user stops interacting.
- `before_consequential_command`: always checkpoint before major decisions.
- `after_proposal_approved`: commit proposal state and result.
- `manual_checkpoint`: user/teacher/LLM asks for a save point.
- `simulation_phase_checkpoint`: commit after N sim ticks or after scenario milestone.

The best policy is empirical. Start with conservative defaults and measure:

- Replay cost.
- Git noise.
- Branching usability.
- Classroom comprehensibility.
- Storage growth.

## Research Questions

The best coalescing strategy is not obvious.

Research dimensions:

- How often do users actually branch into the middle of a gesture?
- How expensive is replay from leaf-internal command boundaries?
- What commit granularity remains understandable in GitHub UI?
- How much data can GitHub branches tolerate in classroom use?
- Which command classes must be durable for pedagogy?
- Which UI-only commands should be excluded or summarized?
- How do LLM proposals alter the commit policy?

Candidate experiments:

1. One commit per command.
2. One commit per drag/gesture.
3. One commit per idle interval.
4. One commit per consequential command.
5. Hybrid: high-frequency commands in leaves, consequential commands as commit boundaries.

The likely winner is hybrid.

## Data Model Sketch

```text
timeline/
  TIMELINE.yml
  leaves/
    leaf_000001.jsonl
    leaf_000001.commit.yml
    leaf_000002.jsonl
    leaf_000002.commit.yml
  commits/
    commit_000001.yml
  checkpoints/
    snapshot_000001/
```

`TIMELINE.yml`:

```yaml
timeline:
  id: timeline_971987439573945
  branch: micropolis_971987439573945
  root_snapshot: snapshot_000000
  head_leaf: leaf_000143
  policy:
    min_commands_per_leaf: 1
    max_commands_per_leaf: 100
    max_seconds_per_leaf: 30
    idle_timeout_ms: 1500
    checkpoint_before: [tax.change, budget.change, zone.expensive, disaster.trigger, proposal.approve]
```

## Command Record Sketch

```yaml
id: cmd_000423
command_id: tax.increase
source: llm
actor: tutor:economist
reason: "Demonstrate the effect of a small tax increase on cash flow"
policy:
  risk: reversible
  approved_by: user:a2deh
time:
  wall: "2026-04-28T11:15:00Z"
  sim_tick: 18432
before:
  snapshot: snapshot_000120
preview:
  message: "Tax will change from 7% to 8%"
result:
  handled: true
  affected:
    - cityTax
    - cashFlow
undo:
  command_id: tax.set
  args: { value: 7 }
commit_attribution:
  # Written later, after the commit exists. See ex-post-facto section.
  sidecar: leaf_000143.commit.yml
```

## Ex Post Facto Commit Attribution

A command record cannot know the commit hash of the commit it is about to create, because the commit ID is produced only after Git hashes the complete tree and commit metadata.

But it is extremely useful to know, for every command:

- Which Git commit contains its effects.
- Which leaf file contains it.
- Which index it has inside that leaf.
- Whether it is the first/last command in a coalesced commit.
- Whether it is a valid branch split point.

The solution is ex post facto attribution: write command leaves first, commit them, then record the resulting commit hash in the next commit or in a final session-closing commit.

## Sidecar Attribution Files

Each command leaf can have a sidecar file with the same base prefix:

```text
timeline/leaves/
  leaf_000143.jsonl
  leaf_000143.commit.yml
```

The leaf file is the command source of truth. The sidecar is the Git attribution index for that leaf.

Example `leaf_000143.commit.yml`:

```yaml
leaf_commit:
  leaf: leaf_000143.jsonl
  effect_commit: 3f4a2b1c9d...
  branch: micropolis_971987439573945
  committed_at: "2026-04-28T11:17:22Z"
  commit_sequence: 121
  command_range:
    first_index: 0
    last_index: 37
  commands:
    - command_id: cmd_000423
      index: 0
      effect_commit: 3f4a2b1c9d...
      split_point: true
    - command_id: cmd_000424
      index: 1
      effect_commit: 3f4a2b1c9d...
      split_point: true
```

Because `leaf_000143.commit.yml` mentions commit `3f4a...`, it cannot be part of commit `3f4a...`. It must be written after the fact.

## Journal Commit Pattern

Use the next commit to journal the previous commit's IDs.

Sequence:

1. Write `leaf_000143.jsonl`.
2. Apply command effects to save directory.
3. Commit tree -> Git returns `commit_A`.
4. Write `leaf_000143.commit.yml` recording `commit_A`.
5. Include that sidecar in the next commit, `commit_B`.

This creates a one-commit attribution lag.

That is acceptable because the command leaf remains replayable without the sidecar, and the sidecar is only an index into Git history.

## Session Closing Commit

At the end of a session, the last effect commit would otherwise lack an attribution sidecar because no later command may occur.

Therefore closing a session should write a final attribution commit:

```text
commit_N:   final command effects
commit_N+1: attribution sidecars for commit_N + session close marker
```

This commit can be small and explicit:

```yaml
session_close:
  session: session_2026_04_28_111500
  closes_branch_head: micropolis_971987439573945
  attributed_commits:
    - 3f4a2b1c9d...
  reason: "Flush final command attribution sidecars"
```

## Single Source of Truth

The command leaf remains the source of truth for what happened.

The sidecar does not redefine commands. It indexes them into Git:

- leaf filename
- command index
- command id
- effect commit hash
- branch
- commit sequence

If the sidecar is missing, it can be rebuilt by scanning Git history:

1. Find commits that add or modify leaf files.
2. Parse leaf command IDs and order.
3. Reconstruct sidecars.
4. Write a repair commit.

## Why Not Amend?

Do not amend the effect commit just to insert its own hash. That is impossible without changing the hash again. Any self-referential Git object requires indirection.

The sidecar pattern is the indirection.

## Split Points Inside Coalesced Commits

A branch split inside a coalesced commit uses:

- The parent checkpoint before the leaf.
- The leaf command list.
- The command index from the sidecar.

The effect commit hash tells you which commit stored the coalesced effects, but the command index tells you where to stop replaying.

This preserves fine-grained branchability even when Git commits are coalesced.

## GitHub-as-MMORPG Mapping

| Micropolis Concept | GitHub Concept |
|-------------------|----------------|
| Universe | Branch |
| Decision point | Commit |
| Alternate history | Branch from previous commit/checkpoint |
| Proposal | Issue or PR comment |
| Class discussion | Issue thread |
| Canonical timeline | Protected branch |
| Merge into class world | Pull request |
| Evidence | Diff, exported analysis, replay log |

## Relationship to Command Bus

The command bus should be the producer of command records.

Future responsibilities:

- Assign command IDs.
- Attach actor/source/reason.
- Attach preview/approval/policy.
- Record result and undo.
- Decide whether command is UI-only, simulation-edit, external, or governance.
- Emit timeline events to the save directory.

For now, this is documentation only.

## Relationship to Extended Save Format

Command leaves and checkpoints belong in the extended save package. They should travel with the city so a copied/forked city keeps its evidence, dialog, and branchable history.

## Relationship to Computed Layers

Computed layers may require replay to reconstruct exactly. The timeline provides the input:

```text
checkpoint + command leaves + simulator fast-forward => materialized overlay layer
```

This is why command persistence is not optional. It is the substrate for exact future analysis.

## Non-Goals Now

- Do not implement storage yet.
- Do not choose final JSONL vs YAML format yet.
- Do not create Git commits from app actions yet.
- Do not build replay engine yet.

Document the model first. Implement after the command bus, computed layers, and extended save format settle.
