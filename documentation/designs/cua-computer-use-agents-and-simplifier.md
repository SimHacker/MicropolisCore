# Bots that drive the GUI: from a TSO maze-solver to Cua

## Twenty-three years of running other people's software with mouse clicks, keystrokes, and a screen-scraper

**Primary sources:** Don Hopkins on TSO bots and *Simplifier* ([HN 11730181](https://news.ycombinator.com/item?id=11730181), follow-up [22790620](https://news.ycombinator.com/item?id=22790620)); [Cua](https://github.com/trycua/cua) (MIT) — Launch HN [43773563](https://news.ycombinator.com/item?id=43773563), Cua Driver [47936312](https://news.ycombinator.com/item?id=47936312), Cua-Bench [46768906](https://news.ycombinator.com/item?id=46768906); 2003 *Simplifier* demo [YouTube @ 3:15](https://youtu.be/Imu1v3GecB8?t=195).

**Companion docs:** [prefab-pixel-reverse-engineering.md](prefab-pixel-reverse-engineering.md) · [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) · [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) §8a · [sims-content-registry.md](sims-content-registry.md)

---

## Summary

A *computer-use agent* drives an application the way a person would: it reads pixels off the screen, recognises what's there, and posts mouse and keyboard events into the input queue. There is no API contract, no source access, no cooperation from the target app. The technique is older than the term — Don Hopkins shipped one against *The Sims Online* in 2003 — and the engineering problems it raises (focus stealing, cursor warp, brittle templates, theme variance, customer-service load when bots act on behalf of strangers) are the same problems Cua, Anthropic Computer Use, and OpenAI Operator are now wrestling with at scale. This is the lineage and the engineering shape; Micropolis Home re-enters it as Simplifier reborn.

---

## At a glance

| Era | Tool | Recognition | Actuation | Why it shipped |
|---|---|---|---|---|
| 2003 | TSO Simoleon bot | Pixel scrape of the maze view | Injected clicks on arrow buttons | Solving a co-op puzzle alone, faster than two humans |
| 2003 | *Simplifier* (TSO catalog) | Template-match on bitmap Comic Sans + icon regions | Press/hold pie-menu actions + speech-synth read-back | Players had thousands of mods and no search |
| 2010–14 | Dixon/Fogarty Prefab | General pixel → widget tree, learned from examples | Overlay widgets; no native actuation | Research demo: "what if every GUI were open source?" |
| 2015 | aQuery (Don, proposed) | AX-first, Prefab fallback | JavaScript event bindings + pie/HUD overlays | Never shipped — pieces ended up in Hammerspoon, MCP, VLMs |
| 2024–26 | Cua | AX, screenshots, OmniParser, UI-Tars, VLMs | `SLEventPostToPid` + yabai focus-without-raise | LLM agents need to run desktop apps; full host access is risky |
| 2026 | Simplifier reborn | Vision-LLM + Sims IFF registry | Optional non-focus-stealing observation only | Streamers narrating builds, accessibility, content rediscovery |

---

## Prehistory: a Simoleon-printing bot becomes a catalog reader

In 2003, *The Sims Online* paid Simoleons for in-game minigames designed to *force* multi-player interaction. One was a two-player maze: one Sim is in the maze and only sees adjacent walls; the other Sim sees the overhead map but not where the first Sim is, and has to guide them out by chat. Designed-in tedium — and therefore a high reward.

Hopkins wrote a bot, recounted on [HN 11730181](https://news.ycombinator.com/item?id=11730181):

> I would run two TSO clients at the same time, logged into different accounts in different windows. The bot attached to both of them, then screen scraped pixels and injected events to repeatedly solve mazes by moving the player around until it identified where they were, solving for the shortest path, and bringing them straight home quickly by machine-gun clicking on the arrow buttons.

Two clients, two characters, one driver. The same code path as 2026 Cua's "drive multiple sandboxes in parallel" — twenty years earlier. The bot recognised the maze view by pixel inspection and injected keyboard/mouse events into both TSO processes. It made "bleeping and kaching sounds as it solved the mazes and printed money".

Simoleons were sold on eBay until customer-service problems killed it. TSO's transfer UI shipped two relevant primitives:

- **Hand-to-hand** at the recipient's lot, $1,000 per transaction
- **Tip jar**, fillable via pie menu at $5,000 per click; emptiable the same way

Hopkins built a relay: customer lines up tip jars in a row, bot fills them at $5,000 each via the pie menu, customer empties them as fast as the bot fills them, both walk back to the start of the row and repeat. A million Simoleons in 200 transactions instead of 1,000. Pie-menu-driven exploit of an MMO economy ([pie-menus-fitts-law.md](pie-menus-fitts-law.md)).

When the eBay business folded, the bot was repurposed:

> So the unemployed Sims bot wouldn't feel bored, I retrained it into a more practical assistive utility called *Simplifier*, which knew how to recognize and navigate the Sims user interface to show, scroll through, and enumerate all the many items, wallpapers, floor tiles, etc, in the catalog.
>
> It took snapshots of the icons, and read the text off the screen to capture the title, price and description (it was all in a bitmap Comic Sans font, so it was easy for a bot to recognize, if not for your eyes to read), and made a searchable illustrated database of all your built-in and downloaded content. — [HN 11730181](https://news.ycombinator.com/item?id=11730181)

So *Simplifier* is not "machine vision". It is **template matching on fixed UI chrome and known-font text**, plus **input-queue injection** to drive scrolling. Same problem class as Dixon's [Prefab](prefab-pixel-reverse-engineering.md), shipped seven years earlier against a specific game.

Two further use cases mattered:

- **Catalog publishers** — Sims content sites used it to auto-generate illustrated catalogs from a player's installed content.
- **Manual read-aloud** — press and hold an icon, speech synthesizer reads the description. *"Useful for kids learning to read, old farts with bad eyesight, and snobby designers who hate Comic Sans"*. Same audience the 2026 Simplifier targets explicitly — [§8a T.13](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful).

Demo at [3:15 in the EA video](https://youtu.be/Imu1v3GecB8?t=195) alongside Transmogrifier, RugOMatic, ShowNTell, and SliceCity.

---

## The shape of the problem

Anything that drives a third-party GUI ends up making the same three choices.

### 1. How do you know what's on the screen?

| Approach | Strength | Failure mode |
|---|---|---|
| **Accessibility tree** (AX, UIA, ATK) | Real semantics — role, name, value, parent | Canvas apps, Electron, games, Blender expose almost nothing |
| **Pixel template match** | Works on anything you can render | Brittle to theme, font, scale; one redraw breaks you |
| **Trained widget recognition** (Prefab) | Cross-app, cross-OS via VNC | Needs example images per widget class |
| **Vision-language model** (GPT-4V, Qwen-VL, OmniParser, UI-Tars) | Generalises across skins | Hallucinations, latency, cost, layout drift |

Cua Driver's principal engineer Francesco Bonacci, on the Cua Driver Show HN ([47936312](https://news.ycombinator.com/item?id=47936312)):

> The right addressing mode depends on the app. Native macOS apps usually have rich AX trees, Chromium-family apps often need a hybrid of AX and screenshots, and apps like Blender or CAD tools may expose almost no useful AX surface. The mistake is defaulting to pixels everywhere — or defaulting to AX everywhere.

That is exactly the hybrid Don sketched for [aQuery](aquery-programmable-accessibility.md) in 2015 ([HN 11520967](https://news.ycombinator.com/item?id=11520967)): selectors over AX where it works, Prefab pattern matching where it doesn't, JS handlers gluing both to a customisable widget layer.

### 2. How do you act on the screen?

On macOS this is harder than people expect. Cua Driver's blog post [*Inside macOS Window Internals*](https://github.com/trycua/cua/blob/main/blog/inside-macos-window-internals.md), summarised in [47936312](https://news.ycombinator.com/item?id=47936312):

| API | Effect |
|---|---|
| `CGEventPost` | Posts through the HID stream → cursor visibly warps to click target |
| `CGEvent.postToPid` | Targeted at a process — but Chromium drops untrusted events at the renderer IPC |
| Activate window first | Raises the window and steals the user's Space |

Cua's fix: `SLEventPostToPid` (private SkyLight API) plus yabai-style focus-without-raise plus an off-screen primer click at (-1, -1) that warms event-routing without disturbing the user. The agent clicks; the user keeps typing in their actual focused window; the click lands in a background app.

The 2003 TSO bot solved the same problem with brute force — it owned the box, so it could just blast Win32 messages and steal focus.

### 3. Where does the agent run?

| Posture | When it's right | What you give up |
|---|---|---|
| **VM sandbox** (Cua Sandbox, Lume on Apple Silicon) | Untrusted agent code; parallel/CI runs; SOC2/HIPAA isolation | macOS VM licensing limits; heavier; not your real files |
| **Background host driver** (cua-driver, Hammerspoon-style) | Coding agent on *your* Mac while you keep working | The host *is* the trust boundary; full TCC permissions required |
| **Co-op window** (cuabot) | Agent has its own window beside yours; you watch via H.265 stream | Shared clipboard means accidental data flow |
| **Co-resident bot** (2003 TSO) | Personal use, your account, your machine | Bans, eBay drama, customer service |

Launch HN thread ([43773563](https://news.ycombinator.com/item?id=43773563)) calls out the use cases driving this: Tableau/Photoshop/CAD copilots, legacy ERP front-ends, anti-bot fashion-drop automation, kiosk agents helping elderly users through tax portals. Same character as 2003 TSO — automate the parts the UI made deliberately painful.

---

## Cua's stack, in one read

[github.com/trycua/cua](https://github.com/trycua/cua) — MIT-licensed:

- **cua-sandbox** / `pip install cua` — spin up an isolated macOS / Linux / Windows / Android environment, run agent code in it.
- **Lume** — Apple Silicon VM manager built on Virtualization.framework.
- **cua-driver** — the background-actuation library above; ships an MCP server and CLI so Claude Code / Cursor / Codex can call it.
- **cua-agent** — agent loops with adapters for OpenAI Computer Use, Anthropic Computer Use, OmniParser, UI-Tars, vision VLMs.
- **Cua-Bench** — cross-OS evaluation: OSWorld, Windows Agent Arena, synthetic "shell apps" (fake Slack/Spotify) with programmatic rewards.
- **cuabot** — co-op sandbox windows on your desktop.

Cua-Bench's headline result ([46768906](https://news.ycombinator.com/item?id=46768906)):

> An agent with 90% success on Windows 11 might drop to 9% on Windows XP for the same task.

Theme, font, and DPI changes are catastrophic for pixel-trained agents. The 2003 Simplifier survived only because The Sims's Buy Mode chrome and Comic Sans never moved. The next Simplifier ([§8a T.13](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful)) cannot rely on that — the Legacy Collection's catalog UI is the same, but every custom-content mod ships its own thumbnails and descriptions, and Steam scaling moves coordinates. So it's vision-LLM front, [sims-content-registry.md](sims-content-registry.md) semantic resolver behind, and Web Speech API / MOOLLM TTS as the read-aloud channel.

---

## Lineage in one column

The same observe-recognise-act loop, with the recognition layer getting smarter and the actuation layer getting less rude.

```
2003 Simplifier (Comic Sans + injected clicks, Win32)
   ↓
2010 Prefab (learned widget templates, VNC any OS)
   ↓
2015 aQuery (AX-first hybrid, never shipped)
   ↓
2016+ Hammerspoon, RobotJS, AppleScript — pieces of the dream
   ↓
2023+ MCP — the plugin layer aQuery wanted
   ↓
2024 Anthropic Computer Use / OpenAI Operator — LLM in the loop
   ↓
2025 Cua — open MIT stack: sandbox + driver + agents + bench
   ↓
2026 Simplifier reborn — Cua-shaped substrate, Sims-shaped semantics
```

The thing Cua is general-purpose; the thing Simopolis Simplifier adds is **IFF knowledge, cozy-game inclusion rules ([og-cozy-games.md](og-cozy-games.md)), provenance via the [Sims Content Registry](sims-content-registry.md), and integration with the [Imagine Loop](the-imagine-loop.md) and [Tornado archives](the-tornado-and-the-archives.md).** General desktop substrate vs domain-specific catalog reader.

---

## Why this matters for Micropolis

[Simopolis](simopolis.md) ships content for the EA-published Sims 1 Legacy Collection. We do not run the simulator; the player does. That means *every* interaction with the live game window is the computer-use-agent problem:

1. **Phase 1F Simplifier (T.13)** reads the Buy Mode catalog of the running game. Vision-LLM recognises items; registry resolves IFF identity; TTS reads price and description. Streamers narrate builds; low-vision users browse without squinting at bitmap Comic Sans; chat can ask *"where did this lamp come from?"* and get a real answer.
2. **Capture posture** — passive screenshots only at first. The 2003 Simplifier could inject events because it ran on Don's box for Don's use. The 2026 Simplifier runs on streamers' boxes for their audiences' use; we cannot risk stealing focus mid-stream or moving the cursor mid-build. cua-driver-style background injection is an opt-in advanced mode, not the default.
3. **Bench discipline** — vary catalog mods like Cua-Bench varies OS skins. A Simplifier that works against vanilla Maxis content but breaks on a SimSlice expansion is useless.
4. **Federation posture** — Cua is MIT, Micropolis is GPL, EA's Sims 1 is closed but documented. We ship integrations via documented file formats and observation, not via reverse-engineering the executable. Same shape as Maxis-blessed Transmogrifier in 2000 ([the-computer-as-portal.md](the-computer-as-portal.md)).

The Simopolis-specific work is *not* the agent loop — Cua and its successors will handle that. The work is the **Sims-shaped recognition** (catalog tabs, IFF semantics, fan-mod metadata) and the **streamer-shaped UX** (overlays, VOD markers, save-file giveaways) in [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) §8a.

---

## Pointers

| Topic | Where |
|---|---|
| Original TSO bot story | [HN 11730181](https://news.ycombinator.com/item?id=11730181) (parent story [11725905](https://news.ycombinator.com/item?id=11725905), *Bots Are Hot, 1996*) |
| Tip-jar Simoleon delivery exploit | Same thread, retold in [22790620](https://news.ycombinator.com/item?id=22790620) on OpenTTD off-by-one tunnel exploit story |
| 2003 Simplifier demo | [youtu.be/Imu1v3GecB8?t=195](https://youtu.be/Imu1v3GecB8?t=195) |
| Cua Launch HN | [43773563](https://news.ycombinator.com/item?id=43773563) |
| Cua Driver Show HN | [47936312](https://news.ycombinator.com/item?id=47936312) — focus-without-raise, SLEventPostToPid |
| Cua Driver writeup | [inside-macos-window-internals.md](https://github.com/trycua/cua/blob/main/blog/inside-macos-window-internals.md) |
| Cua-Bench Show HN | [46768906](https://news.ycombinator.com/item?id=46768906) — 90% on Win11 → 9% on XP |
| Prefab papers | [prefab.github.io](https://prefab.github.io/) — see [prefab-pixel-reverse-engineering.md](prefab-pixel-reverse-engineering.md) |
| aQuery wiki (archive) | [donhopkins.com/mediawiki/index.php/AQuery](https://web.archive.org/web/20180826132551/http://donhopkins.com/mediawiki/index.php/AQuery) |
| §8a Twitch / Simplifier reborn | [`designing-inward-miyamoto-principles.md` §8a T.13](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) |
| Sims Content Registry (the semantic layer) | [sims-content-registry.md](sims-content-registry.md) |
| Build plan (Phase 1F, item 1F.12) | [simopolis-uplift-roadmap.md → Phase 1F](simopolis-uplift-roadmap.md#phase-1f--twitch-friendly-streaming-features-3-5-weeks-parallelizable-with-1b--1c--1d--1e) |
