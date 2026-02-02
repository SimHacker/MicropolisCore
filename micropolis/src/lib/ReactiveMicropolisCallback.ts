/// <reference path="../types/micropolisengine.d.ts" />

import type { JSCallback } from '../types/micropolisengine.d.js';
import { micropolisStore } from './micropolisStore';

/**
 * Implementation of the JSCallback interface that bridges calls from the C++
 * Micropolis engine back into the reactive Svelte store.
 */
export class ReactiveMicropolisCallback implements JSCallback {

    constructor() {
        console.log("ReactiveMicropolisCallback created");
    }

    print(message: string): void {
        console.log("callback print:", message);
    }

    log(message: string): void {
        console.log("callback log:", message);
    }

    debug(message: string): void {
        console.debug("callback debug:", message);
    }

    info(message: string): void {
        console.info("callback info:", message);
    }

    warn(message: string): void {
        console.warn("callback warn:", message);
    }

    error(message: string): void {
        console.error("callback error:", message);
    }

    onUpdateTotalFunds(funds: number): void {
        // Directly set the state via the store's setter
        micropolisStore.totalFunds = funds;
    }

    onUpdateDate(month: number, year: number): void {
        micropolisStore.cityMonth = month;
        micropolisStore.cityYear = year;
    }

    onUpdateDemandIndicator(demandR: number, demandC: number, demandI: number): void {
        micropolisStore.demandR = demandR;
        micropolisStore.demandC = demandC;
        micropolisStore.demandI = demandI;
    }

    onUpdateEvaluation(cityYes: number, problem: number, problemOrder: number): void {
        // TODO: Update relevant state in micropolisStore
        // console.log(`callback onUpdateEvaluation: cityYes: ${cityYes}, problem: ${problem}, problemOrder: ${problemOrder}`);
        micropolisStore.triggerEvaluationUpdate(); // Signal that evaluation data changed
    }

    onUpdateBudgetWindow(): void {
        // TODO: Update relevant state in micropolisStore
        // console.log("callback onUpdateBudgetWindow");
        micropolisStore.triggerBudgetUpdate(); // Signal that budget data changed
    }

    onUpdateBudgetNeedsRefresh(): void {
        // TODO: Update relevant state in micropolisStore
        // console.log("callback onUpdateBudgetNeedsRefresh");
        micropolisStore.triggerBudgetUpdate(); // Signal that budget data changed
    }

    onUpdateHistory(historyType: number, year: number, value: number): void {
        // TODO: Update relevant state in micropolisStore (e.g., history data structure)
        // console.log(`callback onUpdateHistory: historyType: ${historyType}, year: ${year}, value: ${value}`);
        micropolisStore.triggerHistoryUpdate(); // Signal that history data changed
    }

    onUpdateMiscWindow(): void {
        // TODO: Update relevant state in micropolisStore
        // console.log("callback onUpdateMiscWindow");
        // Perhaps trigger a general misc data update?
    }

    onUpdateEvaluationWindow(): void {
        // TODO: Update relevant state in micropolisStore
        // console.log("callback onUpdateEvaluationWindow");
        micropolisStore.triggerEvaluationUpdate(); // Signal that evaluation data changed
    }

    onUpdateGraphsWindow(): void {
        // TODO: Update relevant state in micropolisStore
        // console.log("callback onUpdateGraphsWindow");
        micropolisStore.triggerHistoryUpdate(); // Signal that history data changed
    }

    onUpdateMapWindow(): void {
        // This is the primary trigger for map redraws
        micropolisStore.triggerMapUpdate();
    }

    onUpdateCityName(name: string): void {
        micropolisStore.cityName = name;
    }

    onUpdateCityLoaded(name: string, year: number, month: number): void {
        // Called after a city is successfully loaded
        micropolisStore.updateCityDetails(name, name, year, month); // Assuming filename is same as city name for now
    }

    onUpdateGameLevel(level: number): void {
        micropolisStore.gameLevel = level;
    }

    onUpdateSimSpeed(speed: number): void {
        micropolisStore.simSpeed = speed;
    }

    onUpdateSimPaused(paused: boolean): void {
        micropolisStore.simPaused = paused;
    }

    onUpdateTaxRate(tax: number): void {
        micropolisStore.cityTax = tax;
    }

    didGenerateMap(filename: string, name: string, year: number, month: number): void {
        // Called after a new map is generated
        micropolisStore.updateCityDetails(filename, name, year, month);
        micropolisStore.triggerMapUpdate(); // Ensure map redraws after generation
    }

    didLoadScenario(name: string): void {
        // TODO: Update relevant state in micropolisStore
        console.log(`callback didLoadScenario: name: ${name}`);
        // Potentially set game mode/scenario state?
    }

    didLoadCity(filename: string, name: string, year: number, month: number): void {
        // Called after a city file is loaded (redundant with onUpdateCityLoaded? Check C++ usage)
        micropolisStore.updateCityDetails(filename, name, year, month);
        micropolisStore.triggerMapUpdate(); // Ensure map redraws after load
    }

    didSaveCity(filename: string, name: string, year: number, month: number): void {
        // Called after a city is saved
        console.log(`callback didSaveCity: filename: ${filename}, name: ${name}, year: ${year}, month: ${month}`);
        // Maybe update a 'last saved' state?
        micropolisStore.updateCityDetails(filename, name, year, month); // Ensure state reflects saved name/date
    }

    updateUserMessage(index: number, x: number, y: number, picture: boolean, important: boolean): void {
        micropolisStore.displayMessage(index, x, y, picture, important);
    }

    clearUserMessages(): void {
        // TODO: Implement clearing message queue state in micropolisStore
        console.log("callback clearUserMessages");
    }

    showBudgetWindow(): void {
        micropolisStore.showBudgetPanel();
    }

    queryZoneStatus(cat: number, pop: number, val: number, cri: number, pol: number, gro: number, x: number, y: number): void {
        micropolisStore.displayZoneStatus(cat, pop, val, cri, pol, gro, x, y);
    }

    // Make sure all methods from the C++ interface are implemented
} 