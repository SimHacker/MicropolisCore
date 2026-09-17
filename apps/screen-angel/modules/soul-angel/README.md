# SoulAngel

*A guardian angel for your games.* Always-on DVR, universal **Soul Album**, machinima and
streaming studio, and per-game **Soul Bridges** that read and write the game's own soul —
saves, albums, characters — from a web overlay.

**This is a module of [Screen Angel](../../README.md), not an application.** It was an
application once, and the general half of it — the shell, the overlay, the recorder, the event bus,
the grants — moved up into the app when Screen Angel absorbed it. What stayed here is everything
that only makes sense because the app is looking at a game about people. Product spec and
show/community framing live in the WillWrightShowForFood repo
(`catalogs/soul-city/soul-angel.yml`, `apps/soul-angel/`).

**License: source-available, commercial rights reserved. See [LICENSE.md](LICENSE.md).**

## What it is

SoulAngel is the outreach-to-players'-desktops vehicle for [Soul City](https://github.com/SimHacker):
one stable app that connects players and their games to a shared community and web site.

Think of the great bucket-wheel excavator: SoulAngel digs up content from running games —
objects, screen snapshots, video, audio, stories — puts it on conveyor belts, and streams it
to the Soul City web site, Twitch, YouTube, and any other consumer. The game keeps running;
the conveyor never stops.

What you get depends only on how much the game is willing to tell us, and the first row needs
nothing at all:

| What it needs | What you get |
|---|---|
| **Nothing from the game** | DVR ring buffer, scrub back in time, still and clip capture, Soul Album story cards, voice narration, Twitch/YouTube/OBS gateway |
| **A per-game plugin** (a Soul Bridge) | Read, write, edit, and generate saves; enumerate the characters living in them; round-trip the game's own album format, such as The Sims Family Album |
| **A Soul City account** | Publish albums to Soul City Broadcast Network channels — TV, radio, magazine — and syndicate across the federation |

## Naming: Soul Album and Family Album

- **Soul Album** — our generic, cross-game album schema: story cards with images, clips,
  captions, narration, and provenance.
- **Family Album** — what Sims fans call the in-game feature; SoulAngel's Sims 1 bridge
  imports and exports Soul Album ⇄ Family Album.
- We never co-opt a game's own names. Each bridge maps the game's native vocabulary onto
  the uplifted game-independent schema.

## Architecture: what is here and what is upstairs

The shell is the app's: one Electron host, a transparent always-topmost click-through web view,
small native addons for capture and accessibility, the shape
[Kando](https://github.com/kando-menu/kando) proves and the 2013 *aQuery* prototype demonstrated
first. It is specified in [`SCREEN-ANGEL.yml`](../../SCREEN-ANGEL.yml) and
[`RECORDER.yml`](../../RECORDER.yml), and nothing about it is soul-specific.

This module owns the part that is: save-format parsers as pure functions, per-game Soul Bridges,
the album, jobs and errands, emigration, federation sync, and the `soul.*` half of the event bus.
[`ARCHITECTURE.yml`](ARCHITECTURE.yml) lists what moved up and where each piece went.

**Soul Angel is Screen Angel's first module, and The Sims 1 is Soul Angel's first bridge.** Each is
the other's beachhead: games are the hardest possible target, because most of them expose no
accessibility tree at all, so a layer that works here works anywhere. The harvested design, the
rescued 2013 email thread with Peter Korn, Ben Shneiderman, Blair MacIntyre and James Landay, and
the Prefab lineage are in [`SCREEN-ANGEL.yml`](../../SCREEN-ANGEL.yml).

## Spec map

| File | What |
|------|------|
| [ARCHITECTURE.yml](ARCHITECTURE.yml) | Shell vs. web split; transparent overlay; capture + composite + screencast pipeline |
| [SOUL-ALBUM.yml](SOUL-ALBUM.yml) | The album schema — story cards, provenance, narration, game-album bridging |
| [DVR.yml](DVR.yml) | Ring buffer always rolling; pause game, scrub video, freeze frame to card |
| [SOUL-BRIDGE-SDK.yml](SOUL-BRIDGE-SDK.yml) | Per-game TypeScript plugins in the overlay — scoped file access, switched per game |
| [GAME-BRIDGES.yml](GAME-BRIDGES.yml) | Which games get bridges and in what order; the album features that need no bridge at all |
| [UNIVERSAL-JOBS.yml](UNIVERSAL-JOBS.yml) | Jobs a character can hold in any game at all, bridge or no bridge — the journalist, the photographer, the byline that sorts a session into one story per correspondent |
| [OUT-OF-GAME-JOBS.yml](OUT-OF-GAME-JOBS.yml) | A Sim goes to work and work is a different game: the egg she leaves behind, the outcome that comes back, and the rabbit hole with something playable in it |
| [SOUL-EMIGRATION.yml](SOUL-EMIGRATION.yml) | How a soul leaves a game and lands in a better one; object packs and why they are never the headline |
| [`../../SCREEN-ANGEL.yml`](../../SCREEN-ANGEL.yml) | **The app this module lives in** — selectors and events over accessibility APIs plus pixel recognition, harvested from 2013–2026 with sources. Start at [`../../README.md`](../../README.md) for the full spec map |
| [LICENSE.md](LICENSE.md) | Source-available terms — build on it, plug into it; commercial rights reserved |

## Subsumed: stream-gateway

The stream-gateway project (brain bus → OBS overlay, Twitch/YouTube chat, SSE/WebSocket event
bus, overlay viewer, capture/compositing research) is subsumed into the features that work on any game.
Its specs remain in WWSFF `apps/stream-gateway/` as design references; the event bus, overlay,
and broadcast sinks land here as SoulAngel subsystems.

## One stable app, not twelve competing mutants

The plugin surface (Soul Bridges, album adapters, broadcast sinks) is deliberately open so the
community builds on ONE well-maintained engine instead of forking rivals. That is why the source
is available and the SDK is documented — and why commercial publication stays with us: somebody
has to keep the one app stable, signed, shipped, and supported.

## The philosophy in one line

**Album card = commit. DVR = session transcript. Provenance = the trace link.** Same shape as
MOOLLM [thoughtful-commitment](https://github.com/SimHacker/moollm/tree/main/skills/thoughtful-commitment):
freeze the ephemeral moment into a permanent, cited artifact — then publish it to the network.
