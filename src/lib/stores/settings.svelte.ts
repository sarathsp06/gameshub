/**
 * Settings Store (Svelte 5 runes)
 * Audio controls, companion preferences, parent gate.
 */

interface SettingsState {
	soundEnabled: boolean;
	musicEnabled: boolean;
	voiceEnabled: boolean; // TTS for instructions
	parentGateUnlocked: boolean;
	lessonsThisSession: number;
}

const STORAGE_KEY = 'phonicslearn-settings';

function loadSettings(): SettingsState {
	if (typeof window === 'undefined') return getDefaults();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return { ...getDefaults(), ...JSON.parse(raw) };
	} catch {
		// ignore
	}
	return getDefaults();
}

function getDefaults(): SettingsState {
	return {
		soundEnabled: true,
		musicEnabled: true,
		voiceEnabled: true,
		parentGateUnlocked: false,
		lessonsThisSession: 0,
	};
}

function save(state: SettingsState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

function createSettingsStore() {
	let state = $state<SettingsState>(loadSettings());

	return {
		get soundEnabled() {
			return state.soundEnabled;
		},
		get musicEnabled() {
			return state.musicEnabled;
		},
		get voiceEnabled() {
			return state.voiceEnabled;
		},
		get lessonsThisSession() {
			return state.lessonsThisSession;
		},
		get shouldSuggestBreak() {
			return state.lessonsThisSession >= 4;
		},

		toggleSound() {
			state.soundEnabled = !state.soundEnabled;
			save(state);
		},
		toggleMusic() {
			state.musicEnabled = !state.musicEnabled;
			save(state);
		},
		toggleVoice() {
			state.voiceEnabled = !state.voiceEnabled;
			save(state);
		},
		incrementLessons() {
			state.lessonsThisSession++;
		},
		resetSession() {
			state.lessonsThisSession = 0;
		},
	};
}

export const settings = createSettingsStore();
