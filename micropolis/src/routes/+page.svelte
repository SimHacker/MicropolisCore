<script lang="ts">
	// src/routes/+page.svelte
	// Renders the home page with TileView component
	import TileView from '$lib/TileView.svelte';
	import MicropolisView from '$lib/MicropolisView.svelte';
	import { onMount, onDestroy } from 'svelte';

	/**
	 * @typedef {import('$lib/navigationTree').siteStructure[0]} NavNode
	 */

	/** @type {{ node: NavNode, fullPath: Array<NavNode>, siteStructure: Array<NavNode> }} */
	export let data;

	// Extract title, header, description for the index page itself
	let pageHeadTitle = '';
	$: pageHeadTitle = data?.node?.title || 'Micropolis Web'; // Fallback title
	let pageHeader = '';
	$: pageHeader = data?.node?.header || pageHeadTitle; // Use header field, fallback to title
	let pageDescription = '';
	$: pageDescription = data?.node?.description || '';
	
	// Home page container element reference
	let containerElement: HTMLDivElement;
	let resizeListener: (() => void) | null = null;
	
	// Function to resize the game container to fill space between header and footer
	function resizeGameContainer() {
		if (!containerElement) return;
		
		// Get header and footer heights
		const header = document.querySelector('.navigation-area');
		const footer = document.querySelector('.site-footer');
		
		if (!header || !footer) return;
		
		const headerHeight = header.getBoundingClientRect().height;
		const footerHeight = footer.getBoundingClientRect().height;
		
		// Calculate available height
		const availableHeight = window.innerHeight - headerHeight - footerHeight;
		
		// Set container height to fill available space
		containerElement.style.height = `${Math.max(availableHeight, 400)}px`;
	}
	
	onMount(() => {
		// Set up resize listener
		if (typeof window !== 'undefined') {
			resizeListener = () => {
				requestAnimationFrame(resizeGameContainer);
			};
			
			window.addEventListener('resize', resizeListener);
			
			// Initial resize after a short delay to ensure elements are rendered
			setTimeout(resizeGameContainer, 100);
		}
	});
	
	onDestroy(() => {
		// Clean up resize listener
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

<!-- Render the Micropolis TileView component -->
<div class="micropolis-container" bind:this={containerElement}>
	<MicropolisView />
</div>

<style>
	.micropolis-container {
		width: 100%;
		height: calc(100vh - 180px); /* Default fallback calculation */
		min-height: 500px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		overflow: visible;
		position: relative;
		flex-grow: 1; /* Allow container to expand and fill available space */
	}
</style>
