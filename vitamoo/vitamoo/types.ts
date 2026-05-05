// VitaMoo core types — data structures for skeleton, mesh, and animation.
//
// The naming vocabulary is an extended metaphor of body and performance,
// from the original VitaBoy C++ code (Don Hopkins, Maxis, 1997),
// inspired by Ken Perlin's "Improv" system for scripting interactive
// actors in virtual worlds (Perlin & Goldberg, SIGGRAPH '96).
//
// Improv separated character animation into an Animation Engine (layered,
// continuous, non-repetitive motions with smooth transitions) and a
// Behavior Engine (rules governing how actors communicate and decide).
// Actions were organized into compositing groups — actions in the same
// group competed (one fades in, others fade out), while actions in
// different groups layered like image compositing (back to front).
// Perlin's key insight: "the author thinks of motion as being layered,
// just as composited images can be layered back to front. The difference
// is that whereas an image maps pixels to colors, an action maps DOFs
// to values."
//
// Vitaboy's Practice/Skill/Motion system implements this same layered
// architecture: Practices have priorities, opaque practices occlude
// lower-priority ones on the same bones, and multiple practices blend
// via weighted averaging. The vocabulary below carries Improv's spirit
// into a game engine that shipped to millions:
//
//   Skeleton  — bone hierarchy (the body's structure)
//   Bone      — translated/rotated coordinate system node
//   Skin      — a mesh attached to a bone, rendered in its coordinate system
//   Suit      — a named set of Skins (an outfit)
//   Dressing  — binding a Suit to a Skeleton (the act of wearing)
//   Skill     — a named set of Motions (a learned ability)
//   Practice  — binding a Skill to a Skeleton (doing the skill)
//   Motion    — translation/rotation keyframe stream for one bone
//
// You "dress" a Skeleton in a Suit (creating a Dressing), and a Skeleton
// "practices" a Skill (creating a Practice). The language makes the API
// self-documenting.
//
// The animation data lives in shared buffers rather than per-motion:
// "All the data of all the motions are shared and managed by the Skill,
// so they can all be read in quickly as one chunk." This reduces
// fragmentation and load time — each Motion just stores offsets into
// the Skill's flat translation and rotation arrays.

export interface Vec2 { x: number; y: number }
export interface Vec3 { x: number; y: number; z: number }
export interface Quat { x: number; y: number; z: number; w: number }

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });
export const quat = (x = 0, y = 0, z = 0, w = 1): Quat => ({ x, y, z, w });
export const vec2 = (x = 0, y = 0): Vec2 => ({ x, y });

export function vec3Add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vec3Scale(v: Vec3, s: number): Vec3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

export function quatMultiply(a: Quat, b: Quat): Quat {
    return {
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    };
}

export function quatRotateVec3(q: Quat, v: Vec3): Vec3 {
    // Rotate vector by quaternion: q * v * q_conjugate
    const qv: Quat = { x: v.x, y: v.y, z: v.z, w: 0 };
    const qc: Quat = { x: -q.x, y: -q.y, z: -q.z, w: q.w };
    const r = quatMultiply(quatMultiply(q, qv), qc);
    return { x: r.x, y: r.y, z: r.z };
}

export function quatSlerp(a: Quat, b: Quat, t: number): Quat {
    let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
    // Ensure shortest path
    let bx = b.x, by = b.y, bz = b.z, bw = b.w;
    if (dot < 0) { dot = -dot; bx = -bx; by = -by; bz = -bz; bw = -bw; }
    if (dot > 0.9995) {
        // Close enough for linear interpolation
        return quatNormalize({
            x: a.x + (bx - a.x) * t, y: a.y + (by - a.y) * t,
            z: a.z + (bz - a.z) * t, w: a.w + (bw - a.w) * t,
        });
    }
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const wa = Math.sin((1 - t) * theta) / sinTheta;
    const wb = Math.sin(t * theta) / sinTheta;
    return {
        x: wa * a.x + wb * bx, y: wa * a.y + wb * by,
        z: wa * a.z + wb * bz, w: wa * a.w + wb * bw,
    };
}

export function quatNormalize(q: Quat): Quat {
    const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    if (len < 0.0001) return { x: 0, y: 0, z: 0, w: 1 };
    return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
}

