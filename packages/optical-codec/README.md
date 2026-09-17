# @micropolis/optical-codec

The reader for the optical channel, and the test bench that decides whether the channel's claims are
true. Specified in [`apps/screen-angel/OPTICAL-CHANNEL.yml`](../../apps/screen-angel/OPTICAL-CHANNEL.yml)
and [`RECOGNIZER.yml`](../../apps/screen-angel/RECOGNIZER.yml).

Pure TypeScript, no DOM, no canvas. The same code runs in Electron's main process, in a browser tab
and in Node under `vitest`, which is what makes a fixture worth writing.

## What is here

| File | Job |
|---|---|
| `raster.ts` | RGBA buffers, a few drawing primitives, and a PNG writer |
| `qr.ts` | QR read and write, over `zxing-wasm` |
| `scan.ts` | One frame in, findings out. The whole recognition entry point |
| `egg-code.ts` | The band code: digits, palette, check digit, big-endian prefixes |
| `egg-render.ts` | Draws an egg, so there is something to read before the game draws one |
| `scene.ts` | A synthetic game frame with codes in it, and the ground truth to check against |
| `degrade.ts` | The abuse suite: scaling, blur, noise, colour cast, hand-held tilt |

## What the decoder already does, and we therefore do not

`zxing-wasm` wraps `zxing-cpp`, which locates the finder patterns, solves the perspective transform
from them, samples the module grid through it, and retries rotated, inverted and downscaled. A phone
held at an angle to a monitor is the ordinary case for it. We add no geometry of our own.

The native `BarcodeDetector` was the alternative and is not usable: it is absent or refuses QR on
desktop Chrome, so one WebAssembly decoder for every surface beats a platform service that only
exists on some of them.

## Measured legibility

`pnpm tsx scripts/measure-legibility.ts` sweeps pixels-per-module against each degradation. A 37-byte
payload at error correction level M, in an 800x600 frame:

| condition | 1px | 2px | 3px | 4px |
|---|---|---|---|---|
| clean screen grab | read | read | read | read |
| window scaled to 50% | — | read | read | read |
| window scaled to 33% | — | — | — | read |
| soft focus | — | — | read | read |
| phone: noise and warm cast | read | read | read | read |
| phone: tilted | — | read | read | read |
| phone: tilted, blurred, noisy | — | — | — | read |

**Four pixels per module survives everything in the suite.** That is the number the About dialog has
to draw to, and it is the number to argue with when someone wants the code smaller.

These are synthetic degradations, not a camera. They are a floor on what will work, not a
substitute for pointing a phone at a monitor.

## Fixtures

`pnpm fixtures` writes the frames to `fixtures/` as PNGs with their ground truth on stdout —
generated, gitignored, regenerate rather than commit. The eggs in them are drawn by this package
rather than by The Sims, because the game does not have eggs yet. When it does, these stay useful as
the controlled half of the test set: a real capture tells you whether it works, a synthetic frame
tells you which pixel broke it.

## Not here yet

The egg reader. `scan.ts` returns an empty `eggs` array rather than omitting the field, so callers
can be written once. The format side is done and tested — palette separation, check digit,
truncation to a legal prefix — and the stages the reader will use are specified in `RECOGNIZER.yml`.

Lossy encoding in the abuse suite. Doing it honestly means a DCT and a quantisation table, and
approximating JPEG with blur plus noise would let us claim a pass we had not earned.
