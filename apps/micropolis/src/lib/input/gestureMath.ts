// input/gestureMath.ts — Pure camera/pivot transform helpers (NO STATE).
//
// DESIGN: ../../../../documentation/designs/virtual-cursor-layer.md §6 (pivot math)
//
// STATUS: SKELETON — signatures + contracts only, bodies are TODO. These must stay
// pure (no DOM, no time) so they are trivially testable and reusable across the
// federation (donhopkins.com, etc.). TODO: lift to @micropolis/input later.

import type { Camera } from './types';

export interface Point {
	x: number;
	y: number;
}

/**
 * World → screen using the camera (translate, scale, rotate).
 * TODO(impl): screen = R(rotation)·(world·scale) + (camera.x, camera.y)
 */
export function worldToScreen(_world: Point, _cam: Camera): Point {
	throw new Error('TODO: implement worldToScreen — see virtual-cursor-layer.md §6');
}

/**
 * Screen → world (inverse of worldToScreen). Used to keep the pivot world-point
 * fixed across zoom/rotate.
 * TODO(impl): world = (R(-rotation)·(screen − camera)) / scale
 */
export function screenToWorld(_screen: Point, _cam: Camera): Camera | Point {
	throw new Error('TODO: implement screenToWorld — see virtual-cursor-layer.md §6');
}

/**
 * Apply a screen-space pan delta to the camera.
 * TODO(impl): return { ...cam, x: cam.x + dx, y: cam.y + dy }
 */
export function panBy(_cam: Camera, _dx: number, _dy: number): Camera {
	throw new Error('TODO: implement panBy');
}

/**
 * Compose zoom (scaleFactor) and rotate (dRadians) ABOUT a screen pivot so the world
 * point under the pivot stays put — the Google-Maps pinch/twist feel. (design §6)
 *
 * TODO(impl):
 *   1. p_world = screenToWorld(pivot, cam)
 *   2. cam' = { scale: cam.scale*scaleFactor, rotation: cam.rotation + dRadians }
 *   3. p_screen' = worldToScreen(p_world, cam')
 *   4. translate cam' by (pivot - p_screen') so the pivot maps back to itself
 */
export function zoomRotateAbout(
	_cam: Camera,
	_pivot: Point,
	_scaleFactor: number,
	_dRadians: number
): Camera {
	throw new Error('TODO: implement zoomRotateAbout — see virtual-cursor-layer.md §6');
}

/** Centroid of N active pointers (multitouch). TODO(impl): mean of points. */
export function centroid(_pts: Point[]): Point {
	throw new Error('TODO: implement centroid');
}

/** Mean distance of points from their centroid (pinch scale reference). */
export function spread(_pts: Point[], _center: Point): number {
	throw new Error('TODO: implement spread');
}

/** Average angle of points around the centroid (twist rotation reference). */
export function meanAngle(_pts: Point[], _center: Point): number {
	throw new Error('TODO: implement meanAngle');
}
