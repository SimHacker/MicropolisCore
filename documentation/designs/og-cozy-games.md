## OG Cozy Games

# The Sims, Simopolis, Micropolis, and the cozy lineage Gamergate quietly avoided

**Status:** Design notes (cultural / strategic, with citable historical receipts)
**Monorepo:** MicropolisCore
**Companion documents:** [simopolis.md](simopolis.md) · [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md) · [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) · [family-album-as-storymaker.md](family-album-as-storymaker.md) · [characters-as-hydrogen.md](characters-as-hydrogen.md)

> *"What Gamergate was actually about: every claim it made about commercial viability, audience demographics, inclusive design, and ideology-in-games was undermined by a single game shipped 14 years before — The Sims. So Gamergate didn't talk about The Sims."*

> **Trademark notice.** *Micropolis* is used under license from Micropolis GmbH. *SimCity*, *The Sims*, and *Maxis* are EA Inc. trademarks; references are nominative use only.

> **Scope.** Cultural / strategic positioning, with documented historical sources. Not engineering. See [simopolis.md → Scope and intent](simopolis.md#scope-and-intent) for the canonical project posture.

---

## The framing in one paragraph

The word "cozy game" was coined around 2020 (see Izzzyzzz, [*Cozy Games and Misogyny*](https://www.youtube.com/@Izzzyzzz), May 2026, for the contemporary genre history). Academic press reached the same conclusion at The Sims's 25th anniversary: Adam Jerrett (University of Portsmouth), [*How The Sims accidentally invented the cosy game genre*](https://theconversation.com/how-the-sims-accidentally-invented-the-cosy-game-genre-248702) (*The Conversation*, 3 Feb 2025) — before Stardew Valley, Animal Crossing, and Unpacking, The Sims had already normalized games that don't need to be *won* to be fun. The games the label retroactively applied to — slow-paced, character-driven, low-pressure, narrative-friendly, with a broad and majority-female audience — were already 20+ years old when the label arrived. **The Sims (2000) is the canonical OG cozy game.** SimCity (1989) and Micropolis (2008, the GPL'd descendant) are its proto-cozy ancestors in the city-sim direction: open-ended, no failure state, no enemies, no scoreboard, the player's mental model is the gameplay. Simopolis sits *inside* the cozy lineage by inheritance, not by retrofit. This doc names that, documents the historical receipts, and notes what it implies for Micropolis Federation design.

---

## The Sims as the structural counterargument to Gamergate

Gamergate (2014) framed its claims around four propositions. Each was undermined by The Sims, which had shipped 14 years earlier. The juxtaposition is documented; the silence about it is conspicuous.

| Gamergate claim | What The Sims demonstrated, in shipping commercial product, 2000 onward |
|---|---|
| *"Women don't really play games."* | The Sims had a majority-female audience and became the best-selling PC game of all time. ([Fortune, "How EA's $5 billion Sims empire has become a magnet for female talent in a male-dominated field", 31 Jan 2025](https://fortune.com/2025/01/31/the-sims-25-anniversary/).) |
| *"Inclusive / 'DEI' design kills games commercially."* | Inclusive design — same-sex relationships, broad personality models, non-violent goals, household stories — was a core design rule of The Sims from the design-document phase in 1998 and produced one of the largest commercial successes in the history of the medium. |
| *"Inclusivity is activists injecting ideology into otherwise-neutral games."* | Same-sex relationships in The Sims were not a representation overlay added late under outside pressure; they were a *procedural-rhetorical rule* of the game world, designed deliberately by the Maxis team during the 1998 design phase. The receipts are the design documents themselves (linked below). |
| *"This is really about ethics in games journalism."* | If Gamergate were structurally about ideology-in-games, The Sims would have been ground zero: the most ideologically deliberate, most commercially successful, most widely played game with explicitly inclusive procedural rules. Gamergate did not target The Sims, the journalists who wrote about it favorably, or its developers. That silence is the tell. |

The point isn't argument-by-anecdote; it's that the empirical record sat in plain sight, unmentioned, because acknowledging it would have collapsed every load-bearing claim of the campaign.

---

## The receipts: Don's 1998 Design Document reviews

The primary historical source is the Maxis design-document review trail from August 1998, archived publicly at [donhopkins.com/home/TheSims/](https://donhopkins.com/home/TheSims/) and [donhopkins.com/home/TheSimsDesignDocuments/](https://donhopkins.com/home/TheSimsDesignDocuments/). Two specific documents are the contemporaneous record:

### *Review of The Sims Design Document Draft 3*, 8/7/1998

Don's annotation on page 5, addressing the original heterosexist relationship implementation in the draft:

> *"The whole relationship design and implementation (I've looked at the tree code) is Heterosexist and Monosexist. We are going to be expected to do better than that after the SimCopter fiasco and the lip service that Maxis publically gave in response about not being anti-gay. The code tests to see if the sex of the people trying to romantically interact is the same, and if so, the result is a somewhat violent negative interaction, clearly homophobic. We are definitly going to get flack for that. It would be much more realistic to model it by two numbers from 0 to 100 for each person, which was the likelyhood of that person being interested in a romantic interaction with each sex. So you can simply model monosexual heterosexual (which is all we have now), monosexual homosexual (like the guys in SimCopter), bisexual, nonsexual (mother theresa, presumably), and all shades in between (most of the rest of the world's population). It would make for a much more interesting and realistic game, partially influenced by random factors, and anyone offended by that needs to grow up and get a life, and hopefully our game will help them in that quest."*

This is 27 years before this document was written. The design proposal sketched in that comment — *two numeric attraction parameters per character with all shades between* — is structurally identical to how the [Mind Mirror](moollm-microworld-os.md) handles attraction and orientation today (see particularly [moollm-microworld-os.md → The double personality model](moollm-microworld-os.md#the-double-personality-model-wright--leary), which folds Maxis's five-trait `sims_traits` together with Timothy Leary's 1985 Mind Mirror dimensions on top).

### *Review of The Sims Design Document Draft 5*, 8/31/1998

Page 4 of the revised draft, after Don's annotation was integrated:

> *"Same Sex and Opposite Sex relationships — To be outlined in 9/30 Live Mode deliverable. Currently the game only allows heterosexual romance. This will not be the only type available — it just reflects the early stages of implementation. Will is reviewing the code and will make recommendations for how to implement homosexual romance as well."*

Will is Will Wright. The lead designer of The Sims personally took on the implementation of same-sex relationships into the game's behavioral substrate during the 1998 design phase. The shipped Sims 1 (2000) included same-sex relationships as a documented rule of its simulated world. This was sixteen years before Gamergate.

These documents are not retrospective claims. They are scanned source documents from the Maxis project files, dated, annotated in pen, with the design intent of the people who built the game visible on the page.

---

## Procedural rhetoric: why the rule, not the representation, is the argument

Ian Bogost's [*Persuasive Games* (2007)](https://en.wikipedia.org/wiki/Procedural_rhetoric) coined the term *procedural rhetoric* for arguments made through the rules and processes of a system rather than through its visuals or text. Bogost and Gonzalo Frasca both cited The Sims as the textbook case (per the Wikipedia summary of Frasca's analysis):

> *"The way that The Sims's designers dealt with gay couples was not just through representation (for example, by allowing players to put gay banners on their yards), they also decided to build a rule about it. In this game, same-gender relationships are possible. ... By incorporating this rule, the designers are showing tolerance towards this sexual option."*

This is a stronger claim than narrative representation. The Sims is not telling the player *that* same-sex relationships are valid; it is saying the game's universe is one in which they are valid by the same rules as any other relationship. That argument is made by the substrate, not the surface.

Simopolis inherits this discipline at the substrate level:

- The Mind Mirror is multi-dimensional and orientation-agnostic by design ([moollm-microworld-os.md](moollm-microworld-os.md)).
- Relationships in `CHARACTER.yml` use type tags, not gendered slots; the [Bifrost protocol](moollm-microworld-os.md#the-bifrost-the-bridge-as-a-structured-ontological-transition) handles arbitrary relationship structures.
- The Sims content registry ([sims-content-registry.md](sims-content-registry.md)) preserves the inclusive rules of any content it round-trips; no transformation step strips orientation, gender expression, or family structure from a recovered or imagined household.
- The [Imagine Loop](the-imagine-loop.md) operates on the same substrate; what the LLM narrates is constrained by the same procedural rules. The author cannot accidentally produce a Heterosexist Imagine output because the schema doesn't have a "Heterosexist" mode.

Alexander Avila's video essay [*Did The Sims make you gay?*](https://www.youtube.com/watch?v=Xi-HWyh0Ybk) walks through how a generation of queer players found space inside The Sims's procedural rules; the comments section of that video is a primary source for the cultural reach.

---

## The cozy game cycle: every era, the same dismissal, a different label

Drawing on the Izzzyzzz Cozy Games essay, the pattern across two decades is consistent. Each cycle the market produces games preferred by a majority-female audience; each cycle those games get a new dismissive label; each cycle the dismissal reproduces the same misogyny.

| Era | The label | What it dismissed | What it was |
|---|---|---|---|
| 2000–2009 | *"girly games"* | Bratz, Imagine, Pets, Petz, Style Savvy, Cooking Mama, Nintendogs, *and The Sims itself in some circles* | A genre that included real shovelware and a few quietly important products. The Sims was the latter. |
| 2010–2019 | *"casual games"* / *"mobile games"* | Bejeweled, Peggle, Candy Crush, FarmVille, Diner Dash | The same gameplay-loop genre as everything called "cozy" today, on a smaller screen. |
| 2020–now | *"cozy games"* / *"cozy slop"* | Stardew Valley, Animal Crossing, Tomodachi LTD, Spiritfarer, Coral Island, Tales of the Shire | Same lineage, new label. |

The Sims survived this cycle because it was too big to dismiss — but in many subcultures it still gets the *"not a real game"* treatment, and the dismissal mechanic is identical to the modern *"cozy slop"* dismissal. The Izzzyzzz essay documents that pattern in detail.

Jerrett's *Conversation* piece names the specific cozy DNA The Sims popularized: meticulous environment building, self-paced play with no combat timers, relationship drama instead of survival combat, and a machinima fan culture where players turned gameplay footage into sitcoms and soap operas — emergent social storytelling that prefigured today's share-button meme culture and Simopolis's [Family Album as StoryMaker](family-album-as-storymaker.md) graph. (Farm-life cozy has an earlier antecedent in Harvest Moon, 1997 — Jerrett's article and its comment thread acknowledge that sub-lineage — but the blockbuster proof case for cozy-as-mainstream remains The Sims.)

What this implies for Simopolis design language: *we do not call these games "cozy" defensively or apologetically*. They are games. They are commercially massive games. They are the games the medium descends from in this lineage. We treat the term "cozy" as a neutral descriptor of pacing and feel, not as a defensive concession.

---

## Why Micropolis is in this lineage too

SimCity (1989) and Micropolis (2008, the GPL release of the same engine) are not usually classified as cozy. They are classified as city-builders. But by the same Izzzyzzz argument — *mechanics are mechanics; the labels are about audience* — they share most of the load-bearing properties of the cozy lineage:

- **No failure state.** A SimCity that runs out of money keeps running; the player decides when they are done. No game-over screen. Compare to Stardew Valley: time passes, the player decides.
- **No enemies.** Disasters are environmental, not adversaries. The player is not in opposition to an AI.
- **No scoreboard.** The simulation's evolution is the artifact; how you feel about it is the gameplay.
- **Open-ended creative play.** Will Wright explicitly pitched SimCity as a *software toy*, in contrast to *software game*. The cozy-games movement is the medium catching up with that distinction.
- **Player's mental model is the gameplay.** The Simulator Effect (see [designing-inward-miyamoto-principles.md → §3](designing-inward-miyamoto-principles.md#3-the-simulator-effect-the-second-computer-is-the-player)). Implication > simulation. Identical to how the cozy genre operates today.

Micropolis is structurally in the cozy lineage. We don't need to apologize for the description; we should just name it. The fact that SimCity wasn't gendered as "girly" in 1989 is a quirk of marketing in that era, not a structural property of the design.

---

## The dollhouse framing (1996)

The most-cited cozy-genre origin story credits Animal Crossing (2001) and the wholesome-direct era (2020). The deeper origin is Will Wright's 1996 Stanford talk *Interfacing to Microworlds*, where the prototype of what became The Sims was demoed under the project name **Dollhouse** (see [simopolis.md → Historical proof](simopolis.md#historical-proof-this-was-always-the-plan) and the [Stanford 1996 video](https://www.youtube.com/watch?v=nsxoZXaYJSk)).

"Dollhouse" is a deliberately feminine-coded framing. Will pitched the game as one in 1996, four years before launch, with full awareness of what the gendered connotation meant for who the game was for. That this was the design intent — and the commercial outcome was the best-selling PC game of all time — is a fact worth keeping on the record.

The Dollhouse framing also runs straight into the *Wii Sports family on the couch* / *Tomodachi LTD with a sibling reading the Family Album* moments that anchor [Miyamoto principle §8](designing-inward-miyamoto-principles.md#8-watching-the-player-is-the-game) and its [Twitch corollary §8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful). Same design intuition. Same audience expansion. Different decade.

---

## What this means for Simopolis design and language

Concrete implications, mostly about discipline rather than mechanics:

| Discipline | Implementation |
|---|---|
| Treat the Sims/Sims-content tradition as the cozy lineage's commercial proof. | When documenting Simopolis for a wider audience, name the cozy lineage explicitly. Don't apologize for it. Don't hedge. |
| Encode inclusion at the substrate, not the surface. | Mind Mirror, relationships, family structures, gender, orientation are all schema-level concerns. Surface representation (avatars, text) is the *expression* of the substrate, not a separate retrofit. |
| Refuse "real game" gatekeeping in our own writing. | The design suite never uses *"casual game"* or *"not a real game"* framings about any genre. Cozy games are games. Mobile games are games. The Sims is a game. So is Dark Souls. None of these descriptors implies value-hierarchy. |
| Procedural rhetoric is the design language. | Every Simopolis rule is itself an argument about the world it models. We are deliberate about what those rules say. (See [moollm-microworld-os.md → Representation Ethics](moollm-microworld-os.md#representation-ethics-activate-traditions-do-not-impersonate) for the discipline applied to LLM-generated content.) |
| Decline the dismissal economy. | When the project's wider documentation mentions cozy games, Family Album streaming, Tomodachi-style ad-libs, or other features the dismissive discourse codes as "casual," the documentation describes them in the same neutral technical register as any other feature. |
| Honor the receipts. | When the question of *"when did inclusive design enter the medium"* comes up, the answer is *at least 1998, in the design phase of the best-selling PC game ever made*, with public primary sources. Don's [donhopkins.com/home/TheSims/](https://donhopkins.com/home/TheSims/) is the citable record. |
| The Twitch-friendly stack (Phase 1F) ships into a cozy-friendly streaming culture. | Streamer trust controls, chat-as-writers'-room, sub-named Sims — see [designing-inward-miyamoto-principles.md → §8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) — are designed with awareness that the audience is majority cozy / Sims / Stardew / Tomodachi viewers, not Call-of-Duty lobbies. |

---

## Gamergate → alt-right → MAGA: the documented arc, briefly

The cultural framing here is not original to this project; it is the consensus of the journalistic and academic record on what Gamergate actually produced. We cite it because it informs the design discipline above (why we refuse the dismissal economy, why we encode inclusion at the substrate level, why we expect bad-faith attacks on cozy-friendly Simopolis features). The cited sources:

| Source | Summary |
|---|---|
| Encyclopædia Britannica, [Gamergate](https://www.britannica.com/topic/Gamergate-campaign) | "Bannon and Yiannopoulos would use that platform to draw Gamergate supporters into the larger alt-right movement." |
| Axios, ["How the far right borrowed its online moves from gamers" (Oct 2022)](https://www.axios.com/2022/10/20/gamergate-right-online-harassment-joan-donovan-meme-wars) | Documents the tactical playbook (coordinated harassment, grievance politics, memes, conspiracy theories, anti-"SJW" framing) that flowed from Gamergate into Trump-era organizing. |
| WIRED, ["Gamergate's Aggrieved Men Still Haunt the Internet"](https://www.wired.com/story/gamergates-aggrieved-men-still-haunt-the-internet/) | The persistence and migration of the original Gamergate community into adjacent movements. |
| Poynter, ["Gamergate was a warning that the media failed to heed" (2025)](https://www.poynter.org/?p=1173562) | The journalism-side post-mortem on the campaign's tactics and how media coverage normalized them. |
| University of Melbourne Pursuit, ["How the far right weaponised gamers and geek masculinity"](https://pursuit.unimelb.edu.au/articles/how-the-far-right-weaponised-gamers-and-geek-masculinity) | The academic articulation of the gamer→radicalization pipeline. |
| ABC Australia, ["Alt-right groups are targeting young video gamers" (July 2022)](https://www.abc.net.au/news/2022-07-15/alt-right-groups-video-games-radicalising-young-men-extremism/101212494) | Contemporary reporting on the ongoing targeting strategy. |
| Wikipedia, [Gamergate (harassment campaign)](https://en.wikipedia.org/wiki/Gamergate) | Citation-rich summary of the campaign, its principals, and its downstream effects. |

This is not a separate political claim. It is the structural reason why Simopolis-the-tooling needs to be designed *defensively*: the streaming features, the Family Album graph, the inclusive substrate, the takedown discipline are all going into a hostile cultural environment whose tactics are well-documented. The defenses (representation-ethics ambient skill, federated git-as-multiverse rather than central platform, provenance-mandatory content, takedown channels) are direct responses to the known threat model. See [the-tornado-and-the-archives.md → Ethics](the-tornado-and-the-archives.md#ethics) and [moollm-microworld-os.md → Representation Ethics](moollm-microworld-os.md#representation-ethics-activate-traditions-do-not-impersonate) for how the threat model lands in the engineering.

---

## What this does not try to be

- Not a political statement of the project. The receipts are factual; the design discipline that follows from them is engineering. We document why we built things this way; we do not editorialize beyond what the documented record supports.
- Not a Sims-fan-club essay. The Sims is cited as a primary historical source for inclusive procedural-rhetoric design and as the canonical OG cozy game. Other games in the lineage are equally important; this doc focuses on Sims because the receipts are unusually well-preserved.
- Not an attack on any individual. The cited Gamergate sources are the journalistic and academic consensus on a campaign, not on any person.
- Not an apology for cozy games. The whole point is that they don't need one.

---

## References

### In MicropolisCore

| Resource | Where |
|---|---|
| Character substrate (top-level framing) | [characters-as-hydrogen.md](characters-as-hydrogen.md) |
| Simopolis strategic vision | [simopolis.md](simopolis.md) |
| Miyamoto / McCloud / Wright design-discipline notes | [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) |
| Tomodachi-Life cultural / strategic comparison | [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md) |
| Family Album as branching/merging graph | [family-album-as-storymaker.md](family-album-as-storymaker.md) |
| MOOLLM substrate (Mind Mirror, Bifrost, Representation Ethics) | [moollm-microworld-os.md](moollm-microworld-os.md) |
| Tornado archive recovery (ethics + takedown discipline) | [the-tornado-and-the-archives.md](the-tornado-and-the-archives.md) |

### Primary sources — The Sims design history

| Source | Where |
|---|---|
| Don's Sims design-document review archive | [donhopkins.com/home/TheSims/](https://donhopkins.com/home/TheSims/) |
| *Review of The Sims Design Document Draft 3*, 8/7/1998 (annotated, including the Heterosexist/Monosexist comment) | [donhopkins.com/home/TheSimsDesignDocuments/](https://donhopkins.com/home/TheSimsDesignDocuments/) |
| *Review of The Sims Design Document Draft 5*, 8/31/1998 (Will Wright reviewing code for same-sex implementation) | [donhopkins.com/home/TheSimsDesignDocuments/](https://donhopkins.com/home/TheSimsDesignDocuments/) |
| Will Wright, *Interfacing to Microworlds* (Stanford, 26 April 1996) — the "Dollhouse" demo of what became The Sims | [YouTube](https://www.youtube.com/watch?v=nsxoZXaYJSk) · [Don's notes](https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d) |
| SimAntics VM Design Document (Don Hopkins, Maxis) | [donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf](https://donhopkins.com/home/TheSimsDesignDocuments/VMDesign.pdf) |

### External — procedural rhetoric and the cozy genre

| Source | Where |
|---|---|
| Ian Bogost, *Persuasive Games* (MIT Press, 2007) — Procedural Rhetoric | [Wikipedia summary](https://en.wikipedia.org/wiki/Procedural_rhetoric) |
| Alexander Avila, *Did The Sims make you gay?* (video essay) | [YouTube](https://www.youtube.com/watch?v=Xi-HWyh0Ybk) |
| Izzzyzzz, *Cozy Games and Misogyny* (May 2026) | [YouTube](https://www.youtube.com/@Izzzyzzz) |
| Adam Jerrett (University of Portsmouth), *How The Sims accidentally invented the cosy game genre* (3 Feb 2025) — The Sims 25th-anniversary *Conversation* mini-series; dollhouse framing, emergent narrative, machinima, cozy-DNA checklist | [theconversation.com](https://theconversation.com/how-the-sims-accidentally-invented-the-cosy-game-genre-248702) |
| Fortune, "How EA's $5 billion Sims empire has become a magnet for female talent in a male-dominated field" (31 Jan 2025) | [fortune.com](https://fortune.com/2025/01/31/the-sims-25-anniversary/) |

### External — Gamergate → alt-right documentation

| Source | Where |
|---|---|
| Encyclopædia Britannica, Gamergate | [britannica.com](https://www.britannica.com/topic/Gamergate-campaign) |
| Wikipedia, Gamergate (harassment campaign) | [wikipedia.org](https://en.wikipedia.org/wiki/Gamergate) |
| Axios, "How the far right borrowed its online moves from gamers" (Oct 2022) | [axios.com](https://www.axios.com/2022/10/20/gamergate-right-online-harassment-joan-donovan-meme-wars) |
| WIRED, "Gamergate's Aggrieved Men Still Haunt the Internet" | [wired.com](https://www.wired.com/story/gamergates-aggrieved-men-still-haunt-the-internet/) |
| Poynter, "Gamergate was a warning that the media failed to heed" (2025) | [poynter.org](https://www.poynter.org/?p=1173562) |
| University of Melbourne Pursuit, "How the far right weaponised gamers and geek masculinity" | [pursuit.unimelb.edu.au](https://pursuit.unimelb.edu.au/articles/how-the-far-right-weaponised-gamers-and-geek-masculinity) |
| ABC Australia, "Alt-right groups are targeting young video gamers" (July 2022) | [abc.net.au](https://www.abc.net.au/news/2022-07-15/alt-right-groups-video-games-radicalising-young-men-extremism/101212494) |
| Don's HN thread on the same topic (March 2015) including the Maxis insider context | [Don Hopkins HN comment](https://news.ycombinator.com/item?id=9143604) |
