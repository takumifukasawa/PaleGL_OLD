// import {transformVertexUniforms, shadowMapVertexUniforms} from "./commonUniforms";
// import {shadowMapVertex} from "./shadowMapShader";

export const skinningVertexAttributes = (beginIndex) => [
`layout(location = ${beginIndex + 0}) in vec4 aBoneIndices;`,
`layout(location = ${beginIndex + 1}) in vec4 aBoneWeights;`,
];

export const calcSkinningMatrixFunc = () => `
mat4 calcSkinningMatrix(mat4 jointMat0, mat4 jointMat1, mat4 jointMat2, mat4 jointMat3, vec4 boneWeights) {
    mat4 skinMatrix =
         jointMat0 * aBoneWeights.x +
         jointMat1 * aBoneWeights.y +
         jointMat2 * aBoneWeights.z +
         jointMat3 * aBoneWeights.w;
    return skinMatrix;
}

mat4 getJointMatrix(sampler2D jointTexture, int jointIndex) {
    mat4 jointMatrix = mat4(
        texelFetch(jointTexture, ivec2(0, jointIndex), 0),
        texelFetch(jointTexture, ivec2(1, jointIndex), 0),
        texelFetch(jointTexture, ivec2(2, jointIndex), 0),
        texelFetch(jointTexture, ivec2(3, jointIndex), 0)
    );
    return jointMatrix;
}
`;

export const skinningVertexUniforms = (jointNum) => `
uniform mat4[${jointNum}] uJointMatrices;
uniform sampler2D uJointTexture;
`;

export const skinningVertex = (gpuSkinning = false) => `
    ${!gpuSkinning ? `
    // cpu skinning
    mat4 skinMatrix = calcSkinningMatrix(
        uJointMatrices[int(aBoneIndices[0])],
        uJointMatrices[int(aBoneIndices[1])],
        uJointMatrices[int(aBoneIndices[2])],
        uJointMatrices[int(aBoneIndices[3])],
        aBoneWeights
    );
    ` : `
    // gpu skinning
    mat4 jointMatrix0 = getJointMatrix(uJointTexture, int(aBoneIndices[0]));
    mat4 jointMatrix1 = getJointMatrix(uJointTexture, int(aBoneIndices[1]));
    mat4 jointMatrix2 = getJointMatrix(uJointTexture, int(aBoneIndices[2]));
    mat4 jointMatrix3 = getJointMatrix(uJointTexture, int(aBoneIndices[3]));
    mat4 skinMatrix = calcSkinningMatrix(
        jointMatrix0,
        jointMatrix1,
        jointMatrix2,
        jointMatrix3,
        aBoneWeights
    );
    `}
`;
