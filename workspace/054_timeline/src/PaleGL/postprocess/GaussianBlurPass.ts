﻿import {PostProcessPassType, UniformTypes} from '@/PaleGL/constants';
import { IPostProcessPass } from '@/PaleGL/postprocess/IPostProcessPass';
import { FragmentPass } from '@/PaleGL/postprocess/FragmentPass';
import { getGaussianBlurWeights } from '@/PaleGL/utilities/gaussialBlurUtilities';
import { Renderer } from '@/PaleGL/core/Renderer';
import { Camera } from '@/PaleGL/actors/Camera';
import { GPU } from '@/PaleGL/core/GPU';
import gaussianBlurFragmentShader from '@/PaleGL/shaders/gaussian-blur-fragment.glsl';
import { Material } from '@/PaleGL/materials/Material';
import {
    PostProcessPassBase, PostProcessPassParametersBase,
    PostProcessPassRenderArgs,
} from '@/PaleGL/postprocess/PostProcessPassBase';
import { PlaneGeometry } from '@/PaleGL/geometries/PlaneGeometry.ts';

const BLUR_PIXEL_NUM = 7;


export type GaussianBlurPassParameters = PostProcessPassParametersBase;

export type GaussianBlurPassParametersArgs = Partial<GaussianBlurPassParameters>;

export function generateGaussianBlurPassParameters(params: GaussianBlurPassParametersArgs = {}): GaussianBlurPassParameters {
    return {
        enabled: params.enabled ?? true,
    };
}

export class GaussianBlurPass implements IPostProcessPass {
    // export class GaussianBlurPass extends PostProcessPassBase {
    // gpu: GPU;
    name: string = 'GaussianBlurPass';
    type: PostProcessPassType = PostProcessPassType.GaussianBlur;
    
    width: number = 1;
    height: number = 1;
    materials: Material[] = [];

    // parameters: PostProcessParametersBase = { type: PostProcessType.GaussianBlur, enabled: true };
    parameters: GaussianBlurPassParameters;

    private geometry: PlaneGeometry;
    private horizontalBlurPass: FragmentPass;
    private verticalBlurPass: FragmentPass;

    #passes: PostProcessPassBase[] = [];

    get renderTarget() {
        return this.#passes[this.#passes.length - 1].renderTarget;
    }

    // constructor({ gpu, blurPixelNum = 7 }: { gpu: GPU; blurPixelNum: number }) {
    constructor(args: { gpu: GPU, parameters?: GaussianBlurPassParametersArgs }) {
        const { gpu } = args;
        
        this.parameters = generateGaussianBlurPassParameters(args.parameters);
        // super();
        this.geometry = new PlaneGeometry({ gpu });

        const blurWeights = getGaussianBlurWeights(BLUR_PIXEL_NUM, Math.floor(BLUR_PIXEL_NUM / 2));

        this.horizontalBlurPass = new FragmentPass({
            name: 'horizontal blur pass',
            gpu,
            fragmentShader: gaussianBlurFragmentShader,
            // fragmentShader: gaussianBlurFragmentShader({
            //     isHorizontal: true,
            //     pixelNum: blurPixelNum,
            //     srcTextureUniformName: UniformNames.SrcTexture
            // }),
            uniforms: [
                {
                    name: 'uTargetWidth',
                    type: UniformTypes.Float,
                    value: 1,
                },
                {
                    name: 'uTargetHeight',
                    type: UniformTypes.Float,
                    value: 1,
                },
                {
                    name: 'uBlurWeights',
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights),
                },
                {
                    name: 'uIsHorizontal',
                    type: UniformTypes.Float,
                    value: 1,
                },
            ],
        });
        this.#passes.push(this.horizontalBlurPass);
        this.materials.push(...this.horizontalBlurPass.materials);

        this.verticalBlurPass = new FragmentPass({
            name: 'vertical blur pass',
            gpu,
            fragmentShader: gaussianBlurFragmentShader,
            // fragmentShader: gaussianBlurFragmentShader({
            //     isHorizontal: false,
            //     pixelNum: blurPixelNum,
            //     srcTextureUniformName: UniformNames.SrcTexture,
            // }),
            uniforms: [
                {
                    name: 'uTargetWidth',
                    type: UniformTypes.Float,
                    value: 1,
                },
                {
                    name: 'uTargetHeight',
                    type: UniformTypes.Float,
                    value: 1,
                },
                {
                    name: 'uBlurWeights',
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights),
                },
                {
                    name: 'uIsHorizontal',
                    type: UniformTypes.Float,
                    value: 0,
                },
            ],
        });
        this.#passes.push(this.verticalBlurPass);
        this.materials.push(...this.verticalBlurPass.materials);
    }

    setSize(width: number, height: number) {
        this.horizontalBlurPass.setSize(width, height);
        this.horizontalBlurPass.material.uniforms.setValue('uTargetWidth', width);
        this.horizontalBlurPass.material.uniforms.setValue('uTargetHeight', height);
        this.verticalBlurPass.setSize(width, height);
        this.verticalBlurPass.material.uniforms.setValue('uTargetWidth', width);
        this.verticalBlurPass.material.uniforms.setValue('uTargetHeight', height);
    }

    // TODO: 空メソッド書かなくていいようにしたい
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setRenderTarget(renderer: Renderer, camera: Camera, isLastPass: boolean) {}

    update() {}

    render({
        gpu,
        camera,
        renderer,
        prevRenderTarget,
        isLastPass,
        targetCamera,
        gBufferRenderTargets,
        time,
    }: PostProcessPassRenderArgs) {
        this.geometry.start();

        this.horizontalBlurPass.render({
            gpu,
            camera,
            renderer,
            prevRenderTarget,
            isLastPass: false,
            targetCamera,
            gBufferRenderTargets,
            time,
        });

        this.verticalBlurPass.render({
            gpu,
            camera,
            renderer,
            prevRenderTarget,
            isLastPass,
            targetCamera,
            gBufferRenderTargets,
            time,
        });

        // this.#passes.forEach((pass, i) => {
        //     pass.setRenderTarget(renderer, camera, isLastPass && i == this.#passes.length - 1);

        //     // TODO: pass内で好きに設定してよさそう
        //     renderer.clear(camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w);

        //     // TODO: mesh経由する必要たぶんない
        //     pass.mesh.updateTransform();
        //     // pass.material.uniforms[UniformNames.SceneTexture].value = i === 0 ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture;
        //     pass.material.uniforms.setValue(
        //         UniformNames.SrcTexture,
        //         // i === 0 ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture
        //         (i === 0 && prevRenderTarget) ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture
        //     );
        //     if (!pass.material.isCompiledShader) {
        //         pass.material.start({ gpu, attributeDescriptors: [] });
        //     }

        //     renderer.renderMesh(pass.geometry, pass.material);
        // });
    }
}
