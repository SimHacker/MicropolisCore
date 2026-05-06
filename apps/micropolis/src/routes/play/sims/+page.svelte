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
		<a class="secondary" href="/play/micropolis">Micropolis city view</a>
		<a class="secondary" href="/">Home</a>
	</p>
</div>

<style>
	.sims-play-placeholder {
		max-width: 42rem;
		padding: 1rem 1.5rem 2rem;
		line-height: 1.55;
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
		background: rgba(0, 0, 0, 0.06);
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
		background: var(--color-bg-2, #f0f0f0);
		color: inherit;
		border-color: rgba(0, 0, 0, 0.12);
	}

	a.secondary:hover {
		background: #e6e6e6;
	}
</style>
