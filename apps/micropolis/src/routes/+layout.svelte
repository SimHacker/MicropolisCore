<script lang="ts">
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import PlayBackButton from '$lib/PlayBackButton.svelte';
	import './styles.css';
	import { page } from '$app/state';
	let { children } = $props();
	import { findNodeByUrl } from '$lib/navigationTree';
	import type { SiteNode } from '$lib/navigationTree';

	// TODO(virtual-cursor): PointerGrabToggle + pointer store → CursorLayer on map routes.
	//   DESIGN: virtual-cursor-layer.md §7; map-compositing-and-measurement.md §3.2
	//   CursorLayer coordinates WebGPU plugins + conditional DOM (not cursor pixels in DOM).

	const isPlayRoute = $derived(page.url.pathname.startsWith('/play/'));

	const currentNodeData = $derived(findNodeByUrl(page.url.pathname));
	const currentPath = $derived(currentNodeData?.fullPath ?? []);
	const activeFirstLevel = $derived(currentPath[0] ?? null);
	const activeSecondLevel = $derived(currentPath[1] ?? null);

	function shouldShowChildren(node: SiteNode): boolean {
		return currentPath.includes(node) || node.showSubTabs === true;
	}

	const showSecondLevel = $derived(
		!isPlayRoute && !!(activeFirstLevel && shouldShowChildren(activeFirstLevel))
	);
	const showThirdLevel = $derived(
		!isPlayRoute && !!(activeSecondLevel && shouldShowChildren(activeSecondLevel))
	);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<div class="app-container" class:play-mode={isPlayRoute}>
	{#if isPlayRoute}
		<PlayBackButton />
	{:else}
		<div class="navigation-area">
			<Header />

			<!-- Second level navigation - only show for active first level node -->
		{#if showSecondLevel && (activeFirstLevel?.children ?? []).length > 0}
				<nav class="sub-nav dynamic-nav second-level">
					<ul>
			{#each (activeFirstLevel?.children ?? []) as childNode}
							{@const href = childNode.url}
							{#if href && !childNode.hideFromNav}
				{@const isActive = currentPath.includes(childNode as SiteNode) || currentPath.some((node: SiteNode) => node.url?.startsWith((childNode as SiteNode).url + '/'))}
								<li><a {href} class:active={isActive} title={childNode.tooltip || ''}>
									<span class="tab-label">{@html childNode.title.replace(' ', '<br/>')}</span>
								</a></li>
							{/if}
						{/each}
					</ul>
				</nav>
			{/if}

			<!-- Third level navigation - only show for active second level node -->
		{#if showThirdLevel && (activeSecondLevel?.children ?? []).length > 0}
				<nav class="sub-nav dynamic-nav third-level">
					<ul>
			{#each (activeSecondLevel?.children ?? []) as childNode}
							{@const href = childNode.url}
							{#if href && !childNode.hideFromNav}
				{@const isActive = currentPath.includes(childNode as SiteNode)}
								<li><a {href} class:active={isActive} title={childNode.tooltip || ''}>
									<span class="tab-label">{@html childNode.title.replace(' ', '<br/>')}</span>
								</a></li>
							{/if}
						{/each}
					</ul>
				</nav>
			{/if}
		</div>
	{/if}

	<main class="content-area" class:play-fullscreen={isPlayRoute}>
		{@render children()}
	</main>

	{#if !isPlayRoute}
		<Footer />
	{/if}

	<!-- TODO(virtual-cursor): map chrome (labels/dialogs) above holodeck canvas — not cursor pixels -->
</div>

<style>
	/* Styles for dynamic-nav are needed here now */
	nav.dynamic-nav {
		background-color: var(--rci-dirt-bg); /* Use CSS variable for consistent brown */
		padding: 0.4em; /* DOUBLED padding inside all rows */
		display: flex;
		justify-content: flex-start; /* LEFT justify tabs */
		font-weight: 600;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		position: relative;
	}
	
	/* Different THICK borders AROUND THE ENTIRE ROW for each level */
	nav.dynamic-nav {
		border: 5px solid var(--rci-R-green, #0c0); /* Thick Green border ALL AROUND */
		margin-bottom: 0; /* No space between rows */
	}
	
	nav.dynamic-nav.second-level {
		border: 5px solid var(--rci-C-blue, #0080ff); /* Thick Blue border ALL AROUND */
		margin-bottom: 0; /* No space between rows */
	}
	
	nav.dynamic-nav.third-level {
		border: 5px solid var(--rci-I-yellow, #ffc800); /* Thick Yellow border ALL AROUND */
		margin-bottom: 0; /* No space between rows */
	}

	nav.dynamic-nav ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: center;
		list-style: none;
		width: 100%;
		padding: 0;
		margin: 0;
		gap: 0.4em;
	}
	
	nav.dynamic-nav li {
		margin: 0;
		display: inline-block;
		vertical-align: middle;
	}
	
	/* ALL tabs styled identically except for color */
	nav.dynamic-nav a {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		text-decoration: none !important;
		padding: 0.4em 0.8em;
		line-height: 1.2;
		font-size: 0.85rem;
		min-width: 70px;
		min-height: 2.75em;
		box-sizing: border-box;
		border-radius: 4px;
		border: 1px solid transparent;
		box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
		color: var(--rci-text-light);
		background-color: transparent;
		transition: background-color 0.15s linear, color 0.15s linear, box-shadow 0.15s linear;
		font-weight: 600;
	}
	
	/* Tab label formatting */
	.tab-label {
		text-align: center;
		display: inline-block;
		line-height: 1.2;
	}
	
	/* Hover state for all tabs */
	nav.dynamic-nav a:hover {
		background-color: var(--rci-dirt-bg); /* Use CSS variable for consistent brown */
		color: #fff;
		box-shadow: 1px 1px 5px rgba(0,0,0,0.4);
		text-decoration: none !important;
	}
	
	/* Active tabs for all levels - EXACT SAME STYLING except color */
	nav.dynamic-nav a.active {
		border-color: transparent;
		color: #fff;
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
		box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3), 1px 1px 3px rgba(0,0,0,0.3);
	}
	
	/* Different active background colors for each level */
	nav.dynamic-nav a.active {
		background-color: var(--rci-R-green, #00c000);
	}
	
	nav.dynamic-nav a.active:hover {
		background-color: hsl(120, 100%, 38%);
	}
	
	nav.dynamic-nav.second-level a.active {
		background-color: var(--rci-C-blue, #0080ff);
	}
	
	nav.dynamic-nav.second-level a.active:hover {
		background-color: hsl(210, 100%, 55%);
	}
	
	nav.dynamic-nav.third-level a.active {
		background-color: var(--rci-I-yellow, #ffc800);
		color: #fff; /* WHITE text for ALL selected tabs */
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8); /* Stronger shadow for yellow */
	}
	
	nav.dynamic-nav.third-level a.active:hover {
		background-color: hsl(45, 100%, 55%);
	}

	/* Existing styles */
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh; /* Ensure container takes full viewport height */
	}

	.navigation-area {
		flex-shrink: 0; /* Prevent nav area from shrinking */
		padding: 0;
		margin: 0;
		border: none;
		position: relative; /* Ensure proper stacking */
		z-index: 10; /* Keep above game content */
	}

	.content-area {
		flex-grow: 1;
		overflow-y: auto; /* Enable scrolling for content */
		padding: 1.5em;
		background-color: var(--color-bg-2, #f0f0f0);
	}

	.content-area.play-fullscreen {
		overflow: hidden;
		padding: 0;
		margin: 0;
		background-color: #1a2030;
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100vh;
		height: 100dvh;
	}

	.app-container.play-mode {
		min-height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
	}

	.content-area.no-scroll {
		overflow-y: auto; /* Changed from hidden to auto to allow scrolling */
		padding: 0;
		background-color: transparent;
		/* Allow the content to flow naturally */
		display: flex;
		flex-direction: column;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		/* Allow normal scrolling behavior */
		overflow-x: hidden; /* Prevent horizontal scroll */
		overflow-y: auto; /* Allow vertical scrolling */
	}
	:global(*, *::before, *::after) {
		box-sizing: inherit;
	}
</style>
