<script>
    import { page } from '$app/stores';

    // --- Component Registries (Keep for future use) ---
    // import MicropolisView from '$lib/MicropolisView.svelte';
    // const injectableRegistry = { MicropolisView };
    // const overrideRegistry = {};
    // --- End Component Registries ---

    // Data loaded by +page.server.js: { node, fullPath, pageContent }
    export let data;

    // function getComponent(registry, name) {
    //     return null; // Disabled for now
    // }

    // Base path no longer needed as children have absolute URLs

    // Override logic can stay, it reads from node metadata if present
    // let OverrideComponent = null;
    // $: OverrideComponent = getComponent(overrideRegistry, data?.node?.overrideComponent);

    // Use node.title for <title>, node.header for H1
    let pageHeadTitle = '';
    $: pageHeadTitle = data?.node?.title || 'Page'; // Use shorter title for browser tab
    let pageHeader = '';
    $: pageHeader = data?.node?.header || pageHeadTitle; // Use header field, fallback to title

</script>

<svelte:head>
    <title>{pageHeadTitle} - Micropolis</title>
    {#if data?.node?.description}
        <meta name="description" content={data.node.description} />
    {/if}
</svelte:head>

<!-- OverrideComponent logic removed for simplicity, can be added back if needed -->
<!-- {#if OverrideComponent}
    <svelte:component this={OverrideComponent} {data} />
{:else} -->
    <!-- Default Rendering -->

    <!-- Sub-Navigation is now handled by the root layout -->
    <!-- {#if data?.node?.children && data.node.children.length > 0}
        <nav class="sub-nav dynamic-nav">
            <ul>
                {#each data.node.children as childPage}
                    {@const href = childPage.url}
                    {#if href && !childPage.hideFromNav}
                         {@const isActive = $page.url.pathname === href}
                        <li><a {href} class:active={isActive} title={childPage.tooltip}>{childPage.title}</a></li>
                    {/if}
                {/each}
            </ul>
        </nav>
    {/if} -->

    <!-- 2. Page Header (H1) -->
    <h1 class="content-title">{pageHeader}</h1>

    <!-- 3. Page Description (Subtitle) -->
    {#if data?.node?.description}
        <p class="content-description">{data.node.description}</p>
    {/if}

    <!-- 4. Page Content -->
    <div class="markdown-content">
        <!-- Directly render HTML -->
        {@html data?.pageContent || '<p>Content not available.</p>'}
    </div>
<!-- {/if} -->

<style>
    /* Remove styles for .dynamic-nav as they are in the layout now */
    /* nav.dynamic-nav { ... } */
    /* nav.dynamic-nav ul { ... } */
    /* nav.dynamic-nav li { ... } */
    /* nav.dynamic-nav a { ... } */
    /* nav.dynamic-nav a:hover { ... } */
    /* nav.dynamic-nav a.active { ... } */

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