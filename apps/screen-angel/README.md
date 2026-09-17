# Screen Angel

> A high level scriptable accessibility tool that is to native user interface components what
> jQuery is to the DOM — for selecting and querying components, matching visual patterns,
> handling events, abstracting platform dependencies, and building higher level widgets on top.

Named **aQuery** in an email to Peter Korn around 2013, and proposed publicly on Hacker News
eighteen times between 2015 and 2025, gaining something each time. Never built. Renamed
**Screen Angel** in September 2026.

**The payoff, in Don's words:** *fix and script and extend and customize existing apps that have
shitty user interfaces, from outside, without modifying the apps.*

## The name

Scraper, reader, angel. A screen **scraper** takes. A screen **reader** reads to you. A screen
**angel** acts for you — and unlike most theological borrowings, this one describes the
implementation literally rather than figuratively. An angel is invisible, above you, and
intervenes on your behalf. That is a transparent, always-topmost, click-through overlay.

The old name pointed at a library from 2006 to explain an idea that never depended on it. jQuery
was the metaphor and the recruiting story, not the dependency, and the metaphor had aged into a
prerequisite.

**Everything in [`sources/`](sources/) still says aQuery, unaltered** — those are Don's own 2013
emails, the Slate issue, and the Hacker News record. The design renames; the evidence keeps its
provenance.

## The layers

Each rung is the **beachhead** of the one below it: not the easiest landing, the one that proves
the rest is reachable.

| | What it is | Why it goes first |
|---|---|---|
| **Screen Angel** | The layer. Selectors, event bindings, hybrid recognition, over any app on any platform. | — |
| **Soul Angel** | Screen Angel's first application — carrying souls out of games. | Games are the hardest target. They expose no accessibility tree at all, so the pixel path carries the whole load. Works here, works anywhere. |
| **The Sims 1** | Soul Angel's first application. | Twenty-six years old, live community, known formats, an owner who has stopped maintaining it, and characters people still care about. |

The scoping test is Don's: the Screen Angel "can help you with soulless apps like Microsoft Word
as well as soulful games like The Sims." Games have souls; Word does not. So *soul* cannot name
this layer, and *screen* can.

See [`modules/soul-angel/ARCHITECTURE.yml`](modules/soul-angel/ARCHITECTURE.yml) and
[`modules/soul-angel/GAME-BRIDGES.yml`](modules/soul-angel/GAME-BRIDGES.yml).

## The shape of it

Three ideas, and they have been stable since 2013.

**Selectors over the accessibility tree.** The platform APIs are as low level as the raw DOM.
Give them a selector language, implemented natively for speed, the way jQuery leans on
`querySelectorAll` and only falls back to Sizzle when it must.

**Bind to patterns, not to paths.** Blair MacIntyre's objection in the original thread was that
anything built by drilling down to specific objects breaks on the next app update. jQuery had
already solved that shape of problem with delegated events: handle near the root, match on the
way down, and one binding covers everything that will ever match — including interface elements
that don't exist yet.

**Pixels and accessibility together, not either/or.** Their failure modes don't overlap. Use the
accessibility tree where it exists and tells the truth; read pixels where it's absent or lying;
and use the cheap native query to decide which region of pixels is even worth looking at.

## What changed since he stopped writing about it

**The shell question is settled.** A transparent, always-topmost, click-through web view with
native APIs exposed to its JavaScript — Don's 2013 Slate hack did it, Simon Schneegans' Kando
does it now, and Soul Angel's Electron host does it. Three working implementations of the part
that used to be speculative.

**The recognizer arrived.** Morgan Dixon and James Fogarty's Prefab reverse-engineers a widget
tree from raw pixels alone, and Don's standing complaint was that *"Prefab isn't built around a
scripting language like dragonfly, NeWS or AJAX."* His own 2026 note is the other half: Prefab
was pre-LLM pattern recognition, which is much more relevant *with* LLMs. The selector engine and
the event model were never the blockers. Understanding what a widget is *for* was, and that is
now tractable.

## The Clippy question, answered by i-beam

Anything that floats helpfully over your work invites the comparison, and the answer is already
written: **i-beam**, the blinking text cursor embodied — the anti-Clippy, and the patron saint and
user focus of cursor-mirror in MOOLLM.

