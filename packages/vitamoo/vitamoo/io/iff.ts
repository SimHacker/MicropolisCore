// Unified Maxis IFF parser — handles IFF 1.0 (IFFResFile) and IFF 2.0/2.5 (IFFResFile2).
//
// Matches:
//   C++:    IFFResFile.cpp (v1), IFFResFile2.cpp (v2.x)
//   Python: SimObliterator iff_file.py (v2.x only)
//
// Convention: file header and chunk headers are big-endian.
// Chunk payloads are little-endian. The Python code creates IoBuffer(BIG_ENDIAN) for the
// file, reads chunks, then creates IoBuffer(LITTLE_ENDIAN) for each payload. The C++ uses
// Swizzle macros on the header fields. We read headers in BE mode and produce LE sub-readers
// for payloads via chunkPayloadReader().

import { IoBuffer } from './io-buffer.js';
import {
    IffVersion,
    IFF_FILE_HEADER_SIZE,
    IFF_HEADER_PREFIX,
    IFF_VERSION_HIGH_BYTE,
    IFF_VERSION_LOW_BYTE,
    IFF_RSMP_OFFSET_BYTE,
    IFF_V1_CHUNK_HEADER_SIZE,
    IFF_V2_CHUNK_HEADER_SIZE,
    type IffChunkInfo,
} from './iff-types.js';

/**
 * Detect IFF version from the first 64 bytes.
 * Returns IffVersion.UNKNOWN if the buffer is too small or doesn't start with "IFF FILE".
 */
export function detectIffVersion(buffer: ArrayBuffer): IffVersion {
    if (buffer.byteLength < IFF_FILE_HEADER_SIZE) return IffVersion.UNKNOWN;
    const view = new DataView(buffer);

    for (let i = 0; i < IFF_HEADER_PREFIX.length; i++) {
        if (view.getUint8(i) !== IFF_HEADER_PREFIX.charCodeAt(i)) return IffVersion.UNKNOWN;
    }

    const hi = String.fromCharCode(view.getUint8(IFF_VERSION_HIGH_BYTE));
    const lo = String.fromCharCode(view.getUint8(IFF_VERSION_LOW_BYTE));

    if (hi === '1' && lo === '0') return IffVersion.V1_0;
    if (hi === '2' && lo === '0') return IffVersion.V2_0;
    if (hi === '2' && lo === '5') return IffVersion.V2_5;
    return IffVersion.UNKNOWN;
}

/** True if buffer starts with a recognizable Maxis IFF header. */
export function isIff(buffer: ArrayBuffer): boolean {
    return detectIffVersion(buffer) !== IffVersion.UNKNOWN;
}

/**
 * Read the rsmp (resource map) offset from bytes 60-63 (big-endian SInt32).
 * Only meaningful for IFF 2.5; returns 0 for other versions or short buffers.
 */
export function readRsmpOffset(buffer: ArrayBuffer): number {
    if (buffer.byteLength < IFF_FILE_HEADER_SIZE) return 0;
    return new DataView(buffer).getInt32(IFF_RSMP_OFFSET_BYTE, false);
}

/**
 * Parse all chunk descriptors from an IFF file.
 * Works for v1.0, v2.0, and v2.5. Chunks start at byte 64.
 *
 * The returned IffChunkInfo array includes every block in file order, including
 * invalid/deleted blocks (check IFF_FLAG_INVALID in flags). This matches the
 * Python IffFile._read_from_stream walk and the C++ block-chain scan.
 */
export function listIffChunks(buffer: ArrayBuffer): IffChunkInfo[] {
    const version = detectIffVersion(buffer);
    if (version === IffVersion.UNKNOWN) {
        throw new Error('listIffChunks: not a Maxis IFF file');
    }

    const chunkHeaderSize = version === IffVersion.V1_0
        ? IFF_V1_CHUNK_HEADER_SIZE
        : IFF_V2_CHUNK_HEADER_SIZE;

    const io = new IoBuffer(buffer, 0, undefined, false);  // big-endian for headers
    io.position = IFF_FILE_HEADER_SIZE;

    const chunks: IffChunkInfo[] = [];

    while (io.hasBytes(chunkHeaderSize)) {
        const blockOffset = io.position;
        const typeFourCC = io.readFourCC();
        const size = io.readInt32();   // SInt32, total block including header

        if (size < chunkHeaderSize) {
            throw new Error(
                `listIffChunks: corrupt chunk at offset ${blockOffset}: size ${size} < header ${chunkHeaderSize}`,
            );
        }

        const id = io.readInt16();
        const flags = io.readInt16();

        let name = '';
        let namenum = 0;
        if (version === IffVersion.V1_0) {
            namenum = io.readUint32();
        } else {
            name = io.readCString(64);   // 64-byte null-terminated name field
        }

        const dataSize = size - chunkHeaderSize;
        const dataOffset = blockOffset + chunkHeaderSize;
        const nextBlock = blockOffset + size;

        if (nextBlock > buffer.byteLength) {
            throw new Error(
                `listIffChunks: chunk at offset ${blockOffset} extends past EOF (${nextBlock} > ${buffer.byteLength})`,
            );
        }

        chunks.push({ typeFourCC, size, id, flags, name, namenum, blockOffset, dataOffset, dataSize });
        io.position = nextBlock;
    }

    return chunks;
}

/** Slice the raw payload bytes for a chunk. Returns a new ArrayBuffer (copy). */
export function getIffChunkData(buffer: ArrayBuffer, chunk: IffChunkInfo): ArrayBuffer {
    return buffer.slice(chunk.dataOffset, chunk.dataOffset + chunk.dataSize);
}

/**
 * Create a little-endian IoBuffer for a chunk's payload.
 * Views the same backing buffer (no copy) — matches the Python pattern of
 * IoBuffer.from_bytes(chunk_data, ByteOrder.LITTLE_ENDIAN).
 */
export function chunkPayloadReader(buffer: ArrayBuffer, chunk: IffChunkInfo): IoBuffer {
    return new IoBuffer(buffer, chunk.dataOffset, chunk.dataSize, true);
}

/** Count chunks by FourCC type. */
export function iffChunkSummary(chunks: IffChunkInfo[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const c of chunks) {
        counts.set(c.typeFourCC, (counts.get(c.typeFourCC) ?? 0) + 1);
    }
    return counts;
}

/** Find all chunks matching a FourCC type code. */
export function filterChunksByType(chunks: IffChunkInfo[], typeFourCC: string): IffChunkInfo[] {
    return chunks.filter(c => c.typeFourCC === typeFourCC);
}

/** Find a chunk by type and ID, or undefined. */
export function findChunkByTypeAndId(
    chunks: IffChunkInfo[], typeFourCC: string, id: number,
): IffChunkInfo | undefined {
    return chunks.find(c => c.typeFourCC === typeFourCC && c.id === id);
}
