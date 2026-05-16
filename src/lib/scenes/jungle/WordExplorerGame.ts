import { Container, Graphics, Text, TextStyle, type ColorSource } from 'pixi.js';
import { Scene } from '$lib/engine/scene-manager';
import type { GameApp } from '$lib/engine/game-app';
import { speakPhoneme, speakWord } from '$lib/engine/audio';

/**
 * World 5: Jungle Ruins — Word Explorer
 * Monkey guides player through overgrown ruins.
 * Find stone tablets with words. Tap letter segments to hear them, then read whole word.
 */

interface LevelConfig {
	words: string[];
	distractors: string;
	requireOrder: boolean;
	hintDelay: number;
}

const JUNGLE_BG = 0x1B5E20;
const JUNGLE_DARK = 0x2E7D32;
const STONE_COLOR = 0x9E9E9E;
const VINE_COLOR = 0x4CAF50;
const LEAF_COLORS: ColorSource[] = [0x4CAF50, 0x66BB6A, 0x81C784, 0x2E7D32];

interface Leaf {
	gfx: Graphics;
	x: number;
	y: number;
	phase: number;
	speed: number;
}

export class WordExplorerGame extends Scene {
	private levelConfig: LevelConfig;
	private onLevelComplete: (() => void) | null;
	private onWordComplete: ((word: string) => void) | null;

