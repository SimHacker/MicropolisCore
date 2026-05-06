// Pre-allocated ring-buffer pools for per-draw GPU buffers.
//
// Instead of creating and destroying uniform and vertex buffers every draw call,
// we pre-allocate a pool of fixed-size buffers and cycle through them. The pool
// grows if more buffers are needed in a frame, and resets the cursor each frame.
// Buffers are never destroyed during normal operation — zero per-frame allocation
// after warmup.

/// <reference types="@webgpu/types" />

export class GpuUniformPool {
    private device: GPUDevice;
    private bufferSize: number;
    private usage: number;
    private pool: GPUBuffer[] = [];
    private cursor = 0;
    private label: string;

    constructor(device: GPUDevice, bufferSize: number, label: string, initialCapacity = 32) {
        this.device = device;
        this.bufferSize = bufferSize;
        this.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
        this.label = label;
        for (let i = 0; i < initialCapacity; i++) {
            this.pool.push(this._create(i));
        }
    }

    acquire(): GPUBuffer {
        if (this.cursor >= this.pool.length) {
            this.pool.push(this._create(this.pool.length));
        }
        return this.pool[this.cursor++];
    }

    resetFrame(): void {
        this.cursor = 0;
    }

    get allocated(): number { return this.pool.length; }
    get usedThisFrame(): number { return this.cursor; }

    private _create(index: number): GPUBuffer {
        return this.device.createBuffer({
            label: `pool:${this.label}[${index}]`,
            size: this.bufferSize,
            usage: this.usage,
        });
    }
}

export class GpuVertexBufferPool {
    private device: GPUDevice;
    private usage: number;
    private pool: { buffer: GPUBuffer; size: number }[] = [];
    private cursor = 0;
    private label: string;

    constructor(device: GPUDevice, label: string) {
        this.device = device;
        this.usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        this.label = label;
    }

    acquire(byteSize: number): GPUBuffer {
        while (this.cursor < this.pool.length) {
            const entry = this.pool[this.cursor];
            if (entry.size >= byteSize) {
                this.cursor++;
                return entry.buffer;
            }
            entry.buffer.destroy();
            const buf = this._create(byteSize, this.cursor);
            entry.buffer = buf;
            entry.size = byteSize;
            this.cursor++;
            return buf;
        }
        const buf = this._create(byteSize, this.pool.length);
        this.pool.push({ buffer: buf, size: byteSize });
        this.cursor++;
        return buf;
    }

    resetFrame(): void {
        this.cursor = 0;
    }

    get allocated(): number { return this.pool.length; }
    get usedThisFrame(): number { return this.cursor; }

    private _create(size: number, index: number): GPUBuffer {
        return this.device.createBuffer({
            label: `pool:${this.label}[${index}]`,
            size,
            usage: this.usage,
        });
    }
}
