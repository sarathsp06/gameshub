<script lang="ts">
	let { stars = 0, max = 3 }: { stars?: number; max?: number } = $props();
</script>

<div class="star-rating" aria-label="{stars} of {max} stars">
	{#each Array(max) as _, i}
		<span class="star" class:earned={i < stars} style="--delay: {i * 0.12}s">
			{i < stars ? '⭐' : '☆'}
		</span>
	{/each}
</div>

<style>
	.star-rating {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.star {
		font-size: 1.5rem;
		line-height: 1;
		opacity: 0.3;
		transition: opacity 0.3s, transform 0.3s;
	}

	.star.earned {
		opacity: 1;
		animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		animation-delay: var(--delay);
	}
</style>
