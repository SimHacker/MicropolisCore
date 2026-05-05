import type { JSCallback, MainModule } from '../../types/micropolisengine.d.js';

export const callbackMethodNames = [
	'autoGoto',
	'didGenerateMap',
	'didLoadCity',
	'didLoadScenario',
	'didLoseGame',
	'didSaveCity',
	'didTool',
	'didWinGame',
	'didntLoadCity',
	'didntSaveCity',
	'makeSound',
	'newGame',
	'saveCityAs',
	'sendMessage',
	'showBudgetAndWait',
	'showZoneStatus',
	'simulateRobots',
	'simulateChurch',
	'startEarthquake',
	'startGame',
	'startScenario',
	'updateBudget',
	'updateCityName',
	'updateDate',
	'updateDemand',
	'updateEvaluation',
	'updateFunds',
	'updateGameLevel',
	'updateHistory',
	'updateMap',
	'updateOptions',
	'updatePasses',
	'updatePaused',
	'updateSpeed',
	'updateTaxRate'
] as const;

export function createNoopJsCallback(engine: MainModule): JSCallback {
	return new engine.JSCallback(Object.fromEntries(callbackMethodNames.map((name) => [name, () => {}])));
}
