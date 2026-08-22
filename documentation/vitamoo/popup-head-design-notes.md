# The popup pie-menu head — design notes

*A literary reading of a late-1990s UI module: what it does, what it almost did, and what the
fossils reveal about how it was built. No code here — for porting numbers see
[ui-overlay-encyclopedia.md §2–3](./ui-overlay-encyclopedia.md); for the modern foveation
reading see
[Fitts and foveation (WWSFF)](https://github.com/SimHacker/WillWrightShowForFood/blob/main/characters/david-ungar/fitts-and-foveation.md).*

---

## 1. The problem being solved

A pie menu is radial geometry laid over a living scene. The player has just pointed at a person.
The menu must answer three questions at once: *who* am I acting on, *what* can I do, and *where*
am I looking? The usual solution — icons in a ring — treats the character as an object among
objects. The popup head inverts that: the character **is** the hub. Their **head-bone attachments**
— face, hat, glasses, whatever is rigged there — occupy the hole in the donut, turn toward the
highlighted slice like a square in the Brady Bunch title grid, and the scene behind them dims as
if someone lowered the houselights for a close-up.

This is not ornament. It is a **binding** between the abstract menu and the embodied Sim. Every
other design choice in the module serves that binding: scale, shimmer, lean toward the cursor,
brightening on selection, the circular twilight under the chin.

---

## 2. Perceptual engineering as methodology

Throughout the source, the same phrase recurs — *tweaked to look good* — sometimes twice in
the same routine. That is not laziness. It is an honest account of a methodology that predates
instrumentation: the spec was a human eye, the test harness was a CRT, the regression suite was
"does Will flinch." Magic numbers (four hundred milliseconds to grow, four hundred to turn,
fourteen pixels of vertical nudge, a global scale multiplier of one-point-seven-five, a shadow
radius of one hundred pixels) are not derived constants; they are **sediment**. Each one marks
an afternoon where something was almost right and then one divisor or offset was nudged until it
stopped twitching and started *reading*.

The shimmer is the clearest confession. Each frame, tiny random nod and shake components are
injected — on the order of a third of a degree — so the head does not look like a postage stamp
pasted on glass. The comment beside it says plainly: make it noticeable. Twenty years later,
David Ungar would explain the mechanism (peripheral motion as a foveation summons); the author
had already spent the animation budget on the center before hearing the vocabulary. That is
design luck married to design intent.

---

## 3. Eight directions without a neck rig

Full skeletal head animation for a transient menu would have been expensive and fragile. The
compromise is elegant: treat **selection index** as a compass rose with eight buckets (cardinal
and diagonal), and express each bucket as fixed nod and shake **deltas** added to the wiggle and
cursor lean. Cardinals get a stronger tilt than diagonals — the comments preserve the rejected
alternative (slightly wider deltas were tried and backed off).

When the highlighted slice changes, the head does not snap; it **eases** over four hundred
milliseconds, blending from the previous nod and shake toward the new target. The easing is
not linear: the parameter is remapped so motion starts gently and slows near the end (a square
root on a biased linear ramp). Someone cared that the turn feel human, not robotic.

Separately, the head **leans** toward the pointer: offset magnitude grows with the square root
of cursor distance from center. That is Fitts-adjacent intuition — the hand's vector becomes
the face's vector — without invoking the law by name.

---

## 4. Combinatorics of slice count

Pie menus are not always octagonal in practice. The head logic special-cases small menus so the
geometry still reads:

- One or two items collapse to a single facing.
- Two items multiply the selection index (spacing slices around the ring).
- Three and four items double it.
- Five through seven pass through unchanged.
- **More than seven** — the general case — abandons per-slice facing and alternates: even
  selections look up (slice zero), odd selections look down (slice four). That is a graceful
  degradation: beyond octal symmetry, don't pretend precision; give a binary "this way / that
  way" cue.

This table is evidence of **iterative encounter with real menus**, not a one-shot geometric
fantasy.

---

## 5. Grow, glow, and the rejected cartoon

Opening the menu animates scale and vertical offset linearly over four hundred milliseconds.
Buried in a disabled block is a more exuberant idea: **overshoot** — grow past full size, then
settle back, triangle-wave or fancier. The comment is enthusiastic ("cartoony over grow and
shrink back!") but the live path stays linear. Someone ran the experiment, liked the idea in
principle, and shipped the quiet version. Preprocessor-off preservation (`#if 0`) is version
control before Git: reversible deletion, feature held in amber.

Selection also drives **light**: ambient-only lighting for this draw, dimmer when nothing is
chosen, brighter the instant a slice is active. The head literally glows when you commit
attention. That is feedback through illumination, not through a separate widget.

---

## 6. The attitude pipeline — almost an editorial voice

A parallel subsystem was sketched: **attitude**, a scalar updated from interaction scores, with
plateau and power curves so small signals don't jitter and large ones don't saturate instantly.
Positive attitude was to drive a periodic **nod**; negative attitude a **shake** — the Sim
editorializing about the hover, nodding yes and shaking no at seven hundred milliseconds per
cycle. The tuning note beside it — should be tweaked to look good, **not yet used** — is a
fossil of a feature that reached the "we know what it should feel like" stage and never reached
"we trust it in a demo."

`Nod()` and duration constants exist; duration zero means disabled in the shipped tuning.
`SetAttitude()` survived with a telltale opening comment: **keyboard cheat for demos**, before
interaction scores and attitude factors were adjusted — hold Shift to approve, Control to
disapprove. The emotion system had a **backdoor** before it had emotions. That is classic
production archaeology: ship the stage, wire the real inputs later, leave the cheat for E3.

Further disabled blocks show attitude goals being ramped during turn transitions — then
commented out mid-expression (`sttitudeGoal` typo and all). The variable names outlive the
behavior.

---

## 7. Every mesh on the head bone — hats, glasses, and the arrow gag

The comment says it draws *the current person's head*; the implementation is more literal than
that. It walks **every dressing** on the skeleton, skips only **censor bounding meshes** (type
one in the suit taxonomy), and for each remaining dressing draws **every mesh bound to the
canonical HEAD bone**. Whatever is rigged to that bone at this moment — base head, current hat,
glasses, horns, party favors — rides into the menu center with the same camera-facing transform,
the same shimmer, the same slice-driven nod and shake.

There is no separate "face only" pass. The popup hub is a **snapshot of head-bone attachments**,
not a portrait crop. That is the right default for a character game: the player recognizes *their*
Sim, accessories and all. It is also the source of occasional comedy: content rigged through the
skull for world view (the classic **arrow-through-head** sight gag — shaft and fletching bound
to HEAD along with everything else) appears dead center in the pie, spinning its little compass
looks with the hat. The selection-marker arrow above the lot (`head-arrow` suit, separate code
path) is a different asset; the gag here is **accessory accumulation** — the menu does not
curate, it **mirrors**.

Pie-menu head and censorship overlay remain **different compositing contracts** (type-one bboxes
skipped; real textured geometry kept). The encyclopedia (§5) treats censor exclusion as a
first-class porting rule for the same reason.

---

## 8. The shadow twin

The head is only half the effect. A sibling pass — circular, depth-aware — rewrites scene
pixels behind the overlay plane into low-contrast gray: channel average halved, plus a small
floor lift, full strength in the inner two-thirds of the radius, feathered blend in the outer
third using squared distance as the weight. Motivation in the author's memory: the colorful head
should **pop** like a thought bubble or Donnie Darko reverie, not like a Zardoz giant materializing
in the living room. Foveation hygiene was accidental; **plane separation** was deliberate.

The shadow center **tracks** submenu recenters: when the pie spawns a nested ring, the twilight
disk slides to the new hub while the outer menu frame may still own the original popup. Grow
timings match the head so the vignette and face arrive together.

---

## 9. Local deform, world restore — and the blink

The head mesh is deformed in **bone-local** space for this draw, then restored to world
deformation so the rest of the sim doesn't inherit the menu pose. Comments record an ongoing
skirmish: at simulation speed zero, with the menu head up, the face **blinks** — restore order
and optional skeleton pose application were debated; one fix was tried and annotated as not
helping. That is bug report as marginalia, valuable to anyone porting to a modern retained-mode
renderer.

Depth for the head uses a midpoint in the overlay Z band — annotated as a wild guess. Honest
depth guessing for screen-locked 3D UI is its own tradition.

---

## 10. What shipped vs what stayed in the drawer

| Shipped | Held back or experimental |
|--------|---------------------------|
| Live head mesh at menu center | Cartoony grow overshoot |
| Eight-way facing via nod/shake deltas | Attitude-driven periodic nod/shake |
| Shimmer (micro-random motion) | Full interaction-score attitude |
| Cursor-distance lean | |
| Turn easing on selection change | |
| Ambient brighten on selection | |
| Submenu shadow tracking | |
| All HEAD-bound meshes (hats, accessories) | Face-only or accessory filter |
| Censor-suit exclusion | |
| Demo keyboard attitude cheat | (intended temporary) |

The module is small — on the order of six hundred lines — but **dense with decisions**. Nothing
is abstracted into a framework; everything is tuned for one widget in one game. That is why it
reads like bakelite: molded for a purpose, polished by hand, carrying inclusions of features
that almost lived.

---

## 11. Reading it today

For **reimplementation**, treat the encyclopedia as the invariant sheet and this essay as the
*rationale* sheet: why shimmer exists, why slice count matters, why the shadow is not merely
decorative dimming.

For **design literacy**, the head is a case study in **authored center motion** — motion that
assumes the eye starts at the click point and sends attention along the selection vector — paired
with **quiet periphery** (static desaturation, no collapsing-slice fireworks). The Unity pie-menu
demo a decade later replayed the same role with a webcam texture; the Sims version used the Sim's
actual rig. The interface pattern outlived the engine.

For **history**, the file header names an author and a studio; the comments name intentions more
 reliably than any design document written afterward. We wrote some of this down years later
 because the fossils were still legible.

---

## Further reading

- [UI overlay encyclopedia §2–3](./ui-overlay-encyclopedia.md) — formulas and verification
- [Fitts and foveation](https://github.com/SimHacker/WillWrightShowForFood/blob/main/characters/david-ungar/fitts-and-foveation.md) — shimmer, shadow, Brady Bunch, Zardoz
- [Unity3D Pie Menu Demo (2012)](https://www.youtube.com/watch?v=sMN1LQ7qx9g) — label-to-cursor and center head at 1:37
- [VitaBoy animation docs — Popup Head Support](https://github.com/SimHacker/WillWrightShowForFood/blob/main/characters/will-wright/sources/2004-02-05-vitaboy-character-animation-docs/article.md) — API surface (`StartPopupHead`, `NodPopupHead`, …)
