import {
    type MeshData,
    type Vec3,
    type Quat,
    quatRotateVec3,
    vec3Scale,
    quatNormalize,
    quatConjugate,
} from './types.js';

/**
 * Display list: unified representation for all drawing — characters, props, terrain,
 * walls, roofs, UI, plumb-bobs. Each entry describes what to draw and how; the executor
 * applies the right transform (or deformation) and submits one draw per entry.
 */

export interface Transform3D {
    x: number;
    y: number;
    z: number;
    rotY?: number;
    scale?: number;
}

/** Full 3D transform for walls, props, etc. When set, overrides Transform3D for rotation. */
export interface Transform3DFull {
    x: number;
    y: number;
    z: number;
    /** Full rotation; omit to use rotY only. */
    rotation?: Quat;
    scale?: number;
}

/** Draw order / layer: world (depth-tested), overlay (e.g. UI), or explicit sort key. */
export type DisplayListLayer = 'world' | 'overlay' | number;

/** Picking: object ID (for click) and optional UV (for paint-on-skin). */
export interface PickingOptions {
    type: number;
    objectId: number;
    subObjectId?: number;
    /** When true, also write UV to the UV buffer for texture painting. */
    writeUV?: boolean;
}

/**
 * Static mesh entry: mesh + transform. Geometry is transformed each frame; no skeleton.
 * Use for: plumb-bobs, props, terrain tiles, floor, walls, wall gap covers, roofs.
 */
export interface DisplayListEntryStatic {
    kind: 'static';
    mesh: MeshData;
    transform: Transform3D | Transform3DFull;
    color?: { r: number; g: number; b: number; alpha?: number };
    texture?: unknown;
    picking?: PickingOptions;
    layer?: DisplayListLayer;
}

/**
 * Skinned mesh entry: mesh + skeleton + boneMap. Vertices are deformed each frame then drawn.
 * Use for: character bodies, accessories (same pipeline as bodies).
 */
export interface DisplayListEntrySkinned {
    kind: 'skinned';
    mesh: MeshData;
    /** Skeleton with world poses; caller runs updateTransforms before executing list. */
    skeleton: { bones: Array<{ worldPosition: Vec3; worldRotation: Quat }> };
    boneMap: Map<string, number>;
    /** Optional world-space offset (e.g. body position/direction applied after deform). */
    transform?: Transform3D;
    texture?: unknown;
    picking?: PickingOptions;
    layer?: DisplayListLayer;
}

/**
 * UI/screen-space entry: quad or mesh in screen coordinates (or NDC). Optional depth.
 * Use for: pie menu, buttons, HUD, fullscreen fade. Executor uses ortho camera or NDC.
 */
export interface DisplayListEntryUI {
    kind: 'ui';
    mesh: MeshData;
    /** Screen-space or NDC transform (interpretation depends on executor). */
    transform: Transform3D | Transform3DFull;
    color?: { r: number; g: number; b: number; alpha?: number };
    texture?: unknown;
    picking?: PickingOptions;
    layer?: DisplayListLayer;
}

export type DisplayListEntry =
    | DisplayListEntryStatic
    | DisplayListEntrySkinned
    | DisplayListEntryUI;

/** Legacy alias: static entry with simple transform and no kind. */
export interface DisplayListEntryLegacy {
    mesh: MeshData;
    transform: Transform3D;
    color?: { r: number; g: number; b: number; alpha?: number };
    texture?: unknown;
}

/**
 * Applies a simple 2D rotation (around Y) + translation to mesh vertices and normals.
 * Returns new arrays so the original mesh is unchanged. Use for display-list drawing.
 */
export function transformMesh(
    mesh: MeshData,
    x: number, y: number, z: number,
    rotYRad = 0,
    scale = 1,
): { vertices: Vec3[]; normals: Vec3[] } {
    const cos = Math.cos(rotYRad);
    const sin = Math.sin(rotYRad);
    const vertices: Vec3[] = [];
    const normals: Vec3[] = [];
    for (let i = 0; i < mesh.vertices.length; i++) {
        const v = mesh.vertices[i];
        const n = mesh.normals[i];
        vertices.push({
            x: (v.x * cos - v.z * sin) * scale + x,
            y: v.y * scale + y,
            z: (v.x * sin + v.z * cos) * scale + z,
        });
        normals.push({
            x: n.x * cos - n.z * sin,
            y: n.y,
            z: n.x * sin + n.z * cos,
        });
    }
    return { vertices, normals };
}

/**
 * Like {@link transformMesh}, but first rotates vertices/normals by the inverse of
 * `boneWorldRotation`. Use only when mesh vertices are defined in **that bone's local space**
 * (already transformed by the bone); then undoing the bone world rotation keeps the object
 * world-axis aligned. For meshes already authored in world-up space (e.g. procedural plumb bob),
 * pass only {@link transformMesh} — do not pass bone rotation.
 */
export function transformMeshUpright(
    mesh: MeshData,
    x: number, y: number, z: number,
    boneWorldRotation: Quat,
    rotYRad: number,
    scale: number,
): { vertices: Vec3[]; normals: Vec3[] } {
    const qInv = quatConjugate(quatNormalize(boneWorldRotation));
    const cos = Math.cos(rotYRad);
    const sin = Math.sin(rotYRad);
    const vertices: Vec3[] = [];
    const normals: Vec3[] = [];
    for (let i = 0; i < mesh.vertices.length; i++) {
        const v = mesh.vertices[i];
        const n = mesh.normals[i];
        const vq = quatRotateVec3(qInv, vec3Scale(v, scale));
        const nq = quatRotateVec3(qInv, n);
        vertices.push({
            x: (vq.x * cos - vq.z * sin) + x,
            y: vq.y + y,
            z: (vq.x * sin + vq.z * cos) + z,
        });
        normals.push({
            x: nq.x * cos - nq.z * sin,
            y: nq.y,
            z: nq.x * sin + nq.z * cos,
        });
    }
    return { vertices, normals };
}
