﻿import {PostProcessPass} from "./PostProcessPass.js";
import {UniformNames, UniformTypes} from "../constants.js";
import {AbstractPostProcessPass} from "./AbstractPostProcessPass.js";
import {FragmentPass} from "./FragmentPass.js";
import {gaussianBlurFragmentShader} from "../shaders/gaussianBlurShader.js";
import {RenderTarget} from "../core/RenderTarget.js";
import {CopyPass} from "./CopyPass.js";
import {Material} from "../materials/Material.js";
import {getGaussianBlurWeights} from "../utilities/gaussialBlurUtilities.js";

// ref: https://techblog.kayac.com/unity-light-weight-bloom-effect
// TODO: mipmap使う方法に変えてみる
export class BloomPass extends AbstractPostProcessPass {
    #extractBrightnessPass;

    #renderTargetExtractBrightness;
    #renderTargetBlurMip4_Horizontal;
    #renderTargetBlurMip4_Vertical;
    #renderTargetBlurMip8_Horizontal;
    #renderTargetBlurMip8_Vertical;
    #renderTargetBlurMip16_Horizontal;
    #renderTargetBlurMip16_Vertical;
    #renderTargetBlurMip32_Horizontal;
    #renderTargetBlurMip32_Vertical;
    
    #horizontalBlurPass;
    #verticalBlurPass;
    
    // #lastPass;
    #compositePass;
    
    #geometry;
    #horizontalBlurMaterial;
    #verticalBlurMaterial;
   
    threshold = 0.8;
    tone = 1;
    bloomAmount = 1;
   
    get renderTarget() {
        return this.#compositePass.renderTarget;
    }

