// actors
import { DirectionalLight } from '@/PaleGL/actors/DirectionalLight';
import { PerspectiveCamera } from '@/PaleGL/actors/PerspectiveCamera';

// core
import { Engine } from '@/PaleGL/core/Engine';
import { Renderer } from '@/PaleGL/core/Renderer';
import { GPU } from '@/PaleGL/core/GPU';
import { RenderTarget } from '@/PaleGL/core/RenderTarget';
import { Scene } from '@/PaleGL/core/Scene';
// import { Texture } from '@/PaleGL/core/Texture';
// import { OrbitCameraController } from '@/PaleGL/core/OrbitCameraController';

// loaders

// materials

// math
import { Color } from '@/PaleGL/math/Color';
import { Vector3 } from '@/PaleGL/math/Vector3';
import { Vector4 } from '@/PaleGL/math/Vector4';

// postprocess
import { BufferVisualizerPass } from '@/PaleGL/postprocess/BufferVisualizerPass';

// inputs
import { TouchInputController } from '@/PaleGL/inputs/TouchInputController';
import { MouseInputController } from '@/PaleGL/inputs/MouseInputController';

// others
import {
    RenderTargetTypes,
    TextureDepthPrecisionType,
    // TextureFilterTypes,
    // TextureFilterTypes, TextureWrapTypes,
} from '@/PaleGL/constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import sceneJsonUrl from '../assets/data/scene.json';

import { DebuggerGUI } from '@/DebuggerGUI';
import { Camera } from '@/PaleGL/actors/Camera';
import { OrthographicCamera } from '@/PaleGL/actors/OrthographicCamera';
import { PostProcess } from '@/PaleGL/postprocess/PostProcess.ts';
import soundVertexShader from '@/PaleGL/shaders/sound-vertex.glsl';
import { GLSLSound } from '@/PaleGL/core/GLSLSound.ts';
import { wait } from '@/utilities/wait.ts';
import { createMarionetter } from '@/Marionetter/createMarionetter.ts';
// import { Mesh } from '@/PaleGL/actors/Mesh.ts';
import { SpotLight } from '@/PaleGL/actors/SpotLight.ts';
import {
    Marionetter,
    // MarionetterPlayableDirectorComponentInfo,
    MarionetterScene,
    MarionetterTimeline,
} from '@/Marionetter/types';
import { buildMarionetterScene } from '@/Marionetter/buildMarionetterScene.ts';
import {OrbitCameraController} from "@/PaleGL/core/OrbitCameraController.ts";
// import { buildMarionetterTimeline } from '@/Marionetter/timeline.ts';
// import glsl from 'vite-plugin-glsl';
// import { loadImg } from '@/PaleGL/loaders/loadImg.ts';
// import { Texture } from '@/PaleGL/core/Texture.ts';
// import { TextAlignType, TextMesh } from '@/PaleGL/actors/TextMesh.ts';
// import fontAtlasImgUrl from './assets/fonts/NotoSans-Bold/atlas.png?url';
// import fontAtlasJson from './assets/fonts/NotoSans-Bold/NotoSans-Bold.json';

const stylesText = `
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
} 

#wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  background-color: black;
}
`;
const styleElement = document.createElement('style');
styleElement.innerText = stylesText;
document.head.appendChild(styleElement);

let debuggerGUI: DebuggerGUI;
let width: number, height: number;
let glslSound: GLSLSound;
let marionetterTimeline: MarionetterTimeline | null = null;

const marionetter: Marionetter = createMarionetter({ showLog: false });

const isSP = !!window.navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i);
const inputController = isSP ? new TouchInputController() : new MouseInputController();
inputController.start();

// const wrapperElement = document.getElementById("wrapper")!;
const wrapperElement = document.createElement('div');
document.body.appendChild(wrapperElement);
wrapperElement.setAttribute('id', 'wrapper');

