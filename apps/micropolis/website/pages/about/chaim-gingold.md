---
title: Chaim Gingold
header: "Chaim Gingold: Building SimCity"
description: 📖️ Dive into insights from "**Building SimCity**," Chaim's book detailing the game's creation, alongside his revealing **reverse-engineered diagrams**.
---

## SimCity Reverse Engineering Analysis

**Chaim Gingold's** **reverse engineering** analysis represents a remarkable achievement in understanding and visualizing the complex architecture of [**Will Wright's**](/pages/about/will-wright) original **SimCity**. His work sits at the intersection of three innovative approaches to understanding complex systems:

1.  [**Stone Librande's**](/pages/about/stone-librande) [**One-Page Designs**](/pages/about/stone-librande#revolutionary-documentation-approach) (2010) - A revolutionary approach to game design documentation where complex systems are distilled into single, densely informative pages that capture both high-level architecture and critical details.

2.  [**Bret Victor's**](/pages/about/brett-victor) [**Interactive Visualization**](/pages/about/brett-victor#revolutionary-approach-to-interface-design) (2013) - From his "**Media for Thinking the Unthinkable**" work at **MIT Media Lab**, Victor demonstrates how dynamic, interactive visualizations can make complex systems tangible and manipulable.

3.  **Bruno Latour's** **Visual Cognition** (1986) - Theoretical foundation for how visualization serves as a cognitive tool, helping us understand complex systems by making them visually manipulable.

Gingold's work brilliantly synthesizes these approaches, creating diagrams that are both analytical (revealing **SimCity's** architecture) and generative (providing a foundation for understanding and extending the system).

## Connection to Will Wright and SimCity

Chaim's work provides invaluable context for understanding [**Will Wright's**](/pages/about/will-wright) design philosophy. By **reverse-engineering** **SimCity's** **simulation loops** and **data structures**, Chaim revealed the elegant architecture underlying the game's **emergent complexity**.

