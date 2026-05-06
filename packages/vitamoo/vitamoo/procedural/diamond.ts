import type { MeshData, Face, Vec3, Vec2 } from '../types.js';

/**
 * Creates a diamond (bipyramid) mesh in model space: equator ring + top and bottom apex.
 * Same geometry as the legacy drawDiamond path; use with drawMesh + transform for display.
 * Generated once and cached; no per-frame regeneration.
 */
export function createDiamondMesh(
    size = 1,
    segments = 6,
): MeshData {
    const s = size;
    const h = size * 2.2;
    const eq: Vec3[] = [];
    for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        eq.push({ x: s * Math.cos(a), y: 0, z: s * Math.sin(a) });
    }
    const top: Vec3 = { x: 0, y: h, z: 0 };
    const bot: Vec3 = { x: 0, y: -h, z: 0 };

    const vertices: Vec3[] = [];
    const normals: Vec3[] = [];
    const uvs: Vec2[] = [];
    const faces: Face[] = [];
    let vi = 0;

    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        const a = eq[i];
        const b = eq[next];
        const triTop = [b, a, top];
        const triBot = [a, b, bot];
        for (const tri of [triTop, triBot]) {
            const n = normalFromTri(tri[0], tri[1], tri[2]);
            for (let j = 0; j < 3; j++) {
                vertices.push({ ...tri[j] });
                normals.push({ ...n });
                uvs.push({ x: 0, y: 0 });
            }
            faces.push({ a: vi, b: vi + 1, c: vi + 2 });
            vi += 3;
        }
    }

    return {
        name: 'procedural/diamond',
        textureName: '',
        boneNames: [],
        boneBindings: [],
        blendBindings: [],
        faces,
        uvs,
        vertices,
        normals,
    };
}

function normalFromTri(a: Vec3, b: Vec3, c: Vec3): Vec3 {
    let nx = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
    let ny = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
    let nz = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    return { x: nx / len, y: ny / len, z: nz / len };
}
