/**
 * Playing-scene **exchange** document: top-level arrays, `id` references, optional YAML twin.
 * Pure 3D (e.g. glTF) lives in separate files; list them under `gltfAttachments`.
 */

export interface PlayingSceneMetadata {
    title?: string;
    description?: string;
    author?: string;
    thumbnailRef?: string;
}

export interface GltfAttachmentRef {
    id: string;
    /** Relative to exchange file or absolute URL; pure geometry/skins, no Sims save payload. */
    url: string;
    /** Optional mesh selector when one file contains many mesh entries. */
    meshName?: string;
    notes?: string;
}

export interface CharacterTemplate {
    id: string;
    name: string;
    skeleton?: string;
    body?: string;
    head?: string;
    leftHand?: string;
    rightHand?: string;
    bodyTexture?: string;
    headTexture?: string;
    handTexture?: string;
    /** Default skill / animation id when cast omits `skill`. */
    animation?: string;
    voice?: { pitch?: number; range?: number; formant?: number; breathiness?: number };
}

export interface PersonPlacement {
    id: string;
    characterTemplateId: string;
    actorLabel?: string;
    position?: { x?: number; y?: number; z?: number };
    direction?: number;
    /** Skill / CMX animation id; falls back to template `animation`. */
    skill?: string;
}

export interface PlayingSceneDefinition {
    id: string;
    name: string;
    cast: PersonPlacement[];
    /** `playerLocal` fields (camera, UI) — no Sims 1 disk equivalent. */
    playerLocal?: Record<string, unknown>;
}

export interface PlayingSceneExchange {
    schemaVersion: number;
    metadata?: PlayingSceneMetadata;
    /**
     * Optional bundle of skeletons/suits/meshes lists. Loaded relative to this JSON file’s directory.
     */
    assetIndexRef?: string;
    /** Pointers to pure 3D interchange; exchange data references these by `id` where needed. */
    gltfAttachments?: GltfAttachmentRef[];
    characterTemplates: CharacterTemplate[];
    playingScenes: PlayingSceneDefinition[];
    environment?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
    return value === undefined || typeof value === 'string';
}

function isOptionalFiniteNumber(value: unknown): value is number | undefined {
    return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`[playing-scene] ${label} must be a non-empty string`);
    }
}

/**
 * Strict runtime validation for the playing-scene exchange format.
 * Use this for load-time safety when accepting untrusted JSON input.
 */
