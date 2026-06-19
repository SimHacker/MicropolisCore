<script lang="ts">
	// VitaMoo playing surface — placeholder until mooshow is wired here from the monorepo.
	import type { PageServerData } from './$types';
	let { data }: { data: PageServerData } = $props();
	const pageHeadTitle = $derived(data?.node?.title ?? 'The Sims');
	const pageDescription = $derived(data?.node?.description ?? '');
</script>

<svelte:head>
	<title>{pageHeadTitle}</title>
	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}
</svelte:head>

<div class="sims-play-placeholder">
	<h1>VitaMoo — Sims 1 characters in the browser</h1>
	<p>
		The standalone VitaMooSpace demo (WebGPU, mooshow, content exchange) currently ships from the SimObliterator
		Suite repo. This route will host the same experience inside this combined Micropolis + Sims site once the
		<code>vitamoo</code> workspace packages are merged here.
	</p>
	<p class="actions">
		<a class="primary" href="https://vitamoo.space/" target="_blank" rel="noopener noreferrer">
			Open VitaMooSpace (current deployment)
		</a>
		<a class="secondary" href="/play/micropolis">Micropolis City</a>
	</p>
</div>

<style>
	.sims-play-placeholder {
		max-width: 42rem;
		margin: 0 auto;
		padding: 3rem 1.5rem 2rem;
		line-height: 1.55;
		color: #eef2ff;
	}

	h1 {
		font-size: 1.35rem;
		margin-bottom: 0.75rem;
	}

	p {
		margin: 0 0 0.85rem;
	}

	code {
		font-size: 0.92em;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.12);
		color: #ffffff;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		align-items: center;
		margin-top: 1.25rem;
	}

	.actions a {
		display: inline-block;
		padding: 0.45em 0.85em;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		border: 1px solid transparent;
	}

	a.primary {
		background: var(--rci-C-blue, #0080ff);
		color: #fff;
	}

	a.primary:hover {
		filter: brightness(1.06);
	}

	a.secondary {
		background: #243048;
		color: #ffffff;
		border: 2px solid var(--rci-R-green, #00c000);
	}

	a.secondary:hover {
		background: #2d4060;
		border-color: #40e040;
		color: #ffffff;
	}
</style>
