---
title: Will Wright
header: "Will Wright: SimCity Creator"
description: 🎮️ Meet the visionary game designer who originally created **SimCity**, **Spore**, and **The Sims**.
---

**Will Wright** is more than just the creator of [**SimCity**](#); he's a pioneer who redefined what video games could be. His approach blends deep **simulation**, **emergent complexity**, and player creativity into experiences that are as much about learning and discovery as they are about play.

> "I'm more interested in the possibilities of players discovering their own stories within the simulation."

## Educational Impact {#educational-impact}

Perhaps what I ([**Don Hopkins**](/pages/about/don-hopkins)) admire most about Will's approach to simulation games is how they've bridged entertainment and education without ever feeling didactic. As noted in the [**Constructionist Education**](/pages/constructionist-education) page, **SimCity** embodies **constructionist** principles without explicitly trying to. Players learn through creative experimentation rather than being taught directly.

> "The actual end product of **SimCity** is not the shallow model of the city running in the computer. More importantly, it's the deeper model of the real world, and the intuitive understanding of **complex dynamic systems**, that people learn from playing it."

> "Adults, primarily ones that kind of grew up before the computer generation really got into full swing, when they're put in front of a computer, they're afraid of failure. Generally they're timid, they're very, they think twice before they click a button. They don't just try anything, whereas kids, they fail all the time. They kind of like failure. The failure doesn't bother them, because they're always failing. When you see a kid build a tower of blocks, they'll build it, and they'll knock it down. Oh it's fun! What's important for the kid is that the failure mode is fun and interesting, okay? What kids don't like is a boring failure mode."

## The Anatomy of Simulation Games {#the-anatomy-of-simulation-games}

Will often speaks about the underlying structure of his simulations. It's not just about coding a model; it's about designing a system that players can intuitively grasp and explore. His fascination began with physical models:

> "I spent a lot of time building models when I was a kid. Way too much time building models when I was a kid. And I really was fascinated by the idea of these kind of **Micro Systems**, models, **micro worlds**, whatever... When I got a computer... I very quickly realized how cool the computer was as a modeling tool. The computer all of a sudden allows you to start modeling **process** in addition to just **structure**."

He emphasized the tight coupling between the core components: the **simulation model**, the **game play**, the **user interface**, and the **user's mental model**. Critically, he viewed the computer simulation not as the end product, but as a tool—a "**compiler for the mental model**"—to build understanding in the player's head. This philosophy aligns strongly with **Seymour Papert's** [**Constructionism**](/pages/constructionist-education), where learners build knowledge by creating tangible, personally meaningful microworlds.

The visual design of **The Sims** also played a key role in engaging the player's mind. Lead Artist **Ocean Quigley** conceived of the "holodeck" approach—a hybrid 2D/3D system using pre-rendered sprites with Z-buffering for the environment and objects, combined with live-rendered 3D polygonal characters. This dovetailed perfectly with **Scott McCloud's** concept of "**Masking**" from *Understanding Comics*, where simpler, iconic characters set against realistic backgrounds enhance player identification and immersion.

> [Paraphrasing McCloud:] Abstract characters invite identification.

This aesthetic choice wasn't just stylistic; it was functional, enhancing the player's emotional connection and identification—key elements in building that crucial mental model. It also dovetailed with the technical approach, as simpler characters were easier to render and customize, facilitating user creation.

This technical choice was also a crucial factor in the game's accessibility. By using a hybrid 2D/3D engine that didn't require a dedicated 3D graphics accelerator, **The Sims** could run well on the lower-end PCs common at the time—often hand-me-downs inherited by younger siblings. This deliberately broadened the potential audience beyond the typical hardcore gamer with expensive hardware, proving that compelling computer games weren't just for an exclusive club.

This resonates with the philosophical questions raised in Stanislaw Lem's *The Cyberiad*. When Trurl defends his boxed kingdom as just electrons, Klapaucius counters that observed behavior defines the reality of the experience for the simulated beings, just as the player's mental model defines the reality of the game:

> "Come now, don't pretend not to understand... a sufferer is not one who hands you his suffering... a sufferer is one who behaves like a sufferer!" — **Klapaucius**, *The Seventh Sally*

This meant the interface and gameplay couldn't be afterthoughts:

> "I can't just design the interface after the game's done, or design the game in isolation from the interface. Each one of these supports the other... So to me these three kind of go in this dynamic process and design together."

Looking at the [**design diagrams**](/pages/reverse-diagrams) created by [**Chaim Gingold**](/pages/about/chaim-gingold) (featured in his book "[**Building SimCity**](/pages/building-simcity)" and on the [**Reverse Diagrams**](/pages/reverse-diagrams) page), we can appreciate just how elegantly structured Will's simulation designs were. The [**multi-resolution data maps**](/pages/reverse-diagrams#maps), the carefully orchestrated [**simulation loop**](/pages/reverse-diagrams#simulation-loop), the statistical abstraction in the [**traffic system**](/pages/reverse-diagrams#make-traffic)—all reflect a designer who understands that complexity emerges from simplicity when the rules are right.

## Separating Simulation from Game {#separating-simulation-from-game}

One of Will's key insights was separating the core simulation from the overlaid game mechanics. This allows the simulation to maintain its integrity while providing different ways for players to engage.

> "One of the paradigms we've tried to use in designing these simulations is to think of them a little bit more as **toys** rather than games. That is, to leave them a little more open-ended."

## Influence on Modern Interface Design {#influence-on-modern-interface-design}

Will's approach to **user interfaces**—particularly in making complex systems accessible—has parallels with the work of [**Ben Shneiderman**](/pages/about/ben-shneiderman) and [**Brett Victor**](/pages/about/brett-victor). Like Shneiderman's [**dynamic queries**](/pages/about/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder), **SimCity's** data visualization layers let players directly manipulate parameters and see immediate feedback. And like Victor's [**explorable explanations**](/pages/about/brett-victor#revolutionary-approach-to-interface-design), Will's games make systems tangible and manipulable, closing the gap between thought and representation.

> "One of the things that we've tried pretty hard at, I think we've been pretty successful at, is keeping numbers out of the user's face. So whenever possible, we do these things graphically."

## Reverse Over-Engineering? {#reverse-over-engineering}

Will humorously noted that the intricate theories sometimes attributed to **SimCity** weren't always consciously implemented.

> "I just kind of optimized for game play." — when asked which urban planning theory informed **SimCity**

This highlights the **emergent** nature of the simulation—complex behaviors arising from relatively simple rules, often surprising even the creator. It also touches on the philosophical questions about the nature of simulation itself, famously debated by Trurl and Klapaucius in *The Seventh Sally*:

> Trurl: "...these births, loves, acts of heroism and denunciations are nothing but the minuscule capering of electrons in space, precisely arranged by the skill of my nonlinear craft..."
>
> Klapaucius: "And if I were to look inside your head, I would also see nothing but electrons... Prove to me here and now... that they do not feel... Prove that you only imitated suffering, and did not create it!"

Will often sidestepped this deep philosophical debate by focusing on the *player's perception* and the goal of creating an engaging experience. As he noted about educators wanting the simulation's internals exposed:

> "what's really going on inside is not as realistic as they would want to believe... it tries to fool people into thinking it's doing more than it really is, by taking advantage of the knowledge and expectations people already have... **Implication is more efficient than simulation**."

This pragmatic focus on the user's mental model and gameplay optimization, rather than perfect realism or provable internal consciousness, is a key aspect of his design philosophy, detailed further in [**Chaim Gingold's**](/pages/about/chaim-gingold) "[**Building SimCity**](/pages/building-simcity)".

## Legacy and Documentation {#legacy-and-documentation}

The documentation approach pioneered by [**Stone Librande**](/pages/about/stone-librande) at **Maxis**—distilling complex systems onto single, information-rich [**one-page designs**](/pages/about/stone-librande#revolutionary-documentation-approach)—feels like a natural extension of Will's own design sensibility: make the complex graspable without oversimplifying.

A prime example of this visual distillation was Will's own one-page design document for **Spore**, which he famously [leaked to **Wired Magazine**](https://donhopkins.medium.com/the-future-of-content-will-wrights-spore-demo-at-gdc-3-11-2005-568857a2e6e9) a year before the game was officially announced, effectively hiding his grand vision in plain sight.

**Will Wright's** legacy extends far beyond individual games. He championed a way of thinking about interaction, simulation, and learning that continues to inspire designers and educators today.

## My Cyberiadic Sallies with Will Wright {#my-cyberiadic-sallies}

My ([**Don Hopkins**](/pages/about/don-hopkins)) collaborations with **Will Wright** have spanned decades and numerous adventures — or "sallies," in the spirit of Stanislaw Lem's constructors Trurl and **Klapaucius** from *The Cyberiad* (an alias Will himself has used online and a **Sims** cheat code!). Bringing Will's **Klapaucius**-like visions to life often involved collaborators, myself included alongside others like [**Chaim Gingold**](/pages/about/chaim-gingold) and [**Stone Librande**](/pages/about/stone-librande), taking on roles akin to the pragmatic Trurl in realizing those ambitious designs. These sallies began with porting [**SimCity**](/pages/micropolis-license) to **Unix** in the early 90s, continued through our work on [**The Sims**](/pages/about/will-wright#from-simcity-to-the-sims) at **Maxis**, and extended over many years through projects at his think tanks and companies like the **Stupid Fun Club**, **Syntertainment**, and **Gallium**.

The **Stupid Fun Club**, established in a Berkeley warehouse, served as a unique "think tank and an incubator" funded by Will, where collaborators like filmmaker **Michael Winter** and designer **Marc Thorpe** explored cross-media entertainment blending robotics, games, TV, and toys. This often involved fascinating experiments exploring human-robot interaction and psychology, sometimes using teleoperation or simulated personalities (like the **Slats** robot brain I programmed) for reality TV concepts.

Examples included short hidden-camera films like "[Empathy](https://www.youtube.com/watch?v=KXrbqXPnHvE)" (featuring a broken robot soliciting help, revealing different reactions based on gender dynamics – women were creeped out, men tried to strip it for parts, but couples helped) and "[Servitude](https://www.youtube.com/watch?v=NXsUetUzXlg)" (with an inept robot waiter). These explorations reflected Will's deeper interest:

> "Robots for me are models of various physical and mental human abilities... The big attraction is, in trying to build one of those things, you learn a lot about humans. The human mind is by far the most complex thing in the known universe..." — **Will Wright** (on Stupid Fun Club)

Other concepts explored included the "**Chatbots**" project, envisioning interconnected talking dolls like "'Toy Story' come to life," and the ambitious but unproduced "**M.Y. Robot**" TV pilot set in feudal Japan with puppets and anime overlays. These ventures, while not all resulting in commercial products, embodied the creative, experimental spirit characteristic of Will's approach.

I was fascinated by **SimCity** from the moment I first played it, and that fascination led me to attend his pivotal 1996 talk at **Stanford**, detailed below, which proved instrumental in my career path.

Witnessing his early demonstration of "**Dollhouse**" (which would become **The Sims**) and his explanation of its revolutionary subject-oriented design was incredibly compelling. When the opportunity arose a year later to join Will at **Maxis**, I jumped at the chance. We worked together for three years on **The Sims**, finally releasing it in 2000 after several name changes (**TDS**, **Project-X**, **Jefferson**, and others).

What's remarkable about Will is his ability to see game design through a completely different lens than most developers. While the industry was (and often still is) focused on the "**movie model**" of game development—big budgets, massive marketing, blockbuster releases—Will envisioned games as **hobbies** that players could collect, expand, and personalize. This philosophy was evident in everything from **SimCity** to **The Sims**, and it's a perspective that fundamentally shaped my own approach to software design.

## The Stanford Talk: Witnessing Dollhouse Before The Sims {#stanford-talk}

In April 1996, I attended a seminar at **Stanford University** where **Will Wright** gave a talk to **Terry Winograd's** class on **user interface design**. This turned out to be a pivotal moment. As a programmer already deeply interested in **SimCity**, I was eager to hear directly from its creator.

Will's talk was comprehensive—he demonstrated **SimEarth**, **SimAnt**, and **SimCity 2000**, explaining the design decisions, successes, and failures of each game. But the truly captivating moment came during the Q&A.

In response to a student's direct question about his current projects, Will seemed momentarily taken aback before deciding to reveal something genuinely groundbreaking:

> **Student:** What projects are you working on now, and if you'd rather not talk about that, what projects or models had you considered before that were kind of interesting that you didn't do?
>
> **Will Wright:** You mean like what systems have I considered modeling?
>
> **Student:** Right.
>
> **Will Wright:** Oh, God...
>
> **Student:** And also what systems are you currently working on, if you if you can talk about them?
>
> **Will Wright:** Okay, well one thing we're working on, is a — we've been kind of interested in our company for a long time about the idea of data portability. Really, let me back up just a little bit here, and this might be a little bit more of an answer than you were looking for, but…

He then proceeded to demonstrate an early prototype of what would become **The Sims**, at the time called "**Dollhouse**."

> "This is a game I call **Dollhouse**. And if this looks familiar, it's because I've just loaded a **SimCity** file into here. Okay, so what we're seeing is a **SimCity** file, but now at this point I can actually zoom down to the street level."

I watched in amazement as he showed zooming from a familiar **SimCity** map down to the street level, placing a house foundation, walls, and even a little person he could control like a puppet.

> "This is me. I'm actually controlling this person like a puppet. I can wave, and walk around, and do things... I can actually walk anywhere in the city here... It's very feasible for us to put a database in for every building in **SimCity**, so that I could actually walk anywhere in the city I've created, and into any building."

This vision of connecting the macro (city) and micro (individual life) scales, using the familiar **SimCity** as a base but diving into architectural tools and personal interaction, was revolutionary.

In 2023, nearly 27 years later, I was thrilled to discover that **Stanford University** had preserved and digitized the video recording of Will's original talk. Watching it again was like stepping into a time machine—there was Will, demonstrating concepts that would go on to revolutionize simulation games, and there was the student audience experiencing it for the first time, just as I had.

[Link to Stanford Video: Will Wright — Maxis — Interfacing to Microworlds — 1996–4–26](https://www.youtube.com/watch?v=nsxoZXaYJSk)

## From SimCity to The Sims {#from-simcity-to-the-sims}

> "After designing **SimCity Classic**, then **SimEarth**, then **SimAnt**, then **SimCity 2000**, here's one way Will compares them: With **SimCity Classic** as the standard against which to measure, **SimEarth** was too complex, **SimAnt** was too simple, and **SimCity 2000** was just right."

He elaborated on the challenges, particularly with **SimEarth**'s overwhelming complexity and lack of player impact:

> "**SimEarth** and **SimAnt** did not support the same level of creativity and personal imprinting that **SimCity** does. With **SimEarth**, anything you do is quickly wiped out by **continental drift**, **erosion**, and **evolution**; you can walk away from it for a while, come back later, and it will have evolved life or shriveled up and died without you, looking pretty much the same as if you had slaved over it for hours." 
>
> "It was too complex a simulation for people to grasp or effect in a satisfying way. The time scale slows down as the game progresses... There was some trouble conveying this to the users."

He also critiqued **SimEarth**'s user interface, which suffered from trying to display too much information within the screen constraints of the time:

> "One of the things about this interface that we later came back and looked at it and kind of said, it's so information dense... At that time, we were very concerned with information density: how much could we display without the user having to bring up another window, or obscure what they're seeing. So consequently, most of our interfaces came out kind of like these really fancy car stereos with the billion and a half buttons, you know? ... But then you're driving down the road, you just want to hear music, okay? So you get totally lost with all the buttons. After finishing this program, I started feeling that this was kind of the fancy car stereo. Maybe we could have been a little less dense on it."

**SimAnt**, conversely, was too simple for the core gamer market, though popular with kids. **SimCity 2000** achieved a better balance, integrating multiple views into one window with zooming and using floating palettes, a step towards the interface paradigm used in **The Sims**.

The evolution toward **The Sims** represented a logical next step: connecting the city scale to the individual lives within it. The genius of its design, unveiled in the 1996 **Dollhouse** demo, was distributing the **AI** throughout the environment:

> "What's interesting here is that that person, in the person's data structure, there's no knowledge of any objects in this environment whatsoever. The object itself contains the descriptions of how a person interacts with it, and why, what the animation sequence would be, and the scheduling."
>
> "Well what's cool is that the behavior is entirely distributed in the environment. So a person's in a room, they have certain motivations, needs... They scan the room for people and objects, and the objects are all kind of advertising: 'If you're angry, pick up me and throw me!', 'If you're hungry, eat me!'"

This **object-centric approach** was fundamental. It enabled emergent behavior and the **extensibility** crucial to Will's "**hobby model**" philosophy:

> "Most of the game industry right now is built on kind of the movie model... What we've tried to do... is to build our games more as a **hobby model**. Where people buy and collect things, but they relate to the last things they collected. It's like a train set... Everybody can kind of come into that, take their particular slant on it, their interest, and focus in that area in great detail."
>
> "The cool thing about this [object-centric AI] is that we can drop new objects in later... We can even have tools where the users build these objects... they could then post them on the net, and other people could download them, and then the environment gets more rich."

This vision of a game as an extensible hobby, powered by user creativity and object-based simulation, was groundbreaking and laid the foundation for **The Sims'** massive success.

The genius of its design, unveiled in the 1996 **Dollhouse** demo, was distributing the **AI** throughout the environment. This object-centric approach was present even in the earliest prototypes, like the simple C code Will wrote in January 1997 ("[The Soul of The Sims](https://www.donhopkins.com/home/images/Sims/)") to model the core motives (Hunger, Energy, Bladder, etc.) and their decay over time.

By the time of the [1998 Steering Committee Demo](https://www.youtube.com/watch?v=zC52jE60KjY), this object-oriented philosophy was deeply integrated with a visual programming language called "**SimAntics**," edited with a tool codenamed "**Edith**." The demo I recorded briefly showcased Edith, revealing how behaviors were literally programmed *into* objects using node-based trees:

> "...if you now look at the aquarium and behavior and you have a feed fish behavior and oh there's the program for feeding fish... go to a routing slot... are the fish feeding... are they hungry... make a aquarium feeding sound... set state feeding..."

This internal tool visually represented the logic Will described in 1996:

> "The object itself contains the descriptions of how a person interacts with it, and why, what the animation sequence would be, and the scheduling... The object tells it what to do."

**Edith/SimAntics** was the engine driving the emergent behavior and was intended, at one point, for release to users to create their own complex object behaviors. However, **EA** ultimately did not allow its public release.

## A New Paradigm for Game Design {#a-new-paradigm-for-game-design}

**Will Wright** questioned and reformulated many widely-held assumptions about games:
- The audience (all genders and ages and persuasions)
- Perspective (overhead god view instead of first person)
- Navigation (per-character routing instead of direct control)
- The relationship between players and characters (switching between many instead of one-to-one)
- **AI** approach (**object-centric**, extensible plug-ins)
- Programming tools (visual programming instead of text scripts)
- Game play motivation (creative **sandbox** rather than competition)

His approach to **The Sims** particularly challenged gaming conventions:

> "This is actually a very similar data structure to **Doom**. I could be in here in a **3D point of view**, shooting the person on the toilet if I wanted to. Maybe it's a different game player in a different game, but still running off the same server."

Will understood that players use games not just as systems to manipulate but as media to tell stories:

> "Everybody's taking a linear path through this, and they're basically, most people will attempt to understand things like this with a story. They'll think about 'I did this, then that happened, because of that', and so the story becomes kind of their logical connection, their logical **reverse engineering**, of the simulation that they're playing inside of."

These innovations created a new paradigm that has influenced countless games since. The ripple effects of Will's design philosophy can be seen in everything from modern city-builders to life simulators to creative platforms like **Minecraft**.

Looking at the [**design diagrams**](/pages/reverse-diagrams) created by [**Chaim Gingold**](/pages/about/chaim-gingold) (as detailed in "[**Building SimCity**](/pages/building-simcity)"), we can appreciate just how elegantly structured Will's simulation designs were. The [**multi-resolution data maps**](/pages/reverse-diagrams#maps), the carefully orchestrated [**simulation loop**](/pages/reverse-diagrams#simulation-loop), the statistical abstraction in the [**traffic system**](/pages/reverse-diagrams#make-traffic)—all reflect a designer who understands that complexity emerges from simplicity when the rules are right.

## Storytelling, Language, and Extensibility {#storytelling-language-extensibility}

A key insight from the Stanford talk was Will's realization of how players project narratives onto simulations. He saw games not just as systems, but as platforms for player stories, referencing **Stanislaw Lem's** sci-fi story "**The Seventh Sally**" from *The Cyberiad* as an inspiration. In the story, the constructor Trurl builds a miniature kingdom in a box for a deposed tyrant:

> "Trurl built the king an entirely new kingdom... and he gave the women of that kingdom beauty, the men—sullen silence and surliness when drunk, the officials—arrogance and servility, the astronomers—a strange enthusiasm for stars, and the children—a great capacity for noise. And all of this... fit into a box... This Trurl presented to Excelsius, to rule and have dominion over forever... instructed him in the critical points and transition states... how to program wars, quell rebellions, exact tribute, collect taxes..."
>
> "I think to me that's kind of why I do a lot of this." — **Will Wright** (on *The Seventh Sally*)

Will observed how players would often create their own causal links between unrelated events in **SimCity**:

> "something happens in SimCity and they said \'oh I was running my nuclear reactor near the red line... this plane crashed, and because of that, this and that happened\', and they\'ll describe this long causal chain of events that I know does not exist... they\'re convinced it exists... There\'s a parallel simulation going on here in the game... the story becomes kind of their logical connection, their logical **reverse engineering**, of the simulation that they\'re playing inside of."

This phenomenon, which Will termed the "**Simulator Effect**," highlights how players actively build their own understanding and narratives, often imagining far more complexity than exists in the actual code. This underscores **Ian Bogost\'s** concept of **Procedural Rhetoric**: games persuade and convey ideology not just through explicit narrative, but through their underlying rules and processes. The *experience* of playing within the simulation\'s rules leads players to construct beliefs about how that system (and potentially the real world it represents) works, sometimes independently of the designer\'s explicit intent. Will embraced this, recognizing that ambiguity could be a powerful tool for engaging player imagination:

> \"Try to understand, there was no other way to do it! Anything that would have destroyed in the littlest way the illusion of complete reality, would have also destroyed the importance, the dignity of governing, and turned it into nothing but a mechanical game.\" — **Trurl**, *The Seventh Sally*

This story perfectly encapsulates why **Simlish** and the **object-oriented AI** worked: they provided structure and cues, but left ample room for player imagination and storytelling. This dovetailed with the internal **Edith**/**SimAntics** visual programming tools, which allowed developers (and ideally, would have allowed players) to encode behaviors into objects, further supporting emergent interactions.

This foresight into the power of **user-generated content** and **modding communities**, enabled by both internal planning and later external tools, was crucial to the longevity and cultural impact of **The Sims**.

## Design Process, Playtesting, and Player Psychology {#design-process-psychology}

Will's 1996 talk also offered glimpses into his design process and keen observations on player psychology.

He noted the near-universal tendency for players, when first encountering a simulation like **SimCity**, to test its limits through destruction (the "**Calvin Syndrome**"), which led to the inclusion of the **disaster menu**:

> "The first thing they would do is they would find the bulldozer... and then they'd start attacking the city... It was kind of like poking an ant colony with a stick... They had to perturb the system to get a sense of is it fragile or not... testing the validity of the simulation by poking at it... It's almost like they had to get the destruction out of their system first, before they appreciated [building]."

He contrasted adult and child approaches to failure, noting that engaging failure modes are key to learning:

> "Adults... are afraid of failure... whereas kids, they fail all the time. They kind of like failure... What's important for the kid is that the failure mode is fun and interesting, okay? What kids don't like is a boring failure mode... that's... one of the reasons they learn so fast. They're not afraid to fail, and the failure is really the basis of their learning."

His playtesting approach was informal and people-centric, valuing direct observation over formal process:

> "most of what we do... the most value, comes from informal testing, showing new people. I've got a nine-year-old daughter, I show her all the time, her friends come in, I show them, I show it to adults... the adults really are a good test for [interface confusion]."

He championed a singular design vision:

> "I've never seen a product design through a committee that came out well. You really have to have one vision, I think, behind it... It's really hard to communicate that vision."

Finally, he observed the powerful social dimension of gameplay:

> "[My daughter] almost never plays computer games... by herself. But if a friend's over they'll both play them... it's the dialogue between the two that really makes the game interesting... the game is facilitating a social interaction... it's kind of like social currency that I'm passing around, this knowledge I have about the system."

These observations underscore the importance of designing not just systems, but experiences that resonate with human psychology, facilitate social connection, and empower learning through play and experimentation.

A key aspect of designing for player psychology is understanding the power of ambiguity and imagination, a lesson Will illustrated with the anecdote of the "**Julie Doll**":

> "There was actually a really interesting doll that this company came out with... the Julie doll... a \$250 doll with voice recognition... it would sit there and try and have stupid conversations with you... [Testers] put this in focus groups with girls. And they played with it for a while, and then after about a half an hour they take the batteries out, and keep playing with it... the girls were propping up this elaborate fantasy in their play, and the dolls were supposed to be a structure for that fantasy, they weren't supposed to be the fantasy. The doll was telling them what the fantasy was, and it was conflicting with what the girls were saying... interfering actively with their fantasy and their play."

This highlighted the danger of overly prescriptive systems and reinforced the value of leaving space for the player's own narrative construction, a principle evident in features like **Simlish**.

## Inclusivity by Design (and Serendipity) {#inclusivity-by-design}

Beyond the technical innovations, **The Sims** broke ground with its inclusive representation of relationships, a feature that significantly contributed to its broad appeal and cultural impact. While not initially planned with the depth it eventually achieved, the potential was recognized early on.

In my review of an early design document (August 1998), I noted the limitation to heterosexual romance and the problematic "violent negative interaction" coded for same-sex attempts:

> "The whole relationship design and implementation... is Heterosexist and Monosexist... We are going to be expected to do better than that after the SimCopter fiasco..." — Don Hopkins, Design Document Review, 1998

Subsequent design documents acknowledged this, stating, "*Currently the game only allows heterosexual romance. This will not be the only type available... Will is reviewing the code and will make recommendations for how to implement homosexual romance as well.*" Although Will didn't provide specific recommendations before implementation began, and programmer **Patrick J. Barrett III** hadn't seen my specific review comments when tasked with implementing social interactions, he independently took the initiative and implemented support for same-sex romantic interactions anyway. Reflecting the zeitgeist, it felt like an idea whose time had come. Crucially, his design didn't explicitly model sexual preference as a fixed trait but allowed it as an emergent behavior based on player-directed interactions and Sim-to-Sim relationship scores. This offered maximum player freedom and avoided problematic assumptions about the nature of sexual identity. This positive outcome underscores the importance of inclusive hiring practices; ensuring diverse life experiences **(including those of the many talented women on the team who were instrumental to the game's design and success)** are represented on the development team allows for more authentic and broadly appealing designs to emerge.

The impact became unexpectedly clear at the 1999 E3 trade show. During a live demo, two female Sims autonomously engaged in a passionate kiss, generating significant buzz and positive press coverage. As chronicled by **The New Yorker** in "[The Kiss That Changed Video Games](https://www.newyorker.com/tech/annals-of-technology/the-kiss-that-changed-video-games)", this moment, occurring shortly after the Columbine tragedy had intensified scrutiny on violent games, positioned **The Sims** as a refreshingly different, inclusive alternative.

This inclusive approach, allowing players to represent diverse relationships and families without judgment, resonated deeply, particularly within the LGBTQ+ community. As countless testimonials show (like those shared in Alex Avila's video essay, "[Did The Sims make you gay?](https://www.youtube.com/watch?v=Xi-HWyh0Ybk)"), the game provided a safe space for exploration and self-discovery for many young players.

This philosophy continued in later iterations. **The Sims 4**, for example, removed gender restrictions on clothing, hairstyles, voice, and even pregnancy roles, further decoupling physical frame from gender expression. This evolution reflects a commitment to allowing players to "model their own family structures whenever possible," as stated in early design goals.

**The Sims's** dedication to transgender game design pioneer **Danielle Bunten Berry** further underscores this connection.

Ultimately, the massive success of **The Sims** across demographics—appealing strongly to female players and diverse age groups often underserved by the mainstream industry—demonstrated the commercial and cultural power of inclusive design, even when achieved partly through serendipity and programmer initiative.

## Influence on Modern Interface Design

Will's approach to **user interfaces**—particularly in making complex systems accessible—has parallels with the work of [**Ben Shneiderman**](/pages/about/ben-shneiderman) and [**Brett Victor**](/pages/about/brett-victor). Like Shneiderman's [**dynamic queries**](/pages/about/ben-shneiderman#dynamic-queries-and-the-dynamic-zone-finder), **SimCity's** data visualization layers let players directly manipulate parameters and see immediate feedback. And like Victor's [**explorable explanations**](/pages/about/brett-victor#revolutionary-approach-to-interface-design), Will's games make systems tangible and manipulable, closing the gap between thought and representation.

In his talk, Will shared his philosophy on interface design:

> "One of the things that we've tried pretty hard at, I think we've been pretty successful at, is keeping numbers out of the user's face. So whenever possible, we do these things graphically. So just noticing here how few numbers you see, but yet we're trying to display a lot of information about the planet."

The documentation approach pioneered by [**Stone Librande**](/pages/about/stone-librande) at **Maxis**—distilling complex systems onto single, information-rich [**one-page diagrams**](/pages/about/stone-librande#revolutionary-documentation-approach)—feels like a natural extension of Will's own design sensibility: make the complex graspable without oversimplifying.

Will's fascination with simulations began with physical models, which influenced his approach to computer simulations:

> "I spent a lot of time building models when I was a kid. Way too much time building models when I was a kid. And I really was fascinated by the idea of these kind of **Micro Systems**, models, **micro worlds**, whatever. So when I got a computer in my early 20s, a friend of mine talked me into buying one, I very quickly realized how cool the computer was as a modeling tool. The computer all of a sudden allows you to start modeling process in addition to just structure."

In our current work on the [**WebAssembly version of Micropolis**](/pages/don-hopkins#current-work), I'm striving to honor Will's legacy by making the simulation's systems not just playable but genuinely understandable. We aim to open the "black box" that **Alan Kay** critiqued, revealing the "minuscule capering of electrons" not to prove or disprove their internal feeling (Klapaucius's challenge), but to allow players to understand, modify, and learn from the *rules* themselves through **direct manipulation** and visual exploration. We're bringing [**Chaim Gingold's**](/pages/about/chaim-gingold) [**reverse engineering diagrams**](/pages/reverse-diagrams) to life as interactive tools, creating what I hope Will would recognize as a worthy evolution of his original vision—a simulation that teaches not by telling, but by letting players discover through play. This involves drawing inspiration from the object-oriented, player-driven, and community-focused ideas Will discussed even back in 1996.

He also mentions [**Stone Librande's**](/pages/about/stone-librande) diagrams of **SimCity's** [**simulation loop**](/pages/reverse-diagrams#simulation-loop), which Stone published in his **GDC 2006** presentation [**Game Design Reboot**](https://stonetronix.com/gdc2006/gdreboot.pdf). Stone's diagrams clearly illustrate the complex simulation architecture ([**PDF Slides Link**](https://stonetronix.com/gdc2006/gdreboot.pdf)), aligning with the educational goals of [**constructionist** learning environments](/pages/constructionist-education). Explore more about Stone's insights on the [**Stone Librande page**](/pages/about/stone-librande).

### Chaim Gingold's Analysis

[**Chaim Gingold's**](/pages/about/chaim-gingold) **PhD dissertation**, "[**Play Design**](https://pqdtopen.proquest.com/doc/304817380.html?FMT=AI)," extensively analyzes **SimCity**, providing deep insights into its design and player experience. Gingold discusses how players interact with the simulation's underlying mechanics, referencing Wright's design philosophies. His book, "[**Building SimCity**](/pages/building-simcity)", expands on this work, including the invaluable [**reverse diagrams**](/pages/reverse-diagrams). Read more on the [**Chaim Gingold page**](/pages/about/chaim-gingold).

### Influence of Brett Victor

[**Brett Victor's**](/pages/about/brett-victor) work on **dynamic visual representations** and [**explorable explanations**](/pages/about/brett-victor#revolutionary-approach-to-interface-design) resonates with the design principles evident in **SimCity**. Victor advocates for tools that make complex systems understandable and manipulable, a concept Wright implemented effectively in his game, and a core goal for our **Micropolis** project. Learn about Victor's ideas on the [**Brett Victor page**](/pages/about/brett-victor).

### Connections to Constructionist Education

**SimCity's** design aligns with principles of [**Constructionist Education**](/pages/constructionist-education), particularly [**Seymour Papert's**](/pages/constructionist-education/seymour-papert) ideas about learning through building and exploration. **The Sims** amplified this by allowing players to construct not just cities, but homes, families, and stories—tangible microworlds reflecting their own lives and imaginations. The game serves as a [**microworld**](/pages/constructionist-education#connections-to-micropolis-and-influential-figures) where players actively build mental models through creation and experimentation. By making the simulation transparent and extensible—revealing the underlying rules and allowing modification—we hope to enhance its power as a **constructionist** tool, fulfilling the potential envisioned by **Papert** and aligning with **Alan Kay's** desire for more open systems, even potentially integrating it with visual programming environments like [**Snap!**](/pages/about/stone-librande#applying-one-page-design-to-micropolis).

## Fulfilling the Vision: Personal Reflections on The Sims and Beyond {#fulfilling-the-vision}

The ideas presented by **Will Wright** in his 1996 Stanford talk—particularly around object-oriented design, emergent behavior, storytelling, user creativity, and extensibility—had a profound and lasting impact on my own work ([**Don Hopkins**](/pages/about/don-hopkins)). Having attended that talk and later joining **Maxis** to work on **The Sims**, I felt a strong drive to help realize that groundbreaking vision.

My contributions focused heavily on empowering players. Beyond working on the core user interface, [**pie menus**](/pages/about/ben-shneiderman#pie-menus-an-empirical-innovation), architectural editing tools, and the in-house **3ds Max** character animation tools, I championed the creation and release of tools specifically for user-generated content (detailed further on the [**Don Hopkins page**](/pages/about/don-hopkins#contributions-and-innovations)).

Crucially, *before* The Sims was even released, we developed and distributed **SimShow**. This simple tool allowed players to create and preview their own bitmap-based Sim skins (heads, bodies, hands) and test them with various animations (dancing, waving, walking). This pre-release strategy was incredibly successful; on day one of The Sims launch, a vibrant community already existed, with numerous websites and **Yahoo Groups** dedicated to sharing custom skins and content.

Later, I developed and released the **Transmogrifier**, along with documentation and tutorials. This tool enabled users to clone existing items and modify their graphics and properties to create entirely new custom objects for the game, truly kickstarting the Sims modding scene. It empowered a generation of creators, who not only learned graphic design skills with tools like **PaintShop Pro** and **Photoshop** (far more accessible than the professional 3D tools like **3ds Max** or **Alias** used internally, though today powerful free tools like the amazing [**Blender**](https://www.blender.org/) have democratized 3D creation) but also delved into **XML** and eventually reverse-engineered object programming (**SimAntics**, the visual programming tool shown internally in the 1998 Steering Committee demo featuring the **Edith** editor, which Will wanted to release but **EA** wouldn't allow), developing their own tools like **IFFPencil2**.

Building on the **Transmogrifier**'s success, I created **RugOMatic**. As demonstrated in the video linked below, this tool leveraged the **Transmogrifier** behind the scenes but provided a super simple drag-and-drop interface. Users could just drag an image and type text to create custom rugs:

> (Video Demo Link: [Demo of The Sims Transmogrifier, RugOMatic, ShowNTell, Simplifier and Slice City](https://www.youtube.com/watch?v=Imu1v3GecB8))

A rug, with its associated catalog title and description, became an "**atomic storytelling unit**." Clicking on the rug in the game could display its story in a pop-up dialog via a pie menu, allowing players to embed narratives directly into their creations. A similar online tool dynamically generated custom tombstones with portraits, names, and epitaphs, further enabling player storytelling.

This explosion of **user-generated content**, facilitated by accessible 2D tools like **PaintShop Pro** and **Photoshop** (in contrast to the complex professional 3D tools like **3ds Max** or **Alias** used internally, though today powerful free tools like the amazing [**Blender**](https://www.blender.org/) have democratized 3D creation) and shared on platforms like **Yahoo Groups**, perfectly embodied the **Constructionist** ideal Will discussed. Thousands of fans, from kids to adults (I even knew a grandmother who preferred making Sims objects over knitting scarves for her grandchildren, playing alongside them!), formed vibrant communities dedicated to sharing creations, writing tutorials, and teaching each other. This peer-to-peer learning and collaborative creativity became a cornerstone of The Sims' enduring appeal. Among the most talented and prolific contributors were **[Heather "SimFreaks"](placeholder)** and **[Steve "SimSlice"](placeholder)** (whose mind-blowing **SliceCity** mod, shown in the demo video, impressively recreated SimCity *within* The Sims using SimAntics!), who met through the community and continue creating amazing content together, like their ambitious **[ZombieSims](placeholder)** project.

These efforts were a direct attempt to fulfill the potential Will articulated back in 1996—transforming the game from a closed product into an extensible hobby platform driven by player creativity and storytelling... That same spirit now guides the effort to open up **Micropolis**, finally aiming to integrate the simulation engine directly with accessible visual programming languages like [**Snap!**](/pages/about/stone-librande#applying-one-page-design-to-micropolis), realizing the full potential of a truly user-programmable microworld.

## Spore: Procedural Content and the Future {#spore-procedural-content}

Will's ambition to model complex systems culminated in **Spore** (2008). In his seminal [**2005 GDC talk, "The Future of Content"**](https://donhopkins.medium.com/the-future-of-content-will-wrights-spore-demo-at-gdc-3-11-2005-9eab0cedc583), Will unveiled his vision for procedural content generation as a way to overcome the limitations of handcrafted assets and empower players on an unprecedented scale.

> "What I learned about content from The Sims... and why it's driven me to procedural methods... And what I now plan to do with them."

**Spore** aimed to simulate life from a single cell to a galactic civilization, using procedural techniques to generate creatures, buildings, vehicles, and even animations based on player input and underlying rules. The goal was to give players immense creative leverage, where a small input (like shaping a creature's skeleton) could result in a vast amount of unique, playable content. This content could then be shared asynchronously, populating other players' universes.

Key ideas from the GDC demo included:

*   **Creative Amplification:** Using algorithms to expand player creativity (e.g., 1k player input generating 5MB of content).
*   **Cross-Genre Gameplay:** Breaking traditional genre boundaries, moving from **Pac-Man** (Tidepool) to **Diablo** (Creature) to **Populous** (Tribal) to **SimCity** (City) to **Civilization/Risk** (Space).
*   **Player as World-Builder:** Shifting the player's role from character to creator, akin to Lucas, Tolkien, or Dr. Seuss.
*   **Asynchronous Sharing:** Building a vast ecosystem by automatically sharing player-created content between games.
*   **Procedural Aesthetics:** Developing a unique visual style ("Pixar meets Giger") derived from the procedural generation process, guided by lead artist **Ocean Quigley**.

The ambition of **Spore**, particularly its reliance on procedural generation and user creativity, reflects Will's long-standing interest in emergent systems and pushing the boundaries of interactive entertainment. While the final game faced challenges in fully realizing this vision, the GDC demo remains a landmark presentation on the potential of procedural content.

## Design Process, Playtesting, and Player Psychology {#design-process-psychology}

Will's 1996 talk also offered glimpses into his design process and keen observations on player psychology.

He noted the near-universal tendency for players, when first encountering a simulation like **SimCity**, to test its limits through destruction (the "**Calvin Syndrome**"), which led to the inclusion of the **disaster menu**:

> "The first thing they would do is they would find the bulldozer... and then they'd start attacking the city... It was kind of like poking an ant colony with a stick... They had to perturb the system to get a sense of is it fragile or not... testing the validity of the simulation by poking at it... It's almost like they had to get the destruction out of their system first, before they appreciated [building]."

He contrasted adult and child approaches to failure, noting that engaging failure modes are key to learning:

> "Adults... are afraid of failure... whereas kids, they fail all the time. They kind of like failure... What's important for the kid is that the failure mode is fun and interesting, okay? What kids don't like is a boring failure mode... that's... one of the reasons they learn so fast. They're not afraid to fail, and the failure is really the basis of their learning."

His playtesting approach was informal and people-centric, valuing direct observation over formal process:

> "most of what we do... the most value, comes from informal testing, showing new people. I've got a nine-year-old daughter, I show her all the time, her friends come in, I show them, I show it to adults... the adults really are a good test for [interface confusion]."

He championed a singular design vision:

> "I've never seen a product design through a committee that came out well. You really have to have one vision, I think, behind it... It's really hard to communicate that vision."

Finally, he observed the powerful social dimension of gameplay:

> "[My daughter] almost never plays computer games... by herself. But if a friend's over they'll both play them... it's the dialogue between the two that really makes the game interesting... the game is facilitating a social interaction... it's kind of like social currency that I'm passing around, this knowledge I have about the system."

These observations underscore the importance of designing not just systems, but experiences that resonate with human psychology, facilitate social connection, and empower learning through play and experimentation.

A key aspect of designing for player psychology is understanding the power of ambiguity and imagination, a lesson Will illustrated with the anecdote of the "**Julie Doll**":

> "There was actually a really interesting doll that this company came out with... the Julie doll... a \$250 doll with voice recognition... it would sit there and try and have stupid conversations with you... [Testers] put this in focus groups with girls. And they played with it for a while, and then after about a half an hour they take the batteries out, and keep playing with it... the girls were propping up this elaborate fantasy in their play, and the dolls were supposed to be a structure for that fantasy, they weren't supposed to be the fantasy. The doll was telling them what the fantasy was, and it was conflicting with what the girls were saying... interfering actively with their fantasy and their play."

This highlighted the danger of overly prescriptive systems and reinforced the value of leaving space for the player's own narrative construction, a principle evident in features like **Simlish**. 