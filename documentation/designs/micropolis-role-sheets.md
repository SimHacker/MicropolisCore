# Micropolis role sheets (mayor sheets)

**Status:** Active design  
**Premise:** Micropolis does **not** (yet) represent individual people inside the city sim. It *does* import/export **characters** — real players and simulated agents — that plug into **roles**. Each role is a socket; any character can occupy it; experience travels with the character.

**MOOLLM ontology:** a role sheet is a game **organelle** under a soul — same grain as a Sims family album sheet or CK3 character. See [SOUL-MODEL.md](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-MODEL.md) · [character-endosymbiosis.yml](https://github.com/SimHacker/DonHopkins/blob/main/projects/micropolis-moollm/process/character-endosymbiosis.yml).

**Companions:** [collaborative-microworld-lineage.md](collaborative-microworld-lineage.md) § roles · [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md) · [family-album-as-storymaker.md](family-album-as-storymaker.md) · [github-as-mmorpg-multiverse.md](github-as-mmorpg-multiverse.md) · moollm [`skills/micropolis/artifacts/unfulfilled-dreams.yml`](https://github.com/SimHacker/moollm/blob/main/skills/micropolis/artifacts/unfulfilled-dreams.yml)

---

## The gap

The classic SimCity / Micropolis loop gives you **tools** (zone, bulldoze, budget, disasters) and an abstract “you are the mayor,” but no persistent person who *was* the mayor of Foobaropolis, learned something, and later shows up in The Sims with a photo album titled *My time as mayor*.

MultiPlayerIdeas already named the political cast — mayor, treasurer, planner, builder, reporter, god — as grantable roles. GitHub teams/permissions fulfill the *permission* half. This doc is the **character + experience + history** half.

---

## Roles are sockets; characters plug in

| Layer | What it is |
|-------|------------|
| **Tool / tool cluster** | Bulldozer, zone paint, budget panel, query, disasters, map overlays… |
| **Role** | A named responsibility that owns one tool or a cluster — mayor, architect, bulldozer driver, zoner, city council, journalist, newspaper writer, blogger, photographer, data analyzer, GitHub issue creator / responder / implementor / reviewer |
| **Character** | A real player or simulated agent (MOOLLM / WWSFF / adventure-4 soul) that **occupies** a role for a tour of duty |
| **Role sheet** (mayor sheet when the role is mayor) | The organelle: tenure, skills earned, album pages, city refs, exportable YAML |

Any character can plug into any role their consent and permissions allow. Swapping characters does not rewrite the city; it rewrites who is *accountable* and whose **album** accrues the screenshots.

```
character/                    # soul (portable identity + history)
  micropolis/                 # organelle — do not flatten into Sims sheet
    ROLE-SHEET.yml            # current + past tenures
    album/                    # family-album cards: "My time as mayor of Foobaropolis"
      01-inauguration/
      02-first-fire/
      ...
    cities/
      foobaropolis.yml        # pointer + stats snapshot, not the whole save
```

---

## Experience that means something

Not XP bars for their own sake — **deep, portable craft**:

- Cleared a flood while keeping RCI balance
- Ran a rezoning fight through city council (proposal → vote → merge)
- Filed and closed GitHub issues that became real map edits
- Photographed disasters for the paper; captions later became album cards
- Reviewed a student mayor’s PR timeline and left a teachable comment

That experience **travels with the character** to other games and shows (Sims job nostalgia, Repo Show guest credit, adventure-4 resume). Micropolis keeps Micropolis organization; sync history, don’t smash schemas — [endosymbiosis](https://github.com/SimHacker/DonHopkins/blob/main/projects/micropolis-moollm/process/character-endosymbiosis.yml).

---

## Family album = tenure record

Screen snapshots of city events land in the character’s **album** (same universal sequence membrane as Sims family albums / blogs / playlists in SOUL-MODEL):

- *My time as mayor of Foobaropolis*
- *Night shift on the bulldozer — industrial fire, 3 a.m.*
- *Council vote: stadium vs park*

Albums are diegetic when re-imported to The Sims (photo book on a coffee table) and documentary when browsed in Soul City / git.

---

## Like a Sims job — orchestrated through Simplifier

Having a Micropolis role is the civic analogue of **having a job in The Sims**: a schedule, a workplace UI, prompts, and a paycheck of *experience + album pages* instead of Simoleons.

Bridge path when the character also lives in The Sims:

1. Custom Sims object / career object (or Simplifier overlay on the career dialog) represents the Micropolis tour of duty.
2. **Simplifier** / computer-use agent ([cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md)) watches the Sims window (or a Micropolis dialog).
3. Game pops a framed prompt: *“Approve rezoning for industrial? [OK] [Cancel] [A] [B] [C]”*
4. Agent screen-scrapes / AX-reads the dialog, decides (character mind / player / LLM policy), injects the button press — **RPC through the glass**.
5. Micropolis applies the command; album gets a frame; role sheet gains a tenure event.

Same observe → recognize → act loop as 2003 Simplifier / TSO bots; now it’s a **consentful job UI** between games, not a silent exploit.

---

## Role catalogue (starter)

Editing tools and civic/git work, each a pluggable socket:

| Role | Typical tools / surfaces |
|------|---------------------------|
| **Mayor** | Budget, overall policy, disaster response authority, inauguration album |
| **Architect** | Large structures, landmarks, design review |
| **Bulldozer driver** | Bulldozer / clear / monster-as-fun-demolition |
| **Zoner** | R/C/I paint, density |
| **City council** | Proposal vote, scarce-fund tradeoffs |
| **Journalist / newspaper writer / blogger** | Narrative of events; GitHub issues-as-press |
| **Photographer** | Snapshot capture → album cards |
| **Data analyzer** | Charts, overlays, evaluation tutors |
| **GitHub issue creator / responder / implementor / reviewer** | Multiverse politics — MultiPlayerIdeas “reporter” fulfilled as real git roles |

Clusters: one character may hold several related roles (mayor + council chair); tools may map many-to-one into a role.

---

## Import / export

| Direction | Meaning |
|-----------|---------|
| **Import character → role** | Bind soul (or WWSFF/adventure-4 pointer) to a vacant socket in a city |
| **Export role sheet** | YAML + album cards leave with the character; city retains audit log of *what was done*, not *who they are* |
| **Cross-game** | Micropolis organelle rides inside the soul next to Sims / CK3 / … organelles |

Character pointers use the usual absolute GitHub URL once + shorthand repo path (`moollm/...`, `WillWrightShowForFood/...`).

---

## Implementation sketch

1. `ROLE-SHEET.yml` schema under character `micropolis/` organelle  
2. City-side `roles/` directory: socket → current occupant + permission mask  
3. Command bus tags actions with `role` + `character_id` (collaborative lineage proposals)  
4. Album compiler: event → screenshot/card → character album  
5. Simplifier bridge: dialog RPC for Sims career / Micropolis prompts  
6. GitHub team mapping for human multiplayer (permissions already half-done)

---

## What this is not

- Not a claim that Micropolis already simulates citizens as Sims  
- Not impersonation of real people without portrayal standards  
- Not flattening mayor sheets into Sims motive stats — membranes stay intact
