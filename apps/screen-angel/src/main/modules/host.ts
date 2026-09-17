/**
 * Loads modules, gives each one the layer, and swaps bridges as the focus moves.
 *
 * The focus watcher is the interesting part and it is only a few lines: poll the
 * frontmost window, and when it changes, ask every registered bridge whether it
 * recognizes it. The first one that does gets attached and the previous one gets
 * detached. That is the whole of "bridges hot-swap on game focus" — no game-specific
 * code anywhere in this file, which is the test of whether the split holds.
 */

import { EventEmitter } from 'node:events';

import type { ModuleDescription } from '@common/ipc';
import type { WindowInfo } from '@common/types';

import type { ScreenAngelBackend } from '../backends';
import {
	matchesWindow,
	type AngelServices,
	type Bridge,
	type HostEvents,
	type ModuleContext,
	type ScreenAngelModule
} from './module';

export interface LoadedModule {
	module: ScreenAngelModule;
	bridges: Bridge[];
}

const FOCUS_POLL_MS = 1000;

export class ModuleHost extends EventEmitter {
	private readonly loaded: LoadedModule[] = [];
	private readonly services: AngelServices;
	private timer: NodeJS.Timeout | null = null;
	private lastWindowKey = '';
	private activeBridge: { bridge: Bridge; module: ScreenAngelModule } | null = null;

	constructor(private readonly backend: ScreenAngelBackend) {
		super();
		this.services = {
			getPermissions: () => backend.getPermissions(),
			query: (selector, options) => backend.query(selector, options),
			dumpTree: (options) => backend.dumpTree(options),
			elementAt: (x, y) => backend.elementAt(x, y),
			getFocusedWindow: () => backend.getFocusedWindow(),
			getOpenWindows: () => backend.getOpenWindows()
		};
	}

	public async load(modules: ScreenAngelModule[]): Promise<void> {
		for (const module of modules) {
			const entry: LoadedModule = { module, bridges: [] };
			const context: ModuleContext = {
				angel: this.services,
				log: (message, ...rest) => console.log(`[${module.id}] ${message}`, ...rest),
				on: (event, handler) => {
					this.on(event, handler as (...args: unknown[]) => void);
				},
				registerBridge: (bridge) => {
					entry.bridges.push(bridge);
					console.log(`[${module.id}] registered bridge "${bridge.id}" for ${bridge.target}`);
				}
			};

			try {
				await module.activate(context);
				this.loaded.push(entry);
				console.log(`[host] activated module "${module.id}" (${module.name})`);
			} catch (error) {
				// One bad module must not take the host down with it. It gets left
				// unloaded and named in the log; everything else carries on.
				console.error(`[host] module "${module.id}" failed to activate:`, error);
			}
		}
	}

	public start(): void {
		if (this.timer !== null) {
			return;
		}
		this.timer = setInterval(() => {
			void this.pollFocus();
		}, FOCUS_POLL_MS);
		void this.pollFocus();
	}

	public stop(): void {
		if (this.timer !== null) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	public async unload(): Promise<void> {
		this.stop();
		await this.detachActive();
		for (const entry of [...this.loaded].reverse()) {
			try {
				await entry.module.deactivate?.();
			} catch (error) {
				console.error(`[host] module "${entry.module.id}" failed to deactivate:`, error);
			}
		}
		this.loaded.length = 0;
	}

	public describe(): ModuleDescription[] {
		return this.loaded.map((entry) => ({
			id: entry.module.id,
			name: entry.module.name,
			bridges: entry.bridges.map((bridge) => ({
				id: bridge.id,
				target: bridge.target,
				matches: bridge.matches
			}))
		}));
	}

	public get activeBridgeId(): string | null {
		return this.activeBridge?.bridge.id ?? null;
	}

	private async pollFocus(): Promise<void> {
		let window: WindowInfo | null = null;
		try {
			window = await this.backend.getFocusedWindow();
		} catch (error) {
			console.error('[host] could not read the focused window:', error);
			return;
		}

		// pid plus title, because a game changes its title as it changes screens and a
		// bridge may well want to know about that.
		const windowKey = window === null ? '' : `${window.pid}\u0000${window.title}`;
		if (windowKey === this.lastWindowKey) {
			return;
		}
		this.lastWindowKey = windowKey;
		this.emitTyped('window-focus', window);

		await this.reconcileBridge(window);
	}

	private async reconcileBridge(window: WindowInfo | null): Promise<void> {
		const wanted = window === null ? null : this.findBridge(window);

		if (wanted?.bridge.id === this.activeBridge?.bridge.id) {
			return;
		}

		await this.detachActive();

		if (wanted === null || window === null) {
			this.emitTyped('bridge-change', null);
			return;
		}

		try {
			await wanted.bridge.attach?.(window, this.services);
			this.activeBridge = wanted;
			this.emitTyped('bridge-change', wanted.bridge.id);
			console.log(`[host] attached bridge "${wanted.bridge.id}" to ${window.app}`);
		} catch (error) {
			console.error(`[host] bridge "${wanted.bridge.id}" failed to attach:`, error);
			this.emitTyped('bridge-change', null);
		}
	}

	private findBridge(window: WindowInfo): { bridge: Bridge; module: ScreenAngelModule } | null {
		for (const entry of this.loaded) {
			for (const bridge of entry.bridges) {
				if (bridge.matches.some((matcher) => matchesWindow(matcher, window))) {
					return { bridge, module: entry.module };
				}
			}
		}
		return null;
	}

	private async detachActive(): Promise<void> {
		if (this.activeBridge === null) {
			return;
		}
		const { bridge } = this.activeBridge;
		this.activeBridge = null;
		try {
			await bridge.detach?.();
			console.log(`[host] detached bridge "${bridge.id}"`);
		} catch (error) {
			console.error(`[host] bridge "${bridge.id}" failed to detach:`, error);
		}
	}

	private emitTyped<K extends keyof HostEvents>(
		event: K,
		...args: Parameters<HostEvents[K]>
	): void {
		this.emit(event, ...args);
	}
}
