# Sims Sleep Behaviour — Internal Email Thread
**January 13–15, 1999 · Maxis**

---

## 1. Proposal: Minor Change to Sleep

**From:** Jim Mackraz
**Date:** Wednesday, January 13, 1999 · 5:53 PM
**To:** Will Wright; Jamie Doornbos
**CC:** Patrick Barrett; Kana Ryan; Luc Barthelet
**Subject:** minor change to sleep proposed

Luc's having trouble getting his characters to sleep through the
night… Too much caffeine, perhaps. Or stress.

I have a proposed change; if Will wants to bless it, Jamie can you code it? It's a bit
out of Patrick's scope, and it would be nice for the Economic Game implementation.

### Proposed modification

People don't wake up on their own if it's dark outside. More precisely, they don't wake
up on their own between two times we can tune, basically dusk and dawn. Once "dawn"
arrives, they'll wake up if they're rested, and stay asleep until rested if they need to.
Player can still wake them up at any time.

### Desired effects

- If a person goes to sleep at night, they'll sleep at least through the night. They
  might sleep in, past "dawn," if they're "still tired." That way, if a person stays up
  late, the player has to rouse them (or buy an alarm clock) in order to get them to
  work, but if you get them to sleep at a "reasonable hour," you're relieved of that
  burden.
- If a person falls asleep midday, they'll wake up from their nap when rested.
- If they fall asleep just before dark, they'll probably sleep through the night.

### Additional notes

- Most people will wake up automatically at "dawn," then, if Luc's experience with the
  tuning is typical. We could toss in a Zelda rooster sfx at "dawn" if we want.
- People would wake up simultaneously unless we inject a stochastic variable, but I
  like the idea of well-rested people all arising at the same time, with slackers
  sleeping in.
- We will have a much better shot at tuning people to go to bed autonomously at a
  reasonable time (this sort of clamps the drift, in one direction).
- I don't know the motive engine code, but it seems that whatever decides to wake
  them up could just check the time-of-day as one ez condition to accomplish this.
- Somebody pick good values for "dusk" and "dawn," please.

Jamie, if we get sign off, can you bump this to the top of your queue?

Thanks, all.
— Jim

---

## 2. Sign-off

**From:** Will Wright
**Date:** Thursday, January 14, 1999 · 11:57 AM
**To:** Jim Mackraz; Jamie Doornbos
**CC:** Patrick Barrett; Kana Ryan; Luc Barthelet
**Subject:** RE: minor change to sleep proposed

This sounds ok to me, should be simple to try any way. Let's give it a shot.

— Will

---

## 3. Implementation

**From:** Jamie Doornbos
**Date:** Friday, January 15, 1999 · 1:42 AM
**To:** Will Wright; Jim Mackraz
**CC:** Patrick Barrett; Kana Ryan; Luc Barthelet
**Subject:** RE: minor change to sleep proposed

Here's the new tree for "tweak sleep finished" in both of the beds.

### Logic (both bed types)

1. **First node** — Check if the user woke the person up. This always prevails.
2. **Second node** — Keep them in bed if their energy is below 90. This can be tweaked.
3. **Third node** — Keep them in bed if it's still nighttime.

### Sofas ("tweak nap finished")

Same as above, except the person will wake up when their energy hits zero in the
daytime.

### Additional tuning

- Changed napping to increase comfort up to a maximum of 40 for two hours, then start
  decreasing it until −100.
- Changed the motive contribution curve for energy:
  - There is still a very steep part between −100 and −90, with a 190-point rise in that
    range.
  - Added another 5-point rise between −90 and −60. That way, they will take naps
    without being dead tired.

— Jamie
