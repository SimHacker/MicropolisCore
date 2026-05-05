/**
 * Scenario defaults keyed by scenario .cty filenames.
 *
 * API: `ScenarioDefaults`, `getScenarioDefaults(filename)`.
 */

import path from 'node:path';
import { World } from '../constants/constants.js';

export const ScenarioDefaults = {
	dullsville: { name: 'Dullsville', year: 1900, funds: 5000, file: 'scenario_dullsville.cty' },
	san_francisco: { name: 'San Francisco', year: 1906, funds: 20000, file: 'scenario_san_francisco.cty' },
	hamburg: { name: 'Hamburg', year: 1944, funds: 20000, file: 'scenario_hamburg.cty' },
	bern: { name: 'Bern', year: 1965, funds: 20000, file: 'scenario_bern.cty' },
	tokyo: { name: 'Tokyo', year: 1957, funds: 20000, file: 'scenario_tokyo.cty' },
	detroit: { name: 'Detroit', year: 1972, funds: 20000, file: 'scenario_detroit.cty' },
	boston: { name: 'Boston', year: 2010, funds: 20000, file: 'scenario_boston.cty' },
	rio: { name: 'Rio de Janeiro', year: 2047, funds: 20000, file: 'scenario_rio_de_janeiro.cty' },
	_common: { tax: 7, speed: 3, policePercent: 1.0, firePercent: 1.0, roadPercent: 1.0 }
};

export function getScenarioDefaults(filename) {
	const base = path.basename(filename);
	for (const [key, scenario] of Object.entries(ScenarioDefaults)) {
		if (key === '_common') continue;
		if (scenario.file === base) {
			const common = ScenarioDefaults._common;
			return {
				...scenario,
				cityTime: (scenario.year - World.STARTING_YEAR) * 48 + 2,
				cityTax: common.tax,
				simSpeed: common.speed,
				policePercent: common.policePercent,
				firePercent: common.firePercent,
				roadPercent: common.roadPercent,
				autoBulldoze: true,
				autoBudget: true,
				autoGoto: true,
				soundEnabled: true
			};
		}
	}
	return null;
}
