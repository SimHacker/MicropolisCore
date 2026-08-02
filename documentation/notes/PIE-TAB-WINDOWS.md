### PIE/TAB/Windows Design Notes

This document defines the user interface model for Micropolis windows, tabs, and pie menus, integrated with the informational markdown-driven website. The design targets desktop, laptop, tablet, mobile, and kiosk contexts, and anticipates an assistant-driven mode where an LLM can observe, advise, and operate tools alongside traditional mouse/keyboard/touch interaction.

### Goals
- Provide a flexible multi-window workspace that supports both tiling and overlapping windows.
- Allow tabs on any edge of a window, with stacking behavior such that all tabs remain visible when windows are co-located.
- Integrate chat (people + simulator + assistants) as the nexus of activity, with clickable simulator messages that navigate to relevant map locations.
- Support multiple map views and editor views with overlays for metrics (traffic, population, pollution, etc.) and live pinned views (e.g., following helicopter/monster/events).
- Ensure mobile friendliness via vertical scroll tiling and constrained controls; enable kiosk-friendly layouts and input.
- Use standard web layout primitives (flexbox for tiling, an overlay layer for floating windows). Avoid inventing new layout mechanisms.

### Non-Goals (initial phases)
- 3D UI or non-standard window physics.
- Novel layout engines beyond flexbox.
- Full LLM autonomy without permissioning/safety.

### Core Concepts
- Stack (layout): A HyperCard-inspired container at the leaves of the background flexbox tree. A Stack can reserve space along any edge(s) for tabs and contains zero or more Cards. It supports a fill-stack mode that minimizes margins and hides tabs.
- Card: A panel within a Stack that contains components (sub-containers, TileView/MapTile views, widgets, etc.). Cards are represented by tabs mounted on the Stack’s edges.
- Tab: A labeled handle attached to any Stack edge. Tabs activate Cards, support reordering within the Stack, grouping/selection, and context (pie menu) invocation without raising overlay content.
- Float (overlay Stack): A Stack living in the overlay layer that can overlap others. Cards can be pulled out of a background Stack to form or join an overlay Stack, and returned later; tabs accompany Cards wherever they live.
- View: A viewport rendering map tiles and overlays. Two main types: Editor View (editable) and Map View (read-only dashboards and overlay navigators). Both use the same MapTile renderer and overlay system.
- Overlay: A visual layer displaying metrics or annotations (e.g., traffic density). Overlays may be enabled per-view and composed.
- Pie Menu: A radial, mode-less command menu with hierarchical slices. Invoked from stack tabs, within views, and other interface elements.
- Chat/LLM Nexus: A scrolling, persistent conversation stream containing multiplayer chat, simulator messages, and assistant interactions. Simulator messages are actionable (click to zoom/center relevant views). Assistants can propose or execute commands subject to permissioning.

### Interaction Model
- Create Stack/Card: Users create new Stacks (layout containers) or new Cards within an existing Stack via menus, pie menus, or chat commands. New Stacks appear in the background layout tree or as floating Stacks in the overlay.
- Move/Resize: Floating Stacks move/resize freely with handles on edges/corners. Background Stacks respect the flex container’s axis constraints and available space. Layout may constrain certain moves.
- Snapping & Grouping: Dragging offers snap positions (dock a Stack as a sibling in the layout tree, insert a Card into a target Stack, or pull a Card out to form/join an overlay Stack). Inserting merges tab rows appropriately.
- Tabs on Any Edge: Each Stack can expose tabs on any edge. When multiple Cards are present, all tabs are laid out consecutively along the selected edge(s), always visible and non-overlapping.
- Focus & Context: Clicking a tab focuses that Card within the Stack. Opening a tab’s pie menu does not raise overlay content unless a command requires focus.
- Editors vs Map Views: Editor Cards permit drawing and editing; Map Cards are read-only dashboards. The heads-up minimap is a Map Card with draggable rectangles representing editor views; dragging a rectangle pans the associated editor.
- Live Pinned Views: A view can be pinned to an entity or event (e.g., helicopter, disaster). The info Card shows the latest simulator message and, when available, an adjacent live preview.
- Overlays: Views can toggle overlays such as traffic, power, crime, population, pollution, growth, land value. Multiple overlays may be composited with legends.
- Commands: Commands are invokable via pie menus, traditional tool palettes, keyboard shortcuts, touch gestures, and chat slash-commands.

