import { Container, Graphics, Text, TextStyle, type ColorSource } from 'pixi.js';
import { Scene } from '$lib/engine/scene-manager';
import type { GameApp } from '$lib/engine/game-app';
import { speakPhoneme, speakWord } from '$lib/engine/audio';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LevelConfig {
	words: string[];
	distractors: string;
	requireOrder: boolean;
	hintDelay: number;
}

interface Bubble {
	letter: string;
	container: Container;
	baseX: number;
	y: number;
	vy: number;
	wobblePhase: number;
	popped: boolean;
	spawned: boolean; // has entered the visible area
}

interface Butterfly {
	container: Container;
	phase: number;
	offsetX: number;
	offsetY: number;
}

interface Cloud {
	gfx: Graphics;
	x: number;
	speed: number;
}

interface Flower {
	gfx: Container;
	worldX: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SKY_TOP = 0x7ec8e3;
const SKY_BOTTOM = 0xc9f0ff;
const GRASS_COLOR = 0x5cb85c;
const GRASS_DARK = 0x4a9e4a;
const BUBBLE_COLORS: ColorSource[] = [0xff6b9d, 0xffa06b, 0xffdc6b, 0x6bffa0, 0x6bd4ff, 0xc46bff];
const FOXY_COLOR = 0xff8c42;
const FOXY_SIZE = 60;
const SCROLL_SPEED = 40; // pixels per second base
const BUBBLE_FLOAT_SPEED = 30;
const BUBBLE_SPAWN_INTERVAL = 1.2; // seconds between bubble spawns
const SECTION_WIDTH = 600; // pixels per word section

// ─── Main Game ──────────────────────────────────────────────────────────────

export class BubblePopGame extends Scene {
	private levelConfig: LevelConfig;
	private onLevelComplete: (() => void) | null;
	private onWordComplete: ((word: string) => void) | null;

	// World state
	private scrollX = 0;
	private worldLayer!: Container;
	private uiLayer!: Container;
	private foxyContainer!: Container;
	private foxyY = 0;
	private foxyBobPhase = 0;
	private foxyState: 'walking' | 'waiting' | 'celebrating' = 'walking';

	// Environment
	private clouds: Cloud[] = [];
	private flowers: Flower[] = [];
	private grassSegments: Graphics[] = [];

	// Game state
	private wordIndex = 0;
	private targetWord = '';
	private targetLetters: string[] = [];
	private collectedLetters: string[] = [];
	private bubbles: Bubble[] = [];
	private bubbleSpawnTimer = 0;
	private pendingLetters: string[] = []; // letters still to spawn as bubbles
	private combo = 0;
	private butterflies: Butterfly[] = [];

	// UI elements
	private jarContainer!: Container;
	private jarLetters!: Text;
	private signpostContainer!: Container;
	private signpostText!: Text;
	private comboText!: Text;

	constructor(
		app: GameApp,
		levelConfig: LevelConfig,
		callbacks?: {
			onLevelComplete?: () => void;
			onWordComplete?: (word: string) => void;
		}
	) {
		super(app);
		this.levelConfig = levelConfig;
		this.onLevelComplete = callbacks?.onLevelComplete ?? null;
		this.onWordComplete = callbacks?.onWordComplete ?? null;
	}

	async load() {
		// Create layers
		this.worldLayer = new Container();
		this.uiLayer = new Container();
		this.container.addChild(this.worldLayer);
		this.container.addChild(this.uiLayer);

		this.buildSky();
		this.buildGround();
		this.buildClouds();
		this.buildFlowers();
		this.buildFoxy();
		this.buildUI();

		this.startWord(0);
	}

	enter() {
		super.enter();
		this.layout();
	}

	// ─── Environment Building ─────────────────────────────────────────────

	private buildSky() {
		const sky = new Graphics();
		sky.rect(0, 0, 4000, 2000);
		sky.fill(SKY_TOP);
		this.worldLayer.addChildAt(sky, 0);
	}

