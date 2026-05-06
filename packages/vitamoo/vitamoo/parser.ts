// VitaMoo parser — reads and writes character data in text and binary formats.
//
// Text formats (development tools, 26 years old):
//   CMX — skeleton/suit/skill definitions, one value per line
//   SKN — mesh geometry, vertices and faces
//
// Binary formats (game runtime):
//   BCF — compiled skeletons, suits, skills (binary CMX)
//   BMF — binary mesh (binary SKN)
//   CFP — delta-compressed animation keyframes
//
// The binary formats are what The Sims actually loads at runtime.
// The text formats were Maxis development tools — useful for debugging,
// and they had some nice Walt Whitman poetry you could lift into place
// in the new code. Poignant.
//
// From the original skeleton.h (Don Hopkins, Maxis, 1997):
//
// "Props are actually bags of key/value pairs, and the keys do not
// have to be unique."
//
// "The index must be within the range of 0 to skeleton->CountPractices()-1,
// or you'll learn the meaning of regret."
//
// "If the index is not valid then all hell will break loose."
//
// "Skeletons never unload." "Does nothing for skeletons, since they
// don't unload."
//
// "Please don't call this directly, it should be private."
// (appears 20+ times — an architectural confession with a polite "please"
// and a resigned "it should be")

import {
    DataReader, TextReader, BinaryReader, BinaryWriter,
    decompressFloats, compressFloats,
} from './reader.js';
import {
    Vec2, Vec3, Quat, vec3, quat, vec2,
    BoneData, SkeletonData, SkinData, SuitData, MotionData, SkillData,
    MeshData, Face, BoneBinding, BlendBinding, CMXFile,
} from './types.js';

// Fixed-point conversion: BMF blend weights are int32 where 0x8000 = 1.0.
const FIXED_ONE = 0x8000;

// ============================================================
// Shared read functions — work with both TextReader and BinaryReader
// via the DataReader interface. The text CMX and binary BCF formats
// use identical field ordering, just different primitives.
// ============================================================

function readProps(r: DataReader): Map<string, string> {
    const count = r.readInt();
    const props = new Map<string, string>();
    for (let i = 0; i < count; i++) {
        const key = r.readString();
        const value = r.readString();
        props.set(key, value);
    }
    return props;
}

function readBone(r: DataReader): BoneData {
    const name = r.readString();
    const parentName = r.readString();
    const hasProps = r.readBool();
    const props = hasProps ? readProps(r) : new Map();
    const position = r.readVec3();
    const rotation = r.readQuat();
    const canTranslate = r.readBool();
    const canRotate = r.readBool();
    const canBlend = r.readBool();
    const canWiggle = r.readBool();
    const wigglePower = r.readFloat();
    return { name, parentName, position, rotation, canTranslate, canRotate,
             canBlend, canWiggle, wigglePower, props };
}

function readSkeleton(r: DataReader): SkeletonData {
    const name = r.readString();
    const boneCount = r.readInt();
    const bones: BoneData[] = [];
    for (let i = 0; i < boneCount; i++) {
        bones.push(readBone(r));
    }
    return { name, bones };
}

function readSkin(r: DataReader): SkinData {
    const name = r.readString();
    const boneName = r.readString();
    const flags = r.readInt();
    const meshName = r.readString();
    const hasProps = r.readBool();
    const props = hasProps ? readProps(r) : new Map();
    return { name, boneName, flags, meshName, props };
}

function readSuit(r: DataReader): SuitData {
    const name = r.readString();
    const type = r.readInt();
    const hasProps = r.readBool();
    const props = hasProps ? readProps(r) : new Map();
    const skinCount = r.readInt();
    const skins: SkinData[] = [];
    for (let i = 0; i < skinCount; i++) {
        skins.push(readSkin(r));
    }
    return { name, type, skins, props };
}

function readMotion(r: DataReader): MotionData {
    const boneName = r.readString();
    const frames = r.readInt();
    const duration = r.readFloat();
    const hasTranslation = r.readBool();
    const hasRotation = r.readBool();
    const translationsOffset = r.readInt();
    const rotationsOffset = r.readInt();
    const hasProps = r.readBool();
    const props = hasProps ? readProps(r) : new Map();
    const timeProps = new Map<number, Map<string, string>>();
    const hasTimeProps = r.readBool();
    if (hasTimeProps) {
        const tpCount = r.readInt();
        for (let i = 0; i < tpCount; i++) {
            const timeKey = r.readInt();
            const tpProps = readProps(r);
            timeProps.set(timeKey, tpProps);
        }
    }
    return { boneName, frames, duration, hasTranslation, hasRotation,
             translationsOffset, rotationsOffset, props, timeProps };
}

