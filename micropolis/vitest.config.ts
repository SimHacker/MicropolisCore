import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		environment: 'node',
		pool: 'forks',
		fileParallelism: false,
		testTimeout: 120_000,
		hookTimeout: 120_000
	}
});
