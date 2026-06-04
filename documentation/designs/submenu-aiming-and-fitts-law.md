# The 1987 submenu corridor that the web forgot

## How Bruce Tognazzini's invisible `<`-shaped buffer made hierarchical menus humane — and why every framework keeps rediscovering it

**Primary sources:** Apple, [*Human Interface Guidelines*](https://archive.org/details/applehumaninterf00appl) (1987), p. 87 "drag delay"; Bruce Tognazzini, [*A Quiz Designed to Give You Fitts*](https://www.asktog.com/columns/022DesignedToGiveFitts.html); Don Hopkins on Frank Leahy and Tog — [HN 17404401](https://news.ycombinator.com/item?id=17404401); the long Kando comment — [HN 39228342](https://news.ycombinator.com/item?id=39228342) on [39206966](https://news.ycombinator.com/item?id=39206966); Ben Kamens, *Breaking Down Amazon's Mega Dropdown* — [bjk5.com/post/44698559168](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown).

**Companion docs:** [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) · [classical-hci-vs-aesthetic-ui.md](classical-hci-vs-aesthetic-ui.md)

---

## Summary

When you drag diagonally from a parent menu into a submenu, your pointer briefly crosses sibling items in the parent. Naive hover hit-testing reads that as *"user wants a different submenu"* and the one they were aiming at vanishes. Tognazzini's 1986 fix, encoded on page 87 of the [1987 Apple HIG](https://archive.org/details/applehumaninterf00appl): a **forgiving invisible buffer zone shaped like a `<`** rooted at the submenu's open edge, so the cursor can wander while it's clearly heading *toward* the submenu without dismissing it. Frank Leahy implemented it in the Mac SE/II Menu Manager. Then NeXT and OS X mostly forgot about it. Then Amazon's UX team rediscovered it as *"the magic triangle"* in 2013 and everyone wrote a blog post. Twelve years later web SPAs are still re-rediscovering it from `:hover` CSS, badly.

Pie menus avoid the whole problem geometrically. This document is the corridor's history and the case for ditching it.

---

## At a glance

- **The problem:** elbows move in arcs; pointers crossing siblings look identical to user intent change.
- **The 1986 fix:** delay the submenu's dismissal as long as the pointer is in a wedge that points *at* the submenu's open edge. Tognazzini called this a *drag delay*.
- **The shape:** roughly `<`-shaped or a triangular fan from the pointer-down position to the submenu's top-and-bottom corners.
- **Where it shipped first:** Apple HIG 1987 page 87; implemented by [Frank Leahy](https://news.ycombinator.com/item?id=17404401) in the Mac SE/II Menu Manager.
- **Where it regressed:** NeXT, OS X (in places), most web SPAs.
- **Where it got rediscovered:** Amazon "magic triangle" (2013, [bjk5.com](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown)).
- **Why pies sidestep it:** nested rings disambiguate by *direction*, not by *trajectory through a region*.

---

## The diagonal trap

You click a menu like *File*. The menu drops. You move diagonally toward *Open Recent ▶* — a submenu item, half-way down. Between *File* and *Open Recent* the pointer passes over *New*, *Open*, *Save*. As you continue diagonally toward the submenu's open edge, you also briefly cross *Print*, *Page Setup*. Each of those is a sibling that the menu's hover hit-test will react to.

A naive implementation cancels the *Open Recent* submenu the moment you hover off it. Now your submenu is gone. You back up; you re-enter *Open Recent*; you cautiously go *right* before going down; you grit your teeth.

The correct implementation, from the 1987 Apple HIG p. 87 "drag delay" section (quoted by Don on [HN 39228342](https://news.ycombinator.com/item?id=39228342)):

> Two delay values enable submenus to function smoothly, without jarring distractions to the user. The **submenu delay** is the length of time before a submenu appears as the user drags the pointer through a hierarchical menu item. It prevents flashing caused by rapid appearance-disappearance of submenus. The **drag delay** allows the user to drag diagonally from the submenu title into the submenu, briefly crossing part of the main menu, without the submenu disappearing (which would ordinarily happen when the pointer was dragged into another main menu item). This is illustrated in Figure 3-42.

Two delays, not one. Submenu-delay prevents flash; drag-delay forgives diagonal entry.

Tognazzini in his Fitts column ([asktog.com](https://www.asktog.com/columns/022DesignedToGiveFitts.html)):

> I called for a buffer zone shaped like a `<`, so that users could make an increasingly-greater error as they neared the hierarchical [item] without fear of jumping to an unwanted menu.

The shape of the buffer is the apex of a triangle at the pointer-down location, widening as you approach the submenu. The closer you are to entering the submenu, the more lateral error is forgiven.

---

## Who actually built it

Frank Leahy rewrote the Mac SE and Mac II Menu Manager. Don tells the story on the [Cairo HN thread, comment 32961306](https://news.ycombinator.com/item?id=32961306):

> When he was at Apple, he rewrote the Menu Manager for Mac SE and Mac II.
>
> We were working together on a project at Current TV, and reminiscing about how great the original Apple Human Interface guidelines were, and how Apple had totally lost their original devotion to excellent user interface design, and I mentioned how the original edition of the Apple HIG book I had actually illustrated, documented, and justified that subtle feature.
>
> Frank proudly told me he was the one who implemented it for the Menu Manager, and that he was touched that somebody actually noticed and appreciated it as much as I did.

Tog confirms the invention on the [Amazon mega-dropdown HN thread](https://news.ycombinator.com/item?id=17404401):

> Yes, I did invent it back in 1986 and it is firmly in the public domain.

So the design is Tognazzini, the implementation is Leahy, the codification is the 1987 HIG. Public domain since 1986. Apple Human Interface Group; 38 years of prior art.

---

## Why the hack is fragile in practice

Don's diagnosis on the same Kando comment ([39228342](https://news.ycombinator.com/item?id=39228342)):

> Implementations certainly do vary, but the point is that it's essentially a weird magical non-standardized behavior that isn't intuitively obvious to users why or how or when it's happening. It's extremely difficult to implement correctly (there's not even a definition of what correct means), and requires a whole lot of user testing and empirical measurements and iterative adjustments to get right (which nobody does any more, not even Apple like they did in the old days of Tog). Many GUI toolkits don't support it, and most roll-yer-own web based menu systems don't. So users can't expect it to work, and they're lucky when it works well.

Four hidden costs:

1. **No crisp definition.** Tog described it; Apple implemented one version; everyone since has guessed parameters.
2. **Untested at scale.** Empirically tuning a drag-delay requires real users, real menus, real fatigue. Few teams budget it.
3. **Toolkit-dependent.** Some toolkits do it (or did); most don't. Touch ports drop it. SPAs reinvent it badly.
4. **Invisible.** A user who didn't grow up with classic Mac menus doesn't even know to expect it. When it works, it's invisible by design; when it doesn't, they think they're bad at mousing.

Same comment, the *Principle of Least Astonishment* punchline:

> But with complex magical invisible submenu hacks, you wonder if it's based on how long you pause, how fast you move, where you move, what is the shape, why can't I see it, how does it change, what if you pause, what if my computer is lagging, what if I go back, what if I didn't want the submenu, how do I make it go away, why can't I select the item I want, what do I do?

The corridor is *necessary* to make linear submenus humane. It's also *invisible*, *toolkit-specific*, and a maintenance burden forever.

---

## Pies sidestep it geometrically

Nested pie menus solve the same problem differently. From the same comment:

> Pie menus geometrically avoid this problem by popping up sub-menus centered on the cursor with each item in a different direction, so no magic invisible submenu tracking kludges are necessary. Don't violate the Principle of Least Astonishment!

In a pie, the submenu opens *centred on your finger*, with each child item in a different direction relative to the new centre. The only way to land on the wrong child is to flick in the wrong direction — and you can *see* the wrong direction. No hidden corridor. No "did I pause long enough?" The boundary between commands is geometric, visible, and the user understands it.

The catch is item count: you cannot put twenty items in one pie without absurdly narrow wedges. The patented-and-FUDed [radial+linear overflow combo](pie-menu-patent-fud.md) is one option people have tried; nesting is the cleaner one. See [pie-menus-fitts-law.md](pie-menus-fitts-law.md) for the trade-off in detail.

---

## Windows timeout vs Mac geometry

Two different strategies dominate desktop toolkits:

| Strategy | Mechanism | Failure mode |
|---|---|---|
| **Classic Mac drag-delay** | `<`-shaped tolerant corridor; submenu stays as long as pointer is in the wedge aimed at it | Invisible; impossible to tune perfectly; nobody learns it |
| **Windows timeout** | Submenu closes a fixed delay after the pointer leaves it | The delay is wrong for half your users; jumpy under load |

NeXT/OS X reportedly regressed toward timeout behaviour in several places — Tog noted the loss in the same Fitts column. The Win32 menu manager exposes hover-delay timings that few apps tune.

Web frameworks (React, Vue, Svelte) almost universally implement the *Windows timeout* model in CSS or JS, often poorly. The notable exception was Amazon, which built a proper corridor-style mega-dropdown in 2012 — see below.

---

## Amazon's "magic triangle" (2013)

[Ben Kamens, *Breaking Down Amazon's Mega Dropdown*](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown). Amazon's "Shop By Department" navigation lets you slide your pointer down a vertical list of categories on the left, and a giant panel of subcategories opens on the right. Diagonal entry from a left-column category to the right-side panel briefly crosses *other* left-column categories — exact same problem as 1986.

Amazon's solution is a JavaScript-tracked **triangle** rooted at the pointer's last position and projected at the right-side panel's corners. As long as your pointer stays inside that triangle, no left-column hover events fire. Cross the triangle's edge and the active category switches.

In the comments on that post, Tog himself shows up:

> Bruce "Tog" Tognazzini Jake Smith • 5 years ago Yes, I did invent it back in 1986 and it is firmly in the public domain.

It's the 1987 Apple HIG `<` corridor reinvented from scratch by a high-profile UX team because nothing in their toolkit gave it to them. The blog post racked up tens of thousands of reads. Twelve years later, the typical web app has *not* implemented the magic triangle and never will.

---

## Why this keeps happening

Three structural reasons:

1. **Hover events are easy.** Hit-test on mouseenter/mouseleave is one line of CSS. The corridor is not — it requires tracking pointer trajectory across the parent menu's *region*, not just its items.
2. **The 1987 HIG is not read.** The PDF is on [Andy Matuschak's archive](https://andymatuschak.org/files/papers/Apple%20Human%20Interface%20Guidelines%201987.pdf) and on [archive.org](https://archive.org/details/applehumaninterf00appl). Nobody reads it.
3. **Touch deprecated the problem from the *implementer's* perspective.** On touch, you don't hover; you tap. The whole class of submenu-aiming bugs is "irrelevant on phones". The implementer skips the corridor; desktop users suffer in silence.

The desktop's correct answer is still the 1986 corridor, or a pie. The web mostly ships neither.

---

## What Micropolis does

The federation prefers pies wherever a command has spatial meaning ([gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md), [pie-menus-fitts-law.md](pie-menus-fitts-law.md)). When we ship linear menus — and we will, for legacy compatibility, OS-level menubars, and dense content like "select a city" lists — we will:

1. **Document the drag-delay model** in the component spec, with parameters, and treat them as accessibility settings (slow drag-delay for motor-impaired users).
2. **Port the Amazon-style triangle** to the Wasm UI, not the timeout model. JS-tracked, settable, testable.
3. **Cross-link to this document** in the component source so future authors don't roll their own bad corridor.
4. **Bias new commands toward pies** so we add fewer linear-submenu liabilities over time.

Implementation home: [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md). Catalog navigation will be Simplifier's first major test of these geometries — see [sims-content-registry.md](sims-content-registry.md).

---

## Pointers

| Topic | Where |
|---|---|
| Apple Human Interface Guidelines, 1987 — drag delay on p. 87 | [archive.org scan](https://archive.org/details/applehumaninterf00appl) · [Andy Matuschak PDF](https://andymatuschak.org/files/papers/Apple%20Human%20Interface%20Guidelines%201987.pdf) |
| Tognazzini's Fitts quiz with the `<` corridor description | [asktog.com/columns/022DesignedToGiveFitts.html](https://www.asktog.com/columns/022DesignedToGiveFitts.html) |
| Don on Frank Leahy and the Menu Manager (Cairo thread) | [HN 32961306](https://news.ycombinator.com/item?id=32961306) on [32959397](https://news.ycombinator.com/item?id=32959397) |
| Don's long Kando comment — why the corridor is fragile | [HN 39228342](https://news.ycombinator.com/item?id=39228342) on [39206966](https://news.ycombinator.com/item?id=39206966) |
| Amazon mega-dropdown writeup | [bjk5.com/post/44698559168](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown) |
| Amazon mega-dropdown HN thread (Tog confirms invention) | [HN 17404401](https://news.ycombinator.com/item?id=17404401) |
| Cairo Fitts comparison | [HN 32993307](https://news.ycombinator.com/item?id=32993307) on [32992284](https://news.ycombinator.com/item?id=32992284) |
| Mackido on hysteresis (alternate name for the trick) | [mackido.com/Interface/hysteresis.html](https://www.mackido.com/Interface/hysteresis.html) |
| Pie menus that sidestep all of this | [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| Federation pie shell | [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) |
