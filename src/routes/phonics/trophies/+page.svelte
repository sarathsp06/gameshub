<script lang="ts">
	import { worlds } from '$lib/data/phonics-curriculum';
	import { progress } from '$lib/stores/progress.svelte';

	const trophyDefs = worlds.map((w) => ({
		id: `world-${w.id}`,
		emoji: w.emoji,
		name: `${w.name} Master`,
		desc: `Complete all ${w.name} levels`,
	}));
</script>

<svelte:head>
	<title>Trophy Room — PhonicsLearn</title>
</svelte:head>

<main class="trophy-page">
	<header class="trophy-header">
		<a href="/phonics" class="back-btn">Worlds</a>
		<h1 class="trophy-title">Trophy Room</h1>
	</header>

	<div class="stats-bar">
		<div class="stat">
			<span class="stat-val">{progress.totalStars}</span>
			<span class="stat-label">Stars</span>
		</div>
		<div class="stat">
			<span class="stat-val">{progress.state.levelsCompleted}</span>
			<span class="stat-label">Levels</span>
		</div>
		<div class="stat">
			<span class="stat-val">{progress.trophies.length}</span>
			<span class="stat-label">Trophies</span>
		</div>
	</div>

	<div class="trophy-grid">
		{#each trophyDefs as trophy (trophy.id)}
			{@const earned = progress.trophies.includes(trophy.id)}
			<div class="trophy-card" class:earned>
				<span class="trophy-emoji">{trophy.emoji}</span>
				<h3 class="trophy-name">{trophy.name}</h3>
				<p class="trophy-desc">{trophy.desc}</p>
				{#if earned}
					<span class="earned-badge">Earned!</span>
				{:else}
					<span class="locked-badge">Locked</span>
				{/if}
			</div>
		{/each}
	</div>
</main>

<style>
	.trophy-page {
		min-height: 100dvh;
		padding: 24px;
		max-width: 700px;
		margin: 0 auto;
	}

	.trophy-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
	}

	.back-btn {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--text-mid);
		padding: 10px 16px;
		border-radius: var(--radius-md);
		background: var(--white);
		box-shadow: var(--shadow-soft);
		min-height: 44px;
		display: flex;
		align-items: center;
	}

	.trophy-title {
		font-size: clamp(1.5rem, 5vw, 2.2rem);
		color: var(--coral);
	}

	.stats-bar {
		display: flex;
		gap: 16px;
		margin-bottom: 28px;
	}

	.stat {
		flex: 1;
		background: var(--white);
		border-radius: var(--radius-lg);
		padding: 16px;
		text-align: center;
		box-shadow: var(--shadow-soft);
	}

	.stat-val {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 800;
		display: block;
		color: var(--coral);
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--text-mid);
	}

	.trophy-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 16px;
	}

	.trophy-card {
		border-radius: var(--radius-xl);
		background: var(--white);
		padding: 24px 16px;
		text-align: center;
		box-shadow: var(--shadow-soft);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		opacity: 0.5;
		transition: opacity 0.3s;
	}

	.trophy-card.earned {
		opacity: 1;
		box-shadow: var(--shadow-medium);
	}

	.trophy-emoji {
		font-size: 2.5rem;
	}

	.trophy-card:not(.earned) .trophy-emoji {
		filter: grayscale(0.8);
	}

	.trophy-name {
		font-size: 1rem;
		font-weight: 700;
	}

	.trophy-desc {
		font-size: 0.8rem;
		color: var(--text-mid);
	}

	.earned-badge {
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--mint);
		background: #e8fff5;
		padding: 4px 12px;
		border-radius: var(--radius-full);
	}

	.locked-badge {
		font-size: 0.8rem;
		color: var(--text-light);
	}
</style>
