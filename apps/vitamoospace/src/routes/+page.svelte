<script lang="ts">
	import VitaMooSpace from '$lib/components/VitaMooSpace.svelte';
</script>

<svelte:head>
	<title>VitaMooSpace — Spin the Sims!</title>
</svelte:head>

<div class="page">
	<VitaMooSpace />
</div>

<style>
	.page {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>
