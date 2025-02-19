
import { Material } from "./Material.js";
import {
    shadowMapFragmentFunc,
    shadowMapFragmentUniforms,
    shadowMapFragmentVaryings
} from "../shaders/shadowMapShader.js";
import {generateVertexShader} from "../shaders/generateVertexShader.js";
import {
    directionalLightFragmentUniforms,
    normalMapFragmentFunc, normalMapFragmentUniforms,
    normalMapFragmentVarying,
    phongSurfaceDirectionalLightFunc
} from "../shaders/lightingCommon.js";
import {UniformTypes} from "../constants.js";
import {Matrix4} from "../math/Matrix4.js";
import {Vector2} from "../math/Vector2.js";

const generateFragmentShader = ({ receiveShadow, useNormalMap }) => `#version 300 es

precision mediump float;

uniform sampler2D uDiffuseMap; 
uniform vec2 uDiffuseMapUvScale;
${useNormalMap ? normalMapFragmentUniforms() : ""}
${receiveShadow ? shadowMapFragmentUniforms() : ""}
uniform vec3 uViewPosition;          

${directionalLightFragmentUniforms()}

struct Surface {
    vec3 worldNormal;
    vec3 worldPosition;
    vec4 diffuseColor;
};

struct Camera {
    vec3 worldPosition;
};

in vec2 vUv;
in vec3 vNormal;
${receiveShadow ? shadowMapFragmentVaryings() : ""}
${normalMapFragmentVarying()}
in vec3 vWorldPosition;

out vec4 outColor;

${phongSurfaceDirectionalLightFunc()}
${useNormalMap ? normalMapFragmentFunc() : ""}
${receiveShadow ? shadowMapFragmentFunc() : ""}

void main() {
    vec2 uv = vUv * uDiffuseMapUvScale;
   
    vec4 diffuseMapColor = texture(uDiffuseMap, uv);
    
    ${useNormalMap
        ? "vec3 worldNormal = calcNormal(vNormal, vTangent, vBinormal, uNormalMap, uv);"
        : "vec3 worldNormal = normalize(vNormal);"
    }

    Surface surface;
    surface.worldPosition = vWorldPosition;
    surface.worldNormal = worldNormal;
    surface.diffuseColor = diffuseMapColor;
    
    Camera camera;
    camera.worldPosition = uViewPosition;
    
    vec4 resultColor = vec4(0, 0, 0, 1);
    
    // directional light
    resultColor = calcDirectionalLight(surface, uDirectionalLight, camera);

    ${receiveShadow
        ? `resultColor = applyShadow(resultColor, uShadowMap, vShadowMapProjectionUv, uShadowBias, vec4(0., 0., 0., 1.), 0.7);`
        : ""
    }
    
    // resultColor.xyz = vNormal;

    outColor = resultColor;
}
`;

const generateDepthFragmentShader = () => `#version 300 es
                
precision mediump float;

out vec4 outColor;

void main() {
    outColor = vec4(1., 1., 1., 1.);
}
`;

export class PhongMaterial extends Material {
    constructor({
        diffuseMap,
        diffuseMapUvScale, // vec2
        diffuseMapUvOffset, // vec2
        normalMap,
        normalMapUvScale, // vec2
        normalMapUvOffset, // vec2
        jointMatrices,
        ...options
    }) {
        const baseUniforms = {
            uDiffuseMap: {
                type: UniformTypes.Texture,
                value: diffuseMap,
            },
            uDiffuseMapUvScale: {
                type: UniformTypes.Vector2,
                value: Vector2.one()
            },
            uDiffuseMapUvOffset: {
                type: UniformTypes.Vector2,
                value: Vector2.one()
            },
            uNormalMap: {
                type: UniformTypes.Texture,
                value: normalMap,
            },
            uNormalMapUvScale: {
                type: UniformTypes.Vector2,
                value: Vector2.one()
            },
            uNormalMapUvOffset: {
                type: UniformTypes.Vector2,
                value: Vector2.one()
            },
            ...(jointMatrices ? {
                uJointMatrices: {
                    type: UniformTypes.Matrix4Array,
                    value: jointMatrices
                }
            } : {}),
            uDirectionalLight: {}
        };

        const isSkinning = !!jointMatrices;
        const useNormalMap = !!normalMap;
        const vertexShader = generateVertexShader({
            isSkinning: isSkinning,
            jointNum: isSkinning ? baseUniforms.uJointMatrices.value.length : null,
            receiveShadow: options.receiveShadow,
            useNormalMap
        });
        const fragmentShader = generateFragmentShader({
            receiveShadow: options.receiveShadow,
            useNormalMap,
        });
        
        const uniforms = { ...baseUniforms, ...(options.uniforms ?  options.uniforms : {})};

        super({ ...options, vertexShader, fragmentShader, uniforms} );
    }
}