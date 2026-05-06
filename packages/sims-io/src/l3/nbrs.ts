/**
 * NBRS chunk parser — all neighbours (Sims) in a Sims 1 neighborhood.
 *
 * Source: SimObliterator nbrs.py (port of FreeSO NBRS.cs).
 *
 * Binary layout per neighbour:
 *   unknown1(4)   — must be 1 for a valid entry
 *   version(4)    — 0x04 or 0x0A
 *   [unknown3(4)  — only present in version 0x0A]
 *   name          — null-terminated string; if len%2==0 one extra pad byte
 *   mystery_zero(4)
 *   person_mode(4) — 0 = no data; >0 = PersonData follows
 *   [person_data  — 88 int16 if person_mode > 0; size = 0xA0 for v4, 0x200 for vA]
 *   neighbor_id(2) — int16
 *   guid(4)       — uint32
 *   unknown_neg_one(4)
 *   num_relationships(4)
 *   [per relationship: key_count(4)=1, key(4), value_count(4), values…(4)]
 */

import { IoBuffer } from 'vitamoo';
import type { FamiChunk } from './fami.js';

export interface Relationship {
	[neighborId: number]: number[];
}

export interface Neighbour {
	version: number;
	name: string;
	personMode: number;
	/** 88 int16 values from PersonData.h; null when personMode === 0. */
	personData: Int16Array | null;
	neighborId: number;
	guid: number;
	relationships: Map<number, number[]>;
}

export interface NbrsChunk {
	version: number;
	neighbours: Neighbour[];
	/** O(1) lookup by neighborId. */
	byId: Map<number, Neighbour>;
	/** guid → neighborId (first occurrence). */
	guidToId: Map<number, number>;
}

export function parseNbrs(buf: ArrayBuffer): NbrsChunk {
	const io = new IoBuffer(buf);
	io.readUint32();                      // pad
	const version = io.readUint32();
	const magic = new TextDecoder('latin1').decode(io.readBytes(4));
	if (magic !== 'SRBN') {
		throw new Error(`parseNbrs: bad magic "${magic}" (expected "SRBN")`);
	}
	const count = io.readUint32();

	const neighbours: Neighbour[] = [];
	const byId      = new Map<number, Neighbour>();
	const guidToId  = new Map<number, number>();

	for (let i = 0; i < count; i++) {
		if (io.remaining < 4) break;
		const n = readNeighbour(io);
		if (n === null) continue;
		neighbours.push(n);
		byId.set(n.neighborId, n);
		if (!guidToId.has(n.guid)) guidToId.set(n.guid, n.neighborId);
	}

	neighbours.sort((a, b) => a.neighborId - b.neighborId);

	return { version, neighbours, byId, guidToId };
}

function readNeighbour(io: IoBuffer): Neighbour | null {
	const unknown1 = io.readInt32();
	if (unknown1 !== 1) return null;

	const version  = io.readInt32();
	if (version === 0x0a) io.readInt32(); // unknown3

	const name = readNullTermPadded(io);

	const _mysteryZero = io.readInt32();
	const personMode   = io.readInt32();

	let personData: Int16Array | null = null;
	if (personMode > 0) {
		const size = version === 0x04 ? 0xa0 : 0x200;
		personData = new Int16Array(88);
		let read = 0;
		for (let i = 0; i < size; i += 2) {
			if (read < 88) {
				personData[read++] = io.readInt16();
			} else {
				io.skip(size - i);
				break;
			}
		}
	}

	const neighborId = io.readInt16();
	const guid       = io.readUint32();
	io.readInt32();                       // unknown_neg_one

	const numRel = io.readInt32();
	const relationships = new Map<number, number[]>();
	for (let r = 0; r < numRel; r++) {
		io.readInt32();                   // key_count (always 1)
		const key = io.readInt32();
		const valCount = io.readInt32();
		const vals: number[] = [];
		for (let v = 0; v < valCount; v++) vals.push(io.readInt32());
		relationships.set(key, vals);
	}

	return { version, name, personMode, personData, neighborId, guid, relationships };
}

/** Read a null-terminated C string and consume the padding byte if name.length is even. */
function readNullTermPadded(io: IoBuffer): string {
	const bytes: number[] = [];
	while (io.remaining > 0) {
		const b = io.readUint8();
		if (b === 0) break;
		bytes.push(b);
	}
	const name = new TextDecoder('latin1').decode(new Uint8Array(bytes));
	if (name.length % 2 === 0 && io.remaining > 0) io.readUint8(); // pad
	return name;
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
		result.set(fam.familyNumber, members);
	}
	return result;
}
