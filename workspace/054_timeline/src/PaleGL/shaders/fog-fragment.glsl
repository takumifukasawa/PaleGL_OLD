﻿#version 300 es
            
precision mediump float;

//
// ref:
// https://techblog.kayac.com/unity-height-related-fog
// https://github.com/hiryma/UnitySamples/blob/master/Fog/Assets/Shaders/Fog.cginc
// https://hikita12312.hatenablog.com/entry/2017/12/30/142137
//

in vec2 vUv;

out vec4 outColor;

#include ./partial/common.glsl
#include ./partial/uniform-block-transformations.glsl
#include ./partial/uniform-block-camera.glsl

uniform sampler2D uSrcTexture;
uniform sampler2D uLightShaftTexture;
uniform sampler2D uVolumetricLightTexture;
uniform sampler2D uDepthTexture;
uniform vec4 uFogColor;
uniform float uFogStrength;
uniform float uFogDensity;
uniform float uFogDensityAttenuation;
uniform float uFogEndHeight;
uniform float uDistanceFogStart;
uniform float uDistanceFogPower;
uniform float uBlendRate;

#include ./partial/depth-functions.glsl

// 1に近いほどfogが強い
float calcFogHeightExp(vec3 objectPositionInWorld, vec3 cameraPositionInWorld, float densityY0, float densityAttenuation) {
    vec3 v = cameraPositionInWorld - objectPositionInWorld;
    float l = length(v);
    float ret;
    float tmp = l * densityY0 * exp(-densityAttenuation * objectPositionInWorld.y);
    if(v.y == 0.) {
        ret = exp(-tmp);
    } else {
        float kvy = densityAttenuation * v.y;
        ret = exp(tmp / kvy * (exp(-kvy) - 1.));
    }
    
    return 1. - ret;
}

// 1に近いほどfogが強い
float calcFogHeightUniform(vec3 objectPositionInWorld, vec3 cameraPositionInWorld, float fogDensity, float fogEndHeight) {
    vec3 v = cameraPositionInWorld - objectPositionInWorld;
    float t;
    if(objectPositionInWorld.y < fogEndHeight) {
        if(cameraPositionInWorld.y > fogEndHeight) {
            t = (fogEndHeight - objectPositionInWorld.y) / v.y;
        } else {
            t = 1.;
        }
    } else {
        if(cameraPositionInWorld.y < fogEndHeight) {
            t = (cameraPositionInWorld.y - fogEndHeight) / v.y;
        } else {
            t = 0.;
        }
    }
    float dist = length(v) * t;
    float fog = exp(-dist * fogDensity);
    return 1. - fog;
}

// 1に近いほどfogが強い
float calcDistanceFog(vec3 objectPositionInWorld, vec3 cameraPositionInWorld, float expStart, float expPower) {
    float dist = length(cameraPositionInWorld - objectPositionInWorld);
    dist = max(0., dist - expStart);
    return max(0., 1. - exp(-dist * expPower));
}

void main() {
    vec2 uv = vUv;
    
    vec4 sceneColor = texture(uSrcTexture, uv);
    vec4 destColor = sceneColor;
    vec4 lightShaftColor = texture(uLightShaftTexture, uv);
    vec4 volumetricLightColor = texture(uVolumetricLightTexture, uv);
    // 高ければ高いほど遮蔽されてる
    float occlusion = saturate(lightShaftColor.x);

    float rawDepth = texture(uDepthTexture, uv).x;
    float sceneDepth = perspectiveDepthToLinearDepth(rawDepth, uNearClip, uFarClip);
    vec3 viewPositionFromDepth = reconstructViewPositionFromDepth(uv, rawDepth, uInverseProjectionMatrix);
    vec3 worldPositionFromDepth = reconstructWorldPositionFromDepth(uv, rawDepth, uInverseViewProjectionMatrix);
 
    float constantFogScale = .1;
  
    vec3 fogColor = uFogColor.xyz;
    // constant fog
    // TODO: constant fog も考慮すべき？
    // カメラから見て奥は-z
    float rate = constantFogScale * max(0., 1. - exp(-uFogStrength * -viewPositionFromDepth.z));
   
    // height fog
    float fogRate = calcFogHeightExp(worldPositionFromDepth, uViewPosition, uFogDensity, uFogDensityAttenuation);
    fogRate *= 1. - step(1. - .0001, rawDepth);
    // distance fog
    fogRate += calcDistanceFog(worldPositionFromDepth, uViewPosition, uDistanceFogStart, uDistanceFogPower);
    // clamp
    fogRate = saturate(fogRate);

    // TODO: fog->occlusionの方が正しい？
    vec4 applyOcclusionColor = sceneColor * (1. - occlusion);
    outColor = vec4(mix(applyOcclusionColor.xyz, fogColor.xyz, fogRate), 1.);
    
    // volumetric fog
    // TODO: 加算ではなく混ぜる方が正しいはず(手前にvolumetric, 奥にemissiveがある場合、volumetricの方が強いはず)
    // TODO: しかし、どう混ぜるかという問題がある。手前と奥をどう判断するか
    // patter1: add
    outColor += vec4(volumetricLightColor.xyz, 0.);
    
    outColor = vec4(mix(sceneColor.xyz, outColor.xyz, uBlendRate), 1.);
    
    // pattern2: mix
    // outColor = vec4(mix(
    //     outColor.xyz,
    //     volumetricLightColor.xyz,
    //     saturate(volumetricLightColor.a)
    // ), 1.);

    
    // for debug
    // outColor = sceneColor;
    // outColor = vec4(vec3(occlusion), 1.);
    // outColor = vec4(vec3(sceneDepth), 1.);
    // outColor = vec4(mix(sceneColor.xyz, fogColor.xyz, rate), 1.);
    // outColor = vec4(vec3(fogRate), 1.);
    // outColor = vec4(vec3(worldPositionFromDepth.y), 1.);
    // outColor = vec4(worldPositionFromDepth, 1.);
    // outColor = vec4(vec3(uFogStrength), 1.);
}           
