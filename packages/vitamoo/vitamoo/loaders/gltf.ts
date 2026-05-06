/**
 * Minimal glTF 2.0 loader: parse .gltf JSON and extract static meshes as MeshData.
 * Supports embedded buffers (data:application/octet-stream;base64,...) and external .bin.
 * One MeshData per glTF mesh (first primitive only per mesh; no skinning).
 */

import type { MeshData, Face, Vec3, Vec2 } from '../types.js';

interface GltfAccessor {
    bufferView?: number;
    byteOffset?: number;
    componentType: number;
    type: string;
    count: number;
}

interface GltfBufferView {
    buffer: number;
    byteOffset?: number;
    byteLength: number;
    byteStride?: number;
}

interface GltfBuffer {
    uri?: string;
    byteLength: number;
}

interface GltfPrimitive {
    attributes: Record<string, number>;
    indices?: number;
    material?: number;
}

interface GltfMesh {
    name?: string;
    primitives: GltfPrimitive[];
}

interface GltfRoot {
    asset: { version: string };
    buffers?: GltfBuffer[];
    bufferViews?: GltfBufferView[];
    accessors?: GltfAccessor[];
    meshes?: GltfMesh[];
    materials?: Array<{ name?: string; pbrMetallicRoughness?: { baseColorTexture?: { index: number } } }>;
}

const COMPONENT_TYPE_FLOAT = 5126;
const COMPONENT_TYPE_UNSIGNED_SHORT = 5123;
const COMPONENT_TYPE_UNSIGNED_INT = 5125;

function getByteStride(accessor: GltfAccessor, bufferView: GltfBufferView | undefined): number {
    if (bufferView?.byteStride != null) return bufferView.byteStride;
    const components = accessor.type === 'VEC3' ? 3 : accessor.type === 'VEC2' ? 2 : 1;
    return components * (accessor.componentType === COMPONENT_TYPE_FLOAT ? 4 : 2);
}

function readFloatArray(
    buffer: ArrayBuffer,
    bufferView: GltfBufferView,
    accessor: GltfAccessor,
): Float32Array {
    const viewOffset = bufferView.byteOffset ?? 0;
    const accOffset = accessor.byteOffset ?? 0;
    const base = viewOffset + accOffset;
    const components = accessor.type === 'VEC3' ? 3 : accessor.type === 'VEC2' ? 2 : 1;
    const stride = getByteStride(accessor, bufferView);
    const count = accessor.count * components;
    const out = new Float32Array(count);
    const view = new DataView(buffer);
    let src = base;
    for (let i = 0; i < accessor.count; i++) {
        for (let c = 0; c < components; c++) {
            out[i * components + c] = view.getFloat32(src + c * 4, true);
        }
        src += stride;
    }
    return out;
}

function readIndexArray(
    buffer: ArrayBuffer,
    bufferView: GltfBufferView,
    accessor: GltfAccessor,
): Uint32Array {
    const viewOffset = bufferView.byteOffset ?? 0;
    const accOffset = accessor.byteOffset ?? 0;
    const base = viewOffset + accOffset;
    const count = accessor.count;
    const out = new Uint32Array(count);
    const view = new DataView(buffer);
    const componentType = accessor.componentType;
    for (let i = 0; i < count; i++) {
        const off = base + i * (componentType === COMPONENT_TYPE_UNSIGNED_INT ? 4 : 2);
        out[i] = componentType === COMPONENT_TYPE_UNSIGNED_INT
            ? view.getUint32(off, true)
            : view.getUint16(off, true);
    }
    return out;
}

