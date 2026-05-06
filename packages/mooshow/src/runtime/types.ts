/// <reference types="@webgpu/types" />
import type { TextureHandle } from 'vitamoo';
import type { Practice } from 'vitamoo';

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface TopPhysicsState {
    active: boolean;
    tilt: number;
    tiltTarget: number;
    precessionAngle: number;
    nutationPhase: number;
    nutationAmp: number;
    driftX: number;
    driftZ: number;
    driftVX: number;
    driftVZ: number;
}

export interface BodyMeshEntry {
    mesh: any;
    boneMap: Map<string, any>;
    texture: TextureHandle | null;
}

export interface Body {
    skeleton: any[] | null;
    /** Original skeleton bone data (immutable rest poses for GPU animation cache). */
    skeletonBoneData: any[] | null;
    meshes: BodyMeshEntry[];
    /** Active animation practices, sorted by priority ascending during applyPractices. */
    practices: Practice[];
    /** Cached bone name -> index mapping (stable per skeleton, built once). */
    boneNameToIndex: Map<string, number> | null;
    personData: any | null;
    actorName: string;
    x: number;
    z: number;
    direction: number;
    spinOffset: number;
    spinVelocity: number;
    /** Uniform scale around Y=0 (default 1). */
    scale: number;
    top: TopPhysicsState;
}

export function createBody(): Body {
    return {
        skeleton: null,
        skeletonBoneData: null,
        meshes: [],
        practices: [],
        boneNameToIndex: null,
        personData: null,
        actorName: '',
        x: 0,
        z: 0,
        direction: 0,
        spinOffset: 0,
        spinVelocity: 0,
        scale: 1,
        top: {
            active: false, tilt: 0, tiltTarget: 0,
            precessionAngle: 0, nutationPhase: 0, nutationAmp: 0,
            driftX: 0, driftZ: 0, driftVX: 0, driftVZ: 0,
        },
    };
}

export function createTopState(): TopPhysicsState {
    return {
        active: false, tilt: 0, tiltTarget: 0,
        precessionAngle: 0, nutationPhase: 0, nutationAmp: 0,
        driftX: 0, driftZ: 0, driftVX: 0, driftVZ: 0,
    };
}