function readSkill(r: DataReader): SkillData {
    const name = r.readString();
    const animationFileName = r.readString();
    const duration = r.readFloat();
    const distance = r.readFloat();
    const isMoving = r.readBool();
    const numTranslations = r.readInt();
    const numRotations = r.readInt();
    const motionCount = r.readInt();
    const motions: MotionData[] = [];
    for (let i = 0; i < motionCount; i++) {
        motions.push(readMotion(r));
    }
    return { name, animationFileName, duration, distance, isMoving,
             numTranslations, numRotations, motions,
             translations: [], rotations: [] };
}

// Parse skeleton/suit/skill sections from any DataReader.
// Text CMX and binary BCF share identical structure after the version line.
function parseAnimData(r: DataReader): CMXFile {
    const result: CMXFile = { skeletons: [], suits: [], skills: [] };

    const skeletonCount = r.readInt();
    for (let i = 0; i < skeletonCount; i++) {
        result.skeletons.push(readSkeleton(r));
    }

    const suitCount = r.readInt();
    for (let i = 0; i < suitCount; i++) {
        result.suits.push(readSuit(r));
    }

    const skillCount = r.readInt();
    for (let i = 0; i < skillCount; i++) {
        result.skills.push(readSkill(r));
    }

    return result;
}

// ============================================================
// Text format readers
// ============================================================

// Parse a CMX text file. Version line precedes the skeleton/suit/skill data.
// The version line can be just "300" or "version 300" (with prefix keyword).
export function parseCMX(text: string): CMXFile {
    const r = new TextReader(text);
    // Version line: handle both "300" and "version 300" formats
    const versionLine = r.readString();
    const version = parseInt(versionLine.replace(/^version\s+/i, ''), 10) || 0;
    const result = parseAnimData(r);

    return result;
}

// Parse a SKN text mesh file. Text-specific: multi-value lines for faces, bindings.
export function parseSKN(text: string): MeshData {
    const r = new TextReader(text);

    const name = r.readString();
    const textureName = r.readString();

    const boneCount = r.readInt();
    const boneNames: string[] = [];
    for (let i = 0; i < boneCount; i++) {
        boneNames.push(r.readString());
    }

    const faceCount = r.readInt();
    const faces: Face[] = [];
    for (let i = 0; i < faceCount; i++) {
        const parts = r.readLine().split(/\s+/);
        faces.push({
            a: parseInt(parts[0]) || 0,
            b: parseInt(parts[1]) || 0,
            c: parseInt(parts[2]) || 0,
        });
    }

    const bindingCount = r.readInt();
    const boneBindings: BoneBinding[] = [];
    for (let i = 0; i < bindingCount; i++) {
        const line = r.readLine().split(/\s+/).map(Number);
        boneBindings.push({
            boneIndex: line[0] || 0,
            firstVertex: line[1] || 0,
            vertexCount: line[2] || 0,
            firstBlendedVertex: line[3] || 0,
            blendedVertexCount: line[4] || 0,
        });
    }

    const uvCount = r.readInt();
    const uvs: Vec2[] = [];
    for (let i = 0; i < uvCount; i++) {
        uvs.push(r.readVec2());
    }

    const blendCount = r.readInt();
    const blendBindings: BlendBinding[] = [];
    for (let i = 0; i < blendCount; i++) {
        const line = r.readLine().split(/\s+/).map(Number);
        blendBindings.push({
            otherVertexIndex: line[0] || 0,
            weight: (line[1] || 0) / FIXED_ONE,
        });
    }

    const vertexCount = r.readInt();
    const vertices: Vec3[] = [];
    const normals: Vec3[] = [];
    for (let i = 0; i < vertexCount; i++) {
        const parts = r.readLine().split(/\s+/).map(parseFloat);
        vertices.push(vec3(parts[0] || 0, parts[1] || 0, parts[2] || 0));
        normals.push(vec3(parts[3] || 0, parts[4] || 0, parts[5] || 0));
    }

    return { name, textureName, boneNames, faces, boneBindings,
             uvs, blendBindings, vertices, normals };
}

