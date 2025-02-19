import { AbstractInputController } from '@/PaleGL/inputs/AbstractInputController';
import { Vector2 } from '@/PaleGL/math/Vector2';

export class MouseInputController extends AbstractInputController {
    #tmpIsDown = false;
    #tmpInputPosition = Vector2.zero;

    constructor() {
        super();
    }

    start() {
        window.addEventListener('mousedown', this.#onMouseDown.bind(this));
        window.addEventListener('mousemove', this.#onMouseMove.bind(this));
        window.addEventListener('mouseup', this.#onMouseUp.bind(this));
    }

    update() {
        this.updateInternal({
            inputPosition: this.#tmpInputPosition,
            isDown: this.#tmpIsDown,
        });
    }

    #onMouseDown(e: MouseEvent) {
        this.#tmpIsDown = true;
        this.setInputPosition(e.clientX, e.clientY);
    }

    #onMouseMove(e: MouseEvent) {
        this.setInputPosition(e.clientX, e.clientY);
    }

    #onMouseUp(e: MouseEvent) {
        this.#tmpIsDown = false;
        this.setInputPosition(e.clientX, e.clientY);
        // this.setInputPosition(-Infinity, -Infinity);
    }

    setInputPosition(x: number, y: number) {
        this.#tmpInputPosition.set(x, y);
    }

    dispose() {
        window.removeEventListener('mousedown', this.#onMouseDown.bind(this));
        window.removeEventListener('mousemove', this.#onMouseMove.bind(this));
        window.removeEventListener('mouseup', this.#onMouseUp.bind(this));
    }
}
