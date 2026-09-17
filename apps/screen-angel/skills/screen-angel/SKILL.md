---
name: screen-angel
description: "Read and act on a live desktop through its accessibility tree. Query widgets with CSS-like selectors, outline them on the user's screen, capture parts of windows and controls as images, and watch focus change. Use when you need to see or point at what is actually on someone's screen rather than guess."
allowed-tools: [run_terminal_cmd, read_file]
permissions: [read, terminal]
related: [sniffable-python, sister-script, yaml-jazz, postel, cursor-mirror, design-sense]
benefits_from:
  - skill: sniffable-python
    why: "The CLI is written to its depth conventions; sections sniff at glance."
  - skill: sister-script
    why: "This doc and the CLI were written together; the doc is the spec."
  - skill: postel
    why: "Selectors and coordinates are accepted loosely, JSON is emitted strictly."
moollm_compatible: true
respects: [yaml-jazz, postel, sniffable-python, path]
supports: [play-learn-lift]
composes_with: [cursor-mirror, sister-script, design-sense]
license: MIT
tags: [accessibility, automation, desktop, mcp, cli, screen, ui, electron]
credits:
  - "Don Hopkins — Screen Angel, and the pie-menu/SimCity lineage this grew out of"
  - "Richard Potter — Triggers, in Cypher (ed.), Watch What I Do: Programming by Demonstration"
  - "Anthropic — Skills model foundation, MCP"
moollm:
  ecosystem: false
  self_contained_guidance: "SKILL.md is usable alone. GLANCE.yml and CARD.yml are lower-resolution views of it; README.md is the higher-resolution one."
---

# Screen Angel

