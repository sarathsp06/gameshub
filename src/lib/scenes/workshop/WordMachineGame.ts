import { Container, Graphics, Text, TextStyle, type ColorSource } from 'pixi.js';
import { Scene } from '$lib/engine/scene-manager';
import type { GameApp } from '$lib/engine/game-app';
import { speakPhoneme, speakWord } from '$lib/engine/audio';

/**
 * World 2: Word Workshop — Word Machine
 * Bear runs a factory. Letter balls roll down chutes.
 * Drag the correct balls into slots on the machine to build words.
 * When word is complete, machine clanks and produces the word.
 */

interface LevelConfig {
	words: string[];
	distractors: string;
	requireOrder: boolean;
	hintDelay: number;
}

interface LetterBall {
	letter: string;
	container: Container;
	x: number;
	y: number;
	targetSlot: number | null; // if being dragged to a slot
	placed: boolean;
	dragging: boolean;
	dragOffsetX: number;
	dragOffsetY: number;
}

interface Slot {
	x: number;
	y: number;
	letter: string; // expected letter
	filled: boolean;
	gfx: Graphics;
}

interface Gear {
	gfx: Graphics;
	x: number;
	y: number;
	speed: number;
	phase: number;
}

const BALL_COLORS: ColorSource[] = [0xff6b9d, 0x7C4DFF, 0xFFB74D, 0x4CAF50, 0x00BCD4, 0xFF5722];
const MACHINE_COLOR = 0x546E7A;
const BELT_COLOR = 0x795548;

export class WordMachineGame extends Scene {
	private levelConfig: LevelConfig;
	private onLevelComplete: (() => void) | null;
	private onWordComplete: ((word: string) => void) | null;

	private wordIndex = 0;
	private targetWord = '';
	private targetLetters: string[] = [];
	private balls: LetterBall[] = [];
	private slots: Slot[] = [];
	private gears: Gear[] = [];
	private machineContainer!: Container;
	private bearContainer!: Container;
	private bearBobPhase = 0;
	private conveyorPhase = 0;
	private celebrateTimer = 0;
	private state: 'playing' | 'celebrating' = 'playing';

