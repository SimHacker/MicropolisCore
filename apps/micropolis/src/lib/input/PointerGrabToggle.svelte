<!--
  PointerGrabToggle.svelte — the button that flips the whole app into virtual
  ("pointer-grab") mode. Normal mode is the default. (design §2)

  DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md §2
  STATUS: SKELETON — UI shell only; wiring to VirtualPointerController is TODO.
-->
<script lang="ts">
	// TODO: import { pointer } from './pointer.svelte'; and reflect pointer.mode.
	let { grabbed = false, onToggle }: { grabbed?: boolean; onToggle?: (on: boolean) => void } =
		$props();

	function toggle() {
		// TODO: call controller.setUserGrab(!grabbed) via pointer.svelte.ts.
		onToggle?.(!grabbed);
	}
</script>

<button
	type="button"
	class="grab-toggle"
	class:grabbed
	aria-pressed={grabbed}
	title="Toggle virtual pointer (pointer-grab) mode"
	onclick={toggle}
>
	{grabbed ? '🎯 Virtual cursor' : '🖱️ Normal cursor'}
</button>

<style>
	.grab-toggle {
		font: inherit;
		cursor: pointer;
	}
	.grab-toggle.grabbed {
		font-weight: 600;
	}
</style>
