import initModule from '../micropolisengine.js';
import type { MainModule } from '../../types/micropolisengine.d.js';

let enginePromise: Promise<MainModule> | null = null;

export function loadMicropolisBrowserModule(): Promise<MainModule> {
	if (enginePromise) return enginePromise;

	enginePromise = initModule({
		print: (message: string) => console.log('micropolisengine:', message),
		printErr: (message: string) => console.error('micropolisengine: ERROR:', message),
		setStatus: (status: string) => console.log('micropolisengine: status:', status),
		locateFile: (filename: string) => (filename.startsWith('/') ? filename : `/${filename}`),
		onRuntimeInitialized: () => console.log('micropolisengine: runtime initialized')
	}) as Promise<MainModule>;

	return enginePromise;
}
