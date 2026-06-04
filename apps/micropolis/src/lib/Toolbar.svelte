<script lang="ts">
	import { GAME_TOOLS, type ToolId } from '$lib/gameTools';
	import { toolState } from '$lib/ToolState.svelte';

	function selectTool(id: ToolId) {
		toolState.setActiveTool(id);
	}
</script>

<div class="toolbar" role="toolbar" aria-label="City tools">
	{#each GAME_TOOLS as tool (tool.id)}
		<button
			type="button"
			class:active={toolState.activeToolId === tool.id}
			title="{tool.label} ({tool.shortcut})"
			onclick={() => selectTool(tool.id)}
		>
			<span class="tool-shortcut">{tool.shortcut}</span>
			<span class="tool-label">{tool.label}</span>
		</button>
	{/each}
	{#if toolState.hoverTile}
		<span class="hover-coords">{toolState.hoverTile[0]}, {toolState.hoverTile[1]}</span>
	{/if}
	{#if toolState.lastToolFeedback}
		<span class="tool-feedback">{toolState.lastToolFeedback}</span>
	{/if}
</div>

<style>
	.toolbar {
		position: absolute;
		left: 0.5rem;
		bottom: 0.5rem;
		z-index: 20;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		max-width: min(100%, 42rem);
		padding: 0.4rem;
		background: rgba(8, 12, 20, 0.88);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		backdrop-filter: blur(4px);
	}

	button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		min-width: 4.5rem;
		padding: 0.35rem 0.45rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.06);
		color: #eef2ff;
		cursor: pointer;
		font: inherit;
		font-size: 0.72rem;
	}

	button:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	button.active {
		background: rgba(80, 140, 255, 0.35);
		border-color: rgba(140, 180, 255, 0.65);
	}

	.tool-shortcut {
		font-weight: 700;
		font-size: 0.8rem;
		color: #ffd27a;
	}

	.tool-label {
		opacity: 0.92;
	}

	.hover-coords,
	.tool-feedback {
		align-self: center;
		padding: 0.25rem 0.5rem;
		font-family: ui-monospace, monospace;
		font-size: 0.72rem;
		opacity: 0.85;
	}

	.tool-feedback {
		color: #ffb347;
	}
</style>