function resolveBuffers(gltf: GltfRoot, baseUrl: string): Promise<ArrayBuffer[]> {
    const buffers = gltf.buffers ?? [];
    return Promise.all(buffers.map(async (b, i) => {
        if (b.uri?.startsWith('data:')) {
            const comma = b.uri.indexOf(',');
            const base64 = b.uri.slice(comma + 1);
            const bin = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            return bin.buffer;
        }
        if (b.uri) {
            const url = new URL(b.uri, baseUrl).href;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch buffer: ${url}`);
            return res.arrayBuffer();
        }
        throw new Error(`Buffer ${i} has no uri (embedded binary not yet supported for separate .bin)`);
    }));
}

/**
 * Load one or more static meshes from a glTF 2.0 JSON (and its buffers).
 * Uses the first primitive of each mesh; skips skinning.
 * @param source URL to .gltf or JSON string; if URL, external .bin is fetched from same dir
 * @param options.meshName If set, only return the mesh with this name (otherwise all meshes)
 */
export async function loadGltfMeshes(
    source: string,
    options?: { meshName?: string },
): Promise<MeshData[]> {
    let gltf: GltfRoot;
    let baseUrl = '';
    if (source.trim().startsWith('{')) {
        gltf = JSON.parse(source) as GltfRoot;
    } else {
        baseUrl = source.includes('/') ? source.replace(/[^/]+$/, '') : '';
        const res = await fetch(source);
        if (!res.ok) throw new Error(`Failed to fetch glTF: ${source}`);
        gltf = await res.json() as GltfRoot;
    }
    if (!gltf.asset?.version?.startsWith('2')) throw new Error('Unsupported glTF version');
    const buffers = await resolveBuffers(gltf, baseUrl);
    const bufferViews = gltf.bufferViews ?? [];
    const accessors = gltf.accessors ?? [];
    const meshes = gltf.meshes ?? [];
    const out: MeshData[] = [];
    for (const mesh of meshes) {
        if (options?.meshName != null && (mesh.name ?? '') !== options.meshName) continue;
        const prim = mesh.primitives?.[0];
        if (!prim) continue;
        const posAccIdx = prim.attributes.POSITION;
        const normAccIdx = prim.attributes.NORMAL;
        const uvAccIdx = prim.attributes.TEXCOORD_0;
        const indAccIdx = prim.indices;
        if (posAccIdx == null) continue;
        const posAcc = accessors[posAccIdx];
        const normAcc = normAccIdx != null ? accessors[normAccIdx] : null;
        const uvAcc = uvAccIdx != null ? accessors[uvAccIdx] : null;
        if (!posAcc || posAcc.type !== 'VEC3' || posAcc.componentType !== COMPONENT_TYPE_FLOAT) continue;
        const posView = posAcc.bufferView != null ? bufferViews[posAcc.bufferView] : null;
        if (!posView) continue;
        const posBuffer = buffers[posView.buffer] ?? buffers[0];
        const positions = readFloatArray(posBuffer, posView, posAcc);
        let normals: Float32Array;
        if (normAcc && normAcc.type === 'VEC3' && normAcc.componentType === COMPONENT_TYPE_FLOAT) {
            const nv = normAcc.bufferView != null ? bufferViews[normAcc.bufferView] : null;
            const nBuf = nv ? (buffers[nv.buffer] ?? buffers[0]) : posBuffer;
            normals = nv ? readFloatArray(nBuf, nv, normAcc) : makeFlatNormals(positions, indAccIdx != null ? (() => { const ia = accessors[indAccIdx]; const iv = ia.bufferView != null ? bufferViews[ia.bufferView] : null; return iv ? readIndexArray(buffers[iv.buffer] ?? buffers[0], iv, ia) : null; })() : null);
        } else {
            const indForNorm = indAccIdx != null ? (() => { const ia = accessors[indAccIdx]; const iv = ia.bufferView != null ? bufferViews[ia.bufferView] : null; return iv ? readIndexArray(buffers[iv.buffer] ?? buffers[0], iv, ia) : null; })() : null;
            normals = makeFlatNormals(positions, indForNorm);
        }
        let uvs: Float32Array;
        if (uvAcc && uvAcc.type === 'VEC2' && uvAcc.componentType === COMPONENT_TYPE_FLOAT) {
            const uvView = uvAcc.bufferView != null ? bufferViews[uvAcc.bufferView] : null;
            const uvBuffer = uvView ? (buffers[uvView.buffer] ?? buffers[0]) : posBuffer;
            uvs = uvView ? readFloatArray(uvBuffer, uvView, uvAcc) : new Float32Array((positions.length / 3) * 2);
        } else {
            uvs = new Float32Array((positions.length / 3) * 2);
        }
        let indices: Uint32Array;
        if (indAccIdx != null) {
            const indAcc = accessors[indAccIdx];
            const indView = indAcc.bufferView != null ? bufferViews[indAcc.bufferView] : null;
            const indBuffer = indView ? (buffers[indView.buffer] ?? buffers[0]) : posBuffer;
            indices = indView ? readIndexArray(indBuffer, indView, indAcc) : sequentialIndices(positions.length / 3);
        } else {
            indices = sequentialIndices(positions.length / 3);
        }
        const vertices: Vec3[] = [];
        const normalsList: Vec3[] = [];
        const uvsList: Vec2[] = [];
        for (let i = 0; i < positions.length; i += 3) {
            vertices.push({ x: positions[i], y: positions[i + 1], z: positions[i + 2] });
            normalsList.push({ x: normals[i], y: normals[i + 1], z: normals[i + 2] });
            uvsList.push({ x: uvs[(i / 3) * 2] ?? 0, y: uvs[(i / 3) * 2 + 1] ?? 0 });
        }
        const faces: Face[] = [];
        for (let i = 0; i < indices.length; i += 3) {
            faces.push({ a: indices[i], b: indices[i + 1], c: indices[i + 2] });
        }
        let textureName = '';
        if (prim.material != null && gltf.materials?.[prim.material]?.pbrMetallicRoughness?.baseColorTexture != null) {
            textureName = gltf.materials[prim.material].name ?? `material_${prim.material}`;
        }
        out.push({
            name: mesh.name ?? `mesh_${out.length}`,
            textureName,
            boneNames: [],
            boneBindings: [],
            blendBindings: [],
            faces,
            uvs: uvsList,
            vertices,
            normals: normalsList,
        });
    }
    return out;
}

function sequentialIndices(vertexCount: number): Uint32Array {
    const a = new Uint32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) a[i] = i;
    return a;
}

function makeFlatNormals(positions: Float32Array, indices: Uint32Array | null): Float32Array {
    const n = positions.length / 3;
    const normals = new Float32Array(positions.length);
    const idx = indices ?? (() => { const s = new Uint32Array(n); for (let i = 0; i < n; i++) s[i] = i; return s; })();
    for (let i = 0; i < idx.length; i += 3) {
        const i0 = idx[i] * 3, i1 = idx[i + 1] * 3, i2 = idx[i + 2] * 3;
        const ax = positions[i1] - positions[i0], ay = positions[i1 + 1] - positions[i0 + 1], az = positions[i1 + 2] - positions[i0 + 2];
        const bx = positions[i2] - positions[i0], by = positions[i2 + 1] - positions[i0 + 1], bz = positions[i2 + 2] - positions[i0 + 2];
        let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= len; ny /= len; nz /= len;
        normals[i0] += nx; normals[i0 + 1] += ny; normals[i0 + 2] += nz;
        normals[i1] += nx; normals[i1 + 1] += ny; normals[i1 + 2] += nz;
        normals[i2] += nx; normals[i2 + 1] += ny; normals[i2 + 2] += nz;
    }
    for (let i = 0; i < n; i++) {
        const i3 = i * 3;
        const len = Math.sqrt(normals[i3] ** 2 + normals[i3 + 1] ** 2 + normals[i3 + 2] ** 2) || 1;
        normals[i3] /= len; normals[i3 + 1] /= len; normals[i3 + 2] /= len;
    }
    return normals;
}