- Background Layout Tree: A nested flexbox tree defines regions. Leaves are Stacks (layout containers) that can contain zero or more Cards and reserve edge space for tabs; gutters are resizable; orientation (row/column) is configurable.
- Overlay Layer: An absolute-positioned layer above the background that holds floating Stacks. This layer receives pointer events for floats without blocking background interactions.
- Mixed Mode: A workspace can contain both background Stacks and floating Stacks simultaneously. Stacks and Cards can migrate between layers by detach/attach gestures or commands. Fill-stack mode hides tabs/margins to maximize content.
- Mobile Narrow Screens: The background transforms into a primarily vertical flex layout with collapsible stacks. Tabs adapt to space constraints (scrollable tab lists, condensed tab affordances). Floating windows minimize or convert to full-screen sheets. Pie menus remain primary for command invocation.
- Kiosk Mode: Presents a curated layout with limited window management affordances, large touch targets, and constrained navigation to a set of tasks.

### Accessibility & Input
- Keyboard: Full navigation of tabs, stacks, window focus, and pie menu activation; shortcuts for common commands; escape routes from modes.
- Touch/Pointer: Gestures for pan/zoom, tap/long-press to invoke pie menus, two-finger gestures for overlay toggles (optional), and robust hit targets.
- Screen Readers: Semantic structure for tabs, lists, messages, and controls. Announcements for simulator messages and assistant actions.
- High Contrast & Scaling: UI respects platform contrast settings and scaling; provide internal scaling controls.

### Data & State (conceptual)
- Window: identity, title, role (editor/map/info/chat/settings), mode (tiled/float), geometry (position/size), tab edges, stack membership, z-order (if floating), constraints (if tiled).
- Stack: identity, footprint, active window, tab layout metadata, membership ordering.
- View: identity, camera (center, zoom), editability, overlays enabled, pinned entity/event (optional).
- Chat Message: identity, author (user/simulator/assistant), timestamp, text, related location(s), related entity/event, actionable flag.
- Pie Menu: identity, context (window/view/tab), slices, hierarchical relationships, permissions.
- Persistence: serialize/restore workspace layouts, open windows, views, overlays, and chat state; shareable presets for kiosk and tutorials.

### Chat and LLM Integration
- Conversation Stream: Unified message history of multiplayer chat, simulator notifications, and assistant interactions. Messages may contain references to locations, entities, and views.
- Clickable Simulator Messages: Selecting a message focuses and re-centers an appropriate view and optionally opens an info window or live preview.
- Tools & Permissions: Assistants invoke tools representing simulator actions (build, zone, budget, policies). Actions are mediated by a permission layer with user approvals, rate limits, and undo.
- Observation: Assistants receive structured summaries of the current city state, recent events, and active overlays, at controlled cadence and scope.
- Slash Commands: Users can enter commands in chat to manage windows, switch overlays, summon views, or control the simulator.

#### Workspace Presets, Roles, and LLM Orchestration
- Role Presets: Shareable, versioned presets that open named Stacks/Cards with layout, tab edges, and focus.
  - Student: Editor + MiniMap + Notes/Journal + Reverse Diagram (Simulate) + Chat.
  - Educator: Scenario dashboard + Reverse Diagrams (Map Data Flow/Map Scan) + Chalk overlay + Presenter Notes.
  - Researcher: Multi‑overlay views + parameter panels + graphs + logging.
  - City Planner: Editor tools + demand gauges + evaluation + policy Cards.
  - Streamer: Clean content view + compact chat/alerts + scene switcher.
  - Kiosk: Locked preset with limited controls, large targets, idle attractor.
- LLM Layout Composer: Natural language requests ("build a traffic study station") spawn composed workspaces (traffic overlays, Make Traffic diagram, recorder, notes), with previews before applying changes.
- Macro & Mash‑Ups: Save applied compositions as named macros; assistants can recall and adapt them to new contexts (different cities, scenarios).
- Safety & Control: Presets are declarative (no code), auditable, and reversible; a global reset returns to canonical layouts.

