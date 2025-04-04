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
                @builtin(vertex_index) VertexIndex: u32
            ) -> VertexOutput {
                var positions = array<vec2<f32>, 6>(
                    vec2<f32>(-1.0,  1.0),
                    vec2<f32>( 1.0,  1.0),
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>( 1.0,  1.0),
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>( 1.0, -1.0)
                );

                  var mapCoords = array<vec2<f32>, 6>(
                    vec2<f32>(0.0, 0.0),
                    vec2<f32>(120.0, 0.0),
                    vec2<f32>(0.0, 120.0),
                    vec2<f32>(120.0, 0.0),
                    vec2<f32>(0.0, 120.0),
                    vec2<f32>(120.0, 120.0)
                );

                let position = positions[VertexIndex];
                return VertexOutput(vec4<f32>(position, 0.0, 1.0), mapCoords[VertexIndex]);
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
                    mapSize: vec2<f32>
                };

               
                @fragment
                fn main(input: VertexOutput) -> @location(0) vec4f {
                    // Calculate the tile index from the map texture
                    let mapCoord = vec2<i32>(floor(input.fragCoord));
                    let outOfMap = mapCoord.x <0 || mapCoord.x >= 120 || mapCoord.y <0 || mapCoord.y>=100;
                    let tileIndex = select(textureLoad(mapTexture, vec2<i32>(mapCoord.y, mapCoord.x), 0).r & 0x03ff, 0 ,outOfMap);
                    //DEBUG let tileIndex = select(u32(32+20), 0 ,outOfMap);
                
                    // Calculate the UV coordinates for the tile texture
                    let tileSize = uniforms.tileSize;
                    let textureSize = uniforms.tilesSize;
                   
                
                    // tile coordinate in tile unit
                    let tileCoords = vec2<f32>(f32(tileIndex) % 32.0, floor(f32(tileIndex) / 32.0));
                    let cTilePx = tileCoords * 16.0; // pixel position of tile in tile texture
                    let dTilePx = fract(input.fragCoord)*16; // delta pixel position of current fragment                  
                    let tileUV = (cTilePx + dTilePx)/512.0; // pixel position of current fragment over texture size
            
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
            size: 6 * 4, // size for three vec2<f32>
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        // Map data is column major order, so the width is the second dimension.
        new Float32Array(this.uniformBuffer.getMappedRange()).set([16.0, 16.0, 512.0, 512.0, mapHeight, mapWidth]);
        this.uniformBuffer.unmap();

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
                        size: 6 * 4, // vec2<f32> for tileSize, tilesSize, and mapSize
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

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.draw(6);//, 1, 0, 0);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}


export { TileRenderer, WebGPUTileRenderer };