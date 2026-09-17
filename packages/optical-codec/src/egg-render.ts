/**
 * Drawing an egg, so there is something to read before there is a game to read it in.
 *
 * This is not the game's art. It is a stand-in with the properties the format depends on — cap
 * polarity, cap height as the metric, band order — so the reader can be built and tested against
 * images we can generate a thousand of. When the real DGRP sprites exist this becomes the reference
 * the sprites are checked against.
 *
 * EVERY SLAB IS ONE BAND TALL
 *
 * The caps included. That is what lets the sentinel carry the metric: measure the white run and you
 * know the band height at this zoom, which is the number the reader needs before it can slice
 * anything. Two adjacent bands of the same digit are one run of double height, so a reader that
 * segmented on colour change would silently drop a digit — it has to step by a measured height
 * instead, and the cap is where the measurement comes from.
 *
 * Glow and levitation are drawn because the player sees them. Nothing in the reader may look at
 * either (RECOGNIZER.yml, lighting_is_never_a_signal).
 */

import { ALPHABET, CAP_BOTTOM, CAP_TOP, digitsToColours, encodeDigits, prefixLength, type BandAlphabet, type EggCode } from './egg-code';
import { fillEllipse, fillRect, type RGB, type Raster } from './raster';

export interface EggStyle {
	/** Height of one band in pixels, and of each cap. The whole geometry follows from this. */
	bandHeight: number;
	/** Half-width of the widest part of the body. */
	radius: number;
	/** How much of the stack this zoom resolves — a whole number of groups (egg-code.ts, GROUPS). */
	zoom: 'far' | 'mid' | 'near' | 'full';
	/**
	 * Draw exactly this many bands, whatever the zoom says.
	 *
	 * For drawing a stack that stops mid-group, which authored art never does and a resample can
	 * certainly produce. The reader has to cope with it, so there has to be a way to draw one.
	 */
	bands?: number;
	/** Which colours the bands come from. */
	alphabet: BandAlphabet;
	/** Cosmetic. Drawn for the player, invisible to the reader. */
	lit?: 'dark' | 'steady' | 'breathing';
	/** Cosmetic. Pixels of levitation, with a base left behind on the floor. */
	levitation?: number;
	/** Split each band into arcs, the way the closest zoom does. Leading arc dominates. */
	segments?: number;
	/** Taper the silhouette into an egg. Off gives a cylinder, which is the easy case for a reader. */
	tapered?: boolean;
}

export const DEFAULT_STYLE: EggStyle = {
	bandHeight: 6,
	radius: 9,
	zoom: 'full',
	alphabet: ALPHABET,
	lit: 'steady',
	levitation: 0,
	segments: 1,
	tapered: true
};

export interface EggPlacement {
	/** Centre of the egg's footprint on the floor. */
	x: number;
	/** The floor line the egg stands on, before any levitation. */
	y: number;
}

export interface DrawnEgg {
	/** Where the reader should find it, including the caps. */
	box: { x: number; y: number; width: number; height: number };
	/** The digits actually drawn, which at a coarse zoom is a prefix of the full code. */
	digits: number[];
	code: EggCode;
	/** Band height as drawn, which is what the reader has to recover from the caps. */
	bandHeight: number;
}

/**
 * Draw one egg and answer where it landed.
 *
 * The returned box is ground truth for tests: a recognizer that finds the egg somewhere else is
 * wrong even if it decodes the right number.
 */
