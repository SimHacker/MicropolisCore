/**
 * PersonData — index constants for the 88-short fData[] array stored in
 * Sims 1 NBRS chunks per neighbour.
 *
 * Source: PersonData.h (12/17/99, Maxis). Indices verified against the
 * SimObliterator Python implementation (save_manager.py, fixed 2026-02-07).
 *
 * NOTE: These are Sims 1 indices. The Sims Online (FreeSO) uses a different
 * VMPersonDataVariable layout — do not confuse the two.
 *
 * Values are signed int16, range 0–1000 for skills/personality (display 0–10),
 * and small ints for categorical fields.
 */
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
