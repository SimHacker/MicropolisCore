import { error } from '@sveltejs/kit';
import { siteStructure } from '$lib/navigationTree';
import { getContentFilePath, readContentFile } from '$lib/server/jekyllContent.js';

export const prerender = true;

// Convert a URL path to an anchor ID (make sure we generate valid HTML5 IDs)
function urlToAnchorId(url: string): string {
    // Remove leading slash, replace slashes with underscores, ensure it starts with a letter
    // HTML5 IDs must begin with a letter (a-z or A-Z) and can be followed by letters, digits, hyphens, underscores, colons, and periods.
    const sanitized = url.replace(/^\//, '').replace(/\//g, '_');
    return 'nav_' + sanitized;
}

// Interface for node entries
interface NavigationNode {
    url?: string;
    title: string;
    header?: string;
    contentSlug?: string;
    description?: string;
    children?: NavigationNode[];
    excludeFromAll?: boolean;
    excludeFromRss?: boolean;
    hideFromNav?: boolean;
    external?: boolean;
}

interface AnchorInfo {
    title: string;
    url: string;
}

// Create a map of all valid site URLs to their corresponding anchorIds
function buildSiteUrlMap(): Map<string, string> {
    const urlMap = new Map<string, string>();
    
    function traverseNode(node: NavigationNode): void {
        if (node.url) {
            // Skip external URLs
            if (!node.external) {
                const anchorId = urlToAnchorId(node.url);
                urlMap.set(node.url, anchorId);
            }
        }
        
        if (node.children) {
            for (const child of node.children) {
                traverseNode(child);
            }
        }
    }
    
    // Process all nodes in the site structure
    for (const node of siteStructure) {
        traverseNode(node);
    }
    
    return urlMap;
}

// Regex to find ALL internal links starting with / (site-relative URLs)
const internalLinkRegex = /href=["']\/([a-zA-Z0-9\-\/_]+)["']/g;

// Helper function to rewrite internal links to anchors
function rewriteLinks(htmlContent: string, urlMap: Map<string, string>): string {
    console.log("[rewriteLinks] Processing HTML content for link rewrites");
    
    return htmlContent.replace(internalLinkRegex, (match, path) => {
        const fullUrl = '/' + path;
        
        // Check if we have this URL in our site structure
        if (urlMap.has(fullUrl)) {
            const anchorId = urlMap.get(fullUrl);
            console.log(`[rewriteLinks] Rewriting ${fullUrl} to #${anchorId}`);
            return `href="#${anchorId}"`;
        }
        
        // If URL is not in our site structure, leave it as is
        console.log(`[rewriteLinks] URL ${fullUrl} not found in site structure, leaving as is`);
        return match;
    });
}

// Helper function to recursively fetch and process content
async function fetchAllContentAndRewriteLinks(
    node: NavigationNode, 
    contentMap: Map<string, string>,
    urlMap: Map<string, string>
): Promise<void> {
    if (node.excludeFromAll) {
        console.log(`[fetchAllContent /all] Skipping node (and descendants): ${node.url || 'root'}`);
        return;
    }

    if (node.contentSlug) {
        try {
            const filePath = getContentFilePath(node.contentSlug);
            if (!contentMap.has(node.contentSlug)) {
                 console.log(`[fetchAllContent /all] Reading: ${node.contentSlug}`);
                let html = await readContentFile(filePath, node.contentSlug);
                // Rewrite links within this node's content
                html = rewriteLinks(html, urlMap);
                contentMap.set(node.contentSlug, html);
            }
        } catch (err) {
            console.error(`[fetchAllContent /all] Failed to read/process content for slug '${node.contentSlug}':`, err.message);
            contentMap.set(node.contentSlug, `<p style="color:red;">Error loading content for ${node.contentSlug}</p>`);
        }
    }

    if (node.children) {
        for (const child of node.children) {
            await fetchAllContentAndRewriteLinks(child, contentMap, urlMap);
        }
    }
}

// Generate IDs for sections to match internal links
function generateAnchorsForEachPage(
    nodes: NavigationNode[], 
    anchors: Record<string, AnchorInfo> = {}
): Record<string, AnchorInfo> {
    for (const node of nodes || []) {
        if (node.url && node.contentSlug && !node.external) {
            // Create anchor ID directly from the URL
            const id = urlToAnchorId(node.url);
            anchors[id] = {
                title: node.title,
                url: node.url
            };
        }
        
        // Process children
        if (node.children) {
            generateAnchorsForEachPage(node.children, anchors);
        }
    }
    
    return anchors;
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    console.log('[load /all] Starting to fetch and process all content...');
    const contentMap = new Map<string, string>();
    
    try {
        // Build map of all valid site URLs to their anchor IDs
        const urlMap = buildSiteUrlMap();
        console.log(`[load /all] Generated URL map with ${urlMap.size} entries`);
        
        // Generate anchors for each page
        const anchors = generateAnchorsForEachPage(siteStructure);
        console.log(`[load /all] Generated ${Object.keys(anchors).length} anchors for pages`);
        
        // Process each top-level node separately
        for (const node of siteStructure) {
            await fetchAllContentAndRewriteLinks(node, contentMap, urlMap);
        }
        
        console.log(`[load /all] Finished fetching/processing content. Map size: ${contentMap.size}`);
        const contentMapObject = Object.fromEntries(contentMap);

        return {
            tree: siteStructure,
            contentMap: contentMapObject,
            anchors // Pass the anchors to the page component
        };
    } catch (err) {
        console.error("[load /all] Fatal error during fetch/process:", err);
        error(500, "Failed to load/process all page content for /all route");
    }
} 