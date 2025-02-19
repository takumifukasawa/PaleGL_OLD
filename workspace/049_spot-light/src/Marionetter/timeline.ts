import { curveUtilityEvaluateCurve } from '@/Marionetter/curveUtilities.ts';
import { Vector3 } from '@/PaleGL/math/Vector3.ts';
import { Actor } from '@/PaleGL/actors/Actor.ts';
import { Color } from '@/PaleGL/math/Color.ts';
import { Light } from '@/PaleGL/actors/Light.ts';
import { Scene } from '@/PaleGL/core/Scene.ts';
import { PerspectiveCamera } from '@/PaleGL/actors/PerspectiveCamera.ts';
import { Mesh } from '@/PaleGL/actors/Mesh.ts';
import { BoxGeometry } from '@/PaleGL/geometries/BoxGeometry.ts';
import { GPU } from '@/PaleGL/core/GPU.ts';
import { Material } from '@/PaleGL/materials/Material.ts';
import { GBufferMaterial } from '@/PaleGL/materials/GBufferMaterial.ts';
import { Geometry } from '@/PaleGL/geometries/Geometry.ts';
import { PlaneGeometry } from '@/PaleGL/geometries/PlaneGeometry.ts';
import { DirectionalLight } from '@/PaleGL/actors/DirectionalLight.ts';

// --------------------------------------------------------------------
// jsonのproperty名と紐づけ
// --------------------------------------------------------------------

// TODO: 短縮系を渡すようにしたい
const PROPERTY_COLOR_R = 'color.r';
const PROPERTY_COLOR_G = 'color.g';
const PROPERTY_COLOR_B = 'color.b';
const PROPERTY_COLOR_A = 'color.a';
const PROPERTY_INTENSITY = 'intensity';
// const PROPERTY_BOUNCE_INTENSITY = 'bounceIntensity';
// const PROPERTY_RANGE = 'range';

// TODO: 短縮系を渡すようにしたい
const PROPERTY_LOCAL_POSITION_X = 'm_LocalPosition.x';
const PROPERTY_LOCAL_POSITION_Y = 'm_LocalPosition.y';
const PROPERTY_LOCAL_POSITION_Z = 'm_LocalPosition.z';
const PROPERTY_LOCAL_EULER_ANGLES_RAW_X = 'localEulerAnglesRaw.x';
const PROPERTY_LOCAL_EULER_ANGLES_RAW_Y = 'localEulerAnglesRaw.y';
const PROPERTY_LOCAL_EULER_ANGLES_RAW_Z = 'localEulerAnglesRaw.z';
const PROPERTY_LOCAL_SCALE_X = 'm_LocalScale.x';
const PROPERTY_LOCAL_SCALE_Y = 'm_LocalScale.y';
const PROPERTY_LOCAL_SCALE_Z = 'm_LocalScale.z';
const PROPERTY_FIELD_OF_VIEW = 'field of view';

const PRORPERTY_MATERIAL_BASE_COLOR_R = 'material._BaseColor.r';
const PRORPERTY_MATERIAL_BASE_COLOR_G = 'material._BaseColor.g';
const PRORPERTY_MATERIAL_BASE_COLOR_B = 'material._BaseColor.b';
const PRORPERTY_MATERIAL_BASE_COLOR_A = 'material._BaseColor.a';

// --------------------------------------------------------------------

