---
title: Will Wright and SimCity Design Philosophy
---

# Will Wright: Architect of Worlds

Will Wright is more than just the creator of SimCity; he's a pioneer who redefined what video games could be. His approach blends deep simulation, emergent complexity, and player creativity into experiences that are as much about learning and discovery as they are about play.

> "I'm more interested in the possibilities of players discovering their own stories within the simulation."

## Educational Impact

Perhaps what I admire most about Will's approach to simulation games is how they've bridged entertainment and education without ever feeling didactic. As noted in the [Constructionist Education](/pages/about/constructionist-education) page, SimCity embodies constructionist principles without explicitly trying to. Players learn through creative experimentation rather than being taught directly.

> "The actual end product of SimCity is not the shallow model of the city running in the computer. More importantly, it's the deeper model of the real world, and the intuitive understanding of complex dynamic systems, that people learn from playing it."

> "Adults, primarily ones that kind of grew up before the computer generation really got into full swing, when they're put in front of a computer, they're afraid of failure. Generally they're timid, they're very, they think twice before they click a button. They don't just try anything, whereas kids, they fail all the time. They kind of like failure. The failure doesn't bother them, because they're always failing. When you see a kid build a tower of blocks, they'll build it, and they'll knock it down. Oh it's fun! What's important for the kid is that the failure mode is fun and interesting, okay? What kids don't like is a boring failure mode."

## The Anatomy of Simulation Games

Will often speaks about the underlying structure of his simulations. It's not just about coding a model; it's about designing a system that players can intuitively grasp and explore.

> "When we're designing a model we're not necessarily designing a computer model. Our real end product is the mental model in the player's head. We're trying to give them maybe a more robust model of the way a city works, or a planet works, or whatever. The computer model really is just an incremental step in that direction. It's like a compiler for the mental model."

> "I can't just design the interface after the game's done, or design the game in isolation from the interface. Each one of these supports the other."

Looking at the design diagrams created by [Chaim Gingold](/pages/about/chaim-gingold), we can appreciate just how elegantly structured Will's simulation designs were. The multi-resolution data maps, the carefully orchestrated simulation loop, the statistical abstraction in the traffic system—all reflect a designer who understands that complexity emerges from simplicity when the rules are right.

## Separating Simulation from Game

One of Will's key insights was separating the core simulation from the overlaid game mechanics. This allows the simulation to maintain its integrity while providing different ways for players to engage.

> "One of the paradigms we've tried to use in designing these simulations is to think of them a little bit more as toys rather than games. That is, to leave them a little more open-ended."

## Influence on Modern Interface Design

Will's approach to user interfaces—particularly in making complex systems accessible—has parallels with the work of [Ben Shneiderman](/pages/about/ben-shneiderman) and [Brett Victor](/pages/about/brett-victor). Like Shneiderman's dynamic queries, SimCity's data visualization layers let players directly manipulate parameters and see immediate feedback. And like Victor's explorable explanations, Will's games make systems tangible and manipulable, closing the gap between thought and representation.

> "One of the things that we've tried pretty hard at, I think we've been pretty successful at, is keeping numbers out of the user's face. So whenever possible, we do these things graphically."

## Reverse Over-Engineering?

Will humorously noted that the intricate theories sometimes attributed to SimCity weren't always consciously implemented.

> "I just kind of optimized for game play." — when asked which urban planning theory informed SimCity

This highlights the emergent nature of the simulation—complex behaviors arising from relatively simple rules, often surprising even the creator.

## Legacy and Documentation

The documentation approach pioneered by [Stone Librande](/pages/about/stone-librande) at Maxis—distilling complex systems onto single, information-rich diagrams—feels like a natural extension of Will's own design sensibility: make the complex graspable without oversimplifying.

Will Wright's legacy extends far beyond individual games. He championed a way of thinking about interaction, simulation, and learning that continues to inspire designers and educators today.

## My Journey with Will Wright

My relationship with Will Wright began long before we worked together. I was fascinated by SimCity from the moment I first played it, constructing elaborate theories about how it might be implemented. In 1996, I attended Will's talk at Terry Winograd's user interface class at Stanford, where he demonstrated an early version of what would eventually become The Sims (then called "Dollhouse"). The demonstration was so compelling that when the opportunity arose to join Will at Maxis, I jumped at the chance. We worked together for three years on The Sims, finally releasing it in 2000 after several name changes (TDS, Project-X, Jefferson, and others).

What's remarkable about Will is his ability to see game design through a completely different lens than most developers. While the industry was (and often still is) focused on the "movie model" of game development—big budgets, massive marketing, blockbuster releases—Will envisioned games as hobbies that players could collect, expand, and personalize. As he explained in his Stanford talk:

