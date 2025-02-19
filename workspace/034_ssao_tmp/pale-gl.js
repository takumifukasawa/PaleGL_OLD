﻿class Vector3 {
    elements;
    
    get x() {
        return this.elements[0];
    }

    get y() {
        return this.elements[1];
    }

    get z() {
        return this.elements[2];
    }
    
    set x(value) {
        this.elements[0] = value;
    }

    set y(value) {
        this.elements[1] = value;
    }

    set z(value) {
        this.elements[2] = value;
    }

    get magnitude() {
        const eps = 0.0001;
        return Math.max(eps, Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
    }

    constructor(x, y, z) {
        this.set(x, y, z);
    }
    
    set(x, y, z) {
        this.elements = new Float32Array([x, y, z]);
        return this;
    }
    
    normalize() {
        // const eps = 0.0001;
        // const length = Math.max(eps, Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
        const mag = this.magnitude;
        this.x = this.x / mag;
        this.y = this.y / mag;
        this.z = this.z / mag;
        return this;
    }
    
    add(s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    }
    
    negate() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
    }
    
    scale(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }
    
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    
    multiplyMatrix4(m) {
        const tmpX = this.x;
        const tmpY = this.y;
        const tmpZ = this.z;
        const tmpW = 1;
        const x = m.m00 * tmpX + m.m01 * tmpY + m.m02 * tmpZ + m.m03 * tmpW;
        const y = m.m10 * tmpX + m.m11 * tmpY + m.m12 * tmpZ + m.m13 * tmpW;
        const z = m.m20 * tmpX + m.m21 * tmpY + m.m22 * tmpZ + m.m23 * tmpW;
        const w = m.m30 * tmpX + m.m31 * tmpY + m.m32 * tmpZ + m.m33 * tmpW;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    
    equals(v) {
        const eps = 0.0000001;
        const flag = 
            Math.abs(this.x - v.x) < eps &&
            Math.abs(this.y - v.y) < eps &&
            Math.abs(this.z - v.z) < eps;
        return flag;
    }
    
    static get zero() {
        return new Vector3(0, 0, 0);
    }

    static get one() {
        return new Vector3(1, 1, 1);
    }
    
    static get up() {
        return new Vector3(0, 1, 0);
    }
    
    static get down() {
        return new Vector3(0, -1, 0);
    }
    
    static get back() {
        return new Vector3(0, 0, -1);
    }
    
    static get forward() {
        return new Vector3(0, 0, 1);
    }
    
    static get right() {
        return new Vector3(1, 0, 0);
    }

    static get left() {
        return new Vector3(-1, 0, 0);
    }
    
    static fromArray(arr) {
        return new Vector3(arr[0], arr[1], arr[2]);
    }
    
    static addVectors(...vectors) {
        const v = Vector3.zero;
        vectors.forEach(elem => {
            v.x += elem.x;
            v.y += elem.y;
            v.z += elem.z;
        });
        return v;
    }
    
    static subVectors(v1, v2) {
        return new Vector3(
            v1.x - v2.x,
            v1.y - v2.y,
            v1.z - v2.z
        );
    }
   
    // v1 x v2
    static crossVectors(v1, v2) {
        return new Vector3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        );
    }

    static rotateVectorX(v, degree) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        const rad = degree / 180 * Math.PI;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const rx = x;
        const ry = y * c + z * -s;
        const rz = y * s + z * c;
        return new Vector3(rx, ry, rz);
    }
    
    static rotateVectorY(v, degree) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        const rad = degree / 180 * Math.PI;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const rx = x * c + z * s;
        const ry = y;
        const rz = x * -s + z * c;
        return new Vector3(rx, ry, rz);
    }
    
    static rotateVectorZ(v, degree) {
        const x = v.x;
        const y = v.y;
        const z = v.z;
        const rad = degree / 180 * Math.PI;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const rx = x * c + y * -s;
        const ry = x * s + y * s;
        const rz = z;
        return new Vector3(rx, ry, rz);
    }
 
    // TODO: かなり簡易的なtangentで正確ではないのでちゃんと生成する
    static getTangent(n) {
        if(n.equals(Vector3.up)) {
            return Vector3.right;
        }
        if(n.equals(Vector3.down)) {
            return Vector3.right;
        }
        return Vector3.crossVectors(n, Vector3.down);
    }

    static getBinormalFromTangent(t, n) {
        return Vector3.crossVectors(t, n.clone().negate());
    }
    
    static fill(value) {
        return new Vector3(value, value, value);
    }
    
    static lerpVectors(v1, v2, r) {
        return new Vector3(
            v1.x + (v2.x - v1.x) * r,
            v1.y + (v2.y - v1.y) * r,
            v1.z + (v2.z - v1.z) * r
        );
    }
    
    log() {
        console.log(`--------------------
${this.x}, ${this.y}, ${this.z}
--------------------`);       
    }
}
﻿

// memory layout is column order.
// setter and getter are row order.
// (num) ... element index
// m00(0), m01(4), m02(8), m03(12),
// m10(1), m11(5), m12(9), m13(13),
// m20(2), m21(6), m22(10), m23(14),
// m30(3), m31(7), m32(11), m33(15),

class Matrix4 {
    elements;
    
    get m00() {
        return this.elements[0];
    }
    
    get m01() {
        return this.elements[4];
    }
    
    get m02() {
        return this.elements[8];
    }
    
    get m03() {
        return this.elements[12];
    }

    get m10() {
        return this.elements[1];
    }

    get m11() {
        return this.elements[5];
    }

    get m12() {
        return this.elements[9];
    }

    get m13() {
        return this.elements[13];
    }
    
    get m20() {
        return this.elements[2];
    }

    get m21() {
        return this.elements[6];
    }

    get m22() {
        return this.elements[10];
    }

    get m23() {
        return this.elements[14];
    }

    get m30() {
        return this.elements[3];
    }

    get m31() {
        return this.elements[7];
    }

    get m32() {
        return this.elements[11];
    }

    get m33() {
        return this.elements[15];
    }
    
    set m00(value) {
        this.elements[0]= value;
    }

    set m01(value) {
        this.elements[4]= value;
    }

    set m02(value) {
        this.elements[8]= value;
    }

    set m03(value) {
        this.elements[12]= value;
    }

    set m10(value) {
        this.elements[1]= value;
    }

    set m11(value) {
        this.elements[5]= value;
    }

    set m12(value) {
        return this.elements[9]= value;
    }

    set m13(value) {
        return this.elements[13]= value;
    }

    set m20(value) {
        return this.elements[2]= value;
    }

    set m21(value) {
        return this.elements[6]= value;
    }

    set m22(value) {
        return this.elements[10]= value;
    }

    set m23(value) {
        return this.elements[14]= value;
    }

    set m30(value) {
        return this.elements[3]= value;
    }

    set m31(value) {
        return this.elements[7]= value;
    }

    set m32(value) {
        return this.elements[11]= value;
    }

    set m33(value) {
        return this.elements[15]= value;
    }
    
    get position() {
        return new Vector3(this.m03, this.m13, this.m23);
    }
    
    constructor(
        n00, n01, n02, n03,
        n10, n11, n12, n13,
        n20, n21, n22, n23,
        n30, n31, n32, n33,
        // m00 = 0, m01 = 0, m02 = 0, m03 = 0,
        // m10 = 0, m11 = 0, m12 = 0, m13 = 0,
        // m20 = 0, m21 = 0, m22 = 0, m23 = 0,
        // m30 = 0, m31 = 0, m32 = 0, m33 = 0,
    ) {
        this.set(
            n00, n01, n02, n03,
            n10, n11, n12, n13,
            n20, n21, n22, n23,
            n30, n31, n32, n33
        );
    }

    // row-order in constructor args
    set(
        n00, n01, n02, n03,
        n10, n11, n12, n13,
        n20, n21, n22, n23,
        n30, n31, n32, n33,
    ) {
        this.elements = new Float32Array([
           n00, n10, n20, n30,
           n01, n11, n21, n31,
           n02, n12, n22, n32,
           n03, n13, n23, n33
        ]);
        return this;
    }

    static get identity() {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        );
    }
    
    setTranslation(v) {
        this.m03 = v.x;
        this.m13 = v.y;
        this.m23 = v.z;
        return this;
    }
    
    static translationMatrix(v) {
        return new Matrix4(
            1, 0, 0, v.x,
            0, 1, 0, v.y,
            0, 0, 1, v.z,
            0, 0, 0, 1
        );
    }
    
    static scalingMatrix(v) {
        return new Matrix4(
            v.x, 0, 0, 0,
            0, v.y, 0, 0,
            0, 0, v.z, 0,
            0, 0, 0, 1
        );
    }
    
    static rotationXMatrix(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Matrix4(
            1, 0, 0, 0, 
            0, c, -s, 0, 
            0, s, c, 0, 
            0, 0, 0, 1
        );
    }
    
    static rotationYMatrix(rad) {
       const c = Math.cos(rad);
       const s = Math.sin(rad);
       return new Matrix4(
           c, 0, s, 0, 
           0, 1, 0, 0, 
           -s, 0, c, 0, 
           0, 0, 0, 1
       );
    }
    
    static rotationZMatrix(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Matrix4(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return;
    }
    
    static multiplyMatrices(...matrices) {
        const m = Matrix4.identity;
        matrices.forEach(matrix => m.multiply(matrix));
        return m;
    }
    
    multiply(m2) {
        const m1 = this;
        
        const e1 = m1.elements;
        const e2 = m2.elements; 
        
        const ma00 = e1[0], ma01 = e1[4], ma02 = e1[8], ma03 = e1[12];
        const ma10 = e1[1], ma11 = e1[5], ma12 = e1[9], ma13 = e1[13];
        const ma20 = e1[2], ma21 = e1[6], ma22 = e1[10], ma23 = e1[14];
        const ma30 = e1[3], ma31 = e1[7], ma32 = e1[11], ma33 = e1[15];

        const mb00 = e2[0], mb01 = e2[4], mb02 = e2[8], mb03 = e2[12];
        const mb10 = e2[1], mb11 = e2[5], mb12 = e2[9], mb13 = e2[13];
        const mb20 = e2[2], mb21 = e2[6], mb22 = e2[10], mb23 = e2[14];
        const mb30 = e2[3], mb31 = e2[7], mb32 = e2[11], mb33 = e2[15];
       
        // r0
        const m00 = ma00 * mb00 + ma01 * mb10 + ma02 * mb20 + ma03 * mb30;
        const m01 = ma00 * mb01 + ma01 * mb11 + ma02 * mb21 + ma03 * mb31;
        const m02 = ma00 * mb02 + ma01 * mb12 + ma02 * mb22 + ma03 * mb32;
        const m03 = ma00 * mb03 + ma01 * mb13 + ma02 * mb23 + ma03 * mb33;

        // r1
        const m10 = ma10 * mb00 + ma11 * mb10 + ma12 * mb20 + ma13 * mb30;
        const m11 = ma10 * mb01 + ma11 * mb11 + ma12 * mb21 + ma13 * mb31;
        const m12 = ma10 * mb02 + ma11 * mb12 + ma12 * mb22 + ma13 * mb32;
        const m13 = ma10 * mb03 + ma11 * mb13 + ma12 * mb23 + ma13 * mb33;

        // r2
        const m20 = ma20 * mb00 + ma21 * mb10 + ma22 * mb20 + ma23 * mb30;
        const m21 = ma20 * mb01 + ma21 * mb11 + ma22 * mb21 + ma23 * mb31;
        const m22 = ma20 * mb02 + ma21 * mb12 + ma22 * mb22 + ma23 * mb32;
        const m23 = ma20 * mb03 + ma21 * mb13 + ma22 * mb23 + ma23 * mb33;

        // r3
        const m30 = ma30 * mb00 + ma31 * mb10 + ma32 * mb20 + ma33 * mb30;
        const m31 = ma30 * mb01 + ma31 * mb11 + ma32 * mb21 + ma33 * mb31;
        const m32 = ma30 * mb02 + ma31 * mb12 + ma32 * mb22 + ma33 * mb32;
        const m33 = ma30 * mb03 + ma31 * mb13 + ma32 * mb23 + ma33 * mb33;
        
        const m = new Matrix4(
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        );
        
        this.copy(m);
       
        return this;
    }
    
    copy(m) {
        this.m00 = m.m00;
        this.m01 = m.m01;
        this.m02 = m.m02;
        this.m03 = m.m03;
        this.m10 = m.m10;
        this.m11 = m.m11;
        this.m12 = m.m12;
        this.m13 = m.m13;
        this.m20 = m.m20;
        this.m21 = m.m21;
        this.m22 = m.m22;
        this.m23 = m.m23;
        this.m30 = m.m30;
        this.m31 = m.m31;
        this.m32 = m.m32;
        this.m33 = m.m33;
        return this;
    }
    
    clone() {
        const m = Matrix4.identity;
        m.m00 = this.m00;
        m.m01 = this.m01;
        m.m02 = this.m02;
        m.m03 = this.m03;
        m.m10 = this.m10;
        m.m11 = this.m11;
        m.m12 = this.m12;
        m.m13 = this.m13;
        m.m20 = this.m20;
        m.m21 = this.m21;
        m.m22 = this.m22;
        m.m23 = this.m23;
        m.m30 = this.m30;
        m.m31 = this.m31;
        m.m32 = this.m32;
        m.m33 = this.m33;
        return m;
    }

    transpose() {
        const m01 = this.m01;
        const m10 = this.m10;
        this.m01 = m10;
        this.m10 = m01;
        
        const m02 = this.m02;
        const m20 = this.m20;
        this.m02 = m20;
        this.m20 = m02;
        
        const m03 = this.m03;
        const m30 = this.m30;
        this.m03 = m30;
        this.m30 = m03;
        
        const m12 = this.m12;
        const m21 = this.m21;
        this.m12 = m21;
        this.m21 = m12;
        
        const m13 = this.m13;
        const m31 = this.m31;
        this.m13 = m31;
        this.m31 = m13;
        
        const m23 = this.m23;
        const m32 = this.m32;
        this.m23 = m32;
        this.m32 = m23;
        
        return this;
    }
   
    // ref: https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js
    invert() {

        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        const te = this.elements,

            n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3],
            n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7],
            n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11],
            n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15],

            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        const detInv = 1 / det;

        te[0]= t11 * detInv;
        te[1]= (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2]= (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3]= (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4]= t12 * detInv;
        te[5]= (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6]= (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7]= (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8]= t13 * detInv;
        te[9]= (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10]= (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11]= (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12]= t14 * detInv;
        te[13]= (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14]= (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15]= (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

        return this;
    }

    // ref: https://marina.sys.wakayama-u.ac.jp/~tokoi/?date=20090829
    static getOrthographicMatrix(left, right, bottom, top, near, far) {
        const m00 = 2 / (right - left); // scale x
        const m11 = 2 / (top - bottom); // scale y
        const m22 = -2 / (far - near); // scale z
        const m03 = -(right + left) / (right - left); // translate x
        const m13 = -(top + bottom) / (top - bottom); // translate y
        const m23 = -(far + near) / (far - near); // translate z
        return new Matrix4(
            m00, 0, 0, m03,
            0, m11, 0, m13,
            0, 0, m22, m23,
            0, 0, 0, 1
        );
    }

    // ref
    // https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/WebGL_model_view_projection
    // fov ... rad
    // aspect ... w / h
    static getPerspectiveMatrix(fov, aspect, near, far) {
        const f = 1 / Math.tan(fov / 2);
        // const nf = 1 / (near - far);

        const pjm = new Matrix4();

        pjm.m00 = f / aspect;
        pjm.m10 = 0;
        pjm.m20 = 0;
        pjm.m30 = 0;
        pjm.m01 = 0;
        pjm.m11 = f;
        pjm.m21 = 0;
        pjm.m31 = 0;
        pjm.m02 = 0;
        pjm.m12 = 0;
        pjm.m32 = -1;
        pjm.m03 = 0;
        pjm.m13 = 0;
        pjm.m33 = 0;
        if (far != null && far !== Infinity) {
            const nf = 1 / (near - far);
            pjm.m22 = (far + near) * nf;
            pjm.m23 = 2 * far * near * nf;
        } else {
            pjm.m22 = -1;
            pjm.m23 = -2 * near;
        }
       
        // row-order
        // // https://github.com/toji/gl-matrix/blob/master/src/mat4.js
        // pjm.elements[0]= f / aspect; // m00
        // pjm.elements[1]= 0; // m10
        // pjm.elements[2]= 0; // m20
        // pjm.elements[3]= 0; // m30
        // pjm.elements[4]= 0; // m01
        // pjm.elements[5]= f; // m11
        // pjm.elements[6]= 0; // m21
        // pjm.elements[7]= 0; // m31
        // pjm.elements[8]= 0; // m02
        // pjm.elements[9]= 0; // m12
        // pjm.elements[11]= -1; // m32
        // pjm.elements[12]= 0; // m03
        // pjm.elements[13]= 0; // m13
        // pjm.elements[15]= 0; // m33
        // if (far != null && far !== Infinity) {
        //     const nf = 1 / (near - far);
        //     pjm.elements[10]= (far + near) * nf; // m22
        //     pjm.elements[14]= 2 * far * near * nf; // m23
        // } else {
        //     pjm.elements[10]= -1; // m22
        //     pjm.elements[14]= -2 * near; // m23
        // }
        
        return pjm;
    }
    
    static getLookAtMatrix(eye, center, up = new Vector3(0, 1, 0), inverseForward = false) {
        const f = inverseForward
            ? Vector3.subVectors(eye, center).normalize() // ex. 主にカメラ。投影の関係で逆になるので。
            : Vector3.subVectors(center, eye).normalize();
        const r = Vector3.crossVectors(up.normalize(), f).normalize();
        const u = Vector3.crossVectors(f, r);
        const result = new Matrix4(
            r.x, u.x, f.x, eye.x,
            r.y, u.y, f.y, eye.y,
            r.z, u.z, f.z, eye.z,
            0, 0, 0, 1,
        );
        return result;
    }
  
    // position ... vector3
    // rotation ... rotator
    // scaling ... vector3
    static fromTRS(position, rotation, scaling) {
        const rotationRadians = rotation.getAxesRadians();
        return Matrix4.multiplyMatrices(
            Matrix4.translationMatrix(position),
            Matrix4.rotationYMatrix(rotationRadians.y),
            Matrix4.rotationXMatrix(rotationRadians.x),
            Matrix4.rotationZMatrix(rotationRadians.z),
            Matrix4.scalingMatrix(scaling)
        );
    }
    
    static fromQuaternion(q) {
        const eulerRadian = q.toEulerRadian();
        return Matrix4.multiplyMatrices(
            Matrix4.rotationYMatrix(eulerRadian.y),
            Matrix4.rotationXMatrix(eulerRadian.x),
            Matrix4.rotationZMatrix(eulerRadian.z),
        );
    }

    log()
    {
        console.log(`--------------------
${this.m00}, ${this.m01}, ${this.m02}, ${this.m03},
${this.m10}, ${this.m11}, ${this.m12}, ${this.m13},
${this.m20}, ${this.m21}, ${this.m22}, ${this.m23},
${this.m30}, ${this.m31}, ${this.m32}, ${this.m33},
--------------------`);
    }
    
    getPrettyLine() {
        return `--------------------
${this.m00}, ${this.m01}, ${this.m02}, ${this.m03},
${this.m10}, ${this.m11}, ${this.m12}, ${this.m13},
${this.m20}, ${this.m21}, ${this.m22}, ${this.m23},
${this.m30}, ${this.m31}, ${this.m32}, ${this.m33},
--------------------`;
    }
}
﻿const PrimitiveTypes = {
    Points: "Points",
    Lines: "Lines",
    LineLoop: "LineLoop",
    LineStrip: "LineStrip",
    Triangles: "Triangles",
    TriangleStrip: "TriangleStrip",
    TriangleFan: "TriangleFan",
};

const UniformTypes = {
    Matrix4: "Matrix4",
    Matrix4Array: "Matrix4Array",
    Texture: "Texture",
    CubeMap: "CubeMap",
    Vector2: "Vector2",
    Vector2Array: "Vector2Array",
    Vector3: "Vector3",
    Struct: "Struct",
    Float: "Float",
    FloatArray: "FloatArray",
    Int: "Int",
    Color: "Color",
    ColorArray: "ColorArray",
};

const TextureTypes = {
    RGBA: "RGBA",
    Depth: "Depth",
    RGBA16F: "RGBA16F",
    RGBA32F: "RGBA32F"
};

const TextureWrapTypes = {
    Repeat: "Repeat",
    ClampToEdge: "ClampToEdge",
};

const TextureFilterTypes = {
    Nearest: "Nearest", // min, mag
    Linear: "Linear", // min, mag
    NearestMipmapNearest: "NearestMipmapNearest", // only min filter
    NearestMipmapLinear: "NearestMipmapLinear", // only min filter,
    LinearMipmapNearest: "LinearMipmapNearest", // only min filter
    LinearMipmapLinear: "LinearMipmapLinear", // only min filter
};

const BlendTypes = {
    Opaque: "Opaque",
    Transparent: "Transparent",
    Additive: "Additive",
};

const RenderQueues = {
    Skybox: 1,
    Opaque: 2,
    AlphaTest: 3,
    Transparent: 4
};

const RenderbufferTypes = {
    Depth: "Depth",
};

const ActorTypes = {
    Null: "Null",
    Mesh: "Mesh",
    SkinnedMesh: "SkinnedMesh",
    Light: "Light",
    Skybox: "Skybox",
    Camera: "Camera",
};

const CubeMapAxis = {
    PositiveX: "PositiveX",
    NegativeX: "NegativeX",
    PositiveY: "PositiveY",
    NegativeY: "NegativeY",
    PositiveZ: "PositiveZ",
    NegativeZ: "NegativeZ",
};

const FaceSide = {
    Front: "Front",
    Back: "Back",
    Double: "Double"
};

// TODO: rename Type"s"
const AttributeUsageType = {
    StaticDraw: "StaticDraw",
    DynamicDraw: "DynamicDraw"
};

const RenderTargetTypes = {
    RGBA: "RGBA",
    Depth: "Depth",
    Empty: "Empty",
};

const AnimationKeyframeTypes = {
    Vector3: "Vector3",
    Quaternion: "Quaternion"
};

const AttributeNames = {
    Position: "aPosition",
    Color: "aColor",
    Uv: "aUv",
    Normal: "aNormal",
    Tangent: "aTangent",
    Binormal: "aBinormal",
    // skinning
    BoneIndices: "aBoneIndices",
    BoneWeights: "aBoneWeighs",
    // instancing
    InstancePosition: "aInstancePosition",
    InstanceScale: "aInstanceScale",
    InstanceAnimationOffset: "aInstanceAnimationOffset",
    InstanceVertexColor: "aInstanceVertexColor"
};

const UniformNames = {
    // base
    WorldMatrix: "uWorldMatrix",
    ViewMatrix: "uViewMatrix",
    ProjectionMatrix: "uProjectionMatrix",
    NormalMatrix: "uNormalMatrix",
    ViewPosition: "uViewPosition",
    // skinning
    JointMatrices: "uJointMatrices",
    JointTexture: "uJointTexture",
    // shadow map
    ShadowMap: "uShadowMap",
    ShadowMapProjectionMatrix: "uShadowMapProjectionMatrix",
    ShadowBias: "uShadowBias",
    // post process
    SceneTexture: "uSceneTexture",
    // time
    Time: "uTime"
};
﻿class Rotator {
    // x, y, z axes
    // 一旦そのままdegreeが入る想定
    elements; 
   
    // degree
    get x() {
        return this.elements[0];
    }
   
    // degree
    get y() {
        return this.elements[1];
    }
   
    // degree
    get z() {
        return this.elements[2];
    }

    // degree
    get roll() {
        return this.elements[2];
    }

    // degree
    get pitch() {
        return this.elements[0];
    }

    // degree
    get yaw() {
        return this.elements[1];
    }
   
    // degree
    getAxes() {
        return {
            x: this.elements[0],
            y: this.elements[1],
            z: this.elements[2],
        }
    }
    
    getAxesRadians() {
        return {
            x: this.elements[0] * Math.PI / 180,
            y: this.elements[1] * Math.PI / 180,
            z: this.elements[2] * Math.PI / 180,
        }
    }

    // degrees
    constructor(x, y, z) {
        this.set(x, y, z);
    }
    
    set(x, y, z) {
        this.elements = new Float32Array([x, y, z]);
        return this;
    }
    
    static get zero() {
        return new Rotator(0, 0, 0);
    }
    
    static fromRadian(x, y, z) {
        const rotator = new Rotator().set(
            x * 180 / Math.PI,
            y * 180 / Math.PI,
            z * 180 / Math.PI,
        );
        return rotator;
    }
    
    static fromQuaternion(q) {
        const euler = q.toEulerDegree();
        return new Rotator(euler.x, euler.y, euler.z);
    }
    
    setRotationX(degree) {
        this.elements[0] = degree;
    }
    
    setRotationY(degree) {
        this.elements[1] = degree;
    }
    
    setRotationZ(degree) {
        this.elements[2] = degree;
    }
}

﻿




// TODO: 
// - 外側から各種propertyを取得するときはmatrix更新した方がいい？
// - NodeBaseを継承
class Transform {
    parent;
    actor;
    children = [];
    #worldMatrix = Matrix4.identity;
    #localMatrix = Matrix4.identity;
    position = Vector3.zero;
    rotation = Rotator.zero; // degree vector
    scale = Vector3.one;
    lookAtTarget = null; // world v

    get childCount() {
        return this.children.length;
    }

    get hasChild() {
        return this.childCount > 0;
    }

    get worldMatrix() {
        return this.#worldMatrix;
    }

    get localMatrix() {
        return this.#localMatrix;
    }

    get worldPosition() {
        return this.#worldMatrix.position;
    }
    
