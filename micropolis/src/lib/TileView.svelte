<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  import { TileRenderer, WebGLTileRenderer } from '$lib/WebGLTileRenderer';

  // Tile Sets
  import tileLayer_all9 from '$lib/images/tilesets/all.png';

  const tileLayers = [
    tileLayer_all9,
  ];

  const tileWidth = 16;
  const tileHeight = 16;
  const tileCount = 960;
  let tileSetCount = 9;
  let tileSet = 0;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
  let tileRenderer: TileRenderer | null = null;

  let autoRepeatIntervalId: number | null = null;
  let autoRepeatDelay = 1000 / 60; // 60 repeats per second
  let autoRepeatKeys = [];

  let panning: boolean = false;
  let screenPos: [number, number] = [0, 0];
  let tilePos: [number, number] = [0, 0];
  let screenPosLast: [number, number] = [0, 0];
  let tilePosLast: [number, number] = [0, 0];
  let screenPosDown: [number, number] = [0, 0];
  let tilePosDown: [number, number] = [0, 0];
  let panDown: [number, number] = [0, 0];
  let leftKeyDown = false;
  let rightKeyDown = false;
  let upKeyDown = false;
  let downKeyDown = false;
  let inKeyDown = false;
  let outKeyDown = false;
  let keyPanScale = 1;
  let keyZoomScale = 0.025;
  let wheelZoomScale = 0.05;

  let heatFlowRangeLow = 4;
  let heatFlowRangeHigh = 100;

  let micropolisSimulator: MicropolisSimulator | null = null;

  export async function initialize(micropolisSimulator_: MicropolisSimulator): Promise<void> {
    console.log("TileView.svelte: init:", "micropolisSimulator:", micropolisSimulator_);
  
    micropolisSimulator = micropolisSimulator_;

    // Create 3d canvas drawing context and tileRenderer.
    //console.log('TileView.svelte: onMount', 'canvasGL:', canvasGL);
    if (canvasGL == null) {
      console.log('TileView.svelte: onMount: canvasGL is null!');
      return;
    }

    ctxGL = canvasGL.getContext('webgl2');
    //console.log('TileView.svelte: onMount:', 'ctxGL:', ctxGL);
    if (ctxGL == null) {
      console.log('TileView.svelte: onMount: no ctxGL!');
      return;
    }

    tileRenderer = new WebGLTileRenderer();
    //console.log('TileView.svelte: onMount: tileRenderer:', tileRenderer);
    if (tileRenderer == null) {
      console.log('TileView.svelte: onMount: no tileRenderer!');
      return;
    }

    window.micropolisSimulator = micropolisSimulator;
    window.micropolis = micropolisSimulator.micropolis;
    window.micropolisengine = micropolisSimulator.micropolisengine;
    window.tileRenderer = tileRenderer;

    //console.log('TileView.svelte: onMount: initialize:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'tileRenderer:', webGLTileRetileRenderernderer);

    await tileRenderer.initialize(
      canvasGL, 
      ctxGL, 
      micropolisSimulator.mapData, 
      micropolisSimulator.mopData, 
      micropolisSimulator.micropolisengine.WORLD_W,
      micropolisSimulator.micropolisengine.WORLD_H, 
      tileWidth, 
      tileHeight, 
      tileLayers);

    //console.log('TileView.svelte: onMount: initialize: then:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'tileRenderer:', webGLTiltileRenderereRenderer);

    tileRenderer.panTo(
      micropolisSimulator.micropolisengine.WORLD_W * 0.5, 
      micropolisSimulator.micropolisengine.WORLD_H * 0.5);
    tileRenderer.zoomTo(1.0);
    tileRenderer.tileLayer = 0;

    // Disable scrolling.
    const scrollTop = 
      window.pageYOffset || window.document.documentElement.scrollTop;
    const scrollLeft = 
      window.pageXOffset || window.document.documentElement.scrollLeft;
    window.onscroll = 
      () => window.scrollTo(scrollLeft, scrollTop);

    canvasGL.addEventListener('wheel', onwheel, {passive: false});

    resizeCanvas();
    refocusCanvas();

  }

  export function render(): void {
    //console.log("TileView.svelte: render:"");
    tileRenderer.render();
  }

  // Function to resize the canvas to match the screen size.
  function resizeCanvas() {
    if (canvasGL) {
      const ratio = window.devicePixelRatio || 1;
      canvasGL.width = canvasGL.clientWidth * ratio;
      canvasGL.height = canvasGL.clientHeight * ratio;
      console.log("TileView.svelte: resizeCanvas:", "ratio:", ratio, "canvasGL.width:", canvasGL.width, "canvasGL.height:", canvasGL.height);
      if (ctxGL) {
        ctxGL.viewport(0, 0, canvasGL.width, canvasGL.height);
      }
    }
  }

  function trackMouse(event: MouseEvent): TileRenderer<any> | null {
    screenPosLast = screenPos;
    tilePosLast = tilePos;

    screenPos = [
      event.offsetX, 
      event.offsetY,
    ];

    if (tileRenderer != null) {
      tilePos = tileRenderer.screenToTile(screenPos);
      //console.log('trackMouse: event:', event, 'screenPos:', screenPos, 'tilePos:', tilePos);
    }
  }

  function onmousedown(event: MouseEvent): void {
    trackMouse(event);

    panning = true;
    screenPosDown = screenPos;
    panDown = [tileRenderer.panX, tileRenderer.panY];

    //console.log('TileView.svelte: onmousedown: event:', event, 'target:', event.target, 'screenPos:', screenPos, 'panDown:', panDown);
  }

  function onmousemove(event: MouseEvent): void {
    trackMouse(event);

    if (!panning) return;

    const screenDelta: [number, number] = [
      screenPosLast[0] - screenPos[0],
      screenPosLast[1] - screenPos[1],
    ];
    let tileDelta = tileRenderer.screenToTileDelta(screenDelta);

    //console.log('TileView.svelte: onmousemove: event:', event, 'target:', event.target, 'screenDelta:', screenDelta, 'tileDelta:', tileDelta, 'tilePos:', tilePos, 'tilePosDown:', tilePosDown, 'screenPos:', screenPos, 'screenPosLast:', screenPosDown);

    tileRenderer.panBy(tileDelta[0], tileDelta[1]);

    render();
  }

  function onmouseup(event: MouseEvent): void {
    if (!panning) return;

    //console.log('TileView.svelte: onmouseup: event:', event, 'target:', event.target);

    panning = false;

    render();
  }

  function onkeydown(event: KeyboardEvent): void {
    //console.log('TileView.svelte: onkeydown: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    const key = event.key;
    const keyCode = event.keyCode;

    if ((keyCode >= 48) && (keyCode <= 57)) { // digits

      const digit = keyCode - 48;
      if (digit == 0) {
        micropolisSimulator.setPaused(!micropolisSimulator.paused);
      } else {
        micropolisSimulator.setGameSpeed(digit - 1);
        micropolisSimulator.setPaused(false);
      }

    } else if ((keyCode >= 64) && (keyCode <= 90)) { // letters

      const letter = keyCode - 64;
      const city = micropolisSimulator.cityFileNames[letter % micropolisSimulator.cityFileNames.length];
      //console.log("CITY", city);
      micropolisSimulator.micropolis.loadCity(city);
      micropolisSimulator.render();

    } else if (key == '=') {

      // Next tile set
      setTileSet((tileSet + 1) % tileSetCount);
      micropolisSimulator.render();

    } else if (key === '-') {

      // Previous tile set
      setTileSet((tileSet + tileSetCount - 1) % tileSetCount);
      micropolisSimulator.render();

    } else if (key == '+') {

      // Next tile layer
      setTileLayer((tileRenderer.tileLayer + 1) % tileLayers.length);
      micropolisSimulator.render();

    } else if (key === '_') {

      // Previous tile layer
      setTileLayer((tileRenderer.tileLayer + tileLayers.length - 1) % tileLayers.length);
      micropolisSimulator.render();

    } else if (key === '\\') {

      micropolis.generateSomeRandomCity();
      micropolisSimulator.render();

    } else switch (keyCode) {

      case 32:
        if (micropolis.heatSteps) {
          micropolisSimulator.rotateMapTiles(tileRenderer.tileRotate);
          tileRenderer.tileRotate = 0;
          micropolisSimulator.micropolis.heatSteps = 0;
        } else {
          tileRenderer.tileRotate = Math.floor(Math.random() * tileCount);
          micropolisSimulator.rotateMapTiles(-tileRenderer.tileRotate);
          micropolisSimulator.micropolis.heatSteps = 1;
          if (Math.random() < 0.75) {
            micropolisSimulator.micropolis.heatRule = 0;
            micropolisSimulator.micropolis.heatFlow = 
              Math.round(
                ((Math.random() * 2.0) - 1.0) * 
                ((Math.random() < 0.75) ? heatFlowRangeLow : heatFlowRangeHigh));
          } else {
            micropolisSimulator.micropolis.heatRule = 1;
          }
        }
        micropolisSimulator.render();
        break;

      case 37: 
        leftKeyDown = true;
        startAutoRepeat(key);
        break;

      case 39:
        rightKeyDown = true;
        startAutoRepeat(key);
        break;

      case 38:
        upKeyDown = true;
        startAutoRepeat(key);
        break;

      case 40:
        downKeyDown = true;
        startAutoRepeat(key);
        break;

      case 188:
        inKeyDown = true;
        startAutoRepeat(key)
        break;

      case 190:
        outKeyDown = true;
        startAutoRepeat(key);
        break;

      case 219:
        micropolisSimulator.micropolis.setCityTax(Math.max(0, micropolis.cityTax - 1));
        break;

      case 221:
        micropolisSimulator.micropolis.setCityTax(Math.min(20, micropolis.cityTax + 1));
        break;

    }
  }

  function onkeyup(event: KeyboardEvent): void {
    //console.log('TileView.svelte: onkeyup: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    const key = event.keyCode;

    switch (key) {

      case 37: // left
        leftKeyDown = false; 
        stopAutoRepeat(key);
        break;

      case 39: // right 
        rightKeyDown = false; 
        stopAutoRepeat(key);
        break;

      case 38: // down
        upKeyDown = false;
        stopAutoRepeat(key);
        break;

      case 40: // up
        downKeyDown = false;
        stopAutoRepeat(key);
        break;

      case 188: // in ,
        inKeyDown = false;
        stopAutoRepeat(key);
        break;

      case 190: // out .
        outKeyDown = false;
        stopAutoRepeat(key);
        break;

    }
  }

  function startAutoRepeat(key): void {
    if (autoRepeatKeys.indexOf(key) < 0) {
      autoRepeatKeys.push(key);
    }
    if (autoRepeatIntervalId === null) {
      autoRepeatIntervalId = setInterval(handleAutoRepeat, autoRepeatDelay);
    }
  }

  function stopAutoRepeat(key: number | null): void {
    if (key === null) {
      autoRepeatKeys = [];
    } else if (autoRepeatKeys.indexOf(key) >= 0) {
      autoRepeatKeys.splice(autoRepeatKeys.indexOf(key), 1);
    }
    if ((autoRepeatKeys.length === 0) && (autoRepeatIntervalId !== null)) {
      clearInterval(autoRepeatIntervalId);
      autoRepeatIntervalId = null;
    }
  }

  function handleAutoRepeat(): void {

    if (leftKeyDown) {
      tileRenderer.panBy(-keyPanScale / tileRenderer.zoom, 0);
    }

    if (rightKeyDown) {
      tileRenderer.panBy(keyPanScale / tileRenderer.zoom, 0);
    }

    if (upKeyDown) {
      tileRenderer.panBy(0, -keyPanScale / tileRenderer.zoom);
    }

    if (downKeyDown) {
      tileRenderer.panBy(0, keyPanScale / tileRenderer.zoom);
    }

    if (inKeyDown) {
      tileRenderer.zoomBy(1 + keyZoomScale);
    }

    if (outKeyDown) {
      tileRenderer.zoomBy(1 - keyZoomScale);
    }

    micropolisSimulator.render();

  }

  function onwheel(event: WheelEvent): void {

    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -wheelZoomScale : wheelZoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta
    //console.log('onwheel: event:', event, 'delta:', delta, 'zoomFactor:', zoomFactor);
    
    tileRenderer.zoomBy(zoomFactor);
    
    micropolisSimulator.render();
  }

  function setTileSet(index) {
    
    tileSet = index;
    if (micropolisSimulator) {
      micropolisSimulator.fillMopTiles(tileSet);
    }

    micropolisSimulator.render();
  }
  
  function setTileLayer(index) {
    //console.log('setTileLayer:', index);
    tileRenderer.tileLayer = index;
    micropolisSimulator.render();
  }
  
  function refocusCanvas() {
    if (canvasGL && 
        (document.activeElement !== canvasGL)) {
      canvasGL.focus();
    }
  }

  onMount(async () => {
    console.log("TileView.svelte: onMount");
  });

  onDestroy(() => {
    console.log('TileView.svelte: onDestroy');
    stopAutoRepeat(null);
  });

</script>

<svelte:window
  onresize={resizeCanvas}
/>

<canvas
  class="tileview-canvas"
  bind:this={canvasGL}
  tabindex="0"
  onmousedown={onmousedown}
  onmousemove={onmousemove}
  onmouseup={onmouseup}
  onkeydown={onkeydown}
  onkeyup={onkeyup}
></canvas>

<style>

  .tileview-canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: none;
    image-rendering: pixelated;
  }

</style>
