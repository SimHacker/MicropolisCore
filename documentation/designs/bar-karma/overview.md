# Bar Karma — Overview

**Status:** Historical (Stupid Fun Club / Current TV, 2011)
**Engine substrate:** [StoryMaker](../storymaker/architectural-overview.md)
**Revival:** [family-album-as-storymaker.md](../family-album-as-storymaker.md) — writers'-room + branching graph in Soul City

> **Bar Karma** — viewer-scripted television. Community pitches branch into produced episodes; a writers' room curates which storylines ship. Wikipedia: [Bar Karma](https://en.wikipedia.org/wiki/Bar_Karma).

---

## Concept

Bar Karma is the **broadcast face** of the SFC narrative stack:

| Layer | Bar Karma role |
|---|---|
| **StoryMaker scene graph** | Pitches and beats as scenes; storylines as episode arcs |
| **Writers' room** | Curators gate which branches become produced narrative |
| **Audience participation** | Viewers submit and vote — federated story before "federated git" |
| **Ratings / comments** | Same social layer as StoryMaker slides (votes, favorites, flags) |

MicropolisCore carries the pattern forward as **chat-as-writers'-room** for the Imagine Loop — see [designing-inward-miyamoto-principles.md](../designing-inward-miyamoto-principles.md) § Twitch / Bar Karma table.

---

## 2011 correspondence — GA Tech / Janet Murray

From [shneiderman-2011-correspondence.md](../storymaker/shneiderman-2011-correspondence.md):

Don reported (August 2011) that **Janet Murray** and Georgia Tech's **Experimental Television Group** would run **student projects on StoryMaker** — the same engine Bar Karma's production pipeline used. Onboarding lived at:

[http://storymaker.stupidfunclub.com/mediawiki/index.php/Georgia_Tech](http://storymaker.stupidfunclub.com/mediawiki/index.php/Georgia_Tech)

Ben Shneiderman (September 2011) replied: "Bravo for working with Janet Murray and GA Tech." That academic writers'-room + student-production loop is the direct ancestor of **multi-author scene graphs** in Soul City.

---

## Relation to sibling products

| Product | Relationship |
|---|---|
| [StoryMaker](../storymaker/architectural-overview.md) | Data model — scenes, links, storylines, places |
| [Urban Safari](../urban-safari/overview.md) | Geo-field capture on the same stack |
| **ShowMaker** | Later graph of show repos specializing StoryMaker — [WWSFF showmaker-network](https://github.com/SimHacker/WillWrightShowForFood/blob/main/process/showmaker-network.md) |
| **HiveMind** | Will Wright's next swing at community narrative (2012, unshipped) — [federation-peer-games.md](../federation-peer-games.md) |

---

## References

- [family-album-as-storymaker.md](../family-album-as-storymaker.md)
- [maxis-ea-shutdown-hn-2015.md](../maxis-ea-shutdown-hn-2015.md) § SFC timeline
- [shneiderman-2011-correspondence.md](../storymaker/shneiderman-2011-correspondence.md)
- Demo video (StoryMaker era): [youtube.com/watch?v=Db8KGNoeKHE](https://www.youtube.com/watch?v=Db8KGNoeKHE)
