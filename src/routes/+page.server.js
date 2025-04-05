// src/routes/+page.server.js
import { error } from '@sveltejs/kit';
import { findNodeByUrl } from '$lib/navigationTree.js';
import { getContentFilePath, readContentFile } from '$lib/server/jekyllContent.js';

// This page can now be prerendered as its content comes from Jekyll
export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const requestedUrl = '/'; // Explicitly loading the root page
    console.log(`[load /] Loading root page: ${requestedUrl}`);

    // Find the node and path for the root URL in our site structure
    const foundData = findNodeByUrl(requestedUrl);

    if (!foundData) {
        console.error(`[load /] Root node ('/') not found in siteStructure! Check navigationTree.js`);
        // This would be a critical configuration error
        error(500, 'Site configuration error: Root node not found');
    }

    // Destructure the result
    const { node, fullPath } = foundData;

    console.log(`[load /] Found root node: ${JSON.stringify({ url: node.url, title: node.title, contentSlug: node.contentSlug })}`);

    // Check if the root node has content defined
    const contentSlugForFile = node.contentSlug;
    if (typeof contentSlugForFile === 'undefined') {
        console.error(`[load /] CRITICAL: contentSlug is undefined for root node ('/'). Check siteStructure.`);
        error(500, `Configuration Error: contentSlug missing for root node in siteStructure`);
    }

    const filePath = getContentFilePath(contentSlugForFile); // Gets path for 'index.html'
    console.log(`[load /] Attempting to load content: ${filePath}`);

    // Read the content file
    const pageContent = await readContentFile(filePath, contentSlugForFile);

    console.log(`[load /] Successfully loaded content for root node`);

    return {
        node,       // Pass the specific node data
        fullPath,   // Pass the array of nodes (likely just the root node itself)
        pageContent // Pass the loaded HTML content for the root page
    };
}

// No entries function needed here, SvelteKit handles the root path automatically for prerendering. 