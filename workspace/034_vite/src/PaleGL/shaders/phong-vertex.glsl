#version 300 es

#pragma DEFINES

#pragma ATTRIBUTES

#include ./partial/vertex-skinning-functions.glsl

// varyings
out vec2 vUv;
out vec3 vWorldPosition;
out vec3 vNormal;

#include ./partial/vertex-normal-map-varyings.glsl
#include ./partial/vertex-receive-shadow-varyings.glsl
#include ./partial/vertex-color-varyings.glsl

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

uniform float uTime;

#include ./partial/vertex-receive-shadow-uniforms.glsl
#include ./partial/vertex-skinning-uniforms.glsl

// TODO: needs??
// ${insertUniforms || ''}

void main() {

    #pragma BEGIN_MAIN

    vec4 localPosition = vec4(aPosition, 1.);

    #include ./partial/vertex-skinning-calc.glsl;
    
    #pragma LOCAL_POSITION_POST_PROCESS

    #include ./partial/vertex-normal-map-calc.glsl;

    // assign common varyings 
    vUv = aUv;

    vec4 worldPosition = uWorldMatrix * localPosition;

#ifdef USE_INSTANCING
    mat4 instanceTransform = mat4(
        aInstanceScale.x,       0,                      0,                      0,
        0,                      aInstanceScale.y,       0,                      0,
        0,                      0,                      aInstanceScale.z,       0,
        aInstancePosition.x,    aInstancePosition.y,    aInstancePosition.z,    1
    );
    
    // NOTE: 本当はworldMatrixをかける前の方がよい
    
    worldPosition = instanceTransform * worldPosition;
#endif

    #pragma WORLD_POSITION_POST_PROCESS
 
    vWorldPosition = worldPosition.xyz;

    #include ./partial/vertex-receive-shadow-calc.glsl

    vec4 viewPosition = uViewMatrix * worldPosition;

    #pragma VIEW_POSITION_POST_PROCESS

    #pragma OUT_CLIP_POSITION_PRE_PROCESS
    
#if defined(USE_INSTANCING) && defined(USE_VERTEX_COLOR)
    vVertexColor = aInstanceVertexColor;
#endif
 
    gl_Position = uProjectionMatrix * viewPosition;

    #pragma END_MAIN
}
