import type { Micropolis } from '../../types/micropolisengine.d.js';
import type { EngineSpriteSnapshot } from './engineSpriteSnapshot';
import { getManifestByEngineType } from './classicPack';
import type { SpriteInstance } from './types';

export function syncEngineSprites(micropolis: Micropolis | null, packId: string): SpriteInstance[] {
	if (!micropolis) return [];

	const getActiveSprites = micropolis.getActiveSprites;
	if (typeof getActiveSprites !== 'function') return [];

	let sprites: EngineSpriteSnapshot[];
	try {
		sprites = getActiveSprites.call(micropolis) as EngineSpriteSnapshot[];
	} catch {
		return [];
	}
	if (!sprites?.length) return [];

	const out: SpriteInstance[] = [];
	for (let i = 0; i < sprites.length; i++) {
		const s = sprites[i];
		if (!s || s.frame === 0) continue;
		const manifest = getManifestByEngineType(packId, s.type);
		if (!manifest) continue;

		out.push({
			id: `engine-${s.type}-${i}`,
			source: 'engine',
			manifestId: manifest.id,
			packId,
			frame: s.frame,
			worldX: s.x,
			worldY: s.y,
			xHot: s.xHot,
			yHot: s.yHot,
		});
	}
	return out;
}
