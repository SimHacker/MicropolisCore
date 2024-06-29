/// <reference path="../types/micropolisengine.d.ts" />

import type { Micropolis, Callback, JSCallback } from '../types/micropolisengine.d.js';
import initModule from "$lib/micropolisengine.js";

export let micropolisengine: any;

export async function loadMicropolisEngine(): Promise<any> {

    if (micropolisengine) {
        return micropolisengine;
    }

    micropolisengine = {
        print: (message: string) => console.log("micropolisengine:", message),
        printErr: (message: string) => console.error("micropolisengine: ERROR: ", message),
        setStatus: (status: string) => console.log("micropolisengine: initModule: status:", status),
        locateFile: (path: string, prefix: string) => {
          console.log("micropolisengine: initModule: locateFile:", "prefix:", prefix, "path:", path);
          //return prefix + path; // This breaks capacitor which gets a funky prefix.
          return path;
        },
        onRuntimeInitialized: () => console.log("micropolisengine: onRuntimeInitialized:"),
      };

      await initModule(micropolisengine);

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
    tickIntervalId: number | null = null;
    framesPerSecond: number = 0;
    pausedFramesPerSecond: number = 0;
    paused: boolean = false;
    render: (() => void) | null = null;
  
    constructor() {
    }

    async initialize(callback: Callback | null = null, render: (() => void) | null) {
        console.log("MicropolisSimulator: initialize");

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

        this.render = render;

        const mapStartAddress = this.micropolis.getMapAddress() / 2;
        const mapEndAddress = mapStartAddress + this.micropolis.getMapSize() / 2;
        this.mapData = this.micropolisengine.HEAPU16.subarray(mapStartAddress, mapEndAddress);
        
        const mopStartAddress = this.micropolis.getMopAddress() / 2;
        const mopEndAddress = mopStartAddress + this.micropolis.getMopSize() / 2;
        this.mopData = this.micropolisengine.HEAPU16.subarray(mopStartAddress, mopEndAddress);

        this.micropolis.init();
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
        this.micropolis?.simTick();
        this.micropolis?.animateTiles();

        if (this.render) {
            this.render();
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

}

