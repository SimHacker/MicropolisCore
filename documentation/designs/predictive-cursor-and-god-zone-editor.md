# Predictive tool cursor and query-centered God editing

**Source:** Don Hopkins, dictated design ideas, 19 October 2026.
**Status:** Design capture, not implemented behavior. Example quantities,
simulation horizons, and residential-state dimensions require engine validation.

## Two connected tools

1. Preview the future effect of an edit by comparing two simulated futures
   from the same starting city: with the edit and without it.
2. Use the query tool as the entry point for directly manipulating a zone's
   coherent configurations, including states normal play cannot select.

The predictive cursor should work for ordinary tools (placing a residential
zone, bulldozing, and others) and for God-mode zone changes. Humans, scripts,
and AI should use the same underlying edit and comparison operations.

Related designs:
[tool palette](simcity-tool-palette-design.md),
[virtual pointers](virtual-pointer-and-pie-cursors.md),
[pie-menu model](piecraft/PIE-MENU-MODEL.md),
[command history and branching](command-timeline-git-branches.md), and
[Soul City](soul-city.md).

## 1. Future preview while positioning a tool

As the user moves a tool over the map, evaluate its proposed action at that
position. Don's illustrative horizons are **10, 100, and 1,000 simulation
steps**, representing short-, medium-, and long-term effects.

Conceptual experiment:

1. Snapshot the current simulation.
2. Apply the proposed tool action.
3. Advance the simulation, capturing measurements and optionally map
   snapshots at the requested horizons.
4. Restore the original state, as though the experiment never happened.
5. Advance the same horizons without the action.
6. Compare the two trajectories and return to the original live state.

For metric `m` and horizon `h`, display:

```text
effect(m, h) = m(edited future at h) - m(unedited future at h)
```

This is not just change from the present: the unedited city also evolves.
Show important differences near the cursor or in a connected inspection
panel, for example population +5, pollution +10, or traffic -5. Those are
illustrations, not measured results or promises about particular tools.
Keep units, spatial scope (local/zone/city), and horizon visible. A map or
time-series comparison can explain which areas gain or lose and when.

### Isolation and comparability

An implementation may fork isolated simulator instances instead of
speculatively modifying the live instance. The required outcome is the
same: previews never alter the real city or its future random sequence.

- Capture all causally relevant state: not only tiles, but simulation
  phase/time, PRNG state, funds, policies, derived maps, accumulators,
  sprites/disasters, and any other mutable state used by the engine.
  Audit the actual engine; do not assume a city save is a complete snapshot.
- Both branches start from the same state, parameters, and PRNG state.
  Random draw sequences may diverge after an edit; a paired run is still
  one conditional scenario, not a certainty or a universal causal estimate.
  Repeated paired seeds could later show variability.
- Suppress speculative sounds, notifications, external writes, multiplayer
  commands, achievements, and other real-world side effects.
- Define a "step" precisely against the engine scheduler. Do not label
  partial scan phases as complete city cycles or dates without conversion.
- If placement fails, report the actual reason instead of showing a
  successful-looking forecast for an edit that could not occur.
- Version results by base city revision, candidate command, engine version,
  horizon, and experiment parameters. Discard stale results when the city,
  tool, or cursor changes.
- Cancel superseded work; debounce/coalesce movement and bound CPU/memory.
  Reuse an unedited trajectory only when its experiment inputs match.
  Show pending/unavailable states rather than inventing immediate results.
- On actual commit, apply the command to the current authoritative city,
  revalidating it. Do not silently replace the city with a speculative future.

## 2. Query target as shared editing context

The base query state is a selected **tile position**: row/column or x/y with
one explicit coordinate convention. Moving the pointer supplies a hover
candidate; clicking sets the shared query target. Keep these distinct so
an inspection does not lose its target whenever the pointer moves.

Derive from the selected tile:

- Whether it belongs to a multi-tile zone or another coherent object.
- Zone/object kind and current configuration.
- Center coordinate.
- Top, bottom, left, and right extents relative to that center.
- Full footprint/bounding box and the clicked tile's offset within it.

Airport extents are larger; a single-tile park has zero extents. Resolve
the actual footprint rather than assuming every zone is 3x3. Recompute or
invalidate derived state after edits, simulation changes, or city loads.
Damaged/incomplete zones and map-edge cases need explicit handling; do not
guess a center from an unrelated neighboring tile.

The query tool then asks: **How can this object be changed coherently?**
Clicking can blossom into a contextual pie menu or state-space view,
anchored at the selected zone, rather than exposing arbitrary tile numbers.

## 3. Residential configuration space

Don calls this a **manifold of possible zone states**. Here "manifold" is a
UI/design metaphor for a navigable configuration space, not a claim that
the engine's discrete states form a smooth mathematical manifold.

A newly placed, undeveloped residential R occupies one corner. Development
can move through individual houses and then developed 3x3 residential
configurations. Population/development and land-value class are at least
two candidate axes; inspect the engine's actual state tables before naming
all levels or assuming every Cartesian combination exists.

