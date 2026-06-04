# Four-dimensional navigation

## (x, y, z, t) as the motor-planning frame for streams, replays, and animations that lie about state

**Primary sources:** Don Hopkins on Ron Reisman and 4D ATC — [HN 42874938](https://news.ycombinator.com/item?id=42874938) on the Black Hawk / DCA collision thread, Jan 2025; NASA Ames, [*4D Area Navigation System Description and Flight Test Results*](https://ntrs.nasa.gov/api/citations/19750022064/downloads/19750022064.pdf); NASA, [*Four-dimensional guidance algorithms*](https://ntrs.nasa.gov/citations/19750015477); Airbus, [*4D-TBO: a new approach to aircraft trajectory prediction*](https://www.airbus.com/en/newsroom/stories/2020-12-4d-tbo-a-new-approach-to-aircraft-trajectory-prediction); [Skybrary 4D trajectory concept](https://skybrary.aero/articles/4d-trajectory-concept).

**Companion docs:** [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md) · [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md) · [command-timeline-git-branches.md](command-timeline-git-branches.md)

---

## Summary

Pointing is two-dimensional; interaction is *three-dimensional* if you count velocity; properly engineered interaction is *four-dimensional* if you count **time as an explicit constraint**, not a side-effect. Air-traffic-control researchers at NASA Ames built **4D trajectory-based operations** (4D-TBO) on that idea in the 1970s — aircraft must arrive at a fix at a *scheduled time*, not merely pass through space. Ron Reisman described it to Don Hopkins as *"HCI that saves lives"*. The same framing — *position plus velocity plus explicit time as a first-class constraint* — is the right lens for replay, for stream-synchronised UI, and for diagnosing the failure mode where animation state and input state decouple at the millisecond level.

This is a short bridge document. It exists to give the longer essays a shared vocabulary for "the time dimension is missing from how most UIs reason about motion".

---

## At a glance

| Dimension | What it measures | UI example |
|---|---|---|
| 1D | Position along an axis | Slider value, scrollbar position |
| 2D | Position in a plane | Pointer location, Fitts target acquisition |
| 3D | Position + velocity profile | Pie-menu mouse-ahead, scroll inertia, trackpad gesture velocity |
| 4D | Position + velocity + **scheduled time** | Stream overlay sync, replay clock, ATC 4D-TBO, music-rhythm games |

The HCI insight: when an interface promises to do something *at a particular moment* — or when its perception of "now" diverges from the user's — you have left the Fitts/Steering world and entered the 4D-navigation world. The bugs there are different.

---

## What 4D navigation means in aviation

From Don's [HN 42874938](https://news.ycombinator.com/item?id=42874938) in the Jan 2025 DCA-collision thread (the trigger that put 4D-navigation in this corpus):

> Four Dimensional Navigation, actually! X, Y, Z, plus Time. By incorporating strict time constraints, air traffic controllers can schedule and merge arriving aircraft more precisely, reducing holding patterns and optimizing fuel usage.

The technical literature, from the NASA Ames 1975 report [*4D Area Navigation System Description and Flight Test Results*](https://ntrs.nasa.gov/api/citations/19750022064/downloads/19750022064.pdf):

> A 4D area navigation system was designed to guide aircraft along a prespecified flight path (reference path) such that the aircraft would arrive at the approach gate at a time specified by the ATC controller.

Four ingredients are required:

1. **Stored reference trajectories** — pre-computed reference paths.
2. **Continuously recomputed capture trajectories** — how to merge onto the reference, given current state.
3. **Electronic situation displays** — making 4D state legible to controllers and pilots.
4. **Control system** — autopilot/autothrottle integration to follow the trajectory *in space and time*.

The companion [*Four-dimensional guidance algorithms for aircraft in an air traffic control environment*](https://ntrs.nasa.gov/citations/19750015477) goes further:

> The third algorithm generates a feasible speed profile subject to constraints on the rate of change in speed, permissible speed ranges, and effects of wind. Flight path parameters are then combined into a chronological sequence to form the 4-D guidance vectors. These vectors can be used to drive the autopilot/autothrottle of the aircraft so that a 4-D flight path could be tracked completely automatically; or these vectors may be used to drive the flight director and other cockpit displays, thereby enabling the pilot to track a 4-D flight path manually.

A 4D system commits to *being at point P at time T*, not just *passing through P at some time*. That commitment is what lets controllers merge arrivals tightly — and what lets a streaming UI keep an overlay synchronised with a clock the audience sees.

The modern industrial term is **TBO** — Trajectory Based Operations — pursued by [SESAR](https://en.wikipedia.org/wiki/SESAR) in Europe and [NextGen](https://en.wikipedia.org/wiki/Next_Generation_Air_Transportation_System) in the US. Airbus's [4D-TBO writeup](https://www.airbus.com/en/newsroom/stories/2020-12-4d-tbo-a-new-approach-to-aircraft-trajectory-prediction) claims a 30-40% reduction in trajectory-prediction inaccuracy from adding the time dimension. Skybrary's [4D trajectory concept](https://skybrary.aero/articles/4d-trajectory-concept) page summarises:

> The 4D trajectory of an aircraft consists of the three spatial dimensions plus time as a fourth dimension. This means that any delay is in fact a distortion of the trajectory as much as a level change or a change of the horizontal position.

The framing transfers cleanly to UI: a momentum-scroll *continuing past finger lift* is a *temporal distortion* of the user's intended trajectory. The user committed to "arrive at this scroll position at time T-of-release"; the system substitutes "arrive at some position later, after extrapolating my velocity". That's a 4D-navigation bug, not a Fitts bug.

---

## Ron Reisman, NASA Ames

The phrase Don repeatedly uses — "HCI that saves lives" — is Ron Reisman's framing of ATC user interface work. From Don's writing (also in the [chat-transcript](chat-transcript.txt) at L5132):

> Mouse movement and gesture design is "three dimensional navigation" in the same sense that air traffic control involves "four dimensional navigation" (which I heard of from NASA AMES researcher Ron Reisman, who said he could bring a Cray to its knees calculating the envelope of velocity, longitude, latitude, and altitude over time to use the least amount of fuel and optimize time — and help optimize the work and attention of air traffic controllers — REAL IMPORTANT HCI THAT SAVES LIVES).

Two points worth keeping:

1. **The optimisation target is the controller's attention, not the geometry.** A 4D-TBO system that demands more cognitive load from controllers loses, even if it nominally saves fuel.
2. **The compute cost is enormous.** A 1970s Cray-1 *could not* solve the full envelope in real time. Modern hardware can. The 4D framing was waiting for compute.

That same waiting-for-compute story applies to UI: rich 4D state (animation + input + replay + stream clock + accessibility tree) is now tractable to model in real time. The reason it isn't done well most places isn't compute; it's the absence of a vocabulary for the problem.

---

## How HCI inherits the 4D frame

Three mappings.

### 1. Mouse motion already has three dimensions

Don's formulation:

1. **Spatial** — Fitts (distance, width). [pie-menus-fitts-law.md](pie-menus-fitts-law.md).
2. **Temporal** — velocity profile, momentum, dwell time. The "how fast and how long" of any gesture.
3. **Constraint** — Steering Law tunnels (submenus, [Dasher](dasher-steering-law-accessibility.md), scrollbar drags). The corridor walls.

Treating the temporal dimension as first-class — measuring it, displaying it, respecting the user's pace — is the difference between a snappy interface and a guess.

### 2. Explicit time-as-constraint = 4D

When the interface *commits to doing something at a specific moment*, you've left the 3D world.

- **Stream overlays** ([§8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful)) — must tick at the stream clock the audience sees, not at the streamer's local frame rate. The clock is the time constraint.
- **Replay** ([command-timeline-git-branches.md](command-timeline-git-branches.md)) — every command has a `t` stamp; rewinding requires reconstructing the temporal sequence, not just the final state.
- **Family Album scenes** ([family-album-as-storymaker.md](family-album-as-storymaker.md)) — narrative beats are timed; transitions are constrained by storyboard.
- **Rhythm UI** — music games, beatboxing, anything where you must hit a target *at* a time, not before or after.

Each of these is 4D-shaped. Each requires the renderer, the command bus, and the UI to *agree on the clock*. When they don't (animation says "done" while input still feeds the old layer), you get the [Mission Control / palm zoom / momentum scroll](classical-hci-vs-aesthetic-ui.md) failure family.

### 3. Failure mode: spurious velocity at release

The canonical 4D HCI bug is the trackpad's momentum-on-lift behaviour. The user moves their finger; they stop their finger; they lift. The system *extrapolates* velocity from the moments before lift and continues the trajectory.

In 4D terms: the user defined a trajectory $(x(t), y(t))$ that ends at $t_\text{release}$ with $\dot{x}, \dot{y} \neq 0$. The system substitutes a different trajectory that overshoots, then decays. The user's *committed* time-of-arrival at the target scroll position is replaced by the system's *guessed* later time.

This is structurally the same problem as the 4D-TBO trajectory-distortion-from-tactical-intervention that Skybrary describes. The ATC analogy: a controller vectoring an aircraft *adds* a time and position perturbation the airline never authored. Most ATC interventions don't model the full trajectory implication ("Tactical interventions by air traffic controllers rarely take into account the effect on the trajectory as a whole due to the relatively short look-ahead time"). UI inertial systems are even shorter-sighted.

Same disease, different domain.

---

## What Micropolis takes from this

Three concrete uses of the 4D frame in the federation:

1. **Command-bus timestamps.** Every replayable action ([command-timeline-git-branches.md](command-timeline-git-branches.md)) carries a wall-clock time *and* a logical position in the timeline. Branches diverge in *time and space* — Git-as-multiverse — and merging is a 4D problem, not a 3D one.

2. **Stream overlay sync (§8a).** [Twitch overlays](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) must commit to *being at state S at stream-clock T*. The overlay engine, the chat IRC client, and the renderer must agree on T; OBS scene transitions and bit-cheer events are 4D-scheduled. *No spurious velocity at release.*

3. **Family Album playback** ([family-album-as-storymaker.md](family-album-as-storymaker.md)). Scenes are nodes in a story DAG with timed transitions. Reading a Tornado-recovered family album book is *navigating in 4D space*: pages, scenes, timeline branches.

Cross-cutting rule: **stamp command-bus events with the stream clock when §8a overlay mode is on**, so that local replay and remote stream remain in sync. The renderer treats "now" as a piece of state the user can rewind, not as an implicit ambient quantity.

---

## Pointers

| Topic | Where |
|---|---|
| Don's HN comment on 4D-TBO (Jan 2025) | [news.ycombinator.com/item?id=42867195](https://news.ycombinator.com/item?id=42867195) |
| NASA Ames 1975, *4D Area Navigation System* | [ntrs.nasa.gov 19750022064](https://ntrs.nasa.gov/api/citations/19750022064/downloads/19750022064.pdf) |
| NASA, *4D guidance algorithms* | [ntrs.nasa.gov 19750015477](https://ntrs.nasa.gov/citations/19750015477) |
| Airbus, *4D-TBO* | [airbus.com](https://www.airbus.com/en/newsroom/stories/2020-12-4d-tbo-a-new-approach-to-aircraft-trajectory-prediction) |
| Skybrary, *4D trajectory concept* | [skybrary.aero/articles/4d-trajectory-concept](https://skybrary.aero/articles/4d-trajectory-concept) |
| SESAR (EU TBO programme) | [en.wikipedia.org/wiki/SESAR](https://en.wikipedia.org/wiki/SESAR) |
| NextGen (US TBO programme) | [en.wikipedia.org/wiki/Next_Generation_Air_Transportation_System](https://en.wikipedia.org/wiki/Next_Generation_Air_Transportation_System) |
| Fitts (the 1D/2D law that *isn't* enough here) | [pie-menus-fitts-law.md](pie-menus-fitts-law.md) |
| Steering (the 2D-with-walls law) | [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md) |
| Animation-vs-input decoupling (the 4D bug family) | [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md) |
| Replay / branching universes | [command-timeline-git-branches.md](command-timeline-git-branches.md) |
| Stories as molecules in 4D | [characters-as-hydrogen.md](characters-as-hydrogen.md) |
| Family Album scenes as timed nodes | [family-album-as-storymaker.md](family-album-as-storymaker.md) |
