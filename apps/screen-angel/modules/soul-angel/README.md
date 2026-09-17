# SoulAngel

*A guardian angel for your games.* Always-on DVR, universal **Soul Album**, machinima and
streaming studio, and per-game **Soul Bridges** that read and write the game's own soul —
saves, albums, characters — from a web overlay.

This is the development home. Product spec and show/community framing live in the
WillWrightShowForFood repo (`catalogs/soul-city/soul-angel.yml`, `apps/soul-angel/`).

**License: source-available, commercial rights reserved. See [LICENSE.md](LICENSE.md).**

## What it is

SoulAngel is the outreach-to-players'-desktops vehicle for [Soul City](https://github.com/SimHacker):
one stable app that connects players and their games to a shared community and web site.

Think of the great bucket-wheel excavator: SoulAngel digs up content from running games —
objects, screen snapshots, video, audio, stories — puts it on conveyor belts, and streams it
to the Soul City web site, Twitch, YouTube, and any other consumer. The game keeps running;
the conveyor never stops.

| Tier | Needs from the game | What you get |
|------|--------------------|--------------|
| **1 Universal** | Nothing | DVR ring buffer, scrub back in time, still/clip capture, Soul Album story cards, voice narration, Twitch/YouTube/OBS gateway |
| **2 Soul Bridge** | Per-game plugin | Save read/write/edit/generate, soul (character) enumeration, native album round-trip (e.g. The Sims Family Album) |
| **3 Broadcast** | Soul City account | Soul City Broadcast Network channels — TV, radio, magazine; federation syndication |

## Naming: Soul Album and Family Album

- **Soul Album** — our generic, cross-game album schema: story cards with images, clips,
  captions, narration, and provenance.
- **Family Album** — what Sims fans call the in-game feature; SoulAngel's Sims 1 bridge
  imports and exports Soul Album ⇄ Family Album.
- We never co-opt a game's own names. Each bridge maps the game's native vocabulary onto
  the uplifted game-independent schema.

## Architecture: web center of gravity, thin native shell

The Cordova/Electron lesson, applied to a game companion: **everything that can be a web app
is a web app.** TypeScript running in an embedded browser owns the UI, the overlay drawing,
the album engine, the DVR timeline, the bridges, and the publish pipeline. The native shell
is a thin host for the things a browser cannot do: window capture, hardware encoding,
transparent overlay windows, Steam SDK, input injection, OS accessibility.

Windows ships first (WinUI 3 + WebView2). The Mac port later reuses the entire web layer and
swaps the shell (ScreenCaptureKit + VideoToolbox). Details: [ARCHITECTURE.yml](ARCHITECTURE.yml).

## Spec map

| File | What |
|------|------|
| [ARCHITECTURE.yml](ARCHITECTURE.yml) | Shell vs. web split; transparent overlay; capture + composite + screencast pipeline |
| [SOUL-ALBUM.yml](SOUL-ALBUM.yml) | The album schema — story cards, provenance, narration, game-album bridging |
| [DVR.yml](DVR.yml) | Ring buffer always rolling; pause game, scrub video, freeze frame to card |
| [SOUL-BRIDGE-SDK.yml](SOUL-BRIDGE-SDK.yml) | Per-game TypeScript plugins in the overlay — scoped file access, switched per game |
| [LICENSE.md](LICENSE.md) | Source-available terms — build on it, plug into it; commercial rights reserved |

## Subsumed: stream-gateway

The stream-gateway project (brain bus → OBS overlay, Twitch/YouTube chat, SSE/WebSocket event
bus, overlay viewer, capture/compositing research) is subsumed into SoulAngel's universal tier.
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
