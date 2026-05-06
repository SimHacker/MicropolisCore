/**
 * Workspace package export resolution tests.
 *
 * mooshow depends on vitamoo via workspace:*. These tests prove that:
 *
 *  1. The exports field on both packages resolves to real, callable code
 *  2. The public API surface is intact after the monorepo restructure
 *  3. The playing-scene exchange from the real demo content parses correctly
 *
 * Placed here (packages/mooshow) because apps/micropolis does not depend on
 * vitamoo/mooshow and cannot resolve their workspace imports.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
	parseCMX,
	parseSKN,
	assertPlayingSceneExchange,
	isPlayingSceneExchange,
	playingSceneById,
	characterTemplateById,
	buildSkeleton,
	updateTransforms,
} from 'vitamoo';
import { createMooShowStage, MooShowStage } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../');
const exchangePath = path.join(repoRoot, 'content/vitamoo/sims-demo/content-exchange.json');

// ─── vitamoo public API reachable via exports field ──────────────────────────

describe('vitamoo exports field resolution', () => {
	it('parseCMX is a function', () => {
		expect(typeof parseCMX).toBe('function');
	});

	it('parseSKN is a function', () => {
		expect(typeof parseSKN).toBe('function');
	});

	it('assertPlayingSceneExchange is a function', () => {
		expect(typeof assertPlayingSceneExchange).toBe('function');
	});

	it('buildSkeleton is a function', () => {
		expect(typeof buildSkeleton).toBe('function');
	});

	it('updateTransforms is a function', () => {
		expect(typeof updateTransforms).toBe('function');
	});
});

// ─── mooshow public API ───────────────────────────────────────────────────────

describe('mooshow exports field resolution', () => {
	it('createMooShowStage is a function', () => {
		expect(typeof createMooShowStage).toBe('function');
	});

	it('MooShowStage class is exported', () => {
		expect(typeof MooShowStage).toBe('function');
	});
});

// ─── playing-scene exchange validation against real demo data ─────────────────

describe('real content-exchange.json parses through vitamoo schema', () => {
	it('content-exchange.json exists at content/vitamoo/sims-demo/', () => {
		expect(existsSync(exchangePath)).toBe(true);
	});

	it('content-exchange.json is valid JSON', () => {
		const raw = JSON.parse(readFileSync(exchangePath, 'utf8'));
		expect(raw).toBeTruthy();
	});

	it('content-exchange.json passes isPlayingSceneExchange guard', () => {
		const raw = JSON.parse(readFileSync(exchangePath, 'utf8'));
		expect(isPlayingSceneExchange(raw)).toBe(true);
	});

	it('assertPlayingSceneExchange does not throw on real data', () => {
		const raw = JSON.parse(readFileSync(exchangePath, 'utf8'));
		expect(() => assertPlayingSceneExchange(raw)).not.toThrow();
	});

	it('has 14 character templates and 7 scenes', () => {
		const raw = JSON.parse(readFileSync(exchangePath, 'utf8'));
		assertPlayingSceneExchange(raw);
		expect(raw.characterTemplates).toHaveLength(14);
		expect(raw.playingScenes).toHaveLength(7);
	});

	it('playingSceneById builds an id→scene Map from the demo scenes', () => {
		const raw = JSON.parse(readFileSync(exchangePath, 'utf8'));
		assertPlayingSceneExchange(raw);
		const byId = playingSceneById(raw.playingScenes);
		expect(byId.size).toBe(raw.playingScenes.length);
		const firstId = raw.playingScenes[0]!.id;
		expect(byId.get(firstId)?.id).toBe(firstId);
		expect(byId.get('__nope__')).toBeUndefined();
	});

	it('characterTemplateById builds an id→template Map from the demo templates', () => {
		const raw = JSON.parse(readFileSync(exchangePath, 'utf8'));
		assertPlayingSceneExchange(raw);
		const byId = characterTemplateById(raw.characterTemplates);
		expect(byId.size).toBe(raw.characterTemplates.length);
		const firstId = raw.characterTemplates[0]!.id;
		expect(byId.get(firstId)?.id).toBe(firstId);
		expect(byId.get('__nope__')).toBeUndefined();
	});

	it('schema rejects an empty object', () => {
		expect(isPlayingSceneExchange({})).toBe(false);
		expect(() => assertPlayingSceneExchange({})).toThrow();
	});
});
