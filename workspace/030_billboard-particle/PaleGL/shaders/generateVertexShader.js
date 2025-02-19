import {
    skinningVertexUniforms,
    calcSkinningMatrixFunc, skinningVertex
} from "./skinningShader.js";
import {engineCommonUniforms, transformVertexUniforms} from "./commonUniforms.js";
import {shadowMapVertex, shadowMapVertexUniforms, shadowMapVertexVaryings} from "./shadowMapShader.js";
import {normalMapVertexVaryings} from "./lightingCommon.js";
import {AttributeNames} from "../constants.js";

// -----------------------------------------------
// TODO:
// - out varying を centroid できるようにしたい
// -----------------------------------------------

const buildVertexAttributeLayouts = (attributeDescriptors) => {
    const sortedAttributeDescriptors = [...attributeDescriptors].sort((a, b) => a.location - b.location);

    const attributesList = sortedAttributeDescriptors.map(({ location, size, name, dataType }) => {
        let type;
        // TODO: fix all type
        switch(dataType) {
            case Float32Array:
                switch(size) {
                    case 1:
                        type = "float";
                        break;
                    case 2:
                        type = "vec2";
                        break;
                    case 3:
                        type = "vec3";
                        break;
                    case 4:
                        type = "vec4";
                        break;
                    default:
                        throw "[buildVertexAttributeLayouts] invalid attribute float";
                }
                break;
            // TODO: signedなパターンが欲しい    
            case Uint16Array:
                switch(size) {
                    case 1:
                        type = "uint";
                        break;
                    case 2:
                        type = "uvec2";
                        break;
                    case 3:
                        type = "uvec3";
                        break;
                    case 4:
                        type = "uvec4";
                        break;
                    default:
                        throw "[buildVertexAttributeLayouts] invalid attribute int";
                }               
                break;
            default:
                throw "[buildVertexAttributeLayouts] invalid attribute data type";
        }
        const str = `layout(location = ${location}) in ${type} ${name};`;
        return str;
    });

    return attributesList;
}

export const generateVertexShader = ({
    // required
    attributeDescriptors,
    // optional
    receiveShadow,
    useNormalMap,
    vertexShaderModifier = {
        beginMain: "",
        localPositionPostProcess: "",
        worldPositionPostProcess: "",
        viewPositionPostProcess: "",
        outClipPositionPreProcess: "",
        lastMain: "",
    },
    insertVaryings,
    insertUniforms, // TODO: 使ってるuniformsから自動的に生成したいかも
    // skinning
    isSkinning,
    gpuSkinning,
    jointNum,
    // instancing
    isInstancing,
    // vertex color
    useVertexColor,
} = {}) => {
    // for debug
    // console.log("[generateVertexShader] attributeDescriptors", attributeDescriptors)
   
    const attributes = buildVertexAttributeLayouts(attributeDescriptors);
    const hasNormal = !!attributeDescriptors.find(({ name }) => name === AttributeNames.Normal);
    // const hasVertexColor = !!attributeDescriptors.find(({ name }) => name === AttributeNames.Color);
    // const hasInstanceVertexColor = !!attributeDescriptors.find(({ name }) => name === AttributeNames.InstanceVertexColor);
    // const hasColor = hasVertexColor || hasInstanceVertexColor;

    return `#version 300 es

${attributes.join("\n")}

${isSkinning ? calcSkinningMatrixFunc() : ""}

out vec2 vUv;
out vec3 vWorldPosition;
out vec3 vNormal;
${useNormalMap ? normalMapVertexVaryings() : ""}
${receiveShadow ? shadowMapVertexVaryings() : "" }
${useVertexColor ? "out vec4 vVertexColor;" : ""}
${insertVaryings ? insertVaryings : ""}

${transformVertexUniforms()}
${engineCommonUniforms()}

${receiveShadow ? shadowMapVertexUniforms() : ""}
${isSkinning ? skinningVertexUniforms(jointNum) : ""}
${insertUniforms || ""}

void main() {
    ${vertexShaderModifier.beginMain || ""}

    ${isSkinning ? skinningVertex(gpuSkinning) : ""}
    
    vec4 localPosition = vec4(aPosition, 1.);
    ${isSkinning
        ? `
    localPosition = skinMatrix * localPosition;`
        : ""
    }
    ${vertexShaderModifier.localPositionPostProcess || ""}

    ${(() => {
        if(isSkinning) {
            return useNormalMap
                ? `
    vNormal = mat3(uNormalMatrix) * mat3(skinMatrix) * aNormal;
    vTangent = mat3(uNormalMatrix) * mat3(skinMatrix) * aTangent;
    vBinormal = mat3(uNormalMatrix) * mat3(skinMatrix) * aBinormal;
`
                : `
    vNormal = mat3(uNormalMatrix) * mat3(skinMatrix) * aNormal;
`;
        } else {
            return useNormalMap
                ? `
    vNormal = mat3(uNormalMatrix) * aNormal;
    vTangent = mat3(uNormalMatrix) * aTangent;
    vBinormal = mat3(uNormalMatrix) * aBinormal;
`
                : hasNormal ? `
    vNormal = mat3(uNormalMatrix) * aNormal;
` : "";
        }
    })()}
  
    // assign common varyings 
    vUv = aUv; 
    ${(() => {
        if(!useVertexColor) {
            return "";
        }
        return isInstancing
            ? "vVertexColor = aInstanceVertexColor;"
            : "vVertexColor = aColor;";
    })()}

    vec4 worldPosition = uWorldMatrix * localPosition;
    ${vertexShaderModifier.worldPositionPostProcess || ""}
  
    vWorldPosition = worldPosition.xyz;

    ${receiveShadow ? shadowMapVertex() : ""}
    
    vec4 viewPosition = uViewMatrix * worldPosition;
    ${vertexShaderModifier.viewPositionPostProcess || ""}
 
    ${vertexShaderModifier.outClipPositionPreProcess || ""}
    
    gl_Position = uProjectionMatrix * viewPosition;
    
    ${vertexShaderModifier.lastMain || ""}
}
`;
}

export const generateDepthVertexShader = ({
    attributeDescriptors,
    isSkinning,
    gpuSkinning,
    vertexShaderModifier = {
        beginMain: "",
        localPositionPostProcess: "",
        worldPositionPostProcess: "",
        outClipPositionPreProcess: "",
        lastMain: ""
    },
    insertVaryings,
    useNormalMap,
    jointNum
} = {}) => {
   
    const attributes = buildVertexAttributeLayouts(attributeDescriptors);

    return `#version 300 es

${attributes.join("\n")}

${isSkinning ? calcSkinningMatrixFunc() : ""}

${transformVertexUniforms()}
${engineCommonUniforms()}
${isSkinning ? skinningVertexUniforms(jointNum) : ""}

// TODO: depthでは必要ないのでなくしたい
out vec4 vVertexColor;
${insertVaryings ? insertVaryings : ""}

void main() {
    ${vertexShaderModifier.beginMain || ""}

    ${isSkinning ? skinningVertex(gpuSkinning) : ""}
    
    vec4 localPosition = vec4(aPosition, 1.);
    ${isSkinning
        ? `
    localPosition = skinMatrix * localPosition;`
        : ""
    }
    ${vertexShaderModifier.localPositionPostProcess || ""}
    
    vec4 worldPosition = uWorldMatrix * localPosition;
    ${vertexShaderModifier.worldPositionPostProcess || ""}
 
    ${vertexShaderModifier.outClipPositionPreProcess || ""}
    
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    ${vertexShaderModifier.lastMain || ""}
}
`;
}