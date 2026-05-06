import type { MeshData } from '../types.js';

export { createDiamondMesh } from './diamond.js';

/** Procedural mesh factory: (params?) => MeshData. Generate once, cache, use in display list. */
export type ProceduralMeshFactory = (params?: { size?: number; segments?: number }) => MeshData;
