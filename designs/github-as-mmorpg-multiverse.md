# GitHub as MMORPG Multiverse

## Thesis

MicropolisHub can use GitHub as a multiplayer world server without pretending GitHub is a game engine.

Git already provides durable timelines, branching, merging, diffs, authorship, review, comments, permissions, automation, CI/CD, bots, webhooks, Actions, artifacts, and public/private sharing. Those are exactly the primitives needed for a collaborative constructionist microworld where cities branch into alternate histories.

The mapping should be deliberate:

- Git branch = universe.
- Commit = decision checkpoint.
- Directory tree = world state.
- Repository = institution or realm.
- Account/organization/team = government and identity infrastructure.
- Pull request = proposed merge of realities.
- Issue = class discussion, governance item, or quest.
- Review comment = situated critique.
- Diff = evidence.
- Fork = school, classroom, team, or personal universe.
- Actions/workflows = automation and server-side game machinery.
- Bots = NPCs, tutors, moderators, clerks, runners.
- Webhooks = event bus.
- GitHub Pages = published user interface.

## Branches as Universes

Branch names should make the kind of universe visible:

```text
<type>_<id>
micropolis_971987439573945
scenario_tokyo_1957
classroom_amsterdam_2026
experiment_tax_policy_003
```

The prefix is not cosmetic. It lets tooling distinguish worlds, scenarios, experiments, and classrooms in a shared repo.

## Repositories as Realms

A branch is a world, but it lives inside a repository. The repository plugs that world into GitHub's account, organization, team, permission, issue, PR, and audit infrastructure.

This matters because MicropolisHub is not only a technical branching system. It is also an institutional system.

Possible repository owners:

- A school.
- A classroom.
- A club.
- A city-planning workshop.
- A research group.
- A family.
- A public community.
- A private team.

Each repository can define its own government:

- Who can create branches.
- Who can commit directly.
- Who can open proposals.
- Who can merge into canonical timelines.
- Who can administer issues.
- Which AI tutors are allowed to comment or propose.
- Which branches are private experiments vs public class artifacts.

## Organizations as Governments

GitHub organizations map naturally to Micropolis institutions.

An organization can own:

- Private repos for its own players.
- Public repos for shared examples.
- Teams for roles: students, teachers, moderators, AI tutors, guests.
- Branch protection rules for canonical worlds.
- Issue templates for proposals, assignments, and reports.
- Labels for workflow and governance.
- Project boards for classroom or city-planning process.

This lets each organization run its own government without a central Micropolis authority.

Examples:

```text
github.com/amsterdam-school/micropolis-class-2026
github.com/urban-planning-lab/traffic-experiments
github.com/family-game-night/private-city
```

The repo is the polity. Branches are its possible worlds.

## Teams as Roles

GitHub teams provide a coarse-grained role system:

```text
teachers
students
city-council
reporters
researchers
ai-tutors
observers
moderators
```

Micropolis app roles can be mapped onto or layered above these teams:

- Mayor.
- Treasurer.
- Planner.
- Builder.
- Reporter.
- Environmental reviewer.
- Debugger/God.
- Tutor.

The mapping does not need to be one-to-one. GitHub teams handle repository permissions; Micropolis roles handle in-world permissions and user interface presets.

## Issues as Locally Governed Forums

Each repository administers its own issues. That is important.

One classroom may use issues as assignments:

- "Recover Tokyo after monster attack."
- "Compare coal vs nuclear power."
- "Write a newspaper article about the stadium vote."

Another organization may use issues as governance:

- "Proposal: raise tax from 7% to 9%."
- "Dispute: airport placement."
- "Request: merge rail-first branch."

Another may disable issues entirely and run through the app.

Micropolis should not hardcode one government. It should provide conventions and templates that organizations can adapt.

## Issues as First-Class World Objects

Issues are not just comments. They can be instantiated as filesystem objects.

When issue `#123234` matters to the world, create a branch:

```text
issue_123234
```

That branch can contain a freeform directory tree:

```text
issues/
  issue_123234/
    ISSUE.yml
    CARD.yml
    README.md
    comments/
    proposals/
    evidence/
    branches/
    artifacts/
    commands/
```

This makes an issue more than a GitHub web page. It becomes a MOO object: inspectable, extensible, branchable, scriptable, and linked to the city.

Possible issue object slots:

