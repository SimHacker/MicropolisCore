<script lang="ts">
	import { GAME_TOOL_GROUPS, toolMenuLabel, type ToolId } from '$lib/gameTools';
	import { toolState } from '$lib/ToolState.svelte';

	function selectTool(id: ToolId) {
		toolState.setActiveTool(id);
	}
</script>

<nav class="toolbar" aria-label="City tools">
	{#each GAME_TOOL_GROUPS as group (group.id)}
		{#if group.label}
			<div class="tool-group-label">{group.label}</div>
		{/if}
		{#each group.tools as tool (tool.id)}
			<button
				type="button"
				class="tool-item"
				class:active={toolState.activeToolId === tool.id}
				title="{tool.shortcut}: {toolMenuLabel(tool)}"
				onclick={() => selectTool(tool.id)}
			>
				<span class="tool-key">{tool.shortcut}:</span>
				<span class="tool-name">{toolMenuLabel(tool)}</span>
			</button>
		{/each}
	{/each}
</nav>

<style>
	.toolbar {
		flex-shrink: 0;
		width: max-content;
		max-width: 40vw;
		height: 100%;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin: 0;
		padding: 0.2rem 0;
		overflow-x: hidden;
		overflow-y: auto;
		background: rgba(26, 26, 46, 0.94);
		border: none;
		border-right: 1px solid #5a5a78;
		box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.06);
		font-family: ui-monospace, 'Chicago', 'Geneva', monospace;
		contain: layout style;
		scrollbar-width: thin;
		scrollbar-color: #4a4a68 transparent;
	}

	.tool-group-label {
		padding: 0.28rem 0.45rem 0.05rem;
		font-size: 0.46rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #8a92b0;
		user-select: none;
	}

	.tool-group-label:not(:first-child) {
		margin-top: 0.08rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		padding-top: 0.32rem;
	}

	.tool-item {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		margin: 0;
		padding: 0.1rem 0.45rem;
		border: none;
		border-radius: 0;
		background: transparent;
		color: #e8eeff;
		cursor: pointer;
		font: inherit;
		font-size: 0.54rem;
		font-weight: 500;
		line-height: 1.15;
		text-align: left;
		white-space: nowrap;
		box-sizing: border-box;
		outline: none;
		gap: 0.2rem;
	}

	.tool-key {
		flex: 0 0 auto;
		font-weight: 700;
		color: #ffc840;
	}

	.tool-name {
		flex: 1 1 auto;
		text-align: left;
	}

	.tool-item:hover {
		background: rgba(46, 46, 80, 0.85);
		color: #fff;
	}

	.tool-item.active {
		background: #304878;
		color: #fff;
		box-shadow: inset 2px 0 0 #8ab8ff;
	}

	.tool-item.active .tool-key {
		color: #ffe566;
	}
</style>