	private buildGround() {
		// Rolling hills ground
		const ground = new Graphics();
		const totalWidth = SECTION_WIDTH * (this.levelConfig.words.length + 2);

		// Main grass
		ground.rect(0, 0, totalWidth, 200);
		ground.fill(GRASS_COLOR);

		// Darker strip at top of grass
		ground.rect(0, 0, totalWidth, 12);
		ground.fill(GRASS_DARK);

		this.worldLayer.addChild(ground);

		// Grass tufts
		for (let x = 0; x < totalWidth; x += 30 + Math.random() * 40) {
			const tuft = new Graphics();
			const h = 8 + Math.random() * 16;
			tuft.moveTo(0, 0);
			tuft.lineTo(-4, -h);
			tuft.lineTo(0, -h + 3);
			tuft.lineTo(4, -h);
			tuft.lineTo(0, 0);
			tuft.fill(Math.random() > 0.5 ? 0x6fcf6f : 0x4a9e4a);
			tuft.x = x;
			tuft.y = 0;
			ground.addChild(tuft);
		}

		this.grassSegments.push(ground);
	}

	private buildClouds() {
		for (let i = 0; i < 6; i++) {
			const cloud = new Graphics();
			const w = 80 + Math.random() * 100;
			const h = 30 + Math.random() * 20;
			cloud.ellipse(0, 0, w / 2, h / 2);
			cloud.fill({ color: 0xffffff, alpha: 0.7 + Math.random() * 0.3 });
			// Add extra puffs
			cloud.ellipse(-w * 0.3, 5, w * 0.25, h * 0.4);
			cloud.fill({ color: 0xffffff, alpha: 0.6 });
			cloud.ellipse(w * 0.25, 3, w * 0.3, h * 0.35);
			cloud.fill({ color: 0xffffff, alpha: 0.6 });

			cloud.y = 40 + Math.random() * 100;
			cloud.x = Math.random() * 1200;

			this.worldLayer.addChild(cloud);
			this.clouds.push({ gfx: cloud, x: cloud.x, speed: 8 + Math.random() * 12 });
		}
	}

	private buildFlowers() {
		const totalWidth = SECTION_WIDTH * (this.levelConfig.words.length + 2);
		for (let x = 80; x < totalWidth; x += 60 + Math.random() * 80) {
			const flower = new Container();
			const petalColor = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

			// Stem
			const stem = new Graphics();
			stem.rect(-2, -20, 4, 20);
			stem.fill(0x3d8b3d);
			flower.addChild(stem);

			// Petals
			const petals = new Graphics();
			for (let a = 0; a < 5; a++) {
				const angle = (a / 5) * Math.PI * 2;
				petals.circle(Math.cos(angle) * 7, -20 + Math.sin(angle) * 7, 6);
			}
			petals.fill(petalColor as number);
			flower.addChild(petals);

			// Center
			const center = new Graphics();
			center.circle(0, -20, 4);
			center.fill(0xffd700);
			flower.addChild(center);

			flower.x = x;
			this.worldLayer.addChild(flower);
			this.flowers.push({ gfx: flower, worldX: x });
		}
	}

