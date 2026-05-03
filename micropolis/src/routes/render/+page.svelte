<script lang="ts">
	import { onMount } from 'svelte';
	import { renderMicropolisMapSoftware, type TileAtlas } from '$lib/render/software';
	import type { RenderDescription } from '$lib/render/description';

	let { data }: { data: { renderDescription: RenderDescription } } = $props();
	let canvas: HTMLCanvasElement;
	let status = $state('pending');

	function checkerAtlas(): TileAtlas {
		const tileWidth = data.renderDescription.map.tile_width;
		const tileHeight = data.renderDescription.map.tile_height;
		const atlas = new Uint8ClampedArray(tileWidth * tileHeight * 4 * 2);
		for (let tile = 0; tile < 2; tile += 1) {
			for (let y = 0; y < tileHeight; y += 1) {
				for (let x = 0; x < tileWidth; x += 1) {
					const dst = (y * (tileWidth * 2) + tile * tileWidth + x) * 4;
					const dark = (x + y + tile) % 2 === 0;
					atlas[dst] = dark ? 40 : 190;
					atlas[dst + 1] = tile === 0 ? (dark ? 90 : 220) : (dark ? 50 : 130);
					atlas[dst + 2] = tile === 0 ? 60 : 220;
					atlas[dst + 3] = 255;
				}
			}
		}
		return { width: tileWidth * 2, height: tileHeight, tileWidth, tileHeight, data: atlas };
	}

	onMount(() => {
		const context = canvas.getContext('2d');
		if (!context) {
			status = 'no-canvas-2d';
			return;
		}

		const description = data.renderDescription;
		const map = new Uint16Array(description.map.width * description.map.height);
		for (let x = 0; x < description.map.width; x += 1) {
			for (let y = 0; y < description.map.height; y += 1) {
				map[x * description.map.height + y] = (x + y) % 2;
			}
		}

		const image = renderMicropolisMapSoftware(description, map, checkerAtlas());
		const imageData = new ImageData(image.data, image.width, image.height);
		canvas.width = image.width;
		canvas.height = image.height;
		context.putImageData(imageData, 0, 0);
		status = 'ready';
	});
</script>

<svelte:head>
	<title>Micropolis Render Preview</title>
</svelte:head>

<main data-render-status={status}>
	<h1>Micropolis Render Preview</h1>
	<canvas bind:this={canvas} aria-label="Micropolis render preview"></canvas>
	<details>
		<summary>Render description</summary>
		<pre>{JSON.stringify(data.renderDescription, null, 2)}</pre>
	</details>
</main>

<style>
	main {
		font-family: system-ui, sans-serif;
		padding: 1rem;
	}

	canvas {
		border: 1px solid #666;
		image-rendering: pixelated;
		max-width: 100%;
	}

	pre {
		overflow: auto;
	}
</style>
