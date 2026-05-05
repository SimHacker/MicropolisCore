#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const mergeDistPath = path.join(root, 'mooshow/dist/runtime/playing-scene-merge.js');
if (!fs.existsSync(mergeDistPath)) {
    throw new Error(`Build mooshow first: missing ${mergeDistPath}`);
}

const { parseContentIndexAssetLists, playingSceneExchangeToContentIndex } = await import(pathToFileURL(mergeDistPath).href);

const exchangePath = path.join(root, 'vitamoospace/static/data/content-exchange.json');
const exchange = JSON.parse(fs.readFileSync(exchangePath, 'utf8'));
let merged = exchange;
if (exchange.assetIndexRef) {
    const assetPath = path.resolve(path.dirname(exchangePath), exchange.assetIndexRef);
    const assets = parseContentIndexAssetLists(
        JSON.parse(fs.readFileSync(assetPath, 'utf8')),
        exchange.assetIndexRef,
    );
    merged = { ...assets, ...exchange };
}

const index = playingSceneExchangeToContentIndex(merged);
assert.equal(index.characters?.length, exchange.characterTemplates.length, 'template count should map to characters');
assert.equal(index.scenes?.length, exchange.playingScenes.length, 'playing scene count should map to scenes');
assert.equal(index.gltfAttachments?.length ?? 0, exchange.gltfAttachments?.length ?? 0, 'gltfAttachments passthrough');

const firstScene = index.scenes?.[0];
assert.ok(firstScene, 'expected at least one mapped scene');
const firstCast = firstScene.cast[0];
assert.ok(firstCast, 'expected at least one cast row');
assert.ok(firstCast.characterTemplateId, 'mapped cast row should keep characterTemplateId');
const mappedTemplate = exchange.characterTemplates.find((t) => t.id === firstCast.characterTemplateId);
assert.ok(mappedTemplate, 'characterTemplateId should resolve back to template');
assert.equal(firstCast.actor, exchange.playingScenes[0].cast[0].actorLabel, 'actor label should map through');
assert.equal(
    Object.hasOwn(firstCast, 'character'),
    false,
    'cast rows should not keep legacy character-name fallback fields',
);

const dupMerged = structuredClone(merged);
dupMerged.characterTemplates.push({ ...dupMerged.characterTemplates[0] });
assert.throws(
    () => playingSceneExchangeToContentIndex(dupMerged),
    /Duplicate character template id/,
    'duplicate template ids should fail',
);

console.log('OK playing-scene merge invariants', {
    templates: index.characters?.length ?? 0,
    scenes: index.scenes?.length ?? 0,
});
