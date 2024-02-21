import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see the documentation
			pages: '../build', // This should be the folder where your built files will reside
			assets: '../build', // This should be the folder where your built files will reside
			fallback: null,
			precompress: false
		}),
		// other options set here...
	}
};

export default config;