export function assertPlayingSceneExchange(
    raw: unknown,
    sourceLabel = 'playing-scene exchange',
): asserts raw is PlayingSceneExchange {
    if (!isRecord(raw)) {
        throw new Error(`[playing-scene] ${sourceLabel} must be an object`);
    }
    const schemaVersion = raw.schemaVersion;
    if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
        throw new Error(`[playing-scene] ${sourceLabel}.schemaVersion must be a positive integer`);
    }

    if (raw.metadata !== undefined) {
        if (!isRecord(raw.metadata)) {
            throw new Error(`[playing-scene] ${sourceLabel}.metadata must be an object`);
        }
        const metadata = raw.metadata;
        if (!isOptionalString(metadata.title)) throw new Error(`[playing-scene] metadata.title must be a string`);
        if (!isOptionalString(metadata.description)) throw new Error(`[playing-scene] metadata.description must be a string`);
        if (!isOptionalString(metadata.author)) throw new Error(`[playing-scene] metadata.author must be a string`);
        if (!isOptionalString(metadata.thumbnailRef)) throw new Error(`[playing-scene] metadata.thumbnailRef must be a string`);
    }

    if (raw.assetIndexRef !== undefined) {
        assertNonEmptyString(raw.assetIndexRef, `${sourceLabel}.assetIndexRef`);
    }

    if (raw.gltfAttachments !== undefined) {
        if (!Array.isArray(raw.gltfAttachments)) {
            throw new Error(`[playing-scene] ${sourceLabel}.gltfAttachments must be an array`);
        }
        for (let i = 0; i < raw.gltfAttachments.length; i++) {
            const attachment = raw.gltfAttachments[i];
            if (!isRecord(attachment)) {
                throw new Error(`[playing-scene] gltfAttachments[${i}] must be an object`);
            }
            assertNonEmptyString(attachment.id, `gltfAttachments[${i}].id`);
            assertNonEmptyString(attachment.url, `gltfAttachments[${i}].url`);
            if (!isOptionalString(attachment.meshName)) {
                throw new Error(`[playing-scene] gltfAttachments[${i}].meshName must be a string`);
            }
            if (!isOptionalString(attachment.notes)) {
                throw new Error(`[playing-scene] gltfAttachments[${i}].notes must be a string`);
            }
        }
    }

    if (!Array.isArray(raw.characterTemplates)) {
        throw new Error(`[playing-scene] ${sourceLabel}.characterTemplates must be an array`);
    }
    for (let i = 0; i < raw.characterTemplates.length; i++) {
        const template = raw.characterTemplates[i];
        if (!isRecord(template)) {
            throw new Error(`[playing-scene] characterTemplates[${i}] must be an object`);
        }
        assertNonEmptyString(template.id, `characterTemplates[${i}].id`);
        assertNonEmptyString(template.name, `characterTemplates[${i}].name`);
        if (!isOptionalString(template.skeleton)) throw new Error(`[playing-scene] characterTemplates[${i}].skeleton must be a string`);
        if (!isOptionalString(template.body)) throw new Error(`[playing-scene] characterTemplates[${i}].body must be a string`);
        if (!isOptionalString(template.head)) throw new Error(`[playing-scene] characterTemplates[${i}].head must be a string`);
        if (!isOptionalString(template.leftHand)) throw new Error(`[playing-scene] characterTemplates[${i}].leftHand must be a string`);
        if (!isOptionalString(template.rightHand)) throw new Error(`[playing-scene] characterTemplates[${i}].rightHand must be a string`);
        if (!isOptionalString(template.bodyTexture)) throw new Error(`[playing-scene] characterTemplates[${i}].bodyTexture must be a string`);
        if (!isOptionalString(template.headTexture)) throw new Error(`[playing-scene] characterTemplates[${i}].headTexture must be a string`);
        if (!isOptionalString(template.handTexture)) throw new Error(`[playing-scene] characterTemplates[${i}].handTexture must be a string`);
        if (!isOptionalString(template.animation)) throw new Error(`[playing-scene] characterTemplates[${i}].animation must be a string`);
        if (template.voice !== undefined) {
            if (!isRecord(template.voice)) {
                throw new Error(`[playing-scene] characterTemplates[${i}].voice must be an object`);
            }
            if (!isOptionalFiniteNumber(template.voice.pitch)) throw new Error(`[playing-scene] characterTemplates[${i}].voice.pitch must be a number`);
            if (!isOptionalFiniteNumber(template.voice.range)) throw new Error(`[playing-scene] characterTemplates[${i}].voice.range must be a number`);
            if (!isOptionalFiniteNumber(template.voice.formant)) throw new Error(`[playing-scene] characterTemplates[${i}].voice.formant must be a number`);
            if (!isOptionalFiniteNumber(template.voice.breathiness)) throw new Error(`[playing-scene] characterTemplates[${i}].voice.breathiness must be a number`);
        }
    }

    if (!Array.isArray(raw.playingScenes)) {
        throw new Error(`[playing-scene] ${sourceLabel}.playingScenes must be an array`);
    }
    for (let si = 0; si < raw.playingScenes.length; si++) {
        const scene = raw.playingScenes[si];
        if (!isRecord(scene)) {
            throw new Error(`[playing-scene] playingScenes[${si}] must be an object`);
        }
        assertNonEmptyString(scene.id, `playingScenes[${si}].id`);
        assertNonEmptyString(scene.name, `playingScenes[${si}].name`);
        if (!Array.isArray(scene.cast)) {
            throw new Error(`[playing-scene] playingScenes[${si}].cast must be an array`);
        }
        for (let ci = 0; ci < scene.cast.length; ci++) {
            const cast = scene.cast[ci];
            if (!isRecord(cast)) {
                throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}] must be an object`);
            }
            assertNonEmptyString(cast.id, `playingScenes[${si}].cast[${ci}].id`);
            assertNonEmptyString(
                cast.characterTemplateId,
                `playingScenes[${si}].cast[${ci}].characterTemplateId`,
            );
            if (!isOptionalString(cast.actorLabel)) {
                throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].actorLabel must be a string`);
            }
            if (!isOptionalString(cast.skill)) {
                throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].skill must be a string`);
            }
            if (!isOptionalFiniteNumber(cast.direction)) {
                throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].direction must be a number`);
            }
            if (cast.position !== undefined) {
                if (!isRecord(cast.position)) {
                    throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].position must be an object`);
                }
                if (!isOptionalFiniteNumber(cast.position.x)) {
                    throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].position.x must be a number`);
                }
                if (!isOptionalFiniteNumber(cast.position.y)) {
                    throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].position.y must be a number`);
                }
                if (!isOptionalFiniteNumber(cast.position.z)) {
                    throw new Error(`[playing-scene] playingScenes[${si}].cast[${ci}].position.z must be a number`);
                }
            }
        }
    }

    if (raw.environment !== undefined && !isRecord(raw.environment)) {
        throw new Error(`[playing-scene] ${sourceLabel}.environment must be an object`);
    }
}

export function isPlayingSceneExchange(raw: unknown): raw is PlayingSceneExchange {
    try {
        assertPlayingSceneExchange(raw);
        return true;
    } catch {
        return false;
    }
}
