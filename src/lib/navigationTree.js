// src/lib/navigationTree.js

// Defines the entire site structure, including top-level navigation,
// content pages, and external links. Replaces the old separate
// navConfig.js and the nested navigationTree object.

// Each node can contain:
// - url: string (Absolute path for internal links, full URL for external)
// - title: string (Display title in Navs, TOCs - usually shorter)
// - header: string (Optional: Main H1 header text for the page, defaults to title)
// - contentSlug: string (Optional: Maps to Jekyll HTML filename without extension)
// - description: string (Optional: Subtitle/elaborating description, used in meta tags/RSS 📜)
// - children: Array<Node> (Optional: For sub-navigation/hierarchical content)
// - external: boolean (Optional: If true, link opens in a new tab)
// - tooltip: string (Optional: Text for link tooltips)
// - matchUrlPrefix: boolean (Optional: If true, findNodeByUrl will match if the requested URL starts with this node's url, used for container sections like /game)
// - excludeFromAll: boolean (Optional: If true, excludes node and descendants from /all page)
// - excludeFromRss: boolean (Optional: If true, excludes node from RSS feed)
// - hideFromNav: boolean (Optional: If true, don't show in dynamically generated nav menus, like subNav)

export const siteStructure = [
    // 1. Root Page (from old mainNav)
    {
        url: '/',
        title: 'Micropolis Web',
        header: 'Micropolis Web Simulation', // Specific header for root
        contentSlug: 'index', // Assuming Jekyll builds an index.html
        description: 'Micropolis Web Simulation Home Page.',
        tooltip: 'Go to Micropolis Web Home',
    },
    // 2. About Section (incorporating old tree structure)
    {
        url: '/pages/about',
        title: 'About', // Shorter for tab
        header: 'About Micropolis', // Fuller for H1
        contentSlug: 'about',
        description: 'An exploration of the history, concepts, creators, and influences behind the Micropolis simulation (based on SimCity Classic). 🧐',
        tooltip: 'Learn about Micropolis history and concepts',
        matchUrlPrefix: true, // Children URLs start with this
        children: [
            {
                url: '/pages/about/will-wright',
                title: 'Will Wright',
                header: 'Will Wright: SimCity Creator',
                contentSlug: 'will-wright',
                description: 'Meet the visionary game designer who originally created SimCity, Spore, and The Sims. 🎮️',
            },
            {
                url: '/pages/about/don-hopkins',
                title: 'Don Hopkins',
                header: 'Don Hopkins: Micropolis Developer',
                contentSlug: 'don-hopkins',
                description: 'Learn about the hacker known for porting SimCity to Unix, developing its open-source version Micropolis, and pioneering pie menus. 🐧',
            },
            {
                url: '/pages/about/chaim-gingold',
                title: 'Chaim Gingold',
                header: 'Chaim Gingold: Building SimCity',
                contentSlug: 'chaim-gingold',
                description: 'Dive into insights from "Building SimCity," Chaim's book detailing the game's creation, alongside his revealing reverse-engineered diagrams. 📖️',
            },
            {
                url: '/pages/about/brett-victor',
                title: 'Brett Victor',
                header: 'Brett Victor: Dynamic Mediums',
                contentSlug: 'brett-victor',
                description: 'Explore the work of an influential designer and programmer focused on dynamic mediums for thought and creativity. ✨',
            },
            {
                url: '/pages/about/stone-librande',
                title: 'Stone Librande',
                header: 'Stone Librande: One-Page Designs',
                contentSlug: 'stone-librande',
                description: 'Discover the design philosophy of Stone Librande, known for his insightful one-page documents visualizing complex game systems. 📄',
            },
            {
                url: '/pages/about/ben-shneiderman',
                title: 'Ben Shneiderman',
                header: 'Ben Shneiderman: Direct Manipulation',
                contentSlug: 'ben-shneiderman',
                description: 'Understand the principles championed by the computer scientist who coined "direct manipulation" and advanced information visualization.🖱️',
            },
            {
                url: '/pages/about/constructionist-education',
                title: 'Constructionism', // Shorter tab title
                header: 'Constructionist Education', // Fuller H1
                contentSlug: 'constructionist-education',
                description: 'An overview of the learning theory developed by Seymour Papert, where knowledge is built through active creation and sharing. 🛠️',
                matchUrlPrefix: true, // Children URLs start with this
                children: [
                    {
                        url: '/pages/about/constructionist-education/jean-piaget',
                        title: 'Jean Piaget',
                        header: 'Jean Piaget: Cognitive Development',
                        contentSlug: 'jean-piaget',
                        description: 'Review the foundational theories of the influential Swiss psychologist who studied the stages of cognitive development in children. 👶',
                    },
                    {
                        url: '/pages/about/constructionist-education/seymour-papert',
                        title: 'Seymour Papert',
                        header: 'Seymour Papert: Constructionism & Logo',
                        contentSlug: 'seymour-papert',
                        description: 'Meet the MIT mathematician and educator who pioneered AI, developed the Logo programming language, and founded Constructionism. 🐢',
                    },
                    {
                        url: '/pages/about/constructionist-education/marvin-minsky',
                        title: 'Marvin Minsky',
                        header: 'Marvin Minsky: AI & Society of Mind',
                        contentSlug: 'marvin-minsky',
                        description: 'Delve into the thinking of a founding father of artificial intelligence and co-founder of MIT's AI Lab, known for "The Society of Mind." 🤖',
                    },
                    {
                        url: '/pages/about/constructionist-education/alan-kay',
                        title: 'Alan Kay',
                        header: 'Alan Kay: Dynabook & OOP',
                        contentSlug: 'alan-kay',
                        description: 'Learn about the computer scientist, a key figure in object-oriented programming and GUIs, who envisioned the Dynabook concept. 💻',
                    },
                    {
                        url: '/pages/about/constructionist-education/doreen-nelson',
                        title: 'Doreen Nelson',
                        header: 'Doreen Nelson: Design-Based Learning',
                        contentSlug: 'doreen-nelson',
                        description: 'Explore Design-Based Learning (DBL), the hands-on educational methodology developed by this innovative educator. 📐',
                    }
                ]
            }
        ]
    },
    // 3. Building SimCity (from old mainNav & tree)
    {
        url: '/pages/building-simcity',
        title: 'Building SimCity',
        header: 'Building SimCity Book Excerpts',
        contentSlug: 'building-simcity',
        description: 'Excerpts and information related to Chaim Gingold's definitive book detailing the design and development history of the original SimCity. 🏗️',
        tooltip: 'Read about the making of SimCity',
        excludeFromRss: true,
    },
    // 4. Reverse Diagrams (from old mainNav & tree)
    {
        url: '/pages/reverse-diagrams',
        title: 'Diagrams', // Keep shorter title for nav
        header: 'SimCity Reverse Diagrams', // Keep specific header
        contentSlug: 'reverse-diagrams',
        description: 'Chaim Gingold's detailed diagrams visually reverse-engineering the core simulation loops and mechanics of SimCity Classic. 📊',
        tooltip: 'Explore SimCity Classic mechanics',
    },
    // 5. Micropolis License (from old mainNav & tree)
    {
        url: '/pages/micropolis-license',
        title: 'License', // Keep shorter title for nav
        header: 'Micropolis Public Name License', // Keep specific header
        contentSlug: 'micropolis-license',
        description: 'Review the specific open-source license terms governing the use of the name "Micropolis" for the SimCity source code.⚖️',
        tooltip: 'View the Micropolis Public Name License',
        excludeFromAll: true,
        excludeFromRss: true,
        hideFromNav: false, // Explicitly show in nav, even though excluded from /all
    },
    // --- Placeholder for Game Section ---
    {
        url: '/game',
        title: 'Game',
        header: 'Micropolis Game',
        // No contentSlug, as this would likely load a Svelte component shell
        description: 'Interactive Micropolis game simulation.',
        tooltip: 'Play Micropolis',
        matchUrlPrefix: true, // URLs like /game/load, /game/editor/* match this
        hideFromNav: true, // Example: Maybe launch from root page, not main nav
    },
    // --- External Links ---
    {
        url: 'https://github.com/SimHacker/MicropolisCore',
        title: 'Source Code',
        tooltip: 'View MicropolisCore Source Code on GitHub',
        external: true
    },
    {
        url: 'https://www.patreon.com/DonHopkins',
        title: 'Please Support',
        tooltip: 'Support Don Hopkins on Patreon',
        external: true
    },
];


