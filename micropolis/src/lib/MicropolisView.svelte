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
        //console.log('MicropolisCallback: makeSound:', 'channel:', channel, 'sound:', sound, 'x:', x, 'y:', y);
    }

    newGame(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: newGame');
    }

    saveCityAs(micropolis: micropolisengine.Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallback: saveCityAs:', 'filename:', filename);
    }

    sendMessage(micropolis: micropolisengine.Micropolis, callbackVal: any, messageIndex: number, x: number, y: number, picture: boolean, important: boolean): void {
        //console.log('MicropolisCallback: sendMessage:', 'messageIndex:', messageIndex, 'x:', x, 'y:', y, 'picture:', picture, 'important:', important);
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
        //console.log('MicropolisCallback: updateBudget');
    }

    updateCityName(micropolis: micropolisengine.Micropolis, callbackVal: any, cityName: string): void {
        console.log('MicropolisCallback: updateCityName:', 'cityName:', cityName);
    }

    updateDate(micropolis: micropolisengine.Micropolis, callbackVal: any, cityYear: number, cityMonth: number): void {
        //console.log('MicropolisCallback: updateDate:', 'cityYear:', cityYear, 'cityMonth:', cityMonth);
    }

    updateDemand(micropolis: micropolisengine.Micropolis, callbackVal: any, r: number, c: number, i: number): void {
        //console.log('MicropolisCallback: updateDemand:', 'r:', r, 'c:', c, 'i:', i);
    }

    updateEvaluation(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        //console.log('MicropolisCallback: updateEvaluation');
    }

    updateFunds(micropolis: micropolisengine.Micropolis, callbackVal: any, totalFunds: number): void {
        //console.log('MicropolisCallback: updateFunds:', 'totalFunds:', totalFunds);
    }

    updateGameLevel(micropolis: micropolisengine.Micropolis, callbackVal: any, gameLevel: number): void {
        console.log('MicropolisCallback: updateGameLevel:', 'gameLevel:', gameLevel);
    }

    updateHistory(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        //console.log('MicropolisCallback: updateHistory');
    }

    updateMap(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        //console.log('MicropolisCallback: updateMap');
    }

    updateOptions(micropolis: micropolisengine.Micropolis, callbackVal: any): void {
        console.log('MicropolisCallback: updateOptions');
    }

    updatePasses(micropolis: micropolisengine.Micropolis, callbackVal: any, passes: number): void {
        //console.log('MicropolisCallback: updatePasses:', 'passes:', passes);
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
  let framesPerSecond = 60;
  let pausedFramesPerSecond = 60;
  let paused = false;
  const keyFramesPerSecondValues = [ 1, 5, 10, 30, 60, 120, 120, 120, 120 ];
  const keyPassesValues =          [ 1, 1, 1,  1,  1,  1,   4,   10,  50  ];
  

  let micropolis = null;
  let mapData = null;
  let mapStartAddress = 0;
  let mapEndAddress = 0;
  let cityFileName = '/cities/haight.cty';
  let cityFileNames = [
    "/cities/about.cty",
    "/cities/badnews.cty",
    "/cities/bluebird.cty",
    "/cities/bruce.cty",
    "/cities/deadwood.cty",
    "/cities/finnigan.cty",
    "/cities/freds.cty",
    "/cities/haight.cty",
    "/cities/happisle.cty",
    "/cities/joffburg.cty",
    "/cities/kamakura.cty",
    "/cities/kobe.cty",
    "/cities/kowloon.cty",
    "/cities/kyoto.cty",
    "/cities/linecity.cty",
    "/cities/med_isle.cty",
    "/cities/ndulls.cty",
    "/cities/neatmap.cty",
    "/cities/radial.cty",
    "/cities/scenario_bern.cty",
    "/cities/scenario_boston.cty",
    "/cities/scenario_detroit.cty",
    "/cities/scenario_dullsville.cty",
    "/cities/scenario_hamburg.cty",
    "/cities/scenario_rio_de_janeiro.cty",
    "/cities/scenario_san_francisco.cty",
    "/cities/scenario_tokyo.cty",
    "/cities/senri.cty",
    "/cities/southpac.cty",
    "/cities/splats.cty",
    "/cities/wetcity.cty",
    "/cities/yokohama.cty",
  ];

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
  let tileRenderer: TileRenderer | null = null;

  let tickIntervalId: number | null = null;
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
  let heatFlowRange = 200;
  let showAbout = true;

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

  }

  function startAutoRepeat(key): void {
    if (autoRepeatKeys.indexOf(key) < 0) {
      autoRepeatKeys.push(key);
    }
    if (autoRepeatIntervalId === null) {
      autoRepeatIntervalId = setInterval(handleAutoRepeat, autoRepeatDelay);
    }
  }

  function stopAutoRepeat(key): void {
    if (autoRepeatKeys.indexOf(key) >= 0) {
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
    renderAll();
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

    if (tileRender != null) {
      tilePos = tileRenderer.screenToTile(screenPos);
      //console.log('trackMouse: event:', event, 'screenPos:', screenPos, 'tilePos:', tilePos);
    }
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
    const key = event.keyCode;
    if ((key >= 48) && (key <= 57)) { // digits
      const digit = key - 48;
      if (digit == 0) {
        setPaused(!paused);
      } else {
        setFramesPerSecond(keyFramesPerSecondValues[digit - 1]);
        micropolis.setPasses(keyPassesValues[digit - 1]);
        setPaused(false);
      }
    } else if ((key >= 64) && (key <= 90)) { // letters
      const letter = key - 64;
      const city = cityFileNames[letter % cityFileNames.length];
      //console.log("CITY", city);
      micropolis.loadCity(city);
      tick();
    } else switch (key) {
      case 32:
        if (micropolis.heatSteps) {
          micropolis.heatSteps = 0;
        } else {
          micropolis.heatSteps = 1;
          if (Math.random() < 0.9) {
            micropolis.heatRule = 0;
          } else {
            micropolis.heatRule = 1;
            micropolis.heatFlow = Math.round(((Math.random() * 2.0) - 1.0) * heatFlowRange);
          }
        }
        tick();
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
        micropolis.setCityTax(Math.max(0, micropolis.cityTax - 1));
        break;
      case 221:
        micropolis.setCityTax(Math.min(20, micropolis.cityTax + 1));
        break;
    }
  }
  
  function onkeyup(event: KeyboardEvent): void {
    //console.log('MicropolisView: onkeyup: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    const key = event.keyCode;
    switch (key) {
      case 37: 
        leftKeyDown = false; 
        stopAutoRepeat(key);
        break;
      case 39: 
        rightKeyDown = false; 
        stopAutoRepeat(key);
        break;
      case 38:
        upKeyDown = false;
        stopAutoRepeat(key);
        break;
      case 40:
        downKeyDown = false;
        stopAutoRepeat(key);
        break;
      case 188:
        inKeyDown = false;
        stopAutoRepeat(key);
        break;
      case 190:
        outKeyDown = false;
        stopAutoRepeat(key);
        break;
    }
  }
  
  function onwheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -wheelZoomScale : wheelZoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta
    //console.log('onwheel: event:', event, 'delta:', delta, 'zoomFactor:', zoomFactor);
    tileRenderer.zoomBy(zoomFactor);
    renderAll();
  }

  function resetFramesPerSecond() {
    const lastFramesPerSecond = framesPerSecond;
    setFramesPerSecond(0);
    setFramesPerSecond(lastFramesPerSecond);
  }

  function setFramesPerSecond(fps: number): void {
    //console.log('setFramesPerSecond: fps:', fps);
    framesPerSecond = fps;

    if (tickIntervalId !== null) {
        clearInterval(tickIntervalId);
    }

    if (fps <= 0) {
      if (tickIntervalId !== null) {
        clearInterval(tickIntervalId);
        tickIntervalId = null;
      }
      return;
    }

    const delay = 1000 / fps;
    tickIntervalId = setInterval(tick, delay);
  }

  function setPaused(nowPaused) {
    console.log('setPaused: nowPaused:', nowPaused);
    const wasPaused = paused;
    paused = nowPaused;
    micropolis.simPaused = nowPaused;
    if (!wasPaused && nowPaused) {
      if (framesPerSecond !== 0) {
        pausedFramesPerSecond = framesPerSecond;
      }
      setFramesPerSecond(0);
    } else if (wasPaused && !nowPaused) {
      framesPerSecond = pausedFramesPerSecond;
      setFramesPerSecond(framesPerSecond);
    } else {
      resetFramesPerSecond();
    }
    tick();
  }

  function refocusCanvas() {
    if (canvasGL && 
        (document.activeElement !== canvasGL)) {
      canvasGL.focus();
    }
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

    document.addEventListener('focusin', refocusCanvas);
    canvasGL.addEventListener('focusout', refocusCanvas);
    canvasGL.addEventListener('wheel', onwheel, {passive: false});

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

        const scrollTop = 
            window.pageYOffset || window.document.documentElement.scrollTop;
        const scrollLeft = 
            window.pageXOffset || window.document.documentElement.scrollLeft;
        window.onscroll = function() {
          console.log(scrollLeft, scrollTop);
          window.scrollTo(scrollLeft, scrollTop);
        };

        tileRenderer.panTo(mapWidth * 0.5, mapHeight * 0.5);
        tileRenderer.zoomTo(1.0);
        tileRenderer.render();
      });

    refocusCanvas();

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
  ></canvas>
