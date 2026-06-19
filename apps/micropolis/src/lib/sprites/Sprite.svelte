<script lang="ts">
	import type { MapViewport } from '@micropolis/render-core';
	import { layoutSpriteOnScreen, resolveManifest } from './spriteMeasure';
	import type { SpriteInstance } from './types';
	import { PROCEDURAL_SMOKE_PUFF } from './types';

	interface Props {
		instance: SpriteInstance;
		viewport: MapViewport;
	}

	let { instance, viewport }: Props = $props();

	const layout = $derived(layoutSpriteOnScreen(viewport, instance));
	const manifest = $derived(resolveManifest(instance.packId, instance.manifestId));
	const frame = $derived(
		manifest?.frames.find((f) => f.index === instance.frame) ?? manifest?.frames[0],
	);
	const isSmoke = $derived(instance.manifestId === PROCEDURAL_SMOKE_PUFF);
</script>

{#if layout && manifest}
	{#if isSmoke}
		<div
			class="sprite-smoke"
			style:left="{layout.bounds.x + layout.bounds.w * 0.25}px"
			style:top="{layout.bounds.y + layout.bounds.h * 0.25}px"
			style:width="{layout.bounds.w * 0.5}px"
			style:height="{layout.bounds.h * 0.5}px"
			style:background-color={instance.tint ?? '#ffffff'}
			style:opacity={instance.opacity ?? 0.7}
			style:z-index={instance.zIndex ?? 50}
		></div>
	{:else}
		<div
			class="sprite-sheet"
			style:left="{layout.bounds.x}px"
			style:top="{layout.bounds.y}px"
			style:width="{layout.bounds.w}px"
			style:height="{layout.bounds.h}px"
			style:background-image="url({manifest.sheetUrl})"
			style:background-position="-{(frame?.atlas.x ?? 0) *
				(layout.bounds.w / manifest.frameWidth)}px -{(frame?.atlas.y ?? 0) *
				(layout.bounds.h / manifest.frameHeight)}px"
			style:background-size="{manifest.frames.length > 0
				? (manifest.frames[manifest.frames.length - 1].atlas.x + manifest.frameWidth) *
					(layout.bounds.w / manifest.frameWidth)
				: layout.bounds.w}px {layout.bounds.h}px"
			style:opacity={instance.opacity ?? 1}
			style:z-index={instance.zIndex ?? 10}
			style:transform={instance.heading != null
				? `rotate(${instance.heading}rad)`
				: undefined}
			style:transform-origin="center center"
		></div>
	{/if}
{/if}

<style>
	.sprite-sheet,
	.sprite-smoke {
		position: absolute;
		pointer-events: none;
		image-rendering: pixelated;
	}
	.sprite-smoke {
		border-radius: 50%;
		filter: blur(2px);
	}
</style>
