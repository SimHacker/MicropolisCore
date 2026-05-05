<script lang="ts">
	// Full-screen Micropolis tile / WASM view (moved from former site home).
	import MicropolisView from '$lib/MicropolisView.svelte';
	import { onMount, onDestroy } from 'svelte';

	/**
	 * @typedef {import('$lib/navigationTree').siteStructure[0]} NavNode
	 */

	/** @type {{ node: NavNode, fullPath: Array<NavNode>, siteStructure: Array<NavNode> }} */
	export let data;

	let pageHeadTitle = '';
	$: pageHeadTitle = data?.node?.title || 'Micropolis';
	let pageHeader = '';
	$: pageHeader = data?.node?.header || pageHeadTitle;
	let pageDescription = '';
	$: pageDescription = data?.node?.description || '';

	let containerElement: HTMLDivElement;
	let resizeListener: (() => void) | null = null;

	function resizeGameContainer() {
		if (!containerElement) return;

		const header = document.querySelector('.navigation-area');
		const footer = document.querySelector('.site-footer');

		if (!header || !footer) return;

		const headerHeight = header.getBoundingClientRect().height;
		const footerHeight = footer.getBoundingClientRect().height;

		const availableHeight = window.innerHeight - headerHeight - footerHeight;

		containerElement.style.height = `${Math.max(availableHeight, 400)}px`;
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			resizeListener = () => {
				requestAnimationFrame(resizeGameContainer);
			};

			window.addEventListener('resize', resizeListener);

			setTimeout(resizeGameContainer, 100);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined' && resizeListener) {
			window.removeEventListener('resize', resizeListener);
		}
	});
</script>

<svelte:head>
	<title>{pageHeadTitle}</title>
	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}
</svelte:head>

<div class="micropolis-container" bind:this={containerElement}>
	<MicropolisView />
</div>

<style>
	.micropolis-container {
		width: 100%;
		height: calc(100vh - 180px);
		min-height: 500px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		overflow: visible;
		position: relative;
		flex-grow: 1;
	}
</style>