// ============================================================
// Binary format readers
// ============================================================

// Parse a BCF (Binary Compiled Format) file.
// Same structure as text CMX but no version line, binary CTGFile primitives.
export function parseBCF(buffer: ArrayBuffer): CMXFile {
    const r = new BinaryReader(buffer);
    const result = parseAnimData(r);

    return result;
}

// Parse a BMF (Binary Mesh Format) file. Binary version of SKN.
//
// Layout: fileName, textureName, boneCount, bones[],
// faceCount, faces[], bindingCount, boneBindings[],
// uvCount, textureVertices[], blendCount, blendData[],
// vertexCount, vertices[] (each vertex is position + normal = 6 floats).
export function parseBMF(buffer: ArrayBuffer): MeshData {
    const r = new BinaryReader(buffer);

    const name = r.readString();
    const textureName = r.readString();

    const boneCount = r.readInt32();
    const boneNames: string[] = [];
    for (let i = 0; i < boneCount; i++) {
        boneNames.push(r.readString());
    }

    const faceCount = r.readInt32();
    const faces: Face[] = [];
    for (let i = 0; i < faceCount; i++) {
        faces.push({ a: r.readInt32(), b: r.readInt32(), c: r.readInt32() });
    }

    const bindingCount = r.readInt32();
    const boneBindings: BoneBinding[] = [];
    for (let i = 0; i < bindingCount; i++) {
        boneBindings.push({
            boneIndex: r.readInt32(),
            firstVertex: r.readInt32(),
            vertexCount: r.readInt32(),
            firstBlendedVertex: r.readInt32(),
            blendedVertexCount: r.readInt32(),
        });
    }

    const uvCount = r.readInt32();
    const uvs: Vec2[] = [];
    for (let i = 0; i < uvCount; i++) {
        uvs.push(r.readVec2());
    }

    const blendCount = r.readInt32();
    const blendBindings: BlendBinding[] = [];
    for (let i = 0; i < blendCount; i++) {
        // BlendData: weight is fixed-point int32 (0x8000 = 1.0), otherVert is index
        const weight = r.readInt32() / FIXED_ONE;
        const otherVertexIndex = r.readInt32();
        blendBindings.push({ otherVertexIndex, weight });
    }

    const vertexCount = r.readInt32();
    const vertices: Vec3[] = [];
    const normals: Vec3[] = [];
    for (let i = 0; i < vertexCount; i++) {
        // NormalVertex: 3 floats position + 3 floats normal = 24 bytes
        vertices.push(vec3(r.readFloat32(), r.readFloat32(), r.readFloat32()));
        normals.push(vec3(r.readFloat32(), r.readFloat32(), r.readFloat32()));
    }

    return { name, textureName, boneNames, faces, boneBindings,
             uvs, blendBindings, vertices, normals };
}

// Parse a CFP (Compressed Float Points) file — delta-compressed animation keyframes.
// Fills skill.translations[] and skill.rotations[] from the binary stream.
//
// Coordinate conversion: Z negated for translations, W negated for quaternions.
// The Sims used DirectX left-handed coordinates; we use right-handed (CCW) for GPU.
export function parseCFP(buffer: ArrayBuffer, skill: SkillData): void {
    const r = new BinaryReader(buffer);

    if (skill.numTranslations > 0) {
        const floats = decompressFloats(r, skill.numTranslations, 3);
        skill.translations = [];
        for (let i = 0; i < skill.numTranslations; i++) {
            skill.translations.push(vec3(
                floats[i * 3],
                floats[i * 3 + 1],
                -floats[i * 3 + 2],
            ));
        }
    }

    if (skill.numRotations > 0) {
        const floats = decompressFloats(r, skill.numRotations, 4);
        skill.rotations = [];
        for (let i = 0; i < skill.numRotations; i++) {
            skill.rotations.push(quat(
                floats[i * 4],
                floats[i * 4 + 1],
                floats[i * 4 + 2],
                -floats[i * 4 + 3],
            ));
        }
    }
}

// ============================================================
// Binary format writers
// ============================================================

