// WebGLTileRenderer implementation class


import { TileRenderer } from './TileRenderer';


/**
 * WebGLTileRenderer is a concrete implementation of the TileRenderer abstract class.
 * It specializes in rendering tile maps using WebGL. This class manages the WebGL
 * context, textures, and shaders required to draw the map onto a canvas element.
 *
 * The WebGLTileRenderer assumes that tiles are square and can be panned and zoomed.
 * Panning is anchored at the center of the canvas, and the map can be interactively
 * navigated by dragging and zooming.
 *
 * Upon initialization, a texture for the tiles is loaded from a provided URL. The
 * rendering context and initial state are set up. The map can then be rendered onto
 * the canvas by invoking the render method.
 * 
 */

interface ShaderUniformLocations {
    tileSize: WebGLUniformLocation | null;
    tileRotateLayer:  WebGLUniformLocation | null;
    tiles: (WebGLUniformLocation | null)[] | null;
    mapSize: WebGLUniformLocation | null;
    map: WebGLUniformLocation | null;
    mop: WebGLUniformLocation | null;
};

interface ShaderAttributeLocations {
    position: GLint;
    screenTile: GLint;
};

interface ShaderProgramInfo {
    program: WebGLProgram;
    attributeLocations: ShaderAttributeLocations;
    uniformLocations: ShaderUniformLocations;
}


interface BufferInfo {
    position: WebGLBuffer | null;
    screenTile: WebGLBuffer | null;
    indices: WebGLBuffer | null;
}


class WebGLTileRenderer extends TileRenderer<WebGL2RenderingContext> {

    /**
     * A WebGLTexture object that represent the texture containing all the tiles.
     * The texture is loaded from image data and is used by the WebGL context to render
     * the tile graphics.
     */
    private tilesTextures: (WebGLTexture | null)[] | null = null;

    /**
     * A WebGLTexture object that represent the tiles of the map.
     * The texture is loaded from tile data and is used by the WebGL context to render
     * the tile graphics.
     */
    private mapTexture: WebGLTexture | null = null;
    private mopTexture: WebGLTexture | null = null;

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

    public tileLayerCount = 8;

    constructor() {
        super();
    }

