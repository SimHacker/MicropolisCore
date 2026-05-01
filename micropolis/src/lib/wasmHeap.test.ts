import { describe, it, expect } from 'vitest';
import { heapU16FromEmscriptenModule } from './wasmHeap';

describe('wasmHeap', () => {
	it('returns null for null engine', () => {
		expect(heapU16FromEmscriptenModule(null as never)).toBeNull();
	});

	it('does not throw on stub getters', () => {
		const stub = {};
		Object.defineProperty(stub, 'wasmMemory', {
			configurable: true,
			get() {
				throw new WebAssembly.RuntimeError('stub');
			}
		});
		Object.defineProperty(stub, 'HEAPU16', {
			configurable: true,
			get() {
				throw new WebAssembly.RuntimeError('stub');
			}
		});
		expect(heapU16FromEmscriptenModule(stub as Parameters<typeof heapU16FromEmscriptenModule>[0])).toBeNull();
	});
});
