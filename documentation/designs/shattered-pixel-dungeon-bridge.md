# Shattered Pixel Dungeon Bridge

**Status:** Design notes (engineering + strategic) — a character import/export bridge target
**Monorepo:** MicropolisCore
**Companion documents:** [characters-as-hydrogen.md](characters-as-hydrogen.md) (the multi-universal character substrate) · [simopolis.md](simopolis.md) (the hub) · [sims-content-registry.md](sims-content-registry.md) (the Sims-side import/export analog) · [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md) (another per-game bridge) · [og-cozy-games.md](og-cozy-games.md) (games-to-look-into) · [moollm-micropolis-integration.md](moollm-micropolis-integration.md)

> **Trademark / license notice.** *Micropolis* is used under license from Micropolis GmbH. *SimCity*, *The Sims*, *Maxis* are EA Inc. trademarks (nominative use only). **Shattered Pixel Dungeon** © 2014–2026 Evan Debenham, and **Pixel Dungeon** © 2012–2015 Oleg Dolya (Watabou), are **GPLv3**; this document describes interoperating with the public GPLv3 source, not vendoring it.

---

## Why this is a top-several bridge target (alongside Stardew Valley)

It is **open source (GPLv3)** — which makes the bridge *easy* and *high-fidelity*: we read the real data model from the real source, not guesses. Repo: <https://github.com/00-Evan/shattered-pixel-dungeon>.

- **High fidelity, low cost.** The save format is documented in the code itself; no reverse-engineering of an opaque binary (cf. the Sims `.iff` work). See "The save format is GZIP'd JSON" below.
- **The contrast world.** A brutal traditional roguelike is the perfect *opposite* of the cozy Sims/Stardew worlds. The bridge becomes dramatic and funny: send a Sim **down into the dungeon** (they will probably die); bring a battle-scarred **dungeon survivor up into a Sims house**. Permadeath there, no real loss here — bridging is **non-destructive + regenerable** (the canonical soul-file is the source of truth; runtimes are ephemeral incarnations).
- **Honors its upstream** — exactly our seed-sharing ethic. Shattered is itself a fork of Watabou's Pixel Dungeon, and Evan shares 30% of revenue upstream with Watabou. We credit + fork (the repo explicitly **does not accept PRs** — "provided in hopes others find it useful," not for committee — which suits the Repo-Show fork model and our own "openness ≠ obligation" stance).
- **The author is a great guest.** Evan Debenham ("00-Evan") is a verified solo-dev funding exemplar (free GPL game, cosmetic-only donations, one-time store purchases). A show with him covers the repo + the funding model + the bridge at once.

---

## The save format is GZIP'd JSON (not opaque binary)

Saves live in per-slot folders (`com.shatteredpixel.shatteredpixeldungeon.GamesInProgress`):

| File | Contents |
| --- | --- |
| `game.dat` | The run: the **hero**, game state, RNG, challenges, etc. |
| `depth%d.dat` | One dungeon level (the level layout + actors/items on it). |
| `depth%d-branch%d.dat` | A level branch. |

Each `.dat` is a **GZIP-compressed JSON document** produced by `com.watabou.utils.Bundle` (`SPD-classes/.../utils/Bundle.java`), which wraps `org.json`. Everything serializable implements **`Bundlable`** with the symmetric pair:

```java
void storeInBundle( Bundle bundle );      // write
void restoreFromBundle( Bundle bundle );  // read
```

Two properties make this *ideal* for a deterministic, lossless bridge:

- **`__className` polymorphism.** Every bundled object records its Java class under `__className`, so the JSON is self-describing — we always know what a node *is*.
- **An `aliases` table.** `Bundle` keeps a `HashMap` of old→new class-name aliases so renamed classes still load across versions. That is exactly the **mapping / migration layer** we want to mirror for round-tripping across our own representation layers.

So: `gunzip game.dat` → readable JSON. That's the whole ballgame.

---

## The character model (the Hero)

`actors/hero/Hero.java` `storeInBundle()` writes a clean, bounded set of fields:

| Field | Meaning |
| --- | --- |
| `heroClass` | enum `HeroClass` — **Warrior · Mage · Rogue · Huntress · Duelist · Cleric** |
| `subClass` | enum `HeroSubClass` — each class has two (e.g. Warrior → Berserker / Gladiator; Mage → Battlemage / Warlock; Rogue → Assassin / Freerunner; Huntress → Sniper / Warden; Duelist → Champion / Monk; Cleric → Priest / Paladin) |
| `armorAbility` | the chosen endgame ability (e.g. HeroicLeap, ElementalBlast, SmokeBomb, SpectralBlades, Challenge, AscendedForm) |
| `lvl`, `exp` | level + experience |
| `STR` | strength |
| `attackSkill`, `defenseSkill` | combat skills |
| `HP`, `HT`, `SHLD`, `HTBoost` | health, max-health, shield (from `Char` super) |
| `belongings` | **inventory**: equipped weapon/armor/artifacts/misc + backpack items (`Belongings.storeInBundle`) — itself a tree of `Bundlable` items (weapons, wands, scrolls, potions, rings, artifacts like CloakOfShadows/HolyTome) |
| (talents) | per-class talent trees (`Talent`) |

A `HeroInfo` summary (level, str, exp, hp, ht, shld, class, subclass) is also bundled — a ready-made thumbnail for indexing.

This maps cleanly onto the **[characters-as-hydrogen](characters-as-hydrogen.md)** periodic table:

