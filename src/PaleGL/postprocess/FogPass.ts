﻿// import { UniformTypes } from '@/PaleGL/constants';
import { GPU } from '@/PaleGL/core/GPU';
import fogFragmentShader from '@/PaleGL/shaders/fog-fragment.glsl';
import {
    PostProcessPassBase,
    PostProcessPassParametersBase,
    PostProcessPassRenderArgs,
} from '@/PaleGL/postprocess/PostProcessPassBase';
import {
    PostProcessPassType,
    RenderTargetTypes,
    UniformBlockNames,
    UniformNames,
    UniformTypes,
} from '@/PaleGL/constants.ts';
import { Color } from '@/PaleGL/math/Color.ts';
import { Override } from '@/PaleGL/palegl';
import { Texture } from '@/PaleGL/core/Texture.ts';

const UNIFORM_FOG_COLOR = 'uFogColor';
const UNIFORM_FOG_STRENGTH = 'uFogStrength';
const UNIFORM_FOG_DENSITY = 'uFogDensity';
const UNIFORM_FOG_DENSITY_ATTENUATION = 'uFogDensityAttenuation';
const UNIFORM_FOG_END_HEIGHT = 'uFogEndHeight';
const UNIFORM_DISTANCE_FOG_START = 'uDistanceFogStart';
const UNIFORM_DISTANCE_FOG_END = 'uDistanceFogEnd';
const UNIFORM_DISTANCE_FOG_POWER = 'uDistanceFogPower';
const UNIFORM_SSS_FOG_RATE = 'uSSSFogRate';
const UNIFORM_SSS_FOG_COLOR = 'uSSSFogColor';
const UNIFORM_NOISE_TEXTURE = 'uNoiseTexture';

export type FogPassParametersBase = {
    fogColor: Color;
    fogStrength: number;
    fogDensity: number;
    fogDensityAttenuation: number;
    fogEndHeight: number;
    distanceFogStart: number;
    distanceFogPower: number;
    distanceFogEnd: number;
    sssFogRate: number;
    sssFogColor: Color;
    blendRate: number;
};

export type FogPassParameters = PostProcessPassParametersBase & FogPassParametersBase;

export type FogPassParametersArgs = Partial<FogPassParameters>;

type RequiredToOptional<T> = {
    [K in keyof T]?: T[K]; // `?` adds the optional modifier
};

// type OptionalToRequired<T> = {
//     [K in keyof T]-?: T[K]; // `-?` removes the optional modifier
// };

export function generateFogPassParameters(params: RequiredToOptional<FogPassParametersArgs> = {}): FogPassParameters {
    return {
        enabled: params.enabled ?? true,
        fogColor: params.fogColor ?? Color.white,
        fogStrength: params.fogStrength ?? 0.01,
        fogDensity: params.fogDensity ?? 0.023,
        fogDensityAttenuation: params.fogDensityAttenuation ?? 0.45,
        fogEndHeight: params.fogEndHeight ?? 1,
        distanceFogStart: params.distanceFogStart ?? 20,
        distanceFogPower: params.distanceFogPower ?? 0.1,
        distanceFogEnd: params.distanceFogEnd ?? 100,
        sssFogRate: params.sssFogRate ?? 1,
        sssFogColor: params.sssFogColor ?? Color.white,
        blendRate: 1,
    };
}

const lightShaftTextureUniformName = 'uLightShaftTexture';
const volumetricLightTextureUniformName = 'uVolumetricLightTexture';
const screenSpaceShadowTextureUniformName = 'uSSSTexture';

export class FogPass extends PostProcessPassBase {
    parameters: Override<PostProcessPassParametersBase, FogPassParameters>;

