<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  //import { TileRenderer, WebGLTileRenderer } from '$lib/WebGLTileRenderer';
  import { TileRenderer, WebGPUTileRenderer } from '$lib/WebGPUTileRenderer';
  import { pan, pinch } from 'svelte-gestures';
  import { MicropolisSimulator } from '$lib/MicropolisSimulator';

  // Tile Sets
  import tileLayer_all10 from '$lib/images/tilesets/all.png';

  const tileLayers = [
    tileLayer_all10,
  ];

  const tileWidth = 16;
  const tileHeight = 16;
  const tileCount = 960;
  let tileSetCount = 10;
  let tileSet: number = 0;

  let canvasGL: HTMLCanvasElement | null = null;
  //let ctxGL: WebGL2RenderingContext | null = null;
  let ctxGL: GPUCanvasContext | null = null;
  let tileRenderer: TileRenderer<any> | null = null;

  let autoRepeatIntervalId: any | null = null;
  let autoRepeatDelay = 1000 / 60; // 60 repeats per second
  let autoRepeatKeys: string[] = [];

  let panning: boolean = false;
  let screenPos: [number, number] = [0, 0];
  let tilePos: [number, number] = [0, 0];
  let screenPosLast: [number, number] = [0, 0];
  let tilePosLast: [number, number] = [0, 0];
  let screenPosDown: [number, number] = [0, 0];
  let tilePosDown: [number, number] = [0, 0];
  let panDown: [number, number] = [0, 0];
  let initialTouchX: number = 0;
  let initialTouchY: number = 0;
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
    console.log("TileView.svelte: initialize:", "micropolisSimulator:", micropolisSimulator_);
  
    micropolisSimulator = micropolisSimulator_;

    if (!micropolisSimulator || !canvasGL) return;

    // Create 3d canvas drawing context and tileRenderer.
    //console.log('TileView.svelte: onMount', 'canvasGL:', canvasGL);
    if (canvasGL == null) {
      console.log('TileView.svelte: initialize: canvasGL is null!');
      return;
    }

    //ctxGL = canvasGL.getContext('webgl2');
    ctxGL = canvasGL.getContext('webgpu');
    //console.log('TileView.svelte: initialize:', 'ctxGL:', ctxGL);
    if (ctxGL == null) {
      console.log('TileView.svelte: initialize: no ctxGL!');
      return;
    }

    //tileRenderer = new WebGLTileRenderer();
    tileRenderer = new WebGPUTileRenderer();

    if (typeof window != "undefined") {
      //window.tileRenderer = tileRenderer;
    }

    //console.log('TileView.svelte: initialize: tileRenderer:', tileRenderer);
    if (tileRenderer == null) {
      console.log('TileView.svelte: initialize: no tileRenderer!');
      return;
    }

    await tileRenderer.initialize(
      canvasGL, 
      ctxGL, 
      micropolisSimulator.mapData!,
      micropolisSimulator.mopData!,
      micropolisSimulator.micropolisengine.WORLD_W,
      micropolisSimulator.micropolisengine.WORLD_H, 
      tileWidth, 
      tileHeight, 
      tileLayers);

    //console.log('TileView.svelte: initialize: initialized tile renderer.');

    tileRenderer.panTo(
      micropolisSimulator.micropolisengine.WORLD_W * 0.5, 
      micropolisSimulator.micropolisengine.WORLD_H * 0.5);
    tileRenderer.zoomTo(1.0);
    tileRenderer.tileLayer = 0;

    if (typeof window != "undefined") {
      canvasGL.addEventListener('wheel', onwheel, {passive: false});
    }

    resizeCanvas();
    refocusCanvas();

  }

  export function render(): void {
    //console.log("TileView.svelte: render:"");
    tileRenderer!.render();
  }

  // Function to resize the canvas to match the screen size.
  function resizeCanvas() {
    if (canvasGL) {
      const ratio = window.devicePixelRatio || 1;
      canvasGL.width = canvasGL.clientWidth * ratio;
      canvasGL.height = canvasGL.clientHeight * ratio;
      //console.log("TileView.svelte: resizeCanvas:", "ratio:", ratio, "canvasGL.width:", canvasGL.width, "canvasGL.height:", canvasGL.height);
      if (ctxGL) {
      //  ctxGL.viewport(0, 0, canvasGL.width, canvasGL.height);
      }
    }
  }

  export function trackMouse(event: MouseEvent) {
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

  export function onmousedown(event: MouseEvent): void {

    if (!tileRenderer) return;

    trackMouse(event);

    panning = true;
    screenPosDown = screenPos;
    panDown = [tileRenderer.panX, tileRenderer.panY];

    //console.log('TileView.svelte: onmousedown: event:', event, 'target:', event.target, 'screenPos:', screenPos, 'panDown:', panDown);
  }

  export function onmousemove(event: MouseEvent): void {

    if (!tileRenderer) return;

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

  export function onmouseup(event: MouseEvent): void {
    if (!panning) return;

    //console.log('TileView.svelte: onmouseup: event:', event, 'target:', event.target);

    panning = false;

    render();
  }

  export function onkeydown(event: KeyboardEvent): void {
    //console.log('TileView.svelte: onkeydown: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);

    if (!micropolisSimulator || !micropolisSimulator.micropolis || !tileRenderer || !micropolisSimulator) return;

    const key = event.key;

    if ((key >= "0") && (key <= "9")) { // digits

      const digit = key.charCodeAt(0) - "0".charCodeAt(0);
      if (digit == 0) {
        micropolisSimulator.setPaused(!micropolisSimulator.paused);
      } else {
        micropolisSimulator.setGameSpeed(digit - 1);
        micropolisSimulator.setPaused(false);
      }

    } else if ((key >= "a") && (key <= "z")) { // letters

      const letter = key.charCodeAt(0) - "a".charCodeAt(0);
      const city = micropolisSimulator.cityFileNames[letter % (micropolisSimulator.cityFileNames.length ?? 1)];
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

      micropolisSimulator.micropolis.generateSomeRandomCity();
      micropolisSimulator.render();

    } else switch (key) {

      case " ": // space
        if (micropolisSimulator.micropolis.heatSteps) {
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

      case "ArrowLeft":
        leftKeyDown = true;
        startAutoRepeat(key);
        break;

      case "ArrowRight":
        rightKeyDown = true;
        startAutoRepeat(key);
        break;

      case "ArrowUp":
        upKeyDown = true;
        startAutoRepeat(key);
        break;

      case "ArrowDown":
        downKeyDown = true;
        startAutoRepeat(key);
        break;

      case ",":
        inKeyDown = true;
        startAutoRepeat(key);
        break;

      case ".":
        outKeyDown = true;
        startAutoRepeat(key);
        break;

      case "[":
        micropolisSimulator.micropolis.setCityTax(Math.max(0, micropolisSimulator.micropolis.cityTax - 1));
        break;

      case "]":
        micropolisSimulator.micropolis.setCityTax(Math.min(20, micropolisSimulator.micropolis.cityTax + 1));
        break;

    }
  }  

  export function onkeyup(event: KeyboardEvent): void {
  //console.log('TileView.svelte: onkeyup: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    const key = event.key;

    switch (key) {

      case "ArrowLeft": // left
        leftKeyDown = false; 
        stopAutoRepeat(key);
        break;

      case "ArrowRight": // right 
        rightKeyDown = false; 
        stopAutoRepeat(key);
        break;

      case "ArrowDown": // down
        upKeyDown = false;
        stopAutoRepeat(key);
        break;

      case "ArrowUp": // up
        downKeyDown = false;
        stopAutoRepeat(key);
        break;

      case ",": // in ,
        inKeyDown = false;
        stopAutoRepeat(key);
        break;

      case ".": // out .
        outKeyDown = false;
        stopAutoRepeat(key);
        break;

    }
  }

  function startAutoRepeat(key: string): void {
    if (autoRepeatKeys.indexOf(key) < 0) {
      autoRepeatKeys.push(key);
    }
    if (autoRepeatIntervalId === null) {
      autoRepeatIntervalId = setInterval(handleAutoRepeat, autoRepeatDelay);
    }
  }

  function stopAutoRepeat(key: string | null): void {
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

    if (!tileRenderer ||  !micropolisSimulator) return;

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

  export function onwheel(event: WheelEvent): void {

    if (!tileRenderer || !micropolisSimulator) return;

    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -wheelZoomScale : wheelZoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta
    //console.log('onwheel: event:', event, 'delta:', delta, 'zoomFactor:', zoomFactor);
    
    tileRenderer.zoomBy(zoomFactor);
    
    micropolisSimulator.render();
  }

  export function setTileSet(index: number) {
    
    if (!micropolisSimulator) return;

    tileSet = index;
    micropolisSimulator.fillMopTiles(tileSet);

    micropolisSimulator.render();
  }
  
  export function setTileLayer(index: number) {
    if (!tileRenderer || !micropolisSimulator) return;

    //console.log('setTileLayer:', index);
    tileRenderer.tileLayer = index;
    micropolisSimulator.render();
  }
  
  export function refocusCanvas() {
    if (canvasGL && 
        (document.activeElement !== canvasGL)) {
      canvasGL.focus();
    }
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    initialTouchX = touch.clientX;
    initialTouchY = touch.clientY;
    console.log(`MicropolisView: handleTouchStart: event: ${event} initialTouchX": ${initialTouchX} initialTouchY: ${initialTouchY}`);
  }

  function handleTouchMove(event: TouchEvent) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - initialTouchX;
    const deltaY = touch.clientY - initialTouchY;
    console.log(`MicropolisView: handleTouchMove: event: ${event} deltaX": ${deltaX} deltaY: ${deltaY}`);
  }

  function handleTouchEnd(event: TouchEvent) {
    console.log(`MicropolisView: handleTouchEnd: event: ${event}`);
  }

  function handlePan(detail: any) {
    const { deltaX, deltaY } = detail;
    console.log(`TileView: handlePan: event: ${event} deltaX: ${deltaX} deltaY: ${deltaY}`);
  }

  function handlePinch(detail: any) {
    const { scale } = detail;
    console.log(`TileView: handleScale: detail: ${detail}`);
  }

  function handleDeviceMotion(event: DeviceMotionEvent) {
    if (event.rotationRate) {
      const { alpha, beta, gamma } = event.rotationRate;
      console.log(`TileView: handleDeviceMotion: event: ${event} alpha: ${alpha} beta: ${beta} gamma: ${gamma}`);
    }
  }

  onMount(async () => {
    console.log("TileView.svelte: onMount");

    if (typeof window != 'undefined') {
/*
      // Touch event listeners
      window.document.addEventListener('touchstart', handleTouchStart, false);
      window.document.addEventListener('touchmove', handleTouchMove, false);
      window.document.addEventListener('touchend', handleTouchEnd, false);
*/
      window.addEventListener('devicemotion', handleDeviceMotion, false);
    }

  });

  onDestroy(() => {
    console.log('TileView.svelte: onDestroy');
    
    stopAutoRepeat(null);

    if (typeof window != 'undefined') {
/*
      window.document.removeEventListener('touchstart', handleTouchStart);
      window.document.removeEventListener('touchmove', handleTouchMove);
      window.document.removeEventListener('touchend', handleTouchEnd);
*/
      window.removeEventListener('devicemotion', handleDeviceMotion);
    }
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
<!--
  use:pan={{ onPan: (any: any) => handlePan(any) }}
  use:pinch={{ onPinch: (any: any) => handlePinch(any) }}
-->

<style>

  .tileview-canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: none;
    image-rendering: pixelated;
  }

</style>
