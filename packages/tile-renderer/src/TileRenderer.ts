// ITileRenderer interface

import { MapViewport } from '@micropolis/render-core';

/**
 * An abstract class that defines the structure and common functionality for a tile rendering system.
 * It is designed to be suitable for rendering 2D tile-based maps, such as those in games like SimCity.
 * This class provides the basic features required for panning and zooming within a tile map.
 *
 * The class is intended to be extended by a concrete implementation that provides the specific
 * rendering context (e.g., Canvas 2D, WebGL, WebGPU) and handles the actual drawing operations.
 *
 * The panning functionality is measured in tile coordinates, independent of tile size or aspect ratio. 
 * For example, if the tiles are 16x16 pixels, or 4x62 pixels, or any other size, then panning by 
 * one unit will move the map by 1 tile. The panning origin is centered on the screen.
 *
 * Public properties such as panX, panY, screenWidth, and screenHeight can be modified directly to adjust the screen.
 * The client (user of this class) can write directly into the mapData and mopData new Uint16Array
 * and then call the render function to update the display based on the current map state.
 */


export interface TileLayerSpec {
    id?: string;
    url: string | null;
    atlasX?: number;
    atlasY?: number;
    atlasWidth?: number;
    atlasHeight?: number;
    tileWidth?: number;
    tileHeight?: number;
    strideX?: number;
    strideY?: number;
    tileCount?: number;
    tilesPerSet?: number;
    pixelAspectX?: number;
    pixelAspectY?: number;
    wrap?: 'repeat' | 'clamp';
    sampling?: 'pixel' | 'nearest' | 'linear' | 'area' | 'mipmap';
    mipmaps?: false | 'gpu' | 'tile-aware';
    gutterX?: number;
    gutterY?: number;
    pixelArt?: boolean;
    blend?: 'replace' | 'alpha' | 'multiply' | 'screen' | 'add' | 'tint';
    opacity?: number;
    colorSpace?: 'srgb' | 'linear';
    premultipliedAlpha?: boolean;
    tint?: [number, number, number, number];
}

export interface ResolvedTileLayerSpec {
    id?: string;
    url: string | null;
    atlasX: number;
    atlasY: number;
    atlasWidth?: number;
    atlasHeight?: number;
    tileWidth: number;
    tileHeight: number;
    strideX: number;
    strideY: number;
    tileCount?: number;
    tilesPerSet?: number;
    pixelAspectX: number;
    pixelAspectY: number;
    wrap: 'repeat' | 'clamp';
    sampling: 'pixel' | 'nearest' | 'linear' | 'area' | 'mipmap';
    mipmaps: false | 'gpu' | 'tile-aware';
    gutterX: number;
    gutterY: number;
    pixelArt: boolean;
    blend: 'replace' | 'alpha' | 'multiply' | 'screen' | 'add' | 'tint';
    opacity: number;
    colorSpace: 'srgb' | 'linear';
    premultipliedAlpha: boolean;
    tint?: [number, number, number, number];
}

export type TileLayerSource = string | null | TileLayerSpec;

export function resolveTileLayerSource(
    source: TileLayerSource,
    defaultTileWidth: number,
    defaultTileHeight: number,
): ResolvedTileLayerSpec {
    if (typeof source === 'string' || source === null) {
        return {
            url: source,
            atlasX: 0,
            atlasY: 0,
            tileWidth: defaultTileWidth,
            tileHeight: defaultTileHeight,
            strideX: defaultTileWidth,
            strideY: defaultTileHeight,
            pixelAspectX: 1,
            pixelAspectY: 1,
            wrap: 'repeat',
            sampling: 'pixel',
            mipmaps: false,
            gutterX: 0,
            gutterY: 0,
            pixelArt: true,
            blend: 'replace',
            opacity: 1,
            colorSpace: 'srgb',
            premultipliedAlpha: false,
        };
    }

    const tileWidth = source.tileWidth ?? defaultTileWidth;
    const tileHeight = source.tileHeight ?? defaultTileHeight;
    return {
        id: source.id,
        url: source.url,
        atlasX: source.atlasX ?? 0,
        atlasY: source.atlasY ?? 0,
        atlasWidth: source.atlasWidth,
        atlasHeight: source.atlasHeight,
        tileWidth,
        tileHeight,
        strideX: source.strideX ?? tileWidth,
        strideY: source.strideY ?? tileHeight,
        tileCount: source.tileCount,
        tilesPerSet: source.tilesPerSet,
        pixelAspectX: source.pixelAspectX ?? 1,
        pixelAspectY: source.pixelAspectY ?? 1,
        wrap: source.wrap ?? 'repeat',
        sampling: source.sampling ?? (source.pixelArt === false ? 'linear' : 'pixel'),
        mipmaps: source.mipmaps ?? false,
        gutterX: source.gutterX ?? 0,
        gutterY: source.gutterY ?? 0,
        pixelArt: source.pixelArt ?? !['linear', 'mipmap'].includes(String(source.sampling)),
        blend: source.blend ?? 'replace',
        opacity: source.opacity ?? 1,
        colorSpace: source.colorSpace ?? 'srgb',
        premultipliedAlpha: source.premultipliedAlpha ?? false,
        tint: source.tint,
    };
}

abstract class TileRenderer<TContext> {

    /**
     * The canvas to render into, or null.
     */
    public canvas?: HTMLCanvasElement = undefined;

