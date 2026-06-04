# Saturating gesture space

## Why pie menus cover the universe of finger trajectories with meaning — and stroke recognisers fill it with syntax errors

**Primary sources:** Don Hopkins, [*Gesture Space*](https://donhopkins.medium.com/gesture-space-842e3cdc7102) (Medium); [HN 39228342](https://news.ycombinator.com/item?id=39228342) on [39206966](https://news.ycombinator.com/item?id=39206966) (the long Kando comment); Bill Buxton, [*PieMenus.html*](https://www.billbuxton.com/PieMenus.html), [*MMUserLearn.html*](https://www.billbuxton.com/MMUserLearn.html); Ben Shneiderman on [direct manipulation](https://en.wikipedia.org/wiki/Direct_manipulation_interface); [Principle of Least Astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment).

**Companion docs:** [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) · [pie-menu-patent-fud.md](pie-menu-patent-fud.md) · [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) · [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) · [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) (pointer lock, label-to-cursor, no menu-warp) · [piecraft/README.md](piecraft/README.md) (PieCraft, PIE-MENU-MODEL) · [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md) (HN 2014 car UI — blind gestures vs saturated pies)

---

## Summary

The space of every possible gesture between pointer-down, motion, and pointer-up is huge — and most gesture interfaces leave almost all of it as *useless syntax errors*. Palm Graffiti recognised a small trained set; the space between any two characters was a no-man's-land where the recogniser shrugged or guessed wrong. Pie menus do the opposite: every direction at release commits to *some* visible wedge. There is no "between u and v" region. There is no recogniser black box. There is no path-dependence — only the angle between the two points the user explicitly defined. This document is the gesture-space framing, the *Principle of Least Astonishment* argument that comes with it, and the design rules that follow when you start treating gestures as a *covered* space rather than a *sparse* one.

---

## At a glance

- **Gesture space** = the set of all (pointer-down → optional path → pointer-up) trajectories, including multi-touch as parallel single-touch spaces.
- **Saturated** = every region of the space has a defined meaning; **sparse** = most regions are syntax errors.
- Pies *select by angle at release*, not by path. Browsing, previewing, and cancelling are one mechanic.
- Wedge targets should extend to the screen edges — the [Speed Racer button tutorial](https://www.youtube.com/watch?v=9AjJd5xE3b0&t=2s) is the limiting case.
- Self-revealing wedges train the *same* motor pattern that experts later use without labels.
- This is the [direct manipulation](https://en.wikipedia.org/wiki/Direct_manipulation_interface) argument, applied to popup commands.

---

## Definition

From Don's [*Gesture Space*](https://donhopkins.medium.com/gesture-space-842e3cdc7102):

> The space of all possible gestures, between touching the screen / pressing the button, moving along an arbitrary path (or not, in the case of a tap), and lifting your finger / releasing the button. It gets a lot more complex with multi-touch gestures, but it's the same basic idea, just multiple gestures in parallel.

The space has three coordinates per stroke: *where you pressed*, *the path you moved*, and *where you released*. Multi-touch is several such spaces evolving in parallel.

A *gesture vocabulary* maps regions of this space to commands. Good vocabularies have three properties:

1. **Coverage** — every region maps to *some* meaning. No syntax-error zones.
2. **Self-revealing** — the user can see the meaning *before committing* (before releasing).
3. **In-flight correction** — the user can change their mind mid-gesture without lifting and starting over.

Pie menus achieve all three by reducing the relevant space to *one number*: the angle of the line from press to release. Pen-based stroke recognisers achieve almost none of them.

---

## Pies select by *angle at release*, not path

This is the design decision that makes everything else work. From [HN 39228342](https://news.ycombinator.com/item?id=39228342) (the long comment on Kando):

> I think it's important to trigger pie menus on a mouse click (and control them by the instantaneous direction between clicks, but NOT the path taken, in order to allow re-selection and browsing), and to center them on the exact position of the mouse click.

Consequences:

- **Browsing.** Move around the menu; the highlighted wedge updates by direction. You haven't committed to anything yet.
- **Preview.** While you hover, tracking callbacks can preview the reversible effect of the currently-selected item — including using *distance from centre* as a parameter (volume, brightness, slider value). You can use pie menus as scrubbers without ever popping them up.
- **Cancel.** Return to the centre. There's a dead zone around the click point that means *nothing*.
- **Reselection.** Cross from one wedge to another and the selection updates. Same input loop; no separate undo path.

Don's [direct-manipulation analogy](https://en.wikipedia.org/wiki/Direct_manipulation_interface) from the same comment:

> Those ideals also apply to pie menus. Pie menus should strive to provide as much direct feedback as possible, via tracking callbacks, previewing the reversible effect of the currently selected item (possibly even using the distance as a parameter), so you can easily use them without ever popping up the menu.

Shneiderman's three direct-manipulation rules — *continuous representation of objects of interest; rapid, reversible, and incremental actions; visible feedback* — fall out of the same design.

---

## Saturation vs stroke recognition

The 2000-era pen-computing world ([Palm Graffiti](https://en.wikipedia.org/wiki/Graffiti_(Palm_OS)), Tablet PC, [StrokePlus](https://www.strokesplus.net/)) is the case study in *unsaturated* gesture space. Don's diagnosis ([39228342](https://news.ycombinator.com/item?id=39228342)):

> But with a gesture / handwriting recognition system, you wonder where is the dividing line between "u" and "v"? The neural net (or whatever) is a black box to the user (and even the programmer). Some gestures are too close together. And most gestures are useless syntax errors. And there's no way to cancel or change a gesture once you've started. And there's no way to learn the possible gestures.

| Approach | What's a valid gesture? | What happens off-vocabulary? | Can you change your mind? |
|---|---|---|---|
| Graffiti / stroke recognisers | Small trained alphabet | Wrong character, or nothing | Lift and retry |
| Linear menus + hover hacks | Click on the right line | Submenu vanishes (or doesn't) | Move pointer, hope the [`<` corridor](submenu-aiming-and-fitts-law.md) catches you |
| **Pie menu** | Every angle from the centre | *There is no off-vocabulary* — the centre is "cancel" | Cross wedges or return to centre |
| Free-form sketch | Often nothing matches | Wrong command, or no-op | Sometimes |

The pie's defining property is **there is no syntax error**. Every direction is a wedge; the wedge in the centre is "cancel". If you move at all from the press point, you have unambiguously committed to *one* direction. The system's interpretation is always exactly what the geometry says, and the geometry is visible.

Same argument, Don summarising:

> But with pie menus, if you make a mistake or it doesn't behave like you expect, you can at least see and understand what went wrong (you were on the wrong side of the line) and change it (move back into the slice you meant to select). No fuzzy gray area or no-man's-land or magic hand waving. And the further out you move, the more "leverage" and precision you have.

---

## Target sizes that extend to the screen edges

The wedge geometry has a non-obvious consequence: target *area* grows with radius from the centre, but target *angular tolerance* also grows. This is the strongest Fitts win in pies, and it's defeated when implementations crop the wedge at the label's bounding box.

From [39228342](https://news.ycombinator.com/item?id=39228342):

> The area and shape of each item target area should not be limited or defined by the font height and the width of the longest label. It should be maximized, not limited, to encompass the entire screen, all the way out to the edges, like the slices of a pie menu. If you move far enough, it's practically impossible to make a mistake, as the target gets wider and wider, so you can even use pie menus during an earthquake or car chase.
>
> Speed Racer - Button Tutorial: [https://www.youtube.com/watch?v=9AjJd5xE3b0](https://www.youtube.com/watch?v=9AjJd5xE3b0)

The Speed Racer tutorial is the gold standard joke: you flick a single direction with low motor precision, the wedge eats the entire screen quadrant, and the command commits. *That* is what pie menus are for. Targeting an 8-pixel-tall menu item from across a 4K monitor is what they're not for.

---

## Self-revealing wedges; rehearsal

Bill Buxton's [marking-menu](https://www.billbuxton.com/PieMenus.html) research makes the same point from a different angle: visible wedges *train* the same motor pattern experts later use without reading.

The training arc:

1. **Novice** — press, wait, read labels, choose, release. The popup pops.
2. **Intermediate** — press, start moving toward the wedge they've used before, *see the popup confirm it's the right one*, continue, release.
3. **Expert** — press and release in one flick. The popup never has time to draw. The motor pattern is the same as in step 2; only the latency budget changed.

There is no transition shock: the "command line" of a pie menu is the same gesture the menu taught you. Buxton calls this *the gulf between novice and expert collapsing*. Don calls it *mouse-ahead by rehearsal*. Same effect, two vocabularies.

This is missing from stroke recognisers (you never see the "decision boundary" between gestures), from invisible swipes (no popup ever appears), and from keyboard shortcuts (the shortcut is unrelated to the menu position you used to learn it).

---

## Number of items per ring matters

From a different part of the [chat transcript](chat-transcript.txt) (also in Don's Medium writing): the *number* of items in a ring controls how learnable the ring is.

| Items | Mental framework available |
|---|---|
| 2 | Opposite |
| 4 | N/S/E/W; horizontal/vertical axes |
| 8 | Compass framework — N, NE, E, SE, S, SW, W, NW; opposite pairs; diagonals |
| 12 | Clock-dial framework |
| 16 | Compass + half-cardinals |
| Odd numbers, e.g. 7 | *No* shared mental framework for all-but-one direction |

> With 7 items, there is no common English word or concept for all but one of the directions. But with 8 items, you benefit from the compass framework, opposite pairs, orthogonal axis, vertical, horizontal or diagonal patterns to use as a framework for arranging the items. And with 12 items, you benefit from the clock dial framework, as well as pairs, orthogonal and diagonal patterns, etc.

Practical Sims-1-style rule: 4 or 8 wedges per ring; nest if you need more. Avoid odd-numbered rings except as a deliberate alarm signal.

---

## Multi-touch is parallel gesture space — and inherits the same rules

Multi-touch UIs *should* be several independent saturated gesture spaces — one per finger. In practice they're often a small grab-bag of recognised pinches and swipes (zoom, scroll, four-finger-swipe-app-switch), with no consistent semantics and no preview. The same critique Don applies to Graffiti applies to most "trackpad gestures": tiny trained vocabulary, big invalid space, no in-flight reselection, no self-revelation, recogniser is a black box.

[classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md) documents specific macOS regressions (palm contact zoom, momentum on lift, partial Mission Control activation) that turn the trackpad into a *worst-of-both* surface: large valid gesture space, nearly all of it unmapped or surprisingly mapped.

---

## Touch constraints

Touch makes the wedge layout *easier* (no menu-bar-edge issues; pop up under the finger) but introduces three new constraints:

- **Finger occlusion.** The label cannot be where the finger is — put it on the outer rim, opposite the direction of motion, or use a head-up display.
- **No screen-edge Fitts trick.** A finger-centred popup doesn't benefit from screen edges. You make this back by making wedges enormous.
- **Long-press timing.** If long-press is the trigger, the user is already mid-gesture by the time the popup appears. The popup must not cause the menu to jump or steal selection state — same *no astonishment* rule as desktop.

The Unity demo at [YouTube sMN1LQ7qx9g](https://www.youtube.com/watch?v=sMN1LQ7qx9g) shows verb-rings around Sims with per-item *"why disabled"* explanations — the touch-friendly form factor with first-class explanation text.

---

## What Micropolis takes from this

Pie menus are the federation's primary command surface — verb rings around Sims, tool rings in city mode, command rings everywhere. The gesture-space framing dictates how they're built:

1. **Saturated.** Every direction commits to a wedge; the centre cancels; nothing in between is undefined.
2. **Self-revealing.** Wedges pop after a short delay; experts skip the pop-up by mousing ahead.
3. **Previews on tracking callbacks.** Hovered wedges preview their reversible effect (city tool overlays, Sim verb outcomes, [sims-content-registry.md](sims-content-registry.md) entry summaries).
4. **Why-disabled text in the wedge itself**, not in a separate dialog — the [Sims-Online style explanation surface](sims-content-registry.md) belongs *here*.
5. **No radial+linear overflow** — see [pie-menu-patent-fud.md](pie-menu-patent-fud.md). Nest if you need more items.
6. **8-item compass default**, 4 for terse menus, 12 for time/calendar-shaped data. Avoid odd N.
7. **Touch path-of-least-astonishment** — labels off-finger, large wedges, no surprise gestures.

Implementation in [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md); command-bus integration in [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) and [command-path-collaboration-modes.md](command-path-collaboration-modes.md).

---

## Pointers

| Topic | Where |
|---|---|
| Don's *Gesture Space* essay | [donhopkins.medium.com/gesture-space-842e3cdc7102](https://donhopkins.medium.com/gesture-space-842e3cdc7102) |
| The long Kando comment with the full argument | [HN 39228342](https://news.ycombinator.com/item?id=39228342) on [39206966](https://news.ycombinator.com/item?id=39206966) |
| Buxton on pie menus and rehearsal | [billbuxton.com/PieMenus.html](https://www.billbuxton.com/PieMenus.html) · [MMUserLearn.html](https://www.billbuxton.com/MMUserLearn.html) |
| Direct manipulation (Shneiderman) | [en.wikipedia.org/wiki/Direct_manipulation_interface](https://en.wikipedia.org/wiki/Direct_manipulation_interface) |
| Principle of Least Astonishment | [en.wikipedia.org/wiki/Principle_of_least_astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment) |
| Speed Racer button tutorial (the "earthquake" target) | [YouTube 9AjJd5xE3b0](https://www.youtube.com/watch?v=9AjJd5xE3b0&t=2s) |
| Unity SimCity pies + why-disabled text | [YouTube sMN1LQ7qx9g](https://www.youtube.com/watch?v=sMN1LQ7qx9g) |
| Why pies are faster, with the 1988 numbers | [pie-menus-fitts-law.md](pie-menus-fitts-law.md) |
| Why linear submenus need invisible corridors | [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) |
| Federation pie shell spec | [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) |
| Extension / OS overlay API gap | [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) |
| Kando desktop reference impl | [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) |
| Steering inside a probability tunnel (Dasher) | [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md) |
| Virtual pointer, pie edge policy, tile autoscroll | [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) |
| Nine-slice tool cursor / chrome | [ui-frame-nine-slice.md](ui-frame-nine-slice.md) |
| Holodeck layer stack | [unified-webgpu-renderer.md](unified-webgpu-renderer.md) |
| SimCity palette layout (totem pole, cost→size, MP legend) | [simcity-tool-palette-design.md](simcity-tool-palette-design.md) |
| Car multitouch vs self-revealing pies (HN 7328476) | [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md) |
| macOS Pie Menu app, rehearsal argument (HN 41160268) | [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) |
