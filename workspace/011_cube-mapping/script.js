﻿import {GPU} from "./PaleGL/core/GPU.js";
import {BlendTypes, CubeMapAxis, PrimitiveTypes, UniformTypes} from "./PaleGL/constants.js";
import {Vector3} from "./PaleGL/math/Vector3.js";
import {Vector4} from "./PaleGL/math/Vector4.js";
import {Matrix4} from "./PaleGL/math/Matrix4.js";
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
import {CubeMap} from "./PaleGL/core/CubeMap.js";

let width, height;
let objMesh;
let skyboxMesh;
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
uniform samplerCube uCubeTexture;
uniform float uCubeMapRotationRadian;

mat2 rotate(float r) {
    float c = cos(r);
    float s = sin(r);
    return mat2(c, s, -s, c);
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 P = vWorldPosition;
    vec3 E = uViewPosition;
    vec3 PtoE = normalize(E - P);
 
    // ----------------------------------------------------------
    // begin: for cube map sample pattern
    // ----------------------------------------------------------
  
    // pattern_1: raw
    // vec3 reflectDir = reflect(-PtoE, N);
    // vec3 cubeColor = texture(uCubeTexture, reflectDir).xyz;
   
    // pattern_2: reverse x
    // reflectDir *= vec3(-1., 1., 1.);
    // vec3 cubeColor = texture(uCubeTexture, reflectDir).xyz;

    // pattern_3: reverse x and z
    // vec3 reflectDir = reflect(-PtoE, N);
    // reflectDir *= vec3(-1., 1., -1.);
    // vec3 cubeColor = texture(uCubeTexture, reflectDir).xyz;

    // pattern_4: reverse x and rotate
    vec3 reflectDir = reflect(-PtoE, N);
    reflectDir.x *= -1.;
    reflectDir.xz *= rotate(uCubeMapRotationRadian); // default: 3.14
    vec3 cubeColor = texture(uCubeTexture, reflectDir).xyz;

    // ----------------------------------------------------------
    // end: for cube map sample pattern
    // ----------------------------------------------------------
   
    outColor = vec4(cubeColor, 1);
}
`;

const skyboxVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in vec3 aNormal;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec2 vUv;
out vec3 vNormal;
out vec3 vRawNormal;
out vec3 vLocalPosition;
out vec3 vWorldPosition;

void main() {
    vUv = aUv;
    vLocalPosition = aPosition;
    vRawNormal = aNormal;
    vNormal = (uNormalMatrix * vec4(aNormal, 1)).xyz;
    vec4 worldPosition = uWorldMatrix * vec4(aPosition, 1);
    vWorldPosition = worldPosition.xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}
`;

const skyboxFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;
in vec3 vNormal;
in vec3 vRawNormal;
in vec3 vWorldPosition;
in vec3 vLocalPosition;

uniform samplerCube uCubeTexture;
uniform vec3 uViewPosition;
uniform float uCubeMapRotationRadian;

out vec4 outColor;

mat2 rotate(float r) {
    float c = cos(r);
    float s = sin(r);
    return mat2(c, s, -s, c);
}

void main() {
    vec3 N = normalize(vNormal);

    vec3 reflectDir = -N;
    reflectDir.x *= -1.;
    reflectDir.xz *= rotate(uCubeMapRotationRadian); // default: 3.14
    vec4 textureColor = texture(uCubeTexture, reflectDir);
    
    outColor = textureColor;
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

const captureSceneCamera = new PerspectiveCamera(60, 1, 0.1, 200);
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
    targetCameraPosition.x = nx * 20;
    targetCameraPosition.y = -ny * 20;
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
    const cameraPosition = Vector3.addVectors(
        captureSceneCamera.transform.position,
        new Vector3(
            (targetCameraPosition.x - captureSceneCamera.transform.position.x) * 0.1,
            (targetCameraPosition.y - captureSceneCamera.transform.position.y) * 0.1,
            (targetCameraPosition.z - captureSceneCamera.transform.position.z) * 0.1
        )
    );
    captureSceneCamera.transform.position = cameraPosition;
    
    renderer.render(captureScene, captureSceneCamera);

    // loop

    requestAnimationFrame(tick);
}

const main = async () => {
    const objData = await loadObj("./models/sphere-32-32.obj");

    objMesh = new Mesh(
        // new BoxGeometry({ gpu }),
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
                uCubeTexture: {
                    type: UniformTypes.CubeMap,
                    value: null
                },
                uCubeMapRotationRadian: {
                    type: UniformTypes.Float,
                    value: 3.14
                }
            }
        })
    );
    captureScene.add(objMesh);
    
    const images = {
        [CubeMapAxis.PositiveX]: "./images/dir-x-plus.png",
        [CubeMapAxis.NegativeX]: "./images/dir-x-minus.png",
        [CubeMapAxis.PositiveY]: "./images/dir-y-plus.png",
        [CubeMapAxis.NegativeY]: "./images/dir-y-minus.png",
        [CubeMapAxis.PositiveZ]: "./images/dir-z-plus.png",
        [CubeMapAxis.NegativeZ]: "./images/dir-z-minus.png",
    };
   
    let cubeMap;
    const skyboxObjData = await loadObj("./models/skybox-32-32.obj");
    await Promise.all(Object.keys(images).map(async(key) => {
            const img = await loadImg(images[key]);
            return { key, img };
        }))
        .then(result => {
            const data = {};
            result.forEach(({ key, img }) => data[key] = img);
            cubeMap = new CubeMap({ gpu, images: data });
        });
    
    skyboxMesh = new Mesh(
        new Geometry({
            gpu,
            attributes: {
                position: {
                    data: skyboxObjData.positions.flat(),
                    size: 3
                },
                uv: {
                    data: skyboxObjData.uvs.flat(),
                    size: 2,
                },
                normal: {
                    data: skyboxObjData.normals.flat(),
                    size: 3
                },
            },
            indices: skyboxObjData.indices,
            drawCount: skyboxObjData.indices.length
        }),
        new Material({
            gpu,
            vertexShader: skyboxVertexShader,
            fragmentShader: skyboxFragmentShader,
            primitiveType: PrimitiveTypes.Triangles,
            uniforms: {
                uCubeTexture: {
                    type: UniformTypes.CubeMap,
                    value: cubeMap
                },
                uCubeMapRotationRadian: {
                    type: UniformTypes.Float,
                    value: 3.14
                }
            }
        })
    );
    captureScene.add(skyboxMesh);
    skyboxMesh.transform.setScaling(new Vector3(100, 100, 100));
    objMesh.material.uniforms.uCubeTexture.value = cubeMap;
    
    captureSceneCamera.postProcess.enabled = false;

    const debuggerGUI = new DebuggerGUI();

    debuggerGUI.addSliderDebugger({
        label: "Cube Map Rotation Radian",
        initialValue: objMesh.material.uniforms.uCubeMapRotationRadian.value,
        minValue: 0,
        maxValue: 6.28,
        stepValue: 0.01,
        onChange: (value) => {
            objMesh.material.uniforms.uCubeMapRotationRadian.value = value;
            skyboxMesh.material.uniforms.uCubeMapRotationRadian.value = value;
        },
    });
    
    debuggerGUI.addBorderSpacer();

    debuggerGUI.addToggleDebugger({
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