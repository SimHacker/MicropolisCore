/// <reference types="@webgpu/types" />
import { parseCMX, parseSKN, parseCFP, Practice, buildSkeleton, updateTransforms, loadGltfMeshes } from 'vitamoo';
import { assertPlayingSceneExchange } from 'vitamoo';
import type { GltfAttachmentRef, PlayingSceneExchange } from 'vitamoo';
import {
    parseContentIndexAssetLists,
    playingSceneExchangeToContentIndex,
    resolveSiblingAssetUrl,
} from './playing-scene-merge.js';
import type { TextureHandle } from 'vitamoo';
import type { Body } from './types.js';
import { createBody } from './types.js';

export interface TextureFactory {
    createTextureFromUrl(url: string): Promise<TextureHandle>;
}

export interface ContentStore {
    skeletons: Record<string, any>;
    suits: Record<string, any>;
    skills: Record<string, any>;
    meshes: Record<string, any>;
    textures: Record<string, string>;
}

export interface ContentIndex {
    skeletons?: string[];
    suits?: string[];
    animations?: string[];
    meshes?: string[];
    textures_bmp?: string[];
    textures_png?: string[];
    cfp_files?: string[];
    characters?: CharacterDef[];
    scenes?: SceneDef[];
    gltfAttachments?: GltfAttachmentRef[];
    defaults?: Record<string, string>;
}

export interface CharacterDef {
    /** Stable id within exchange `characterTemplates[]`. */
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
    animation?: string;
    voice?: { pitch?: number; range?: number; formant?: number; breathiness?: number };
}

export interface SceneDef {
    id: string;
    name: string;
    cast: CastMemberDef[];
}

export interface CastMemberDef {
    actor?: string;
    x?: number;
    z?: number;
    direction?: number;
    animation?: string;
    personPlacementId: string;
    characterTemplateId: string;
}

export function createContentStore(): ContentStore {
    return { skeletons: {}, suits: {}, skills: {}, meshes: {}, textures: {} };
}

interface ContentLoaderStateSnapshot {
    index: ContentIndex | null;
    store: ContentStore;
    cfpIndex: Map<string, string>;
    cfpCache: Map<string, ArrayBuffer>;
    skelCache: Record<string, string>;
    textureCache: Map<string, TextureHandle>;
}

function assertJsonResponse(contentType: string, responseBodyForHint: string | null, url: string): void {
    if (!contentType.includes('json')) {
        throw new Error(
            `Expected JSON but got ${contentType} for ${url}` +
            (responseBodyForHint?.startsWith('<!') ? ' (server returned HTML — asset path may be wrong)' : ''),
        );
    }
}

export class ContentLoader {
    store: ContentStore;
    readonly baseUrl: string;
    private _index: ContentIndex | null = null;
    private _cfpIndex = new Map<string, string>();
    private _cfpCache = new Map<string, ArrayBuffer>();
    private _skelCache: Record<string, string> = {};
    private _textureCache = new Map<string, TextureHandle>();
    private _textureFactory: TextureFactory | null = null;

    constructor(baseUrl: string) {
        this.store = createContentStore();
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    }

    get index(): ContentIndex | null {
        return this._index;
    }

    setTextureFactory(factory: TextureFactory): void {
        this._textureFactory = factory;
        console.log('[content-loader] setTextureFactory', factory ? 'ok' : 'null');
    }

    /** Clears parsed asset caches so a new index (e.g. another demo pack) does not reuse stale entries. */
    prepareForReload(): void {
        this._index = null;
        this.store = createContentStore();
        this._cfpIndex.clear();
        this._cfpCache.clear();
        this._skelCache = {};
        this._textureCache.clear();
    }

    snapshotState(): ContentLoaderStateSnapshot {
        return {
            index: this._index,
            store: {
                skeletons: { ...this.store.skeletons },
                suits: { ...this.store.suits },
                skills: { ...this.store.skills },
                meshes: { ...this.store.meshes },
                textures: { ...this.store.textures },
            },
            cfpIndex: new Map(this._cfpIndex),
            cfpCache: new Map(this._cfpCache),
            skelCache: { ...this._skelCache },
            textureCache: new Map(this._textureCache),
        };
    }

    restoreState(snapshot: ContentLoaderStateSnapshot): void {
        this._index = snapshot.index;
        this.store = {
            skeletons: { ...snapshot.store.skeletons },
            suits: { ...snapshot.store.suits },
            skills: { ...snapshot.store.skills },
            meshes: { ...snapshot.store.meshes },
            textures: { ...snapshot.store.textures },
        };
        this._cfpIndex = new Map(snapshot.cfpIndex);
        this._cfpCache = new Map(snapshot.cfpCache);
        this._skelCache = { ...snapshot.skelCache };
        this._textureCache = new Map(snapshot.textureCache);
    }

