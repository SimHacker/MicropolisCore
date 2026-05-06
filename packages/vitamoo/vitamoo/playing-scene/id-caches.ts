import type { CharacterTemplate, PlayingSceneDefinition } from './types.js';

/** Build `id → template` for O(1) lookup after load. */
export function characterTemplateById(
    templates: CharacterTemplate[],
): Map<string, CharacterTemplate> {
    const m = new Map<string, CharacterTemplate>();
    for (const t of templates) {
        if (m.has(t.id)) {
            throw new Error(`[playing-scene] Duplicate character template id "${t.id}"`);
        }
        m.set(t.id, t);
    }
    return m;
}

/** Build `id → playing scene definition`. */
export function playingSceneById(scenes: PlayingSceneDefinition[]): Map<string, PlayingSceneDefinition> {
    const m = new Map<string, PlayingSceneDefinition>();
    for (const s of scenes) {
        if (m.has(s.id)) {
            throw new Error(`[playing-scene] Duplicate playing scene id "${s.id}"`);
        }
        m.set(s.id, s);
    }
    return m;
}
