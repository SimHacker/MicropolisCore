#!/usr/bin/env node
/**
 * Generates plumb-bob.gltf: diamond mesh (same as procedural) + optional second mesh.
 * Run from repo root: node vitamoo/scripts/generate-plumb-bob-gltf.js
 * Output: vitamoo/dist/data/plumb-bob.gltf (embedded buffer)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const segments = 6;
const s = 1;
const h = s * 2.2;
const eq = [];
for (let i = 0; i < segments; i++) {
  const a = (i / segments) * Math.PI * 2;
  eq.push({ x: s * Math.cos(a), y: 0, z: s * Math.sin(a) });
}
const top = { x: 0, y: h, z: 0 };
const bot = { x: 0, y: -h, z: 0 };

function normalFromTri(a, b, c) {
  let nx = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
  let ny = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
  let nz = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

const positions = [];
const normals = [];
const uvs = [];
const indices = [];
let vi = 0;
for (let i = 0; i < segments; i++) {
  const next = (i + 1) % segments;
  const a = eq[i];
  const b = eq[next];
  for (const tri of [[b, a, top], [a, b, bot]]) {
    const n = normalFromTri(tri[0], tri[1], tri[2]);
    for (let j = 0; j < 3; j++) {
      positions.push(tri[j].x, tri[j].y, tri[j].z);
      normals.push(n.x, n.y, n.z);
      uvs.push(0, 0);
    }
    indices.push(vi, vi + 1, vi + 2);
    vi += 3;
  }
}

const posBytes = new Float32Array(positions);
const normBytes = new Float32Array(normals);
const uvBytes = new Float32Array(uvs);
const indBytes = new Uint16Array(indices);
const totalLen = posBytes.byteLength + normBytes.byteLength + uvBytes.byteLength + indBytes.byteLength;
const buffer = new ArrayBuffer(totalLen);
const u8 = new Uint8Array(buffer);
let off = 0;
u8.set(new Uint8Array(posBytes.buffer), off); off += posBytes.byteLength;
u8.set(new Uint8Array(normBytes.buffer), off); off += normBytes.byteLength;
u8.set(new Uint8Array(uvBytes.buffer), off); off += uvBytes.byteLength;
u8.set(new Uint8Array(indBytes.buffer), off);

const base64 = Buffer.from(buffer).toString('base64');
const posLen = posBytes.byteLength;
const normLen = normBytes.byteLength;
const uvLen = uvBytes.byteLength;
const indLen = indBytes.byteLength;

const gltf = {
  asset: { version: '2.0', generator: 'vitamoo/scripts/generate-plumb-bob-gltf.js' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ name: 'PlumbBob', mesh: 0 }],
  meshes: [
    {
      name: 'PlumbBob',
      primitives: [{
        attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
        indices: 3,
        material: 0,
      }],
    },
  ],
  materials: [
    { name: 'plumb_bob_material', pbrMetallicRoughness: { baseColorFactor: [0.2, 1.0, 0.2, 0.9], metallicFactor: 0, roughnessFactor: 1 } },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, type: 'VEC3', count: 36 },
    { bufferView: 1, componentType: 5126, type: 'VEC3', count: 36 },
    { bufferView: 2, componentType: 5126, type: 'VEC2', count: 36 },
    { bufferView: 3, componentType: 5123, type: 'SCALAR', count: 36 },
  ],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: posLen },
    { buffer: 0, byteOffset: posLen, byteLength: normLen },
    { buffer: 0, byteOffset: posLen + normLen, byteLength: uvLen },
    { buffer: 0, byteOffset: posLen + normLen + uvLen, byteLength: indLen },
  ],
  buffers: [
    { uri: 'data:application/octet-stream;base64,' + base64, byteLength: totalLen },
  ],
};

const outDir = path.join(__dirname, '..', 'dist', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'plumb-bob.gltf');
fs.writeFileSync(outPath, JSON.stringify(gltf, null, 2), 'utf8');
console.log('Wrote', outPath);
