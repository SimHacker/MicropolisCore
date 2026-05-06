// STR# / CTSS / CST chunk parser — Maxis string tables.
//
// Matches:
//   C++:    Code/msrc/File/strset.cpp — Load(), format versions 0/-1/-2/-3
//   Python: SimObliterator src/formats/iff/chunks/str_.py — formats 0/-1/-2/-3/-4
//   FreeSO: FSO.Files.Formats.IFF.Chunks.STR
//
// Format codes (first SInt16 of payload, little-endian):
//    0  Pascal strings (length byte + chars), single language
//   -1  Null-terminated C strings, single language
//   -2  Value + comment pairs (null-terminated), single language
//   -3  Multi-language: byte lang code + C-string value + C-string comment
//   -4  Multi-language: byte lang code + uint16-prefixed value + uint16-prefixed comment
//
// CST (kCStringSetResType from strset.h): raw buffer split on '^' characters.
// CTSS (catalog strings): same binary layout as STR#, registered separately.

import { IoBuffer } from './io-buffer.js';
import {
    IFF_LANGUAGE_COUNT,
    RES_STR,
    RES_CTSS,
    RES_CST,
    STR_FORMAT_PASCAL,
    STR_FORMAT_NULL_TERM,
    STR_FORMAT_PAIRS,
    STR_FORMAT_MULTI_LANG,
    STR_FORMAT_MULTI_LANG_LEN,
} from './iff-types.js';
import type { ResourceHandler, ResourceParseContext } from './resource-handlers.js';

export interface StrItem {
    value: string;
    comment: string;
    /** 1-based language code (matches IffLanguage enum). */
    languageCode: number;
}

export interface StrLanguageSet {
    strings: StrItem[];
}

export interface StrResource {
    formatCode: number;
    /** 20 language slots (index 0 = lang code 1, i.e. English US). */
    languageSets: StrLanguageSet[];
}

function emptyLanguageSets(): StrLanguageSet[] {
    return Array.from({ length: IFF_LANGUAGE_COUNT }, () => ({ strings: [] }));
}

/**
 * Parse a STR# or CTSS chunk payload (little-endian ArrayBuffer).
 * Handles all 5 format versions. Unknown formats return empty language sets.
 */
export function parseStr(data: ArrayBuffer): StrResource {
    const io = new IoBuffer(data, 0, undefined, true);
    const languageSets = emptyLanguageSets();

    if (!io.hasBytes(2)) return { formatCode: 0, languageSets };
    const formatCode = io.readInt16();
    if (!io.hasMore) return { formatCode, languageSets };

    if (formatCode === STR_FORMAT_PASCAL) {
        const n = io.readUint16();
        const strings: StrItem[] = [];
        for (let i = 0; i < n; i++) {
            strings.push({ value: io.readPascalString(), comment: '', languageCode: 1 });
        }
        languageSets[0].strings = strings;

    } else if (formatCode === STR_FORMAT_NULL_TERM) {
        const n = io.readUint16();
        const strings: StrItem[] = [];
        for (let i = 0; i < n; i++) {
            strings.push({ value: io.readNullTerminatedString(), comment: '', languageCode: 1 });
        }
        languageSets[0].strings = strings;

    } else if (formatCode === STR_FORMAT_PAIRS) {
        const n = io.readUint16();
        const strings: StrItem[] = [];
        for (let i = 0; i < n; i++) {
            const value = io.readNullTerminatedString();
            const comment = io.readNullTerminatedString();
            strings.push({ value, comment, languageCode: 1 });
        }
        languageSets[0].strings = strings;

    } else if (formatCode === STR_FORMAT_MULTI_LANG) {
        // strset.cpp v3: byte langCode + C-string value + C-string comment
        const n = io.readUint16();
        for (let i = 0; i < n; i++) {
            const langCode = io.readUint8();
            const value = io.readNullTerminatedString();
            const comment = io.readNullTerminatedString();
            if (langCode > 0 && langCode <= IFF_LANGUAGE_COUNT) {
                languageSets[langCode - 1].strings.push({ value, comment, languageCode: langCode });
            }
        }

    } else if (formatCode === STR_FORMAT_MULTI_LANG_LEN) {
        // FreeSO/SimObliterator format -4: byte numSets, then per set: uint16 count,
        // then per string: byte langCode + uint16-prefixed value + uint16-prefixed comment.
        const numSets = io.readUint8();
        for (let s = 0; s < numSets; s++) {
            const n = io.readUint16();
            for (let i = 0; i < n; i++) {
                const langCode = io.readUint8();
                const value = readLengthPrefixed(io);
                const comment = readLengthPrefixed(io);
                if (langCode > 0 && langCode <= IFF_LANGUAGE_COUNT) {
                    languageSets[langCode - 1].strings.push({ value, comment, languageCode: langCode });
                }
            }
        }
    }

    return { formatCode, languageSets };
}

function readLengthPrefixed(io: IoBuffer): string {
    const len = io.readUint16();
    if (len === 0) return '';
    const bytes = io.readBytes(len);
    return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/, '');
}

/**
 * Parse a CST (C-string set) chunk. Raw buffer split on '^' characters.
 * strset.cpp fCst path.
 */
export function parseCst(data: ArrayBuffer): StrResource {
    const text = new TextDecoder('latin1').decode(data);
    const parts = text.split('^');
    const languageSets = emptyLanguageSets();
    languageSets[0].strings = parts.map(value => ({ value, comment: '', languageCode: 1 }));
    return { formatCode: 0, languageSets };
}

/** Get all strings from the first language set (English US / default). */
export function strStrings(res: StrResource): string[] {
    const set = res.languageSets[0];
    return set ? set.strings.map(s => s.value) : [];
}

/** Get a string by index from the first language set, or undefined. */
export function strGet(res: StrResource, index: number): string | undefined {
    const set = res.languageSets[0];
    if (!set || index < 0 || index >= set.strings.length) return undefined;
    return set.strings[index].value;
}

/** Get a string by index and language code (1-based), falling back to slot 0. */
export function strGetLang(res: StrResource, index: number, langCode: number): string | undefined {
    const slotIndex = langCode > 0 && langCode <= IFF_LANGUAGE_COUNT ? langCode - 1 : 0;
    let set = res.languageSets[slotIndex];
    if (!set || set.strings.length === 0) set = res.languageSets[0];
    if (!set || index < 0 || index >= set.strings.length) return undefined;
    return set.strings[index].value;
}

// ResourceHandler implementations for the registry.

export const strHandler: ResourceHandler<StrResource> = {
    typeFourCC: RES_STR,
    parse(ctx: ResourceParseContext): StrResource { return parseStr(ctx.data); },
};

export const ctssHandler: ResourceHandler<StrResource> = {
    typeFourCC: RES_CTSS,
    parse(ctx: ResourceParseContext): StrResource { return parseStr(ctx.data); },
};

export const cstHandler: ResourceHandler<StrResource> = {
    typeFourCC: RES_CST,
    parse(ctx: ResourceParseContext): StrResource { return parseCst(ctx.data); },
};
