/** Sprite atlas + instance types for DOM overlay and future holodeck parity. */

export type MeasureAttachmentKind = 'attachment' | 'bounds' | 'point';

export interface SpriteMeasurementDef {
	kind: MeasureAttachmentKind;
	x: number;
	y: number;
}

export interface SpriteFrameDef {
	index: number;
	atlas: { x: number; y: number };
	measurements?: Record<string, SpriteMeasurementDef>;
}

export interface SpriteAtlasManifest {
	schema_version: 1;
	id: string;
	/** C++ SimSprite.type when sourced from engine; omitted for plugin-only sprites. */
	engineType?: number;
	sheet?: string;
	frameWidth: number;
	frameHeight: number;
	frames: SpriteFrameDef[];
	/** Default measurements when a frame omits them. */
	defaultMeasurements?: Record<string, SpriteMeasurementDef>;
}

export interface ResolvedSpriteAtlas extends SpriteAtlasManifest {
	sheetUrl: string;
}

export type SpriteInstanceSource = 'engine' | 'plugin';

/** One drawable sprite — engine sync or plugin controller. */
export interface SpriteInstance {
	id: string;
	source: SpriteInstanceSource;
	manifestId: string;
	packId: string;
	frame: number;
	/** Hotspot / anchor in engine world-pixel space (matches SimSprite x/y). */
	worldX: number;
	worldY: number;
	/** Override manifest hotspot; engine sprites pass SimSprite xHot/yHot. */
	xHot?: number;
	yHot?: number;
	opacity?: number;
	scale?: number;
	/** CSS color for procedural smoke-puff sprites. */
	tint?: string;
	/** Heading radians — plugin sprites (skywriting airplane). */
	heading?: number;
	zIndex?: number;
}

/** Procedural manifest ids (no sheet PNG). */
export const PROCEDURAL_SMOKE_PUFF = 'smoke-puff';

export interface SpriteAttachmentScreen {
	id: string;
	x: number;
	y: number;
}

export interface SpriteScreenLayout {
	bounds: { x: number; y: number; w: number; h: number };
	attachments: SpriteAttachmentScreen[];
}
