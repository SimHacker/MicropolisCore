import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import topLevelAwait from "vite-plugin-top-level-await";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    sveltekit(),
    topLevelAwait(),
    viteStaticCopy({
      // Copy the built webassembly module and data into place.
      targets: [
        {
          src: "src/micropolisengine.wasm",
          dest: ".",
        },
        {
          src: "src/micropolisengine.data",
          dest: ".",
        },
      ]
    }),
  ],
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5177
  },
});
