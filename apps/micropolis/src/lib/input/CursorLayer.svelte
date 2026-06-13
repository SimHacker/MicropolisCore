<!--
  CursorLayer — parallel coordinator for everything a "cursor" is.

  Incremental backends (same component, same CursorPresence[] API):
  - dom (default, playable Phase B): SVG/DOM tile frame + ghost — viewport clip math
    identical to future WebGPU layer
  - webgpu (after holodeck): EditingToolCursorPlugin + measure write/patch
  - both: optional parallel DOM + GPU

  Also coordinates labels, avatars, infovis, autoscroll when configured.

  DESIGN: documentation/designs/virtual-cursor-layer.md §7.1
          documentation/designs/map-compositing-and-measurement.md §3.2, §4
-->
<script lang="ts">
	import type { HolodeckStage } from '@micropolis/render-core';
	import { applyMeasurePatch, createMeasureSnapshot } from '@micropolis/render-core';
	import type {
		CursorBackend,
		CursorDomSlot,
		CursorPresence,
		EdgeAutoscrollPolicy,
		UnifiedPointer
	} from './types';

	interface Props {
		/** Holodeck stage — required only when backend includes `webgpu`. */
		stage?: HolodeckStage;
		/** Active raster backends. Default `dom` for playable vertical slice. */
		backend?: CursorBackend;
		/** All connected players' cursor bundles (local + remote). */
		presences?: CursorPresence[];
		/** Local unified pointer sample (from VirtualPointerController). */
		localPointer?: UnifiedPointer;
		/** Edge autoscroll tuning — consumed by MapGestureController when wired. */
		autoscroll?: EdgeAutoscrollPolicy;
		/** Show dashed dev overlay when stage/plugins not wired. */
		dev?: boolean;
	}

	let {
		stage,
		backend = 'dom',
		presences = [],
		localPointer,
		autoscroll: _autoscroll,
		dev = false
	}: Props = $props();

	const useWebGpu = $derived(backend === 'webgpu' || backend === 'both');
	const useDom = $derived(backend === 'dom' || backend === 'both');

	const snapshot = $state(createMeasureSnapshot([]));

	/** Presences that need DOM slots, or all tile presences when dom backend draws tool frames. */
	const domPresences = $derived(
		presences.filter((p) => {
			if (!p.visible) return false;
			if ((p.representations.dom?.length ?? 0) > 0) return true;
			return useDom && p.anchorSpace === 'world-tile';
		})
	);

	function measureRefsForPresence(p: CursorPresence): string[] {
		const id = p.playerId;
		const refs: string[] = [];
		if (p.anchorSpace === 'world-tile') {
			refs.push(`editing-tool-cursor/${id}/inner/bounds`, `editing-tool-cursor/${id}/outer/bounds`);
		}
		if (p.anchorSpace === 'screen' || p.avatar?.attachTo === 'pointer') {
			refs.push(`pointer-cursors/${id}/hotspot/point`);
		}
		if (p.avatar) {
			refs.push(`player-avatars/${id}/icon/bounds`);
		}
		return refs;
	}

	function allMeasureRefs(): string[] {
		return [...new Set(presences.flatMap((p) => measureRefsForPresence(p)))];
	}

	function domSlots(p: CursorPresence): CursorDomSlot[] {
		return p.representations.dom ?? [];
	}

	function holodeckPatches(): Record<string, Record<string, unknown>> {
		const patches: Record<string, Record<string, unknown>> = {};
		for (const p of presences) {
			if (!p.visible) continue;
			if (p.anchorSpace === 'world-tile' && p.tile) {
				patches[`editing-tool-cursor/${p.playerId}`] = {
					toolId: p.toolId,
					tileX: p.tile.x,
					tileY: p.tile.y,
					tw: p.tile.w ?? 1,
					th: p.tile.h ?? 1,
					styleId: p.styleId,
					rimPolicy: p.rimPolicy ?? (p.local ? 'fat' : 'thin')
				};
			}
			if (p.anchorSpace === 'world-pixel' && p.worldPx) {
				patches[`world-strokes/${p.playerId}`] = {
					toolId: p.toolId,
					x: p.worldPx.x,
					y: p.worldPx.y,
					stroke: p.stroke
				};
			}
			if (p.screen) {
				patches[`pointer-cursors/${p.playerId}`] = {
					x: p.screen.x,
					y: p.screen.y,
					visible: p.visible
				};
			}
			if (p.avatar) {
				patches[`player-avatars/${p.playerId}`] = {
					spriteId: p.avatar.spriteId,
					attachTo: p.avatar.attachTo
				};
			}
		}
		return patches;
	}

	function publishToHolodeck(): void {
		if (!useWebGpu || !stage) return;
		const patches = holodeckPatches();
		if (Object.keys(patches).length > 0) {
			stage.measureWrite({ op: 'write', schema_version: 1, patches });
		}
		stage.render();
		const refs = allMeasureRefs();
		if (refs.length > 0) {
			const patch = stage.measurePatch(refs, snapshot.frame);
			applyMeasurePatch(snapshot, patch);
		}
	}

	function getMeasure(ref: string) {
		return snapshot.values[ref];
	}

	$effect(() => {
		presences;
		localPointer;
		publishToHolodeck();
	});
