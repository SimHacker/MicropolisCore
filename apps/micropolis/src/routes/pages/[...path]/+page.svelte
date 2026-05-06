<script lang="ts">
    import type { PageServerData } from './$types';
    let { data }: { data: PageServerData } = $props();
    const pageHeadTitle = $derived(data?.title ?? 'Page');
    const pageHeader = $derived(data?.header ?? pageHeadTitle);
    const pageDescription = $derived(data?.description ?? '');
</script>

<svelte:head>
    <title>{pageHeadTitle} - Micropolis</title>
    {#if pageDescription}
        <meta name="description" content={pageDescription} />
    {/if}
</svelte:head>

<!-- Default Rendering -->

<!-- Sub-Navigation was moved to layout -->

<!-- Page Header (H1) -->
<h1 class="content-title">{pageHeader}</h1>

<!-- Page Description (Subtitle) -->
{#if pageDescription}
    <p class="content-description">{pageDescription}</p>
{/if}

<!-- Page Content -->
<div class="markdown-content">
    <!-- Directly render HTML -->
    {@html data?.pageContent || '<p>Content not available.</p>'}
</div>

<style>
    /* Keep page-specific styles */
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

    /* Keep markdown content styles */
    .markdown-content :global(h1),
    .markdown-content :global(h2),
    .markdown-content :global(h3) {
        margin-top: 1.5em; margin-bottom: 0.5em; font-weight: bold;
    }
    .markdown-content :global(img) {
        max-width: 100%; height: auto; margin-top: 1em; margin-bottom: 1em; border: 1px solid #ccc;
    }
</style> 