// const canvasElement = document.getElementById("js-canvas")! as HTMLCanvasElement;
const canvasElement = document.createElement('canvas')!;
wrapperElement.appendChild(canvasElement);

const gl = canvasElement.getContext('webgl2', { antialias: false });

if (!gl) {
    throw 'invalid gl';
}

const gpu = new GPU({ gl });

const captureScene = new Scene();

const pixelRatio = Math.min(window.devicePixelRatio, 1.5);

const renderer = new Renderer({
    gpu,
    canvas: canvasElement,
    pixelRatio,
});

const engine = new Engine({ gpu, renderer });

engine.setScene(captureScene);

// const captureSceneCamera = new PerspectiveCamera(70, 1, 0.1, 50);
// captureScene.add(captureSceneCamera);
// // captureSceneCamera.mainCamera = true;
// captureSceneCamera.name = "Main Camera";

let captureSceneCamera: PerspectiveCamera | null;
// let orbitCameraController: OrbitCameraController | null;

/**
 *
 */
const playSound = () => {
    stopSound();
    glslSound = new GLSLSound(gpu, soundVertexShader, 180);
    glslSound.play(0);
};

const stopSound = () => {
    if (glslSound) {
        glslSound.stop();
    }
};

const initMarionetter = () => {
    marionetter.connect();
};

