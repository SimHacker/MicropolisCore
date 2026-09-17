# Generative history and proposals: keep the seed, page the history, vote per candidate

**Status:** Active design — **not built**  
**Monorepo:** MicropolisCore  
**Companion documents:** [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md) · [the-imagine-loop.md](the-imagine-loop.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [sims-content-registry.md](sims-content-registry.md) · [apps/screen-angel/EGGS.yml](../../apps/screen-angel/EGGS.yml)  
**Method:** moollm [`skills/design-sense/methods/keep-the-seed.md`](https://github.com/SimHacker/moollm/blob/main/skills/design-sense/methods/keep-the-seed.md)

> **Scope.** How every generator in this monorepo behaves: the city/terrain generator, the Imagine Loop, egg minting, and any model that writes content a person cares about. Nothing here is implemented yet.

---

## Where it comes from

The multiplayer SimCity design already specified this, in the notes that ship with the source
([`documentation/notes/MultiPlayerIdeas.txt`](../notes/MultiPlayerIdeas.txt)):

> players can press next/previous to page through proposed city history
> — you can go back to randomly generated terrains, because it saves the random number generator seed
> — clears votes, proposes new or old city

Three decisions in three lines, and they are the whole design:

1. **A proposal is an entry in a history**, not a replacement for the current state.
2. **The seed is what gets stored**, so a random world is recoverable exactly, without saving a file.
3. **Agreement attaches to a candidate.** Proposing anything — new or recalled — clears the votes.

That is what made a shared generator safe to hand to three people at once. One loads San Francisco,
one rolls a random island, one loads Detroit, and the island is two clicks back. Without the history,
whoever presses *generate* last wins and everyone else's world is gone.

(Don's X11 multiplayer version worked this way. Whether the original Mac release had a comparable
undo history for terrain generation is unconfirmed.)

---

## The six verbs

Every generative surface exposes all six, visibly, to whoever is driving — human or agent:

| Verb | Guarantee |
|---|---|
| **Generate** | New candidate, recorded as a new history entry with its seed and parameters |
| **Reroll** | Another candidate; the previous one stays in the history |
| **Edit** | Hand-authored change over a generated base, recorded as its own entry |
| **Revise** | Regenerate within whatever the user has pinned; pinned parts are inputs, not outputs |
| **Reset** | Back to the last committed state |
| **Clear** | Deliberately to nothing — and itself an undoable entry |

**Reset and clear are different verbs.** Collapsing them is how people lose work by pressing the
button that promised safety.

**A reroll may not silently clobber hand-work.** If the next generation would overwrite edits, that
is a question, not an action — and the question is answerable by either driver
([moollm INTERFACE-TO-AGENCY](https://github.com/SimHacker/moollm/blob/main/designs/INTERFACE-TO-AGENCY.md)).

---

## What an entry holds

```
entry {
  id            -- monotonic, per session
  kind          -- generated | loaded | edited | cleared
  seed          -- RNG seed, for kind=generated (the whole point)
  params        -- generator inputs: size, water ratio, tree density, scenario
  pins          -- what the user froze before the last revise
  source        -- who proposed it: player id, or agent id plus its brief
  artifact_ref  -- content hash for kind=loaded|edited; absent for generated
  votes         -- per player, cleared whenever a new entry is proposed
}
```

A generated entry is a few dozen bytes. A loaded or edited entry needs the bytes, so it is stored by
content hash against the registry ([sims-content-registry.md](sims-content-registry.md)) — which is
also how identical rerolls are detected instead of duplicated.

---

## Applies to more than terrain

- **The Imagine Loop.** Model-generated household state is a proposal with a history, never an
  in-place rewrite of a save ([the-imagine-loop.md](the-imagine-loop.md)).
- **Interpretive layers.** Dreams and readings go to the human blank first, and any generated line is
  an editable draft whose byline moves when it is edited
  ([UNIVERSAL-JOBS.yml](../../apps/screen-angel/modules/soul-angel/UNIVERSAL-JOBS.yml), the interpretive layer).
- **Egg minting.** A minted egg's band layout is generated from its payload, so minting is a proposal
  too: reroll the layout, pin the badge, keep the previous ([EGGS.yml](../../apps/screen-angel/EGGS.yml)).
- **Any agent with write access.** An agent that cannot be undone has to be supervised. History is
  what lets it propose freely, which is the trade that makes the automation worth having.

---

## Why this is the precondition for automation, not a nicety

The reason to build the history first is that everything else this project wants — agents driving the
player's own controls, models generating content, a second person at the table — is the same problem:
another author with write access to something you care about. Reversibility is what makes that
tolerable, and it is what makes *asking* cheap enough to do every time.

↑ [designs/README.md](README.md)