	private buildFoxy() {
		this.foxyContainer = new Container();

		// Body (rounded rectangle-ish fox shape using circles)
		const body = new Graphics();
		body.roundRect(-FOXY_SIZE / 2, -FOXY_SIZE, FOXY_SIZE, FOXY_SIZE, 16);
		body.fill(FOXY_COLOR);
		this.foxyContainer.addChild(body);

		// Belly
		const belly = new Graphics();
		belly.ellipse(0, -FOXY_SIZE * 0.35, FOXY_SIZE * 0.3, FOXY_SIZE * 0.3);
		belly.fill(0xffeedd);
		this.foxyContainer.addChild(belly);

		// Ears
		const earL = new Graphics();
		earL.moveTo(-FOXY_SIZE * 0.35, -FOXY_SIZE);
		earL.lineTo(-FOXY_SIZE * 0.2, -FOXY_SIZE - 20);
		earL.lineTo(-FOXY_SIZE * 0.05, -FOXY_SIZE);
		earL.fill(FOXY_COLOR);
		this.foxyContainer.addChild(earL);

		const earR = new Graphics();
		earR.moveTo(FOXY_SIZE * 0.05, -FOXY_SIZE);
		earR.lineTo(FOXY_SIZE * 0.2, -FOXY_SIZE - 20);
		earR.lineTo(FOXY_SIZE * 0.35, -FOXY_SIZE);
		earR.fill(FOXY_COLOR);
		this.foxyContainer.addChild(earR);

		// Eyes
		const eyeL = new Graphics();
		eyeL.circle(-12, -FOXY_SIZE * 0.7, 6);
		eyeL.fill(0xffffff);
		eyeL.circle(-12, -FOXY_SIZE * 0.7, 3);
		eyeL.fill(0x333333);
		this.foxyContainer.addChild(eyeL);

		const eyeR = new Graphics();
		eyeR.circle(12, -FOXY_SIZE * 0.7, 6);
		eyeR.fill(0xffffff);
		eyeR.circle(12, -FOXY_SIZE * 0.7, 3);
		eyeR.fill(0x333333);
		this.foxyContainer.addChild(eyeR);

		// Nose
		const nose = new Graphics();
		nose.circle(0, -FOXY_SIZE * 0.55, 4);
		nose.fill(0x333333);
		this.foxyContainer.addChild(nose);

		// Tail
		const tail = new Graphics();
		tail.moveTo(FOXY_SIZE * 0.4, -FOXY_SIZE * 0.3);
		tail.quadraticCurveTo(FOXY_SIZE * 0.8, -FOXY_SIZE * 0.6, FOXY_SIZE * 0.6, -FOXY_SIZE * 0.1);
		tail.stroke({ color: FOXY_COLOR, width: 10, cap: 'round' });
		// White tail tip
		tail.moveTo(FOXY_SIZE * 0.6, -FOXY_SIZE * 0.15);
		tail.quadraticCurveTo(FOXY_SIZE * 0.7, -FOXY_SIZE * 0.05, FOXY_SIZE * 0.55, 0);
		tail.stroke({ color: 0xffeedd, width: 8, cap: 'round' });
		this.foxyContainer.addChild(tail);

		this.worldLayer.addChild(this.foxyContainer);
	}

