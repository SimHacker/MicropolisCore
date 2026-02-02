import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export function GET() {
    // Serve existing PNG as ICO fallback
    const pngPath = resolve(process.cwd(), 'static/favicon.png');
    const body = readFileSync(pngPath);
    return new Response(body, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    });
}


