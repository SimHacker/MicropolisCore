import type { Body } from '../runtime/types.js';
import { createVoiceChain, updateVoiceChain, resolveVoiceParams, playGreet } from './voice.js';
import type { VoiceChain } from './voice.js';

export class SoundEngine {
    private _ctx: AudioContext | null = null;
    private _bodyChains: VoiceChain[] = [];

    private _ensureCtx(): AudioContext | null {
        if (!this._ctx) {
            try {
                this._ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch { return null; }
        }
        if (this._ctx.state === 'suspended') this._ctx.resume();
        return this._ctx;
    }

    ensureAudio(): void {
        this._ensureCtx();
    }

    updateSpinSound(
        rotationVelocity: number,
        bodies: Body[],
        selectedActorIndex: number
    ): void {
        const ctx = this._ctx;
        if (!ctx) return;
        const speed = Math.abs(rotationVelocity);
        const now = ctx.currentTime;

        if (bodies.length === 0) {
            for (const chain of this._bodyChains) {
                chain.masterGain.gain.setTargetAtTime(0, now, 0.05);
            }
            return;
        }

        this._ensureBodyChains(bodies.length);
        for (let i = 0; i < bodies.length; i++) {
            const chain = this._bodyChains[i];
            if (!chain) continue;
            const b = bodies[i];
            const isActive = (selectedActorIndex < 0 || i === selectedActorIndex);
            if (!isActive) {
                chain.masterGain.gain.setTargetAtTime(0, now, 0.05);
                continue;
            }
            const voice = resolveVoiceParams(b.personData);
            const driftX = b.top.active ? b.top.driftX : 0;
            updateVoiceChain(chain, voice, b.top, b.x + driftX, speed, now, bodies.length);
        }
    }

    simlishGreet(actorIdx: number, bodies: Body[]): void {
        this.ensureAudio();
        const ctx = this._ctx;
        if (!ctx) return;

        const greetBodies: Body[] = [];
        if (actorIdx >= 0 && actorIdx < bodies.length) {
            greetBodies.push(bodies[actorIdx]);
        } else if (actorIdx < 0) {
            const step = Math.max(1, Math.floor(bodies.length / 6));
            for (let i = 0; i < bodies.length; i += step) greetBodies.push(bodies[i]);
        }
        if (greetBodies.length === 0) return;

        const vol = 0.15 / Math.sqrt(greetBodies.length);
        for (const b of greetBodies) {
            const voice = resolveVoiceParams(b.personData);
            playGreet(ctx, voice, b.x || 0, vol);
        }
    }

    silenceAll(): void {
        const ctx = this._ctx;
        if (!ctx) return;
        const now = ctx.currentTime;
        for (const chain of this._bodyChains) {
            chain.masterGain.gain.setTargetAtTime(0, now, 0.05);
        }
    }

    private _ensureBodyChains(count: number): void {
        const ctx = this._ctx;
        if (!ctx) return;
        while (this._bodyChains.length < count) {
            this._bodyChains.push(createVoiceChain(ctx));
        }
        const now = ctx.currentTime;
        for (let i = count; i < this._bodyChains.length; i++) {
            this._bodyChains[i].masterGain.gain.setTargetAtTime(0, now, 0.05);
        }
    }
}
