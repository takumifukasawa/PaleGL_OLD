import {Actor} from "../actors/Actor.js";
import {Bone} from "../core/Bone.js";
import {SkinnedMesh} from "../actors/SkinnedMesh.js";
import {Geometry} from "../geometries/Geometry.js";
import {Mesh} from "../actors/Mesh.js";
import {Vector3} from "../math/Vector3.js";
import {Matrix4} from "../math/Matrix4.js";
import {AnimationClip} from "../core/AnimationClip.js";
import {AnimationKeyframeTypes} from "../constants.js";
import {AnimationKeyframes} from "../core/AnimationKeyframes.js";
import {Quaternion} from "../math/Quaternion.js";
import {Rotator} from "../math/Rotator.js";

export async function loadGLTF({
    gpu,
    path,
}) {
    const response = await fetch(path);
    const gltf = await response.json();

    const rootActor = new Actor();

    // for debug
    console.log("[loadGLTF]", gltf);
 
    const cacheNodes = [];

    // gltf.scene ... default scene index
    // const targetScene = gltf.scenes[gltf.scene];

    // accessor の component type は gl の format と値が同じ
    // console.log('gl.BYTE', gl.BYTE); // 5120
    // console.log('gl.UNSIGNED_BYTE', gl.UNSIGNED_BYTE); // 5121
    // console.log('gl.SHORT', gl.SHORT); // 5122
    // console.log('gl.UNSIGNED_SHORT', gl.UNSIGNED_SHORT); // 5123
    // console.log('gl.INT', gl.INT); // 5124
    // console.log('gl.UNSIGNED_INT', gl.UNSIGNED_INT); // 5125
    // console.log('gl.FLOAT', gl.FLOAT); // 5126    

    const binBufferDataList = await Promise.all(gltf.buffers.map(async (buffer) => {
        // NOTE: buffer = { byteLength, uri }
        const binResponse = await fetch(buffer.uri);
        const binBufferData = await binResponse.arrayBuffer();
        return {byteLength: buffer.byteLength, binBufferData};
    }));

    const getBufferData = (accessor) => {
        const bufferView = gltf.bufferViews[accessor.bufferView];
        const {binBufferData} = binBufferDataList[bufferView.buffer];
        const slicedBuffer = binBufferData.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);
        return slicedBuffer;
    }
    
    const createBone = (nodeIndex, parentBone) => {
        const node = gltf.nodes[nodeIndex];
        // NOTE:
        // - nodeのindexを入れちゃう。なので数字が0始まりじゃないかつ飛ぶ場合がある
        const bone = new Bone({name: node.name, index: nodeIndex});
        cacheNodes[nodeIndex] = bone;
       
        // use basic mul
        // const offsetMatrix = Matrix4.multiplyMatrices(
        //     node.translation ? Matrix4.translationMatrix(new Vector3(...node.translation)) : Matrix4.identity,
        //     node.rotation ? Matrix4.fromQuaternion(new Quaternion(...node.rotation)) : Matrix4.identity,
        //     node.scale ? Matrix4.scalingMatrix(new Vector3(...node.scale)) : Matrix4.identity
        // );
        // use trs
        const offsetMatrix = Matrix4.fromTRS(
            node.translation ? new Vector3(...node.translation) : Vector3.zero,
            node.rotation ? Rotator.fromQuaternion(new Quaternion(...node.rotation)) : new Rotator(0, 0, 0),
            node.scale ? new Vector3(...node.scale) : Vector3.one
        );
        bone.offsetMatrix = offsetMatrix;
        
        if (parentBone) {
            parentBone.addChild(bone);
        }
        if (node.children) {
            node.children.forEach(childNodeIndex => createBone(childNodeIndex, bone));
        }

        return bone;
    };

    const createMesh = ({nodeIndex, meshIndex, skinIndex = null}) => {
        let positions = null;
        let normals = null;
        let tangents = null;
        let binormals = null;
        let uvs = null;
        let indices = null;
        let joints = null;
        let weights = null;
        let rootBone = null;

        console.log(`[loadGLTF.createMesh] mesh index: ${meshIndex}, skin index: ${skinIndex}`);

        const mesh = gltf.meshes[meshIndex];

        mesh.primitives.forEach(primitive => {
            const meshAccessors = {
                attributes: [],
                indices: null
            }
            Object.keys(primitive.attributes).forEach(attributeName => {
                const accessorIndex = primitive.attributes[attributeName];
                meshAccessors.attributes.push({attributeName, accessor: gltf.accessors[accessorIndex]});
            });
            if (primitive.indices) {
                meshAccessors.indices = {accessor: gltf.accessors[primitive.indices]};
            }

            meshAccessors.attributes.forEach(attributeAccessor => {
                const {attributeName, accessor} = attributeAccessor;
                const bufferData = getBufferData(accessor);
                switch (attributeName) {
                    case "POSITION":
                        positions = new Float32Array(bufferData);
                        break;
                    case "NORMAL":
                        normals = new Float32Array(bufferData);
                        break;
                    case "TANGENT":
                        tangents = new Float32Array(bufferData);
                        break;
                    case "TEXCOORD_0":
                        uvs = new Float32Array(bufferData);
                        break;
                    case "JOINTS_0":
                        // データはuint8だけど、頂点にはuint16で送る
                        joints = new Uint16Array(new Uint8Array(bufferData));
                        break;
                    case "WEIGHTS_0":
                        weights = new Float32Array(bufferData);
                        break;
                    default:
                        throw "[loadGLTF.createMesh] invalid attribute name";
                }
            });
            if (meshAccessors.indices) {
                const { accessor } = meshAccessors.indices;
                const bufferData = getBufferData(accessor);
                indices = new Uint16Array(bufferData);
            }
        });

        if (skinIndex !== null) {
            console.log("[loadGLTF.createMesh] mesh has skin");

            const skin = gltf.skins[skinIndex];

            // NOTE: joints の 0番目が常に root bone のはず？
            rootBone = createBone(skin.joints[0]);
        }
       
        // GLTF2.0は、UV座標の原点が左上にある。しかし左下を原点とした方が分かりやすい気がしているのでYを反転
        // - uvは2次元前提で処理している
        // ref: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#images
        const uvFlippedY = uvs.map((elem, i) => i % 2 === 0 ? elem : 1. - elem);
       
        if(tangents) {
            binormals = Geometry.createBinormals(normals, tangents);
        } else {
            const d = Geometry.createTangentsAndBinormals(normals);
            tangents = d.tangents;
            binormals = d.binormals;
        }

        // for debug
        // console.log("======================================")
        // console.log("root bone", rootBone)
        // console.log(positions, uvFlippedY, normals, joints, weights)
        // console.log(tangents, binormals)
        // console.log("======================================")

        const geometry = new Geometry({
            gpu,
            attributes: [
                {
                    name: "aPosition",
                    data: positions,
                    size: 3,
                }, {
                    name: "aUv",
                    data: uvFlippedY,
                    size: 2
                }, {
                    name: "aNormal",
                    data: normals,
                    size: 3
                },
                // bone があるならjointとweightもあるはず
                ...(rootBone ? [
                    {
                        name: "aBoneIndices",
                        data: joints,
                        size: 4
                    }, {
                        name: "aBoneWeights",
                        data: weights,
                        size: 4
                    },
                ] : []),               
                // TODO: tangent, binormal がいらない場合もあるのでオプションを作りたい
                {
                    name: "aTangent",
                    data: new Float32Array(tangents),
                    size: 3
                }, {
                    name: "aBinormal",
                    data: new Float32Array(binormals),
                    size: 3
                },
            ],
            indices,
            drawCount: indices.length
        });
        
        return rootBone
            ? new SkinnedMesh({ geometry, bones: rootBone })
            : new Mesh({ geometry })
    }

    const findNode = (nodeIndex, parentActor) => {
        const targetNode = gltf.nodes[nodeIndex];
        
        // for debug
        // console.log("[loadGLTF.findNode] target node", targetNode);
        
        const hasChildren = targetNode.hasOwnProperty("children");
        const hasMesh = targetNode.hasOwnProperty("mesh");
        
        // mesh actor
        if (hasMesh) {
            // TODO: fix multi mesh
            const meshActor = createMesh({
                nodeIndex,
                meshIndex: targetNode.mesh,
                skinIndex: targetNode.hasOwnProperty("skin") ? targetNode.skin : null
            });
            cacheNodes[nodeIndex] = meshActor;
            
            parentActor.addChild(meshActor);
            
            if (hasChildren) {
                targetNode.children.forEach(child => findNode(child, meshActor));
            }
            
            return;
        }
       
        // TODO: meshがない時、boneなのかnull_actorなのかの判別がついてない
        if (hasChildren) {
            if(!!cacheNodes[nodeIndex]) {
                targetNode.children.forEach(child => findNode(child, parentActor));
            } else {
                const anchorActor = new Actor();
                parentActor.addChild(anchorActor);
                cacheNodes[nodeIndex] = anchorActor;
                targetNode.children.forEach(child => findNode(child, anchorActor));
            }
        }
    }

    gltf.scenes.forEach(scene => {
        scene.nodes.forEach(node => {
            findNode(node, rootActor)
        });
    });
    
    const createAnimationClips = () => {
        return gltf.animations.map(animation => {
            const keyframes = animation.channels.map(channel => {
                const sampler = animation.samplers[channel.sampler];
                const inputAccessor = gltf.accessors[sampler.input];
                const inputBufferData = getBufferData(inputAccessor);
                const inputData = new Float32Array(inputBufferData);
                const outputAccessor = gltf.accessors[sampler.output];
                const outputBufferData = getBufferData(outputAccessor);
                const outputData = new Float32Array(outputBufferData);
                let elementSize;
                switch(channel.target.path) {
                    case "translation":
                    case "scale":
                        elementSize = 3;
                        break;
                    case "rotation":
                        elementSize = 4;
                        break;
                    default:
                        throw "invalid key type";
                }
                
                let animationKeyframeType;
                switch(channel.target.path) {
                    case "rotation":
                        animationKeyframeType = AnimationKeyframeTypes.Quaternion;
                        break;
                    case "translation":
                    case "scale":
                        animationKeyframeType = AnimationKeyframeTypes.Vector3;
                        break;
                    default:
                        throw "invalid channel taget path";
                }
                
                const animationKeyframes = new AnimationKeyframes({
                    target: cacheNodes[channel.target.node],
                    key: channel.target.path,
                    interpolation: sampler.interpolation,
                    // type: outputAccessor.type,
                    data: outputData,
                    start: inputAccessor.min,
                    end: inputAccessor.max,
                    frames: inputData,
                    frameCount: inputAccessor.count,
                    // elementSize,
                    type: animationKeyframeType
                });
                return animationKeyframes;
                // animationClip.addAnimationKeyframes(animationKeyframes);
            });
            const animationClip = new AnimationClip({ 
                name: animation.name,
                keyframes
            });
            return animationClip;
        });
    }

    // for debug
    // console.log("------------")
    // console.log("cache nodes", cacheNodes)

    if(gltf.animations && gltf.animations.length > 0) {
        console.log("[loadGLTF] has animations");
        const animationClips = createAnimationClips();
        // for debug
        // console.log("animation clips", animationClips);
        rootActor.animator.setAnimationClips(animationClips);
    }

    // for debug
    // console.log("root actor", rootActor);
    // console.log("------------")

    return rootActor;
}