    get worldRight() {
        return new Vector3(this.#worldMatrix.m00, this.#worldMatrix.m10, this.#worldMatrix.m20).normalize();
    }

    get worldUp() {
        return new Vector3(this.#worldMatrix.m01, this.#worldMatrix.m11, this.#worldMatrix.m21).normalize();
    }

    get worldForward() {
        return new Vector3(this.#worldMatrix.m02, this.#worldMatrix.m12, this.#worldMatrix.m22).normalize();
    }

    addChild(child) {
        this.children.push(child);
    }

    // TODO: 引数でworldMatrixとdirty_flagを渡すべきな気がする
    updateMatrix() {
        if (this.lookAtTarget) {
            // TODO:
            // - up vector 渡せるようにする
            // - parentがあるとlookatの方向が正しくなくなるので親の回転を打ち消す必要がある
            const lookAtMatrix = this.actor.type === ActorTypes.Camera
                ? Matrix4.getLookAtMatrix(this.position, this.lookAtTarget, Vector3.up, true)
                : Matrix4.getLookAtMatrix(this.position, this.lookAtTarget);
            const scalingMatrix = Matrix4.scalingMatrix(this.scale);
            this.#localMatrix = Matrix4.multiplyMatrices(lookAtMatrix, scalingMatrix);
        } else {
            const translationMatrix = Matrix4.translationMatrix(this.position);
            const rotationAxes = this.rotation.getAxes();
            const rotationXMatrix = Matrix4.rotationXMatrix(rotationAxes.x / 180 * Math.PI);
            const rotationYMatrix = Matrix4.rotationYMatrix(rotationAxes.y / 180 * Math.PI);
            const rotationZMatrix = Matrix4.rotationZMatrix(rotationAxes.z / 180 * Math.PI);
            // roll(Z), pitch(X), yaw(Y)
            const rotationMatrix = Matrix4.multiplyMatrices(rotationYMatrix, rotationXMatrix, rotationZMatrix);
            const scalingMatrix = Matrix4.scalingMatrix(this.scale);
            this.#localMatrix = Matrix4.multiplyMatrices(translationMatrix, rotationMatrix, scalingMatrix);
        }
        this.#worldMatrix = this.parent
            ? Matrix4.multiplyMatrices(this.parent.worldMatrix, this.#localMatrix)
            : this.#localMatrix;
    }

    setScaling(s) {
        this.scale = s;
    }

    setRotationX(degree) {
        this.rotation.setRotationX(degree);
    }

    setRotationY(degree) {
        this.rotation.setRotationY(degree);
    }

    setRotationZ(degree) {
        this.rotation.setRotationZ(degree);
    }

    setTranslation(v) {
        this.position = v;
    }

    lookAt(lookAtTarget) {
        this.lookAtTarget = lookAtTarget;
    }
}

// ref: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

class Animator {
    #animationClips;
    #playingAnimationClip;
    
    get animationClips() {
        return this.#animationClips;
    }
    
    constructor(animationClips) {
        this.#animationClips = animationClips || [];
    }
    
    setAnimationClips(animationClips) {
        this.#animationClips = animationClips;
    }
    
    play(name) {
        const animationClip = this.#animationClips.find(animationClip => name === animationClip.name);
        if(!animationClip) {
            return;
        }
        animationClip.play();
        this.#playingAnimationClip = animationClip;
    }
   
    // 呼ぶ側によってはdeltaTimeでもfixedDeltaTimeでもOK
    update(deltaTime) {
        if(!this.#playingAnimationClip) {
            return;
        }
        this.#playingAnimationClip.update(deltaTime);
    }
}
﻿




class Actor {
    transform = new Transform();
    type;
    uuid;
    isStarted = false;
    animator; // NOTE: いよいよcomponentっぽくしたくなってきた
    // lifecycle callback
    #onStart;
    #onFixedUpdate;
    #onUpdate;
    #enabled = true;
    
    set enabled(value) {
        this.#enabled = value;
    }
    
    get enabled() {
        return this.#enabled;
    }
    
    set onStart(value) {
        this.#onStart = value;
    }
    
    set onFixedUpdate(value) {
        this.#onFixedUpdate = value;
    }
    
    set onUpdate(value) {
        this.#onUpdate = value;
    }
    
    constructor(type) {
        this.transform.actor = this;
        this.type = type || ActorTypes.Null;
        this.uuid = uuidv4();
        this.animator = new Animator();
    }
    
    addChild(child) {
        this.transform.addChild(child);
        child.transform.parent = this.transform;
    }
   
    setSize(width, height) {
    }
    
    #tryStart({ gpu }) {
        if(this.isStarted) {
            return;
        }
        this.isStarted = true;
        this.start({ gpu });
    }

    updateTransform() {
        this.transform.updateMatrix();
    }
    
    // -----------------------------------------------------------------
    // actor lifecycle
    // -----------------------------------------------------------------
    
    start({ gpu } = {}) {
        if(this.#onStart) {
            this.#onStart({ actor: this, gpu });
        }
    }
    
    fixedUpdate({ gpu, fixedTime, fixedDeltaTime } = {}) {
        this.#tryStart({ gpu });
        if(this.animator) {
            this.animator.update(fixedDeltaTime);
        }
        if(this.#onFixedUpdate) {
            this.#onFixedUpdate({ actor: this, gpu, fixedTime, fixedDeltaTime });
        }
    }

    update({ gpu, time, deltaTime } = {}) {
        this.#tryStart({ gpu });
        if(this.#onUpdate) {
            this.#onUpdate({ actor: this, gpu, time, deltaTime });
        }
    }
    
    beforeRender({ gpu }) {
    }
}
﻿class GLObject {
    get glObject() {
        throw "[GLObject.glObject] should implementation";
    }
    
    bind() {
        throw "[GLObject.bind] should implementation";
    }

    unbind() {
        throw "[GLObject.unbind] should implementation";
    }
}
﻿

class Shader extends GLObject {
    #program;
    
    get glObject() {
        return this.#program;
    }
    
    constructor({ gpu, vertexShader, fragmentShader }) {
        super();
       
        // cache
        const gl = gpu.gl;
      
        // vertex shader
        
        // create vertex shader  
        const vs = gl.createShader(gl.VERTEX_SHADER);
        // set shader source (string)
        gl.shaderSource(vs, vertexShader);
        // compile vertex shader
        gl.compileShader(vs);
        // check shader info log
        const vsInfo = gl.getShaderInfoLog(vs);
        if(vsInfo.length > 0) {
            const errorInfo = Shader.buildErrorInfo(vsInfo, vertexShader, "[Shader] vertex shader has error");
            throw errorInfo;
        }

        // fragment shader

        // create fragment shader  
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        // set shader source (string)
        gl.shaderSource(fs, fragmentShader);
        // compile fragment shader
        gl.compileShader(fs);
        const fsInfo = gl.getShaderInfoLog(fs);
        // check shader info log
        if(fsInfo.length > 0) {
            const errorInfo = Shader.buildErrorInfo(fsInfo, fragmentShader, "[Shader] fragment shader has error");
            throw errorInfo;
        }
        
        // program object
        
        this.#program = gl.createProgram();
       
        // attach shaders
        gl.attachShader(this.#program, vs);
        gl.attachShader(this.#program, fs);
       
        // program link to gl context
        gl.linkProgram(this.#program);

        // check program info log
        const programInfo = gl.getProgramInfoLog(this.#program);
        if(programInfo.length > 0) {
            throw programInfo;
        }
    }
    
    static buildErrorInfo(infoLog, shaderSource, header) {
        return `[Shader] fragment shader has error
            
---

${infoLog}

---
            
${shaderSource.split("\n").map((line, i) => {
    return `${i + 1}: ${line}`;
}).join("\n")}       
`;
    }
}


const calcSkinningMatrixFunc = () => `
mat4 calcSkinningMatrix(mat4 jointMat0, mat4 jointMat1, mat4 jointMat2, mat4 jointMat3, vec4 boneWeights) {
    mat4 skinMatrix =
         jointMat0 * aBoneWeights.x +
         jointMat1 * aBoneWeights.y +
         jointMat2 * aBoneWeights.z +
         jointMat3 * aBoneWeights.w;
    return skinMatrix;
}

// TODO: animation data をシェーダーに渡して複数アニメーションに対応させたい
struct SkinAnimationClipData {
    int beginIndex; 
    int frameCount;
};

mat4 getJointMatrix(sampler2D jointTexture, uint jointIndex, int colNum) {
    int colIndex = int(mod(float(jointIndex), float(colNum))); // 横
    int rowIndex = int(floor(float(jointIndex) / float(colNum))); // 縦
    mat4 jointMatrix = mat4(
        // 1: boneの行列が1個ずつ縦に並んでいる場合
        // texelFetch(jointTexture, ivec2(0, jointIndex), 0),
        // texelFetch(jointTexture, ivec2(1, jointIndex), 0),
        // texelFetch(jointTexture, ivec2(2, jointIndex), 0),
        // texelFetch(jointTexture, ivec2(3, jointIndex), 0)
        // 2: 適宜詰めている場合
        texelFetch(jointTexture, ivec2(colIndex * 4 + 0, rowIndex), 0),
        texelFetch(jointTexture, ivec2(colIndex * 4 + 1, rowIndex), 0),
        texelFetch(jointTexture, ivec2(colIndex * 4 + 2, rowIndex), 0),
        texelFetch(jointTexture, ivec2(colIndex * 4 + 3, rowIndex), 0)
    );
    return jointMatrix;
}

mat4 getJointMatrixGPUSkinning(
    sampler2D jointTexture,
    uint jointIndex,
    int jointNum,
    int currentSkinIndex,
    int colNum,
    int totalFrameCount,
    float time,
    float timeOffset
) {
    float offset = float(int(mod(floor(time + timeOffset), float(totalFrameCount))) * jointNum);
    int colIndex = int(mod(float(jointIndex) + offset, float(colNum))); // 横
    int rowIndex = int(floor(float(jointIndex) + offset / float(colNum))); // 縦

    mat4 jointMatrix = mat4(
        texelFetch(jointTexture, ivec2(colIndex * 4 + 0, rowIndex), 0),
        texelFetch(jointTexture, ivec2(colIndex * 4 + 1, rowIndex), 0),
        texelFetch(jointTexture, ivec2(colIndex * 4 + 2, rowIndex), 0),
        texelFetch(jointTexture, ivec2(colIndex * 4 + 3, rowIndex), 0)
    );
    return jointMatrix;
}
`;

const skinningVertexUniforms = (jointNum) => `
// tmp for cpu skinning
// uniform mat4[${jointNum}] uJointMatrices;
uniform sampler2D ${UniformNames.JointTexture};

uniform int uBoneCount;
uniform int uJointTextureColNum;
uniform int uTotalFrameCount;
`;

const skinningVertex = (gpuSkinning = false) => `
    // tmp: for cpu skinning
    // mat4 skinMatrix = calcSkinningMatrix(
    //     uJointMatrices[int(aBoneIndices[0])],
    //     uJointMatrices[int(aBoneIndices[1])],
    //     uJointMatrices[int(aBoneIndices[2])],
    //     uJointMatrices[int(aBoneIndices[3])],
    //     aBoneWeights
    // );

    ${gpuSkinning ? `
    // gpu skinning
    float fps = 30.;
    mat4 jointMatrix0 = getJointMatrixGPUSkinning(uJointTexture, aBoneIndices[0], uBoneCount, 0, uJointTextureColNum, uTotalFrameCount, uTime * fps, aInstanceAnimationOffset);
    mat4 jointMatrix1 = getJointMatrixGPUSkinning(uJointTexture, aBoneIndices[1], uBoneCount, 0, uJointTextureColNum, uTotalFrameCount, uTime * fps, aInstanceAnimationOffset);
    mat4 jointMatrix2 = getJointMatrixGPUSkinning(uJointTexture, aBoneIndices[2], uBoneCount, 0, uJointTextureColNum, uTotalFrameCount, uTime * fps, aInstanceAnimationOffset);
    mat4 jointMatrix3 = getJointMatrixGPUSkinning(uJointTexture, aBoneIndices[3], uBoneCount, 0, uJointTextureColNum, uTotalFrameCount, uTime * fps, aInstanceAnimationOffset);
    mat4 skinMatrix = calcSkinningMatrix(
        jointMatrix0,
        jointMatrix1,
        jointMatrix2,
        jointMatrix3,
        aBoneWeights
    );
    ` : `
    mat4 jointMatrix0 = getJointMatrix(uJointTexture, aBoneIndices[0], uJointTextureColNum);
    mat4 jointMatrix1 = getJointMatrix(uJointTexture, aBoneIndices[1], uJointTextureColNum);
    mat4 jointMatrix2 = getJointMatrix(uJointTexture, aBoneIndices[2], uJointTextureColNum);
    mat4 jointMatrix3 = getJointMatrix(uJointTexture, aBoneIndices[3], uJointTextureColNum);
    mat4 skinMatrix = calcSkinningMatrix(
        jointMatrix0,
        jointMatrix1,
        jointMatrix2,
        jointMatrix3,
        aBoneWeights
    );
    `}
`;


// -----------------------------------------------
// TODO:
// - out varying を centroid できるようにしたい
// -----------------------------------------------

// .matchAll(/#pragma\s([a-zA-Z0-9_\s]+)/g)

const pragmaRegex = /^#pragma(.*)/;



const buildVertexAttributeLayouts = (attributeDescriptors) => {
    const sortedAttributeDescriptors = [...attributeDescriptors].sort((a, b) => a.location - b.location);

    const attributesList = sortedAttributeDescriptors.map(({ location, size, name, dataType }) => {
        let type;
        // TODO: fix all type
        switch(dataType) {
            case Float32Array:
                switch(size) {
                    case 1:
                        type = "float";
                        break;
                    case 2:
                        type = "vec2";
                        break;
                    case 3:
                        type = "vec3";
                        break;
                    case 4:
                        type = "vec4";
                        break;
                    default:
                        throw "[buildVertexAttributeLayouts] invalid attribute float";
                }
                break;
            // TODO: signedなパターンが欲しい    
            case Uint16Array:
                switch(size) {
                    case 1:
                        type = "uint";
                        break;
                    case 2:
                        type = "uvec2";
                        break;
                    case 3:
                        type = "uvec3";
                        break;
                    case 4:
                        type = "uvec4";
                        break;
                    default:
                        throw "[buildVertexAttributeLayouts] invalid attribute int";
                }
                break;
            default:
                throw "[buildVertexAttributeLayouts] invalid attribute data type";
        }
        const str = `layout(location = ${location}) in ${type} ${name};`;
        return str;
    });

    return attributesList;
}

const joinShaderLines = (shaderLines) => {
    return shaderLines
        .map(line => line.replace(/^\s*$/, ""))
        .join("\n")
        .replaceAll(/\n{3,}/g, "\n");
};

const buildVertexShader = (shader, attributeDescriptors) => {
    const shaderLines =  shader.split("\n");
    const resultShaderLines = [];

    shaderLines.forEach(shaderLine => {
        const pragma = (shaderLine.trim()).match(pragmaRegex);

        if(!pragma) {
            resultShaderLines.push(shaderLine);
            return;
        }

        let newLines = [];
        const pragmas = (pragma[1].trim()).split(" ");
        
        const pragmaName = pragmas[0];
        
        switch(pragmaName) {
            
            case "attributes":
                const attributes = buildVertexAttributeLayouts(attributeDescriptors);
                newLines.push(...attributes);
                break;
                
            case "uniform_transform_vertex":
                newLines.push(`
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
`);
                break;
                
            case "varying_receive_shadow":
                newLines.push(`
out vec4 vShadowMapProjectionUv;
`);
                break;
                
            case "uniform_receive_shadow":
                newLines.push(`
uniform mat4 uShadowMapProjectionMatrix;
`);
                break;
                
            case "uniform_engine":
                newLines.push(`
uniform float uTime;
`);
                break;
            case "varying_normal_map":
                newLines.push(`
out vec3 vTangent;
out vec3 vBinormal;               
`);
                break;
                
            case "function_skinning":
                newLines.push(calcSkinningMatrixFunc());
                break;
                
            case "uniform_skinning":
                const jointNum = pragmas[1];
                newLines.push(skinningVertexUniforms());
                break;
                
            case "vertex_normal_map":
                const isSkinningNormalMap = pragmas[1] && pragmas[1] === "skinning";
                newLines.push(isSkinningNormalMap ? `
vNormal = mat3(uNormalMatrix) * mat3(skinMatrix) * aNormal;
vTangent = mat3(uNormalMatrix) * mat3(skinMatrix) * aTangent;
vBinormal = mat3(uNormalMatrix) * mat3(skinMatrix) * aBinormal;
                ` : `
vNormal = mat3(uNormalMatrix) * aNormal;
vTangent = mat3(uNormalMatrix) * aTangent;
vBinormal = mat3(uNormalMatrix) * aBinormal;
`);
                break;
                
            case "vertex_skinning":
                newLines.push(skinningVertex(pragmas[1] === "gpu"));
                break;
                
            case "vertex_receive_shadow":
                newLines.push(`    
vShadowMapProjectionUv = uShadowMapProjectionMatrix * worldPosition;
`);
                break;

            case "varying_vertex_color":
                newLines.push(`
out vec4 vVertexColor;
`);
                break;
            default:
                throw `[buildVertexShader] invalid pragma: ${pragmaName}`;
        }
        resultShaderLines.push(newLines.join("\n"));
    });
    return joinShaderLines(resultShaderLines);
}

const buildFragmentShader = (shader) => {
    const shaderLines =  shader.split("\n");
    const resultShaderLines = [];

    shaderLines.forEach(shaderLine => {
        const pragma = (shaderLine.trim()).match(pragmaRegex);

        if(!pragma) {
            resultShaderLines.push(shaderLine);
            return;
        }

        let newLines = [];
        const pragmas = (pragma[1].trim()).split(" ");

        const pragmaName = pragmas[0];

        switch(pragmaName) {
            case "uniform_vertex_matrices":
                newLines.push(`uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;`);
                break;
            case "function_depth":
                newLines.push(`
// ref:
// https://github.com/mebiusbox/docs/blob/master/%EF%BC%93%E6%AC%A1%E5%85%83%E5%BA%A7%E6%A8%99%E5%A4%89%E6%8F%9B%E3%81%AE%E3%83%A1%E3%83%A2%E6%9B%B8%E3%81%8D.pdf
float viewZToLinearDepth(float z, float near, float far) {
    return (z + near) / (near - far);
}
float perspectiveDepthToLinearDepth(float depth, float near, float far) {
    float nz = near * depth;
    return -nz / (far * (depth - 1.) - nz);
}
`);
                break;
            default:
                throw `[buildFragmentShader] invalid pragma: ${pragmaName}`;
        }
        resultShaderLines.push(newLines.join("\n"));
    });
    return joinShaderLines(resultShaderLines);
}

const defaultDepthFragmentShader = () => `#version 300 es

precision mediump float;

out vec4 outColor;

void main() {
    outColor = vec4(1., 1., 1., 1.);
}
`;
﻿





// -------------------------------------------------------------------
// TODO:
// - rawVertex, rawFragment を渡せるように？
// - vertexShaderGenerator, fragmentShaderGenerator を剥がす
// -------------------------------------------------------------------

class Material {
    name;
  
    shader;
    primitiveType;
    blendType;
    renderQueue;
    uniforms = {};
    depthUniforms;
    depthTest;
    depthWrite;
    alphaTest;
    culling;
    faceSide;
    receiveShadow;
    queue;
    
    useNormalMap;
   
    // skinning
    isSkinning;
    gpuSkinning;
    jointNum;
    
    // instancing
    isInstancing;
    
    // vertex color
    useVertexColor;

    vertexShader;
    fragmentShader;
    depthFragmentShader;
    
    rawVertexShader;
    rawFragmentShader;
    rawDepthFragmentShader;

    #vertexShaderGenerator;
    #fragmentShaderGenerator;
    #depthFragmentShaderGenerator;

    #vertexShaderModifier;
    
    get isCompiledShader() {
        return !!this.shader;
    }
    
    get vertexShaderModifier() {
        return this.#vertexShaderModifier;
    }

    constructor({
        gpu,
        
        name,
        
        vertexShader,
        fragmentShader,
        depthFragmentShader,
        
        vertexShaderGenerator,
        fragmentShaderGenerator,
        depthFragmentShaderGenerator,
        
        vertexShaderModifier,
        
        primitiveType,
        depthTest = null,
        depthWrite = null,
        alphaTest = null,
        faceSide = FaceSide.Front,
        receiveShadow = false,
        blendType,
        renderQueue,
        
        useNormalMap,
        
        // skinning
        isSkinning,
        gpuSkinning,
        jointNum,
        
        // instancing
        isInstancing = false,
       
        // vertex color 
        useVertexColor = false,
        
        queue,
        uniforms = {},
        depthUniforms = {}
    }) {
        this.name = name;
        
        // 外側から任意のタイミングでcompileした方が都合が良さそう
        // this.shader = new Shader({gpu, vertexShader, fragmentShader});
        
        if(vertexShader) {
            this.vertexShader = vertexShader;
        }
        if(fragmentShader) {
            this.fragmentShader = fragmentShader;
        }
        if(depthFragmentShader) {
            this.depthFragmentShader = depthFragmentShader;
        }
        
        if(vertexShaderGenerator) {
            this.#vertexShaderGenerator = vertexShaderGenerator;
        }
        if(fragmentShaderGenerator) {
            this.#fragmentShaderGenerator = fragmentShaderGenerator;
        }
        if(depthFragmentShaderGenerator) {
            this.#depthFragmentShaderGenerator = depthFragmentShaderGenerator;
        }
        
        if(vertexShaderModifier) {
            this.#vertexShaderModifier = vertexShaderModifier;
        }
        
        this.primitiveType = primitiveType || PrimitiveTypes.Triangles;
        this.blendType = blendType || BlendTypes.Opaque;

        this.depthTest = depthTest !== null ? depthTest : true;
        this.depthWrite = depthWrite;
        this.alphaTest = alphaTest;

        this.faceSide = faceSide;
        this.receiveShadow = !!receiveShadow;

        if (!!renderQueue) {
            this.renderQueue = renderQueue;
        } else {
            switch (this.blendType) {
                case BlendTypes.Opaque:
                    this.renderQueue = RenderQueues.Opaque;
                    break;
                case BlendTypes.Transparent:
                case BlendTypes.Additive:
                    this.renderQueue = RenderQueues.Transparent;
                    break;
            }
        }

        if (!this.renderQueue) {
            throw "[Material.constructor] invalid render queue";
        }
      
        // skinning
        this.isSkinning = isSkinning;
        this.gpuSkinning = gpuSkinning;
        this.jointNum = jointNum;
        
        this.isInstancing = isInstancing;
        this.useVertexColor = useVertexColor;

        this.useNormalMap = useNormalMap;

        // TODO:
        // - シェーダーごとにわける？(postprocessやreceiveShadow:falseの場合はいらないuniformなどがある
        // - skinning回りもここで入れたい？
        const commonUniforms = {
            [UniformNames.WorldMatrix]: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity
            },
            [UniformNames.ViewMatrix]: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity
            },
            [UniformNames.ProjectionMatrix]: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity
            },
            [UniformNames.NormalMatrix]: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity
            },
            // TODO: viewmatrixから引っ張ってきてもよい
            [UniformNames.ViewPosition]: {
                type: UniformTypes.Vector3,
                value: Vector3.zero
            },
            [UniformNames.Time]: {
                type: UniformTypes.Float,
                value: 0
            },
            ...(this.alphaTest ? {
                uAlphaTestThreshold: {
                    type: UniformTypes.Float,
                    value: this.alphaTest
                }
            } : {})
        };
        
        const shadowUniforms = this.receiveShadow ? {
            [UniformNames.ShadowMap]: {
                type: UniformTypes.Texture,
                value: null,
            },
            [UniformNames.ShadowMapProjectionMatrix]: {
                type: UniformTypes.Matrix4,
                value: Matrix4.identity
            },
            // TODO: shadow map class を作って bias 持たせた方がよい
            [UniformNames.ShadowBias]: {
                type: UniformTypes.Float,
                value: 0.01
            }
        } : {};
        
        this.queue = queue || null;

        this.uniforms = {...commonUniforms, ...shadowUniforms, ...uniforms};
        
        this.depthUniforms = {...commonUniforms, ...depthUniforms };
    }

    start({ gpu, attributeDescriptors }) {
        // for debug
        // console.log("[Material.start] attributeDescriptors", attributeDescriptors)

        if(!this.vertexShader && this.#vertexShaderGenerator) {
            this.vertexShader = this.#vertexShaderGenerator({
                attributeDescriptors,
                isSkinning: this.isSkinning,
                jointNum: this.jointNum, 
                gpuSkinning: this.gpuSkinning,
                isInstancing: this.isInstancing
            });
        }
        if(!this.fragmentShader && this.#fragmentShaderGenerator) {
            this.fragmentShader = this.#fragmentShaderGenerator({
                attributeDescriptors,
            });
        }
        if(!this.depthFragmentShader && this.#depthFragmentShaderGenerator) {
            this.depthFragmentShader = this.#depthFragmentShaderGenerator();
        }
       
        const rawVertexShader = buildVertexShader(this.vertexShader, attributeDescriptors);
        const rawFragmentShader = buildFragmentShader(this.fragmentShader);

        this.rawVertexShader = rawVertexShader;
        this.rawFragmentShader = rawFragmentShader;

        this.shader = new Shader({
            gpu,
            // vertexShader: this.vertexShader,
            vertexShader: rawVertexShader,
            // fragmentShader: this.fragmentShader
            fragmentShader: rawFragmentShader,
        });
    }

    // TODO:
    // - structみたいな深い階層もupdateができるようにしたい
    // - 'updateUniformValue'の方が良い??
    updateUniform(name, value) {
        if(!this.uniforms[name]) {
            throw `[Material.updateUniform] invalid uniform key: ${name}`;
        }
        this.uniforms[name].value = value;
    }
   
    // // NOTE: renderer側でmaterial側のuniformをアップデートする用
    // updateUniforms({ gpu } = {}) {}
    
    // // TODO: engine向けのuniformの更新をrendererかmaterialでやるか悩ましい
    // updateEngineUniforms() {} 

    getUniform(name) {
        if(!this.uniforms[name]) {
            throw `[Material.getUniform] invalid uniform key: ${name}`;
        }
        return this.uniforms[name].value;
    }
}

﻿




class Mesh extends Actor {
    geometry;
    // material;
    materials = [];
    depthMaterial;
    castShadow;
    instanced;
    autoGenerateDepthMaterial;
    
    get material() {
        if(this.hasMaterials) {
            console.warn("[Mesh.material getter] materials length > 1. material is head of materials.")
        }
        // return this.materials[0];
        return this.mainMaterial;
    }
    
    set material(material) {
        this.materials = [material];
    }
    
    get mainMaterial() {
        return this.materials[0];
    }
    
    get hasMaterials() {
        return this.materials.length > 1;
    }
    
    constructor({
        geometry,
        material,
        materials,
        depthMaterial = null,
        actorType = ActorTypes.Mesh,
        castShadow = false,
        instanced = false,
        autoGenerateDepthMaterial = true
    }) {
        super(actorType);
        this.geometry = geometry;
        // this.material = material;
        // TODO: check material is array
        this.materials = material !== null ? [material] : materials;
        this.depthMaterial = depthMaterial;
        this.castShadow = !!castShadow;
        this.instanced = !!instanced;
        this.autoGenerateDepthMaterial = autoGenerateDepthMaterial;
    }

    start(options) {
        super.start(options);
        
        const { gpu } = options;
        
        this.geometry.start();
        
        // 未コンパイルであればコンパイルする
        this.materials.forEach(material => {
            if(!material.isCompiledShader) {
                material.start({
                    gpu,
                    attributeDescriptors: this.geometry.getAttributeDescriptors()
                });
            }
        });

        if(
            !this.depthMaterial &&
            this.autoGenerateDepthMaterial
        ) {
            this.depthMaterial = new Material({
                gpu,
                vertexShader: this.mainMaterial.vertexShader,
                fragmentShader: this.mainMaterial.depthFragmentShader || defaultDepthFragmentShader(),
                uniforms: this.mainMaterial.depthUniforms,
                faceSide: this.mainMaterial.faceSide
            });
        }       

        if(this.depthMaterial && !this.depthMaterial.isCompiledShader) {
            this.depthMaterial.start({
                gpu,
                attributeDescriptors: this.geometry.getAttributeDescriptors()
            });
        }
        
        // for debug
        // console.log("main raw vertex", this.mainMaterial.rawVertexShader)
        // console.log("main raw fragment", this.mainMaterial.rawFragmentShader)
        // console.log("depth raw vertex", this.depthMaterial.rawVertexShader)
    }

    beforeRender({gpu}) {
        super.beforeRender({gpu});
        // this.materials.forEach(material => material.updateUniforms({ gpu }));
        // this.depthMaterial.updateUniforms({ gpu });
    }
}
﻿
async function loadObj(path) {
    const response = await fetch(path);
    const content = await response.text();
    return parseObj(content);
}

function parseObj(content) {
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
   
    return {
        positions: positions.flat(),
        uvs: uvs.flat(),
        normals: normals.flat(),
        indices
    }
}

﻿

class Attribute {
    name;
    data; // data
    location; // layout location index
    size; // data per vertex. ex) position: 3, uv: 2
    offset;
    usageType;
    divisor;
    
    constructor({
        name,
        data,
        location,
        size,
        offset = 0,
        usageType = AttributeUsageType.StaticDraw,
        divisor
    }) {
        this.name = name;
        this.data = data;
        this.location = location;
        this.size = size;
        this.offset = offset;
        this.usageType = usageType;
        this.divisor = divisor;
    }
    
    getDescriptor() {
        return {
            name: this.name,
            location: this.location,
            size: this.size,
            dataType: this.data.constructor
        }
    }
}
﻿

class IndexBufferObject extends GLObject {
    #ibo;
    #gpu;
    
    get glObject() {
        return this.#ibo;
    }
    
    constructor({ gpu, indices }) {
        super();
        
        this.#gpu = gpu;
        
        const gl = this.#gpu.gl;
        
        this.#ibo = gl.createBuffer();

        this.bind();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }
    
    bind() {
        const gl = this.#gpu.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#ibo);
    }
    
