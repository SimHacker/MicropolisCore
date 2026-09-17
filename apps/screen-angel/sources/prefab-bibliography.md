# Prefab (Morgan Dixon & James Fogarty, University of Washington): verified citations

Verification method: each citation was checked against the Crossref REST API
(`api.crossref.org/works`), which returns ACM's own deposited metadata including the event
name, page range and DOI. DBLP was attempted first but is behind a bot wall
("Making sure you're not a bot!") and returned no usable JSON. The CHI 2010 workshop paper
is not in Crossref, so it was verified by downloading and reading the PDF from James
Fogarty's own UW publications directory.

The project page https://prefab.github.io/ and the code repository
https://github.com/prefab/code are both LIVE as of 2026-09-10 (HTTP 200).
http://morgandixon.net/ returns a 301 and does not resolve to content.

---

## What Prefab actually does (two sentences)

Prefab takes only the raw pixels of an already-running graphical interface, decomposes
example images of widgets into small invariant parts, and matches those parts against
screenshots to recover a tree of widgets and their state — effectively reconstructing
something like a web page's DOM for an application whose source code you do not have. It
re-runs this recovery many times per second, and pairs it with input and output
redirection, so you can overlay, replace, translate, annotate or add behavior to any
application's interface at runtime without any cooperation from that application.

Prefab is written in C# and runs on Windows, but because it only consumes pixels it can be
pointed at a remote-desktop or VM window to reverse-engineer macOS, Linux or web
interfaces. (Source: prefab.github.io home page, retrieved 2026-09-10, page footer says
"last modified on January 28, 2014".)

---

## The papers

### 1. The one to cite as "Prefab", CHI 2010