### Pie Menus (design principles)
- Fast, directional muscle-memory interactions; consistent radial placements for common actions.
- Hierarchical slices for deeper commands; breadcrumb feedback.
- Invocation contexts: on stack tabs (stack/card management and tab-specific commands), in views (tools/overlays/navigation), global workspace (layout and system actions).
- Touch-friendly sizes, with live tracking feedback, sticky selection, and tolerance for movement.

### Performance Considerations
- View Rendering: Only repaint visible windows and views; throttle and batch updates; offscreen culling for large maps.
- Animations: Align to animation frames; avoid layout thrash; use transforms where appropriate.
- Overlays: Precompute or stream metrics; cache tiles and legends.
- Chat: Virtualized list rendering for long histories.

### SvelteKit Component Architecture (proposed, no code)
- AppShell: Top-level site shell integrating content pages and the workspace.
- WorkspaceBackground: Manages the flexbox layout tree and tiled windows.
- OverlayLayer: Hosts floating windows and related hit-testing.
- WindowFrame: Chrome for windows (title, borders, resize handles, tab mounts).
- WindowTabBar: Edge-attached tab bar with stack-aware layout.
- TileContainer: Flex node container with resizable gutters.
- ViewCanvas: Tile renderer and overlay compositor; used by both Editor and Map views.
- MiniMap: Heads-up map with draggable rectangles representing editor views.
- ToolPalette: Traditional tool palette for editors.
- OverlayLegend: Display of active overlays and legends.
- ChatDock: Chat window with message list, input, and actionable links to locations.
- PieMenuLayer: Global layer that renders pie menus by context.
- InfoWindow: Shows latest simulator message and optional live view.
- StatusBar: Global status indicators (budget, time, disasters).
- SettingsPanel: Preferences for layout, accessibility, and performance.

### State Stores & Services (proposed, no code)
- LayoutStore: Background tree, tile splits, and persistence.
- WindowStore: Window identities, geometry, z-order, stacks, and tab edges.
- ViewStore: Camera state, overlays, pinned entities/events.
- ChatStore: Messages, threads, filters, actionable links.
- LLMStore: Assistant session state, permissions, and proposals.
- OverlayStore: Enabled overlays, palette, legends.
- CommandBus: Central command dispatch and undo/redo.
- SimulatorBridge: Bidirectional messaging with the simulator engine (events, actions, snapshots).
- PersistenceService: Save/restore workspace and sessions.

### Phased Milestones
- M0 Workspace Core: Background flex layout, overlay layer, basic floating window with single-edge tabs, persistence scaffold.
- M1 Views v1: Editor view with pan/zoom/draw; MiniMap with draggable view rectangles; basic overlays (on/off).
- M2 Stacks & Tabs: Multi-window stacks with non-overlapping tab rows on any edge; snap/dock behaviors.
- M3 Pie Menus v1: Global and tab-context menus for window management and basic editor commands.
- M4 Chat Nexus v1: Unified chat with simulator messages; clickable messages recenter views.
- M5 Mobile Adaptation: Vertical tiling, condensed tabs, sheet-mode floating windows; touch-first pie menus.
- M6 Live Views: Pin views to entities/events; info window integrates last message with live preview.
- M7 Accessibility: Keyboard navigation, ARIA labeling, high-contrast modes, scalable UI.
- M8 Persistence & Presets: Save/restore layouts; shareable kiosk/tutorial presets.
- M9 Performance & Polish: Culling, batching, caching; latency and memory optimizations.

### Risks & Open Questions
- Complexity of stack/tab layout across all edges and mixed tile/float contexts.
- Balancing discoverability of pie menus with traditional tool palettes.
- Assistant permissioning UX and safe tool invocation.
- Synchronizing multiple views under heavy simulation update rates.
- Persistence migrations across versions of the layout schema.