    unbind() {
        const gl = this.#gpu.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}
﻿



class VertexArrayObject extends GLObject {
    #gpu;
    #vao;
    #vboList = [];
    #ibo;
    
    get hasIndices() {
        return !!this.#ibo;
    }

    get glObject() {
        return this.#vao;
    }
    
    get vboList() {
    }
    
    getUsage(gl, usageType) {
        switch(usageType) {
            case AttributeUsageType.StaticDraw:
                return gl.STATIC_DRAW;
            case AttributeUsageType.DynamicDraw:
                return gl.DYNAMIC_DRAW;
            default:
                throw "[VertexArrayObject.getUsage] invalid usage";
        }
    }

    constructor({gpu, attributes = [], indices = null}) {
        super();
        
        this.#gpu = gpu;

        const gl = this.#gpu.gl;
        this.#vao = gl.createVertexArray();

        // bind vertex array to webgl context
        gl.bindVertexArray(this.#vao);

        attributes.forEach(attribute => {
            this.setAttribute(attribute);
        });

        if(indices) {
            this.#ibo = new IndexBufferObject({gpu, indices})
        }

        // unbind vertex array to webgl context
        gl.bindVertexArray(null);

        // unbind array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        // unbind index buffer
        if(this.#ibo) {
            this.#ibo.unbind();
        }
    }

    updateAttribute(key, data) {
        const gl = this.#gpu.gl;
        const targetVBO = this.#vboList.find(({ name }) => key === name);
        gl.bindBuffer(gl.ARRAY_BUFFER, targetVBO.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, targetVBO.usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
    
    setAttribute(attribute, push = false) {
        const gl = this.#gpu.gl;

        if(push) {
            // bind vertex array to webgl context
            gl.bindVertexArray(this.#vao);
        }

        const {name, data, size, location, usageType, divisor} = attribute;
        const newLocation = (location !== null && location !== undefined) ? location : this.#vboList.length;
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        const usage = this.getUsage(gl, usageType);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.enableVertexAttribArray(newLocation);

        switch(data.constructor) {
            case Float32Array:
                // size ... 頂点ごとに埋める数
                // stride is always 0 because buffer is not interleaved.
                // ref: https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
                gl.vertexAttribPointer(newLocation, size, gl.FLOAT, false, 0, 0);
                break;
            case Uint16Array:
                gl.vertexAttribIPointer(newLocation, size, gl.UNSIGNED_SHORT, 0, 0);
                break;
            default:
                throw "[VertexArrayObject.setAttribute] invalid data type";
        }

        if(divisor) {
            gl.vertexAttribDivisor(newLocation, divisor);
        }

        this.#vboList.push({ name, vbo, usage });
        
        if(push) {
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }
}
﻿






// NOTE: あんまりgpu持たせたくないけど持たせた方がいろいろと楽
// TODO: actorをlifecycleに乗せたのでgpuもたせなくてもいいかも
class Geometry {
    attributes = [];
    vertexCount;
    vertexArrayObject;
    indices;
    drawCount;

    instanceCount;

    #gpu;

    constructor({
        gpu,
        attributes,
        indices,
        drawCount,
        calculateBinormal = false,
        instanceCount = null,
    }) {
        this.#gpu = gpu;
        
        this.instanceCount = instanceCount;
        this.drawCount = drawCount;

        if (indices) {
            this.indices = indices;
        }
        
        this.vertexArrayObject = new VertexArrayObject({
            gpu,
            attributes: [],
            indices: this.indices
        });
        
        (attributes.filter(e => Object.keys(e).length > 0)).forEach(attribute => {
            this.setAttribute(attribute);
        });
    }
    
    // TODO: attribute class を渡す、で良い気がする
    setAttribute(attribute) {
        const location = attribute.location
            ? attribute.location
            : this.attributes.length;
        
        const attr = new Attribute({
            name: attribute.name,
            data: attribute.data,
            location,
            size: attribute.size,
            offset: attribute.offset,
            usage: attribute.usage || AttributeUsageType.StaticDraw,
            divisor: attribute.divisor
        });
        this.attributes.push(attr);

        this.vertexArrayObject.setAttribute(attr, true);
    }
   
    #createGeometry({ gpu }) {
        console.log("[Geometry.createGeometry]", this.attributes)
        this.vertexArrayObject = new VertexArrayObject({
            gpu,
            attributes: this.attributes,
            indices: this.indices
        });
    }
    
    start() {
        if(!this.vertexArrayObject) {
            this.#createGeometry({ gpu: this.#gpu })
        }
    }
    
    update() {
        if(!this.vertexArrayObject) {
            this.#createGeometry({ gpu: this.#gpu })
        }
    }

    updateAttribute(key, data) {
        const attribute = this.attributes.find(({ name }) => name === key);
        attribute.data = data;
        this.vertexArrayObject.updateAttribute(key, attribute.data);
    }
    
    getAttribute(key) {
        return this.attributes.find(({ name }) => name === key);
    }

    getAttributeDescriptors() {
        return this.attributes.map(attribute => attribute.getDescriptor());
    }

    static createTangentsAndBinormals(normals) {
        const tangents = [];
        const binormals = [];
        for(let i = 0; i < normals.length / 3; i++) {
            const x = normals[i * 3 + 0];
            const y = normals[i * 3 + 1];
            const z = normals[i * 3 + 2];
            const n = new Vector3(x, y, z);
            const t = Vector3.getTangent(n);
            const b = Vector3.getBinormalFromTangent(t, n);
            tangents.push(...t.elements);
            binormals.push(...b.elements);
        }
        return {
            tangents,
            binormals
        };
    }
    
    static createBinormals(normals, tangents) {
        const binormals = [];
        for(let i = 0; i < normals.length / 3; i++) {
            const n = new Vector3(
                normals[i * 3 + 0],
                normals[i * 3 + 1],
                normals[i * 3 + 2]
            );
            const t = new Vector3(
                tangents[i * 3 + 0],
                tangents[i * 3 + 1],
                tangents[i * 3 + 2]
            );
            const b = Vector3.getBinormalFromTangent(t, n);
            binormals.push(...b.elements);
        }
        return binormals;
    }
}






const arrowHelperGeometryData = `
# Blender 3.3.1
# www.blender.org
mtllib untitled.mtl
o Cube
v 2.000000 0.031250 -0.031250
v 2.000000 -0.031250 -0.031250
v -0.125000 -0.125000 0.125000
v -0.125000 0.125000 0.125000
v 2.000000 0.031250 0.031250
v 2.000000 -0.031250 0.031250
v 0.125000 -0.125000 0.125000
v 0.125000 0.125000 0.125000
v -0.125000 0.125000 -0.125000
v 0.125000 -0.125000 -0.125000
v 0.125000 0.125000 -0.125000
v 0.031250 0.031250 2.000000
v 0.031250 -0.031250 2.000000
v -0.031250 0.031250 2.000000
v -0.031250 -0.031250 2.000000
v -0.031250 2.000000 0.031250
v 0.031250 2.000000 0.031250
v -0.031250 2.000000 -0.031250
v 0.031250 2.000000 -0.031250
v 0.125000 -0.125000 0.125000
v 0.125000 0.125000 0.125000
v 0.125000 -0.125000 -0.125000
v 0.125000 0.125000 -0.125000
v -0.125000 0.125000 0.125000
v 0.125000 0.125000 0.125000
v -0.125000 0.125000 -0.125000
v 0.125000 0.125000 -0.125000
v -0.125000 -0.125000 0.125000
v -0.125000 0.125000 0.125000
v 0.125000 -0.125000 0.125000
v 0.125000 0.125000 0.125000
vn 0.0499 -0.0000 -0.9988
vn -0.9988 0.0499 -0.0000
vn 0.0499 -0.9988 -0.0000
vn 0.0499 -0.0000 0.9988
vn 0.0499 0.9988 -0.0000
vn 1.0000 -0.0000 -0.0000
vn 0.9988 -0.0000 0.0499
vn -0.0000 -0.0000 -1.0000
vn -0.0000 0.9988 0.0499
vn -0.0000 -0.9988 0.0499
vn -0.0000 -0.0000 1.0000
vn -0.9988 -0.0000 0.0499
vn -0.0000 -1.0000 -0.0000
vn -0.0000 1.0000 -0.0000
vn -0.0000 0.0499 0.9988
vn 0.9988 0.0499 -0.0000
vn -0.0000 0.0499 -0.9988
vn -1.0000 -0.0000 -0.0000
vt 0.114221 0.031000
vt 0.179909 0.031000
vt 0.081377 0.739333
vt 0.147065 0.031000
vt 0.114221 0.656000
vt 0.081377 0.656000
vt 0.311911 0.000000
vt 0.441550 0.000000
vt 0.409140 0.000000
vt 0.657406 0.000000
vt 0.592467 0.000000
vt 0.376730 0.000000
vt 0.048533 0.656000
vt 0.147065 0.031000
vt 0.048533 0.739333
vt 0.048533 0.656000
vt 0.081377 0.656000
vt 0.409140 0.625000
vt 0.081377 0.031000
vt 0.344321 0.000000
vt 0.048533 0.031000
vt 0.344321 0.000000
vt 0.592467 0.000000
vt 0.147065 0.656000
vt 0.376730 0.625000
vt 0.689875 0.000000
vt 0.559997 0.000000
vt 0.657406 0.000000
vt 0.147065 0.656000
vt 0.114221 0.031000
vt 0.179909 0.656000
vt 0.114221 0.656000
vt 0.624936 0.000000
vt 0.376730 0.000000
vt 0.344321 0.625000
vt 0.344321 0.708333
vt 0.409140 0.000000
vt 0.344321 0.625000
vt 0.376730 0.625000
vt 0.311911 0.708333
vt 0.409140 0.625000
vt 0.311911 0.625000
vt 0.441550 0.625000
vt 0.657406 0.708333
vt 0.592467 0.625000
vt 0.657406 0.625000
vt 0.624936 0.708333
vt 0.689875 0.625000
vt 0.592467 0.625000
vt 0.559997 0.625000
vt 0.657406 0.625000
vt 0.624936 0.625000
vt 0.114221 0.656000
vt 0.114221 0.739333
vt 0.081377 0.656000
vt 0.081377 0.739333
vt 0.657406 0.708333
vt 0.689875 0.708333
vt 0.657406 0.625000
vt 0.689875 0.625000
vt 0.376730 0.625000
vt 0.376730 0.708333
vt 0.344321 0.625000
vt 0.344321 0.708333
s 0
f 11/32/1 2/4/1 10/29/1
f 4/11/2 18/50/2 9/27/2
f 10/30/3 6/17/3 7/19/3
f 7/19/4 5/13/4 8/21/4
f 8/24/5 1/2/5 11/31/5
f 2/6/6 5/15/6 6/16/6
f 8/25/7 13/37/7 7/18/7
f 31/64/8 28/61/8 29/62/8
f 4/12/9 12/35/9 8/22/9
f 7/20/10 15/42/10 3/7/10
f 13/38/11 14/40/11 15/42/11
f 3/8/12 14/41/12 4/9/12
f 26/59/13 25/58/13 24/57/13
f 17/47/14 18/51/14 16/44/14
f 8/26/15 16/46/15 4/10/15
f 11/33/16 17/49/16 8/23/16
f 9/28/17 19/52/17 11/33/17
f 23/56/18 20/53/18 21/54/18
f 11/32/1 1/1/1 2/4/1
f 4/11/2 16/45/2 18/50/2
f 10/30/3 2/5/3 6/17/3
f 7/19/4 6/17/4 5/13/4
f 8/24/5 5/14/5 1/2/5
f 2/6/6 1/3/6 5/15/6
f 8/25/7 12/34/7 13/37/7
f 31/64/8 30/63/8 28/61/8
f 4/12/9 14/39/9 12/35/9
f 7/20/10 13/38/10 15/42/10
f 13/38/11 12/36/11 14/40/11
f 3/8/12 15/43/12 14/41/12
f 26/59/13 27/60/13 25/58/13
f 17/47/14 19/52/14 18/51/14
f 8/26/15 17/48/15 16/46/15
f 11/33/16 19/52/16 17/49/16
f 9/28/17 18/51/17 19/52/17
f 23/56/18 22/55/18 20/53/18
`

class ArrowHelper extends Mesh {
    constructor({ gpu }) {
        const objData = parseObj(arrowHelperGeometryData);
        const geometry = new Geometry({
            gpu,
            attributes: [
                {
                    name: "position",
                    data: new Float32Array(objData.positions),
                    size: 3
                }, {
                    name: "uv",
                    data: new Float32Array(objData.uvs),
                    size: 2
                }
            ],
            indices: objData.indices,
            drawCount: objData.indices.length
        });
        // const geometry = new ArrowGeometry({ gpu });
        const material = new Material({
            gpu,
            vertexShader: `#version 300 es
            layout (location = 0) in vec3 ${AttributeNames.Position};
            layout (location = 1) in vec2 ${AttributeNames.Uv};
            uniform mat4 ${UniformNames.WorldMatrix};
            uniform mat4 ${UniformNames.ViewMatrix};
            uniform mat4 ${UniformNames.ProjectionMatrix};
            out vec2 vUv;
            void main() {
                vUv = aUv;
                gl_Position = ${UniformNames.ProjectionMatrix} * ${UniformNames.ViewMatrix} * ${UniformNames.WorldMatrix} * vec4(${AttributeNames.Position}, 1.);
            }
            `,
            fragmentShader: `#version 300 es
            precision mediump float;
            in vec2 vUv;
            out vec4 outColor;
            void main() {
                vec3 color = vec3(1., 0., 0.);
                if(vUv.x > .5) {
                    color = vec3(0., 1., 0.);
                } else if(vUv.x > .25) {
                    color = vec3(0., 0., 1.);
                }
                outColor = vec4(color, 1.);
            }
            `
        });
        super({ geometry, material });
    }
    
    // setPosition(p) {
    //     this.transform.setTranslation(p);
    // }

    setDirection(p) {
        this.transform.lookAt(p);
    }

}
﻿





const axesHelperGeometryData = `
# Blender 3.3.1
# www.blender.org
o Cube
v 2.000000 0.031250 -0.031250
v 2.000000 -0.031250 -0.031250
v -0.125000 -0.125000 0.125000
v -0.125000 0.125000 0.125000
v 2.000000 0.031250 0.031250
v 2.000000 -0.031250 0.031250
v 0.125000 -0.125000 0.125000
v 0.125000 0.125000 0.125000
v -0.125000 0.125000 -0.125000
v 0.125000 -0.125000 -0.125000
v 0.125000 0.125000 -0.125000
v 0.031250 0.031250 2.000000
v 0.031250 -0.031250 2.000000
v -0.031250 0.031250 2.000000
v -0.031250 -0.031250 2.000000
v -0.031250 2.000000 0.031250
v 0.031250 2.000000 0.031250
v -0.031250 2.000000 -0.031250
v 0.031250 2.000000 -0.031250
v 0.125000 -0.125000 0.125000
v 0.125000 0.125000 0.125000
v 0.125000 -0.125000 -0.125000
v 0.125000 0.125000 -0.125000
v -0.125000 0.125000 0.125000
v 0.125000 0.125000 0.125000
v -0.125000 0.125000 -0.125000
v 0.125000 0.125000 -0.125000
v -0.125000 -0.125000 0.125000
v -0.125000 0.125000 0.125000
v 0.125000 -0.125000 0.125000
v 0.125000 0.125000 0.125000
vn 0.0499 -0.0000 -0.9988
vn -0.9988 0.0499 -0.0000
vn 0.0499 -0.9988 -0.0000
vn 0.0499 -0.0000 0.9988
vn 0.0499 0.9988 -0.0000
vn 1.0000 -0.0000 -0.0000
vn 0.9988 -0.0000 0.0499
vn -0.0000 -0.0000 -1.0000
vn -0.0000 0.9988 0.0499
vn -0.0000 -0.9988 0.0499
vn -0.0000 -0.0000 1.0000
vn -0.9988 -0.0000 0.0499
vn -0.0000 -1.0000 -0.0000
vn -0.0000 1.0000 -0.0000
vn -0.0000 0.0499 0.9988
vn 0.9988 0.0499 -0.0000
vn -0.0000 0.0499 -0.9988
vn -1.0000 -0.0000 -0.0000
vt 0.114221 0.031000
vt 0.179909 0.031000
vt 0.081377 0.739333
vt 0.147065 0.031000
vt 0.114221 0.656000
vt 0.081377 0.656000
vt 0.311911 0.000000
vt 0.441550 0.000000
vt 0.409140 0.000000
vt 0.657406 0.000000
vt 0.592467 0.000000
vt 0.376730 0.000000
vt 0.048533 0.656000
vt 0.147065 0.031000
vt 0.048533 0.739333
vt 0.048533 0.656000
vt 0.081377 0.656000
vt 0.409140 0.625000
vt 0.081377 0.031000
vt 0.344321 0.000000
vt 0.048533 0.031000
vt 0.344321 0.000000
vt 0.592467 0.000000
vt 0.147065 0.656000
vt 0.376730 0.625000
vt 0.689875 0.000000
vt 0.559997 0.000000
vt 0.657406 0.000000
vt 0.147065 0.656000
vt 0.114221 0.031000
vt 0.179909 0.656000
vt 0.114221 0.656000
vt 0.624936 0.000000
vt 0.376730 0.000000
vt 0.344321 0.625000
vt 0.344321 0.708333
vt 0.409140 0.000000
vt 0.344321 0.625000
vt 0.376730 0.625000
vt 0.311911 0.708333
vt 0.409140 0.625000
vt 0.311911 0.625000
vt 0.441550 0.625000
vt 0.657406 0.708333
vt 0.592467 0.625000
vt 0.657406 0.625000
vt 0.624936 0.708333
vt 0.689875 0.625000
vt 0.592467 0.625000
vt 0.559997 0.625000
vt 0.657406 0.625000
vt 0.624936 0.625000
vt 0.114221 0.656000
vt 0.114221 0.739333
vt 0.081377 0.656000
vt 0.081377 0.739333
vt 0.657406 0.708333
vt 0.689875 0.708333
vt 0.657406 0.625000
vt 0.689875 0.625000
vt 0.376730 0.625000
vt 0.376730 0.708333
vt 0.344321 0.625000
vt 0.344321 0.708333
s 0
f 11/32/1 2/4/1 10/29/1
f 4/11/2 18/50/2 9/27/2
f 10/30/3 6/17/3 7/19/3
f 7/19/4 5/13/4 8/21/4
f 8/24/5 1/2/5 11/31/5
f 2/6/6 5/15/6 6/16/6
f 8/25/7 13/37/7 7/18/7
f 31/64/8 28/61/8 29/62/8
f 4/12/9 12/35/9 8/22/9
f 7/20/10 15/42/10 3/7/10
f 13/38/11 14/40/11 15/42/11
f 3/8/12 14/41/12 4/9/12
f 26/59/13 25/58/13 24/57/13
f 17/47/14 18/51/14 16/44/14
f 8/26/15 16/46/15 4/10/15
f 11/33/16 17/49/16 8/23/16
f 9/28/17 19/52/17 11/33/17
f 23/56/18 20/53/18 21/54/18
f 11/32/1 1/1/1 2/4/1
f 4/11/2 16/45/2 18/50/2
f 10/30/3 2/5/3 6/17/3
f 7/19/4 6/17/4 5/13/4
f 8/24/5 5/14/5 1/2/5
f 2/6/6 1/3/6 5/15/6
f 8/25/7 12/34/7 13/37/7
f 31/64/8 30/63/8 28/61/8
f 4/12/9 14/39/9 12/35/9
f 7/20/10 13/38/10 15/42/10
f 13/38/11 12/36/11 14/40/11
f 3/8/12 15/43/12 14/41/12
f 26/59/13 27/60/13 25/58/13
f 17/47/14 19/52/14 18/51/14
f 8/26/15 17/48/15 16/46/15
f 11/33/16 19/52/16 17/49/16
f 9/28/17 18/51/17 19/52/17
f 23/56/18 22/55/18 20/53/18
`;

class AxesHelper extends Mesh {
    constructor({ gpu }) {
        const objData = parseObj(axesHelperGeometryData);
        const geometry = new Geometry({
            gpu,
            attributes: [
                {
                    name: AttributeNames.Position,
                    data: new Float32Array(objData.positions),
                    size: 3
                }, {
                    name: AttributeNames.Uv,
                    data: new Float32Array(objData.uvs),
                    size: 2
                }
            ],
            indices: objData.indices,
            drawCount: objData.indices.length
        });
        const material = new Material({
            gpu,
            vertexShader: `#version 300 es
            layout (location = 0) in vec3 ${AttributeNames.Position};
            layout (location = 1) in vec2 ${AttributeNames.Uv};
            uniform mat4 ${UniformNames.WorldMatrix};
            uniform mat4 ${UniformNames.ViewMatrix};
            uniform mat4 ${UniformNames.ProjectionMatrix};
            out vec2 vUv;
            void main() {
                vUv = aUv;
                gl_Position = ${UniformNames.ProjectionMatrix} * ${UniformNames.ViewMatrix} * ${UniformNames.WorldMatrix} * vec4(${AttributeNames.Position}, 1.);
            }
            `,
            fragmentShader: `#version 300 es
            precision mediump float;
            in vec2 vUv;
            out vec4 outColor;
            void main() {
                vec3 color = vec3(1., 0., 0.);
                if(vUv.x > .5) {
                    color = vec3(0., 1., 0.);
                } else if(vUv.x > .25) {
                    color = vec3(0., 0., 1.);
                }
                outColor = vec4(color, 1.);
            }
            `,
        });
        super({ geometry, material });
    }
}
﻿


class Light extends Actor {
    intensity;
    color;
    castShadow; // bool
    shadowCamera;
    shadowMap; // TODO: shadow camera に持たせたほうが良いような気もする
    
    constructor() {
        super(ActorTypes.Light);
    }

    setShadowSize() {
        throw "should implementation";
    }
}
﻿
class Vector4 {
    #elements;
    
    constructor(x, y, z, w) {
        this.set(x, y, z, w);
    }
    
    get x() {
        return this.#elements[0];
    }
    
    get y() {
        return this.#elements[1];
    }

    get z() {
        return this.#elements[2];
    }

    get w() {
        return this.#elements[3];
    }
    
    set(x, y, z, w) {
        this.#elements = new Float32Array([x, y, z, w]);
    }
}
﻿


// TODO: texStorage2Dを使う場合と出し分ける
class Texture extends GLObject {
    #texture;
    #img;
    #gpu;
    type;
    minFilter;
    magFilter;

    get glObject() {
        return this.#texture;
    }

    constructor({
        gpu,
        img,
        type = TextureTypes.RGBA,
        width, height,
        mipmap = false,
        minFilter = TextureFilterTypes.Nearest, magFilter = TextureFilterTypes.Nearest,
        wrapS = TextureWrapTypes.ClampToEdge, wrapT = TextureWrapTypes.ClampToEdge,
        flipY = false,
    }) {
        super();

        this.#gpu = gpu;
        const gl = this.#gpu.gl;

        this.#img = img || null;
        this.type = type;
        this.mipmap = mipmap;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.flipY = flipY;
        this.width = width;
        this.height = height;
        
        if(!this.#img && (!width || !height)) {
            console.error("[Texture.constructor] invalid width or height")
        }

        this.#texture = gl.createTexture();

        // bind texture object to gl
        gl.bindTexture(gl.TEXTURE_2D, this.#texture);

        // mipmap settings
        if (mipmap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
      
        // filter
        // filterable ref: https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
        switch(this.type) {
            case TextureTypes.RGBA:
            case TextureTypes.RGBA16F:
            case TextureTypes.RGBA32F:
                // min filter settings
                switch(this.minFilter) {
                    case TextureFilterTypes.Nearest:
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        break;
                    case TextureFilterTypes.Linear:
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        break;
                    default:
                        throw "invalid min filter type"
                }
                // mag filter settings
                switch(this.magFilter) {
                    case TextureFilterTypes.Nearest:
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        break;
                    case TextureFilterTypes.Linear:
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        break;
                    default:
                        throw "invalid mag filter type"
                }
                break;
               
            // TODO: depthの場合nearest必須？
            case TextureTypes.Depth:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
                
            // // 「filterできない」で合っているはず？
            // case TextureTypes.RGBA32F:
            //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            //     break;

            default:
                throw "invalid texture type";
        }
        
        // wrap settings
        switch(wrapS) {
            case TextureWrapTypes.ClampToEdge:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                break;
            case TextureWrapTypes.Repeat:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                break;
        }
        switch(wrapT) {
            case TextureWrapTypes.ClampToEdge:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                break;
            case TextureWrapTypes.Repeat:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                break;
        }

        if (!!this.#img || flipY) {
            // uv座標そのものは左下からなのでglもそれに合わせるためにflip
            // html image coord -> gl texture coord
            // (0, 0) - (1, 0)     (0, 1) - (1, 1)
            //   |         |         |         |
            // (0, 1) - (1, 1)     (0, 0) - (1, 0)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        } else {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        }

        // TODO: startみたいな関数でtextureにdataをセットした方が効率よい？
        // bind texture data
        switch(this.type) {
            case TextureTypes.RGBA:
                if (width && height) {
                    // for render target
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
                } else {
                    // set img to texture
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
                }
                break;
                
            case TextureTypes.Depth:
                if (width && height) {
                    // for render target
                    // 1: use 16bit
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, this.#img);
                    // 2: use 32bit
                    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, this.#img);
                } else {
                    // set img to texture
                    // 1: use 16bit
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, this.#img);
                    // 2: use 32bit
                    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT, this.#img);
                }
                break;
                
            case TextureTypes.RGBA16F:
                if (width && height) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, this.#img);
                } else {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, gl.RGBA, gl.FLOAT, this.#img);
                }   
                break;
 
            case TextureTypes.RGBA32F:
                if (width && height) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, this.#img);
                } else {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.RGBA, gl.FLOAT, this.#img);
                }   
                break;
                
            default:
                throw "[Texture.constructor] invalid type";
        }
       
        // TODO: あった方がよい？
        // unbind img
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
        
        const gl = this.#gpu.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.#texture);

        // bind texture data
        switch(this.type) {
            case TextureTypes.RGBA:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
                break;
                
            case TextureTypes.Depth:
                // 1: use 16bit
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, this.#img);
                // 2: use 32bit
                // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, this.#img);
                break;

            case TextureTypes.RGBA16F:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, this.#img);
                break;
                
            case TextureTypes.RGBA32F:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, this.#img);
                break;
                
            default:
                throw "[Texture.setSize] invalid type";
        }
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    update({ width, height, data }) {
        this.width = width;
        this.height = height;
        
        const gl = this.#gpu.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.#texture);
       
        // TODO: execute all type
        switch(this.type) {
            case TextureTypes.RGBA16F:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, this.#img);
                break;
            
            case TextureTypes.RGBA32F:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, data);
                break;
            default:
                throw "[Texture.update] invalid type";
        }
        
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    generate() {
        return new Texture({
            gpu: this.gpu,
            img: this.#img,
            type: this.type,
            width: this.width, height: this.height,
            mipmap: this.mipmap,
            minFilter: this.minFilter, magFilter: this.magFilter,
            wrapS: this.wrapS, wrapT: this.wrapT,
            flipY: this.flipY
        });
    }
}
﻿

class Framebuffer extends GLObject {
    #framebuffer;
    #drawBuffersList = [];
    #gpu;
    
    get drawBufferList() {
        return this.#drawBuffersList;
    }
    
    get glObject() {
        return this.#framebuffer;
    }
    
    get hasMultipleDrawBuffers() {
        return this.#drawBuffersList.length >= 2;
    }
   
    registerDrawBuffer(drawBufferName) {
        this.#drawBuffersList.push(drawBufferName);
    }
    
    constructor({ gpu }) {
        super();
       
        this.#gpu = gpu;
        const gl = this.#gpu.gl;
        
        this.#framebuffer = gl.createFramebuffer();
    }
    
    bind() {
        const gl = this.#gpu.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer);
    }

    unbind() {
        const gl = this.#gpu.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
﻿


class Renderbuffer extends GLObject {
    #gpu;
    #type;
    #renderbuffer;

    get glObject() {
        return this.#renderbuffer;
    }

    constructor({ gpu, type, width, height }) {
        super();
       
        this.#gpu = gpu;
        this.#type = type;
        
        const gl = this.#gpu.gl;
        
        this.#renderbuffer = gl.createRenderbuffer();
        
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.#renderbuffer);
    
        switch(this.#type) {
            case RenderbufferTypes.Depth:
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
                break;
            default:
                throw "[Renderbuffer.constructor] invalid render buffer type.";
        }
        
        // TODO: あったほうがよい？
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
    
    setSize(width, height) {
        const gl = this.#gpu.gl;

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.#renderbuffer);
        
        switch(this.#type) {
            case RenderbufferTypes.Depth:
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
                break;
        }
        
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}

class AbstractRenderTarget {
    isSwappable; // bool
    
    constructor({ isSwappable = false } = {}) {
        this.isSwappable = isSwappable;
    }
    
    get read() {
        throw "[AbstractRenderTarget] should implementation 'read' getter";
    }
    get write() {
        throw "[AbstractRenderTarget] should implementation 'write' getter";
    }
}
﻿





// TODO:
// depth texture を外から渡す形でもいいかも
class RenderTarget extends AbstractRenderTarget {
    name;
    #framebuffer;
    #depthRenderbuffer;
    width;
    height;
    #texture;
    #depthTexture;
    #gpu;

    get texture() {
        return this.#texture;
    }
    
    get depthTexture() {
        return this.#depthTexture;
    }

    get framebuffer() {
        return this.#framebuffer;
    }

    get read() {
        return this;
    }
    
    get write() {
        return this;
    }
    
    constructor({
        gpu,
        name,
        type = RenderTargetTypes.RGBA,
        width = 1,
        height = 1,
        useDepthBuffer = false,
        writeDepthTexture = false,
        minFilter = TextureFilterTypes.Linear,
        magFilter = TextureFilterTypes.Linear,
        mipmap = false,
    }) {
        super();

        this.#gpu = gpu;
        const gl = this.#gpu.gl;

        this.name = name;
        this.type = type;
        
        this.width = width;
        this.height = height;

        this.#framebuffer = new Framebuffer({gpu});
        this.#framebuffer.bind();

        if (useDepthBuffer) {
            this.#depthRenderbuffer = new Renderbuffer({gpu, type: RenderbufferTypes.Depth, width, height});
        }

        // depth as render buffer
        if (this.#depthRenderbuffer) {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.#depthRenderbuffer.glObject);
        }

        if(this.type === RenderTargetTypes.RGBA) {
            this.#texture = new Texture({
                gpu,
                width: this.width,
                height: this.height,
                mipmap,
                type: TextureTypes.RGBA,
                minFilter,
                magFilter
            });
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                this.#texture.glObject,
                0
            );

            this.framebuffer.registerDrawBuffer(gl.COLOR_ATTACHMENT0);
        }

        if(this.type === RenderTargetTypes.Depth || writeDepthTexture) {
            this.#depthTexture = new Texture({
                gpu,
                width: this.width,
                height: this.height,
                mipmap: false,
                type: TextureTypes.Depth,
                // 一旦linear固定
                // minFilter: TextureFilterTypes.Linear,
                // magFilter: TextureFilterTypes.Linear
                minFilter,
                magFilter
            })
            // depth as texture
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D,
                this.#depthTexture.glObject,
                0
            );                      
        }
        
        if(this.#depthTexture && this.#depthRenderbuffer) {
            throw "[RenderTarget.constructor] depth texture and depth render buffer are active.";
        }

        // unbind
        gl.bindTexture(gl.TEXTURE_2D, null);
        if (this.#depthRenderbuffer) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.framebuffer.unbind();
        // Framebuffer.unbind();
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        if(this.#texture) {
            this.#texture.setSize(this.width, this.height);
        }
        if(this.#depthTexture) {
            this.#depthTexture.setSize(this.width, this.height);
        }
        if (this.#depthRenderbuffer) {
            this.#depthRenderbuffer.setSize(width, height);
        }
    }
    
    setTexture(texture) {
        const gl = this.#gpu.gl;
        this.#texture = texture;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer.glObject);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.#texture.glObject,
            0
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    setDepthTexture(depthTexture) {
        const gl = this.#gpu.gl;
        this.#depthTexture = depthTexture;
        this.framebuffer.bind();
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer.glObject);
        // depth as texture
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.#depthTexture.glObject,
            0
        );
        // Framebuffer.unbind();
        this.framebuffer.unbind();
        // // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    static blitDepth({ gpu, sourceRenderTarget, destRenderTarget, width, height }) {
        const gl = gpu.gl;
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sourceRenderTarget.framebuffer.glObject);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, destRenderTarget.framebuffer.glObject);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        if(gl.checkFramebufferStatus(gl.READ_FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.error("invalid state");
            return;
        }
        gl.blitFramebuffer(
            0, 0,
            width, height,
            0, 0,
            width, height,
            gl.DEPTH_BUFFER_BIT,
            gl.NEAREST
        );
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    }
}
﻿









class Camera extends Actor {
    viewMatrix = Matrix4.identity;
    projectionMatrix = Matrix4.identity;
    #renderTarget;
    clearColor; // TODO: color class
    #postProcess;
    near;
    far;
    visibleFrustum = false;
    #visibleFrustumMesh;

    get cameraForward() {
        // 見た目のforwardと逆になる値で正しい
        // ex) (0, 0, 5) -> (0, 0, 0) をみている時、カメラ的には (0, 0, -1) が正しいが (0, 0, 1) が返ってくる
        // なぜなら、projection行列でzを反転させるため
        // pattern_1
        return this.transform.worldForward.negate();
        // pattern_2
        // return new Vector3(this.viewMatrix.m20, this.viewMatrix.m21, this.viewMatrix.m22).negate().normalize();
    }

    get postProcess() {
        return this.#postProcess;
    }

    get enabledPostProcess() {
        if (!this.postProcess) {
            return false;
        }
        return this.postProcess.enabled;
    }

    // get postProcessRenderTarget() {
    //     if(!this.postProcess) {
    //         return null;
    //     }
    //     return this.postProcess.renderTarget;
    // }

    get renderTarget() {
        return this.#renderTarget;
    }

    get writeRenderTarget() {
        if (this.#renderTarget) {
            // for double buffer
            return this.#renderTarget.isSwappable ? this.#renderTarget.write() : this.#renderTarget;
        }
        return null;
    }

    constructor({clearColor, postProcess} = {}) {
        super(ActorTypes.Camera);
        this.clearColor = clearColor || new Vector4(0, 0, 0, 1);
        this.#postProcess = postProcess;
    }

    setSize(width, height) {
        // if (!this.#postProcess) {
        //     return;
        // }
        // if (this.#renderTarget) {
        //     this.#postProcess.setSize(this.#renderTarget.width, this.#renderTarget.height);
        // } else {
        //     this.#postProcess.setSize(width, height);
        // }
        if (this.#renderTarget) {
            this.#renderTarget.setSize(width, height);
        }
        if (this.#postProcess) {
            this.#postProcess.setSize(width, height);
        }
    }

    setPostProcess(postProcess) {
        this.#postProcess = postProcess;
    }

    setClearColor(clearColor) {
        this.clearColor = clearColor;
    }
    
    update({ gpu }) {
        
        super.update({ gpu });
        
        if(this.visibleFrustum && !this.#visibleFrustumMesh) {
            this.#visibleFrustumMesh = new Mesh({
                geometry: new Geometry({
                    gpu,
                    attributes: [
                        {
                            name: AttributeNames.Position,
                            data: new Float32Array(new Array(3 * 8).fill(0)),
                            size: 3,
                            usageType: AttributeUsageType.DynamicDraw
                        },
                    ],
                    drawCount: 2 * 12,
                    indices: [
                        // near clip
                        0, 1,
                        1, 3,
                        3, 2,
                        2, 0,
                        // far clip
                        4, 5,
                        5, 7,
                        7, 6,
                        6, 4,
                        // bridge
                        0, 4,
                        1, 5,
                        2, 6,
                        3, 7
                    ]
                }),
                material: new Material({
                    gpu,
                    vertexShader: `#version 300 es
                    
                    layout (location = 0) in vec3 ${AttributeNames.Position};
                   
                    uniform mat4 ${UniformNames.WorldMatrix};
                    uniform mat4 ${UniformNames.ViewMatrix};
                    uniform mat4 ${UniformNames.ProjectionMatrix};
                    
                    void main() {
                        gl_Position = ${UniformNames.ProjectionMatrix} * ${UniformNames.ViewMatrix} * ${UniformNames.WorldMatrix} * vec4(${AttributeNames.Position}, 1.);
                    }
                    `,
                    fragmentShader: `#version 300 es
                   
                    precision mediump float;
                    
                    out vec4 outColor;
                    
                    void main() {
                        outColor = vec4(0, 1., 0, 1.);
                    }
                    `,
                    primitiveType: PrimitiveTypes.Lines,
                    blendType: BlendTypes.Transparent,
                    depthWrite: false
                })
            });
            this.addChild(this.#visibleFrustumMesh);
        }
        
        if(this.#visibleFrustumMesh) {
            const frustumPositions = this.getFrustumLocalPositions();
            this.#visibleFrustumMesh.geometry.updateAttribute(AttributeNames.Position, new Float32Array([
                // near clip
                ...frustumPositions.nearLeftTop.elements,
                ...frustumPositions.nearLeftBottom.elements,
                ...frustumPositions.nearRightTop.elements,
                ...frustumPositions.nearRightBottom.elements,
                // far clip
                ...frustumPositions.farLeftTop.elements,
                ...frustumPositions.farLeftBottom.elements,
                ...frustumPositions.farRightTop.elements,
                ...frustumPositions.farRightBottom.elements,
            ]));
        }
    }

    updateTransform() {
        super.updateTransform();
        this.viewMatrix = this.transform.worldMatrix.clone().invert();
    }

    setRenderTarget(renderTarget) {
        this.#renderTarget = renderTarget;
    }

    #updateProjectionMatrix() {
        throw "should implementation";
    }
    
