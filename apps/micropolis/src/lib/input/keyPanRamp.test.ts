import { describe, expect, it } from 'vitest';
import {
	DEFAULT_KEY_PAN_RAMP,
	keyPanScreenDelta,
	keyPanSpeedFactor,
	rampCurve,
} from './keyPanRamp';

describe('keyPanRamp', () => {
	it('starts at minFactor and reaches 1 after rampMs', () => {
		const p = { ...DEFAULT_KEY_PAN_RAMP, rampMs: 400, minFactor: 0.2, curve: 'linear' as const };
		expect(keyPanSpeedFactor(0, p)).toBeCloseTo(0.2);
		expect(keyPanSpeedFactor(400, p)).toBeCloseTo(1);
		expect(keyPanSpeedFactor(800, p)).toBeCloseTo(1);
	});

	it('smoothstep is monotonic on [0,1]', () => {
		let prev = -1;
		for (let i = 0; i <= 20; i++) {
			const v = rampCurve(i / 20, 'smoothstep');
			expect(v).toBeGreaterThanOrEqual(prev);
			prev = v;
		}
	});

	it('ease-in curves stay below linear mid-ramp', () => {
		const t = 0.5;
		expect(rampCurve(t, 'ease-in-quad')).toBeLessThan(rampCurve(t, 'linear'));
		expect(rampCurve(t, 'ease-in-cubic')).toBeLessThan(rampCurve(t, 'ease-in-quad'));
	});

	it('screen delta scales with hold time', () => {
		const dt = 1 / 60;
		const early = keyPanScreenDelta('right', 0, dt);
		const late = keyPanScreenDelta('right', 500, dt);
		expect(late.screenDx).toBeGreaterThan(early.screenDx);
	});
});
