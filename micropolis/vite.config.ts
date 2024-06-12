import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    sveltekit(),
/*
    nodePolyfills({
      exclude: [],
      globals: {
        Buffer: true, // Enable buffer
        global: true, // Enable global
        process: true, // Enable process
      },
      polyfills: {
        fs: true, // Enable fs polyfill
        path: true, // Enable path polyfill
        os: true, // Enable os polyfill
      },
    }),
*/
  ],
/*
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  resolve: {
    alias: {
      stream: 'rollup-plugin-node-builtins',
      buffer: 'rollup-plugin-node-globals',
    },
  },
*/
});
