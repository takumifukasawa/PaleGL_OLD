﻿import { UniformNames, UniformTypes } from '@/PaleGL/constants';
import { IPostProcessPass, PostProcessRenderArgs } from '@/PaleGL/postprocess/AbstractPostProcessPass';
import { FragmentPass } from '@/PaleGL/postprocess/FragmentPass';
// import { gaussianBlurFragmentShader } from '@/PaleGL/shaders/gaussianBlurShader';
import { getGaussianBlurWeights } from '@/PaleGL/utilities/gaussialBlurUtilities';
import { Renderer } from '@/PaleGL/core/Renderer';
import { Camera } from '@/PaleGL/actors/Camera';
import { PostProcessPass } from '@/PaleGL/postprocess/PostProcessPass';
import { GPU } from '@/PaleGL/core/GPU';
import gaussianBlurFragmentShader from '@/PaleGL/shaders/gaussian-blur-fragment.glsl';

const BLUR_PIXEL_NUM = 7;

// export class GaussianBlurPass extends AbstractPostProcessPass {
export class GaussianBlurPass implements IPostProcessPass {
    // gpu: GPU;
    name: string = 'GaussianBlurPass';
    enabled: boolean = false;
    width: number = 1;
    height: number = 1;

    #passes: PostProcessPass[] = [];

    get renderTarget() {
        return this.#passes[this.#passes.length - 1].renderTarget;
    }

    // constructor({ gpu, blurPixelNum = 7 }: { gpu: GPU; blurPixelNum: number }) {
    constructor({ gpu }: { gpu: GPU }) {
        // super();

        const blurWeights = getGaussianBlurWeights(BLUR_PIXEL_NUM, Math.floor(BLUR_PIXEL_NUM / 2));

        const horizontalBlurPass = new FragmentPass({
            name: 'horizontal blur pass',
            gpu,
            fragmentShader: gaussianBlurFragmentShader,
            // fragmentShader: gaussianBlurFragmentShader({
            //     isHorizontal: true,
            //     pixelNum: blurPixelNum,
            //     srcTextureUniformName: UniformNames.SrcTexture
            // }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uBlurWeights: {
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights),
                },
                uIsHorizontal: {
                    type: UniformTypes.Float,
                    value: 1.
                }
            },
        });
        const verticalBlurPass = new FragmentPass({
            name: 'vertical blur pass',
            gpu,
            fragmentShader: gaussianBlurFragmentShader,
            // fragmentShader: gaussianBlurFragmentShader({
            //     isHorizontal: false,
            //     pixelNum: blurPixelNum,
            //     srcTextureUniformName: UniformNames.SrcTexture,
            // }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uBlurWeights: {
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights),
                },
                uIsHorizontal: {
                    type: UniformTypes.Float,
                    value: 0.
                },
            },
        });

        this.#passes.push(horizontalBlurPass);
        this.#passes.push(verticalBlurPass);
    }

    setSize(width: number, height: number) {
        this.#passes.forEach((pass) => {
            pass.setSize(width, height);
            // pass.material.uniforms.uTargetWidth.value = width;
            // pass.material.uniforms.uTargetHeight.value = height;
            // this.material.updateUniform("uTargetWidth", width);
            // this.material.updateUniform("uTargetHeight", height);
            pass.material.updateUniform('uTargetWidth', width);
            pass.material.updateUniform('uTargetHeight', height);
        });
    }

    // TODO: 空メソッド書かなくていいようにしたい
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setRenderTarget(renderer: Renderer, camera: Camera, isLastPass: boolean) {}

    render({ gpu, camera, renderer, prevRenderTarget, isLastPass }: PostProcessRenderArgs) {
        this.#passes.forEach((pass, i) => {
            pass.setRenderTarget(renderer, camera, isLastPass && i == this.#passes.length - 1);

            // TODO: pass内で好きに設定してよさそう
            renderer.clear(camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w);

            // TODO: mesh経由する必要たぶんない
            pass.mesh.updateTransform();
            // pass.material.uniforms[UniformNames.SceneTexture].value = i === 0 ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture;
            pass.material.updateUniform(
                UniformNames.SrcTexture,
                // i === 0 ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture
                (i === 0 && prevRenderTarget) ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture
            );
            if (!pass.material.isCompiledShader) {
                pass.material.start({ gpu, attributeDescriptors: [] });
            }

            renderer.renderMesh(pass.geometry, pass.material);
        });
    }
}
