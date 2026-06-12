// input/VirtualPointerController.ts — THE cross-cutting input layer.
//
// DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md §1,§2,§3,§7
//
// STATUS: SKELETON — class shape, fields, and method contracts only. Bodies are
// TODO. This owns the single source of pointer truth; pie menus, map gesture, and
// gliding are CONSUMERS that request()/read it. It is usable with NO pie menu.
//
// Framework-agnostic on purpose (no Svelte here) so it can move to @micropolis/input
// and be wrapped by pointer.svelte.ts for the app. (design §10)

import type {
	CursorState,
	IVirtualPointerController,
	PointerEnvironment,
	PointerMode,
	UnifiedPointer
} from './types';

const IDLE_POINTER: UnifiedPointer = {
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	buttons: 0,
	phase: 'idle',
	source: 'mouse'
};

const DEFAULT_CURSOR: CursorState = {
	x: 0,
	y: 0,
	visible: false,
	size: 24,
	shape: 'arrow',
	color: 'currentColor'
};

export class VirtualPointerController implements IVirtualPointerController {
	// --- single source of truth (read by every consumer) ---
	private _mode: PointerMode = 'direct';
	private _pointer: UnifiedPointer = { ...IDLE_POINTER };
	private _cursor: CursorState = { ...DEFAULT_CURSOR };

	// --- activation (design §2): virtual when userGrab OR requestCount > 0 ---
	private userGrab = false;
	private requestCount = 0;

	private subscribers = new Set<(p: UnifiedPointer) => void>();
	private environment: PointerEnvironment | null = null;

	get mode(): PointerMode {
		return this._mode;
	}
	get pointer(): UnifiedPointer {
		return this._pointer;
	}
	get cursor(): CursorState {
		return this._cursor;
	}

	/** The global "pointer-grab" toggle button. (design §2) */
	setUserGrab(_on: boolean): void {
		// TODO: set userGrab, then reconcileMode(): request/exit Pointer Lock as needed.
		throw new Error('TODO: setUserGrab — see virtual-cursor-layer.md §2');
	}

	/** Consumer (e.g. a pie menu) asks for virtual mode; returns release(). (design §2) */
	request(): () => void {
		// TODO: requestCount++, reconcileMode(); release(): requestCount--, reconcileMode().
		throw new Error('TODO: request/release ref-count — see virtual-cursor-layer.md §2');
	}

	/** Bind pointer/lock listeners to el; returns detach(). (design §2,§3) */
	attach(_el: HTMLElement): () => void {
		// TODO: add pointerdown/move/up + pointerlockchange + wheel listeners.
		//       In 'direct' mode read clientX/Y; in 'virtual' integrate movementX/Y
		//       into virtualX/Y (clamp to viewport), estimate vx/vy, publish().
		throw new Error('TODO: attach — see virtual-cursor-layer.md §3');
	}

	subscribe(fn: (p: UnifiedPointer) => void): () => void {
		this.subscribers.add(fn);
		return () => this.subscribers.delete(fn);
	}

	setEnvironment(env: PointerEnvironment | null): void {
		// Stored now; the rAF loop (TODO) will call env.applyForces(pointer, dt). (design §8)
		this.environment = env;
	}

	// --- internals (all TODO) ---

	/** Decide direct vs virtual from userGrab/requestCount and (un)lock the pointer. */
	private reconcileMode(): void {
		// TODO: const want = this.userGrab || this.requestCount > 0;
		//       enter 'virtual' (requestPointerLock) or 'direct' (exitPointerLock).
		throw new Error('TODO: reconcileMode — see virtual-cursor-layer.md §2');
	}

	/** Push the current pointer to subscribers + update cursor state. */
	private publish(): void {
		for (const fn of this.subscribers) fn(this._pointer);
	}
}