export function buildMarionetterActors(gpu: GPU, scene: MarionetterScene): Actor[] {
    const actors: Actor[] = [];
    scene.objects.forEach((obj) => {
        const { name } = obj;
        const mfComponent = obj.components.find((c) => c.type === MarionetterComponentType.MeshFilter);
        const mrComponent = obj.components.find((c) => c.type === MarionetterComponentType.MeshRenderer);
        const cameraComponent = obj.components.find((c) => c.type === MarionetterComponentType.Camera);
        const lightComponent = obj.components.find((c) => c.type === MarionetterComponentType.Light);

        let actor: Actor | null = null;

        if (mrComponent && mfComponent) {
            const meshFilter = mfComponent as MarionetterMeshFilterComponentInfo;
            const meshRenderer = mrComponent as MarionetterMeshRendererComponentInfo;

            let geometry: Geometry | null = null;
            let material: Material | null = null;

            // build geometry
            switch (meshFilter.meshName) {
                case 'Cube':
                    geometry = new BoxGeometry({ gpu });
                    break;
                case 'Quad':
                    geometry = new PlaneGeometry({ gpu });
                    break;
            }

            // build material
            switch (meshRenderer.materialName) {
                case 'Lit':
                    material = new GBufferMaterial();
                    break;
                default:
                    // TODO: fallback
                    material = new GBufferMaterial();
                    break;
            }

            if (geometry && material) {
                actor = new Mesh({ name, geometry, material });
            }
        } else if (cameraComponent) {
            const camera = cameraComponent as MarionetterCameraComponentInfo;
            if (camera.cameraType === 'Perspective') {
                actor = new PerspectiveCamera(camera.fov, 1, 0.1, 1000, name);
            } else {
                throw `[buildMarionetterActors] invalid camera type: ${camera.cameraType}`;
            }
        } else if (lightComponent) {
            // light
            const light = lightComponent as MarionetterLightComponentInfo;
            switch (light.lightType) {
                case 'Directional':
                    actor = new DirectionalLight({
                        name,
                        intensity: light.intensity,
                        color: Color.fromHex(light.color),
                    });
                    break;
                default:
                    throw `[buildMarionetterActors] invalid light type: ${light.lightType}`;
            }
        } else {
            // others
            actor = new Actor({ name });
        }

        if (actor) {
            actors.push(actor);
            actor.transform.scale = new Vector3(
                obj.transform.localScale.x,
                obj.transform.localScale.y,
                obj.transform.localScale.z
            );
            actor.transform.rotation.setV(
                new Vector3(obj.transform.localRotation.x, obj.transform.localRotation.y, obj.transform.localRotation.z)
            );
            actor.transform.position = new Vector3(
                obj.transform.localPosition.x,
                obj.transform.localPosition.y,
                obj.transform.localPosition.z
            );
        }
    });
    return actors;
}

//
// scene
//

export type MarionetterScene = {
    name: string; // shorthand: n
    objects: MarionetterObjectInfo[]; // shorthand: o
};

type MarionetterObjectInfo = {
    name: string; // shorthand: n
    transform: MarionetterTransformInfo; // shorthand: t
    components: MarionetterComponentInfoKinds[]; // shorthand: c
    children: MarionetterObjectInfo[]; // shorthand: o
};

type MarionetterTransformInfo = {
    localPosition: { x: number; y: number; z: number }; // shorthand: lp
    localRotation: { x: number; y: number; z: number }; // shorthand: lr
    localScale: { x: number; y: number; z: number }; // shorthand: ls
};

//
// track
//

const enum MarionetterTrackInfoType {
    AnimationTrac = 0,
    LightControlTrack = 1,
    ActivationControlTrack = 2,
}

type MarionetterTrackInfo = {
    targetName: string; // shorthand: tn
    type: MarionetterTrackInfoType; // shorthand: t
    clips: MarionetterClipInfoKinds[]; // shorthand: cs
};

type MarionetterClipInfoKinds = MarionetterAnimationClipInfo | MarionetterLightControlClipInfo;

const enum MarionetterClipInfoType {
    AnimationClip = 0,
    LightControlClip = 1,
    ActivationControlClip = 2,
}

type MarionetterClipInfoBase = {
    type: MarionetterClipInfoType; // shorthand: t
    start: number; // shorthand: s
    duration: number; // shorthand: d
};

type MarionetterAnimationClipInfo = MarionetterClipInfoBase & {
    offsetPosition: { x: number; y: number; z: number }; // shorthand: op
    offsetRotation: { x: number; y: number; z: number }; // shorthand: or
    bindings: MarionetterClipBinding[]; // shorthand: b
};

type MarionetterLightControlClipInfo = MarionetterClipInfoBase & {
    bindings: MarionetterClipBinding[]; // shorthand: b
};

type MarionetterActivationControlClipInfo = MarionetterClipInfoBase;

type MarionetterClipBinding = {
    propertyName: string; // short hand: n
    keyframes: MarionetterAnimationClipKeyframe[];
};

