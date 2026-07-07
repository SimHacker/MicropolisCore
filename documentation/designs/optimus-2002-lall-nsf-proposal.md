# OPTIMUS: The 2002 NSF Proposal That Specified This Platform

In 2002, Prof. **Upmanu Lall** (then Columbia, now director of Arizona State's Water Institute),
with Michael Garvin and Andrew Smyth, proposed **OPTIMUS** — the *Open Platform for Teaching
Integrated Modeling and Urban Simulation* — to the NSF: a rebuilt civil & environmental
engineering curriculum anchored by an open, extensible SimCity, in partnership with Columbia's
Center for New Media Teaching and Learning.

The proposal names its blocker and its solution in consecutive sentences:

> "SimCity lacks the open architecture to add modules and extract state variables. However,
> Hopkins has demonstrated how to make this game extensible to a multi-player, multi-platform
> setting, and to make the state variables accessible."

**Don Hopkins and David Levitt are named consultants in the proposal.** Six years later Don led the
GPL release of SimCity as Micropolis; MicropolisCore is the continuation. The 2002 requirements —
extractable state variables, student-added modules in a high-level language, multiple team roles,
a "conversational environment" for learners, cellular automata as the teaching formalism — map
point-for-point onto this codebase and MOOLLM.

- Annotated Project Summary (2002 text → 2026 status, section by section):
  [WillWrightShowForFood/characters/upmanu-lall/sources/nsf-2002-project-summary-annotated.md](https://github.com/SimHacker/WillWrightShowForFood/blob/main/characters/upmanu-lall/sources/nsf-2002-project-summary-annotated.md)
- Original proposal PDFs:
  [WillWrightShowForFood/characters/upmanu-lall/media/](https://github.com/SimHacker/WillWrightShowForFood/tree/main/characters/upmanu-lall/media)
- The 2003 prototype code, archived: [github.com/ccnmtl/optimus](https://github.com/ccnmtl/optimus)
  — Python, with its own federation layer (`Federate.py`), a precursor instinct to
  [federation-peer-games.md](federation-peer-games.md)
- Related here: [moollm-micropolis-integration.md](moollm-micropolis-integration.md),
  [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md)

Lall was already teaching with SimEarth and SimCity in 2002 — students ran controlled experiments
and analyzed extracted data statistically. The planned successor to that workflow here: live
Micropolis metrics streaming to **Google Sheets** — online, shared, machine-readable, scriptable,
analyzable, and gradable.
