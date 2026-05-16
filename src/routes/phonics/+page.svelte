<script lang="ts">
	import { worlds } from '$lib/data/phonics-curriculum';
	import { progress } from '$lib/stores/progress.svelte';
</script>

<svelte:head>
	<title>Phonics Adventure — Choose a World</title>
</svelte:head>

<main class="world-select">
	<!-- Header -->
	<header class="ws-header">
		<a href="/" class="back-btn">
			<span class="material-symbols-outlined">arrow_back</span>
		</a>
		<h1 class="ws-title">Worlds</h1>
		<div class="star-counter">
			<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; color: var(--gold);">star</span>
			<span>{progress.totalStars}</span>
		</div>
	</header>

	<!-- World Cards -->
	<div class="worlds-list">
		{#each worlds as world, wi (world.id)}
			{@const completed = progress.getWorldCompletedLevels(world.id)}
			{@const total = world.levels.length}

			<a
				href="/phonics/{world.id}"
				class="world-card"
				style="animation-delay: {wi * 0.08}s"
			>
				<div class="card-mascot">{world.mascot}</div>
				<div class="card-body">
					<h2 class="card-name">{world.name}</h2>
					<p class="card-subtitle">{world.subtitle}</p>
					<div class="card-progress">
						<div class="bar-track">
							<div class="bar-fill" style="width: {(completed / total) * 100}%"></div>
						</div>
						<span class="bar-label">{completed}/{total}</span>
					</div>
				</div>
				<span class="material-symbols-outlined card-arrow">chevron_right</span>
			</a>
		{/each}
	</div>
</main>

<!-- Bottom Nav -->
<nav class="bottom-nav">
	<a href="/" class="nav-item">
		<span class="material-symbols-outlined">home</span>
	</a>
	<a href="/phonics" class="nav-item nav-active">
		<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_stories</span>
	</a>
	<a href="/phonics/trophies" class="nav-item">
		<span class="material-symbols-outlined">emoji_events</span>
	</a>
</nav>

<style>
	.world-select {
		min-height: 100dvh;
		padding: 16px 20px 120px;
		max-width: 500px;
		margin: 0 auto;
	}

	.ws-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
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

	.ws-title {
		font-size: 1.6rem;
		color: var(--primary);
	}

	.star-counter {
		display: flex;
		align-items: center;
		gap: 4px;
		background: white;
		border-radius: var(--radius-full);
		padding: 8px 14px;
		box-shadow: 4px 4px 0 var(--gold);
		border: 2px solid var(--gold);
		font-weight: 700;
		color: var(--tertiary);
	}

	/* World Cards */
	.worlds-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.world-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: 0 6px 0 rgba(0,0,0,0.06);
		border: 2px solid transparent;
		text-decoration: none;
		transition: transform 0.15s, box-shadow 0.15s;
		animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
	}

	.world-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 0 rgba(0,0,0,0.08);
		border-color: var(--primary);
	}

	.world-card:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 rgba(0,0,0,0.06);
	}

	.card-mascot {
		font-size: 2.8rem;
		flex-shrink: 0;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-name {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--text-dark);
	}

	.card-subtitle {
		font-size: 0.8rem;
		color: var(--text-mid);
		margin-top: 2px;
	}

	.card-progress {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
	}

	.bar-track {
		flex: 1;
		height: 8px;
		border-radius: 4px;
		background: #F3F4F6;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 4px;
		background: linear-gradient(90deg, var(--primary), var(--secondary));
		transition: width 0.3s;
	}

	.bar-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-mid);
		white-space: nowrap;
	}

	.card-arrow {
		color: var(--text-light);
		font-size: 1.5rem;
	}

	.not-found {
		text-align: center;
		padding: 60px 24px;
		color: var(--text-mid);
	}

	/* Bottom Nav */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: 50;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 0 32px 16px;
		background: var(--white);
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		height: 96px;
		box-shadow: 0 -4px 20px rgba(255, 107, 157, 0.1);
	}

	.nav-item {
		width: 72px;
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		color: var(--secondary);
		transition: transform 0.15s;
	}

	.nav-item:hover {
		transform: scale(1.1);
	}

	.nav-item:active {
		transform: scale(0.9);
	}

	.nav-active {
		background: var(--primary);
		color: white;
		box-shadow: 4px 4px 0 var(--primary-dark);
	}
</style>
