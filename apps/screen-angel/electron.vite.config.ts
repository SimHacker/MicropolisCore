import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const alias = {
	'@common': resolve(__dirname, 'src/common'),
	// What a module is allowed to see. Today an alias into the host; when third-party
	// modules become real this becomes a published package and nothing else moves.
	'@screen-angel/host-api': resolve(__dirname, 'src/main/modules/module.ts')
};

// Workspace modules ship TypeScript source rather than a build directory, so Vite has
// to compile them rather than treat them as external node dependencies.
const workspaceModules = ['@screen-angel/soul-angel', '@screen-angel/soul-bridge-sims1'];

/**
 * Every target that imports `electron` has to say so here.
 *
 * Two things conspire to make this necessary. Setting `external` replaces
 * electron-vite's default list rather than extending it, and `externalizeDepsPlugin`
 * builds its list from `dependencies` — where `electron` is not, because it is a
 * devDependency. So a target with either of those and no explicit mention ends up with
 * the electron npm WRAPPER compiled into the bundle, and the app runs Electron's own
 * downloader instead of itself. It fails as "Unable to find Electron app at
 * out/<target>/install.js", which names a file nobody wrote and no target expected.
 *
 * The dependencies are read from package.json rather than listed, because the sentence
 * above says "replaces" and that is the whole problem: a hand-written list silently stops
 * externalising everything the plugin would have. The first dependency added after this
 * config was written — steamworks-ffi-node — got bundled instead, and since it is
 * CommonJS while this package is `"type": "module"`, the emitted chunk failed with
 * "__filename is not defined in ES module scope". A message about ES modules, from a
 * library that has no opinion about ES modules, naming a file with a content hash in it.
 */
const manifest = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
	dependencies?: Record<string, string>;
};

const external = [
	'electron',
	/\.node$/,
	...Object.keys(manifest.dependencies ?? {}).filter((name) => !workspaceModules.includes(name))
];

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin({ exclude: workspaceModules })],
		resolve: { alias },
		build: {
			rollupOptions: {
				input: resolve(__dirname, 'src/main/index.ts'),
				external
			}
		}
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		resolve: { alias },
		build: {
			rollupOptions: { input: resolve(__dirname, 'src/preload/index.ts'), external }
		}
	},
	renderer: {
		root: resolve(__dirname, 'src/renderer'),
		// The renderer root is a subdirectory, so the plugin has to be told where the
		// config lives or it silently falls back to defaults.
		plugins: [svelte({ configFile: resolve(__dirname, 'svelte.config.js') })],
		resolve: { alias },
		build: {
			rollupOptions: { input: resolve(__dirname, 'src/renderer/index.html') }
		}
	}
});
