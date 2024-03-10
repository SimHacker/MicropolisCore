<script lang="ts">

  import tiles_png from '$lib/images/tiles.png';
	import { TileRenderer, CanvasTileRenderer, GLTileRenderer } from '$lib/TileRenderer';

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
    canvasWidth?: number;
    canvasHeight?: number;
    framesPerSecond?: number;
    zoomScale?: number;
  };


  // Bind propertis from attributes and defaults.

  let { 
    tileWidth = 16,
    tileHeight = 16,
    tileCount = 960,
    tileTextureWidth = 256,
    tileTextureHeight = 960,
    tileTexture = tiles_png,
    mapWidth = 1,
    mapHeight = 1,
    mapLength = mapWidth * mapHeight,
    mapData = new Uint16Array(
      Array.from(	// Generate a random map data
        {length: mapLength}, 
        () => Math.floor(Math.random() * tileCount))),
    canvasWidth = 512,
    canvasHeight = 512,
    framesPerSecond = 1,
    zoomScale = 0.025,
  } = $props<Props>();


  // Component private state.

  let canvas2D: HTMLCanvasElement | null = null;
  let ctx2D: CanvasRenderingContext2D | null = null;
	let canvasTileRenderer: CanvasTileRenderer | null = null;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
	let glTileRenderer: GLTileRenderer | null = null;

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


  function simulate(): void {

    for (let i = 0, n = mapData.length; i < n; i++) {
      mapData[i] = i % tileCount;
    }

  }


  function renderAll(): void {

    for (let tileRenderer of tileRenderers) {
      if (!tileRenderer || !tileRenderer.canvas) continue;
      tileRenderer.render();
    }
  }

  
  function tick(): void {
    simulate();
    renderAll();
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

    let tileRenderer = 
      findTileRenderer(event.target as HTMLCanvasElement);
    if (tileRenderer == null) {
      console.log('TileView: trackMouse: no TileRenderer for event target:', event.target);
      return null;
    }

    screenPosLast = screenPos;
    tilePosLast = tilePos;

    screenPos = [
      event.offsetX, 
      event.offsetY,
    ];
    tilePos = tileRenderer.screenToTile(screenPos);

    console.log('TileRenderer: trackMouse: event:', event, 'screenPosLast:', screenPosLast, 'screenPos:', screenPos, 'tilePos:', tilePos, 'tilePosLast:', tilePosLast, 'tileRenderer:', tileRenderer)

    return tileRenderer;
  }


  function panTo(panX: number, panY: number): void {
    console.log('TileRenderer: panTo:', panX, panY);
    
    for (let tileRenderer of tileRenderers) {
      tileRenderer.panTo(panX, panY);
    }

  }


  function panBy(dx: number, dy: number): void {
    console.log('TileRenderer: panBy:', dx, dy);
    
    for (let tileRenderer of tileRenderers) {
      tileRenderer.panBy(dx, dy);
    }

  }


  function zoomTo(zoom: number, centerX: number, centerY: number): void {
    //console.log('TileRenderer: zoomTo:', zoom, centerX, centerY);

    for (let tileRenderer of tileRenderers) {
      tileRenderer.zoomTo(zoom);
    }

  }


  function zoomBy(zoomFactor: number): void {
    //console.log('TileRenderer: zoomBy:', zoomFactor);

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

    console.log('TileView: onmousedown: event:', event, 'target:', event.target, 'screenPos:', screenPos, 'panDown:', panDown);
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

    console.log('TileView: onmousemove: event:', event, 'target:', event.target, 'screenDelta:', screenDelta, 'tileDelta:', tileDelta, 'tilePos:', tilePos, 'tilePosDown:', tilePosDown, 'screenPos:', screenPos, 'screenPosLast:', screenPosDown);

    panBy(tileDelta[0], tileDelta[1]);
    
    renderAll();
  }


  function onmouseup(event: MouseEvent): void {
    if (!panning) return;

    console.log('TileView: onmouseup: event:', event, 'target:', event.target);

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    panning = false;

    renderAll();
  }


  function onwheel(event: WheelEvent): void {

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    event.preventDefault();
    event.stopPropagation();

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

    intervalId = 
      setInterval(
        tick, 
        1000 / framesPerSecond);
  }


  $effect(() => {


    console.log('TileView: $effect: ', 
      'tileWidth:', tileWidth, 'tileHeight:', tileHeight, 'tileCount:', tileCount, 
      'tileTextureWidth:', tileTextureWidth, 'tileTextureHeight:', tileTextureHeight, 'tileTexture:', tileTexture, 
      'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'mapLength:', mapLength, 'mapData:', mapData);


		// Create 2d canvas drawing context and CanvasTileRenderer.

		console.log('TileView: $effect:', 'canvas2D:', canvas2D);
		if (canvas2D == null) {
			console.log('TileView: $effect: canvas2D is null!');
			return;
		}

    ctx2D = 
      canvas2D.getContext(
        '2d');
    console.log('TileView: $effect:', 'ctx2D:', ctx2D);
    if (ctx2D == null) {
      console.log('TileView: $effect: no ctx!');
      return;
    }

    canvasTileRenderer = 
        new CanvasTileRenderer();
    console.log('TileView: $effect: canvasTileRenderer:', canvasTileRenderer);
    if (canvasTileRenderer == null) {
      console.log('TileView: $effect: no canvasTileRenderer!');
      return;
    }

		console.log('TileView: $effect: initialize:', 'canvas2D:', canvas2D, 'ctx2D:', ctx2D, 'canvasTileRenderer:', canvasTileRenderer);

		canvasTileRenderer.initialize(canvas2D, ctx2D, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {

				console.log('TileView: $effect: initialize: then:', 'canvas2D:', canvas2D, 'ctx2D:', ctx2D, 'canvasTileRenderer:', canvasTileRenderer);

				if (canvas2D == null) {
					console.log('TileView: $effect: initialize: then: no canvas2D!');
					return;
				}

				if (ctx2D == null) {
					console.log('TileView: $effect: initialize: then: no ctx2D!');
					return;
				}

				if (canvasTileRenderer == null) {
					console.log('TileView: $effect: initialize: then: no canvasTileRenderer!');
					return;
				}

        canvasTileRenderer.panTo(mapWidth * 0.5, mapHeight * 0.5);
        canvasTileRenderer.zoomTo(1);

        tileRenderers.push(canvasTileRenderer);

        canvasTileRenderer.render();

			});


		// Create 3d canvas drawing context and GLTileRenderer.
		
		console.log('TileView: $effect:', 'canvasGL:', canvasGL);
		if (canvasGL == null) {
			console.log('TileView: $effect: canvasGL is null!');
			return;
		}

		ctxGL =
      canvasGL.getContext(
        'webgl2');
		console.log('TileView: $effect:', 'ctxGL:', ctxGL);
		if (ctxGL == null) {
			console.log('TileView: $effect: no ctxGL!');
			return;
		}

		glTileRenderer = new 
		    GLTileRenderer();
		console.log('TileView: $effect: glTileRenderer:', glTileRenderer);
		if (canvasTileRenderer == null) {
			console.log('TileView: $effect: no glTileRenderer!');
			return;
		}

    console.log('TileView: $effect: initialize:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'glTileRenderer:', glTileRenderer);

		glTileRenderer.initialize(canvasGL, ctxGL, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {

        console.log('TileView: $effect: initialize: then:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'glTileRenderer:', glTileRenderer);

				if (canvasGL == null) {
					console.log('TileView: $effect: initialize: then: no canvasGL!');
					return;
				}

				if (ctxGL == null) {
					console.log('TileView: $effect: initialize: then: no ctxGL!');
					return;
				}

				if (glTileRenderer == null) {
					console.log('TileView: $effect: initialize: then: no glTileRenderer!');
					return;
				}

        glTileRenderer.panTo(mapWidth * 0.5, mapHeight * 0.5);
        glTileRenderer.zoomTo(1);

        tileRenderers.push(glTileRenderer);

        glTileRenderer.render();

      });


      setFramesPerSecond(framesPerSecond);

      // Return a function to clean up the effect.
      return () => {
        console.log('TileView: $effect: clean up');

        setFramesPerSecond(0);
      };

  });


</script>


<div>

  <canvas
    bind:this={canvas2D}
    width="{canvasWidth}"
    height="{canvasHeight}"
    onmousedown={onmousedown}
    onmousemove={onmousemove}
    onmouseup={onmouseup}
    onwheel={onwheel}
  ></canvas>

  <br/>

  <canvas
    bind:this={canvasGL}
    width="{canvasWidth}"
    height="{canvasHeight}"
    onmousedown={onmousedown}
    onmousemove={onmousemove}
    onmouseup={onmouseup}
    onwheel={onwheel}
  ></canvas>

</div>


<style>

  canvas {
    display: block;
  }

</style>
