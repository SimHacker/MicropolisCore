---
title: Ben Shneiderman
header: "Ben Shneiderman: Direct Manipulation"
description: 🖱️ Understand the principles championed by the computer scientist who coined "**direct manipulation**" and advanced **information visualization**.
---

## Ben Shneiderman's Research and Contributions

**Ben Shneiderman** has made a distinguished career of performing **controlled experiments**, measuring the efficacy of different techniques, comparing them to each other in different contexts, and teaching his students the importance of **empirical testing**, balanced with **human-centered design**.

> "Don't label machines as 'intelligent'. It limits the imagination. We should have greater ambitions." — **Ben Shneiderman**, "**Beyond Intelligent Machines**"

> "A picture is worth a thousand words. An interface is worth a thousand pictures." — **Ben Shneiderman**

> "The purpose of visualization is insight, not pictures." — **Ben Shneiderman**

Key contributions include:

- **HyperTIES and Embedded Menus**: Pioneer of **hypertext systems** with his invention of **embedded menu links**, where text itself serves as the link marker. This concept later influenced the development of the **World Wide Web**.

- **Nassi-Shneiderman Diagrams**: With **Ike Nassi**, he developed a goto-less visual programming technique. He not only studied and summarized the status quo of flowcharting, but also conducted experiments that suggested **flowcharts** were not helpful for writing, understanding, or modifying computer programs.

- **Information Visualization**: Extensive work in this field, including the development of **tree maps** and **dynamic query sliders** that have influenced countless visualization tools.

- **Direct Manipulation Interfaces**: Developed the concept of **direct manipulation interfaces** where users can visibly interact with objects rather than using command syntax.

- **Pie Menus Research**: Led **empirical research** proving the efficiency of **pie menus** over **linear menus**, influencing modern **UI design**.

- **Touchscreen Interfaces**: Pioneered high-precision **touchscreen interaction techniques**, including the crucial "**lift-off**" strategy.

- **Eight Golden Rules for Interface Design**: A set of principles that have become fundamental guidelines for **UI/UX designers** worldwide.

## The HyperTIES Journey: Pioneering Hypertext

### Key Milestones in HyperTIES Development

Shneiderman's work on **hypertext systems** began in the early 1980s, well before the **World Wide Web**:

- **1982-1983**: The **Human-Computer Interaction Lab (HCIL)** began developing an early hypertext system on **IBM PC** computers. **Dan Ostroff** implemented Shneiderman's concept of **embedded menus**, where the text itself served as link markers.

- **1983-1984**: The system was developed as **The Interactive Encyclopedia System (TIES)**.

- **1986**: The system was renamed to **HyperTIES** due to trademark conflicts. Shneiderman published the influential paper "**Embedded menus: Selecting items in context**" in **Communications of the ACM** (April 1986).

- **1987**: Commercial licensing with **Cognetics Corporation** began.

- **1988**: The **HCIL** team published "**Hypertext on Hypertext**" in July 1988 **CACM**.

