# Designing inward from the player: Miyamoto principles for Simopolis

**Status:** Design notes (cultural / craft, with concrete features)  
**Monorepo:** MicropolisCore  
**Companion documents:** [characters-as-hydrogen.md](characters-as-hydrogen.md) · [simopolis.md](simopolis.md) · [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md) · [the-computer-as-portal.md](the-computer-as-portal.md) · [the-imagine-loop.md](the-imagine-loop.md) · [family-album-as-storymaker.md](family-album-as-storymaker.md) · [federation-peer-games.md](federation-peer-games.md) · [og-cozy-games.md](og-cozy-games.md)

> *"He approaches the games playfully, which seems kind of obvious, but most people don't. And he approaches things from the players' point of view, which is part of his magic."*  
> — Will Wright, on Shigeru Miyamoto, *The New Yorker* ("Master of Play"), December 2010

---

## Why this doc exists

Simopolis inherits from two design lineages we should name and study deliberately. One is Will Wright's Maxis lineage — the open-ended toy / nurturing-environment / simulator-effect tradition, already documented across [simopolis.md](simopolis.md), [characters-as-hydrogen.md](characters-as-hydrogen.md), and the rest of the design suite. The other is **Shigeru Miyamoto's Nintendo lineage** — designing inward from the player's body, the player's face, the player's spectators; building tools before content; subverting one's own genre.