function writeProps(w: BinaryWriter, props: Map<string, string>): void {
    w.writeInt32(props.size);
    for (const [key, value] of props) {
        w.writeString(key);
        w.writeString(value);
    }
}

function writeTimeProps(w: BinaryWriter, timeProps: Map<number, Map<string, string>>): void {
    w.writeInt32(timeProps.size);
    for (const [time, props] of timeProps) {
        w.writeInt32(time);
        writeProps(w, props);
    }
}

function writeBone(w: BinaryWriter, bone: BoneData): void {
    w.writeString(bone.name);
    w.writeString(bone.parentName);
    const hasProps = bone.props.size > 0;
    w.writeBool(hasProps);
    if (hasProps) writeProps(w, bone.props);
    w.writeVec3(bone.position);
    w.writeQuat(bone.rotation);
    w.writeBool(bone.canTranslate);
    w.writeBool(bone.canRotate);
    w.writeBool(bone.canBlend);
    w.writeBool(bone.canWiggle);
    w.writeFloat32(bone.wigglePower);
}

function writeSkeleton(w: BinaryWriter, skel: SkeletonData): void {
    w.writeString(skel.name);
    w.writeInt32(skel.bones.length);
    for (const bone of skel.bones) writeBone(w, bone);
}

function writeSkin(w: BinaryWriter, skin: SkinData): void {
    w.writeString(skin.name);
    w.writeString(skin.boneName);
    w.writeInt32(skin.flags);
    w.writeString(skin.meshName);
    const hasProps = skin.props.size > 0;
    w.writeBool(hasProps);
    if (hasProps) writeProps(w, skin.props);
}

function writeSuit(w: BinaryWriter, suit: SuitData): void {
    w.writeString(suit.name);
    w.writeInt32(suit.type);
    const hasProps = suit.props.size > 0;
    w.writeBool(hasProps);
    if (hasProps) writeProps(w, suit.props);
    w.writeInt32(suit.skins.length);
    for (const skin of suit.skins) writeSkin(w, skin);
}

function writeMotion(w: BinaryWriter, motion: MotionData): void {
    w.writeString(motion.boneName);
    w.writeInt32(motion.frames);
    w.writeFloat32(motion.duration);
    w.writeBool(motion.hasTranslation);
    w.writeBool(motion.hasRotation);
    w.writeInt32(motion.translationsOffset);
    w.writeInt32(motion.rotationsOffset);
    const hasProps = motion.props.size > 0;
    w.writeBool(hasProps);
    if (hasProps) writeProps(w, motion.props);
    const hasTimeProps = motion.timeProps.size > 0;
    w.writeBool(hasTimeProps);
    if (hasTimeProps) writeTimeProps(w, motion.timeProps);
}

function writeSkill(w: BinaryWriter, skill: SkillData): void {
    w.writeString(skill.name);
    w.writeString(skill.animationFileName);
    w.writeFloat32(skill.duration);
    w.writeFloat32(skill.distance);
    w.writeBool(skill.isMoving);
    w.writeInt32(skill.numTranslations);
    w.writeInt32(skill.numRotations);
    w.writeInt32(skill.motions.length);
    for (const motion of skill.motions) writeMotion(w, motion);
}

// Write a BCF (Binary Compiled Format) file from CMX data.
// Produces the same format the game loads at runtime.
export function writeBCF(cmx: CMXFile): ArrayBuffer {
    const w = new BinaryWriter();

    w.writeInt32(cmx.skeletons.length);
    for (const skel of cmx.skeletons) writeSkeleton(w, skel);

    w.writeInt32(cmx.suits.length);
    for (const suit of cmx.suits) writeSuit(w, suit);

    w.writeInt32(cmx.skills.length);
    for (const skill of cmx.skills) writeSkill(w, skill);

    return w.toArrayBuffer();
}