> "Looking at the design diagrams created by **Chaim Gingold**, we can appreciate just how elegantly structured **Will's** simulation designs were." — Quote from the [**Will Wright** page](/pages/about/will-wright#the-anatomy-of-simulation-games).

Chaim's [**diagrams**](/pages/reverse-diagrams), derived from his deep analysis, make the simulation's inner workings visible, much like the diagrams pioneered by [**Stone Librande**](/pages/about/stone-librande) at **Maxis**.

> "**Chaim's** diagrams...make the simulation's inner workings visible, much like the diagrams pioneered by **Stone Librande** at **Maxis**." — Derived from connections made on the [**Stone Librande** page](/pages/about/stone-librande#influence-and-connections).

## Building SimCity: How to Put the World in a Machine

Chaim's magnum opus book, "[**Building SimCity: How to Put the World in a Machine**](/pages/building-simcity)" (**MIT Press**, 2024), is the culmination of years of research, including his time working with [**Will Wright**](/pages/about/will-wright) at **Maxis** on [**Spore**](/pages/about/will-wright) and the **Spore Creature Creator**. As someone who's lived through much of the history documented in the book and who provided Chaim with source code and documentation to analyze, I ([**Don Hopkins**](/pages/about/don-hopkins)) can confidently say this is the most comprehensive, insightful exploration of **SimCity** ever written. It's an essential read for anyone interested in simulation, game design, or the history of computing. While it possesses a deep academic tone stemming from its roots in his **PhD dissertation** ("[**Play Design**](https://pqdtopen.proquest.com/doc/304817380.html?FMT=AI)"), its appeal extends far beyond academia, offering invaluable insights for aspiring game developers and programmers.

What makes this book so special isn't just that it documents the technical underpinnings of **SimCity** (though it does that brilliantly, offering an in-depth analysis of the simulator code), but that it puts the game in its proper context - not just as a piece of software, but as a constellation of ideas about **cities**, **simulations**, and **play**. It serves as an excellent companion to the work presented here, which focuses more on the user interface implementation details less covered in the book.

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the **mental model** in the player's head." — [**Will Wright**](/pages/about/will-wright#the-anatomy-of-simulation-games)

Chaim's analysis reveals how **SimCity's** architecture elegantly supports this goal of building **mental models**—showing how the technical choices Will made were ultimately in service of creating an accessible, explorable simulation that could teach complex concepts through play.

As a recent review by **Computer Gaming Yesterday** notes:

> "The author **Chaim Gingold** really knows what he's talking about... he worked on **Spore**, he worked with **Will Wright** himself so he has a lot of at least very close secondhand knowledge about **SimCity** and how it was developed, and he was able to talk to **Will Wright** himself to get his opinion... there is a lot of stuff in here that I've never heard of before, never seen published before, new information, and even information that is not necessarily new like how the game works is explained in a lot of detail and formatted in a way I've never seen before."

The book has received rave reviews, including this glowing endorsement from **Stewart Brand** (founder of the **Whole Earth Catalog** and **The WELL**):

> "Brief book report: BUILDING SIM CITY: How to Put the World in a Machine, by **Chaim Gingold**, is an exhilarating read. It is one of the best origin stories ever told and the best account I've seen of how innovation actually occurs in computerdom."

Brand, who is very particular about accuracy and detail, further notes:

> "Of course I checked the few moments where I intersected with the events in the story. They are tone-perfect, detail-perfect, and context-perfect. More so than I've ever seen before. I trust this book. It tells revelatory truth."

And of particular relevance to this document, Brand specifically praised the diagrams:

> "The exhaustively-researched illustrations are brilliant, and shockingly well printed in color--you can read them in depth."

Those illustrations - especially the [**Reverse Diagrams**](/pages/reverse-diagrams) included as an Appendix in the book - are what I'm most excited about bringing to life in the [**WebAssembly**](/pages/don-hopkins#current-work) version of [**Micropolis**](/pages/micropolis-license). Chaim has kindly given me permission and encouragement to implement interactive versions of his **reverse diagrams**, which will dovetail perfectly with my implementation of the [**Dynamic Zone Finder**](/pages/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder) (also known as the Frob-O-Matic, inspired by [**Ben Shneiderman's**](/pages/about/ben-shneiderman) [**Dynamic Home Finder**](/pages/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder)). We plan to build these advanced interactive visualizations using modern web technologies like [**SvelteKit runes**](https://svelte.dev/blog/runes), [**WebGL**](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API), and [**Canvas**](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) visualizations.

> "I just kind of optimized for game play." — [**Will Wright**](/pages/about/will-wright#reverse-over-engineering)

This simple statement from Will captures why Chaim's **reverse engineering** work is so valuable—it reveals how deceptively sophisticated the simulation architecture is beneath its accessible surface. What appears to be a simple toy-like city simulator is actually a carefully crafted system with elegant solutions to complex computational problems. Highly recommended reading for anyone wanting to understand **SimCity's** magic!

## Live, Tweakable Diagrams (Future Work)

We are extending Chaim's static diagrams into live, tweakable interfaces that embody [**Brett Victor's**](/pages/about/brett-victor) principles of explorable explanations: immediate feedback, visible state, and manipulable parameters. With Chaim's explicit permission and encouragement, our goals include:

- Make each diagram (Simulation Loop, Map Data Flow, Maps, Map Scan, Make Traffic) interactive: step, pause, and scrub time; reveal underlying values; and annotate causal paths.
- Allow safe parameter tweaking (e.g., smoothing kernels, path search depth, weighting factors) with instant visual feedback to teach cause/effect.
- Link diagrams to running city views (Cards/Stacks) so selections highlight corresponding tiles, overlays, and messages.
- Provide shareable presets and "reset to canonical" to encourage experimentation while preserving the original model.

This work directly addresses the "black box" critique by making Micropolis a medium for thinking about cities, not only for playing them.

## SimCity Diagrams

**Chaim Gingold's** detailed diagrams visualizing **SimCity's** internal architecture and mechanics are available in the [**Reverse Diagrams**](/pages/reverse-diagrams) section. These include:

- [**Simulation Loop**](/pages/reverse-diagrams#simulation-loop) - The 16-step process that advances the city time
- [**Map Data Flow**](/pages/reverse-diagrams#map-data-flow) - How data moves between different map layers
- [**Maps**](/pages/reverse-diagrams#maps) - The multiple map layers encoding different types of data
- [**Map Scan**](/pages/reverse-diagrams#map-scan) - How the tile map is incrementally processed
- [**Make Traffic**](/pages/reverse-diagrams#make-traffic) - The algorithm for traffic simulation
- [**Animation Characters**](/pages/reverse-diagrams#animation-characters) - Visualization elements that bring the city to life

### Chaim's Decade-Long Research Journey

Chaim's relationship with **SimCity** is deep, spanning over a decade of research. He didn't just play the game; he dissected it, interviewed its creators, and analyzed its cultural impact. His **PhD dissertation**, "[**Play Design**](https://pqdtopen.proquest.com/doc/304817380.html?FMT=AI)", is a seminal work in understanding **SimCity's** design and player experience.

He recently shared insights about [**Doreen Nelson's**](/pages/constructionist-education/doreen-nelson) collaboration with **Maxis** on **teacher guides**, highlighting the long-standing connection between **SimCity** and education:

> "She recently found a shrink wrapped copy of a teacher guide she coauthored with **Michael Bremer** and opened it (!) because we disagreed about what was in there, LOL. It's destined now for her **UCLA archive**. Apparently she also wrote guides for many other **Maxis** titles but not all saw the light of day."

What's remarkable about Chaim's book is how it goes far beyond just the history and technical details of **SimCity** itself. The first half of the book explores the broader context that made **SimCity** possible - from city modeling for education to **system dynamics**, **cellular automata**, **graphical interfaces**, and the influence of institutions like the **Santa Fe Institute**. This is absolutely crucial for understanding not just how **SimCity** works, but why it works the way it does.

> "The actual end product of **SimCity** is not the shallow model of the city running in the computer. More importantly, it's the deeper model of the real world, and the intuitive understanding of complex dynamic systems, that people learn from playing it." — [**Will Wright**](/pages/about/will-wright#educational-impact)

This insight from Will makes clear why Chaim's work is more than just academic analysis—it's about uncovering the mechanisms through which **SimCity** achieves its educational impact. 