<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';

	const funds = $derived(micropolisReactive.totalFunds);
	const dateLabel = $derived(
		`${micropolisReactive.cityMonth}/${micropolisReactive.cityYear} · ${micropolisReactive.cityName || 'Micropolis'}`
	);
	const demand = $derived(
		`R${micropolisReactive.demandR} C${micropolisReactive.demandC} I${micropolisReactive.demandI}`
	);
	const simLabel = $derived(
		micropolisReactive.simPaused
			? 'Paused'
			: micropolisReactive.simSpeed > 0
				? `Speed ${micropolisReactive.simSpeed + 1}`
				: 'Stopped'
	);
	const taxLabel = $derived(`Tax ${micropolisReactive.cityTax}%`);
</script>

<div class="game-hud" aria-live="polite">
	<div class="hud-row">
		<span class="hud-funds">${funds.toLocaleString()}</span>
		<span class="hud-date">{dateLabel}</span>
	</div>
	<div class="hud-row hud-meta">
		<span>{demand}</span>
		<span>{taxLabel}</span>
		<span class:paused={micropolisReactive.simPaused}>{simLabel}</span>
	</div>
</div>

<style>
	.game-hud {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 20;
		pointer-events: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
		line-height: 1.35;
		color: #f4f4f0;
		background: rgba(8, 12, 20, 0.82);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		padding: 0.45rem 0.65rem;
		min-width: 14rem;
		backdrop-filter: blur(4px);
	}

	.hud-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.hud-meta {
		margin-top: 0.25rem;
		opacity: 0.9;
		font-size: 0.75rem;
	}

	.hud-funds {
		font-weight: 700;
		color: #9cf59c;
	}

	.paused {
		color: #ffb347;
	}
</style>
