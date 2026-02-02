/// <reference path="../types/micropolisengine.d.ts" />

import { state, effect, derived } from 'svelte/internal'; // Use 'svelte/internal' for runes until officially released if needed
import type { Micropolis, JSCallback, MicropolisConstructor } from '../types/micropolisengine.d.js';
import initModule from "$lib/micropolisengine.js";
import { ReactiveMicropolisCallback } from './ReactiveMicropolisCallback';

// --- Types ----
interface MicropolisEngineModule {
    Micropolis: MicropolisConstructor;
    JSCallback: new (callbackImpl: JSCallback) => JSCallback;
    HEAPU16: Uint16Array;
    // Add other necessary types/functions from the module
    locateFile: (path: string, prefix: string) => string;
    print: (message: string) => void;
    printErr: (message: string) => void;
    setStatus: (status: string) => void;
    onRuntimeInitialized: (() => void) | null;
    WORLD_W: number;
    WORLD_H: number;
}

// --- Module State ---
let micropolisEngine: MicropolisEngineModule | null = $state(null);
let micropolis: Micropolis | null = $state(null);
let callback: JSCallback | null = $state(null);
let mapData: Uint16Array | null = $state(null);
let mopData: Uint16Array | null = $state(null);
let isInitialized = $state(false);
let isInitializing = $state(false);

// --- Reactive Game State ---
let totalFunds = $state(0);
let cityYear = $state(0);
let cityMonth = $state(0);
let cityName = $state("");
let demandR = $state(0);
let demandC = $state(0);
let demandI = $state(0);
let gameLevel = $state(0); // 0: Easy, 1: Medium, 2: Hard
let simSpeed = $state(3); // 0-8
let simPasses = $state(1); // Passes per tick
let simPaused = $state(false);
let cityTax = $state(7); // Default tax rate
let mapUpdateCounter = $state(0); // Incremented to trigger map redraws
let cityFileName = $state('/cities/haight.cty');

// --- Settings ---
const keyFramesPerSecondValues = [ 1, 5, 10, 30, 60, 120, 120, 120, 120 ];
const keyPassesValues =          [ 1, 1, 1,  1,  1,  1,   4,   10,  50  ];
let tickIntervalId: ReturnType<typeof setInterval> | null = null;

// --- Derived State ---
const worldWidth = $derived(micropolisEngine?.WORLD_W ?? 0);
const worldHeight = $derived(micropolisEngine?.WORLD_H ?? 0);
const framesPerSecond = $derived(keyFramesPerSecondValues[simSpeed] ?? 30);

// --- Private Functions ---
async function loadMicropolisEngine(): Promise<MicropolisEngineModule> {
    if (micropolisEngine) {
        return micropolisEngine;
    }
    console.log("micropolisStore: Loading Micropolis Engine...");
    isInitializing = true;

    const engineModule: Partial<MicropolisEngineModule> = {
        print: (message: string) => console.log("micropolisengine:", message),
        printErr: (message: string) => console.error("micropolisengine: ERROR: ", message),
        setStatus: (status: string) => console.log("micropolisengine: status:", status),
        locateFile: (path: string, prefix: string) => {
            // Adjust path as needed for your setup (e.g., Vite public folder)
            const resolvedPath = path.startsWith('/') ? path : `/${path}`;
             console.log(`micropolisengine: locateFile: path: ${path}, prefix: ${prefix}, resolved to: ${resolvedPath}`);
            return resolvedPath;
        },
        onRuntimeInitialized: null,
      };

      // Return a promise that resolves when the engine is initialized
      return new Promise((resolve, reject) => {
        engineModule.onRuntimeInitialized = () => {
            console.log("micropolisengine: onRuntimeInitialized.");
            micropolisEngine = engineModule as MicropolisEngineModule;
            isInitializing = false;
            isInitialized = true;
            resolve(micropolisEngine);
        };
        initModule(engineModule).catch(reject);
      });
};

function tick() {
    if (!micropolis || simPaused) return;
    //console.log("MicropolisStore: tick");
    micropolis.simTick();
    micropolis.animateTiles();
    // Rendering is triggered by the mapUpdateCounter effect in TileView
}

