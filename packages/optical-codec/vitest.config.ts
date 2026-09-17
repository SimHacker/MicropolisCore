import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.test.ts'],
		// Image work in pure TypeScript: the blur passes over an 800x600 frame are the slow part,
		// and a default five-second timeout fails them on a cold machine rather than honestly.
		testTimeout: 60000
	}
});
