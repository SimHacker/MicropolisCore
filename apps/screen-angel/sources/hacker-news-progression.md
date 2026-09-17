# aQuery on Hacker News, 2015–2025

Eighteen comments contain the word "aQuery". All of them are Don's — nobody else on Hacker News
has ever used the word. He posted the idea repeatedly over ten years, adding something each
time and never writing the code. This table records what each post contributed that the
previous ones did not, so the design in [`../AQUERY.yml`](../AQUERY.yml) can state each idea
once and point back here for provenance.

Six further comments discuss Prefab without naming aQuery; they are listed at the end.

## The aQuery posts

| Date | Comment | Thread | What it added |
|------|---------|--------|---------------|
| 2015-07-30 | [9977226](https://news.ycombinator.com/item?id=9977226) | RobotJS – Node.js Desktop Automation | **First public post.** Names it. The one-paragraph definition (jQuery-like selectors over macOS Accessibility objects), the pie-menu and HyperCard-builder use cases, the accessibility-tree-as-DOM analogy, live pattern registration via mutation-summary, and the "should be independent of jQuery" caveat. |
| 2016-04-18 | [11520967](https://news.ycombinator.com/item?id=11520967) | Browserball | **The hybrid thesis.** Screen scraping and accessibility APIs have *different* limitations, so use both — "augmented reality for virtualizing desktop user interfaces." Transcludes James Landay's reply and Don's email to Morgan Dixon. |
| 2016-04-18 | [11521683](https://news.ycombinator.com/item?id=11521683) | Browserball | Implementation options: a scriptable double-buffered VNC server (efficient, native accessibility access) versus the client side (flexible, less efficient). The cross-app widget abstraction — "a video player widget that knows how to drive YouTube, Vimeo, VLC, QuickTime, WMP." Two new prior-art citations: Berkeley Systems OutSpoken, and Potter/Shneiderman/Bederson on pixel data access. |
| 2016-09-04 | [12425668](https://news.ycombinator.com/item?id=12425668) | Blind Apple engineer transforming the tech world at 22 | Notes his own wiki's Prefab links are already broken and supplies replacements. |
| 2017-03-08 | [13817649](https://news.ycombinator.com/item?id=13817649) | The Unix-Haters Handbook | Reframes aQuery as the answer to "how should you design a programmable window manager today," chained to the NeWS/X11 history. First time the hidden-WebView prototype story enters the Hacker News record. |
| 2017-04-24 | [14182061](https://news.ycombinator.com/item?id=14182061) | Show HN: Stack, tiling WM for Windows | Fullest Prefab bibliography with abstracts. Hopgood's *Methodology of Window Management*. Clearest scope statement: "programming window management, accessibility, screen scraping, pattern recognition and automation in JavaScript." |
| 2017-09-12 | [15227953](https://news.ycombinator.com/item?id=15227953) | A font to make sparklines in seconds | A name-drop, but with a new application: sonifying a graph for a screen reader, pitch proportional to value. |
| 2017-09-25 | [15327767](https://news.ycombinator.com/item?id=15327767) | X and NeWS history | **The tightest definition he ever wrote** — quoted at the top of `AQUERY.yml`. Frames Dixon and Fogarty as proof that pixel-based deconstruction works and needs marrying to platform accessibility APIs through a scripting language. |
| 2017-09-25 | [15327997](https://news.ycombinator.com/item?id=15327997) | X and NeWS history | **The most technical post.** A platform-independent selector language implemented natively like `querySelector`; the pattern engine sending asynchronous events back to JavaScript; handlers bound to pixel patterns *and* accessibility patterns for objects that don't exist yet; using the cheap native API to narrow which pixels are worth scraping; wrapping a recognized YouTube player in an abstract VideoPlayer widget; PhoneGap/Cordova and NativeScript as native-bridge precedent. |
| 2018-05-18 | [17105728](https://news.ycombinator.com/item?id=17105728) | Pie Menus: A 30-Year Retrospective | Repositions aQuery as accessibility infrastructure rather than window-manager plumbing. The payoff he names is integrating Dasher deeply enough to drive real applications, for people with limited motion. |
| 2018-12-31 | [18797587](https://news.ycombinator.com/item?id=18797587) | Show HN: Autumn, a macOS window manager | **Dates the prototype and admits its fate.** Slate issue opened June 2013; Slate's last commit was February 2013; no feedback; abandoned. "It actually worked!" |
| 2018-12-31 | [18797818](https://news.ycombinator.com/item?id=18797818) | Show HN: Autumn, a macOS window manager | Adds the speech dimension — accessibility *and* speech recognition APIs for writing application automation bots, with `dragonfly`'s per-application command-module repository as the model. |
| 2020-04-10 | [22829690](https://news.ycombinator.com/item?id=22829690) | Simula, a VR window manager for Linux | **The diagnosis of what Prefab lacks:** "Prefab isn't built around a scripting language like dragonfly, NeWS or AJAX." Also the film-grammar argument about VR window managers, and the claim that X11 rejected the NeWS idea of a window manager extensible with downloadable code. |
| 2021-11-04 | [29105919](https://news.ycombinator.com/item?id=29105919) | How X Window Managers Work | The full requirements list in one sentence. First time he replaces his own dead wiki URL with an archive.org URL. |
| 2023-06-02 | [36166380](https://news.ycombinator.com/item?id=36166380) | Brave introduces vertical tabs | Transcludes the Peter Korn email into Hacker News again, so the wiki text survives independent of his site. Calls Schneegans' Kando and Fly-Pie "a big step in the right direction." |
| 2023-11-24 | [38400368](https://news.ycombinator.com/item?id=38400368) | AI is currently just glorified compression | The Dasher framing again, as "a long term pie in the sky grand plan." |
| 2025-06-03 | [44173863](https://news.ycombinator.com/item?id=44173863) | Ask HN: Options for One-Handed Typing | Self-quote. No new content. |
| 2025-06-04 | [44176481](https://news.ycombinator.com/item?id=44176481) | Ask HN: Options for One-Handed Typing | Confirms the web site is offline. Publishes the Don ↔ Ada Majorek email exchange in which the aQuery paragraph was originally sent. Her reply: "Implementing it in Java Script is an interesting idea. You are second person suggesting it." |

## Prefab without aQuery

| Date | Comment | Thread | Note |
|------|---------|--------|------|
| 2015-07-30 | [9977289](https://news.ycombinator.com/item?id=9977289) | RobotJS | Sibling comment, just the project URL. |
| 2017-04-25 | [14191071](https://news.ycombinator.com/item?id=14191071) | Show HN: Stack | Locates Prefab's source release at github.com/prefab/code and quotes the README. |
| 2020-02-09 | [22283258](https://news.ycombinator.com/item?id=22283258) | HyperCard: What Could Have Been | Prefab as prior art for sampling and remixing existing interfaces. Refers to "Morgan Dixon's PhD thesis on Prefab" — unverified, no thesis appears on the authors' publications page. |
| 2020-12-17 | [25459536](https://news.ycombinator.com/item?id=25459536) | Philosophy of the GNU Project | Prefab against "what if every GUI were open source," with the workshop paper's abstract. |
| 2021-02-08 | [26060809](https://news.ycombinator.com/item?id=26060809) | Taxonomies of Visual Programming | Places Prefab in the programming-by-demonstration lineage: Potter's Triggers, Myers' Garnet/PERIDOT/C32, Ingalls' Lively. |
| 2026-05-13 | [48116547](https://news.ycombinator.com/item?id=48116547) | Reimagining the mouse pointer for the AI era | **The LLM reframing:** Prefab was "pre-LLM pattern recognition, which is much more relevent with LLMs now." |

## What isn't here

- **No aQuery code exists anywhere.** None of 55 SimHacker repos is named aquery, and Don's
  fork of Slate carries no commits of his own, so the WebView hack was never pushed. The only
  artifacts are prose and the issue he filed.
- **Hacker News before April 2014 is a blind spot** — Algolia's oldest indexed comment for his
  account is 2014-04-14, but the Slate issue is dated June 2013.
- **The email thread is undated.** The wiki page carried no dates and its revision history was
  never archived.
- **Peter Korn's substantive reply was never written down.** He promised "a LOT more
  information" by email; it appears nowhere.
- Two pages of the wiki have **zero Wayback captures and are permanently lost**:
  `Cellular_Automata` and `Drupal_Node_Index` — the latter also loses the map of what the
  Drupal node numbers cited throughout the email thread meant.
