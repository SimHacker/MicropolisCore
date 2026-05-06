// VitaMoo animation — multi-practice compositing system.
//
// Full reimplementation of the vitaboy Practice system (Don Hopkins, Maxis, 1997),
// inspired by Ken Perlin's Improv:
//
//   - Multiple Practices active simultaneously on a Skeleton
//   - Priority-sorted compositing (low priority applied first, high overwrites/blends on top)
//   - Weight-based blending (0.0 = no effect, 1.0 = full; weighted average with bone's current value)
//   - Opaque flag + per-bone priority optimization (opaque practices occlude lower-priority ones)
//   - Fading (smooth weight transitions: FadeIn, FadeOut, stopWhenFaded auto-removal)
//   - Per-bone capability gates (canTranslate, canRotate, canBlend)
//   - Animation events via timeProps (fire callbacks when elapsed crosses time boundaries)
//
// The compositing model is a painter's algorithm: practices are applied lowest-priority-first.
// Each practice either overwrites the bone (weight=1 or !canBlend) or blends with whatever
// value the bone already holds from lower-priority practices.

import {
    Vec3, Quat, Bone, SkillData, MotionData,
    vec3, quat, vec3Lerp, quatNlerp,
} from './types.js';

export const RepeatMode = {
    Hold: 0,
    Loop: 1,
    PingPong: 2,
    Fade: 3,
} as const;

export type RepeatModeType = typeof RepeatMode[keyof typeof RepeatMode];

export type SkeletonEventHandler = (
    practice: Practice,
    bone: Bone,
    motion: MotionData,
    props: Map<string, string>,
    elapsed: number,
) => void;

interface PracticeBinding {
    motion: MotionData;
    bone: Bone;
    lastPropsElapsed: number;
}

export interface PracticeOptions {
    priority?: number;
    weight?: number;
    scale?: number;
    opaque?: boolean;
    repeatMode?: RepeatModeType;
    mixRootTranslation?: boolean;
    mixRootRotation?: boolean;
}

export class Practice {
    skill: SkillData;
    bindings: PracticeBinding[];
    elapsed: number = 0;
    scale: number = 1;
    duration: number;
    repeatMode: RepeatModeType = RepeatMode.Loop;
    lastTicks: number = 0;
    ready: boolean = false;

    priority: number = 1;
    weight: number = 1.0;
    opaque: boolean = true;

    fading: number = 0;
    fadeStartTime: number = 0;
    fadeDuration: number = 0;
    fadeStartWeight: number = 1.0;
    fadeEndWeight: number = 0.0;
    stopWhenFaded: boolean = false;

    mixRootTranslation: boolean = true;
    mixRootRotation: boolean = true;

    onEvent: SkeletonEventHandler | null = null;

    private _root: Bone | null = null;

    constructor(skill: SkillData, bones: Bone[], options?: PracticeOptions) {
        this.skill = skill;
        this.duration = skill.duration || 1999;

        const boneMap = new Map<string, Bone>();
        for (const bone of bones) boneMap.set(bone.name, bone);
        this._root = bones.find(b => !b.parent) ?? null;

        this.bindings = [];
        for (const motion of skill.motions) {
            const bone = boneMap.get(motion.boneName);
            if (bone) {
                this.bindings.push({ motion, bone, lastPropsElapsed: -1 });
            }
        }

        this.ready = skill.translations.length > 0 || skill.rotations.length > 0;

        if (options) {
            if (options.priority !== undefined) this.priority = options.priority;
            if (options.weight !== undefined) this.weight = options.weight;
            if (options.scale !== undefined) this.scale = options.scale;
            if (options.opaque !== undefined) this.opaque = options.opaque;
            if (options.repeatMode !== undefined) this.repeatMode = options.repeatMode;
            if (options.mixRootTranslation !== undefined) this.mixRootTranslation = options.mixRootTranslation;
            if (options.mixRootRotation !== undefined) this.mixRootRotation = options.mixRootRotation;
        }
    }

