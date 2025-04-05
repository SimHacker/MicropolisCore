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
    public tileTextures: Map<string, GPUTexture>;

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
        this.tileTextures = new Map();
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
            size: [mapHeight, mapWidth, 1], // Map data is column major order, so the width is the second dimension.
            format: 'r16uint',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.mapTextureView = this.mapTexture.createView();

        // Copy map data to texture
         // Map data is column major order, so the width is the second dimension.
        const bytesPerRow = Math.ceil(mapHeight * 2 / 256) * 256;
        const bufferSize = bytesPerRow * mapWidth;
        
        const mapBuffer = this.device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint16Array(mapBuffer.getMappedRange()).set(mapData);
        mapBuffer.unmap();
        
        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToTexture(
            { buffer: mapBuffer, bytesPerRow: bytesPerRow },
            { texture: this.mapTexture },
            [mapHeight, mapWidth, 1] // Map data is column major order, so the width is the second dimension.
        );
        this.device.queue.submit([commandEncoder.finish()]);
        
        // Create the shader modules
        const vertexShaderModule = this.device.createShaderModule({
            code: `@vertex
            fn main(
                @builtin(vertex_index) VertexIndex: u32
            ) -> @builtin(position) vec4<f32> {
                var positions = array<vec2<f32>, 6>(
                    vec2<f32>(-1.0,  1.0),
                    vec2<f32>( 1.0,  1.0),
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>( 1.0,  1.0),
                    vec2<f32>(-1.0, -1.0),
                    vec2<f32>( 1.0, -1.0)
                );
                let position = positions[VertexIndex];
                return vec4<f32>(position, 0.0, 1.0);
            }`,
        });

        const fragmentShaderModule = this.device.createShaderModule({
            code: `
                @group(0) @binding(0) var tileTexture: texture_2d<f32>;
                @group(0) @binding(1) var tileSampler: sampler;
                @group(0) @binding(2) var mapTexture: texture_2d<u32>;

                struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) fragCoord: vec2<f32>,
                };

                struct Uniforms {
                    tileSize: vec2<f32>;
                    tilesSize: vec2<f32>;
                    mapSize: vec2<f32>;
                };

                @group(0) @binding(3) var<uniform> uniforms: Uniforms;

                fn getTileUV(tileIndex: u32, tileSize: vec2<f32>, textureSize: vec2<f32>) -> vec2<f32> {
                    let tilesPerRow = textureSize.x / tileSize.x;
                    let tileRow = f32(tileIndex) / tilesPerRow;
                    let tileCol = f32(tileIndex) - tileRow * tilesPerRow;
                    let uv = vec2<f32>(tileCol * tileSize.x, tileRow * tileSize.y) / textureSize;
                    return uv;
                }

                @fragment
                fn main(input: VertexOutput) -> @location(0) vec4<f32> {
                    // Calculate the tile index from the map texture
                    let mapCoord = vec2<i32>(input.fragCoord);
                    let tileIndex = textureLoad(mapTexture, mapCoord, 0).x;

                    // Calculate the UV coordinates for the tile texture
                    let tileSize = uniforms.tileSize;
                    let textureSize = uniforms.tilesSize;
                    let tileUV = getTileUV(tileIndex, tileSize, textureSize);

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
            magFilter: 'linear',
            minFilter: 'linear',
        });

        // Make sure the uniform buffer is created and populated correctly
        this.uniformBuffer = this.device.createBuffer({
            size: 6 * 4, // size for three vec2<f32>
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        // Map data is column major order, so the width is the second dimension.
        new Float32Array(this.uniformBuffer.getMappedRange()).set([16.0, 16.0, 256.0, 256.0, mapHeight, mapWidth]);
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
        if (!this.canvas || !this.context || !this.pipeline || !this.bindGroup) {
            throw new Error('The canvas, WebGPU context, pipeline, or bind group are not properly initialized.');
        }

        this.setScreenSize(this.canvas.width, this.canvas.height);

        const commandEncoder = this.device.createCommandEncoder();
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

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    // Replace individual uniforms with a structured uniform buffer
    interface RenderUniforms {
        tileSize: [number, number];     // vec2<f32>
        tilesSize: [number, number];    // vec2<f32>
        mapSize: [number, number];      // vec2<f32>
        offset: [number, number];       // vec2<f32>
        zoom: number;                   // f32
        padding: number;                // for alignment
    }

    private updateUniforms(): void {
        const uniformData = new Float32Array([
            this.tileWidth, this.tileHeight,
            this.tilesWidth, this.tilesHeight,
            this.mapWidth, this.mapHeight,
            this.offsetX, this.offsetY,
            this.zoom, 0.0  // padding for alignment
        ]);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);
    }

    private async createResources(): Promise<void> {
        // Create descriptor sets for different resource types
        const textureDescriptor: GPUTextureDescriptor = {
            size: [this.tilesWidth, this.tilesHeight, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | 
                   GPUTextureUsage.COPY_DST | 
                   GPUTextureUsage.RENDER_ATTACHMENT,
            mipLevelCount: 4,  // Support mipmaps for better scaling
        };

        // Support multiple tile sets or overlay textures
        this.tileTextures = new Map();
        this.tileTextures.set('main', this.device.createTexture(textureDescriptor));
    }

    private validateDevice(): void {
        const requiredFeatures = [
            'texture-compression-bc',
            'timestamp-query',
        ] as GPUFeatureName[];

        for (const feature of requiredFeatures) {
            if (!this.device.features.has(feature)) {
                console.warn(`Optional feature ${feature} not available`);
            }
        }
    }

    private createPipeline(): void {
        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            // ... other settings ...
            multisample: {
                count: 4,  // MSAA support
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',    // Better culling
                frontFace: 'ccw',
            }
        };
    }
}


export { TileRenderer, WebGPUTileRenderer };
