import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see the documentation
			pages: 'build', // This should be the folder where your built files will reside
			assets: 'build', // This should be the folder where your built files will reside
			// SPA fallback: prerendered pages stay static; the interactive play/* routes
			// (prerender = false — live WASM/WebGL) hydrate client-side from this shell.
			fallback: '200.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			// Content is migrated; keep missing in-page anchors a warning (legacy deep
			// links evolve), but fail on real broken page links so regressions surface.
			handleMissingId: 'warn'
		}
	}
};

export default config;
