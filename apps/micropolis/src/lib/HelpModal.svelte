<script lang="ts">
	import { onMount } from 'svelte';
	import { HELP_SECTIONS } from '$lib/helpShortcuts';

	let open = $state(false);

	function close() {
		open = false;
	}

	function toggle() {
		open = !open;
	}

	function isHelpKey(event: KeyboardEvent): boolean {
		return event.key === '?' || (event.key === '/' && event.shiftKey);
	}

	onMount(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (isHelpKey(event)) {
				event.preventDefault();
				event.stopImmediatePropagation();
				toggle();
				return;
			}
			if (!open) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopImmediatePropagation();
				close();
				return;
			}
			event.stopImmediatePropagation();
		};

		window.addEventListener('keydown', onKeyDown, true);
		return () => window.removeEventListener('keydown', onKeyDown, true);
	});
</script>

{#if open}
	<div class="help-backdrop" role="presentation" onclick={close}></div>
	<div class="help-modal" role="dialog" aria-labelledby="help-title" aria-modal="true">
		<header class="help-header">
			<h2 id="help-title">Keyboard shortcuts</h2>
			<button type="button" class="help-close" onclick={close} aria-label="Close help">×</button>
		</header>

		<div class="help-body">
			{#each HELP_SECTIONS as section (section.title)}
				<section class="help-section">
					<h3>{section.title}</h3>
					<dl class="help-list">
						{#each section.rows as row (row.keys + row.action)}
							<div class="help-row">
								<dt><kbd>{row.keys}</kbd></dt>
								<dd>{row.action}</dd>
							</div>
						{/each}
					</dl>
				</section>
			{/each}
		</div>

		<p class="help-footer">
			Micropolis in WebAssembly — classic SimCity lineage, ported by Don Hopkins.
			<a href="https://github.com/SimHacker/MicropolisCore" target="_blank" rel="noopener noreferrer"
				>GitHub</a
			>
		</p>
	</div>
{/if}

<style>
	.help-backdrop {
		position: fixed;
		inset: 0;
		z-index: 45;
		background: rgba(0, 0, 0, 0.5);
	}

	.help-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(28rem, 94vw);
		max-height: min(80vh, 36rem);
		display: flex;
		flex-direction: column;
		padding: 0;
		background: rgba(8, 12, 20, 0.97);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: #eef2ff;
		font-size: 0.82rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
	}

	.help-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.85rem 1rem 0.65rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.help-close {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
	}

	.help-body {
		overflow: auto;
		padding: 0.65rem 1rem 0.5rem;
	}

	.help-section + .help-section {
		margin-top: 0.75rem;
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #9cf59c;
	}

	.help-list {
		margin: 0;
	}

	.help-row {
		display: grid;
		grid-template-columns: 5.5rem 1fr;
		gap: 0.5rem;
		align-items: baseline;
		padding: 0.18rem 0;
	}

	dt {
		margin: 0;
	}

	dd {
		margin: 0;
		opacity: 0.92;
		line-height: 1.35;
	}

	kbd {
		display: inline-block;
		min-width: 1.5rem;
		padding: 0.12rem 0.35rem;
		border: 1px solid rgba(255, 255, 255, 0.22);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.08);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.72rem;
		font-weight: 600;
		color: #ffc840;
		text-align: center;
	}

	.help-footer {
		margin: 0;
		padding: 0.55rem 1rem 0.85rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		font-size: 0.72rem;
		line-height: 1.4;
		opacity: 0.75;
	}

	.help-footer a {
		color: #9ec5ff;
	}
</style>
