<script lang="ts">
    export let data: {
        tree: Array<any>;
        contentMap: Record<string, string>;
        anchors: Record<string, {title: string, url: string}>;
    };

    // Convert a URL path to an anchor ID - must match server-side function
    function urlToAnchorId(url: string): string {
        // Remove leading slash, replace slashes with underscores, ensure it starts with a letter
        // HTML5 IDs must begin with a letter (a-z or A-Z) and can be followed by letters, digits, hyphens, underscores, colons, and periods.
        const sanitized = url.replace(/^\//, '').replace(/\//g, '_');
        return 'nav_' + sanitized;
    }

    // Helper function to safely check properties
    function isNodeVisible(node: any): boolean {
        return (
            node.contentSlug && 
            (!node.excludeFromAll) && 
            (!node.external)
        );
    }
</script>

<svelte:head>
    <title>All Content - Micropolis</title>
    <meta name="description" content="All Micropolis Web Content on a single page." />
</svelte:head>

<div class="all-content-container">
    <h1>All Micropolis Content</h1>
    <p class="intro">This page contains all Micropolis content displayed on a single page for easy reading, printing, or searching.</p>

    <!-- Hidden anchor points to ensure all IDs exist that might be referenced -->
    <div aria-hidden="true" class="hidden-anchors">
        {#if data.anchors}
            {#each Object.entries(data.anchors) as [id, info]}
                <div {id} class="anchor-target" title={info.title}></div>
            {/each}
        {/if}
    </div>

    <!-- Table of Contents - Always shown -->
    <div class="table-of-contents print-friendly">
        <h2>Contents</h2>
        <ul class="toc-list">
            {#each data.tree as node}
                {#if isNodeVisible(node)}
                    <li>
                        <a href="#{urlToAnchorId(node.url)}">{node.title}</a>
                        {#if node.children && node.children.length > 0}
                            <ul>
                                {#each node.children as childNode}
                                    {#if isNodeVisible(childNode)}
                                        <li>
                                            <a href="#{urlToAnchorId(childNode.url)}">{childNode.title}</a>
                                            {#if childNode.children && childNode.children.length > 0}
                                                <ul>
                                                    {#each childNode.children as grandchildNode}
                                                        {#if isNodeVisible(grandchildNode)}
                                                            <li>
                                                                <a href="#{urlToAnchorId(grandchildNode.url)}">{grandchildNode.title}</a>
                                                            </li>
                                                        {/if}
                                                    {/each}
                                                </ul>
                                            {/if}
                                        </li>
                                    {/if}
                                {/each}
                            </ul>
                        {/if}
                    </li>
                {/if}
            {/each}
        </ul>
    </div>

    <!-- Content sections -->
    <div class="content-sections">
        {#each data.tree as node}
            {#if isNodeVisible(node)}
                <section id="{urlToAnchorId(node.url)}" class="content-section level-1">
                    <h2>{node.header || node.title}</h2>
                    {#if node.description}
                        <p class="description">{node.description}</p>
                    {/if}
                    
                    {#if data.contentMap[node.contentSlug]}
                        <div class="markdown-content">
                            {@html data.contentMap[node.contentSlug]}
                        </div>
                    {/if}
                    
                    {#if node.children && node.children.length > 0}
                        {#each node.children as childNode}
                            {#if isNodeVisible(childNode)}
                                <section id="{urlToAnchorId(childNode.url)}" class="content-section level-2">
                                    <h3>{childNode.header || childNode.title}</h3>
                                    {#if childNode.description}
                                        <p class="description">{childNode.description}</p>
                                    {/if}
                                    
                                    {#if data.contentMap[childNode.contentSlug]}
                                        <div class="markdown-content">
                                            {@html data.contentMap[childNode.contentSlug]}
                                        </div>
                                    {/if}

                                    {#if childNode.children && childNode.children.length > 0}
                                        {#each childNode.children as grandchildNode}
                                            {#if isNodeVisible(grandchildNode)}
                                                <section id="{urlToAnchorId(grandchildNode.url)}" class="content-section level-3">
                                                    <h4>{grandchildNode.header || grandchildNode.title}</h4>
                                                    {#if grandchildNode.description}
                                                        <p class="description">{grandchildNode.description}</p>
                                                    {/if}
                                                    
                                                    {#if data.contentMap[grandchildNode.contentSlug]}
                                                        <div class="markdown-content">
                                                            {@html data.contentMap[grandchildNode.contentSlug]}
                                                        </div>
                                                    {/if}
                                                </section>
                                            {/if}
                                        {/each}
                                    {/if}
                                </section>
                            {/if}
                        {/each}
                    {/if}
                </section>
            {/if}
        {/each}
    </div>
</div>

<style>
    .all-content-container {
        max-width: 1200px; 
        margin: 0 auto;
    }

    /* Hide the hidden anchors but keep them in the DOM */
    .hidden-anchors {
        position: absolute;
        height: 0;
        width: 0;
        overflow: hidden;
        visibility: hidden;
    }

    .anchor-target {
        display: block;
        height: 1px;
        width: 1px;
    }

    .table-of-contents {
        background-color: #f7f7f7;
        padding: 1em;
        margin-bottom: 2em;
        border: 1px solid #ddd;
        border-radius: 6px;
    }

    /* Print-friendly TOC style */
    @media print {
        .table-of-contents {
            background-color: transparent;
            border: 1px solid #ccc;
            padding: 0.5em;
            page-break-inside: avoid;
        }
    }

    .toc-list ul {
        margin-left: 1.5em;
    }

    .content-section {
        margin-bottom: 3em;
        border-bottom: 1px solid #eee;
        padding-bottom: 2em;
    }

    .level-1 > h2 {
        font-size: 1.8em;
        color: #333;
        border-bottom: 2px solid #007700;
        padding-bottom: 0.3em;
    }

    .level-2 {
        margin-left: 1em;
        margin-top: 2em;
    }

    .level-2 > h3 {
        font-size: 1.5em;
        color: #444;
        border-bottom: 1px solid #aaa;
        padding-bottom: 0.2em;
    }

    .level-3 {
        margin-left: 1em;
        margin-top: 1.5em;
    }

    .level-3 > h4 {
        font-size: 1.3em;
        color: #555;
    }

    .description {
        font-style: italic;
        color: #666;
        margin-bottom: 1em;
    }

    /* Styles for markdown content */
    .markdown-content :global(h1),
    .markdown-content :global(h2),
    .markdown-content :global(h3) {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
    }

    .markdown-content :global(img) {
        max-width: 100%;
        height: auto;
        margin: 1em 0;
    }

    .intro {
        font-size: 1.1em;
        margin-bottom: 2em;
    }

    /* Print-specific styles */
    @media print {
        .all-content-container {
            max-width: none;
        }
        
        .content-section {
            page-break-before: always;
        }
        
        h1, h2, h3, h4 {
            page-break-after: avoid;
        }
        
        .level-1:first-of-type {
            page-break-before: auto;
        }
    }
</style> 