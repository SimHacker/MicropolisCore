import type { HolodeckStage } from '../webgpu/holodeck-stage.js';
import { diffMeasureValue, mergeMeasurePropUpdates } from './properties.js';
import type { MeasurePatch, MeasureRef, MeasureValue } from './protocol.js';

/** Client-side snapshot for sparse patch coherency. */
export interface MeasureSnapshot {
	frame: number;
	values: Record<MeasureRef, MeasureValue>;
}

/**
 * Apply a sparse patch into a client snapshot (framework-agnostic).
 * Returns true if any value changed.
 */
export function applyMeasurePatch(snapshot: MeasureSnapshot, patch: MeasurePatch): boolean {
	let changed = false;
	if (patch.frame > snapshot.frame) {
		snapshot.frame = patch.frame;
	}
	for (const ref of patch.removed ?? []) {
		if (ref in snapshot.values) {
			delete snapshot.values[ref];
			changed = true;
		}
	}
	for (const [ref, value] of Object.entries(patch.updates ?? {})) {
		const prev = snapshot.values[ref];
		if (!prev || JSON.stringify(prev) !== JSON.stringify(value)) {
			snapshot.values[ref] = value;
			changed = true;
		}
	}
	for (const [ref, props] of Object.entries(patch.propUpdates ?? {})) {
		const merged = mergeMeasurePropUpdates(snapshot.values[ref], props);
		const prev = snapshot.values[ref];
		if (!prev || JSON.stringify(prev) !== JSON.stringify(merged)) {
			snapshot.values[ref] = merged;
			changed = true;
		}
	}
	for (const [ref, keys] of Object.entries(patch.propRemoved ?? {})) {
		const current = snapshot.values[ref];
		if (!current) continue;
		let touched = false;
		for (const key of keys) {
			if (key in current) {
				delete current[key];
				touched = true;
			}
		}
		if (touched) changed = true;
	}
	return changed;
}

/**
 * One reactive tick: render holodeck, then sparse-read changed refs.
 * Use from rAF loop or Svelte `$effect` after stage.render().
 */
export function syncMeasureRefs(
	stage: HolodeckStage,
	refs: MeasureRef[],
	snapshot: MeasureSnapshot,
): MeasurePatch {
	stage.render();
	const patch = stage.measurePatch(refs, snapshot.frame);
	applyMeasurePatch(snapshot, patch);
	return patch;
}

/** Create an empty snapshot bound to a ref list. */
export function createMeasureSnapshot(_refs: MeasureRef[]): MeasureSnapshot {
	return { frame: 0, values: {} };
}
