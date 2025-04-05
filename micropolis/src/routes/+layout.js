// Set prerender flag for adapter-static
export const prerender = true;

/** @type {import('./$types').LayoutLoad} */
export function load() {
    // Default layout mode for all pages unless overridden by a page/layout below
    return {
        layoutMode: 'scrollable'
    };
} 