// Write a BMF (Binary Mesh Format) file from mesh data.
// Field order matches DeformableMesh::WriteToFile from the original C++ source.
export function writeBMF(mesh: MeshData): ArrayBuffer {
    const w = new BinaryWriter();

    w.writeString(mesh.name);
    w.writeString(mesh.textureName);

    w.writeInt32(mesh.boneNames.length);
    for (const name of mesh.boneNames) w.writeString(name);

    w.writeInt32(mesh.faces.length);
    for (const face of mesh.faces) {
        w.writeInt32(face.a);
        w.writeInt32(face.b);
        w.writeInt32(face.c);
    }

    w.writeInt32(mesh.boneBindings.length);
    for (const binding of mesh.boneBindings) {
        w.writeInt32(binding.boneIndex);
        w.writeInt32(binding.firstVertex);
        w.writeInt32(binding.vertexCount);
        w.writeInt32(binding.firstBlendedVertex);
        w.writeInt32(binding.blendedVertexCount);
    }

    w.writeInt32(mesh.uvs.length);
    for (const uv of mesh.uvs) w.writeVec2(uv);

    w.writeInt32(mesh.blendBindings.length);
    for (const blend of mesh.blendBindings) {
        // Convert float weight back to fixed-point: 0x8000 = 1.0
        w.writeInt32(Math.round(blend.weight * FIXED_ONE));
        w.writeInt32(blend.otherVertexIndex);
    }

    w.writeInt32(mesh.vertices.length);
    for (let i = 0; i < mesh.vertices.length; i++) {
        const v = mesh.vertices[i];
        const n = mesh.normals[i];
        w.writeFloat32(v.x); w.writeFloat32(v.y); w.writeFloat32(v.z);
        w.writeFloat32(n.x); w.writeFloat32(n.y); w.writeFloat32(n.z);
    }

    return w.toArrayBuffer();
}

// ============================================================
// Text format writers
// ============================================================

// Format a Vec3 as pipe-delimited text: "| x y z |"
function fmtVec3(v: Vec3): string {
    return `| ${v.x} ${v.y} ${v.z} |`;
}

// Format a Quat as pipe-delimited text: "| x y z w |"
function fmtQuat(q: Quat): string {
    return `| ${q.x} ${q.y} ${q.z} ${q.w} |`;
}

// Format a Vec2 as space-separated text: "u v"
function fmtVec2(v: Vec2): string {
    return `${v.x} ${v.y}`;
}

// Write a text Props block
function fmtProps(props: Map<string, string>, lines: string[]): void {
    lines.push(String(props.size));
    for (const [key, value] of props) {
        lines.push(key);
        lines.push(value);
    }
}

// Write a CMX text file from CMX data.
// Produces the same format the original Maxis tools wrote:
// "// Character File. Copyright 1997, Maxis Inc."
// "version 300"
// Then skeletons, suits, skills with pipe-delimited vectors.
export function writeCMX(cmx: CMXFile): string {
    const L: string[] = [];

    L.push('// Character File. VitaMoo.');
    L.push('version 300');

    // Skeletons
    L.push(String(cmx.skeletons.length));
    for (const skel of cmx.skeletons) {
        L.push(skel.name);
        L.push(String(skel.bones.length));
        for (const bone of skel.bones) {
            L.push(bone.name);
            L.push(bone.parentName || 'NULL');
            const hasProps = bone.props.size > 0;
            L.push(hasProps ? '1' : '0');
            if (hasProps) fmtProps(bone.props, L);
            L.push(fmtVec3(bone.position));
            L.push(fmtQuat(bone.rotation));
            L.push(bone.canTranslate ? '1' : '0');
            L.push(bone.canRotate ? '1' : '0');
            L.push(bone.canBlend ? '1' : '0');
            L.push(bone.canWiggle ? '1' : '0');
            L.push(String(bone.wigglePower));
        }
    }

    // Suits
    L.push(String(cmx.suits.length));
    for (const suit of cmx.suits) {
        L.push(suit.name);
        L.push(String(suit.type));
        const hasProps = suit.props.size > 0;
        L.push(hasProps ? '1' : '0');
        if (hasProps) fmtProps(suit.props, L);
        L.push(String(suit.skins.length));
        for (const skin of suit.skins) {
            L.push(skin.name);
            L.push(skin.boneName);
            L.push(String(skin.flags));
            L.push(skin.meshName);
            const skinHasProps = skin.props.size > 0;
            L.push(skinHasProps ? '1' : '0');
            if (skinHasProps) fmtProps(skin.props, L);
        }
    }

    // Skills
    L.push(String(cmx.skills.length));
    for (const skill of cmx.skills) {
        L.push(skill.name);
        L.push(skill.animationFileName);
        L.push(String(skill.duration));
        L.push(String(skill.distance));
        L.push(skill.isMoving ? '1' : '0');
        L.push(String(skill.numTranslations));
        L.push(String(skill.numRotations));
        L.push(String(skill.motions.length));
        for (const motion of skill.motions) {
            L.push(motion.boneName);
            L.push(String(motion.frames));
            L.push(String(motion.duration));
            L.push(motion.hasTranslation ? '1' : '0');
            L.push(motion.hasRotation ? '1' : '0');
            L.push(String(motion.translationsOffset));
            L.push(String(motion.rotationsOffset));
            const hasProps = motion.props.size > 0;
            L.push(hasProps ? '1' : '0');
            if (hasProps) fmtProps(motion.props, L);
            const hasTimeProps = motion.timeProps.size > 0;
            L.push(hasTimeProps ? '1' : '0');
            if (hasTimeProps) {
                L.push(String(motion.timeProps.size));
                for (const [time, props] of motion.timeProps) {
                    L.push(String(time));
                    fmtProps(props, L);
                }
            }
        }
    }

    return L.join('\n') + '\n';
}

