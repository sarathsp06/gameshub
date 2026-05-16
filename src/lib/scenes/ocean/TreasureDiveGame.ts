import { Container, Graphics, Text, TextStyle, type ColorSource } from 'pixi.js';
import { Scene } from '$lib/engine/scene-manager';
import type { GameApp } from '$lib/engine/game-app';
import { speakPhoneme, speakWord } from '$lib/engine/audio';

/**
 * World 3: Deep Ocean — Treasure Dive
 * Octopus guides player through underwater world.
 * Words shown with gaps. Letter tiles float nearby. Tap correct tile to fill gap.
 * Correct = treasure chest opens with gold burst.
 */

interface LevelConfig {
	words: string[];
	distractors: string;
	requireOrder: boolean;
	hintDelay: number;
}

interface FloatingTile {
	letter: string;
	container: Container;
	baseX: number;
	baseY: number;
	phase: number;
	popped: boolean;
}

interface Fish {
	gfx: Container;
	x: number;
	y: number;
	speed: number;
	phase: number;
}

const OCEAN_DEEP = 0x0D47A1;
const OCEAN_MID = 0x1565C0;
const SAND_COLOR = 0xFFE0B2;
const CORAL_COLORS: ColorSource[] = [0xFF6B9D, 0xFF8A65, 0xFFB74D, 0xAB47BC, 0x26A69A];

export class TreasureDiveGame extends Scene {
	private levelConfig: LevelConfig;
	private onLevelComplete: (() => void) | null;
	private onWordComplete: ((word: string) => void) | null;

