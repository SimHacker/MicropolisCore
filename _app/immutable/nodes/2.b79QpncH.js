var H=Object.defineProperty;var C=(r,s,e)=>s in r?H(r,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[s]=e;var a=(r,s,e)=>(C(r,typeof s!="symbol"?s+"":s,e),e);import{l as Y,p as M,u as $,n as P,j as S,f as z,a as W,e as _,g as L,b as D,i as y,h as N,$ as O}from"../chunks/disclose-version.PTWSzQB1.js";import{p as G,a as X}from"../chunks/runtime.DsRB8KFS.js";const k=!0,ot=Object.freeze(Object.defineProperty({__proto__:null,prerender:k},Symbol.toStringTag,{value:"Module"})),j=""+new URL("../assets/tiles.CXP0i5T3.png",import.meta.url).href;class V{constructor(){a(this,"canvas");a(this,"context");a(this,"mapData");a(this,"mapWidth",0);a(this,"mapHeight",0);a(this,"tileWidth",0);a(this,"tileHeight",0);a(this,"panX",0);a(this,"panY",0);a(this,"viewWidth",0);a(this,"viewHeight",0);a(this,"zoom",1);this.canvas=void 0,this.context=void 0,this.mapData=[],this.mapWidth=0,this.mapHeight=0,this.tileWidth=0,this.tileHeight=0,this.viewWidth=0,this.viewHeight=0}initialize(s,e,n,t,i,o,l,c){return this.canvas=s,this.context=e,this.mapData=n,this.mapWidth=t,this.mapHeight=i,this.tileWidth=o,this.tileHeight=l,Promise.resolve()}handleDrag(s,e){this.panX+=s,this.panY+=e}handleZoom(s,e,n){this.zoom*=s,this.panX=(this.panX-e)*s+e,this.panY=(this.panY-n)*s+n}updateScreenSize(s,e){this.viewWidth=s,this.viewHeight=e}}class K extends V{constructor(){super();a(this,"tileImage",null)}initialize(e,n,t,i,o,l,c,h){return super.initialize(e,n,t,i,o,l,c,h).then(()=>(this.context=n,this.tileImage=new Image,this.tileImage.src=h,new Promise((f,m)=>{if(!this.context||!this.tileImage)throw new Error("Canvas context or tile image is not properly initialized.");this.tileImage.onload=()=>f(),this.tileImage.onerror=()=>m(new Error(`Failed to load image at ${h}`))})))}render(){if(!this.canvas||!this.context||!this.tileImage)throw new Error("Canvas canvas, context, or tile image is not properly initialized.");this.updateScreenSize(this.canvas.width,this.canvas.height),this.context.fillStyle="#000000",this.context.fillRect(0,0,this.context.canvas.width,this.context.canvas.height);const e=this.context.canvas.width,n=this.context.canvas.height,t=e/2,i=n/2;this.tileWidth*this.zoom,this.tileHeight*this.zoom;const o=Math.max(0,Math.floor(this.panX/this.zoom)),l=Math.max(0,Math.floor(this.panY/this.zoom)),c=this.mapWidth,h=this.mapHeight;for(let f=l;f<h;f++)for(let m=o;m<c;m++){const w=this.mapData[f*this.mapWidth+m],R=t+(m-this.panX)*this.tileWidth*this.zoom,x=i+(f-this.panY)*this.tileHeight*this.zoom,d=this.tileImage.width/this.tileWidth,u=w%d*this.tileWidth,T=Math.floor(w/d)*this.tileHeight;this.context.drawImage(this.tileImage,u,T,this.tileWidth,this.tileHeight,R,x,this.tileWidth*this.zoom,this.tileHeight*this.zoom)}}}class Q extends V{constructor(){super();a(this,"tilesTexture",null);a(this,"mapTexture",null);a(this,"tilesWidth",0);a(this,"tilesHeight",0);a(this,"tileProgramInfo",null);a(this,"tileBufferInfo",null);a(this,"screenTileArray",new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]))}initialize(e,n,t,i,o,l,c,h){return super.initialize(e,n,t,i,o,l,c,h).then(()=>(this.context=n,this.tileProgramInfo=this.createShaderProgram(),this.tileBufferInfo=this.createBuffers(),this.mapTexture=this.createMapTexture(t,i,o),this.loadTexture(h))).then(()=>{}).catch(f=>{throw f})}createMapTexture(e,n,t){if(!this.context)return console.error("GL context is not initialized."),null;const i=this.context.createTexture();return this.context.bindTexture(this.context.TEXTURE_2D,i),this.context.texImage2D(this.context.TEXTURE_2D,0,this.context.RGBA32UI,n,t,0,this.context.RGBA_INTEGER,this.context.UNSIGNED_INT,new Uint32Array(e)),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_S,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_T,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_MIN_FILTER,this.context.NEAREST),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_MAG_FILTER,this.context.NEAREST),i}loadTexture(e){return new Promise((n,t)=>{if(!this.context){t(new Error("GL context is not initialized."));return}const i=this.context.createTexture();this.tilesTexture=i,this.context.bindTexture(this.context.TEXTURE_2D,i),this.context.texImage2D(this.context.TEXTURE_2D,0,this.context.RGBA,1,1,0,this.context.RGBA,this.context.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));const o=new Image;o.onload=()=>{if(!this.context){t(new Error("GL context is not initialized."));return}this.tilesWidth=o.width,this.tilesHeight=o.height,this.context.bindTexture(this.context.TEXTURE_2D,i),this.context.texImage2D(this.context.TEXTURE_2D,0,this.context.RGBA,this.context.RGBA,this.context.UNSIGNED_BYTE,o),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_S,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_WRAP_T,this.context.CLAMP_TO_EDGE),this.context.texParameteri(this.context.TEXTURE_2D,this.context.TEXTURE_MIN_FILTER,this.context.LINEAR),n()},o.onerror=()=>{t(new Error(`Failed to load texture at ${e}`))},o.src=e})}createShaderProgram(){if(!this.context)throw new Error("The WebGL context is not initialized.");const t=this.compileShaders(`#version 300 es
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
`);if(!t)throw new Error("Unable to create shader program");const i={position:this.context.getAttribLocation(t,"a_position"),screenTile:this.context.getAttribLocation(t,"a_screenTile")},o={tileSize:this.context.getUniformLocation(t,"u_tileSize"),tilesSize:this.context.getUniformLocation(t,"u_tilesSize"),tiles:this.context.getUniformLocation(t,"u_tiles"),mapSize:this.context.getUniformLocation(t,"u_mapSize"),map:this.context.getUniformLocation(t,"u_map")};for(const[l,c]of Object.entries(i))if(c===-1)throw new Error(`Shader attribute location not found: ${l}`);for(const[l,c]of Object.entries(o))if(c===null)throw new Error(`Shader uniform location not found: ${l}`);return{program:t,attributeLocations:i,uniformLocations:o}}compileShaders(e,n){if(!this.context)throw new Error("The WebGL context is not initialized.");const t=this.loadShader(this.context.VERTEX_SHADER,e),i=this.loadShader(this.context.FRAGMENT_SHADER,n),o=this.context.createProgram();if(!o)throw new Error("Unable to create shader program");if(this.context.attachShader(o,t),this.context.attachShader(o,i),this.context.linkProgram(o),!this.context.getProgramParameter(o,this.context.LINK_STATUS)){const l=this.context.getProgramInfoLog(o);throw this.context.deleteProgram(o),new Error("Failed to link shader program: "+l)}return o}loadShader(e,n){if(!this.context)throw new Error("The WebGL context is not initialized.");const t=this.context.createShader(e);if(!t)throw new Error("Unable to create shader.");if(this.context.shaderSource(t,n),this.context.compileShader(t),!this.context.getShaderParameter(t,this.context.COMPILE_STATUS)){const i=this.context.getShaderInfoLog(t);throw this.context.deleteShader(t),new Error("An error occurred compiling the shaders: "+i)}return t}createBuffers(){if(!this.context)throw new Error("The WebGL context is not initialized.");const e=this.context.createBuffer();this.context.bindBuffer(this.context.ARRAY_BUFFER,e);const n=[-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0];this.context.bufferData(this.context.ARRAY_BUFFER,new Float32Array(n),this.context.STATIC_DRAW);const t=this.context.createBuffer(),i=this.context.createBuffer();this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER,i);const o=[0,1,2,2,1,3];return this.context.bufferData(this.context.ELEMENT_ARRAY_BUFFER,new Uint16Array(o),this.context.STATIC_DRAW),{position:e,screenTile:t,indices:i}}updateScreenTileArray(){if(!this.context||!this.tileBufferInfo)throw new Error("The WebGL context is not initialized.");const e=this.panX,n=this.panX+this.viewWidth/this.zoom,t=this.panY,i=this.panY+this.viewHeight/this.zoom;this.screenTileArray.set([e,i,n,i,e,t,e,t,n,i,n,t]),this.context.bindBuffer(this.context.ARRAY_BUFFER,this.tileBufferInfo.screenTile),this.context.bufferData(this.context.ARRAY_BUFFER,this.screenTileArray,this.context.DYNAMIC_DRAW)}render(){if(!this.canvas||!this.context||!this.tileProgramInfo||!this.tileBufferInfo||!this.tilesTexture)throw new Error("The canvas, WebGL context, shaders, or textures are not properly initialized.");this.updateScreenSize(this.canvas.width,this.canvas.height),this.context.viewport(0,0,this.context.drawingBufferWidth,this.context.drawingBufferHeight),this.context.clearColor(0,0,0,1),this.context.clearDepth(1),this.context.enable(this.context.DEPTH_TEST),this.context.depthFunc(this.context.LEQUAL),this.context.clear(this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT),this.context.useProgram(this.tileProgramInfo.program),this.context.uniform2f(this.tileProgramInfo.uniformLocations.tileSize,this.tileWidth,this.tileHeight),this.context.uniform2f(this.tileProgramInfo.uniformLocations.tilesSize,this.tilesWidth,this.tilesHeight),this.context.activeTexture(this.context.TEXTURE0),this.context.bindTexture(this.context.TEXTURE_2D,this.tilesTexture),this.context.uniform1i(this.tileProgramInfo.uniformLocations.tiles,0),this.context.activeTexture(this.context.TEXTURE1),this.context.bindTexture(this.context.TEXTURE_2D,this.mapTexture),this.context.uniform1i(this.tileProgramInfo.uniformLocations.map,1),this.context.uniform2f(this.tileProgramInfo.uniformLocations.mapSize,this.mapWidth,this.mapHeight),this.context.bindBuffer(this.context.ARRAY_BUFFER,this.tileBufferInfo.position),this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.position,3,this.context.FLOAT,!1,0,0),this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.position),this.updateScreenTileArray(),this.context.bindBuffer(this.context.ARRAY_BUFFER,this.tileBufferInfo.screenTile),this.context.vertexAttribPointer(this.tileProgramInfo.attributeLocations.screenTile,2,this.context.FLOAT,!1,0,0),this.context.enableVertexAttribArray(this.tileProgramInfo.attributeLocations.screenTile),this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER,this.tileBufferInfo.indices),this.context.viewport(0,0,this.context.canvas.width,this.context.canvas.height),this.context.drawElements(this.context.TRIANGLES,6,this.context.UNSIGNED_SHORT,0)}}function U(r){console.log("TileView: onmousedown: event:",r,"target:",r.target)}function b(r){console.log("TileView: onmouseup: event:",r,"target:",r.target)}function B(r){console.log("TileView: onmousemove: event:",r,"target:",r.target)}var Z=D('<div><canvas class="svelte-mnct6x"></canvas> <br> <canvas class="svelte-mnct6x"></canvas></div>');function q(r,s){X(s,!0),M(s,"name",3,"Tile View");let e=16,n=16,t=960,i=256,o=960,l=j,c=256,h=256,f=c*h,m=Array.from({length:f},()=>Math.floor(Math.random()*t)),w=512,R=512,x=null,d=null,u=null,T=null,g=null,E=null;$(()=>{if(console.log("TileView: $effect: ","tileWidth:",e,"tileHeight:",n,"tileCount:",t,"tileTextureWidth:",i,"tileTextureHeight:",o,"tileTexture:",l,"mapWidth:",c,"mapHeight:",h,"mapLength:",f,"mapData:",m),console.log("TileView: $effect:","canvas2D:",x),x==null){console.log("TileView: $effect: canvas2D is null!");return}if(d=x.getContext("2d"),console.log("TileView: $effect:","ctx2D:",d),d==null){console.log("TileView: $effect: no ctx!");return}if(u=new K,console.log("TileView: $effect: canvasTileRenderer:",u),u==null){console.log("TileView: $effect: no canvasTileRenderer!");return}if(console.log("TileView: $effect: initialize:","canvas2D:",x,"ctx2D:",d,"canvasTileRenderer:",u),u.initialize(x,d,m,c,h,e,n,l).then(()=>{if(console.log("TileView: $effect: initialize: then:","canvas2D:",x,"ctx2D:",d,"canvasTileRenderer:",u),x==null){console.log("TileView: $effect: initialize: then: no canvas2D!");return}if(d==null){console.log("TileView: $effect: initialize: then: no ctx2D!");return}if(u==null){console.log("TileView: $effect: initialize: then: no canvasTileRenderer!");return}u.updateScreenSize(x.width,x.height),u.panX=c/2,u.panY=h/2,u.render()}),console.log("TileView: $effect:","canvasGL:",T),T==null){console.log("TileView: $effect: canvasGL is null!");return}if(g=T.getContext("webgl2"),console.log("TileView: $effect:","ctxGL:",g),g==null){console.log("TileView: $effect: no ctxGL!");return}if(E=new Q,console.log("TileView: $effect: glTileRenderer:",E),u==null){console.log("TileView: $effect: no glTileRenderer!");return}return console.log("TileView: $effect: initialize:","canvasGL:",T,"ctxGL:",g,"glTileRenderer:",E),E.initialize(T,g,m,c,h,e,n,l).then(()=>{if(console.log("TileView: $effect: initialize: then:","canvasGL:",T,"ctxGL:",g,"glTileRenderer:",E),T==null){console.log("TileView: $effect: initialize: then: no canvasGL!");return}if(g==null){console.log("TileView: $effect: initialize: then: no ctxGL!");return}if(E==null){console.log("TileView: $effect: initialize: then: no glTileRenderer!");return}}),()=>{console.log("TileView: $effect: clean up")}});var I=L(r,!0,Z),p=W(I);P(p,A=>x=A,x),S(p,"width",w),S(p,"height",R);var F=_(_(p,!0)),v=_(_(F,!0));P(v,A=>T=A,T),S(v,"width",w),S(v,"height",R),p.__mousedown=[U],p.__mousemove=[B],p.__mouseup=[b],v.__mousedown=[U],v.__mousemove=[B],v.__mouseup=[b],z(r,I),G()}Y(["mousedown","mousemove","mouseup"]);var J=D('<meta name="description" content="Micropolis Home">'),tt=D('<section class="svelte-5p4ri1"><h1 class="svelte-5p4ri1">Canvas and WebGL Tile View Test:</h1> <!></section>');function st(r,s){X(s,!1),y();var e=L(r,!0,tt);N(i=>{var o=L(i,!0,J);O.title="Micropolis Home",z(i,o)});var n=W(e),t=_(_(n,!0));q(t,{}),z(r,e),G()}export{st as component,ot as universal};
