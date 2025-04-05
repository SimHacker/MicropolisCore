<script>
	import { page } from '$app/stores';
	// Revert to using $lib alias
	import { siteStructure } from '$lib/navigationTree.js';
	// Placeholder for logo - replace path when available
	// import logo from '$lib/images/micropolis-logo.svg';

    // Filter the site structure to get only top-level items for the main header
    // Exclude items explicitly marked as hidden from navigation
    /** @type {Array<import('$lib/navigationTree.js').siteStructure[0]>} */
    let headerNavItems = []; // Type the array correctly
    $: headerNavItems = siteStructure.filter(
        /** @param {import('$lib/navigationTree.js').siteStructure[0]} node */
        node => !node.hideFromNav // Now TS knows node has hideFromNav
    );

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
                    {@const isActive = $page.url.pathname === item.url || (item.url !== '/' && $page.url.pathname.startsWith(item.url))}
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
		padding: 0.2em;
		background-color: var(--rci-dirt-bg);
		min-height: auto;
		height: auto;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		position: relative;
		border: 5px solid var(--rci-R-green);
		border-radius: 0;
	}
	.logo-placeholder {
		width: 3em;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.logo-placeholder svg {
		width: 100%;
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
		border: 3px solid white;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 5px;
		box-shadow: inset 1px 1px 3px rgba(0,0,0,0.2), 1px 1px 2px rgba(0,0,0,0.2);
		color: inherit;
	}
	nav.main-nav a.logo-link:hover {
		background-color: rgba(255, 255, 255, 0.15);
		box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1), 1px 1px 4px rgba(0,0,0,0.3);
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
		transform: translate(12px, -12px) scale(1.9);
	}

	nav.main-nav li:not(.logo-item):not([aria-current='page']) a:hover {
		background-color: rgba(255, 255, 255, 0.15);
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