// --- Effects ---
// Effect to manage the simulation tick interval
$effect(() => {
    if (tickIntervalId !== null) {
        clearInterval(tickIntervalId);
        tickIntervalId = null;
    }

    if (isInitialized && !simPaused && framesPerSecond > 0) {
        const delay = 1000 / framesPerSecond;
        tickIntervalId = setInterval(tick, delay);
        console.log(`micropolisStore: Started tick interval (fps: ${framesPerSecond}, delay: ${delay}ms)`);
    }

    // Cleanup function for the effect
    return () => {
        if (tickIntervalId !== null) {
            clearInterval(tickIntervalId);
            tickIntervalId = null;
            console.log("micropolisStore: Cleared tick interval");
        }
    };
});

// Effect to update simulation passes when speed changes
$effect(() => {
    if (micropolis) {
        const passes = keyPassesValues[simSpeed] ?? 1;
        micropolis.setPasses(passes);
        simPasses = passes;
        console.log(`micropolisStore: Set sim passes to ${passes} for speed ${simSpeed}`);
    }
});

// --- Public API ---
async function initialize(): Promise<void> {
    if (isInitialized || isInitializing) return;

    try {
        const engine = await loadMicropolisEngine();
        if (!engine) throw new Error("Failed to load Micropolis Engine Module");

        const micropolisInstance = new engine.Micropolis();
        if (!micropolisInstance) throw new Error("Failed to create Micropolis instance");
        micropolis = micropolisInstance;

        const callbackImpl = new ReactiveMicropolisCallback();
        callback = new engine.JSCallback(callbackImpl);
        micropolis.setCallback(callback!, callbackImpl); // Pass JS object as context

        const mapSizeBytes = micropolis.getMapSize();
        const mopSizeBytes = micropolis.getMopSize();
        const mapStartAddress = micropolis.getMapAddress() / 2; // Divide by 2 for Uint16Array index
        const mopStartAddress = micropolis.getMopAddress() / 2; // Divide by 2 for Uint16Array index
        const mapEndAddress = mapStartAddress + mapSizeBytes / 2;
        const mopEndAddress = mopStartAddress + mopSizeBytes / 2;

        mapData = engine.HEAPU16.subarray(mapStartAddress, mapEndAddress);
        mopData = engine.HEAPU16.subarray(mopStartAddress, mopEndAddress);

        micropolis.init();
        micropolis.loadCity(cityFileName);
        // Set initial state from the loaded city
        updateStateFromMicropolis();

        console.log("MicropolisStore: Initialization complete.");

    } catch (error) {
        console.error("MicropolisStore: Initialization failed:", error);
        isInitializing = false; // Ensure state reflects failure
        isInitialized = false;
    }
}

function updateStateFromMicropolis() {
    if (!micropolis) return;
    totalFunds = micropolis.totalFunds;
    cityYear = micropolis.cityYear;
    cityMonth = micropolis.cityMonth;
    cityName = micropolis.cityName;
    gameLevel = micropolis.gameLevel;
    simSpeed = micropolis.simSpeed;
    simPaused = micropolis.simPaused;
    cityTax = micropolis.cityTax;
    // Demands are updated via callbacks
}

function setSimPaused(paused: boolean) {
    if (micropolis) {
        micropolis.simPaused = paused;
        // Callback will update the state variable
        // simPaused = paused; // Direct update might be slightly faster perception
        if (paused && tickIntervalId) {
             clearInterval(tickIntervalId);
             tickIntervalId = null;
        } else if (!paused && !tickIntervalId) {
             // Restart tick interval (effect will handle this)
        }
    }
}

function setSimSpeed(speed: number) {
    if (micropolis && speed >= 0 && speed < keyFramesPerSecondValues.length) {
        micropolis.setSpeed(speed);
        // Callback will update state
        // simSpeed = speed;
    }
}

function setCityTaxRate(tax: number) {
    if (micropolis && tax >= 0 && tax <= 20) {
        micropolis.setCityTax(tax);
        // Callback will update state
        // cityTax = tax;
    }
}

function loadCity(filename: string) {
    if (micropolis && filename) {
        console.log(`micropolisStore: Loading city: ${filename}`);
        micropolis.loadCity(filename);
        cityFileName = filename;
        // State updates will happen via callbacks
    }
}

function generateNewCity() {
    if (micropolis) {
        console.log("micropolisStore: Generating new city...");
        micropolis.generateSomeRandomCity();
        cityFileName = "Random City";
        // State updates will happen via callbacks (didGenerateMap, updateMap etc)
    }
}

