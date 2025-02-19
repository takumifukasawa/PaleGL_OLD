#version 300 es

precision highp float;

#pragma DEFINES

#pragma ATTRIBUTES

#pragma APPEND_ATTRIBUTES

#include ./partial/uniform-block-common.glsl
#include ./partial/uniform-block-transformations.glsl
#include ./partial/uniform-block-camera.glsl

#include ./partial/skinning-vertex-functions.glsl

// varyings
out vec2 vUv;
out vec3 vLocalPosition;
out vec3 vWorldPosition;
out vec3 vNormal;
out mat4 vInverseWorldMatrix;

#ifdef USE_INSTANCING
out float vInstanceId;
// TODO
// out vec4 vInstanceState;
out vec4 vInstanceEmissiveColor;
uniform float uRotMode; // 0: velocity, 1: look direction
#endif

#include ./partial/normal-map-vertex-varyings.glsl
#include ./partial/receive-shadow-vertex-varyings.glsl
#include ./partial/vertex-color-vertex-varyings.glsl

// uniform mat4 uWorldMatrix;
// uniform mat4 uViewMatrix;
// uniform mat4 uProjectionMatrix;
// uniform mat4 uNormalMatrix;
// uniform float uTime;

#pragma APPEND_UNIFORMS
        
#include ./partial/receive-shadow-vertex-uniforms.glsl
#include ./partial/skinning-vertex-uniforms.glsl

mat4 getRotationXMat(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat4(
        // 行オーダー
        // 1., 0., 0., 0.,
        // 0., c, -s, 0.,
        // 0., s, c, 0.,
        // 0., 0., 0., 1.
        // 列オーダー
        1., 0., 0., 0.,
        0., c, s, 0.,
        0., -s, c, 0.,
        0., 0., 0., 1.
    );
}

mat4 getRotationYMat(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat4(
        // 行オーダー
        // c, 0., s, 0.,
        // 0., 1., 0., 0.,
        // -s, 0., c, 0.,
        // 0., 0., 0., 1.
        // 列オーダー
        c, 0., -s, 0.,
        0., 1., 0., 0.,
        s, 0., c, 0.,
        0., 0., 0., 1.
    );
}

mat4 getRotationZMat(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat4(
        // 行オーダー
        // c, -s, 0., 0.,
        // s, c, 0., 0.,
        // 0., 0., 1., 0.,
        // 0., 0., 0., 1.
        // 列オーダー
        c, s, 0., 0.,
        -s, c, 0., 0.,
        0., 0., 1., 0.,
        0., 0., 0., 1.
    );
}

mat4 getTranslationMat(vec3 p) {
    return mat4(
        // 行オーダー
        // 1., 0., 0., p.x,
        // 0., 1., 0., p.y,
        // 0., 0., 1., p.z,
        // 0., 0., 0., 1
        // 列オーダー
        1., 0., 0., 0.,
        0., 1., 0., 0.,
        0., 0., 1., 0.,
        p.x, p.y, p.z, 1.
    );
}

mat4 getScalingMat(vec3 s) {
    return mat4(
        // 行オーダー / 列オーダー
        s.x, 0., 0., 0.,
        0., s.y, 0., 0.,
        0., 0., s.z, 0.,
        0., 0., 0., 1.
    );
}

mat4 getLookAtMat(vec3 lookAt, vec3 p) {
    vec3 f = mix(
        vec3(0., 1., 0.),// fallback
        normalize(lookAt - p),
        step(.01, length(lookAt - p))
    );
    vec3 r = normalize(cross(vec3(0., 1., 0.), f));
    vec3 u = cross(f, r);
    return mat4(
        r.x, r.y, r.z, 0.,
        u.x, u.y, u.z, 0.,
        f.x, f.y, f.z, 0.,
        0., 0., 0., 1.
    );
}

void main() {

    #pragma BEGIN_MAIN

    vec4 localPosition = vec4(aPosition, 1.);

    #include ./partial/skinning-vertex-calc.glsl;
    
    #pragma LOCAL_POSITION_POST_PROCESS

    // assign common varyings 
    vUv = aUv;
    vLocalPosition = aPosition;

    mat4 worldMatrix = uWorldMatrix;
    
#ifdef USE_INSTANCING
    mat4 instanceTranslation = getTranslationMat(aInstancePosition);
    mat4 instanceScaling = getScalingMat(aInstanceScale.xyz);
    mat4 instanceRotationX = getRotationXMat(aInstanceRotation.x);
    mat4 instanceRotationY = getRotationYMat(aInstanceRotation.y);
    mat4 instanceRotationZ = getRotationZMat(aInstanceRotation.z);
    mat4 instanceRotation =
        instanceRotationY *
        instanceRotationX *
        instanceRotationZ;
    
    // instanceごとのvelocityが必要なことに注意
    // TODO: 追従率をuniformで渡したい
    #ifdef USE_INSTANCE_LOOK_DIRECTION
        // pattern_1: 速度ベクトルを使って回転
        instanceRotation = getLookAtMat(aInstancePosition + aInstanceVelocity * 1000., aInstancePosition);
        // pattern_2: 速度ベクトルをnormalizeして使って回転
        // instanceRotation = getLookAtMat(aInstancePosition + normalize(aInstanceVelocity.xyz) * 1000., aInstancePosition);
        // pattern_3: look direction
        // instanceRotation = getLookAtMat(aInstancePosition + aLookDirection, aInstancePosition);
        // pattern_4: blend
        // vec3 lookDir = mix(normalize(aInstanceVelocity.xyz), normalize(aLookDirection), uRotMode);
        // instanceRotation = getLookAtMat(aInstancePosition + normalize(lookDir) * 1000., aInstancePosition);
        // // for debug: 回転させない
        // instanceRotation = mat4(
        //     1., 0., 0., 0.,
        //     0., 1., 0., 0.,
        //     0., 0., 1., 0.,
        //     0., 0., 0., 1.
        //     
        // );
    #endif
   
    #pragma INSTANCE_TRANSFORM_PRE_PROCESS
   
    // TODO: actor自体のworldMatirxは使わない方がいい
    // TODO: もしくはちゃんとした順番をかける(scale -> instance scale -> rotation -> ...)
    worldMatrix = uWorldMatrix * instanceTranslation * instanceRotation * instanceScaling;
    
    vInstanceId = float(gl_InstanceID);

    // TODO
    // vInstanceState = aInstanceState;
    vInstanceEmissiveColor = aInstanceEmissiveColor;
#endif

    vec4 worldPosition = worldMatrix * localPosition;

    #pragma WORLD_POSITION_POST_PROCESS

    vWorldPosition = worldPosition.xyz;
    vInverseWorldMatrix = inverse(worldMatrix);

    #include ./partial/normal-map-vertex-calc.glsl;

    #include ./partial/receive-shadow-uv-calc.glsl
    
// NOTE: shader minify の時に p * v * w を直接入れないとなぜか掛ける順番がおかしくなる
//     vec4 viewPosition = uViewMatrix * worldPosition;
//  
//     #pragma VIEW_POSITION_POST_PROCESS
//  
//     #pragma OUT_CLIP_POSITION_PRE_PROCESS
//     
//     gl_Position = uProjectionMatrix * viewPosition;

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    
#if defined(USE_INSTANCING) && defined(USE_VERTEX_COLOR)
    vVertexColor = aInstanceVertexColor;
#endif

    #pragma END_MAIN
}
