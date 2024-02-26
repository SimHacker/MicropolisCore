var P=Object.defineProperty;var b=(c,r,e)=>r in c?P(c,r,{enumerable:!0,configurable:!0,writable:!0,value:e}):c[r]=e;var a=(c,r,e)=>(b(c,typeof r!="symbol"?r+"":r,e),e);import{i as D,h as L,j as p,f as _,g as R,$ as M,b as S,m as v,e as g,a as W}from"../chunks/disclose-version.DMY_hBnz.js";import{p as B,a as X,g as x,s as w}from"../chunks/runtime.CdZnOCbx.js";import{o as F}from"../chunks/main-client.sAjnxwfy.js";const C=!0,j=Object.freeze(Object.defineProperty({__proto__:null,prerender:C},Symbol.toStringTag,{value:"Module"})),H=""+new URL("../assets/tiles.CXP0i5T3.png",import.meta.url).href;class A{constructor(){a(this,"context");a(this,"mapData");a(this,"mapWidth",0);a(this,"mapHeight",0);a(this,"tileWidth",0);a(this,"tileHeight",0);a(this,"panX",0);a(this,"panY",0);a(this,"viewWidth",0);a(this,"viewHeight",0);a(this,"zoom",1);this.context=void 0,this.mapData=[],this.mapWidth=0,this.mapHeight=0,this.tileWidth=0,this.tileHeight=0,this.viewWidth=0,this.viewHeight=0}initialize(r,e,o,t,i,n,s){return this.context=r,this.mapData=e,this.mapWidth=o,this.mapHeight=t,this.tileWidth=i,this.tileHeight=n,Promise.resolve()}handleDrag(r,e){this.panX+=r,this.panY+=e}handleZoom(r,e,o){this.zoom*=r,this.panX=(this.panX-e)*r+e,this.panY=(this.panY-o)*r+o}updateScreenSize(r,e){this.viewWidth=r,this.viewHeight=e}}class G extends A{constructor(){super();a(this,"tileImage",null)}initialize(e,o,t,i,n,s,h){return super.initialize(e,o,t,i,n,s,h).then(()=>(this.context=e,this.tileImage=new Image,this.tileImage.src=h,new Promise((u,T)=>{if(!this.context||!this.tileImage)throw new Error("Canvas context or tile image is not properly initialized.");this.tileImage.onload=()=>u(),this.tileImage.onerror=()=>T(new Error(`Failed to load image at ${h}`))})))}render(){if(!this.context||!this.tileImage)throw new Error("Canvas context or tile image is not properly initialized.");this.context.clearRect(0,0,this.context.canvas.width,this.context.canvas.height);const e=Math.max(0,Math.floor(this.panX/this.zoom)),o=Math.max(0,Math.floor(this.panY/this.zoom)),t=Math.min(this.mapWidth,Math.ceil((this.panX+this.viewWidth/this.zoom)/this.tileWidth)),i=Math.min(this.mapHeight,Math.ceil((this.panY+this.viewHeight/this.zoom)/this.tileHeight));for(let n=o;n<i;n++)for(let s=e;s<t;s++){const h=this.mapData[n*this.mapWidth+s],u=(s*this.tileWidth-this.panX)*this.zoom,T=(n*this.tileHeight-this.panY)*this.zoom,f=h%(this.tileImage.width/this.tileWidth)*this.tileWidth,m=Math.floor(h/(this.tileImage.width/this.tileWidth))*this.tileHeight;this.context.drawImage(this.tileImage,f,m,this.tileWidth,this.tileHeight,u,T,this.tileWidth*this.zoom,this.tileHeight*this.zoom)}}}class Y extends A{constructor(){super();a(this,"tilesTexture",null);a(this,"mapTexture",null);a(this,"tilesWidth",0);a(this,"tilesHeight",0);a(this,"tileProgramInfo",null);a(this,"tileBufferInfo",null);a(this,"screenTileArray",new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]))}initialize(e,o,t,i,n,s,h){return super.initialize(e,o,t,i,n,s,h).then(()=>(this.context=e,this.context.viewport(0,0,this.context.drawingBufferWidth,this.context.drawingBufferHeight),this.tileProgramInfo=this.createShaderProgram(),this.tileBufferInfo=this.createBuffers(),this.mapTexture=this.createMapTexture(o,t,i),this.loadTexture(h))).then(()=>{}).catch(u=>{throw u})}createMapTexture(e,o,t){if(!this.context)return console.error("GL context is not initialized."),null;const i=this.context.createTexture();return this.context.bindTexture(this.context.TEXTURE_2D,i),this.context.texImage2D(this.context.TEXTURE_2D,0,this.context.RGBA32UI,o,t,0,this.context.RGBA_INTEGER,this.context.UNSIGNED_INT,new Uint32Array(e)),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_S,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_T,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_MIN_FILTER,this.context.NEAREST),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_MAG_FILTER,this.context.NEAREST),i}loadTexture(e){return new Promise((o,t)=>{if(!this.context){t(new Error("GL context is not initialized."));return}const i=this.context.createTexture();this.tilesTexture=i,this.context.bindTexture(this.context.TEXTURE_2D,i),this.context.texImage2D(this.context.TEXTURE_2D,0,this.context.RGBA,1,1,0,this.context.RGBA,this.context.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));const n=new Image;n.onload=()=>{if(!this.context){t(new Error("GL context is not initialized."));return}this.tilesWidth=n.width,this.tilesHeight=n.height,this.context.bindTexture(this.context.TEXTURE_2D,i),this.context.texImage2D(this.context.TEXTURE_2D,0,this.context.RGBA,this.context.RGBA,this.context.UNSIGNED_BYTE,n),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_S,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_T,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_MIN_FILTER,this.context.LINEAR),o()},n.onerror=()=>{t(new Error(`Failed to load texture at ${e}`))},n.src=e})}createShaderProgram(){if(!this.context)throw new Error("The WebGL context is not initialized.");const t=this.compileShaders(`#version 300 es
precision mediump float;
in vec3 a_position;
in vec2 a_screenTile;
out vec2 v_screenTile;

void main() {

    gl_Position = vec4(a_position, 1.0);
    v_screenTile = a_screenTile;

}
`,`#version 300 es
precision mediump float;
precision highp usampler2D;
uniform vec2 u_tileSize; // 16 16
uniform vec2 u_tilesSize; // 256 960
uniform sampler2D u_tiles;
uniform vec2 u_mapSize; // 256 256
uniform usampler2D u_map;
in vec2 v_screenTile; // 
out vec4 fragColor;

void main() {

    // Calculate the screen tile coordinate.
    vec2 screenTileColRow = floor(v_screenTile);
    vec2 screenTilePosition = v_screenTile - screenTileColRow;

    vec2 cellColRow = mod(screenTileColRow, u_mapSize);
    vec2 cellUV = cellColRow / u_mapSize;

    // Extract data from the 32-bit unsigned integer texture
    uvec4 cellData = texture(u_map, cellUV);
    uint cellValue = cellData.r & 0xFFFFu; // Use lower 16 bits of the red channel
    float cell = float(cellValue);

    // Calculate the tile row and column from the cell value.
    float tileRow = floor(cell * u_tileSize.x / u_tilesSize.x);
    float tileCol = cell - (tileRow * u_tileSize.y / u_tilesSize.y);

    // Calculate which pixel of the tile to sample.
    vec2 tileCorner = vec2(tileCol, tileRow) * u_tileSize;
    vec2 tilePixel = tileCorner + (screenTilePosition * u_tileSize);
    vec2 uv = tilePixel / u_tilesSize;

    // Sample the tile.
    fragColor = texture(u_tiles, uv);

}
`);if(!t)throw new Error("Unable to create shader program");const i={position:this.context.getAttribLocation(t,"a_position"),screenTile:this.context.getAttribLocation(t,"a_screenTile")},n={tileSize:this.context.getUniformLocation(t,"u_tileSize"),tilesSize:this.context.getUniformLocation(t,"u_tilesSize"),tiles:this.context.getUniformLocation(t,"u_tiles"),mapSize:this.context.getUniformLocation(t,"u_mapSize"),map:this.context.getUniformLocation(t,"u_map")};for(const[s,h]of Object.entries(i))if(h===-1)throw new Error(`Shader attribute location not found: ${s}`);for(const[s,h]of Object.entries(n))if(h===null)throw new Error(`Shader uniform location not found: ${s}`);return{program:t,attributeLocations:i,uniformLocations:n}}compileShaders(e,o){if(!this.context)throw new Error("The WebGL context is not initialized.");const t=this.loadShader(this.context.VERTEX_SHADER,e),i=this.loadShader(this.context.FRAGMENT_SHADER,o),n=this.context.createProgram();if(!n)throw new Error("Unable to create shader program");if(this.context.attachShader(n,t),this.context.attachShader(n,i),this.context.linkProgram(n),!this.context.getProgramParameter(n,this.context.LINK_STATUS)){const s=this.context.getProgramInfoLog(n);throw this.context.deleteProgram(n),new Error("Failed to link shader program: "+s)}return n}loadShader(e,o){if(!this.context)throw new Error("The WebGL context is not initialized.");const t=this.context.createShader(e);if(!t)throw new Error("Unable to create shader.");if(this.context.shaderSource(t,o),this.context.compileShader(t),!this.context.getShaderParameter(t,this.context.COMPILE_STATUS)){const i=this.context.getShaderInfoLog(t);throw this.context.deleteShader(t),new Error("An error occurred compiling the shaders: "+i)}return t}createBuffers(){if(!this.context)throw new Error("The WebGL context is not initialized.");const e=this.context.createBuffer();this.context.bindBuffer(this.context.ARRAY_BUFFER,e);const o=[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0];this.context.bufferData(this.context.ARRAY_BUFFER,new Float32Array(o),this.context.STATIC_DRAW);const t=this.context.createBuffer(),i=this.context.createBuffer();this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER,i);const n=[0,1,2,2,1,3];return this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER,new Uint16Array(n),this.context.STATIC_DRAW),{position:e,screenTile:t,indices:i}}updateScreenTileArray(){if(!this.context||!this.tileBufferInfo)throw new Error("The WebGL context is not initialized.");const e=this.panX,o=this.panX+this.viewWidth/this.zoom,t=this.panY,i=this.panY+this.viewHeight/this.zoom;this.screenTileArray.set([e,i,o,i,e,t,e,t,o,i,o,t]),this.context.bindBuffer(this.context.ARRAY_BUFFER,this.tileBufferInfo.screenTile),this.context.bufferData(this.context.ARRAY_BUFFER,this.screenTileArray,this.context.DYNAMIC_DRAW)}render(){if(!this.context||!this.tileProgramInfo||!this.tileBufferInfo||!this.tilesTexture)throw new Error("The WebGL context, shaders, or textures are not properly initialized.");this.context.clearColor(0,0,0,1),this.context.clearDepth(1),this.context.enable(this.context.DEPTH_TEST),this.context.depthFunc(this.context.LEQUAL),this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT),this.context.useProgram(this.tileProgramInfo.program),this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileSize,this.tileWidth,this.tileHeight),this.context.uniform2f(this.tileProgramInfo.uniformLocations.tilesSize,this.tilesWidth,this.tilesHeight),this.context.activeTexture(this.context.TEXTURE0),this.context.bindTexture(this.context.TEXTURE_2D,this.tilesTexture),this.context.uniform1i(this.tileProgramInfo.uniformLocations.tiles,0),this.context.activeTexture(this.context.TEXTURE1),this.context.bindTexture(this.context.TEXTURE_2D,this.mapTexture),this.context.uniform1i(this.tileProgramInfo.uniformLocations.map,1),this.context.uniform2f(this.tileProgramInfo.uniformLocations.mapSize,this.mapWidth,this.mapHeight),this.context.bindBuffer(this.context.ARRAY_BUFFER,this.tileBufferInfo.position),this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.position,3,this.context.FLOAT,!1,0,0),this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.position),this.updateScreenTileArray(),this.context.bindBuffer(this.context.ARRAY_BUFFER,this.tileBufferInfo.screenTile),this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.screenTile,2,this.context.FLOAT,!1,0,0),this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.screenTile),this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER,this.tileBufferInfo.indices),this.context.viewport(0,0,this.context.canvas.width,this.context.canvas.height),this.context.drawElements(this.context.TRIANGLES,6,this.context.UNSIGNED_SHORT,0)}}var y=S('<meta name="description" content="Micropolis Home">'),N=S('<section class="svelte-n3hpwt"><h3>CanvasTileRenderer:</h3> <canvas width="512" height="512"></canvas> <h3>GLTileRenderer:</h3> <canvas width="512" height="512"></canvas></section>');function K(c,r){X(r,!1);let e=v(null),o=v(null),t=null,i=null;const n=256,s=256,h=16,u=16,T=H,f=Array.from({length:n*s},()=>Math.floor(Math.random()*256));F(()=>{if(console.log("TileEngine Test: onMount:","canvasTileRenderer_canvas:",x(e)),x(e)==null){console.log("TileEngine Test: onMount: canvasTileRenderer_canvas is null!");return}if(x(o)==null){console.log("TileEngine Test: onMount: glTileRenderer_canvas is null!");return}const l=x(e).getContext("2d");if(console.log("TileEngine Test: onMount:","canvasTileRenderer_context:",l),l==null){console.log("TileEngine Test: onMount: no canvasTileRenderer_context!");return}if(t=new G,console.log("TileEngine Test: onMount: canvasTileRenderer:",t),t==null){console.log("TileEngine Test: onMount: no canvasTileRenderer!");return}console.log("TileEngine Test: onMount: initialize:","canvasTileRenderer_context:",l,"mapData:",f,"mapWidth:",n,"mapHeight:",s,"tileWidth:",h,"tileWidth:",u,"tileTexture:",T),t.initialize(l,f,n,s,h,u,T).then(()=>{if(console.log("TileEngine Test: onMount: initialize: then:","canvasTileRenderer_context:",l,"canvasTileRenderer:",t),t==null){console.log("TileEngine Test: onMount: initialize: then: no canvasTileRenderer!");return}if(x(e)==null){console.log("TileEngine Test: onMount: initialize: then: no glTileRenderer_canvas!");return}t.updateScreenSize(x(e).width,x(e).height),t.render()});const d=x(o).getContext("webgl2");if(console.log("TileEngine Test: onMount:","glTileRenderer_context:",d),d==null){console.log("TileEngine Test: onMount: no glTileRenderer_context!");return}if(i=new Y,console.log("TileEngine Test: onMount: glTileRenderer:",i),t==null){console.log("TileEngine Test: onMount: no glTileRenderer!");return}console.log("TileEngine Test: onMount: initialize:","glTileRenderer_context:",d,"mapData:",f,"mapWidth:",n,"mapHeight:",s,"tileWidth:",h,"tileWidth:",u,"tileTexture:",T),i.initialize(d,f,n,s,h,u,T).then(()=>{if(console.log("TileEngine Test: onMount: initialize: then:","glTileRenderer_context:",d,"glTileRenderer:",i),i==null){console.log("TileEngine Test: onMount: initialize: then: no glTileRenderer!");return}if(x(o)==null){console.log("TileEngine Test: onMount: initialize: then: no glTileRenderer_canvas!");return}i.updateScreenSize(x(o).width,x(o).height),i.render()})}),D();var m=R(c,!0,N);L(l=>{var d=R(l,!0,y);M.title="Micropolis Home",_(l,d)});var z=W(m),E=g(g(z,!0));p(E,l=>w(e,l),e);var I=g(g(E,!0)),U=g(g(I,!0));p(U,l=>w(o,l),o),_(c,m),B()}export{K as component,j as universal};