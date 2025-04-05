---
layout: default
title: About # Used for <title> tag
header: About Micropolis # Used for H1
description: An exploration of the history, concepts, creators, and influences behind the Micropolis simulation (based on SimCity Classic). 🧐
---

## Explore Topics

Learn more about the people and ideas related to Micropolis:

*   [Will Wright](/pages/about/will-wright): Meet the visionary game designer who originally created SimCity, Spore, and The Sims. 🎮️
*   [Don Hopkins](/pages/about/don-hopkins): Learn about the hacker known for porting SimCity to Unix, developing its open-source version Micropolis, and pioneering pie menus. 🐧
*   [Chaim Gingold](/pages/about/chaim-gingold): Dive into insights from "Building SimCity," Chaim's book detailing the game's creation, alongside his revealing reverse-engineered diagrams. 📖️
*   [Brett Victor](/pages/about/brett-victor): Explore the work of an influential designer and programmer focused on dynamic mediums for thought and creativity. ✨
*   [Stone Librande](/pages/about/stone-librande): Discover the design philosophy of Stone Librande, known for his insightful one-page documents visualizing complex game systems. 📄
*   [Ben Shneiderman](/pages/about/ben-shneiderman): Understand the principles championed by the computer scientist who coined "direct manipulation" and advanced information visualization.🖱️
*   [Constructionist Education](/pages/about/constructionist-education): An overview of the learning theory developed by Seymour Papert, where knowledge is built through active creation and sharing. 🛠️

*(More introductory content can be added here...)*

# SimCity's Technical Evolution: From PostScript to WebAssembly

Over the past thirty years, I've had the fascinating opportunity to implement SimCity across a remarkable range of platforms and technologies - from NeWS/PostScript in 1992, to X11/TCL/Tk for Unix, then Python/GTK when EA open-sourced it for the One Laptop Per Child project, later Flash/OpenLaszlo for early web browsers, and now WebAssembly/SvelteKit for modern web standards. Each implementation has been like a different lens revealing new possibilities while preserving the brilliance of Will Wright's original simulation.

