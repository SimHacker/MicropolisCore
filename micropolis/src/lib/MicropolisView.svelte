<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  import { getSharedSimulator, releaseSharedSimulator, MicropolisSimulator } from '$lib/MicropolisSimulator';
  import { TileRenderer, WebGLTileRenderer } from '$lib/WebGLTileRenderer';
  import initModule from "$lib/micropolisengine.js";
  import { MicropolisCallbackLog } from "$lib/MicropolisCallbackLog";
  import TileView from '$lib/TileView.svelte';
  //import PieMenu from '$lib/PieMenu.svelte';
  import About from '$lib/About.svelte'
  import SnapView from '$lib/SnapView.svelte';

  let micropolisSimulator: MicropolisSimulator | null = null;
  let snapView: SnapView | null = null;
  let tileView: TileView | null = null;
  //let rootPie: PieMenu | null = null;
  let initialTouchX = 0;
  let initialTouchY = 0;
  let viewRenderRef: (() => void) | null = null;

  onMount(async () => {

    console.log("MicropolisView: onMount: initializing micropolisengine...");

    // Use shared singleton to avoid resetting wasm callback
    viewRenderRef = () => { tileView?.render?.(); };
    micropolisSimulator = await getSharedSimulator(new MicropolisCallbackLog(), viewRenderRef);

      console.log("MicropolisView: onMount:", "micropolisSimulator:", micropolisSimulator);

    await tileView!.initialize(micropolisSimulator);

    if (typeof window != 'undefined') {
      //window.micropolisSimulator = micropolisSimulator;
      //window.micropolis = micropolisSimulator.micropolis;
      //window.micropolisengine = micropolisSimulator.micropolisengine;

      // We no longer disable global scrolling
      // Instead, we only handle events within our container
    }
  });

  onDestroy(() => {
    console.log('MicropolisView: onDestroy'); 
    releaseSharedSimulator(viewRenderRef || undefined);
  });

</script>

<div class="view-container">
  <TileView
    bind:this={tileView}
  />

  <About showAbout={true}/>
</div>

<!--
<SnapView
  bind:this={snapView}
/>
-->

<!--
<PieMenu
  bind:this={rootPie}
/>
-->

<style>

.view-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Remove these styles */
/*
.fullscreen {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.tileview {
  display: block;
  position: relative;
  height: 100%;
  width: 100%;
}
*/

</style>
