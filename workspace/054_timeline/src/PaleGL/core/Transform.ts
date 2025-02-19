﻿import { Vector3 } from '@/PaleGL/math/Vector3.js';
import { Matrix4 } from '@/PaleGL/math/Matrix4.js';
import { ActorTypes } from '@/PaleGL/constants.js';
import { Rotator } from '@/PaleGL/math/Rotator.js';
import { Actor } from '@/PaleGL/actors/Actor';
// import { Camera } from '@/PaleGL/actors/Camera.ts';

// TODO:
// - 外側から各種propertyを取得するときはmatrix更新した方がいい？
// - NodeBaseを継承
// - dirtyNeedsUpdate flag
export class Transform {
    actor: Actor;
    // parent: Transform | null = null;
    // children: Actor[] = [];
    #inverseWorldMatrix: Matrix4 = Matrix4.identity;
    #worldMatrix: Matrix4 = Matrix4.identity;
    #localMatrix: Matrix4 = Matrix4.identity;
    position: Vector3 = Vector3.zero;
    rotation: Rotator = Rotator.zero; // degree vector
    scale: Vector3 = Vector3.one;
    lookAtTarget: Vector3 | null = null; // world v
    #normalMatrix: Matrix4 = Matrix4.identity;

    // get childCount() {
    //     return this.children.length;
    // }

    // get hasChild() {
    //     return this.childCount > 0;
    // }

    get inverseWorldMatrix() {
        return this.#inverseWorldMatrix;
    }

    get worldMatrix() {
        return this.#worldMatrix;
    }
    
    get normalMatrix() {
        return this.#normalMatrix;
    }

    get localMatrix() {
        return this.#localMatrix;
    }

    get worldPosition() {
        return this.#worldMatrix.position;
    }

    get worldRight() {
        return new Vector3(this.#worldMatrix.m00, this.#worldMatrix.m10, this.#worldMatrix.m20).normalize();
    }

    get worldUp() {
        return new Vector3(this.#worldMatrix.m01, this.#worldMatrix.m11, this.#worldMatrix.m21).normalize();
    }

    get worldForward() {
        return new Vector3(this.#worldMatrix.m02, this.#worldMatrix.m12, this.#worldMatrix.m22).normalize();
    }

    constructor(actor: Actor) {
        this.actor = actor;
    }

    // addChild(child: Transform) {
    //     this.children.push(child);
    // }
    // addChild(child: Actor) {
    //     this.children.push(child);
    // }

    // TODO: 引数でworldMatrixとdirty_flagを渡すべきな気がする
    updateMatrix() {
        if (this.lookAtTarget) {
            // TODO:
            // - up vector 渡せるようにする
            // - parentがあるとlookatの方向が正しくなくなるので親の回転を打ち消す必要がある
            const lookAtMatrix =
                this.actor.type === ActorTypes.Camera
                    ? Matrix4.getLookAtMatrix(this.position, this.lookAtTarget, Vector3.up, true)
                    : Matrix4.getLookAtMatrix(this.position, this.lookAtTarget);
            const scalingMatrix = Matrix4.scalingMatrix(this.scale);
            this.#localMatrix = Matrix4.multiplyMatrices(lookAtMatrix, scalingMatrix);
        } else {
            const translationMatrix = Matrix4.translationMatrix(this.position);
            // eulerから回転行列を作る場合
            // // roll(Z), pitch(X), yaw(Y)
            // const rotationAxes = this.rotation.getAxesDegrees();
            // const rotationXMatrix = Matrix4.rotationXMatrix((rotationAxes.x / 180) * Math.PI);
            // const rotationYMatrix = Matrix4.rotationYMatrix((rotationAxes.y / 180) * Math.PI);
            // const rotationZMatrix = Matrix4.rotationZMatrix((rotationAxes.z / 180) * Math.PI);
            // const rotationMatrix = Matrix4.multiplyMatrices(rotationYMatrix, rotationXMatrix, rotationZMatrix);
            // quaternionから回転を作るケース
            const rotationMatrix = this.rotation.quaternion.toRotationMatrix();
            const scalingMatrix = Matrix4.scalingMatrix(this.scale);
            this.#localMatrix = Matrix4.multiplyMatrices(translationMatrix, rotationMatrix, scalingMatrix);
        }
        this.#worldMatrix = this.actor.parent
            ? Matrix4.multiplyMatrices(this.actor.parent.transform.worldMatrix, this.#localMatrix)
            : this.#localMatrix;
        this.#inverseWorldMatrix = this.#worldMatrix.clone().invert();

        this.#normalMatrix = this.#worldMatrix.clone().invert().transpose();
    }

    setScaling(s: Vector3) {
        this.scale = s;
    }

    setRotationX(degree: number) {
        this.rotation.setRotationX(degree);
    }

    setRotationY(degree: number) {
        this.rotation.setRotationY(degree);
    }

    setRotationZ(degree: number) {
        this.rotation.setRotationZ(degree);
    }

    setTranslation(v: Vector3) {
        this.position = v;
    }

    lookAt(lookAtTarget: Vector3) {
        this.lookAtTarget = lookAtTarget;
    }

    // TODO: Cameraに持たせた方がいい気がする
    // getPositionInScreen(camera: Camera) {
    //     const matInProjection = Matrix4.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix, this.#worldMatrix);
    //     const clipPosition = matInProjection.position;
    //     const w = matInProjection.m33 === 0 ? 0.0001 : matInProjection.m33; // TODO: cheap NaN fallback
    //     return new Vector3(clipPosition.x / w, clipPosition.y / w, clipPosition.z / w);
    //     // console.log("--------")
    //     // this.#worldMatrix.position.log();
    //     // camera.viewMatrix.position.log();
    //     // v.log();
    // }
}
