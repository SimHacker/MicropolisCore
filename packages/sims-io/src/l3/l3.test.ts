/**
 * L3 tests — FAMI, NBRS, PersonData.
 *
 * All binary fixtures are built from the authoritative Sims 1 (base game) source:
 *   Family.cpp / Neighbor.cpp  ($Header: .../SimsBuild/Code/msrc/src/...)
 *   PersonData.h  ($Header: /SimsBuild/Code/msrc/Objects/PersonData.h 12  12/17/99)
 *
 * Every FAMI/NBRS chunk payload begins with a 12-byte ReconBuilder::Header:
 *   char swizzle(1) + char _pad[3] + long version(4) + long type(4)
 *
 * kNumPersonDataFields = 80 in the base game (no expansion packs).
 * SimObliterator Python caps at 88 — that approximates expansions; use 80 here.
 */

import { describe, it, expect } from 'vitest';
import { parseFami, FAMI_HAS_PHONE, FAMI_HAS_BABY, FAMI_IN_HOUSE, FAMI_USER_CREATED } from './fami.js';
import { parseNbrs, resolveFamilies } from './nbrs.js';
import type { NbrsChunk, Neighbour } from './nbrs.js';
import type { FamiChunk } from './fami.js';
import {
	PersonData, VISIBLE_SKILLS, ALL_SKILLS, PERSONALITY_TRAITS,
	scalePersonData, ZODIAC_NAMES, PERSON_DATA_FIELDS,
} from './person-data.js';

// ─── Binary helpers ──────────────────────────────────────────────────────────

const dv = (buf: ArrayBuffer) => new DataView(buf);
const u8 = (n: number) => { const a=new Uint8Array(1); a[0]=n&0xff; return a; };
function i32(n: number) { const a=new Uint8Array(4); dv(a.buffer).setInt32(0,n,true); return a; }
function u32(n: number) { const a=new Uint8Array(4); dv(a.buffer).setUint32(0,n,true); return a; }
function i16(n: number) { const a=new Uint8Array(2); dv(a.buffer).setInt16(0,n,true); return a; }

function cat(...parts: Uint8Array[]): ArrayBuffer {
	const total = parts.reduce((s,p)=>s+p.byteLength,0);
	const out = new Uint8Array(total); let pos=0;
	for (const p of parts) { out.set(p,pos); pos+=p.byteLength; }
	return out.buffer as ArrayBuffer;
}

/** ReconBuilder::Header: swizzle+pad(4) + version(4) + type LE(4) */
function reconHdr(version: number, typeFourCC: string): Uint8Array {
	return new Uint8Array(cat(
		u32(0),                                          // swizzle(0) + pad
		u32(version),                                    // Recon version
		new TextEncoder().encode(typeFourCC).reverse(),  // type stored LE
	));
}

/**
 * Null-terminated string padded so the total byte count (chars + NUL + pad)
 * is even — matching ReconBuffer::ReconString in Recon.cpp.
 * Rule: if (string_length + 1) is ODD, add one more zero byte.
 */
function reconStr(s: string): Uint8Array {
	const enc = new TextEncoder().encode(s);
	const withNul = enc.length + 1;
	const total = withNul % 2 !== 0 ? withNul + 1 : withNul; // pad to even
	const buf = new Uint8Array(total); // zeros for NUL and pad
	buf.set(enc, 0);
	return buf;
}

// ─── FAMI fixtures ───────────────────────────────────────────────────────────

function buildFami(opts: {
	version?: number;
	houseNumber?: number;
	funds?: number;
	houseValue?: number;
	friendCount?: number;
	flags?: number;
	memberGuids?: number[];
}): ArrayBuffer {
	const {
		version=7, houseNumber=1, funds=20000, houseValue=5000,
		friendCount=3, flags=FAMI_HAS_PHONE|FAMI_IN_HOUSE|FAMI_USER_CREATED,
		memberGuids=[0xABCD1234],
	} = opts;

	// version=7 (current): houseNumber + creationOrder + funds + houseValue + friendCount + flags + members
	const parts: Uint8Array[] = [
		reconHdr(version, 'FAMI'),
		i32(houseNumber),
		// version >= 1: creationOrder
		i32(0),
		// version >= 2: funds, houseValue, friendCount
		i32(funds), i32(houseValue), i32(friendCount),
		// version >= 7: flags
		i32(flags),
		// DoContainerStream: count + guids
		u32(memberGuids.length),
		...memberGuids.map(u32),
	];
	return cat(...parts);
}

