// input/types.ts — Typed contracts for the Virtual Cursor Layer.
//
// DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md
// (cross-cutting input layer; pie menus / map gesture / gliding are consumers)
//
// STATUS: interface sketch only — no implementation yet. These are the protocols
// the controllers and consumers agree on.

/** Activation/source mode of the pointer layer. (design §2) */
export type PointerMode = 'direct' | 'virtual' | 'hybrid';

/** Lifecycle phase of a drag/throw gesture. (design §5) */
export type GesturePhase = 'idle' | 'down' | 'drag' | 'fling' | 'brake';

/** Where the current pointer sample came from. */
export type PointerSource = 'mouse' | 'touch' | 'pen' | 'locked' | 'synthetic';

/**
 * The single source of pointer truth all consumers read. (design §3)
 * Screen-space position + smoothed velocity + gesture phase, independent of the
 * underlying device (mouse, locked relative motion, touch, gamepad, eye-tracker...).
 */
export interface UnifiedPointer {
	x: number;
	y: number;
	/** px/s, smoothed — used for inertial "throw" (design §5). */
	vx: number;
	vy: number;
	buttons: number;
	phase: GesturePhase;
	source: PointerSource;
}

/** What the CursorLayer renders. Any size/shape/color/sprite. (design §7) */
export interface CursorState {
	x: number;
	y: number;
	visible: boolean;
	size: number;
	/** e.g. 'arrow' | 'dot' | 'ring' | 'crosshair' | 'sprite'. */
	shape: string;
	color: string;
	sprite?: string;
}

/** A timestamped pointer sample (velocity estimation for throw). */
export interface PointerSample {
	x: number;
	y: number;
	t: number; // performance.now()
}

/** World↔screen camera; pan/zoom/rotate operate on this. (design §6) */
export interface Camera {
	x: number; // screen translate
	y: number;
	scale: number; // world units → screen px
	rotation: number; // radians
}

/** Pie-menu fallback policy when near a screen edge. (design §2, pie consumer) */
export interface PieMenuPolicy {
	clampMenuToViewport: boolean;
	allowPartialOffscreenMenu: boolean;
	preferVirtualPointer: boolean;
	warpOSCursorOnMenuReposition: boolean;
	animateLabelToPointer: boolean;
}

/** Reversible edge-autoscroll tuning. (design §4) */
export interface EdgeAutoscrollPolicy {
	edgePx: number;
	maxVelocityPxPerSec: number;
	/** distance-from-edge in [0,1] → speed multiplier in [0,1]. */
	ramp: (t: number) => number;
}

/** Inertial "throw" tuning. (design §5) */
export interface InertiaPolicy {
	/** velocity (px/s) below which release does NOT fling. */
	minFlingVelocity: number;
	/** per-second exponential decay factor in (0,1); pos *= friction^dt. */
	friction: number;
	/** stop fling when |v| drops below this (px/s). */
	stopVelocity: number;
	maxVelocityPxPerSec: number;
}

/**
 * A force field over the virtual pointer / camera. (design §8)
 * Implemented by consumers like MediaGraph gliding, playground physics, dialogs.
 */
export interface PointerEnvironment {
	/** Mutate pointer (and/or request camera pan) for this frame. */
	applyForces(p: UnifiedPointer, dt: number): void;
}

/** The cross-cutting layer. (design §1, §11) */
export interface IVirtualPointerController {
	readonly mode: PointerMode;
	readonly pointer: UnifiedPointer;
	readonly cursor: CursorState;

	/** The global "pointer-grab" toggle button. */
	setUserGrab(on: boolean): void;

	/** Consumer requests virtual mode; returns a release() (ref-counted, design §2). */
	request(): () => void;

	/** Bind to a DOM element's pointer events; returns detach(). */
	attach(el: HTMLElement): () => void;

	/** React to pointer updates; returns unsubscribe(). */
	subscribe(fn: (p: UnifiedPointer) => void): () => void;

	/** Optional environment forces (gliding, playground). */
	setEnvironment(env: PointerEnvironment | null): void;
}

/** Camera gesture controller: multitouch pan/zoom/rotate + throw/brake. (design §5,§6) */
export interface IMapGestureController {
	readonly camera: Camera;
	attach(el: HTMLElement): () => void;
	onChange(fn: (c: Camera) => void): () => void;
}
