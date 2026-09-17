/**
 * The Sims 1 control panel, found by the game's own art and read with the game's own font.
 *
 * This is the analysis layer the driver offers upward: give it a frame, get back what the game is
 * currently saying about the thing under the cursor. The game exposes none of this — no accessibility
 * tree, no window text, nothing but pixels — so the pixels are the API.
 *
 * WHY THE COORDINATES ARE EDGE-RELATIVE
 *
 * The panel is bottom-anchored and never scaled by the game. From its own source:
 *
 *   SimsApp.cpp    area.top = area.bottom - 150, full width. The HUD hangs off the bottom edge.
 *   WinCPanel.cpp  the left column is 220 wide; every subpanel sits at x 220, is 100 tall, and is as
 *                  wide as the window allows. PanelBack.bmp is 804 across because 1024 - 220 is 804.
 *
 * So a y measured down from the top of an 800x600 window is worthless at 1024x768, while the same
 * point measured UP FROM THE BOTTOM is right at both. That is the whole difference between the 2004
 * numbers and these. Don's own code had the correction sketched — gBigScreen with yExtra of 768 minus
 * 600 — and left it switched off, commented "currently disabled and not supported".
 *
 * TWO WAYS TO FIND IT
 *
 *   art       Correlate a crop of the panel's own background against the bottom of the frame
 *             (assets/interface.anchors). The art knows where it sits, so a match hands back the
 *             window's left edge, its bottom row, and the scale it was drawn at. This survives a
 *             window that is not the whole frame, a stretched capture, and a recoloured skin.
 *
 *   colours   The 2004 signature: four corner pixels of the description strip, two of them nearly
 *             black. Kept because it needs no assets and because it is what the Simplifier did, and
 *             used only when there are no anchors to hand.
 *
 * Both report which one answered, because a caller deciding whether to trust a reading deserves to
 * know whether it came from art or from four pixels.
 */

import { cropRaster, matchTemplate, scaleRaster, type FontContext, type Raster, type Template } from '@micropolis/optical-codec';

/**
 * The layout, in the terms the game places it in.
 *
 * x is from the left edge of the game window, y is rows up from its last row. Both are in the game's
 * own pixels, before any scale the capture applied.
 */
const LAYOUT = {
	/** cWinCPanel: the whole HUD hangs this far off the bottom. */
	panelHeight: 150,
	/** cWinViewControl, the left column, which is the same width at every resolution. */
	leftColumnWidth: 220,
	/** Where the description strip's own frame is: left edge fixed, right edge follows the window. */
	stripLeftX: 241,
	stripRightFromRight: 0,
	/** The strip's bottom, 100 rows above the last row of the window. */
	stripBottomFromBottom: 100,
	/** Where the description text starts, relative to the strip's left edge and its top. */
	description: { x: 419, yFromTop: 31 }
} as const;

/**
 * Corner colours of the description strip's frame, sampled where the 2004 code sampled them.
 *
 * Four samples, two of them nearly black, is a weak signature — but it is a signature at a fixed
 * place in a frame the game redraws identically. The reason it works at all is that the bottom row is
 * fixed and only the TOP edge moves as the strip grows, so the search is one column scan.
 */
const CORNERS = {
	bottomLeft: [0, 0, 57] as const,
	bottomRight: [0, 0, 41] as const,
	topLeft: [148, 150, 206] as const,
	topRight: [0, 4, 66] as const,
	/** Sum of absolute channel differences allowed when matching a corner. */
	fuzz: 36
};

/** Where the game's window is in this frame, and what it was drawn at. */
export interface GameWindow {
	/** Frame x of the window's left edge. */
	left: number;
	/** Frame x of its right edge. */
	right: number;
	/** Frame y of its last row. */
	bottomRow: number;
	/** Capture scale. 1 means native pixels, which is the only case the game itself produces. */
	scale: number;
	found: 'art' | 'colours';
	/** Correlation score when art answered; 0 when the corner colours did. */
	score: number;
	anchor?: string;
}

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
	/** How the panel was located, so a caller can weigh the reading. */
	window: GameWindow;
}

/**
 * Find the game's window by its own panel art.
 *
 * Only the bottom of the frame is searched, since that is the only place the HUD can be, and the
 * anchors are tried in the order given: the first one that correlates wins, and the rest are not
 * work anybody has to do. Returns null when none of them is there, which is the right answer for a
 * frame of something else.
 */