### Glossary
- Stack (layout): A HyperCard-inspired container at the leaves of the background layout tree; can reserve edge space for tabs; contains zero or more Cards; may live in background or overlay layers.
- Card: A panel within a Stack containing components (views/widgets); represented by a tab on the Stack’s edge(s).
- Float (overlay Stack): A Stack in the overlay layer that can overlap others.
- MapTile: The simulator’s 16×16 graphical map tile concept used by the renderer and overlays (distinct from layout terminology).
- Overlay: Visualization layer atop the MapTile renderer showing metrics/annotations.
- Pie Menu: Radial menu for fast, spatially consistent command invocation.
- Chat Nexus: Combined chat/simulator/assistant activity stream with actionable messages.

### Enrichment Addendum: Rationale, Lineage, and Detailed Design

This addendum deepens the intent and explains why the design choices align with long-term goals rooted in direct manipulation, constructionist learning, and decades of practical UI research and craft (HyperTIES, NeWS/HyperLook, SimCity, The Sims).

#### Design Rationale and Lineage
- Direct Manipulation (Shneiderman): Favor visible objects, physical actions over syntax, rapid incremental reversible operations, and immediate feedback. This improves learnability, reduces errors, and builds mastery.
- Explorable Explanations (Bret Victor): Show dynamic state continuously so users can think with the medium, not around it. Reveal cause-and-effect with tight visual coupling of action to result.
- Constructionism (Papert): Support learning-by-making. Expose mechanisms and provide tools for safe experiment, iteration, and reflection.
- Maxis Tradition (Will Wright): The UI’s true product is the user’s mental model. Keep numbers out of the user’s face; visualize relationships; enable playful exploration and storytelling.
- Empirical Foundations (HCIL): Pie menus and dynamic queries are validated to be fast, precise, and reliable. Design to leverage spatial memory and shorten visual search.
- Historic Tools: HyperTIES (embedded, contextual menus and previews), NeWS/HyperLook (composable, scriptable, direct-manipulation UI), and The Sims (contextual radial menus) inform embedded controls, tab behavior, and object-centric workflows.
- Building SimCity (Chaim Gingold): The book and its [reverse diagrams](/pages/reverse-diagrams) are the scholarly foundation for opening the simulator’s "black box." Chaim has given explicit permission to bring those diagrams to life as interactive first‑class Cards (Bret Victor–inspired, as the reverse-diagram notes explain). See [Chaim Gingold](/pages/about/chaim-gingold) · [*Building SimCity*](/pages/building-simcity).

#### Why a Desktop‑Class Windowing Workspace (Web)
- Multiple Concurrent Surfaces: Modern Micropolis requires many live surfaces (editors, minimaps, overlays, chat, notices, graphs, reverse diagrams, info panels). A desktop‑class workspace lets users arrange and compare them side‑by‑side.
- Cross‑Platform Adaptation: Stacks/Cards unify background tiling with overlay floats; tabs on any edge scale to widescreen, tablets, phones, and kiosk. Fill‑stack, collapsible tabs, and sheet‑mode floats adapt to narrow screens.
- Fast Command Access: Pie menus reduce visual search, work well on touch and pen, and keep muscle memory stable across platforms.
- Roles and Tasks: Shareable presets (perspectives) align tools to goals (student, educator, researcher, planner, streamer, kiosk) without sacrificing customization.
- LLM Orchestration: An assistant can open/arrange Cards, wire live diagrams to sim parameters, and create mash‑ups for specific analyses while preserving user agency via explain‑then‑do.

#### Will Wright–Inspired Principles (Simulation, Game, Interface, User Model)
- Mental Model as Product: Treat the computer model as a compiler for the player’s mental model. The UI must surface relationships, not raw internals; [interactive reverse diagrams](/pages/reverse-diagrams) (Chaim Gingold / *Building SimCity*, Bret Victor–inspired liveness) serve this by exposing causal structure without breaking the illusion.
- Implication over Simulation: Favor readable signals over exhaustive internals. Overlays, messages, and animations should imply causes (power, traffic, crime) with clarity; details are revealed on demand in tweakable diagrams.
- Toys before Goals: Support open-ended play where users set goals (toy first), with optional scenarios/challenges layered on top. Stacks/Cards enable multiple concurrent “toys” (views, tools, overlays) in one workspace.
- Failure Modes and Undo: Make failure interesting and recoverable. Provide granular undo/redo via CommandBus; allow safe destructive tools (the “Calvin Syndrome”) with previews and reversible actions.
- Information Density and Zoom: Integrate local/global views in one place via Cards and zoom, with filters/legends instead of modal reports. Avoid clutter; prefer progressive details on interaction.
- Storytelling and Personal Imprint: Encourage labeling/signs, annotations, and chat-linked stories. Cards for Notes/Journal integrate with Chat Nexus; messages link back to views and entities.
- Scenarios and Disasters: Offer curated layouts and timed challenges as optional Cards (e.g., emergency dashboards), keeping the base system open-ended.
- Hobby/Modding Lineage: Design components to be extensible (Stacks/Cards, Pie Menus, Overlays), and aim toward visual behavior editing aligning with HyperLook's HyperCard-inspired approach and The Sims’ object-centric approach.