// ─── NBRS fixtures ───────────────────────────────────────────────────────────

/** Build the 80-int16 PersonData block for the base game (nver >= 3). */
function personDataBlock(values: Record<number, number> = {}): Uint8Array {
	const out = new Uint8Array(PERSON_DATA_FIELDS * 2);
	const v = new DataView(out.buffer);
	for (const [idx, val] of Object.entries(values)) {
		v.setInt16(Number(idx)*2, val, true);
	}
	return out;
}

function buildNeighbour(opts: {
	nver?: number;
	outerVersion?: number;
	originalFileName?: string;
	currentHouse?: number;
	personDataVersion?: number;
	personValues?: Record<number, number>;
	neighborId?: number;
	guid?: number;
}): Uint8Array {
	const {
		nver=4, outerVersion=40, originalFileName='B001MAFit_01',
		currentHouse=1, personDataVersion=5,
		personValues={}, neighborId=1, guid=0x00000001,
	} = opts;

	const parts: Uint8Array[] = [];
	// ptrSet = 1 (valid slot)
	parts.push(i32(1));
	// nver (only if outerVersion >= 30)
	if (outerVersion >= 30) parts.push(i32(nver));
	// nver >= 2: originalFileName + currentHouse
	if (nver >= 2) {
		parts.push(reconStr(originalFileName));
		parts.push(i32(currentHouse));
	}
	// nver >= 1: personDataVersion + fData
	if (nver >= 1) {
		parts.push(i32(personDataVersion));
		if (personDataVersion !== 0) {
			if (nver >= 3) {
				parts.push(personDataBlock(personValues));
			} else {
				// 64 int16 + 1 unused = 65 × int16
				const pd64 = new Uint8Array(64 * 2);
				parts.push(pd64);
				parts.push(i16(0)); // unusedAge
			}
		}
	}
	parts.push(i16(neighborId));
	parts.push(u32(guid));
	// RelMatrix::DoStream: mver=-1, then DoPtrVectorStream with 0 elements
	parts.push(i32(-1));  // mver
	parts.push(u32(0));   // 0 relationships

	return new Uint8Array(cat(...parts));
}

function buildNbrs(neighbours: Uint8Array[], version=40): ArrayBuffer {
	return cat(
		reconHdr(version, 'NBRS'),
		u32(neighbours.length),
		...neighbours,
	);
}

// ─── FAMI tests ───────────────────────────────────────────────────────────────

describe('parseFami (source-correct, version=7)', () => {
	it('parses a current-format family chunk', () => {
		const buf = buildFami({});
		const fam = parseFami(buf);
		expect(fam.version).toBe(7);
		expect(fam.houseNumber).toBe(1);
		expect(fam.funds).toBe(20000);
		expect(fam.houseValue).toBe(5000);
		expect(fam.friendCount).toBe(3);
		expect(fam.memberGuids).toHaveLength(1);
		expect(fam.memberGuids[0]).toBe(0xABCD1234);
		expect(fam.hasPhone).toBe(true);
		expect(fam.hasBaby).toBe(false);
		expect(fam.isTownie).toBe(false);
	});

	it('identifies townie (houseNumber === -1)', () => {
		const buf = buildFami({ houseNumber: -1 });
		expect(parseFami(buf).isTownie).toBe(true);
	});

	it('handles empty member list', () => {
		const buf = buildFami({ memberGuids: [] });
		expect(parseFami(buf).memberGuids).toHaveLength(0);
	});

	it('multiple members are all captured', () => {
		const guids = [0x11111111, 0x22222222, 0x33333333];
		const buf = buildFami({ memberGuids: guids });
		const fam = parseFami(buf);
		expect(fam.memberGuids).toHaveLength(3);
		expect(fam.memberGuids[2]).toBe(0x33333333);
	});

	it('parses flags correctly: HAS_PHONE | IN_HOUSE', () => {
		const buf = buildFami({ flags: FAMI_HAS_PHONE | FAMI_IN_HOUSE });
		const fam = parseFami(buf);
		expect(fam.hasPhone).toBe(true);
		expect((fam.flags & FAMI_IN_HOUSE) !== 0).toBe(true);
	});
});

// ─── NBRS tests ───────────────────────────────────────────────────────────────

