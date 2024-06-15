<script lang="ts">

  import { onMount, onDestroy } from 'svelte';
  import tiles_png from '$lib/images/tiles.png';
  import { TileRenderer, WebGLTileRenderer } from '$lib/WebGLTileRenderer';
  import initModule from "$lib/../micropolisengine.js";
  
  // Micropolis Callback Interface Implementation

  class MicropolisCallback implements micropolisengine.JSCallback {

    autoGoto(micropolis: micropolisengine.Micropolis, callbackVal: any, x: number, y: number, message: string): void {
        console.log('MicropolisCallback: autoGoto:', 'x:', x, 'y:', y, 'message:', message);
    }

    didGenerateMap(micropolis: micropolisengine.Micropolis, callbackVal: any, seed: number): void {
        console.log('MicropolisCallback: didGenerateMap:', 'seed:', seed);
    }

    didLoadCity(micropolis: micropolisengine.Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallback: didLoadCity:', 'filename:', filename);
    }

    didLoadScenario(micropolis: micropolisengine.Micropolis, callbackVal: any, name: string, fname: string): void {
        console.log('MicropolisCallback: didLoadScenario:', 'name:', name, 'fname:', fname);
    }

    didLoseGame(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: didLoseGame');
    }

    didSaveCity(micropolis: micropolisengine.Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallback: didSaveCity:', 'filename:', filename);
    }

    didTool(micropolis: micropolisengine.Micropolis, callbackVal: any, name: string, x: number, y: number): void {
        console.log('MicropolisCallback: didTool:', 'name:', name, 'x:', x, 'y:', y);
    }

    didWinGame(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: didWinGame');
    }

    didntLoadCity(micropolis: micropolisengine.Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallback: didntLoadCity:', 'filename:', filename);
    }

    didntSaveCity(micropolis: micropolisengine.Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallback: didntSaveCity:', 'filename:', filename);
    }

    makeSound(micropolis: micropolisengine.Micropolis, callbackVal: any, channel: string, sound: string, x: number, y: number): void {
        console.log('MicropolisCallback: makeSound:', 'channel:', channel, 'sound:', sound, 'x:', x, 'y:', y);
    }

    newGame(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: newGame');
    }

    saveCityAs(micropolis: micropolisengine.Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallback: saveCityAs:', 'filename:', filename);
    }

    sendMessage(micropolis: micropolisengine.Micropolis, callbackVal: any, messageIndex: number, x: number, y: number, picture: boolean, important: boolean): void {
        console.log('MicropolisCallback: sendMessage:', 'messageIndex:', messageIndex, 'x:', x, 'y:', y, 'picture:', picture, 'important:', important);
    }

    showBudgetAndWait(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: showBudgetAndWait');
    }

    showZoneStatus(micropolis: micropolisengine.Micropolis, callbackVal: any, tileCategoryIndex: number, populationDensityIndex: number, landValueIndex: number, crimeRateIndex: number, pollutionIndex: number, growthRateIndex: number, x: number, y: number): void {
        console.log('MicropolisCallback: showZoneStatus:', 'tileCategoryIndex:', tileCategoryIndex, 'populationDensityIndex:', populationDensityIndex, 'landValueIndex:', landValueIndex, 'crimeRateIndex:', crimeRateIndex, 'pollutionIndex:', pollutionIndex, 'growthRateIndex:', growthRateIndex, 'x:', x, 'y:', y);
    }

    simulateRobots(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        //console.log('MicropolisCallback: simulateRobots');
    }

    simulateChurch(micropolis: micropolisengine.Micropolis, callbackVal: any, posX: number, posY: number, churchNumber: number): void {
        //console.log('MicropolisCallback: simulateChurch:', 'posX:', posX, 'posY:', posY, 'churchNumber:', churchNumber);
    }

    startEarthquake(micropolis: micropolisengine.Micropolis, callbackVal: any, strength: number): void {
        console.log('MicropolisCallback: startEarthquake:', 'strength:', strength);
    }

    startGame(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: startGame');
    }

    startScenario(micropolis: micropolisengine.Micropolis, callbackVal: any, scenario: number): void {
        console.log('MicropolisCallback: startScenario:', 'scenario:', scenario);
    }

    updateBudget(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: updateBudget');
    }

    updateCityName(micropolis: micropolisengine.Micropolis, callbackVal: any, cityName: string): void {
        console.log('MicropolisCallback: updateCityName:', 'cityName:', cityName);
    }

    updateDate(micropolis: micropolisengine.Micropolis, callbackVal: any, cityYear: number, cityMonth: number): void {
        console.log('MicropolisCallback: updateDate:', 'cityYear:', cityYear, 'cityMonth:', cityMonth);
    }

    updateDemand(micropolis: micropolisengine.Micropolis, callbackVal: any, r: number, c: number, i: number): void {
        console.log('MicropolisCallback: updateDemand:', 'r:', r, 'c:', c, 'i:', i);
    }

    updateEvaluation(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: updateEvaluation');
    }

    updateFunds(micropolis: micropolisengine.Micropolis, callbackVal: any, totalFunds: number): void {
        console.log('MicropolisCallback: updateFunds:', 'totalFunds:', totalFunds);
    }

    updateGameLevel(micropolis: micropolisengine.Micropolis, callbackVal: any, gameLevel: number): void {
        console.log('MicropolisCallback: updateGameLevel:', 'gameLevel:', gameLevel);
    }

    updateHistory(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: updateHistory');
    }

    updateMap(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: updateMap');
    }

    updateOptions(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: updateOptions');
    }

    updatePasses(micropolis: micropolisengine.Micropolis, callbackVal: any, passes: number): void {
        console.log('MicropolisCallback: updatePasses:', 'passes:', passes);
    }

    updatePaused(micropolis: micropolisengine.Micropolis, callbackVal: any, simPaused: boolean): void {
        console.log('MicropolisCallback: updatePaused:', 'simPaused:', simPaused);
    }

    updateSpeed(micropolis: micropolisengine.Micropolis, callbackVal: any, speed: number): void {
        console.log('MicropolisCallback: updateSpeed:', 'speed:', speed);
    }

    updateTaxRate(micropolis: micropolisengine.Micropolis, callbackVal: any, cityTax: number): void {
        console.log('MicropolisCallback: updateTaxRate:', 'cityTax:', cityTax);
    }

  }

  const tileWidth = 16;
  const tileHeight = 16;
  const tileCount = 960;
  const tileTextureWidth = 256;
  const tileTextureHeight = 960;
  const tileTexture = tiles_png;
  const mapWidth = 120;
  const mapHeight = 100;
  const mapLength = mapWidth * mapHeight;
  const framesPerSecond = 60;

  let micropolis = null;
  let cityFileName = '/cities/haight.cty';
  let mapData = null;
  let mapStartAddress = 0;
  let mapEndAddress = 0;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
  let tileRenderer: TileRenderer | null = null;

  let intervalId: number | null = null;

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

  function micropolisMain() {

    window.micropolis = micropolis = new micropolisengine.Micropolis();
    console.log("micropolisMain: micropolis:", micropolis);

    const micropolisCallback = new MicropolisCallback()
    const jsCallback = new micropolisengine.JSCallback(micropolisCallback);
    micropolis.setCallback(jsCallback, null);

    micropolis.init();
    micropolis.loadCity(cityFileName);
    
    mapStartAddress = micropolis.getMapAddress() / 2;
    mapEndAddress = mapStartAddress + micropolis.getMapSize() / 2;
    mapData = micropolisengine.HEAPU16.subarray(mapStartAddress, mapEndAddress);
    //console.log("micropolisMain: mapStartAddress:", mapStartAddress, "mapEndAddress:", mapEndAddress, "mapData:", mapData);

  }

  function tick(): void {
    //console.log('tick');
    handleInput();
    trackCursor();
    micropolisTick();
    renderAll();
  }

  function handleInput(): void {
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
  }

  function trackCursor(): void {
    //console.log('trackCursor');
  }

  function micropolisTick() {
    //console.log('micropolisTick: micropolis:', micropolis);
    micropolis.simTick();
    micropolis.animateTiles();
  }

  function renderAll(): void {
    //console.log("renderAll: mapStartAddress:", mapStartAddress, "mapEndAddress:", mapEndAddress, "mapData:", mapData);
    tileRenderer.render();
  }

  // Function to resize the canvas to match the screen size.
  function resizeCanvas() {
    if (canvasGL) {
      const ratio = window.devicePixelRatio || 1;
      canvasGL.width = canvasGL.clientWidth * ratio;
      canvasGL.height = canvasGL.clientHeight * ratio;
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

    tilePos = tileRenderer.screenToTile(screenPos);
    //console.log('trackMouse: event:', event, 'screenPos:', screenPos, 'tilePos:', tilePos);
  }

  function onmousedown(event: MouseEvent): void {
    trackMouse(event);

    panning = true;
    screenPosDown = screenPos;
    panDown = [tileRenderer.panX, tileRenderer.panY];

    //console.log('MicropolisView: onmousedown: event:', event, 'target:', event.target, 'screenPos:', screenPos, 'panDown:', panDown);
  }

  function onmousemove(event: MouseEvent): void {
    trackMouse(event);

    if (!panning) return;

    const screenDelta: [number, number] = [
      screenPosLast[0] - screenPos[0],
      screenPosLast[1] - screenPos[1],
    ];
    let tileDelta = tileRenderer.screenToTileDelta(screenDelta);

    //console.log('MicropolisView: onmousemove: event:', event, 'target:', event.target, 'screenDelta:', screenDelta, 'tileDelta:', tileDelta, 'tilePos:', tilePos, 'tilePosDown:', tilePosDown, 'screenPos:', screenPos, 'screenPosLast:', screenPosDown);

    tileRenderer.panBy(tileDelta[0], tileDelta[1]);

    renderAll();
  }

  function onmouseup(event: MouseEvent): void {
    if (!panning) return;

    //console.log('MicropolisView: onmouseup: event:', event, 'target:', event.target);

    panning = false;

    renderAll();
  }

  function onkeydown(event: KeyboardEvent): void {
    //console.log('MicropolisView: onkeydown: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    switch (event.keyCode) {
      case 37: leftKeyDown = true; break;
      case 39: rightKeyDown = true; break;
      case 38: upKeyDown = true; break;
      case 40: downKeyDown = true; break;
      case 188: inKeyDown = true; break;
      case 190: outKeyDown = true; break;
    }
  }
  
  function onkeyup(event: KeyboardEvent): void {
    //console.log('MicropolisView: onkeyup: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    switch (event.keyCode) {
      case 37: leftKeyDown = false; break;
      case 39: rightKeyDown = false; break;
      case 38: upKeyDown = false; break;
      case 40: downKeyDown = false; break;
      case 188: inKeyDown = false; break;
      case 190: outKeyDown = false; break;
    }
  }
  
  function onwheel(event: WheelEvent): void {
    const delta = event.deltaY > 0 ? -wheelZoomScale : wheelZoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta
    //console.log('onwheel: event:', event, 'delta:', delta, 'zoomFactor:', zoomFactor);
    tileRenderer.zoomBy(zoomFactor);
    renderAll();
  }

  function setFramesPerSecond(fps: number): void {
    if (fps <= 0) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }

    intervalId = setInterval(tick, 1000 / framesPerSecond);
  }

  onMount(async () => {

    //console.log('MicropolisView: onMount: ', 'tileWidth:', tileWidth, 'tileHeight:', tileHeight, 'tileCount:', tileCount, 'tileTextureWidth:', tileTextureWidth, 'tileTextureHeight:', tileTextureHeight, 'tileTexture:', tileTexture, 'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'mapLength:', mapLength, 'mapData:', mapData);

    console.log("MicropolisView: onMount: initializing micropolisengine...");
    window.micropolisengine = {};
    await initModule(micropolisengine);
    console.log("MicropolisView: onMount: initialized micropolisengine:", micropolisengine);

    micropolisMain();

    // Create 3d canvas drawing context and tileRenderer.
    //console.log('MicropolisView: onMount', 'canvasGL:', canvasGL);
    if (canvasGL == null) {
      console.log('MicropolisView: onMount: canvasGL is null!');
      return;
    }

    ctxGL = canvasGL.getContext('webgl2');
    //console.log('MicropolisView: onMount:', 'ctxGL:', ctxGL);
    if (ctxGL == null) {
      console.log('MicropolisView: onMount: no ctxGL!');
      return;
    }

    window.tileRenderer = tileRenderer = new WebGLTileRenderer();
    //console.log('MicropolisView: onMount: tileRenderer:', tileRenderer);
    if (tileRenderer == null) {
      console.log('MicropolisView: onMount: no tileRenderer!');
      return;
    }

    resizeCanvas();

    //console.log('MicropolisView: onMount: initialize:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'tileRenderer:', webGLTileRetileRenderernderer);

    tileRenderer.initialize(canvasGL, ctxGL, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
      .then(() => {
        //console.log('MicropolisView: onMount: initialize: then:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'tileRenderer:', webGLTiltileRenderereRenderer);

        if (canvasGL == null) {
          console.log('MicropolisView: onMount: initialize: then: no canvasGL!');
          return;
        }

        if (ctxGL == null) {
          console.log('MicropolisView: onMount: initialize: then: no ctxGL!');
          return;
        }

        if (tileRenderer == null) {
          console.log('MicropolisView: onMount: initialize: then: no tileRenderer!');
          return;
        }

        tileRenderer.panTo(mapWidth * 0.5, mapHeight * 0.5);
        tileRenderer.zoomTo(0.5);
        tileRenderer.render();
      });

    canvasGL.focus();

    setFramesPerSecond(framesPerSecond);

  });

  onDestroy(() => {
    //console.log('MicropolisView: onDestroy'); 
    setFramesPerSecond(0);
  });

</script>

<svelte:window
  onresize={resizeCanvas}
/>

<div class="fullscreen">
  <canvas
    bind:this={canvasGL}
    tabindex="0"
    onmousedown={onmousedown}
    onmousemove={onmousemove}
    onmouseup={onmouseup}
    onkeydown={onkeydown}
    onkeyup={onkeyup}
    onwheel={onwheel}
  ></canvas>
</div>

<style>
  .fullscreen {
    width: 100%;
    height: 100%;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
