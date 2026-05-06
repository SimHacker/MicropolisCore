import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { open, opendir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { detectIffVersion, IffVersion, isFar, listIffChunks, parseFar } from 'vitamoo';
import {
	ROOT_CONTENT_TYPES,
	ROOT_CONTENT_TYPE_INSTALL,
	ROOT_TYPE_LOCAL_PATH,
} from '../shared/root-catalog';

export type RootContentType = string;
export type RootPermissionStatus = 'granted' | 'expired' | 'unknown';
export type RootPermissionProvider = 'node-path' | 'file-system-access' | 'manual';
export type RootContentMap = Record<string, boolean>;
export type RootType = string;
export type RootMetadata = Record<string, unknown>;
export type ScanStatus = 'running' | 'completed' | 'failed';
export type CatalogEntryKind = 'file' | 'container' | 'object' | 'chunk' | 'issue';
export type CatalogRefKind = CatalogEntryKind;

export interface CatalogRef {
	kind: CatalogRefKind;
	id: string;
}

export type RootDiscoveryBucketMap = Record<string, CatalogRef[]>;

export interface RootDiscoveryBuckets {
	byContentType: RootDiscoveryBucketMap;
	byObjectKind: RootDiscoveryBucketMap;
}

export interface RootContentSelection {
	all: boolean;
	types: RootContentMap;
}

export interface ScanRoot {
	id: string;
	rootType: RootType;
	rootMetadata: RootMetadata;
	name: string;
	description: string;
	path: string;
	enabled: boolean;
	addedAt: string;
	contentSelection: RootContentSelection;
	discoveryBuckets: RootDiscoveryBuckets;
	permissionStatus: RootPermissionStatus;
	permissionProvider: RootPermissionProvider;
	permissionTokenId: string | null;
	permissionGrantedAt: string | null;
	permissionExpiresAt: string | null;
	lastScannedAt: string | null;
}

export interface ScanRunSummary {
	rootCount: number;
	scannedFileCount: number;
	skippedDisabledCount: number;
	containerCount: number;
	objectCount: number;
	chunkCount: number;
	issueCount: number;
}

export interface ScanRun {
	id: string;
	status: ScanStatus;
	startedAt: string;
	finishedAt: string | null;
	rootIds: string[];
	summary: ScanRunSummary;
	errorMessage: string | null;
}

export interface CatalogBaseEntry {
	id: string;
	rootId: string;
	kind: CatalogEntryKind;
	path: string;
	name: string;
}

export interface CatalogFileEntry extends CatalogBaseEntry {
	kind: 'file';
	fileKind: string;
	size: number;
	mtimeMs: number;
	contentTypes: RootContentType[];
}

export interface CatalogContainerEntry extends CatalogBaseEntry {
	kind: 'container';
	containerKind: string;
	fileId: string;
	memberCount: number;
}

export interface CatalogObjectEntry extends CatalogBaseEntry {
	kind: 'object';
	fileId: string;
	containerId: string | null;
	objectKind: string;
	resourceId: number | null;
	guid: string | null;
	label: string;
}

export interface CatalogChunkEntry extends CatalogBaseEntry {
	kind: 'chunk';
	fileId: string;
	containerId: string | null;
	chunkType: string;
	chunkId: number;
	size: number;
}

export interface CatalogIssueEntry extends CatalogBaseEntry {
	kind: 'issue';
	fileId: string;
	severity: 'warning' | 'error';
	code: string;
	message: string;
	context: string;
}

export type CatalogEntry =
	| CatalogFileEntry
	| CatalogContainerEntry
	| CatalogObjectEntry
	| CatalogChunkEntry
	| CatalogIssueEntry;

export interface CatalogQuery {
	rootId?: string;
	kind?: CatalogEntryKind | 'all';
	objectKind?: string;
	text?: string;
	offset?: number;
	limit?: number;
}

interface CatalogResult {
	rows: CatalogEntry[];
	total: number;
	offset: number;
	limit: number;
}

interface InventoryState {
	roots: Map<string, ScanRoot>;
	runs: Map<string, ScanRun>;
	files: CatalogFileEntry[];
	containers: CatalogContainerEntry[];
	objects: CatalogObjectEntry[];
	chunks: CatalogChunkEntry[];
	issues: CatalogIssueEntry[];
}

interface SerializedRootState {
	roots: ScanRoot[];
}

const OBJECT_CHUNK_TYPES = new Set([
	'OBJD',
	'OBJF',
	'OBJM',
	'OBJT',
	'DGRP',
	'SPR#',
	'SPR2',
	'BHAV',
	'BCON',
	'TTAB',
	'TTAS',
]);

const FAMILY_ALBUM_CHUNK_TYPES = new Set(['PICT', 'CMMT']);

const ROOT_STATE_DIR = path.join(process.cwd(), '.vitamoospace-state');
const ROOT_STATE_FILE = path.join(ROOT_STATE_DIR, 'roots.json');
const CATALOG_REF_KINDS = new Set<CatalogRefKind>([
	'file',
	'container',
	'object',
	'chunk',
	'issue',
]);

const state: InventoryState = {
	roots: new Map(),
	runs: new Map(),
	files: [],
	containers: [],
	objects: [],
	chunks: [],
	issues: [],
};

function nowIso(): string {
	return new Date().toISOString();
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
	return Uint8Array.from(buffer).buffer;
}

function createEmptyContentMap(): RootContentMap {
	const next = {} as RootContentMap;
	for (const type of ROOT_CONTENT_TYPES) {
		next[type] = false;
	}
	return next;
}

function createEmptyDiscoveryBucketMap(): RootDiscoveryBucketMap {
	return {};
}

function createEmptyDiscoveryBuckets(): RootDiscoveryBuckets {
	return {
		byContentType: createEmptyDiscoveryBucketMap(),
		byObjectKind: createEmptyDiscoveryBucketMap(),
	};
}

function normalizeContentMap(value: unknown, fallback?: RootContentMap): RootContentMap {
	const next = createEmptyContentMap();
	if (fallback) {
		for (const [type, enabled] of Object.entries(fallback)) {
			if (typeof enabled === 'boolean') next[type] = enabled;
		}
	}
	if (!value || typeof value !== 'object' || Array.isArray(value)) return next;
	const record = value as Record<string, unknown>;
	for (const [type, enabled] of Object.entries(record)) {
		if (typeof enabled === 'boolean') {
			next[type] = enabled;
		}
	}
	return next;
}

function normalizeCatalogRef(value: unknown): CatalogRef | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const record = value as Record<string, unknown>;
	const id = parseOptionalText(record.id);
	const kindValue = parseOptionalText(record.kind);
	if (!id || !kindValue) return null;
	if (!CATALOG_REF_KINDS.has(kindValue as CatalogRefKind)) return null;
	return {
		id,
		kind: kindValue as CatalogRefKind,
	};
}

