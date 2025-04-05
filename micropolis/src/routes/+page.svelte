<script>
	// src/routes/+page.svelte
	// Renders a dynamic site index based on the siteStructure.

	/**
	 * @typedef {import('$lib/navigationTree.js').siteStructure[0]} NavNode
	 */

	/** @type {{ node: NavNode, fullPath: Array<NavNode>, siteStructure: Array<NavNode> }} */
	export let data;

	// Extract title, header, description for the index page itself
	let pageHeadTitle = '';
	$: pageHeadTitle = data?.node?.title || 'Site Index'; // Fallback title
	let pageHeader = '';
	$: pageHeader = data?.node?.header || pageHeadTitle; // Use header field, fallback to title
	let pageDescription = '';
	$: pageDescription = data?.node?.description || '';

	// Placeholder: We will need a recursive component to render the list
	// import NodeList from './_NodeList.svelte'; // Import will be needed later
</script>

<svelte:head>
	<title>{pageHeadTitle}</title>
	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}
</svelte:head>

<!-- Render the page header and description -->
<h1 class="content-title">{pageHeader}</h1>

{#if pageDescription}
	<p class="content-description">{pageDescription}</p>
{/if}

<!-- Render the dynamic site index -->
<div class="site-index">
	{#if data?.siteStructure && data.siteStructure.length > 0}
		<p><em>Site Index rendering logic goes here...</em></p>
		<!-- Later: <NodeList nodes={data.siteStructure} /> -->
		<!-- Temporary dump for verification -->
		<pre>{JSON.stringify(data.siteStructure.map(n => ({ url: n.url, title: n.title })), null, 2)}</pre>
	{:else}
		<p>Site structure not available or empty.</p>
	{/if}
</div>

<!-- Removed previous HTML rendering logic -->
<!-- <div class="markdown-content">
    {@html data?.pageContent || '<p>Welcome to Micropolis Web!</p>'}
</div> -->

<style>
	.content-title {
		margin-bottom: 0.25em;
		border-bottom: 1px solid #ccc;
		padding-bottom: 0.25em;
	}
	.content-description {
		font-size: 1.1em;
		color: #555;
		margin-top: 0;
		margin-bottom: 1.5em;
		font-style: italic;
	}
	.site-index {
		/* Add styling for the index container if needed */
	}
	/* Styles for the NodeList component would go in _NodeList.svelte */
	pre {
		background-color: #eee;
		padding: 1em;
		border-radius: 4px;
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
