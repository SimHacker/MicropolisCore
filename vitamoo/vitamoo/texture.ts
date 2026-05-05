// VitaMoo texture loader — reads BMP files (Sims native format),
// plus PNG and JPG when the file extension says so.
/// <reference types="@webgpu/types" />

import type { GpuInstrumentationCallbacks } from './gpu-instrumentation.js';
//
// BMP is the canonical format for Sims 1 skin textures. They're 8-bit
// indexed color with a 256-entry palette. We read them directly because
// that's what the game content uses and we don't want to require a
// conversion step for legacy content.
//
// Any other extension falls through to the browser's native Image
// decoder, which handles: .png, .jpg, .jpeg, .gif, .webp, .avif,
// .svg, .ico — whatever the browser supports. This covers modern
// content from Simopolis tools, AI image generation, or Photoshop.
//
// WebGPU: loadTexture(device, queue, url) returns a GPUTexture handle
// that the renderer accepts in drawMesh.

export type TextureHandle = GPUTexture;

// Parse a BMP file from an ArrayBuffer. Returns an ImageData-compatible
// object with RGBA pixels (for createImageBitmap → WebGPU upload).
export function parseBMP(buffer: ArrayBuffer): {
    width: number; height: number; data: Uint8ClampedArray
} {
    const view = new DataView(buffer);

    // BMP header
    const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1));
    if (magic !== 'BM') throw new Error('Not a BMP file');

    const dataOffset = view.getUint32(10, true);
    const headerSize = view.getUint32(14, true);
    const width = view.getInt32(18, true);
    const rawHeight = view.getInt32(22, true);
    const height = Math.abs(rawHeight);
    const topDown = rawHeight < 0;
    const bitsPerPixel = view.getUint16(28, true);
    const compression = view.getUint32(30, true);

    // We handle 8-bit indexed (most Sims textures) and 24-bit RGB
    if (bitsPerPixel !== 8 && bitsPerPixel !== 24 && bitsPerPixel !== 32) {
        throw new Error(`Unsupported BMP bit depth: ${bitsPerPixel}`);
    }

    const rgba = new Uint8ClampedArray(width * height * 4);

    if (bitsPerPixel === 8) {
        // 8-bit indexed color — read the palette first
        const paletteOffset = 14 + headerSize;
        const numColors = view.getUint32(46, true) || 256;
        const palette = new Uint8Array(numColors * 4); // BGRA per entry
        for (let i = 0; i < numColors; i++) {
            const off = paletteOffset + i * 4;
            palette[i * 4 + 0] = view.getUint8(off + 2); // R (BMP stores BGR)
            palette[i * 4 + 1] = view.getUint8(off + 1); // G
            palette[i * 4 + 2] = view.getUint8(off + 0); // B
            palette[i * 4 + 3] = 255;                     // A
        }

        // Row stride is padded to 4-byte boundary
        const rowStride = Math.ceil(width / 4) * 4;

        if (compression === 0) {
            // BI_RGB: uncompressed indexed
            for (let y = 0; y < height; y++) {
                const srcRow = topDown ? y : (height - 1 - y);
                const srcOffset = dataOffset + srcRow * rowStride;
                for (let x = 0; x < width; x++) {
                    const idx = view.getUint8(srcOffset + x);
                    const dstOffset = (y * width + x) * 4;
                    rgba[dstOffset + 0] = palette[idx * 4 + 0];
                    rgba[dstOffset + 1] = palette[idx * 4 + 1];
                    rgba[dstOffset + 2] = palette[idx * 4 + 2];
                    rgba[dstOffset + 3] = palette[idx * 4 + 3];
                }
            }
        } else if (compression === 1) {
            // BI_RLE8: run-length encoded 8-bit
            decodeRLE8(view, dataOffset, width, height, topDown, palette, rgba);
        } else {
            throw new Error(`Unsupported BMP compression: ${compression}`);
        }
    } else if (bitsPerPixel === 24) {
        // 24-bit RGB
        const rowStride = Math.ceil(width * 3 / 4) * 4;
        for (let y = 0; y < height; y++) {
            const srcRow = topDown ? y : (height - 1 - y);
            const srcOffset = dataOffset + srcRow * rowStride;
            for (let x = 0; x < width; x++) {
                const sOff = srcOffset + x * 3;
                const dOff = (y * width + x) * 4;
                rgba[dOff + 0] = view.getUint8(sOff + 2); // R (BGR order)
                rgba[dOff + 1] = view.getUint8(sOff + 1); // G
                rgba[dOff + 2] = view.getUint8(sOff + 0); // B
                rgba[dOff + 3] = 255;
            }
        }
    } else if (bitsPerPixel === 32) {
        // 32-bit BGRA
        for (let y = 0; y < height; y++) {
            const srcRow = topDown ? y : (height - 1 - y);
            const srcOffset = dataOffset + srcRow * width * 4;
            for (let x = 0; x < width; x++) {
                const sOff = srcOffset + x * 4;
                const dOff = (y * width + x) * 4;
                rgba[dOff + 0] = view.getUint8(sOff + 2); // R
                rgba[dOff + 1] = view.getUint8(sOff + 1); // G
                rgba[dOff + 2] = view.getUint8(sOff + 0); // B
                rgba[dOff + 3] = view.getUint8(sOff + 3); // A
            }
        }
    }

    return { width, height, data: rgba };
}

