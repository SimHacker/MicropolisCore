import type { HolodeckPlugin } from '../holodeck/types.js';
import type { MapViewport } from '../viewport/MapViewport.js';
import { parseMeasureRef, type MeasureRef, type MeasureValue } from './protocol.js';
import { toMeasureValue } from './properties.js';

export interface MeasureResolverContext {
	viewport: MapViewport;
	plugins: Map<string, HolodeckPlugin>;
	time: number;
	canvas: HTMLCanvasElement;
}

/** Resolve one ref to a JSON-friendly MeasureValue. */
export function resolveMeasureRef(ref: MeasureRef, ctx: MeasureResolverContext): MeasureValue | null {
	const address = parseMeasureRef(ref);
	const plugin = ctx.plugins.get(address.layerId);

	if (plugin?.measure) {
		const result = plugin.measure(
			{
				layerId: address.layerId,
				objectId: address.objectId,
				attachmentId: address.attachmentId,
				kind: address.kind ?? 'bounds',
				space: address.space,
			},
			{
				viewport: ctx.viewport,
				canvas: ctx.canvas,
				devicePixelRatio: globalThis.devicePixelRatio ?? 1,
				time: ctx.time,
			},
		);
		if (result) return toMeasureValue(result as MeasureValue);
	}

	if (address.layerId === 'map' && address.objectId?.startsWith('tile:')) {
		const parts = address.objectId.slice(5).split(',');
		const tx = Number(parts[0]);
		const ty = Number(parts[1]);
		const tw = parts[2] !== undefined ? Number(parts[2]) : 1;
		const th = parts[3] !== undefined ? Number(parts[3]) : 1;
		if ([tx, ty, tw, th].every(Number.isFinite)) {
			return toMeasureValue({
				ok: true,
				space: 'screen',
				bounds: ctx.viewport.worldTileToScreenRect(tx, ty, tw, th),
			});
		}
	}

	return null;
}
