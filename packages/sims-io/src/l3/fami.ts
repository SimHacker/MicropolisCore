/**
 * FAMI chunk parser — family / household data from a Sims 1 Neighborhood.iff.
 *
 * Authoritative source: Family.cpp/h ($Header: /SimsBuild/Code/msrc/src/Family.cpp 23  12/18/99)
 * kFamilyResType = 'FAMI', kFamilyVersion = 7
 *
 * Every IFF chunk payload starts with a 12-byte Recon header (ReconBuilder::Header):
 *   char swizzle(1) + char _pad[3] + long version(4) + long type(4)
 *
 * After the Recon header, Family::DoStream (versioned):
 *   SInt32 fHouseNumber
 *   if version < 5:  ReconString(fName)           — name embedded (old saves)
 *   if version >= 1: SInt32 fCreationOrder
 *   if version >= 2: SInt32 fFunds, fHouseValue, fFriendCount
 *   if version >= 7: SInt32 fFlags
 *   else:
 *     if version >= 3: bool hasPhone
 *     if version >= 4: bool hasBaby
 *     if version >= 6: bool newHouse
 *   DoContainerStream(fMembers):
 *     SInt32 member_count
 *     per member: FamilyMember::DoStream → SInt32 fGUID
 *
 * Family name (modern): stored in a separate 'FAMs' chunk keyed by family number.
 * Family history:       stored in 'FAMh' chunk.
 */

import { IoBuffer } from 'vitamoo';

/** Flag bits in fFlags (version >= 7 families). */
export const FAMI_HAS_PHONE   = 0x01;
export const FAMI_HAS_BABY    = 0x02;
export const FAMI_NEW_HOUSE   = 0x04;
export const FAMI_IN_HOUSE    = 0x08;
export const FAMI_USER_CREATED = 0x10;

export interface FamiChunk {
	/** Recon header version (= kFamilyVersion = 7 for current saves). */
	version: number;
	houseNumber: number;
	creationOrder: number;
	/** Budget / funds (available from version >= 2). */
	funds: number;
	houseValue: number;
	friendCount: number;
	/** Packed flags (available from version >= 7). */
	flags: number;
	/** GUIDs of family members — each matches an NBRS Neighbour.guid. */
	memberGuids: number[];
	/** Family name — stored in 'FAMs' string table in modern saves; empty here. */
	name: string;
	// Derived
	isTownie: boolean;
	hasPhone: boolean;
	hasBaby: boolean;
}

/**
 * Parse a FAMI chunk payload (the bytes inside the IFF chunk, including the
 * 12-byte Recon header).  Pass the result of `getIffChunkData`.
 */
export function parseFami(buf: ArrayBuffer): FamiChunk {
	const io = new IoBuffer(buf);

	// 12-byte Recon header: swizzle(1) + pad(3) + version(4) + type(4)
	io.readUint32();                      // swizzle + pad
	const version = io.readUint32();
	io.readBytes(4);                      // type = 'FAMI' stored LE

	const houseNumber = io.readInt32();

	let name = '';
	if (version < 5) {
		name = readReconString(io);       // old saves embed name here
	}

	let creationOrder = 0;
	if (version >= 1) creationOrder = io.readInt32();

	let funds = 0, houseValue = 0, friendCount = 0;
	if (version >= 2) {
		funds       = io.readInt32();
		houseValue  = io.readInt32();
		friendCount = io.readInt32();
	}

	let flags = 0;
	if (version >= 7) {
		flags = io.readInt32();
	} else {
		if (version >= 3) {
			const hasPhone = io.readUint32() !== 0; // ReconBool → SInt32
			if (hasPhone) flags |= FAMI_HAS_PHONE;
		} else {
			flags |= FAMI_HAS_PHONE;               // default true pre-v3
		}
		if (version >= 4) {
			const hasBaby = io.readUint32() !== 0;
			if (hasBaby) flags |= FAMI_HAS_BABY;
		}
		if (version >= 6) {
			const newHouse = io.readUint32() !== 0;
			if (newHouse) flags |= FAMI_NEW_HOUSE;
		}
	}

	// DoContainerStream(fMembers): SInt32 count, then FamilyMember::DoStream per member
	const memberCount = io.readUint32();
	const memberGuids: number[] = [];
	for (let i = 0; i < memberCount; i++) {
		memberGuids.push(io.readUint32()); // FamilyMember::DoStream → Recon32(&fGUID)
	}

	return {
		version, houseNumber, creationOrder, funds, houseValue, friendCount,
		flags, memberGuids, name,
		isTownie:  houseNumber === -1,
		hasPhone:  (flags & FAMI_HAS_PHONE) !== 0,
		hasBaby:   (flags & FAMI_HAS_BABY) !== 0,
	};
}

/** Recon::ReconString — null-terminated, padded to even total byte count. */
function readReconString(io: IoBuffer): string {
	const bytes: number[] = [];
	while (io.remaining > 0) {
		const b = io.readUint8();
		if (b === 0) break;
		bytes.push(b);
	}
	const str = new TextDecoder('latin1').decode(new Uint8Array(bytes));
	const totalWritten = bytes.length + 1;
	if (totalWritten % 2 !== 0 && io.remaining > 0) io.readUint8();
	return str;
}
