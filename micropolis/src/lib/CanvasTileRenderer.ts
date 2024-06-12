// CanvasTileRenderer implementation class


import { TileRenderer } from './TileRenderer';


/**
 * CanvasTileRenderer is a concrete implementation of the TileRenderer abstract class.
 * It specializes in rendering tile maps using Canvas 2D context. This class manages
 * the 2D context, drawing operations, and tile management for rendering the map onto
 * a canvas element.
 *
 * The CanvasTileRenderer allows for panning and zooming similar to WebGLTileRenderer.
 * The map can be navigated interactively with drag and zoom actions.
 */


class CanvasTileRenderer extends TileRenderer<CanvasRenderingContext2D> {
    private tileImage: HTMLImageElement | null = null;

    constructor() {
        super();
    }

    /**
     * Initializes the CanvasTileRenderer with a 2D canvas context and loads the tile image.
     * @param canvas The canvas.
     * @param context The CanvasRenderingContext2D.
     * @param mapData Uint16Array representing the tile data of the map.
     * @param mapWidth The x dimension of the map measured in number of tiles.
     * @param mapHeight The y dimension of the map measured in number of tiles.
     * @param tileWidth The x dimension of a single tile measured in pixels.
     * @param tileHeight The y dimension of a single tile measured in pixels.
     * @param tileImageURL The URL of the tile image to be loaded.
     * @returns A promise that resolves when the renderer is fully initialized and the image is loaded.
     */
    initialize(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        mapData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileImageURL: string
    ): Promise<void> {

        return super.initialize(canvas, context, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileImageURL)
            .then(() => {

                this.context = context;
                this.tileImage = new Image();
                this.tileImage.src = tileImageURL;

                return new Promise((resolve, reject) => {
                    if (!this.context || !this.tileImage) {
                        throw new Error('Canvas context or tile image is not properly initialized.');
                    }
                    this.tileImage.onload = () => resolve();
                    this.tileImage.onerror = () => reject(new Error(`Failed to load image at ${tileImageURL}`));
                });

            });
    }

    /**
     * Renders the tile map using the Canvas 2D context.
     * Renders the visible portion of the tile map using the Canvas 2D context.
     * Only draws tiles that appear in the panned and zoomed screen.
     */
    render(): void {

        //console.log('CanvasTileRenderer: render: this:', this);

        if (!this.canvas || !this.context || !this.tileImage) {
            throw new Error('The canvas, 2d context, or tile image are not properly initialized.');
        }

        const screenWidth = this.canvas.width;
        const screenHeight = this.canvas.height;
        const anchorX = screenWidth * this.screenAnchorX;
        const anchorY = screenHeight * this.screenAnchorY;
        const screenTileWidth = this.tileWidth * this.zoom;
        const screenTileHeight = this.tileHeight * this.zoom;

        const upperLeft  = this.screenToTile([0, 0]);
        const lowerRight = this.screenToTile([screenWidth, screenHeight]);
        let left   = Math.max(0, Math.min(Math.floor(upperLeft [0]), this.mapWidth ));
        let top    = Math.max(0, Math.min(Math.floor(upperLeft [1]), this.mapHeight));
        let right  = Math.max(0, Math.min(Math.ceil (lowerRight[0]), this.mapWidth ));
        let bottom = Math.max(0, Math.min(Math.ceil (lowerRight[1]), this.mapHeight));

        left = 0;
        top = 0;
        right = this.mapWidth;
        bottom = this.mapHeight;

        this.setScreenSize(
            screenWidth,
            screenHeight);

        // Fill the background with black
        this.context.fillStyle = '#000000';
        this.context.fillRect(
            0,
            0,
            screenWidth,
            screenHeight);

        //console.log("CanvasTileRenderer:", this, "render:", "screenWidth:", screenWidth, "screenHeight:", screenHeight, "anchorX:", anchorX, "anchorY:", anchorY, "screenTileWidth:", screenTileWidth, "screenTileHeight:", screenTileHeight, "upperLeft:", upperLeft, "lowerRight:", lowerRight, "left:", left, "top:", top, "right:", right, "bottom:", bottom);
        
        // Loop through each visible tile
        for (let tileY = top; tileY < bottom; tileY++) {
            for (let tileX = left; tileX < right; tileX++) {

                // Get the index of the current tile.
                // Map data is column major order, so the width is the second dimension.
                const tileIndex = this.mapData[tileX * this.mapHeight + tileY];
    
                // Calculate the position to draw the tile on the canvas.
                const tilePos = this.tileToScreen([tileX, tileY]);
    
                // Calculate the source coordinates of the tile in the tileset image.
                const columns =            this.tileImage.width / this.tileWidth;
                const srcX    =           (tileIndex % columns) * this.tileWidth;
                const srcY    = Math.floor(tileIndex / columns) * this.tileHeight;
    
                // Draw the tile
                this.context.drawImage(
                    this.tileImage,
                    srcX,
                    srcY,
                    this.tileWidth,
                    this.tileHeight,
                    tilePos[0],
                    tilePos[1],
                    screenTileWidth,
                    screenTileHeight);

            }
        }
    }
}


export { TileRenderer, CanvasTileRenderer };
