<script>
    export let node;
    export let contentMap;
    export let level = 1; // Start heading level at 1 (or 2 if /all has its own H1)
    export let parentPathSegments = []; // Receive parent path from caller

    // Recursive import
    import AllContentNode from './AllContentNode.svelte';

    // Helper to generate anchor IDs using path segments
    function generateNodeId(currentPathSegments) {
        if (!currentPathSegments || currentPathSegments.length === 0) return null;
        const slug = currentPathSegments.join('_'); // Use underscore separator
        return `content-${slug}`.replace(/[^a-zA-Z0-9-_]/g, '_');
    }

    let currentNodePathSegments = [];
    $: currentNodePathSegments = node?.slug ? [...parentPathSegments, node.slug] : parentPathSegments;

    let nodeId;
    // Use the full path segments to generate the ID, matching the server-side logic
    $: nodeId = generateNodeId(currentNodePathSegments);

    let headerText = '';
    $: headerText = node?.header || node?.title || 'Untitled Section'; // Use header, fallback to title

    let descriptionText = '';
    $: descriptionText = node?.description || '';

    let contentHtml = '';
    $: contentHtml = node?.contentSlug ? (contentMap[node.contentSlug] || '') : '';

</script>

{#if node && !node.excludeFromAll}
    <section class="content-node level-{level}">
        <!-- Render Heading with generated ID -->
        <svelte:element this={`h${level}`} id={nodeId}>
            {headerText}
        </svelte:element>

        <!-- Render Description -->
        {#if descriptionText}
            <p class="content-description">{descriptionText}</p>
        {/if}

        <!-- Render Content -->
        {#if contentHtml}
            <div class="node-content markdown-content">
                {@html contentHtml}
            </div>
        {/if}

        <!-- Render Children -->
        {#if node.children && node.children.length > 0}
            <div class="node-children">
                {#each node.children as childNode (childNode.slug)}
                    <!-- Pass the current node's path down to children -->
                    <AllContentNode node={childNode} {contentMap} level={level + 1} parentPathSegments={currentNodePathSegments} />
                {/each}
            </div>
        {/if}
    </section>
{/if}

<style>
    .content-node {
        margin-bottom: 2em;
        padding-left: 1em; /* Indent nested sections */
        border-left: 2px solid #eee; /* Visual indicator of nesting */
    }
    .content-node.level-1 {
        padding-left: 0;
        border-left: none;
    }
    /* Add more level-specific styles if needed */

    .node-content {
        margin-top: 0.5em;
    }

    .node-children {
        margin-top: 1em;
    }

    /* Basic markdown styles (can be inherited or defined globally too) */
    .markdown-content :global(h1), /* Styles for headings within the loaded HTML */
    .markdown-content :global(h2),
    .markdown-content :global(h3),
    .markdown-content :global(h4),
    .markdown-content :global(h5),
    .markdown-content :global(h6) {
      /* Maybe reset styles if they conflict with the main H tags */
      /* font-size: 1em; */
      /* font-weight: normal; */
    }
    .markdown-content :global(img) {
        max-width: 100%;
        height: auto;
        border: 1px solid #ccc;
        margin: 1em 0;
    }

    /* Add styles for description if needed, or use global */
    .content-description {
        font-size: 1.1em;
        color: #555;
        margin-top: 0.3em;
        margin-bottom: 1em;
        font-style: italic;
    }
</style> 