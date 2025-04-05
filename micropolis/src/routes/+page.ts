// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

/** @type {import('./$types').PageLoad} */
export function load() {
    // Override the default layout mode for the home page
    return {
        layoutMode: 'fill' // Use 'fill' to indicate no scrolling, fill viewport
    };
}
