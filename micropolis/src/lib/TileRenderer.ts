// ITileRenderer interface, GLTileRenderer implementation class


/**
 * An abstract class that defines the structure and common functionality for a tile rendering system.
 * It is designed to be suitable for rendering 2D tile-based maps, such as those in games like SimCity.
 * This class provides the basic features required for panning and zooming within a tile map.
 *
 * The class is intended to be extended by a concrete implementation that provides the specific
 * rendering context (e.g., WebGL, Canvas 2D) and handles the actual drawing operations.
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
    public mapWidth: number = 1;

    /**
     * The y dimension of the map measured in tiles. This determines the total number of tiles
     * in the height direction of the tile map.
     */
    public mapHeight: number = 1;

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

    /**
     * The current vertical pan position in tile pixels. This value offsets the map rendering
     * along the Y-axis, allowing the user to pan up and down across the map.
     */
    public panY: number = 0;

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
        const tileX = tileXBeforePan - this.panX;
        const tileY = tileYBeforePan - this.panY;

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
        this.panX = panX;
        this.panY = panY;
    }

    /**
     * Change the pan.
     * @param dx - The change in the pan X tile coordinate.
     * @param dy - The change in the pan Y tile coordinate.
     */
    panBy(dx: number, dy: number): void {
        this.panX += dx;
        this.panY += dy;
    }

    /**
     * Set the zoom.
     * @param zoom - The zoom.
     */
    zoomTo(zoom: number): void {
        this.zoom = zoom;
    }


    /**
     * Change the zoom.
     * @param zoomFactor - The factor by which to zoom in or out.
     */
    zoomBy(zoomFactor: number): void {
        this.zoom *= zoomFactor;
    }

}


/**
 * CanvasTileRenderer is a concrete implementation of the TileRenderer abstract class.
 * It specializes in rendering tile maps using Canvas 2D context. This class manages
 * the 2D context, drawing operations, and tile management for rendering the map onto
 * a canvas element.
 *
 * The CanvasTileRenderer allows for panning and zooming similar to GLTileRenderer.
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

        console.log("CanvasTileRenderer:", this, "render:", "screenWidth:", screenWidth, "screenHeight:", screenHeight, "anchorX:", anchorX, "anchorY:", anchorY, "screenTileWidth:", screenTileWidth, "screenTileHeight:", screenTileHeight, "upperLeft:", upperLeft, "lowerRight:", lowerRight, "left:", left, "top:", top, "right:", right, "bottom:", bottom);
        
        // Loop through each visible tile
        for (let tileY = top; tileY <= bottom; tileY++) {
            for (let tileX = left; tileX <= right; tileX++) {

                // Get the index of the current tile.
                const tileIndex = this.mapData[tileY * this.mapWidth + tileX];
    
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


/**
 * GLTileRenderer is a concrete implementation of the TileRenderer abstract class.
 * It specializes in rendering tile maps using WebGL. This class manages the WebGL
 * context, textures, and shaders required to draw the map onto a canvas element.
 *
 * The GLTileRenderer assumes that tiles are square and can be panned and zoomed.
 * Panning is anchored at the center of the canvas, and the map can be interactively
 * navigated by dragging and zooming.
 *
 * Upon initialization, a texture for the tiles is loaded from a provided URL. The
 * rendering context and initial state are set up. The map can then be rendered onto
 * the canvas by invoking the render method.
 * 
 */


interface ShaderProgramInfo {
    program: WebGLProgram;
    attributeLocations: {
        position: GLint;
        screenTile: GLint;
    };
    uniformLocations: {
        tileSize: WebGLUniformLocation | null;
        tilesSize: WebGLUniformLocation | null;
        tiles: WebGLUniformLocation | null;
        mapSize: WebGLUniformLocation | null;
        map: WebGLUniformLocation | null;
    };
}


interface BufferInfo {
    position: WebGLBuffer | null;
    screenTile: WebGLBuffer | null;
    indices: WebGLBuffer | null;
}


class GLTileRenderer extends TileRenderer<WebGL2RenderingContext> {

    /**
     * A WebGLTexture object that represent the texture containing all the tiles.
     * The texture is loaded from image data and is used by the WebGL context to render
     * the tile graphics.
     */
    private tilesTexture: WebGLTexture | null = null;

    /**
     * A WebGLTexture object that represent the tiles of the map.
     * The texture is loaded from tile data and is used by the WebGL context to render
     * the tile graphics.
     */
    private mapTexture: WebGLTexture | null = null;

