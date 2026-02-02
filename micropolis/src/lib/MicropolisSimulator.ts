/// <reference path="../types/micropolisengine.d.ts" />

import type { Micropolis, Callback, JSCallback } from '../types/micropolisengine.d.js';
import initModule from "$lib/micropolisengine.js";

export let micropolisengine: any;
let sharedSimulator: MicropolisSimulator | null = null;
let viewCount = 0;
const GLOBAL_KEY = '__MICROPOLIS_SINGLETON__';

function getGlobalStore(): { simulator?: MicropolisSimulator | null; engine?: any; viewCount?: number } {
  const g = (globalThis as any);
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = { simulator: null, engine: null, viewCount: 0 };
  return g[GLOBAL_KEY];
}

let capacitorApp: boolean = 
    (typeof window != 'undefined') &&
    (window.location.href == 'capacitor://localhost');
console.log(`MicropolisSimulator.ts: capacitorApp: ${capacitorApp}`);

export async function loadMicropolisEngine(): Promise<any> {

    const store = getGlobalStore();
    if (store.engine) {
        micropolisengine = store.engine;
        return micropolisengine;
    }

    if (micropolisengine) {
        store.engine = micropolisengine;
        return micropolisengine;
    }

    micropolisengine = {
        print: (message: string) => console.log("micropolisengine:", message),
        printErr: (message: string) => console.error("micropolisengine: ERROR: ", message),
        setStatus: (status: string) => console.log("micropolisengine: initModule: status:", status),
        locateFile: (path: string, prefix: string) => {
            const absolutePath = path.startsWith('/') ? path : `/${path}`;
            console.log(`micropolisengine: initModule: locateFile: path: ${path}, prefix: ${prefix}, resolved to absolutePath: ${absolutePath}`);
            return absolutePath;
        },
        onRuntimeInitialized: () => console.log("micropolisengine: onRuntimeInitialized:"),
      };

      await initModule(micropolisengine);
      store.engine = micropolisengine;

      return micropolisengine;
};

export class MicropolisSimulator {

    micropolisengine: any;
    micropolis: Micropolis | null = null;
    callback: JSCallback | null = null;
    mapData: Uint16Array | null = null;
    mopData: Uint16Array | null = null;
    cityFileName = '/cities/haight.cty';
    cityFileNames = [
      "/cities/about.cty",
      "/cities/badnews.cty",
      "/cities/bluebird.cty",
      "/cities/bruce.cty",
      "/cities/deadwood.cty",
      "/cities/finnigan.cty",
      "/cities/freds.cty",
      "/cities/haight.cty",
      "/cities/happisle.cty",
      "/cities/joffburg.cty",
      "/cities/kamakura.cty",
      "/cities/kobe.cty",
      "/cities/kowloon.cty",
      "/cities/kyoto.cty",
      "/cities/linecity.cty",
      "/cities/med_isle.cty",
      "/cities/ndulls.cty",
      "/cities/neatmap.cty",
      "/cities/radial.cty",
      "/cities/scenario_bern.cty",
      "/cities/scenario_boston.cty",
      "/cities/scenario_detroit.cty",
      "/cities/scenario_dullsville.cty",
      "/cities/scenario_hamburg.cty",
      "/cities/scenario_rio_de_janeiro.cty",
      "/cities/scenario_san_francisco.cty",
      "/cities/scenario_tokyo.cty",
      "/cities/senri.cty",
      "/cities/southpac.cty",
      "/cities/splats.cty",
      "/cities/wetcity.cty",
      "/cities/yokohama.cty",
    ];
    gameSpeed = 3;
    keyFramesPerSecondValues = [ 1, 5, 10, 30, 60, 120, 120, 120, 120 ];
    keyPassesValues =          [ 1, 1, 1,  1,  1,  1,   4,   10,  50  ];
    tickIntervalId: number | NodeJS.Timeout | null = null;
    framesPerSecond: number = 0;
    pausedFramesPerSecond: number = 0;
    paused: boolean = false;
    render: (() => void) = () => {};
    private disposed: boolean = false;
    private isInitialized: boolean = false;
    private hasLoadedCity: boolean = false;
    private renderCallbacks: Set<() => void> = new Set();
  
    constructor() {
    }

    async initialize(callback: Callback | null = null, render: (() => void) | null) {
        console.log("MicropolisSimulator: initialize");
        // If this instance was previously used, clean it up defensively
        if (this.micropolis || this.callback || this.tickIntervalId) {
            try { this.dispose(); } catch {}
        }
        this.disposed = false;

        this.micropolisengine = await loadMicropolisEngine();
        console.log("MicropolisSimulator: initialize: micropolisengine:", this.micropolisengine);
        if (this.micropolisengine === null) {
            console.log("MicropolisSimulator: initialize: error loading micropolisengine.");
            return;
        }
    
        this.micropolis = new micropolisengine.Micropolis();
        console.log("MicropolisSimulator: initialize: micropolis:", this.micropolis);
        if (this.micropolis === null) {
            console.log("MicropolisSimulator: initialize: error creating micropolis.");
            return;
        }

        if (!callback) {
            this.callback = null;
        } else {
            this.callback = new this.micropolisengine.JSCallback(callback);
            this.micropolis.setCallback(this.callback!, this);
        }

        this.render = render || (() => {});

        const mapStartAddress = this.micropolis.getMapAddress() / 2;
        const mapEndAddress = mapStartAddress + this.micropolis.getMapSize() / 2;
        this.mapData = this.micropolisengine.HEAPU16.subarray(mapStartAddress, mapEndAddress);
        
        const mopStartAddress = this.micropolis.getMopAddress() / 2;
        const mopEndAddress = mopStartAddress + this.micropolis.getMopSize() / 2;
        this.mopData = this.micropolisengine.HEAPU16.subarray(mopStartAddress, mopEndAddress);

        this.micropolis.init();
        this.isInitialized = true;
    }

