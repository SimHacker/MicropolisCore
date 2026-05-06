/**
 * L0 — Resource I/O abstraction.
 *
 * The ONLY layer that knows *how* bytes are obtained.
 * Everything above L0 works with logical POSIX-style paths relative to a root.
 *
 * Implementations:
 *   - NodeResourceProvider   (Node.js `fs` — server / CLI)
 *   - MemoryResourceProvider (in-memory fixtures — tests)
 *   - FsAccessResourceProvider (future: browser File System Access API)
 */

export interface ResourceProvider {
	/** Read a file by logical path. Returns null if the file does not exist. */
	read(logicalPath: string): Promise<ArrayBuffer | null>;

	/** Return true if the logical path exists (file or directory). */
	exists(logicalPath: string): Promise<boolean>;

	/**
	 * List the direct children of a logical directory path.
	 * Returns { name, isDirectory } for each entry.
	 * Returns empty array if the path does not exist or is not a directory.
	 */
	list(logicalPath: string): Promise<ResourceEntry[]>;
}

export interface ResourceEntry {
	name: string;
	isDirectory: boolean;
}

/** Normalise a logical path: lowercase, forward slashes, no leading slash. */
export function normalisePath(p: string): string {
	return p.replace(/\\/g, '/').replace(/^\//, '').toLowerCase();
}
