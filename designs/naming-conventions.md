# Micropolis Naming Conventions

## Thesis

Micropolis should use big-endian names across files, directories, branches, command ids, event types, callback methods, and generated records.

Big-endian means:

```text
most-significant -> more-specific -> terminal
```

The terminal carries the outcome. Do not tack on a redundant success marker after a predicate that already means “done.”

The name itself should be a K-line: greppable, sortable, stemmable, and understandable before opening the file or reading the code.

## Orthogonal vocabulary

### Words (state relation — terminal)

Closed set — each name is **complete**. Nothing follows them (no `.did`, no second past tense):

| Word | Use when |
|------|-----------|
| `changed` | Structure, identity, selection, topology, or region — not the same snapshot as before. |
| `updated` | Scalars, gauges, aggregates, counts — measured values moved. |
| `emitted` | Outbound signal: sound, text, advisory, notice. |
| `computed` | A derived artifact exists or was refreshed. |
| `advanced` | The simulation clock or era stepped (month, year, pass boundary). |

**Rule:** `changed` ≠ `updated`. If you said `updated`, you already said the interesting fact — **stop.**

### Completed actions (past participle — terminal)

For discrete operations not covered by **Words**, end with the **completed** form: `loaded`, `saved`, `generated`, `started`, … — again **one** terminal, not `verb.did`.

### Edges (only when something other than success matters)

Use an extra segment **only** for imminent intent or failure/denial/stale — never for redundant “success”:

| Edge | Meaning |
|------|---------|
| `will` | About to proceed. |
| `failed` | Attempt did not complete. |
| `rejected` | Denied by precondition or policy. |
| `invalidated` | Cached or derived result is stale. |

Typical shapes: `domain.subject.<verb>.will`, `domain.subject.<verb>.failed`, … Success of the same operation is **`domain.subject.<past-participle>`** or a **Word**, not `verb.did`.

There is **no** separate universal success phase such as `did`. Success is already expressed by `updated`, `changed`, `emitted`, `computed`, `advanced`, or a past participle.

### Directives (non-facts — terminal)

| Directive | Meaning |
|-----------|---------|
| `suggested` | Non-binding host hint. |
| `recommended` | Stronger hint; still not a measurement. |

Prefer routing these through CommandBus / UI / automation rather than the core engine fact stream.

### Composing event types

- **Fact:** `domain.subject.<word>` — e.g. scalars: `…updated`.
- **Fact:** `domain.subject.<past-participle>` — discrete completion: `city.loaded`, `map.generated`.
- **Edge:** `domain.subject.<verb>.<will|failed|rejected|invalidated>` — only when that edge exists.
- **Hint:** `domain.subject.<directive>`.

Concrete strings belong in code and generated types first — not in static tables here.

Do not stack synonyms for the same completion (`updated.did`, `changed.did`, …).

## Source Inspiration

This follows MOOLLM `kernel/naming`:

- Most significant component first.
- Prefix implies belonging.
- Directory listings are semantic advertisements.
- Names are activation vectors.
- File with same name as directory is the directory.

Micropolis adopts those rules, with syntax adapted per surface.

## Syntax By Surface

### Directories and Files

Use lowercase kebab-case. Layout follows the object-store and branch conventions in the other design docs under `designs/`; keep filenames aligned with whatever YAML or command-record schemas you actually commit.

### Branches

Use `type_id`: underscore between object type and id; hyphens inside the id when needed. Detailed shapes live in `designs/filesystem-object-model.md` and related docs once branches exist in your repo.

### Command Ids

Use dot-separated big-endian ids. Pattern:

```text
domain.object.action[.qualifier]
```

Prefer object/action order over verb-first order so related commands sort together. Registered commands today live in `micropolis/src/lib/micropolisCommands.ts` (for example `sim.toggle-pause`, `sim.set-speed-*`, `city.generate-random`, `view.pan-left`, `tax.increase`, `recorder.mark`).

### Event Types

Use dot-separated big-endian strings. Grammar is fixed in **Orthogonal vocabulary**: terminals are **Words**, **past participles**, **Directives**, or **verb + edge** (`will`, `failed`, …) — not a gratuitous success suffix.

Low-level engine events describe domain facts. Do not encode UI policy; hosts decide how to render or route.

### Callback Methods

The WASM boundary uses whatever symbols **`Callback` / `JSCallback`** export today (`MicropolisEngine/src/callback.h`, generated `micropolis/src/types/micropolisengine.d.ts`). When you align method names with event strings, use `lowerCamelCase`, **subject-first**, with the **terminal segment last** (`fundsUpdated`, `cityLoaded`, `cityLoadWill`, …) — mirror the dots left to right; do not append `Did` after predicates that already mean completion (`Updated`, `Changed`, …).

### TypeScript Classes

Use normal PascalCase for exported classes (for example `CommandRecorder`, `MicropolisSimulator` in this repo).

### JSON Fields

Use snake_case for serialized records and YAML/JSON files:

```json
{
  "schema_version": 1,
  "event_type": "<dotted.event.type>",
  "city_id": "<string>",
  "sim_tick": 0,
  "city_time": 0
}
```

Runtime TypeScript can use camelCase. Persistent records should use snake_case.

## Event Envelope

All durable events should fit this shape:

```ts
interface MicropolisEvent {
  schema_version: 1;
  event_type: string;
  source: 'engine' | 'command-bus' | 'ui' | 'llm' | 'github-action' | 'visual-program';
  branch?: string;
  object_path?: string;
  city_id?: string;
  sim_tick?: number;
  city_time?: number;
  actor?: string;
  command_id?: string;
  payload?: Record<string, unknown>;
}
```

The event type is the K-line. The payload carries details.

## Engine callbacks

Authoritative method names are on **`Callback`** in `MicropolisEngine/src/callback.h` (wired through **`JSCallback`** in `MicropolisEngine/src/js_callback.h` and Embind). When you rename them, update C++, Embind, TypeScript adapters, and any docs **in the same change**; do not maintain a speculative rename table in this file.

## Migration Strategy

Because this is a monorepo, we can rename the callback surface directly and update all call sites in one branch.

Recommended order:

1. Add the canonical names to `callback.h`, `ConsoleCallback`, `JSCallback`, and TypeScript callback implementations.
2. Update C++ call sites from old names to canonical names.
3. Regenerate Embind artifacts.
4. Update `MicropolisReactive.engineCallback` and shared headless callbacks.
5. Normalize callback invocations into `MicropolisEvent` objects.
6. Remove compatibility names after the repo builds and browser/headless smoke tests pass.

Do not keep long-term aliases unless there is a real outside dependency. There is not.

## Naming Tests

Useful future checks:

- No `*.updated.did`, `*.changed.did`, or other **word + redundant success marker**.
- `changed` vs `updated` usage matches the definitions above.
- Command ids remain dot-separated big-endian (command grammar stays separate from event grammar).
- Persistent files stay lowercase kebab-case or timestamp-prefixed.
- Serialized JSON/YAML fields use snake_case.

This is not naming polish. It is navigability infrastructure for humans and LLMs.
