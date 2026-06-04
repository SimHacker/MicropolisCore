# Pie menus and browser extension APIs

## Why `action.openPopup()` is not enough — and what window-system primitives extensions still lack

**Primary sources:** Don Hopkins (SimHacker) on [W3C webextensions #15](https://github.com/w3c/webextensions/issues/15#issuecomment-4536704942) (Jun 2021); [HN 27276093](https://news.ycombinator.com/item?id=27276093) on native context menus; Oliver Dunk (1Password) opening issue [#15](https://github.com/w3c/webextensions/issues/15); follow-on [#160](https://github.com/w3c/webextensions/issues/160) (*Ensure consistency of `action.openPopup` across browsers*); Don on Slate + transparent WebView — [jigish/slate#322](https://github.com/jigish/slate/issues/322), [HN 5861229](https://news.ycombinator.com/item?id=5861229), [HN 18797587](https://news.ycombinator.com/item?id=18797587); HyperTIES — [Shneiderman et al. 1991](https://donhopkins.medium.com/designing-to-facilitate-browsing-a-look-back-at-the-hyperties-workstation-browser-535eab3a3b3c).

**Companion docs:** [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) · [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) · [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) · [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md)

**2026 status:** Partial progress on programmatic popup open (Track 1); **no standard API** for cursor-positioned, shaped, globally-tracked overlay windows. [Issue #15](https://github.com/w3c/webextensions/issues/15) closed as duplicate of [#160](https://github.com/w3c/webextensions/issues/160) — overlay requirements **orphaned**, preserved here.

---

## Summary

Pie menus need to pop up **centered on the pointer**, track **global mouse motion outside the window**, respect **alpha-shaped chrome**, and optionally nest submenus across window boundaries — requirements spelled out in [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md). Browser extensions today can approximate a **fixed-position toolbar popup** via [action.openPopup()](https://developer.chrome.com/docs/extensions/reference/api/action#method-openPopup), but not a proper pie. Don Hopkins ran into this wall while exploring a Firefox/Chrome pie-menu extension and documented it in the [W3C WebExtensions community](https://github.com/w3c/webextensions/issues/15). Oliver Dunk (1Password) correctly factored the problem into **two tracks**: (1) programmatic popup open for password/phishing-safe UI, and (2) a separate **screen-overlay API** for positioned, page-independent UI — the track pie menus actually need. Track (1) has inched forward; Track (2) is still essentially unstandardized.

---

## At a glance

| Need | Pie menu requirement | `action.openPopup()` | Chrome `windows.create` popup | Slate-style native WebView overlay |
|---|---|---|---|---|
| Center on cursor | Yes | No — browser picks anchor | Approximate with measured coords | Yes |
| Arbitrary window shape (alpha) | Yes | No | No — rectangular chrome | Yes (`opaque = NO`, clear background) |
| Global mouse capture outside window | Yes — submenus | No | No | Yes — OS input APIs |
| Render with HTML/CSS/Canvas/WebGL | Yes | Yes (popup document) | Yes | Yes (embedded WebView) |
| Works inside extension only | Ideal | Yes | Partial | Requires separate app |
| Same browser engine as page | Ideal | Yes | Yes | Often different WebView generation |

---

## Two problems — keep them separate

From [Oliver Dunk's reply](https://github.com/w3c/webextensions/issues/15#issuecomment-4536704942) on the W3C thread:

1. **Programmatic popup open** — `browserAction.openPopup` / MV3 `action.openPopup()`: open the extension's *existing* toolbar popup without the user clicking the icon. Critical for password managers (anti-phishing UI must not live in page DOM) and for native-messaging handoff from desktop apps.

2. **Arbitrary overlay UI** — draw extension UI *over* the screen, independent of page layout, with controlled position and shape. 1Password's field-fill UI currently injects into page HTML and fights iframe clipping ([#12](https://github.com/w3c/webextensions/issues/12)). Pie menus need this second track entirely.

Conflating them slows both. Track (1) is close to "done enough" in some browsers; Track (2) is where decades of window-manager research (NeWS shaped windows, HyperTIES, ActiveX, DHTML, Slate) still exceeds what extensions expose safely.

---

## What Don asked for on the W3C thread

On [issue #15](https://github.com/w3c/webextensions/issues/15), Don reported hitting `openPopup` limits while trying to implement pie menus as an extension, pointing to the earlier [HN 27276093](https://news.ycombinator.com/item?id=27276093) thread on native macOS context menus. The minimum viable extension pie menu needs:

1. **Modal overlay at cursor** — popup centered on current mouse position, not toolbar-adjacent.
2. **OS-level window outside the tab** — overlapping other applications, not clipped by page scroll or iframe bounds.
3. **Shape from alpha** — round or arbitrary silhouette; no rectangular window frame required.
4. **Global input tracking** — receive move/up/key events *outside* the window bounds for submenu aiming ([submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md)).
5. **Same renderer as the web** — HTML, CSS, SVG, Canvas, WebGL, animated GIFs, rich item content — not a reimplemented radial menu in native drawing APIs.

Chrome's [windows.create](https://developer.chrome.com/docs/extensions/reference/windows/#method-create) with `type: 'popup'` is *almost* but not quite: rectangular chrome, awkward measurement/positioning, no global capture, no alpha-respecting frameless mode in the extension sense.

### Why not native messaging + Hammerspoon?

[HN 27276093](https://news.ycombinator.com/item?id=27276093) suggested [native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging) to a Mac app (Hammerspoon, etc.) that draws the menu natively. Don's counterargument — still the right one:

- Far fewer designers and maintainers know Hammerspoon drawing APIs than web APIs.
- Pie menu items may need **the same web content** as the app (animated GIFs, tables, live previews — see the [Punkemon DHTML demo](https://www.youtube.com/watch?v=R5k4gJK-aWw&t=3m)).
- A web app should reuse its own markup in menus without maintaining a parallel native widget set.

Native messaging remains a valid **escape hatch** for OS-wide window managers ([aquery-programmable-accessibility.md](aquery-programmable-accessibility.md)), not the optimal path for *browser-rendered* pies.

---

## Historical ladder — we have done this before

Each rung solved part of the problem; none maps 1:1 onto 2026 extension APIs.

| Era | Platform | What worked | What broke |
|---|---|---|---|
| ~1989 | [HyperTIES](https://donhopkins.medium.com/designing-to-facilitate-browsing-a-look-back-at-the-hyperties-workstation-browser-535eab3a3b3c) on NeWS | Pie menus for page turn / window pick; low cognitive load browsing | Not transferable to rectangular toolkit menus |
| ~1997 | [ActiveX pie control](https://www.donhopkins.com/home/catalog/piemenus/ActiveXPieMenus.html) | Shaped Win32 windows, GDI styling, global tracking | No CSS; heavy; security model killed the category |
| ~2001 | [DHTML / XML pie menus](https://donhopkins.com/home/PieMenu/JavaScriptPieMenus.html) on IE | Full HTML items, XSL-generated menus, animated GIFs | Still page-bound — not OS overlay |
| ~2013 | [Slate](https://github.com/jigish/slate) + `WebView` ([issue #322](https://github.com/jigish/slate/issues/322)) | Transparent topmost `NSWindow`, global overlay, JS pie menus | Requires standalone Mac app, not browser extension |
| ~2015+ | jQuery pie menus, [aQuery proposal](aquery-programmable-accessibility.md) | Reusable web rendering | Overlay + AX layer never shipped as one product |
| 2021+ | W3C WebExtensions discussion | Named the gap formally | Track (2) still open for extensions |
| 2024+ | [Kando](kando-cross-platform-pie-menu.md) (Electron) | Cursor-centered alpha overlay pies + WYSIWYG editor, cross-platform | Requires standalone app (~100MB Chromium); not in-browser extension |

### Slate transparent WebView recipe (2013)

Don's working Mac overlay configuration — the closest modern analogue to "browser draws pie, OS window floats above everything":

```objc
browserWindow.opaque = NO;
browserWindow.level = kCGPopUpMenuWindowLevel;
browserWindow.backgroundColor = [NSColor clearColor];
webView.drawsBackground = NO;
```

That gives alpha-respecting content in a popup-menu window level, above normal apps. Extensions cannot set this on behalf of the user's Chrome/Firefox process without leaving the extension security model.

---

## HyperTIES — why pies in a browser at all

The University of Maryland [HyperTIES](https://donhopkins.medium.com/designing-to-facilitate-browsing-a-look-back-at-the-hyperties-workstation-browser-535eab3a3b3c) hypermedia browser (NeWS, ~1990) used pie menus so readers could turn pages and pick target windows **without moving to a distant control panel** — gestural "next page" to the right, "back" to the left, with **mouse-ahead display suppression** for experts. Same Fitts argument as [pie-menus-fitts-law.md](pie-menus-fitts-law.md), applied to *navigation chrome inside a document system*.

The W3C thread reframes the 2021 ask: not novelty, but **restoring a HCI pattern browsers used to support** through richer embedding, now blocked by extension sandboxing.

---

## Related API threads Don proposed to split out (still unfiled)

On [issue #15](https://github.com/w3c/webextensions/issues/15), Don listed separate follow-ups worth tracking independently of `openPopup`. When #15 was merged into #160, these never became their own issues:

| Thread | Purpose | Pie-menu tie-in |
|---|---|---|
| **Menu management** | Shared linear + pie + hybrid menus (cf. [Blender Pie Menu Editor](https://www.youtube.com/watch?v=cQWwbBFQPrY)) | One menu engine for browser chrome and pages |
| **Tabbed window management** | Flexible tab/window embedding | Pies as window-picker ([HyperTIES figure 6](https://donhopkins.medium.com/designing-to-facilitate-browsing-a-look-back-at-the-hyperties-workstation-browser-535eab3a3b3c)) |
| **Global input tracking** | Capture, relative mode, cursor warp/constrain | Submenu corridors without "magic" hover delays |
| **Cursor position API** | Set pointer for motor-planning aids | Accessibility + expert muscle-memory training |

These dovetail — each useful alone, together they describe a **non-rectangular, full-screen-tracking UI substrate** traditional window systems had and the web platform has not fully re-exported to extensions.

---

## Orphaned ask — #15 closed as duplicate of #160

[Issue #15](https://github.com/w3c/webextensions/issues/15) was closed as a duplicate of [#160](https://github.com/w3c/webextensions/issues/160). That merge only preserved **Track (1)**: cross-browser consistency for [action.openPopup()](https://developer.chrome.com/docs/extensions/reference/api/action#method-openPopup) — user-gesture rules, background-script invocation, Chromium vs Firefox parity.

**Track (2) never got a home.** The shaped-window overlay requirements Don and Oliver Dunk spelled out on #15 are not in scope for #160:

| Requirement | Addressed by #160 / `openPopup`? |
|---|---|
| Popup centered on cursor | No — toolbar-adjacent anchor |
| OS-level window above other apps | Partial — still extension popup chrome |
| Alpha / arbitrary window shape | No — rectangular frame |
| Global input capture outside bounds | No — submenu aiming impossible |
| Same web renderer for rich items | Yes — but only inside popup rectangle |

Closing #15 as a duplicate of #160 therefore **orphans** the pie-menu ask without resolving it. The GitHub thread remains readable, but there is no open W3C issue tracking overlay-window primitives, global capture, or cursor placement for extensions.

Don also proposed splitting additional work out of #15 — menu management, tabbed window embedding, global input tracking, cursor position API — as separate threads worth standardizing. **None of those were filed as tracked follow-ups.** This document preserves that split so the intention is not lost when the issue tracker says "duplicate."

**Reference implementation outside the sandbox:** [Kando](kando-cross-platform-pie-menu.md) ships Track (2) as a standalone Electron app (cursor-centered alpha overlay + global tracking). Same architectural move as Slate + WebView ([aquery-programmable-accessibility.md](aquery-programmable-accessibility.md)).

---

## Standards status (2021 → 2026)

| Topic | Status |
|---|---|
| [webextensions #15](https://github.com/w3c/webextensions/issues/15) | Closed as duplicate of [#160](https://github.com/w3c/webextensions/issues/160); **Track (2) content orphaned** — see above |
| [#160](https://github.com/w3c/webextensions/issues/160) | Cross-browser `action.openPopup` consistency — **Track (1) only** |
| Chromium [crbug.com/436489](https://bugs.chromium.org/p/chromium/issues/detail?id=436489) | Open since 2014; MV3 exposure still channel-dependent |
| Firefox [bug 1341126](https://bugzilla.mozilla.org/show_bug.cgi?id=1341126) | Fixed — but early fix required user-gesture handler; gesture lost across message to background |
| Firefox [bug 1799344](https://bugzilla.mozilla.org/show_bug.cgi?id=1799344) | **`openPopup` without user gesture** — landed Firefox 149 (per [Rob W's 2026 thread comment](https://github.com/w3c/webextensions/issues/15#issuecomment-4536704942)) |
| Chromium vs Firefox | [jeurissen.co demo](http://jeurissen.co/webext-demos/action-browser-popup-methods) — MV3 `action.openPopup` gesture rules still differ; see also [#1000](https://github.com/w3c/webextensions/issues/1000) |
| Shaped global overlays for extensions | **Not standardized; no open issue** |
| Desktop overlay reference | [Kando](kando-cross-platform-pie-menu.md) — Electron, cross-platform |

**Bottom line for implementers:** programmatic popup open helps password managers and *fixed* extension UI; it does **not** unlock cursor-centered pie menus. Position control remains the "worst deal-breaker" Don named on the thread.

---

## Implications for MicropolisCore

| Layer | Pie menu stance |
|---|---|
| **`apps/micropolis/`** | In-page pies are tractable today — [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md). No extension sandbox. |
| **`apps/vitamoospace/`** | WebGPU/HTML overlay inside the app shell — same as Slate recipe but same-origin. |
| **Browser extension** | Blocked on Track (2) APIs; use [**Kando**](kando-cross-platform-pie-menu.md) pattern as desktop sibling or wait on standards. |
| **Micropolis Home / aQuery** | OS overlay + AX selectors — inherit Slate pattern or Cua Driver lower layer ([aquery-programmable-accessibility.md](aquery-programmable-accessibility.md)). |
| **Standards advocacy** | Vocabulary for a **new** overlay-window + global-capture spec — not satisfied by #160 / `openPopup` wins alone |

Phase 0 Simopolis does not depend on extension pies. Phase 1F streaming overlays ([designing-inward-miyamoto-principles.md](designing-inward-miyamoto-principles.md) §8a) benefit from understanding why **OBS browser sources** and **in-app overlays** are the shippable path while **extension-global pies** wait on standards.

---

## Pointers

| Topic | Where |
|---|---|
| W3C discussion (Don's comments) | [webextensions #15](https://github.com/w3c/webextensions/issues/15#issuecomment-4536704942) |
| Cross-browser openPopup | [webextensions #160](https://github.com/w3c/webextensions/issues/160) |
| Native context menu HN thread | [HN 27276093](https://news.ycombinator.com/item?id=27276093) |
| ActiveX pie demo | [YouTube nnC8x9x3Xag](https://www.youtube.com/watch?v=nnC8x9x3Xag) · [ActiveXPieMenus.html](https://www.donhopkins.com/home/catalog/piemenus/ActiveXPieMenus.html) |
| JavaScript / XML pies (IE) | [JavaScriptPieMenus.html](https://donhopkins.com/home/PieMenu/JavaScriptPieMenus.html) · [punkemon.xsl](https://donhopkins.com/home/PieMenu/punkemon.xsl) |
| Slate WebView overlay | [slate#322](https://github.com/jigish/slate/issues/322) · [HN 5861229](https://news.ycombinator.com/item?id=5861229) |
| HyperTIES paper + demos | [Medium essay](https://donhopkins.medium.com/designing-to-facilitate-browsing-a-look-back-at-the-hyperties-workstation-browser-535eab3a3b3c) · [HCIL browsing video](https://www.youtube.com/watch?v=fZi4gUjaGAM) |
| Gesture-space design rules | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| aQuery / programmable overlays | [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) |
| In-app renderer plugins | [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md) |
| Kando — working desktop overlay implementation | [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) · [HN 42525290](https://news.ycombinator.com/item?id=42525290) |