> "What we've tried to do is to build our games more as a hobby model. Where people buy and collect things, but they relate to the last things they collected. It's like a train set. You build this train set, and some people get into building the hills, and the cliffs, and the mountains, and the trees, really detailed. They could care less about the train. Other people get into the village, or the track switching, and the scheduling. Everybody can kind of come into that, take their particular slant on it, their interest, and focus in that area in great detail."

This philosophy was evident in everything from SimCity to The Sims, and it's a perspective that fundamentally shaped my own approach to software design.

## The Stanford Talk: Witnessing Dollhouse Before The Sims

In April 1996, I attended a seminar at Stanford University where Will Wright gave a talk to Terry Winograd's class on user interface design. This turned out to be a pivotal moment in my career, though I couldn't have known it at the time. As a programmer already deeply interested in SimCity, I was eager to hear directly from its creator.

Will's talk was comprehensive—he demonstrated SimEarth, SimAnt, and SimCity 2000, explaining the design decisions, successes, and failures of each game. But what truly captivated me came at the end of his presentation when he revealed a project called "Dollhouse" in response to a student's question about what he was currently working on.

I watched in amazement as Will demonstrated this early prototype of what would eventually become The Sims. He explained how you could zoom into a SimCity map all the way to the street level, build houses, and control little people who interacted with objects in their environment:

> "This is a game I call Dollhouse. And if this looks familiar, it's because I've just loaded a SimCity file into here. Okay, so what we're seeing is a SimCity file, but now at this point I can actually zoom down to the street level."

What was most revolutionary was his description of the object-oriented AI system, where the intelligence wasn't in the people but distributed throughout the objects themselves. As Will explained:

> "What's interesting here is that that person, in the person's data structure, there's no knowledge of any objects in this environment whatsoever. The object itself contains the descriptions of how a person interacts with it, and why, what the animation sequence would be, and the scheduling."

The implications of this approach were profound:

> "So a person's in a room, they have certain motivations, needs, they might be hungry, sleepy, lonely, angry. They scan the room for people and objects, and the objects are all kind of advertising: 'If you're angry, pick up me and throw me!', 'If you're hungry, eat me!'"

I took detailed notes during this presentation, recording as much as I could about this remarkable concept. Over the following years, I would revisit these notes, expanding and refining them, especially after I joined Maxis in 1997 to work with Will on The Sims. The experience of seeing that early prototype, then later helping to transform it into a finished product, gave me a unique perspective on the evolutionary process of game design.

In 2023, nearly 27 years later, I was thrilled to discover that Stanford University had preserved and digitized the video recording of Will's original talk. Watching it again was like stepping into a time machine—there was Will, demonstrating concepts that would go on to revolutionize simulation games, and there was the student audience experiencing it for the first time, just as I had.

The talk stands as a fascinating historical document that captures Will's design philosophy in its formative stages, particularly his emphasis on games as hobbies rather than one-time experiences, and his revolutionary approach to distributed AI. It also serves as a reminder of how visionary his ideas were, well before The Sims became one of the most successful game franchises of all time.

## From SimCity to The Sims

In his Stanford talk, Will explained how his earlier games informed each other:

> "After designing SimCity Classic, then SimEarth, then SimAnt, then SimCity 2000, here's one way Will compares them: With SimCity Classic as the standard against which to measure, SimEarth was too complex, SimAnt was too simple, and SimCity 2000 was just right."

He elaborated on each game's weaknesses and strengths:

> "SimEarth and SimAnt did not support the same level of creativity and personal imprinting that SimCity does. With SimEarth, anything you do is quickly wiped out by continental drift, erosion, and evolution; you can walk away from it for a while, come back later, and it will have evolved life or shriveled up and died without you, looking pretty much the same as if you had slaved over it for hours."

The evolution toward The Sims represented a natural progression in Will's thinking about simulation. If SimCity let you build cities, why not zoom all the way down to the people living in them? Will described this connection in his Stanford talk:

> "Okay, so what we're seeing is a SimCity file, but now at this point I can actually zoom down to the street level...It's very feasible for us to put a database in for every building in SimCity, so that I could actually walk anywhere in the city I've created, and into any building."

The genius of The Sims' design was distributing the AI throughout the environment rather than centralizing it in the characters. Will emphasized how radically different this approach was:

> "Well what's cool is that the behavior is entirely distributed in the environment. So a person's in a room, they have certain motivations, needs, they might be hungry, sleepy, lonely, angry. They scan the room for people and objects, and the objects are all kind of advertising: 'If you're angry, pick up me and throw me!', 'If you're hungry, eat me!'"

This object-centric approach enabled unprecedented extensibility:

> "The cool thing about this is that we can drop new objects in later. Maybe it's network based, or maybe it's something else. We can even have tools where the users build these objects. Maybe one person is totally into designing furniture, or designing exercise equipment, I don't know what, exercise videos. But if we had a tool to where the user could build these things, they could then post them on the net, and other people could download them, and then the environment gets more rich."

