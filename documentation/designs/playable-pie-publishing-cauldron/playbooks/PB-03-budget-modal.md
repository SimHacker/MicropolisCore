# PB-03 — BudgetModal + doBudget lifecycle

## Navigation

- **Preceded by:** none logically — but mounts in `MicropolisView.svelte`, **also edited by
  [PB-02](PB-02-mount-cursor-layer.md)**; run PB-02 first ([hub § Shared files](README.md#shared-files-read-before-parallelizing)).
- **Unlocks:** [PB-05](PB-05-vertical-slice-verify.md) (DoD item: budget modal).
- **Related:** [PB-04](PB-04-tool-commands.md) (no shared files).
- **Design source:**
  [code-anchors § anchor-reactive](../wisdom/code-anchors.md#anchor-reactive) (budget flags, `poke`, engine API),
  [micropolis-playable-game-readiness §6 C3](../../micropolis-playable-game-readiness.md#phase-c--classic-simcity-feedback-23-days),
  [PLAYABLE-SLICE-ATLAS](../PLAYABLE-SLICE-ATLAS.md).

## Scope

When the engine calls `showBudgetAndWait`, show a modal. **Accept** calls `micropolis.doBudget()`
and clears `budgetModalRequested`. v1 may be minimal (title + OK + auto-budget toggle) — full
classic budget sliders are explicitly deferred.

## Risk profile

🟢 **low.** New Svelte component + one `poke` method. Engine already sets
`budgetModalRequested` via callback.

**Collect upfront:** none.

## Prerequisites

None. `MicropolisReactive` already exposes `budgetModalRequested` and `clearBudgetModalRequest()`.

## Context

1. Callback wiring: `MicropolisReactive.sim.test.ts` — `showBudgetAndWait` sets flag.
2. Engine API: `micropolis.doBudget()` in `micropolisengine.d.ts`.
3. `micropolis.autoBudget` / `setAutoBudget(bool)` exist for a simple toggle.

Read:

```bash
grep -n 'showBudgetAndWait\|budgetModalRequested\|clearBudgetModalRequest' apps/micropolis/src/lib/MicropolisReactive.svelte.ts
grep -n 'doBudget\|setAutoBudget\|autoBudget' apps/micropolis/src/types/micropolisengine.d.ts | head -20
```

## Files affected

**Created:**

- `apps/micropolis/src/lib/BudgetModal.svelte`

**Modified:**

- `apps/micropolis/src/lib/MicropolisView.svelte` — mount `<BudgetModal />` (Step 3).
  **Also edited by PB-02** (mounts `<CursorLayer>`); run PB-02 first.
- `apps/micropolis/src/lib/MicropolisReactive.svelte.ts` — add `poke.doBudget()` + `poke.setAutoBudget()`
  (Step 1; neither exists yet — see [anchor-reactive](../wisdom/code-anchors.md#anchor-reactive)).

## Steps

### Step 1 — `[AUTO]` Add `poke.doBudget()`

In `MicropolisReactive.svelte.ts` inside `poke: { ... }`, add:

```typescript
doBudget(): void {
  requireMicropolis().doBudget();
  syncFromEngine();
  budgetModalRequested = false;
},
setAutoBudget(enabled: boolean): void {
  requireMicropolis().setAutoBudget(enabled);
  syncFromEngine();
},
```

Place near other `poke` methods (~line 505+).

**Verify:**

```bash
grep -n 'doBudget' apps/micropolis/src/lib/MicropolisReactive.svelte.ts
```

### Step 2 — `[AUTO]` Create BudgetModal.svelte

Create `apps/micropolis/src/lib/BudgetModal.svelte`:

```svelte
<script lang="ts">
  import { micropolisReactive } from '$lib/MicropolisReactive.svelte';

  const open = $derived(micropolisReactive.budgetModalRequested);

  function accept() {
    micropolisReactive.poke.doBudget();
  }

  function dismiss() {
    micropolisReactive.clearBudgetModalRequest();
  }

  function toggleAutoBudget(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    micropolisReactive.poke.setAutoBudget(checked);
  }
</script>

{#if open}
  <div class="budget-backdrop" role="presentation" onclick={dismiss}></div>
  <div class="budget-modal" role="dialog" aria-labelledby="budget-title" aria-modal="true">
    <h2 id="budget-title">City budget</h2>
    <p class="budget-copy">
      End-of-year budget review. Accept to apply the current budget plan and continue the simulation.
    </p>
    <label class="auto-budget">
      <input
        type="checkbox"
        checked={micropolisReactive.attachedSimulator?.micropolis?.autoBudget ?? true}
        onchange={toggleAutoBudget}
      />
      Auto-budget (engine manages funding)
    </label>
    <div class="budget-actions">
      <button type="button" onclick={dismiss}>Later</button>
      <button type="button" class="primary" onclick={accept}>Accept budget</button>
    </div>
  </div>
{/if}

<style>
  .budget-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.45);
  }
  .budget-modal {
    position: fixed;
    z-index: 41;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(22rem, 92vw);
    padding: 1rem 1.1rem;
    background: rgba(8, 12, 20, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #eef2ff;
    font-size: 0.85rem;
  }
  h2 { margin: 0 0 0.5rem; font-size: 1rem; }
  .budget-copy { margin: 0 0 0.75rem; opacity: 0.9; line-height: 1.4; }
  .auto-budget { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
  .budget-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
  button {
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    cursor: pointer;
  }
  button.primary {
    background: rgba(80, 140, 255, 0.45);
    border-color: rgba(140, 180, 255, 0.6);
  }
</style>
```

If `autoBudget` is not readable on `micropolis`, use `$derived` from a reactive scalar you add
to `MicropolisReactive` in a follow-up — for v1 the checkbox may be display-only with
`setAutoBudget` on change only.

**Verify:**

```bash
test -f apps/micropolis/src/lib/BudgetModal.svelte && echo OK
```

### Step 3 — `[AUTO]` Mount in MicropolisView

In `MicropolisView.svelte`:

```typescript
import BudgetModal from '$lib/BudgetModal.svelte';
```

In template with other overlays:

```svelte
<BudgetModal />
```

**Verify:**

```bash
grep -n 'BudgetModal' apps/micropolis/src/lib/MicropolisView.svelte
```

### Step 4 — `[AUTO]` Unit test poke.doBudget (optional but recommended)

In `MicropolisReactive.sim.test.ts`, add after budget modal lifecycle test:

```typescript
it('poke.doBudget clears budgetModalRequested', () => {
  micropolisReactive.engineCallback.showBudgetAndWait?.(micropolis, {});
  expect(micropolisReactive.budgetModalRequested).toBe(true);
  micropolisReactive.poke.doBudget();
  expect(micropolisReactive.budgetModalRequested).toBe(false);
});
```

Skip if WASM init makes this flaky — document skip in PR.

**Verify:**

```bash
cd apps/micropolis && pnpm test MicropolisReactive.sim.test.ts
```

### Step 5 — `[AUTO]` Typecheck

```bash
cd apps/micropolis && pnpm check
```

## Verification

```bash
cd /Users/a2deh/GroundUp/git/MicropolisCore/apps/micropolis
pnpm check
pnpm test
```

## Rollback

Delete `BudgetModal.svelte`; revert `MicropolisView.svelte` and `MicropolisReactive.svelte.ts`.

## Success criteria

- `budgetModalRequested === true` shows modal.
- Accept calls `doBudget()` and closes modal.
- Dismiss calls `clearBudgetModalRequest()` without `doBudget`.
- Tests and check pass.

## See also

- Classic full budget UI — defer to pie/cauldron pillar 2.
- Multiplayer vote dialog (tax-class) — [map-compositing §5](../../map-compositing-and-measurement.md#51-two-surfaces-one-proposal) (post-playable).
