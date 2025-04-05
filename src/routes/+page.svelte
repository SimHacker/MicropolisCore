<script>
    // src/routes/+page.svelte
    // Renders the content for the root ("/") page, loaded from Jekyll.

    // Import page store if needed for context, but maybe not directly used here.
    // import { page } from '$app/stores';

    // Data loaded by +page.server.js: { node, fullPath, pageContent }
    export let data;

    // Extract title, header, description from the node data
    let pageHeadTitle = '';
    $: pageHeadTitle = data?.node?.title || 'Micropolis Web'; // Fallback title
    let pageHeader = '';
    $: pageHeader = data?.node?.header || pageHeadTitle; // Use header field, fallback to title
    let pageDescription = '';
    $: pageDescription = data?.node?.description || '';

</script>

<svelte:head>
    <title>{pageHeadTitle}</title>
    {#if pageDescription}
        <meta name="description" content={pageDescription} />
    {/if}
</svelte:head>

<!-- Render the page content -->
<h1 class="content-title">{pageHeader}</h1>

{#if pageDescription}
    <p class="content-description">{pageDescription}</p>
{/if}

<!-- Render the loaded HTML content from Jekyll -->
<div class="markdown-content">
    {@html data?.pageContent || '<p>Welcome to Micropolis Web!</p>'}
</div>

<style>
    /* Minimal styles, can inherit from global or add specifics */
    .content-title {
        margin-bottom: 0.25em;
    }
    .content-description {
        font-size: 1.1em;
        color: #555;
        margin-top: 0;
        margin-bottom: 1.5em;
        font-style: italic;
    }
    .markdown-content {
        /* Add specific styles if needed, or rely on global styles */
    }

    /* Define global selectors if not already defined elsewhere */
     .markdown-content :global(h1),
     .markdown-content :global(h2),
     .markdown-content :global(h3) {
         margin-top: 1.5em; margin-bottom: 0.5em; font-weight: bold;
     }
     .markdown-content :global(img) {
         max-width: 100%; height: auto; margin-top: 1em; margin-bottom: 1em; border: 1px solid #ccc;
     }

</style> 