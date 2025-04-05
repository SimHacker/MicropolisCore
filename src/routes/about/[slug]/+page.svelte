<!-- src/routes/about/[slug]/+page.svelte -->
<script>
    export let data;

    // Basic processing: remove potential header/footer if they exist
    // and handle cases where content might be missing.
    let contentToRender = '';
    $: {
        if (data && data.contentHtml) {
            try {
                // Attempt to find body content, default to full HTML if no body tag
                const bodyMatch = data.contentHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                contentToRender = bodyMatch ? bodyMatch[1].trim() : data.contentHtml.trim();

                // Optional: remove specific Jekyll header/footer if necessary
                // contentToRender = contentToRender.replace(/<header[^>]*>[\s\S]*?<\/header>/i, '');
                // contentToRender = contentToRender.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, '');
            } catch (e) {
                console.error("Error processing contentHtml:", e);
                contentToRender = '<p>Error displaying content.</p>';
            }
        } else {
            contentToRender = '<p>Content not available.</p>';
        }
    }

</script>

{#if data?.slug}
    <!-- Optional: Render a title based on the slug -->
    <!-- <h1>{data.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1> -->
{/if}

<div class="markdown-content">
    {@html contentToRender}
</div>

<style>
    /* Add styles for the rendered markdown content if needed */
    .markdown-content :global(h1),
    .markdown-content :global(h2),
    .markdown-content :global(h3) {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }

    .markdown-content :global(img) {
        max-width: 100%;
        height: auto;
        margin-top: 1em;
        margin-bottom: 1em;
        border: 1px solid #ccc;
    }

    /* Add other markdown element styles as required */
</style> 