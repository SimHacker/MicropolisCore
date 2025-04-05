<script>
    import { page } from '$app/stores';

    // --- Component Registries ---
    // Import components that can be dynamically injected via markers
    import MicropolisView from '$lib/MicropolisView.svelte';
    // import AnotherComponent from '$lib/AnotherComponent.svelte';

    const injectableRegistry = {
        MicropolisView: MicropolisView,
        // AnotherComponent: AnotherComponent,
    };

    // Import components that can override the entire page layout
    // import SpecialPageLayout from '$lib/SpecialPageLayout.svelte';

    const overrideRegistry = {
        // SpecialPageLayout: SpecialPageLayout,
    };
    // --- End Component Registries ---

    export let data; // Receives { node, pageContent, isParsed }

    // Helper to get the correct component from a registry
    function getComponent(registry, name) {
        return name ? registry[name] : null;
    }

    // Determine the current base path for sub-navigation links
    let basePath = '/about';
    $: {
        const pathSegments = $page.params.path?.split('/').filter(p => p) || [];
        basePath = '/about' + (pathSegments.length > 0 ? '/' + pathSegments.join('/') : '');
    }

    // Determine which component override to use, if any
    let OverrideComponent = null;
    $: OverrideComponent = getComponent(overrideRegistry, data?.node?.overrideComponent);

</script>

{#if OverrideComponent}
    <!-- If an override component is specified, render it and pass data -->
    <svelte:component this={OverrideComponent} {data} />
{:else}
    <!-- Default Rendering Logic -->

    <!-- 1. Render Sub-Navigation (if the current page has children) -->
    {#if data?.node?.children && data.node.children.length > 0}
        <nav class="sub-nav dynamic-nav">
            <ul>
                {#each data.node.children as childPage}
                    {@const href = `${basePath}/${childPage.slug}`}
                    {@const isActive = $page.url.pathname === href || $page.url.pathname.startsWith(`${href}/`)}
                    <li><a {href} class:active={isActive}>{childPage.title}</a></li>
                {/each}
            </ul>
        </nav>
    {/if}

    <!-- 2. Render Page Title (from navigation node) -->
    <h1>{data?.node?.title || 'Page Title Missing'}</h1>

    <!-- 3. Render Page Content -->
    <div class="markdown-content">
        {#if data?.isParsed}
            <!-- Render parsed parts with potential component injection -->
            {#each data.pageContent as part (part.type === 'component' ? part.name + Math.random() : part.content)}
                {#if part.type === 'html'}
                    {@html part.content}
                {:else if part.type === 'component'}
                    {@const InjectableComponent = getComponent(injectableRegistry, part.name)}
                    {#if InjectableComponent}
                        <svelte:component this={InjectableComponent} />
                    {:else}
                        <p style="color: red; border: 1px solid red; padding: 5px;">
                            Error: Injectable Svelte Component "{part.name}" not found in registry.
                        </p>
                    {/if}
                {/if}
            {/each}
        {:else}
            <!-- Render raw HTML -->
            {@html data?.pageContent || '<p>Content not available.</p>'}
        {/if}
    </div>
{/if}

<style>
    /* Basic styles for dynamically generated nav - Adjust as needed */
    nav.dynamic-nav {
        background-color: var(--nav-bg-color, #444);
        padding: 0.5em 1em;
        display: flex;
        justify-content: center;
        border-bottom: 2px solid var(--nav-border-color, #666);
        margin-bottom: 1em;
        /* Match styling from previous nav.sub-nav */
        font-weight: 600;
    }

    nav.dynamic-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em;
    }

    nav.dynamic-nav li {
        display: inline-block;
    }

    nav.dynamic-nav a {
        display: block;
        padding: 0.4em 0.8em; /* Consistent padding */
        color: var(--nav-link-color, white);
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.2s ease, color 0.2s ease;
        background-color: var(--nav-item-bg-color, #555);
        border: 1px solid transparent;
        box-sizing: border-box;
        font-weight: 600; /* Consistent bold weight */
        white-space: nowrap;
    }

    nav.dynamic-nav a:hover {
        background-color: var(--nav-hover-bg-color, #666);
        color: var(--nav-hover-link-color, #eee);
    }

    nav.dynamic-nav a.active {
        background-color: var(--nav-active-bg-color, #007bff);
        color: var(--nav-active-link-color, white);
    }

    /* Styles for markdown content */
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