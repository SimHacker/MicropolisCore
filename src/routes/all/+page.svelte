<script>
    import AllContentNode from '$lib/components/AllContentNode.svelte';

    export let data; // { tree, contentMap }

    function generateId(slug) {
        return `content-${slug}`.replace(/[^a-zA-Z0-9-_]/g, '_');
    }

    function buildToc(node) {
        if (!node || !node.slug || node.excludeFromAll) return null;
        const item = {
            title: node.title,
            href: `#${generateId(node.slug)}`,
            children: []
        };
        if (node.children) {
            item.children = node.children
                .filter(child => !child.excludeFromAll)
                .map(buildToc)
                .filter(Boolean);
        }
        return item;
    }

    let toc = [];
    $: toc = data?.tree?.children
                ? data.tree.children
                    .filter(child => !child.excludeFromAll)
                    .map(buildToc)
                    .filter(Boolean)
                : [];

</script>

<h1>All Content</h1>

<!-- Optional Table of Contents -->
<nav class="toc" aria-labelledby="toc-heading">
    <h2 id="toc-heading">Table of Contents</h2>
    <ul>
        {#each toc as item}
            <li>
                <a href={item.href}>{item.title}</a>
                {#if item.children && item.children.length > 0}
                    <ul>
                        {#each item.children as subItem}
                            <li>
                                <a href={subItem.href}>{subItem.title}</a>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </li>
        {/each}
    </ul>
</nav>

<hr />

<!-- Render the entire tree -->
{#if data?.tree?.children}
    {#each data.tree.children as topLevelNode (topLevelNode.slug)}
        {#if !topLevelNode.excludeFromAll}
            <!-- Pass empty parent path for top-level nodes -->
            <AllContentNode node={topLevelNode} contentMap={data.contentMap} level={2} parentPathSegments={[]} />
        {/if}
    {/each}
{:else}
    <p>No content defined in the navigation tree.</p>
{/if}

<style>
    .toc {
        border: 1px solid #ccc;
        padding: 1em;
        margin-bottom: 2em;
        background-color: #f9f9f9;
    }
    .toc ul {
        list-style: none;
        padding-left: 1.5em;
    }
    .toc ul ul {
        padding-left: 1.5em;
    }
    .toc li {
        margin-bottom: 0.3em;
    }
    .toc a {
        text-decoration: none;
        color: #007bff;
    }
    .toc a:hover {
        text-decoration: underline;
    }
    hr {
        margin: 2em 0;
    }
</style> 