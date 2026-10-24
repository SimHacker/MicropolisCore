# MicropolisCore

Micropolis is the open source version of SimCity, the 1989 city simulation by Will Wright. This
repo is its C++ engine compiled to WebAssembly, wrapped in a SvelteKit web app and a command-line
tool, plus the projects that grew beside it: VitaMoo, which plays The Sims 1 characters and
animations in the browser, and Screen Angel, which reads and extends other applications'
interfaces.

## Try it

| What | Where |
|------|-------|
| Micropolis in the browser | [micropolisweb.com](https://micropolisweb.com) |
| VitaMoo: Sims 1 characters and animation in the browser | [vitamoo.space](https://vitamoo.space) |
| How the engine and UI work (video) | [Micropolis Web Demo 1](https://www.youtube.com/watch?v=wlHGfNlE8Os) |
| Tile sets and cellular automata, to music by Jerry Martin (video) | [SimCity Tile Sets, Space Inventory, and Cellular Automata](https://www.youtube.com/watch?v=319i7slXcbI) |
| Engine source documentation | [micropolisweb.com/doc](https://micropolisweb.com/doc) |

## What's in the repo

| Path | What |
|------|------|
| [packages/micropolis-engine/](packages/micropolis-engine/) | The C++ simulation, built to WebAssembly with Emscripten |
| [apps/micropolis/](apps/micropolis/README.md) | The SvelteKit app and the `micropolis` CLI for city files and headless simulation |
| [packages/tile-renderer/](packages/tile-renderer/) · [packages/render-core/](packages/render-core/README.md) | Tile rendering (Canvas, WebGL, WebGPU) and the shared compositor |
| [packages/vitamoo/](packages/vitamoo/README.md) · [packages/mooshow/](packages/mooshow/) · [packages/sims-io/](packages/sims-io/) | VitaMoo: Sims 1 animation, the WebGPU stage, and Sims file formats |
| [apps/vitamoospace/](apps/vitamoospace/) | The VitaMoo demo app at vitamoo.space |
| [apps/screen-angel/](apps/screen-angel/README.md) | Screen Angel, an overlay that scripts other applications (source-available, see its [license](apps/screen-angel/LICENSE.md)) |
| [packages/optical-codec/](packages/optical-codec/README.md) | Screen Angel's optical channel reader |
| [apps/yoot/](apps/yoot/README.md) | Placeholder for a tower simulation app |
| [content/](content/README.md) | Cities (including all eight scenarios), tile sets, sounds, Sims assets |
| [documentation/](documentation/README.md) | Manuals, teachers' guides, talks, design notes, history, box art |
| [skills/](skills/) | MOOLLM skills for driving Micropolis |

To build, test and run it: [DEVELOPMENT.md](DEVELOPMENT.md). Open work:
[documentation/TODO.md](documentation/TODO.md).

```bash
corepack enable && pnpm install
pnpm --filter micropolis dev
```

The compiled engine is committed, so you only need Emscripten to change the C++.

## The story

Don Hopkins ported SimCity to Unix, made it multiplayer as SimCityNet (shown at ACM InterCHI '93 in
Amsterdam), and persuaded Electronic Arts to release the source under GPL-3 for the One Laptop per
Child project in 2008.

EA would allow the name "SimCity" only if the game passed its QA process, which meant walking their
QA department through running Linux in a virtual machine on Windows. Rather than do that again,
Don asked Will Wright for another name, and Will suggested the game's original working title,
Micropolis. Please call it Micropolis, not SimCity. As Jeff Braun, CEO of Maxis, wrote about another
name:

> "Maxis was sued by Toho. We never referred to the name Godzilla, our monster on the box cover was
> a T-Rex looking character, but... a few magazine reviews called the monster, Godzilla. That was
> all it took. Toho called it 'confusion in the marketplace'. We paid $50k for Godzilla to go away.
> In all honesty, Toho liked Maxis, they said $50k was the minimum they take for Godzilla
> infringement. I doubt you will need to worry about Toho, as long as there are no magazine reviews
> that call the monster Godzilla."

([The full thread](documentation/designs/jeff-braun-toho-godzilla-email-2024-02-17.md) ·
[box art](documentation/box-art/README.md))

"Micropolis" was also the name of a hard disk maker, now restructured as
[Micropolis GmbH](https://www.micropolis.com). Its owner granted the
[Micropolis Public Name License](MicropolisPublicNameLicense.md), which lets the game use the name
under reasonable conditions. Thank you, Micropolis GmbH.

This repo is the engine extracted from the full [micropolis repo](https://github.com/SimHacker/micropolis),
cleaned up, compiled to WebAssembly with Emscripten and Embind, and given a new web front end.

## The lineage

| Year | Project | What it added |
|------|---------|---------------|
| 1989 | SimCity (Will Wright) | The city as a sandbox |
| 1991 | HyperLook SimCity (Don Hopkins, Sun) | NeWS and PostScript, networked user interface |
| 1993 | SimCityNet (Don Hopkins, DUX) | [Multiplayer over X11 with TCL/Tk](https://www.youtube.com/watch?v=_fVl4dGwUrA), shown at InterCHI '93 ([proposal](documentation/historical/1993-interchi-simcitynet-proposal.md)) |
| 1995 | DreamScape (Don Hopkins, Kaleida ScriptX) | A "nurturing environment" of rooms, objects and the web ([WWDC demo](https://donhopkins.medium.com/1995-apple-world-wide-developers-conference-kaleida-labs-scriptx-demo-64271dd65570)) |
| 2000 | The Sims (Will Wright) | A dollhouse for stories |
| 2008 | Micropolis (Don Hopkins, OLPC) | GPL-3 source, for education ([how it happened](https://donhopkins.medium.com/open-sourcing-simcity-58470a27)) |
| Now | MicropolisCore | WebAssembly, SvelteKit, WebGL and WebGPU, a CLI, and MOOLLM characters |

## Where it's going: Soul City

The plan is to make Micropolis a place to learn in, not just a game: a class works in its own git
repository, branches are alternate futures for the city, pull requests propose changes, and AI
tutors with different views (an economist, an environmentalist, a planner) argue about them and can
act in the same city as the students. The tutors are [MOOLLM](https://github.com/SimHacker/moollm)
characters, driven by the [micropolis skill](https://github.com/SimHacker/moollm/tree/main/skills/micropolis).

Design: [Soul City](documentation/designs/soul-city.md) ·
[roadmap](documentation/designs/soul-city-uplift-roadmap.md) ·
[MOOLLM as a microworld OS](documentation/designs/moollm-microworld-os.md).

## Research using Micropolis

Sam Earle trained reinforcement learning agents on Micropolis with fractal neural networks; the
agents learned to place power plants, cluster zones, and lay out roads that avoid traffic.
[Paper](https://arxiv.org/pdf/2002.03896) · [gym-city](https://github.com/smearle/gym-city) ·
[discussion](https://github.com/SimHacker/micropolis/issues/86).

## Links

| | |
|-|-|
| The original micropolis repo | [github.com/SimHacker/micropolis](https://github.com/SimHacker/micropolis) |
| MOOLLM | [github.com/SimHacker/moollm](https://github.com/SimHacker/moollm) |
| SimCityNet announcement (1993) | [art.net/~hopkins/Don/simcity](http://www.art.net/~hopkins/Don/simcity/simcity-announcement.html) |
| Sponsor | [patreon.com/DonHopkins](https://patreon.com/DonHopkins) |

## License

- Code: [GPL-3.0](LICENSE) ([notice](MicropolisGPLLicenseNotice.md)), except Screen Angel, which
  has [its own license](apps/screen-angel/LICENSE.md).
- Name: [Micropolis Public Name License](MicropolisPublicNameLicense.md). "Micropolis" is a
  registered trademark of [Micropolis GmbH](https://www.micropolis.com), licensed as a courtesy.

Micropolis is based on the original SimCity from Electronic Arts / Maxis, designed and written by
Will Wright, and ported to Unix by Don Hopkins.

— Don Hopkins, [don@DonHopkins.com](mailto:don@DonHopkins.com)
