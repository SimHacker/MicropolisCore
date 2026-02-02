---
title: About Micropolis
header: About Micropolis
description: 🧐 An exploration of the history, concepts, creators, and influences behind the Micropolis simulation (based on SimCity Classic).
---

<script>
// Remove redundant page title block and bullet list navigation
document.addEventListener('DOMContentLoaded', function() {
  // Find and remove the redundant header divs with titles
  const headers = document.querySelectorAll('.markdown-content div.highlight');
  headers.forEach(header => {
    if (header.textContent.trim() === 'About' || 
        header.textContent.trim() === 'Building SimCity' || 
        header.textContent.trim() === 'Reverse Diagrams') {
      header.remove();
    }
  });
  
  // Find and remove bullet list navigations
  const lists = document.querySelectorAll('.markdown-content ul');
  lists.forEach(list => {
    const firstItem = list.querySelector('li a');
    if (firstItem && (firstItem.textContent.includes('Home') || 
                      firstItem.textContent.includes('Chaim Gingold'))) {
      list.remove();
    }
  });
});
</script>

# SimCity's Commercial to Open Source Evolution: From PostScript to X11 to WebAssembly

Over the past thirty years, I've had the fascinating opportunity to implement SimCity across a remarkable range of platforms and technologies - from NeWS/PostScript in 1992, to X11/TCL/Tk for Unix, then Python/GTK when EA open-sourced it for the One Laptop Per Child project (under the [GPL license with additional terms](/pages/micropolis-license#micropolis-gpl-license-notice)), later Flash/OpenLaszlo for early web browsers, and now WebAssembly/SvelteKit for modern web standards. Each implementation has been like a different lens revealing new possibilities while preserving the brilliance of Will Wright's original simulation.

> "I can't just design the interface after the game's done, or design the game in isolation from the interface. Each one of these supports the other." — [Will Wright](/pages/about/will-wright#the-anatomy-of-simulation-games)

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

- **[Doreen Nelson](/pages/about/constructionist-education/doreen-nelson)** - Her pioneering work on Design-Based Learning created a critical bridge between physical city-building activities and SimCity's digital simulation.

  > "Design-Based Learning empowers students to become active creators, not just passive consumers of information." — [Doreen Nelson](/pages/about/constructionist-education/doreen-nelson)

## Simulation Architecture

SimCity's core design represents a masterclass in efficient simulation architecture. By studying the [Reverse Diagrams](/pages/reverse-diagrams) (reverse-engineered by Chaim Gingold), we can appreciate the elegant solutions that enable a complex, believable urban simulation on limited hardware.

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the mental model in the player's head." — [Will Wright](/pages/about/will-wright#the-anatomy-of-simulation-games)

When I ported this architecture to more powerful platforms, I preserved this multi-resolution design rather than "simplifying" it with brute force computation. Good architecture transcends hardware generations.

SimCity's traffic system is perhaps the most ingenious technical solution in the game:

- **Statistical Abstraction** - Each path represents many individual trips, not single vehicles—a fundamental abstraction that enables the entire system
- **Randomized Pathfinding** - A simple but effective stack-based randomized approach that creates realistic traffic patterns without requiring A* pathfinding
- **Emergent Behavior** - Road network quality naturally emerges from pathfinding success/failure, teaching players good urban design through direct experience
- **Multi-Modal Transportation** - Different handling of roads vs. rail creates meaningful gameplay choices with distinctive traffic patterns

> "I just kind of optimized for game play." — [Will Wright](/pages/about/will-wright#reverse-over-engineering), when asked which urban planning theory informed SimCity

These diagrams expose the consistent philosophy across all of SimCity's systems: elegant simplification, efficient data representation, careful orchestration, and emergent complexity from simple rules.

## Legacy and Open Source

The release of the SimCity source code as "Micropolis" under the GPL ensures its availability for study, modification, and education, carrying forward the legacy of these pioneering ideas. The code is available under the [GPL with additional terms from Electronic Arts](/pages/micropolis-license#micropolis-gpl-license-notice) to protect the SimCity trademark, while the "Micropolis" name is used under the [Micropolis Public Name License](/pages/micropolis-license#micropolis-public-name-license). Please review both licenses to understand the terms governing this project.

## Additional Resources

<ul>
  <li><a href="/pages/reverse-diagrams">SimCity Reverse Diagrams</a> - View the detailed visual diagrams of SimCity's internal architecture</li>
</ul> 