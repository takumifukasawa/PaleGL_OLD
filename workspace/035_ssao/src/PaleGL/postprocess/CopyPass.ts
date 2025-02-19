﻿import { PostProcessPass } from '@/PaleGL/postprocess/PostProcessPass';
import { GPU } from '@/PaleGL/core/GPU';
import copyPassFragmentShader from '@/PaleGL/shaders/copy-pass-fragment.glsl';

export class CopyPass extends PostProcessPass {
    constructor({ gpu }: { gpu: GPU }) {
        const fragmentShader = copyPassFragmentShader;
//         const fragmentShader = `#version 300 es
// 
// precision mediump float;
// 
// in vec2 vUv;
// 
// out vec4 outColor;
// 
// uniform sampler2D uSrcTexture;
// 
// void main() {
//     vec4 textureColor = texture(uSrcTexture, vUv);
//     outColor = textureColor;
// }
// `;

        super({ gpu, fragmentShader });
    }
}