    /** Advance elapsed time and handle repeat modes + fading. Does NOT apply motions. */
    tick(ticks: number): void {
        if (!this.ready) return;

        if (this.lastTicks === 0) {
            this.lastTicks = ticks;
            return;
        }

        const ticksDelta = ticks - this.lastTicks;
        this.lastTicks = ticks;

        if (this.fading !== 0 && this.fadeDuration > 0) {
            const fadeElapsed = ticks - this.fadeStartTime;
            if (fadeElapsed >= this.fadeDuration) {
                this.weight = this.fadeEndWeight;
                this.fading = 0;
            } else {
                const t = fadeElapsed / this.fadeDuration;
                this.weight = this.fadeStartWeight + (this.fadeEndWeight - this.fadeStartWeight) * t;
            }
        }

        if (this.duration <= 0 || this.scale === 0) return;

        const elapsedDelta = (ticksDelta / this.duration) * Math.abs(this.scale);
        this.elapsed += this.scale < 0 ? -elapsedDelta : elapsedDelta;

        if (this.elapsed >= 1.0 || this.elapsed < 0) {
            switch (this.repeatMode) {
                case RepeatMode.Hold:
                    this.elapsed = Math.max(0, Math.min(1, this.elapsed));
                    this.scale = 0;
                    break;
                case RepeatMode.Loop:
                    this.elapsed = this.elapsed - Math.floor(this.elapsed);
                    if (this.elapsed < 0) this.elapsed += 1;
                    break;
                case RepeatMode.PingPong:
                    this.scale = -this.scale;
                    this.elapsed = this.elapsed - Math.floor(this.elapsed);
                    if (this.elapsed < 0) this.elapsed = 1 + this.elapsed;
                    break;
                case RepeatMode.Fade:
                    this.elapsed = Math.max(0, Math.min(1, this.elapsed));
                    this.scale = 0;
                    break;
            }
        }
    }

    /**
     * Apply this practice's motions to bones, respecting weight, per-bone flags,
     * and bone priority (opaque occlusion). Called by applyPractices in priority order.
     */
    apply(): void {
        if (this.weight <= 0 || !this.ready) return;

        const skill = this.skill;
        const w = this.weight;

        for (const binding of this.bindings) {
            const { motion, bone } = binding;

            if (bone.priority > this.priority) continue;

            const frames = motion.frames;
            if (frames <= 0) continue;

            const isRoot = bone === this._root;

            const frameReal = Math.max(0, Math.min(frames - 0.001, frames * this.elapsed));
            const frame = Math.floor(frameReal);
            const tween = frameReal - frame;

            let nextFrame = frame + 1;
            if (nextFrame >= frames) {
                nextFrame = this.repeatMode === RepeatMode.Loop ? 0 : frame;
            }

            if (motion.hasTranslation && bone.canTranslate && skill.translations.length > 0) {
                if (!isRoot || this.mixRootTranslation) {
                    const i0 = motion.translationsOffset + frame;
                    const i1 = motion.translationsOffset + nextFrame;
                    if (i0 < skill.translations.length) {
                        const t0 = skill.translations[i0];
                        const t1 = i1 < skill.translations.length ? skill.translations[i1] : t0;
                        const t = tween > 0.001 ? vec3Lerp(t0, t1, tween) : t0;

                        if (w >= 1.0 || !bone.canBlend) {
                            bone.position = t;
                        } else {
                            const w1 = 1 - w;
                            bone.position = vec3(
                                t.x * w + bone.position.x * w1,
                                t.y * w + bone.position.y * w1,
                                t.z * w + bone.position.z * w1,
                            );
                        }
                    }
                }
            }

            if (motion.hasRotation && bone.canRotate && skill.rotations.length > 0) {
                if (!isRoot || this.mixRootRotation) {
                    const i0 = motion.rotationsOffset + frame;
                    const i1 = motion.rotationsOffset + nextFrame;
                    if (i0 < skill.rotations.length) {
                        const r0 = skill.rotations[i0];
                        const r1 = i1 < skill.rotations.length ? skill.rotations[i1] : r0;
                        const q = tween > 0.001 ? quatNlerp(r0, r1, tween) : r0;

                        if (w >= 1.0 || !bone.canBlend) {
                            bone.rotation = q;
                        } else {
                            bone.rotation = quatNlerp(bone.rotation, q, w);
                        }
                    }
                }
            }

            if (this.onEvent && motion.timeProps.size > 0) {
                this._fireEvents(binding, bone, motion);
            }
        }
    }

