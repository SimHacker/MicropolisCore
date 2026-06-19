<script lang="ts">
	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();
	const pageHeadTitle = $derived(data?.node?.title ?? 'Micropolis');
	const pageDescription = $derived(data?.node?.description ?? '');
</script>

<svelte:head>
	<title>{pageHeadTitle}</title>
	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}
</svelte:head>

<div class="hub">
	<p class="lede">
		Experimental playground for <strong>Micropolis</strong> (city tiles / WASM) and <strong>The Sims</strong> mesh
		animation (VitaMoo). Shared chrome, pie menus, and tabbed windows will grow from here.
	</p>

	<ul class="cards">
		<li>
			<a href="/play/micropolis" class="card micropolis">
				<span class="card-title">Micropolis City</span>
				<span class="card-desc">Pan and zoom the tile engine; WebGL / WebGPU renderers.</span>
			</a>
		</li>
		<li>
			<a href="/play/sims" class="card sims">
				<span class="card-title">The Sims</span>
				<span class="card-desc">VitaMoo character demo — WebGPU, mooshow (embed in progress).</span>
			</a>
		</li>
	</ul>
</div>

<style>
	.hub {
		max-width: 44rem;
		margin: 0 auto;
		padding: 1rem 0 2rem;
	}

	.lede {
		font-size: 1.05rem;
		line-height: 1.55;
		margin: 0 0 1.5rem;
	}

	.cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 520px) {
		.cards {
			grid-template-columns: 1fr 1fr;
		}
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1rem 1.1rem;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		min-height: 6.5rem;
		border: 2px solid rgba(0, 0, 0, 0.12);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.card.micropolis {
		border-color: var(--rci-R-green, #00c000);
		background: linear-gradient(145deg, rgba(0, 192, 0, 0.08), transparent 55%);
	}

	.card.sims {
		border-color: var(--rci-C-blue, #0080ff);
		background: linear-gradient(145deg, rgba(0, 128, 255, 0.08), transparent 55%);
	}

	.card-title {
		font-weight: 700;
		font-size: 1.15rem;
	}

	.card-desc {
		font-size: 0.92rem;
		line-height: 1.45;
		opacity: 0.92;
	}
</style>