    getFrustumLocalPositions() {
        throw "should implementation";
    }

    getFrustumWorldPositions() {
        throw "should implementation";
    }
}
﻿



class OrthographicCamera extends Camera {
    
    constructor(left, right, bottom, top, near, far) {
        super();
        this.near = near;
        this.far = far;
        this.setSize(1, 1, left, right, bottom, top);
    }
    
    setSize(width, height, left, right, bottom, top) {
        super.setSize(width, height);
        if(left && right && top && bottom) {
            this.left = left;
            this.right = right;
            this.bottom = bottom;
            this.top = top;
        }
        this.updateProjectionMatrix();
    }
    
    updateProjectionMatrix() {
        this.projectionMatrix = Matrix4.getOrthographicMatrix(this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
    
    updateTransform() {
        super.updateTransform();
    }
   
    getFrustumLocalPositions() {
        const localForward = Vector3.back;
        const localRight = Vector3.right;
        const localUp = Vector3.up;

        const halfWidth = (Math.abs(this.left) + Math.abs(this.right)) / 2;
        const halfHeight = (Math.abs(this.top) + Math.abs(this.right)) / 2;

        const nearClipCenter = localForward.clone().scale(this.near);
        const farClipCenter = localForward.clone().scale(this.far);
        
        const clipRightOffset = localRight.clone().scale(halfWidth);
        const clipUpOffset = localUp.clone().scale(halfHeight);
        
        const nearLeftTop = Vector3.addVectors(
            nearClipCenter,
            clipRightOffset.clone().negate(),
            clipUpOffset
        );
        const nearRightTop = Vector3.addVectors(
            nearClipCenter,
            clipRightOffset,
            clipUpOffset
        );
        const nearLeftBottom = Vector3.addVectors(
            nearClipCenter,
            clipRightOffset.clone().negate(),
            clipUpOffset.clone().negate()
        );
        const nearRightBottom = Vector3.addVectors(
            nearClipCenter,
            clipRightOffset,
            clipUpOffset.clone().negate()
        );
        
        const farLeftTop = Vector3.addVectors(
            farClipCenter,
            clipRightOffset.clone().negate(),
            clipUpOffset
        );
        const farRightTop = Vector3.addVectors(
            farClipCenter,
            clipRightOffset,
            clipUpOffset
        );
        const farLeftBottom = Vector3.addVectors(
            farClipCenter,
            clipRightOffset.clone().negate(),
            clipUpOffset.clone().negate()
        );
        const farRightBottom = Vector3.addVectors(
            farClipCenter,
            clipRightOffset,
            clipUpOffset.clone().negate()
        );
        
        return {
            nearLeftTop,
            nearRightTop,
            nearLeftBottom,
            nearRightBottom,
            farLeftTop,
            farRightTop,
            farLeftBottom,
            farRightBottom,
        }
    }
    
    getFrustumWorldPositions() {
        const worldPositions = {};
        const localPositions = this.getFrustumLocalPositions();
        Object.keys(localPositions).forEach(key => {
            const wp = localPositions[key].multiplyMatrix4(this.transform.worldMatrix);
            worldPositions[key] = wp;
        });
        return worldPositions;
    }
}
﻿



class PerspectiveCamera extends Camera {
    fov;
    aspect;
    
    constructor(fov, aspect, near, far) {
        super();
        this.fov = fov;
        this.near = near;
        this.far = far;
        this.setSize(aspect);
    }
    
    setSize(width, height) {
        super.setSize(width, height);
        this.aspect = width / height;
        this.#updateProjectionMatrix();
    }
    
    #updateProjectionMatrix() {
        this.projectionMatrix = Matrix4.getPerspectiveMatrix(this.fov * Math.PI / 180, this.aspect, this.near, this.far);
    }

    // afterUpdatedTransform() {
    //     super.afterUpdatedTransform();
    // }
}





class DoubleBuffer extends AbstractRenderTarget {
    #renderTargets = [];
    
    currentReadIndex = 0;
    
    constructor(renderTargetOptions) {
        super({ isSwappable: true });
        for(let i = 0; i < 2; i++) {
            this.#renderTargets.push(new RenderTarget(
                { ...renderTargetOptions, ...({ name: `double-buffer_${i}` }) }
            ));
        }
    }
    
    setSize(width, height) {
        this.#renderTargets.forEach(renderTarget => renderTarget.setSize(width, height));
    }

    get read() {
        return this.#renderTargets[this.currentReadIndex];
    }
    
    get write() {
        return this.#renderTargets[this.currentReadIndex ^ 1];
    }

    swap() {
        this.currentReadIndex = (this.currentReadIndex + 1) % 2;
    }
}
﻿







class DirectionalLight extends Light {
    constructor() {
        super();

        this.shadowCamera = new OrthographicCamera(-1, 1, -1, 1, 0.1, 1);
        // ライトが向いている方向と逆を向かせたいので(projectionの過程でz軸が逆になるから)
        this.shadowCamera.transform.setRotationY(180);
        this.addChild(this.shadowCamera);
    }
}
﻿







class SkinnedMesh extends Mesh {
    bones;
    boneCount = 0;
   
    // positions = [];
    // boneIndices = [];
    // boneWeights = [];
    
    boneOffsetMatrices;
    
    #boneIndicesForLines = [];
    #boneOrderedIndex = [];
    
    #jointTexture;
    
    #gpuSkinning;
    
    #animationClips;

    // TODO: editable
    #jointTextureColNum = 1;

    #jointMatricesAllFrames;
    
    debugBoneView;
    
    // TODO: generate vertex shader in constructor
    constructor({bones, debugBoneView, gpu, ...options}) {
        super({
            ...options,
            actorType: ActorTypes.SkinnedMesh,
            autoGenerateDepthMaterial: true,
        });

        this.bones = bones;
        this.debugBoneView = !!debugBoneView;

        // bone index order な配列を作っておく
        this.bones.traverse((bone) => {
            this.boneCount++;
            this.#boneOrderedIndex[bone.index] = bone;
        });
        
        // for debug
        // console.log(this.positions, this.boneIndices, this.boneWeights)
    }
   
    start(options) {
        const { gpu } = options;

        this.bones.calcBoneOffsetMatrix();
        
        // ボーンオフセット行列を計算
        this.boneOffsetMatrices = this.getBoneOffsetMatrices();

        this.#gpuSkinning = !!this.mainMaterial.gpuSkinning;

        // ボーンごとの joint matrix をテクスチャに詰める
        // 1ボーンあたり4pixel（4 channel x 4 pixel = 16） 必要
        // 精度は16bitで十分だが jsのtypedarrayには16bitがないので32bitを使う
        // bit容量は下記
        // 32bit (bit per channel) * 16 (4 channel * 4 pixel) * N bones
        this.#jointTexture = new Texture({
            gpu,
            width: 1,
            height: 1,
            type: TextureTypes.RGBA32F
        });

        this.materials.forEach(material => {
            material.uniforms = {
                ...material.uniforms,
                ...this.generateSkinningUniforms()
            }
            material.isSkinning = true;
            material.gpuSkinning = this.#gpuSkinning;
            material.jointNum = this.boneCount;
        });

        this.mainMaterial.depthUniforms = {
            ...this.mainMaterial.depthUniforms,
            ...this.generateSkinningUniforms()
        } 

        super.start(options);

        if(this.debugBoneView) {
            this.#createSkinDebugger({ gpu });
        }

        // アニメーションもテクスチャに焼きたいのでanimationClipsが必要
        if(this.#animationClips && this.#gpuSkinning) {
            const animationData = [];
            
            // TODO: refactor
            this.#animationClips.forEach((animationClip, i) => {
                const dataEachKeyframes = animationClip.getAllKeyframesValue();
                animationData[i] = [];
                dataEachKeyframes.forEach((dataKeyframes, frameIndex) => {
                    animationData[i][frameIndex] = [];
                    dataKeyframes.forEach(elem => {
                        const boneIndex = elem.target.index;
                        if(!animationData[i][frameIndex][boneIndex]) {
                            animationData[i][frameIndex][boneIndex] = {
                                bone: elem.target
                            };
                        }
                        animationData[i][frameIndex][boneIndex][elem.key] = elem.frameValue;
                    });
                });
            });
            
            let jointMatricesAllFrames = [];
           
            // TODO: refactor
            animationData.forEach((clips, clipIndex) => {
                jointMatricesAllFrames[clipIndex] = [];
                clips.forEach((keyframeData, frameIndex) => {
                    // boneにkeyframeごとの計算を割り当て
                    keyframeData.forEach((data) => {
                        const { translation, rotation, scale, bone } = data;
                        const targetBone = this.#boneOrderedIndex[bone.index];
                        targetBone.position = translation;
                        targetBone.rotation = Rotator.fromQuaternion(rotation);
                        targetBone.scale = scale;
                    });
                    // boneごとのjointMatrixを再計算
                    this.bones.calcJointMatrix();
                    
                    // どちらも bone index order ではない
                    const boneOffsetMatrices = this.boneOffsetMatrices;
                    const boneJointMatrices = this.getBoneJointMatricesWithBone();

                    // offset行列を踏まえたjoint行列を計算
                    const jointMatrices = boneOffsetMatrices.map((boneOffsetMatrix, i) => Matrix4.multiplyMatrices(boneJointMatrices[i].matrix, boneOffsetMatrix));

                    jointMatricesAllFrames[clipIndex].push(jointMatrices);
                });
            });

            // data[clip_index][frame_index] = mat[bone_count]
            this.#jointMatricesAllFrames = jointMatricesAllFrames;

            jointMatricesAllFrames = [...jointMatricesAllFrames].flat(2);
            
            const framesDuration = this.#animationClips.reduce((acc, cur) => acc + cur.frameCount, 0);
          
            const colNum = this.#jointTextureColNum;
            const boneCount = this.boneCount * framesDuration;
            const rowNum = Math.ceil(boneCount / colNum);
            const fillNum = colNum * rowNum - boneCount;
            const jointData = new Float32Array([
                    ...jointMatricesAllFrames,
                    ...(new Array(fillNum)).fill(0).map(() => Matrix4.identity)
                ]
                .map(m => [...m.elements])
                .flat()
            );
          
            const matrixColNum = 4;
            const dataPerPixel = 4;
            this.#jointTexture.update({
                width: colNum * matrixColNum,
                height: rowNum,
                data: jointData
            });
            
            this.materials.forEach(material => material.uniforms.uTotalFrameCount.value = framesDuration);
            this.depthMaterial.uniforms.uTotalFrameCount.value = framesDuration;
 
            // for debug
            console.log(`# bake skin animation to texture
frames duration: ${framesDuration}
col num: ${colNum},
row num: ${rowNum},
col pixels: ${colNum * matrixColNum},
row pixels: ${rowNum},
total pixels: ${colNum * matrixColNum * rowNum},
all elements: ${colNum * matrixColNum * rowNum * 4},
matrix elements: ${jointData.length}`);
        }
    }

    update(options) {
        super.update(options);
        
        const { time } = options;
        
        this.bones.calcJointMatrix();
      
        if(this.debugBoneView) {
            const boneLinePositions = this.#boneOrderedIndex.map(bone => [...bone.jointMatrix.position.elements]);
            this.boneLines.geometry.updateAttribute(AttributeNames.Position, boneLinePositions.flat())
            this.bonePoints.geometry.updateAttribute(AttributeNames.Position, boneLinePositions.flat())
        }

        if(this.#gpuSkinning) {
            this.materials.forEach(mat => mat.uniforms.uTime.value = time);
            this.depthMaterial.uniforms.uTime.value = time;

            this.materials.forEach(mat => mat.uniforms.uJointTexture.value = this.#jointTexture);
            this.depthMaterial.uniforms.uJointTexture.value = this.#jointTexture;
        } else {
            // NOTE: test update skinning by cpu
            // needs
            const boneOffsetMatrices = this.boneOffsetMatrices;
            const boneJointMatrices = this.getBoneJointMatricesWithBone();

            const jointMatrices = boneOffsetMatrices.map((boneOffsetMatrix, i) => Matrix4.multiplyMatrices(boneJointMatrices[i].matrix, boneOffsetMatrix));
            
            const colNum = this.#jointTextureColNum;
            const rowNum = Math.ceil(this.boneCount / colNum);
            const fillNum = colNum * rowNum - this.boneCount;
            const jointData = new Float32Array([
                    ...jointMatrices,
                    ...(new Array(fillNum)).fill(0).map(() => Matrix4.identity)
                ]
                .map(m => [...m.elements])
                .flat()
            );

            const matrixColNum = 4;
            this.#jointTexture.update({
                width: colNum * matrixColNum,
                height: rowNum,
                data: jointData
            });

            this.materials.forEach(mat => mat.uniforms.uJointTexture.value = this.#jointTexture);
            this.depthMaterial.uniforms.uJointTexture.value = this.#jointTexture;
        }
    }

    generateSkinningUniforms() {
        return {
            // TODO: for cpu
            // material.uniforms.uJointMatrices = {
            //     type: UniformTypes.Matrix4Array,
            //     value: new Array(this.boneCount).fill(0).map(i => Matrix4.identity),
            // };
            uJointTexture: {
                type: UniformTypes.Texture,
                    value: null
            },
            uJointTextureColNum: {
                type: UniformTypes.Int,
                    value: this.#jointTextureColNum,
            },
            ...(this.#gpuSkinning ? {
                uBoneCount: {
                    type: UniformTypes.Int,
                    value: this.boneCount
                },
                uTotalFrameCount: {
                    type: UniformTypes.Int,
                    value: 0,
                }
            } : {})
        }
    }    

    getBoneOffsetMatrices() {
        const matrices = [];
        this.bones.traverse((bone) => {
            const m = bone.boneOffsetMatrix.clone();
            matrices.push(m);
        });
        return matrices;
    }
    
    getBoneJointMatrices() {
        const matrices = [];
        this.bones.traverse((bone) => {
            const m = bone.jointMatrix.clone();
            matrices.push(m);
        });
        return matrices;        
    }
    
    getBoneJointMatricesWithBone() {
        const data = [];
        this.bones.traverse((bone) => {
            const matrix = bone.jointMatrix.clone();
            data.push({ bone, matrix });
        });
        return data;
    }

    #createSkinDebugger({ gpu }) {
        const checkChildNum = (bone) => {
            if(bone.hasChild) {
                bone.children.forEach(childBone => {
                    this.#boneIndicesForLines.push(bone.index, childBone.index);
                    checkChildNum(childBone);
                });
            }
        }
        checkChildNum(this.bones);
        
        this.boneLines = new Mesh({
            gpu,
            geometry: new Geometry({
                gpu,
                attributes: [
                    {
                        name: AttributeNames.Position,
                        data: new Float32Array(new Array(this.#boneOrderedIndex.length * 3).fill(0)),
                        size: 3,
                        usage: AttributeUsageType.DynamicDraw
                    }
                ],
                indices: this.#boneIndicesForLines,
                drawCount: this.#boneIndicesForLines.length
            }),
            material: new Material({
                gpu,
                vertexShader: `#version 300 es
                
                layout (location = 0) in vec3 ${AttributeNames.Position};
                
                uniform mat4 ${UniformNames.WorldMatrix};
                uniform mat4 ${UniformNames.ViewMatrix};
                uniform mat4 ${UniformNames.ProjectionMatrix};
                
                void main() {
                    gl_Position = ${UniformNames.ProjectionMatrix} * ${UniformNames.ViewMatrix} * ${UniformNames.WorldMatrix} * vec4(${AttributeNames.Position}, 1.);
                }
                `,
                fragmentShader: `#version 300 es
                
                precision mediump float;
                
                out vec4 outColor;
                
                void main() {
                    outColor = vec4(0, 1., 0, 1.);
                }
                `,
                primitiveType: PrimitiveTypes.Lines,
                blendType: BlendTypes.Transparent,
                depthWrite: false,
                depthTest: false
            })
        });

        this.bonePoints = new Mesh({
            gpu,
            geometry: new Geometry({
                gpu,
                attributes: [
                    {
                        name: AttributeNames.Position,
                        data: new Float32Array(new Array(this.#boneOrderedIndex.length * 3).fill(0)),
                        size: 3,
                        usage: AttributeUsageType.DynamicDraw
                    }
                ],
                drawCount: this.#boneOrderedIndex.length
            }),
            material: new Material({
                gpu,
                vertexShader: `#version 300 es
               
                layout (location = 0) in vec3 ${AttributeNames.Position};
                
                uniform mat4 ${UniformNames.WorldMatrix};
                uniform mat4 ${UniformNames.ViewMatrix};
                uniform mat4 ${UniformNames.ProjectionMatrix};
                
                void main() {
                    gl_Position = ${UniformNames.ProjectionMatrix} * ${UniformNames.ViewMatrix} * ${UniformNames.WorldMatrix} * vec4(${AttributeNames.Position}, 1.);
                    gl_PointSize = 6.;
                }
                `,
                fragmentShader: `#version 300 es
                
                precision mediump float;
                
                out vec4 outColor;
                
                void main() {
                    outColor = vec4(1, 0., 0, 1.);
                }
                `,
                primitiveType: PrimitiveTypes.Points,
                blendType: BlendTypes.Transparent,
                depthWrite: false,
                depthTest: false
            })
        });
        
        this.addChild(this.boneLines);
        this.addChild(this.bonePoints)       
    }
    
    setAnimationClips(animationClips) {
        this.#animationClips = animationClips;
    }
}
﻿
async function loadImg(src) {
    // TODO: reject pattern
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    });
}
﻿


class CubeMap extends GLObject {
    #texture;
    
    get glObject() {
        return this.#texture;
    }

    constructor({gpu, images = {
        [CubeMapAxis.PositiveX]: null,
        [CubeMapAxis.NegativeX]: null,
        [CubeMapAxis.PositiveY]: null,
        [CubeMapAxis.NegativeY]: null,
        [CubeMapAxis.PositiveZ]: null,
        [CubeMapAxis.NegativeZ]: null,
    }}) {
        super();
        
        const gl = gpu.gl;
        
        this.#texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.#texture);
       
        // cubemapの場合は html img でも falseで良い。というのがよくわかってない。そういうもの？
        // ただ、たしかに反転すると上下が反転して見た目がおかしくなる
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        Object.keys(images).forEach((key) => {
            let axis = null;
            switch(key) {
                case CubeMapAxis.PositiveX:
                    axis = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                    break;
                case CubeMapAxis.NegativeX:
                    axis = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
                    break;
                case CubeMapAxis.PositiveY:
                    axis = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
                    break;
                case CubeMapAxis.NegativeY:
                    axis = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
                    break;
                case CubeMapAxis.PositiveZ:
                    axis = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
                    break;
                case CubeMapAxis.NegativeZ:
                    axis = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
                    break;
                default:
                    throw "invalid axis"
            }
            gl.texImage2D(axis, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[key]);
        });
        
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 
        // TODO: unbindしない方がよい？
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}
﻿



class BoxGeometry extends Geometry {
    constructor({ gpu }) {
        const boxPosition_0 = [-0.5, 0.5, 0.5];
        const boxPosition_1 = [-0.5, -0.5, 0.5];
        const boxPosition_2 = [0.5, 0.5, 0.5];
        const boxPosition_3 = [0.5, -0.5, 0.5];
        const boxPosition_4 = [0.5, 0.5, -0.5];
        const boxPosition_5 = [0.5, -0.5, -0.5];
        const boxPosition_6 = [-0.5, 0.5, -0.5];
        const boxPosition_7 = [-0.5, -0.5, -0.5];

        const normals = [
            [0, 0, 1], // front
            [1, 0, 0], // right
            [0, 0, -1], // back
            [-1, 0, 0], // left
            [0, 1, 0], // top
            [0, -1, 0], // bottom
        ];
        
        super({
            gpu,
            attributes: [
                // -----------------------------
                //    
                //   6 ---- 4
                //  /|     /|
                // 0 ---- 2 |
                // | 7 -- | 5
                // |/     |/
                // 1 ---- 3
                // -----------------------------
                {
                    name: AttributeNames.Position,
                    data: new Float32Array([
                        // front
                        ...boxPosition_0, ...boxPosition_1, ...boxPosition_2, ...boxPosition_3,
                        // right
                        ...boxPosition_2, ...boxPosition_3, ...boxPosition_4, ...boxPosition_5,
                        // back
                        ...boxPosition_4, ...boxPosition_5, ...boxPosition_6, ...boxPosition_7,
                        // left
                        ...boxPosition_6, ...boxPosition_7, ...boxPosition_0, ...boxPosition_1,
                        // top
                        ...boxPosition_6, ...boxPosition_0, ...boxPosition_4, ...boxPosition_2,
                        // bottom
                        ...boxPosition_1, ...boxPosition_7, ...boxPosition_3, ...boxPosition_5,
                    ]),
                    size: 3,
                }, {
                    name: AttributeNames.Uv,
                    data: new Float32Array((new Array(6)).fill(0).map(() => ([
                        0, 1,
                        0, 0,
                        1, 1,
                        1, 0,
                    ])).flat()),
                    size: 2
                }, {
                    name: AttributeNames.Normal,
                    data: new Float32Array(normals.map((normal) => (new Array(4).fill(0).map(() => normal))).flat(2)),
                    size: 3
                },
            ],
            indices: Array.from(Array(6).keys()).map(i => ([
                i * 4 + 0, i * 4 + 1, i * 4 + 2,
                i * 4 + 2, i * 4 + 1, i * 4 + 3,
            ])).flat(),
            drawCount: 6 * 6 // indices count
        });
    }
}

﻿




class PlaneGeometry extends Geometry {
    constructor({
        gpu,
        calculateTangent = false,
        calculateBinormal = false 
    }) {
        const { attributes, indices, drawCount } = PlaneGeometry.createPlaneGeometryData({ calculateTangent, calculateBinormal });

        super({
            gpu,
            attributes,
            indices,
            drawCount,
        });
    }
    
