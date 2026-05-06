<script lang="ts">
	import { tick } from 'svelte';
	import type { MooShowStage } from 'mooshow';

	interface Props {
		stage: MooShowStage | null;
		/** When false, polling pauses (saves work when another tab is visible). */
		active: boolean;
	}
	let { stage, active }: Props = $props();

	// Class `stage` identity does not change when pipeline or WebGPU caps update — poll + local bumps.
	let statusPoll = $state(0);
	let debugUiEpoch = $state(0);
	function touchPipelineUi() {
		debugUiEpoch++;
	}

	$effect(() => {
		if (!active || !stage) return;
		const id = setInterval(() => {
			const scrollEl = document.getElementById('sidebar-panel-scroll');
			const scrollTop = scrollEl?.scrollTop ?? 0;
			statusPoll++;
			void tick().then(() => {
				if (scrollEl) scrollEl.scrollTop = scrollTop;
			});
		}, 120);
		return () => clearInterval(id);
	});

	let pipelineStages = $derived.by(() => {
		statusPoll;
		debugUiEpoch;
		return stage?.getCharacterPipelineStages() ?? { animation: 'cpu', deformation: 'cpu', rasterization: 'gpu' };
	});
	let validation = $derived.by(() => {
		statusPoll;
		debugUiEpoch;
		return stage?.getPipelineValidation() ?? { enabled: false, compareDeformation: false, compareAnimation: false, maxAbsError: 1e-4, maxLoggedVertices: 16, everyNFrames: 1, throwOnMismatch: false };
	});
	let status = $derived.by(() => {
		statusPoll;
		debugUiEpoch;
		return stage?.getPipelineStatus?.() ?? null;
	});
	let statusAny = $derived((status as any) ?? null);

	function gpuAnimDisableReason(s: {
		webgpuPending: boolean;
		webgpuFailed: boolean;
		gpuCaps: { animation: boolean; deformation: boolean };
	}): string {
		if (s.webgpuPending) return 'WebGPU still starting';
		if (s.webgpuFailed) return 'WebGPU unavailable';
		if (!s.gpuCaps.animation) return 'GPU animation unavailable';
		return '';
	}

	function gpuDeformDisableReason(s: {
		webgpuPending: boolean;
		webgpuFailed: boolean;
		gpuCaps: { animation: boolean; deformation: boolean };
	}): string {
		if (s.webgpuPending) return 'WebGPU still starting';
		if (s.webgpuFailed) return 'WebGPU unavailable';
		if (!s.gpuCaps.deformation) return 'GPU deformation unavailable';
		return '';
	}

	function formatMiB(bytes: number): string {
		return `${(bytes / (1024 * 1024)).toFixed(0)} MiB`;
	}

	function setStages(anim: 'cpu' | 'gpu', deform: 'cpu' | 'gpu') {
		stage?.setCharacterPipelineStages({ animation: anim, deformation: deform });
		touchPipelineUi();
		stage?.render();
	}
	function setValidation(partial: Record<string, unknown>) {
		stage?.setPipelineValidation(partial as any);
		touchPipelineUi();
	}
	function setDebugSlice(mode: number) {
		if (!stage) return;
		const r = (stage as any)._renderer;
		if (r && typeof r.setDebugSlice === 'function') {
			r.setDebugSlice(mode);
			stage.render();
		}
	}

	type Preset = { label: string; desc: string; apply: () => void };
	const presets: Preset[] = [
		{
			label: 'Demo',
			desc: 'Full GPU, no validation',
			apply: () => {
				setStages('gpu', 'gpu');
				setValidation({ enabled: false, compareAnimation: false, compareDeformation: false });
				setDebugSlice(0);
			},
		},
		{
			label: 'Validate',
			desc: 'Full GPU + CPU audit every 30 frames',
			apply: () => {
				setStages('gpu', 'gpu');
				setValidation({ enabled: true, compareAnimation: true, compareDeformation: true, everyNFrames: 30, throwOnMismatch: false });
				setDebugSlice(0);
			},
		},
		{
			label: 'CPU Ref',
			desc: 'All CPU (reference)',
			apply: () => {
				setStages('cpu', 'cpu');
				setValidation({ enabled: false });
				setDebugSlice(0);
			},
		},
		{
			label: 'CPU+GPU',
			desc: 'GPU deform, CPU anim',
			apply: () => {
				setStages('cpu', 'gpu');
				setValidation({ enabled: false });
				setDebugSlice(0);
			},
		},
		{
			label: 'Strict',
			desc: 'GPU + validate every frame, throw on error',
			apply: () => {
				setStages('gpu', 'gpu');
				setValidation({ enabled: true, compareAnimation: true, compareDeformation: true, everyNFrames: 1, throwOnMismatch: true });
				setDebugSlice(0);
			},
		},
	];

	let presetChoice = $state('0');

	function applySelectedPreset() {
		const i = parseInt(presetChoice, 10);
		if (i >= 0 && i < presets.length) presets[i].apply();
	}

	let presetSyncedForStage: MooShowStage | null = null;
	$effect(() => {
		if (!stage) {
			presetSyncedForStage = null;
			return;
		}
		if (presetSyncedForStage === stage) return;
		presetSyncedForStage = stage;
		applySelectedPreset();
	});

	const epsilonOptions = [1e-2, 5e-3, 1e-3, 5e-4, 1e-4, 1e-5];
	const cadenceOptions = [1, 5, 10, 30, 60, 120];

	function formatValidationDetail(raw: string): string {
		let t = raw.trim();
		t = t.replace(/\s+·\s+/g, '\n');
		t = t.replace(/ ([a-zA-Z_][\w]*=)/g, '\n$1');
		if (t.includes('/')) {
			t = t.replace(/\//g, '/\n');
			t = t.replace(/\/\n+/g, '/\n');
		}
		return t.trim();
	}
</script>

<div class="debug-embed" role="region" aria-label="Pipeline debug">
		<div class="debug-body">
			<div class="group">
				<h3>Pipeline preset</h3>
				<select
					class="debug-preset-select"
					bind:value={presetChoice}
					onchange={applySelectedPreset}
					title="Pipeline preset"
					aria-label="Pipeline preset"
				>
					{#each presets as p, i}
						<option value={String(i)}>{p.label}</option>
					{/each}
				</select>
				<p class="debug-preset-desc">{presets[parseInt(presetChoice, 10)]?.desc ?? ''}</p>
			</div>

			{#if status}
			<fieldset class="status-bar">
				<legend>Animation &amp; deformation</legend>
				<p class="pipeline-help">
					<strong>Running</strong> is what the frame loop uses (may be CPU if you chose GPU but WebGPU is not ready).
					<strong>Chosen</strong> matches the CPU/GPU buttons below.
				</p>
				<div class="status-grid status-grid-main">
					<span class="status-label">Running anim</span>
					<span class="status-value" class:gpu={status.effectiveAnimation === 'gpu'}>{status.effectiveAnimation.toUpperCase()}</span>
					<span class="status-label">Chosen anim</span>
					<span class="status-value" class:muted={pipelineStages.animation !== status.effectiveAnimation} class:gpu={pipelineStages.animation === 'gpu'}>{pipelineStages.animation.toUpperCase()}</span>
					<span class="status-label">Running deform</span>
					<span class="status-value" class:gpu={status.effectiveDeformation === 'gpu'}>{status.effectiveDeformation.toUpperCase()}</span>
					<span class="status-label">Chosen deform</span>
					<span class="status-value" class:muted={pipelineStages.deformation !== status.effectiveDeformation} class:gpu={pipelineStages.deformation === 'gpu'}>{pipelineStages.deformation.toUpperCase()}</span>
					<span class="status-label">Bodies</span>
					<span class="status-value">{status.bodyCount}</span>
					<span class="status-label">Caps</span>
					<span class="status-value caps" title="A animation · D deformation · R raster (WebGPU)">
						{status.gpuCaps.animation ? 'A' : '–'}{status.gpuCaps.deformation ? 'D' : '–'}R
					</span>
				</div>
				{#if pipelineStages.animation !== status.effectiveAnimation || pipelineStages.deformation !== status.effectiveDeformation}
				<div class="fallback-note">
					Chosen GPU but running CPU for one or both stages — usually WebGPU still starting or unsupported.
				</div>
				{/if}
				{#if status.skillName}
				<div class="anim-info">
					<span class="anim-skill">{status.skillName}</span>
					<span class="anim-time">t={status.elapsed.toFixed(3)} f={status.animFrame}/{status.animFrames}</span>
				</div>
				{/if}
				{#if statusAny?.gpuLimits}
				<div class="gpu-limits">
					maxBuffer {formatMiB(statusAny.gpuLimits.maxBufferSize)} ·
					maxStorageBind {formatMiB(statusAny.gpuLimits.maxStorageBufferBindingSize)} ·
					wgX {statusAny.gpuLimits.maxComputeWorkgroupSizeX}
				</div>
				{/if}
				{#if status.webgpuPending}
				<div class="webgpu-banner">
					WebGPU initializing…
				</div>
				{:else if status.webgpuFailed}
				<div class="webgpu-banner webgpu-banner-err">
					WebGPU unavailable
				</div>
				{/if}
			</fieldset>

			{/if}

			<fieldset class="playback">
				<legend>Playback</legend>
				<div class="debug-row">
					<button type="button" title="Pause or resume" onclick={() => stage?.togglePause()}>{stage?.paused ? '▶ Play' : '⏸ Pause'}</button>
					<button type="button" title="Advance one frame" onclick={() => stage?.stepFrame?.(33)}>→ Step</button>
					<button type="button" title="Advance one eighth frame" onclick={() => stage?.stepFrame?.(8)}>→ ⅛</button>
					<button type="button" title="Step back one frame" onclick={() => stage?.stepFrame?.(-33)}>← Back</button>
				</div>
			</fieldset>

			<fieldset>
				<legend>Choose backend</legend>
				<p class="pipeline-help tight">Click CPU or GPU. Rasterization is always WebGPU (no CPU draw path).</p>
				<div class="debug-row">
					<span class="row-label">Animation</span>
					<button
						type="button"
						class:active={pipelineStages.animation === 'cpu'}
						title="CPU animation"
						onclick={() => setStages('cpu', pipelineStages.deformation as 'cpu' | 'gpu')}
					>CPU</button>
					<button
						type="button"
						class:active={pipelineStages.animation === 'gpu'}
						disabled={!status?.gpuCaps?.animation}
						title={!status
							? 'Status loading'
							: !status.gpuCaps.animation
								? gpuAnimDisableReason(status)
								: 'GPU animation'}
						onclick={() => setStages('gpu', pipelineStages.deformation as 'cpu' | 'gpu')}
					>GPU</button>
				</div>
				<div class="debug-row">
					<span class="row-label">Deformation</span>
					<button
						type="button"
						class:active={pipelineStages.deformation === 'cpu'}
						title="CPU deformation"
						onclick={() => setStages(pipelineStages.animation as 'cpu' | 'gpu', 'cpu')}
					>CPU</button>
					<button
						type="button"
						class:active={pipelineStages.deformation === 'gpu'}
						disabled={!status?.gpuCaps?.deformation}
						title={!status
							? 'Status loading'
							: !status.gpuCaps.deformation
								? gpuDeformDisableReason(status)
								: 'GPU deformation'}
						onclick={() => setStages(pipelineStages.animation as 'cpu' | 'gpu', 'gpu')}
					>GPU</button>
				</div>
				<div class="debug-row">
					<span class="row-label">Rasterization</span>
					<span class="debug-fixed" title="Raster uses WebGPU only">WebGPU</span>
				</div>
			</fieldset>

			<fieldset>
				<legend>Validation</legend>
				<div class="debug-row">
					<span class="row-label">Enabled</span>
					<button
						type="button"
						title="Turn validation on or off"
						class:active={validation.enabled}
						onclick={() => setValidation({ enabled: !validation.enabled })}
					>{validation.enabled ? 'ON' : 'OFF'}</button>
				</div>
				{#if validation.enabled}
				<div class="debug-row">
					<span class="row-label">Compare</span>
					<button
						type="button"
						title="Compare animation CPU vs GPU"
						class:active={validation.compareAnimation}
						onclick={() => setValidation({ compareAnimation: !validation.compareAnimation })}
					>Anim</button>
					<button
						type="button"
						title="Compare deformation CPU vs GPU"
						class:active={validation.compareDeformation}
						onclick={() => setValidation({ compareDeformation: !validation.compareDeformation })}
					>Deform</button>
				</div>
				<div class="debug-row">
					<span class="row-label">Cadence</span>
					{#each cadenceOptions as n}
						<button
							type="button"
							class="small"
							class:active={validation.everyNFrames === n}
							title="Run every {n} frames"
							onclick={() => setValidation({ everyNFrames: n })}
						>{n}</button>
					{/each}
				</div>
				<div class="debug-row">
					<span class="row-label">Epsilon</span>
					<select
						title="Numeric tolerance"
						onchange={(e) => setValidation({ maxAbsError: parseFloat((e.target as HTMLSelectElement).value) })}
					>
						{#each epsilonOptions as ep}
							<option value={ep} selected={validation.maxAbsError === ep}>{ep.toExponential(0)}</option>
						{/each}
					</select>
				</div>
				<div class="debug-row">
					<span class="row-label">Throw</span>
					<button
						type="button"
						title="Throw on CPU/GPU mismatch"
						class:active={validation.throwOnMismatch}
						onclick={() => setValidation({ throwOnMismatch: !validation.throwOnMismatch })}
					>{validation.throwOnMismatch ? 'ON' : 'OFF'}</button>
				</div>
				{/if}
			</fieldset>

			{#if status && (status.lastValidation.anim || status.lastValidation.deform)}
			<fieldset class="validation-results">
				<legend>Last validation (f{status.lastValidation.frame})</legend>
				<div class="val-meta">
					anim {status.lastValidationStructured.animation.length} / fail
					{status.lastValidationStructured.animation.filter((r) => !r.ok).length}
					<br />
					deform {status.lastValidationStructured.deformation.length} / fail
					{status.lastValidationStructured.deformation.filter((r) => !r.ok).length}
				</div>
				<div class="val-scroll">
					{#if status.lastValidation.anim}
					<div
						class="val-block"
						class:val-ok={status.lastValidation.anim.includes('OK')}
						class:val-err={!status.lastValidation.anim.includes('OK')}
					>
						<div class="val-line-head"><span class="val-tag">Anim</span></div>
						<pre class="val-pre">{formatValidationDetail(status.lastValidation.anim)}</pre>
					</div>
					{/if}
					{#if status.lastValidation.deform}
					<div
						class="val-block"
						class:val-ok={status.lastValidation.deform.includes('OK')}
						class:val-err={!status.lastValidation.deform.includes('OK')}
					>
						<div class="val-line-head"><span class="val-tag">Deform</span></div>
						<pre class="val-pre">{formatValidationDetail(status.lastValidation.deform)}</pre>
					</div>
					{/if}
				</div>
			</fieldset>
			{/if}
		</div>
</div>