const buildScene = (sceneJson: MarionetterScene) => {
    // const res = buildMarionetterScene(gpu, sceneJson, false);
    const res = buildMarionetterScene(gpu, sceneJson);
    const { actors} = res;
    marionetterTimeline = res.marionetterTimeline;
    
    for (let i = 0; i < actors.length; i++) {
        captureScene.add(actors[i]);
    }

    captureSceneCamera = captureScene.find('MainCamera') as PerspectiveCamera;
    const directionalLight = captureScene.find('DirectionalLight') as DirectionalLight;
    // const plane = captureScene.find('Plane') as Mesh;

    const orbitCameraController = new OrbitCameraController(captureSceneCamera);
    orbitCameraController.distance = isSP ? 15 : 15;
    orbitCameraController.attenuation = 0.01;
    orbitCameraController.dampingFactor = 0.2;
    orbitCameraController.azimuthSpeed = 100;
    orbitCameraController.altitudeSpeed = 100;
    orbitCameraController.deltaAzimuthPower = 2;
    orbitCameraController.deltaAltitudePower = 2;
    orbitCameraController.maxAltitude = 5;
    orbitCameraController.minAltitude = -45;
    orbitCameraController.maxAzimuth = 55;
    orbitCameraController.minAzimuth = -55;
    orbitCameraController.defaultAzimuth = 10;
    orbitCameraController.defaultAltitude = -10;
    orbitCameraController.lookAtTarget = new Vector3(0, 3, 0);
    orbitCameraController.start();
    orbitCameraController.enabled = true;
    
    // const orbitCameraController = new OrbitCameraController(captureSceneCamera);

    captureSceneCamera.subscribeOnStart(({ actor }) => {
        (actor as Camera).setClearColor(new Vector4(0, 0, 0, 1));
    });
    captureSceneCamera.onFixedUpdate = () => {
        // 1: fixed position
        // actor.transform.position = new Vector3(-7 * 1.1, 4.5 * 1.4, 11 * 1.2);
        // 2: orbit controls
        // if (inputController.isDown && debuggerStates.orbitControlsEnabled) {
        // if (inputController.isDown && orbitCameraController.enabled) {
        //     orbitCameraController.setDelta(inputController.deltaNormalizedInputPosition);
        // }
        if (inputController.isDown && orbitCameraController.enabled) {
            orbitCameraController.setDelta(inputController.deltaNormalizedInputPosition);
        }
        orbitCameraController.fixedUpdate();
    };

    const spotLight = captureScene.find('SpotLight') as SpotLight;
    if (spotLight && spotLight.shadowCamera) {
        spotLight.shadowCamera.visibleFrustum = true;
        spotLight.castShadow = true;
        spotLight.shadowCamera.near = 0.1;
        spotLight.shadowCamera.far = spotLight.distance;
        (spotLight.shadowCamera as PerspectiveCamera).setPerspectiveSize(1); // TODO: いらないかも
        spotLight.shadowMap = new RenderTarget({
            gpu,
            width: 1024,
            height: 1024,
            type: RenderTargetTypes.Depth,
            depthPrecision: TextureDepthPrecisionType.High,
        });
        // spotLight.transform.rotation = Rotator.fromRadian(0, 0, 0);
    }
    // spotLight.transform.rotation = spotLight.transform.rotation.invert();
    // spotLight.lastUpdate = () => {
    //     spotLight.transform.rotation = spotLight.transform.rotation.invert();
    //     // spotLight.transform.rotation = spotLight.transform.rotation;
    // };
    //spotLight.transform.position = new Vector3(0, 3, 0);
    //spotLight.transform.lookAt(new Vector3(0, 0, 0));
    //spotLight.transform.rotation = Rotator.fromRadian(-90, 0, 0);
    //console.log("rrr", spotLight.transform.rotation)

    // const plane = captureScene.find('Plane') as Mesh;
    // plane.transform.rotation = Rotator.fromDegree(0, 0, 0);
    // plane.material = new UnlitMaterial({emissiveColor: Color.fromRGB(255, 255, 255)});

    // const directionalLight = new DirectionalLight({
    //     name: 'DirectionalLight',
    //     intensity: 1.2,
    //     // color: Color.fromRGB(255, 210, 200),
    //     color: Color.white,
    // });

    // shadows
    // TODO: directional light は constructor で shadow camera を生成してるのでこのガードいらない
    if (directionalLight && directionalLight.shadowCamera) {
        // directionalLight.shadowCamera.visibleFrustum = true;
        directionalLight.castShadow = true;
        directionalLight.shadowCamera.near = 1;
        directionalLight.shadowCamera.far = 30;
        (directionalLight.shadowCamera as OrthographicCamera).setOrthoSize(null, null, -12, 12, -12, 12);
        // (directionalLight.shadowCamera as OrthographicCamera).setOrthoSize(null, null, -5, 5, -5, 5);
        // (directionalLight.shadowCamera as OrthographicCamera).setOrthoSize(null, null, -7, 7, -7, 7);
        directionalLight.shadowMap = new RenderTarget({
            gpu,
            width: 1024,
            height: 1024,
            type: RenderTargetTypes.Depth,
        });

        directionalLight.subscribeOnStart(({ actor }) => {
            actor.transform.setTranslation(new Vector3(-8, 8, -2));
            actor.transform.lookAt(new Vector3(0, 0, 0));
            // const lightActor = actor as DirectionalLight;
            // lightActor.castShadow = true;
            // // lightActor.castShadow = false;
            // if (lightActor.shadowCamera) {
            //     lightActor.shadowCamera.near = 1;
            //     lightActor.shadowCamera.far = 30;
            //     (lightActor.shadowCamera as OrthographicCamera).setOrthoSize(null, null, -10, 10, -10, 10);
            //     lightActor.shadowMap = new RenderTarget({gpu, width: 1024, height: 1024, type: RenderTargetTypes.Depth});
            // }
        });
        // captureScene.add(directionalLight);
    }

    const cameraPostProcess = new PostProcess();

    const bufferVisualizerPass = new BufferVisualizerPass({ gpu });
    bufferVisualizerPass.parameters.enabled = false;
    cameraPostProcess.addPass(bufferVisualizerPass);
    // bufferVisualizerPass.beforeRender = () => {
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uDirectionalLightShadowMap',
    //         directionalLight.shadowMap!.read.depthTexture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uAmbientOcclusionTexture',
    //         renderer.ambientOcclusionPass.renderTarget.read.texture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uDeferredShadingTexture',
    //         renderer.deferredShadingPass.renderTarget.read.texture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uLightShaftTexture',
    //         renderer.lightShaftPass.renderTarget.read.texture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue('uFogTexture', renderer.fogPass.renderTarget.read.texture);
    // };

    cameraPostProcess.enabled = true;
    // TODO: set post process いらないかも
    captureSceneCamera.setPostProcess(cameraPostProcess);

    // parseScene(sceneJson);

    console.log('scene', actors);

    initDebugger({
        bufferVisualizerPass,
    });
};

