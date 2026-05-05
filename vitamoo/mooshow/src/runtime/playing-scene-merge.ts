import type { CharacterTemplate, GltfAttachmentRef, PlayingSceneExchange } from 'vitamoo';
import type { CharacterDef, CastMemberDef, SceneDef, ContentIndex } from './content-loader.js';

function templateToCharacterDef(t: CharacterTemplate): CharacterDef {
    return {
        id: t.id,
        name: t.name,
        skeleton: t.skeleton,
        body: t.body,
        head: t.head,
        leftHand: t.leftHand,
        rightHand: t.rightHand,
        bodyTexture: t.bodyTexture,
        headTexture: t.headTexture,
        handTexture: t.handTexture,
        animation: t.animation,
        voice: t.voice,
    };
}

function assertStringArrayField(
    payload: Record<string, unknown>,
    field: keyof PlayingSceneAssetLists,
    sourceLabel: string,
): string[] | undefined {
    const raw = payload[field];
    if (raw === undefined) return undefined;
    if (!Array.isArray(raw)) {
        throw new Error(`[playing-scene] ${sourceLabel}.${field} must be an array of strings`);
    }
    for (let i = 0; i < raw.length; i++) {
        const value = raw[i];
        if (typeof value !== 'string' || !value.trim()) {
            throw new Error(`[playing-scene] ${sourceLabel}.${field}[${i}] must be a non-empty string`);
        }
    }
    return raw.slice();
}

function assertDefaultsField(
    payload: Record<string, unknown>,
    sourceLabel: string,
): Record<string, string> | undefined {
    const raw = payload.defaults;
    if (raw === undefined) return undefined;
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`[playing-scene] ${sourceLabel}.defaults must be an object of strings`);
    }
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
        if (typeof value !== 'string') {
            throw new Error(`[playing-scene] ${sourceLabel}.defaults["${key}"] must be a string`);
        }
        out[key] = value;
    }
    return out;
}

function assertGltfAttachmentsField(
    payload: Record<string, unknown>,
    sourceLabel: string,
): GltfAttachmentRef[] | undefined {
    const raw = payload.gltfAttachments;
    if (raw === undefined) return undefined;
    if (!Array.isArray(raw)) {
        throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments must be an array`);
    }
    for (let i = 0; i < raw.length; i++) {
        const row = raw[i];
        if (row === null || typeof row !== 'object' || Array.isArray(row)) {
            throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments[${i}] must be an object`);
        }
        const attachment = row as Record<string, unknown>;
        if (typeof attachment.id !== 'string' || !attachment.id.trim()) {
            throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments[${i}].id must be a non-empty string`);
        }
        if (typeof attachment.url !== 'string' || !attachment.url.trim()) {
            throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments[${i}].url must be a non-empty string`);
        }
        if (attachment.meshName !== undefined && typeof attachment.meshName !== 'string') {
            throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments[${i}].meshName must be a string`);
        }
        if (attachment.notes !== undefined && typeof attachment.notes !== 'string') {
            throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments[${i}].notes must be a string`);
        }
    }
    return raw as GltfAttachmentRef[];
}

export interface PlayingSceneAssetLists {
    skeletons?: string[];
    suits?: string[];
    animations?: string[];
    meshes?: string[];
    textures_bmp?: string[];
    textures_png?: string[];
    cfp_files?: string[];
    defaults?: Record<string, string>;
    gltfAttachments?: GltfAttachmentRef[];
}

export function parseContentIndexAssetLists(
    raw: unknown,
    sourceLabel: string,
): PlayingSceneAssetLists {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`[playing-scene] ${sourceLabel} asset index must be an object`);
    }
    const payload = raw as Record<string, unknown>;
    return {
        skeletons: assertStringArrayField(payload, 'skeletons', sourceLabel),
        suits: assertStringArrayField(payload, 'suits', sourceLabel),
        animations: assertStringArrayField(payload, 'animations', sourceLabel),
        meshes: assertStringArrayField(payload, 'meshes', sourceLabel),
        textures_bmp: assertStringArrayField(payload, 'textures_bmp', sourceLabel),
        textures_png: assertStringArrayField(payload, 'textures_png', sourceLabel),
        cfp_files: assertStringArrayField(payload, 'cfp_files', sourceLabel),
        defaults: assertDefaultsField(payload, sourceLabel),
        gltfAttachments: assertGltfAttachmentsField(payload, sourceLabel),
    };
}

