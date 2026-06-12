// input/pointer.svelte.ts — Svelte 5 runes bridge over the framework-agnostic
// controllers. This is the app-facing glue; components read these reactive values.
//
// DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md §10,§11
// STATUS: SKELETON — reactive shape only. Wiring to controllers is TODO; nothing
// runs at import time. Lives in the app; the controllers move to @micropolis/input.

import type { CursorState, PointerMode, UnifiedPointer } from './types';
// TODO(impl): import { VirtualPointerController } from './VirtualPointerController';

const initialPointer: UnifiedPointer = {
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	buttons: 0,
	phase: 'idle',
	source: 'mouse'
};

const initialCursor: CursorState = {
	x: 0,
	y: 0,
	visible: false,
	size: 24,
	shape: 'arrow',
	color: 'currentColor'
};

/**
 * Reactive façade. Create once near the app root and share via context or import.
 * TODO(impl): instantiate VirtualPointerController, subscribe() to update `pointer`
 * + `cursor` + `mode`, and forward attach()/setUserGrab()/request().
 */
export function createPointerStore() {
	let pointer = $state<UnifiedPointer>({ ...initialPointer });
	let cursor = $state<CursorState>({ ...initialCursor });
	let mode = $state<PointerMode>('direct');

	return {
		get pointer() {
			return pointer;
		},
		get cursor() {
			return cursor;
		},
		get mode() {
			return mode;
		},

		/** Bind the controller to the app surface; returns detach(). */
		attach(_el: HTMLElement): () => void {
			// TODO: controller.attach(el); controller.subscribe(p => pointer = { ...p }); ...
			throw new Error('TODO: pointer.attach — see virtual-cursor-layer.md §3');
		},

		/** The global pointer-grab toggle button calls this. */
		setUserGrab(_on: boolean): void {
			// TODO: controller.setUserGrab(on); mode = controller.mode;
			throw new Error('TODO: pointer.setUserGrab — see virtual-cursor-layer.md §2');
		},

		/** Consumers (pie menu, etc.) request virtual mode; returns release(). */
		request(): () => void {
			// TODO: return controller.request();
			throw new Error('TODO: pointer.request — see virtual-cursor-layer.md §2');
		}
	};
}

export type PointerStore = ReturnType<typeof createPointerStore>;
