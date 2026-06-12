# Content plugins & nav auto-discovery

> **Status:** Convention established; metadata authored by hand. The validating /
> generating **pipeline is not built yet** — for now `apps/micropolis/src/lib/data/siteStructure.json`
> remains the working registry (the "simulation"). This doc defines the **contract**
> that future auto-discovery will read, so content authored today already conforms.
>
> **Goal:** Adding new content is **drop-in and self-declaring**. You create a
> directory, drop in a `README.md` whose frontmatter declares its own title and nav
> placement, and it appears in the site — **no central registry edit**.
>
> **Companions:** [virtual-cursor-layer.md](virtual-cursor-layer.md),
> MOOLLM `MOOPMAP` (multi-resolution), `PROTOTYPE-FRAGMENT-CONFIG.md` (moollm).

---

## 1. A content item is a *plugin directory*

Every content item is a **directory** containing MOO-style **interface files**. The
plugin's **directory name is its slug**.

```
will-wright/         ← slug: will-wright   (the plugin's identity)
├── README.md        ← the page (prose + self-declaring frontmatter)   [REQUIRED]
├── CARD.yml         ← collectible "trading card" projection            [optional]
├── CHARACTER.yml    ← representational-character metadata + ethics      [optional]
├── GLANCE.md        ← one-line resolution                              [optional]
├── DESCRIPTION.md   ← short paragraph resolution                       [optional]
├── STONE.md         ← one-page design                                  [optional]
├── COMMAND.yml      ← commands this item exposes (pie menu / palette)  [optional]
├── SIMULATION.yml   ← embedded sim / interactive view declaration      [optional]
└── …                ← images, data, sub-plugin directories
```

- **Only `README.md` is required.** Everything else is an optional *interface* the
  rest of the system can discover and use (cards, command palette, embeds…).
- The content root for this app is `apps/micropolis/website/pages/`. Federated sites
  (donhopkins.com, …) use the same convention rooted at their own content dir.

### Slug vs. path — identity vs. placement

Two different things, often confused:

| Term | What | Shape | Owner |
|------|------|-------|-------|
| **slug** | the plugin's **federation-global identity** | a single lowercase-dashed **token** = its directory name (`marvin-minsky`) — globally unique | the **content** (SSOT) |
| **path** | **where it lives** in a site's tree | a `/`-prefixed **sequence of slugs** (`/about/constructionist-education/marvin-minsky`) | the **site map** (content may declare a *default*) |

- A **slug** is like a filename without a suffix: `will-wright`, `about`, `stone-librande`. **Not** a path; no slashes.
- A **path** is slugs joined by `/`, **`/`-prefixed and site-top-relative** when fully spelled out (`/about/will-wright`). (Relative path fragments may still appear in links, but a full placement path is absolute from site top.)
- **Identity ≠ placement.** `marvin-minsky` (slug) is the same fact everywhere; *where* it appears (`/about/constructionist-education/marvin-minsky` here, maybe `/people/minsky` elsewhere) is a **per-site arrangement**.

### Two layers: SSOT content vs. site map

- **SSOT content** (the plugin) declares its **slug** (identity) and may declare a
  **default `path`** ("where I'd like to live"). It does **not** own any site's tree.
- **A site** arranges chosen plugins into its **menu tree** using **its own map**,
  hand-placing content into a path structure *for that site* — and may **override**
  the content's default path. For Micropolis today that map is the hand-written
  `src/lib/data/siteStructure.json`, and the directory layout under `website/pages/`
  **is** Micropolis's hand-placed path tree. (Later: the site map is generated from
  self-discovery; multiple sites can re-map the same global slugs.)
- **Right now there is one publisher** (the Micropolis site). So a plugin's declared
  default `path` and Micropolis's placement coincide — but they are conceptually
  separate, and the *site* is the one responsible for the menu tree.

### Interface files (the MOO "verbs/properties" of a content object)