function doTool(tool: number, x: number, y: number) {
    if (micropolis) {
        micropolis.doTool(tool, x, y);
        // Map update triggered by callback
    }
}

// --- Callback Updaters (called by ReactiveMicropolisCallback) ---
function _updateCityDetails(filename: string, name: string, year: number, month: number) {
    cityFileName = filename;
    cityName = name;
    cityYear = year;
    cityMonth = month;
}

function _triggerMapUpdate() {
    mapUpdateCounter++;
}

function _displayMessage(index: number, x: number, y: number, picture: boolean, important: boolean) {
    // TODO: Implement message display logic (e.g., using a message queue state)
    console.warn(`Message ${index} at (${x},${y}): Important=${important}, Picture=${picture}`);
}

function _showBudgetPanel() {
    // TODO: Implement logic to show budget UI
    console.log("Show Budget Panel requested");
}

function _displayZoneStatus(cat: number, pop: number, val: number, cri: number, pol: number, gro: number, x: number, y: number) {
    // TODO: Implement logic to display zone status UI
    console.log(`Zone Status at (${x},${y}): C:${cat} P:${pop} V:${val} Cr:${cri} Pl:${pol} G:${gro}`);
}

function _triggerBudgetUpdate() {
    // TODO: Signal budget components to refresh if necessary
     console.log("Budget Update Triggered");
}

function _triggerEvaluationUpdate() {
    // TODO: Signal evaluation components to refresh
     console.log("Evaluation Update Triggered");
}

function _triggerHistoryUpdate() {
     // TODO: Signal history graph components to refresh
     console.log("History Update Triggered");
}

// --- Exported Store API ---
export const micropolisStore = {
    // State (read-only view for components)
    get isInitialized() { return isInitialized; },
    get isInitializing() { return isInitializing; },
    get worldWidth() { return worldWidth; },
    get worldHeight() { return worldHeight; },
    get mapData() { return mapData; },
    get mopData() { return mopData; },
    get totalFunds() { return totalFunds; },
    get cityYear() { return cityYear; },
    get cityMonth() { return cityMonth; },
    get cityName() { return cityName; },
    get demandR() { return demandR; },
    get demandC() { return demandC; },
    get demandI() { return demandI; },
    get gameLevel() { return gameLevel; },
    get simSpeed() { return simSpeed; },
    get simPasses() { return simPasses; },
    get simPaused() { return simPaused; },
    get cityTax() { return cityTax; },
    get mapUpdateCounter() { return mapUpdateCounter; },
    get cityFileName() { return cityFileName; },
    // TODO: Add other states like evaluation, history, messages etc.

    // Actions
    initialize,
    setSimPaused,
    setSimSpeed,
    setCityTaxRate,
    loadCity,
    generateNewCity,
    doTool,

    // Internal updaters (called by ReactiveMicropolisCallback)
    // These are prefixed with _ to indicate they shouldn't be called directly by UI components
    updateCityDetails: _updateCityDetails,
    triggerMapUpdate: _triggerMapUpdate,
    displayMessage: _displayMessage,
    showBudgetPanel: _showBudgetPanel,
    displayZoneStatus: _displayZoneStatus,
    triggerBudgetUpdate: _triggerBudgetUpdate,
    triggerEvaluationUpdate: _triggerEvaluationUpdate,
    triggerHistoryUpdate: _triggerHistoryUpdate,

    // Allow direct state mutation ONLY from callbacks (use with caution)
    set totalFunds(value: number) { totalFunds = value; },
    set cityYear(value: number) { cityYear = value; },
    set cityMonth(value: number) { cityMonth = value; },
    set cityName(value: string) { cityName = value; },
    set demandR(value: number) { demandR = value; },
    set demandC(value: number) { demandC = value; },
    set demandI(value: number) { demandI = value; },
    set gameLevel(value: number) { gameLevel = value; },
    set simSpeed(value: number) { simSpeed = value; }, // Note: Setter might conflict with effect logic, be careful
    set simPasses(value: number) { simPasses = value; },
    set simPaused(value: boolean) { simPaused = value; }, // Note: Setter might conflict with effect logic, be careful
    set cityTax(value: number) { cityTax = value; },
}; 