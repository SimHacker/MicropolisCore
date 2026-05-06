<script lang="ts">
	import '../styles/viewer-legacy.css';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import {
		createMooShowStage,
		type MooShowStage,
		type CharacterDef,
		type SceneDef,
		type KeyAction,
	} from 'mooshow';
	import DebugPanel from './DebugPanel.svelte';
	import {
		ROOT_CONTENT_OPTIONS as DEFAULT_ROOT_CONTENT_OPTIONS,
		ROOT_TYPE_LOCAL_PATH,
	} from '$lib/shared/root-catalog';

	type DemoPack = { id: string; label: string; indexUrl: string };
	const DEMO_PACKS: DemoPack[] = [
		{
			id: 'exchange',
			label: 'VitaMoo demo (exchange + assets)',
			indexUrl: 'content-exchange.json',
		},
	];

	type RootContentType = string;
	type RootPermissionStatus = 'granted' | 'expired' | 'unknown';
	type CatalogKind = 'all' | 'file' | 'container' | 'object' | 'chunk' | 'issue';
	type RootContentMap = Record<string, boolean>;
	type CatalogRefKind = 'file' | 'container' | 'object' | 'chunk' | 'issue';

	interface CatalogRef {
		kind: CatalogRefKind;
		id: string;
	}

	type RootDiscoveryBucketMap = Record<string, CatalogRef[]>;

	interface RootDiscoveryBuckets {
		byContentType: RootDiscoveryBucketMap;
		byObjectKind: RootDiscoveryBucketMap;
	}

	interface RootContentSelection {
		all: boolean;
		types: RootContentMap;
	}

	interface ScanRoot {
		id: string;
		rootType: string;
		rootMetadata: Record<string, unknown>;
		name: string;
		description: string;
		path: string;
		enabled: boolean;
		addedAt: string;
		contentSelection: RootContentSelection;
		discoveryBuckets: RootDiscoveryBuckets;
		permissionStatus: RootPermissionStatus;
		permissionProvider: 'node-path' | 'file-system-access' | 'manual';
		permissionTokenId: string | null;
		permissionGrantedAt: string | null;
		permissionExpiresAt: string | null;
		lastScannedAt: string | null;
	}

	interface ScanRunSummary {
		rootCount: number;
		scannedFileCount: number;
		skippedDisabledCount: number;
		containerCount: number;
		objectCount: number;
		chunkCount: number;
		issueCount: number;
	}

	interface ScanRun {
		id: string;
		status: 'running' | 'completed' | 'failed';
		startedAt: string;
		finishedAt: string | null;
		rootIds: string[];
		summary: ScanRunSummary;
		errorMessage: string | null;
	}

	interface CatalogRow {
		id: string;
		rootId: string;
		kind: CatalogKind;
		path: string;
		name: string;
		[key: string]: unknown;
	}

	interface CatalogResponse {
		rows: CatalogRow[];
		total: number;
		offset: number;
		limit: number;
	}

	const ROOT_CONTENT_OPTIONS = DEFAULT_ROOT_CONTENT_OPTIONS;

	const CATALOG_KIND_OPTIONS: { value: CatalogKind; label: string }[] = [
		{ value: 'all', label: 'All rows' },
		{ value: 'file', label: 'Files' },
		{ value: 'container', label: 'Containers' },
		{ value: 'object', label: 'Objects' },
		{ value: 'chunk', label: 'Chunks' },
		{ value: 'issue', label: 'Issues' }
	];

	function emptyRootContentMap(): RootContentMap {
		const next: RootContentMap = {};
		for (const option of ROOT_CONTENT_OPTIONS) {
			next[option.value] = false;
		}
		return next;
	}

	const SKILL_BLACKLIST = [
		'twiststart',
		'twiststop',
		'-start',
		'-stop',
		'-walkon',
		'-walkoff',
		'-divein',
		'-jumpin',
		'a2o-stand',
		'c2o-',
	];

	const LOADING_MESSAGES = [
		'Reticulating Splines...',
		'Adjusting Emotional Weights...',
		'Calibrating Personality Matrix...',
		'Compressing Sim Genomes...',
		'Calculating Snowfall Coefficients...',
		'Tokenizing Elf Language...',
		'Possessing Animate Objects...',
		'Inserting Alarm Clock...',
		'Computing Optimal Bin Packing...',
		'Preparing Neighborly Greetings...',
		'Simmifying Name Savant...',
		'Synthesizing Gravity...',
		'Collecting Bonus Diamonds...',
		'Loading Lovingly Handcrafted Sims...',
		'Applying Alarm Clock Patch...',
		'Fabricating Social Constructs...',
		'Convincing Sims They Have Free Will...',
		'Polishing Countertop Surfaces...',
		'Debugging Dream Sequences...',
		'Unbarricading Elevator...',
		'Reconfiguring Vertical Transporter...',
		'Priming Geodesic Abreaction...',
		'Lecturing Errant Unicorns...',
		'Pressurizing Fruit Punch...',
	];

	function filterSkillNames(names: string[]): string[] {
		return names.filter((name) => {
			const l = name.toLowerCase();
			return !SKILL_BLACKLIST.some((b) => l.includes(b));
		});
	}

	function activeSkillName(body: { practices?: { skill?: { name?: string } }[] }): string | undefined {
		const p = body.practices?.[0];
		return p?.skill?.name;
	}

	function matchSkillValue(want: string, options: string[]): string {
		if (!want) return '';
		if (options.includes(want)) return want;
		const lower = want.toLowerCase();
		for (const o of options) {
			if (o.toLowerCase() === lower) return o;
		}
		for (const o of options) {
			if (!o) continue;
			const ol = o.toLowerCase();
			if (ol.includes(lower) || lower.includes(ol)) return o;
		}
		return '';
	}

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let errorMsg = $state<string | null>(null);

	let uiReady = $state(false);
	let loadText = $state('Loading VitaMoo...');
	let overlayDone = $state(false);
	type SidebarTab = 'demo' | 'roots' | 'catalog' | 'help' | 'debug';
	const SIDEBAR_TAB_ORDER: SidebarTab[] = ['demo', 'roots', 'catalog', 'help', 'debug'];
	let sidebarTab = $state<SidebarTab>('demo');
	let sidebarWidth = $state(280);
	let sidebarCollapsed = $state(false);
	let bottomBarCollapsed = $state(false);
	let sidebarResize = $state<{ startX: number; startW: number } | null>(null);

	function toggleSidebarCollapsed() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	function toggleBottomBarCollapsed() {
		bottomBarCollapsed = !bottomBarCollapsed;
	}

	function setSidebarTab(tab: SidebarTab): void {
		sidebarTab = tab;
	}

	function focusSidebarTab(tab: SidebarTab): void {
		if (typeof document === 'undefined') return;
		const button = document.getElementById(`sidebar-tab-${tab}`);
		if (button instanceof HTMLElement) {
			button.focus();
		}
	}

	function handleSidebarTabKeydown(e: KeyboardEvent, tab: SidebarTab): void {
		const currentIndex = SIDEBAR_TAB_ORDER.indexOf(tab);
		if (currentIndex < 0) return;
		let nextIndex = currentIndex;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			nextIndex = (currentIndex + 1) % SIDEBAR_TAB_ORDER.length;
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			nextIndex = (currentIndex - 1 + SIDEBAR_TAB_ORDER.length) % SIDEBAR_TAB_ORDER.length;
		} else if (e.key === 'Home') {
			nextIndex = 0;
		} else if (e.key === 'End') {
			nextIndex = SIDEBAR_TAB_ORDER.length - 1;
		} else {
			return;
		}
		e.preventDefault();
		const nextTab = SIDEBAR_TAB_ORDER[nextIndex] ?? SIDEBAR_TAB_ORDER[0];
		if (!nextTab) return;
		setSidebarTab(nextTab);
		focusSidebarTab(nextTab);
	}

	function clampSidebarWidth(width: number): number {
		return Math.min(560, Math.max(200, width));
	}

	function nudgeSidebarWidth(delta: number): void {
		if (sidebarCollapsed) {
			sidebarCollapsed = false;
		}
		sidebarWidth = clampSidebarWidth(sidebarWidth + delta);
	}

	function setSidebarWidthToBound(bound: 'min' | 'max'): void {
		if (sidebarCollapsed) {
			sidebarCollapsed = false;
		}
		sidebarWidth = bound === 'min' ? 200 : 560;
	}

	function beginSidebarResize(e: MouseEvent) {
		e.preventDefault();
		if (sidebarCollapsed) {
			sidebarCollapsed = false;
		}
		sidebarResize = { startX: e.clientX, startW: sidebarWidth };
		window.addEventListener('mousemove', moveSidebarResize);
		window.addEventListener('mouseup', endSidebarResize);
	}

	function moveSidebarResize(e: MouseEvent) {
		const d = sidebarResize;
		if (!d) return;
		const next = d.startW + (e.clientX - d.startX);
		sidebarWidth = clampSidebarWidth(next);
	}

	function endSidebarResize() {
		sidebarResize = null;
		window.removeEventListener('mousemove', moveSidebarResize);
		window.removeEventListener('mouseup', endSidebarResize);
	}

	function handleSidebarResizeKeydown(e: KeyboardEvent): void {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			nudgeSidebarWidth(-16);
			return;
		}
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			nudgeSidebarWidth(16);
			return;
		}
		if (e.key === 'Home') {
			e.preventDefault();
			setSidebarWidthToBound('min');
			return;
		}
		if (e.key === 'End') {
			e.preventDefault();
			setSidebarWidthToBound('max');
		}
	}

	$effect(() => {
		return () => {
			window.removeEventListener('mousemove', moveSidebarResize);
			window.removeEventListener('mouseup', endSidebarResize);
		};
	});

	$effect(() => {
		if (!uiReady) return;
		void sidebarCollapsed;
		void sidebarWidth;
		void bottomBarCollapsed;
		const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
		return () => cancelAnimationFrame(id);
	});

	let scenesList = $state<SceneDef[]>([]);
	let charactersList = $state<CharacterDef[]>([]);
	let animationList = $state<string[]>([]);
	let packVal = $state(DEMO_PACKS[0].id);
	/** Last pack that loaded successfully; used to revert UI and re-fetch after a failed switch. */
	let lastGoodPackId = $state(DEMO_PACKS[0].id);
	let packBusy = $state(false);

	let sceneVal = $state('0');
	let actorSelValue = $state('-1');
	let charSelValue = $state('');
	let animSelValue = $state('');

	let showActorGroup = $state(false);
	let actorOptions = $state<{ value: string; label: string }[]>([]);

	let charPlaceholder = $state('-- all --');
	let animPlaceholder = $state('-- all --');

	let rotY = $state(30);
	let rotX = $state(15);
	let zoom = $state(160);
	let speed = $state(100);

	let distFarActive = $state(false);
	let distMedActive = $state(true);
	let distNearActive = $state(false);

	let pauseLabel = $state('Pause');
	let pauseActive = $state(false);

	let stageRef = $state<MooShowStage | null>(null);
	let filesApiError = $state<string | null>(null);
	let filesBusy = $state(false);
	let scanRoots = $state<ScanRoot[]>([]);
	let rootPathInput = $state('');
	let rootNameInput = $state('');
	let rootDescriptionInput = $state('');
	let rootContentAllInput = $state(true);
	let rootContentTypesInput = $state<RootContentMap>(emptyRootContentMap());
	let scanRun = $state<ScanRun | null>(null);
	let editingRootId = $state<string | null>(null);
	let editRootNameInput = $state('');
	let editRootDescriptionInput = $state('');
	let editRootContentAllInput = $state(true);
	let editRootContentTypesInput = $state<RootContentMap>(emptyRootContentMap());
	let catalogRows = $state<CatalogRow[]>([]);
	let catalogKind = $state<CatalogKind>('all');
	let catalogRootId = $state('all');
	let catalogObjectKind = $state('all');
	let catalogText = $state('');
	let catalogBusy = $state(false);
	let catalogTotal = $state(0);
	let catalogOffset = $state(0);
	let catalogLimit = $state(100);

	function apiPath(pathname: string): string {
		const root = (base || '').replace(/\/$/, '');
		return `${root}${pathname}`;
	}

	function errorMessageFromUnknown(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}

	async function requestJson<T>(pathname: string, init?: RequestInit): Promise<T> {
		const headers = new Headers(init?.headers);
		if (init?.body && !headers.has('content-type')) {
			headers.set('content-type', 'application/json');
		}
		const response = await fetch(apiPath(pathname), { ...init, headers });
		let payload: unknown = null;
		try {
			payload = await response.json();
		} catch {
			// Keep payload null; response status handling below still applies.
		}
		if (!response.ok) {
			let msg = `${response.status} ${response.statusText}`;
			if (payload && typeof payload === 'object' && 'error' in payload) {
				msg = String((payload as { error: unknown }).error);
			}
			throw new Error(msg);
		}
		return payload as T;
	}

	async function refreshScanRoots(): Promise<void> {
		filesBusy = true;
		try {
			const result = await requestJson<{ roots: ScanRoot[] }>('/api/files/roots');
			scanRoots = result.roots;
			filesApiError = null;
		} catch (error) {
			filesApiError = `Roots API unavailable: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	function cloneContentMap(source: RootContentMap): RootContentMap {
		const next: RootContentMap = {};
		for (const [type, enabled] of Object.entries(source)) {
			if (typeof enabled === 'boolean') next[type] = enabled;
		}
		for (const option of ROOT_CONTENT_OPTIONS) {
			if (next[option.value] === undefined) next[option.value] = false;
		}
		return next;
	}

	function selectedContentLabelList(selection: RootContentSelection): string {
		if (selection.all) return 'All';
		const labels: string[] = [];
		for (const option of ROOT_CONTENT_OPTIONS) {
			if (selection.types[option.value]) labels.push(option.label);
		}
		return labels.length > 0 ? labels.join(', ') : '(none)';
	}

	function discoveryBucketCount(map: RootDiscoveryBucketMap, key: string): number {
		const rows = map[key];
		return Array.isArray(rows) ? rows.length : 0;
	}

	function detectedContentLabelList(root: ScanRoot): string {
		const labels: string[] = [];
		for (const option of ROOT_CONTENT_OPTIONS) {
			const count = discoveryBucketCount(root.discoveryBuckets.byContentType, option.value);
			if (count > 0) labels.push(`${option.label}: ${count}`);
		}
		return labels.length > 0 ? labels.join(', ') : '(none discovered yet)';
	}

	function objectKindCountRows(root: ScanRoot): { kind: string; count: number }[] {
		const rows: { kind: string; count: number }[] = [];
		for (const [kind, refs] of Object.entries(root.discoveryBuckets.byObjectKind)) {
			const count = Array.isArray(refs) ? refs.length : 0;
			if (count > 0) rows.push({ kind, count });
		}
		rows.sort((a, b) => {
			const byCount = b.count - a.count;
			if (byCount !== 0) return byCount;
			return a.kind.localeCompare(b.kind);
		});
		return rows;
	}

	function objectKindRowsShown(root: ScanRoot, limit = 8): { kind: string; count: number }[] {
		return objectKindCountRows(root).slice(0, limit);
	}

	function objectKindOverflowCount(root: ScanRoot, limit = 8): number {
		const total = objectKindCountRows(root).length;
		return total > limit ? total - limit : 0;
	}

	function setCreateRootAll(checked: boolean): void {
		rootContentAllInput = checked;
	}

	function setCreateRootType(type: RootContentType, checked: boolean): void {
		rootContentTypesInput = { ...rootContentTypesInput, [type]: checked };
	}

	function setEditRootAll(checked: boolean): void {
		editRootContentAllInput = checked;
	}

	function setEditRootType(type: RootContentType, checked: boolean): void {
		editRootContentTypesInput = { ...editRootContentTypesInput, [type]: checked };
	}

	function clearRootCreateForm(): void {
		rootPathInput = '';
		rootNameInput = '';
		rootDescriptionInput = '';
		rootContentAllInput = true;
		rootContentTypesInput = emptyRootContentMap();
	}

	async function addScanRoot(): Promise<void> {
		const pathText = rootPathInput.trim();
		if (!pathText) return;
		filesBusy = true;
		try {
			await requestJson<{ root: ScanRoot }>('/api/files/roots', {
				method: 'POST',
				body: JSON.stringify({
					path: pathText,
					rootType: ROOT_TYPE_LOCAL_PATH,
					name: rootNameInput.trim(),
					description: rootDescriptionInput.trim(),
					contentSelection: {
						all: rootContentAllInput,
						types: rootContentTypesInput,
					},
				})
			});
			clearRootCreateForm();
			await refreshScanRoots();
		} catch (error) {
			filesApiError = `Add root failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	async function removeScanRoot(rootId: string): Promise<void> {
		filesBusy = true;
		try {
			await requestJson<{ ok: boolean }>(`/api/files/roots/${encodeURIComponent(rootId)}`, {
				method: 'DELETE'
			});
			await refreshScanRoots();
			if (catalogRootId === rootId) catalogRootId = 'all';
			await refreshCatalogRows(true);
		} catch (error) {
			filesApiError = `Remove root failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	async function toggleScanRootEnabled(root: ScanRoot): Promise<void> {
		filesBusy = true;
		try {
			await requestJson<{ root: ScanRoot }>(`/api/files/roots/${encodeURIComponent(root.id)}`, {
				method: 'PATCH',
				body: JSON.stringify({ enabled: !root.enabled })
			});
			await refreshScanRoots();
		} catch (error) {
			filesApiError = `Update root failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	function beginEditRoot(root: ScanRoot): void {
		editingRootId = root.id;
		editRootNameInput = root.name;
		editRootDescriptionInput = root.description;
		editRootContentAllInput = root.contentSelection.all;
		editRootContentTypesInput = cloneContentMap(root.contentSelection.types);
	}

	function cancelEditRoot(): void {
		editingRootId = null;
		editRootNameInput = '';
		editRootDescriptionInput = '';
		editRootContentAllInput = true;
		editRootContentTypesInput = emptyRootContentMap();
	}

	async function saveEditRoot(): Promise<void> {
		if (!editingRootId) return;
		filesBusy = true;
		try {
			await requestJson<{ root: ScanRoot }>(`/api/files/roots/${encodeURIComponent(editingRootId)}`, {
				method: 'PATCH',
				body: JSON.stringify({
					name: editRootNameInput.trim(),
					description: editRootDescriptionInput.trim(),
					contentSelection: {
						all: editRootContentAllInput,
						types: editRootContentTypesInput,
					},
				})
			});
			await refreshScanRoots();
			cancelEditRoot();
		} catch (error) {
			filesApiError = `Root update failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	async function runInventoryScanForRootIds(rootIds: string[]): Promise<void> {
		if (rootIds.length === 0) {
			filesApiError = 'Enable at least one root before scanning.';
			return;
		}
		filesBusy = true;
		try {
			const result = await requestJson<{ run: ScanRun }>('/api/files/scan', {
				method: 'POST',
				body: JSON.stringify({ rootIds })
			});
			scanRun = result.run;
			filesApiError = null;
			await refreshScanRoots();
			await refreshCatalogRows(true);
		} catch (error) {
			filesApiError = `Scan failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	async function runInventoryScan(): Promise<void> {
		const enabledRootIds = scanRoots.filter((row) => row.enabled).map((row) => row.id);
		await runInventoryScanForRootIds(enabledRootIds);
	}

	async function rescanSingleRoot(rootId: string): Promise<void> {
		await runInventoryScanForRootIds([rootId]);
	}

	async function regrantRootPermission(rootId: string): Promise<void> {
		filesBusy = true;
		try {
			await requestJson<{ root: ScanRoot }>(
				`/api/files/roots/${encodeURIComponent(rootId)}/regrant`,
				{ method: 'POST' },
			);
			await refreshScanRoots();
		} catch (error) {
			filesApiError = `Re-grant failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	async function refreshScanRun(): Promise<void> {
		if (!scanRun) return;
		filesBusy = true;
		try {
			const result = await requestJson<{ run: ScanRun }>(
				`/api/files/scan/${encodeURIComponent(scanRun.id)}`
			);
			scanRun = result.run;
			filesApiError = null;
		} catch (error) {
			filesApiError = `Scan refresh failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			filesBusy = false;
		}
	}

	function catalogPathPreview(row: CatalogRow): string {
		return row.path.length > 96 ? `${row.path.slice(0, 93)}...` : row.path;
	}

	function rootDisplayName(rootId: string): string {
		const root = scanRoots.find((row) => row.id === rootId);
		if (!root) return rootId;
		return root.name;
	}

	function rootPermissionSummary(root: ScanRoot): string {
		return `${root.permissionStatus} (${root.permissionProvider})`;
	}

	async function jumpToCatalogObjectKind(rootId: string, objectKind: string): Promise<void> {
		sidebarTab = 'catalog';
		catalogRootId = rootId;
		catalogKind = 'object';
		catalogObjectKind = objectKind;
		catalogText = '';
		await refreshCatalogRows(true);
	}

	function catalogKindSupportsObjectKindFilter(): boolean {
		return catalogKind === 'all' || catalogKind === 'object';
	}

	function catalogObjectKindOptions(): string[] {
		const kinds = new Set<string>();
		for (const root of scanRoots) {
			if (catalogRootId !== 'all' && root.id !== catalogRootId) continue;
			for (const [kind, refs] of Object.entries(root.discoveryBuckets.byObjectKind)) {
				if (!Array.isArray(refs) || refs.length === 0) continue;
				kinds.add(kind);
			}
		}
		return Array.from(kinds).sort((a, b) => a.localeCompare(b));
	}

	$effect(() => {
		void catalogKind;
		void catalogRootId;
		void scanRoots;
		if (!catalogKindSupportsObjectKindFilter()) {
			if (catalogObjectKind !== 'all') catalogObjectKind = 'all';
			return;
		}
		const options = catalogObjectKindOptions();
		if (catalogObjectKind !== 'all' && !options.includes(catalogObjectKind)) {
			catalogObjectKind = 'all';
		}
	});

	async function refreshCatalogRows(resetOffset = false): Promise<void> {
		if (resetOffset) catalogOffset = 0;
		catalogBusy = true;
		try {
			const params = new URLSearchParams();
			params.set('rootId', catalogRootId);
			params.set('kind', catalogKind);
			if (catalogKindSupportsObjectKindFilter() && catalogObjectKind !== 'all') {
				params.set('objectKind', catalogObjectKind);
			}
			params.set('text', catalogText);
			params.set('offset', String(catalogOffset));
			params.set('limit', String(catalogLimit));
			const result = await requestJson<CatalogResponse>(`/api/files/catalog?${params.toString()}`);
			catalogRows = result.rows;
			catalogTotal = result.total;
			catalogOffset = result.offset;
			catalogLimit = result.limit;
			filesApiError = null;
		} catch (error) {
			filesApiError = `Catalog query failed: ${errorMessageFromUnknown(error)}`;
		} finally {
			catalogBusy = false;
		}
	}

	async function catalogPage(delta: number): Promise<void> {
		const nextOffset = Math.max(0, catalogOffset + delta * catalogLimit);
		if (nextOffset >= catalogTotal && delta > 0) return;
		catalogOffset = nextOffset;
		await refreshCatalogRows(false);
	}

	function applyDistBtnClasses(which: 'far' | 'medium' | 'near') {
		distFarActive = which === 'far';
		distMedActive = which === 'medium';
		distNearActive = which === 'near';
	}

	function setDistance(s: MooShowStage, preset: 'far' | 'medium' | 'near') {
		switch (preset) {
			case 'far':
				zoom = 300;
				break;
			case 'medium':
				zoom = 140;
				break;
			case 'near':
				zoom = 70;
				break;
		}
		s.spin.zoom = zoom;
		applyDistBtnClasses(preset);
		s.render();
	}

	function syncPauseUi(s: MooShowStage) {
		pauseActive = s.paused;
		pauseLabel = s.paused ? 'Play' : 'Pause';
	}

	function pushSpinToStage(s: MooShowStage) {
		s.spin.rotY = rotY;
		s.spin.rotX = rotX;
		s.spin.zoom = zoom;
		s.speedScale = speed / 100;
		s.render();
	}

	/** Range inputs use `value={…}` + oninput so wheel/drag orbit sync updates the thumb (Svelte bind:value can miss external updates). */
	function onRotYRangeInput(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).valueAsNumber;
		rotY = v;
		if (stageRef) pushSpinToStage(stageRef);
	}

	function onRotXRangeInput(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).valueAsNumber;
		rotX = v;
		if (stageRef) pushSpinToStage(stageRef);
	}

	function onZoomRangeInput(e: Event) {
		const z = (e.currentTarget as HTMLInputElement).valueAsNumber;
		zoom = z;
		if (stageRef) {
			stageRef.spin.zoom = z;
			distFarActive = false;
			distMedActive = false;
			distNearActive = false;
			stageRef.render();
		}
	}

	function rebuildActorOptions(s: MooShowStage) {
		const bodies = s.bodies;
		const opts: { value: string; label: string }[] = [];
		if (bodies.length > 1) {
			opts.push({ value: '-1', label: `All persons (${bodies.length})` });
		}
		for (let i = 0; i < bodies.length; i++) {
			opts.push({ value: String(i), label: bodies[i].actorName || `Person ${i + 1}` });
		}
		actorOptions = opts;
		showActorGroup = bodies.length > 0;

		if (bodies.length === 1) {
			actorSelValue = '0';
		} else if (bodies.length > 1) {
			actorSelValue = String(s.selectedActor);
		}
	}

	function syncEditingFromStage(s: MooShowStage) {
		const bodies = s.bodies;
		const chars = charactersList;
		const anims = animationList;
		const sel = s.selectedActor;

		if (!s.activeScene || bodies.length === 0) {
			charPlaceholder = '-- all --';
			animPlaceholder = '-- all --';
			return;
		}

		if (sel >= 0 && sel < bodies.length) {
			const body = bodies[sel];
			charPlaceholder = '-- all --';
			animPlaceholder = '-- all --';
			if (body?.personData && chars.length) {
				const ci = chars.findIndex((c) => c.name === body.personData.name);
				if (ci >= 0) charSelValue = String(ci);
			}
			const sk = activeSkillName(body);
			if (sk) {
				const m = matchSkillValue(sk, anims);
				if (m) animSelValue = m;
			}
		} else {
			const firstChar = bodies[0]?.personData?.name;
			const allSameChar = bodies.every((b) => b.personData?.name === firstChar);
			if (allSameChar && firstChar && chars.length) {
				const ci = chars.findIndex((c) => c.name === firstChar);
				charSelValue = ci >= 0 ? String(ci) : '';
				charPlaceholder = '-- all --';
			} else {
				charSelValue = '';
				charPlaceholder = '-- many --';
			}
			const firstAnim = bodies[0] ? activeSkillName(bodies[0]) : undefined;
			const allSameAnim = bodies.every((b) => activeSkillName(b) === firstAnim);
			if (allSameAnim && firstAnim) {
				const m = matchSkillValue(firstAnim, anims);
				animSelValue = m || '';
				animPlaceholder = '-- all --';
			} else {
				animSelValue = '';
				animPlaceholder = '-- many --';
			}
		}
	}

	async function afterPackLoaded(s: MooShowStage) {
		scenesList = [...s.scenes];
		charactersList = [...s.characters];
		animationList = filterSkillNames([...s.skillNames]).sort((a, b) => a.localeCompare(b));
		const si = scenesList.length > 1 ? 1 : 0;
		sceneVal = String(si);
		await s.setScene(si);
		rebuildActorOptions(s);
		syncEditingFromStage(s);
	}

	async function applyDemoPack(s: MooShowStage) {
		const pack = DEMO_PACKS.find((p) => p.id === packVal);
		if (!pack) return;
		const previousGood = lastGoodPackId;
		packBusy = true;
		errorMsg = null;
		try {
			await s.loadContentIndex(pack.indexUrl, (msg) => {
				loadText = msg;
			});
			await afterPackLoaded(s);
			lastGoodPackId = pack.id;
		} catch (e) {
			const primary = e instanceof Error ? e.message : String(e);
			packVal = previousGood;
			const restore = DEMO_PACKS.find((p) => p.id === previousGood);
			if (restore && restore.indexUrl !== pack.indexUrl) {
				try {
					await s.loadContentIndex(restore.indexUrl, () => {});
					await afterPackLoaded(s);
					errorMsg = `Could not load ${pack.label}. ${primary} Restored ${restore.label}.`;
				} catch (e2) {
					errorMsg = `${primary} (could not restore prior pack: ${e2 instanceof Error ? e2.message : String(e2)})`;
					s.render();
					return;
				}
			} else {
				errorMsg = primary;
			}
		} finally {
			packBusy = false;
			loadText = '';
		}
		s.render();
	}

	async function onScenePick(s: MooShowStage) {
		const idx = parseInt(sceneVal, 10);
		if (isNaN(idx)) return;
		await s.setScene(idx);
		rebuildActorOptions(s);
		syncEditingFromStage(s);
		s.render();
	}

	async function stepScene(s: MooShowStage, dir: number) {
		const n = scenesList.length;
		if (n <= 1) return;
		let idx = parseInt(sceneVal, 10);
		if (isNaN(idx)) idx = 0;
		idx = (idx + dir + n) % n;
		sceneVal = String(idx);
		await onScenePick(s);
	}

	function onActorPick(s: MooShowStage) {
		const idx = parseInt(actorSelValue, 10);
		if (isNaN(idx)) return;
		s.selectActor(idx);
		actorSelValue = String(idx);
		syncEditingFromStage(s);
		s.render();
	}

	function stepActor(s: MooShowStage, dir: number) {
		const bodies = s.bodies;
		if (bodies.length === 0) return;
		const minIdx = bodies.length > 1 ? -1 : 0;
		let idx = parseInt(actorSelValue, 10);
		if (isNaN(idx)) idx = minIdx;
		idx += dir;
		if (idx < minIdx) idx = bodies.length - 1;
		if (idx >= bodies.length) idx = minIdx;
		actorSelValue = String(idx);
		s.selectActor(idx);
		syncEditingFromStage(s);
		s.render();
	}

	async function applyCharChange(s: MooShowStage, charIdx: number) {
		const inScene = s.activeScene !== null;
		const sel = s.selectedActor;
		if (inScene && sel >= 0) {
			await s.replaceActorCharacter(sel, charIdx);
		} else if (inScene && sel < 0) {
			for (let i = 0; i < s.bodies.length; i++) {
				await s.replaceActorCharacter(i, charIdx);
			}
		} else {
			await s.setCharacterSolo(charIdx);
			rebuildActorOptions(s);
		}
		syncEditingFromStage(s);
		s.render();
	}

	async function onCharacterChange(s: MooShowStage) {
		const idx = parseInt(charSelValue, 10);
		if (isNaN(idx)) return;
		await applyCharChange(s, idx);
	}

	async function stepCharacter(s: MooShowStage, dir: number) {
		const chars = charactersList;
		if (!chars.length) return;
		let idx = parseInt(charSelValue, 10);
		if (isNaN(idx)) idx = dir > 0 ? 0 : chars.length - 1;
		else idx = (idx + dir + chars.length) % chars.length;
		charSelValue = String(idx);
		await applyCharChange(s, idx);
	}

	async function applyAnimPick(s: MooShowStage) {
		const name = animSelValue;
		if (!name) return;
		const inScene = s.activeScene !== null;
		const sel = s.selectedActor;
		if (inScene && sel >= 0) await s.setAnimation(name, sel);
		else await s.setAnimation(name);
		syncEditingFromStage(s);
	}

	async function stepAnimation(s: MooShowStage, dir: number) {
		const list = animationList;
		if (list.length === 0) return;
		let i = list.indexOf(animSelValue);
		if (i < 0) i = dir > 0 ? 0 : list.length - 1;
		else {
			i += dir;
			if (i < 0) i = list.length - 1;
			if (i >= list.length) i = 0;
		}
		animSelValue = list[i];
		await applyAnimPick(s);
	}

	function togglePause() {
		const s = stageRef;
		if (!s) return;
		s.togglePause();
		syncPauseUi(s);
	}

	function handleKeyAction(s: MooShowStage, action: KeyAction, value?: number) {
		switch (action) {
			case 'stepSceneNext':
				void stepScene(s, 1);
				break;
			case 'stepScenePrev':
				void stepScene(s, -1);
				break;
			case 'stepActorNext':
				stepActor(s, 1);
				break;
			case 'stepActorPrev':
				stepActor(s, -1);
				break;
			case 'stepCharacterNext':
				void stepCharacter(s, 1);
				break;
			case 'stepCharacterPrev':
				void stepCharacter(s, -1);
				break;
			case 'stepAnimationNext':
				void stepAnimation(s, 1);
				break;
			case 'stepAnimationPrev':
				void stepAnimation(s, -1);
				break;
			case 'togglePause':
				syncPauseUi(s);
				break;
			case 'setSpeed':
				if (value !== undefined) speed = value;
				syncPauseUi(s);
				break;
			default:
				break;
		}
	}

	onMount(() => {
		let cancelled = false;
		let stage: MooShowStage | null = null;
		let msgInterval: ReturnType<typeof setInterval> | null = null;

		void refreshScanRoots();
		void refreshCatalogRows(true);

		const pathRoot = (base || '').replace(/\/$/, '');
		const assetsBaseUrl = `${pathRoot}/data/`;

		(async () => {
			const el = canvasEl;
			if (!el) {
				errorMsg = 'Canvas not ready.';
				return;
			}
			const webgpu = (navigator as Navigator & { gpu?: unknown }).gpu;
			if (!webgpu) {
				errorMsg =
					'WebGPU is not available. Use a supported browser (e.g. current Chrome or Edge) with hardware acceleration enabled.';
				return;
			}

			let msgIdx = 0;
			loadText = LOADING_MESSAGES[0] ?? 'Loading VitaMoo...';
			msgInterval = setInterval(() => {
				msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
				loadText = LOADING_MESSAGES[msgIdx] ?? loadText;
			}, 800);

			try {
				stage = createMooShowStage({
					canvas: el,
					assetsBaseUrl,
					characterPipeline: { animation: 'gpu', deformation: 'gpu' },
					hooks: {
						onOrbitViewChange: (s) => {
							if (cancelled) return;
							rotY = Math.round(s.rotY);
							rotX = Math.round(s.rotX);
							zoom = Math.round(s.zoom);
						},
						onKeyAction: (action, v) => {
							if (stage) handleKeyAction(stage, action, v);
						},
						onSelectionChange: () => {
							if (!stage) return;
							const bodies = stage.bodies;
							if (bodies.length > 1) {
								actorSelValue = String(stage.selectedActor);
							}
							syncEditingFromStage(stage);
						},
					},
				});
				stageRef = stage;

				if (cancelled) {
					stage.destroy();
					return;
				}

				const initialPack = DEMO_PACKS.find((p) => p.id === packVal) ?? DEMO_PACKS[0];
				await stage.loadContentIndex(initialPack.indexUrl, (msg) => {
					if (!cancelled) loadText = msg;
				});

				if (cancelled) {
					stage.destroy();
					return;
				}

				await afterPackLoaded(stage);
				lastGoodPackId = initialPack.id;

				if (cancelled) {
					stage.destroy();
					return;
				}

				stage.spin.rotY = rotY;
				stage.spin.rotX = rotX;
				stage.spin.zoom = zoom;
				stage.speedScale = speed / 100;
				applyDistBtnClasses('medium');

				if (msgInterval) {
					clearInterval(msgInterval);
					msgInterval = null;
				}
				overlayDone = true;
				uiReady = true;
				setTimeout(() => {
					loadText = '';
				}, 500);

				stage.start();
			} catch (e) {
				if (msgInterval) clearInterval(msgInterval);
				if (!cancelled) {
					errorMsg = e instanceof Error ? e.message : String(e);
				}
				stage?.destroy();
				stage = null;
				stageRef = null;
			}
		})();

		return () => {
			cancelled = true;
			if (msgInterval) clearInterval(msgInterval);
			stage?.destroy();
			stageRef = null;
		};
	});
</script>

<div class="vitamoo-legacy">
	{#if errorMsg}
		<div class="banner error" role="alert">{errorMsg}</div>
	{/if}

	<div class="layout">
		{#if sidebarCollapsed}
		<button
			type="button"
			class="sidebar-disclosure sidebar-disclosure-pinned"
			onclick={toggleSidebarCollapsed}
			aria-expanded={false}
			title="Show panel"
			aria-label="Show panel"
		>›</button
		>
		<button
			type="button"
			class="sidebar-resize sidebar-resize-pinned-collapsed"
			aria-label="Resize panel width"
			title="Resize panel width"
			onmousedown={beginSidebarResize}
			onkeydown={handleSidebarResizeKeydown}
		></button>
		{/if}
		{#if !sidebarCollapsed}
		<div class="sidebar-shell" style:width="{sidebarWidth}px">
			<div class="sidebar-panel-head">
				<button
					type="button"
					class="sidebar-disclosure"
					onclick={toggleSidebarCollapsed}
					aria-expanded={true}
					aria-controls="sidebar-panel-scroll"
					title="Hide panel"
					aria-label="Hide panel"
				>‹</button
				>
				<div class="sidebar-panel-title">
					<span class="sidebar-title-brand">VitaMoo</span>
					<span class="sidebar-title-sep">:</span>
					<span class="sidebar-title-tagline">Spin the Sims!</span>
				</div>
			</div>
			<div class="sidebar-toolbar">
					<div
						class="sidebar-tabs"
						role="tablist"
						aria-label="Sidebar panels"
						aria-orientation="horizontal"
					>
						<button
							type="button"
							class="sidebar-tab"
							id="sidebar-tab-demo"
							role="tab"
							aria-selected={sidebarTab === 'demo'}
							aria-controls="sidebar-panel-demo"
							tabindex={sidebarTab === 'demo' ? 0 : -1}
							onclick={() => setSidebarTab('demo')}
							onkeydown={(e) => handleSidebarTabKeydown(e, 'demo')}
						>Demo</button
						>
						<button
							type="button"
							class="sidebar-tab"
							id="sidebar-tab-roots"
							role="tab"
							aria-selected={sidebarTab === 'roots'}
							aria-controls="sidebar-panel-roots"
							tabindex={sidebarTab === 'roots' ? 0 : -1}
							onclick={() => setSidebarTab('roots')}
							onkeydown={(e) => handleSidebarTabKeydown(e, 'roots')}
						>Roots</button
						>
						<button
							type="button"
							class="sidebar-tab"
							id="sidebar-tab-catalog"
							role="tab"
							aria-selected={sidebarTab === 'catalog'}
							aria-controls="sidebar-panel-catalog"
							tabindex={sidebarTab === 'catalog' ? 0 : -1}
							onclick={() => setSidebarTab('catalog')}
							onkeydown={(e) => handleSidebarTabKeydown(e, 'catalog')}
						>Catalog</button
						>
						<button
							type="button"
							class="sidebar-tab"
							id="sidebar-tab-help"
							role="tab"
							aria-selected={sidebarTab === 'help'}
							aria-controls="sidebar-panel-help"
							tabindex={sidebarTab === 'help' ? 0 : -1}
							onclick={() => setSidebarTab('help')}
							onkeydown={(e) => handleSidebarTabKeydown(e, 'help')}
						>Help</button
						>
						<button
							type="button"
							class="sidebar-tab"
							id="sidebar-tab-debug"
							role="tab"
							aria-selected={sidebarTab === 'debug'}
							aria-controls="sidebar-panel-debug"
							tabindex={sidebarTab === 'debug' ? 0 : -1}
							onclick={() => setSidebarTab('debug')}
							onkeydown={(e) => handleSidebarTabKeydown(e, 'debug')}
						>Debug</button
						>
					</div>
			</div>
			<div class="sidebar-scroll" id="sidebar-panel-scroll">
				{#if sidebarTab === 'demo'}
				<div
					class="sidebar-tab-panel demo-panels"
					role="tabpanel"
					id="sidebar-panel-demo"
					aria-labelledby="sidebar-tab-demo"
				>
				<details class="demo-submenu" open>
					<summary class="demo-submenu-title">Content</summary>
					<div class="demo-submenu-body">
						<label class="demo-field-label" for="selPack">Demo pack</label>
						<select
							id="selPack"
							bind:value={packVal}
							disabled={!uiReady || packBusy}
							onchange={() => stageRef && applyDemoPack(stageRef)}
						>
							{#each DEMO_PACKS as p (p.id)}
								<option value={p.id}>{p.label}</option>
							{/each}
						</select>
						<p class="demo-field-hint">
							Exchange JSON lists playing scenes and templates; <code>assetIndexRef</code> loads mesh
							lists. Pure glTF and other 3D interchanges are separate files referenced from the
							exchange.
						</p>
					</div>
				</details>

				<details class="demo-submenu" open>
					<summary class="demo-submenu-title">Playing scene</summary>
					<div class="demo-submenu-body">
					<select
						id="selScene"
						bind:value={sceneVal}
						disabled={!uiReady || packBusy}
						onchange={() => stageRef && onScenePick(stageRef)}
					>
						{#each scenesList as sc, i (sc.id)}
							<option value={String(i)}>{sc.name}</option>
						{/each}
					</select>
					<div class="nav-row">
						<button
							type="button"
							class="nav-btn"
							id="btnScenePrev"
							title="Previous playing scene"
							aria-label="Previous playing scene"
							onclick={() => stageRef && stepScene(stageRef, -1)}>&larr; Prev</button
						>
						<button
							type="button"
							class="nav-btn"
							id="btnSceneNext"
							title="Next playing scene"
							aria-label="Next playing scene"
							onclick={() => stageRef && stepScene(stageRef, 1)}>Next &rarr;</button
						>
					</div>
					</div>
				</details>

				<details class="demo-submenu" id="actorGroup" class:hide-actor={!showActorGroup} open>
					<summary class="demo-submenu-title">Person</summary>
					<div class="demo-submenu-body">
					<select
						id="selActor"
						bind:value={actorSelValue}
						disabled={!uiReady || packBusy}
						onchange={() => stageRef && onActorPick(stageRef)}
					>
						{#each actorOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
					<div class="nav-row">
						<button
							type="button"
							class="nav-btn"
							id="btnActorPrev"
							title="Previous person"
							aria-label="Previous person"
							onclick={() => stageRef && stepActor(stageRef, -1)}>&larr; Prev</button
						>
						<button
							type="button"
							class="nav-btn"
							id="btnActorNext"
							title="Next person"
							aria-label="Next person"
							onclick={() => stageRef && stepActor(stageRef, 1)}>Next &rarr;</button
						>
					</div>
					</div>
				</details>

				<details class="demo-submenu" open>
					<summary class="demo-submenu-title">Template</summary>
					<div class="demo-submenu-body">
					<select
						id="selCharacter"
						bind:value={charSelValue}
						disabled={!uiReady || packBusy}
						onchange={() => stageRef && onCharacterChange(stageRef)}
					>
						<option value="">{charPlaceholder}</option>
						{#each charactersList as c, i (c.id)}
							<option value={String(i)}>{c.name}</option>
						{/each}
					</select>
					<div class="nav-row">
						<button
							type="button"
							class="nav-btn"
							id="btnCharacterPrev"
							title="Previous template"
							aria-label="Previous template"
							onclick={() => stageRef && stepCharacter(stageRef, -1)}>&larr; Prev</button
						>
						<button
							type="button"
							class="nav-btn"
							id="btnCharacterNext"
							title="Next template"
							aria-label="Next template"
							onclick={() => stageRef && stepCharacter(stageRef, 1)}>Next &rarr;</button
						>
					</div>
					</div>
				</details>

				<details class="demo-submenu" open>
					<summary class="demo-submenu-title">Skill</summary>
					<div class="demo-submenu-body">
					<select
						id="selAnim"
						bind:value={animSelValue}
						disabled={!uiReady || packBusy}
						onchange={() => stageRef && applyAnimPick(stageRef)}
					>
						<option value="">{animPlaceholder}</option>
						{#each animationList as a (a)}
							<option value={a}>{a}</option>
						{/each}
					</select>
					<div class="nav-row">
						<button
							type="button"
							class="nav-btn"
							id="btnAnimPrev"
							title="Previous skill"
							aria-label="Previous skill"
							onclick={() => stageRef && stepAnimation(stageRef, -1)}>&larr; Prev</button
						>
						<button
							type="button"
							class="nav-btn"
							id="btnAnimNext"
							title="Next skill"
							aria-label="Next skill"
							onclick={() => stageRef && stepAnimation(stageRef, 1)}>Next &rarr;</button
						>
					</div>
					</div>
				</details>
				</div>
				{:else if sidebarTab === 'roots'}
				<div
					class="files-tab sidebar-tab-panel"
					role="tabpanel"
					id="sidebar-panel-roots"
					aria-labelledby="sidebar-tab-roots"
				>
					<h2 class="help-tab-title">Roots</h2>
					<p class="help-intro">
						Add root paths and content filters, then scan and rescan using stored root specs.
					</p>
					{#if filesApiError}
						<p class="files-error" role="alert">{filesApiError}</p>
					{/if}
					<div class="files-add">
						<label class="demo-field-label" for="rootPathInput">Root path</label>
						<input
							id="rootPathInput"
							type="text"
							placeholder="/path/to/The Sims, a save folder, or an interchange file"
							bind:value={rootPathInput}
							disabled={filesBusy}
						/>
						<input
							id="rootNameInput"
							type="text"
							placeholder="Optional root name (defaults from path basename)"
							bind:value={rootNameInput}
							disabled={filesBusy}
						/>
						<label class="demo-field-label" for="rootNameInput">Root name (optional)</label>
						<input
							id="rootDescriptionInput"
							type="text"
							placeholder="Description (e.g. Zombie Sims Archive, random web downloads)"
							bind:value={rootDescriptionInput}
							disabled={filesBusy}
						/>
						<label class="demo-field-label" for="rootDescriptionInput">Root description</label>
						<fieldset class="root-types-fieldset">
							<legend class="demo-field-label">Content filter</legend>
							<label class="root-type-option">
								<input
									type="checkbox"
									checked={rootContentAllInput}
									onchange={(e) =>
										setCreateRootAll((e.currentTarget as HTMLInputElement).checked)}
									disabled={filesBusy}
								/>
								All
							</label>
							<div class="root-types-grid">
								{#each ROOT_CONTENT_OPTIONS as option (option.value)}
									<label class="root-type-option">
										<input
											type="checkbox"
											checked={rootContentTypesInput[option.value]}
											disabled={filesBusy || rootContentAllInput}
											onchange={(e) =>
												setCreateRootType(
													option.value,
													(e.currentTarget as HTMLInputElement).checked,
												)}
										/>
										{option.label}
									</label>
								{/each}
							</div>
						</fieldset>
						<div class="demo-field-hint">
							All checked ignores per-type filters; uncheck it to scan only selected content types.
						</div>
						<div class="nav-row">
							<button
								type="button"
								class="nav-btn"
								onclick={() => void addScanRoot()}
								disabled={filesBusy || !rootPathInput.trim()}>Add root</button
							>
							<button
								type="button"
								class="nav-btn"
								onclick={() => void refreshScanRoots()}
								disabled={filesBusy}>Refresh roots</button
							>
						</div>
					</div>
					{#if editingRootId}
						<div class="root-edit-card">
							<h3>Edit root</h3>
							<label class="demo-field-label" for="editRootNameInput">Root name</label>
							<input
								id="editRootNameInput"
								type="text"
								placeholder="Root name"
								bind:value={editRootNameInput}
								disabled={filesBusy}
							/>
							<label class="demo-field-label" for="editRootDescriptionInput">Root description</label>
							<input
								id="editRootDescriptionInput"
								type="text"
								placeholder="Description"
								bind:value={editRootDescriptionInput}
								disabled={filesBusy}
							/>
							<fieldset class="root-types-fieldset">
								<legend class="demo-field-label">Content filter</legend>
								<label class="root-type-option">
									<input
										type="checkbox"
										checked={editRootContentAllInput}
										onchange={(e) =>
											setEditRootAll((e.currentTarget as HTMLInputElement).checked)}
										disabled={filesBusy}
									/>
									All
								</label>
								<div class="root-types-grid">
									{#each ROOT_CONTENT_OPTIONS as option (option.value)}
										<label class="root-type-option">
											<input
												type="checkbox"
												checked={editRootContentTypesInput[option.value]}
												disabled={filesBusy || editRootContentAllInput}
												onchange={(e) =>
													setEditRootType(
														option.value,
														(e.currentTarget as HTMLInputElement).checked,
													)}
											/>
											{option.label}
										</label>
									{/each}
								</div>
							</fieldset>
							<div class="nav-row">
								<button
									type="button"
									class="nav-btn"
									onclick={() => void saveEditRoot()}
									disabled={filesBusy || !editRootNameInput.trim()}>Save root</button
								>
								<button
									type="button"
									class="nav-btn"
									onclick={cancelEditRoot}
									disabled={filesBusy}>Cancel</button
								>
							</div>
						</div>
					{/if}
					{#if scanRoots.length === 0}
						<p class="demo-field-hint">No roots yet. Add one to start.</p>
					{:else}
						<table class="files-table">
							<thead>
								<tr>
									<th>On</th>
									<th>Name</th>
									<th>Path</th>
									<th>Filter</th>
									<th>Discoveries</th>
									<th>Permission</th>
									<th>Description</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{#each scanRoots as root (root.id)}
									<tr>
										<td>
											<input
												type="checkbox"
												checked={root.enabled}
												onchange={() => void toggleScanRootEnabled(root)}
												disabled={filesBusy}
											/>
										</td>
										<td>{root.name}</td>
										<td class="files-path-cell" title={root.path}>{root.path}</td>
										<td>
											<div class="demo-field-hint">{selectedContentLabelList(root.contentSelection)}</div>
											<div class="root-types-grid compact">
												<label class="root-type-option compact">
													<input type="checkbox" checked={root.contentSelection.all} disabled />
													All
												</label>
												{#each ROOT_CONTENT_OPTIONS as option (option.value)}
													<label class="root-type-option compact">
														<input
															type="checkbox"
															checked={root.contentSelection.types[option.value]}
															disabled
														/>
														{option.label}
													</label>
												{/each}
											</div>
										</td>
										<td>
											<div class="demo-field-hint">{detectedContentLabelList(root)}</div>
											<div class="root-types-grid compact">
												{#each ROOT_CONTENT_OPTIONS as option (option.value)}
													<div class="root-counter-row">
														<span>{option.label}</span>
														<span>{discoveryBucketCount(root.discoveryBuckets.byContentType, option.value)}</span>
													</div>
												{/each}
											</div>
											<div class="demo-field-hint">Object kinds (top 8)</div>
											{#if objectKindRowsShown(root).length > 0}
												<div class="root-types-grid compact">
													{#each objectKindRowsShown(root) as row (row.kind)}
														<div class="root-counter-row">
															<button
																type="button"
																class="root-kind-jump"
																onclick={() => void jumpToCatalogObjectKind(root.id, row.kind)}
																title={`Open catalog for ${row.kind}`}
															>
																{row.kind}
															</button>
															<span>{row.count}</span>
														</div>
													{/each}
												</div>
												{#if objectKindOverflowCount(root) > 0}
													<div class="demo-field-hint">
														+{objectKindOverflowCount(root)} more kinds
													</div>
												{/if}
											{:else}
												<div class="demo-field-hint">(none discovered yet)</div>
											{/if}
										</td>
										<td>
											<div class="root-permission-cell">
												<span
													class:permission-expired={root.permissionStatus === 'expired'}
													>{rootPermissionSummary(root)}</span
												>
												{#if root.permissionStatus === 'expired'}
													<button
														type="button"
														class="nav-btn"
														onclick={() => void regrantRootPermission(root.id)}
														disabled={filesBusy}>Re-grant</button
													>
												{/if}
												{#if root.lastScannedAt}
													<div class="demo-field-hint">Last scan: {root.lastScannedAt}</div>
												{/if}
											</div>
										</td>
										<td>{root.description || '-'}</td>
										<td>
											<div class="files-row-actions">
												<button
													type="button"
													class="nav-btn"
													onclick={() => beginEditRoot(root)}
													disabled={filesBusy}>Edit</button
												>
												<button
													type="button"
													class="nav-btn"
													onclick={() => void rescanSingleRoot(root.id)}
													disabled={filesBusy}>Rescan</button
												>
												<button
													type="button"
													class="nav-btn"
													onclick={() => void removeScanRoot(root.id)}
													disabled={filesBusy}>Remove</button
												>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
					<div class="nav-row files-actions">
						<button
							type="button"
							class="nav-btn"
							onclick={() => void runInventoryScan()}
							disabled={filesBusy || !scanRoots.some((row) => row.enabled)}>Scan enabled roots</button
						>
						<button
							type="button"
							class="nav-btn"
							onclick={() => void refreshScanRun()}
							disabled={filesBusy || !scanRun}>Refresh run</button
						>
					</div>
					{#if scanRun}
						<p class="files-run-summary">
							Run <code>{scanRun.id}</code> - {scanRun.status}. Roots: {scanRun.summary.rootCount},
							files: {scanRun.summary.scannedFileCount}, disabled skipped:
							{scanRun.summary.skippedDisabledCount}, objects: {scanRun.summary.objectCount}, chunks:
							{scanRun.summary.chunkCount}, issues: {scanRun.summary.issueCount}.
						</p>
					{/if}
					<p class="demo-field-hint">
						Roots persist as scan specs, including filter settings and permission metadata.
					</p>
				</div>
				{:else if sidebarTab === 'catalog'}
				<div
					class="catalog-tab sidebar-tab-panel"
					role="tabpanel"
					id="sidebar-panel-catalog"
					aria-labelledby="sidebar-tab-catalog"
				>
					<h2 class="help-tab-title">Catalog</h2>
					<p class="help-intro">Explore discovered files, containers, objects, chunks, and scan issues.</p>
					{#if filesApiError}
						<p class="files-error" role="alert">{filesApiError}</p>
					{/if}
					<div class="catalog-filters">
						<label class="demo-field-label" for="catalogRootSelect">Catalog root</label>
						<select id="catalogRootSelect" bind:value={catalogRootId} disabled={catalogBusy}>
							<option value="all">All roots</option>
							{#each scanRoots as root (root.id)}
								<option value={root.id}>{root.name}</option>
							{/each}
						</select>
						<label class="demo-field-label" for="catalogKindSelect">Catalog row kind</label>
						<select id="catalogKindSelect" bind:value={catalogKind} disabled={catalogBusy}>
							{#each CATALOG_KIND_OPTIONS as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
						<label class="demo-field-label" for="catalogObjectKindSelect">Object kind</label>
						<select
							id="catalogObjectKindSelect"
							bind:value={catalogObjectKind}
							disabled={catalogBusy || !catalogKindSupportsObjectKindFilter()}
						>
							<option value="all">All object kinds</option>
							{#each catalogObjectKindOptions() as option (option)}
								<option value={option}>{option}</option>
							{/each}
						</select>
						<label class="demo-field-label" for="catalogTextInput">Catalog text filter</label>
						<input
							id="catalogTextInput"
							type="text"
							placeholder="Filter path, chunk type, issue text"
							bind:value={catalogText}
							disabled={catalogBusy}
						/>
						<div class="nav-row">
							<button
								type="button"
								class="nav-btn"
								onclick={() => void refreshCatalogRows(true)}
								disabled={catalogBusy}>Query</button
							>
							<button
								type="button"
								class="nav-btn"
								onclick={() => void catalogPage(-1)}
								disabled={catalogBusy || catalogOffset === 0}>&larr; Prev</button
							>
							<button
								type="button"
								class="nav-btn"
								onclick={() => void catalogPage(1)}
								disabled={catalogBusy || catalogOffset + catalogLimit >= catalogTotal}>Next &rarr;</button
							>
						</div>
					</div>
					<p class="demo-field-hint">
						Showing {catalogRows.length} of {catalogTotal} rows (offset {catalogOffset}, limit {catalogLimit}).
					</p>
					<div class="catalog-table-wrap">
						<table class="files-table catalog-table">
							<thead>
								<tr>
									<th>Root</th>
									<th>Kind</th>
									<th>Path</th>
									<th>Details</th>
								</tr>
							</thead>
							<tbody>
								{#if catalogRows.length === 0}
									<tr>
										<td colspan="4">No rows yet. Run a scan in Roots tab, then query the catalog here.</td>
									</tr>
								{:else}
									{#each catalogRows as row (row.id)}
										<tr>
											<td>{rootDisplayName(row.rootId)}</td>
											<td>{row.kind}</td>
											<td class="files-path-cell" title={row.path}>{catalogPathPreview(row)}</td>
											<td>
												{#if row.kind === 'file'}
													{String(row.fileKind)} - {String(row.size)} bytes
													{#if Array.isArray(row.contentTypes) && row.contentTypes.length > 0}
														<div class="demo-field-hint">{row.contentTypes.join(', ')}</div>
													{/if}
												{:else if row.kind === 'container'}
													{String(row.containerKind)} - {String(row.memberCount)} members
												{:else if row.kind === 'object'}
													{String(row.objectKind)} {String(row.resourceId ?? '')}
												{:else if row.kind === 'chunk'}
													{String(row.chunkType)}:{String(row.chunkId)} ({String(row.size)} bytes)
												{:else}
													{String(row.code)} - {String(row.message)}
												{/if}
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
				</div>
				{:else if sidebarTab === 'help'}
				<div
					class="help-tab sidebar-tab-panel"
					role="tabpanel"
					id="sidebar-panel-help"
					aria-labelledby="sidebar-tab-help"
				>
					<h2 class="help-tab-title">Spin the Sims!</h2>
					<p class="help-intro">Click and drag to spin.<br />Click a Sim to select them.</p>
					<table class="help-keys">
						<tbody>
							<tr><th colspan="2">Navigate</th></tr>
							<tr><td><kbd>N</kbd> <kbd>P</kbd></td><td>next / previous playing scene</td></tr>
							<tr><td><kbd>D</kbd> <kbd>A</kbd></td><td>next / previous person</td></tr>
							<tr><td><kbd>S</kbd> <kbd>W</kbd></td><td>next / previous template</td></tr>
							<tr><td><kbd>E</kbd> <kbd>Q</kbd></td><td>next / previous skill</td></tr>
							<tr><td><kbd>Space</kbd></td><td>next person (<kbd>Shift</kbd> = previous)</td></tr>
							<tr><th colspan="2">Spin and zoom</th></tr>
							<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Spin (hold = faster)</td></tr>
							<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Zoom in / out</td></tr>
							<tr><td>Drag</td><td>Spin person + zoom</td></tr>
							<tr><td>Right drag</td><td>Orbit stage</td></tr>
							<tr><td>Click</td><td>Select person (background = All persons)</td></tr>
							<tr><td>Scroll</td><td>Zoom</td></tr>
							<tr><th colspan="2">Speed</th></tr>
							<tr><td><kbd>1</kbd><kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>–<kbd>9</kbd></td><td>Slow · normal · fast</td></tr>
							<tr><td><kbd>0</kbd></td><td>Pause</td></tr>
							<tr><th colspan="2">Panels</th></tr>
							<tr><td>‹ / ›</td><td>Show or hide the side panel</td></tr>
							<tr><td>Strip</td><td>Drag beside › to open the panel and set its width</td></tr>
							<tr><td>Bottom chevron</td><td>Show or hide the camera bar</td></tr>
						</tbody>
					</table>
					<p class="help-tip">
						<strong>All persons</strong> selected means you control every placement in the playing scene at
						once.
					</p>
				</div>
				{:else if sidebarTab === 'debug'}
				<div
					class="sidebar-tab-panel debug-tab-panel"
					role="tabpanel"
					id="sidebar-panel-debug"
					aria-labelledby="sidebar-tab-debug"
				>
					<DebugPanel stage={stageRef} active={sidebarTab === 'debug' && !sidebarCollapsed} />
				</div>
				{/if}
			</div>
		</div>
		<button
			type="button"
			class="sidebar-resize"
			aria-label="Resize panel width"
			title="Resize panel width"
			onmousedown={beginSidebarResize}
			onkeydown={handleSidebarResizeKeydown}
		></button>
		{/if}

			<div class="viewer">
				<div class="viewer-stage">
					<canvas
						bind:this={canvasEl}
						id="viewport"
						aria-label="Playing scene viewport"
					></canvas>
				</div>
				{#if !bottomBarCollapsed}
				<div class="viewer-footer-toolbar">
					<div class="controls" id="viewer-bottom-controls">
						<button
							type="button"
							class="dist-btn"
							class:active={distFarActive}
							data-dist="far"
							title="Far camera"
							aria-label="Far camera"
							onclick={() => stageRef && setDistance(stageRef, 'far')}>Far</button
						>
						<button
							type="button"
							class="dist-btn"
							class:active={distMedActive}
							data-dist="medium"
							title="Medium camera"
							aria-label="Medium camera"
							onclick={() => stageRef && setDistance(stageRef, 'medium')}>Med</button
						>
						<button
							type="button"
							class="dist-btn"
							class:active={distNearActive}
							data-dist="near"
							title="Near camera"
							aria-label="Near camera"
							onclick={() => stageRef && setDistance(stageRef, 'near')}>Near</button
						>
						<label
							title="Rotate view"
							>Rotate <input
								type="range"
								id="rotY"
								min="0"
								max="360"
								value={rotY}
								aria-label="Rotate view"
								oninput={onRotYRangeInput}
							/></label
						>
						<label
							title="Tilt view"
							>Tilt <input
								type="range"
								id="rotX"
								min="-89"
								max="89"
								value={rotX}
								aria-label="Tilt view"
								oninput={onRotXRangeInput}
							/></label
						>
						<label
							title="Zoom view"
							>Zoom <input
								type="range"
								id="zoom"
								min="15"
								max="400"
								value={zoom}
								aria-label="Zoom view"
								oninput={onZoomRangeInput}
							/></label
						>
						<label
							title="Playback speed"
							>Speed <input
								type="range"
								id="speed"
								min="0"
								max="1000"
								bind:value={speed}
								aria-label="Playback speed"
								oninput={() => stageRef && pushSpinToStage(stageRef)}
							/></label
						>
						<button
							type="button"
							class="filter-btn"
							id="btnPause"
							class:active={pauseActive}
							title="Pause or resume"
							aria-label="Pause or resume"
							style="min-width:50px"
							onclick={togglePause}>{pauseLabel}</button
						>
					</div>
				</div>
				{/if}
				<button
					type="button"
					class="bottom-disclosure bottom-disclosure-anchor"
					onclick={toggleBottomBarCollapsed}
					aria-expanded={!bottomBarCollapsed}
					aria-controls={bottomBarCollapsed ? undefined : 'viewer-bottom-controls'}
					title={bottomBarCollapsed ? 'Show camera bar' : 'Hide camera bar'}
					aria-label={bottomBarCollapsed ? 'Show camera bar' : 'Hide camera bar'}
				><span
						class="disclosure-chevron"
						class:disclosure-chevron-down={!bottomBarCollapsed}
						class:disclosure-chevron-up={bottomBarCollapsed}
						aria-hidden="true"
					>‹</span></button
				>
			</div>
		</div>

	{#if !uiReady && !errorMsg}
		<div id="loadingOverlay" class:done={overlayDone}>
			<div class="loader-spinner"></div>
			<div class="loader-text">{loadText}</div>
		</div>
	{/if}
</div>

<style>
	.demo-panels {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.demo-submenu {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		padding: 0.15rem 0.5rem 0.5rem;
		background: rgba(0, 0, 0, 0.15);
	}

	.demo-submenu-title {
		cursor: pointer;
		font: 600 0.88rem/1.3 system-ui, sans-serif;
		padding: 0.35rem 0.15rem;
		list-style: none;
	}

	.demo-submenu-title::-webkit-details-marker {
		display: none;
	}

	.demo-submenu-body {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-top: 0.15rem;
	}

	.demo-field-label {
		font: 0.75rem/1.2 system-ui, sans-serif;
		opacity: 0.9;
	}

	.demo-field-hint {
		margin: 0;
		font: 0.72rem/1.35 system-ui, sans-serif;
		opacity: 0.78;
	}

	.demo-field-hint code {
		font-size: 0.95em;
	}

	.files-tab,
	.catalog-tab {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.files-add,
	.catalog-filters {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.files-add input,
	.catalog-filters input,
	.catalog-filters select {
		width: 100%;
	}

	.root-types-fieldset {
		margin: 0;
		padding: 0.35rem 0.45rem;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 6px;
	}

	.root-types-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.18rem 0.5rem;
	}

	.root-types-grid.compact {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		max-height: 110px;
		overflow: auto;
	}

	.root-type-option {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font: 0.7rem/1.25 system-ui, sans-serif;
	}

	.root-type-option.compact {
		font-size: 0.66rem;
	}

	.root-counter-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem;
		font: 0.66rem/1.25 system-ui, sans-serif;
	}

	.root-kind-jump {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		text-decoration: underline dotted;
	}

	.root-kind-jump:focus-visible {
		outline: 1px solid rgba(255, 255, 255, 0.45);
		outline-offset: 1px;
	}

	.root-edit-card {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.45rem;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.03);
	}

	.root-edit-card h3 {
		margin: 0;
		font: 600 0.78rem/1.2 system-ui, sans-serif;
	}

	.files-table {
		width: 100%;
		border-collapse: collapse;
		font: 0.72rem/1.3 system-ui, sans-serif;
	}

	.files-table th,
	.files-table td {
		border: 1px solid rgba(255, 255, 255, 0.14);
		padding: 0.22rem 0.32rem;
		vertical-align: top;
	}

	.files-path-cell {
		max-width: 280px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.files-actions {
		margin-top: 0.2rem;
	}

	.files-row-actions {
		display: flex;
		gap: 0.25rem;
	}

	.files-run-summary {
		margin: 0;
		font: 0.72rem/1.35 system-ui, sans-serif;
		opacity: 0.86;
	}

	.root-permission-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.permission-expired {
		color: #ff9f9f;
		font-weight: 600;
	}

	.files-error {
		margin: 0;
		padding: 0.35rem 0.45rem;
		border: 1px solid rgba(255, 90, 90, 0.55);
		border-radius: 6px;
		background: rgba(90, 20, 20, 0.45);
		font: 0.72rem/1.35 system-ui, sans-serif;
	}

	.catalog-table-wrap {
		max-height: 350px;
		overflow: auto;
	}

	.hide-actor {
		display: none !important;
	}

	.banner.error {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		z-index: 2000;
		padding: 0.65rem 1rem;
		font: 0.9rem/1.4 system-ui, sans-serif;
		background: rgba(80, 20, 20, 0.92);
		color: #fff;
	}

</style>