The difference isn't politeness, it's **where the agent stands.** Clippy sat beside the document
and inferred your intent from outside, so it had to guess, so it interrupted at the wrong moment
— a watcher adjacent to the work has no way to know when the right moment is. I-beam never
guesses, because it occupies your position instead of inferring it. Its own one-line summary:
*"Clippy was an assistant pretending to be an object; I-Beam is an object that turned out to be
able to help."*

What the Screen Angel takes from it:

- **Add no new surface.** Act through the application's own widgets, not next to them.
- **Occupy the position, don't infer it.** Bind to the widget the user is actually using.
- **Never arrive on a heuristic.** Click-through and invisible until summoned.
- **Advisory before assistive.** Ted Selker's COACH is the one measured positive result in the
  whole agent story, and its rule is a football coach on the sidelines: comment
  opportunistically, never interfere. Users learning Lisp with it completed five times as many
  exercises as controls with the same interface minus the proactivity.
- **Show the work.** Name the selector that matched and the action taken, so the user learns the
  layer by watching it operate.
- **Stay past the face.** No mascot, no eyes, no mood. McCloud's masking effect punishes detail:
  Clippy had eyebrows, which made it unmistakably somebody else, so you could only ever be
  watched by it. Everyone identifies with the blinking caret completely and nobody has ever found
  it cute.

And the circle closes inside this project's own sources. Clippy became the standing exhibit for
**Ben Shneiderman's** side of the 1997 agents debate — the proof that interface agents patronize,
interrupt, and seize control the user never offered. Shneiderman is *in* the
[2013 email thread](sources/2013-email-thread.md): he read the original proposal and forwarded it
to colleagues. So this layer has to satisfy the man who prosecuted the case, and it does, by
i-beam's move: direct manipulation and agency stop competing when the agent is the affordance you
were already using.

The pun is free, too. Both are bent metal that holds things together — a paperclip holds a stack
of paper, an I-beam holds up a building. Same job description, comically different load rating.

Lineage: `moollm/skills/cursor-mirror/docs/I-BEAM.md` and `characters/I-BEAM-CHARACTER.yml`;
archetype at `moollm/skills/no-ai-overlord/archetypes/i-beam.yml`. The reasoning behind every
bullet above, sourced to the 1997 debate and to Selker, Nass, Lanier, Wright and Papert, is
`moollm/skills/cursor-mirror/docs/I-BEAM-CONSTITUTION.md` — worth reading before designing the
[`AGENT.yml`](AGENT.yml) Clippy gate, which is where these rules become code.

## The lineage this is the third instance of

`uwm` under X10, cracked open with its main loop rewritten in Mitch Bradley's Forth so pie menu
tracking could be scripted. NeWS, where the window manager was just part of the toolkit, running
in the server, subclassable, scripted in PostScript — AJAX before AJAX. Then a window manager
scripted in JavaScript. Same shape, three decades apart.

The difference is that the first two could run code *inside* the window system, and nobody will
ever ship one of those again. The Screen Angel has to work from outside. That constraint is the
whole design.

## Driving it from an agent

The layer is reachable over a local socket, which means Cursor, Claude, a shell script, or
a Python REPL can *be* the Screen Angel rather than talk to something that has AI inside
it. One protocol, three front ends:

```bash
./cli/screen-angel info                 # backend, permissions, modules
./cli/screen-angel show 'button'        # find widgets and outline them on the real screen
./cli/screen-angel mcp                  # serve the same verbs as MCP tools
```

The skill in [`skills/screen-angel/`](skills/screen-angel/) documents all of it at four
resolutions — [`GLANCE.yml`](skills/screen-angel/GLANCE.yml) to decide if it is relevant,
[`CARD.yml`](skills/screen-angel/CARD.yml) for the interface,
[`SKILL.md`](skills/screen-angel/SKILL.md) for the full protocol and the selector language,
and [`README.md`](skills/screen-angel/README.md) for why each decision was made. It works
standalone, outside MOOLLM, with no install step.

## The JavaScript console is a supported way to use it

Not a debugging aid. For an app whose whole subject is other applications' interfaces,
typing a selector and watching boxes appear on the real screen is a shorter loop than any
UI could be, so the console is set up to make that one line long.