describe('parseNbrs (source-correct, outerVersion=40, nver=4)', () => {
	it('parses empty chunk', () => {
		const buf = buildNbrs([]);
		const nbrs = parseNbrs(buf, 40);
		expect(nbrs.neighbours).toHaveLength(0);
	});

	it('parses one neighbour with 80-field PersonData', () => {
		const neighbour = buildNeighbour({
			originalFileName: 'B001MAFit_01',
			guid: 0xAABBCCDD,
			personValues: {
				[PersonData.COOKING_SKILL]: 750,
				[PersonData.GENDER]: 0,
				[PersonData.PERSON_AGE]: 1,
				[PersonData.NICE_PERSONALITY]: 600,
			},
			neighborId: 7,
		});
		const buf = buildNbrs([neighbour]);
		const nbrs = parseNbrs(buf, 40);
		expect(nbrs.neighbours).toHaveLength(1);
		const n = nbrs.neighbours[0]!;
		expect(n.originalFileName).toBe('B001MAFit_01');
		expect(n.guid).toBe(0xAABBCCDD);
		expect(n.neighborId).toBe(7);
		expect(n.nver).toBe(4);
		expect(n.personData).not.toBeNull();
		expect(n.personData![PersonData.COOKING_SKILL]).toBe(750);
		expect(n.personData![PersonData.GENDER]).toBe(0);
		expect(n.personData![PersonData.PERSON_AGE]).toBe(1);
		expect(n.personData![PersonData.NICE_PERSONALITY]).toBe(600);
		// PersonData array is exactly 80 elements (base game)
		expect(n.personData!.length).toBe(PERSON_DATA_FIELDS);
		expect(PERSON_DATA_FIELDS).toBe(80);
	});

	it('builds byId and guidToId maps', () => {
		const n1 = buildNeighbour({ neighborId: 3, guid: 0x11111111, originalFileName: 'alice' });
		const n2 = buildNeighbour({ neighborId: 7, guid: 0x22222222, originalFileName: 'bob' });
		const nbrs = parseNbrs(buildNbrs([n1, n2]), 40);
		expect(nbrs.byId.get(3)?.originalFileName).toBe('alice');
		expect(nbrs.byId.get(7)?.originalFileName).toBe('bob');
		expect(nbrs.guidToId.get(0x11111111)).toBe(3);
		expect(nbrs.guidToId.get(0x22222222)).toBe(7);
	});

	it('sorts neighbours by neighborId', () => {
		const n1 = buildNeighbour({ neighborId: 9, guid: 0x1, originalFileName: 'z' });
		const n2 = buildNeighbour({ neighborId: 2, guid: 0x2, originalFileName: 'a' });
		const nbrs = parseNbrs(buildNbrs([n1, n2]), 40);
		expect(nbrs.neighbours[0]!.neighborId).toBe(2);
		expect(nbrs.neighbours[1]!.neighborId).toBe(9);
	});

	it('null slot (ptrSet=0) is skipped', () => {
		// Inject a null slot by building raw NBRS with a zero ptrSet slot first
		const nullSlot = i32(0);
		const validNeighbour = buildNeighbour({ neighborId: 5, guid: 0x1 });
		const buf = cat(
			reconHdr(40, 'NBRS'),
			u32(2),          // 2 slots: first null, second valid
			nullSlot,
			validNeighbour,
		);
		const nbrs = parseNbrs(buf, 40);
		expect(nbrs.neighbours).toHaveLength(1);
		expect(nbrs.neighbours[0]!.neighborId).toBe(5);
	});

	it('neighbour with no person data (personDataVersion=0)', () => {
		const n = buildNeighbour({ personDataVersion: 0 });
		const nbrs = parseNbrs(buildNbrs([n]), 40);
		expect(nbrs.neighbours[0]!.personData).toBeNull();
	});

	it('outerVersion < 30 → nver=0, no filename/currentHouse/personData', () => {
		// Build a neighbour with outerVersion=20 (no nver, no filename, no personData)
		const parts: Uint8Array[] = [
			i32(1),            // ptrSet = 1 (valid)
			// nver NOT written when outerVersion < 30
			i16(99),           // fID directly
			u32(0xDEADBEEF),   // fGUID
			i32(-1),           // RelMatrix mver
			u32(0),            // 0 relationships
		];
		const rawNeighbour = new Uint8Array(cat(...parts));
		const buf = cat(reconHdr(20, 'NBRS'), u32(1), rawNeighbour);
		const nbrs = parseNbrs(buf, 20);   // outerVersion=20 → nver=0
		expect(nbrs.neighbours).toHaveLength(1);
		const n = nbrs.neighbours[0]!;
		expect(n.nver).toBe(0);
		expect(n.personData).toBeNull();
		expect(n.originalFileName).toBe('');
		expect(n.neighborId).toBe(99);
		expect(n.guid).toBe(0xDEADBEEF);
	});
});