#### Window Management Principles
- Keep objects visible and manipulable; avoid hidden global modes. Operations are reversible and low-risk.
- Provide all management via tab contexts, global menus, keyboard shortcuts, and chat commands for redundancy and accessibility.
- Operations: create, close, focus, rename, duplicate, detach/attach (tile ↔ float), stack/unstack, group/ungroup, save/recall layouts.
- Stacks: Co-locate related windows without hiding tabs. Activate within the stack without losing spatial context.
- Snapping: Dock to edges to tile; snap atop to join a stack; insert into gutters to refine splits. Always preview the outcome before commit.
- Constraints: Tiled windows respect container splits; floating windows respect workspace bounds; stacks inherit tab-edge and density policies.

#### Tiling, Overlapping, and Mixed-Mode Stacks
- Tiling: Nested flex layout with resizable gutters. Orientation communicates reading/scanning (row/column). Preserve proportions across resizes. Allow locked tiles for kiosk/tutorial.
- Overlapping: Floating windows rise in an overlay layer with shadows/translucency to signal elevation. Avoid occluding critical HUD elements by policy.
- Mixed-Mode: Allow quick toggling between background and overlay Stacks while preserving stack identity and tab continuity.
- Stack Fan/Compact: Stacks can be fanned, reordered, and compacted. Tabs serve as the manipulable handles for spread/re‑stack gestures.
- Stacks as Cross-Exclusion Groups: A stack is a radio-button group (Minsky, K-Lines memo, 1979) — one member front, raising it inhibits (occludes) its associates; pie-up on any tab is the force-to-on that re-sets the group; z-order is the group's built-in short-term memory. Full mapping: [p-pyramid-attention-overlay](../designs/p-pyramid-attention-overlay.md).

#### Tabs and Tree-Style Tabs
- Edge-Agnostic Tabs: Mount tabs on any window edge. In stacks, tab rows merge and never overlap; they scroll/condense as needed.
- Semantic Tabs: Tabs are handles and portals for context: management (close/move/duplicate), navigation (focus/peek), and pie menus (without necessarily raising the window).
- Tree-Style Tabs: Organize windows hierarchically into expandable/collapsible trees. Parents summarize descendants with badges (counts, activity). Drag-and-drop supports reparenting and reordering; keyboard navigation mirrors tree structure.
- Tab States: Active, attention, pinned, muted, shared. Visual states communicate urgency without stealing focus.

#### Pie Menus: Best Practices and Use Cases
- Rationale: Empirically faster and less error-prone than linear menus in many contexts; resilient to cursor drift; ideal for touch/stylus. Spatially stable slices build muscle memory.
- Applications: Editor tools, overlay toggles, view presets, window management, chat actions. Provide parallel access via palettes and shortcuts.
- Etiquette: Keep radial depth shallow; place destructive actions in guarded locations with confirmation; surface recently used commands.
- Contexts: Tabs (management and tab-specific actions), views (tools/overlays/navigation), and global workspace (layout/system actions).

#### HyperCard, HyperTIES, NeWS, HyperLook
- HyperCard: Card/stack metaphors inspire approachable composability. Piles/stacks adopt visible structure and simple navigation.
- HyperTIES: Embedded menus and previews motivate actionable messages and in-situ controls linked from content.
- NeWS/HyperLook: Composable, scriptable, direct-manipulation objects inform window-as-object semantics, extensible chrome, and assistant integrations.
- Lessons: Prefer embedded contextual affordances; visible structure; immediate previews; authorable behaviors that maintain legibility.

