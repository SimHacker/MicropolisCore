/**
 * The driver's reading layer: what does the game currently say?
 *
 * The Sims 1 answers nothing when asked, so this asks the screen instead. One frame, the panel found
 * by the game's own art, the description read with the game's own font, and a plain answer —
 * including the plain answer "I could not read that", which matters more than it sounds. A recogniser
 * that returns confident nonsense when the window is not what it expected is worse than one that
 * returns nothing, since everything downstream would then be acting on invented text.
 *
 * Pull, not push. Nothing here starts a timer: the caller decides when it is worth a frame, because
 * the caller is the one that knows whether a player is pointing at something or the game is paused
 * in the background (RECOGNIZER.yml, when_to_look).
 */

import type { AngelServices, WindowInfo } from '@screen-angel/host-api';

import { sims1Anchors, sims1PanelFont } from './font';
import { readPanelText, type PanelText } from './panel';

export interface PanelReading {
	/** What the game says, or null when there was no panel or it could not be read. */
	panel: PanelText | null;
	/** Why, when there is nothing. Written for a person reading a log, not for a switch statement. */
	because?: string;
	/** Frame size, so a wrong-resolution complaint can be checked against what was actually grabbed. */
	frame: { width: number; height: number };
}

/**
 * How low a read can score before it is reported as a failure instead of as text.
 *
 * The score is how well the glyphs' own coverage explains the pixels, and a native-scale frame of
 * text drawn with this font scores close to 1.0 — it is the same arithmetic the game's blitter did,
 * run backwards. Anything much below that is not slightly-wrong text, it is the recogniser sampling
 * the wrong rows and assembling letters out of noise. Generous rather than tight, because a scaled
 * or blurred frame collapses far past it.
 */
const MIN_CONFIDENCE = 0.85;

export function createPanelReader(angel: AngelServices) {
	const font = sims1PanelFont();
	// Absent in a checkout with no anchors built: the reader falls back to the 2004 corner colours,
	// which need no assets and assume the frame is the window at native scale.
	const anchors = sims1Anchors();

	return {
		font,
		anchors,

		/** One frame, one answer. */
		async read(window?: WindowInfo): Promise<PanelReading> {
			// The window server's id where the platform gave us one, the focused window otherwise.
			// Aiming at the window rather than the screen keeps the frame in the game's own
			// coordinates, which is what every measured offset below is relative to.
			const frame = await angel.grabFrame({ window: window?.windowId ?? 'focused' });
			const size = { width: frame.width, height: frame.height };

			const panel = readPanelText(frame, font, anchors);
			if (panel === null) {
				return {
					panel: null,
					frame: size,
					because:
						anchors.length > 0
							? "no control panel in this frame: neither the panel's own art nor its corner colours are there"
							: 'no control panel in this frame, looking only at the corner colours since no anchors are built'
				};
			}
			if (panel.confidence < MIN_CONFIDENCE) {
				return {
					panel: null,
					frame: size,
					because:
						`found the panel by ${panel.window.found} at scale ${panel.window.scale} but the glyphs only explain ` +
						`${(panel.confidence * 100).toFixed(0)}% of the pixels, which is noise rather than text`
				};
			}

			return { panel, frame: size };
		}
	};
}

export type PanelReader = ReturnType<typeof createPanelReader>;
