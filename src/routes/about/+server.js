import { redirect } from '@sveltejs/kit';

// This endpoint exists solely to catch any requests (especially during prerendering)
// that incorrectly try to access the old /about path and redirect them
// permanently to the new /pages/about path.

export const prerender = true; // Make sure this redirect itself is prerendered

/** @type {import('./$types').RequestHandler} */
export function GET() {
    console.warn('[GET /about] Redirecting obsolete path to /pages/about');
    redirect(308, '/pages/about'); // 308 Permanent Redirect
} 