<script>
    import { siteStructure } from '$lib/navigationTree';
    
    // Filter for pages with content
    const pageNodes = siteStructure.filter(node => 
        node.url.startsWith('/pages/') && 
        node.contentSlug && 
        !node.hideFromNav
    );
</script>

<svelte:head>
    <title>Pages Index - Micropolis</title>
    <meta name="description" content="Index of Micropolis content pages" />
</svelte:head>

<h1>Micropolis Content Pages</h1>
<p>Browse all content pages from the Micropolis Web project.</p>

<div class="pages-index">
    <ul class="page-list">
        {#each pageNodes as node}
            <li>
                <div class="section-container">
                    <a href={node.url} class="page-link">
                        <h2 class="section-header">{node.title}</h2>
                        {#if node.description}
                            <p>{node.description}</p>
                        {/if}
                    </a>
                </div>
                
                {#if node.children && node.children.length > 0}
                    <ul class="sub-page-list">
                        {#each node.children.filter(child => !child.hideFromNav) as childNode}
                            <li>
                                <div class="section-container">
                                    <a href={childNode.url} class="page-link">
                                        <h2 class="section-header">{childNode.title}</h2>
                                        {#if childNode.description}
                                            <p>{childNode.description}</p>
                                        {/if}
                                    </a>
                                </div>
                                
                                {#if childNode.children && childNode.children.length > 0}
                                    <ul class="sub-sub-page-list">
                                        {#each childNode.children.filter(grandchild => !grandchild.hideFromNav) as grandchildNode}
                                            <li>
                                                <div class="section-container">
                                                    <a href={grandchildNode.url} class="page-link">
                                                        <h2 class="section-header">{grandchildNode.title}</h2>
                                                        {#if grandchildNode.description}
                                                            <p>{grandchildNode.description}</p>
                                                        {/if}
                                                    </a>
                                                </div>
                                            </li>
                                        {/each}
                                    </ul>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {/if}
            </li>
        {/each}
    </ul>
</div>

<style>
    .pages-index {
        max-width: 900px;
        margin: 0 auto;
    }
    
    .page-list, .sub-page-list, .sub-sub-page-list {
        list-style-type: disc;
        padding-left: 1.5em;
        margin: 0.25em 0;
    }
    
    /* Consistent margins for all list levels - REDUCED SPACING EVEN MORE */
    .page-list > li,
    .sub-page-list > li,
    .sub-sub-page-list > li {
        margin-bottom: 0.3em;
        padding-bottom: 0.1em;
    }
    
    /* Only add border to top-level items */
    .page-list > li {
        border-bottom: 1px solid #eee;
        padding-bottom: 0.4em;
        margin-bottom: 0.5em;
    }
    
    /* Section container to better align header and description */
    .section-container {
        display: block;
    }
    
    /* Header styling */
    .section-header {
        font-size: 1.2em;
        font-weight: bold;
        margin: 0.1em 0 0 0;
        padding: 0;
        color: #007700;
        line-height: 1.2;
        display: inline;
    }
    
    /* Description styling to display inline with header */
    p {
        margin: 0 0 0 0.4em;
        color: #555;
        line-height: 1.2;
        display: inline;
    }
    
    /* Indent each level - MINIMAL MARGINS */
    .sub-page-list {
        margin-left: 1em;
        margin-top: 0.1em;
        margin-bottom: 0.1em;
    }
    
    .sub-sub-page-list {
        margin-left: 1em;
        margin-top: 0.1em;
        margin-bottom: 0.1em;
    }
    
    /* Link styling - MINIMAL PADDING */
    .page-link {
        display: block;
        padding: 0 0.5em;
        border-radius: 4px;
        text-decoration: none;
        color: inherit;
        margin-bottom: 0;
    }
    
    .page-link:hover {
        background-color: #f5f5f5;
    }
</style> 