    /** Stamp bone priorities for opaque occlusion optimization. */
    updatePriority(): void {
        if (!this.opaque) return;
        for (const { bone } of this.bindings) {
            bone.priority = this.priority;
        }
    }

    fadeIn(now: number, duration: number, endWeight: number = 1.0): void {
        this.fade(now, duration, 0, endWeight);
        this.stopWhenFaded = false;
    }

    fadeOut(now: number, duration: number): void {
        this.fade(now, duration, this.weight, 0);
        this.stopWhenFaded = true;
    }

    fade(now: number, duration: number, startWeight: number, endWeight: number): void {
        this.fading = endWeight > startWeight ? 1 : -1;
        this.fadeStartTime = now;
        this.fadeDuration = duration;
        this.fadeStartWeight = startWeight;
        this.fadeEndWeight = endWeight;
        this.weight = startWeight;
    }

    private _fireEvents(binding: PracticeBinding, bone: Bone, motion: MotionData): void {
        const currentElapsed = this.elapsed;
        const lastElapsed = binding.lastPropsElapsed;
        binding.lastPropsElapsed = currentElapsed;
        if (lastElapsed < 0) return;

        const wrappedLoop = this.repeatMode === RepeatMode.Loop && currentElapsed < lastElapsed;
        for (const [time, props] of motion.timeProps) {
            const normalizedTime = time / (this.duration || 1);
            const crossed = wrappedLoop
                ? (normalizedTime > lastElapsed || normalizedTime <= currentElapsed)
                : (normalizedTime > lastElapsed && normalizedTime <= currentElapsed);
            if (crossed) {
                this.onEvent!(this, bone, motion, props, normalizedTime);
            }
        }
    }
}

/**
 * Apply all practices to a skeleton's bones — the vitaboy compositing loop.
 *
 * Matches the original Skeleton::ApplyPractices:
 *   1. Tick all practices (advance time, handle repeats and fading)
 *   2. Sort by priority ascending (lowest first = background)
 *   3. Reset all bone priorities to -10000
 *   4. Stamp opaque practice priorities onto bones
 *   5. Apply each practice in order (motions blend into bones)
 *   6. Reap dead practices (stopWhenFaded && weight <= 0)
 *   7. Wiggle (stubbed — was an experiment to mess with Irk the animator's mind)
 */
export function applyPractices(practices: Practice[], bones: Bone[], ticks: number): void {
    for (const p of practices) p.tick(ticks);

    practices.sort((a, b) => a.priority - b.priority);

    for (const bone of bones) bone.priority = -10000;
    for (const p of practices) p.updatePriority();

    for (const p of practices) p.apply();

    for (let i = practices.length - 1; i >= 0; i--) {
        if (practices[i].stopWhenFaded && practices[i].weight <= 0) {
            practices.splice(i, 1);
        }
    }

    // Bone wiggle: Perlin noise perturbation of bone rotations.
    // Stubbed. The original vitaboy had canWiggle + wigglePower + QuatNoise
    // on each bone, applied after all practices. It added subtle procedural
    // variation to make characters feel alive. It was also an experiment by
    // Don Hopkins to mess with Irk (Eric Hedman) the animator's mind.
    // He has since forgiven Don. Not implemented — enable later if needed.
}
