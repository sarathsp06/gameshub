import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Scene } from '$lib/engine/scene-manager';
import type { GameApp } from '$lib/engine/game-app';
import { speakPhoneme, speakWord } from '$lib/engine/audio';

/**
 * World 6: Sky Kingdom — Story Flight
 * Parrot guides player through clouds on an airship.
 * Words appear on floating islands. Tap each word to hear it, then read the sentence.
 * Decodable stories using all previously learned phonics patterns.
 */

interface LevelConfig {
	words: string[];
	distractors: string;
	requireOrder: boolean;
	hintDelay: number;
}

const SKY_TOP = 0x81D4FA;
const SKY_BOTTOM = 0xB3E5FC;
const CLOUD_WHITE = 0xffffff;
const ISLAND_GREEN = 0x66BB6A;

interface CloudData {
	gfx: Graphics;
	x: number;
	y: number;
	speed: number;
}

export class StoryFlightGame extends Scene {
	private levelConfig: LevelConfig;
	private onLevelComplete: (() => void) | null;
	private onWordComplete: ((word: string) => void) | null;

	private wordIndex = 0;
	private targetWord = '';
	private targetLetters: string[] = [];
	private collectedLetters: string[] = [];
	private letterIslands: Container[] = [];
	private parrotContainer!: Container;
	private parrotBobPhase = 0;
	private airshipContainer!: Container;
	private clouds: CloudData[] = [];
	private wordLabel!: Text;

	constructor(
		app: GameApp,
		levelConfig: LevelConfig,
		callbacks?: { onLevelComplete?: () => void; onWordComplete?: (word: string) => void }
	) {
		super(app);
		this.levelConfig = levelConfig;
		this.onLevelComplete = callbacks?.onLevelComplete ?? null;
		this.onWordComplete = callbacks?.onWordComplete ?? null;
	}

	async load() {
		this.buildSky();
		this.buildClouds();
		this.buildAirship();
		this.buildParrot();
		this.buildUI();
		this.startWord(0);
	}

	enter() { super.enter(); }

	private buildSky() {
		const bg = new Graphics();
		bg.rect(0, 0, 2000, 2000);
		bg.fill(SKY_TOP);
		this.container.addChild(bg);

		// Sun
		const sun = new Graphics();
		sun.circle(0, 0, 40);
		sun.fill({ color: 0xFFD700, alpha: 0.8 });
		sun.circle(0, 0, 50);
		sun.fill({ color: 0xFFD700, alpha: 0.2 });
		sun.x = 80;
		sun.y = 60;
		this.container.addChild(sun);

		// Rainbow arc
		const rainbow = new Graphics();
		const colors = [0xFF5252, 0xFF9800, 0xFFEB3B, 0x4CAF50, 0x2196F3, 0x9C27B0];
		for (let i = 0; i < colors.length; i++) {
			rainbow.arc(400, 600, 350 - i * 8, Math.PI + 0.3, Math.PI * 2 - 0.3, false);
			rainbow.stroke({ color: colors[i], width: 6, alpha: 0.3 });
		}
		this.container.addChild(rainbow);
	}

	private buildClouds() {
		for (let i = 0; i < 8; i++) {
			const cloud = new Graphics();
			const w = 60 + Math.random() * 80;
			cloud.ellipse(0, 0, w / 2, 18);
			cloud.fill({ color: CLOUD_WHITE, alpha: 0.6 + Math.random() * 0.3 });
			cloud.ellipse(-w * 0.2, -5, w * 0.2, 12);
			cloud.fill({ color: CLOUD_WHITE, alpha: 0.5 });
			cloud.x = Math.random() * 900;
			cloud.y = 80 + Math.random() * 400;
			this.container.addChild(cloud);
			this.clouds.push({ gfx: cloud, x: cloud.x, y: cloud.y, speed: 10 + Math.random() * 15 });
		}
	}

	private buildAirship() {
		this.airshipContainer = new Container();

		// Balloon
		const balloon = new Graphics();
		balloon.ellipse(0, -50, 40, 30);
		balloon.fill(0xFF6B9D);
		balloon.stroke({ color: 0xffffff, width: 2, alpha: 0.5 });
		this.airshipContainer.addChild(balloon);

		// Basket
		const basket = new Graphics();
		basket.roundRect(-20, -10, 40, 25, 6);
		basket.fill(0x8D6E63);
		basket.stroke({ color: 0x6D4C41, width: 2 });
		this.airshipContainer.addChild(basket);

		// Ropes
		const ropes = new Graphics();
		ropes.moveTo(-15, -10);
		ropes.lineTo(-25, -30);
		ropes.moveTo(15, -10);
		ropes.lineTo(25, -30);
		ropes.stroke({ color: 0x795548, width: 1.5 });
		this.airshipContainer.addChild(ropes);

		this.container.addChild(this.airshipContainer);
	}

