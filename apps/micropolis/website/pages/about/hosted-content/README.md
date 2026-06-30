# Hosted content — from Sims dialogs to Micropolis publishing

Micropolis inherits a design lineage from **The Sims** content platform: interactive cards, branching stories, and composable simulation objects — now backed by git repos and the Micropolis Federation.

This page is the **product projection**. Fuller research lives in the private DonHopkins repo; the [Will Wright Show For Food](https://github.com/SimHacker/WillWrightShowForFood) repo carries the **show projection**.

## What Sims already proved

The Sims 1 shipped machinery for explorable reactive content:

- **Dialog cards** — title, picture, text, branching buttons (Family Album, in-object PSAs)
- **Pie menus** — discoverable action surfaces on objects
- **SimAntics** — behaviors distributed through the microworld, not centralized in one AI

Don Hopkins's **Dumbold Voting Machine** demonstrated *procedural rhetoric*: real civic issues rendered as playable Sim objects with intentional failure modes. The **SimProv Wedding Playset** (Crowd Sitter, Cupid, Buddha statue) showed composable orchestration objects — each solving one practical problem, combined by the player.

## SimFreaks → CMS → Federation

Don reimagined **SimFreaks** as an OpenLaszlo interactive catalog (browse, examine, collect, compose, admin). **Steve Alvey's SliceCity** nested SimCity inside The Sims — data portability as shipped entertainment.

Micropolis extends that arc into [**Micropolis Home**](https://github.com/SimHacker/WillWrightShowForFood/tree/main/repo-shows/will-wright/catalogs/micropolis-home/) — create · publish · share — hosting federated catalogs for [SimFreaks](https://github.com/SimHacker/WillWrightShowForFood/tree/main/repo-shows/will-wright/catalogs/simfreaks/), [SimSlice](https://github.com/SimHacker/WillWrightShowForFood/tree/main/repo-shows/will-wright/catalogs/simslice/), [SimProv](https://github.com/SimHacker/WillWrightShowForFood/tree/main/repo-shows/will-wright/catalogs/simprov/), and [Zombie Sims](https://github.com/SimHacker/WillWrightShowForFood/tree/main/repo-shows/will-wright/catalogs/zombie-sims/).

| Layer | Sims precedent | Micropolis direction |
|-------|----------------|----------------------|
| Atoms | Objects + dialog templates | Hosted content **CARD.yml** + host mixins |
| Collections | SimFreaks themes / Exchange | Federation repos + curated playsets |
| Nesting | SliceCity, game-in-game | Simopolis bridges, emulators, save linking |
| Voice | Family Album stories | Branching hypertext + Repo Show artifacts |

See MOOLLM specs: `hosted-content-cards`, `family-album-cards` (DonHopkins `projects/micropolis-moollm/process/`).

## Related pages

- [Constructionist education](../constructionist-education/README.md)
- [Will Wright](../will-wright/README.md)
- [Don Hopkins](../don-hopkins/README.md)
- [Building SimCity](../../building-simcity/README.md)

## Status

Design narrative — implementation follows hosted-content card infrastructure and Federation publishing workflows.
