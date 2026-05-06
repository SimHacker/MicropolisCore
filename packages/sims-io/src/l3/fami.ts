/**
 * FAMI chunk parser — family / household data from a Sims 1 Neighborhood.iff.
 *
 * Source: SimObliterator fami.py (port of FreeSO FAMI.cs).
 * Binary layout (all little-endian int32 unless noted):
 *   pad(4) version(4) magic "IMAF"(4) house_number(4) family_number(4)
 *   budget(4) value_in_arch(4) family_friends(4) flags(4)
 *   member_count(4) [member_guid(4) × member_count]
 *   [trailing_zeros × 0–4]
 */

import { IoBuffer } from 'vitamoo';

/** Family flags stored in the `flags` field. */
export const FAMI_IN_HOUSE      = 0x01;
export const FAMI_USER_CREATED  = 0x08;
export const FAMI_IN_CAS        = 0x10;

export interface FamiChunk {
	version: number;
	houseNumber: number;
	/** Unique family ID; −1 for townies (no house). */
	familyNumber: number;
	budget: number;
	valueInArch: number;
	familyFriends: number;
	flags: number;
	/** GUIDs of family members (each matches a NBRS `Neighbour.guid`). */
	memberGuids: number[];
	// Derived helpers
	isTownie: boolean;
	isUserCreated: boolean;
	isInHouse: boolean;
}

/**
 * Parse a FAMI chunk payload (the bytes *inside* the IFF chunk, not including
 * the IFF chunk header).  Pass the result of `getIffChunkData` / `chunkPayloadReader`.
 */
export function parseFami(buf: ArrayBuffer): FamiChunk {
	const io = new IoBuffer(buf);
	io.readUint32();                      // pad
	const version      = io.readUint32();
	const magic = new TextDecoder('latin1').decode(io.readBytes(4));
	if (magic !== 'IMAF') {
		throw new Error(`parseFami: bad magic "${magic}" (expected "IMAF")`);
	}
	const houseNumber  = io.readInt32();
	const familyNumber = io.readInt32();
	const budget       = io.readInt32();
	const valueInArch  = io.readInt32();
	const familyFriends = io.readInt32();
	const flags        = io.readInt32();
	const memberCount  = io.readInt32();
	const memberGuids: number[] = [];
	for (let i = 0; i < memberCount; i++) {
		memberGuids.push(io.readUint32());
	}
	return {
		version, houseNumber, familyNumber, budget, valueInArch,
		familyFriends, flags, memberGuids,
		isTownie:      familyNumber === -1,
		isUserCreated: (flags & FAMI_USER_CREATED) !== 0,
		isInHouse:     (flags & FAMI_IN_HOUSE) !== 0,
	};
}
