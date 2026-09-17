<script lang="ts">
	import { matchesWindow } from '@common/bridge';
	import type { HostInfo } from '@common/ipc';
	import type { QueryResult, WindowInfo } from '@common/types';

	let host = $state<HostInfo | null>(null);
	let focused = $state<WindowInfo | null>(null);
	let windows = $state<WindowInfo[]>([]);
	let selector = $state('button[name]');
	let result = $state<QueryResult | null>(null);
	let error = $state<string | null>(null);
	let running = $state(false);

	const accessibilityBlocked = $derived(
		host?.permissions != null && host.permissions.accessibility !== 'granted'
	);

	$effect(() => {
		void refresh();
		// A block body, not an expression: assigning to $state evaluates to Svelte's
		// reactive Proxy, and contextBridge cannot clone a Proxy back across the boundary.
		const off = window.angel.onWindowFocus((w) => {
			focused = w;
		});
		return off;
	});

	async function refresh() {
		host = await window.angel.getHostInfo();
		focused = await window.angel.getFocusedWindow();
		windows = await window.angel.getOpenWindows();
	}

	async function run() {
		running = true;
		error = null;
		try {
			result = await window.angel.query(selector);
			// Push the boxes to the overlay, so the answer appears on the actual widgets
			// rather than only in this table.
			await window.angel.setHighlights(
				result.elements.flatMap((element) => (element.bounds ? [element.bounds] : []))
			);
		} catch (cause) {
			result = null;
			error = cause instanceof Error ? cause.message : String(cause);
			await window.angel.setHighlights([]);
		} finally {
			running = false;
		}
	}

	async function clearHighlights() {
		result = null;
		await window.angel.setHighlights([]);
	}

	/** Which bridge would take this window, computed here from the shared matcher. */
	function bridgeFor(window_: WindowInfo): string | null {
		for (const module of host?.modules ?? []) {
			for (const bridge of module.bridges) {
				if (bridge.matches.some((matcher) => matchesWindow(matcher, window_))) {
					return bridge.id;
				}
			}
		}
		return null;
	}
</script>

