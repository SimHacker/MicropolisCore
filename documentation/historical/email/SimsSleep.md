# Sims Sleep System — Internal Email Threads
**July 1998 – January 1999 · Maxis**

Two related threads documenting the evolution of Sims 1 sleep tuning: the first (July 1998) captures
the initial implementation specs written for QA; the second (January 1999) captures a later proposal
to prevent autonomous waking at night.

---

## Thread 1 — Sleep Tuning & Sound Proximity: Feature Specs for QA
**July 1, 1998**

---

### 1. Request for Documentation

**From:** Kana Ryan
**Date:** Wednesday, July 1, 1998 · 9:38 AM
**To:** Jamie Doornbos
**CC:** Chris Trottier; Michelle Perry; Jim Mackraz; Will Wright; Sean Blair
**Subject:** Can you…

Give us a description of the following stuff you've done so that Chris, Michelle & Sean can test:

- Sleep tuning
- Sound proximity

Thanks mucho,
— Kana

---

### 2. Feature Specifications

**From:** Jamie Doornbos
**Date:** Wednesday, July 1, 1998 · 10:12 AM
**To:** Kana Ryan
**CC:** Chris Trottier; Michelle Perry; Jim Mackraz; Will Wright; Sean Blair
**Subject:** RE: Can you…

The sleep tuning is a combination of several things implemented to make sleeping work right.

#### Sleep tuning

- **Discrete awake/sleep split.** Before, it was a continuous alertness value. The ultra-speed-switcher
  has been changed to check this value, so we should no longer see the pop-into-ultra-speed while
  the person is still standing.

- **No alertness.** Alertness is no longer a real motive. Nothing advertises for it and it only means
  anything if the person is sleeping, and then it represents how well they are sleeping:
  - −100 = very deep sleep
  - −1 = unrestful sleep
  - \>0 = awake

- **Energy more important.** The control panel energy bar now is actually energy. The energy of the
  person now controls when they most need sleep:
  - At −100, the person should go autonomous (and hopefully find a bed).
  - Once a person is sleeping, the motive engine takes over, increasing energy gradually:
    - Expensive bed: ~10 hours to go from −100 to 100, at sleep level (alertness) of −50.
    - Couch: ~12 hours, at sleep level of −1.
  - When a person is awake, energy decreases gradually: 100 to −100 in about 20 hours.

#### Sound proximity

The sound proximity is an addition to the sound subsystem and to the object simulation that takes
into account locational factors to set the volume and pan of sounds emitted by the object. Factors
and intended effects:

- **Zoom attenuation.** Overall object volume attenuated by the zoom level of the house view.
  Maximum in large.
- **Pan.** Pan of sound linear with object's pixel location between left and right edge of house view.
  Left edge should have 0 right sound and vice versa.
- **Distance attenuation.** Volume of sound attenuates as the object moves off screen. Should be 0
  volume at 800 pixels from any edge of the screen, and "linear" in between.

— Jamie

---

## Thread 2 — Autonomous Night Waking: Proposal and Implementation
**January 13–15, 1999**

---

### 1. Proposal: Minor Change to Sleep

**From:** Jim Mackraz
**Date:** Wednesday, January 13, 1999 · 5:53 PM
**To:** Will Wright; Jamie Doornbos
**CC:** Patrick Barrett; Kana Ryan; Luc Barthelet
**Subject:** minor change to sleep proposed

Luc's having trouble getting his characters to sleep through the night… Too much caffeine, perhaps.
Or stress.

I have a proposed change; if Will wants to bless it, Jamie can you code it? It's a bit out of
Patrick's scope, and it would be nice for the Economic Game implementation.

#### Proposed modification

People don't wake up on their own if it's dark outside. More precisely, they don't wake up on their
own between two times we can tune, basically dusk and dawn. Once "dawn" arrives, they'll wake up if
they're rested, and stay asleep until rested if they need to. Player can still wake them up at any
time.

#### Desired effects

- If a person goes to sleep at night, they'll sleep at least through the night. They might sleep in,
  past "dawn," if they're "still tired." That way, if a person stays up late, the player has to rouse
  them (or buy an alarm clock) in order to get them to work, but if you get them to sleep at a
  "reasonable hour," you're relieved of that burden.
- If a person falls asleep midday, they'll wake up from their nap when rested.
- If they fall asleep just before dark, they'll probably sleep through the night.

#### Additional notes

- Most people will wake up automatically at "dawn," then, if Luc's experience with the tuning is
  typical. We could toss in a Zelda rooster sfx at "dawn" if we want.
- People would wake up simultaneously unless we inject a stochastic variable, but I like the idea of
  well-rested people all arising at the same time, with slackers sleeping in.
- We will have a much better shot at tuning people to go to bed autonomously at a reasonable time
  (this sort of clamps the drift, in one direction).
- I don't know the motive engine code, but it seems that whatever decides to wake them up could just
  check the time-of-day as one ez condition to accomplish this.
- Somebody pick good values for "dusk" and "dawn," please.

Jamie, if we get sign off, can you bump this to the top of your queue?

Thanks, all.
— Jim

---

### 2. Sign-off

**From:** Will Wright
**Date:** Thursday, January 14, 1999 · 11:57 AM
**To:** Jim Mackraz; Jamie Doornbos
**CC:** Patrick Barrett; Kana Ryan; Luc Barthelet
**Subject:** RE: minor change to sleep proposed

This sounds ok to me, should be simple to try any way. Let's give it a shot.

— Will

---

### 3. Implementation

**From:** Jamie Doornbos
**Date:** Friday, January 15, 1999 · 1:42 AM
**To:** Will Wright; Jim Mackraz
**CC:** Patrick Barrett; Kana Ryan; Luc Barthelet
**Subject:** RE: minor change to sleep proposed

Here's the new tree for "tweak sleep finished" in both of the beds.

#### Logic (both bed types)

1. **First node** — Check if the user woke the person up. This always prevails.
2. **Second node** — Keep them in bed if their energy is below 90. This can be tweaked.
3. **Third node** — Keep them in bed if it's still nighttime.

#### Sofas ("tweak nap finished")

Same as above, except the person will wake up when their energy hits zero in the daytime.

#### Additional tuning

- Changed napping to increase comfort up to a maximum of 40 for two hours, then start decreasing it
  until −100.
- Changed the motive contribution curve for energy:
  - There is still a very steep part between −100 and −90, with a 190-point rise in that range.
  - Added another 5-point rise between −90 and −60. That way, they will take naps without being dead
    tired.

— Jamie
