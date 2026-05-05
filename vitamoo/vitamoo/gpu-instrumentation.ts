// Optional callbacks for GPU resource lifecycle — tooling, budgets, and future pooling.

export type GpuResourceKind = 'buffer' | 'texture' | 'pipeline';

export interface GpuResourceAllocatedEvent {
    kind: GpuResourceKind;
    /**
     * Stable logical name for aggregation (e.g. viewport-depth, pick-idType, image-texture, quad-uniform).
     */
    purpose: string;
    byteSize?: number;
    width?: number;
    height?: number;
    depthOrArrayLayers?: number;
    format?: string;
    label?: string;
}

export interface GpuResourceDestroyedEvent {
    kind: GpuResourceKind;
    purpose: string;
}

export interface GpuInstrumentationCallbacks {
    onResourceAllocated?: (event: GpuResourceAllocatedEvent) => void;
    onResourceDestroyed?: (event: GpuResourceDestroyedEvent) => void;
}
