// WebGPUTileRenderer implementation class


/// <reference types="@webgpu/types" />
import { TileRenderer } from './TileRenderer';


class WebGPUTileRenderer extends TileRenderer<GPUCanvasContext> {
    
    public context: GPUCanvasContext;
    public device: GPUDevice;
    public tileTexture: GPUTexture;
    public tileTextureView: GPUTextureView;
    public mapTexture: GPUTexture;
    public mapTextureView: GPUTextureView;
    public pipeline: GPURenderPipeline;
    public bindGroup: GPUBindGroup;
    public sampler: GPUSampler;
    public uniformBuffer: GPUBuffer;
    public verticeBuffer;

    constructor() {
        super();
        this.context = {} as GPUCanvasContext; // Initialize with empty object
        this.device = {} as GPUDevice;
        this.tileTexture = {} as GPUTexture;
        this.tileTextureView = {} as GPUTextureView;
        this.mapTexture = {} as GPUTexture;
        this.mapTextureView = {} as GPUTextureView;
        this.pipeline = {} as GPURenderPipeline;
        this.bindGroup = {} as GPUBindGroup;
        this.sampler = {} as GPUSampler;
        this.uniformBuffer = {} as GPUBuffer;

        this.verticeBuffer = {}  as GPUBuffer;
    }

    async initialize(
        canvas: HTMLCanvasElement,
        context: GPUCanvasContext,
        mapData: Uint16Array,
        mopData: Uint16Array,
        mapWidth: number,
        mapHeight: number,
        tileWidth: number,
        tileHeight: number,
        tileTextureURLs: string[],
    ): Promise<void> {

        await super.initialize(canvas, this.context, mapData, mopData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURLs);
        console.log({mapData, mopData, mapWidth, mapHeight, tileWidth, tileHeight, tileTextureURLs})
       
        this.context = canvas.getContext('webgpu') as GPUCanvasContext;
        if (!this.context) {
            throw new Error('WebGPU is not supported.');
        }

        // Request an adapter and device
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get GPU adapter.');
        }

        this.device = await adapter.requestDevice();

        this.context.configure({
            device: this.device,
            format: 'bgra8unorm',
        });

        this.verticeBuffer = this.squareVerticeBuffer();

        // Load the tile texture
        const tileImage = await this.loadImage(tileTextureURLs[0]);
        console.log("texture size",tileImage.width, tileImage.height);
        this.tileTexture = this.device.createTexture({
            size: [tileImage.width, tileImage.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.tileTextureView = this.tileTexture.createView();

        // Copy image data to texture
        const imageBitmap = await createImageBitmap(tileImage);
        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.tileTexture },
            [tileImage.width, tileImage.height, 1]
        );

       
        // Create the map texture
        this.mapTexture = this.device.createTexture({
            size: [mapHeight, mapWidth], // Map data is column major order, so the width is the second dimension.
            format:'r16uint',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.mapTextureView = this.mapTexture.createView();


        this.device.queue.writeTexture( {texture:this.mapTexture}, mapData,
             {bytesPerRow:mapHeight * Uint16Array.BYTES_PER_ELEMENT}, { width: mapHeight, height:mapWidth });

        
        // Create the shader modules
        const vertexShaderModule = this.device.createShaderModule({
            code: /*wgsl*/`

            struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) fragCoord: vec2<f32>,
            };

            @vertex
            fn main(
                @location(0) position : vec4f, @location(1) mapCoord : vec2f) -> VertexOutput {
                return VertexOutput(position, mapCoord);
            }`,
        });

        const fragmentShaderModule = this.device.createShaderModule({
            code: /*wgsl*/`
               
                @group(0) @binding(0) var tileTexture: texture_2d<f32>;
                @group(0) @binding(1) var tileSampler: sampler;
                @group(0) @binding(2) var mapTexture: texture_2d<u32>;
                @group(0) @binding(3) var<uniform> uniforms: Uniforms;
               
                struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) fragCoord: vec2<f32>,
                };

                struct Uniforms {
                    tileSize: vec2<f32>,
                    tilesSize: vec2<f32>,
                    mapSize: vec2<f32>,
                    tileRotate: vec2<f32>
                };

               
                @fragment
                fn main(input: VertexOutput) -> @location(0) vec4f {

                    let tileSize = uniforms.tileSize;
                    let textureSize = uniforms.tilesSize;
                    let mapSize = uniforms.mapSize;
                    let tileSet = uniforms.tileRotate.y; // tileSet index in a given tileset texture
                   
                    // Calculate the tile index from the map texture
                    let mapCoord = vec2<i32>(floor(input.fragCoord));
                    let outOfMap = mapCoord.x < 0 || mapCoord.x >= i32(mapSize.y) || mapCoord.y < 0 || mapCoord.y >= i32(mapSize.x);
                    let tileIndex = select(textureLoad(mapTexture, vec2<i32>(mapCoord.y, mapCoord.x), 0).r & 0x03ff, 0 ,outOfMap);
                    //DEBUG let tileIndex = select(u32(32+20), 0 ,outOfMap);
                
                    // Calculate the UV coordinates for the tile texture (assuming tiles and texture are squares)
        
                    let tilesPerRow = textureSize.x / tileSize.x;
                    // tile coordinate in tile unit
                    let tileCoords = vec2<f32>(f32(tileIndex) % tilesPerRow, floor(f32(tileIndex) / tilesPerRow));
                    let cTilePx = tileCoords * tileSize.x; // top left corner pixel position in tile texture
                    let dTilePx = fract(input.fragCoord) * tileSize.x; // delta pixel position of current fragment    
                    // magic number 10 is the number of tilesets in tile texture              
                    let tileUV = (cTilePx + dTilePx + vec2f(0, tileSet * textureSize.y)) /vec2f(textureSize.x, textureSize.y * 10); // pixel position of current fragment over texture size
            
                    // Sample the color from the tile texture
                    let color = textureSample(tileTexture, tileSampler, tileUV);                 
                    return color;
                }`,
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: 'float' },
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: { type: 'filtering' },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: { sampleType: 'uint' },
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' },
                },
              
            ],
        });
        
