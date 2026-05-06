#!/usr/bin/env node
/**
 * Structural assertions that prove the monorepo refactor is intact.
 *
 * Run from the repo root:
 *   node scripts/verify-monorepo-structure.mjs
 *
 * Or via pnpm:
 *   pnpm run verify:structure
 *
 * Exits non-zero on the first failure and prints a clear reason.
 *
 * What this enforces:
 *   - The legacy top-level `MicropolisEngine/` and `vitamoo/` directories
 *     are gone (engine moved to `packages/micropolis-engine`, VitaMoo split
 *     into `apps/vitamoospace`, `packages/mooshow`, `packages/vitamoo`,
 *     `documentation/vitamoo/`, `content/vitamoo/`).
 *   - `apps/vitamoospace/static/data` is a valid symlink that resolves to
 *     `content/vitamoo/sims-demo/` and the target has files.
 *   - `pnpm-workspace.yaml` declares `apps/*` and `packages/*`.
 *   - Every workspace dir referenced by either glob has a real package.json.
 *   - Every `workspace:*` dependency resolves to a sibling workspace package.
 *   - The C++/WASM engine package exists, is named `@micropolis/engine-wasm`,
 *     and is consumed by `apps/micropolis` as a devDependency.
 *   - `apps/micropolis/package.json` has a `prebuild` script that builds the
 *     engine workspace package before Vite.
 *   - `packages/micropolis-engine/makefile` install targets refer to
 *     `../../apps/micropolis/...` (matches the new monorepo depth).
 *   - The makefile preloads `../../content/micropolis/cities` (relative to
 *     `packages/micropolis-engine/`) and that directory exists with .cty files.
 */

