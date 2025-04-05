---
title: Chaim Gingold and SimCity Reverse Engineering
---

# Chaim Gingold and SimCity Reverse Engineering

## SimCity Reverse Engineering Analysis

Chaim Gingold's reverse engineering analysis represents a remarkable achievement in understanding and visualizing the complex architecture of Will Wright's original SimCity. His work sits at the intersection of three innovative approaches to understanding complex systems:

1. **Stone Librande's One-Page Designs (2010)** - A revolutionary approach to game design documentation where complex systems are distilled into single, densely informative pages that capture both high-level architecture and critical details.

2. **Bret Victor's Interactive Visualization (2013)** - From his "Media for Thinking the Unthinkable" work at MIT Media Lab, Victor demonstrates how dynamic, interactive visualizations can make complex systems tangible and manipulable.

3. **Bruno Latour's Visual Cognition (1986)** - Theoretical foundation for how visualization serves as a cognitive tool, helping us understand complex systems by making them visually manipulable.

Gingold's work brilliantly synthesizes these approaches, creating diagrams that are both analytical (revealing SimCity's architecture) and generative (providing a foundation for understanding and extending the system).

## Connection to Will Wright and SimCity

Chaim's work provides invaluable context for understanding [Will Wright](/pages/about/will-wright)'s design philosophy. By reverse-engineering SimCity's simulation loops and data structures, Chaim revealed the elegant architecture underlying the game's emergent complexity.

> "Looking at the design diagrams created by Chaim Gingold, we can appreciate just how elegantly structured Will's simulation designs were." — Quote from the [Will Wright page](/pages/about/will-wright#the-anatomy-of-simulation-games).

Chaim's diagrams, derived from his deep analysis, make the simulation's inner workings visible, much like the diagrams pioneered by [Stone Librande](/pages/about/stone-librande) at Maxis.

> "Chaim's diagrams...make the simulation's inner workings visible, much like the diagrams pioneered by Stone Librande at Maxis." — Derived from connections made on the [Stone Librande page](/pages/about/stone-librande#influence-and-connections).

## Building SimCity: How to Put the World in a Machine

Chaim's magnum opus book, "Building SimCity: How to Put the World in a Machine" (MIT Press, 2024), is the culmination of years of research, including his time working with Will Wright at Maxis on Spore and the Spore Creature Creator. As someone who's lived through much of the history documented in the book and who provided Chaim with source code and documentation to analyze, I can confidently say this is the most comprehensive, insightful exploration of SimCity ever written.

What makes this book so special isn't just that it documents the technical underpinnings of SimCity (though it does that brilliantly), but that it puts the game in its proper context - not just as a piece of software, but as a constellation of ideas about cities, simulations, and play.

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the mental model in the player's head." — [Will Wright](/pages/about/will-wright#the-anatomy-of-simulation-games)

Chaim's analysis reveals how SimCity's architecture elegantly supports this goal of building mental models—showing how the technical choices Will made were ultimately in service of creating an accessible, explorable simulation that could teach complex concepts through play.

As a recent review by Computer Gaming Yesterday notes:

> "The author Chaim Gingold really knows what he's talking about... he worked on Spore, he worked with Will Wright himself so he has a lot of at least very close secondhand knowledge about SimCity and how it was developed, and he was able to talk to Will Wright himself to get his opinion... there is a lot of stuff in here that I've never heard of before, never seen published before, new information, and even information that is not necessarily new like how the game works is explained in a lot of detail and formatted in a way I've never seen before."

The book has received rave reviews, including this glowing endorsement from Stewart Brand (founder of the Whole Earth Catalog and The WELL):

> "Brief book report: BUILDING SIM CITY: How to Put the World in a Machine, by Chaim Gingold, is an exhilarating read. It is one of the best origin stories ever told and the best account I've seen of how innovation actually occurs in computerdom."

Brand, who is very particular about accuracy and detail, further notes:

> "Of course I checked the few moments where I intersected with the events in the story. They are tone-perfect, detail-perfect, and context-perfect. More so than I've ever seen before. I trust this book. It tells revelatory truth."

And of particular relevance to this document, Brand specifically praised the diagrams:

> "The exhaustively-researched illustrations are brilliant, and shockingly well printed in color--you can read them in depth."

Those illustrations - especially the reverse diagrams - are what I'm most excited about bringing to life in the WebAssembly version of Micropolis. Chaim has kindly given me permission and encouragement to implement interactive versions of his reverse diagrams, which will dovetail perfectly with my implementation of the Dynamic Zone Finder (inspired by Ben Shneiderman's Dynamic Home Finder).

> "I just kind of optimized for game play." — [Will Wright](/pages/about/will-wright#reverse-over-engineering)

This simple statement from Will captures why Chaim's reverse engineering work is so valuable—it reveals how deceptively sophisticated the simulation architecture is beneath its accessible surface. What appears to be a simple toy-like city simulator is actually a carefully crafted system with elegant solutions to complex computational problems.

### Chaim's Decade-Long Research Journey

Chaim's relationship with SimCity is deep, spanning over a decade of research. He didn't just play the game; he dissected it, interviewed its creators, and analyzed its cultural impact. His PhD dissertation, "[Play Design](https://pqdtopen.proquest.com/doc/304817380.html?FMT=AI)", is a seminal work in understanding SimCity's design and player experience.

He recently shared insights about [Doreen Nelson](/pages/about/doreen-nelson)'s collaboration with Maxis on teacher guides, highlighting the long-standing connection between SimCity and education:

> "She recently found a shrink wrapped copy of a teacher guide she coauthored with Michael Bremer and opened it (!) because we disagreed about what was in there, LOL. It's destined now for her UCLA archive. Apparently she also wrote guides for many other Maxis titles but not all saw the light of day."

What's remarkable about Chaim's book is how it goes far beyond just the history and technical details of SimCity itself. The first half of the book explores the broader context that made SimCity possible - from city modeling for education to system dynamics, cellular automata, graphical interfaces, and the influence of institutions like the Santa Fe Institute. This is absolutely crucial for understanding not just how SimCity works, but why it works the way it does.

> "The actual end product of SimCity is not the shallow model of the city running in the computer. More importantly, it's the deeper model of the real world, and the intuitive understanding of complex dynamic systems, that people learn from playing it." — [Will Wright](/pages/about/will-wright#educational-impact)

This insight from Will makes clear why Chaim's work is more than just academic analysis—it's about uncovering the mechanisms through which SimCity achieves its educational impact.

![SimCity Simulation Loop Diagram](/images/diagrams/SimCityReverseDiagrams-Page-1-Simulate.png)

![SimCity Map Data Flow Diagram](/images/diagrams/SimCityReverseDiagrams-Page-2-Map-Data-Flow.png)

![SimCity Maps Diagram](/images/diagrams/SimCityReverseDiagrams-Page-3-Maps.png)

![SimCity Map Scan Diagram](/images/diagrams/SimCityReverseDiagrams-Page-4-Map-Scan.png)

![SimCity Make Traffic Diagram](/images/diagrams/SimCityReverseDiagrams-Page-5-Make-Traffic.png)

![SimCity Animation Characters Diagram](/images/diagrams/SimCityReverseDiagrams-Page-6-Animation-Characters.png)

[... rest of content continues ...] 