    async loadIndex(url: string): Promise<ContentIndex> {
        const fullUrl = this.baseUrl + url;
        const resp = await fetch(fullUrl);
        if (!resp.ok) {
            throw new Error(`Failed to load content index: ${resp.status} ${resp.statusText} for ${fullUrl}`);
        }
        const contentType = resp.headers.get('content-type') || '';
        let bodyHint: string | null = null;
        if (!contentType.includes('json')) {
            bodyHint = await resp.text();
        }
        assertJsonResponse(contentType, bodyHint, fullUrl);
        const raw: unknown = await resp.json();
        assertPlayingSceneExchange(raw, fullUrl);

        let merged: PlayingSceneExchange & Partial<ContentIndex> = raw;
        if (raw.assetIndexRef) {
            const assetUrl = resolveSiblingAssetUrl(fullUrl, raw.assetIndexRef);
            const ar = await fetch(assetUrl);
            if (!ar.ok) {
                throw new Error(
                    `Playing-scene assetIndexRef failed: ${ar.status} ${ar.statusText} for ${assetUrl}`,
                );
            }
            const assetContentType = ar.headers.get('content-type') || '';
            let assetBodyHint: string | null = null;
            if (!assetContentType.includes('json')) {
                assetBodyHint = await ar.text();
            }
            assertJsonResponse(assetContentType, assetBodyHint, assetUrl);
            const assets = parseContentIndexAssetLists(await ar.json(), assetUrl);
            merged = { ...assets, ...raw };
        }
        const nextIndex = playingSceneExchangeToContentIndex(merged);
        this.prepareForReload();
        this._index = nextIndex;
        return this._index;
    }

    async loadAllContent(onProgress?: (msg: string) => void): Promise<void> {
        const idx = this._index;
        if (!idx) throw new Error('loadIndex() first');

        onProgress?.('Loading animations...');

        for (const name of (idx.textures_bmp || [])) {
            const base = name.replace(/\.(bmp|png)$/i, '');
            if (!this.store.textures[base]) this.store.textures[base] = name;
        }
        for (const name of (idx.textures_png || [])) {
            const base = name.replace(/\.(bmp|png)$/i, '');
            this.store.textures[base] = name;
        }

        const allCmx = [
            ...(idx.skeletons || []),
            ...(idx.suits || []),
            ...(idx.animations || []),
        ];

        const cmxResults = await Promise.all(allCmx.map(async name => {
            try {
                const r = await fetch(this.baseUrl + name);
                if (!r.ok) return null;
                return parseCMX(await r.text());
            } catch { return null; }
        }));
        for (const cmx of cmxResults) {
            if (!cmx) continue;
            (cmx as any).skeletons?.forEach((s: any) => this.store.skeletons[s.name] = s);
            (cmx as any).suits?.forEach((s: any) => this.store.suits[s.name] = s);
            (cmx as any).skills?.forEach((s: any) => this.store.skills[s.name] = s);
        }

        onProgress?.('Loading meshes...');

        const meshNames = idx.meshes || [];
        const sknResults = await Promise.all(meshNames.map(async name => {
            try {
                const r = await fetch(this.baseUrl + name);
                if (!r.ok) return null;
                return parseSKN(await r.text());
            } catch { return null; }
        }));
        for (const mesh of sknResults) {
            if (mesh) this.store.meshes[(mesh as any).name] = mesh;
        }

        if (idx.gltfAttachments?.length) {
            onProgress?.('Loading glTF attachments...');
            await this._loadGltfAttachments(idx.gltfAttachments);
        }

        this._buildCfpIndex();

        onProgress?.('Loading skeletons and textures...');

        const skelFiles = new Set<string>();
        if (idx.characters) {
            for (const c of idx.characters) {
                const n = c.skeleton || 'adult';
                skelFiles.add(n.includes('.cmx') ? n : n + '-skeleton.cmx');
            }
        }

        const texNames = new Set<string>();
        if (idx.characters) {
            for (const c of idx.characters) {
                if (c.bodyTexture) texNames.add(c.bodyTexture);
                if (c.headTexture) texNames.add(c.headTexture);
                if (c.handTexture) texNames.add(c.handTexture);
            }
        }

        const cfpNames = new Set<string>();
        for (const skill of Object.values(this.store.skills)) {
            const cfpName = (skill as any).animationFileName;
            if (cfpName && ((skill as any).numTranslations > 0 || (skill as any).numRotations > 0)) {
                cfpNames.add(cfpName);
            }
        }

        await Promise.all([
            ...Array.from(skelFiles).map(async sf => {
                try {
                    const r = await fetch(this.baseUrl + sf);
                    if (r.ok) this._skelCache[sf] = await r.text();
                } catch { /* skip */ }
            }),
            ...Array.from(texNames).map(tn => this.getTexture(tn)),
            ...Array.from(cfpNames).map(async cfpName => {
                const bare = cfpName.toLowerCase();
                const cfpFile = this._cfpIndex.get(bare) || this._cfpIndex.get('xskill-' + bare);
                if (!cfpFile) return;
                try {
                    const r = await fetch(this.baseUrl + cfpFile);
                    if (r.ok) this._cfpCache.set(cfpName, await r.arrayBuffer());
                } catch { /* skip */ }
            }),
        ]);

        onProgress?.('Ready');
    }

