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
        // - indexをふり直しても良い
        const bone = new Bone({name: node.name, index: nodeIndex});
        cacheNodes[nodeIndex] = bone;
      
        // TODO: fix initial pose matrix
        const offsetMatrix = Matrix4.multiplyMatrices(
            node.translation ? Matrix4.translationMatrix(new Vector3(...node.translation)) : Matrix4.identity(),
            node.rotation ? Matrix4.fromQuaternion(new Quaternion(...node.rotation)) : Matrix4.identity(),
            node.scale ? Matrix4.scalingMatrix(new Vector3(...node.scale)) : Matrix4.identity()
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
                // NOTE: accessor = {buffer, byteLength, byteOffset, target }
                // const bufferView = gltf.bufferViews[accessor.bufferView];
                // const {binBufferData} = binBufferDataList[bufferView.buffer];
                // const slicedBuffer = binBufferData.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);
                // const data = new Float32Array(slicedBuffer);
                const bufferData = getBufferData(accessor);
                switch (attributeName) {
                    case "POSITION":
                        positions = new Float32Array(bufferData);
                        break;
                    case "NORMAL":
                        normals = new Float32Array(bufferData);
                        break;
                    case "TEXCOORD_0":
                        uvs = new Float32Array(bufferData);
                        break;
                    case "JOINTS_0":
                        joints = new Uint8Array(bufferData);
                        // joints = new Float32Array(bufferData);
                        break;
                    case "WEIGHTS_0":
                        weights = new Float32Array(bufferData);
                        break;
                    default:
                        throw "[loadGLTF] invalid attribute name";
                }
            });
            if (meshAccessors.indices) {
                const {attributeName, accessor} = meshAccessors.indices;
                // NOTE: accessor = {buffer, byteLength, byteOffset, target }
                // const bufferView = gltf.bufferViews[accessor.bufferView];
                // const {binBufferData} = binBufferDataList[bufferView.buffer];
                // const slicedBuffer = binBufferData.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength);
                // indices = new Uint16Array(slicedBuffer);
                const bufferData = getBufferData(accessor);
                indices = new Uint16Array(bufferData);
            }
        });

        if (skinIndex !== null) {
            console.log("[loadGLTF.createMesh] mesh has skin");
            // gltf.skins
            const skin = gltf.skins[skinIndex];

            // NOTE: joints の 0番目が常に root bone のはず？
            rootBone = createBone(skin.joints[0]);

            // TODO: skinning mesh 側でやるべき？
            // rootBone.calcBoneOffsetMatrix();
            // rootBone.calcJointMatrix();
        }
       
        // GLTF2.0は、UV座標の原点が左上にある。しかし左下を原点とした方が分かりやすい気がしているのでYを反転
        // - uvは2次元前提で処理している
        // ref: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#images
        const uvFlippedY = uvs.map((elem, i) => i % 2 === 0 ? elem : 1. - elem);
        
        const { tangents, binormals } = Geometry.createTangentsAndBinormals(normals);

        // for debug
        // console.log("======================================")
        // console.log("root bone", rootBone)
        // console.log(positions, uvFlippedY, normals, joints, weights)
        // console.log(tangents, binormals)
        // console.log("======================================")

        const geometry = new Geometry({
            gpu,
            attributes: {
                position: {
                    data: positions,
                    size: 3,
                },
                uv: {
                    data: uvFlippedY,
                    size: 2
                },
                normal: {
                    data: normals,
                    size: 3
                },
                // bone があるならjointとweightもあるはず
                ...(rootBone ? {
                    boneIndices: {
                        data: joints,
                        size: 4
                    },
                    boneWeights: {
                        data: weights,
                        size: 4
                    },
                } : {}),               
                tangent: {
                    data: tangents,
                    size: 3
                },
                binormal: {
                    data: binormals,
                    size: 3
                },
            },
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

    console.log("------------")
    console.log("cache nodes", cacheNodes)

    if(gltf.animations && gltf.animations.length > 0) {
        const animationClips = createAnimationClips();
        console.log("animation clips", animationClips);
        rootActor.animator.setAnimationClips(animationClips);
        // rootActor.animationClips = ;
    }

    console.log("root actor", rootActor);
    console.log("------------")

    // console.log(rootActor)

    return rootActor;

    // const data = {
    //     positions: mesh.positions,
    //     normals: mesh.normals,
    //     uvs: mesh.uvs,
    //     indices: mesh.indices
    // }

    // // for debug
    // // console.log(data)
    // 
    // return data;
}