export function drawEgg(target: Raster, code: EggCode, place: EggPlacement, style: Partial<EggStyle> = {}): DrawnEgg {
	const s: EggStyle = { ...DEFAULT_STYLE, ...style };
	const digits = encodeDigits(code, s.alphabet).slice(0, s.bands ?? prefixLength(s.zoom));
	const colours = digitsToColours(digits, s.alphabet);

	const band = Math.max(1, Math.round(s.bandHeight));
	// Two caps and the bands. The caps are the delimiters, the metric, and the colour references.
	const bodyHeight = band * (colours.length + 2);
	const lift = s.levitation ?? 0;

	if (lift > 0) drawBase(target, place.x, place.y, s.radius);

	const bottom = place.y - lift;
	const top = bottom - bodyHeight;
	const profile = { top, height: bodyHeight, radius: s.radius, tapered: s.tapered !== false };

	// Behind the body, never over it. A halo that touched a band would make the read depend on the
	// lighting state, which is the one thing the format is not allowed to do.
	if (s.lit && s.lit !== 'dark') drawGlow(target, place.x, top + bodyHeight / 2, s.radius, bodyHeight, s.lit);

	let y = top;
	drawSlab(target, place.x, y, band, profile, CAP_TOP, 1);
	y += band;

	for (const colour of colours) {
		drawSlab(target, place.x, y, band, profile, colour, s.segments ?? 1);
		y += band;
	}

	drawSlab(target, place.x, y, band, profile, CAP_BOTTOM, 1);

	return {
		box: {
			x: Math.round(place.x - s.radius),
			y: Math.round(top),
			width: Math.round(s.radius * 2),
			height: bodyHeight
		},
		digits,
		code,
		bandHeight: band
	};
}

interface Profile {
	top: number;
	height: number;
	radius: number;
	tapered: boolean;
}

/**
 * One horizontal slice of the solid of revolution.
 *
 * The width tapers with height so the silhouette is an egg rather than a stack of blocks, which is
 * what makes the shape rotation-invariant in the game and what makes the template match cheap here.
 */
function drawSlab(target: Raster, cx: number, y: number, height: number, profile: Profile, colour: RGB, segments: number): void {
	for (let row = 0; row < height; row++) {
		const yy = y + row;
		const t = (yy - profile.top) / profile.height; // 0 at the top cap, 1 at the bottom
		const w = profile.tapered ? profile.radius * silhouette(t) : profile.radius;
		if (segments <= 1) {
			fillRect(target, cx - w, yy, w * 2, 1, colour);
			continue;
		}
		// Arcs across the visible face. The leading arc keeps the band's coarse value, so a segmented
		// band collapses to a legal read rather than to a blur of two values.
		const arc = (w * 2) / segments;
		for (let i = 0; i < segments; i++) {
			const shade = i === 0 ? colour : dim(colour, 1 - i * 0.12);
			fillRect(target, cx - w + i * arc, yy, arc, 1, shade);
		}
	}
}

/** Egg profile: narrow at the top, widest below the middle, rounded at the bottom. */
function silhouette(t: number): number {
	const clamped = Math.min(1, Math.max(0, t));
	return 0.55 + 0.45 * Math.sin(Math.PI * (0.15 + 0.75 * clamped));
}

function dim(c: RGB, factor: number): RGB {
	return [c[0] * factor, c[1] * factor, c[2] * factor];
}

/** The shadow-and-socket an egg leaves behind when it rises, so a grid of them reads evenly. */
function drawBase(target: Raster, cx: number, baseY: number, radius: number): void {
	fillEllipse(target, cx, baseY, radius * 0.9, radius * 0.35, [40, 38, 44]);
	fillEllipse(target, cx, baseY - 1, radius * 0.6, radius * 0.22, [78, 74, 84]);
}

/** Cosmetic halo. Additive, cheap, and never consulted by anything downstream. */
function drawGlow(target: Raster, cx: number, cy: number, radius: number, bodyHeight: number, lit: 'steady' | 'breathing'): void {
	const strength = lit === 'steady' ? 44 : 26;
	const rx = radius * 1.9;
	const ry = bodyHeight * 0.75;
	const x0 = Math.floor(cx - rx);
	const x1 = Math.ceil(cx + rx);
	const y0 = Math.floor(cy - ry);
	const y1 = Math.ceil(cy + ry);
	for (let y = y0; y <= y1; y++) {
		for (let x = x0; x <= x1; x++) {
			if (x < 0 || y < 0 || x >= target.width || y >= target.height) continue;
			const dx = (x - cx) / rx;
			const dy = (y - cy) / ry;
			const d = dx * dx + dy * dy;
			if (d > 1) continue;
			const i = (y * target.width + x) * 4;
			const falloff = (1 - d) * strength;
			target.data[i] = target.data[i] + falloff;
			target.data[i + 1] = target.data[i + 1] + falloff;
			target.data[i + 2] = target.data[i + 2] + falloff * 0.8;
		}
	}
}
