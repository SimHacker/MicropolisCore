<script lang="ts">
	import type { Utterance } from '@common/ipc';
	import type { Rect, WindowInfo } from '@common/types';

	let focused = $state<WindowInfo | null>(null);
	let bridgeId = $state<string | null>(null);
	let highlights = $state<Rect[]>([]);
	let utterance = $state<Utterance | null>(null);

	// Element bounds arrive in screen coordinates; this window is one rectangle spanning
	// every display, so its own screen position is the offset to subtract.
	let originX = $state(0);
	let originY = $state(0);

	$effect(() => {
		const readOrigin = () => {
			originX = window.screenX;
			originY = window.screenY;
		};
		readOrigin();
		window.addEventListener('resize', readOrigin);

		// These handlers must not return a value. Assigning an object or array to a $state
		// variable evaluates to Svelte's reactive Proxy, an arrow function with an
		// expression body would return it, and contextBridge cannot clone a Proxy back
		// into the preload world — it throws "An object could not be cloned" from inside
		// the listener, where there is no visible surface to report it on.
		const offFocus = window.angel.onWindowFocus((w) => {
			focused = w;
		});
		const offBridge = window.angel.onBridgeChange((id) => {
			bridgeId = id;
		});
		const offHighlights = window.angel.onHighlights((rects) => {
			highlights = rects;
		});

		// Each utterance replaces the last and clears itself. An overlay that accumulates
		// messages is an overlay that eventually covers the work.
		let timer: ReturnType<typeof setTimeout> | undefined;
		const offSay = window.angel.onSay((next) => {
			clearTimeout(timer);
			utterance = next;
			timer = setTimeout(() => {
				utterance = null;
			}, next.ttlMs);
		});

		return () => {
			window.removeEventListener('resize', readOrigin);
			clearTimeout(timer);
			offFocus();
			offBridge();
			offHighlights();
			offSay();
		};
	});

	/**
	 * Hit testing lives here because this is the only side that knows where the widgets
	 * are. Pointer events still arrive while clicks pass through, so entering something
	 * interactive is the moment to take the clicks back, and leaving is the moment to
	 * give them up again. An overlay that holds onto clicks is an overlay that has
	 * quietly broken the application underneath it.
	 */
	function takeClicks() {
		void window.angel.setClickThrough(false);
	}

	function releaseClicks() {
		void window.angel.setClickThrough(true);
	}
</script>

<div class="overlay">
	{#each highlights as rect, index (index)}
		<div
			class="halo"
			style:left="{rect.x - originX}px"
			style:top="{rect.y - originY}px"
			style:width="{rect.width}px"
			style:height="{rect.height}px"
		></div>
	{/each}

	{#if utterance}
		<!-- Text and nothing else. No buttons, no icon, no way to mistake it for the
		     application's own dialog. Anything that could draw a convincing prompt over
		     someone else's window is a phishing kit. -->
		<p class="utterance">{utterance.text}</p>
	{/if}

	<!-- The only thing that shows unprompted, and it stays a word rather than a face.
	     No mascot, no eyes, no mood: Clippy was rendered at the wrong altitude of
	     abstraction, detailed enough to be unmistakably somebody else. -->
	<div
		class="badge"
		role="status"
		onpointerenter={takeClicks}
		onpointerleave={releaseClicks}
	>
		<span class="mark">◈</span>
		<span class="mono">
			{focused ? focused.app : 'nothing focused'}
			{#if bridgeId}
				<span class="bridge">· {bridgeId}</span>
			{/if}
			{#if highlights.length > 0}
				<span class="count">· {highlights.length} matched</span>
			{/if}
		</span>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: transparent;
	}

	.halo {
		position: absolute;
		border: 2px solid var(--halo);
		border-radius: 2px;
		background: color-mix(in srgb, var(--halo) 12%, transparent);
		box-shadow: 0 0 12px color-mix(in srgb, var(--halo) 50%, transparent);
		pointer-events: none;
	}

	.badge {
		position: absolute;
		bottom: 18px;
		left: 18px;
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 6px 12px;
		border: 1px solid color-mix(in srgb, var(--halo) 30%, transparent);
		border-radius: 999px;
		background: var(--glass);
		color: var(--ink);
		box-shadow: var(--lift);
		backdrop-filter: blur(8px);
	}

	.utterance {
		position: absolute;
		bottom: 62px;
		left: 18px;
		max-width: 46ch;
		margin: 0;
		padding: 10px 14px;
		border: 1px solid color-mix(in srgb, var(--halo) 22%, transparent);
		border-radius: 12px;
		background: var(--glass);
		color: var(--ink);
		box-shadow: var(--lift);
		backdrop-filter: blur(8px);
		pointer-events: none;
	}

	.mark {
		color: var(--halo);
	}

	.bridge {
		color: var(--good);
	}

	.count {
		color: var(--ink-dim);
	}
</style>