    static createPlaneGeometryData({
        calculateTangent = false,
        calculateBinormal = false 
    } = {}) {
        // -----------------------------
        // 0 ---- 2
        // |    / |
        // |   /  |
        // |  /   |
        // | /    |
        // 1 ---- 3
        // -----------------------------

        const normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];
        
        const { tangents, binormals } = Geometry.createTangentsAndBinormals(normals);
      
        // TODO: uniqでfilter
        const attributes = [
            {
                name: AttributeNames.Position,
                data: new Float32Array([
                    -1, 1, 0,
                    -1, -1, 0,
                    1, 1, 0,
                    1, -1, 0,
                ]),
                size: 3
            }, {
                name: AttributeNames.Uv,
                data: new Float32Array([
                    0, 1,
                    0, 0,
                    1, 1,
                    1, 0,
                ]),
                size: 2
            }, {
                name: AttributeNames.Normal,
                data: new Float32Array(normals),
                size: 3
            },
        ];
        
        if(calculateTangent) {
            attributes.push({
                name: AttributeNames.Tangent,
                data: new Float32Array(tangents),
                size: 3
            });
        }
        if(calculateBinormal) {
            attributes.push({
                name: AttributeNames.Binormal,
                data: new Float32Array(binormals),
                size: 3
            });
        }
        
        return {
            attributes,
            indices: [0, 1, 2, 2, 1, 3],
            drawCount: 6,
        };
    }
}













// 法線が内側を向いた単位立方体
const skyboxGeometryObjText = `
# Blender 3.3.1
# www.blender.org
mtllib skybox-cube.mtl
v -1.000000 -1.000000 1.000000
v -1.000000 1.000000 1.000000
v -1.000000 -1.000000 -1.000000
v -1.000000 1.000000 -1.000000
v 1.000000 -1.000000 1.000000
v 1.000000 1.000000 1.000000
v 1.000000 -1.000000 -1.000000
v 1.000000 1.000000 -1.000000
vn 0.5774 0.5774 0.5774
vn 0.5774 -0.5774 -0.5774
vn 0.5774 0.5774 -0.5774
vn -0.5774 0.5774 0.5774
vn 0.5774 -0.5774 0.5774
vn -0.5774 0.5774 -0.5774
vn -0.5774 -0.5774 0.5774
vn -0.5774 -0.5774 -0.5774
vt 0.375000 0.000000
vt 0.375000 1.000000
vt 0.125000 0.750000
vt 0.625000 0.000000
vt 0.625000 1.000000
vt 0.875000 0.750000
vt 0.125000 0.500000
vt 0.375000 0.250000
vt 0.625000 0.250000
vt 0.875000 0.500000
vt 0.375000 0.750000
vt 0.625000 0.750000
vt 0.375000 0.500000
vt 0.625000 0.500000
s 1
f 3/8/1 2/4/2 1/1/3
f 7/13/4 4/9/5 3/8/1
f 5/11/6 8/14/7 7/13/4
f 1/2/3 6/12/8 5/11/6
f 1/3/3 7/13/4 3/7/1
f 6/12/8 4/10/5 8/14/7
f 3/8/1 4/9/5 2/4/2
f 7/13/4 8/14/7 4/9/5
f 5/11/6 6/12/8 8/14/7
f 1/2/3 2/5/2 6/12/8
f 1/3/3 5/11/6 7/13/4
f 6/12/8 2/6/2 4/10/5
`;

const skyboxVertexShader = `#version 300 es

precision mediump float;

layout (location = 0) in vec3 ${AttributeNames.Position};
layout (location = 1) in vec2 ${AttributeNames.Uv};
layout (location = 2) in vec3 ${AttributeNames.Normal};

uniform mat4 ${UniformNames.WorldMatrix};
uniform mat4 ${UniformNames.ViewMatrix};
uniform mat4 ${UniformNames.ProjectionMatrix};
uniform mat4 ${UniformNames.NormalMatrix};

out vec2 vUv;
out vec3 vNormal;
out vec3 vWorldPosition;

void main() {
    vUv = aUv;
    vNormal = (${UniformNames.NormalMatrix} * vec4(aNormal, 1)).xyz;
    vec4 worldPosition = ${UniformNames.WorldMatrix} * vec4(aPosition, 1);
    vWorldPosition = worldPosition.xyz;
    gl_Position = ${UniformNames.ProjectionMatrix} * ${UniformNames.ViewMatrix} * worldPosition;
}
`;

const skyboxFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;
in vec3 vNormal;
in vec3 vWorldPosition;

uniform samplerCube uCubeTexture;
uniform vec3 uViewPosition;
uniform mat4 uViewDirectionProjectionInverse;
uniform float uRotationOffset;

// out vec4 outColor;
layout (location = 0) out vec4 outBaseColor;
layout (location = 1) out vec4 outNormalColor;

mat2 rotate(float r) {
    float c = cos(r);
    float s = sin(r);
    return mat2(c, s, -s, c);
}

void main() {
    // pattern_1: inverse normal
    vec3 N = normalize(vNormal);
    vec3 reflectDir = -N;

    // pattern_2: world position dir
    // skyboxの中心 = カメラの中心なので、こちらでもよい
    // vec3 reflectDir = normalize(vWorldPosition - uViewPosition);

    reflectDir.x *= -1.;
    reflectDir.xz *= rotate(3.14 + uRotationOffset);
    vec4 textureColor = texture(uCubeTexture, reflectDir);
    
    // outColor = textureColor;
    outBaseColor = textureColor;
    outNormalColor = vec4(0., 0., 0., 1.);
}
`;

class Skybox extends Mesh {
    constructor({gpu, cubeMap, rotationOffset = 0}) {
        const skyboxObjData = parseObj(skyboxGeometryObjText);
        const geometry = new Geometry({
            gpu,
            attributes: [
                {
                    name: AttributeNames.Position,
                    data: new Float32Array(skyboxObjData.positions),
                    size: 3
                }, {
                    name: AttributeNames.Uv,
                    data: new Float32Array(skyboxObjData.uvs),
                    size: 2,
                }, {
                    name: AttributeNames.Normal,
                    data: new Float32Array(skyboxObjData.normals),
                    size: 3
                },
            ],
            indices: skyboxObjData.indices,
            drawCount: skyboxObjData.indices.length
        });

        const material = new Material({
            gpu,
            vertexShader: skyboxVertexShader,
            fragmentShader: skyboxFragmentShader,
            primitiveType: PrimitiveTypes.Triangles,
            depthTest: true,
            depthWrite: false,
            uniforms: {
                uCubeTexture: {
                    type: UniformTypes.CubeMap,
                    value: cubeMap
                },
                uViewDirectionProjectionInverse: {
                    type: UniformTypes.Matrix4,
                    value: Matrix4.identity,
                },
                uRotationOffset: {
                    type: UniformTypes.Float,
                    value: rotationOffset
                },
            }
        });
        
        super({ geometry, material, actorType: ActorTypes.Skybox });
    }
   
    // TODO: renderer側で2回走らないようにする
    updateTransform(camera) {
        if(camera) {
            this.transform.setTranslation(camera.transform.position);
            // 1.733 ... 単位立方体の対角線の長さ sqrt(1 + 1 + 1)
            this.transform.setScaling(Vector3.fill(camera.far / 1.733));
        }
        super.updateTransform();
    }
}
﻿
class TimeSkipper {
    targetFPS;
    #callback;
    #lastTime;
 
    constructor(targetFPS, callback) {
        this.targetFPS = targetFPS;
        this.#callback = callback;
    }

    // time [sec]
    start(time) {
        this.#lastTime = time;
    }
   
    // time [sec]
    exec(time) {
        const interval = 1 / this.targetFPS;
        if((time - interval) >= this.#lastTime) {
            const elapsedTime = time - this.#lastTime;
            const n = Math.floor(elapsedTime / interval);
            const deltaTime = interval * n;
            this.#lastTime += deltaTime;
            this.#callback(this.#lastTime, deltaTime);
        }
    }
}

class TimeAccumulator {
    targetFPS;
    #callback;
    #lastTime;
    maxChaseCount;

    constructor(targetFPS, callback, maxChaseCount = 60) {
        this.targetFPS = targetFPS;
        this.#callback = callback;
        this.maxChaseCount = maxChaseCount;
    }

    // time [sec]
    start(time) {
        this.#lastTime = time;
    }

    // time [sec]
    exec(time) {
        const interval = 1 / this.targetFPS;
        
        if((time - interval) >= this.#lastTime) {
            const elapsedTime = time - this.#lastTime;
            const n = Math.floor(elapsedTime / interval);

            if(n > this.maxChaseCount) {
                console.warn("[TimeAccumulator.exec] jump frame");
                this.#lastTime += interval * n;
                this.#callback(this.#lastTime, interval);
                return;
            }

            const loopNum = Math.min(this.maxChaseCount, n);
            for(let i = 0; i < loopNum; i++) {
                this.#lastTime += interval;
                this.#callback(this.#lastTime, interval);
            }
        }
    }   
}


class Stats {
    domElement;
    drawVertexCountView;
    drawCallCountView;
    drawVertexCount = 0;
    drawCallCount = 0;
    
    constructor({ wrapperElement } = {}) {
        this.domElement = document.createElement("div");
        this.domElement.style.cssText = `
