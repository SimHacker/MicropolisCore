/**
 * NBRS chunk parser — all neighbours (Sims) in a Sims 1 Neighborhood.iff.
 *
 * Authoritative source: Neighbor.cpp/h ($Header: /simsbuild/code/msrc/src/Neighbor.cpp 8)
 *
 * Every IFF chunk payload starts with a 12-byte Recon header (ReconBuilder::Header):
 *   char swizzle(1) + char _pad[3] + long version(4) + long type(4)
 *
 * After the Recon header, NBRS uses DoPtrVectorStream layout:
 *   SInt32 element_count
 *   per slot: Int ptrSet(4)   — 0 = null, non-zero (1) = present
 *     if present: Neighbor::DoStream
 *
 * Neighbor::DoStream (with global save `version` and inner `nver`):
 *   if version >= 30: SInt32 nver = 4
 *   if nver >= 2: ReconString(fOriginalFileName) + SInt32 fCurrentHouse
 *   if nver >= 1: SInt32 fPersonDataVersion; if non-zero:
 *     if nver >= 3: 80 × SInt16 (fData[kNumPersonDataFields=80])
 *     else:         64 × SInt16 + 1 unused SInt16 (= 65 × SInt16)
 *   SInt16 fID (neighbor id)
 *   SInt32 fGUID
 *   RelMatrix::DoStream (relationships)
 *
 * RelMatrix::DoStream (RelMatrix.cpp):
 *   SInt32 mver = -1  (current; older saves have a different layout)
 *   if mver == -1: DoPtrVectorStream<RelArray>:
 *     SInt32 count; per slot: Int ptrSet(4); if present:
 *       SInt32 key
 *       DoContainerStream<RelInt>: SInt32 count; per: SInt32 value
 */

import { IoBuffer } from 'vitamoo';
import type { FamiChunk } from './fami.js';
import { PERSON_DATA_FIELDS_BASE, PERSON_DATA_FIELDS_EP_MAX } from './person-data.js';

/**
 * Byte size of the person-data block by nver:
 *   nver 1–2 (base game, old): 0xA0 = 160 bytes, but only reads 64+1 int16 (65×2=130 bytes)
 *   nver >= 3 (base game):     0xA0 = 160 bytes = 80 × int16
 *   nver >= 5 (expansion):     0x200 = 512 bytes = 256 × int16 (reads up to PERSON_DATA_FIELDS_EP_MAX)
 * We derive block size from nver rather than hardcoding so future EP research
 * can update PERSON_DATA_FIELDS_EP_MAX without changing the parser.
 */
function personDataByteSize(nver: number): number {
	return nver <= 4 ? 0xa0 : 0x200;
}

function personDataFieldCount(nver: number): number {
	// EP saves write 256 int16s; we read up to PERSON_DATA_FIELDS_EP_MAX
	// and skip the rest. PERSON_DATA_FIELDS_EP_MAX = 88 from SimObliterator.
	return nver <= 4 ? PERSON_DATA_FIELDS_BASE : PERSON_DATA_FIELDS_EP_MAX;
}

export interface Neighbour {
	/** Inner neighbour stream version (nver in source). */
	nver: number;
	/** Short filename of the person's object file (fOriginalFileName). */
	originalFileName: string;
	/** House number the person is currently in (fCurrentHouse). */
	currentHouse: number;
	/**
	 * 80 int16 PersonData values (fData[kNumPersonDataFields]).
	 * null when nver === 0 or fPersonDataVersion === 0.
	 */
	personData: Int16Array | null;
	/** SInt16 fID — unique neighbour id within the neighborhood. */
	neighborId: number;
	/** SInt32 fGUID — object selector GUID. */
	guid: number;
	/** Map: neighbor_id → relationship score list. */
	relationships: Map<number, number[]>;
}

export interface NbrsChunk {
	/** Recon header version (outer save-file version). */
	version: number;
	neighbours: Neighbour[];
	/** O(1) lookup by neighborId. */
	byId: Map<number, Neighbour>;
	/** guid → neighborId (first occurrence). */
	guidToId: Map<number, number>;
}

/**
 * Parse an NBRS chunk payload (the bytes inside the IFF chunk, including the
 * 12-byte Recon header).  Pass the result of `getIffChunkData`.
 *
 * @param outerVersion - The global save-file version (passed by the caller;
 *   if unknown, use 0 which selects nver=0 = no person data).
 */
