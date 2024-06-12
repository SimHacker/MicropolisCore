<script>
	import './styles.css';
</script>

<div class="app">
	<main>
		<slot />
	</main>
</div>

<style>
	html, body {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100vw;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