    constructor({
        gpu,
        threshold = 0.8,
        tone = 1,
        bloomAmount = 1
    }) {
        super();
        
        this.threshold = threshold;
        this.tone = tone;
        this.bloomAmount = bloomAmount;
        
        // NOTE: geometryは親から渡して使いまわしてもよい
        this.#geometry = new PlaneGeometry({ gpu });

        this.#renderTargetExtractBrightness = new RenderTarget({ gpu });
        this.#renderTargetBlurMip4_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip4_Vertical = new RenderTarget({ gpu })
        this.#renderTargetBlurMip8_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip8_Vertical = new RenderTarget({ gpu })
        this.#renderTargetBlurMip16_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip16_Vertical = new RenderTarget({ gpu })
        this.#renderTargetBlurMip32_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip32_Vertical = new RenderTarget({ gpu })
        
        // const copyPass = new CopyPass({ gpu });
        // this.#passes.push(copyPass);
        
        this.#extractBrightnessPass = new FragmentPass({
            gpu,
            fragmentShader: `#version 300 es
            
precision mediump float;

out vec4 outColor;

in vec2 vUv;

uniform sampler2D ${UniformNames.SceneTexture};
uniform float uThreshold;

void main() {
    vec4 color = texture(${UniformNames.SceneTexture}, vUv);
    float k = uThreshold;
    
    // pattern_1
    // ex
    // k: 0.9, c: 1 => b = 1 
    // k: 0.8, c: 1 => b = 0.25
    vec4 b = (color - vec4(k)) / (1. - k);
    
    // pattern_2
    // vec4 b = color - k;
    
    outColor = clamp(b, 0., 1.);

    // for debug
    // outColor = b;
}
            `,
            uniforms: {
                uThreshold: {
                    type: UniformTypes.Float,
                    value: this.threshold
                },
            }
        });

        // 可変でもよい
        const blurPixelNum = 7;
        
        const blurWeights = getGaussianBlurWeights(blurPixelNum, Math.floor(blurPixelNum / 2));
        
        this.#horizontalBlurMaterial = new Material({
            vertexShader: PostProcessPass.baseVertexShader,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: true, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                },
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
                    value: new Float32Array(blurWeights)
                },
            }           
        });
        this.#verticalBlurMaterial = new Material({
            vertexShader: PostProcessPass.baseVertexShader,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: false, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                },
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
                    value: new Float32Array(blurWeights)
                },
            }           
        });
        
        this.#horizontalBlurPass = new FragmentPass({
            name: "horizontal blur pass",
            gpu,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: true, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                }
            }
        });
        this.#verticalBlurPass = new FragmentPass({
            name: "vertical blur pass",
            gpu,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: false, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                }
            }
        });

        // this.#lastPass = new CopyPass({ gpu });
        // this.#passes.push(this.#lastPass);
       
        this.#compositePass = new FragmentPass({
            gpu,
            fragmentShader: `#version 300 es
            
precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D ${UniformNames.SceneTexture};
uniform sampler2D uBlur4Texture;
uniform sampler2D uBlur8Texture;
uniform sampler2D uBlur16Texture;
uniform sampler2D uBlur32Texture;
uniform float uTone;
uniform float uBloomAmount;

void main() {
    vec4 blur4Color = texture(uBlur4Texture, vUv);
    vec4 blur8Color = texture(uBlur8Texture, vUv);
    vec4 blur16Color = texture(uBlur16Texture, vUv);
    vec4 blur32Color = texture(uBlur32Texture, vUv);
    vec4 sceneColor = texture(${UniformNames.SceneTexture}, vUv) * uTone;

    vec4 blurColor = (blur4Color + blur8Color + blur16Color + blur32Color) * uBloomAmount;

    outColor = sceneColor + blurColor;

    // for debug
    // outColor = blur4Color;
    // outColor = blur8Color;
    // outColor = blur16Color;
    // outColor = blur32Color;
    // outColor = blurColor;
    // outColor = sceneColor;
}           
            `,
            uniforms: {
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur4Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur8Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur16Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur32Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uTone: {
                    type: UniformTypes.Float,
                    value: this.tone,
                },
                uBloomAmount: {
                    type: UniformTypes.Float,
                    value: this.bloomAmount
                }
            }
        }); 
    }
    
    #width = 1;
    #height = 1;

    setSize(width, height) {
        this.#width = width;
        this.#height = height;
        
        this.#extractBrightnessPass.setSize(width, height);

        this.#renderTargetBlurMip4_Horizontal.setSize(this.#width / 4, this.#height / 4);
        this.#renderTargetBlurMip4_Vertical.setSize(this.#width / 4, this.#height / 4);
        this.#renderTargetBlurMip8_Horizontal.setSize(this.#width / 8, this.#height / 8);
        this.#renderTargetBlurMip8_Vertical.setSize(this.#width / 8, this.#height / 8);
        this.#renderTargetBlurMip16_Horizontal.setSize(this.#width / 16, this.#height / 16);
        this.#renderTargetBlurMip16_Vertical.setSize(this.#width / 16, this.#height / 16);
        this.#renderTargetBlurMip32_Horizontal.setSize(this.#width / 32, this.#height / 32);
        this.#renderTargetBlurMip32_Vertical.setSize(this.#width / 32, this.#height / 32);
        
        this.#compositePass.setSize(width, height);
    }

    render({ gpu, camera, renderer, prevRenderTarget, isLastPass }) {
        // 一回だけ呼びたい
        this.#geometry.start();
        // ppの場合はいらない気がする
        // this.mesh.updateTransform();

        if(!this.#horizontalBlurMaterial.isCompiledShader) {
            this.#horizontalBlurMaterial.start({ gpu, attributeDescriptors: this.#geometry.getAttributeDescriptors() });
        }
        if(!this.#verticalBlurMaterial.isCompiledShader) {
            this.#verticalBlurMaterial.start({ gpu, attributeDescriptors: this.#geometry.getAttributeDescriptors() });
        }
        
        this.#extractBrightnessPass.material.uniforms.uThreshold.value = this.threshold;
        
        this.#extractBrightnessPass.render({ gpu, camera, renderer, prevRenderTarget });
        
        // for debug
        // this.#extractBrightnessPass.render({ gpu, camera, renderer, prevRenderTarget, isLastPass });
        // return;
        
        const renderBlur = (horizontalRenderTarget, verticalRenderTarget, downSize) => {
            const w = this.#width / downSize;
            const h = this.#height / downSize;
            
            renderer.setRenderTarget(horizontalRenderTarget);
            renderer.clear(0, 0, 0, 1)
            this.#horizontalBlurMaterial.uniforms[UniformNames.SceneTexture].value = this.#extractBrightnessPass.renderTarget.texture;
            this.#horizontalBlurMaterial.uniforms.uTargetWidth.value = w;
            this.#horizontalBlurMaterial.uniforms.uTargetHeight.value = h;
            renderer.renderMesh(this.#geometry, this.#horizontalBlurMaterial);
            
            renderer.setRenderTarget(verticalRenderTarget);
            renderer.clear(0, 0, 0, 1)
            this.#verticalBlurMaterial.uniforms[UniformNames.SceneTexture].value = horizontalRenderTarget.texture; 
            this.#verticalBlurMaterial.uniforms.uTargetWidth.value = w;
            this.#verticalBlurMaterial.uniforms.uTargetHeight.value = h;
            renderer.renderMesh(this.#geometry, this.#verticalBlurMaterial);
        }
        
        // // for debug
        // renderBlur(this.#renderTargetBlurMip4_Horizontal, this.#renderTargetBlurMip4_Vertical, 4);
        // return;

        // 1 / 4
        renderBlur(this.#renderTargetBlurMip4_Horizontal, this.#renderTargetBlurMip4_Vertical, 4);
        // 1 / 8
        renderBlur(this.#renderTargetBlurMip8_Horizontal, this.#renderTargetBlurMip8_Vertical, 8);
        // 1 / 16
        renderBlur(this.#renderTargetBlurMip16_Horizontal, this.#renderTargetBlurMip16_Vertical, 16);
        // 1 / 32
        renderBlur(this.#renderTargetBlurMip32_Horizontal, this.#renderTargetBlurMip32_Vertical, 32);
        
        this.#compositePass.material.uniforms[UniformNames.SceneTexture].value = prevRenderTarget.texture;
        this.#compositePass.material.uniforms.uBlur4Texture.value = this.#renderTargetBlurMip4_Vertical.texture;
        this.#compositePass.material.uniforms.uBlur8Texture.value = this.#renderTargetBlurMip8_Vertical.texture;
        this.#compositePass.material.uniforms.uBlur16Texture.value = this.#renderTargetBlurMip16_Vertical.texture;
        this.#compositePass.material.uniforms.uBlur32Texture.value = this.#renderTargetBlurMip32_Vertical.texture;
        this.#compositePass.material.uniforms.uTone.value = this.tone;
        this.#compositePass.material.uniforms.uBloomAmount.value = this.bloomAmount;

        this.#compositePass.render({
            gpu,
            camera,
            renderer,
            prevRenderTarget: null,
            isLastPass
        });
    }
}