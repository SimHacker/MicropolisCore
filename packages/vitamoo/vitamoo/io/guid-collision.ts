/**
 * GUID collision analysis primitives.
 *
 * Purpose:
 * - Ingest any number of object definitions from IFF packages.
 * - Build GUID -> objects map.
 * - Classify per-GUID collisions into exact groups, near matches, and oddballs.
 * - Produce warning payloads for UI/LLM/manual resolution phases.
 *
 * Non-goals for this file:
 * - No file edits.
 * - No re-GUID assignment.
 * - No package disable/rename actions.
 */

export type GuidValue = number;

export type ObjectSourceKind =
    | 'base-game'
    | 'expansion-pack'
    | 'download'
    | 'user-created'
    | 'unknown';

export interface GuidCollisionObject<T = Record<string, unknown>> {
    guid: GuidValue;
    payload: T;
    objectType?: string;
    resourceId?: number;
    label?: string;
    sourcePath?: string;
    sourceKind?: ObjectSourceKind;
    immutable?: boolean;
}

export type GuidObjectMap<T = Record<string, unknown>> = Map<GuidValue, GuidCollisionObject<T>[]>;

export interface GuidExactMatchGroup<T = Record<string, unknown>> {
    groupId: string;
    fingerprint: string;
    objects: GuidCollisionObject<T>[];
}

export interface GuidSimilarityMatrix {
    labels: string[];
    values: number[][];
}

export interface GuidCollisionAnalysis<T = Record<string, unknown>> {
    guid: GuidValue;
    totalObjects: number;
    exactGroups: GuidExactMatchGroup<T>[];
    similarityByExactGroup: GuidSimilarityMatrix;
    nearMatchClusters: string[][];
    oddballGroupIds: string[];
    immutableGroupIds: string[];
    classification: 'unique' | 'exact-only' | 'near-match' | 'conflict';
}

export interface GuidCollisionWarning<T = Record<string, unknown>> {
    guid: GuidValue;
    severity: 'info' | 'warning';
    summary: string;
    analysis: GuidCollisionAnalysis<T>;
    recommendedNextStep: string;
}

export interface GuidCollisionOptions<T = Record<string, unknown>> {
    nearMatchThreshold?: number;
    fingerprint?: (object: GuidCollisionObject<T>) => string;
    similarity?: (left: GuidCollisionObject<T>, right: GuidCollisionObject<T>) => number;
}

export function buildGuidObjectMap<T = Record<string, unknown>>(
    objects: Iterable<GuidCollisionObject<T>>,
): GuidObjectMap<T> {
    const byGuid: GuidObjectMap<T> = new Map<GuidValue, GuidCollisionObject<T>[]>();
    for (const object of objects) {
        const row = byGuid.get(object.guid);
        if (row) {
            row.push(object);
        } else {
            byGuid.set(object.guid, [object]);
        }
    }
    return byGuid;
}

export function appendGuidObjectMap<T = Record<string, unknown>>(
    map: GuidObjectMap<T>,
    objects: Iterable<GuidCollisionObject<T>>,
): void {
    for (const object of objects) {
        const row = map.get(object.guid);
        if (row) {
            row.push(object);
        } else {
            map.set(object.guid, [object]);
        }
    }
}

export function analyzeGuidBucket<T = Record<string, unknown>>(
    guid: GuidValue,
    objects: GuidCollisionObject<T>[],
    options: GuidCollisionOptions<T> = {},
): GuidCollisionAnalysis<T> {
    const nearMatchThreshold = options.nearMatchThreshold ?? 0.85;
    const fingerprint = options.fingerprint ?? defaultGuidFingerprint;
    const similarity = options.similarity ?? defaultGuidSimilarity;

    const exactGroups = groupGuidObjectsByExactMatch(objects, fingerprint);
    const similarityByExactGroup = buildExactGroupSimilarityMatrix(exactGroups, similarity);
    const nearMatchClusters = clusterNearMatches(similarityByExactGroup, nearMatchThreshold);

    const immutableGroupIds = exactGroups
        .filter((group) => group.objects.some(isImmutableGuidObject))
        .map((group) => group.groupId);

    const nearGroupIdSet = new Set(nearMatchClusters.flat());
    const oddballGroupIds = exactGroups
        .map((group) => group.groupId)
        .filter((groupId) => !nearGroupIdSet.has(groupId));

    const totalObjects = objects.length;
    const classification = classifyGuidBucket(totalObjects, exactGroups, nearMatchClusters);

    return {
        guid,
        totalObjects,
        exactGroups,
        similarityByExactGroup,
        nearMatchClusters,
        oddballGroupIds,
        immutableGroupIds,
        classification,
    };
}

