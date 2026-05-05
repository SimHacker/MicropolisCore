import type { MainModule } from '../../types/micropolisengine.d.js';

type EngineWithHeap = MainModule & { wasmMemory?: WebAssembly.Memory; HEAPU16?: Uint16Array };

/**
 * Uint16 view over Emscripten linear memory.
 *
 * Some Emscripten builds install throwing getters before runtime init, so all
 * property probes stay guarded.
 */
export function heapU16FromEmscriptenModule(engine: EngineWithHeap): Uint16Array | null {
	if (!engine) return null;
	try {
		const w = (engine as { wasmMemory?: WebAssembly.Memory }).wasmMemory;
		if (w?.buffer) return new Uint16Array(w.buffer);
	} catch {
		/* getter unavailable */
	}
	try {
		const h = (engine as { HEAPU16?: Uint16Array }).HEAPU16;
		if (h?.buffer) return h;
	} catch {
		/* getter unavailable */
	}
	return null;
}
