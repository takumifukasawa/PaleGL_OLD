﻿import {GPU} from "./PaleGL/core/GPU.js";
import {BlendTypes, PrimitiveTypes, UniformTypes} from "./PaleGL/constants.js";
import {Vector3} from "./PaleGL/math/Vector3.js";
import {Vector4} from "./PaleGL/math/Vector4.js";
import {Scene} from "./PaleGL/core/Scene.js";
import {ForwardRenderer} from "./PaleGL/core/ForwardRenderer.js";
import {Mesh} from "./PaleGL/core/Mesh.js";
import {Material} from "./PaleGL/materials/Material.js";
import {PerspectiveCamera} from "./PaleGL/core/PerspectiveCamera.js";
import {Texture} from "./PaleGL/core/Texture.js";
import {loadImg} from "./PaleGL/utils/loadImg.js";
import {BoxGeometry} from "./PaleGL/geometries/BoxGeometry.js";
import {PostProcess} from "./PaleGL/postprocess/PostProcess.js";
import {FragmentPass} from "./PaleGL/postprocess/FragmentPass.js";
import {PlaneGeometry} from "./PaleGL/geometries/PlaneGeometry.js";
import {DebuggerGUI} from "./DebuggerGUI.js";
import {DirectionalLight} from "./PaleGL/lights/DirectionalLight.js";
import {loadObj} from "./PaleGL/utils/loadObj.js";
import {Geometry} from "./PaleGL/geometries/Geometry.js";
import {Color} from "./PaleGL/core/Color.js";

let width, height;
let objMesh;
const targetCameraPosition = {
    x: 0,
    y: 0,
    z: 5,
}

const wrapperElement = document.getElementById("wrapper");

const canvasElement = document.getElementById("js-canvas");

const objModelVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in vec3 aNormal;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec2 vUv;
out vec3 vNormal;
out vec3 vWorldPosition;

void main() {
    vUv = aUv;
    vNormal = (uNormalMatrix * vec4(aNormal, 1)).xyz;
    vec4 worldPosition = uWorldMatrix * vec4(aPosition, 1);
    vWorldPosition = worldPosition.xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}
`;

const objModelFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;
in vec3 vNormal;
in vec3 vWorldPosition;

out vec4 outColor;

uniform vec3 uViewPosition;
uniform vec4 uBaseColor;
uniform vec4 uAmbientColor;

struct DirectionalLight {
    vec3 direction;
    float intensity;
    vec4 color;
};
uniform DirectionalLight uDirectionalLight;

void main() {
    vec4 baseColor = uBaseColor;
   
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uDirectionalLight.direction);
    float diffuseRate = clamp(dot(N, L), 0., 1.);
    vec3 diffuseColor = baseColor.xyz * diffuseRate * uDirectionalLight.intensity * uDirectionalLight.color.xyz;

    vec3 P = vWorldPosition;
    vec3 E = uViewPosition;
    vec3 PtoL = L; // for directional light
    vec3 PtoE = normalize(E - P);
    vec3 H = normalize(PtoL + PtoE);
    float specularPower = 64.;
    float specularRate = clamp(dot(H, N), 0., 1.);
    specularRate = pow(specularRate, specularPower);
    vec3 specularColor = specularRate * uDirectionalLight.intensity * uDirectionalLight.color.xyz;
    
    vec3 ambientColor = uAmbientColor.xyz;
    
    vec3 resultColor = diffuseColor + specularColor + ambientColor;

    outColor = vec4(resultColor, 1);
}
`;

const gl = canvasElement.getContext('webgl2');

const gpu = new GPU({gl});

const captureScene = new Scene();

const renderer = new ForwardRenderer({
        gpu,
        canvas: canvasElement,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5)
    }
);

const planeVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vUv;
out float vTextureIndex;

void main() {
    vUv = aUv;
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aPosition, 1);
}
`;

const planeFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

void main() {
    outColor = vec4(vUv, 1, 0.5);
}
`;

const planeMaterial = new Material({
    gpu,
    vertexShader: planeVertexShader,
    fragmentShader: planeFragmentShader,
    blendType: BlendTypes.Transparent
});

const planeMesh = new Mesh(new PlaneGeometry({gpu}), planeMaterial);
captureScene.add(planeMesh);

const directionalLight = new DirectionalLight();
captureScene.add(directionalLight);
directionalLight.transform.setTranslation(new Vector3(1, 1, 1));
directionalLight.intensity = 1;
directionalLight.color = Color.white();

const captureSceneCamera = new PerspectiveCamera(60, 1, 0.1, 50);
captureScene.add(captureSceneCamera);

captureSceneCamera.transform.setTranslation(new Vector3(0, 0, 5));
captureSceneCamera.setClearColor(new Vector4(0, 0, 0, 1));

const postProcess = new PostProcess({gpu, renderer});
postProcess.addPass(new FragmentPass({
    gpu, fragmentShader: `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uSceneTexture;
void main() {
    vec4 textureColor = texture(uSceneTexture, vUv);
    float r = texture(uSceneTexture, vUv + vec2(0.01, 0)).r;
    float g = texture(uSceneTexture, vUv + vec2(-0.005, 0)).g;
    float b = texture(uSceneTexture, vUv + vec2(0, 0.005)).b;
    outColor = vec4(r, g, b, 1);
}
`
}));

captureSceneCamera.setPostProcess(postProcess);

const onMouseMove = (e) => {
    const nx = (e.clientX / width) * 2 - 1;
    const ny = (e.clientY / height) * 2 - 1;
    targetCameraPosition.x = nx * 2;
    targetCameraPosition.y = ny * 2;
};

