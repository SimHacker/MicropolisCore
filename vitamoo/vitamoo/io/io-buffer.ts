// Endian-aware streaming binary reader for IFF and FAR parsing.
// Matches the convention of SimObliterator's IoBuffer (src/utils/binary.py):
// file-level reads use big-endian (IFF headers), chunk payloads use little-endian.
//
// Distinct from vitamoo/reader.ts BinaryReader which is CTGFile-oriented
// (always LE, length-prefixed strings, CFP delta codec). This IoBuffer serves
// the lower-level container formats: FAR, IFF headers, resource chunks.

export class IoBuffer {
    private readonly view: DataView;
    private pos: number;
    readonly littleEndian: boolean;

    constructor(buffer: ArrayBuffer, offset = 0, length?: number, littleEndian = true) {
        this.view = new DataView(buffer, offset, length);
        this.pos = 0;
        this.littleEndian = littleEndian;
    }

    static fromArrayBuffer(buffer: ArrayBuffer, littleEndian = true): IoBuffer {
        return new IoBuffer(buffer, 0, undefined, littleEndian);
    }

    get position(): number { return this.pos; }
    set position(v: number) { this.pos = v; }
    get byteLength(): number { return this.view.byteLength; }
    get remaining(): number { return this.view.byteLength - this.pos; }
    get hasMore(): boolean { return this.pos < this.view.byteLength; }

    hasBytes(n: number): boolean {
        return this.pos + n <= this.view.byteLength;
    }

    skip(n: number): void { this.pos += n; }

    readUint8(): number {
        return this.view.getUint8(this.pos++);
    }

    readInt8(): number {
        return this.view.getInt8(this.pos++);
    }

    readUint16(): number {
        const v = this.view.getUint16(this.pos, this.littleEndian);
        this.pos += 2;
        return v;
    }

    readInt16(): number {
        const v = this.view.getInt16(this.pos, this.littleEndian);
        this.pos += 2;
        return v;
    }

    readUint32(): number {
        const v = this.view.getUint32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }

    readInt32(): number {
        const v = this.view.getInt32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }

    readFloat32(): number {
        const v = this.view.getFloat32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }

    readFourCC(): string {
        return String.fromCharCode(
            this.view.getUint8(this.pos++),
            this.view.getUint8(this.pos++),
            this.view.getUint8(this.pos++),
            this.view.getUint8(this.pos++),
        );
    }

    readCString(length: number, trimNull = true): string {
        let s = '';
        const end = this.pos + length;
        for (let i = this.pos; i < end; i++) {
            s += String.fromCharCode(this.view.getUint8(i));
        }
        this.pos = end;
        if (trimNull) {
            const idx = s.indexOf('\0');
            if (idx !== -1) s = s.substring(0, idx);
        }
        return s;
    }

    readNullTerminatedString(): string {
        let s = '';
        while (this.pos < this.view.byteLength) {
            const c = this.view.getUint8(this.pos++);
            if (c === 0) break;
            s += String.fromCharCode(c);
        }
        return s;
    }

    readPascalString(): string {
        const len = this.readUint8();
        return this.readCString(len, true);
    }

    readBytes(count: number): Uint8Array {
        const out = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
            out[i] = this.view.getUint8(this.pos++);
        }
        return out;
    }

    sliceBuffer(length: number): ArrayBuffer {
        const start = this.view.byteOffset + this.pos;
        const ab = (this.view.buffer as ArrayBuffer).slice(start, start + length);
        this.pos += length;
        return ab;
    }

    // Create a sub-reader for a chunk payload — views the same backing buffer (no copy).
    // Typical use: read chunk header in big-endian, then subReader(dataSize, true) for
    // the little-endian payload.
    subReader(length: number, littleEndian?: boolean): IoBuffer {
        const offset = this.view.byteOffset + this.pos;
        const buf = new IoBuffer(
            this.view.buffer as ArrayBuffer, offset, length, littleEndian ?? this.littleEndian,
        );
        this.pos += length;
        return buf;
    }
}
