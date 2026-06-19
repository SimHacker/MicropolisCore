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
	h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}
	.budget-copy {
		margin: 0 0 0.75rem;
		opacity: 0.9;
		line-height: 1.4;
	}
	.auto-budget {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 1rem;
	}
	.budget-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
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
