import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
//import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    sveltekit(),
    //wasm(),
    topLevelAwait(),
    viteStaticCopy({
      targets: [
        {
          //src: "src/lib/micropolisengine/micropolisengine.wasm",
          src: "src/micropolisengine.wasm",
          dest: ".",
        },
        {
          //src: "src/lib/micropolisengine/micropolisengine.data",
          src: "src/micropolisengine.data",
          dest: ".",
        },
      ],
    }),
  ],
});
