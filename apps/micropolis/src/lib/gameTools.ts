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
}

export const GAME_TOOLS: ToolDef[] = [
	{ id: 'bulldoze', label: 'Bulldoze', shortcut: 'B' },
	{ id: 'road', label: 'Road', shortcut: 'R' },
	{ id: 'rail', label: 'Rail', shortcut: 'L' },
	{ id: 'wire', label: 'Wire', shortcut: 'W' },
	{ id: 'res', label: 'Residential', shortcut: 'U' },
	{ id: 'com', label: 'Commercial', shortcut: 'E' },
	{ id: 'ind', label: 'Industrial', shortcut: 'T' },
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

export function toolCursor(id: ToolId, panning: boolean): string {
	if (panning) return 'grabbing';
	switch (id) {
		case 'query':
			return 'crosshair';
		case 'bulldoze':
			return 'cell';
		default:
			return 'default';
	}
}
