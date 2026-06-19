import { GAME_TOOLS } from '$lib/gameTools';

export type HelpSection = {
	title: string;
	rows: { keys: string; action: string }[];
};

export const HELP_SECTIONS: HelpSection[] = [
	{
		title: 'Tools',
		rows: GAME_TOOLS.map((tool) => ({
			keys: tool.shortcut,
			action: tool.tooltip ?? tool.label
		}))
	},
	{
		title: 'View',
		rows: [
			{ keys: 'Drag', action: 'Pan map (left button)' },
			{ keys: 'Shift+drag', action: 'Pan map' },
			{ keys: 'Wheel', action: 'Zoom in / out' },
			{ keys: '← → ↑ ↓', action: 'Pan map' },
			{ keys: ', .', action: 'Zoom in / out' }
		]
	},
	{
		title: 'Simulation',
		rows: [
			{ keys: '0', action: 'Pause / resume' },
			{ keys: '1–9', action: 'Simulation speed' },
			{ keys: '[ ]', action: 'Lower / raise tax rate' }
		]
	},
	{
		title: 'Appearance',
		rows: [
			{ keys: '= −', action: 'Next / previous tile set' },
			{ keys: '+ _', action: 'Next / previous tile layer' }
		]
	},
	{
		title: 'Other',
		rows: [
			{ keys: '\\', action: 'Generate random city' },
			{ keys: '?', action: 'Show / hide this help' },
			{ keys: 'Esc', action: 'Close this help' }
		]
	}
];
