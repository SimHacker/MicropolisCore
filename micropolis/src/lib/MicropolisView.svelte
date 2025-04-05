<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  import { loadMicropolisEngine, MicropolisSimulator } from '$lib/MicropolisSimulator';
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
  let disableScrolling = true;

  onMount(async () => {

    console.log("MicropolisView: onMount: initializing micropolisengine...");

    micropolisSimulator = 
      new MicropolisSimulator();

      console.log("MicropolisView: onMount:", "micropolisSimulator:", micropolisSimulator);

    await micropolisSimulator.initialize(
        new MicropolisCallbackLog(),
        () => {
          tileView!.render();
        });

    await tileView!.initialize(
      micropolisSimulator);

    micropolisSimulator!.micropolis!.loadCity(
      micropolisSimulator.cityFileName);

    micropolisSimulator.setGameSpeed(
      micropolisSimulator.gameSpeed);

    if (typeof window != 'undefined') {

      //window.micropolisSimulator = micropolisSimulator;
      //window.micropolis = micropolisSimulator.micropolis;
      //window.micropolisengine = micropolisSimulator.micropolisengine;

      if (disableScrolling) {
        // Disable scrolling.
        const scrollTop = 
          window.pageYOffset || window.document.documentElement.scrollTop;
        const scrollLeft = 
          window.pageXOffset || window.document.documentElement.scrollLeft;
        window.onscroll = 
          () => window.scrollTo(scrollLeft, scrollTop);
      }

    }
  });

  onDestroy(() => {
    console.log('MicropolisView: onDestroy'); 
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
  position: relative; /* Make this the positioning context */
  width: 100%;      /* Ensure it takes up available space */
  height: 100%;
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
