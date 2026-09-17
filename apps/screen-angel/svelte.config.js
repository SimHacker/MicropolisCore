import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// No SvelteKit here: the renderer is a plain Svelte 5 app loaded by Electron,
// not a server-rendered site. Routing, if it ever appears, is in-page.
export default {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	}
};