export function analyzeGuidObjectMap<T = Record<string, unknown>>(
    map: GuidObjectMap<T>,
    options: GuidCollisionOptions<T> = {},
): Map<GuidValue, GuidCollisionAnalysis<T>> {
    const out = new Map<GuidValue, GuidCollisionAnalysis<T>>();
    for (const [guid, objects] of map) {
        out.set(guid, analyzeGuidBucket(guid, objects, options));
    }
    return out;
}

export function buildGuidCollisionWarnings<T = Record<string, unknown>>(
    analyses: Iterable<GuidCollisionAnalysis<T>>,
): GuidCollisionWarning<T>[] {
    const warnings: GuidCollisionWarning<T>[] = [];
    for (const analysis of analyses) {
        if (analysis.totalObjects <= 1) continue;
        const severity: 'info' | 'warning' =
            analysis.classification === 'exact-only' ? 'info' : 'warning';
        const summary = formatGuidCollisionSummary(analysis);
        warnings.push({
            guid: analysis.guid,
            severity,
            summary,
            analysis,
            recommendedNextStep: recommendedNextStepForGuid(analysis),
        });
    }
    return warnings;
}

function classifyGuidBucket<T = Record<string, unknown>>(
    totalObjects: number,
    exactGroups: GuidExactMatchGroup<T>[],
    nearMatchClusters: string[][],
): 'unique' | 'exact-only' | 'near-match' | 'conflict' {
    if (totalObjects <= 1) return 'unique';
    if (exactGroups.length === 1) return 'exact-only';
    if (nearMatchClusters.length > 0) return 'near-match';
    return 'conflict';
}

function formatGuidCollisionSummary<T = Record<string, unknown>>(
    analysis: GuidCollisionAnalysis<T>,
): string {
    const base = `GUID ${analysis.guid} has ${analysis.totalObjects} object entries in ${analysis.exactGroups.length} exact-match group(s).`;
    switch (analysis.classification) {
        case 'exact-only':
            return `${base} All entries are byte-level equivalent after normalization.`;
        case 'near-match':
            return `${base} Similarity clusters were detected and should be reviewed.`;
        case 'conflict':
            return `${base} Entries diverge with no clear near-match cluster.`;
        default:
            return base;
    }
}

function recommendedNextStepForGuid<T = Record<string, unknown>>(
    analysis: GuidCollisionAnalysis<T>,
): string {
    if (analysis.classification === 'exact-only') {
        return 'Offer duplicate disable/delete choices; keep one enabled object per exact group.';
    }
    if (analysis.immutableGroupIds.length > 0) {
        return 'Protect immutable base-game/expansion objects; re-GUID or disable mutable conflicts.';
    }
    if (analysis.classification === 'near-match') {
        return 'Show grouped previews and similarity matrix; resolve with guided merge/re-GUID actions.';
    }
    return 'Show full comparison and request manual disposition.';
}

function groupGuidObjectsByExactMatch<T = Record<string, unknown>>(
    objects: GuidCollisionObject<T>[],
    fingerprint: (object: GuidCollisionObject<T>) => string,
): GuidExactMatchGroup<T>[] {
    const groups = new Map<string, GuidCollisionObject<T>[]>();
    for (const object of objects) {
        const key = fingerprint(object);
        const row = groups.get(key);
        if (row) row.push(object);
        else groups.set(key, [object]);
    }

    const out: GuidExactMatchGroup<T>[] = [];
    let i = 0;
    for (const [fp, row] of groups) {
        i += 1;
        out.push({ groupId: `g${i}`, fingerprint: fp, objects: row });
    }
    return out;
}

