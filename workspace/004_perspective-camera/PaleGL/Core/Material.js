﻿import {Shader} from "./Shader.js";
import {UniformTypes} from "./constants.js";
import {Matrix4} from "../Math/Matrix4.js";

export class Material {
    shader;
    primitiveType;
    uniforms = {};

    static UniformTypes = {
        Float: "Float",
        Matrix4fv: "Matrix4fv",
        Vector3f: "Vector3f",
    };

    constructor({gpu, vertexShader, fragmentShader, primitiveType, uniforms = {}}) {
        this.shader = new Shader({gpu, vertexShader, fragmentShader});
        this.primitiveType = primitiveType;

        const commonUniforms = {
            uWorldMatrix: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity()
            },
            uViewMatrix: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity()
            },
            uProjectionMatrix: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity()
            }
        };

        this.uniforms = {...commonUniforms, ...uniforms};
    }
}