    fillMopTiles(value: number) {
        if (!this.mopData) {
            console.log("MicropolisSimulator: fillMopTiles: no mopData");
            return;
        }

        for (let i = 0; i < this.mopData.length; i++) {
            this.mopData[i] = value;
        }
    }

    rotateMapTiles(rotation: number) {
        if (!this.mapData) {
            console.log("MicropolisSimulator: rotateMapTiles: no mapData");
            return;
        }

        const lomask = 0x3ff;
        const tileCount = this.micropolisengine.WORLD_W * this.micropolisengine.WORLD_H;

        for (let i = 0; i < this.mapData.length; i++) {
            let cell = this.mapData[i];
            let tile = cell & lomask;
            tile += rotation + (10 * tileCount);
            tile %= tileCount;
            cell = (cell & ~lomask) | (tile & lomask);
            this.mapData[i] = cell;
        }
    }

    tick() {
        //console.log("MicropolisSimulator: tick");
        if (this.disposed) return;
        this.micropolis?.simTick();
        this.micropolis?.animateTiles();

        // Fan out to all registered views (if any)
        if (this.renderCallbacks.size > 0) {
            for (const fn of this.renderCallbacks) {
                try { fn(); } catch (e) { console.warn('MicropolisSimulator: view render failed:', e); }
            }
        } else {
            try {
                this.render();
            } catch {}
        }
    }
    
    setGameSpeed(speed: number) {
        this.gameSpeed = speed;
        this.setFramesPerSecond(this.keyFramesPerSecondValues[this.gameSpeed]);
        this.micropolis?.setPasses(this.keyPassesValues[this.gameSpeed]);
    }

    resetFramesPerSecond() {
        const lastFramesPerSecond = this.framesPerSecond;
        this.setFramesPerSecond(0);
        this.setFramesPerSecond(lastFramesPerSecond);
      }
    
      setFramesPerSecond(fps: number): void {
        console.log('setFramesPerSecond: fps:', fps);
        if (this.disposed) return;
        this.framesPerSecond = fps;
    
        if (this.tickIntervalId !== null) {
            clearInterval(this.tickIntervalId);
        }
    
        if (fps <= 0) {
          return;
        }
    
        const delay = 1000 / fps;
        this.tickIntervalId = setInterval(() => this.tick(), delay);
      }
    
      setPaused(nowPaused: boolean) {
    
        const wasPaused = this.paused;
        this.paused = nowPaused;
        this.micropolis!.simPaused = nowPaused;
    
        if (!wasPaused && nowPaused) {
          if (this.framesPerSecond !== 0) {
            this.pausedFramesPerSecond = this.framesPerSecond;
          }
          this.setFramesPerSecond(0);
        } else if (wasPaused && !nowPaused) {
          this.framesPerSecond = this.pausedFramesPerSecond;
          this.setFramesPerSecond(this.framesPerSecond);
        } else {
            this.resetFramesPerSecond();
        }
    
        this.tick();
      }

      dispose() {
        // Stop ticking and prevent further work
        if (this.tickIntervalId !== null) {
            clearInterval(this.tickIntervalId);
            this.tickIntervalId = null;
        }
        this.disposed = true;
        // Make render a no-op to avoid stale closures
        this.render = () => {};
        // Release wasm/embind objects
        try { this.callback?.delete?.(); } catch {}
        try { this.micropolis?.delete?.(); } catch {}
        this.callback = null;
        this.micropolis = null;
        this.mapData = null;
        this.mopData = null;
        this.isInitialized = false;
        this.hasLoadedCity = false;
        this.renderCallbacks.clear();
      }

      registerRenderCallback(fn: () => void) {
        if (fn) this.renderCallbacks.add(fn);
      }
      unregisterRenderCallback(fn: () => void) {
        if (fn) this.renderCallbacks.delete(fn);
      }
      loadDefaultCityOnce() {
        if (this.micropolis && !this.hasLoadedCity) {
          console.log('MicropolisSimulator: loadDefaultCityOnce:', this.cityFileName);
          this.micropolis.loadCity(this.cityFileName);
          this.hasLoadedCity = true;
        }
      }
}

export async function getSharedSimulator(callback: Callback | null, render: (() => void) | null): Promise<MicropolisSimulator> {
    const store = getGlobalStore();
    if (store.simulator) {
        sharedSimulator = store.simulator;
    }

    if (!sharedSimulator) {
        sharedSimulator = new MicropolisSimulator();
        await sharedSimulator.initialize(callback, render);
        sharedSimulator.registerRenderCallback(render || (() => {}));
        sharedSimulator.loadDefaultCityOnce();
        store.simulator = sharedSimulator;
    } else {
        // Keep existing wasm/callbacks; just attach this view's render
        sharedSimulator.registerRenderCallback(render || (() => {}));
    }

    // Attach view and resume ticking if needed
    viewCount += 1;
    store.viewCount = (store.viewCount || 0) + 1;
    if (store.viewCount === 1) {
        try { sharedSimulator.setPaused(false); } catch {}
    }
    return sharedSimulator;
}

export function releaseSharedSimulator(render?: () => void) {
    const store = getGlobalStore();
    if (store.simulator) {
        if (render) store.simulator.unregisterRenderCallback(render);
        store.viewCount = Math.max(0, (store.viewCount || 0) - 1);
        viewCount = store.viewCount;
        if (store.viewCount === 0) {
            try { store.simulator.setPaused(true); } catch {}
        }
    }
}

