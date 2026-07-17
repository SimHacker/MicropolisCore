# Gonzo UI Manifest — fear and loathing of traditional chrome

**Status:** Constitutional design notes for MicropolisCore UI modules  
**Monorepo:** MicropolisCore  
**Companion docs:** [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md) · [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) · [piecraft/README.md](piecraft/README.md) · [../notes/PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) · [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md) · [map-compositing-and-measurement.md](map-compositing-and-measurement.md) · [ui-frame-nine-slice.md](ui-frame-nine-slice.md) · [simcity-tool-palette-design.md](simcity-tool-palette-design.md)

> *Gonzo Interface Design* — UI that reports from **inside** the interaction: subjective, stunt-capable, sincerely weird. Journalism’s immersion crossed with stagecraft’s commitment. No borrowed trademarks. No borrowed mascots. Nap left on the felt.

---

## Why this file exists

MicropolisCore’s interaction stack — pie menus, tabbed stacks, tile views, overlays, measures, direct manipulation — inherits two shop names and one method:

1. **Shop name (history).** Inside *The Sims* Framework, the Windows UI shell was codenamed **Gonzo** (`gonzo.h`, `Gonzo::Main`, Win32 class `"Gonzo"`, `GZ*` types; companion umbrella **Rizzo**). It was never a consumer SKU. Reusing the word here reclaims an insider label the way **Micropolis** reclaimed the city sim after **SimCity** stayed trademarked — different legal story, same instinct: keep the name that meant something in the room.
2. **Method (HST).** [Gonzo journalism](https://en.wikipedia.org/wiki/Gonzo_journalism) puts the reporter *in* the story; subjectivity is the instrument. Gonzo UI puts the **designer and the user’s nervous system** in the chrome — splash text, honest errors, present-tense mess — instead of fake-objective system voice.
3. **Stagecraft (felt creatures).** Handmade performance that invites empathy: soft edges, visible seams, earnest absurdity. **Felt creatures** is the K-line — *felt* the material and *felt* the verb. The audience completes the creature. Sims diamonds and need bars already run on that economy. Gonzo UI refuses to sand the nap off until feelings can’t stick.

This manifesto does **not** ship Muppet characters, logos, or likenesses. The inheritance is craft energy, not franchise IP.

Gonzo UI is **not** an excuse to abandon classical HCI. It sits *beside* Shneiderman / Tog / Weiser: [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md) keeps **visible state, feedback, reversibility**. Aesthetic-minimalist UI hid state and called it calm. Gonzo UI makes state *felt* — legible *and* inhabited.

---

## Fear and loathing of traditional UI design

What we refuse (the Las Vegas of chrome):

| Traditional habit | Why we loathe it |
|-------------------|------------------|
| Invisible “professional” chrome | Lies about authorship; trains users that software has no taste |
| Objective system voice | “An error has occurred” — the computer gaslights while drowning |
| Usability as sterilization | Removes every cue that would let empathy and muscle memory grow |
| Retro in quotation marks | Irony-poisoned nostalgia; costume without commitment |
| Screenshot-first design | Ships the Q3 keynote still; users inherit the hangover |
| Hidden gesture modes | Modes without handles; calm tech misread as illegibility |
| Dashboard voyeurism | Watching numbers instead of grabbing the world |
| Error shame | Red banners that punish exploration |

**Fear:** shipping another strip of flat blue pills that could belong to any SaaS.  
**Loathing:** pretending the city under the cursor is a spreadsheet — or locking Gonzo to one game’s chrome so the next bridge has nowhere to live.

---

## The muppetry of Gonzo UI (no trademarks)

Stagecraft rules we *do* keep:

- **Commitment to the bit.** If the shell is playful, go all the way — splash text, nine-slice frames, talking pie labels — no apologetic “ironically retro.”
- **Stunt affordances.** Pie menus are the high-dive: showy, learnable, a little dangerous, memorable when you stick the landing ([gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)).
- **Category refusal.** A toolkit that is theme *and* holodeck *and* fan-culture joke without needing a solemn product category first.
- **Failure as entertainment.** Missed slices, invalid placement bounce, comic empty cards — charm, not shame.
- **Felt creatures.** Leave nap. Sparse signals, fat projection. The user finishes the feeling.

---

## Constitutional directives

1. **LEAN INTO the hands.** Design inward from the gesture (Miyamoto / [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md)); Gonzo adds: the face in the splash text is allowed to smirk.
2. **Visible state, inhabited.** Classical HCI visibility + subjective host voice. Never hide a scrollbar to look modern.
3. **Direct manipulation first.** Continuous representation, rapid reversible incremental feedback ([Shneiderman](https://en.wikipedia.org/wiki/Direct_manipulation_interface)). Gonzo means the *feedback has character* — bounce, blink, label — not that we replace DM with forms.
4. **Pies saturate gesture space.** Prefer self-revealing radials over blind multitouch counts ([automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md)).
5. **Tabs and stacks are HyperCard with nap.** Cards on any edge; pie on the tab without raising the wrong overlay ([PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md)).
6. **Maps are places, not charts.** Zoom, pan, and overlays should feel like moving a camera through a city — measures are costumes the world wears ([map-compositing-and-measurement.md](map-compositing-and-measurement.md)).
7. **No EA assets in the kit.** Skins may *evoke* a game’s shell language; ship no copyrighted art. Users bring their own game files and screenshots.
8. **Name decompresses.** *Gonzo Pie Menus*, *Gonzo Tabbed Windows* — HST + shop history. Package ids may stay `gonzo-*` / `GZ` without requiring a Disney story.
9. **Totally skinnable — never Sims-hardcoded.** Gonzo is the *hands* (interaction kernel). Skins are the *costume*. Structure, gesture, DM, pies, tabs, frames stay skin-agnostic; tokens, nine-slice atlases, fonts, cursors, splash voice, and motion accents live in a **skin pack**. First ship skin: **Sims-evoking** for the Sims ↔ Soul City bridge. Next skins match their games. Hardcoding Sims chrome into components paints us into a corner.

---

## Bridge skins (Soul City hub-and-spoke)

Soul City routes characters and content through many game bridges. Each active bridge UI should **read as that game at a glance** — so when several bridges are open and souls are moving between them, you never wonder which world you’re touching.

| Layer | Owns | Must not own |
|-------|------|----------------|
| **Gonzo kernel** | Gesture model, pie geometry, tab/stack behavior, Frame layout, DM contracts, a11y tree | Hardcoded Sims colors, fonts, diamond chrome, or any one game’s art |
| **Skin pack** | CSS/theme tokens, nine-slice atlases, cursor sets, iconography, splash/error voice, motion accents, optional SFX | Interaction semantics (slice count logic, commit rules, undo) |
| **Bridge binding** | Which skin pack attaches to which spoke (Sims, Micropolis, Stardew, Tiny Life, Shattered, Afterlife, …) | A second pie/tab implementation per game |

**Rules of the road**

1. **One kernel, many skins.** New game bridge ⇒ new skin pack (or fork of an existing pack), not a fork of `PieMenu.svelte`.
2. **Distinctive by design.** Two bridges open at once must be visually unmistakable — silhouette, palette, chrome language — without relying on a tiny logo badge.
3. **Sims first, not Sims forever.** `skin-sims` (working id) is the v1 pack for the Sims bridge: plumbob-adjacent cues, warm panel chrome, need-bar grammar *evoked*, not copied from EA assets.
4. **Soul City hub chrome** may use a neutral or heavenly host skin; spoke windows wear their game skins. Dragging a character across the hub should feel like changing airports, not changing themes on the same SaaS tab.
5. **Tokens only at the leaf.** Components consume `var(--gonzo-*)` / Frame atlas ids from the active skin context — never hex literals for “the Sims look” inside shared modules.
6. **Evoke, don’t infringe.** Same rule as directive 7: fan-legible resemblance; no ripped UI bitmaps from commercial installs in the repo.

```text
  Soul City hub
       │
       ├── bridge: Sims        → skin-sims
       ├── bridge: Micropolis  → skin-micropolis (city / RCI grammar)
       ├── bridge: Tiny Life   → skin-tiny-life
       ├── bridge: Stardew     → skin-stardew
       └── bridge: …           → skin-<game>
            │
            └── all mount the same Gonzo kernel (pies, tabs, frames, DM)
```

Companion primitives: [ui-frame-nine-slice.md](ui-frame-nine-slice.md) (atlas per skin) · [federation-peer-games.md](federation-peer-games.md) (which spokes exist).

### GUIDB as design corpus — reinterpret bad chrome, keep the soul

Skinnable Gonzo is also a **rescue mission**. Many shipped game UIs look distinctive but *feel* bad: mystery-meat radials, inventory grids that fight Fitts, modal stacks that trap the world, HUDs that hide state. Soul City bridge UIs get to **wear that game’s face** while swapping in Gonzo hands — pies, tabbed frames, inhabited chrome, stunt affordances.

**Primary guidance source:** Edd Coates’s [Game UI Database](https://www.gameuidatabase.com/) (Guinness World Record; 73k+ screens) — the industry’s curated catalog of what games actually shipped. Pull real examples (hits *and* misses) as briefs for each skin pack. Do not scrape GUIDB for training corpora; cite screens on-air and in design notes with attribution, per Edd’s terms and the Repo Show anti-slop posture.

| GUIDB finds | Gonzo / skin response |
|-------------|------------------------|
| Great look, awful gesture | Keep silhouette/palette in the skin; replace interaction with pies + mouse-ahead |
| Good radial, unstable slices | Stable 8/12-way directions; items move *inside* slices |
| Beautiful panels, modal trap | Same frame language as tabbed/stack cards that peel and return |
| Genre HUD clichés that hide state | Evoked HUD costume + classical visible-state HCI underneath |

**Talk-with-Edd thread** (WWSFF): [pie-menus-piecraft.yml](https://github.com/SimHacker/WillWrightShowForFood/blob/main/repo-shows/edd-coates/pie-menus-piecraft.yml) — live GUIDB browse → annotate failure modes → co-design bridge skins that reinterpret those screens without losing game-legible identity.

---

## Applied: fear/loathing vs Gonzo, by module

### Direct manipulation

| Fear & loathing | Gonzo |
|-----------------|--------|
| Property sheets for everything that should be a drag | Grab the object; the world answers under the cursor |
| Commit dialogs for incremental edits | Continuous representation; undo is the safety net |
| Ghosts that lie about validity | Invalid placement *bounces* with a readable reason |

### Pie menus

| Fear & loathing | Gonzo |
|-----------------|--------|
| Linear menus that waste gesture space | Radial slices; angle-at-release; mouse-ahead rehearsal |
| Icons without rehearsal path | Self-revealing wedges; talking labels when voice helps |
| Patent FUD paralysis | Ship the interaction; see [pie-menu-patent-fud.md](pie-menu-patent-fud.md) |

Modules: `PieMenu.svelte`, PieCraft model, holodeck pie plugin, [virtual-pointer-and-pie-cursors.md](virtual-pointer-and-pie-cursors.md).

### Tabbed windows / stacks / cards

| Fear & loathing | Gonzo |
|-----------------|--------|
| Single top tab strip as religion | Tabs on **any** edge; stacks that float and dock |
| Modal dialogs that trap the city | Cards that peel into overlay floats and return |
| Chrome that ignores the chat nexus | Chat + sim messages as actionable navigation |

See [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md).

### Tile views / mapping / zoom / scroll

| Fear & loathing | Gonzo |
|-----------------|--------|
| Zoom that loses the cursor’s meaning | Zoom around the point of interest; tile-frame cursor stays honest |
| Scrollbars deleted for “clean” | Scrollbars as felt handles; autoscroll that respects the pie |
| Minimap as unread decoration | Minimap rectangles you can drag — cameras you can grab |

`TileView`, editor vs map cards, pinned live views (helicopter/monster).

### Overlays / data visualization

| Fear & loathing | Gonzo |
|-----------------|--------|
| Detached chart dashboards | Metrics as **costumes on the map** — MOP/color planes composited in place |
| Legend in a PDF | Legend as cursor/palette language ([ui-frame-nine-slice.md](ui-frame-nine-slice.md), tool palette borders) |
| One overlay to rule them all | Stackable planes; measures as bindable JSON props |

See [map-compositing-and-measurement.md](map-compositing-and-measurement.md), sprite overlay playbooks.

### Tool palettes / cursors

| Fear & loathing | Gonzo |
|-----------------|--------|
| Flat icon grids with no cost language | Totem-pole palette; icon size ↔ cost; border = cursor legend |
| System arrow for every tool | Tool cursors as characters in the scene |

See [simcity-tool-palette-design.md](simcity-tool-palette-design.md).

---

## Naming

| Use | Form |
|-----|------|
| Manifest / philosophy | **Gonzo UI**, *Gonzo Interface Design* |
| Features | Gonzo Pie Menus, Gonzo Tabbed Windows, Gonzo Tile Views |
| Code / packages | `gonzo-*`, `GZ` prefix where it echoes Framework history |
| Public story | HST method + Maxis shop codename + felt-creature craft |
| Never | Muppet characters, logos, “official” franchise cosplay |

Micropolis renamed the *city* product. Gonzo names the *hands* — the shell you feel with.

---

## Relationship to other constitutions

```text
Miyamoto (hands/face inward) ──┐
Classical HCI (visible state) ─┼──► Gonzo kernel (inhabited, stunt-capable chrome)
Felt-creature stagecraft ──────┘              │
                                              ▼
                         Skin packs (Sims first; one pack per bridge)
                                              │
                                              ▼
              PieCraft · PIE-TAB-WINDOWS · TileView · Overlays · Holodeck
```

If a change makes the city harder to *feel with*, it fails this manifest even if it screenshots cleaner.  
If a change bakes one game’s look into the kernel so the next bridge can’t wear its own face, it also fails.

---

## K-lines

- **GONZO-UI** — invoke this file
- **FELT CREATURES** — material *and* empathy; leave nap
- **FEAR AND LOATHING** — refuse sterilized chrome and gaslight errors
- **STUNT AFFORDANCE** — pies, bounce, talking labels
- **INHABITED CHROME** — authorship visible; splash text allowed to smirk
- **BRIDGE SKIN** — spoke UI matches its game; multi-bridge sessions stay obvious
- **SKINNABLE KERNEL** — tokens/atlases out; Sims is v1 costume, not the architecture
- **GUIDB BRIEF** — use Game UI Database examples (cite, don’t scrape) as skin + gesture redesign briefs
- **REINTERPRET** — keep the game’s face; replace bad hands with Gonzo pies/tabs/frames
