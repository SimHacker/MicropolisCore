<script lang="ts">
	import tiles_png from '$lib/images/tiles.png';
	import { onMount } from 'svelte';
	import { TileRenderer, CanvasTileRenderer, GLTileRenderer } from '$lib/TileRenderer';

	let canvasTileRenderer_canvas: HTMLCanvasElement | null = null;
	let glTileRenderer_canvas: HTMLCanvasElement | null = null;
	let canvasTileRenderer: CanvasTileRenderer | null = null;
	let glTileRenderer: GLTileRenderer | null = null;
	const mapWidth = 256;
	const mapHeight = 256;
	const tileWidth = 16;
	const tileHeight = 16;
	const tileTexture = tiles_png;

	// Generate a random map data
	const mapData = 
	    Array.from(
			{length: mapWidth * mapHeight}, 
			() => Math.floor(Math.random() * 256));

	onMount(() => {

		console.log('TileEngine Test: onMount:', 'canvasTileRenderer_canvas:', canvasTileRenderer_canvas);
		if (canvasTileRenderer_canvas == null) {
			console.log('TileEngine Test: onMount: canvasTileRenderer_canvas is null!');
			return;
		}
		if (glTileRenderer_canvas == null) {
			console.log('TileEngine Test: onMount: glTileRenderer_canvas is null!');
			return;
		}

		// Create CanvasTileRenderer.
		
		const canvasTileRenderer_context: CanvasRenderingContext2D | null = 
		    canvasTileRenderer_canvas.getContext('2d');
		console.log('TileEngine Test: onMount:', 'canvasTileRenderer_context:', canvasTileRenderer_context);
		if (canvasTileRenderer_context == null) {
			console.log('TileEngine Test: onMount: no canvasTileRenderer_context!');
			return;
		}

		canvasTileRenderer = 
		    new CanvasTileRenderer();
		console.log('TileEngine Test: onMount: canvasTileRenderer:', canvasTileRenderer);
		if (canvasTileRenderer == null) {
			console.log('TileEngine Test: onMount: no canvasTileRenderer!');
			return;
		}

		console.log('TileEngine Test: onMount: initialize:', 'canvasTileRenderer_context:', canvasTileRenderer_context, 'mapData:', mapData, 'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'tileWidth:', tileWidth, 'tileWidth:', tileHeight, 'tileTexture:', tileTexture);

		canvasTileRenderer.initialize(canvasTileRenderer_context, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {

				console.log('TileEngine Test: onMount: initialize: then:', 'canvasTileRenderer_context:', canvasTileRenderer_context, 'canvasTileRenderer:', canvasTileRenderer);

				if (canvasTileRenderer == null) {
					console.log('TileEngine Test: onMount: initialize: then: no canvasTileRenderer!');
					return;
				}

				if (canvasTileRenderer_canvas == null) {
					console.log('TileEngine Test: onMount: initialize: then: no glTileRenderer_canvas!');
					return;
				}

				canvasTileRenderer.updateScreenSize(
					canvasTileRenderer_canvas.width, 
					canvasTileRenderer_canvas.height);

				canvasTileRenderer.render();
			});

		// Create GLTileRenderer.
		
		const glTileRenderer_context: WebGL2RenderingContext | null = 
		    glTileRenderer_canvas.getContext('webgl2');
		console.log('TileEngine Test: onMount:', 'glTileRenderer_context:', glTileRenderer_context);
		if (glTileRenderer_context == null) {
			console.log('TileEngine Test: onMount: no glTileRenderer_context!');
			return;
		}

		glTileRenderer = new 
		    GLTileRenderer();
		console.log('TileEngine Test: onMount: glTileRenderer:', glTileRenderer);
		if (canvasTileRenderer == null) {
			console.log('TileEngine Test: onMount: no glTileRenderer!');
			return;
		}

		console.log('TileEngine Test: onMount: initialize:', 'glTileRenderer_context:', glTileRenderer_context, 'mapData:', mapData, 'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'tileWidth:', tileWidth, 'tileWidth:', tileHeight, 'tileTexture:', tileTexture);

		glTileRenderer.initialize(glTileRenderer_context, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {

				console.log('TileEngine Test: onMount: initialize: then:', 'glTileRenderer_context:', glTileRenderer_context, 'glTileRenderer:', glTileRenderer);

				if (glTileRenderer == null) {
					console.log('TileEngine Test: onMount: initialize: then: no glTileRenderer!');
					return;
				}

				if (glTileRenderer_canvas == null) {
					console.log('TileEngine Test: onMount: initialize: then: no glTileRenderer_canvas!');
					return;
				}

				glTileRenderer.updateScreenSize(
					glTileRenderer_canvas.width, 
					glTileRenderer_canvas.height);
				
				glTileRenderer.render();
			});

	});

</script>

<svelte:head>
	<title>Micropolis Home</title>
	<meta name="description" content="Micropolis Home" />
</svelte:head>

<section>
	<h3>CanvasTileRenderer:</h3>
	<canvas bind:this={canvasTileRenderer_canvas} width="512" height="512"></canvas>
	<h3>GLTileRenderer:</h3>
	<canvas bind:this={glTileRenderer_canvas} width="512" height="512"></canvas>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}

</style>
