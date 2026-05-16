<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getWorld, getLevel } from '$lib/data/phonics-curriculum';
	import { progress } from '$lib/stores/progress.svelte';
	import PixiCanvas from '$lib/components/game/PixiCanvas.svelte';
	import LevelIntro from '$lib/components/game/LevelIntro.svelte';
	import { BubblePopGame } from '$lib/scenes/meadow/BubblePopGame';
	import { WordMachineGame } from '$lib/scenes/workshop/WordMachineGame';
	import { TreasureDiveGame } from '$lib/scenes/ocean/TreasureDiveGame';
	import { SpellCasterGame } from '$lib/scenes/castle/SpellCasterGame';
	import { WordExplorerGame } from '$lib/scenes/jungle/WordExplorerGame';
	import { StoryFlightGame } from '$lib/scenes/sky/StoryFlightGame';
	import ConfettiBurst from '$lib/components/feedback/ConfettiBurst.svelte';
	import type { GameApp } from '$lib/engine/game-app';
	import type { SceneManager } from '$lib/engine/scene-manager';

	const worldId = $derived($page.params.worldId);
	const levelId = $derived($page.params.levelId);
	const world = $derived(getWorld(worldId));
	const level = $derived(getLevel(worldId, levelId));

	let phase = $state<'intro' | 'playing' | 'complete'>('intro');
	let wordsCompleted = $state(0);
	let totalWords = $derived(level?.words.length ?? 0);
	let showConfetti = $state(false);

	function startPlaying() {
		phase = 'playing';
	}

	function createScene(app: GameApp, _sm: SceneManager) {
		if (!level) throw new Error('Level not found');

		const config = {
			words: level.words,
			distractors: level.distractors,
			requireOrder: level.requireOrder,
			hintDelay: level.hintDelay
		};
		const callbacks = {
			onWordComplete(_word: string) {
				wordsCompleted++;
			},
			onLevelComplete() {
				phase = 'complete';
				showConfetti = true;
				progress.completeLevel(worldId, levelId, 3);
			}
		};

		switch (worldId) {
			case 'workshop': return new WordMachineGame(app, config, callbacks);
			case 'ocean': return new TreasureDiveGame(app, config, callbacks);
			case 'castle': return new SpellCasterGame(app, config, callbacks);
			case 'jungle': return new WordExplorerGame(app, config, callbacks);
			case 'sky': return new StoryFlightGame(app, config, callbacks);
			default: return new BubblePopGame(app, config, callbacks);
		}
	}

	function goNext() {
		if (!world || !level) return goto(`/phonics`);
		const idx = world.levels.findIndex((l) => l.id === level.id);
		const next = world.levels[idx + 1];
		if (next) {
			goto(`/phonics/${worldId}/${next.id}`);
		} else {
			goto(`/phonics/${worldId}`);
		}
	}
</script>

<svelte:head>
	<title>{world?.name ?? 'Phonics'} — Level {levelId}</title>
</svelte:head>

<ConfettiBurst trigger={showConfetti} />