Open it four ways: **Developer → JavaScript Console** (`Cmd-Opt-I`), the menu bar item,
`F12` inside either window, or from a terminal — which works when the app is not frontmost
and when there is nobody at the keyboard at all:

```bash
./cli/screen-angel devtools                       # toggle it
./cli/screen-angel devtools --overlay             # the transparent layer
./cli/screen-angel eval "await \$show('button')"  # type into it from here
```

The overlay is worth naming separately. It is created unfocusable so it can never steal
keyboard from a game, which means no click and no menu accelerator ever reaches it — that
window is only openable by asking for it by name.

Waiting at the prompt:

| Call | What |
|------|------|
| `await $q('button')` | query the focused app, print a table, keep it as `$a.last` |
| `await $show('button[name*=Save]')` | query **and** outline the matches on the real screen |
| `await $hi($a.last)` / `await $clear()` | outline elements or rects; clear them |
| `await $look()` | screenshot the display, rendered inline in the console |
| `await $at(400, 300)` | the element under a screen point |
| `await $say('hello')` | one line on the overlay |
| `$help()` | all of it again |

Two DevTools features are worth turning on. **Settings → Console → Enable custom
formatters** makes an element print as `button "Save" 320,185 16x16` instead of a grey
`Object` — for a tree of hundreds of near-identical nodes that is the difference between
reading the log and clicking through it. And queries emit `performance.measure` marks, so
a tree walk shows up as a labelled bar in the **Performance** panel next to the paint it
caused.

Starting it never takes focus. The console window appears with `showInactive`, because
this app's subject is whatever else is frontmost: half the protocol is phrased in terms of
the focused window, so a console that activated itself would answer the first question
wrong, reporting on itself instead of on the thing you were looking at. `SCREEN_ANGEL_QUIET=1`
goes further and shows no window at all, which is what you want when a script or a test
run starts the app and nothing should move on screen.

Which means you need a way back in, and on macOS the obvious ones are not available. The
overlay asks to be visible on fullscreen spaces, and that request switches the whole
application to accessory activation policy — no Dock icon, no place in Cmd-Tab. It is an
either/or, not an oversight: restoring the Dock icon with `app.dock.show()` also stops the
overlay from covering another app's fullscreen space, which is the entire job. A menu bar
item is the intended way in, and a menu bar can be too full to show one, silently, with no
indication that anything was dropped.

So the reliable route is the socket:

```sh
screen-angel console            # bring it up, on whatever space you are on
screen-angel console --toggle   # or --hide
```

It appears on the current space, including someone else's fullscreen space, because a
window that opens somewhere you are not looking is not a way back in.

For an external debugger — Chrome's own `chrome://inspect`, or anything speaking CDP —
set `SCREEN_ANGEL_DEBUG_PORT=9222` before launching. Off by default, because it opens a
port any local process can attach to, and a debugger attached to *this* app can read the
accessibility tree of every window on the desktop.

## In this directory