export function parseNbrs(buf: ArrayBuffer, outerVersion = 40): NbrsChunk {
	const io = new IoBuffer(buf);

	// 12-byte Recon header: swizzle(1) + pad(3) + version(4) + type(4)
	io.readUint32();                       // swizzle + pad
	const version = io.readUint32();       // Recon version
	io.readBytes(4);                       // type = 'NBRS' stored LE

	// DoPtrVectorStream framing
	const count = io.readUint32();

	const neighbours: Neighbour[] = [];
	const byId      = new Map<number, Neighbour>();
	const guidToId  = new Map<number, number>();

	for (let i = 0; i < count; i++) {
		if (io.remaining < 4) break;
		const ptrSet = io.readInt32();     // 0 = null slot, non-zero = valid
		if (ptrSet === 0) continue;

		const n = readNeighbour(io, outerVersion);
		neighbours.push(n);
		byId.set(n.neighborId, n);
		if (!guidToId.has(n.guid)) guidToId.set(n.guid, n.neighborId);
	}

	neighbours.sort((a, b) => a.neighborId - b.neighborId);
	return { version, neighbours, byId, guidToId };
}

function readNeighbour(io: IoBuffer, outerVersion: number): Neighbour {
	let nver = 0;
	if (outerVersion >= 30) {
		nver = 4;
		nver = io.readInt32();             // read actual nver
	}

	let originalFileName = '';
	let currentHouse = 0;
	if (nver >= 2) {
		originalFileName = readReconString(io);
		currentHouse = io.readInt32();
	}

	let personData: Int16Array | null = null;
	if (nver >= 1) {
		const personDataVersion = io.readInt32();
		if (personDataVersion !== 0) {
			const blockBytes = personDataByteSize(nver);
			const fieldCount = personDataFieldCount(nver);
			personData = new Int16Array(fieldCount); // zero-filled; EP fields default to 0

			if (nver >= 3) {
				// Read up to fieldCount int16s from the block; skip remainder
				const totalInt16s = blockBytes / 2;
				for (let i = 0; i < totalInt16s; i++) {
					if (i < fieldCount) {
						personData[i] = io.readInt16();
					} else {
						io.readInt16(); // skip EP fields beyond our fieldCount
					}
				}
			} else {
				// nver 1–2: 64 int16s + 1 unused
				for (let i = 0; i < 64; i++) personData[i] = io.readInt16();
				io.readInt16(); // unusedAge
				// blockBytes = 0xA0 but 65 int16s = 130 bytes read; skip rest if any
				const consumed = 65 * 2;
				if (blockBytes > consumed) io.skip(blockBytes - consumed);
			}
		}
	}

	const neighborId = io.readInt16();
	const guid       = io.readUint32();

	// RelMatrix::DoStream
	const relationships = readRelMatrix(io, outerVersion);

	return { nver, originalFileName, currentHouse, personData, neighborId, guid, relationships };
}

/**
 * RelMatrix::DoStream — relationship data.
 * mver === -1 means current format: DoPtrVectorStream<RelArray>.
 */
function readRelMatrix(io: IoBuffer, _outerVersion: number): Map<number, number[]> {
	const result = new Map<number, number[]>();
	if (io.remaining < 4) return result;
	const mver = io.readInt32();
	if (mver !== -1) {
		// Legacy format — skip; we don't know the size so stop here
		return result;
	}
	const count = io.readUint32();
	for (let i = 0; i < count; i++) {
		if (io.remaining < 4) break;
		const ptrSet = io.readInt32();
		if (ptrSet === 0) continue;
		const key = io.readInt32();
		const valCount = io.readUint32();
		const vals: number[] = [];
		for (let v = 0; v < valCount; v++) vals.push(io.readInt32());
		result.set(key, vals);
	}
	return result;
}

/**
 * Recon::ReconString — null-terminated C string padded to even byte length.
 * ReconBuffer::ReconString writes: null-terminated bytes, then if total bytes
 * (including the NUL) is odd, one extra 0 pad byte.
 */
function readReconString(io: IoBuffer): string {
	const bytes: number[] = [];
	while (io.remaining > 0) {
		const b = io.readUint8();
		if (b === 0) break;
		bytes.push(b);
	}
	const str = new TextDecoder('latin1').decode(new Uint8Array(bytes));
	// total bytes written = bytes.length + 1 (NUL); if that was odd, extra pad
	const totalWritten = bytes.length + 1;
	if (totalWritten % 2 !== 0 && io.remaining > 0) io.readUint8();
	return str;
}

/** Convenience: resolve family membership for a neighbourhood.
 *  Returns a map: familyNumber → [Neighbour, ...] */
export function resolveFamilies(
	nbrs: NbrsChunk,
	families: FamiChunk[],
): Map<number, Neighbour[]> {
	const result = new Map<number, Neighbour[]>();
	for (const fam of families) {
		const members: Neighbour[] = [];
		for (const guid of fam.memberGuids) {
			const id = nbrs.guidToId.get(guid);
			if (id !== undefined) {
				const n = nbrs.byId.get(id);
				if (n) members.push(n);
			}
		}
		result.set(fam.houseNumber, members);
	}
	return result;
}
