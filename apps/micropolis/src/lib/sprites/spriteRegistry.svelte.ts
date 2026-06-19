/**
 * Plugin + engine sprite instance registry (Svelte 5 runes).
 */
import type { SpriteInstance } from './types';

let pluginInstances = $state<SpriteInstance[]>([]);
let engineInstances = $state<SpriteInstance[]>([]);
let activePackId = $state('classic');

export function setSpritePackId(packId: string): void {
	activePackId = packId;
}

export function getSpritePackId(): string {
	return activePackId;
}

export function setEngineSpriteInstances(instances: SpriteInstance[]): void {
	engineInstances = instances;
}

export function setPluginSpriteInstances(instances: SpriteInstance[]): void {
	pluginInstances = instances;
}

export function mergePluginInstances(add: SpriteInstance[], removeIds?: Set<string>): void {
	const keep = pluginInstances.filter((p) => !removeIds?.has(p.id));
	pluginInstances = [...keep, ...add];
}

export function allSpriteInstances(): SpriteInstance[] {
	return [...engineInstances, ...pluginInstances].sort(
		(a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
	);
}

export function clearPluginSprites(): void {
	pluginInstances = [];
}
