<script lang="ts">

	import MicropolisView from '$lib/MicropolisView.svelte';

</script>

<div class="fullscreen">
	<MicropolisView
		width="100%"
		height="100%"
	/>
</div>

<style>
	.fullscreen {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		display: block;
	}
</style>