const onWindowResize = () => {
    width = wrapperElement.offsetWidth;
    height = wrapperElement.offsetHeight;

    captureSceneCamera.setSize(width, height);

    renderer.setSize(width, height);
    postProcess.setSize(width, height);
};

captureSceneCamera.transform.position = new Vector3(0, 0, 5);
captureSceneCamera.transform.lookAt(new Vector3(0, 0, 0));

const tick = (time) => {
    if(objMesh) {
        objMesh.transform.setTranslation(new Vector3(0, 0, -0.5));
        objMesh.transform.setRotationY(time / 1000 * 10);
        objMesh.transform.setScaling(new Vector3(0.8, 0.8, 0.8))
    }
  
    const cameraPosition = Vector3.addVectors(
        captureSceneCamera.transform.position,
        new Vector3(
            (targetCameraPosition.x - captureSceneCamera.transform.position.x) * 0.1,
            (targetCameraPosition.y - captureSceneCamera.transform.position.y) * 0.1,
            (targetCameraPosition.z - captureSceneCamera.transform.position.z) * 0.1
        )
    );
    captureSceneCamera.transform.position = cameraPosition;

    // planeMesh.transform.setTranslation(new Vector3(0, 0, Math.sin(time / 1000)));

    renderer.render(captureScene, captureSceneCamera);

    // loop

    requestAnimationFrame(tick);
}

const main = async () => {
    const objData = await loadObj("./monkey.obj");

    objMesh = new Mesh(
        new Geometry({
            gpu,
            attributes: {
                position: {
                    data: objData.positions.flat(),
                    size: 3
                },
                uv: {
                    data: objData.uvs.flat(),
                    size: 2,
                },
                normal: {
                    data: objData.normals.flat(),
                    size: 3
                },
            },
            indices: objData.indices,
            drawCount: objData.indices.length
        }),
        new Material({
            gpu,
            vertexShader: objModelVertexShader,
            fragmentShader: objModelFragmentShader,
            primitiveType: PrimitiveTypes.Triangles,
            uniforms: {
                uDirectionalLight: {},
                uBaseColor: {
                    type: UniformTypes.Color,
                    value: Color.white(),
                },
                uAmbientColor: {
                    type: UniformTypes.Color,
                    value: Color.black()
                }
            }
        })
    );
    captureScene.add(objMesh);

    captureSceneCamera.postProcess.enabled = false;

    const debuggerGUI = new DebuggerGUI();
    debuggerGUI.add(DebuggerGUI.DebuggerTypes.PullDown, {
        label: "Plane Blending",
        options: [
            {
                label: "Opaque",
                value: BlendTypes.Opaque,
            },
            {
                label: "Transparent",
                value: BlendTypes.Transparent,
                isDefault: true
            },
            {
                label: "Additive",
                value: BlendTypes.Additive
            },
        ],
        onChange: (blendType) => {
            planeMaterial.blendType = blendType;
        }
    });
    
    debuggerGUI.addBorderSpacer();

    debuggerGUI.add(DebuggerGUI.DebuggerTypes.Color, {
        label: "Obj Base Color",
        initialValue: objMesh.material.uniforms.uBaseColor.value.getHexCoord(),
        onChange: (value) => {
            const color = Color.fromHex(value);
            objMesh.material.uniforms.uBaseColor.value = color;
        }
    });
    debuggerGUI.add(DebuggerGUI.DebuggerTypes.Color, {
        label: "Ambient Color",
        initialValue: objMesh.material.uniforms.uAmbientColor.value.getHexCoord(),
        onChange: (value) => {
            const color = Color.fromHex(value);
            objMesh.material.uniforms.uAmbientColor.value = color;
        }
    });

    debuggerGUI.addBorderSpacer();

    debuggerGUI.add(DebuggerGUI.DebuggerTypes.Color, {
        label: "Light Color",
        initialValue: directionalLight.color.getHexCoord(),
        onChange: (value) => {
            const color = Color.fromHex(value);
            directionalLight.color = color;
        }
    });
    debuggerGUI.add(DebuggerGUI.DebuggerTypes.Slider, {
        label: "Directional Light: position x",
        initialValue: directionalLight.transform.position.x,
        minValue: -5,
        maxValue: 5,
        stepValue: 0.01,
        onChange: (value) => {
            directionalLight.transform.position.x = value;
        }
    });
    debuggerGUI.add(DebuggerGUI.DebuggerTypes.Slider, {
        label: "Directional Light: position y",
        initialValue: directionalLight.transform.position.y,
        minValue: -5,
        maxValue: 5,
        stepValue: 0.01,
        onChange: (value) => {
            directionalLight.transform.position.y = value;
        }
    });
    debuggerGUI.add(DebuggerGUI.DebuggerTypes.Slider, {
        label: "Directional Light: position z",
        initialValue: directionalLight.transform.position.z,
        minValue: -5,
        maxValue: 5,
        stepValue: 0.01,
        onChange: (value) => {
            directionalLight.transform.position.z = value;
        }
    });
    
    debuggerGUI.addBorderSpacer();

    debuggerGUI.add(DebuggerGUI.DebuggerTypes.CheckBox, {
        label: "Enabled Post Process",
        initialValue: captureSceneCamera.postProcess.enabled,
        onChange: (value) => {
            captureSceneCamera.postProcess.enabled = value;
        }
    });

    wrapperElement.appendChild(debuggerGUI.domElement);

    window.addEventListener("mousemove", onMouseMove);
    
    onWindowResize();
    window.addEventListener('resize', onWindowResize);
    
    requestAnimationFrame(tick);
}

main();