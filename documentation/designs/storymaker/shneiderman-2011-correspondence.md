# StoryMaker — Shneiderman ↔ Hopkins correspondence (2011)

**Primary source:** Email thread, August–September 2011 — Ben Shneiderman ↔ Don Hopkins (HCIL / Steve Jobs 1988 documentation; StoryMaker status; StoryKit pointer).

**Participants:**

| Person | Role (2011) |
|---|---|
| **Ben Shneiderman** | HCIL director, UMD; touchscreen / direct-manipulation HCI lineage |
| **Don Hopkins** | Stupid Fun Club — **StoryMaker** server + iPhone/iPad app; **Bar Karma** / **Urban Safari** stack |
| **Ben Bederson** | StoryKit / International Children's Digital Library (ICDL) — cited by Shneiderman, not on thread |
| **Janet Murray** | Georgia Tech — Experimental Television Group; StoryMaker student projects |

**Companion:** [architectural-overview.md](architectural-overview.md) · [../bar-karma/overview.md](../bar-karma/overview.md) · [../urban-safari/overview.md](../urban-safari/overview.md) · [family-album-as-storymaker.md](../family-album-as-storymaker.md)

**Why MicropolisCore keeps this:** Documents **StoryMaker at peak SFC deployment** (geo server + native app, GA Tech collaboration, ad-hoc TestFlight-style distribution). Anchors **HCIL → iPhone keyboard** lineage Shneiderman was actively documenting. Names **StoryKit** as the closest contemporary iOS story-authoring peer — useful when comparing Soul City Family Album revival to prior art.

---

## 1. Shneiderman opens — HCIL webshop, Jobs visit (31 August 2011)

Ben wrote after HCIL's **Summer Social Webshop** ([webshop2011](http://www.cs.umd.edu/hcil/webshop2011); [CCC blog recap](http://www.cccblog.org/2011/08/29/a-summer-social-webshop/)). He asked Don whether he remembered **Steve Jobs's visit to HCIL in October 1988** — notes beyond pie menus, or anecdotes about what Jobs said.

Context: Ben's lab was trying to document that HCIL showed Jobs **touchscreen interfaces**, especially **small ~3-inch-wide keyboards with a lift-off strategy**, that **eventually got put into the iPhone**.

---

## 2. Don's reply — StoryMaker status (31 August 2011)

Don had no further notes on the Jobs visit. Anecdote only: a party at the **Air and Space Museum** where he showed Jobs a red bell pepper bitten to look like an alien's head.

On **StoryMaker** (August 2011):

| Item | Detail |
|---|---|
| **Recent work** | **Geolocation** added to **server** and **iPhone/iPad app** |
| **Distribution** | Ad-hoc builds — send device **UUIDs**, Don bakes installable builds |
| **Academic partner** | **Janet Murray**, Experimental Television Group, **Georgia Tech** — student projects on StoryMaker |
| **Onboarding wiki** | [Georgia Tech — StoryMaker wiki](http://storymaker.stupidfunclub.com/mediawiki/index.php/Georgia_Tech) (SFC `stupidfunclub.com` era) |
| **Invite** | Ben and interested HCIL colleagues welcome to play with it and give feedback |

Don wished he could have attended the webshop — "just the kind of stuff I'm working on."

---

## 3. Shneiderman's follow-up — StoryKit, Bederson (1 September 2011)

Ben thanked Don for the quick reply on the Jobs documentation effort.

On **StoryMaker:**

> Your StoryMaker seems like a great project... I suggest getting in touch with **Ben Bederson** as he did **StoryKit** for iPhone and iPad.

Pointer: Wes Fryer's [StoryKit write-up (September 2010)](https://www.speedofcreativity.org/2010/09/13/publish-student-stories-online-with-artwork-text-and-audio-narration-with-storykit-free/) — free ICDL iOS app; photos, text, digital art, **audio narration**; publishes a **mobile-friendly private webpage** when shared; no account login (email link from device). Ben Bederson replied on that post as **StoryKit / ICDL director**.

Ben also: "Bravo for working with **Janet Murray** and GA Tech."

Reiterated HCIL's claim: they showed Jobs **touchscreen UIs** and the **small lift-off keyboard** that fed iPhone keyboard design.

---

## 4. StoryMaker vs StoryKit (design contrast)

| Dimension | **StoryMaker** (SFC, Don, 2010–11) | **StoryKit** (ICDL, Bederson, ~2010) |
|---|---|---|
| **Core model** | Geo-social **scene graph** + **storylines** — branching narrative engine | Linear **page/book** — child-authored stories |
| **Place** | First-class **Places** layer (lat/long, venue IDs, virtual worlds) | Optional per-page media; not a map-native engine |
| **Distribution** | Server + native app; wiki/onboarding for institutions | Free hosted viewer page; email private link |
| **Audience** | Bar Karma writers' room, GA Tech TV lab, Urban Safari field capture | Classrooms, families, ICDL readers |
| **Relation today** | Revived as [family-album-as-storymaker.md](../family-album-as-storymaker.md) in Soul City | Prior art for **mobile capture → publish link**; no graph merge |

Shneiderman's Bederson pointer is complementary, not competitive — both camps cared about **stories authored on device and shared on the web** without desktop toolchain lock-in.

---

## 5. Product-line mapping (2011 thread → four designs)

| Product | What this thread adds |
|---|---|
| **[StoryMaker](architectural-overview.md)** | Operational snapshot: geo server + iOS client; GA Tech curriculum wiki; UUID ad-hoc installs |
| **[Bar Karma](../bar-karma/overview.md)** | Same StoryMaker substrate powering viewer-scripted TV; Janet Murray collaboration = academic writers'-room pattern |
| **[Urban Safari](../urban-safari/overview.md)** | Geolocation called out explicitly — Places layer is the Urban Safari field-capture hook |
| **ShowMaker** | Later specialization of StoryMaker graph for repo-show networks — [WillWrightShowForFood/process/showmaker-network.md](https://github.com/SimHacker/WillWrightShowForFood/blob/main/process/showmaker-network.md) |

---

## 6. HCIL touchscreen keyboard → iPhone (external lineage)

Shneiderman's 2011 documentation push ties HCIL **October 1988** demos (pie menus plus **~3-inch lift-off keyboard**) forward to iPhone soft keyboard behavior. MicropolisCore touch/pie work lives in [piecraft/](../piecraft/README.md), [automotive-touch-ui-vs-pie-menus.md](../automotive-touch-ui-vs-pie-menus.md), [gesture-space-and-pie-menus.md](../gesture-space-and-pie-menus.md) — distinct from StoryMaker product docs but same Hopkins/Shneiderman HCI orbit.

---

## 7. See also

- [architectural-overview.md](architectural-overview.md) — nine-layer SFC model
- [maxis-ea-shutdown-hn-2015.md](../maxis-ea-shutdown-hn-2015.md) — SFC / Bar Karma timeline
- [simcity-2013-willmott-hopkins-correspondence.md](../simcity-2013-willmott-hopkins-correspondence.md) — correspondence doc pattern
- [StoryKit — Wes Fryer (2010)](https://www.speedofcreativity.org/2010/09/13/publish-student-stories-online-with-artwork-text-and-audio-narration-with-storykit-free/)