- `ISSUE.yml`: title, state, labels, participants, linked city/universe.
- `CARD.yml`: advertised actions like summarize, propose, close, branch, attach evidence.
- `comments/`: structured mirrors or summaries of discussion.
- `evidence/`: maps, JSON exports, screenshots, replay logs.
- `proposals/`: command proposals attached to the issue.
- `branches/`: alternate realities created to test the issue.
- `artifacts/`: CI-generated reports.
- `commands/`: command leaves related to the issue.

The GitHub issue remains the social UI. The `issue_<id>` branch/tree is the structured world object.

## Issue Branch Lifecycle

1. A GitHub issue is created.
2. A workflow or app creates branch `issue_<id>`.
3. The branch initializes `issues/issue_<id>/`.
4. Bots mirror metadata and summarize discussion.
5. Students or tutors attach evidence.
6. Related city branches are linked.
7. PRs can merge issue artifacts into the canonical world.
8. Closing the issue records final resolution in the issue object.

This lets issues become durable, inspectable objects without losing GitHub's native issue UI.

## Issue Templates as Game Forms

GitHub issue templates can become game UI forms:

- Build proposal.
- Budget proposal.
- Disaster report.
- Newspaper article.
- Experiment request.
- Bug report.
- Tutor question.
- Branch merge request.

Each template can declare:

- required fields
- labels
- default bot reviewers
- workflow to run
- command bus command to propose
- city branch to compare against

This gives organizations their own configurable civic forms.

## Privacy and Ownership

Private repos matter.

Schools, families, clubs, and teams may need:

- Student privacy.
- Local moderation.
- Custom rules.
- Private AI tutor logs.
- Private branch experiments.
- Institution-owned data.

Micropolis should support the idea that each school or organization owns its repo and can decide what to publish, fork, merge, or delete.

## GitHub Automation as Free Infrastructure

Using GitHub as the MMORPG backbone gives Micropolis infrastructure that would otherwise take years to build:

- CI for validating city packages.
- CD for publishing playable web builds.
- Actions for running simulations, generating reports, validating proposals, and materializing overlays.
- Scheduled workflows for classroom events, nightly simulations, leaderboards, and maintenance.
- Webhooks for app synchronization.
- Bot accounts for AI tutors, moderators, and clerks.
- Checks for whether a branch/proposal is mergeable.
- Artifacts for generated maps, reports, screenshots, logs, and replay outputs.
- Pages for publishing classroom worlds and newspapers.
- Releases for scenario packs or curated milestones.
- Security and audit logs for institutional accountability.

This is not "free" in the sense of no constraints. It is free in the sense that GitHub already solved the boring multiplayer platform infrastructure:

- identities
- permissions
- discussion
- review
- automation
- history
- notifications
- links
- artifacts
- APIs

Micropolis should exploit that instead of rolling its own social backend first.

## GitHub Pages as User Interface

GitHub Pages can publish the playable/readable Micropolis interface for a repo:

```text
https://<org>.github.io/<repo>/
```

The Pages app can be mostly static:

- Load city state from repo files.
- Show maps, branches, proposals, reports, and issues.
- Link to issue discussions and PRs.
- Invoke GitHub APIs for authenticated actions.
- Trigger workflows for simulation or report generation.
- Render artifacts produced by Actions.

This means a school or organization can host its own Micropolis UI with the same repo that stores its world state.

We may still use other services later, but GitHub Pages should be treated as the first deployment target because it reinforces the ownership model: the repo is the polity, the branch is the world, and Pages is the public square.

## Live Browser Simulation

When one or more people are actually playing, the real-time simulation should run in their browsers.

The browser is the fast local cockpit:

- Run the normal Micropolis simulator at interactive speed.
- Let players pan, zoom, build, inspect, argue, and experiment.
- Preview command effects immediately.
- Record edit commands into timestamped command files.
- Commit those commands to the player's current branch.

GitHub is still the world model:

- The player's branch is their current universe.
- The command files are the replayable history.
- Commits are durable edit points.
- PRs and merges are governance actions.
- Actions can replay and validate what the browser produced.

This means "real-time game" and "GitHub collaboration" are not competing models. The browser can feel alive, while Git teaches the structure underneath: branches are alternate realities, commits are remembered decisions, merges are civic acts, and history can be inspected.

If the group wants fast collaboration, browser clients can commit to their own branches and continuously merge or rebase against a shared branch. If the group wants slower civic collaboration, they can batch commands into proposals and issue discussions. Both modes teach the same model.

## GitHub Actions as Backend

GitHub Actions can act as the slow backend:

- Run the simulator headlessly.
- Apply command leaves.
- Materialize computed layers.
- Generate screenshots and reports.
- Validate city packages.
- Publish updated Pages artifacts.
- Comment results back into issues.
- Compare branches.