{#if !world || !level}
	<main class="game-page">
		<div class="not-found">
			<p>Level not found!</p>
			<a href="/phonics">Back to Worlds</a>
		</div>
	</main>
{:else if phase === 'intro'}
	<LevelIntro
		mascot={world.mascot}
		storyText={level.storyIntro ?? world.worldStory}
		onStart={startPlaying}
	/>
{:else if phase === 'complete'}
	<main class="complete-screen">
		<div class="complete-mascot">{world.mascot}</div>
		<h1 class="complete-title">Amazing!</h1>
		<div class="stars-row">
			<span class="material-symbols-outlined star-icon" style="font-variation-settings: 'FILL' 1;">star</span>
			<span class="material-symbols-outlined star-icon" style="font-variation-settings: 'FILL' 1;">star</span>
			<span class="material-symbols-outlined star-icon" style="font-variation-settings: 'FILL' 1;">star</span>
		</div>
		<div class="words-card">
			<p class="words-label">You learned {totalWords} words!</p>
			<div class="word-pills">
				{#each level.words as word}
					<span class="word-pill">{word}</span>
				{/each}
			</div>
		</div>
		<button class="continue-btn" onclick={goNext}>
			Continue
		</button>
	</main>
{:else}
	<main class="game-page">
		<header class="game-header">
			<a href="/phonics/{worldId}" class="back-btn">
				<span class="material-symbols-outlined">arrow_back</span>
			</a>
			<div class="level-info">
				<span class="world-mascot">{world.mascot}</span>
				<span class="level-badge">Level {levelId}</span>
			</div>
			<div class="progress-indicator">
				{wordsCompleted}/{totalWords}
			</div>
		</header>

		<div class="canvas-wrapper">
			<PixiCanvas scene={createScene} />
		</div>
	</main>
{/if}

<style>
	.game-page {
		height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--bg-main);
	}

	.game-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		flex-shrink: 0;
	}

	.back-btn {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-full);
		background: white;
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		color: var(--secondary);
	}

	.level-info {
		display: flex;
		gap: 8px;
		align-items: center;
		flex: 1;
	}

	.world-mascot {
		font-size: 1.8rem;
	}

	.level-badge {
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-mid);
	}

	.progress-indicator {
		font-weight: 800;
		font-size: 1.1rem;
		color: var(--secondary);
		background: white;
		padding: 6px 14px;
		border-radius: var(--radius-full);
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	}

	.canvas-wrapper {
		flex: 1;
		margin: 0 8px 8px;
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.not-found {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		text-align: center;
	}

	.not-found a {
		color: var(--primary);
		font-weight: 700;
	}

	/* Complete Screen — matches Stitch "Lesson Complete" */
	.complete-screen {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		gap: 20px;
		background: linear-gradient(180deg, #FFF8F0 0%, #FFD6E0 100%);
	}

	.complete-mascot {
		font-size: 6rem;
		animation: fox-bounce 2s ease-in-out infinite;
	}

	.complete-title {
		font-size: 3rem;
		color: var(--primary);
		text-shadow: 0 4px 0 white;
	}

	.stars-row {
		display: flex;
		gap: 12px;
	}

	.star-icon {
		font-size: 3.5rem;
		color: var(--gold);
		filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4));
	}

	.words-card {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(8px);
		border-radius: var(--radius-md);
		padding: 20px 28px;
		text-align: center;
		box-shadow: 0 8px 30px rgba(255, 107, 157, 0.15);
		border: 4px solid white;
		width: 100%;
		max-width: 360px;
	}

	.words-label {
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--secondary);
		margin-bottom: 12px;
	}

	.word-pills {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
	}

	.word-pill {
		padding: 8px 20px;
		font-weight: 900;
		font-size: 1.3rem;
		color: white;
		border-radius: var(--radius-full);
		box-shadow: 0 4px 0 rgba(0,0,0,0.15);
		border: 2px solid rgba(255,255,255,0.2);
	}

	.word-pill:nth-child(4n+1) { background: var(--primary); }
	.word-pill:nth-child(4n+2) { background: var(--secondary); }
	.word-pill:nth-child(4n+3) { background: var(--tertiary); }
	.word-pill:nth-child(4n) { background: var(--success); }

	.continue-btn {
		width: 100%;
		max-width: 300px;
		height: 72px;
		background: var(--primary);
		color: white;
		font-family: var(--font-headline);
		font-weight: 900;
		font-size: 1.4rem;
		border-radius: var(--radius-full);
		box-shadow: 0 8px 0 0 var(--primary-dark);
		transition: transform 0.1s, box-shadow 0.1s;
		margin-top: 8px;
	}

	.continue-btn:active {
		transform: translateY(4px);
		box-shadow: 0 4px 0 0 var(--primary-dark);
	}
</style>