    /**
     * Initializes the WebGLTileRenderer with the WebGL context and loads the tile texture.
     * @param canvas The canvas.
     * @param context The WebGL rendering context.
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
        context: WebGL2RenderingContext,
        mapData: Uint16Array,
        mopData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileTextureURLs: (string | null)[],
    ): Promise<void> {
    
        await super.initialize(canvas, context, mapData, mopData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURLs);

        this.context = context;
        this.zoom = 1; // Adjust initial zoom level to fit more tiles on screen

        this.tileProgramInfo = this.createShaderProgram();
        this.tileBufferInfo = this.createBuffers();
        this.mapTexture = this.createMapTexture(mapData, mapWidth, mapHeight);
        this.mopTexture = this.createMapTexture(mopData, mapWidth, mapHeight);

        await this.loadTextures(tileTextureURLs);

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
            this.context.TEXTURE_2D, 
            0,
            this.context.R16UI,
            this.mapHeight, // Map data is column major order, so the width is the second dimension.
            this.mapWidth, 
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

    public updateMapData(mapData: Uint16Array, mopData: Uint16Array): void {
        if (!this.context || !this.mapTexture) {
            throw new Error('The WebGL context or map texture is not initialized.');
            return;
        }

        this.context.bindTexture(
            this.context.TEXTURE_2D, 
            this.mapTexture); 

        // Load the map texture with the map data.
        // Assuming mapData is an array of 16-bit unsigned integers.
        this.context.texImage2D(
            this.context.TEXTURE_2D, 
            0,
            this.context.R16UI,
            this.mapHeight, // Map data is column major order, so the width is the second dimension.
            this.mapWidth, 
            0,
            this.context.RED_INTEGER, 
            this.context.UNSIGNED_SHORT, 
            mapData);

        this.context.bindTexture(
            this.context.TEXTURE_2D, 
            this.mopTexture); 

        // Load the mop texture with the mop data.
        // Assuming mapData is an array of 16-bit unsigned integers.
        this.context.texImage2D(
            this.context.TEXTURE_2D, 
            0,
            this.context.R16UI,
            this.mapHeight, // Map data is column major order, so the width is the second dimension.
            this.mapWidth, 
            0,
            this.context.RED_INTEGER, 
            this.context.UNSIGNED_SHORT, 
            mopData);
    }
    
    public async loadTextures(tileTextureURLs: (string | null)[] | null): Promise<void> {

        if (!this.context) {
            throw new Error('GL context or tileTextureURLs are not initialized.');
        }

        const promises = [];

        this.tilesTextures = [];
        for (let i = 0; i < this.tileLayerCount; i++) {

            const texture = this.tilesTextures[i] =
                this.context.createTexture();

            const url =
                (tileTextureURLs &&
                 tileTextureURLs[i]) || null;

            if (url) {

                const promise = new Promise<void>((resolve, reject) => {
                    if (!this.context) {
                        reject(new Error('GL context is not initialized.'));
                        return;
                    }
            
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

                        //console.log("WebGLTileRenderer: loadTextures: image.onload:", "i:", i, "url:", url, "image:", image, "image.width:", image.width, "image.height:", image.height);  

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
                            this.context.NEAREST);

                        this.context.texParameteri(
                            this.context.TEXTURE_2D, 
                            this.context.TEXTURE_MAG_FILTER, 
                            this.context.NEAREST);

                        resolve();
                    };
                    image.onerror = () => {
                        reject(new Error(`Failed to load texture ${i} at ${url}`));
                    };
                    image.src = url;
                });

                //await promise;
                promises.push(promise);
            }
        }

        await Promise.all(promises);
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
            precision highp float;
            precision highp usampler2D;
            uniform vec2 u_tileSize;
            uniform vec2 u_tileRotateLayer;
            uniform vec2 u_mapSize;
            uniform usampler2D u_map;
            uniform usampler2D u_mop;
            uniform sampler2D u_tiles[8];
            in vec2 v_screenTile;
            out vec4 fragColor;

            const vec4 color_brown = vec4(0.8, 0.5, 0.4, 1.0);
            
            void main() {

                // Calculate the screen tile coordinate.
                vec2 screenTileColRow = floor(v_screenTile);
                vec2 screenTilePosition = fract(v_screenTile);

                int cellValue = 0;
                vec2 cellUV;
                bool outOfBounds = false;

                // Check if the screen tile coordinate is out of the map bounds.
                // u_mapSize is the map size in tiles in column-major order so x is rows and y is columns
                if (screenTileColRow.x <  0.0         || screenTileColRow.y <  0.0 || 
                    screenTileColRow.x >= u_mapSize.y || screenTileColRow.y >= u_mapSize.x) {
                    outOfBounds = true;
                } else {

                    // Calculate cell column and row
                    vec2 cellColRow = screenTileColRow;
                    vec2 cellRowCol = vec2(cellColRow.y, cellColRow.x);
                    cellUV = cellRowCol / u_mapSize;

                    // XXX: Mystery fudge factor to prevent sampling from adjacent cells every 6 rows!
                    cellUV.x = cellUV.x * 1.00001;

                    cellValue =
                        int(texture(u_map, cellUV).r);
                }

                int mopValue =
                    int(texture(u_mop, cellUV).r);
                int tileSet =
                    mopValue & 0xff;

                int tileRotate =
                    int(u_tileRotateLayer.x);
                int tileLayer =
                    int(u_tileRotateLayer.y);

                ivec2 tilesSize;
                switch (tileLayer) {
                    case 0: tilesSize = textureSize(u_tiles[0], 0); break;
                    case 1: tilesSize = textureSize(u_tiles[1], 0); break;
                    case 2: tilesSize = textureSize(u_tiles[2], 0); break;
                    case 3: tilesSize = textureSize(u_tiles[3], 0); break;
                    case 4: tilesSize = textureSize(u_tiles[4], 0); break;
                    case 5: tilesSize = textureSize(u_tiles[5], 0); break;
                    case 6: tilesSize = textureSize(u_tiles[6], 0); break;
                    case 7: tilesSize = textureSize(u_tiles[7], 0); break;
                }

                int tilesPerRow = 
                    int(tilesSize.x / int(u_tileSize.x));
                int tilesPerCol = 
                    tilesPerRow; // Tile sets are square.
                int tilesPerSet = 
                    tilesPerRow * tilesPerCol;
                int rowsPerSet =
                    tilesPerSet / tilesPerRow;
                int setsPerTexture =
                    tilesSize.y / (tilesPerCol * int(u_tileSize.y));
                int setRow =
                    (tileSet % setsPerTexture) * rowsPerSet;

                int cellRotatedValue =
                    outOfBounds
                        ? cellValue
                        : ((cellValue & 0x03ff) + 
                           tileRotate +
                           (10 * tilesPerSet));
                int tileValue =
                    int(mod(float(cellRotatedValue), float(tilesPerSet)));

                // Calculate tile row and column from cell value
                int tileRow = int(floor(float(tileValue) / float(tilesPerRow))) + setRow;
                int tileCol = int(mod(float(tileValue), float(tilesPerRow)));

                // Calculate which pixel of the tile to sample
                vec2 tileCorner = vec2(tileCol, tileRow) * u_tileSize;
                vec2 tilePixel = tileCorner + (screenTilePosition * u_tileSize);
                vec2 uv = tilePixel / vec2(tilesSize.x, tilesSize.y);

                // Sample the tile
                vec4 tileColor;
                switch (tileLayer) {
                    case 0: tileColor = texture(u_tiles[0], uv); break;
                    case 1: tileColor = texture(u_tiles[1], uv); break;
                    case 2: tileColor = texture(u_tiles[2], uv); break;
                    case 3: tileColor = texture(u_tiles[3], uv); break;
                    case 4: tileColor = texture(u_tiles[4], uv); break;
                    case 5: tileColor = texture(u_tiles[5], uv); break;
                    case 6: tileColor = texture(u_tiles[6], uv); break;
                    case 7: tileColor = texture(u_tiles[7], uv); break;
                }

                fragColor = tileColor;
            }
        `;

        // Compile shaders and create a WebGL program.
        const program: WebGLProgram = this.compileShaders(vsSource, fsSource);
        if (!program) {
            throw new Error('Unable to create shader program');
        }

        // Fetch the locations of the shader attributes and uniforms.
        const attributeLocations: ShaderAttributeLocations = {
            position: this.context.getAttribLocation(program, 'a_position'),
            screenTile: this.context.getAttribLocation(program, 'a_screenTile'),
        };

        const uniformLocations: ShaderUniformLocations = {
            tileSize: this.context.getUniformLocation(program, 'u_tileSize'),
            tileRotateLayer: this.context.getUniformLocation(program, 'u_tileRotateLayer'),
            tiles: [],
            mapSize: this.context.getUniformLocation(program, 'u_mapSize'),
            map: this.context.getUniformLocation(program, 'u_map'),
            mop: this.context.getUniformLocation(program, 'u_mop'),
        };

        // Populate the uniform location array
        for (let i = 0; i < this.tileLayerCount; i++) {
            uniformLocations.tiles![i] = this.context.getUniformLocation(program, `u_tiles[${i}]`);
        }

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
            if (key == 'tiles') {
                if (value.length != this.tileLayerCount) {
                    throw new Error(`Shader uniform location not found: ${key}`);
                } else {
                    for (const [key2, value2] of Object.entries(value)) {
                        if (value === null) {
                            throw new Error(`Shader uniform location not found: ${key} ${key2}`);
                        }
                    }
                }
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
    
        const positionBuffer: WebGLBuffer | null = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, positionBuffer);
        const positions: number[] = [
            // First triangle
            -1.0,  1.0, 0.0, // Top left
             1.0,  1.0, 0.0, // Top right
            -1.0, -1.0, 0.0, // Bottom left
    
            // Second triangle
             1.0,  1.0, 0.0, // Top right
            -1.0, -1.0, 0.0, // Bottom left
             1.0, -1.0, 0.0, // Bottom right
        ];
        this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(positions), this.context.STATIC_DRAW);
    
        const screenTileCoordinates: number[] = [
            // First triangle
            0.0,  1.0, // Bottom left
            1.0,  1.0, // Bottom right
            0.0,  0.0, // Top left
        
            // Second triangle
            1.0,  1.0, // Bottom right
            0.0,  0.0, // Top left
            1.0,  0.0, // Top right
        ];

        const screenTileBuffer: WebGLBuffer | null = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, screenTileBuffer);
        this.context.bufferData(this.context.ARRAY_BUFFER, this.screenTileArray, this.context.DYNAMIC_DRAW);
    
        const indexBuffer: WebGLBuffer | null = this.context.createBuffer();
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices: number[] = [
            0, 1, 2, // First triangle
            3, 4, 5, // Second triangle
        ];
        this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.context.STATIC_DRAW);
    
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
    
        var px = this.panX * this.tileWidth;
        var py = this.panY * this.tileHeight;
        var z = 4 * this.zoom;

        var left =   (px - (this.screenWidth  / z)) / this.tileWidth;
        var right =  (px + (this.screenWidth  / z)) / this.tileWidth;
        var top =    (py - (this.screenHeight / z)) / this.tileHeight;
        var bottom = (py + (this.screenHeight / z)) / this.tileHeight;

        this.screenTileArray.set([
            // First triangle
            left, top,
            right, top,
            left, bottom,
            // Second triangle
            right, top,
            left, bottom,
            right, bottom
        ]);
    
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.tileBufferInfo.screenTile);
        this.context.bufferSubData(this.context.ARRAY_BUFFER, 0, this.screenTileArray);
    }

    render(): void {
        if (!this.canvas || !this.context || !this.tileProgramInfo || !this.tileBufferInfo || !this.tilesTextures || !this.mapTexture || !this.mopTexture) {
            throw new Error('The canvas, WebGL context, shaders, or textures are not properly initialized.');
        }

        this.setScreenSize(this.canvas.width, this.canvas.height);
        this.context.viewport(0, 0, this.context.drawingBufferWidth, this.context.drawingBufferHeight);

        //this.context.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

        this.context.useProgram(this.tileProgramInfo.program);

        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileSize, this.tileWidth, this.tileHeight);
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileRotateLayer, this.tileRotate, this.tileLayer);

        this.context.activeTexture(this.context.TEXTURE0);
        this.context.bindTexture(this.context.TEXTURE_2D, this.mapTexture);
        this.context.texSubImage2D(
            this.context.TEXTURE_2D, 0, 
            0, 0, 
            this.mapHeight, // Map data is column major order, so the width is the second dimension.
            this.mapWidth, 
            this.context.RED_INTEGER, 
            this.context.UNSIGNED_SHORT, 
            this.mapData
        );
        this.context.uniform1i(this.tileProgramInfo.uniformLocations.map, 0);

        this.context.activeTexture(this.context.TEXTURE1); 
        this.context.bindTexture(this.context.TEXTURE_2D, this.mopTexture);
        this.context.texSubImage2D(
            this.context.TEXTURE_2D, 0, 
            0, 0, 
            this.mapHeight, // Map data is column major order, so the width is the second dimension.
            this.mapWidth, 
            this.context.RED_INTEGER, 
            this.context.UNSIGNED_SHORT, 
            this.mopData
        );
        this.context.uniform1i(this.tileProgramInfo.uniformLocations.mop, 1);

        for (let i = 0; i < this.tileLayerCount; i++) {
            const tileTexture = this.tilesTextures[i];
            const uniformLocation = this.tileProgramInfo.uniformLocations.tiles![i];
            const textureID = this.context.TEXTURE2 + i;
            //console.log("WebGLTileRenderer: render:", "i:", i, "tileTexture:", tileTexture, "uniformLocation:", uniformLocation, "textureID:", textureID);
            this.context.activeTexture(textureID);
            this.context.bindTexture(this.context.TEXTURE_2D, tileTexture);
            this.context.uniform1i(uniformLocation, 2 + i);
        }

        // Map data is column major order, so the width is the second dimension.
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.mapSize, this.mapHeight, this.mapWidth);

        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.tileBufferInfo.position);
        this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.position, 3, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.position);

        this.updateScreenTileArray();

        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.tileBufferInfo.screenTile);
        this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.screenTile, 2, this.context.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.screenTile);

        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.tileBufferInfo.indices);

        this.context.drawElements(this.context.TRIANGLES, 6, this.context.UNSIGNED_SHORT, 0);
    }
    
}

export { TileRenderer, WebGLTileRenderer };
