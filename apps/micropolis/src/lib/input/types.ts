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

/** Published each frame to WebGPU cursor plugins — not a DOM render model. (design §7) */
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

/** Where a cursor/tool anchors in space — drives plugin + measure refs. */
export type CursorAnchorSpace = 'screen' | 'world-tile' | 'world-pixel';

/** Which cursor raster backends are active on `CursorLayer.svelte`. */
export type CursorBackend = 'dom' | 'webgpu' | 'both';

/** Which presentation backends participate for one cursor instance. */
export type CursorDomSlot = 'label' | 'avatar' | 'tooltip' | 'infovis' | 'autoscroll-hint';

export interface CursorRepresentationSpec {
	/** Holodeck plugin ids that draw GPU pixels (may be empty → no WebGPU work). */
	webgpu?: string[];
	/** DOM slots to mount; omit or `[]` → create no DOM nodes for this cursor. */
	dom?: CursorDomSlot[];
}

/**
 * Per-player cursor bundle — the single logical "cursor" coordinated across layers.
 * Tile tools (bulldozer, residential) use `world-tile`; chalk/whiteboard glide in
 * `world-pixel`; local pointer uses `screen`.
 *
 * FUTURE (design only): shared tool instances — pall bearers, opposite-corner resize,
 * tool-as-vehicle (driver + passenger). See map-compositing-and-measurement.md §3.5.
 * Expect optional `role?`, `toolInstanceId?` when multiplayer collaborative tools land.
 */
export interface CursorPresence {
	playerId: string;
	local: boolean;
	toolId: string;
	anchorSpace: CursorAnchorSpace;
	visible: boolean;
	/** FUTURE: e.g. 'driver' | 'passenger' | 'corner-tl' | 'corner-br' | 'pall-bearer'. */
	role?: string;
	/** FUTURE: shared vehicle/zone draft id when multiple presences attach to one tool. */
	toolInstanceId?: string;
	/** Tile footprint when anchorSpace === 'world-tile'. */
	tile?: { x: number; y: number; w?: number; h?: number };
	/** Virtual/world pixel position when anchorSpace === 'world-pixel' (chalk, strokes). */
	worldPx?: { x: number; y: number };
	/** Screen hotspot when anchorSpace === 'screen' or pointer overlay. */
	screen?: { x: number; y: number };
	/** User icon / avatar — may attach to tool frame or float independently. */
	avatar?: {
		spriteId: string;
		attachTo: 'tool-cursor' | 'pointer' | 'free';
	};
	/** Which backends render this presence (remote tile-only often has webgpu, no dom). */
	representations: CursorRepresentationSpec;
	styleId?: string;
	rimPolicy?: 'fat' | 'thin';
	/** In-progress stroke (chalk, whiteboard) — WebGPU line + optional DOM infovis. */
	stroke?: {
		points: Array<{ x: number; y: number }>;
		color: string;
		width: number;
		down: boolean;
	};
}

/** Tool catalog entry — maps tool id → anchor space + default representations. */
export interface ToolCursorProfile {
	toolId: string;
	anchorSpace: CursorAnchorSpace;
	styleId: string;
	representations: CursorRepresentationSpec;
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