    async getTexture(baseName: string): Promise<TextureHandle | null> {
        if (!baseName) {
            console.warn('[content-loader] getTexture: empty baseName');
            return null;
        }
        if (!this._textureFactory) {
            console.warn('[content-loader] getTexture: no texture factory set', { baseName });
            return null;
        }
        if (this._textureCache.has(baseName)) return this._textureCache.get(baseName)!;

        const fileName = this.store.textures[baseName];
        if (!fileName) {
            console.warn('[content-loader] getTexture: no fileName in store', { baseName, storeKeys: Object.keys(this.store.textures) });
            return null;
        }

        const url = this.baseUrl + fileName;
        try {
            const tex = await this._textureFactory.createTextureFromUrl(url);
            this._textureCache.set(baseName, tex);
            return tex;
        } catch (e) {
            console.warn('[content-loader] getTexture failed', { baseName, url }, e);
            return null;
        }
    }

    findCharacterByTemplateId(id: string): CharacterDef | null {
        if (!this._index?.characters) return null;
        return this._index.characters.find((c) => c.id === id) || null;
    }

    async loadScene(sceneIndex: number): Promise<Body[]> {
        const idx = this._index;
        if (!idx?.scenes?.[sceneIndex]) return [];
        const scene = idx.scenes[sceneIndex];
        const newBodies: Body[] = [];
        for (let ci = 0; ci < scene.cast.length; ci++) {
            const cast = scene.cast[ci];
            const char = this.findCharacterByTemplateId(cast.characterTemplateId);
            if (!char) {
                throw new Error(
                    `[playing-scene] scene "${scene.id}" cast "${cast.personPlacementId}" references unknown template "${cast.characterTemplateId}"`,
                );
            }
            const body = await this._buildBodyFromCharacter(char, {
                actorName: cast.actor || char.name || `Person ${ci + 1}`,
                x: cast.x ?? 0,
                z: cast.z ?? 0,
                direction: cast.direction ?? 0,
                animation: cast.animation || char.animation,
            });
            if (body) newBodies.push(body);
        }
        return newBodies;
    }

    async loadCharacterBody(char: CharacterDef): Promise<Body | null> {
        return this._buildBodyFromCharacter(char, {
            actorName: char.name,
            animation: char.animation,
        });
    }

    async loadCharacterBodyReplacing(char: CharacterDef, previous: Body): Promise<Body | null> {
        const next = await this._buildBodyFromCharacter(char, {
            actorName: previous.actorName,
            x: previous.x,
            z: previous.z,
            direction: previous.direction,
            animation: char.animation,
        });
        if (!next) return null;
        next.spinOffset = previous.spinOffset;
        next.spinVelocity = previous.spinVelocity;
        Object.assign(next.top, previous.top);
        return next;
    }

