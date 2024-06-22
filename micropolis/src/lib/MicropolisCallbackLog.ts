/// <reference path="../types/micropolisengine.d.ts" />

import type { Micropolis, JSCallback } from '../types/micropolisengine.d.js';

// Micropolis Callback Interface Implementation

export class MicropolisCallbackLog implements JSCallback {

    verbose: boolean = false;

    autoGoto(micropolis: Micropolis, callbackVal: any, x: number, y: number, message: string): void {
        console.log('MicropolisCallbackLog: autoGoto:', 'x:', x, 'y:', y, 'message:', message);
    }

    didGenerateMap(micropolis: Micropolis, callbackVal: any, seed: number): void {
        console.log('MicropolisCallbackLog: didGenerateMap:', 'seed:', seed);
    }

    didLoadCity(micropolis: Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallbackLog: didLoadCity:', 'filename:', filename);
    }

    didLoadScenario(micropolis: Micropolis, callbackVal: any, name: string, fname: string): void {
        console.log('MicropolisCallbackLog: didLoadScenario:', 'name:', name, 'fname:', fname);
    }

    didLoseGame(micropolis: Micropolis, callbackVal: any): void {
        console.log('MicropolisCallbackLog: didLoseGame');
    }

    didSaveCity(micropolis: Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallbackLog: didSaveCity:', 'filename:', filename);
    }

    didTool(micropolis: Micropolis, callbackVal: any, name: string, x: number, y: number): void {
        console.log('MicropolisCallbackLog: didTool:', 'name:', name, 'x:', x, 'y:', y);
    }

    didWinGame(micropolis: Micropolis, callbackVal: any): void {
        console.log('MicropolisCallbackLog: didWinGame');
    }

    didntLoadCity(micropolis: Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallbackLog: didntLoadCity:', 'filename:', filename);
    }

    didntSaveCity(micropolis: Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallbackLog: didntSaveCity:', 'filename:', filename);
    }

    makeSound(micropolis: Micropolis, callbackVal: any, channel: string, sound: string, x: number, y: number): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: makeSound:', 'channel:', channel, 'sound:', sound, 'x:', x, 'y:', y);
        }
    }

    newGame(micropolis: Micropolis, callbackVal: any): void {
        console.log('MicropolisCallbackLog: newGame');
    }

    saveCityAs(micropolis: Micropolis, callbackVal: any, filename: string): void {
        console.log('MicropolisCallbackLog: saveCityAs:', 'filename:', filename);
    }

    sendMessage(micropolis: Micropolis, callbackVal: any, messageIndex: number, x: number, y: number, picture: boolean, important: boolean): void {
        //console.log('MicropolisCallbackLog: sendMessage:', 'messageIndex:', messageIndex, 'x:', x, 'y:', y, 'picture:', picture, 'important:', important);
    }

    showBudgetAndWait(micropolis: Micropolis, callbackVal: any): void {
        //console.log('MicropolisCallbackLog: showBudgetAndWait');
    }

    showZoneStatus(micropolis: Micropolis, callbackVal: any, tileCategoryIndex: number, populationDensityIndex: number, landValueIndex: number, crimeRateIndex: number, pollutionIndex: number, growthRateIndex: number, x: number, y: number): void {
        console.log('MicropolisCallbackLog: showZoneStatus:', 'tileCategoryIndex:', tileCategoryIndex, 'populationDensityIndex:', populationDensityIndex, 'landValueIndex:', landValueIndex, 'crimeRateIndex:', crimeRateIndex, 'pollutionIndex:', pollutionIndex, 'growthRateIndex:', growthRateIndex, 'x:', x, 'y:', y);
    }

    simulateRobots(micropolis: Micropolis, callbackVal: any): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: simulateRobots');
        }
    }

    simulateChurch(micropolis: Micropolis, callbackVal: any, posX: number, posY: number, churchNumber: number): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: simulateChurch:', 'posX:', posX, 'posY:', posY, 'churchNumber:', churchNumber);
        }
    }

    startEarthquake(micropolis: Micropolis, callbackVal: any, strength: number): void {
        console.log('MicropolisCallbackLog: startEarthquake:', 'strength:', strength);
    }

    startGame(micropolis: Micropolis, callbackVal: any): void {
        console.log('MicropolisCallbackLog: startGame');
    }

    startScenario(micropolis: Micropolis, callbackVal: any, scenario: number): void {
        console.log('MicropolisCallbackLog: startScenario:', 'scenario:', scenario);
    }

    updateBudget(micropolis: Micropolis, callbackVal: any): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updateBudget');
        }
    }

    updateCityName(micropolis: Micropolis, callbackVal: any, cityName: string): void {
        console.log('MicropolisCallbackLog: updateCityName:', 'cityName:', cityName);
    }

    updateDate(micropolis: Micropolis, callbackVal: any, cityYear: number, cityMonth: number): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updateDate:', 'cityYear:', cityYear, 'cityMonth:', cityMonth);
        }
    }

    updateDemand(micropolis: Micropolis, callbackVal: any, r: number, c: number, i: number): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updateDemand:', 'r:', r, 'c:', c, 'i:', i);
        }
    }

    updateEvaluation(micropolis: Micropolis, callbackVal: any): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updateEvaluation');
        }
    }

    updateFunds(micropolis: Micropolis, callbackVal: any, totalFunds: number): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updateFunds:', 'totalFunds:', totalFunds);
        }
    }

    updateGameLevel(micropolis: Micropolis, callbackVal: any, gameLevel: number): void {
        console.log('MicropolisCallbackLog: updateGameLevel:', 'gameLevel:', gameLevel);
    }

    updateHistory(micropolis: Micropolis, callbackVal: any): void {
        if (this.verbose) {
           console.log('MicropolisCallbackLog: updateHistory');
        }
    }

    updateMap(micropolis: Micropolis, callbackVal: any): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updateMap');
        }
    }

    updateOptions(micropolis: Micropolis, callbackVal: any): void {
        console.log('MicropolisCallbackLog: updateOptions');
    }

    updatePasses(micropolis: Micropolis, callbackVal: any, passes: number): void {
        if (this.verbose) {
            console.log('MicropolisCallbackLog: updatePasses:', 'passes:', passes);
        }
    }

    updatePaused(micropolis: Micropolis, callbackVal: any, simPaused: boolean): void {
        console.log('MicropolisCallbackLog: updatePaused:', 'simPaused:', simPaused);
    }

    updateSpeed(micropolis: Micropolis, callbackVal: any, speed: number): void {
        console.log('MicropolisCallbackLog: updateSpeed:', 'speed:', speed);
    }

    updateTaxRate(micropolis: Micropolis, callbackVal: any, cityTax: number): void {
        console.log('MicropolisCallbackLog: updateTaxRate:', 'cityTax:', cityTax);
    }

    delete(): void {
        console.log('MicropolisCallbackLog: delete');
    }

}
