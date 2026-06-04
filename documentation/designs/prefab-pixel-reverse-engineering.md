# Prefab: reading widget trees from pixels

## What if anybody could modify any interface?

**Primary sources:** Morgan Dixon & James Fogarty, CHI 2010–2014 ([prefab.github.io](https://prefab.github.io/)); Don Hopkins HN comments [18797818](https://news.ycombinator.com/item?id=18797818), [14182061](https://news.ycombinator.com/item?id=14182061), [11520967](https://news.ycombinator.com/item?id=11520967); [Morgan Dixon's research statement](http://morgandixon.net/morgan-dixon-research-statement.pdf).

**Disambiguation:** This document is about Dixon & Fogarty's University of Washington DUB Group *Prefab* (the 2010 CHI Best Paper) — the **pixel-based reverse-engineering toolkit**. It is *not* the 2026 Python FastMCP "Prefab" generative-UI framework ([HN 47697566](https://news.ycombinator.com/item?id=47697566)).

**Companion docs:** [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) · [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md)

---

## Summary

Every GUI toolkit ultimately paints pixels. Prefab proved you can run that compilation backwards: take screenshots at interactive rates, learn widget templates from a handful of examples, and reconstruct a DOM-like tree — including text, hierarchy, and state — for any unmodified application on any operating system you can render. Once you have the tree, you can overlay tutorials, magnify pointing targets for touch, translate UIs into other languages, add Bubble-cursor behaviour to Photoshop on Windows and Gimp on Linux from *the same code*, and rewire widgets you do not own. The papers are 2010–2014 research; the problem statement is now the entire computer-use-agent market.

---

## At a glance

- Pixel input → trained widget tree, ~interactive rate.
- C# on Windows; works on Mac/Linux apps through VNC or VM.
- Word, Skype, Chrome, Photoshop, Gimp, iTunes, Windows Media Player demoed unmodified.
- Live language translation, stencil tutorials, touch adaptation, Bubble cursor — *without* application source.
- Dixon's research vision: *Wikipedia-style community-edited interfaces*, never mainstreamed.
- 2026 descendants: vision VLMs, OmniParser, UI-Tars, [Cua](cua-computer-use-agents-and-simplifier.md), browser-extension overlays.

---

## The pipeline

From [prefab.github.io](https://prefab.github.io/):

> Prefab looks at the pixels of an existing interface and returns a tree structure, like a web-page's Document Object Model, that you can then use to modify the original interface in some way.

Four stages:

1. **Model** widget appearance from example images. Each example is decomposed into matchable parts (corners, regions of constant colour, learnable internal texture). A "widget" in Prefab is a recipe for matching those parts in any combination at any position.
2. **Recognise** parts in live screenshots. Run the matchers; build a tree of candidate widgets; resolve overlaps and hierarchy.
3. **Annotate** semantics — text via on-screen OCR, state by comparing successive frames, structural roles from the tree.
4. **Modify** — composite an overlay window on top of the original app: tutorial stencils, bubble cursors, sticky icons, magnified touch targets, translated labels, side-by-side parameter previews.

The runtime is interactive — fast enough that Prefab's overlays follow the underlying app as it animates and resizes. Source code (research artifact, last major push ~2015) lives at [github.com/prefab/code](https://github.com/prefab/code).

---

## What Prefab *actually* did, on tape

This is the part that surprises people unfamiliar with the work — Prefab's demos showed it modifying *Microsoft Word, Skype, Google Chrome, Photoshop, Gimp, iTunes, Windows Media Player* with no application cooperation whatsoever. Don's annotated link list, posted on [HN 18797818](https://news.ycombinator.com/item?id=18797818):

| Demo | What you see | Paper |
|---|---|---|
| [Target-aware pointing](https://www.youtube.com/watch?v=lju6IIteg9Q) | Bubble cursor and sticky icons added to Gimp on Linux *and* Photoshop on Windows from one Prefab binary; parameter spectrum previews for both unmodified | Dixon, Fogarty, *Prefab* — [CHI 2010 PDF](https://homes.cs.washington.edu/~jfogarty/publications/chi2010-prefab.pdf) (Best Paper) |
| [Content and hierarchy](https://www.youtube.com/watch?v=w4S5ZtnaUKE) | Recovers tree structure, OCRs text, draws stencil tutorials, **translates Skype's UI live**, surfaces the Skype favourites tab as a custom widget | Dixon, Leventhal, Fogarty, *Content and Hierarchy* — CHI 2011 |
| [Sliding widgets](https://www.youtube.com/watch?v=8LMSYI4i7wk) | Touch adaptation for a desktop UI: widgets slide out from under the finger, rollover is simulated to show tooltips, magnified slow-motion fine pointing | Dixon, Lim, Fogarty et al, *Sliding Widgets* — CHI 2014 |
| [General-purpose Bubble cursor](https://www.youtube.com/watch?v=46EopD_2K_4) | Wobbrock's Bubble cursor as a system-wide overlay on Windows 7, retrained per app | Dixon, Fogarty, Wobbrock, *Target-Aware Pointing* — CHI 2012 |

The Bubble cursor demo matters because Tovi Grossman and Ravin Balakrishnan's [Bubble Cursor](http://www.tovigrossman.com/BubbleCursor/) is *the fastest general pointing facilitation technique in the HCI literature*. Prefab made it deployable against any Windows 7 app. That is a research result that should have changed how desktop accessibility was sold to Microsoft and Adobe — and didn't.

CHI 2010 Best Paper. Full bibliography on the project page: [prefab.github.io/papers.html](https://prefab.github.io/papers.html).

---

## Dixon's vision: community-edited interfaces

From the research statement Don quotes in [18797818](https://news.ycombinator.com/item?id=18797818):

> Today, most interfaces are designed by teams of people who are collocated and highly skilled. Moreover, any changes to an interface are implemented by the original developers and designers who own the source code. In contrast, I envision a future where distributed online communities rapidly construct and improve interfaces. Similar to the Wikipedia editing process, I hope to explore new interface design tools that fully democratize the design of interfaces. Wikipedia provides static content, and so people can collectively author articles using a very basic Wiki editor. However, community-driven interface tools will require a combination of sophisticated programming-by-demonstration techniques, crowdsourcing and social systems, interaction design, software engineering strategies, and interactive machine learning.

This is the [Wikipedia](https://en.wikipedia.org/wiki/Wikipedia) editing model applied to UI. *"Bell-curve UX is a tragedy of the commons. The bottom 5% of users get a worse experience than they need; the top 5% get a worse experience than they could build; nobody is allowed to patch the middle."*

The companion 2010 CHI position paper (workshop track, listed on [prefab.github.io/papers.html](https://prefab.github.io/papers.html)) says it more plainly — *Prefab: What if Every GUI Were Open-Source?*:

> Researchers are often unable to demonstrate or evaluate new techniques beyond small toy applications, and practitioners are often unable to adopt methods from the literature in new and existing applications. This position statement examines a vision in which anybody can modify any GUI of any application, similar to a scenario where every GUI of every application is open-source.

Don's reaction on [HN 14182061](https://news.ycombinator.com/item?id=14182061): *"Such a pity that Microsoft or others didn't make these ideas mainstream!"* Sixteen years on, the gap persists: toolkits are still siloed, end users still cannot patch live GUIs the way Wikipedia patches articles, and the "AI agent" wave is rediscovering the problem by force.

---

## The hybrid Don actually wanted

Prefab is half the engine the [aQuery](aquery-programmable-accessibility.md) proposal needed: pixel-level recognition where accessibility APIs are silent. Don's pitch to Morgan on [HN 11520967](https://news.ycombinator.com/item?id=11520967):

> I would like to discuss how we could integrate Prefab with a JavaScriptable, extensible API like aQuery, so you could write "selectors" that used Prefab's pattern recognition techniques, bind those to JavaScript event handlers, and write high level widgets on top of that in JavaScript, and implement the graphical overlays and gui enhancements in HTML/Canvas/etc like I've done with Slate and the WebView overlay.
>
> Users could literally drag controls out of live applications, plug them together into their own "stacks", configure and train and graphically customize them, and hook them together with other desktop apps, web apps and services!

The framing is HyperCard, scaled out across every app on your machine — pull a slider out of one app, drop it into a pie-menu slice from [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md), where distance-from-centre drives the slider value. Prefab is the half that names the slider. aQuery is the half that lets you bind to it from JavaScript and overlay your own widget.

This never shipped as one product. Pieces of it appear today in:

| Idea | Where it lives in 2026 |
|---|---|
| Pixel → widget tree | OmniParser, [UI-Tars](https://github.com/bytedance/UI-TARS), GPT-4V, Qwen2.5-VL |
| Cross-app scriptability | MCP servers, browser extensions, [Hammerspoon](https://www.hammerspoon.org/) |
| Overlay rendering | OBS browser sources, [Cua Driver](cua-computer-use-agents-and-simplifier.md) overlays, Figma plugins |
| Community-edited interface patches | Tampermonkey/Greasemonkey for the web; *nothing equivalent for native apps* |
| Cross-OS via remote-desktop pixel feed | [Cua Sandbox + Lume](https://github.com/trycua/cua) for parallel VMs |

The gap that remains is the **user-extensible glue** — a real aQuery-shaped layer with selectors over both AX trees and Prefab-style pixel widgets, plus a sane plugin model. Cua Driver is the closest thing in 2026 ([HN 47936312](https://news.ycombinator.com/item?id=47936312)), and even there the per-app strategy choice (AX for native, hybrid for Chromium, pixels for Blender/CAD) is exactly the split Dixon and Don sketched in 2010–2015.

---

## Why Micropolis cares

[Simopolis](simopolis.md) ships content for the EA-published Sims 1, which exposes no API for its Buy Mode catalog. Every Simopolis tool that wants to know what's in front of the player — *which* lamp, *which* wallpaper, where it came from — is a Prefab-shaped problem at heart.

The 2003 [*Simplifier*](cua-computer-use-agents-and-simplifier.md#prehistory-a-simoleon-printing-bot-becomes-a-catalog-reader) solved it the brute-force way: hard-coded knowledge of the catalog frame, template-match the icon region, OCR the known-font Comic Sans description, page through with injected clicks. It worked because the UI never moved.

The 2026 [Simplifier reborn](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) cannot rely on that. Custom-content thumbnails are arbitrary, Steam scaling changes coordinates, mods change description fonts. The recognition layer becomes a vision-LLM (OmniParser-shaped, not hand-coded), the semantic layer becomes the [Sims Content Registry](sims-content-registry.md), and the overlay layer is an OBS browser source rather than a pop-up dialog. *But the architectural shape is still Prefab.*

The broader Simopolis tooling — IFF editors, [Tornado](the-tornado-and-the-archives.md) provenance browsers, [Family Album storymakers](family-album-as-storymaker.md) — benefits from the same principle: **treat legacy bitmap UIs as observable surfaces, not dead ends**, then layer semantics on top.

---

## Pointers

| Topic | Where |
|---|---|
| Project home (videos, papers, code) | [prefab.github.io](https://prefab.github.io/) |
| CHI 2010 Best Paper | [PDF](https://homes.cs.washington.edu/~jfogarty/publications/chi2010-prefab.pdf) |
| Full Prefab paper list with PDFs | [prefab.github.io/papers.html](https://prefab.github.io/papers.html) |
| Fogarty publications | [homes.cs.washington.edu/~jfogarty/publications.html](https://homes.cs.washington.edu/~jfogarty/publications.html) |
| Source code (research artifact, ~2015) | [github.com/prefab/code](https://github.com/prefab/code) |
| Morgan Dixon's home page | [morgandixon.net](http://morgandixon.net/) |
| Don's annotated bibliography (Autumn thread) | [HN 18797818](https://news.ycombinator.com/item?id=18797818) on story [18794928](https://news.ycombinator.com/item?id=18794928) |
| Don's Prefab + aQuery integration sketch | [HN 11520967](https://news.ycombinator.com/item?id=11520967) |
| Don on Slate + WebView overlays as prior art | [HN 14182061](https://news.ycombinator.com/item?id=14182061) |
| Bubble Cursor (Grossman & Balakrishnan) | [tovigrossman.com/BubbleCursor](http://www.tovigrossman.com/BubbleCursor/) |
| 2026 production cousin | [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md) |
| 2015 unbuilt sibling | [aquery-programmable-accessibility.md](aquery-programmable-accessibility.md) |
| Micropolis vertical that needs this shape | [`designing-inward-miyamoto-principles.md` §8a T.13](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful) |