function normalizeDiscoveryBucketMap(
	value: unknown,
	fallback?: RootDiscoveryBucketMap,
): RootDiscoveryBucketMap {
	const next = createEmptyDiscoveryBucketMap();
	const append = (bucketKey: string, ref: CatalogRef): void => {
		const normalizedKey = bucketKey.trim();
		if (!normalizedKey) return;
		const refs = next[normalizedKey] ?? [];
		if (!refs.some((existing) => existing.kind === ref.kind && existing.id === ref.id)) {
			next[normalizedKey] = [...refs, ref];
		}
	};

	if (fallback) {
		for (const [bucketKey, refs] of Object.entries(fallback)) {
			if (!Array.isArray(refs)) continue;
			for (const ref of refs) {
				const normalizedRef = normalizeCatalogRef(ref);
				if (normalizedRef) append(bucketKey, normalizedRef);
			}
		}
	}

	if (!value || typeof value !== 'object' || Array.isArray(value)) return next;
	const record = value as Record<string, unknown>;
	for (const [bucketKey, refs] of Object.entries(record)) {
		if (!Array.isArray(refs)) continue;
		for (const ref of refs) {
			const normalizedRef = normalizeCatalogRef(ref);
			if (normalizedRef) append(bucketKey, normalizedRef);
		}
	}
	return next;
}

function normalizeDiscoveryBuckets(
	value: unknown,
	fallback?: RootDiscoveryBuckets,
): RootDiscoveryBuckets {
	const fallbackByContentType = fallback?.byContentType;
	const fallbackByObjectKind = fallback?.byObjectKind;
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return {
			byContentType: normalizeDiscoveryBucketMap(undefined, fallbackByContentType),
			byObjectKind: normalizeDiscoveryBucketMap(undefined, fallbackByObjectKind),
		};
	}
	const record = value as Record<string, unknown>;
	return {
		byContentType: normalizeDiscoveryBucketMap(record.byContentType, fallbackByContentType),
		byObjectKind: normalizeDiscoveryBucketMap(record.byObjectKind, fallbackByObjectKind),
	};
}

function normalizeContentSelection(
	value: unknown,
	fallback?: RootContentSelection,
): RootContentSelection {
	const defaultAll = fallback?.all ?? true;
	if (!value || typeof value !== 'object') {
		return {
			all: defaultAll,
			types: normalizeContentMap(undefined, fallback?.types),
		};
	}
	const record = value as Record<string, unknown>;
	const all = typeof record.all === 'boolean' ? record.all : defaultAll;
	const types = normalizeContentMap(record.types, fallback?.types);
	return { all, types };
}

function normalizePermissionStatus(
	value: unknown,
	fallback: RootPermissionStatus = 'granted',
): RootPermissionStatus {
	if (value === 'granted' || value === 'expired' || value === 'unknown') {
		return value;
	}
	return fallback;
}

function normalizePermissionProvider(
	value: unknown,
	fallback: RootPermissionProvider = 'node-path',
): RootPermissionProvider {
	if (value === 'node-path' || value === 'file-system-access' || value === 'manual') {
		return value;
	}
	return fallback;
}

function normalizeRootType(value: unknown, fallback: RootType = ROOT_TYPE_LOCAL_PATH): RootType {
	return parseOptionalText(value) ?? fallback;
}

function normalizeRootMetadata(value: unknown, fallback?: RootMetadata): RootMetadata {
	const next: RootMetadata = {};
	if (fallback) {
		for (const [key, metadataValue] of Object.entries(fallback)) {
			next[key] = metadataValue;
		}
	}
	if (!value || typeof value !== 'object' || Array.isArray(value)) return next;
	for (const [key, metadataValue] of Object.entries(value as Record<string, unknown>)) {
		const normalizedKey = key.trim();
		if (!normalizedKey) continue;
		next[normalizedKey] = metadataValue;
	}
	return next;
}

