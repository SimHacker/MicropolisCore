# Reprogramming classic objects: the hard problems are already solved

**Status:** Active design — **not built**  
**Monorepo:** MicropolisCore  
**Companion documents:** [apps/screen-angel/EGGS.yml](../../apps/screen-angel/EGGS.yml) · [sims-content-registry.md](sims-content-registry.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [prefab-pixel-reverse-engineering.md](prefab-pixel-reverse-engineering.md)

> **Scope.** A working method, not a feature: when we need a new object, find the shipped object that already solved the hard part, and change what it means.

---

## The claim

The expensive parts of a Sims object are not the idea. They are the multi-tile master/slave
arrangement, the slots, the routing, the join interactions that let several Sims use one thing at
once, the animations that make hands land in the right place, the state machine that survives a save
and reload. All of that is shipped, debugged, and has been exercised by millions of players against
every weird lot layout that exists.

So the move is: **take the classic object that already solved the mechanics, and give it new graphics
and a new framing.** New meaning, old machinery. The risk drops from "will this work" to "is this the
right idea," which is the only question worth spending time on.

## Worked examples

**The dance floor** is a multi-tile grid of tiles that light in patterns. Read it as a display and
it is an egg matrix, a cellular automaton, or a status board the whole room can see
([EGGS.yml](../../apps/screen-angel/EGGS.yml), `matrix_eggs`).

**The pool table and the hot tub** already hold several Sims in one interaction, with the joining and
leaving handled. Read that as co-authorship and you get several characters cracking one egg together,
credited together, without inventing a single interaction primitive
([EGGS.yml](../../apps/screen-angel/EGGS.yml), `more_than_one_pair_of_hands`).

**Tombstones and urns.** Steve Alvey (SimSlice) reprogrammed the tombstone and urn objects so Don
could use them as templates for the tombstone generator. A death marker with a name on it is a
per-instance parameterised object with custom text — which is the shape of every minted egg, arrived
at years earlier by someone who needed a headstone to say the right name.

**The sushi vendor became a McFlurry vendor**, and then there was an incident. Don's story to tell,
including who was surprised and how loudly; recorded here as a case of reskinning a vendor object into
a different meaning, with a note that the framing carried further than the graphics did.

## Why it matters beyond convenience

Reuse of this kind is not thrift, it is where the good ideas come from. The dance floor was not built
to be a status display and the hot tub was not built to make co-authorship literal; they became those
things when someone looked at solved mechanics and asked what else they could mean. A catalogue of
working objects is a catalogue of available meanings, and reading it that way is a design method
rather than a shortcut
([moollm design-sense](https://github.com/SimHacker/moollm/blob/main/skills/design-sense/)).

It also keeps the modding community's own history load-bearing rather than decorative. The people who
reprogrammed these objects for two decades solved problems we would otherwise pay for twice, and
crediting them by name is part of the method
([characters/steve-alvey](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/README.md) for
the Soul City framing; the maker credits live with the content registry).

↑ [designs/README.md](README.md)
