<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { messageText } from '$lib/engineMessages';

	const DEFAULT_MESSAGE = 'Welcome to Micropolis.';

	let displayText = $state(DEFAULT_MESSAGE);

	$effect(() => {
		const index = micropolisReactive.messageIndex;
		if (index >= 0) {
			displayText = messageText(index);
		}
	});

	const showCoords = $derived(
		micropolisReactive.messageIndex >= 0 && micropolisReactive.messageX >= 0,
	);
</script>

<div
	class="message-bar"
	class:important={micropolisReactive.messageImportant}
	aria-live="polite"
	role="status"
>
	<span class="message-text">{displayText}</span>
	{#if showCoords}
		<span class="coords">({micropolisReactive.messageX}, {micropolisReactive.messageY})</span>
	{/if}
</div>

<style>
	.message-bar {
		flex-shrink: 0;
		z-index: 25;
		height: var(--message-bar-height, 2.5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		width: 100%;
		padding: 0 0.75rem;
		box-sizing: border-box;
		background: rgba(20, 24, 36, 0.94);
		border-top: 1px solid rgba(255, 255, 255, 0.18);
		color: #f5f5f5;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.78rem;
		line-height: 1.25;
		text-align: center;
		pointer-events: none;
	}

	.message-bar.important {
		border-top-color: rgba(255, 120, 80, 0.75);
		background: rgba(48, 16, 12, 0.94);
	}

	.message-text {
		flex: 0 1 auto;
	}

	.coords {
		flex: 0 0 auto;
		font-size: 0.72rem;
		color: #ffc840;
	}
</style>
