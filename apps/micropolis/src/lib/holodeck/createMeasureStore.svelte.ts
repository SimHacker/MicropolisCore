/**
 * Svelte 5 rune binding for holodeck sparse measure protocol.
 * @see documentation/designs/map-compositing-and-measurement.md §3.4–§3.5
 *
 * FUTURE: multi-player collaborative tools (shared refs, role-scoped writable props,
 * tool-as-vehicle) use the same bindProp/setProp path — see §3.5. Not implemented yet.
 */
import {
	applyMeasureConstraint,
	applyMeasurePatch,
	createMeasureSnapshot,
	getMeasureProp,
	isMeasurePropWritable,
	resolveMeasureConstraint,
	type HolodeckStage,
	type MeasureJson,
	type MeasurePropertyConstraint,
	type MeasureRef,
	type MeasureSnapshot,
	type MeasureValue,
} from '@micropolis/render-core';

export interface MeasureStoreOptions {
	/** Refs to subscribe — sparse read/patch each frame. */
	refs: MeasureRef[];
}

export type MeasureStore = ReturnType<typeof createMeasureStore>;

/**
 * Reactive measure snapshot tied to a holodeck stage.
 * Call `tick()` after input/state changes or from rAF; returns true if DOM should relayout.
 */
export function createMeasureStore(stage: HolodeckStage, options: MeasureStoreOptions) {
	const snapshot = $state<MeasureSnapshot>(createMeasureSnapshot(options.refs));

	function get(ref: MeasureRef): MeasureValue | undefined {
		return snapshot.values[ref];
	}

	function getProp(ref: MeasureRef, key: string): MeasureJson | undefined {
		return getMeasureProp(get(ref), key);
	}

	function tick(): boolean {
		stage.render();
		const patch = stage.measurePatch(options.refs, snapshot.frame);
		return applyMeasurePatch(snapshot, patch);
	}

	/** Push sparse property patches into plugins before render (two-way bind: UI → holodeck). */
	function write(patches: Record<MeasureRef, Record<string, unknown>>): void {
		stage.measureWrite({ op: 'write', schema_version: 1, patches });
	}

	/**
	 * Write one bindable property with constraints (lineWidth, opacity, left, …).
	 * Returns false if holodeck marked the key read-only.
	 */
	function setProp(
		ref: MeasureRef,
		key: string,
		value: MeasureJson,
		constraint?: MeasurePropertyConstraint,
	): boolean {
		const current = get(ref);
		const resolved = resolveMeasureConstraint(key, constraint, current);
		if (!isMeasurePropWritable(key, resolved, current)) return false;
		const constrained = applyMeasureConstraint(value, resolved);
		if (constrained === undefined) return false;
		write({ [ref]: { [key]: constrained } });
		return true;
	}

	/**
	 * Two-way rune binding for one property on a ref.
	 * Holodeck → UI on `tick()`; UI → holodeck on assignment.
	 */
	function bindProp(ref: MeasureRef, key: string, constraint?: MeasurePropertyConstraint) {
		let local = $state<MeasureJson | undefined>(undefined);
		let pushing = false;

		function pull(): void {
			if (pushing) return;
			const raw = getProp(ref, key);
			const resolved = resolveMeasureConstraint(key, constraint, get(ref));
			local = applyMeasureConstraint(raw, resolved);
		}

		function push(value: MeasureJson): void {
			pushing = true;
			if (setProp(ref, key, value, constraint)) {
				tick();
				pull();
			}
			pushing = false;
		}

		pull();

		return {
			get current() {
				return local;
			},
			set current(value: MeasureJson) {
				push(value);
			},
			pull,
			push,
		};
	}

	return {
		get snapshot() {
			return snapshot;
		},
		get,
		getProp,
		setProp,
		bindProp,
		tick,
		write,
	};
}
