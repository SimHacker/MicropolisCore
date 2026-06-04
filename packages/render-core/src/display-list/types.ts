/**
 * Display-list vocabulary shared by vitamoo and micropolis holodeck plugins.
 * Mesh geometry types stay in vitamoo (`MeshData`); entries reference `mesh: unknown`.
 */

export interface Vec3 {
	x: number;
	y: number;
	z: number;
}

export interface Quat {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface Transform3D {
	x: number;
	y: number;
	z: number;
	rotY?: number;
	scale?: number;
}

export interface Transform3DFull {
	x: number;
	y: number;
	z: number;
	rotation?: Quat;
	scale?: number;
}

export type DisplayListLayer = 'world' | 'overlay' | number;

export interface PickingOptions {
	type: number;
	objectId: number;
	subObjectId?: number;
	writeUV?: boolean;
}

export interface DisplayListEntryStatic {
	kind: 'static';
	mesh: unknown;
	transform: Transform3D | Transform3DFull;
	color?: { r: number; g: number; b: number; alpha?: number };
	texture?: unknown;
	picking?: PickingOptions;
	layer?: DisplayListLayer;
}

export interface DisplayListEntrySkinned {
	kind: 'skinned';
	mesh: unknown;
	skeleton: { bones: Array<{ worldPosition: Vec3; worldRotation: Quat }> };
	boneMap: Map<string, number>;
	transform?: Transform3D;
	texture?: unknown;
	picking?: PickingOptions;
	layer?: DisplayListLayer;
}

export interface DisplayListEntryUI {
	kind: 'ui';
	mesh: unknown;
	transform: Transform3D | Transform3DFull;
	color?: { r: number; g: number; b: number; alpha?: number };
	texture?: unknown;
	picking?: PickingOptions;
	layer?: DisplayListLayer;
}

/** Nine-slice frame (cursor rim, window chrome, panels). See `frame/types.ts`. */
export interface DisplayListEntryFrame {
	kind: 'frame';
	instance: import('../frame/types.js').FrameInstance;
	layer?: DisplayListLayer;
	picking?: PickingOptions;
}

export type DisplayListEntry =
	| DisplayListEntryStatic
	| DisplayListEntrySkinned
	| DisplayListEntryUI
	| DisplayListEntryFrame;
