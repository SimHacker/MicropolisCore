/**
 * The bridge. contextIsolation is on, so this is the only code that sees both sides.
 *
 * It adds no logic of its own: every method is a pass-through to a channel in
 * common/ipc.ts. Logic here would be logic in a place nobody thinks to look.
 */

import { contextBridge, ipcRenderer } from 'electron';

import { IPC, type ScreenAngelApi, type Utterance } from '@common/ipc';
import type { QueryOptions, Rect, WindowInfo } from '@common/types';

const api: ScreenAngelApi = {
	getHostInfo: () => ipcRenderer.invoke(IPC.hostInfo),
	getPermissions: () => ipcRenderer.invoke(IPC.permissions),
	requestPermissions: () => ipcRenderer.invoke(IPC.requestPermissions),
	query: (selector: string, options?: QueryOptions) =>
		ipcRenderer.invoke(IPC.query, selector, options),
	dumpTree: (options?: QueryOptions) => ipcRenderer.invoke(IPC.dumpTree, options),
	elementAt: (x: number, y: number) => ipcRenderer.invoke(IPC.elementAt, x, y),
	getFocusedWindow: () => ipcRenderer.invoke(IPC.focusedWindow),
	getOpenWindows: () => ipcRenderer.invoke(IPC.openWindows),
	setClickThrough: (enabled: boolean) => ipcRenderer.invoke(IPC.setClickThrough, enabled),
	toggleOverlay: () => ipcRenderer.invoke(IPC.toggleOverlay),
	setHighlights: (rects: Rect[]) => ipcRenderer.invoke(IPC.setHighlights, rects),
	say: (utterance: Utterance) => ipcRenderer.invoke(IPC.say, utterance),
	grab: (params) => ipcRenderer.invoke(IPC.grab, params),

	onHighlights: (handler: (rects: Rect[]) => void) => {
		const listener = (_event: unknown, rects: Rect[]) => handler(rects);
		ipcRenderer.on(IPC.highlightsEvent, listener);
		return () => ipcRenderer.off(IPC.highlightsEvent, listener);
	},

	onSay: (handler: (utterance: Utterance) => void) => {
		const listener = (_event: unknown, utterance: Utterance) => handler(utterance);
		ipcRenderer.on(IPC.sayEvent, listener);
		return () => ipcRenderer.off(IPC.sayEvent, listener);
	},

	onWindowFocus: (handler: (window: WindowInfo | null) => void) => {
		const listener = (_event: unknown, window: WindowInfo | null) => handler(window);
		ipcRenderer.on(IPC.windowFocusEvent, listener);
		return () => ipcRenderer.off(IPC.windowFocusEvent, listener);
	},

	onDevToolsOpened: (handler: () => void) => {
		const listener = () => handler();
		ipcRenderer.on(IPC.devToolsOpenedEvent, listener);
		return () => ipcRenderer.off(IPC.devToolsOpenedEvent, listener);
	},

	onBridgeChange: (handler: (bridgeId: string | null) => void) => {
		const listener = (_event: unknown, bridgeId: string | null) => handler(bridgeId);
		ipcRenderer.on(IPC.bridgeChangeEvent, listener);
		return () => ipcRenderer.off(IPC.bridgeChangeEvent, listener);
	}
};

contextBridge.exposeInMainWorld('angel', api);