    constructor(args: { gpu: GPU; parameters?: FogPassParametersArgs }) {
        const { gpu } = args;
        const fragmentShader = fogFragmentShader;
        
        const parameters = generateFogPassParameters();

        super({
            gpu,
            type: PostProcessPassType.Fog,
            fragmentShader,
            renderTargetType: RenderTargetTypes.R11F_G11F_B10F,
            // renderTargetType: RenderTargetTypes.RGBA16F,
            uniforms: [
                {
                    name: UNIFORM_FOG_COLOR,
                    type: UniformTypes.Color,
                    value: Color.white,
                },
                {
                    // TODO: defaultはblacktextureを渡す。lightshaftがない場合もあるので. もしくはboolを渡す
                    name: UniformNames.DepthTexture,
                    type: UniformTypes.Texture,
                    value: null,
                },
                {
                    name: lightShaftTextureUniformName,
                    type: UniformTypes.Texture,
                    value: null,
                },
                {
                    name: volumetricLightTextureUniformName,
                    type: UniformTypes.Texture,
                    value: null,
                },
                {
                    name: screenSpaceShadowTextureUniformName,
                    type: UniformTypes.Texture,
                    value: null,
                },
                {
                    name: UNIFORM_FOG_STRENGTH,
                    type: UniformTypes.Float,
                    value: parameters.fogStrength,
                },
                {
                    name: UNIFORM_FOG_DENSITY,
                    type: UniformTypes.Float,
                    value: parameters.fogDensity,
                },
                {
                    name: UNIFORM_FOG_DENSITY_ATTENUATION,
                    type: UniformTypes.Float,
                    value: parameters.fogDensityAttenuation,
                },
                {
                    name: UNIFORM_FOG_END_HEIGHT,
                    type: UniformTypes.Float,
                    value: parameters.fogEndHeight,
                },
                {
                    name: UNIFORM_DISTANCE_FOG_START,
                    type: UniformTypes.Float,
                    value: parameters.distanceFogStart,
                },
                {
                    name: UNIFORM_DISTANCE_FOG_END,
                    type: UniformTypes.Float,
                    value: parameters.distanceFogEnd,
                },
                {
                    name: UNIFORM_DISTANCE_FOG_POWER,
                    type: UniformTypes.Float,
                    value: parameters.distanceFogPower,
                },
                {
                    name: UNIFORM_SSS_FOG_RATE,
                    type: UniformTypes.Float,
                    value: parameters.sssFogRate,
                },
                {
                    name: UNIFORM_SSS_FOG_COLOR,
                    type: UniformTypes.Color,
                    value: Color.white,
                },
                {
                    name: UNIFORM_NOISE_TEXTURE,
                    type: UniformTypes.Texture,
                    value: null,
                },
                {
                    name: UniformNames.BlendRate,
                    type: UniformTypes.Float,
                    value: 1,
                },
                // ...PostProcessPassBase.commonUniforms,
            ],
            uniformBlockNames: [UniformBlockNames.Common, UniformBlockNames.Camera],
            parameters,
        });

        this.parameters = parameters;
    }

    setTextures(
        lightShaftRtTexture: Texture,
        volumetricLightRtTexture: Texture,
        screenSpaceShadowRtTexture: Texture,
        noiseTexture: Texture
    ) {
        this.material.uniforms.setValue(lightShaftTextureUniformName, lightShaftRtTexture);
        this.material.uniforms.setValue(volumetricLightTextureUniformName, volumetricLightRtTexture);
        this.material.uniforms.setValue(screenSpaceShadowTextureUniformName, screenSpaceShadowRtTexture);
        this.material.uniforms.setValue(UNIFORM_NOISE_TEXTURE, noiseTexture);
    }

    render(options: PostProcessPassRenderArgs) {
        this.material.uniforms.setValue(UNIFORM_FOG_COLOR, this.parameters.fogColor);
        this.material.uniforms.setValue(UNIFORM_FOG_STRENGTH, this.parameters.fogStrength);
        this.material.uniforms.setValue(UNIFORM_FOG_DENSITY, this.parameters.fogDensity);
        this.material.uniforms.setValue(UNIFORM_FOG_DENSITY_ATTENUATION, this.parameters.fogDensityAttenuation);
        this.material.uniforms.setValue(UNIFORM_FOG_END_HEIGHT, this.parameters.fogEndHeight);
        this.material.uniforms.setValue(UNIFORM_DISTANCE_FOG_START, this.parameters.distanceFogStart);
        this.material.uniforms.setValue(UNIFORM_DISTANCE_FOG_END, this.parameters.distanceFogEnd);
        this.material.uniforms.setValue(UNIFORM_DISTANCE_FOG_POWER, this.parameters.distanceFogPower);
        this.material.uniforms.setValue(UNIFORM_SSS_FOG_RATE, this.parameters.sssFogRate);
        this.material.uniforms.setValue(UNIFORM_SSS_FOG_COLOR, this.parameters.sssFogColor);
        this.material.uniforms.setValue(UniformNames.BlendRate, this.parameters.blendRate);
        super.render(options);
    }
}
