/**
 * PersonData — index constants for the 80-short fData[] array in Sims 1.
 *
 * Source: PersonData.h ($Header: /SimsBuild/Code/msrc/Objects/PersonData.h 12  12/17/99)
 * `kNumPersonDataFields = 80` — the array is 80 StdPrm (int16) elements.
 *
 * Source: PersonData.h from **The Sims base game (first release, no expansion packs)**.
 * Expansion packs may add indices beyond 80; those are NOT documented here.
 * Consult SimObliterator docs and online community resources for expansion data.
 *
 * Storage on disk (Neighbor::DoStream in Neighbor.cpp):
 *   nver >= 3: Recon16(fData, 80)    → 80 × int16 = 160 bytes  (0xA0 bytes)
 *   nver 1–2:  Recon16(fData, 64) + 1 unused int16 → 65 × int16
 *   nver 0:    no person data written (save version < 30)
 *
 * Note on SimObliterator Python: reads up to 88 ints16 then caps. The cap is
 * wrong for the base game (source says 80). The 88 may account for expansion
 * packs which extended fData[]. For base-game saves use 80.
 *
 * NOTE: These are Sims 1 (base game) indices. The Sims Online (FreeSO/TSO)
 * uses a completely different VMPersonDataVariable layout.
 *
 * Values are signed int16; skills/personality in 0–1000 (display 0–10).
 */
/** Base game: kNumPersonDataFields = 80 (PersonData.h 12/17/99). */
export const PERSON_DATA_FIELDS_BASE = 80;

/**
 * Expansion packs use nver=0x0A (vs base game nver=4) and write 0x200 bytes
 * (256 × int16). SimObliterator caps at 88 when reading expansion saves,
 * suggesting EPs added ~8 fields at indices 80–87.
 * Exact EP field mappings are undocumented in public sources; treat as reserved.
 */
export const PERSON_DATA_FIELDS_EP_MAX = 88;

/** Canonical constant for the base game. Use PERSON_DATA_FIELDS_EP_MAX when
 *  reading saves from installs with expansion packs (nver >= 5). */
export const PERSON_DATA_FIELDS = PERSON_DATA_FIELDS_BASE;
export const PersonData = {
	// Runtime state
	IDLE_STATE:          0,
	NPC_FEE_AMOUNT:      1,

	// Personality traits (0–1000, display 0–10)
	NICE_PERSONALITY:    2,   // grouchy ↔ nice
	ACTIVE_PERSONALITY:  3,   // lazy ↔ active
	GENEROUS_PERSONALITY:4,   // selfish ↔ generous
	PLAYFUL_PERSONALITY: 5,   // serious ↔ playful
	OUTGOING_PERSONALITY:6,   // shy ↔ outgoing
	NEAT_PERSONALITY:    7,   // sloppy ↔ neat

	CURRENT_OUTFIT:      8,

	// Skills (0–1000, display 0–10)
	CLEANING_SKILL:      9,
	COOKING_SKILL:      10,
	CHARISMA_SKILL:     11,   // kSocialSkill
	MECH_SKILL:         12,   // kRepairSkill
	GARDENING_SKILL:    13,
	MUSIC_SKILL:        14,
	CREATIVITY_SKILL:   15,   // kCreativeSkill
	LITERACY_SKILL:     16,
	BODY_SKILL:         17,   // kPhysicalSkill
	LOGIC_SKILL:        18,

	JOB_DATA:           24,

	// Interests (indices 46–55)
	INTEREST_0:         46,
	INTEREST_9:         55,

	JOB_TYPE:           56,   // career track ID; 0 = unemployed
	JOB_STATUS:         57,   // promotion flags
	PERSON_AGE:         58,   // 0 = child, 1 = adult
	SKIN_COLOR:         60,   // 0 = light, 1 = medium, 2 = dark
	FAMILY_NUMBER:      61,
	JOB_PERFORMANCE:    63,
	GENDER:             65,   // 0 = male, 1 = female
	PERSON_IS_GHOST:    68,
	ZODIAC_SIGN:        70,   // 0 = uncomputed, 1–12 = Aries–Pisces
	NON_INTERRUPTIBLE:  71,   // kNonInterruptible
	ROUTE_FOOTPRINT_MASK: 72, // kRouteFootprintMask
	FOOTPRINT_EXTENSION:  73, // kFootprintExtension

	// Indices 74–79: allocated in the 80-element base-game array but
	// NOT enumerated in PersonData.h (12/17/99). The enum jumps from
	// kFootprintExtension (73) directly to kNumPersonDataFields = 80.
	RESERVED_74: 74,
	RESERVED_75: 75,
	RESERVED_76: 76,
	RESERVED_77: 77,
	RESERVED_78: 78,
	RESERVED_79: 79,

	// Indices 80–87: expansion-pack fields (nver=0x0A saves).
	// EP code bumped kNumPersonDataFields beyond 80 and writes 0x200 bytes
	// (256 × int16). SimObliterator caps at 88, implying ~8 EP additions.
	// No EP source is publicly available; these are UNVERIFIED.
	// Community research suggests candidates like pet ownership, fame level,
	// magic skill (Makin' Magic), attraction (Hot Date), etc. — but none
	// are confirmed. Contribute findings to documentation/vitamoo/OBLITERATOR-TYPESCRIPT.md.
	EP_FIELD_80: 80,
	EP_FIELD_81: 81,
	EP_FIELD_82: 82,
	EP_FIELD_83: 83,
	EP_FIELD_84: 84,
	EP_FIELD_85: 85,
	EP_FIELD_86: 86,
	EP_FIELD_87: 87,
} as const;