Part of MOOLLM · [This skill's directory](https://github.com/SimHacker/MicropolisCore/tree/main/apps/screen-angel/skills/screen-angel)

Read and act on a live desktop through the platform accessibility APIs. Ask what is on
screen, match widgets with CSS-like selectors, outline them where the user can see, grab
images of particular windows and controls, and watch focus change.

The 1990s desktop assistant had every part of this except the one that mattered. It could
enumerate the widgets and could not tell what they were **for**. That part is you. This
skill is the socket where a recognizer plugs into a desktop.

---

## The resolution pyramid

Four files, same subject, increasing detail. Read down only as far as you need.

| Level | File | Answers |
|---|---|---|
| 👁️ Glance | [GLANCE.yml](./GLANCE.yml) | Is this relevant, and what are the verbs? |
| 📇 Card | [CARD.yml](./CARD.yml) | What is the full interface, and how does it fail? |
| 📜 Skill | **this file** | How do I actually use it, and what will bite me? |
| 📚 Deep | [README.md](./README.md) | Why is it built this way, and what is the design argument? |

Beyond the skill, in the app itself: [PROTOCOL.yml](../../PROTOCOL.yml) is the wire
format both implementations must agree on, and [SCREEN-ANGEL.yml](../../SCREEN-ANGEL.yml)
is the layer's own design document.

**Nothing below requires MOOLLM.** This file carries the whole protocol in its body. The
CLI is standard-library Python. The only real dependency is a running Screen Angel.

---

## Quick start

```bash
cd apps/screen-angel

./cli/screen-angel info                 # can I see anything at all?
./cli/screen-angel windows              # what is open?
./cli/screen-angel query 'button'       # what buttons are in the focused app?
./cli/screen-angel show 'button'        # ...and outline them on the real screen
./cli/screen-angel say "I see 7 buttons"
```

No install, no virtualenv, no `pip`. If `info` reports a missing permission, stop and fix
that first: every query will otherwise return **empty rather than failing**, which looks
exactly like a broken selector.

---

## The model

One Electron app binds the platform accessibility APIs — `AXUIElement` on macOS, UI
Automation on Windows — and listens on a local socket. Everything else is a client.

```
   your agent  ──┐
   CLI         ──┼─→  local socket  ─→  Electron main  ─→  native addon  ─→  the OS
   MCP server  ──┘                            │
                                              └─→  transparent overlay window
```

Three properties of that shape matter to you:

**Queries see the focused application only.** There is no way to walk a background app's
tree. That is a property of the platform APIs, not of this interface. Use `windows` to see
what else exists, and ask the user to switch.

**The overlay is ours, not the application's.** Anything you highlight or say is drawn on
a transparent window floating above everything. It is honest about being an addition. It
never modifies the application underneath.

**Nothing types or clicks.** See [What this cannot do](#what-this-cannot-do). Do not tell
a user you pressed something.

---

## Selectors

A deliberate subset of CSS. If you know CSS you already know this, with two omissions
that are the interesting part.

### Combinators

| Syntax | Means |
|---|---|
| `a b` | `b` at any depth below `a` |
| `a > b` | `b` is a direct child of `a` |
| `a, b` | either — the union of both |

Union is worth reaching for more than it sounds. The question you usually have is not
"where are the buttons" but "what can I interact with here", and that is several roles at
once: `button, checkbox, combobox, textfield, radiobutton`. Each branch is matched
independently, and the results come back deduplicated and in walk order, so a union reads
exactly like a single-role query — an element two branches both match appears once.

### Predicates

| Syntax | Means |
|---|---|
| `[name=Save]` | equals |
| `[name!=Save]` | not equals |
| `[name*=Sav]` | contains |
| `[name^=Sa]` | starts with |
| `[name$=ve]` | ends with |
| `[value]` | present and non-empty |

Attributes: `name`, `value`, `role`. Values may be bare, `'single'`, or `"double"` quoted.
Quote anything containing a space.

### Pseudo-classes

`:focused`, `:enabled`, `:disabled`

### What is deliberately missing

**No sibling combinators (`+`, `~`) and no `:nth-child`.** Sibling order is not stable
between releases of the application you are pointing at. A selector that depends on
position is a selector that breaks on the day the app updates, silently, by matching the
wrong thing rather than nothing. Match on what a widget **is**, not where it sits.

If you find yourself wanting `:nth-child`, the answer is usually a `name` or `value`
predicate on the row itself, or `query` the container and read its children from the
returned paths.

### Examples

```
button                              every button
button[name=Save]                   exact name
button[name*=Sav]                   Save, Save As…, Saved
window > toolbar button             buttons directly inside a toolbar inside a window
textfield:focused                   the field with the caret
menuitem[name*=Export]              anything exporty in a menu
row text[value]                     non-empty text cells inside rows
checkbox:disabled                   greyed-out checkboxes

button, checkbox, combobox          anything clickable, in walk order
textfield, checkbox:focused         whichever of the two has the caret
dialog button, dialog checkbox      the controls of a dialog and nothing else
```

---

## Roles

Platform roles are normalized into one lowercase vocabulary, so a selector written on a
Mac has a chance on Windows. `AXButton` and UIA control type `50000` both arrive as
`button`.

The full vocabulary is 41 names, taken from UI Automation's control types because that
set already exists and is documented:

```
appbar     button      calendar   checkbox  combobox   custom     datagrid  dataitem
document   group       header     headeritem hyperlink image      list      listitem
menu       menubar     menuitem   pane      progressbar radiobutton scrollbar semanticzoom
separator  slider      spinner    splitbutton statusbar tab       tabitem   table
text       textfield   thumb      titlebar  toolbar    tooltip    tree      treeitem
window
```

Four of these are worth knowing before you guess:

| You might write | It is actually | Because |
|---|---|---|
| `statictext` | `text` | `AXStaticText` → `text` |
| `scrollarea` | `pane` | `AXScrollArea` → `pane` |
| `textarea` | `textfield` | `AXTextArea` and `AXTextField` both land here — UIA uses one edit control type for both, so keeping them apart would break cross-platform parity |
| `link` | `hyperlink` | UIA's name |

macOS additions that have no UIA equivalent keep their own names, e.g. `colorwell`,
`ruler`, `rulermarker`, `radiogroup`. When in doubt, run `tree` and read the roles that
come back rather than guessing — `nativeRole` sits beside `role` on every element for
exactly that reason.

UIA's *localized* control-type names are deliberately unused: they change with the
display language, and a selector that only works in English is a selector that fails in
Amsterdam.

---

## Commands

Global flags work on either side of the subcommand: `--json`, `--socket PATH`,
`--timeout SEC`.

### Looking

| Command | What |
|---|---|
| `info` | Version, backend, permissions, modules, active bridge, Steam. **Call first.** |
| `permissions` | Grant state alone. |
| `windows` | Every on-screen window: pid, app, title, bounds. |
| `focused` | The one window a query will walk. |
| `query <selector>` | Match a selector. `--depth N`, `--nodes N`, `--limit N`. |
| `tree` | Everything up to budget. Start here on an unfamiliar app. |
| `at <x> <y>` | The element under a screen coordinate. Cheap; no walk. |

### Showing

| Command | What |
|---|---|
| `show <selector>` | `query`, then outline the matches on the overlay. |
| `highlight x,y,w,h ...` | Outline arbitrary rectangles. `--clear` to remove. |
| `say <text>` | One line on the overlay. `--ttl MS`. |
| `overlay` | Toggle the overlay window. |

### Watching and serving

| Command | What |
|---|---|
| `watch` | Block, printing focus changes and bridge attachments. |
| `mcp` | Run the MCP stdio server. |

Output is a human table on a terminal and JSON when piped, so `screen-angel windows` reads
well and `screen-angel windows | jq` parses. `--json` forces it either way.

Exit codes: `0` success, `1` request failed, `3` no app listening. The third is separate
because the fix is to launch the app, not to change the command.

---

## Reading a query result

```
PATH      ROLE        NAME          VALUE        BOUNDS          
0.3.12    button      Save                       1204,88 64×24   f
0.3.14    button      Cancel                     1276,88 64×24   

2 matched · 524 visited · 250ms
```

- **path** — walk-order handle, e.g. `[0, 3, 12]`. This is what other calls take.
- **visited / durationMs** — what the walk cost. Not decoration: see [budgets](#budgets).
- **`f` flag** — focused. `d` means disabled.

### path is a handle, not an identity

`path` is valid until the tree changes. It is **not** an id. Do not store it and expect it
to mean the same widget after the user scrolls, resizes, or opens a menu. Re-query
instead. Containment is computed from path prefixes, which is why `a > b` needs no parent
pointers and no tree reconstruction.

---

## Budgets

Every accessibility attribute read is a synchronous round trip to another process. An
unbounded walk of a browser window takes seconds and can make the target application
appear to hang.

So walks are budgeted: `maxDepth` 12 and `maxNodes` 4000 by default.

```
2 matched · 3998 visited · 4120ms · TRUNCATED — budget ran out, raise --nodes or narrow the selector
```

**`truncated: true` does not mean the application has no more widgets.** It means the walk
stopped. Treating a truncated empty result as "the button isn't there" is the single most
likely wrong conclusion available here. Narrow the selector — a specific `role` prefix
prunes enormous amounts of tree — or raise `--nodes` deliberately.

---

## Images

A capture never returns pixels. It returns a **descriptor**: size, format, byte length, a
`sha256`, and which transports this connection may use. You fetch the bytes in a second
request, in the encoding you can actually use.

That indirection exists because the common question — "did a dialog appear", "is Save
enabled" — is answered by the tree in a few hundred bytes. An interface that answered it
with a 4K screenshot would charge every caller for pixels most of them did not want.

### Grabbing part of the screen

One method, and every argument has a default that means "the whole thing, at a size a
model can read".

```jsonc
{"method": "capture.grab", "params": {"target": {"element": [0, 3, 12]}}}
```

**Targets** are handles you already hold from a JSON reply, never rectangles you had to
compute: `{element: path}`, `{selector: "..."}`, `{window: pid | "focused"}`,
`{screen: n | "focused"}`, or `{rect: {...}}` as an escape hatch.

**`region`** names a part of the target instead of measuring it: `all` (default), `top`,
`bottom`, `left`, `right`, thirds, ninths (`top-left` … `bottom-right`), `title-bar`,
`status-bar`. Resolved against current bounds at capture time, so it cannot go stale
between the query and the grab the way a computed rectangle can.

**`size`** is `fit` (1024px longest edge, the default), `full`, or a number. 1024 is not a
compromise: a 4K screenshot is more expensive **and worse** for recognition than a 1024px
one. If you need detail, ask for a smaller `region`, not a bigger image.

**`pad`** is `tight`, `snug` (default, 8px), `loose` (48px), or a number. A control
captured at exactly its bounds is often unrecognizable — a checkbox becomes a grey square
and its label, the only thing saying what it does, is outside the crop.

**`marks`** draws numbered markers on matching elements and returns a legend:

```jsonc
{"method": "capture.grab",
 "params": {"target": {"screen": "focused"}, "marks": "button"}}
```

You get an image with `1`, `2`, `3` drawn on the real widgets plus
`marks: [{n, path, role, name, bounds}]`. Now "the third one" is unambiguous without a
single coordinate crossing the wire. The markers are ours and vanish when cleared.

**`capture.batch`** takes several grabs and answers in one round trip. Six separate grabs
cost six times the latency for no reason when you knew all six targets up front. A failed
grab returns an error in its own slot rather than failing the batch.

### Format

`format` is selectable — `png`, `jpeg`, `raw-bgra` — and defaults to `auto`. **Leave it
alone.** The two decisions that matter are which region and how big; format follows.

`auto` picks **PNG for an element or window** and **JPEG for a screen**, a region over
~1.5 megapixels, or a window with a game bridge attached. The descriptor reports
`formatReason`, so a surprise explains itself.

The reason it matters: PNG is not just lossless on UI, it is usually *smaller*, because
flat regions and repeated edges are what its filters are for — and JPEG is actively bad on
text, with ringing around glyphs and chroma subsampling that smears coloured type. At 1024px
a glyph is 8-10px tall, which is exactly where that stops being cosmetic. On game frames the
arithmetic reverses completely: several megabytes as PNG against roughly 90-180 KB as JPEG,
for a difference no recognizer can see.

`quality` applies to JPEG, defaults to 82, and should not go below 70. `raw-bgra` exists for
a local consumer about to re-encode anyway and is offered only over the file transport —
1920×1080 raw is 8.3 MB, and if you are willing to compress it you have described PNG.

There is no separate compression layer. Gzipping a PNG spends CPU to save one percent of
something already entropy-coded. The format *is* the compression.

Full reasoning, including why binary frames are counted rather than delimited:
[PROTOCOL.yml](../../PROTOCOL.yml).

> Capture is **specified and not yet built**. `PROTOCOL.yml` marks exactly which parts of
> the protocol are live; `angel.info` reports `can.capture` at runtime. Check it rather
> than assuming.

---

## The protocol

You rarely need this directly — the CLI and the Python client cover it — but it is small
enough to use from anything.

**Socket.** `$SCREEN_ANGEL_SOCKET`, else `$XDG_RUNTIME_DIR/screen-angel-$UID.sock`, else
`\\.\pipe\screen-angel-$USERNAME` on Windows. A Unix socket rather than a localhost port,
because a port is reachable by every process on the machine including a browser tab, and
this is a service that reads the user's screen.

**Wire.** Newline-delimited JSON, so the whole thing is debuggable with `nc`.

```jsonc
→ {"id": 1, "method": "query.select", "params": {"selector": "button[name=Save]"}}
← {"id": 1, "ok": true, "result": {"elements": [...], "visited": 524, "truncated": false}}
← {"id": 2, "ok": false, "error": {"message": "unexpected ']'", "code": "parse"}}
← {"event": "window-focus", "payload": {"pid": 6247, "app": "Cursor", "title": "…"}}
```

Events arrive unbidden and can land in the middle of waiting for a reply. Clients queue
them and drain later; that is what lets `watch` and `query` share a connection.

**Methods.** `angel.info`, `angel.permissions`, `query.select`, `query.tree`, `query.at`,
`window.focused`, `window.list`, `overlay.highlight`, `overlay.say`, `overlay.toggle`.

The read-only subset is a **constant in the source**, not a comment
(`READ_ONLY_METHODS` in `src/common/protocol.ts`), because granting an agent permission
to look is a different decision from granting it permission to change the screen, and
those halves have to be grantable separately.

---

## Python API

```python
from screen_angel.client import open_angel

with open_angel() as angel:
    if not angel.info()["permissions"]["accessibility"] == "granted":
        raise SystemExit("grant accessibility first")

    result = angel.show('button[name*=Save]')      # find and outline in one call
    angel.say(f'{len(result["elements"])} save buttons')

    for event in angel.watch():                     # blocks
        print(event.name, event.payload)
```

| Module | Role |
|---|---|
| `protocol.py` | Transport, framing, socket location. Standard library only. |
| `client.py` | `Angel` — one method per verb. **The module worth importing.** |
| `render.py` | Human tables and trees. The only module that formats. |
| `cli.py` | Thin `argparse` wrapper. No logic. |
| `mcp_server.py` | MCP stdio server. Needs the `mcp` package; nothing else does. |

Results are plain dicts, not dataclasses. When the app grows a field, a dict forwards it
and a dataclass drops it, and a client that silently discards new information is worse
than one that passes it through unread.

`find_one(selector)` returns the first match or `None`. `show(selector)` queries and
outlines. Neither adds capability; both save a round trip of thinking.

---

## Using it as an MCP server

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "screen-angel": {
      "command": "python3",
      "args": ["/absolute/path/to/apps/screen-angel/cli/screen-angel", "mcp"]
    }
  }
}
```

Tools: `screen_angel_info`, `screen_angel_windows`, `screen_angel_query`,
`screen_angel_tree`, `screen_angel_element_at`.

**Read-only by default.** `screen_angel_highlight`, `screen_angel_clear_highlights` and
`screen_angel_say` are registered only when `SCREEN_ANGEL_MCP_ACT` is set in the
environment. An MCP server is configured once in a JSON file and then forgotten, and the
thing that gets forgotten should be the safe one.

Tree results are trimmed to 60 elements before reaching a model, with a note saying so. A
4000-node dump is both unusable and expensive; narrowing the selector is the skill the
selector language exists to reward.

---

## Recipes

**Find out where you are.**

```bash
./cli/screen-angel info && ./cli/screen-angel focused
```

**Learn an unfamiliar application.** Dump shallow first, then go deeper where it looks
interesting. Depth 4 across a whole window is usually more informative than depth 12 down
one branch.

```bash
./cli/screen-angel tree --depth 4
```

**Prove you found the right thing.** Do this before telling the user anything about a
widget. If the wrong four things light up, they will see it immediately, and so will you.

```bash
./cli/screen-angel show 'button[name*=Export]'
```

**Point at something in place, rather than describing it.**

```bash
./cli/screen-angel show 'checkbox[name*=Backup]'
./cli/screen-angel say "This is the one that is off"
```

**Wait for the user to switch to the app you need.**

```bash
./cli/screen-angel watch --json | jq -r 'select(.payload.app == "Photoshop") | .payload.title'
```

**Check a condition from a script, by exit code and count.**

```bash
if [ "$(./cli/screen-angel query 'button[name=Save]' --json | jq '.elements | length')" -gt 0 ]; then
  echo "there is a save button"
fi
```

---

## What will bite you

**Permissions, silently.** Without accessibility permission, queries return empty rather
than erroring. Always `info` first. On macOS the app must be listed in System Settings →
Privacy & Security → Accessibility; `requestPermissions` prompts once, and after the
first denial the user must go there by hand.

**`windows` means the current Space, on macOS.** On-screen excludes minimized windows and
windows on other Spaces. A full-screen application lives on its own Space, so
`screen-angel windows` from a terminal inside one may honestly report only that
application's windows. It is not a filter and not a bug.

**Empty titles are a permission symptom.** macOS withholds window names until Screen
Recording is granted. An untitled window in the list usually means that, not an untitled
window.

**Windows: elevated targets are unreadable, and permissions still say granted.** An
unelevated client cannot read an elevated application's tree at all. You get an empty
tree and a cheerful permission state. If a UAC-elevated app looks empty, that is why.

**Roots differ across platforms.** `query.tree` roots at the whole application on macOS
and at a top-level window on Windows, because UIA's root is the desktop. A selector
starting `window > ...` behaves differently on the two. Prefer descendant matching near
the root.

**Electron and Java applications are often sparse.** Chromium exposes its tree only when
accessibility is switched on, so a query against another Electron app can legitimately
return nothing while a native app in the same session returns hundreds of nodes.

---

## What this cannot do

**No input injection.** Nothing here types, clicks, or moves the pointer. The native
addons are capable of it and the protocol deliberately does not expose it, because consent
for injection is a per-grant question and that machinery does not exist yet. A protocol
that grows the capability before the consent ships it by accident. **Do not tell a user
you clicked something.**

**No background application trees.** Focused window only.

**No arbitrary overlay UI.** `say` is text and an expiry: no markup, no buttons, no
styling. Anything that could draw a convincing dialog on top of another application's
window is a phishing kit, so it cannot.

**No mascot.** The overlay shows a word and a glyph. Clippy was rendered at the wrong
altitude of abstraction — detailed enough to be unmistakably somebody else, in the room,
watching. The layer should read as a property of the screen, not a character on it.

---

## Related skills

- **[sniffable-python](https://github.com/SimHacker/moollm/tree/main/skills/sniffable-python)** — the CLI follows its depth conventions, so `# UPPERCASE` section comments give a glance-level outline of each module.
- **[sister-script](https://github.com/SimHacker/moollm/tree/main/skills/sister-script)** — doc-first automation. This file and the CLI were written together; where they disagree, this file is the spec.
- **[postel](https://github.com/SimHacker/moollm/tree/main/skills/postel)** — selectors, coordinates and profile files are accepted liberally; JSON is emitted strictly.
- **[cursor-mirror](https://github.com/SimHacker/moollm/tree/main/skills/cursor-mirror)** — introspects the agent's own session. Screen Angel watches the screen, cursor-mirror watches the watcher.
- **[design-sense](https://github.com/SimHacker/moollm/tree/main/skills/design-sense)** — the lenses behind the overlay decisions above, particularly the argument about altitude of abstraction.

---

## Part of MOOLLM

**This skill's directory (browse and fetch everything):** [apps/screen-angel/skills/screen-angel/](https://github.com/SimHacker/MicropolisCore/tree/main/apps/screen-angel/skills/screen-angel)

- **MOOLLM:** [repo](https://github.com/SimHacker/moollm) · **Skill index and docs:** [skills/README](https://github.com/SimHacker/moollm/blob/main/skills/README.md)

This skill ships with the application it drives, in
[MicropolisCore](https://github.com/SimHacker/MicropolisCore), because it has to version
with the protocol. It follows MOOLLM conventions and works without MOOLLM.

MIT.
