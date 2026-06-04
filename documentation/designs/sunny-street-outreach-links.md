# For Sungman Cho — Sunny Street and the same problem from two directions

**Status:** Outreach / reading list (public)  
**Written for:** Sungman Cho, building **Sunny Street** — an open-world town for kids roughly 9–11  
**Also for:** Anyone curious why MicropolisCore and MOOLLM keep circling the same themes

**Repos:** [MicropolisCore](https://github.com/SimHacker/MicropolisCore) · [moollm](https://github.com/SimHacker/moollm)

---

## What Sunny Street is after — and why it matters beyond one project

Sunny Street is tackling something hard and specific: how to make a **readable simulation** for children, with **direct manipulation** they can trust, and an honest answer to **what the town should show versus what it should leave to imagination**. Sunny Street sits in the Sims lineage — neighbors, routines, social texture — but you are not trying to ship a black-box “the AI decided” experience. You want **legible rules**: memory and recognition that help kids understand *why* someone waved, remembered a gift, or acted shy, without turning the town into a chatbot wearing a face.

That framing is rare in 2026. Most “AI towns” optimize for viral clips: opaque agents, emergent drama, no inspectable state. You are asking the opposite — **narrow AI** in the service of **recognition** (who knows what, who noticed what), bounded so a nine-year-old can still feel they understand the world. Don’s work has lived in that neighborhood for forty years: microworlds, pie menus, The Sims’ advertised actions, SimCity as a toy you can break to learn, and now MOOLLM — where a character’s mind is a **folder you can open**, not a secret prompt.

Readers who are not you should still care: Sunny Street, MicropolisCore’s **Simopolis** vision, and MOOLLM are three answers to one design question — *how do you pair a real simulation runtime with an LLM layer that narrates and remembers without replacing the game?*

---

## Where our work overlaps yours

### 1. Legible simulation (rules you can read, not magic you cannot)

The Sims always encoded social possibility in **mechanics** (relationships, motives, objects that advertise what you can do). Stanford’s Generative Agents paper (2023) re-discovered that recipe with LLMs and opaque memory streams. MOOLLM’s bet is older and more literal: **if it matters, it is in a file**. Directories are rooms; characters are paths; memories and traits are YAML you can diff. That is the same ethic as teaching a child “the town has rules” instead of “the model felt like it.”

For Sunny Street, two labels from our lineage split the problem cleanly.

**Procedural rhetoric** (Bogost): the town argues through its rules. The Sims didn’t lecture about tolerance—it made discrimination impossible in the relationship model. Sunny Street’s design choice is which social possibilities you **encode on purpose**, not which moral you paste in a tooltip.

**Simulator Effect** (Wright): the shallow simulation runs on the machine; the deep one runs in the kid’s head. *Implication is richer than simulation.* Name a rule when a child needs to learn the protocol; leave it as felt consequence when a wave, a remembered gift, or a snub already carries the lesson—and don’t talk them out of the magic by over-explaining.

[Legible social dynamics](https://github.com/SimHacker/moollm/blob/main/designs/legible-social-dynamics.md) is our worksheet for the first half (rules that were always operating, now spelled in YAML). The second half is why you don’t render every inner monologue.

**Start here**

- [Procedural rhetoric index](https://github.com/SimHacker/moollm/blob/main/designs/indexes/PROCEDURAL-RHETORIC-INDEX.md) — rules as arguments; many voices, not averaged mush  
- [Simulator Effect (EVAL framework)](https://github.com/SimHacker/moollm/blob/main/designs/eval/EVAL-INCARNATE-FRAMEWORK.md#the-simulator-effect) — Wright, two computers, implication vs simulation  
- Skill: [simulator-effect](https://github.com/SimHacker/moollm/tree/main/skills/simulator-effect)  
- [MOOLLM manifesto](https://github.com/SimHacker/moollm/blob/main/designs/MOOLLM-MANIFESTO.md) — filesystem as world; inspectable state  
- [MOOLLM microworld OS](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/moollm-microworld-os.md) — character = directory, room = directory  
- [MOOLLM–Micropolis integration](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/moollm-micropolis-integration.md) — tutors, command bus, shared ground  

### 2. Narrow AI for memory and recognition (not a second simulator)

Your instinct to use AI for **memory and recognition**, not to re-run The Sims in a browser, matches what we call the **Imagine Loop**: the LLM **examines** parsed world state, **imagines** outcomes at the timescale you choose, **edits** high-level YAML, and **injects** back into a real runtime. The engine still ticks; the AI does not pretend to be the physics. For a kid-facing town, the parallel is sharp: the **game** handles moment-to-moment affordances; the **AI layer** handles “they remember your birthday” and “this NPC connects you to that quest” — but only if those memories live somewhere a curious player (or parent) could eventually inspect.

MOOLLM’s **memory palace**, **mind-mirror**, and **character** skills are the toolkit version of that split. The Sims design index maps motive systems and autonomy to file-based equivalents.

**Start here**

- [Character simulation index](https://github.com/SimHacker/moollm/blob/main/designs/indexes/CHARACTER-SIMULATION-INDEX.md) — Sims (1997) → Generative Agents → file-based memory  
- [Imagine Loop](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/the-imagine-loop.md) — LLM-as-narrator, not LLM-as-simulator  
- Skills: [character](https://github.com/SimHacker/moollm/tree/main/skills/character) · [memory-palace](https://github.com/SimHacker/moollm/tree/main/skills/memory-palace) · [mind-mirror](https://github.com/SimHacker/moollm/tree/main/skills/mind-mirror) · [incarnation](https://github.com/SimHacker/moollm/tree/main/skills/incarnation) · [representation-ethics](https://github.com/SimHacker/moollm/tree/main/skills/representation-ethics)  
- [Sims design index](https://github.com/SimHacker/moollm/blob/main/designs/sims/sims-design-index.md) · [Find-best-action / autonomy](https://github.com/SimHacker/moollm/blob/main/designs/sims/sims-find-best-action.md)  

### 3. Direct manipulation and what to show on screen

Readable simulation is also a **UI** problem. Pie menus, SimCity’s tool palette, and The Sims’ object **advertisements** all say: here is what you can do *right now*, in place, without hunting a linear menu. **PieCraft** extends that to players who design their own radials at runtime — UI literacy as gameplay. For a town aimed at 9–11, the Miyamoto/Wright complement still applies: design inward from the child’s face and hands; use the **Simulator Effect** — implication richer than simulation — so you do not render every inner thought when a glance and a consequence will do.

**Start here**

- [Piecraft (MicropolisCore)](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/piecraft/README.md) · [PIE-MENU-MODEL](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/piecraft/PIE-MENU-MODEL.md)  
- [SimCity tool palette](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/simcity-tool-palette-design.md) · [Virtual pointer and pie cursors](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/virtual-pointer-and-pie-cursors.md)  
- [Sims pie menus (moollm)](https://github.com/SimHacker/moollm/blob/main/designs/sims/sims-pie-menus.md)  
- [Designing inward (Miyamoto + Simulator Effect)](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/designing-inward-miyamoto-principles.md)  
- [Simulator Effect (EVAL framework)](https://github.com/SimHacker/moollm/blob/main/designs/eval/EVAL-INCARNATE-FRAMEWORK.md#the-simulator-effect) — same Wright thread, moollm repo  
- Skill: [advertisement](https://github.com/SimHacker/moollm/tree/main/skills/advertisement) — objects broadcast available actions  
- [Interaction design articles index](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/interaction-design-articles-index.md) — HCI corpus with primary sources  

### 4. Town scale, cozy lineage, and building on Sims without cloning

Sunny Street’s open world rhymes with **two-resolution** play: city map and street-level life (Will Wright’s 1996 dollhouse demo is the historical receipt). **Simopolis** is our umbrella doc for Micropolis + Sims under one federation; **characters-as-hydrogen** explains why people are the binding atom across scales. **OG cozy games** and **Tomodachi comparison** docs are useful when you are deciding what Nintendo-style towns hide versus what you want Sunny Street to make legible.

**Start here**

- [Simopolis](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/simopolis.md)  
- [Characters as hydrogen](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/characters-as-hydrogen.md)  
- [Will Wright microworlds 1996](https://github.com/SimHacker/moollm/blob/main/designs/sims/sims-will-wright-microworlds-1996.md)  
- [OG cozy games](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/og-cozy-games.md) · [Tomodachi life and Simopolis](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/tomodachi-life-and-simopolis.md)  
- [Constructionist index](https://github.com/SimHacker/moollm/blob/main/designs/indexes/CONSTRUCTIONIST-INDEX.md) — Papert → Wright → microworlds in schools  

### 5. Micropolis + MOOLLM as “town + tutors” (if you want a second substrate)

If Sunny Street ever wants a **city-scale** sibling or classroom mode: Micropolis (open SimCity) plus MOOLLM tutors is documented as Observe → Explain → Preview → Propose → Approve → Execute — humans and agents on common ground, not agents ghosting the UI.

- [MOOLLM–Micropolis integration](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/moollm-micropolis-integration.md)  
- [Filesystem object model](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/filesystem-object-model.md)  
- [Collaborative microworld lineage](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/collaborative-microworld-lineage.md)  
- Skill: [micropolis](https://github.com/SimHacker/moollm/tree/main/skills/micropolis)  

### 6. Proof the microworld pattern is real (not slideware)

- [examples/adventure-4](https://github.com/SimHacker/moollm/tree/main/examples/adventure-4) — 150+ file room-based world, characters, emergent play  
- Skills: [adventure](https://github.com/SimHacker/moollm/tree/main/skills/adventure) · [room](https://github.com/SimHacker/moollm/tree/main/skills/room) · [simulator-effect](https://github.com/SimHacker/moollm/tree/main/skills/simulator-effect)  

---

## Hubs (when you want to wander)

| Hub | URL |
|-----|-----|
| MOOLLM design indexes | [designs/indexes/INDEX.md](https://github.com/SimHacker/moollm/blob/main/designs/indexes/INDEX.md) |
| MOOLLM skills (129) | [skills/INDEX.md](https://github.com/SimHacker/moollm/blob/main/skills/INDEX.md) |
| MicropolisCore designs | [documentation/designs/README.md](https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/README.md) |

---

## Outside the repos (still on-point)

- [Designing user interfaces to simulation games](https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d) — Don Hopkins  
- [Will Wright, Stanford 1996](https://www.youtube.com/watch?v=nsxoZXaYJSk)  
- [Generative Agents (Park et al., 2023)](https://arxiv.org/abs/2304.03442) — compare to file-based memory in the character-simulation index  

---

## Email draft for Don (keep the message light)

Use this in the reply to Sungman; put the depth in this document, not the inbox.

---

Hi Sungman,

Readable simulation for kids, honest direct manipulation, AI scoped to memory and recognition—not another opaque “the model decided” town. That’s the line we’ve been on since SimCity and The Sims; MOOLLM and MicropolisCore are where it lives now.

- MOOLLM (microworld OS, characters as directories): https://github.com/SimHacker/moollm  
- MicropolisCore (open SimCity, Simopolis, pie menus, Sims bridge): https://github.com/SimHacker/MicropolisCore  

I wrote up how your questions line up with our docs (public; anyone can read it):

https://github.com/SimHacker/MicropolisCore/blob/main/documentation/designs/sunny-street-outreach-links.md

— Don

---

*This page is the canonical outreach doc for Sunny Street / Sungman Cho. Update when new design docs land.*
