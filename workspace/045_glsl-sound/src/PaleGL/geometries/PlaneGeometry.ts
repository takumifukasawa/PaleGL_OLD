﻿import { Geometry } from '@/PaleGL/geometries/Geometry';
import { AttributeNames } from '@/PaleGL/constants';
import { Attribute } from '@/PaleGL/core/Attribute';
import { GPU } from '@/PaleGL/core/GPU';

export function createPlaneGeometryRawData({ calculateTangent = false, calculateBinormal = false } = {}) {
    // -----------------------------
    // 0 ---- 2
    // |    / |
    // |   /  |
    // |  /   |
    // | /    |
    // 1 ---- 3
    // -----------------------------

    const normalsRaw = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    
    const positions = new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]);
    const uvs =  new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]);
    const normals =  new Float32Array(normalsRaw);

    let tangents: Float32Array = new Float32Array();
    let binormals: Float32Array = new Float32Array();
   
    if(calculateTangent || calculateBinormal) {
        const tbs = Geometry.createTangentsAndBinormals(normalsRaw);
        if(calculateTangent)
        {
            tangents = new Float32Array(tbs.tangents);
        }
        if(calculateBinormal)
        {
            binormals = new Float32Array(tbs.binormals);
        }
    }

    return {
        positions,
        uvs,
        normals,
        tangents,
        binormals,
        indices: [0, 1, 2, 2, 1, 3],
        drawCount: 6,
    };
}


export function createPlaneGeometryData({ calculateTangent = false, calculateBinormal = false } = {}) {
    // -----------------------------
    // 0 ---- 2
    // |    / |
    // |   /  |
    // |  /   |
    // | /    |
    // 1 ---- 3
    // -----------------------------

    const rawData = createPlaneGeometryRawData({ calculateTangent, calculateBinormal });
    
    // const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    //const { tangents, binormals } = Geometry.createTangentsAndBinormals(normals);

    // TODO: uniqでfilter
    const attributes = [
        new Attribute({
            name: AttributeNames.Position,
            // data: new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]),
            data: rawData.positions,
            size: 3,
        }),
        new Attribute({
            name: AttributeNames.Uv,
            // data: new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]),
            data: rawData.uvs,
            size: 2,
        }),
        new Attribute({
            name: AttributeNames.Normal,
            // data: new Float32Array(normals),
            data: rawData.normals,
            size: 3,
        }),
    ];

    if (calculateTangent) {
        attributes.push(
            new Attribute({
                name: AttributeNames.Tangent,
                // data: new Float32Array(tangents),
                data: rawData.tangents,
                size: 3,
            })
        );
    }
    if (calculateBinormal) {
        attributes.push(
            new Attribute({
                name: AttributeNames.Binormal,
                // data: new Float32Array(binormals),
                data: rawData.binormals,
                size: 3,
            })
        );
    }

    return {
        attributes,
        indices: [0, 1, 2, 2, 1, 3],
        drawCount: 6,
    };
}

export class PlaneGeometry extends Geometry {
    constructor({
        gpu,
        calculateTangent = false,
        calculateBinormal = false,
    }: {
        gpu: GPU;
        calculateTangent?: boolean;
        calculateBinormal?: boolean;
    }) {
        const { attributes, indices, drawCount } = createPlaneGeometryData({
            calculateTangent,
            calculateBinormal,
        });

        super({
            gpu,
            attributes,
            indices,
            drawCount,
        });
    }
}