	// UI
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
		this.buildBackground();
		this.buildMachine();
		this.buildBear();
		this.buildUI();
		this.startWord(0);
	}

	enter() {
		super.enter();
	}

	private buildBackground() {
		// Factory interior
		const bg = new Graphics();
		bg.rect(0, 0, 2000, 2000);
		bg.fill(0x37474F);
		this.container.addChild(bg);

		// Floor
		const floor = new Graphics();
		floor.rect(0, 0, 2000, 120);
		floor.fill(0x4E342E);
		this.container.addChild(floor);

		// Pipes on wall
		for (let i = 0; i < 4; i++) {
			const pipe = new Graphics();
			pipe.roundRect(0, 0, 20, 200 + Math.random() * 100, 10);
			pipe.fill(0x78909C);
			pipe.x = 50 + i * 200 + Math.random() * 60;
			pipe.y = 20;
			this.container.addChild(pipe);
		}
	}

	private buildMachine() {
		this.machineContainer = new Container();
		this.container.addChild(this.machineContainer);

		// Main machine body
		const body = new Graphics();
		body.roundRect(0, 0, 300, 180, 12);
		body.fill(MACHINE_COLOR);
		body.stroke({ color: 0x37474F, width: 4 });
		this.machineContainer.addChild(body);

		// Funnel on top
		const funnel = new Graphics();
		funnel.moveTo(100, 0);
		funnel.lineTo(200, 0);
		funnel.lineTo(180, -40);
		funnel.lineTo(120, -40);
		funnel.closePath();
		funnel.fill(0x455A64);
		this.machineContainer.addChild(funnel);

		// Gears
		for (let i = 0; i < 3; i++) {
			const gear = new Graphics();
			const r = 18 + Math.random() * 10;
			gear.circle(0, 0, r);
			gear.fill(0x90A4AE);
			// Teeth
			for (let t = 0; t < 8; t++) {
				const angle = (t / 8) * Math.PI * 2;
				gear.rect(Math.cos(angle) * r - 3, Math.sin(angle) * r - 3, 6, 6);
				gear.fill(0x78909C);
			}
			gear.x = 50 + i * 100;
			gear.y = 90;
			this.machineContainer.addChild(gear);
			this.gears.push({ gfx: gear, x: gear.x, y: gear.y, speed: 1 + Math.random(), phase: Math.random() * Math.PI * 2 });
		}
	}

	private buildBear() {
		this.bearContainer = new Container();

		// Body
		const body = new Graphics();
		body.roundRect(-30, -60, 60, 60, 20);
		body.fill(0x795548);
		this.bearContainer.addChild(body);

		// Belly
		const belly = new Graphics();
		belly.ellipse(0, -30, 20, 22);
		belly.fill(0xA1887F);
		this.bearContainer.addChild(belly);

		// Ears
		for (const side of [-1, 1]) {
			const ear = new Graphics();
			ear.circle(side * 22, -60, 12);
			ear.fill(0x795548);
			ear.circle(side * 22, -60, 7);
			ear.fill(0xA1887F);
			this.bearContainer.addChild(ear);
		}

		// Eyes
		for (const side of [-1, 1]) {
			const eye = new Graphics();
			eye.circle(side * 10, -45, 5);
			eye.fill(0xffffff);
			eye.circle(side * 10, -45, 3);
			eye.fill(0x333333);
			this.bearContainer.addChild(eye);
		}

		// Nose
		const nose = new Graphics();
		nose.ellipse(0, -35, 6, 4);
		nose.fill(0x333333);
		this.bearContainer.addChild(nose);

		// Hard hat
		const hat = new Graphics();
		hat.roundRect(-25, -75, 50, 20, 8);
		hat.fill(0xFFC107);
		this.bearContainer.addChild(hat);

		this.container.addChild(this.bearContainer);
	}

	private buildUI() {
		this.wordLabel = new Text({
			text: '',
			style: new TextStyle({
				fontFamily: 'Nunito, sans-serif',
				fontSize: 28,
				fill: 0xFFFFFF,
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

		// Clear old
		for (const b of this.balls) b.container.destroy({ children: true });
		for (const s of this.slots) s.gfx.destroy();
		this.balls = [];
		this.slots = [];
		this.state = 'playing';

		this.targetWord = this.levelConfig.words[index];
		this.targetLetters = this.targetWord.split('');
		this.wordLabel.text = `Build: ${this.targetWord.toUpperCase()}`;

		speakWord(this.targetWord);

		const w = this.width || 800;
		const h = this.height || 600;

		// Create slots on the machine
		const slotStartX = w / 2 - (this.targetLetters.length * 50) / 2;
		for (let i = 0; i < this.targetLetters.length; i++) {
			const slotGfx = new Graphics();
			slotGfx.roundRect(0, 0, 44, 50, 8);
			slotGfx.fill({ color: 0x263238 });
			slotGfx.stroke({ color: 0xFFD700, width: 2 });
			slotGfx.x = slotStartX + i * 50;
			slotGfx.y = h * 0.45;
			this.container.addChild(slotGfx);

			this.slots.push({
				x: slotGfx.x + 22,
				y: slotGfx.y + 25,
				letter: this.targetLetters[i],
				filled: false,
				gfx: slotGfx
			});
		}

		// Create letter balls on conveyor (bottom)
		const letters = [...this.targetLetters];
		for (const d of this.levelConfig.distractors) {
			if (!letters.includes(d)) letters.push(d);
		}
		// Shuffle
		for (let i = letters.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[letters[i], letters[j]] = [letters[j], letters[i]];
		}

		const ballStartX = w / 2 - (letters.length * 60) / 2;
		for (let i = 0; i < letters.length; i++) {
			this.createBall(letters[i], ballStartX + i * 60 + 30, h * 0.78);
		}
	}

	private createBall(letter: string, x: number, y: number) {
		const ball = new Container();
		ball.x = x;
		ball.y = y;
		ball.eventMode = 'static';
		ball.cursor = 'grab';

		const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
		const circle = new Graphics();
		circle.circle(0, 0, 24);
		circle.fill(color as number);
		circle.stroke({ color: 0xffffff, width: 2, alpha: 0.6 });
		ball.addChild(circle);

		const text = new Text({
			text: letter.toUpperCase(),
			style: new TextStyle({ fontFamily: 'Nunito, sans-serif', fontSize: 24, fill: 0xffffff, fontWeight: 'bold' })
		});
		text.anchor.set(0.5);
		ball.addChild(text);

		const data: LetterBall = {
			letter, container: ball, x, y,
			targetSlot: null, placed: false, dragging: false,
			dragOffsetX: 0, dragOffsetY: 0
		};

		ball.on('pointerdown', (e) => {
			if (data.placed) return;
			data.dragging = true;
			const pos = e.global;
			data.dragOffsetX = ball.x - pos.x;
			data.dragOffsetY = ball.y - pos.y;
			ball.cursor = 'grabbing';
			ball.zIndex = 100;
		});

		ball.on('globalpointermove', (e) => {
			if (!data.dragging) return;
			const pos = e.global;
			ball.x = pos.x + data.dragOffsetX;
			ball.y = pos.y + data.dragOffsetY;
		});

		ball.on('pointerup', () => this.dropBall(data));
		ball.on('pointerupoutside', () => this.dropBall(data));

		this.balls.push(data);
		this.container.addChild(ball);
	}

	private dropBall(ball: LetterBall) {
		if (!ball.dragging) return;
		ball.dragging = false;
		ball.container.cursor = 'grab';
		ball.container.zIndex = 0;

		// Check if dropped on an unfilled slot that matches
		for (const slot of this.slots) {
			if (slot.filled) continue;
			const dx = ball.container.x - slot.x;
			const dy = ball.container.y - slot.y;
			if (Math.abs(dx) < 35 && Math.abs(dy) < 35) {
				// Check if correct letter for this slot (order matters)
				const slotIndex = this.slots.indexOf(slot);
				if (ball.letter === this.targetLetters[slotIndex]) {
					// Snap into slot
					ball.placed = true;
					ball.container.x = slot.x;
					ball.container.y = slot.y;
					ball.container.eventMode = 'none';
					slot.filled = true;
					speakPhoneme(ball.letter);
					this.checkWordComplete();
					return;
				}
			}
		}

		// Snap back
		ball.container.x = ball.x;
		ball.container.y = ball.y;
		// Wobble
		let f = 0;
		const origX = ball.x;
		const wobble = () => {
			f++;
			ball.container.x = origX + Math.sin(f * 1.2) * 5 * Math.max(0, 1 - f / 10);
			if (f < 10) requestAnimationFrame(wobble);
		};
		wobble();
	}

	private async checkWordComplete() {
		if (this.slots.every(s => s.filled)) {
			this.state = 'celebrating';
			this.celebrateTimer = 0;
			await speakWord(this.targetWord);
			this.onWordComplete?.(this.targetWord);
			setTimeout(() => this.startWord(this.wordIndex + 1), 1400);
		}
	}

	update(delta: number) {
		const w = this.width || 800;
		const h = this.height || 600;

		// Position elements
		const floor = this.container.children[1] as Graphics;
		floor.y = h - 120;

		this.machineContainer.x = w / 2 - 150;
		this.machineContainer.y = h * 0.25;

		this.bearContainer.x = w * 0.12;
		this.bearContainer.y = h - 120;

		this.wordLabel.x = w / 2;
		this.wordLabel.y = 16;

		// Animate gears
		for (const gear of this.gears) {
			gear.phase += delta * gear.speed;
			gear.gfx.rotation = gear.phase;
		}

		// Bear bob
		this.bearBobPhase += delta * 3;
		this.bearContainer.y = h - 120 + Math.sin(this.bearBobPhase) * 4;
		if (this.state === 'celebrating') {
			this.bearContainer.y -= Math.abs(Math.sin(this.bearBobPhase * 2)) * 15;
		}

		// Conveyor animation
		this.conveyorPhase += delta;
	}

	resize(width: number, height: number) {
		super.resize(width, height);
	}
}
