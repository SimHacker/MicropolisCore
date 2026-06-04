# Pie menus and Fitts' Law

## Why wedges beat lists, what the 1988 study actually measured, and the day Steve Jobs heckled the result

**Primary sources:** Don Hopkins, [*The Design and Implementation of Pie Menus*](https://donhopkins.medium.com/the-design-and-implementation-of-pie-menus-80db1e1b5293) (Dr. Dobb's Journal, 1991); [HN 17098179](https://news.ycombinator.com/item?id=17098179) (*Pie Menus: A 30-Year Retrospective*); [HN 43934847](https://news.ycombinator.com/item?id=43934847) (Steve Jobs Educom 1988 demo); [HN 32993307](https://news.ycombinator.com/item?id=32993307) on [32992284](https://news.ycombinator.com/item?id=32992284) (Cairo, Fitts on big screens); Bruce Tognazzini, [*A Quiz Designed to Give You Fitts*](https://www.asktog.com/columns/022DesignedToGiveFitts.html).

**Companion docs:** [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) · [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) · [pie-menu-patent-fud.md](pie-menu-patent-fud.md) · [pie-menus-browser-extensions.md](pie-menus-browser-extensions.md) · [automotive-touch-ui-vs-pie-menus.md](automotive-touch-ui-vs-pie-menus.md) (Kurtenbach 7→8, [HN 7328476](https://news.ycombinator.com/item?id=7328476)) · [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) (CHI’88 repost, [HN 41160268](https://news.ycombinator.com/item?id=41160268))

---

## Summary

[Fitts' Law](https://en.wikipedia.org/wiki/Fitts%27s_law) says pointing time grows with the distance to a target and shrinks with the target's width. Linear pop-up menus violate both halves: the far item grows linearly with list length, and the target is always one line-height tall. Eight-item radial *pie* menus pop up centred on the cursor — distance is constant and small, width grows with radius, and every direction is *some* item. A controlled 1988 study at the University of Maryland (Don Hopkins) measured the result: pies were about 15% faster than linear menus, with lower error rates. The Sims and SimCity shipped them to a mass audience; Steve Jobs heckled the demo on stage in 1988 and NeXTStep never adopted them; Apple, Microsoft, and most toolkit vendors followed Jobs's lead. This is what was actually measured, where the layout came from, and why it lost the toolkit war anyway.

---

## At a glance

| Factor | Linear pop-up | Pie pop-up |
|---|---|---|
| Distance to far item | Grows with list length | Constant radius |
| Target width | ~line height (fixed) | Wedge widens with radius |
| Screen edges exploited | One (menu bar at top) | All four, from any centre |
| Novice path | Read, then click | Read once, then flick |
| Expert path | Memorise position, scan, click | Direction flick — *same motor pattern* as novice |
| Cancel / browse | Move pointer off menu | Return to centre |
| Submenus | Need invisible `<` corridor — [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) | Visible wrong wedge — geometric, not magical |

---

## Fitts in one paragraph

Paul Fitts (1954) found that the time to acquire a target is roughly $T = a + b \log_2(D/W + 1)$ where $D$ is distance and $W$ is the target's extent along the direction of motion. Practical consequences:

- **Large targets beat small ones** — wider in the direction you're moving.
- **Short distances beat long ones.**
- **Screen edges are infinitely tall/wide** in one direction — your pointer cannot overshoot.
- **Continuous visual servoing** (looking back and forth) is expensive; predictable layouts save it.

Tognazzini's classic [*A Quiz Designed to Give You Fitts*](https://www.asktog.com/columns/022DesignedToGiveFitts.html) walks through menu-bar, corner, and submenu cases. Donald Norman's collection [The Design of Everyday Things](https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things) gives the broader frame.

Pie menus are a Fitts-aware response to the question *"if pointing time depends on distance and width, why are popups still lists?"*

---

## The 1988 University of Maryland study

Don Hopkins, then in Ben Shneiderman's HCIL, ran an experiment: eight-item linear pop-up vs eight-item pie at matched radius. Result: pies were *about 15% faster on selection, with lower error rates*. Mouse-ahead — selecting by *direction of motion before the labels appear* — accelerated experts further.

The study is the citation in the patent that [Alias later turned into FUD](pie-menu-patent-fud.md) — they cited the Dr. Dobb's Journal writeup ([*The Design and Implementation of Pie Menus*](https://donhopkins.medium.com/the-design-and-implementation-of-pie-menus-80db1e1b5293)) but described pies as if mouse-ahead didn't work. It does.

Shipping lineage from the same era:

- **[HyperTIES](https://en.wikipedia.org/wiki/HyperTIES)** (Maryland, 1988) — first deployed pie menus, in Sun's NeWS window system.
- **SimCity** — TCL/Tk + Python ports across the 1990s. Demo: [Jvi98wVUmQA](https://www.youtube.com/watch?v=Jvi98wVUmQA), Flash/OpenLaszlo [8snnqQSI0GE](https://www.youtube.com/watch?v=8snnqQSI0GE), Unity3D [sMN1LQ7qx9g](https://www.youtube.com/watch?v=sMN1LQ7qx9g).
- **The Sims** (2000–) — pie menus around every object, head of the active Sim in the centre. The mass-audience deployment, around 200 million players.
- **Blender** — eventually, after the [marking-menu patent FUD](pie-menu-patent-fud.md) wore off.

Older XML pie-menu writeups live in this repo at [historical/drupal-blog/2004-02-05-xml-pie-menus.md](../historical/drupal-blog/2004-02-05-xml-pie-menus.md).

---

## Big screens make it worse for lists, better for pies

On a 1988 Mac, the menu bar's "infinite height at the top edge" Fitts trick was a strong argument for the global menu bar. Don's Cairo-thread comment ([HN 32993307](https://news.ycombinator.com/item?id=32993307) on [32992284](https://news.ycombinator.com/item?id=32992284)) updates it for the modern desktop:

> The Fitts' Law benefits of pie menus are significantly more profound than the Fitts' Law benefits of the "infinite height" menu bar that Tog describes in his classic article, especially on large screens. And they don't result in you moving the cursor far away from where you want to be next.
>
> Fitts' Law says the target acquisition time (and error rate) is related to the target size (larger target = better, so pie menus make all the targets quite large, extending in all directions to all four edges of the screen; menu bars also do, but only in one direction, wasting three out of four screen edges), and the target distance (nearer target = better, so pie menus make all the targets uniformly quite nearby, exploiting all directions; menu bars don't minimize the distance, only exploit one possible direction (up), and you also have to move back too, so it's worse on a big screen).
>
> Also, multiple displays that you can move between throws a monkey wrench into the "infinite screen edge". Which may be one reason why nobody … ever puts a screen above or below another screen, or a menu bar on the left or right edge, even though Windows has always let you do that, but the Mac doesn't.

Two layout consequences:

- **Round-trip cost dominates.** The menu bar is *up*, then the chosen command, then back to where you were. A pie menu costs one short out-and-back at the click point; a menu bar costs one giant out-and-back across the whole screen.
- **Multi-monitor breaks the edge trick.** When the menu bar lives on monitor A and your work lives on monitor B, the "infinite top edge" is no longer reachable without crossing the seam. Pie menus don't care which monitor they're on — they appear under the cursor.

The same comment introduces [Steering Law](https://en.wikipedia.org/wiki/Steering_law) as the *second* relevant law: Fitts predicts how long it takes to reach a target, Steering Law predicts how long it takes to navigate through a tunnel (e.g., a menu hierarchy or a corridor in [Dasher](dasher-steering-law-accessibility.md)). Pies are better at both because the tunnel is shorter.

---

## Steve Jobs at Educom, 25 October 1988

Don, [HN 43934847](https://news.ycombinator.com/item?id=43934847):

> On October 25, 1988, I gave Steve Jobs a demo of pie menus, NeWS, UniPress Emacs and HyperTIES at the Educom conference in Washington DC. His reaction was to jump up and down, point at the screen, and yell *"That sucks! That sucks! Wow, that's neat! That sucks!"*
>
> I tried explaining how we'd performed an experiment proving pie menus were faster than linear menus, but he insisted the linear menus in NeXT Step were the best possible menus ever.
>
> When I explained to him how flexible NeWS was, he told me *"I don't need flexibility — I got my window system right the first time!"*
>
> But who was I to rain on his parade, two weeks after the first release of NeXT Step 0.8? He just wasn't in the mood to be told that he could have a better user interface.

The demo was two weeks after NeXTStep 0.8 launched. Doubters were wearing *NeVR Step* t-shirts. Jobs was in no mood to hear that someone else's UI experiment had beaten his linear menus. Don gave him a *NeRD* button (NeWS NeRDs) and let it go.

> Even after he went back to Apple, Steve Jobs never took a bite of Apple Pie Menus, the forbidden fruit. There's no accounting for taste.

NeXT didn't ship pies. Mac OS X (and macOS thereafter) didn't ship pies. The toolkit ecosystem followed. Pies kept shipping in games — SimCity, The Sims, [Neverwinter Nights](https://en.wikipedia.org/wiki/Neverwinter_Nights), eventually Blender — because game teams roll their own UI and don't ask permission. They lost the toolkit war and won the games one.

---

## Standard objections, with answers

From the modern HN reception of [Kando Show HN (Dec 2024)](https://news.ycombinator.com/item?id=42525290) — see [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) — and the older [Pie Menus retrospective (May 2018)](https://news.ycombinator.com/item?id=17098179):

| Objection | Answer |
|---|---|
| *"I have to read in a circle"* | Novices read once; experts *flick* by direction without reading. The training path is the rehearsal path — see [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md). |
| *"Submenu hacks work fine"* | The classical Mac `<` corridor does work, but it's invisible, undefined, rarely tested, and almost never re-implemented correctly on the web. See [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md). |
| *"Keyboard shortcuts win"* | True for *rare, named* commands a user can memorise. Pies win for *spatial toolsets* (city tools, Sim verbs, Blender modes) where the right tool is "the one over there", not a name. |
| *"How do you handle more than 8 items?"* | Hierarchy: nested pies that branch by direction. Or windowed pies (radial scrollwheels). The patented *radial+linear overflow* combo is *one* option and not a good one — [pie-menu-patent-fud.md](pie-menu-patent-fud.md). |
| *"They're not discoverable"* | Pop them up with a delay; experts skip the pop-up by mousing ahead before it renders. Same "rehearsal" dynamic Buxton describes for marking menus ([billbuxton.com/MMUserLearn.html](https://www.billbuxton.com/MMUserLearn.html)). |

---

## Adoption blockers, briefly

The two big reasons pies stayed niche:

1. **Patent FUD.** Alias spent two decades advertising "patented marking menus", scaring Kinetix, Blender, and most volunteer projects off pies entirely. See [pie-menu-patent-fud.md](pie-menu-patent-fud.md).
2. **macOS Fitts regressions in the same period.** Separator items that dismiss menus on hover; the dock pushed off the screen corners; resize cursors stealing scrollbar clicks ([HN 11219792](https://news.ycombinator.com/item?id=11219792)). The same era that ignored pies *also* threw away the Fitts wins it already had — see [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md).

---

## What Micropolis does

The Federation ships pies in the renderer, on the command bus, and in the Sims-side UI:

- **City tool ring.** Zoning, infrastructure, mode switches. Drives the same command bus that backs replay and TiVo-style branches — [command-timeline-git-branches.md](command-timeline-git-branches.md).
- **Sims verb ring.** Object-context menus around each Sim object, head-of-the-actor in the centre — the same layout The Sims 1 shipped in 2000. Why-disabled text from [sims-content-registry.md](sims-content-registry.md).
- **Family Album navigation pie.** Scene-to-scene transitions — [family-album-as-storymaker.md](family-album-as-storymaker.md).
- **Stream-overlay pie.** §8a Twitch features — [`designing-inward-miyamoto-principles.md` §8a](designing-inward-miyamoto-principles.md#8a-the-twitch-corollary-make-streamers-radically-powerful).

Implementation lives in [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md); shared metadata format is documented under [renderer-plugin-roadmap.md](renderer-plugin-roadmap.md).

---

## Pointers

| Topic | Where |
|---|---|
| Dr. Dobb's Journal, 1991 — the empirical paper | [donhopkins.medium.com/the-design-and-implementation-of-pie-menus](https://donhopkins.medium.com/the-design-and-implementation-of-pie-menus-80db1e1b5293) |
| Pie Menus: 30-year retrospective (story) | [HN 17098179](https://news.ycombinator.com/item?id=17098179) |
| Steve Jobs Educom 1988 demo | [HN 43934847](https://news.ycombinator.com/item?id=43934847) |
| Don on Fitts and pies, big-screen update | [HN 32993307](https://news.ycombinator.com/item?id=32993307) on [32992284](https://news.ycombinator.com/item?id=32992284) |
| Kando (cross-platform OSS radial menu) | [kando-cross-platform-pie-menu.md](kando-cross-platform-pie-menu.md) · [kando.menu](https://kando.menu) · [HN 42525290](https://news.ycombinator.com/item?id=42525290) |
| Buxton's marking-menu rehearsal study | [billbuxton.com/MMUserLearn.html](https://www.billbuxton.com/MMUserLearn.html) |
| Tognazzini's Fitts quiz | [asktog.com/columns/022DesignedToGiveFitts.html](https://www.asktog.com/columns/022DesignedToGiveFitts.html) |
| HyperTIES (Wikipedia) | [en.wikipedia.org/wiki/HyperTIES](https://en.wikipedia.org/wiki/HyperTIES) |
| Why the patent story matters | [pie-menu-patent-fud.md](pie-menu-patent-fud.md) |
| How pies *feel* (gesture-space framing) | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| Submenu corridor that linear menus need | [submenu-aiming-and-fitts-law.md](submenu-aiming-and-fitts-law.md) |
| Federation pie shell spec | [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) |
| SimCity totem-pole palette layout (HN 2014) | [simcity-tool-palette-design.md](simcity-tool-palette-design.md) |
