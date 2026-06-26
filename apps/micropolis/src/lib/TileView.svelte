<script lang="ts">

  // TODO(virtual-cursor): route this map's pan/zoom/rotate through MapGestureController,
  //   a CONSUMER of the virtual cursor layer.
  //   DESIGN: documentation/designs/virtual-cursor-layer.md §4,§5,§6,§9
  //   import { MapGestureController } from '$lib/input/MapGestureController';
  //   onMount: const map = new MapGestureController();
  //            const detach = map.attach(canvasGL!);   // pointer/touch/wheel
  //            map.onChange(cam => { /* drive tileRenderer pan/scale/rotation */ });
  //   Replaces the ad-hoc `panning` drag below with: reversible edge-autoscroll (§4),
  //   inertial "throw" + immediate brake-to-catch (§5), and seamless multitouch
  //   pan/zoom/rotate pivot with finger add/remove handoff (§6).

  import { onMount, onDestroy } from 'svelte';
  import {
    createMapTileRenderer,
    type MapTileRendererBackend,
    type TileRenderer,
  } from '@micropolis/tile-renderer';
  import { MicropolisSimulator } from '$lib/MicropolisSimulator';
  import { commandBus, shortcutFromKeyboardEvent } from '$lib/CommandBus';
  import { commandRecorder } from '$lib/CommandRecorder';
  import { registerMicropolisCommands, type MicropolisCommandContext } from '$lib/micropolisCommands';
  import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
  import { toolState } from '$lib/ToolState.svelte';
  import { resolveEditingTool, toolCursor, TOOL_BY_SHORTCUT } from '$lib/gameTools';
  import {
    syncViewportScreenScale,
    panToKeepWorldAtScreen,
    cssPixelsPerTile,
  } from '$lib/input/viewportSync';
  import {
    DEFAULT_KEY_PAN_RAMP,
    keyPanScreenDeltaCombined,
    type KeyPanDirection,
    type KeyPanRampPolicy,
  } from '$lib/input/keyPanRamp';

  /** Tweak arrow-key scroll ramp (full speed, ramp duration, curve). */
  const KEY_PAN_RAMP: KeyPanRampPolicy = { ...DEFAULT_KEY_PAN_RAMP };

  // Tile Sets
  import tileLayer_all10 from '$lib/images/tilesets/all.png';

  const tileLayers = [
    tileLayer_all10,
  ];

  const tileWidth = 16;
  const tileHeight = 16;
  const tileCount = 960;
  let tileSetCount = 10;
  let tileSet: number = 0;

  let canvasGL: HTMLCanvasElement | null = null;
  let ctxGL: WebGL2RenderingContext | null = null;
  let rendererBackend: MapTileRendererBackend | null = null;
  let tileRenderer: TileRenderer<unknown> | null = null;
  let initialized = false;
  /** True only after tileRenderer.initialize() finishes (atlas loaded). */
  let renderReady = false;

  let panning = $state(false);
  let panButton = $state<number | null>(null);
  let panGrabWorld: [number, number] | null = null;
  let toolDragging = false;
  // Future drawing autoscroll should be time-driven/world-tile based; pan autoscroll runs the opposite direction.
  let lastAppliedToolTile: [number, number] | null = null;
  let shiftPanHeld = $state(false);
  let screenPos: [number, number] = [0, 0];
  let tilePos: [number, number] = [0, 0];
  let screenPosLast: [number, number] = [0, 0];
  let tilePosLast: [number, number] = [0, 0];
  let screenPosDown: [number, number] = [0, 0];
  let tilePosDown: [number, number] = [0, 0];
  let panDown: [number, number] = [0, 0];
  let initialTouchX: number = 0;
  let initialTouchY: number = 0;
  let leftKeyDown = false;
  let rightKeyDown = false;
  let upKeyDown = false;
  let downKeyDown = false;
  let inKeyDown = false;
  let outKeyDown = false;
  let keyZoomScale = 0.025;
  let wheelZoomScale = 0.05;

  let autoRepeatIntervalId: ReturnType<typeof setInterval> | null = null;
  let autoRepeatDelay = 1000 / 60;
  let autoRepeatKeys: string[] = [];

  let keyPanRafId: number | null = null;
  let keyPanLastTime = 0;
  const keyPanHoldStart: Partial<Record<KeyPanDirection, number>> = {};

  let heatFlowRangeLow = 4;
  let heatFlowRangeHigh = 100;

  let micropolisSimulator: MicropolisSimulator | null = null;

  let isMounted = false;
  let resizeObserver: ResizeObserver | null = null;
  let lastCameraKey = '';

  function canvasOffsetFromEvent(event: MouseEvent): [number, number] {
    if (!canvasGL) return [0, 0];
    const rect = canvasGL.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  function handlePanMouseMove(event: MouseEvent): void {
    if (!tileRenderer || !panning || !panGrabWorld) return;
    syncViewportScreenScale(tileRenderer, false);
    screenPos = canvasOffsetFromEvent(event);
    if (event.shiftKey !== shiftPanHeld) {
      shiftPanHeld = event.shiftKey;
    }
    panToKeepWorldAtScreen(tileRenderer, panGrabWorld, screenPos);
    syncCameraRevision();
    render();
  }

  function stopPan(event?: MouseEvent): void {
    if (!panning) return;
    if (event && panButton !== null && event.button !== panButton) return;
    panning = false;
    panButton = null;
    panGrabWorld = null;
    window.removeEventListener('mousemove', handlePanMouseMove);
    window.removeEventListener('mouseup', stopPan);
    render();
  }

  function startPanCapture(): void {
    window.addEventListener('mousemove', handlePanMouseMove);
    window.addEventListener('mouseup', stopPan);
  }

  function autoRepeatCommandContext(): MicropolisCommandContext {
    return {
      source: 'keyboard',
      simulator: micropolisSimulator,
      tileRenderer,
      tileLayersLength: tileLayers.length,
      heatFlowRangeLow,
      heatFlowRangeHigh,
      args: {},
    };
  }

  function keyPanActive(): boolean {
    return leftKeyDown || rightKeyDown || upKeyDown || downKeyDown;
  }

  function heldMsByDirection(now: number): Partial<Record<KeyPanDirection, number>> {
    const held: Partial<Record<KeyPanDirection, number>> = {};
    if (leftKeyDown && keyPanHoldStart.left != null) held.left = now - keyPanHoldStart.left;
    if (rightKeyDown && keyPanHoldStart.right != null) held.right = now - keyPanHoldStart.right;
    if (upKeyDown && keyPanHoldStart.up != null) held.up = now - keyPanHoldStart.up;
    if (downKeyDown && keyPanHoldStart.down != null) held.down = now - keyPanHoldStart.down;
    return held;
  }

  function applyKeyPanDelta(dtSec: number, now = performance.now()): boolean {
    if (!tileRenderer || !micropolisSimulator || dtSec <= 0) return false;
    const held = heldMsByDirection(now);
    if (Object.keys(held).length === 0) return false;

    syncViewportScreenScale(tileRenderer, false);
    const ppt = cssPixelsPerTile(tileRenderer);
    if (ppt <= 0) return false;

    const { screenDx, screenDy } = keyPanScreenDeltaCombined(held, dtSec, KEY_PAN_RAMP);
    if (screenDx === 0 && screenDy === 0) return false;

    tileRenderer.panBy(screenDx / ppt, screenDy / ppt);
    syncCameraRevision();
    render();
    return true;
  }

  function tickKeyPan(now: number): void {
    if (!keyPanActive() || !tileRenderer || !micropolisSimulator) {
      keyPanRafId = null;
      keyPanLastTime = 0;
      return;
    }

    keyPanRafId = requestAnimationFrame(tickKeyPan);

    const prev = keyPanLastTime;
    keyPanLastTime = now;
    if (prev <= 0) return;

    applyKeyPanDelta(Math.min((now - prev) / 1000, 0.05), now);
  }

  function ensureKeyPanLoop(): void {
    if (typeof window === 'undefined') return;
    if (keyPanRafId !== null) return;
    keyPanLastTime = 0;
    keyPanRafId = requestAnimationFrame(tickKeyPan);
  }

  function stopKeyPanLoop(): void {
    if (keyPanRafId !== null && typeof window !== 'undefined') {
      cancelAnimationFrame(keyPanRafId);
      keyPanRafId = null;
    }
    keyPanLastTime = 0;
  }

  function beginKeyPan(direction: KeyPanDirection): void {
    const now = performance.now();
    keyPanHoldStart[direction] = now;
    applyKeyPanDelta(1 / 60, now);
    ensureKeyPanLoop();
  }

  function endKeyPan(direction: KeyPanDirection): void {
    delete keyPanHoldStart[direction];
    if (!keyPanActive()) stopKeyPanLoop();
  }

  function startAutoRepeat(key: string): void {
    if (autoRepeatKeys.indexOf(key) < 0) {
      autoRepeatKeys.push(key);
    }
    if (autoRepeatIntervalId === null) {
      autoRepeatIntervalId = setInterval(handleAutoRepeat, autoRepeatDelay);
    }
  }

  function stopAutoRepeat(key: string | null): void {
    if (key === null) {
      autoRepeatKeys = [];
    } else if (autoRepeatKeys.indexOf(key) >= 0) {
      autoRepeatKeys.splice(autoRepeatKeys.indexOf(key), 1);
    }
    if (autoRepeatKeys.length === 0 && autoRepeatIntervalId !== null) {
      clearInterval(autoRepeatIntervalId);
      autoRepeatIntervalId = null;
    }
  }

  function handleAutoRepeat(): void {
    if (!tileRenderer || !micropolisSimulator) return;
    const ctx = autoRepeatCommandContext();
    if (inKeyDown) void commandBus.dispatch('view.zoom-in', ctx);
    if (outKeyDown) void commandBus.dispatch('view.zoom-out', ctx);
  }

  function syncCameraRevision(): void {
    const vp = tileRenderer?.viewport;
    if (!vp) return;
    const key = `${vp.panX},${vp.panY},${vp.zoom},${vp.screenWidth},${vp.screenHeight},${vp.screenZoomFactor}`;
    if (key === lastCameraKey) return;
    lastCameraKey = key;
    micropolisReactive.bumpMapCameraRevision();
  }

  registerMicropolisCommands();
  commandRecorder.attach(commandBus);

  $effect(() => {
    micropolisReactive.mapRevision;
    if (renderReady && tileRenderer) {
      render();
    }
  });

  export async function initialize(micropolisSimulator_: MicropolisSimulator): Promise<void> {
    console.log("TileView.svelte: initialize:", "micropolisSimulator:", micropolisSimulator_);
  
    micropolisSimulator = micropolisSimulator_;

    if (!micropolisSimulator || !canvasGL) return;

    // Prevent double-initialization when remounting/showing tab again
    if (initialized && tileRenderer) {
      console.log('TileView.svelte: initialize skipped (already initialized)');
      resizeCanvas();
      return;
    }

    if (canvasGL == null) {
      console.log('TileView.svelte: initialize: canvasGL is null!');
      return;
    }

    // Playable batch 1: canvas software renderer (reliable with all.png atlas).
    // WebGL opt-in via prefer: ['webgl', 'canvas'] for parity tests; holodeck is batch 2.
    const created = createMapTileRenderer(canvasGL, { prefer: ['canvas'] });
    if (created == null) {
      console.log('TileView.svelte: initialize: no supported renderer backend!');
      return;
    }

    rendererBackend = created.backend;
    ctxGL = created.webglContext;
    console.log(`TileView.svelte: using ${rendererBackend} tile renderer`);

    const eng = micropolisSimulator.micropolisengine;
    if (!eng) return;

    const renderer = created.renderer;
    await renderer.initialize(
      canvasGL,
      created.context,
      micropolisSimulator.mapData!,
      micropolisSimulator.mopData!,
      eng.WORLD_W,
      eng.WORLD_H,
      tileWidth,
      tileHeight,
      tileLayers);

    tileRenderer = renderer;
    renderReady = true;

    tileRenderer.panTo(eng.WORLD_W * 0.5, eng.WORLD_H * 0.5);
    tileRenderer.zoomTo(1.0);
    tileRenderer.tileLayer = 0;

    micropolisSimulator.fillMopTiles(tileSet);

    micropolisReactive.registerMapPan((x, y) => {
      tileRenderer?.panTo(x, y);
      render();
    });

    if (typeof window != "undefined") {
      canvasGL.addEventListener('wheel', onwheel, {passive: false});
    }

    isMounted = true;
    initialized = true;

    resizeCanvas();
    refocusCanvas();

    // Visibility-based pause/resume to avoid ticking when hidden
    if (typeof document !== 'undefined') {
      const onVis = () => {
        const hidden = document.hidden;
        if (micropolisSimulator) {
          micropolisSimulator.setPaused(hidden);
        }
        if (!hidden) requestAnimationFrame(() => { resizeCanvas(); render(); });
      };
      document.addEventListener('visibilitychange', onVis);
    }

    // Observe the canvas's PARENT element for size changes
    const parentElement = canvasGL?.parentElement;
    if (parentElement && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
        // We are only observing one element
        // const entry = entries[0];
        // console.log("ResizeObserver triggered", entry.contentRect);
        requestAnimationFrame(resizeCanvas); // Debounce slightly with rAF
      });
      resizeObserver.observe(parentElement);
      console.log("TileView.svelte: ResizeObserver attached to parent.");

      // Initial size check
       requestAnimationFrame(resizeCanvas);

    } else {
       console.warn("TileView.svelte: ResizeObserver not supported or parentElement not found. Falling back to window resize.");
       // Fallback for older browsers or if parent isn't immediately available
       if (typeof window !== 'undefined') {
           window.addEventListener('resize', handleWindowResize);
       }
       // Initial size check
       requestAnimationFrame(resizeCanvas);
    }

  }

  export function render(): void {
    if (!renderReady || !tileRenderer || !micropolisSimulator) return;
    if (!micropolisSimulator.syncMapViews()) return;
    tileRenderer.mapData = micropolisSimulator.mapData!;
    tileRenderer.mopData = micropolisSimulator.mopData!;
    try {
      tileRenderer.render();
      syncCameraRevision();
    } catch (e) {
      console.warn('TileView.svelte: render failed:', e);
    }
  }

  /** Viewport for cursor DOM frames — scale synced on read; pan bounds only on resize/zoom. */
  export function getMapViewport() {
    if (tileRenderer) syncViewportScreenScale(tileRenderer, false);
    return tileRenderer?.viewport ?? null;
  }

  // Function to resize the canvas to match the screen size.
  function resizeCanvas() {
    if (!canvasGL || !tileRenderer) {
      return;
    }

    // Get the size the browser is actually displaying the canvas element at
    const layout = canvasGL.getBoundingClientRect();
    const displayWidth = layout.width;
    const displayHeight = layout.height;

    // Check if the canvas's drawing buffer size matches the display size (scaled by DPR)
    const deviceRatio = window.devicePixelRatio || 1;
    const requiredWidth = Math.round(displayWidth * deviceRatio);
    const requiredHeight = Math.round(displayHeight * deviceRatio);

    // Only resize if needed to prevent flicker and unnecessary work
    // Or if sizes are very small, force a minimum size to prevent issues
    if (canvasGL.width !== requiredWidth || 
        canvasGL.height !== requiredHeight ||
        requiredWidth < 100 ||
        requiredHeight < 100) {
      
      // Ensure minimum reasonable size
      const finalWidth = Math.max(requiredWidth, 100);
      const finalHeight = Math.max(requiredHeight, 100);
      
      // Set the canvas drawing buffer size.
      canvasGL.width = finalWidth;
      canvasGL.height = finalHeight;

      console.log(`TileView.svelte: Resized canvas drawing buffer to ${canvasGL.width}x${canvasGL.height}`);

      if (ctxGL) {
        ctxGL.viewport(0, 0, canvasGL.width, canvasGL.height);
      }

      // Canvas 2D context is reset when the drawing buffer size changes.
      if (rendererBackend === 'canvas') {
        const ctx2d = canvasGL.getContext('2d');
        if (ctx2d) tileRenderer.context = ctx2d;
      }

      // Tell the TileRenderer the new CSS display size (use actual backing-store scale)
      const backingScale = displayWidth > 0 ? canvasGL.width / displayWidth : deviceRatio;
      tileRenderer.setScreenSize(displayWidth, displayHeight, backingScale, true);

      // Re-render the scene with the new sizes
      render();
    } else {
      // Even if buffer size is correct, CSS size might have changed, update renderer
      const backingScale = displayWidth > 0 ? canvasGL.width / displayWidth : deviceRatio;
      tileRenderer.setScreenSize(displayWidth, displayHeight, backingScale, true);
      render(); // Always render to ensure display is updated
    }
  }

  export function trackMouse(event: MouseEvent) {
    screenPosLast = screenPos;
    tilePosLast = tilePos;

    screenPos = canvasOffsetFromEvent(event);

    if (event.shiftKey !== shiftPanHeld) {
      shiftPanHeld = event.shiftKey;
    }

    if (tileRenderer != null) {
      syncViewportScreenScale(tileRenderer, false);
      tilePos = tileRenderer.viewport.screenToWorldTile(screenPos);
      toolState.setHoverTile(tilePos);
    }
  }

  function toolResultMessage(result: { value: number } | number): string | null {
    const eng = micropolisSimulator?.micropolisengine;
    if (!eng) return null;
    const v = typeof result === 'number' ? result : result.value;
    const tr = eng.ToolResult;
    if (v === tr.TOOLRESULT_NO_MONEY.value) return 'Insufficient funds';
    if (v === tr.TOOLRESULT_NEED_BULLDOZE.value) return 'Bulldoze first';
    if (v === tr.TOOLRESULT_FAILED.value) return 'Cannot build here';
    return null;
  }

  function applyToolAt(tx: number, ty: number): void {
    const eng = micropolisSimulator?.micropolisengine;
    if (!eng || !micropolisSimulator) return;

    const tileX = Math.floor(tx);
    const tileY = Math.floor(ty);
    if (lastAppliedToolTile?.[0] === tileX && lastAppliedToolTile[1] === tileY) return;
    lastAppliedToolTile = [tileX, tileY];

    const tool = resolveEditingTool(eng, toolState.activeToolId);
    const result = micropolisReactive.poke.doTool(tool, tileX, tileY);
    const feedback = toolResultMessage(result as { value: number });
    toolState.setLastToolFeedback(feedback);
    micropolisSimulator.render();
  }

  function isPanMouseButton(button: number): boolean {
    return button === 1 || button === 2;
  }

  function shouldPan(event: MouseEvent): boolean {
    return shiftPanHeld || isPanMouseButton(event.button) || (event.button === 0 && event.shiftKey);
  }

  export function onmousedown(event: MouseEvent): void {

    if (!tileRenderer) return;

    trackMouse(event);

    if (shouldPan(event)) {
      event.preventDefault();
      syncViewportScreenScale(tileRenderer, false);
      panning = true;
      panButton = event.button;
      screenPosDown = screenPos;
      panDown = [tileRenderer.panX, tileRenderer.panY];
      panGrabWorld = tileRenderer.viewport.screenToWorldTile(screenPos);
      startPanCapture();
      return;
    }

    if (event.button === 0) {
      lastAppliedToolTile = null;
      toolDragging = true;
      applyToolAt(tilePos[0], tilePos[1]);
    }
  }

  export function onmousemove(event: MouseEvent): void {

    if (!tileRenderer) return;

    trackMouse(event);

    if (panning) {
      return;
    }

    if (toolDragging && event.buttons & 1) {
      applyToolAt(tilePos[0], tilePos[1]);
    }
  }

  export function onmouseup(event: MouseEvent): void {
    if (panning) {
      stopPan(event);
    }
    if (event.button === 0) {
      toolDragging = false;
      lastAppliedToolTile = null;
    }
  }

  export function onkeydown(event: KeyboardEvent): void {
    //console.log('TileView.svelte: onkeydown: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);

    if (!micropolisSimulator || !micropolisSimulator.micropolis || !tileRenderer || !micropolisSimulator) return;

    const key = event.key;

    if (key === 'Shift') {
      shiftPanHeld = true;
    }

    if (
      key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const toolId = TOOL_BY_SHORTCUT[key.toLowerCase()];
      if (toolId) {
        toolState.setActiveTool(toolId);
        return;
      }
    }

    switch (key) {

      case " ": // space
        event.preventDefault();
        void commandBus.dispatchShortcut(shortcutFromKeyboardEvent(event), commandContext(event));
        break;

      case "ArrowLeft":
        if (!leftKeyDown) {
          leftKeyDown = true;
          beginKeyPan('left');
        }
        break;

      case "ArrowRight":
        if (!rightKeyDown) {
          rightKeyDown = true;
          beginKeyPan('right');
        }
        break;

      case "ArrowUp":
        if (!upKeyDown) {
          upKeyDown = true;
          beginKeyPan('up');
        }
        break;

      case "ArrowDown":
        if (!downKeyDown) {
          downKeyDown = true;
          beginKeyPan('down');
        }
        break;

      case ",":
        if (!inKeyDown) {
          inKeyDown = true;
          void commandBus.dispatch('view.zoom-in', autoRepeatCommandContext());
          startAutoRepeat(key);
        }
        break;

      case ".":
        if (!outKeyDown) {
          outKeyDown = true;
          void commandBus.dispatch('view.zoom-out', autoRepeatCommandContext());
          startAutoRepeat(key);
        }
        break;

      case "+":
        event.preventDefault();
        void commandBus.dispatch('tile-layer.next', commandContext(event));
        break;

      case "_":
        event.preventDefault();
        void commandBus.dispatch('tile-layer.previous', commandContext(event));
        break;

      default:
        void commandBus.dispatchShortcut(shortcutFromKeyboardEvent(event), commandContext(event));
        break;
    }
  }  

  function commandContext(event: KeyboardEvent, args: Record<string, unknown> = {}): MicropolisCommandContext {
    return {
      source: 'keyboard',
      event,
      target: event.target,
      simulator: micropolisSimulator,
      tileRenderer,
      tileLayersLength: tileLayers.length,
      heatFlowRangeLow,
      heatFlowRangeHigh,
      args,
    };
  }

  export function onkeyup(event: KeyboardEvent): void {
  //console.log('TileView.svelte: onkeyup: event:', event, 'target:', event.target, 'keyCode:', event.keyCode);
    const key = event.key;

    if (key === 'Shift') {
      shiftPanHeld = false;
    }

    switch (key) {

      case "ArrowLeft": // left
        leftKeyDown = false;
        endKeyPan('left');
        break;

      case "ArrowRight": // right 
        rightKeyDown = false;
        endKeyPan('right');
        break;

      case "ArrowDown": // down
        downKeyDown = false;
        endKeyPan('down');
        break;

      case "ArrowUp": // up
        upKeyDown = false;
        endKeyPan('up');
        break;

      case ",": // in ,
        inKeyDown = false;
        stopAutoRepeat(key);
        break;

      case ".": // out .
        outKeyDown = false;
        stopAutoRepeat(key);
        break;

    }
  }

  export function onwheel(event: WheelEvent): void {

    if (!tileRenderer || !micropolisSimulator) return;

    // Only prevent default within our canvas
    // This keeps the event from propagating to the page
    event.preventDefault();
    event.stopPropagation();
    
    const delta = event.deltaY > 0 ? -wheelZoomScale : wheelZoomScale; // Change the multiplier as needed
    const zoomFactor = 1 + delta; // Adjust the zoom factor based on the delta
    //console.log('onwheel: event:', event, 'delta:', delta, 'zoomFactor:', zoomFactor);
    
    tileRenderer.zoomBy(zoomFactor);
    
    micropolisSimulator.render();
  }

  export function setTileSet(index: number) {
    
    if (!micropolisSimulator) return;

    tileSet = index;
    micropolisSimulator.fillMopTiles(tileSet);

    micropolisSimulator.render();
  }
  
  export function setTileLayer(index: number) {
    if (!tileRenderer || !micropolisSimulator) return;

    //console.log('setTileLayer:', index);
    tileRenderer.tileLayer = index;
    micropolisSimulator.render();
  }
  
  export function refocusCanvas() {
    if (canvasGL && 
        (document.activeElement !== canvasGL)) {
      canvasGL.focus();
    }
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    initialTouchX = touch.clientX;
    initialTouchY = touch.clientY;
    console.log(`MicropolisView: handleTouchStart: event: ${event} initialTouchX": ${initialTouchX} initialTouchY: ${initialTouchY}`);
  }

  function handleTouchMove(event: TouchEvent) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - initialTouchX;
    const deltaY = touch.clientY - initialTouchY;
    console.log(`MicropolisView: handleTouchMove: event: ${event} deltaX": ${deltaX} deltaY: ${deltaY}`);
  }

  function handleTouchEnd(event: TouchEvent) {
    console.log(`MicropolisView: handleTouchEnd: event: ${event}`);
  }

  function handlePan(detail: any) {
    const { deltaX, deltaY } = detail;
    console.log(`TileView: handlePan: event: ${event} deltaX: ${deltaX} deltaY: ${deltaY}`);
  }

  function handlePinch(detail: any) {
    const { scale } = detail;
    console.log(`TileView: handleScale: detail: ${detail}`);
  }

  function handleDeviceMotion(event: DeviceMotionEvent) {
    if (event.rotationRate) {
      const { alpha, beta, gamma } = event.rotationRate;
      console.log(`TileView: handleDeviceMotion: event: ${event} alpha: ${alpha} beta: ${beta} gamma: ${gamma}`);
    }
  }

  onMount(() => {
    console.log("TileView.svelte: onMount");

    if (typeof window != 'undefined') {
/*
      // Touch event listeners
      window.document.addEventListener('touchstart', handleTouchStart, false);
      window.document.addEventListener('touchmove', handleTouchMove, false);
      window.document.addEventListener('touchend', handleTouchEnd, false);
*/
      window.addEventListener('devicemotion', handleDeviceMotion, false);
      
      // Focus the canvas but don't trap all input
      if (canvasGL) {
        // Give focus only when mouse enters the canvas
        const canvas = canvasGL; // Avoid TypeScript null check issues
        canvas.addEventListener('mouseenter', () => {
          canvas.focus();
        });
      }
    }

  });

  onDestroy(() => {
    console.log('TileView.svelte: onDestroy');
    
    stopAutoRepeat(null);
    stopKeyPanLoop();

    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handlePanMouseMove);
      window.removeEventListener('mouseup', stopPan);
/*
      window.document.removeEventListener('touchstart', handleTouchStart);
      window.document.removeEventListener('touchmove', handleTouchMove);
      window.document.removeEventListener('touchend', handleTouchEnd);
*/
      window.removeEventListener('devicemotion', handleDeviceMotion);
      
      // Make sure wheel event listener is removed
      if (canvasGL) {
        const canvas = canvasGL; // Avoid TypeScript null check issues
        canvas.removeEventListener('wheel', onwheel);
        
        // Also remove the mouseenter listener
        canvas.removeEventListener('mouseenter', () => {
          canvas.focus();
        });
      }

      window.removeEventListener('resize', handleWindowResize); // Clean up fallback listener
    }

    isMounted = false;
    initialized = false;
    renderReady = false;
    tileRenderer = null;
    if (resizeObserver) {
      resizeObserver.disconnect();
      console.log("TileView.svelte: ResizeObserver disconnected.");
    }
});

   // Fallback resize handler
   function handleWindowResize() {
       requestAnimationFrame(resizeCanvas);
   }

</script>

<canvas
  class="tileview-canvas"
  bind:this={canvasGL}
  tabindex="0"
  style:cursor={toolCursor(toolState.activeToolId, panning, shiftPanHeld)}
  onmousedown={onmousedown}
  onmousemove={onmousemove}
  onmouseup={onmouseup}
  onkeydown={onkeydown}
  onkeyup={onkeyup}
  onmouseleave={() => { if (!panning) { toolDragging = false; lastAppliedToolTile = null; } }}
  oncontextmenu={(e) => e.preventDefault()}
></canvas>
<!--
  use:pan={{ onPan: (any: any) => handlePan(any) }}
  use:pinch={{ onPinch: (any: any) => handlePinch(any) }}
-->

<style>

  .tileview-canvas {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #2a3548;
    image-rendering: pixelated;
    touch-action: none;
    z-index: 1;
    pointer-events: auto;
  }

</style>
