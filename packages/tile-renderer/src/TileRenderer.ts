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

    /** Atlas texel size per map tile (e.g. 16×16). Viewport uses tile index units (1×1). */
    public atlasTileWidth = 16;
    public atlasTileHeight = 16;

    /**
     * The URL of the tile texture.
     */
    public tileLayers: ResolvedTileLayerSpec[] = [];
    public tileTextureURLs: (string | null)[] | null = null;
 
    get tileWidth(): number { return this.atlasTileWidth; }
    set tileWidth(value: number) { this.atlasTileWidth = value; }

    get tileHeight(): number { return this.atlasTileHeight; }
    set tileHeight(value: number) { this.atlasTileHeight = value; }

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
            tileWidth: 1,
            tileHeight: 1,
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
        this.atlasTileWidth = tileWidth;
        this.atlasTileHeight = tileHeight;
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

    /** Canvas CSS layout width/height (matches mouse `getBoundingClientRect` coords). */
    cssLayoutSize(): { width: number; height: number; backingStoreScale: number } {
        if (!this.canvas) {
            return { width: 0, height: 0, backingStoreScale: 1 };
        }
        const rect = this.canvas.getBoundingClientRect();
        const cssW = rect.width > 0 ? rect.width : this.canvas.clientWidth;
        const cssH = rect.height > 0 ? rect.height : this.canvas.clientHeight;
        if (cssW <= 0 || cssH <= 0) {
            return { width: 0, height: 0, backingStoreScale: 1 };
        }
        return {
            width: cssW,
            height: cssH,
            backingStoreScale: this.canvas.width / cssW,
        };
    }

    /** Canvas backing-store pixels per CSS layout pixel (often ≈ `devicePixelRatio`). */
    backingStoreScale(): number {
        return this.cssLayoutSize().backingStoreScale;
    }

    /** One map tile in CSS pixels — matches the canvas software/WebGL `4×` atlas path. */
    cssPixelsPerTile(): number {
        return (this.atlasTileWidth * 4 * this.zoom) / this.backingStoreScale();
    }

    /**
     * Keep viewport screen scale aligned with the live canvas so cursor frames match tiles.
     * @param adjustPanBounds When true, recompute pan limits (render/resize/zoom only).
     */
    setScreenSize(width: number, height: number, backingStoreScale?: number, adjustPanBounds = false): void {
        this.viewport.setScreenSize(width, height);
        this.applyViewportScreenScale(backingStoreScale, adjustPanBounds);
    }

    /** Re-read canvas CSS size and backing-store scale. */
    syncViewportScreenScale(adjustPanBounds = false): void {
        const { width, height, backingStoreScale } = this.cssLayoutSize();
        if (width <= 0 || height <= 0) {
            return;
        }
        this.setScreenSize(width, height, backingStoreScale, adjustPanBounds);
    }

    protected applyViewportScreenScale(backingStoreScale?: number, adjustPanBounds = false): void {
        const scale = backingStoreScale && backingStoreScale > 0
            ? backingStoreScale
            : this.backingStoreScale();
        const z = this.viewport.zoom;
        if (z <= 0 || scale <= 0) {
            return;
        }
        const cssPixelsPerTile = (this.atlasTileWidth * 4 * this.zoom) / scale;
        // Viewport pan/zoom is in tile indices (tileWidth=1); scale matches rendered canvas.
        this.viewport.configure({
            tileWidth: 1,
            tileHeight: 1,
            screenZoomFactor: cssPixelsPerTile / z,
        });
        if (adjustPanBounds) {
            this.updatePanBounds();
        }
    }

    /** Keep pan limits so the map can scroll until edges meet the viewport, not at tile 0/W. */
    protected updatePanBounds(): void {
        const ppt = this.cssPixelsPerTile();
        if (ppt <= 0 || this.viewport.screenWidth <= 0 || this.viewport.screenHeight <= 0) {
            return;
        }
        const halfTilesX = this.viewport.screenWidth / (2 * ppt);
        const halfTilesY = this.viewport.screenHeight / (2 * ppt);
        let panXMin = halfTilesX;
        let panXMax = this.mapWidth - halfTilesX;
        let panYMin = halfTilesY;
        let panYMax = this.mapHeight - halfTilesY;
        if (panXMin > panXMax) {
            const cx = this.mapWidth / 2;
            panXMin = cx;
            panXMax = cx;
        }
        if (panYMin > panYMax) {
            const cy = this.mapHeight / 2;
            panYMin = cy;
            panYMax = cy;
        }
        this.viewport.configure({ panXMin, panXMax, panYMin, panYMax });
        if (
            this.viewport.panX < panXMin || this.viewport.panX > panXMax ||
            this.viewport.panY < panYMin || this.viewport.panY > panYMax
        ) {
            this.viewport.panTo(this.viewport.panX, this.viewport.panY);
        }
    }

    panTo(panX: number, panY: number): void {
        this.viewport.panTo(panX, panY);
    }

    panBy(dx: number, dy: number): void {
        this.viewport.panBy(dx, dy);
    }

    /** Direct-manipulation pan — keeps `worldTile` fixed under `screenCss`. */
    panToKeepWorldAtScreen(worldTile: [number, number], screenCss: [number, number]): void {
        this.viewport.panToKeepWorldAtScreen(worldTile, screenCss);
    }

    zoomTo(zoom: number): void {
        this.viewport.zoomTo(zoom);
        this.updatePanBounds();
    }

    zoomBy(zoomFactor: number): void {
        this.zoomTo(this.zoom * zoomFactor);
    }

}


export { TileRenderer };