    /**
     * The width of the tiles texture in pixels.
     */
    private tilesWidth: number = 0;

    /**
     * The height of the tiles texture in pixels.
     */
    private tilesHeight: number = 0;

    /**
     * Stores information about the WebGL program that compiles and links the vertex and
     * fragment shaders. The program info includes references to the compiled shaders and
     * is used during rendering to apply the shaders to the rendered tiles.
     */
    private tileProgramInfo: ShaderProgramInfo | null = null; // Replace with appropriate type once defined

    /**
     * Holds the buffer information for vertex attributes. The tile buffer is used to store
     * vertices, texture coordinates, and other per-vertex data necessary for rendering the tiles.
     */
    private tileBufferInfo: BufferInfo | null = null; // Replace with appropriate type once defined

    /**
     * Array of screen tile texture map coordinates.
     * */
    private screenTileArray: Float32Array = new Float32Array([
        0.0,  0.0, // First triangle
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0, // Second triangle
        1.0,  0.0,
        1.0,  1.0,
    ]);

    constructor() {
        super();
    }

    /**
     * Initializes the GLTileRenderer with the WebGL context and loads the tile texture.
     * @param context The canvas.
     * @param context The WebGL rendering context.
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
        context: WebGL2RenderingContext,
        mapData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileTextureURL: string
    ): Promise<void> {
 
        return super.initialize(canvas, context, mapData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURL)
            .then(() => {

                this.context = context;

                // Here we will set up WebGL state, shaders, and buffers.
                if (!this.context.getExtension('EXT_texture_norm16')) {
                    console.error('R32UI format is not supported on this device.');
                    return null;
                }

                this.tileProgramInfo = 
                    this.createShaderProgram();

                // Create and set up buffers, for example, for vertices and texture coordinates.
                this.tileBufferInfo = 
                    this.createBuffers();

                // Create a texture for the map data
                this.mapTexture = 
                    this.createMapTexture(
                        mapData, 
                        mapWidth, 
                        mapHeight);

                // Load the texture from the provided URL.
                return this.loadTexture(
                    tileTextureURL);
            })
            .then(() => {
                // Texture loaded successfully.
            })
            .catch((error) => {
                // Texture loading failed.
                throw error; // Rethrow to be caught by the caller.
            });
    }

    /**
     * Creates a texture from the map data array.
     */
    private createMapTexture(mapData: Uint16Array, mapWidth: number, mapHeight: number): WebGLTexture | null {

        if (!this.context) {
            console.error('GL context is not initialized.');
            return null;
        }
    
        const texture = 
            this.context.createTexture();

        this.context.bindTexture(
            this.context.TEXTURE_2D, 
            texture);
    
        // Load the texture with the map data.
        // Assuming mapData is an array of 16-bit unsigned integers.
        this.context.texImage2D(
            this.context.TEXTURE_2D, 0, 
            this.context.R16UI,
            mapWidth, 
            mapHeight, 
            0,
            this.context.RED_INTEGER, 
            this.context.UNSIGNED_SHORT, 
            mapData);
    
        // Set texture parameters
        this.context.texParameteri(
            this.context.TEXTURE_2D, 
            this.context.TEXTURE_WRAP_S, 
            this.context.CLAMP_TO_EDGE);
        
        this.context.texParameteri(
            this.context.TEXTURE_2D, 
            this.context.TEXTURE_WRAP_T, 
            this.context.CLAMP_TO_EDGE);
        
        this.context.texParameteri(
            this.context.TEXTURE_2D, 
            this.context.TEXTURE_MIN_FILTER, 
            this.context.NEAREST);
        
        this.context.texParameteri(
            this.context.TEXTURE_2D, 
            this.context.TEXTURE_MAG_FILTER, 
            this.context.NEAREST);
    
        return texture;
    }

