
export interface Sprite {
    name: string;
    id: number;
    frame: number;
    x: number;
    y: number;
    width: number;
    height: number;
    xOffset: number;
    yOffset: number;
    xHot: number;
    yHot: number;
    origX: number;
    origY: number;
    destX: number;
    destY: number;
    count: number;
    soundCount: number;
    dir: number;
    newDir: number;
    step: number;
    flag: number;
    control: number;
    turn: number;
    accel: number;
    speed: number;
    frames: number[];
};

export enum SpiteIds {
    SPRITE_UNUSED     = 0,
    SPRITE_TRAIN      = 1,
    SPRITE_HELICOPTER = 2,
    SPRITE_AIRPLANE   = 3,
    SPRITE_SHIP       = 4,
    SPRITE_MONSTER    = 5,
    SPRITE_TORNADO    = 6,
    SPRITE_EXPLOSION  = 7,
    SPRITE_BUS        = 8,
    SPRITE_COUNT      = 9,
};

export enum SpriteTrain {
    SPRITE_FRAME_N_S       = 0,
    SPRITE_FRAME_W_E       = 1,
    SPRITE_FRAME_NW_SE     = 2,
    SPRITE_FRAME_NE_SW     = 3,
    SPRITE_FRAME_INVISIBLE = 4,
    SPRITE_FRAME_COUNT     = 5,
    SPRITE_WIDTH           = 32,
    SPRITE_HEIGHT          = 32,
    SPRITE_OFFSET_X        = 32,
    SPRITE_OFFSET_Y        = -16,
    SPRITE_HOT_X           = 40,
    SPRITE_HOT_Y           = -8,
};

export enum SpriteHelicopter {
    SPRITE_FRAME_N     = 0,
    SPRITE_FRAME_NE    = 1,
    SPRITE_FRAME_E     = 2,
    SPRITE_FRAME_SE    = 3,
    SPRITE_FRAME_S     = 4,
    SPRITE_FRAME_SW    = 5,
    SPRITE_FRAME_W     = 6,
    SPRITE_FRAME_NW    = 7,
    SPRITE_FRAME_COUNT = 8,
    SPRITE_WIDTH       = 32,
    SPRITE_HEIGHT      = 32,
    SPRITE_OFFSET_X    = 32,
    SPRITE_OFFSET_Y    = -16,
    SPRITE_HOT_X       = 40,
    SPRITE_HOT_Y       = -8,
};

export enum SpriteAirplane {
    SPRITE_FRAME_N        = 0,
    SPRITE_FRAME_NE       = 1,
    SPRITE_FRAME_E        = 2,
    SPRITE_FRAME_SE       = 3,
    SPRITE_FRAME_S        = 4,
    SPRITE_FRAME_SW       = 5,
    SPRITE_FRAME_W        = 6,
    SPRITE_FRAME_NW       = 7,
    SPRITE_FRAME_E_LAND_1 = 8,
    SPRITE_FRAME_E_LAND_2 = 9,
    SPRITE_FRAME_E_LAND_3 = 10,
    SPRITE_FRAME_COUNT    = 11,
    SPRITE_WIDTH          = 48,
    SPRITE_HEIGHT         = 48,
    SPRITE_OFFSET_X       = 24,
    SPRITE_OFFSET_Y       = 0,
    SPRITE_HOT_X          = 48,
    SPRITE_HOT_Y          = 16,
};

export enum SpriteShip {
    SPRITE_FRAME_N     = 0,
    SPRITE_FRAME_NE    = 1,
    SPRITE_FRAME_E     = 2,
    SPRITE_FRAME_SE    = 3,
    SPRITE_FRAME_S     = 4,
    SPRITE_FRAME_SW    = 5,
    SPRITE_FRAME_W     = 6,
    SPRITE_FRAME_NW    = 7,
    SPRITE_FRAME_COUNT = 8,
    SPRITE_WIDTH       = 48,
    SPRITE_HEIGHT      = 48,
    SPRITE_OFFSET_X    = 32,
    SPRITE_OFFSET_Y    = -16,
    SPRITE_HOT_X       = 48,
    SPRITE_HOT_Y       = 0,
};

