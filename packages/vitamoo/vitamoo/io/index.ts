// Sims 1 container I/O — ground up from FAR archives through IFF resources to typed payloads.
//
// Layers (bottom → top):
//   IoBuffer          — endian-aware streaming binary reader
//   iff-types         — FourCC constants, IffVersion, IffChunkInfo, language codes, flags
//   far               — FAR v1 archive parser (CTGFile.cpp)
//   iff-maxis         — IFF 1.0 low-level parser (IFFResFile.cpp, legacy)
//   iff               — Unified IFF parser: v1 + v2.0 + v2.5 (IFFResFile2.cpp)
//   resource-handlers — Pluggable FourCC → parser registry
//   str-handler       — STR# / CTSS / CST string table parser
//
// Aligns with:
//   C++:    Code/msrc/File/ (resfile.h, IFFResFile.cpp, IFFResFile2.cpp, strset.cpp)
//   Python: SimObliterator src/formats/iff/, src/formats/far/, src/utils/binary.py

export { IoBuffer } from './io-buffer.js';

export {
    IffVersion,
    IFF_FILE_HEADER_SIZE,
    IFF_HEADER_PREFIX,
    IFF_VERSION_HIGH_BYTE,
    IFF_VERSION_LOW_BYTE,
    IFF_RSMP_OFFSET_BYTE,
    IFF_V1_CHUNK_HEADER_SIZE,
    IFF_V2_CHUNK_HEADER_SIZE,
    IFF_FLAG_INVALID,
    IFF_FLAG_INTERNAL,
    IFF_FLAG_LITTLE_ENDIAN,
    IFF_FLAG_LANGUAGE_MASK,
    RES_STR, RES_CTSS, RES_CST,
    RES_BHAV, RES_BCON,
    RES_OBJD, RES_OBJF, RES_OBJM, RES_OBJT,
    RES_DGRP, RES_SPR, RES_SPR2, RES_PALT, RES_BMP,
    RES_FCNS, RES_GLOB, RES_SLOT,
    RES_TTAB, RES_TTAS, RES_TPRP, RES_TRCN, RES_TREE,
    RES_FAMI, RES_FAMS, RES_FAMH,
    RES_NGBH, RES_NBRS,
    RES_RSMP, RES_ARRY, RES_FWAV, RES_CATS,
    RES_HOUS, RES_CARR, RES_PICT, RES_POSI, RES_CMMT,
    RES_ANIM, RES_PIFF, RES_INVALID,
    IffLanguage,
    IFF_LANGUAGE_COUNT,
    STR_FORMAT_PASCAL, STR_FORMAT_NULL_TERM, STR_FORMAT_PAIRS,
    STR_FORMAT_MULTI_LANG, STR_FORMAT_MULTI_LANG_LEN,
} from './iff-types.js';
export type { IffChunkInfo } from './iff-types.js';

export {
    detectIffVersion,
    isIff,
    readRsmpOffset,
    listIffChunks,
    getIffChunkData,
    chunkPayloadReader,
    iffChunkSummary,
    filterChunksByType,
    findChunkByTypeAndId,
} from './iff.js';

export {
    MAXIS_IFF1_HEADER,
    MAXIS_IFF_FLAG_INVALID,
    MAXIS_IFF_FLAG_INTERNAL,
    MAXIS_IFF_FLAG_LITTLE_ENDIAN,
    isMaxisIff1,
    readMaxisIff1BlockHeader,
    listMaxisIff1Resources,
    getMaxisIff1ResourceData,
} from './iff-maxis.js';
export type { MaxisIff1BlockHeader, MaxisIff1Resource } from './iff-maxis.js';

export {
    FAR_MAGIC,
    FAR_VERSION,
    isFar,
    parseFar,
    extractFarEntry,
} from './far.js';
export type { FarArchive, FarEntry } from './far.js';

export { ResourceHandlerRegistry } from './resource-handlers.js';
export type { ResourceHandler, ResourceParseContext } from './resource-handlers.js';

export {
    parseStr,
    parseCst,
    strStrings,
    strGet,
    strGetLang,
    strHandler,
    ctssHandler,
    cstHandler,
} from './str-handler.js';
export type { StrItem, StrLanguageSet, StrResource } from './str-handler.js';

export {
    buildGuidObjectMap,
    appendGuidObjectMap,
    analyzeGuidBucket,
    analyzeGuidObjectMap,
    buildGuidCollisionWarnings,
} from './guid-collision.js';
export type {
    GuidValue,
    ObjectSourceKind,
    GuidCollisionObject,
    GuidObjectMap,
    GuidExactMatchGroup,
    GuidSimilarityMatrix,
    GuidCollisionAnalysis,
    GuidCollisionWarning,
    GuidCollisionOptions,
} from './guid-collision.js';
