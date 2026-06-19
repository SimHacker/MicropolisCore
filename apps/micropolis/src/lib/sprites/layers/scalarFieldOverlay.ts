/**
 * Scalar field overlays (pollution, population, crime, …) on the shared raster layer stack.
 * Data: engine map buffers (e.g. getPollutionDensityMapBuffer) or mop/heap views.
 */
import type { ColormapFn } from './AtmosphericLayer';
import { getOrCreateAtmosphericLayer } from './layerRegistry';
import type { OverlayColormapId } from './overlayColormaps';
import { OVERLAY_COLORMAPS } from './overlayColormaps';

export interface ScalarOverlayOptions {
	worldWidth: number;
	worldHeight: number;
	mapWidth: number;
	mapHeight: number;
	tileWidth?: number;
	tileHeight?: number;
	colormap?: ColormapFn | OverlayColormapId;
	smoothSteps?: number;
	blend?: GlobalCompositeOperation;
}

export function updateScalarOverlayLayer(
	layerId: string,
	values: ArrayLike<number>,
	options: ScalarOverlayOptions,
): void {
	const colormap =
		typeof options.colormap === 'string'
			? OVERLAY_COLORMAPS[options.colormap]
			: (options.colormap ?? OVERLAY_COLORMAPS.pollution);

	const layer = getOrCreateAtmosphericLayer(layerId, options.worldWidth, options.worldHeight, {
		blend: options.blend ?? 'multiply',
		animate: false,
		flow: 0.55,
	});

	layer.fillFromTileGrid(
		values,
		options.mapWidth,
		options.mapHeight,
		colormap,
		options.tileWidth ?? 16,
		options.tileHeight ?? 16,
	);
	layer.smooth(options.smoothSteps ?? 2);
}

/** Standard MOP / color-map layer ids (align with MapOverlayLayerSpec). */
export const SCALAR_OVERLAY_IDS = {
	pollution: 'mop.pollution',
	population: 'mop.population',
	crime: 'mop.crime',
	landValue: 'mop.land-value',
	traffic: 'mop.traffic',
} as const;
