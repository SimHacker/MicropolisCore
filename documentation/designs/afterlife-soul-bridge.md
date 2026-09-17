# The Afterlife Soul Bridge: draining an abandonware afterlife into a living city

**Status:** Design seed (speculative — no code, no committed schedule)
**Monorepo:** MicropolisCore
**Protocol:** [moollm `skills/soul-city/SOUL-BRIDGES.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-BRIDGES.md) — this doc is the worked case, not the protocol
**Companion documents:** [`soul-city.md`](soul-city.md) · [`federation-peer-games.md`](federation-peer-games.md) · [`characters-as-hydrogen.md`](characters-as-hydrogen.md) · [`micropolis-role-sheets.md`](micropolis-role-sheets.md) · [`moollm-microworld-os.md`](moollm-microworld-os.md)

> *"I want the games to actually be able to have persistent data that can move from one game to another."*
> — Will Wright, Stanford, 26 April 1996

---

## Why this game, of all games

Every other peer game in [`federation-peer-games.md`](federation-peer-games.md) has characters
we want to make portable. **Afterlife** (LucasArts, 1996) is the only one whose native
population unit *already is a soul*.

You play the demiurge, zoning Heaven and Hell for the dead of a nearby planet — explicitly not
Earth, per the manual, but a fictional world of **EMBOs**, "ethically mature biological
organisms" (lead designer Mike Stemmle marched in the Stanford Band, whose officers wear the
same initials). Zones are sins and virtues. The currency is pennies from heaven, power is Ad
Infinitum, crime is bad vibes, dissatisfied residents are lost souls, the arcology-equivalent
endgame rewards are Omnibolges and Love Domes, and the disasters are Heaven's Nose and the
Disco Inferno.

Stemmle's pitch was SimCity plus Dante, played straight: simulation games kept getting called
god games, so he made one where you are actually a god. Critics filed it as "little more than a
clone of SimCity 2000" ([Richard Cobbett, PC Gamer](https://www.pcgamer.com/saturday-crapshoot-afterlife/)),
which is exactly what makes it bridgeable — and it shipped in **1996**, the same year Wright
stood in Terry Winograd's classroom asking for data that moves between games.

## Three properties that make it the reference case

**1. The export path is already in the fiction.** Afterlife ships karma stations and karma
trains, where souls travel to be reincarnated — *if they believe in such a thing*.
Reincarnation is a shipped mechanic. A bridge that pulls a soul out of Afterlife and lands it
somewhere else is not violating the game's cosmology; it is using the transit system the
designers built, with a longer route.

**2. Cross-save transplant was already possible, by accident.** The zoning selection on your
cursor survives a game load, so you can select a building in one save or scenario, load a
different game, and place it there — [documented as a cheat since the
nineties](https://www.cheatbook.de/files/afterl.htm). Save-file portability arrived in 1996 as a
bug in a UI state machine. Every serious version of this idea since has been an attempt to do
on purpose what a stale mouse cursor did for free.

**3. The saves are full of stranded souls.** The game is abandonware territory, unsequeled, with
essentially no active community — the blog post that periodically resurfaces on Hacker News
notes it is the only game of its era with no subreddit
([To Game For Life](https://togameforlife.wordpress.com/2023/12/09/on-lucasarts-afterlife/),
[HN discussion](https://news.ycombinator.com/item?id=49719751)). Somewhere on old drives are
billions of processed souls nobody can visit anymore.

## Which gate it uses, and why that matters

Afterlife **fails the first criterion** of a federation peer game as
[`federation-peer-games.md`](federation-peer-games.md#what-we-mean-by-federation-peer-game)
defines it: its souls are not first-class named individuals with traits and relationships. They
are anonymous units in an aggregate.

That is not a disqualification, it is a category. Afterlife is the reference implementation of
the **hydraulics gate** rather than the character gate:

| Gate | Cargo | Afterlife |
|---|---|---|
| Hydraulics | Population as conserved fluid | ✅ This is what it has |
| Role gate | A named character taking an office | ❌ Nothing to name |

The three verbs, from the protocol: `measure` a save, `drain` souls out, `squirt` souls in,
with **nothing created or destroyed at the bridge**. The demo writes itself — `measure` an
Afterlife save, `drain` sixty thousand dead, `squirt` them into a sleepy Micropolis town, watch
the skyline jump. **Resurrection as re-zoning.**

### The restraint, in Micropolis terms

A squirt **only fake-simulates existing zones up (and down)** in population and growth — the
same tile evolution the Micropolis engine performs, applied instantly. It does **not** zone new
land. If the player hasn't zoned enough residential, commercial, and industrial capacity for the
incoming crowd to live *and work*, that is a real constraint and the surplus waits; it does not
get a suburb conjured for it. Draining runs the same edit downward.

This is the difference between a bridge and a cheat, and it is the reason the feature can be
shown on stream without the audience feeling lied to.

### Where the two gates meet

The interesting chain is what happens *after* the crowd lands, because Micropolis zones already
bind to Sims neighborhoods via the
[zone-binding scanner](soul-city.md#how-sims-save-files-actually-bind-to-micropolis-tiles):

```
Afterlife save        Micropolis city            Sims neighborhood
──────────────        ───────────────            ─────────────────
60,000 souls    →     zones evolve up      →     one household binds to zone-23-47
(anonymous)           (still statistical)        (named, with a face and a bathroom)
                                            ↓
                                     picks up a role sheet: Mayor, columnist,
                                     three minutes at the public microphone
```

A soul enters as a statistic and can leave as a citizen with a name. Hydraulics delivers the
crowd; the [role gate](micropolis-role-sheets.md) is where one of them becomes somebody. That
transition — anonymous aggregate to named individual and back — is the most interesting thing
this bridge can demonstrate, and no other peer game on the board sets it up as cleanly.

## Running the pipe the other way

**Hell is full.** Debit damned souls from a hell save by denomination and spawn a matching wave
of undead in a life sim, skinned per denomination, with outcomes credited back to the hell
ledger so the trip round-trips. The gag is a supply chain: the hell save is the industrial
supplier and a custom-content author's object suite is the artisan label on the jar. Ask where
the zombies are sourced — artisanal, farm-grown, soil to spike? Scaling target is
[They Are Billions](https://en.wikipedia.org/wiki/They_Are_Billions) horde pressure.

**Dezombify.** Which sets up the cleanest inversion available: every zombie in that horde was a
person. Run the bridge as the cure and export the swarm into high-rise apartments. The game
about sixty thousand bodies coming at your walls becomes sixty thousand residents moving into
your towers. Same crowd, opposite valence, salvation measured in occupancy rates.

Both directions obey conservation, and both are the same three verbs with the sign flipped.

## Prior art worth crediting

The deep version of nested simulation shipped years ago, made by a custom-content author rather
than a studio. **SliceCity** (Steve Alvey, SimSlice —
[archived](https://web.archive.org/web/*/simslice.com)) put a working, genuinely playable
Lilliputian SimCity in a Sims back yard: a real nested simulation, not a prop that plays a
cutscene when clicked.

| | What it is |
|---|---|
| **Shallow** | An object in one game that "plays" a toy version of another. Decorative. Done many times. |
| **Deep** | Real simulations nested, data flowing between them — actual save files linked, emulators run, state round-tripped. |

Everything in this document is the second kind or it is nothing.

## Technical reality check

| Aspect | Notes |
|---|---|
| Grade | 🟡 — **spiritual fit 11/10**, technical fit low. Perfect theme, hostile format. |
| Save format | Undocumented, DOS-era binary. No SMAPI, no ck3-tiger, no SimPE equivalent. Reverse engineering starts from zero, on a corpus of files nobody has catalogued. |
| Community tooling | Effectively none. A FAQ, some forum posts, one enthusiast blog. |
| Runtime | DOS/Windows/Mac 1996; play happens under DOSBox or equivalent. We do not need to run it to bridge it — we need to read and write its saves. |
| IP posture | Abandonware in practice, not in law. Same posture as every retro target: nominative use only, operate on **files the user already owns**, never redistribute assets or binaries. |
| Honest first step | `measure` only. Parse a save well enough to report a soul count by zone type, and stop. If that can't be done reliably, nothing downstream matters. |

## Open questions

- Does the save encode souls as counts per zone, per building, or as a global with derived
  distribution? The answer decides whether `drain` can be selective by denomination at all.
- Is denomination (the sin/virtue axis) recoverable from the save, or only from live game state?
  The "debit by religion" gag depends on it.
- Reincarnation is in the fiction — is it in the *file*? A karma-train counter would be the
  most on-theme field in any game we have looked at.
- Is there a scenario file format distinct from the save format? Scenarios are how the cursor
  transplant cheat gets interesting.

## References

| | |
|---|---|
| Protocol (the two gates, conservation, the restraint) | [moollm `SOUL-BRIDGES.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-BRIDGES.md) |
| Soul ontology (souls, minds, organelles) | [moollm `SOUL-MODEL.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-MODEL.md) |
| Why characters go first | [`characters-as-hydrogen.md`](characters-as-hydrogen.md) |
| Afterlife (game) | [Wikipedia](https://en.wikipedia.org/wiki/Afterlife_(video_game)) |
| Critical reappraisal | [Richard Cobbett, PC Gamer](https://www.pcgamer.com/saturday-crapshoot-afterlife/) |
| Cheats, incl. the cross-save building transplant | [CheatBook Afterlife file](https://www.cheatbook.de/files/afterl.htm) |
| Contemporary review | [GameSpot](https://www.gamespot.com/reviews/afterlife-review/1900-2537845/) |
| Video walkthrough of the mechanics | [LGR review](https://www.youtube.com/watch?v=-azFNwF6fa0) |
| Strategy notes and the 2023 revival | [To Game For Life](https://togameforlife.wordpress.com/2023/12/09/on-lucasarts-afterlife/) · [HN](https://news.ycombinator.com/item?id=49719751) |
