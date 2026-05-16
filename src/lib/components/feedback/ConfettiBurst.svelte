<script lang="ts">
	import { onMount } from 'svelte';

	let { trigger = false }: { trigger?: boolean } = $props();

	$effect(() => {
		if (trigger) {
			fire();
		}
	});

	async function fire() {
		if (typeof window === 'undefined') return;
		const confetti = (await import('canvas-confetti')).default;
		confetti({
			particleCount: 80,
			spread: 70,
			origin: { y: 0.65 },
			colors: ['#FF8C42', '#FFD166', '#06D6A0', '#EF476F', '#7B2FF7', '#73C2FB'],
			scalar: 1.2,
			gravity: 0.8,
		});
	}
</script>
