/**
 * Progress Store (Svelte 5 runes) — v2
 * Tracks per-level stars, unlocked worlds, and completion status.
 * Persisted to localStorage.
 */

import { worlds } from '$lib/data/phonics-curriculum';

interface LevelProgress {
	stars: number; // 0-3
	completed: boolean;
	attempts: number;
}

interface ProgressState {
	levels: Record<string, LevelProgress>; // key: "worldId/levelId"
	totalStars: number;
	levelsCompleted: number;
	trophies: string[]; // trophy IDs earned
}

const STORAGE_KEY = 'phonicslearn-progress-v2';

function loadProgress(): ProgressState {
	if (typeof window === 'undefined') return getDefaultState();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// ignore
	}
	return getDefaultState();
}

function getDefaultState(): ProgressState {
	return {
		levels: {},
		totalStars: 0,
		levelsCompleted: 0,
		trophies: [],
	};
}

function saveProgress(state: ProgressState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// storage full
	}
}

function createProgressStore() {
	let state = $state<ProgressState>(loadProgress());

	function key(worldId: string, levelId: string) {
		return `${worldId}/${levelId}`;
	}

	return {
		get state() { return state; },
		get totalStars() { return state.totalStars; },
		get trophies() { return state.trophies; },

		getLevelProgress(worldId: string, levelId: string): LevelProgress {
			return state.levels[key(worldId, levelId)] ?? { stars: 0, completed: false, attempts: 0 };
		},

		isLevelUnlocked(_worldId: string, _levelId: string): boolean {
			// All levels unlocked for now during development
			return true;
		},

		isWorldUnlocked(_worldId: string): boolean {
			// All worlds unlocked for now during development
			return true;
		},

		getWorldStars(worldId: string): number {
			const world = worlds.find((w) => w.id === worldId);
			if (!world) return 0;
			return world.levels.reduce((sum, l) => sum + this.getLevelProgress(worldId, l.id).stars, 0);
		},

		getWorldMaxStars(worldId: string): number {
			const world = worlds.find((w) => w.id === worldId);
			return (world?.levels.length ?? 0) * 3;
		},

		getWorldCompletedLevels(worldId: string): number {
			const world = worlds.find((w) => w.id === worldId);
			if (!world) return 0;
			return world.levels.filter((l) => this.getLevelProgress(worldId, l.id).completed).length;
		},

		completeLevel(worldId: string, levelId: string, stars: number) {
			const k = key(worldId, levelId);
			const existing = state.levels[k];
			const prevStars = existing?.stars ?? 0;

			state.levels[k] = {
				stars: Math.max(stars, prevStars),
				completed: true,
				attempts: (existing?.attempts ?? 0) + 1,
			};

			// Recalculate totals
			state.totalStars = Object.values(state.levels).reduce((s, l) => s + l.stars, 0);
			state.levelsCompleted = Object.values(state.levels).filter((l) => l.completed).length;

			// Check world completion trophies
			const world = worlds.find((w) => w.id === worldId);
			if (world) {
				const allDone = world.levels.every((l) => state.levels[key(worldId, l.id)]?.completed);
				const trophyId = `world-${worldId}`;
				if (allDone && !state.trophies.includes(trophyId)) {
					state.trophies = [...state.trophies, trophyId];
				}
			}

			saveProgress(state);
		},

		resetAll() {
			state = getDefaultState();
			saveProgress(state);
		},
	};
}

export const progress = createProgressStore();
