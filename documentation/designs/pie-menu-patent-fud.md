# The marking-menu patent that chilled radial UI for two decades

## How a narrow patent on one overflow trick, plus Alias marketing, scared Kinetix, Blender, and most of the desktop world off pie menus — even though prior art was sitting right there

**Primary sources:** Don Hopkins, [*Pie Menu FUD and Misconceptions*](https://donhopkins.medium.com/pie-menu-fud-and-misconceptions-be8afc49d870); [HN 17103627](https://news.ycombinator.com/item?id=17103627) on [17098179](https://news.ycombinator.com/item?id=17098179); [HN 41168887](https://news.ycombinator.com/item?id=41168887) on [41160268](https://news.ycombinator.com/item?id=41160268); [Blender Artists thread on marking-menu patent expiry](https://blenderartists.org/t/when-will-marking-menu-patent-expire/618541).

**Companion docs:** [pie-menus-fitts-law.md](pie-menus-fitts-law.md) · [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)

---

## Summary

In 1995 Gordon Kurtenbach (then at SGI/Alias) was granted [US 5,689,667](https://patents.google.com/patent/US5689667A) — "Methods and system of controlling menus with radial and linear portions". The actual claim was *narrow*: a radial menu whose items overflow into a linear list when there are too many to fit on the ring. Alias's marketing department turned that into "patented marking menus" and kept saying it for two decades — chilling Kinetix (3D Studio Max) and Blender out of using pie menus *at all*, long after the patent expired in 2015. Don Hopkins had been shipping ActiveX pie menus in The Sims and had previously shared his work with both Buxton and Kurtenbach; when he tried to sort out the truth in person, Bill Buxton lied to his face that no patent existed. Gordon later confirmed in writing that the patent only ever covered the overflow combo, that Max could have shipped ordinary pies, and that they declined to clarify because Max was their commercial rival.

This is a cautionary tale about patent abuse, marketing FUD with a long tail, and how much HCI progress got eaten by it.

---

## At a glance

- Patent: [US 5,689,667](https://patents.google.com/patent/US5689667A), filed 1995, expired ~2015. Claims **radial + linear overflow combo**. Does *not* cover ordinary pie menus.
- Bill Buxton (Alias UI research) told Don directly: *"there's no marking menu patent"* — technically true only on the narrowest legal reading, deliberately misleading in the moment.
- Alias marketing kept advertising *"Patented marking menus"* in [brochures](http://images.autodesk.com/adsk/files/aliasdesign10_detail_bro_us.pdf) for decades.
- Kinetix told Don they avoided pies "for fear of being sued for patent infringement" — even though Kinetix's customers were asking for them.
- Blender community spent years on [a public thread](https://blenderartists.org/t/when-will-marking-menu-patent-expire/618541) asking *when the patent will expire* before they could ship.
- Patent finally expired; radial pies returned to 3ds Max in **January 2018** (a *Radially* plugin demo: [YouTube sjLYmobb8vI](https://www.youtube.com/watch?v=sjLYmobb8vI)) and to Blender shortly after.
- Autodesk now owns *both* Alias and 3ds Max.

---

## Patent prose vs shipped pies

US 5,689,667 describes "typical pie menus" in a way that does not match pie menus as shipped by HyperTIES, NeWS, SimCity, The Sims, or [donhopkins.com pie central](https://donhopkins.com/home/catalog/piemenus/index.html). The patent characterises pies as *requiring* a separate click to confirm and as *not* supporting mouse-ahead. Both claims are contradicted by Don's [Dr. Dobb's Journal article](https://donhopkins.medium.com/the-design-and-implementation-of-pie-menus-80db1e1b5293) — which *is cited in the patent*. As Don puts it in the FUD article:

> Unfortunately they were able to successfully deceive the patent reviewers, even though the patent references the Dr. Dobb's Journal article which clearly describes how pie menu selection and mouse ahead work, contradicting the incorrect claims in the patent. It's sad that this kind of deception and patent trolling is all too common in the industry.

The *narrow* novel claim of US 5,689,667 is the **overflow trick**: when more items are needed than fit comfortably on a single ring, the patent's menu spills the extras into a linear list. That specific combo — radial+linear — is what Gordon Kurtenbach later (privately) said was all the patent covered.

Related and frequently cited in the same conversations:

| Patent | Claim shape |
|---|---|
| [US 5,689,667](https://patents.google.com/patent/US5689667A) | Radial + linear overflow combo |
| [US 5,926,178](https://patents.google.com/patent/US5926178) | Related menu control mechanism |
| [US 6,618,063](https://patents.google.com/patent/US6618063B1) | Menu production/control variants |

Treat all three as expired and as not legal advice; the point of this document is the *FUD*, not the law.

---

## What Bill Buxton said to Don's face

From the long Pie Menus retrospective comment ([HN 17103627](https://news.ycombinator.com/item?id=17103627), parent story [17098179](https://news.ycombinator.com/item?id=17098179)):

Don, working at Maxis on The Sims, walks the Game Developers Conference trade-show floor in the late 1990s. He stops at the Kinetix (3ds Max) booth to ask about integrating his existing ActiveX pie menus into Max.

> They told me that Alias had "marking menus" which were like pie menus, and that Kinetix's customers had been requesting that feature, but since Alias had patented marking menus, they were afraid to use pie menus or anything resembling them for fear of being sued for patent infringement.

Don walks across the aisle to the Alias booth.

> When I asked one of the Alias sales people if their "marking menus" were patented, he immediately blurted out "of course they are!" So I showed him the ActiveX pie menus on my laptop, and told him that I needed to get in touch with their legal department because they had patented something that I had been working on for many years, and had used in several published products, including The Sims, and I didn't want them to sue me or EA for patent infringement.

The Alias rep walks the story back, changes it several times, eventually points Don at Bill Buxton.

> So I called Bill Buxton at Alias, who stonewalled and claimed that there was no patent on marking menus (which turned out to be false, because he was just being coy for legal reasons). He said he felt insulted that I would think he would patent something that we both knew very well was covered by prior art.

The phrase Don applies to this in 2018: *gaslighting*. Buxton was relying on the legal nicety that the patent only covered the radial+linear overflow technique — not "marking menus" or "pie menus" in general — to claim that there was no patent. The marketing department was simultaneously advertising "patented marking menus" to scare off competitors. Kinetix had no way of knowing the difference. Neither did Blender. Neither did Don.

---

## Gordon Kurtenbach later confirms it

Gordon — the actual inventor of the radial+linear overflow technique that the patent narrowly covers — eventually responded to Don in writing. Excerpts quoted in [HN 17103627](https://news.ycombinator.com/item?id=17103627):

> Don, I read and understand your sequence of events. Thanks. It sounds like it was super frustrating, to put it mildly. Also, I know, having read dozens of patents, that patents are the most obtuse and maddening things to read. And yes, the patent lawyers will make the claims as broad as the patent office will allow. So you were right to be concerned. Clearly, marketing is marketing, and love to say in-precise things like "patented marking menus".
>
> At the time Bill or I could have said to you "off the record, it's ok, just don't use the radial/linear combo". I think this was what Bill was trying to say when he said "there's no patent on marking menus". That was factually true. However, given that Max was the main rival, we didn't want to do them any favors. So those were the circumstances that lead to those events.

And, plainly, on the FUD's effect on Kinetix:

> After Autodesk acquired Alias, I talked to the manager who was interested in getting pie menus in Max. Yes, he said he that the Alias patents discouraged them from implementing pie menus but they didn't understand the patents in any detail. Had you at the time said "as long as we don't use the overflows we are not infringing" that would have been fine. I remember at the time thinking "they never read the patent claims".

Three things land here:

1. The patent was *legally* narrow.
2. The marketing was *operationally* broad and intentional.
3. The competitive harm was *real* and *foreseen* — Alias declined to clarify because they wanted Max to stay handicapped.

Also from the same comment, on Bill Buxton's parallel acknowledgement *before* the patent was filed:

> The cool thing is that expert can mouse ahead like you've talked about but they get an ink trail so they have a better idea what they've selected without even bothering to wait for the menu to come up. — Gordon Kurtenbach to Don, 1990

i.e. Gordon explicitly recognised in 1990 that ordinary pie menus support mouse-ahead — which the patent later misleadingly implied they did not.

---

## The long-tail collateral damage: Blender

Alias's quarrel was with Max. The blast radius was much wider, because every open-source 3D and CAD project read the same brochures and the same Wikipedia paragraphs. From the [Blender Artists thread, *"When will marking menu patent expire?"*](https://blenderartists.org/t/when-will-marking-menu-patent-expire/618541) — quoted in [17103627](https://news.ycombinator.com/item?id=17103627):

> Hi. In a recently closed topic regarding pie menus, LiquidApe said that marking menus are a patent of Autodesk, a patent that would expire shortly. The question is: When? When could marking menus be usable in Blender? I couldn't find any info on internet, mabie [sic] some of you know.

Blender was a volunteer project, no patent attorney on retainer, no way to interpret "patented marking menus" except literally. They waited. They asked. They worked around it. Don's exasperated note:

> What's even worse is that in Buxton's zeal to attack 3D Studio Max users, he also attacked users of free software tools like Blender.

Pie menus finally returned to:

- **3ds Max** — January 2018, via the *Radially* plugin ([YouTube sjLYmobb8vI](https://www.youtube.com/watch?v=sjLYmobb8vI)).
- **Blender** — modern Blender ships pie menus natively; community threads remain a record of the chilling effect.

Both happened *after* the patent expired in ~2015 — about twenty years after the marketing started.

---

## The Apple-look-and-feel parallel

This is the same shape as the early-1990s Apple look-and-feel suits archived by the [League for Programming Freedom](https://web.archive.org/web/20011201191326/http://progfree.org/) (LPF) — broad patent or copyright claims used to suppress a UI technique that has plenty of prior art. The mechanism is the same: weaponise the *ambiguity* of the claim through marketing; never have to litigate; collect twenty years of competitive advantage from chilling effect alone.

Documenting it doesn't expire it. The Alias brochure (PDF: [aliasdesign10_detail_bro_us.pdf](http://images.autodesk.com/adsk/files/aliasdesign10_detail_bro_us.pdf)) is still on Autodesk's CDN.

---

## What Micropolis takes from this

The [Micropolis Federation](simopolis.md) ships pie menus throughout — verb rings around Sims, tool rings in city mode, command rings in [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md). All of them are *ordinary* pies. We do not use the radial+linear overflow pattern even though the relevant patent expired a decade ago, because:

1. The narrow technique never carried its weight visually — it always felt like two different controls glued together.
2. Documenting *which* prior art our pies inherit from (HyperTIES, SimCity, The Sims, [historical/drupal-blog/2004-02-05-xml-pie-menus.md](../historical/drupal-blog/2004-02-05-xml-pie-menus.md)) is good federation hygiene anyway.
3. Future federation peers ([federation-peer-games.md](federation-peer-games.md)) should not have to do this research again — the cautionary tale needs to live in the repo, not a Medium post.

This is *not legal advice*. It is a design-cultural note: **when you ship UI primitives in an open ecosystem, write down where they come from, why they are unencumbered, and which historical IP claims attached to them.** Bad patents and FUD survive on opacity.

---

## Pointers

| Topic | Where |
|---|---|
| Don's full FUD essay | [donhopkins.medium.com/pie-menu-fud-and-misconceptions](https://donhopkins.medium.com/pie-menu-fud-and-misconceptions-be8afc49d870) |
| The Gordon Kurtenbach email, in full | [HN 17103627](https://news.ycombinator.com/item?id=17103627) on [17098179](https://news.ycombinator.com/item?id=17098179) |
| 2024 macOS Pie Menu thread (full FUD comment + PIXIE) | [HN 41160268](https://news.ycombinator.com/item?id=41160268) · harvest [macos-pie-menu-app-hn-2024.md](macos-pie-menu-app-hn-2024.md) · short [41168887](https://news.ycombinator.com/item?id=41168887) |
| US 5,689,667 (the actual patent) | [patents.google.com/patent/US5689667A](https://patents.google.com/patent/US5689667A) |
| Alias brochure with "Patented marking menus" line | [autodesk CDN PDF](http://images.autodesk.com/adsk/files/aliasdesign10_detail_bro_us.pdf) |
| Blender Artists "When will marking menu patent expire?" | [blenderartists.org/t/618541](https://blenderartists.org/t/when-will-marking-menu-patent-expire/618541) |
| *Radially* — 3ds Max pies January 2018 | [YouTube sjLYmobb8vI](https://www.youtube.com/watch?v=sjLYmobb8vI) |
| Dr. Dobb's Journal pie menus article (cited in the patent) | [donhopkins.medium.com/the-design-and-implementation-of-pie-menus](https://donhopkins.medium.com/the-design-and-implementation-of-pie-menus-80db1e1b5293) |
| LPF archive (same-era IP climate) | [progfree.org (archive.org)](https://web.archive.org/web/20011201191326/http://progfree.org/) |
| Why pies matter, despite all of this | [pie-menus-fitts-law.md](pie-menus-fitts-law.md) |
| What pies feel like in practice | [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) |
| Federation pie shell | [PIE-TAB-WINDOWS.md](../notes/PIE-TAB-WINDOWS.md) |
| Modern OSS radial menu (Kando) | [github.com/kando-menu/kando](https://github.com/kando-menu/kando) · launch thread [HN 39206966](https://news.ycombinator.com/item?id=39206966) |
