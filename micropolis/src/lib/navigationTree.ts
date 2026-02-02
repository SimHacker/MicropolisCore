// micropolis/src/lib/navigationTree.ts
// Loads the site structure from JSON and provides helper functions.

import siteStructureData from './data/siteStructure.json';

// Export the loaded data directly
export const siteStructure = siteStructureData as SiteNode[]; // Assert type on import

// --- Helper Functions --- 

// Map for efficient URL lookup: Map<string, { node: object, fullPath: Array<object> }>
// Define TypeScript interfaces for better type safety
export interface SiteNode {
    comment?: string; // Optional comment key
    url: string;
    title: string;
    header?: string;
    contentSlug?: string;
    description?: string;
    tooltip?: string;
    matchUrlPrefix?: boolean;
    showSubTabs?: boolean;
    excludeFromAll?: boolean;
    excludeFromRss?: boolean;
    hideFromNav?: boolean;
    external?: boolean;
    children?: SiteNode[];
}

export interface NodeData {
    node: SiteNode;
    fullPath: SiteNode[];
}

// Explicitly type the maps and arrays
const urlMapWithPath = new Map<string, NodeData>();
const prefixNodesWithPath: NodeData[] = [];

/**
 * Builds the urlMapWithPath and prefixNodesWithPath array from the siteStructure.
 * Stores the node and its full path from the root.
 * Should be called once at application startup.
 * @param {Array<SiteNode>} nodes - The siteStructure array (or children array).
 * @param {Array<SiteNode>} currentPath - The array of ancestor nodes leading to this level.
 */
function buildLookupsWithPath(nodes: SiteNode[], currentPath: SiteNode[] = []) { // Added types
    if (!nodes) return;
    nodes.forEach(node => {
        // Define the full path for *this* node
        const nodeFullPath = [...currentPath, node];

        if (node.url) {
            const nodeData: NodeData = { node: node, fullPath: nodeFullPath }; // Use NodeData type
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
            buildLookupsWithPath(node.children, nodeFullPath);
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
 * @returns {NodeData | null} The found node data including the full path, or null.
 */
export function findNodeByUrl(requestedUrl: string): NodeData | null { // Added types
    // 1. Prioritize Exact Match
    const exactMatchData: NodeData | undefined = urlMapWithPath.get(requestedUrl); // Use NodeData type
    if (exactMatchData) {
        return exactMatchData;
    }

    // 2. Find Best Prefix Match (if no exact match)
    let bestPrefixMatchData: NodeData | null = null; // Use NodeData type
    
    // Iterate through pre-sorted prefixNodes (longest URL first)
    for (const prefixData of prefixNodesWithPath) { // Type is inferred from array type
        const node = prefixData.node; // Type is inferred from NodeData
        // No need for !node check now with defined types

        // Check if the requested URL starts with the node's prefix URL
        if (requestedUrl.startsWith(node.url)) {
             const nextChar = requestedUrl[node.url.length];
             if (nextChar === undefined || nextChar === '/' || nextChar === '?' || nextChar === '#') {
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
export function getPrerenderEntries(): string[] { // Added type
    const entries: string[] = []; // Added type
    // Iterate over the values ( { node, fullPath } ) in the map
    for (const { node } of urlMapWithPath.values()) { // Type inferred from Map type
        // Prerender pages with content slugs, but NOT the root page now
        if (node.url !== '/' && !node.external && node.contentSlug) { 
           entries.push(node.url);
        }
    }
    return entries;
}


// --- Initialize Lookups ---
buildLookupsWithPath(siteStructure);
// Sort prefixNodes by node.url.length descending ONCE after building
prefixNodesWithPath.sort((a, b) => { // Types inferred from array type
    // No need for checks, types guarantee url exists
    const lenA = a.node.url.length;
    const lenB = b.node.url.length;
    return lenB - lenA;
});