This is not a 60 FPS game server. That is the point.

Micropolis can deliberately slow down multiplayer. Let a "turn" be a commit, a workflow run, a proposal, or a discussion cycle. Make people think, explain, review, and collaborate.

The classic single-player app can still run fast locally. But the collaborative classroom/governance mode can run at GitHub speed:

```text
proposal -> issue discussion -> workflow preview -> votes/review -> command commit -> replay/report -> next discussion
```

That rhythm may be better for learning than realtime twitch interaction.

This does not forbid real-time play. It separates responsibilities:

- Browsers run the interactive real-time simulator.
- GitHub Actions replay, validate, compare, and publish.
- Issues and PRs provide shared memory and deliberation.
- Branches preserve each player's or group's timeline.

## Issues as the Real-Time Action Surface

For the GitHub-backed mode, the most important realtime surface is not the simulator tick. It is the issue conversation.

All the human action happens in:

- issue comments
- proposal forms
- PR reviews
- bot replies
- linked artifacts
- branch comparisons
- tutor debates

The simulation can run slowly in the background. The discussion is where collaboration happens.

This flips the usual game-server model:

| Usual Realtime Game | GitHub Micropolis |
|---------------------|-------------------|
| Server ticks constantly | Actions run on demand or schedule |
| Chat is secondary | Issue discussion is primary |
| State changes instantly | State changes through proposals/commits |
| Players react quickly | Players argue, explain, and reflect |
| Logs are afterthought | Logs are the world history |

The educational goal is not twitch mastery. It is systems thinking, civic reasoning, and constructionist reflection.

## How Much Can Run on GitHub Alone?

Research question: how far can we get using only GitHub?

Potentially GitHub can provide:

- Identity.
- Permissions.
- Private/public worlds.
- Branches and timelines.
- Issues and discussions.
- Pull requests and review.
- Actions as compute.
- Pages as UI hosting.
- Artifacts as generated output.
- Releases as scenario packs.
- Webhooks as integration points.

External services may still be useful for:

- Low-latency multiplayer sessions.
- Long-running simulation workers.
- Rich websocket presence.
- Heavy compute.
- Persistent databases for indexing.
- LLM API calls with secrets.

But the design challenge is to keep GitHub as the canonical backbone even when auxiliary services exist. Other services should cache, accelerate, or enrich. They should not become the source of truth unless there is a strong reason.

## Bots as NPCs and Clerks

GitHub bots can be Micropolis actors:

- `economist-bot` comments on budget proposals.
- `planner-bot` generates traffic reports.
- `environment-bot` flags pollution regressions.
- `clerk-bot` maintains issue labels and proposal checklists.
- `ci-bot` runs replay and validation workflows.
- `tutor-bot` asks students reflection questions.

Bots should still operate through explicit commands and proposals when mutating world state. They can comment freely; they should not silently rewrite the world.

## Actions as Game Machinery

GitHub Actions can run:

- save-file validation
- city analysis
- computed layer materialization
- screenshot generation
- replay from command leaves
- branch comparison
- PR report generation
- issue triage
- proposal checklists
- classroom dashboards
- publication to GitHub Pages

Example workflow jobs:

```text
validate-city-package
replay-command-leaves
generate-traffic-report
compare-branch-to-canonical
publish-newspaper
materialize-computed-layers
snitch-on-ai-actions
```

The web app can trigger or observe these workflows through GitHub APIs, but the durable record remains in GitHub.

## Save Directory as World Tree

Each `micropolis_<id>` universe branch contains a filesystem tree that represents a Micropolis namespace, not just one city file.

In MOOLLM terms, a Git branch named `<type>_<id>` is an object storage scope. The branch name gives the root object's type and id. The branch contents are the object's slots, collection namespaces, local objects, and references to broader scopes.

