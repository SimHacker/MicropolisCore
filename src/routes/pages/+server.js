import { redirect } from '@sveltejs/kit';

// This endpoint handles requests directly to the base /pages path.
// Since this isn't a valid content page itself, we redirect users
// up to the main application home page (/).

export const prerender = true; // Prerender this redirect

/** @type {import('./$types').RequestHandler} */
export function GET() {
    console.warn('[GET /pages] Redirecting base path to / (Home)');
    redirect(308, '/'); // 308 Permanent Redirect to Home
} 