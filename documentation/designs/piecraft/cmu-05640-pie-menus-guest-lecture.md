# CMU 05-640 — Pie Menus Guest Lecture

**Course:** CMU 05-640 Interaction Techniques (Brad Myers, UI class)
**Format:** Guest Lecture #2
**Speaker:** Don Hopkins
**Title:** Pie Menus: Definitions, Roles and Future Directions

**Companion docs:** [PIE-MENU-MODEL.md](./PIE-MENU-MODEL.md) · [gesture-space-and-pie-menus.md](../gesture-space-and-pie-menus.md) · [pie-menus-fitts-law.md](../pie-menus-fitts-law.md) · [Brad Myers / Garnet / VPL](../brad-myers-visual-programming-hn.md) · [Brad Myers correspondence](https://github.com/SimHacker/DonHopkins/blob/main/characters/don-hopkins/correspondence/brad-myers.yml) · [Panopto video](https://scs.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=f0600d9d-282e-4b83-a6f4-a9f2003ad407)

---

## What's this talk about?

Three sections:

1. **Definitions and Models** — Define a vocabulary to describe many possible models and techniques. Describe some useful models with those words.
2. **Roles and Skills** — Who can use and design pies for what kinds of tasks, and what skills are required? How can tools and apps be easy to learn and use, and enable users to level up by rehearsing gestures, training up design skills with hands-on experience, and gaining literacy by deep immersion in personal interface design?
3. **Future Directions and Distances** — Pie menus encompass all different directions!

---

## Definitions and Models

Define a consistent set of terms that describe a wide range of possible models and techniques, while avoiding historical baggage and hidden assumptions.

- Shed the word "Menu" from the name: **Pie-centric** instead of Menu-centric.
- Add the **Slice** layer to the model: **Pie / Slice / Item** instead of Menu / Item.
- Include the word **Target** in the model: the place you do something to pop up a pie.
- Describe an API and data model, including a full set of tracking notification callbacks, to support live in-world feedback and WYSIWYG direct manipulation editing.

### Target / Pie / Slice / Item

Define consistent terms to describe many possible models and techniques, while avoiding historical baggage and hidden assumptions.

- Eschew "Menu". Focus on "Pie". Define "Target". Define "Slice".
- Menu / Item **vs** Target / Pie / Slice / Item
- Hierarchical "Submenus" **vs** Bilateral "Sibmenus"
- Self Revealing (slow) ⇒ Gesture Ahead (quick) ⇒ Display Pre-Emption (invisible) ⇒ In-World Feedback (WYSIWYG)

The word "Menu" has a lot of historical baggage, and brings with it many assumptions and expectations. So I prefer the more general word **"Pie"**.

"Menu" is still a useful word to describe the window, map or other feedback that pops up to reveal the possible directions, but you can still use a Pie without showing its Menu. Unlike traditional gesture recognition, Menus make Pies **Self Revealing**, by showing you what they can do and how to use them.

Pies can be used to emulate traditional Menus, but they're much more flexible, since distance and direction can be discrete or continuous values: as a numeric parameter for example, or to select between multiple items in the same slice. Pies provide continuous live WYSIWYG In-World Feedback during tracking, and Display Pre-Emption of not showing the Menu if the user Gestures Ahead.

**Undefinitions: Ixnay On The Enumay!**

### Submenus vs Sibmenus

Menus can be arranged in hierarchical trees of "submenus".

Pies can also be arranged in bilateral maps of "sibmenus".

| | Pie Menu Trees | Pie Place Maps |
|---|---|---|
| Links | Hierarchical up & down (parents ↔ children) | Bilateral back & forth (siblings) |
| Metaphor | Climbing trees | Navigating maps |
| Navigation | Always starts at root; back/cancel commands | Remembers current position; opposite direction returns |

**Pie Menu Trees have Submenus:** Always starts out at the root, and usually has commands for going back to the parent pie menu, and canceling the whole pie menu tree. Navigation commands require precious input device or screen resources, and may be confusing to users.

**Pie Place Maps have Sibmenus:** It remembers your current position in the map. Doesn't require special hierarchical navigation commands or input device and screen space. Less confusing, more physical than hierarchical navigation: if you move in a direction to another place, the opposite direction will always bring you back. (No "twisty maze of tiny passages".) You can have several current positions in any number of maps (like "avatars", or Petri net tokens). Places can have other user interfaces and media embedded in them, like HyperCard stacks.

### Embedding and Editing

You can embed pie menu trees and pie place maps in each other.

Building and Editing Pie Place Maps is easy, by dragging and bumping.

HyperCard. Rooms. DreamScape. iLoci. MediaGraph.

---

## Roles and Skills

What kind of people use pies? What kind of people can design pies?

How can UI personalization tools raise people's skill and promote literacy in user interface design and Fitts's Law, and enhance creativity and expressivity without sacrificing usability?

| Term | Meaning |
|---|---|
| **Prosumer** | Producer + Consumer |
| **Prosigner** | Programmer + Designer |

Visual Programming. Programming by Example. Programming by Demonstration. Domain Specific Languages. Scripting Languages. HyperCard. HyperTalk. JavaScript.

> "It gives better results to give programming abilities to people with a passion about something, than to install a passion in somebody with programming abilities." — Bill Atkinson

---

## Future Directions

HyperCard — "How many of you guys have done HyperCard?" Dig out receipt. HyperLook manual.

Pie menus encompass all different directions — distance and direction as parameters, sibmenu graphs, in-world feedback, prosumer editing, embedding in HyperCard-style places.

---

## Slide deck tail (HyperCard + StoryMaker)

The original deck also included HyperCard demo notes and **StoryMaker** architectural slides from SFC. Those StoryMaker layers are documented separately:

- [../storymaker/architectural-overview.md](../storymaker/architectural-overview.md) — diagram + layer definitions
- [../family-album-as-storymaker.md](../family-album-as-storymaker.md) — Micropolis revival of the same graph model