```text
MICROPOLIS.yml
cities/
  haight/
    CITY.yml
    haight.cty
    metadata.yml
    layers/
    timeline/
    proposals/
    dialogs/
    annotations/
    behaviors/
    snapshots/
    reports/
  tokyo/
    CITY.yml
    tokyo.cty
    metadata.yml
    timeline/
    reports/
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

`MICROPOLIS.yml` is the top-level interface file for the branch. `cities/` is a city namespace. Each city directory has a unique name within that namespace and declares its own supported interfaces with `CITY.yml`.

The classic desktop "city file name" maps to this namespace: `haight.cty` becomes `cities/haight/`. The UI may offer friendlier browsing, creation, duplication, templates, and imports than a desktop "Save As..." dialog, but the durable mapping is simple and Git-friendly.

Other plural directories are branch-scope namespaces. `macros/` and `blueprints/` are not owned by one city; they are reusable construction objects available to any city in the Micropolis branch. A city can reference, instantiate, or replay them without copying their source into the city directory.

The branch can also reference global scopes:

- `main` branch defaults and prototypes.
- Shared class/course repositories.
- Public blueprint or macro libraries.
- Other Micropolis branches.
- External MOOLLM skills and tools.

This tree is the persistent microworld. A web app, CLI, MCP service, and LLM skill can all read and write it using the same conventions.

## Naked Object Branches

A branch does not have to be a container Micropolis namespace. It can also be a single naked object.

Examples:

```text
city_san-francisco
  CITY.yml
  README.md
  san-francisco.cty
  timeline/

macro_foobar
  MACRO.yml
  README.md
  commands.jsonl

catalog_classroom-blueprints
  CATALOG.yml
  README.md
  MANIFEST.yml
  blueprints/

cities_bay-area
  CITIES.yml
  README.md
  haight/
    CITY.yml
  mission/
    CITY.yml
```

This gives an object its own pocket universe: independent branch history, PRs, issues, releases, permissions, and review workflow.

Plural collection branches are valid too. `cities_bay-area` can be the `cities/` directory popped out into its own pocket universe. It may be a naked directory of child objects, or it may declare behavior and state with `INDEX.yml`, `CITIES.yml`, `MACROS.yml`, `BLUEPRINTS.yml`, or another collection interface file.

Container objects such as `micropolis_34345345` can collect naked objects through manifests:

```text
micropolis_34345345
  MICROPOLIS.yml
  README.md
  MANIFEST.yml
  cities/
  macros/
```

A manifest can mount `city_san-francisco` as `cities/san-francisco`, or mount `macro_foobar` as `macros/foobar`. Catalogs can do the same for collections of blueprints, macros, scenarios, lessons, or tools.

A manifest can also mount whole collections: `cities_bay-area` can become `cities/`, `macros_road-tools` can become `macros/road-tools`, or `blueprints_transit-patterns` can become `blueprints/transit-patterns`.

This makes GitHub branches polymorphic object storage, not just alternate copies of one project tree.

## README.md as GitHub Surface

Every object branch and meaningful object directory should usually include `README.md`.

GitHub renders directory READMEs after the file index, so README files become the browsable surface of the object graph: the branch root explains the object, `cities/haight/README.md` explains the city, `macros/foobar/README.md` explains the macro, and `catalog_classroom-blueprints/README.md` explains the catalog.

The README is a view, not the primary database. It should be generated from structured sources where possible:

- Interface files such as `MICROPOLIS.yml`, `CITY.yml`, `MACRO.yml`, `CITIES.yml`, `CATALOG.yml`.
- `MANIFEST.yml` imports and mounts.
- Timeline summaries and command records.
- Reports, previews, artifacts, and issue links.

This uses GitHub's native rendering as free UI while keeping structured files as the source of truth.

## Git Primitives as Game Mechanics

| GitHub Primitive | Micropolis Meaning |
|------------------|-------------------|
| Account | Player identity |
| Organization | Institution / government |
| Team | Role or permission group |
| Repository | Realm / polity / classroom world container |
| Branch | Alternate timeline / universe / typed object storage scope |
| Object branch `type_<id>` | Naked object pocket universe |
| Collection branch `plural_<id>` | Popped-out collection namespace |
| Manifest | Imports, mounts, mirrors, vendors, or instantiates object branches |
| Commit | Durable checkpoint / decision point |
| Timestamped command file | Replayable edit command / merge unit |
| Diff | Evidence of what changed |
| Pull request | Proposal to merge an alternate history |
| Issue | Discussion, assignment, governance item, scenario prompt, object seed |
| Issue branch `issue_<id>` | Structured MOO object for the issue |
| Comment | Debate, teaching, explanation, decision rationale |
| Review | Peer critique or teacher feedback |
| Label | Role, status, phase, topic |
| Milestone | Curriculum unit or scenario phase |
| Fork | School-owned or student-owned universe |
| Protected branch | Canonical classroom timeline |
| Action workflow | Automation, validation, report generation, bot machinery |
| Check run | Gate, rubric, validation result |
| Artifact | Generated evidence |
| GitHub Pages | Published newspaper/world/report |
| GitHub Pages app | Published user interface |

This lets Micropolis teach software literacy and civic reasoning at the same time: proposals, reviews, evidence, branches, merges.

Timestamped command files are the bridge between Git's file merge model and Micropolis's semantic replay model. A player can branch, perform an experiment, then rebase or merge the timestamped command files back and forth between timelines. Git decides which command records are present; replay decides whether those commands still make sense in the resulting world.

## Universe Lifecycle

1. **Fork** a class or scenario repo.
2. **Create branch** `micropolis_<id>` for a city universe.
3. **Initialize save tree** from scenario or random terrain.
4. **Run commands** through the command bus.
5. **Write timestamped command files** into the save tree.
6. **Commit leaves** at policy-defined boundaries.
7. **Branch** at edit points for alternatives.
8. **Open PR** when an alternate reality has evidence worth merging.
9. **Discuss** with humans and AI tutors.
10. **Merge or reject**.
11. **Replay merged command history** to materialize the accepted timeline.
12. **Publish** reports/newspapers/tutorials.

Automation can run at every step: validate the save tree, render previews, run replay, generate evidence, publish reports, and ask AI tutors to comment.

## PRs as Reality Proposals

A PR should not merely say "changed files." It should say:

- What decision was tested?
- What branch point did it start from?
- What commands were replayed?
- What changed in the city?
- What evidence supports the merge?
- Which agents or players agree/disagree?

Example:

```markdown
## Proposal
Merge the "rail-first industrial corridor" timeline into the class city.

