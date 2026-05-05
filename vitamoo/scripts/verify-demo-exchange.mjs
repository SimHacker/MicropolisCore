#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const exchangePath = path.join(root, 'vitamoospace/static/data/content-exchange.json');
const assetsPath = path.join(root, 'vitamoospace/static/data/content-assets.json');

function fail(msg) {
    console.error(msg);
    process.exit(1);
}

function isExchangeShape(o) {
    if (o === null || typeof o !== 'object') return false;
    const templates = o.characterTemplates;
    const scenes = o.playingScenes;
    if (typeof o.schemaVersion !== 'number' || !Array.isArray(templates) || !Array.isArray(scenes)) {
        return false;
    }
    if (templates.some((row) => row === null || typeof row !== 'object')) return false;
    if (scenes.some((row) => row === null || typeof row !== 'object')) return false;
    return true;
}

const ex = JSON.parse(fs.readFileSync(exchangePath, 'utf8'));
if (!isExchangeShape(ex)) {
    fail(`${exchangePath} is not a playing-scene exchange shape`);
}

if (ex.assetIndexRef) {
    const ar = path.resolve(path.dirname(exchangePath), ex.assetIndexRef);
    if (!fs.existsSync(ar)) {
        fail(`assetIndexRef ${ex.assetIndexRef} not found at ${ar}`);
    }
    const assets = JSON.parse(fs.readFileSync(ar, 'utf8'));
    if (typeof assets !== 'object' || assets === null) {
        fail('asset bundle is not an object');
    }
    if (!Array.isArray(assets.skeletons) && !Array.isArray(assets.meshes)) {
        fail('asset bundle has no skeletons/meshes arrays (unexpected shape)');
    }
}

const templatesById = new Map();
for (const t of ex.characterTemplates) {
    if (typeof t.id !== 'string' || !t.id.trim()) fail(`template missing id: ${JSON.stringify(t)}`);
    if (templatesById.has(t.id)) fail(`duplicate template id: ${t.id}`);
    templatesById.set(t.id, t);
}

const gltfById = new Set();
for (let i = 0; i < (ex.gltfAttachments || []).length; i++) {
    const a = ex.gltfAttachments[i];
    if (a === null || typeof a !== 'object') fail(`gltfAttachments[${i}] must be an object`);
    if (typeof a.id !== 'string' || !a.id.trim()) fail(`gltfAttachments[${i}] missing id`);
    if (gltfById.has(a.id)) fail(`duplicate glTF attachment id: ${a.id}`);
    gltfById.add(a.id);
    if (typeof a.url !== 'string' || !a.url.trim()) {
        fail(`gltfAttachments[${i}] (${a.id}) missing url`);
    }
    if (!/^[a-z]+:\/\//i.test(a.url)) {
        const local = path.resolve(path.dirname(exchangePath), a.url);
        if (!fs.existsSync(local)) {
            fail(`gltfAttachments[${i}] (${a.id}) url does not resolve: ${a.url}`);
        }
    }
}

const sceneIds = new Set();
for (const ps of ex.playingScenes) {
    if (typeof ps.id !== 'string' || !ps.id.trim()) fail('playing scene missing id');
    if (sceneIds.has(ps.id)) fail(`duplicate playing scene id ${ps.id}`);
    sceneIds.add(ps.id);
    if (!Array.isArray(ps.cast)) fail(`scene ${ps.id} cast not an array`);
    const placementIds = new Set();
    for (const row of ps.cast) {
        if (!row.characterTemplateId || !templatesById.has(row.characterTemplateId)) {
            fail(`scene ${ps.id} bad characterTemplateId ${row.characterTemplateId}`);
        }
        if (typeof row.id !== 'string' || !row.id.trim()) {
            fail(`scene ${ps.id} placement missing id`);
        }
        if (placementIds.has(row.id)) {
            fail(`scene ${ps.id} duplicate placement id ${row.id}`);
        }
        placementIds.add(row.id);
    }
}

console.log('OK', path.basename(exchangePath), {
    templates: ex.characterTemplates.length,
    playingScenes: ex.playingScenes.length,
    assetIndexRef: ex.assetIndexRef || '(inline)',
});
if (fs.existsSync(assetsPath)) {
    const ast = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
    console.log('OK', path.basename(assetsPath), {
        skeletons: (ast.skeletons || []).length,
        meshes: (ast.meshes || []).length,
    });
}
