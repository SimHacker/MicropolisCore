# The Pet Shop — curing a sick guinea pig by editing its soul

> *"Don't take the guinea pig to the vet. Open the guinea pig."*

**Status:** Design seed. **Monorepo:** MicropolisCore.
**Protocol:** moollm [`skills/soul-city/SOUL-BRIDGES.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-BRIDGES.md) ·
souvenirs and albums: [`SOUVENIRS.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUVENIRS.md)
**Implementation:** [`packages/sims-io/`](../../packages/sims-io/) (save and character decoding) ·
[`packages/vitamoo/`](../../packages/vitamoo/) (IFF and resource layers) ·
[`apps/screen-angel/modules/soul-angel/`](../../apps/screen-angel/modules/soul-angel/) (the bridge that opens the save)

This is the smallest demo that proves the whole thesis, which is why it is worth specifying
before the ambitious ones. It touches one animal, one object, one field, and one afternoon of
work — and if it lands, everything else in [soul-city.md](soul-city.md) is the same move at
larger scale.

## The patient

The canonical patient is **the guinea pig**: The Sims' caged pet with the famous fatal
illness. Neglect the cage, the guinea pig sickens, it bites a Sim, the disease moves through
the household, and it can kill. To players it is, and will remain, *the guinea pig* —
file formats and code may label small pets inconsistently, and where they do, we note the
field label and keep calling it what the players call it.

## The one-line version

Your guinea pig is sick. Instead of loading the game, walking a Sim to a community lot, and
clicking a pet-shop counter, you point SoulAngel at the household. It asks one question first —
*what is your guinea pig's name?* — then finds the cage, reads **why** the little soul is
suffering, cures both patients, hands you an illustrated book on guinea pig care, and gives the
save back. The guinea pig wakes up well, and named, and with a memory that you were kind.

That is the [Unleashed](https://en.wikipedia.org/wiki/The_Sims:_Unleashed) pet shop —
heal, adopt, train, match, revive — done as edits to the soul rather than as a minigame.

## Why it is the purest demo

A soul, here, is the inspectable editable artifact that defines a thing. A guinea pig's soul is
a handful of object attributes and, for cats and dogs, a `PersonData` record: bytes on disk you
can open and change. So "healing" is not a metaphor and not a simulation — it is **editing the
soul directly**, and the animal is the smallest thing that has one.

The same **BYOB** posture as everywhere else: we assert the tangible level (here are the
fields, here is the change) and take no position on whether the guinea pig suffers. Whether the
player *feels* it is the player's business, and the fact that they do is the point — it is the
[Cyberiad](https://en.wikipedia.org/wiki/The_Cyberiad)'s Seventh Sally question, kept alive as
drama rather than settled by a disclaimer.

## The consultation, in four steps

1. **Ask the name.** A named soul is a different soul from a stock one, and the name seeds
   everything downstream: the character file, the book, the memory.
2. **Diagnose both patients.** The save contains a sick guinea pig *and* an infected Sim.
   Explain the cause from history — the cage went six days uncleaned during the promotion
   crunch — not just the flag that is currently set.
3. **Cure both.** Clear the cage and illness attributes, restore drained motives, clear the
   Sim's infection. Nothing is created; existing state is corrected.
4. **Leave with a souvenir.** *Guinea Pig Maintenance*, a pageable in-game book: warning signs,
   a care schedule, illustrations. It is an album by another name, so it follows the
   [souvenir object model](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUVENIRS.md)
   — a typed object with a title, media, description, and Dublin Core metadata — and the
   [Family Album bridge](../../apps/screen-angel/modules/soul-angel/SOUL-ALBUM.yml) already
   knows how to write things into the game's own book formats.

## What the in-game shop does, and the soul-surgery equivalent

| In-game (Unleashed) | Soul surgery | What the model adds |
|---|---|---|
| Cure the sick caged guinea pig | Clear the cage's illness attribute, restore health and motive fields, clear the Sim's infection | Reads the *history* and explains the cause instead of clearing a flag |
| Adopt or buy a pet | Insert a pet record plus cage object into the lot | Fits the pet to the household — temperament, name, and a backstory that references the family |
| Train, teach tricks | Raise skill and relationship fields | Coach in language; the pet keeps a memory of having learned it |
| Improve the bond | Edit the pet ⇄ owner relationship fields | Negotiate it as a conversation, then commit the result |
| Pet dies of neglect | Restore motives, clear the death flag | Ask whether it *should* return — consent first, per [emigration ethics](../../apps/screen-angel/modules/soul-angel/SOUL-EMIGRATION.yml) |

## The audacious version: regenesis as a hot patch

Editing the sick guinea pig in place is the safe path. The bold one is to **generate a new,
named, healthy guinea pig object and splice it into the save in place of the stock one**: clone
the object with a fresh GUID (the
[Transmogrifier](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf)'s whole
trade), write it a bespoke identity, set every attribute healthy, then repoint the cage slot so
it instances *your* guinea pig.

That is a **polymorphic inline cache**, applied to a save file. A PIC (Self — Hölzle, Chambers,
Ungar) is a running system rewriting its own call sites, replacing a generic polymorphic
dispatch with a specialized monomorphic one patched in live. The Sims object system is
prototype-and-delegation based, from the same Self lineage, so the mapping is exact:

| PIC | Here |
|---|---|
| Call site | The cage slot in the lot |
| Generic polymorphic target | The stock guinea pig prototype |
| Specialized monomorphic path | Your named, healthy, bespoke guinea pig |
| The JIT rewriting itself at runtime | The shop generating an object and patching the save |

Self-modifying specialization, except the runtime is a twenty-six-year-old game and the
optimized value is a guinea pig called Nibbles.

## Small pets earn fuller souls

Cats and dogs already carry rich `PersonData`. Caged pets — guinea pigs, birds, fish — are
thinner, mostly object attributes. The shop is where they get more: on the first visit the
model writes a character file for the guinea pig (the name, a temperament, a memory of the
cage), so an animal that was three bytes of health comes home with a history. In the upstream
vocabulary that new file is its own
[organelle](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/CHARACTER-ENDOSYMBIOSIS.md):
inherited soul, plus a local one.

## Where it sits

A shop in Soul City's marketplace, alongside the object shops and the album press — the one
that works on the living. In bridge terms it is `measure` and a narrow, surgical `squirt`: read
the pet's state, correct or regenerate it, write it home. It creates nothing the game did not
already have a slot for, which is the same restraint the
[Afterlife bridge](afterlife-soul-bridge.md) operates under.

## Open questions

- Exact cage illness attribute, the Sim infection field, and the death flag — confirm against a
  real save through `sims-io` before claiming offsets.
- Canon versus code: players say guinea pig; note actual field labels where they differ.
- The hot patch: can a lot's cage slot be repointed to a freshly cloned GUID cleanly, or does
  it require rewriting neighbor and object references? Scope this before promising it.
- Does the guinea pig's character file round-trip back into the save, or live only on the hub
  side as its web soul?

## References

- Protocol and vocabulary: moollm [`skills/soul-city/`](https://github.com/SimHacker/moollm/tree/main/skills/soul-city)
- Album and souvenir schema: [`SOUL-ALBUM.yml`](../../apps/screen-angel/modules/soul-angel/SOUL-ALBUM.yml)
- Phase 0 of the build, which this demo belongs to: [soul-city-uplift-roadmap.md](soul-city-uplift-roadmap.md)
- The product it sits inside: [soul-city.md](soul-city.md)