position: absolute;
top: 0;
left: 0;
padding: 0.2em 0.5em;
font-size: 9px;
color: white;
font-weight: bold;
text-shadow: rgba(0, 0, 0, 0.7) 1px 1px;
`;

        this.drawVertexCountView = document.createElement("p");
        this.domElement.appendChild(this.drawVertexCountView);
        
        this.drawCallCountView = document.createElement("p");
        this.domElement.appendChild(this.drawCallCountView);
        
        (wrapperElement || document.body).appendChild(this.domElement);
    }

    clear() {
        this.drawVertexCount = 0;
        this.drawCallCount = 0;
    }

    addDrawVertexCount(geometry) {
        const positionAttribute = geometry.getAttribute(AttributeNames.Position);
        this.drawVertexCount += positionAttribute.data.length / 3;
    }
    
    incrementDrawCall() {
        this.drawCallCount++;
    }
    
    updateView() {
        this.drawVertexCountView.textContent = `vertex count: ${this.drawVertexCount}`;
        this.drawCallCountView.textContent = `draw call count: ${this.drawCallCount}`;
    }
}
﻿




class Engine {
    #gpu;
    #stats;
    #renderer;
    #scenes = [];
    // timers
    #fixedUpdateFrameTimer;
    #updateFrameTimer;
    // callbacks
    #onBeforeStart;
    #onBeforeFixedUpdate;
    #onBeforeUpdate;
    #onRender;
    
    get renderer() {
        return this.#renderer;
    }
    
    set onBeforeStart(cb) {
        this.#onBeforeStart = cb;
    }
    
    set onBeforeUpdate(cb) {
        this.#onBeforeUpdate = cb;
    }
    
    set onBeforeFixedUpdate(cb) {
        this.#onBeforeFixedUpdate = cb;
    }
    
    set onRender(cb) {
        this.#onRender = cb;
    }
    
    constructor({ gpu, renderer, onBeforeFixedUpdate, onBeforeUpdate, onRender }) {
        this.#gpu = gpu;
        this.#renderer = renderer;
        
        this.#stats = new Stats();
        this.#renderer.setStats(this.#stats);

        // TODO: 外からfps変えられるようにしたい
        this.#fixedUpdateFrameTimer = new TimeAccumulator(60, this.fixedUpdate.bind(this));
        this.#updateFrameTimer = new TimeSkipper(60, this.update.bind(this));

        this.#onBeforeFixedUpdate = onBeforeFixedUpdate;
        this.#onBeforeUpdate = onBeforeUpdate;
        this.#onRender = onRender;
    }
    
    setScene(scene) {
        // this.#scene = scene;
        this.#scenes.push(scene);
    }
    
    setScenes(scenes) {
        this.#scenes = scenes;
    }

    start() {
        if(this.#onBeforeStart) {
            this.#onBeforeStart();
        }
        const t = performance.now() / 1000;
        this.#fixedUpdateFrameTimer.start(t);
        this.#updateFrameTimer.start(t);
    }
    
    setSize(width, height) {
        const rw = width * this.renderer.pixelRatio;
        const rh = height * this.renderer.pixelRatio;
        const w = Math.floor(rw);
        const h = Math.floor(rh);
        // this.#scene.traverse((actor) => actor.setSize(w, h));
        this.#scenes.forEach(scene => {
            scene.traverse((actor) => actor.setSize(w, h));
        });
        this.#renderer.setSize(w, h, rw, rh);
    }

    fixedUpdate(fixedTime, fixedDeltaTime) {
        if(this.#onBeforeFixedUpdate) {
            this.#onBeforeFixedUpdate({ fixedTime, fixedDeltaTime });
        }
        
        // this.#scene.traverse((actor) => actor.fixedUpdate({ gpu: this.#gpu, fixedTime, fixedDeltaTime }));
        this.#scenes.forEach(scene => {
            scene.traverse((actor) => actor.fixedUpdate({gpu: this.#gpu, fixedTime, fixedDeltaTime}));
        });

        // update all actors matrix
        // TODO
        // - scene 側でやった方がよい？
        // - skyboxのupdateTransformが2回走っちゃうので、sceneかカメラに持たせて特別扱いさせたい
        // - やっぱりcomponentシステムにした方が良い気もする
        // this.#scene.traverse((actor) => actor.updateTransform());
        this.#scenes.forEach(scene => {
            scene.traverse((actor) => actor.updateTransform());
        });
    }

    update(time, deltaTime) {
        if(this.#onBeforeUpdate) {
            this.#onBeforeUpdate({ time, deltaTime });
        }

        // 本当はあんまりgpu渡したくないけど、渡しちゃったほうがいろいろと楽
        this.#scenes.forEach((scene) => {
            scene.traverse((actor) => {
                actor.update({gpu: this.#gpu, time, deltaTime});
                switch (actor.type) {
                    case ActorTypes.Skybox:
                    case ActorTypes.Mesh:
                    case ActorTypes.SkinnedMesh:
                        actor.beforeRender({gpu: this.#gpu});
                        break;
                    default:
                        break;
                }
            });
        });
        
        this.render(time, deltaTime);
    }
    
    render(time, deltaTime) {
        this.#stats.clear();
        // this.#renderer.render(this.#scene, this.#scene.mainCamera);
        // this.#scenes.forEach(scene => {
        //     this.#renderer.render(scene, scene.mainCamera);
        // });
        if(this.#onRender) {
            this.#onRender(time, deltaTime);
        }
        this.#stats.updateView();
    }
   
    // time [sec]
    run(time) {
        this.#fixedUpdateFrameTimer.exec(time / 1000);
        this.#updateFrameTimer.exec(time / 1000);
    }
}
﻿


class Renderer {
    #gpu;
    canvas;
    pixelRatio;
    #realWidth;
    #realHeight;
    #stats;

    constructor({gpu, canvas, pixelRatio = 1.5}) {
        this.#gpu = gpu;
        this.canvas = canvas;
        this.pixelRatio = pixelRatio;
    }
    
    setStats(stats) {
        this.#stats = stats;
    }

    setSize(width, height, realWidth, realHeight) {
        this.#realWidth = realWidth;
        this.#realHeight = realHeight;
        this.canvas.width = this.#realWidth;
        this.canvas.height = this.#realHeight;
        this.#gpu.setSize(0, 0, this.#realWidth, this.#realHeight);
    }

    setRenderTarget(renderTarget) {
        if (renderTarget) {
            this.#gpu.setFramebuffer(renderTarget.framebuffer)
            this.#gpu.setSize(0, 0, renderTarget.width, renderTarget.height);
        } else {
            this.#gpu.setFramebuffer(null)
            this.#gpu.setSize(0, 0, this.#realWidth, this.#realHeight);
        }
    }

    flush() {
        this.#gpu.flush();
    }

    clear(r, g, b, a) {
        this.#gpu.clear(r, g, b, a);
    }

    #shadowPass(castShadowLightActors, castShadowRenderMeshInfos) {
        castShadowLightActors.forEach(lightActor => {
            this.setRenderTarget(lightActor.shadowMap.write);
            this.clear(0, 0, 0, 1);

            if(castShadowRenderMeshInfos.length < 1) {
                return;
            }

            castShadowRenderMeshInfos.forEach(({ actor }) => {
                const targetMaterial = actor.depthMaterial;
                
                // // TODO: material 側でやった方がよい？
                // if (targetMaterial.uniforms[UniformNames.WorldMatrix]) {
                //     targetMaterial.uniforms[UniformNames.WorldMatrix].value = actor.transform.worldMatrix;
                // }
                // if (targetMaterial.uniforms[UniformNames.ViewMatrix]) {
                //     targetMaterial.uniforms[UniformNames.ViewMatrix].value = lightActor.shadowCamera.viewMatrix;
                // }
                // if (targetMaterial.uniforms[UniformNames.ProjectionMatrix]) {
                //     targetMaterial.uniforms[UniformNames.ProjectionMatrix].value = lightActor.shadowCamera.projectionMatrix;
                // }

                // TODO: material 側でやった方がよい？
                targetMaterial.updateUniform(UniformNames.WorldMatrix, actor.transform.worldMatrix);
                targetMaterial.updateUniform(UniformNames.ViewMatrix, lightActor.shadowCamera.viewMatrix);
                targetMaterial.updateUniform(UniformNames.ProjectionMatrix, lightActor.shadowCamera.projectionMatrix);
              
                this.renderMesh(actor.geometry, targetMaterial);
            });
        });
    }
    
    #buildRenderMeshInfo(actor, materialIndex = 0) {
        return {
            actor,
            materialIndex
        }
    }

    #scenePass(sortedRenderMeshInfos, camera, lightActors, clear = true) {
        // TODO: refactor
        if(clear) {
            this.clear(
                camera.clearColor.x,
                camera.clearColor.y,
                camera.clearColor.z,
                camera.clearColor.w
            );
        }

        sortedRenderMeshInfos.forEach(({ actor, materialIndex }) => {
            switch (actor.type) {
                case ActorTypes.Skybox:
                    // TODO: skyboxのupdateTransformが2回走っちゃうので、sceneかカメラに持たせて特別扱いさせたい
                    actor.updateTransform(camera);
                    break;
            }

            const targetMaterial = actor.materials[materialIndex];
            // const targetMaterial = actor.depthMaterial;

            // reset
            // NOTE: 余計なresetとかしない方がいい気がする
            // if(targetMaterial.uniforms.uShadowMap) {
            //     targetMaterial.uniforms.uShadowMap.value = null;
            // }

            // // TODO: material 側でやった方がよい？
            // if (targetMaterial.uniforms[UniformNames.WorldMatrix]) {
            //     targetMaterial.uniforms[UniformNames.WorldMatrix].value = actor.transform.worldMatrix;
            // }
            // if (targetMaterial.uniforms[UniformNames.ViewMatrix]) {
            //     targetMaterial.uniforms[UniformNames.ViewMatrix].value = camera.viewMatrix;
            // }
            // if (targetMaterial.uniforms[UniformNames.ProjectionMatrix]) {
            //     targetMaterial.uniforms[UniformNames.ProjectionMatrix].value = camera.projectionMatrix;
            // }
            // if (targetMaterial.uniforms[UniformNames.NormalMatrix]) {
            //     targetMaterial.uniforms[UniformNames.NormalMatrix].value = actor.transform.worldMatrix.clone().invert().transpose();
            // }
            // if (targetMaterial.uniforms[UniformNames.ViewPosition]) {
            //     targetMaterial.uniforms[UniformNames.ViewPosition].value = camera.transform.worldMatrix.position;
            // }

            // TODO: material 側でやった方がよい？
            targetMaterial.updateUniform(UniformNames.WorldMatrix, actor.transform.worldMatrix);
            targetMaterial.updateUniform(UniformNames.ViewMatrix, camera.viewMatrix);
            targetMaterial.updateUniform(UniformNames.ProjectionMatrix, camera.projectionMatrix);
            targetMaterial.updateUniform(UniformNames.NormalMatrix, actor.transform.worldMatrix.clone().invert().transpose());
            targetMaterial.updateUniform(UniformNames.ViewPosition, camera.transform.worldMatrix.position);

            // TODO:
            // - light actor の中で lightの種類別に処理を分ける
            // - lightActorsの順番が変わるとprojectionMatrixも変わっちゃうので注意 
            lightActors.forEach(light => {
                if (targetMaterial.uniforms.uDirectionalLight) {
                    // targetMaterial.uniforms.uDirectionalLight = {
                    //     type: UniformTypes.Struct,
                    //     value: {
                    //         direction: {
                    //             type: UniformTypes.Vector3,
                    //             value: light.transform.position,
                    //         },
                    //         intensity: {
                    //             type: UniformTypes.Float,
                    //             value: light.intensity,
                    //         },
                    //         color: {
                    //             type: UniformTypes.Color,
                    //             value: light.color
                    //         }
                    //     }
                    // }
                    targetMaterial.updateUniform("uDirectionalLight", {
                        direction: {
                            type: UniformTypes.Vector3,
                            value: light.transform.position,
                        },
                        intensity: {
                            type: UniformTypes.Float,
                            value: light.intensity,
                        },
                        color: {
                            type: UniformTypes.Color,
                            value: light.color
                        }
                    });
                }

                if (
                    targetMaterial.uniforms[UniformNames.ShadowMapProjectionMatrix] &&
                    targetMaterial.receiveShadow &&
                    light.castShadow
                ) {
                    // clip coord (-1 ~ 1) to uv (0 ~ 1)
                    const textureMatrix = new Matrix4(
                        0.5, 0, 0, 0.5,
                        0, 0.5, 0, 0.5,
                        0, 0, 0.5, 0.5,
                        0, 0, 0, 1
                    );
                    const textureProjectionMatrix = Matrix4.multiplyMatrices(
                        textureMatrix,
                        light.shadowCamera.projectionMatrix.clone(),
                        light.shadowCamera.viewMatrix.clone()
                    );
                    
                    // // TODO:
                    // // - directional light の構造体に持たせた方がいいかもしれない
                    // if(targetMaterial.uniforms[UniformNames.ShadowMap]) {
                    //     targetMaterial.uniforms[UniformNames.ShadowMap].value = light.shadowMap.read.texture;
                    // }
                    // if(targetMaterial.uniforms[UniformNames.ShadowMapProjectionMatrix]) {
                    //     targetMaterial.uniforms[UniformNames.ShadowMapProjectionMatrix].value = textureProjectionMatrix;
                    // }
                    targetMaterial.updateUniform(UniformNames.ShadowMap, light.shadowMap.read.depthTexture);
                    targetMaterial.updateUniform(UniformNames.ShadowMapProjectionMatrix, textureProjectionMatrix);
                }
            });

            this.renderMesh(actor.geometry, targetMaterial);
        });
    }
    
    render(scene, camera, { useShadowPass = true, clearScene = true }) {
        const renderMeshInfoEachQueue = {
            opaque: [],
            skybox: [], // maybe only one
            alphaTest: [],
            transparent: [],
        };
        const lightActors = [];

        scene.traverse((actor) => {
            switch (actor.type) {
                case ActorTypes.Skybox:
                    renderMeshInfoEachQueue.skybox.push(this.#buildRenderMeshInfo(actor));
                    // TODO: skyboxの中で処理したい
                    // actor.transform.parent = camera.transform;
                    return;
                case ActorTypes.Mesh:
                case ActorTypes.SkinnedMesh:
                    actor.materials.forEach((material, i) => {
                        if(!!material.alphaTest) {
                            renderMeshInfoEachQueue.alphaTest.push(this.#buildRenderMeshInfo(actor, i));
                            return;
                        }
                        switch (material.blendType) {
                            case BlendTypes.Opaque:
                                renderMeshInfoEachQueue.opaque.push(this.#buildRenderMeshInfo(actor, i));
                                return;
                            case BlendTypes.Transparent:
                            case BlendTypes.Additive:
                                renderMeshInfoEachQueue.transparent.push(this.#buildRenderMeshInfo(actor, i));
                                return;
                            default:
                                throw "[Renderer.render] invalid blend type";
                        }
                    });
                    break;

                case ActorTypes.Light:
                    lightActors.push(actor);
                    break;
            }
        });

        // TODO: depth sort 

        // sort by render queue
        const sortRenderQueueCompareFunc = (a, b) => a.actor.materials[a.materialIndex].renderQueue - b.actor.materials[b.materialIndex].renderQueue;
        // const sortedRenderMeshInfos = Object.keys(renderMeshInfoEachQueue).map(key => (renderMeshInfoEachQueue[key].sort(sortRenderQueueCompareFunc))).flat().filter(actor => actor.enabled);
        const sortedRenderMeshInfos = Object.keys(renderMeshInfoEachQueue).map(key => (renderMeshInfoEachQueue[key].sort(sortRenderQueueCompareFunc))).flat().filter(({ actor }) => actor.enabled);
        
        // ------------------------------------------------------------------------------
        // 1. shadow pass
        // ------------------------------------------------------------------------------
      
        const castShadowLightActors = lightActors.filter(lightActor => lightActor.castShadow && lightActor.enabled);
        
        if(castShadowLightActors.length > 0) {
            const castShadowRenderMeshInfos = sortedRenderMeshInfos.filter(({ actor }) => {
                if(actor.type === ActorTypes.Skybox) {
                    return false;
                }
                return actor.castShadow;
            });
            if(useShadowPass) {
                this.#shadowPass(castShadowLightActors, castShadowRenderMeshInfos);
            }
        }

        // ------------------------------------------------------------------------------
        // 2. scene pass
        // ------------------------------------------------------------------------------
      
        // postprocessはrendererから外した方がよさそう  
        // if (camera.enabledPostProcess) {
        //     this.setRenderTarget(camera.renderTarget ? camera.renderTarget.write : camera.postProcess.renderTarget.write);
        // } else {
        //     this.setRenderTarget(camera.renderTarget ? camera.renderTarget.write : null);
        // }
        this.setRenderTarget(camera.renderTarget ? camera.renderTarget.write : null);

        this.#scenePass(sortedRenderMeshInfos, camera, lightActors, clearScene);

        // if (camera.enabledPostProcess) {
        //     camera.postProcess.render({
        //         gpu: this.#gpu,
        //         renderer: this,
        //         camera
        //     });
        // }
    }

    renderMesh(geometry, material) {
        geometry.update();
        
        if(this.#stats) {
            this.#stats.addDrawVertexCount(geometry);
            this.#stats.incrementDrawCall();
        }

        // vertex
        this.#gpu.setVertexArrayObject(geometry.vertexArrayObject);
        // material
        this.#gpu.setShader(material.shader);
        // uniforms
        this.#gpu.setUniforms(material.uniforms);

        // setup depth write (depth mask)
        let depthWrite;
        if (material.depthWrite !== null) {
            depthWrite = material.depthWrite;
        } else {
            switch (material.blendType) {
                case BlendTypes.Opaque:
                    depthWrite = true;
                    break;
                case BlendTypes.Transparent:
                case BlendTypes.Additive:
                    depthWrite = false;
                    break;
                default:
                    throw "invalid depth write";
            }
        }

        // setup depth test
        const depthTest = material.depthTest;
       
        // draw
        this.#gpu.draw(
            geometry.drawCount,
            material.primitiveType,
            depthTest,
            depthWrite,
            material.blendType,
            material.faceSide,
            geometry.instanceCount
        );
    }
}
﻿


const createWhite1x1 = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1;
    canvas.height = 1;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1, 1);
    return canvas;
};

class GPU {
    gl;
    #shader;
    #vao;
    #uniforms;
    dummyTexture;

    constructor({gl}) {
        this.gl = gl;
        this.dummyTexture = new Texture({
            gpu: this,
            img: createWhite1x1(),
            wrapS: TextureWrapTypes.Repeat,
            wrapT: TextureWrapTypes.Repeat,
        });
    }

    setShader(shader) {
        this.#shader = shader;
    }

    setVertexArrayObject(vao) {
        this.#vao = vao;
    }

    setUniforms(uniforms) {
        this.#uniforms = uniforms;
    }

    setSize(x, y, width, height) {
        this.gl.viewport(x, y, width, height);
    }
    
    setFramebuffer(framebuffer) {
        const gl = this.gl;
        if(!framebuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.glObject);
        if(framebuffer.hasMultipleDrawBuffers) {
            gl.drawBuffers(framebuffer.drawBufferList);
        }
        
        // tmp
        // !!framebuffer
        //     ? gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.glObject)
        //     : gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    flush() {
        this.gl.flush();
    }

    clear(r, g, b, a) {
        const gl = this.gl;
        // TODO: mask設定は外側からやった方がよい気がする
        gl.depthMask(true);
        gl.colorMask(true, true, true, true);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.depthMask(true);
        // gl.colorMask(true, true, true, true);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    #getGLPrimitive(primitiveType) {
        const gl = this.gl;
        switch (primitiveType) {
            case PrimitiveTypes.Points:
                return gl.POINTS;
            case PrimitiveTypes.Lines:
                return gl.LINES;
            case PrimitiveTypes.Triangles:
                return gl.TRIANGLES;
            default:
                throw "invalid primitive type";
        }
    }
  
    // TODO:
    // - start offset と instanceCount は逆の方が良い
    // - なんなら object destructuring の方がよさそう
    draw(drawCount, primitiveType, depthTest, depthWrite, blendType, faceSide, instanceCount, startOffset = 0) {
        const glPrimitiveType = this.#getGLPrimitive(primitiveType);
        const gl = this.gl;
       
        // culling
        switch(faceSide) {
            case FaceSide.Front:
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
                gl.frontFace(gl.CCW);
                break;
            case FaceSide.Back:
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.FRONT);
                gl.frontFace(gl.CCW);
                break;
            case FaceSide.Double:
                gl.disable(gl.CULL_FACE);
                gl.frontFace(gl.CCW);
                break;
            default:
                throw "invalid face side";
        }

        // depth write
        gl.depthMask(depthWrite);
        // for debug
        // console.log(gl.getParameter(gl.DEPTH_WRITEMASK));

        // depth test
        if(depthTest) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL); // TODO: set by arg
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
     
        // TODO: renderer側でやるべき？
        // blend
        // gl.blendFunc(src, dest)
        // - src: current draw
        // - dest: drawn 
        switch(blendType) {
            case BlendTypes.Opaque:
                gl.disable(gl.BLEND);
                // pattern_2: for enabled blend
                // gl.enable(gl.BLEND);
                // gl.blendFunc(gl.ONE, gl.ZERO);
                break;
            case BlendTypes.Transparent:
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                break;
            case BlendTypes.Additive:
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
            default:
                throw "invalid blend type";
        }

        gl.useProgram(this.#shader.glObject);
        
        let activeTextureIndex = 0;
    
        const setUniformValue = (type, uniformName, value) => {
            const gl = this.gl;
            const location = gl.getUniformLocation(this.#shader.glObject, uniformName);
            // TODO:
            // - nullなとき,値がおかしいときはセットしない方がよいけど、あえてエラーを出したいかもしれない
            switch(type) {
                case UniformTypes.Int:
                    gl.uniform1i(location, value);
                    break;
                case UniformTypes.Float:
                    gl.uniform1f(location, value);
                    break;
                case UniformTypes.FloatArray:
                    gl.uniform1fv(location, value);
                    break;
                case UniformTypes.Vector2:
                    gl.uniform2fv(location, value.elements);
                    break;
                case UniformTypes.Vector2Array:
                    gl.uniform2fv(location, value.map(v => [...v.elements]).flat());
                    break;
                case UniformTypes.Vector3:
                    gl.uniform3fv(location, value.elements);
                    break;
                case UniformTypes.Matrix4:
                    // arg[1] ... use transpose.
                    gl.uniformMatrix4fv(location, false, value.elements);
                    break;
                case UniformTypes.Matrix4Array:
                    if(value) {
                        // arg[1] ... use transpose.
                        gl.uniformMatrix4fv(location, false, value.map(v => [...v.elements]).flat());
                    }
                    break;
                case UniformTypes.Color:
                    gl.uniform4fv(location, value.elements);
                    break;
                case UniformTypes.ColorArray:
                    if(value) {
                        // arg[1] ... use transpose.
                        gl.uniform4fv(location, value.map(v => [...v.elements]).flat());
                    }
                    break;
                case UniformTypes.Texture:
                    gl.activeTexture(gl.TEXTURE0 + activeTextureIndex);
                    gl.bindTexture(
                        gl.TEXTURE_2D,
                        value ? value.glObject : this.dummyTexture.glObject
                    );
                    gl.uniform1i(location, activeTextureIndex);
                    activeTextureIndex++;
                    break;
                case UniformTypes.CubeMap:
                    // TODO: valueのguardなくて大丈夫なはず
                    if(value) {
                        gl.activeTexture(gl.TEXTURE0 + activeTextureIndex);
                        gl.bindTexture(
                            gl.TEXTURE_CUBE_MAP,
                            value ? value.glObject : this.dummyTexture.glObject
                        );
                        gl.uniform1i(location, activeTextureIndex);
                        activeTextureIndex++;
                    }
                    break;
                default:
                    throw `invalid uniform - name: ${uniformName}, type: ${type}`;
            }
        };
 
        // uniforms
        Object.keys(this.#uniforms).forEach(uniformName => {
            const uniform = this.#uniforms[uniformName];
            if(uniform.type === UniformTypes.Struct) {
                Object.keys(uniform.value).forEach(key => {
                    setUniformValue(uniform.value[key].type, `${uniformName}.${key}`, uniform.value[key].value)
                });
            } else {
                setUniformValue(uniform.type, uniformName, uniform.value);
                // console.log(uniformName === "uDepthTexture");
                // console.log(uniform.type, uniformName, uniform.value);
            }
        });
        
        // set vertex
        gl.bindVertexArray(this.#vao.glObject);

        // if (this.#ibo) {
        if (this.#vao.hasIndices) {
            // draw by indices
            // drawCount ... use indices count
            if(instanceCount) {
                gl.drawElementsInstanced(glPrimitiveType, drawCount, gl.UNSIGNED_SHORT, startOffset, instanceCount)
            } else {
                gl.drawElements(glPrimitiveType, drawCount, gl.UNSIGNED_SHORT, startOffset);
            }
        } else {
            // draw by array
            // draw count ... use vertex num
            if(instanceCount) {
                gl.drawArraysInstanced(glPrimitiveType, startOffset, drawCount, instanceCount);
            } else {
                gl.drawArrays(glPrimitiveType, startOffset, drawCount);
            }
        }
       
        // unbind when end render
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}
﻿





// NOTE:
// renderer用
class GBufferRenderTargets extends AbstractRenderTarget {
    name;
    #framebuffer;
    // #depthRenderbuffer;
    width;
    height;
    #textures = [];
    #baseColorTexture;
    #normalTexture;
    #depthTexture;
    type;
    
    get textures() {
        return this.#textures;
    }

    get baseColorTexture() {
        return this.#baseColorTexture;
    }
    
    get normalTexture() {
        return this.#normalTexture;
    }

    get depthTexture() {
        return this.#depthTexture;
    }

    get framebuffer() {
        return this.#framebuffer;
    }

    get read() {
        return this;
    }
 
    get write() {
        return this;
    }

    constructor({
        gpu,
        name,
        // type = RenderTargetTypes.RGBA,
        width = 1,
        height = 1,
        // useDepthBuffer = false,
        // writeDepthTexture = false,
        // mipmap = false,
    }) {
        super();
        
        const minFilter = TextureFilterTypes.Linear;
        const magFilter = TextureFilterTypes.Linear;
        
        const gl = gpu.gl;

        this.name = name;
        // this.type = type;
        
        this.width = width;
        this.height = height;

        this.#framebuffer = new Framebuffer({gpu});
        this.#framebuffer.bind();

        // if (useDepthBuffer) {
        //     this.#depthRenderbuffer = new Renderbuffer({gpu, type: RenderbufferTypes.Depth, width, height});
        // }

        // depth as render buffer
        // if (this.#depthRenderbuffer) {
        //     gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.#depthRenderbuffer.glObject);
        // }

        // 1: base scene
        this.#baseColorTexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.RGBA,
            minFilter,
            magFilter
        });
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + 0,
            gl.TEXTURE_2D,
            this.#baseColorTexture.glObject,
            0
        );
        this.#textures.push(this.#baseColorTexture);
        this.framebuffer.registerDrawBuffer(gl.COLOR_ATTACHMENT0 + 0);

        // 2: normal
        this.#normalTexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.RGBA,
            minFilter,
            magFilter
        });
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + 1,
            gl.TEXTURE_2D,
            this.#normalTexture.glObject,
            0
        );
        this.framebuffer.registerDrawBuffer(gl.COLOR_ATTACHMENT0 + 1);

        this.#textures.push(this.#normalTexture);

        // 3: depth
        this.#depthTexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.Depth,
            // 一旦linear固定
            minFilter,
            magFilter
            // minFilter: TextureFilterTypes.Nearest,
            // magFilter: TextureFilterTypes.Nearest
        })
        // depth as texture
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.#depthTexture.glObject,
            0
        );                      
    
        // if(this.#depthTexture && this.#depthRenderbuffer) {
        //     throw "[RenderTarget.constructor] depth texture and depth render buffer are active.";
        // }
       
        // unbind
        gl.bindTexture(gl.TEXTURE_2D, null);
        // if (this.#depthRenderbuffer) {
        //     gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        // }
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.framebuffer.unbind();
        // Framebuffer.unbind();
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.#textures.forEach(texture => texture.setSize(this.width, this.height));
        if(this.#depthTexture) {
            this.#depthTexture.setSize(this.width, this.height);
        }
        // if (this.#depthRenderbuffer) {
        //     this.#depthRenderbuffer.setSize(width, height);
        // }
    }
}
﻿
class Scene {
    children = []; // transform hierarchy
    // mainCamera;
    
    add(actor) {
        this.children.push(actor.transform);
    }
    
    traverse(execFunc) {
        for(let i = 0; i < this.children.length; i++) {
            this.#recursiveTraverseActor(this.children[i].actor, execFunc);
        }
    }
    
    #recursiveTraverseActor(actor, execFunc) {
        execFunc(actor);
        if(actor.transform.hasChild) {
            for(let i = 0; i < actor.transform.children.length; i++) {
                this.#recursiveTraverseActor(actor.transform.children[i], execFunc)
            }
        }
    }
}
﻿
// ------------------------------------------------------
//
// # 3x3
// もしガウシアンブラーなら、
// 1/4, 2/4, 1/4 を縦横 => 3 + 3 => 6回 fetch
//
// --------------------------
// | 1 | 2 | 1 |
// | 2 | 4 | 2 | * (1 / 16)
// | 1 | 2 | 1 |
// --------------------------
//
// # 5x5
// もしガウシアンブラーなら、
// 1/16, 4/16, 6/16, 4/16, 1/16 を縦横 => 5 + 5 => 10回 fetch
//
// -------------------------------------
// | 1 | 4  | 6  | 4  | 1 |
// | 4 | 16 | 24 | 16 | 4 |
// | 6 | 24 | 36 | 24 | 6 | * (1/ 256)
// | 4 | 16 | 24 | 16 | 4 |
// | 1 | 4  | 6  | 4  | 1 |
// -------------------------------------
//
// ------------------------------------------------------

// ref: https://techblog.kayac.com/unity-light-weight-bloom-effect
function gaussCoefficient(sigma, x) {
    const sigma2 = sigma * sigma;
    return Math.exp(-(x * x) / (2. * sigma2));
}

function clamp(x, min, max) {
    return Math.min(max, Math.max(x, min));
}




class OrbitCameraController {
    #camera;
    dampingFactor = 0.01;
    minAzimuth;
    maxAzimuth;
    minAltitude = -45;
    maxAltitude = 45;
    azimuthSpeed = 100;
    altitudeSpeed = 100;
    #cameraAngle = { azimuth: 0, altitude: 0};
    #lookAtTarget = Vector3.zero;
    distance = 10;
    attenuation = 0.001;
    #targetX = 0;
    #targetY = 0;
    deltaAzimuthPower = 1;
    deltaAltitudePower = 1;
    
    #targetCameraPosition = Vector3.zero;
    #currentCameraPosition = Vector3.zero;
    
    set lookAtTarget(v) {
        this.#lookAtTarget = v;
    }
    
    constructor(camera) {
        this.#camera = camera;
    }
    
    start(defaultAzimuth = 0, defaultAltitude = 0) {
        this.#cameraAngle.azimuth = defaultAzimuth;
        this.#cameraAngle.altitude = defaultAltitude;
        this.#updateCameraPosition(true);
        // this.#targetCameraPosition = new Vector3(0, 0, this.distance);
        // this.#currentCameraPosition = this.#targetCameraPosition.clone();
    }
    
    setDelta(delta) {
        this.#targetX = delta.x * this.deltaAzimuthPower;
        this.#targetY = delta.y * this.deltaAltitudePower;
    }

    fixedUpdate() {
        this.#targetX = Math.sign(this.#targetX) * Math.max(0, Math.abs(this.#targetX) - this.attenuation);
        this.#targetY = Math.sign(this.#targetY) * Math.max(0, Math.abs(this.#targetY) - this.attenuation);
        
        this.#cameraAngle.azimuth += this.#targetX * this.azimuthSpeed;
        this.#cameraAngle.altitude += this.#targetY * this.altitudeSpeed;
        
        this.#updateCameraPosition();
    }

    #updateCameraPosition(isJump = false) {
        // TODO: limit azimuth
        this.#cameraAngle.azimuth = this.#cameraAngle.azimuth % 360;
        this.#cameraAngle.altitude = clamp(this.#cameraAngle.altitude, this.minAltitude, this.maxAltitude);

        const v1 = Vector3.rotateVectorX(new Vector3(0, 0, 1), this.#cameraAngle.altitude);
        const v2 = Vector3.rotateVectorY(v1, this.#cameraAngle.azimuth);
        this.#targetCameraPosition = Vector3.addVectors(
            this.#lookAtTarget,
            v2.scale(this.distance)
        );
        this.#currentCameraPosition = Vector3.lerpVectors(
            this.#currentCameraPosition,
            this.#targetCameraPosition,
            isJump ? 1 : this.dampingFactor
        );

        this.#camera.transform.position = this.#currentCameraPosition;
        this.#camera.transform.lookAt(this.#lookAtTarget);
    }
}
﻿


// example
// images: {
//     [CubeMapAxis.PositiveX]: "xxx.png",
//     [CubeMapAxis.NegativeX]: "xxx.png",
//     [CubeMapAxis.PositiveY]: "xxx.png",
//     [CubeMapAxis.NegativeY]: "xxx.png",
//     [CubeMapAxis.PositiveZ]: "xxx.png",
//     [CubeMapAxis.NegativeZ]: "xxx.png",
// };
 
async function loadCubeMap({ gpu, images }) {
    return await Promise.all(Object.keys(images).map(async(key) => {
            const img = await loadImg(images[key]);
            return { key, img };
        }))
        .then(result => {
            const data = {};
            result.forEach(({ key, img }) => data[key] = img);
            return new CubeMap({ gpu, images: data });
        });
}
﻿




class NodeBase {
    name;
    parent = null;
    children = [];
    
    constructor({ name }) {
        this.name = name;
    }

    get childCount() {
        return this.children.length;
    }

    get hasChild() {
        return this.childCount > 0;
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    // TODO: 引数でworldMatrixとdirty_flagを渡すべきな気がする
    updateMatrix() {
        throw "should implementation"
    }
}
﻿




class Bone extends NodeBase {
    offsetMatrix = Matrix4.identity; // 初期姿勢のボーンローカル座標
    #poseMatrix = Matrix4.identity; // 初期姿勢行列
    #boneOffsetMatrix = Matrix4.identity; // 初期姿勢行列の逆行列
    #jointMatrix = Matrix4.identity;
    index;
    
    position = Vector3.zero;
    rotation = Rotator.zero;
    scale = Vector3.one;
    
    get boneOffsetMatrix() {
        return this.#boneOffsetMatrix;
    }
    
    get poseMatrix() {
        return this.#poseMatrix;
    }
    
    get jointMatrix() {
        return this.#jointMatrix;
    }

    constructor({ index, ...options }) {
        super(options);
        this.index = index;
    }

    calcBoneOffsetMatrix(parentBone) {
        this.#poseMatrix = !!parentBone
            ? Matrix4.multiplyMatrices(parentBone.poseMatrix, this.offsetMatrix)
            : this.offsetMatrix;
        
        this.#boneOffsetMatrix = this.#poseMatrix.clone().invert();
        this.children.forEach(childBone => childBone.calcBoneOffsetMatrix(this));
    }
    
    calcJointMatrix(parentBone) {
        // 1: update offset matrix
        this.offsetMatrix = Matrix4.fromTRS(this.position, this.rotation, this.scale);
        
        // 2: update joint matrix
        this.#jointMatrix = !!parentBone
            ? Matrix4.multiplyMatrices(parentBone.jointMatrix, this.offsetMatrix)
            : this.offsetMatrix;
        
        // NOTE: 無理やりpose状態にする時はこれを使う
        // this.#jointMatrix = this.#boneOffsetMatrix.clone().invert();
        
        this.children.forEach(childBone => childBone.calcJointMatrix(this));
    }
    
    traverse(callback) {
        callback(this);
        this.children.forEach(child => {
            child.traverse(callback);
        })
    }
}
﻿


class AnimationClip {
    name;
    target;
    key;
    interpolation;
    type; // animation clip type
    #data;
    start;
    end;
    frames;
    frameCount;
    // elementSize; // TODO: typeを元に振り分けても良い気がする
    
    #currentTime;
    currentFrame;
    
    loop;
    isPlaying;

    speed = 1;
    
    // TODO: fpsをgltfから引っ張ってこれるかどうか
    fps = 30; // default
    
    onUpdateProxy;
    
    #keyframes = [];
    
    get keyframes() {
        return this.#keyframes;
    }
    
    get data() {
        return this.#data;
    }

    constructor({ name, start, end, frames, frameCount, keyframes }) {
        this.name = name;
        this.start = start;
        this.end = end;
        this.frameCount = frameCount;
        this.#keyframes = keyframes;
        
        // TODO: add keyframes した時も計算するようにした方が便利そう 
        this.frameCount = Math.max(...(keyframes.map(({ frameCount }) => frameCount)));
    }
    
    // addAnimationKeyframes(animationKeyframe) {
    //     this.#keyframes.push(animationKeyframe);
    // }
   
    // start at 0 frame
    play() {
        this.#currentTime = 0;
        this.isPlaying = true;
    }

    update(deltaTime) {
        if(!this.isPlaying) {
            return;
        }
        
        // spf ... [s / frame]
        const spf = 1 / this.fps;

        this.#currentTime += deltaTime * this.speed;
       
        // TODO: durationはendと常にイコールならendを参照する形でもよい
        const duration = spf * this.frameCount;
        
        if(this.#currentTime > duration) {
            if(!this.loop) {
                this.currentFrame = this.frameCount;
                this.#currentTime = duration; 
                return;
            }
            this.#currentTime %= duration;
        }

        this.currentFrame = Math.floor(this.#currentTime / spf);
        
        // 代理でupdateしたい場合 
        if(this.onUpdateProxy) {
            const keyframes = this.#keyframes.map(animationKeyframes => {
                // console.log(this.currentFrame, animationKeyframes.getFrameValue(this.currentFrame))
                return {
                    target: animationKeyframes.target,
                    key: animationKeyframes.key,
                    frameValue: animationKeyframes.getFrameValue(this.currentFrame)
                }
            });
            this.onUpdateProxy(keyframes);
        } else {
            this.#keyframes.forEach(animationKeyframes => {
                const frameValue = animationKeyframes.getFrameValue(this.currentFrame)
                switch (animationKeyframes.key) {
                    case "translation":
                        animationKeyframes.target.position = frameValue;
                        break;
                    case "rotation":
                        // TODO: rotationはquaternionなのでquaternionであるべき
                        const q = frameValue;
                        animationKeyframes.target.rotation = Rotator.fromQuaternion(q);
                        break;
                    case "scale":
                        animationKeyframes.target.scale = frameValue;
                        break;
                    default:
                        throw "invalid animation keyframes key";
                }
            });
        }
    }
    
    getAllKeyframesValue() {
        return (new Array(this.frameCount)).fill(0).map((_, i) => {
            const keyframes = this.#keyframes.map(animationKeyframes => {
                return {
                    target: animationKeyframes.target,
                    key: animationKeyframes.key,
                    frameValue: animationKeyframes.getFrameValue(i)
                }
            });
            return keyframes;
        });
    }
}


class Quaternion {
    elements;
    
    get x () {
        return this.elements[0];
    }
    
    get y() {
        return this.elements[1];
    }

    get z() {
        return this.elements[2];
    }

    get w() {
        return this.elements[3];
    }

    constructor(x, y, z, w) {
        this.set(x, y, z, w);
    }
    
    set(x, y, z, w) {
        this.elements = new Float32Array([x, y, z, w]);
        return this;
    }

    // ref:
    // - https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles#Quaternion_to_Euler_angles_conversion
    // - https://github.com/infusion/Quaternion.js/blob/master/quaternion.js
    toEulerRadian() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        const t = 2 * (w * y - z * x);

        return {
            // X-axis rotation
            x: (Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y))),
            // Y-axis rotation
            y: (t >= 1 ? Math.PI / 2 : (t <= -1 ? -Math.PI / 2 : Math.asin(t))),
            // Z-axis rotation
            z: (Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)))
        };
    }
    
    // degree
    toEulerDegree() {
        const rad = this.toEulerRadian();
        return {
            x: rad.x * 180 / Math.PI,
            y: rad.y * 180 / Math.PI,
            z: rad.z * 180 / Math.PI,
        };
    }
    
    static identity() {
        return new Quaternion(0, 0, 0, 1);
    }
}
﻿



class AnimationKeyframes {
    target;
    key;
    interpolation;
    #data;
    #elementSize;
    frameCount

    get data() {
        return this.#data;
    }

    constructor({ target, type, key, interpolation, data, start, end, frameCount }) {
        this.target = target;
        this.key = key;
        this.interpolation = interpolation;
        this.type = type;
        this.#data = data;
        this.start = start;
        this.end = end;
        this.frameCount = frameCount;

        switch(this.type) {
            case AnimationKeyframeTypes.Vector3:
                this.#elementSize = 3;
                break;
            case AnimationKeyframeTypes.Quaternion:
                this.#elementSize = 4;
                break;
            default:
                throw "[AnimationKeyframes.getFrameValue] invalid type";
        }       
    }

    getFrameValue(frame) {
        const arr = (new Array(this.#elementSize)).fill(0).map((e, i) => this.#data[frame * this.#elementSize + i]);

        switch(this.type) {
            case AnimationKeyframeTypes.Vector3:
                return new Vector3(...arr);
            case AnimationKeyframeTypes.Quaternion:
                return new Quaternion(...arr);
            default:
                throw "[AnimationKeyframes.getFrameValue] invalid type";
        }
    }
}














async function loadGLTF({
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


﻿
async function loadTexture(src) {
}


const shadowMapVertexVaryings = () => `
out vec4 vShadowMapProjectionUv;
`;

const shadowMapFragmentVaryings = () => `
in vec4 vShadowMapProjectionUv;
`;

const shadowMapVertex = () => `
    vShadowMapProjectionUv = uShadowMapProjectionMatrix * worldPosition;
`;

const shadowMapVertexUniforms = () => `
uniform mat4 ${UniformNames.ShadowMapProjectionMatrix};
`;

const shadowMapFragmentUniforms = () => `
uniform sampler2D ${UniformNames.ShadowMap};
uniform float ${UniformNames.ShadowBias};
`;

const shadowMapFragmentFunc = () => `
vec4 applyShadow(vec4 surfaceColor, sampler2D shadowMap, vec4 shadowMapUv, float shadowBias, vec4 shadowColor, float shadowBlendRate) {
    vec3 projectionUv = shadowMapUv.xyz / shadowMapUv.w;
    vec4 projectionShadowColor = texture(shadowMap, projectionUv.xy);
    float sceneDepth = projectionShadowColor.r;
    float depthFromLight = projectionUv.z;
    float shadowOccluded = clamp(step(0., depthFromLight - sceneDepth - shadowBias), 0., 1.);
    float shadowAreaRect =
        step(0., projectionUv.x) * (1. - step(1., projectionUv.x)) *
        step(0., projectionUv.y) * (1. - step(1., projectionUv.y)) *
        step(0., projectionUv.z) * (1. - step(1., projectionUv.z));
    float shadowRate = shadowOccluded * shadowAreaRect;
    
    vec4 resultColor = vec4(1.);
    resultColor.xyz = mix(
       surfaceColor.xyz,
       mix(surfaceColor.xyz, shadowColor.xyz, shadowBlendRate),
       shadowRate
    );
    resultColor.a = surfaceColor.a;

    return resultColor;
} 
`;

const alphaTestFragmentFunc = () => `
void checkAlphaTest(float value, float threshold) {
    if(value < threshold) {
        discard;
    }
}
`;

const alphaTestFragmentUniforms = () => `
uniform float uAlphaTestThreshold;
`;

const normalMapVertexVaryings = () => `
out vec3 vTangent;
out vec3 vBinormal;
`;

const normalMapFragmentVarying = () => `
in vec3 vTangent;
in vec3 vBinormal;
`;

const normalMapFragmentUniforms = () => `
uniform sampler2D uNormalMap;
uniform float uNormalStrength;
`;

const normalMapFragmentFunc = () => `
vec3 calcNormal(vec3 normal, vec3 tangent, vec3 binormal, sampler2D normalMap, vec2 uv) {
    vec3 n = normalize(normal);
    vec3 t = normalize(tangent);
    vec3 b = normalize(binormal);
    mat3 tbn = mat3(t, b, n);
    vec3 nt = texture(normalMap, uv).xyz;
    nt = nt * 2. - 1.;

    // 2: normal from normal map
    vec3 resultNormal = normalize(tbn * nt);
    // blend mesh normal ~ normal map
    // vec3 normal = mix(normal, normalize(tbn * nt));
    // vec3 normal = mix(normal, normalize(tbn * nt), 1.);

    return resultNormal;
}
`

const directionalLightFragmentUniforms = () => `
struct DirectionalLight {
    vec3 direction;
    float intensity;
    vec4 color;
};
uniform DirectionalLight uDirectionalLight;
`;

const phongSurfaceDirectionalLightFunc = () => `
vec4 calcDirectionalLight(Surface surface, DirectionalLight directionalLight, Camera camera) {
    vec3 N = normalize(surface.worldNormal);
    vec3 L = normalize(directionalLight.direction);
    
    // lambert
    float diffuseRate = clamp(dot(N, L), 0., 1.);
    // half lambert
    // float diffuseRate = clamp(dot(N, L), 0., 1.) * .5 + .5;
    // original lambert
    // float diffuseRate = clamp(dot(N, L), 0., 1.) * .9 + .1;
    
    vec3 diffuseColor = surface.diffuseColor.xyz * diffuseRate * uDirectionalLight.intensity * uDirectionalLight.color.xyz;

    vec3 P = surface.worldPosition;
    vec3 E = camera.worldPosition;
    vec3 PtoL = L; // for directional light
    vec3 PtoE = normalize(E - P);
    vec3 H = normalize(PtoL + PtoE);
    // TODO: surfaceに持たせる
    float specularPower = 32.;
    float specularRate = clamp(dot(H, N), 0., 1.);
    specularRate = pow(specularRate, specularPower) * surface.specularAmount;
    vec3 specularColor = specularRate * directionalLight.intensity * directionalLight.color.xyz;

    // TODO: 外から渡せるようにする
    // vec3 ambientColor = vec3(.12, .11, .1);
    vec3 ambientColor = vec3(.1);

    vec4 resultColor = vec4(
        diffuseColor + specularColor + ambientColor,
        surface.diffuseColor.a
    );
    
    return resultColor;
}
`;

const phongLightingFunc = () => `
vec4 calcPhongLighting() {
    // vec3 N = normalize(vNormal);
    vec3 N = normalize(worldNormal);
    // vec3 N = mix(vNormal, worldNormal * uNormalStrength, uNormalStrength);
    vec3 L = normalize(uDirectionalLight.direction);
    float diffuseRate = clamp(dot(N, L), 0., 1.);
    // vec3 diffuseColor = textureColor.xyz * diffuseRate * uDirectionalLight.intensity * uDirectionalLight.color.xyz;
    vec3 diffuseColor = diffuseMapColor.xyz * diffuseRate * uDirectionalLight.intensity * uDirectionalLight.color.xyz;

    vec3 P = vWorldPosition;
    vec3 E = uViewPosition;
    vec3 PtoL = L; // for directional light
    vec3 PtoE = normalize(E - P);
    vec3 H = normalize(PtoL + PtoE);
    float specularPower = 16.;
    float specularRate = clamp(dot(H, N), 0., 1.);
    specularRate = pow(specularRate, specularPower);
    vec3 specularColor = specularRate * uDirectionalLight.intensity * uDirectionalLight.color.xyz;

    vec3 ambientColor = vec3(.1);

    vec4 surfaceColor = vec4(diffuseColor + specularColor + ambientColor, 1.);
    
    return surfaceColor;
}
`;
﻿class Vector2 {
    elements;
    
    get x() {
        return this.elements[0];
    }

    get y() {
        return this.elements[1];
    }

    set x(value) {
        this.elements[0] = value;
    }

    set y(value) {
        this.elements[1] = value;
    }

    constructor(x, y) {
        this.set(x, y);
    }

    set(x, y) {
        this.elements = new Float32Array([x, y]);
        return this;
    }

    static get identity() {
        return new Vector2(0, 0);
    }

    static get one() {
        return new Vector2(1, 1);
    }

    static get zero() {
        return new Vector2(0, 0);
    }
    
    static subVectors(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }
    
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    
    div(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    log() {
        console.log(`--------------------
