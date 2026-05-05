---
title: SimCityNet Multiplayer
header: "Multiplayer SimCityNet (1993)"
description: "🤝 Created a networked, cooperative multiplayer version based on the X11/TCL/Tk code."
---

SimCityNet was Don Hopkins' cooperative multiplayer version of SimCity for Unix/X11/TCL/Tk, released through DUX Software and demonstrated at InterCHI '93 in Amsterdam.

Its key design choice was cooperation rather than competition. Players shared the same city, budget, simulation state, and consequences. This turned multiplayer into governance: building a nuclear plant, airport, stadium, or seaport became a public decision, not just a private command.

The multiplayer interface explored:

- Shared city state across multiple workstations.
- Multiple views of the same running city.
- Chat and messages as coordination tools.
- Voting panels for expensive decisions.
- Ghosted or bouncing proposed buildings before commitment.
- Logs rich enough to replay and branch histories.

This lineage matters for MicropolisHub because it shows that multiplayer needs a meaningful shared object. The city is a civic object: scarce funds, visible territory, public tradeoffs, delayed consequences, and stories worth telling.

Modern Micropolis should build on this by combining cooperative decision-making with command previews, map-local proposals, chat-linked evidence, replayable command logs, Git branches as alternate timelines, and AI tutors who can debate and explain tradeoffs on common ground with human players.

See also:

- `designs/collaborative-microworld-lineage.md`
- `designs/multiplayer-browser-lessons.md`
- `notes/MultiPlayerIdeas.txt`