	private wordIndex = 0;
	private targetWord = '';
	private targetLetters: string[] = [];
	private collectedLetters: string[] = [];
	private tabletLetters: Container[] = [];
	private monkeyContainer!: Container;
	private monkeyBobPhase = 0;
	private wordLabel!: Text;
	private leaves: Leaf[] = [];
	private vines: Graphics[] = [];

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
		this.buildJungle();
		this.buildRuins();
		this.buildVines();
		this.buildMonkey();
		this.buildUI();
		this.buildFallingLeaves();
		this.startWord(0);
	}

	enter() { super.enter(); }

	private buildJungle() {
		const bg = new Graphics();
		bg.rect(0, 0, 2000, 2000);
		bg.fill(JUNGLE_BG);
		this.container.addChild(bg);

		// Canopy shadows from top
		const canopy = new Graphics();
		for (let i = 0; i < 8; i++) {
			canopy.ellipse(i * 120 + 60, 0, 80, 40);
		}
		canopy.fill({ color: 0x1B5E20, alpha: 0.5 });
		this.container.addChild(canopy);

		// Ground — mossy stone
		const ground = new Graphics();
		ground.rect(0, 0, 2000, 100);
		ground.fill(0x3E2723);
		this.container.addChild(ground);
	}

	private buildRuins() {
		// Stone pillars
		for (let i = 0; i < 3; i++) {
			const pillar = new Graphics();
			pillar.roundRect(0, 0, 40, 200, 4);
			pillar.fill(STONE_COLOR);
			pillar.stroke({ color: 0x757575, width: 1 });
			// Cracks
			pillar.moveTo(10, 40);
			pillar.lineTo(20, 80);
			pillar.lineTo(15, 120);
			pillar.stroke({ color: 0x616161, width: 1 });
			pillar.x = 50 + i * 300;
			this.container.addChild(pillar);
		}
	}

	private buildVines() {
		for (let i = 0; i < 5; i++) {
			const vine = new Graphics();
			const x = 30 + i * 170;
			vine.moveTo(x, 0);
			vine.quadraticCurveTo(x + 20, 80, x - 10, 160);
			vine.quadraticCurveTo(x + 15, 240, x, 300);
			vine.stroke({ color: VINE_COLOR, width: 4, cap: 'round' });
			this.container.addChild(vine);
			this.vines.push(vine);
		}
	}

	private buildMonkey() {
		this.monkeyContainer = new Container();

		// Body
		const body = new Graphics();
		body.ellipse(0, -20, 22, 28);
		body.fill(0x8D6E63);
		this.monkeyContainer.addChild(body);

		// Face
		const face = new Graphics();
		face.ellipse(0, -25, 16, 14);
		face.fill(0xFFCC80);
		this.monkeyContainer.addChild(face);

		// Eyes
		for (const side of [-1, 1]) {
			const eye = new Graphics();
			eye.circle(side * 7, -28, 4);
			eye.fill(0xffffff);
			eye.circle(side * 7, -28, 2);
			eye.fill(0x333333);
			this.monkeyContainer.addChild(eye);
		}

		// Mouth (smile)
		const mouth = new Graphics();
		mouth.arc(0, -20, 6, 0, Math.PI, false);
		mouth.stroke({ color: 0x4E342E, width: 1.5 });
		this.monkeyContainer.addChild(mouth);

		// Ears
		for (const side of [-1, 1]) {
			const ear = new Graphics();
			ear.circle(side * 18, -25, 8);
			ear.fill(0x8D6E63);
			ear.circle(side * 18, -25, 5);
			ear.fill(0xFFCC80);
			this.monkeyContainer.addChild(ear);
		}

		// Tail
		const tail = new Graphics();
		tail.moveTo(18, -5);
		tail.quadraticCurveTo(40, -20, 35, 10);
		tail.quadraticCurveTo(30, 25, 20, 15);
		tail.stroke({ color: 0x6D4C41, width: 5, cap: 'round' });
		this.monkeyContainer.addChild(tail);

		this.container.addChild(this.monkeyContainer);
	}

	private buildUI() {
		this.wordLabel = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 22,
				fill: 0xA5D6A7,
				fontWeight: 'bold'
			})
		});
		this.wordLabel.anchor.set(0.5, 0);
		this.container.addChild(this.wordLabel);
	}

	private buildFallingLeaves() {
		for (let i = 0; i < 10; i++) {
			const leaf = new Graphics();
			const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)] as number;
			leaf.ellipse(0, 0, 6, 3);
			leaf.fill({ color, alpha: 0.6 });
			leaf.x = Math.random() * 800;
			leaf.y = Math.random() * 600;
			this.container.addChild(leaf);
			this.leaves.push({ gfx: leaf, x: leaf.x, y: leaf.y, phase: Math.random() * Math.PI * 2, speed: 20 + Math.random() * 20 });
		}
	}

	private startWord(index: number) {
		this.wordIndex = index;
		if (index >= this.levelConfig.words.length) {
			this.onLevelComplete?.();
			return;
		}

		for (const t of this.tabletLetters) t.destroy({ children: true });
		this.tabletLetters = [];
		this.collectedLetters = [];

		this.targetWord = this.levelConfig.words[index];
		this.targetLetters = this.targetWord.split('');
		this.wordLabel.text = `🗿 Decode: ${this.targetWord.toUpperCase()}`;
		speakWord(this.targetWord);

		const w = this.width || 800;
		const h = this.height || 600;

		// Stone tablet letters
		const letters = [...this.targetLetters];
		for (const d of this.levelConfig.distractors.slice(0, 3)) {
			if (!letters.includes(d)) letters.push(d);
		}
		for (let i = letters.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[letters[i], letters[j]] = [letters[j], letters[i]];
		}

		const spacing = Math.min(68, (w - 60) / letters.length);
		const startX = w / 2 - (letters.length * spacing) / 2;

		for (let i = 0; i < letters.length; i++) {
			const tc = new Container();
			tc.x = startX + i * spacing + spacing / 2;
			tc.y = h * 0.55;
			tc.eventMode = 'static';
			tc.cursor = 'pointer';

			// Stone tablet
			const stone = new Graphics();
			stone.roundRect(-26, -26, 52, 52, 6);
			stone.fill(STONE_COLOR);
			stone.stroke({ color: 0x757575, width: 2 });
			tc.addChild(stone);

			const text = new Text({
				text: letters[i].toUpperCase(),
				style: new TextStyle({ fontFamily: 'Nunito, sans-serif', fontSize: 26, fill: 0x3E2723, fontWeight: 'bold' })
			});
			text.anchor.set(0.5);
			tc.addChild(text);

			const letter = letters[i];
			tc.on('pointerdown', () => this.tapTablet(letter, tc));
			this.tabletLetters.push(tc);
			this.container.addChild(tc);
		}
	}

	private async tapTablet(letter: string, tc: Container) {
		const nextNeeded = this.targetLetters[this.collectedLetters.length];
		if (letter !== nextNeeded) {
			let f = 0;
			const origX = tc.x;
			const wobble = () => { f++; tc.x = origX + Math.sin(f * 1.2) * 5 * Math.max(0, 1 - f / 10); if (f < 10) requestAnimationFrame(wobble); else tc.x = origX; };
			wobble();
			return;
		}

		this.collectedLetters.push(letter);
		tc.alpha = 0.3;
		tc.eventMode = 'none';
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

		const ground = this.container.children[2] as Graphics;
		ground.y = h - 100;

		// Pillars position
		for (let i = 0; i < 3; i++) {
			const pillar = this.container.children[3 + i];
			if (pillar) pillar.y = h - 300;
		}

		this.monkeyContainer.x = w * 0.12;
		this.monkeyContainer.y = h * 0.42;
		this.monkeyBobPhase += delta * 3;
		this.monkeyContainer.y += Math.sin(this.monkeyBobPhase) * 6;

		this.wordLabel.x = w / 2;
		this.wordLabel.y = 16;

		// Falling leaves
		for (const leaf of this.leaves) {
			leaf.phase += delta * 2;
			leaf.y += leaf.speed * delta;
			leaf.x += Math.sin(leaf.phase) * 15 * delta;
			if (leaf.y > h + 10) { leaf.y = -10; leaf.x = Math.random() * w; }
			leaf.gfx.x = leaf.x;
			leaf.gfx.y = leaf.y;
			leaf.gfx.rotation = leaf.phase * 0.5;
		}
	}

	resize(width: number, height: number) { super.resize(width, height); }
}
