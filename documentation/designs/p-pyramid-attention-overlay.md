# P-Pyramid Attention Overlay: Minsky's Memory Memo as a Window Manager Spec

Marvin Minsky's "K-Lines: A Theory of Memory" (MIT AI Memo 516, June 1979) reads,
forty-seven years later, like a design document for tabbed overlapping windows, workspace
presets, and attention management. This doc maps the memo's machinery onto the
[PIE-TAB-WINDOWS](../notes/PIE-TAB-WINDOWS.md) ensemble — pie menus, windows, tabs,
stacks, rails, snapping — one mechanism at a time.

Sources:

- [AI Memo 516, June 1979 (PDF)](https://dspace.mit.edu/bitstream/handle/1721.1/5739/AIM-516.pdf)
- [Cognitive Science 4(2):117-133, 1980](https://doi.org/10.1207/s15516709cog0402_1)
- Philosophy-side treatment: [moollm designs/P-PYRAMID.md](https://github.com/SimHacker/moollm/blob/main/designs/P-PYRAMID.md)
  (full OCR of the memo cached alongside the moollm k-lines skill)

## The P-pyramid

> "If one 'looks down' from the viewpoint of a given agent P, one will see other agents
> arranged roughly in a hierarchical Pyramid... I emphasize that the network as a whole
> need not be pyramidal; the P-pyramid we speak of is an illusion of an agent's
> perspective."

The workspace is a graph — content plugins, views, cards, links, the federation. No user
sees the graph; each user (and each LLM assistant) sees a **P-pyramid**: their own
hierarchical view over it, anchored at their vantage. GATHERING's "one structure, many
framings" lesson (tabs ≡ outline ≡ tree ≡ graph,
[GATHERING.md](playable-pie-publishing-cauldron/GATHERING.md)) is the same statement from
the implementation side: the tree the tab system renders is a spanning view of the graph,
per user, per moment.

Concretely, a P-pyramid is an **anchored attention mask**: a weight from 0 to 1 on every
node in view.

| Weight | Window system state |
|--------|---------------------|
| 0 | Closed: a bare tab on a rail, an icon, an unexpanded outline item |
| 0..1 | Partial: fish-eye scaled, summarized, peripheral — PSIBER's point-size × shrink-factor |
| 1 | Fully open: front window, full resolution, editable |

The scale policy already specified for PSIBER-style views (min-selectable label size;
shrink *or* grow with depth) is the rendering of fractional attention. AttentionService
(PIE-TAB-WINDOWS, State Stores & Services) is the bookkeeper: it holds the mask, decays
it, and drives badges and glow from it.

## Cross-exclusion: tab stacks are radio buttons

> "Most agents are grouped in small 'cross-exclusion' arrangements. Each sends inhibiting
> connections to the others in its group, so that it is hard for more than one to be
> 'active' at a time. This kind of sub-structure, familiar in physiology, makes it
> particularly easy to re-set the state of a system; one need only force to 'on' one agent
> in each cross-exclusion group. Then that agent will inhibit its associates — reducing
> their inhibiting effect on itself."

That is a radio button group, described as neuroanatomy. And a **stack of tabbed
overlapping windows is exactly a cross-exclusion group**: one member is front (active);
raising it inhibits its associates (occludes them); their being occluded is what keeps it
front. The reset gesture is one command — **pie-up on any tab brings its window to the
front of the stack**. Force one agent on; the group re-sets itself. No other state
management needed.

Radio buttons recur at every scale of the ensemble:

- **Tabs in a stack** — one front window.
- **Stacks in a workspace** — one focused stack receiving keyboard input.
- **Workspaces in a session** — one active workspace.
- **Overlay toggles in a pie menu** — mutually exclusive map overlays are a
  cross-exclusion group whose force-to-on is a slice selection.

Three memo consequences, all of them free features:

**Persistence.** "Networks composed of cross-exclusion systems have a kind of built-in
'short-term memory.' Once such a system is forced into a partial state, even for a moment,
then that state will tend to persist." Z-order IS short-term memory: the stack remembers
what you last raised, in order, with no additional mechanism. MRU tab cycling is reading
the inhibition state back out.

**Dispositions = workspace presets.** "Each P-pyramid may have a repertory of such
dispositions, defined by pre-activating different subsets of agents." A workspace preset
(PIE-TAB-WINDOWS: Workspace Presets, Roles, and LLM Orchestration) is precisely a
disposition: pre-activate a subset of windows/tabs at chosen weights and the same
workspace *sees differently* — editor disposition, streamer disposition, kiosk
disposition. Minsky's example is the Necker cube: the flip is not in the data, it's in
which subset is pre-activated. Small perturbations (opening one window) only slightly
perturb the disposition; changing roles means re-setting many groups at once — which
cross-exclusion makes cheap: force one member per group.

**Conflict means zoom out.** In the Minsky-Papert variant, two competing members active at
once make the whole group "drop out completely, defaulting to another group at the next
higher level... if a single viewpoint produces two conflicting suggestions, it is often
better not to seek a compromise, but to seek another, less ambiguous viewpoint." UI
translation: when two views of the same object fight (two editors with conflicting dirty
state, two overlays claiming the same layer), don't merge or beep — **escalate to the
parent view** and let the user resolve from one level up. Conflict is a zoom-out signal.

## Level bands: what a restored view should reopen

The memo's core principle: a K-line reactivates only an **intermediate band of levels** of
the pyramid. Reaching too low "would impose false perceptions and conceal the real details
of the present problem"; reaching too high "would make us hallucinate the present problem
as already solved." Edges of the band attach **weakly** — Minsky notes this yields frame
*default assignments*: weak activations lose cross-exclusion competition to anything the
present situation actually asserts.

For saved workspace views this is the restore policy:

- Reopen the **middle**: which stacks exist, where, with which tabs — the structure.
- Leave the **top** current: focus, active task, chat context belong to now, not to the
  saved view.
- Leave the **bottom** current: live document contents, simulation state, data feeds
  reload from the present, never from the snapshot.
- Restore peripheral windows at **low weight** (small, fish-eye, unfocused): defaults that
  yield. If the present session needs that screen area, the weakly-restored window loses
  the competition — exactly like a frame default displaced by a sensed value.

Minsky even specifies the zoom control (Note 5): the active level band is selected by a
separate agency sending a coarse **facilitation signal** — "try a more general method,"
"pay more attention to the input." That is AttentionService's steering role, and the
natural hook for the LLM assistant: it can bias the whole workspace's attention band
(overview vs detail) without touching individual windows.

## Saved views are K-lines

> "I once solved a similar problem. If I can get into that old state, I could probably
> handle this one the same way."

A named saved view — "budget review," "traffic debugging," "publishing pass" — is a
K-line: a stored attention mask (which windows, how much) that re-enacts a working state.
The memo's K-recursion principle ("new memories are composed mainly of ingredients from
earlier memories") says presets should **compose**: define "publishing pass" as a delta
over "editing," not from scratch. Preset inheritance is 1979 memory theory.

## Loops in the graph view

The graph has cycles; the pyramid is keyed by path, not node, so one object can be open in
several places at different scales without contradiction (transclusion done honestly).
When a view follows a cycle, recurse with a shrink factor and stop after a few laps: the
truncated spiral is the *notation* for recursion — legible to the user, and to an LLM
reading the serialized view, as "this repeats." Fish-eye decay is the base case.

## Ensemble mapping summary

| Memo (1979) | Ensemble mechanism |
|---|---|
| P-pyramid | Per-user view tree over the workspace graph (tabs ≡ outline ≡ tree ≡ graph) |
| Attention weight 0..1 | Closed tab → fish-eye scale → front window |
| Cross-exclusion group | Tab stack; focused stack; active workspace; exclusive overlay set |
| Force one agent on | Pie-up on a tab: bring its window to the front |
| Built-in short-term memory | Z-order; MRU cycling |
| Disposition (Necker cube) | Workspace preset: pre-activated subset at chosen weights |
| Conflict → group drops out upward | Conflicting views escalate to parent view |
| K-line attachment | Save named view: store the attention mask |
| Level-band restore | Reopen structure; keep focus and live data current; periphery weak |
| Weak fringes = frame defaults | Low-weight restored windows yield to present needs |
| Facilitation signal | AttentionService / LLM biasing overview-vs-detail band |
| K-recursion | Presets composed as deltas over presets |

## See also

- [PIE-TAB-WINDOWS](../notes/PIE-TAB-WINDOWS.md) — the ensemble specification this doc annotates
- [GATHERING](playable-pie-publishing-cauldron/GATHERING.md) — tabs ≡ outline ≡ tree ≡ graph; PSIBER techniques to mine
- [globe-city-navigation](globe-city-navigation.md) — fish-eye scale policy
- [four-dimensional-navigation-hci](four-dimensional-navigation-hci.md) — navigation lineage
- [moollm P-PYRAMID](https://github.com/SimHacker/moollm/blob/main/designs/P-PYRAMID.md) — the philosophy-side twin: K-lines, MOO-Maps, context windows as P-pyramids