    /**
     * The rendering context is a generic placeholder for the graphical context in which the
     * rendering takes place. This could be a WebGL2RenderingContext for 3D rendering or a 2D
     * canvas rendering context, for example. The exact type of the context is specified by the
     * generic parameter TContext when implementing the concrete renderer class. This allows the
     * TileRenderer to be adapted to different rendering technologies.
     */
    public context?: TContext = undefined;

    /**
     * An array representing the map's tile data. Each element in the array corresponds to a tile
     * on the map. The data will determine which texture to use for each tile when rendering.
     */
    public mapData: Uint16Array = new Uint16Array(1);
    public mopData: Uint16Array = new Uint16Array(1);

    /**
     * The x dimension of the map measured in tiles. This determines the total number of tiles
     * in the width direction of the tile map.
     */
    public mapWidth: number = 120;

    /**
     * The y dimension of the map measured in tiles. This determines the total number of tiles
     * in the height direction of the tile map.
     */
    public mapHeight: number = 100;

    /**
     * Shared camera for screen ↔ world-tile ↔ world-pixel transforms.
     * Overlay plugins should use this instance (or the same reference via {@link MapScene}).
     */
    public readonly viewport: MapViewport = new MapViewport();

    public tileRotate: number = 0;
    public tileLayer: number = 0;

    /**
     * The URL of the tile texture.
     */
    public tileLayers: ResolvedTileLayerSpec[] = [];
    public tileTextureURLs: (string | null)[] | null = null;
 
    get tileWidth(): number { return this.viewport.tileWidth; }
    set tileWidth(value: number) { this.viewport.tileWidth = value; }

    get tileHeight(): number { return this.viewport.tileHeight; }
    set tileHeight(value: number) { this.viewport.tileHeight = value; }

    get panX(): number { return this.viewport.panX; }
    set panX(value: number) { this.viewport.panX = value; }

    get panXMin(): number { return this.viewport.panXMin; }
    set panXMin(value: number) { this.viewport.panXMin = value; }

    get panXMax(): number { return this.viewport.panXMax; }
    set panXMax(value: number) { this.viewport.panXMax = value; }

    get panY(): number { return this.viewport.panY; }
    set panY(value: number) { this.viewport.panY = value; }

    get panYMin(): number { return this.viewport.panYMin; }
    set panYMin(value: number) { this.viewport.panYMin = value; }

    get panYMax(): number { return this.viewport.panYMax; }
    set panYMax(value: number) { this.viewport.panYMax = value; }

    get screenWidth(): number { return this.viewport.screenWidth; }
    set screenWidth(value: number) { this.viewport.screenWidth = value; }

    get screenHeight(): number { return this.viewport.screenHeight; }
    set screenHeight(value: number) { this.viewport.screenHeight = value; }

    get screenAnchorX(): number { return this.viewport.screenAnchorX; }
    set screenAnchorX(value: number) { this.viewport.screenAnchorX = value; }

    get screenAnchorY(): number { return this.viewport.screenAnchorY; }
    set screenAnchorY(value: number) { this.viewport.screenAnchorY = value; }

    get zoom(): number { return this.viewport.zoom; }
    set zoom(value: number) { this.viewport.zoom = value; }

    get zoomMin(): number { return this.viewport.zoomMin; }
    set zoomMin(value: number) { this.viewport.zoomMin = value; }

    get zoomMax(): number { return this.viewport.zoomMax; }
    set zoomMax(value: number) { this.viewport.zoomMax = value; }

    constructor() {
    }

    /** Keep viewport map dimensions aligned with renderer fields. */
    protected syncViewportMapSize(): void {
        this.viewport.configure({
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
        });
    }

    /**
     * Initializes the renderer with the necessary configuration and begins loading the tile texture.
     * @param canvas The canvas to render into.
     * @param context The rendering context specific to the subclass implementation.
     * @param mapData A Uint16Array representing the tile data of the map.
     * @param mopData A Uint16Array representing the tile data of the mop.
     * @param mapWidth The x dimension of the map measured in number of tiles.
     * @param mapHeight The y dimension of the map measured in number of tiles.
     * @param tileWidth The x dimension of a single tile measured in pixels.
     * @param tileHeight The y dimension of a single tile measured in pixels.
     * @param tileTextureURLs The URLs of the tile texture images to be loaded.
     * @returns A promise that resolves when the renderer is fully initialized and the texture is loaded.
     */
    async initialize(
        canvas: HTMLCanvasElement,
        context: TContext,
        mapData: Uint16Array,
        mopData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileTextureURLs: TileLayerSource[],
    ): Promise<void> {

        this.canvas = canvas;
        this.context = context;
        this.mapData = mapData;
        this.mopData = mopData;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tileLayers = tileTextureURLs.map((source) => resolveTileLayerSource(source, tileWidth, tileHeight));
        this.tileTextureURLs = this.tileLayers.map((layer) => layer.url);
        this.panXMax = this.mapWidth;
        this.panYMax = this.mapHeight;
        this.syncViewportMapSize();

        // Perform any other common setup here.
    }

    /**
     * Abstract render method to be implemented by subclasses.
     * This method should contain the specific rendering logic for the map.
     */
    abstract render(): void;

    setScreenSize(width: number, height: number): void {
        this.viewport.setScreenSize(width, height);
    }

    panTo(panX: number, panY: number): void {
        this.viewport.panTo(panX, panY);
    }

    panBy(dx: number, dy: number): void {
        this.viewport.panBy(dx, dy);
    }

    zoomTo(zoom: number): void {
        this.viewport.zoomTo(zoom);
    }

    zoomBy(zoomFactor: number): void {
        this.viewport.zoomBy(zoomFactor);
    }

}


export { TileRenderer };
