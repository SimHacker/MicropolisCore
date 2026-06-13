import { describe, expect, it } from 'vitest';
import { applyMeasureConstraint } from './constraints.js';
import {
	diffMeasureValue,
	getMeasureProp,
	normalizeMeasureValue,
	toMeasureValue,
} from './properties.js';
import type { MeasureValue } from './protocol.js';
import { applyMeasurePatch, createMeasureSnapshot } from './sync.js';

describe('measure properties', () => {
	it('normalizes bounds to left/top/width/height', () => {
		const v = normalizeMeasureValue({
			ok: true,
			space: 'screen',
			bounds: { x: 10, y: 20, w: 30, h: 40 },
		});
		expect(v.left).toBe(10);
		expect(v.top).toBe(20);
		expect(v.width).toBe(30);
		expect(v.height).toBe(40);
	});

	it('getMeasureProp reads shader/CSS keys', () => {
		const v: MeasureValue = {
			ok: true,
			space: 'screen',
			lineWidth: 2.5,
			opacity: 0.8,
			marginTop: 4,
		};
		expect(getMeasureProp(v, 'lineWidth')).toBe(2.5);
		expect(getMeasureProp(v, 'opacity')).toBe(0.8);
	});

	it('diffMeasureValue emits sparse propUpdates', () => {
		const prev: MeasureValue = {
			ok: true,
			space: 'screen',
			left: 1,
			lineWidth: 2,
		};
		const next: MeasureValue = {
			ok: true,
			space: 'screen',
			left: 1,
			lineWidth: 4,
			opacity: 0.5,
		};
		const diff = diffMeasureValue(prev, next, false);
		expect(diff.replace).toBeUndefined();
		expect(diff.propUpdates).toEqual({ lineWidth: 4, opacity: 0.5, strokeWidth: 4 });
	});

	it('applyMeasurePatch merges propUpdates', () => {
		const snap = createMeasureSnapshot([]);
		snap.values['world-strokes/local'] = {
			ok: true,
			space: 'world-pixel',
			lineWidth: 2,
		};
		const changed = applyMeasurePatch(snap, {
			op: 'patch',
			schema_version: 1,
			baseFrame: 0,
			frame: 1,
			propUpdates: {
				'world-strokes/local': { lineWidth: 5, color: '#fff' },
			},
		});
		expect(changed).toBe(true);
		expect(snap.values['world-strokes/local'].lineWidth).toBe(5);
		expect(snap.values['world-strokes/local'].color).toBe('#fff');
	});
});

describe('measure constraints', () => {
	it('clamps numeric props', () => {
		expect(applyMeasureConstraint(10, { min: 0, max: 8 })).toBe(8);
		expect(applyMeasureConstraint(-1, { min: 0, max: 1, default: 0.5 })).toBe(0);
	});
});

describe('measure protocol', () => {
	it('toMeasureValue clones bindable props', () => {
		const value = toMeasureValue({
			ok: true,
			space: 'screen',
			bounds: { x: 1, y: 2, w: 3, h: 4 },
			lineWidth: 2,
		});
		expect(value.lineWidth).toBe(2);
		expect(value.left).toBe(1);
	});
});