#### Interactive Reverse Diagrams as First‑Class Cards

**Credit — Chaim Gingold, *Building SimCity*.** The static reverse diagrams are Chaim’s work for [*Building SimCity: How to Put the World in a Machine*](/pages/building-simcity) (MIT Press, 2024) — see the [Reverse Diagrams](/pages/reverse-diagrams) page and [Chaim Gingold](/pages/about/chaim-gingold). With **Chaim’s explicit permission and encouragement**, Micropolis brings those diagrams further as live, tweakable first‑class Cards. The interaction model is inspired by [Bret Victor](/pages/about/bret-victor) (explorable explanations / immediate connection to the medium), as the notes on the reverse diagrams already explain. Credit Chaim whenever these Cards appear on stream, in UI chrome, or in docs.

- Live State: Diagrams (Simulation Loop, Map Data Flow, Maps, Map Scan, Make Traffic) attach to sim snapshots and update in sync with time.
- Tweak & Learn: Parameter controls (e.g., smoothing kernels, path search depth) live on the diagram Card; changes preview their effects in linked views before committing.
- Linked Selection: Selecting a node highlights affected tiles/overlays in Editor/Map Cards; stepping the loop updates visible changes.
- Presets & Reset: Provide canonical defaults, safe ranges, and quick reset; align with educator and researcher presets.
- Attribution: Card chrome and educator presets name Chaim / *Building SimCity*; deep link to [/pages/reverse-diagrams](/pages/reverse-diagrams) for the static originals and provenance.

#### Edge Tabs, Widescreen Rationale, and Label Legibility
- Widescreen Bias: On modern displays, lateral space is less scarce than vertical space. Favor left/right tab placement by default when tab counts rise, to preserve vertical room for content.
- No Rotated Text: Avoid rotated tab labels. Use vertical stacking of horizontal labels, icons, or condensed title + tooltip/peek to maintain readability and accessibility. Scrolling/accordion patterns keep labels readable.
- Per-Edge Placement: Users can drag tabs to any edge and adjust their proportional position along that edge. Allow different edges per window to match task needs (e.g., many code tabs on right, a few terminal tabs on bottom).

#### Snap‑Dragging, Stack Rails, and Pop‑Off Behavior
- Stack Rails: When windows are stacked/piled, tabs can act as “rail-constrained” handles. Dragging along the rail reorders within the pile; pulling away beyond a threshold pops a window off the pile; dropping snaps it back at any depth.
- Direct Manipulation: Provide preview ghosts and insertion indicators while sliding on the rail. Keep interactions reversible; a quick “flick off” detaches; a close drop target reattaches.
- Mixed Mode Rails: Rails operate both for tiled and floating piles. Preserve footprint metadata so popped windows can rejoin their prior pile predictably.
- Typed Rails (below): stacking rails are one *kind* of docking surface; windows may expose several typed rails that accept different tab attachments.

#### Tabs as Proxies (Compact Surfaces, Pies, Drag Sources/Destinations)
- Compact Representation: A tab is a live, compact face of its Card — title, icon, badges, optional mini-preview — whether the window is on-screen, iconified, or off-screen (other workspace, other monitor metaphor, minimized sheet).
- Pie Menus on Tabs: Invoke management and content pies without raising the window; directional slices send to destinations (HyperTIES “click then gesture”).
- Drag Sources: Drag a tab to reorder on a rail, detach into a float, dock onto a typed rail of another window, or drop onto a compatible socket (patch-cord style — see Tab Linking).
- Drag Destinations: Tabs and rails accept drops of other tabs, links, messages, overlay refs, reverse-diagram nodes, or command streams — typed compatibility decides accept vs reject with preview.
- On-Screen / Off-Screen: Off-screen windows remain first-class via their tabs (edge strip, dock, or Swiss-army fold-out). Raising is optional; linking and commanding do not require visibility.
- Attention Without Theft: Badges and ambient motion signal activity; never steal focus for routine updates.