// const parseScene = (sceneJson: MarionetterScene) => {
//     const playableDirectorComponentInfo = sceneJson.objects[0]
//         .components[0] as MarionetterPlayableDirectorComponentInfo;
//     marionetterTimeline = buildMarionetterTimeline(captureScene, playableDirectorComponentInfo);
// };

// TODO: この処理はビルド時には捨てたい
const initHotReloadAndParseScene = () => {
    const hotReloadScene = () => {
        console.log('hot reload scene...');
        void fetch('./assets/data/scene-hot-reload.json').then(async (res) => {
            const sceneJson = (await res.json()) as unknown as MarionetterScene;
            // TODO: reload hot timeline
            console.log(sceneJson);
            // parseScene(sceneJson);
        });
    };
    marionetter.setHotReloadCallback(() => {
        hotReloadScene();
    });
    hotReloadScene();
};

const main = async () => {
    // playSound();

    await wait(0);

    // parseScene(sceneJsonUrl as unknown as MarionetterScene);
    console.log('====== main ======');
    console.log(import.meta.env);
    console.log(sceneJsonUrl);

    buildScene(sceneJsonUrl as unknown as MarionetterScene);

    renderer.fogPass.parameters.blendRate = 0;

    if (import.meta.env.VITE_HOT_RELOAD === 'true') {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyP':
                    console.log('===== play sound =====');
                    playSound();
                    break;
                case 'KeyS':
                    console.log('===== stop sound =====');
                    stopSound();
                    break;
            }
        });
        initMarionetter();
        initHotReloadAndParseScene();
    }

    // TODO: engine側に移譲したい
    const onWindowResize = () => {
        width = wrapperElement.offsetWidth;
        height = wrapperElement.offsetHeight;
        inputController.setSize(width, height);
        engine.setSize(width, height);
    };

    engine.onBeforeStart = () => {
        onWindowResize();
        window.addEventListener('resize', onWindowResize);
    };

    engine.onBeforeUpdate = () => {
        inputController.update();
    };

    engine.onRender = (time) => {
        if (marionetterTimeline !== null) {
            marionetterTimeline.execute(marionetter.getCurrentTime());
        }
        if (captureSceneCamera) {
            renderer.render(captureScene, captureSceneCamera, { time });
        }
    };

    const tick = (time: number) => {
        engine.run(time);
        // renderer.render(captureScene, captureSceneCamera, { time });
        requestAnimationFrame(tick);
    };

    engine.start();
    requestAnimationFrame(tick);
};

