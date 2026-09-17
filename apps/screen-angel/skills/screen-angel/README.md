# Screen Angel — the design argument

Part of MOOLLM · [This skill's directory](https://github.com/SimHacker/MicropolisCore/tree/main/apps/screen-angel/skills/screen-angel)

This is the highest-resolution level of the pyramid. Everything here is *why*. If you want
to use the thing, [SKILL.md](./SKILL.md) is complete on its own and you do not need this
file. Read this one when a decision looks arbitrary and you want to know what it is
defending against.

| Level | File | Answers |
|---|---|---|
| 👁️ Glance | [GLANCE.yml](./GLANCE.yml) | Is this relevant, and what are the verbs? |
| 📇 Card | [CARD.yml](./CARD.yml) | What is the full interface, and how does it fail? |
| 📜 Skill | [SKILL.md](./SKILL.md) | How do I use it, and what will bite me? |
| 📚 Deep | **this file** | Why is it built this way? |

---

## The missing recognizer

Everything needed to build a genuinely helpful desktop assistant existed by about 1997.
Accessibility APIs could enumerate every widget in every window. Scripting bridges could
read and set their values. Event hooks could see what the user did. Programming by
demonstration had a working literature — Richard Potter's *Triggers* was doing pixel-level
data access in Cypher's *Watch What I Do* in 1993, precisely because the accessibility
layer of the day was too thin, and the interesting work was in what to *do* with what you
could see.

The part that did not exist was understanding. A system could tell you that the widget at
`[0,3,12]` was a push button named "Flatten Image". It could not tell you whether that was
what the user meant by "get rid of the layers", whether it was safe, or which of five
applications was the right one to ask. Every attempt to bridge that gap was hand-written,
per-application, by someone who had to anticipate the question in advance. That is why
Clippy inferred from four signals and guessed wrong, and why the great automation
frameworks of that era are remembered as things that needed an expert to configure.

That gap is now the cheap part. An LLM reading a JSON dump of an accessibility tree can
tell you which button flattens an image, in an application nobody wrote an adapter for, in
a language nobody localized for. The selector engine was never the blocker. Understanding
was.

So this skill is not an automation framework with an AI feature. It is the socket the
recognizer plugs into — and the reason the interface looks the way it does is that the
thing on the other end is a model, not a script.

## Why an agent, not an advisor

There is a difference between a system that watches you work and offers suggestions, and a
system that occupies the same layer the work happens in.

Clippy was an assistant pretending to be an object: a character, in the room, at an
altitude of abstraction detailed enough to be unmistakably somebody else, watching. Every
design decision in the overlay is a reaction to that. The status badge is a glyph and a
word. `say` is text with an expiry and no buttons. There is no face, no eyes, no mood, and
no mascot, because the layer should read as a property of the screen rather than a
personality on it.

The I-beam is the opposite case and the model to aim at: an object that turned out to be
able to help. Nobody experiences a text cursor as an assistant, and nobody resents it.

## Why the protocol is the product

The app could have exposed all this only to its own renderer. It would have been less
work. The reason it does not:

An agent that can *be* the Screen Angel is qualitatively different from an app that has AI
inside it. Once the layer is reachable over a socket, Cursor can drive it, Claude can drive
it, a shell script in CI can drive it, and a Python REPL can drive it, without any of them
being anticipated. Adding a fourth caller costs nothing because the vocabulary was designed
for callers in general rather than for the one that happened to exist first.

That is also why the renderer and the socket speak **the same verb list**. Two vocabularies
would have drifted within a month, and the socket's would have become the neglected one.

## Why Python for the clients and TypeScript for the server

The server half is in Electron's main process because that is where the app is. There is no
choice and no argument.

The client half is Python because **a client is a script**. It has to run on a machine that
installed Screen Angel from Steam, where there is no `node_modules`, no pnpm, no bundler,
and no intention of acquiring any of them. The protocol is JSON over a socket, and both of
those are in Python's standard library, so `screen_angel/protocol.py` has zero
dependencies. It runs from a checkout with no install step.

The payoff of factoring it properly is visible in the file list: `client.py` is the whole
implementation, and `cli.py` and `mcp_server.py` are two front ends over it with no
capability either one lacks. A third front end — a Jupyter helper, a Slack bot, a test
fixture — is a wrapper, not a port.

The cost is a seam: the socket path is computed in two languages and the two spellings must
agree. That is a real duplication and it is the right trade, because the alternative is
needing a build step to run a shell command.

## Why the selector language omits things

`:nth-child` and the sibling combinators are missing on purpose, and this is the decision
most likely to look like laziness.

Sibling order in an accessibility tree is not a stable property of an application. It
changes when a toolbar gains a button, when a pane is collapsed, when the window is narrow
enough to trigger a different layout, and — worst — when the vendor ships an update.
A selector written as "the third button in the toolbar" does not break loudly when that
happens. It matches the wrong button and keeps working.

Matching on what a widget *is* fails in the honest direction: the name changed, nothing
matched, you find out. Every omission here is chosen to make the failure mode be "no
result" rather than "wrong result", because a system acting on someone's screen should
prefer to do nothing.

The same reasoning is why `path` is documented as a short-lived handle instead of an id.
It is a walk-order position. Giving it a stable-sounding name would invite exactly the
class of bug the selector language is built to avoid.

What the language does keep from CSS is the comma. That is not symmetry for its own sake:
the question an agent has is almost never "where are the buttons" but "what can I act on",
and the honest expression of that is a union of five roles. Making the caller issue five
queries and merge them would mean five tree walks — five times the cross-process cost —
and each walk would see a slightly different moment, so the merged answer would describe a
screen that never existed. One walk, several branches, one consistent answer.

## Why walks are budgeted, and why the cost is printed

Every accessibility attribute read is a synchronous cross-process round trip. Reading a
name is not reading a field; it is asking another program a question and waiting. A full
walk of a browser window is thousands of those, takes seconds, and can make the *target*
application appear to hang — Screen Angel's cost lands on somebody else's responsiveness.

Hence `maxDepth` and `maxNodes`, and hence `visited`, `durationMs` and `truncated` in every
result. That accounting is in the output because a caller that cannot see the cost will
write a loop that polls the whole tree at 10Hz, and be right to, given the information it
had.

`truncated` is reported rather than smoothed over for the same reason. A budgeted walk that
found nothing and a complete walk that found nothing are different facts, and collapsing
them is how you get an agent confidently telling a user a button does not exist.

## Why a capture returns a descriptor instead of an image

This is the decision that most affects what using the thing feels like.

The obvious design is that a screenshot method returns a screenshot. The problem is that
the most common question an agent has — *did a dialog appear*, *is Save enabled*, *what is
this field's value* — is answered by the accessibility tree in a few hundred bytes of
JSON. If capture returned pixels, that question would sometimes be answered with four
megabytes, and the caller who only wanted a boolean would pay for it. Multiply by an agent
loop and the protocol's dominant cost becomes images nobody looked at.

So `capture.grab` returns size, format, byte length, a content hash, and the list of
transports this connection may use. Fetching bytes is a second, explicit request. The extra
round trip is the point: it is a place to decide not to.

The transports exist because clients genuinely differ. A local client wants a **file path**
— zero copy, and a path *composes*: it can be handed to ffmpeg or an image viewer without
anyone holding the bytes. A remote client cannot use a path at all and wants a **counted
binary frame**. MCP's image content type is defined as base64 and leaves no choice.
Designing for only the first case would have baked "every client shares a filesystem" into
the protocol, to be torn out the first time an agent ran on another machine.

Counted rather than delimited, for binary: reading a length and then reading that many
bytes means no byte value is special and nothing needs escaping. It is what RESP bulk
strings, HTTP chunked encoding, and Docker's stream multiplexing all do, and it keeps the
text side of the same socket greppable — a reader that never asks for binary never sees
any.

And the server, not the client, decides which transports are on offer, based on the
listener the connection arrived on. A client asserting that it is local would be a client
asking for a path to somebody else's screenshot.

## Why symbolic regions and 1024 pixels

Two small decisions with more effect than they look.

**Symbolic regions** (`top-right`, `title-bar`, `center`) instead of rectangles, because a
rectangle computed from a size read a moment ago is stale the instant the user resizes the
window. A named region is resolved against current bounds at capture time. It cannot go
stale between the query and the grab. And it means naming a target is *enough* — there is
no size to look up first, which is the whole ergonomic difference between "grab that
control" and "grab that control, after two calls and some arithmetic".

**1024px longest edge by default**, because a 4K screenshot is not just more expensive than
a 1024px one, it is *worse*: more tokens, more latency, and no more legible for
recognition. Downscaling belongs at the source since that is the only place it can happen
before the bytes are paid for. A caller that needs genuine detail should ask for a smaller
region, not a bigger image — which is the same instinct as narrowing a selector instead of
raising the node budget.

`pad: snug` by default is the least glamorous decision in the protocol and one of the most
load-bearing. A control captured at exactly its bounds is frequently unrecognizable: a
checkbox becomes a grey square, and its label — the only thing on screen saying what it
does — sits outside the crop.

## Why marks

Set-of-marks is the one place having an overlay pays off twice. Drawing numbered markers on
the real widgets and returning a legend of `{n, path, role, name, bounds}` gives the model
and the machine a **shared vocabulary** grounded in the same pixels. "Click 3" needs no
coordinates, no fuzzy description, and no second guess about which Save button was meant.

It is also honest: the markers are ours, drawn on our transparent window, and they vanish
when cleared. Nothing is written into the application.

## Why read and act are separated in the source

`READ_ONLY_METHODS` is an exported constant, not a comment, and the MCP server registers
its three acting tools only behind an environment variable.

Granting an agent permission to look at your screen and granting it permission to change
your screen are different decisions, and a person should be able to make them separately.
Encoding that split as data means a future permission prompt, audit log, or capability
token can be built on it without re-deriving which half is which from someone's memory.

The variable guard on the MCP tools is a smaller version of the same care: an MCP server is
configured once in a JSON file and then forgotten for a year, so the state that persists by
default should be the safe one.

## Why nothing injects input

The native addons can synthesize clicks and keystrokes. kando does it; the platform APIs
are right there. The protocol has no verb for it.

The reason is not squeamishness about automation. It is that meaningful consent for
injection is per-grant, not per-install: "this agent may click in this application, now,
for this task" is a different proposition from a checkbox ticked at setup. That machinery
does not exist yet. A protocol that grows the capability before the consent ships the
capability by accident, and then the consent has to be retrofitted around callers who
already depend on its absence.

Adding the verb later is easy. Removing it after four clients depend on it is not.

## Where this sits

Screen Angel is the layer, and it is application-agnostic — Microsoft Word counts. Soul
Angel is its first application, and the Sims 1 bridge is Soul Angel's. The ladder is not
the easiest possible landing; it is the one that proves the rest is reachable.

The game-specific parts live in modules the app loads. The module host polls the frontmost
window and asks each registered bridge whether it recognizes it, so there is no
game-specific code in the host at all. That is the test of whether the split is honest, and
it is checkable: `rg -i sims src/main/ -t ts` finds nothing in the app's TypeScript.

- [SCREEN-ANGEL.yml](../../SCREEN-ANGEL.yml) — the layer's design document, including the
  full prior-art lineage this file only gestures at.
- [PROTOCOL.yml](../../PROTOCOL.yml) — the wire format, and which parts are built.
- [modules/soul-angel/](../../modules/soul-angel/) — the first application of the layer.

---

## Part of MOOLLM

**This skill's directory (browse and fetch everything):** [apps/screen-angel/skills/screen-angel/](https://github.com/SimHacker/MicropolisCore/tree/main/apps/screen-angel/skills/screen-angel)

- **MOOLLM:** [repo](https://github.com/SimHacker/moollm) · **Skill index and docs:** [skills/README](https://github.com/SimHacker/moollm/blob/main/skills/README.md)

MIT.