#### Typed Tab Docking Surfaces (Rails of Different Kinds)
- Edge Rails Are Typed: A window may expose multiple docking surfaces along (and beyond) its edges. Each rail declares what kinds of tab attachments it accepts — e.g. `stack` (sibling Cards), `view-link` (camera/overlay peer), `dataflow` (patch cord), `controlflow`, `schema`, `chat-pin`, `diagram-node`.
- Compatibility Preview: Dragging a tab over a rail shows accept/reject and a ghost of the resulting topology before commit.
- Multiple Parallel Networks: The same Card can wear several tabs — or one tab with several sockets — participating in different networks at once (data flow, control flow, functional/closure flow, schema wiring) without collapsing them into one spaghetti graph.
- Lineage: Paul Haeberli’s [ConMan](https://people.cs.vt.edu/~north/infoviz/conman.pdf) (SIGGRAPH ’88); Max/MSP / Pure Data patch cords; Blender node editors; federation notes in [brad-myers-visual-programming-hn.md](../designs/brad-myers-visual-programming-hn.md) and [command-path-collaboration-modes.md](../designs/command-path-collaboration-modes.md).

#### Polyfaceted Surfaces (Beyond Four Edges)
- Four edges are a floor, not a ceiling. A window can fold out additional attachment rails / dimensions — Swiss-army-knife facets — for dense wiring without crowding the content face.
- Fold-Out Rails: Extra rails reveal on demand (gesture, pie slice, or assistant layout) and tuck away; they are first-class docking geometry, not modal dialogs.
- Facet Types: Spatial facets (N/E/S/W + diagonals), semantic facets (data / control / function / schema / story), and role facets (educator chalk, streamer clean, kiosk locked).
- Progressive Disclosure: Novices see four stack edges; power users unfold ConMan/Max/Blender-grade surfaces; always reversible.

#### Tab Linking and Multi-Network Visual Programming
Tabs can be **linked to other tabs** the way ConMan / Max/MSP / Blender nodes wire ports — not only as window-management handles.

- Patch-Cord Semantics: A link is typed (data, control, functional, schema, …). Visual style and rail type encode the network; one Card may sit in several networks simultaneously.
- Blender Geometry Nodes Lesson: Effectively pass around **closures**; control flow can “pop upstream” into functions passed in — confusing at first, brilliant once internalized. Federation Cards should allow the same: a functional-flow rail carries callable/continuation-shaped values; control-flow edges may target upstream sockets when the payload is a higher-order function.
- Snap! Answers (Differently): [Snap!](https://snap.berkeley.edu/) (first-class procedures, continuations, metaprogramming, the Y combinator) answers the same VPL questions with blocks instead of patch cords. Micropolis should speak both dialects — node rails *and* Snap! blocks — generating the same [command streams](../designs/command-path-collaboration-modes.md).
- Open VPL Representation Questions (design space, not settled):
  | Concept | Candidate surface |
  |---|---|
  | Functions / lambdas | Functional-flow rails; Snap! rings/blocks; pie-slice “apply” |
  | Closures | Captured environment badges on a tab; Geometry-Nodes-style upstream pop |
  | Scopes | Nested Cards / stack trees; schema rails that bound names |
  | Continuations / control flow | Control-flow network distinct from data-flow; resume sockets on tabs |
  | Macros / metaprogramming | Schema + quote/unquote rails; Snap! `call` / `run` / custom blocks |
  | Data vs schema | Parallel networks — instance values on data rails, types/shapes on schema rails |
  | Mixed widgets in pies | Overflow / Blender-style pie contents — [pie-menu-patent-fud.md](../designs/pie-menu-patent-fud.md) |

#### Directional Pie Menus for Destinations
- Two-Panel Destinations: Use directional slices to target destination panes (e.g., send link to left/right/top/bottom panel), echoing the HyperTIES approach of “click then directional gesture.”
- Spatial Mnemonics: Map common window actions to canonical directions (raise/front/back, tile/floating, send-to-edge) to build muscle memory and speed without visual search.
- Typed Destinations: Pie slices can target a *rail type* (dock to dataflow facet, pin to chat, wire schema) as well as a spatial pane.

#### Customizability Over Standardization
- Anti-Monoculture: Do not lock tabs to the top edge or menus to vertical lists. Encourage per-window/per-workspace customization with sensible defaults and sharable presets.
- Progressive Disclosure: Keep default configurations simple; unlock deeper customization as users advance. Always preserve reversibility and clear recovery paths.

#### Accessibility and Input Refinements
- Labels: Keep tab labels horizontally oriented; provide tooltips, truncation with middle-ellipsis, and keyboard-accessible label reading.
- Keyboard and Touch: Long-press to invoke pie menus; drag with axis constraints; provide keyboard equivalents for snap/pop, reordering, and destination targeting.

#### Terminology
- Stack Rail (Spike): A visual/interaction affordance representing a stack’s ordering axis. Tabs slide along the rail to reorder; crossing a threshold pops windows off/on the pile.
- Typed Rail: A docking surface that accepts only compatible tab attachments (stack, dataflow, controlflow, functional, schema, …).
- Facet: A fold-out attachment dimension beyond the four window edges (Swiss-army polyfaceted chrome).
- Tab Link / Patch Cord: A typed connection between tabs (or tab sockets), ConMan / Max / Blender lineage.
- Compact Tab Face: The on-rail representation of a Card used for pies, DnD, and off-screen presence.
- P-Pyramid: A user's (or assistant's) hierarchical view over the workspace graph — an anchored attention mask, 0 = closed tab, 1 = front window, fractional = fish-eye scale (Minsky, AI Memo 516, 1979). See [p-pyramid-attention-overlay](../designs/p-pyramid-attention-overlay.md).
- Cross-Exclusion Group: Minsky's radio-button substructure; here, any set where raising one member suppresses the rest (tab stacks, focused stack, active workspace, exclusive overlays).

#### LLM-Driven Collaboration: Rationale and Guardrails
- Role: Assistant as a skilled collaborator that observes, proposes, previews, and acts—subject to scope and permission—without usurping user agency.
- Explain-Then-Do: Assistants predict outcomes, highlight affected views/areas, and request approval. All actions are reversible and logged in chat.
- Multimodal: Assistants can open/arrange windows, pin live views, annotate overlays, and summarize activity; links jump to relevant context.
- Safety: Scope, rate limits, sandboxes, and explicit permissions; transparent logs and undo build trust.

#### Component and State Enrichment (conceptual)
- Add TreeTabs: A hierarchical tab presenter that mirrors window grouping and supports any-edge mounting.
- Add AttentionService: Aggregates activity to drive subtle attention states (badges, glow) without disruptive focus stealing.

#### Milestone Extensions
- M10: Tree-Style Tabs—hierarchical grouping, collapse/expand, badges, keyboard/drag.
- M11: Piles—fan/spread/re-stack interactions; footprint-preserving mixed-mode groups.
- M12: Assistant Workflows—explain-then-do previews; scoped permissions integrated with undo.
- M13: Stack Rails & Pop‑Off—rail-constrained reordering, pop-off thresholds, insertion indicators.
- M14: Directional Destinations—pie-menu gestures to choose pane destination and send/clone window.
- M15: Typed Rails—compatibility rules, accept/reject preview, multi-rail window chrome.
- M16: Tab Linking—ConMan/Max/Blender-style cords; parallel data/control/functional/schema networks.
- M17: Polyfaceted Fold-Outs—Swiss-army extra rails; Snap! ↔ node dual dialect for the same command streams.
- M18: Higher-Order Flow—Geometry-Nodes-style closures / upstream control-flow; Snap! first-class procedures as the block answer.

#### Risks and Open Questions (extended)
- Tree-Style Tabs Cognitive Load: Ensure hierarchies aid navigation; rely on strong defaults and progressive disclosure.
- Piles UX: Design spread/fan gestures that feel natural on mouse and touch without accidental activation.
- Attention Signaling: Avoid notification overload; prefer ambient signals over disruptive modals.
- Label Legibility: Maintain readable horizontal labels on vertical stacks; avoid rotated text; define overflow and tooltip policies.
- Typed-Rail Complexity: Defaults must stay simple; facet unfold is progressive. Reject spaghetti by separating network types visually.
- VPL Dual Dialect: Keep node-rail and Snap! block surfaces generating one command path — no second hidden runtime.

