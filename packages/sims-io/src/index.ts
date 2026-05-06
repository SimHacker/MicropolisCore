/**
 * @micropolis/sims-io
 *
 * Pure-TypeScript Sims 1 I/O stack.
 *
 * Layers:
 *   L0  — Resource I/O adapters (how bytes are obtained)
 *   L1  — Virtual tree (merges loose files + FAR archives)
 *   L2  — Binary format parsers (re-exported from vitamoo: FAR, IFF, STR#, …)
 *   L3  — Save/content domain (FAMI, NBRS, neighborhood graph) — TODO
 *   L4  — VitaMoo bridge (ContentIndex emitter) — TODO
 *
 * L2 is already implemented in `vitamoo` — import directly:
 *   import { parseFar, listIffChunks, detectIffVersion, isFar, isIff } from 'vitamoo';
 */

// L0 — I/O adapters
export { NodeResourceProvider } from './l0/node.js';
export { MemoryResourceProvider } from './l0/memory.js';
export type { ResourceProvider, ResourceEntry } from './l0/types.js';
export { normalisePath } from './l0/types.js';

// L1 — Virtual tree
export { VirtualTree } from './l1/virtual-tree.js';
export type { VirtualEntry } from './l1/virtual-tree.js';

// L3 — Save / content domain
export { PersonData, VISIBLE_SKILLS, ALL_SKILLS, PERSONALITY_TRAITS, ZODIAC_NAMES, scalePersonData } from './l3/person-data.js';
export { parseFami, FAMI_IN_HOUSE, FAMI_USER_CREATED, FAMI_IN_CAS } from './l3/fami.js';
export type { FamiChunk } from './l3/fami.js';
export { parseNbrs, resolveFamilies } from './l3/nbrs.js';
export type { NbrsChunk, Neighbour } from './l3/nbrs.js';
