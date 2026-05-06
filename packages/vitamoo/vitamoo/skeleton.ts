// VitaMoo skeleton — bone hierarchy, transform propagation, mesh deformation.
//
// The deformation pipeline matches the original vitaboy C++ runtime
// (Don Hopkins, Maxis, 1997):
//
//   Phase 0: bound vertices transformed by their bone
//   Phase 1: blended vertices transformed by their bone
//   Blend:   each blended vertex lerps into its target bound vertex
//
// "A bone inherits its parent's coordinate system, then adds its translation
// followed by its rotation, to calculate the coordinate system in which the
// skins are rendered, then passes that transformation on to its children."
//
// The null-skeleton trick: "If the skeleton you pass to DeformableMesh::Bind
// is NULL, then all the bones are null pointers, which causes the deformable
// mesh to be rendered in 'bone local' coordinates. This is useful when you
// need to draw a DeformableMesh that is only bound to one bone (like the
// spinning arrow above the head). It's also possible to pass local=1 to
// force local coordinates even if bound to a skeleton. That is useful for
// drawing the people's heads in the center of the pie menu."
//
// Quaternion blending uses normalized lerp (nlerp), not slerp:
// "It's cheaper than slerping, but distorts the timing a bit,
// which is not important with higher sampling rates."
//
// The blend weight uses fixed-point (0x8000 = 1.0) in the file format
// but we store it as float after parsing. The Unity C# version disabled
// blending entirely (#if false) and it looked "good enough" to ship.

import {
    Vec3, Quat, Bone, BoneData, SkeletonData, MeshData,
    vec3, quat, vec3Add, vec3Scale, quatMultiply, quatRotateVec3, quatSlerp, vec3Lerp,
} from './types.js';

// Create runtime bones from skeleton data, linking parent/child relationships
export function buildSkeleton(data: SkeletonData): Bone[] {
    const bones: Bone[] = data.bones.map((bd, i) => ({
        ...bd,
        index: i,
        parent: null,
        children: [],
        worldPosition: vec3(),
        worldRotation: quat(),
        priority: 0,
    }));

    // Link parents and children
    const byName = new Map<string, Bone>();
    for (const bone of bones) byName.set(bone.name, bone);
    for (const bone of bones) {
        if (bone.parentName) {
            bone.parent = byName.get(bone.parentName) ?? null;
            if (bone.parent) bone.parent.children.push(bone);
        }
    }

    return bones;
}

// Find the root bone (no parent)
export function findRoot(bones: Bone[]): Bone | null {
    return bones.find(b => !b.parent) ?? null;
}

// Find a bone by name
export function findBone(bones: Bone[], name: string): Bone | null {
    return bones.find(b => b.name === name) ?? null;
}

// Propagate transforms from root to leaves.
// Each bone's world transform = parent world transform * local transform.
export function updateTransforms(bones: Bone[]): void {
    const root = findRoot(bones);
    if (!root) return;
    propagate(root, vec3(), quat());
}

function propagate(bone: Bone, parentPos: Vec3, parentRot: Quat): void {
    bone.worldPosition = vec3Add(parentPos, quatRotateVec3(parentRot, bone.position));
    bone.worldRotation = quatMultiply(parentRot, bone.rotation);
    for (const child of bone.children) {
        propagate(child, bone.worldPosition, bone.worldRotation);
    }
}

// Normalize a Vec3 in place
function vec3Normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len < 0.0001) return vec3(0, 1, 0);
    return vec3(v.x / len, v.y / len, v.z / len);
}

// Deform a mesh by its bone bindings.
//
// The vertex buffer layout (matching the original C++ DeformableMesh):
//   vertices[0 .. boundCount-1]         = bound vertices (one per UV)
//   vertices[boundCount .. totalVerts-1] = blended vertices (parallel to blendBindings[])
//
// Phase 0: Each bone transforms its bound vertices (firstVertex..firstVertex+vertexCount-1)
// Phase 1: Each bone transforms its blended vertices (boundCount+firstBlendedVertex..)
// Blend:   Each blended vertex interpolates into its target bound vertex
//
// The blend weight determines how much of bone B's influence overrides bone A:
//   destVert = lerp(destVert_by_boneA, blendVert_by_boneB, weight)
const _deformLogged = new Set<string>();

export interface DeformMeshOptions {
    /** When true, log once per mesh name with bound/blend stats (default false). */
    verbose?: boolean;
}

