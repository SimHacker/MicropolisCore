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
	let mapData =
	    Array.from(	// Generate a random map data
        {length: mapLength}, 
        () => Math.floor(Math.random() * tileCount));
  
  let canvasWidth: number = 512;
  let canvasHeight: number = 512;

  let canvas2D: HTMLCanvasElement | null = null;
  let ctx2D: CanvasRenderingContext2D | null = null;
	let canvasTileRenderer: CanvasTileRenderer | null = null;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
	let glTileRenderer: GLTileRenderer | null = null;

  let tileRenderers: TileRenderer<any>[] = [];

  let mouse = null;
  let last = null;


  function renderAll() {
    for (let tileRenderer of tileRenderers) {
      if (!tileRenderer || !tileRenderer.canvas) continue;
      tileRenderer.render();
    }
  };

  function onmousedown(event: Event) {
    console.log('TileView: onmousedown: event:', event, event.target);
  }

  function onmouseup(event: Event) {
    console.log('TileView: onmousedown: event:', event, event.target);
  }

  function onmousemove(event: Event) {
    console.log('TileView: onmousedown: event:', event, event.target);
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

				canvasTileRenderer.updateScreenSize(
					canvas2D.width, 
					canvas2D.height);

				canvasTileRenderer.panX = mapWidth / 2;
				canvasTileRenderer.panY = mapHeight / 2;

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

        tileRenderers.push(glTileRenderer);

			});


      // Return a function to clean up the effect.
      return () => {
        console.log('TileView: $effect: clean up')
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
