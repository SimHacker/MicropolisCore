import type { ToolId } from './gameTools';
import { micropolisReactive } from './MicropolisReactive.svelte';

let activeToolId = $state<ToolId>('road');
let hoverTile = $state<[number, number] | null>(null);
let lastToolFeedback = $state<string | null>(null);
let toolRevision = $state(0);
let hoverRevision = $state(0);

export const toolState = {
	get activeToolId() {
		return activeToolId;
	},
	get toolRevision() {
		return toolRevision;
	},
	setActiveTool(id: ToolId) {
		if (activeToolId === id) return;
		if (activeToolId === 'query') {
			micropolisReactive.clearZoneStatus();
		}
		activeToolId = id;
		lastToolFeedback = null;
		toolRevision += 1;
	},
	get hoverTile() {
		return hoverTile;
	},
	get hoverRevision() {
		return hoverRevision;
	},
	setHoverTile(tile: [number, number] | null) {
		if (tile === null) {
			if (hoverTile !== null) {
				hoverTile = null;
				hoverRevision += 1;
			}
			return;
		}
		const ix = Math.floor(tile[0]);
		const iy = Math.floor(tile[1]);
		if (hoverTile?.[0] === ix && hoverTile?.[1] === iy) return;
		hoverTile = [ix, iy];
		hoverRevision += 1;
	},
	get lastToolFeedback() {
		return lastToolFeedback;
	},
	setLastToolFeedback(message: string | null) {
		lastToolFeedback = message;
	}
};
