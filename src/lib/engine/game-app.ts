import { Application, type ApplicationOptions } from 'pixi.js';

/**
 * Creates and manages a PixiJS Application instance for use in SvelteKit.
 * Handles the lifecycle: init, resize, destroy.
 */
export class GameApp {
	app: Application;
	private _destroyed = false;

	constructor() {
		this.app = new Application();
	}

	async init(canvas: HTMLCanvasElement, options?: Partial<ApplicationOptions>) {
		await this.app.init({
			canvas,
			resizeTo: canvas.parentElement ?? undefined,
			antialias: true,
			backgroundColor: 0x87ceeb, // Default sky blue, scenes override this
			resolution: Math.min(window.devicePixelRatio, 2),
			autoDensity: true,
			...options
		});
	}

	get stage() {
		return this.app.stage;
	}

	get ticker() {
		return this.app.ticker;
	}

	get screen() {
		return this.app.screen;
	}

	resize() {
		if (!this._destroyed) {
			this.app.resize();
		}
	}

	destroy() {
		if (!this._destroyed) {
			this._destroyed = true;
			this.app.destroy(true, { children: true, texture: true });
		}
	}
}