- **1989**: [**Don Hopkins**](/pages/about/don-hopkins) developed the **NeWS** version of **HyperTIES** with **PostScript**, **FORTH**, and **Emacs MockLisp**, along with creating the **HyperTIES authoring tool** using [**pie menus**](#pie-menus-an-empirical-innovation).

### The Significance of HyperTIES

**HyperTIES** represented a breakthrough in hypertext navigation through several innovative features:

1.  **Embedded Menu Links**: Shneiderman invented the concept of having text itself serve as link markers, rather than using typed codes, numbered menus, or separate icons.

2.  **Link Previews**: Users could click once on a link to see a definition at the bottom of the screen before deciding to follow it with a double-click.

3.  **Light Blue Link Highlighting**: Through empirical studies, Shneiderman's team determined that light blue was the optimal color for highlighting links, balancing visibility with reading comprehension.

4.  **Graphical Links**: **HyperTIES** allowed for arbitrarily-shaped regions in images to be designated as targets, with innovative "**pop-out**" highlighting when users hovered over these regions.

**Tim Berners-Lee**, creator of the **World Wide Web**, acknowledged being influenced by **HyperTIES** design, particularly the "**Hypertext on Hypertext**" project that used **HyperTIES** for the July 1988 **CACM**.

## Pie Menus: An Empirical Innovation {#pie-menus-an-empirical-innovation}

Shneiderman's lab also empirically validated the efficiency of radial menus, known as **pie menus**. These were originally developed by [**Don Hopkins**](/pages/don-hopkins) while working at the **University of Maryland Human-Computer Interaction Lab** under Shneiderman, in collaboration with **John Callahan** and **Mark Weiser**, leading to a frequently cited [CHI'88 paper](https://dl.acm.org/doi/10.1145/57167.57182). Don later implemented them extensively in the **Unix** port of **SimCity** and subsequently in **The Sims**, where they became a signature interaction element, offering rapid, context-sensitive command selection.

> "**Pie menus** are 30 percent faster and have half the error rates of menu bars." — **Ben Shneiderman**, **Scientific American** (1997)

In April 1988, the team presented their groundbreaking paper "**An Empirical Comparison of Pie vs. Linear Menus**" at **CHI'88**, demonstrating that **pie menus** were approximately 15% faster with significantly lower error rates than **linear menus**.

Their research showed that **pie menus** outperformed traditional **linear menus** by:
- Reducing **target seek time**
- Lowering error rates by fixing the distance factor
- Increasing target size according to **Fitts's Law**
- Minimizing drift distance after target selection

These **pie menus** were later implemented in the **SimCity** interface, serving as a natural implementation of Shneiderman's **direct manipulation** philosophy. As [**Stone Librande**](/pages/about/stone-librande) noted, the visual approach made complex operations more immediately accessible than text:

> "Diagrams make relationships visible. Words make them invisible."

These principles have profoundly influenced modern interface design, from graphical operating systems to countless applications. Their application in simulation games like [**SimCity/Micropolis**](/pages/micropolis-license) is particularly relevant, where visualizing complex data and allowing intuitive control are paramount. For example, the architectural editing tools developed by [**Don Hopkins**](/pages/don-hopkins) for **The Sims** directly implemented these ideas, using drag-and-drop for placement and rotation, providing immediate visual feedback, and allowing incremental changes, making a complex task feel intuitive.

## High-Precision Touchscreen Research

Between 1988 and 1991, Shneiderman and his team conducted pioneering research on **touchscreen interfaces**, including:

- **Lift-Off Strategy**: A crucial breakthrough where selection happens when the finger is lifted rather than on initial touch, allowing for more precise selections and error correction
- **Feedback during interaction**: Visual feedback during touch to show what will be selected
- **Screen stabilization**: Techniques to make cursor position more stable during touch

This research was later cited as prior art in legal cases contesting **Apple's** "**Slide to Unlock**" patents for the **iPhone**, demonstrating the long-lasting impact of Shneiderman's innovations.

## Dynamic Queries and the Dynamic Zone Finder {#dynamic-queries-and-the-dynamic-zone-finder}

Ben's work on **Dynamic Queries** and the **Dynamic Home Finder** directly inspired the implementation of the **Dynamic Zone Finder** (also known as the **Frob-O-Matic**) for **SimCity**. As Ben described it:

> "**Dynamic Queries**. These animations let you rapidly adjust query parameters and immediately display updated result sets, which makes them very effective when a visual environment like a map, calendar, or schematic diagram is available. The immediate display of results lets users more easily develop intuitions, discover patterns, spot trends, find exceptions, and see anomalies."

His famous **Dynamic HomeFinder** prototype for real estate queries demonstrated how users could adjust parameters like cost and number of bedrooms and instantly see matching homes appear on a map. The empirical study showed it was significantly more effective than traditional **database query languages**.

![Ben Shneiderman's Dynamic HomeFinder prototype](/images/diagrams/DynamicHomeFinder.png)

> "Users rapidly learn to use the visual feedback to find where their solution is likely to be found." — **Ben Shneiderman**

This concept was reimagined for **SimCity** as the "**Frob-O-Matic**" (later renamed to the **Dynamic Zone Finder**), allowing players to filter city zones based on various parameters such as population density, pollution, traffic, land value, crime, and more, leveraging the detailed data layers documented in [**Chaim Gingold's**](/pages/about/chaim-gingold) [**Maps**](/pages/reverse-diagrams#maps) diagram. We are actively working on implementing an interactive version of the **Dynamic Zone Finder** using modern web technologies like [**SvelteKit runes**](https://svelte.dev/blog/runes) and [**WebGL/Canvas**](/pages/chaim-gingold#building-simcity-how-to-put-the-world-in-a-machine).

> "It's just a much higher bandwidth way to query a database than is conventionally used." — [**Don Hopkins**](/pages/about/don-hopkins)

As [**Will Wright**](/pages/about/will-wright) observed when he saw this implementation:

> "One of the things that we've tried pretty hard at, I think we've been pretty successful at, is keeping numbers out of the user's face. So whenever possible, we do these things graphically."

This perfectly aligned with Shneiderman's philosophy of making complex data accessible through **direct manipulation** rather than abstract representation, a theme explored deeply in [**Chaim Gingold's**](/pages/about/chaim-gingold) book, "[**Building SimCity**](/pages/building-simcity)".

## Shared Foundations with Brett Victor's Work {#shared-foundations-with-brett-victors-work}

Shneiderman's approach shares fundamental principles with [**Brett Victor's**](/pages/about/brett-victor) work on **explorable explanations** and **interactive visualization**. Both emphasize:

1.  **Continuous visual representation** of objects and actions of interest
2.  **Physical actions** or labeled button presses instead of complex syntax
3.  **Rapid, incremental, reversible operations** whose impact on the object of interest is immediately visible
4.  **Immediate feedback** on all actions

These shared principles have proven fundamental to creating interfaces that help users develop intuition about complex systems through **direct manipulation**.

## Human-Centered Computing Philosophy

What has always impressed me ([**Don Hopkins**](/pages/about/don-hopkins)) about Ben's approach is his unwavering focus on putting humans first. As he noted:

> "If you treat machines like people, you're likely to end up treating people like machines."

> "The old computing was about what computers could do; the new computing is about what users can do. Successful technologies are those that are in harmony with users' needs. They must support relationships and activities that enrich the users' experiences."

This philosophy guided his naming of the **Human-Computer Interaction Lab (HCIL)** at the **University of Maryland**, deliberately putting "**Human**" before "**Computer**" in the name.

> "Enable humans to accomplish tasks that weren't before possible, instead of trying to enable machines to accomplish tasks people can already do." — **Ben Shneiderman**

His emphasis on **predictability** and **control** as desirable qualities in interfaces - giving users "the feeling of mastery, competence, and understanding, sense of accomplishment" - mirrors the design philosophy in [**SimCity**](/pages/about/will-wright), where players develop intuition about complex systems through **direct manipulation**.

In [**constructionist education**](/pages/constructionist-education), Shneiderman's principles of **direct manipulation** and **dynamic queries** provide a perfect technical foundation for [**Will Wright's**](/pages/about/will-wright#educational-impact) educational goals. Making urban planning principles visible and manipulable allows players to see direct cause-and-effect relationships through visual interfaces rather than abstract numbers.

Ben's most recent work continues to emphasize this **human-centered** approach to **AI** and computing, as seen in his 2020 paper "**Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy**."

> "**Leonardo Da Vinci** combined art and science and aesthetics and engineering, that kind of unity is needed once again." — **Ben Shneiderman**

The **Dynamic Zone Finder** in **SimCity** stands as a testament to how Ben's ideas about **direct manipulation** and **dynamic queries** can transform how we interact with complex simulations, making them more accessible, understandable, and enjoyable. 