## Branch Point
Started from `commit_00124` before the airport vote.

## Evidence
- Traffic average decreased 18%.
- Pollution shifted away from residential zones.
- Budget stayed positive after 3 simulated years.

## Replay
See `cities/haight/timeline/leaves/leaf_000140.jsonl`.
```

## Issues as Class Discussions

Issues can host open civic questions:

- Should we raise taxes before building the stadium?
- Where should the airport go?
- Should industry be moved away from housing?
- Which branch has the best evidence?

AI tutors can comment with distinct roles:

- Economist: budget and cash flow.
- Urban planner: land use and transit.
- Environmentalist: pollution and long-term costs.
- Historian: real-world analogies.
- Mayor's advisor: pragmatic synthesis.

## Commit Messages

Commit messages should be useful to both GitHub users and replay tools.

Format:

```text
<phase>: <human summary>

Commands:
- leaf_000143.jsonl commands 0..37

Branchability:
- split points preserved in leaf sidecar

Why:
<reason, proposal, or classroom prompt>
```

## Evidence Artifacts

Each branch should be able to publish:

- City snapshot.
- Before/after diffs.
- ASCII/emoji/graph previews.
- Runtime computed layers.
- Journal/newspaper article.
- Replay command leaves.
- AI tutor debate transcript.
- GitHub Actions artifacts.
- Check run summaries.
- Published GitHub Pages reports.

## Permissions and Roles

GitHub permissions can approximate classroom roles:

- Student: branch, commit, propose PR.
- Teacher: protect canonical branch, merge PRs, create assignments.
- Team: co-own branch.
- AI tutor: comment/propose via bot account or local tool.
- Observer: read-only.

Micropolis roles inside the app can map to GitHub permissions, but they are not identical. In-app roles may include mayor, treasurer, planner, builder, reporter, researcher, teacher, debugger.

## Why GitHub, Not a Custom Database First?

GitHub is already:

- Persistent.
- Multi-user.
- Reviewable.
- Forkable.
- Branchable.
- Auditable.
- Scriptable.
- Automatable.
- Bot-friendly.
- CI/CD enabled.
- Artifact-hosting.
- Issue-centered.
- Familiar to developers.

For schools and students, owning a repo is also ownership of their work.

A custom database may come later for performance, but GitHub is the durable public substrate and pedagogy surface.

## Risks

- Git noise from too many commits.
- GitHub UI may be confusing to non-programmers.
- Binary `.cty` diffs are poor without decomposition.
- Branch proliferation needs curation.
- Permissions may not map cleanly to in-game roles.
- Large histories may become expensive.
- GitHub Actions quotas and permissions need management.
- Bots can become noisy or overly authoritative.
- Issue/object mirrors can drift if not synchronized.

Mitigations:

- Coalesced leaves.
- Sidecar metadata.
- Git-friendly decompose/compose format.
- Role presets.
- Human-readable PR templates.
- CLI commands that hide Git mechanics when needed.
- Workflows that maintain issue object mirrors.
- Bot rate limits and explicit scopes.
- Clear templates and labels.

## Design Rule

Use GitHub primitives only where they make the world more inspectable, branchable, discussable, or ownable.

Do not force users to become Git experts before they can play. Let the app and CLI present the same structure in friendly terms.
