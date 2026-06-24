import { describe, expect, it } from 'vitest';
import { toolFootprintAtCenter } from './gameTools';

describe('toolFootprintAtCenter', () => {
	it('1×1 tools sit on the hovered tile', () => {
		expect(toolFootprintAtCenter(10, 20, 'road')).toEqual({ x: 10, y: 20, w: 1, h: 1 });
	});

	it('3×3 zones anchor top-left at center − (1, 1)', () => {
		expect(toolFootprintAtCenter(10, 20, 'res')).toEqual({ x: 9, y: 19, w: 3, h: 3 });
	});

	it('4×4 buildings anchor top-left at center − (1, 1)', () => {
		expect(toolFootprintAtCenter(10, 20, 'seaport')).toEqual({ x: 9, y: 19, w: 4, h: 4 });
	});

	it('6×6 airport anchors top-left at center − (1, 1)', () => {
		expect(toolFootprintAtCenter(10, 20, 'airport')).toEqual({ x: 9, y: 19, w: 6, h: 6 });
	});
});
