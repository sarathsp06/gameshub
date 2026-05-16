<script lang="ts">
	import { audio } from '$lib/audio/audio-engine';

	let {
		onclick,
		variant = 'primary',
		size = 'lg',
		disabled = false,
		children,
	}: {
		onclick?: () => void;
		variant?: 'primary' | 'secondary' | 'success' | 'ghost';
		size?: 'md' | 'lg' | 'xl';
		disabled?: boolean;
		children: any;
	} = $props();

	let isPressed = $state(false);

	function handleClick() {
		if (disabled) return;
		audio.playSfx('click');
		onclick?.();
	}
</script>

<button
	class="game-btn {variant} {size}"
	class:pressed={isPressed}
	{disabled}
	onpointerdown={() => (isPressed = true)}
	onpointerup={() => (isPressed = false)}
	onpointerleave={() => (isPressed = false)}
	onclick={handleClick}
>
	{@render children()}
</button>

<style>
	.game-btn {
		font-family: var(--font-display);
		font-weight: 700;
		border-radius: var(--radius-lg);
		transition: transform 0.15s, box-shadow 0.15s;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.game-btn:not(:disabled):hover {
		transform: scale(1.03);
	}

	.game-btn.pressed:not(:disabled) {
		transform: scale(0.95);
	}

	.game-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sizes */
	.md { min-height: 48px; padding: 10px 24px; font-size: 1rem; }
	.lg { min-height: var(--touch-min); padding: 14px 32px; font-size: 1.15rem; }
	.xl { min-height: var(--touch-lg); padding: 18px 40px; font-size: 1.3rem; }

	/* Variants */
	.primary {
		background: linear-gradient(135deg, var(--coral) 0%, var(--sunshine) 100%);
		color: var(--white);
		box-shadow: var(--shadow-medium), 0 4px 0 #D97130;
	}
	.primary.pressed { box-shadow: var(--shadow-soft), 0 2px 0 #D97130; }

	.secondary {
		background: linear-gradient(135deg, var(--mint) 0%, var(--teal) 100%);
		color: var(--white);
		box-shadow: var(--shadow-medium), 0 4px 0 #05A57D;
	}
	.secondary.pressed { box-shadow: var(--shadow-soft), 0 2px 0 #05A57D; }

	.success {
		background: linear-gradient(135deg, #06D6A0 0%, #56E39F 100%);
		color: var(--white);
		box-shadow: var(--shadow-medium), 0 4px 0 #04A97E;
	}
	.success.pressed { box-shadow: var(--shadow-soft), 0 2px 0 #04A97E; }

	.ghost {
		background: rgba(255, 255, 255, 0.6);
		color: var(--text-dark);
		box-shadow: var(--shadow-soft);
		backdrop-filter: blur(4px);
	}
</style>
