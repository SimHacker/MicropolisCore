import { readContentFile, getContentFilePath } from '$lib/server/jekyllContent.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

const l2Slugs = [
    'will-wright',
    'don-hopkins',
    'chaim-gingold',
    'brett-victor',
    'stone-librande',
    'ben-shneiderman'
];

/** @type {import('./$types').PrerenderEntries} */
export function entries() {
    return l2Slugs.map(slug => ({ slug }));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const slug = params.slug;
    if (!slug) {
        // Should not happen with file-based routing unless navigating directly
        // to /about/ which is handled by the parent index +page.server.js
        console.error('Load function in /about/[slug] called without a slug.');
        error(400, 'Bad Request: Slug is required');
    }

    if (!l2Slugs.includes(slug)) {
        console.error(`Invalid slug requested: ${slug}`);
        error(404, `Page not found: ${slug}`);
    }

    const filePath = getContentFilePath(slug);
    const contentHtml = await readContentFile(filePath, slug);

    return {
        slug,
        contentHtml
    };
} 