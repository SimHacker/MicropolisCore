/**
 * Keyboard arrow-pan speed ramp — hold longer → faster scroll, capped at full speed.
 *
 * Ergonomics notes:
 * - `minFactor` gives a gentle first step on tap; too low feels dead, too high feels jumpy.
 * - `rampMs` is time to full speed; 300–500ms is a good band for city maps.
 * - `smoothstep` eases in/out on the ramp (natural); `ease-in-quad` stays slower longer;
 *   `linear` is predictable but can feel mechanical; `ease-in-cubic` is very soft at first.
 * - `fullSpeedScreenPxPerSec` is in CSS pixels (zoom-aware tile conversion happens later).
 */

export type KeyPanRampCurve = 'linear' | 'ease-in-quad' | 'ease-in-cubic' | 'smoothstep';

export type KeyPanDirection = 'left' | 'right' | 'up' | 'down';

export interface KeyPanRampPolicy {
	/** CSS pixels per second at full hold speed. */
	fullSpeedScreenPxPerSec: number;
	/** Milliseconds from keydown until full speed is reached. */
	rampMs: number;
	/** Speed at keydown as a fraction of full (0–1). */
	minFactor: number;
	/** Interpolation shape from min → full over `rampMs`. */
	curve: KeyPanRampCurve;
}

/** Defaults: ~2400 px/s full (≈ prior 48px×60Hz), 2000ms smoothstep from 15%. */
export const DEFAULT_KEY_PAN_RAMP: KeyPanRampPolicy = {
	fullSpeedScreenPxPerSec: 2400,
	rampMs: 2000,
	minFactor: 0.15,
	curve: 'smoothstep',
};

export function rampCurve(t: number, curve: KeyPanRampCurve): number {
	const x = Math.max(0, Math.min(1, t));
	switch (curve) {
		case 'linear':
			return x;
		case 'ease-in-quad':
			return x * x;
		case 'ease-in-cubic':
			return x * x * x;
		case 'smoothstep':
			return x * x * (3 - 2 * x);
	}
}

/** Speed multiplier in [minFactor, 1] from how long the key has been held. */
export function keyPanSpeedFactor(
	heldMs: number,
	policy: KeyPanRampPolicy = DEFAULT_KEY_PAN_RAMP,
): number {
	if (policy.rampMs <= 0) return 1;
	const curved = rampCurve(heldMs / policy.rampMs, policy.curve);
	return policy.minFactor + (1 - policy.minFactor) * curved;
}

const DIRECTION_DELTA: Record<KeyPanDirection, [number, number]> = {
	left: [-1, 0],
	right: [1, 0],
	up: [0, -1],
	down: [0, 1],
};

/** Screen-space pan delta for one direction over `dtSec` seconds. */
export function keyPanScreenDelta(
	direction: KeyPanDirection,
	heldMs: number,
	dtSec: number,
	policy: KeyPanRampPolicy = DEFAULT_KEY_PAN_RAMP,
): { screenDx: number; screenDy: number } {
	const factor = keyPanSpeedFactor(heldMs, policy);
	const speed = policy.fullSpeedScreenPxPerSec * factor;
	const [ux, uy] = DIRECTION_DELTA[direction];
	return { screenDx: ux * speed * dtSec, screenDy: uy * speed * dtSec };
}

/** Combine per-axis held keys (each axis ramps independently for diagonals). */
export function keyPanScreenDeltaCombined(
	heldMsByDirection: Partial<Record<KeyPanDirection, number>>,
	dtSec: number,
	policy: KeyPanRampPolicy = DEFAULT_KEY_PAN_RAMP,
): { screenDx: number; screenDy: number } {
	let screenDx = 0;
	let screenDy = 0;
	for (const dir of Object.keys(heldMsByDirection) as KeyPanDirection[]) {
		const heldMs = heldMsByDirection[dir];
		if (heldMs == null) continue;
		const d = keyPanScreenDelta(dir, heldMs, dtSec, policy);
		screenDx += d.screenDx;
		screenDy += d.screenDy;
	}
	return { screenDx, screenDy };
}
