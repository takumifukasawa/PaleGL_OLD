﻿import { GPU } from '@/PaleGL/core/GPU';
import { PostProcessPassBase } from '@/PaleGL/postprocess/PostProcessPassBase.ts';
import { RenderTargetTypes, UniformNames, UniformTypes } from '@/PaleGL/constants.ts';
import { Vector3 } from '@/PaleGL/math/Vector3.ts';
import { Color } from '@/PaleGL/math/Color.ts';
import deferredShadingFragmentShader from '@/PaleGL/shaders/deferred-shading-fragment.glsl';
import { Skybox } from '@/PaleGL/actors/Skybox.ts';
import { UniformsData } from '@/PaleGL/core/Uniforms.ts';
import { Matrix4 } from '@/PaleGL/math/Matrix4.ts';

export class DeferredShadingPass extends PostProcessPassBase {
    constructor({
        gpu, // fragmentShader,
        // uniforms,
    } // name,
    : {
        gpu: GPU;
        // fragmentShader: string;
        // uniforms?: Uniforms;
        // name?: string;
    }) {
        const uniforms: UniformsData = [
            // TODO: passのuniformのいくつかは強制的に全部渡すようにしちゃって良い気がする
            {
                name: UniformNames.GBufferATexture,
                type: UniformTypes.Texture,
                value: null,
            },
            {
                name: UniformNames.GBufferBTexture,
                type: UniformTypes.Texture,
                value: null,
            },
            {
                name: UniformNames.GBufferCTexture,
                type: UniformTypes.Texture,
                value: null,
            },
            {
                name: UniformNames.GBufferDTexture,
                type: UniformTypes.Texture,
                value: null,
            },
            {
                name: UniformNames.DepthTexture,
                type: UniformTypes.Texture,
                value: null,
            },
            {
                name: UniformNames.ShadowMap,
                type: UniformTypes.Texture,
                value: null,
            },
            {
                name: UniformNames.ShadowMapProjectionMatrix,
                type: UniformTypes.Matrix4,
                value: Matrix4.identity,
            },
            {
                name: 'uAmbientOcclusionTexture',
                type: UniformTypes.Texture,
                value: null,
            },

            {
                // TODO: pass all lights
                name: UniformNames.DirectionalLight,
                type: UniformTypes.Struct,
                value: [
                    {
                        name: 'direction',
                        type: UniformTypes.Vector3,
                        value: Vector3.zero,
                    },
                    {
                        name: 'intensity',
                        type: UniformTypes.Float,
                        value: 0,
                    },
                    {
                        name: 'color',
                        type: UniformTypes.Color,
                        value: new Color(0, 0, 0, 1),
                    },
                ],
            },

            {
                name: UniformNames.Skybox,
                type: UniformTypes.Struct,
                value: [
                    {
                        name: 'cubeMap',
                        type: UniformTypes.CubeMap,
                        value: null,
                    },
                    {
                        name: 'diffuseIntensity',
                        type: UniformTypes.Float,
                        value: 0,
                    },
                    {
                        name: 'specularIntensity',
                        type: UniformTypes.Float,
                        value: 0,
                    },
                    {
                        name: 'rotationOffset',
                        type: UniformTypes.Float,
                        value: 0,
                    },
                    {
                        name: 'maxLodLevel',
                        type: UniformTypes.Float,
                        value: 0,
                    },
                ],
            },

            // // TODO: pass skybox env
            // uEnvMap: {
            //     type: UniformTypes.CubeMap,
            //     value: null,
            // },
        ];

        super({
            gpu,
            name: 'DeferredShadingPass',
            fragmentShader: deferredShadingFragmentShader,
            uniforms,
            // useEnvMap: true, // TODO: これはいらないようにしたい. 確実にshadingするので
            receiveShadow: true, // TODO: これはいらないようにしたい. 確実にshadingするので
            renderTargetType: RenderTargetTypes.R11F_G11F_B10F,
            // renderTargetType: RenderTargetTypes.RGBA16F,
        });
    }

    updateSkyboxUniforms(skybox: Skybox) {
        this.material.uniforms.setValue(UniformNames.Skybox, [
            {
                name: 'cubeMap',
                type: UniformTypes.CubeMap,
                value: skybox.cubeMap,
            },
            {
                name: 'diffuseIntensity',
                type: UniformTypes.Float,
                value: skybox.diffuseIntensity,
            },
            {
                name: 'specularIntensity',
                type: UniformTypes.Float,
                value: skybox.specularIntensity,
            },
            {
                name: 'rotationOffset',
                type: UniformTypes.Float,
                value: skybox.rotationOffset,
            },
            {
                name: 'maxLodLevel',
                type: UniformTypes.Float,
                value: skybox.cubeMap.maxLodLevel,
            },
        ]);
    }
}
