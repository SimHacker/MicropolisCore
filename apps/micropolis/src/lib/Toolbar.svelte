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
			title="{tool.tooltip ?? tool.label} ({tool.shortcut})"
			onclick={() => selectTool(tool.id)}
		>
			<span class="tool-shortcut">{tool.shortcut}</span>
			<span class="tool-label">{tool.label}</span>
		</button>
	{/each}
</div>

<style>
	.toolbar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		align-items: stretch;
		width: 100%;
		margin: 0;
		padding: 0;
		background: #1a1a2e;
		border: none;
		border-top: 2px solid #6a6a8a;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
		font-family: ui-monospace, 'Chicago', 'Geneva', monospace;
		contain: layout style;
	}

	button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.22rem;
		min-width: 0;
		min-height: 2.65rem;
		padding: 0.25rem 0.1rem 0.3rem;
		border: none;
		border-right: 1px solid #3a3a58;
		border-radius: 0;
		background: #22223a;
		color: #f0f4ff;
		cursor: pointer;
		font: inherit;
		font-size: 0.58rem;
		line-height: 1;
		box-sizing: border-box;
		outline: none;
	}

	button:last-child {
		border-right: none;
	}

	button:hover {
		background: #2e2e50;
		color: #fff;
	}

	button.active {
		background: #304878;
		color: #fff;
		box-shadow: inset 0 2px 0 #8ab8ff;
	}

	.tool-shortcut {
		font-weight: 700;
		font-size: 0.78rem;
		color: #ffc840;
		line-height: 1;
	}

	button.active .tool-shortcut {
		color: #ffe566;
	}

	.tool-label {
		font-size: 0.54rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #e8eeff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		line-height: 1.1;
	}

	@media (max-width: 480px) {
		.toolbar {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}
</style>