| File | Role | Resolution tier |
|------|------|-----------------|
| `GLANCE.md` | one line | glance |
| `CARD.yml` / `CARD.md` | trading-card projection (title, abilities, quotes) | card |
| `DESCRIPTION.md` | short paragraph | summary |
| `STONE.md` | **one-page design** — relationships made the star (named for Stone Librande) | stone |
| `README.md` | the canonical page (**required**) | readme |
| `CHARACTER.yml` | who this represents + representation ethics (for real people) | — |
| `COMMAND.yml` | commands/actions this item exposes (pie menu, palette, CLI) | — |
| `SIMULATION.yml` | an embedded interactive/sim view to mount in the page | — |

These mirror the resolution ladder in MOOLLM's MOOPMAP (`GLANCE → CARD → DESCRIPTION
→ STONE → README → directory → implementation`). The DonHopkins `characters/<name>/`
dirs are the upstream authoring source; the page dirs here are projections of them.

> **`STONE` — the one-page rung — is itself a seed-by-example.** Its prototype lives
> at `DonHopkins/characters/stone-librande/STONE.md`: a file that *is* a quintessential
> one-page design (about Stone Librande) **and** the prototype every other `STONE.md`
> clones (`parents:`). The skill is defined by that concrete instance, not an abstract
> class — see MOOLLM `skills/prototype/`.

---

## 2. `README.md` frontmatter — self-declaring identity, placement & nav

The page declares its **identity** (`slug`), its **default placement** (`path`), and
**nav hints**. **Derived by default, override only when needed.**

```yaml
---
title: Marvin Minsky                        # display label                       [REQUIRED]
slug: marvin-minsky                         # federation-global identity (token)  [default: directory name]
path: /about/constructionist-education/marvin-minsky   # default site placement   [default: derived; site map may override]
header: "Marvin Minsky: AI & Society of Mind"          # page <h1> + <title>       [default: title]
description: "🤖 AI founding father…"        # subtitle + <meta>                   [optional]
nav:
  parent: constructionist-education   # parent's SLUG; omit/"" = top-level         [default: parent dir's slug from path]
  order: 30               # sort weight within the parent (ascending)              [default: 1000 then title]
  tooltip: "…"            # hover tooltip in nav                                    [optional]
  showSubTabs: false      # render this node's children as a sub-tab row           [default: false]
  matchUrlPrefix: false   # treat as active for any URL under it                   [default: false]
  hidden: false           # hideFromNav (still built & linkable)                   [default: false]
  excludeFromAll: false   # omit from the /all single-page view                    [default: false]
  excludeFromRss: false   # omit from the RSS feed                                 [default: false]