This vision perfectly aligned with Will's broader vision of games as hobbies rather than one-time experiences.

## A New Paradigm for Game Design

Will Wright questioned and reformulated many widely-held assumptions about games:
- The audience (both sexes and all ages and persuasions)
- Perspective (overhead god view instead of first person)
- Navigation (per-character routing instead of direct control)
- The relationship between players and characters (switching between many instead of one-to-one)
- AI approach (object-centric, extensible plug-ins)
- Programming tools (visual programming instead of text scripts)
- Game play motivation (creative sandbox rather than competition)

His approach to The Sims particularly challenged gaming conventions:

> "This is actually a very similar data structure to Doom. I could be in here in a 3D point of view, shooting the person on the toilet if I wanted to. Maybe it's a different game player in a different game, but still running off the same server."

Will understood that players use games not just as systems to manipulate but as media to tell stories:

> "Everybody's taking a linear path through this, and they're basically, most people will attempt to understand things like this with a story. They'll think about 'I did this, then that happened, because of that', and so the story becomes kind of their logical connection, their logical reverse engineering, of the simulation that they're playing inside of."

These innovations created a new paradigm that has influenced countless games since. The ripple effects of Will's design philosophy can be seen in everything from modern city-builders to life simulators to creative platforms like Minecraft.

Looking at the design diagrams created by [Chaim Gingold](/pages/about/chaim-gingold), we can appreciate just how elegantly structured Will's simulation designs were. The multi-resolution data maps, the carefully orchestrated simulation loop, the statistical abstraction in the traffic system—all reflect a designer who understands that complexity emerges from simplicity when the rules are right.

## Influence on Modern Interface Design

Will's approach to user interfaces—particularly in making complex systems accessible—has parallels with the work of [Ben Shneiderman](/pages/about/ben-shneiderman) and [Brett Victor](/pages/about/brett-victor). Like Shneiderman's dynamic queries, SimCity's data visualization layers let players directly manipulate parameters and see immediate feedback. And like Victor's explorable explanations, Will's games make systems tangible and manipulable, closing the gap between thought and representation.

In his talk, Will shared his philosophy on interface design:

> "One of the things that we've tried pretty hard at, I think we've been pretty successful at, is keeping numbers out of the user's face. So whenever possible, we do these things graphically. So just noticing here how few numbers you see, but yet we're trying to display a lot of information about the planet."

The documentation approach pioneered by [Stone Librande](/pages/about/stone-librande) at Maxis—distilling complex systems onto single, information-rich diagrams—feels like a natural extension of Will's own design sensibility: make the complex graspable without oversimplifying.

Will's fascination with simulations began with physical models, which influenced his approach to computer simulations:

> "I spent a lot of time building models when I was a kid. Way too much time building models when I was a kid. And I really was fascinated by the idea of these kind of Micro Systems, models, micro worlds, whatever. So when I got a computer in my early 20s, a friend of mine talked me into buying one, I very quickly realized how cool the computer was as a modeling tool. The computer all of a sudden allows you to start modeling process in addition to just structure."

In our current work on the WebAssembly version of Micropolis, I'm striving to honor Will's legacy by making the simulation's systems not just playable but genuinely understandable through direct manipulation and visual exploration. We're bringing Chaim's reverse engineering diagrams to life as interactive tools, creating what I hope Will would recognize as a worthy evolution of his original vision—a simulation that teaches not by telling, but by letting players discover through play.

He also mentions Stone Librande's diagrams of SimCity's simulation loop, which Stone published in his GDC 2006 presentation [Game Design Reboot](https://stonetronix.com/gdc2006/gdreboot.pdf). Stone's diagrams clearly illustrate the complex simulation architecture ([PDF Slides Link](https://stonetronix.com/gdc2006/gdreboot.pdf)), aligning with the educational goals of constructionist learning environments. Explore more about Stone's insights on the [Stone Librande page](/pages/about/stone-librande).

### Chaim Gingold's Analysis

Chaim Gingold's PhD dissertation, "[Play Design](https://pqdtopen.proquest.com/doc/304817380.html?FMT=AI)," extensively analyzes SimCity, providing deep insights into its design and player experience. Gingold discusses how players interact with the simulation's underlying mechanics, referencing Wright's design philosophies. Read more on the [Chaim Gingold page](/pages/about/chaim-gingold).

### Influence of Brett Victor

Brett Victor's work on dynamic visual representations and explorable explanations resonates with the design principles evident in SimCity. Victor advocates for tools that make complex systems understandable and manipulable, a concept Wright implemented effectively in his game. Learn about Victor's ideas on the [Brett Victor page](/pages/about/brett-victor).

### Connections to Constructionist Education

SimCity's design aligns with principles of [Constructionist Education](/pages/about/constructionist-education), particularly Seymour Papert's ideas about learning through building and exploration. The game serves as a microworld where players can experiment with urban planning concepts. 