import type { MainModule } from './types/micropolisengine.d.js';

type EngineWithHeap = MainModule & { wasmMemory?: WebAssembly.Memory; HEAPU16?: Uint16Array };

/**
 * Uint16 view over Emscripten linear memory.
 * Many builds install aborting getters on `Module.HEAP*` / `Module.wasmMemory` until init completes,
 * or omit exports entirely — property access can throw; we catch and fall back.
 */
export function heapU16FromEmscriptenModule(engine: EngineWithHeap): Uint16Array | null {
	if (!engine) return null;
	try {
		const w = (engine as { wasmMemory?: WebAssembly.Memory }).wasmMemory;
		if (w?.buffer) {
			return new Uint16Array(w.buffer);
		}
	} catch {
		/* stub getter */
	}
	try {
		const h = (engine as { HEAPU16?: Uint16Array }).HEAPU16;
		if (h?.buffer) {
			return h;
		}
	} catch {
		/* stub getter */
	}
	return null;
}