</script>

<!-- DOM/SVG: tool frames (playable default) + optional chrome slots -->
{#if useDom}
	{#each domPresences as presence (presence.playerId)}
		{#if domSlots(presence).includes('label') || (domSlots(presence).length === 0 && presence.anchorSpace === 'world-tile')}
			{@const bounds = getMeasure(`editing-tool-cursor/${presence.playerId}/outer/bounds`)}
			<!-- TODO(playable-B): SVG tile frame from viewport/tile-renderer when measure not wired -->
			{#if bounds?.bounds}
				<div
					class="cursor-tool-frame"
					style="left:{bounds.bounds.x}px; top:{bounds.bounds.y}px; width:{bounds.bounds.w}px; height:{bounds.bounds.h}px;"
				></div>
			{/if}
		{/if}
		{#if domSlots(presence).includes('label')}
			{@const bounds = getMeasure(`editing-tool-cursor/${presence.playerId}/outer/bounds`)}
			{#if bounds?.bounds}
				<div
					class="cursor-label"
					style="left:{bounds.bounds.x}px; top:{bounds.bounds.y + bounds.bounds.h}px;"
				>
					{presence.toolId}
				</div>
			{/if}
		{/if}
		{#if domSlots(presence).includes('avatar') && presence.avatar}
			{@const avatarBounds = getMeasure(`player-avatars/${presence.playerId}/icon/bounds`)}
			{#if avatarBounds?.bounds}
				<div
					class="cursor-avatar"
					style="left:{avatarBounds.bounds.x}px; top:{avatarBounds.bounds.y}px; width:{avatarBounds.bounds.w}px; height:{avatarBounds.bounds.h}px;"
					aria-hidden="true"
				></div>
			{/if}
		{/if}
	{/each}
{/if}

{#if dev && localPointer && !stage}
	<div
		class="cursor-layer-dev"
		style="left:{localPointer.x}px; top:{localPointer.y}px;"
		aria-hidden="true"
	></div>
{/if}

<style>
	.cursor-tool-frame {
		position: fixed;
		z-index: 998;
		pointer-events: none;
		box-sizing: border-box;
		border: 2px solid currentColor;
		opacity: 0.75;
	}
	.cursor-label {
		position: fixed;
		z-index: 1000;
		pointer-events: none;
		font-size: 0.75rem;
		opacity: 0.85;
	}
	.cursor-avatar {
		position: fixed;
		z-index: 999;
		pointer-events: none;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.5;
	}
	.cursor-layer-dev {
		position: fixed;
		z-index: 99999;
		width: 24px;
		height: 24px;
		pointer-events: none;
		transform: translate(-50%, -50%);
		border: 2px dashed magenta;
		border-radius: 50%;
		opacity: 0.35;
	}
</style>
