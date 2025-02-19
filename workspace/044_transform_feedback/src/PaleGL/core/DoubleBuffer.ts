import { RenderTarget, RenderTargetOptions } from '@/PaleGL/core/RenderTarget';
// import {RenderTargetTypes} from "@/PaleGL/constants";
import { AbstractRenderTarget } from '@/PaleGL/core/AbstractRenderTarget';

export class DoubleBuffer extends AbstractRenderTarget {
    #renderTargets: RenderTarget[] = [];

    currentReadIndex = 0;

    constructor(renderTargetOptions: RenderTargetOptions) {
        super({ isSwappable: true });
        for (let i = 0; i < 2; i++) {
            const options: RenderTargetOptions = { ...renderTargetOptions, ...{ name: `double-buffer_${i}` } };
            this.#renderTargets.push(new RenderTarget(options));
        }
    }

    setSize(width: number, height: number) {
        this.#renderTargets.forEach((renderTarget) => renderTarget.setSize(width, height));
    }

    get read() {
        return this.#renderTargets[this.currentReadIndex];
    }

    get write() {
        return this.#renderTargets[this.currentReadIndex ^ 1];
    }

    swap() {
        this.currentReadIndex = (this.currentReadIndex + 1) % 2;
    }
}