| File | What |
|------|------|
| [`SCREEN-ANGEL.yml`](SCREEN-ANGEL.yml) | The design, deduped — each idea stated once with the post it came from, plus the backlog of what was never built |
| [`PROTOCOL.yml`](PROTOCOL.yml) | The control protocol: wire format, image transports, symbolic capture regions, and which parts are built versus specified |
| [`ANGEL-EVENT-BUS.yml`](ANGEL-EVENT-BUS.yml) | The Angel Event Bus: one name for the notification channel, why push belongs at the edges and never at the core, why a semantic statement is a tree node instead of a message, and why every event shares the ring buffer's clock |
| [`RECORDER.yml`](RECORDER.yml) | The always-on ring, clock-aligned chunks, the frames mode for real-time analytics, sinks, and live output to OBS |
| [`STUDIO.yml`](STUDIO.yml) | Pause, scrub back, select a moment in time and space, caption it, and send it somewhere |
| [`APP-CONTROL.yml`](APP-CONTROL.yml) | Driving an application's lifecycle — and the seamless cut that the save-file choreography exists to produce |
| [`MEDIA-STREAMS.yml`](MEDIA-STREAMS.yml) | Media Streams and MediaFlow, 1991–1997 — the icon grammar that turns out to be the modern vision task taxonomy, the auto-rumbler, streams and sessions, and why pull-based evaluation makes retiming free |
| [`AR-SDKS.yml`](AR-SDKS.yml) | A raid on augmented reality toolkits for ideas: named triggers, signal-to-parameter bindings, effect graphs, templates — and what does not apply when the world is a flat screen |
| [`EGGS.yml`](EGGS.yml) | The egg: an asynchronous task reified as an object in the world — its pie-menu tree IS its return type, HATCH commits, hatching empty cancels, and the character comes back exactly where she vanished; plus the two channels into a closed game and why one of them needs no save-quit-restart |
| [`MOBILE-CAMERA.yml`](MOBILE-CAMERA.yml) | Screen Angel with a phone camera instead of a framebuffer: what a read-only reader unlocks that the desktop one cannot have, which of the five stages are shared code, why photographing a display is harder than the decoder, where the work goes between GPU shaders and wasm, and how much of the app runs on a phone |
| [`RECOGNIZER.yml`](RECOGNIZER.yml) | How codes get found and read: zxing-wasm for QR because it is somebody else's solved problem, and an egg reader that is easier than a QR reader by construction — one axis, fiducial caps, a known palette, and the zoom told to it rather than searched for |
| [`OPTICAL-CHANNEL.yml`](OPTICAL-CHANNEL.yml) | How a finished game with no API asks us for something and hears an answer back: colored eggs and QR codes on the way out, pie menus and dialog trees on the way in, and one compile that emits both halves |
| [`MODULES.yml`](MODULES.yml) | Screen Angel as a host: in-process modules with full access, the sandboxed tier for everything else, and why installation is the real grant |
| [`AGENT.yml`](AGENT.yml) | The loop that decides which mechanism to use: screen plus tree plus intent plus granted tools — and the Clippy gate that lets inference prepare and rank but never act |
| [`ANALYTICS.yml`](ANALYTICS.yml) | Sending video out to a video analytics system and layering the annotations back over the footage they came from — with the standard CV vocabulary, and the engine truth that makes game footage labelled footage |
| [`ACCESSIBLIFY.yml`](ACCESSIBLIFY.yml) | Deducing what an app failed to expose — OCR, widget recognition, the merged tree with provenance, and why web content is the one case we can fix for every other client |
| [`CAPABILITIES.yml`](CAPABILITIES.yml) | Permissions in three layers: what the OS enforces on us, what we enforce on modules and clients, and what can only be declared and audited — plus what still works with each grant missing |
| [`DISTRIBUTION.yml`](DISTRIBUTION.yml) | Free on Steam, what unlocks, and what never goes behind the paywall |
| [`STEAMWORKS.yml`](STEAMWORKS.yml) | Getting onto Steam: the free development track against App ID 480, the paid release track and its 30-day clock, and every credential named rather than stored |
| [`skills/screen-angel/`](skills/screen-angel/) | The skill: how an agent drives the layer, at four resolutions |
| [`cli/`](cli/) | The Python client — `client.py` is the implementation, the CLI and MCP server are wrappers |
| [`sources/2013-06-26-slate-issue-322.md`](sources/2013-06-26-slate-issue-322.md) | The earliest dated artifact — the issue describing the working prototype, two years before the first public post |
| [`sources/key-quotes.md`](sources/key-quotes.md) | 34 verbatim quotes, extracted rather than retyped |
| [`sources/2013-email-thread.md`](sources/2013-email-thread.md) | The rescued wiki page in full: Don → Peter Korn → Jonathan Payne → Ben Shneiderman → Blair MacIntyre → James Landay → Morgan Dixon |
| [`sources/hacker-news-progression.md`](sources/hacker-news-progression.md) | All eighteen posts in order, what each added, and what could not be verified |
| [`sources/prefab-bibliography.md`](sources/prefab-bibliography.md) | Dixon and Fogarty's papers, checked against Crossref, with the two citation errors that circulate |
| [`sources/2013-jquery-pie-menus.md`](sources/2013-jquery-pie-menus.md) | The rescued companion page — the pie menus that ran on the 2013 overlay |

The wiki those pages came from is gone; the text is recovered from the Wayback Machine. The
static `donhopkins.com/home/` tree the thread links into is still live and serving.

↑ [`../../README.md`](../../README.md)
