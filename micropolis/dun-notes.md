
micropolis/src/lib/TileView.svelte
-  webgpu / opengl fallback
    if webgpu is not available, opengl is used
- support of tileSets and tileLayers
    - tileLayer = Tile Image file
    - a tileLayer can contain several tileSets 
    - mopData = tileset to use for given cell why ? in /src/lib/MicropolisSimulator.ts, all cells have same tileset
        - In the meantime, quick implementation tilSet passed to uniforms with mopData[0] value
- support of space / rotate


- implement for gpu ctxGL.viewport(0, 0, canvasGL.width, canvasGL.height); ??