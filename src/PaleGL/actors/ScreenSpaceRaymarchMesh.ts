import { GPU } from '@/PaleGL/core/GPU.ts';
import {
    PRAGMA_RAYMARCH_SCENE,
    PrimitiveTypes,
    UniformBlockNames,
    UniformNames,
    UniformTypes,
} from '@/PaleGL/constants.ts';
import { Mesh } from '@/PaleGL/actors/Mesh.ts';
import { PlaneGeometry } from '@/PaleGL/geometries/PlaneGeometry.ts';
import { UniformsData } from '@/PaleGL/core/Uniforms.ts';
import {
    ScreenSpaceRaymarchMaterial,
    ScreenSpaceRaymarchMaterialArgs,
} from '@/PaleGL/materials/ScreenSpaceRaymarchMaterial.ts';
import { PostProcessPassBase } from '@/PaleGL/postprocess/PostProcessPassBase.ts';
import { Vector3 } from '@/PaleGL/math/Vector3.ts';
import { Camera } from '@/PaleGL/actors/Camera.ts';
import { MaterialArgs } from '@/PaleGL/materials/Material.ts';
import { gbufferScreenSpaceRaymarchDepthFragmentTemplate } from '@/PaleGL/shaders/templates/gbuffer-screen-space-raymarch-depth-fragment-template.ts';
import { litScreenSpaceRaymarchFragmentTemplate } from '@/PaleGL/shaders/templates/lit-screen-space-raymarch-fragment-template.ts';
import { Geometry } from '@/PaleGL/geometries/Geometry.ts';

type ScreenSpaceRaymarchMeshArgs = {
    gpu: GPU;
    name?: string;
    geometry?: Geometry;
    uniforms?: UniformsData;
    fragmentShaderTemplate?: string;
    fragmentShaderContent: string;
    depthFragmentShaderTemplate?: string;
    depthFragmentShaderContent: string;
    materialArgs: ScreenSpaceRaymarchMaterialArgs;
} & MaterialArgs;

export class ScreenSpaceRaymarchMesh extends Mesh {
    constructor(args: ScreenSpaceRaymarchMeshArgs) {
        const { gpu, name = '', uniforms = [], materialArgs } = args;

        const mergedUniforms: UniformsData = [
            {
                name: UniformNames.ViewDirection,
                type: UniformTypes.Vector3,
                value: Vector3.zero,
            },
            ...uniforms,
            ...PostProcessPassBase.commonUniforms,
        ];

        const fragmentShader = (args.fragmentShaderTemplate ?? litScreenSpaceRaymarchFragmentTemplate).replace(
            PRAGMA_RAYMARCH_SCENE,
            args.fragmentShaderContent
        );
        const depthFragmentShader = (
            args.depthFragmentShaderTemplate ?? gbufferScreenSpaceRaymarchDepthFragmentTemplate
        ).replace(PRAGMA_RAYMARCH_SCENE, args.depthFragmentShaderContent);

        // NOTE: geometryは親から渡して使いまわしてもよい
        const geometry = args.geometry ?? new PlaneGeometry({ gpu });
        const material = new ScreenSpaceRaymarchMaterial({
            ...materialArgs,
            // overrides
            fragmentShader,
            depthFragmentShader,
            uniforms: mergedUniforms,
            // receiveShadow: !!receiveShadow,
            primitiveType: PrimitiveTypes.Triangles,
            uniformBlockNames: [UniformBlockNames.Timeline],
        });

        super({ name, geometry, material });
    }

    setSize(width: number, height: number) {
        super.setSize(width, height);
        this.mainMaterial.uniforms.setValue(UniformNames.TargetWidth, width);
        this.mainMaterial.uniforms.setValue(UniformNames.TargetHeight, height);
    }

    updateMaterial(args: { camera: Camera }) {
        super.updateMaterial(args);

        // const { camera } = args;

        // this.mainMaterial.uniforms.setValue(UniformNames.ViewDirection, camera.getWorldForward());
        // this.mainMaterial.uniforms.setValue(UniformNames.TargetWidth, width);
        // this.mainMaterial.uniforms.setValue(UniformNames.TargetHeight, height);

        // // TODO: orthographic対応
        // if (camera.isPerspective()) {
        //     const perspectiveCamera = camera as PerspectiveCamera;
        //     this.setUniformValueToAllMaterials(UniformNames.CameraAspect, perspectiveCamera.aspect);
        //     this.setUniformValueToAllMaterials(UniformNames.CameraFov, perspectiveCamera.fov);
        // }
    }

    updateDepthMaterial({ camera }: { camera: Camera }) {
        super.updateDepthMaterial({ camera });
        // if (camera.isPerspective()) {
        //     const perspectiveCamera = camera as PerspectiveCamera;
        //     this.setUniformValueToAllMaterials(UniformNames.CameraAspect, perspectiveCamera.aspect);
        //     this.setUniformValueToAllMaterials(UniformNames.CameraFov, perspectiveCamera.fov);
        // }
    }
}
