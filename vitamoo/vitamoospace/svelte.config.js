import adapterStatic from '@sveltejs/adapter-static';
// To switch to server mode for GCS/Docker deployment:
//   1. Change import to: import adapter from '@sveltejs/adapter-node';
//   2. Replace adapterStatic({...}) with adapter({...})
//   3. Remove prerender from +layout.ts
//   4. Build with: node build/index.js

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapterStatic({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: false
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '')
		}
	}
};

export default config;
