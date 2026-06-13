# Executor conventions — Micropolis playable playbooks

Every playbook in `../playbooks/` follows these rules so **lower-powered LLMs** can execute
reliably without improvising.

## Before Step 1

1. Read the playbook **Risk profile** block.
2. Confirm **Prerequisites** (prior PBs landed).
3. `cd` to repo root: `/Users/a2deh/GroundUp/git/MicropolisCore` (or your clone).
4. If a step cites line numbers, **re-run the grep in that step first**. If lines drift,
   update the playbook's `Files affected` section and stop — do not guess.

## Step tags

| Tag | Meaning |
|-----|---------|
| `[AUTO]` | Run commands, apply the edit, run Verify, continue |
| `[CONFIRM]` | Stop; summarize blast radius; wait for human `yes` |
| `[HUMAN]` | Human must run dev server / click-test; paste evidence back |

Micropolis playable work is almost all `[AUTO]` except manual browser smoke in PB-05.

## Verification discipline

- Every step ends with a **Verify** block — run it before the next step.
- End-of-PR **Verification** must pass before marking the PB ✅ in `playbooks/README.md`.
- Update `../PROGRESS.yml` when a step completes.

### `pnpm check` has known pre-existing errors

`pnpm check` (svelte-check) reports **~1300 errors in two files you must not touch**:
`apps/micropolis/src/lib/micropolisengine.js` (generated WASM glue) and
`apps/micropolis/src/lib/holodeck/createMeasureStore.svelte.ts`. These are **pre-existing** and not
caused by batch-1 work. **Success = the files *your* PB created/edited introduce no new errors**, not
a zero-error build. `pnpm test` (vitest), by contrast, must be **fully green**.

## Scope fences (do not cross)

| In scope (batch 1) | Out of scope |
|--------------------|--------------|
| `apps/micropolis/src/lib/**` playable UI | Holodeck plugins, WebGPU map cutover |
| CommandBus tool commands | Pie menu rewrite |
| DOM `CursorLayer` on WebGL map | Legacy WebGL renderer changes |
| Minimal budget modal | Full classic SimCity budget sliders (defer) |

## Model routing

| Work | Suggested model |
|------|-----------------|
| Playbook **execution** (PB-01..05) | Composer / Auto / Codex — follow steps literally |
| Playbook **authoring** / design gaps | Opus / GPT-5.5 — STIR into atlas or GATHERING |
| Stuck on Verify red | Escalate; do not improvise — use Rollback section |

## One PR per playbook

Do not combine PB-02 and PB-03 in one PR unless the human explicitly overrides. Small PRs
keep review and revert safe.