// Write a SKN text mesh file from mesh data.
// Multi-value lines for faces, bindings, blend weights, vertices+normals.
export function writeSKN(mesh: MeshData): string {
    const L: string[] = [];

    L.push(mesh.name);
    L.push(mesh.textureName);

    L.push(String(mesh.boneNames.length));
    for (const name of mesh.boneNames) L.push(name);

    L.push(String(mesh.faces.length));
    for (const face of mesh.faces) {
        L.push(`${face.a} ${face.b} ${face.c}`);
    }

    L.push(String(mesh.boneBindings.length));
    for (const b of mesh.boneBindings) {
        L.push(`${b.boneIndex} ${b.firstVertex} ${b.vertexCount} ${b.firstBlendedVertex} ${b.blendedVertexCount}`);
    }

    L.push(String(mesh.uvs.length));
    for (const uv of mesh.uvs) {
        L.push(fmtVec2(uv));
    }

    L.push(String(mesh.blendBindings.length));
    for (const blend of mesh.blendBindings) {
        L.push(`${blend.otherVertexIndex} ${Math.round(blend.weight * FIXED_ONE)}`);
    }

    L.push(String(mesh.vertices.length));
    for (let i = 0; i < mesh.vertices.length; i++) {
        const v = mesh.vertices[i];
        const n = mesh.normals[i] ?? vec3(0, 1, 0);
        L.push(`${v.x} ${v.y} ${v.z} ${n.x} ${n.y} ${n.z}`);
    }

    return L.join('\n') + '\n';
}

