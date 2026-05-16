import { Container } from 'pixi.js';
import type { GameApp } from './game-app';

/**
 * Base class for all game scenes. Each world (Meadow, Workshop, Ocean, etc.)
 * extends this to implement its own game logic and rendering.
 */
export abstract class Scene {
	readonly container = new Container();
	protected app: GameApp;
	protected width = 0;
	protected height = 0;

	constructor(app: GameApp) {
		this.app = app;
	}

	/** Called once when the scene is first loaded. Load assets, build display tree. */
	abstract load(): Promise<void>;

	/** Called when the scene becomes active. Start game loops, enable input. */
	enter() {
		this.width = this.app.screen.width;
		this.height = this.app.screen.height;
		this.app.stage.addChild(this.container);
	}

	/** Called every frame. Delta is in seconds (not ms). */
	abstract update(delta: number): void;

	/** Called when leaving the scene. Stop game loops, disable input. */
	exit() {
		this.app.stage.removeChild(this.container);
	}

	/** Called when the scene is permanently removed. Free resources. */
	dispose() {
		this.container.destroy({ children: true });
	}

	/** Handle resize. Override in subclasses for custom layout. */
	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
	}
}

/**
 * Manages scene transitions: load, enter, exit, dispose.
 */
export class SceneManager {
	private currentScene: Scene | null = null;
	private app: GameApp;
	private boundUpdate: ((ticker: { deltaTime: number }) => void) | null = null;

	constructor(app: GameApp) {
		this.app = app;
	}

	async switchTo(scene: Scene) {
		// Exit current scene
		if (this.currentScene) {
			this.currentScene.exit();
			this.currentScene.dispose();
		}

		// Remove previous ticker
		if (this.boundUpdate) {
			this.app.ticker.remove(this.boundUpdate as any);
		}

		this.currentScene = scene;
		await scene.load();
		scene.enter();

		// Add ticker for update loop
		this.boundUpdate = (ticker: { deltaTime: number }) => {
			scene.update(ticker.deltaTime / 60); // Convert to seconds
		};
		this.app.ticker.add(this.boundUpdate as any);
	}

	resize(width: number, height: number) {
		this.currentScene?.resize(width, height);
	}

	dispose() {
		if (this.boundUpdate) {
			this.app.ticker.remove(this.boundUpdate as any);
		}
		this.currentScene?.exit();
		this.currentScene?.dispose();
		this.currentScene = null;
	}
}