        // Create the pipeline
        this.pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
            vertex: {
                module: vertexShaderModule,
                entryPoint: 'main',
                buffers: [verticesDescription()],
            },
            fragment: {
                module: fragmentShaderModule,
                entryPoint: 'main',
                targets: [
                    {
                        format: 'bgra8unorm',
                    },
                ],
            },
            primitive: {
                topology: 'triangle-list',
            },
        });

        // Add a sampler creation
        this.sampler = this.device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
        });

        // Make sure the uniform buffer is created and populated correctly
        this.uniformBuffer = this.device.createBuffer({
            size: 8 * 4, // size for three vec2<f32>
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,           
        });
        this.setUniforms();

        // Correct the bind group entries to ensure all resources are correctly specified
        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.tileTextureView,
                },
                {
                    binding: 1,
                    resource: this.sampler,
                },
                {
                    binding: 2,
                    resource: this.mapTextureView,
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.uniformBuffer,
                        offset: 0,
                        size: 8 * 4, // vec2<f32> for tileSize, tilesSize, and mapSize, tileRotate
                    },
                },
               
            ],
        });
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }

    render(): void {
       // console.log('render', this.tileRotate, this.tileLayer);

        if (!this.canvas || !this.context || !this.pipeline || !this.bindGroup) {
            throw new Error('The canvas, WebGPU context, pipeline, or bind group are not properly initialized.');
        }

        this.setScreenSize(this.canvas.width, this.canvas.height);

        this.setUniforms();

       
        // copy map data
       this.device.queue.writeTexture( {texture:this.mapTexture}, this.mapData, {bytesPerRow:100 * Uint16Array.BYTES_PER_ELEMENT}, { width: 100, height:120 });

        //
        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                },
            ],
        };

        this.verticeBuffer = this.squareVerticeBuffer();

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setVertexBuffer(0, this.verticeBuffer);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.draw(6);//, 1, 0, 0);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    setUniforms() {
       // console.log(this.tileLayer, this.tileRotate, this.mopData[0]);
        // Map data is column major order, so the width is the second dimension.
        const data = new Float32Array(8);
        // uniforms are : Tile size, Texture size, rotate, tileset index
        // Hardcoded texture size works for all10.png ... thanks to some magic values in fragment shader
        data.set([16.0, 16.0, 512.0, 512.0, this.mapHeight, this.mapWidth,this.tileRotate, this.mopData[0]]);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, data);      
    }

    squareVerticeBuffer() {
        var px = this.panX * this.tileWidth;
        var py = this.panY * this.tileHeight;
        var z = 4 * this.zoom;
    
        var left =   (px - (this.screenWidth  / z)) / this.tileWidth;
        var right =  (px + (this.screenWidth  / z)) / this.tileWidth;
        var top =    (py - (this.screenHeight / z)) / this.tileHeight;
        var bottom = (py + (this.screenHeight / z)) / this.tileHeight;

       // console.log({left,right,top,bottom});

        //
        // C---D
        // | \ |
        // |  \|
        // A---B
        // prettier-ignore
        const vertexArray = new Float32Array([
            // float4 position,  float2 map cell coordinates,
            -1, -1, 0, 1,   left, bottom,   //A
             1, -1, 0, 1,   right, bottom,   //B
            -1,  1, 0, 1,   left, top,   //C
          
            -1,  1, 0, 1,   left, top,   //C
             1, -1, 0, 1 ,  right, bottom,   //B
             1,  1, 0, 1,   right, top    //D
          ]);
      
  
        const verticeBuffer = this.device.createBuffer({
          size: vertexArray.byteLength,
          usage: GPUBufferUsage.VERTEX,
          mappedAtCreation: true,
        });
        new Float32Array(verticeBuffer.getMappedRange()).set(vertexArray);
        verticeBuffer.unmap();
        return verticeBuffer;
      }
      
}


 function verticesDescription(): GPUVertexBufferLayout{
    return {
      arrayStride: 6 * 4,
      attributes: [
        {
          // position
          shaderLocation: 0,
          offset: 0,
          format: "float32x4",
        },
        {
          // map coordinates
          shaderLocation: 1,
          offset: 4 * 4,
          format: "float32x2",
        },
      ],
    };
  }


export { TileRenderer, WebGPUTileRenderer };