// Generate a human-readable text report of character data.
// Modeled after the original CMXExporter report format, complete with
// Walt Whitman poetry from "I Sing the Body Electric."
//
// "O my Body! I dare not desert the likes of you in other men and women,
// nor the likes of the parts of you."
export function writeReport(cmx: CMXFile, meshes: MeshData[] = []): string {
    const L: string[] = [];

    L.push('Character File Report. VitaMoo.');
    L.push(`version 300`);
    L.push(`VitaMoo export ${new Date().toISOString()}`);
    L.push('');
    L.push('O my Body!');
    L.push('I dare not desert the likes of you in other men and women,');
    L.push('nor the likes of the parts of you.');
    L.push('');

    // Skeletons
    L.push(`skeleton count ${cmx.skeletons.length}`);
    if (cmx.skeletons.length > 0) {
        L.push('    ' + cmx.skeletons.map(s => s.name).join(' '));
        for (const skel of cmx.skeletons) {
            L.push('');
            L.push(`  skeleton "${skel.name}" bones ${skel.bones.length}`);
            for (const bone of skel.bones) {
                const parent = bone.parentName || '(root)';
                L.push(`    bone "${bone.name}" parent "${parent}" pos ${fmtVec3(bone.position)} rot ${fmtQuat(bone.rotation)}`);
                const flags = [
                    bone.canTranslate ? 'translate' : '',
                    bone.canRotate ? 'rotate' : '',
                    bone.canBlend ? 'blend' : '',
                    bone.canWiggle ? `wiggle(${bone.wigglePower})` : '',
                ].filter(Boolean).join(' ');
                if (flags) L.push(`      flags: ${flags}`);
            }
        }
    }
    L.push('');

    // Suits
    L.push(`suit count ${cmx.suits.length}`);
    if (cmx.suits.length > 0) {
        L.push('    ' + cmx.suits.map(s => s.name).join(' '));
        for (const suit of cmx.suits) {
            L.push('');
            L.push(`  suit "${suit.name}" type ${suit.type} skins ${suit.skins.length}`);
            for (const skin of suit.skins) {
                L.push(`    skin "${skin.name}" bone "${skin.boneName}" mesh "${skin.meshName}" flags ${skin.flags}`);
            }
        }
    }
    L.push('');

    // Skills
    L.push(`skill count ${cmx.skills.length}`);
    if (cmx.skills.length > 0) {
        L.push('    ' + cmx.skills.map(s => s.name).join(' '));
        for (const skill of cmx.skills) {
            L.push('');
            L.push(`  skill "${skill.name}" duration ${skill.duration}ms distance ${skill.distance}ft${skill.isMoving ? ' MOVING' : ''}`);
            L.push(`    translations ${skill.numTranslations} rotations ${skill.numRotations} motions ${skill.motions.length}`);
            for (const motion of skill.motions) {
                const tracks = [
                    motion.hasTranslation ? `trans@${motion.translationsOffset}` : '',
                    motion.hasRotation ? `rot@${motion.rotationsOffset}` : '',
                ].filter(Boolean).join(' ');
                L.push(`    motion "${motion.boneName}" frames ${motion.frames} duration ${motion.duration}ms ${tracks}`);
            }
        }
    }
    L.push('');

    // Meshes
    if (meshes.length > 0) {
        L.push(`mesh count ${meshes.length}`);
        for (const mesh of meshes) {
            L.push('');
            L.push(`  mesh "${mesh.name}" texture "${mesh.textureName}"`);
            L.push(`    vertices ${mesh.vertices.length} faces ${mesh.faces.length} uvs ${mesh.uvs.length}`);
            L.push(`    bones ${mesh.boneNames.length}: ${mesh.boneNames.join(', ')}`);
            L.push(`    bindings ${mesh.boneBindings.length} blends ${mesh.blendBindings.length}`);
            for (const b of mesh.boneBindings) {
                const boneName = mesh.boneNames[b.boneIndex] || `?${b.boneIndex}`;
                L.push(`      binding "${boneName}" verts ${b.firstVertex}..${b.firstVertex + b.vertexCount - 1} (${b.vertexCount}) blended ${b.firstBlendedVertex}..${b.firstBlendedVertex + b.blendedVertexCount - 1} (${b.blendedVertexCount})`);
            }
        }
        L.push('');
    }

    L.push('O I say, these are not the parts and poems of the Body only, but of the Soul,');
    L.push('O I say now these are the Soul!');
    L.push('');
    L.push("- From 'I Sing the Body Electric', by Walt Whitman.");
    L.push('');

    return L.join('\n');
}

// ============================================================
// Binary format writers
// ============================================================

// Write a CFP (Compressed Float Points) file from skill animation data.
// Reverses the coordinate conversion done in parseCFP:
// Z is negated back for translations, W negated back for quaternions.
export function writeCFP(skill: SkillData): ArrayBuffer {
    const w = new BinaryWriter();

    if (skill.numTranslations > 0 && skill.translations.length > 0) {
        const buf = new Float32Array(skill.translations.length * 3);
        for (let i = 0; i < skill.translations.length; i++) {
            const t = skill.translations[i];
            buf[i * 3] = t.x;
            buf[i * 3 + 1] = t.y;
            buf[i * 3 + 2] = -t.z; // reverse Z negation for DirectX coords
        }
        w.writeBytes(compressFloats(buf, skill.translations.length, 3));
    }

    if (skill.numRotations > 0 && skill.rotations.length > 0) {
        const buf = new Float32Array(skill.rotations.length * 4);
        for (let i = 0; i < skill.rotations.length; i++) {
            const q = skill.rotations[i];
            buf[i * 4] = q.x;
            buf[i * 4 + 1] = q.y;
            buf[i * 4 + 2] = q.z;
            buf[i * 4 + 3] = -q.w; // reverse W negation for DirectX handedness
        }
        w.writeBytes(compressFloats(buf, skill.rotations.length, 4));
    }

    return w.toArrayBuffer();
}
