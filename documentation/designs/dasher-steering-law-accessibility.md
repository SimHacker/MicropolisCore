# Steering Law and Dasher

## Writing as navigating through the library of all possible books

**Primary sources:** David MacKay, [*Dasher: a data entry interface using continuous gestures and language models*](https://www.inference.org.uk/dasher/) and the [Google Tech Talk](https://www.youtube.com/watch?v=wpOxbesRNBc); Ada Majorek, CSUN Dasher demos ([qFlkM_e-sDg](https://www.youtube.com/watch?v=qFlkM_e-sDg), [LvHQ83pMLQQ](https://www.youtube.com/watch?v=LvHQ83pMLQQ), [SvsSrClBwPM](https://www.youtube.com/watch?v=SvsSrClBwPM)); Don Hopkins on Dasher, Ada, and D@sher — [HN 17105728](https://news.ycombinator.com/item?id=17105728) on [17098179](https://news.ycombinator.com/item?id=17098179); the dedicated comment on the [Palm history thread](https://news.ycombinator.com/item?id=12306377); Accot & Zhai, [*Beyond Fitts' law: models for trajectory-based HCI tasks*](https://dl.acm.org/doi/10.1145/258549.258760) (CHI 1997 — modern Steering Law formulation).

**Companion docs:** [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) · [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)

---

## Summary

**Fitts' Law** predicts how long it takes to *acquire* a target. **Steering Law** predicts how long it takes to *navigate through a constrained tunnel*. Most desktop interaction is Fitts plus a little Steering; high-bandwidth alternative input methods like [Dasher](https://www.inference.org.uk/dasher/) are Steering all the way down. Dasher (David MacKay et al., late 1990s) reframes text entry as continuously steering a cursor through a probability-shaped tunnel of letters — boxes are sized by their language-model likelihood and they nest, so frequent words become highways and unlikely sequences become alleys. With a head mouse and pre-training on a personal corpus, Ada Majorek (ALS, Google engineer) programmed in Dasher at speeds competitive with typing. The same shape — *predictive probability landscape that the user steers through* — is exactly what an LLM-aware programming UI should look like.

---

## At a glance

- **Fitts:** $T = a + b \log_2(D/W + 1)$. Acquire a target.
- **Steering:** $T = a + b \cdot D/W$ for a constant-width tunnel; integral form for variable width. Navigate a path.
- **Dasher:** zooming predictive text. Box sizes reflect language-model probabilities. Continuous correction without mode switch.
- **Don's measured speed:** ~10 wpm early; ~20 wpm after an hour; ~25 wpm expert with eye-tracking, near-zero errors.
- **Ada Majorek** revived Dasher 5 after years of GNOME-fork stagnation; uses head-mouse + Dasher to write code at Google.
- **D@sher**: a hierarchical radial-menu variant — pie menus *inside* Dasher's tunnel ([5oSfEM8XpH4](https://www.youtube.com/watch?v=5oSfEM8XpH4)).
- **2026 reframing:** LLM token distributions = Dasher's probability landscape. Steering through token tunnels with grammar/AST constraints is *programmer Dasher*.

---

## Fitts vs Steering

| Law | Question | Example |
|---|---|---|
| [Fitts](https://en.wikipedia.org/wiki/Fitts%27s_law) | How long to acquire a target? | Pie wedge selection; scrollbar handle click; button press |
| [Steering](https://en.wikipedia.org/wiki/Steering_law) | How long to navigate a constrained path? | Dasher zoom; cursor through nested menus; scribble inside a thin line; drag from menu through submenu |

Accot & Zhai's 1997 CHI paper formalised the law that Rashevsky (1959) and Drury (1971) had each independently derived. The intuition is *driving down a road of varying width*: the integral of velocity is bounded by the local width.

Don's Cairo-thread comment ([HN 32993307](https://news.ycombinator.com/item?id=32993307)) is the cleanest one-line bridge:

> Fitts' Law and Steering Law also apply to the forgiving pull-right submenu design that the original Apple Human Interface Guidelines described, which Tog invented, Apple forgot about (but finally rediscovered), and Amazon reinvented.

Pies cover Fitts cleanly. Dasher and submenu corridors and steering tasks cover the other side. Many interfaces silently mix the two and never label which is which.

---

## What Dasher actually is

David MacKay's pitch: writing is navigation through *the library of all possible books*. A box on screen represents the prefix of some text. Smaller nested boxes represent extensions of that prefix. The probabilities come from a language model trained on your previous writing plus a base corpus.

The user's job is to *steer toward the box they want*. Up/down controls which letter is next; left/right controls how fast you proceed. Dasher continuously zooms toward whatever the user is steering at, committing letters when boxes pass a threshold.

Concretely, from MacKay's [project page](https://www.inference.org.uk/dasher/) and Don's [17105728](https://news.ycombinator.com/item?id=17105728):

- Each letter is a box whose **height** is proportional to its language-model probability after the current prefix.
- Boxes contain sub-boxes for the next letter.
- "Cool" has a tall box; inside "Cool" the box for "ing" (cooling) is tall; for "kid" (no English continuation) it's tiny.
- The user steers vertically to pick a letter; lateral motion controls speed.
- **No discrete keystrokes.** No mode switch between *navigating* and *typing*. No backspace — moving back zooms out, *unwriting* the recent letters.

Buttons, eye-tracking, a head mouse, a single switch, breath — *any* signal that produces a continuous up/down value will drive Dasher.

The technical underpinning is **arithmetic coding** ([Cover & Thomas info theory](https://en.wikipedia.org/wiki/Arithmetic_coding)): writing is the *inverse* of compressing. The number of bits per character at the cursor equals the information rate of the input device. A user with a 25-words-per-minute steering signal and a tightly fitted language model is *exactly* converting their bandwidth into text.

Active fork as of 2026: [dasher.at](https://dasher.at/) (formerly dasher.acecentre.net) / [github.com/dasher-project/dasher](https://github.com/dasher-project/dasher). The GNOME fork at [github.com/GNOME/dasher](https://github.com/GNOME/dasher) is mostly stale.

---

## Performance, with numbers

Don's [HN 12306377](https://news.ycombinator.com/item?id=12306377) comment on Palm history, summarising his hands-on experience:

| Stage | Approximate wpm |
|---|---|
| Early practice | 10 |
| After ~1 hour | 20 |
| Expert with eye tracking | 25, with near-zero errors |

Per-character information rate matters more than the raw wpm. Dasher's *predictability* makes the input cheap on a slow signal: the user only needs to differentiate between the top few likely continuations, not all 26 letters. With a personal corpus, a Dasher user who has written about Sims save files will hit *Sims* in a few characters; a user who has written about Norway will hit *Norge*.

For comparison: a touch-screen QWERTY user can sustain ~20-30 wpm; a desktop typist 60+ wpm. Dasher is competitive with touch-screen typing and stays competitive when keyboards are not an option (paralysis, VR, gaze-only, breath-only).

---

## Ada Majorek and D@sher

Ada Majorek is a Google engineer with [ALS](https://en.wikipedia.org/wiki/Amyotrophic_lateral_sclerosis). She uses Dasher with a head-mouse to write email and *to program*. Her demos are the canonical answer to "but is Dasher really practical for technical work?"

| Resource | What's in it |
|---|---|
| [qFlkM_e-sDg](https://www.youtube.com/watch?v=qFlkM_e-sDg) | CSUN 2016 talk with Raquel Romano — Dasher 5 release, head-mouse setup, programming demo |
| [LvHQ83pMLQQ](https://www.youtube.com/watch?v=LvHQ83pMLQQ) | User testimonial — language switching for family vs work email |
| [SvsSrClBwPM](https://www.youtube.com/watch?v=SvsSrClBwPM) | CSUN Dasher introduction |
| [5oSfEM8XpH4](https://www.youtube.com/watch?v=5oSfEM8XpH4) | **D@sher** — hierarchical radial menu *inside* Dasher; pie menus and steering, merged |

Don's email exchange with Ada is summarised in [17105728](https://news.ycombinator.com/item?id=17105728). Ada wrote replies to Don *using Dasher and a head-mouse*. Don proposed JavaScript integration (the [aQuery](aquery-programmable-accessibility.md) angle) and Unity/VR ports; Ada noted that the JS idea was "interesting" and pointed Don at D@sher for the radial-menu variant.

D@sher itself, from Ada's link ([5oSfEM8XpH4](https://www.youtube.com/watch?v=5oSfEM8XpH4)), is *Dasher meets pie menus*:

> An adaptive, hierarchical radial menu. … a really neat way to "dive" through a menu hierarchy, or through recursively nested options (to build words, letter by letter, swiftly). D@sher takes Dasher, and gives it a twist, making slightly better use of screen revenue. It also "learns" your typical usage, making more frequently selected options larger than sibling options.

This is the bridge between [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) and steering: discrete verbs as wedges; continuous parameters as steering distance; both inside the same probability-shaped frame.

---

## Continuous correction beats Graffiti's discrete recognition

Don ([17105728](https://news.ycombinator.com/item?id=17105728)) explicitly contrasts Dasher with Palm Graffiti — the dominant pen-computing text-entry method of the era:

> One important property of Dasher is that you can pre-train it on a corpus of typical text, and dynamically train it while you use it. It learns the patterns of letters and words you use often, and those become bigger and bigger targets that string together so you can select them even more quickly!

Graffiti gives you one stroke per letter; if you draw a bad U it might commit as V; you fix it with a backspace gesture. Dasher gives you continuous motion through a tunnel; if you start steering toward the wrong letter, the cursor zooms a little that way and you correct without lifting. **Same insight as the [pie-menu reselection](gesture-space-and-pie-menus.md) story**: in-flight correction is cheaper than commit-then-undo.

Both are forms of *saturated* gesture space — every position in the input is mapped to *something*, and the user can browse before committing.

---

## VR, eye-tracking, breath: any continuous signal

Dasher's underlying assumption — *any* 1-2D continuous signal can drive text — turns out to be hugely useful:

- **Eye tracking** ([Tobii](https://www.tobii.com/), [Gaze](https://en.wikipedia.org/wiki/Eye_tracking)). The user looks; Dasher follows; rest the gaze on a stable region and the cursor settles.
- **Head mouse** ([SmartNav](https://www.naturalpoint.com/smartnav/), [HeadMouse Nano](https://www.orin.com/access/headmouse/)). Don's preferred Ada-style setup.
- **VR head pointing.** [xanxys' construct project](https://github.com/xanxys/construct) demoed Dasher in Oculus Rift — see [FFQgluUwV2U](https://www.youtube.com/watch?v=FFQgluUwV2U), cited in [17105728](https://news.ycombinator.com/item?id=17105728).
- **Single switch / breath.** Toggle direction with a single binary signal; Dasher is the only mainstream text method that works at all here.
- **Touchscreen drag.** Dasher works on phones; nobody ships it.

Each input modality is a different region of [four-dimensional-navigation-hci.md](four-dimensional-navigation-hci.md) — same motor-planning frame.

---

## Programmer Dasher with an LLM

The conceptual leap Don sketches in [17105728](https://news.ycombinator.com/item?id=17105728):

> Now think of what you could do with a version of dasher integrated with a programmer's IDE, that knew the syntax of the programming language you're using, as well as the names of all the variables and functions in scope, plus how often they're used!

The 2026 reformulation: Dasher's *language model* is now an LLM; the language-model probabilities are the LLM's token logits; the tunnel walls are AST constraints from the IDE; user-specific weighting comes from your own codebase.

| Layer | Role |
|---|---|
| **LLM / grammar** | Shape the probability landscape |
| **AST / type system** | Constrain tunnel walls to syntactically valid moves |
| **Dasher UI** | The user steers through the resulting tunnel |
| **Pie menus** | Mode switches, discrete verbs ([gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)) |
| **aQuery / Cua / IDE plugin** | Glue this into existing editors ([aquery-programmable-accessibility.md](aquery-programmable-accessibility.md), [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md)) |

Don's framing: *steering* the LLM, not *prompting* it. Continuous, reversible, visible. The reversed argument is that LLM autocomplete today is *commit-then-undo* — Tab to accept, Esc to dismiss, Backspace to fix. Dasher-style would be *steer-and-zoom* — drift toward the suggestion you want, zoom into it as it becomes more likely, never commit until the cursor passes the threshold.

[MOOLLM](moollm-microworld-os.md) makes this concrete in two places:

1. **Soul-file editing** — character `.yml` documents with structured fields and free-form memory blocks. A Dasher-shaped editor with the schema as tunnel walls and the character's previous text as the corpus would let a writer steer character voice without typing.
2. **Twitch writers'-room commands** — [§8a T.1](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) chat-driven intents. A streamer's audience emits noisy chat; Dasher-shaped consolidation could pick the *likely-intended* commands without forcing a discrete vote.

---

## What Micropolis takes from this

Two concrete things, plus a longer-term agenda.

### Phase 1F.12 Simplifier (now)

[Simplifier reborn](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) needs TTS narration for Sims 1 catalog items — Web Speech API plus MOOLLM `tts` skill, read on chat command or hover. This is the *accessibility audience* of the 2003 Simplifier: "kids learning to read, old farts with bad eyesight, snobby designers who hate Comic Sans" — see [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md). Dasher is not yet wired in; the surface it would attach to is the same catalog observer.

### Streaming overlay (parallel)

Twitch overlays in §8a need *legible-from-camera* text and predictable, slow-changing state ([classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md)). Same calm-technology rule; same Steering-Law frame for chat-as-writers'-room intent consolidation.

### Scope-aware token tunnel (later)

A Dasher-shaped input for MOOLLM chat commands. The grammar of the command bus is small and well-defined ([command-path-collaboration-modes.md](command-path-collaboration-modes.md)); the per-game corpus is the player's previous saves and chat; the resulting tunnel is tractable to demo well before "programmer Dasher" in general becomes tractable. *Domain-specific tunnels are easier than general ones*, which is exactly the same reason the 2003 Simplifier worked: the target was small enough to template-match.

---

## Pointers

| Topic | Where |
|---|---|
| Dasher project page (MacKay) | [inference.org.uk/dasher](https://www.inference.org.uk/dasher/) |
| Active maintained fork | [dasher-project/dasher](https://github.com/dasher-project/dasher) · [dasher.at](https://dasher.at/) |
| Original GNOME fork (mostly stale) | [github.com/GNOME/dasher](https://github.com/GNOME/dasher) |
| MacKay Google Tech Talk | [YouTube wpOxbesRNBc](https://www.youtube.com/watch?v=wpOxbesRNBc) |
| Ada Majorek demos | [CSUN 2016 (Raquel Romano)](https://www.youtube.com/watch?v=qFlkM_e-sDg) · [testimonial](https://www.youtube.com/watch?v=LvHQ83pMLQQ) · [intro](https://www.youtube.com/watch?v=SvsSrClBwPM) · [D@sher](https://www.youtube.com/watch?v=5oSfEM8XpH4) |
| Don's Dasher + aQuery + programmer-Dasher comment | [HN 17105728](https://news.ycombinator.com/item?id=17105728) on [17098179](https://news.ycombinator.com/item?id=17098179) |
| Don on Dasher vs Graffiti (Palm history) | [HN 12306377](https://news.ycombinator.com/item?id=12306377) thread |
| Accot & Zhai, Steering Law paper | ACM DL: `10.1145/258549.258760` — overview at [en.wikipedia.org/wiki/Steering_law](https://en.wikipedia.org/wiki/Steering_law) |
| Arithmetic coding (the underpinning) | [en.wikipedia.org/wiki/Arithmetic_coding](https://en.wikipedia.org/wiki/Arithmetic_coding) |
| Dasher in VR (Oculus Rift demo) | [github.com/xanxys/construct](https://github.com/xanxys/construct) · [FFQgluUwV2U](https://www.youtube.com/watch?v=FFQgluUwV2U) |
| Pies are the discrete-verb companion | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| AX + JS glue Don proposed for cross-app Dasher | [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) |
| Steering-style command bus | [command-path-collaboration-modes.md](command-path-collaboration-modes.md) |
| MOOLLM substrate | [moollm-microworld-os.md](moollm-microworld-os.md) |