	private buildParrot() {
		this.parrotContainer = new Container();

		// Body
		const body = new Graphics();
		body.ellipse(0, -15, 14, 20);
		body.fill(0x4CAF50);
		this.parrotContainer.addChild(body);

		// Head
		const head = new Graphics();
		head.circle(0, -35, 12);
		head.fill(0x66BB6A);
		this.parrotContainer.addChild(head);

		// Beak
		const beak = new Graphics();
		beak.moveTo(8, -36);
		beak.lineTo(18, -33);
		beak.lineTo(8, -30);
		beak.closePath();
		beak.fill(0xFF9800);
		this.parrotContainer.addChild(beak);

		// Eye
		const eye = new Graphics();
		eye.circle(-3, -37, 4);
		eye.fill(0xffffff);
		eye.circle(-3, -37, 2);
		eye.fill(0x333333);
		this.parrotContainer.addChild(eye);

		// Wing
		const wing = new Graphics();
		wing.ellipse(-8, -10, 10, 14);
		wing.fill(0x2E7D32);
		this.parrotContainer.addChild(wing);

		// Tail feathers
		const tail = new Graphics();
		tail.moveTo(-4, 5);
		tail.lineTo(-8, 25);
		tail.lineTo(0, 22);
		tail.lineTo(8, 25);
		tail.lineTo(4, 5);
		tail.fill(0xF44336);
		this.parrotContainer.addChild(tail);

		this.container.addChild(this.parrotContainer);
	}

	private buildUI() {
		this.wordLabel = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 24,
				fill: 0x1565C0,
				fontWeight: 'bold'
			})
		});
		this.wordLabel.anchor.set(0.5, 0);
		this.container.addChild(this.wordLabel);
	}

	private startWord(index: number) {
		this.wordIndex = index;
		if (index >= this.levelConfig.words.length) {
			this.onLevelComplete?.();
			return;
		}

		for (const li of this.letterIslands) li.destroy({ children: true });
		this.letterIslands = [];
		this.collectedLetters = [];

		this.targetWord = this.levelConfig.words[index];
		this.targetLetters = this.targetWord.split('');
		this.wordLabel.text = `☁️ Read: ${this.targetWord.toUpperCase()}`;
		speakWord(this.targetWord);

		const w = this.width || 800;
		const h = this.height || 600;

		const letters = [...this.targetLetters];
		for (const d of this.levelConfig.distractors.slice(0, 3)) {
			if (!letters.includes(d)) letters.push(d);
		}
		for (let i = letters.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[letters[i], letters[j]] = [letters[j], letters[i]];
		}

		const spacing = Math.min(72, (w - 60) / letters.length);
		const startX = w / 2 - (letters.length * spacing) / 2;

		for (let i = 0; i < letters.length; i++) {
			const island = new Container();
			island.x = startX + i * spacing + spacing / 2;
			island.y = h * 0.6 + Math.random() * 30;
			island.eventMode = 'static';
			island.cursor = 'pointer';

			// Cloud island
			const cloudBase = new Graphics();
			cloudBase.ellipse(0, 8, 28, 12);
			cloudBase.fill({ color: CLOUD_WHITE, alpha: 0.9 });
			island.addChild(cloudBase);

			// Letter on island
			const text = new Text({
				text: letters[i].toUpperCase(),
				style: new TextStyle({ fontFamily: 'Nunito, sans-serif', fontSize: 28, fill: 0x1565C0, fontWeight: 'bold' })
			});
			text.anchor.set(0.5, 0.5);
			text.y = -4;
			island.addChild(text);

			const letter = letters[i];
			island.on('pointerdown', () => this.tapIsland(letter, island));
			this.letterIslands.push(island);
			this.container.addChild(island);
		}
	}

	private async tapIsland(letter: string, island: Container) {
		const nextNeeded = this.targetLetters[this.collectedLetters.length];
		if (letter !== nextNeeded) {
			let f = 0;
			const origY = island.y;
			const bob = () => { f++; island.y = origY + Math.sin(f * 1.5) * 4 * Math.max(0, 1 - f / 10); if (f < 10) requestAnimationFrame(bob); else island.y = origY; };
			bob();
			return;
		}

		this.collectedLetters.push(letter);
		island.alpha = 0.3;
		island.eventMode = 'none';
		await speakPhoneme(letter);

		if (this.collectedLetters.length === this.targetLetters.length) {
			await speakWord(this.targetWord);
			this.onWordComplete?.(this.targetWord);
			setTimeout(() => this.startWord(this.wordIndex + 1), 1400);
		}
	}

	update(delta: number) {
		const w = this.width || 800;
		const h = this.height || 600;

		this.airshipContainer.x = w * 0.15;
		this.airshipContainer.y = h * 0.3;
		this.airshipContainer.y += Math.sin(this.parrotBobPhase * 0.5) * 5;

		this.parrotContainer.x = w * 0.85;
		this.parrotContainer.y = h * 0.25;
		this.parrotBobPhase += delta * 3;
		this.parrotContainer.y += Math.sin(this.parrotBobPhase) * 8;
		// Wing flap
		this.parrotContainer.rotation = Math.sin(this.parrotBobPhase * 2) * 0.05;

		this.wordLabel.x = w / 2;
		this.wordLabel.y = 16;

		// Drift clouds
		for (const cloud of this.clouds) {
			cloud.x += cloud.speed * delta;
			if (cloud.x > w + 100) cloud.x = -100;
			cloud.gfx.x = cloud.x;
		}

		// Bob islands gently
		for (let i = 0; i < this.letterIslands.length; i++) {
			const li = this.letterIslands[i];
			if (li.alpha < 1) continue;
			li.y += Math.sin(this.parrotBobPhase + i) * 0.3;
		}
	}

	resize(width: number, height: number) { super.resize(width, height); }
}