/**
 * Merged fetch payload: asset lists from `content-assets.json` plus exchange keys
 * (`characterTemplates`, `playingScenes`, …).
 */
export function playingSceneExchangeToContentIndex(
    merged: PlayingSceneExchange & PlayingSceneAssetLists,
): ContentIndex {
    const templates = merged.characterTemplates;
    const templateIds = new Set<string>();
    for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        if (typeof t.id !== 'string' || !t.id.trim()) {
            throw new Error(`[playing-scene] characterTemplates[${i}] needs a non-empty string id`);
        }
        if (templateIds.has(t.id)) {
            throw new Error(`[playing-scene] Duplicate character template id "${t.id}"`);
        }
        templateIds.add(t.id);
        if (typeof t.name !== 'string' || !t.name.trim()) {
            throw new Error(`[playing-scene] characterTemplates[${i}] (${t.id}) needs a non-empty name`);
        }
    }
    const templatesById = new Map(templates.map((t) => [t.id, t]));
    const characters: CharacterDef[] = templates.map(templateToCharacterDef);

    const sceneIds = new Set<string>();
    const scenes: SceneDef[] = merged.playingScenes.map((ps, psi) => {
        if (typeof ps.id !== 'string' || !ps.id.trim()) {
            throw new Error(`[playing-scene] playingScenes[${psi}] needs a non-empty string id`);
        }
        if (sceneIds.has(ps.id)) {
            throw new Error(`[playing-scene] Duplicate playing scene id "${ps.id}"`);
        }
        sceneIds.add(ps.id);
        if (typeof ps.name !== 'string' || !ps.name.trim()) {
            throw new Error(`[playing-scene] playingScenes[${psi}] (${ps.id}) needs a non-empty name`);
        }
        if (!Array.isArray(ps.cast)) {
            throw new Error(`[playing-scene] playingScenes[${psi}] "${ps.id}" cast must be an array`);
        }
        const cast: CastMemberDef[] = [];
        const personPlacementIds = new Set<string>();
        for (let ci = 0; ci < ps.cast.length; ci++) {
            const row = ps.cast[ci];
            if (row === null || typeof row !== 'object') {
                throw new Error(`[playing-scene] scene "${ps.id}" cast[${ci}] must be an object`);
            }
            if (typeof row.id !== 'string' || !row.id.trim()) {
                throw new Error(
                    `[playing-scene] scene "${ps.id}" cast[${ci}] needs a non-empty person placement id`,
                );
            }
            if (personPlacementIds.has(row.id)) {
                throw new Error(
                    `[playing-scene] scene "${ps.id}" has duplicate person placement id "${row.id}"`,
                );
            }
            personPlacementIds.add(row.id);
            if (typeof row.characterTemplateId !== 'string' || !row.characterTemplateId.trim()) {
                throw new Error(
                    `[playing-scene] scene "${ps.id}" cast row "${row.id}" needs characterTemplateId`,
                );
            }
            const tmpl = templatesById.get(row.characterTemplateId);
            if (!tmpl) {
                throw new Error(
                    `[playing-scene] Unknown characterTemplateId "${row.characterTemplateId}" in scene "${ps.id}"`,
                );
            }
            cast.push({
                actor: row.actorLabel,
                x: row.position?.x,
                z: row.position?.z,
                direction: row.direction,
                animation: row.skill ?? tmpl.animation,
                personPlacementId: row.id,
                characterTemplateId: row.characterTemplateId,
            });
        }
        return { id: ps.id, name: ps.name, cast };
    });

    return {
        skeletons: merged.skeletons,
        suits: merged.suits,
        animations: merged.animations,
        meshes: merged.meshes,
        textures_bmp: merged.textures_bmp,
        textures_png: merged.textures_png,
        cfp_files: merged.cfp_files,
        defaults: merged.defaults,
        gltfAttachments: merged.gltfAttachments,
        characters,
        scenes,
    };
}

export function resolveSiblingAssetUrl(indexRequestUrl: string, ref: string): string {
    try {
        return new URL(ref, indexRequestUrl).href;
    } catch {
        const r = ref.replace(/^\//, '');
        const slash = indexRequestUrl.lastIndexOf('/');
        if (slash < 0) return r;
        return indexRequestUrl.slice(0, slash + 1) + r;
    }
}
