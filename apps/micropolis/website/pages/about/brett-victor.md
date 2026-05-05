---
title: Brett Victor
header: "Brett Victor: Dynamic Mediums"
description: 🧩 Explore the revolutionary interface design principles of "**explorable explanations**" that influenced **SimCity's** visualization systems.
---

# Brett Victor and Explorable Explanations

## Revolutionary Approach to Interface Design

**Brett Victor's** work on creating dynamic, responsive interfaces where users can directly manipulate data and see immediate results has fundamentally transformed how I ([**Don Hopkins**](/pages/about/don-hopkins)) approach **SimCity's** visualization systems. His concept of "**Explorable Explanations**" - interactive documents where readers can play with the assumptions and see how systems behave - perfectly captures what I'm trying to achieve with **SimCity's** simulation layers.

Victor frames this not just as a technical problem, but as a fundamental limitation on our ability to think. He often quotes **Richard Hamming**:

> "...just as there are odors that dogs can smell and we cannot... so too there are wavelengths of light we cannot see... why then... does the remark **perhaps there are thoughts we can't think** surprise you?" — Richard Hamming

Victor extends this idea, arguing that just as we build tools like microscopes or telescopes to extend our senses, we must build better tools—better *media*—to help us think thoughts that are currently unthinkable, especially about complex systems.