// Decode BI_RLE8 compressed pixel data
function decodeRLE8(
    view: DataView, offset: number,
    width: number, height: number, topDown: boolean,
    palette: Uint8Array, rgba: Uint8ClampedArray,
): void {
    let x = 0;
    let y = topDown ? 0 : height - 1;
    let pos = offset;

    while (pos < view.byteLength) {
        const count = view.getUint8(pos++);
        const value = view.getUint8(pos++);

        if (count > 0) {
            // Encoded run: repeat `value` for `count` pixels
            for (let i = 0; i < count && x < width; i++) {
                const dOff = (y * width + x) * 4;
                rgba[dOff + 0] = palette[value * 4 + 0];
                rgba[dOff + 1] = palette[value * 4 + 1];
                rgba[dOff + 2] = palette[value * 4 + 2];
                rgba[dOff + 3] = palette[value * 4 + 3];
                x++;
            }
        } else {
            // Escape codes
            if (value === 0) {
                // End of line
                x = 0;
                y += topDown ? 1 : -1;
            } else if (value === 1) {
                // End of bitmap
                break;
            } else if (value === 2) {
                // Delta: move cursor
                x += view.getUint8(pos++);
                y += (topDown ? 1 : -1) * view.getUint8(pos++);
            } else {
                // Absolute run: `value` literal pixels
                for (let i = 0; i < value && x < width; i++) {
                    const idx = view.getUint8(pos++);
                    const dOff = (y * width + x) * 4;
                    rgba[dOff + 0] = palette[idx * 4 + 0];
                    rgba[dOff + 1] = palette[idx * 4 + 1];
                    rgba[dOff + 2] = palette[idx * 4 + 2];
                    rgba[dOff + 3] = palette[idx * 4 + 3];
                    x++;
                }
                // Absolute runs are padded to 16-bit boundary
                if (value % 2 !== 0) pos++;
            }
        }
    }
}

// Load a texture from a file. Detects format by extension.
// BMP: parseBMP (8/24/32 bpp, BI_RGB + BI_RLE8) → ImageData → createImageBitmap → copyExternalImageToTexture.
//      Success log when verbose: "[texture] loaded <url> WxH". Verify in-render with ?debugSlice=1 (UV as color) or debugSlice=0 (normal).
// PNG/JPG: browser decode → createImageBitmap → copyExternalImageToTexture.
export async function loadTexture(
    device: GPUDevice,
    queue: GPUQueue,
    url: string,
    verbose = false,
    instrumentation?: GpuInstrumentationCallbacks,
): Promise<TextureHandle> {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    let bitmap: ImageBitmap;

    try {
        if (ext === 'bmp') {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
            const buffer = await response.arrayBuffer();
            const { width, height, data } = parseBMP(buffer);
            const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
            bitmap = await createImageBitmap(imageData, { premultiplyAlpha: 'none' });
        } else {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${url}`);
            const blob = await response.blob();
            bitmap = await createImageBitmap(blob, { premultiplyAlpha: 'none' });
        }
    } catch (e) {
        console.warn('[texture] loadTexture failed:', url, e);
        throw e;
    }

    const w = bitmap.width;
    const h = bitmap.height;
    const tex = device.createTexture({
        label: `tex:${url.replace(/^.*\//, '')}`,
        size: [w, h, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture: tex, premultipliedAlpha: false },
        [w, h, 1],
    );
    bitmap.close();
    const byteSize = w * h * 4;
    instrumentation?.onResourceAllocated?.({
        kind: 'texture',
        purpose: 'image-texture',
        width: w,
        height: h,
        depthOrArrayLayers: 1,
        format: 'rgba8unorm',
        byteSize,
        label: url,
    });
    if (verbose) console.log('[texture] loaded', url, `${w}x${h}`);
    return tex;
}