/** Scale a raw PersonData value (0–1000) to the 0–10 display range. */
export function scalePersonData(raw: number): number {
	return raw / 100;
}

/** The 7 player-visible skills in display order (name → PersonData index). */
export const VISIBLE_SKILLS: ReadonlyArray<readonly [string, number]> = [
	['Cooking',    PersonData.COOKING_SKILL],
	['Mechanical', PersonData.MECH_SKILL],
	['Charisma',   PersonData.CHARISMA_SKILL],
	['Logic',      PersonData.LOGIC_SKILL],
	['Body',       PersonData.BODY_SKILL],
	['Creativity', PersonData.CREATIVITY_SKILL],
	['Cleaning',   PersonData.CLEANING_SKILL],
];

/** All 10 engine skills including internal/hidden ones. */
export const ALL_SKILLS: ReadonlyArray<readonly [string, number]> = [
	['Cleaning',    PersonData.CLEANING_SKILL],
	['Cooking',     PersonData.COOKING_SKILL],
	['Charisma',    PersonData.CHARISMA_SKILL],
	['Mechanical',  PersonData.MECH_SKILL],
	['Gardening',   PersonData.GARDENING_SKILL],
	['Music',       PersonData.MUSIC_SKILL],
	['Creativity',  PersonData.CREATIVITY_SKILL],
	['Literacy',    PersonData.LITERACY_SKILL],
	['Body',        PersonData.BODY_SKILL],
	['Logic',       PersonData.LOGIC_SKILL],
];

/** Personality trait pairs (name → PersonData index). */
export const PERSONALITY_TRAITS: ReadonlyArray<readonly [string, number]> = [
	['Nice',      PersonData.NICE_PERSONALITY],
	['Active',    PersonData.ACTIVE_PERSONALITY],
	['Generous',  PersonData.GENEROUS_PERSONALITY],
	['Playful',   PersonData.PLAYFUL_PERSONALITY],
	['Outgoing',  PersonData.OUTGOING_PERSONALITY],
	['Neat',      PersonData.NEAT_PERSONALITY],
];

export const ZODIAC_NAMES = [
	'Unknown',    // 0
	'Aries',      // 1
	'Taurus',     // 2
	'Gemini',     // 3
	'Cancer',     // 4
	'Leo',        // 5
	'Virgo',      // 6
	'Libra',      // 7
	'Scorpio',    // 8
	'Sagittarius',// 9
	'Capricorn',  // 10
	'Aquarius',   // 11
	'Pisces',     // 12
] as const;
