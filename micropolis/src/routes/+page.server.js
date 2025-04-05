import { error } from '@sveltejs/kit';
import { findNodeByUrl, siteStructure } from '$lib/navigationTree.js';

// This page cannot be prerendered as it dynamically generates the index
export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const requestedUrl = '/'; // Explicitly loading the root page
    console.log(`[load /] Loading dynamic site index: ${requestedUrl}`);

    // Find the node and path for the root URL in our site structure
    const foundData = findNodeByUrl(requestedUrl);

    if (!foundData) {
        console.error(`[load /] Root node ('/') not found in siteStructure! Check navigationTree.js`);
        error(500, 'Site configuration error: Root node not found');
    }

    // Destructure the result
    const { node, fullPath } = foundData;

    console.log(`[load /] Found root node: ${JSON.stringify({ url: node.url, title: node.title })}`);

    return {
        node,       // Pass the specific node data for the root page itself
        fullPath,   // Pass the path (just the root node)
        siteStructure // Pass the entire structure for index generation
    };
}

// No entries function needed here. 