<main class="console">
	<header>
		<h1>Screen Angel</h1>
		<p class="sub">
			Selectors, events and recognition over any application's interface. This window is the
			inspector; the layer itself is the transparent one.
		</p>
	</header>

	<section class="grid">
		<article>
			<h2>Host</h2>
			{#if host === null}
				<p class="dim">Asking…</p>
			{:else}
				<dl>
					<dt>Backend</dt>
					<dd>
						{#if host.backend}
							{host.backend.name}
						{:else}
							<span class="bad">none — {host.unsupportedReason}</span>
						{/if}
					</dd>
					<dt>Accessibility</dt>
					<dd class:bad={accessibilityBlocked}>
						{host.permissions?.accessibility ?? 'unavailable'}
					</dd>
					<dt>Screen recording</dt>
					<dd>{host.permissions?.screenCapture ?? 'unavailable'}</dd>
					<dt>Steam</dt>
					<dd class="dim">{host.steam.available ? 'connected' : host.steam.reason}</dd>
					<dt>Electron</dt>
					<dd class="mono dim">{host.electronVersion}</dd>
				</dl>

				{#if accessibilityBlocked}
					<p class="warn">
						macOS will not show another application's interface until Accessibility is
						granted, and it takes effect only after a relaunch.
					</p>
					<button onclick={() => window.angel.requestPermissions()}>
						Open the permission pane
					</button>
				{/if}
			{/if}
		</article>

		<article>
			<h2>Modules</h2>
			{#if (host?.modules ?? []).length === 0}
				<p class="dim">No modules loaded.</p>
			{:else}
				<ul class="modules">
					{#each host?.modules ?? [] as module (module.id)}
						<li>
							<strong>{module.name}</strong> <span class="mono dim">{module.id}</span>
							<ul>
								{#each module.bridges as bridge (bridge.id)}
									<li class:active={host?.activeBridgeId === bridge.id}>
										{bridge.target} <span class="mono dim">{bridge.id}</span>
										{#if host?.activeBridgeId === bridge.id}<span class="good">attached</span>{/if}
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			{/if}
		</article>
	</section>

	<section>
		<h2>Query</h2>
		<p class="dim">
			Whitespace is descendant, <code>&gt;</code> is child, <code>,</code> is union. Predicates take
			<code>=</code>, <code>!=</code>, <code>*=</code>, <code>^=</code> and <code>$=</code>;
			pseudo-classes are <code>:focused</code>, <code>:enabled</code> and
			<code>:disabled</code>. Runs against whichever application is frontmost, so switch to
			it before running — this window being focused means you are querying this window.
		</p>

		<form
			class="query"
			onsubmit={(event) => {
				event.preventDefault();
				void run();
			}}
		>
			<input class="mono" bind:value={selector} spellcheck="false" aria-label="Selector" />
			<button type="submit" disabled={running || host?.backend == null}>
				{running ? 'Walking…' : 'Run'}
			</button>
			<button type="button" onclick={clearHighlights}>Clear</button>
		</form>

		{#if error}
			<p class="bad mono">{error}</p>
		{/if}

		{#if result}
			<p class="cost">
				{result.elements.length} matched out of {result.visited} visited in
				{result.durationMs.toFixed(0)}ms{result.truncated
					? ' — the walk hit its budget, so this is a partial answer'
					: ''}
			</p>

			<table>
				<thead>
					<tr>
						<th>role</th>
						<th>name</th>
						<th>value</th>
						<th>bounds</th>
						<th>path</th>
					</tr>
				</thead>
				<tbody>
					{#each result.elements.slice(0, 200) as element (element.path.join('.'))}
						<tr>
							<td class="mono">{element.role}</td>
							<td>{element.name ?? ''}</td>
							<td class="dim">{element.value ?? ''}</td>
							<td class="mono dim">
								{element.bounds
									? `${Math.round(element.bounds.x)},${Math.round(element.bounds.y)} ${Math.round(element.bounds.width)}×${Math.round(element.bounds.height)}`
									: ''}
							</td>
							<td class="mono dim">{element.path.join('.')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>

	<section>
		<h2>Windows</h2>
		<p class="dim">
			Frontmost: <strong>{focused ? focused.app : 'nothing'}</strong>
			{focused?.title ? `— ${focused.title}` : ''}
			<button type="button" class="link" onclick={refresh}>refresh</button>
		</p>
		<table>
			<thead>
				<tr>
					<th>app</th>
					<th>title</th>
					<th>pid</th>
					<th>bridge</th>
				</tr>
			</thead>
			<tbody>
				<!-- Keyed by position, because pid and title are not unique together: one app
				     with several untitled windows gives identical keys, and a title is empty
				     for every window when Screen Recording permission is withheld. The list
				     arrives as a whole snapshot, so position is the only honest identity. -->
				{#each windows as entry, index (index)}
					{@const bridge = bridgeFor(entry)}
					<tr>
						<td>{entry.app}</td>
						<td class="dim">{entry.title}</td>
						<td class="mono dim">{entry.pid}</td>
						<td class="mono">{#if bridge}<span class="good">{bridge}</span>{/if}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>

<style>
	.console {
		max-width: 1000px;
		margin: 0 auto;
		padding: 28px 24px 64px;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	h2 {
		margin: 0 0 8px;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--ink-dim);
	}

	.sub {
		margin: 6px 0 0;
		max-width: 62ch;
		color: var(--ink-dim);
	}

	section {
		margin-top: 32px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
	}

	article {
		padding: 16px;
		border: 1px solid var(--edge);
		border-radius: 8px;
		background: var(--panel);
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 4px 14px;
		margin: 0;
	}

	dt {
		color: var(--ink-dim);
	}

	dd {
		margin: 0;
	}

	.query {
		display: flex;
		gap: 8px;
		margin: 12px 0;
	}

	input {
		flex: 1;
		padding: 8px 10px;
		border: 1px solid var(--edge);
		border-radius: 6px;
		background: var(--panel);
		color: var(--ink);
	}

	input:focus-visible {
		outline: 2px solid var(--halo);
		outline-offset: -1px;
	}

	button {
		padding: 8px 14px;
		border: 1px solid var(--edge);
		border-radius: 6px;
		background: var(--panel);
		color: var(--ink);
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		border-color: var(--halo);
	}

	button:disabled {
		opacity: 0.45;
		cursor: default;
	}

	button.link {
		padding: 0 4px;
		border: 0;
		background: none;
		color: var(--halo);
		text-decoration: underline;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 8px;
	}

	th {
		text-align: left;
		font-weight: 500;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		border-bottom: 1px solid var(--edge);
		padding: 4px 8px;
	}

	td {
		padding: 4px 8px;
		border-bottom: 1px solid color-mix(in srgb, var(--edge) 50%, transparent);
		vertical-align: top;
	}

	ul {
		margin: 4px 0;
		padding-left: 18px;
	}

	.modules > li + li {
		margin-top: 8px;
	}

	.cost {
		margin: 8px 0 0;
		color: var(--ink-dim);
	}

	.dim {
		color: var(--ink-dim);
	}

	.bad {
		color: var(--bad);
	}

	.good {
		color: var(--good);
	}

	.warn {
		color: var(--warn);
		max-width: 52ch;
	}

	li.active {
		color: var(--ink);
	}
</style>