export function findGameWindowByArt(frame: Raster, anchors: Template[], scales?: number[]): GameWindow | null {
	// Tall enough for the panel plus a little, so a search does not wander up into the game view.
	const stripHeight = Math.min(frame.height, Math.round(LAYOUT.panelHeight * Math.max(1, ...(scales ?? [1]))) + 64);
	const region = { x: 0, y: frame.height - stripHeight, width: frame.width, height: stripHeight };

	for (const anchor of anchors) {
		if (anchor.anchor === undefined) continue;
		const match = matchTemplate(frame, anchor, { region, scales });
		if (match === null) continue;

		const { x: ax, y: ay, fromBottom } = anchor.anchor;
		const left = match.x - Math.round(ax * match.scale);
		// A bottom-anchored y is negative: the art's top is that many rows above the window's last row.
		const bottomRow = fromBottom === true ? match.y + Math.round(Math.abs(ay) * match.scale) - 1 : frame.height - 1;

		return {
			left,
			right: frame.width - 1,
			bottomRow,
			scale: match.scale,
			found: 'art',
			score: match.score,
			anchor: anchor.name
		};
	}
	return null;
}

/** The 2004 fallback: assume the frame is the window at native scale, and check the corner colours. */
export function findGameWindowByColours(frame: Raster): GameWindow | null {
	const window: GameWindow = { left: 0, right: frame.width - 1, bottomRow: frame.height - 1, scale: 1, found: 'colours', score: 0 };
	return findPanel(frame, window) === null ? null : window;
}

/**
 * Find the description strip, or say why not.
 *
 * Returns null rather than throwing: a frame with nothing in the strip is the ordinary case — the
 * player is not pointing at anything — and a caller polling a few times a second should not be
 * handling exceptions for that.
 */
export function findPanel(frame: Raster, window: GameWindow): PanelRegion | null {
	const scale = window.scale;
	const leftX = window.left + Math.round(LAYOUT.stripLeftX * scale);
	const rightX = window.right - Math.round(LAYOUT.stripRightFromRight * scale);
	const bottomY = window.bottomRow - Math.round(LAYOUT.stripBottomFromBottom * scale);

	if (!near(frame, leftX, bottomY, CORNERS.bottomLeft)) return null;
	if (!near(frame, rightX, bottomY, CORNERS.bottomRight)) return null;

	for (let y = bottomY; y >= 0; y--) {
		if (near(frame, leftX, y, CORNERS.topLeft) && near(frame, rightX, y, CORNERS.topRight)) {
			return { x: leftX, y, width: rightX - leftX, height: bottomY - y };
		}
	}
	return null;
}

/**
 * Locate the panel however it can be located: art first, corner colours if there is no art to hand.
 */
export function locatePanel(frame: Raster, anchors?: Template[]): GameWindow | null {
	if (anchors !== undefined && anchors.length > 0) {
		const byArt = findGameWindowByArt(frame, anchors);
		if (byArt !== null) return byArt;
	}
	return findGameWindowByColours(frame);
}

/**
 * Find the panel and read its description.
 *
 * A capture at any scale other than 1 is decimated back to the game's own pixels before reading,
 * because the font is a set of exact coverage masks and there is nothing to match against a smoothed
 * copy of them. Nearest-neighbour upscaling comes back exactly; a smooth upscale comes back blurred
 * and says so in the confidence, which is the behaviour we want and not a promise that it will work.
 */
export function readPanelText(frame: Raster, font: FontContext, anchors?: Template[]): PanelText | null {
	const window = locatePanel(frame, anchors);
	if (window === null) return null;

	const region = findPanel(frame, window);
	if (region === null) return null;

	// Read in the game's own pixels, with the strip's top-left as the origin: one set of coordinates
	// whatever the window size or the capture scale, and the numbers are the 2004 measurements minus
	// the strip's own offset.
	const strip = cropRaster(frame, region.x, region.y, region.width, region.height);
	const source = window.scale === 1 ? strip : scaleRaster(strip, 1 / window.scale);

	const block = font.readTextBlock(source, LAYOUT.description.x - LAYOUT.stripLeftX, LAYOUT.description.yFromTop, {
		maxX: source.width,
		maxY: source.height
	});

	return { region, description: block.text, confidence: block.confidence, window };
}

function near(frame: Raster, x: number, y: number, want: readonly [number, number, number]): boolean {
	if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) return false;
	const i = (y * frame.width + x) * 4;
	const delta =
		Math.abs(frame.data[i] - want[0]) + Math.abs(frame.data[i + 1] - want[1]) + Math.abs(frame.data[i + 2] - want[2]);
	return delta <= CORNERS.fuzz;
}

/**
 * What the caller has to hold up before any of this means anything.
 *
 * Stated as data rather than prose so a driver can check it and refuse, instead of reading garbage
 * out of a scaled window and reporting it as the game's text.
 */
export const PANEL_ASSUMPTIONS = {
	resolutions: 'Any. The game itself only offers 800x600 and 1024x768, and the geometry here is measured off the window edges rather than assuming either.',
	scale: 'Native pixels to read text. A stretched capture is located but decimated before reading, and a smooth stretch will show up as low confidence.',
	the_frame_may_be_larger_than_the_window: 'With anchors, yes: the art says where the window is. With the corner colours only, the frame is assumed to BE the window.',
	why: 'The panel is bottom-anchored at a fixed 150 pixels and never scaled by the game, so every rectangle here is an offset from a window edge.'
} as const;
