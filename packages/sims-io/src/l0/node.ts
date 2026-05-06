/**
 * L0 Node.js resource provider.
 * Reads files from the local filesystem using Node's `fs` APIs.
 * Import only in Node environments (server, CLI, Vitest).
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ResourceProvider, ResourceEntry } from './types.js';

export class NodeResourceProvider implements ResourceProvider {
	private readonly root: string;

	constructor(rootPath: string) {
		this.root = path.resolve(rootPath);
	}

	private resolve(logicalPath: string): string {
		// Prevent path traversal outside root
		const joined = path.resolve(this.root, logicalPath);
		if (!joined.startsWith(this.root + path.sep) && joined !== this.root) {
			throw new Error(`[sims-io/L0] Path traversal denied: ${logicalPath}`);
		}
		return joined;
	}

	async read(logicalPath: string): Promise<ArrayBuffer | null> {
		const full = this.resolve(logicalPath);
		if (!existsSync(full)) return null;
		const buf = readFileSync(full);
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
	}

	async exists(logicalPath: string): Promise<boolean> {
		try {
			return existsSync(this.resolve(logicalPath));
		} catch {
			return false;
		}
	}

	async list(logicalPath: string): Promise<ResourceEntry[]> {
		const full = this.resolve(logicalPath);
		if (!existsSync(full)) return [];
		try {
			const entries = readdirSync(full);
			return entries.map((name) => {
				const childPath = path.join(full, name);
				const stat = statSync(childPath);
				return { name, isDirectory: stat.isDirectory() };
			});
		} catch {
			return [];
		}
	}
}
