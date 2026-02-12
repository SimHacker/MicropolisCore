# Micropolis

**Open source city simulation, based on the original SimCity Classic by Will Wright.**

C++ engine compiled to WebAssembly. Runs in any browser. Runs headless in Node.js. SvelteKit frontend with WebGL tile rendering. CLI tools for city file analysis and editing.

**Live demo:** [micropolisweb.com](https://micropolisweb.com)

**Video demos:**
- [Micropolis Web Demo 1](https://www.youtube.com/watch?v=wlHGfNlE8Os) (how the engine and UI work)
- [SimCity Tile Sets, Space Inventory, and Cellular Automata](https://www.youtube.com/watch?v=319i7slXcbI) (tile sets, CA rules, to music by Jerry Martin)

## The Story

Micropolis traces a line from Will Wright's SimCity (1989) through multiple platform ports, multiplayer experiments, and educational adaptations. Don Hopkins ported SimCity to Unix, built multiplayer SimCityNet (demoed at ACM InterCHI '93 in Amsterdam), and eventually convinced Electronic Arts to release the source code under GPL-3 for the One Laptop Per Child project in 2008.

The name "Micropolis" was the original working title Will Wright suggested. EA granted the right to use the trademark "SimCity" only if the game passed their QA process -- and it was quite an ordeal hand-holding their QA department through running Linux in a VM on Windows to test it. Never wanting to go through that ever again, Don asked Will for an alternative name, and he recommended its original working title. Please call this game Micropolis, not SimCity, or EA's lawyers may come knocking. As Jeff Braun, CEO of Maxis, wrote:

> "Maxis was sued by Toho. We never referred to the name Godzilla, our monster on the box cover was a T-Rex looking character, but... a few magazine reviews called the monster, Godzilla. That was all it took. Toho called it 'confusion in the marketplace'. We paid $50k for Godzilla to go away. In all honesty, Toho liked Maxis, they said $50k was the minimum they take for Godzilla infringement."

At the time, "Micropolis" was also the name of a hard disk drive manufacturer. They eventually changed names and went out of business, but the company was recently restructured as [Micropolis GmbH](https://www.micropolis.com). The owner is an old school hacker who was generous enough to grant the [Micropolis Public Name License](MicropolisPublicNameLicense.md), which allows the game to use the name Micropolis under reasonable conditions. Many thanks to Micropolis GmbH for this courtesy -- check out their [BBS primer](https://www.micropolis.com/micropolis-bbs-primer), [robotics primer](https://www.micropolis.com/micropolis-robotics-primer), and [data storage primer](https://www.micropolis.com/micropolis-data-storage-primer).

This repo, MicropolisCore, is the C++ simulation engine extracted from the full [micropolis repo](https://github.com/SimHacker/micropolis), stripped down, cleaned up, compiled to WebAssembly with Emscripten/Embind, and wrapped in a modern SvelteKit web application.

## Architecture

```
MicropolisEngine/          C++ simulation core
  src/
    micropolis.h           Main engine header
    micropolis.cpp         Core simulation
    emscripten.cpp         Embind bindings for JS/WASM
    fileio.cpp             Save/load (.cty files)
    simulate.cpp           Simulation loop
    zone.cpp, traffic.cpp, power.cpp, budget.cpp, ...

micropolis/                SvelteKit application
  src/lib/
    micropolisStore.ts     Svelte 5 runes state management
    WebGLTileRenderer.ts   WebGL2 tile renderer (gold standard)
    CanvasTileRenderer.ts  Canvas 2D renderer (needs rewrite)
    WebGPUTileRenderer.ts  WebGPU renderer (skeleton)
    TileView.svelte        Map display component
    MicropolisSimulator.ts WASM engine wrapper
  scripts/
    micropolis.js          CLI tool for .cty file analysis
    constants.js           Tile definitions, world constants

resources/cities/          Save files (.cty) including all 8 scenarios
Cursor/                    Development docs and references
notes/                     Design notes and plans
```

### Reactive Bridge

The WASM engine talks to the Svelte UI through a callback chain:

```
C++ Micropolis Core (WASM)
    calls callback
Embind JSCallback Wrapper
    delegates
ReactiveMicropolisCallback
    updates
$state / $derived Runes
    triggers
Svelte 5 Runtime
    updates DOM
UI Components + WebGL Renderer
```

## CLI Tool

The `micropolis.js` CLI reads, analyzes, visualizes, edits, and patches .cty save files from the command line, independent of the WASM engine.

```bash
cd micropolis

# City information and analysis
npm run micropolis -- city info resources/cities/scenario_tokyo.cty
npm run micropolis -- city analyze resources/cities/scenario_boston.cty
npm run micropolis -- city analyze --format json resources/cities/radial.cty

# Visualize as ASCII, emoji, or monospace
npm run micropolis -- visualize ascii --row 20 --col 30 --width 30 --height 15 resources/cities/scenario_tokyo.cty
npm run micropolis -- visualize emoji resources/cities/radial.cty

# Edit city metadata
npm run micropolis -- city edit city.cty --funds 50000 --tax 9 --year 1960

# Patch scenario files with the values the engine injects at runtime
npm run micropolis -- city patch-scenario resources/cities/scenario_tokyo.cty --dry-run

# Export to JSON (with optional tile map data)
npm run micropolis -- city export --format json --include-map city.cty

# Pipe from stdin
cat city.cty | npm run micropolis -- city info -
```

Full test suite and command reference: [Cursor/micropolis-js-tests.md](Cursor/micropolis-js-tests.md)

## MicropolisHub: The Vision

Micropolis is not a "killer app." It is a **nurturing environment** -- a term from Don Hopkins' [DreamScape demo at WWDC 1995](https://donhopkins.medium.com/1995-apple-world-wide-developers-conference-kaleida-labs-scriptx-demo-64271dd65570):

> "We want to give creative people an environment in which to plant their seeds, a fertile ground, instead of a Killer App."

| Killer App | Nurturing Environment |
|------------|----------------------|
| One thing done perfectly | Many things made possible |
| Closed, finished product | Open, extensible platform |
| Consumes users | Cultivates creators |
| Zero-sum | Fertile ground for seeds |

**MicropolisHub** is the full vision: the simulation engine orchestrated by [MOOLLM](https://github.com/SimHacker/moollm) AI characters, running on a SvelteKit multiplayer platform, using **GitHub as MMORPG**:

- **The filesystem is the city.** All game state lives in git-controlled files.
- **Git is the multiverse.** Branches are alternate timelines. PRs merge histories.
- **Issues are class discussions.** Commits are decisions. Forks are universes.
- **AI tutors are MOOLLM characters.** Advisors who debate, explain, and learn alongside you.
- **Schools own their repos.** Privacy, safety, customization, community fundraising.

### AI Tutors

MOOLLM characters serve as tutors with distinct perspectives:

| Character | Role | Style |
|-----------|------|-------|
| Mayor's Advisor | General guidance | Pragmatic, patient |
| Urban Planner | Zoning, infrastructure | Idealistic, systems-oriented |
| Economist | Budget, taxes | Numbers-focused, cautious |
| Environmentalist | Pollution, green energy | Passionate, long-term |
| Historian | Real-world parallels | Storyteller, context-provider |

These aren't just observers. Following the DreamScape principle of "Users and Agents on Common Ground," AI tutors can take actions in the simulation, demonstrate techniques, and collaborate with students in the same city.

### GitHub-as-MMORPG Workflow

1. **Fork** the class repo -- your own universe
2. **Branch** for experiments -- alternate timelines
3. **Commit** decisions -- checkpoint history
4. **PR** to propose -- suggest changes to canonical
5. **Diff** to compare -- see what diverged

### What MOOLLM Brings to Micropolis

The micropolis skill is manifested in [MOOLLM](https://github.com/SimHacker/moollm) as an [Anthropic Skill](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching#prompt-structure) -- the native knowledge-injection format for Claude. But MOOLLM extends Anthropic's Skill specification with [eight architectural extensions](https://github.com/SimHacker/moollm/blob/main/designs/SPEED-OF-LIGHT-VS-CARRIER-PIGEON.md#moollm-extensions-beyond-basic-skills), drawing on Minsky's Society of Mind, Papert's Constructionism, Drescher's Schema Mechanism, and Will Wright's Sims architecture:

1. **Instantiation** -- Skills as prototypes creating instances with their own state, not just static procedures
2. **K-Lines** -- Minsky's semantic activation: saying "micropolis" activates a constellation of related concepts
3. **Empathic Templates** -- Smart generation based on semantic understanding, not string substitution
4. **Multi-Tier Persistence** -- Ephemeral scratch (`.moollm/`), append-only logs, editable state, plus the Semantic Image Pyramid: GLANCE.yml (5-70 lines), CARD.yml (50-200), SKILL.md (200-1000), README.md (500+), examples, templates -- read top-down, never load a lower level without loading the level above
5. **Speed of Light** -- Many agent turns inside one LLM call, no round-trip latency
6. **CARD.yml** -- Machine-readable interfaces with Sims-style advertisements: "what can I do here?"
7. **Ethical Framing** -- Room-based inheritance of performance context for appropriate character behavior
8. **Ambient Skills** -- Always-on behavioral shaping (the NO-AI hygiene suite prevents bad outputs without explicit invocation)

Full details: [MOOLLM: A Microworld Operating System for LLM Orchestration](https://github.com/SimHacker/moollm/blob/main/designs/LEELA-MOOLLM-DEMO-TRANSCRIPT.md)

**The micropolis skill** ([CARD.yml](https://github.com/SimHacker/moollm/blob/main/skills/micropolis/CARD.yml) | [SKILL.md](https://github.com/SimHacker/moollm/blob/main/skills/micropolis/SKILL.md) | [README.md](https://github.com/SimHacker/moollm/tree/main/skills/micropolis)) defines how MOOLLM agents interact with the simulation. It inherits from and composes with other skills:

| MOOLLM Skill | What It Gives Micropolis |
|-------------|--------------------------|
| [constructionism](https://github.com/SimHacker/moollm/tree/main/skills/constructionism) | Educational philosophy -- learn by building microworlds (Papert, Kay) |
| [adventure](https://github.com/SimHacker/moollm/tree/main/skills/adventure) | Room-based navigation -- directories are city districts, TinyMUD heritage |
| [character](https://github.com/SimHacker/moollm/tree/main/skills/character) | AI tutor personalities with locations, inventory, relationships |
| [mind-mirror](https://github.com/SimHacker/moollm/tree/main/skills/mind-mirror) | Personality modeling on Leary's Circumplex + Sims-style thought planes |
| [simulation](https://github.com/SimHacker/moollm/tree/main/skills/simulation) | Turn system, party management, game state hub |
| [schema-mechanism](https://github.com/SimHacker/moollm/tree/main/skills/schema-mechanism) | Drescher's causal learning -- agents discover cause and effect in the sim |
| [experiment](https://github.com/SimHacker/moollm/tree/main/skills/experiment) | Systematic simulation: SIMULATE, EVALUATE, ITERATE, ANALYZE cycles |
| [adversarial-committee](https://github.com/SimHacker/moollm/tree/main/skills/adversarial-committee) | Multi-perspective debate between AI tutors with incompatible values |
| [sister-script](https://github.com/SimHacker/moollm/tree/main/skills/sister-script) | Doc-first CLI automation -- the micropolis.js tool follows this pattern |
| [speed-of-light](https://github.com/SimHacker/moollm/tree/main/skills/speed-of-light) | Multiple agent turns inside a single LLM call, no round-trip latency |

**Speed of Light vs Carrier Pigeon:** Most AI agent systems coordinate *between* LLM calls -- 500ms+ per hop, precision degrades each hop, every turn re-tokenizes the full context. MOOLLM skills run *during* one LLM call -- multiple agents iterating dozens of times inside a single generation, instant latency, perfect precision. AI tutors can debate a zoning decision, explore alternatives, and reach a recommendation in one call rather than a slow chain of API round-trips. Full writeup: [Speed of Light vs Carrier Pigeon](https://github.com/SimHacker/moollm/blob/main/designs/SPEED-OF-LIGHT-VS-CARRIER-PIGEON.md).

**Schema Mechanism + LLMs:** Gary Drescher's [schema mechanism](https://github.com/SimHacker/moollm/tree/main/skills/schema-mechanism) (*Made-Up Minds*, 1991) is a computational model for discovering causal relationships: a schema is a Context + Action -> Result triple that an agent learns through experience. MOOLLM pairs this with LLM semantic understanding — the schema mechanism discovers structure, the LLM grounds the symbols with meaning and can explain the discovered relationships in natural language. The design goal for Micropolis: an agent discovers that placing industrial zones near residential zones causes pollution complaints, not as a hardcoded rule but as a schema learned from observing the running simulation. See: [MOOLLM Eval/Incarnate Framework](https://github.com/SimHacker/moollm/blob/main/designs/MOOLLM-EVAL-INCARNATE-FRAMEWORK.md).

**Experiment Skill:** The [experiment](https://github.com/SimHacker/moollm/tree/main/skills/experiment) skill brings systematic evaluation to Micropolis. Define an experiment (e.g., "compare tax strategies"), run multiple simulations using speed-of-light, evaluate outcomes against rubrics, iterate with variations, and analyze patterns across runs. The experiment framework was proven with 5 tournament rounds, 20+ games, and 116+ turns in the Fluxx Championship -- the same SIMULATE/EVALUATE/ITERATE/ANALYZE cycle applies to city planning strategies. Inherits from: [simulation](https://github.com/SimHacker/moollm/tree/main/skills/simulation), [evaluator](https://github.com/SimHacker/moollm/tree/main/skills/evaluator), [rubric](https://github.com/SimHacker/moollm/tree/main/skills/rubric), [speed-of-light](https://github.com/SimHacker/moollm/tree/main/skills/speed-of-light).

### Design Documents

| Document | What It Covers |
|----------|----------------|
| [MOOLLM Manifesto](https://github.com/SimHacker/moollm/blob/main/designs/MOOLLM-MANIFESTO.md) | The Micropolis vision, GitHub-as-MMORPG, nurturing environments, intellectual genealogy |
| [SimCity Multiplayer & Micropolis](https://github.com/SimHacker/moollm/blob/main/designs/sims/simcity-multiplayer-micropolis.md) | SimCityNet history, voting mechanics, OLPC constructionism, Alan Kay's critique |
| [Speed of Light vs Carrier Pigeon](https://github.com/SimHacker/moollm/blob/main/designs/SPEED-OF-LIGHT-VS-CARRIER-PIGEON.md) | Why multi-agent-in-one-call beats tool-call chains |
| [Factorio MOOLLM Design](https://github.com/SimHacker/moollm/blob/main/designs/FACTORIO-MOOLLM-DESIGN.md) | Factorio logistics as inspiration for MOOLLM's data flow architecture |
| [Factorio Logistics Protocol](https://github.com/SimHacker/moollm/blob/main/designs/factorio-logistics-protocol.md) | Rooms as pipeline nodes, exits as edges, objects as messages |
| [MOOLLM for Hackers](https://github.com/SimHacker/moollm/blob/main/designs/MOOLLM-FOR-HACKERS.md) | Quick technical overview of the whole system |
| [micropolis SKILL.md](https://github.com/SimHacker/moollm/blob/main/skills/micropolis/SKILL.md) | Full skill protocol: CLI reference, file format, WASM integration plan |

### The Bigger Picture

MOOLLM is kind of like The Sims meets LambdaMOO in Cursor, then steals all the great ideas from Factorio. Micropolis is one microworld within that system. The [logistic-container](https://github.com/SimHacker/moollm/tree/main/skills/logistic-container) skill treats directories as Factorio logistics boxes. The [adventure](https://github.com/SimHacker/moollm/tree/main/skills/adventure) skill makes the filesystem a navigable space. The [character](https://github.com/SimHacker/moollm/tree/main/skills/character) and [mind-mirror](https://github.com/SimHacker/moollm/tree/main/skills/mind-mirror) skills give AI agents personalities modeled on The Sims characters and Timothy Leary's Circumplex. All of these compose with the micropolis skill to create MicropolisHub.

The full MOOLLM skill registry: [121 skills](https://github.com/SimHacker/moollm/blob/main/skills/INDEX.yml) | [Narrative index](https://github.com/SimHacker/moollm/blob/main/skills/INDEX.md)

## The Lineage

| Year | Project | Innovation |
|------|---------|-----------|
| 1989 | **SimCity** (Will Wright) | City as sandbox, emergent systems as toys |
| 1991 | **HyperLook SimCity** (Don Hopkins, Sun) | NeWS/PostScript networking, axis of eval |
| 1993 | **SimCityNet** (Don Hopkins, DUX) | [Multiplayer X11/TCL/Tk](https://www.youtube.com/watch?v=_fVl4dGwUrA), demoed at InterCHI '93 Amsterdam |
| 1995 | **DreamScape** (Don Hopkins, Kaleida ScriptX) | "Nurturing environment," rooms + objects + web, WWDC demo |
| 2000 | **The Sims** (Will Wright) | Digital dollhouse, nurturing environment for stories |
| 2008 | **Micropolis** (Don Hopkins, OLPC) | Open source GPL-3, constructionist education |
| 2010 | **MediaGraph** (Don Hopkins, Stupid Fun Club) | Unity3D music navigation with pie menus, roads, and CA, collaboration with Will Wright |
| 2011 | **Bar Karma / Storymaker / Urban Safari** (Don Hopkins, SFC) | Branching narrative as spatial graph -- multi-user storytelling server + apps + geo storytelling on maps |
| Now | **MicropolisCore** | C++/WASM, SvelteKit, WebGL, CLI tools, MOOLLM AI tutors |

### Related Research

Sam Earle trained RL agents on Micropolis using fractal neural networks with quality-diversity methods:
- Paper: [Using Fractal Neural Networks to Play SimCity 1](https://arxiv.org/pdf/2002.03896)
- Code: [gym-city](https://github.com/smearle/gym-city) (OpenAI Gym environment for Micropolis)
- Discussion: [SimHacker/micropolis#86](https://github.com/SimHacker/micropolis/issues/86)

His key trick: recursive weight-sharing in fractal convolutional blocks, where each column acts as a continuous-valued cellular automaton ticking different numbers of times. The agents discovered power-plant placement, zone clustering, and traffic-avoiding road layouts.

## The Pioneers

| Pioneer | Contribution |
|---------|-------------|
| **Jean Piaget** | Children construct knowledge through interaction |
| **Seymour Papert** | Logo, Mindstorms -- learn by building microworlds |
| **Alan Kay** | Dynabook -- computers as thinking amplifiers |
| **Will Wright** | SimCity, The Sims -- emergent systems as toys |
| **Don Hopkins** | DreamScape, SimCityNet, Micropolis -- nurturing environments |
| **Craig Hubley** | "Empower every user to play around and be an artist" |

## Building

### WASM Engine

```bash
cd MicropolisEngine
make          # Requires Emscripten SDK
```

### SvelteKit App

```bash
cd micropolis
npm install
npm run dev   # Development server
npm run build # Production build
```

### CLI Tool

```bash
cd micropolis
npm run micropolis -- --help
```

## Links

| Resource | URL |
|----------|-----|
| **Live Demo** | [micropolisweb.com](https://micropolisweb.com) |
| **Doxygen Docs** | [micropolisweb.com/doc](https://micropolisweb.com/doc) |
| **MOOLLM** | [github.com/SimHacker/moollm](https://github.com/SimHacker/moollm) |
| **Micropolis Skill** | [moollm/skills/micropolis](https://github.com/SimHacker/moollm/tree/main/skills/micropolis) |
| **Original Repo** | [github.com/SimHacker/micropolis](https://github.com/SimHacker/micropolis) |
| **Sponsor** | [patreon.com/DonHopkins](https://patreon.com/DonHopkins) |

### Historical

| Resource | URL |
|----------|-----|
| **SimCityNet Announcement (1993)** | [art.net/~hopkins/Don/simcity](http://www.art.net/~hopkins/Don/simcity/simcity-announcement.html) |
| **Open Sourcing SimCity** | [donhopkins.medium.com](https://donhopkins.medium.com/open-sourcing-simcity-58470a27) |
| **DreamScape WWDC 1995** | [donhopkins.medium.com](https://donhopkins.medium.com/1995-apple-world-wide-developers-conference-kaleida-labs-scriptx-demo-64271dd65570) |
| **SimCityNet Video** | [YouTube](https://www.youtube.com/watch?v=_fVl4dGwUrA) |

## License

- **Code:** [GPL-3.0](LICENSE) ([notice](MicropolisGPLLicenseNotice.md))
- **Name:** [Micropolis Public Name License](MicropolisPublicNameLicense.md) -- "Micropolis" is a registered trademark of [Micropolis GmbH](https://www.micropolis.com) and is licensed as a courtesy of the owner.

Micropolis is based on the original SimCity from Electronic Arts / Maxis, designed and written by Will Wright, and ported to Unix by Don Hopkins.

-- Don Hopkins [don@DonHopkins.com](mailto:don@DonHopkins.com)
