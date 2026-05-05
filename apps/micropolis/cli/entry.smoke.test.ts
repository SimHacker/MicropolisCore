import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve(process.cwd(), 'cli/entry.ts');
const tsxPath = path.resolve(process.cwd(), 'node_modules/.bin/tsx');

async function runCli(args: string[]) {
	return execFileAsync(tsxPath, [cliPath, ...args], { cwd: process.cwd() });
}

describe('micropolis CLI entrypoint', () => {
	it('prints structured about output', async () => {
		const { stdout } = await runCli(['about', '--format', 'yaml']);
		expect(stdout).toContain('name: micropolis');
		expect(stdout).toContain('cli/city/visualize.ts');
	});

	it('prints API map with shared wasm modules', async () => {
		const { stdout } = await runCli(['api', '--format', 'yaml']);
		expect(stdout).toContain('wasmBrowserLoader: src/lib/wasm/browser.ts');
		expect(stdout).toContain('i18nKeys: src/lib/i18n/keys.ts');
	});
});
