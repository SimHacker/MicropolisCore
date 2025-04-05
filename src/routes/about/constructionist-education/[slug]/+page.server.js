import { readContentFile, getContentFilePath } from '$lib/server/jekyllContent.js';
import { error } from '@sveltejs/kit'; // Import error

export const prerender = true; // Enable prerendering for this route

// Define the slugs for L3 pages that should be prerendered
const l3Slugs = [
    'jean-piaget',
    'seymour-papert',
    'marvin-minsky',
    'alan-kay',
    'doreen-nelson'
];

/** @type {import('./$types').PrerenderEntries} */
export function entries() {
    return l3Slugs.map(slug => ({ slug }));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const slug = params.slug;
    if (!slug) {
        console.error('Load function in /about/constructionist-education/[slug] called without a slug.');
        error(400, 'Bad Request: Slug is required');
    }

    // Validate slug
    if (!l3Slugs.includes(slug)) {
        console.error(`Invalid slug requested in constructionist-education: ${slug}`);
        error(404, `Page not found: ${slug}`);
    }

    // IMPORTANT: Construct the correct slug including the parent path if needed
    // by your getContentFilePath or if the build output isn't flat.
    // Assuming flat build output, the slug is just the last part.
    const contentSlug = slug; // Adjust if your build output or read logic needs the full path

    const filePath = getContentFilePath(contentSlug);
    const contentHtml = await readContentFile(filePath, contentSlug);

    return {
        slug, // Return the original slug param for potential use in the page
        contentHtml
    };
} 