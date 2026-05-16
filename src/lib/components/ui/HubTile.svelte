<script lang="ts">
	import type { HubGame } from '$lib/data/hub-games';

	let { game }: { game: HubGame } = $props();

	let isHovered = $state(false);
	let isPressed = $state(false);
</script>

{#if game.status === 'active'}
	<a
		href={game.route}
		class="tile tile-active"
		class:hovered={isHovered}
		class:pressed={isPressed}
		style="--tile-gradient: {game.gradient}; --tile-color: {game.color}"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => { isHovered = false; isPressed = false; }}
		onpointerdown={() => (isPressed = true)}
		onpointerup={() => (isPressed = false)}
		
	>
		<div class="tile-glow"></div>
		<div class="tile-emoji">{game.emoji}</div>
		<h2 class="tile-title">{game.title}</h2>
		<p class="tile-desc">{game.description}</p>
		<div class="tile-cta">
			<span class="cta-text">Play Now!</span>
			<span class="cta-arrow">→</span>
		</div>
	</a>
{:else}
	<div
		class="tile tile-locked"
		style="--tile-gradient: {game.gradient}; --tile-color: {game.color}"
	>
		{#if game.ribbon}
			<div class="ribbon">{game.ribbon}</div>
		{/if}
		<div class="tile-emoji">{game.emoji}</div>
		<h2 class="tile-title">{game.title}</h2>
		<p class="tile-desc">{game.description}</p>
		<div class="tile-lock">🔒</div>
	</div>
{/if}

<style>
	.tile {
		position: relative;
		border-radius: var(--radius-xl);
		padding: 32px 28px;
		text-align: center;
		overflow: hidden;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
		min-height: 240px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.tile-active {
		background: var(--tile-gradient);
		color: var(--white);
		box-shadow:
			var(--shadow-medium),
			0 0 0 0 rgba(255, 140, 66, 0);
		cursor: pointer;
		animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.tile-active.hovered {
		transform: scale(1.04) translateY(-4px);
		box-shadow:
			var(--shadow-strong),
			0 0 30px rgba(255, 140, 66, 0.25);
	}

	.tile-active.pressed {
		transform: scale(0.97);
		box-shadow: var(--shadow-soft);
	}

	.tile-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
		pointer-events: none;
	}

	.tile-locked {
		background: linear-gradient(135deg, #E8E8EE 0%, #D1D1DA 100%);
		color: var(--text-mid);
		box-shadow: var(--shadow-soft);
		opacity: 0.75;
		animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.tile-emoji {
		font-size: 56px;
		line-height: 1;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
	}

	.tile-locked .tile-emoji {
		filter: grayscale(0.6) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
	}

	.tile-title {
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 4vw, 1.8rem);
		font-weight: 800;
		letter-spacing: -0.01em;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.tile-locked .tile-title {
		text-shadow: none;
	}

	.tile-desc {
		font-size: 0.95rem;
		opacity: 0.9;
		max-width: 260px;
		line-height: 1.4;
	}

	.tile-cta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		background: rgba(255, 255, 255, 0.25);
		padding: 10px 24px;
		border-radius: var(--radius-lg);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.1rem;
		backdrop-filter: blur(4px);
		transition: background 0.2s;
	}

	.tile-active.hovered .tile-cta {
		background: rgba(255, 255, 255, 0.35);
	}

	.cta-arrow {
		transition: transform 0.3s;
	}

	.tile-active.hovered .cta-arrow {
		transform: translateX(4px);
	}

	.tile-lock {
		font-size: 28px;
		margin-top: 4px;
		opacity: 0.5;
	}

	.ribbon {
		position: absolute;
		top: 20px;
		right: -32px;
		background: var(--tile-color);
		color: var(--white);
		padding: 6px 40px;
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 700;
		transform: rotate(35deg);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		opacity: 0.85;
	}

	/* Stagger animation for tiles */
	.tile:nth-child(1) { animation-delay: 0s; }
	.tile:nth-child(2) { animation-delay: 0.1s; }
	.tile:nth-child(3) { animation-delay: 0.2s; }
	.tile:nth-child(4) { animation-delay: 0.3s; }
</style>