export enum SpriteMonster {
    SPRITE_FRAME_NE_1  = 0,
    SPRITE_FRAME_NE_2  = 1,
    SPRITE_FRAME_NE_3  = 2,
    SPRITE_FRAME_SE_1  = 3,
    SPRITE_FRAME_SE_2  = 4,
    SPRITE_FRAME_SE_3  = 5,
    SPRITE_FRAME_SW_1  = 6,
    SPRITE_FRAME_SW_2  = 7,
    SPRITE_FRAME_SW_3  = 8,
    SPRITE_FRAME_NW_1  = 9,
    SPRITE_FRAME_NW_2  = 10,
    SPRITE_FRAME_NW_3  = 11,
    SPRITE_FRAME_N     = 12,
    SPRITE_FRAME_E     = 13,
    SPRITE_FRAME_S     = 14,
    SPRITE_FRAME_W     = 15,
    SPRITE_FRAME_COUNT = 16,
    SPRITE_WIDTH       = 48,
    SPRITE_HEIGHT      = 48,
    SPRITE_OFFSET_X    = 24,
    SPRITE_OFFSET_Y    = 0,
    SPRITE_HOT_X       = 40,
    SPRITE_HOT_Y       = 16,
};

export enum SpriteTornado {
    SPRITE_FRAME_1     = 0,
    SPRITE_FRAME_2     = 1,
    SPRITE_FRAME_3     = 2,
    SPRITE_FRAME_COUNT = 3,
    SPRITE_WIDTH       = 48,
    SPRITE_HEIGHT      = 48,
    SPRITE_OFFSET_X    = 24,
    SPRITE_OFFSET_Y    = 0,
    SPRITE_HOT_X       = 40,
    SPRITE_HOT_Y       = 36,
};

export enum SpriteExplosion {
    SPRITE_FRAME_1     = 0,
    SPRITE_FRAME_2     = 1,
    SPRITE_FRAME_3     = 2,
    SPRITE_FRAME_4     = 3,
    SPRITE_FRAME_5     = 4,
    SPRITE_FRAME_6     = 5,
    SPRITE_FRAME_COUNT = 6,
    SPRITE_WIDTH       = 48,
    SPRITE_HEIGHT      = 48,
    SPRITE_OFFSET_X    = 24,
    SPRITE_OFFSET_Y    = 0,
    SPRITE_HOT_X       = 40,
    SPRITE_HOT_Y       = 16,
};

export enum SpriteBus {
    SPRITE_FRAME_N_S       = 0,
    SPRITE_FRAME_W_E       = 1,
    SPRITE_FRAME_NW_SE     = 2,
    SPRITE_FRAME_NE_SW     = 3,
    SPRITE_FRAME_INVISIBLE = 4,
    SPRITE_FRAME_COUNT     = 5,
    SPRITE_WIDTH           = 32,
    SPRITE_HEIGHT          = 32,
    SPRITE_OFFSET_X        = 30,
    SPRITE_OFFSET_Y        = 18,
    SPRITE_HOT_X           = 40,
    SPRITE_HOT_Y           = -8,
};

let frameX = 0;
let frameY = 0;

function layoutFrames(frameCount: number, width: number, height: number) {
    const frames: number[] = [];
    for (let i = 0; i < frameCount; i++) {
        frames.push(frameX);
        frames.push(frameY);
        frameX += width;
    }
    frameX = 0;
    frameY += height;
    return frames;
};

export function makeSprite(name: string, id: number, width: number, height: number, xOffset: number, yOffset: number, xHot: number, yHot: number, frameCount: number): Sprite {
    return {
        name,
        id,
        frame: 0,
        x: 0,
        y: 0,
        width,
        height,
        xOffset,
        yOffset,
        xHot,
        yHot,
        origX: 0,
        origY: 0,
        destX: 0,
        destY: 0,
        count: 0,
        soundCount: 0,
        dir: 0,
        newDir: 0,
        step: 0,
        flag: 0,
        control: 0,
        turn: 0,
        accel: 0,
        speed: 0,
        frames: layoutFrames(frameCount, width, height),
    };
}

