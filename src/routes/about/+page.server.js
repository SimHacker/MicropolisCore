import { error } from '@sveltejs/kit';
import { navigationTree } from '$lib/navigationTree.js'; // Needed?
import { getContentFilePath, readContentFile } from '$lib/server/jekyllContent.js';

export const prerender = true; // Prerender the /about index page

// No entries() function needed here, SvelteKit knows to render this index.

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const slug = 'about'; // Explicit slug for the index page
    const node = navigationTree; // Get the root node data from the tree

    if (!node || node.slug !== 'about') {
        console.error("[load /about] Root node not found or incorrect in navigationTree.js");
        error(500, 'Navigation tree misconfigured');
    }

    const filePath = getContentFilePath(node.contentSlug);
    // Assume index page doesn't inject components, load raw HTML
    const pageContent = await readContentFile(filePath, node.contentSlug);

    console.log(`[load /about] Successfully loaded content for index node: ${node.slug}`);

    return {
        node, // Pass the node data
        pageContent, // Pass raw HTML
        isParsed: false // Explicitly false for the index
    };
} 