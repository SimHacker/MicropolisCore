#!/usr/bin/env node
/**
 * One-time: split legacy monolithic content.json into
 *   static/data/content-assets.json  — lists only (jq-friendly)
 *   static/data/content-exchange.json — schemaVersion, templates, playingScenes, refs
 *
 * Run: node vitamoo/scripts/split-demo-exchange.mjs
 * (from SimObliterator_Suite repo root)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const legacyPath = path.join(root, 'vitamoospace/static/data/content.json');
const assetsPath = path.join(root, 'vitamoospace/static/data/content-assets.json');
const exchangePath = path.join(root, 'vitamoospace/static/data/content-exchange.json');

const ASSET_KEYS = [
    'skeletons',
    'suits',
    'animations',
    'meshes',
    'textures_bmp',
    'textures_png',
    'cfp_files',
    'defaults',
];

function slug(s) {
    const t = String(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return t || 'item';
}

function uniqueSlug(name, used) {
    let base = slug(name);
    let out = base;
    let n = 2;
    while (used.has(out)) {
        out = `${base}-${n}`;
        n += 1;
    }
    used.add(out);
    return out;
}

const raw = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
const assets = {};
for (const k of ASSET_KEYS) {
    if (raw[k] !== undefined) assets[k] = raw[k];
}

const nameToTemplateId = new Map();
const usedIds = new Set();

const characterTemplates = (raw.characters || []).map((c) => {
    const id = uniqueSlug(c.name, usedIds);
    nameToTemplateId.set(c.name.toLowerCase(), id);
    return { id, ...c };
});

const playingScenes = (raw.scenes || []).map((sc, si) => {
    const id = uniqueSlug(sc.name, usedIds);
    const cast = (sc.cast || []).map((row, ci) => {
        const tid = nameToTemplateId.get(String(row.character).toLowerCase());
        if (!tid) {
            throw new Error(`Scene "${sc.name}" row ${ci}: unknown character "${row.character}"`);
        }
        return {
            id: `person-${id}-${ci}`,
            characterTemplateId: tid,
            actorLabel: row.actor,
            position: { x: row.x, z: row.z },
            direction: row.direction,
            skill: row.animation,
        };
    });
    return { id, name: sc.name, cast };
});

const exchange = {
    schemaVersion: 1,
    metadata: {
        title: 'VitaMoo demo pack',
        description: 'Playing scenes and character templates; asset lists in content-assets.json.',
    },
    assetIndexRef: 'content-assets.json',
    gltfAttachments: [],
    characterTemplates,
    playingScenes,
};

fs.writeFileSync(assetsPath, JSON.stringify(assets, null, 2) + '\n');
fs.writeFileSync(exchangePath, JSON.stringify(exchange, null, 2) + '\n');
console.log('Wrote', assetsPath, 'and', exchangePath);