---
```

### `slug` — identity (a token, = the directory name)

A **slug** is a single lowercase-dashed **token** (no slashes): `marvin-minsky`,
`will-wright`, `about`. It is the plugin's **federation-global identity** and equals
its **directory name**. **Declare it explicitly** so a copied directory is
self-describing; if `slug:` is **omitted, the loader uses the directory name**.

Keep the declared slug and the directory name **identical**, and **globally unique**.
The only reason they'd differ is disambiguating **overlapping names** with a suffix
(`-1`, `-2`, a version tag) — that collision policy is deferred; for now assume
everyone behaves coherently. **Easy authoring by copying an example wins.** The
pipeline's job is to **warn**, not to be clever:

- ⚠️ declared `slug` ≠ directory name (drift)
- ⚠️ two plugins share the **same global slug** (collision)
- ⚠️ a link/`path` references a slug that doesn't exist (broken link)

### `path` — placement (a `/`-prefixed sequence of slugs)

A **path** is slugs joined by `/`, **`/`-prefixed** and site-top-relative
(`/about/constructionist-education/marvin-minsky`). The content declares its
**default** path ("where I'd like to live"); **the site map owns the final tree** and
may override it. With one publisher today, the declared `path` == Micropolis's
hand-placed directory location == the `siteStructure.json` `url` (minus the `/pages`
serving prefix).

### Other derivation rules (what you DON'T have to write)

| Field | Default |
|-------|---------|
| `slug` | the plugin **directory name** (`marvin-minsky`) |
| `path` | derived from where the site places the dir (`/about/.../marvin-minsky`); a site map may override |
| `url` | `/pages` + `path` (Micropolis serves content under `/pages`) |
| `contentSlug` | `path` without the leading slash (resolves `website/pages/<…>/README.md`) |
| `nav.parent` | the **slug** of the node at the parent path (`/about/.../marvin-minsky` → `constructionist-education`) |
| `header` | `title` |
| children | every plugin the site map places directly under this node |

So the **minimum** to publish a new page under About is:

```yaml
---
title: Jane Doe
slug: jane-doe
path: /about/jane-doe
nav: { order: 35 }
---
```

…dropped at `website/pages/about/jane-doe/README.md`. It slots into the About
sub-tabs at order 35.

### Frontmatter → `SiteNode` mapping (for the future generator)

`title→title`, `header→header`, `description→description`, `nav.tooltip→tooltip`,
`nav.showSubTabs→showSubTabs`, `nav.matchUrlPrefix→matchUrlPrefix`,
`nav.hidden→hideFromNav`, `nav.excludeFromAll→excludeFromAll`,
`nav.excludeFromRss→excludeFromRss`. `url`/`contentSlug`/`children` are derived (§above).

---

## 3. The app shell (non-content nav) stays declared

Pages with **no markdown** — Home `/`, `/play/micropolis`, `/play/sims`, `/all`,
`/game`, and external links (GitHub, Patreon) — are not plugins. They live in a small
**shell** list. The future generator will **merge**: shell entries + auto-discovered
content nodes, then sort each level by `nav.order`.

Today that shell + the content nodes are all hand-written together in
`siteStructure.json`. The migration path:

1. **(now)** Author self-declaring frontmatter on every content `README.md` that
   exactly mirrors its current `siteStructure.json` node. ✅
2. Build a generator (script or Vite plugin) that scans the content root, reads
   frontmatter (`slug` identity + `path` placement + `nav` hints), and emits the
   content subtree for **this site's map**.
3. Shrink `siteStructure.json` to just the **shell** (app pages + ordering), and let
   the generator inject the content subtree — the site map placing global slugs at
   site paths (and free to override a plugin's default `path`).
4. (later) Promote discovery to a shared package so donhopkins.com and the federation
   reuse it.

Until step 2 lands, `siteStructure.json` is authoritative and the frontmatter is
**intentionally redundant** (WET) — but already correct, so the switch is mechanical.

---

## 4. Order values currently in use (so a generator reproduces today's nav)

**Top level** (content interleaved with shell): about `40`, building-simcity `50`,
reverse-diagrams `60`, micropolis-license `80`. (Shell: home `10`, play/micropolis
`20`, play/sims `30`, all `70`, game `90`, source `100`, patreon `110`.)

**About** children: will-wright `10`, don-hopkins `20`, chaim-gingold `30`,
bret-victor `40`, stone-librande `50`, ben-shneiderman `60`, richard-bartle `70`,
yoot-saito `80`, constructionist-education `90`.

**Constructionist Education** children: jean-piaget `10`, seymour-papert `20`,
marvin-minsky `30`, alan-kay `40`, doreen-nelson `50`.

---

## 5. Validation (future pipeline responsibilities)

- Required: `README.md` exists; `title` present.
- `nav.parent` (explicit or derived) must resolve to an existing plugin dir or root.
- Slugs unique; warn on duplicate `nav.order` within a parent (stable-sort fallback to title).
- Interface files parse (`*.yml` valid YAML); `SIMULATION.yml`/`COMMAND.yml` match their schemas.
- Cross-links resolve (extend the existing prerender link/anchor check).
