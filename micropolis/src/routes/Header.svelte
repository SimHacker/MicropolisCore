<script>
	import { page } from '$app/stores';
	// Revert to using $lib alias
	import { siteStructure, findNodeByUrl } from '$lib/navigationTree';
	// Placeholder for logo - replace path when available
	// import logo from '$lib/images/micropolis-logo.svg';

    // Filter the site structure to get only top-level items for the main header
    // Exclude items explicitly marked as hidden from navigation
    /** @type {Array<any>} */
    let headerNavItems = []; 
    $: headerNavItems = siteStructure.filter(
        /** @param {any} node */
        node => !node.hideFromNav
    );

    // Determine the current path and active sections
    $: currentNodeData = findNodeByUrl($page.url.pathname);
    $: currentPath = currentNodeData?.fullPath || [];
    
    // Function to check if an item is active or has an active child
    /**
     * @param {any} item - Navigation item to check
     * @returns {boolean} Whether the item is active or has an active child
     */
    function isActiveOrHasActiveChild(item) {
        // Direct match
        if ($page.url.pathname === item.url) return true;
        // Prefix match for section
        if (item.url !== '/' && $page.url.pathname.startsWith(item.url)) return true;
        // Check if this item is in the current path
        return currentPath.some(node => node.url === item.url);
    }
</script>

<header>
	<nav class="main-nav">
		<ul>
			<!-- Logo moved inside the list -->
			<li class="logo-item">
				<a href="/" class="logo-link" title="Go to Micropolis Web Home">
					<div class="logo-placeholder">
						<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="100" height="100" rx="10" fill="#ddd"/>
							<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#555">LOGO</text>
						</svg>
						<!-- <img src={logo} alt="Micropolis" /> -->
					</div>
				</a>
			</li>

			<!-- Regular Nav Items -->
            {#each headerNavItems as item}
                {#if item.external}
                    <li>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" title={item.tooltip}>
                            <span class="tab-label">{@html item.title.replace(' ', '<br/>')}</span>&nbsp;<span class="external-link-icon">↗️</span>
                        </a>
                    </li>
                {:else}
                    {@const isActive = isActiveOrHasActiveChild(item)}
                    <li aria-current={isActive ? 'page' : undefined}>
                        <a href={item.url} title={item.tooltip}>
                            <span class="tab-label">{@html item.title.replace(' ', '<br/>')}</span>
                        </a>
                    </li>
                {/if}
            {/each}
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		padding: 0.4em;
		background-color: var(--rci-dirt-bg); /* Use CSS variable for consistent brown */
		min-height: auto;
		height: auto;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		position: relative;
		border: 5px solid var(--rci-R-green);
		border-radius: 0;
	}
	.logo-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2.4em; /* EXACT FIXED HEIGHT with extra to accommodate taller text */
		width: auto;
	}
	.logo-placeholder svg {
		width: auto;
		height: 100%;
		display: block;
	}
	nav.main-nav {
		display: flex;
		flex-grow: 1;
	}

	nav.main-nav ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: center;
		list-style: none;
		width: 100%;
		padding: 0;
		margin: 0;
		gap: 0.4em;
	}

	nav.main-nav li {
		margin: 0;
		display: inline-block;
		vertical-align: middle;
	}

	nav.main-nav a {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		text-decoration: none !important;
		padding: 0.4em 0.8em;
		line-height: 1.2;
		font-size: 0.85rem;
		min-width: 70px;
		box-sizing: border-box;
		border-radius: 4px;
		border: 1px solid transparent;
		box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
		color: var(--rci-text-light);
		background-color: transparent;
		transition: background-color 0.15s linear, color 0.15s linear, box-shadow 0.15s linear;
		font-weight: 600;
		white-space: nowrap;
	}

	nav.main-nav a.logo-link {
		min-width: auto;
		width: auto;
		padding: 0.4em 0.8em; /* Same padding as other tabs */
		border: 1px solid transparent;
		background-color: var(--rci-dirt-bg); /* Use CSS variable for consistent brown */
		border-radius: 4px; /* Same as other tabs */
		box-shadow: 1px 1px 3px rgba(0,0,0,0.3); /* Same as other tabs */
		color: inherit;
	}
	nav.main-nav a.logo-link:hover {
		background-color: var(--rci-dirt-bg); /* Use CSS variable for consistent brown */
		box-shadow: 1px 1px 5px rgba(0,0,0,0.4);
	}

	.external-link-icon {
		display: inline-block;
		vertical-align: baseline;
		font-size: 0.85em;
		transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		transform-origin: bottom center;
		opacity: 1;
		text-shadow: none;
		margin-left: 0.1em;
		transform: scale(1.0);
	}

	nav.main-nav a:hover .external-link-icon {
		transform: translate(16px, -12px) scale(1.9);
	}

	nav.main-nav li:not(.logo-item):not([aria-current='page']) a:hover {
		background-color: var(--rci-dirt-bg); /* Use CSS variable for consistent brown */
		color: #fff;
		box-shadow: 1px 1px 5px rgba(0,0,0,0.4);
	}

	nav.main-nav li:not(.logo-item)[aria-current='page'] a {
		border-color: transparent;
		background-color: var(--rci-R-green);
		color: #fff;
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
		box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3), 1px 1px 3px rgba(0,0,0,0.3);
	}

	nav.main-nav li:not(.logo-item)[aria-current='page'] a:hover {
		background-color: hsl(120, 100%, 38%);
	}

	nav.main-nav li:not(.logo-item) a:hover,
	nav.main-nav li[aria-current='page'] a,
	nav.main-nav li[aria-current='page'] a:hover {
		text-decoration: none !important;
	}
</style>