export function deformMesh(
    mesh: MeshData,
    bones: Bone[],
    boneMap: Map<string, Bone>,
    options?: DeformMeshOptions,
): { vertices: Vec3[]; normals: Vec3[] } {
    const totalVerts = mesh.vertices.length;
    const boundCount = mesh.uvs.length; // bound vertices = UV count
    const outVerts: Vec3[] = new Array(totalVerts);
    const outNorms: Vec3[] = new Array(totalVerts);

    let transformedBound = 0;
    let transformedBlend = 0;
    const missingBones: string[] = [];

    for (const binding of mesh.boneBindings) {
        const boneName = mesh.boneNames[binding.boneIndex];
        const bone = boneMap.get(boneName);
        if (!bone) {
            missingBones.push(`${boneName}(idx=${binding.boneIndex})`);
            continue;
        }

        // Phase 0: transform bound vertices by this bone
        for (let i = 0; i < binding.vertexCount; i++) {
            const vi = binding.firstVertex + i;
            if (vi < totalVerts && mesh.vertices[vi] && mesh.normals[vi]) {
                outVerts[vi] = vec3Add(bone.worldPosition,
                                       quatRotateVec3(bone.worldRotation, mesh.vertices[vi]));
                outNorms[vi] = quatRotateVec3(bone.worldRotation, mesh.normals[vi]);
                transformedBound++;
            }
        }

        // Phase 1: transform blended vertices by this bone
        // Blended vertices live at offset boundCount in the vertex array
        for (let i = 0; i < binding.blendedVertexCount; i++) {
            const vi = boundCount + binding.firstBlendedVertex + i;
            if (vi < totalVerts && mesh.vertices[vi] && mesh.normals[vi]) {
                outVerts[vi] = vec3Add(bone.worldPosition,
                                       quatRotateVec3(bone.worldRotation, mesh.vertices[vi]));
                outNorms[vi] = quatRotateVec3(bone.worldRotation, mesh.normals[vi]);
                transformedBlend++;
            }
        }
    }

    // Fill any untransformed vertices with rest pose
    for (let i = 0; i < totalVerts; i++) {
        if (!outVerts[i]) {
            outVerts[i] = mesh.vertices[i] ?? vec3();
            outNorms[i] = mesh.normals[i] ?? vec3(0, 1, 0);
        }
    }

    // Blend pass: interpolate blended vertices into their target bound vertices.
    // Each blendBindings[i] corresponds to blended vertex at index (boundCount + i).
    // Its otherVertexIndex points to a bound vertex that was transformed by a different bone.
    // The weight controls how much of the blended vertex's bone influence replaces
    // the bound vertex's bone influence at that position.
    let blendCount = 0;
    for (let i = 0; i < mesh.blendBindings.length; i++) {
        const blend = mesh.blendBindings[i];
        const blendVi = boundCount + i;       // blended vertex (transformed by bone B)
        const destVi = blend.otherVertexIndex; // bound vertex (transformed by bone A)
        const w = blend.weight;

        if (blendVi < totalVerts && destVi < totalVerts &&
            outVerts[blendVi] && outVerts[destVi] && w > 0) {
            const dv = outVerts[destVi];
            const bv = outVerts[blendVi];
            const dn = outNorms[destVi];
            const bn = outNorms[blendVi];

            if (w >= 1.0) {
                // Full weight: blended vertex completely replaces bound vertex
                outVerts[destVi] = bv;
                outNorms[destVi] = bn;
            } else {
                // Partial weight: interpolate position and normal
                const ow = 1.0 - w; // other weight (bound vertex's contribution)
                outVerts[destVi] = vec3(
                    ow * dv.x + w * bv.x,
                    ow * dv.y + w * bv.y,
                    ow * dv.z + w * bv.z,
                );
                outNorms[destVi] = vec3Normalize(vec3(
                    ow * dn.x + w * bn.x,
                    ow * dn.y + w * bn.y,
                    ow * dn.z + w * bn.z,
                ));
            }
            blendCount++;
        }
    }

    if (options?.verbose) {
        if (!_deformLogged.has(mesh.name)) {
            _deformLogged.add(mesh.name);
            console.log(`[deformMesh] "${mesh.name}" bound=${transformedBound} blend=${transformedBlend} blended=${blendCount}/${mesh.blendBindings.length} total=${totalVerts} missing=[${missingBones}]`);
        }
    }

    return { vertices: outVerts, normals: outNorms };
}