// --- New Helper Functions (Implementations Below/Imported) ---

// Map for efficient URL lookup: Map<string, { node: object, fullPath: Array<object> }>
const urlMapWithPath = new Map();
// Array for nodes with matchUrlPrefix = true: Array<{ node: object, fullPath: Array<object> }>
const prefixNodesWithPath = [];

/**
 * Builds the urlMapWithPath and prefixNodesWithPath array from the siteStructure.
 * Stores the node and its full path from the root.
 * Should be called once at application startup.
 * @param {Array<object>} nodes - The siteStructure array (or children array).
 * @param {Array<object>} currentPath - The array of ancestor nodes leading to this level.
 */
function buildLookupsWithPath(nodes, currentPath = []) {
    if (!nodes) return;
    nodes.forEach(node => {
        // Define the full path for *this* node
        const nodeFullPath = [...currentPath, node];

        if (node.url) {
            const nodeData = { node: node, fullPath: nodeFullPath }; // Store node and its full path
            if (urlMapWithPath.has(node.url)) {
                console.warn(`Duplicate URL detected in siteStructure: ${node.url}`);
            }
            urlMapWithPath.set(node.url, nodeData);

            // Add to prefix nodes if applicable
            if (node.matchUrlPrefix === true) {
                prefixNodesWithPath.push(nodeData);
            }
        }
        // Recurse for children, passing the *new* full path
        if (node.children) {
            buildLookupsWithPath(node.children, nodeFullPath); // Pass path including current node
        }
    });
}

