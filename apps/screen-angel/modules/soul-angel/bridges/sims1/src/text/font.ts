/**
 * The faces this bridge reads and draws with, out of assets/interface.fontpack.
 *
 * One file holds all of them: the eleven sizes of the game's own interface face, and the 2004
 * Simplifier capture of the same face measured by hand off a screenshot. Everything is coverage —
 * how much of each pixel a letter covers — which is what makes one face enough for every panel:
 * colour arrives when text is drawn, so the reader fits the colour instead of being told it.
 *
 *   sims1Face(size)      A game size. 8 is the control panel, 12 the larger labels, 48 the paused
 *                        banner. Sizes 13, 15, 17 and 19 do not exist; the game does not ship them.
 *
 *   sims1CapturedFace()  The 2004 capture. Kept because it is the only face here that came from
 *                        pixels off a screen rather than from the game's own files, which makes it
 *                        the honest test that the reader works on screenshots.
 *
 * Which size the panel uses was not written down anywhere. It was recovered by comparing the 2004
 * capture against every size the game ships (tools/identify-font.ts): size 8 matches at 0.877 mean
 * intersection-over-union once the faintest coverage is thresholded away, and nothing else is close.
 * The two faces agree independently on a 16-row line box with the baseline 13 rows down. See
 * FONT-RECOGNITION.yml.
 *
 * Read from disk rather than imported, because a pack is a generated asset and importing binary
 * differs between the bundler, the test runner and Node. One readFileSync at first use is cheaper
 * than three configurations that have to agree.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { decodeFontPackNode } from '@micropolis/optical-codec/node/pack';
import { createFontContext, type CoverageFont, type FontContext, type FontPack, type Template } from '@micropolis/optical-codec';

/** The size the control panel draws its description in. */
export const PANEL_FONT_SIZE = 8;

/** The name the 2004 hand-measured face goes by inside the pack. */
export const CAPTURED_FACE = 'Simplifier2004';

/**
 * Which characters the reader is allowed to see.
 *
 * The pack carries every glyph the localisations need — 222 of them, including accents, currency and
 * superscripts — where an English interface draws about ninety. Offering only the ninety is about a
 * quarter faster and narrows the field of things a letter could be confused with. Widen it when
 * reading a localised install: that is a language question and belongs to whoever knows the
 * language, not to a default.
 */
export const ALPHABETS = {
	/** Printable ASCII: what the English interface can put on screen. */
	english: (code: number) => code >= 32 && code <= 126,
	/** Everything in the file, for a localisation that needs it and can tolerate the ambiguity. */
	everything: () => true
} as const;

const here = dirname(fileURLToPath(import.meta.url));
export const FONT_PACK_PATH = join(here, '..', '..', 'assets', 'interface.fontpack');

export const ANCHOR_PACK_PATH = join(here, '..', '..', 'assets', 'interface.anchors');

let pack: FontPack | null = null;
let anchors: Template[] | null = null;
const contexts = new Map<string, FontContext>();

export function hasFontPack(): boolean {
	return existsSync(FONT_PACK_PATH);
}

export function sims1FontPack(): FontPack {
	if (pack === null) {
		if (!hasFontPack()) {
			throw new Error(
				`no font pack at ${FONT_PACK_PATH}. Build one: pnpm --filter @screen-angel/soul-bridge-sims1 ` +
					`import-fonts -- --from <Sims 1>/UIGraphics/Fonts`
			);
		}
		pack = decodeFontPackNode(new Uint8Array(readFileSync(FONT_PACK_PATH)));
	}
	return pack;
}

/**
 * The anchor templates: crops of the panel's own art that know where in the layout they sit.
 *
 * Empty rather than throwing when the pack is not built, because the panel finder has a second way in
 * — the 2004 corner colours — and losing resolution independence is not the same as being broken.
 */
export function sims1Anchors(): Template[] {
	if (anchors === null) {
		anchors = existsSync(ANCHOR_PACK_PATH)
			? (decodeFontPackNode(new Uint8Array(readFileSync(ANCHOR_PACK_PATH))).templates ?? [])
			: [];
	}
	return anchors;
}

export function hasAnchors(): boolean {
	return existsSync(ANCHOR_PACK_PATH);
}

/** The game's interface face at one point size. */
export function sims1Face(size: number): CoverageFont {
	const face = sims1FontPack().faces.find((f) => f.size === size && f.name !== CAPTURED_FACE);
	if (face === undefined) {
		const sizes = sims1FontPack()
			.faces.filter((f) => f.name !== CAPTURED_FACE)
			.map((f) => f.size)
			.join(', ');
		throw new Error(`the pack has no game face at size ${size}; it has ${sizes}`);
	}
	return face;
}

/** The 2004 hand-measured face, as coverage like everything else. */
export function sims1CapturedFace(): CoverageFont {
	const face = sims1FontPack().faces.find((f) => f.name === CAPTURED_FACE);
	if (face === undefined) throw new Error(`the pack has no ${CAPTURED_FACE} face`);
	return face;
}

/**
 * A face ready to draw with, measure with and read with, in Canvas's vocabulary.
 *
 * Cached, because preparing a face expands every glyph's coverage over its bounding box and that is
 * per-face work nobody should pay for twice.
 */
export function sims1Font(size: number, alphabet: (code: number) => boolean = ALPHABETS.english): FontContext {
	const key = `${size}:${alphabet === ALPHABETS.english ? 'english' : 'other'}`;
	const already = contexts.get(key);
	if (already !== undefined) return already;
	const context = createFontContext(sims1Face(size), { alphabet, textBaseline: 'top' });
	contexts.set(key, context);
	return context;
}

/** The control panel's face: what reads the description text under a Sim's portrait. */
export function sims1PanelFont(): FontContext {
	return sims1Font(PANEL_FONT_SIZE);
}

export function sims1CapturedFont(alphabet: (code: number) => boolean = ALPHABETS.english): FontContext {
	const key = `captured:${alphabet === ALPHABETS.english ? 'english' : 'other'}`;
	const already = contexts.get(key);
	if (already !== undefined) return already;
	const context = createFontContext(sims1CapturedFace(), { alphabet, textBaseline: 'top' });
	contexts.set(key, context);
	return context;
}
