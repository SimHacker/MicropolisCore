# Collaborative Microworld Lineage

## Thesis

MicropolisHub should not be framed as "multiplayer SimCity" in the narrow sense. It should be a collaborative microworld: a shared, inspectable, programmable environment where people and AI agents build, argue, simulate, branch, explain, and learn together.

The lineage is not just game design. It runs through Engelbart's augmentation program, Piaget's constructivism, Papert's constructionism, Kay's Dynabook and Smalltalk tradition, Will Wright's simulation toys, and Don Hopkins' cooperative SimCityNet experiments.

## Engelbart: Augment Collective Intelligence

Engelbart's important question is not "is it collaborative?" but "does it augment the group's ability to think and act?"

For Micropolis, this means multiplayer is not presence decoration. It must improve the group's ability to:

- Develop shared understanding of a complex system.
- Make decisions with visible consequences.
- Preserve trails, arguments, proposals, and rationale.
- Revisit and branch earlier decisions.
- Improve the group's process over time.

In Engelbart terms, the city is the shared work object; commands, chat, proposals, logs, diagrams, and branches are the augmentation system around that object.

A strong Micropolis multiplayer design should therefore include:

- Action logs with enough detail to replay and branch histories.
- Clickable simulator messages and chat references that re-center views.
- Decision records for large actions: who proposed, who approved, why.
- Role/task-specific workspaces that help the group coordinate.
- Tools for reflecting on the group's method, not just the city's state.

## Piaget: Knowledge Is Constructed

Piaget's constructivism matters because players do not absorb city dynamics by reading a report. They build mental models by acting, observing, being surprised, and repairing their understanding.

Micropolis should support this by making cause and effect tangible:

- Change taxes and observe migration, funds, and evaluation.
- Build roads and observe traffic and land value.
- Zone industry near homes and observe pollution complaints.
- Add services and observe coverage, costs, and long-term effects.

The UI should avoid turning the simulator into a black box oracle. It should let learners form hypotheses, test them, and revise their mental models.

## Papert: Learning by Making Public Artifacts

Papert extended Piaget into constructionism: people learn especially well when they construct personally meaningful artifacts that can be shared and discussed.

In Micropolis, the artifact is not only the city. It is also:

- A branch of a city timeline.
- A written proposal for a stadium, power plant, or policy.
- A newspaper article about a disaster.
- A saved before/after comparison.
- A reverse diagram explaining a simulator subsystem.
- A script, plug-in, overlay, robot, or tool.

The design should favor making, sharing, and reflecting:

- Let students publish city snapshots with annotations.
- Let teams compare alternate histories.
- Let teachers define scenarios as inspectable artifacts.
- Let players build city guides with signs, OPML-like outlines, links, and map regions.
- Let learners grow from playing the simulation to modifying the simulation.

## Kay: Dynamic Media, Not Static Apps

Alan Kay's critique of systems like SimCity is that the simulation is compelling but opaque. For Kay, the computer should be a dynamic medium: users should be able to read, write, simulate, inspect, and modify the ideas.

MicropolisCore's C++/WASM engine and SvelteKit frontend should therefore lead toward:

- Interactive reverse diagrams as first-class cards.
- Live parameter tweaking with safe reset.
- Visual programming or block scripting for tools, agents, zones, and scenarios.
- Multiple synchronized views of the same underlying model.
- Authoring and using in the same environment.

The goal is not merely to explain the black box. It is to make parts of the box user-openable without destroying the game.

## Don Hopkins' SimCityNet: Cooperative, Not Competitive

The X11/TCL/Tk multiplayer SimCityNet that Don Hopkins released through DUX Software and demonstrated at InterCHI '93 is the crucial precedent.

Its key choice was cooperative multiplayer instead of competitive multiplayer.

Everyone shared:

- The same city.
- The same budget.
- The same simulation consequences.
- The same visible map.
- The same need to negotiate.

That turns multiplayer into governance. Building a nuclear plant, airport, stadium, or seaport is not just a command; it is a public decision with cost, risk, location, and long-term consequences.

The old design notes describe:

- Shared chat and messages.
- Multiple simultaneous views.
- Voting panels for expensive actions.
- Bouncing/ghosted proposed buildings before they are committed.
- Unanimous approval for expensive zones.
- Logs sufficient to replay edits.
- Branch points at every editing command.

This is more interesting than "players race to optimize scores." It makes the social dynamics part of the educational experience.

## The Civic Object

The central lesson is that collaboration needs a civic object: something shared, consequential, and discussable.

In SimCityNet and Micropolis, that object is the city. A road, a tax rate, a power plant, a neighborhood, a disaster, and a budget are all visible anchors for social reasoning.

This gives Micropolis an advantage over generic multiplayer surfaces:

- A cursor is not a reason to collaborate.
- A shared tab is not a reason to collaborate.
- A canvas is not a reason to collaborate.
- A city with scarce funds, disasters, tradeoffs, and visible consequences is a reason to collaborate.

## Design Principles for MicropolisHub

1. Shared state should be visible and consequential.
2. Major actions should be proposals before they become facts.
3. Proposals should be local to the map when possible, not hidden in modal dialogs.
4. Every action should be loggable, replayable, and branchable.
5. Branches should be explainable alternate histories, not just save files.
6. Players should be able to bring evidence back from private experiments to shared timelines.
7. AI tutors should be participants on common ground: able to observe, propose, explain, and demonstrate, but subject to approval.
8. The interface should support roles: mayor, treasurer, planner, builder, reporter, teacher, researcher, god/debugger.
9. The system should teach social reasoning as well as urban dynamics.
10. Users should be able to grow from players into authors.

## Implementation Implications

### Command Bus

The command bus should represent simulator actions as explicit command objects with preview, proposal, approval, run, and undo/replay metadata.

For multiplayer:

- Expensive or risky commands become proposals.
- The proposal is visible on the map.
- Chat links to the proposal.
- Votes are recorded.
- Once approved, the command executes.
- The command log becomes replay/branch material.

### Git Multiverse

Git can model the history tree:

- Commit = decision checkpoint.
- Branch = alternate timeline.
- PR = proposal to merge an alternate history.
- Issue = discussion or class prompt.
- Diff = comparison of decisions and outcomes.

This is not a metaphor pasted on top. It matches the existing "what-if history tree" idea from `MultiPlayerIdeas.txt`.

### Workspace UI

The tabbed window/spatial workspace should expose:

- Shared city view.
- Proposal cards.
- Chat/journal.
- Live mini views pinned to events.
- Reverse diagrams.
- Branch/history graph.
- Role-specific task panels.

## Open Questions

- What actions require unanimous consent vs majority vs role permission?
- How do we prevent governance mechanics from becoming more complex than fun?
- How do AI tutor proposals stay helpful without becoming bossy?
- How much of the simulator should be opened at each learner level?
- What is the smallest useful replay log format that can support branching?

## References

- `notes/MultiPlayerIdeas.txt`
- `notes/UserInterfacePlan.txt`
- `notes/PIE-TAB-WINDOWS.md`
- `skills/micropolis/`
- `skills/micropolis-command-bus/`
- Don Hopkins, SimCityNet X11/TCL/Tk multiplayer demo, InterCHI '93.
- Seymour Papert, constructionism and Logo.
- Jean Piaget, constructivism.
- Alan Kay, Dynabook, Smalltalk, and critique of black-box simulations.
- Douglas Engelbart, augmenting collective intelligence.
