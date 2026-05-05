import type { TopPhysicsState } from '../runtime/types.js';
import { TOP_MAX_TILT } from '../interaction/top-physics.js';

// Vowel formant targets (F1, F2, F3 in Hz) around the precession circle.
// As the character tilts and orbits, the voice sweeps through these.
const VOWELS: [number, number, number][] = [
    [270, 2300, 3000],  // "ee" — front, upright
    [300,  870, 2240],  // "oo" — leaning right, rounded
    [730, 1090, 2440],  // "aa" — leaning back, open
    [570,  840, 2410],  // "aw" — leaning left, closing
];

function lerpVowel(angle: number, tiltAmount: number): [number, number, number] {
    const t = angle / (Math.PI * 2);
    const idx = t * 4;
    const i0 = Math.floor(idx) % 4;
    const i1 = (i0 + 1) % 4;
    const frac = idx - Math.floor(idx);

    const swept: [number, number, number] = [
        VOWELS[i0][0] + (VOWELS[i1][0] - VOWELS[i0][0]) * frac,
        VOWELS[i0][1] + (VOWELS[i1][1] - VOWELS[i0][1]) * frac,
        VOWELS[i0][2] + (VOWELS[i1][2] - VOWELS[i0][2]) * frac,
    ];

    const ee = VOWELS[0];
    return [
        ee[0] + (swept[0] - ee[0]) * tiltAmount,
        ee[1] + (swept[1] - ee[1]) * tiltAmount,
        ee[2] + (swept[2] - ee[2]) * tiltAmount,
    ];
}

export interface VoiceParams {
    basePitch: number;      // fundamental frequency (Hz). Male ~100, female ~180, child ~220+
    pitchRange: number;     // how much pitch rises with spin speed
    formantScale: number;   // overall formant brightness multiplier
    breathiness: number;    // noise mix (0-1). Higher = airier voice
    vocalTract: number;     // vocal tract length factor (0.7-1.3). <1 = shorter (child/female), >1 = longer (deep male)
}

const DEFAULT_VOICE: VoiceParams = {
    basePitch: 100, pitchRange: 30, formantScale: 1.0, breathiness: 0.15, vocalTract: 1.0,
};

export function resolveVoiceParams(personData: any): VoiceParams {
    const v = personData?.voice;
    if (!v) return { ...DEFAULT_VOICE };
    return {
        basePitch: v.pitch ?? DEFAULT_VOICE.basePitch,
        pitchRange: v.range ?? DEFAULT_VOICE.pitchRange,
        formantScale: v.formant ?? DEFAULT_VOICE.formantScale,
        breathiness: v.breathiness ?? DEFAULT_VOICE.breathiness,
        vocalTract: v.vocalTract ?? DEFAULT_VOICE.vocalTract,
    };
}

export interface VoiceChain {
    glottal: OscillatorNode;
    glottal2: OscillatorNode;
    filters: BiquadFilterNode[];
    masterGain: GainNode;
    noiseGain: GainNode;
    panner: StereoPannerNode;
}

export function createVoiceChain(ctx: AudioContext): VoiceChain {
    const glottal = ctx.createOscillator();
    glottal.type = 'sawtooth';
    glottal.frequency.value = 120;

    const glottal2 = ctx.createOscillator();
    glottal2.type = 'sawtooth';
    glottal2.frequency.value = 120;
    glottal2.detune.value = 5 + Math.random() * 10;

    const noise = ctx.createBufferSource();
    const noiseLen = ctx.sampleRate * 2;
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    noise.buffer = noiseBuf;
    noise.loop = true;

    const srcGain = ctx.createGain();
    srcGain.gain.value = 1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;
    glottal.connect(srcGain);
    glottal2.connect(srcGain);
    noise.connect(noiseGain);
    noiseGain.connect(srcGain);

    const formantFreqs = [270, 2300, 3000];
    const formantQs = [5, 12, 8];
    const formantGains = [1.0, 0.6, 0.3];

    const filters: BiquadFilterNode[] = [];
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    const panner = ctx.createStereoPanner();
    panner.pan.value = 0;
    masterGain.connect(panner);
    panner.connect(ctx.destination);

    for (let i = 0; i < 3; i++) {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = formantFreqs[i];
        bp.Q.value = formantQs[i];
        const g = ctx.createGain();
        g.gain.value = formantGains[i];
        srcGain.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
        filters.push(bp);
    }

    glottal.start();
    glottal2.start();
    noise.start();

    return { glottal, glottal2, filters, masterGain, noiseGain, panner };
}

