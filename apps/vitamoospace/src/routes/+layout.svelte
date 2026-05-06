<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="app">
	{@render children()}
</div>

<style>
	.app {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
