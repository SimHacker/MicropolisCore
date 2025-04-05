import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url'; // Needed for __dirname in ESM

// Get current directory reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		prerender: {
			// Default enabled is usually fine if adapter supports it.
			// Rely on route-level entries() and prerender flags.
		},
		alias: {
			'$lib': path.resolve(__dirname, 'src/lib')
		}
	}
};

export default config; 