type MarionetterAnimationClipKeyframe = {
    time: number; // shorthand: t
    value: number; // shorthand: v
    inTangent: number; // shorthand: i
    outTangent: number; // shorthand: o
};

//
// components
//

type MarionetterComponentInfoBase = {
    type: MarionetterComponentType; // shorthand: t
};

// unity側に合わせる
const MarionetterComponentType = {
    PlayableDirector: 0,
    Light: 1,
    Camera: 2,
    MeshRenderer: 3,
    MeshFilter: 4,
} as const;

type MarionetterComponentType = (typeof MarionetterComponentType)[keyof typeof MarionetterComponentType];

type MarionetterComponentInfoKinds =
    | MarionetterPlayableDirectorComponentInfo
    | MarionetterLightComponentInfo
    | MarionetterCameraComponentInfo
    | MarionetterMeshRendererComponentInfo
    | MarionetterMeshFilterComponentInfo;

// unity側に合わせてcomponent情報を追加

export type MarionetterPlayableDirectorComponentInfo = MarionetterComponentInfoBase & {
    name: string; // shorthand: n
    duration: number; // shorthand: d
    tracks: MarionetterTrackInfo[]; // shorthand: ts
};

type MarionetterLightComponentInfo = MarionetterComponentInfoBase & {
    lightType: 'Directional' | 'Point' | 'Spot'; // shorthand: l
    intensity: number; // shorthand: i
    color: string; // shorthand: c, hex string
};

type MarionetterCameraComponentInfo = MarionetterComponentInfoBase & {
    cameraType: 'Perspective' | 'Orthographic'; // ct
    isMain: boolean; // shorthand: im
    fov: number; // shorthand: f
};

type MarionetterMeshRendererComponentInfo = MarionetterComponentInfoBase & {
    materialName: string; // shorthand: mn
};

type MarionetterMeshFilterComponentInfo = MarionetterComponentInfoBase & {
    meshName: string; // shorthand: mn
};

//
// timeline
//

export type MarionetterTimeline = {
    tracks: MarionetterTimelineTrack[];
    execute: (time: number) => void;
};

type MarionetterTimelineTrack = {
    targetName: string;
    // targetObj: Actor | null;
    clips: MarionetterClipKinds[];
    execute: (time: number) => void;
};

type MarionetterClipKinds = MarionetterAnimationClip | MarionetterLightControlClip | MarionetterActivationControlClip;

const enum MarionetterAnimationClipType {
    AnimationClip = 0,
    LightControlClip = 1,
    ActivationControlClip = 2,
}

type MarionetterAnimationClip = {
    type: MarionetterAnimationClipType.AnimationClip;
    clipInfo: MarionetterAnimationClipInfo;
    execute: (actor: Actor, time: number) => void;
};

type MarionetterLightControlClip = {
    type: MarionetterAnimationClipType.LightControlClip;
    clipInfo: MarionetterLightControlClipInfo;
    execute: (actor: Actor, time: number) => void;
};

type MarionetterActivationControlClip = {
    type: MarionetterAnimationClipType.ActivationControlClip;
    clipInfo: MarionetterActivationControlClipInfo;
    execute: () => void;
};

/**
 *
 * @param marionetterPlayableDirectorComponentInfo
 */
export function buildMarionetterTimeline(
    scene: Scene,
    marionetterPlayableDirectorComponentInfo: MarionetterPlayableDirectorComponentInfo
): MarionetterTimeline {
    const tracks: MarionetterTimelineTrack[] = [];

    // build track
    for (let i = 0; i < marionetterPlayableDirectorComponentInfo.tracks.length; i++) {
        const track = marionetterPlayableDirectorComponentInfo.tracks[i];
        const { targetName, clips } = track;
        const transform = scene.find(targetName);
        const targetActor = transform ? transform.actor : null;
        const marionetterClips = createMarionetterClips(clips);
        if (!targetActor) {
            console.warn(`[buildMarionetterTimeline] target actor is not found: ${targetName}`);
        }

        // exec track
        // TODO: clip間の mixer,interpolate,extrapolate の挙動が必要
        const execute = (time: number) => {
            if (track.type === MarionetterTrackInfoType.ActivationControlTrack) {
                if (targetActor != null) {
                    const clipAtTime = marionetterClips.find(
                        (clip) => clip.clipInfo.start < time && time < clip.clipInfo.start + clip.clipInfo.duration
                    );
                    if (clipAtTime) {
                        targetActor.enabled = true;
                    } else {
                        targetActor.enabled = false;
                    }
                }
            } else {
                if (targetActor != null) {
                    for (let j = 0; j < marionetterClips.length; j++) {
                        marionetterClips[j].execute(targetActor, time);
                    }
                }
            }
        };
        tracks.push({
            targetName,
            clips: marionetterClips,
            execute,
        });
    }

    // exec timeline
    const execute = (time: number) => {
        // pattern1: use frame
        // const spf = 1 / fps;
        // const frameTime = Math.floor(rawTime / spf) * spf;
        // pattern2: use raw time
        const frameTime = time % marionetterPlayableDirectorComponentInfo.duration;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].execute(frameTime);
        }
    };

    return { tracks, execute };
}

