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
    
    private imageData: ImageData | null = null;
    private tileImageData: ImageData | null = null;
    private tilesPerRow: number = 0;
    private renderBuffer: Uint32Array | null = null;

    constructor() {
        super();
    }

    /**
     * Initializes the CanvasTileRenderer with a 2D canvas context and loads the tile image.
     * @param canvas The canvas.
     * @param context The CanvasRenderingContext2D.
     * @param mapData Uint16Array representing the tile data of the map.
     * @param mopData Uint16Array representing the tile data of the map.
     * @param mapWidth The x dimension of the map measured in number of tiles.
     * @param mapHeight The y dimension of the map measured in number of tiles.
     * @param tileWidth The x dimension of a single tile measured in pixels.
     * @param tileHeight The y dimension of a single tile measured in pixels.
     * @param tileTextureURLs The URLs of the tile images to be loaded.
     * @returns A promise that resolves when the renderer is fully initialized and the image is loaded.
     */
    async initialize(
        canvas: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        mapData: Uint16Array,
        mopData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileTextureURLs: string[]
    ): Promise<void> {

        await super.initialize(canvas, context, mapData, mopData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURLs)

        this.context = context;
        this.tileImage = new Image();
        this.tileImage.src = tileTextureURLs[0];

        await new Promise<void>((resolve, reject) => {
            if (!this.context || !this.tileImage) {
                throw new Error('Canvas context or tile image is not properly initialized.');
            }
            this.tileImage.onload = () => {
                // Create temporary canvas to get tile image data
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.tileImage!.width;
                tempCanvas.height = this.tileImage!.height;
                const tempCtx = tempCanvas.getContext('2d')!;
                tempCtx.drawImage(this.tileImage!, 0, 0);
                this.tileImageData = tempCtx.getImageData(0, 0, this.tileImage!.width, this.tileImage!.height);
                this.tilesPerRow = this.tilesWidth / this.tileWidth;
                resolve();
            };
            this.tileImage.onerror = () => reject(new Error(`Failed to load image at ${tileTextureURLs[0]}`));
        });
    }

    /**
     * Renders the tile map using the Canvas 2D context.
     * Renders the visible portion of the tile map using the Canvas 2D context.
     * Only draws tiles that appear in the panned and zoomed screen.
     */
    render(): void {
        if (!this.canvas || !this.context || !this.tileImageData) {
            throw new Error('Canvas context or tile data not initialized');
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Create or resize imageData if needed
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.context.createImageData(width, height);
            // Update renderBuffer when imageData changes
            this.renderBuffer = new Uint32Array(this.imageData.data.buffer);
        }
        
        // Calculate visible region in screen pixels
        const startY = Math.max(0, Math.floor(this.offsetY * this.zoom));
        const startX = Math.max(0, Math.floor(this.offsetX * this.zoom));
        const endY = Math.min(height, Math.ceil((this.offsetY + this.mapHeight * this.tileHeight) * this.zoom));
        const endX = Math.min(width, Math.ceil((this.offsetX + this.mapWidth * this.tileWidth) * this.zoom));

        // Process each screen pixel in the visible region
        for (let y = startY; y < endY; y++) {
            const yOffset = y * width;
            for (let x = startX; x < endX; x++) {
                // Convert screen coordinates to map coordinates
                const mapX = Math.floor((x / this.zoom + this.offsetX) / this.tileWidth);
                const mapY = Math.floor((y / this.zoom + this.offsetY) / this.tileHeight);
                
                // Bounds check
                if (mapX < 0 || mapX >= this.mapWidth || mapY < 0 || mapY >= this.mapHeight) {
                    continue;
                }

                // Get tile index from map data (column-major order)
                const tileIndex = this.mapData[mapX * this.mapWidth + mapY];
                
                // Calculate tile UV coordinates
                const tileRow = Math.floor(tileIndex / this.tilesPerRow);
                const tileCol = tileIndex % this.tilesPerRow;
                
                // Calculate source pixel in tile texture
                const tilePixelX = Math.floor((x / this.zoom + this.offsetX) % this.tileWidth);
                const tilePixelY = Math.floor((y / this.zoom + this.offsetY) % this.tileHeight);
                const srcX = tileCol * this.tileWidth + tilePixelX;
                const srcY = tileRow * this.tileHeight + tilePixelY;
                
                // Get color from tile texture
                const srcIndex = (srcY * this.tilesWidth + srcX) * 4;
                
                // Pack RGBA into single 32-bit integer
                const pixel = (this.tileImageData.data[srcIndex + 3] << 24) |
                             (this.tileImageData.data[srcIndex + 2] << 16) |
                             (this.tileImageData.data[srcIndex + 1] << 8) |
                             this.tileImageData.data[srcIndex];
                
                this.renderBuffer![yOffset + x] = pixel;
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
    }
}


export { TileRenderer, CanvasTileRenderer };
