// input/MapGestureController.ts — Camera gestures: pan / zoom / rotate + throw / brake.
//
// DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md §4,§5,§6
//
// STATUS: SKELETON — class shape + state-machine contract only; bodies are TODO.
// A CONSUMER of the input layer (design §9). Uses gestureMath for pure transforms.
// Stays in 'direct' mode for multitouch (Pointer Lock is single-pointer).

import type { Camera, IMapGestureController, InertiaPolicy } from './types';
// TODO(impl): import { panBy, zoomRotateAbout, centroid, spread, meanAngle } from './gestureMath';

const DEFAULT_INERTIA: InertiaPolicy = {
	minFlingVelocity: 120,
	friction: 0.0025, // pos *= friction^dt  (strong decay per second)
	stopVelocity: 8,
	maxVelocityPxPerSec: 4000
};

export class MapGestureController implements IMapGestureController {
	private _camera: Camera = { x: 0, y: 0, scale: 1, rotation: 0 };
	private listeners = new Set<(c: Camera) => void>();

	// active touch points by pointerId, and the previous-frame gesture reference
	// (centroid/spread/angle) used to compute per-frame pan/zoom/rotate deltas.
	private points = new Map<number, { x: number; y: number }>();

	// throw/brake state machine (design §5): 'idle' | 'drag' | 'fling' | 'brake'
	private phase: 'idle' | 'drag' | 'fling' | 'brake' = 'idle';
	private vx = 0;
	private vy = 0;
	private inertia: InertiaPolicy = DEFAULT_INERTIA;

	get camera(): Camera {
		return this._camera;
	}

	attach(_el: HTMLElement): () => void {
		// TODO: listen pointerdown/move/up/cancel + wheel; route into the handlers below;
		//       return detach() that removes listeners and cancels any rAF.
		throw new Error('TODO: attach — see virtual-cursor-layer.md §5,§6');
	}

	onChange(fn: (c: Camera) => void): () => void {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	// --- gesture handlers (all TODO) ---

	/** Pointer added: brake any fling, rebase gesture reference (seamless handoff §6). */
	private onPointerDown(_id: number, _x: number, _y: number): void {
		// TODO: if phase==='fling' -> phase='brake' (v=0) then 'drag' (catch the map).
		//       points.set(id,...); rebaseReference();  // so next frame delta == 0
		throw new Error('TODO: onPointerDown — see virtual-cursor-layer.md §5,§6');
	}

	/** Pointer moved: compute pan(Δcentroid) + zoom(dist ratio) + rotate(Δangle) about pivot. */
	private onPointerMove(_id: number, _x: number, _y: number): void {
		// TODO: update points; pivot = centroid(points);
		//   1 pointer -> panBy(Δcentroid)
		//   2+        -> zoomRotateAbout(cam, pivot, spreadNow/spreadPrev, angleNow-anglePrev)
		//                then pan by Δcentroid; track vx/vy for throw; emit().
		throw new Error('TODO: onPointerMove — see virtual-cursor-layer.md §6');
	}

	/** Pointer removed: if last finger up with velocity -> startFling(); else rebase. */
	private onPointerUp(_id: number): void {
		// TODO: points.delete(id);
		//       if points.size === 0 && |v| >= inertia.minFlingVelocity -> startFling();
		//       else rebaseReference() so remaining fingers continue without a jump (§6 handoff).
		throw new Error('TODO: onPointerUp — see virtual-cursor-layer.md §5,§6');
	}

	/** Wheel/trackpad zoom about cursor (design §6). */
	private onWheel(_x: number, _y: number, _deltaY: number, _ctrl: boolean): void {
		// TODO: zoomRotateAbout(cam, {x,y}, exp(-deltaY*k), 0); emit();
		throw new Error('TODO: onWheel — see virtual-cursor-layer.md §6');
	}

	// --- inertial throw (design §5) ---

	/** Begin a fling using the tracked release velocity. */
	private startFling(): void {
		// TODO: phase='fling'; clamp v to maxVelocity; requestAnimationFrame(step).
		throw new Error('TODO: startFling — see virtual-cursor-layer.md §5');
	}

	/** rAF step: pos += v*dt; v *= friction^dt; stop when |v| < stopVelocity. */
	private step(_dt: number): void {
		// TODO: integrate camera translate by velocity; decay; emit(); reschedule or idle.
		throw new Error('TODO: step — see virtual-cursor-layer.md §5');
	}

	/** Rebase prev centroid/spread/angle to the CURRENT points so next delta is zero. */
	private rebaseReference(): void {
		// TODO: recompute and store reference centroid/spread/angle from points.
		throw new Error('TODO: rebaseReference — seamless finger add/remove (§6).');
	}

	private emit(): void {
		for (const fn of this.listeners) fn(this._camera);
	}
}
