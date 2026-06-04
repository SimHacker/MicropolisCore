<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';

	const zs = $derived(micropolisReactive.zoneStatus);
</script>

{#if zs.visible}
	<div class="zone-panel" role="dialog" aria-label="Zone status">
		<header>
			<span>Zone query</span>
			<button type="button" onclick={() => micropolisReactive.clearZoneStatus()}>×</button>
		</header>
		<dl>
			<div><dt>Tile</dt><dd>{zs.x}, {zs.y}</dd></div>
			<div><dt>Category</dt><dd>{zs.tileCategory}</dd></div>
			<div><dt>Density</dt><dd>{zs.populationDensity}</dd></div>
			<div><dt>Land value</dt><dd>{zs.landValue}</dd></div>
			<div><dt>Crime</dt><dd>{zs.crimeRate}</dd></div>
			<div><dt>Pollution</dt><dd>{zs.pollution}</dd></div>
			<div><dt>Growth</dt><dd>{zs.growthRate}</dd></div>
		</dl>
	</div>
{/if}

<style>
	.zone-panel {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 20;
		width: 11rem;
		background: rgba(8, 12, 20, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 8px;
		color: #eef2ff;
		font-size: 0.78rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0.55rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		font-weight: 600;
	}

	header button {
		border: none;
		background: transparent;
		color: inherit;
		font-size: 1.1rem;
		cursor: pointer;
		line-height: 1;
	}

	dl {
		margin: 0;
		padding: 0.45rem 0.55rem 0.6rem;
	}

	div {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.12rem 0;
	}

	dt {
		opacity: 0.75;
	}

	dd {
		margin: 0;
		font-family: ui-monospace, monospace;
	}
</style>