// ─── resolveFamilies ─────────────────────────────────────────────────────────

describe('resolveFamilies', () => {
	it('maps family guids to neighbour objects', () => {
		const makeN = (neighborId: number, guid: number, name: string): Neighbour => ({
			nver: 4, originalFileName: name, currentHouse: 1,
			personData: null, neighborId, guid, relationships: new Map(),
		});
		const fakeNbrs: NbrsChunk = {
			version: 40,
			neighbours: [makeN(1, 0xAAAA, 'alice'), makeN(2, 0xBBBB, 'bob')],
			byId: new Map([[1, makeN(1, 0xAAAA, 'alice')], [2, makeN(2, 0xBBBB, 'bob')]]),
			guidToId: new Map([[0xAAAA, 1], [0xBBBB, 2]]),
		};
		const fakeFam: FamiChunk = {
			version: 7, houseNumber: 1, creationOrder: 0, funds: 20000,
			houseValue: 0, friendCount: 0, flags: 0, memberGuids: [0xAAAA, 0xBBBB],
			name: '', isTownie: false, hasPhone: false, hasBaby: false,
		};
		const resolved = resolveFamilies(fakeNbrs, [fakeFam]);
		const members = resolved.get(fakeFam.houseNumber);
		expect(members).toHaveLength(2);
		expect(members![0]!.originalFileName).toBe('alice');
		expect(members![1]!.originalFileName).toBe('bob');
	});
});

// ─── PersonData ────────────────────────────────────────────────────────────

describe('PersonData constants (base game, PersonData.h 12/17/99)', () => {
	it('kNumPersonDataFields = 80 (base game, no expansion packs)', () => {
		expect(PERSON_DATA_FIELDS).toBe(80);
	});

	it('has correct indices from PersonData.h enum', () => {
		// Verified against PersonData.h source
		expect(PersonData.NICE_PERSONALITY).toBe(2);    // kPersNice
		expect(PersonData.ACTIVE_PERSONALITY).toBe(3);  // kPersActive
		expect(PersonData.COOKING_SKILL).toBe(10);      // kCookingSkill
		expect(PersonData.MECH_SKILL).toBe(12);         // kRepairSkill
		expect(PersonData.BODY_SKILL).toBe(17);         // kPhysicalSkill
		expect(PersonData.LOGIC_SKILL).toBe(18);        // kLogicSkill
		expect(PersonData.JOB_TYPE).toBe(56);           // kJobType
		expect(PersonData.PERSON_AGE).toBe(58);         // kPersonAge
		expect(PersonData.GENDER).toBe(65);             // kPersonGender
		expect(PersonData.ZODIAC_SIGN).toBe(70);        // kZodiacSign
	});

	it('skill indices fall in range 9–18 (kCleaningSkill to kLogicSkill)', () => {
		for (const [, idx] of ALL_SKILLS) {
			expect(idx).toBeGreaterThanOrEqual(9);
			expect(idx).toBeLessThanOrEqual(18);
		}
	});

	it('personality indices fall in range 2–7', () => {
		for (const [, idx] of PERSONALITY_TRAITS) {
			expect(idx).toBeGreaterThanOrEqual(2);
			expect(idx).toBeLessThanOrEqual(7);
		}
	});

	it('scalePersonData converts 0–1000 to 0–10', () => {
		expect(scalePersonData(0)).toBe(0);
		expect(scalePersonData(1000)).toBe(10);
		expect(scalePersonData(500)).toBe(5);
		expect(scalePersonData(750)).toBe(7.5);
	});

	it('VISIBLE_SKILLS has 7 entries (player-visible in UI)', () => {
		expect(VISIBLE_SKILLS).toHaveLength(7);
	});

	it('ALL_SKILLS has 10 entries (7 visible + gardening, music, literacy)', () => {
		expect(ALL_SKILLS).toHaveLength(10);
	});

	it('PERSONALITY_TRAITS has 6 entries', () => {
		expect(PERSONALITY_TRAITS).toHaveLength(6);
		expect(PERSONALITY_TRAITS[0]![0]).toBe('Nice');
	});

	it('ZODIAC_NAMES[0]="Unknown", [1]="Aries", [12]="Pisces"', () => {
		expect(ZODIAC_NAMES[0]).toBe('Unknown');
		expect(ZODIAC_NAMES[1]).toBe('Aries');
		expect(ZODIAC_NAMES[12]).toBe('Pisces');
	});
});