function initDebugger({ bufferVisualizerPass }: { bufferVisualizerPass: BufferVisualizerPass }) {
    debuggerGUI = new DebuggerGUI();

    //
    // play sound
    //

    debuggerGUI.addBorderSpacer();

    debuggerGUI.addButtonDebugger({
        buttonLabel: 'play sound',
        onClick: () => {
            playSound();
        },
    });

    debuggerGUI.addButtonDebugger({
        buttonLabel: 'stop sound',
        onClick: () => {
            stopSound();
        },
    });

    debuggerGUI.addSliderDebugger({
        label: 'seek sound',
        minValue: 0,
        maxValue: 180,
        stepValue: 0.01,
        initialValue: 0,
        onChange: (value) => {
            if (glslSound) {
                glslSound.play(value);
            }
        },
    });

    //
    // orbit controls
    //

    // debuggerGUI.addBorderSpacer();

    // debuggerGUI.addToggleDebugger({
    //     label: 'orbit controls enabled',
    //     // initialValue: debuggerStates.orbitControlsEnabled,
    //     // onChange: (value) => (debuggerStates.orbitControlsEnabled = value),
    //     initialValue: orbitCameraController.enabled,
    //     onChange: (value) => (orbitCameraController.enabled = value),
    // });

    //
    // show buffers
    //

    debuggerGUI.addBorderSpacer();

    debuggerGUI.addToggleDebugger({
        label: 'show buffers',
        initialValue: bufferVisualizerPass.parameters.enabled,
        onChange: (value) => (bufferVisualizerPass.parameters.enabled = value),
    });

    // bufferVisualizerPass.beforeRender = () => {
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uDirectionalLightShadowMap',
    //         directionalLight.shadowMap!.read.depthTexture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uAmbientOcclusionTexture',
    //         renderer.ambientOcclusionPass.renderTarget.read.texture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uDeferredShadingTexture',
    //         renderer.deferredShadingPass.renderTarget.read.texture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue(
    //         'uLightShaftTexture',
    //         renderer.lightShaftPass.renderTarget.read.texture
    //     );
    //     bufferVisualizerPass.material.uniforms.setValue('uFogTexture', renderer.fogPass.renderTarget.read.texture);
    // };

    //
    // ssao
    // TODO: ssao pass の参照を renderer に変える
    //

    debuggerGUI.addBorderSpacer();

    const ssaoDebuggerGroup = debuggerGUI.addGroup('ssao', false);

    ssaoDebuggerGroup.addToggleDebugger({
        label: 'ssao pass enabled',
        initialValue: renderer.ambientOcclusionPass.parameters.enabled,
        onChange: (value) => (renderer.ambientOcclusionPass.parameters.enabled = value),
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao occlusion sample length',
        minValue: 0.01,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ambientOcclusionPass.occlusionSampleLength,
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionSampleLength = value;
        },
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao occlusion bias',
        minValue: 0.0001,
        maxValue: 0.01,
        stepValue: 0.0001,
        initialValue: renderer.ambientOcclusionPass.occlusionBias,
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionBias = value;
        },
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao min distance',
        minValue: 0,
        maxValue: 0.1,
        stepValue: 0.001,
        initialValue: renderer.ambientOcclusionPass.occlusionMinDistance,
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionMinDistance = value;
        },
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao max distance',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ambientOcclusionPass.occlusionMaxDistance,
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionMaxDistance = value;
        },
    });

    ssaoDebuggerGroup.addColorDebugger({
        label: 'ssao color',
        initialValue: renderer.ambientOcclusionPass.occlusionColor.getHexCoord(),
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionColor = Color.fromHex(value);
        },
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao occlusion power',
        minValue: 0.5,
        maxValue: 4,
        stepValue: 0.01,
        initialValue: renderer.ambientOcclusionPass.occlusionPower,
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionPower = value;
        },
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao occlusion strength',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ambientOcclusionPass.occlusionStrength,
        onChange: (value) => {
            renderer.ambientOcclusionPass.occlusionStrength = value;
        },
    });

    ssaoDebuggerGroup.addSliderDebugger({
        label: 'ssao blend rate',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ambientOcclusionPass.blendRate,
        onChange: (value) => {
            renderer.ambientOcclusionPass.blendRate = value;
        },
    });

    //
    // light shaft
    //

    debuggerGUI.addBorderSpacer();

    const lightShaftDebuggerGroup = debuggerGUI.addGroup('light shaft');

    lightShaftDebuggerGroup.addToggleDebugger({
        label: 'light shaft pass enabled',
        initialValue: renderer.lightShaftPass.parameters.enabled,
        onChange: (value) => (renderer.lightShaftPass.parameters.enabled = value),
    });

    lightShaftDebuggerGroup.addSliderDebugger({
        label: 'blend rate',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.lightShaftPass.parameters.blendRate,
        onChange: (value) => {
            renderer.lightShaftPass.parameters.blendRate = value;
        },
    });

    lightShaftDebuggerGroup.addSliderDebugger({
        label: 'pass scale',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.lightShaftPass.parameters.passScaleBase,
        onChange: (value) => {
            renderer.lightShaftPass.parameters.passScaleBase = value;
        },
    });

    lightShaftDebuggerGroup.addSliderDebugger({
        label: 'ray step strength',
        minValue: 0.001,
        maxValue: 0.05,
        stepValue: 0.001,
        initialValue: renderer.lightShaftPass.parameters.rayStepStrength,
        onChange: (value) => {
            renderer.lightShaftPass.parameters.rayStepStrength = value;
        },
    });

    //
    // light shaft
    //

    debuggerGUI.addBorderSpacer();

    const fogDebuggerGroup = debuggerGUI.addGroup('fog');

    // fogDebuggerGroup.addToggleDebugger({
    //     label: 'fog pass enabled',
    //     initialValue: renderer.lightShaftPass.enabled,
    //     onChange: (value) => (renderer.lightShaftPass.enabled = value),
    // });

    // fogDebuggerGroup.addSliderDebugger({
    //     label: 'strength',
    //     minValue: 0,
    //     maxValue: 0.2,
    //     stepValue: 0.0001,
    //     initialValue: renderer.fogPass.fogStrength,
    //     onChange: (value) => {
    //         renderer.fogPass.fogStrength = value;
    //     },
    // });

    fogDebuggerGroup.addSliderDebugger({
        label: 'density',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.0001,
        initialValue: renderer.fogPass.parameters.fogDensity,
        onChange: (value) => {
            renderer.fogPass.parameters.fogDensity = value;
        },
    });

    fogDebuggerGroup.addSliderDebugger({
        label: 'attenuation',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.0001,
        initialValue: renderer.fogPass.parameters.fogDensityAttenuation,
        onChange: (value) => {
            renderer.fogPass.parameters.fogDensityAttenuation = value;
        },
    });

    // fogDebuggerGroup.addSliderDebugger({
    //     label: 'fog end height',
    //     minValue: -5,
    //     maxValue: 5,
    //     stepValue: 0.0001,
    //     initialValue: renderer.fogPass.fogEndHeight,
    //     onChange: (value) => {
    //         renderer.fogPass.fogEndHeight = value;
    //     },
    // });

    //
    // depth of field
    //

    debuggerGUI.addBorderSpacer();

    const dofDebuggerGroup = debuggerGUI.addGroup('depth of field', false);

    dofDebuggerGroup.addToggleDebugger({
        label: 'DoF pass enabled',
        initialValue: renderer.depthOfFieldPass.enabled,
        onChange: (value) => (renderer.depthOfFieldPass.enabled = value),
    });

    dofDebuggerGroup.addSliderDebugger({
        label: 'DoF focus distance',
        minValue: 0.1,
        maxValue: 100,
        stepValue: 0.001,
        initialValue: renderer.depthOfFieldPass.parameters.focusDistance,
        onChange: (value) => {
            renderer.depthOfFieldPass.parameters.focusDistance = value;
        },
    });

    dofDebuggerGroup.addSliderDebugger({
        label: 'DoF focus range',
        minValue: 0.1,
        maxValue: 20,
        stepValue: 0.001,
        initialValue: renderer.depthOfFieldPass.parameters.focusRange,
        onChange: (value) => {
            renderer.depthOfFieldPass.parameters.focusRange = value;
        },
    });

    dofDebuggerGroup.addSliderDebugger({
        label: 'DoF bokeh radius',
        minValue: 0.01,
        maxValue: 10,
        stepValue: 0.001,
        initialValue: renderer.depthOfFieldPass.parameters.bokehRadius,
        onChange: (value) => {
            renderer.depthOfFieldPass.parameters.bokehRadius = value;
        },
    });

    //
    // bloom
    //

    debuggerGUI.addBorderSpacer();

    const bloomDebuggerGroup = debuggerGUI.addGroup('bloom', false);

    bloomDebuggerGroup.addToggleDebugger({
        label: 'Bloom pass enabled',
        initialValue: renderer.bloomPass.parameters.enabled,
        onChange: (value) => (renderer.bloomPass.parameters.enabled = value),
    });

    bloomDebuggerGroup.addSliderDebugger({
        label: 'bloom amount',
        minValue: 0,
        maxValue: 4,
        stepValue: 0.001,
        initialValue: renderer.bloomPass.parameters.bloomAmount,
        onChange: (value) => {
            renderer.bloomPass.parameters.bloomAmount = value;
        },
    });

    bloomDebuggerGroup.addSliderDebugger({
        label: 'bloom threshold',
        minValue: 0,
        maxValue: 2,
        stepValue: 0.001,
        initialValue: renderer.bloomPass.parameters.threshold,
        onChange: (value) => {
            renderer.bloomPass.parameters.threshold = value;
        },
    });

    bloomDebuggerGroup.addSliderDebugger({
        label: 'bloom tone',
        minValue: 0,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.bloomPass.parameters.tone,
        onChange: (value) => {
            renderer.bloomPass.parameters.tone = value;
        },
    });

    //
    // ssr debuggers
    //

    debuggerGUI.addBorderSpacer();

    const ssrDebuggerGroup = debuggerGUI.addGroup('ssr', false);

    ssrDebuggerGroup.addToggleDebugger({
        label: 'ssr pass enabled',
        initialValue: renderer.ssrPass.parameters.enabled,
        onChange: (value) => (renderer.ssrPass.parameters.enabled = value),
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'depth bias',
        minValue: 0.001,
        maxValue: 0.1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.rayDepthBias,
        onChange: (value) => {
            renderer.ssrPass.parameters.rayDepthBias = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'ray nearest distance',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.rayNearestDistance,
        onChange: (value) => {
            renderer.ssrPass.parameters.rayNearestDistance = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'ray max distance',
        minValue: 0.001,
        maxValue: 10,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.rayMaxDistance,
        onChange: (value) => {
            renderer.ssrPass.parameters.rayMaxDistance = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'ray thickness',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionRayThickness,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionRayThickness = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'jitter size x',
        minValue: 0.001,
        maxValue: 0.1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionRayJitterSizeX,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionRayJitterSizeX = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'jitter size y',
        minValue: 0.001,
        maxValue: 0.1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionRayJitterSizeY,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionRayJitterSizeY = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'fade min distance',
        minValue: 0.001,
        maxValue: 10,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionFadeMinDistance,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionFadeMinDistance = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'fade max distance',
        minValue: 0.001,
        maxValue: 10,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionFadeMaxDistance,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionFadeMaxDistance = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'edge fade factor min x',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMinX,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMinX = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'edge fade factor max x',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMaxX,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMaxX = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'edge fade factor min y',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMinY,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMinY = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'edge fade factor max y',
        minValue: 0.001,
        maxValue: 1,
        stepValue: 0.001,
        initialValue: renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMaxY,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionScreenEdgeFadeFactorMaxY = value;
        },
    });

    ssrDebuggerGroup.addSliderDebugger({
        label: 'additional rate',
        minValue: 0.01,
        maxValue: 1,
        stepValue: 0.01,
        initialValue: renderer.ssrPass.parameters.reflectionAdditionalRate,
        onChange: (value) => {
            renderer.ssrPass.parameters.reflectionAdditionalRate = value;
        },
    });

    //
    // add debugger ui
    //

    wrapperElement.appendChild(debuggerGUI.domElement);
}

// console.log(import.meta.env);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
