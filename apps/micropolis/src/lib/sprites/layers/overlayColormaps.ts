import type { ColormapFn } from './AtmosphericLayer';

/** Classic SimCity-style pollution ramp (low green -> high red). */
export const pollutionColormap: ColormapFn = (t) => {
	const u = Math.max(0, Math.min(1, t));
	if (u < 0.33) return [Math.round(40 + u * 3 * 180), 200, 80, Math.round(120 + u * 100)];
	if (u < 0.66) return [240, Math.round(220 - (u - 0.33) * 3 * 180), 60, Math.round(160 + u * 80)];
	return [255, Math.round(80 - (u - 0.66) * 3 * 60), 40, Math.round(180 + u * 60)];
};

/** Population density heat (cool -> warm). */
export const populationColormap: ColormapFn = (t) => {
	const u = Math.max(0, Math.min(1, t));
	return [
		Math.round(32 + u * 200),
		Math.round(48 + u * 120),
		Math.round(180 - u * 140),
		Math.round(100 + u * 120),
	];
};

/** Crime rate (purple wash). */
export const crimeColormap: ColormapFn = (t) => {
	const u = Math.max(0, Math.min(1, t));
	return [Math.round(80 + u * 140), 40, Math.round(120 + u * 100), Math.round(90 + u * 130)];
};

/** Land value (brown -> gold). */
export const landValueColormap: ColormapFn = (t) => {
	const u = Math.max(0, Math.min(1, t));
	return [Math.round(100 + u * 120), Math.round(80 + u * 100), 40, Math.round(100 + u * 100)];
};

export const OVERLAY_COLORMAPS = {
	pollution: pollutionColormap,
	population: populationColormap,
	crime: crimeColormap,
	landValue: landValueColormap,
} as const;

export type OverlayColormapId = keyof typeof OVERLAY_COLORMAPS;
