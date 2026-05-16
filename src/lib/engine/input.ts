import type { Container, FederatedPointerEvent } from 'pixi.js';

export type InputCallback = (x: number, y: number) => void;

/**
 * Unified input handler for PixiJS.
 * Normalizes touch and mouse into simple tap/drag events.
 * Ages 4+: press-on (pointerdown), not release-off.
 */
export class InputHandler {
	private target: Container;
	private onTap: InputCallback | null = null;
	private onDragStart: InputCallback | null = null;
	private onDragMove: InputCallback | null = null;
	private onDragEnd: InputCallback | null = null;
	private dragging = false;

	constructor(target: Container) {
		this.target = target;
		this.target.eventMode = 'static';
		this.target.cursor = 'pointer';

		this.target.on('pointerdown', this.handlePointerDown, this);
		this.target.on('pointermove', this.handlePointerMove, this);
		this.target.on('pointerup', this.handlePointerUp, this);
		this.target.on('pointerupoutside', this.handlePointerUp, this);
	}

	setOnTap(cb: InputCallback) {
		this.onTap = cb;
	}

	setOnDrag(start: InputCallback, move: InputCallback, end: InputCallback) {
		this.onDragStart = start;
		this.onDragMove = move;
		this.onDragEnd = end;
	}

	private handlePointerDown(e: FederatedPointerEvent) {
		const pos = e.getLocalPosition(this.target.parent ?? this.target);
		this.onTap?.(pos.x, pos.y);
		if (this.onDragStart) {
			this.dragging = true;
			this.onDragStart(pos.x, pos.y);
		}
	}

	private handlePointerMove(e: FederatedPointerEvent) {
		if (this.dragging && this.onDragMove) {
			const pos = e.getLocalPosition(this.target.parent ?? this.target);
			this.onDragMove(pos.x, pos.y);
		}
	}

	private handlePointerUp(e: FederatedPointerEvent) {
		if (this.dragging && this.onDragEnd) {
			const pos = e.getLocalPosition(this.target.parent ?? this.target);
			this.onDragEnd(pos.x, pos.y);
			this.dragging = false;
		}
	}

	dispose() {
		this.target.off('pointerdown', this.handlePointerDown, this);
		this.target.off('pointermove', this.handlePointerMove, this);
		this.target.off('pointerup', this.handlePointerUp, this);
		this.target.off('pointerupoutside', this.handlePointerUp, this);
	}
}
