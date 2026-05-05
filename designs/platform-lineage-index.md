# Platform lineage & where the docs live

Micropolis has shipped through many stacks (workstations, X11, OLPC, Flash, Wasm). This index maps **era → artifact location** so historical write-ups stay findable without pretending every layer is still maintained code.

| Era / stack | What it was | Where to read |
|-------------|-------------|----------------|
| **NeWS**, PostScript UI | Unix workstation client | Essay intro in **`documentation/openlaszlo-micropolis/README.md`**; pie-menu history links from **`apps/micropolis/website/pages/about/don-hopkins.md`** |
| **X11 / Tcl-Tk** | Micropolis on workstations | Same; **`designs/collaborative-microworld-lineage.md`** (constructionist / multiplayer context) |
| **OLPC / Sugar**, GPL release | Educational fork, XO laptop | Jekyll pages **`apps/micropolis/website/pages/about/don-hopkins/olpc-simcity.md`**, **`building-simcity.md`**; external MOOLLM doc linked from root **`README.md`** (SimCity multiplayer & Micropolis) |
| **TurboGears + OpenLaszlo + Flash** | Web client/server (AMF) | **Frozen snapshot:** **`documentation/openlaszlo-micropolis/`** (`*.lzx`, **`resources/`**, **`TODO.txt`**, **`NOTES.txt`**) |
| **Wasm + SvelteKit** | Current MicropolisCore app | **`apps/micropolis/`**, **`designs/wasm-bridge-and-testing-trajectory.md`** |

## Designs ↔ documentation

- **`designs/`** — *intent*: what we are building next and why (bridges, commands, multiplayer metaphors).
- **`documentation/`** — *artifact*: manuals, talks, HTML exports, **immutable snapshots** (e.g. OpenLaszlo sources).

When an old idea graduates into something we still pursue (city branching, Git worlds, voting across simulations), it typically grows a **`designs/*.md`** note while the archive file stays the historical receipt — see **`TODO.txt`** vs **`github-as-mmorpg-multiverse.md`**.
