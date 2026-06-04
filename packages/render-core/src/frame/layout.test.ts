import { describe, expect, it } from 'vitest';
import { innerFromOuter, layoutNineSlice, outerFromInner } from './layout.js';

describe('frame layout', () => {
	it('outerFromInner expands by rim', () => {
		const inner = { left: 10, top: 20, right: 50, bottom: 60 };
		const outer = outerFromInner(inner, { top: 2, right: 3, bottom: 4, left: 1 });
		expect(outer).toEqual({ left: 9, top: 18, right: 53, bottom: 64 });
	});

	it('innerFromOuter inverts rim', () => {
		const outer = { left: 0, top: 0, right: 100, bottom: 80 };
		const inner = innerFromOuter(outer, { top: 8, right: 8, bottom: 8, left: 8 });
		expect(inner).toEqual({ left: 8, top: 8, right: 92, bottom: 72 });
	});

	it('layoutNineSlice produces hollow center when hollow', () => {
		const outer = { left: 0, top: 0, right: 90, bottom: 60 };
		const layout = layoutNineSlice(
			outer,
			{ top: 10, right: 10, bottom: 10, left: 10 },
			{ width: 30, height: 20 },
			1,
			true,
		);
		expect(layout.center).toBeUndefined();
		expect(layout.corners.topLeft.right - layout.corners.topLeft.left).toBeGreaterThan(0);
		expect(layout.edges.top.left).toBe(layout.corners.topLeft.right);
		expect(layout.edges.top.right).toBe(layout.corners.topRight.left);
	});
});