${this.x}, ${this.y}
--------------------`);       
    }
}
﻿class Color {
    elements; // each 0~1
    
    get r() {
        return this.elements[0];
    }
    
    get g() {
        return this.elements[1];
    }
    
    get b() {
        return this.elements[2];
    }
    
    get a() {
        return this.elements[3];
    }
    
    get r255() {
        return this.elements[0] * 255;
    }

    get g255() {
        return this.elements[1] * 255;
    }

    get b255() {
        return this.elements[2] * 255;
    }

    get a255() {
        return this.elements[3] * 255;
    }
    
    get rgbArray() {
        return [this.r, this.g, this.b];
    }
    
    set a(value) {
        this.elements[3] = value;
    }
    
    constructor(r, g, b, a = 1) {
        this.set(r, g, b, a);
    }
    
    set(r, g, b, a) {
        this.elements = new Float32Array([r, g, b, a]);
    }
    
    getRGB() {
        return {
            r: this.r255,
            g: this.g255,
            b: this.a255,
        }
    }
    
    getHexCoord(withHash = true) {
        const rgb = this.getRGB();
        const r = rgb.r.toString(16);
        const g = rgb.g.toString(16);
        const b = rgb.b.toString(16);
        const str = withHash ? `#${r}${g}${b}` : `${r}${g}${b}`;
        // for debug
        // console.log(rgb, str, this.r, this.g, this.b)
        return str;
    }
    
    static white() {
        return new Color(1, 1, 1, 1);
    }
    
    static black() {
        return new Color(0, 0, 0, 1);
    }
    
    static green() {
        return new Color(0, 0, 1, 1);
    }
    
    static fromRGB(r, g, b, a = 255) {
        return new Color(r / 255, g / 255, b / 255, a / 255);
    }
    
    // hex ... #rrggbb or rrggbb
    static fromHex(hex) {
        const coord = hex.slice(0, 1) === "#" ? hex.slice(1) : hex;
        const r = coord.slice(0, 2);
        const g = coord.slice(2, 4);
        const b = coord.slice(4, 6);
        return new Color(
            Number.parseInt(r, 16) / 255,
            Number.parseInt(g, 16) / 255,
            Number.parseInt(b, 16) / 255,
            1
        );
    }
}









class PhongMaterial extends Material {
    // // params
    // diffuseColor;
    // specularAmount;
    
    constructor({
        diffuseColor,
        diffuseMap,
        diffuseMapUvScale, // vec2
        diffuseMapUvOffset, // vec2
        specularAmount,
        normalMap,
        normalMapUvScale, // vec2
        normalMapUvOffset, // vec2,
        // TODO: 外部化
        vertexShaderModifier = {},
        uniforms = {},
        ...options
    }) {
        // this.specularAmount = 

        const baseUniforms = {
            uDiffuseColor: {
                type: UniformTypes.Color,
                value: diffuseColor || Color.white(),
            },
            uDiffuseMap: {
                type: UniformTypes.Texture,
                value: diffuseMap,
            },
            uDiffuseMapUvScale: {
                type: UniformTypes.Vector2,
                value: Vector2.one
            },
            uDiffuseMapUvOffset: {
                type: UniformTypes.Vector2,
                value: Vector2.one
            },
            uSpecularAmount: {
                type: UniformTypes.Float,
                value: specularAmount || 1,
            },
            uNormalMap: {
                type: UniformTypes.Texture,
                value: normalMap,
            },
            uNormalMapUvScale: {
                type: UniformTypes.Vector2,
                value: Vector2.one
            },
            uNormalMapUvOffset: {
                type: UniformTypes.Vector2,
                value: Vector2.one
            },
            uDirectionalLight: {
                type: UniformTypes.Struct,
                value: {}
            }
        };
       
        const mergedUniforms = {
            ...baseUniforms,
            ...(uniforms ?  uniforms : {})
        };

        const depthUniforms = {
            uDiffuseMap: {
                type: UniformTypes.Texture,
                value: diffuseMap,
            },
            uDiffuseMapUvScale: {
                type: UniformTypes.Vector2,
                value: Vector2.one
            },
            uDiffuseMapUvOffset: {
                type: UniformTypes.Vector2,
                value: Vector2.one
            },
        }

        // TODO: できるだけconstructorの直後に持っていきたい
        super({
            ...options,
            name: "PhongMaterial",
            // vertexShaderGenerator,
            // vertexShader,
            // fragmentShaderGenerator,
            // depthFragmentShaderGenerator,
            vertexShaderModifier,
            uniforms: mergedUniforms,
            depthUniforms,
            useNormalMap: !!normalMap
        });
    }
    
    start(options) {
        this.vertexShader = this.generateVertexShader({
            isSkinning: this.isSkinning,
            gpuSkinning: this.gpuSkinning,
            jointNum: this.isSkinning ? this.jointNum : null,
            receiveShadow: this.receiveShadow,
            useNormalMap: this.useNormalMap,
            isInstancing: this.isInstancing,
            useVertexColor: this.useVertexColor,
            // localPositionPostProcess: vertexShaderModifier.localPositionPostProcess || "",
            vertexShaderModifier: this.vertexShaderModifier,
            attributeDescriptors: options.attributeDescriptors
        });

        this.fragmentShader = this.generateFragmentShader({
            receiveShadow: this.receiveShadow,
            useNormalMap: this.useNormalMap,
            alphaTest: this.alphaTest,
            useVertexColor: this.useVertexColor
        });

        this.depthFragmentShader = this.generateDepthFragmentShader({
            alphaTest: this.alphaTest,
            useVertexColor: this.useVertexColor
        });
        
        super.start(options);
    }

    generateVertexShader({
        isSkinning,
        gpuSkinning,
        jointNum,
        receiveShadow,
        useNormalMap,
        isInstancing,
        useVertexColor,
        vertexShaderModifier,
        attributeDescriptors,
        insertUniforms,
    }) {
        const shader = `#version 300 es

#pragma attributes

// varyings
out vec2 vUv;
out vec3 vWorldPosition;
out vec3 vNormal;
${useNormalMap ? "#pragma varying_normal_map" : ""}
${receiveShadow ? "#pragma varying_receive_shadow" : "" }
${useVertexColor ? "#pragma varying_vertex_color" : ""}

// uniforms
#pragma uniform_transform_vertex
#pragma uniform_engine
${receiveShadow ? "#pragma uniform_receive_shadow" : "" }

${isSkinning ? "#pragma function_skinning" : ""}

${isSkinning ? `#pragma uniform_skinning ${jointNum}` : ""}
${insertUniforms || ""}

void main() {
    ${vertexShaderModifier.beginMain || ""}

    ${isSkinning
        ? `
    #pragma vertex_skinning gpu
`       : ""
    }

    vec4 localPosition = vec4(aPosition, 1.);
    ${isSkinning
        ? `
    localPosition = skinMatrix * localPosition;`
        : ""
    }
    ${vertexShaderModifier.localPositionPostProcess || ""}

    ${useNormalMap
            ? isSkinning
                ? `
    #pragma vertex_normal_map skinning
`
                : `
    #pragma vertex_normal_map
`
            : isSkinning
                ? `
    vNormal = mat3(uNormalMatrix) * mat3(skinMatrix) * aNormal;
`
                : `
    vNormal = mat3(uNormalMatrix) * aNormal;
`
        }

    // assign common varyings 
    vUv = aUv;

    vec4 worldPosition = uWorldMatrix * localPosition;
    ${vertexShaderModifier.worldPositionPostProcess || ""}
 
    vWorldPosition = worldPosition.xyz;

    ${receiveShadow ? "#pragma vertex_receive_shadow" : ""}

    vec4 viewPosition = uViewMatrix * worldPosition;
    ${vertexShaderModifier.viewPositionPostProcess || ""}
 
    ${vertexShaderModifier.outClipPositionPreProcess || ""}
 
    gl_Position = uProjectionMatrix * viewPosition;

    ${vertexShaderModifier.lastMain || ""} 
}`;

        return shader;
    }
    
    generateFragmentShader({ receiveShadow, useNormalMap, alphaTest, useVertexColor }) {
        return `#version 300 es

precision mediump float;

uniform vec4 uDiffuseColor;
uniform sampler2D uDiffuseMap; 
uniform vec2 uDiffuseMapUvScale;
uniform float uSpecularAmount;
${useNormalMap ? normalMapFragmentUniforms() : ""}
${receiveShadow ? shadowMapFragmentUniforms() : ""}
uniform vec3 uViewPosition;
${alphaTest ? alphaTestFragmentUniforms() : ""}

${directionalLightFragmentUniforms()}

struct Surface {
    vec3 worldNormal;
    vec3 worldPosition;
    vec4 diffuseColor;
    float specularAmount;
};

struct Camera {
    vec3 worldPosition;
};

in vec2 vUv;
in vec3 vNormal;
${receiveShadow ? shadowMapFragmentVaryings() : ""}
${normalMapFragmentVarying()}
in vec3 vWorldPosition;
// TODO: フラグで必要に応じて出し分け
${useVertexColor ? "in vec4 vVertexColor;" : ""}

// out vec4 outColor;
layout (location = 0) out vec4 outBaseColor;
layout (location = 1) out vec4 outNormalColor;

${phongSurfaceDirectionalLightFunc()}
${useNormalMap ? normalMapFragmentFunc() : ""}
${receiveShadow ? shadowMapFragmentFunc() : ""}
${alphaTest ? alphaTestFragmentFunc() : ""}

void main() {
    vec2 uv = vUv * uDiffuseMapUvScale;
   
    vec4 diffuseMapColor = texture(uDiffuseMap, uv);
    
    ${useNormalMap
        ? `
    vec3 worldNormal = calcNormal(vNormal, vTangent, vBinormal, uNormalMap, uv);
`
        : `
    vec3 worldNormal = normalize(vNormal);
`
    }

    Surface surface;
    surface.worldPosition = vWorldPosition;
    surface.worldNormal = worldNormal;
    ${useVertexColor
        ? `
    surface.diffuseColor = vVertexColor * uDiffuseColor * diffuseMapColor;
`
        : `
    surface.diffuseColor = uDiffuseColor * diffuseMapColor;
`
    }
    surface.specularAmount = uSpecularAmount;

    Camera camera;
    camera.worldPosition = uViewPosition;
    
    vec4 resultColor = vec4(0, 0, 0, 1);
    
    // directional light
    resultColor = calcDirectionalLight(surface, uDirectionalLight, camera);
   
    ${receiveShadow
        ? `
    // TODO: apply shadow の中に入れても良さそう
    if(dot(surface.worldNormal, uDirectionalLight.direction) > 0.) {
        resultColor = applyShadow(resultColor, uShadowMap, vShadowMapProjectionUv, uShadowBias, vec4(0., 0., 0., 1.), 0.5);
    }
`
        : ""
    }
    ${alphaTest
        ? `
    checkAlphaTest(resultColor.a, uAlphaTestThreshold);
`
        : ""
    }

    // correct
    outBaseColor = resultColor;
    outNormalColor = vec4(worldNormal * .5 + .5, 1.); 

    // this is dummy
    // outBaseColor = vec4(1., 0., 0., 1.);
    // outNormalColor = vec4(0., 1., 0., 1.); 
}
`;
    }

    generateDepthFragmentShader({ alphaTest, useVertexColor }) {
        return `#version 300 es

precision mediump float;

uniform vec4 uColor;
uniform sampler2D uDiffuseMap; 
uniform vec2 uDiffuseMapUvScale;
${alphaTest ? alphaTestFragmentUniforms() : ""}

in vec2 vUv;
${useVertexColor ? "in vec4 vVertexColor;" : ""}

out vec4 outColor;

${alphaTest ? alphaTestFragmentFunc() : ""}    

void main() {
    vec2 uv = vUv * uDiffuseMapUvScale;
   
    vec4 diffuseMapColor = texture(uDiffuseMap, uv);
   
    ${useVertexColor
        ? `
    vec4 diffuseColor = vVertexColor * uColor * diffuseMapColor;
`
        : `
    vec4 diffuseColor = uColor * diffuseMapColor;
`
    }

    float alpha = diffuseColor.a; // TODO: base color を渡して alpha をかける
    
    ${alphaTest
        ? `
    checkAlphaTest(alpha, uAlphaTestThreshold);
`
        : ""
    }

    outColor = vec4(1., 1., 1., 1.);
}
`;
    }
    
}
﻿






class AbstractPostProcessPass {
    name;
    enabled = true;
    
    get renderTarget() {
        throw "[AbstractPostProcessPass.renderTarget] should implementation";
    }

    constructor({ name = "" } = {}) {
        this.name = name;
    }
  
    setSize(width, height) {
        throw "[AbstractPostProcessPass.setSize()] should implementation";
    }

    setRenderTarget(renderer, camera, isLastPass) {
        throw "[AbstractPostProcessPass.setRenderTarget()] should implementation";
    }
    
    render({ gpu, camera, renderer, prevRenderTarget, isLastPass } = {}) {
        throw "[AbstractPostProcessPass.render()] should implementation";
    }
}
﻿







class PostProcessPass extends AbstractPostProcessPass {
    geometry;
    material;
    renderTarget;
    mesh;
    width;
    height;
    
    static get baseVertexShader() {
        return `#version 300 es

layout (location = 0) in vec3 ${AttributeNames.Position};
layout (location = 1) in vec2 ${AttributeNames.Uv};

out vec2 vUv;

void main() {
    vUv = aUv;
    gl_Position = vec4(aPosition, 1);
}
`;   
    }
    
    constructor({ gpu, vertexShader, fragmentShader, uniforms, name }) {
        super({ name });

        const baseVertexShader = PostProcessPass.baseVertexShader;
        vertexShader = vertexShader || baseVertexShader;

        // NOTE: geometryは親から渡して使いまわしてもよい
        this.geometry = new PlaneGeometry({ gpu });
        this.material = new Material({
            gpu,
            vertexShader,
            fragmentShader,
            uniforms: {
                ...uniforms, 
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                }
            },
            primitiveType: PrimitiveTypes.Triangles
        });
        
        // TODO: mesh生成しなくていい気がする
        this.mesh = new Mesh({
            geometry: this.geometry,
            material: this.material
        }); 
        
        this.renderTarget = new RenderTarget({ gpu, width: 1, height: 1 });
    }
  
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.renderTarget.setSize(width, height);
    }

    setRenderTarget(renderer, camera, isLastPass) {
        if(isLastPass) {
            renderer.setRenderTarget(camera.renderTarget);
        } else {
            renderer.setRenderTarget(this.renderTarget);
        }
    }

    // TODO: rename "prevRenderTarget"
    render({ gpu, camera, renderer, prevRenderTarget, isLastPass }) {
        this.setRenderTarget(renderer, camera, isLastPass);
 
        // TODO: ppごとに変えられるのが正しい
        // renderer.clear(
        //     camera.clearColor.x,
        //     camera.clearColor.y,
        //     camera.clearColor.z,
        //     camera.clearColor.w
        // );

        // ppの場合はいらない気がする
        this.mesh.updateTransform();
        
        // 渡してない場合はなにもしないことにする
        if(prevRenderTarget) {
            // this.material.uniforms[UniformNames.SceneTexture].value = prevRenderTarget.texture;
            this.material.updateUniform(UniformNames.SceneTexture, prevRenderTarget.texture);
        }

        if(!this.material.isCompiledShader) {
            this.material.start({ gpu })
        }

        renderer.renderMesh(this.geometry, this.material);
    }
}
﻿


class CopyPass extends PostProcessPass {
    constructor({ gpu }) {
        const fragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D uSceneTexture;

void main() {
    vec4 textureColor = texture(uSceneTexture, vUv);
    outColor = textureColor;
}
`;

        super({ gpu, fragmentShader });
        
    }
}
﻿

class FragmentPass extends PostProcessPass {
    constructor({ gpu, fragmentShader, uniforms, name }) {
        super({ gpu, fragmentShader, uniforms, name });
    }
}
﻿




// TODO: actorを継承してもいいかもしれない
class PostProcess {
    passes = [];
    // renderTarget;
    #camera;
    
    #selfEnabled = true;
    
    get enabled() {
        if(!this.#selfEnabled) {
            return false;
        }
        
        for(let i = 0; i < this.passes.length; i++) {
            if(this.passes[i].enabled) {
                return true;
            }
        }
        
        return false;
    }

    set enabled(value) {
        this.#selfEnabled = value;
    }

    constructor({ gpu }) {
        // // TODO: renderTargetがいらない時もあるので出し分けたい
        // this.renderTarget = new RenderTarget({
        //     gpu,
        //     name: "PostProcess RenderTarget",
        //     type: RenderTargetTypes.RGBA,
        //     writeDepthTexture: true, // TODO: 必要ないかもしれないので出し分けたい
        //     width: 1, height: 1,
        // });

        this.#camera = new OrthographicCamera(-1, 1, -1, 1, 0, 2);
        this.#camera.transform.setTranslation(new Vector3(0, 0, 1));
    }
 
    setSize(width, height) {
        this.#camera.setSize(width, height);
        // this.renderTarget.setSize(width, height);
        this.passes.forEach(pass => pass.setSize(width, height));
    }
   
    addPass(pass) {
        this.passes.push(pass);
    }

    render({ gpu, renderer, sceneRenderTarget }) {
        if(!sceneRenderTarget) {
            throw "[PostProcess.render] scene render target is empty."
        }
        
        this.#camera.updateTransform();
        // TODO: render target を外から渡したほうが分かりやすいかも
        let prevRenderTarget = sceneRenderTarget || this.renderTarget;

        const enabledPasses = this.passes.filter(pass => pass.enabled);
        enabledPasses.forEach((pass, i) => {
            const isLastPass = i === enabledPasses.length - 1;

            pass.render({
                gpu,
                renderer,
                camera: this.#camera,
                prevRenderTarget,
                isLastPass,
            });

            prevRenderTarget = pass.renderTarget;
        });
    }
}
﻿


// ref:
// https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/
// http://blog.simonrodriguez.fr/articles/2016/07/implementing_fxaa.html
// https://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
// http://iryoku.com/aacourse/downloads/09-FXAA-3.11-in-15-Slides.pdf

