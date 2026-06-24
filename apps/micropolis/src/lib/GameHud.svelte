<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { toolState } from '$lib/ToolState.svelte';

	const funds = $derived(micropolisReactive.totalFunds);
	const dateLabel = $derived(
		`${micropolisReactive.cityMonth}/${micropolisReactive.cityYear} · ${micropolisReactive.cityName || 'Micropolis'}`
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
	<div class="hud-row hud-row-primary">
		<span class="hud-funds">${funds.toLocaleString()}</span>
		<span class="hud-date" title={dateLabel}>{dateLabel}</span>
	</div>
	<div class="hud-row hud-meta">
		<span class="hud-rci">
			<span class="rci-item"><span class="rci-letter">R</span> {micropolisReactive.demandR}</span>
			<span class="rci-item"><span class="rci-letter">C</span> {micropolisReactive.demandC}</span>
			<span class="rci-item"><span class="rci-letter">I</span> {micropolisReactive.demandI}</span>
		</span>
		<span class="hud-tax">{taxLabel}</span>
		<span class="hud-speed" class:paused={micropolisReactive.simPaused}>{simLabel}</span>
	</div>
	{#if toolState.lastToolFeedback}
		<div class="hud-feedback">{toolState.lastToolFeedback}</div>
	{/if}
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
		width: 20.5rem;
		box-sizing: border-box;
		backdrop-filter: blur(4px);
	}

	.hud-row {
		display: grid;
		gap: 0.5rem;
	}

	.hud-row-primary {
		grid-template-columns: 7.25rem 1fr;
		align-items: baseline;
	}

	.hud-meta {
		margin-top: 0.25rem;
		grid-template-columns: 1fr 4.25rem 4.5rem;
		align-items: baseline;
		font-size: 0.75rem;
		color: #dce4f8;
	}

	.hud-rci {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		font-variant-numeric: tabular-nums;
	}

	.rci-item {
		display: inline-flex;
		align-items: baseline;
		gap: 0.35rem;
	}

	.rci-letter {
		font-weight: 700;
		min-width: 0.65rem;
	}

	.hud-funds,
	.hud-date,
	.hud-tax,
	.hud-speed {
		font-variant-numeric: tabular-nums;
	}

	.hud-date {
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hud-tax,
	.hud-speed {
		text-align: right;
	}

	.hud-feedback {
		margin-top: 0.35rem;
		padding-top: 0.3rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 0.78rem;
		font-weight: 600;
		color: #ffc840;
	}

	.hud-funds {
		font-weight: 700;
		color: #9cf59c;
	}

	.paused {
		color: #ffb347;
	}
</style>
