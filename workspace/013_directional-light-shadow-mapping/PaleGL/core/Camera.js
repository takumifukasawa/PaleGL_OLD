﻿import {Actor} from "./Actor.js";
import {Matrix4} from "../math/Matrix4.js";
import {Vector4} from "../math/Vector4.js";
import {RenderTarget} from "./RenderTarget.js";
import {ActorTypes, AttributeUsageType, BlendTypes, PrimitiveTypes} from "../constants.js";
import {Vector3} from "../math/Vector3.js";
import {Material} from "../materials/Material.js";
import {Geometry} from "../geometries/Geometry.js";
import {Mesh} from "./Mesh.js";

export class Camera extends Actor {
    viewMatrix = Matrix4.identity();
    projectionMatrix = Matrix4.identity();
    #renderTarget;
    clearColor; // TODO: color class
    #postProcess;
    near;
    far;
    visibleFrustum = false;
    #visibleFrustumMesh;

    get cameraForward() {
        // 見た目のforwardと逆になる値で正しい
        // ex) (0, 0, 5) -> (0, 0, 0) をみている時、カメラ的には (0, 0, -1) が正しいが (0, 0, 1) が返ってくる
        // なぜなら、projection行列でzを反転させるため
        // pattern_1
        return this.transform.worldForward.negate();
        // pattern_2
        // return new Vector3(this.viewMatrix.m20, this.viewMatrix.m21, this.viewMatrix.m22).negate().normalize();
    }

    get postProcess() {
        return this.#postProcess;
    }

    get enabledPostProcess() {
        if (!this.postProcess) {
            return false;
        }
        return this.postProcess.enabled;
    }

    // get postProcessRenderTarget() {
    //     if(!this.postProcess) {
    //         return null;
    //     }
    //     return this.postProcess.renderTarget;
    // }

    get renderTarget() {
        return this.#renderTarget;
    }

    get writeRenderTarget() {
        if (this.#renderTarget) {
            // for double buffer
            return this.#renderTarget.isSwappable ? this.#renderTarget.write() : this.#renderTarget;
        }
        return null;
    }

    constructor({clearColor, postProcess} = {}) {
        super(ActorTypes.Camera);
        this.clearColor = clearColor || new Vector4(0, 0, 0, 1);
        this.#postProcess = postProcess;
    }

    setSize(width, height) {
        if (!this.#postProcess) {
            return;
        }
        if (this.#renderTarget) {
            this.#postProcess.setSize(this.#renderTarget.width, this.#renderTarget.height);
        } else {
            this.#postProcess.setSize(width, height);
        }
    }

    setPostProcess(postProcess) {
        this.#postProcess = postProcess;
    }

    setClearColor(clearColor) {
        this.clearColor = clearColor;
    }
    
    update({ gpu }) {
        
        super.update({ gpu });
        
        if(this.visibleFrustum && !this.#visibleFrustumMesh) {
            this.#visibleFrustumMesh = new Mesh(
                new Geometry({
                    gpu,
                    attributes: {
                        position: {
                            data: new Array(3 * 8),
                            size: 3,
                            usageType: AttributeUsageType.DynamicDraw
                        }
                    },
                    drawCount: 2 * 12,
                    indices: [
                        // near clip
                        0, 1,
                        1, 3,
                        3, 2,
                        2, 0,
                        // far clip
                        4, 5,
                        5, 7,
                        7, 6,
                        6, 4,
                        // bridge
                        0, 4,
                        1, 5,
                        2, 6,
                        3, 7
                    ]
                }),
                new Material({
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
                    depthWrite: false
                }),
            );
            this.addChild(this.#visibleFrustumMesh);
        }
        
        if(this.#visibleFrustumMesh) {
            const frustumPositions = this.getFrustumLocalPositions();
            this.#visibleFrustumMesh.geometry.updateAttribute("position", [
                // near clip
                ...frustumPositions.nearLeftTop.elements,
                ...frustumPositions.nearLeftBottom.elements,
                ...frustumPositions.nearRightTop.elements,
                ...frustumPositions.nearRightBottom.elements,
                // far clip
                ...frustumPositions.farLeftTop.elements,
                ...frustumPositions.farLeftBottom.elements,
                ...frustumPositions.farRightTop.elements,
                ...frustumPositions.farRightBottom.elements,
            ]);
        }
    }

    updateTransform() {
        super.updateTransform();
        this.viewMatrix = this.transform.worldMatrix.clone().invert();
    }

    setRenderTarget(renderTarget) {
        this.#renderTarget = renderTarget;
    }

    #updateProjectionMatrix() {
        throw "should implementation";
    }
    
    getFrustumLocalPositions() {
        throw "should implementation";
    }

    getFrustumWorldPositions() {
        throw "should implementation";
    }
}