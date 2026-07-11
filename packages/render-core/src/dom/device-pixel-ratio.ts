/** Browser DPR; safe for Node and strict `globalThis` typing. */
export function getDevicePixelRatio(): number {
	if (typeof window !== 'undefined' && typeof window.devicePixelRatio === 'number') {
		return window.devicePixelRatio;
	}
	return 1;
}