	private wordIndex = 0;
	private targetWord = '';
	private targetLetters: string[] = [];
	private collectedLetters: string[] = [];
	private tiles: FloatingTile[] = [];
	private fish: Fish[] = [];
	private octopusContainer!: Container;
	private octoBobPhase = 0;
	private chestContainer!: Container;
	private wordDisplay!: Text;
	private bubbles: { gfx: Graphics; x: number; y: number; speed: number }[] = [];

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
		this.buildOcean();
		this.buildCoral();
		this.buildFish();
		this.buildOctopus();
		this.buildChest();
		this.buildUI();
		this.buildAmbientBubbles();
		this.startWord(0);
	}

	enter() { super.enter(); }

	private buildOcean() {
		const bg = new Graphics();
		bg.rect(0, 0, 2000, 2000);
		bg.fill(OCEAN_DEEP);
		this.container.addChild(bg);

		// Light rays from top
		const rays = new Graphics();
		for (let i = 0; i < 5; i++) {
			rays.moveTo(100 + i * 180, 0);
			rays.lineTo(80 + i * 180, 800);
			rays.lineTo(140 + i * 180, 800);
			rays.closePath();
		}
		rays.fill({ color: 0x4FC3F7, alpha: 0.08 });
		this.container.addChild(rays);

		// Sandy floor
		const sand = new Graphics();
		sand.rect(0, 0, 2000, 80);
		sand.fill(SAND_COLOR);
		this.container.addChild(sand);
	}

	private buildCoral() {
		for (let i = 0; i < 6; i++) {
			const coral = new Graphics();
			const color = CORAL_COLORS[i % CORAL_COLORS.length] as number;
			const x = 50 + i * 140 + Math.random() * 40;
			// Branch coral
			for (let b = 0; b < 3; b++) {
				const bx = (b - 1) * 12;
				const h = 30 + Math.random() * 40;
				coral.roundRect(bx - 4, -h, 8, h, 4);
				coral.fill(color);
				coral.circle(bx, -h, 6);
				coral.fill(color);
			}
			coral.x = x;
			this.container.addChild(coral);
		}
	}

	private buildFish() {
		for (let i = 0; i < 4; i++) {
			const fish = new Container();
			const color = CORAL_COLORS[Math.floor(Math.random() * CORAL_COLORS.length)] as number;
			const body = new Graphics();
			body.ellipse(0, 0, 16, 8);
			body.fill(color);
			// Tail
			body.moveTo(-16, 0);
			body.lineTo(-24, -8);
			body.lineTo(-24, 8);
			body.closePath();
			body.fill(color);
			// Eye
			body.circle(8, -2, 3);
			body.fill(0xffffff);
			body.circle(9, -2, 1.5);
			body.fill(0x333333);
			fish.addChild(body);

			this.container.addChild(fish);
			this.fish.push({
				gfx: fish,
				x: Math.random() * 800,
				y: 100 + Math.random() * 300,
				speed: 20 + Math.random() * 30,
				phase: Math.random() * Math.PI * 2
			});
		}
	}

	private buildOctopus() {
		this.octopusContainer = new Container();

		// Head
		const head = new Graphics();
		head.ellipse(0, -30, 30, 35);
		head.fill(0xAB47BC);
		this.octopusContainer.addChild(head);

		// Eyes
		for (const side of [-1, 1]) {
			const eye = new Graphics();
			eye.circle(side * 12, -35, 8);
			eye.fill(0xffffff);
			eye.circle(side * 12, -35, 4);
			eye.fill(0x333333);
			this.octopusContainer.addChild(eye);
		}

		// Smile
		const smile = new Graphics();
		smile.arc(0, -22, 10, 0, Math.PI, false);
		smile.stroke({ color: 0x333333, width: 2 });
		this.octopusContainer.addChild(smile);

		// Tentacles (4 visible)
		for (let i = 0; i < 4; i++) {
			const tent = new Graphics();
			const tx = (i - 1.5) * 14;
			tent.moveTo(tx, 0);
			tent.quadraticCurveTo(tx + 8, 20, tx - 4, 35);
			tent.stroke({ color: 0x9C27B0, width: 6, cap: 'round' });
			this.octopusContainer.addChild(tent);
		}

		this.container.addChild(this.octopusContainer);
	}

	private buildChest() {
		this.chestContainer = new Container();
		const chest = new Graphics();
		// Base
		chest.roundRect(-30, -10, 60, 30, 6);
		chest.fill(0x8D6E63);
		chest.stroke({ color: 0xFFD700, width: 2 });
		// Lid
		chest.roundRect(-30, -30, 60, 22, 6);
		chest.fill(0xA1887F);
		chest.stroke({ color: 0xFFD700, width: 2 });
		// Lock
		chest.circle(0, -12, 6);
		chest.fill(0xFFD700);
		this.chestContainer.addChild(chest);
		this.container.addChild(this.chestContainer);
	}

	private buildUI() {
		this.wordDisplay = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 36,
				fill: 0xFFFFFF,
				fontWeight: 'bold',
				letterSpacing: 8,
				dropShadow: { color: 0x000000, blur: 4, distance: 2, alpha: 0.3 }
			})
		});
		this.wordDisplay.anchor.set(0.5, 0);
		this.container.addChild(this.wordDisplay);
	}

	private buildAmbientBubbles() {
		for (let i = 0; i < 12; i++) {
			const bubble = new Graphics();
			const r = 3 + Math.random() * 6;
			bubble.circle(0, 0, r);
			bubble.fill({ color: 0xffffff, alpha: 0.2 + Math.random() * 0.2 });
			bubble.x = Math.random() * 800;
			bubble.y = Math.random() * 600;
			this.container.addChild(bubble);
			this.bubbles.push({ gfx: bubble, x: bubble.x, y: bubble.y, speed: 15 + Math.random() * 20 });
		}
	}

	private startWord(index: number) {
		this.wordIndex = index;
		if (index >= this.levelConfig.words.length) {
			this.onLevelComplete?.();
			return;
		}

		// Clear old tiles
		for (const t of this.tiles) t.container.destroy({ children: true });
		this.tiles = [];
		this.collectedLetters = [];

		this.targetWord = this.levelConfig.words[index];
		this.targetLetters = this.targetWord.split('');
		this.updateWordDisplay();
		speakWord(this.targetWord);

		// Create floating letter tiles
		const w = this.width || 800;
		const h = this.height || 600;
		const letters = [...this.targetLetters];
		for (const d of this.levelConfig.distractors) {
			if (!letters.includes(d)) letters.push(d);
		}
		for (let i = letters.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[letters[i], letters[j]] = [letters[j], letters[i]];
		}

		const tileY = h * 0.6;
		const spacing = Math.min(70, (w - 80) / letters.length);
		const startX = w / 2 - (letters.length * spacing) / 2;

		for (let i = 0; i < letters.length; i++) {
			const tile = new Container();
			tile.x = startX + i * spacing + spacing / 2;
			tile.y = tileY + Math.random() * 40;
			tile.eventMode = 'static';
			tile.cursor = 'pointer';

			const bg = new Graphics();
			bg.roundRect(-22, -22, 44, 44, 10);
			bg.fill({ color: 0xffffff, alpha: 0.9 });
			bg.stroke({ color: 0x4FC3F7, width: 2 });
			tile.addChild(bg);

			const text = new Text({
				text: letters[i].toUpperCase(),
				style: new TextStyle({ fontFamily: 'Nunito, sans-serif', fontSize: 24, fill: OCEAN_MID, fontWeight: 'bold' })
			});
			text.anchor.set(0.5);
			tile.addChild(text);

			const data: FloatingTile = {
				letter: letters[i], container: tile,
				baseX: tile.x, baseY: tile.y,
				phase: Math.random() * Math.PI * 2, popped: false
			};

			tile.on('pointerdown', () => this.tapTile(data));
			this.tiles.push(data);
			this.container.addChild(tile);
		}
	}

	private updateWordDisplay() {
		const display = this.targetLetters
			.map((l, i) => (i < this.collectedLetters.length ? l.toUpperCase() : '_'))
			.join(' ');
		this.wordDisplay.text = display;
	}

	private async tapTile(tile: FloatingTile) {
		if (tile.popped) return;

		const nextNeeded = this.targetLetters[this.collectedLetters.length];
		if (tile.letter !== nextNeeded) {
			// Wrong — wobble
			let f = 0;
			const origX = tile.container.x;
			const wobble = () => {
				f++;
				tile.container.x = origX + Math.sin(f * 1.2) * 6 * Math.max(0, 1 - f / 10);
				if (f < 10) requestAnimationFrame(wobble);
				else tile.container.x = origX;
			};
			wobble();
			return;
		}

		// Correct!
		tile.popped = true;
		this.collectedLetters.push(tile.letter);
		tile.container.alpha = 0.3;
		tile.container.eventMode = 'none';

		await speakPhoneme(tile.letter);
		this.updateWordDisplay();

		if (this.collectedLetters.length === this.targetLetters.length) {
			await speakWord(this.targetWord);
			this.onWordComplete?.(this.targetWord);
			setTimeout(() => this.startWord(this.wordIndex + 1), 1400);
		}
	}

	update(delta: number) {
		const w = this.width || 800;
		const h = this.height || 600;

		// Position elements
		const sand = this.container.children[2] as Graphics;
		sand.y = h - 80;

		// Coral at bottom
		for (let i = 0; i < 6; i++) {
			const coral = this.container.children[3 + i];
			if (coral) coral.y = h - 80;
		}

		this.octopusContainer.x = w * 0.85;
		this.octopusContainer.y = h * 0.35;
		this.octoBobPhase += delta * 2;
		this.octopusContainer.y += Math.sin(this.octoBobPhase) * 8;

		this.chestContainer.x = w * 0.15;
		this.chestContainer.y = h - 60;

		this.wordDisplay.x = w / 2;
		this.wordDisplay.y = 20;

		// Animate tiles floating
		for (const t of this.tiles) {
			if (t.popped) continue;
			t.phase += delta * 1.8;
			t.container.y = t.baseY + Math.sin(t.phase) * 8;
			t.container.x = t.baseX + Math.cos(t.phase * 0.7) * 4;
		}

		// Animate fish
		for (const f of this.fish) {
			f.phase += delta;
			f.x += f.speed * delta;
			if (f.x > w + 40) f.x = -40;
			f.gfx.x = f.x;
			f.gfx.y = f.y + Math.sin(f.phase * 2) * 5;
		}

		// Ambient bubbles
		for (const b of this.bubbles) {
			b.y -= b.speed * delta;
			if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w; }
			b.gfx.x = b.x;
			b.gfx.y = b.y;
		}
	}

	resize(width: number, height: number) { super.resize(width, height); }
}
