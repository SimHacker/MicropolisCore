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

  onMount(async () => {

    console.log("MicropolisView: onMount: initializing micropolisengine...");

    micropolisSimulator = 
      new MicropolisSimulator();

    window.micropolisSimulator = micropolisSimulator;
    window.micropolis = micropolisSimulator.micropolis;
    window.micropolisengine = micropolisSimulator.micropolisengine;

    console.log("MicropolisView: onMount:", "micropolisSimulator:", micropolisSimulator);

    await micropolisSimulator.initialize(
        new MicropolisCallbackLog(),
        () => {
          tileView.render();
        });

    await tileView.initialize(
      micropolisSimulator);

    micropolisSimulator.micropolis.loadCity(
      micropolisSimulator.cityFileName);

    micropolisSimulator.setGameSpeed(
      micropolisSimulator.gameSpeed);

    // Disable scrolling.
    const scrollTop = 
      window.pageYOffset || window.document.documentElement.scrollTop;
    const scrollLeft = 
      window.pageXOffset || window.document.documentElement.scrollLeft;
    window.onscroll = 
      () => window.scrollTo(scrollLeft, scrollTop);

  });

  onDestroy(() => {
    console.log('MicropolisView: onDestroy'); 
    micropolisSimulator?.setFramesPerSecond(0);
  });

</script>

<TileView
  class="fullscreen"
  bind:this={tileView}
/>

<!--
<About showAbout={true}/>

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

.fullscreen {
  display: block;
  position: absolute;
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

</style>
