// Pluggable parsers for IFF resource payloads (by FourCC).
// Matches the Python @register_chunk / CHUNK_TYPES / get_chunk_class pattern
// in SimObliterator src/formats/iff/base.py.
//
// Register handlers on a ResourceHandlerRegistry, then call parseOrNull()
// to dispatch by type code. Unknown types return null (equivalent to Python's
// UnknownChunk fallback).

import type { IffChunkInfo } from './iff-types.js';

export interface ResourceParseContext {
    /** Full IFF file buffer (for cross-chunk references if needed). */
    fileBuffer: ArrayBuffer;
    /** Unified chunk descriptor — works for both IFF 1.0 and 2.x. */
    resource: IffChunkInfo;
    /** Payload only (same as getIffChunkData slice). */
    data: ArrayBuffer;
}

export interface ResourceHandler<T = unknown> {
    /** Four-character type (e.g. STR#, BHAV). */
    readonly typeFourCC: string;
    parse(ctx: ResourceParseContext): T;
}

export class ResourceHandlerRegistry {
    private readonly map = new Map<string, ResourceHandler>();

    register(handler: ResourceHandler): void {
        this.map.set(handler.typeFourCC, handler);
    }

    unregister(typeFourCC: string): void {
        this.map.delete(typeFourCC);
    }

    get(typeFourCC: string): ResourceHandler | undefined {
        return this.map.get(typeFourCC);
    }

    has(typeFourCC: string): boolean {
        return this.map.has(typeFourCC);
    }

    /** Returns handler output, or `null` if no handler is registered for this FourCC. */
    parseOrNull(ctx: ResourceParseContext): unknown | null {
        const h = this.map.get(ctx.resource.typeFourCC);
        return h ? h.parse(ctx) : null;
    }

    registeredTypes(): string[] {
        return [...this.map.keys()].sort();
    }
}
