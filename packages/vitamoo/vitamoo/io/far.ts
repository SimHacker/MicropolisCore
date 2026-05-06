// Maxis FAR archive — matches Code/CTGLib/CTGFile.cpp AddFARToMapping (FAR version 1).
// Magic: "FAR!byAZ", little-endian directory at end. Payload is stored uncompressed when
// raw size equals compressed size (standard game FARs).

export const knFARTag = 'FAR!byAZ';
export const FAR_MAGIC = knFARTag;
export const FAR_VERSION = 1;

export interface FarEntry {
    /** Uncompressed size (also used as slice length when uncompressed). */
    rawSize: number;
    compressedSize: number;
    /** Offset of payload from start of FAR file. */
    dataOffset: number;
    /** Path inside archive (mixed separators; game lowercases and uses backslash). */
    path: string;
}

export interface FarArchive {
    version: number;
    directoryOffset: number;
    entries: FarEntry[];
}

function readUint32LE(view: DataView, offset: number): number {
    return view.getUint32(offset, true);
}

function readAscii(view: DataView, offset: number, length: number): string {
    let s = '';
    for (let i = 0; i < length; i++) {
        s += String.fromCharCode(view.getUint8(offset + i));
    }
    return s;
}

/** True if buffer starts with FAR magic. */
export function isFar(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < 8) return false;
    const view = new DataView(buffer);
    const magic = readAscii(view, 0, 8);
    return magic === FAR_MAGIC;
}

/**
 * Parse a FAR v1 archive. Throws if magic or version mismatch, or directory is corrupt.
 * If `compressedSize !== rawSize`, payload may be compressed — `extractFarEntry` throws unless equal.
 */
export function parseFar(buffer: ArrayBuffer): FarArchive {
    const view = new DataView(buffer);
    if (buffer.byteLength < 16) throw new Error('parseFar: buffer too small');
    const magic = readAscii(view, 0, 8);
    if (magic !== FAR_MAGIC) throw new Error(`parseFar: bad magic (expected ${FAR_MAGIC})`);
    const version = readUint32LE(view, 8);
    if (version !== FAR_VERSION) {
        throw new Error(`parseFar: unsupported version ${version} (expected ${FAR_VERSION})`);
    }
    const directoryOffset = readUint32LE(view, 12);
    if (directoryOffset < 16 || directoryOffset > buffer.byteLength) {
        throw new Error(`parseFar: invalid directory offset ${directoryOffset}`);
    }

    let pos = directoryOffset;
    if (pos + 4 > buffer.byteLength) throw new Error('parseFar: truncated directory (count)');
    const numEntries = readUint32LE(view, pos);
    pos += 4;
    if (numEntries < 0 || numEntries > 500_000) {
        throw new Error(`parseFar: suspicious entry count ${numEntries}`);
    }

    const entries: FarEntry[] = [];
    for (let i = 0; i < numEntries; i++) {
        if (pos + 16 > buffer.byteLength) throw new Error(`parseFar: truncated directory entry ${i}`);
        const rawSize = readUint32LE(view, pos);
        const compressedSize = readUint32LE(view, pos + 4);
        const dataOffset = readUint32LE(view, pos + 8);
        const nameLen = readUint32LE(view, pos + 12);
        pos += 16;
        if (nameLen < 0 || nameLen > 2046 || pos + nameLen > buffer.byteLength) {
            throw new Error(`parseFar: bad filename length ${nameLen} at entry ${i}`);
        }
        const path = readAscii(view, pos, nameLen);
        pos += nameLen;
        entries.push({ rawSize, compressedSize, dataOffset, path });
    }

    return { version, directoryOffset, entries };
}

/** Return uncompressed payload for an entry; requires compressedSize === rawSize. */
export function extractFarEntry(buffer: ArrayBuffer, entry: FarEntry): ArrayBuffer {
    if (entry.compressedSize !== entry.rawSize) {
        throw new Error(
            'extractFarEntry: compressedSize !== rawSize; decompression not implemented',
        );
    }
    const end = entry.dataOffset + entry.rawSize;
    if (entry.dataOffset < 0 || end > buffer.byteLength) {
        throw new Error('extractFarEntry: entry slice out of bounds');
    }
    return buffer.slice(entry.dataOffset, end);
}
