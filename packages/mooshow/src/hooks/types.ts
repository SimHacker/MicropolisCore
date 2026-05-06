export type KeyAction =
    | 'stepSceneNext' | 'stepScenePrev'
    | 'stepActorNext' | 'stepActorPrev'
    | 'stepCharacterNext' | 'stepCharacterPrev'
    | 'stepAnimationNext' | 'stepAnimationPrev'
    | 'togglePause'
    | 'setSpeed';

export interface OrbitViewState {
    rotY: number;
    rotX: number;
    zoom: number;
}

export interface MooShowHooks {
    onPick?: (actorIndex: number, x: number, y: number) => void;
    onHover?: (actorIndex: number | null) => void;
    onSelectionChange?: (actorIndex: number | null) => void;
    onHighlight?: (actorIndex: number | null) => void;
    onPlumbBobChange?: (actorIndex: number | null, visible: boolean) => void;
    onSceneIdChange?: (sceneId: string | null) => void;
    onAnimationTick?: (time: number) => void;
    onKeyAction?: (action: KeyAction, value?: number) => void;
    /** Canvas / wheel / drag changed stage orbit (sync sliders in the host UI). */
    onOrbitViewChange?: (state: OrbitViewState) => void;
}
