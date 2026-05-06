/**
 * L3 neighborhood scanner.
 *
 * Locates and parses Sims 1 Neighborhood.iff files from a VirtualTree.
 *
 * Path convention (from Globs.cpp / Neighborhood.cpp source):
 *   {nghDirectory}/Neighborhood.iff     — default: UserData/Neighborhood.iff
 *   {nghDirectory}/Houses/House##.iff   — individual house lots
 *   {nghDirectory}/Characters/          — User#####.iff person objects
 *
 * For the Legacy Collection and modern installs, the UserData directory may
 * be numbered: UserData, UserData2, …, UserData9.
 *
 * Neighborhood.iff contains:
 *   NGBH (id=1) — Neighborhood blob (house grid, terrain)
 *   NBRS (id=1) — All neighbours (Sims); one chunk, all Sims
 *   FAMI (id=#) — One chunk per family; id = family/house number
 */

import { isIff, listIffChunks, getIffChunkData, filterChunksByType, RES_FAMI, RES_NBRS } from 'vitamoo';
import type { ResourceProvider } from '../l0/types.js';
import type { VirtualTree } from '../l1/virtual-tree.js';
import { parseFami } from './fami.js';
import { parseNbrs, resolveFamilies } from './nbrs.js';
import type { FamiChunk } from './fami.js';
import type { NbrsChunk, Neighbour } from './nbrs.js';

/** Default neighbourhood directories to check under a root path. */
export const DEFAULT_NGH_DIRS: readonly string[] = [
	'UserData', 'UserData2', 'UserData3', 'UserData4',
	'UserData5', 'UserData6', 'UserData7', 'UserData8', 'UserData9',
	// Legacy Collection (EA App / Steam)
	'Neighborhoods/N001', 'Neighborhoods/N002', 'Neighborhoods/N003',
];

export interface NeighbourSummary {
	neighborId: number;
	guid: number;
	/** fOriginalFileName (character object file name without path). */
	charFile: string;
	currentHouse: number;
	isAdult: boolean;       // PersonData[58] = kPersonAge: 1=adult, 0=child
	gender: 'male' | 'female' | 'unknown';
	skinColor: number;      // 0=light 1=medium 2=dark
	familyNumber: number;   // which family/house
	skills: {
		cooking: number; mechanical: number; charisma: number;
		logic: number; body: number; creativity: number; cleaning: number;
	};
	personality: {
		nice: number; active: number; generous: number;
		playful: number; outgoing: number; neat: number;
	};
}

export interface FamilySummary {
	houseNumber: number;
	funds: number;
	memberCount: number;
	members: NeighbourSummary[];
	isTownie: boolean;
}

export interface NeighborhoodData {
	/** Path that was read (e.g. 'UserData/Neighborhood.iff'). */
	path: string;
	/** Raw chunk data for callers that need deeper access. */
	families: FamiChunk[];
	nbrs: NbrsChunk;
	/** Convenience summaries. */
	familySummaries: FamilySummary[];
	/** All non-townie characters as a flat list. */
	allSims: NeighbourSummary[];
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Try to parse a Neighborhood.iff at a specific path.
 * Returns null if the file does not exist or is not a valid IFF.
 */
export async function readNeighborhoodFile(
	provider: ResourceProvider,
	iffPath: string,
	outerVersion = 40,
): Promise<NeighborhoodData | null> {
	const buf = await provider.read(iffPath);
	if (!buf || !isIff(buf)) return null;
	return parseNeighborhoodBuffer(buf, iffPath, outerVersion);
}

/**
 * Scan a VirtualTree for Neighborhood.iff files under common paths.
 * Returns all successfully parsed neighborhoods.
 */
export async function scanForNeighborhoods(
	tree: VirtualTree,
	candidateDirs: readonly string[] = DEFAULT_NGH_DIRS,
	outerVersion = 40,
): Promise<NeighborhoodData[]> {
	const results: NeighborhoodData[] = [];
	for (const dir of candidateDirs) {
		const iffPath = `${dir}/Neighborhood.iff`;
		if (!(await tree.exists(iffPath))) continue;
		const data = await readNeighborhoodFromTree(tree, iffPath, outerVersion);
		if (data) results.push(data);
	}
	return results;
}

/** Read a Neighborhood.iff from a VirtualTree (may be inside a FAR archive). */
export async function readNeighborhoodFromTree(
	tree: VirtualTree,
	iffPath: string,
	outerVersion = 40,
): Promise<NeighborhoodData | null> {
	const buf = await tree.read(iffPath);
	if (!buf || !isIff(buf)) return null;
	return parseNeighborhoodBuffer(buf, iffPath, outerVersion);
}

// ─── Parsing internals ────────────────────────────────────────────────────────

function parseNeighborhoodBuffer(
	buf: ArrayBuffer,
	path: string,
	outerVersion: number,
): NeighborhoodData | null {
	const chunks = listIffChunks(buf);

	const famiChunks = filterChunksByType(chunks, RES_FAMI);
	const nbrsChunks = filterChunksByType(chunks, RES_NBRS);

	if (nbrsChunks.length === 0) return null;

	const families: FamiChunk[] = famiChunks.map(c => parseFami(getIffChunkData(buf, c)));
	const nbrs = parseNbrs(getIffChunkData(buf, nbrsChunks[0]!), outerVersion);

	const familyMemberMap = resolveFamilies(nbrs, families);

	const familySummaries = families.map(fam => {
		const members = familyMemberMap.get(fam.houseNumber) ?? [];
		return {
			houseNumber: fam.houseNumber,
			funds: fam.funds,
			memberCount: fam.memberGuids.length,
			members: members.map(n => summariseNeighbour(n, fam.houseNumber)),
			isTownie: fam.isTownie,
		} satisfies FamilySummary;
	});

	const allSims = familySummaries
		.filter(f => !f.isTownie)
		.flatMap(f => f.members);

	return { path, families, nbrs, familySummaries, allSims };
}

function summariseNeighbour(n: Neighbour, familyNumber: number): NeighbourSummary {
	const pd = n.personData;
	const s = (i: number) => (pd ? (pd[i] ?? 0) : 0);
	return {
		neighborId: n.neighborId,
		guid: n.guid,
		charFile: n.originalFileName,
		currentHouse: n.currentHouse,
		isAdult: s(58) === 1,
		gender: s(65) === 0 ? 'male' : s(65) === 1 ? 'female' : 'unknown',
		skinColor: s(60),
		familyNumber,
		skills: {
			cooking:    s(10),
			mechanical: s(12),
			charisma:   s(11),
			logic:      s(18),
			body:       s(17),
			creativity: s(15),
			cleaning:   s(9),
		},
		personality: {
			nice:      s(2),
			active:    s(3),
			generous:  s(4),
			playful:   s(5),
			outgoing:  s(6),
			neat:      s(7),
		},
	};
}