function buildExactGroupSimilarityMatrix<T = Record<string, unknown>>(
    groups: GuidExactMatchGroup<T>[],
    similarity: (left: GuidCollisionObject<T>, right: GuidCollisionObject<T>) => number,
): GuidSimilarityMatrix {
    const labels = groups.map((g) => g.groupId);
    const values: number[][] = labels.map(() => labels.map(() => 0));
    for (let i = 0; i < groups.length; i++) {
        for (let j = i; j < groups.length; j++) {
            const s = i === j ? 1 : similarity(groups[i].objects[0], groups[j].objects[0]);
            values[i][j] = s;
            values[j][i] = s;
        }
    }
    return { labels, values };
}

function clusterNearMatches(matrix: GuidSimilarityMatrix, threshold: number): string[][] {
    const labels = matrix.labels;
    const values = matrix.values;
    const seen = new Set<number>();
    const clusters: string[][] = [];

    for (let i = 0; i < labels.length; i++) {
        if (seen.has(i)) continue;
        const stack = [i];
        const memberIndexes: number[] = [];
        seen.add(i);

        while (stack.length > 0) {
            const cur = stack.pop() as number;
            memberIndexes.push(cur);
            for (let j = 0; j < labels.length; j++) {
                if (j === cur || seen.has(j)) continue;
                if (values[cur]?.[j] >= threshold) {
                    seen.add(j);
                    stack.push(j);
                }
            }
        }

        if (memberIndexes.length > 1) {
            clusters.push(memberIndexes.map((idx) => labels[idx]));
        }
    }

    return clusters;
}

function defaultGuidFingerprint<T = Record<string, unknown>>(object: GuidCollisionObject<T>): string {
    return stableJsonStringify(object.payload);
}

function defaultGuidSimilarity<T = Record<string, unknown>>(
    left: GuidCollisionObject<T>,
    right: GuidCollisionObject<T>,
): number {
    const lt = flattenLeafTokens(left.payload);
    const rt = flattenLeafTokens(right.payload);
    return jaccardSimilarity(lt, rt);
}

function isImmutableGuidObject<T = Record<string, unknown>>(object: GuidCollisionObject<T>): boolean {
    if (object.immutable) return true;
    if (object.sourceKind === 'base-game') return true;
    if (object.sourceKind === 'expansion-pack') return true;
    return false;
}

function flattenLeafTokens(value: unknown): Set<string> {
    const out = new Set<string>();
    walkTokens(value, '', out);
    return out;
}

function walkTokens(value: unknown, path: string, out: Set<string>): void {
    if (value === null || value === undefined) {
        out.add(`${path}=null`);
        return;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        out.add(`${path}=${String(value)}`);
        return;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            out.add(`${path}=[]`);
            return;
        }
        for (let i = 0; i < value.length; i++) {
            const nextPath = path ? `${path}[${i}]` : `[${i}]`;
            walkTokens(value[i], nextPath, out);
        }
        return;
    }
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj).sort();
        if (keys.length === 0) {
            out.add(`${path}={}`);
            return;
        }
        for (const key of keys) {
            const nextPath = path ? `${path}.${key}` : key;
            walkTokens(obj[key], nextPath, out);
        }
        return;
    }
    out.add(`${path}=${String(value)}`);
}

function jaccardSimilarity(left: Set<string>, right: Set<string>): number {
    if (left.size === 0 && right.size === 0) return 1;
    let intersection = 0;
    for (const token of left) {
        if (right.has(token)) intersection += 1;
    }
    const union = left.size + right.size - intersection;
    if (union <= 0) return 1;
    return intersection / union;
}

function stableJsonStringify(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'string') return JSON.stringify(value);
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableJsonStringify(v)).join(',')}]`;
    }
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const keys = Object.keys(obj).sort();
        return `{${keys.map((k) => `${JSON.stringify(k)}:${stableJsonStringify(obj[k])}`).join(',')}}`;
    }
    return JSON.stringify(String(value));
}
