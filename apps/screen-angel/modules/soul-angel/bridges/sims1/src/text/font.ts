/**
 * The game's own fonts, loaded once each.
 *
 * Two kinds, and the difference matters:
 *
 *   sims1PanelFont()   VariableSans_08, lifted out of the game's UIGraphics/Fonts by tools/
 *                      compile-gzfont.ts. Coverage masks — the real thing, exact anti-aliasing,
 *                      correct advances, and colour-independent, so it reads text over any panel art
 *                      the game or a custom skin puts behind it.
 *
 *   sims1CapturedFont()  The 2004 Simplifier atlas: the same face measured by hand off a screenshot,
 *                      with the colours it happened to be drawn in that day. Kept because it is the
 *                      historical artifact and because it needs no installation to be present, which
 *                      makes it the font the tests can always rely on.
 *
 * Which size the panel uses was not written down anywhere. It was recovered by comparing the 2004
 * capture against every size the game ships (tools/identify-font.ts): size 8 matches at 0.877 mean
 * intersection-over-union once the faintest coverage is thresholded away, and no other size comes
 * close. See FONT-RECOGNITION.yml.
 *
 * Read from disk rather than imported, because these are generated assets and importing binary or
 * JSON differs between the bundler, the test runner and Node. One readFileSync at first use is
 * cheaper than three configurations that have to agree.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	loadBitmapFont,
	prepareCoverageFont,
	unpackCoverageFont,
	type BitmapFont,
	type CoverageFont,
	type PreparedFont
} from '@micropolis/optical-codec';

/** The size the control panel draws its description in. */
export const PANEL_FONT_SIZE = 8;

/**
 * Which characters the reader is allowed to see.
 *
 * The font files carry every glyph the localisations need — 222 of them, including accents, currency
 * and superscripts — where an English interface draws about ninety. Offering only the ninety is
 * about a quarter faster and narrows the field of things a letter could be confused with. Widen it
 * when reading a localised install: that is a language question and belongs to whoever knows the
 * language, not to a default.
 */
export const ALPHABETS = {
	/** Printable ASCII: what the English interface can put on screen. */
	english: (code: number) => code >= 32 && code <= 126,
	/** Everything in the file, for a localisation that needs it and can tolerate the ambiguity. */
	everything: () => true
} as const;

const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', '..', 'assets');

const packed = new Map<number, CoverageFont>();
const prepared = new Map<string, PreparedFont>();
let captured: BitmapFont | null = null;

/** Path a compiled game font would be at, whether or not it is there. */
export function gameFontPath(size: number): string {
	return join(assets, 'fonts', `VariableSans_${String(size).padStart(2, '0')}.gzf`);
}

export function hasGameFont(size: number): boolean {
	return existsSync(gameFontPath(size));
}

/**
 * One size of the game's interface font.
 *
 * Throws with the command that produces it, because the fix is one line and a missing asset should
 * not read as a broken build.
 */
export function sims1GameFont(size: number): CoverageFont {
	const already = packed.get(size);
	if (already !== undefined) return already;
	const path = gameFontPath(size);
	if (!existsSync(path)) {
		throw new Error(
			`no compiled font for size ${size}. Run: pnpm --filter @screen-angel/soul-bridge-sims1 gzfont -- ` +
				`--from <Sims 1>/UIGraphics/Fonts`
		);
	}
	const font = unpackCoverageFont(new Uint8Array(readFileSync(path)));
	packed.set(size, font);
	return font;
}

/** The same, with its coverage expanded for matching. Prepared once, since it is per-font work. */
export function sims1PreparedFont(size: number, alphabet: (code: number) => boolean = ALPHABETS.english): PreparedFont {
	const key = `${size}:${alphabet === ALPHABETS.english ? 'english' : 'other'}`;
	const already = prepared.get(key);
	if (already !== undefined) return already;
	const font = prepareCoverageFont(sims1GameFont(size), (glyph) => alphabet(glyph.code));
	prepared.set(key, font);
	return font;
}

export function sims1PanelFont(): PreparedFont {
	return sims1PreparedFont(PANEL_FONT_SIZE);
}

/** The 2004 hand-measured atlas, in the colours it was captured in. */
export function sims1CapturedFont(): BitmapFont {
	if (captured === null) {
		captured = loadBitmapFont(JSON.parse(readFileSync(join(assets, 'ui-font.json'), 'utf8')));
	}
	return captured;
}