| SPD concept | Hydrogen-table atom |
| --- | --- |
| Hero (class/subclass/stats/level) | **H** — Character |
| Belongings (weapons, armor, artifacts, wands) | **O** — Objects |
| Abilities + talents | **N** — Behaviors |
| Hero appearance / class look | **S** — Appearances |
| Badges, journal/catalog, run history | **P** — Memories & events |
| Dungeon depth / branch | **C** — Lots & spaces |

---

## Import/export design (deterministic, layered, lossless)

Same shape as the Sims import/export ([sims-content-registry.md](sims-content-registry.md)) and the [sim-obliterator BRIDGE/UPLIFT](moollm-micropolis-integration.md): read the native files, **interpolate up** into higher-level human/LLM-friendly formats, edit, and **write back down** so the native engine still loads them — preserving comments, metadata, and *anything we don't understand*.

### Layers of representation (move up and down losslessly)

| Layer | Form | Notes |
| --- | --- | --- |
| **L0** | `game.dat` (GZIP) | the native artifact the engine reads/writes |
| **L1** | JSON (un-gzipped) | mechanical, reversible; `__className` + aliases intact |
| **L2** | **YAML-jazz** | human/LLM-editable; comments + metadata are first-class data; *unknown fields passed through verbatim* |
| **L3** | characters-as-hydrogen **soul-file** | the universal character (Hero ↔ Sim ↔ Proxi ↔ Wizardry), engine-agnostic |

### Principles

- **Deterministic round-trip.** `L0 → L1 → L2 → L3` and back must reproduce a `game.dat` the unmodified SPD engine loads. Test: decode → re-encode → byte/sector-equivalent (modulo gzip + key ordering) → game still boots the save.
- **Pass-through everything.** Fields we don't map (engine internals, future additions, `__className` of types we don't model) are carried verbatim through L2/L3 and re-emitted, so we never corrupt a save by not understanding it. (Mirror SPD's own `aliases` discipline for version drift.)
- **Preserve comments + metadata.** YAML-jazz at L2 keeps provenance, source URLs, edit history, and human notes alongside the data.
- **Text-first.** Since the native format is *already* JSON-under-gzip, we may not even need a binary step — for some content, copying/translating the text is enough. (Contrast the Sims `.iff` binary work.)
- **Index + map.** Extract a `HeroInfo`-style thumbnail at import for the registry; map class/subclass/ability/item identifiers to stable cross-engine ids.

---

## Mapping classes (and pets) to Sims 1 expansions

The Sims 1 *already shipped* the destination layers — no third game required:

- **Magic → The Sims: Makin' Magic (2003).** The magical SPD classes map onto Makin' Magic spellcasting: **Mage** (Battlemage/Warlock) and **Cleric** (Priest/Paladin) → Sim spellcasters; armor abilities + **wands** → spells / charms / wands; **potions / scrolls / reagents** → Makin' Magic ingredients + charm recipes; mana/HTBoost → the magic-energy economy. A dungeon Warlock retires to Magic Town.
- **Pets / animal companions → The Sims: Unleashed (2002).** Animal allies (the Huntress's Spirit Hawk, the Rogue's Shadow Clone as a "familiar", Mage staff-summons) → Unleashed **dogs / cats** (or custom pet objects). Pets are first-class characters in [characters-as-hydrogen](characters-as-hydrogen.md) (H) — and yes, the [Wig-O-Matic](the-computer-as-portal.md) puts wigs on them.
- Martial classes (**Warrior**, **Duelist**, **Huntress**, **Rogue**) map to base-Sims traits + skills (Body/Logic) + custom action objects; their *gear* (weapons/armor/artifacts) becomes Sims objects.

This is the same expansion-aware mapping the Sims content tools already do; the bridge just feeds it from a roguelike soul-file.

## The bridge into Simopolis (and back)

- A **Hero** imports as a characters-as-hydrogen soul-file; it can incarnate as a **Sims character** (the cozy contrast), accreting a **Mind Mirror** personality read along the way (see [moollm-microworld-os.md → the double personality model](moollm-microworld-os.md)).
- A **Sim** can export *down* into SPD as a Hero (pick a class by personality?), descend the dungeon, and — because bridging is **non-destructive** — die heroically and be **regenerated** from the canonical soul-file at will.
- Same substrate as the other bridges (Stardew, Proxi, Wizardry): **Simopolis is the hub**; characters/objects/memories move between universes (Will Wright's 1996 data-portability "crown jewel").

---

## Status & next steps

1. **Read a real `game.dat`** — `gunzip` + parse JSON; dump the hero subtree.
2. **Build L0↔L1↔L2 reader/writer** in TypeScript (gzip + JSON + YAML-jazz, pass-through preserved).
3. **Round-trip test** — decode → re-encode → load in unmodified SPD (desktop build) to prove fidelity.
4. **Map L2→L3** — Hero → soul-file; items → objects; talents → behaviors.
5. **Demo** — a live Sim → Hero → dungeon → (death) → regenerate, on the Repo Show with Evan (forked from his GPLv3 repo).

## See also

- [characters-as-hydrogen.md](characters-as-hydrogen.md) · [simopolis.md](simopolis.md) · [sims-content-registry.md](sims-content-registry.md) · [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md) · [og-cozy-games.md](og-cozy-games.md) · [moollm-micropolis-integration.md](moollm-micropolis-integration.md)
- Repo: <https://github.com/00-Evan/shattered-pixel-dungeon> (GPLv3) · upstream: Watabou's Pixel Dungeon
- Show (DonHopkins repo): `projects/micropolis-moollm/shows/game-bridge-sims-shattered.yml`