/**
 * Finds a node and its ancestors in the site structure based on the requested URL.
 * Prioritizes exact match, then falls back to the longest prefix match
 * for nodes marked with `matchUrlPrefix: true`.
 * Requires `buildLookupsWithPath` to have been called first.
 *
 * @param {string} requestedUrl - The URL path to search for (e.g., '/', '/pages/about/will-wright').
 * @returns {{ node: object, fullPath: Array<object> } | null} The found node data including the full path, or null.
 */
export function findNodeByUrl(requestedUrl) {
    // 1. Prioritize Exact Match
    const exactMatchData = urlMapWithPath.get(requestedUrl);
    if (exactMatchData) {
        return exactMatchData;
    }

    // 2. Find Best Prefix Match (if no exact match)
    let bestPrefixMatchData = null;
    // Iterate through pre-sorted prefixNodes (longest URL first)
    for (const prefixData of prefixNodesWithPath) {
        const node = prefixData.node; // Get the node from the stored data
        // Check if the requested URL starts with the node's prefix URL
        if (requestedUrl.startsWith(node.url)) {
             const nextChar = requestedUrl[node.url.length];
             if (nextChar === undefined || nextChar === '/' || nextChar === '?' || nextChar === '#') {
                // Since prefixNodesWithPath is sorted longest first, the first match is the best
                bestPrefixMatchData = prefixData;
                break;
             }
        }
    }

    return bestPrefixMatchData;
}

/**
 * Generates an array of URL paths for all navigable, non-excluded pages
 * suitable for SvelteKit's prerender entries.
 * Requires `buildLookupsWithPath` to have been called first.
 *
 * @returns {Array<string>} An array of URL strings.
 */
export function getPrerenderEntries() {
    const entries = [];
    // Iterate over the values ( { node, fullPath } ) in the map
    for (const { node } of urlMapWithPath.values()) {
        // Use the same logic as before based on the node properties
        if (!node.external && node.contentSlug) { 
           entries.push(node.url);
        }
        // Add logic here if Svelte-only pages need explicit prerendering
    }
    // Add root entry explicitly if not covered by contentSlug logic? SvelteKit usually handles '/'
    // if (!urlMapWithPath.has('/')) { entries.push('/'); } // Or ensure '/' node has contentSlug
    return entries;
}


// --- Initialize Lookups ---
// Sort prefixNodes by node.url.length descending ONCE after building
buildLookupsWithPath(siteStructure);
prefixNodesWithPath.sort((a, b) => b.node.url.length - a.node.url.length);


// --- Deprecated Functions (Keep for reference or remove) ---
/*
// OLD Helper function to find a node in the tree by slug path array relative to the root children
// Input pathSegments example: ['about'], ['about', 'will-wright'], ['about', 'constructionist-education', 'jean-piaget']
export function findNode(pathSegments = []) { ... }

// OLD Helper function to generate all valid paths for entries()
// Returns paths relative to /pages, e.g., ['about'], ['about', 'will-wright']
export function getAllPaths(node = navigationTree, currentPath = [], isRoot = true) { ... }
*/ 