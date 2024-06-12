<script lang="ts">

  import tiles_png from '$lib/images/tiles.png';
  import { TileRenderer, WebGLTileRenderer } from '$lib/WebGLTileRenderer';

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

  // Properties that can be configured with attributes.

  type Props = {
    tileWidth?: number;
    tileHeight?: number;
    tileCount?: number;
    tileTextureWidth?: number;
    tileTextureHeight?: number;
    tileTexture?: string;
    mapWidth?: number;
    mapHeight?: number;
    mapLength?: number;
    mapData?: Uint16Array;
    framesPerSecond?: number;
    zoomScale?: number;
  };

  // Bind properties from attributes and defaults.

  let { 
    tileWidth = 16,
    tileHeight = 16,
    tileCount = 960,
    tileTextureWidth = 256,
    tileTextureHeight = 960,
    tileTexture = tiles_png,
    mapWidth = 120,
    mapHeight = 100,
    mapLength = mapWidth * mapHeight,
    framesPerSecond = 60,
    zoomScale = 0.025,
  } = $props<Props>();

  // Component private state.

  let micropolis = null;
  let cityFileName = '/cities/haight.cty';
  let mapData = null;
  let mapStartAddress = 0;
  let mapEndAddress = 0;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
  let webGLTileRenderer: WebGLTileRenderer | null = null;
  let tileRenderers: TileRenderer<any>[] = [];

  let intervalId: number | null = null;

  let panning: boolean = false;
  let screenPos: [number, number] = [0, 0];
  let tilePos: [number, number] = [0, 0];
  let screenPosLast: [number, number] = [0, 0];
  let tilePosLast: [number, number] = [0, 0];
  let screenPosDown: [number, number] = [0, 0];
  let tilePosDown: [number, number] = [0, 0];
  let panDown: [number, number] = [0, 0];

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
    mapData = micropolisengine.HEAPU16.slice(mapStartAddress, mapEndAddress);
    console.log("micropolisMain: mapStartAddress:", mapStartAddress, "mapEndAddress:", mapEndAddress, "mapData:", mapData);

  }

  function tick(): void {
    //console.log('tick');
    micropolisTick();
    renderAll();
  }

  async function micropolisTick() {
    //console.log('micropolisTick: micropolis:', micropolis);
    micropolis.simTick();
    micropolis.animateTiles();
  }

  function renderAll(): void {
    for (let tileRenderer of tileRenderers) {
      if (!tileRenderer || !tileRenderer.canvas) continue;
        mapData = micropolisengine.HEAPU16.slice(mapStartAddress, mapEndAddress);
        webGLTileRenderer.mapData = mapData;
        //console.log("renderAll: mapStartAddress:", mapStartAddress, "mapEndAddress:", mapEndAddress, "mapData:", mapData);
      tileRenderer.render();
    }
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

  function findTileRenderer(canvas: HTMLCanvasElement): TileRenderer<any> | null {
    if (!canvas) {
      return null;
    }
    for (let tileRenderer of tileRenderers) {
      if (tileRenderer.canvas == canvas) {
        return tileRenderer;
      }
    }
    return null;
  }

  function trackMouse(event: MouseEvent): TileRenderer<any> | null {
    let tileRenderer = findTileRenderer(event.target as HTMLCanvasElement);
    if (tileRenderer == null) {
      console.log('MicropolisView: trackMouse: no TileRenderer for event target:', event.target);
      return null;
    }

    screenPosLast = screenPos;
    tilePosLast = tilePos;

    screenPos = [
      event.offsetX, 
      event.offsetY,
    ];
    tilePos = tileRenderer.screenToTile(screenPos);

    //console.log('TileRenderer: trackMouse: event:', event, 'screenPosLast:', screenPosLast, 'screenPos:', screenPos, 'tilePos:', tilePos, 'tilePosLast:', tilePosLast, 'tileRenderer:', tileRenderer)

    return tileRenderer;
  }

  function panTo(panX: number, panY: number): void {
    //console.log('TileRenderer: panTo:', panX, panY);
    for (let tileRenderer of tileRenderers) {
      tileRenderer.panTo(panX, panY);
    }
  }

  function panBy(dx: number, dy: number): void {
    //console.log('TileRenderer: panBy:', dx, dy);
    for (let tileRenderer of tileRenderers) {
      tileRenderer.panBy(dx, dy);
    }
  }

  function zoomTo(zoom: number, centerX: number, centerY: number): void {
    for (let tileRenderer of tileRenderers) {
      tileRenderer.zoomTo(zoom);
    }
  }

  function zoomBy(zoomFactor: number): void {
    for (let tileRenderer of tileRenderers) {
      tileRenderer.zoomBy(zoomFactor);
    }
  }

  function onmousedown(event: MouseEvent): void {
    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    panning = true;
    screenPosDown = screenPos;
    panDown = [tileRenderer.panX, tileRenderer.panY];

    //console.log('MicropolisView: onmousedown: event:', event, 'target:', event.target, 'screenPos:', screenPos, 'panDown:', panDown);
  }

  function onmousemove(event: MouseEvent): void {
    if (!panning) return;

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    const screenDelta: [number, number] = [
      screenPosLast[0] - screenPos[0],
      screenPosLast[1] - screenPos[1],
    ];
    let tileDelta = tileRenderer.screenToTileDelta(screenDelta);

    //console.log('MicropolisView: onmousemove: event:', event, 'target:', event.target, 'screenDelta:', screenDelta, 'tileDelta:', tileDelta, 'tilePos:', tilePos, 'tilePosDown:', tilePosDown, 'screenPos:', screenPos, 'screenPosLast:', screenPosDown);

    panBy(tileDelta[0], tileDelta[1]);
    renderAll();
  }

  function onmouseup(event: MouseEvent): void {
    if (!panning) return;

    //console.log('MicropolisView: onmouseup: event:', event, 'target:', event.target);

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    panning = false;
    renderAll();
  }

  function onwheel(event: WheelEvent): void {
    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    //event.preventDefault();
    //event.stopPropagation();

    const delta = event.deltaY > 0 ? -zoomScale : zoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta

    zoomBy(zoomFactor);
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

  $effect(() => {
    //console.log('MicropolisView: $effect: ', 'tileWidth:', tileWidth, 'tileHeight:', tileHeight, 'tileCount:', tileCount, 'tileTextureWidth:', tileTextureWidth, 'tileTextureHeight:', tileTextureHeight, 'tileTexture:', tileTexture, 'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'mapLength:', mapLength, 'mapData:', mapData);

    micropolisMain();

    // Create 3d canvas drawing context and webGLTileRenderer.
    //console.log('MicropolisView: $effect:', 'canvasGL:', canvasGL);
    if (canvasGL == null) {
      console.log('MicropolisView: $effect: canvasGL is null!');
      return;
    }

    ctxGL = canvasGL.getContext('webgl2');
    //console.log('MicropolisView: $effect:', 'ctxGL:', ctxGL);
    if (ctxGL == null) {
      console.log('MicropolisView: $effect: no ctxGL!');
      return;
    }

    webGLTileRenderer = new WebGLTileRenderer();
    //console.log('MicropolisView: $effect: webGLTileRenderer:', webGLTileRenderer);
    if (webGLTileRenderer == null) {
      console.log('MicropolisView: $effect: no webGLTileRenderer!');
      return;
    }

    resizeCanvas();

    //console.log('MicropolisView: $effect: initialize:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'webGLTileRenderer:', webGLTileRenderer);

    webGLTileRenderer.initialize(canvasGL, ctxGL, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
      .then(() => {
        //console.log('MicropolisView: $effect: initialize: then:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'webGLTileRenderer:', webGLTileRenderer);

        if (canvasGL == null) {
          console.log('MicropolisView: $effect: initialize: then: no canvasGL!');
          return;
        }

        if (ctxGL == null) {
          console.log('MicropolisView: $effect: initialize: then: no ctxGL!');
          return;
        }

        if (webGLTileRenderer == null) {
          console.log('MicropolisView: $effect: initialize: then: no webGLTileRenderer!');
          return;
        }

        webGLTileRenderer.panTo(mapWidth * 0.5, mapHeight * 0.5);
        webGLTileRenderer.zoomTo(0.5);
        tileRenderers.push(webGLTileRenderer);

        webGLTileRenderer.render();
      });

    setFramesPerSecond(framesPerSecond);

    // Return a function to clean up the effect.
    return () => {
      //console.log('MicropolisView: $effect: clean up');
      setFramesPerSecond(0);
    };
  });

</script>

<svelte:window
  on:resize={resizeCanvas}
/>

<div class="fullscreen">
  <canvas
    bind:this={canvasGL}
    on:mousedown={onmousedown}
    on:mousemove={onmousemove}
    on:mouseup={onmouseup}
    on:wheel|passive={onwheel}
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
