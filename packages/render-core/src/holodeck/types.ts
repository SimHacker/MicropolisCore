import type { MapViewport } from '../viewport/MapViewport.js';

/** Pick buffer idType values — see documentation/designs/unified-webgpu-renderer.md */
export const HolodeckIdType = {
	NONE: 0,
	CHARACTER: 1,
	OBJECT: 2,
	WALL: 3,
	FLOOR: 4,
	TERRAIN: 5,
	PLUMB_BOB: 6,
	MICROPOLIS_CELL: 7,
	MICROPOLIS_SPRITE: 8,
	UI: 9,
} as const;

export type HolodeckIdTypeId = (typeof HolodeckIdType)[keyof typeof HolodeckIdType];

/** Draw order: lower values draw first. */
export const HolodeckLayer = {
	TERRAIN: 10,
	FLOOR: 20,
	WALLS: 30,
	MICROPOLIS_MAP: 40,
	PROPS: 50,
	CHARACTERS: 60,
	WORLD_FEEDBACK: 70,
	/** Tile-snapped tool cursor (nine-slice frame, hollow). */
	EDITING_TOOL_CURSOR: 71,
	/** Screen-pixel pointers (local + remote). */
	POINTER_CURSORS: 115,
	PIE_MENU_BACKDROP: 90,
	PIE_MENU: 100,
	HUD: 110,
} as const;

export type HolodeckLayerId = (typeof HolodeckLayer)[keyof typeof HolodeckLayer];

export interface HolodeckFrameState {
	timeMs: number;
	devicePixelRatio: number;
}

export interface HolodeckPluginContext {
	viewport: MapViewport;
	canvas: HTMLCanvasElement;
	devicePixelRatio: number;
	time: number;
}

/**
 * Holodeck compositor plugin. Domain packages (vitamoo, micropolis-render) implement
 * `render` and optionally `collect` for future display-list execution.
 */
export interface HolodeckPlugin {
	id: string;
	layer: HolodeckLayerId;
	enabled?: boolean;
	initialize?(ctx: HolodeckPluginContext): void | Promise<void>;
	resize?(ctx: HolodeckPluginContext): void;
	render(ctx: HolodeckPluginContext): void;
	/** Future: display-list entries for vitamoo executor. */
	collect?(viewport: MapViewport, frame: HolodeckFrameState): readonly unknown[];
	dispose?(): void;
}

/** @deprecated Use {@link HolodeckPlugin} — same shape, sorted by `layer` not `zIndex`. */
export type OverlayPlugin = HolodeckPlugin;

/** @deprecated Use {@link HolodeckPluginContext}. */
export type OverlayPluginContext = HolodeckPluginContext;
