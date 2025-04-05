import { error } from '@sveltejs/kit';
import { navigationTree, findNode, getAllPaths } from '$lib/navigationTree.js';
import { getContentFilePath, readContentFile, readAndParseContentFile } from '$lib/server/jekyllContent.js';

export const prerender = true;

/** @type {import('./$types').PrerenderEntries} */
export function entries() {
    const allPaths = getAllPaths(); // Gets all paths, e.g., [], ['will-wright'], ['ce', 'jp']
    // Filter out the root path ('[]') since it's handled by /about/+page.server.js
    const filteredPaths = allPaths.filter(p => p.length > 0);
    console.log('[entries ...path] raw paths (filtered):', JSON.stringify(filteredPaths));
    const formattedEntries = filteredPaths.map(p => ({ path: p.join('/') }));
    console.log('[entries ...path] formatted entries:', JSON.stringify(formattedEntries));
    return formattedEntries;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    console.log(`[load ...path] Received params: ${JSON.stringify(params)}`);
    const pathSegments = params.path?.split('/').filter(p => p) || [];
    console.log(`[load ...path] Parsed pathSegments: ${JSON.stringify(pathSegments)}`);
    const node = findNode(pathSegments);

    if (!node || pathSegments.length === 0) { // Also check if pathSegments is empty
        console.error(`[load ...path] Node not found or path is empty for segments: ${JSON.stringify(pathSegments)}`);
        error(404, 'Page not found in navigation tree or invalid path');
    }

    console.log(`[load ...path] Found node: ${JSON.stringify({slug: node.slug, contentSlug: node.contentSlug, inject: node.injectComponents})}`);

    const contentSlugForFile = node.contentSlug;
    if (typeof contentSlugForFile === 'undefined') {
        console.error(`[load ...path] CRITICAL: contentSlug is undefined for node '${node.slug}'. Check navigationTree.js!`);
        error(500, `Build Error: contentSlug missing for ${node.slug} in navigationTree.js`);
    }

    const filePath = getContentFilePath(contentSlugForFile);
    let pageContent;

    console.log(`[load ...path] Attempting to load content: ${filePath} (inject? ${node.injectComponents})`);

    if (node.injectComponents) {
        pageContent = await readAndParseContentFile(filePath, contentSlugForFile);
    } else {
        pageContent = await readContentFile(filePath, contentSlugForFile);
    }

    console.log(`[load ...path] Successfully loaded content for node: ${node.slug}`);

    return {
        node,
        pageContent,
        isParsed: node.injectComponents
    };
} 