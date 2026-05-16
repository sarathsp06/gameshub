<script lang="ts">
	import { onMount } from 'svelte';
	import { GameApp } from '$lib/engine/game-app';
	import { SceneManager, type Scene } from '$lib/engine/scene-manager';

	let { scene: createScene, onready }: {
		scene: (app: GameApp, sceneManager: SceneManager) => Scene;
		onready?: (app: GameApp, sceneManager: SceneManager) => void;
	} = $props();

	let canvasEl: HTMLCanvasElement;
	let containerEl: HTMLDivElement;

	onMount(() => {
		const gameApp = new GameApp();
		const sceneManager = new SceneManager(gameApp);

		const init = async () => {
			await gameApp.init(canvasEl);

			const sceneInstance = createScene(gameApp, sceneManager);
			await sceneManager.switchTo(sceneInstance);
			onready?.(gameApp, sceneManager);
		};

		init();

		const resizeObserver = new ResizeObserver(() => {
			gameApp.resize();
			sceneManager.resize(containerEl.clientWidth, containerEl.clientHeight);
		});
		resizeObserver.observe(containerEl);

		return () => {
			resizeObserver.disconnect();
			sceneManager.dispose();
			gameApp.destroy();
		};
	});
</script>

<div bind:this={containerEl} class="pixi-container">
	<canvas bind:this={canvasEl}></canvas>
</div>

<style>
	.pixi-container {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
		border-radius: 1rem;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
