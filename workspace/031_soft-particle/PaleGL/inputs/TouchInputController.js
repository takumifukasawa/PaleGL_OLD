import {AbstractInputController} from "./AbstractInputController.js";
import {Vector2} from "../math/Vector2.js";

export class TouchInputController extends AbstractInputController {
    #tmpIsDown = false;
    #tmpInputPosition = Vector2.zero;

    constructor() {
        super();
    }

    start() {
        window.addEventListener('touchstart', this.#onTouchStart.bind(this));
        window.addEventListener('touchmove', this.#onTouchMove.bind(this));
        window.addEventListener('touchend', this.#onTouchEnd.bind(this));
    }

    fixedUpdate() {
        this.updateInternal({
            inputPosition: this.#tmpInputPosition,
            isDown: this.#tmpIsDown
        });
    }

    #onTouchStart(e) {
        this.#tmpIsDown = true;
        const t = e.touches[0];
        this.setInputPosition(t.clientX, t.clientY);
    }

    #onTouchMove(e) {
        const t = e.touches[0];
        this.setInputPosition(t.clientX, t.clientY);
    }

    #onTouchEnd() {
        this.#tmpIsDown = false;
        this.setInputPosition(-Infinity, -Infinity);
    }

    setInputPosition(x, y) {
        this.#tmpInputPosition.set(x, y);
    }

    dispose() {
        window.removeEventListener('touchstart', this.#onTouchStart.bind(this));
        window.removeEventListener('touchmove', this.#onTouchMove.bind(this));
        window.removeEventListener('touchend', this.#onTouchEnd.bind(this));
    }
}