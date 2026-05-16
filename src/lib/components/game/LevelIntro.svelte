<script lang="ts">
	let { mascot, storyText, onStart } = $props<{
		mascot: string;
		storyText: string;
		onStart: () => void;
	}>();
</script>

<div class="intro-overlay">
	<div class="intro-card">
		<div class="mascot-container">
			<div class="mascot">{mascot}</div>
		</div>
		<div class="speech-bubble">
			<p class="story-text">{storyText}</p>
		</div>
		<button class="play-btn" onclick={onStart}>
			<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
			Let's Go!
		</button>
	</div>
</div>

<style>
	.intro-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(180deg, #FFF8F0 0%, #FFD6E0 100%);
		padding: 24px;
		animation: fade-in 0.3s ease;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.intro-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		max-width: 400px;
		width: 100%;
		animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.mascot-container {
		width: 160px;
		height: 160px;
		border-radius: var(--radius-full);
		background: white;
		box-shadow: 0 8px 32px rgba(255, 107, 157, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fox-bounce 2s ease-in-out infinite;
	}

	.mascot {
		font-size: 5rem;
	}

	.speech-bubble {
		background: white;
		border-radius: var(--radius-lg);
		padding: 24px 28px;
		box-shadow: 0 8px 24px rgba(124, 77, 255, 0.1);
		position: relative;
		border: 3px solid rgba(124, 77, 255, 0.1);
	}

	.speech-bubble::before {
		content: '';
		position: absolute;
		top: -12px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 12px solid transparent;
		border-right: 12px solid transparent;
		border-bottom: 12px solid white;
	}

	.story-text {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--text-dark);
		text-align: center;
		line-height: 1.5;
	}

	.play-btn {
		width: 100%;
		max-width: 280px;
		height: 72px;
		background: var(--primary);
		color: white;
		font-family: var(--font-headline);
		font-weight: 900;
		font-size: 1.4rem;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-shadow: 0 8px 0 0 var(--primary-dark);
		transition: transform 0.1s, box-shadow 0.1s;
	}

	.play-btn:active {
		transform: translateY(4px);
		box-shadow: 0 4px 0 0 var(--primary-dark);
	}
</style>
