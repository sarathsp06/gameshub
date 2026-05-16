import { Container, Graphics, Text, TextStyle, type ColorSource } from 'pixi.js';
import { Scene } from '$lib/engine/scene-manager';
import type { GameApp } from '$lib/engine/game-app';
import { speakPhoneme, speakWord } from '$lib/engine/audio';

/**
 * World 4: Magic Castle — Spell Caster
 * Owl guides player. Tap a word to cast magic-e: cap→cape.
 * Vowel team spells merge with sparkle effects.
 */

interface LevelConfig {
	words: string[];
	distractors: string;
	requireOrder: boolean;
	hintDelay: number;
}

const CASTLE_BG = 0x2C1654;
const CASTLE_WALL = 0x4A148C;
const MAGIC_GLOW = 0xFFD700;
const SPARKLE_COLORS: ColorSource[] = [0xFFD700, 0xFF6B9D, 0x7C4DFF, 0x4FC3F7, 0xFFFFFF];

interface Sparkle {
	gfx: Graphics;
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
}

export class SpellCasterGame extends Scene {
	private levelConfig: LevelConfig;
	private onLevelComplete: (() => void) | null;
	private onWordComplete: ((word: string) => void) | null;

	private wordIndex = 0;
	private targetWord = '';
	private targetLetters: string[] = [];
	private collectedLetters: string[] = [];
	private letterContainers: Container[] = [];
	private owlContainer!: Container;
	private owlBobPhase = 0;
	private wandContainer!: Container;
	private sparkles: Sparkle[] = [];
	private wordLabel!: Text;
	private stars: { gfx: Graphics; phase: number; x: number; y: number }[] = [];

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
		this.buildCastle();
		this.buildOwl();
		this.buildWand();
		this.buildUI();
		this.buildStars();
		this.startWord(0);
	}

	enter() { super.enter(); }

	private buildCastle() {
		// Dark purple sky
		const bg = new Graphics();
		bg.rect(0, 0, 2000, 2000);
		bg.fill(CASTLE_BG);
		this.container.addChild(bg);

		// Castle wall/floor
		const wall = new Graphics();
		wall.rect(0, 0, 2000, 150);
		wall.fill(CASTLE_WALL);
		// Stone pattern
		for (let x = 0; x < 2000; x += 60) {
			for (let y = 0; y < 150; y += 40) {
				wall.rect(x + (y % 80 === 0 ? 0 : 30), y, 58, 38);
				wall.stroke({ color: 0x1A0033, width: 1, alpha: 0.3 });
			}
		}
		this.container.addChild(wall);

		// Arched windows
		for (let i = 0; i < 3; i++) {
			const win = new Graphics();
			win.roundRect(0, 0, 50, 80, 25);
			win.fill({ color: 0x1A237E, alpha: 0.6 });
			win.stroke({ color: 0x9C27B0, width: 3 });
			win.x = 120 + i * 250;
			win.y = 50;
			this.container.addChild(win);
		}

		// Candles
		for (let i = 0; i < 4; i++) {
			const candle = new Graphics();
			candle.rect(-3, -20, 6, 20);
			candle.fill(0xFFF9C4);
			// Flame
			candle.ellipse(0, -24, 5, 8);
			candle.fill(0xFFAB00);
			candle.ellipse(0, -26, 3, 5);
			candle.fill(0xFFD700);
			candle.x = 80 + i * 200;
			candle.y = 160;
			this.container.addChild(candle);
		}
	}

	private buildOwl() {
		this.owlContainer = new Container();

		// Body
		const body = new Graphics();
		body.ellipse(0, -25, 28, 35);
		body.fill(0x6D4C41);
		this.owlContainer.addChild(body);

		// Belly feathers
		const belly = new Graphics();
		belly.ellipse(0, -15, 18, 22);
		belly.fill(0xA1887F);
		this.owlContainer.addChild(belly);

		// Eyes (big owl eyes)
		for (const side of [-1, 1]) {
			const eyeOuter = new Graphics();
			eyeOuter.circle(side * 14, -35, 12);
			eyeOuter.fill(0xFFD700);
			eyeOuter.circle(side * 14, -35, 7);
			eyeOuter.fill(0x333333);
			eyeOuter.circle(side * 14 + 2, -37, 3);
			eyeOuter.fill(0xffffff);
			this.owlContainer.addChild(eyeOuter);
		}

		// Beak
		const beak = new Graphics();
		beak.moveTo(0, -28);
		beak.lineTo(-5, -22);
		beak.lineTo(5, -22);
		beak.closePath();
		beak.fill(0xF57C00);
		this.owlContainer.addChild(beak);

		// Ear tufts
		for (const side of [-1, 1]) {
			const tuft = new Graphics();
			tuft.moveTo(side * 18, -55);
			tuft.lineTo(side * 22, -70);
			tuft.lineTo(side * 14, -58);
			tuft.fill(0x5D4037);
			this.owlContainer.addChild(tuft);
		}

		// Wizard hat
		const hat = new Graphics();
		hat.moveTo(0, -90);
		hat.lineTo(-22, -55);
		hat.lineTo(22, -55);
		hat.closePath();
		hat.fill(0x4A148C);
		hat.circle(0, -90, 5);
		hat.fill(0xFFD700);
		this.owlContainer.addChild(hat);

		this.container.addChild(this.owlContainer);
	}

	private buildWand() {
		this.wandContainer = new Container();
		const wand = new Graphics();
		wand.rect(-2, 0, 4, 50);
		wand.fill(0x4E342E);
		// Star tip
		wand.circle(0, -4, 8);
		wand.fill(0xFFD700);
		this.wandContainer.addChild(wand);
		this.container.addChild(this.wandContainer);
	}

	private buildUI() {
		this.wordLabel = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 20,
				fill: 0xCE93D8,
				fontWeight: 'bold'
			})
		});
		this.wordLabel.anchor.set(0.5, 0);
		this.container.addChild(this.wordLabel);
	}

	private buildStars() {
		for (let i = 0; i < 15; i++) {
			const star = new Graphics();
			star.circle(0, 0, 1.5 + Math.random() * 1.5);
			star.fill({ color: 0xffffff, alpha: 0.3 + Math.random() * 0.5 });
			star.x = Math.random() * 900;
			star.y = Math.random() * 200;
			this.container.addChild(star);
			this.stars.push({ gfx: star, phase: Math.random() * Math.PI * 2, x: star.x, y: star.y });
		}
	}

	private startWord(index: number) {
		this.wordIndex = index;
		if (index >= this.levelConfig.words.length) {
			this.onLevelComplete?.();
			return;
		}

		for (const lc of this.letterContainers) lc.destroy({ children: true });
		this.letterContainers = [];
		this.collectedLetters = [];

		this.targetWord = this.levelConfig.words[index];
		this.targetLetters = this.targetWord.split('');
		this.wordLabel.text = `🔮 Spell: ${this.targetWord.toUpperCase()}`;
		speakWord(this.targetWord);

		const w = this.width || 800;
		const h = this.height || 600;

		// Create tappable letter runes
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
			const lc = new Container();
			lc.x = startX + i * spacing + spacing / 2;
			lc.y = h * 0.55;
			lc.eventMode = 'static';
			lc.cursor = 'pointer';

			// Magic rune stone
			const stone = new Graphics();
			stone.roundRect(-28, -28, 56, 56, 12);
			stone.fill(0x311B92);
			stone.stroke({ color: MAGIC_GLOW, width: 2, alpha: 0.6 });
			lc.addChild(stone);

			const text = new Text({
				text: letters[i].toUpperCase(),
				style: new TextStyle({ fontFamily: 'Nunito, sans-serif', fontSize: 28, fill: 0xFFD700, fontWeight: 'bold' })
			});
			text.anchor.set(0.5);
			lc.addChild(text);

			const letter = letters[i];
			lc.on('pointerdown', () => this.tapLetter(letter, lc));

			this.letterContainers.push(lc);
			this.container.addChild(lc);
		}
	}

	private async tapLetter(letter: string, lc: Container) {
		const nextNeeded = this.targetLetters[this.collectedLetters.length];
		if (letter !== nextNeeded) {
			// Wobble
			let f = 0;
			const origX = lc.x;
			const wobble = () => { f++; lc.x = origX + Math.sin(f * 1.2) * 5 * Math.max(0, 1 - f / 10); if (f < 10) requestAnimationFrame(wobble); else lc.x = origX; };
			wobble();
			return;
		}

		// Correct — sparkle burst
		this.collectedLetters.push(letter);
		lc.alpha = 0.3;
		lc.eventMode = 'none';
		this.emitSparkles(lc.x, lc.y);

		await speakPhoneme(letter);

		if (this.collectedLetters.length === this.targetLetters.length) {
			await speakWord(this.targetWord);
			this.onWordComplete?.(this.targetWord);
			setTimeout(() => this.startWord(this.wordIndex + 1), 1400);
		}
	}

	private emitSparkles(x: number, y: number) {
		for (let i = 0; i < 8; i++) {
			const s = new Graphics();
			s.circle(0, 0, 3 + Math.random() * 3);
			s.fill(SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)] as number);
			s.x = x;
			s.y = y;
			this.container.addChild(s);
			this.sparkles.push({
				gfx: s, x, y,
				vx: (Math.random() - 0.5) * 120,
				vy: (Math.random() - 0.5) * 120,
				life: 1
			});
		}
	}

	update(delta: number) {
		const w = this.width || 800;
		const h = this.height || 600;

		// Position wall at bottom
		const wall = this.container.children[1] as Graphics;
		wall.y = h - 150;

		this.owlContainer.x = w * 0.85;
		this.owlContainer.y = h * 0.4;
		this.owlBobPhase += delta * 2.5;
		this.owlContainer.y += Math.sin(this.owlBobPhase) * 5;

		this.wandContainer.x = w * 0.78;
		this.wandContainer.y = h * 0.45;
		this.wandContainer.rotation = Math.sin(this.owlBobPhase * 0.5) * 0.15;

		this.wordLabel.x = w / 2;
		this.wordLabel.y = 16;

		// Sparkles
		for (let i = this.sparkles.length - 1; i >= 0; i--) {
			const s = this.sparkles[i];
			s.life -= delta * 2;
			s.x += s.vx * delta;
			s.y += s.vy * delta;
			s.vy += 100 * delta; // gravity
			s.gfx.x = s.x;
			s.gfx.y = s.y;
			s.gfx.alpha = Math.max(0, s.life);
			if (s.life <= 0) {
				s.gfx.destroy();
				this.sparkles.splice(i, 1);
			}
		}

		// Twinkling stars
		for (const star of this.stars) {
			star.phase += delta * 3;
			star.gfx.alpha = 0.3 + Math.sin(star.phase) * 0.3;
		}
	}

	resize(width: number, height: number) { super.resize(width, height); }
}