function parseOptionalText(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function normalizePath(inputPath: string): string {
	return path.resolve(inputPath);
}

function deriveDefaultRootName(rootPath: string): string {
	const base = path.basename(rootPath);
	const fallback = base || 'root';
	const withoutSuffix = fallback.replace(/\.[^.]+$/u, '').trim();
	return withoutSuffix || fallback || 'root';
}

function rootNameExists(name: string, exceptRootId?: string): boolean {
	const wanted = name.toLowerCase();
	for (const root of state.roots.values()) {
		if (exceptRootId && root.id === exceptRootId) continue;
		if (root.name.toLowerCase() === wanted) return true;
	}
	return false;
}

function ensureUniqueRootName(nameSeed: string, rootId: string, exceptRootId?: string): string {
	const normalizedSeed = nameSeed.trim() || 'root';
	if (!rootNameExists(normalizedSeed, exceptRootId)) return normalizedSeed;
	const withId = `${normalizedSeed}-${rootId.slice(0, 8)}`;
	if (!rootNameExists(withId, exceptRootId)) return withId;
	let suffix = 2;
	while (rootNameExists(`${withId}-${suffix}`, exceptRootId)) {
		suffix += 1;
	}
	return `${withId}-${suffix}`;
}

function isDisabledSegment(segment: string): boolean {
	return segment.toLowerCase().endsWith('-disabled');
}

function shouldSkipDisabledPath(absPath: string): boolean {
	const parts = absPath.split(path.sep);
	for (const part of parts) {
		if (part && isDisabledSegment(part)) return true;
	}
	return false;
}

function createIssue(
	rootId: string,
	fileId: string,
	filePath: string,
	code: string,
	message: string,
	context: string,
	severity: 'warning' | 'error' = 'warning',
): CatalogIssueEntry {
	return {
		id: randomUUID(),
		rootId,
		kind: 'issue',
		fileId,
		path: filePath,
		name: path.basename(filePath),
		code,
		message,
		context,
		severity,
	};
}

function clearRowsForRoots(rootIds: Set<string>): void {
	state.files = state.files.filter((row) => !rootIds.has(row.rootId));
	state.containers = state.containers.filter((row) => !rootIds.has(row.rootId));
	state.objects = state.objects.filter((row) => !rootIds.has(row.rootId));
	state.chunks = state.chunks.filter((row) => !rootIds.has(row.rootId));
	state.issues = state.issues.filter((row) => !rootIds.has(row.rootId));
}

function selectedFilterTypes(root: ScanRoot): RootContentType[] {
	return Object.entries(root.contentSelection.types)
		.filter(
			([type, enabled]) => type !== ROOT_CONTENT_TYPE_INSTALL && enabled === true,
		)
		.map(([type]) => type);
}

function matchesRootFilter(root: ScanRoot, fileTypes: RootContentType[]): boolean {
	if (root.contentSelection.all) return true;
	const active = selectedFilterTypes(root);
	if (active.length === 0) {
		return root.contentSelection.types[ROOT_CONTENT_TYPE_INSTALL] === true;
	}
	return fileTypes.some((type) => active.includes(type));
}

function appendBucketRef(
	buckets: RootDiscoveryBucketMap,
	bucketKey: string,
	ref: CatalogRef,
): boolean {
	const normalizedKey = bucketKey.trim();
	if (!normalizedKey) return false;
	const refs = buckets[normalizedKey] ?? [];
	if (refs.some((existing) => existing.kind === ref.kind && existing.id === ref.id)) {
		return false;
	}
	buckets[normalizedKey] = [...refs, ref];
	return true;
}

function appendRootDiscoveryRefs(
	rootId: string,
	ref: CatalogRef,
	buckets: {
		contentTypes?: string[];
		objectKinds?: string[];
	},
): void {
	const root = state.roots.get(rootId);
	if (!root) return;
	const nextBuckets: RootDiscoveryBuckets = {
		byContentType: { ...root.discoveryBuckets.byContentType },
		byObjectKind: { ...root.discoveryBuckets.byObjectKind },
	};
	let changed = false;
	for (const contentType of buckets.contentTypes ?? []) {
		changed = appendBucketRef(nextBuckets.byContentType, contentType, ref) || changed;
	}
	for (const objectKind of buckets.objectKinds ?? []) {
		changed = appendBucketRef(nextBuckets.byObjectKind, objectKind, ref) || changed;
	}
	if (!changed) return;
	state.roots.set(rootId, { ...root, discoveryBuckets: nextBuckets });
}

function resetDiscoveryBuckets(rootId: string): void {
	const root = state.roots.get(rootId);
	if (!root) return;
	state.roots.set(rootId, {
		...root,
		discoveryBuckets: createEmptyDiscoveryBuckets(),
	});
}

function setRootLastScanned(rootId: string): void {
	const root = state.roots.get(rootId);
	if (!root) return;
	state.roots.set(rootId, {
		...root,
		lastScannedAt: nowIso(),
	});
}

function setRootPermissionStatus(rootId: string, status: RootPermissionStatus): void {
	const root = state.roots.get(rootId);
	if (!root) return;
	let permissionGrantedAt = root.permissionGrantedAt;
	let permissionExpiresAt = root.permissionExpiresAt;
	if (status === 'granted') {
		permissionGrantedAt = nowIso();
		permissionExpiresAt = null;
	} else if (status === 'expired') {
		permissionExpiresAt = nowIso();
	}
	state.roots.set(rootId, {
		...root,
		permissionStatus: status,
		permissionGrantedAt,
		permissionExpiresAt,
	});
}

function nodeErrorCode(error: unknown): string | null {
	if (!error || typeof error !== 'object') return null;
	const record = error as Record<string, unknown>;
	return typeof record.code === 'string' ? record.code : null;
}

function isPermissionFailure(code: string | null): boolean {
	return code === 'EACCES' || code === 'EPERM' || code === 'ENOENT';
}

function fileLooksLikeInterchange(filePath: string): boolean {
	const lower = filePath.toLowerCase();
	return (
		lower.endsWith('.json') ||
		lower.endsWith('.yaml') ||
		lower.endsWith('.yml')
	);
}

async function walkFiles(
	rootPath: string,
	currentPath: string,
	visit: (absPath: string, relativePath: string) => Promise<void>,
): Promise<void> {
	const dir = await opendir(currentPath);
	for await (const entry of dir) {
		const absPath = path.join(currentPath, entry.name);
		const relativePath = path.relative(rootPath, absPath);
		if (isDisabledSegment(entry.name)) continue;
		if (entry.isDirectory()) {
			await walkFiles(rootPath, absPath, visit);
			continue;
		}
		if (!entry.isFile()) continue;
		await visit(absPath, relativePath);
	}
}

async function classifyFileByBytes(absPath: string): Promise<string> {
	const fileHandle = await open(absPath, 'r');
	let prefix = Buffer.alloc(0);
	try {
		const readBuffer = Buffer.alloc(256);
		const { bytesRead } = await fileHandle.read(readBuffer, 0, readBuffer.length, 0);
		prefix = readBuffer.subarray(0, bytesRead);
	} finally {
		await fileHandle.close();
	}
	const arrayBuffer = toArrayBuffer(prefix);
	if (isFar(arrayBuffer)) return 'far';
	if (detectIffVersion(arrayBuffer) !== IffVersion.UNKNOWN) return 'iff';
	if (prefix.length >= 4 && prefix[0] === 0x50 && prefix[1] === 0x4b) return 'zip';
	if (prefix.length >= 2 && prefix[0] === 0x42 && prefix[1] === 0x4d) return 'bmp';

	const asciiPrefix = prefix
		.subarray(0, Math.min(prefix.length, 64))
		.toString('utf8')
		.toLowerCase();
	if (asciiPrefix.includes('cmx')) return 'cmx-text';
	if (asciiPrefix.includes('skn')) return 'skn-text';
	if (asciiPrefix.includes('cfp')) return 'cfp-binary';
	const trimmed = asciiPrefix.trimStart();
	if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
	return 'unknown';
}

function inferContentTypes(relativePath: string, fileKind: string): RootContentType[] {
	const lower = relativePath.toLowerCase();
	const types = new Set<RootContentType>();

	if (fileKind === 'iff') {
		types.add('iff');
		types.add('objects');
	}
	if (fileKind === 'far') {
		types.add('far');
		types.add('archives');
		types.add('objects');
	}
	if (fileKind === 'zip') types.add('archives');
	if (fileKind === 'bmp') types.add('textures');
	if (fileKind === 'cmx-text') types.add('skeletons');
	if (fileKind === 'skn-text') types.add('skins');
	if (fileKind === 'cfp-binary') {
		types.add('skills');
		types.add('animations');
	}
	if (fileKind === 'json' || lower.endsWith('.yaml') || lower.endsWith('.yml')) {
		types.add('interchange');
	}
	if (lower.includes('download')) types.add('downloads');
	if (/user\d+\.iff$/u.test(lower) || lower.includes('/users/')) types.add('people');
	if (/house\d+\.iff$/u.test(lower) || lower.includes('/houses/')) types.add('houses');
	if (lower.includes('neighborhood') || /(^|\/)n\d{3}(\/|$)/u.test(lower)) {
		types.add('neighborhoods');
	}
	if (lower.includes('family') || lower.includes('fami')) types.add('families');
	if (lower.includes('album') || lower.includes('photo') || lower.includes('snapshot')) {
		types.add('familyAlbums');
	}
	if (lower.includes('skeleton') || lower.includes('/cmx/')) types.add('skeletons');
	if (lower.includes('skin') || lower.includes('/skn/')) types.add('skins');
	if (lower.includes('skill') || lower.includes('/cfp/')) types.add('skills');

	if (types.size === 0) {
		types.add('objects');
	}
	return Array.from(types);
}

function summarizeRun(rootIds: string[]): ScanRunSummary {
	const rootSet = new Set(rootIds);
	let skippedDisabledCount = 0;
	for (const issue of state.issues) {
		if (rootSet.has(issue.rootId) && issue.code === 'scan.skipped_disabled') skippedDisabledCount += 1;
	}
	return {
		rootCount: rootIds.length,
		scannedFileCount: state.files.filter((row) => rootSet.has(row.rootId)).length,
		skippedDisabledCount,
		containerCount: state.containers.filter((row) => rootSet.has(row.rootId)).length,
		objectCount: state.objects.filter((row) => rootSet.has(row.rootId)).length,
		chunkCount: state.chunks.filter((row) => rootSet.has(row.rootId)).length,
		issueCount: state.issues.filter((row) => rootSet.has(row.rootId)).length,
	};
}

async function scanOneFile(
	root: ScanRoot,
	absPath: string,
	relativePath: string,
	forceIncludeDisabledPath = false,
): Promise<void> {
	if (!forceIncludeDisabledPath && shouldSkipDisabledPath(absPath)) {
		state.issues.push(
			createIssue(
				root.id,
				randomUUID(),
				relativePath,
				'scan.skipped_disabled',
				'Skipped disabled path',
				absPath,
			),
		);
		return;
	}

	const fileId = randomUUID();
	try {
		const st = await stat(absPath);
		const fileKind = await classifyFileByBytes(absPath);
		let contentTypes = inferContentTypes(relativePath, fileKind);
		let iffChunks: ReturnType<typeof listIffChunks> | null = null;
		if (fileKind === 'iff') {
			const buffer = await readFile(absPath);
			iffChunks = listIffChunks(toArrayBuffer(buffer));
			if (iffChunks.some((chunk) => FAMILY_ALBUM_CHUNK_TYPES.has(chunk.typeFourCC))) {
				contentTypes = Array.from(new Set([...contentTypes, 'familyAlbums']));
			}
		}
		if (!matchesRootFilter(root, contentTypes)) return;
		const normalizedContentTypes = Array.from(new Set(contentTypes));

		const fileRow: CatalogFileEntry = {
			id: fileId,
			rootId: root.id,
			kind: 'file',
			path: relativePath,
			name: path.basename(relativePath),
			fileKind,
			size: st.size,
			mtimeMs: st.mtimeMs,
			contentTypes: normalizedContentTypes,
		};
		state.files.push(fileRow);
		appendRootDiscoveryRefs(
			root.id,
			{ kind: fileRow.kind, id: fileRow.id },
			{ contentTypes: normalizedContentTypes },
		);

		if (fileKind === 'iff') {
			const chunks = iffChunks ?? [];
			const containerId = randomUUID();
			const containerRow: CatalogContainerEntry = {
				id: containerId,
				rootId: root.id,
				kind: 'container',
				path: relativePath,
				name: path.basename(relativePath),
				containerKind: 'iff',
				fileId,
				memberCount: chunks.length,
			};
			state.containers.push(containerRow);
			appendRootDiscoveryRefs(
				root.id,
				{ kind: containerRow.kind, id: containerRow.id },
				{ contentTypes: normalizedContentTypes },
			);
			for (const chunk of chunks) {
				const chunkEntry: CatalogChunkEntry = {
					id: randomUUID(),
					rootId: root.id,
					kind: 'chunk',
					path: `${relativePath}#${chunk.typeFourCC}:${chunk.id}`,
					name: `${chunk.typeFourCC}:${chunk.id}`,
					fileId,
					containerId,
					chunkType: chunk.typeFourCC,
					chunkId: chunk.id,
					size: chunk.dataSize,
				};
				state.chunks.push(chunkEntry);
				appendRootDiscoveryRefs(
					root.id,
					{ kind: chunkEntry.kind, id: chunkEntry.id },
					{ contentTypes: normalizedContentTypes },
				);
				if (OBJECT_CHUNK_TYPES.has(chunk.typeFourCC)) {
					const objectEntry: CatalogObjectEntry = {
						id: randomUUID(),
						rootId: root.id,
						kind: 'object',
						path: chunkEntry.path,
						name: chunkEntry.name,
						fileId,
						containerId,
						objectKind: chunk.typeFourCC,
						resourceId: chunk.id,
						guid: null,
						label: chunk.name || `${chunk.typeFourCC}:${chunk.id}`,
					};
					state.objects.push(objectEntry);
					appendRootDiscoveryRefs(
						root.id,
						{ kind: objectEntry.kind, id: objectEntry.id },
						{
							contentTypes: normalizedContentTypes,
							objectKinds: [objectEntry.objectKind],
						},
					);
				}
				if (FAMILY_ALBUM_CHUNK_TYPES.has(chunk.typeFourCC)) {
					const albumEntry: CatalogObjectEntry = {
						id: randomUUID(),
						rootId: root.id,
						kind: 'object',
						path: `${chunkEntry.path}#album`,
						name: chunkEntry.name,
						fileId,
						containerId,
						objectKind:
							chunk.typeFourCC === 'PICT'
								? 'family-album-image'
								: 'family-album-caption',
						resourceId: chunk.id,
						guid: null,
						label: chunk.name || `${chunk.typeFourCC}:${chunk.id}`,
					};
					state.objects.push(albumEntry);
					appendRootDiscoveryRefs(
						root.id,
						{ kind: albumEntry.kind, id: albumEntry.id },
						{
							contentTypes: normalizedContentTypes,
							objectKinds: [albumEntry.objectKind],
						},
					);
				}
			}
		} else if (fileKind === 'far') {
			const buffer = await readFile(absPath);
			const archive = parseFar(toArrayBuffer(buffer));
			const containerId = randomUUID();
			const containerRow: CatalogContainerEntry = {
				id: containerId,
				rootId: root.id,
				kind: 'container',
				path: relativePath,
				name: path.basename(relativePath),
				containerKind: 'far',
				fileId,
				memberCount: archive.entries.length,
			};
			state.containers.push(containerRow);
			appendRootDiscoveryRefs(
				root.id,
				{ kind: containerRow.kind, id: containerRow.id },
				{ contentTypes: normalizedContentTypes },
			);
			for (const entry of archive.entries) {
				const memberRow: CatalogObjectEntry = {
					id: randomUUID(),
					rootId: root.id,
					kind: 'object',
					path: `${relativePath}::${entry.path}`,
					name: entry.path,
					fileId,
					containerId,
					objectKind: 'far-member',
					resourceId: null,
					guid: null,
					label: entry.path,
				};
				state.objects.push(memberRow);
				appendRootDiscoveryRefs(
					root.id,
					{ kind: memberRow.kind, id: memberRow.id },
					{
						contentTypes: normalizedContentTypes,
						objectKinds: [memberRow.objectKind],
					},
				);
			}
		}
	} catch (error) {
		const errorCode = nodeErrorCode(error);
		if (isPermissionFailure(errorCode)) {
			setRootPermissionStatus(root.id, 'expired');
		}
		const message = error instanceof Error ? error.message : String(error);
		state.issues.push(
			createIssue(
				root.id,
				fileId,
				relativePath,
				'scan.file_error',
				'Failed to classify or parse file',
				message,
				'error',
			),
		);
	}
}

async function scanRoot(root: ScanRoot): Promise<void> {
	if (root.rootType !== ROOT_TYPE_LOCAL_PATH) {
		state.issues.push(
			createIssue(
				root.id,
				randomUUID(),
				root.path,
				'scan.unsupported_root_type',
				'Root type is not supported by scanner',
				`Root type "${root.rootType}" is not implemented in this scan pass.`,
				'warning',
			),
		);
		return;
	}

	const rootPath = normalizePath(root.path);

	let rootStat: Awaited<ReturnType<typeof stat>>;
	try {
		rootStat = await stat(rootPath);
	} catch (error) {
		const code = nodeErrorCode(error);
		if (isPermissionFailure(code)) {
			setRootPermissionStatus(root.id, 'expired');
		}
		const message = error instanceof Error ? error.message : String(error);
		state.issues.push(
			createIssue(
				root.id,
				randomUUID(),
				root.path,
				'scan.root_unavailable',
				'Root path is unavailable',
				message,
				'error',
			),
		);
		return;
	}

	if (rootStat.isFile()) {
		const isExplicitDisabledFile = shouldSkipDisabledPath(rootPath);
		if (
			fileLooksLikeInterchange(rootPath) &&
			(root.contentSelection.all || root.contentSelection.types['interchange'] === true)
		) {
			const passthroughIssue = createIssue(
				root.id,
				randomUUID(),
				root.path,
				'scan.interchange_passthrough',
				'Interchange root registered; byte scan skipped',
				'Interchange import/export runs in a separate pipeline.',
			);
			state.issues.push(passthroughIssue);
			appendRootDiscoveryRefs(
				root.id,
				{ kind: passthroughIssue.kind, id: passthroughIssue.id },
				{ contentTypes: ['interchange'] },
			);
			return;
		}
		await scanOneFile(root, rootPath, path.basename(rootPath), isExplicitDisabledFile);
		return;
	}

	if (shouldSkipDisabledPath(rootPath)) {
		state.issues.push(
			createIssue(
				root.id,
				randomUUID(),
				root.path,
				'scan.skipped_disabled',
				'Skipped disabled path',
				rootPath,
			),
		);
		return;
	}

	if (!rootStat.isDirectory()) {
		state.issues.push(
			createIssue(
				root.id,
				randomUUID(),
				root.path,
				'scan.unsupported_root',
				'Unsupported root type',
				'Root must point to a directory, regular file, or interchange manifest.',
				'error',
			),
		);
		return;
	}

	await walkFiles(rootPath, rootPath, async (absPath, relativePath) => {
		await scanOneFile(root, absPath, relativePath);
	});
}

function rootFromUnknown(raw: unknown): ScanRoot | null {
	if (!raw || typeof raw !== 'object') return null;
	const record = raw as Record<string, unknown>;
	const rawPath = parseOptionalText(record.path);
	if (!rawPath) return null;
	const normalizedPath = normalizePath(rawPath);
	const id = parseOptionalText(record.id) ?? randomUUID();
	const rawName = parseOptionalText(record.name) ?? deriveDefaultRootName(normalizedPath);
	const name = ensureUniqueRootName(rawName, id);
	const rootType = normalizeRootType(record.rootType, ROOT_TYPE_LOCAL_PATH);
	const permissionStatus = normalizePermissionStatus(record.permissionStatus, 'granted');
	return {
		id,
		rootType,
		rootMetadata: normalizeRootMetadata(record.rootMetadata),
		name,
		description: parseOptionalText(record.description) ?? '',
		path: normalizedPath,
		enabled: typeof record.enabled === 'boolean' ? record.enabled : true,
		addedAt: parseOptionalText(record.addedAt) ?? nowIso(),
		contentSelection: normalizeContentSelection(record.contentSelection),
		discoveryBuckets: normalizeDiscoveryBuckets(record.discoveryBuckets),
		permissionStatus,
		permissionProvider: normalizePermissionProvider(record.permissionProvider, 'node-path'),
		permissionTokenId: parseOptionalText(record.permissionTokenId),
		permissionGrantedAt:
			permissionStatus === 'granted'
				? parseOptionalText(record.permissionGrantedAt) ?? nowIso()
				: parseOptionalText(record.permissionGrantedAt),
		permissionExpiresAt: parseOptionalText(record.permissionExpiresAt),
		lastScannedAt: parseOptionalText(record.lastScannedAt),
	};
}

function persistRoots(): void {
	const payload: SerializedRootState = {
		roots: Array.from(state.roots.values()),
	};
	mkdirSync(ROOT_STATE_DIR, { recursive: true });
	writeFileSync(ROOT_STATE_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

function loadRoots(): void {
	if (!existsSync(ROOT_STATE_FILE)) return;
	try {
		const text = readFileSync(ROOT_STATE_FILE, 'utf8');
		if (!text.trim()) return;
		const raw = JSON.parse(text) as unknown;
		if (!raw || typeof raw !== 'object') return;
		const rootsRaw = (raw as Record<string, unknown>).roots;
		if (!Array.isArray(rootsRaw)) return;
		for (const item of rootsRaw) {
			const root = rootFromUnknown(item);
			if (!root) continue;
			const existingByPath = Array.from(state.roots.values()).find((row) => row.path === root.path);
			if (existingByPath) continue;
			state.roots.set(root.id, root);
		}
	} catch {
		// Ignore corrupt state and continue with empty roots map.
	}
}

loadRoots();

export function listRoots(): ScanRoot[] {
	return Array.from(state.roots.values()).sort((a, b) => {
		const byName = a.name.localeCompare(b.name);
		if (byName !== 0) return byName;
		return a.path.localeCompare(b.path);
	});
}

export function addRoot(input: {
	path: string;
	rootType?: unknown;
	rootMetadata?: unknown;
	name?: unknown;
	description?: unknown;
	contentSelection?: unknown;
	permissionProvider?: unknown;
	permissionTokenId?: unknown;
	permissionStatus?: unknown;
}): ScanRoot {
	const rootPath = input.path.trim();
	if (!rootPath) throw new Error('Root path is required');
	const normalized = normalizePath(rootPath);
	const existing = Array.from(state.roots.values()).find((row) => row.path === normalized);
	if (existing) {
		return updateRoot(existing.id, {
			rootType: input.rootType,
			rootMetadata: input.rootMetadata,
			name: input.name,
			description: input.description,
			contentSelection: input.contentSelection,
			permissionProvider: input.permissionProvider,
			permissionTokenId: input.permissionTokenId,
			permissionStatus: input.permissionStatus,
		});
	}

	const id = randomUUID();
	const rootType = normalizeRootType(input.rootType, ROOT_TYPE_LOCAL_PATH);
	const requestedName = parseOptionalText(input.name) ?? deriveDefaultRootName(normalized);
	const permissionStatus = normalizePermissionStatus(input.permissionStatus, 'granted');
	const root: ScanRoot = {
		id,
		rootType,
		rootMetadata: normalizeRootMetadata(input.rootMetadata),
		name: ensureUniqueRootName(requestedName, id),
		description: parseOptionalText(input.description) ?? '',
		path: normalized,
		enabled: true,
		addedAt: nowIso(),
		contentSelection: normalizeContentSelection(input.contentSelection),
		discoveryBuckets: createEmptyDiscoveryBuckets(),
		permissionStatus,
		permissionProvider: normalizePermissionProvider(input.permissionProvider, 'node-path'),
		permissionTokenId: parseOptionalText(input.permissionTokenId),
		permissionGrantedAt: permissionStatus === 'granted' ? nowIso() : null,
		permissionExpiresAt: permissionStatus === 'expired' ? nowIso() : null,
		lastScannedAt: null,
	};
	state.roots.set(root.id, root);
	persistRoots();
	return root;
}

export function updateRoot(
	id: string,
	input: {
		enabled?: unknown;
		rootType?: unknown;
		rootMetadata?: unknown;
		description?: unknown;
		name?: unknown;
		contentSelection?: unknown;
		permissionProvider?: unknown;
		permissionTokenId?: unknown;
		permissionStatus?: unknown;
	},
): ScanRoot {
	const existing = state.roots.get(id);
	if (!existing) throw new Error(`Unknown root id: ${id}`);
	const enabled = typeof input.enabled === 'boolean' ? input.enabled : existing.enabled;
	const description =
		typeof input.description === 'string' ? input.description.trim() : existing.description;
	const requestedName =
		input.name === undefined
			? existing.name
			: (parseOptionalText(input.name) ?? deriveDefaultRootName(existing.path));
	const name = ensureUniqueRootName(requestedName, existing.id, existing.id);
	const rootType =
		input.rootType === undefined
			? existing.rootType
			: normalizeRootType(input.rootType, existing.rootType);
	const rootMetadata =
		input.rootMetadata === undefined
			? existing.rootMetadata
			: normalizeRootMetadata(input.rootMetadata, existing.rootMetadata);
	const contentSelection =
		input.contentSelection === undefined
			? existing.contentSelection
			: normalizeContentSelection(input.contentSelection, existing.contentSelection);
	const permissionProvider =
		input.permissionProvider === undefined
			? existing.permissionProvider
			: normalizePermissionProvider(input.permissionProvider, existing.permissionProvider);
	const permissionTokenId =
		input.permissionTokenId === undefined
			? existing.permissionTokenId
			: parseOptionalText(input.permissionTokenId);
	let permissionStatus =
		input.permissionStatus === undefined
			? existing.permissionStatus
			: normalizePermissionStatus(input.permissionStatus, existing.permissionStatus);
	let permissionGrantedAt = existing.permissionGrantedAt;
	let permissionExpiresAt = existing.permissionExpiresAt;
	if (permissionStatus === 'granted' && existing.permissionStatus !== 'granted') {
		permissionGrantedAt = nowIso();
		permissionExpiresAt = null;
	}
	if (permissionStatus === 'expired' && existing.permissionStatus !== 'expired') {
		permissionExpiresAt = nowIso();
	}
	if (permissionStatus === 'unknown') {
		permissionGrantedAt = existing.permissionGrantedAt;
		permissionExpiresAt = existing.permissionExpiresAt;
	}
	const updated: ScanRoot = {
		...existing,
		enabled,
		rootType,
		rootMetadata,
		description,
		name,
		contentSelection,
		permissionProvider,
		permissionTokenId,
		permissionStatus,
		permissionGrantedAt,
		permissionExpiresAt,
	};
	state.roots.set(id, updated);
	persistRoots();
	return updated;
}

export function regrantRootPermission(id: string): ScanRoot {
	const existing = state.roots.get(id);
	if (!existing) throw new Error(`Unknown root id: ${id}`);
	const updated: ScanRoot = {
		...existing,
		permissionStatus: 'granted',
		permissionGrantedAt: nowIso(),
		permissionExpiresAt: null,
	};
	state.roots.set(id, updated);
	persistRoots();
	return updated;
}

export function removeRoot(id: string): boolean {
	const removed = state.roots.delete(id);
	if (!removed) return false;
	const rootSet = new Set([id]);
	clearRowsForRoots(rootSet);
	for (const [runId, run] of state.runs.entries()) {
		if (run.rootIds.includes(id)) state.runs.delete(runId);
	}
	persistRoots();
	return true;
}

export function listRuns(): ScanRun[] {
	return Array.from(state.runs.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getRun(id: string): ScanRun | null {
	return state.runs.get(id) ?? null;
}

export async function startScan(requestedRootIds?: string[]): Promise<ScanRun> {
	const roots = listRoots().filter((root) => root.enabled);
	const targetRoots =
		requestedRootIds && requestedRootIds.length > 0
			? roots.filter((root) => requestedRootIds.includes(root.id))
			: roots;
	if (targetRoots.length === 0) {
		throw new Error('No enabled roots selected');
	}

	const run: ScanRun = {
		id: randomUUID(),
		status: 'running',
		startedAt: nowIso(),
		finishedAt: null,
		rootIds: targetRoots.map((root) => root.id),
		summary: {
			rootCount: targetRoots.length,
			scannedFileCount: 0,
			skippedDisabledCount: 0,
			containerCount: 0,
			objectCount: 0,
			chunkCount: 0,
			issueCount: 0,
		},
		errorMessage: null,
	};
	state.runs.set(run.id, run);

	const rootSet = new Set(run.rootIds);
	clearRowsForRoots(rootSet);
	for (const rootId of run.rootIds) {
		resetDiscoveryBuckets(rootId);
	}

	try {
		for (const root of targetRoots) {
			try {
				await scanRoot(root);
				setRootLastScanned(root.id);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				state.issues.push(
					createIssue(
						root.id,
						randomUUID(),
						root.path,
						'scan.root_error',
						'Root scan failed',
						message,
						'error',
					),
				);
			}
		}
		run.status = 'completed';
	} catch (error) {
		run.status = 'failed';
		run.errorMessage = error instanceof Error ? error.message : String(error);
	}

	run.finishedAt = nowIso();
	run.summary = summarizeRun(run.rootIds);
	state.runs.set(run.id, run);
	persistRoots();
	return run;
}

export function queryCatalog(query: CatalogQuery): CatalogResult {
	const kind = query.kind ?? 'all';
	const rootId = query.rootId ?? 'all';
	const objectKind = (query.objectKind ?? '').trim().toLowerCase();
	const text = (query.text ?? '').trim().toLowerCase();
	const offset = Math.max(0, query.offset ?? 0);
	const limit = Math.min(500, Math.max(1, query.limit ?? 100));

	let rows: CatalogEntry[] = [
		...state.files,
		...state.containers,
		...state.objects,
		...state.chunks,
		...state.issues,
	];
	if (kind !== 'all') rows = rows.filter((row) => row.kind === kind);
	if (rootId !== 'all') rows = rows.filter((row) => row.rootId === rootId);
	if (objectKind) {
		rows = rows.filter((row) => {
			if (row.kind !== 'object') return false;
			return row.objectKind.toLowerCase() === objectKind;
		});
	}
	if (text) {
		rows = rows.filter((row) => {
			const root = state.roots.get(row.rootId);
			const rootMeta = root ? `${root.name}\n${root.description}\n${root.path}` : '';
			const haystack = `${row.path}\n${row.name}\n${rootMeta}\n${JSON.stringify(row)}`.toLowerCase();
			return haystack.includes(text);
		});
	}
	rows.sort((a, b) => {
		const pathCmp = a.path.localeCompare(b.path);
		if (pathCmp !== 0) return pathCmp;
		return a.kind.localeCompare(b.kind);
	});
	const total = rows.length;
	const paged = rows.slice(offset, offset + limit);
	return { rows: paged, total, offset, limit };
}
