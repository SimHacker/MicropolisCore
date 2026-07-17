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
**Loathing:** pretending the city under the cursor is a spreadsheet with a theme pack.

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
7. **No EA assets in the kit.** Themes may *evoke* Sims-era shell language; ship no copyrighted art. Users bring their own game files and screenshots.
8. **Name decompresses.** *Gonzo Pie Menus*, *Gonzo Tabbed Windows* — HST + shop history. Package ids may stay `gonzo-*` / `GZ` without requiring a Disney story.

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
Classical HCI (visible state) ─┼──► Gonzo UI (inhabited, stunt-capable chrome)
Felt-creature stagecraft ──────┘
         │
         ▼
  PieCraft · PIE-TAB-WINDOWS · TileView · Overlays · Holodeck
```

If a change makes the city harder to *feel with*, it fails this manifest even if it screenshots cleaner.

---

## K-lines

- **GONZO-UI** — invoke this file
- **FELT CREATURES** — material *and* empathy; leave nap
- **FEAR AND LOATHING** — refuse sterilized chrome and gaslight errors
- **STUNT AFFORDANCE** — pies, bounce, talking labels
- **INHABITED CHROME** — authorship visible; splash text allowed to smirk