export function updateVoiceChain(
    chain: VoiceChain,
    voice: VoiceParams,
    bTop: TopPhysicsState,
    screenX: number,
    speed: number,
    now: number,
    numVoices: number
): void {
    if (speed > 0.5) {
        const rawTilt = bTop.active ? Math.min(bTop.tilt / TOP_MAX_TILT, 1.0) : 0;
        const tiltAmount = Math.pow(rawTilt, 0.6);
        const precAngle = bTop.active
            ? ((bTop.precessionAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
            : 0;

        const basePitch = voice.basePitch + Math.min(speed, 15) * voice.pitchRange;
        const wobbleDepth = tiltAmount * 60;
        const wobble1 = Math.sin(bTop.nutationPhase * 2.5) * wobbleDepth;
        const wobble2 = Math.sin(bTop.nutationPhase * 1.7 + 1.3) * wobbleDepth * 0.3;
        const pitch = basePitch + wobble1 + wobble2;
        chain.glottal.frequency.setTargetAtTime(pitch, now, 0.01);
        chain.glottal2.frequency.setTargetAtTime(pitch * 1.005, now, 0.01);

        const breathTilt = voice.breathiness + tiltAmount * 0.5;
        chain.noiseGain.gain.setTargetAtTime(breathTilt, now, 0.02);

        // Formant frequencies: base vowel sweep * formantScale * vocalTract.
        // vocalTract < 1 compresses formants upward (shorter tract = child/female timbre).
        // vocalTract > 1 stretches formants downward (longer tract = deep male timbre).
        // This is independent of pitch — you can have a low-pitched voice with a short
        // tract (cartoon character) or high-pitched with long tract (falsetto giant).
        const speedShift = 1 + Math.min(speed, 12) * 0.02;
        const [f1, f2, f3] = lerpVowel(precAngle, tiltAmount);
        const tract = voice.vocalTract;
        const fScale = speedShift * voice.formantScale;
        chain.filters[0].frequency.setTargetAtTime(f1 * fScale / tract, now, 0.015);
        chain.filters[1].frequency.setTargetAtTime(f2 * fScale / tract, now, 0.015);
        chain.filters[2].frequency.setTargetAtTime(f3 * fScale / tract, now, 0.015);

        // Q narrows with tilt (mouth opens wider)
        const qScale = 1 - tiltAmount * 0.6;
        // Tract length affects resonance sharpness: longer tract = sharper resonances
        const tractQ = 0.7 + tract * 0.3;
        chain.filters[0].Q.setTargetAtTime(5 * qScale * tractQ, now, 0.01);
        chain.filters[1].Q.setTargetAtTime(12 * qScale * tractQ, now, 0.01);
        chain.filters[2].Q.setTargetAtTime(8 * qScale * tractQ, now, 0.01);

        const perVoiceVol = Math.min(speed / 7, 0.25) / Math.sqrt(Math.max(numVoices, 1));
        const tiltBoost = 1 + tiltAmount * 1.2;
        chain.masterGain.gain.setTargetAtTime(perVoiceVol * tiltBoost, now, 0.02);

        if (chain.panner) {
            const pan = Math.max(-1, Math.min(1, screenX / 3));
            chain.panner.pan.setTargetAtTime(pan, now, 0.03);
        }
    } else {
        chain.masterGain.gain.setTargetAtTime(0, now, 0.1);
    }
}

// One-shot greeting using the same formant structure as the spin voice.
// Creates a brief exclamation that respects the character's full voice params.
export function playGreet(
    ctx: AudioContext,
    voice: VoiceParams,
    panX: number,
    volume: number,
): void {
    const now = ctx.currentTime;
    const dur = 0.25;
    const pitch = voice.basePitch + (Math.random() - 0.5) * 20;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch * 1.2, now);
    osc.frequency.linearRampToValueAtTime(pitch * 0.9, now + dur);

    const noiseNode = ctx.createBufferSource();
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3 | 0, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * voice.breathiness;
    noiseNode.buffer = noiseBuf;

    const srcMix = ctx.createGain();
    srcMix.gain.value = 1;
    osc.connect(srcMix);
    noiseNode.connect(srcMix);

    // 3-formant filter bank, same structure as the spin voice chain,
    // warped by vocalTract so each character's greeting sounds different
    const baseFormants = [600, 1200, 2400]; // "ah" vowel (open greeting)
    const baseQs = [4, 8, 6];
    const baseGains = [1.0, 0.5, 0.25];
    const tract = voice.vocalTract;
    const fScale = voice.formantScale;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.02);
    masterGain.gain.linearRampToValueAtTime(volume * 0.7, now + dur * 0.6);
    masterGain.gain.linearRampToValueAtTime(0, now + dur);

    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.max(-1, Math.min(1, panX / 5));
    masterGain.connect(pan);
    pan.connect(ctx.destination);

    for (let i = 0; i < 3; i++) {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(baseFormants[i] * fScale / tract, now);
        bp.frequency.linearRampToValueAtTime(baseFormants[i] * fScale / tract * 0.8, now + dur);
        bp.Q.value = baseQs[i] * (0.7 + tract * 0.3);
        const g = ctx.createGain();
        g.gain.value = baseGains[i];
        srcMix.connect(bp);
        bp.connect(g);
        g.connect(masterGain);
    }

    osc.start(now);
    osc.stop(now + dur + 0.05);
    noiseNode.start(now);
    noiseNode.stop(now + dur + 0.05);
}
