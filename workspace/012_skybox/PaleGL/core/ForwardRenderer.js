﻿import {ActorTypes, BlendTypes, UniformTypes} from "./../constants.js";
import {Vector3} from "../math/Vector3.js";
import {Matrix4} from "../math/Matrix4.js";

export class ForwardRenderer {
    #gpu;
    canvas;
    pixelRatio;
    #renderTarget;
    #realWidth;
    #realHeight;

    constructor({gpu, canvas, pixelRatio = 1}) {
        this.#gpu = gpu;
        this.canvas = canvas;
        this.pixelRatio = pixelRatio;
    }

    setSize(width, height) {
        this.#realWidth = Math.floor(width * this.pixelRatio);
        this.#realHeight = Math.floor(height * this.pixelRatio);
        this.canvas.width = this.#realWidth;
        this.canvas.height = this.#realHeight;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.#gpu.setSize(0, 0, this.#realWidth, this.#realHeight);
    }

    setRenderTarget(renderTarget) {
        const gl = this.#gpu.gl;
        this.#renderTarget = renderTarget;

        if (this.#renderTarget) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.#renderTarget.framebuffer.glObject);
            gl.viewport(0, 0, this.#renderTarget.width, this.#renderTarget.height);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.#realWidth, this.#realHeight);
        }
    }

    flush() {
        this.#gpu.flush();
    }

    clear(r, g, b, a) {
        this.#gpu.clear(r, g, b, a);
    }

    render(scene, camera) {
        if (camera.enabledPostProcess) {
            this.setRenderTarget(camera.postProcess.renderTarget);
        } else {
            this.setRenderTarget(camera.renderTarget);
        }

        // TODO: refactor
        this.clear(
            camera.clearColor.x,
            camera.clearColor.y,
            camera.clearColor.z,
            camera.clearColor.w
        );
        
        const meshActorsEachQueue = {
            skybox: [], // maybe only one
            opaque: [],
            transparent: [],
        };
        const lightActors = [];

        scene.traverse((actor) => {
            switch(actor.type) {
                case ActorTypes.Skybox:
                    meshActorsEachQueue.skybox.push(actor);
                    // actor.transform.parent = camera.transform;
                    break;
                case ActorTypes.Mesh:
                    switch (actor.material.blendType) {
                        case BlendTypes.Opaque:
                            meshActorsEachQueue.opaque.push(actor);
                            break;
                        case BlendTypes.Transparent:
                        case BlendTypes.Additive:
                            meshActorsEachQueue.transparent.push(actor);
                            break;
                        default:
                            throw "invalid blend type";
                    }
                    break;
                case ActorTypes.Light:
                    lightActors.push(actor);
                    break;
            }
        });

        // update all actors matrix
        // TODO
        // - scene 側でやった方がよい？
        // - skyboxのupdateTransformが2回走っちゃうので、sceneかカメラに持たせて特別扱いさせたい
        scene.traverse((actor) => actor.updateTransform());
        
        // TODO: depth sort 

        // sort by render queue
        const sortRenderQueueCompareFunc = (a, b) => a.material.renderQueue - b.material.renderQueue;
        const sortedMeshActors = Object.keys(meshActorsEachQueue).map(key => (meshActorsEachQueue[key].sort(sortRenderQueueCompareFunc))).flat();

        // draw 
        sortedMeshActors.forEach(meshActor => {
            switch(meshActor.type) {
                case ActorTypes.Skybox:
                    // TODO: skyboxのupdateTransformが2回走っちゃうので、sceneかカメラに持たせて特別扱いさせたい
                    meshActor.updateTransform(camera);
                    break;
            }
            
            // TODO: material 側でやった方がよい？
            if (meshActor.material.uniforms.uWorldMatrix) {
                meshActor.material.uniforms.uWorldMatrix.value = meshActor.transform.worldMatrix;
            }
            if (meshActor.material.uniforms.uViewMatrix) {
                meshActor.material.uniforms.uViewMatrix.value = camera.viewMatrix;
            }
            if (meshActor.material.uniforms.uProjectionMatrix) {
                meshActor.material.uniforms.uProjectionMatrix.value = camera.projectionMatrix;
            }
            if (meshActor.material.uniforms.uNormalMatrix) {
                meshActor.material.uniforms.uNormalMatrix.value = meshActor.transform.worldMatrix.clone().invert().transpose();
            }
            if(meshActor.material.uniforms.uViewPosition) {
                meshActor.material.uniforms.uViewPosition.value = camera.transform.worldMatrix.position;
            }

            // TODO: light actor の中で lightの種類別に処理を分ける
            lightActors.forEach(light => {
                if (meshActor.material.uniforms.uDirectionalLight) {
                    meshActor.material.uniforms.uDirectionalLight = {
                        type: UniformTypes.Struct,
                        value: {
                            direction: {
                                type: UniformTypes.Vector3,
                                value: light.transform.position,
                            },
                            intensity: {
                                type: UniformTypes.Float,
                                value: light.intensity,
                            },
                            color: {
                                type: UniformTypes.Color,
                                value: light.color
                            }
                        }
                    }
                }
            });

            this.renderMesh(meshActor);
        });

        if (camera.enabledPostProcess) {
            camera.postProcess.render(this, camera);
        }
    }

    renderMesh(mesh) {
        // vertex
        this.#gpu.setVertexArrayObject(mesh.geometry.vertexArrayObject);
        if (mesh.geometry.indexBufferObject) {
            this.#gpu.setIndexBufferObject(mesh.geometry.indexBufferObject);
        }
        // material
        this.#gpu.setShader(mesh.material.shader);
        // uniforms
        this.#gpu.setUniforms(mesh.material.uniforms);
      
        // setup depth write (depth mask)
        let depthWrite;
        if(mesh.material.depthWrite !== null) {
            depthWrite = mesh.material.depthWrite;
        } else {
            switch(mesh.material.blendType) {
                case BlendTypes.Opaque:
                    depthWrite = true;
                    break;
                case BlendTypes.Transparent:
                case BlendTypes.Additive:
                    depthWrite = false;
                    break;
                default:
                    throw "invalid depth write";
            }
        }
        
        // setup depth test
        const depthTest = mesh.material.depthTest;
        
        // draw
        this.#gpu.draw(
            mesh.geometry.drawCount,
            mesh.material.primitiveType,
            depthTest,
            depthWrite,
            mesh.material.blendType,
            mesh.material.faceSide,
        );
    }
}