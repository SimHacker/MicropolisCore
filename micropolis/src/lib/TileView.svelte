<script lang="ts">

  import tiles_png from '$lib/images/tiles.png';
	import { onMount } from 'svelte';
	import { TileRenderer, CanvasTileRenderer, GLTileRenderer } from '$lib/TileRenderer';


  let mouse = null;
  let last = null;
  let mapWidth: number = 256;
	let mapHeight: number = 256;
  let mapLength: number = mapWidth * mapHeight;
	let tileWidth: number = 16;
	let tileHeight: number = 16;
  let tileCount: number = 960;
  let tileTextureWidth: number = 256;
  let tileTextureHeight: number = 960;
	let tileTexture: string = tiles_png;

  let canvas2D: HTMLCanvasElement | null = null;
  let ctx2D: CanvasRenderingContext2D | null = null;
	let canvasTileRenderer: CanvasTileRenderer | null = null;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
	let glTileRenderer: GLTileRenderer | null = null;


	// Generate a random map data
	const mapData = 
	    Array.from(
			{length: mapLength}, 
			() => Math.floor(Math.random() * 256));


	onMount(() => {

    console.log('TileView: onMount: ', 'mapData:', mapData, 'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'mapLength:', mapLength, 'tileWidth:', tileWidth, 'tileWidth:', tileHeight, 'tileCount:', tileCount, 'tileTexture:', tileTexture, 'tileTextureWidth:', tileTextureWidth, 'tileTextureHeight:', tileTextureHeight, 'tileTexture:', tileTexture);

		// Create 2d canvas drawing context and CanvasTileRenderer.

		console.log('TileView: onMount:', 'canvas2D:', canvas2D);
		if (canvas2D == null) {
			console.log('TileView: onMount: canvas2D is null!');
			return;
		}

    ctx2D = 
      canvas2D.getContext('2d');
    console.log('TileView: onMount:', 'ctx2D:', ctx2D);
    if (ctx2D == null) {
      console.log('TileView: onMount: no ctx!');
      return;
    }

    canvasTileRenderer = 
        new CanvasTileRenderer();
    console.log('TileView: onMount: canvasTileRenderer:', canvasTileRenderer);
    if (canvasTileRenderer == null) {
      console.log('TileView: onMount: no canvasTileRenderer!');
      return;
    }

		console.log('TileView: onMount: initialize:', 'canvas2D:', canvas2D, 'ctx2D:', ctx2D, 'canvasTileRenderer:', canvasTileRenderer);

		canvasTileRenderer.initialize(ctx2D, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {

				console.log('TileView: onMount: initialize: then:', 'canvas2D:', canvas2D, 'ctx2D:', ctx2D, 'canvasTileRenderer:', canvasTileRenderer);

				if (canvas2D == null) {
					console.log('TileView: onMount: initialize: then: no canvas2D!');
					return;
				}

				if (ctx2D == null) {
					console.log('TileView: onMount: initialize: then: no ctx2D!');
					return;
				}

				if (canvasTileRenderer == null) {
					console.log('TileView: onMount: initialize: then: no canvasTileRenderer!');
					return;
				}

				canvasTileRenderer.updateScreenSize(
					canvas2D.width, 
					canvas2D.height);

				canvasTileRenderer.panX = mapWidth / 2;
				canvasTileRenderer.panY = mapHeight / 2;

				canvasTileRenderer.render();
			});

		// Create GLTileRenderer.
		
		console.log('TileView: onMount:', 'canvasGL:', canvasGL);
		if (canvasGL == null) {
			console.log('TileView: onMount: canvasGL is null!');
			return;
		}

		ctxGL =
      canvasGL.getContext('webgl2');
		console.log('TileView: onMount:', 'ctxGL:', ctxGL);
		if (ctxGL == null) {
			console.log('TileView: onMount: no ctxGL!');
			return;
		}

		glTileRenderer = new 
		    GLTileRenderer();
		console.log('TileView: onMount: glTileRenderer:', glTileRenderer);
		if (canvasTileRenderer == null) {
			console.log('TileView: onMount: no glTileRenderer!');
			return;
		}

    console.log('TileView: onMount: initialize:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'glTileRenderer:', glTileRenderer);

		glTileRenderer.initialize(ctxGL, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {

        console.log('TileView: onMount: initialize: then:', 'canvasGL:', canvasGL, 'ctxGL:', ctxGL, 'glTileRenderer:', glTileRenderer);

				if (canvasGL == null) {
					console.log('TileView: onMount: initialize: then: no canvasGL!');
					return;
				}

				if (ctxGL == null) {
					console.log('TileView: onMount: initialize: then: no ctxGL!');
					return;
				}

				if (glTileRenderer == null) {
					console.log('TileView: onMount: initialize: then: no glTileRenderer!');
					return;
				}

				glTileRenderer.updateScreenSize(
					canvasGL.width, 
					canvasGL.height);
				
				glTileRenderer.panX = mapWidth / 2;
				glTileRenderer.panY = mapHeight / 2;

				glTileRenderer.render();
			});
  });
</script>


<div>
  <canvas bind:this={canvas2D} width="512" height="512"></canvas>
  <br/>
  <canvas bind:this={canvas2D} width="512" height="512"></canvas>
</div>


<style>

  canvas {
    display: block;
  }

</style>
