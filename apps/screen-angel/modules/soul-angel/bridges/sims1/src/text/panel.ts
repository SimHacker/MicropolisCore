/**
 * The Sims 1 control panel, found by its corners and read with its own font.
 *
 * This is the analysis layer the driver offers upward: give it a frame, get back what the game is
 * currently saying about the thing under the cursor. The game exposes none of this — no
 * accessibility tree, no window text, nothing but pixels — so the pixels are the API.
 *
 * The geometry is Don's, measured in 2004 against an 800x600 window (SimsKit/Simplifier,
 * SimsClient::UpdateView). It is hard-coded on purpose and it is honest about the cost: at any other
 * resolution these numbers are wrong, and the finder says so rather than returning confident
 * nonsense. Making it resolution-independent means finding the panel by its art instead of its
 * coordinates, which is a real piece of work and is not this piece of work.
 */

import type { FontContext, Raster } from '@micropolis/optical-codec';

/**
 * Corner colours of the panel frame, and the columns they sit in.
 *
 * Four samples, two of them nearly black, is a weak signature — but it is a signature at a fixed
 * place in a frame the game redraws identically, and the alternative in 2004 was nothing. The reason
 * it works is that the bottom row is fixed and only the TOP edge moves as the panel grows, so the
 * search is one column scan rather than a search of the frame.
 */
const PANEL = {
	leftX: 241,
	rightX: 799,
	bottomY: 499,
	bottomLeft: [0, 0, 57] as const,
	bottomRight: [0, 0, 41] as const,
	topLeft: [148, 150, 206] as const,
	topRight: [0, 4, 66] as const,
	/** Sum of absolute channel differences allowed when matching a corner. */
	fuzz: 36
};

/** Where the description text starts, relative to the panel's left edge and its top. */
const DESCRIPTION = {
	x: 419,
	yFromTop: 31
};

export interface PanelRegion {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface PanelText {
	region: PanelRegion;
	/** The description block, lines joined with newlines, as the game wrapped them. */
	description: string;
	/** How well the glyphs explain the pixels. Low means the geometry or scale is wrong, not that the text is odd. */
	confidence: number;
}

/**
 * Find the panel, or say why not.
 *
 * Returns null rather than throwing: a frame with no panel in it is the ordinary case — the player
 * is not pointing at anything — and a caller polling a few times a second should not be handling
 * exceptions for that.
 */
export function findPanel(frame: Raster): PanelRegion | null {
	if (!near(frame, PANEL.leftX, PANEL.bottomY, PANEL.bottomLeft)) return null;
	if (!near(frame, PANEL.rightX, PANEL.bottomY, PANEL.bottomRight)) return null;

	for (let y = PANEL.bottomY; y >= 0; y--) {
		if (near(frame, PANEL.leftX, y, PANEL.topLeft) && near(frame, PANEL.rightX, y, PANEL.topRight)) {
			return {
				x: PANEL.leftX,
				y,
				width: PANEL.rightX - PANEL.leftX,
				height: PANEL.bottomY - y
			};
		}
	}
	return null;
}

/** Find the panel and read its description. Null when there is no panel to read. */
export function readPanelText(frame: Raster, font: FontContext): PanelText | null {
	const region = findPanel(frame);
	if (region === null) return null;

	const block = font.readTextBlock(frame, DESCRIPTION.x, region.y + DESCRIPTION.yFromTop, {
		maxX: PANEL.rightX,
		maxY: PANEL.bottomY
	});

	return { region, description: block.text, confidence: block.confidence };
}

function near(frame: Raster, x: number, y: number, want: readonly [number, number, number]): boolean {
	if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) return false;
	const i = (y * frame.width + x) * 4;
	const delta =
		Math.abs(frame.data[i] - want[0]) + Math.abs(frame.data[i + 1] - want[1]) + Math.abs(frame.data[i + 2] - want[2]);
	return delta <= PANEL.fuzz;
}

/**
 * What the caller has to hold up before any of this means anything.
 *
 * Stated as data rather than prose so a driver can check it and refuse, instead of reading garbage
 * out of a scaled window and reporting it as the game's text.
 */
export const PANEL_ASSUMPTIONS = {
	windowWidth: 800,
	windowHeight: 600,
	scale: 1,
	why: 'The coordinates were measured against an 800x600 client area at native scale. Anything else moves the panel and the recogniser reads noise.'
} as const;
