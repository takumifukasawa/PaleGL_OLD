﻿
export async function loadObj(path) {
    const response = await fetch(path);
    const content = await response.text();
    
    const rawPositions = [];
    const rawNormals = [];
    const rawUvs = [];
    const rawFaces = [];
   
    // for debug
    // console.log(content);
    
    const lines = content.split("\n");
    lines.forEach(line => {
        const elements = line.split(" ");
        const header = elements[0];
        switch(header) {
            // ------------------------------------------------------------------------------
            // # format position
            // v x y z [,w]
            // ------------------------------------------------------------------------------
            case "v":
                rawPositions.push([
                    Number.parseFloat(elements[1]),
                    Number.parseFloat(elements[2]),
                    Number.parseFloat(elements[3]),
                ]);
                break;
            // ------------------------------------------------------------------------------
            // # format normal. normal is may not be normalized
            // vn x y z
            // ------------------------------------------------------------------------------
            case "vn":
                rawNormals.push([
                    Number.parseFloat(elements[1]),
                    Number.parseFloat(elements[2]),
                    Number.parseFloat(elements[3]),
                ]);
                break;
            // ------------------------------------------------------------------------------
            // # format uv
            // vt u v [,w]
            // ------------------------------------------------------------------------------
            case "vt":
                rawUvs.push([
                    Number.parseFloat(elements[1]),
                    Number.parseFloat(elements[2]),
                ]);
                break;
            // ------------------------------------------------------------------------------
            // # format face indices
            //
            // - pattern_1: has position
            // f p_index p_index p_index
            //
            // - pattern_2: has position and uv
            // f p_index/uv_index p_index/uv_index p_index/uv_index
            //
            // - pattern_3: has position, uv and normal
            // f p_index/uv_index/n_index p_index/uv_index/n_index p_index/uv_index/n_index
            // ------------------------------------------------------------------------------
            case "f":
                rawFaces.push([
                    elements[1],
                    elements[2],
                    elements[3],
                ]);
                break;
        }
    });
    
    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];
   
    // TODO: uv, normal がない時の対処
    rawFaces.forEach((face, i) => {
        const v0 = face[0].split("/");
        const v1 = face[1].split("/");
        const v2 = face[2].split("/");
        
        // should offset -1 because face indices begin 1
        
        const p0Index = Number.parseInt(v0[0], 10) - 1;
        const uv0Index = Number.parseInt(v0[1], 10) - 1;
        const normal0Index = Number.parseInt(v0[2], 10) - 1;
        
        const p1Index = Number.parseInt(v1[0], 10) - 1;
        const uv1Index = Number.parseInt(v1[1], 10) - 1;
        const normal1Index = Number.parseInt(v1[2], 10) - 1;
        
        const p2Index = Number.parseInt(v2[0], 10) - 1;
        const uv2Index = Number.parseInt(v2[1], 10) - 1;
        const normal2Index = Number.parseInt(v2[2], 10) - 1;
        
        positions.push(
            rawPositions[p0Index],
            rawPositions[p1Index],
            rawPositions[p2Index]
        );
        
        uvs.push(
            rawUvs[uv0Index],
            rawUvs[uv1Index],
            rawUvs[uv2Index]
        );
        
        normals.push(
            rawNormals[normal0Index],
            rawNormals[normal1Index],
            rawNormals[normal2Index]
        );
       
        const offset = i * 2;
        indices.push(
            i + offset,
            i + offset + 1,
            i + offset + 2
        );
    });
   
    // return array each vertex
    // # positions
    // [ [p0.x, p0.y, p0.z], [p1.x, p1.y, p1.z]... ]
    // # uvs
    // [ [uv0.x, uv0.y], [uv1.x, uv1.y]... ]
    // # normals
    // [ [n0.x, n0.y, n0.z], [n1.x, n1.y, n1.z]... ]
    //
    // return flatten indices
    // # indices
    // [ indices0, indices1, indices2... ]
    return {
        positions,
        uvs,
        normals,
        indices
    }
}