export const sprites: Sprite[] = [
    makeSprite(
        'TRAIN', 1,
        SpriteTrain.SPRITE_WIDTH,
        SpriteTrain.SPRITE_HEIGHT,
        SpriteTrain.SPRITE_OFFSET_X,
        SpriteTrain.SPRITE_OFFSET_Y,
        SpriteTrain.SPRITE_HOT_X,
        SpriteTrain.SPRITE_HOT_Y,
        SpriteTrain.SPRITE_FRAME_COUNT),
    makeSprite(
        'HELICOPTER', 2,
        SpriteHelicopter.SPRITE_WIDTH,
        SpriteHelicopter.SPRITE_HEIGHT,
        SpriteHelicopter.SPRITE_OFFSET_X,
        SpriteHelicopter.SPRITE_OFFSET_Y,
        SpriteHelicopter.SPRITE_HOT_X,
        SpriteHelicopter.SPRITE_HOT_Y,
        SpriteHelicopter.SPRITE_FRAME_COUNT),
    makeSprite(
        'AIRPLANE', 3,
        SpriteAirplane.SPRITE_WIDTH,
        SpriteAirplane.SPRITE_HEIGHT,
        SpriteAirplane.SPRITE_OFFSET_X,
        SpriteAirplane.SPRITE_OFFSET_Y,
        SpriteAirplane.SPRITE_HOT_X,
        SpriteAirplane.SPRITE_HOT_Y,
        SpriteAirplane.SPRITE_FRAME_COUNT),
    makeSprite(
        'SHIP', 4,
        SpriteShip.SPRITE_WIDTH,
        SpriteShip.SPRITE_HEIGHT,
        SpriteShip.SPRITE_OFFSET_X,
        SpriteShip.SPRITE_OFFSET_Y,
        SpriteShip.SPRITE_HOT_X,
        SpriteShip.SPRITE_HOT_Y,
        SpriteShip.SPRITE_FRAME_COUNT),
    makeSprite(
        'MONSTER', 5,
        SpriteMonster.SPRITE_WIDTH,
        SpriteMonster.SPRITE_HEIGHT,
        SpriteMonster.SPRITE_OFFSET_X,
        SpriteMonster.SPRITE_OFFSET_Y,
        SpriteMonster.SPRITE_HOT_X,
        SpriteMonster.SPRITE_HOT_Y,
        SpriteMonster.SPRITE_FRAME_COUNT),
    makeSprite(
        'TORNADO', 6,
        SpriteTornado.SPRITE_WIDTH,
        SpriteTornado.SPRITE_HEIGHT,
        SpriteTornado.SPRITE_OFFSET_X,
        SpriteTornado.SPRITE_OFFSET_Y,
        SpriteTornado.SPRITE_HOT_X,
        SpriteTornado.SPRITE_HOT_Y,
        SpriteTornado.SPRITE_FRAME_COUNT),
    makeSprite(
        'EXPLOSION', 7,
        SpriteExplosion.SPRITE_WIDTH,
        SpriteExplosion.SPRITE_HEIGHT,
        SpriteExplosion.SPRITE_OFFSET_X,
        SpriteExplosion.SPRITE_OFFSET_Y,
        SpriteExplosion.SPRITE_HOT_X,
        SpriteExplosion.SPRITE_HOT_Y,
        SpriteExplosion.SPRITE_FRAME_COUNT),
    makeSprite(
        'BUS', 8,
        SpriteBus.SPRITE_WIDTH,
        SpriteBus.SPRITE_HEIGHT,
        SpriteBus.SPRITE_OFFSET_X,
        SpriteBus.SPRITE_OFFSET_Y,
        SpriteBus.SPRITE_HOT_X,
        SpriteBus.SPRITE_HOT_Y,
        SpriteBus.SPRITE_FRAME_COUNT),
];