The two lineages are tangled. In 1989, Miyamoto licensed SimCity for the SNES on the spot — sliding a million-dollar check across the table to Maxis CEO Jeff Braun ([PC Gamer, June 16 2024](https://www.pcgamer.com/games/sim/in-1989-a-nintendo-bigwig-licensed-simcity-on-the-spot-by-sliding-a-million-dollar-check-across-the-table/)). Will Wright then spent a week in Kyoto with Miyamoto, apprenticing under him. Chaim Gingold's *Building SimCity* (MIT Press, 2024) makes the case directly: that week shaped SimCity 2000, which shaped The Sims, which shapes everything Simopolis is doing now. Miyamoto's homage character "Dr Wright" lives in Nintendo's SimCity port to this day.

So when we read Miyamoto's design principles, we are reading principles that were *already encoded into the project we are continuing*. This doc names them, attributes them, and connects each one to a specific Simopolis design choice.

Sources throughout are Don's first-hand Hacker News notes from 2014–2024, Miyamoto's GDC 1999 and 2007 keynotes, the [Wikipedia article on Shigeru Miyamoto](https://en.wikipedia.org/wiki/Shigeru_Miyamoto), Will Wright's [Stanford 1996 talk](https://www.youtube.com/watch?v=nsxoZXaYJSk), Gingold's *Building SimCity*, and [simcity-2013-willmott-hopkins-correspondence.md](simcity-2013-willmott-hopkins-correspondence.md) (SC2013 / SC2000 audience, Ocean, EA online).

---

## 1. Design inward from the player — the central principle

Miyamoto's design process has had two named layers, articulated about a decade apart:

**Earlier (1999 GDC keynote, the Donkey Kong / SMB / N64 era):** *design from the hands inward.* Start with how the player physically interacts with the controls they're holding. Then design back into the computer to support that physical experience.

**Later (2007 GDC keynote, the Wii era):** *design from the face inward.* Start with the facial expressions of the people playing the game. Then design the physical experience that could evoke that expression. Then design the computer-side experience that could deliver that physical experience.

The canonical image from the 2007 keynote: a little girl sitting in her grandfather's lap, playing a Wii game. The girl is entranced and delighted. The grandfather is *equally* entranced and delighted — *watching her face*. He may not even understand the game. Watching her enjoy it is enjoyment.

> *"The Wii was so successful as a social party game, because the players themselves were more fun to watch than the game on the screen, because they make spectacles of themselves, which is much more entertaining to watch than the computer graphics. And you don't get bored waiting for your turn to play, because it's fun watching other people play."*  
> — Don Hopkins, Hacker News, April 22 2014

**For Simopolis.** Our design starts further out still: from the **chat the player is having with a friend about their household**, or **the screenshot they're about to share**, or **the Family Album page they're about to upload**. The substrate then designs inward — what visualization makes that share moment land? What content compiler does the visualization need? What LLM call does the compiler need? What data does the LLM call need?

This is the inverse of "build a runtime and then ask what's fun." It is also why we are explicitly **not** building a runtime — see [characters-as-hydrogen.md](characters-as-hydrogen.md). The user's social moment with their character is the substrate's starting point.

---

## 2. Fukuwarai is the substrate

Fukuwarai is the New Year's blindfold game where players slap paper eyes and noses onto a blank face so everyone can laugh at the results. Miyamoto carried this into Nintendo's Mii system (Wii, 2006) and from there into Tomodachi Collection (2009), Tomodachi Life (2013), and *Living the Dream* (2026). The entire architecture is mismatched-face energy, played for hours instead of for seconds, with the blindfold off (see [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md)).

We already have this in Simopolis as one of the [WigOMatic / HeadShop / Character Customization Studio](the-computer-as-portal.md#6-wigomatic-and-the-character-customization-studio) shops — Mii-style face composition, but with browser-native tools, LLM assistance, image-gen for the wig texture, and palette-quantize to Sims-1 head SPR2. The fukuwarai connection just makes the lineage explicit: this is a *25+ century-old Japanese party game* expressed in a 2026 IFF authoring tool. *That's* the lineage we're in. Don't be shy about it.

---

## 3. The Simulator Effect: the second computer is the player

Will Wright's complement to Miyamoto's player-inward thinking — articulated across decades, with vocabulary I should quote directly:

> Will Wright defined the **"Simulator Effect"** as how players imagine the simulation is vastly more detailed, deep, rich, and complex than it actually is: a magical misunderstanding that you shouldn't talk them out of. He designs games to run on two computers at once: the electronic one on the player's desk, running his shallow tame simulation, and the biological one in the player's head, running their deep wild imagination.
>
> **"Reverse Over-Engineering"** is a desirable outcome of the Simulator Effect: what game players (and game developers trying to clone the game) do when they use their imagination to extrapolate how a game works, and totally overestimate how much work and modeling the simulator is actually doing, because they filled in the gaps with their imagination and preconceptions and assumptions, instead of realizing how many simplifications and shortcuts and illusions it actually used.
>
> The trick of optimizing games is to off-load as much as the simulation from the computer into the user's brain, which is MUCH more powerful and creative. **Implication is more efficient (and richer) than simulation.**
>
> — Don, Hacker News, June 16 2024 (summarizing Will Wright)

**For Simopolis.** The Imagine Loop is a *literal generalization of this principle*. We are explicitly offloading the moment-to-moment simulation to **the EA-published Sims 1** (the runtime the player owns). We are offloading the long-form narrative simulation to **the LLM** (running on the player's request, in the player's chosen tonal universe). We are offloading the *aesthetic interpretation* of the city map to **the player's imagination** (per [simopolis.md → How Sims save files actually bind to Micropolis tiles](simopolis.md#how-sims-save-files-actually-bind-to-micropolis-tiles), our zone aggregation is intentionally sparse — the player fills in the texture).

The Sims-Astrological-sign anecdote from Don's HN post (June 16 2024 — [micropolisweb launch thread](https://news.ycombinator.com/item?id=40693944), full harvest: [micropolis-web-hn-2024.md](micropolis-web-hn-2024.md)) is the perfect illustration:

> *"After we implemented the user interface for showing the Astrological sign in the character creation screen, without writing any code to make their sign affect their behavior: The testers immediately started reporting bugs that their character's sign had too much of an effect on their personality, and claimed that the non-existent effect of astrological signs on behavior needed to be tuned down. But that effect was totally coming from their imagination!"*

We should *not* implement what we can imply. The Simulator Effect is a budget multiplier of unknown magnitude in our favor.

---

## 4. *kyokan* — make the player feel what the developers felt

From the [Wikipedia article on Miyamoto](https://en.wikipedia.org/wiki/Shigeru_Miyamoto), citing *The New Yorker*'s "Master of Play" (Nick Paumgarten, Dec 12 2010):

> *"Miyamoto wants players to experience kyokan; he wants 'the players to feel about the game what the developers felt themselves.'"*

This is the deepest connection between Miyamoto and the Maxis tradition. It is also the cleanest statement of *what the soul-file represents in the Simopolis substrate*: the character's `CHARACTER.yml` is *the developer's affection for the character, exposed to the player*. The YAML Jazz comments, the mind-mirror, the relationship feelings — these are not internal-representation data. They are the developer feeling *about* the character, written down in a form the LLM can read and the player can edit. That's *kyokan* in YAML.

> "Compared to others, I make over $12,000 each month." — spam comment from rich.homingservice.com, Kotaku, Feb 13 2026. Not relevant. Just noting that the spam algorithm has also internalized *kyokan*: it wants you to feel about money what the bot was prompted to feel.

(Sorry, couldn't resist. Back on track.)

The Gavin Clayton quote Don preserved from `alt.games.the-sims` in April 2000 is the canonical example of kyokan reception:

> *"When making myself, my dad and my sister, I attributed points to all the personality categories, and I found I had points left over. But when I made my mum I ran out of available points and was wishing for more — I wanted to give her more points than are available. It made me realise for the first time in years how much I love my mum."*

That feeling — *the budget runs out, and you wish for more, and that wish reveals something to you about your relationships* — is the unit of value Simopolis exists to deliver. Every other thing we ship is in service of producing more of those moments.

---

## 5. Gameplay > story, but story should be *compatible* with gameplay

Miyamoto in 1992 ([Wikipedia](https://en.wikipedia.org/wiki/Shigeru_Miyamoto)):

> *"the important thing is that it feels good when you're playing it… quality is not determined by the story, but by the controls, the sound, and the rhythm and pacing."*  
> But he also requires *"a compatibility [between] the story and gameplay [because] a good story can smooth over that discrepancy and make it all feel natural."*

The Family Album as Simopolis's narrative output is *exactly* this: story compatible with — *generated from* — gameplay. The Sim's day produces an album page; the album page is the story; the story is auditable as gameplay events; no separate narrative system has to lie to the engine. This validates a lot of the design suite's commitment to the album as the canonical output form ([the-computer-as-portal.md → Foreign Photo Album](the-computer-as-portal.md#4-the-photo-album-with-foreign-pages); [the-imagine-loop.md → Use case I](the-imagine-loop.md#i-off-screen-job-school-narration-the-rabbit-hole-problem-solved)).

---

## 6. No focus groups. Test with friends and family.

> *"Miyamoto, and Nintendo as a whole, do not use focus groups. Instead, Miyamoto figures out if a game is fun for himself. He says that if he enjoys it, others will too… He then tests it with friends and family. He encourages younger developers to consider people who are new to gaming, for example by having them switch their dominant hand with their other hand to feel the experience of an unfamiliar game."*  
> — Wikipedia, [Shigeru Miyamoto § Development philosophy](https://en.wikipedia.org/wiki/Shigeru_Miyamoto#Development_philosophy)

This matters now because the *opposite* of this approach is what produced Nintendo's [Tomodachi *Living the Dream* image-sharing restriction](tomodachi-life-and-simopolis.md#what-nintendo-restricted-and-why) — a focus-group-cautious, "spirit-of-the-game" decision that the actual creator Miyamoto would not have made. Miyamoto's stated principle was *make the thing you love and then show it to your friends and family*. Tomodachi's launch policy was *anticipate what corporate counsel will worry about and pre-disable it*. The first principle is the one Simopolis follows; the second is the one we explicitly do not.

(And Miyamoto's quote about testing with the non-dominant hand — switching hands to feel the unfamiliarity — is a beautiful design discipline that has *no* equivalent in chat-product development culture. Don should put a "switch hands" prompt somewhere in the Phase 0 dev workflow. Genuinely.)

---

## 7. Subvert your own genre

> *"Similar to how manga artists subverted their genre, Miyamoto hopes to subvert some of the basic principles he had popularized in his early games, retaining some elements but eliminating others."*  
> — Wikipedia, summarizing *The New Yorker*

This is permission, from the most successful video game designer of all time, to **subvert one's own previous work**. For Simopolis, "the previous work" includes:

- The walled-garden one-runtime model that EA's Sims has used for 25 years — we subvert by being a *companion* to the EA runtime, not a replacement, and by making the substrate cross-runtime
- The single-island Tomodachi model — we subvert by making the character substrate the durable thing, with games as ephemeral substrates underneath it
- The single-player Sims model — we subvert with the [Family Album server](simopolis-uplift-roadmap.md#track-b-family-album-server), [federated mirror](simopolis-uplift-roadmap.md#phase-5--federated-mirror--recurring-sweep-months-ongoing), and [tornado-as-cross-time-community](the-tornado-and-the-archives.md)

Will Wright himself was apprenticed in this discipline (Kyoto, 1989). The subversion of *his* previous work — single-runtime, single-platform — is the appropriate next move.

---

## 8. Watching the player IS the game

The Wii's social-party-game principle (per Don's GDC 2007 notes and the granddaughter-on-grandfather's-lap photo) lands directly on a Simopolis design choice that's been understated so far:

**The spectator matters.** When the player asks the [Imagine Loop](the-imagine-loop.md) to skip five years forward and reads the resulting Family Album with their sibling next to them on the couch — *the sibling is also playing*. They're not waiting for a turn; they're reading along, reacting, suggesting edits, watching the player's face. Same dynamic Park describes in his *Washington Post* Tomodachi review: *"Why am I texting my friends about what they're doing in my game like it's real life?"*

Simopolis should privilege the spectator's experience as a first-class user. Concretely:

- The Family Album page must be **legible to a stranger** (i.e. someone who didn't author the household). The auto-internationalizer helps; the album-page composition rules should also ensure visual readability without lore preload.
- Slideshow-pace controls in the album-book IFFs should let the spectator pace through at their reading speed, not a fixed engine-tick rate.
- When a household publishes to the federated mirror, the published artifact should optimize for a *visitor's* understanding of the household's voice, not for the household-author's own already-internalized memory.

### 8a. The Twitch corollary: make streamers radically powerful

The granddaughter-on-grandfather's-lap scales horizontally to **the streamer-on-Twitch with 12,000 viewers in chat**. Same principle, three orders of magnitude more spectators, completely different production opportunity.

Sims-content streaming has been one of Twitch's most-watched non-shooter categories for a decade. Sims streamers (*lilsimsie*, *EnglishSimmer*, *vixella*, hundreds more) build careers around dollhouse-style play, character-creation streams, multi-hour legacy challenges; their viewers already want to participate, and Twitch's bits / subs / polls / channel-point infrastructure already monetizes that participation. Making Micropolis Home a first-class streaming tool means adoption flows through that channel directly to its natural audience — the people most likely to be opening their EA Sims 1 Legacy Collection in 2026.

The shape is: documented APIs, drop-in OBS overlays, an official Twitch Extension, and the Bar-Karma "chat is the writers' room" pattern.

**Concrete Twitch-friendly features (Phase 1F):**

| # | Feature | What it does | Notes |
|---|---|---|---|
| T.1 | **Chat-as-writers'-room** for the Imagine Loop | Stream chat pitches intents ("five years pass," "Bella discovers a secret half-sister," "the kitchen finally explodes"); top-voted intent feeds the next [Imagine call](the-imagine-loop.md); same shape Bar Karma's Storymaker had in 2011, now wired straight to the LLM substrate | The streamer reviews the queue + approves before the call runs; safety filter via the [representation-ethics ambient skill](moollm-microworld-os.md#representation-ethics-activate-traditions-do-not-impersonate) |
| T.2 | **Sub-named Sims** | First *N* new subscribers per stream get a Sim added to the streamer's current neighborhood, named after the sub, with personality generated from a short prompt the sub provides | Optional per-stream; opt-in for the sub; opt-in for the streamer; provenance trail records `character-derived-from: twitch-sub:<handle>` |
| T.3 | **Bit-cheers as in-narrative events** | Cheer 100 bits → a windfall arrives at the household; 500 bits → a stranger moves in; 1000 bits → a Family Album page is generated about the cheerer's chosen theme; etc. Tunable per streamer. | The streamer picks the event table; nothing chat does can corrupt save state — events go through the Imagine Loop's *valid-or-revise* discipline |
| T.4 | **Channel-points redemptions** as small in-game actions | Channel points are Twitch's non-monetary engagement currency; redeem them for things like "submit a caption for the next Family Album page," "vote for which Sim takes the next action," "trigger a 30-second dream sequence on the spot" | Cheap, fun, *high volume*; this is the high-engagement layer below bits |
| T.5 | **OBS / Streamlabs overlay browser sources** | Drop-in URLs the streamer can add to OBS as overlays: household mind-mirror state, current scene description, vote tally for the next Imagine intent, the Family Album live-page in progress, household funds and motives, the city map below their household | Browser-rendered (because Micropolis Home is browser-native already); no plugin needed; transparent backgrounds; configurable themes |
| T.6 | **Official Twitch Extension** for Micropolis Home channels | A Twitch panel that shows the *current* household state, lets viewers click on Sims to read their soul-files (read-only), shows the Family Album as a sidebar, shows the city map and the household's position on it. Twitch's published-extension model lets us ship this once and any streamer can install it. | Twitch Extension Studio submission; one-time engineering, ongoing maintenance |
| T.7 | **VOD-friendly chapter markers** | Imagine Loop output is timestamped and emits Twitch-API-compatible chapter markers so the VOD has navigable chapters per story beat | Important because Twitch VODs are how 80%+ of content gets watched after stream end |
| T.8 | **Save-file giveaway-with-provenance** at stream end | One-click "publish today's save" — the resulting `.iff` is shareable via a URL, downloadable by viewers, with the entire stream-derived provenance trail intact (which chat suggestions made it in, which bits triggered which events, which subs got which Sims) | Viewers can load the save into their own EA Sims 1 and play forward; the provenance trail is the *story* of how that save came to be |
| T.9 | **Streamer trust controls** | Granular per-streamer settings for what chat can do: mute / vote-only / submit-captions-only / submit-characters / full-Bar-Karma; rate limits; sub-only / mod-only gates; banned-keyword filters | Default: most-permissive-with-streamer-approval; never less safe than Twitch's own moderation defaults |
| T.10 | **Multi-streamer crossover sessions** | Two streamers each running Micropolis Home with a household crossover; chats from both channels can vote jointly; the federated [Family Album graph](family-album-as-storymaker.md) records the crossover as a multi-author scene | The Bar-Karma writers'-room model with two writers' rooms; high-novelty, high-engagement, very shareable clips |
| T.11 | **"Twitch Plays Micropolis Home" mode** | Extreme variant of T.1–T.4: chat directly drives the narrative loop without streamer approval, with rate-limited rounds and stronger safety filters. The 2014 *Twitch Plays Pokémon* moment, reproduced inside a household-sim. | Opt-in mode for events / charity streams / experiments; not the default |
| T.12 | **Streamer-revenue-respecting design** | All of T.1–T.11 is built so that bits / subs / channel-points / donations flow to the *streamer*, not to us. We do not insert ourselves into the monetization stream. We are open-source tooling; the streamer earns the engagement value. | Stated principle; explicit anti-feature against any Micropolis-side monetization hook |
| T.13 | **Simplifier** — vision-LLM screen-scraping agent: catalog narration, accessibility, online-library lookup | Vision-LLM watches the EA Sims 1 window; reads each catalog item's name, price, description, *and visually identifies the object itself*; narrates aloud on chat command, hover, or hotkey; cross-references the [Sims Content Registry](sims-content-registry.md) and online community libraries ([Tornado-recovered Sims Exchange](the-tornado-and-the-archives.md), ModTheSims, SimFreaks / ZombieSims, donhopkins.com archive) to answer *"what is this, where did it come from, where can I download something like it."* Modern descendant of Don's 2003 *Simplifier* ([demo at 3:15](https://youtu.be/Imu1v3GecB8?t=3m15s)). | Two equally important audiences: streamers (catalog narration, on-screen overlays, chat-driven lookups) and accessibility users (kids learning to read, low-vision, designers who don't want to squint at bitmap Comic Sans). One tool, one provider abstraction, ships as a desktop overlay *and* as an OBS browser source. |

The first vertical (T.5 + T.7 + T.8 — overlay sources, VOD markers, save-file giveaway) is **maybe a week's work** and immediately gives every Sims-content streamer a reason to install Micropolis Home. T.1 (chat-as-writers'-room) is the headline-grabbing one and would be **3–4 weeks** including Twitch IRC integration, polling UI, intent-queue moderation, and Imagine-Loop wiring. T.6 (official Twitch Extension) is its own multi-week project but ships *once* and benefits every streamer thereafter. T.13 (Simplifier) is a strong second-vertical candidate — **~1–2 weeks** — and lands accessibility / catalog-readability value the moment it ships, independently of any other Twitch feature.

---

## 9. Tools first, content second

> *"I am not an engineer, but I have had the opportunities to learn the principles of game [design] from scratch, over a long period of time. And because I am so pioneering and trying to keep at the forefront, I have grown accustomed to first creating the very tools necessary for game creation."*  
> — Shigeru Miyamoto, translated (Wikipedia source [11])

This is Maxis's secret sauce per Gingold's *Building SimCity*, and it's our design discipline by default in Simopolis: the **Transmoogrifier**, the **Adventure Compiler**, the **Content Registry**, the **Tornado** are not features bolted onto a Sims clone. *They are the products.* The content comes from the player, from the LLM, from the recovered archive. We ship tools.

Miyamoto-the-designer and Maxis-the-content-tool-shop converge here.

---

## 10. Don's first-hand Sims design anecdotes worth preserving

Three from the HN posts that aren't covered elsewhere in the design suite but should be, briefly, because they validate specific Simopolis design choices:

**The astrological-signs incident** (HN, June 16 2024). The team added Sims zodiac signs with *zero behavioral effect*; testers immediately reported that the signs had too much effect on personality. This is the cheapest possible content type — purely interpretive metadata — and it produced enormous Simulator-Effect value. **Simopolis should ship cheap interpretive metadata aggressively**: zodiac, Myers-Briggs, Enneagram, household color palettes, family crests, theme music suggestions — all derived from existing trait data via simple deterministic mapping, with no behavioral effect, surfaced prominently in Micropolis Home's character cards.

**The astrological-sign-zero-personality bug** (same HN post). Showing a sign for an all-zero personality would be insulting to 1/12th of the players. The create-a-sim UI hid the sign in that case. **Simopolis should generalize this defensiveness**: never surface a derivation that maps a *neutral / empty / pre-author* state to a *valued / labeled / loaded* output. The character-card UI should leave interpretive fields blank for empty states, not produce a placeholder. There are many Mind Mirror parameters, but you only need to set the ones that are important for that character. The missing ones don't imply "0" along their axis, it just means "not known, so no effect". 

**The "muckety-muck architecture magazine" exchange** (same HN post):

> *"Some muckety-muck architecture magazine was interviewing Will Wright about SimCity, and they asked him a question something like 'which ontological urban paradigm most influenced your design of the simulator…' He replied, 'I just kind of optimized for game play.'"*

**Simopolis should commit to "just kind of optimize for the player's moment-by-moment experience" as the answer to any design question that's getting too theoretical.** The design suite is at 4,000+ lines now. If a feature decision can't be resolved by "what makes the player's next 15 seconds better," it's the wrong question.

---

## 11. Scott McCloud's masking: abstract character, detailed world

Scott McCloud, *Understanding Comics* (1993), chapter 2 — the **masking effect**:

> *"When you look at a photo or realistic drawing of a face, you see it as the face of another. But when you enter the world of the cartoon, you see yourself."*

The practical rule McCloud derives from this — and the rule the entire mainstream manga tradition runs on — is: **draw the protagonist abstractly so the reader projects themself onto it; draw the world richly so the reader believes in it.** Iconic face + photorealistic background = maximum identification + maximum immersion. The Sims 1, Tintin, Calvin and Hobbes, Tezuka, almost every long-running shōnen — same shape.

### The Sims 1 is McCloud's masking principle in 3D

Sims have stylized cartoon faces with few expressions, low-poly bodies, exaggerated walks, and they speak **Simlish** — deliberately abstract pseudo-language with no semantic content, only emotional tone (the listener supplies the words). And then those abstract Sims live in detailed isometric houses with real-time shadows, near-photorealistic furniture, and brand-style consumer objects. Family Album pages photograph the abstract characters inside the detailed environment and caption them. *That is McCloud's masking principle, made into a dollhouse simulator.*

### Miis are McCloud's masking principle as an avatar system

The Mii arc from 2006 to 2026 demonstrates the principle publicly in three product cycles (contemporary documentation: Thomas Game Docs, [*Why Nintendo almost got rid of Miis*](https://www.youtube.com/@ThomasGameDocs), April 2026):

- **Wii Sports (2006).** Highly abstract — sphere hands, no arms, fixed face textures. Brain supplies the rest. Cultural phenomenon.
- **Switch Sports (2022).** *Sportsmates.* Detailed enough to land in the uncanny valley, abstract enough to induce same-face syndrome. Players bounced off them.
- **Tomodachi Life: Living the Dream (2026).** *More* abstract than the Sportsmates, with richer customization — toon-shaded cel-style faces, face paint as user-supplied detail. Sold out everywhere. Art director Daisuke Kageyama: *"Whenever movements look too realistic and cool, it stops being Mii-like."*

### Applying it here

| Decision | Application |
|---|---|
| **WigOMatic / Character Customization Studio** ([the-computer-as-portal.md → §6](the-computer-as-portal.md#6-wigomatic-and-the-character-customization-studio)) | Heads and wigs stay abstract; palette-quantize hard, resist image-gen drifting toward photorealism. |
| **Family Album scene rendering** ([family-album-as-storymaker.md](family-album-as-storymaker.md)) | Characters stylized (WebGPU semi-iso, Sims-1 album palette); environments can be detailed. Imagine-Loop image-gen prompts default to "characters stylized, environments detailed." |
| **Mind-mirror and YAML Jazz** ([moollm-microworld-os.md](moollm-microworld-os.md)) | LLM-readable character is *deliberately abstract*: sparse traits, few-fielded mind-mirror, narrative-flavor comments. The astrological-signs anecdote (§3) is the same principle in trait data. |
| **Imagine Loop intent presets** ([the-imagine-loop.md](the-imagine-loop.md)) | Tonal hints land in prompts; specific facial detail does not. |
| **Sims-Online-map rendering inside Micropolis City** ([simopolis.md](simopolis.md)) | Lots and architecture detailed; residents stylized at the same scale. |
| **Twitch overlays** ([§8a](#8a-the-twitch-corollary-make-streamers-radically-powerful)) | Characters render as stylized portraits, not photoreal model renders. |

Rules out: photorealistic Sim portraits as album headshots; image-gen heads shipped without stylization or palette-quantization; trying to push *both* character and environment into photoreal mode (the Sportsmates configuration).

Composes with fukuwarai (§2 — same principle from the playable-face angle), the Simulator Effect (§3 — abstraction is the room the player's imagination fills), and *kyokan* (§4 — feeling lands only when the character has space for the player's feeling to land in).

### One-line rule

**Detailed world. Abstract people. Don't switch them.**

---

## On respect (separating designer from platform)

Throughout this doc I have been positive about Miyamoto. That sits next to a previous design doc, [tomodachi-life-and-simopolis.md](tomodachi-life-and-simopolis.md), that was sharply critical of Nintendo's image-sharing restrictions in *Living the Dream*.

These are not in tension. **Miyamoto-the-designer** is one of the most thoughtful, generous, principled people in the field. The PC Gamer story of him sliding a $1M check across the table to Maxis in 1989 — and then spending a week in Kyoto with Will Wright as host, treating him "as family and like royalty" (Gingold) — is the same Miyamoto who designs from his granddaughter's face inward, who invents "Dr Wright" as a manga-style homage character, who keeps the deliberately-robotic TTS because *robotic is funnier*.

**Nintendo-the-platform-owner** is a separate entity whose corporate decisions (image-share restrictions, removed concert hall, default-disabled UGC sharing in 2026) reflect platform-owner caution rather than Miyamoto's design philosophy. *Living the Dream* was directed by Ryutaro Takahashi, with Yoshio Sakamoto (Metroid) as producer — Miyamoto's role at modern Nintendo is "Creative Fellow" providing feedback, not direct game direction.

So: deep respect for the designer. Honest criticism of the platform restrictions when they contradict the designer's own stated principles. These can co-exist.

The same separation applies to Will Wright vs Electronic Arts, and to the same effect: Will the designer and Maxis the historical studio are cherished; current EA (the corporate platform-owner, now mid-acquisition by PIF / Silver Lake / Kushner's Affinity Partners) is a separate entity and a recurring subject of legitimate criticism. The full receipts and the substrate-independence argument live in [og-cozy-games.md](og-cozy-games.md). What matters in *this* doc: the design discipline catalogued here descends from Will's work, not from current EA's corporate direction.

---

## Concrete features inspired by this doc


| #   | Feature                                                                                                                                                                                                              | Where it lands                                                     | Effort                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------- |
| 1   | **Cheap interpretive metadata** for character cards: zodiac, MBTI, Enneagram, family-color palette, theme music suggestion — derived from existing trait data via simple deterministic mapping, no behavioral effect | `packages/sims-io/src/l4/interpretive-metadata.ts`                 | 2–3 days                   |
| 2   | **Empty-state defensiveness** in character-card UI: never label a pre-author / zero state with a derived interpretive field; show blanks until the author has set values                                             | Micropolis Home UI                                                 | 1 day                      |
| 3   | **Spectator-mode for Family Album books**: pacing controlled by reader, not engine; album pages composed to be legible without lore preload                                                                          | `packages/sims-io/src/l5/album-pace.ts` + album-book IFF generator | 3 days                     |
| 4   | **"Switch hands" dev discipline**: a documented rule that every Phase 0 feature has to be tried by a teammate who didn't author it, before it ships. Cultural rule, not code.                                        | `documentation/DEVELOPMENT.md` addendum                            | 0 days (just commit to it) |
| 5   | **"What makes the next 15 seconds better" debate-stopper**: also cultural; add to the design-suite README as the resolution rule for design questions that get too theoretical                                       | `documentation/designs/README.md`                                  | 0 days                     |


The first three are real engineering tasks. The last two are discipline.

---

## References


| Source                                                                                                                                                                                                                                                                                            | Relevance                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Don Hopkins, multiple Hacker News comments, April 2014 – June 2024                                                                                                                                                                                                                                | First-hand notes on Miyamoto's GDC keynotes, Will Wright's design philosophy, Sims astrological-signs anecdote, "muckety-muck architecture magazine" exchange, Gavin Clayton mum-personality quote |
| Wikipedia, *[Shigeru Miyamoto](https://en.wikipedia.org/wiki/Shigeru_Miyamoto)*                                                                                                                                                                                                                   | Development philosophy, kyokan, no-focus-groups rule, "test with friends and family," "subvert your own genre"                                                                                     |
| Nick Paumgarten, ["Master of Play"](https://www.newyorker.com/magazine/2010/12/20/master-of-play), *The New Yorker*, 12 Dec 2010                                                                                                                                                                  | Source for many Wikipedia quotes; Will Wright's quote on Miyamoto's player-point-of-view approach                                                                                                  |
| Chaim Gingold, *Building SimCity: How to Put the World in a Machine* (MIT Press, June 2024)                                                                                                                                                                                                       | Documents Miyamoto's 1989 SimCity SNES licensing and his Kyoto week with Will Wright; argues that Miyamoto's apprenticeship shaped SimCity 2000 and The Sims                                       |
| Tyler Wilde, ["In 1989, a Nintendo bigwig licensed SimCity on the spot by sliding a million dollar check across the table"](https://www.pcgamer.com/games/sim/in-1989-a-nintendo-bigwig-licensed-simcity-on-the-spot-by-sliding-a-million-dollar-check-across-the-table/), PC Gamer, 16 June 2024 | The story of Howard Lincoln, Minoru Arakawa, and the $1M check; Wright and Braun in Kyoto in 1989                                                                                                  |
| Shigeru Miyamoto, *Interfacing to Microworlds* (Will Wright at Stanford, 26 April 1996); Don Hopkins's [Medium write-up](https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d)                                                                                | Source for the Simulator Effect, Reverse Over-Engineering, and "implication is richer than simulation"                                                                                             |
| Miyamoto's GDC 1999 keynote — "design from the hands inward"                                                                                                                                                                                                                                      | [YouTube](https://www.youtube.com/watch?v=a9DlhDRZ0yA) (also [Internet Archive mirror](https://archive.org/details/gdc-1999-shigeru-miyamoto-keynote))                                              |
| Miyamoto's GDC 2007 keynote — "design from the face inward"                                                                                                                                                                                                                                       | [YouTube playlist](https://www.youtube.com/playlist?list=PL861C5A6AE33D385D) (multi-part); the granddaughter-on-grandfather's-lap photo                                                            |


