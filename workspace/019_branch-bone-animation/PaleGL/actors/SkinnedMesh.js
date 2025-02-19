﻿import {Mesh} from "./Mesh.js";
import {ActorTypes, AttributeUsageType, BlendTypes, PrimitiveTypes, UniformTypes} from "../constants.js";
import {Vector3} from "../math/Vector3.js";
import {Matrix4} from "../math/Matrix4.js";
import {Geometry} from "../geometries/Geometry.js";
import {Material} from "../materials/Material.js";
import {generateDepthVertexShader} from "../shaders/generateVertexShader.js";

export class SkinnedMesh extends Mesh {
    bones;
    boneCount = 0;
   
    // positions = [];
    // boneIndices = [];
    // boneWeights = [];
    
    boneOffsetMatrices;
    
    #boneIndicesForLines = [];
    #boneOrderedIndex = [];
    
    constructor({bones, gpu, ...options}) {
        super({
            ...options,
            actorType: ActorTypes.SkinnedMesh
        });

        this.bones = bones;

        this.bones.traverse((bone) => {
            this.boneCount++;
            this.#boneOrderedIndex[bone.index] = bone;
        });
        
        // for debug
        // console.log(this.positions, this.boneIndices, this.boneWeights)
    }
    
    start(options) {
        super.start(options);
       
        const { gpu } = options;

        if(!options.depthMaterial) {
            const depthMaterial = new Material({
                gpu,
                vertexShader: generateDepthVertexShader({
                    isSkinning: true,
                    jointNum: this.boneCount,
                }),
                fragmentShader: `#version 300 es
                precision mediump float;
                out vec4 outColor;
                void main() {
                    outColor = vec4(1., 1., 1., 1.);
                }
                `,
                uniforms: {
                    uJointMatrices: {
                        type: UniformTypes.Matrix4Array,
                        value: null
                    },
                }
            });
            this.depthMaterial = depthMaterial;
        }

        this.bones.calcBoneOffsetMatrix();
        // this.bones.calcJointMatrix();
        
        this.boneOffsetMatrices = this.getBoneOffsetMatrices();
        
        // this.material.uniforms.uBoneOffsetMatrices.value = this.boneOffsetMatrices;
        // this.material.uniforms.uJointMatrices.value = this.getBoneJointMatrices();
        
        const checkChildNum = (bone) => {
            if(bone.hasChild) {
                bone.children.forEach(childBone => {
                    this.#boneIndicesForLines.push(bone.index, childBone.index);
                    checkChildNum(childBone);
                });
            }
        }
        checkChildNum(this.bones);
        
        this.boneLines = new Mesh({
            gpu,
            geometry: new Geometry({
                gpu,
                attributes: {
                    position: {
                        // data: new Array(this.#boneIndicesForLines.length * 3),
                        data: new Array(this.#boneOrderedIndex.length * 3),
                        size: 3,
                        usage: AttributeUsageType.DynamicDraw
                    }
                },
                indices: this.#boneIndicesForLines,
                drawCount: this.#boneIndicesForLines.length
            }),
            material: new Material({
                gpu,
                vertexShader: `#version 300 es
                
                layout (location = 0) in vec3 aPosition;
                
                uniform mat4 uWorldMatrix;
                uniform mat4 uViewMatrix;
                uniform mat4 uProjectionMatrix;
                
                void main() {
                    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aPosition, 1.);
                }
                `,
                fragmentShader: `#version 300 es
                
                precision mediump float;
                
                out vec4 outColor;
                
                void main() {
                    outColor = vec4(0, 1., 0, 1.);
                }
                `,
                primitiveType: PrimitiveTypes.Lines,
                blendType: BlendTypes.Transparent,
                depthWrite: false,
                depthTest: false
            })
        });
        
        this.addChild(this.boneLines);
    }
    
    update(options) {
        super.update(options);
        
        this.bones.calcJointMatrix();
        
        // NOTE: test update skinning by cpu
        const boneOffsetMatrices = this.boneOffsetMatrices;
        const boneJointMatrices = this.getBoneJointMatrices();

        const boneLinePositions = this.#boneOrderedIndex.map(bone => [...bone.jointMatrix.position.elements]);
       
        this.boneLines.geometry.updateAttribute("position", boneLinePositions.flat())
       
       // console.log("-------") 
        const jointMatrices = boneOffsetMatrices.map((boneOffsetMatrix, i) => Matrix4.multiplyMatrices(boneJointMatrices[i], boneOffsetMatrix));

        this.material.uniforms.uJointMatrices.value = jointMatrices;
        if(this.depthMaterial) {
            this.depthMaterial.uniforms.uJointMatrices.value = jointMatrices;
        }
    }

    getBoneOffsetMatrices() {
        const matrices = [];
        this.bones.traverse((bone) => {
            const m = bone.boneOffsetMatrix.clone();
            matrices.push(m);
        });
        return matrices;
    }
    
    getBoneJointMatrices() {
        const matrices = [];
        this.bones.traverse((bone) => {
            const m = bone.jointMatrix.clone();
            matrices.push(m);
        });
        return matrices;        
    }
    
}