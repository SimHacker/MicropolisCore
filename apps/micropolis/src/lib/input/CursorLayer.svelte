<!--
  CursorLayer.svelte — renders the virtual cursor in its own overlay layer.

  DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md §7
  STATUS: SKELETON — visual shell only. Real cursor shapes/sprites + remote
  (multiplayer) presence cursors are TODO. Renders any size/shape/color.

  This component is a CONSUMER of the layer: it reads CursorState and draws it.
  It does not own input. Mount once near the root (see +layout.svelte).
-->
<script lang="ts">
	import type { CursorState } from './types';

	// TODO: source this from pointer.svelte.ts ($state) instead of a prop default,
	//       and accept an array for multiplayer presence cursors.
	let { cursor }: { cursor?: CursorState } = $props();

	const c = $derived(
		cursor ?? {
			x: 0,
			y: 0,
			visible: false,
			size: 24,
			shape: 'arrow',
			color: 'currentColor'
		}
	);
</script>

<!-- TODO: switch on c.shape (arrow|dot|ring|crosshair|sprite); honor c.sprite. -->
{#if c.visible}
	<div
		class="cursor-layer"
		style="left:{c.x}px; top:{c.y}px; width:{c.size}px; height:{c.size}px; color:{c.color};"
		aria-hidden="true"
	></div>
{/if}

<style>
	.cursor-layer {
		position: fixed;
		z-index: 99999;
		pointer-events: none;
		transform: translate(-50%, -50%);
		border: 2px solid;
		border-radius: 50%;
		/* TODO: replace placeholder ring with real cursor shapes/sprites (design §7). */
	}
</style>