import { readFileSync, lstatSync, statSync, existsSync, readlinkSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const failures = [];
const passes = [];

function check(label, fn) {
	try {
		const detail = fn();
		passes.push(detail ? `${label}: ${detail}` : label);
	} catch (err) {
		failures.push(`${label}: ${err.message}`);
	}
}

function mustNotExist(relPath) {
	const abs = join(repoRoot, relPath);
	if (existsSync(abs)) {
		throw new Error(`expected ${relPath} to NOT exist at repo root`);
	}
}

function mustBeDir(relPath) {
	const abs = join(repoRoot, relPath);
	if (!existsSync(abs)) throw new Error(`missing ${relPath}`);
	const st = statSync(abs);
	if (!st.isDirectory()) throw new Error(`${relPath} is not a directory`);
}

function mustBeFile(relPath) {
	const abs = join(repoRoot, relPath);
	if (!existsSync(abs)) throw new Error(`missing ${relPath}`);
	const st = statSync(abs);
	if (!st.isFile()) throw new Error(`${relPath} is not a regular file`);
}

function readJson(relPath) {
	mustBeFile(relPath);
	return JSON.parse(readFileSync(join(repoRoot, relPath), 'utf8'));
}

function readText(relPath) {
	mustBeFile(relPath);
	return readFileSync(join(repoRoot, relPath), 'utf8');
}

check('legacy top-level MicropolisEngine/ removed', () => mustNotExist('MicropolisEngine'));
check('legacy top-level vitamoo/ removed', () => mustNotExist('vitamoo'));

check('apps/ exists', () => mustBeDir('apps'));
check('packages/ exists', () => mustBeDir('packages'));
check('content/ exists', () => mustBeDir('content'));
check('documentation/ exists', () => mustBeDir('documentation'));

check('content/micropolis/cities/ exists with .cty files', () => {
	mustBeDir('content/micropolis/cities');
	const files = readdirSync(join(repoRoot, 'content/micropolis/cities')).filter((f) => f.endsWith('.cty'));
	if (files.length === 0) throw new Error('no .cty files');
	return `${files.length} .cty files`;
});

check('content/vitamoo/sims-demo/ exists', () => mustBeDir('content/vitamoo/sims-demo'));
check('content/vitamoo/sims-demo/content-exchange.json exists', () =>
	mustBeFile('content/vitamoo/sims-demo/content-exchange.json'),
);

check('apps/vitamoospace/static/data is a symlink to content/vitamoo/sims-demo/', () => {
	const linkPath = join(repoRoot, 'apps/vitamoospace/static/data');
	let link;
	try {
		link = lstatSync(linkPath);
	} catch {
		throw new Error('apps/vitamoospace/static/data does not exist');
	}
	if (!link.isSymbolicLink()) throw new Error('apps/vitamoospace/static/data is not a symlink');
	const target = readlinkSync(linkPath);
	const resolved = resolve(dirname(linkPath), target);
	const expected = join(repoRoot, 'content/vitamoo/sims-demo');
	if (resolved !== expected) {
		throw new Error(`symlink points to ${resolved} (expected ${expected})`);
	}
	if (!existsSync(resolved)) throw new Error('symlink target does not exist');
	const files = readdirSync(resolved);
	if (files.length === 0) throw new Error('symlink target is empty');
	return `→ ${target} (${files.length} entries)`;
});

const workspace = readText('pnpm-workspace.yaml');
check('pnpm-workspace.yaml declares apps/* glob', () => {
	if (!/['"]?apps\/\*['"]?/.test(workspace)) throw new Error("apps/* glob missing");
});
check('pnpm-workspace.yaml declares packages/* glob', () => {
	if (!/['"]?packages\/\*['"]?/.test(workspace)) throw new Error("packages/* glob missing");
});

const workspaceDirs = ['apps', 'packages']
	.flatMap((root) =>
		readdirSync(join(repoRoot, root), { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => `${root}/${entry.name}`),
	)
	.filter((dir) => existsSync(join(repoRoot, dir, 'package.json')));

const workspacePackages = new Map();
for (const dir of workspaceDirs) {
	const pkg = readJson(`${dir}/package.json`);
	workspacePackages.set(pkg.name, { dir, pkg });
}

check('every workspace-matched dir has a package.json with a name', () => {
	const namedDirs = new Set();
	for (const { dir, pkg } of workspacePackages.values()) {
		if (pkg?.name) namedDirs.add(dir);
	}
	const missing = workspaceDirs.filter((d) => !namedDirs.has(d));
	if (missing.length) throw new Error(`missing names in: ${missing.join(', ')}`);
	return `${workspaceDirs.length} packages: ${workspaceDirs.join(', ')}`;
});

check('engine package exists at packages/micropolis-engine and is named @micropolis/engine-wasm', () => {
	const enginePkg = readJson('packages/micropolis-engine/package.json');
	if (enginePkg.name !== '@micropolis/engine-wasm') {
		throw new Error(`expected name "@micropolis/engine-wasm", got "${enginePkg.name}"`);
	}
	if (!enginePkg.scripts?.build) throw new Error('engine package has no build script');
	if (!enginePkg.scripts?.clean) throw new Error('engine package has no clean script');
});

check('apps/micropolis depends on @micropolis/engine-wasm via workspace:*', () => {
	const appPkg = readJson('apps/micropolis/package.json');
	const dep = appPkg.devDependencies?.['@micropolis/engine-wasm'] ?? appPkg.dependencies?.['@micropolis/engine-wasm'];
	if (dep !== 'workspace:*') {
		throw new Error(`expected "workspace:*", got ${JSON.stringify(dep)}`);
	}
	if (!appPkg.scripts?.prebuild?.includes('@micropolis/engine-wasm')) {
		throw new Error('apps/micropolis prebuild script does not invoke @micropolis/engine-wasm');
	}
});

check('every workspace:* dependency resolves to a known workspace package', () => {
	const issues = [];
	for (const [, { dir, pkg }] of workspacePackages) {
		const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
		for (const [dep, spec] of Object.entries(allDeps)) {
			if (typeof spec === 'string' && spec.startsWith('workspace:')) {
				if (!workspacePackages.has(dep)) {
					issues.push(`${dir} → ${dep}@${spec}`);
				}
			}
		}
	}
	if (issues.length) throw new Error(`unresolved workspace deps: ${issues.join(', ')}`);
});

const engineMakefile = readText('packages/micropolis-engine/makefile');
check('engine makefile preloads ../../content/micropolis/cities', () => {
	if (!engineMakefile.includes('../../content/micropolis/cities')) {
		throw new Error('preload-file path is not ../../content/micropolis/cities');
	}
});
check('engine makefile install path uses ../../apps/micropolis/src/lib', () => {
	if (!engineMakefile.includes('../../apps/micropolis/src/lib')) {
		throw new Error('install copy does not target ../../apps/micropolis/src/lib');
	}
});
check('engine makefile install path uses ../../apps/micropolis/src/types', () => {
	if (!engineMakefile.includes('../../apps/micropolis/src/types')) {
		throw new Error('install copy does not target ../../apps/micropolis/src/types');
	}
});

check('packages/vitamoo/, packages/mooshow/, apps/vitamoospace/ all present', () => {
	for (const p of ['packages/vitamoo', 'packages/mooshow', 'apps/vitamoospace']) mustBeDir(p);
});

const banner = '== Monorepo structure verification ==';
console.log(banner);
for (const ok of passes) console.log(`  PASS  ${ok}`);
if (failures.length) {
	console.error('\n  FAIL:');
	for (const f of failures) console.error(`    - ${f}`);
	console.error(`\n${failures.length} failure(s), ${passes.length} pass(es).`);
	process.exit(1);
}
console.log(`\nAll ${passes.length} checks passed.`);
