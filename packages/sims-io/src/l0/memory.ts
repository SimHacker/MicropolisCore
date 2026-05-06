/**
 * L0 in-memory resource provider — for tests and static demos.
 * Map: logical path → ArrayBuffer (or string text which is UTF-8 encoded).
 */

import type { ResourceProvider, ResourceEntry } from './types.js';
import { normalisePath } from './types.js';

export class MemoryResourceProvider implements ResourceProvider {
	private readonly files: Map<string, ArrayBuffer>;

	constructor(files: Record<string, ArrayBuffer | string> = {}) {
		this.files = new Map();
		for (const [k, v] of Object.entries(files)) {
			const key = normalisePath(k);
			if (typeof v === 'string') {
				const enc = new TextEncoder().encode(v);
				this.files.set(key, enc.buffer.slice(enc.byteOffset, enc.byteOffset + enc.byteLength) as ArrayBuffer);
			} else {
				this.files.set(key, v);
			}
		}
	}

	async read(logicalPath: string): Promise<ArrayBuffer | null> {
		return this.files.get(normalisePath(logicalPath)) ?? null;
	}

	async exists(logicalPath: string): Promise<boolean> {
		const n = normalisePath(logicalPath);
		if (this.files.has(n)) return true;
		// Check for directory (any file under this prefix)
		const prefix = n.endsWith('/') ? n : n + '/';
		for (const k of this.files.keys()) {
			if (k.startsWith(prefix)) return true;
		}
		return false;
	}

	async list(logicalPath: string): Promise<ResourceEntry[]> {
		const prefix = normalisePath(logicalPath);
		// dir is the prefix to strip from keys; root is empty string (not '/')
		const dir = prefix === '' ? '' : (prefix.endsWith('/') ? prefix : prefix + '/');
		const seen = new Map<string, boolean>();
		for (const k of this.files.keys()) {
			if (dir !== '' && !k.startsWith(dir)) continue;
			const rest = dir === '' ? k : k.slice(dir.length);
			if (!rest) continue;
			const slash = rest.indexOf('/');
			if (slash === -1) {
				seen.set(rest, false);
			} else {
				seen.set(rest.slice(0, slash), true);
			}
		}
		return Array.from(seen.entries()).map(([name, isDirectory]) => ({ name, isDirectory }));
	}
}
