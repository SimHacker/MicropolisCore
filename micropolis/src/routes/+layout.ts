import type { LayoutLoad } from './$types';

// Set prerender flag for adapter-static
export const prerender = true;

export const load: LayoutLoad = () => {
    // Default layout mode for all pages unless overridden by a page/layout below
    return {
        layoutMode: 'scrollable'
    };
}; 