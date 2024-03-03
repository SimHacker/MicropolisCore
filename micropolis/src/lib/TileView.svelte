<script lang="ts">

  import tiles_png from '$lib/images/tiles.png';
	import { TileRenderer, CanvasTileRenderer, GLTileRenderer } from '$lib/TileRenderer';


  type Props = {
    name?: string;
  };


  let { 
    name = "Tile View", 
  } = $props<Props>();

  let tileWidth: number = 16;
	let tileHeight: number = 16;
  let tileCount: number = 960;
  let tileTextureWidth: number = 256;
  let tileTextureHeight: number = 960;
	let tileTexture: string = tiles_png;

  let mapWidth: number = 256;
	let mapHeight: number = 256;
  let mapLength: number = mapWidth * mapHeight;
	let mapData: Uint16Array =
    new Uint16Array(
        Array.from(	// Generate a random map data
          {length: mapLength}, 
          () => Math.floor(Math.random() * tileCount)));
  
  let canvasWidth: number = 512;
  let canvasHeight: number = 512;

  let canvas2D: HTMLCanvasElement | null = null;
  let ctx2D: CanvasRenderingContext2D | null = null;
	let canvasTileRenderer: CanvasTileRenderer | null = null;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
	let glTileRenderer: GLTileRenderer | null = null;

  let tileRenderers: TileRenderer<any>[] = [];

  let framesPerSecond: number = 10;
  let zoomScale: number = 0.1;
  let intervalId: number | null = null;

  let mousePanning: boolean = false;
  let mousePos: [number, number] = [0, 0];
  let mousePosLast: [number, number] = [0, 0];


  function renderAll() {

    for (let i = 0, n = mapData.length; i < n; i++) {
      mapData[i] = Math.floor(Math.random() * tileCount);
    }

    for (let tileRenderer of tileRenderers) {
      if (!tileRenderer || !tileRenderer.canvas) continue;
      tileRenderer.render();
    }

  };


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

    mousePosLast = mousePos;
    mousePos = tileRenderer.screenToTile(event.clientX, event.clientY);
    console.log('TileRenderer: trackMouse: event:', event, 'mousePosLast:', mousePosLast, 'mousePos:', mousePos, 'tileRenderer:', tileRenderer)

    return tileRenderer;
  }


  function panBy(dx: number, dy: number): void {
    console.log('TileRenderer: panBy:', dx, dy);
    for (let tileRenderer of tileRenderers) {
      tileRenderer.panX += dx;
      tileRenderer.panY += dy;
    }
  }


  function zoomBy(zoomFactor: number, centerX: number, centerY: number): void {
    console.log('TileRenderer: zoomBy:', zoomFactor, centerX, centerY);
    for (let tileRenderer of tileRenderers) {
      tileRenderer.handleZoom(zoomFactor, centerX, centerY);
    }
  }


  function onmousedown(event: MouseEvent): void {
    console.log('TileView: onmousedown: event:', event, 'target:', event.target);

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    mousePanning = true;
  }


  function onmousemove(event: MouseEvent): void {
    if (!mousePanning) return;

    console.log('TileView: onmousemove: event:', event, 'target:', event.target);

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    let dx = mousePosLast[0] - mousePos[0];
    let dy = mousePosLast[1] - mousePos[1];

    panBy(dx, dy);
    renderAll();
  }


  function onmouseup(event: MouseEvent): void {
    if (!mousePanning) return;

    console.log('TileView: onmouseup: event:', event, 'target:', event.target);

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    let dx = mousePosLast[0] - mousePos[0];
    let dy = mousePosLast[1] - mousePos[1];

    panBy(dx, dy);
    renderAll();
  }


  function onmousewheel(event: WheelEvent): void {

    let tileRenderer = trackMouse(event);
    if (!tileRenderer) return;

    const delta = event.deltaY > 0 ? -zoomScale : zoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta

    zoomBy(zoomFactor, mousePos[0], mousePos[1]);
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
        renderAll, 
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

        canvasTileRenderer.render();

        tileRenderers.push(canvasTileRenderer);

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
  ></canvas>

  <br/>

  <canvas
    bind:this={canvasGL}
    width="{canvasWidth}"
    height="{canvasHeight}"
    onmousedown={onmousedown}
    onmousemove={onmousemove}
    onmouseup={onmouseup}
  ></canvas>

</div>


<style>

  canvas {
    display: block;
  }

</style>