/** Conjugate; for a unit quaternion this equals the multiplicative inverse. */
export function quatConjugate(q: Quat): Quat {
    return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

// Normalized linear interpolation with hemisphere flip (MakeClosest).
// Matches the original C++ vitaboy quaternion blending — cheaper than slerp,
// timing distortion negligible at the Sims' high sampling rates.
export function quatNlerp(a: Quat, b: Quat, t: number): Quat {
    let bx = b.x, by = b.y, bz = b.z, bw = b.w;
    if (a.x * bx + a.y * by + a.z * bz + a.w * bw < 0) {
        bx = -bx; by = -by; bz = -bz; bw = -bw;
    }
    return quatNormalize({
        x: a.x + (bx - a.x) * t,
        y: a.y + (by - a.y) * t,
        z: a.z + (bz - a.z) * t,
        w: a.w + (bw - a.w) * t,
    });
}

// "The Bone class represents a translated and rotated coordinate system.
// Bones are assembled into a skeletal tree, in a threaded list. Each bone
// has a name, as well as a parent name of the bone to which it's attached.
// A bone inherits its parent's coordinate system, then adds its translation
// followed by its rotation, to calculate the coordinate system in which the
// skins are rendered, then passes that transformation on to its children."
export interface BoneData {
    name: string;
    parentName: string;
    position: Vec3;
    rotation: Quat;
    canTranslate: boolean;
    canRotate: boolean;
    canBlend: boolean;
    canWiggle: boolean;
    wigglePower: number;
    props: Map<string, string>;
}

// Runtime bone with world transforms
export interface Bone extends BoneData {
    index: number;
    parent: Bone | null;
    children: Bone[];
    worldPosition: Vec3;
    worldRotation: Quat;
    priority: number;
}

// Skeleton: bone hierarchy
export interface SkeletonData {
    name: string;
    bones: BoneData[];
}

// Triangle face
export interface Face { a: number; b: number; c: number }

// "These index into the parallel vectors DeformableMesh::vertices and
// DeformableMesh::transformedVertices, as well as the 'partial' parallel
// vectors DeformableMesh::textureVertices and DeformableMesh::blendData.
// There is one of these for every bone used by a deformable mesh."
// The bound vertices (firstVertex..firstVertex+vertexCount-1) live in the
// first chunk of the vertex array, parallel to the UV array.
// The blended vertices (firstBlendedVertex..) live in the second chunk,
// parallel to the blendBindings array.
export interface BoneBinding {
    boneIndex: number;
    firstVertex: number;
    vertexCount: number;
    firstBlendedVertex: number;
    blendedVertexCount: number;
}

// "These are used at run-time, in the vector DeformableMesh::blendData,
// and at export time by the class BlendedVertex."
// Weight is fixed-point in the file format (0x8000 = 1.0), stored as float here.
// "I mean to change the weight to floating point. That will require
// re-exporting all the 3drt content, though." — never done, shipped as-is.
export interface BlendBinding {
    otherVertexIndex: number;
    weight: number;
}

// "This is the run-time structure that represents a deformable mesh.
// They are created in the exporter, written out to the file, and read
// back into the game."
// Vertex layout: [bound verts 0..uvs.length-1] [blended verts uvs.length..vertices.length-1]
// "The texture vertices only apply to the first chunk of bound vertices.
// The second chunk of blended vertices has a parallel vector blendData instead."
export interface MeshData {
    name: string;
    textureName: string;
    boneNames: string[];
    faces: Face[];
    boneBindings: BoneBinding[];
    uvs: Vec2[];
    blendBindings: BlendBinding[];
    vertices: Vec3[];
    normals: Vec3[];
}

// A skin wraps a mesh and binds it to a specific bone
export interface SkinData {
    name: string;
    boneName: string;
    flags: number;
    meshName: string;
    props: Map<string, string>;
}

// A suit is a collection of skins (head suit, body suit, hand suits)
export interface SuitData {
    name: string;
    type: number;      // 0=normal, 1=censor
    skins: SkinData[];
    props: Map<string, string>;
}

// A motion animates one bone
export interface MotionData {
    boneName: string;
    frames: number;
    duration: number;
    hasTranslation: boolean;
    hasRotation: boolean;
    translationsOffset: number;
    rotationsOffset: number;
    props: Map<string, string>;
    timeProps: Map<number, Map<string, string>>;
}

// "The Skill class represents a named set of Motions that can be applied
// to the Bones of a Skeleton by creating a Practice."
// Translation and rotation data are stored in shared buffers — each Motion
// stores offsets into these flat arrays. "All the data of all the motions
// are shared and managed by the Skill, so they can all be read in quickly
// as one chunk."
export interface SkillData {
    name: string;
    animationFileName: string;
    duration: number;
    distance: number;
    isMoving: boolean;
    numTranslations: number;
    numRotations: number;
    motions: MotionData[];
    translations: Vec3[];    // filled when animation file is loaded
    rotations: Quat[];       // filled when animation file is loaded
}

// A CMX file can contain any combination of skeletons, suits, and skills
export interface CMXFile {
    skeletons: SkeletonData[];
    suits: SuitData[];
    skills: SkillData[];
}
