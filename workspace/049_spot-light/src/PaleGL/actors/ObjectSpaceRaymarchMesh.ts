import {GPU} from '@/PaleGL/core/GPU.ts';
import {PrimitiveTypes, UniformNames} from '@/PaleGL/constants.ts';
import {Mesh, MeshOptionsArgs} from '@/PaleGL/actors/Mesh.ts';
// import { UniformsData } from '@/PaleGL/core/Uniforms.ts';
import {
    ObjectSpaceRaymarchMaterial,
    ObjectSpaceRaymarchMaterialArgs,
} from '@/PaleGL/materials/ObjectSpaceRaymarchMaterial.ts';
import {BoxGeometry} from '@/PaleGL/geometries/BoxGeometry.ts';
import {Camera} from '@/PaleGL/actors/Camera.ts';
import {ActorUpdateArgs} from "@/PaleGL/actors/Actor.ts";

type ObjectSpaceRaymarchMeshArgs = {
    gpu: GPU;
    // fragmentShader: string;
    // depthFragmentShader: string;
    // uniforms?: UniformsData;
    materialArgs: ObjectSpaceRaymarchMaterialArgs;
    // receiveShadow?: boolean;
    // metallic?: number;
    // roughness?: number;
} & MeshOptionsArgs;

// NOTE: 今はbox限定. sphereも対応したい
export class ObjectSpaceRaymarchMesh extends Mesh {
    constructor(args: ObjectSpaceRaymarchMeshArgs) {
        // const { gpu, fragmentShader, depthFragmentShader, uniforms = [], castShadow } = args;
        const {gpu, materialArgs, castShadow} = args;
        const {fragmentShader, depthFragmentShader, uniforms = []} = materialArgs;
        const geometry = new BoxGeometry({gpu});
        const material = new ObjectSpaceRaymarchMaterial({
            fragmentShader,
            depthFragmentShader,
            uniforms,
            // metallic,
            // roughness,
            // receiveShadow,
            // receiveShadow: !!receiveShadow,
            primitiveType: PrimitiveTypes.Triangles,
        });

        super({geometry, material, castShadow});
    }


    update(args: ActorUpdateArgs) {
        super.update(args);

        this.material.uniforms.setValue(
            UniformNames.ObjectSpaceRaymarchBoundsScale,
            this.transform.scale
        );
        this.depthMaterial!.uniforms.setValue(
            UniformNames.ObjectSpaceRaymarchBoundsScale,
            this.transform.scale
        );
    }

    updateMaterial({camera}: { camera: Camera }) {
        super.updateMaterial({camera});
        this.mainMaterial.uniforms.setValue('uIsPerspective', camera.isPerspective() ? 1 : 0);
    }

    updateDepthMaterial({camera}: { camera: Camera }) {
        super.updateMaterial({camera});
        this.depthMaterial?.uniforms.setValue('uIsPerspective', camera.isPerspective() ? 1 : 0);
    }
}
