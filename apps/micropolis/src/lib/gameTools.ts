import type { EditingTool, MainModule } from '../types/micropolisengine.d.js';

export type ToolId =
	| 'query'
	| 'bulldoze'
	| 'wire'
	| 'road'
	| 'rail'
	| 'park'
	| 'res'
	| 'com'
	| 'ind'
	| 'police'
	| 'fire'
	| 'seaport'
	| 'coal'
	| 'stadium'
	| 'nuclear'
	| 'airport';

export interface ToolDef {
	id: ToolId;
	/** Title-case name shown in the palette (after the shortcut). */
	label: string;
	shortcut: string;
	/** Engine cost per placement (from `gCostOf[]` in tool.cpp). */
	cost: number;
}

export interface ToolGroup {
	id: string;
	/** Optional muted group heading in the palette. */
	label?: string;
	tools: ToolDef[];
}

/** Cheapest → most expensive; similar tools grouped. */
export const GAME_TOOL_GROUPS: ToolGroup[] = [
	{
		id: 'inspect',
		tools: [{ id: 'query', label: 'Query', shortcut: 'Q', cost: 0 }],
	},
	{
		id: 'clear',
		tools: [{ id: 'bulldoze', label: 'Bulldoze', shortcut: 'B', cost: 1 }],
	},
	{
		id: 'transport',
		label: 'Transport',
		tools: [
			{ id: 'wire', label: 'Wire', shortcut: 'W', cost: 5 },
			{ id: 'road', label: 'Road', shortcut: 'R', cost: 10 },
			{ id: 'rail', label: 'Rail', shortcut: 'L', cost: 20 },
		],
	},
	{
		id: 'zones',
		label: 'Zones',
		tools: [
			{ id: 'res', label: 'Residential', shortcut: 'U', cost: 100 },
			{ id: 'com', label: 'Commercial', shortcut: 'E', cost: 100 },
			{ id: 'ind', label: 'Industrial', shortcut: 'T', cost: 100 },
		],
	},
	{
		id: 'civic',
		label: 'Civic',
		tools: [
			{ id: 'park', label: 'Park', shortcut: 'P', cost: 10 },
			{ id: 'police', label: 'Police', shortcut: 'K', cost: 500 },
			{ id: 'fire', label: 'Fire', shortcut: 'F', cost: 500 },
		],
	},
	{
		id: 'major',
		label: 'Major',
		tools: [
			{ id: 'seaport', label: 'Seaport', shortcut: 'H', cost: 3000 },
			{ id: 'coal', label: 'Coal Power', shortcut: 'Y', cost: 3000 },
			{ id: 'stadium', label: 'Stadium', shortcut: 'S', cost: 5000 },
			{ id: 'nuclear', label: 'Nuclear', shortcut: 'N', cost: 5000 },
			{ id: 'airport', label: 'Airport', shortcut: 'A', cost: 10000 },
		],
	},
];

export const GAME_TOOLS: ToolDef[] = GAME_TOOL_GROUPS.flatMap((g) => g.tools);

export const TOOL_BY_SHORTCUT: Record<string, ToolId> = Object.fromEntries(
	GAME_TOOLS.map((t) => [t.shortcut.toLowerCase(), t.id]),
);

export function toolMenuLabel(tool: ToolDef): string {
	return `${tool.shortcut}: ${tool.label}`;
}

export function resolveEditingTool(module: MainModule, id: ToolId): EditingTool {
	const t = module.EditingTool;
	switch (id) {
		case 'query':
			return t.TOOL_QUERY;
		case 'bulldoze':
			return t.TOOL_BULLDOZER;
		case 'wire':
			return t.TOOL_WIRE;
		case 'road':
			return t.TOOL_ROAD;
		case 'rail':
			return t.TOOL_RAILROAD;
		case 'park':
			return t.TOOL_PARK;
		case 'res':
			return t.TOOL_RESIDENTIAL;
		case 'com':
			return t.TOOL_COMMERCIAL;
		case 'ind':
			return t.TOOL_INDUSTRIAL;
		case 'police':
			return t.TOOL_POLICESTATION;
		case 'fire':
			return t.TOOL_FIRESTATION;
		case 'seaport':
			return t.TOOL_SEAPORT;
		case 'coal':
			return t.TOOL_COALPOWER;
		case 'stadium':
			return t.TOOL_STADIUM;
		case 'nuclear':
			return t.TOOL_NUCLEARPOWER;
		case 'airport':
			return t.TOOL_AIRPORT;
		default:
			return t.TOOL_ROAD;
	}
}

/** Tile footprint per tool — mirrors `gToolSize[]` in micropolis-engine `tool.cpp`. */
const TOOL_FOOTPRINT_SIZE: Record<ToolId, number> = {
	query: 1,
	bulldoze: 1,
	wire: 1,
	road: 1,
	rail: 1,
	park: 1,
	res: 3,
	com: 3,
	ind: 3,
	police: 3,
	fire: 3,
	seaport: 4,
	coal: 4,
	stadium: 4,
	nuclear: 4,
	airport: 6,
};

export interface ToolFootprint {
	x: number;
	y: number;
	w: number;
	h: number;
}

/**
 * Screen footprint for the active tool at the hovered tile.
 * Multi-tile buildings use engine `buildBuilding` anchor: top-left = center − (1, 1).
 */
export function toolFootprintAtCenter(centerX: number, centerY: number, id: ToolId): ToolFootprint {
	const size = TOOL_FOOTPRINT_SIZE[id];
	if (size <= 1) {
		return { x: centerX, y: centerY, w: 1, h: 1 };
	}
	return {
		x: centerX - 1,
		y: centerY - 1,
		w: size,
		h: size,
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
