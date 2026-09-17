/**
 * Point zxing at the wasm files inside node_modules.
 *
 * Left to itself the library fetches them from a CDN, which would make our tests depend on the
 * network and our packaged app depend on a third party being up. Node-only, imported by tests and
 * by the Electron main process; the browser build resolves the wasm through the bundler instead.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { prepareZXingModule as prepareReader } from 'zxing-wasm/reader';
import { prepareZXingModule as prepareWriter } from 'zxing-wasm/writer';

const require = createRequire(import.meta.url);

let done = false;

/** Idempotent, because every entry point that might be first has to be able to call it. */
export function useLocalZXingWasm(): void {
	if (done) return;
	prepareReader({ overrides: { wasmBinary: load('dist/reader/zxing_reader.wasm') } });
	prepareWriter({ overrides: { wasmBinary: load('dist/writer/zxing_writer.wasm') } });
	done = true;
}

/**
 * The wasm files sit inside the package but outside its `exports` map, and so does
 * `package.json`, so neither can be resolved by name. Walk up from an entry point that IS
 * exported until the directory holding `dist` appears.
 */
function load(relative: string): ArrayBuffer {
	let dir = dirname(require.resolve('zxing-wasm/reader'));
	while (!existsSync(join(dir, 'dist'))) {
		const parent = dirname(dir);
		if (parent === dir) throw new Error('cannot find the zxing-wasm package root');
		dir = parent;
	}
	const bytes = readFileSync(join(dir, relative));
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
