import type { ContentIndex, SceneDef, CharacterDef } from 'mooshow';

export function createAppState() {
	let contentIndex = $state<ContentIndex | null>(null);
	let currentSceneIndex = $state<number>(-1);
	let selectedActor = $state<number>(-1);
	let currentAnimation = $state<string | null>(null);
	let paused = $state(false);
	let loading = $state(true);
	let loadingMessage = $state('');
	let skillNames = $state<string[]>([]);
	let actorNames = $state<string[]>([]);
	let selectedCharacter = $state<number>(-1);

	return {
		get contentIndex() { return contentIndex; },
		set contentIndex(v) { contentIndex = v; },
		get currentSceneIndex() { return currentSceneIndex; },
		set currentSceneIndex(v) { currentSceneIndex = v; },
		get selectedActor() { return selectedActor; },
		set selectedActor(v) { selectedActor = v; },
		get currentAnimation() { return currentAnimation; },
		set currentAnimation(v) { currentAnimation = v; },
		get paused() { return paused; },
		set paused(v) { paused = v; },
		get loading() { return loading; },
		set loading(v) { loading = v; },
		get loadingMessage() { return loadingMessage; },
		set loadingMessage(v) { loadingMessage = v; },
		get skillNames() { return skillNames; },
		set skillNames(v) { skillNames = v; },
		get actorNames() { return actorNames; },
		set actorNames(v) { actorNames = v; },
		get selectedCharacter() { return selectedCharacter; },
		set selectedCharacter(v) { selectedCharacter = v; },

		get scenes(): SceneDef[] {
			return (contentIndex as any)?.scenes ?? [];
		},

		get characters(): CharacterDef[] {
			return (contentIndex as any)?.characters ?? [];
		},

		get filteredSkillNames(): string[] {
			const blacklist = ['twiststart', 'twiststop', '-start', '-stop', '-walkon', '-walkoff', '-divein', '-jumpin', 'a2o-stand', 'c2o-'];
			return skillNames.filter(name => {
				const l = name.toLowerCase();
				return !blacklist.some(b => l.includes(b));
			});
		}
	};
}
