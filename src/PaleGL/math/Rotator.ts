﻿import { Quaternion } from '@/PaleGL/math/Quaternion';
import { Matrix4 } from '@/PaleGL/math/Matrix4.ts';
import { Vector3 } from '@/PaleGL/math/Vector3.ts';

// TODO: quaternion対応
export class Rotator {
    // x, y, z axes
    // そのままdegreeが入る
    // elements: Float32Array = new Float32Array(3);
    _rawMatrix: Matrix4 | null = null;
    _quaternion: Quaternion = Quaternion.identity();

    get rawMatrix() {
        return this._rawMatrix;
    }

    set rawMatrix(m: Matrix4 | null) {
        this._rawMatrix = m;
    }

    get quaternion() {
        return this._quaternion;
    }

    // degree
    get x() {
        // return this.elements[0];
        return this._quaternion.toEulerDegree().x;
    }

    // degree
    get y() {
        // return this.elements[1];
        return this._quaternion.toEulerDegree().y;
    }

    // degree
    get z() {
        // return this.elements[2];
        return this._quaternion.toEulerDegree().z;
    }

    // degree
    set x(v: number) {
        // this.elements[0] = v;
        const euler = this._quaternion.toEulerDegree();
        euler.x = v;
        const q = Quaternion.fromEulerDegrees(euler.x, euler.y, euler.z);
        this._quaternion = q;
    }

    // degree
    set y(v: number) {
        // this.elements[1] = v;
        const euler = this._quaternion.toEulerDegree();
        euler.y = v;
        const q = Quaternion.fromEulerDegrees(euler.x, euler.y, euler.z);
        this._quaternion = q;
    }

    // degree
    set z(v: number) {
        // this.elements[2] = v;
        const euler = this._quaternion.toEulerDegree();
        euler.z = v;
        const q = Quaternion.fromEulerDegrees(euler.x, euler.y, euler.z);
        this._quaternion = q;
    }

    // degree
    get roll() {
        // return this.elements[2];
        const euler = this._quaternion.toEulerDegree();
        return euler.z;
    }

    // degree
    get pitch() {
        // return this.elements[0];
        const euler = this._quaternion.toEulerDegree();
        return euler.x;
    }

    // degree
    get yaw() {
        // return this.elements[1];
        const euler = this._quaternion.toEulerDegree();
        return euler.y;
    }

    // degree
    // getAxesDegrees() {
    //     return {
    //         x: this.elements[0],
    //         y: this.elements[1],
    //         z: this.elements[2],
    //     };
    // }

    getAxesRadians() {
        // return {
        //     x: (this.elements[0] * Math.PI) / 180,
        //     y: (this.elements[1] * Math.PI) / 180,
        //     z: (this.elements[2] * Math.PI) / 180,
        // };
        const radian = this._quaternion.toEulerRadian();
        return {
            x: radian.x,
            y: radian.y,
            z: radian.z,
        };
    }

    // _updateQuaternionFromEulerDegrees() {
    //     this._quaternion = Quaternion.fromEulerDegrees(this.x, this.y, this.z);
    // }

    constructor(q: Quaternion) {
        // this.set(x, y, z);
        // this._updateQuaternionFromEulerDegrees();

        this._quaternion = q;
        // this._updateQuaternionFromEulerDegrees();
    }

    // degrees
    // constructor(x: number, y: number, z: number) {
    //     this.set(x, y, z);
    //     this._updateQuaternionFromEulerDegrees();
    // }

    setEulerDegree(x: number, y: number, z: number) {
        // const q = Quaternion.fromEulerDegrees(x, y, z);
        // this.elements = new Float32Array([x, y, z]);
        // this._updateQuaternionFromEulerDegrees();
        // return this;

        const q = Quaternion.fromEulerDegrees(x, y, z);
        this._quaternion = q;
        // this._updateQuaternionFromEulerDegrees();
        return this;
    }

    setV(v: Vector3) {
        // this.elements = new Float32Array([v.x, v.y, v.z]);
        // this._updateQuaternionFromEulerDegrees();
        // return this;

        // this.elements = new Float32Array([v.x, v.y, v.z]);
        const q = Quaternion.fromEulerDegrees(v.x, v.y, v.z);
        this._quaternion = q;
        return this;
    }

    copy(r: Rotator) {
        // this.set(r.x, r.y, r.z);
        // this._updateQuaternionFromEulerDegrees();
        // return this;

        this._quaternion.copy(r.quaternion);
        return this;
    }

    // setRadian(x: number, y: number, z: number) {
    //     const r = Rotator.fromRadian(x, y, z);
    //     this._updateQuaternionFromEulerDegrees();
    //     return this.copy(r);
    // }

    static get zero() {
        // return new Rotator(0, 0, 0);

        const q = Quaternion.fromEulerDegrees(0, 0, 0);
        return new Rotator(q);
    }

    setRotationX(degree: number) {
        //this.elements[0] = degree;
        //this._updateQuaternionFromEulerDegrees();

        const euler = this._quaternion.toEulerDegree();
        euler.x = degree;
        const q = Quaternion.fromEulerDegrees(euler.x, euler.y, euler.z);
        this._quaternion = q;
    }

    setRotationY(degree: number) {
        // this.elements[1] = degree;
        // this._updateQuaternionFromEulerDegrees();

        const euler = this._quaternion.toEulerDegree();
        euler.y = degree;
        const q = Quaternion.fromEulerDegrees(euler.x, euler.y, euler.z);
        this._quaternion = q;
    }

    setRotationZ(degree: number) {
        // this.elements[2] = degree;
        // this._updateQuaternionFromEulerDegrees();

        const euler = this._quaternion.toEulerDegree();
        euler.z = degree;
        const q = Quaternion.fromEulerDegrees(euler.x, euler.y, euler.z);
        this._quaternion = q;
    }

    invert() {
        // const x = (this.x + 180) % 360;
        // const y = (this.y + 180) % 360;
        // const z = (this.z + 180) % 360;
        // const rotator = Rotator.zero.set(x, y, z);
        // return rotator;

        const x = (this.x + 180) % 360;
        const y = (this.y + 180) % 360;
        const z = (this.z + 180) % 360;
        const q = Quaternion.fromEulerDegrees(x, y, z);
        const rotator = new Rotator(q);
        return rotator;
    }

    // static fromRadian(x: number, y: number, z: number) {
    //     const rotator = Rotator.zero.set((x * 180) / Math.PI, (y * 180) / Math.PI, (z * 180) / Math.PI);
    //     return rotator;
    // }

    // static fromDegree(x: number, y: number,z: number) {
    //     return new Rotator(x, y, z);
    // }

    static fromQuaternion(q: Quaternion) {
        // const euler = q.toEulerDegree();
        // return new Rotator(euler.x, euler.y, euler.z);

        return new Rotator(q);
    }

    // TODO: quaternion-bug: gltfのquaternionからdegreeを複合するところのバグの回避のため使ってる関数なので本当はよくない
    static fromMatrix4(m: Matrix4) {
        // const r = new Rotator(0, 0, 0);
        // r.rawMatrix = m;
        // return r;

        const q = Quaternion.identity();
        const r = new Rotator(q);
        r.rawMatrix = m;
        return r;
    }

    clone() {
        // return new Rotator(this.x, this.y, this.z);
        return new Rotator(this._quaternion);
    }
}
