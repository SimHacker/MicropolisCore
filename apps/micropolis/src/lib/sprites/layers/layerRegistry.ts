import type { MapViewport } from '@micropolis/render-core';
import { AtmosphericLayer } from './AtmosphericLayer';

export type LayerBlendMode = GlobalCompositeOperation;

interface LayerEntry {
	layer: AtmosphericLayer;
	blend: LayerBlendMode;
	/** When true, step() runs each frame (smoke). Scalar overlays skip CA decay. */
	animate: boolean;
}

const layers = new Map<string, LayerEntry>();

export function getOrCreateAtmosphericLayer(
	id: string,
	worldWidth: number,
	worldHeight: number,
	opts?: { blend?: LayerBlendMode; animate?: boolean; flow?: number; fade?: number },
): AtmosphericLayer {
	let entry = layers.get(id);
	if (!entry) {
		entry = {
			layer: new AtmosphericLayer(id, {
				worldWidth,
				worldHeight,
				scale: 2,
				flow: opts?.flow ?? 0.4,
				fade: opts?.fade ?? 0.988,
			}),
			blend: opts?.blend ?? 'source-over',
			animate: opts?.animate ?? true,
		};
		layers.set(id, entry);
	}
	return entry.layer;
}

export function getAtmosphericLayer(id: string): AtmosphericLayer | undefined {
	return layers.get(id)?.layer;
}

export function setLayerBlend(id: string, blend: LayerBlendMode): void {
	const entry = layers.get(id);
	if (entry) entry.blend = blend;
}

/** Blit layer region visible in viewport to target 2d context (screen space). */
export function blitAtmosphericLayer(
	ctx: CanvasRenderingContext2D,
	layer: AtmosphericLayer,
	viewport: MapViewport,
	blend: LayerBlendMode = 'source-over',
): void {
	const srcCanvas = layer.getCanvas();
	const tl = viewport.screenToWorldPixel([0, 0]);
	const br = viewport.screenToWorldPixel([viewport.screenWidth, viewport.screenHeight]);

	const wx0 = Math.max(0, Math.min(tl[0], br[0]));
	const wy0 = Math.max(0, Math.min(tl[1], br[1]));
	const wx1 = Math.min(layer.worldWidth, Math.max(tl[0], br[0]));
	const wy1 = Math.min(layer.worldHeight, Math.max(tl[1], br[1]));

	const sx = Math.floor(wx0 / layer.scale);
	const sy = Math.floor(wy0 / layer.scale);
	const sw = Math.max(1, Math.ceil((wx1 - wx0) / layer.scale));
	const sh = Math.max(1, Math.ceil((wy1 - wy0) / layer.scale));

	const [dx, dy] = viewport.worldPixelToScreen([wx0, wy0]);
	const [dx2, dy2] = viewport.worldPixelToScreen([wx1, wy1]);
	const dw = dx2 - dx;
	const dh = dy2 - dy;

	ctx.save();
	ctx.globalCompositeOperation = blend;
	ctx.drawImage(srcCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
	ctx.restore();
}

export function stepAllAtmosphericLayers(): void {
	for (const entry of layers.values()) {
		if (entry.animate) entry.layer.step();
	}
}

export function listAtmosphericLayerIds(): string[] {
	return [...layers.keys()];
}

export function getLayerBlend(id: string): LayerBlendMode {
	return layers.get(id)?.blend ?? 'source-over';
}

export function isLayerAnimated(id: string): boolean {
	return layers.get(id)?.animate ?? true;
}