Morgan Dixon and James Fogarty. "Prefab: Implementing Advanced Behaviors Using Pixel-Based
Reverse Engineering of Interface Structure." In *Proceedings of the SIGCHI Conference on
Human Factors in Computing Systems* (CHI '10), Atlanta, Georgia, USA, April 2010, pp.
1525–1534. ACM. DOI: 10.1145/1753326.1753554

VERIFIED: authors, venue, year, page range and DOI all confirmed by Crossref.

This is the paper to cite when citing "Prefab" generally. The authors' own publications page
marks it BEST PAPER AWARD and gives the CHI 2010 acceptance rate as 22%.

CAUTION on a recurring error: Don's HN comment 14182061 labels this paper "at CHI2009" and
links a UW file named `CHI2009-Prefab-Final.pdf`. The filename is a UW artifact; the venue
is CHI 2010. Anything citing this as CHI 2009 is wrong.

### 2. Content and hierarchy, CHI 2011

Morgan Dixon, Daniel Leventhal, and James Fogarty. "Content and Hierarchy in Pixel-Based
Methods for Reverse Engineering Interface Structure." In *Proceedings of the SIGCHI
Conference on Human Factors in Computing Systems* (CHI '11), Vancouver, BC, Canada, May
2011, pp. 969–978. ACM. DOI: 10.1145/1978942.1979086

VERIFIED by Crossref. Note the ACM title has no hyphen in "reverse engineering"; Don and
the Prefab site both write "Reverse-Engineering". Same paper.

### 3. Target-aware pointing / the general-purpose Bubble Cursor, CHI 2012

Morgan Dixon, James Fogarty, and Jacob O. Wobbrock. "A General-Purpose Target-Aware
Pointing Enhancement Using Pixel-Level Analysis of Graphical Interfaces." In *Proceedings
of the SIGCHI Conference on Human Factors in Computing Systems* (CHI '12), Austin, Texas,
USA, May 2012, pp. 3167–3176. ACM. DOI: 10.1145/2207676.2208734

VERIFIED by Crossref. Crossref renders the third author as "Jacob Wobbrock"; he publishes
as Jacob O. Wobbrock.

### 4. The position paper with the memorable title, CHI 2010 FLOSS HCI workshop

Morgan Dixon and James Fogarty. "Prefab: What if Every GUI were Open-Source?" Position
statement, FLOSS HCI workshop at CHI 2010.
PDF: https://homes.cs.washington.edu/~jfogarty/publications/workshop-chi2010.pdf

PARTIALLY VERIFIED. The PDF was downloaded and read: the title on the paper is "Prefab:
What if Every GUI were Open-Source?" (lowercase "were"), the authors are Dixon and Fogarty
of the DUB Group, University of Washington, and it is 2 pages. Its own reference list cites
the CHI 2010 Prefab paper as "To Appear", which places it at or before CHI 2010.

AMBIGUOUS PAGE RANGE, and the ambiguity is not Don's fault. Don's wiki page and several HN
comments cite this as "CHI '10. ACM, New York, NY, 851-854." That string is copied verbatim
from the authors' own publications page (https://prefab.github.io/papers.html), which lists
it under the heading "Workshop Papers" while simultaneously giving it a CHI '10 proceedings
page range. Crossref has no record of it, and the PDF is 2 pages rather than 4. I cannot
resolve whether 851-854 refers to the CHI 2010 Extended Abstracts or is an error on the
authors' page. Safest form for a public document: cite it as a position paper at the FLOSS
HCI workshop at CHI 2010 and give the PDF URL, without asserting a page range.

---

## Follow-ups Don does NOT cite, which exist and are relevant

These came up in the Crossref author search and none of them appear anywhere in Don's HN
comments or on his wiki page. All page ranges and DOIs verified by Crossref.

- Morgan Dixon. "Pixel-based reverse engineering of graphical interfaces."
  UIST '13 adjunct proceedings (doctoral symposium), pp. 29–32.
  DOI: 10.1145/2508468.2508469

- Morgan Dixon, Gierad Laput, and James Fogarty. "Pixel-Based Methods for Widget State and
  Style in a Runtime Implementation of Sliding Widgets."
  CHI '14, pp. 2231–2240. DOI: 10.1145/2556288.2556979
  This is the paper behind the "Sliding Widgets, States, and Styles in Prefab" video that
  Don DOES link (youtube.com/watch?v=8LMSYI4i7wk) without citing the paper.

- Morgan Dixon, Alexander Nied, and James Fogarty. "Prefab Layers and Prefab Annotations:
  Extensible Pixel-Based Interpretation of Graphical Interfaces."
  UIST '14, pp. 221–230. DOI: 10.1145/2642918.2647412
  (Full subtitle taken from the authors' own publications page; Crossref stores the short
  form "Prefab layers and prefab annotations".)
  Chronologically the last Prefab systems paper, and the one nearest to what Don proposes:
  an extensible layering and annotation architecture over pixel-based interpretation.

---

## Videos (all URLs as Don cites them; not individually re-verified as playable)

- Prefab: What if We Could Modify Any Interface? — https://www.youtube.com/watch?v=lju6IIteg9Q
- Content and Hierarchy in Prefab — https://www.youtube.com/watch?v=w4S5ZtnaUKE
- Sliding Widgets, States, and Styles in Prefab — https://www.youtube.com/watch?v=8LMSYI4i7wk
- A General-Purpose Bubble Cursor — https://www.youtube.com/watch?v=46EopD_2K_4

The Prefab site's own videos page (https://prefab.github.io/videos.html, live) indexes four
videos under the headings "Original Prefab", "Content and Hierarchy", "Target-Aware
Pointing" and "Sliding Widgets", matching the four above.

---

## Supporting citation Prefab itself depends on

Tovi Grossman and Ravin Balakrishnan. "The Bubble Cursor: Enhancing Target Acquisition by
Dynamic Resizing of the Cursor's Activation Area." CHI 2005, pp. 281–290.
Taken from the reference list inside the CHI 2010 workshop PDF, so this page range is from
Dixon and Fogarty's own citation, not independently checked against ACM.
