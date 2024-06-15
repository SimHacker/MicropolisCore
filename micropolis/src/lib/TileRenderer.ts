// ITileRenderer interface


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
 * The client (user of this class) can write directly into the mapData new Uint16Array( and then call the
 * render function to update the display based on the current map state.
 */


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
     * The x dimension of an individual tile measured in pixels. This dimension is used to
     * scale the tile textures to the correct width when rendering.
     */
    public tileWidth: number = 1;

    /**
     * The y dimension of an individual tile measured in pixels. This dimensions is used to
     * scale the tile textures to the correct height when rendering.
     */
    public tileHeight: number = 1;

    /**
     * The current horizontal pan position in tile pixels. This value offsets the map rendering
     * along the X-axis, allowing the user to pan left and right across the map.
     */
    public panX: number = 0;
    public panXMin: number = 0.0;
    public panXMax: number = 120.0;

    /**
     * The current vertical pan position in tile pixels. This value offsets the map rendering
     * along the Y-axis, allowing the user to pan up and down across the map.
     */
    public panY: number = 0;
    public panYMin: number = 0.0;
    public panYMax: number = 120.0;

    /**
     * The width of the viewable area on the screen. This is typically set to the width of the
     * canvas element in pixels and determines the horizontal extent of the visible map area.
     */
    public screenWidth: number = 0;

    /**
     * The height of the viewable area on the screen. This is typically set to the height of the
     * canvas element in pixels and determines the vertical extent of the visible map area.
     */
    public screenHeight: number = 0;

    /**
     * The screen x anchor, from 0 (left) through 0.5 (center) to 1 (right).
     * The tile at panX will be pinned to screenAnchorX times the screen width. 
     */

    public screenAnchorX: number = 0.5;

    /**
     * The screen y anchor, from 0 (top) through 0.5 (middle) to 1 (bottom).
     * The tile at panY will be pinned to screenAnchorY times the screen height. 
     */

    public screenAnchorY: number = 0.5;

    /**
     * The current zoom level. A value of 1 indicates a default zoom level where the map is rendered
     * at actual size. Values greater than 1 zoom in, making the tiles appear larger, while values
     * less than 1 zoom out, making the tiles appear smaller.
     */
    public zoom: number = 1;
    public zoomMin: number = 1.0 / 32.0;
    public zoomMax: number = 256.0;

    public tileRotate: number = 0;
    public tileOpacity: number = 1.0;

    /**
     * The URL of the tile texture.
     */
    public tileTextureURL: string | null = null;
 
    constructor() {
    }

    /**
     * Initializes the renderer with the necessary configuration and begins loading the tile texture.
     * @param canvas The canvas to render into.
     * @param context The rendering context specific to the subclass implementation.
     * @param mapData A Uint16Array representing the tile data of the map.
     * @param mapWidth The x dimension of the map measured in number of tiles.
     * @param mapHeight The y dimension of the map measured in number of tiles.
     * @param tileWidth The x dimension of a single tile measured in pixels.
     * @param tileHeight The y dimension of a single tile measured in pixels.
     * @param tileTextureURL The URL of the tile texture image to be loaded.
     * @returns A promise that resolves when the renderer is fully initialized and the texture is loaded.
     */
    initialize(
        canvas: HTMLCanvasElement,
        context: TContext,
        mapData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileTextureURL: string
    ): Promise<void> {

        this.canvas = canvas;
        this.context = context;
        this.mapData = mapData;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tileTextureURL = tileTextureURL;
        this.panXMax = this.mapWidth;
        this.panYMax = this.mapHeight;
    
        // Perform any other common setup here.

        // Since this is a default implementation, we just resolve immediately.
        // Subclasses will extend this to perform async tasks like loading textures.

        return Promise.resolve();
    }

    /**
     * Abstract render method to be implemented by subclasses.
     * This method should contain the specific rendering logic for the map.
     */
    abstract render(): void;

    /**
     * Convert screen coordinates to tile coordinates.
     */
    screenToTile(screenPos: [number, number]): [number, number] {
        const [screenX, screenY] = screenPos;
    
        // First, translate the screen coordinates so that the origin is at the anchor of the screen.
        const anchoredScreenX = screenX - (this.screenWidth * this.screenAnchorX);
        const anchoredScreenY = screenY - (this.screenHeight * this.screenAnchorY);
    
        // Next, apply the inverse of the zoom to scale the anchored screen coordinates down to tile space
        const scaledX = anchoredScreenX / this.zoom;
        const scaledY = anchoredScreenY / this.zoom;
    
        // Then, convert the scaled screen coordinates into tile coordinates by dividing by the tile size
        const tileXBeforePan = scaledX / this.tileWidth;
        const tileYBeforePan = scaledY / this.tileHeight;
    
        // Finally, apply the pan offsets to get the final tile coordinates
        const tileX = tileXBeforePan + this.panX;
        const tileY = tileYBeforePan + this.panY;
    
        return [tileX, tileY];
    }
    
    /**
     * Converts change in screen coordinates to change in tile coordinates.
     **/
    screenToTileDelta(screenDelta: [number, number]): [number, number] {
        const [screenDX, screenDY] = screenDelta;

        const tileDX = screenDX / this.zoom / this.tileWidth;
        const tileDY = screenDY / this.zoom / this.tileHeight;

        return [tileDX, tileDY];
    }

    /**
     * Converts tile coordinates to screen coordinates.
     **/
    tileToScreen(tilePos: [number, number]): [number, number] {
        const [tileX, tileY] = tilePos;

        // First, undo the panning by subtracting the pan offsets
        const unpannedTileX = tileX - this.panX;
        const unpannedTileY = tileY - this.panY;
        
        // Next, apply the zoom to scale the tile coordinates up to screen space
        const zoomedX = unpannedTileX * this.zoom;
        const zoomedY = unpannedTileY * this.zoom;

        // Finally, translate the origin back to the screen anchor.
        const screenX = (zoomedX * this.tileWidth ) + (this.screenWidth  * this.screenAnchorX);
        const screenY = (zoomedY * this.tileHeight) + (this.screenHeight * this.screenAnchorY);

        return [screenX, screenY];
    }

    /**
     * Converts change in tile coordinates to change in screen coordinates.
     **/
    tileToScreenDelta(tileDelta: [number, number]): [number, number] {
        const [tileDX, tileDY] = tileDelta;

        const screenDX = tileDX * this.zoom * this.tileWidth;
        const screenDY = tileDY * this.zoom * this.tileHeight;

        return [screenDX, screenDY];
    }

    /**
     * Updates the size of the rendering canvas.
     * @param width - The new width of the rendering canvas in pixels.
     * @param height - The new height of the rendering canvas in pixels.
     */
    setScreenSize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
    }

    /**
     * Set the pan.
     * @param panX - The pan X tile coordinate.
     * @param panY - The pan Y tile coordinate.
     */
    panTo(panX: number, panY: number): void {
        this.panX = Math.max(this.panXMin, Math.min(this.panXMax, panX));
        this.panY = Math.max(this.panYMin, Math.min(this.panYMax, panY));
        //console.log("panX:", this.panX, "panY:", this.panY);
    }

    /**
     * Change the pan.
     * @param dx - The change in the pan X tile coordinate.
     * @param dy - The change in the pan Y tile coordinate.
     */
    panBy(dx: number, dy: number): void {
        this.panTo(this.panX + dx, this.panY + dy);
    }

    /**
     * Set the zoom.
     * @param zoom - The zoom.
     */
    zoomTo(zoom: number): void {
        this.zoom = Math.max(this.zoomMin, Math.min(this.zoomMax, zoom));
        //console.log("zoom:", this.zoom);
    }


    /**
     * Change the zoom.
     * @param zoomFactor - The factor by which to zoom in or out.
     */
    zoomBy(zoomFactor: number): void {
        this.zoomTo(this.zoom * zoomFactor);
    }

}


export { TileRenderer };
