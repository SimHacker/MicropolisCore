<script lang="ts">
	import Console from './Console.svelte';
	import Overlay from './Overlay.svelte';

	let { view }: { view: 'overlay' | 'console' } = $props();
</script>

{#if view === 'overlay'}
	<Overlay />
{:else}
	<Console />
{/if}