</div>

<div class="fullscreen mouseless">
  <div
    class="about-show {showAbout ? 'about-show-opened' : 'about-show-closed'}"
    onclick="{(event) => showAbout = !showAbout}"
  >{showAbout ? "➖" : "➕"}</div>
  {#if showAbout}
    <div class="about-div">
      <b>This is Micropolis in WebAssembly!</b><br/>
      Based on the original SimCity sources,<br/>
      designed by Will Wright, ported by Don Hopkins.<br/>
      <a
        target="_new"
        href="https://github.com/SimHacker/MicropolisCore"
      >https://github.com/SimHacker/MicropolisCore</a><br/>
      Left button drag to pan, mouse wheel to zoom.<br/>
      Arrow keys pan, comma and period zoom. <br/>
      Letter keys load various classic cities.<br/>
      Numeric keys set the speed, 0 toggles pause.<br/>
      The brackets lower and raise the tax rate.<br/>
      WARNING: DO NOT hit the space bar,<br/>
      because that will open up the 
      <a
        target="_new"
        href="https://www.youtube.com/watch?v=WPMeWas4kXM"
      >Space Inventory</a><br/>
    </div>
  {/if}
</div>

<style>

  .mouseless {
    pointer-events: none;
  }

  .fullscreen {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .about-show {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 20px;
    height: 20px;
    z-index: 25;
    pointer-events: auto;
    cursor: pointer;
    border: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    padding-top: 2px;
    color: white;
  }

  .about-show-opened {
    background: #ffffff80;
    color: white;
  }

  .about-show-closed {
    background: #ffffff80;
  }

  .about-div {
    position: absolute;
    padding-left: 30px;
    padding-top: 5px;
    padding-right: 5px;
    padding-bottom: 5px;
    font-size: 12px;
    color: white;
    z-index: 20
    pointer-events: none;
    user-select: none;
    text-shadow: 
      1px 1px 0 black, /* Right and down */
      -1px -1px 0 black, /* Left and up */
      -1px 1px 0 black, /* Left and down */
      1px -1px 0 black; /* Right and up */
    background: #00000080;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
  }

  .about-div b {
    font-size: 1.4em;
  }

  .about-div a {
    pointer-events: auto; /* Allows the link to be clickable */
    user-select: auto; /* Allows the link to be selectable */
    color: yellow; /* Optional: Different color for better visibility */
    text-decoration: underline; /* Optional: Underline to indicate it's a link */
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
