<script lang="ts">
	import { page } from '$app/stores';
	import { getWorld } from '$lib/data/phonics-curriculum';
	import { progress } from '$lib/stores/progress.svelte';

	const worldId = $derived($page.params.worldId);
	const world = $derived(getWorld(worldId));
</script>

<svelte:head>
	<title>{world?.name ?? 'World'} — PhonicsLearn</title>
</svelte:head>

<main class="map-page">
	<!-- Top Bar -->
	<header class="map-top">
		<div class="top-left">
			<a href="/phonics" class="back-btn">
				<span class="material-symbols-outlined">arrow_back</span>
			</a>
			{#if world}
				<h1 class="map-title">{world.name}</h1>
			{/if}
		</div>
		{#if world}
			<div class="star-counter">
				<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; color: var(--gold);">star</span>
				<span class="star-count">{progress.getWorldStars(worldId)}</span>
			</div>
		{/if}
	</header>

	{#if !world}
		<div class="not-found">
			<p>World not found!</p>
			<a href="/phonics">Back to Worlds</a>
		</div>
	{:else}
		<!-- Winding Path of Nodes -->
		<div class="path-container">
			{#each world.levels as level, li (level.id)}
				{@const lp = progress.getLevelProgress(worldId, level.id)}
				{@const offset = li % 2 === 0 ? 'offset-left' : 'offset-right'}

				<a
					href="/phonics/{worldId}/{level.id}"
					class="node {offset}"
					class:completed={lp.completed}
					style="animation-delay: {li * 0.08}s"
				>
					{#if lp.completed}
						<div class="node-circle node-done">
							<span class="material-symbols-outlined" style="color: white;">check</span>
						</div>
						<div class="node-stars">
							{#each Array(lp.stars) as _}
								<span class="material-symbols-outlined mini-star" style="font-variation-settings: 'FILL' 1;">star</span>
							{/each}
						</div>
					{:else if li === 0 || progress.getLevelProgress(worldId, world.levels[li - 1].id).completed}
						<!-- Current / playable node with mascot -->
						<div class="node-circle node-current">
							<span class="node-mascot">{world.mascot}</span>
						</div>
					{:else}
						<div class="node-circle node-open">
							<span class="node-num">{li + 1}</span>
						</div>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</main>

<!-- Bottom Nav -->
<nav class="bottom-nav">
	<a href="/" class="nav-item">
		<span class="material-symbols-outlined">home</span>
	</a>
	<a href="/phonics/{worldId}" class="nav-item nav-active">
		<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">map</span>
	</a>
	<a href="/phonics/trophies" class="nav-item">
		<span class="material-symbols-outlined">emoji_events</span>
	</a>
</nav>

<style>
	.map-page {
		min-height: 100dvh;
		padding: 16px 24px 120px;
		max-width: 500px;
		margin: 0 auto;
	}

	.map-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}

	.top-left {
		display: flex;
		align-items: center;
		gap: 12px;
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

	.map-title {
		font-size: 1.4rem;
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
	}

	.star-count {
		font-family: var(--font-label);
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--tertiary);
	}

	/* Winding Path */
	.path-container {
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		gap: 40px;
		padding: 32px 0;
	}

	.node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		opacity: 0;
		transition: transform 0.15s;
	}

	.node:hover {
		transform: scale(1.05);
	}

	.node:active {
		transform: scale(0.95);
	}

	.offset-left {
		transform: translateX(-40px);
	}

	.offset-right {
		transform: translateX(40px);
	}

	.offset-left:hover {
		transform: translateX(-40px) scale(1.05);
	}

	.offset-right:hover {
		transform: translateX(40px) scale(1.05);
	}

	.node-circle {
		width: 72px;
		height: 72px;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.node-done {
		background: var(--primary);
		box-shadow: 4px 4px 0 var(--primary-dark);
	}

	.node-current {
		background: var(--secondary);
		box-shadow: 6px 6px 0 var(--secondary-dark);
		animation: pulse-glow 2s infinite;
	}

	.node-mascot {
		font-size: 2.2rem;
	}

	.node-open {
		background: #E5E7EB;
		box-shadow: 4px 4px 0 #CBD5E1;
	}

	.node-num {
		font-weight: 800;
		font-size: 1.2rem;
		color: #9CA3AF;
	}

	.node-stars {
		display: flex;
		gap: 2px;
	}

	.mini-star {
		font-size: 1rem;
		color: var(--gold);
	}

	.not-found {
		text-align: center;
		padding: 60px 24px;
		color: var(--text-mid);
	}

	.not-found a {
		color: var(--primary);
		font-weight: 700;
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
