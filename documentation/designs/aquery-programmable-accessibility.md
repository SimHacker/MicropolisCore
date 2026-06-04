# aQuery: jQuery for the accessibility tree

## A scriptable layer over every app on your machine — that nobody ever shipped

**Primary sources:** Don Hopkins on RobotJS — [HN 9977226](https://news.ycombinator.com/item?id=9977226) on [9973272](https://news.ycombinator.com/item?id=9973272); Don to Morgan Dixon — [HN 11520967](https://news.ycombinator.com/item?id=11520967); Autumn thread bibliography — [HN 18797818](https://news.ycombinator.com/item?id=18797818) on [18794928](https://news.ycombinator.com/item?id=18794928); Slate + aQuery — [HN 18797587](https://news.ycombinator.com/item?id=18797587); [aQuery wiki (archive)](https://web.archive.org/web/20180826132551/http://donhopkins.com/mediawiki/index.php/AQuery).

**Companion docs:** [prefab-pixel-reverse-engineering.md](prefab-pixel-reverse-engineering.md) · [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md) · [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) · [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md)

---

## Summary

In 2015 Don Hopkins proposed *aQuery* — a JavaScript library that does for the operating-system accessibility tree what jQuery did for the DOM. CSS-style selectors over UI elements; event bindings that fire when matching widgets appear; plugins that render pie menus, overlays, and speech UI; a hybrid recogniser that falls back to [Prefab](prefab-pixel-reverse-engineering.md)-style pixel matching when the AX tree is empty. It never shipped. Almost every piece of it shows up somewhere in 2026 — [Hammerspoon](https://www.hammerspoon.org/), MCP servers, [Cua Driver](cua-computer-use-agents-and-simplifier.md), browser extensions, vision-LLM agents — but the *integrated, user-extensible, cross-platform layer* is still missing. Worth reading because the missing layer is the one Micropolis Home needs.

---

## At a glance

- **Metaphor not dependency.** "Like jQuery for accessibility" — selectors and plugins, no HTML required.
- **Hybrid recognition.** AX tree first, [Prefab](prefab-pixel-reverse-engineering.md) pixel matching second.
- **Plugin widgets.** Pie menus, speech, video overlay, voice control — bound to any app.
- **Inspiration sources Don cites:** jQuery, [mutation-summary](https://web.archive.org/web/20150325120000/https://code.google.com/p/mutation-summary/) (DOM-mutation callbacks), [Slate](https://github.com/jigish/slate) (JS-extensible Mac WM with a hidden WebView), [HyperCard](https://en.wikipedia.org/wiki/HyperCard) (drag-out-of-app composition), Buxton's [marking menus](pie-menu-patent-fud.md).
- **2026 status:** unbuilt as one product; partial implementations scattered.

---

## The proposal

Don's original pitch to the [RobotJS](https://github.com/octalmage/robotjs) thread ([HN 9977226](https://news.ycombinator.com/item?id=9977226) on [9973272](https://news.ycombinator.com/item?id=9973272)):

> aQuery — like jQuery, but for selecting, querying and manipulating Mac app user interfaces via the Accessibility framework and protocols.
>
> So you can write jQuery-like selectors that search for and select Accessibility objects, and then it provides a convenient high level API for doing all kinds of stuff with them. So you can write higher level plugin widgets with aQuery that use HTML with jQuery, or even other types of user interfaces like voice recognition/synthesis, video tracking, augmented reality, web services, etc!
>
> For example, I want to click on a window and it will dynamically configure jQuery Pie Menus with the commands in the menu of a live Mac app. Or make a hypercard-like user interface builder that lets people drag buttons or commands out of Mac apps into their own stacks, and make special purpose simplified guis for controlling and integrating Mac apps.

Five distinct ideas live in that paragraph; pulling them apart is most of this document.

### Selectors over a tree that already exists

Every modern OS exposes an [accessibility tree](https://en.wikipedia.org/wiki/Computer_accessibility) — on macOS through `NSAccessibility`, on Windows through UI Automation, on Linux through AT-SPI/ATK. Each node has a role (`AXButton`, `AXTextField`), a name, a value, parents, and children. It is shaped enough like the DOM that CSS-style selectors are the obvious query language: `AXButton[name="Save"]`, `AXWindow > AXToolbar AXButton:first-child`. Don's [aQuery wiki](https://web.archive.org/web/20180826132551/http://donhopkins.com/mediawiki/index.php/AQuery) sketches the syntax.

Selectors are the part everybody has independently reinvented — [Hammerspoon](https://www.hammerspoon.org/) Lua bindings, the Apple `axctl` private tool, every UI test framework. None of them are *the layer all your apps share*.

### Event binding when matching UI appears

The DOM analogue is [mutation-summary](https://web.archive.org/web/20150325120000/https://code.google.com/p/mutation-summary/): a jQuery plugin that fires callbacks when nodes matching a pattern appear or vanish. aQuery wants the same primitive over AX:

> So when some user interface objects you're interested in controlling come into existence, you can wrap them with your own "widget" to glue them into whatever other user interface you want to provide. (pie menus, hyperlook, ar, speech recognition, etc). — [9977226](https://news.ycombinator.com/item?id=9977226)

Concretely: when a Save dialog opens in *any* app, attach a pie menu to its buttons. When a video player widget appears in Chrome, QuickTime, or VLC, hook it with a single shared scrubbing-by-gesture widget. The aQuery wiki proposes a generic *video-player adapter widget* that papers over the differences between underlying players (also noted in [HN 11520967](https://news.ycombinator.com/item?id=11520967)).

### Plugin widgets that are not HTML

This is the part jQuery does not give you for free. aQuery widgets are pie menus, [Dasher](dasher-steering-law-accessibility.md) panels, speech UIs, AR overlays — none of them DOM-shaped. Don already had [jQuery Pie Menus](https://web.archive.org/web/20150325120000/http://donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus) as an HTML-rendered prototype; aQuery would deploy them as *overlays on top of unrelated apps*. The Slate window manager pattern ([github.com/jigish/slate](https://github.com/jigish/slate)) — JS extensions running in a hidden WebView with NSAccessibility bindings — is the implementation shape Don cites repeatedly ([HN 18797587](https://news.ycombinator.com/item?id=18797587)). HTML/Canvas for rendering, native for input and AX, JS for scripting.

In 2013 Don made Slate's WebView a **transparent topmost overlay** (`kCGPopUpMenuWindowLevel`, clear `NSWindow` background) to draw HTML pie menus above all other Mac windows — see [slate#322](https://github.com/jigish/slate/issues/322) and [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md). That works; a **browser extension cannot**. The W3C WebExtensions thread ([#15](https://github.com/w3c/webextensions/issues/15#issuecomment-4536704942)) separates programmatic `action.openPopup()` (password-manager track) from the **shaped global overlay + capture** track pies actually need. aQuery is the OS-native version of the second track; Micropolis in-page pies sidestep both by owning the canvas.

### Hybrid recognition: AX *and* pixels

The accessibility tree is the right answer when it's available, but it's missing or broken in a lot of places — canvas-rendered apps, Electron without proper a11y wiring, full-screen games, Blender, every CAD tool, anything that draws its own widgets. Don's plan ([HN 11520967](https://news.ycombinator.com/item?id=11520967)) is to integrate [Prefab](prefab-pixel-reverse-engineering.md) as the pixel fallback:

> Screen scraping techniques are very powerful, but have limitations. Accessibility APIs are very powerful, but have different limitations. But using both approaches together, screencasting and re-composing visual elements, and tightly integrating it with JavaScript, enables a much wider and interesting range of possibilities.

Same per-app strategy choice Cua Driver lands on a decade later — see [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md). The mistake is defaulting to either layer everywhere.

### HyperCard for live apps

Don frames the endpoint as a 21st-century [HyperCard](https://en.wikipedia.org/wiki/HyperCard):

> Users could literally drag controls out of live applications, plug them together into their own "stacks", configure and train and graphically customize them, and hook them together with other desktop apps, web apps and services!
>
> For example, I'd like to make a direct manipulation pie menu editor, that let you just drag controls out of apps and drop them into your own pie menus, that you can inject into any application, or use in your own guis. If you dragged a slider out of an app into the slice of a pie menu, it could rotate it around to the slice direction, so that the distance you moved from the menu center controlled the slider! — [11520967](https://news.ycombinator.com/item?id=11520967)

Direct manipulation of *other apps' widgets* as if they were primitives in your own. This is the part nobody has shipped, and it is the part [Simopolis](simopolis.md) most wants.

---

## What did ship — and where the gap remains

| aQuery idea | 2026 closest thing | Why it isn't quite aQuery |
|---|---|---|
| Selectors over AX | macOS [axctl](https://developer.apple.com/), Hammerspoon, [pyatspi](https://gitlab.gnome.org/GNOME/pyatspi2), per-app scripts | No cross-platform abstraction; no events; no plugin model |
| Mutation events | App-specific accessibility notifications | Need to wire each one by hand; no selector matching |
| Pixel fallback | OmniParser, UI-Tars, GPT-4V, Prefab research artefacts | Not integrated with selectors; usually a separate inference pass |
| Plugin layer | Browser extensions; OS-level overlays (BetterTouchTool, Hammerspoon Spoons) | Single-platform; not driven by a selector match |
| Background automation | [Cua Driver](cua-computer-use-agents-and-simplifier.md) — `SLEventPostToPid` + focus-without-raise | Lower-level; aQuery is the *layer above* this |
| Cross-app scriptability | [MCP](https://modelcontextprotocol.io/) servers | Per-server; no built-in UI rendering |
| Sandboxed agents | Cua Sandbox VMs, [Lume](https://github.com/trycua/cua) | VM granularity, not per-app |
| Drag-out-of-app composition | *Nothing.* The HyperCard half is unbuilt. | This is the gap. |

[Don on Slate + aQuery](https://news.ycombinator.com/item?id=18797587), 2018 — six years before Cua:

> There is a window manager for the Mac called Slate that is extensible in JavaScript — it makes a hidden WebView and uses its JS interpreter by extending it with some interfaces to the app to do window management, using the Mac Accessibility API. I'd like to take that idea a lot further, so I wrote up some ideas about programming window management, accessibility, screen scraping, pattern recognition and automation in JavaScript.

---

## Programmable accessibility, not just programmable automation

aQuery's *primary* framing in Don's writing is **accessibility for users**, not "automation for programmers". The same selector that lets a script add a Save-dialog pie menu lets a low-vision user add a TTS read-aloud handler to every alert; the same Prefab pixel widget that re-skins a designer's CAD tool lets a [Dasher](dasher-steering-law-accessibility.md) user write text into an app that doesn't expose its text fields properly.

This matters for Micropolis. [Simplifier §8a T.13](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) explicitly targets two audiences with one tool: *streamers* (catalog narration, chat overlays) and *accessibility users* (kids learning to read, low-vision players, designers who hate Comic Sans). That dual audience is a direct inheritance from aQuery's framing, fifteen years later. *Programmable accessibility is the same problem as programmable automation; it is unethical to ship one without the other.*

---

## What Simopolis needs from this layer

The Sims 1 catalog has no API. The recovered [Tornado](the-tornado-and-the-archives.md) family albums are scanned bitmaps. Custom-content mods drop arbitrary files into directories without metadata. Every interaction Micropolis Home wants with the EA Sims 1 window — and with archived community content — is exactly an aQuery-shaped problem.

The minimum viable slice for Phase 1F.12 ([`simopolis-uplift-roadmap.md` Phase 1F](simopolis-uplift-roadmap.md#phase-1f--twitch-friendly-streaming-features-3-5-weeks-parallelizable-with-1b--1c--1d--1e)):

1. **Selector primitive** over a *very* small accessibility-shaped surface: "the Buy Mode catalog tabs", "the selected item icon", "the description pane". Hand-coded recognisers for now; vision-LLM later.
2. **Mutation events** — fire when the user changes catalog tabs, hovers an item, switches to Build mode.
3. **Plugin: read-aloud.** TTS via Web Speech API or MOOLLM `tts` skill.
4. **Plugin: registry lookup.** Cross-reference [sims-content-registry.md](sims-content-registry.md) and show provenance.
5. **OBS overlay rendering.** Browser source variant for streamers.

Future steps push toward aQuery proper — generic AX/pixel selectors, drag-controls-out-of-apps composition for [Family Album storymaking](family-album-as-storymaker.md), pie-menu adapters for community Sims authoring tools. But shipping the Simopolis vertical first means we learn the recognition gaps in a known target before pretending to be general-purpose.

---

## Pointers

| Topic | Where |
|---|---|
| Original RobotJS pitch | [HN 9977226](https://news.ycombinator.com/item?id=9977226) on [9973272](https://news.ycombinator.com/item?id=9973272) |
| Don to Morgan Dixon, integration sketch | [HN 11520967](https://news.ycombinator.com/item?id=11520967) |
| Don on Autumn / Prefab bibliography | [HN 18797818](https://news.ycombinator.com/item?id=18797818) on [18794928](https://news.ycombinator.com/item?id=18794928) |
| Don on Slate + WebView + aQuery | [HN 18797587](https://news.ycombinator.com/item?id=18797587) |
| aQuery wiki (archive) | [donhopkins.com/mediawiki/index.php/AQuery](https://web.archive.org/web/20180826132551/http://donhopkins.com/mediawiki/index.php/AQuery) |
| jQuery Pie Menus prototype (archive) | [donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus](https://web.archive.org/web/20150325120000/http://donhopkins.com/mediawiki/index.php/JQuery_Pie_Menus) |
| Pie menus vs extension APIs (W3C) | [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) · [webextensions #15](https://github.com/w3c/webextensions/issues/15#issuecomment-4536704942) |
| Slate transparent overlay | [slate#322](https://github.com/jigish/slate/issues/322) · [HN 5861229](https://news.ycombinator.com/item?id=5861229) |
| Slate window manager (JS + WebView + AX) | [github.com/jigish/slate](https://github.com/jigish/slate) |
| mutation-summary | [code.google.com/p/mutation-summary](https://web.archive.org/web/20150325120000/https://code.google.com/p/mutation-summary/) |
| Dragonfly (voice scripting) | [github.com/t4ngo/dragonfly](https://github.com/t4ngo/dragonfly) |
| Hammerspoon | [hammerspoon.org](https://www.hammerspoon.org/) |
| Cua Driver (closest 2026 cousin) | [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md) |
| Pixel recognition layer | [prefab-pixel-reverse-engineering.md](prefab-pixel-reverse-engineering.md) |
| Text-entry plugin candidate | [dasher-steering-law-accessibility.md](dasher-steering-law-accessibility.md) |
| Simopolis vertical | [`designing-inward-miyamoto-principles.md` §8a T.13](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) |