/**
 *
 * @param clips
 */
function createMarionetterClips(clips: MarionetterClipInfoKinds[]): MarionetterClipKinds[] {
    const marionetterClips = [] as MarionetterClipKinds[];

    for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        switch (clip.type) {
            case MarionetterClipInfoType.AnimationClip:
                marionetterClips.push(createMarionetterAnimationClip(clip as MarionetterAnimationClipInfo));
                break;
            case MarionetterClipInfoType.LightControlClip:
                marionetterClips.push(createMarionetterLightControlClip(clip as MarionetterLightControlClipInfo));
                break;
            case MarionetterClipInfoType.ActivationControlClip:
                marionetterClips.push(
                    createMarionetterActivationControlClip(clip as MarionetterActivationControlClipInfo)
                );
                break;
            default:
                throw new Error(`[createMarionetterClips] invalid animation clip type`);
        }
    }

    return marionetterClips;
}

/**
 *
 * @param animationClip
 */
function createMarionetterAnimationClip(animationClip: MarionetterAnimationClipInfo): MarionetterAnimationClip {
    // actorに直接valueを割り当てる関数
    const execute = (actor: Actor, time: number) => {
        let hasLocalPosition: boolean = false;
        let hasLocalRotationEuler: boolean = false;
        let hasLocalScale: boolean = false;
        const localPosition: Vector3 = Vector3.zero;
        const localRotationEuler: Vector3 = Vector3.zero;
        const localScale: Vector3 = Vector3.one;

        const { start, bindings } = animationClip;

        // TODO: typeがあった方がよい. ex) animation clip, light control clip
        bindings.forEach(({ propertyName, keyframes }) => {
            const value = curveUtilityEvaluateCurve(time - start, keyframes);

            switch (propertyName) {
                case PROPERTY_LOCAL_POSITION_X:
                    hasLocalPosition = true;
                    localPosition.x = value;
                    break;
                case PROPERTY_LOCAL_POSITION_Y:
                    hasLocalPosition = true;
                    localPosition.y = value;
                    break;
                case PROPERTY_LOCAL_POSITION_Z:
                    hasLocalPosition = true;
                    localPosition.z = value;
                    break;
                case PROPERTY_LOCAL_EULER_ANGLES_RAW_X:
                    hasLocalRotationEuler = true;
                    localRotationEuler.x = value;
                    break;
                case PROPERTY_LOCAL_EULER_ANGLES_RAW_Y:
                    hasLocalRotationEuler = true;
                    localRotationEuler.y = value;
                    break;
                case PROPERTY_LOCAL_EULER_ANGLES_RAW_Z:
                    hasLocalRotationEuler = true;
                    localRotationEuler.z = value;
                    break;
                case PROPERTY_LOCAL_SCALE_X:
                    hasLocalScale = true;
                    localScale.x = value;
                    break;
                case PROPERTY_LOCAL_SCALE_Y:
                    hasLocalScale = true;
                    localScale.y = value;
                    break;
                case PROPERTY_LOCAL_SCALE_Z:
                    hasLocalScale = true;
                    localScale.z = value;
                    break;
                case PROPERTY_FIELD_OF_VIEW:
                    (actor as PerspectiveCamera).fov = value;
                    (actor as PerspectiveCamera).updateProjectionMatrix();
                    break;
                case PRORPERTY_MATERIAL_BASE_COLOR_R:
                case PRORPERTY_MATERIAL_BASE_COLOR_G:
                case PRORPERTY_MATERIAL_BASE_COLOR_B:
                case PRORPERTY_MATERIAL_BASE_COLOR_A:
                    // TODO: GBufferMaterialとの連携？
                    break;
                default:
                    throw new Error(`[createMarionetterAnimationClip] invalid property: ${propertyName}`);
            }
        });

        if (hasLocalPosition) {
            actor.transform.position.copy(localPosition);
        }

        if (hasLocalRotationEuler) {
            actor.transform.rotation.setV(localRotationEuler);
        }

        if (hasLocalScale) {
            actor.transform.scale.copy(localScale);
        }
    };

    return {
        type: MarionetterAnimationClipType.AnimationClip,
        clipInfo: animationClip,
        // bind,
        execute,
    };
}