class FXAAPass extends PostProcessPass {
    get gpu() {
        return this._gpu;
    }
    constructor({ gpu }) {
        // # high quality
        const edgeStepsArray = [1., 1.5, 2., 2., 2., 2., 2., 2., 2., 4.];
        const edgeStepCount = 10;
        const edgeGuess = 8.;
        // # low quality
        // const edgeStepsArray = [1, 1.5, 2, 4];
        // const edgeStepCount = 4;
        // const edgeGuess = 12.;

        const fragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D ${UniformNames.SceneTexture};
uniform float uTargetWidth;
uniform float uTargetHeight;

uniform float uContrastThreshold;
uniform float uRelativeThreshold;
uniform float uSubpixelBlending;
       
struct EdgeData {
    bool isHorizontal;
    float pixelStep;
    float oppositeLuma;
    float gradient;
};

struct LuminanceData {
    float center;
    float top;
    float right;
    float bottom;
    float left;
    
    float topLeft;
    float topRight;
    float bottomLeft;
    float bottomRight;
    
    float highest;
    float lowest;
    float contrast;
};

// vec4 sampleTexture(sampler2D tex, ivec2 coord) {
//     return texelFetch(tex, coord, 0);
// }

// 1: use texel fetch function
// 
// vec4 sampleTexture(sampler2D tex, ivec2 coord) {
//     return texelFetch(tex, coord, 0);
// }
// 
// vec4 sampleTextureOffset(sampler2D tex, ivec2 coord, int offsetX, int offsetY) {
//     return sampleTexture(tex, coord + ivec2(offsetX, offsetY));
// }

// 2: use texture function

float rgbToLuma(vec3 rgb) {
    return dot(rgb, vec3(.299, .587, .114));
}

vec4 sampleTexture(sampler2D tex, vec2 coord) {
    return texture(tex, coord);
}

vec4 sampleTextureOffset(sampler2D tex, vec2 coord, float offsetX, float offsetY) {
    return sampleTexture(tex, coord + vec2(offsetX, offsetY));
}

LuminanceData sampleLuminanceNeighborhood(vec2 uv, vec2 texelSize) {
    LuminanceData l;

    // 隣接ピクセルの色を取得
    vec3 rgbTop = sampleTextureOffset(${UniformNames.SceneTexture}, uv, 0., texelSize.y).xyz;
    vec3 rgbRight = sampleTextureOffset(${UniformNames.SceneTexture}, uv, texelSize.x, 0.).xyz;
    vec3 rgbBottom = sampleTextureOffset(${UniformNames.SceneTexture}, uv, 0., -texelSize.y).xyz;
    vec3 rgbLeft = sampleTextureOffset(${UniformNames.SceneTexture}, uv, -texelSize.x, 0.).xyz;
    vec3 rgbCenter = sampleTextureOffset(${UniformNames.SceneTexture}, uv, 0., 0.).xyz;

    // 角のピクセルの色を取得
    vec3 rgbTopRight = sampleTextureOffset(${UniformNames.SceneTexture}, uv, texelSize.x, texelSize.y).xyz;
    vec3 rgbTopLeft = sampleTextureOffset(${UniformNames.SceneTexture}, uv, -texelSize.x, texelSize.y).xyz;
    vec3 rgbBottomRight = sampleTextureOffset(${UniformNames.SceneTexture}, uv, texelSize.x, -texelSize.y).xyz;
    vec3 rgbBottomLeft = sampleTextureOffset(${UniformNames.SceneTexture}, uv, -texelSize.x, -texelSize.y).xyz;

    // 隣接ピクセルの輝度を取得
    float lumaTop = rgbToLuma(rgbTop);
    float lumaLeft = rgbToLuma(rgbLeft);
    float lumaCenter = rgbToLuma(rgbCenter);
    float lumaRight = rgbToLuma(rgbRight);
    float lumaBottom = rgbToLuma(rgbBottom);

    // 角のピクセルの輝度を取得
    float lumaTopLeft = rgbToLuma(rgbTopLeft);
    float lumaTopRight = rgbToLuma(rgbTopRight);
    float lumaBottomLeft = rgbToLuma(rgbBottomLeft);
    float lumaBottomRight = rgbToLuma(rgbBottomRight);

    // 上下左右のピクセルからコントラストを計算
    float lumaHighest = max(lumaCenter, max(max(lumaTop, lumaLeft), max(lumaBottom, lumaRight)));
    float lumaLowest = min(lumaCenter, min(min(lumaTop, lumaLeft), min(lumaBottom, lumaRight)));
    float lumaContrast = lumaHighest - lumaLowest;
 
    l.top = lumaTop;
    l.left = lumaLeft;
    l.center = lumaCenter;
    l.right = lumaRight;
    l.bottom = lumaBottom;
    
    l.topLeft = lumaTopLeft;
    l.topRight = lumaTopRight;
    l.bottomLeft = lumaBottomLeft;
    l.bottomRight = lumaBottomRight;
    
    l.highest = lumaHighest;
    l.lowest = lumaLowest;
    l.contrast = lumaContrast;
    
    return l;
}

bool shouldSkipPixel(LuminanceData l) {
    return l.contrast < max(uContrastThreshold, l.highest * uRelativeThreshold);
}

float determinePixelBlendFactor(LuminanceData l) {
    // sub-pixel blend 用のカーネル
    // | 1 | 2 | 1 | 
    // | 2 | 0 | 2 |
    // | 1 | 2 | 1 |
 
    float determineEdgeFilter = 2. * (l.top + l.right + l.bottom + l.left);
    determineEdgeFilter += l.topLeft + l.topRight + l.bottomLeft + l.bottomRight;
    
    // to low-pass filter
    determineEdgeFilter *= 1. / 12.; 
    
    // to high-pass filter
    determineEdgeFilter = abs(determineEdgeFilter - l.center); 
    
    // to normalized filter
    determineEdgeFilter = clamp(determineEdgeFilter / l.contrast, 0., 1.); 
    
    // linear to smoothstep
    float pixelBlendFactor = smoothstep(0., 1., determineEdgeFilter); 
    
    // smoothstep to squared smoothstep
    pixelBlendFactor = pixelBlendFactor * pixelBlendFactor;
    
    // sub-pixel の blend 率をかける
    pixelBlendFactor *= uSubpixelBlending; 
    
    return pixelBlendFactor;
}

EdgeData determineEdge(LuminanceData l, vec2 texelSize) {
    EdgeData e;
    
    // # エッジの方向検出
   
    // ----------------------------------------------------------------------- 
    // ## 縦の勾配を計算
    // A, B, C を足す
    // Aはピクセルの上下なので重みを2倍に
    //
    // A:
    // | 0 |  2 | 0 |
    // | 0 | -4 | 0 |
    // | 0 |  2 | 0 |
    //
    // B:
    // | 1  | 0 | 0 |
    // | -2 | 0 | 0 |
    // | 1  | 0 | 0 |
    //
    // C:
    // | 0 | 0 | 1  |
    // | 0 | 0 | -2 |
    // | 0 | 0 | 1  |
    // ----------------------------------------------------------------------- 
    
    float horizontal =
        abs(l.top + l.bottom - 2. * l.center) * 2. +
        abs(l.topRight + l.bottomRight - 2. * l.right) + 
        abs(l.topLeft + l.bottomLeft - 2. * l.left);
        
    // ----------------------------------------------------------------------- 
    // ## 横の勾配を計算
    // A, B, C を足す
    // Aはピクセルの左右なので重みを2倍に
    //
    // A:
    // | 0 |  0 | 0 |
    // | 2 | -4 | 2 |
    // | 0 |  0 | 0 |
    //
    // B:
    // | 1 | -2 | 1 |
    // | 0 | 0  | 0 |
    // | 0 | 0  | 0 |
    //
    // C:
    // | 0 | 0  | 0 |
    // | 0 | 0  | 0 |
    // | 1 | -2 | 1 |
    // ----------------------------------------------------------------------- 
        
    float vertical = 
        abs(l.right + l.left - 2. * l.center) * 2. +
        abs(l.topRight + l.topLeft - 2. * l.top) +
        abs(l.bottomRight + l.bottomLeft - 2. * l.bottom);
       
    // 縦の勾配と横の勾配を比較して水平線と垂直線のどちらになっているかを決める
    // 勾配が大きい方がより強い境界になっているみなす 
        
    e.isHorizontal = horizontal >= vertical;
    
    // 境界の方向が決まったら + - 方向を決める 
    // 水平線 ... 上が+,下が-
    // 垂直線 ... 右が+,左が-
    
    float positiveLuma = e.isHorizontal ? l.top : l.right;
    float negativeLuma = e.isHorizontal ? l.bottom : l.left;
    
    // +方向と-方向それぞれと自身のピクセルの輝度差を計算

    float positiveGradient = abs(positiveLuma - l.center);
    float negativeGradient = abs(negativeLuma - l.center);
    
    // 境界の方向に応じて、隣接ピクセルへのuv差分値を決める
  
    e.pixelStep = e.isHorizontal ? texelSize.y : texelSize.x;

    // 隣接ピクセルの輝度差が大きい方の情報を取得

    if(positiveGradient < negativeGradient) {
        // -方向の方が輝度差が大きい場合
        e.pixelStep = -e.pixelStep;
        e.oppositeLuma = negativeLuma;
        e.gradient = negativeGradient;
    } else {
        // +方向の方が輝度差が大きい場合
        e.oppositeLuma = positiveLuma;
        e.gradient = positiveGradient;
    }
    
    return e;
}

float determineEdgeBlendFactor(LuminanceData l, EdgeData e, vec2 uv, vec2 texelSize) {
    vec2 uvEdge = uv; // copy
    vec2 edgeStep = vec2(0.);

    // uvを半ピクセル分オフセット
    // 境界に沿った位置で計算していくため
    if(e.isHorizontal) {
        uvEdge.y += e.pixelStep * .5; // offset half pixel
        edgeStep = vec2(texelSize.x, 0.);
    } else {
        uvEdge.x += e.pixelStep * .5; // offset half pixel
        edgeStep = vec2(0., texelSize.y);
    }

    float edgeLuma = (l.center + e.oppositeLuma) * .5;
    float gradientThreshold = e.gradient * .25;
    
    // +方向に一定回数edgeStepずらしながら輝度差,uv値を計算
    // 閾値（gradientThreshold）以下になったら端点とみなして打ち切り

    vec2 puv = uvEdge + edgeStep * vec2(${edgeStepsArray[0]});
    float pLumaDelta = rgbToLuma(sampleTexture(${UniformNames.SceneTexture}, puv).xyz) - edgeLuma;
    bool pAtEnd = abs(pLumaDelta) >= gradientThreshold;

    // for(int i = 0; i < ${edgeStepCount} && !pAtEnd; i++) {
${(new Array(edgeStepCount - 1).fill(0).map((_, i) => {
    return `
    if(!pAtEnd) {
        puv += edgeStep * vec2(${edgeStepsArray[i + 1]});
        pLumaDelta = rgbToLuma(sampleTexture(${UniformNames.SceneTexture}, puv).xyz) - edgeLuma;
        pAtEnd = abs(pLumaDelta) >= gradientThreshold;   
    }
`;
})).join("\n")}
    // }
    if(!pAtEnd) {
        puv += edgeStep * vec2(${edgeGuess});
    }
    
    // -方向に一定回数edgeStepずらしながら輝度差,uv値を計算
    // 閾値（gradientThreshold）以下になったら端点とみなして打ち切り
   
    vec2 nuv = uvEdge - edgeStep * vec2(${edgeStepsArray[0]});
    float nLumaDelta = rgbToLuma(sampleTexture(${UniformNames.SceneTexture}, nuv).xyz) - edgeLuma;
    bool nAtEnd = abs(nLumaDelta) >= gradientThreshold;

    // for(int i = 0; i < ${edgeStepCount} && !nAtEnd; i++) {
${(new Array(edgeStepCount - 1).fill(0).map((_, i) => {
    return `   
    if(!nAtEnd) {
        nuv -= edgeStep * vec2(${edgeStepsArray[i + 1]});
        nLumaDelta = rgbToLuma(sampleTexture(${UniformNames.SceneTexture}, nuv).xyz) - edgeLuma;
        nAtEnd = abs(nLumaDelta) >= gradientThreshold;
    }
`;
        })).join("\n")}
    // }
    if(!nAtEnd) {
        nuv -= edgeStep * vec2(${edgeGuess});
    }
    
    // 探索を打ち切った地点のuv値と自身のピクセルを元に+方向と-方向の距離を計算
    // 距離なのでabsしてもよいはず
   
    float pDistance, nDistance;
    if(e.isHorizontal) {
        pDistance = puv.x - uv.x;
        nDistance = uv.x - nuv.x;
    } else {
        pDistance = puv.y - uv.y;
        nDistance = uv.y - nuv.y;
    }
    
    // 探索を打ち切った地点までの距離の小さい方を元に輝度差の符号を確認
    
    float shortestDistance;
    bool deltaSign;
    if(pDistance <= nDistance) {
        shortestDistance = pDistance;
        deltaSign = pLumaDelta >= 0.;
    } else {
        shortestDistance = nDistance;
        deltaSign = nLumaDelta >= 0.;
    }
   
    float edgeBlendFactor;
    
    if(deltaSign == (l.center - edgeLuma >= 0.)) {
        // エッジから遠ざかっている場合ブレンド係数を0にしてスキップすることで、エッジの片側にあるピクセルだけをブレンド
        edgeBlendFactor = 0.;
    } else {
        // エッジまでの距離に応じてblend率を変える（近いほど高く、遠いほど低く）
        edgeBlendFactor = .5 - shortestDistance / (pDistance + nDistance);
    }
    
    return edgeBlendFactor;
}

void main() {
    vec2 uv = vUv;
    
    vec2 texelSize = vec2(1. / uTargetWidth, 1. / uTargetHeight);
    
    LuminanceData l = sampleLuminanceNeighborhood(uv, texelSize);   

    if(shouldSkipPixel(l)) {
        outColor = sampleTexture(${UniformNames.SceneTexture}, uv);
        return;
    }
    
    EdgeData e = determineEdge(l, texelSize);
    float pixelBlend = determinePixelBlendFactor(l); 
    float edgeBlend = determineEdgeBlendFactor(l, e, uv, texelSize);
    
    float finalBlend = max(pixelBlend, edgeBlend);
    
    if(e.isHorizontal) {
        uv.y += e.pixelStep * finalBlend;
    } else {
        uv.x += e.pixelStep * finalBlend;
    }

    outColor = sampleTexture(${UniformNames.SceneTexture}, uv);
    // outColor = sampleTexture(${UniformNames.SceneTexture}, vUv);
}
`;

        super({
            gpu,
            fragmentShader,
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                // 1/32 = 0.03125 ... visible limit
                // 1/16 = 0.0625 ... high quality
                // 1/12 = 0.0833 ... upper limit
                uContrastThreshold: {
                    type: UniformTypes.Float,
                    value: 0.0625,
                },
                // 1/3 = 0.333 ... too little
                // 1/4 = 0.25 ... low quality
                // 1/8 = 0.125 ... high quality
                // 1/16 = 0.0625 ... overkill
                uRelativeThreshold: {
                    type: UniformTypes.Float,
                    value: 0.125,
                },
                uSubpixelBlending: {
                    type: UniformTypes.Float,
                    value: 0.75
                }
            }
        });
        this._gpu = gpu;
    }
    
    setSize(width, height) {
        super.setSize(width, height);
        // this.material.uniforms.uTargetWidth.value = width;
        // this.material.uniforms.uTargetHeight.value = height;
        this.material.updateUniform("uTargetWidth", width);
        this.material.updateUniform("uTargetHeight", height);
    }
    
}

// TODO: gaussの重みはuniformで送るべき
const gaussianBlurFragmentShader = ({ pixelNum, isHorizontal, srcTextureUniformName }) => `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D ${srcTextureUniformName};
uniform float uTargetWidth;
uniform float uTargetHeight;
uniform float[${pixelNum}] uBlurWeights;

void main() {
    vec4 textureColor = texture(${srcTextureUniformName}, vUv);
    vec4 sampleColor = vec4(0.);
    vec2 texelSize = vec2(1. / uTargetWidth, 1. / uTargetHeight);

    const int pixelNum = ${pixelNum};
    float width = floor(float(pixelNum) / 2.);
    for(int i = 0; i < pixelNum; i++) {
        float index = float(i) - width;
        float weight = uBlurWeights[i];
        sampleColor += texture(${srcTextureUniformName}, vUv + vec2(${isHorizontal ? "index" : "0."}, ${isHorizontal ? "0." : "index"}) * texelSize) * weight;
    }
    
    outColor = sampleColor;
    
    // for debug
    // outColor = textureColor;
}`;
﻿


// pixelNumは奇数であるべき
function getGaussianBlurWeights(pixelNum, sigma) {
    const halfWidth = Math.floor(pixelNum / 2);

    let sum = 0;
    const rawWeights = new Array(pixelNum).fill(0).map((_, i) => {
        const index = i - halfWidth;
        const weight = gaussCoefficient(sigma, index);
        sum += weight;
        return weight;
    });

    return rawWeights.map(w => w / sum);
}
﻿






class GaussianBlurPass extends AbstractPostProcessPass {
    #passes = [];

    get renderTarget() {
        return this.#passes[this.#passes.length - 1].renderTarget;
    }

    constructor({ gpu, blurPixelNum = 7 }) {
        super();
        
        const blurWeights = getGaussianBlurWeights(blurPixelNum, Math.floor(blurPixelNum / 2));
        
        const horizontalBlurPass = new FragmentPass({
            name: "horizontal blur pass",
            gpu,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: true, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uBlurWeights: {
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights)
                }
            }           
        });
        const verticalBlurPass = new FragmentPass({
            name: "vertical blur pass",
            gpu,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: false, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uBlurWeights: {
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights)
                }
            }           
        });
        
        this.#passes.push(horizontalBlurPass);
        this.#passes.push(verticalBlurPass);
    }

    setSize(width, height) {
        this.#passes.forEach(pass => {
            pass.setSize(width, height);
            // pass.material.uniforms.uTargetWidth.value = width;
            // pass.material.uniforms.uTargetHeight.value = height;
            this.material.updateUniform("uTargetWidth", width);
            this.material.updateUniform("uTargetHeight", height);
        });
    }

    render({ gpu, camera, renderer, prevRenderTarget, isLastPass }) {
        this.#passes.forEach((pass, i) => {
            pass.setRenderTarget(renderer, camera, isLastPass && i == this.#passes.length - 1);

            // TODO: pass内で好きに設定してよさそう
            renderer.clear(
                camera.clearColor.x,
                camera.clearColor.y,
                camera.clearColor.z,
                camera.clearColor.w
            );

            // TODO: mesh経由する必要たぶんない
            pass.mesh.updateTransform();
            // pass.material.uniforms[UniformNames.SceneTexture].value = i === 0 ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture;
            pass.material.updateUniform(UniformNames.SceneTexture, i === 0 ? prevRenderTarget.texture : this.#passes[i - 1].renderTarget.texture);
            if(!pass.material.isCompiledShader) {
                pass.material.start({ gpu })
            }

            renderer.renderMesh(pass.geometry, pass.material);
        });
    }   
}
﻿









// ref: https://techblog.kayac.com/unity-light-weight-bloom-effect
// TODO: mipmap使う方法に変えてみる
class BloomPass extends AbstractPostProcessPass {
    #extractBrightnessPass;

    #renderTargetExtractBrightness;
    #renderTargetBlurMip4_Horizontal;
    #renderTargetBlurMip4_Vertical;
    #renderTargetBlurMip8_Horizontal;
    #renderTargetBlurMip8_Vertical;
    #renderTargetBlurMip16_Horizontal;
    #renderTargetBlurMip16_Vertical;
    #renderTargetBlurMip32_Horizontal;
    #renderTargetBlurMip32_Vertical;
    
    #horizontalBlurPass;
    #verticalBlurPass;
    
    // #lastPass;
    #compositePass;
    
    #geometry;
    #horizontalBlurMaterial;
    #verticalBlurMaterial;
   
    threshold = 0.8;
    tone = 1;
    bloomAmount = 1;
   
    get renderTarget() {
        return this.#compositePass.renderTarget;
    }

    constructor({
        gpu,
        threshold = 0.8,
        tone = 1,
        bloomAmount = 1
    }) {
        super();
        
        this.threshold = threshold;
        this.tone = tone;
        this.bloomAmount = bloomAmount;
        
        // NOTE: geometryは親から渡して使いまわしてもよい
        this.#geometry = new PlaneGeometry({ gpu });

        this.#renderTargetExtractBrightness = new RenderTarget({ gpu });
        this.#renderTargetBlurMip4_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip4_Vertical = new RenderTarget({ gpu })
        this.#renderTargetBlurMip8_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip8_Vertical = new RenderTarget({ gpu })
        this.#renderTargetBlurMip16_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip16_Vertical = new RenderTarget({ gpu })
        this.#renderTargetBlurMip32_Horizontal = new RenderTarget({ gpu })
        this.#renderTargetBlurMip32_Vertical = new RenderTarget({ gpu })
        
        // const copyPass = new CopyPass({ gpu });
        // this.#passes.push(copyPass);
        
        this.#extractBrightnessPass = new FragmentPass({
            gpu,
            fragmentShader: `#version 300 es
            
precision mediump float;

out vec4 outColor;

in vec2 vUv;

uniform sampler2D ${UniformNames.SceneTexture};
uniform float uThreshold;

void main() {
    vec4 color = texture(${UniformNames.SceneTexture}, vUv);
    float k = uThreshold;
    
    // pattern_1
    // ex
    // k: 0.9, c: 1 => b = 1 
    // k: 0.8, c: 1 => b = 0.25
    vec4 b = (color - vec4(k)) / (1. - k);
    
    // pattern_2
    // vec4 b = color - k;
    
    outColor = clamp(b, 0., 1.);

    // for debug
    // outColor = b;
}
            `,
            uniforms: {
                uThreshold: {
                    type: UniformTypes.Float,
                    value: this.threshold
                },
            }
        });

        // 可変でもよい
        const blurPixelNum = 7;
        
        const blurWeights = getGaussianBlurWeights(blurPixelNum, Math.floor(blurPixelNum / 2));
        
        this.#horizontalBlurMaterial = new Material({
            vertexShader: PostProcessPass.baseVertexShader,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: true, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uBlurWeights: {
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights)
                },
            }           
        });
        this.#verticalBlurMaterial = new Material({
            vertexShader: PostProcessPass.baseVertexShader,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: false, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uBlurWeights: {
                    type: UniformTypes.FloatArray,
                    value: new Float32Array(blurWeights)
                },
            }           
        });
        
        this.#horizontalBlurPass = new FragmentPass({
            name: "horizontal blur pass",
            gpu,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: true, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                }
            }
        });
        this.#verticalBlurPass = new FragmentPass({
            name: "vertical blur pass",
            gpu,
            fragmentShader: gaussianBlurFragmentShader({
                isHorizontal: false, pixelNum: blurPixelNum, srcTextureUniformName: UniformNames.SceneTexture,
            }),
            uniforms: {
                uTargetWidth: {
                    type: UniformTypes.Float,
                    value: 1,
                },
                uTargetHeight: {
                    type: UniformTypes.Float,
                    value: 1,
                }
            }
        });

        // this.#lastPass = new CopyPass({ gpu });
        // this.#passes.push(this.#lastPass);
       
        this.#compositePass = new FragmentPass({
            gpu,
            fragmentShader: `#version 300 es
            
precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D ${UniformNames.SceneTexture};
uniform sampler2D uBlur4Texture;
uniform sampler2D uBlur8Texture;
uniform sampler2D uBlur16Texture;
uniform sampler2D uBlur32Texture;
uniform float uTone;
uniform float uBloomAmount;

void main() {
    vec4 blur4Color = texture(uBlur4Texture, vUv);
    vec4 blur8Color = texture(uBlur8Texture, vUv);
    vec4 blur16Color = texture(uBlur16Texture, vUv);
    vec4 blur32Color = texture(uBlur32Texture, vUv);
    vec4 sceneColor = texture(${UniformNames.SceneTexture}, vUv) * uTone;

    vec4 blurColor = (blur4Color + blur8Color + blur16Color + blur32Color) * uBloomAmount;

    outColor = sceneColor + blurColor;

    // for debug
    // outColor = blur4Color;
    // outColor = blur8Color;
    // outColor = blur16Color;
    // outColor = blur32Color;
    // outColor = blurColor;
    // outColor = sceneColor;
}           
            `,
            uniforms: {
                [UniformNames.SceneTexture]: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur4Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur8Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur16Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uBlur32Texture: {
                    type: UniformTypes.Texture,
                    value: null
                },
                uTone: {
                    type: UniformTypes.Float,
                    value: this.tone,
                },
                uBloomAmount: {
                    type: UniformTypes.Float,
                    value: this.bloomAmount
                }
            }
        }); 
    }
    
    #width = 1;
    #height = 1;

    setSize(width, height) {
        this.#width = width;
        this.#height = height;
        
        this.#extractBrightnessPass.setSize(width, height);

        this.#renderTargetBlurMip4_Horizontal.setSize(this.#width / 4, this.#height / 4);
        this.#renderTargetBlurMip4_Vertical.setSize(this.#width / 4, this.#height / 4);
        this.#renderTargetBlurMip8_Horizontal.setSize(this.#width / 8, this.#height / 8);
        this.#renderTargetBlurMip8_Vertical.setSize(this.#width / 8, this.#height / 8);
        this.#renderTargetBlurMip16_Horizontal.setSize(this.#width / 16, this.#height / 16);
        this.#renderTargetBlurMip16_Vertical.setSize(this.#width / 16, this.#height / 16);
        this.#renderTargetBlurMip32_Horizontal.setSize(this.#width / 32, this.#height / 32);
        this.#renderTargetBlurMip32_Vertical.setSize(this.#width / 32, this.#height / 32);
        
        this.#compositePass.setSize(width, height);
    }

    render({ gpu, camera, renderer, prevRenderTarget, isLastPass }) {
        // 一回だけ呼びたい
        this.#geometry.start();
        // ppの場合はいらない気がする
        // this.mesh.updateTransform();

        if(!this.#horizontalBlurMaterial.isCompiledShader) {
            this.#horizontalBlurMaterial.start({ gpu, attributeDescriptors: this.#geometry.getAttributeDescriptors() });
        }
        if(!this.#verticalBlurMaterial.isCompiledShader) {
            this.#verticalBlurMaterial.start({ gpu, attributeDescriptors: this.#geometry.getAttributeDescriptors() });
        }
        
        // this.#extractBrightnessPass.material.uniforms.uThreshold.value = this.threshold;
        this.#extractBrightnessPass.material.updateUniform("uThreshold", this.threshold);
        
        this.#extractBrightnessPass.render({ gpu, camera, renderer, prevRenderTarget });
        
        // for debug
        // this.#extractBrightnessPass.render({ gpu, camera, renderer, prevRenderTarget, isLastPass });
        // return;
        
        const renderBlur = (horizontalRenderTarget, verticalRenderTarget, downSize) => {
            const w = this.#width / downSize;
            const h = this.#height / downSize;
            
            renderer.setRenderTarget(horizontalRenderTarget);
            renderer.clear(0, 0, 0, 1)
            // this.#horizontalBlurMaterial.uniforms[UniformNames.SceneTexture].value = this.#extractBrightnessPass.renderTarget.texture;
            // this.#horizontalBlurMaterial.uniforms.uTargetWidth.value = w;
            // this.#horizontalBlurMaterial.uniforms.uTargetHeight.value = h;
            this.#horizontalBlurMaterial.updateUniform(UniformNames.SceneTexture, this.#extractBrightnessPass.renderTarget.texture);
            this.#horizontalBlurMaterial.updateUniform("uTargetWidth", w);
            this.#horizontalBlurMaterial.updateUniform("uTargetHeight", w);
            renderer.renderMesh(this.#geometry, this.#horizontalBlurMaterial);
            
            renderer.setRenderTarget(verticalRenderTarget);
            renderer.clear(0, 0, 0, 1)
            // this.#verticalBlurMaterial.uniforms[UniformNames.SceneTexture].value = horizontalRenderTarget.texture; 
            // this.#verticalBlurMaterial.uniforms.uTargetWidth.value = w;
            // this.#verticalBlurMaterial.uniforms.uTargetHeight.value = h;
            this.#verticalBlurMaterial.updateUniform(UniformNames.SceneTexture, horizontalRenderTarget.texture);
            this.#verticalBlurMaterial.updateUniform("uTargetWidth", w);
            this.#verticalBlurMaterial.updateUniform("uTargetHeight", h);
            renderer.renderMesh(this.#geometry, this.#verticalBlurMaterial);
        }
        
        // // for debug
        // renderBlur(this.#renderTargetBlurMip4_Horizontal, this.#renderTargetBlurMip4_Vertical, 4);
        // return;

        // 1 / 4
        renderBlur(this.#renderTargetBlurMip4_Horizontal, this.#renderTargetBlurMip4_Vertical, 4);
        // 1 / 8
        renderBlur(this.#renderTargetBlurMip8_Horizontal, this.#renderTargetBlurMip8_Vertical, 8);
        // 1 / 16
        renderBlur(this.#renderTargetBlurMip16_Horizontal, this.#renderTargetBlurMip16_Vertical, 16);
        // 1 / 32
        renderBlur(this.#renderTargetBlurMip32_Horizontal, this.#renderTargetBlurMip32_Vertical, 32);
        
        // this.#compositePass.material.uniforms[UniformNames.SceneTexture].value = prevRenderTarget.texture;
        // this.#compositePass.material.uniforms.uBlur4Texture.value = this.#renderTargetBlurMip4_Vertical.texture;
        // this.#compositePass.material.uniforms.uBlur8Texture.value = this.#renderTargetBlurMip8_Vertical.texture;
        // this.#compositePass.material.uniforms.uBlur16Texture.value = this.#renderTargetBlurMip16_Vertical.texture;
        // this.#compositePass.material.uniforms.uBlur32Texture.value = this.#renderTargetBlurMip32_Vertical.texture;
        // this.#compositePass.material.uniforms.uTone.value = this.tone;
        // this.#compositePass.material.uniforms.uBloomAmount.value = this.bloomAmount;
        this.#compositePass.material.updateUniform(UniformNames.SceneTexture, prevRenderTarget.texture);
        this.#compositePass.material.updateUniform("uBlur4Texture", this.#renderTargetBlurMip4_Vertical.texture);
        this.#compositePass.material.updateUniform("uBlur8Texture", this.#renderTargetBlurMip8_Vertical.texture);
        this.#compositePass.material.updateUniform("uBlur16Texture", this.#renderTargetBlurMip16_Vertical.texture);
        this.#compositePass.material.updateUniform("uBlur32Texture", this.#renderTargetBlurMip32_Vertical.texture);
        this.#compositePass.material.updateUniform("uTone", this.tone);
        this.#compositePass.material.updateUniform("uBloomAmount", this.bloomAmount);
       
        this.#compositePass.render({
            gpu,
            camera,
            renderer,
            prevRenderTarget: null,
            isLastPass
        });
    }
}
function fillFunc(arr, value) {
    // 非破壊
    const newArr = [...arr];
    for (let i = 0; i < arr.length; i++) {
        newArr[i] = value;
    }
    return newArr;

    // 破壊的 
    // for (let i = 0; i < arr.length; i++) {
    //     arr[i] = value;
    // }
    // return arr;
}

function matonWrapper(obj) {
    let tmp;

    tmp = obj;

    function fill(...args) {
        if (Array.isArray(args[0])) {
            return fillFunc(...args);
        }
        fillFunc(tmp, args[0]);
        return this;
    }

    const value = () => {
        return tmp;
    }

    return {
        value,
        fill
    };
}

// wrapper
const maton = (obj) => {
    return matonWrapper(obj);
}

maton.fill = fillFunc;

{
    maton
};


class AbstractInputController {
    #beforeInputPosition = Vector2.zero;
    #currentInputPosition = Vector2.zero;
    #deltaInputPosition = Vector2.zero;
    #deltaNormalizedInputPosition = Vector2.zero;
    
    #isPressed = false;
    #isDown = false;
    #isReleased = false;
    
    #width;
    #height;
    
    get isUp() {
        return !this.#isDown;
    }
    
    get isPressed() {
        return this.#isPressed;
    }

    get isDown() {
        return this.#isDown;
    }
    
    get isReleased() {
        return this.#isReleased;
    }
    
    get deltaNormalizedInputPosition() {
        return this.#deltaNormalizedInputPosition;
    }

    constructor() {
        this.clearInputPositions();
    }

    start() {
        throw "[AbstractInputController] should implementation 'start' method.";
    }
    
    setSize(width, height) {
        this.#width = width;
        this.#height = height;
    }

    // inputPosition ... v2
    // isDown ... bool
    updateInternal({ inputPosition, isDown }) {
        this.#updateState(isDown);
        this.#updateInputPositions(inputPosition);
    }
   
    #updateState(isDown) {
        const isBeforeDown = this.isDown;
        this.#isDown = isDown;

        // pressed
        if(!isBeforeDown && this.isDown) {
            this.#isPressed = true;
            this.#isReleased = false;
            return;
        }
        // down
        if(!isBeforeDown && this.isDown) {
            this.#isPressed = false;
            this.#isReleased = false;
            return;
        }
        // released
        if(isBeforeDown && !this.isDown) {
            this.#isPressed = false;
            this.#isReleased = true;
            return;
        }
        // up 
        this.#isPressed = false;
        this.#isReleased = false;
    }

    #updateInputPositions(inputPosition) {
        // up
        if(this.isUp) {
            this.clearInputPositions();
            return;
        }
        // pressed
        if(this.isPressed) {
            this.#currentInputPosition.copy(inputPosition);
            this.#beforeInputPosition.copy(this.#currentInputPosition);
            this.#deltaInputPosition.set(0, 0);
            this.#deltaNormalizedInputPosition.set(0, 0);
            return;
        }
        // move
        this.#beforeInputPosition.copy(this.#currentInputPosition);
        this.#currentInputPosition.copy(inputPosition);
        const diff = Vector2.subVectors(this.#currentInputPosition, this.#beforeInputPosition);
        this.#deltaInputPosition.copy(diff);
        this.#deltaNormalizedInputPosition.set(
            this.#deltaInputPosition.x / this.#width,
            this.#deltaInputPosition.y / this.#height
        );
    }
  
    clearInputPositions() {
        this.#beforeInputPosition.set(-Infinity, -Infinity);
        this.#currentInputPosition.set(-Infinity, -Infinity);
        this.#deltaInputPosition.set(-Infinity, -Infinity);
        this.#deltaNormalizedInputPosition.set(-Infinity, -Infinity);
    }

    dispose() {}
}



class TouchInputController extends AbstractInputController {
    #tmpIsDown = false;
    #tmpInputPosition = Vector2.zero;

    constructor() {
        super();
    }

    start() {
        window.addEventListener('touchstart', this.#onTouchStart.bind(this));
        window.addEventListener('touchmove', this.#onTouchMove.bind(this));
        window.addEventListener('touchend', this.#onTouchEnd.bind(this));
    }

    fixedUpdate() {
        this.updateInternal({
            inputPosition: this.#tmpInputPosition,
            isDown: this.#tmpIsDown
        });
    }

    #onTouchStart(e) {
        this.#tmpIsDown = true;
        const t = e.touches[0];
        this.setInputPosition(t.clientX, t.clientY);
    }

    #onTouchMove(e) {
        const t = e.touches[0];
        this.setInputPosition(t.clientX, t.clientY);
    }

    #onTouchEnd() {
        this.#tmpIsDown = false;
        this.setInputPosition(-Infinity, -Infinity);
    }

    setInputPosition(x, y) {
        this.#tmpInputPosition.set(x, y);
    }

    dispose() {
        window.removeEventListener('touchstart', this.#onTouchStart.bind(this));
        window.removeEventListener('touchmove', this.#onTouchMove.bind(this));
        window.removeEventListener('touchend', this.#onTouchEnd.bind(this));
    }
}



class MouseInputController extends AbstractInputController {
    #tmpIsDown = false;
    #tmpInputPosition = Vector2.zero;
    
    constructor() {
        super();
    }
    
    start() {
        window.addEventListener('mousedown', this.#onMouseDown.bind(this));
        window.addEventListener('mousemove', this.#onMouseMove.bind(this));
        window.addEventListener('mouseup', this.#onMouseUp.bind(this));
    }
    
    fixedUpdate() {
        this.updateInternal({
            inputPosition: this.#tmpInputPosition,
            isDown: this.#tmpIsDown
        });
    }

    #onMouseDown(e) {
        this.#tmpIsDown = true;
        this.setInputPosition(e.clientX, e.clientY);
    }

    #onMouseMove(e) {
        this.setInputPosition(e.clientX, e.clientY);
    }

    #onMouseUp() {
        this.#tmpIsDown = false;
        this.setInputPosition(-Infinity, -Infinity);
    }

    setInputPosition(x, y) {
        this.#tmpInputPosition.set(x, y);
    }

    dispose() {
        window.removeEventListener('mousedown', this.#onMouseDown.bind(this));
        window.removeEventListener('mousemove', this.#onMouseMove.bind(this));
        window.removeEventListener('mouseup', this.#onMouseUp.bind(this));
    }
}
﻿
// actors
export {Actor};
export {ArrowHelper};
export {AxesHelper};
export {DirectionalLight};
export {Light};
export {Mesh};
export {OrthographicCamera};
export {PerspectiveCamera};
export {SkinnedMesh};
export {Skybox};

// core
export {CubeMap};
export {DoubleBuffer};
export {Engine};
export {Renderer};
export {GPU};
export {RenderTarget};
export {GBufferRenderTargets};
export {Scene};
export {Texture};
export {OrbitCameraController};

// geometries
export {BoxGeometry};
export {Geometry};
export {PlaneGeometry};

// loaders
export {loadCubeMap};
export {loadGLTF};
export {loadImg};
export {loadObj};
export {loadTexture};

// materials
export {Material};
export {PhongMaterial};

// math
export {Color};
export {Matrix4};
export {Quaternion};
export {Rotator};
export {Vector2};
export {Vector3};
export {Vector4};

// postprocess
export {CopyPass};
export {FragmentPass};
export {PostProcess};
export {PostProcessPass};
export {FXAAPass};
export {GaussianBlurPass};
export {BloomPass};

// utilities
export {clamp};
export {maton};

// inputs
export {TouchInputController};
export {MouseInputController};

// others
export {
    PrimitiveTypes,
    UniformTypes,
    TextureTypes,
    TextureWrapTypes,
    TextureFilterTypes,
    BlendTypes,
    RenderQueues,
    RenderbufferTypes,
    ActorTypes,
    CubeMapAxis,
    FaceSide,
    AttributeUsageType,
    RenderTargetTypes,
    AnimationKeyframeTypes,
    AttributeNames
};