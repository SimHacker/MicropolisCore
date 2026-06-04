<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  import { getSharedSimulator, releaseSharedSimulator, MicropolisSimulator } from '$lib/MicropolisSimulator';
  import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
  import TileView from '$lib/TileView.svelte';
  import About from '$lib/About.svelte';
  import GameHud from '$lib/GameHud.svelte';
  import Toolbar from '$lib/Toolbar.svelte';
  import MessageOverlay from '$lib/MessageOverlay.svelte';
  import ZoneStatusPanel from '$lib/ZoneStatusPanel.svelte';

  let micropolisSimulator: MicropolisSimulator | null = null;
  let tileView: TileView | null = null;
  let viewRenderRef: (() => void) | null = null;

  onMount(async () => {

    console.log("MicropolisView: onMount: initializing micropolisengine...");

    viewRenderRef = () => { tileView?.render?.(); };
    micropolisSimulator = await getSharedSimulator(micropolisReactive.engineCallback, viewRenderRef);
    micropolisReactive.attach(micropolisSimulator);

    console.log("MicropolisView: onMount:", "micropolisSimulator:", micropolisSimulator);

    await tileView!.initialize(micropolisSimulator);
  });

  onDestroy(() => {
    console.log('MicropolisView: onDestroy');
    micropolisReactive.registerMapPan(null);
    micropolisReactive.detach();
    releaseSharedSimulator(viewRenderRef || undefined);
  });

</script>

<div class="view-container">
  <TileView bind:this={tileView} />

  <GameHud />
  <Toolbar />
  <MessageOverlay />
  <ZoneStatusPanel />

  <About showAbout={false}/>
</div>

<style>

.view-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

</style>
