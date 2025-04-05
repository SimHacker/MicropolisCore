import { error } from '@sveltejs/kit';
import { findNodeByUrl, getPrerenderEntries } from '$lib/navigationTree.js';
import { getContentFilePath, readContentFile } from '$lib/server/jekyllContent.js';

export const prerender = true;

/** @type {import('./$types').PrerenderEntries} */
export function entries() {
    const allEntries = getPrerenderEntries();
    // Filter entries to only include those under /pages/ for this route handler
    const pageEntries = allEntries
        .filter(url => url.startsWith('/pages/'))
        // Map to the expected format { path: '...' } where path is relative to /pages/
        .map(url => ({ path: url.substring('/pages/'.length) }));

    console.log('[entries /pages] Filtered page entries:', JSON.stringify(pageEntries));
    return pageEntries;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    console.log(`[load /pages] Received params: ${JSON.stringify(params)}`);
    // Construct the full URL path based on the parameter
    const requestedUrl = `/pages/${params.path}`;
    console.log(`[load /pages] Constructed requestedUrl: ${requestedUrl}`);

    // Find the node and its path using the new URL-based lookup
    const foundData = findNodeByUrl(requestedUrl);

    if (!foundData) {
        console.error(`[load /pages] Node not found for requestedUrl: ${requestedUrl}`);
        error(404, `Page not found: ${requestedUrl}`);
    }

    // Destructure the result
    const { node, fullPath } = foundData;

    // Log the found node (use node.url or title for identification)
    console.log(`[load /pages] Found node: ${JSON.stringify({ url: node.url, title: node.title, contentSlug: node.contentSlug })}`);

    // Check if the node is supposed to have content
    const contentSlugForFile = node.contentSlug;
    if (typeof contentSlugForFile === 'undefined') {
        // This case might mean it's a section header or a non-Jekyll page
        // defined in the structure but not handled by this generic route.
        // For now, treat it as an error similar to before, but could be handled differently.
        console.error(`[load /pages] CRITICAL: contentSlug is undefined for node with url '${node.url}'. Check siteStructure.`);
        error(500, `Configuration Error: contentSlug missing for ${node.url} in siteStructure`);
    }

    const filePath = getContentFilePath(contentSlugForFile);
    console.log(`[load /pages] Attempting to load content: ${filePath}`);

    // Read the content file
    const pageContent = await readContentFile(filePath, contentSlugForFile);
    // isParsed is no longer needed as readContentFile likely returns structured data or raw HTML
    // const isParsed = false; // Assuming readContentFile handles parsing or returns raw

    console.log(`[load /pages] Successfully loaded content for node: ${node.url}`);

    return {
        node,        // Pass the specific node data
        fullPath,    // Pass the array of nodes from root to current
        pageContent  // Pass the loaded HTML content
        // isParsed // Removed
    };
} 