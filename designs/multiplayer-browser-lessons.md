# Lessons from Multiplayer Browsers

## Source Context

This note distills lessons from Alejandro's "Get Your Reps" retrospective about Sail and Muddy, plus the Hacker News discussion around it, and applies them to MicropolisHub.

Sail and Muddy were attempts to build a multiplayer browser: live websites on an infinite canvas, then chat plus embedded browser tabs. The architecture was impressive, but adoption did not follow.

The lesson for Micropolis is not "don't build ambitious interfaces." The lesson is: multiplayer needs a clear shared activity with visible stakes.

## What Sail and Muddy Built

Sail:

- Chromium fork.
- Infinite canvas.
- Live websites as cards.
- Text cards.
- Multiplayer cursors.
- The pitch: "FigJam/Miro with a browser built in."

Muddy:

- Chat as the surviving surface.
- Embedded real browser tabs inside chat.
- The pitch: "Slack and a browser as an integrated work environment."

The technical work was real:

- Real browser tabs, not iframes.
- Process isolation and auth compatibility.
- DOM mutation streaming instead of video streaming.
- Shared sync engine.
- Rich text, canvases, chat, and cross-form experiments.

But users often perceived the product as "web embeds in another app."

## Key Blog Lessons

### A Thesis Is Not a Product

"The browser will become the platform for realtime collaboration" is a thesis. It is not a specific user need.

Micropolis implication:

Do not say "Micropolis is multiplayer constructionist education" and stop there. Define concrete activities:

- Propose a nuclear plant.
- Debate a tax increase.
- Compare two traffic plans.
- Write a newspaper story about a disaster.
- Branch a city timeline and bring evidence back.

### Positioning Needs a Legible Anchor

Sail became "Miro with websites." Muddy became "better Slack." The grand vision collapsed into a simple comparison.

Micropolis has a stronger anchor:

- "Open source SimCity as a collaborative classroom."
- "A city you can build, branch, debate, and explain."
- "SimCity plus GitHub-as-MMORPG plus AI tutors."

That anchor is more concrete than "future of collaboration."

### Technical Depth Is Not Perceived Value

Sail's real browser tabs mattered architecturally, but many users saw embeds.

Micropolis implication:

Do not expect users to care that the engine is C++/WASM, that commands are data objects, or that Git branches are elegant. They care about what they can do:

- See consequences.
- Explain decisions.
- Recover from mistakes.
- Compare alternatives.
- Share artifacts.

Architecture must surface as felt capability.

### Dogfooding Is Not Market Proof

Sail/Muddy worked internally because the team understood the concepts they invented.

Micropolis implication:

Internal use by developers and AI agents is useful for polish, but not enough. Test with:

- Students.
- Teachers.
- City planning enthusiasts.
- SimCity fans.
- People who want to write stories about systems.
- People who want to use AI tutors to understand cause and effect.

### Multiplayer Alone Is Weak

The post's graveyard includes Google Wave, Tandem, Screenhero, Multi, Loop, Safari Shared Tab Groups, and many "better Slack" products.

The pattern: people often value autonomy and simplicity more than always-on collaboration.

Micropolis implication:

Multiplayer should be optional, meaningful, and activity-bound.

Players should not have to be "always together." Instead:

- Work alone on a branch.
- Bring evidence back to the group.
- Ask for votes on consequential actions.
- Publish a city snapshot.
- Let others replay or fork it.

## Hacker News Discussion Lessons

### "Small in the Mind"

A commenter asked whether Sail/Muddy were technically complex but felt small to users. Alejandro agreed: the perceived divergence was not large enough.

Micropolis implication:

Make the step change obvious. "Another map view" is small. "Replay a city's alternate history and compare the consequences of two tax policies" is big.

### The Browser Gets Out of the Way

Another commenter noted that users experience the browser mostly as what it accesses, not as the product itself. A browser change competes with the entire internet for mindshare.

Micropolis implication:

Micropolis should not compete as generic workspace chrome. It should use its city, history, and social decisions as the organizing object. The workspace exists because the city needs multiple views, not because "tabs are cool."

### Collaboration Has Seasons

One commenter said power users love canvas and multiplayer during distinct phases, but outside those phases the features become overhead.

Micropolis implication:

Design for phases:

- Solo exploration.
- Proposal.
- Debate.
- Vote.
- Execution.
- Reflection.
- Branch comparison.
- Publication.

The UI should reconfigure around the phase instead of forcing all tools to be present all the time.

### Save and Share May Beat Live Multiplayer

Another commenter said they would use a 2D canvas browser but did not need live multiplayer; saving and sharing state might be enough.

Micropolis implication:

Branchable saved city state may be more important than real-time presence. Git, replay logs, and shareable snapshots are core, not secondary.

## Why SimCityNet Is the Better Multiplayer Model

Don Hopkins' X11/TCL/Tk SimCityNet was cooperative rather than competitive. That matters.

It did not just add cursors. It added governance:

- Shared budget.
- Shared consequences.
- Chat.
- Multiple views.
- Voting for expensive decisions.
- Social accountability.

This is closer to what the multiplayer browser products lacked: a civic object with stakes.

## Design Principle: Multiplayer Needs a Civic Object

For Micropolis, the civic object is the city.

It has:

- Scarce resources.
- Visible territory.
- Conflicting goals.
- Delayed consequences.
- Public decisions.
- Private experiments.
- Stories worth telling.

This gives collaboration a reason to exist.

## Product Tests for MicropolisHub

Adapt the blog's landing-page and launch-video tests:

### Landing Page Test

Can we explain in one screen:

- Who uses it?
- What do they build?
- What do they learn?
- Why together?
- Why now?

Possible phrasing:

> Build a city together. Branch its history. Debate decisions. Let AI tutors help you understand why it grows or fails.

### Sandwich Video Test

Can we show scenes?

1. A student proposes an airport.
2. The airport hovers over the map as a ghost.
3. Other players inspect traffic, budget, pollution, and land value overlays.
4. An AI urban planner and economist disagree.
5. The class votes.
6. The city runs forward.
7. A private branch tests an alternative.
8. Students compare outcomes and publish a newspaper article.

If we can show that clearly, the product is legible.

## Actionable Requirements

1. Every meaningful multiplayer action should have a visible object: proposal, branch, note, message, vote, command, or article.
2. Every command should be previewable where possible.
3. Every expensive/risky command should be proposable before executable.
4. Every proposal should have a map location when applicable.
5. Every branch should have a story: why it exists, what changed, what happened.
6. Chat should be connected to views and history, not just text.
7. AI tutors should be able to disagree and explain tradeoffs, not just recommend.
8. Solo and multiplayer should be continuous: private branch -> public proposal -> shared execution.
9. The UI should support task phases through presets, not a monolithic cockpit.
10. The system should make artifacts worth sharing outside the live session.

## Anti-Patterns to Avoid

- Multiplayer as presence-only.
- Canvas as generic dumping ground.
- Browser/workspace framing without a concrete activity.
- Internal dogfooding as proof.
- Over-polishing chrome before proving the workflow.
- Making architectural distinctions users cannot feel.
- Forcing live collaboration when saved branches would do.

## Micropolis Advantage

Micropolis starts with something Sail/Muddy had to invent: a meaningful shared world.

The city gives users a reason to collaborate. The challenge is to build the command, history, UI, and AI layers so collaboration becomes legible, reversible, and educational.

In one line:

> Don't build "multiplayer." Build a world where shared decisions matter.
