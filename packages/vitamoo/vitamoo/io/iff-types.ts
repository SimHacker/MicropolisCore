// Maxis IFF types, constants, and FourCC resource codes.
// Unified across IFF 1.0 (IFFResFile) and IFF 2.0/2.5 (IFFResFile2).
//
// Sources:
//   C++: Code/msrc/File/resfile.h, IFFResFile.cpp, IFFResFile2.cpp, strset.h
//   Python: SimObliterator src/formats/iff/base.py, chunks/*.py
//   FreeSO: FSO.Files.Formats.IFF.*

// IFF file version — detected from bytes 9 and 11 of the 64-byte file header.
// IFFResFile2.cpp: kVersionHighByte = 9, kVersionLowByte = 11.
export enum IffVersion {
    UNKNOWN = 0,
    V1_0 = 0x0100,    // "IFF FILE 1.0" — IFFResFile, 16-byte chunk headers
    V2_0 = 0x0200,    // "IFF FILE 2.0" — IFFResFile2, 76-byte headers, no rsmp
    V2_5 = 0x0205,    // "IFF FILE 2.5" — IFFResFile2, 76-byte headers, rsmp offset at bytes 60-63
}

// File header geometry.
export const IFF_FILE_HEADER_SIZE = 64;
export const IFF_HEADER_PREFIX = 'IFF FILE';
export const IFF_VERSION_HIGH_BYTE = 9;
export const IFF_VERSION_LOW_BYTE = 11;
export const IFF_RSMP_OFFSET_BYTE = 60;

// Per-version chunk header sizes. size field in the chunk header includes the header itself.
export const IFF_V1_CHUNK_HEADER_SIZE = 16;  // type(4) + size(4) + id(2) + flags(2) + namenum(4)
export const IFF_V2_CHUNK_HEADER_SIZE = 76;  // type(4) + size(4) + id(2) + flags(2) + name(64)

// Chunk flags — from IFFResFile.cpp / IFFResFile2.cpp.
// Low byte holds boolean flags; high byte holds language code in IFF 2.x.
export const IFF_FLAG_INVALID       = 1 << 2;
export const IFF_FLAG_INTERNAL      = 1 << 3;
export const IFF_FLAG_LITTLE_ENDIAN = 1 << 4;
export const IFF_FLAG_LANGUAGE_MASK = 0xFF00;

// Resource type constants (FourCC).
// Collected from #define, const, enum, and iResFile::GetByID calls across Code/msrc.
// Case-sensitive — the original source uses mixed case deliberately.

export const RES_STR  = 'STR#';
export const RES_CTSS = 'CTSS';
export const RES_CST  = 'CST\0';  // 3-char type, null-padded to 4
export const RES_BHAV = 'BHAV';
export const RES_BCON = 'BCON';
export const RES_OBJD = 'OBJD';
export const RES_OBJF = 'OBJf';
export const RES_OBJM = 'ObjM';
export const RES_OBJT = 'objt';
export const RES_DGRP = 'DGRP';
export const RES_SPR  = 'SPR#';
export const RES_SPR2 = 'SPR2';
export const RES_PALT = 'PALT';
export const RES_BMP  = 'BMP_';
export const RES_FCNS = 'FCNS';
export const RES_GLOB = 'GLOB';
export const RES_SLOT = 'SLOT';
export const RES_TTAB = 'TTAB';
export const RES_TTAS = 'TTAs';
export const RES_TPRP = 'TPRP';
export const RES_TRCN = 'TRCN';
export const RES_TREE = 'TREE';
export const RES_FAMI = 'FAMI';
export const RES_FAMS = 'FAMs';
export const RES_FAMH = 'FAMh';
export const RES_NGBH = 'NGBH';
export const RES_NBRS = 'NBRS';
export const RES_RSMP = 'rsmp';
export const RES_ARRY = 'Arry';
export const RES_FWAV = 'FWAV';
export const RES_CATS = 'CATS';
export const RES_HOUS = 'HOUS';
export const RES_CARR = 'CARR';
export const RES_PICT = 'PICT';
export const RES_POSI = 'POSI';
export const RES_CMMT = 'CMMT';
export const RES_ANIM = 'ANIM';
export const RES_PIFF = 'PIFF';  // Patch IFF
export const RES_INVALID = 'XXXX';

// Language codes for STR# multi-language sets.
// 1-based index used in format -3 and -4; slot 0 is default/fallback.
// From strset.cpp and SimObliterator str_.py STRLangCode.
export enum IffLanguage {
    DEFAULT            = 0,
    ENGLISH_US         = 1,
    ENGLISH_UK         = 2,
    FRENCH             = 3,
    GERMAN             = 4,
    ITALIAN            = 5,
    SPANISH            = 6,
    DUTCH              = 7,
    DANISH             = 8,
    SWEDISH            = 9,
    NORWEGIAN          = 10,
    FINNISH            = 11,
    HEBREW             = 12,
    RUSSIAN            = 13,
    PORTUGUESE         = 14,
    JAPANESE           = 15,
    POLISH             = 16,
    SIMPLIFIED_CHINESE = 17,
    TRADITIONAL_CHINESE = 18,
    THAI               = 19,
    KOREAN             = 20,
    SLOVAK             = 21,
}

// 20 language slots (indices 0-19, mapped from 1-based codes).
export const IFF_LANGUAGE_COUNT = 20;

// Unified chunk descriptor — works for both IFF 1.0 and IFF 2.x.
export interface IffChunkInfo {
    typeFourCC: string;
    /** Total block size including header (matches fSize / FileBlockHeader.size). */
    size: number;
    /** Resource ID (SInt16 in both versions). */
    id: number;
    /** Chunk flags (SInt16). Low byte: boolean flags. High byte: language (IFF 2.x). */
    flags: number;
    /** 64-char resource name (IFF 2.x) or empty string (IFF 1.0). */
    name: string;
    /** Name index (IFF 1.0 only, UInt32); 0 for IFF 2.x. */
    namenum: number;
    /** Byte offset of chunk header from start of file. */
    blockOffset: number;
    /** Byte offset of payload (after header) from start of file. */
    dataOffset: number;
    /** Payload size in bytes (size - header size). */
    dataSize: number;
}

// STR# format codes — from strset.cpp and SimObliterator str_.py.
export const STR_FORMAT_PASCAL         =  0;  // Pascal strings (length byte + chars), single language
export const STR_FORMAT_NULL_TERM      = -1;  // Null-terminated C strings, single language
export const STR_FORMAT_PAIRS          = -2;  // Value + comment pairs (null-terminated), single language
export const STR_FORMAT_MULTI_LANG     = -3;  // Multi-language: byte lang code + C-string value + comment
export const STR_FORMAT_MULTI_LANG_LEN = -4;  // Multi-language: uint16 length-prefixed strings
