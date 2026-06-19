<script lang="ts">
	interface Props {
		href?: string;
		label?: string;
	}

	let { href = '/', label = 'Back to site' }: Props = $props();
</script>

<a class="play-back" {href} title={label} aria-label={label}>
	<svg class="play-back-icon" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</a>

<style>
	.play-back {
		position: fixed;
		top: 0.5rem;
		right: 0.5rem;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(8, 12, 20, 0.82);
		color: #eef2ff;
		text-decoration: none;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(4px);
		transition:
			background 0.12s linear,
			border-color 0.12s linear;
	}

	.play-back:hover {
		background: rgba(30, 40, 60, 0.92);
		border-color: rgba(255, 255, 255, 0.45);
		color: #fff;
	}

	.play-back-icon {
		width: 1.35rem;
		height: 1.35rem;
	}
</style>
