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
    tilesSize: WebGLUniformLocation | null;
    tileRotateOpacity:  WebGLUniformLocation | null;
    tiles: WebGLUniformLocation | null;
    mapSize: WebGLUniformLocation | null;
    map: WebGLUniformLocation | null;
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
     * Initializes the WebGLTileRenderer with the WebGL context and loads the tile texture.
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
                this.zoom = 1; // Adjust initial zoom level to fit more tiles on screen
    
                //if (!this.context.getExtension('EXT_texture_norm16')) {
                //    console.error('R32UI format is not supported on this device.');
                //    return null;
                //}
    
                this.tileProgramInfo = this.createShaderProgram();
                this.tileBufferInfo = this.createBuffers();
                this.mapTexture = this.createMapTexture(mapData, mapWidth, mapHeight);
    
                return this.loadTexture(tileTextureURL);
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

    public updateMapData(mapData: Uint16Array): void {
        if (!this.context || !this.mapTexture) {
            throw new Error('The WebGL context or map texture is not initialized.');
            return;
        }

        this.context.bindTexture(
            this.context.TEXTURE_2D, 
            this.mapTexture); 

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
    }
    
    public loadTexture(tileTextureURL: string): Promise<void> {

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
                    this.context.NEAREST);

                this.context.texParameteri(
                    this.context.TEXTURE_2D, 
                    this.context.TEXTURE_MAG_FILTER, 
                    this.context.NEAREST);

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
            precision highp float;
            precision highp usampler2D;
            uniform vec2 u_tileSize;
            uniform vec2 u_tilesSize;
            uniform vec2 u_tileRotateOpacity;
            uniform sampler2D u_tiles;
            uniform vec2 u_mapSize;
            uniform usampler2D u_map;
            in vec2 v_screenTile;
            out vec4 fragColor;

            const vec4 color_brown = vec4(0.8, 0.5, 0.4, 1.0);
            
            void main() {

                // Step 1: Calculate the screen tile coordinate.
                vec2 screenTileColRow = floor(v_screenTile);
                vec2 screenTilePosition = fract(v_screenTile);

                // Check if the screen tile coordinate is out of the map bounds.
                // u_mapSize is the map size in tiles in column-major order so x is rows and y is columns
                if (screenTileColRow.x <  0.0         || screenTileColRow.y <  0.0 || 
                    screenTileColRow.x >= u_mapSize.y || screenTileColRow.y >= u_mapSize.x) {
                    fragColor = color_brown;
                    return;
                }

                // Step 2: Calculate cell column and row
                vec2 cellColRow = screenTileColRow;
                vec2 cellRowCol = vec2(cellColRow.y, cellColRow.x);
                vec2 cellUV = cellRowCol / u_mapSize;

                // XXX: Mystery fudge factor to prevent sampling from adjacent cells every 6 rows!
                cellUV.x = cellUV.x * 1.00001;

                // Step 3: Extract data from the 16-bit unsigned integer texture
                int tilesPerRow = 
                    int(u_tilesSize.x / u_tileSize.x);
                int tilesPerCol = 
                    int(u_tilesSize.y / u_tileSize.y);
                int tileCount = 
                    tilesPerRow * tilesPerCol;
                int cellValue =
                    int(texture(u_map, cellUV).r);
                int cellRotatedValue = 
                    (cellValue & 0x03ff) + 
                    int(u_tileRotateOpacity.x) +
                    (10 * tileCount);
                int tileValue =
                    int(mod(float(cellRotatedValue), float(tileCount)));

                // Step 4: Calculate tile row and column from cell value
                int tileRow = int(floor(float(tileValue) / float(tilesPerRow)));
                int tileCol = int(mod(float(tileValue), float(tilesPerRow)));

                // Step 5: Calculate which pixel of the tile to sample
                vec2 tileCorner = vec2(tileCol, tileRow) * u_tileSize;
                vec2 tilePixel = tileCorner + (screenTilePosition * u_tileSize);
                vec2 uv = tilePixel / u_tilesSize;

                // Step 6: Sample the tile
                if (u_tileRotateOpacity.y >= 1.0) {
                    fragColor = texture(u_tiles, uv);
                } else if (u_tileRotateOpacity.y > 0.0) {
                    fragColor = mix(texture(u_tiles, uv), fragColor, u_tileRotateOpacity.y);
                }

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
            tilesSize: this.context.getUniformLocation(program, 'u_tilesSize'),
            tileRotateOpacity: this.context.getUniformLocation(program, 'u_tileRotateOpacity'),
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
        if (!this.canvas || !this.context || !this.tileProgramInfo || !this.tileBufferInfo || !this.tilesTexture || !this.mapTexture) {
            throw new Error('The canvas, WebGL context, shaders, or textures are not properly initialized.');
        }

        this.setScreenSize(this.canvas.width, this.canvas.height);
        this.context.viewport(0, 0, this.context.drawingBufferWidth, this.context.drawingBufferHeight);
        //this.context.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
        this.context.useProgram(this.tileProgramInfo.program);
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileSize, this.tileWidth, this.tileHeight);
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tilesSize, this.tilesWidth, this.tilesHeight);
        this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileRotateOpacity, this.tileRotate, this.tileOpacity);
        this.context.activeTexture(this.context.TEXTURE0);
        this.context.bindTexture(this.context.TEXTURE_2D, this.tilesTexture);
        this.context.uniform1i(this.tileProgramInfo.uniformLocations.tiles, 0);
        this.context.activeTexture(this.context.TEXTURE1);
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
        this.context.uniform1i(this.tileProgramInfo.uniformLocations.map, 1);
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
