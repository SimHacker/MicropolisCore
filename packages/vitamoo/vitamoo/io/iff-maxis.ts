// Maxis IFF 1.0 container (IFFResFile) — matches Code/msrc/File/IFFResFile.cpp layout.
// After a 64-byte signature, resources are a chain of big-endian FileBlockHeader + payload.

const IFF1_TEXT =
    'IFF FILE 1.0:TYPE FOLLOWED BY SIZE\x00 JAMIE DOORNBOS & MAXIS 1996\x00';

/** First 64 bytes of a Maxis IFF 1.0 file (IFFResFile). */
export const MAXIS_IFF1_HEADER = new TextEncoder().encode(IFF1_TEXT);

if (MAXIS_IFF1_HEADER.length !== 64) {
    throw new Error(`MAXIS_IFF1_HEADER: expected 64 bytes, got ${MAXIS_IFF1_HEADER.length}`);
}

const FILE_BLOCK_HEADER_SIZE = 16;

/** Resource block header on disk (big-endian). */
export interface MaxisIff1BlockHeader {
    /** Four-character type (e.g. STR#, BHAV). */
    typeFourCC: string;
    /** Total byte size of this block including this header. */
    size: number;
    id: number;
    flags: number;
    namenum: number;
}

export const MAXIS_IFF_FLAG_INVALID = 1 << 2;
export const MAXIS_IFF_FLAG_INTERNAL = 1 << 3;
export const MAXIS_IFF_FLAG_LITTLE_ENDIAN = 1 << 4;

export interface MaxisIff1Resource {
    header: MaxisIff1BlockHeader;
    /** Byte offset of FileBlockHeader from start of file. */
    blockOffset: number;
    /** Payload start (after 16-byte header). */
    dataOffset: number;
    /** Payload length (header.size - 16). */
    dataSize: number;
}

function readUint32BE(view: DataView, offset: number): number {
    return view.getUint32(offset, false);
}

function readInt16BE(view: DataView, offset: number): number {
    return view.getInt16(offset, false);
}

function readFourCC(view: DataView, offset: number): string {
    return String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
    );
}

function headersEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

/** True if buffer begins with the Maxis IFF 1.0 signature. */
export function isMaxisIff1(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < MAXIS_IFF1_HEADER.length) return false;
    const head = new Uint8Array(buffer, 0, MAXIS_IFF1_HEADER.length);
    return headersEqual(head, MAXIS_IFF1_HEADER);
}

export function readMaxisIff1BlockHeader(view: DataView, offset: number): MaxisIff1BlockHeader {
    return {
        typeFourCC: readFourCC(view, offset),
        size: readUint32BE(view, offset + 4),
        id: readInt16BE(view, offset + 8),
        flags: readInt16BE(view, offset + 10),
        namenum: readUint32BE(view, offset + 12),
    };
}

/**
 * Walk the block chain after the 64-byte header. Invalid / free fragments (kInvalid) are included
 * with `header.flags & MAXIS_IFF_FLAG_INVALID`.
 */
export function listMaxisIff1Resources(buffer: ArrayBuffer): MaxisIff1Resource[] {
    if (!isMaxisIff1(buffer)) {
        throw new Error('listMaxisIff1Resources: not a Maxis IFF 1.0 file (bad 64-byte header)');
    }
    const view = new DataView(buffer);
    const out: MaxisIff1Resource[] = [];
    let offset = MAXIS_IFF1_HEADER.length;
    while (offset + FILE_BLOCK_HEADER_SIZE <= buffer.byteLength) {
        const header = readMaxisIff1BlockHeader(view, offset);
        if (header.size < FILE_BLOCK_HEADER_SIZE) {
            throw new Error(
                `listMaxisIff1Resources: corrupt block at ${offset}: size ${header.size} < ${FILE_BLOCK_HEADER_SIZE}`,
            );
        }
        const dataSize = header.size - FILE_BLOCK_HEADER_SIZE;
        const next = offset + header.size;
        if (next > buffer.byteLength) {
            throw new Error(
                `listMaxisIff1Resources: block at ${offset} extends past EOF (${next} > ${buffer.byteLength})`,
            );
        }
        out.push({
            header,
            blockOffset: offset,
            dataOffset: offset + FILE_BLOCK_HEADER_SIZE,
            dataSize,
        });
        offset = next;
    }
    return out;
}

/** Slice payload bytes for one resource entry. */
export function getMaxisIff1ResourceData(buffer: ArrayBuffer, res: MaxisIff1Resource): ArrayBuffer {
    return buffer.slice(res.dataOffset, res.dataOffset + res.dataSize);
}