> "I can't just design the interface after the game's done, or design the game in isolation from the interface. Each one of these supports the other." — [Will Wright](/pages/about/will-wright#the-anatomy-of-simulation-games)

## Simulation Architecture

SimCity's core design represents a masterclass in efficient simulation architecture. By studying these diagrams (reverse-engineered by Chaim Gingold), we can appreciate the elegant solutions that enable a complex, believable urban simulation on limited hardware.

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the mental model in the player's head." — [Will Wright](/pages/about/will-wright#the-anatomy-of-simulation-games)

![SimCity Simulation Loop](/images/diagrams/SimCityReverseDiagrams-Page-1-Simulate.png)

### Multi-Resolution Map Data

![Map Data Architecture](/images/diagrams/SimCityReverseDiagrams-Page-2-Map-Data-Flow.png)

When I ported this architecture to more powerful platforms, I preserved this multi-resolution design rather than "simplifying" it with brute force computation. Good architecture transcends hardware generations.

> "The exhaustively-researched illustrations are brilliant, and shockingly well printed in color--you can read them in depth." — [Stewart Brand on Chaim Gingold's work](/pages/about/chaim-gingold#building-simcity-how-to-put-the-world-in-a-machine)

### Pathfinding and Traffic Simulation

![Traffic System](/images/diagrams/SimCityReverseDiagrams-Page-5-Make-Traffic.png)

SimCity's traffic system is perhaps the most ingenious technical solution in the game:

- **Statistical Abstraction** - Each path represents many individual trips, not single vehicles—a fundamental abstraction that enables the entire system
- **Randomized Pathfinding** - A simple but effective stack-based randomized approach that creates realistic traffic patterns without requiring A* pathfinding
- **Emergent Behavior** - Road network quality naturally emerges from pathfinding success/failure, teaching players good urban design through direct experience
- **Multi-Modal Transportation** - Different handling of roads vs. rail creates meaningful gameplay choices with distinctive traffic patterns

> "I just kind of optimized for game play." — [Will Wright](/pages/about/will-wright#reverse-over-engineering), when asked which urban planning theory informed SimCity

These diagrams expose the consistent philosophy across all of SimCity's systems: elegant simplification, efficient data representation, careful orchestration, and emergent complexity from simple rules.

## Key Influences and Inspirations

Throughout SimCity's evolution, several key thinkers have profoundly influenced its design, visualization, and educational applications. Each has contributed unique perspectives that shape how we understand and interact with complex systems:

- **[Will Wright](/pages/about/will-wright)** - Creator of SimCity and The Sims whose unique approach to game design and simulation has revolutionized how we think about interactive systems and learning through play.

  > "One of the paradigms we've tried to use in designing these simulations is to think of them a little bit more as toys rather than games." — [Will Wright](/pages/about/will-wright#separating-simulation-from-game)

- **[Chaim Gingold](/pages/about/chaim-gingold)** - His reverse engineering diagrams transformed SimCity's architecture from opaque code into visually comprehensible systems, revealing the elegant design principles at its core.

  > "This project took over a decade to research and write. The simple answer about the difference between 'hoping for' and 'final' product encompasses a lot of what makes software and game development interesting." — [Chaim Gingold](/pages/about/chaim-gingold#chaims-decade-long-research-journey)

- **[Ben Shneiderman](/pages/about/ben-shneiderman)** - Pioneer of direct manipulation interfaces and dynamic queries, whose work directly influenced the development of pie menus and the Dynamic Zone Finder for SimCity.

  > "Users rapidly learn to use the visual feedback to find where their solution is likely to be found." — [Ben Shneiderman](/pages/about/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder)

- **[Brett Victor](/pages/about/brett-victor)** - His revolutionary work on explorable explanations and interactive visualization has shaped how we approach making SimCity's systems visible and manipulable.

  > "Creators need an immediate connection to what they're creating." — [Brett Victor](/pages/about/brett-victor#revolutionary-approach-to-interface-design)

- **[Stone Librande](/pages/about/stone-librande)** - His one-page design philosophy transformed how we visualize and document complex systems, influencing both Chaim's diagrams and our current interface design.

  > "Why create a document with more than one page if most people only read the first page anyway?" — [Stone Librande](/pages/about/stone-librande#revolutionary-documentation-approach)

- **Doreen Nelson and Design-Based Learning** - Doreen Nelson's pioneering work on Design-Based Learning (previously City Building Education) created a critical bridge between physical city-building activities and SimCity's digital simulation. See [Constructionist Education](/pages/about/constructionist-education) for more details on her work.

  > "The actual end product of SimCity is not the shallow model of the city running in the computer. More importantly, it's the deeper model of the real world, and the intuitive understanding of complex dynamic systems, that people learn from playing it." — [Will Wright](/pages/about/will-wright#educational-impact)

These thinkers and their approaches converge in our current WebAssembly implementation, where we're working to make SimCity's complex systems not just playable but genuinely understandable through direct manipulation and visual exploration.

## Additional Resources

<ul>
  <li><a href="/pdf/SimCityReverseDiagrams.pdf" target="_blank" rel="noopener noreferrer">Full SimCity Reverse Diagrams (PDF)</a></li>
</ul>

### Simulation Loop

Analysis and commentary on the reverse engineered SimCity source code.

## Key Figures and Concepts

Micropolis stands on the shoulders of giants and innovative ideas. Explore the individuals and theories that shaped its world:

*   [Will Wright](/pages/about/will-wright): Meet the visionary game designer who originally created SimCity, Spore, and The Sims. 🎮️
*   [Don Hopkins](/pages/about/don-hopkins): Learn about the hacker known for porting SimCity to Unix, developing its open-source version Micropolis, and pioneering pie menus. 🐧
*   [Chaim Gingold](/pages/about/chaim-gingold): Dive into insights from "Building SimCity," Chaim's book detailing the game's creation, alongside his revealing reverse-engineered diagrams. 📖️
*   [Brett Victor](/pages/about/brett-victor): Explore the work of an influential designer and programmer focused on dynamic mediums for thought and creativity. ✨
*   [Stone Librande](/pages/about/stone-librande): Discover the design philosophy of Stone Librande, known for his insightful one-page documents visualizing complex game systems. 📄
*   [Ben Shneiderman](/pages/about/ben-shneiderman): Understand the principles championed by the computer scientist who coined "direct manipulation" and advanced information visualization.🖱️
*   [Constructionist Education](/pages/about/constructionist-education): An overview of the learning theory where knowledge is built through active creation and sharing. 🛠️

## Influences and Connections

Understanding Micropolis involves looking at the interplay of ideas:

*   **Direct Manipulation** pioneered by [Ben Shneiderman](/pages/about/ben-shneiderman) is fundamental to the SimCity interface, allowing intuitive control over the simulation.
    > "The appeal of direct manipulation lies in its ability to make complex systems understandable and controllable." — Ben Shneiderman
*   **Constructionism**, developed by [Seymour Papert](/pages/about/constructionist-education/seymour-papert) (inspired by [Jean Piaget](/pages/about/constructionist-education/jean-piaget)), aligns with the open-ended, creative play encouraged by Micropolis. Players learn by building.
    > "The role of the teacher is to create the conditions for invention rather than provide ready-made knowledge." — Seymour Papert
*   **Systems Thinking** is embodied in the simulation's interconnectedness, visualized through [Stone Librande](/pages/about/stone-librande)'s one-page design approach and echoing concepts from [Marvin Minsky](/pages/about/constructionist-education/marvin-minsky)'s "Society of Mind."
    > "The power of a one-page design lies in its ability to communicate the essence of a complex system clearly and concisely." — Stone Librande
*   **User Interface Innovation**, from [Alan Kay](/pages/about/constructionist-education/alan-kay)'s vision of the Dynabook to [Don Hopkins](/pages/about/don-hopkins)'s pie menus, pushed the boundaries of how users interact with computers, influencing Micropolis's design.
    > "The best way to predict the future is to invent it." — Alan Kay
*   **Design-Based Learning**, championed by [Doreen Nelson](/pages/about/constructionist-education/doreen-nelson), emphasizes hands-on creation, mirroring the learning-through-doing experience of playing Micropolis.
    > "Design-Based Learning empowers students to become active creators, not just passive consumers of information." — Doreen Nelson
*   **Reverse Engineering as Learning**, exemplified by [Chaim Gingold](/pages/about/chaim-gingold)'s diagrams, shows how deconstructing complex systems like SimCity deepens understanding.
    > "The exhaustively-researched illustrations are brilliant, and shockingly well printed in color--you can read them in depth." — [Stewart Brand on Chaim Gingold's work](/pages/about/chaim-gingold#building-simcity-how-to-put-the-world-in-a-machine)

## Legacy and Open Source

The release of the SimCity source code as "Micropolis" under the GPL ensures its availability for study, modification, and education, carrying forward the legacy of these pioneering ideas. Explore the [Micropolis Public Name License](/pages/micropolis-license) for details.

---

*This overview connects the various figures and concepts detailed in the linked pages. Read individual pages for deeper dives.* 