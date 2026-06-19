/**
 * Skywriting airplane — deposits colored smoke into an atmospheric layer (CA diffusion + fade).
 * Pilot with arrow keys; type letters to paint; grab/drag plane in pilot mode (future: pointer).
 */
import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
import { setPluginSpriteInstances } from '../../spriteRegistry.svelte';
import type { SpriteInstance } from '../../types';
import { getOrCreateAtmosphericLayer, stepAllAtmosphericLayers } from '../../layers/layerRegistry';
import { buildSkywritingPath, interpolatePath } from './letterPaths';
import { SKYWRITING_POP_MILESTONES } from './milestones';

export const SKYWRITING_LAYER_ID = 'skywriting-smoke';

export interface SkywritingOptions {
	color?: string;
	centerWorldX?: number;
	centerWorldY?: number;
	pixelScale?: number;
}

const PILOT_SPEED = 14;
const SMOKE_ALPHA = 0.55;
const SMOKE_RADIUS = 8;
const ADVANCE_PER_TICK = 2;

let pilotMode = $state(false);
let planeX = $state(960);
let planeY = $state(320);
let planeHeading = $state(0);
let smokeColor = $state('#ff6688');
let emitSmoke = $state(false);

interface ActiveScript {
	text: string;
	color: string;
	path: Array<{ x: number; y: number; heading: number }>;
	index: number;
}

let activeScript = $state<ActiveScript | null>(null);
const firedMilestones = new Set<number>();

function mapSize(): { w: number; h: number } {
	const eng = micropolisReactive.wasmModule;
	const tile = 16;
	return {
		w: (eng?.WORLD_W ?? 120) * tile,
		h: (eng?.WORLD_H ?? 100) * tile,
	};
}

function layer() {
	const { w, h } = mapSize();
	return getOrCreateAtmosphericLayer(SKYWRITING_LAYER_ID, w, h, { animate: true });
}

function depositAtExhaust(worldX: number, worldY: number, color: string): void {
	layer().depositHex(worldX, worldY, color, SMOKE_ALPHA, SMOKE_RADIUS);
}

export function toggleSkywritingPilot(): boolean {
	pilotMode = !pilotMode;
	if (pilotMode) {
		activeScript = null;
	}
	return pilotMode;
}

export function isSkywritingPilot(): boolean {
	return pilotMode;
}

export function setSkywritingColor(color: string): void {
	smokeColor = color;
}

export function handleSkywritingKeyDown(event: KeyboardEvent): boolean {
	if (!pilotMode) return false;
	if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
		return false;
	}

	const key = event.key;
	if (key === 'ArrowLeft') {
		planeX -= PILOT_SPEED;
		planeHeading = Math.PI;
		emitSmoke = true;
		event.preventDefault();
		return true;
	}
	if (key === 'ArrowRight') {
		planeX += PILOT_SPEED;
		planeHeading = 0;
		emitSmoke = true;
		event.preventDefault();
		return true;
	}
	if (key === 'ArrowUp') {
		planeY -= PILOT_SPEED;
		planeHeading = -Math.PI / 2;
		emitSmoke = true;
		event.preventDefault();
		return true;
	}
	if (key === 'ArrowDown') {
		planeY += PILOT_SPEED;
		planeHeading = Math.PI / 2;
		emitSmoke = true;
		event.preventDefault();
		return true;
	}
	if (key === ' ') {
		emitSmoke = true;
		event.preventDefault();
		return true;
	}
	if (key.length === 1 && /[a-zA-Z0-9!?.\- ]/.test(key)) {
		paintLetter(key);
		event.preventDefault();
		return true;
	}
	return false;
}

export function handleSkywritingKeyUp(event: KeyboardEvent): boolean {
	if (!pilotMode) return false;
	if (event.key === ' ') {
		emitSmoke = false;
		return true;
	}
	if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
		emitSmoke = false;
		return true;
	}
	return false;
}

export function paintLetter(ch: string): void {
	const scale = 12;
	const raw = buildSkywritingPath(ch, planeX, planeY, scale);
	const path = interpolatePath(raw, 4);
	if (path.length === 0) return;
	activeScript = {
		text: ch,
		color: smokeColor,
		path,
		index: 0,
	};
}

export function triggerSkywriting(text: string, options: SkywritingOptions = {}): void {
	const { w, h } = mapSize();
	const scale = options.pixelScale ?? 12;
	const raw = buildSkywritingPath(
		text,
		options.centerWorldX ?? w * 0.15,
		options.centerWorldY ?? h * 0.2,
		scale,
	);
	const path = interpolatePath(raw, 4);
	if (path.length === 0) return;
	planeX = path[0].x;
	planeY = path[0].y;
	activeScript = {
		text,
		color: options.color ?? smokeColor,
		path,
		index: 0,
	};
	publishPlane();
}

export function tickSkywriting(): void {
	stepAllAtmosphericLayers();

	if (pilotMode && emitSmoke) {
		depositAtExhaust(planeX, planeY, smokeColor);
	}

	if (activeScript) {
		for (let step = 0; step < ADVANCE_PER_TICK && activeScript.index < activeScript.path.length; step++) {
			const pt = activeScript.path[activeScript.index];
			activeScript.index += 1;
			planeX = pt.x;
			planeY = pt.y;
			planeHeading = pt.heading;
			depositAtExhaust(pt.x, pt.y, activeScript.color);
		}
		if (activeScript.index >= activeScript.path.length) {
			activeScript = null;
		}
	}

	publishPlane();
}

function publishPlane(): void {
	const instances: SpriteInstance[] = [];
	if (pilotMode || activeScript) {
		instances.push({
			id: 'skywriting-airplane',
			source: 'plugin',
			manifestId: 'airplane',
			packId: 'classic',
			frame: 2,
			worldX: planeX,
			worldY: planeY,
			heading: planeHeading,
			zIndex: 100,
		});
	}
	setPluginSpriteInstances(instances);
}

export function watchSkywritingMilestones(): void {
	const pop = micropolisReactive.cityPop;
	for (const m of SKYWRITING_POP_MILESTONES) {
		if (pop >= m.pop && !firedMilestones.has(m.pop)) {
			firedMilestones.add(m.pop);
			triggerSkywriting(m.message, { color: m.color });
		}
	}
}

export function resetSkywritingMilestones(): void {
	firedMilestones.clear();
}
