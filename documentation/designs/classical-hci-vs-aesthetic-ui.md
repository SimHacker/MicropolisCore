# Calm technology was never an excuse to hide state

## Classical Mac HCI was about visible state and reversible action; the aesthetic-minimalist UI era misread Weiser and Atkinson and lost both

**Primary sources:** Mark Weiser & John Seely Brown, *Calm Technology* (1996) — overview at [en.wikipedia.org/wiki/Calm_technology](https://en.wikipedia.org/wiki/Calm_technology); Mark Weiser, [*The Computer for the 21st Century*](https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf), Scientific American 1991; Ben Shneiderman, [*Direct manipulation*](https://en.wikipedia.org/wiki/Direct_manipulation_interface); Bruce Tognazzini, [Ask Tog Fitts column](https://www.asktog.com/columns/022DesignedToGiveFitts.html) and [*First Principles of Interaction Design*](https://asktog.com/atc/principles-of-interaction-design/); Jef Raskin, [*The Humane Interface*](https://en.wikipedia.org/wiki/The_Humane_Interface) (2000); Don Hopkins on macOS regressions — [HN 11219792](https://news.ycombinator.com/item?id=11219792), [HN 32961306](https://news.ycombinator.com/item?id=32961306) (Cairo / lost web ergonomics).

**Companion docs:** [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) · [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [four-dimensional-navigation-hci.md](four-dimensional-navigation-hci.md) · [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md)

---

## Summary

The Macintosh's 1980s interaction design — Atkinson, Tesler, Tognazzini, Raskin, in conversation with Shneiderman's HCIL and Weiser's calm-technology project — was built around five committed values: **visible state**, **modeless action where possible**, **immediate feedback**, **reversibility**, and **discoverability**. The aesthetic-minimalist UI era that followed (Ive/Dye-era Apple, but the pattern is industry-wide) often kept the *vocabulary* of those values while sacrificing the *substance*: hide the scrollbar; infer the gesture; merge animation with input state; ship beautiful screenshots. Weiser's *calm* meant **less interruption while leaving the user in command**, not **less intelligibility**. This document names the substitution, lists the specific macOS regressions that motivated this corpus of writing, and points at the Sims and Simopolis features that *must not repeat them*.

---

## At a glance

| Classical Mac / HCIL / Weiser | Aesthetic-minimalist substitution |
|---|---|
| Visible state | State implied by animation; lost when the animation finishes |
| Modeless where possible | Hidden gesture modes (multi-finger swipes, edge-pulls, hold-and-drag) |
| Immediate feedback | Cinematic transitions; "looks done" before it *is* done |
| Reversibility | Momentum on lift; spurious velocity at release |
| Discoverability | Screenshot first, learnability later |
| Predictability | Inference from incomplete signal (palm zoom, accidental Mission Control) |
| Less interruption | Less *legibility* |

The five values on the left are not nostalgia. They are how you ship software that survives streaming, accessibility, multi-monitor, and twenty-year-old users finally trying out The Sims. The values on the right are how you ship software that screenshots well in Q3.

---

## The classical lineage

Five sources, in conversation throughout the 1980s and 90s:

- **Bruce "Tog" Tognazzini** — Apple Human Interface Group employee #66. The 1987 [*Apple Human Interface Guidelines*](https://archive.org/details/applehumaninterf00appl) and the *Ask Tog* columns are the most direct artefacts. [*First Principles*](https://asktog.com/atc/principles-of-interaction-design/) is the modern restatement.
- **Bill Atkinson and Larry Tesler** — Lisa and Mac architects; QuickDraw, MacPaint, Cut/Copy/Paste, [*"don't mode me in"*](https://en.wikipedia.org/wiki/Larry_Tesler).
- **Jef Raskin** — early Mac project lead; later wrote [*The Humane Interface*](https://en.wikipedia.org/wiki/The_Humane_Interface) (2000) and built [Archy/THE](https://en.wikipedia.org/wiki/Archy) to demonstrate modeless commands.
- **Ben Shneiderman** — University of Maryland HCIL; coined [*Direct Manipulation*](https://en.wikipedia.org/wiki/Direct_manipulation_interface), shipped [HyperTIES](https://en.wikipedia.org/wiki/HyperTIES) where pie menus first appeared.
- **Mark Weiser** — Xerox PARC; [*The Computer for the 21st Century*](https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf) (1991), *Designing Calm Technology* (1996, with John Seely Brown — see [Wikipedia summary](https://en.wikipedia.org/wiki/Calm_technology)). Ubiquitous computing as *unobtrusive* not *invisible*.

The shared substrate: the computer is a *tool*, the user is in command, the interface must make the computer's state legible and the user's actions reversible. *Calm* in Weiser's vocabulary means "doesn't demand the user's attention when it doesn't need it", not "hides itself from the user when they need it".

---

## Shneiderman's direct manipulation, in one paragraph

From the [Wikipedia summary](https://en.wikipedia.org/wiki/Direct_manipulation_interface) (which paraphrases Shneiderman's *Designing the User Interface* and his 1983 *Direct Manipulation: A Step Beyond Programming Languages*):

> Direct manipulation is an approach to interfaces which involves continuous representation of objects of interest together with rapid, reversible, and incremental actions and feedback. As opposed to other interaction styles, for example, the command language, the intention of direct manipulation is to allow a user to manipulate objects presented to them, using actions that correspond at least loosely to manipulation of physical objects.

Operational consequences:

1. **Continuous representation** — the object you're acting on is on screen the whole time. Not just at the start and at the end.
2. **Rapid actions** — under ~100 ms feedback budget.
3. **Reversible actions** — undo at every step. (See [command-timeline-git-branches.md](command-timeline-git-branches.md) for the federation-scale generalisation.)
4. **Incremental actions** — small composable steps, not "configure this then commit".
5. **Visible feedback** — the *result* is visible immediately, not implied by an animation that will commit when it finishes.

This is the contract pies and the [1987 submenu corridor](submenu-aiming-and-fitts-law.md) both honour. It is the contract many modern macOS gestures violate.

---

## Weiser: calm, not invisible

[*The Computer for the 21st Century*](https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf) opens with the phrase that gets misquoted forever:

> The most profound technologies are those that disappear. They weave themselves into the fabric of everyday life until they are indistinguishable from it.

The misreading: *therefore, hide the chrome*. The actual claim is much narrower:

- Profound technologies (writing, the electric motor, eyeglasses) become "invisible" in the sense that **the user stops thinking about them as separate from their task**.
- They do *not* become invisible in the sense that **the user cannot tell what they're doing or how to operate them**.
- The point is to *reduce the user's cognitive load*, not the *interface's surface area*.

| Weiser-style calm | Aesthetic-minimalist substitution |
|---|---|
| Less interruption; user stays empowered | Controls hidden for visual purity |
| Predictable machinery in the periphery | State implicit in animation; ambiguous to the foreground |
| Sensors and ambient indicators that the user can choose to attend | Notifications that demand attention and disappear before being read |
| *"The computer for the 21st century"* — many small devices | One big screen with hidden modes |

Stream overlays in [§8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) are a Weiser-style design: persistent ambient information for the audience, *not* surprise pop-ups for the streamer. Calm for the player; legible for the audience.

---

## Specific macOS regressions the corpus documents

These aren't aesthetic preferences; they're concrete violations of the direct-manipulation contract that have caused real user pain. Each maps to one of the symptoms above.

### 1. Mission Control partial activation

Trigger the four-finger swipe-up. The animation begins; you see windows shrink and tile. You move the pointer to a window to click it. Sometimes the input is captured by the animation layer instead of the window; sometimes you've half-cancelled out and your click goes through to the desktop; sometimes the system thinks you're still in Mission Control after the animation finished. The user has no way to tell what mode they're in because **the animation state and the input state have decoupled**.

This is the failure mode the [Cua Driver](cua-computer-use-agents-and-simplifier.md) tries to work around with `SLEventPostToPid`: *the cursor warps because the input system disagrees with what's on screen*.

### 2. Accessibility zoom / phantom palm zoom

A palm or wrist touching the trackpad during typing. macOS interprets it as a two-finger gesture. The view zooms. The user is now zoomed in on text they were trying to write. This is *unpredictable mode entry from an incomplete signal* — exactly what Raskin's "don't mode me in" warned against. The mode boundary is invisible (no zoom-mode HUD) and the way out is invisible (try gestures until one works).

### 3. Trackpad momentum on lift

The user scrolls and stops with their finger still on the pad. They lift the finger. **Velocity continues** for tens to hundreds of milliseconds because the scrolling subsystem extrapolates from finger speed at release. The user's intent — *stop scrolling exactly here* — is overridden by the system's guess.

This is the [4D navigation](four-dimensional-navigation-hci.md) failure mode: the system optimises a path through space *plus time* using a model the user did not author. They watch the page glide past their target and curse.

### 4. Hidden scrollbars

The classical bar showed *position*, *page extent*, *content length* — three pieces of state — at a constant visual cost. The auto-hiding bar hides all three until you scroll, at which point it appears for a few hundred milliseconds and vanishes again. Now position is *inferred* from how much you've scrolled (which is the thing you wanted to know). Content length is unknowable without trying to scroll.

This is *visible state* swapped for *visual purity*. Don's [HN 11219792](https://news.ycombinator.com/item?id=11219792) thread has the longer rant; it's the same logic that hid the menu bar on the iPad for a decade.

### 5. Separator items that dismiss menus

Menu separators are visual dividers; they should not be selectable. Some macOS menus close the menu when you hover the separator — a "feature" that turns Fitts wins into Fitts traps. The user is *more* likely to hover a separator on the way to the item below than to hover the item above, because elbows move in arcs ([submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md)).

### 6. Dock pushed off the corners

The Mac dock used to be a Fitts-edge-magnet: items at the bottom edge have *infinite* vertical hitbox. Centring the dock and adding margins around the icons means the dock items have finite hitboxes on all sides. You can miss them by moving too fast or too far.

### 7. Resize cursor stealing scrollbar clicks

When the scrollbar overlay is narrow and lives near the window's resize corner, the system can interpret a click on the scrollbar as a resize. The scrollbar clicks become unreliable; the user retrains themselves to click slightly inboard, in an undocumented dead zone.

---

## The pattern is *decoupling*

Every entry in the list above is the same shape: **animation state and input state decouple**. The animation says one thing ("scrolling has stopped"); the input layer believes another ("velocity is 87 px/s"). The popup looks dismissed; the focus state says otherwise. The Mission Control transition finished; the input is still going to the compositor.

The classical contract was *what you see is what the system will do next*. The aesthetic-minimalist contract is *what you see is the prettiest snapshot we could draw*. The first contract is *operationally honest*; the second is *visually compelling and operationally lying*.

This matters for accessibility (screen readers report state, not animations), for streaming (the audience watches the animation; the streamer feels the input lag), and for testing (Cua-Bench shows agents trained on Windows 11 screenshots fail on Windows XP because the animations differ but the underlying app is the same — [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md)).

---

## What Simopolis takes from this

The federation runs Wasm UI on top of GPL Micropolis, beside the EA-published Sims 1. Every regression above is one we *cannot* repeat in our own UI, because:

- **Streamers will be watching us live.** A hidden gesture is a confused chat. A momentum scroll is a building placed where the streamer didn't want it. ([§8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful))
- **Accessibility is a first-class audience.** Low-vision users navigating by [Dasher](dasher-steering-law-accessibility.md) cannot afford animation-state-vs-input-state ambiguity.
- **Replay is the substrate.** [command-timeline-git-branches.md](command-timeline-git-branches.md) requires that *every* user action is a discrete, named, replayable event. Spurious velocity at release is unrepresentable in that model.
- **The Wasm renderer is auditable.** Component specs document the state-and-input contract; we want to prove the animation finished *and* the input layer agrees.

Specific design rules that come out of this:

| Rule | Where |
|---|---|
| No spurious velocity at release | Pointer event handlers in the renderer |
| Animations cannot capture input | Wasm UI layer separates `is-rendering` from `is-active-mode` |
| Hidden state is documented | Every gesture has a HUD/legend; stream overlays show it visibly |
| Reversibility at every step | Command bus, [command-path-collaboration-modes.md](command-path-collaboration-modes.md) |
| Cozy schema, not chrome | Inclusion rules live in [og-cozy-games.md](og-cozy-games.md) data, not surprise UI |
| Stream legibility | Overlays designed for OBS browser sources, not the streamer's monitor |

[designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) is the design-craft companion document. The Miyamoto/Nintendo vs current EA parallel is the *commercial* version of this Tog-Apple vs Ive-Apple contrast: same studio, same trademark, different priorities decades apart.

---

## Pointers

| Topic | Where |
|---|---|
| Weiser & Brown, *Designing Calm Technology* (1996) | [Wikipedia overview](https://en.wikipedia.org/wiki/Calm_technology) |
| Weiser, *The Computer for the 21st Century* (Sci Am, 1991) | [LRI PDF](https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf) |
| Shneiderman, direct manipulation | [Wikipedia](https://en.wikipedia.org/wiki/Direct_manipulation_interface) |
| Tognazzini, *First Principles of Interaction Design* | [asktog.com](https://asktog.com/atc/principles-of-interaction-design/) |
| Tognazzini, Fitts quiz | [asktog.com columns](https://www.asktog.com/columns/022DesignedToGiveFitts.html) |
| Apple HIG, 1987 (PDF) | [archive.org](https://archive.org/details/applehumaninterf00appl) |
| Raskin, *The Humane Interface* | [Wikipedia](https://en.wikipedia.org/wiki/The_Humane_Interface) |
| Don on macOS scrollbar / dock / menu regressions | [HN 11219792](https://news.ycombinator.com/item?id=11219792) |
| Cairo desktop thread: lost web ergonomics | [HN 32961306](https://news.ycombinator.com/item?id=32961306) on [32959397](https://news.ycombinator.com/item?id=32959397) |
| Fitts geometry in detail | [pie-menus-fitts-law.md](pie-menus-fitts-law.md) |
| Submenu corridor (the canonical lost-but-rediscovered example) | [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) |
| 4D motor failure mode | [four-dimensional-navigation-hci.md](four-dimensional-navigation-hci.md) |
| Miyamoto vs current EA — the commercial twin of this argument | [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) |
| Inclusion in schema, not overlay | [og-cozy-games.md](og-cozy-games.md) |
