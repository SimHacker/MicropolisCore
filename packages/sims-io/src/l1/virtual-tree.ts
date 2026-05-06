/**
 * L1 — Virtual tree.
 *
 * Merges a flat directory walk from L0 with any FAR archives found inside it
 * into one unified namespace. Callers above L1 never know whether a path came
 * from a loose file or a FAR entry.
 *
 * Resolution order (first match wins):
 *   1. Loose files from the underlying ResourceProvider
 *   2. FAR archive entries (archives discovered during initialise())
 *
 * This is intentionally simple: no DBPF, no per-root caching, no shadowing.
 * Add those when needed.
 */

import type { ResourceProvider } from '../l0/types.js';
import { parseFar, extractFarEntry, isFar } from 'vitamoo';
import type { FarArchive, FarEntry } from 'vitamoo';

export interface VirtualEntry {
	logicalPath: string;
	/** True if coming from a FAR archive (not a loose file). */
	fromArchive: boolean;
	archivePath?: string;
}

export class VirtualTree {
	private readonly provider: ResourceProvider;
	/** Map: normalised logical path → { archive path, FarEntry } */
	private farEntries: Map<string, { archivePath: string; archive: FarArchive; entry: FarEntry }> = new Map();
	private initialised = false;

	constructor(provider: ResourceProvider) {
		this.provider = provider;
	}

	/**
	 * Walk the provider root, discover all FAR archives, and index their entries.
	 * Call once before using `read` / `exists` / `list`.
	 */
	async initialise(rootPath = ''): Promise<void> {
		await this.walkAndIndex(rootPath);
		this.initialised = true;
	}

	private async walkAndIndex(dirPath: string): Promise<void> {
		const entries = await this.provider.list(dirPath);
		for (const entry of entries) {
			const childPath = dirPath ? `${dirPath}/${entry.name}` : entry.name;
			if (entry.isDirectory) {
				await this.walkAndIndex(childPath);
			} else if (entry.name.toLowerCase().endsWith('.far')) {
				await this.indexFarArchive(childPath);
			}
		}
	}

	private async indexFarArchive(archivePath: string): Promise<void> {
		const buf = await this.provider.read(archivePath);
		if (!buf || !isFar(buf)) return;
		const archive = parseFar(buf);
		for (const farEntry of archive.entries) {
			const key = farEntry.path.replace(/\\/g, '/').toLowerCase();
			this.farEntries.set(key, { archivePath, archive, entry: farEntry });
		}
	}

	/** Read a file: loose file first, then FAR archive entries. */
	async read(logicalPath: string): Promise<ArrayBuffer | null> {
		const loose = await this.provider.read(logicalPath);
		if (loose !== null) return loose;

		const key = logicalPath.replace(/\\/g, '/').toLowerCase();
		const farMatch = this.farEntries.get(key);
		if (farMatch) {
			const archiveBuf = await this.provider.read(farMatch.archivePath);
			if (archiveBuf) return extractFarEntry(archiveBuf, farMatch.entry);
		}
		return null;
	}

	/** Check existence in loose files or FAR entries. */
	async exists(logicalPath: string): Promise<boolean> {
		if (await this.provider.exists(logicalPath)) return true;
		const key = logicalPath.replace(/\\/g, '/').toLowerCase();
		return this.farEntries.has(key);
	}

	/** List all virtual entries (loose + FAR) under a prefix. */
	listAll(prefix = ''): VirtualEntry[] {
		const results: VirtualEntry[] = [];
		const p = prefix.toLowerCase().replace(/\\/g, '/');
		const dir = p ? (p.endsWith('/') ? p : p + '/') : '';

		for (const [key, meta] of this.farEntries) {
			if (!key.startsWith(dir)) continue;
			results.push({
				logicalPath: key,
				fromArchive: true,
				archivePath: meta.archivePath,
			});
		}
		return results;
	}
}
