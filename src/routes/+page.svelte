<script lang="ts">
	import { hubGames } from '$lib/data/hub-games';
</script>

<svelte:head>
	<title>PhonicsLearn — Games for Little Learners</title>
</svelte:head>

<main class="hub">
	<!-- Top Header with Fox Mascot -->
	<header class="hub-top">
		<div class="mascot-row">
			<div class="mascot-avatar">🦊</div>
			<h1 class="greeting">Hi there, Explorer!</h1>
		</div>
		<button class="star-btn">
			<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; color: var(--gold);">star</span>
		</button>
	</header>

	<!-- Welcome Section -->
	<section class="welcome">
		<h2 class="welcome-title">Ready to Play?</h2>
		<p class="welcome-sub">Pick a world to start your learning journey!</p>
	</section>

	<!-- Games Grid -->
	<div class="games-grid">
		{#each hubGames as game (game.id)}
			{#if game.status === 'active'}
				<a href={game.route} class="tile tile-active">
					<div class="tile-text">
						<h3 class="tile-title">{game.title}</h3>
						<p class="tile-desc">Let's Read!</p>
						<div class="tile-start">
							<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
							<span>START</span>
						</div>
					</div>
					<div class="tile-icon">{game.emoji}</div>
				</a>
			{:else}
				<div class="tile tile-locked">
					<div class="tile-text">
						<h3 class="tile-title">{game.title}</h3>
						<p class="tile-desc">{game.description}</p>
					</div>
					<div class="tile-icon tile-icon-locked">{game.emoji}</div>
					<div class="ribbon">Coming Soon</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Reward Banner -->
	<div class="reward-banner">
		<div class="reward-icon">🏆</div>
		<div class="reward-text">
			<h4>Star Explorer!</h4>
			<p>Complete levels to collect stars and unlock the mystery chest!</p>
		</div>
	</div>
</main>

<!-- Bottom Nav -->
<nav class="bottom-nav">
	<a href="/" class="nav-item nav-active">
		<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
	</a>
	<a href="/phonics/trophies" class="nav-item">
		<span class="material-symbols-outlined">emoji_events</span>
	</a>
</nav>

<style>
	.hub {
		min-height: 100dvh;
		padding: 16px 24px 120px;
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* Top Header */
	.hub-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
	}

	.mascot-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mascot-avatar {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-full);
		background: var(--white);
		border: 4px solid var(--white);
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}

	.greeting {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--primary);
	}

	.star-btn {
		width: 48px;
		height: 48px;
		background: var(--white);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
	}

	/* Welcome */
	.welcome {
		text-align: center;
	}

	.welcome-title {
		font-size: clamp(2rem, 6vw, 2.5rem);
		color: var(--secondary);
		margin-bottom: 4px;
	}

	.welcome-sub {
		font-size: 1.2rem;
		color: var(--text-mid);
		font-weight: 500;
	}

	/* Games Grid */
	.games-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 20px;
	}

	@media (min-width: 600px) {
		.games-grid {
			grid-template-columns: 1fr 1fr;
			gap: 24px;
		}
	}

	.tile {
		position: relative;
		height: 200px;
		border-radius: var(--radius-md);
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		overflow: hidden;
		transition: transform 0.15s;
	}

	.tile-active {
		background: linear-gradient(135deg, var(--primary), var(--secondary));
		box-shadow: var(--shadow-pink);
		color: white;
	}

	.tile-active:hover {
		transform: translateY(2px);
	}

	.tile-active:active {
		transform: translateY(8px);
		box-shadow: none;
	}

	.tile-locked {
		background: #E5E7EB;
		box-shadow: var(--shadow-gray);
		filter: grayscale(0.5);
		cursor: not-allowed;
	}

	.tile-text {
		text-align: left;
		z-index: 1;
	}

	.tile-title {
		font-size: 1.6rem;
		font-weight: 900;
		margin-bottom: 4px;
		color: inherit;
	}

	.tile-locked .tile-title {
		color: #6B7280;
	}

	.tile-desc {
		font-size: 1.1rem;
		font-weight: 700;
		opacity: 0.9;
	}

	.tile-locked .tile-desc {
		color: #9CA3AF;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.tile-start {
		margin-top: 16px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.2);
		padding: 8px 16px;
		border-radius: var(--radius-full);
		font-weight: 900;
		font-size: 0.95rem;
		backdrop-filter: blur(4px);
	}

	.tile-icon {
		font-size: 4rem;
		flex-shrink: 0;
		transition: transform 0.3s;
	}

	.tile-active:hover .tile-icon {
		transform: scale(1.1);
	}

	.tile-icon-locked {
		opacity: 0.4;
	}

	/* Ribbon */
	.ribbon {
		position: absolute;
		top: 16px;
		right: -48px;
		background: var(--tertiary);
		color: white;
		font-weight: 900;
		font-size: 0.75rem;
		padding: 6px 48px;
		transform: rotate(45deg);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	/* Reward Banner */
	.reward-banner {
		margin-top: 16px;
		background: var(--white);
		border-radius: var(--radius-md);
		padding: 24px;
		display: flex;
		align-items: center;
		gap: 20px;
		box-shadow: var(--shadow-soft);
		border: 4px dashed rgba(124, 77, 255, 0.2);
	}

	.reward-icon {
		width: 64px;
		height: 64px;
		background: rgba(255, 215, 0, 0.1);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.reward-text h4 {
		font-size: 1.3rem;
		color: var(--secondary);
		margin-bottom: 4px;
	}

	.reward-text p {
		color: var(--text-mid);
		font-size: 0.95rem;
		line-height: 1.4;
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
		box-shadow: 4px 4px 0 var(--primary);
	}
</style>
