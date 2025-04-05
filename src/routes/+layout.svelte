<script>
    import Header from './Header.svelte';
    import './styles.css'; // Assuming global styles are imported here
    import { page } from '$app/stores';

    // Receive the loaded page data which includes { node, fullPath, pageContent }
    export let data;

    // Reactive variable to easily access the full path
    $: currentPath = data?.fullPath || [];
    // Get the URL of the current page node itself
    $: currentPageUrl = currentPath[currentPath.length - 1]?.url;

</script>

<div class="app-container">
    <div class="navigation-area">
        <Header />

        <!-- Hierarchical Navigation Rows -->
        {#if currentPath && currentPath.length > 1} <!-- Only show if there are ancestors -->
            {#each currentPath.slice(0, -1) as ancestorNode, i}
                {@const nextNodeInPath = currentPath[i + 1]} <!-- The node that should be active in this row -->
                {#if ancestorNode?.children && ancestorNode.children.length > 0}
                    <nav class="sub-nav dynamic-nav level-{i}">
                        <ul>
                            {#each ancestorNode.children as childNode}
                                {@const href = childNode.url}
                                {#if href && !childNode.hideFromNav}
                                    <!-- Active if this child IS the next node in the actual path -->
                                    {@const isActive = nextNodeInPath?.url === href}
                                    <li><a {href} class:active={isActive} title={childNode.tooltip}>{childNode.title}</a></li>
                                {/if}
                            {/each}
                        </ul>
                    </nav>
                {/if}
            {/each}
        {/if}
    </div>

    <main class="content-area" class:no-scroll={$page.url.pathname === '/'}>
        <slot />
    </main>
</div>

<style>
    /* Styles for dynamic-nav are needed here now */
    nav.dynamic-nav {
        background-color: var(--nav-bg-color, #444);
        padding: 0;
        display: flex;
        justify-content: center;
        border-bottom: 1px solid var(--nav-border-color, #666);
        font-weight: 600;
    }
    /* Subtle difference for deeper levels? Optional */
    nav.dynamic-nav.level-1 { background-color: var(--nav-level1-bg-color, #505050); }
    nav.dynamic-nav.level-2 { background-color: var(--nav-level2-bg-color, #585858); }

    nav.dynamic-nav ul {
        padding: 0.4em 0.8em; /* Slightly reduced padding */
        list-style: none; margin: 0; display: flex; flex-wrap: wrap; gap: 0.4em;
        width: 100%;
        justify-content: center;
    }
    nav.dynamic-nav li {
        display: inline-block;
    }
    nav.dynamic-nav a {
        display: block; padding: 0.3em 0.7em; /* Slightly reduced padding */
        font-size: 0.9em; /* Slightly smaller font */
        color: var(--nav-link-color, white); text-decoration: none;
        border-radius: 4px; transition: background-color 0.2s ease, color 0.2s ease;
        background-color: var(--nav-item-bg-color, #606060); border: 1px solid transparent;
        box-sizing: border-box; font-weight: normal; /* Normal weight */
        white-space: nowrap;
    }
    nav.dynamic-nav a:hover {
        background-color: var(--nav-hover-bg-color, #707070); color: var(--nav-hover-link-color, #eee);
    }
    nav.dynamic-nav a.active {
        background-color: var(--nav-active-bg-color, #007bff);
        color: var(--nav-active-link-color, white);
        font-weight: bold; /* Bold active item */
    }

    /* Existing styles */
    .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh; /* Ensure container takes full viewport height */
        overflow: hidden; /* Prevent container itself from scrolling */
    }

    .navigation-area {
        flex-shrink: 0; /* Prevent nav area from shrinking */
        padding: 0;
        margin: 0;
        border: none;
    }

    .content-area {
        flex-grow: 1;
        overflow-y: auto; /* Default: Scroll */
        padding: 1.5em; /* <<< ADD default padding for content */
        background-color: var(--color-bg-2, #f0f0f0); /* Optional background */
    }

    .content-area.no-scroll {
        overflow-y: hidden; /* Disable scroll for root */
        padding: 0; /* <<< REMOVE padding for root */
        background-color: transparent; /* Ensure no background clashes with TileView */
    }

    :global(body) {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    :global(*, *::before, *::after) {
        box-sizing: inherit;
    }

</style> 