The display should splay possible configurations out from the current
state, with thumbnails and a branching pie of reachable choices. Let the
user navigate population up/down and value class up/down, including low-
and high-population configurations at different value classes. Pointing
at a choice previews it; selecting it applies the coherent zone edit.
Retain a clear cancel path and distinguish preview from commit.

For lightly developed zones, one through several small houses may have
equivalent aggregate population regardless of their precise arrangement.
Group such configurations by meaningful equivalence classes to avoid an
unusable menu, but preserve their actual tile arrangements: equivalence
for population does not establish equivalence for all simulation behavior.
An expanded view can expose individual arrangements when relevant.

### Direct state changes and environmental consequences

This is intentionally **God editing**, not ordinary player construction.
Select the desired zone configuration and write the corresponding coherent
footprint and state rather than waiting for growth to reach it.

Don also proposes backward propagation to environmental parameters:
for example, selecting a value class could poke the land-value map.
Distinguish these operations:

- Directly set the zone configuration.
- Optionally adjust specified supporting environmental values.

A derived land-value map may be recomputed shortly afterward; report that
an override is transient unless an explicit persistent mechanism exists.
Do not promise that a selected appearance establishes stable land value,
that an arbitrary environmental inverse exists, or that the simulation
will preserve the injected development.

Use the predictive comparison to show whether the state persists, changes,
or collapses and what effects it has elsewhere. Record exactly which maps,
tiles, and parameters were changed so the action is explainable and undoable.

## 4. Population injection and imported people

A shared operation should support selecting residential zones with room,
raising their populated state, and distributing a requested increase across
the map. Don's example is making room for **1,000 imported Sims or other
game characters** rather than leaving them without somewhere to live.

Separate the city's aggregate population representation from individual
character identities, household membership, and housing assignments.
Verify engine population units, capacity, and census timing; do not assume
one encoded population increment equals one imported person or that merely
creating vacant housing means people have moved in.

Return a plan and outcome: requested people, available capacity, selected
zones, aggregate changes, assignments, and any unplaced remainder.
Never silently drop people or claim a complete import after partial placement.
Housing allocation and identity import should compose without duplicating
characters on retries. Preview the batch, then commit it coherently through
the same command path used by manual editing.

## 5. Other contextual editors

- A police station normally remains a police station; a fixed church has
  no internal development choices merely because the query menu exists.
- If plugins provide eight church/religion variants, expose those valid
  substitutions. This is an example extension, not an existing feature.
- Police/fire station substitution could be offered as a separately
  supported operation, with footprint/state validation.
- Smart road, railroad, park, and land editors should derive their own
  coherent choices from the query target and connected structure.

Do not manufacture meaningless menu choices for objects with no variants.
Different object types may need different configuration spaces, not a
universal population/value grid.

## 6. Shared commands, permissions, and teaching

Human pies, automated population tools, and AI should enumerate and apply
the same validated transformations. AI can propose a zone change, inspect
paired futures, and explain a choice without bypassing engine invariants.
Expose target, before/after state, footprint, environmental adjustments,
predicted effects, and actual result as inspectable data.

Gate God editing explicitly in the UI and authorization layer. Keep normal
construction costs/rules separate from intentional cheats; record the
chosen mode in history. Group a coherent multi-tile/batch edit into an
undoable transaction, consistent with the command-history design.

This should teach the simulation: show how tile configurations encode
development, how environmental maps influence it, and why a forecast is
a comparison of scenarios rather than a guaranteed future.

## Implementation prerequisites and acceptance checks

Before implementation, inspect zone decoding/growth tables, query logic,
simulation scheduling, PRNG ownership, complete snapshot support, population
units, map recomputation, and the existing command/undo interfaces.
This note does not assert those APIs already exist.

- Query any tile of a known multi-tile object and resolve the same center
  and footprint; test parks, residential houses, airports, damage, and edges.
- Enumerate only supported configurations; preserve tile flags and related
  invariants when applying a whole-zone change.
- Running or cancelling previews leaves the authoritative state and random
  continuation unchanged, including callbacks and external effects.
- An identity/no-op candidate produces zero differences at each horizon
  under identical deterministic experiment conditions.
- Compare edited and unedited branches at equal scheduler times; test
  stale-result rejection and failed tool application explicitly.
- Query-selected configuration and batch population edits share one command
  implementation, are undoable, and honor God-mode permission.
- Population injection accounts for every requested identity or reports an
  explicit remainder, with correct conversion to aggregate city units.
- Show environmental overrides being recomputed honestly; preview the same
  complete candidate edit that would be committed.

Open UI choices (not settled here): gesture layout for the two axes,
which metrics are prominent, hover versus pinned forecast presentation,
runtime budgets, and whether supporting environmental overrides are exposed
as separate controls or named edit profiles.
