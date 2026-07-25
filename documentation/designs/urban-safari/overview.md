# Urban Safari — Overview

**Status:** Historical (Stupid Fun Club, ~2010–11)
**Engine substrate:** [StoryMaker](../storymaker/architectural-overview.md) — especially **Places** + geo-tagged **Scenes**
**Revival hooks:** [family-album-as-storymaker.md](../family-album-as-storymaker.md) place layer; ebike / field-capture experiments in sibling repos

> **Urban Safari** — geo-social narrative captured in the field: stories anchored to real locations, browsed on map and road views.

---

## Concept

Urban Safari stress-tests StoryMaker's **Places** layer in the wild:

| StoryMaker layer | Urban Safari use |
|---|---|
| **Places** | Lat/long, elevation, venue cross-refs (Foursquare, Google Places, etc.) |
| **Scenes** | Beats captured on location — photo, text, optional audio |
| **Links / storylines** | Walks and rides as sequential or branching paths through the city |
| **Assets** | Media captured on iPhone/iPad in the field |

The SFC slides describe Places as spanning **Earth and virtual worlds** (Moon, Mars, Minecraft, Glitch). Urban Safari is the **on-Earth, on-foot / on-bike** slice of that design.

---

## 2011 correspondence — geolocation shipped

From [shneiderman-2011-correspondence.md](../storymaker/shneiderman-2011-correspondence.md):

When Don wrote Ben Shneiderman (31 August 2011), **geolocation had just landed** on both the **StoryMaker server** and the **iPhone/iPad app** — the enabling infrastructure for Urban Safari field capture and map-first browsing. Distribution was ad-hoc (device UUIDs → custom builds).

Shneiderman's reply did not name Urban Safari explicitly but validated the **geo-social narrative** direction and pointed Don to **Ben Bederson's StoryKit** as a parallel mobile story tool — simpler book model, less map-native than Urban Safari's Places graph.

---

## Navigation views (shared with StoryMaker / Soul City revival)

SFC StoryMaker promised multiple lenses on the same graph; Urban Safari emphasizes:

- **Map** — scenes as pins, density as heat
- **Road** — sequential path along a route (ride, walk, drive)
- **Pie-menu** — Hopkins touch lineage (see [piecraft/](../piecraft/README.md))

Soul City revival names five views (Map / Road / Pie / Album / Branching Story) in [family-album-as-storymaker.md](../family-album-as-storymaker.md).

---

## Relation to sibling products

| Product | Relationship |
|---|---|
| [StoryMaker](../storymaker/architectural-overview.md) | Full layer stack |
| [Bar Karma](../bar-karma/overview.md) | Same engine; broadcast curation instead of field capture |
| **ShowMaker** | Graph of shows over StoryMaker cards — [WWSFF storymaker-stories-and-scenes](https://github.com/SimHacker/WillWrightShowForFood/blob/main/process/storymaker-stories-and-scenes.md) |
| **MediaGraph / iLoci** | Map-native media navigation cousins — [playable-pie-publishing-cauldron/GATHERING.md](../playable-pie-publishing-cauldron/GATHERING.md) |

---

## References

- [storymaker/architectural-overview.md](../storymaker/architectural-overview.md) — Places + Scenes layers
- [shneiderman-2011-correspondence.md](../storymaker/shneiderman-2011-correspondence.md)
- [maxis-ea-shutdown-hn-2015.md](../maxis-ea-shutdown-hn-2015.md) § SFC experiments
- Demo video (shared StoryMaker reel): [youtube.com/watch?v=Db8KGNoeKHE](https://www.youtube.com/watch?v=Db8KGNoeKHE)
