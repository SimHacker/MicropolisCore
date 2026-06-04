import type { ToolId } from './gameTools';

let activeToolId = $state<ToolId>('road');
let hoverTile = $state<[number, number] | null>(null);
let lastToolFeedback = $state<string | null>(null);

export const toolState = {
	get activeToolId() {
		return activeToolId;
	},
	setActiveTool(id: ToolId) {
		activeToolId = id;
		lastToolFeedback = null;
	},
	get hoverTile() {
		return hoverTile;
	},
	setHoverTile(tile: [number, number] | null) {
		hoverTile = tile;
	},
	get lastToolFeedback() {
		return lastToolFeedback;
	},
	setLastToolFeedback(message: string | null) {
		lastToolFeedback = message;
	}
};
