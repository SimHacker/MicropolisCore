import { error } from '@sveltejs/kit';
import { navigationTree } from '$lib/navigationTree.js';
import { getContentFilePath, readContentFile } from '$lib/server/jekyllContent.js';

export const prerender = true;

// Helper to generate anchor IDs (consistent with client-side helper)
function generateIdForPath(pathSegments) {
    if (!pathSegments || pathSegments.length === 0) return '';
    // Create ID like content_about_will-wright
    const slug = pathSegments.join('_'); // Use underscore as separator for ID
    return `content-${slug}`.replace(/[^a-zA-Z0-9-_]/g, '_');
}

// Regex to find internal links starting with /pages/
const internalLinkRegex = /href="\/pages\/([a-zA-Z0-9\-\/_]+)"/g;

// Helper function to rewrite internal links to anchors
function rewriteLinks(htmlContent) {
    return htmlContent.replace(internalLinkRegex, (match, path) => {
        const pathSegments = path.split('/').filter(p => p);
        const anchorId = generateIdForPath(pathSegments);
        if (anchorId) {
            // console.log(`Rewriting ${match} to href="#${anchorId}"`);
            return `href="#${anchorId}"`;
        }
        return match; // Return original if ID generation fails
    });
}

// Helper function to recursively fetch and process content
async function fetchAllContentAndRewriteLinks(node, contentMap, currentPathSegments) {
    if (node.excludeFromAll) {
        console.log(`[fetchAllContent /all] Skipping node (and descendants): ${node.slug || 'root'}`);
        return;
    }

    if (node.contentSlug) {
        try {
            const filePath = getContentFilePath(node.contentSlug);
            if (!contentMap.has(node.contentSlug)) {
                 console.log(`[fetchAllContent /all] Reading: ${node.contentSlug}`);
                let html = await readContentFile(filePath, node.contentSlug);
                // Rewrite links within this node's content
                html = rewriteLinks(html);
                contentMap.set(node.contentSlug, html);
            }
        } catch (err) {
            console.error(`[fetchAllContent /all] Failed to read/process content for slug '${node.contentSlug}':`, err.message);
            contentMap.set(node.contentSlug, `<p style="color:red;">Error loading content for ${node.contentSlug}</p>`);
        }
    }

    if (node.children) {
        for (const child of node.children) {
            await fetchAllContentAndRewriteLinks(child, contentMap, [...currentPathSegments, child.slug]);
        }
    }
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    console.log('[load /all] Starting to fetch and process all content...');
    const contentMap = new Map();
    try {
        // Pass empty array for root path segments
        await fetchAllContentAndRewriteLinks(navigationTree, contentMap, []);
        console.log(`[load /all] Finished fetching/processing content. Map size: ${contentMap.size}`);
        const contentMapObject = Object.fromEntries(contentMap);

        return {
            tree: navigationTree,
            contentMap: contentMapObject
        };
    } catch (err) {
        console.error("[load /all] Fatal error during fetch/process:", err);
        error(500, "Failed to load/process all page content for /all route");
    }
} 