    protected loadTexture(tileTextureURL: string): Promise<void> {

        return new Promise((resolve, reject) => {
            if (!this.context) {
                reject(new Error('GL context is not initialized.'));
                return;
            }
    
            // Create a new texture object in WebGL
            const texture = 
                this.context.createTexture();
            this.tilesTexture = texture;

            this.context.bindTexture(
                this.context.TEXTURE_2D, 
                texture);
    
            // Initialize the texture with a 1x1 pixel to prevent issues on slow networks
            this.context.texImage2D(
                this.context.TEXTURE_2D,
                0,
                this.context.RGBA,
                1,
                1,
                0, 
                this.context.RGBA, 
                this.context.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 0, 255])); // opaque black
    
            // Asynchronously load the image for the texture
            const image =
                new Image();

            image.onload = () => {
                if (!this.context) {
                    reject(new Error('GL context is not initialized.'));
                    return;
                }

                this.tilesWidth = image.width;
                this.tilesHeight = image.height;

                this.context.bindTexture(
                    this.context.TEXTURE_2D,
                    texture);

                this.context.texImage2D(
                    this.context.TEXTURE_2D, 
                    0, 
                    this.context.RGBA, 
                    this.context.RGBA, 
                    this.context.UNSIGNED_BYTE, 
                    image);

                // Setup texture so that we can render it at non-power of 2 sizes

                this.context.texParameteri(
                    this.context.TEXTURE_2D, 
                    this.context.TEXTURE_WRAP_S, 
                    this.context.CLAMP_TO_EDGE);

                this.context.texParameteri(
                    this.context.TEXTURE_2D, 
                    this.context.TEXTURE_WRAP_T, 
                    this.context.CLAMP_TO_EDGE);

                this.context.texParameteri(
                    this.context.TEXTURE_2D, 
                    this.context.TEXTURE_MIN_FILTER, 
                    this.context.LINEAR);

                resolve();
            };
            image.onerror = () => {
                reject(new Error(`Failed to load texture at ${tileTextureURL}`));
            };
            image.src = tileTextureURL;
        });

    }
    
    /**
     * Creates and compiles a shader program for use in rendering the tile map.
     * This is where you would define your vertex and fragment shaders, compile them,
     * and link them into a program.
     * @returns The created ShaderProgramInfo.
     */
    private createShaderProgram(): ShaderProgramInfo {

        if (!this.context) {
            throw new Error('The WebGL context is not initialized.');
        }

        // Define the source code for the vertex shader.
        const vsSource = `#version 300 es
precision mediump float;
in vec3 a_position;
in vec2 a_screenTile;
out vec2 v_screenTile;

void main() {

    gl_Position = vec4(a_position, 1.0);
    v_screenTile = a_screenTile;

}
`;

        // Define the source code for the fragment shader.
        const fsSource = `#version 300 es
precision mediump float;
precision highp usampler2D;
uniform vec2 u_tileSize; // 16 16
uniform vec2 u_tilesSize; // 256 960
uniform sampler2D u_tiles;
uniform vec2 u_mapSize; // 256 256
uniform usampler2D u_map;
in vec2 v_screenTile;
out vec4 fragColor;

void main() {

    // Calculate the screen tile coordinate.
    vec2 screenTileColRow = floor(v_screenTile);
    vec2 screenTilePosition = v_screenTile - screenTileColRow;

    vec2 cellColRow = mod(screenTileColRow, u_mapSize);
    vec2 cellUV = cellColRow / u_mapSize;

    // Extract data from the 16-bit unsigned integer texture
    float cellValue = float(texture(u_map, cellUV).r); // Directly use the red channel as the cell value

    // Calculate the tile row and column from the cell value.
    float tilesPerRow = u_tilesSize.x / u_tileSize.x;
    float tilesPerCol = u_tilesSize.y / u_tileSize.y;

    // Wrap the cell value by the number of tiles there are.
    cellValue = mod(cellValue, tilesPerRow * tilesPerCol);

    float tileRow = floor(cellValue / tilesPerRow);
    float tileCol = mod(cellValue, tilesPerRow);

    // Calculate which pixel of the tile to sample.
    vec2 tileCorner = vec2(tileCol, tileRow) * u_tileSize;
    vec2 tilePixel = tileCorner + (screenTilePosition * u_tileSize);
    vec2 uv = tilePixel / u_tilesSize;

    // Sample the tile.
    fragColor = texture(u_tiles, uv);

}
`;

        // Compile shaders and create a WebGL program.
        const program: WebGLProgram = this.compileShaders(vsSource, fsSource);
        if (!program) {
            throw new Error('Unable to create shader program');
        }

        // Fetch the locations of the shader attributes and uniforms.
        const attributeLocations = {
            position: this.context.getAttribLocation(program, 'a_position'),
            screenTile: this.context.getAttribLocation(program, 'a_screenTile'),
        };

        const uniformLocations = {
            tileSize: this.context.getUniformLocation(program, 'u_tileSize'),
            tilesSize: this.context.getUniformLocation(program, 'u_tilesSize'),
            tiles: this.context.getUniformLocation(program, 'u_tiles'),
            mapSize: this.context.getUniformLocation(program, 'u_mapSize'),
            map: this.context.getUniformLocation(program, 'u_map'),
        };

        // Check if fetching locations failed for any attribute or uniform.

        for (const [key, value] of Object.entries(attributeLocations)) {
            if (value === -1) {
                throw new Error(`Shader attribute location not found: ${key}`);
            }
        }

        for (const [key, value] of Object.entries(uniformLocations)) {
            if (value === null) {
                throw new Error(`Shader uniform location not found: ${key}`);
            }
        }

        return {
            program,
            attributeLocations,
            uniformLocations,
        };
    }

    private compileShaders(vsSource: string, fsSource: string): WebGLProgram {

        if (!this.context) {
            throw new Error('The WebGL context is not initialized.');
        }

        // Create vertex shader
        const vertexShader = 
            this.loadShader(
                this.context.VERTEX_SHADER, 
                vsSource);

        // Create fragment shader
        const fragmentShader = 
            this.loadShader(
                this.context.FRAGMENT_SHADER, 
                fsSource);

        // Create the shader program
        const program = 
            this.context.createProgram();
        if (!program) {
            throw new Error('Unable to create shader program');
        }

        // Attach the vertex and fragment shaders to the program
        this.context.attachShader(
            program, 
            vertexShader);
        this.context.attachShader(
            program, 
            fragmentShader);

        // Link the program
        this.context.linkProgram(
            program);

        // Check if the program linked successfully
        if (!this.context.getProgramParameter(
                program, 
                this.context.LINK_STATUS)) {
            const infoLog = 
                this.context.getProgramInfoLog(
                    program);
            this.context.deleteProgram(
                program);
            throw new Error('Failed to link shader program: ' + infoLog);
        }

        return program;
    }

    private loadShader(type: number, source: string): WebGLShader {

        if (!this.context) {
            throw new Error('The WebGL context is not initialized.');
        }

        const shader = 
            this.context.createShader(
                type);
        if (!shader) {
            throw new Error('Unable to create shader.');
        }

        // Set the shader source code
        this.context.shaderSource(
            shader, 
            source);

        // Compile the shader
        this.context.compileShader(
            shader);

        // Check for compilation errors
        if (!this.context.getShaderParameter(
                shader, 
                this.context.COMPILE_STATUS)) {
            const infoLog = 
                this.context.getShaderInfoLog(
                    shader);
            this.context.deleteShader(
                shader);
            throw new Error('An error occurred compiling the shaders: ' + infoLog);
        }

        return shader;
    }

    /**
     * Creates buffers for vertex attributes and sets them up.
     * This is where you would create vertex buffers and bind the data for vertices and texture coordinates.
     */
    private createBuffers(): BufferInfo {

        if (!this.context) {
            throw new Error('The WebGL context is not initialized.');
        }

        const positionBuffer: WebGLBuffer | null = 
            this.context.createBuffer();

        this.context.bindBuffer(
            this.context.ARRAY_BUFFER, 
            positionBuffer);

        // Now create an array of positions for the square.
        const positions: number[] = [
            -1.0, -1.0, 0.0, // First triangle
             1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
            -1.0,  1.0, 0.0, // Second triangle
             1.0, -1.0, 0.0,
             1.0,  1.0, 0.0,
        ];

        // Pass the list of positions into WebGL to build the shape. 
        // We do this by creating a Float32Array from the JavaScript array, then use it to fill the current buffer.
        this.context.bufferData(
            this.context.ARRAY_BUFFER,
            new Float32Array(positions),
            this.context.STATIC_DRAW);

        const screenTileCoordinates: number[] = [
            0.0,  0.0, // First triangle
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0, // Second triangle
            1.0,  0.0,
            1.0,  1.0,
        ];

        // Set up the screen tile texture coordinates for the map.
        const screenTileBuffer: WebGLBuffer | null = 
            this.context.createBuffer();

        // Build the element array buffer; this specifies the indices
        // into the vertex arrays for each face's vertices.
        const indexBuffer: WebGLBuffer | null = 
            this.context.createBuffer();
        
        this.context.bindBuffer(
            this.context.ELEMENT_ARRAY_BUFFER, 
            indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.
        const indices: number[] = [
            0, 1, 2,    // First triangle
            2, 1, 3,    // Second triangle
        ];

        // Now send the element array to GL.
        this.context.bufferData(
            this.context.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), 
            this.context.STATIC_DRAW);

        return {
            position: positionBuffer,
            screenTile: screenTileBuffer,
            indices: indexBuffer,
        };
    }

    updateScreenTileArray() {

        if (!this.context || !this.tileBufferInfo) {
            throw new Error('The WebGL context is not initialized.');
        }

        // Calculate the new texture coordinates based on pan and zoom.
        // Convert pan from tile coordinates to normalized texture coordinates.
        /*
        const left   = (this.panX - this.screenWidth  / 2 / this.zoom) / this.mapWidth  / this.tileWidth;
        const right  = (this.panX + this.screenWidth  / 2 / this.zoom) / this.mapWidth  / this.tileWidth;
        const bottom = (this.panY - this.screenHeight / 2 / this.zoom) / this.mapHeight / this.tileHeight;
        const top    = (this.panY + this.screenHeight / 2 / this.zoom) / this.mapHeight / this.tileHeight;
        */
        const left   = this.panX;
        const right  = this.panX + (this.screenWidth  / this.zoom);
        const top    = this.panY;
        const bottom = this.panY + (this.screenHeight / this.zoom);

        // Update the screenTileArray with the new texture coordinates.
        this.screenTileArray.set([
            left,  bottom, // Bottom left
            right, bottom, // Bottom right
            left,  top,    // Top left
            left,  top,    // Top left
            right, bottom, // Bottom right
            right, top,    // Top right
        ]);

        // Bind the updated screenTileArray to the buffer.
        this.context.bindBuffer(
            this.context.ARRAY_BUFFER, 
            this.tileBufferInfo.screenTile);

        this.context.bufferData(
            this.context.ARRAY_BUFFER, 
            this.screenTileArray, 
            this.context.DYNAMIC_DRAW);

    }

    render(): void {

        //console.log('GLTileRenderer: render: this:', this);

        if (!this.canvas || !this.context || !this.tileProgramInfo || !this.tileBufferInfo || !this.tilesTexture) {
            throw new Error('The canvas, WebGL context, shaders, or textures are not properly initialized.');
        }

        // Update the screen size from the canvas;.
        this.setScreenSize(
            this.canvas.width,
            this.canvas.height);

        // Update the viewport size.
        this.context.viewport(
            0, 
            0, 
            this.context.drawingBufferWidth, 
            this.context.drawingBufferHeight);

        // Clear the canvas before drawing.
        this.context.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        this.context.clearDepth(1.0);                // Clear everything
        this.context.enable(this.context.DEPTH_TEST); // Enable depth testing
        this.context.depthFunc(this.context.LEQUAL);  // Near things obscure far things
    
        // Clear the canvas
        this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
    
        // Use our shader program
        this.context.useProgram(this.tileProgramInfo.program);
    
        // Set the shader uniforms
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileSize, this.tileWidth, this.tileHeight);
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tilesSize, this.tilesWidth, this.tilesHeight);
    
        // Bind the texture to the `tiles` uniform
        this.context.activeTexture(this.context.TEXTURE0);
        this.context.bindTexture(this.context.TEXTURE_2D, this.tilesTexture);
        this.context.uniform1i(this.tileProgramInfo.uniformLocations.tiles, 0); // Texture unit 0 is for u_tiles

        // Set the `map` uniform to use the texture that represents the map data
        // Assuming mapTexture is a WebGLTexture containing the map data
        this.context.activeTexture(this.context.TEXTURE1);
        this.context.bindTexture(this.context.TEXTURE_2D, this.mapTexture); // mapTexture needs to be defined and loaded similar to tilesTexture
        this.context.uniform1i(this.tileProgramInfo.uniformLocations.map, 1); // Texture unit 1 is for u_map
    
        // Set the size of the map (in tiles)
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.mapSize, this.mapWidth, this.mapHeight);
    
        // Bind the position buffer
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.tileBufferInfo.position);
        this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.position, 3, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.position);
    
        // Update the screen tile array with the latest pan and zoom values
        this.updateScreenTileArray();

        // Bind the screen tile texture coordinate buffer
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.tileBufferInfo.screenTile);
        this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.screenTile, 2, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.screenTile);
    
        // Bind the index buffer
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.tileBufferInfo.indices);
    
        // Set the viewport to match the canvas size
        this.context.viewport(0, 0, this.context.canvas.width, this.context.canvas.height);
    
        // Draw the scene
        this.context.drawElements(this.context.TRIANGLES, 6, this.context.UNSIGNED_SHORT, 0);
    }
    
}


export { TileRenderer, CanvasTileRenderer, GLTileRenderer };
