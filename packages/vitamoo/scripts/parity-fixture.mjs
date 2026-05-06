import assert from 'node:assert/strict';
import {
    Practice,
    RepeatMode,
    buildSkeleton,
    updateTransforms,
    deformMesh,
    packBoneTransforms,
    compareBoneTransforms,
    compareDeformedVertices,
} from '../dist/vitamoo.js';

function makeSkeletonData() {
    return {
        name: 'fixture-skeleton',
        bones: [
            {
                name: 'ROOT',
                parentName: '',
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                canTranslate: true,
                canRotate: true,
                canBlend: true,
                canWiggle: false,
                wigglePower: 0,
                props: new Map(),
            },
            {
                name: 'CHILD',
                parentName: 'ROOT',
                position: { x: 0, y: 1, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                canTranslate: true,
                canRotate: true,
                canBlend: true,
                canWiggle: false,
                wigglePower: 0,
                props: new Map(),
            },
        ],
    };
}

function makeSkillData() {
    const frames = 10;
    const translations = [];
    const rotations = [];
    for (let i = 0; i < frames; i++) {
        translations.push({ x: i * 0.1, y: 0, z: 0 });
        rotations.push({ x: 0, y: Math.sin(i * 0.05), z: 0, w: Math.cos(i * 0.05) });
    }
    return {
        name: 'fixture-skill',
        animationFileName: 'fixture.cfp',
        duration: 1000,
        distance: 0,
        isMoving: false,
        numTranslations: translations.length,
        numRotations: rotations.length,
        motions: [
            {
                boneName: 'CHILD',
                frames,
                duration: 1000,
                hasTranslation: true,
                hasRotation: true,
                translationsOffset: 0,
                rotationsOffset: 0,
                props: new Map(),
                timeProps: new Map([
                    [30, new Map([['evt', 'wrap']])], // 3% of duration
                ]),
            },
        ],
        translations,
        rotations,
    };
}

function makeMeshData() {
    return {
        name: 'fixture-mesh',
        textureName: '',
        boneNames: ['ROOT', 'CHILD'],
        faces: [{ a: 0, b: 1, c: 2 }],
        boneBindings: [
            {
                boneIndex: 0,
                firstVertex: 0,
                vertexCount: 3,
                firstBlendedVertex: 0,
                blendedVertexCount: 0,
            },
        ],
        uvs: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
        blendBindings: [],
        vertices: [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
        ],
        normals: [
            { x: 0, y: 0, z: 1 },
            { x: 0, y: 0, z: 1 },
            { x: 0, y: 0, z: 1 },
        ],
    };
}

function runEventWrapFixture() {
    const skeleton = buildSkeleton(makeSkeletonData());
    const skill = makeSkillData();
    const practice = new Practice(skill, skeleton, { repeatMode: RepeatMode.Loop });
    const events = [];
    practice.onEvent = (_practice, bone, _motion, props, elapsed) => {
        events.push({ bone: bone.name, elapsed, props });
    };

    // Prime event cursor.
    practice.elapsed = 0.95;
    practice.apply();
    practice.lastTicks = 1000;

    // Advance by +0.1 elapsed => wraps 0.95 -> 0.05 in loop mode.
    practice.tick(1100);
    practice.apply();

    assert.equal(events.length, 1, 'loop-wrap event should fire exactly once');
    assert.equal(events[0].bone, 'CHILD');
}

function runBoneCompareFixture() {
    const skeleton = buildSkeleton(makeSkeletonData());
    updateTransforms(skeleton);
    const gpuPacked = new Float32Array(skeleton.length * 8);
    packBoneTransforms(skeleton, gpuPacked);
    const cmp = compareBoneTransforms(skeleton, gpuPacked, 1e-8);
    assert.equal(cmp.posExceedCount, 0, 'bone position compare should match exactly');
    assert.equal(cmp.rotExceedCount, 0, 'bone rotation compare should match exactly');
}

function runDeformCompareFixture() {
    const skeleton = buildSkeleton(makeSkeletonData());
    updateTransforms(skeleton);
    const mesh = makeMeshData();
    const boneMap = new Map(skeleton.map((b) => [b.name, b]));
    const deformed = deformMesh(mesh, skeleton, boneMap, { verbose: false });
    const gpuPacked = new Float32Array(deformed.vertices.length * 6);
    for (let i = 0; i < deformed.vertices.length; i++) {
        const o = i * 6;
        const v = deformed.vertices[i];
        const n = deformed.normals[i];
        gpuPacked[o] = v.x;
        gpuPacked[o + 1] = v.y;
        gpuPacked[o + 2] = v.z;
        gpuPacked[o + 3] = n.x;
        gpuPacked[o + 4] = n.y;
        gpuPacked[o + 5] = n.z;
    }
    const cmp = compareDeformedVertices(deformed.vertices, deformed.normals, gpuPacked, 1e-8);
    assert.equal(cmp.posExceedCount, 0, 'deformed position compare should match exactly');
    assert.equal(cmp.normExceedCount, 0, 'deformed normal compare should match exactly');
}

function main() {
    runEventWrapFixture();
    runBoneCompareFixture();
    runDeformCompareFixture();
    console.log('[parity-fixture] all deterministic fixtures passed');
}

main();
