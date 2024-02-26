<script lang="ts">
	import tiles_png from '$lib/images/tiles.png';

	import { onMount } from 'svelte';
	import { TileRenderer, CanvasTileRenderer } from '$lib/TileRenderer';

	let canvas: HTMLCanvasElement | null = null;
	let renderer: CanvasTileRenderer | null = null;
	const mapWidth = 256;
	const mapHeight = 256;
	const tileWidth = 16;
	const tileHeight = 16;
	const tileTexture = tiles_png;

	// Generate a random map data
	const mapData = Array.from({ length: mapWidth * mapHeight }, () => Math.floor(Math.random() * 256));

	onMount(() => {

		console.log('TileEngine Test: onMount:', 'canvas:', canvas);
		if (canvas == null) {
			console.log('TileEngine Test: onMount: canvas is null!');
			return;
		}

		const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
		console.log('TileEngine Test: onMount:', 'context:', context);
		if (context == null) {
			console.log('TileEngine Test: onMount: no 2d canvas context!');
			return;
		}

		renderer = new CanvasTileRenderer();
		console.log('TileEngine Test: onMount: renderer:', renderer);
		if (renderer == null) {
			console.log('TileEngine Test: onMount: no CanvasTileRenderer!');
			return;
		}

		console.log('TileEngine Test: onMount: initialize:', 'context:', context, 'mapData:', mapData, 'mapWidth:', mapWidth, 'mapHeight:', mapHeight, 'tileWidth:', tileWidth, 'tileWidth:', tileHeight, 'tileTexture:', tileTexture);

		renderer.initialize(context, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTexture)
			.then(() => {
				console.log('TileEngine Test: onMount: initialize: then:', 'context:', context, 'renderer:', renderer);
				if (renderer == null) {
					console.log('no renderer!');
					return;
				}
				renderer.render();
			});

	});
</script>

<svelte:head>
	<title>Micropolis Home</title>
	<meta name="description" content="Micropolis Home" />
</svelte:head>

<section>
	<script>
	</script>
	
	<canvas bind:this={canvas} width="512" height="512"></canvas> <!-- Set desired canvas size -->
	
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
