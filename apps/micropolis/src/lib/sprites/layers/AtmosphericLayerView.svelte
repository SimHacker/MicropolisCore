<script lang="ts">
	import type { MapViewport } from '@micropolis/render-core';
	import { getAtmosphericLayer, blitAtmosphericLayer, listAtmosphericLayerIds, getLayerBlend } from './layerRegistry';

	interface Props {
		viewport: MapViewport;
	}

	let { viewport }: Props = $props();

	let canvasEl: HTMLCanvasElement | null = $state(null);

	export function refresh(): void {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
		for (const id of listAtmosphericLayerIds()) {
			const layer = getAtmosphericLayer(id);
			if (layer) blitAtmosphericLayer(ctx, layer, viewport, getLayerBlend(id));
		}
	}

	$effect(() => {
		viewport.panX;
		viewport.panY;
		viewport.zoom;
		viewport.screenWidth;
		viewport.screenHeight;
		refresh();
	});

	$effect(() => {
		if (!canvasEl) return;
		canvasEl.width = viewport.screenWidth;
		canvasEl.height = viewport.screenHeight;
		refresh();
	});
</script>

<canvas bind:this={canvasEl} class="atmospheric-layer-canvas" aria-hidden="true"></canvas>

<style>
	.atmospheric-layer-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 4;
	}
</style>
