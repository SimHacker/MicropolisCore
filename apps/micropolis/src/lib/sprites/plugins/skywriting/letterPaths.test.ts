import { describe, expect, it } from 'vitest';
import { MapViewport } from '@micropolis/render-core';
import { getManifest } from '../../classicPack';
import { layoutSpriteOnScreen } from '../../spriteMeasure';
import { buildSkywritingPath, interpolatePath } from './letterPaths';

describe('skywriting letterPaths', () => {
	it('builds a non-empty path for HI', () => {
		const raw = buildSkywritingPath('HI', 100, 200, 8);
		expect(raw.length).toBeGreaterThan(4);
		const dense = interpolatePath(raw, 4);
		expect(dense.length).toBeGreaterThan(raw.length);
		expect(dense[0].heading).toBeTypeOf('number');
	});
});

describe('spriteMeasure layout', () => {
	it('maps world pixel hotspot to screen bounds', () => {
		const viewport = new MapViewport();
		viewport.configure({
			mapWidth: 120,
			mapHeight: 100,
			tileWidth: 16,
			tileHeight: 16,
			screenWidth: 800,
			screenHeight: 600,
			panX: 60,
			panY: 50,
			zoom: 1,
		});
		const manifest = getManifest('classic', 'airplane');
		expect(manifest).not.toBeNull();
		const layout = layoutSpriteOnScreen(viewport, {
			id: 'test',
			source: 'plugin',
			manifestId: 'airplane',
			packId: 'classic',
			frame: 0,
			worldX: 960,
			worldY: 800,
		});
		expect(layout).not.toBeNull();
		expect(layout!.bounds.w).toBeGreaterThan(0);
		expect(layout!.attachments.some((a) => a.id === 'hotspot')).toBe(true);
	});
});
