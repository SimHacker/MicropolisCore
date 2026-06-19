import type { MapViewport } from '@micropolis/render-core';
import type {
	ResolvedSpriteAtlas,
	SpriteAttachmentScreen,
	SpriteInstance,
	SpriteMeasurementDef,
	SpriteScreenLayout,
} from './types';
import { PROCEDURAL_SMOKE_PUFF } from './types';
import { getManifest, smokePuffManifest } from './classicPack';

function scaleX(viewport: MapViewport): number {
	return viewport.zoom * viewport.tileWidth;
}

function scaleY(viewport: MapViewport): number {
	return viewport.zoom * viewport.tileHeight;
}

function frameDef(manifest: ResolvedSpriteAtlas, frameIndex: number) {
	return manifest.frames.find((f) => f.index === frameIndex) ?? manifest.frames[0];
}

function measurementsForFrame(
	manifest: ResolvedSpriteAtlas,
	frameIndex: number,
): Record<string, SpriteMeasurementDef> {
	const frame = frameDef(manifest, frameIndex);
	return { ...manifest.defaultMeasurements, ...frame?.measurements };
}

export function resolveManifest(packId: string, manifestId: string): ResolvedSpriteAtlas | null {
	if (manifestId === PROCEDURAL_SMOKE_PUFF) return smokePuffManifest();
	return getManifest(packId, manifestId);
}

/** Screen layout for one sprite instance — same math holodeck measure will publish later. */
export function layoutSpriteOnScreen(
	viewport: MapViewport,
	instance: SpriteInstance,
): SpriteScreenLayout | null {
	const manifest = resolveManifest(instance.packId, instance.manifestId);
	if (!manifest) return null;

	const sx = scaleX(viewport);
	const sy = scaleY(viewport);
	const xHot = instance.xHot ?? measurementsForFrame(manifest, instance.frame).hotspot?.x ?? 0;
	const yHot = instance.yHot ?? measurementsForFrame(manifest, instance.frame).hotspot?.y ?? 0;
	const scale = instance.scale ?? 1;
	const fw = manifest.frameWidth * sx * scale;
	const fh = manifest.frameHeight * sy * scale;

	const [hotScreenX, hotScreenY] = viewport.worldPixelToScreen([instance.worldX, instance.worldY]);
	const bounds = {
		x: hotScreenX - xHot * sx * scale,
		y: hotScreenY - yHot * sy * scale,
		w: fw,
		h: fh,
	};

	const defs = measurementsForFrame(manifest, instance.frame);
	const attachments: SpriteAttachmentScreen[] = Object.entries(defs).map(([id, def]) => ({
		id,
		x: bounds.x + def.x * sx * scale,
		y: bounds.y + def.y * sy * scale,
	}));

	return { bounds, attachments };
}

export function attachmentScreenPoint(
	viewport: MapViewport,
	instance: SpriteInstance,
	attachmentId: string,
): { x: number; y: number } | null {
	const layout = layoutSpriteOnScreen(viewport, instance);
	return layout?.attachments.find((a) => a.id === attachmentId) ?? null;
}
