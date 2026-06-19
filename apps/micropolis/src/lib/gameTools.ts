import type { EditingTool, MainModule } from '../types/micropolisengine.d.js';

export type ToolId =
	| 'bulldoze'
	| 'road'
	| 'rail'
	| 'wire'
	| 'res'
	| 'com'
	| 'ind'
	| 'query'
	| 'park';

export interface ToolDef {
	id: ToolId;
	label: string;
	shortcut: string;
	/** Full name for title/tooltip when label is abbreviated. */
	tooltip?: string;
}

export const GAME_TOOLS: ToolDef[] = [
	{ id: 'bulldoze', label: 'Bulldoze', shortcut: 'B' },
	{ id: 'road', label: 'Road', shortcut: 'R' },
	{ id: 'rail', label: 'Rail', shortcut: 'L' },
	{ id: 'wire', label: 'Wire', shortcut: 'W' },
	{ id: 'res', label: 'Res', shortcut: 'U', tooltip: 'Residential' },
	{ id: 'com', label: 'Com', shortcut: 'E', tooltip: 'Commercial' },
	{ id: 'ind', label: 'Ind', shortcut: 'T', tooltip: 'Industrial' },
	{ id: 'park', label: 'Park', shortcut: 'P' },
	{ id: 'query', label: 'Query', shortcut: 'Q' }
];

export function resolveEditingTool(module: MainModule, id: ToolId): EditingTool {
	const t = module.EditingTool;
	switch (id) {
		case 'bulldoze':
			return t.TOOL_BULLDOZER;
		case 'road':
			return t.TOOL_ROAD;
		case 'rail':
			return t.TOOL_RAILROAD;
		case 'wire':
			return t.TOOL_WIRE;
		case 'res':
			return t.TOOL_RESIDENTIAL;
		case 'com':
			return t.TOOL_COMMERCIAL;
		case 'ind':
			return t.TOOL_INDUSTRIAL;
		case 'query':
			return t.TOOL_QUERY;
		case 'park':
			return t.TOOL_PARK;
		default:
			return t.TOOL_ROAD;
	}
}

/** Tile footprint per tool — mirrors `gToolSize[]` in micropolis-engine `tool.cpp`. */
const TOOL_FOOTPRINT_SIZE: Record<ToolId, number> = {
	bulldoze: 1,
	road: 1,
	rail: 1,
	wire: 1,
	res: 3,
	com: 3,
	ind: 3,
	query: 1,
	park: 1
};

export interface ToolFootprint {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** Engine zone/building tools anchor on the hovered center tile. */
export function toolFootprintAtCenter(centerX: number, centerY: number, id: ToolId): ToolFootprint {
	const size = TOOL_FOOTPRINT_SIZE[id];
	const half = Math.floor(size / 2);
	return {
		x: centerX - half,
		y: centerY - half,
		w: size,
		h: size
	};
}

export function toolCursor(id: ToolId, panning: boolean, shiftPanHeld = false): string {
	if (panning) return 'grabbing';
	if (shiftPanHeld) return 'grab';
	switch (id) {
		case 'query':
			return 'crosshair';
		case 'bulldoze':
			return 'cell';
		default:
			return 'default';
	}
}
