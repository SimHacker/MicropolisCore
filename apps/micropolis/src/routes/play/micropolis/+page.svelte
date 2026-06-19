<script lang="ts">
	import MicropolisView from '$lib/MicropolisView.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	const pageHeadTitle = $derived(data?.node?.title ?? 'Micropolis City');
	const pageDescription = $derived(data?.node?.description ?? '');
</script>

<svelte:head>
	<title>{pageHeadTitle}</title>
	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}
</svelte:head>

<div class="micropolis-container">
	<MicropolisView />
</div>

<style>
	.micropolis-container {
		position: relative;
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