    private async _buildBodyFromCharacter(
        char: CharacterDef,
        overrides: { actorName?: string; x?: number; z?: number; direction?: number; animation?: string } = {}
    ): Promise<Body | null> {
        const body = createBody();
        body.personData = char;
        body.actorName = overrides.actorName ?? char.name;
        body.x = overrides.x ?? 0;
        body.z = overrides.z ?? 0;
        body.direction = overrides.direction ?? 0;

        const skelName = char.skeleton || 'adult';
        const skelFile = skelName.includes('.cmx') ? skelName : skelName + '-skeleton.cmx';
        let skelText = this._skelCache[skelFile];
        if (!skelText) {
            try {
                const r = await fetch(this.baseUrl + skelFile);
                if (r.ok) {
                    skelText = await r.text();
                    this._skelCache[skelFile] = skelText;
                }
            } catch { return null; }
        }
        if (!skelText) return null;

        const skelData = parseCMX(skelText);
        const skeletons = (skelData as any).skeletons;
        if (skeletons?.length) {
            body.skeleton = buildSkeleton(skeletons[0]);
            body.skeletonBoneData = skeletons[0].bones;
            updateTransforms(body.skeleton);
        }
        if (!body.skeleton) return null;

        const meshParts = [
            { name: char.body, tex: char.bodyTexture },
            { name: char.head, tex: char.headTexture },
            { name: char.leftHand, tex: char.handTexture },
            { name: char.rightHand, tex: char.handTexture },
        ];
        for (const part of meshParts) {
            if (!part.name) continue;
            let mesh = this.store.meshes[part.name];
            if (!mesh) {
                const lk = part.name.toLowerCase();
                const ciMatch = Object.keys(this.store.meshes).find(k => k.toLowerCase() === lk);
                if (ciMatch) mesh = this.store.meshes[ciMatch];
            }
            if (!mesh) continue;
            const boneMap = new Map<string, any>();
            for (const bone of body.skeleton!) boneMap.set(bone.name, bone);
            const texture = part.tex ? await this.getTexture(part.tex) : null;
            if (part.tex && !texture) {
                console.warn('[content-loader] body part has texture key but got null', { character: char.name, part: part.name, texKey: part.tex });
            }
            body.meshes.push({ mesh, boneMap, texture });
        }

        const animName = overrides.animation ?? char.animation;
        if (animName && body.skeleton) {
            const practice = await this._loadAnimation(animName, body.skeleton);
            if (practice) body.practices = [practice];
        }
        return body;
    }

    async _loadAnimation(animName: string, skeleton: any[]): Promise<any | null> {
        let skill = this.store.skills[animName];

        if (!skill) {
            const lower = animName.toLowerCase();
            skill = Object.values(this.store.skills).find(
                (s: any) => s.name?.toLowerCase() === lower
            );
            if (!skill) {
                const stripped = lower.replace(/^(adult|ross|child|c2o|a2o)-/, '');
                skill = Object.values(this.store.skills).find((s: any) => {
                    const sLower = (s.name || '').toLowerCase();
                    const sStripped = sLower.replace(/^(adult|ross|child|c2o|a2o)-/, '');
                    return sStripped === stripped || sLower.includes(stripped);
                });
            }
        }
        if (!skill) return null;
        if (!(skill as any).motions?.length) return null;

        const cfpName = (skill as any).animationFileName;
        if (cfpName && !this._cfpCache.has(cfpName) &&
            ((skill as any).numTranslations > 0 || (skill as any).numRotations > 0)) {
            const bare = cfpName.toLowerCase();
            const cfpFile = this._cfpIndex.get(bare) || this._cfpIndex.get('xskill-' + bare);
            if (cfpFile) {
                try {
                    const r = await fetch(this.baseUrl + cfpFile);
                    if (r.ok) this._cfpCache.set(cfpName, await r.arrayBuffer());
                } catch { /* skip */ }
            }
        }

        const buffer = this._cfpCache.get(cfpName);
        if (buffer && ((skill as any).translations.length === 0 && (skill as any).rotations.length === 0)) {
            (skill as any).translations = [];
            (skill as any).rotations = [];
            parseCFP(buffer, skill);
        }

        const practice = new Practice(skill, skeleton);
        if ((practice as any).ready) {
            (practice as any).tick(0);
            updateTransforms(skeleton);
        }
        return practice;
    }

    private _buildCfpIndex(): void {
        if (!this._index?.cfp_files) return;
        for (const filename of this._index.cfp_files) {
            const key = filename.replace(/\.cfp$/i, '').toLowerCase();
            this._cfpIndex.set(key, filename);
        }
    }

    private async _loadGltfAttachments(attachments: GltfAttachmentRef[]): Promise<void> {
        for (const attachment of attachments) {
            if (!attachment?.url) continue;
            const url = resolveSiblingAssetUrl(this.baseUrl, attachment.url);
            try {
                const meshes = await loadGltfMeshes(
                    url,
                    attachment.meshName ? { meshName: attachment.meshName } : undefined,
                );
                if (meshes.length === 0) continue;
                for (let i = 0; i < meshes.length; i++) {
                    const mesh = meshes[i];
                    const meshName = mesh.name?.trim() || `${attachment.id}-mesh-${i + 1}`;
                    const names = [meshName, `${attachment.id}/${meshName}`];
                    if (i === 0) names.unshift(attachment.id);
                    for (const name of names) {
                        if (!name) continue;
                        if (this.store.meshes[name]) continue;
                        this.store.meshes[name] = mesh;
                    }
                }
            } catch (error) {
                console.warn('[content-loader] glTF attachment load failed', { attachment, url }, error);
            }
        }
    }
}
