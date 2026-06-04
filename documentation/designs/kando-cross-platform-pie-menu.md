# Kando: cross-platform desktop pie menus

## What Don asked the W3C for — shipped as an app, not an extension

**Primary sources:** [Show HN: Kando](https://news.ycombinator.com/item?id=42525290) (29 Dec 2024); Don Hopkins on that thread ([HN comment](https://news.ycombinator.com/item?id=42525290), citing [HN 17106453](https://news.ycombinator.com/item?id=17106453) on Gnome-Pie / Trace-Menu / Coral-Menu); Simon Schneegans, [Why Electron?](https://github.com/orgs/kando-menu/discussions/58); [kando.menu](https://kando.menu) · [github.com/kando-menu/kando](https://github.com/kando-menu/kando); Don's long design comment on an earlier Kando thread — [HN 39228342](https://news.ycombinator.com/item?id=39228342).

**Companion docs:** [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) · [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) · [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) · [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md)

**2026 status:** Active OSS project (~6k GitHub stars). Cross-platform (Windows, macOS, Linux including Wayland via GNOME Shell helper). **Not** a browser extension — a standalone Electron app with OS-level transparent overlay windows.

---

## Summary

[Kando](https://kando.menu) is the working proof that Don Hopkins's 2021 [W3C WebExtensions ask](pie-menus-browser-extensions.md) is **technically correct and implementable** — just not *inside* the extension sandbox. Kando pops **cursor-centered**, **alpha-shaped**, **full-screen-tracked** radial menus rendered with **HTML/CSS** (Electron/Chromium), above every other window, with a **WYSIWYG menu editor** so non-programmers can design their own pies. That is exactly the Slate/WebView overlay pattern ([aquery-programmable-accessibility.md](aquery-programmable-accessibility.md)) — Track (2) from [webextensions #15](https://github.com/w3c/webextensions/issues/15), which was closed as a duplicate of [#160](https://github.com/w3c/webextensions/issues/160) without standardizing shaped overlays for extensions.

Simon Schneegans has been iterating on radial menus for **over a decade** (Gnome-Pie → thesis work on Trace-Menu and Coral-Menu → Kando). Don endorsed the lineage on [HN 42525290](https://news.ycombinator.com/item?id=42525290): Simon gets the Fitts/gesture-space advantages, ships cross-platform, and — critically — built an **easy drag-and-drop editor** so everyone can customize menus for their own workflows without writing JSON by hand (though [JSON config is documented](https://kando.menu/config-files/) for automation).

---

## At a glance — Kando vs the W3C extension gap

| Requirement ([pie-menus-browser-extensions.md](pie-menus-browser-extensions.md)) | Kando |
|---|---|
| Center on cursor | Yes |
| OS window outside browser tab | Yes — dedicated overlay process |
| Alpha / shaped chrome | Yes — transparent frameless window |
| Global mouse tracking for submenus | Yes — menu-level input handling |
| HTML/CSS theming, animations | Yes — Electron renderer + CSS themes |
| Browser extension without extra app | **No** — requires installing Kando |
| ~100MB RAM for Chromium resident | **Tradeoff** — see Electron debate below |

**The lesson:** Track (2) overlay APIs were never standardized for extensions; Kando implements Track (2) by **being its own process** with permission to create topmost transparent windows. Same architectural move as Slate + WebView, scaled to cross-platform.

---

## Lineage: Simon Schneegans

| Project | What it added |
|---|---|
| [Gnome-Pie](http://simmesimme.github.io/gnome-pie.html) | Linux radial launcher; Wayland/GNOME integration lessons |
| **Trace-Menu** (thesis) | [Vimeo 51073078](https://vimeo.com/51073078) — sub-menu nubs preview structure; reserved "back" slice |
| **Coral-Menu** (thesis) | [Vimeo 51072812](https://vimeo.com/51072812) — visual tree browsing into/out of submenus |
| **Kando** | Cross-platform; WYSIWYG editor; themes; controller/touch/stylus focus; JSON automation |

Don's [2018 praise](https://news.ycombinator.com/item?id=17106453) singled out Trace-Menu's parent-slice rollback and Coral-Menu's browse-without-extra-clicks — both connect to [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) (visible geometry beats invisible `<` corridors) and [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md) (Steering Law for tunnel navigation between nested wedges).

On [42525290](https://news.ycombinator.com/item?id=42525290) Don wrote that the WYSIWYG editor is "extremely important because everyone has their own personal use cases" — the same HyperCard / drag-controls-out-of-apps instinct as [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md), but for *launchers* rather than live AX trees.

---

## How Kando relates to Don's design rules

Kando is a reference implementation for several rules spelled out in [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md):

- **Click-triggered, angle-at-release** — Don's [39228342](https://news.ycombinator.com/item?id=39228342) comment (written on an earlier Kando launch thread) applies directly: center on click, direction between press and release, path ignored.
- **Wedges to screen edges** — themes can maximize target area; not cropped to label bounding boxes.
- **Mouse/stylus/tablet workflows** — Schneegans's reply to emacsen on [42525290](https://news.ycombinator.com/item?id=42525290): pies shine when the hand is already on the pointer, not when both hands are on the keyboard.

That maps to the objection table in [pie-menus-fitts-law.md](pie-menus-fitts-law.md): *"Keyboard shortcuts win"* is true at the keyboard; Kando is for the other half of the desk.

---

## The Show HN thread (Dec 2024)

[HN 42525290](https://news.ycombinator.com/item?id=42525290) captures the real tradeoffs when Track (2) ships as its own process instead of waiting on extension APIs.

| Thread | Point | Doc tie-in |
|---|---|---|
| **emacsen** | Typing "F" in a launcher beats mouse pies for daily apps | Keyboard lane vs spatial toolset lane — [pie-menus-fitts-law.md](pie-menus-fitts-law.md) |
| **schneegans** | Creative work keeps hand on mouse/stylus | Same as Sims tool ring, Krita palette, Astroneer counterexample |
| **viraptor** | Built SwiftUI pie menu in ~2 days on Mac | Native minimal prototype vs cross-platform Electron |
| **nine_k / viraptor** | 100MB Electron = Christmas lights powered by a car engine | RAM resident cost vs download size |
| **schneegans** ([discussion #58](https://github.com/orgs/kando-menu/discussions/58)) | 90% is WYSIWYG editor + theming + animation abort/restart; CSS beats hand-rolled GL | Why web renderer for *menus* is rational even if heavy |
| **oulipo** | Dotfile automation across BTT, Alfred, Kando JSON | Federation config story — one `.automation` tree |
| **Teever** | "I wonder what Don Hopkins thinks" | Don had already replied above |

**Tagline nit:** that_guy_iain — "Be precise" suggests aiming at dots, not directions. Pie UX copy matters.

**Platform notes:** macOS natives cite [charmstone.app](https://charmstone.app) and **[pie-menu.com](https://www.pie-menu.com)** (Marius Hauken, App Store/Setapp — per-app shortcut pies, Aug 2024 Show HN: [HN 41160268](https://news.ycombinator.com/item?id=41160268), harvest: [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md)); Linux/Wayland needs [gnome-shell-integration](https://github.com/kando-menu/gnome-shell-integration). Tauri rejected for now — Linux performance blockers per schneegans on thread.

---

## Electron: justified prejudice vs justified engineering

The thread's sharpest engineering argument is not "Electron bad" but **what are you paying 100MB RAM for?**

Schneegans's defense ([discussion #58](https://github.com/orgs/kando-menu/discussions/58), summarized on HN):

- The **WYSIWYG editor** is a complex non-standard UI — not "three buttons and an image."
- **Theming** is CSS-level; users ship elaborate animation themes ([menu-themes repo](https://github.com/kando-menu/menu-themes)).
- **Animation state machines** — abort/restart mid-transition — are awful to rebuild in raw GL.
- **i18n, emoji, touch, stylus, controller** input paths multiply test surface.

Counterpoint ([nine_k](https://news.ycombinator.com/item?id=42525290)): a *menu invocation* path should be closer to **dmenu/rofi** resident memory; the fancy editor can be a separate configure-time app. That split — lightweight runtime vs heavy designer — mirrors Micropolis's own split between in-game pie overlay and catalog authoring tools ([renderer-plugin-roadmap.md](renderer-plugin-roadmap.md)).

Don's historical position (W3C thread, DHTML era) still holds: **use the browser renderer for menu pixels**, don't reimplement Punkemon GIF tables in Win32 GDI. Kando chooses Electron as the portable way to get that renderer **outside** any single browser tab. Slate chose embedded WebView. Micropolis chooses in-canvas WebGL/WebGPU inside `apps/micropolis/`. Same rendering bet, three deployment shells.

---

## Kando vs browser extension vs Micropolis in-app pies

```text
                    cursor-centered   alpha overlay   global capture   web renderer
Kando (Electron)         yes              yes             yes            yes (Chromium)
Browser extension        no*              no*             no*            yes (popup only)
Slate WebView (2013)     yes              yes             yes            yes (WebKit)
Micropolis PieMenu       yes              in-canvas       in-canvas      yes (same app)
aQuery (unbuilt)         yes              yes             yes            yes + AX layer
* Track (2) still missing from WebExtensions — see pie-menus-browser-extensions.md
```

For **MicropolisCore**:

- **Study Kando** for gesture rules, theme JSON, editor UX, and submenu geometry — not for bundling Electron into the city sim.
- **Ship pies in-app** via [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) and `PieMenu.svelte` — no sandbox escape needed.
- **Do not wait** on W3C overlay APIs for Federation shell pies; Kando proves the pattern works today as a **sibling desktop utility**, not as a Chrome extension.
- **Automation vision** (oulipo's `.mdex` sketch on HN) rhymes with command-bus + git-managed config in Simopolis Phase 0 — menus as data, not one-off UI code.

---

## What to steal for Micropolis (and what not to)

| From Kando | Micropolis use |
|---|---|
| JSON/menu schema + documented format | Command-bus pie metadata, i18n keys — [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) TODO #8 |
| CSS theme packs | Renderer plugin themes for city vs Sims verb rings |
| WYSIWYG editor patterns | Family Album / catalog authoring — configure-time heavy, runtime light |
| Trace-Menu back-slice / Coral browse | Nested pie navigation in Family Album graph — [family-album-as-storymaker.md](family-album-as-storymaker.md) |
| Controller / Steam Deck reports | Phase 1F streaming / couch play — [designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) §8a |

| Skip for Micropolis city sim | Why |
|---|---|
| Electron dependency in `apps/micropolis/` | WASM + Svelte already owns the renderer |
| System-wide global launcher | Out of scope — in-world pies only |
| Replacing rofi/Alfred | Complementary tools, not competitors |

---

## Pointers

| Topic | Where |
|---|---|
| Kando site + docs | [kando.menu](https://kando.menu) |
| Source | [github.com/kando-menu/kando](https://github.com/kando-menu/kando) |
| Menu JSON format | [kando.menu/config-files](https://kando.menu/config-files/) |
| Why Electron | [github.com/orgs/kando-menu/discussions/58](https://github.com/orgs/kando-menu/discussions/58) |
| Show HN launch (Dec 2024) | [HN 42525290](https://news.ycombinator.com/item?id=42525290) |
| Don on Simon / Trace / Coral | [HN 17106453](https://news.ycombinator.com/item?id=17106453) · Don on [42525290](https://news.ycombinator.com/item?id=42525290) |
| Long design comment (click, center, edges) | [HN 39228342](https://news.ycombinator.com/item?id=39228342) |
| W3C extension gap (what Kando sidesteps) | [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) |
| Gesture-space rules | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| Gnome-Pie history | [simmesimme.github.io/gnome-pie](http://simmesimme.github.io/gnome-pie.html) |
