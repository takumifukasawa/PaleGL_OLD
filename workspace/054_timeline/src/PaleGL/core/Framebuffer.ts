﻿import { GLObject } from '@/PaleGL/core/GLObject';
import { GLColorAttachment } from '@/PaleGL/constants';
import { GPU } from '@/PaleGL/core/GPU';

export class Framebuffer extends GLObject {
    #framebuffer: WebGLFramebuffer;
    #drawBuffersList: GLColorAttachment[] = [];
    #gpu;

    get drawBufferList() {
        return this.#drawBuffersList;
    }

    get glObject() {
        return this.#framebuffer;
    }

    get hasMultipleDrawBuffers() {
        return this.#drawBuffersList.length >= 2;
    }

    registerDrawBuffer(drawBufferName: GLColorAttachment) {
        this.#drawBuffersList.push(drawBufferName);
    }

    constructor({ gpu }: { gpu: GPU }) {
        super();

        this.#gpu = gpu;
        const gl = this.#gpu.gl;

        const fb = gl.createFramebuffer()!;
        // if (!fb) {
        //     console.error('invalid framebuffer');
        // }
        this.#framebuffer = fb;
    }

    bind() {
        const gl = this.#gpu.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer);
    }

    unbind() {
        const gl = this.#gpu.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
