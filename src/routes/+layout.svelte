<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800;6..12,900&family=Public+Sans:wght@700&display=swap" rel="stylesheet" />
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(:root) {
		/* Candy Planet Palette — from Stitch design system */
		--primary: #FF6B9D;
		--primary-dark: #D85583;
		--secondary: #7C4DFF;
		--secondary-dark: #5E35B1;
		--tertiary: #FFB74D;
		--tertiary-dark: #F57C00;
		--success: #66BB6A;
		--success-dark: #388E3C;
		--gold: #FFD700;
		--cream: #FFF8F0;
		--white: #FFFFFF;

		/* Text */
		--text-dark: #4A4A4A;
		--text-mid: #6B6B7B;
		--text-light: #9B9BAB;

		/* Backgrounds */
		--bg-main: #FFF8F0;
		--bg-card: #FFFFFF;
		--bg-overlay: rgba(0, 0, 0, 0.3);

		/* Fonts */
		--font-headline: 'Nunito Sans', sans-serif;
		--font-body: 'Nunito Sans', sans-serif;
		--font-label: 'Public Sans', sans-serif;

		/* Radii — chunky rounded from Stitch */
		--radius-sm: 0.5rem;
		--radius-md: 1rem;
		--radius-lg: 2rem;
		--radius-xl: 3rem;
		--radius-full: 9999px;

		/* Chunky shadows */
		--shadow-pink: 0 8px 0 0 #D85583;
		--shadow-purple: 0 8px 0 0 #5E35B1;
		--shadow-gray: 0 8px 0 0 #D1D5DB;
		--shadow-gold: 0 8px 0 0 #DAA520;
		--shadow-soft: 0 12px 24px rgba(124, 77, 255, 0.08);

		/* Touch targets */
		--touch-min: 72px;
		--touch-lg: 88px;
	}

	:global(html, body) {
		font-family: var(--font-body);
		background: var(--bg-main);
		background-image:
			radial-gradient(circle at 10% 20%, rgba(255, 107, 157, 0.05) 0%, transparent 20%),
			radial-gradient(circle at 80% 15%, rgba(124, 77, 255, 0.05) 0%, transparent 25%),
			radial-gradient(circle at 50% 80%, rgba(255, 183, 77, 0.05) 0%, transparent 30%);
		color: var(--text-dark);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		overflow-x: hidden;
		min-height: 100dvh;
	}

	:global(a) {
		text-decoration: none;
		color: inherit;
	}

	:global(button) {
		font-family: var(--font-body);
		border: none;
		background: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	:global(h1, h2, h3, h4) {
		font-family: var(--font-headline);
		font-weight: 900;
		line-height: 1.2;
	}

	:global(.material-symbols-outlined) {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
	}

	/* Bounce-in animation used across components */
	@keyframes -global-bounce-in {
		0% {
			opacity: 0;
			transform: scale(0.6) translateY(20px);
		}
		60% {
			transform: scale(1.05) translateY(-4px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes -global-float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}

	@keyframes -global-fox-bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	@keyframes -global-pulse-glow {
		0% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.1); opacity: 0.8; }
		100% { transform: scale(1); opacity: 1; }
	}
</style>
