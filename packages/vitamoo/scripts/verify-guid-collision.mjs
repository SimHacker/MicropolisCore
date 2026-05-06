#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const moduleUrl = pathToFileURL(path.join(root, 'dist/vitamoo.js')).href;
const {
    buildGuidObjectMap,
    analyzeGuidObjectMap,
    buildGuidCollisionWarnings,
} = await import(moduleUrl);

const scannedObjects = [
    {
        guid: 0x12345678,
        sourceKind: 'base-game',
        immutable: true,
        sourcePath: 'GameData/Objects/Base.iff',
        payload: { name: 'Red Carpet', price: 120, footprint: [2, 1] },
    },
    {
        guid: 0x12345678,
        sourceKind: 'download',
        sourcePath: 'Downloads/red-carpet-copy.iff',
        payload: { name: 'Red Carpet', price: 120, footprint: [2, 1] },
    },
    {
        guid: 0x12345678,
        sourceKind: 'download',
        sourcePath: 'Downloads/red-carpet-variant.iff',
        payload: { name: 'Red Carpet Deluxe', price: 130, footprint: [2, 1] },
    },
    {
        guid: 0x11111111,
        sourceKind: 'download',
        sourcePath: 'Downloads/blue-chair.iff',
        payload: { name: 'Blue Chair', price: 50, footprint: [1, 1] },
    },
];

const byGuid = buildGuidObjectMap(scannedObjects);
assert.equal(byGuid.size, 2, 'expected two GUID buckets');
assert.equal(byGuid.get(0x12345678)?.length, 3, 'expected three objects in collision bucket');

const analyses = analyzeGuidObjectMap(byGuid, { nearMatchThreshold: 0.45 });
const hot = analyses.get(0x12345678);
assert.ok(hot, 'expected collision analysis for 0x12345678');
assert.equal(hot.exactGroups.length, 2, 'expected exact duplicate group plus one variant');
assert.ok(hot.immutableGroupIds.length >= 1, 'expected immutable anchor group');
assert.equal(hot.similarityByExactGroup.values.length, 2, 'expected 2x2 group similarity matrix');
assert.notEqual(hot.classification, 'unique', 'collision bucket should not classify as unique');

const warnings = buildGuidCollisionWarnings(analyses.values());
const warning = warnings.find((w) => w.guid === 0x12345678);
assert.ok(warning, 'expected one warning for colliding GUID');

const quiet = analyses.get(0x11111111);
assert.ok(quiet, 'expected unique GUID analysis');
assert.equal(quiet.classification, 'unique', 'single object GUID should classify as unique');

console.log('OK guid collision analysis', {
    buckets: byGuid.size,
    warningCount: warnings.length,
    hotClassification: hot.classification,
});
