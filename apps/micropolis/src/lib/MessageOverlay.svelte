<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { messageText } from '$lib/engineMessages';

	let visibleIndex = $state(-1);
	let visibleText = $state('');
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		const index = micropolisReactive.messageIndex;
		if (index < 0) return;

		visibleIndex = index;
		visibleText = messageText(index);

		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			visibleIndex = -1;
			visibleText = '';
		}, micropolisReactive.messageImportant ? 8000 : 5000);
	});
</script>

{#if visibleIndex >= 0}
	<div class="message-overlay" class:important={micropolisReactive.messageImportant}>
		{visibleText}
		{#if micropolisReactive.messageX >= 0}
			<span class="coords">({micropolisReactive.messageX}, {micropolisReactive.messageY})</span>
		{/if}
	</div>
{/if}

<style>
	.message-overlay {
		position: absolute;
		top: 4.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 25;
		max-width: min(90%, 28rem);
		padding: 0.55rem 0.85rem;
		border-radius: 6px;
		background: rgba(20, 24, 36, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: #f5f5f5;
		font-size: 0.9rem;
		text-align: center;
		pointer-events: none;
	}

	.message-overlay.important {
		border-color: rgba(255, 120, 80, 0.75);
		background: rgba(48, 16, 12, 0.92);
	}

	.coords {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.75rem;
		color: #ffc840;
	}
</style>
