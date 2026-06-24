<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  import { getSharedSimulator, releaseSharedSimulator, MicropolisSimulator } from '$lib/MicropolisSimulator';
  import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
  import TileView from '$lib/TileView.svelte';
  import GameHud from '$lib/GameHud.svelte';
  import HelpModal from '$lib/HelpModal.svelte';
  import Toolbar from '$lib/Toolbar.svelte';
  import MessageOverlay from '$lib/MessageOverlay.svelte';
  import ZoneStatusPanel from '$lib/ZoneStatusPanel.svelte';
  import BudgetModal from '$lib/BudgetModal.svelte';
  import SoftwareSpriteLayer from '$lib/sprites/SoftwareSpriteLayer.svelte';
  import { triggerSkywriting, toggleSkywritingPilot } from '$lib/sprites/plugins/skywriting/SkywritingPlugin.svelte';
  import CursorLayer from '$lib/input/CursorLayer.svelte';
  import { tileFootprintScreenRect } from '$lib/input/viewportTileFrame';
  import { toolState } from '$lib/ToolState.svelte';
  import { toolFootprintAtCenter } from '$lib/gameTools';
  import type { CursorPresence } from '$lib/input/types';
  import type { ScreenRect } from '$lib/input/viewportTileFrame';

  let micropolisSimulator: MicropolisSimulator | null = null;
  let tileView: TileView | null = null;
  let viewRenderRef: (() => void) | null = null;

  function getMapViewport() {
    return tileView?.getMapViewport() ?? null;
  }

  const localPlayerId = 'local';

  const localCursorPresence = $derived.by((): CursorPresence[] => {
    void toolState.toolRevision;
    void toolState.hoverRevision;
    const tile = toolState.hoverTile;
    const toolId = toolState.activeToolId;
    if (!tile) return [];
    const footprint = toolFootprintAtCenter(tile[0], tile[1], toolId);
    return [{
      playerId: localPlayerId,
      local: true,
      toolId,
      anchorSpace: 'world-tile',
      visible: true,
      tile: footprint,
      rimPolicy: 'fat',
      representations: { dom: [] }
    }];
  });

  const domFrameRects = $derived.by((): Record<string, ScreenRect> => {
    void micropolisReactive.mapCameraRevision;
    void toolState.toolRevision;
    void toolState.hoverRevision;
    const tile = toolState.hoverTile;
    const toolId = toolState.activeToolId;
    const vp = tileView?.getMapViewport?.();
    if (!tile || !vp || vp.screenWidth <= 0 || vp.screenHeight <= 0) return {};
    const footprint = toolFootprintAtCenter(tile[0], tile[1], toolId);
    const rect = tileFootprintScreenRect(vp, footprint.x, footprint.y, footprint.w, footprint.h);
    if (rect.w <= 0 || rect.h <= 0) return {};
    return { [localPlayerId]: rect };
  });

  onMount(async () => {

    console.log("MicropolisView: onMount: initializing micropolisengine...");

    viewRenderRef = () => { tileView?.render?.(); };
    micropolisSimulator = await getSharedSimulator(micropolisReactive.engineCallback, viewRenderRef);
    micropolisReactive.attach(micropolisSimulator);

    // Pause sim ticks until tile atlas is loaded — avoids render-before-ready race.
    micropolisSimulator.setPaused(true);
    micropolisSimulator.syncMapViews();
    await tileView!.initialize(micropolisSimulator);
    micropolisSimulator.setPaused(false);

    console.log("MicropolisView: onMount:", "micropolisSimulator:", micropolisSimulator);

    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        micropolisSkywrite?: typeof triggerSkywriting;
        micropolisSkyPilot?: () => boolean;
      };
      w.micropolisSkywrite = triggerSkywriting;
      w.micropolisSkyPilot = toggleSkywritingPilot;
    }
  });

  onDestroy(() => {
    console.log('MicropolisView: onDestroy');
    micropolisReactive.registerMapPan(null);
    micropolisReactive.detach();
    releaseSharedSimulator(viewRenderRef || undefined);
  });

</script>

<div class="view-container">
  <Toolbar />
  <div class="play-main">
    <div class="map-stack">
      <TileView bind:this={tileView} />
      <SoftwareSpriteLayer getViewport={getMapViewport} simulator={micropolisSimulator} />
      <CursorLayer
        backend="dom"
        presences={localCursorPresence}
        domFrameRects={domFrameRects}
      />
      <GameHud />
      <ZoneStatusPanel />
      <BudgetModal />
      <HelpModal />
    </div>

    <MessageOverlay />
  </div>
</div>

<style>

.view-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  --message-bar-height: 2.5rem;
}

.play-main {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-stack {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

</style>