	private buildUI() {
		// Jar (top-left) — shows collected letters
		this.jarContainer = new Container();
		const jar = new Graphics();
		jar.roundRect(0, 0, 200, 56, 16);
		jar.fill({ color: 0xffffff, alpha: 0.9 });
		jar.stroke({ color: 0xffd700, width: 3 });
		this.jarContainer.addChild(jar);

		// Jar icon
		const jarIcon = new Text({
			text: '🫙',
			style: new TextStyle({ fontSize: 28 })
		});
		jarIcon.x = 8;
		jarIcon.y = 10;
		this.jarContainer.addChild(jarIcon);

		this.jarLetters = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 28,
				fill: 0xff6b9d,
				fontWeight: 'bold',
				letterSpacing: 6
			})
		});
		this.jarLetters.x = 44;
		this.jarLetters.y = 12;
		this.jarContainer.addChild(this.jarLetters);

		this.jarContainer.x = 16;
		this.jarContainer.y = 16;
		this.uiLayer.addChild(this.jarContainer);

		// Signpost (top-center) — large, prominent target word display
		this.signpostContainer = new Container();

		// Wooden post
		const post = new Graphics();
		post.roundRect(88, 56, 14, 24, 4);
		post.fill(0x6B3A1F);
		this.signpostContainer.addChild(post);

		// Sign board — big, bright, impossible to miss
		const sign = new Graphics();
		sign.roundRect(0, 0, 190, 62, 14);
		sign.fill(0xFFF8E1); // warm cream background
		sign.stroke({ color: 0xFF6B9D, width: 4 });
		this.signpostContainer.addChild(sign);

		// "Find:" label
		const findLabel = new Text({
			text: '🔍 Find:',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 14,
				fill: 0x999999,
				fontWeight: 'bold'
			})
		});
		findLabel.x = 12;
		findLabel.y = 4;
		this.signpostContainer.addChild(findLabel);

		this.signpostText = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 32,
				fill: 0xFF6B9D,
				fontWeight: 'bold',
				letterSpacing: 6,
				dropShadow: {
					color: 0x000000,
					blur: 2,
					distance: 1,
					alpha: 0.15
				}
			})
		});
		this.signpostText.anchor.set(0.5, 0);
		this.signpostText.x = 95;
		this.signpostText.y = 24;
		this.signpostContainer.addChild(this.signpostText);

		this.uiLayer.addChild(this.signpostContainer);

		// Combo text
		this.comboText = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 22,
				fill: 0xff6b9d,
				fontWeight: 'bold'
			})
		});
		this.comboText.anchor.set(0.5, 0);
		this.uiLayer.addChild(this.comboText);
	}

	// ─── Game Logic ───────────────────────────────────────────────────────

	private startWord(index: number) {
		this.wordIndex = index;
		if (index >= this.levelConfig.words.length) {
			this.foxyState = 'celebrating';
			setTimeout(() => this.onLevelComplete?.(), 1500);
			return;
		}

		this.targetWord = this.levelConfig.words[index];
		this.targetLetters = this.targetWord.split('');
		this.collectedLetters = [];
		this.foxyState = 'walking';
		this.bubbleSpawnTimer = 0;

		// Build pending letters to spawn: word letters + some distractors
		const letters = [...this.targetLetters];
		const distractorCount = Math.min(this.levelConfig.distractors.length, 3);
		for (let i = 0; i < distractorCount; i++) {
			const d = this.levelConfig.distractors[i];
			if (d && !letters.includes(d)) letters.push(d);
		}
		// Shuffle
		for (let i = letters.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[letters[i], letters[j]] = [letters[j], letters[i]];
		}
		this.pendingLetters = letters;

		this.updateUI();

		// Speak the target word aloud so the child hears what they're looking for
		speakWord(this.targetWord);
	}

	private updateUI() {
		// Jar shows collected letters with blanks
		const display = this.targetLetters
			.map((l, i) => (i < this.collectedLetters.length ? l.toUpperCase() : '·'))
			.join('');
		this.jarLetters.text = display;

		// Signpost shows target word
		this.signpostText.text = this.targetWord.toUpperCase();

		// Combo
		if (this.combo >= 2) {
			this.comboText.text = `${this.combo}x combo!`;
		} else {
			this.comboText.text = '';
		}
	}

	private spawnBubble() {
		if (this.pendingLetters.length === 0) {
			// Respawn needed letters that haven't been collected yet
			const needed = this.targetLetters.slice(this.collectedLetters.length);
			if (needed.length > 0) {
				// Add one needed + maybe a distractor
				this.pendingLetters.push(needed[0]);
				if (this.levelConfig.distractors.length > 0) {
					const d = this.levelConfig.distractors[Math.floor(Math.random() * this.levelConfig.distractors.length)];
					this.pendingLetters.push(d);
				}
			}
			return;
		}

		const letter = this.pendingLetters.shift()!;
		const w = this.width || 800;
		const h = this.height || 600;
		const groundY = h - 100;

		// Spawn position: near Foxy but slightly ahead or behind
		const foxyScreenX = this.foxyContainer.x - this.scrollX;
		const spawnWorldX = this.scrollX + foxyScreenX + (Math.random() - 0.3) * w * 0.6;
		const spawnY = groundY;

		const radius = 36;
		const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

		const bubbleContainer = new Container();
		bubbleContainer.x = spawnWorldX;
		bubbleContainer.y = spawnY;
		bubbleContainer.eventMode = 'static';
		bubbleContainer.cursor = 'pointer';

		// Bubble circle
		const circle = new Graphics();
		circle.circle(0, 0, radius);
		circle.fill({ color: color as number, alpha: 0.85 });
		circle.stroke({ color: 0xffffff, width: 3, alpha: 0.6 });
		bubbleContainer.addChild(circle);

		// Shine
		const shine = new Graphics();
		shine.circle(-radius * 0.3, -radius * 0.3, radius * 0.18);
		shine.fill({ color: 0xffffff, alpha: 0.5 });
		bubbleContainer.addChild(shine);

		// Letter
		const text = new Text({
			text: letter.toUpperCase(),
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 30,
				fill: 0xffffff,
				fontWeight: 'bold'
			})
		});
		text.anchor.set(0.5);
		bubbleContainer.addChild(text);

		const data: Bubble = {
			letter,
			container: bubbleContainer,
			baseX: spawnWorldX,
			y: spawnY,
			vy: -(BUBBLE_FLOAT_SPEED + Math.random() * 15),
			wobblePhase: Math.random() * Math.PI * 2,
			popped: false,
			spawned: true
		};

		bubbleContainer.on('pointerdown', () => this.tapBubble(data));

		this.bubbles.push(data);
		this.worldLayer.addChild(bubbleContainer);
	}

	private async tapBubble(bubble: Bubble) {
		if (bubble.popped) return;

		const nextNeeded = this.levelConfig.requireOrder
			? this.targetLetters[this.collectedLetters.length]
			: null;

		// Check if this is a valid letter to collect
		const neededCount = this.targetLetters.filter(l => l === bubble.letter).length;
		const collectedCount = this.collectedLetters.filter(l => l === bubble.letter).length;
		const isNeeded = collectedCount < neededCount;

		if (this.levelConfig.requireOrder && bubble.letter !== nextNeeded) {
			this.rejectBubble(bubble);
			return;
		}

		if (!isNeeded) {
			this.rejectBubble(bubble);
			return;
		}

		// Collect!
		bubble.popped = true;
		this.collectedLetters.push(bubble.letter);
		this.combo++;

		// Pop animation — scale up, fly toward jar
		const c = bubble.container;
		this.animateCollect(c);

		await speakPhoneme(bubble.letter);
		this.updateUI();

		// Add butterfly for combo
		if (this.combo >= 2) {
			this.addButterfly();
		}

		// Check word complete
		if (this.collectedLetters.length === this.targetLetters.length) {
			this.foxyState = 'celebrating';
			await speakWord(this.targetWord);
			this.onWordComplete?.(this.targetWord);

			// Clear remaining bubbles
			for (const b of this.bubbles) {
				if (!b.popped) {
					b.popped = true;
					b.container.alpha = 0;
				}
			}

			setTimeout(() => {
				this.foxyState = 'walking';
				this.startWord(this.wordIndex + 1);
			}, 1400);
		}
	}

	private animateCollect(c: Container) {
		let frame = 0;
		const startX = c.x;
		const startY = c.y;
		const animate = () => {
			frame++;
			const t = frame / 15;
			c.scale.set(1 + t * 0.3);
			c.alpha = 1 - t;
			c.y = startY - t * 40;
			if (frame < 15) requestAnimationFrame(animate);
			else c.visible = false;
		};
		animate();
	}

	private rejectBubble(bubble: Bubble) {
		this.combo = 0;
		this.updateUI();

		// Wobble + slight pop
		const c = bubble.container;
		let frame = 0;
		const origX = c.x;
		const wobble = () => {
			frame++;
			c.x = origX + Math.sin(frame * 1.2) * 6 * Math.max(0, 1 - frame / 10);
			c.alpha = 0.6 + Math.sin(frame * 0.5) * 0.2;
			if (frame < 12) requestAnimationFrame(wobble);
			else { c.x = origX; c.alpha = 1; }
		};
		wobble();
	}

	private addButterfly() {
		const bf = new Container();
		// Simple butterfly: two wing shapes
		const wing = new Graphics();
		const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
		wing.ellipse(-8, 0, 8, 12);
		wing.fill({ color: color as number, alpha: 0.8 });
		wing.ellipse(8, 0, 8, 12);
		wing.fill({ color: color as number, alpha: 0.8 });
		// Body
		wing.rect(-1.5, -6, 3, 12);
		wing.fill(0x333333);
		bf.addChild(wing);
		bf.scale.set(0.7 + Math.random() * 0.3);

		this.worldLayer.addChild(bf);
		this.butterflies.push({
			container: bf,
			phase: Math.random() * Math.PI * 2,
			offsetX: -30 - Math.random() * 60,
			offsetY: -80 - Math.random() * 60
		});

		// Limit butterflies
		if (this.butterflies.length > 8) {
			const old = this.butterflies.shift()!;
			old.container.destroy();
		}
	}

	// ─── Update Loop ──────────────────────────────────────────────────────

	update(delta: number) {
		const w = this.width || 800;
		const h = this.height || 600;
		const groundY = h - 100;

		// Foxy position in world
		const foxyWorldX = 150 + this.scrollX;

		// Scroll forward when walking
		if (this.foxyState === 'walking') {
			this.scrollX += SCROLL_SPEED * delta;

			// Stop scrolling at the end of the next word section if all pending bubbles are gone
			// (Foxy walks until there are bubbles to catch)
		}

		// Foxy bob
		this.foxyBobPhase += delta * (this.foxyState === 'walking' ? 6 : 3);
		this.foxyContainer.x = foxyWorldX;
		this.foxyY = groundY - Math.abs(Math.sin(this.foxyBobPhase)) * (this.foxyState === 'walking' ? 8 : 3);
		this.foxyContainer.y = this.foxyY;

		// Celebrate bounce
		if (this.foxyState === 'celebrating') {
			this.foxyContainer.y = groundY - Math.abs(Math.sin(this.foxyBobPhase * 1.5)) * 20;
			this.foxyContainer.rotation = Math.sin(this.foxyBobPhase) * 0.1;
		} else {
			this.foxyContainer.rotation = 0;
		}

		// Spawn bubbles periodically
		if (this.foxyState === 'walking' || this.foxyState === 'waiting') {
			this.bubbleSpawnTimer += delta;
			if (this.bubbleSpawnTimer >= BUBBLE_SPAWN_INTERVAL) {
				this.bubbleSpawnTimer = 0;
				this.spawnBubble();
			}
		}

		// If no pending letters and no active bubbles with needed letters, try respawn
		const activeBubbles = this.bubbles.filter(b => !b.popped);
		const hasNeededBubble = activeBubbles.some(b => {
			const neededCount = this.targetLetters.filter(l => l === b.letter).length;
			const collectedCount = this.collectedLetters.filter(l => l === b.letter).length;
			return collectedCount < neededCount;
		});
		if (!hasNeededBubble && this.pendingLetters.length === 0 && this.collectedLetters.length < this.targetLetters.length) {
			this.spawnBubble();
		}

		// Update bubbles
		for (const b of this.bubbles) {
			if (b.popped) continue;
			b.y += b.vy * delta;
			b.wobblePhase += delta * 2.5;
			b.container.x = b.baseX + Math.sin(b.wobblePhase) * 20;
			b.container.y = b.y;

			// Gentle scale pulse
			const pulse = 1 + Math.sin(b.wobblePhase * 1.5) * 0.04;
			b.container.scale.set(pulse);

			// Remove if floated off top
			if (b.y < -80) {
				b.popped = true;
				b.container.visible = false;
				// If it was a needed letter, re-add to pending
				const neededCount = this.targetLetters.filter(l => l === b.letter).length;
				const collectedCount = this.collectedLetters.filter(l => l === b.letter).length;
				if (collectedCount < neededCount) {
					this.pendingLetters.push(b.letter);
				}
			}
		}

		// Update clouds (parallax — move slower than scroll)
		for (const cloud of this.clouds) {
			cloud.gfx.x = cloud.x - this.scrollX * 0.2;
			// Wrap
			if (cloud.gfx.x < -200) {
				cloud.x += w + 400;
			}
		}

		// Update flower positions (move with world)
		for (const f of this.flowers) {
			f.gfx.x = f.worldX;
			f.gfx.y = groundY;
		}

		// Update butterflies — follow Foxy
		for (const bf of this.butterflies) {
			bf.phase += delta * 4;
			bf.container.x = foxyWorldX + bf.offsetX + Math.sin(bf.phase) * 15;
			bf.container.y = this.foxyY + bf.offsetY + Math.cos(bf.phase * 0.7) * 10;
			// Wing flap via scaleY
			bf.container.scale.y = 0.7 + Math.abs(Math.sin(bf.phase * 2)) * 0.3;
		}

		// Camera: worldLayer offset so Foxy stays at screen-left quarter
		this.worldLayer.x = -this.scrollX;

		// Position ground
		for (const g of this.grassSegments) {
			g.y = groundY;
		}

		// Position signpost (top-right UI)
		this.signpostContainer.x = (w - 190) / 2;
		this.signpostContainer.y = 12;

		// Combo text under jar
		this.comboText.x = w / 2;
		this.comboText.y = 80;
	}

	resize(width: number, height: number) {
		super.resize(width, height);
		this.layout();
	}

	private layout() {
		// Re-layout on resize if needed
	}
}
