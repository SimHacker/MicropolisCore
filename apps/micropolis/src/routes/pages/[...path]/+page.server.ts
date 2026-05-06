import { error } from '@sveltejs/kit';
import { findNodeByUrl, getPrerenderEntries } from '$lib/navigationTree';
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

    return pageEntries;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const requestedUrl = `/pages/${params.path}`;

    const foundData = findNodeByUrl(requestedUrl);

    if (!foundData) {
        console.error(`[load /pages] Node not found for requestedUrl: ${requestedUrl}`);
        error(404, `Page not found: ${requestedUrl}`);
    }

    const { node, fullPath } = foundData;

    const contentSlugForFile = node.contentSlug;
    if (typeof contentSlugForFile === 'undefined') {
        console.error(`[load /pages] CRITICAL: contentSlug is undefined for node with url '${node.url}'. Check siteStructure.`);
        error(500, `Configuration Error: contentSlug missing for ${node.url} in siteStructure`);
    }

    const filePath = getContentFilePath(contentSlugForFile);

    try {
        const pageContent = await readContentFile(filePath, contentSlugForFile);
        
        // Return specific properties instead of the whole node object
        return {
            title: node.title,
            header: node.header || node.title,
            description: node.description || '',
            children: node.children || [], // Pass children separately if needed by page/layout
            fullPath,    // Keep fullPath for layout navigation
            pageContent  // Keep pageContent
        };
    } catch (err) {
        console.error(`[load /pages] Failed to load content for '${contentSlugForFile}':`, err);
        error(500, `Failed to load content for ${node.url}`);
    }
} 