/**
 *
 * @param lightControlClip
 */
function createMarionetterLightControlClip(
    lightControlClip: MarionetterLightControlClipInfo
): MarionetterLightControlClip {
    // let obj: Light | null;
    // const bind = (targetObj: Light) => {
    //     obj = targetObj;
    // };
    const execute = (actor: Actor, time: number) => {
        const light = actor as Light;
        let hasPropertyColorR: boolean = false;
        let hasPropertyColorG: boolean = false;
        let hasPropertyColorB: boolean = false;
        let hasPropertyColorA: boolean = false;
        let hasPropertyIntensity: boolean = false;
        // let hasPropertyBounceIntensity: boolean = false;
        // let hasPropertyRange: boolean = false;

        const color = new Color();
        let intensity = 0;
        // let bounceIntensity = 0;
        // let range = 0;

        const { start, bindings } = lightControlClip;

        // TODO: typeがあった方がよい. ex) animation clip, light control clip
        bindings.forEach(({ propertyName, keyframes }) => {
            const value = curveUtilityEvaluateCurve(time - start, keyframes);

            switch (propertyName) {
                case PROPERTY_COLOR_R:
                    hasPropertyColorR = true;
                    color.r = value;
                    break;
                case PROPERTY_COLOR_G:
                    hasPropertyColorG = true;
                    color.g = value;
                    break;
                case PROPERTY_COLOR_B:
                    hasPropertyColorB = true;
                    color.b = value;
                    break;
                case PROPERTY_COLOR_A:
                    hasPropertyColorA = true;
                    color.a = value;
                    break;
                case PROPERTY_INTENSITY:
                    hasPropertyIntensity = true;
                    intensity = value;
                    break;
                // case PROPERTY_BOUNCE_INTENSITY:
                //     hasPropertyBounceIntensity = true;
                //     bounceIntensity = value;
                //     break;
                // case PROPERTY_RANGE:
                //     hasPropertyRange = true;
                //     range = value;
                //     break;
            }
        });

        if (hasPropertyColorR) {
            light.color.r = color.r;
        }
        if (hasPropertyColorG) {
            light.color.g = color.g;
        }
        if (hasPropertyColorB) {
            light.color.b = color.b;
        }
        if (hasPropertyColorA) {
            light.color.a = color.a;
        }
        if (hasPropertyIntensity) {
            light.intensity = intensity;
        }
        // if(hasPropertyBounceIntensity) {
        //     obj.bounceIntensity = bounceIntensity;
        // }
        // for spot light
        // if(hasPropertyRange) {
        //     obj.range = range;
        // }
    };

    return {
        type: MarionetterAnimationClipType.LightControlClip,
        clipInfo: lightControlClip,
        // bind,
        execute,
    };
}

/**
 *
 * @param lightControlClip
 */
function createMarionetterActivationControlClip(
    activationControlClip: MarionetterActivationControlClipInfo
): MarionetterActivationControlClip {
    // let obj: Light | null;
    // const bind = (targetObj: Light) => {
    //     obj = targetObj;
    // };
    // const execute = (actor: Actor, time: number) => {
    //     // const { start, duration} = activationControlClip;
    //     // console.log(start, duration, actor, time)
    // };

    return {
        type: MarionetterAnimationClipType.ActivationControlClip,
        clipInfo: activationControlClip,
        execute: () => {},
    };
}
