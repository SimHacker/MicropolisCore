# @micropolis/render-core

Shared **viewport**, **holodeck plugins**, **render schemas**, and **WebGPU compositor shell** for vitamoo and micropolis.

- **Browser composes** on the client GPU (`HolodeckStage`); server ships `RenderDescription` JSON only.
- **WebGPU-native** holodeck API — no WebGL-shaped wrapper on the compositor.
- **Scaffolds** (WebGL/Canvas/software map raster) stay in `@micropolis/tile-renderer`.

See [documentation/designs/render-core-package.md](../../documentation/designs/render-core-package.md).

```typescript
import { HolodeckStage, HolodeckLayer, MapViewport } from '@micropolis/render-core';

const stage = await HolodeckStage.create(canvas);
stage.addPlugin(myMapPlugin);
stage.render();
```