> "We build tools that adapt these Unthinkable thoughts to the way that our minds work and allow us to think these thoughts that were previously Unthinkable." — **Brett Victor**, [Media for Thinking the Unthinkable](https://www.youtube.com/watch?v=o_FGuBIgKwA)

He draws on **Jerome Bruner's** work, which identified different modes of thought: **inactive** (doing/kinesthetic), **iconic** (seeing patterns/images), and **symbolic** (language/logic). Victor argues that traditional tools for complex systems often rely too heavily on the symbolic, neglecting the power of the interactive and visual channels. His work seeks to create media that engage multiple modalities, allowing for a deeper, more intuitive understanding.

> "People understand what they can see. If a programmer cannot see what a program is doing, she can't understand it." — **Brett Victor**

What makes Brett's approach revolutionary is his relentless focus on closing the gap between human thought and computational representation. He argues that conventional tools force creators into unproductive modes of thinking:

> "...in order to write code like this you have to imagine an array in your head and you essentially have to **play computer**... simulate in your head what each line of code would do... why isn't the computer just do it and show us?" — **Brett Victor**, [Inventing on Principle](https://www.youtube.com/watch?v=PUv66718DII)

He contrasts this with tools like spreadsheets:

> "A spreadsheet is the dual of a conventional programming language -- a language shows all the code, but hides the data. A spreadsheet shows all the data, but hides the code... Spreadsheets rule because they **show the data**." — **Brett Victor**, [Learnable Programming](http://worrydream.com/LearnableProgramming/)

His core guiding principle aims to fix this disconnect:

> "**Creators need an immediate connection to what they're creating.**" — **Brett Victor**

For Victor, violating this principle isn't just inefficient; it hinders creativity itself:

> "Ideas are very precious to me... and when I see ideas dying it hurts... I see a tragedy... it feels like a moral wrong." — **Brett Victor**, [Inventing on Principle](https://www.youtube.com/watch?v=PUv66718DII)

His goal isn't just better features, but a fundamental shift:

> "How do we get people to understand programming? We change programming. We turn it into something that's understandable by people." — **Brett Victor**, [Learnable Programming](http://worrydream.com/LearnableProgramming/)

When I first saw his demonstrations of dynamic, interactive interfaces that respond instantly to manipulation, I recognized exactly what had been missing from our simulation tools.

> "**Information software design** is the design of context-sensitive information graphics. This is not a spreadsheet, not a database, not even '**information architecture**.' It is an artistic discipline, and its creative medium is **context-sensitive information graphics**." — **Brett Victor**, "**Magic Ink**"

## Connection to SimCity and Will Wright's Vision

Brett's philosophy remarkably echoes [**Will Wright's**](/pages/about/will-wright) approach to simulation games. Both aim to create *media for thinking* about complex systems, albeit through different approaches—Will through playful simulation, Brett through dynamic representations.

When Will said:

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the **mental model** in the player's head." — [**Will Wright**](/pages/about/will-wright#the-anatomy-of-simulation-games)

He was expressing a principle that Brett would later formalize in his work on **explorable explanations**. Both understand that computational models are merely tools to build understanding in human minds.

Brett's essays like "**Up and Down the Ladder of Abstraction**" provide a framework for thinking about how to make complex systems explorable. This aligns perfectly with Will's insight about why people connect so deeply with **SimCity**:

> "Everybody's taking a linear path through this, and they're basically, most people will attempt to understand things like this with a story. They'll think about 'I did this, then that happened, because of that', and so the story becomes kind of their logical connection, their logical reverse engineering, of the simulation that they're playing inside of." — [**Will Wright**](/pages/about/will-wright#a-new-paradigm-for-game-design)

## Shared Foundations with Ben Shneiderman's Work {#shared-foundations-with-ben-shneidermans-work}

Brett's approach shares fundamental principles with [**Ben Shneiderman's**](/pages/about/ben-shneiderman) work on **direct manipulation interfaces** and **dynamic queries**. Both emphasize:

1.  **Continuous visual representation** of objects and actions of interest
2.  **Physical actions** or labeled button presses instead of complex syntax
3.  **Rapid, incremental, reversible operations** whose impact on the object of interest is immediately visible
4.  **Immediate feedback** on all actions

These principles were directly applied in the design of **The Sims'** architectural editing tools, which [**I developed**](/pages/don-hopkins). As shown in this [demo video](https://www.youtube.com/watch?v=-exdu4ETscs), the goal was to make building intuitive even for children:
*   **Walls, floors, and wallpaper** tools provided immediate visual feedback.
*   Objects clicked into place on a grid, providing **tangible feedback** for valid placement, while invalid spots felt "slippery."
*   Object rotation used a **direct manipulation gesture** (click, drag direction, release) instead of requiring separate modes or commands.
This focus on direct visual interaction and rapid feedback made the complex task of architectural design feel more like playing with digital building blocks.

> "Users rapidly learn to use the visual feedback to find where their solution is likely to be found." — [**Ben Shneiderman**](/pages/about/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder)

Brett extends these principles with his emphasis on making the invisible visible—showing users what's happening inside systems they're interacting with.

## Learnable Programming

In Brett's influential essay "**Learnable Programming**," he articulates principles that closely align with how I'm approaching the visualization of **SimCity's** internal systems. His key tenets include:

*   **Follow the flow:** Make execution visible and tangible, potentially at multiple time granularities.
*   **See the state:** Show the data, show comparisons, and eliminate hidden state.
*   **Create by reacting:** Get something on the screen quickly so the creator can react to it.
*   **Create by abstracting:** Start concrete and provide tools to generalize.

These principles directly inform our approach to revealing **SimCity's** simulation architecture through interactive diagrams based on [**Chaim Gingold's**](/pages/about/chaim-gingold) [**reverse engineering**](/pages/reverse-diagrams). The interactive [**Simulation Loop**](/pages/reverse-diagrams#simulation-loop) diagram aims to make *flow* and *time* tangible. The [**Map Data Flow**](/pages/reverse-diagrams#map-data-flow) and interactive [**Maps**](/pages/reverse-diagrams#maps) aim to make *state* and *data flow* visible. By allowing direct manipulation and immediate feedback (like in the planned [**Dynamic Zone Finder**](/pages/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder)), we facilitate *creating by reacting*. The ability to see both the specific state and the overall system supports *creating by abstracting*.

> "The system must have no hidden state... Every action must have a visible effect." — **Brett Victor**, [Learnable Programming](http://worrydream.com/LearnableProgramming/)

This principle is at the heart of our effort to transform **SimCity** from a "**black box**" simulation into an **explorable explanation** of urban systems—where players can not only see the results of their actions but understand the causal mechanisms that produced those results.

As Victor puts it:

> "**Visualize data, not code. Dynamic behavior, not static structure.**" — **Brett Victor**, [Learnable Programming](http://worrydream.com/LearnableProgramming/)

By integrating Brett's principles with [**Will Wright's**](/pages/about/will-wright) simulation design philosophy and [**Ben Shneiderman's**](/pages/about/ben-shneiderman) **direct manipulation** interfaces, we're creating a new kind of explorable urban simulation that fulfills the [**educational potential**](/pages/constructionist-education) that has always been latent in **SimCity**, further detailed in [**Chaim Gingold's**](/pages/about/chaim-gingold) book, "[**Building SimCity**](/pages/building-simcity)".

## Influence on SimCity and Micropolis

Victor's ideas have been a major inspiration for my work on visualizing and interacting with the [**Micropolis**](/pages/micropolis-license) simulation. His emphasis on **immediate feedback** and **manipulable representations** directly informs the design goals for the current [**WebAssembly version**](/pages/don-hopkins#current-work).

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the **mental model** in the player's head." — [**Will Wright**](/pages/about/will-wright#the-anatomy-of-simulation-games)

Victor's critique of conventional programming tools resonates with the challenges of understanding complex simulation code. Making the simulation's state and behavior visible and directly manipulable is key to bridging the gap between the code and the player's **mental model**.

> "Everybody's taking a linear path through this, and they're basically, most people will attempt to understand things like this with a story. They'll think about 'I did this, then that happened, because of that', and so the story becomes kind of their logical connection, their logical **reverse engineering**, of the simulation that they're playing inside of." — [**Will Wright**](/pages/about/will-wright#a-new-paradigm-for-game-design)

## Shared Foundations with Ben Shneiderman's Work

Victor's work shares philosophical roots with [**Ben Shneiderman's**](/pages/about/ben-shneiderman) principles of **direct manipulation** and **dynamic queries**. Both advocate for interfaces that provide:

1.  **Continuous visual representation** of the objects of interest.
2.  **Physical actions** or simple button presses instead of complex syntax.
3.  **Rapid, incremental, reversible operations**.
4.  **Immediate visibility** of the results of actions.

> "Users rapidly learn to use the visual feedback to find where their solution is likely to be found." — [**Ben Shneiderman**](/pages/about/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder)

By applying these principles, we aim to make [**Micropolis**](/pages/micropolis-license) not just a game, but a tool for thought—an **explorable explanation** of urban dynamics, echoing the ambitions of pioneers like [**Alan Kay**](/pages/constructionist-education/alan-kay) who envisioned computers as powerful mediums for learning and discovery. It's part of the ongoing effort to invent better tools for creators, fighting for the principle that we deserve an immediate connection to what we create. 